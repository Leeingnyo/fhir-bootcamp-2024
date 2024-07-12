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
        if (chat.type === 'mine') {
          return [...prev, chat];
        }
        const [myIndex] = chat.id.split('-res'); // TODO: fix
        const questionIndex = prev.findIndex(chat_ => chat_.id === myIndex);
        if (questionIndex < 0) return prev;
        return [...prev.slice(0, questionIndex + 1), chat, ...prev.slice(questionIndex + 1)];
      }
      return prev.map(oldChat => {
        if (oldChat.id !== chat.id) return oldChat;

        return {
          ...oldChat,
          ...chat,
          term: (oldChat.term ?? []).concat(chat.term ?? []),
          lineChart: (oldChat.lineChart ?? []).concat(chat.lineChart ?? []),
        };
      });
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
