import { useRef } from 'react';
import FieldError from './FieldError';

export default function MedicineImageUpload({
  label = 'Medicine or prescription photo',
  hint = 'Optional. Upload a medicine photo or doctor prescription.',
  preview,
  existingUrl,
  onSelect,
  onClear,
  error,
}) {
  const inputRef = useRef(null);
  const showPreview = preview || existingUrl;

  return (
    <div>
      <label className="app-label">{label}</label>
      <p className="mb-2 text-xs text-tg-hint">{hint}</p>
      <div
        className={`app-card flex cursor-pointer flex-col items-center border-2 border-dashed p-5 transition-colors ${
          error ? 'border-red-400' : 'border-tg-hint/40'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = '';
          }}
        />
        {showPreview ? (
          <div className="w-full">
            <img
              src={preview || existingUrl}
              alt="Medicine preview"
              className="mx-auto max-h-48 rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="btn-app-secondary mt-3 w-full py-2 text-xs"
            >
              Remove image
            </button>
          </div>
        ) : (
          <>
            <div
              className="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--tg-theme-button-color) 15%, var(--tg-theme-secondary-bg-color))',
                color: 'var(--tg-theme-button-color)',
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-tg-text">Tap to add photo</p>
            <p className="mt-1 text-xs text-tg-hint">JPG, PNG or WEBP up to 5MB</p>
          </>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}
