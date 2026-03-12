import React, { useState, useRef } from "react";
import axios from "axios";
import { Camera, FileText } from "lucide-react"; // neon-style icons

export default function ReceiptScanner() {
  const [selectedImage, setSelectedImage] = useState(null);

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

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setError(null);
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

    try {
      const response = await axios.post('http://localhost:8000/api/receipt/receipts/scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setScanResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during scanning.");
    } finally {
      setScanning(false);
    }
  };

  const renderItemsTable = (items) => {
    if (!items || items.length === 0) {
      return <p>No items detected.</p>;
    }

    return (
      <table className="min-w-full bg-[#0f172a] border border-gray-600 text-white">
        <thead>
          <tr className="bg-[#1e293b]">
            <th className="py-2 px-4 border-b text-left">Product Name</th>
            <th className="py-2 px-4 border-b text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b text-right text-green-400">{formatCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white overflow-x-hidden">
      <div className="relative p-6">
        {/* giant faint icon in background */}
        <FileText size={200} className="absolute top-10 right-10 text-white/10 transform rotate-12" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Camera size={48} className="text-cyan-400 animate-pulse" />
          <h1 className="text-4xl font-extrabold">Receipt Scanner</h1>
        </div>

        <div className="bg-[#1e293b]/80 rounded-lg shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Upload Receipt</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold shadow-lg shadow-cyan-500/60 hover:scale-105 transform transition"
            >
              Upload Image
            </button>
            <button
              onClick={() => cameraInputRef.current.click()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-black font-semibold shadow-lg shadow-pink-500/60 hover:scale-105 transform transition"
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
                className="max-w-full h-auto border-2 border-cyan-400 rounded-lg shadow-xl"
              />
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!selectedImage || scanning}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-black font-bold shadow-xl shadow-pink-500/50 disabled:opacity-50 hover:scale-105 transform transition"
          >
            {scanning ? "Scanning..." : "Scan Receipt"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-700/80 border border-red-500 text-red-100 rounded-lg shadow-inner">
              {error}
            </div>
          )}
        </div>

        {scanResult && (
          <div className="bg-[#1e293b]/90 rounded-lg shadow-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Scan Results</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2 text-white">Extracted Items</h3>
              {renderItemsTable(scanResult.parsed_data?.items)}
            </div>

            {scanResult.parsed_data?.total && (
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2 text-white">Total Amount</h3>
                <p className="text-3xl font-extrabold text-green-300 tracking-wide">
                  {formatCurrency(scanResult.parsed_data.total)}
                </p>
              </div>
            )}

            <div className="mb-4">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="bg-transparent border-2 border-cyan-400 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-400 hover:text-black transition"
              >
                {showRawText ? "Hide" : "Show"} Raw OCR Text
              </button>
            </div>

            {showRawText && (
              <div className="bg-[#0f172a]/80 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Raw OCR Text</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-300">{scanResult.text_extracted}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
