import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import Sidebar from './SideBar';
import profilepic from "../assets/profile.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp, faCircleDown, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

interface CommentData {
  _id: string;
  username: string;
  content: string;
  file?: {
    name: string;
    url: string;
  } | null;
}

interface PostData {
  _id: string;
  user_id: string;
  username: string;
  upvotes: number;
  downvotes: number;
  subject: string;
  post_content: string;
  profile_pic: string;
  comments: CommentData[]; 
  userVote: 'upvoted' | 'downvoted' | null;
}

const CommentPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const { username } = useAuth();
  const [showReportMenu, setShowReportMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/postid`, {
          params: { postId }
        });

        console.log('Post Data Response:', response.data);

        // Assuming response.data is the post object
        const fetchedPost = response.data;
        setPost(fetchedPost); // Update state with fetched post
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    if (postId) {
      fetchPost(); // Call fetchPost function when postId exists or changes
    }

  }, [postId]); // Dependency array to watch changes in postId

  if (!post) {
    return <div>Loading...</div>; // Placeholder UI while fetching data
  }

  const handleCommentSubmit = async () => {
    if (newComment && username) {
      const newCommentData: CommentData = {
        _id: `temp_${comments.length + 1}`,
        username: username,
        content: newComment,
        file: file ? { name: file.name, url: URL.createObjectURL(file) } : null,
      };

      setComments([newCommentData, ...comments]);
      setNewComment('');
      setFile(null);

      try {
        console.log('Simulating comment post:', newCommentData);
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handlePostLike = () => {
    if (post) {
      setPost(prevPost => ({
        ...prevPost,
        upvotes: prevPost.userVote === 'upvoted' ? prevPost.upvotes - 1 : prevPost.upvotes + 1,
        downvotes: prevPost.userVote === 'downvoted' ? prevPost.downvotes - 1 : prevPost.downvotes,
        userVote: prevPost.userVote === 'upvoted' ? null : 'upvoted', 
      }));
    }
  };

  const handlePostDislike = () => {
    if (post) {
      setPost(prevPost => ({
        ...prevPost,
        downvotes: prevPost.userVote === 'downvoted' ? prevPost.downvotes - 1 : prevPost.downvotes + 1,
        upvotes: prevPost.userVote === 'upvoted' ? prevPost.upvotes - 1 : prevPost.upvotes,
        userVote: prevPost.userVote === 'downvoted' ? null : 'downvoted', 
      }));
    }
  };

  const toggleReportMenu = (postId: string) => {
    setShowReportMenu(showReportMenu === postId ? null : postId);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <NavBar />
      <div className="flex flex-row flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col w-full overflow-auto p-4">
          {post && (
            <div key={post._id} className="post bg-white p-6 rounded-lg shadow-md">
              <div className="post-header flex items-center mb-4">
                <img src={profilepic} alt={`${post.username}'s profile`} className="w-12 h-12 rounded-full mr-4" />
                <h3 className="text-lg font-semibold">{post.username}</h3>
              </div>
              <h3 className="text-sm">{post.subject}</h3>
              <p className="text-gray-700 mb-4">{post.post_content}</p>
              <div className="post-actions flex space-x-4">
                <button onClick={handlePostLike}>
                  <FontAwesomeIcon
                    icon={faCircleUp}
                    className={`text-2xl ${post.userVote === 'upvoted' ? "text-emerald-800" : "text-gray-500"}`}
                  />
                  <span className={`ml-2 ${post.userVote === 'upvoted' ? "text-emerald-800" : "text-gray-500"}`}>
                    {post.upvotes}
                  </span>
                </button>
                <button onClick={handlePostDislike}>
                  <FontAwesomeIcon
                    icon={faCircleDown}
                    className={`text-2xl ${post.userVote === 'downvoted' ? "text-emerald-800" : "text-gray-500"}`}
                  />
                  <span className={`ml-2 ${post.userVote === 'downvoted' ? "text-emerald-800" : "text-gray-500"}`}>
                    {post.downvotes}
                  </span>
                </button>
              </div>
            </div>
          )}
          <div className="comment-form bg-white p-6 rounded-lg shadow-md mt-6">
            <h4 className="text-lg font-semibold mb-4">Leave a comment</h4>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center text-black">
                <img src={profilepic} alt="Your profile" className="w-8 h-8 rounded-full mr-2" />
                <span>{username}</span>
              </div>
            </div>
            <textarea
              placeholder="Your comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <div className='flex flex-1 justify-end'>
              <label htmlFor="file-upload" className="cursor-pointer">
                <FontAwesomeIcon icon={faPaperclip} className="text-emerald-800 mr-2 mt-2 size-6" />
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <button onClick={handleCommentSubmit} className="bg-emerald-800 text-white px-4 py-2 rounded-full hover:bg-emerald-800 transition-transform transform hover:scale-110">
                Submit
              </button>
            </div>
          </div>
          <div className="comments bg-white p-6 rounded-lg shadow-md mt-6">
            <h4 className="text-lg font-semibold mb-4">Comments</h4>
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="comment mb-4">
                  <div className="flex items-center">
                    <img src={profilepic} alt="Your profile" className="w-8 h-8 rounded-full mr-2" />
                    <h5 className="font-semibold">{comment.username}</h5>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  {comment.file && (
                    <div className="file-attachment">
                      <span>Attachment: {comment.file.name}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No comments available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPage;
