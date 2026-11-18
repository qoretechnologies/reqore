import type { TReqoreEffectColor } from '../components/Effect';
import type { IReqoreIconProps } from '../components/Icon';

/**
 * An icon's own color given in its props (`leftIconProps={{ intent }}`, `iconProps={{ color }}`), split from the rest
 * of them (qorus#646).
 *
 * A component that draws an icon faded (a button's or an input's at `CONTROL_ICON_OPACITY`, a tag's, a panel's
 * title icon) picks the icon's color and opacity together so that it stands out by 3:1 at that opacity. A color
 * given in the icon's props was spread over that pick: the icon made it readable at full opacity, and drawn at 70%
 * a warning icon was 2.4:1. The component picks it instead, as it does its own `iconColor`, and passes the rest on.
 * The props' color wins over the component's, as it did when the props were spread last.
 */
export const splitIconColor = (
  props?: IReqoreIconProps
): [TReqoreEffectColor | undefined, IReqoreIconProps | undefined] => {
  if (!props || (!props.intent && !props.color)) {
    return [undefined, props];
  }

  const { intent, color, ...rest } = props;

  return [intent || color, rest];
};
