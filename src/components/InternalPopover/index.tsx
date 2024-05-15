import { cloneDeep, isString } from 'lodash';
import { rgba } from 'polished';
import React, { MutableRefObject, memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { useContext } from 'use-context-selector';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { IPopoverData } from '../../containers/PopoverProvider';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { fadeIn } from '../../helpers/animations';
import {
  changeLightness,
  getColorFromMaybeString,
  getNotificationIntent,
} from '../../helpers/colors';
import ReqoreMessage from '../Message';

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
  animation: 0.2s ${fadeIn} ease-out;
  max-width: ${({ maxWidth }) => maxWidth};
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

export interface IReqoreInternalPopoverProps extends IPopoverData {}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = memo(
  ({
    targetElement,
    content,
    id,
    placement,
    noArrow,
    noWrapper,
    useTargetWidth,
    transparent,
    maxWidth,
    maxHeight,
    intent,
    title,
    icon,
    minimal,
    flat = true,
    uiScale,
    effect,
  }) => {
    const { removePopover, updatePopover, uiScale: globalUiScale } = useContext(PopoverContext);
    const [popperElement, setPopperElement] = useState(null);
    const [arrowElement, setArrowElement] = useState(null);
    const popperRef: MutableRefObject<any> = useRef(null);
    const mutationObserber: MutableRefObject<any> = useRef(null);
    const { styles, attributes, forceUpdate, state } = usePopper(targetElement, popperElement, {
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, noArrow ? 5 : 10],
          },
        },
        {
          name: 'arrow',
          options: {
            element: arrowElement,
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

        observer.observe(document, {
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
        updatePopover?.(id, { popperRef: cloneDeep(popperRef) });
      }
    }, [popperRef]);

    useEffect(() => {
      if (attributes.popper?.['data-popper-reference-hidden']) {
        removePopover?.(id);
      }
    }, [attributes.popper]);

    /* Getting the x and y values from the transform property of the popper element. */
    const translateValues = styles.popper.transform
      ?.replace('translate3d(', '')
      .replace('translate(', '')
      .replace(')', '')
      .split(',')
      .map((axis) => {
        const scale = uiScale || globalUiScale;
        let modifiedAxis = parseInt(axis, 10);

        if (scale || scale === 0) {
          modifiedAxis =
            parseInt(axis, 10) < 0 ? parseInt(axis, 10) * scale : parseInt(axis, 10) / scale;
        }

        return modifiedAxis;
      });

    return createPortal(
      <ReqoreThemeProvider>
        <StyledPopoverWrapper
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          transparent={transparent}
          effect={effect}
          isOpaque={!transparent && !minimal}
          intent={intent}
          flat={flat}
          noWrapper={noWrapper}
          dim={flat && !transparent && !effect && minimal}
          className='reqore-popover-content'
          ref={(el) => {
            setPopperElement(el);
            popperRef.current = el;
          }}
          style={{
            ...styles.popper,
            transform: `translate(${translateValues?.[0] || 0}px, ${translateValues?.[1] || 0}px)`,
            width: useTargetWidth && (targetElement?.getBoundingClientRect()?.width || undefined),
          }}
          {...attributes.popper}
        >
          {!noArrow && !transparent ? (
            <StyledPopoverArrow ref={setArrowElement} style={styles.arrow} data-popper-arrow />
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
                        _insidePopover: true,
                        _popoverId: id,
                      })
                    : null
                )}
              </>
            )}
          </StyledPopoverContent>
        </StyledPopoverWrapper>
      </ReqoreThemeProvider>,
      document.querySelector('#reqore-portal')!
    );
  }
);

export default InternalPopover;
