import { Meta, Story } from '@storybook/react/types-6-0';
import { size } from 'lodash';
import React, { useState } from 'react';
import ReqoreButton, { IReqoreButtonProps } from '../../components/Button';
import { IReqoreDropdownItemProps } from '../../components/Dropdown/item';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreUIProvider,
} from '../../index';
import { IReqoreIconName } from '../../types/icons';

export default {
  title: 'ReQore/Dropdown',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (args: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '40px' }}>
          <h4> Basic </h4>
          <ReqoreDropdown
            label='Please select'
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Custom width </h4>
          <ReqoreDropdown
            width='500px'
            label='Please select'
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Disabled if empty </h4>
          <ReqoreDropdown />
          <h4> With tooltip </h4>
          <ReqoreDropdown
            label='Check me out'
            componentProps={
              {
                tooltip: 'You looking at me???',
                tooltipPlacement: 'right',
              } as IReqoreButtonProps
            }
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
                tooltip: {
                  content: ':(',
                },
              },
            ]}
          />
          <h4> Custom icon </h4>
          <ReqoreDropdown
            icon='SunCloudyLine'
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Custom icon with caret on right</h4>
          <ReqoreDropdown
            rightIcon='SunCloudyLine'
            caretPosition='right'
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          >
            {' '}
            Weather info{' '}
          </ReqoreDropdown>
          <h4> Custom component as label </h4>
          <ReqoreDropdown
            component={ReqoreInput}
            handler='focus'
            useTargetWidth
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Filterable list </h4>
          <ReqoreDropdown
            filterable
            multiSelect
            label='Filter me pls'
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Scrollable </h4>
          <ReqoreDropdown
            label='Please select'
            placement='top'
            filterable
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export interface ISelectFieldData {
  items?: IReqoreDropdownItemProps[];
  multiSelect?: boolean;
  withCreate?: boolean;
  value?: { name: string; description?: string }[];
  tagIcon?: IReqoreIconName;
}

export interface ISelectFieldProps extends ISelectFieldData {
  onChange: (value?: string) => void;
  onRemove?: (value?: string) => void;
}

const InteractiveTemplate: Story<any> = ({ dropdownData, ...args }) => {
  const [val, setVal] = useState<any>([]);

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '40px' }}>
          <InteractiveDropdown
            value={val}
            onChange={(value) => {
              setVal([...val, { name: value }]);
            }}
            onRemove={(value) => {
              setVal([...val].filter((item) => item.name !== value));
            }}
            {...dropdownData}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

const InteractiveDropdown = ({
  onChange,
  value = [],
  withCreate,
  multiSelect,
  onRemove,
  tagIcon,
  items = [],
}: ISelectFieldProps) => {
  const [val, setVal] = useState<string>('');

  return (
    <div>
      <h4> Basic </h4>
      <ReqoreTagGroup>
        {size(value) === 0 && (
          <p
            style={{
              opacity: 0.6,
              height: '30px',
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {' '}
            No entries selected{' '}
          </p>
        )}
        {value.map((item) => (
          <ReqoreTag
            icon={tagIcon}
            key={item.name}
            label={item.name}
            tooltip={{ content: item.description }}
            onRemoveClick={
              onRemove
                ? () => {
                    onRemove(item.name);
                  }
                : undefined
            }
          />
        ))}
      </ReqoreTagGroup>
      <ReqoreControlGroup>
        {withCreate && (
          <ReqoreControlGroup stack>
            <ReqoreInput
              placeholder='Add new author manually'
              value={val}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
              onClearClick={() => setVal('')}
            />
            <ReqoreButton
              icon='AddFill'
              onClick={() => {
                onChange(val);
                setVal('');
              }}
            />
          </ReqoreControlGroup>
        )}
        <ReqoreDropdown
          label='Select existing author'
          multiSelect={multiSelect}
          items={items.map((item) => ({
            ...item,
            selected: !!value.find((v) => v.name === item.label),
            onClick: () => {
              value.find((v) => v.name === item.label)
                ? onRemove && onRemove(item.label)
                : onChange(item.label);
            },
          }))}
        />
      </ReqoreControlGroup>
    </div>
  );
};

export const Basic = Template.bind({});
export const Interactive = InteractiveTemplate.bind({});
Interactive.args = {
  dropdownData: {
    tagIcon: 'User2Line',
    items: [
      {
        label: 'Filip Witosz',
        icon: 'User2Line',
      },
      {
        label: 'David Nichols',
        icon: 'User2Line',
      },
      {
        label: 'Martin Zemek',
        icon: 'User2Line',
      },
      {
        label: 'ThisIsASuperReallyLongStringThatsNotGonnaWrap',
        intent: 'success',
      },
    ] as IReqoreDropdownItemProps[],
    multiSelect: true,
    withCreate: true,
  },
};
