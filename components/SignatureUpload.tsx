'use client';

import { useRef, useState } from 'react';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Props {
  currentPath: string | null;
}

export function SignatureUpload({ currentPath }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    currentPath ? `/${currentPath}` : null
  );
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(file: File) {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setStatus({ type: 'error', msg: 'Only PNG or JPG files are supported.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', msg: 'File must be smaller than 2 MB.' });
      return;
    }
    setStatus(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/teacher/signature', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setStatus({ type: 'success', msg: 'Signature saved successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview ? (
        <div className="inline-block border-2 rounded-xl p-2" style={{ borderColor: GOLD + '66' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Signature preview"
            className="h-20 object-contain"
          />
        </div>
      ) : (
        <div
          className="w-48 h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs text-gray-400"
          style={{ borderColor: GOLD + '44' }}
        >
          No signature
        </div>
      )}

      {/* File input */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
        >
          Choose file
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !inputRef.current?.files?.length}
          className="text-sm px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: NAVY }}
        >
          {uploading ? 'Uploading…' : 'Upload Signature'}
        </button>
        <span className="text-xs text-gray-400">PNG or JPG, max 2 MB</span>
      </div>

      {/* Status */}
      {status && (
        <p className={`text-sm ${status.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
          {status.msg}
        </p>
      )}
    </div>
  );
}
