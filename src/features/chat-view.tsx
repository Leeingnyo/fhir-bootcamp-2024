import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StompClientParams, useStompClient, Response, ChatHistory } from '../hooks/stomp-client'
import { ChatContext, UpdateChatContext } from '../hooks/chat-context';
import { Chat, YourMessage, isYourMessage } from '../hooks/chat';
import './chat-view.css';
import { KeepMeInScreen } from '../components/KeepMeInScreen';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import ReactJson from 'react-json-view';
import { ChatLineChart } from '../components/LineChart';

export const ChatView = () => {
  const { messages } = useContext(ChatContext);
  const { addChat } = useContext(UpdateChatContext);

  const [isLoading, setIsLoading] = useState(false);
  const params = useMemo<StompClientParams>(() => ({
    callback: (response: Response) => {
      const { id } = response;
      if (response.type === 'TEXT') {
        addChat({
          id,
          type: 'other',
          message: response.response,
          timestamp: new Date(),
        });
      } else if (response.type === 'FHIR') {
        addChat({
          id,
          type: 'other',
          fhir: JSON.parse(response.content),
          timestamp: new Date(),
        });
      } else if (response.type === 'LINE_CHART') {
        const { id, type, ...lineChart } = response;
        type;
        addChat({
          id,
          type: 'other',
          lineChart: [lineChart],
          timestamp: new Date(),
        })
      } else if (response.type === 'EVENT') {
        addChat({
          id,
          type: 'other',
          term: [response.content],
          timestamp: new Date(),
        });
      } else if (response.type === 'DONE_EVENT') {
        setIsLoading(false);
      }
    }
  }), [addChat]);
  const stompClientRef = useStompClient(params);

  const inputRef = useRef<HTMLInputElement>(null);

  const histories = useMemo<ChatHistory[]>(() => (
    messages.map(chat => ({
      messageType: chat.type === 'other' ? 'Assistant' : 'User',
      content: chat.message ?? '',
    }))
  ), [messages]);
  const [uid] = useState(Math.random().toFixed(8));
  const idRef = useRef(0);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isLoading) return;
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query')?.toString() ?? '';

    idRef.current++;
    addChat({
      id: `${uid}:${idRef.current}`,
      type: 'mine',
      message: query,
      timestamp: new Date(),
    });
    stompClientRef.current?.publish({
      destination: '/pub/request',
      body: JSON.stringify({ id: `${uid}:${idRef.current}-res`, query, history: histories })
    });
    setIsLoading(true);

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className='chat-section'>
      <ol className='chat-section__list chat-list'>
        {messages.length === 0 && (
          <span>궁금한 것을 물어보세요! Ask your FHIR!</span>
        )}
        {messages.map(chat => (
          <li
            key={chat.id ?? Math.random()}
            className={[
              'chat-list__item',
              isYourMessage(chat) ? 'chat-list__item--other' : 'chat-list__item--mine',
              'chat',
              isYourMessage(chat) ? 'chat--other' : 'chat--mine',
            ].join(' ')}>
            <ChatBubble chat={chat} isLoading={isLoading} />
          </li>
        ))}
      </ol>
      <form className='chat-input-form' onSubmit={handleSubmit}>
        <input className='chat-input-form__input' ref={inputRef} name='query' placeholder='Ask your FHIR!' />
        <button className='chat-input-form__button' disabled={isLoading}>
          {isLoading ? <span className="mini-loader"></span> : <>전송</>}
        </button>
      </form>
      <KeepMeInScreen />
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
  isLoading: boolean;
}
const ChatBubble = ({ chat, isLoading }: ChatBubbleProps) => {
  return isYourMessage(chat) ? (
    <YourChatBubble chat={chat} isLoading={isLoading} />
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
  isLoading: boolean;
}
const YourChatBubble = ({ chat, isLoading }: YourChatBubbleProps) => {
  const handleClickOpenModalButton = () => {
    modalRef.current?.showModal();
  };
  const modalRef = useRef<HTMLDialogElement>(null);

  const maxValue = chat.message?.length ?? 0;
  const [currentIndex, setCurrentIndex] = useState(0);

  const isSameLength = maxValue === currentIndex;
  useEffect(() => {
    if (isSameLength) return;

    const timeout = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
    }, 16);

    return () => {
      clearInterval(timeout);
    };
  }, [isSameLength]);

  return (
    <>
      <div className='chat__bubble chat__bubble--other'>
        {chat.term && chat.term.length > 0 && (
          <>
            {chat.term.map((term, index) => <div key={index}>{term}</div>)}
            <hr />
          </>
        )}
        <Markdown remarkPlugins={[remarkGfm]}>{chat.message?.slice(0, currentIndex)}</Markdown>
        {chat.lineChart && chat.lineChart.length > 0 && (
          chat.lineChart.length === 1 ? (
            <ChatLineChart lineChart={chat.lineChart[0]} />
          ) : (
            <>
              <br />
              <details>
                <summary>Show Graphs</summary>
                {chat.lineChart.map((lineChart, index, charts) => {
                  const startIndex = charts.slice(0, index).reduce((count, chart) => count + chart.values.length, 0);
                  return <ChatLineChart key={index} lineChart={lineChart} colorStartIndex={startIndex} />
                })}
              </details>
            </>
          )
        )}
        {(isLoading || !isSameLength) && <span className="loader"></span>}
      </div>
      <div className='chat__side'>
        <button onClick={handleClickOpenModalButton}>Show Raw Chat</button>
        <ChatTimestamp timestamp={chat.timestamp} />
        <dialog ref={modalRef} className='chat__chat-modal'>
          <ReactJson
            src={chat}
            shouldCollapse={({ src, namespace }) => namespace.length > 1 && JSON.stringify(src).length > 500}
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
          />
          <hr />
          <details>
            <summary tabIndex={-1}>View Raw String</summary>
            <div className='chat__raw-chat'>{JSON.stringify(chat, undefined, 2)}</div>
          </details>
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
