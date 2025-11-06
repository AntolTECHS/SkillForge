// src/pages/student/Community.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  MessageSquare,
  Heart,
  PlusCircle,
  Search,
  Users,
  Paperclip,
  X,
} from "lucide-react";

/**
 * Student Community Page
 *
 * - Feed (create post, like, comment)
 * - Members list (mock)
 * - Search / filter
 * - Small AI chat quick panel (local stub)
 *
 * Replace mock actions with API calls as needed.
 */

function NewPostForm({ onCreate }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("Please write something to post.");
    onCreate({
      id: `p_${Date.now()}`,
      author: null, // caller will fill
      text: text.trim(),
      image: imageUrl.trim() || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    });
    setText("");
    setImageUrl("");
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-4 border border-blue-100">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share an update, ask a question, or post a success..."
            className="w-full resize-none px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <div className="flex gap-2 mt-3 items-center">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Optional image URL"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button type="submit" className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg">
              <PlusCircle size={16} /> Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function PostCard({ post, currentUser, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, { id: `c_${Date.now()}`, author: currentUser, text: commentText.trim(), createdAt: new Date().toISOString() });
    setCommentText("");
    setShowComments(true);
  };

  return (
    <article className="bg-white rounded-2xl shadow border border-blue-100 p-4">
      <div className="flex items-start gap-3">
        <img src={post.author?.avatar || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={post.author?.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">{post.author?.name || "Anonymous"}</div>
              <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-500">{post.likes} <Heart className="inline-block ml-2" size={14} /></div>
          </div>

          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.text}</p>

          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              <img src={post.image} alt="post" className="w-full h-56 object-cover" />
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => onLike(post.id)} className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg hover:bg-gray-50">
              <Heart size={16} /> Like
            </button>

            <button onClick={() => setShowComments((s) => !s)} className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg hover:bg-gray-50">
              <MessageSquare size={16} /> Comment
            </button>
          </div>

          {showComments && (
            <div className="mt-3 border-t pt-3">
              <div className="space-y-2">
                {(post.comments || []).map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <img src={c.author?.avatar || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={c.author?.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-sm font-medium">{c.author?.name || "User"}</div>
                      <div className="text-xs text-gray-600">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleComment} className="mt-3 flex items-start gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 px-3 py-2 border rounded-md" />
                <button className="px-3 py-2 bg-sky-500 text-white rounded-md">Reply</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function MembersList({ members = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-blue-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Community Members</h3>
        <div className="text-xs text-gray-500">{members.length}</div>
      </div>

      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3">
            <img src={m.avatar} className="w-10 h-10 rounded-full object-cover" alt={m.name} />
            <div>
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">{m.role || "Learner"}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIQuickChat({ open, onClose, onSend }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open) return;
    // keep small history only in-memory
    setHistory((h) => h.slice(-10));
  }, [open]);

  const send = (e) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    const userMsg = { from: "user", text: msg.trim(), id: `m_${Date.now()}` };
    setHistory((h) => [...h, userMsg, { from: "ai", text: "Thinking... (local mock reply)", id: `r_${Date.now()}` }]);
    setMsg("");
    onSend && onSend(userMsg);
    // simulate ai response
    setTimeout(() => {
      setHistory((h) => {
        const last = h[h.length - 1];
        if (last && last.from === "ai" && last.text.includes("Thinking")) {
          return [...h.slice(0, -1), { from: "ai", text: "Nice question! Try checking the lesson resources and asking in the thread.", id: `r_${Date.now()}` }];
        }
        return h;
      });
    }, 900);
  };

  return (
    <div className={`fixed right-4 bottom-4 z-50 w-80 bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden transform transition-all ${open ? "translate-y-0" : "translate-y-6 opacity-0"}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare />
          <div className="font-semibold text-sm">AI Chat</div>
        </div>
        <button onClick={onClose} className="text-gray-500"><X /></button>
      </div>

      <div className="p-3 h-48 overflow-y-auto text-sm space-y-2">
        {history.length === 0 ? <div className="text-gray-400">Ask the community AI a short question.</div> : null}
        {history.map((m) => (
          <div key={m.id} className={`p-2 rounded-md ${m.from === "user" ? "bg-sky-50 text-right" : "bg-gray-50"}`}>
            <div className="text-xs text-gray-700">{m.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="px-3 py-2 border-t flex items-center gap-2">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask something..." className="flex-1 px-3 py-2 border rounded-md text-sm" />
        <button type="submit" className="px-3 py-2 bg-sky-500 text-white rounded-md">Send</button>
      </form>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  // mock initial data
  useEffect(() => {
    const initial = [
      {
        id: "p1",
        author: { id: "u1", name: "Amina K.", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
        text: "Does anyone have tips for staying motivated in week 3 of the React course?",
        image: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        likes: 4,
        comments: [{ id: "c1", author: { name: "John" }, text: "Break tasks into 20-min sprints — it helped me!", createdAt: new Date().toISOString() }],
      },
      {
        id: "p2",
        author: { id: "u2", name: "Sam O.", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
        text: "Shared a small code snippet for debouncing input — hope this helps!",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=60",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
        likes: 12,
        comments: [],
      },
    ];

    const mems = [
      { id: "u1", name: "Amina K.", avatar: "https://randomuser.me/api/portraits/women/68.jpg", role: "Student" },
      { id: "u2", name: "Sam O.", avatar: "https://randomuser.me/api/portraits/men/32.jpg", role: "Mentor" },
      { id: "u3", name: "Lina M.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", role: "Student" },
      { id: "u4", name: "David R.", avatar: "https://randomuser.me/api/portraits/men/12.jpg", role: "Student" },
    ];

    setPosts(initial);
    setMembers(mems);
  }, []);

  const filteredPosts = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.text.toLowerCase().includes(q) || (p.author?.name || "").toLowerCase().includes(q));
  }, [posts, query]);

  const handleCreatePost = (p) => {
    const enriched = {
      ...p,
      author: { id: user?._id || "me", name: user?.name || "You", avatar: user?.avatar || "https://cdn-icons-png.flaticon.com/512/194/194938.png" },
    };
    setPosts((s) => [enriched, ...s]);
  };

  const handleLike = (postId) => {
    setPosts((s) => s.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p)));
  };

  const handleComment = (postId, comment) => {
    setPosts((s) => s.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)));
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar />

      <main className="pt-6 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left / main feed */}
            <section className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Community</h1>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts or members" className="pl-9 pr-3 py-2 rounded-lg border w-full sm:w-64" />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>

                  <button onClick={() => setAiOpen(true)} className="px-3 py-2 bg-sky-500 text-white rounded-lg flex items-center gap-2">
                    <MessageSquare size={16} /> AI
                  </button>
                </div>
              </div>

              <NewPostForm onCreate={handleCreatePost} />

              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-gray-500 text-sm">No posts found.</div>
                ) : (
                  filteredPosts.map((p) => (
                    <PostCard key={p.id} post={p} currentUser={{ name: user?.name || "You", avatar: user?.avatar }} onLike={handleLike} onComment={handleComment} />
                  ))
                )}
              </div>
            </section>

            {/* Right column */}
            <aside className="w-full lg:w-80 space-y-4">
              <div className="bg-white rounded-2xl shadow border border-blue-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users />
                    <div>
                      <div className="text-sm font-semibold">Join the conversation</div>
                      <div className="text-xs text-gray-500">Be kind, be constructive</div>
                    </div>
                  </div>

                  <button className="text-sm px-2 py-1 bg-blue-50 rounded">Rules</button>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Ask questions, share resources, collaborate on projects, and help others learn.
                </div>
              </div>

              <MembersList members={members} />

              <div className="bg-white rounded-2xl shadow border border-blue-100 p-4 text-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Quick Links</div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><Paperclip size={14} /> Course discussions</li>
                  <li className="flex items-center gap-2"><Paperclip size={14} /> Study groups</li>
                  <li className="flex items-center gap-2"><Paperclip size={14} /> Mentorship</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <AIQuickChat open={aiOpen} onClose={() => setAiOpen(false)} onSend={(m) => console.log("AI ask:", m)} />
    </div>
  );
}
