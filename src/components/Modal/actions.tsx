import styled from 'styled-components';
import { IReqoreNavbarProps, StyledNavbar } from '../Navbar';
import ReqoreNavbarGroup, { IReqoreNavbarGroupProps } from '../Navbar/group';

const StyledActions = styled(StyledNavbar)`
  background-color: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
`;

export const ReqoreModalActionsGroup = ({
  children,
  className,
  ...rest
}: IReqoreNavbarGroupProps) => (
  <ReqoreNavbarGroup {...rest} className={`${className || ''} reqore-modal-actions-group`}>
    {children}
  </ReqoreNavbarGroup>
);

export const ReqoreModalActions = ({ children, className, ...rest }: IReqoreNavbarProps) => (
  <StyledActions {...rest} className={`${className || ''} reqore-modal-actions`}>
    {children}
  </StyledActions>
);
