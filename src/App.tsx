import { FormEvent, useMemo, useState } from 'react';
import './App.css'
import { StompClientParams, useStompClient } from './hooks/stomp-client'
import { ChatContextProvider } from './hooks/chat-context';

function App() {

  return (
    <ChatContextProvider>
      <ChatView />
    </ChatContextProvider>
  )
}

export default App

const ChatView = () => {
  const params = useMemo<StompClientParams>(() => ({
    callback: r => setResponseMessage(r.response),
  }), []);
  const stompClientRef = useStompClient(params);

  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    stompClientRef.current?.publish({
      destination: '/pub/request',
      body: JSON.stringify({ "query": formData.get('query') })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <span>{responseMessage}</span>
      <br />
      <input name='query' />
      <button>전송</button>
    </form>
  );
};
