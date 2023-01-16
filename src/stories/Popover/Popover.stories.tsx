import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqorePopoverProps } from '../../components/Popover';
import usePopover from '../../hooks/usePopover';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqorePopover,
  ReqoreSpacer
} from '../../index';
import { argManager, FlatArg } from '../utils/args';

const { createArg } = argManager<IReqorePopoverProps>();

export default {
  title: 'Components/Popover',
  argTypes: {
    ...createArg('transparent', {
      defaultValue: false,
      name: 'Transparent',
      description: 'Makes the popover transparent',
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
    ...FlatArg,
  },
  args: {
    flat: true,
  },
} as Meta<IReqorePopoverProps>;

const HoverButton = (args: any) => {
  return (
    <ReqorePopover component={ReqoreButton} isReqoreComponent {...args} fixed>
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
      <ReqoreControlGroup vertical gapSize='huge' horizontalAlign='flex-start'>
        <HoverButton {...args} />
        <ClickButton {...args} />
        <DelayButton {...args} />
        <HoverStayButton {...args} />
        {typeof args.content === 'string' && (
          <>
            <ReqoreSpacer height={100} />
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              title='I opened on my own'
              icon='CactusFill'
              intent='success'
              placement='top'
            >
              Full popover
            </ReqorePopover>
            <ReqoreControlGroup>
              <ReqoreSpacer width={190} />
              <ReqorePopover
                {...args}
                component={ReqoreButton}
                isReqoreComponent
                openOnMount
                intent='info'
                minimal
                placement='left'
              >
                Minimal popover
              </ReqorePopover>
            </ReqoreControlGroup>
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              icon='CactusFill'
              effect={{
                gradient: {
                  colors: {
                    0: 'warning',
                    100: 'warning:darken:2',
                  },
                },
                spaced: 2,
                uppercase: true,
                weight: 'thick',
              }}
              placement='right'
            >
              Effect popover
            </ReqorePopover>
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              transparent
              placement='right'
            >
              Transparent popover
            </ReqorePopover>
          </>
        )}
        <ReqorePopover
          {...args}
          component={ReqoreButton}
          isReqoreComponent
          openOnMount
          placement='right'
        >
          Auto open popover
        </ReqorePopover>
        <ReqorePanel label='This is a test' flat>
          <ReqorePopover
            {...args}
            component={ReqoreButton}
            isReqoreComponent
            openOnMount
            placement='bottom'
            title="I'm a title"
            content={
              <ReqorePanel label='This is a test' flat>
                <ReqoreMessage flat>
                  In to am attended desirous raptures declared diverted confined at. Collected
                  instantly remaining up certainly to necessary as. Over walk dull into
                </ReqoreMessage>
              </ReqorePanel>
            }
          >
            With Custom Content inside a panel
          </ReqorePopover>
        </ReqorePanel>
      </ReqoreControlGroup>
    </>
  );
};

export const Basic = Template.bind({});
export const NotFlat = Template.bind({});
NotFlat.args = {
  flat: false,
};
export const CustomContent = Template.bind({});
CustomContent.args = {
  noWrapper: true,
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
