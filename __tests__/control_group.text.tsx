import { render } from "@testing-library/react";
import React from "react";
import {
  ReqoreButton, ReqoreContent,



  ReqoreControlGroup, ReqoreInput,

  ReqoreLayoutContent,
  ReqoreUIProvider
} from "../src";

test("Renders <Input /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreInput minimal />
            <ReqoreButton>Hello</ReqoreButton>
            <ReqoreInput disabled />
            <ReqoreInput size="big" />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-input").length).toBe(3);
  expect(document.querySelectorAll(".reqore-button").length).toBe(3);
  expect(document.querySelectorAll(".reqore-control-group").length).toBe(1);
});
