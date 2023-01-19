import { cloneDeep, size as lodashSize } from 'lodash';
import { useContext, useState } from 'react';
import styled from 'styled-components';
import { ReqoreMessage, ReqoreTextarea } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreContext from '../../context/ReqoreContext';
import { getLineCount, getTypeFromValue } from '../../helpers/utils';
import { IWithReqoreSize } from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreTag from '../Tag';

export interface IReqoreTreeProps extends IWithReqoreSize {
  data: Object | Array<any>;
  mode?: 'tree' | 'copy';
  expanded?: boolean;
  showTypes?: boolean;
  onItemClick?: (value: any, path?: string[]) => void;
  withLabelCopy?: boolean;
  showControls?: boolean;
}

const StyledTreeWrapper = styled.div`
  display: flex;
  flex-flow: column;
`;

export interface ITreeStyle {
  interactive?: boolean;
  theme: IReqoreTheme;
}

export const StyledTreeLabel = styled(ReqoreMessage)`
  flex-shrink: 1;
`;

export const ReqoreTree = ({
  data,
  mode = 'tree',
  size = 'normal',
  expanded,
  showTypes,
  onItemClick,
  withLabelCopy,
  showControls = true,
}: IReqoreTreeProps) => {
  const [_mode, setMode] = useState<'tree' | 'copy'>(mode);
  const [items, setItems] = useState({});
  const [allExpanded, setAllExpanded] = useState(expanded || !showControls);
  const [_showTypes, setShowTypes] = useState(showTypes);
  const { addNotification } = useContext(ReqoreContext);

  const handleCopyClick = () => {
    setMode('copy');
  };

  const handleTypesClick = () => {
    setShowTypes(!_showTypes);
  };

  const handleTreeClick = () => {
    setMode('tree');
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
        <div key={index} style={{ margin: level === 1 ? '15px 0' : `15px` }}>
          {isObject ? (
            <ReqoreControlGroup size={size}>
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
            <ReqoreControlGroup size={size}>
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
        </div>
      );
    });
  };

  const renderText = (data, tabs = '') => {
    let text = '';

    Object.keys(data).forEach((key) => {
      if (typeof data[key] !== 'object' || !data[key]) {
        text += `${tabs}${key}: ${data[key]}\r\n`;
      } else {
        text += `${tabs}${key}:\r\n`;
        text += renderText(data[key], `${tabs}\t`);
      }
    });

    return text;
  };

  if (!data || !Object.keys(data).length) {
    return <p>No data</p>;
  }

  const textData: string = renderText(data);
  const lineCount: number = getLineCount(textData);

  return (
    <StyledTreeWrapper className='reqore-tree'>
      {showControls && (
        <ReqoreControlGroup stack size={size}>
          {isDeep() && !allExpanded ? (
            <ReqoreButton
              flat
              className='reqore-tree-expand-all'
              icon='ArrowDownFill'
              onClick={handleExpandClick}
              key='expand-button'
            >
              Expand all
            </ReqoreButton>
          ) : null}
          {isDeep() &&
            (allExpanded || lodashSize(items) > 0 ? (
              <ReqoreButton
                flat
                className='reqore-tree-collapse-all'
                icon='ArrowUpFill'
                onClick={handleCollapseClick}
                key='collapse-button'
              >
                {' '}
                Collapse all{' '}
              </ReqoreButton>
            ) : null)}
          <ReqoreButton
            flat
            className='reqore-tree-show-types'
            icon='CodeBoxFill'
            active={_showTypes}
            onClick={handleTypesClick}
          >
            Show types
          </ReqoreButton>
          <ReqoreButton
            flat
            className='reqore-tree-as-tree'
            active={_mode === 'tree'}
            onClick={handleTreeClick}
            icon='Menu2Fill'
          >
            Tree View
          </ReqoreButton>
          <ReqoreButton
            flat
            className='reqore-tree-as-text'
            onClick={handleCopyClick}
            active={_mode === 'copy'}
            icon='ClipboardFill'
          >
            Text View
          </ReqoreButton>
        </ReqoreControlGroup>
      )}

      {_mode === 'tree' && <div>{renderTree(data, true)}</div>}

      {_mode === 'copy' && (
        <ReqoreTextarea
          className='reqore-tree-textarea'
          id='tree-content'
          defaultValue={textData}
          size={size}
          rows={lineCount > 20 ? 20 : lineCount}
        />
      )}
    </StyledTreeWrapper>
  );
};
