import React, { useState, useRef } from "react";
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

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
      return <p>No items detected.</p>;
    }

    return (
      <table className="min-w-full border border-white/15 bg-[#0f172a]">
        <thead>
          <tr className="bg-[#1f2937] text-[#cbd5e1]">
            <th className="py-2 px-4 border-b text-left">Product Name</th>
            <th className="py-2 px-4 border-b text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-[#1e293b]">
              <td className="border-b border-white/10 py-2 px-4">{item.name}</td>
              <td className="border-b border-white/10 py-2 px-4 text-right">{formatCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

    return (
    <div className="min-h-screen bg-[#0a0f1f] p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Receipt Scanner</h1>
          <BackButton />
        </div>

        <div className="mb-6 rounded-lg border border-white/10 bg-[#111828] p-6 shadow-[0_18px_35px_-24px_rgba(2,6,23,0.9)]">
          <h2 className="text-2xl font-semibold mb-4">Upload Receipt</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Upload Image
            </button>
            <button
              onClick={() => cameraInputRef.current.click()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Capture from Camera
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

          {imagePreview && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Image Preview</h3>
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="h-auto max-w-full rounded border border-white/20"
              />
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!selectedImage || scanning}
            className="mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded"
          >
            {scanning ? "Scanning..." : "Scan Receipt"}
          </button>

          {error && (
            <div className="mt-4 rounded border border-red-400/50 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}
        </div>

        {scanResult && (
          <div className="rounded-lg border border-white/10 bg-[#111828] p-6 shadow-[0_18px_35px_-24px_rgba(2,6,23,0.9)]">
            <h2 className="text-2xl font-semibold mb-4">Scan Results</h2>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStoreScannedBill}
                disabled={storing || Boolean(scanResult.transaction_created)}
                className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {scanResult.transaction_created ? "Stored" : storing ? "Storing Data..." : "Store Data"}
              </button>
              {storeMessage ? <p className="text-sm text-emerald-300">{storeMessage}</p> : null}
            </div>
            <p className="mb-4 text-sm text-[#94a3b8]">
              Data will be saved to the database and reflected in Dashboard only after clicking Store Data.
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Extracted Items</h3>
              {renderItemsTable(scanResult.parsed_data?.items)}
            </div>

            {scanResult.parsed_data?.total && (
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Total Amount</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(scanResult.parsed_data.total)}
                </p>
              </div>
            )}

            <div className="mb-4">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-500"
              >
                {showRawText ? "Hide" : "Show"} Raw OCR Text
              </button>
            </div>

            {showRawText && (
              <div className="rounded bg-[#0f172a] p-4">
                <h3 className="text-lg font-medium mb-2">Raw OCR Text</h3>
                <pre className="whitespace-pre-wrap text-sm">{scanResult.text_extracted}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
