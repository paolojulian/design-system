import { P_TOKEN_VALUES } from '../../constants/tokens';

/** Viewports where PPopover renders as a PSheet. Content can read it to match. */
export const POPOVER_SHEET_QUERY = `(max-width: ${P_TOKEN_VALUES.breakpoint.sm})`;
