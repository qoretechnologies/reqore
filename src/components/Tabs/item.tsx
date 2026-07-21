import { omit } from 'lodash';
import { forwardRef, memo, useState, useTransition } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem, TReqoreTabsActiveMarker } from '.';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getMainBackgroundColor,
} from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreFlat } from '../../types/global';
import ReqoreButton, { StyledButton } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { TReqoreEffectColor } from '../Effect';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem, IWithReqoreFlat {
  active?: boolean;
  vertical?: boolean;
  /** How the active tab is marked — see `IReqoreTabsProps.activeTabMarker`. */
  activeTabMarker?: TReqoreTabsActiveMarker;
  /** Explicit colour for the `line` marker — see `IReqoreTabsProps`. */
  activeTabMarkerColor?: TReqoreEffectColor;
  onCloseClick?: any;
  customTheme?: IReqoreCustomTheme;
  size?: TSizes;
  wrapTabNames?: boolean;
  fill?: boolean;
  className?: string;
  padded?: boolean;
  useReactTransition?: boolean;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
  closable?: boolean;
  activeColor: string;
}

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({
    theme,
    disabled,
    vertical,
    fill,
    fixed,
    padded,
    active,
    activeTabMarker,
    activeColor,
  }: IReqoreTabListItemStyle) => {
    return css`
      display: flex;
      flex-shrink: 0;
      position: relative;
      align-items: center;
      width: ${vertical ? `100%` : undefined};

      ${vertical
        ? css`
            ${StyledButton}:last-child {
              border-right: 0;
            }
            ${StyledButton}:last-child {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }

            ${padded === false &&
            css`
              &:first-child {
                padding-top: 0;
              }
              &:last-child {
                padding-bottom: 0;
              }
            `}
          `
        : css`
            ${StyledButton} {
              border-bottom: 0;
            }
            ${StyledButton}:first-child {
              border-bottom-left-radius: 0 !important;
            }
            ${StyledButton}:last-child {
              border-bottom-right-radius: 0 !important;
            }

            ${padded === false &&
            css`
              &:first-child {
                padding-left: 0;
              }
              &:last-child {
                padding-right: 0;
              }
            `}
          `}

      ${fill && !fixed
        ? css`
            flex: 1 0 auto;
          `
        : undefined}

      ${disabled &&
      css`
        cursor: not-allowed;
        > * {
          opacity: 0.5;
        }
      `}

      ${activeTabMarker === 'line' &&
      css`
        /* Inactive tabs still have their minimal wash suppressed here — this clears
           background-COLOR only, so a tab carrying a gradient effect keeps it (a
           gradient is a background-image). The ACTIVE tab needs no entry: it is passed
           the transparent prop, which the button now honours in its active state
           instead of painting a fill and deriving the label colour from it.
           The square corners are for the hover wash below: a rounded wash would read
           as a pill sitting in the strip. */
        ${StyledButton} {
          background-color: transparent !important;
          border-radius: 0 !important;
        }

        /* A button draws a 2px outline on :hover, :focus and :active. On an
           underline tab each of those reads as a boxed button fighting the bar,
           and the :focus one OUTLASTS the interaction — it survives until you
           click something else, which is what makes a freshly-picked tab look
           wrong until you move on. Drop all three and give hover a wash instead. */
        ${StyledButton}:hover,
        ${StyledButton}:focus,
        ${StyledButton}:active {
          outline: none !important;
        }

        ${StyledButton}:hover {
          background-color: ${changeLightness(getMainBackgroundColor(theme), 0.1)} !important;
        }

        /* Keyboard users still need to see where they are; :focus-visible only
           matches keyboard focus, so this never returns on a mouse click. */
        ${StyledButton}:focus-visible {
          outline: 2px solid ${activeColor || changeLightness(getMainBackgroundColor(theme), 0.4)} !important;
          outline-offset: -2px;
        }

        ${active &&
        css`
          box-shadow: inset ${vertical ? '-2px 0 0 0' : '0 -2px 0 0'}
            ${activeColor || 'currentColor'};
        `}
      `}
    `;
  }}

  a {
    text-decoration: none;

    &:hover > * {
      text-decoration: underline;
    }
  }
