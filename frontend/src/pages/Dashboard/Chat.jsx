// import { useEffect, useState, useRef } from "react";
// import {
//   Input,
//   Button,
//   message,
//   Spin,
//   Avatar,
//   Tooltip,
//   Image,
//   Dropdown,
//   Modal,
//   Popconfirm,
//   Tag,
// } from "antd";
// import {
//   SendOutlined,
//   SearchOutlined,
//   UserOutlined,
//   PaperClipOutlined,
//   AudioOutlined,
//   ArrowLeftOutlined,
//   FilePdfOutlined,
//   DownloadOutlined,
//   CopyOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   MoreOutlined,
//   ClearOutlined,
//   CalendarOutlined,
//   BookOutlined,
//   MailOutlined,
//   DeleteFilled,
//   PlayCircleOutlined,
//   PauseCircleOutlined,
//   IdcardOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { socket } from "../../utils/socket";
// import { useTheme } from "../../context/ThemeContext";

// const BACKEND_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://class-notes-with-chat-production.up.railway.app";
// const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

// // Voice Note Bubble component
// const VoiceNoteBubble = ({ audioUrl, isMe, isDarkMode }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const audioRef = useRef(null);

//   const togglePlay = () => {
//     if (!audioRef.current) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "8px",
//         padding: "4px 0",
//         minWidth: "150px",
//         maxWidth: "100%",
//       }}
//     >
//       <audio
//         ref={audioRef}
//         src={audioUrl}
//         onEnded={() => setIsPlaying(false)}
//         style={{ display: "none" }}
//       />
//       <Button
//         shape="circle"
//         size="small"
//         onClick={togglePlay}
//         style={{
//           background: isMe ? "#ffffff" : "#6366f1",
//           borderColor: isMe ? "#ffffff" : "#6366f1",
//           color: isMe ? "#6366f1" : "#ffffff",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexShrink: 0,
//         }}
//       >
//         {isPlaying ? "⏸" : "▶"}
//       </Button>

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           alignItems: "center",
//           gap: "2px",
//           overflow: "hidden",
//         }}
//       >
//         {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65, 35].map((h, i) => (
//           <span
//             key={i}
//             style={{
//               width: "2.5px",
//               height: `${h * 0.22}px`,
//               borderRadius: "2px",
//               background: isMe
//                 ? "rgba(255,255,255,0.75)"
//                 : isDarkMode
//                   ? "#818cf8"
//                   : "#6366f1",
//             }}
//           />
//         ))}
//       </div>
//       <span
//         style={{
//           fontSize: "10px",
//           opacity: 0.85,
//           fontWeight: 500,
//           flexShrink: 0,
//         }}
//       >
//         Voice
//       </span>
//     </div>
//   );
// };

// const Chat = () => {
//   const [chats, setChats] = useState([]);
//   const [activeChat, setActiveChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [messagesLoading, setMessagesLoading] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
//   const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
//   const [previewPdfTitle, setPreviewPdfTitle] = useState("");

//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

//   // Voice Recording States
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
//   const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
//   const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
//   const previewAudioRef = useRef(null);

//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const { isDarkMode } = useTheme();
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const token = localStorage.getItem("token");

//   const getUserData = () => {
//     try {
//       const userStr = localStorage.getItem("user");
//       return userStr ? JSON.parse(userStr) : null;
//     } catch {
//       return null;
//     }
//   };
//   const currentUser = getUserData();
//   const myId = String(currentUser?._id || currentUser?.id || "");

//   const activeChatRef = useRef(activeChat);
//   useEffect(() => {
//     activeChatRef.current = activeChat;
//   }, [activeChat]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (myId) socket.emit("user_online", myId);

//     socket.on("get_online_users", (users) => {
//       setOnlineUsers(users.map((u) => String(u)));
//     });

//     return () => {
//       socket.off("get_online_users");
//     };
//   }, [myId]);

//   useEffect(() => {
//     fetchMyChats();
//   }, []);

//   const fetchMyChats = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${BACKEND_URL}/api/chats/my-chats`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.data.success) setChats(res.data.chats);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // WhatsApp style delete/hide chat room handler
//   const handleDeleteChatRoom = async (e, roomId) => {
//     e.stopPropagation();
//     try {
//       const res = await axios.delete(
//         `${BACKEND_URL}/api/chats/room/${roomId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.data.success) {
//         message.success("Chat deleted for you");
//         setChats((prev) => prev.filter((c) => c._id !== roomId));
//         if (activeChat?._id === roomId) {
//           setActiveChat(null);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to delete chat");
//     }
//   };

//   useEffect(() => {
//     const handleReceiveMessage = (data) => {
//       const currentOpenChat = activeChatRef.current;
//       const incomingRoomId = String(data.chatRoom?._id || data.chatRoom);
//       const senderId = String(data.sender?._id || data.sender);

//       if (currentOpenChat && String(currentOpenChat._id) === incomingRoomId) {
//         setMessages((prev) =>
//           prev.some((m) => m._id === data._id) ? prev : [...prev, data],
//         );
//       }

//       setChats((prevChats) => {
//         const chatIndex = prevChats.findIndex(
//           (c) => String(c._id) === incomingRoomId,
//         );
//         const lastPreview =
//           data.messageType === "image"
//             ? "📷 Photo"
//             : data.messageType === "pdf"
//               ? "📄 PDF Document"
//               : data.messageType === "audio"
//                 ? "🎤 Voice Note"
//                 : data.text || data.message;

//         if (chatIndex !== -1) {
//           const updatedChat = { ...prevChats[chatIndex] };
//           updatedChat.lastMessage = lastPreview;
//           updatedChat.lastMessageTime =
//             data.createdAt || new Date().toISOString();

//           if (
//             !currentOpenChat ||
//             String(currentOpenChat._id) !== incomingRoomId
//           ) {
//             if (senderId !== myId) {
//               updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
//             }
//           }

//           const otherChats = prevChats.filter(
//             (c) => String(c._id) !== incomingRoomId,
//           );
//           return [updatedChat, ...otherChats];
//         } else {
//           // Agar chat list mein nahi thi (hidden thi), toh naya message aane par dobara fetch kar lo
//           fetchMyChats();
//         }
//         return prevChats;
//       });
//     };

//     const handleDeletedMessage = (deletedId) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           String(m._id) === String(deletedId)
//             ? {
//                 ...m,
//                 isDeleted: true,
//                 text: "This message was deleted",
//                 fileUrl: "",
//                 reactions: [],
//               }
//             : m,
//         ),
//       );
//       fetchMyChats();
//     };

//     const handleMessageReacted = ({ messageId, reactions }) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           String(msg._id) === String(messageId) ? { ...msg, reactions } : msg,
//         ),
//       );
//     };

//     const handleChatCleared = (clearedRoomId) => {
//       if (
//         activeChatRef.current &&
//         String(activeChatRef.current._id) === String(clearedRoomId)
//       ) {
//         setMessages([]);
//       }
//       fetchMyChats();
//     };

//     socket.on("receive_message", handleReceiveMessage);
//     socket.on("message_deleted", handleDeletedMessage);
//     socket.on("message_reacted", handleMessageReacted);
//     socket.on("chat_cleared", handleChatCleared);

//     return () => {
//       socket.off("receive_message", handleReceiveMessage);
//       socket.off("message_deleted", handleDeletedMessage);
//       socket.off("message_reacted", handleMessageReacted);
//       socket.off("chat_cleared", handleChatCleared);
//     };
//   }, [myId]);

//   useEffect(() => {
//     if (!activeChat) return;

//     const fetchMessages = async () => {
//       try {
//         setMessagesLoading(true);
//         const res = await axios.get(
//           `${BACKEND_URL}/api/chats/messages/${activeChat._id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         if (res.data.success) {
//           setMessages(res.data.messages);
//           setChats((prev) =>
//             prev.map((c) =>
//               String(c._id) === String(activeChat._id)
//                 ? { ...c, unreadCount: 0 }
//                 : c,
//             ),
//           );
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setMessagesLoading(false);
//       }
//     };

//     fetchMessages();
//     socket.emit("join_room", activeChat._id);
//   }, [activeChat, token]);

//   const handleSearch = async (query) => {
//     setSearchQuery(query);
//     if (!query.trim()) {
//       setSearchResults([]);
//       return;
//     }
//     try {
//       const res = await axios.get(
//         `${BACKEND_URL}/api/chats/search?query=${query}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.data.success) {
//         const uniqueUsers = res.data.users.filter(
//           (v, i, a) =>
//             a.findIndex((t) => String(t._id) === String(v._id)) === i,
//         );
//         setSearchResults(uniqueUsers);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSelectUser = async (recipientId) => {
//     try {
//       const res = await axios.post(
//         `${BACKEND_URL}/api/chats/direct`,
//         { recipientId },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.data.success) {
//         setActiveChat(res.data.chatRoom);
//         setSearchResults([]);
//         setSearchQuery("");
//         fetchMyChats();
//       }
//     } catch {
//       message.error("Failed to open chat");
//     }
//   };

//   const handleSendMessage = (e, customPayload = null) => {
//     if (e) e.preventDefault();

//     const payload = customPayload || {
//       chatRoomId: activeChat._id,
//       message: inputText,
//       senderId: myId,
//       messageType: "text",
//     };

//     if (!payload.message && !payload.fileUrl) return;

//     socket.emit("send_message", payload);
//     if (!customPayload) setInputText("");
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !activeChat) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       message.loading({ content: "Uploading file...", key: "upload" });
//       const res = await axios.post(
//         `${BACKEND_URL}/api/chats/upload`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );

//       if (res.data.success) {
//         const fileUrl = res.data.url;
//         const isImage =
//           file.type.startsWith("image/") ||
//           /\.(jpeg|jpg|png|gif|webp)$/i.test(file.name);
//         const isPdf =
//           file.type === "application/pdf" || /\.pdf$/i.test(file.name);

//         handleSendMessage(null, {
//           chatRoomId: activeChat._id,
//           message: file.name,
//           fileUrl: fileUrl,
//           senderId: myId,
//           messageType: isImage ? "image" : isPdf ? "pdf" : "file",
//         });

//         message.success({ content: "Sent successfully!", key: "upload" });
//       }
//     } catch {
//       message.error({ content: "Upload failed", key: "upload" });
//     }
//   };

