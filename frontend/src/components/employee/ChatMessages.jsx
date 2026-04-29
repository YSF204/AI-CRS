import { useRef, useEffect } from "react";

export default function ChatMessages({
  messages,
  loading,
  error,
  cvsLoading,
  colors,
  formatMessage,
  getMsgDir,
  getMsgAlign,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
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
  );
}
