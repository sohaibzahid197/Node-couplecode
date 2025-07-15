const admin = require('firebase-admin');
const serviceAccount = require('../couplecode-e645d-firebase-adminsdk-fbsvc-466ce0b787.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

const sendPartnerNotification = async (token, type, payload) => {
  let title, body;
  
  // Customize based on notification type
  switch(type) {
    case 'JOIN_REQUEST':
      title = `New Partner Request from ${payload.senderName}`;
      body = 'Tap to view the request';
      break;
    case 'REQUEST_APPROVAL':
      title = `Approval Needed: ${payload.requestType}`;
      body = `${payload.senderName} needs your response by ${payload.deadline}`;
      break;
    case 'REQUEST_DECISION':
      title = `Request ${payload.decision}`;
      body = `Your ${payload.requestType} request was ${payload.decision}`;
      break;
    case 'FREE_PASS_USED':
      title = 'Free Pass Used';
      body = `${payload.partnerName} used a Free Pass`;
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
    android: { priority: 'high' }
  };

  return messaging.send(message);
};

module.exports = { sendPartnerNotification };