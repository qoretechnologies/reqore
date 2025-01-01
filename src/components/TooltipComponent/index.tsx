import { forwardRef, memo } from 'react';
import { buildTooltipForComponents } from '../../helpers/utils';
import { TReqoreTooltipProp } from '../../types/global';
import { ReqorePopover } from '../Popover';

export interface ITooltipComponentProps {
  tooltip?: TReqoreTooltipProp;
  Component: React.FC<any>;
  [key: string]: unknown;
}

export const ReqoreTooltipComponent = memo(
  forwardRef(({ Component, ...rest }: ITooltipComponentProps, ref) => {
    if (!rest.tooltip) {
      return <Component {...rest} ref={ref} />;
    }

    return (
      <ReqorePopover
        {...buildTooltipForComponents(rest.tooltip)}
        component={Component}
        isReqoreComponent
        ref={ref}
        componentProps={rest}
      >
        {rest.children}
      </ReqorePopover>
    );
  })
);
