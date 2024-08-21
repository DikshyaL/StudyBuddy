import React, { useState, useEffect } from "react";
import profilePic from "../assets/profile.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./SideBar";
import NavBar from "./NavBar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp, faCircleDown, faComment } from '@fortawesome/free-solid-svg-icons';

interface CommunityPost {
  _id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  profilePic: string;
  username: string;
  subject: string;
  post_content: string;
  photos: string[];
  comments: number;
  userVote: 'upvoted' | 'downvoted' | null; // Track user interaction state
}

const Landing: React.FC = () => {
  const [showReportMenu, setShowReportMenu] = useState<string | null>(null); // Use string type for postId
  const navigate = useNavigate();
  const { username } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const subjectt = localStorage.getItem('subject');
  
  useEffect(() => {
    if (!subjectt) {
      axios.get('http://localhost:3001/api/posts', {
        params: { subjectt, username }
      })
        .then(response => {
          if (Array.isArray(response.data)) {
            const initializedPosts = response.data.map(post => ({
              ...post,
              userVote: null // Initialize userVote to null for each post
            }));
            setPosts(initializedPosts);
          } else {
            console.error('Unexpected posts response format:', response.data);
          }
          localStorage.removeItem("subject");
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
        });
    }
  }, [subjectt, username]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? {
              ...post,
              upvotes: post.userVote === 'upvoted' ? post.upvotes - 1 : post.upvotes + 1,
              downvotes: post.userVote === 'downvoted' ? post.downvotes - 1 : post.downvotes,
              userVote: post.userVote === 'upvoted' ? null : 'upvoted', // Toggle userVote
            }
          : post
      )
    );
  };

  const handleDislike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? {
              ...post,
              downvotes: post.userVote === 'downvoted' ? post.downvotes - 1 : post.downvotes + 1,
              upvotes: post.userVote === 'upvoted' ? post.upvotes - 1 : post.upvotes,
              userVote: post.userVote === 'downvoted' ? null : 'downvoted', // Toggle userVote
            }
          : post
      )
    );
  };

  const toggleReportMenu = (postId: string) => {
    setShowReportMenu(showReportMenu === postId ? null : postId);
  };

  const goToFormPost = () => {
    navigate('/PostForm');
  };
  const goTocomment=(postId:string)=>{
    navigate(`/posts/${postId}/comments`);
  }

  return (
    <div className="flex flex-col w-full">
      <NavBar />
      <div className="flex justify-between space-x-5 mt-2">
        <div className="w-1/6 transparent">
          <div className="fixed w-full">
            <Sidebar />
          </div>
        </div>
        <div className="flex flex-col w-5/6 mt-2">
          <div className="flex flex-1 justify-end">
            <button
              className="mt-[-4px] mr-6 p-1 text-white bg-emerald-800 hover:bg-emerald-800 hover:text-which transition-transform transform hover:scale-110 rounded-full text-base"
              onClick={goToFormPost}
            >
              <i className="fas fa-plus text-base"></i>
              <span>Create Post</span>
            </button>
          </div>
          <div className="overflow-y-auto mt-2">
            {posts.map(post => (
              <div
                key={post._id} 
                className="post p-4 mb-4 bg-gray-100 shadow rounded-xl relative"
              >
                <div className="absolute top-0 right-0 m-2">
                  <button onClick={() => toggleReportMenu(post._id)}>
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  {showReportMenu === post._id && (
                    <div className="bg-white absolute top-full right-0 mt-1 shadow rounded">
                      <button className="block w-full py-2 px-4 text-left hover:bg-gray-200">
                        Report
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-2">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="font-bold">{post.username}</span>
                </div>
                <h3 className="text-sm">{post.subject}</h3>
                <p className="mb-2">{post.post_content}</p>
                {post.photos && (
                  <div className="flex flex-wrap">
                    {post.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo} 
                        alt="Post"
                        className="w-1/4 h-1/4 m-1"
                      />
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-4">
                    <button
                      className={`flex items-center ${post.userVote === 'upvoted' ? 'text-green-800' : 'text-gray-500'}`}
                      onClick={() => handleLike(post._id)}
                    >
                      <FontAwesomeIcon icon={faCircleUp} className="mr-1  text-2xl" />
                      <span>{post.upvotes}</span>
                    </button>
                    <button
                      className={`flex items-center ${post.userVote === 'downvoted' ? 'text-red-800' : 'text-gray-500'}`}
                      onClick={() => handleDislike(post._id)}
                    >
                      <FontAwesomeIcon icon={faCircleDown} className="mr-1 text-2xl" />
                      <span>{post.downvotes}</span>
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500" >
                    <button onClick={()=>goTocomment(post._id)}>
                    <FontAwesomeIcon icon={faComment} className="mr-1  text-2xl" />
                    <span>{post.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
