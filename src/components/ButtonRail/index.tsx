import { mix, rgba } from 'polished';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useContext } from 'use-context-selector';
import { Colors } from '../../constants/colors';
import { PADDING_FROM_SIZE, resolveRadius, SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import CustomThemeContext from '../../context/CustomThemeContext';
import { changeLightness, getMainBackgroundColor, shouldDarken } from '../../helpers/colors';
import { getOneLessSize, resolvePadding, TReqorePadded } from '../../helpers/utils';
import { useCloneThroughFragments } from '../../hooks/useCloneThroughFragments';
import { useReqoreTheme } from '../../hooks/useTheme';
import { RAISED_SHADOWS } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreTooltip,
  IWithReqoreTransparent,
} from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, withGlow } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreButtonRailProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreMinimal,
    IWithReqoreSize,
    IWithReqoreTooltip,
    IWithReqoreTransparent {
  /**
   * Buttons declared as data — each entry is a `ReqoreButton`'s own props
   * (`label` is its text; `id`, when set, is also its React key). Rendered
   * BEFORE `children`; both forms can be mixed and neither is dropped.
   */
  items?: IReqoreButtonProps[];
  /** Lay the buttons out in a column instead of a row; the buttons share one width. */
  vertical?: boolean;
  /** Space between the buttons. Defaults to one step below `size`. */
  gapSize?: TSizes;
  /**
   * Default props for every button in the rail (items and element children).
   * A button's own props always win. The rail already defaults its buttons to
   * `flat` (the rail is their surface) and to `pill` while the rail is a pill.
   */
  buttonProps?: Partial<IReqoreButtonProps>;
  /**
   * Round the rail. `true` (default) is a pill concentric with its buttons —
   * which default to `pill` so the curves nest; `radiusSize` swaps the pill for
   * a fixed radius;
   * `false` squares the rail and its buttons.
   */
  rounded?: boolean;
  /** A fixed corner radius from the pronounced `radiusSize` scale, instead of a pill. */
  radiusSize?: TSizes;
  /** Inner padding around the buttons. Default `true`. */
  padded?: TReqorePadded;
  /** Size the padding follows. Defaults to `size`. */
  paddingSize?: TSizes;
  /**
   * Subtle 3D inset highlight. Only renders on a `flat` rail — a border already
   * gives the surface its edge.
   */
  raised?: boolean;
  /**
   * The floating lift — a tight contact shadow plus a wide ambient one. Default
   * `true`; never painted on a `transparent` / `minimal` rail, which has no
   * surface to lift.
   */
  elevated?: boolean;
  /**
   * Opacity of the rail's surface colour (not of its buttons). Below `1` the
   * surface is frosted: whatever is behind it is blurred by `blur`.
   * @default 0.78
   */
  opacity?: number;
  /**
   * Backdrop blur in px behind a translucent surface (`opacity` < 1). `0` turns
   * the frost off.
   * @default 14
   */
  blur?: number;
  /**
   * Fold the buttons that do not fit into an overflow menu, exactly as a
   * `responsive` `ReqoreControlGroup` does. Horizontal rails only.
   */
  responsive?: boolean;
}

interface IStyledButtonRailProps {
  theme: IReqoreTheme;
  effect?: IReqoreEffect;
  $intent?: TReqoreIntent;
  $flat: boolean;
  $transparent: boolean;
  $raised: boolean;
  $elevated: boolean;
  $fluid?: boolean;
  $fixed?: boolean;
  $vertical?: boolean;
  $padding: string;
  $radius: string;
  $opacity: number;
  $blur: number;
}

/** The floating lift: contact shadow + ambient shadow, lighter on a light theme. */
const getLiftShadows = (theme: IReqoreTheme): string[] => {
  const isLight = shouldDarken(theme.main);

  return [
    `0 2px 6px -1px ${rgba(Colors.DARK, isLight ? 0.12 : 0.4)}`,
    `0 14px 40px -12px ${rgba(Colors.DARK, isLight ? 0.22 : 0.6)}`,
  ];
};

