import { Button, Col, Form, Input, message, Row, Typography, Grid } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const BACKEND_URL = "https://class-notes-with-chat-production.up.railway.app";
// const BACKEND_URL = "https://class-notes-backend.vercel.app";
// const BACKEND_URL = "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { isDarkMode } = useTheme();

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const identifier = values.identifier?.trim();
      const sanitizedValues = {
        identifier,
        password: values.password,
      };
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        sanitizedValues,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        message.success(res.data.message || "Logged in Successfully");
        form.resetFields();
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message ||
          "Invalid credentials, please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px ${isDarkMode ? "#060713" : "#ffffff"} inset !important;
          -webkit-text-fill-color: ${isDarkMode ? "#ffffff" : "#0f172a"} !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: ${isDarkMode ? "#ffffff" : "#0f172a"};
        }
      `}</style>

      <Title
        level={3}
        className="auth-title"
        style={{
          margin: "0 0 4px",
          color: isDarkMode ? "#f8fafc" : "#0f172a",
          transition: "color 0.3s ease",
        }}
      >
        Welcome Back
      </Title>
      <p
        className="auth-subtitle"
        style={{
          color: isDarkMode ? "#94a3b8" : "#64748b",
          marginBottom: "24px",
          transition: "color 0.3s ease",
        }}
      >
        Sign in to your study hub
      </p>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={[0, 4]}>
          <Col span={24}>
            <Form.Item
              label={
                <span
                  style={{
                    color: isDarkMode ? "#cbd5e1" : "#334155",
                    fontWeight: 500,
                  }}
                >
                  Email or AG Number
                </span>
              }
              name="identifier"
              rules={[
                { required: true, message: "Please input your email or AG Number!" },
              ]}
            >
              <Input
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                prefix={
                  <UserOutlined
                    style={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                  />
                }
                placeholder="student@gmail.com or 2025AG7659"
                size="large"
                style={{
                  backgroundColor: isDarkMode ? "#060713" : "#ffffff",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.12)"
                    : "#cbd5e1",
                  color: isDarkMode ? "#ffffff" : "#0f172a",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={
                <span
                  style={{
                    color: isDarkMode ? "#cbd5e1" : "#334155",
                    fontWeight: 500,
                  }}
                >
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
              style={{ marginBottom: "8px" }}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                  />
                }
                placeholder="••••••••"
                size="large"
                style={{
                  backgroundColor: isDarkMode ? "#060713" : "#ffffff",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.12)"
                    : "#cbd5e1",
                  color: isDarkMode ? "#ffffff" : "#0f172a",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24} style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link
              to="../forgot-password"
              style={{
                color: isDarkMode ? "#818cf8" : "#4f46e5",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              Forgot password?
            </Link>
          </Col>

          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                background: "#6366f1",
                borderColor: "#6366f1",
                height: isMobile ? "42px" : "46px",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              }}
            >
              Sign In
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Login;