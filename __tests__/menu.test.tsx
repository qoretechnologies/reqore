import { fireEvent, render } from "@testing-library/react";
import React from "react";
import {
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreUIProvider,
} from "../src/index";

test("Renders <Menu /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 2 </ReqoreMenuItem>
        <ReqoreMenuDivider label="Divider" />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-menu-item").length).toBe(4);
  expect(document.querySelectorAll(".reqore-menu-divider").length).toBe(1);
});

test("<Menu /> item can be clicked", () => {
  const itemCb = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem onClick={itemCb}>Item 2</ReqoreMenuItem>
        <ReqoreMenuDivider label="Divider" />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelectorAll(".reqore-menu-item")[1]);

  expect(itemCb).toHaveBeenCalled();
});

test("<Menu /> item has right clickable button", () => {
  const iconCb = jest.fn();
  const itemCb = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem
          onClick={itemCb}
          rightIcon="24HoursFill"
          onRightIconClick={iconCb}
        >
          {" "}
          Item 2{" "}
        </ReqoreMenuItem>
        <ReqoreMenuDivider label="Divider" />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelectorAll(".reqore-menu-item-right-icon")[0]);

  expect(iconCb).toHaveBeenCalled();
  expect(itemCb).not.toHaveBeenCalled();
});