export const StyledButtonRail = styled(StyledEffect)<IStyledButtonRailProps>`
  display: ${({ $fluid }) => ($fluid ? 'flex' : 'inline-flex')};
  flex-direction: ${({ $vertical }) => ($vertical ? 'column' : 'row')};
  flex-wrap: nowrap;
  flex: ${({ $fluid, $fixed }) => ($fixed || !$fluid ? '0 0 auto' : '1 1 auto')};
  width: ${({ $fluid, $fixed }) => ($fluid && !$fixed ? '100%' : 'fit-content')};
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: ${({ $padding }) => $padding};
  border-radius: ${({ $radius }) => $radius};
  transition: background-color 0.16s ease, border-color 0.16s ease;

  background-color: ${({ theme, $intent, $transparent, $opacity }) => {
    if ($transparent) {
      return 'transparent';
    }

    const base = getMainBackgroundColor(theme);
    const intentColor = $intent ? theme.intents[$intent] : undefined;

    return rgba(intentColor ? mix(0.16, intentColor, base) : base, $opacity);
  }};

  border: ${({ theme, $intent, $flat }) =>
    $flat
      ? 0
      : `1px solid ${changeLightness(
          ($intent && theme.intents[$intent]) || getMainBackgroundColor(theme),
          0.08
        )}`};

  ${({ $blur, $opacity, $transparent }) =>
    !$transparent &&
    $blur > 0 &&
    $opacity < 1 &&
    css`
      backdrop-filter: saturate(140%) blur(${$blur}px);
      -webkit-backdrop-filter: saturate(140%) blur(${$blur}px);
    `}

  ${({ theme, effect, $elevated, $raised, $flat }) => {
    const shadows = $elevated ? getLiftShadows(theme) : [];

    if ($raised && $flat) {
      shadows.push(RAISED_SHADOWS);
    }

    return shadows.length ? withGlow(theme, effect, shadows.join(', ')) : undefined;
  }}
`;

/** What arrow-key navigation may land on: enabled, tabbable controls. */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
].join(', ');

/** Keys a text control needs for its own caret; the rail leaves them alone. */
const isTextEntry = (element: HTMLElement): boolean =>
  element.isContentEditable ||
  element.tagName === 'TEXTAREA' ||
  element.tagName === 'SELECT' ||
  (element.tagName === 'INPUT' &&
    !['button', 'checkbox', 'radio', 'submit', 'reset'].includes(
      (element as HTMLInputElement).type
    ));

/** Drops keys whose value is `undefined` — an absent prop, not an undefined one
 *  (see the `ReqoreControlGroup` entry in COMPONENTS.md for why it matters). */
