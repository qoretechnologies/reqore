import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreAvatar } from '../../components/Avatar';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreP } from '../../components/Paragraph';
import { SIZES } from '../../constants/sizes';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { withViewport } from '../utils/viewport';

/** A drawn portrait, in the story itself so it loads without a network. */
const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#d9a46b"/>
    <circle cx="32" cy="26" r="12" fill="#5b3a29"/>
    <ellipse cx="32" cy="58" rx="22" ry="16" fill="#2f5d7c"/>
  </svg>`
)}`;

const meta = {
  title: 'Display/Avatar',
  component: ReqoreAvatar,
  parameters: {
    docs: {
      description: {
        component:
          'One avatar for every app: a person\'s picture in a circle; without one, the person icon in a filled circle with a slight gradient; or their initials when asked (`initials`). `label` is the name: the avatar\'s accessible name, its tooltip and the source of its initials. Shared sizes, `intent`, `customTheme`, `flat={false}` for an edge and `rounded={false}` for a square.',
      },
    },
  },
  args: { label: 'Ada Lovelace' },
} as StoryMeta<typeof ReqoreAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const avatars = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll<HTMLElement>('.reqore-avatar'));

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'With no picture: the person icon in a filled circle with a slight gradient, named "Ada Lovelace".',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const [avatar] = avatars(canvasElement);
    await expect(avatar.getAttribute('aria-label')).toBe('Ada Lovelace');
    await expect(avatar.querySelector('.reqore-avatar-icon')).toBeTruthy();
    await expect(getComputedStyle(avatar).backgroundImage).toContain('linear-gradient');
  },
};

export const Fallbacks: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each way an avatar is drawn, side by side: a picture; the person icon with no picture; a picture that does not load, which falls back to the icon rather than a broken image; initials taken from the name ("AL"); and initials given ("QA").',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='center'>
      <ReqoreAvatar className='with-image' label='Ada Lovelace' image={PORTRAIT} size='big' />
      <ReqoreAvatar className='with-icon' label='Ada Lovelace' size='big' />
      <ReqoreAvatar
        className='with-broken-image'
        label='Ada Lovelace'
        image='data:image/png;base64,broken'
        size='big'
      />
      <ReqoreAvatar className='with-initials' label='Ada Lovelace' initials size='big' />
      <ReqoreAvatar className='with-given-initials' label='Quality assurance' initials='QA' size='big' />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const part = (name: string, child: string) =>
      canvasElement.querySelector(`.${name} .reqore-avatar-${child}`);
    await expect(part('with-image', 'image')).toBeTruthy();
    await expect(part('with-icon', 'icon')).toBeTruthy();
    await waitFor(() => expect(part('with-broken-image', 'icon'), 'a broken picture falls back').toBeTruthy());
    await expect(part('with-broken-image', 'image')).toBeNull();
    await expect(part('with-initials', 'initials')?.textContent).toBe('AL');
    await expect(part('with-given-initials', 'initials')?.textContent).toBe('QA');
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every shared size, micro to massive, with no picture, with initials and with a picture: each row grows from 16px to 72px across.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      {[{ kind: 'icon' }, { kind: 'initials', initials: true }, { kind: 'image', image: PORTRAIT }].map(
        ({ kind, ...props }) => (
          <ReqoreControlGroup key={kind} gapSize='big' verticalAlign='center'>
            {SIZES.map((size) => (
              <ReqoreAvatar key={size} label='Ada Lovelace' size={size} {...props} />
            ))}
          </ReqoreControlGroup>
        )
      )}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const widths = avatars(canvasElement)
      .slice(0, SIZES.length)
      .map((avatar) => Math.round(avatar.getBoundingClientRect().width));
    await expect(widths).toEqual([16, 20, 24, 32, 40, 56, 72]);
  },
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Without an intent the fill is a quiet neutral; with one, the fill is the intent\'s colour.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='center'>
      <ReqoreAvatar label='No intent' size='big' />
      {/* the named intents: a theme gives its custom ones colours of its own, and the default theme none */}
      {Object.keys(DEFAULT_INTENTS)
        .filter((intent) => !intent.startsWith('custom'))
        .map((intent) => (
          <ReqoreAvatar key={intent} label={intent} intent={intent as never} size='big' initials />
        ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const [neutral, ...intents] = avatars(canvasElement).map(
      (avatar) => getComputedStyle(avatar).backgroundImage
    );
    // some intents share a colour in the default theme; each is the intent's, never the neutral fill
    for (const fill of intents) {
      await expect(fill, 'an intent fills it with its own colour').not.toBe(neutral);
    }
  },
};

export const BorderedAndSquare: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`flat={false}` gives the avatar an edge, which keeps a picture apart from a surface of the same tone; `rounded={false}` makes it a square with rounded corners, for a team or an app rather than a person.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='center'>
      <ReqoreAvatar className='bordered' label='Ada Lovelace' image={PORTRAIT} flat={false} size='big' />
      <ReqoreAvatar className='square' label='Order team' initials='OT' rounded={false} size='big' />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const bordered = canvasElement.querySelector('.bordered') as HTMLElement;
    const square = canvasElement.querySelector('.square') as HTMLElement;
    await expect(getComputedStyle(bordered).borderTopStyle).toBe('solid');
    await expect(getComputedStyle(square).borderTopLeftRadius).toBe('10px');
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A custom theme\'s `main` is the fill, and the icon or initials are drawn in a colour that reads on it.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='center'>
      <ReqoreAvatar label='Ada Lovelace' customTheme={{ main: '#7a3cff' }} size='big' />
      <ReqoreAvatar label='Ada Lovelace' customTheme={{ main: '#f2f2f2' }} initials size='big' />
    </ReqoreControlGroup>
  ),
};

export const Tooltip: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The name is the tooltip unless `tooltip` says something else: here it adds the role.',
      },
    },
  },
  args: { tooltip: 'Ada Lovelace, reviewer', size: 'big' },
};

/** A list of comments, as a phone shows one, each headed by who wrote it. */
const COMMENTS = [
  { who: 'Ada Lovelace', image: PORTRAIT, text: 'The order sync ran twice for the same invoice.' },
  { who: 'Grace Hopper', text: 'Seen it: the retry fired before the first run had committed.' },
  { who: 'Alan Turing', initials: true, text: 'A fix is on the branch; the retry now waits for the commit.' },
];

export const InACommentListOnAPhone: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A list of comments on a phone (390px), each headed by its author\'s avatar: a picture, the person icon, initials. Long text beside it wraps; the avatars keep their size and stay round, never squeezed by the text.',
      },
    },
    qlip: { viewport: { width: 390, height: 844 } },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {COMMENTS.map(({ who, text, ...avatar }) => (
        <ReqoreControlGroup key={who} gapSize='normal' verticalAlign='flex-start' fluid>
          <ReqoreAvatar label={who} {...avatar} />
          <ReqoreP size='small'>
            <strong>{who}</strong> {text}
          </ReqoreP>
        </ReqoreControlGroup>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await withViewport(390, 844, async () => {
      for (const avatar of avatars(canvasElement)) {
        const box = avatar.getBoundingClientRect();
        await expect(Math.round(box.width), 'an avatar keeps its size').toBe(32);
        await expect(Math.round(box.height), 'and stays round').toBe(32);
      }
    });
  },
};
