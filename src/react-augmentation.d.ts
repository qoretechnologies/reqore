import 'react';

declare module 'react' {
  function forwardRef<T, P = Record<string, any>>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}