`;

const ReqoreTabsListItem = memo(
  forwardRef<HTMLDivElement, IReqoreTabListItemProps>(
    (
      {
        tooltip,
        label,
        props,
        icon,
        active,
        as,
        disabled,
        vertical,
        onClick,
        activeIntent,
        activeTabMarker,
        activeTabMarkerColor,
        onCloseClick,
        fill,
        intent,
        size = 'normal',
        closeIcon,
        customTheme,
        className,
        flat = true,
        wrapTabNames,
        padded,
        useReactTransition,
        ...rest
      }: IReqoreTabListItemProps,
      ref
    ) => {
      const [isPending, startTransition] = useTransition();
      const [isStillPending, setStillPending] = useState(false);
      const [loadingTimer, setLoadingTimer] = useState(null);
      const { targetRef } = useCombinedRefs(ref);
      const theme = useReqoreTheme('main', customTheme, undefined);
      // Marker colour, most specific first: an explicit colour, then the active
      // intent's, and failing both the tab's own text colour via `currentColor`.
      // The explicit one is resolved through the theme — `TReqoreEffectColor`
      // accepts semantic values ('info', 'main:lighten:8') that are not valid CSS
      // on their own, and dropping one straight into a box-shadow kills the rule.
      const markerIntent = activeIntent || intent;
      const activeColor = activeTabMarkerColor
        ? getColorFromMaybeString(theme, activeTabMarkerColor)
        : markerIntent
        ? theme.intents[markerIntent]
        : undefined;

      useUpdateEffect(() => {
        if (isPending) {
          setLoadingTimer(
            setTimeout(() => {
              setStillPending(() => true);
            }, 300)
          );
        } else {
          clearTimeout(loadingTimer);
          setStillPending(false);
          setLoadingTimer(null);
        }
      }, [isPending]);

      useUnmount(() => {
        clearTimeout(loadingTimer);
      });

      const handleClick = (event) => {
        if (!useReactTransition) {
          onClick?.(event);
          return;
        }

        startTransition(() => {
          onClick?.(event);
        });
      };

      // A `line` marker owns the active indicator, so the tab itself is always
      // flat: a non-flat list still wants its edge rule, but boxing each tab
      // would compete with the bar and read as a button, not a tab.
      const isLineMarker = activeTabMarker === 'line';

      const renderButton = () => (
        <ReqoreButton
          flat={isLineMarker ? true : intent ? false : flat}
          fluid={fill || vertical}
          icon={icon}
          minimal
          /* Only the ACTIVE tab is made transparent, and only for a line marker.
             That is the one state that paints a fill and derives its label colour from
             it — the bug this fixes. Applying it to every tab also suppresses a tab's
             own gradient effect, which consumers explicitly opt into. */
          transparent={isLineMarker && active}
          wrap={wrapTabNames}
          intent={active ? activeIntent || intent : intent}
          active={active}
          disabled={disabled}
          onClick={handleClick}
          tooltip={tooltip}
          customTheme={theme}
          className={`reqore-tabs-list-item ${active ? 'reqore-tabs-list-item-active' : ''}`}
          size={size}
          {...omit(rest, ['id'])}
          loading={isStillPending || rest.loading}
        >
          {label}
        </ReqoreButton>
      );

      return (
        <StyledTabListItem
          ref={targetRef}
          {...props}
          className={className}
          intent={intent}
          as={as}
          size={size}
          active={active}
          disabled={disabled}
          vertical={vertical}
          theme={theme}
          fill={fill}
          fixed={rest.fixed}
          padded={padded}
          activeTabMarker={activeTabMarker}
          activeColor={activeColor}
        >
          {!onCloseClick || disabled ? (
            renderButton()
          ) : (
            <ReqoreControlGroup stack size={size} fluid={fill || vertical} fill={wrapTabNames}>
              {renderButton()}
              {onCloseClick && !disabled ? (
                <ReqoreButton
                  fixed
                  flat={isLineMarker ? true : intent ? false : flat}
                  icon={closeIcon || 'CloseLine'}
                  intent={active ? activeIntent || intent : intent}
                  minimal
                  wrap={wrapTabNames}
                  active={active}
                  className='reqore-tabs-list-item-close'
                  customTheme={theme}
                  size={size}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseClick?.();
                  }}
                />
              ) : null}
            </ReqoreControlGroup>
          )}
        </StyledTabListItem>
      );
    }
  )
);

export default ReqoreTabsListItem;
