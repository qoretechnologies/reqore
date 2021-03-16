import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ReqorePopover, ReqoreUIProvider } from "../src/index";

const SimpleContent = (props: any) => {
  return (
    <ReqorePopover
      component="p"
      content={props.content || "Tooltip content"}
      handler={props.type}
      isReqoreComponent
    >
      Hover me
    </ReqorePopover>
  );
};

const FullContent = (props: any) => {
  return (
    <ReqorePopover
      component="p"
      content={props.content || "test"}
      placement="right"
      componentProps={{ onMouseEnter: () => props.fn() }}
    >
      Hover me
    </ReqorePopover>
  );
};

beforeAll(() => {
  jest.useFakeTimers();
});

test("Shows popover on hover, hides on leave", async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText("Hover me"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(1);

  fireEvent.mouseLeave(screen.getByText("Hover me"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(0);
});

test("Shows popover on click, hides only on click away", async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <SimpleContent type="click" />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Hover me"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(1);

  fireEvent.click(screen.getByText("Tooltip content"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(1);

  fireEvent.click(screen.getByText("Hover me"));

  expect(document.querySelectorAll(".reqore-popover-content").length).toBe(0);
});

test("Shows custom content", async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <SimpleContent content={<h1>Custom title</h1>} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText("Hover me"));

  expect(document.querySelectorAll("h1").length).toBe(1);

  fireEvent.mouseLeave(screen.getByText("Hover me"));
});

test("Runs callback function", async () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <FullContent fn={fn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText("Hover me"));

  expect(fn).toHaveBeenCalled();

  fireEvent.mouseLeave(screen.getByText("Hover me"));
});
