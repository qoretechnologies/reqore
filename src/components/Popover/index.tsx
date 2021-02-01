import { Placement, VirtualElement } from '@popperjs/core';
import React, { MutableRefObject, useContext, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import useOutsideClick from '../../hooks/useOutsideClick';

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
      background-color: ${theme.popover?.main ||
      changeLightness(theme.main, 0.02)};
    `}
  }
`;

const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  ${({ theme }) => {
    const defaultColor: string =
      theme.popover?.main || changeLightness(theme.main, 0.02);

    return css`
      padding: 10px;
      background-color: ${defaultColor};
      color: ${getReadableColor(defaultColor)};
      font-size: 11px;
      border-radius: 3.5px;
      z-index: 9999;
      box-shadow: 0px 0px 6px 0px #999;
    `;
  }}

  &[data-popper-placement^='top'] > ${StyledPopoverArrow} {
    bottom: -4px;
  }

  &[data-popper-placement^='bottom'] > ${StyledPopoverArrow} {
    top: -4px;
  }

  &[data-popper-placement^='left'] > ${StyledPopoverArrow} {
    right: -4px;
  }

  &[data-popper-placement^='right'] > ${StyledPopoverArrow} {
    left: -4px;
}
`;

export interface IReqorePopoverProps {
  element: Element | VirtualElement;
  content: JSX.Element | string;
  id: string;
  placement?: Placement;
}

const Popover: React.FC<IReqorePopoverProps> = ({
  element,
  content = 'Popover',
  id,
  placement,
}) => {
  const { removePopover } = useContext(PopoverContext);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);

  const popperRef: MutableRefObject<any> = useRef(null);
  const { styles, attributes } = usePopper(element, popperElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrowElement,
        },
      },
    ],
  });

  useOutsideClick(popperRef, () => {
    removePopover(id);
  });

  return (
    <ReqoreThemeProvider>
      <StyledPopoverWrapper
        className='reqore-popover-content'
        ref={(el) => {
          setPopperElement(el);
          popperRef.current = el;
        }}
        style={styles.popper}
        {...attributes.popper}
      >
        <StyledPopoverArrow
          ref={setArrowElement}
          style={styles.arrow}
          data-popper-arrow
        />
        {content}
      </StyledPopoverWrapper>
    </ReqoreThemeProvider>
  );
};

export default Popover;
