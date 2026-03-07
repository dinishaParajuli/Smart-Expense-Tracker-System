import React, { useState } from "react";
import { format } from "date-fns";

const BudgetEntry = () => {
  const [entryType, setEntryType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState("2025-11-30");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([]);

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
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

  const handleTypeChange = (type) => {
    setEntryType(type);
    setCategory("");
    setPaymentMethod("Cash");
  };

  const handleSaveEntry = () => {
    if (!amount || !category || !date) {
      alert("Fill required fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: entryType,
      category,
      amount: parseFloat(amount),
      date,
      paymentMethod,
      notes,
      originalCategory: category,
    };

    setEntries([newEntry, ...entries]);
    setAmount("");
    setCategory("");
    setNotes("");
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

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-800">Budget Entry</h1>
        <p className="text-gray-500 mb-6">Add your transactions manually</p>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* FORM CARD */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold text-lg mb-4">Add New Entry</h2>

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
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                className="w-full border rounded p-2 mb-4"
              />

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 bg-green-500 text-white py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setAmount("");
                    setCategory("");
                    setNotes("");
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded"
                >
                  Clear
                </button>
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
              <h3 className="font-semibold mb-4">Recent Entries</h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entries.map((e) => (
                  <div key={e.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{e.category}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(e.date)}
                      </p>
                    </div>

                    <span
                      className={`font-semibold ${
                        e.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {e.type === "income" ? "+" : "-"}
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetEntry;