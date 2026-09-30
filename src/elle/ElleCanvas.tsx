import { type Decorator } from '@storybook/react';
import './ElleStories.css';

/**
 * Stories only. Storybook paints no page background, so the browser's default
 * canvas would show instead of Elle's grouped background. Pair with
 * `layout: 'fullscreen'`.
 */
export const withElleCanvas: Decorator = (Story) => (
  <div className="elle-canvas">
    <Story />
  </div>
);
