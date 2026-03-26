import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEntry } from "../Context/EntryContext";
import BackButton from "../components/BackButton";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Card = ({ className = "", children }) => (
  <section
    className={cx(
      "rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-shadow duration-200 ease-out",
      className
    )}
  >
    {children}
  </section>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
    {subtitle ? <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p> : null}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={cx(
      "h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 ease-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25",
      className
    )}
  />
);

const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const styles = {
    primary:
      "border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus:ring-blue-500/40",
    secondary:
      "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-blue-500/30",
    danger:
      "border border-rose-700 bg-rose-900/30 text-rose-200 hover:bg-rose-900/50 focus:ring-rose-500/30",
    ghost:
      "border border-transparent bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-blue-500/30",
  };

  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-lg px-3.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

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

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const todayEntries = entries.filter((e) => e.date === todayKey);

  const todayIncome = todayEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const todayExpenses = todayEntries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + Math.abs(Number(e.amount) || 0), 0);

  const todayNet = todayIncome - todayExpenses;

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amt);

  const formatDate = (d) => {
    const [year, month, day] = String(d).split("-").map(Number);
    return format(new Date(year, month - 1, day), "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Budget Entry</h1>
            <p className="mt-1.5 text-sm text-slate-400">Add your transactions manually</p>
          </div>
          <BackButton />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-700 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card>
              <SectionHeader
                title={editingId !== null ? "Edit Entry" : "Add New Entry"}
                subtitle="Fill in the details below to record your transaction."
              />

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">Entry Type</label>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleTypeChange("expense")}
                    variant={entryType === "expense" ? "primary" : "secondary"}
                    className="min-w-[110px]"
                    type="button"
                  >
                    Expense
                  </Button>
                  <Button
                    onClick={() => handleTypeChange("income")}
                    variant={entryType === "income" ? "primary" : "secondary"}
                    className="min-w-[110px]"
                    type="button"
                  >
                    Income
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-300">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 3500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-400">Use a positive amount in NPR.</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {quickAmounts.map((q) => (
                    <Button
                      key={q}
                      onClick={() => setAmount(q)}
                      variant="secondary"
                      type="button"
                      className="h-8 px-2.5 text-xs"
                    >
                      +{q >= 1000 ? `${q / 1000}K` : q}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition-all duration-200 ease-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    <option value="">Select category</option>
                    {(entryType === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-400">Choose the closest category for clearer reports.</p>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="mb-2 block text-sm font-medium text-slate-300">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition-all duration-200 ease-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="entryDate" className="mb-2 block text-sm font-medium text-slate-300">
                  Date
                </label>
                <Input
                  id="entryDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="notes">
                  Notes
                  {entryType === "expense" && category === "Other" && (
                    <span className="ml-1 text-red-600">* required</span>
                  )}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={entryType === "expense" && category === "Other" ? "Describe this expense..." : "Notes (optional)"}
                  className={cx(
                    "w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 ease-out focus:outline-none focus:ring-2",
                    entryType === "expense" && category === "Other" && !notes.trim()
                      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/25"
                  )}
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleSaveEntry}
                  disabled={loading}
                  className="min-w-[160px]"
                >
                  {loading ? "Saving..." : editingId !== null ? "Update Entry" : "Save Entry"}
                </Button>
                {editingId !== null ? (
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    type="button"
                    className="min-w-[140px]"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setAmount("");
                      setCategory("");
                      setNotes("");
                    }}
                    variant="secondary"
                    type="button"
                    className="min-w-[140px]"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Card>
              <SectionHeader title="Today's Summary" subtitle={formatDate(todayKey)} />
              <p className="mb-3 text-xs text-slate-400">{todayEntries.length} entries for this date</p>

              <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-sm">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-slate-300">Income</span>
                  <span className="text-right font-medium tabular-nums text-emerald-400">{formatCurrency(todayIncome)}</span>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-slate-300">Expenses</span>
                  <span className="text-right font-medium tabular-nums text-rose-400">-{formatCurrency(todayExpenses)}</span>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="flex items-center justify-between bg-slate-800 px-3 py-3">
                  <span className="text-sm font-semibold text-slate-100">Net</span>
                  <span className={cx("text-right text-sm font-semibold tabular-nums", todayNet >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {formatCurrency(todayNet)}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Recent Entries</h3>
                <span className="text-xs text-slate-400">{entries.length} total</span>
              </div>

              <div className="space-y-3">
                {entries.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-100">{e.category}</p>
                        <p className="text-xs text-slate-400">{formatDate(e.date)}</p>
                        {e.notes ? (
                          <p className="mt-1 max-w-44 truncate text-xs italic text-slate-400">{e.notes}</p>
                        ) : null}
                      </div>
                      <span className={cx("shrink-0 text-sm font-medium tabular-nums", e.type === "income" ? "text-emerald-400" : "text-rose-400")}>
                        {e.type === "income" ? "+" : "-"}
                        {formatCurrency(e.amount)}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Button
                        onClick={() => handleEditEntry(e)}
                        variant="secondary"
                        className="h-8 flex-1 text-xs"
                        type="button"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteEntry(e.id)}
                        variant="danger"
                        className="h-8 flex-1 text-xs"
                        type="button"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {entries.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">No entries yet</p>
                )}
              </div>

              <Button onClick={() => navigate("/all-entries")} className="mt-4 w-full">
                See All Entries
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetEntry;