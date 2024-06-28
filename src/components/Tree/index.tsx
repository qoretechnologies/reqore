import { cloneDeep, size as lodashSize } from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ReqoreHorizontalSpacer, ReqoreIcon, ReqoreP, ReqorePanel, useReqoreProperty } from '../..';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getOneLessSize, getTypeFromValue } from '../../helpers/utils';
import { IWithReqoreSize } from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { ReqoreExportModal } from '../ExportModal';
import { IReqorePanelAction, IReqorePanelProps } from '../Panel';
import { getExportActions, getZoomActions, sizeToZoom, zoomToSize } from '../Table/helpers';

export interface IReqoreTreeProps extends IReqorePanelProps, IWithReqoreSize {
  data: Record<string, unknown> | Array<any>;
  mode?: 'tree' | 'copy';
  expanded?: boolean;
  showTypes?: boolean;
  onItemClick?: (value: any, path?: string[]) => void;
  withLabelCopy?: boolean;
  showControls?: boolean;
  zoomable?: boolean;
  exportable?: boolean;
  defaultZoom?: 0 | 0.5 | 1 | 1.5 | 2;
  editable?: boolean;
}

export interface ITreeStyle {
  interactive?: boolean;
  theme: IReqoreTheme;
  level?: number;
  size?: TSizes;
}

export const StyledTreeLabel = styled(ReqoreP)`
  flex-shrink: 1;

  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

export const StyledTreeWrapper = styled.div<ITreeStyle>`
  display: flex;
  flex-flow: column;
  gap: ${({ size }) => GAP_FROM_SIZE[size]}px;
  margin-left: ${({ level, size }) => (level ? level * GAP_FROM_SIZE[size] : 0)}px;
