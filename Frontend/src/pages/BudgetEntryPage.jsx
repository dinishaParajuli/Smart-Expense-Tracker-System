import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEntry } from "../Context/EntryContext";
import BackButton from "../components/BackButton";

const BudgetEntry = () => {
  const navigate = useNavigate();
  const { entries, loading, error, refreshEntries, addEntry, deleteEntry, updateEntry } = useEntry();
  const [entryType, setEntryType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
    "Other",
  ];

  const incomeCategories = ["Salary", "Other"];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Digital Wallet",
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    refreshEntries().catch(() => {});
  }, [refreshEntries]);

  const handleTypeChange = (type) => {
    setEntryType(type);
    setCategory("");
    setPaymentMethod("Cash");
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
    } catch (err) {
      alert(err.message || "Failed to delete entry.");
    }
  };

  const handleEditEntry = (entry) => {
    setEditingId(entry.id);
    setEntryType(entry.type);
    setAmount(entry.amount);
    setCategory(entry.category);
    setPaymentMethod(entry.paymentMethod);
    setDate(entry.date);
    setNotes(entry.notes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setNotes("");
    setEntryType("expense");
    setPaymentMethod("Cash");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSaveEntry = async () => {
    if (!amount || !category || !date) {
      alert("Fill required fields");
      return;
    }

    if (entryType === "expense" && category === "Other" && !notes.trim()) {
      alert("Please fill in the Notes field to describe this 'Other' expense.");
      return;
    }

    try {
      if (editingId !== null) {
        await updateEntry(editingId, { type: entryType, category, amount: parseFloat(amount), date, paymentMethod, notes });
        setEditingId(null);
      } else {
        await addEntry({ type: entryType, category, amount: parseFloat(amount), date, paymentMethod, notes, originalCategory: category });
      }

      setAmount("");
      setCategory("");
      setNotes("");
    } catch (err) {
      alert(err.message || "Failed to save entry.");
    }
  };

  const todayEntries = entries.filter((e) => e.date === date);

  const todayIncome = todayEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);

  const todayExpenses = todayEntries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const todayNet = todayIncome - todayExpenses;

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amt);

  const formatDate = (d) => format(new Date(d), "MMM d, yyyy");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Budget Entry</h1>
            <p className="text-gray-500">Add your transactions manually</p>
          </div>
          <BackButton />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* FORM CARD */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold text-lg mb-4">
                {editingId !== null ? "✏️ Edit Entry" : "Add New Entry"}
              </h2>

              {/* TYPE */}
              <div className="mb-4">
                <p className="text-sm mb-2">Entry Type</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTypeChange("expense")}
                    className={`px-4 py-2 rounded ${
                      entryType === "expense"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Expense
                  </button>

                  <button
                    onClick={() => handleTypeChange("income")}
                    className={`px-4 py-2 rounded ${
                      entryType === "income"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* AMOUNT */}
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded p-2"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(q)}
                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                    >
                      +{q >= 1000 ? `${q / 1000}K` : q}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORY */}
              <div className="mb-4">
                <p className="text-sm mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {(entryType === "expense"
                    ? expenseCategories
                    : incomeCategories
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded text-sm ${
                        category === cat
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT */}
              <div className="mb-4">
                <p className="text-sm mb-2">Payment Method</p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`px-3 py-1 rounded text-sm ${
                        paymentMethod === m
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* DATE */}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              />

              {/* NOTES */}
              <div className="mb-4">
                <label className="text-sm mb-1 block">
                  Notes
                  {entryType === "expense" && category === "Other" && (
                    <span className="text-red-500 ml-1">* required</span>
                  )}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={entryType === "expense" && category === "Other" ? "Describe this expense..." : "Notes (optional)"}
                  className={`w-full border rounded p-2 ${
                    entryType === "expense" && category === "Other" && !notes.trim()
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2`}
                  rows={3}
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEntry}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2 rounded"
                >
                  {loading ? "Saving..." : editingId !== null ? "Update Entry" : "Save"}
                </button>
                {editingId !== null ? (
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-400 text-white py-2 rounded"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => { setAmount(""); setCategory(""); setNotes(""); }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* SUMMARY */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-2">Today's Summary</h3>
              <p className="text-sm text-gray-500 mb-3">{formatDate(date)}</p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Income</span>
                  <span className="text-green-500 font-semibold">
                    {formatCurrency(todayIncome)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Expenses</span>
                  <span className="text-red-500 font-semibold">
                    {formatCurrency(todayExpenses)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Net</span>
                  <span
                    className={
                      todayNet >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {formatCurrency(todayNet)}
                  </span>
                </div>
              </div>
            </div>

            {/* RECENT */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Recent Entries</h3>
                <span className="text-xs text-gray-400">{entries.length} total</span>
              </div>

              <div className="space-y-3">
                {entries.slice(0, 5).map((e) => (
                  <div key={e.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{e.category}</p>
                        <p className="text-xs text-gray-400">{formatDate(e.date)}</p>
                        {e.notes ? (
                          <p className="text-xs text-gray-500 mt-0.5 italic truncate max-w-35">{e.notes}</p>
                        ) : null}
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          e.type === "income" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {e.type === "income" ? "+" : "-"}{formatCurrency(e.amount)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditEntry(e)}
                        className="flex-1 text-xs py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(e.id)}
                        className="flex-1 text-xs py-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}

                {entries.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No entries yet</p>
                )}
              </div>

              <button
                onClick={() => navigate("/all-entries")}
                className="mt-4 w-full py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
              >
                See All Entries →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetEntry;