import './App.css'
import { ChatView } from './features/chat-view';
import { ChatContextProvider } from './hooks/chat-context';

function App() {

  return (
    <ChatContextProvider>
      <ChatView />
    </ChatContextProvider>
  )
}

export default App
