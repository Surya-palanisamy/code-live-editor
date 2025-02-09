import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Form from "./components//Form";
import CodeEditor from "./components/CodeEditor";

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Form
            setRoomId={setRoomId}
            setUsername={setUsername}
            onJoin={() => setJoined(true)}
          />
        }
      />
      <Route
        path="/:roomid"
        element={<CodeEditor roomId={roomId} username={username} />}
      />
    </Routes>
  );
};

export default App;
