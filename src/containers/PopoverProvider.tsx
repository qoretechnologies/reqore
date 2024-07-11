import { size } from 'lodash';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { useReqoreProperty } from '..';
import Popover from '../components/InternalPopover';
import PopoverContext from '../context/PopoverContext';
import { IPopoverOptions } from '../hooks/usePopover';

export interface IReqorePopoverProviderProps {
  children: any;
  uiScale?: number;
}

export interface IPopoverData extends IPopoverOptions {
  id: string;
  popperRef?: MutableRefObject<any>;
}

const PopoverProvider: React.FC<IReqorePopoverProviderProps> = ({ children, uiScale }) => {
  const [popovers, setPopovers] = useState<IPopoverData[]>([]);
  const closePopoversOnEscPress = useReqoreProperty('closePopoversOnEscPress');

  const handleClick = useCallback(
    (event: MouseEvent) => {
      popovers.forEach(({ popperRef, closeOnAnyClick, closeOnOutsideClick, id, targetElement }) => {
        if (closeOnAnyClick) {
          removePopover(id);
          return;
        }

        if (
          closeOnOutsideClick &&
          !(popperRef?.current && popperRef.current.contains(event.target)) &&
          !targetElement?.contains(event.target as Node)
        ) {
          removePopover(id);
        }
      });
    },
    [popovers]
  );

  // Close last popover when ESC is pressed
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const lastPopover = popovers[popovers.length - 1];

        if (lastPopover) {
          removePopover(lastPopover.id);
        }
      }
    },
    [popovers]
  );

  const removePopover = (id: string) => {
    // Get the popover
    const popover = popovers.find((p) => p.id === id);

    if (popover) {
      // Remove the blur
      if (popover.blur) {
        // Remove the blur
        document.getElementById(`reqore-blur-${id}`)?.remove();
        // Remove the z index class
        popover.targetElement.classList.remove('reqore-blur-z-index');
      }
      // Remove the popover
      setPopovers((cur: IPopoverData[]) => [...cur].filter((p) => p.id !== id));

      popover.onToggleChange?.(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    if (closePopoversOnEscPress) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popovers]);

  useEffect(() => {
    if (!size(popovers)) {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [popovers]);

  return (
    <PopoverContext.Provider
      value={{
        uiScale,
        addPopover: (popoverData: IPopoverData) => {
          setPopovers((cur: IPopoverData[]) => [...cur, popoverData]);
          popoverData.onToggleChange?.(true, popoverData);
        },
        updatePopover: (popoverId: string, popoverData: Partial<IPopoverData>) => {
          setPopovers((cur: IPopoverData[]) =>
            [...cur].reduce<IPopoverData[]>((newPopovers, popover) => {
              if (popover.id === popoverId) {
                return [...newPopovers, { ...popover, ...popoverData }];
              }

              return [...newPopovers, popover];
            }, [])
          );

          popoverData.onUpdate?.(popoverData);
        },
        isPopoverOpen: (popoverId: string) => !!popovers.find((p) => p.id === popoverId),
        removePopover,
        popovers,
      }}
    >
      {popovers.map((popover: IPopoverData) => (
        <Popover {...popover} key={popover.id} />
      ))}
      {children}
    </PopoverContext.Provider>
  );
};

export default PopoverProvider;
