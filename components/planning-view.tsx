"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Brain, Eye, Lock, MessageSquare, Zap } from "lucide-react";
import { AIChatMessage } from "@/lib/types";
import { generateAIChatHistory } from "@/lib/data-simulation";

export default function PlanningView() {
  const [messages, setMessages] = useState<AIChatMessage[]>(
    generateAIChatHistory()
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReasoning, setShowReasoning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response with multiple steps
    const responses = [
      "Analyzing network topology...",
      "Querying available supply nodes...",
      "Calculating optimal routes using MeTTa Nodes...",
      "Evaluating risk factors and cost efficiency...",
      "Proposal ready: Supplier Y optimal. Route Risk: Low. Funds Required: 4500 PYUSD.",
    ];

    for (let i = 0; i < responses.length; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      const aiMessage: AIChatMessage = {
        id: `msg-${Date.now()}-${i}`,
        role: "assistant",
        content: responses[i],
        timestamp: new Date(),
        reasoning:
          i === responses.length - 1
            ? "Supplier Y selected based on proximity (12km), reliability score (94%), and cost efficiency. Route optimized using MeTTa node network to avoid conflict zones. Estimated delivery time: 3.2 hours."
            : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    }

    setIsTyping(false);
  };

  const handleApproveMission = () => {
    const newMessage: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content:
        "Mission approved and funds locked. New mission #044 added to Operations queue.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Planning Center</h1>
          <p className="text-slate-400 mt-1">
            Collaborate with autonomous AI agents to optimize humanitarian
            logistics
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <span>ASI:One AI Agent Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              AI Agent Collaboration
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.reasoning && (
                      <button
                        onClick={() =>
                          setShowReasoning(
                            showReasoning === message.id ? null : message.id
                          )
                        }
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View MeTTa Reasoning</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm">AI Agent thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Enter your planning request..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Reasoning Panel */}
        <div className="space-y-6">
          {showReasoning && (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>MeTTa Reasoning</span>
              </h3>
              <div className="text-sm text-slate-300 space-y-3">
                <p>{messages.find((m) => m.id === showReasoning)?.reasoning}</p>
              </div>
            </div>
          )}

          {/* Mission Approval Panel */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-400" />
              <span>Mission Control</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">
                  Proposed Mission
                </h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>Destination: Camp Beta</p>
                  <p>Supplier: Y (Optimal)</p>
                  <p>Route Risk: Low</p>
                  <p>Funds Required: $4,500 PYUSD</p>
                  <p>ETA: 3.2 hours</p>
                </div>
              </div>
              <button
                onClick={handleApproveMission}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Approve & Lock Funds</span>
              </button>
            </div>
          </div>

          {/* AI Status */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>AI Agent Status</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-green-400 font-mono">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MeTTa Nodes:</span>
                <span className="text-purple-400 font-mono">847 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Processing Power:</span>
                <span className="text-blue-400 font-mono">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Update:</span>
                <span className="text-slate-300 font-mono">2s ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
