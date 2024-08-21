// Router.tsx
import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home2 from "./pages/Home2";
import Home3 from "./pages/Home3";
import Home4 from "./pages/Home4";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import { SocketProvider } from "./context/SocketProvider.tsx";
import ProtectedRoutes from "./ProtectedRoutes"; // Import ProtectedRoutes component

// Import individual protected route components
import Profile from './pages/profile';
import CommunityPosts from './pages/CommunityPost';
import PostForm from './pages/PostForm';
import ChatForm from './pages/ChatForm';
import ChatRoom from './pages/ChatRoom';
import Landing from './pages/Landing';
import RoomPage from "./pages/room/Room";
import LobbyScreen from "./pages/lobby/Lobby";
import CommentPage from "./pages/comment.tsx";


// Create your router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home2 /> },
      // { path: "/room/:room", element: <RoomPage /> },
      // { path: "/lobby", element: <LobbyScreen /> },
      { path: "/home3", element: <Home3 /> },
      { path: "/home4", element: <Home4 /> },
      {
        path: "/roomvideo/:room",
        element: <SocketProvider> <RoomPage /> </SocketProvider>,
      },
      {
        path: "/lobby",
        element: <SocketProvider><LobbyScreen /></SocketProvider>,
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify", element: <VerificationPage /> },
      {
        // Use ProtectedRoutes component as an element
        element: <ProtectedRoutes />,
        children: [
          { path: '/profile', element: <Profile /> },
          { path: '/CommunityPost', element: <CommunityPosts /> },
          { path: '/PostForm', element: <PostForm /> },
          { path: "/landing", element: <Landing /> },
          {
            path: "/room",
            element: <ChatRoom />,
          },
          {
            path: "/room/:id",
            element: <ChatForm />,
          },
          {
            path:"/posts/:postId/comments",
            element:<CommentPage/>,
          },
          // {
          //   path: "/roomvideo/:room",
          //   element: <SocketProvider> <RoomPage /> </SocketProvider>,
          // },
          // {
          //   path: "/lobby",
          //   element: <SocketProvider><LobbyScreen /></SocketProvider>,
          // },
        ],
      },
    ],
  },
]);

// Define the Router component
function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
