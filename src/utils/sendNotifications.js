import axios from "axios";
export default function sendNotifications(userids, title, message) {
  axios.post(`https://app.nativenotify.com/api/indie/group/notification`, {
    subIDs: userids,
    appId: 25679,
    appToken: "XWq6oWFv6eHddwmOo9m6Mv",
    title: title,
    message: message,
  });
}

export function sendNotification(userid, title, message) {
  axios.post(`https://app.nativenotify.com/api/indie/notification`, {
    subID: userid,
    appId: 25679,
    appToken: "XWq6oWFv6eHddwmOo9m6Mv",
    title: title,
    message: message,
  });
}

export function sendToAll(title, message) {
    axios.post(`https://app.nativenotify.com/api/notification`, {
      appId: 25679,
      appToken: "XWq6oWFv6eHddwmOo9m6Mv",
      title: title,
      body: message,
    });
}