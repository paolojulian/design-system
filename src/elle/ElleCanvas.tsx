import { type Decorator } from '@storybook/react';
import './ElleStories.css';

/**
 * Stories only. Storybook paints no page background, so the browser's default
 * canvas would show instead of Elle's grouped background. Pair with
 * `layout: 'fullscreen'`. `parameters.elleCanvas: 'page'` lays the story out
 * top-down at full width, as a screen, instead of centered.
 */
export const withElleCanvas: Decorator = (Story, { parameters }) => (
  <div className={parameters.elleCanvas === 'page' ? 'elle-canvas elle-canvas--page' : 'elle-canvas'}>
    <Story />
  </div>
);
