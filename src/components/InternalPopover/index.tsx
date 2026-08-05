import { cloneDeep, isString } from 'lodash';
import { rgba } from 'polished';
import React, {
  MutableRefObject,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import {
  changeLightness,
  getColorFromMaybeString,
  getNotificationIntent,
} from '../../helpers/colors';
import { getPrimaryGradient } from '../Effect';
import ReqoreMessage from '../Message';
import { IPopoverData } from '../Popover';

const getPopoverArrowColor = ({ theme, dim, intent, flat, effect, isOpaque }) => {
  const primary = getPrimaryGradient(effect?.gradient);
  const primaryColorsRecord: Record<number | string, unknown> | undefined =
    primary && typeof primary.colors === 'object'
      ? (primary.colors as Record<number | string, unknown>)
      : undefined;
  const primaryFirstColor = primaryColorsRecord
    ? (Object.values(primaryColorsRecord)[0] as any)
    : undefined;
  return rgba(
    primary
      ? changeLightness(
          getColorFromMaybeString(theme, primary.borderColor || primaryFirstColor),
          0.04
        )
      : intent
      ? changeLightness(getNotificationIntent(theme, intent), flat ? 0.1 : 0.2)
      : theme.popover?.main ||
        rgba(
          changeLightness(
            flat ? theme.main : getNotificationIntent(theme, intent),
            flat ? 0.1 : 0.2
          ),
          isOpaque ? 1 : 0.3
        ),
    dim ? 0.3 : 1
  );
};

const StyledPopoverArrow = styled.div<{ theme: IReqoreTheme }>`
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: -1;

  &:before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;
    z-index: -1;
  }
`;

/** Gutter kept between a popover and each viewport edge, so a clamped surface
 *  never sits flush against the side of the screen. */
const VIEWPORT_EDGE_GUTTER = 20;
const VIEWPORT_MAX_WIDTH = `calc(100vw - ${VIEWPORT_EDGE_GUTTER}px)`;

export const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  ${({ animate }) =>
    animate &&
    css`
      animation: 0.2s ${fadeIn} ease-out;
    `}

  /* Never wider than the viewport, whatever the caller asks for.
     Popper can flip or shift a surface but it cannot shrink one, so a popover
     wider than the screen — a long dropdown, a menu of descriptive rows — hangs
     off both edges with its content unreachable. Clamp to the viewport less a
     small gutter so it always has breathing room at the sides; an explicit
     maxWidth still wins whenever it is the smaller of the two.
     (No backticks in here: this comment lives inside a template literal.) */
  max-width: ${({ maxWidth }) =>
    maxWidth ? `min(${maxWidth}, ${VIEWPORT_MAX_WIDTH})` : VIEWPORT_MAX_WIDTH};
  min-width: ${({ minWidth }) => minWidth};
  max-height: ${({ maxHeight }) => maxHeight};
  z-index: 999999;
  border-radius: ${RADIUS_FROM_SIZE.normal}px;
  border: ${({ flat, noWrapper, ...rest }: any) =>
    !flat && noWrapper ? `1px solid ${getPopoverArrowColor({ ...rest, flat })}` : undefined};

  ${({ transparent }) =>
    !transparent &&
    css`
      box-shadow: rgba(31, 26, 34, 0.7) 0px 0px 10px;
    `}

  &[data-popper-placement^='top'] > ${StyledPopoverArrow} {
    bottom: -5px;

    &:before {
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid ${(props) => getPopoverArrowColor(props)};

      top: 5px;
      left: -5px;
    }
  }

  &[data-popper-placement^='bottom'] > ${StyledPopoverArrow} {
    top: -5px;

    &:before {
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 10px solid ${(props) => getPopoverArrowColor(props)};

      top: -5px;
      left: -5px;
    }
  }

  &[data-popper-placement^='left'] > ${StyledPopoverArrow} {
    right: -5px;

    &:before {
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 10px solid ${(props) => getPopoverArrowColor(props)};

      top: -5px;
      left: 5px;
    }
  }

  &[data-popper-placement^='right'] > ${StyledPopoverArrow} {
    left: -5px;

    &:before {
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 10px solid ${(props) => getPopoverArrowColor(props)};

      top: -5px;
      left: -5px;
    }
  }

  &[data-popper-reference-hidden='true'] {
    visibility: hidden;
    pointer-events: none;
  }
`;

export const StyledPopoverContent = styled.div`
  width: 100%;
  height: 100%;
  z-index: 20;
  position: relative;
  overflow: hidden;
`;

export interface IReqoreInternalPopoverProps extends IPopoverData {
  onPopperUpdate?: (popperRef: MutableRefObject<any>) => void;
  onPopperClose?: () => void;
  closePopover: () => void;
  handler?: 'hover' | 'click' | 'focus' | 'hoverStay';
  onPopoverMouseEnter?: () => void;
  onPopoverMouseLeave?: () => void;
}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = memo(
  ({
    targetElement,
    content,
    placement,
    noArrow,
    noWrapper,
    useTargetWidth,
    transparent,
    maxWidth,
    minWidth,
    maxHeight,
    offsetX = 0,
    offsetY = 0,
    intent,
    title,
    icon,
    minimal,
    flat = true,
    effect,
    backgroundBlur,
    updater,
    id,
    onPopperUpdate,
    onPopperClose,
    closePopover,
    onPopoverMouseEnter,
    onPopoverMouseLeave,
  }) => {
    const animations = useReqoreProperty('animations');
    const customPortalId = useReqoreProperty('customPortalId');
    const uiScale = useReqoreProperty('uiScale');
    const [popperElement, setPopperElement] = useState(null);
    const [arrowElement, setArrowElement] = useState(null);
    const popperRef: MutableRefObject<any> = useRef(null);
    const mutationObserber: MutableRefObject<any> = useRef(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);
    const baseOffsetY = noArrow ? 5 : 10;
    const { styles, attributes, forceUpdate, state } = usePopper(targetElement, popperElement, {
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [offsetX, baseOffsetY + offsetY],
          },
        },
        {
          name: 'arrow',
          options: {
            element: arrowElement,
            padding: 8,
          },
        },
        {
          name: 'preventOverflow',
          options: {
            // Half the clamp's gutter on each side, so a surface shifted away
            // from an edge lands where the max-width already implies it should.
            padding: VIEWPORT_EDGE_GUTTER / 2,
          },
        },
        {
          name: 'hide',
          enabled: true,
        },
      ],
    });

    useUpdateEffect(() => {
      if (!mutationObserber.current && targetElement && state) {
        // Watch for changes in the target element
        const observer = new MutationObserver(() => {
          forceUpdate();
        });

        observer.observe(targetElement, {
          attributes: true,
          childList: true,
          subtree: true,
        });

        mutationObserber.current = observer;
      }
    }, [styles, attributes, state]);

    // Popover content commonly changes size after opening (for example when
    // an async preview replaces its skeleton). Popper's event listeners track
    // viewport and target movement, but not intrinsic content-size changes.
    // Recalculate deterministically whenever the rendered popover resizes so
    // flip/preventOverflow can keep the whole surface inside the viewport.
    useEffect(() => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
      if (!popperElement || typeof ResizeObserver === 'undefined') return undefined;

      const observer = new ResizeObserver(() => forceUpdate?.());
      observer.observe(popperElement);
      resizeObserver.current = observer;

      return () => {
        observer.disconnect();
        if (resizeObserver.current === observer) resizeObserver.current = null;
      };
    }, [forceUpdate, popperElement]);

    // Preserve the documented explicit update contract as a fallback for
    // content changes that do not affect the content box dimensions.
    useUpdateEffect(() => {
      forceUpdate?.();
    }, [updater]);

    // Stabilize the popover against ancestor CSS transitions that Popper's
    // scroll/resize listeners can't observe. When a popover opens inside a
    // Modal/Drawer that's still animating its `transform: scale(...)` in,
    // the trigger's `getBoundingClientRect()` shifts frame-by-frame but
    // fires no scroll/resize events, so the popover would stay anchored to
    // the trigger's rect at open-time and end up visibly offset once the
    // ancestor settles.
    //
    // Poll the trigger's rect for a short window after Popper attaches; if
    // it moves, force a re-layout. Stop as soon as it's stable for 3
    // consecutive frames, or after ~500ms — enough to cover typical
    // Modal/Drawer scale-in / slide-in durations without polling forever.
    useEffect(() => {
      if (!targetElement || !state) return undefined;
      let rafId: number | null = null;
      let stableFrames = 0;
      let elapsed = 0;
      let lastKey = '';
      const rectKey = (r: DOMRect) => `${r.x},${r.y},${r.width},${r.height}`;
      lastKey = rectKey(targetElement.getBoundingClientRect());
      const tick = (prev: number) => {
        rafId = requestAnimationFrame((now) => {
          const dt = now - prev;
          elapsed += dt;
          const key = rectKey(targetElement.getBoundingClientRect());
          if (key === lastKey) {
            stableFrames += 1;
          } else {
            lastKey = key;
            stableFrames = 0;
            forceUpdate();
          }
          if (stableFrames < 3 && elapsed < 500) {
            tick(now);
          } else {
            rafId = null;
          }
        });
      };
      rafId = requestAnimationFrame((now) => tick(now));
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [targetElement, !!state, forceUpdate]);

    useUnmount(() => {
      mutationObserber.current?.disconnect();
      resizeObserver.current?.disconnect();
    });

    useEffect(() => {
      if (popperRef.current) {
        onPopperUpdate?.(cloneDeep(popperRef));
      }
    }, [popperRef]);

    useEffect(() => {
      if (attributes.popper?.['data-popper-reference-hidden']) {
        onPopperClose?.();
      }
    }, [attributes.popper]);

    /* Getting the x and y values from the transform property of the popper element. */
    const translateValues = useMemo(
      () =>
        styles.popper.transform
          ?.replace('translate3d(', '')
          .replace('translate(', '')
          .replace(')', '')
          .split(',')
          .map((axis) => {
            const scale = uiScale;
            let modifiedAxis = parseInt(axis, 10);

            if (scale || scale === 0) {
              modifiedAxis =
                parseInt(axis, 10) < 0 ? parseInt(axis, 10) * scale : parseInt(axis, 10) / scale;
            }

            return modifiedAxis;
          }),
      [styles.popper.transform, uiScale]
    );

    const arrowStyle = useMemo(() => {
      if (uiScale === undefined) {
        return styles.arrow;
      }

      const scaleAxisValue = (value: number | string | undefined) => {
        if (value === undefined) {
          return value;
        }

        const numericValue = typeof value === 'number' ? value : Number.parseFloat(value);

        if (Number.isNaN(numericValue)) {
          return value;
        }

        const scaledValue = numericValue < 0 ? numericValue * uiScale : numericValue / uiScale;

        return typeof value === 'number' ? scaledValue : `${scaledValue}px`;
      };

      return {
        ...styles.arrow,
        left: scaleAxisValue(styles.arrow.left),
        top: scaleAxisValue(styles.arrow.top),
      };
    }, [styles.arrow, uiScale]);

    const style = useMemo(
      () => ({
        ...styles.popper,
        transform: `translate(${translateValues?.[0] || 0}px, ${translateValues?.[1] || 0}px)`,
        width: useTargetWidth && (targetElement?.getBoundingClientRect()?.width || undefined),
      }),
      [styles.popper, useTargetWidth, targetElement, translateValues]
    );

    const handleRef = useCallback((el) => {
      setPopperElement(el);
      popperRef.current = el;
    }, []);

    return createPortal(
      <ReqoreThemeProvider>
        <StyledPopoverWrapper
          maxWidth={maxWidth}
          minWidth={minWidth}
          maxHeight={maxHeight}
          transparent={transparent}
          effect={effect}
          isOpaque={!transparent && !minimal}
          intent={intent}
          flat={flat}
          noWrapper={noWrapper}
          dim={flat && !transparent && !effect && minimal}
          className='reqore-popover-content'
          ref={handleRef}
          style={style}
          animate={animations?.popovers}
          id={id}
          onMouseEnter={onPopoverMouseEnter}
          onMouseLeave={onPopoverMouseLeave}
          {...attributes.popper}
        >
          {!noArrow && !transparent ? (
            <StyledPopoverArrow ref={setArrowElement} style={arrowStyle} data-popper-arrow />
          ) : null}
          <StyledPopoverContent>
            {!noWrapper || isString(content) ? (
              <ReqoreMessage
                opaque={!transparent && !minimal}
                className='reqore-popover-text'
                intent={intent}
                title={title}
                icon={icon}
                minimal={transparent}
                flat={flat || transparent}
                effect={effect}
                backgroundBlur={backgroundBlur}
              >
                {content}
              </ReqoreMessage>
            ) : (
              <>
                {React.Children.map(content, (child) =>
                  child
                    ? React.cloneElement(child, {
                        closePopover,
                      })
                    : null
                )}
              </>
            )}
          </StyledPopoverContent>
        </StyledPopoverWrapper>
      </ReqoreThemeProvider>,
      document.querySelector(customPortalId || '#reqore-portal')!
    );
  }
);

export default InternalPopover;
