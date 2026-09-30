import { type Decorator } from '@storybook/react';
import './ElleStories.css';

/**
 * Stories only. Storybook paints no page background, so the browser's default
 * canvas would show instead of Elle's grouped background. Pair with
 * `layout: 'fullscreen'`. `parameters.elleCanvas`: `'page'` stacks the story
 * top-down at full width; `'screen'` drops the padding for edge-to-edge bars.
 */
export const withElleCanvas: Decorator = (Story, { parameters }) => (
  <div className={parameters.elleCanvas ? `elle-canvas elle-canvas--${parameters.elleCanvas}` : 'elle-canvas'}>
    <Story />
  </div>
);
