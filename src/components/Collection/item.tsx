import { map, size } from 'lodash';
import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import { useDebounce, useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { changeDarkness, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import { StyledBackdrop } from '../Drawer';
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
  ...rest
}: IReqoreCollectionItemProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
  const ref = useRef<HTMLDivElement>(null);
  const [contentRef, sizes] = useMeasure();
  const originalDimensions = useRef(null);
  const [position, setPosition] = useState(undefined);
  const theme = useReqoreTheme('main', rest.customTheme);
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
  });

  useEffect(() => {
    if (isSelected) {
      setPosition('fixed');
    }
  }, [isSelected]);

  useDebounce(
    () => {
      if (isSelected) {
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
        });
      }
    },
    100,
    [isSelected]
  );

  useDebounce(
    () => {
      if (!isSelected) {
        setPosition(undefined);
        setDimensions({
          minHeight: undefined,
          minWidth: undefined,
          maxWidth: undefined,
          maxHeight: undefined,
          left: undefined,
          top: undefined,
          transform: 'translateX(0) translateY(0)',
        });
      }
    },
    220,
    [isSelected]
  );

  const renderContent = () => {
    const handleItemClick = (event) => {
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
          };

          setDimensions({
            left: ref.current.getBoundingClientRect()?.left,
            top: ref.current.getBoundingClientRect()?.top,
            width: ref.current.getBoundingClientRect()?.width,
            height: ref.current.getBoundingClientRect()?.height,
            transform: 'translateX(0) translateY(0)',
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
            <StyledBackdrop
              zIndex={getAndIncreaseZIndex()}
              blur={5}
              closable
              onClick={handleItemClick}
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
            ...style,
            position,
            zIndex: isSelected ? getAndIncreaseZIndex() : undefined,
            ...dimensions,
            transformOrigin: 'center',
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
