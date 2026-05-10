/// <reference types="vite/client" />
import '../src/fonts.css';
import '../src/index.css';
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    chromatic: {
      viewports: [390, 768, 1024, 1440],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
