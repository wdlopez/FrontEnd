// src/hooks/useUnreadNotifications.js
import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "./useSocket";
//import getDashboardNotifications from "../services/notifications-service/getDashboardNotifications";

export default function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const mountedRef = useRef(false);

  // 1) Función estable para recargar desde API
  const reloadCount = useCallback(async () => {
    if (!mountedRef.current) return;
    const userId = socket.auth?.userId;
    if (!userId) return;

    try {
      ///const list = await getDashboardNotifications(userId);
      
      if (!mountedRef.current) return;
      //const cnt = list.filter(n => n.notif_status === 0).length;
      //etUnreadCount(cnt);
      // console.log(cnt);
    } catch (err) {
      console.error("Error cargando contador:", err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // console.log(unreadCount)
    // Si ya conocemos userId, hacemos la primera carga
    if (socket.auth?.userId) {
      reloadCount();
    } else {
      // opcional: escuchar 'connect' para recargar tras auth
      const onConnect = () => {
        if (socket.auth?.userId) reloadCount();
      };
      socket.on("connect", onConnect);
      // y lo quitamos luego
      return () => {
        socket.off("connect", onConnect);
        mountedRef.current = false;
      };
    }

    // 2) Listeners de socket
    socket.on("new_notification", reloadCount);
    socket.on("update_notification", payload => {
      if (payload.unreadCount != null) {
        setUnreadCount(payload.unreadCount);
      } else {
        // fallback si no viene count
        reloadCount();
      }
    });

    // 3) Polling cada 30s
    const interval = setInterval(reloadCount, 5_000);

    // cleanup
    return () => {
      mountedRef.current = false;
      socket.off("new_notification", reloadCount);
      socket.off("update_notification", () => {});
      clearInterval(interval);
    };
  }, [reloadCount]);

  return {unreadCount};
}
