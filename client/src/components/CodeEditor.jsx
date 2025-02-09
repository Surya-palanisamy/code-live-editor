import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";

const socket = io("https://code-live-editor.glitch.me/");

const CodeEditor = ({ roomId, username }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [cursors, setCursors] = useState({});
  const [cursorTimers, setCursorTimers] = useState({});

  const getUserColor = (name) => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33A1"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    if (roomId && username) {
      socket.emit("joinRoom", { roomId, username });
    }

    socket.on("codeUpdate", (code) => setValue(code));
    socket.on("languageUpdate", (language) => setLanguage(language));

    socket.on("cursorMove", ({ user, position }) => {
      if (user === username) return;

      setCursors((prev) => ({
        ...prev,
        [user]: { ...position, color: getUserColor(user) },
      }));

      if (cursorTimers[user]) clearTimeout(cursorTimers[user]);

      const timer = setTimeout(() => {
        setCursors((prev) => {
          const newCursors = { ...prev };
          delete newCursors[user];
          return newCursors;
        });
      }, 5000);

      setCursorTimers((prev) => ({
        ...prev,
        [user]: timer,
      }));
    });

    return () => {
      socket.off("codeUpdate");
      socket.off("languageUpdate");
      socket.off("cursorMove");
    };
  }, [roomId, username, cursorTimers]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    editor.onDidChangeCursorPosition((event) => {
      const position = editor.getScrolledVisiblePosition(editor.getPosition());
      if (!position) return;

      const editorDom = editor.getDomNode();
      if (editorDom) {
        const rect = editorDom.getBoundingClientRect();

        socket.emit("cursorMove", {
          roomId,
          user: username,
          position: {
            top: rect.top + position.top - 4, // Adjust closer to cursor
            left: rect.left + position.left + 3, // Align with cursor
          },
        });
      }
    });
  };

  const onSelect = (language) => {
    setLanguage(language);
    socket.emit("languageUpdate", { roomId, language });
  };

  const onChange = (code) => {
    setValue(code);
    socket.emit("codeUpdate", { roomId, code });
  };

  return (
    <Box position="relative">
      <HStack spacing={4}>
        <Box w="50%" position="relative">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{ minimap: { enabled: false } }}
            height="75vh"
            theme="vs-dark"
            language={language}
            value={value}
            onMount={onMount}
            onChange={onChange}
          />

          {/* Cursor Display */}
          {Object.entries(cursors).map(([user, { top, left, color }]) => (
            <div
              key={user}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                transform: "translate(-50%, -80%)", // Bring closer to real cursor
                transition: "top 0.1s linear, left 0.1s linear", // Faster sync
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {/* Tooltip */}
              <div
                style={{
                  background: color,
                  color: "white",
                  padding: "3px 6px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  position: "relative",
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
                  marginBottom: "2px",
                }}
              >
                {user}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0",
                    height: "0",
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `5px solid ${color}`,
                  }}
                />
              </div>

              {/* Cursor Bar */}
              <div
                style={{
                  width: "2px",
                  height: "14px",
                  background: color,
                  borderRadius: "2px",
                }}
              />
            </div>
          ))}
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;