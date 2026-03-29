import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import { useEntry } from "../Context/EntryContext";

export default function ReceiptScanner() {
  const [selectedImage, setSelectedImage] = useState(null);
  const { refreshEntries } = useEntry();

  // Helper to format amounts in Nepali Rupees
  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amt);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [storing, setStoring] = useState(false);
  const [storeMessage, setStoreMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError("");
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError(null);
      setStoreMessage("");
    }
  };

  const openCamera = async () => {
    setError(null);
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
        return;
      }
      setError("Camera access is not supported on this device/browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setError("Unable to access camera. Please grant permission and try again.");
    }
  };

  const captureFromCamera = () => {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      setCameraError("Camera is still loading. Please try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Failed to capture image from camera.");
      return;
    }

    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Could not generate image from camera capture.");
          return;
        }

        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setScanResult(null);
        setError(null);
        setStoreMessage("");
        closeCameraModal();
      },
      "image/jpeg",
      0.92,
    );
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        setCameraError("Unable to start camera preview.");
      });
    }
  }, [isCameraOpen]);

  useEffect(() => () => {
    stopCameraStream();
  }, []);

  const handleScan = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login first to scan and save receipt data.");
      setScanning(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/receipt/receipts/scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setScanResult(response.data);
      setStoreMessage("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during scanning.");
    } finally {
      setScanning(false);
    }
  };

  const handleStoreScannedBill = async () => {
    if (!scanResult?.id) {
      setError("No scanned receipt found to store.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login first to store receipt data.");
      return;
    }

    setStoring(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/receipt/receipts/${scanResult.id}/store/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStoreMessage(response.data?.message || "Stored successfully.");
      setScanResult((prev) => ({
        ...prev,
        transaction_created: response.data?.transaction_created || prev?.transaction_created,
      }));
      await refreshEntries().catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || "Failed to store scanned receipt.");
    } finally {
      setStoring(false);
    }
  };

  const renderItemsTable = (items) => {
    if (!items || items.length === 0) {
      return <p className="px-4 py-6 text-sm text-slate-400">No items detected.</p>;
    }

    return (
      <table className="min-w-full overflow-hidden rounded-xl border border-white/10 bg-[#030712]">
        <thead>
          <tr className="bg-black/35 text-slate-200">
            <th className="border-b border-white/10 py-3 px-4 text-left text-sm font-semibold">Product Name</th>
            <th className="border-b border-white/10 py-3 px-4 text-right text-sm font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-white/10 last:border-b-0 hover:bg-[#0b1226]">
              <td className="py-3 px-4 text-left text-[1.05rem] text-slate-100">{item.name}</td>
              <td className="py-3 px-4 text-right text-[1.05rem] font-semibold text-slate-100">{formatCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#0c1f47_0%,_#07112a_35%,_#030a1a_100%)] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-[1260px]">
        <div className="mb-5 rounded-2xl border border-[#1a2a4d] bg-[#071127]/90 px-5 py-5 shadow-[0_20px_60px_-30px_rgba(2,6,23,1)] md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-[#2a4f91] bg-[#10305f]/50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#9ec5ff]">
                OCR Scanner
              </div>
              <h1 className="text-3xl font-bold text-[#4fa3ff] md:text-[2.25rem]">Receipt Scanner</h1>
              <p className="mt-2 text-sm text-slate-300 md:text-[1.1rem]">
                Upload or capture a receipt, extract items instantly, and store verified data to your dashboard.
              </p>
            </div>
            <BackButton />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="rounded-3xl border border-[#1a2a4d] bg-[#071127]/90 p-5 shadow-[0_20px_60px_-30px_rgba(2,6,23,1)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[1.85rem] font-semibold leading-none text-slate-100">Receipt Preview</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                Large View
              </span>
            </div>
            <div className="flex min-h-[530px] w-full items-center justify-center rounded-2xl border border-dashed border-[#243a69] bg-[#060f24] p-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="max-h-[500px] w-auto max-w-full rounded-md object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2e67bf] bg-[#0f2b5a] text-4xl text-[#82beff]">
                    R
                  </div>
                  <p className="text-3xl font-semibold text-slate-200">No receipt selected</p>
                  <p className="mt-2 text-[1.03rem] text-slate-400">Choose an image to see a full-size preview here.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-[#1a2a4d] bg-[#071127]/90 p-5 shadow-[0_20px_60px_-30px_rgba(2,6,23,1)]">
            <h2 className="text-[1.85rem] font-semibold leading-none text-slate-100">Scan Controls</h2>
            <p className="mt-3 text-sm text-slate-300">Use one of the actions below, then run OCR to extract receipt details.</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="rounded-xl border border-[#2f68c4] bg-[#12376b] px-4 py-3 text-[1.02rem] font-semibold text-slate-100 transition hover:bg-[#164587]"
              >
                Upload Image
              </button>
              <button
                onClick={openCamera}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[1.02rem] font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Capture Camera
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              onClick={handleScan}
              disabled={!selectedImage || scanning}
              className="mt-4 w-full rounded-xl bg-green-600 py-3 text-[1.06rem] font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {scanning ? "Scanning..." : "Scan Receipt"}
            </button>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Tips</p>
              <ul className="space-y-2 text-[1.05rem] text-slate-300">
                <li>Keep the receipt flat with clear lighting.</li>
                <li>Include the full bill from top to bottom.</li>
                <li>Blur or crop sensitive details before upload.</li>
              </ul>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </aside>
        </div>

        {scanResult && (
          <section className="mt-6 rounded-3xl border border-[#1a2a4d] bg-[#071127]/90 p-5 shadow-[0_20px_60px_-30px_rgba(2,6,23,1)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[2rem] font-semibold text-slate-100">Scan Results</h2>
              <button
                onClick={handleStoreScannedBill}
                disabled={storing || Boolean(scanResult.transaction_created)}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {scanResult.transaction_created ? "Stored" : storing ? "Storing Data..." : "Store Data"}
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.65fr_0.8fr]">
              <div>
                <h3 className="mb-3 text-[1.85rem] font-semibold text-slate-100">Extracted Items</h3>
                {renderItemsTable(scanResult.parsed_data?.items)}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#2f68c4] bg-[linear-gradient(120deg,_rgba(14,58,107,0.95)_0%,_rgba(10,46,87,0.95)_100%)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Total Amount</p>
                  <p className="mt-2 text-[2rem] font-bold text-emerald-300">
                    {scanResult.parsed_data?.total ? formatCurrency(scanResult.parsed_data.total) : "NPR 0.00"}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  Data will be saved to the database and reflected in Dashboard only after clicking Store Data.
                </p>

                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[1rem] font-semibold text-white transition hover:bg-white/10"
                >
                  {showRawText ? "Hide Raw OCR Text" : "Show Raw OCR Text"}
                </button>

                {storeMessage ? <p className="text-sm text-emerald-300">{storeMessage}</p> : null}
              </div>
            </div>

            {showRawText && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#050d1f] p-4">
                <h3 className="mb-2 text-lg font-semibold text-slate-100">Raw OCR Text</h3>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-sm text-slate-300">{scanResult.text_extracted}</pre>
              </div>
            )}
          </section>
        )}
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[#2b3f6e] bg-[#060f24] p-4 shadow-[0_20px_80px_-30px_rgba(0,0,0,1)] md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-100">Capture Receipt</h3>
              <button
                onClick={closeCameraModal}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#2b3f6e] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-[58vh] min-h-[300px] w-full object-cover"
              />
            </div>

            {cameraError ? (
              <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{cameraError}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                onClick={captureFromCamera}
                className="rounded-xl bg-[#1f66d1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d73dd]"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
