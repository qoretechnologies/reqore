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
import ReqoreMessage from '../Message';
import { IPopoverData } from '../Popover';

const getPopoverArrowColor = ({ theme, dim, intent, flat, effect, isOpaque }) =>
  rgba(
    effect
      ? changeLightness(
          getColorFromMaybeString(
            theme,
            effect.gradient.borderColor || Object.values(effect.gradient.colors)[0]
          ),
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

export const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  ${({ animate }) =>
    animate &&
    css`
      animation: 0.2s ${fadeIn} ease-out;
    `}

  max-width: ${({ maxWidth }) => maxWidth};
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
            padding: 8,
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

    useUnmount(() => {
      mutationObserber.current?.disconnect();
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
