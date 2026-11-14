import axiosClient from "./axiosClient";

export const getNotifications = () => axiosClient.get("/notifications");

export const getUnreadCount = () => axiosClient.get("/notifications/unread-count");

export const markRead = (id) => axiosClient.patch(`/notifications/${id}/read`);

export const markAllRead = () => axiosClient.patch("/notifications/read-all");