import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { IReqoreBreadcrumbItem } from '.';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreButton from '../Button';

export interface IReqoreBreadcrumbItemProps extends IReqoreBreadcrumbItem {
  interactive?: boolean;
  size?: TSizes;
  /**
   * Internal: the trail's observer of its crumbs' sizes. The crumb is observed while it is drawn, so
   * the trail can measure again what fits when a crumb changes width after it was measured.
   */
  resizeObserver?: ResizeObserver;
}

export interface IReqoreBreadcrumbItemStyle extends IReqoreBreadcrumbItemProps {
  theme: IReqoreTheme;
}

const ReqoreBreadcrumbsItem = forwardRef<HTMLButtonElement, IReqoreBreadcrumbItemProps>(
  (
    // `interactive` is not a button prop; a button rendered `as` a router link would hand it on.
    {
      label,
      props,
      as,
      customTheme,
      interactive: _interactive,
      resizeObserver,
      ...rest
    }: IReqoreBreadcrumbItemProps,
    ref
  ) => {
    const theme = useReqoreTheme('main', customTheme);
    const element = useRef<HTMLButtonElement | null>(null);
    // The element the crumb is drawn as, handed on to the caller's ref. A button sets its refs after it
    // renders, and never unsets them, so the crumb observes its element in an effect of its own - which
    // runs after the button's, and is undone when the crumb goes.
    const setElement = useCallback(
      (node: HTMLButtonElement | null) => {
        element.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      const node = element.current;

      if (!node || !resizeObserver) {
        return undefined;
      }

      // the border box: a crumb that grows by its padding keeps its content box
      resizeObserver.observe(node, { box: 'border-box' });

      return () => resizeObserver.unobserve(node);
    }, [resizeObserver]);

    return (
      <ReqoreButton
        as={as}
        ref={setElement}
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
