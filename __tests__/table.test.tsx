import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from "../src";
import { IReqoreTableColumn, IReqoreTableSort } from "../src/components/Table";
import tableData from "../src/mock/tableData";

test("Renders basic <Table /> properly", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...tableData} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-table-header-cell").length).toBe(7);
  expect(document.querySelectorAll(".reqore-table-row").length).toBe(10);
});

test("Renders <Table /> with grouped columns properly", () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: "id",
        header: "ID",
        width: 50,
        align: "center",
      },
      {
        header: "Name",
        dataId: "name",
        grow: 3,
        columns: [
          { dataId: "firstName", header: "First Name", width: 150, grow: 2 },
          { dataId: "lastName", header: "Last Name", width: 150, grow: 1 },
        ],
      },
      { dataId: "address", header: "Address", width: 300, grow: 2 },
      {
        dataId: "age",
        header: "Really long age header",
        width: 50,
        align: "center",
      },
      { dataId: "occupation", header: "Ocuppation", width: 200 },
      { dataId: "group", header: "Group", width: 150 },
    ] as IReqoreTableColumn[],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll(".reqore-table-column-group").length).toBe(
    1
  );
  expect(document.querySelectorAll(".reqore-table-header-cell").length).toBe(7);
});

test("Renders <Table /> with custom content", () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: "id",
        header: "ID",
        width: 50,
        align: "center",
        content: ({ id }) => <span>ID {id}</span>,
      },
      {
        header: "Name",
        dataId: "name",
        grow: 3,
        columns: [
          { dataId: "firstName", header: "First Name", width: 150, grow: 2 },
          { dataId: "lastName", header: "Last Name", width: 150, grow: 1 },
        ],
      },
      { dataId: "address", header: "Address", width: 300, grow: 2 },
      {
        dataId: "age",
        header: "Really long age header",
        width: 50,
        align: "center",
      },
      { dataId: "occupation", header: "Ocuppation", width: 200 },
      { dataId: "group", header: "Group", width: 150 },
    ] as IReqoreTableColumn[],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector(".reqore-table-row");
  const idCell = firstRow.querySelector(".reqore-table-cell");

  expect(idCell.textContent).toBe("ID 0");
});

test("Sorting on <Table /> works properly", () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: "id",
        header: "ID",
        width: 50,
        align: "center",
        sortable: true,
      },
      { dataId: "firstName", header: "First Name", width: 150 },
      { dataId: "lastName", header: "Last Name", width: 150 },
      { dataId: "address", header: "Address", width: 300, grow: 2 },
      {
        dataId: "age",
        header: "Really long age header",
        width: 50,
        align: "center",
        sortable: true,
      },
      { dataId: "occupation", header: "Ocuppation", width: 200 },
      { dataId: "group", header: "Group", width: 150 },
    ] as IReqoreTableColumn[],
    sort: {
      by: "id",
      direction: "desc",
    } as IReqoreTableSort,
  };

  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSortChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector(".reqore-table-row");
  const idCell = firstRow.querySelector(".reqore-table-cell");

  expect(idCell.textContent).toBe("99");

  fireEvent.click(document.querySelectorAll(".reqore-table-header-cell")[4]);

  const ageCell = firstRow.querySelectorAll(".reqore-table-cell")[4];

  expect(fn).toHaveBeenCalledWith({ by: "age", direction: "desc" });
  expect(ageCell.textContent).toBe("99");

  fireEvent.click(document.querySelectorAll(".reqore-table-header-cell")[4]);

  expect(fn).toHaveBeenLastCalledWith({ by: "age", direction: "asc" });
  expect(ageCell.textContent).toBe("0");
  expect(idCell.textContent).toBe("99");
});

test("Rows on <Table /> can be selected", () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector(".reqore-table-row");
  const firstCheckCell = firstRow.querySelector(".reqore-table-cell");

  fireEvent.click(firstCheckCell);

  expect(fn).toHaveBeenCalledWith(["Row-0"]);

  const secondRow = document.querySelectorAll(".reqore-table-row")[1];
  const secondCheckCell = secondRow.querySelector(".reqore-table-cell");

  fireEvent.click(secondCheckCell);

  expect(fn).toHaveBeenLastCalledWith(["Row-0", "Row-1"]);
});

test("Rows on <Table /> cannot be selected if _selectId is missing", () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector(".reqore-table-row");
  const firstCheckCell = firstRow.querySelector(".reqore-table-cell");

  fireEvent.click(firstCheckCell);

  const fourthRow = document.querySelectorAll(".reqore-table-row")[3];
  const fourthCheckCell = fourthRow.querySelector(".reqore-table-cell");

  fireEvent.click(fourthCheckCell);

  expect(fn).toHaveBeenCalledTimes(1);
});

test("Rows on <Table /> are all selected/deselected when clicking on header", () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const header = document.querySelector(".reqore-table-header-wrapper");
  const firstHeaderCell = header.querySelector(".reqore-table-header-cell");

  fireEvent.click(firstHeaderCell);

  const selectableData: string[] = tableData.data
    .filter((datum) => datum._selectId ?? false)
    .map((datum) => datum._selectId);

  expect(fn).toHaveBeenCalledWith(selectableData);

  fireEvent.click(firstHeaderCell);

  expect(fn).toHaveBeenLastCalledWith([]);

  const firstRow = document.querySelector(".reqore-table-row");
  const firstCheckCell = firstRow.querySelector(".reqore-table-cell");

  fireEvent.click(firstCheckCell);
  fireEvent.click(firstHeaderCell);

  expect(fn).toHaveBeenLastCalledWith(selectableData);
});
