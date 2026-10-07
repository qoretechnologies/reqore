import { memo, useMemo } from 'react';
import { rgba } from 'polished';
import styled from 'styled-components';
import {
  BADGE_RADIUS_FROM_SIZE,
  BADGE_SIZE_TO_PX,
  GAP_FROM_SIZE,
  PADDING_FROM_SIZE,
  TAG_TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { formatShortcut, TReqoreKeyboardShortcut } from '../../helpers/shortcuts';
import { getOneLessSize } from '../../helpers/utils';

export interface IReqoreKeyboardShortcutProps {
  /**
   * The shortcut to display, following the `react-hotkeys-hook` syntax
   * (e.g. `'mod+k'`, `'ctrl+shift+s'`, or `['mod+k', 'ctrl+k']`). The `mod`
   * modifier renders as `⌘` on macOS and `Ctrl` elsewhere.
   */
  shortcut: TReqoreKeyboardShortcut;
  size?: TSizes;
  /**
   * Render the badge one size smaller than `size` so it sits unobtrusively
   * inside a control. Defaults to `true`.
   */
  oneLessSize?: boolean;
  /**
   * Override the chip colour. Defaults to `currentColor` so the chip adapts to
   * the foreground colour of whatever surface it sits on (button label, input
   * text, etc.) — this keeps it readable on intent-coloured buttons.
   */
  color?: string;
  compact?: boolean;
  wrap?: boolean;
  className?: string;
}

interface IStyledShortcutKey {
  _size: TSizes;
  compact?: boolean;
  color?: string;
}

const StyledShortcutKey = styled.span<IStyledShortcutKey>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  height: ${({ _size }) => BADGE_SIZE_TO_PX[_size]}px;
  min-width: ${({ _size }) => BADGE_SIZE_TO_PX[_size]}px;
  padding: 0 ${({ _size, compact }) => PADDING_FROM_SIZE[_size] / (compact ? 3 : 2)}px;
  font-size: ${({ _size }) => TAG_TEXT_FROM_SIZE[_size]}px;
  font-family: system-ui;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border-radius: ${({ _size }) => BADGE_RADIUS_FROM_SIZE[_size]}px;

  // currentColor lets the chip's text/border inherit the surrounding text
  // colour, so it stays readable on any surface. The fill is a subtle dark
  // overlay (or a tint of the color prop when provided) to give it definition.
  color: ${({ color }) => color || 'currentColor'};
  border: 1px solid ${({ color }) => (color ? rgba(color, 0.4) : 'currentColor')};
  background-color: ${({ color }) => (color ? rgba(color, 0.12) : rgba('#000000', 0.3))};
  opacity: ${({ color }) => (color ? 1 : 0.85)};
`;

const StyledShortcutGroup = styled.span<{ _size: TSizes; wrap?: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  gap: ${({ _size }) => GAP_FROM_SIZE[_size]}px;
`;

/**
 * Renders a keyboard shortcut as one or more badge-style hints. The chip uses
 * `currentColor` by default so it adapts to the foreground of whatever control
 * it is rendered inside (button label, input text, etc.).
 */
export const ReqoreKeyboardShortcut = memo(
  ({
    shortcut,
    size = 'normal',
    oneLessSize = true,
    color,
    compact,
    wrap,
    className,
  }: IReqoreKeyboardShortcutProps) => {
    const labels = useMemo(() => formatShortcut(shortcut), [shortcut]);

    if (!labels.length) {
      return null;
    }

    const tagSize = oneLessSize ? getOneLessSize(size) : size;

    return (
      <StyledShortcutGroup
        _size={tagSize}
        wrap={wrap}
        className={`reqore-keyboard-shortcut ${className || ''}`}
      >
        {labels.map((label, index) => (
          <StyledShortcutKey
            key={index}
            _size={tagSize}
            compact={compact}
            color={color}
            className='reqore-keyboard-shortcut-key'
          >
            {label}
          </StyledShortcutKey>
        ))}
      </StyledShortcutGroup>
    );
  }
);

export default ReqoreKeyboardShortcut;
