import React from 'react';
import { Bot, Send } from 'lucide-react';

export const Chat: React.FC = () => {
  return (
    <div id="chat-page" className="flex flex-col h-[calc(100vh-140px)]">
      <div id="chat-header" className="p-3 bg-white border border-slate-200 rounded-xl mb-3 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 id="chat-title" className="font-bold text-slate-900 text-sm">ជំនួយការ AI</h2>
          <p id="chat-subtitle" className="text-slate-500 text-xs">សួរសំណួរអំពីស្តុកទំនិញ និងហិរញ្ញវត្ថុ</p>
        </div>
      </div>

      <div id="chat-messages" className="flex-1 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto space-y-3">
        <div className="bg-slate-100 p-3 rounded-xl max-w-[85%] text-xs text-slate-800">
          សួស្តី! ខ្ញុំជាជំនួយការ AI របស់ <span className="font-bokor font-bold text-sm">What You Need?</span> តើខ្ញុំអាចជួយអ្វីអ្នកបានខ្លះថ្ងៃនេះ?
        </div>
      </div>

      <div id="chat-input-container" className="mt-3 flex items-center gap-2">
        <input
          id="chat-input"
          type="text"
          placeholder="វាយបញ្ចូលសារ..."
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
        <button
          id="chat-send-btn"
          type="button"
          aria-label="Send Message"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
