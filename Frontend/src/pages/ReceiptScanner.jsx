import React, { useState, useRef } from "react";
import axios from "axios";

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
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Product Name</th>
            <th className="py-2 px-4 border-b text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b text-right">{formatCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Receipt Scanner</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                className="max-w-full h-auto border border-gray-300 rounded"
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
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {scanResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Scan Results</h2>

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
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                {showRawText ? "Hide" : "Show"} Raw OCR Text
              </button>
            </div>

            {showRawText && (
              <div className="bg-gray-100 p-4 rounded">
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
