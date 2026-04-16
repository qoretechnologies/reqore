import { map, size } from 'lodash';
import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import { useDebounce, useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { changeDarkness, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import { ReqoreBackdrop } from '../Drawer/backdrop';
import {
  IReqorePanelAction,
  IReqorePanelBottomAction,
  IReqorePanelProps,
  ReqorePanel,
} from '../Panel';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpacer } from '../Spacer';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';

export interface IReqoreCollectionItemProps
  extends Omit<
    IReqorePanelProps,
    | 'children'
    | 'actions'
    | 'collapsible'
    | 'onCollapseChange'
    | 'isCollapsed'
    | 'unMountContentOnCollapse'
    | 'bottomActions'
    | 'content'
  > {
  selected?: boolean;
  content?: string | number | React.ReactNode;
  expandable?: boolean;
  expandedContent?: string | React.ReactNode;
  expandedActions?: IReqorePanelBottomAction[];
  image?: string;
  actions?: IReqorePanelAction[];
  tags?: IReqoreTagProps[];
  maxContentHeight?: number;
  showContentFade?: boolean;
  searchString?: string;
  /**
   * If true, the item will stretch to span all grid columns. Works with any
   * `columns` setting on the Collection (fixed number, `'auto-fit'`, or
   * `'auto-fill'`) and reflows responsively as the container resizes.
   * Has no visible effect when the Collection is rendered as a list.
   * @default false
   */
  stretch?: boolean;
  // Used for passing values and sorting
  metadata?: Record<string, any>;
  groups?: string[];
}

export const StyledCollectionItemContent = styled.div`
  max-height: ${({ providedHeight }) => (providedHeight ? `${providedHeight}px` : 'auto')};
  overflow: ${({ isSelected }) => (isSelected ? 'auto' : 'hidden')};
  position: relative;
  transition: 0.3s ease-in-out;
  flex: 1;

  ${({ contentOverflows, theme, opacity = 1 }) =>
    contentOverflows &&
    css`
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        transition: 0.3s ease-in-out;
        background: linear-gradient(
          to top,
          ${rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)} 0%,
          transparent 100%
        );
      }
    `}
`;

export const ReqoreCollectionItem = ({
  flat = true,
  minimal = true,
  style,
  content,
  actions,
  tags,
  expandable,
  expandedContent,
  expandedActions,
  maxContentHeight,
  showContentFade = true,
  stretch,
  ...rest
}: IReqoreCollectionItemProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
  const ref = useRef<HTMLDivElement>(null);
  const [contentRef, sizes] = useMeasure();
  const originalDimensions = useRef(null);
  const [position, setPosition] = useState(undefined);
  const theme = useReqoreTheme('main', rest.customTheme, undefined, undefined, rest.inheritCustomTheme);
  const [dimensions, setDimensions] = useState<any>({
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    width: undefined,
    height: undefined,
    left: undefined,
    top: undefined,
    transform: undefined,
    transformOrigin: undefined,
  });

  useEffect(() => {
    if (isSelected && expandable) {
      setPosition('fixed');
    }
  }, [isSelected, expandable]);

  useDebounce(
    () => {
      if (isSelected && expandable) {
        setDimensions({
          ...dimensions,
          width: undefined,
          height: undefined,
          left: '50%',
          minWidth: '500px',
          minHeight: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          transformOrigin: 'center',
        });
      }
    },
    100,
    [isSelected, expandable]
  );

  useDebounce(
    () => {
      if (!isSelected && expandable) {
        setPosition(undefined);
        setDimensions({
          minHeight: undefined,
          minWidth: undefined,
          maxWidth: undefined,
          maxHeight: undefined,
          left: undefined,
          top: undefined,
          transform: 'translateX(0) translateY(0)',
          transformOrigin: 'center',
        });
      }
    },
    220,
    [isSelected, expandable]
  );

  const renderContent = () => {
    const handleItemClick = (event?: any) => {
      if (expandable) {
        if (isSelected) {
          setDimensions(originalDimensions.current);
        } else {
          originalDimensions.current = {
            left: ref.current.getBoundingClientRect()?.left,
            top: ref.current.getBoundingClientRect()?.top,
            width: ref.current.getBoundingClientRect()?.width,
            height: ref.current.getBoundingClientRect()?.height,
            transform: 'translateX(0) translateY(0)',
            transformOrigin: 'center',
          };

          setDimensions({
            left: ref.current.getBoundingClientRect()?.left,
            top: ref.current.getBoundingClientRect()?.top,
            width: ref.current.getBoundingClientRect()?.width,
            height: ref.current.getBoundingClientRect()?.height,
            transform: 'translateX(0) translateY(0)',
            transformOrigin: 'center',
          });
        }
        setIsSelected(!isSelected);
      }

      rest.onClick?.(event);
    };

    const actualContent: string | React.ReactNode =
      expandedContent && isSelected ? expandedContent : content;

    const actualActions: IReqorePanelAction[] | undefined = isSelected
      ? ([
          ...(actions || []),
          { icon: 'CloseLine', onClick: handleItemClick },
        ] as IReqorePanelAction[])
      : size(actions)
      ? actions
      : undefined;

    return (
      <>
        {position && (
          <>
            <div style={{ ...originalDimensions.current }} />
            <ReqoreBackdrop
              zIndex={getAndIncreaseZIndex()}
              blur={5}
              onClose={() => handleItemClick()}
            />
          </>
        )}
        <ReqorePanel
          flat={flat}
          ref={ref}
          minimal={minimal}
          {...rest}
          responsiveActions={false}
          bottomActions={isSelected ? expandedActions : undefined}
          style={{
            gridColumn: stretch ? '1 / -1' : undefined,
            ...style,
            position,
            zIndex: isSelected ? getAndIncreaseZIndex() : undefined,
            ...dimensions,
          }}
          contentStyle={{
            ...rest.contentStyle,
            display: 'flex',
            flexFlow: 'column',
            justifyContent: 'space-between',
          }}
          onClick={(expandable && !isSelected) || rest.onClick ? handleItemClick : undefined}
          actions={actualActions}
          className={`reqore-collection-item ${rest.className || ''}`}
        >
          <StyledCollectionItemContent
            theme={theme}
            opacity={rest.transparent ? 0 : rest.opacity}
            providedHeight={isSelected ? undefined : maxContentHeight}
            isSelected={isSelected}
            contentOverflows={
              !rest.transparent &&
              !rest.contentEffect &&
              !isSelected &&
              sizes?.height > maxContentHeight &&
              showContentFade
            }
          >
            <div ref={contentRef}>{actualContent}</div>
          </StyledCollectionItemContent>
          {showContentFade &&
          (rest.contentEffect || rest.transparent) &&
          !isSelected &&
          sizes?.height > maxContentHeight ? (
            <ReqoreP>...</ReqoreP>
          ) : null}
          {size(tags) ? (
            <>
              <ReqoreSpacer height={10} />
              <ReqoreTagGroup size={isSelected ? 'normal' : 'small'}>
                {map(tags, (tagProps, index) => (
                  <ReqoreTag key={index} {...tagProps} />
                ))}
              </ReqoreTagGroup>
            </>
          ) : null}
        </ReqorePanel>
      </>
    );
  };

  return renderContent();
};
