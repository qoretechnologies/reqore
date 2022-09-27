import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqorePopoverProps } from '../../components/Popover';
import usePopover from '../../hooks/usePopover';
import { ReqoreButton, ReqorePopover } from '../../index';

export default {
  title: 'Components/Popover',
} as Meta<IReqorePopoverProps>;

const HoverButton = () => {
  return (
    <ReqorePopover component={ReqoreButton} content='I am shown on hover' isReqoreComponent>
      Hover popover
    </ReqorePopover>
  );
};

const ClickButton = ({ content, placement }: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,
    content: content || 'I am a tooltip on click',
    handler: 'click',
    placement,
    closeOnOutsideClick: true,
    noArrow: true,
    useTargetWidth: true,
  });

  return <ReqoreButton ref={setRefElement}>Click popover</ReqoreButton>;
};

const DelayButton = ({ content, placement }: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,
    content: content || 'I am a tooltip on click',
    placement,
    delay: 500,
  });

  return <ReqoreButton ref={setRefElement}>Tooltip with delay of 500ms</ReqoreButton>;
};

const Template: Story<IReqorePopoverProps> = (args: IReqorePopoverProps) => {
  return (
    <>
      <HoverButton />
      <br />
      <ClickButton {...args} />
      <br />
      <DelayButton {...args} />
      <br />
      <ReqorePopover
        component={ReqoreButton}
        content='I am shown on mount'
        isReqoreComponent
        openOnMount
      >
        Auto open popover
      </ReqorePopover>
    </>
  );
};

export const Basic = Template.bind({});
