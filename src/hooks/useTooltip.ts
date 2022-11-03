import { IReqoreTooltip } from '../types/global';
import usePopover from './usePopover';

export const useTooltip = (
  targetElement: HTMLElement | undefined,
  tooltip?: string | IReqoreTooltip
): void => {
  if (!tooltip) return;

  const popoverData = typeof tooltip === 'string' ? { content: tooltip } : tooltip;

  usePopover({
    ...popoverData,
    targetElement,
    show: !!popoverData?.content,
  });
};
