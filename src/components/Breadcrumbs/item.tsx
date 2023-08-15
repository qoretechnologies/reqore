import { forwardRef } from 'react';
import { IReqoreBreadcrumbItem } from '.';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreButton from '../Button';

export interface IReqoreBreadcrumbItemProps extends IReqoreBreadcrumbItem {
  interactive?: boolean;
  size?: TSizes;
}

export interface IReqoreBreadcrumbItemStyle extends IReqoreBreadcrumbItemProps {
  theme: IReqoreTheme;
}

const ReqoreBreadcrumbsItem = forwardRef<HTMLButtonElement, IReqoreBreadcrumbItemProps>(
  ({ label, props, as, customTheme, ...rest }: IReqoreBreadcrumbItemProps, ref) => {
    const theme = useReqoreTheme('breadcrumbs', customTheme);

    return (
      <ReqoreButton
        as={as}
        ref={ref}
        className='reqore-breadcrumbs-item'
        customTheme={theme}
        minimal
        flat
        {...rest}
        {...props}
        onClick={(e) => {
          e.persist();
          e.stopPropagation();

          rest.onClick?.(e);
        }}
      >
        {label}
      </ReqoreButton>
    );
  }
);

export default ReqoreBreadcrumbsItem;
