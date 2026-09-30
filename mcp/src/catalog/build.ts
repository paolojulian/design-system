/**
 * Build-time catalog generator. Reads the design system's source of truth
 * (component types, stylesheets, stories, theme.css, README) and writes
 * `dist/catalog.json`, which is the only data the MCP server serves.
 *
 * Nothing here is hand-maintained: a new component, prop, or token shows up in
 * the MCP on the next build. `typescript` is a devDependency for this reason
 * and this file is excluded from the published package.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { toDocsUrl, toStoryId, toStoryUrl, storyNameFromExport } from './stories.js';
import { parseCssTokens, parseThemeCss } from './tokens.js';
import type { Catalog, CatalogComponent, CatalogGuide, CatalogProp, CatalogStory } from './types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = path.resolve(HERE, '..', '..');
const REPO_ROOT = path.resolve(MCP_ROOT, '..');

const ENTRIES = [
  { subpath: '.', file: 'src/components/index.ts' },
  { subpath: './gallery', file: 'src/gallery/index.ts' },
  { subpath: './elle', file: 'src/elle/index.ts' },
];
const ICONS_ENTRY = 'src/icons/index.ts';
const GUIDE_SOURCES = { readme: 'README.md', designRules: '.claude/rules/swiss-design.md' };
// Contributor setup and how to connect this server are not design guidance.
const SKIPPED_README_SECTIONS = new Set(['development', 'mcp-server']);
const FALLBACK_STORYBOOK_URL = 'https://design-system.paolojulian.dev';

const MAX_TYPE_LENGTH = 320;
const MAX_STORY_SOURCE_LENGTH = 1600;

const fromRepo = (...segments: string[]) => path.join(REPO_ROOT, ...segments);
const read = (...segments: string[]) => readFileSync(fromRepo(...segments), 'utf8');
const isExternal = (fileName: string) => fileName.includes('/node_modules/');
const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

// ---------------------------------------------------------------------------
// TypeScript program
// ---------------------------------------------------------------------------

function createProgram(rootFiles: string[]): ts.Program {
  const configPath = fromRepo('tsconfig.app.json');
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  if (!parsed) throw new Error(`Could not parse ${configPath}`);
  return ts.createProgram({ rootNames: rootFiles, options: { ...parsed.options, noEmit: true } });
}

function getModuleExports(program: ts.Program, file: string): ts.Symbol[] {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file);
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error(`No module symbol for ${file}; is it an ES module with exports?`);
  return checker.getExportsOfModule(moduleSymbol);
}

const resolveAlias = (checker: ts.TypeChecker, symbol: ts.Symbol) =>
  symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

function isLiteralUnionMember(type: ts.Type): boolean {
  return Boolean(
    type.flags &
      (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Undefined),
  );
}

/** Expands `PButtonVariant` to `'primary' | 'secondary' | …`: an agent needs the values, not the alias. */
function printType(checker: ts.TypeChecker, type: ts.Type): string {
  const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;
  if (type.isUnion() && type.types.every(isLiteralUnionMember)) {
    const members = type.types
      .filter((member) => !(member.flags & ts.TypeFlags.Undefined))
      .map((member) => checker.typeToString(member, undefined, flags));
    // `true | false` is how the checker models `boolean`.
    const printed = [...new Set(members)];
    if (printed.includes('true') && printed.includes('false')) {
      return ['boolean', ...printed.filter((value) => value !== 'true' && value !== 'false')].join(' | ');
    }
    return printed.join(' | ');
  }
  return checker.typeToString(type, undefined, flags).replace(/ \| undefined$/, '');
}

type PropAccumulator = { types: Set<string>; requiredIn: number; seenIn: number; description?: string };

