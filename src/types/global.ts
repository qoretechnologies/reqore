import { IReqoreCustomTheme, TReqoreIntent } from '../constants/theme';
import { IPopoverOptions } from '../hooks/usePopover';

export interface IReqoreComponent {
  _insidePopover?: boolean;
  _popoverId?: string;
}

export interface IReqoreReadOnly {
  /**
   * If true, the component will be read only
   * @default false
   * @type boolean
   * @memberof IReqoreReadOnly
   * @example
   * <ReqoreInput readOnly />
   * <ReqoreInput readOnly={true} />
   *
   */
  readOnly?: boolean;
}

export interface IReqoreDisabled {
  /**
   * If true, the component will be disabled
   * @default false
   * @type boolean
   * @memberof IReqoreDisabled
   * @example
   * <ReqoreInput disabled />
   * <ReqoreInput disabled={true} />
   *
   */
  disabled?: boolean;
}

export interface IReqoreIntent {
  /**
   * The intent of the component
   * @default none
   * @type TReqoreIntent
   * @memberof IReqoreIntent
   * @example
   * <ReqoreInput intent="info" />
   * <ReqoreInput intent="success" />
   * <ReqoreInput intent="pending" />
   * <ReqoreInput intent="warning" />
   * <ReqoreInput intent="danger" />
   * <ReqoreInput intent="muted" />
   */
  intent?: TReqoreIntent;
}

export interface IWithReqoreCustomTheme {
  /**
   * The custom theme of the component
   * @default none
   * @type IReqoreCustomTheme
   * @memberof IWithReqoreCustomTheme
   * @example
   * <ReqoreInput customTheme={{ main: '#ff0000' }} />
   * <ReqoreInput customTheme={{ main: '#ff0000', text: { color: '#0000ff' } }} />
   */
  customTheme?: IReqoreCustomTheme;
}

export interface IWithReqoreTooltip {
  /**
   * The tooltip of the component
   * @default none
   * @type string | IReqoreTooltip
   * @memberof IWithReqoreTooltip
   * @example
   * <ReqoreInput tooltip="This is a tooltip" />
   * <ReqoreInput tooltip={{ content: 'This is a tooltip' }} />
   * <ReqoreInput tooltip={{ content: 'This is a tooltip', position: 'top' }} />
   * <ReqoreInput tooltip={{ content: 'This is a tooltip', position: 'top', handle: 'focus', useTargetWidth: true, noArrow: true }} />
   */
  tooltip?: string | IReqoreTooltip;
}

export interface IReqoreTooltip extends IPopoverOptions {}
export type TReqoreTooltipProp = string | IReqoreTooltip;
