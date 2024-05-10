import React, { forwardRef, Ref } from 'react';
import ReqoreTag, { IReqoreCustomTagProps } from '../Tag';

export interface IReqoreLabelProps
  extends IReqoreCustomTagProps,
    Omit<React.ComponentPropsWithoutRef<'label'>, 'color'> {}

export const ReqoreLabel = forwardRef((props: IReqoreLabelProps, ref: Ref<HTMLLabelElement>) => {
  return <ReqoreTag as='label' color='transparent' {...props} ref={ref} />;
});
