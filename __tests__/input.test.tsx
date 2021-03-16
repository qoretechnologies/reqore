import { render } from "@testing-library/react";
import React from "react";
import {
  ReqoreContent, ReqoreInput,

  ReqoreLayoutContent,
  ReqoreUIProvider
} from "../src";

test("Renders <Input /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
            <ReqoreInput minimal />
            <ReqoreInput disabled />
            <ReqoreInput size="big" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-input").length).toBe(3);
});
