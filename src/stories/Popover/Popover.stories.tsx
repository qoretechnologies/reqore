import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import Popover from '../../components/Popover';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import usePopover from '../../hooks/usePopover';
import { ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Popover',
  component: Popover,
} as Meta;

const HoverButton = ({ id }) => {
  const [refElement, setRefElement] = useState(null);
  const { reqoreAddPopover, reqoreRemovePopover } = usePopover(refElement);

  return (
    <button
      type='button'
      ref={setRefElement}
      onMouseEnter={reqoreAddPopover(
        'I am a popover wooop wooptidy woop its time to get schwifty'
      )}
      onMouseLeave={reqoreRemovePopover(() => {
        console.log('removing popover');
      })}
    >
      Hover popover
    </button>
  );
};

const ClickButton = ({ id }) => {
  const [refElement, setRefElement] = useState(null);
  const { reqoreAddPopover } = usePopover(refElement);

  return (
    <button
      type='button'
      ref={setRefElement}
      onClick={reqoreAddPopover('YOOOOOOOO WHAT UP')}
    >
      Click popover
    </button>
  );
};

const Template: Story<IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider>
      <HoverButton id='test' />
      <ClickButton id='test2' />
      <HoverButton id='test3' />
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
