import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      // Update all notifications in the list
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      // Remove notification from the list
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await api.delete('/notifications');
      // Clear notifications list
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
    <div className="container mt-4 mb-5">
      <Meta title="Notifications | Smart Agri System" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notifications</h2>
        <div>
          {notifications.length > 0 && (
            <>
              <button 
                className="btn btn-outline-primary me-2"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={deleteAllNotifications}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bell-slash fs-1 text-muted"></i>
          <h4 className="mt-3">No Notifications</h4>
          <p className="text-muted">You don't have any notifications yet.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="list-group list-group-flush">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`list-group-item list-group-item-action ${!notification.isRead ? 'bg-light' : ''}`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification._id);
                  }
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
                style={{ cursor: notification.actionUrl ? 'pointer' : 'default' }}
              >
                <div className="d-flex">
                  <div className="me-3">
                    <div className="avatar bg-light rounded-circle p-3">
                      <i className={`${getNotificationIcon(notification.type)} fs-4`}></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="mb-1">{notification.title}</h5>
                      <div>
                        <small className="text-muted me-3">{formatTime(notification.createdAt)}</small>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <p className="mb-1">{notification.message}</p>
                    {notification.actionUrl && (
                      <small className="text-primary">
                        <i className="bi bi-arrow-right me-1"></i>
                        Click to view details
                      </small>
                    )}
                    {!notification.isRead && (
                      <span className="badge bg-primary ms-2">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;