function collectProps(
  checker: ts.TypeChecker,
  propsType: ts.Type,
  location: ts.Node,
): { props: Omit<CatalogProp, 'defaultValue'>[]; inheritedAttributes: string[] } {
  const constituents = propsType.isUnion() ? propsType.types : [propsType];
  const accumulators = new Map<string, PropAccumulator>();
  const inherited = new Set<string>();

  for (const constituent of constituents) {
    for (const property of checker.getPropertiesOfType(checker.getApparentType(constituent))) {
      const declarations = property.getDeclarations() ?? [];
      const isLocal = declarations.some((declaration) => !isExternal(declaration.getSourceFile().fileName));
      if (!isLocal) {
        for (const declaration of declarations) {
          const owner = declaration.parent;
          if (ts.isInterfaceDeclaration(owner) && /.HTMLAttributes$/.test(owner.name.text)) {
            inherited.add(owner.name.text);
          }
        }
        continue;
      }

      const type = checker.getTypeOfSymbolAtLocation(property, location);
      // `href?: undefined` / `type?: never` only exist to discriminate a union.
      if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never)) continue;

      const accumulator = accumulators.get(property.name) ?? { types: new Set(), requiredIn: 0, seenIn: 0 };
      accumulator.types.add(printType(checker, type));
      accumulator.seenIn += 1;
      if (!(property.flags & ts.SymbolFlags.Optional)) accumulator.requiredIn += 1;
      accumulator.description ??=
        ts.displayPartsToString(property.getDocumentationComment(checker)).trim() || undefined;
      accumulators.set(property.name, accumulator);
    }
  }

  const props = [...accumulators].map(([name, accumulator]) => ({
    name,
    type: truncate([...accumulator.types].join(' | '), MAX_TYPE_LENGTH),
    // Required only when every variant of the props union demands it.
    required: accumulator.requiredIn === constituents.length,
    ...(accumulator.description ? { description: accumulator.description } : {}),
  }));
  return { props, inheritedAttributes: [...inherited].sort() };
}

/** Default values live in the destructured first parameter of the render function. */
function collectDefaults(declaration: ts.Node): Map<string, string> {
  const defaults = new Map<string, string>();
  let found = false;

  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isFunctionLike(node) && node.parameters[0] && ts.isObjectBindingPattern(node.parameters[0].name)) {
      found = true;
      for (const element of node.parameters[0].name.elements) {
        if (!element.initializer) continue;
        const key = element.propertyName ?? element.name;
        if (ts.isIdentifier(key)) defaults.set(key.text, element.initializer.getText());
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration);
  return defaults;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

type StoriesFile = {
  title?: string;
  description?: string;
  argDescriptions: Map<string, string>;
  stories: { exportName: string; source: string }[];
};

function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return current;
}

