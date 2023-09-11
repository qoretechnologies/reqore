import { cloneDeep, size as lodashSize } from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ReqoreMessage, ReqorePanel, useReqoreProperty } from '../..';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getTypeFromValue } from '../../helpers/utils';
import { IWithReqoreSize } from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { ReqoreExportModal } from '../ExportModal';
import { IReqorePanelAction, IReqorePanelProps } from '../Panel';
import { getExportActions, getZoomActions, sizeToZoom, zoomToSize } from '../Table/helpers';
import ReqoreTag from '../Tag';

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
}

export interface ITreeStyle {
  interactive?: boolean;
  theme: IReqoreTheme;
  level?: number;
  size?: TSizes;
}

export const StyledTreeLabel = styled(ReqoreMessage)`
  flex-shrink: 1;
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

  const renderTree = (data, k?: any, level = 1, path: string[] = []) => {
    return Object.keys(data).map((key, index) => {
      const dataType: string = getTypeFromValue(data[key]);
      const displayKey: string = key;
      const stateKey = k ? `${k}_${key}` : key;

      let isObject = typeof data[key] === 'object' && data[key] !== null;
      let isExpandable =
        typeof data[key] !== 'object' ||
        items[stateKey] ||
        (allExpanded && items[stateKey] !== false);

      if (isObject && lodashSize(data[key]) === 0) {
        isObject = false;
        isExpandable = false;
      }

      return (
        <StyledTreeWrapper key={index} size={zoomToSize[zoom]} level={level}>
          {isObject ? (
            <ReqoreControlGroup size={zoomToSize[zoom]}>
              <ReqoreButton
                className='reqore-tree-toggle'
                icon={isExpandable ? 'ArrowDownSFill' : 'ArrowRightSFill'}
                intent={isExpandable ? 'info' : undefined}
                onClick={() => handleItemClick(stateKey, isExpandable)}
                flat
              >
                {displayKey}
              </ReqoreButton>
              {_showTypes ? <ReqoreTag label={dataType} className='reqore-tree-type' /> : null}
            </ReqoreControlGroup>
          ) : (
            <ReqoreControlGroup size={zoomToSize[zoom]} verticalAlign='flex-start'>
              <ReqoreTag
                label={displayKey}
                actions={
                  withLabelCopy
                    ? [
                        {
                          icon: 'FileCopy2Fill',
                          onClick: () => {
                            navigator.clipboard.writeText(JSON.stringify(data[key]));
                            addNotification({
                              content: 'Successfuly copied to clipboard',
                              id: Date.now().toString(),
                              type: 'success',
                              duration: 3000,
                            });
                          },
                        },
                      ]
                    : undefined
                }
              />
              {_showTypes ? <ReqoreTag className='reqore-tree-type' label={dataType} /> : null}
              <StyledTreeLabel
                flat
                onClick={() => onItemClick(data[key], [...path, key])}
                className='reqore-tree-label'
              >
                {JSON.stringify(data[key])}
              </StyledTreeLabel>
            </ReqoreControlGroup>
          )}
          {isExpandable && isObject
            ? renderTree(data[key], stateKey, level + 1, [...path, key])
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
