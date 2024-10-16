import { IReqoreEffect } from '../components/Effect';
import { IReqoreSpinnerProps } from '../components/Spinner';
import { TSizes } from '../constants/sizes';
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

export interface IWithReqoreSize {
  /**
   * The size of the component
   * @default normal
   * @type TSizes
   * @memberof IWithReqoreSize
   * @example
   * <ReqoreInput size="small" />
   * <ReqoreInput size="normal" />
   * <ReqoreInput size="big" />
   *
   */
  size?: TSizes;
}

export interface IWithReqoreOpaque {
  /**
   * If true, the component will be opaque
   * @default false
   * @type boolean
   * @memberof IWithReqoreOpaque
   * @example
   * <ReqoreInput opaque />
   * <ReqoreInput opaque={true} />
   * <ReqoreInput opaque={false} />
   *
   */
  opaque?: boolean;
}

export interface IWithReqoreFlat {
  /**
   * If true, the component will be flat
   * @default false
   * @type boolean
   * @memberof IWithReqoreFlat
   * @example
   * <ReqoreInput flat />
   * <ReqoreInput flat={true} />
   * <ReqoreInput flat={false} />
   *
   */
  flat?: boolean;
}

export interface IWithReqoreFluid {
  /**
   * If true, the component will fill the parent container horizontally
   * @default false
   * @type boolean
   * @example
   * <ReqoreInput fluid />
   * <ReqoreInput fluid={true} />
   * <ReqoreInput fluid={false} />
   *
   */
  fluid?: boolean;
}

export interface IWithReqoreIconImage {
  /**
   * Use image as the icon for this component
   * @default undefined
   * @type string
   * @example
   * <ReqoreInput iconImage="...your image URL" />
   *
   */
  iconImage?: string;
}

export interface IWithReqoreFixed {
  /**
   * If true, the component will be fixed in fluid containers
   * @default false
   * @type boolean
   * @example
   * <ReqoreInput fixed />
   * <ReqoreInput fixed={true} />
   * <ReqoreInput fixed={false} />
   *
   */
  fixed?: boolean;
}

export interface IWithReqoreMinimal {
  /**
   * If true, the component will be minimal
   * @default false
   * @type boolean
   * @example
   * <ReqoreButton minimal />
   * <ReqoreButton minimal={true} />
   * <ReqoreButton minimal={false} />
   *
   */
  minimal?: boolean;
}

export interface IWithReqoreTransparent {
  /**
   * If true, the component will be transparent
   * @default false
   * @type boolean
   * @example
   * <ReqoreButton transparent />
   * <ReqoreButton transparent={true} />
   * <ReqoreButton transparent={false} />
   *
   */
  transparent?: boolean;
}

export interface IWithReqoreEffect {
  /**
   * If true, the component will have an effect
   * @default undefined
   * @type IReqoreEffect
   * @memberof IWithReqoreEffect
   * @example
   * <ReqoreHeading effect={{ gradient: { from | to }}} />
   *
   */
  effect?: IReqoreEffect;
}

export interface IWithReqoreLoading {
  /**
   * If true, the component will be loading
   * @default false
   * @type boolean
   * @example
   * <ReqoreButton loading />
   * <ReqoreButton loading={true} loadingIconType={2} />
   * <ReqoreButton loading={false} />
   *
   */
  loading?: boolean;
  loadingIconType?: IReqoreSpinnerProps['type'];
}

export interface IReqoreTooltip extends IPopoverOptions {}
export type TReqoreTooltipProp = string | IReqoreTooltip;
