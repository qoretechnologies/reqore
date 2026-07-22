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
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import InternalPopover from '../InternalPopover';

export interface IReqorePopoverProps
  extends IReqoreComponent,
    IWithReqoreCustomTheme,
    IPopoverOptions {
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
  keepOpenOnHover?: boolean;
  offsetX?: number;
  offsetY?: number;
  blur?: boolean;
  transparent?: boolean;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  icon?: IReqoreIconName;
  title?: string;
  updater?: string | number;
  uiScale?: IReqoreOptions['uiScale'];
  backgroundBlur?: number;

  id?: string;

  onBeforeOpen?: (popoverData: IPopover, e?: MouseEvent | KeyboardEvent) => boolean;
  onBeforeClose?: (popoverData: IPopover, e?: MouseEvent | KeyboardEvent) => boolean;
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
        content,
        blur,
        closeOnOutsideClick = true,
        closeOnInsideClick = true,
        closeOnTargetClick,
        handler = 'hover',
        delay,
        offsetX,
        offsetY,
        noArrow,
        noWrapper,
        useTargetWidth,
        placement,
        openOnMount,
        keepOpenOnHover,
        transparent,
        maxWidth,
        minWidth,
        maxHeight,
        icon,
        title,
        onBeforeClose,
        onBeforeOpen,
        onToggleChange,
        onUpdate,
        effect,
        flat,
        minimal,
        intent,
        id,
        updater,
        backgroundBlur,
        // `customTheme` is picked up so it can be forwarded to the
        // trigger `Component` below. Historically the popover's own
        // props were dropped on the floor, which meant a Popover
        // rendered inside a panel/action slot with a themed context
        // (e.g. an accent-themed toolbar) did NOT paint its trigger
        // with the surrounding theme — the sibling buttons inherited
        // the theme via `<Component customTheme={theme} />` in Panel,
        // but Popover swallowed it. Forwarding it here lets Popover
        // participate in the same theme cascade as every other
        // panel-action item without callers having to duplicate the
        // theme on `componentProps`.
        customTheme,
      }: IReqorePopoverProps,
      ref
    ) => {
      const tooltips = useReqoreProperty('tooltips');
      const closePopoversOnEscPress = useReqoreProperty('closePopoversOnEscPress');

      const { targetRef } = useCombinedRefs(ref);
      const [componentRef, setComponentRef] = React.useState(null);
      const popperRef = useRef(null);

      const [isOpen, setIsOpen] = React.useState(false);
      const timeoutRef = useRef<number | null>(null);
      const isTargetHovered = useRef(false);
      const isPopoverHovered = useRef(false);
      const closeTimeoutRef = useRef<number | null>(null);

      const startEvent = startEvents[handler];
      const endEvent = endEvents[handler];

      const cancelTimeout = useCallback(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      }, []);

      const attemptClose = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (keepOpenOnHover) {
            // Add a small delay before checking to allow hover state to update
            closeTimeoutRef.current = window.setTimeout(() => {
              if (!isTargetHovered.current && !isPopoverHovered.current) {
                setIsOpen(false);
              }
            }, 50);
          } else {
            if (onBeforeClose) {
              const shouldClose = onBeforeClose({ content }, e);

              if (!shouldClose) {
                return;
              }
            }

            setIsOpen(false);
          }
        },
        [keepOpenOnHover, onBeforeClose, content]
      );

      const close = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (onBeforeClose) {
            const shouldClose = onBeforeClose({ content }, e);

            if (!shouldClose) {
              return;
            }
          }

          cancelTimeout();
          isTargetHovered.current = false;
          isPopoverHovered.current = false;
          setIsOpen(false);
        },
        [cancelTimeout, onBeforeClose, content]
      );

      const open = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (onBeforeOpen) {
            const shouldOpen = onBeforeOpen({ content }, e);

            if (!shouldOpen) {
              return;
            }
          }

          // Cancel any pending close timeout when opening
          cancelTimeout();

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
              timeoutRef.current = window.setTimeout(() => {
                setIsOpen(true);
              }, globalDelay);
            } else {
              setIsOpen(true);
            }
          }
        },
        [
          isOpen,
          handler,
          closeOnInsideClick,
          delay,
          tooltips.delay,
          close,
          onBeforeOpen,
          content,
          cancelTimeout,
        ]
      );

      const handleClick = useCallback(
        (event: MouseEvent) => {
          const clickedInsidePopover =
            popperRef?.current && popperRef.current.contains(event.target);
          const clickedInsideTarget = componentRef?.contains(event.target as Node);

          // Special handling for hover handler with keepOpenOnHover
          if (handler === 'hover' && !keepOpenOnHover) {
            // Original behavior: close on any click
            close();
            return;
          }

          // If clicked inside popover, only close if closeOnInsideClick is true
          if (clickedInsidePopover) {
            if (closeOnInsideClick) {
              // Use setTimeout to ensure click handlers complete first
              setTimeout(() => close(), 0);
            }
            return;
          }

          // If clicked inside target, only close if closeOnTargetClick is true
          if (clickedInsideTarget) {
            if (closeOnTargetClick) {
              close();
            }
            return;
          }

          // Clicked outside both - close if closeOnOutsideClick is true
          if (closeOnOutsideClick) {
            close();
          }
        },
        [
          closeOnOutsideClick,
          closeOnInsideClick,
          closeOnTargetClick,
          componentRef,
          popperRef.current,
          close,
          handler,
          keepOpenOnHover,
        ]
      );

      const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            close();
          }
        },
        [close]
      );

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

      const handlePopperUpdate = useCallback((internalPopperRef) => {
        popperRef.current = internalPopperRef.current;
      }, []);

      const handleTargetMouseEnter = useCallback(
        (e: MouseEvent) => {
          isTargetHovered.current = true;
          cancelTimeout();
          open(e);
        },
        [open, cancelTimeout]
      );

      const handleTargetMouseLeave = useCallback(
        (e: MouseEvent) => {
          isTargetHovered.current = false;
          attemptClose(e);
        },
        [attemptClose]
      );

      const handlePopoverMouseEnter = useCallback(() => {
        isPopoverHovered.current = true;
        cancelTimeout();
      }, [cancelTimeout]);

      const handlePopoverMouseLeave = useCallback(() => {
        isPopoverHovered.current = false;
        attemptClose();
      }, [attemptClose]);

      useEffect(() => {
        if (componentRef && content) {
          // Use capture phase for click detection
          document.addEventListener('click', handleClick, true);

          if (closePopoversOnEscPress) {
            document.addEventListener('keydown', handleKeyDown);
          }

          if (keepOpenOnHover) {
            componentRef.addEventListener('mouseenter', handleTargetMouseEnter);
            componentRef.addEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            componentRef.addEventListener(startEvent, open);

            if (endEvent) {
              componentRef.addEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef.addEventListener('mouseleave', cancelTimeout);
            }
          }
        }

        return () => {
          cancelTimeout();

          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('keydown', handleKeyDown);

          if (keepOpenOnHover) {
            componentRef?.removeEventListener('mouseenter', handleTargetMouseEnter);
            componentRef?.removeEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            componentRef?.removeEventListener(startEvent, open);

            if (endEvent) {
              componentRef?.removeEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef?.removeEventListener('mouseleave', cancelTimeout);
            }
          }
        };
      }, [
        componentRef,
        content,
        handleClick,
        handleKeyDown,
        open,
        close,
        cancelTimeout,
        handler,
        keepOpenOnHover,
        handleTargetMouseEnter,
        handleTargetMouseLeave,
        closePopoversOnEscPress,
      ]);

      const handleRef = useCallback((r) => {
        setComponentRef(r);
        targetRef.current = r;
      }, []);

      // Theme props are meaningful to Reqore/custom components, but React
      // warns if they are forwarded to a native trigger such as `span`.
      const triggerThemeProps =
        typeof Component === 'string'
          ? {}
          : { customTheme: componentProps?.customTheme ?? customTheme };

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
                minWidth={minWidth}
                maxHeight={maxHeight}
                offsetX={offsetX}
                offsetY={offsetY}
                intent={intent}
                title={title}
                icon={icon}
                minimal={minimal}
                flat={flat}
                effect={effect}
                closePopover={close}
                onPopperClose={close}
                onPopperUpdate={handlePopperUpdate}
                id={id}
                updater={updater}
                handler={handler}
                backgroundBlur={backgroundBlur}
                onPopoverMouseEnter={keepOpenOnHover ? handlePopoverMouseEnter : undefined}
                onPopoverMouseLeave={keepOpenOnHover ? handlePopoverMouseLeave : undefined}
              />
            )}
            {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
            <Component
              // Forward the popover's own `customTheme` to the trigger
              // so it inherits the surrounding theme cascade. Caller
              // wins if they already set one on `componentProps`.
              {...triggerThemeProps}
              {...componentProps}
              className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} ${
                componentProps?.className || ''
              }`}
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
              minWidth={minWidth}
              maxHeight={maxHeight}
              offsetX={offsetX}
              offsetY={offsetY}
              intent={intent}
              title={title}
              icon={icon}
              minimal={minimal}
              flat={flat}
              effect={effect}
              onPopperClose={close}
              onPopperUpdate={handlePopperUpdate}
              closePopover={close}
              id={id}
              updater={updater}
              handler={handler}
              backgroundBlur={backgroundBlur}
              onPopoverMouseEnter={keepOpenOnHover ? handlePopoverMouseEnter : undefined}
              onPopoverMouseLeave={keepOpenOnHover ? handlePopoverMouseLeave : undefined}
            />
          )}
          {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
          <StyledPopover
            as={wrapperTag}
            className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} reqore-popover-wrapper`}
            ref={handleRef}
            style={wrapperStyle}
          >
            <Component
              // See comment on the mirroring path above — forward the
              // popover's own `customTheme` to the trigger so it
              // inherits the surrounding theme cascade. Caller wins
              // if they already set one on `componentProps`.
              {...triggerThemeProps}
              {...componentProps}
            >
              {children}
            </Component>
          </StyledPopover>
        </>
      );
    }
  )
);
