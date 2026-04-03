// components/TerminalLog.tsx
import React from 'react';

export default function TerminalLog({ logs }: { logs: string[] }) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs h-40 overflow-y-auto mt-6">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            <span className="text-green-500 font-bold mr-2">➜</span>
            <span className="text-gray-300">{log}</span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-gray-600 italic">Waiting for action...</span>}
      </div>
    );
}