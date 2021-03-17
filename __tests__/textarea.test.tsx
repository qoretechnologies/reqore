import { fireEvent, render } from "@testing-library/react";
import { noop } from "lodash";
import React from "react";
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTextarea,
  ReqoreUIProvider,
} from "../src";

test("Renders <TextArea /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-textarea").length).toBe(1);
  // No clear button
  expect(document.querySelectorAll(".reqore-clear-input-button").length).toBe(
    0
  );
});

test("Renders <TextArea /> with clear button properly", () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea minimal onChange={noop} onClearClick={fn} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll(".reqore-clear-input-button").length).toBe(
    1
  );

  fireEvent.click(document.querySelector(".reqore-clear-input-button"));

  expect(fn).toHaveBeenCalled();
});

test("Disabled <TextArea /> cannot be cleared", () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea minimal onChange={noop} onClearClick={fn} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll(".reqore-clear-input-button").length).toBe(
    0
  );
});
