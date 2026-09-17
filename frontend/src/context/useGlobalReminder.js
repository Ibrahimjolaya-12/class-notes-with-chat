import { useEffect } from "react";
import { notification } from "antd";
import axios from "axios";

const BACKEND_URL = "https://class-notes-backend.vercel.app";

const useGlobalReminder = () => {
  useEffect(() => {
    const checkGlobalTodos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BACKEND_URL}/api/todos/getAllTodos?status=all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          const todos = res.data.todos || res.data.data || [];
          const now = new Date();

          todos.forEach((todo) => {
            const status = (todo.status || "").toLowerCase();
            if (status === "completed" || status === "complete") return;

            if (todo.dueDate) {
              const dueDate = new Date(todo.dueDate);
              const isToday =
                dueDate.getDate() === now.getDate() &&
                dueDate.getMonth() === now.getMonth() &&
                dueDate.getFullYear() === now.getFullYear();

              if (isToday) {
                const notifKey = `todo-reminder-${todo._id}`;
                
                notification.warning({
                  key: notifKey,
                  message: `⏰ Task Due Today!`,
                  description: `Your task "${todo.title}" is due today. Please complete it on time!`,
                  placement: "topRight",
                  duration: 8,
                });
              }
            }
          });
        }
      } catch (err) {
        console.error("Global reminder error:", err);
      }
    };

    checkGlobalTodos();
    const intervalTime = 30 * 60 * 1000;
    const timer = setInterval(checkGlobalTodos, intervalTime);

    return () => clearInterval(timer);
  }, []);
};

export default useGlobalReminder;