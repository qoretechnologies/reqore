import { cloneDeep, size as lodashSize } from 'lodash';
import { rgba } from 'polished';
import { useContext, useState } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePanel, ReqoreTextarea } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreContext from '../../context/ReqoreContext';
import { changeLightness } from '../../helpers/colors';
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

const StyledLabel = styled.span<ITreeStyle>`
  display: inline-block;
  line-height: 30px;
  padding: 0 10px;
  transition: all 0.2s ease-out;

  ${({ interactive, theme }: ITreeStyle) =>
    interactive &&
    css`
      cursor: pointer;

      &:hover {
        background-color: ${rgba(changeLightness(theme.main, 0.3), 0.2)};
        border-radius: 5px;
      }
    `}
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
            <ReqoreTag
              className='reqore-tree-toggle'
              icon={isObject ? (isExpandable ? 'ArrowDownSFill' : 'ArrowRightSFill') : undefined}
              intent={isObject && isExpandable ? 'info' : undefined}
              onClick={isObject ? () => handleItemClick(stateKey, isExpandable) : undefined}
              label={showTypes ? dataType : displayKey}
              labelKey={showTypes ? displayKey : undefined}
              size={size}
            />
          ) : (
            <ReqorePanel
              className='reqore-tree-label'
              onClick={onItemClick ? () => onItemClick(data[key], [...path, key]) : undefined}
              contentSize={size}
              flat
              opacity={0}
            >
              <ReqoreTag
                labelKey={displayKey}
                label={showTypes ? dataType : undefined}
                size={size}
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
              />{' '}
              {JSON.stringify(data[key])}
            </ReqorePanel>
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
          {isDeep() && (
            <>
              {!allExpanded && (
                <ReqoreButton
                  className='reqore-tree-expand-all'
                  icon='ArrowDownFill'
                  onClick={handleExpandClick}
                  key='expand-button'
                >
                  Expand all
                </ReqoreButton>
              )}
              {allExpanded || lodashSize(items) > 0 ? (
                <ReqoreButton
                  className='reqore-tree-collapse-all'
                  icon='ArrowUpFill'
                  onClick={handleCollapseClick}
                  key='collapse-button'
                >
                  {' '}
                  Collapse all{' '}
                </ReqoreButton>
              ) : null}
            </>
          )}
          <ReqoreButton
            className='reqore-tree-show-types'
            icon='CodeBoxFill'
            active={_showTypes}
            onClick={handleTypesClick}
          >
            Show types
          </ReqoreButton>
          <ReqoreButton
            className='reqore-tree-as-tree'
            active={_mode === 'tree'}
            onClick={handleTreeClick}
            icon='Menu2Fill'
          >
            Tree View
          </ReqoreButton>
          <ReqoreButton
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
