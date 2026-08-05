import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

export default function ApplyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [willingVideo, setWillingVideo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setDone(false);
      setSubmitting(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          willing_video: willingVideo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
      setDone(true);
      setFullName('');
      setPhone('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="relative w-full sm:max-w-md bg-navy-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-white">Video Yangu, Store Yangu</h2>
                <p className="text-xs text-slate-400 mt-0.5">We will reply on WhatsApp</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="p-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-300 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-white font-semibold text-lg">Asante! We got it.</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  If you are approved, we will message you on WhatsApp and tell you the next steps for
                  your short video and your store.
                </p>
                <button onClick={onClose} className="btn-primary w-full mt-6">
                  Okay, got it
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-4">
                <div className="rounded-2xl bg-teal-500/10 border border-teal-400/20 px-3.5 py-3 text-xs text-teal-100/90 leading-relaxed">
                  Shoot a short 1-minute video about your biashara — get your StoYangu store + first month
                  of maintenance covered (if approved).
                </div>

                <div>
                  <label className="label">Your name *</label>
                  <input
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amina Wanjiku"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label">WhatsApp number *</label>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    required
                    inputMode="tel"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-3.5 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={willingVideo}
                    onChange={(e) => setWillingVideo(e.target.checked)}
                    className="mt-1 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-400/30"
                  />
                  <span className="text-sm text-slate-300 leading-relaxed">
                    Yes — I can record a short 1-minute video saying who I am, what I sell, and that I got
                    my online store from StoYangu.
                  </span>
                </label>

                {error && (
                  <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    'Send my application'
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Normal price: KES 5,000 setup + KES 300/month maintenance · info@stoyangu.com
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
