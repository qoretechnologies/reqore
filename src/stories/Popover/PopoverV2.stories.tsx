import { StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { ReqoreButton, ReqorePopover, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';

const OtherComponent = () => {
  const rerendered = useRef(0);

  rerendered.current += 1;

  return (
    <p>
      I also have a tooltip but I should not re-render! I re-rendered {rerendered.current} times
      already...
    </p>
  );
};

const meta = {
  title: 'Other/Popover V2',
  component: ReqorePopover,
  args: {
    content: 'This is a popover',
  },
  render: (args) => {
    return (
      <>
        <ReqorePopover {...args} _popoverId='STORY-POPOVER' openOnMount />
        <ReqoreVerticalSpacer height={50} />
        <ReqorePopover
          content='This is a popover'
          _popoverId='OTHER-STORY-POPOVER'
          component={OtherComponent}
        />
        <OtherComponent />
      </>
    );
  },
} as StoryMeta<typeof ReqorePopover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Hover me',
    component: ReqoreButton,
    isReqoreComponent: true,
    componentProps: {
      tooltip: 'Another',
    },
  },
};
