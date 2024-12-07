import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (messages.length === 0) {
        response = await chatApi.startChat(userMessage.content);
      } else {
        response = await chatApi.continueChat(messages, userMessage.content);
      }
      
      // Parse the response if it's a string
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      const messageContent = parsedResponse?.response || 'No response received';

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: messageContent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (isLoading || messages.length === 0) return;

    setIsLoading(true);
    try {
      const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await chatApi.getRecommendations(context);
      
      // Parse the response if it's a string
      const parsedRecommendations = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Get the actual recommendations text from the nested structure
      const recommendationsContent = parsedRecommendations?.recommendations || 'No recommendations received';
      
      setRecommendations(recommendationsContent);
      setIsOpen(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="w-full">
          <div className="space-y-4 mb-4 h-[calc(100vh-400px)] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-gray-100 mr-auto max-w-[80%]'
                }`}
              >
                <p className="text-sm text-gray-800">{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>

          <button
            onClick={handleGetRecommendations}
            disabled={isLoading || messages.length === 0}
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Get Recommendations
          </button>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                    Recommendations
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="prose text-sm text-gray-500">
                      <ReactMarkdown>{recommendations}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
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
