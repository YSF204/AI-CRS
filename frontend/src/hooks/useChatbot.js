import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

export const useChatbot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cvsLoading, setCvsLoading] = useState(true);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! How can I help you today?",
      },
    ]);
    setCvsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (userText, cvId = null) => {
      if (!userText.trim()) return;

      const conversationMessages = messages.filter(
        (m) => m.role === "user" || m.role === "assistant"
      );

      const newMessages = [
        ...conversationMessages,
        { role: "user", content: userText },
      ];

      setMessages((prev) => [...prev, { role: "user", content: userText }]);
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.post("/chat", {
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          cvId,
          pathname: location.pathname,
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data.reply },
        ]);
      } catch {
        setError("Something went wrong, please try again.");
      } finally {
        setLoading(false);
      }
    },
    [messages, location.pathname]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! How can I help you today?",
      },
    ]);
  }, []);

  return {
    messages,
    loading,
    error,
    cvsLoading,
    sendMessage,
    clearChat,
  };
};