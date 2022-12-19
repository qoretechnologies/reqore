import { map, size } from 'lodash';
import { rgba } from 'polished';
import { useContext, useEffect, useRef, useState } from 'react';
import { useDebounce, useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import ReqoreContext from '../../context/ReqoreContext';
import { changeDarkness, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { StyledBackdrop } from '../Drawer';
import { IReqoreDropdownItem } from '../Dropdown/list';
import {
  IReqorePanelAction,
  IReqorePanelBottomAction,
  IReqorePanelProps,
  ReqorePanel,
} from '../Panel';
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
  > {
  subHeader?: string;
  content?: string | React.ReactNode;
  expandable?: boolean;
  expandedContent?: string | React.ReactNode;
  expandedActions?: IReqorePanelBottomAction[];
  image?: string;
  actions?: IReqoreDropdownItem[];
  tags?: IReqoreTagProps[];
  maxContentHeight?: number;
}

export const StyledCollectionItemContent = styled.div`
  max-height: ${({ providedHeight }) => (providedHeight ? `${providedHeight}px` : 'auto')};
  overflow: hidden;
  position: relative;
  transition: 0.3s ease-in-out;

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
  headerSize = 3,
  style,
  content,
  actions,
  tags,
  expandable,
  expandedContent,
  expandedActions,
  maxContentHeight,
  ...rest
}: IReqoreCollectionItemProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const { getAndIncreaseZIndex } = useContext(ReqoreContext);
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

      rest?.onClick?.(event);
    };

    const actualContent: string | React.ReactNode =
      expandedContent && isSelected ? expandedContent : content;

    const actualActions: IReqorePanelAction[] | undefined = isSelected
      ? ([
          ...(actions || []),
          { icon: 'CloseLine', onClick: handleItemClick },
        ] as IReqorePanelAction[])
      : size(actions)
      ? [{ icon: 'More2Fill', actions }]
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
          headerSize={headerSize}
          ref={ref}
          minimal={minimal}
          {...rest}
          bottomActions={isSelected ? expandedActions : undefined}
          style={{
            ...style,
            position,
            zIndex: isSelected ? getAndIncreaseZIndex() : undefined,
            ...dimensions,
            transformOrigin: 'center',
          }}
          onClick={(expandable && !isSelected) || rest.onClick ? handleItemClick : undefined}
          actions={actualActions}
          className={`reqore-collection-item ${rest.className || ''}`}
        >
          <StyledCollectionItemContent
            theme={theme}
            opacity={rest.opacity}
            providedHeight={isSelected ? undefined : maxContentHeight}
            contentOverflows={!isSelected && sizes?.height > maxContentHeight}
          >
            <div ref={contentRef}>{actualContent}</div>
          </StyledCollectionItemContent>
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

  return isSelected ? renderContent() : renderContent();
};
