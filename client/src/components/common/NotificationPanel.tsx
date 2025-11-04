import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook provides user info

interface Notification {
  id: string;
  message: string;
  rfqId?: string;
  bidId?: string;
  type: 'newBid' | 'bidAccepted' | 'bidRejected';
  read: boolean;
  timestamp: Date;
}

const NotificationPanel: React.FC = () => {
  const { user } = useAuth(); // Get current user from auth context
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const socket = useRef<any>(null);

  useEffect(() => {
    if (user && user._id) {
      // Connect to Socket.io server
      socket.current = io('http://localhost:5000', {
        query: { userId: user._id }, // Pass user ID for server-side filtering/room joining
      });

      socket.current.on('connect', () => {
        console.log('Connected to Socket.io server');
        // Join a room specific to the user's ID
        socket.current.emit('joinRoom', user._id);
      });

      socket.current.on('newBid', (data: any) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: data.message,
          rfqId: data.rfqId,
          bidId: data.bidId,
          type: 'newBid',
          read: false,
          timestamp: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setSnackbarMessage(data.message);
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      });

      socket.current.on('bidAccepted', (data: any) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: data.message,
          rfqId: data.rfqId,
          bidId: data.bidId,
          type: 'bidAccepted',
          read: false,
          timestamp: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setSnackbarMessage(data.message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      });

      socket.current.on('bidRejected', (data: any) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: data.message,
          rfqId: data.rfqId,
          bidId: data.bidId,
          type: 'bidRejected',
          read: false,
          timestamp: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setSnackbarMessage(data.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });

      socket.current.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    // TODO: Navigate to RFQ/Bid details page based on notification.rfqId/bidId
    handleMenuClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 300,
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: '8px',
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        <List dense>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No new notifications" />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  bgcolor: notification.read ? 'background.paper' : 'action.hover',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                  primaryTypographyProps={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationPanel;
