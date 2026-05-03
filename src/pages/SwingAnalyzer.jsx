import { useMemo, useRef, useState } from 'react';

const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition placeholder:text-slate-600';

const missOptions = ['Slice / fade too much', 'Hook / draw too much', 'Pull', 'Push', 'Thin', 'Chunk', 'Inconsistent contact'];
const contactOptions = ['Solid', 'Thin', 'Chunk', 'Toe', 'Heel', 'Mixed'];
const startOptions = ['On target', 'Starts right', 'Starts left', 'Mixed'];
const curveOptions = ['Straight', 'Curves right', 'Curves left', 'Mixed'];
const balanceOptions = ['Balanced finish', 'Falls back', 'Falls toward toes', 'Falls toward heels', 'Rushed finish'];
const tempoOptions = ['Smooth', 'Too quick from the top', 'Too slow / steering it', 'Unsure'];

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

function buildSwingReview({ club, miss, contact, startLine, curve, balance, tempo }) {
  const priorities = [];
  const drills = [];

  if (miss.includes('Slice') || curve === 'Curves right') {
    priorities.push({
      title: 'Face control before path changes',
      detail: 'A ball curving right usually means the clubface is open to the swing path. Start with face awareness before chasing a full swing rebuild.',
    });
    drills.push({
      title: 'Nine Ball Start-Line Gate',
      goal: 'Hit 9 balls through a small start gate. Goal: 6 start online before caring about curve.',
    });
  }

  if (miss.includes('Hook') || curve === 'Curves left') {
    priorities.push({
      title: 'Neutralize the face and finish balanced',
      detail: 'A strong left curve often comes from the face closing too much or the body stalling while the hands keep going.',
    });
    drills.push({
      title: 'Hold-Off Finish',
      goal: 'Hit 10 smooth shots with a quiet release. Goal: 7 finish right of your usual left miss.',
    });
  }

  if (miss === 'Pull' || startLine === 'Starts left') {
    priorities.push({
      title: 'Check alignment and shoulder line',
      detail: 'Pulls often start with the body aimed left or shoulders open. Use the video frames to compare feet, hips, and shoulders to the target line.',
    });
    drills.push({
      title: 'Alignment Station',
      goal: 'Hit 12 balls with an alignment stick or club on the ground. Goal: 8 start within your target window.',
    });
  }

  if (miss === 'Push' || startLine === 'Starts right') {
    priorities.push({
      title: 'Get the body turning through impact',
      detail: 'Pushes can show up when the club gets stuck behind you or the chest stops rotating through the ball.',
    });
    drills.push({
      title: 'Step-Through Swings',
      goal: 'Hit 10 half-speed shots stepping toward the target after impact. Goal: 7 start closer to target.',
    });
  }

  if (['Thin', 'Chunk', 'Toe', 'Heel', 'Mixed'].includes(contact) || ['Thin', 'Chunk', 'Inconsistent contact'].includes(miss)) {
    priorities.push({
      title: 'Own low point and strike first',
      detail: 'Contact issues usually improve fastest by controlling where the club bottoms out. Keep the swing smaller until strike gets predictable.',
    });
    drills.push({
      title: 'Line Drill',
      goal: 'Draw a line or pick a blade of grass. Hit 15 swings brushing the turf after the line. Goal: 10 clean low points.',
    });
  }

  if (balance !== 'Balanced finish') {
    priorities.push({
      title: 'Finish in balance',
      detail: 'Balance problems are a useful clue that speed, pressure shift, or posture is getting away from you.',
    });
    drills.push({
      title: 'Three-Second Finish',
      goal: 'Hit 10 shots and hold the finish for 3 seconds. Goal: 8 balanced finishes.',
    });
  }

  if (tempo === 'Too quick from the top') {
    priorities.push({
      title: 'Smooth the transition',
      detail: 'A rushed transition can make face control and contact harder, especially with longer clubs.',
    });
    drills.push({
      title: 'Pause-at-the-Top Drill',
      goal: 'Hit 10 balls with a tiny pause at the top. Goal: 7 solid shots with no rushed start down.',
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      title: 'Keep the pattern and measure it',
      detail: 'Nothing jumps out from your answers. Use the captured frames as a checkpoint, then measure start line, contact, and finish quality.',
    });
    drills.push({
      title: 'Balanced Contact Test',
      goal: 'Hit 12 balls. Goal: 8 solid contacts that start inside your intended window and finish in balance.',
    });
  }

  const clubNote = club === 'Driver'
    ? 'With driver, prioritize playable start line and balanced speed over perfect ball flight.'
    : club === 'Wedge'
      ? 'With wedges, prioritize clean contact, predictable launch, and distance control.'
      : 'With this club, prioritize solid contact and a repeatable start line.';

  return {
    snapshot: `${clubNote} Your current pattern points first toward ${priorities[0].title.toLowerCase()}.`,
    priorities: priorities.slice(0, 2),
    drills: drills.slice(0, 2),
    nextVideo: 'Film one down-the-line swing and one face-on swing in good light, with the full body and club visible.',
  };
}

