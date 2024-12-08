import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatApi, ChatMessage } from '../api/chatApi';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  const [messageType, setMessageType] = useState<'greeting' | 'question' | 'recommendation' | 'farewell' | null>(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  
  // Add ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start the chat when component mounts
  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      try {
        const response = await chatApi.startChat('');
        setMessageType(response.messageType || null);
        setMessages(response.history);
      } catch (error) {
        console.error('Error starting chat:', error);
        const errorMessage: ChatMessage = {
          role: 'model',
          parts: 'Sorry, there was an error starting the chat. Please refresh the page.',
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    startChat();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isConversationEnded) return;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: input.trim(),
    };

    console.log('Sending message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      // Only use continueChat if we're past the greeting and opt-in stage
      if (messages.length <= 1 || messageType === 'greeting') {
        console.log('Starting chat with:', userMessage.parts);
        response = await chatApi.startChat(userMessage.parts);
      } else {
        console.log('Continuing chat with:', userMessage.parts);
        console.log('Current history:', messages);
        response = await chatApi.continueChat(userMessage.parts, messages);
      }

      console.log('Received response:', response);
      console.log('Message type:', response.messageType);

      setMessageType(response.messageType || null);
      setMessages(response.history);

      // Handle different message types
      if (response.messageType === 'farewell') {
        console.log('Received farewell, ending conversation');
        setIsConversationEnded(true);
      } else if (response.messageType === 'recommendation') {
        console.log('Received recommendation, showing modal');
        setRecommendations(response.response); 
        setIsOpen(true);
        setIsConversationEnded(true);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: 'Sorry, there was an error processing your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    setMessages([]); // Reset messages before starting new chat
    setIsConversationEnded(false);
    setIsLoading(true);
    setMessageType(null);
    setRecommendations('');
    setInput('');
    setIsOpen(false);
    try {
      const response = await chatApi.startChat('');
      setMessageType(response.messageType || null);
      setMessages(response.history);
    } catch (error) {
      console.error('Error starting new chat:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: 'Sorry, there was an error starting a new chat. Please refresh the page.',
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-2xl mx-auto p-4 pt-0">

      {/* Chat messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-white rounded-lg shadow-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 font-semibold">T</span>
              </div>
            )}
            <div
              className={`max-w-sm rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <ReactMarkdown className="prose prose-sm">{message.parts}</ReactMarkdown>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 p-4 rounded-full bg-blue-100 flex items-center justify-center ml-2">
                <span className="text-blue-600 font-semibold">U</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center">
            <div className="w-8 h-8 p-4 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-blue-600 font-semibold">T</span>
            </div>
            <div className="bg-gray-100 text-gray-800 rounded-lg p-4 border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {/* Add div ref for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white rounded-lg shadow-sm border-t border-gray-100 h-[6rem]">
        {isConversationEnded ? (
          <button
            onClick={startNewChat}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Start New Chat
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Send
            </button>
          </form>
        )}
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Insurance Recommendations
                  </Dialog.Title>
                  <div className="mt-2">
                    <ReactMarkdown className="text-sm text-gray-500">
                      {recommendations}
                    </ReactMarkdown>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