//   const handleDeleteMsg = async (msgId) => {
//     try {
//       const res = await axios.delete(
//         `${BACKEND_URL}/api/chats/messages/${msgId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.data.success) {
//         socket.emit("delete_message", {
//           chatRoomId: activeChat._id,
//           messageId: msgId,
//         });
//         message.success("Message deleted");
//       }
//     } catch (err) {
//       message.error(err.response?.data?.message || "Failed to delete message");
//     }
//   };

//   const handleClearChat = async () => {
//     try {
//       const res = await axios.delete(
//         `${BACKEND_URL}/api/chats/clear/${activeChat._id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.data.success) {
//         socket.emit("clear_chat", activeChat._id);
//         setMessages([]);
//         message.success("Chat cleared");
//       }
//     } catch {
//       message.error("Failed to clear chat");
//     }
//   };

//   const handleSelectReaction = (msgId, emoji) => {
//     socket.emit("react_message", {
//       chatRoomId: activeChat._id,
//       messageId: msgId,
//       emoji,
//       userId: myId,
//     });
//     setActiveReactionMsgId(null);
//   };

//   const startRecording = async () => {
//     audioChunksRef.current = [];
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) audioChunksRef.current.push(event.data);
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: "audio/webm",
//         });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setRecordedAudioBlob(audioBlob);
//         setRecordedAudioUrl(audioUrl);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//       message.info("Recording started... Click mic again to stop.");
//     } catch {
//       message.error("Microphone access denied.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const cancelRecording = () => {
//     setRecordedAudioBlob(null);
//     setRecordedAudioUrl(null);
//     setIsPreviewPlaying(false);
//   };

//   const sendRecordedAudio = async () => {
//     if (!recordedAudioBlob || !activeChat) return;

//     const formData = new FormData();
//     formData.append("file", recordedAudioBlob, "voice-note.webm");

//     try {
//       message.loading({ content: "Sending voice note...", key: "voice" });
//       const res = await axios.post(
//         `${BACKEND_URL}/api/chats/upload`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );
//       if (res.data.success) {
//         handleSendMessage(null, {
//           chatRoomId: activeChat._id,
//           message: "Voice Message",
//           fileUrl: res.data.url,
//           senderId: myId,
//           messageType: "audio",
//         });
//         message.success({ content: "Voice note sent!", key: "voice" });
//         cancelRecording();
//       }
//     } catch {
//       message.error({ content: "Voice upload failed", key: "voice" });
//     }
//   };

//   const renderAvatar = (userObj, size = "default", showDot = false) => {
//     const avatarSrc =
//       userObj?.avatar || userObj?.avatarUrl || userObj?.profilePic || "";
//     const userId = String(userObj?._id || userObj?.id || "");
//     const isOnline = onlineUsers.includes(userId);

//     return (
//       <div
//         style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
//       >
//         <Avatar
//           size={size}
//           src={avatarSrc || undefined}
//           icon={!avatarSrc && <UserOutlined />}
//           style={{ backgroundColor: "#6366f1", objectFit: "cover" }}
//         />
//         {showDot && isOnline && (
//           <span
//             style={{
//               position: "absolute",
//               bottom: 0,
//               right: 0,
//               width: "10px",
//               height: "10px",
//               backgroundColor: "#10b981",
//               borderRadius: "50%",
//               border: "2px solid #ffffff",
//             }}
//           />
//         )}
//       </div>
//     );
//   };

//   const otherParticipant = activeChat?.participants?.find(
//     (p) => String(p._id) !== myId,
//   );
//   const isUserOnline = otherParticipant
//     ? onlineUsers.includes(String(otherParticipant._id))
//     : false;

//   const otherUserAvatar =
//     otherParticipant?.avatar ||
//     otherParticipant?.avatarUrl ||
//     otherParticipant?.profilePic ||
//     "";

//   return (
//     <div
//       onClick={() => setActiveReactionMsgId(null)}
//       style={{
//         display: "flex",
//         height:
//           window.innerWidth < 1024
//             ? "calc(100dvh - 145px)"
//             : "calc(100vh - 100px)",
//         width: "100%",
//         maxWidth: "100%",
//         background: isDarkMode ? "#080816" : "#f8fafc",
//         borderRadius: "16px",
//         overflow: "hidden",
//         border: isDarkMode ? "1px solid #1e2652" : "1px solid #e2e8f0",
//         boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
//         boxSizing: "border-box",
//         marginBottom: window.innerWidth < 1024 ? "68px" : "0px",
//       }}
//     >
//       {/* Sidebar: Chats List */}
//       <div
//         style={{
//           width:
//             window.innerWidth < 1024 ? (activeChat ? "0%" : "100%") : "340px",
//           minWidth:
//             window.innerWidth < 1024 ? (activeChat ? "0%" : "100%") : "340px",
//           maxWidth: window.innerWidth < 1024 ? "100%" : "360px",
//           borderRight: isDarkMode ? "1px solid #1e2652" : "1px solid #e2e8f0",
//           display: window.innerWidth < 1024 && activeChat ? "none" : "flex",
//           flexDirection: "column",
//           background: isDarkMode ? "#0d1026" : "#ffffff",
//           transition: "all 0.3s ease",
//           boxSizing: "border-box",
//         }}
//       >
//         <div
//           style={{
//             padding: "16px",
//             borderBottom: isDarkMode
//               ? "1px solid #1e2652"
//               : "1px solid #f1f5f9",
//           }}
//         >
//           <Input
//             placeholder="Search user by name, email or AG number..."
//             prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
//             value={searchQuery}
//             onChange={(e) => handleSearch(e.target.value)}
//             style={{
//               borderRadius: "8px",
//               background: isDarkMode ? "#121838" : "#f8fafc",
//               color: isDarkMode ? "#fff" : "#000",
//             }}
//           />
//         </div>

//         {searchResults.length > 0 && (
//           <div
//             style={{
//               background: isDarkMode ? "#121838" : "#f1f5f9",
//               padding: "8px",
//               borderBottom: "1px solid #1e2652",
//             }}
//           >
//             {searchResults.map((user) => (
//               <div
//                 key={user._id}
//                 onClick={() => handleSelectUser(user._id)}
//                 style={{
//                   padding: "10px 12px",
//                   cursor: "pointer",
//                   borderRadius: "8px",
//                   color: isDarkMode ? "#fff" : "#000",
//                   marginBottom: "4px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 {renderAvatar(user, "default", true)}
//                 <div style={{ overflow: "hidden" }}>
//                   <div
//                     style={{
//                       fontWeight: 600,
//                       fontSize: "14px",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                     }}
//                   >
//                     {user.name}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "#818cf8",
//                       fontWeight: 500,
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                     }}
//                   >
//                     {user.agNumber
//                       ? `${user.agNumber} • ${user.email}`
//                       : user.email}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
//           {loading ? (
//             <div style={{ textAlign: "center", padding: "20px" }}>
//               <Spin />
//             </div>
//           ) : chats.length === 0 ? (
//             <p
//               style={{
//                 textAlign: "center",
//                 color: "#94a3b8",
//                 marginTop: "30px",
//                 fontSize: "13px",
//               }}
//             >
//               No conversations yet
//             </p>
//           ) : (
//             chats.map((chat) => {
//               const chatOtherUser = chat.participants?.find(
//                 (p) => String(p._id) !== myId,
//               );
//               const displayName =
//                 chat.type === "group"
//                   ? chat.name
//                   : chatOtherUser?.name || "Direct Chat";
//               const isSelected = activeChat?._id === chat._id;

//               return (
//                 <div
//                   key={chat._id}
//                   onClick={() => setActiveChat(chat)}
//                   style={{
//                     padding: "12px 14px",
//                     borderRadius: "12px",
//                     cursor: "pointer",
//                     background: isSelected
//                       ? isDarkMode
//                         ? "#1e2652"
//                         : "#e0e7ff"
//                       : "transparent",
//                     marginBottom: "8px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: "12px",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "12px",
//                       overflow: "hidden",
//                       flex: 1,
//                     }}
//                   >
//                     {renderAvatar(chatOtherUser, 40, true)}
//                     <div style={{ overflow: "hidden", flex: 1 }}>
//                       <h4
//                         style={{
//                           margin: 0,
//                           color: isDarkMode ? "#fff" : "#0f172a",
//                           fontSize: "14px",
//                           fontWeight: 600,
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                         }}
//                       >
//                         {displayName}
//                       </h4>
//                       <span
//                         style={{
//                           fontSize: "12px",
//                           color: "#94a3b8",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           display: "block",
//                         }}
//                       >
//                         {chat.lastMessage ||
//                           (chat.type === "group"
//                             ? "Group Chat"
//                             : chatOtherUser?.agNumber || chatOtherUser?.email)}
//                       </span>
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "8px",
//                       flexShrink: 0,
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "flex-end",
//                         gap: "4px",
//                       }}
//                     >
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           color: isSelected
//                             ? isDarkMode
//                               ? "#cbd5e1"
//                               : "#4338ca"
//                             : "#94a3b8",
//                         }}
//                       >
//                         {new Date(
//                           chat.lastMessageTime || Date.now(), // 👈 Yahan Date.now() karna hai
//                         ).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </span>
//                       {chat.unreadCount > 0 && (
//                         <span
//                           style={{
//                             background: "#10b981",
//                             color: "#fff",
//                             fontSize: "10px",
//                             fontWeight: 700,
//                             padding: "1px 6px",
//                             borderRadius: "10px",
//                             minWidth: "18px",
//                             textAlign: "center",
//                           }}
//                         >
//                           {chat.unreadCount}
//                         </span>
//                       )}
//                     </div>

