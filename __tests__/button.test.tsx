import { render } from "@testing-library/react";
import React from "react";
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider
} from "../src";

test("Renders <Button /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
            <ReqoreButton minimal>Hello</ReqoreButton>
            <ReqoreButton icon="4KFill">Another</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-icon").length).toBe(1);
  expect(document.querySelectorAll(".reqore-button").length).toBe(2);
});