const definedOnly = <T extends Record<string, unknown>>(props: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

export const ReqoreButtonRail = memo(
  forwardRef<HTMLDivElement, IReqoreButtonRailProps>(
    (
      {
        children,
        items,
        vertical,
        size = 'normal',
        gapSize,
        buttonProps,
        intent,
        customTheme,
        inheritCustomTheme,
        flat = false,
        minimal,
        transparent,
        raised,
        elevated = true,
        rounded = true,
        radiusSize,
        padded = true,
        paddingSize,
        opacity = 0.78,
        blur = 14,
        effect,
        fluid,
        fixed,
        disabled,
        tooltip,
        responsive,
        className,
        onKeyDown,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      // The provider below re-publishes the custom theme for the buttons. It must
      // carry an INHERITED one too — publishing `undefined` would cut the buttons
      // off from a theme set further up the tree.
      const parentCustomTheme = useContext(CustomThemeContext);
      const cascadedCustomTheme =
        customTheme ?? (inheritCustomTheme === false ? undefined : parentCustomTheme);

      const isTransparent = !!(transparent || minimal);
      const isFlat = !!(flat || minimal);
      const isPill = rounded !== false && !radiusSize;
      const resolvedGapSize = gapSize ?? getOneLessSize(size);

      // The pill is concentric with its pill buttons — half a button plus the
      // padding around it — rather than `9999px`. Along a row that is the same
      // thing (half the rail's height); down a column of labelled buttons a
      // `9999px` radius would curve the ends into the buttons themselves.
      const radius = useMemo(() => {
        if (rounded === false) return '0';
        if (radiusSize) return `${resolveRadius(size, radiusSize)}px`;

        const verticalPadding =
          padded === false || padded === 'horizontal'
            ? 0
            : PADDING_FROM_SIZE[paddingSize ?? size] * 0.75;

        return `${SIZE_TO_PX[size] / 2 + verticalPadding}px`;
      }, [rounded, radiusSize, size, padded, paddingSize]);

      const padding = useMemo(
        () =>
          resolvePadding({
            padded,
            paddingSize: paddingSize ?? size,
            verticalMultiplier: 0.75,
            horizontalMultiplier: 0.75,
          }),
        [padded, paddingSize, size]
      );

      // What every button in the rail starts from; its own props win.
      const childDefaults = useMemo(
        () =>
          definedOnly({
            flat: true,
            pill: isPill || undefined,
            rounded: rounded === false ? false : undefined,
            disabled: disabled || undefined,
            ...buttonProps,
          }),
        [isPill, rounded, disabled, buttonProps]
      );

      const { clone } = useCloneThroughFragments(
        (props, _index, _realIndex, childType) =>
          typeof childType === 'string' ? props : { ...childDefaults, ...definedOnly(props) },
        [childDefaults]
      );

      // One flat list: a `responsive` group folds by slicing its children, so
      // the items and the element children must be siblings, not two arrays.
      const content = useMemo(
        () => [
          ...React.Children.toArray(
            clone(
              items?.map((item, index) => (
                <ReqoreButton key={`item-${item.id ?? index}`} {...item} />
              ))
            )
          ),
          ...React.Children.toArray(clone(children)),
        ],
        [items, children, clone]
      );

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);

          const target = event.target as HTMLElement;
          const rail = event.currentTarget;

          // A key pressed inside a portal (a popover a button opened) bubbles
          // through the React tree to here; it is not the rail's to handle.
          if (event.defaultPrevented || !rail.contains(target) || isTextEntry(target)) {
            return;
          }

          const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
          const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';

          if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) {
            return;
          }

          const focusables = Array.from(
            rail.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          ).filter((element) => element.tabIndex >= 0 && !element.closest('[aria-hidden="true"]'));

          if (!focusables.length) {
            return;
          }

          const current = focusables.findIndex((element) => element.contains(target));
          let next: number;

          switch (event.key) {
            case 'Home':
              next = 0;
              break;
            case 'End':
              next = focusables.length - 1;
              break;
            case nextKey:
              next = current === -1 ? 0 : (current + 1) % focusables.length;
              break;
            default:
              next =
                current === -1
                  ? focusables.length - 1
                  : (current - 1 + focusables.length) % focusables.length;
          }

          event.preventDefault();
          focusables[next].focus();
        },
        [onKeyDown, vertical]
      );

      return (
        <ReqoreThemeProvider theme={theme} customTheme={cascadedCustomTheme}>
          <ReqoreTooltipComponent
            role='toolbar'
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            aria-disabled={disabled || undefined}
            {...rest}
            as='div'
            ref={ref}
            Component={StyledButtonRail}
            tooltip={tooltip}
            theme={theme}
            effect={effect}
            onKeyDown={handleKeyDown}
            $intent={intent}
            $flat={isFlat}
            $transparent={isTransparent}
            $raised={!!raised}
            $elevated={elevated && !isTransparent}
            $fluid={fluid}
            $fixed={fixed}
            $vertical={vertical}
            $padding={padding}
            $radius={radius}
            $opacity={opacity}
            $blur={blur}
            className={`${className || ''} reqore-button-rail`}
          >
            <ReqoreControlGroup
              className='reqore-button-rail-group'
              vertical={vertical}
              size={size}
              gapSize={resolvedGapSize}
              intent={intent}
              customTheme={customTheme}
              minimal={minimal}
              // A column of buttons shares one width — the widest — so the rail
              // reads as one control rather than a ragged stack.
              fluid={fluid || vertical}
              fixed={fixed}
              responsive={responsive && !vertical}
              overflowButtonProps={childDefaults}
              style={responsive && !vertical ? { flex: '1 1 auto', minWidth: 0 } : undefined}
            >
              {content}
            </ReqoreControlGroup>
          </ReqoreTooltipComponent>
        </ReqoreThemeProvider>
      );
    }
  )
);

export default ReqoreButtonRail;
