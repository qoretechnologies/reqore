import { fireEvent, render } from '@testing-library/react';
import { ReqoreAvatar, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { AVATAR_SIZE_FROM_SIZE, getAvatarInitials } from '../src/components/Avatar';

const renderAvatar = (props: Partial<React.ComponentProps<typeof ReqoreAvatar>> = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAvatar {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const avatar = () => document.querySelector('.reqore-avatar') as HTMLElement;

describe('ReqoreAvatar', () => {
  test('without a picture it is the person icon, named by its label', () => {
    renderAvatar({ label: 'Ada Lovelace' });

    expect(avatar()).toBeTruthy();
    expect(avatar().getAttribute('role')).toBe('img');
    expect(avatar().getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(avatar().querySelector('.reqore-avatar-icon')).toBeTruthy();
    expect(avatar().querySelector('.reqore-avatar-image')).toBeNull();
    expect(avatar().querySelector('.reqore-avatar-initials')).toBeNull();
  });

  test('with a picture it is the picture, and the picture says nothing of its own', () => {
    renderAvatar({ label: 'Ada Lovelace', image: 'https://example.com/ada.png' });

    const img = avatar().querySelector('.reqore-avatar-image') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/ada.png');
    expect(img.getAttribute('alt')).toBe('');
    expect(avatar().querySelector('.reqore-avatar-icon')).toBeNull();
  });

  test('a picture that does not load falls back to the icon', () => {
    renderAvatar({ label: 'Ada Lovelace', image: 'https://example.com/missing.png' });

    fireEvent.error(avatar().querySelector('.reqore-avatar-image')!);

    expect(avatar().querySelector('.reqore-avatar-image')).toBeNull();
    expect(avatar().querySelector('.reqore-avatar-icon')).toBeTruthy();
  });

  test('initials when asked: from the label, or as given', () => {
    renderAvatar({ label: 'Ada King Lovelace', initials: true });
    expect(avatar().querySelector('.reqore-avatar-initials')?.textContent).toBe('AL');
  });

  test('initials given as a string are drawn as given', () => {
    renderAvatar({ label: 'Ada Lovelace', initials: 'QA' });
    expect(avatar().querySelector('.reqore-avatar-initials')?.textContent).toBe('QA');
  });

  test('a picture wins over initials', () => {
    renderAvatar({ label: 'Ada Lovelace', initials: true, image: 'https://example.com/ada.png' });
    expect(avatar().querySelector('.reqore-avatar-initials')).toBeNull();
    expect(avatar().querySelector('.reqore-avatar-image')).toBeTruthy();
  });

  test.each(Object.entries(AVATAR_SIZE_FROM_SIZE))('is %s: %ipx across', (size, px) => {
    renderAvatar({ label: 'Ada', size: size as never });
    const style = getComputedStyle(avatar());
    expect(style.width).toBe(`${px}px`);
    expect(style.height).toBe(`${px}px`);
  });

  test('is a circle, or a rounded square when not rounded', () => {
    const { unmount } = renderAvatar({ label: 'Ada' });
    expect(getComputedStyle(avatar()).borderRadius).toBe('50%');
    unmount();
    renderAvatar({ label: 'Ada', rounded: false });
    expect(getComputedStyle(avatar()).borderRadius).toBe('8px');
  });

  test('has no edge unless flat is false', () => {
    const { unmount } = renderAvatar({ label: 'Ada' });
    expect(getComputedStyle(avatar()).borderStyle).not.toBe('solid');
    unmount();
    renderAvatar({ label: 'Ada', flat: false });
    expect(getComputedStyle(avatar()).borderTopStyle).toBe('solid');
  });

  test('an intent colours its fill', () => {
    const { unmount } = renderAvatar({ label: 'Ada' });
    const neutral = getComputedStyle(avatar()).background;
    unmount();
    renderAvatar({ label: 'Ada', intent: 'danger' });
    expect(getComputedStyle(avatar()).background).not.toBe(neutral);
  });

  test('a custom theme colours its fill', () => {
    const { unmount } = renderAvatar({ label: 'Ada' });
    const neutral = getComputedStyle(avatar()).background;
    unmount();
    renderAvatar({ label: 'Ada', customTheme: { main: '#7a3cff' } });
    expect(getComputedStyle(avatar()).background).not.toBe(neutral);
  });

  test('keeps its class and passes a click through', () => {
    const onClick = vi.fn();
    renderAvatar({ label: 'Ada', className: 'mine', onClick });
    expect(avatar().classList.contains('mine')).toBe(true);
    fireEvent.click(avatar());
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('getAvatarInitials', () => {
  test('takes the first letters of the first and the last word', () => {
    expect(getAvatarInitials('ada lovelace')).toBe('AL');
    expect(getAvatarInitials('Ada')).toBe('A');
    expect(getAvatarInitials('  ')).toBe('');
    expect(getAvatarInitials(undefined)).toBe('');
  });

  test('takes whole characters, not halves of one', () => {
    expect(getAvatarInitials('Élodie Ørsted')).toBe('ÉØ');
    expect(getAvatarInitials('🦄 Rainbow')).toBe('🦄R');
  });
});
