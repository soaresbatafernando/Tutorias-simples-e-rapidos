import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou o assistente virtual do Tutoria Fácil. Como posso ajudá-lo hoje? Pergunte sobre tecnologia, tutoriais ou dúvidas técnicas!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId,
      });
      
      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget" data-testid="chat-widget">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg animate-pulse-glow"
          data-testid="chat-toggle-btn"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div className="chat-container animate-fade-in" data-testid="chat-container">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#27272A] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-semibold text-white">Assistente IA</h3>
                <p className="text-xs text-[#A1A1AA]">Powered by Gemini</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-[#A1A1AA] hover:text-white"
              data-testid="chat-close-btn"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`chat-message-${index}`}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-ai"
                    }
                  >
                    {message.role === "assistant" ? (
                      <div className="markdown-content text-sm">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start" data-testid="chat-loading">
                  <div className="chat-bubble-ai flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#27272A]">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white placeholder:text-[#A1A1AA]"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                data-testid="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
