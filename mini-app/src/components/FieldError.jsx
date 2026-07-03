export default function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export function ErrorSummary({ message, fieldErrors }) {
  if (!message && !fieldErrors) return null;

  const fieldMessages = fieldErrors ? Object.values(fieldErrors) : [];
  const showList = fieldMessages.length > 1;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      {message && <p className="text-sm font-semibold text-red-800">{message}</p>}
      {showList && (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
          {fieldMessages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
