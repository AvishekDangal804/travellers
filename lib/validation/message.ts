import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  content: z.string().trim().min(1, "Message cannot be empty").max(4000),
}).refine((data) => Boolean(data.conversationId) || Boolean(data.recipientId), {
  message: "Provide a conversation or a recipient",
  path: ["conversationId"],
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
