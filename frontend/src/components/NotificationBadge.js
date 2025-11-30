import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Box,
  Typography
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBadge = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasNotifications = notifications.length > 0;

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          {hasNotifications ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            mt: 1.5,
            width: 360,
            maxWidth: '100%',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Notifications
            </Typography>
            {hasNotifications && (
              <Button
                startIcon={<DoneAllIcon />}
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ textTransform: 'none', fontWeight: '500' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          {hasNotifications ? (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.read ? 'none' : '3px solid',
                      borderLeftColor: notification.type === 'error' ? 'error.main' : 
                                     notification.type === 'warning' ? 'warning.main' :
                                     notification.type === 'info' ? 'info.main' : 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      {notification.type === 'error' ? (
                        <NotificationsNoneIcon color="error" />
                      ) : notification.type === 'warning' ? (
                        <NotificationsNoneIcon color="warning" />
                      ) : notification.type === 'info' ? (
                        <NotificationsNoneIcon color="info" />
                      ) : (
                        <NotificationsNoneIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="600">
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                    {!notification.read && (
                      <Button
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        startIcon={<CheckIcon />}
                        sx={{ textTransform: 'none', minWidth: 'auto', p: 0 }}
                      >
                        Mark
                      </Button>
                    )}
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsNoneIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll see notifications here when they arrive
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBadge;