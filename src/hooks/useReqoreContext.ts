import { useContextSelector } from 'use-context-selector';
import ReqoreContext, { IReqoreContext } from '../context/ReqoreContext';

export const useReqoreProperty = <T extends keyof IReqoreContext>(
  property: T
): IReqoreContext[T] => {
  const contextProperty = useContextSelector(ReqoreContext, (value) => {
    if (!(property in value)) {
      throw new Error(`Reqore context property ${property} not found`);
    }

    return value[property];
  });

  return contextProperty;
};
