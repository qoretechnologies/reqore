import { omit } from 'lodash';
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
        // The popover draws the tooltip; a DOM element (`Component='div'`) has no use for it
        // and would render it as a `tooltip` attribute.
        componentProps={typeof Component === 'string' ? omit(rest, ['tooltip']) : rest}
      >
        {rest.children}
      </ReqorePopover>
    );
  })
);
