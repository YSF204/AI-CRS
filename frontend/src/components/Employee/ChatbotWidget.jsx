import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatbot } from "../../hooks/useChatbot";
import { useTheme } from "../../context/ThemeContext";

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
  const bottomRef = useRef(null);

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

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

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

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: colors.bg,
            }}
          >
            {cvsLoading ? (
              <div style={{ textAlign: "center", color: colors.mutedColor, marginTop: "40px" }}>
                Loading...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === "assistant" && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div
                        style={{
                          maxWidth: "85%",
                          padding: "10px 14px",
                          borderRadius: "14px 14px 14px 4px",
                          background: colors.aiBubble,
                          color: colors.aiText,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          fontFamily: "'Space Grotesk', sans-serif",
                          direction: getMsgDir(msg.content),
                          textAlign: getMsgAlign(msg.content),
                        }}
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(msg.content),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {msg.role === "user" && (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          maxWidth: "85%",
                          padding: "10px 14px",
                          borderRadius: "14px 14px 4px 14px",
                          background: colors.userBubble,
                          color: colors.userText,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          fontFamily: "'Space Grotesk', sans-serif",
                          direction: getMsgDir(msg.content),
                          textAlign: getMsgAlign(msg.content),
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 4px",
                    background: colors.aiBubble,
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#ffe630",
                        display: "inline-block",
                        animation: `bounce 1.2s ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: "12px" }}>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: `1px solid ${colors.border}`,
              background: colors.headerBg,
              borderRadius: "0 0 16px 16px",
              display: "flex",
              gap: "8px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              style={{
                flex: 1,
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                color: colors.inputText,
                padding: "8px 12px",
                fontSize: "13px",
                fontFamily: "'Space Grotesk', sans-serif",
                resize: "none",
                outline: "none",
                direction: inputDir,
                textAlign: inputDir === "rtl" ? "right" : "left",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                background: canSend ? "#ffe630" : colors.cardBg,
                border: "none",
                borderRadius: "8px",
                color: canSend ? "#0f0f0f" : colors.mutedColor,
                cursor: canSend ? "pointer" : "not-allowed",
                padding: "0 16px",
                fontWeight: 600,
                fontSize: "18px",
                transition: "all 0.15s",
              }}
            >
              ↑
            </button>
          </div>
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