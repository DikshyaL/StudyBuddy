import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import Logo from "../../assets/logo.png";
import Room from "../../assets/Room.png";
import peer from "../../service/peer.tsx";
import { CiCloudOn } from "react-icons/ci";
import { GoLightBulb } from "react-icons/go";
import {
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";
import { IoMdPhotos } from "react-icons/io";
import { GrAttachment } from "react-icons/gr";
import { MdEmojiEmotions } from "react-icons/md";
import { IoSend, IoSettingsOutline } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { useSocket } from "../../context/SocketProvider.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [FirstUser, setFirstUser] = useState(false);
  const [userName, setuseName] = useState("");
  const [UserJoin, setUserJoin] = useState(true);
  const [SecondUser, setSecondUser] = useState(false);
  const navigate = useNavigate();
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [RoomID, setRoomID] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback(() => {
    if (message.trim() !== "") {
      const msgData = { message, from: socket.id };
      socket.emit("message", msgData);
      // Update local state optimistically
      setMessages((prevMessages) => [...prevMessages, msgData]);
      setMessage("");
    }
  }, [message, socket]);

  const handleMsg = useCallback((msgData) => {
    setMessages((prevMessages) => [...prevMessages, msgData]);
  }, []);

  const handleUserConnect = useCallback(({ name, room, id }) => {
    setFirstUser(true);
    console.log(`${name} joined in host room`);
    setRoomID(room);
    setuseName(name);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", {
      remoteName: userName,
      to: remoteSocketId,
      offer,
    });
    setMyStream(stream);
  }, [userName, remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      setSecondUser(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call from Non-Host User`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setUserJoin(false);
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserConnect);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("message", handleMsg);

    return () => {
      socket.off("user:joined", handleUserConnect);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("message", handleMsg);
    };
  }, [
    socket,
    handleUserConnect,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const handleMicMute = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicMuted(!micMuted);
    }
  };

  const handleVideoMute = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <div className="flex flex-row items-center justify-between w-11/12 h-full mt-10 mb-10 bg-gray-100 rounded-lg shadow-2xl">
        {/* Live Video */}
        <div className="flex flex-col justify-between items-center w-full h-full">
          {/* Top bar */}
          <div className="flex flex-row items-center justify-between w-full p-5">
            <div className="flex flex-row justify-between items-center">
              <img src={Logo} alt="logo" width={60} />
              <div className="font-semibold text-xl">studybuddy</div>
            </div>
            <div>
              <CiCloudOn size={60} />
            </div>
            <div>
              <GoLightBulb size={50} />
            </div>
          </div>

          {/* Body of LiveVideo  */}
          {UserJoin ? (
            <div className="flex flex-col justify-center items-center w-full h-full">
              <div>
                <img src={Room} alt="logo" width={400} />
              </div>
              <div className="flex flex-col justify-center items-center space-x-4 mt-2">
                <div className="">
                  <button
                    className="bg-blue-500 p-1 w-36"
                    onClick={handleCallUser}
                  >
                    Connect
                  </button>
                </div>
                <div className="flex flex-row justify-center items-center space-x-1 pt-2 pb-2">
                  {!FirstUser ? (
                    <div>
                      {!SecondUser ? (
                        <p className="text-xs text-gray-400">No one</p>
                      ) : (
                        <p className="text-xs text-gray-400">Someone</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-400">{userName}</p>
                  )}
                  <p className="text-xs text-gray-400">is in the Room.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between items-center h-full w-full">
              <div className="w-full h-full flex flex-row justify-center items-center">
                <div className="flex flex-row space-x-5">
                  <div className="relative">
                    <ReactPlayer
                      playing
                      muted={micMuted}
                      height="100%"
                      width="100%"
                      url={myStream}
                    />
                  </div>

                  <div className="relative">
                    <ReactPlayer
                      playing
                      muted={videoMuted}
                      height="100%"
                      width="100%"
                      url={remoteStream}
                    />
                  </div>
                </div>
              </div>

              <div className="flex w-full p-2 flex-row space-x-2 items-center justify-center">
                <div className="flex flex-row items-center">
                  {!micMuted ? (
                    <FaMicrophone
                      className="p-3 bg-green-700 rounded-full"
                      size={45}
                      color="white"
                      onClick={handleMicMute}
                    />
                  ) : (
                    <FaMicrophoneSlash
                      className="p-3 bg-green-700 rounded-full"
                      size={45}
                      color="white"
                      onClick={handleMicMute}
                    />
                  )}
                  <MdCallEnd
                    size={45}
                    className="bg-red-600 p-2 w-16 rounded-3xl"
                    color="white"
                    //onClick={handleCallEnd}
                  />

                  {!videoMuted ? (
                    <FaVideo
                      className="p-3 bg-green-700 rounded-full"
                      size={45}
                      color="white"
                      onClick={handleVideoMute}
                    />
                  ) : (
                    <FaVideoSlash
                      className="p-3 bg-green-700 rounded-full"
                      size={45}
                      color="white"
                      onClick={handleVideoMute}
                    ></FaVideoSlash>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-xs"></div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="flex flex-col w-1/4 h-full border-l border-gray-300">
          {/* Messages Display */}
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 m-2 text-white rounded-md ${
                  msg.from === socket.id
                    ? "bg-emerald-700 self-end"
                    : "bg-emerald-600 self-start"
                }`}
              >
                {msg.message}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex flex-col justify-between">
            <div className="flex flex-row">
              <input
                className="p-2"
                type="text"
                placeholder="Type your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="" onClick={sendMessage}>
                <IoSend className="p-3 bg-white" size={55} color="darkgreen" />
              </button>
            </div>

            <div className="flex flex-row items-center w-full bg-white">
              <IoMdPhotos
                className="p-2 bg-white"
                size={45}
                color="darkgreen"
              />
              <GrAttachment
                className="p-2 bg-white"
                size={45}
                color="darkgreen"
              />
              <MdEmojiEmotions
                className="p-2 bg-white"
                size={45}
                color="darkgreen"
              />
            </div>

            <div className="flex flex-row justify-center items-center text-center text-xs p-2 text-gray-500 border-t">
              copyright @2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
