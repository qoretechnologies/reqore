import { Children, forwardRef, isValidElement, memo, ReactNode, useMemo } from 'react';
import { css } from 'styled-components';
import { PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getPanelHairlineColor } from '../../helpers/colors';
import styled from '../../helpers/styled';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { NARROW_CONTAINER_BREAKPOINT_PX, useNarrowContainer } from '../../hooks/useNarrowContainer';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreCustomTheme, IWithReqoreSize } from '../../types/global';
import ReqoreStatistic, { IReqoreStatisticProps } from '../Statistic';

/** The most figures a group shows (instruction-files decision 010): a sixth belongs in the detail. */
export const STATISTIC_GROUP_MAX = 5;

export interface IReqoreStatisticGroupItem extends IReqoreStatisticProps {
  /**
   * The figure is a filter that is on: a line in the info colour under it (blue says "a filter is
   * on", decision 001). Give the statistic its own `onClick` and `aria-pressed` to make it one.
   */
  active?: boolean;
}

export interface IReqoreStatisticGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IWithReqoreCustomTheme,
    IWithReqoreSize {
  /**
   * The figures, drawn as quiet statistics: transparent, flat, left-aligned, the label under the
   * figure. Each item's own props win over those. `children` may be given instead, each child one
   * figure, drawn as given.
   */
  items?: IReqoreStatisticGroupItem[];
  children?: ReactNode;
  /**
   * The hairlines: `true` draws one between the figures and one above and below the group;
   * `'between'` only those between the figures (and between folded rows), for a strip inside a
   * card whose own title divider and edge are its top and bottom lines (two lines 6px apart read
   * double); `false` none, with the same room between the figures.
   *
   * @default true
   */
  dividers?: boolean | 'between';
  /**
   * How the group sits in a narrow container (at or below `narrowBelow`, measured on the group,
   * not the window):
   * - `'wrap'` (default): two figures to a row, the hairlines between them and between the rows;
   * - `'scroll'`: one row that scrolls sideways, each figure at least `minItemWidth` wide.
   *
   * @default 'wrap'
   */
  narrowLayout?: 'wrap' | 'scroll';
  /** The group's width, in px, at or below which it is narrow. @default 480 */
  narrowBelow?: number;
  /** The least a figure is wide in a `'scroll'` group, in px. @default 96 */
  minItemWidth?: number;
  /**
   * The most figures drawn. A group shows at most five (decision 010); one given more draws the
   * first five and says so in the console. Raise it only where every figure passes the test
   * "does this number change what I do next?".
   *
   * @default 5
   */
  max?: number;
}

export interface IReqoreStatisticGroupStyle {
  theme: IReqoreTheme;
  $dividers: boolean | 'between';
  $layout: 'row' | 'wrap' | 'scroll';
  $pad: number;
  $minItemWidth: number;
}

const hairline = ({ theme, $dividers }: IReqoreStatisticGroupStyle) =>
  $dividers ? getPanelHairlineColor(theme) : 'transparent';

/** The group's own top and bottom lines: only when every hairline is drawn. */
const outerLine = (style: IReqoreStatisticGroupStyle) =>
  style.$dividers === true ? hairline(style) : 'transparent';

export const StyledStatisticGroup = styled.div<IReqoreStatisticGroupStyle>`
  width: 100%;
  min-width: 0;
  box-shadow:
    inset 0 1px 0 ${outerLine},
    inset 0 -1px 0 ${outerLine};

  ${({ $layout, $minItemWidth }) =>
    $layout === 'scroll'
      ? css`
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }

          & > .reqore-statistic-group-item {
            flex: 1 0 ${$minItemWidth}px;
          }
        `
      : $layout === 'wrap'
        ? css`
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          `
        : css`
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: minmax(0, 1fr);
          `}

  & > .reqore-statistic-group-item {
    min-width: 0;
    padding: ${({ $pad }) => `${$pad}px ${$pad * 1.25}px ${$pad * 1.25}px`};
    box-shadow: inset 1px 0 0 ${hairline};
  }

  /* The first figure of a row starts on the group's edge, with no hairline before it: the row of
     a two-column fold, or the only row. */
  ${({ $layout }) =>
    $layout === 'wrap'
      ? css`
          & > .reqore-statistic-group-item:nth-child(odd) {
            padding-left: 0;
            box-shadow: none;
          }

          & > .reqore-statistic-group-item:nth-child(n + 3) {
            box-shadow:
              inset 0 1px 0 ${hairline},
              inset 1px 0 0 ${hairline};
          }

          & > .reqore-statistic-group-item:nth-child(odd):nth-child(n + 3) {
            box-shadow: inset 0 1px 0 ${hairline};
          }
        `
      : css`
          & > .reqore-statistic-group-item:first-child {
            padding-left: 0;
            box-shadow: none;
          }
        `}
`;

