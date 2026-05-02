import { useMemo, useRef, useState } from 'react';

const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition placeholder:text-slate-600';

const starterPrompt = 'Analyze this swing and give me the top 1-2 things to work on next.';

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label}
        {hint && <span className="ml-1 text-slate-500 font-normal text-xs font-mono">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function waitForEvent(target, event) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(event, onEvent);
      target.removeEventListener('error', onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Could not read the video file.'));
    };
    target.addEventListener(event, onEvent, { once: true });
    target.addEventListener('error', onError, { once: true });
  });
}

async function extractSwingFrames(file) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  try {
    await waitForEvent(video, 'loadedmetadata');
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
    const sampleTimes = [0.08, 0.25, 0.45, 0.65, 0.85].map((ratio) => Math.min(duration * ratio, duration - 0.05));
    const canvas = document.createElement('canvas');
    const maxSide = 900;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext('2d');
    const frames = [];

    for (const time of sampleTimes) {
      video.currentTime = Math.max(0, time);
      await waitForEvent(video, 'seeked');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.72));
    }

    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function MarkdownLite({ text }) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const cleaned = line.replace(/^#+\s*/, '');
        const isList = /^[-*]\s+/.test(cleaned) || /^\d+\.\s+/.test(cleaned);
        return (
          <p key={`${line}-${index}`} className={`text-sm leading-relaxed ${isList ? 'pl-3 text-slate-300' : 'text-slate-200'}`}>
            {cleaned.replace(/^[-*]\s+/, '')}
          </p>
        );
      })}
    </div>
  );
}

export default function SwingAnalyzer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [frames, setFrames] = useState([]);
  const [club, setClub] = useState('Driver');
  const [view, setView] = useState('Down the line');
  const [miss, setMiss] = useState('');
  const [question, setQuestion] = useState(starterPrompt);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const canAnalyze = useMemo(() => frames.length > 0 && question.trim(), [frames, question]);

  async function handleVideo(file) {
    if (!file) return;
    setError('');
    setStatus('Reading swing video...');
    setFrames([]);
    setMessages([]);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));

    try {
      const nextFrames = await extractSwingFrames(file);
      setFrames(nextFrames);
      setStatus(`Ready: ${nextFrames.length} swing frames captured.`);
    } catch (nextError) {
      setError(nextError.message);
      setStatus('');
    }
  }

  async function askCoach(e) {
    e.preventDefault();
    if (!canAnalyze) return;

    const userMessage = question.trim();
    const nextMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(nextMessages);
    setQuestion('');
    setError('');
    setStatus('Coach is reviewing the swing...');

    try {
      const response = await fetch('/api/analyze-swing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames,
          context: { club, view, miss, question: userMessage },
          messages,
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Swing analysis failed.');

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
      setStatus('');
    } catch (nextError) {
      setError(nextError.message);
      setStatus('');
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Swing Analyzer</h1>
        <p className="text-sm text-slate-500 font-mono">Upload a swing video, get focused coaching feedback, then ask follow-ups.</p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <p className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest mb-2">Video</p>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleVideo(e.target.files?.[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>

          {videoUrl && (
            <video src={videoUrl} controls playsInline className="w-full rounded-xl border border-slate-800 bg-black" />
          )}

          {frames.length > 0 && (
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Captured Frames</p>
              <div className="grid grid-cols-5 gap-2">
                {frames.map((frame, index) => (
                  <img key={frame} src={frame} alt={`Swing frame ${index + 1}`} className="aspect-square object-cover rounded-lg border border-slate-800" />
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Club">
              <select value={club} onChange={(e) => setClub(e.target.value)} className={inputClass}>
                {['Driver', 'Fairway wood', 'Hybrid', 'Iron', 'Wedge'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="View">
              <select value={view} onChange={(e) => setView(e.target.value)} className={inputClass}>
                {['Down the line', 'Face on', 'Rear view', 'Unknown'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Miss" hint="optional">
              <input value={miss} onChange={(e) => setMiss(e.target.value)} placeholder="slice, pull, thin..." className={inputClass} />
            </Field>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Best filming setup</p>
            <p className="text-sm text-slate-400">Use down-the-line or face-on, camera steady, full body and club visible, normal speed video, good light.</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[620px]">
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest mb-4">Coach Chat</h2>

          <div className="flex-1 space-y-4 overflow-auto pr-1">
            {messages.length === 0 ? (
              <div className="text-sm text-slate-500 space-y-2">
                <p>Upload a swing, then ask for feedback.</p>
                <p>The coach will focus on one or two priorities and give a measurable practice drill.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-xl border p-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                    {message.role === 'user' ? 'You' : 'Coach'}
                  </p>
                  <MarkdownLite text={message.content} />
                </div>
              ))
            )}
          </div>

          {(status || error) && (
            <div className={`mt-4 rounded-lg border px-3 py-2 text-xs font-mono ${
              error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            }`}>
              {error || status}
            </div>
          )}

          <form onSubmit={askCoach} className="mt-4 space-y-3">
            <textarea
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask what to work on, why you slice it, or what drill fits this swing..."
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              disabled={!canAnalyze || Boolean(status)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              Analyze Swing
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
