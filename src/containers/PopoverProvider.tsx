import { size } from 'lodash';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
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

  const handleClick = useCallback(
    (event: MouseEvent) => {
      popovers.forEach(({ popperRef, closeOnAnyClick, closeOnOutsideClick, id, targetElement }) => {
        if (
          closeOnAnyClick ||
          (closeOnOutsideClick &&
            popperRef?.current &&
            !popperRef.current.contains(event.target) &&
            !targetElement?.contains(event.target as Node))
        ) {
          removePopover(id);
        }
      });
    },
    [popovers]
  );

  const removePopover = (id: string) => {
    setPopovers((cur: IPopoverData[]) => [...cur].filter((p) => p.id !== id));
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [popovers]);

  useEffect(() => {
    if (!size(popovers)) {
      document.removeEventListener('click', handleClick);
    }
  }, [popovers]);

  return (
    <PopoverContext.Provider
      value={{
        uiScale,
        addPopover: (popoverData: IPopoverData) => {
          setPopovers((cur: IPopoverData[]) => [...cur, popoverData]);
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
        },
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
