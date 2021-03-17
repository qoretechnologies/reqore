import { Placement } from "@popperjs/core";
import React, { forwardRef, useRef } from "react";
import styled from "styled-components";
import { PADDING_FROM_SIZE, SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from "../../constants/sizes";
import { IReqoreTheme } from "../../constants/theme";
import { changeLightness, getReadableColor } from "../../helpers/colors";
import { useCombinedRefs } from "../../hooks/useCombinedRefs";
import usePopover from "../../hooks/usePopover";
import { IReqoreIconName } from "../../types/icons";
import ReqoreIcon from "../Icon";

export interface IReqoreButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: IReqoreIconName;
  size?: TSizes;
  minimal?: boolean;
  disabled?: boolean;
  tooltip?: string | number;
  tooltipPlacement?: Placement;
  fluid?: boolean;
  fixed?: boolean;
}

export interface IReqoreButtonStyle extends IReqoreButtonProps {
  theme: IReqoreTheme;
}

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 500;
  border: ${({ theme, minimal }) =>
    !minimal ? `1px solid ${changeLightness(theme.main, 0.2)}` : 0};
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;

  flex: ${({ fluid, fixed }) => fixed ? '0 auto' : fluid ? '1' : undefined};

  border-radius: 3px;

  background-color: ${({ minimal, theme }) => {
    if (minimal) {
      return "transparent";
    }

    return changeLightness(theme.main, 0.1);
  }};

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};

  &:not(:disabled) {
    cursor: pointer;
    transition: all 0.1s linear;

    &:hover {
      background-color: ${({ minimal, theme }) =>
        minimal ? changeLightness(theme.main, 0.09) : undefined};
      color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
      border-color: ${({ minimal, theme }) =>
        minimal ? undefined : changeLightness(theme.main, 0.3)};
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus,
  &:active {
    outline: none;
  }

  &:focus {
    border-color: ${({ minimal, theme }) =>
        minimal ? undefined : changeLightness(theme.main, 0.3)};
  }
`;

const ReqoreButton = forwardRef(
  (
    {
      icon,
      size = "normal",
      minimal,
      children,
      tooltip,
      tooltipPlacement,
      className,
      fluid,
      fixed,
      ...rest
    }: IReqoreButtonProps,
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);

    usePopover(
      combinedRef.current,
      tooltip,
      undefined,
      tooltipPlacement,
      !!tooltip
    );

    return (
      <StyledButton
        {...rest}
        fluid={fluid}
        fixed={fixed}
        minimal={minimal}
        size={size}
        className={`${className || ""} reqore-control reqore-button`}
        ref={combinedRef}
        tabIndex={1}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            margin={children ? "right" : undefined}
            size={`${TEXT_FROM_SIZE[size]}px`}
          />
        )}
        {children}
      </StyledButton>
    );
  }
);

export default ReqoreButton;
