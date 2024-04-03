import { useEffect, useMemo, useState } from 'react';
import { IReqoreTooltip, TReqoreTooltipProp } from '../types/global';
import usePopover from './usePopover';

export const useTooltip = (
  targetElement: HTMLElement | undefined,
  tooltip?: TReqoreTooltipProp
): void => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined);
  const [data, setData] = useState<string | IReqoreTooltip | undefined>(undefined);
  const content = useMemo(
    () => (typeof tooltip === 'object' ? tooltip?.content : tooltip),
    [tooltip]
  );

  useEffect(() => {
    if (!content) {
      setElement(targetElement);
      setData(undefined);
    } else {
      setElement(targetElement);
      setData(tooltip);
    }
  }, [content]);

  useEffect(() => {
    if (targetElement) {
      setElement(targetElement);
      setData(tooltip);
    }
  }, [targetElement]);

  const popoverData = typeof data === 'string' ? { content: data } : data;

  usePopover({
    ...popoverData,
    targetElement: element,
    show: !!popoverData?.content,
  });
};
