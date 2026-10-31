'use client';

import { useState } from 'react';
import { IronWomenChat } from './IronWomenChat';

/** A button that sends one IronWomen command and shows the reply (with any confirm buttons) right below. */
export function BotAction({
  label,
  command,
  variant = 'default'
}: {
  label: string;
  command: string;
  variant?: 'default' | 'primary' | 'dark' | 'danger';
}) {
  const [open, setOpen] = useState(false);
  const [run, setRun] = useState(0);
  const cls = variant === 'primary' ? 'btn btn-primary' : variant === 'dark' ? 'btn btn-dark' : variant === 'danger' ? 'btn btn-danger' : 'btn';
  return (
    <>
      <button
        type="button"
        className={cls}
        onClick={() => {
          setOpen(true);
          setRun((r) => r + 1);
        }}
      >
        {label}
      </button>
      {open ? (
        <div className="card" style={{ flexBasis: '100%', padding: 16, gap: 8 }}>
          <div className="card-head">
            <span className="small muted">IronWomen · {command}</span>
            <button type="button" className="btn btn-sm" onClick={() => setOpen(false)} aria-label="Close">
              Close
            </button>
          </div>
          <IronWomenChat key={run} initial={command} showCommands={false} compact placeholder="Reply to IronWomen…" />
        </div>
      ) : null}
    </>
  );
}
