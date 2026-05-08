# ReQore Components

| Component | Description |
| --- | --- |
| **ReqoreAccordion** | Expandable/collapsible panels that can display multiple items with optional icons, badges, and callbacks for toggling. |
| **ReqoreBreadcrumbs** | Navigation component displaying hierarchical breadcrumb trails with responsive collapse and optional tab support. |
| **ReqoreButton** | Primary action button with support for icons, badges, loading states, effects, multiple style variants (minimal, flat, transparent), and an optional `raised` prop that adds a subtle 3D inset highlight when paired with `flat`. |
| **ReqoreCallout** | Inline message surface for inline notices, warnings, and confirmations. Supports a leading icon, optional `label` + `description` (or freeform `children`), badge (TReqoreBadge), accent strip (left/top with configurable size), close button (`onClose` + `closeButtonProps`), and the standard prop set: intent (info/success/warning/danger; controls accent + border + icon colour), size, flat (border on `false`), rounded, fluid, fixed, transparent, raised (subtle 3D inset highlight when paired with `flat`), customTheme, tooltip, disabled, effect / labelEffect / descriptionEffect / contentEffect, `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`; the side adjacent to the accent strip still reserves room for it), `paddingSize` (`TSizes` — defaults to `size`), and click handlers. |
| **ReqoreCheckbox** | Toggle control that can render as a standard checkbox or switch component with customizable icons and text labels. |
| **ReqoreCollection** | Grid/list view component for displaying arrays of items with filtering, sorting, zoom, and pagination capabilities. |
| **ReqoreColumns** | Layout component using CSS Grid to arrange content into responsive columns with customizable gaps and alignment. |
| **ReqoreComment** | Single comment display component with optional icon/image, title, detail text, and action buttons. |
| **ReqoreCommentFeed** | Container component for displaying a vertical list of comments with customizable spacing between items. |
| **ReqoreContent** | Base content wrapper providing theme support and scroll handling for page content areas. |
| **ReqoreControlGroup** | Flexible group component for organizing child elements with support for stacking, spacing, responsiveness, and overflow handling. |
| **ReqoreDatePicker** | Date and time picker with calendar interface, time selection, and support for various date formats and granularity options. |
| **ReqoreDrawer** | Sliding panel that can be positioned on any edge of the screen, with support for resizing, hiding, and optional backdrop. |
| **ReqoreDropdown** | Button-triggered dropdown menu supporting filtering, nested items, multi-select, and keyboard navigation. |
| **ReqoreEffect** | Styled component providing visual effects like gradients, glows, filters, and text decorations. |
| **ReqoreEmptyState** | Placeholder component displayed when content is unavailable, with optional icon, title, description, and action buttons. Optional `raised` adds a subtle 3D inset highlight to the placeholder surface. |
| **ReqoreEntityRow** | Compact row primitive for lists of items (e.g. automations, drafts, integrations) with a leading icon tile, label/description/metadata stack, badge support (TReqoreBadge), and right-side action buttons. Supports the standard prop set: intent (with tinted backgrounds), size, flat (border on `false`), rounded, fluid, transparent, raised (subtle 3D inset highlight when paired with `flat`), customTheme, tooltip, disabled, effect / labelEffect / descriptionEffect / metadataEffect, wrap (single-line ellipsis on `false`), `iconHasBackground` (defaults to `true` on opaque rows and `false` when `transparent={true}` so the tile does not fight the transparent surface; pass an explicit boolean to override), `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`; controls which axes receive outer padding), `paddingSize` (`TSizes` — defaults to `size`; scales padding independently from text/icon scale), and click handlers. |
| **ReqoreFeatureCard** | Highlight card for onboarding flows, feature spotlights, and product steps. Renders an optional marker (line/number/none), label, description, and badge. Supports the standard prop set: intent (controls marker + border colour), size, flat (border on `false`), rounded, fluid, fixed, transparent, raised (subtle 3D inset highlight when paired with `flat`), customTheme, tooltip, disabled, interactive (auto-detected from `onClick`), effect / labelEffect / descriptionEffect / markerEffect, wrap (single-line ellipsis on `false`), `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`), and `paddingSize` (`TSizes` — defaults to `size`). |
| **ReqoreErrorBoundary** | React error boundary that catches errors and displays them with optional fallback UI and reset functionality. |
| **ReqoreExportModal** | Modal dialog for exporting data in multiple formats (CSV, JSON, YAML) with copy-to-clipboard functionality. |
| **ReqoreModalsWrapper** | Portal wrapper that renders all queued modals and dialogs from the global context. |
| **ReqoreHeading** | Typography component for headings (H1-H6) with theme support and text effects. |
| **ReqoreIcon** | Icon rendering component using RemixIcon set with size, color, animation, tooltip, and an optional contour-following `glow` (boolean / colour / `{ color, blur, opacity }`) rendered via `filter: drop-shadow`. The global `ReqoreUIProvider` option `glowingIcons: true` opts every icon into glow mode by default; individual icons opt out with `glow={false}`. |
| **ReqoreInput** | Text input field with optional icons, clear button, loading states, and comprehensive styling options. |
| **ReqoreInputClearButton** | Animated clear button component for input fields that appears on focus. |
| **ReqoreInternalPopover** | Internal popover positioning and rendering component using Popper.js for precise placement. |
| **ReqoreKeyValueTable** | Table displaying key-value pairs with optional sorting, filtering, and custom renderers. |
| **ReqoreLabel** | Label element wrapper that extends ReqoreTag for form field labels. |
| **ReqoreLayoutWrapper** | Root layout container providing flex layout structure and theme context for the entire application. |
| **ReqoreMenu** | Vertical menu container with support for resizing, customizable item gaps, and menu styling. |
| **ReqoreMessage** | Notification/alert message component with optional icon, title, auto-dismiss, and click handlers. Optional `raised` adds a subtle 3D inset highlight when paired with `flat` (suppressed for `minimal` messages). |
| **ReqoreModal** | Modal dialog that extends Drawer with centered positioning and ESC key handling. |
| **ReqoreMultiSelect** | Multi-select input allowing users to add/remove items from a dropdown with customizable tagging. |
| **ReqoreNavbar** | Header or footer navigation bar with customizable styling and position options. |
| **ReqoreNotificationsWrapper** | Container for managing toast notifications at fixed screen positions. Individual notifications support `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`) and `paddingSize` (`TSizes` — defaults to `size`) to tune density. |
| **ReqorePaging** | Pagination controls component with page buttons, load more, and scroll-based infinite loading options. |
| **ReqorePanel** | Container component with optional header, footer, actions, and resizable panels with breadcrumbs support. Optional `raised` adds a subtle 3D inset highlight when paired with `flat` (suppressed when an `intent` is set since the intent border already provides definition). Header layout is configurable via `iconWithLabel` (default `false`; when `true`, the leading icon renders inside the label+badge row so the description sits beneath both icon and label) and `iconVerticalAlign` (`'top'` \| `'center'` \| `'bottom'` — default `'center'`; only takes effect when `iconWithLabel={false}`). |
| **ReqoreP** | Text paragraph component with theme support, effects, and size customization. |
| **ReqorePopover** | Popover/tooltip component with multiple trigger handlers (hover, click, focus) and smart positioning. |
| **ReqoreProgress** | Progress bar component with optional animations, indeterminate state, customizable labels/icons, and an optional target marker for visualising goals (e.g. "90% target coverage"). |
| **ReqoreRadioGroup** | Radio button group component allowing single selection from multiple options with optional dividers. |
| **ReqoreRating** | Star rating component supporting half-steps, keyboard navigation, and optional clear functionality. |
| **ReqoreRichTextEditor** | Rich text editor using Slate framework with support for inline tags and text formatting options. |
| **ReqoreSegmentedControl** | Compact button-bar toggle for selecting one of 2-4 exclusive options with a sliding indicator animation. |
| **ReqoreSeverityRow** | Row primitive for issue/alert/anomaly lists with a left severity strip, leading slot for a severity tag, label/description body, badge support (TReqoreBadge), and right-side action buttons. Supports the standard prop set: intent (info/success/warning/danger with tinted backgrounds), size, flat (border on `false`), rounded, fluid, transparent, raised (subtle 3D inset highlight when paired with `flat`), customTheme, tooltip, disabled, effect / labelEffect / descriptionEffect, wrap (single-line ellipsis on `false`), optional strip-hide, `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`), `paddingSize` (`TSizes` — defaults to `size`), and click handlers. |
| **ReqoreSkeleton** | Animated skeleton/placeholder component for loading states with customizable dimensions. |
| **ReqoreSlider** | Range slider component supporting single values or ranges with optional labels and customizable styling. |
| **ReqoreSpacer** | Flexible spacing component that creates horizontal or vertical gaps with optional dividing lines. |
| **ReqoreSpan** | Inline text component with theme support and text effects. |
| **ReqoreSpinner** | Animated loading indicator with optional text label and multiple icon variants. |
| **ReqoreStatistic** | Metric display component showing values with optional prefixes, suffixes, trends, and labels. Optional `raised` adds a subtle 3D inset highlight when the surface is also `rounded` and `flat`. Outer padding is configurable via `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`; only applies when the tile has a background) and `paddingSize` (`TSizes` — defaults to `size`). |
| **ReqoreTable** | Advanced data table with sorting, filtering, column pinning, resizing, paging, and export capabilities. |
| **ReqoreTabs** | Tab interface component supporting closeable tabs, vertical orientation, and uncontrolled/controlled states. |
| **ReqoreTag** | Compact labeled component with optional icons, actions, colors, and badge styling. |
| **ReqoreTestimonial** | Quote-card surface for social proof, customer testimonials, and endorsements. Renders an optional decorative leading quote glyph, an optional star `rating`, the `quote` body (or `children`), an attribution footer (built on `ReqoreEntityRow`) with `avatar` (image) or `avatarIcon`, `author`, and `role`, plus badge support (TReqoreBadge) and right-side action buttons. Supports the standard prop set: intent (controls accent + border + tinted background), size, flat (border on `false`), rounded, fluid, fixed, transparent, raised (subtle 3D inset highlight when paired with `flat`), customTheme, tooltip, disabled, interactive (auto-detected from `onClick`), effect / quoteEffect / authorEffect / roleEffect, wrap (single-line ellipsis on `false`), `padded` (`true` \| `false` \| `'horizontal'` \| `'vertical'` — default `true`), and `paddingSize` (`TSizes` — defaults to `size`). |
| **ReqoreTextarea** | Multi-line text input with optional auto-sizing, clear button, and template variable support. |
| **ReqoreTier** | Pricing/feature tier card component with highlighted states, price display, and feature lists. |
| **TimeAgo** | Relative time display component (e.g., "2 hours ago") that updates periodically. |
| **ReqoreTimeline** | Vertical timeline component displaying chronological events with optional icons, timestamps, and collapsible content. |
| **ReqoreTooltipComponent** | Wrapper component that attaches tooltips to other components via Popover. |
| **ReqoreTree** | Hierarchical tree view component for displaying nested data structures with optional editing and expansion controls. |
