import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, User, Hash, Zap, Shield, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3001');

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_list', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('message');
      socket.off('user_list');
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChat = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', username);
      setIsJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div className="login-screen">
        <div className="bg-glow"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="login-card"
        >
          <h1>Nexus Chat</h1>
          <p>Secure Real-Time Communication</p>
          <form onSubmit={joinChat}>
            <input 
              type="text" 
              placeholder="Enter your handle..." 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <button type="submit" className="join-btn">
              Connect to Node
            </button>
          </form>
        </motion.div>
        
        <style>{`
          .login-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
          }
          .login-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 48px;
            border-radius: 32px;
            text-align: center;
            width: 100%;
            max-width: 400px;
          }
          .login-card h1 {
            font-size: 2.5rem;
            margin-bottom: 8px;
            background: linear-gradient(to right, #00e5ff, #9d00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .login-card p {
            color: #94a3b8;
            margin-bottom: 32px;
          }
          .login-card input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 16px;
            border-radius: 12px;
            color: white;
            margin-bottom: 20px;
            text-align: center;
          }
          .join-btn {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            border: none;
            background: #00e5ff;
            color: black;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          .join-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 229, 255, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="bg-glow"></div>
      
      <div className="chat-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Nexus.</h2>
          </div>
          
          <div className="sidebar-nav">
            <div className="nav-item active"><Hash size={18} /> Public Channel</div>
            <div className="nav-item"><Zap size={18} /> Direct Messages</div>
            <div className="nav-item"><Shield size={18} /> Secure Nodes</div>
          </div>

          <div className="online-status">
            <p className="section-label">Online Users — {users.length}</p>
            <div className="user-list">
              {users.map((u) => (
                <div key={u.id} className="user-item">
                  <div className="user-avatar">
                    <User size={16} />
                  </div>
                  <span>{u.username}</span>
                  <div className="user-status"></div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat */}
        <main className="main-chat">
          <header className="chat-header">
            <div className="header-info">
              <h3># Public Channel</h3>
              <p>Real-time encrypted stream</p>
            </div>
            <div className="header-actions">
              <Menu size={20} />
            </div>
          </header>

          <div className="message-list">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: msg.senderId === socket.id ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`message-item ${msg.senderId === socket.id ? 'message-sent' : 'message-received'}`}
                >
                  <div className="msg-header">
                    <span className="msg-user">{msg.user}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <p className="msg-text">{msg.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>

          <form className="input-area" onSubmit={sendMessage}>
            <div className="input-wrapper">
              <input 
                placeholder="Synchronize a message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <Send size={18} />
              </button>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        .app-shell {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .section-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          margin-bottom: 12px;
          margin-top: 24px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-item.active {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-primary);
        }
        .user-avatar {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .msg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          gap: 12px;
        }
        .msg-user {
          font-weight: 600;
          font-size: 0.85rem;
        }
        .msg-time {
          font-size: 0.7rem;
          opacity: 0.5;
        }
        .msg-text {
          font-size: 0.95rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default App;
