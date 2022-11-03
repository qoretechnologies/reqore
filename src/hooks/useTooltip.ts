import { useEffect, useState } from 'react';
import { IReqoreTooltip, TReqoreTooltipProp } from '../types/global';
import usePopover from './usePopover';

export const useTooltip = (
  targetElement: HTMLElement | undefined,
  tooltip?: TReqoreTooltipProp
): void => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined);
  const [data, setData] = useState<string | IReqoreTooltip | undefined>(undefined);

  useEffect(() => {
    if (targetElement && tooltip) {
      setElement(targetElement);
      setData(tooltip);
    }
  }, [targetElement?.toString(), JSON.stringify(tooltip)]);

  const popoverData = typeof data === 'string' ? { content: data } : data;

  usePopover({
    ...popoverData,
    targetElement: element,
    show: !!popoverData?.content,
  });
};
