import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import getDashboardNotifications from "../services/notifications-service/getDashboardNotifications";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3011";

export default function useNotificationsSocket(
  userId,
  onNewNotification = () => { },
  onUnreadCountChange = () => { }
) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const lastUpdateTime = useRef(Date.now());
  const onNewRef = useRef(onNewNotification);
  const onCountRef = useRef(onUnreadCountChange);

  // Mantener siempre la última versión de los callbacks
  useEffect(() => { onNewRef.current = onNewNotification; }, [onNewNotification]);
  useEffect(() => { onCountRef.current = onUnreadCountChange; }, [onUnreadCountChange]);

  // Función estable para recargar todo
  const reloadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await getDashboardNotifications(userId);
      setNotifications(list);
      const cnt = list.filter(n => n.notif_status === 0).length;
      setUnreadCount(cnt);
      onCountRef.current(cnt);
      lastUpdateTime.current = Date.now();
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // carga inicial
    reloadNotifications();

    // desconectar viejo socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // conectar nuevo
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      upgrade: false,
      auth: { userId }
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", userId);
      reloadNotifications();
    });

    socket.on("new_notification", payload => {
      onNewRef.current(payload);
      reloadNotifications();
    });

    socket.on("update_notification", ({ unreadCount: cnt, timestamp }) => {
      if (timestamp > lastUpdateTime.current) {
        setUnreadCount(cnt);
        onCountRef.current(cnt);
        lastUpdateTime.current = timestamp;
        reloadNotifications();
      }
    });

    // cada 2.5 s forzamos recarga
    const polling = setInterval(() => {
      reloadNotifications();
    }, 2500);

    return () => {
      clearInterval(polling);
      socket.off("connect");
      socket.off("new_notification");
      socket.off("update_notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, reloadNotifications]);

  return { notifications, unreadCount, reloadNotifications };

}
