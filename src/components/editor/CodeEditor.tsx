"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import { AlertCircle, Code2 } from "lucide-react";

// Monaco's assets are fetched from a CDN (cdn.jsdelivr.net) at runtime. If
// that request is blocked (ad blockers, restrictive networks, being
// offline, etc.) the underlying loader silently rejects and the editor is
// stuck showing "Loading..." forever with no indication anything went
// wrong. We watch for that failure (and time out if it takes too long) so
// we can show an actionable error instead of a spinner that never resolves.
const MONACO_LOAD_TIMEOUT_MS = 15000;

export function CodeEditor() {
  const { selectedFile, getFileContent, updateFile } = useFileSystem();
  const editorRef = useRef<any>(null);
  const [monacoFailed, setMonacoFailed] = useState(false);

  useEffect(() => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        setMonacoFailed(true);
      }
    }, MONACO_LOAD_TIMEOUT_MS);

    loader
      .init()
      .then(() => {
        settled = true;
        clearTimeout(timeoutId);
      })
      .catch((err: any) => {
        // The loader rejects with a { type: "cancelation" } error when the
        // effect cleanup cancels the in-flight init - that's not a failure.
        if (err?.type === "cancelation") return;
        settled = true;
        clearTimeout(timeoutId);
        console.error("Monaco editor failed to load:", err);
        setMonacoFailed(true);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      updateFile(selectedFile, value);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  if (monacoFailed) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-1">
            코드 에디터를 불러오지 못했습니다
          </p>
          <p className="text-xs text-gray-500 mb-4">
            에디터 리소스를 CDN에서 불러오는 데 실패했습니다. 광고 차단
            확장 프로그램이나 네트워크 연결을 확인한 뒤 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Code2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Select a file to edit
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Choose a file from the file tree
          </p>
        </div>
      </div>
    );
  }

  const content = getFileContent(selectedFile) || '';
  const language = getLanguageFromPath(selectedFile);

  return (
    <Editor
      height="100%"
      language={language}
      value={content}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        automaticLayout: true,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}