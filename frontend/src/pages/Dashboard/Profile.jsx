// import { useState, useEffect } from "react";
// import {
//   Upload,
//   Select,
//   Input,
//   Button,
//   message,
//   Spin,
//   Image,
//   Grid,
// } from "antd";
// import {
//   UploadOutlined,
//   UserOutlined,
//   CalendarOutlined,
//   BookOutlined,
//   SaveOutlined,
//   EyeOutlined,
//   IdcardOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTheme } from "../../context/ThemeContext";

// const { useBreakpoint } = Grid;
// const BACKEND_URL = "https://class-notes-with-chat-production.up.railway.app";
// // const BACKEND_URL = "http://localhost:5000";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [imageUrl, setImageUrl] = useState("");

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [agNumber, setAgNumber] = useState("");
//   const [semester, setSemester] = useState("");

//   const screens = useBreakpoint();
//   const isMobile = !screens.sm;
//   const { isDarkMode } = useTheme();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         message.error("Please login first!");
//         return navigate("/auth/login");
//       }

//       try {
//         setFetching(true);
//         const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
//         setName(storedUser.name || "");
//         setEmail(storedUser.email || "");
//         setAgNumber(storedUser.agNumber || "Not Assigned");
//         setSemester(storedUser.semester || "Semester 1");

//         const res = await axios.get(`${BACKEND_URL}/api/avatar/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.data?.success && res.data?.avatar) {
//           setImageUrl(res.data.avatar);
//         }
//       } catch (err) {
//         console.error("Profile load error:", err);
//       } finally {
//         setFetching(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleImageSelect = (file) => {
//     if (file.size / 1024 / 1024 >= 2) {
//       message.error("Image must be smaller than 2MB!");
//       return false;
//     }
//     setSelectedFile(file);
//     setImageUrl(URL.createObjectURL(file));
//     return false;
//   };

//   const handleSaveChanges = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return navigate("/auth/login");

//     if (!name.trim()) {
//       return message.error("Name cannot be empty!");
//     }

//     try {
//       setLoading(true);
//       const headers = { Authorization: `Bearer ${token}` };

//       if (selectedFile) {
//         const data = new FormData();
//         data.append("avatar", selectedFile);
//         await axios.post(`${BACKEND_URL}/api/avatar/upload`, data, {
//           headers: {
//             ...headers,
//             "Content-Type": "multipart/form-data",
//           },
//         });
//       }

//       const profileRes = await axios.put(
//         `${BACKEND_URL}/api/avatar/update-profile`,
//         { name: name.trim(), semester },
//         { headers }
//       );

//       if (profileRes.data?.success) {
//         const updatedUserData = profileRes.data.user || {};
//         const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        
//         localStorage.setItem(
//           "user",
//           JSON.stringify({
//             ...storedUser,
//             name: updatedUserData.name || name,
//             semester: updatedUserData.semester || semester,
//           })
//         );

//         message.success("Profile updated successfully!");
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       console.error("Profile update error details:", err.response || err);
//       message.error(err.response?.data?.message || "Failed to update profile!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) {
//     return (
//       <div style={{ textAlign: "center", padding: "100px 0" }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         width: "100%",
//         minHeight: "calc(100vh - 120px)",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         padding: isMobile ? "16px 12px" : "32px 20px",
//         boxSizing: "border-box",
//       }}
//     >
//       <div style={{ width: "100%", maxWidth: "620px" }}>
//         <div style={{ marginBottom: "20px", textAlign: "left" }}>
//           <h2
//             style={{
//               color: isDarkMode ? "#ffffff" : "#0f172a",
//               fontSize: isMobile ? "20px" : "24px",
//               fontWeight: 700,
//               margin: 0,
//             }}
//           >
//             Profile Settings
//           </h2>
//           <p style={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
//             Manage your personal academic identity and avatar
//           </p>
//         </div>

//         <div
//           style={{
//             background: isDarkMode ? "#0c0d1e" : "#ffffff",
//             border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
//             borderRadius: "16px",
//             padding: isMobile ? "20px 16px" : "28px 26px",
//             boxShadow: isDarkMode ? "0 20px 40px rgba(0, 0, 0, 0.6)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
//             width: "100%",
//             boxSizing: "border-box",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               flexDirection: isMobile ? "column" : "row",
//               alignItems: "center",
//               gap: "20px",
//               borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
//               paddingBottom: "24px",
//               marginBottom: "24px",
//               textAlign: isMobile ? "center" : "left",
//             }}
//           >
//             <div
//               style={{
//                 width: "96px",
//                 height: "96px",
//                 borderRadius: "50%",
//                 overflow: "hidden",
//                 border: "2px solid #6366f1",
//                 boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: isDarkMode ? "#14182b" : "#e0e7ff",
//                 flexShrink: 0,
//               }}
//             >
//               {imageUrl ? (
//                 <Image
//                   src={imageUrl}
//                   alt="Profile"
//                   width={96}
//                   height={96}
//                   style={{ objectFit: "cover", cursor: "pointer" }}
//                 />
//               ) : (
//                 <UserOutlined style={{ fontSize: "36px", color: isDarkMode ? "#64748b" : "#6366f1" }} />
//               )}
//             </div>

