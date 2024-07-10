import {
  cloneDeep,
  get,
  isArray,
  isBoolean,
  isNumber,
  size as lodashSize,
  set,
  unset,
} from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  ReqoreIcon,
  ReqoreP,
  ReqorePanel,
  ReqorePopover,
  ReqoreSpan,
  useReqoreProperty,
} from '../..';
import { GAP_FROM_SIZE, ICON_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getOneLessSize, getTypeFromValue, parseInputValue } from '../../helpers/utils';
import { IWithReqoreSize } from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { ReqoreExportModal } from '../ExportModal';
import { IReqorePanelAction, IReqorePanelProps } from '../Panel';
import { getExportActions, getZoomActions, sizeToZoom, zoomToSize } from '../Table/helpers';
import { IReqoreTreeManagementDialog, ReqoreTreeManagementDialog } from './modal';

export interface IReqoreTreeProps extends IReqorePanelProps, IWithReqoreSize {
  data: Record<string, unknown> | Array<any>;
  onDataChange?: (data: Record<string, unknown> | Array<any>) => void;
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
  expandable?: boolean;
}

export const StyledTreeLabel = styled(ReqoreP)`
  flex-shrink: 1;

  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

export const StyledTreeWrapper = styled.div<ITreeStyle>`
  display: flex;
  flex-flow: column;
  gap: ${({ size }) => GAP_FROM_SIZE[size]}px;
  margin-left: ${({ size }) => ICON_FROM_SIZE[size]}px;
  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'default')};
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
  onDataChange,
  ...rest
}: IReqoreTreeProps) => {
  const [items, setItems] = useState({});
  const [allExpanded, setAllExpanded] = useState(expanded || !showControls);
  const [_showTypes, setShowTypes] = useState(showTypes);
  const addNotification = useReqoreProperty('addNotification');
  const [zoom, setZoom] = useState(defaultZoom || sizeToZoom[size]);
  const [showExportModal, setShowExportModal] = useState<'full' | 'current' | undefined>(undefined);
  const [managementDialog, setManagementDialog] = useState<IReqoreTreeManagementDialog>({
    open: false,
  });

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
      const stateKey = k ? `${k}.${key}` : key;

      const isObject = typeof _data[key] === 'object' && _data[key] !== null;
      const isExpandable =
        typeof _data[key] !== 'object' ||
        items[stateKey] ||
        (allExpanded && items[stateKey] !== false);

      const badges: IReqoreButtonProps['badge'] = [];

      if (_showTypes) {
        badges.push({
          icon: 'CodeBoxFill',
          label: dataType,
        });
      }

      const renderEditButton = () => {
        if (!editable || (isArray(_data) && isObject)) {
          return null;
        }

        return (
          <ReqoreButton
            compact
            minimal
            className='reqore-tree-edit'
            icon='EditLine'
            flat
            size='tiny'
            onClick={(e) => {
              e.stopPropagation();

              setManagementDialog({
                open: true,
                parentPath: k,
                path: stateKey,
                parentType: isArray(_data) ? 'array' : 'object',
                type: isArray(_data[key]) ? 'array' : 'object',
                data: {
                  key,
                  value:
                    typeof _data[key] === 'string' &&
                    (isBoolean(parseInputValue(_data[key])) ||
                      isNumber(parseInputValue(_data[key])))
                      ? `"${_data[key]}"`
                      : _data[key],
                },
              });
            }}
          />
        );
      };

      const renderDeleteButton = () => {
        if (!editable) {
          return null;
        }

        return (
          <ReqoreButton
            compact
            leftIconColor='muted'
            minimal
            className='reqore-tree-delete'
            icon='IndeterminateCircleLine'
            intent='muted'
            flat
            size='tiny'
            onClick={(e) => {
              e.stopPropagation();
              let modifiedData = cloneDeep(_data);
              // Remove the item from the data
              delete modifiedData[key];

              if (isArray(modifiedData)) {
                modifiedData = modifiedData.filter((item) => item);
              }
              // Update the data
              const updatedData = k ? set(cloneDeep(data), k, modifiedData) : modifiedData;

              onDataChange?.(updatedData);
            }}
          />
        );
      };

      return (
        <StyledTreeWrapper
          key={index}
          size={zoomToSize[zoom]}
          level={level}
          className='reqore-tree-item'
        >
          {isObject ? (
            <ReqoreControlGroup
              size={zoomToSize[zoom]}
              verticalAlign='center'
              onClick={() => handleItemClick(stateKey, isExpandable)}
              style={{ cursor: 'pointer' }}
              gapSize='small'
            >
              <ReqoreIcon
                size={zoomToSize[zoom]}
                icon='ArrowDownSFill'
                rotation={isExpandable ? 0 : -90}
                intent='muted'
                style={{
                  position: 'absolute',
                  marginLeft: `-${ICON_FROM_SIZE[zoomToSize[zoom]]}px`,
                }}
              />

              <ReqoreP
                className='reqore-tree-toggle'
                effect={{
                  weight: 'normal',
                  color: 'info:lighten:5',
                }}
              >
                {displayKey}:
              </ReqoreP>

              {editable && isObject ? (
                <ReqoreControlGroup>
                  <ReqoreButton
                    size='tiny'
                    flat
                    icon='AddCircleLine'
                    onClick={() => {
                      setManagementDialog({
                        open: true,
                        path: stateKey,
                        parentType: isArray(_data) ? 'array' : 'object',
                        type: isArray(_data[key]) ? 'array' : 'object',
                      });
                    }}
                    leftIconColor='info'
                    minimal
                    compact
                  />
                </ReqoreControlGroup>
              ) : null}
              {renderEditButton()}
              {renderDeleteButton()}
              <ReqoreSpan
                intent='muted'
                size={getOneLessSize(zoomToSize[zoom])}
                inline
                onClick={() => handleItemClick(stateKey, isExpandable)}
              >
                {isArray(_data[key]) ? '[' : '{'}
                {!isExpandable && (isArray(_data[key]) ? '...]' : '...}')}{' '}
                {!isExpandable && `${lodashSize(_data[key])} items`}
              </ReqoreSpan>
              {_showTypes && (
                <ReqoreSpan
                  size={getOneLessSize(zoomToSize[zoom])}
                  intent='muted'
                  inline
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {dataType}
                </ReqoreSpan>
              )}
            </ReqoreControlGroup>
          ) : (
            <ReqoreControlGroup verticalAlign='flex-start'>
              <ReqorePopover
                component={ReqoreP}
                componentProps={{
                  customTheme: { text: { color: 'info:lighten:5' } },
                  style: { flexShrink: 0 },
                  size: zoomToSize[zoom],
                }}
                delay={200}
                content={dataType}
                isReqoreComponent
              >
                {displayKey}:
              </ReqorePopover>
              <StyledTreeLabel
                flat
                onClick={() => onItemClick?.(_data[key], [...path, key])}
                className='reqore-tree-label'
                customTheme={{
                  text: {
                    color: isBoolean(_data[key])
                      ? _data[key]
                        ? 'success:lighten:5'
                        : 'danger:lighten:10'
                      : isNumber(_data[key])
                      ? 'info:lighten:10'
                      : undefined,
                  },
                }}
                size={zoomToSize[zoom]}
              >
                {JSON.stringify(_data[key])}
              </StyledTreeLabel>
              {withLabelCopy && (
                <ReqoreButton
                  compact
                  minimal
                  flat
                  icon='ClipboardLine'
                  size='tiny'
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
              {renderEditButton()}
              {renderDeleteButton()}
              {_showTypes && (
                <ReqoreSpan
                  size={getOneLessSize(zoomToSize[zoom])}
                  intent='muted'
                  inline
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {dataType}
                </ReqoreSpan>
              )}
            </ReqoreControlGroup>
          )}
          {isExpandable && isObject ? (
            <>
              {renderTree(_data[key], stateKey, level + 1, [...path, key])}

              <ReqoreSpan intent='muted' size={getOneLessSize(zoomToSize[zoom])} inline>
                {isArray(_data[key]) ? '] ' : '} '}
              </ReqoreSpan>
            </>
          ) : null}
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

  if (!data) {
    return <p>No data</p>;
  }

  return (
    <>
      {showExportModal && (
        <ReqoreExportModal data={data} onClose={() => setShowExportModal(undefined)} />
      )}
      {managementDialog.open && (
        <ReqoreTreeManagementDialog
          {...managementDialog}
          onClose={() => setManagementDialog({ open: false })}
          onSave={({ key, value, originalData }) => {
            const modifiedValue =
              value === '{}'
                ? {}
                : value === '[]'
                ? []
                : typeof value === 'object'
                ? value
                : parseInputValue(value);

            // If there is no path, it means we are adding a new item at the root level
            if (!managementDialog.path) {
              const updatedData = cloneDeep(data);

              if (originalData) {
                unset(updatedData, originalData.key);
              } else {
                if (isArray(updatedData)) {
                  updatedData.push(modifiedValue);
                } else {
                  updatedData[key] = modifiedValue;
                }
              }

              onDataChange?.(updatedData);

              setManagementDialog({ open: false });

              return;
            }

            const modifiedData = cloneDeep(get(data, managementDialog.path));

            let updatedData;

            if (originalData) {
              updatedData = set(
                cloneDeep(data),
                `${managementDialog.parentPath ? `${managementDialog.parentPath}.` : ''}${key}`,
                modifiedValue
              );

              if (key !== originalData.key) {
                unset(
                  updatedData,
                  `${managementDialog.parentPath ? `${managementDialog.parentPath}.` : ''}${
                    originalData.key
                  }`
                );
              }
            } else {
              // Add the item to the data
              if (isArray(modifiedData)) {
                modifiedData.push(modifiedValue);
              } else {
                modifiedData[key] = modifiedValue;
              }

              // Update the data
              updatedData = set(cloneDeep(data), managementDialog.path, modifiedData);
            }

            onDataChange?.(updatedData);

            setManagementDialog({ open: false });
          }}
        />
      )}
      <ReqorePanel
        className='reqore-tree'
        minimal
        flat
        transparent
        size={size}
        contentStyle={{
          display: 'flex',
          flexFlow: lodashSize(data) ? 'column' : 'row',
          gap: `${GAP_FROM_SIZE[size]}px`,
        }}
        {...rest}
        actions={actions}
      >
        <ReqoreSpan intent='muted' size={getOneLessSize(zoomToSize[zoom])} inline>
          {isArray(data) ? '[ ' : '{ '}
        </ReqoreSpan>
        {renderTree(data)}
        <ReqoreSpan intent='muted' size={getOneLessSize(zoomToSize[zoom])} inline>
          {isArray(data) ? ' ]' : ' }'}
        </ReqoreSpan>
        {editable && (
          <ReqoreButton
            size='tiny'
            flat
            fixed
            className='reqore-tree-add'
            icon='AddCircleLine'
            onClick={() => {
              setManagementDialog({
                open: true,
                path: '',
                parentType: isArray(data) ? 'array' : 'object',
                type: isArray(data) ? 'array' : 'object',
              });
            }}
            leftIconColor='info'
            minimal
            compact
          />
        )}
      </ReqorePanel>
    </>
  );
};