const StyledStatisticGroupItem = styled.div<{ theme: IReqoreTheme; $active?: boolean }>`
  position: relative;

  ${({ $active, theme }) =>
    $active &&
    css`
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background-color: ${theme.intents.info};
      }
    `}
`;

/** How a figure in a group is drawn unless it says otherwise: quiet, on the group's surface. */
const ITEM_DEFAULTS: Partial<IReqoreStatisticProps> = {
  transparent: true,
  flat: true,
  padded: false,
  align: 'left',
  labelPosition: 'below',
};

/**
 * A strip of up to five figures with hairlines between them, and above and below: the calm KPI
 * strip (decision 010), drawn once here rather than by hand in every app. In a narrow container
 * it folds to two figures to a row, or scrolls sideways (`narrowLayout`). Measured on its own
 * width, so a strip in a drawer folds as one on a phone does.
 */
export const ReqoreStatisticGroup = memo(
  forwardRef<HTMLDivElement, IReqoreStatisticGroupProps>(
    (
      {
        items,
        children,
        dividers = true,
        narrowLayout = 'wrap',
        narrowBelow = NARROW_CONTAINER_BREAKPOINT_PX,
        minItemWidth = 96,
        max = STATISTIC_GROUP_MAX,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const [containerRef, isNarrow] = useNarrowContainer<HTMLDivElement>(narrowBelow);
      const { setRef } = useCombinedRefs<HTMLDivElement>(ref, containerRef);

      const figures = useMemo(() => {
        const all: { key: string | number; node: ReactNode; active?: boolean }[] = items
          ? items.map(({ active, ...item }, index) => ({
              key: item.id ?? item.label ?? index,
              active,
              node: <ReqoreStatistic size={size} {...ITEM_DEFAULTS} {...item} />,
            }))
          : Children.toArray(children)
              .filter((child) => isValidElement(child) || (child !== null && child !== undefined))
              .map((child, index) => ({
                key: isValidElement(child) && child.key !== null ? child.key : index,
                node: child,
              }));

        if (all.length > max && process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            `ReqoreStatisticGroup: ${all.length} figures given, ${max} drawn. A strip shows at ` +
              'most five figures (decision 010); the rest belong in the detail.'
          );
        }

        return all.slice(0, max);
      }, [items, children, max, size]);

      const layout = !isNarrow ? 'row' : narrowLayout;

      return (
        <StyledStatisticGroup
          {...rest}
          ref={setRef}
          theme={theme}
          className={`${className || ''} reqore-statistic-group`.trim()}
          data-narrow={isNarrow ? 'true' : 'false'}
          $dividers={dividers}
          $layout={layout}
          $pad={PADDING_FROM_SIZE[size as TSizes] ?? PADDING_FROM_SIZE.normal}
          $minItemWidth={minItemWidth}
        >
          {/* The figures take the group's theme: a custom one reaches them as it reaches the
              hairlines. */}
          <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
            {figures.map(({ key, node, active }) => (
              <StyledStatisticGroupItem
                key={key}
                theme={theme}
                $active={active}
                className='reqore-statistic-group-item'
                data-active={active ? 'true' : undefined}
              >
                {node}
              </StyledStatisticGroupItem>
            ))}
          </ReqoreThemeProvider>
        </StyledStatisticGroup>
      );
    }
  )
);

ReqoreStatisticGroup.displayName = 'ReqoreStatisticGroup';