//             <div style={{ flex: 1 }}>
//               <h4 style={{ margin: "0 0 2px", color: isDarkMode ? "#f8fafc" : "#0f172a", fontSize: "17px", fontWeight: 600 }}>
//                 {name || "User Name"}
//               </h4>
//               <span style={{ color: isDarkMode ? "#818cf8" : "#4f46e5", fontSize: "12.5px", display: "block", marginBottom: "12px", fontWeight: 500 }}>
//                 {agNumber}
//               </span>

//               <Upload showUploadList={false} beforeUpload={handleImageSelect} accept="image/*">
//                 <Button
//                   icon={<UploadOutlined />}
//                   size="small"
//                   style={{
//                     background: isDarkMode ? "rgba(99, 102, 241, 0.12)" : "#e0e7ff",
//                     borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "#c7d2fe",
//                     color: isDarkMode ? "#a5b4fc" : "#4338ca",
//                     borderRadius: "6px",
//                     fontWeight: 500,
//                   }}
//                 >
//                   {imageUrl ? "Change Picture" : "Upload Picture"}
//                 </Button>
//               </Upload>
//             </div>
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//             <div>
//               <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
//                 Email Address (Permanent)
//               </label>
//               <Input
//                 value={email}
//                 disabled
//                 size="large"
//                 style={{
//                   background: isDarkMode ? "#060712" : "#f1f5f9",
//                   color: isDarkMode ? "#64748b" : "#94a3b8",
//                 }}
//               />
//             </div>

//             <div>
//               <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
//                 AG Number (Read-only / Fixed at registration)
//               </label>
//               <Input
//                 value={agNumber}
//                 disabled
//                 size="large"
//                 prefix={<IdcardOutlined style={{ color: "#64748b" }} />}
//                 style={{
//                   background: isDarkMode ? "#060712" : "#f1f5f9",
//                   color: isDarkMode ? "#64748b" : "#94a3b8",
//                   cursor: "not-allowed",
//                 }}
//               />
//             </div>

//             <div>
//               <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
//                 Full Name
//               </label>
//               <Input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 size="large"
//                 placeholder="Enter full name"
//                 style={{
//                   background: isDarkMode ? "#080816" : "#ffffff",
//                   color: isDarkMode ? "#ffffff" : "#0f172a",
//                 }}
//               />
//             </div>

//             <div>
//               <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
//                 Current Semester
//               </label>
//               <Select
//                 value={semester}
//                 onChange={(val) => setSemester(val)}
//                 size="large"
//                 style={{ width: "100%" }}
//                 options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
//                   label: `Semester ${n}`,
//                   value: `Semester ${n}`,
//                 }))}
//               />
//             </div>
//           </div>

//           <Button
//             type="primary"
//             icon={<SaveOutlined />}
//             loading={loading}
//             onClick={handleSaveChanges}
//             block
//             size="large"
//             style={{
//               background: "#6366f1",
//               borderColor: "#6366f1",
//               fontWeight: 600,
//               height: isMobile ? "44px" : "48px",
//               borderRadius: "10px",
//               marginTop: "24px",
//               boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
//             }}
//           >
//             Save Changes
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;



