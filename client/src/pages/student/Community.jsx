import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  MessageSquare,
  Heart,
  PlusCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

// ----------------------
// New Post Form with Image Upload
// ----------------------
function NewPostForm({ onCreate }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("Please write something to post.");

    let imageUrl = null;

    if (imageFile) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await axios.post(
          "http://localhost:5000/api/uploads",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        imageUrl = `http://localhost:5000${res.data.url}`;
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    onCreate({ text: text.trim(), image: imageUrl });
    setText("");
    setImageFile(null);
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl shadow p-4 border border-blue-100"
    >
      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share an update, ask a question, or post a success..."
          className="w-full resize-none px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="flex-1 text-sm"
          />
          <div className="flex justify-end w-full sm:w-auto">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg disabled:opacity-50"
            >
              <PlusCircle size={16} /> {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ----------------------
// Post Card Component
// ----------------------
function PostCard({ post, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, { text: commentText.trim() });
    setCommentText("");
    setShowComments(true);
  };

  return (
    <article className="bg-white rounded-2xl shadow border border-blue-100 p-4">
      <div className="flex gap-3">
        <img
          src={
            post.author?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/194/194938.png"
          }
          alt={post.author?.name || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">
                {post.author?.name || "Anonymous"}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {post.likes || 0} <Heart className="inline-block ml-2" size={14} />
            </div>
          </div>

          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.text}</p>

          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              <img
                src={post.image}
                alt="post"
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onLike(post._id)}
              className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg hover:bg-gray-50"
            >
              <Heart size={16} /> Like
            </button>
            <button
              onClick={() => setShowComments((s) => !s)}
              className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg hover:bg-gray-50"
            >
              <MessageSquare size={16} /> Comment
            </button>
          </div>

          {showComments && (
            <div className="mt-3 border-t pt-3">
              {(Array.isArray(post.comments) ? post.comments : []).map(
                (c, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <img
                      src={
                        c.author?.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/194/194938.png"
                      }
                      alt={c.author?.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-sm font-medium">
                        {c.author?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-600">{c.text}</div>
                    </div>
                  </div>
                )
              )}
              <form onSubmit={handleComment} className="mt-3 flex gap-2 items-start">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button className="px-3 py-2 bg-sky-500 text-white rounded-md">
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ----------------------
// Community Page
// ----------------------
export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/community/posts", {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (newPost) => {
    if (!user) return alert("User not logged in.");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/community/posts",
        newPost,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPosts((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/community/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedPost = {
        ...posts.find((p) => p._id === postId),
        likes: res.data.likes,
      };
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updatedPost : p))
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/community/posts/${postId}/comment`,
        comment,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedPost = res.data;
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updatedPost : p))
      );
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  const filteredPosts = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        (p.text || "").toLowerCase().includes(q) ||
        (p.author?.name || "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <main className="pt-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row flex-wrap gap-6 overflow-hidden">
        {/* Left feed */}
        <section className="flex-1 min-w-0 space-y-4">
          <h1 className="text-2xl font-bold text-center whitespace-nowrap">
            SkillForge Community
          </h1>

          {/* Mobile toggle buttons */}
          <div className="flex gap-6 mt-2 mb-4 lg:hidden justify-center">
            <button
              onClick={() => setShowCalendar(false)}
              className={`px-3 py-1 rounded ${
                !showCalendar ? "bg-sky-500 text-white" : ""
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setShowCalendar(true)}
              className={`p-2 rounded ${
                showCalendar ? "bg-sky-500 text-white" : ""
              }`}
            >
              <CalendarIcon size={20} />
            </button>
          </div>

          {/* Mobile view toggle */}
          {!showCalendar && (
            <>
              <NewPostForm onCreate={handleCreatePost} />
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-gray-500 text-sm">No posts found.</div>
                ) : (
                  filteredPosts.map((p) => (
                    <PostCard
                      key={p._id}
                      post={p}
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {showCalendar && (
            <div className="lg:hidden">
              <Calendar value={calendarDate} onChange={setCalendarDate} />
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="hidden lg:block flex-shrink-0 w-72 xl:w-80 space-y-4">
          <div className="bg-white rounded-2xl shadow border border-blue-100 p-4">
            <h3 className="font-semibold mb-3">Calendar</h3>
            <Calendar value={calendarDate} onChange={setCalendarDate} />
          </div>
        </aside>
      </main>
      <div className="pb-10" /> {/* extra padding for tablets */}
    </div>
  );
}
