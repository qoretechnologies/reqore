import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreDropdownDivider,
  ReqoreDropdownItem,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../src";

test("Renders <Dropdown /> properly", () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown>
              <ReqoreDropdownItem selected icon="SunCloudyLine">
                Hello
              </ReqoreDropdownItem>
              <ReqoreDropdownItem icon="BatteryChargeFill">
                How are ya
              </ReqoreDropdownItem>
              <ReqoreDropdownItem disabled icon="StopCircleLine">
                i aM diSAblEd
              </ReqoreDropdownItem>
            </ReqoreDropdown>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector(".reqore-button"));

  expect(
    document.querySelector(".reqore-button").getAttribute("disabled")
  ).toBe(null);
  expect(document.querySelectorAll(".reqore-button").length).toBe(1);
  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(1);
  expect(document.querySelectorAll(".reqore-menu-item").length).toBe(3);
});

test("Renders disabled <Dropdown /> when children are empty", () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector(".reqore-button"));

  expect(
    document.querySelector(".reqore-button").getAttribute("disabled")
  ).toBe("");
});

test("Renders <Dropdown /> with custom component and custom handler", () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              component={ReqoreInput}
              handler="focus"
              useTargetWidth
              componentProps={{
                width: 500,
                placeholder: "Focus me to see some crazy stuff",
              }}
            >
              <ReqoreDropdownItem selected icon="SunCloudyLine">
                Hello
              </ReqoreDropdownItem>
              <ReqoreDropdownDivider label="DANGER ZONE" />
              <ReqoreDropdownItem icon="BatteryChargeFill">
                How are ya
              </ReqoreDropdownItem>
              <ReqoreDropdownItem disabled icon="StopCircleLine">
                i aM diSAblEd
              </ReqoreDropdownItem>
            </ReqoreDropdown>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.focus(document.querySelector(".reqore-input"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(1);
  expect(document.querySelectorAll(".reqore-menu-item").length).toBe(3);
  expect(document.querySelectorAll(".reqore-menu-divider").length).toBe(1);
});
