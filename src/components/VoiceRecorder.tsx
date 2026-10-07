"use client";

import { useRef, useState } from "react";

// Enregistrement vocal (note vocale d'annonce ou message vocal client) — entièrement
// côté navigateur via MediaRecorder, puis upload vers /api/uploads.
export default function VoiceRecorder({
  onUploaded,
  label = "Appuyer pour parler",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [state, setState] = useState<"inactif" | "enregistrement" | "envoi" | "pret">("inactif");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function demarrer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setPreviewUrl(URL.createObjectURL(blob));
        setState("envoi");

        const form = new FormData();
        form.append("file", blob, "note-vocale.webm");
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        const data = await res.json();
        if (data.ok) {
          onUploaded(data.url);
          setState("pret");
        } else {
          setState("inactif");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("enregistrement");
    } catch {
      alert("Microphone indisponible. Vérifiez les autorisations de votre navigateur.");
    }
  }

  function arreter() {
    mediaRecorderRef.current?.stop();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {state !== "enregistrement" ? (
        <button
          type="button"
          onClick={demarrer}
          disabled={state === "envoi"}
          className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-naya-orange text-white text-4xl shadow-lg active:scale-95 disabled:opacity-50"
        >
          🎤
        </button>
      ) : (
        <button
          type="button"
          onClick={arreter}
          className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-naya-green text-white text-4xl shadow-lg animate-pulse"
        >
          ⏹️
        </button>
      )}
      <p className="text-center text-base font-medium text-naya-ink">
        {state === "inactif" && label}
        {state === "enregistrement" && "Enregistrement... appuyez pour arrêter"}
        {state === "envoi" && "Envoi en cours..."}
        {state === "pret" && "Note vocale enregistrée ✅"}
      </p>
      {previewUrl && (
        <audio controls src={previewUrl} className="w-full max-w-xs">
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
}
