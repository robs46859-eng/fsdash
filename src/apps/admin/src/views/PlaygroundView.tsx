import React, { useCallback, useEffect, useState, useRef } from "react";
import { Send, Bot, User, Settings, Info, MessageSquare, Trash2, Cpu, Sparkles } from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Provider {
  id: string;
  name: string;
  display_name: string;
  enabled: boolean;
  models: string[];
}

interface ChatResponse {
  provider: string;
  model: string;
  content: string;
  usage: {
    prompt_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiCall<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) throw new Error(`No endpoint configured for ${path}`);
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...getOperatorAuthHeaders(),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(
      (data as { error?: { message?: string } } | undefined)?.error?.message ??
        `Request failed (HTTP ${response.status})`,
    );
  }
  return data as T;
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const PlaygroundView = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiCall<{ providers: Provider[] }>("/api/v1/providers")
      .then((data) => {
        const enabled = data.providers.filter((p) => p.enabled);
        setProviders(enabled);
        if (enabled.length > 0) {
          setSelectedProviderId(enabled[0].id);
          setSelectedModel(enabled[0].models[0] || "");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || !selectedProviderId || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userInput }
    ];
    
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);
    setError("");

    try {
      const payloadMessages = [
        { role: "system" as const, content: systemPrompt },
        ...newMessages
      ];

      const result = await apiCall<ChatResponse>("/api/v1/playground/chat", {
        method: "POST",
        body: {
          provider_id: selectedProviderId,
          model: selectedModel || null,
          messages: payloadMessages,
          temperature,
        },
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.content }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const activeProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden bg-surface">
      {/* Left: Chat Interface */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-outline-variant/15">
        <header className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-black">
              <MessageSquare size={16} />
            </div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-tight text-on-surface">
              Chat Session
            </h2>
          </div>
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
              <Sparkles size={48} strokeWidth={1} className="mb-4 text-primary" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                Ready for input
              </p>
              <p className="mt-2 max-w-xs text-xs leading-5">
                Configure your provider and model in the sidebar, then send a message to start testing.
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === "assistant" ? "bg-surface-container-low/50 -mx-6 px-6 py-6" : ""}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center border border-outline-variant/15 ${
                msg.role === "assistant" ? "bg-primary text-black" : "bg-surface-container-high text-on-surface"
              }`}>
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {msg.role === "assistant" ? "Assistant" : "User"}
                </p>
                <div className="text-sm leading-7 text-on-surface-variant whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 animate-pulse bg-surface-container-low/50 -mx-6 px-6 py-6">
              <div className="flex h-8 w-8 items-center justify-center bg-primary/40 text-black/40">
                <Bot size={16} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-2 w-20 bg-primary/20" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-surface-container-high" />
                  <div className="h-4 w-3/4 bg-surface-container-high" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border border-outline-variant/15 bg-surface-container-low p-4 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold uppercase tracking-wider">
                <Info size={14} />
                Error
              </div>
              {error}
            </div>
          )}
        </div>

        <footer className="border-t border-outline-variant/15 bg-surface-container-low p-6">
          <div className="flex gap-3">
            <textarea
              className="ds-input flex-1 min-h-[46px] max-h-40 resize-none py-3 text-sm"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !userInput.trim() || !selectedProviderId}
              className="flex h-[46px] w-[46px] items-center justify-center bg-primary text-black transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </footer>
      </div>

      {/* Right: Sidebar Configuration */}
      <div className="w-full lg:w-80 overflow-y-auto bg-surface p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Configuration</h3>
          </div>
          
          <div className="space-y-4 border-t border-outline-variant/15 pt-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Provider</label>
              <select
                className="ds-input text-xs"
                value={selectedProviderId}
                onChange={(e) => {
                  setSelectedProviderId(e.target.value);
                  const p = providers.find(p => p.id === e.target.value);
                  if (p) setSelectedModel(p.models[0] || "");
                }}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Model</label>
              <select
                className="ds-input text-xs"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {activeProvider?.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {(!activeProvider || activeProvider.models.length === 0) && (
                  <option value="">Default Provider Model</option>
                )}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Temperature</label>
                <span className="font-mono text-[10px] text-primary">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-container-high accent-primary appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">System Prompt</h3>
          </div>
          <textarea
            className="ds-input min-h-[160px] py-3 text-xs leading-5"
            placeholder="System instructions..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          <p className="text-[10px] leading-4 text-on-surface-variant italic">
            Instructions passed to the model to define its behavior and persona.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Usage Tips</h3>
          </div>
          <ul className="space-y-3 text-[10px] leading-5 text-on-surface-variant">
            <li>• Higher <strong>Temperature</strong> increases creativity and variance.</li>
            <li>• Multi-turn chat context is maintained until you click <strong>Clear</strong>.</li>
            <li>• Use the <strong>System Prompt</strong> to enforce output structure or constraints.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
