import { memo } from 'react';
import { IReqorePanelProps } from '.';
import { ReqoreButton, useReqoreProperty } from '../..';
import { IWithReqoreCustomTheme } from '../../types/global';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';

export interface IReqorePanelNonResponsiveActionsProps
  extends IWithReqoreCustomTheme,
    Omit<IReqoreControlGroupProps, 'children'> {
  onCollapseClick?: () => void;
  onCloseClick?: () => void;
  hasResponsiveActions?: boolean;
  isCollapsed?: boolean;
  showControlButtons?: boolean;
  show?: boolean;
  children?: IReqoreControlGroupProps['children'] | undefined;
  closeButtonProps?: IReqorePanelProps['closeButtonProps'];
  collapseButtonProps?: IReqorePanelProps['collapseButtonProps'];
}

export const ReqorePanelNonResponsiveActions = memo(
  ({
    onCollapseClick,
    onCloseClick,
    hasResponsiveActions,
    isCollapsed,
    customTheme,
    children,
    showControlButtons,
    show,
    collapseButtonProps,
    closeButtonProps,
    ...rest
  }: IReqorePanelNonResponsiveActionsProps) => {
    const isMobile = useReqoreProperty('isMobile');

    if (!show) {
      return null;
    }

    return (
      <ReqoreControlGroup
        fixed={isMobile ? false : hasResponsiveActions}
        fluid={isMobile ? true : !hasResponsiveActions}
        horizontalAlign='flex-end'
        {...rest}
      >
        {children}
        {!!onCollapseClick && showControlButtons ? (
          <ReqoreButton
            customTheme={customTheme}
            icon={isCollapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
            onClick={(e) => {
              e.stopPropagation();
              onCollapseClick();
            }}
            tooltip={isCollapsed ? 'Expand' : 'Collapse'}
            fixed
            {...collapseButtonProps}
          />
        ) : null}
        {!!onCloseClick && showControlButtons ? (
          <ReqoreButton
            fixed
            customTheme={customTheme}
            icon='CloseLine'
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onCloseClick();
            }}
            tooltip='Close'
            {...closeButtonProps}
          />
        ) : null}
      </ReqoreControlGroup>
    );
  }
);
