import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    toolCallId: "call_1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
    state: "result",
    result: "Success",
    ...overrides,
  } as ToolInvocation;
}

test("shows creating message for str_replace_editor create command", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation()} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("shows editing message for str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "str_replace", path: "/components/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows editing message for insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "insert", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows reading message for view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "view", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

test("shows undo message for undo_edit command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "undo_edit", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("Undoing changes to App.jsx")).toBeDefined();
});

test("shows renaming message for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/components/Card.jsx",
          new_path: "/components/NewCard.jsx",
        },
      })}
    />
  );

  expect(screen.getByText("Renaming Card.jsx to NewCard.jsx")).toBeDefined();
});

test("shows renaming message without new name when new_path is missing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "rename", path: "/components/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("Renaming Card.jsx")).toBeDefined();
});

test("shows deleting message for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("Deleting Card.jsx")).toBeDefined();
});

test("falls back to raw tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "some_other_tool",
        args: { command: "create", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("falls back to raw tool name when args are empty", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ args: {} })} />);

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to raw tool name when args are undefined", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ args: undefined, state: "partial-call" })}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to raw tool name for unknown command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "something_new", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("shows success indicator when tool call has completed", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation()} />);

  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner while tool call is in progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ state: "call", result: undefined })}
    />
  );

  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
