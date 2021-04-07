// @flow
import { cloneDeep } from 'lodash';
import size from 'lodash/size';
import React, { useState } from 'react';
import styled from 'styled-components';
import { ReqoreTextarea } from '../..';
import { getLineCount, getTypeFromValue } from '../../helpers/utils';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreTag from '../Tag';

export interface IReqoreTreeProps {
  data: Object | Array<any>;
  mode?: 'tree' | 'copy';
  expanded?: boolean;
  showTypes?: boolean;
}

const StyledTreeWrapper = styled.div`
  display: flex;
  flex-flow: column;
`;

const StyledLabel = styled.span`
  display: inline-block;
  line-height: 30px;
  padding: 0 10px;
`;

export const ReqoreTree = ({
  data,
  mode = 'tree',
  expanded,
  showTypes,
}: IReqoreTreeProps) => {
  const [_mode, setMode] = useState<'tree' | 'copy'>(mode);
  const [items, setItems] = useState({});
  const [allExpanded, setAllExpanded] = useState(expanded);
  const [_showTypes, setShowTypes] = useState(showTypes);

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

  const handleItemClick = (key: string) => {
    const newItems = cloneDeep(items);

    if (newItems[key]) {
      delete newItems[key];
    } else {
      newItems[key] = true;
    }

    setItems(newItems);
  };

  const isDeep = () =>
    Object.keys(data).some(
      (key: string): boolean => typeof data[key] === 'object'
    );

  const renderTree = (data, k?: any, level = 1) => {
    return Object.keys(data).map((key, index) => {
      const dataType: string = getTypeFromValue(data[key]);
      const displayKey: string = key;
      const stateKey = k ? `${k}_${key}` : key;

      let isObject = typeof data[key] === 'object' && data[key] !== null;
      let isExpandable =
        typeof data[key] !== 'object' ||
        items[stateKey] ||
        (allExpanded && items[stateKey] !== false);

      if (isObject && size(data[key]) === 0) {
        isObject = false;
        isExpandable = false;
      }

      return (
        <div key={index} style={{ margin: level === 1 ? '15px 0' : `15px` }}>
          <ReqoreControlGroup>
            {isObject ? (
              <ReqoreButton
                icon={isExpandable ? 'ArrowDownSFill' : 'ArrowRightSFill'}
                active={isExpandable}
                intent={isExpandable ? 'info' : undefined}
                onClick={() => handleItemClick(stateKey)}
              >
                {displayKey}
              </ReqoreButton>
            ) : (
              <ReqoreTag label={`${displayKey}: `} />
            )}
            {_showTypes && <ReqoreTag label={dataType} />}
            {!isObject && <StyledLabel>{data[key]}</StyledLabel>}
          </ReqoreControlGroup>
          {isExpandable && isObject
            ? renderTree(data[key], stateKey, level + 1)
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

  console.log(items);

  return (
    <StyledTreeWrapper>
      <ReqoreControlGroup stack>
        {isDeep() && (
          <>
            {!allExpanded && (
              <ReqoreButton
                icon='ArrowDownFill'
                onClick={handleExpandClick}
                key='expand-button'
              >
                Expand all
              </ReqoreButton>
            )}
            {allExpanded || size(items) > 0 ? (
              <ReqoreButton
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
          icon='CodeBoxFill'
          active={_showTypes}
          onClick={handleTypesClick}
        >
          Show types
        </ReqoreButton>
        <ReqoreButton
          active={_mode === 'tree'}
          onClick={handleTreeClick}
          icon='Menu2Fill'
        >
          Tree View
        </ReqoreButton>
        <ReqoreButton
          onClick={handleCopyClick}
          active={_mode === 'copy'}
          icon='ClipboardFill'
        >
          Text View
        </ReqoreButton>
      </ReqoreControlGroup>

      {_mode === 'tree' && <div>{renderTree(data, true)}</div>}

      {_mode === 'copy' && (
        <ReqoreTextarea
          id='tree-content'
          defaultValue={textData}
          rows={lineCount > 20 ? 20 : lineCount}
        />
      )}
    </StyledTreeWrapper>
  );
};
