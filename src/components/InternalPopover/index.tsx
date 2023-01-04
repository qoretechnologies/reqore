import { isString } from 'lodash';
import { rgba } from 'polished';
import React, { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css } from 'styled-components';
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
import { StyledBackdrop } from '../Drawer';
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

const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  animation: 0.2s ${fadeIn} ease-out;
  max-width: ${({ maxWidth = '80vw' }) => maxWidth};
  max-height: ${({ maxHeight = '80vh' }) => maxHeight};
  z-index: 999999;
  border-radius: ${RADIUS_FROM_SIZE.normal}px;

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

const StyledPopoverContent = styled.div<{ isString?: boolean }>`
  width: 100%;
  height: 100%;
  z-index: 20;
  position: relative;
  overflow: hidden;
`;

export interface IReqoreInternalPopoverProps extends IPopoverData {}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = ({
  targetElement,
  content,
  id,
  placement,
  noArrow,
  useTargetWidth,
  transparent,
  maxWidth,
  maxHeight,
  blur,
  intent,
  title,
  icon,
  minimal,
  flat = true,
  effect,
}) => {
  const { removePopover, updatePopover, uiScale } = useContext(PopoverContext);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const popperRef: MutableRefObject<any> = useRef(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, noArrow ? -1 : 10],
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

  useEffect(() => {
    if (popperRef.current) {
      updatePopover?.(id, { popperRef });
    }
  }, [popperRef]);

  useEffect(() => {
    if (attributes?.popper?.['data-popper-reference-hidden']) {
      removePopover?.(id);
    }
  }, [attributes?.popper]);

  /* Getting the x and y values from the transform property of the popper element. */
  const translateValues = styles.popper.transform
    ?.replace('translate3d(', '')
    .replace('translate(', '')
    .replace(')', '')
    .split(',')
    .map((axis) => {
      if (uiScale || uiScale === 0) {
        return parseInt(axis, 10) < 0 ? parseInt(axis, 10) * uiScale : parseInt(axis, 10) / uiScale;
      }
      return parseInt(axis, 10);
    });

  return (
    <ReqoreThemeProvider>
      {blur > 0 ? <StyledBackdrop zIndex={999998} blur={blur} closable /> : null}
      <StyledPopoverWrapper
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        transparent={transparent}
        effect={effect}
        isOpaque={!transparent && !minimal}
        intent={intent}
        flat={flat}
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
        <StyledPopoverContent isString={isString(content)}>
          {isString(content) ? (
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
    </ReqoreThemeProvider>
  );
};

export default InternalPopover;
