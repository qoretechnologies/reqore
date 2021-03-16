import { render } from "@testing-library/react";
import React from "react";
import {
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../src";

test("Renders <Icon /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon="AccountBoxFill" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-icon").length).toBe(1);
  expect(document.querySelectorAll("svg").length).toBe(1);
});

test("Renders empty <Icon /> if icon does not exist", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon="SortAsc" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-icon").length).toBe(1);
  expect(document.querySelector(".reqore-icon").textContent).toBe("");
  expect(document.querySelectorAll("svg").length).toBe(0);
});