`;

export const ReqoreTree = ({
  data,
  size = 'normal',
  expanded,
  showTypes,
  onItemClick,
  withLabelCopy,
  showControls = true,
  editable,
  exportable,
  zoomable,
  defaultZoom,
  ...rest
}: IReqoreTreeProps) => {
  const [items, setItems] = useState({});
  const [allExpanded, setAllExpanded] = useState(expanded || !showControls);
  const [_showTypes, setShowTypes] = useState(showTypes);
  const addNotification = useReqoreProperty('addNotification');
  const [zoom, setZoom] = useState(defaultZoom || sizeToZoom[size]);
  const [showExportModal, setShowExportModal] = useState<'full' | 'current' | undefined>(undefined);

  const handleTypesClick = () => {
    setShowTypes(!_showTypes);
  };

  const handleExpandClick = () => {
    setItems({});
    setAllExpanded(true);
  };

  const handleCollapseClick = () => {
    setItems({});
    setAllExpanded(false);
  };

  const handleItemClick = (key: string, currentState?: boolean) => {
    const newItems = cloneDeep(items);

    newItems[key] = !currentState;

    setItems(newItems);
  };

  const isDeep = () =>
    Object.keys(data).some((key: string): boolean => typeof data[key] === 'object');

  const renderTree = (_data, k?: any, level = 1, path: string[] = []) => {
    return Object.keys(_data).map((key, index) => {
      const dataType: string = getTypeFromValue(_data[key]);
      const displayKey: string = key;
      const stateKey = k ? `${k}_${key}` : key;

      let isObject = typeof _data[key] === 'object' && _data[key] !== null;
      let isExpandable =
        typeof _data[key] !== 'object' ||
        items[stateKey] ||
        (allExpanded && items[stateKey] !== false);

      if (isObject && lodashSize(_data[key]) === 0) {
        isObject = false;
        isExpandable = false;
      }

      const badges: IReqoreButtonProps['badge'] = [`{...} ${lodashSize(_data[key])} items`];

      if (_showTypes) {
        badges.push({
          icon: 'CodeBoxFill',
          label: dataType,
        });
      }

      return (
        <StyledTreeWrapper key={index} size={zoomToSize[zoom]} level={level}>
          {isObject ? (
            <ReqoreControlGroup size={zoomToSize[zoom]}>
              {level !== 1 && <ReqoreHorizontalSpacer width={5} />}
              <ReqoreButton
                compact
                minimal
                className='reqore-tree-toggle'
                icon={'ArrowDownSFill'}
                leftIconProps={{ rotation: isExpandable ? 0 : -90 }}
                intent={isExpandable ? 'info' : undefined}
                onClick={() => handleItemClick(stateKey, isExpandable)}
                flat={false}
                badge={badges}
              >
                {displayKey}
              </ReqoreButton>
              {editable && (
                <ReqoreButton compact minimal icon='DeleteBinLine' intent='danger' flat />
              )}
            </ReqoreControlGroup>
          ) : (
            <ReqoreControlGroup verticalAlign='flex-start'>
              {level !== 1 && <ReqoreHorizontalSpacer width={5} />}
              <ReqoreP
                customTheme={{ text: { color: 'info:lighten:3' } }}
                style={{ flexShrink: 0 }}
                size={zoomToSize[zoom]}
              >
                {displayKey}:
              </ReqoreP>
              {withLabelCopy && (
                <ReqoreIcon
                  interactive
                  icon='ClipboardLine'
                  size={getOneLessSize(zoomToSize[zoom])}
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(JSON.stringify(_data[key]));
                      addNotification({
                        content: 'Successfuly copied to clipboard',
                        id: Date.now().toString(),
                        type: 'success',
                        duration: 3000,
                      });
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                />
              )}
              <StyledTreeLabel
                flat
                onClick={() => onItemClick?.(_data[key], [...path, key])}
                className='reqore-tree-label'
                size={zoomToSize[zoom]}
              >
                {JSON.stringify(_data[key])}
              </StyledTreeLabel>
            </ReqoreControlGroup>
          )}
          {isExpandable && isObject
            ? renderTree(_data[key], stateKey, level + 1, [...path, key])
            : null}
        </StyledTreeWrapper>
      );
    });
  };

  const actions = useMemo(() => {
    let _actions: IReqorePanelAction[] = [];

    if (showControls) {
      _actions = [
        {
          className: 'reqore-tree-expand-all',
          icon: 'ArrowDownFill',
          onClick: handleExpandClick,
          show: !!(isDeep() && !allExpanded),
          label: 'Expand all',
        },
        {
          show: !!(isDeep() && (allExpanded || lodashSize(items) > 0)),
          className: 'reqore-tree-collapse-all',
          icon: 'ArrowUpFill',
          onClick: handleCollapseClick,

          label: 'Collapse all',
        },
        {
          className: 'reqore-tree-show-types',
          icon: 'CodeBoxFill',
          active: _showTypes,
          onClick: handleTypesClick,
          label: 'Show types',
        },
      ];
    }

    if (zoomable || exportable) {
      const moreActions: IReqorePanelAction = {
        className: 'reqore-tree-more',
        icon: 'MoreLine',
        actions: [],
      };

      if (zoomable) {
        moreActions.actions = [
          ...moreActions.actions,
          ...getZoomActions('reqore-tree', zoom, setZoom, true),
        ];
      }

      if (exportable) {
        moreActions.actions = [
          ...moreActions.actions,
          { divider: true, line: true },
          ...getExportActions((type) => setShowExportModal(type)),
        ];
      }

      _actions = [..._actions, moreActions];
    }

    return _actions;
  }, [allExpanded, items, showControls, _showTypes, isDeep(), zoom]);

  if (!data || !Object.keys(data).length) {
    return <p>No data</p>;
  }

  return (
    <>
      {showExportModal && (
        <ReqoreExportModal data={data} onClose={() => setShowExportModal(undefined)} />
      )}
      <ReqorePanel
        className='reqore-tree'
        minimal
        flat
        transparent
        size={size}
        contentStyle={{
          display: 'flex',
          flexFlow: 'column',
          gap: `${GAP_FROM_SIZE[size]}px`,
        }}
        {...rest}
        actions={actions}
      >
        {renderTree(data, true)}
      </ReqorePanel>
    </>
  );
};
