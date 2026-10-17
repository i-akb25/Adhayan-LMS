import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
export default function Mentor() {
  const [messages, setMessages] = useState([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (busy || !consent || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "You", text }]);
    setBusy(true);
    try {
      const r = await api.post("/ai/chat", { message: text });
      setMessages((m) => [...m, { role: "ADHAYAN", text: r.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "Service", text: e.message }]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-8">
      <section className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-black">AI Mentor</h1>
          <Link className="underline" to="/dashboard">
            Dashboard
          </Link>
        </header>
        <p className="text-slate-500">
          Ask for explanations, worked examples or revision help. Verify
          important answers against your course material.
        </p>
        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          I understand my question will be sent to the configured AI provider. I
          will not include private information.
        </label>
        <div role="log" aria-live="polite" className="space-y-4">
          {messages.map((m, i) => (
            <article
              key={i}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <h2 className="font-bold">{m.role}</h2>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </article>
          ))}
        </div>
        <form onSubmit={send} className="space-y-3">
          <label className="block">
            Your question
            <textarea
              required
              maxLength={6000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-950"
              rows={4}
            />
          </label>
          <button
            disabled={busy || !consent}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
          >
            {busy ? "Answering…" : "Send question"}
          </button>
          <button
            type="button"
            className="ml-4 underline"
            onClick={() => setMessages([])}
          >
            Clear chat
          </button>
        </form>
      </section>
    </main>
  );
}
