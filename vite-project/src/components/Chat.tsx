import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { User, Share, Search } from 'lucide-react';

function Chat() {
  const [message, setMessage] = useState('');
  const [chats] = useState([
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'dbmgmwgmwm yw6 tnzlr',
    'yw6tn6t 4',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw',
    'flowflowmgmm fgmwgmw'
  ]);

  return (
    <div className="flex h-screen bg-[#1E1E1E]">
      {/* Sidebar */}
      <div className="w-64 bg-[#2C2C2C] text-white p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Previous Chats</h2>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {chats.map((chat, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 truncate hover:bg-[#3C3C3C] p-2 rounded cursor-pointer"
              >
                {chat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#2C2C2C] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Share className="w-5 h-5 text-gray-400" />
          </div>
          <User className="w-6 h-6 text-gray-400" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full">
            <h1 className="text-white text-2xl font-semibold mb-6 text-center">
              What can I help with?
            </h1>
            
            {/* Message Input */}
            <div className="relative mb-8">
              <Input
                placeholder="Ask here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-[#3C3C3C] text-white border-none rounded-lg py-3 pl-4 pr-12"
                style={{ height: '50px' }}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Share className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex justify-center gap-4">
              {['', '', '', ''].map((_, index) => (
                <Button
                  key={index}
                  className="w-24 h-12 bg-[#3C3C3C] border-none text-gray-400 hover:bg-[#4C4C4C] hover:text-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;