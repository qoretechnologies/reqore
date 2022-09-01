import { IPopoverOptions } from '../hooks/usePopover';

export interface IReqoreComponent {
  _insidePopover?: boolean;
  _popoverId?: string;
}

export interface IReqoreTooltip extends IPopoverOptions {}
export type TReqoreTooltipProp = string | IReqoreTooltip;
