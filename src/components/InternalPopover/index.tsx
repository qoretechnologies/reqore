import { Placement, VirtualElement } from "@popperjs/core";
import { isString } from "lodash";
import React, { MutableRefObject, useContext, useRef, useState } from "react";
import { usePopper } from "react-popper";
import styled, { css } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import PopoverContext from "../../context/PopoverContext";
import { changeLightness, getReadableColor } from "../../helpers/colors";
import useOutsideClick from "../../hooks/useOutsideClick";

const StyledPopoverArrow = styled.div<{ theme: IReqoreTheme }>`
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: -1;

  &:before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
    transform: rotate(45deg);
    ${({ theme }) => css`
      background-color: ${theme.popover?.main ||
      changeLightness(theme.main, 0.15)};
      box-shadow: rgba(31, 26, 34, 0.6) 0px 0px 4px;
    `}
  }
`;

const StyledPopoverWrapper = styled.div<{ theme: IReqoreTheme }>`
  ${({ theme }) => {
    const defaultColor: string =
      theme.popover?.main || changeLightness(theme.main, 0.15);

    return css`
      z-index: 999999;
      background-color: ${defaultColor};
      color: ${getReadableColor(
        theme,
        undefined,
        undefined,
        false,
        defaultColor
      )};
      border-radius: 3.5px;
      box-shadow: rgba(31, 26, 34, 0.6) 0px 0px 4px;
    `;
  }}

  &[data-popper-placement^='top'] > ${StyledPopoverArrow} {
    bottom: -5px;
  }

  &[data-popper-placement^="bottom"] > ${StyledPopoverArrow} {
    top: -5px;
  }

  &[data-popper-placement^="left"] > ${StyledPopoverArrow} {
    right: -5px;
  }

  &[data-popper-placement^="right"] > ${StyledPopoverArrow} {
    left: -5px;
  }
`;

const StyledPopoverContent = styled.div<{ isString?: boolean }>`
  width: 100%;
  height: 100%;
  padding: ${({ isString }) => (isString ? "8px" : "5px")};
  z-index: 20;
  position: relative;
  background-color: ${({ theme }) =>
    theme.popover?.main || changeLightness(theme.main, 0.15)};
  border-radius: 3.5px;

  .reqore-popover-text {
    font-size: 14px;
  }
`;

export interface IReqoreInternalPopoverProps {
  element: Element | VirtualElement;
  content: JSX.Element | string | number | any;
  id: string;
  placement?: Placement;
}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = ({
  element,
  content = "Popover",
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
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
      {
        name: "arrow",
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
        className="reqore-popover-content"
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
        <StyledPopoverContent isString={isString(content)}>
          {isString(content) ? (
            <span className="reqore-popover-text">{content}</span>
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
