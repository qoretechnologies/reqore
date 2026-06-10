import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTestimonial,
  ReqoreUIProvider,
} from '../src';

const renderTestimonial = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <Testimonial /> with quote', () => {
  renderTestimonial(<ReqoreTestimonial quote='Best library' />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
  expect(document.querySelector('.reqore-testimonial-quote')!.textContent).toContain(
    'Best library'
  );
});

test('Renders <Testimonial /> with children when no quote prop', () => {
  renderTestimonial(<ReqoreTestimonial>Children quote</ReqoreTestimonial>);

  expect(document.querySelector('.reqore-testimonial-quote')!.textContent).toContain(
    'Children quote'
  );
});

test('Renders <Testimonial /> with author and role', () => {
  renderTestimonial(
    <ReqoreTestimonial quote='Quote' author='Avery Chen' role='Lead Engineer' />
  );

  const footer = document.querySelector('.reqore-testimonial-footer')!;
  expect(footer).toBeTruthy();
  expect(footer.querySelector('.reqore-entity-row-label')!.textContent).toContain('Avery Chen');
  expect(footer.querySelector('.reqore-entity-row-description')!.textContent).toContain(
    'Lead Engineer'
  );
});

test('Renders <Testimonial /> with avatar icon', () => {
  renderTestimonial(
    <ReqoreTestimonial quote='Quote' author='Avery Chen' avatarIcon='UserSmileLine' />
  );

  // Bare icon — no tinted icon-tile
  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(0);
  expect(document.querySelectorAll('.reqore-testimonial-footer .reqore-icon').length).toBe(1);
});

test('Renders <Testimonial /> with avatar image', () => {
  renderTestimonial(
    <ReqoreTestimonial
      quote='Quote'
      author='Avery Chen'
      avatar='https://example.com/avatar.png'
    />
  );

  const img = document.querySelector('.reqore-testimonial-footer img')!;
  expect(img).toBeTruthy();
  expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
});

test('Does not render avatar when neither avatar nor avatarIcon is provided', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' author='Avery Chen' />);

  expect(document.querySelectorAll('.reqore-testimonial-footer .reqore-icon').length).toBe(0);
  expect(document.querySelectorAll('.reqore-testimonial-footer img').length).toBe(0);
});

test('Renders <Testimonial /> with quote icon by default', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' />);

  expect(document.querySelectorAll('.reqore-testimonial-quote-icon').length).toBe(1);
});

test('Hides the quote icon when showQuoteIcon is false', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' showQuoteIcon={false} />);

  expect(document.querySelectorAll('.reqore-testimonial-quote-icon').length).toBe(0);
});

test('Renders <Testimonial /> with rating', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' rating={4} />);

  expect(document.querySelectorAll('.reqore-testimonial-rating').length).toBe(1);
});

test('Does not render rating when not provided', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' />);

  expect(document.querySelectorAll('.reqore-testimonial-rating').length).toBe(0);
});

test('Renders <Testimonial /> with badge (string)', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' author='Author' badge='Verified' />);

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('Verified');
});

test('Renders <Testimonial /> with badge object', () => {
  renderTestimonial(
    <ReqoreTestimonial
      quote='Quote'
      author='Author'
      badge={{ label: 'Customer', intent: 'success' }}
    />
  );

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('Customer');
});

test('Renders <Testimonial /> with badge array', () => {
  renderTestimonial(
    <ReqoreTestimonial
      quote='Quote'
      author='Author'
      badge={[3, { label: 'Top reviewer', intent: 'info' }]}
    />
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <Testimonial /> with actions', () => {
  renderTestimonial(
    <ReqoreTestimonial quote='Quote' actions={[{ label: 'Read more' }, { icon: 'ShareLine' }]} />
  );

  expect(document.querySelectorAll('.reqore-testimonial-actions').length).toBe(1);
  expect(document.querySelector('.reqore-testimonial-actions')!.textContent).toContain(
    'Read more'
  );
});

test('Does not render actions when not provided', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' />);

  expect(document.querySelectorAll('.reqore-testimonial-actions').length).toBe(0);
});

test('Calls onClick when card is clicked', () => {
  const handleClick = vi.fn();
  renderTestimonial(<ReqoreTestimonial quote='Quote' onClick={handleClick} />);

  fireEvent.click(document.querySelector('.reqore-testimonial')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <Testimonial /> with each intent', () => {
  renderTestimonial(
    <>
      <ReqoreTestimonial quote='Info' intent='info' />
      <ReqoreTestimonial quote='Success' intent='success' />
      <ReqoreTestimonial quote='Warning' intent='warning' />
      <ReqoreTestimonial quote='Danger' intent='danger' />
    </>
  );

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(4);
});

test('Renders <Testimonial /> with different sizes', () => {
  renderTestimonial(
    <>
      <ReqoreTestimonial quote='Tiny' size='tiny' />
      <ReqoreTestimonial quote='Small' size='small' />
      <ReqoreTestimonial quote='Normal' size='normal' />
      <ReqoreTestimonial quote='Big' size='big' />
    </>
  );

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(4);
});

test('Renders <Testimonial /> bordered with flat={false}', () => {
  renderTestimonial(<ReqoreTestimonial quote='Bordered' intent='info' flat={false} />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with rounded={false}', () => {
  renderTestimonial(<ReqoreTestimonial quote='Square' intent='success' rounded={false} />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with transparent background', () => {
  renderTestimonial(<ReqoreTestimonial quote='Transparent' intent='info' transparent />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with effect / quoteEffect / authorEffect / roleEffect', () => {
  renderTestimonial(
    <ReqoreTestimonial
      quote='Quote'
      author='Author'
      role='Role'
      intent='info'
      effect={{
        gradient: {
          colors: { 0: 'info:darken:5', 100: 'transparent' },
        },
      }}
      quoteEffect={{ italic: true }}
      authorEffect={{ uppercase: true, weight: 'bold' }}
      roleEffect={{ italic: true }}
    />
  );

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
  expect(document.querySelectorAll('.reqore-testimonial-footer').length).toBe(1);
});

test('Renders <Testimonial /> disabled', () => {
  const handleClick = vi.fn();
  renderTestimonial(
    <ReqoreTestimonial quote='Disabled' disabled onClick={handleClick} />
  );

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with raised effect', () => {
  renderTestimonial(<ReqoreTestimonial quote='Raised' raised />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with wrap=false (single-line ellipsis)', () => {
  renderTestimonial(
    <ReqoreTestimonial
      quote='A very long quote that should ellipsize when wrap is false'
      wrap={false}
    />
  );

  expect(document.querySelectorAll('.reqore-testimonial-quote').length).toBe(1);
});

test('Does not render footer when no attribution provided', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote only' />);

  expect(document.querySelectorAll('.reqore-testimonial-footer').length).toBe(0);
});

test('Renders <Testimonial /> with padded=false', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' padded={false} />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with padded="horizontal"', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' padded='horizontal' />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with padded="vertical"', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' padded='vertical' />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with custom paddingSize', () => {
  renderTestimonial(<ReqoreTestimonial quote='Quote' size='big' paddingSize='small' />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});

test('Renders <Testimonial /> with custom theme', () => {
  renderTestimonial(<ReqoreTestimonial quote='Themed' customTheme={{ main: '#2c1a4d' }} />);

  expect(document.querySelectorAll('.reqore-testimonial').length).toBe(1);
});
