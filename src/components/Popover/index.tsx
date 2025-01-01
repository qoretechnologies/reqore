import { Placement } from '@popperjs/core';
import React, { forwardRef, memo, MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { useReqoreProperty } from '../..';
import { IReqoreOptions } from '../../containers/UIProvider';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import {
  IReqoreComponent,
  IReqoreIntent,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import InternalPopover from '../InternalPopover';

export interface IReqorePopoverProps extends IReqoreComponent, IPopoverOptions {
  component: any;
  componentProps?: any;
  children?: any;
  isReqoreComponent?: boolean;
  wrapperTag?: string;
  wrapperStyle?: React.CSSProperties;
}

export interface IPopoverControls {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

export interface IPopover
  extends IReqoreIntent,
    IWithReqoreMinimal,
    IWithReqoreEffect,
    IWithReqoreFlat {
  content?: JSX.Element | string | undefined;
  handler?: 'hover' | 'click' | 'focus' | 'hoverStay';
  placement?: Placement;
  show?: boolean;
  openOnMount?: boolean;
  noArrow?: boolean;
  noWrapper?: boolean;
  useTargetWidth?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnAnyClick?: boolean;
  closeOnInsideClick?: boolean;
  closeOnTargetClick?: boolean;
  delay?: number;
  blur?: boolean;
  transparent?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  icon?: IReqoreIconName;
  title?: string;
  updater?: string | number;
  uiScale?: IReqoreOptions['uiScale'];

  onToggleChange?: (isOpen: boolean, popoverData?: IPopover) => void;
  onUpdate?: (popoverData: IPopover) => void;
}

export interface IPopoverOptions extends IPopover {
  targetElement?: HTMLElement;
  passPopoverData?: (data: IPopoverControls) => void;
}

export interface IPopoverData extends IPopoverOptions {
  popperRef?: MutableRefObject<any>;
}

export const StyledPopover = styled.span`
  overflow: hidden;
`;

const startEvents = {
  hover: 'mouseenter',
  hoverStay: 'mouseenter',
  click: 'click',
  focus: 'focusin',
};

const endEvents = {
  hover: 'mouseleave',
  hoverStay: null,
  click: null,
  focus: null,
};

export const ReqorePopover = memo(
  forwardRef(
    (
      {
        component: Component,
        componentProps,
        children,
        isReqoreComponent,
        wrapperTag = 'span',
        wrapperStyle = {},
        passPopoverData,
        _insidePopover,
        _popoverId,
        content,
        blur,
        closeOnOutsideClick = true,
        closeOnInsideClick = true,
        closeOnTargetClick,
        handler = 'hover',
        delay,
        noArrow,
        noWrapper,
        useTargetWidth,
        placement,
        openOnMount,
        transparent,
        maxWidth,
        maxHeight,
        icon,
        title,
        onToggleChange,
        onUpdate,
        effect,
        flat,
        minimal,
        intent,
      }: IReqorePopoverProps,
      ref
    ) => {
      const tooltips = useReqoreProperty('tooltips');
      const closePopoversOnEscPress = useReqoreProperty('closePopoversOnEscPress');

      const { targetRef } = useCombinedRefs(ref);
      const [componentRef, setComponentRef] = React.useState(null);
      const popperRef = useRef(null);

      const [isOpen, setIsOpen] = React.useState(false);

      let { current: timeout }: MutableRefObject<any> = useRef(0);
      const startEvent = startEvents[handler];
      const endEvent = endEvents[handler];

      const open = useCallback(() => {
        if (isOpen) {
          if (handler !== 'hoverStay' && handler !== 'focus') {
            if (closeOnInsideClick) {
              close();
            }
          }
        } else {
          const globalDelay =
            handler === 'hover' || handler === 'hoverStay' ? delay ?? tooltips.delay : delay;

          if (globalDelay) {
            timeout = setTimeout(() => {
              setIsOpen(true);
            }, globalDelay);
          } else {
            setIsOpen(true);
          }
        }
      }, [isOpen, handler, closeOnInsideClick, delay, tooltips.delay]);

      const close = useCallback(() => {
        cancelTimeout();
        setIsOpen(false);
      }, []);

      const handleClick = useCallback(
        (event: MouseEvent) => {
          if (handler === 'hover') {
            close();
            return;
          }

          if (
            closeOnOutsideClick &&
            !(popperRef?.current && popperRef.current.contains(event.target)) &&
            !componentRef?.contains(event.target as Node)
          ) {
            close();
          }
        },
        [closeOnOutsideClick, componentRef, popperRef.current, closeOnTargetClick]
      );

      const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          close();
        }
      }, []);

      useUpdateEffect(() => {
        onToggleChange?.(isOpen, { content });
      }, [isOpen]);

      useUpdateEffect(() => {
        onUpdate?.({ content });
      }, [content]);

      useEffect(() => {
        passPopoverData?.({
          close,
          open,
          isOpen: () => isOpen,
        });
      }, [isOpen]);

      useEffect(() => {
        if (!content) {
          close();
        }
      }, [content]);

      useEffect(() => {
        if (componentRef && openOnMount) {
          open();
        }
      }, [!!componentRef, openOnMount]);

      useUnmount(() => {
        cancelTimeout();
        onToggleChange?.(false);
      });

      const cancelTimeout = useCallback(() => {
        clearTimeout(timeout);
        timeout = null;
      }, []);

      const handlePopperUpdate = useCallback((internalPopperRef) => {
        popperRef.current = internalPopperRef.current;
      }, []);

      useEffect(() => {
        if (componentRef && content) {
          document.addEventListener('click', handleClick, true);

          if (closePopoversOnEscPress) {
            document.addEventListener('keydown', handleKeyDown);
          }

          componentRef.addEventListener(startEvent, open);

          if (endEvent) {
            componentRef.addEventListener(endEvent, close);
          }

          if (handler === 'hoverStay') {
            componentRef.addEventListener('mouseleave', cancelTimeout);
          }
        }

        return () => {
          cancelTimeout();

          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('keydown', handleKeyDown);

          componentRef?.removeEventListener(startEvent, open);

          if (endEvent) {
            componentRef?.removeEventListener(endEvent, close);
          }

          if (handler === 'hoverStay') {
            componentRef?.removeEventListener('mouseleave', cancelTimeout);
          }
        };
      }, [componentRef, content]);

      const handleRef = useCallback((r) => {
        setComponentRef(r);
        targetRef.current = r;
      }, []);

      if (isReqoreComponent) {
        return (
          <>
            {isOpen && (
              <InternalPopover
                targetElement={componentRef}
                content={content}
                placement={placement}
                noArrow={noArrow}
                noWrapper={noWrapper}
                useTargetWidth={useTargetWidth}
                transparent={transparent}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                intent={intent}
                title={title}
                icon={icon}
                minimal={minimal}
                flat={flat}
                effect={effect}
                closePopover={close}
                onPopperClose={close}
                onPopperUpdate={handlePopperUpdate}
              />
            )}
            {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
            <Component
              {...componentProps}
              className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} ${
                componentProps?.className || ''
              }`}
              _insidePopover={_insidePopover}
              _popoverId={_popoverId}
              ref={handleRef}
            >
              {children}
            </Component>
          </>
        );
      }

      return (
        <>
          {isOpen && (
            <InternalPopover
              targetElement={componentRef}
              content={content}
              placement={placement}
              noArrow={noArrow}
              noWrapper={noWrapper}
              useTargetWidth={useTargetWidth}
              transparent={transparent}
              maxWidth={maxWidth}
              maxHeight={maxHeight}
              intent={intent}
              title={title}
              icon={icon}
              minimal={minimal}
              flat={flat}
              effect={effect}
              onPopperClose={close}
              onPopperUpdate={handlePopperUpdate}
              closePopover={close}
            />
          )}
          {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
          <StyledPopover
            as={wrapperTag}
            className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} reqore-popover-wrapper`}
            ref={handleRef}
            style={wrapperStyle}
          >
            <Component {...componentProps} _insidePopover={_insidePopover} _popoverId={_popoverId}>
              {children}
            </Component>
          </StyledPopover>
        </>
      );
    }
  )
);
