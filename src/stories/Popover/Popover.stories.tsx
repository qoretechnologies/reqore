import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import Popover from '../../components/Popover';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import usePopover from '../../hooks/usePopover';
import useSimplePopover from '../../hooks/useSimplePopover';
import { ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Popover',
  component: Popover,
} as Meta;

const HoverButton = ({ content, placement }: any) => {
  const [refElement, setRefElement] = useState(null);
  const { reqoreAddPopover, reqoreRemovePopover } = usePopover(refElement);

  return (
    <button
      type='button'
      ref={setRefElement}
      onMouseEnter={reqoreAddPopover(
        content || 'I am a hover tooltip',
        placement
      )}
      onMouseLeave={reqoreRemovePopover()}
    >
      Hover popover
    </button>
  );
};

const ClickButton = ({ content, placement }: any) => {
  const [refElement, setRefElement] = useState(null);
  const { reqoreAddPopover } = usePopover(refElement);

  return (
    <button
      type='button'
      ref={setRefElement}
      onClick={reqoreAddPopover(content || 'I am a hover tooltip', placement)}
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
    <ReqoreUIProvider theme={theme}>
      <HoverButton {...args} />
      <br />
      <br />
      <ClickButton {...args} />
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#d7d7d7',
  },
};

export const CustomContent = Template.bind({});
CustomContent.args = {
  content: (
    <div>
      <h1>Tooltip title</h1> Some kind of awesome tooltip text
    </div>
  ),
};

export const CustomPosition = Template.bind({});
CustomPosition.args = {
  placement: 'right',
};

const SimplePopoverElement = ({ type = 'hover' }: any) => {
  const [refElement, setRefElement] = useState(null);
  const hoverTooltip = useSimplePopover(
    refElement,
    'More information can be found here...',
    type
  );

  return (
    <p ref={setRefElement} {...hoverTooltip}>
      Hover me for more information
    </p>
  );
};

const SimpleTemplate: Story<IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <SimplePopoverElement {...args} />
    </ReqoreUIProvider>
  );
};

export const SimpleHover = SimpleTemplate.bind({});
export const SimpleClick = SimpleTemplate.bind({});
SimpleClick.args = {
  type: 'click',
};
