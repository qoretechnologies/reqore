import { forwardRef, memo, useMemo } from 'react';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import styled, { omitStyleProps } from '../../helpers/styled';
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
import { IReqoreTextEffectProps, StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreSpanProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
  size?: TSizes | string;
  inline?: IReqoreTextEffectProps['inline'];
  /**
   * Upper bound on the span's width, as any CSS length (`'32ch'`, `'240px'`,
   * `'min(100%, 32ch)'`). Same prop as on `ReqoreButton`, `ReqoreTag`, `ReqorePopover`
   * and `ReqoreBubble`.
   *
   * On its own this only stops the span growing — the text still spills out. Pair it
   * with `effect={{ noWrap: true }}`, which supplies the
   * `white-space` / `overflow` / `text-overflow` half, to get a single line that
   * ellipsizes:
   *
   * ```tsx
   * <ReqoreSpan maxWidth='min(100%, 32ch)' effect={{ noWrap: true }}>{name}</ReqoreSpan>
   * ```
   *
   * The two are separate because they answer different questions — how wide may this
   * be, and what happens to text that does not fit — and plenty of callers want one
   * without the other.
   */
  maxWidth?: string;
}

// Styling props of the span (and of `ReqoreLink`, built on it). A tag drops them on its own; a
// component given as `as` — a router link — would receive them and write them onto its `<a>`.
export const StyledSpan = styled(StyledTextEffect).withConfig({
  shouldForwardProp: omitStyleProps('_size', 'inline', 'maxWidth'),
})`
  /* An intent colours the text in a shade of it that reads on what the span is drawn on
     ($textColor: worked out once per render by the component). */
  color: ${({ theme, intent, $surface, $textColor }) =>
    $textColor ?? getReadableTextColor(theme, intent, $surface)};
  font-size: ${({ _size }) => (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size)};
  vertical-align: ${({ inline }) => (inline ? 'middle' : undefined)};
  max-width: ${({ maxWidth }) => maxWidth || undefined};
`;

export const ReqoreSpan = memo(
  forwardRef(
    (
      {
        size,
        children,
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        inline = false,
        maxWidth,
        tooltip,
        ...props
      }: IReqoreSpanProps,
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
          ref={ref}
          as='span'
          theme={theme}
          $surface={surface}
          $textColor={textColor}
          color={theme.text.color}
          intent={intent}
          inline={inline}
          {...props}
          Component={StyledSpan}
          maxWidth={maxWidth}
          tooltip={tooltip}
          _size={size}
          className={`${className || ''} reqore-span`}
        >
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);