function getProperty(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  for (const property of object.properties) {
    if (ts.isPropertyAssignment(property) && property.name.getText().replace(/['"]/g, '') === name) {
      return unwrapExpression(property.initializer);
    }
  }
  return undefined;
}

function getPath(object: ts.ObjectLiteralExpression, ...keys: string[]): ts.Expression | undefined {
  let current: ts.Expression | undefined = object;
  for (const key of keys) {
    if (!current || !ts.isObjectLiteralExpression(current)) return undefined;
    current = getProperty(current, key);
  }
  return current;
}

const stringValue = (node: ts.Expression | undefined) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text.trim() : undefined;

function parseStoriesFile(filePath: string): StoriesFile {
  const sourceFile = ts.createSourceFile(filePath, readFileSync(filePath, 'utf8'), ts.ScriptTarget.ES2022, true);
  const result: StoriesFile = { argDescriptions: new Map(), stories: [] };

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);

      if (declaration.name.text === 'meta' && ts.isObjectLiteralExpression(initializer)) {
        result.title = stringValue(getProperty(initializer, 'title'));
        result.description = stringValue(getPath(initializer, 'parameters', 'docs', 'description', 'component'));
        const argTypes = getProperty(initializer, 'argTypes');
        if (argTypes && ts.isObjectLiteralExpression(argTypes)) {
          for (const property of argTypes.properties) {
            if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue;
            const description = stringValue(getProperty(property.initializer, 'description'));
            if (description) result.argDescriptions.set(property.name.getText().replace(/['"]/g, ''), description);
          }
        }
      } else if (isExported) {
        result.stories.push({
          exportName: declaration.name.text,
          source: truncate(statement.getText(sourceFile), MAX_STORY_SOURCE_LENGTH),
        });
      }
    }
  }
  return result;
}

/** `PRadioGroup` lives in `PRadio/` and shares its stories; prefer an exact match, else the directory's only file. */
function findStoriesFile(directory: string, componentName: string): string | undefined {
  const candidates = readdirSync(directory).filter((file) => /\.stories\.tsx?$/.test(file));
  const exact = candidates.find((file) => file.startsWith(`${componentName}.stories.`));
  const chosen = exact ?? (candidates.length === 1 ? candidates[0] : undefined);
  return chosen && path.join(directory, chosen);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function buildComponents(program: ts.Program, packageName: string, storybookUrl: string): CatalogComponent[] {
  const checker = program.getTypeChecker();
  const components = new Map<string, CatalogComponent>();

  for (const entry of ENTRIES) {
    const entryFile = fromRepo(entry.file);
    const exports = getModuleExports(program, entryFile);
    const exportsByName = new Map(exports.map((symbol) => [symbol.name, symbol]));
    const entrySource = program.getSourceFile(entryFile)!;

    for (const exported of exports) {
      const symbol = resolveAlias(checker, exported);
      if (!(symbol.flags & ts.SymbolFlags.Value) || components.has(exported.name)) continue;
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      if (!declaration) continue;

      const name = exported.name;
      const sourceFileName = declaration.getSourceFile().fileName;
      const directory = path.dirname(sourceFileName);
      const valueType = checker.getTypeOfSymbolAtLocation(symbol, entrySource);
      // Not every capitalised export renders: `PDatePickerPresets` is a plain object.
      const isCallable = valueType.getCallSignatures().length > 0;
      const kind = !isCallable ? 'constant' : /^[A-Z]/.test(name) ? 'component' : 'function';

      let props: CatalogProp[] = [];
      let inheritedAttributes: string[] = [];
      let signature: string | undefined;

      if (kind === 'component') {
        const propsSymbol = exportsByName.get(`${name}Props`);
        const propsType = propsSymbol
          ? checker.getDeclaredTypeOfSymbol(resolveAlias(checker, propsSymbol))
          : valueType.getCallSignatures()[0]?.getParameters()[0] &&
            checker.getTypeOfSymbolAtLocation(valueType.getCallSignatures()[0].getParameters()[0], entrySource);
        if (propsType) {
          const collected = collectProps(checker, propsType, entrySource);
          const defaults = collectDefaults(declaration);
          inheritedAttributes = collected.inheritedAttributes;
          props = collected.props.map((prop) => ({
            ...prop,
            ...(defaults.has(prop.name) ? { defaultValue: defaults.get(prop.name) } : {}),
          }));
        }
      } else if (kind === 'constant') {
        const keys = checker.getPropertiesOfType(valueType).map((property) => property.name);
        signature = truncate(`${name}: { ${keys.join(', ')} }`, MAX_TYPE_LENGTH);
      } else {
        const callSignature = valueType.getCallSignatures()[0];
        signature =
          callSignature &&
          truncate(
            `${name}${checker.signatureToString(callSignature, undefined, ts.TypeFormatFlags.NoTruncation)}`,
            MAX_TYPE_LENGTH,
          );
      }

      const storiesPath = findStoriesFile(directory, name);
      const storiesFile = storiesPath ? parseStoriesFile(storiesPath) : undefined;
      const title = storiesFile?.title;
      const stories: CatalogStory[] =
        title && storiesFile
          ? storiesFile.stories.map((story) => {
              const id = toStoryId(title, story.exportName);
              return {
                id,
                name: storyNameFromExport(story.exportName),
                url: toStoryUrl(storybookUrl, id),
                source: story.source,
              };
            })
          : [];

      // JSDoc is authoritative; Storybook argTypes fill the gaps for older components.
      props = props.map((prop) => ({
        ...prop,
        ...(prop.description ?? storiesFile?.argDescriptions.get(prop.name)
          ? { description: prop.description ?? storiesFile?.argDescriptions.get(prop.name) }
          : {}),
      }));

      const cssTokens = readdirSync(directory)
        .filter((file) => file.endsWith('.css'))
        .flatMap((file) => parseCssTokens(readFileSync(path.join(directory, file), 'utf8')));

      const description =
        ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim() || storiesFile?.description;

      components.set(name, {
        name,
        kind,
        ...(signature ? { signature } : {}),
        entry: entry.subpath,
        importStatement: `import { ${name} } from '${packageName}${entry.subpath === '.' ? '' : entry.subpath.slice(1)}';`,
        ...(description ? { description } : {}),
        ...(title ? { storybookTitle: title, docsUrl: toDocsUrl(storybookUrl, title) } : {}),
        props,
        inheritedAttributes,
        cssTokens,
        stories,
        sourcePath: path.relative(REPO_ROOT, sourceFileName),
      });
    }
  }

  return [...components.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const toTopic = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function buildGuides(): CatalogGuide[] {
  const guides: CatalogGuide[] = [];
  const readme = read(GUIDE_SOURCES.readme);

  // Split on level-2 headings only; fenced code can contain `## ` lines.
  let insideFence = false;
  let current: { title: string; lines: string[] } | undefined;
  const flush = () => {
    if (!current) return;
    const topic = toTopic(current.title);
    if (!SKIPPED_README_SECTIONS.has(topic)) {
      guides.push({
        topic,
        title: current.title,
        source: GUIDE_SOURCES.readme,
        content: current.lines.join('\n').trim(),
      });
    }
  };
  for (const line of readme.split('\n')) {
    if (line.trimStart().startsWith('```')) insideFence = !insideFence;
    const heading = !insideFence && /^## (.+)$/.exec(line);
    if (heading) {
      flush();
      current = { title: heading[1].trim(), lines: [] };
    } else {
      current?.lines.push(line);
    }
  }
  flush();

  if (existsSync(fromRepo(GUIDE_SOURCES.designRules))) {
    guides.push({
      topic: 'design-rules',
      title: 'Swiss design rules',
      source: GUIDE_SOURCES.designRules,
      content: read(GUIDE_SOURCES.designRules).trim(),
    });
  }
  return guides;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const packageJson = JSON.parse(read('package.json')) as { name: string; version: string };
  const storybookUrl = /Storybook:\s*\[?(https?:\/\/[^\s\])]+)/.exec(read('README.md'))?.[1] ?? FALLBACK_STORYBOOK_URL;

  const program = createProgram([...ENTRIES.map((entry) => fromRepo(entry.file)), fromRepo(ICONS_ENTRY)]);
  const checker = program.getTypeChecker();

  const catalog: Catalog = {
    package: { name: packageJson.name, version: packageJson.version, storybookUrl },
    components: buildComponents(program, packageJson.name, storybookUrl),
    icons: getModuleExports(program, fromRepo(ICONS_ENTRY))
      .filter((symbol) => resolveAlias(checker, symbol).flags & ts.SymbolFlags.Value)
      .map((symbol) => symbol.name)
      .sort(),
    tokens: parseThemeCss(read('src/theme.css')),
    guides: buildGuides(),
  };

  // An empty section means a source moved or a parser silently stopped matching.
  // Shipping that would make the server answer "no results" with full confidence.
  const empty = (['components', 'icons', 'tokens', 'guides'] as const).filter((key) => catalog[key].length === 0);
  if (empty.length > 0) throw new Error(`Catalog sections came out empty: ${empty.join(', ')}`);

  const outFile = path.join(MCP_ROOT, 'dist', 'catalog.json');
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(catalog));

  const withoutProps = catalog.components.filter((c) => c.kind === 'component' && c.props.length === 0);
  console.log(
    `catalog: ${catalog.components.length} exports, ${catalog.icons.length} icons, ${catalog.tokens.length} tokens, ` +
      `${catalog.guides.length} guides → ${path.relative(REPO_ROOT, outFile)}`,
  );
  if (withoutProps.length > 0) {
    console.warn(`catalog: no props resolved for ${withoutProps.map((c) => c.name).join(', ')}`);
  }
}

main();
