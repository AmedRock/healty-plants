import React from 'react';
import Topbar from './components/Topbar';
import ChatLayout from './components/Chat/ChatLayout';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Topbar />
      <main className="flex-grow flex flex-col">
        <ChatLayout />
      </main>
    </div>
  );
}

export default App;