//                     {/* 👇 WhatsApp Style 3-Dots Dropdown Menu for Deleting Chat */}
//                     <Dropdown
//                       menu={{
//                         items: [
//                           {
//                             key: "delete",
//                             label: (
//                               <Popconfirm
//                                 title="Delete Chat"
//                                 description="Delete this conversation for you?"
//                                 onConfirm={(e) =>
//                                   handleDeleteChatRoom(e, chat._id)
//                                 }
//                                 okText="Yes"
//                                 cancelText="No"
//                                 okButtonProps={{ danger: true }}
//                               >
//                                 <span
//                                   onClick={(e) => e.stopPropagation()}
//                                   style={{
//                                     color: "#ef4444",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: "6px",
//                                   }}
//                                 >
//                                   <DeleteOutlined /> Delete Chat
//                                 </span>
//                               </Popconfirm>
//                             ),
//                           },
//                         ],
//                       }}
//                       trigger={["click"]}
//                     >
//                       <Button
//                         type="text"
//                         shape="circle"
//                         size="small"
//                         icon={
//                           <MoreOutlined
//                             style={{
//                               fontSize: "16px",
//                               color: isDarkMode ? "#94a3b8" : "#64748b",
//                             }}
//                           />
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </Dropdown>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* Right Chat Window */}
//       <div
//         style={{
//           flex: 1,
//           width: "100%",
//           maxWidth: "100%",
//           display: window.innerWidth < 1024 && !activeChat ? "none" : "flex",
//           flexDirection: "column",
//           background: isDarkMode ? "#050714" : "#f8fafc",
//           overflow: "hidden",
//           boxSizing: "border-box",
//         }}
//       >
//         {activeChat ? (
//           <>
//             {/* Header */}
//             <div
//               style={{
//                 padding: "12px 16px",
//                 borderBottom: isDarkMode
//                   ? "1px solid #1e2652"
//                   : "1px solid #e2e8f0",
//                 background: isDarkMode ? "#0d1026" : "#ffffff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 flexShrink: 0,
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                   overflow: "hidden",
//                 }}
//               >
//                 <Button
//                   type="text"
//                   icon={<ArrowLeftOutlined />}
//                   className="d-md-none"
//                   onClick={() => setActiveChat(null)}
//                   style={{
//                     color: isDarkMode ? "#fff" : "#000",
//                     padding: "0 6px 0 0",
//                   }}
//                 />

//                 <div
//                   onClick={() => setIsProfileModalOpen(true)}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     cursor: "pointer",
//                     borderRadius: "8px",
//                     padding: "2px 4px",
//                     transition: "background 0.2s",
//                   }}
//                   title="Click to view student profile"
//                 >
//                   {renderAvatar(otherParticipant, 38, true)}
//                   <div style={{ overflow: "hidden" }}>
//                     <h3
//                       style={{
//                         margin: 0,
//                         color: isDarkMode ? "#fff" : "#0f172a",
//                         fontSize: "15px",
//                         fontWeight: 600,
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                       }}
//                     >
//                       {activeChat.type === "group"
//                         ? activeChat.name
//                         : otherParticipant?.name || "Chat"}
//                     </h3>
//                     <span
//                       style={{
//                         fontSize: "11px",
//                         color: isUserOnline ? "#10b981" : "#94a3b8",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "4px",
//                       }}
//                     >
//                       ● {isUserOnline ? "Online" : "Offline"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Chat Actions Dropdown */}
//               <Dropdown
//                 menu={{
//                   items: [
//                     {
//                       key: "profile",
//                       label: (
//                         <span
//                           onClick={() => setIsProfileModalOpen(true)}
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 6,
//                           }}
//                         >
//                           <UserOutlined /> View Profile
//                         </span>
//                       ),
//                     },
//                     {
//                       key: "clear",
//                       label: (
//                         <Popconfirm
//                           title="Clear chat?"
//                           description="Delete all messages?"
//                           onConfirm={handleClearChat}
//                           okText="Yes"
//                           cancelText="No"
//                         >
//                           <span
//                             style={{
//                               color: "#ef4444",
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 6,
//                             }}
//                           >
//                             <ClearOutlined /> Clear Chat
//                           </span>
//                         </Popconfirm>
//                       ),
//                     },
//                   ],
//                 }}
//                 trigger={["click"]}
//               >
//                 <Button
//                   type="text"
//                   shape="circle"
//                   icon={
//                     <MoreOutlined
//                       style={{
//                         fontSize: 18,
//                         color: isDarkMode ? "#fff" : "#000",
//                       }}
//                     />
//                   }
//                 />
//               </Dropdown>
//             </div>

//             {/* Messages Area */}
//             <div
//               style={{
//                 flex: 1,
//                 padding: "16px 12px",
//                 overflowY: "auto",
//                 overflowX: "hidden",
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "12px",
//                 width: "100%",
//                 boxSizing: "border-box",
//               }}
//             >
//               {messagesLoading ? (
//                 <div style={{ textAlign: "center", marginTop: "50px" }}>
//                   <Spin />
//                 </div>
//               ) : messages.length === 0 ? (
//                 <div
//                   style={{
//                     textAlign: "center",
//                     color: "#94a3b8",
//                     marginTop: "50px",
//                     fontSize: "13px",
//                   }}
//                 >
//                   No messages here yet. Say hello! 👋
//                 </div>
//               ) : (
//                 messages.map((msg, idx) => {
//                   const rawSender = msg.sender?._id || msg.sender;
//                   const senderId = String(rawSender || "");
//                   const isMe = senderId === myId;
//                   const isDeleted = msg.isDeleted;

//                   const isImage =
//                     msg.messageType === "image" ||
//                     (msg.fileUrl &&
//                       /\.(jpeg|jpg|png|gif|webp)$/i.test(msg.fileUrl));
//                   const isPdf =
//                     msg.messageType === "pdf" ||
//                     msg.messageType === "file" ||
//                     (msg.fileUrl && /\.pdf$/i.test(msg.fileUrl));
//                   const isAudio =
//                     msg.messageType === "audio" ||
//                     (msg.fileUrl && /\.(webm|mp3|wav)$/i.test(msg.fileUrl));

//                   const contextItems = !isDeleted
//                     ? [
//                         {
//                           key: "copy",
//                           label: "Copy Text",
//                           icon: <CopyOutlined />,
//                           onClick: () => {
//                             navigator.clipboard.writeText(
//                               msg.text || msg.fileUrl || "",
//                             );
//                             message.success("Copied to clipboard");
//                           },
//                         },
//                         ...(isMe
//                           ? [
//                               {
//                                 key: "delete",
//                                 label: "Delete Message",
//                                 icon: (
//                                   <DeleteOutlined
//                                     style={{ color: "#ef4444" }}
//                                   />
//                                 ),
//                                 danger: true,
//                                 onClick: () => handleDeleteMsg(msg._id),
//                               },
//                             ]
//                           : []),
//                       ]
//                     : [];

