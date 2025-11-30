const sendNotification = (io, room, notificationData) => {
  const notification = {
    id: notificationData.id || Date.now().toString(),
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type || 'info', // 'info', 'success', 'warning', 'error'
    timestamp: notificationData.timestamp || new Date(),
    read: false,
    ...notificationData
  };

  // Emit to specific room
  io.to(room).emit('newNotification', notification);
  
  return notification;
};

const sendUserNotification = (io, userId, notificationData) => {
  // Emit to specific user
  io.to(userId).emit('newNotification', {
    id: notificationData.id || Date.now().toString(),
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type || 'info',
    timestamp: notificationData.timestamp || new Date(),
    read: false,
    ...notificationData
  });
};

const sendRoleBasedNotification = (io, role, notificationData) => {
  const room = `${role}_notifications`;
  return sendNotification(io, room, notificationData);
};

module.exports = {
  sendNotification,
  sendUserNotification,
  sendRoleBasedNotification
};