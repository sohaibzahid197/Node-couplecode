const admin = require('firebase-admin');
// const serviceAccount = require('../couplecode-e645d-firebase-adminsdk-fbsvc-6170df22da.json');
const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN_SDK_BASE64, "base64")
  );
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();



const NOTIFICATION_TYPES = {
    CONNECTION_REQUEST: 'CONNECTION_REQUEST',
    CONNECTION_ACCEPTED: 'CONNECTION_ACCEPTED',
    CONNECTION_REJECTED: 'CONNECTION_REJECTED',
    CONNECTION_BLOCKED: 'CONNECTION_BLOCKED',
    CONNECTION_UNBLOCKED: 'CONNECTION_UNBLOCKED',
    
    FREE_PASS_SETUP_REMINDER: 'FREE_PASS_SETUP_REMINDER',
    FREE_PASS_CONFIGURED: 'FREE_PASS_CONFIGURED',
    FREE_PASS_USED: 'FREE_PASS_USED',
    FREE_PASS_EXPIRED: 'FREE_PASS_EXPIRED',
    
    GOING_OUT_REQUEST: 'GOING_OUT_REQUEST',
    PURCHASE_REQUEST: 'PURCHASE_REQUEST',
    
    REQUEST_APPROVED: 'REQUEST_APPROVED',
    REQUEST_REJECTED: 'REQUEST_REJECTED',
    REQUEST_APPROVED_WITH_LIMITATIONS: 'REQUEST_APPROVED_WITH_LIMITATIONS',
    REQUEST_IGNORED: 'REQUEST_IGNORED',
    REQUEST_OVERRIDDEN: 'REQUEST_OVERRIDDEN',
    
    DECISION_CHANGED: 'DECISION_CHANGED',
    
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    PARTNER_CHANGED: 'PARTNER_CHANGED',
    ACCOUNT_DELETED: 'ACCOUNT_DELETED'
  };
const sendPartnerNotification = async (token, type, payload) => {
  let title, body;
  
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
        
        case NOTIFICATION_TYPES.FREE_PASS_SETUP_REMINDER:
            title = `Set Up Free Pass`;
            body = `Please set up your Free Pass configuration with your partner`;
            break;
          case NOTIFICATION_TYPES.FREE_PASS_CONFIGURED:
            title = `Free Pass Configured`;
            body = `${payload.partnerName} has set up Free Pass: ${payload.passCount} passes for ${payload.duration} months`;
            break;
          case NOTIFICATION_TYPES.FREE_PASS_USED:
            title = `Free Pass Used`;
            body = `${payload.partnerName} used a Free Pass for ${payload.requestType} request`;
            break;
          case NOTIFICATION_TYPES.FREE_PASS_EXPIRED:
            title = `Free Pass Expired`;
            body = `Your Free Pass configuration has expired. Please set up a new one.`;
            break;
            
          case NOTIFICATION_TYPES.GOING_OUT_REQUEST:
            title = `New Going Out Request`;
            body = `${payload.partnerName} wants to go out: ${payload.subject} on ${payload.date}`;
            break;
          case NOTIFICATION_TYPES.PURCHASE_REQUEST:
            title = `New Purchase Request`;
            body = `${payload.partnerName} wants to purchase: ${payload.item} for ${payload.price}`;
            break;
            
          case NOTIFICATION_TYPES.REQUEST_APPROVED:
            title = `Request Approved`;
            body = `${payload.partnerName} approved your ${payload.requestType} request`;
            break;
          case NOTIFICATION_TYPES.REQUEST_REJECTED:
            title = `Request Rejected`;
            body = `${payload.partnerName} rejected your ${payload.requestType} request`;
            break;
          case NOTIFICATION_TYPES.REQUEST_APPROVED_WITH_LIMITATIONS:
            title = `Request Approved with Limitations`;
            body = `${payload.partnerName} approved your ${payload.requestType} request with some conditions`;
            break;
          case NOTIFICATION_TYPES.REQUEST_IGNORED:
            title = `Request Ignored`;
            body = `Your ${payload.requestType} request was not responded to before the deadline`;
            break;
          case NOTIFICATION_TYPES.REQUEST_OVERRIDDEN:
            title = `Request Overridden`;
            body = `${payload.partnerName} used a Free Pass to override your decision`;
            break;
            
          // Decision change notifications
          case NOTIFICATION_TYPES.DECISION_CHANGED:
            title = `Decision Changed`;
            body = `${payload.partnerName} changed their decision about your ${payload.requestType} request`;
            break;
            
          // Account notifications
          case NOTIFICATION_TYPES.PASSWORD_CHANGED:
            title = `Password Changed`;
            body = `Your password has been successfully changed`;
            break;
          case NOTIFICATION_TYPES.PARTNER_CHANGED:
            title = `Partner Changed`;
            body = `Your partner connection has been updated`;
            break;
          case NOTIFICATION_TYPES.ACCOUNT_DELETED:
            title = `Account Deleted`;
            body = `Your account has been successfully deleted`;
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