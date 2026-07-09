import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

afterEach(() => {
  cleanup();
});

test("defaults to the Preview view", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
});

test("clicking the Code tab switches to the code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  expect(screen.getByTestId("file-tree")).toBeInTheDocument();
  expect(screen.queryByTestId("preview-frame")).not.toBeInTheDocument();
});

test("toggling back and forth repeatedly keeps state in sync", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  for (let i = 0; i < 5; i++) {
    await user.click(codeTab);
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    expect(codeTab).toHaveAttribute("data-state", "active");
    expect(previewTab).toHaveAttribute("data-state", "inactive");

    await user.click(previewTab);
    expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
    expect(previewTab).toHaveAttribute("data-state", "active");
    expect(codeTab).toHaveAttribute("data-state", "inactive");
  }
});

test("clicking the already-active tab does not break the view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });

  await user.click(previewTab);
  await user.click(previewTab);

  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  expect(previewTab).toHaveAttribute("data-state", "active");
});
