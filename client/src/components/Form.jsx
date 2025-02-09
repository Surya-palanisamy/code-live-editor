import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, VStack, Input, Button, Heading, Text } from "@chakra-ui/react";

const Form = ({ setRoomId, setUsername, onJoin }) => {
  const navigate = useNavigate();
  const { roomid } = useParams(); // Get roomId from URL
  const [room, setRoom] = useState(roomid || "");
  const [name, setName] = useState("");

  useEffect(() => {
    if (roomid) setRoom(roomid);
  }, [roomid]);

  const handleJoin = () => {
    if (!room || !name) {
      alert("Room ID and Name are required!");
      return;
    }

    setRoomId(room);
    setUsername(name);
    onJoin();
    navigate(`/${room}`); // Navigate to the room
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${room}`;
    navigator.clipboard.writeText(url);
    alert("Room link copied to clipboard!");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgGradient="linear(to-r, #1A1A40, #4C00FF)"
    >
      <VStack spacing={6} p={8} borderRadius="2xl" boxShadow="lg" w="md">
        <Heading size="lg" color="white">
          🚀 Join a Room
        </Heading>
        <Text fontSize="md" color="gray.300">
          Enter a Room ID and your name to get started.
        </Text>
        <Input
          placeholder="Enter Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <Input
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleJoin} isDisabled={!room || !name}>
          🔥 Join Room
        </Button>
        <Button onClick={handleShare} isDisabled={!room}>
          📤 Share Room Link
        </Button>
      </VStack>
    </Box>
  );
};

export default Form;
