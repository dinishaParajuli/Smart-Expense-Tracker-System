import React, { useState, useCallback, useMemo, useEffect } from "react";
import BackButton from "../components/BackButton";
import { fetchBudgets, createBudget, deleteBudget } from "../api";

const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBudgetForm, setNewBudgetForm] = useState({
    name: "",
    category: "",
    amount: "",
    period: "monthly",
    color: "bg-blue-500",
  });

  const colorOptions = [
    "bg-yellow-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ];

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Utilities",
    "Other",
  ];

  // Fetch budgets from backend
  const fetchBudgetsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBudgets();
      setBudgets(data);
      setError("");
    } catch (err) {
      setError(err.message || "Error fetching budgets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgetsData();
  }, [fetchBudgetsData]);

  const handleAddBudget = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newBudgetForm.category || !newBudgetForm.amount) {
        setError("Please fill in all required fields");
        return;
      }

      setLoading(true);
      try {
        const newBudget = await createBudget({
          name: newBudgetForm.name || newBudgetForm.category,
          category: newBudgetForm.category,
          amount: parseFloat(newBudgetForm.amount),
          period: newBudgetForm.period,
          color: newBudgetForm.color,
        });

        setBudgets([...budgets, newBudget]);
        setNewBudgetForm({
          name: "",
          category: "",
          amount: "",
          period: "monthly",
          color: "bg-blue-500",
        });
        setError("");
      } catch (err) {
        setError(err.message || "Error adding budget");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [newBudgetForm, budgets]
  );

  const handleDeleteBudget = useCallback(
    async (budgetId) => {
      if (!window.confirm("Are you sure you want to delete this budget?"))
        return;

      setLoading(true);
      try {
        await deleteBudget(budgetId);
        setBudgets(budgets.filter((b) => b.id !== budgetId));
        setError("");
      } catch (err) {
        setError(err.message || "Error deleting budget");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [budgets]
  );

  // Memoized calculation for totals
  const totals = useMemo(
    () => ({
      budget: budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0),
      spent: budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0),
    }),
    [budgets]
  );

  const summary = useMemo(
    () => ({
      ...totals,
      remaining: totals.budget - totals.spent,
      spentPercentage: totals.budget > 0 ? (totals.spent / totals.budget) * 100 : 0,
    }),
    [totals]
  );

  // Memoized helper functions
  const getPercentage = useCallback((spent, budget) => {
    return Math.min((spent / budget) * 100, 100);
  }, []);

  const getProgressColor = useCallback((percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  }, []);

  // AI Suggestions based on budgets
  const suggestions = useMemo(() => {
    return budgets
      .filter((b) => parseFloat(b.spent) > parseFloat(b.amount) * 0.8)
      .map((budget, idx) => ({
        id: idx,
        title: `Optimize ${budget.category} Budget`,
        description: `You're spending ${getPercentage(budget.spent, budget.amount).toFixed(0)}% of your ${budget.category} budget. Consider reviewing your spending.`,
        category: budget.category,
        action: "Review Spending",
      }))
      .slice(0, 3);
  }, [budgets, getPercentage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudgetForm({
      ...newBudgetForm,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Budget Planner
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Set and manage your monthly budgets
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition duration-300 transform hover:scale-105">
            Export Report
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition duration-300 shadow-lg transform hover:scale-105">
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition duration-300 transform hover:scale-105">
          <p className="text-gray-400 text-sm">Total Budget</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            NPR {summary.budget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h2>
          <p className="text-xs text-gray-500 mt-2">For this month</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition duration-300 transform hover:scale-105">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <h2 className="text-3xl font-bold text-red-400 mt-2">
            NPR {summary.spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.spentPercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 min-w-12">
              {summary.spentPercentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">of total budget used</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition duration-300 transform hover:scale-105">
          <p className="text-gray-400 text-sm">Remaining</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            NPR {summary.remaining.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            {totals.budget > 0 ? ((summary.remaining / totals.budget) * 100).toFixed(1) : 0}% left to spend
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Add Budget Form */}
        <div className="space-y-6">
          {/* Add Budget Form */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition duration-300">
            <div className="p-5 border-b border-gray-700 bg-gray-800/30">
              <h2 className="font-semibold text-lg">Add New Budget</h2>
            </div>

            <form onSubmit={handleAddBudget} className="p-5 space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Budget Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Monthly Food Budget"
                  value={newBudgetForm.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={newBudgetForm.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={newBudgetForm.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Period
                </label>
                <select
                  name="period"
                  value={newBudgetForm.period}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setNewBudgetForm({ ...newBudgetForm, color })
                      }
                      className={`w-8 h-8 rounded-full ${color} ${
                        newBudgetForm.color === color
                          ? "ring-2 ring-white"
                          : "ring-1 ring-gray-600"
                      } transition`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-medium transition duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Budget"}
              </button>
            </form>
          </div>

          {/* Budget Categories */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition duration-300">
            <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800/30">
              <h2 className="font-semibold text-lg">Your Budgets</h2>
              <span className="text-xs text-gray-400">{budgets.length} budgets</span>
            </div>

            <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
              {budgets && budgets.length > 0 ? (
                budgets.map((budget) => {
                  const percentage = getPercentage(budget.spent, budget.amount);
                  const isOverBudget = budget.spent > budget.amount;
                  const progressColor = getProgressColor(percentage);

                  return (
                    <div
                      key={budget.id}
                      className="p-5 hover:bg-gray-700/50 transition duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-base hover:text-blue-400 transition">
                            {budget.category}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Budget: NPR{" "}
                            {parseFloat(budget.amount).toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <span
                              className={`font-bold text-lg transition ${
                                isOverBudget ? "text-red-400" : "text-white"
                              }`}
                            >
                              NPR{" "}
                              {parseFloat(budget.spent).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            <span className="text-gray-400 text-sm block">
                              / {parseFloat(budget.amount).toLocaleString("en-IN", { maximumFractionDigits: 0})}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`${progressColor} h-3 rounded-full transition-all duration-500 shadow-lg`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-gray-400 font-medium">
                            {percentage.toFixed(0)}% used
                          </span>
                          {isOverBudget && (
                            <span className="text-red-400 font-semibold animate-pulse">
                              ⚠️ Over budget by NPR{" "}
                              {(budget.spent - budget.amount).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-5 text-center text-gray-400">
                  {loading ? "Loading budgets..." : "No budgets yet. Add one to get started!"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Suggestions */}
        <div className="space-y-6">
          {/* AI Suggestions Header */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-5 border border-purple-500/50 backdrop-blur-sm hover:border-purple-500/70 transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl animate-pulse">🤖</span>
              <h2 className="font-bold text-xl">AI Budget Suggestions</h2>
            </div>
            <p className="text-sm text-gray-300">
              Personalized recommendations based on your spending habits
            </p>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.id}
                  className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-blue-500/50 transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base hover:text-blue-400 transition">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-1.5 rounded-lg text-sm font-medium transition duration-300 transform hover:scale-105">
                          {suggestion.action}
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-lg text-sm transition duration-300 transform hover:scale-105">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 text-center text-gray-400">
                Keep spending below 80% of your budgets for better recommendations!
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition duration-300">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">📌</span> Quick Budget Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                "Track daily expenses to stay within budget",
                "Set aside 20% of income for savings first",
                "Review and adjust budgets monthly",
                "Build emergency fund for unexpected expenses",
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 hover:text-gray-100 transition">
                  <span className="text-green-400 font-bold text-lg mt-0.5">✓</span>
                  <span className="flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
