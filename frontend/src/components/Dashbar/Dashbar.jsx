import { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  CheckSquareOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu, Grid, Button } from "antd";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import logo from "../../assets/book-icon.webp";
import Todos from "../../pages/Dashboard/Todos";
import Profile from "../../pages/Dashboard/Profile";
import axios from "axios";
import AIChat from "../../pages/Dashboard/AIChat";
import AIToolsHub from "../../pages/Dashboard/AIToolsHub";
import { useTheme } from "../../context/ThemeContext";
import Chat from "../../pages/Dashboard/Chat";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const Dashbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [navAvatar, setNavAvatar] = useState("");
  const { isDarkMode, toggleTheme } = useTheme();

  const screens = useBreakpoint();
  // md breakpoint check (true agar screen >= 768px ho)
  const isDesktop = screens.md;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const navItems = [
    { key: "/dashboard", icon: <HomeOutlined />, label: "Dashboard" },
    {
      key: "/dashboard/todos",
      icon: <CheckSquareOutlined />,
      label: "My Todos",
    },
    { key: "/dashboard/chat", icon: <MessageOutlined />, label: "AI Chat" },
    {
      key: "/dashboard/student-chat",
      icon: <WhatsAppOutlined />,
      label: "Student Chat",
    },
    {
      key: "/dashboard/aiToolsHub",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </svg>
      ),
      label: "AI Tools Hub",
    },
  ];

  const sidebarMenuItems = [
    {
      key: "grp-main",
      type: "group",
      label: collapsed ? null : (
        <span
          className="menu-group-title"
          style={{
            color: isDarkMode ? "#64748b" : "#94a3b8",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginLeft: "8px",
          }}
        >
          Main
        </span>
      ),
    },
    ...navItems,
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    navigate(key);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/todos")) return "/dashboard/todos";
    if (path.startsWith("/dashboard/chat")) return "/dashboard/chat";
    if (path.startsWith("/dashboard/student-chat"))
      return "/dashboard/student-chat";
    if (path.startsWith("/dashboard/aiToolsHub"))
      return "/dashboard/aiToolsHub";
    if (path.startsWith("/dashboard/profile")) return "/dashboard/profile";
    if (path.startsWith("/dashboard/new-subject") || path === "/dashboard")
      return "/dashboard";
    return path;
  };

  useEffect(() => {
    const fetchNavAvatar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          "https://class-notes-backend.vercel.app/api/avatar/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.success && res.data.avatar) {
          setNavAvatar(res.data.avatar);
        }
      } catch (err) {
        console.error("FETCH NAV AVATAR ERROR:", err);
      }
    };
    fetchNavAvatar();
  }, [location.pathname]);

  const currentKey = getSelectedKey();

  return (
    <Layout
      className="dashbar-layout"
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#02030d" : "#f8fafc",
      }}
    >
      {/* 1. Desktop & Tablet Sidebar (Mobile par display none) */}
      {isDesktop && (
        <Sider
          trigger={null}
          collapsible
          theme={isDarkMode ? "dark" : "light"}
          collapsed={collapsed}
          collapsedWidth={80}
          width={240}
          className="dashbar-sider"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: isDarkMode ? "#060713" : "#ffffff",
            borderRight: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid #e2e8f0",
            transition: "all 0.3s ease",
          }}
        >
          <Link to="/dashboard" className="text-center text-decoration-none">
            <div
              className={`sider-logo d-flex align-items-center gap-2 p-3 ${
                collapsed ? "justify-content-center" : ""
              }`}
            >
              <img
                src={logo}
                style={{ height: "30px", width: "auto" }}
                alt="ClassNotes Logo"
              />
              {!collapsed && (
                <span
                  className="fw-bold fs-5"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#0f172a",
                    transition: "color 0.3s ease",
                  }}
                >
                  ClassNotes
                </span>
              )}
            </div>
          </Link>

          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            selectedKeys={[currentKey]}
            onClick={handleMenuClick}
            items={sidebarMenuItems}
            style={{
              backgroundColor: "transparent",
              borderRight: "none",
            }}
          />
        </Sider>
      )}

      {/* 2. Main Screen Layout */}
      <Layout
        className="dashbar-main"
        style={{
          backgroundColor: isDarkMode ? "#02030d" : "#f8fafc",
          transition: "background-color 0.3s ease",
          minWidth: 0,
        }}
      >
        <Header
          className="dashbar-header d-flex align-items-center justify-content-between px-3 px-md-4 shadow-sm"
          style={{
            background: isDarkMode ? "#090b14" : "#ffffff",
            borderBottom: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid #e2e8f0",
            height: "64px",
            transition: "all 0.3s ease",
          }}
        >
          <div>
            {isDesktop ? (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: isDarkMode ? "#ffffff" : "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "6px",
                  transition: "color 0.2s ease",
                }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            ) : (
              /* Mobile Header Logo */
              <Link
                to="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <img
                  src={logo}
                  style={{ height: "26px", width: "auto" }}
                  alt="Logo"
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: isDarkMode ? "#fff" : "#0f172a",
                  }}
                >
                  ClassNotes
                </span>
              </Link>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="d-flex align-items-center gap-3">
            <Button
              type="default"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              icon={
                isDarkMode ? (
                  <SunOutlined style={{ color: "#ffdb9e", fontSize: "17px" }} />
                ) : (
                  <MoonOutlined
                    style={{ color: "#4f46e5", fontSize: "17px" }}
                  />
                )
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#1e1b4b" : "#e0e7ff",
                borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : "#c7d2fe",
                cursor: "pointer",
                boxShadow: "none",
                transition: "all 0.3s ease",
              }}
            />

            {/* Profile Dropdown */}
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => (
                <div
                  style={{
                    backgroundColor: isDarkMode ? "#090b14" : "#ffffff",
                    borderRadius: "8px",
                    padding: "6px",
                    boxShadow: isDarkMode
                      ? "0 4px 16px rgba(0,0,0,0.5)"
                      : "0 4px 16px rgba(0,0,0,0.08)",
                    minWidth: "150px",
                    border: isDarkMode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #e2e8f0",
                  }}
                >
                  <div
                    onClick={() => navigate("/dashboard/profile")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isDarkMode
                        ? "#13172e"
                        : "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <UserOutlined />
                    <span>Profile</span>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "#e2e8f0",
                      margin: "6px 0",
                    }}
                  />

                  <div
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      color: "#ef4444",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isDarkMode
                        ? "#2a1215"
                        : "#fee2e2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <LogoutOutlined />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            >
              <Avatar
                size="default"
                src={navAvatar || undefined}
                icon={!navAvatar && <UserOutlined />}
                style={{
                  backgroundColor: navAvatar
                    ? "transparent"
                    : isDarkMode
                      ? "#334155"
                      : "#e2e8f0",
                  color: isDarkMode ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  border: navAvatar
                    ? "2px solid #6366f1"
                    : isDarkMode
                      ? "1px solid rgba(255,255,255,0.2)"
                      : "1px solid #cbd5e1",
                }}
              />
            </Dropdown>
          </div>
        </Header>

        {/* Content View: Mobile par bottom nav bar ki jagah chhorne ke liye padding-bottom di gayi hai */}
        <Content
  className="dashbar-content p-2 p-md-4"
  style={{
    backgroundColor: isDarkMode ? "#02030d" : "#f8fafc",
    minHeight: "calc(100vh - 64px)",
    // 👇 Chat pages ke ilawa baki sab pages par mobile me 85px bottom padding
    paddingBottom: !isDesktop 
      ? (location.pathname.includes("chat") ? "0px" : "85px") 
      : "16px",
    padding: !isDesktop && location.pathname.includes("chat") ? "6px" : undefined,
    transition: "background-color 0.3s ease",
    overflowX: "hidden",
  }}
>
          <Routes>
            <Route path="todos/*" element={<Todos />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="student-chat" element={<Chat />} />
            <Route path="aiToolsHub" element={<AIToolsHub />} />
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </Content>

        {/* 3. Modern Instagram/Facebook Style Mobile Bottom Navigation Bar */}
        {!isDesktop && (
          <nav
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              backgroundColor: isDarkMode
                ? "rgba(9, 11, 20, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderTop: isDarkMode
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              zIndex: 1000,
              padding: "0 8px",
            }}
          >
            {navItems.map((item) => {
              const isActive = currentKey === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    cursor: "pointer",
                    padding: "6px 0",
                    color: isActive
                      ? "#6366f1"
                      : isDarkMode
                        ? "#94a3b8"
                        : "#64748b",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      marginTop: "3px",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        )}
      </Layout>
    </Layout>
  );
};

export default Dashbar;
