// import NavBar from "./pages/NavBar";
// import RegisterPage from "./pages/auth/RegisterPage";
// import Profile from "./pages/profile";
// import LoginPage from "./pages/auth/LoginPage";
// import logo from "./assets/logo.png";
// import { RouterProvider, createBrowserRouter } from "react-router-dom";

 import { Outlet } from "react-router-dom";

// import CommunityPosts from "./pages/CommunityPost";
// import Chat from "./pages/chat";

// import PostForm from "./pages/PostForm";
// import VerificationPage from "./pages/VerificationPage";
// import LobbyScreen from "./pages/lobby/Lobby";
// import RoomPage from "./pages/room/Room";

// const router = createBrowserRouter([
//   {
//     path: "/lobby",
//     element: <LobbyScreen />,
//   },
//   {
//     path: "/room/:roomId",
//     element: <RoomPage />,
//   },
// ]);

const App = () => {
   return <Outlet />;
  //return <ChatLobby/>;
};

export default App;

