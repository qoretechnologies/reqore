import { forwardRef, memo, useMemo } from 'react';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import styled, { omitStyleProps, REQORE_CONTROL_GROUP_CHILD_PROPS } from '../../helpers/styled';
import { getReadableTextColor } from '../../helpers/colors';
import { isStringSize } from '../../helpers/utils';
import { useReqoreSurface } from '../../context/SurfaceContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreTooltip,
} from '../../types/global';
import { StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
  size?: TSizes | string;
  block?: boolean;
  inline?: boolean;
  /**
   * The element to render instead of `p`, keeping the paragraph's look.
   *
   * For content a `<p>` may not hold — a rendered list, a code block — which
   * the browser would otherwise move out of the paragraph, and its styling
   * with it.
   */
  as?: React.ElementType;
}

// `_size` is the paragraph's text size, for its styles; the layout flags a containing
// `ReqoreControlGroup` hands it are for the group. A `p` would keep `fill` (an SVG attribute), and
// a component the paragraph is rendered `as` would receive them all.
export const StyledParagraph = styled(StyledTextEffect).withConfig({
  shouldForwardProp: omitStyleProps('_size', ...REQORE_CONTROL_GROUP_CHILD_PROPS),
})`
  padding: 0;
  margin: 0;
  /* An intent colours the text in a shade of it that reads on what the paragraph is drawn on
     ($textColor: worked out once per render by the component). */
  color: ${({ theme, intent, $surface, $textColor }) =>
    $textColor ?? getReadableTextColor(theme, intent, $surface)};
  font-size: ${({ _size }) => (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size)};
`;

/**
 * The element a text slot that may hold blocks is drawn as: a `p` for text (a string or a number),
 * so plain text is exactly the paragraph it always was — consumer CSS aimed at `p` still matches —
 * and a `div` for anything else, which may be a block a `p` cannot hold.
 */
export const getReqoreTextElement = (content: React.ReactNode): 'p' | 'div' =>
  typeof content === 'string' || typeof content === 'number' ? 'p' : 'div';

export const ReqoreP = memo(
  forwardRef(
    (
      {
        size,
        children,
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        block = true,
        tooltip,
        ...props
      }: IReqoreParagraphProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const surface = useReqoreSurface();
      const textColor = useMemo(
        () => getReadableTextColor(theme, intent, surface),
        [theme, intent, surface]
      );

      return (
        <ReqoreTooltipComponent
          as='p'
          $surface={surface}
          $textColor={textColor}
          theme={theme}
          color={theme.text.color}
          intent={intent}
          block={block}
          {...props}
          Component={StyledParagraph}
          ref={ref}
          tooltip={tooltip}
          _size={size}
          className={`${className || ''} reqore-paragraph`}
        >
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);
