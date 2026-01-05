---
sidebar_position: 1
---

# Introduction to Reqore

Reqore is a comprehensive, highly customizable UI library for React applications. Built with TypeScript and styled-components, it provides a complete set of components for building modern, theme-able user interfaces.

## Key Features

- 🎨 **Fully Theme-able**: Deep theming system with support for custom colors, effects, and gradients
- 🧩 **Modular Components**: 40+ production-ready components for every use case
- ♿ **Accessible**: Built with accessibility in mind
- 📱 **Responsive**: Components work seamlessly across all device sizes
- 🎭 **Intent System**: Built-in semantic color system (success, warning, danger, info, etc.)
- ✨ **Visual Effects**: Advanced gradient effects, animations, and styling options
- 📦 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🔧 **Customizable**: Extensive props for fine-tuning component behavior and appearance

## Component Categories

### Layout & Structure

- **Panels**: Container components with headers, footers, and collapsible sections
- **Columns**: Flexible column layouts
- **ControlGroup**: Group related controls with automatic spacing
- **Tabs**: Tabbed interfaces with customizable styling

### Forms & Inputs

- **Input**: Text inputs with validation and icons
- **Textarea**: Multi-line text inputs
- **Checkbox**: Single and grouped checkboxes with switch variants
- **RadioGroup**: Radio button groups
- **Dropdown**: Customizable dropdown menus
- **MultiSelect**: Multiple selection with tags
- **DatePicker**: Date and time selection
- **Slider**: Range sliders

### Data Display

- **Table**: Feature-rich tables with sorting, filtering, and pagination
- **Collection**: Display collections of items in various layouts
- **Tree**: Hierarchical data display
- **KeyValueTable**: Display key-value pairs

### Navigation

- **Menu**: Vertical navigation menus
- **Navbar**: Top navigation bars
- **Breadcrumbs**: Breadcrumb navigation
- **Pagination**: Page navigation controls

### Feedback & Overlays

- **Modal**: Dialog boxes and popups
- **Drawer**: Side panel drawers
- **Popover**: Contextual popovers and tooltips
- **Message**: Alert and notification messages
- **Notifications**: Toast notifications system

### Content & Typography

- **Headings**: H1-H6 heading components
- **Paragraph**: Styled paragraph text
- **Span**: Inline text with effects
- **Tag**: Label tags and badges

## Quick Example

```tsx
import {
  ReqoreUIProvider,
  ReqoreButton,
  ReqorePanel,
  ReqoreControlGroup,
} from '@qoretechnologies/reqore';

function App() {
  return (
    <ReqoreUIProvider>
      <ReqorePanel label='Welcome to Reqore'>
        <ReqoreControlGroup>
          <ReqoreButton intent='success'>Success</ReqoreButton>
          <ReqoreButton intent='warning'>Warning</ReqoreButton>
          <ReqoreButton intent='danger'>Danger</ReqoreButton>
        </ReqoreControlGroup>
      </ReqorePanel>
    </ReqoreUIProvider>
  );
}
```

## Next Steps

- Follow the [Getting Started](./guides/getting-started) guide to install and set up Reqore
- Learn about [Theming](./guides/theming) to customize the look and feel
- Explore individual [Components](./components/button) to see what's available
