import { useState, useEffect } from 'react';
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
        setRecommendations(response.response);
        setIsOpen(true);
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
    try {
      const response = await chatApi.startChat('');
      setMessageType(response.messageType || null);
      setMessages(response.history);
    } catch (error) {
      console.error('Error starting new chat:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: 'Sorry, there was an error starting the new chat. Please try again.',
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
    <div className="flex flex-col min-h-[90vh] max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <ReactMarkdown>{message.parts}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {isConversationEnded ? (
          <button
            onClick={startNewChat}
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start New Chat
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
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
