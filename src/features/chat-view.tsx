import { FormEvent, useContext, useMemo, useRef } from 'react';
import { StompClientParams, useStompClient } from '../hooks/stomp-client'
import { ChatContext, UpdateChatContext } from '../hooks/chat-context';
import { Chat, YourMessage, isYourMessage } from '../hooks/chat';
import {} from './chat-view.css';

export const ChatView = () => {
  const { messages } = useContext(ChatContext);
  const { addChat } = useContext(UpdateChatContext);

  const params = useMemo<StompClientParams>(() => ({
    callback: ({ id, response }) => addChat({
      id,
      type: 'other',
      message: response,
      timestamp: new Date(),
    }),
  }), [addChat]);
  const stompClientRef = useStompClient(params);

  const inputRef = useRef<HTMLInputElement>(null);

  const idRef = useRef(0);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query')?.toString() ?? '';

    idRef.current++;
    addChat({
      id: (idRef.current).toString(),
      type: 'mine',
      message: query,
      timestamp: new Date(),
    });
    stompClientRef.current?.publish({
      destination: '/pub/request',
      body: JSON.stringify({ id: `${idRef.current}-res`, query })
    });

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className='chat-section'>
      <ol className='chat-section__list chat-list'>
        {messages.map(chat => (
          <li
            key={chat.id ?? Math.random()}
            className={[
              'chat-list__item',
              isYourMessage(chat) ? 'chat-list__item--other' : 'chat-list__item--mine',
              'chat',
              isYourMessage(chat) ? 'chat--other' : 'chat--mine',
            ].join(' ')}>
            <ChatBubble chat={chat} />
          </li>
        ))}
      </ol>
      <form className='chat-input-form' onSubmit={handleSubmit}>
        <input className='chat-input-form__input' ref={inputRef} name='query' placeholder='Ask your FHIR!' />
        <button className='chat-input-form__button'>전송</button>
      </form>
    </section>
  );
};

function getDateTimeString(timestamp: Date) {
  const addTwoZeroPadding = (t: string | number) => t.toString().padStart(2, '0');
  const toDate = (timestamp: Date) => {
    const year = timestamp.getFullYear().toString();
    const month = addTwoZeroPadding(timestamp.getMonth() + 1);
    const date = addTwoZeroPadding(timestamp.getDate());
    return `${year}-${month}-${date}`;
  };

  const todaysMidnight = new Date(`${toDate(new Date())} 00:00:00`);
  const isOverADay = (+timestamp - +todaysMidnight) > 24 * 60 * 60 * 1000;
  const time = `${addTwoZeroPadding(timestamp.getHours())}:${addTwoZeroPadding(timestamp.getMinutes())}`;
  if (isOverADay) {
    return `${toDate(timestamp)} ${time}`;
  }
  return time;
}

interface ChatBubbleProps {
  chat: Chat;
}
const ChatBubble = ({ chat }: ChatBubbleProps) => {
  return isYourMessage(chat) ? (
    <YourChatBubble chat={chat} />
  ) : (
    <>
      <div className='chat__bubble chat__bubble--mine'>
        {chat.message}
      </div>
      <ChatTimestamp timestamp={chat.timestamp} />
    </>
  );
}

interface YourChatBubbleProps {
  chat: YourMessage;
}
const YourChatBubble = ({ chat }: YourChatBubbleProps) => {
  const handleClickOpenModalButton = () => {
    modalRef.current?.showModal();
  };
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className='chat__bubble chat__bubble--other'>
        {chat.message}
      </div>
      <div className='chat__side'>
        <button onClick={handleClickOpenModalButton}>Show Raw Chat</button>
        <ChatTimestamp timestamp={chat.timestamp} />
        <dialog ref={modalRef} className='chat__chat-modal'>
          <div className='chat__chat-modal-content'>{JSON.stringify(chat, undefined, 2)}</div>
        </dialog>
      </div>
    </>
  );
}

interface ChatTimestampProps {
  timestamp: Date;
}
const ChatTimestamp = ({ timestamp }: ChatTimestampProps) => {
  return (
    <time className='chat__datetime' title={timestamp.toLocaleString()}>
      {getDateTimeString(timestamp)}
    </time>
  );
};
