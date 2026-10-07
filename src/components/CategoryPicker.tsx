"use client";

import { CATEGORIES, TRANSACTION_TYPES } from "@/lib/constants";

// Sélection par pictogrammes — aucune lecture requise.
export function CategoryPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={`flex flex-col items-center gap-2 rounded-xl2 border-4 p-4 text-lg font-semibold ${
            value === c.value ? "border-naya-orange bg-naya-orange/10" : "border-transparent bg-white"
          }`}
        >
          <span className="text-5xl">{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function TransactionTypePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TRANSACTION_TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`flex flex-col items-center gap-2 rounded-xl2 border-4 p-4 text-lg font-semibold ${
            value === t.value ? "border-naya-green bg-naya-green/10" : "border-transparent bg-white"
          }`}
        >
          <span className="text-4xl">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
