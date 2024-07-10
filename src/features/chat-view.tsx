import { FormEvent, useMemo, useState } from 'react';
import { StompClientParams, useStompClient } from '../hooks/stomp-client'

export const ChatView = () => {
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
