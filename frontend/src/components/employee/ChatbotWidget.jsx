import { useState } from "react";
import { useParams } from "react-router-dom";
import { useChatbot } from "../../hooks/useChatbot";
import { useTheme } from "../../context/ThemeContext";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { id: cvId } = useParams();
  const { theme } = useTheme();
  const {
    messages,
    loading,
    error,
    cvsLoading,
    sendMessage,
    clearChat,
  } = useChatbot();

  const colors = {
    bg:          'var(--card-bg)',
    border:      'var(--border-strong)',
    headerBg:    'var(--bg-alt)',
    titleColor:  'var(--color-text-primary)',
    mutedColor:  'var(--color-text-secondary)',
    aiBubble:    'var(--bg-alt)',
    aiText:      'var(--color-text-primary)',
    userBubble:  'var(--color-warning)',
    userText:    'var(--color-text-primary)',
    inputBg:     'var(--bg-alt)',
    inputText:   'var(--color-text-primary)',
    cardBg:      'var(--card-bg)',
    shadow:      'var(--shadow-lg)',
    floatShadow: '0 4px 20px rgba(200, 169, 126, 0.3)',
  };

  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input, cvId || null);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim() !== "" && !loading;

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^\d+\.\s/gm, "<br/>$&")
      .replace(/\n/g, "<br/>");
  };

  const getMsgDir = (content) => isArabic(content) ? "rtl" : "ltr";
  const getMsgAlign = (content) => isArabic(content) ? "right" : "left";
  const inputDir = isArabic(input) ? "rtl" : "ltr";

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            width: "360px",
            height: "520px",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            boxShadow: colors.shadow,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${colors.border}`,
              background: colors.headerBg,
              borderRadius: "16px 16px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: colors.titleColor,
                fontSize: "15px",
              }}
            >
              Career Coach
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={clearChat}
                style={{
                  background: "none",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "6px",
                  color: colors.mutedColor,
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "11px",
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.mutedColor,
                  cursor: "pointer",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          <ChatMessages
            messages={messages}
            loading={loading}
            error={error}
            cvsLoading={cvsLoading}
            colors={colors}
            formatMessage={formatMessage}
            getMsgDir={getMsgDir}
            getMsgAlign={getMsgAlign}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            handleKey={handleKey}
            handleSend={handleSend}
            canSend={canSend}
            colors={colors}
            inputDir={inputDir}
          />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: isOpen ? colors.cardBg : "#ffe630",
          border: `1px solid ${colors.border}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 9999,
          boxShadow: colors.floatShadow,
          transition: "all 0.2s",
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
