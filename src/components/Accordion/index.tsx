import { rgba } from 'polished';
import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  GAP_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { ACTIVE_ICON_SCALE, DisabledElement, INACTIVE_ICON_SCALE } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { ButtonBadge, TReqoreBadge } from '../Button';
import { IReqoreEffect, patchPrimaryGradient, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { StyledIconWrapper } from '../Icon';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreAccordionItem {
  /** Unique identifier for the item */
  id?: string;
  /** Title displayed in the header */
  label: string;
  labelEffect?: IReqoreEffect;
  /** Content displayed when expanded */
  content: React.ReactNode;
  /** Optional icon in the header */
  icon?: IReqoreIconName;
  /** Optional icon color */
  iconColor?: TReqoreEffectColor;
  /** Intent color for this item */
  intent?: TReqoreIntent;
  /** Badge displayed next to the title */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Whether this item starts open */
  isOpen?: boolean;
}

export interface IReqoreAccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Accordion items */
  items: IReqoreAccordionItem[];
  /** Allow multiple items open at once (default: true) */
  allowMultiple?: boolean;
  /** Rounded border corners */
  rounded?: boolean;
  /** Minimal style (transparent headers) */
  minimal?: boolean;
  /** Effect applied to the accordion wrapper */
  effect?: IReqoreEffect;
  /** Background opacity */
  opacity?: number;
  /** Transparent background */
  transparent?: boolean;
  /** Callback when an item is toggled */
  onItemToggle?: (index: number, isOpen: boolean) => void;
}

interface IStyledAccordionWrapper {
  theme: IReqoreTheme;
  size: TSizes;
  $fluid?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  flat?: boolean;
  intent?: string;
  opacity?: number;
}

interface IStyledAccordionItem {
  theme: IReqoreTheme;
  size: TSizes;
  disabled?: boolean;
  intent?: string;
  flat?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  rounded?: boolean;
  opacity?: number;
}

interface IStyledAccordionHeader {
  theme: IReqoreTheme;
  size: TSizes;
  $isOpen?: boolean;
  disabled?: boolean;
  intent?: string;
  flat?: boolean;
  minimal?: boolean;
  opacity?: number;
}

interface IStyledAccordionContent {
  theme: IReqoreTheme;
  size: TSizes;
  $isOpen?: boolean;
}

const StyledAccordionWrapper = styled(StyledEffect)<IStyledAccordionWrapper>`
  display: flex;
  flex-direction: column;
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};
  border-radius: ${({ rounded, size }) => (rounded ? RADIUS_FROM_SIZE[size] : 0)}px;
  overflow: hidden;
  border: ${({ flat, theme, intent }) =>
    flat
      ? undefined
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}
`;

const StyledAccordionItem = styled.div<IStyledAccordionItem>`
  &:not(:first-child) {
    border-top: ${({ flat, theme, intent }) =>
      flat
        ? undefined
        : `1px solid ${changeLightness(
            intent ? theme.intents[intent] : getMainBackgroundColor(theme),
            0.08
          )}`};
  }
`;

const StyledAccordionHeader = styled.div<IStyledAccordionHeader>`
  display: flex;
  align-items: center;
  gap: ${() => GAP_FROM_SIZE.normal}px;
  padding: ${({ size }) => `${PADDING_FROM_SIZE[size] * 1.5}px ${PADDING_FROM_SIZE[size] * 1.5}px`};
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-out;
  background-color: ${({ theme, opacity = 1, minimal }) =>
    minimal ? 'transparent' : rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  ${StyledIconWrapper} {
    transform: scale(${INACTIVE_ICON_SCALE});
    transition: transform 0.15s ease-out;
  }

  &:hover {
    background-color: ${({ theme, opacity = 1, disabled }) =>
      disabled ? undefined : rgba(changeLightness(getMainBackgroundColor(theme), 0.05), opacity)};

    ${StyledIconWrapper} {
      transform: scale(${ACTIVE_ICON_SCALE});
    }
  }

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}
`;

const StyledAccordionChevron = styled(StyledIconWrapper)<{ $isOpen?: boolean }>`
  transition: transform 0.2s ease-out !important;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')}) !important;
  flex-shrink: 0;
`;

const StyledAccordionContentWrapper = styled.div<IStyledAccordionContent>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.2s ease-in-out;
`;

const StyledAccordionContentInner = styled.div<{ theme: IReqoreTheme; size: TSizes }>`
  overflow: hidden;
`;

const StyledAccordionContentBody = styled.div<{ theme: IReqoreTheme; size: TSizes }>`
  padding: ${({ size }) => `${PADDING_FROM_SIZE[size] * 3}px ${PADDING_FROM_SIZE[size] * 4.6}px`};
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  background-color: ${({ theme }) => rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), 1)};
  border-top: 1px solid ${({ theme }) => changeLightness(getMainBackgroundColor(theme), 0.05)};
