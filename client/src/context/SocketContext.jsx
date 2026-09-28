import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState({});

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return undefined;
    }
    const s = io('/', { withCredentials: true });
    s.on('presence', ({ userId, online: isOn }) => {
      setOnline((prev) => ({ ...prev, [userId]: isOn }));
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return <SocketContext.Provider value={{ socket, online }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
