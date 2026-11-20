import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreMarkdownBlock } from '../../components/MarkdownBlock';
import { ReqoreH2, ReqoreP } from '../../index';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Display/Markdown Block',
  component: ReqoreMarkdownBlock,
  argTypes: {
    ...SizeArg,
  },
} as StoryMeta<typeof ReqoreMarkdownBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What a Markdown renderer hands back for a template's description, as plain elements: the block
 * styles them by tag, whatever drew them.
 */
const TemplateDescription = () => (
  <>
    <h1>Order Sync</h1>
    <p>
      Copies every new order from the shop into the ERP within a minute, and marks it{' '}
      <strong>synced</strong> on the shop once the ERP accepts it. Orders that fail validation stay
      in the shop with a note saying why.
    </p>
    <h4>What it needs</h4>
    <ul>
      <li>
        A shop connection with the <code>orders:read</code> scope
      </li>
      <li>An ERP connection that can create sales orders</li>
    </ul>
    <blockquote>Runs every minute; a run that finds nothing to copy ends at once.</blockquote>
    <pre>
      <code>{'interval: 60s\nretry: 3 times, 30s apart'}</code>
    </pre>
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>From</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Customer</td>
          <td>shop.customer.email</td>
        </tr>
        <tr>
          <td>Lines</td>
          <td>shop.line_items</td>
        </tr>
      </tbody>
    </table>
    <p>
      See <a href='#setup'>the setup guide</a> for the connections.
    </p>
  </>
);

const px = (element: Element) => parseFloat(getComputedStyle(element).fontSize);

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a template\'s description as a Markdown renderer hands it back, inside a 640px drawer section under the section\'s own heading: the "# Order Sync" heading is one step above the body and bold, never larger than the section title above it; the prose is the body size in the secondary grey, about 72 characters a line; the list, inline and block code, quote, table and link take the theme\'s type and hairlines.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 640 }}>
      <ReqoreH2 className='story-section-title'>Description</ReqoreH2>
      <ReqoreMarkdownBlock {...args}>
        <TemplateDescription />
      </ReqoreMarkdownBlock>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const block = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>('.reqore-markdown-block');

      expect(element).toBeTruthy();

      return element!;
    });
    const h1 = block.querySelector('h1')!;
    const h4 = block.querySelector('h4')!;
    const p = block.querySelector('p')!;

    // A heading is at most one step above the body, never as loud as the page's titles.
    expect(px(h1)).toBeGreaterThan(px(p));
    expect(px(h1)).toBeLessThan(px(canvasElement.querySelector('.story-section-title')!));
    expect(px(h4)).toBe(px(p));
    // Prose holds a readable measure.
    expect(p.getBoundingClientRect().width).toBeLessThan(block.getBoundingClientRect().width);
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same paragraph and heading at small, normal and big: the body and its headings scale with `size`, the headings one step above the body each time.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 640 }}>
      {(['small', 'normal', 'big'] as const).map((size) => (
        <ReqoreMarkdownBlock key={size} size={size} data-size={size}>
          <h2>{`Heading at ${size}`}</h2>
          <p>The body of a description, at the size its block was given.</p>
        </ReqoreMarkdownBlock>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = (size: string) =>
      px(canvasElement.querySelector(`[data-size="${size}"] p`)!);

    await waitFor(() => expect(body('small')).toBeGreaterThan(0));
    expect(body('small')).toBeLessThan(body('normal'));
    expect(body('normal')).toBeLessThan(body('big'));
  },
};

export const FullWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a long paragraph with `measure={false}`: the prose fills its 960px box instead of wrapping at about 72 characters.',
      },
    },
  },
  render: () => (
    <div style={{ width: 960 }}>
      <ReqoreMarkdownBlock measure={false}>
        <ReqoreP>
          A paragraph that may run the whole width of its box, for a surface where the box is
          already as narrow as a line should be, or where the text is a table of facts rather than
          prose a person reads line by line.
        </ReqoreP>
      </ReqoreMarkdownBlock>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector<HTMLElement>('.reqore-markdown-block')!;

    await waitFor(() =>
      expect(block.querySelector('p')!.getBoundingClientRect().width).toBeGreaterThan(900)
    );
  },
};
