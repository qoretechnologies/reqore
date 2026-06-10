import { forwardRef, memo, MouseEvent } from 'react';
import styled from 'styled-components';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { changeLightness } from '../../helpers/colors';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreTooltip,
} from '../../types/global';
import { StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreLinkProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
  /** Render an anchor to this URL. When omitted an `onClick`-driven
   *  `<button type="button">` is rendered instead, so the link works the
   *  same whether it navigates or triggers an in-app action. */
  href?: string;
  /** Open an `href` link in a new tab (adds `rel="noopener noreferrer"`). */
  external?: boolean;
  /** Disable the link — non-interactive and dimmed. */
  disabled?: boolean;
  /** Underline the text. Defaults to `true`. */
  underline?: boolean;
  /** Flow inline (default) or render as an `inline-flex` row (e.g. with an
   *  icon child). */
  inline?: boolean;
  size?: TSizes | string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

interface IReqoreLinkStyle {
  _size?: TSizes | string;
  $underline?: boolean;
  $inline?: boolean;
}

export const StyledLink = styled(StyledTextEffect)<IReqoreLinkStyle>`
  display: ${({ $inline }) => ($inline === false ? 'inline-flex' : 'inline')};
  align-items: center;
  gap: 4px;
  appearance: none;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  font-family: inherit;
  font-weight: inherit;
  font-size: ${({ _size }) =>
    _size ? (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size) : 'inherit'};
  color: ${({ theme, intent }) => (intent ? theme.intents[intent] : theme.text?.color || 'inherit')};
  text-align: left;
  cursor: pointer;
  text-decoration: ${({ $underline }) => ($underline === false ? 'none' : 'underline')};
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
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
 * `<a href>` when given `href` (so middle-click / open-in-new-tab work) or a
 * `<button type="button">` when given `onClick` — the same affordance whether
 * the link navigates or triggers an in-app action. Use it for clickable text
 * that must flow inside a sentence or list, where `ReqoreButton` (a block
 * control) would break the line.
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
        onClick,
        tooltip,
        ...props
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const isAnchor = href !== undefined;
      const elementProps = isAnchor
        ? {
            as: 'a' as const,
            href: disabled ? undefined : href,
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
          $inline={inline}
          $underline={underline}
          className={`${className || ''} reqore-link`}
        >
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreLink.displayName = 'ReqoreLink';

export default ReqoreLink;
