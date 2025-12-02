import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';

interface ChatLogProps {
  logs: LogMessage[];
}

const ChatLog: React.FC<ChatLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 h-[300px] flex flex-col overflow-hidden">
      <div className="p-4 bg-gray-900 border-b border-gray-700">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Transcript</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 && (
            <div className="text-gray-600 text-center italic text-sm mt-10">
                Start a conversation to see the transcript here...
            </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
              log.role === 'user' 
                ? 'bg-cyan-900 text-cyan-100 rounded-br-none' 
                : 'bg-gray-700 text-gray-200 rounded-bl-none'
            }`}>
              <p>{log.text}</p>
              <span className="text-[10px] opacity-50 block mt-1 text-right">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatLog;