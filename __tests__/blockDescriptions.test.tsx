import { render } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import {
  ReqoreButton,
  ReqoreCallout,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreEntityRow,
  ReqoreFeatureCard,
  ReqoreLayoutContent,
  ReqoreP,
  ReqoreSeverityRow,
  ReqoreTestimonial,
  ReqoreTier,
  ReqoreUIProvider,
} from '../src';

/**
 * A `description` (and a testimonial's `quote`) takes block content.
 *
 * Consumers pass paragraphs and control groups there. Drawn inside a `<p>`, that is invalid HTML:
 * the browser's parser closes the paragraph at the first block, moving the content out of it and
 * out of its styling, and React warns ("validateDOMNesting: <div> cannot appear as a descendant
 * of <p>"). The text is drawn in a block container with the same typography instead, and the
 * component around it is a block too — a `span` may not hold one either.
 *
 * React warns about a nesting pair once per page, so the structure is checked as well.
 */

/** Block content, as consumers pass it. */
const BLOCK_CONTENT = (
  <>
    <ReqoreP className='reqore-probe-paragraph'>First paragraph</ReqoreP>
    <ReqoreControlGroup className='reqore-probe-group'>
      <ReqoreButton>Action</ReqoreButton>
    </ReqoreControlGroup>
  </>
);

const PLAIN_TEXT = 'Plain text description';

/** Each component, given a description, and the class of the element that draws it. */
const COMPONENTS: [string, string, (description: ReactNode) => ReactElement][] = [
  [
    'ReqoreEntityRow',
    'reqore-entity-row-description',
    (description) => <ReqoreEntityRow label='Label' description={description} />,
  ],
  [
    'ReqoreSeverityRow',
    'reqore-severity-row-description',
    (description) => <ReqoreSeverityRow label='Label' description={description} />,
  ],
  [
    'ReqoreCallout with a label',
    'reqore-callout-description',
    (description) => <ReqoreCallout label='Label' description={description} />,
  ],
  [
    'ReqoreCallout with a label and children',
    'reqore-callout-description',
    (description) => (
      <ReqoreCallout label='Label' description={description}>
        Body
      </ReqoreCallout>
    ),
  ],
  [
    'ReqoreFeatureCard',
    'reqore-feature-card-description',
    (description) => <ReqoreFeatureCard label='Label' description={description} />,
  ],
  [
    'ReqoreTier',
    'reqore-tier-description',
    (description) => <ReqoreTier name='Tier' price={10} currency='$' description={description} />,
  ],
  [
    'ReqoreTier, modern',
    'reqore-tier-description',
    (description) => (
      <ReqoreTier
        appearance='modern'
        name='Tier'
        price={10}
        currency='$'
        description={description}
      />
    ),
  ],
  [
    'ReqoreTestimonial',
    'reqore-testimonial-quote-text',
    (quote) => <ReqoreTestimonial quote={quote} />,
  ],
];

const renderInProvider = (element: ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{element}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const getNestingWarnings = (): string[] =>
  vi
    .mocked(console.error)
    .mock.calls.map((args) => args.map(String).join(' '))
    .filter((message) => message.includes('validateDOMNesting'));

/** Block elements the parser would not leave where they are: in a `<p>`, or in a `<span>`. */
const findMisplacedBlocks = (root: Element): string[] =>
  Array.from(root.querySelectorAll('p div, p p, p ul, p ol, span div, span p'))
    .filter((element) => root.contains(element))
    .map((element) => {
      const parent = element.parentElement.closest('p, span');

      return `<${element.tagName.toLowerCase()}> in <${parent.tagName.toLowerCase()}${
        parent.className ? `.${Array.from(parent.classList).join('.')}` : ''
      }>`;
    });

describe('a description given block content', () => {
  beforeEach(() => {
    vi.mocked(console.error).mockClear();
  });

  test.each(COMPONENTS)('%s draws it in a block, not a paragraph', (_name, className, build) => {
    const { container } = renderInProvider(build(BLOCK_CONTENT));
    const description = container.querySelector(`.${className}`);

    expect(description).not.toBeNull();
    expect(description.tagName).toBe('DIV');
    // The content is where it was put, inside the description.
    expect(description.querySelector('.reqore-probe-paragraph')).toHaveTextContent(
      'First paragraph'
    );
    expect(description.querySelector('.reqore-probe-group')).not.toBeNull();
    expect(findMisplacedBlocks(container)).toEqual([]);
    expect(getNestingWarnings()).toEqual([]);
  });
});

describe('a plain-text description', () => {
  test.each(COMPONENTS)('%s draws the text alone, as before', (_name, className, build) => {
    const { container } = renderInProvider(build(PLAIN_TEXT));
    const description = container.querySelector(`.${className}`);

    expect(description).toHaveTextContent(PLAIN_TEXT);
    // The text is the container's only content: no wrapper was added around it.
    expect(description.childNodes).toHaveLength(1);
    expect(description.firstChild.nodeType).toBe(Node.TEXT_NODE);
    expect(findMisplacedBlocks(container)).toEqual([]);
  });

  test('is drawn with the same styles as a paragraph', () => {
    // styled-components names a class after the CSS it generates, so the same classes mean the
    // same styles: rendering the paragraph as a `div` changed the element and nothing else.
    const { container } = renderInProvider(
      <>
        <ReqoreP size='small' effect={{ opacity: 0.7 }} className='reqore-probe-p'>
          {PLAIN_TEXT}
        </ReqoreP>
        <ReqoreP as='div' size='small' effect={{ opacity: 0.7 }} className='reqore-probe-p'>
          {PLAIN_TEXT}
        </ReqoreP>
      </>
    );
    const [paragraph, block] = Array.from(container.querySelectorAll('.reqore-probe-p'));

    expect(paragraph.tagName).toBe('P');
    expect(block.tagName).toBe('DIV');
    expect(block.className).toBe(paragraph.className);
  });
});

describe('the nesting detector', () => {
  test('finds a block in a paragraph and in a span', () => {
    const { container } = renderInProvider(
      <>
        <p className='reqore-probe'>
          <span>
            <b>Inline is fine</b>
          </span>
        </p>
        <span className='reqore-probe'>
          <div>Block</div>
        </span>
      </>
    );

    expect(findMisplacedBlocks(container)).toEqual(['<div> in <span.reqore-probe>']);
  });
});
