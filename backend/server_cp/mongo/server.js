const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3001;

const mongoURL = 'mongodb+srv://ranabhatsabin93:TPegt8SQ7fwGppBM@studdybuddy.w3noad3.mongodb.net/StuddyBuddy?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json());


mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));


const postSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  username: String,
  upvotes: Number,
  downvotes: Number,
  subject: String,
  post_content: String,
  profile_pic: String,
  comment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});



const emailSchema = new mongoose.Schema({
  username: String,
  email: String,
});


const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  username: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Example reference to a User model
  upvotes: Number,
  downvotes: Number,
  profile_pic:String,
});


const PostCollection = mongoose.model('StuddyBuddy', postSchema, 'Posts');
const EmailCollection = mongoose.model('StudyBuddy', emailSchema, 'Users');
const Post = mongoose.model('studybuddy', postSchema,'Posts');
const Comment = mongoose.model('Comment', commentSchema);

app.get('/api/user-posts', async (req, res) => {
  const { username } = req.query;

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Requested username:', username);

    const userPosts = await PostCollection.find({ username });
    console.log('User posts:', userPosts);

    if (userPosts.length === 0) {
      return res.status(404).json({ error: 'No posts found for the given username' });
    }

    res.status(200).json(userPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});
app.get('/api/subject', async (req, res) => {
  const { subjectt, username } = req.query; 

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Requested subject:', subjectt);
    console.log('Exclude posts from username:', username);

    // Fetch posts that match the subject and exclude posts from the specified username
    const subPosts = await PostCollection.find({
      subject: subjectt,
      username: { $ne: username }
    });

    console.log('subject posts:', subPosts);

    if (subPosts.length === 0) {
      return res.status(404).json({ error: 'No posts found for the given subject' });
    }

    res.status(200).json(subPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/liked', async (req, res) => {
  const { username } = req.query; 

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Exclude posts from username:', username);

    const topLikedPosts = await PostCollection.find({ username: { $ne: username } })
      .sort({ upvotes: -1 })
      .limit(15);

    console.log('Top liked posts:', topLikedPosts);

    if (topLikedPosts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }

    res.status(200).json(topLikedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
app.get('/api/posts', async (req, res) => {
  const { username } = req.query;

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Exclude posts from username:', username);

    // Find all posts except those from the specified username, limit to 10
    const posts = await PostCollection.find({ username: { $ne: username } })
    .limit(15)
    .exec();

    console.log('All posts except from specified username:', posts);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


app.get('/api/trending', async (req, res) => {
  const { username } = req.query;

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Exclude posts from username:', username);

    const trendingPosts = await PostCollection.aggregate([
      { $match: { username: { $ne: username } } },
      { $addFields: { totalVotes: { $add: ["$upvotes", "$downvotes"] } } }, // Using $subtract for modulus of subtracted value
      { $sort: { totalVotes: -1 } },
      { $limit: 15 }
    ]).exec(); 

    console.log('Trending posts:', trendingPosts);

    if (trendingPosts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }

    res.status(200).json(trendingPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/hot_posts', async (req, res) => {
  const { username } = req.query; 

  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Exclude posts from username:', username);

    const hotPosts = await PostCollection.aggregate([
      { $match: { username: { $ne: username } } },
      { $addFields: { totalVotes: { $subtract: ["$upvotes", "$downvotes"] } } },
      { $addFields: { totalVotesAbs: { $abs: "$totalVotes" } } },
      { $sort: { totalVotesAbs: -1 } },
      { $limit: 15 }
    ]).exec(); 

    console.log('hot_posts', hotPosts);

    if (hotPosts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }

    res.status(200).json(hotPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


app.get('/api/user-email', async (req, res) => {
  const { username } = req.query;
  console.log('Requested username:', username);

  try {
    const userEmailDoc = await EmailCollection.findOne({ username });

    if (!userEmailDoc) {
      return res.status(404).json({ error: 'No email found for the given username' });
    }

    const userEmail = userEmailDoc.email;
    console.log('User email:', userEmail);

    res.status(200).json({ email: userEmail });
  } catch (error) {
    console.error('Error fetching user email:', error);
    res.status(500).json({ error: 'Failed to fetch user email' });
  }
});


app.get('/api/postid', async (req, res) => {
  const { postId } = req.query;
  console.log('Requested post ID:', postId);

  try {
    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    // Fetch post data from MongoDB
    const post = await Post.findById(postId).populate('comment').exec();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

