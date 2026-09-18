export type CatalogProp = {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
};

export type CatalogStory = {
  id: string;
  name: string;
  url: string;
  /** Source of the story export, so an agent can copy real usage. */
  source: string;
};

export type CatalogCssToken = {
  name: string;
  value: string;
};

export type CatalogComponent = {
  name: string;
  /** `function` covers hooks and imperative APIs such as `toast()`; `constant` covers exported objects. */
  kind: 'component' | 'function' | 'constant';
  /** Call signature for functions; key listing for constants. */
  signature?: string;
  /** Package subpath the component is imported from, e.g. `.` or `./gallery`. */
  entry: string;
  importStatement: string;
  description?: string;
  /** Storybook title, e.g. `Components/PButton`. */
  storybookTitle?: string;
  docsUrl?: string;
  props: CatalogProp[];
  /** Native attribute interfaces the props extend, e.g. `ButtonHTMLAttributes`. */
  inheritedAttributes: string[];
  /** Component-tier CSS custom properties declared in the component stylesheet. */
  cssTokens: CatalogCssToken[];
  stories: CatalogStory[];
  sourcePath: string;
};

export type TokenTier = 'base' | 'semantic' | 'component';

export type CatalogToken = {
  name: string;
  tier: TokenTier;
  group: string;
  light: string;
  dark: string;
  /** Values with every `var()` reference followed to a concrete value. */
  resolvedLight: string;
  resolvedDark: string;
  changesInDark: boolean;
};

export type CatalogGuide = {
  topic: string;
  title: string;
  source: string;
  content: string;
};

export type Catalog = {
  package: {
    name: string;
    version: string;
    storybookUrl: string;
  };
  components: CatalogComponent[];
  icons: string[];
  tokens: CatalogToken[];
  guides: CatalogGuide[];
};
