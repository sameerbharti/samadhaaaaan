import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Initialize socket connection when user logs in
  const initializeSocket = useCallback((token, role) => {
    // If there's an existing socket, disconnect it first
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection with better configuration
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      // Configure socket options to prevent frequent disconnections
      transports: ['websocket'], // Prefer only websocket for better stability
      timeout: 20000, // 20 seconds timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5, // Reduce reconnection conflicts
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Join room based on user role
      if (role) {
        newSocket.emit('join', role);
      }
      // Join user-specific room if available
      if (token) {
        // The server will automatically join the user to their specific room after authentication
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server, reason:', reason);
    });

    // Listen for new notifications
    newSocket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);
    setUserRole(role);
  }, []); // Remove [socket] from dependency array to avoid circular reconnections

  // Disconnect socket when component unmounts
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Function to add a notification manually (for testing or local notifications)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Function to remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Function to mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Function to mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => 
        ({ ...notification, read: true })
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        initializeSocket,
        socket,
        userRole
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};