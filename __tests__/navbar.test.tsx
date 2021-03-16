import { render } from "@testing-library/react";
import React from "react";
import {
  ReqoreHeader,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqoreUIProvider,
} from "../src";

test("Renders Navbar properly", () => {
  render(
    <ReqoreUIProvider>
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
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-navbar-header").length).toBe(1);
  expect(document.querySelectorAll(".reqore-navbar-group").length).toBe(2);
  expect(document.querySelectorAll(".reqore-navbar-divider").length).toBe(1);
  expect(document.querySelectorAll(".reqore-navbar-item").length).toBe(3);
});
