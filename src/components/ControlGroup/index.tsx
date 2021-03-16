import React from "react";
import styled from "styled-components";
import { TSizes } from "../../constants/sizes";
import { IReqoreTheme } from "../../constants/theme";

export interface IReqoreControlGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  stack?: boolean;
  minimal?: boolean;
  size?: TSizes;
  children: any;
}

export interface IReqoreControlGroupStyle extends IReqoreControlGroupProps {
  theme: IReqoreTheme;
}

const StyledControlGroup = styled.div<IReqoreControlGroupStyle>`
  display: flex;

  > .reqore-control,
  * {
    &:not(:last-child) {
      margin-right: ${({ stack }) => (!stack ? "5px" : undefined)};
    }

    border-radius: ${({ stack }) => (!stack ? undefined : 0)};

    &:first-child {
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }

    &:last-child {
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
`;

const ReqoreControlGroup = ({
  children,
  className,
  minimal,
  size = "normal",
  ...rest
}: IReqoreControlGroupProps) => (
  <StyledControlGroup
    {...rest}
    className={`${className || ""} reqore-control-group`}
  >
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        minimal: minimal || child.props?.minimal,
        size,
      })
    )}
  </StyledControlGroup>
);

export default ReqoreControlGroup;
