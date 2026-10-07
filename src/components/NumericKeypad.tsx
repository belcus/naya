"use client";

// Clavier numérique large — pour saisir un prix ou un code OTP sans dépendre de la lecture.
export default function NumericKeypad({
  value,
  onChange,
  maxLength = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  function appuyer(chiffre: string) {
    if (value.length >= maxLength) return;
    onChange(value + chiffre);
  }
  function effacer() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => appuyer(n)}
          className="rounded-xl2 bg-white py-4 text-2xl font-bold text-naya-ink shadow active:scale-95"
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={effacer}
        className="rounded-xl2 bg-naya-orange/20 py-4 text-2xl font-bold text-naya-orange shadow active:scale-95"
      >
        ⌫
      </button>
      <button
        type="button"
        onClick={() => appuyer("0")}
        className="rounded-xl2 bg-white py-4 text-2xl font-bold text-naya-ink shadow active:scale-95"
      >
        0
      </button>
    </div>
  );
}
