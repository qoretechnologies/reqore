import { render } from "@testing-library/react";
import {
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqoreUIProvider,
} from "../src";

test("Renders Layout properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreHeader>
          <ReqoreNavbarGroup>
            <ReqoreNavbarItem>Logo</ReqoreNavbarItem>
          </ReqoreNavbarGroup>
          <ReqoreNavbarGroup position="right">
            <ReqoreNavbarItem>Item</ReqoreNavbarItem>
            <ReqoreNavbarDivider />
            <ReqoreNavbarItem>Item 2</ReqoreNavbarItem>
          </ReqoreNavbarGroup>
        </ReqoreHeader>
        <ReqoreContent>
          <h1>Hello</h1>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-layout-wrapper").length).toBe(1);
  expect(document.querySelectorAll(".reqore-layout-content").length).toBe(1);
  expect(document.querySelectorAll("h1").length).toBe(1);
});

const wrapper = () => document.querySelector('.reqore-layout-wrapper') as HTMLElement;

test('The layout wrapper paints the theme surface by default', () => {
  render(
    <ReqoreUIProvider theme={{ main: '#222222' }}>
      <ReqoreContent>Page</ReqoreContent>
    </ReqoreUIProvider>
  );

  // changeLightness('#222222', 0.02): a dark main is lightened a step.
  expect(getComputedStyle(wrapper()).backgroundColor).toBe('rgb(39, 39, 39)');
});

test('layoutWrapperProps.transparent lets the page colour through', () => {
  const { unmount } = render(
    <ReqoreUIProvider theme={{ main: '#222222' }}>
      <ReqoreContent>Page</ReqoreContent>
    </ReqoreUIProvider>
  );
  const textColor = getComputedStyle(wrapper()).color;
  unmount();

  render(
    <ReqoreUIProvider theme={{ main: '#222222' }} layoutWrapperProps={{ transparent: true }}>
      <ReqoreContent>Page</ReqoreContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(wrapper()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  // Only the surface goes: the wrapper still sets the readable text colour.
  expect(getComputedStyle(wrapper()).color).toBe(textColor);
});

test('layoutWrapperProps reach the wrapper: class merged, style, data and aria attributes', () => {
  render(
    <ReqoreUIProvider
      options={{ withSidebar: true }}
      layoutWrapperProps={{
        className: 'app-shell',
        style: { overflow: 'visible' },
        'data-testid': 'shell',
        'aria-label': 'Application',
      }}
    >
      <ReqoreContent>Page</ReqoreContent>
    </ReqoreUIProvider>
  );

  const element = wrapper();

  expect(element.classList.contains('app-shell')).toBe(true);
  expect(element.classList.contains('reqore-layout-wrapper')).toBe(true);
  expect(element.style.overflow).toBe('visible');
  expect(element.getAttribute('data-testid')).toBe('shell');
  expect(element.getAttribute('aria-label')).toBe('Application');
  // options.withSidebar still decides the direction.
  expect(getComputedStyle(element).flexDirection).toBe('row');
});