`;

interface IAccordionItemRendererProps {
  item: IReqoreAccordionItem;
  index: number;
  isOpen: boolean;
  theme: IReqoreTheme;
  customTheme?: IReqoreAccordionProps['customTheme'];
  size: TSizes;
  intent?: TReqoreIntent;
  flat?: boolean;
  rounded?: boolean;
  minimal?: boolean;
  disabled?: boolean;
  effectiveOpacity?: number;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent, index: number) => void;
}

const AccordionItemRenderer = memo(
  ({
    item,
    index,
    isOpen,
    theme,
    customTheme,
    size,
    intent,
    flat,
    rounded,
    minimal,
    disabled,
    effectiveOpacity,
    isFirst,
    isLast,
    onToggle,
    onKeyDown,
  }: IAccordionItemRendererProps) => {
    const itemIntent = item.intent || intent;
    const itemTheme = useReqoreTheme('main', customTheme, itemIntent);
    const isItemDisabled = item.disabled || disabled;

    return (
      <StyledAccordionItem
        theme={theme}
        size={size}
        disabled={isItemDisabled}
        intent={itemIntent}
        flat={flat}
        isFirst={isFirst}
        isLast={isLast}
        rounded={rounded}
        opacity={effectiveOpacity}
        className='reqore-accordion-item'
      >
        <StyledAccordionHeader
          theme={itemTheme}
          size={size}
          $isOpen={isOpen}
          disabled={isItemDisabled}
          intent={itemIntent}
          flat={flat}
          minimal={minimal}
          opacity={effectiveOpacity}
          onClick={() => onToggle(index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          tabIndex={isItemDisabled ? undefined : 0}
          role='button'
          aria-expanded={isOpen}
          className='reqore-accordion-header'
        >
          <StyledAccordionChevron as='span' $isOpen={isOpen}>
            <ReqoreIcon icon='ArrowDownSLine' size={getOneLessSize(size)} />
          </StyledAccordionChevron>
          {item.icon && (
            <ReqoreIcon
              icon={item.icon}
              size={getOneLessSize(size)}
              color={item.iconColor}
              className='reqore-accordion-icon'
            />
          )}
          <ReqoreHeading
            size={getOneLessSize(size)}
            effect={item.labelEffect}
            className='reqore-accordion-title'
          >
            {item.label}
          </ReqoreHeading>
          {(item.badge || item.badge === 0) && <ButtonBadge content={item.badge} size={size} />}
        </StyledAccordionHeader>
        <StyledAccordionContentWrapper theme={theme} size={size} $isOpen={isOpen}>
          <StyledAccordionContentInner theme={theme} size={size}>
            <StyledAccordionContentBody
              theme={theme}
              size={size}
              className='reqore-accordion-content'
            >
              {typeof item.content === 'string' ? (
                <ReqoreSpan size={size}>{item.content}</ReqoreSpan>
              ) : (
                item.content
              )}
            </StyledAccordionContentBody>
          </StyledAccordionContentInner>
        </StyledAccordionContentWrapper>
      </StyledAccordionItem>
    );
  }
);

export const ReqoreAccordion = memo(
  forwardRef<HTMLDivElement, IReqoreAccordionProps>(
    (
      {
        items,
        allowMultiple = true,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        fluid,
        flat,
        disabled,
        tooltip,
        rounded = true,
        minimal,
        effect,
        opacity,
        transparent,
        onItemToggle,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const [openItems, setOpenItems] = useState<Record<number, boolean>>(() =>
        items.reduce((acc, item, index) => {
          if (item.isOpen) {
            acc[index] = true;
          }
          return acc;
        }, {} as Record<number, boolean>)
      );

      const handleToggle = useCallback(
        (index: number) => {
          if (items[index]?.disabled || disabled) return;

          setOpenItems((prev) => {
            const isCurrentlyOpen = !!prev[index];
            const newState = allowMultiple ? { ...prev } : {};
            newState[index] = !isCurrentlyOpen;
            return newState;
          });

          onItemToggle?.(index, !openItems[index]);
        },
        [allowMultiple, disabled, items, onItemToggle, openItems]
      );

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, index: number) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle(index);
          }
        },
        [handleToggle]
      );

      const transformedEffect: IReqoreEffect = useMemo(() => {
        if (!effect) return undefined;

        const newEffect: IReqoreEffect = { ...effect };

        if (newEffect.gradient && intent) {
          newEffect.gradient = patchPrimaryGradient(newEffect.gradient, {
            borderColor: theme.intents[intent] as TReqoreEffectColor,
          });
        }

        return newEffect;
      }, [effect, intent, theme]);

      const effectiveOpacity = transparent ? 0 : opacity;

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledAccordionWrapper}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          size={size}
          $fluid={fluid}
          disabled={disabled}
          rounded={rounded}
          flat={flat}
          intent={intent}
          opacity={effectiveOpacity}
          effect={transformedEffect}
          className={`${className || ''} reqore-accordion`}
        >
          {items.map((item, index) => (
            <AccordionItemRenderer
              key={item.id || index}
              item={item}
              index={index}
              isOpen={!!openItems[index]}
              theme={theme}
              customTheme={customTheme}
              size={size}
              intent={intent}
              flat={flat}
              rounded={rounded}
              minimal={minimal}
              disabled={disabled}
              effectiveOpacity={effectiveOpacity}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onToggle={handleToggle}
              onKeyDown={handleKeyDown}
            />
          ))}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreAccordion;