function ReviewCard({ review }) {
  if (!review) {
    return (
      <div className="text-sm text-slate-500 space-y-2">
        <p>Upload a swing, answer the quick checkpoints, then generate a free swing review.</p>
        <p>The assistant will give you one or two priorities and measurable drills without using paid AI.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p className="text-xs font-mono text-emerald-300 uppercase tracking-widest mb-2">Snapshot</p>
        <p className="text-sm leading-relaxed text-slate-200">{review.snapshot}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Priorities</p>
        {review.priorities.map((priority) => (
          <div key={priority.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">{priority.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{priority.detail}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Practice</p>
        {review.drills.map((drill) => (
          <div key={drill.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">{drill.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{drill.goal}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Film Next</p>
        <p className="text-sm leading-relaxed text-slate-400">{review.nextVideo}</p>
      </div>
    </div>
  );
}

export default function SwingAnalyzer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [frames, setFrames] = useState([]);
  const [club, setClub] = useState('Driver');
  const [view, setView] = useState('Down the line');
  const [miss, setMiss] = useState('Slice / fade too much');
  const [contact, setContact] = useState('Mixed');
  const [startLine, setStartLine] = useState('Mixed');
  const [curve, setCurve] = useState('Mixed');
  const [balance, setBalance] = useState('Balanced finish');
  const [tempo, setTempo] = useState('Smooth');
  const [review, setReview] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const canReview = useMemo(() => frames.length > 0, [frames]);

  async function handleVideo(file) {
    if (!file) return;
    setError('');
    setStatus('Reading swing video...');
    setFrames([]);
    setReview(null);
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

  function generateReview(e) {
    e.preventDefault();
    if (!canReview) return;
    setError('');
    setReview(buildSwingReview({ club, miss, contact, startLine, curve, balance, tempo }));
    setStatus('Review generated.');
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Swing Review Assistant</h1>
        <p className="text-sm text-slate-500 font-mono">Upload a swing video, answer quick checkpoints, and get free drill recommendations.</p>
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

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Best filming setup</p>
            <p className="text-sm text-slate-400">Use down-the-line or face-on, camera steady, full body and club visible, normal speed video, good light.</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[620px]">
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest mb-4">Guided Review</h2>

          <form onSubmit={generateReview} className="space-y-4">
            <div className="grid gap-4">
              <Field label="Club">
                <select value={club} onChange={(e) => setClub(e.target.value)} className={inputClass}>
                  {['Driver', 'Fairway wood', 'Hybrid', 'Iron', 'Wedge'].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Camera view">
                <select value={view} onChange={(e) => setView(e.target.value)} className={inputClass}>
                  {['Down the line', 'Face on', 'Rear view', 'Unknown'].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Main miss">
                <select value={miss} onChange={(e) => setMiss(e.target.value)} className={inputClass}>
                  {missOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Contact">
                <select value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass}>
                  {contactOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Start line">
                <select value={startLine} onChange={(e) => setStartLine(e.target.value)} className={inputClass}>
                  {startOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Curve">
                <select value={curve} onChange={(e) => setCurve(e.target.value)} className={inputClass}>
                  {curveOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Balance">
                <select value={balance} onChange={(e) => setBalance(e.target.value)} className={inputClass}>
                  {balanceOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Tempo">
                <select value={tempo} onChange={(e) => setTempo(e.target.value)} className={inputClass}>
                  {tempoOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
            </div>

            {(status || error) && (
              <div className={`rounded-lg border px-3 py-2 text-xs font-mono ${
                error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}>
                {error || status}
              </div>
            )}

            <button
              type="submit"
              disabled={!canReview}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              Generate Swing Review
            </button>
          </form>

          <div className="mt-5 flex-1 overflow-auto pr-1">
            <ReviewCard review={review} />
          </div>
        </section>
      </div>
    </div>
  );
}
