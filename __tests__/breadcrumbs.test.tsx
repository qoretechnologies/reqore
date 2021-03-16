import { act, render } from "@testing-library/react";
import React from "react";
import {
  ReqoreBreadcrumbs,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../src";

test("Renders full <Breadcrumbs /> properly", () => {
  render(
    <div style={{ width: "1000px" }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            items={[
              { label: "Page 1", icon: "Home3Line" },
              { label: "Page 2", icon: "Home3Line" },
              { label: "Page 3", icon: "Home3Line" },
              { label: "Page 4", icon: "Home3Line" },
              { label: "Page 5", icon: "Home3Line" },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll(".reqore-breadcrumbs-wrapper").length).toBe(
    1
  );
  expect(document.querySelectorAll(".reqore-breadcrumbs-item").length).toBe(5);
});

test("Renders shortened <Breadcrumbs /> properly", () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            _testWidth={300}
            items={[
              { label: "Page 1", icon: "Home3Line" },
              { label: "Page 2", icon: "Home3Line" },
              { label: "Page 3", icon: "Home3Line" },
              { label: "Page 4", icon: "Home3Line" },
              { label: "Page 5", icon: "Home3Line" },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll(".reqore-breadcrumbs-wrapper").length).toBe(
    1
  );
  expect(document.querySelectorAll(".reqore-breadcrumbs-item").length).toBe(2);
});
