import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, online } = useSocket();
  const [params, setParams] = useSearchParams();
  const [convos, setConvos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messageEndRef = useRef(null);
  const active = params.get('c');

  useEffect(() => {
    api.get('/messages').then(({ data }) => setConvos(data.data.conversations || []));
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    api.get(`/messages/${active}`).then(({ data }) => setMessages(data.data.messages || []));
    socket?.emit('conversation:join', active);
    const onNew = (msg) => {
      if (msg.conversationId === active || String(msg.conversation) === active) {
        setMessages((m) => [...m, msg]);
      }
    };
    socket?.on('message:new', onNew);
    return () => socket?.off('message:new', onNew);
  }, [active, socket]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    socket?.emit('message:send', { conversationId: active, text });
    setText('');
  }

  return (
    <div>
      <h1>Messages</h1>
      <div className="chat-layout">
        <div className="msg-list">
          {convos.map((c) => {
            const other = c.participants.find((p) => p._id !== user?.id && p._id !== user?._id);
            return (
              <button key={c._id} className={`conversation ${active === c._id ? 'active' : ''}`} onClick={() => setParams({ c: c._id })}>
                <span className="conversation-name"><i className={`presence ${online[other?._id] ? 'online' : ''}`} />{other?.name || 'Conversation'}</span>
                <div className="muted">{c.lastMessage}</div>
              </button>
            );
          })}
        </div>
        <div className="message-pane">
          <div className="message-scroll">
            {messages.map((m) => (
              <div key={m._id || m.id} className={`bubble ${String(m.sender) === String(user?.id || user?._id) ? 'me' : 'them'}`}>
                {m.text}
                <div className="muted" style={{ fontSize: 11 }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <form onSubmit={send} className="message-form">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" />
            <button className="btn btn-primary" disabled={!active || !text.trim()}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
