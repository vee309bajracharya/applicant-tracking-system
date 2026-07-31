import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import Spinner from "../ui/Spinner";
import { useFaqsQuery } from "../../hooks/useFaqs";
import { useStartConversationMutation, useSendChatMessageMutation } from "../../hooks/useChatbot";

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2" aria-live="polite" aria-label="Assistant is typing">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: `${i * 0.12}s` }}
      />
    ))}
  </div>
);

const ChatBubble = ({ sender, message }) => (
  <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}>
    <p
      className={`max-w-[80%] text-sm rounded-2xl px-3 py-2 whitespace-pre-line ${
        sender === "user"
          ? "bg-primary-blue text-white rounded-br-sm"
          : "bg-gray-100 dark:bg-dark-hover rounded-bl-sm"
      }`}
    >
      {message}
    </p>
  </div>
);

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  const { data: faqData } = useFaqsQuery({ page: 1 }, { enabled: isOpen && messages.length === 0 });
  const suggestedQuestions = (faqData?.data ?? []).slice(0, 4);

  const startMutation = useStartConversationMutation();
  const sendMutation = useSendChatMessageMutation();
  const isSending = startMutation.isPending || sendMutation.isPending;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const sendText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setMessages((prev) => [...prev, { sender: "user", message: trimmed }]);
    setDraft("");

    try {
      const { data } = conversationId
        ? await sendMutation.mutateAsync({ conversationId, message: trimmed })
        : await startMutation.mutateAsync(trimmed);

      const conversation = data.data;
      setConversationId(conversation.id);
      setMessages(conversation.messages.map((m) => ({ sender: m.sender, message: m.message })));
    } catch {
      // toast already handled inside the mutation hooks
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close FAQ assistant" : "Open FAQ assistant"}
        aria-expanded={isOpen}
        className="fixed bottom-8 right-5 z-40 w-12 h-12 rounded-full bg-primary-blue text-white shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-label="FAQ assistant"
            className="fixed bottom-20 right-5 z-40 w-[22rem] max-w-[calc(100vw-2.5rem)] h-[28rem] bg-white dark:bg-dark-overlay border border-gray-200 dark:border-dark-box-outline rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            <header className="px-4 py-3 border-b border-gray-200 dark:border-dark-box-outline">
              <h2 className="text-sm font-semibold">ATS Assistant</h2>
              <p className="text-xs text-gray-400">Ask about the hiring process, your application, and more.</p>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
              {messages.length === 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-400">Try one of these, or type your own question below.</p>
                  <ul className="flex flex-col gap-2">
                    {suggestedQuestions.map((faq) => (
                      <li key={faq.id}>
                        <button
                          type="button"
                          onClick={() => sendText(faq.question)}
                          className="text-left text-sm w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer"
                        >
                          {faq.question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                messages.map((m, i) => <ChatBubble key={i} sender={m.sender} message={m.message} />)
              )}
              {isSending && <TypingIndicator />}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendText(draft);
              }}
              className="p-3 border-t border-gray-200 dark:border-dark-box-outline flex items-center gap-2"
            >
              <label htmlFor="chatbot-input" className="sr-only">
                Type your question
              </label>
              <input
                id="chatbot-input"
                type="text"
                autoComplete="off"
                placeholder="Type a message..."
                className="inputbox flex-1"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                aria-label="Send message"
                className="p-2.5 rounded-lg bg-primary-blue text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? <Spinner size={16} /> : <Send size={16} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
