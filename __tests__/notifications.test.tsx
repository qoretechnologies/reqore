import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { useContext } from "react";
import { ReqoreNotificationsContext, ReqoreUIProvider } from "../src/index";

const AddButton = (props: any) => {
  const { addNotification } = useContext(ReqoreNotificationsContext);

  return (
    <button
      id="add-notification"
      onClick={() =>
        addNotification({
          title: "Test Notification",
          content: "I am a notification in tests",
          duration: 3000,
          id: props.id || Date.now(),
          ...props,
        })
      }
    >
      Add Notification
    </button>
  );
};

const UpdateButton = (props: any) => {
  const { addNotification } = useContext(ReqoreNotificationsContext);

  return (
    <button
      id="update-notification"
      onClick={() =>
        addNotification({
          title: "Updated Notification",
          content: "I am an updated notification in tests",
          duration: 5000,
          ...props,
        })
      }
    >
      Update Notification
    </button>
  );
};

beforeAll(() => {
  jest.useFakeTimers();
});

test("Adds notifications and dismisses them automatically", async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));

  expect(document.querySelectorAll(".reqore-notification").length).toBe(5);

  act(() => jest.runAllTimers());

  expect(document.querySelectorAll(".reqore-notification").length).toBe(0);
});

test("Adds a notification and updates it", async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id="test" />
        <UpdateButton id="test" />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));

  act(() => jest.advanceTimersByTime(1000));

  expect(document.querySelectorAll(".reqore-notification").length).toBe(1);

  fireEvent.click(screen.getByText("Update Notification"));

  expect(document.querySelectorAll(".reqore-notification").length).toBe(1);

  act(() => jest.runAllTimers());

  expect(document.querySelectorAll(".reqore-notification").length).toBe(0);
});

test("Notification has a click event", async () => {
  const clickFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id="test" onClick={clickFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));

  act(() => jest.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector(".reqore-notification"));

  expect(clickFn).toHaveBeenCalledWith("test");
});

test("Notification has a close event", async () => {
  const closeFn = jest.fn();
  const finishFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id="test" onClose={closeFn} onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));

  act(() => jest.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector(".reqore-notification-close"));

  expect(closeFn).toHaveBeenCalledWith("test");
  expect(finishFn).toHaveBeenCalledTimes(0);
});

test("Notification has a finish event", async () => {
  const finishFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id="test" onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));

  act(() => jest.runAllTimers());

  expect(finishFn).toHaveBeenCalledWith("test");
});

test("Maximum of 5 notifications is shown at once", async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));
  fireEvent.click(screen.getByText("Add Notification"));

  expect(document.querySelectorAll(".reqore-notification").length).toBe(5);
});
