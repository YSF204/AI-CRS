export default function ChatInput({
  input,
  setInput,
  handleKey,
  handleSend,
  canSend,
  colors,
  inputDir,
}) {
  return (
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
  );
}
