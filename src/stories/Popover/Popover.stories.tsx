import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqorePopoverProps } from '../../components/Popover';
import usePopover from '../../hooks/usePopover';
import { ReqoreButton, ReqoreControlGroup, ReqorePopover } from '../../index';
import { StoryMeta } from '../utils';
import { argManager, FlatArg } from '../utils/args';

const { createArg } = argManager<IReqorePopoverProps>();

const meta = {
  title: 'Other/Popover/Stories',
  component: ReqorePopover,
  args: {
    content: 'This is a popover',
    flat: true,
  },
  argTypes: {
    ...createArg('transparent', {
      defaultValue: false,
      name: 'Transparent',
      description: 'Makes the popover transparent',
      type: 'boolean',
    }),
    ...createArg('blur', {
      defaultValue: false,
      name: 'Blur',
      description: 'Makes the popover blurred',
      type: 'boolean',
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
    ...FlatArg,
  },
} as StoryMeta<typeof ReqorePopover>;

type Story = StoryObj<typeof meta>;
export default meta;

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

const Template: StoryFn<IReqorePopoverProps & { insideModal?: boolean }> = (
  args: IReqorePopoverProps & { insideModal?: boolean }
) => {
  return (
    <>
      <ReqoreControlGroup vertical gapSize='huge' horizontalAlign='flex-start'>
        <ClickButton {...args} />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  render: Template,
};
<q></q>;
