import { isString } from 'lodash';
import React, { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { IPopoverData } from '../../containers/PopoverProvider';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { fadeIn } from '../../helpers/animations';
import { getReadableColor } from '../../helpers/colors';

const StyledPopoverArrow = styled.div<{ theme: IReqoreTheme }>`
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: -1;

  &:before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
    transform: rotate(45deg);
    ${({ theme }) => css`
      background-color: ${theme.popover?.main || theme.main};
      box-shadow: rgba(31, 26, 34, 0.6) 0px 0px 4px;
    `}
  }
`;

const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  animation: 0.2s ${fadeIn} ease-out;

  ${({ theme }) => {
    const defaultColor: string = theme.popover?.main || theme.main;

    return css`
      z-index: 999999;
      background-color: ${defaultColor};
      color: ${getReadableColor(theme, undefined, undefined, false, defaultColor)};
      border-radius: 3.5px;
      box-shadow: rgba(31, 26, 34, 0.6) 0px 0px 4px;
    `;
  }}

  &[data-popper-placement^='top'] > ${StyledPopoverArrow} {
    bottom: -5px;
  }

  &[data-popper-placement^='bottom'] > ${StyledPopoverArrow} {
    top: -5px;
  }

  &[data-popper-placement^='left'] > ${StyledPopoverArrow} {
    right: -5px;
  }

  &[data-popper-placement^='right'] > ${StyledPopoverArrow} {
    left: -5px;
  }

  &[data-popper-reference-hidden='true'] {
    visibility: hidden;
    pointer-events: none;
  }
`;

const StyledPopoverContent = styled.div<{ isString?: boolean }>`
  width: 100%;
  height: 100%;
  padding: ${({ isString }) => (isString ? '8px' : '0px')};
  z-index: 20;
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.popover?.main || theme.main};
  border-radius: 3.5px;

  .reqore-popover-text {
    font-size: 14px;
  }
`;

export interface IReqoreInternalPopoverProps extends IPopoverData {}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = ({
  targetElement,
  content,
  id,
  placement,
  noArrow,
  useTargetWidth,
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
      <StyledPopoverWrapper
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
        {!noArrow && (
          <StyledPopoverArrow ref={setArrowElement} style={styles.arrow} data-popper-arrow />
        )}
        <StyledPopoverContent isString={isString(content)}>
          {isString(content) ? (
            <span className='reqore-popover-text'>{content}</span>
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
