"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function fileName(path: unknown): string | null {
  if (typeof path !== "string" || path === "") return null;
  return path.split("/").pop() || null;
}

function getToolMessage(toolName: string, args: any): string {
  const file = fileName(args?.path);

  if (toolName === "str_replace_editor" && file) {
    switch (args.command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Reading ${file}`;
      case "undo_edit":
        return `Undoing changes to ${file}`;
    }
  }

  if (toolName === "file_manager" && file) {
    switch (args.command) {
      case "rename": {
        const newFile = fileName(args?.new_path);
        return newFile ? `Renaming ${file} to ${newFile}` : `Renaming ${file}`;
      }
      case "delete":
        return `Deleting ${file}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, state } = toolInvocation;
  const message = getToolMessage(toolName, toolInvocation.args);
  const isComplete = state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
