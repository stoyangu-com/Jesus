import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadFile } from '../lib/api';

export type ProductForm = {
  id?: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
};

const empty: ProductForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
};

export default function ProductModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: ProductForm | null;
  onClose: () => void;
  onSave: (form: ProductForm) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial || empty);
      setError('');
      setSaving(false);
      setUploading(false);
    }
  }, [open, initial]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadFile(file, 'products');
      setForm((f) => ({ ...f, image_url: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            className="relative w-full sm:max-w-lg bg-navy-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-teal-950/40 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {form.id ? 'Edit product' : 'Add product'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Visible on your StoYangu storefront</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="label">Product name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Chicken Pizza Large"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Price (KES)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[96px] resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short details customers will love…"
                />
              </div>

              <div>
                <label className="label">Product photo</label>
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {form.image_url ? (
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10 cursor-pointer transition">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? 'Uploading…' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                      />
                    </label>
                    {form.image_url && (
                      <button
                        type="button"
                        className="block text-xs text-rose-300 hover:text-rose-200"
                        onClick={() => setForm({ ...form, image_url: '' })}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : form.id ? (
                    'Save changes'
                  ) : (
                    'Add product'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
