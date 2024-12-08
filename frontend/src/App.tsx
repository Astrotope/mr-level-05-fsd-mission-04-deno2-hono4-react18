import { ChatInterface } from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gray-400">
      <main className="flex-1 h-full">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 h-full">
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 h-full">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="max-w-2xl w-full">
                <div className="max-w-2xl mx-auto p-4 pb-0">
                  <div className="bg-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900">
                      AI Chat Assistant
                    </h1>
                  </div>
                </div>
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
