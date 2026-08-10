import { size } from 'lodash';
import { memo } from 'react';
import { IReqorePanelProps } from '.';
import { ReqoreButton } from '../..';
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
  isSmall: boolean;
  /** Tooltip for the collapse control when the panel is expanded. Defaults to `'Collapse'`. */
  collapseTooltip?: string;
  /** Tooltip for the collapse control when the panel is collapsed. Defaults to `'Expand'`. */
  expandTooltip?: string;
  /** Tooltip for the close (`×`) control. Defaults to `'Close'`. */
  closeTooltip?: string;
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
    isSmall,
    collapseTooltip = 'Collapse',
    expandTooltip = 'Expand',
    closeTooltip = 'Close',
    ...rest
  }: IReqorePanelNonResponsiveActionsProps) => {
    if (!show || (!size(children) && !showControlButtons)) {
      return null;
    }

    return (
      <ReqoreControlGroup
        fixed={isSmall ? false : hasResponsiveActions}
        fluid={isSmall}
        horizontalAlign='flex-end'
        verticalAlign='center'
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
            tooltip={isCollapsed ? expandTooltip : collapseTooltip}
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
            tooltip={closeTooltip}
            {...closeButtonProps}
          />
        ) : null}
      </ReqoreControlGroup>
    );
  }
);