//                   return (
//                     <div
//                       key={idx}
//                       style={{
//                         position: "relative",
//                         alignSelf: isMe ? "flex-end" : "flex-start",
//                         maxWidth: window.innerWidth < 1024 ? "85%" : "65%",
//                         marginBottom:
//                           msg.reactions && msg.reactions.length > 0
//                             ? "12px"
//                             : "2px",
//                         boxSizing: "border-box",
//                       }}
//                       onDoubleClick={(e) => {
//                         e.stopPropagation();
//                         if (!isDeleted) setActiveReactionMsgId(msg._id);
//                       }}
//                     >
//                       {activeReactionMsgId === msg._id && !isDeleted && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: "-42px",
//                             [isMe ? "right" : "left"]: "0px",
//                             background: isDarkMode ? "#1e2652" : "#ffffff",
//                             boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
//                             borderRadius: "24px",
//                             padding: "4px 8px",
//                             display: "flex",
//                             gap: "6px",
//                             zIndex: 100,
//                             border: isDarkMode
//                               ? "1px solid #2a3463"
//                               : "1px solid #e2e8f0",
//                           }}
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           {EMOJI_REACTIONS.map((emoji) => (
//                             <span
//                               key={emoji}
//                               onClick={() =>
//                                 handleSelectReaction(msg._id, emoji)
//                               }
//                               style={{
//                                 fontSize: "16px",
//                                 cursor: "pointer",
//                                 transition: "transform 0.15s",
//                               }}
//                               onMouseEnter={(e) =>
//                                 (e.currentTarget.style.transform =
//                                   "scale(1.25)")
//                               }
//                               onMouseLeave={(e) =>
//                                 (e.currentTarget.style.transform = "scale(1)")
//                               }
//                             >
//                               {emoji}
//                             </span>
//                           ))}
//                         </div>
//                       )}

//                       <Dropdown
//                         menu={{ items: contextItems }}
//                         trigger={["contextMenu"]}
//                         disabled={isDeleted}
//                       >
//                         <div
//                           style={{
//                             background: isDeleted
//                               ? isDarkMode
//                                 ? "#121829"
//                                 : "#e2e8f0"
//                               : isMe
//                                 ? "#6366f1"
//                                 : isDarkMode
//                                   ? "#1e2652"
//                                   : "#ffffff",
//                             color: isDeleted
//                               ? "#94a3b8"
//                               : isMe
//                                 ? "#ffffff"
//                                 : isDarkMode
//                                   ? "#fff"
//                                   : "#0f172a",
//                             padding: "8px 12px",
//                             borderRadius: isMe
//                               ? "16px 16px 4px 16px"
//                               : "16px 16px 16px 4px",
//                             boxShadow: isDarkMode
//                               ? "none"
//                               : "0 2px 4px rgba(0,0,0,0.05)",
//                             border: isMe
//                               ? "none"
//                               : isDarkMode
//                                 ? "1px solid #2a3463"
//                                 : "1px solid #e2e8f0",
//                             wordBreak: "break-word",
//                             position: "relative",
//                             fontStyle: isDeleted ? "italic" : "normal",
//                             boxSizing: "border-box",
//                           }}
//                         >
//                           {!isDeleted && (
//                             <div
//                               style={{
//                                 position: "absolute",
//                                 top: "4px",
//                                 right: "4px",
//                                 zIndex: 2,
//                               }}
//                             >
//                               <Dropdown
//                                 menu={{ items: contextItems }}
//                                 trigger={["click"]}
//                               >
//                                 <Button
//                                   type="text"
//                                   size="small"
//                                   icon={
//                                     <MoreOutlined
//                                       style={{
//                                         fontSize: 14,
//                                         color: isMe
//                                           ? "rgba(255,255,255,0.7)"
//                                           : "#94a3b8",
//                                       }}
//                                     />
//                                   }
//                                   style={{ padding: "0 2px", height: "20px" }}
//                                   onClick={(e) => e.stopPropagation()}
//                                 />
//                               </Dropdown>
//                             </div>
//                           )}

//                           {isDeleted ? (
//                             <div
//                               style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 6,
//                                 color: "#94a3b8",
//                                 fontSize: "13px",
//                               }}
//                             >
//                               🚫 This message was deleted
//                             </div>
//                           ) : (
//                             <>
//                               {isImage && msg.fileUrl ? (
//                                 <div
//                                   style={{
//                                     position: "relative",
//                                     marginBottom: "4px",
//                                     paddingRight: "16px",
//                                     maxWidth: "100%",
//                                   }}
//                                 >
//                                   <Image
//                                     src={msg.fileUrl}
//                                     alt="Media"
//                                     style={{
//                                       width: "100%",
//                                       maxWidth: "200px",
//                                       maxHeight: "180px",
//                                       borderRadius: "8px",
//                                       objectFit: "cover",
//                                       display: "block",
//                                     }}
//                                   />
//                                   <Tooltip title="Download Image">
//                                     <a
//                                       href={msg.fileUrl}
//                                       download
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       style={{
//                                         position: "absolute",
//                                         bottom: "6px",
//                                         right: "22px",
//                                         background: "rgba(0,0,0,0.7)",
//                                         color: "#fff",
//                                         width: "24px",
//                                         height: "24px",
//                                         borderRadius: "50%",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                         fontSize: "12px",
//                                       }}
//                                     >
//                                       <DownloadOutlined />
//                                     </a>
//                                   </Tooltip>
//                                 </div>
//                               ) : isPdf && msg.fileUrl ? (
//                                 <div
//                                   style={{
//                                     marginBottom: "4px",
//                                     paddingRight: "16px",
//                                     maxWidth: "100%",
//                                     overflow: "hidden",
//                                   }}
//                                 >
//                                   <div
//                                     onClick={() => {
//                                       setPreviewPdfUrl(msg.fileUrl);
//                                       setPreviewPdfTitle(
//                                         msg.text || "Document Preview",
//                                       );
//                                     }}
//                                     style={{
//                                       display: "flex",
//                                       alignItems: "center",
//                                       gap: "8px",
//                                       background: isMe
//                                         ? "rgba(255, 255, 255, 0.15)"
//                                         : isDarkMode
//                                           ? "#14182b"
//                                           : "#f1f5f9",
//                                       padding: "6px 10px",
//                                       borderRadius: "8px",
//                                       cursor: "pointer",
//                                       maxWidth: "100%",
//                                       boxSizing: "border-box",
//                                     }}
//                                   >
//                                     <FilePdfOutlined
//                                       style={{
//                                         fontSize: "22px",
//                                         color: isMe ? "#fff" : "#ef4444",
//                                         flexShrink: 0,
//                                       }}
//                                     />
//                                     <div
//                                       style={{
//                                         overflow: "hidden",
//                                         flex: 1,
//                                       }}
//                                     >
//                                       <div
//                                         style={{
//                                           fontWeight: 600,
//                                           fontSize: "12px",
//                                           textOverflow: "ellipsis",
//                                           whiteSpace: "nowrap",
//                                           overflow: "hidden",
//                                           color: isMe
//                                             ? "#fff"
//                                             : isDarkMode
//                                               ? "#fff"
//                                               : "#0f172a",
//                                         }}
//                                       >
//                                         {msg.text || "PDF Document"}
//                                       </div>
//                                       <span
//                                         style={{
//                                           fontSize: "10px",
//                                           color: isMe
//                                             ? "rgba(255,255,255,0.8)"
//                                             : "#6366f1",
//                                           display: "flex",
//                                           alignItems: "center",
//                                           gap: "3px",
//                                         }}
//                                       >
//                                         <EyeOutlined /> Preview
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ) : isAudio && msg.fileUrl ? (
//                                 <div
//                                   style={{
//                                     marginBottom: "4px",
//                                     paddingRight: "16px",
//                                     maxWidth: "100%",
//                                     overflow: "hidden",
//                                   }}
//                                 >
//                                   <VoiceNoteBubble
//                                     audioUrl={msg.fileUrl}
//                                     isMe={isMe}
//                                     isDarkMode={isDarkMode}
//                                   />
//                                 </div>
//                               ) : (
//                                 <div
//                                   style={{
//                                     fontSize: "13.5px",
//                                     lineHeight: "1.4",
//                                     paddingRight: "16px",
//                                   }}
//                                 >
//                                   {msg.text || msg.message}
//                                 </div>
//                               )}

//                               <div
//                                 style={{
//                                   fontSize: "9.5px",
//                                   color: isMe
//                                     ? "rgba(255,255,255,0.7)"
//                                     : "#94a3b8",
//                                   textAlign: "right",
//                                   marginTop: "2px",
//                                 }}
//                               >
//                                 {new Date(
//                                   msg.createdAt || Date().now(),
//                                 ).toLocaleTimeString([], {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </div>
//                             </>
//                           )}

//                           {/* Reactions Pill */}
//                           {!isDeleted &&
//                             msg.reactions &&
//                             msg.reactions.length > 0 && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: "-10px",
//                                   [isMe ? "left" : "right"]: "8px",
//                                   background: isDarkMode
//                                     ? "#14182b"
//                                     : "#ffffff",
//                                   border: isDarkMode
//                                     ? "1px solid #2a3463"
//                                     : "1px solid #cbd5e1",
//                                   borderRadius: "12px",
//                                   padding: "0px 5px",
//                                   fontSize: "11px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: "2px",
//                                   boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
//                                 }}
//                               >
//                                 {[
//                                   ...new Set(msg.reactions.map((r) => r.emoji)),
//                                 ].map((em, i) => (
//                                   <span key={i}>{em}</span>
//                                 ))}
//                                 {msg.reactions.length > 1 && (
//                                   <span
//                                     style={{
//                                       fontSize: "9px",
//                                       color: "#888",
//                                       marginLeft: "2px",
//                                     }}
//                                   >
//                                     {msg.reactions.length}
//                                   </span>
//                                 )}
//                               </div>
//                             )}
//                         </div>
//                       </Dropdown>
//                     </div>
//                   );
//                 })
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Form */}
//             <form
//               onSubmit={(e) => handleSendMessage(e)}
//               style={{
//                 padding: "10px 12px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 background: isDarkMode ? "#0d1026" : "#ffffff",
//                 borderTop: isDarkMode
//                   ? "1px solid #1e2652"
//                   : "1px solid #e2e8f0",
//                 flexShrink: 0,
//                 width: "100%",
//                 boxSizing: "border-box",
//               }}
//             >
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: "none" }}
//                 accept="image/*,application/pdf"
//                 onChange={handleFileUpload}
//               />
//               <Tooltip title="Attach File">
//                 <Button
//                   type="text"
//                   icon={
//                     <PaperClipOutlined
//                       style={{ fontSize: "16px", color: "#94a3b8" }}
//                     />
//                   }
//                   style={{ padding: "0 6px" }}
//                   onClick={() => fileInputRef.current.click()}
//                 />
//               </Tooltip>

//               {recordedAudioUrl ? (
//                 <div
//                   style={{
//                     flex: 1,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     background: isDarkMode ? "#14182b" : "#f1f5f9",
//                     padding: "6px 12px",
//                     borderRadius: "20px",
//                     border: "1px solid #6366f1",
//                   }}
//                 >
//                   <audio
//                     ref={previewAudioRef}
//                     src={recordedAudioUrl}
//                     onEnded={() => setIsPreviewPlaying(false)}
//                     style={{ display: "none" }}
//                   />
//                   <Button
//                     type="text"
//                     icon={
//                       isPreviewPlaying ? (
//                         <PauseCircleOutlined
//                           style={{ fontSize: "20px", color: "#6366f1" }}
//                         />
//                       ) : (
//                         <PlayCircleOutlined
//                           style={{ fontSize: "20px", color: "#6366f1" }}
//                         />
//                       )
//                     }
//                     onClick={() => {
//                       if (!previewAudioRef.current) return;
//                       if (isPreviewPlaying) {
//                         previewAudioRef.current.pause();
//                         setIsPreviewPlaying(false);
//                       } else {
//                         previewAudioRef.current.play();
//                         setIsPreviewPlaying(true);
//                       }
//                     }}
//                     style={{ padding: 0, height: "auto" }}
//                   />
//                   <span
//                     style={{
//                       fontSize: "12px",
//                       fontWeight: 600,
//                       color: isDarkMode ? "#fff" : "#0f172a",
//                       flex: 1,
//                     }}
//                   >
//                     Voice Note Ready 🎙️
//                   </span>
//                   <Tooltip title="Discard">
//                     <Button
//                       type="text"
//                       icon={<DeleteFilled style={{ color: "#ef4444" }} />}
//                       onClick={cancelRecording}
//                       style={{ padding: 0 }}
//                     />
//                   </Tooltip>
//                 </div>
//               ) : isRecording ? (
//                 <div
//                   style={{
//                     flex: 1,
//                     padding: "6px 12px",
//                     borderRadius: "20px",
//                     background: isDarkMode ? "#1f1422" : "#fef2f2",
//                     border: "1px solid #f87171",
//                     color: "#ef4444",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "6px",
//                     cursor: "pointer",
//                   }}
//                   onClick={stopRecording}
//                 >
//                   <span
//                     style={{
//                       display: "inline-block",
//                       width: "8px",
//                       height: "8px",
//                       borderRadius: "50%",
//                       background: "#ef4444",
//                       boxShadow: "0 0 10px #ef4444",
//                     }}
//                   />
//                   Recording... Click mic again to stop
//                 </div>
//               ) : (
//                 <Input
//                   placeholder="Type a message..."
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   style={{
//                     borderRadius: "20px",
//                     background: isDarkMode ? "#121838" : "#f8fafc",
//                     color: isDarkMode ? "#fff" : "#000",
//                     border: isDarkMode
//                       ? "1px solid #1e2652"
//                       : "1px solid #cbd5e1",
//                     padding: "6px 12px",
//                     fontSize: "13px",
//                   }}
//                 />
//               )}

//               {recordedAudioUrl ? (
//                 <Button
//                   type="primary"
//                   shape="circle"
//                   icon={<SendOutlined style={{ fontSize: "14px" }} />}
//                   onClick={sendRecordedAudio}
//                   style={{
//                     background: "#10b981",
//                     borderColor: "#10b981",
//                     width: "36px",
//                     height: "36px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     flexShrink: 0,
//                   }}
//                 />
//               ) : (
//                 <>
//                   <Tooltip
//                     title={isRecording ? "Stop Recording" : "Record Voice"}
//                   >
//                     <Button
//                       type="text"
//                       style={{ padding: "0 6px" }}
//                       onClick={isRecording ? stopRecording : startRecording}
//                     >
//                       {isRecording ? (
//                         <span
//                           style={{
//                             display: "inline-block",
//                             width: "12px",
//                             height: "12px",
//                             borderRadius: "2px",
//                             backgroundColor: "#ef4444",
//                             boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
//                           }}
//                         />
//                       ) : (
//                         <AudioOutlined
//                           style={{ fontSize: "16px", color: "#94a3b8" }}
//                         />
//                       )}
//                     </Button>
//                   </Tooltip>

//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     shape="circle"
//                     icon={<SendOutlined style={{ fontSize: "14px" }} />}
//                     style={{
//                       background: "#6366f1",
//                       width: "36px",
//                       height: "36px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       flexShrink: 0,
//                     }}
//                   />
//                 </>
//               )}
//             </form>
//           </>
//         ) : (
//           <div
//             style={{
//               flex: "1",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#94a3b8",
//               padding: "20px",
//               textAlign: "center",
//             }}
//           >
//             <div style={{ fontSize: "40px", marginBottom: "8px" }}>💬</div>
//             <h3
//               style={{
//                 color: isDarkMode ? "#fff" : "#0f172a",
//                 margin: 0,
//                 fontSize: "16px",
//               }}
//             >
//               ClassNotes Student Chat
//             </h3>
//             <p style={{ fontSize: "12px", marginTop: "4px" }}>
//               Select a conversation to start messaging.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* PDF Viewer Modal */}
//       <Modal
//         open={Boolean(previewPdfUrl)}
//         onCancel={() => setPreviewPdfUrl(null)}
//         footer={null}
//         width={window.innerWidth < 1024 ? "95%" : 800}
//         centered
//         styles={{
//           mask: {
//             backdropFilter: "blur(6px)",
//             backgroundColor: isDarkMode
//               ? "rgba(0, 0, 0, 0.85)"
//               : "rgba(15, 23, 42, 0.55)",
//           },
//           content: {
//             backgroundColor: isDarkMode ? "#0c0d1e" : "#ffffff",
//             border: isDarkMode
//               ? "1px solid rgba(255, 255, 255, 0.1)"
//               : "1px solid #e2e8f0",
//             borderRadius: "16px",
//             padding: "16px",
//           },
//         }}
//         title={
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               paddingRight: "24px",
//             }}
//           >
//             <span
//               style={{
//                 color: isDarkMode ? "#fff" : "#0f172a",
//                 fontSize: "14px",
//                 fontWeight: 600,
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//                 maxWidth: "60%",
//               }}
//             >
//               {previewPdfTitle}
//             </span>
//             <Button
//               type="primary"
//               size="small"
//               icon={<DownloadOutlined />}
//               href={previewPdfUrl}
//               target="_blank"
//               download
//               style={{ background: "#6366f1" }}
//             >
//               Download
//             </Button>
//           </div>
//         }
//       >
//         <div
//           style={{
//             height: "60vh",
//             width: "100%",
//             marginTop: "12px",
//             borderRadius: "8px",
//             overflow: "hidden",
//             background: "#f8fafc",
//           }}
//         >
//           {previewPdfUrl && (
//             <iframe
//               src={previewPdfUrl}
//               title="PDF Preview"
//               width="100%"
//               height="100%"
//               style={{ border: "none" }}
//             />
//           )}
//         </div>
//       </Modal>

//       {/* User Profile Preview Modal */}
//       <Modal
//         open={isProfileModalOpen}
//         onCancel={() => setIsProfileModalOpen(false)}
//         footer={null}
//         centered
//         width={440}
//         styles={{
//           mask: {
//             backdropFilter: "blur(8px)",
//             backgroundColor: isDarkMode
//               ? "rgba(0, 0, 0, 0.82)"
//               : "rgba(15, 23, 42, 0.5)",
//           },
//           content: {
//             backgroundColor: isDarkMode ? "#0c0d1e" : "#ffffff",
//             border: isDarkMode
//               ? "1px solid rgba(255, 255, 255, 0.1)"
//               : "1px solid #e2e8f0",
//             borderRadius: "20px",
//             padding: "24px 20px",
//             boxShadow: isDarkMode
//               ? "0 20px 45px rgba(0,0,0,0.7)"
//               : "0 12px 30px rgba(0,0,0,0.08)",
//           },
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             textAlign: "center",
//           }}
//         >
//           <div
//             style={{
//               position: "relative",
//               width: "104px",
//               height: "104px",
//               borderRadius: "50%",
//               overflow: "hidden",
//               border: "3px solid #6366f1",
//               boxShadow: "0 8px 25px rgba(99, 102, 241, 0.35)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: isDarkMode ? "#14182b" : "#e0e7ff",
//               marginBottom: "14px",
//             }}
//           >
//             {otherUserAvatar ? (
//               <Image
//                 src={otherUserAvatar}
//                 alt="Profile"
//                 width={104}
//                 height={104}
//                 style={{ objectFit: "cover" }}
//                 preview={{
//                   mask: (
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "4px",
//                         fontSize: "11px",
//                       }}
//                     >
//                       <EyeOutlined /> Full Photo
//                     </div>
//                   ),
//                 }}
//               />
//             ) : (
//               <UserOutlined
//                 style={{
//                   fontSize: "42px",
//                   color: isDarkMode ? "#64748b" : "#6366f1",
//                 }}
//               />
//             )}
//           </div>

//           <h3
//             style={{
//               margin: "0 0 2px",
//               color: isDarkMode ? "#f8fafc" : "#0f172a",
//               fontSize: "19px",
//               fontWeight: 700,
//             }}
//           >
//             {otherParticipant?.name || "Student User"}
//           </h3>
//           <span
//             style={{
//               color: isDarkMode ? "#818cf8" : "#4f46e5",
//               fontSize: "13px",
//               fontWeight: 500,
//               marginBottom: "6px",
//             }}
//           >
//             {otherParticipant?.agNumber || "Academic Student"}
//           </span>

//           <Tag
//             color={isUserOnline ? "success" : "default"}
//             style={{
//               borderRadius: "12px",
//               padding: "2px 10px",
//               fontSize: "11.5px",
//               marginBottom: "18px",
//             }}
//           >
//             ● {isUserOnline ? "Online Now" : "Offline"}
//           </Tag>

//           <div
//             style={{
//               width: "100%",
//               display: "flex",
//               flexDirection: "column",
//               gap: "10px",
//               textAlign: "left",
//             }}
//           >
//             <div
//               style={{
//                 background: isDarkMode ? "#080816" : "#f8fafc",
//                 border: isDarkMode
//                   ? "1px solid rgba(255, 255, 255, 0.08)"
//                   : "1px solid #e2e8f0",
//                 borderRadius: "10px",
//                 padding: "10px 14px",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "11px",
//                   color: "#94a3b8",
//                   fontWeight: 600,
//                   textTransform: "uppercase",
//                   letterSpacing: "0.5px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   marginBottom: "3px",
//                 }}
//               >
//                 <MailOutlined /> Email Address
//               </div>
//               <div
//                 style={{
//                   fontSize: "13.5px",
//                   color: isDarkMode ? "#cbd5e1" : "#334155",
//                   fontWeight: 500,
//                   wordBreak: "break-all",
//                 }}
//               >
//                 {otherParticipant?.email || "No email available"}
//               </div>
//             </div>

//             <div
//               style={{
//                 background: isDarkMode ? "#080816" : "#f8fafc",
//                 border: isDarkMode
//                   ? "1px solid rgba(255, 255, 255, 0.08)"
//                   : "1px solid #e2e8f0",
//                 borderRadius: "10px",
//                 padding: "10px 14px",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "11px",
//                   color: "#94a3b8",
//                   fontWeight: 600,
//                   textTransform: "uppercase",
//                   letterSpacing: "0.5px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   marginBottom: "3px",
//                 }}
//               >
//                 <IdcardOutlined /> AG Number
//               </div>
//               <div
//                 style={{
//                   fontSize: "13.5px",
//                   color: isDarkMode ? "#818cf8" : "#4f46e5",
//                   fontWeight: 600,
//                 }}
//               >
//                 {otherParticipant?.agNumber || "Not Assigned"}
//               </div>
//             </div>

//             <div
//               style={{
//                 background: isDarkMode ? "#080816" : "#f8fafc",
//                 border: isDarkMode
//                   ? "1px solid rgba(255, 255, 255, 0.08)"
//                   : "1px solid #e2e8f0",
//                 borderRadius: "10px",
//                 padding: "10px 14px",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "11px",
//                   color: "#94a3b8",
//                   fontWeight: 600,
//                   textTransform: "uppercase",
//                   letterSpacing: "0.5px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   marginBottom: "3px",
//                 }}
//               >
//                 <BookOutlined /> Enrolled Semester
//               </div>
//               <div
//                 style={{
//                   fontSize: "13.5px",
//                   color: isDarkMode ? "#818cf8" : "#4f46e5",
//                   fontWeight: 600,
//                 }}
//               >
//                 {otherParticipant?.semester || "Semester 1"}
//               </div>
//             </div>
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "8px",
//               width: "100%",
//               marginTop: "14px",
//             }}
//           >
//             <div
//               style={{
//                 background: isDarkMode ? "#14182b" : "#f1f5f9",
//                 border: isDarkMode
//                   ? "1px solid rgba(255, 255, 255, 0.06)"
//                   : "1px solid #e2e8f0",
//                 borderRadius: "8px",
//                 padding: "8px",
//                 fontSize: "11.5px",
//                 color: isDarkMode ? "#cbd5e1" : "#475569",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "6px",
//               }}
//             >
//               <CalendarOutlined style={{ color: "#6366f1" }} /> ClassNotes Peer
//             </div>

//             <div
//               style={{
//                 background: isDarkMode ? "#14182b" : "#f1f5f9",
//                 border: isDarkMode
//                   ? "1px solid rgba(255, 255, 255, 0.06)"
//                   : "1px solid #e2e8f0",
//                 borderRadius: "8px",
//                 padding: "8px",
//                 fontSize: "11.5px",
//                 color: isDarkMode ? "#cbd5e1" : "#475569",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "6px",
//               }}
//             >
//               <UserOutlined style={{ color: "#6366f1" }} /> Verified Student
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Chat;
import { useEffect, useState, useRef } from "react";
import {
  Input,
  Button,
  message,
  Spin,
  Avatar,
  Tooltip,
  Image,
  Dropdown,
  Modal,
  Popconfirm,
  Tag,
} from "antd";
import {
  SendOutlined,
  SearchOutlined,
  UserOutlined,
  PaperClipOutlined,
  AudioOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ClearOutlined,
  CalendarOutlined,
  BookOutlined,
  MailOutlined,
  DeleteFilled,
  PlayCircleOutlined,
  PauseCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { socket } from "../../utils/socket";
import { useTheme } from "../../context/ThemeContext";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://class-notes-with-chat-production.up.railway.app";
const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

// Voice Note Bubble component
const VoiceNoteBubble = ({ audioUrl, isMe, isDarkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 0",
        minWidth: "150px",
        maxWidth: "100%",
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
      <Button
        shape="circle"
        size="small"
        onClick={togglePlay}
        style={{
          background: isMe ? "#ffffff" : "#6366f1",
          borderColor: isMe ? "#ffffff" : "#6366f1",
          color: isMe ? "#6366f1" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </Button>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "2px",
          overflow: "hidden",
        }}
      >
        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65, 35].map((h, i) => (
          <span
            key={i}
            style={{
              width: "2.5px",
              height: `${h * 0.22}px`,
              borderRadius: "2px",
              background: isMe
                ? "rgba(255,255,255,0.75)"
                : isDarkMode
                  ? "#818cf8"
                  : "#6366f1",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "10px",
          opacity: 0.85,
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        Voice
      </span>
    </div>
  );
};

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState("");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { isDarkMode } = useTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

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

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (myId) socket.emit("user_online", myId);

    socket.on("get_online_users", (users) => {
      setOnlineUsers(users.map((u) => String(u)));
    });

    return () => {
      socket.off("get_online_users");
    };
  }, [myId]);

  useEffect(() => {
    fetchMyChats();
  }, []);

  const fetchMyChats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/chats/my-chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setChats(res.data.chats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp style delete/hide chat room handler
  const handleDeleteChatRoom = async (e, roomId) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/chats/room/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        message.success("Chat deleted for you");
        setChats((prev) => prev.filter((c) => c._id !== roomId));
        if (activeChat?._id === roomId) {
          setActiveChat(null);
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete chat");
    }
  };

  // 👇 Real system file downloader function (Saves to device instead of opening in new tab)
  const handleDownloadFile = async (fileUrl, fileName = "ClassNotes-File") => {
    try {
      message.loading({ content: "Downloading file...", key: "dl" });
      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      message.success({ content: "Downloaded successfully!", key: "dl" });
    } catch (err) {
      console.error(err);
      window.open(fileUrl, "_blank");
      message.error({ content: "Download failed, opened in new tab.", key: "dl" });
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      const currentOpenChat = activeChatRef.current;
      const incomingRoomId = String(data.chatRoom?._id || data.chatRoom);
      const senderId = String(data.sender?._id || data.sender);

      if (currentOpenChat && String(currentOpenChat._id) === incomingRoomId) {
        setMessages((prev) =>
          prev.some((m) => m._id === data._id) ? prev : [...prev, data],
        );
      }

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (c) => String(c._id) === incomingRoomId,
        );
        const lastPreview =
          data.messageType === "image"
            ? "📷 Photo"
            : data.messageType === "pdf"
              ? "📄 PDF Document"
              : data.messageType === "audio"
                ? "🎤 Voice Note"
                : data.text || data.message;

        if (chatIndex !== -1) {
          const updatedChat = { ...prevChats[chatIndex] };
          updatedChat.lastMessage = lastPreview;
          updatedChat.lastMessageTime =
            data.createdAt || new Date().toISOString();

          if (
            !currentOpenChat ||
            String(currentOpenChat._id) !== incomingRoomId
          ) {
            if (senderId !== myId) {
              updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
            }
          }

          const otherChats = prevChats.filter(
            (c) => String(c._id) !== incomingRoomId,
          );
          return [updatedChat, ...otherChats];
        } else {
          fetchMyChats();
        }
        return prevChats;
      });
    };

    const handleDeletedMessage = (deletedId) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(deletedId)
            ? {
                ...m,
                isDeleted: true,
                text: "This message was deleted",
                fileUrl: "",
                reactions: [],
              }
            : m,
        ),
      );
      fetchMyChats();
    };

    const handleMessageReacted = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId) ? { ...msg, reactions } : msg,
        ),
      );
    };

    const handleChatCleared = (clearedRoomId) => {
      if (
        activeChatRef.current &&
        String(activeChatRef.current._id) === String(clearedRoomId)
      ) {
        setMessages([]);
      }
      fetchMyChats();
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_deleted", handleDeletedMessage);
    socket.on("message_reacted", handleMessageReacted);
    socket.on("chat_cleared", handleChatCleared);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_deleted", handleDeletedMessage);
      socket.off("message_reacted", handleMessageReacted);
      socket.off("chat_cleared", handleChatCleared);
    };
  }, [myId]);

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/chats/messages/${activeChat._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.success) {
          setMessages(res.data.messages);
          setChats((prev) =>
            prev.map((c) =>
              String(c._id) === String(activeChat._id)
                ? { ...c, unreadCount: 0 }
                : c,
            ),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
    socket.emit("join_room", activeChat._id);
  }, [activeChat, token]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/chats/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        const uniqueUsers = res.data.users.filter(
          (v, i, a) =>
            a.findIndex((t) => String(t._id) === String(v._id)) === i,
        );
        setSearchResults(uniqueUsers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = async (recipientId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chats/direct`,
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setActiveChat(res.data.chatRoom);
        setSearchResults([]);
        setSearchQuery("");
        fetchMyChats();
      }
    } catch {
      message.error("Failed to open chat");
    }
  };

  const handleSendMessage = (e, customPayload = null) => {
    if (e) e.preventDefault();

    const payload = customPayload || {
      chatRoomId: activeChat._id,
      message: inputText,
      senderId: myId,
      messageType: "text",
    };

    if (!payload.message && !payload.fileUrl) return;

    socket.emit("send_message", payload);
    if (!customPayload) setInputText("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      message.loading({ content: "Uploading file...", key: "upload" });
      const res = await axios.post(
        `${BACKEND_URL}/api/chats/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        const fileUrl = res.data.url;
        const isImage =
          file.type.startsWith("image/") ||
          /\.(jpeg|jpg|png|gif|webp)$/i.test(file.name);
        const isPdf =
          file.type === "application/pdf" || /\.pdf$/i.test(file.name);

        handleSendMessage(null, {
          chatRoomId: activeChat._id,
          message: file.name,
          fileUrl: fileUrl,
          senderId: myId,
          messageType: isImage ? "image" : isPdf ? "pdf" : "file",
        });

        message.success({ content: "Sent successfully!", key: "upload" });
      }
    } catch {
      message.error({ content: "Upload failed", key: "upload" });
    }
  };

  const handleDeleteMsg = async (msgId) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/chats/messages/${msgId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        socket.emit("delete_message", {
          chatRoomId: activeChat._id,
          messageId: msgId,
        });
        message.success("Message deleted");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const handleClearChat = async () => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/chats/clear/${activeChat._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        socket.emit("clear_chat", activeChat._id);
        setMessages([]);
        message.success("Chat cleared");
      }
    } catch {
      message.error("Failed to clear chat");
    }
  };

  const handleSelectReaction = (msgId, emoji) => {
    socket.emit("react_message", {
      chatRoomId: activeChat._id,
      messageId: msgId,
      emoji,
      userId: myId,
    });
    setActiveReactionMsgId(null);
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      message.info("Recording started... Click mic again to stop.");
    } catch {
      message.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setIsPreviewPlaying(false);
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudioBlob || !activeChat) return;

    const formData = new FormData();
    formData.append("file", recordedAudioBlob, "voice-note.webm");

    try {
      message.loading({ content: "Sending voice note...", key: "voice" });
      const res = await axios.post(
        `${BACKEND_URL}/api/chats/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data.success) {
        handleSendMessage(null, {
          chatRoomId: activeChat._id,
          message: "Voice Message",
          fileUrl: res.data.url,
          senderId: myId,
          messageType: "audio",
        });
        message.success({ content: "Voice note sent!", key: "voice" });
        cancelRecording();
      }
    } catch {
      message.error({ content: "Voice upload failed", key: "voice" });
    }
  };

  const renderAvatar = (userObj, size = "default", showDot = false) => {
    const avatarSrc =
      userObj?.avatar || userObj?.avatarUrl || userObj?.profilePic || "";
    const userId = String(userObj?._id || userObj?.id || "");
    const isOnline = onlineUsers.includes(userId);

    return (
      <div
        style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
      >
        <Avatar
          size={size}
          src={avatarSrc || undefined}
          icon={!avatarSrc && <UserOutlined />}
          style={{ backgroundColor: "#6366f1", objectFit: "cover" }}
        />
        {showDot && isOnline && (
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "10px",
              height: "10px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              border: "2px solid #ffffff",
            }}
          />
        )}
      </div>
    );
  };

  const otherParticipant = activeChat?.participants?.find(
    (p) => String(p._id) !== myId,
  );
  const isUserOnline = otherParticipant
    ? onlineUsers.includes(String(otherParticipant._id))
    : false;

  const otherUserAvatar =
    otherParticipant?.avatar ||
    otherParticipant?.avatarUrl ||
    otherParticipant?.profilePic ||
    "";

  return (
    <div
      onClick={() => setActiveReactionMsgId(null)}
      style={{
        display: "flex",
        height:
          window.innerWidth < 1024
            ? "calc(100dvh - 145px)"
            : "calc(100vh - 100px)",
        width: "100%",
        maxWidth: "100%",
        background: isDarkMode ? "#080816" : "#f8fafc",
        borderRadius: "16px",
        overflow: "hidden",
        border: isDarkMode ? "1px solid #1e2652" : "1px solid #e2e8f0",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
        marginBottom: window.innerWidth < 1024 ? "68px" : "0px",
      }}
    >
      {/* Sidebar: Chats List */}
      <div
        style={{
          width:
            window.innerWidth < 1024 ? (activeChat ? "0%" : "100%") : "340px",
          minWidth:
            window.innerWidth < 1024 ? (activeChat ? "0%" : "100%") : "340px",
          maxWidth: window.innerWidth < 1024 ? "100%" : "360px",
          borderRight: isDarkMode ? "1px solid #1e2652" : "1px solid #e2e8f0",
          display: window.innerWidth < 1024 && activeChat ? "none" : "flex",
          flexDirection: "column",
          background: isDarkMode ? "#0d1026" : "#ffffff",
          transition: "all 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: isDarkMode
              ? "1px solid #1e2652"
              : "1px solid #f1f5f9",
          }}
        >
          <Input
            placeholder="Search user by name, email or AG number..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              borderRadius: "8px",
              background: isDarkMode ? "#121838" : "#f8fafc",
              color: isDarkMode ? "#fff" : "#000",
            }}
          />
        </div>

        {searchResults.length > 0 && (
          <div
            style={{
              background: isDarkMode ? "#121838" : "#f1f5f9",
              padding: "8px",
              borderBottom: "1px solid #1e2652",
            }}
          >
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  color: isDarkMode ? "#fff" : "#000",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {renderAvatar(user, "default", true)}
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#818cf8",
                      fontWeight: 500,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {user.agNumber
                      ? `${user.agNumber} • ${user.email}`
                      : user.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
            </div>
          ) : chats.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginTop: "30px",
                fontSize: "13px",
              }}
            >
              No conversations yet
            </p>
          ) : (
            chats.map((chat) => {
              const chatOtherUser = chat.participants?.find(
                (p) => String(p._id) !== myId,
              );
              const displayName =
                chat.type === "group"
                  ? chat.name
                  : chatOtherUser?.name || "Direct Chat";
              const isSelected = activeChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: isSelected
                      ? isDarkMode
                        ? "#1e2652"
                        : "#e0e7ff"
                      : "transparent",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {renderAvatar(chatOtherUser, 40, true)}
                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <h4
                        style={{
                          margin: 0,
                          color: isDarkMode ? "#fff" : "#0f172a",
                          fontSize: "14px",
                          fontWeight: 600,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {displayName}
                      </h4>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          display: "block",
                        }}
                      >
                        {chat.lastMessage ||
                          (chat.type === "group"
                            ? "Group Chat"
                            : chatOtherUser?.agNumber || chatOtherUser?.email)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: isSelected
                            ? isDarkMode
                              ? "#cbd5e1"
                              : "#4338ca"
                            : "#94a3b8",
                        }}
                      >
                        {new Date(
                          chat.lastMessageTime || Date.now(),
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "10px",
                            minWidth: "18px",
                            textAlign: "center",
                          }}
                        >
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "delete",
                            label: (
                              <Popconfirm
                                title="Delete Chat"
                                description="Delete this conversation for you?"
                                onConfirm={(e) =>
                                  handleDeleteChatRoom(e, chat._id)
                                }
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <span
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: "#ef4444",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <DeleteOutlined /> Delete Chat
                                </span>
                              </Popconfirm>
                            ),
                          },
                        ],
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        shape="circle"
                        size="small"
                        icon={
                          <MoreOutlined
                            style={{
                              fontSize: "16px",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          />
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Window */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          display: window.innerWidth < 1024 && !activeChat ? "none" : "flex",
          flexDirection: "column",
          background: isDarkMode ? "#050714" : "#f8fafc",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {activeChat ? (
          <>
            {/* Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: isDarkMode
                  ? "1px solid #1e2652"
                  : "1px solid #e2e8f0",
                background: isDarkMode ? "#0d1026" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  overflow: "hidden",
                }}
              >
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  className="d-md-none"
                  onClick={() => setActiveChat(null)}
                  style={{
                    color: isDarkMode ? "#fff" : "#000",
                    padding: "0 6px 0 0",
                  }}
                />

                <div
                  onClick={() => setIsProfileModalOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    padding: "2px 4px",
                    transition: "background 0.2s",
                  }}
                  title="Click to view student profile"
                >
                  {renderAvatar(otherParticipant, 38, true)}
                  <div style={{ overflow: "hidden" }}>
                    <h3
                      style={{
                        margin: 0,
                        color: isDarkMode ? "#fff" : "#0f172a",
                        fontSize: "15px",
                        fontWeight: 600,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {activeChat.type === "group"
                        ? activeChat.name
                        : otherParticipant?.name || "Chat"}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        color: isUserOnline ? "#10b981" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ● {isUserOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Actions Dropdown */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "profile",
                      label: (
                        <span
                          onClick={() => setIsProfileModalOpen(true)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <UserOutlined /> View Profile
                        </span>
                      ),
                    },
                    {
                      key: "clear",
                      label: (
                        <Popconfirm
                          title="Clear chat?"
                          description="Delete all messages?"
                          onConfirm={handleClearChat}
                          okText="Yes"
                          cancelText="No"
                        >
                          <span
                            style={{
                              color: "#ef4444",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <ClearOutlined /> Clear Chat
                          </span>
                        </Popconfirm>
                      ),
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <MoreOutlined
                      style={{
                        fontSize: 18,
                        color: isDarkMode ? "#fff" : "#000",
                      }}
                    />
                  }
                />
              </Dropdown>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                padding: "16px 12px",
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {messagesLoading ? (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    marginTop: "50px",
                    fontSize: "13px",
                  }}
                >
                  No messages here yet. Say hello! 👋
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const rawSender = msg.sender?._id || msg.sender;
                  const senderId = String(rawSender || "");
                  const isMe = senderId === myId;
                  const isDeleted = msg.isDeleted;

                  const isImage =
                    msg.messageType === "image" ||
                    (msg.fileUrl &&
                      /\.(jpeg|jpg|png|gif|webp)$/i.test(msg.fileUrl));
                  const isPdf =
                    msg.messageType === "pdf" ||
                    msg.messageType === "file" ||
                    (msg.fileUrl && /\.pdf$/i.test(msg.fileUrl));
                  const isAudio =
                    msg.messageType === "audio" ||
                    (msg.fileUrl && /\.(webm|mp3|wav)$/i.test(msg.fileUrl));

                  const contextItems = !isDeleted
                    ? [
                        {
                          key: "copy",
                          label: "Copy Text",
                          icon: <CopyOutlined />,
                          onClick: () => {
                            navigator.clipboard.writeText(
                              msg.text || msg.fileUrl || "",
                            );
                            message.success("Copied to clipboard");
                          },
                        },
                        ...(isMe
                          ? [
                              {
                                key: "delete",
                                label: "Delete Message",
                                icon: (
                                  <DeleteOutlined
                                    style={{ color: "#ef4444" }}
                                  />
                                ),
                                danger: true,
                                onClick: () => handleDeleteMsg(msg._id),
                              },
                            ]
                          : []),
                      ]
                    : [];

                  return (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: window.innerWidth < 1024 ? "85%" : "65%",
                        marginBottom:
                          msg.reactions && msg.reactions.length > 0
                            ? "12px"
                            : "2px",
                        boxSizing: "border-box",
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (!isDeleted) setActiveReactionMsgId(msg._id);
                      }}
                    >
                      {activeReactionMsgId === msg._id && !isDeleted && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-42px",
                            [isMe ? "right" : "left"]: "0px",
                            background: isDarkMode ? "#1e2652" : "#ffffff",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                            borderRadius: "24px",
                            padding: "4px 8px",
                            display: "flex",
                            gap: "6px",
                            zIndex: 100,
                            border: isDarkMode
                              ? "1px solid #2a3463"
                              : "1px solid #e2e8f0",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {EMOJI_REACTIONS.map((emoji) => (
                            <span
                              key={emoji}
                              onClick={() =>
                                handleSelectReaction(msg._id, emoji)
                              }
                              style={{
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "transform 0.15s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.25)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      <Dropdown
                        menu={{ items: contextItems }}
                        trigger={["contextMenu"]}
                        disabled={isDeleted}
                      >
                        <div
                          style={{
                            background: isDeleted
                              ? isDarkMode
                                ? "#121829"
                                : "#e2e8f0"
                              : isMe
                                ? "#6366f1"
                                : isDarkMode
                                  ? "#1e2652"
                                  : "#ffffff",
                            color: isDeleted
                              ? "#94a3b8"
                              : isMe
                                ? "#ffffff"
                                : isDarkMode
                                  ? "#fff"
                                  : "#0f172a",
                            padding: "8px 12px",
                            borderRadius: isMe
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            boxShadow: isDarkMode
                              ? "none"
                              : "0 2px 4px rgba(0,0,0,0.05)",
                            border: isMe
                              ? "none"
                              : isDarkMode
                                ? "1px solid #2a3463"
                                : "1px solid #e2e8f0",
                            wordBreak: "break-word",
                            position: "relative",
                            fontStyle: isDeleted ? "italic" : "normal",
                            boxSizing: "border-box",
                          }}
                        >
                          {!isDeleted && (
                            <div
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                zIndex: 2,
                              }}
                            >
                              <Dropdown
                                menu={{ items: contextItems }}
                                trigger={["click"]}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    <MoreOutlined
                                      style={{
                                        fontSize: 14,
                                        color: isMe
                                          ? "rgba(255,255,255,0.7)"
                                          : "#94a3b8",
                                      }}
                                    />
                                  }
                                  style={{ padding: "0 2px", height: "20px" }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Dropdown>
                            </div>
                          )}

                          {isDeleted ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              🚫 This message was deleted
                            </div>
                          ) : (
                            <>
                              {isImage && msg.fileUrl ? (
                                <div
                                  style={{
                                    position: "relative",
                                    marginBottom: "4px",
                                    paddingRight: "16px",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <Image
                                    src={msg.fileUrl}
                                    alt="Media"
                                    style={{
                                      width: "100%",
                                      maxWidth: "200px",
                                      maxHeight: "180px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                  <Tooltip title="Download Image">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<DownloadOutlined />}
                                      onClick={() => handleDownloadFile(msg.fileUrl, "ClassNotes-Image.jpg")}
                                      style={{
                                        position: "absolute",
                                        bottom: "6px",
                                        right: "22px",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "#fff",
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        border: "none",
                                      }}
                                    />
                                  </Tooltip>
                                </div>
                              ) : isPdf && msg.fileUrl ? (
                                <div
                                  style={{
                                    marginBottom: "4px",
                                    paddingRight: "16px",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      setPreviewPdfUrl(msg.fileUrl);
                                      setPreviewPdfTitle(
                                        msg.text || "Document Preview",
                                      );
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      background: isMe
                                        ? "rgba(255, 255, 255, 0.15)"
                                        : isDarkMode
                                          ? "#14182b"
                                          : "#f1f5f9",
                                      padding: "6px 10px",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                      maxWidth: "100%",
                                      boxSizing: "border-box",
                                    }}
                                  >
                                    <FilePdfOutlined
                                      style={{
                                        fontSize: "22px",
                                        color: isMe ? "#fff" : "#ef4444",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <div
                                      style={{
                                        overflow: "hidden",
                                        flex: 1,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "12px",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          color: isMe
                                            ? "#fff"
                                            : isDarkMode
                                              ? "#fff"
                                              : "#0f172a",
                                        }}
                                      >
                                        {msg.text || "PDF Document"}
                                      </div>
                                      <div style={{ display: "flex", gap: "10px" }}>
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: isMe
                                              ? "rgba(255,255,255,0.8)"
                                              : "#6366f1",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px",
                                          }}
                                        >
                                          <EyeOutlined /> Preview
                                        </span>
                                        <span
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(msg.fileUrl, "ClassNotes-Document.pdf");
                                          }}
                                          style={{
                                            fontSize: "10px",
                                            color: isMe
                                              ? "rgba(255,255,255,0.8)"
                                              : "#10b981",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <DownloadOutlined /> Download
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : isAudio && msg.fileUrl ? (
                                <div
                                  style={{
                                    marginBottom: "4px",
                                    paddingRight: "16px",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                  }}
                                >
                                  <VoiceNoteBubble
                                    audioUrl={msg.fileUrl}
                                    isMe={isMe}
                                    isDarkMode={isDarkMode}
                                  />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    fontSize: "13.5px",
                                    lineHeight: "1.4",
                                    paddingRight: "16px",
                                  }}
                                >
                                  {msg.text || msg.message}
                                </div>
                              )}

                              <div
                                style={{
                                  fontSize: "9.5px",
                                  color: isMe
                                    ? "rgba(255,255,255,0.7)"
                                    : "#94a3b8",
                                  textAlign: "right",
                                  marginTop: "2px",
                                }}
                              >
                                {new Date(
                                  msg.createdAt || Date.now(),
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </>
                          )}

                          {/* Reactions Pill */}
                          {!isDeleted &&
                            msg.reactions &&
                            msg.reactions.length > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-10px",
                                  [isMe ? "left" : "right"]: "8px",
                                  background: isDarkMode
                                    ? "#14182b"
                                    : "#ffffff",
                                  border: isDarkMode
                                    ? "1px solid #2a3463"
                                    : "1px solid #cbd5e1",
                                  borderRadius: "12px",
                                  padding: "0px 5px",
                                  fontSize: "11px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                                }}
                              >
                                {[
                                  ...new Set(msg.reactions.map((r) => r.emoji)),
                                ].map((em, i) => (
                                  <span key={i}>{em}</span>
                                ))}
                                {msg.reactions.length > 1 && (
                                  <span
                                    style={{
                                      fontSize: "9px",
                                      color: "#888",
                                      marginLeft: "2px",
                                    }}
                                  >
                                    {msg.reactions.length}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      </Dropdown>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              style={{
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: isDarkMode ? "#0d1026" : "#ffffff",
                borderTop: isDarkMode
                  ? "1px solid #1e2652"
                  : "1px solid #e2e8f0",
                flexShrink: 0,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />
              <Tooltip title="Attach File">
                <Button
                  type="text"
                  icon={
                    <PaperClipOutlined
                      style={{ fontSize: "16px", color: "#94a3b8" }}
                    />
                  }
                  style={{ padding: "0 6px" }}
                  onClick={() => fileInputRef.current.click()}
                />
              </Tooltip>

              {recordedAudioUrl ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: isDarkMode ? "#14182b" : "#f1f5f9",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid #6366f1",
                  }}
                >
                  <audio
                    ref={previewAudioRef}
                    src={recordedAudioUrl}
                    onEnded={() => setIsPreviewPlaying(false)}
                    style={{ display: "none" }}
                  />
                  <Button
                    type="text"
                    icon={
                      isPreviewPlaying ? (
                        <PauseCircleOutlined
                          style={{ fontSize: "20px", color: "#6366f1" }}
                        />
                      ) : (
                        <PlayCircleOutlined
                          style={{ fontSize: "20px", color: "#6366f1" }}
                        />
                      )
                    }
                    onClick={() => {
                      if (!previewAudioRef.current) return;
                      if (isPreviewPlaying) {
                        previewAudioRef.current.pause();
                        setIsPreviewPlaying(false);
                      } else {
                        previewAudioRef.current.play();
                        setIsPreviewPlaying(true);
                      }
                    }}
                    style={{ padding: 0, height: "auto" }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isDarkMode ? "#fff" : "#0f172a",
                      flex: 1,
                    }}
                  >
                    Voice Note Ready 🎙️
                  </span>
                  <Tooltip title="Discard">
                    <Button
                      type="text"
                      icon={<DeleteFilled style={{ color: "#ef4444" }} />}
                      onClick={cancelRecording}
                      style={{ padding: 0 }}
                    />
                  </Tooltip>
                </div>
              ) : isRecording ? (
                <div
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: isDarkMode ? "#1f1422" : "#fef2f2",
                    border: "1px solid #f87171",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                  onClick={stopRecording}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      boxShadow: "0 0 10px #ef4444",
                    }}
                  />
                  Recording... Click mic again to stop
                </div>
              ) : (
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    borderRadius: "20px",
                    background: isDarkMode ? "#121838" : "#f8fafc",
                    color: isDarkMode ? "#fff" : "#000",
                    border: isDarkMode
                      ? "1px solid #1e2652"
                      : "1px solid #cbd5e1",
                    padding: "6px 12px",
                    fontSize: "13px",
                  }}
                />
              )}

              {recordedAudioUrl ? (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined style={{ fontSize: "14px" }} />}
                  onClick={sendRecordedAudio}
                  style={{
                    background: "#10b981",
                    borderColor: "#10b981",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <>
                  <Tooltip
                    title={isRecording ? "Stop Recording" : "Record Voice"}
                  >
                    <Button
                      type="text"
                      style={{ padding: "0 6px" }}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            borderRadius: "2px",
                            backgroundColor: "#ef4444",
                            boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
                          }}
                        />
                      ) : (
                        <AudioOutlined
                          style={{ fontSize: "16px", color: "#94a3b8" }}
                        />
                      )}
                    </Button>
                  </Tooltip>

                  <Button
                    type="primary"
                    htmlType="submit"
                    shape="circle"
                    icon={<SendOutlined style={{ fontSize: "14px" }} />}
                    style={{
                      background: "#6366f1",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  />
                </>
              )}
            </form>
          </>
        ) : (
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>💬</div>
            <h3
              style={{
                color: isDarkMode ? "#fff" : "#0f172a",
                margin: 0,
                fontSize: "16px",
              }}
            >
              ClassNotes Student Chat
            </h3>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>
              Select a conversation to start messaging.
            </p>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      <Modal
        open={Boolean(previewPdfUrl)}
        onCancel={() => setPreviewPdfUrl(null)}
        footer={null}
        width={window.innerWidth < 1024 ? "95%" : 800}
        centered
        styles={{
          mask: {
            backdropFilter: "blur(6px)",
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.85)"
              : "rgba(15, 23, 42, 0.55)",
          },
          content: {
            backgroundColor: isDarkMode ? "#0c0d1e" : "#ffffff",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "16px",
          },
        }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: "24px",
            }}
          >
            <span
              style={{
                color: isDarkMode ? "#fff" : "#0f172a",
                fontSize: "14px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "60%",
              }}
            >
              {previewPdfTitle}
            </span>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadFile(previewPdfUrl, "ClassNotes-Document.pdf")}
              style={{ background: "#6366f1" }}
            >
              Download
            </Button>
          </div>
        }
      >
        <div
          style={{
            height: "60vh",
            width: "100%",
            marginTop: "12px",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          {previewPdfUrl && (
            <iframe
              src={previewPdfUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          )}
        </div>
      </Modal>

      {/* User Profile Preview Modal */}
      <Modal
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        centered
        width={440}
        styles={{
          mask: {
            backdropFilter: "blur(8px)",
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.82)"
              : "rgba(15, 23, 42, 0.5)",
          },
          content: {
            backgroundColor: isDarkMode ? "#0c0d1e" : "#ffffff",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "24px 20px",
            boxShadow: isDarkMode
              ? "0 20px 45px rgba(0,0,0,0.7)"
              : "0 12px 30px rgba(0,0,0,0.08)",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "104px",
              height: "104px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #6366f1",
              boxShadow: "0 8px 25px rgba(99, 102, 241, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDarkMode ? "#14182b" : "#e0e7ff",
              marginBottom: "14px",
            }}
          >
            {otherUserAvatar ? (
              <Image
                src={otherUserAvatar}
                alt="Profile"
                width={104}
                height={104}
                style={{ objectFit: "cover" }}
                preview={{
                  mask: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <EyeOutlined /> Full Photo
                    </div>
                  ),
                }}
              />
            ) : (
              <UserOutlined
                style={{
                  fontSize: "42px",
                  color: isDarkMode ? "#64748b" : "#6366f1",
                }}
              />
            )}
          </div>

          <h3
            style={{
              margin: "0 0 2px",
              color: isDarkMode ? "#f8fafc" : "#0f172a",
              fontSize: "19px",
              fontWeight: 700,
            }}
          >
            {otherParticipant?.name || "Student User"}
          </h3>
          <span
            style={{
              color: isDarkMode ? "#818cf8" : "#4f46e5",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "6px",
            }}
          >
            {otherParticipant?.agNumber || "Academic Student"}
          </span>

          <Tag
            color={isUserOnline ? "success" : "default"}
            style={{
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "11.5px",
              marginBottom: "18px",
            }}
          >
            ● {isUserOnline ? "Online Now" : "Offline"}
          </Tag>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                background: isDarkMode ? "#080816" : "#f8fafc",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "3px",
                }}
              >
                <MailOutlined /> Email Address
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: isDarkMode ? "#cbd5e1" : "#334155",
                  fontWeight: 500,
                  wordBreak: "break-all",
                }}
              >
                {otherParticipant?.email || "No email available"}
              </div>
            </div>

            <div
              style={{
                background: isDarkMode ? "#080816" : "#f8fafc",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "3px",
                }}
              >
                <IdcardOutlined /> AG Number
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: isDarkMode ? "#818cf8" : "#4f46e5",
                  fontWeight: 600,
                }}
              >
                {otherParticipant?.agNumber || "Not Assigned"}
              </div>
            </div>

            <div
              style={{
                background: isDarkMode ? "#080816" : "#f8fafc",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "3px",
                }}
              >
                <BookOutlined /> Enrolled Semester
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: isDarkMode ? "#818cf8" : "#4f46e5",
                  fontWeight: 600,
                }}
              >
                {otherParticipant?.semester || "Semester 1"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              width: "100%",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                background: isDarkMode ? "#14182b" : "#f1f5f9",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.06)"
                  : "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "11.5px",
                color: isDarkMode ? "#cbd5e1" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <CalendarOutlined style={{ color: "#6366f1" }} /> ClassNotes Peer
            </div>

            <div
              style={{
                background: isDarkMode ? "#14182b" : "#f1f5f9",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.06)"
                  : "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "11.5px",
                color: isDarkMode ? "#cbd5e1" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <UserOutlined style={{ color: "#6366f1" }} /> Verified Student
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;