import { PropsWithChildren, createContext, useCallback, useState } from "react";
import { Chat } from "./chat";

interface ChatContextType {
  messages: Chat[];
}

interface UpdateChatContextType {
  addChat(chat: Chat): void;
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
});
export const UpdateChatContext = createContext<UpdateChatContextType>({
  addChat() {},
});

export const ChatContextProvider = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<Chat[]>([]);

  const addChat = useCallback((chat: Chat) => {
    setMessages(prev => {
      const index = prev.findIndex(chat_ => chat_.id === chat.id);
      if (index < 0) {
        return [...prev, chat];
      }
      return prev.map(chat_ => chat_.id === chat.id ? { ...chat_, ...chat } : chat_);
    });
  }, []);

  return (
    <ChatContext.Provider value={{ messages }}>
      <UpdateChatContext.Provider value={{ addChat }}>
        {children}
      </UpdateChatContext.Provider>
    </ChatContext.Provider>
  )
};
