import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreTestimonial, { IReqoreTestimonialProps } from '../../components/Testimonial';
import { TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';
import { ALL_SIZES } from '../utils/args';

const meta = {
  title: 'Display/Testimonial/Stories',
  component: ReqoreTestimonial,
} as StoryMeta<typeof ReqoreTestimonial>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_QUOTE =
  'Reqore lets our team ship dashboards in hours instead of days — the theming and effect system alone has saved us weeks of CSS work.';

export const Basic: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer · Northwind',
    avatarIcon: 'UserSmileLine',
    rating: 5,
  },
};

export const WithAvatarImage: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Mira Patel',
    role: 'Director of Platform · Acme',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
    rating: 4.5,
  },
};

export const WithBadge: Story = {
  args: {
    quote: 'The migration story is solid — drop-in components, predictable theming.',
    author: 'Jonas Weber',
    role: 'Frontend Architect',
    avatarIcon: 'UserSmileLine',
    badge: { label: 'Customer', intent: 'success', minimal: true },
    rating: 5,
  },
};

export const WithActions: Story = {
  args: {
    quote: 'Best component library decision we made this year.',
    author: 'Priya Raman',
    role: 'Engineering Manager',
    avatarIcon: 'UserSmileLine',
    rating: 5,
    actions: [
      { label: 'Read case study', icon: 'ExternalLinkLine' },
      { icon: 'ShareLine', tooltip: 'Share', minimal: true, flat: true },
    ],
  },
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreTestimonial
        {...args}
        intent='info'
        quote='Reqore plugs into our design system without fighting our existing tokens.'
        author='Jonas Weber'
        role='Frontend Architect'
        avatarIcon='UserSmileLine'
        rating={5}
      />
      <ReqoreTestimonial
        {...args}
        intent='success'
        quote='Migration done in a sprint. No regressions, no surprises.'
        author='Mira Patel'
        role='Director of Platform · Acme'
        avatarIcon='UserSmileLine'
        rating={5}
      />
      <ReqoreTestimonial
        {...args}
        intent='warning'
        quote='A few rough edges around dark mode but the team responds fast.'
        author='Sam Liu'
        role='UX Lead'
        avatarIcon='UserSmileLine'
        rating={3.5}
      />
      <ReqoreTestimonial
        {...args}
        intent='danger'
        quote='Critical feedback — needs better keyboard nav in the dropdown.'
        author='Rita Alvarez'
        role='Accessibility Engineer'
        avatarIcon='UserSmileLine'
        rating={2.5}
      />
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreTestimonial
        size='tiny'
        quote='Tiny size'
        author='A. Tiny'
        role='Compact card'
        avatarIcon='UserSmileLine'
      />
      <ReqoreTestimonial
        size='small'
        quote='Small size'
        author='S. Small'
        role='Medium card'
        avatarIcon='UserSmileLine'
      />
      <ReqoreTestimonial
        size='normal'
        quote='Normal size'
        author='N. Normal'
        role='Default'
        avatarIcon='UserSmileLine'
      />
      <ReqoreTestimonial
        size='big'
        quote='Big size'
        author='B. Big'
        role='Hero card'
        avatarIcon='UserSmileLine'
      />
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    intent: 'info',
    flat: false,
  },
};

export const Square: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    intent: 'success',
    rounded: false,
  },
};

export const Transparent: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    intent: 'info',
    transparent: true,
  },
};

export const NoQuoteIcon: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    showQuoteIcon: false,
  },
};

export const NoRating: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
  },
};

export const QuoteOnly: Story = {
  args: {
    quote: 'Ship faster. Stay consistent. Reqore.',
  },
};

export const Disabled: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    disabled: true,
    actions: [{ label: 'Read more' }],
  },
};

export const Tooltip: Story = {
  args: {
    quote: 'Hover the card to see the tooltip.',
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    tooltip: 'Submitted via the customer feedback form.',
  },
};

export const Clickable: Story = {
  args: {
    quote: 'Click anywhere on the card to read the full story.',
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    rating: 5,
    onClick: () => alert('Card clicked'),
  },
};

export const WithEffects: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    intent: 'info',
    rating: 5,
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to bottom right',
      },
    },
    quoteEffect: { italic: true },
    authorEffect: { uppercase: true, spaced: 1, weight: 'bold' },
    roleEffect: { opacity: 0.6 },
  },
};

export const CustomTheme: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    customTheme: { main: '#2c1a4d' },
    rating: 5,
  },
};

export const Raised: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    rating: 5,
    raised: true,
  },
};

export const NoWrap: Story = {
  args: {
    quote:
      'A very long quote that would normally span multiple lines but here is forced onto a single line and ellipsized at the boundary of the available width.',
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    wrap: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const Fixed: Story = {
  args: {
    quote: SAMPLE_QUOTE,
    author: 'Avery Chen',
    role: 'Lead Engineer',
    avatarIcon: 'UserSmileLine',
    fixed: true,
  },
};

const TESTIMONIAL_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderTestimonialMatrix = (variantArgs: Partial<IReqoreTestimonialProps>) =>
  TESTIMONIAL_SIZES.map((size) => (
    <ReqoreTestimonial
      key={size}
      quote={`size=${size} — ${SAMPLE_QUOTE}`}
      author='Avery Chen'
      role='Lead Engineer · Northwind'
      avatarIcon='UserSmileLine'
      rating={4.5}
      size={size}
      {...variantArgs}
    />
  ));

export const Unpadded: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 700 }}>
      {renderTestimonialMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 700 }}>
      {renderTestimonialMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 700 }}>
      {renderTestimonialMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 700 }}>
      {TESTIMONIAL_SIZES.map((size) => (
        <ReqoreTestimonial
          key={size}
          quote={`size=${size} with paddingSize='small' — ${SAMPLE_QUOTE}`}
          author='Avery Chen'
          role='Lead Engineer · Northwind'
          avatarIcon='UserSmileLine'
          rating={4.5}
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const RadiusSize: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 700 }}>
      {ALL_SIZES.map((radiusSize) => (
        <ReqoreTestimonial
          key={radiusSize}
          quote={`radiusSize="${radiusSize}" — ${SAMPLE_QUOTE}`}
          author='Avery Chen'
          role='Lead Engineer · Northwind'
          avatarIcon='UserSmileLine'
          radiusSize={radiusSize}
          rating={5}
          size='normal'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
