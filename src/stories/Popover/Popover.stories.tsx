import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useContext, useState } from 'react';
import Popover from '../../components/Popover';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import PopoverContext from '../../context/PopoverContext';
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
      onClick={reqoreAddPopover('I am a popover wooop')}
      onMouseLeave={reqoreRemovePopover()}
    >
      Hover popover
    </button>
  );
};

const ClickButton = ({ id }) => {
  const [refElement, setRefElement] = useState(null);
  const popoverContext = useContext(PopoverContext);

  return (
    <button
      type='button'
      ref={setRefElement}
      onClick={() => {
        if (refElement) {
          popoverContext.addPopover({ id, element: refElement });
        }
      }}
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
