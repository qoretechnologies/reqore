import React from "react";
import styled from "styled-components";
import ReqoreButton, { IReqoreButtonProps } from "../Button";

export interface IReqoreInputClearButtonProps extends IReqoreButtonProps {
  show: boolean;
  enabled: boolean;
}

export const StyledInputClearButton = styled(ReqoreButton)<{ show?: boolean }>`
  position: absolute;
  right: ${({ show }) => (show ? 0 : -40)}px;
  top: 0;
  opacity: ${({ show }) => (show ? 0.2 : 0)};
`;

const ReqoreInputClearButton = ({
  show,
  enabled,
  size = "normal",
  ...rest
}: IReqoreInputClearButtonProps) =>
  enabled ? (
    <StyledInputClearButton
      {...rest}
      className="reqore-clear-input-button"
      icon="CloseLine"
      minimal
      tabIndex={show ? 1 : -1}
      size={size}
      show={show}
    />
  ) : null;

export default ReqoreInputClearButton;