import { useState, useEffect } from "react";
import {
  Upload,
  Select,
  Input,
  Button,
  message,
  Spin,
  Image,
  Grid,
  Switch,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  SaveOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const { useBreakpoint } = Grid;
const BACKEND_URL = "https://class-notes-with-chat-production.up.railway.app";
// const BACKEND_URL = "http://localhost:5000";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agNumber, setAgNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // 👈 Privacy State

  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Please login first!");
        return navigate("/auth/login");
      }

      try {
        setFetching(true);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setName(storedUser.name || "");
        setEmail(storedUser.email || "");
        setAgNumber(storedUser.agNumber || "Not Assigned");
        setSemester(storedUser.semester || "Semester 1");
        setIsPrivate(storedUser.isPrivate || false); // 👈 Load privacy state

        const res = await axios.get(`${BACKEND_URL}/api/avatar/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success && res.data?.avatar) {
          setImageUrl(res.data.avatar);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageSelect = (file) => {
    if (file.size / 1024 / 1024 >= 2) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }
    setSelectedFile(file);
    setImageUrl(URL.createObjectURL(file));
    return false;
  };

  const handlePrivacyChange = async (checked) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BACKEND_URL}/api/auth/update-privacy`,
        { isPrivate: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsPrivate(checked);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.isPrivate = checked;
        localStorage.setItem("user", JSON.stringify(storedUser));
        message.success(res.data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update privacy settings");
    }
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth/login");

    if (!name.trim()) {
      return message.error("Name cannot be empty!");
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (selectedFile) {
        const data = new FormData();
        data.append("avatar", selectedFile);
        await axios.post(`${BACKEND_URL}/api/avatar/upload`, data, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const profileRes = await axios.put(
        `${BACKEND_URL}/api/avatar/update-profile`,
        { name: name.trim(), semester },
        { headers }
      );

      if (profileRes.data?.success) {
        const updatedUserData = profileRes.data.user || {};
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: updatedUserData.name || name,
            semester: updatedUserData.semester || semester,
            isPrivate: isPrivate,
          })
        );

        message.success("Profile updated successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Profile update error details:", err.response || err);
      message.error(err.response?.data?.message || "Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: isMobile ? "16px 12px" : "32px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "620px" }}>
        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <h2
            style={{
              color: isDarkMode ? "#ffffff" : "#0f172a",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Profile Settings
          </h2>
          <p style={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
            Manage your personal academic identity and avatar
          </p>
        </div>

        <div
          style={{
            background: isDarkMode ? "#0c0d1e" : "#ffffff",
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: isMobile ? "20px 16px" : "28px 26px",
            boxShadow: isDarkMode ? "0 20px 40px rgba(0, 0, 0, 0.6)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              gap: "20px",
              borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #f1f5f9",
              paddingBottom: "24px",
              marginBottom: "24px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #6366f1",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDarkMode ? "#14182b" : "#e0e7ff",
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                />
              ) : (
                <UserOutlined style={{ fontSize: "36px", color: isDarkMode ? "#64748b" : "#6366f1" }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 2px", color: isDarkMode ? "#f8fafc" : "#0f172a", fontSize: "17px", fontWeight: 600 }}>
                {name || "User Name"}
              </h4>
              <span style={{ color: isDarkMode ? "#818cf8" : "#4f46e5", fontSize: "12.5px", display: "block", marginBottom: "12px", fontWeight: 500 }}>
                {agNumber}
              </span>

              <Upload showUploadList={false} beforeUpload={handleImageSelect} accept="image/*">
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  style={{
                    background: isDarkMode ? "rgba(99, 102, 241, 0.12)" : "#e0e7ff",
                    borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "#c7d2fe",
                    color: isDarkMode ? "#a5b4fc" : "#4338ca",
                    borderRadius: "6px",
                    fontWeight: 500,
                  }}
                >
                  {imageUrl ? "Change Picture" : "Upload Picture"}
                </Button>
              </Upload>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Email Address (Permanent)
              </label>
              <Input
                value={email}
                disabled
                size="large"
                style={{
                  background: isDarkMode ? "#060712" : "#f1f5f9",
                  color: isDarkMode ? "#64748b" : "#94a3b8",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                AG Number (Read-only / Fixed at registration)
              </label>
              <Input
                value={agNumber}
                disabled
                size="large"
                prefix={<IdcardOutlined style={{ color: "#64748b" }} />}
                style={{
                  background: isDarkMode ? "#060712" : "#f1f5f9",
                  color: isDarkMode ? "#64748b" : "#94a3b8",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="large"
                placeholder="Enter full name"
                style={{
                  background: isDarkMode ? "#080816" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#0f172a",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Current Semester
              </label>
              <Select
                value={semester}
                onChange={(val) => setSemester(val)}
                size="large"
                style={{ width: "100%" }}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
                  label: `Semester ${n}`,
                  value: `Semester ${n}`,
                }))}
              />
            </div>

            {/* 👇 Account Privacy Toggle Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "4px",
                padding: "12px 14px",
                background: isDarkMode ? "#14182b" : "#f8fafc",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LockOutlined style={{ fontSize: "18px", color: isDarkMode ? "#818cf8" : "#4f46e5" }} />
                <div>
                  <div style={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#0f172a", fontSize: "13.5px" }}>
                    Private Account
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    When active, other students cannot search or find you.
                  </div>
                </div>
              </div>
              <Switch checked={isPrivate} onChange={handlePrivacyChange} />
            </div>
          </div>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSaveChanges}
            block
            size="large"
            style={{
              background: "#6366f1",
              borderColor: "#6366f1",
              fontWeight: 600,
              height: isMobile ? "44px" : "48px",
              borderRadius: "10px",
              marginTop: "24px",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;