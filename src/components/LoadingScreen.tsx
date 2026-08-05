import { STOYANGU_LOGO } from '../lib/brand';

export default function LoadingScreen({ label = 'Loading StoYangu…' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
        <img
          src={STOYANGU_LOGO}
          alt="StoYangu"
          className="w-10 h-10 object-contain opacity-95"
        />
      </div>
      <p className="text-slate-400 text-sm tracking-wide">{label}</p>
    </div>
  );
}
