import { type ReactNode } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  WarningTriangleIcon,
} from '../../icons';

/** Status roles shared by feedback surfaces (PAlert, PToast). */
export type FeedbackVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * Per-variant icon. The icon always accompanies color so state is never
 * communicated by hue alone. Shared so PAlert and PToast stay in lockstep.
 */
export const FEEDBACK_ICONS: Record<FeedbackVariant, ReactNode> = {
  info: <InfoCircleIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningTriangleIcon />,
  danger: <ExclamationCircleIcon />,
};

/** Default ARIA live role per variant: assertive for warning/danger. */
export const FEEDBACK_ROLE: Record<FeedbackVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};
