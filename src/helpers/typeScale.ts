/**
 * The px a `size` renders its text at, as the theme decides it.
 *
 * `theme.typeScale` names the sizes an app wants at its own px; everything it leaves out is
 * Reqore's own table (`TEXT_FROM_SIZE`, `CONTROL_TEXT_FROM_SIZE`, `TAG_TEXT_FROM_SIZE`). Every
 * component reads its text size through one of these three, so a theme decides the type scale
 * of the whole app in one place, and a theme without `typeScale` renders exactly as before.
 */
import {
  CONTROL_TEXT_FROM_SIZE,
  TAG_TEXT_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../constants/sizes';
import { IReqoreTheme } from '../constants/theme';

type TReqoreTypeScaleTheme = Pick<IReqoreTheme, 'typeScale'> | undefined;

/**
 * px for running text at `size`: paragraphs, spans, links, table cells, panel / accordion /
 * callout / bubble / notification / data view text, and `effect.textSize` given as a size name.
 */
export const getTextSize = (theme: TReqoreTypeScaleTheme, size: TSizes): number =>
  theme?.typeScale?.text?.[size] ?? TEXT_FROM_SIZE[size];

/**
 * px for a control's text at `size`: buttons, inputs, textareas, tabs, checkboxes, the segmented
 * control, progress labels and a tag's actions.
 */
export const getControlTextSize = (theme: TReqoreTypeScaleTheme, size: TSizes): number =>
  theme?.typeScale?.control?.[size] ?? CONTROL_TEXT_FROM_SIZE[size];

/** px for a tag's, a badge's or a keyboard key's text at `size`. */
export const getTagTextSize = (theme: TReqoreTypeScaleTheme, size: TSizes): number =>
  theme?.typeScale?.tag?.[size] ?? TAG_TEXT_FROM_SIZE[size];
