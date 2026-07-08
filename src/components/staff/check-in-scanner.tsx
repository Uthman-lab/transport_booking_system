"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { checkInAction, type CheckInState } from "@/app/staff/check-in/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: CheckInState = { status: "idle" };

const inputClass =
  "rounded-md border border-input bg-input-bg px-3 py-2 text-base outline-none focus:border-ring";
const buttonClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";
const secondaryButton =
  "rounded-md border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60";

export function CheckInScanner() {
  const [state, dispatch, pending] = useActionState(checkInAction, initialState);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const submitCode = useCallback(
    (code: string) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      stopCamera();
      const fd = new FormData();
      fd.set("ticketCode", code);
      // dispatch() is the useActionState action; calling it programmatically
      // (rather than via a form `action` prop) must be wrapped in a transition
      // so React tracks isPending correctly and doesn't warn.
      startTransition(() => {
        dispatch(fd);
      });
    },
    [dispatch, stopCamera],
  );

  const startCamera = useCallback(async () => {
    setCamError(null);
    submittedRef.current = false;

    // The camera API is only exposed in a secure context (HTTPS or localhost).
    // Over http:// on a LAN IP (e.g. testing on a phone) the browser hides it,
    // so explain the real cause rather than blaming the browser.
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setCamError(
        "The camera needs a secure connection (HTTPS or localhost). This page is on plain HTTP, so the browser blocks it. Use manual entry below, or serve the app over HTTPS.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("This browser doesn't support camera scanning — use manual entry below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const tick = () => {
        if (!streamRef.current || !videoRef.current) return;
        const v = videoRef.current;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(image.data, image.width, image.height);
          if (found?.data) {
            submitCode(found.data.trim());
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setScanning(false);
      setCamError(
        "Couldn't access the camera (permission denied or no camera). Use manual entry below.",
      );
    }
  }, [submitCode]);

  // Stop the camera on unmount.
  useEffect(() => stopCamera, [stopCamera]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Scanner */}
      <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-6">
        <h3 className="text-base font-semibold">Scan a ticket</h3>

        <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border border-card-border bg-black/80">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`h-full w-full object-cover ${scanning ? "" : "hidden"}`}
          />
          {!scanning ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-white/70">
              Camera preview appears here
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-white/70" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {scanning ? (
            <button type="button" onClick={stopCamera} className={secondaryButton}>
              Stop camera
            </button>
          ) : (
            <button type="button" onClick={startCamera} className={buttonClass}>
              Start camera
            </button>
          )}
          {pending ? <span className="text-sm text-muted">Checking…</span> : null}
        </div>

        {camError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {camError}
          </p>
        ) : null}
      </div>

      {/* Manual entry */}
      <form action={dispatch} className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-6">
        <h3 className="text-base font-semibold">Or enter a ticket code</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            Ticket code
            <input
              name="ticketCode"
              required
              autoComplete="off"
              className={`${inputClass} font-mono`}
              placeholder="e.g. a1b2c3d4e5f6"
            />
          </label>
          <ActionButton pending={pending} pendingText="Checking…" className={buttonClass}>
            Check in
          </ActionButton>
        </div>
      </form>

      {/* Result */}
      {state.status === "success" && state.result ? (
        <ResultCard result={state.result} onScanAnother={startCamera} />
      ) : null}
      {state.status === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4 dark:border-red-900 dark:bg-red-950">
          <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
            {state.message}
          </p>
          <button type="button" onClick={startCamera} className={secondaryButton}>
            Scan again
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ResultCard({
  result,
  onScanAnother,
}: {
  result: NonNullable<CheckInState["result"]>;
  onScanAnother: () => void;
}) {
  return (
    <div className="rounded-xl border border-green-300 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-base font-semibold text-green-800 dark:text-green-300">
          <span aria-hidden="true">✓</span> Checked in
        </p>
        <button type="button" onClick={onScanAnother} className={secondaryButton}>
          Scan another
        </button>
      </div>

      <p className="mt-2 text-lg font-semibold">{result.passengerName}</p>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">Seat</dt>
        <dd className="font-medium">{result.seatNumber}</dd>

        <dt className="text-muted">Trip</dt>
        <dd className="font-medium">
          {result.origin} → {result.destination}
        </dd>

        <dt className="text-muted">Departure</dt>
        <dd className="font-medium">{new Date(result.departureAt).toLocaleString()}</dd>

        <dt className="text-muted">Ticket</dt>
        <dd className="font-mono font-medium uppercase">{result.ticketCode}</dd>

        <dt className="text-muted">Boarded at</dt>
        <dd className="font-medium">{new Date(result.checkedInAt).toLocaleTimeString()}</dd>
      </dl>
    </div>
  );
}
