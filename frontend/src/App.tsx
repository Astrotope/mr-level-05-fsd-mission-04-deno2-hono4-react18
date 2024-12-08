import { ChatInterface } from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="flex-1 h-full">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 h-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="max-w-2xl w-full h-full">
                <div className="max-w-2xl mx-auto p-4 pb-0 h-[6rem]">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">T</span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Tina
                      </h1>
                      <p className="text-gray-600 text-sm">Your AI Insurance Policy Assistant</p>
                    </div>
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
