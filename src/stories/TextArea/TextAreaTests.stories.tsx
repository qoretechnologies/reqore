import { expect, jest } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { sleep } from '../../helpers/utils';
import { ReqoreTextarea } from '../../index';
import { StoryMeta } from '../utils';
import { DisabledArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTextareaProps>();

const meta = {
  title: 'Form/TextArea/Tests',
  component: ReqoreTextarea,
  args: {
    scaleWithContent: true,
    fluid: undefined,
    placeholder: 'Placeholder',
    onChange: jest.fn(),
  },
  argTypes: {
    ...MinimalArg(),
    ...DisabledArg,
    ...SizeArg,
    ...createArg('scaleWithContent', {
      name: 'Scale with content',
      description: 'Scale with content',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('fluid', {
      name: 'Fluid',
      description: 'Fluid',
      control: 'boolean',
      defaultValue: undefined,
    }),
    ...createArg('placeholder', {
      name: 'Placeholder',
      description: 'Placeholder',
      control: 'text',
      defaultValue: 'Placeholder',
    }),
  },
} as StoryMeta<typeof ReqoreTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ItemCanBeSelected: Story = {
  args: {
    templates: {
      handler: 'focus',
      useTargetWidth: true,
      noWrapper: true,
      items: [
        {
          label: 'New message in discord',
          icon: 'DiscordLine',
          description: 'When a new message in discord is received',
          items: [
            {
              divider: true,
              label: 'Discord',
            },
            {
              label: 'Author',
              description: 'Author of the message',
              value: '$state:{1.field.author}',
            },
            {
              label: 'Content',
              description: 'Content of the message',
              value: '$state:{1.field.content}',
            },
          ],
        },
        {
          label: 'New event in Google Calendar',
          icon: 'Calendar2Fill',
          description: 'When a new event is created in Google Calendar',
          items: [],
        },
      ],
    },
  },

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await sleep(200);
    await fireEvent.focusIn(document.querySelector('textarea'));
    await sleep(200);
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
    await sleep(200);
    await fireEvent.click(canvas.getAllByText('New message in discord')[0]);

    await waitFor(() => expect(canvas.getAllByText('Author')[0]).toBeTruthy(), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Author')[0]);

    await expect(canvas.getAllByText('$state:{1.field.author}')[0]).toBeTruthy();
    await expect(args.onChange).toHaveBeenCalledWith({
      target: { value: '$state:{1.field.author}' },
    });
  },
};
