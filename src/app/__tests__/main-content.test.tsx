import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

afterEach(() => {
  cleanup();
});

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useFileSystem: () => ({
    fileSystem: { serialize: () => ({}) },
    handleToolCall: () => {},
  }),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useChat: () => ({
    messages: [],
    input: "",
    handleInputChange: () => {},
    handleSubmit: () => {},
    status: "idle",
  }),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>chat-interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>file-tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">code-editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">preview-frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>header-actions</div>,
}));

test("clicking Code and Preview tabs toggles the right panel content", () => {
  render(<MainContent />);

  // Preview is shown by default
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();

  // Click "Code" tab
  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  expect(screen.queryByTestId("preview-frame")).not.toBeInTheDocument();

  // Click "Preview" tab
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
});
