import { size } from 'lodash';
import React, { MutableRefObject, useEffect, useState } from 'react';
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

  const handleClick = (event: MouseEvent) => {
    console.log(popovers);
    popovers.forEach(({ popperRef, closeOnAnyClick, closeOnOutsideClick, id, targetElement }) => {
      console.log(
        closeOnAnyClick,
        closeOnOutsideClick,
        popperRef?.current && !popperRef.current.contains(event.target),
        !targetElement?.contains(event.target as Node)
      );
      console.log(
        closeOnAnyClick ||
          (closeOnOutsideClick &&
            popperRef?.current &&
            !popperRef.current.contains(event.target) &&
            !targetElement?.contains(event.target as Node))
      );
      if (
        closeOnAnyClick ||
        (closeOnOutsideClick &&
          popperRef?.current &&
          !popperRef.current.contains(event.target) &&
          !targetElement?.contains(event.target as Node))
      ) {
        console.log('should close popover with id: ', id);
        setPopovers((cur: IPopoverData[]) => [...cur].filter((p) => p.id !== id));
      }
    });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      console.log('removing handle click');
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
        removePopover: (popoverId: string) => {
          setPopovers((cur: IPopoverData[]) => [...cur].filter((p) => p.id !== popoverId));
        },
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
