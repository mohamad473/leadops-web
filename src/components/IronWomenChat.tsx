'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { BotButton } from '@/lib/types';

type Msg = { id: number; from: 'me' | 'bot'; text: string; buttons?: BotButton[]; used?: boolean; error?: boolean };

const COMMANDS: { cmd: string; label: string }[] = [
  { cmd: '/summary', label: '/summary' },
  { cmd: '/report', label: '/report' },
  { cmd: '/run', label: '/run' },
  { cmd: '/newcampaign', label: '/newcampaign' },
  { cmd: '/pause', label: '/pause' },
  { cmd: '/help', label: '/help' }
];

let seq = 0;

/**
 * Talks to IronWomen through /api/bot. Same commands, questions and buttons as in Telegram;
 * every action is checked by the bot router with your owner role.
 */
export function IronWomenChat({
  initial,
  showCommands = true,
  placeholder = 'Ask IronWomen anything, or type a command…',
  compact = false
}: {
  initial?: string;
  showCommands?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const inputId = useId();

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(payload: { text?: string; callback_data?: string }, shown: string) {
    if (busy) return;
    setBusy(true);
    setMessages((m) => [...m, { id: ++seq, from: 'me', text: shown }]);
    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      const reply = json.reply as { text: string; buttons: BotButton[] };
      setMessages((m) => [
        ...m,
        { id: ++seq, from: 'bot', text: reply.text || 'Done.', buttons: reply.buttons?.length ? reply.buttons : undefined }
      ]);
    } catch (err) {
      setMessages((m) => [...m, { id: ++seq, from: 'bot', text: (err as Error).message, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initial && !started.current) {
      started.current = true;
      void send({ text: initial }, initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function press(msgId: number, b: BotButton) {
    setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, used: true } : x)));
    void send({ callback_data: b.callback_data }, b.text);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send({ text }, text);
  }

  return (
    <div className="chat">
      {showCommands ? (
        <div className="cmds" aria-label="Quick commands">
          {COMMANDS.map((c) => (
            <button key={c.cmd} type="button" className="btn btn-sm cmd" disabled={busy} onClick={() => send({ text: c.cmd }, c.cmd)}>
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
      {messages.length || busy ? (
        <div className="chat-log" ref={logRef} style={compact ? { maxHeight: 320 } : undefined} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.from}`} style={m.error ? { borderColor: '#fca5a5', color: 'var(--red)' } : undefined}>
              {m.text}
              {m.buttons && !m.used ? (
                <div className="msg-btns">
                  {m.buttons.map((b) => (
                    <button key={b.callback_data} type="button" className="btn btn-sm" disabled={busy} onClick={() => press(m.id, b)}>
                      {b.text}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {busy ? <div className="msg bot muted">IronWomen is thinking…</div> : null}
        </div>
      ) : null}
      <form className="chat-form" onSubmit={submit}>
        <label htmlFor={inputId} style={{ position: 'absolute', left: -9999 }}>
          Message IronWomen
        </label>
        <input
          id={inputId}
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          maxLength={2000}
          autoComplete="off"
        />
        <button className="btn btn-dark" type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
