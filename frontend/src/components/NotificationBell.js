import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Set up socket connection
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      try {
        // Use the base URL without the /api path
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5002').replace('/api', '');
        socketRef.current = io(baseUrl);

        console.log('Socket connection established to:', baseUrl);

        // Join user's room
        socketRef.current.emit('join', userId);

        // Listen for new notifications
        socketRef.current.on('notification', (notification) => {
          console.log('Received notification:', notification);
          // Add new notification to the list
          setNotifications(prev => [notification, ...prev]);
          // Increment unread count
          setUnreadCount(prev => prev + 1);
          // Show notification toast
          showNotificationToast(notification);
        });

        // Listen for connection errors
        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
      } catch (error) {
        console.error('Error setting up socket connection:', error);
      }
      
      return () => {
        // Clean up socket connection
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update notification in the list
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      // Update all notifications in the list
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Delete notification
  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      // Remove notification from the list
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      // Update unread count if needed
      const deletedNotification = notifications.find(notification => notification._id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Show notification toast
  const showNotificationToast = (notification) => {
    // Create a custom toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-header">
        <strong>${notification.title}</strong>
        <button type="button" class="btn-close">&times;</button>
      </div>
      <div class="toast-body">
        ${notification.message}
      </div>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Add close button functionality
    const closeButton = toast.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(toast);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  };
  
  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'review':
        return 'bi-star-fill text-warning';
      case 'order':
        return 'bi-bag-check-fill text-success';
      case 'payment':
        return 'bi-credit-card-fill text-primary';
      case 'delivery':
        return 'bi-truck text-info';
      case 'feedback':
        return 'bi-chat-dots-fill text-secondary';
      case 'product':
        return 'bi-box-seam-fill text-danger';
      default:
        return 'bi-bell-fill text-primary';
    }
  };
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-link nav-link position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="dropdown-menu dropdown-menu-end show p-0" style={{ width: '320px', maxHeight: '400px', overflow: 'hidden' }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-link text-decoration-none"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mb-0 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-3">
                <i className="bi bi-bell-slash fs-4 text-muted"></i>
                <p className="mb-0 mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`dropdown-item p-3 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    setShowDropdown(false);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="avatar bg-light rounded-circle p-2">
                        <i className={`${getNotificationIcon(notification.type)} fs-5`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1">{notification.title}</h6>
                        <button 
                          className="btn btn-sm text-muted p-0 ms-2"
                          onClick={(e) => deleteNotification(notification._id, e)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      <p className="mb-1 text-muted small">{notification.message}</p>
                      <small className="text-muted">{formatTime(notification.createdAt)}</small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-top text-center">
            <Link to="/notifications" className="btn btn-sm btn-link text-decoration-none w-100" onClick={() => setShowDropdown(false)}>
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;