import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IReqoreColumnsProps } from '../../components/Columns';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreColumn,
  ReqoreColumns,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Columns',
  component: ReqoreColumns,
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps & { segment: IReqoreColumnsProps }> = ({
  segment,
  ...args
}: IReqoreUIProviderProps & { segment: IReqoreColumnsProps }) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4> Default </h4>
          <ReqoreColumns {...segment}>
            <ReqoreColumn style={{ border: '1px solid red' }}>1st column</ReqoreColumn>
            <ReqoreColumn style={{ border: '1px solid red' }}>2nd column</ReqoreColumn>
          </ReqoreColumns>
          <h4> Custom align & justify </h4>
          <ReqoreColumns {...segment}>
            <ReqoreColumn style={{ border: '1px solid red' }}>1st column</ReqoreColumn>
            <ReqoreColumn style={{ border: '1px solid red' }} justifyContent='center'>
              2nd column
            </ReqoreColumn>
          </ReqoreColumns>
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

export const CustomColumns = Template.bind({});
CustomColumns.args = {
  segment: {
    columns: 2,
    columnsGap: '20px',
    alignItems: 'stretch',
  } as IReqoreColumnsProps,
};
