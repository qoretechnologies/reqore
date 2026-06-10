import { forwardRef, memo, MouseEvent } from 'react';
import styled from 'styled-components';
import { PADDING_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { changeLightness } from '../../helpers/colors';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreEffectColor } from '../Effect';
import ReqoreIcon from '../Icon';
import { StyledSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreLinkProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
  /** Render an anchor to this URL. When omitted (and no custom `as` is given)
   *  an `onClick`-driven `<button type="button">` is rendered instead, so the
   *  link works the same whether it navigates or triggers an in-app action. */
  href?: string;
  /** Open an `href` link in a new tab (adds `rel="noopener noreferrer"`). */
  external?: boolean;
  /** Disable the link — non-interactive and dimmed. */
  disabled?: boolean;
  /** Underline the text. Defaults to `true`. */
  underline?: boolean;
  /** Leading icon, rendered before the text. Setting an icon switches the link
   *  to an `inline-flex` row so the icon and text stay vertically centered. */
  icon?: IReqoreIconName;
  /** Color for the `icon`. Defaults to the link's (intent) text color. */
  iconColor?: TReqoreEffectColor;
  /** Flow inline (default) or render as an `inline-flex` row. Forced on when an
   *  `icon` is set. */
  inline?: boolean;
  /**
   * Render a custom element instead of the default `<a>` / `<button>` — e.g. a
   * router's link component (`as={Link}` with `to="..."` for react-router, or
   * `as={NextLink} href="..."` for Next.js). Element-specific props (`to`,
   * `href`, …) are passed straight through. When set, the element is treated as
   * link-like (it receives `external`/`disabled` handling like an anchor).
   */
  as?: string | React.ElementType;
  size?: TSizes | string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

interface IReqoreLinkStyle {
  _size?: TSizes | string;
  $underline?: boolean;
  $inline?: boolean;
}

// Built on top of `StyledSpan` so the color / intent / text-effect resolution
// lives in one place (the Span primitive); only the interactive link-specific
// styling is declared here.
export const StyledLink = styled(StyledSpan)<IReqoreLinkStyle>`
  display: ${({ $inline }) => ($inline === false ? 'inline-flex' : 'inline')};
  align-items: center;
  // Icon/text spacing scales with size (matches ReqoreButton's icon spacer);
  // custom/undefined sizes fall back to 'normal', like the rendered icon does.
  gap: ${({ _size }) => PADDING_FROM_SIZE[isStringSize(_size) ? _size : 'normal'] / 2}px;
  appearance: none;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  font-family: inherit;
  font-weight: inherit;
  font-size: ${({ _size }) =>
    _size ? (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size) : 'inherit'};
  text-align: left;
  cursor: pointer;
  /* Doubled selector raises specificity above the Layout's global
     '.layout a { text-decoration: none }' reset, which would otherwise
     strip the underline from the anchor variant. */
  && {
    text-decoration: ${({ $underline }) => ($underline === false ? 'none' : 'underline')};
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  transition:
    opacity 0.15s ease,
    color 0.15s ease;

  &:hover {
    opacity: 0.82;
  }

  &:focus-visible {
    outline: 2px solid
      ${({ theme, intent }) => changeLightness(intent ? theme.intents[intent] : theme.main, 0.2)};
    outline-offset: 2px;
    border-radius: 2px;
  }

  &:disabled,
  &[aria-disabled='true'] {
    cursor: default;
    text-decoration: none;
    opacity: 0.55;
    pointer-events: none;
  }
`;

/**
 * An inline, themeable, keyboard-accessible text link. Renders a real
 * `<a href>` when given `href` (so middle-click / open-in-new-tab work), a
 * `<button type="button">` when given `onClick` — the same affordance whether
 * the link navigates or triggers an in-app action — or a custom element via
 * `as` (e.g. a router link). Use it for clickable text that must flow inside a
 * sentence or list, where `ReqoreButton` (a block control) would break the line.
 */
export const ReqoreLink = memo(
  forwardRef<HTMLElement, IReqoreLinkProps>(
    (
      {
        size,
        children,
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        href,
        external,
        disabled,
        underline = true,
        inline = true,
        icon,
        iconColor,
        as,
        onClick,
        tooltip,
        ...props
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      // An icon needs the inline-flex row so it stays centered with the text.
      const renderInline = icon ? false : inline;

      // A custom element (router link, etc.) is treated as link-like; the
      // intrinsic `<button>` is only used when there is no `as` and no `href`.
      const isLinkLike = as !== undefined || href !== undefined;
      const elementProps = isLinkLike
        ? {
            as: as ?? ('a' as const),
            // Only forward `href` when one is actually supplied — a custom `as`
            // (e.g. a router link) derives its own href from `to` and would be
            // broken by an injected `href={undefined}`.
            ...(href !== undefined ? { href: disabled ? undefined : href } : {}),
            target: external ? '_blank' : undefined,
            rel: external ? 'noopener noreferrer' : undefined,
            'aria-disabled': disabled || undefined,
            onClick: disabled ? (event: MouseEvent<HTMLElement>) => event.preventDefault() : onClick,
          }
        : {
            as: 'button' as const,
            type: 'button' as const,
            disabled,
            onClick,
          };

      return (
        <ReqoreTooltipComponent
          {...props}
          {...elementProps}
          theme={theme}
          color={theme.text.color}
          intent={intent}
          Component={StyledLink}
          ref={ref}
          tooltip={tooltip}
          _size={size}
          $inline={renderInline}
          $underline={underline}
          className={`${className || ''} reqore-link`}
        >
          {icon ? (
            <ReqoreIcon
              icon={icon}
              size={isStringSize(size) ? (size as TSizes) : 'normal'}
              intent={intent}
              color={iconColor}
            />
          ) : null}
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreLink.displayName = 'ReqoreLink';

export default ReqoreLink;
