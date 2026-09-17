import { useEffect } from "react";
import { notification } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../utils/socket";

const GlobalNotificationListener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getUserData = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getUserData();
  const myId = String(currentUser?._id || currentUser?.id || "");

  // 1. Mount par browser push permission lena
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Global online status register karna
  useEffect(() => {
    if (myId) {
      socket.emit("user_online", myId);
    }
  }, [myId]);

  // 3. Global socket listener for incoming messages
  useEffect(() => {
    const handleGlobalMessage = (data) => {
      const senderId = String(data.sender?._id || data.sender || "");
      
      // Agar message maine khud bheja hai toh notification na aaye
      if (senderId === myId) return;

      const senderName = data.sender?.name || "New Message";
      const messagePreview =
        data.messageType === "image"
          ? "📷 Sent an image"
          : data.messageType === "pdf"
          ? "📄 Sent a PDF document"
          : data.messageType === "audio"
          ? "🎤 Sent a voice note"
          : data.text || data.message || "Sent an attachment";

      // Check karo kya user pehle se chat page par mojood hai?
      const isCurrentlyOnChatPage = location.pathname.includes("/dashboard/student-chat");

      // Sound play
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(() => {});
      } catch (err) {
        console.error("Audio play error:", err);
      }

      // In-App Ant Design Toast (Agar user kisi doosre page par ho)
      if (!isCurrentlyOnChatPage) {
        notification.open({
          message: senderName,
          description: messagePreview,
          icon: <MessageOutlined style={{ color: "#6366f1" }} />,
          placement: "topRight",
          duration: 4,
          onClick: () => {
            navigate("/dashboard/student-chat");
          },
          style: { cursor: "pointer", borderRadius: "10px" },
        });
      }

      // Browser OS Level Notification (Agar browser minimize ho ya tab background mein ho)
      if ("Notification" in window && Notification.permission === "granted") {
        if (document.hidden) {
          const notif = new Notification(senderName, {
            body: messagePreview,
            icon: data.sender?.avatar || "/favicon.ico",
          });

          notif.onclick = () => {
            window.focus();
            navigate("/dashboard/student-chat");
            notif.close();
          };
        }
      }
    };

    socket.on("receive_message", handleGlobalMessage);

    return () => {
      socket.off("receive_message", handleGlobalMessage);
    };
  }, [myId, location.pathname, navigate]);

  return null; // Yeh background worker component hai, screen par direct render nahi hota
};

export default GlobalNotificationListener;