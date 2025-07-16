const admin = require('firebase-admin');
const serviceAccount = require('../couplecode-e645d-firebase-adminsdk-fbsvc-466ce0b787.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

// Notification types
const NOTIFICATION_TYPES = {
  CONNECTION_REQUEST: 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED: 'CONNECTION_ACCEPTED',
  CONNECTION_REJECTED: 'CONNECTION_REJECTED',
  CONNECTION_BLOCKED: 'CONNECTION_BLOCKED',
  CONNECTION_UNBLOCKED: 'CONNECTION_UNBLOCKED'

};

const sendPartnerNotification = async (token, type, payload) => {
  let title, body;
  
  // Customize based on notification type
  switch(type) {
    case NOTIFICATION_TYPES.CONNECTION_REQUEST:
      title = `New Connection Request`;
      body = `${payload.senderNickname} wants to connect with you`;
      break;
    case NOTIFICATION_TYPES.CONNECTION_ACCEPTED:
      title = `Request Accepted`;
      body = `${payload.recipientNickname} accepted your connection request`;
      break;
    case NOTIFICATION_TYPES.CONNECTION_REJECTED:
      title = `Request Rejected`;
      body = `${payload.recipientNickname} rejected your connection request`;
      break;
    case NOTIFICATION_TYPES.CONNECTION_BLOCKED:
      title = `Request Blocked`;
      body = `${payload.recipientNickname} blocked your connection request`;
      break;
      case NOTIFICATION_TYPES.CONNECTION_UNBLOCKED:
        title = `Request UnBocked`;
        body = `${payload.recipientNickname} Unblocked you, You may now send a request again.`;
        break;
    default:
      title = 'New Notification';
      body = 'You have a new notification';
  }

  const message = {
    token,
    notification: { title, body },
    data: {
      type,
      ...payload,
      click_action: 'FLUTTER_NOTIFICATION_CLICK'
    },
    android: { priority: 'high' },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
          sound: 'default'
        }
      }
    }
  };

  try {
    const response = await messaging.send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// New function specifically for connection requests
const sendConnectionNotification = async (senderData, recipientData, type) => {
  if (!recipientData.fcmToken) {
    throw new Error('Recipient FCM token not found');
  }

  const payload = {
    requestId: senderData.requestId,
    senderId: senderData.senderId,
    senderNickname: senderData.senderNickname,
    senderGender: senderData.senderGender,
    recipientId: recipientData.recipientId,
    recipientNickname: recipientData.recipientNickname,
    timestamp: new Date().toISOString()
  };

  return sendPartnerNotification(recipientData.fcmToken, type, payload);
};

module.exports = { 
  sendPartnerNotification,
  sendConnectionNotification,
  NOTIFICATION_TYPES
};