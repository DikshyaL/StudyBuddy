import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider.js";
import { FaUser } from "react-icons/fa";
import Logo from "../../assets/logo.png";
import lobby from "../../assets/lobby.png";
import "./lobby.css";
import axios from "axios";
import { IoExit } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext.js";

const LobbyScreen = () => {
  const [name, setname] = useState("");
  const [room, setRoom] = useState("");
  const [roomCount, setroomCount] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const { username } = useAuth();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (username) { setname(username); }
      console.log(
        `Form Data is: | ---Original Room = ${room} |--- name: ${name} | ---`
      );

      const RandomNumber = Math.floor(Math.random() * 10000) + 1;
      // Append random number to the room name
      const roomWithRandomNumber = `${room}${RandomNumber}`;

      // Send the room name to the server
      axios({
        url: "http://172.18.121.52:8001/strings",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { room: roomWithRandomNumber },
      })
        .then((res) => {
          console.log("Form Data sent and data as response is: ", res.data);
          const { rooms: existingRooms, count } = res.data;
          console.log(count);
          setroomCount(count);
          console.log(roomCount);

          // Check if any room contains the substring of the desired room name
          const matchingRoom = existingRooms.find((existingRoom) =>
            existingRoom.includes(room)
          );
          console.log(
            "Room to Connect after array reading is : ",
            matchingRoom
          );

          const roomToJoin = matchingRoom ? matchingRoom : roomWithRandomNumber;
          // Emit the event to join the room
          socket.emit("room:join", { username, room: roomToJoin });
          console.log("Emitted room:join | ----> Final Name and Room", {
            username,
            room: roomToJoin,
          });
        })
        .catch((err) => {
          console.error("Error sending room name to the server:", err);
        });
    },
    [name, socket, room]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { name, room } = data;
      navigate(`/roomvideo/${room}`);
    },
    [navigate]
  );

  const gotohome = () => {
    navigate(`/home2`);
  };

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen  ">
      <div className=" flex flex-col items-center justify-between w-11/12 h-full mt-10 mb-10 bg-gray-100 rounded-lg shadow-2xl ">
        {/* Top Bar  */}
        <div className="flex flex-row justify-between w-full items-center p-5">
          <div className="cursor-pointer	" onClick={gotohome}>
            <div className="flex flex-row justify-center items-center">
              <img src={Logo} alt="logo" width={60} />
              <div className="font-semibold text-2xl ml-1">studybuddy</div>
            </div>
          </div>

          <div>
            <div className="text-xs flex flex-row items-center space-x-2 ">
              <div>
                <div className="wrapper" onClick={gotohome}>
                  <div className="icon exit">
                    <div className="tooltip">Exit Lobby</div>
                    <span>
                      <i className="fa fa-sign-out"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section  */}
        <div className="flex flex-row justify-between items-center  p-5 space-x-8">
          <div className="flex flex-col justify-between items-center  p-3 ">
            {/* lobby title */}
            <div className="font-semibold text-3xl text-emerald-800 mb-5">
              Setup Your Lobby
            </div>
            {/* form  */}
            <div>
              <form onSubmit={handleSubmitForm}>
                <div className="flex flex-col">
                  <div className="input-group">
                    <input
                      required
                      type="text"
                      id="name"
                      value={username}

                    />
                    <label htmlFor="name">Name: </label>
                  </div>

                  <div className="input-group">
                    <input
                      required
                      type="text"
                      id="room"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                    <label htmlFor="room">Subject: </label>
                  </div>
                </div>

                {/* Button  */}
                <div className="w-full flex flex-row items-center justify-center">
                  <button className="bg-emerald-700 text-white font-semibold text-lg p-1 w-1/3 hover:bg-emerald-800">
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Image  */}
          <div className="mb-36">
            <img src={lobby} alt="logo" width={600} />
          </div>
        </div>

        <div className="text-s text-gray-400 p-5 ">copyright@2024</div>
      </div>
    </div>
  );
};

export default LobbyScreen;
