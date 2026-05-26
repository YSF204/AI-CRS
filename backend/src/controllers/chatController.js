import catchAsync from "../utils/catchAsync.js";
import { validateChatRequest } from "../services/chat/assistant/validateChatRequest.js";
import { respondToCandidateChat } from "../services/chat/assistant/respondToCandidateChat.js";

export const chat = catchAsync(async (req, res, next) => {
  const { messages, cvId, pathname } = req.body;
  validateChatRequest({ messages });

  const reply = await respondToCandidateChat({
    userId: req.user._id,
    messages,
    cvId,
    pathname,
  });

  res.status(200).json({
    success: true,
    data: { reply },
  });
});