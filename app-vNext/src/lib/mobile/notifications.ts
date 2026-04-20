export type NotificationPermissionState = "unsupported" | NotificationPermission;

export function getNotificationPermission(): NotificationPermissionState {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported" as const;
  return Notification.requestPermission();
}

export function sendTestNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  new Notification("EasyLife reminders are ready", {
    body: "You can now use EasyLife notification settings.",
    icon: "/icons/easylife-icon-192.png",
    badge: "/icons/easylife-icon-192.png",
  });

  return true;
}
