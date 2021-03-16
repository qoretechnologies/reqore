import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ReqoreUIProvider } from "../src";
import ReqoreSidebar from "../src/components/Sidebar";
import { qorusSidebarItems } from "../src/mock/menu";

test("Renders sidebar", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreSidebar items={qorusSidebarItems} path="/" />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".sidebarItem").length).toBe(7);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(3);
});

test("Sidebar can be collapsed", () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreSidebar
        items={qorusSidebarItems}
        path="/"
        onCollapseChange={handleClick}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".expanded").length).toBe(1);

  fireEvent.click(screen.getByText("Collapse"));

  expect(handleClick).toHaveBeenCalledTimes(1);

  expect(document.querySelectorAll(".expanded").length).toBe(0);
});

test("Can open submenu manually", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreSidebar items={qorusSidebarItems} path="/" />
    </ReqoreUIProvider>
  );

  fireEvent.click(screen.getByText("Menu item 3"));

  expect(document.querySelectorAll(".sidebarItem").length).toBe(10);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(3);
});

test("Submenu opens automatically if path matches", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreSidebar items={qorusSidebarItems} path="/item-3/item-1" />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".sidebarItem").length).toBe(10);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(3);
  expect(document.querySelectorAll(".active").length).toBe(2);
});

test("Bookmarks can be added and removed", () => {
  const handleBookmarksChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreSidebar
        items={qorusSidebarItems}
        path="/"
        onBookmarksChange={handleBookmarksChange}
      />
    </ReqoreUIProvider>
  );

  const addBookmarkButton = document.querySelector(".favorite");

  fireEvent.click(addBookmarkButton);

  expect(handleBookmarksChange).toHaveBeenCalledWith(["menu-item-1"]);
  expect(document.querySelectorAll(".sidebarItem").length).toBe(7);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(4);

  const removeBookmarkButton = document.querySelector(".favorite");

  fireEvent.click(removeBookmarkButton);

  expect(handleBookmarksChange).toHaveBeenCalledWith([]);

  expect(document.querySelectorAll(".sidebarItem").length).toBe(7);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(3);
});

test("Bookmarks clicks are not propagated through", () => {
  const handleBookmarksChange = jest.fn();
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreSidebar
        items={{
          Menu: {
            title: "Menu",
            items: [
              {
                name: "Menu item 1",
                as: "p",
                icon: "home",
                id: "menu-item-1",
                props: {
                  onClick: handleClick,
                },
              },
            ],
          },
        }}
        path="/"
        onBookmarksChange={handleBookmarksChange}
      />
    </ReqoreUIProvider>
  );

  const addBookmarkButton = document.querySelector(".favorite");

  fireEvent.click(addBookmarkButton);

  expect(handleBookmarksChange).toHaveBeenCalledWith(["menu-item-1"]);
  expect(handleClick).toHaveBeenCalledTimes(0);
});

test("Renders item as <p> element with onClick", () => {
  const handleItemClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreSidebar
        items={{
          ...qorusSidebarItems,
          TestItems: {
            title: "TestItems",
            items: [
              {
                name: "Test",
                as: "p",
                props: {
                  onClick: handleItemClick,
                },
                id: "test-item-1",
                icon: "add",
              },
            ],
          },
        }}
        path="/"
      />
    </ReqoreUIProvider>
  );

  const menuItem = document.querySelector("p.sidebarItem");

  expect(menuItem).toBeTruthy();

  fireEvent.click(menuItem);

  expect(handleItemClick).toHaveBeenCalled();

  expect(document.querySelectorAll(".sidebarItem").length).toBe(8);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(4);
});

test("Renders custom item at the top", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreSidebar
        items={qorusSidebarItems}
        path="/"
        customItems={[
          { element: () => <span>Hello, I am a custom item!</span> },
        ]}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".sidebarItem").length).toBe(7);
  expect(document.querySelectorAll(".sidebarSection").length).toBe(4);
  expect(screen.getByText("Hello, I am a custom item!")).toBeTruthy();
});
