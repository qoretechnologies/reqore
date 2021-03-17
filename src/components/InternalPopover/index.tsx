import { isString } from "lodash";
import React, { MutableRefObject, useContext, useRef, useState } from "react";
import { usePopper } from "react-popper";
import styled, { css, keyframes } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import { IPopoverData } from "../../containers/PopoverProvider";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import PopoverContext from "../../context/PopoverContext";
import { changeLightness, getReadableColor } from "../../helpers/colors";
import useOutsideClick from "../../hooks/useOutsideClick";

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100%{ 
    opacity: 1;
  }
`;

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
  animation: 0.1s ${fadeIn} ease-in;

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

export interface IReqoreInternalPopoverProps extends IPopoverData {}

const InternalPopover: React.FC<IReqoreInternalPopoverProps> = ({
  targetElement,
  content,
  id,
  placement,
  noArrow,
  useTargetWidth,
  closeOnOutsideClick,
}) => {
  const { removePopover } = useContext(PopoverContext);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);

  const popperRef: MutableRefObject<any> = useRef(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, noArrow ? -1 : 10],
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
    if (closeOnOutsideClick) {
      removePopover(id);
    }
  });

  return (
    <ReqoreThemeProvider>
      <StyledPopoverWrapper
        className="reqore-popover-content"
        ref={(el) => {
          setPopperElement(el);
          popperRef.current = el;
        }}
        style={{
          ...styles.popper,
          width:
            useTargetWidth &&
            (targetElement?.getBoundingClientRect()?.width || undefined),
        }}
        {...attributes.popper}
      >
        {!noArrow && (
          <StyledPopoverArrow
            ref={setArrowElement}
            style={styles.arrow}
            data-popper-arrow
          />
        )}
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
