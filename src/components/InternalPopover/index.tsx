import { Placement, VirtualElement } from '@popperjs/core';
import { darken } from 'polished';
import React, { MutableRefObject, useContext, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { getReadableColor } from '../../helpers/colors';
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
      background-color: ${theme.popover?.main || theme.main};
      box-shadow: 0px 0px 4px 1px
        ${darken(0.1, theme.popover?.main || theme.main)};
    `}
  }
`;

const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  ${({ theme }) => {
    const defaultColor: string = theme.popover?.main || theme.main;

    return css`
      background-color: ${defaultColor};
      color: ${getReadableColor(defaultColor)};
      border-radius: 3.5px;
      box-shadow: 0px 0px 4px 1px
        ${darken(0.1, theme.popover?.main || theme.main)};
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
`;

const StyledPopoverContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  z-index: 20;
  position: relative;
  background-color: ${({ theme }) => theme.popover?.main || theme.main};
  border-radius: 3.5px;
`;

export interface IReqoreInternalPopoverProps {
  element: Element | VirtualElement;
  content: JSX.Element | string | number;
  id: string;
  placement?: Placement;
}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = ({
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
        <StyledPopoverContent>{content}</StyledPopoverContent>
      </StyledPopoverWrapper>
    </ReqoreThemeProvider>
  );
};

export default InternalPopover;
