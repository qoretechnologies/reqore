import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React from 'react';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Tag',
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
          <ReqoreTag label='Something' size='tiny' />
          <br />
          <br />
          <ReqoreTag label='Something' size='small' />
          <br />
          <br />
          <ReqoreTag label='Something' />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' />
          <br />
          <br />
          <ReqoreTag label='Something' size='huge' />
          <h4> Badge </h4>
          <ReqoreTag label='123' size='small' badge />
          <br />
          <br />
          <ReqoreTag label='123' badge icon='24HoursLine' />
          <br />
          <br />
          <ReqoreTag label='123' size='big' badge />
          <h4> With icons </h4>
          <ReqoreTag label='Something' size='small' icon='24HoursLine' />
          <br />
          <br />
          <ReqoreTag label='Something' rightIcon='24HoursLine' />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' icon='24HoursLine' rightIcon='4KLine' />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            rightIcon='24HoursLine'
            icon='24HoursLine'
            onRemoveClick={noop}
          />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            rightIcon='24HoursLine'
            icon='24HoursLine'
            onRemoveClick={noop}
            disabled
          />
          <h4> Disabled </h4>
          <ReqoreTag label='Something' size='small' disabled />
          <br />
          <br />
          <ReqoreTag label='Something' disabled onRemoveClick={noop} />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' disabled />
          <h4> Custom actions </h4>
          <ReqoreTag
            label='Something'
            size='small'
            actions={[
              {
                icon: 'AccountPinBoxFill',
                tooltip: {
                  content: 'Hey yo',
                },
              },
              {
                icon: 'Anticlockwise2Line',
                tooltip: {
                  content: 'Disabled :(',
                },
                disabled: true,
              },
              {
                icon: 'BankCardLine',
                tooltip: {
                  handler: 'click',
                  noArrow: true,
                  content: 'Super special tooltip',
                },
              },
            ]}
          />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            actions={[
              {
                icon: 'AccountPinBoxFill',
                tooltip: {
                  content: 'Hey yo',
                },
              },
              {
                icon: 'Anticlockwise2Line',
                tooltip: {
                  content: 'Disabled :(',
                },
                disabled: true,
              },
              {
                icon: 'BankCardLine',
                tooltip: {
                  handler: 'click',
                  noArrow: true,
                  content: 'Super special tooltip',
                },
              },
            ]}
          />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            size='big'
            actions={[
              {
                icon: 'AccountPinBoxFill',
                tooltip: {
                  content: 'Hey yo',
                },
                onClick: () => alert('clicked first action'),
              },
              {
                icon: 'Anticlockwise2Line',
                tooltip: {
                  content: 'Disabled :(',
                },
                disabled: true,
                onClick: () => alert('clicked middle action'),
              },
              {
                icon: 'BankCardLine',
                tooltip: {
                  handler: 'click',
                  noArrow: true,
                  content: 'Super special tooltip',
                },
                onClick: () => alert('clicked last action'),
              },
            ]}
            onRemoveClick={() => alert('clicked remove')}
          />
          <h4> Intent </h4>
          <ReqoreTag label='Something' size='small' intent='danger' />
          <br />
          <br />
          <ReqoreTag label='Something' intent='success' />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            size='big'
            intent='info'
            actions={[
              {
                icon: 'AccountPinBoxFill',
                tooltip: {
                  content: 'Hey yo',
                },
                onClick: () => alert('clicked first action'),
              },
              {
                icon: 'Anticlockwise2Line',
                tooltip: {
                  content: 'Disabled :(',
                },
                disabled: true,
                onClick: () => alert('clicked middle action'),
              },
              {
                icon: 'BankCardLine',
                tooltip: {
                  handler: 'click',
                  noArrow: true,
                  content: 'Super special tooltip',
                },
                onClick: () => alert('clicked last action'),
              },
            ]}
          />
          <h4> Custom colors </h4>
          <ReqoreTag label='Something' size='small' color='#0f7c80' />
          <br />
          <br />
          <ReqoreTag label='Something' color='#702f7a' />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' color='#db785a' />
          <h4> Icons only </h4>
          <ReqoreTag size='small' icon='AccountCircleLine' />
          <br />
          <br />
          <ReqoreTag size='normal' icon='ArrowGoBackFill' />
          <br />
          <br />
          <ReqoreTag size='big' icon='BarChartBoxLine' />
          <br />
          <br />
          <ReqoreTag size='normal' icon='ArrowGoBackFill' rightIcon='Compass3Line' />
          <h4> Interactive </h4>
          <ReqoreTag label='Something' size='small' color='#0f7c80' onClick={noop} />
          <br />
          <br />
          <ReqoreTag label='Something' color='#702f7a' onClick={noop} />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' onClick={noop} />
          <h4> Removable </h4>
          <ReqoreTag
            label='Something'
            size='small'
            color='#0f7c80'
            onRemoveClick={noop}
            onClick={noop}
          />
          <br />
          <br />
          <ReqoreTag label='Something' color='#702f7a' onRemoveClick={noop} />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' onRemoveClick={noop} />
          <h4> With tooltip </h4>
          <ReqoreTag
            label='Something'
            size='small'
            color='#0f7c80'
            tooltip={{ content: 'Hello' }}
          />
          <br />
          <br />
          <ReqoreTag label='Something' tooltip={{ content: 'Hello' }} />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' color='#db785a' tooltip={{ content: 'Hello' }} />
          <h4> In group </h4>
          <div style={{ width: '300px' }}>
            <ReqoreTagGroup size='small'>
              <ReqoreTag label='Something' size='small' />
              <ReqoreTag label='Something' />
              <ReqoreTag label='Something' size='big' />
              <ReqoreTag label='Something' onClick={noop} size='small' />
              <ReqoreTag label='Something' onClick={noop} />
              <ReqoreTag label='Something' onClick={noop} onRemoveClick={noop} size='big' />
              <ReqoreTag label='Something' disabled size='small' />
              <ReqoreTag label='Something' />
              <ReqoreTag label='Something' tooltip={{ content: 'HEY MATE' }} size='big' />
            </ReqoreTagGroup>
          </div>
          <br />
          <ReqoreTagGroup>
            <ReqoreTag label='Something' size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' size='big' />
            <ReqoreTag label='Something' onClick={noop} size='small' />
            <ReqoreTag label='Something' onClick={noop} />
            <ReqoreTag label='Something' onClick={noop} onRemoveClick={noop} size='big' />
            <ReqoreTag label='Something' disabled size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' tooltip={{ content: 'HEY MATE' }} size='big' />
          </ReqoreTagGroup>
          <br />
          <ReqoreTagGroup size='big'>
            <ReqoreTag label='Something' size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' size='big' />
            <ReqoreTag label='Something' onClick={noop} size='small' />
            <ReqoreTag label='Something' onClick={noop} />
            <ReqoreTag label='Something' onClick={noop} onRemoveClick={noop} size='big' />
            <ReqoreTag label='Something' disabled size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' tooltip={{ content: 'HEY MATE' }} size='big' />
          </ReqoreTagGroup>
          <h4> In group with columns </h4>
          <ReqoreTagGroup size='big' columns={3}>
            <ReqoreTag label='Something' size='small' />
            <ReqoreTag label='Something incredibly long and weird and actually even longer and weirder' />
            <ReqoreTag label='Something' />
            <ReqoreTag
              label='Something incredibly long and weird and actually even longer and weirder'
              size='big'
              icon='AccountPinBoxFill'
              rightIcon='Anticlockwise2Line'
              onClick={noop}
              actions={[
                {
                  icon: 'AccountPinBoxFill',
                  tooltip: {
                    content: 'Hey yo',
                  },
                  onClick: () => alert('clicked first action'),
                },
                {
                  icon: 'Anticlockwise2Line',
                  tooltip: {
                    content: 'Disabled :(',
                  },
                  disabled: true,
                  onClick: () => alert('clicked middle action'),
                },
                {
                  icon: 'BankCardLine',
                  tooltip: {
                    handler: 'click',
                    noArrow: true,
                    content: 'Super special tooltip',
                  },
                  onClick: () => alert('clicked last action'),
                },
              ]}
              onRemoveClick={() => alert('clicked remove')}
            />
            <ReqoreTag label='Something' onClick={noop} />
            <ReqoreTag label='Something' onClick={noop} onRemoveClick={noop} size='big' />
            <ReqoreTag label='Something' disabled size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' tooltip={{ content: 'HEY MATE' }} size='big' />
          </ReqoreTagGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const WithLightColor = Template.bind({});
WithLightColor.args = {
  theme: {
    main: '#ffffff',
  },
};
