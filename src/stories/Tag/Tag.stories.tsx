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

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '40px' }}>
          <h4> Basic </h4>
          <ReqoreTag label='Something' size='small' />
          <br />
          <br />
          <ReqoreTag label='Something' />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' />
          <h4> With icons </h4>
          <ReqoreTag label='Something' size='small' icon='24HoursLine' />
          <br />
          <br />
          <ReqoreTag label='Something' rightIcon='24HoursLine' />
          <br />
          <br />
          <ReqoreTag
            label='Something'
            size='big'
            icon='24HoursLine'
            rightIcon='4KLine'
          />
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
          <h4> Custom colors </h4>
          <ReqoreTag label='Something' size='small' color='#0f7c80' />
          <br />
          <br />
          <ReqoreTag label='Something' color='#702f7a' />
          <br />
          <br />
          <ReqoreTag label='Something' size='big' color='#db785a' />
          <h4> Interactive </h4>
          <ReqoreTag
            label='Something'
            size='small'
            color='#0f7c80'
            onClick={noop}
          />
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
          <ReqoreTag
            label='Something'
            size='big'
            color='#db785a'
            tooltip={{ content: 'Hello' }}
          />
          <h4> In group </h4>
          <div style={{ width: '300px' }}>
            <ReqoreTagGroup size='small'>
              <ReqoreTag label='Something' size='small' />
              <ReqoreTag label='Something' />
              <ReqoreTag label='Something' size='big' />
              <ReqoreTag label='Something' onClick={noop} size='small' />
              <ReqoreTag label='Something' onClick={noop} />
              <ReqoreTag
                label='Something'
                onClick={noop}
                onRemoveClick={noop}
                size='big'
              />
              <ReqoreTag label='Something' disabled size='small' />
              <ReqoreTag label='Something' />
              <ReqoreTag
                label='Something'
                tooltip={{ content: 'HEY MATE' }}
                size='big'
              />
            </ReqoreTagGroup>
          </div>
          <br />
          <ReqoreTagGroup>
            <ReqoreTag label='Something' size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' size='big' />
            <ReqoreTag label='Something' onClick={noop} size='small' />
            <ReqoreTag label='Something' onClick={noop} />
            <ReqoreTag
              label='Something'
              onClick={noop}
              onRemoveClick={noop}
              size='big'
            />
            <ReqoreTag label='Something' disabled size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag
              label='Something'
              tooltip={{ content: 'HEY MATE' }}
              size='big'
            />
          </ReqoreTagGroup>
          <br />
          <ReqoreTagGroup size='big'>
            <ReqoreTag label='Something' size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag label='Something' size='big' />
            <ReqoreTag label='Something' onClick={noop} size='small' />
            <ReqoreTag label='Something' onClick={noop} />
            <ReqoreTag
              label='Something'
              onClick={noop}
              onRemoveClick={noop}
              size='big'
            />
            <ReqoreTag label='Something' disabled size='small' />
            <ReqoreTag label='Something' />
            <ReqoreTag
              label='Something'
              tooltip={{ content: 'HEY MATE' }}
              size='big'
            />
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
