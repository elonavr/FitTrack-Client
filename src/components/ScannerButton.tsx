import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Capacitor } from "@capacitor/core";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Button } from "./ui";

// In the iOS/Android app we use the native ML Kit scanner; in the browser, ZXing.
const isNative = Capacitor.isNativePlatform();
const FOOD_FORMATS = [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE];

async function scanNative(): Promise<string | null> {
  const { camera } = await BarcodeScanner.requestPermissions();
  if (camera !== "granted" && camera !== "limited") throw new Error("Camera permission denied.");
  try {
    const { barcodes } = await BarcodeScanner.scan({ formats: FOOD_FORMATS });
    return barcodes[0]?.rawValue ?? null;
  } catch (e) {
    if (e instanceof Error && /cancel/i.test(e.message)) return null; // user closed the scanner
    throw e;
  }
}

function cameraErrorMessage(e: unknown): string {
  const name = e instanceof DOMException ? e.name : "";
  if (name === "NotAllowedError") return "Camera permission denied.";
  if (name === "NotFoundError") return "No camera found.";
  return "Could not start the camera (it needs https or localhost).";
}

export default function ScannerButton({ onScan }: { onScan: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    let controls: IScannerControls | undefined;
    let done = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, _err, ctrl) => {
          if (!result || done) return;
          done = true;
          ctrl.stop();
          setOpen(false);
          onScan(result.getText());
        }
      )
      .then((c) => {
        controls = c;
        if (done) c.stop();
      })
      .catch((e: unknown) => {
        if (done) return;
        setError(cameraErrorMessage(e));
        setOpen(false);
      });

    return () => {
      done = true;
      controls?.stop();
    };
  }, [open, onScan]);

  return (
    <>
      <Button
        size="lg"
        onClick={async () => {
          setError(null);
          if (!isNative) {
            setOpen(true);
            return;
          }
          try {
            const code = await scanNative();
            if (code) onScan(code);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not start the scanner.");
          }
        }}
      >
        📷 Scan barcode
      </Button>
      {error && <p className="mt-2 text-danger">{error}</p>}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black" role="dialog" aria-label="Barcode scanner">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-[10%] top-1/2 h-32 -translate-y-1/2 rounded-lg border-4 border-white/80" />
          <div
            className="absolute inset-x-0 bottom-0 p-6"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <Button size="lg" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
