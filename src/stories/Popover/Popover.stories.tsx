import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqorePopoverProps } from '../../components/Popover';
import usePopover from '../../hooks/usePopover';
import { ReqoreButton, ReqoreMessage, ReqorePanel, ReqorePopover } from '../../index';
import { argManager } from '../utils/args';

const { createArg } = argManager<IReqorePopoverProps>();

export default {
  title: 'Components/Popover',
  argTypes: {
    ...createArg('opaque', {
      defaultValue: false,
      name: 'Opaque',
      description: 'Makes the popover opaque',
      type: 'boolean',
    }),
    ...createArg('blur', {
      defaultValue: 0,
      name: 'Blur',
      description: 'Makes the popover blurred',
      type: 'number',
    }),
    ...createArg('maxHeight', {
      defaultValue: undefined,
      name: 'Max Height',
      description: 'Sets the max height of the popover',
      type: 'string',
    }),
    ...createArg('maxWidth', {
      defaultValue: undefined,
      name: 'Max Width',
      description: 'Sets the max width of the popover',
      type: 'string',
    }),
    ...createArg('content', {
      defaultValue: 'This is a popover',
      name: 'Content',
      description: 'The content of the popover',
      type: 'string',
    }),
  },
} as Meta<IReqorePopoverProps>;

const HoverButton = (args: any) => {
  return (
    <ReqorePopover component={ReqoreButton} isReqoreComponent {...args}>
      Hover popover
    </ReqorePopover>
  );
};

const ClickButton = (args: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,
    handler: 'click',
    closeOnOutsideClick: true,
    noArrow: true,
    useTargetWidth: true,
    ...args,
  });

  return <ReqoreButton ref={setRefElement}>Click popover</ReqoreButton>;
};

const DelayButton = (args: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,

    delay: 500,
    ...args,
  });

  return <ReqoreButton ref={setRefElement}>Tooltip with delay of 500ms</ReqoreButton>;
};

const HoverStayButton = (args: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,
    handler: 'hoverStay',
    ...args,
  });

  return (
    <ReqoreButton ref={setRefElement}>Tooltip with hover start and click end events</ReqoreButton>
  );
};

const Template: Story<IReqorePopoverProps> = (args: IReqorePopoverProps) => {
  return (
    <>
      <HoverButton {...args} />
      <br />
      <ClickButton {...args} />
      <br />
      <DelayButton {...args} />
      <br />
      <HoverStayButton {...args} />
      <br />
      <ReqorePopover {...args} component={ReqoreButton} isReqoreComponent openOnMount>
        Auto open popover
      </ReqorePopover>
    </>
  );
};

export const Basic = Template.bind({});
export const CustomContent = Template.bind({});
CustomContent.args = {
  content: (
    <ReqorePanel label='This is a test' flat>
      <ReqoreMessage flat>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into
      </ReqoreMessage>
    </ReqorePanel>
  ),
};

export const Blurred = Template.bind({});
Blurred.args = {
  blur: 4,
  content: (
    <ReqorePanel label='This is a test' flat>
      <ReqoreMessage flat>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into
      </ReqoreMessage>
    </ReqorePanel>
  ),
};
