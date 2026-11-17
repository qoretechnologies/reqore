import { forwardRef, memo, ReactNode, useMemo } from 'react';
import { css } from 'styled-components';
import { TAG_HORIZONTAL_PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import styled from '../../helpers/styled';
import { getOneLessSize } from '../../helpers/utils';
import { ButtonBadge, TReqoreBadge } from '../Button';

/** The class of the line a title shares with its badges. */
export const TITLE_AND_BADGES_CLASS = 'reqore-panel-title-label-and-badges';

/**
 * How far a text badge's words sit inside its box: the tag's side padding. Zero when the first
 * badge on the left draws a box of its own (a chip), whose edge is then the badge's edge.
 *
 * Only the first badge on the left counts, because it is the one that starts the badges' line
 * when they move under the title. A badge given `align: 'center'` or `'right'` is placed by that
 * instead.
 */
export const getTextBadgeLead = (
  badge: TReqoreBadge | TReqoreBadge[] | undefined,
  badgeSize: TSizes
): number => {
  const first = (Array.isArray(badge) ? badge : [badge]).find(
    (item) => typeof item !== 'object' || !item?.align
  );

  return typeof first === 'object' && first?.appearance === 'text'
    ? TAG_HORIZONTAL_PADDING_FROM_SIZE[getOneLessSize(badgeSize)]
    : 0;
};

/**
 * The title and its badges: on one line while both fit, and the badges on a line of their own
 * under the title, on its left edge, the moment they do not.
 *
 * The badges give way first. A bar used to give them their own width and the title what was
 * left, then cut the title: a 218px tile left its title 31px beside "Last 30 days" and two
 * buttons, so it read "De…". The title is what names the thing and a badge says something about
 * it, so the badges move before the title wraps, and the title then wraps before it shrinks and
 * shrinks before it is cut (Filip, 2026-11-16; instruction-files decision 029).
 *
 * A wrapping flex line does exactly that: a line takes its items at their full width, so the
 * badges stay beside the title only while the title's whole one-line width and theirs fit, and
 * the title, always first, is never the item that moves. An icon stays outside it, so badges
 * under the title line up with the title rather than the icon. `column-gap` is the room between
 * the title and its badges, and a gap is only drawn between items on one line, so badges on their
 * own line start on the title's edge.
 *
 * A text badge ("Last 30 days") draws no box, so its edge is its words, which sit the tag's
 * padding inside it: the badges are pulled back by that much (`$textLead`) and the gap widened by
 * as much, so beside the title the room is what it always was and under it the words start where
 * the title's do (Filip, 2026-11-17).
 */
const StyledTitleAndBadges = styled.div<{ $gap: number; $textLead: number }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: ${({ $gap, $textLead }) => $gap + $textLead}px;
  row-gap: 3px;
  min-width: 0;
  flex: 0 1 auto;

  /* A badge's baseline is its words. A tag lays out [icon][words], and with no item taking part
     in baseline alignment its baseline is its first item's: the icon's lower edge, about 2px
     under the words. A title beside "⚠ Action needed" sank to meet it. Its words take part, so
     they set it; the words' box fills the tag's height already, so nothing in the tag moves. */
  & .reqore-tag > .reqore-tag-content {
    align-self: baseline;
  }

  ${({ $textLead }) =>
    $textLead > 0 &&
    css`
      & > .reqore-tag-group:not(.reqore-tag-group ~ .reqore-tag-group) {
        margin-left: -${$textLead}px;
      }
    `}
`;

export interface IReqoreTitleAndBadgesProps {
  /** The title: a heading, or whatever the caller draws. Always first on the line. */
  children?: ReactNode;
  badge?: TReqoreBadge | TReqoreBadge[];
  /** The badges' size, as `ButtonBadge` takes it. */
  badgeSize: TSizes;
  /** The room between the title and its badges, in px, when they share a line. */
  gap: number;
  className?: string;
}

/**
 * A title and its badges, the badges moving under the title before any of it is cut. The one
 * home for every heading that carries badges: the panel's title bar (and so every drawer, dialog
 * and card built on it) and the accordion's headers.
 */
export const ReqoreTitleAndBadges = memo(
  forwardRef<HTMLDivElement, IReqoreTitleAndBadgesProps>(
    ({ children, badge, badgeSize, gap, className }, ref) => {
      const hasBadge = !!badge || badge === 0;
      const textLead = useMemo(
        () => (hasBadge ? getTextBadgeLead(badge, badgeSize) : 0),
        [hasBadge, badge, badgeSize]
      );

      return (
        <StyledTitleAndBadges
          ref={ref}
          className={`${TITLE_AND_BADGES_CLASS} ${className || ''}`.trim()}
          $gap={gap}
          $textLead={textLead}
        >
          {children}
          {hasBadge ? (
            <ButtonBadge
              size={badgeSize}
              content={badge}
              // A group sits beside the title only at its full width, so it wraps only on a line
              // of its own, where badges wider than the line fold onto another rather than run
              // past the bar.
              wrapGroup
              margin='none'
            />
          ) : null}
        </StyledTitleAndBadges>
      );
    }
  )
);

ReqoreTitleAndBadges.displayName = 'ReqoreTitleAndBadges';
