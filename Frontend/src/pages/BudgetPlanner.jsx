import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { fetchBudgets, createBudget, deleteBudget } from "../api";

const cls = (...values) => values.filter(Boolean).join(" ");

const Card = ({ children, className = "" }) => (
  <section className={cls("rounded-xl border border-slate-800 bg-slate-900 shadow-sm", className)}>{children}</section>
);

const SectionHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
    <div>
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
    {right}
  </div>
);

const Button = ({ variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-500",
    secondary: "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700",
    danger: "border border-rose-700 bg-rose-900/30 text-rose-200 hover:bg-rose-900/50",
    ghost: "text-slate-300 hover:bg-slate-800",
  };

  return <button className={cls(base, styles[variant], className)} {...props} />;
};

const BudgetPlanner = () => {
  const navigate = useNavigate();
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

      if (parseFloat(newBudgetForm.amount) < 0) {
        setError("Budget amount cannot be negative");
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

    if (name === "amount" && value !== "" && Number(value) < 0) {
      setError("Budget amount cannot be negative");
      return;
    }

    if (name === "amount" && error) {
      setError("");
    }

    setNewBudgetForm({
      ...newBudgetForm,
      [name]: value,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BackButton />

        <div className="mt-6 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">Budget Planner</h1>
            <p className="mt-1 text-sm text-slate-400">Set and manage your monthly budgets.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Export Report</Button>
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-rose-700/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-slate-400">Total Budget</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">
              NPR {summary.budget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h2>
            <p className="mt-2 text-xs text-slate-500">For this month</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-400">Total Spent</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">
              NPR {summary.spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${Math.min(summary.spentPercentage, 100)}%` }}
                />
              </div>
              <span className="min-w-11 text-xs text-slate-400">{summary.spentPercentage.toFixed(1)}%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Of total budget used</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-400">Remaining</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">
              NPR {summary.remaining.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              {totals.budget > 0 ? ((summary.remaining / totals.budget) * 100).toFixed(1) : 0}% left to spend
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card>
              <SectionHeader title="Add New Budget" subtitle="Create a budget by category and period." />
              <form onSubmit={handleAddBudget} className="space-y-4 p-5">
                <div>
                  <label htmlFor="budget-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Budget Name
                  </label>
                  <input
                    id="budget-name"
                    type="text"
                    name="name"
                    placeholder="Monthly Food Budget"
                    value={newBudgetForm.name}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="budget-category" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <select
                    id="budget-category"
                    name="category"
                    value={newBudgetForm.category}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="budget-amount" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Budget Amount
                    </label>
                    <input
                      id="budget-amount"
                      type="number"
                      min="0"
                      name="amount"
                      placeholder="Amount"
                      value={newBudgetForm.amount}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="budget-period" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Period
                    </label>
                    <select
                      id="budget-period"
                      name="period"
                      value={newBudgetForm.period}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Set budget color ${color}`}
                        onClick={() => setNewBudgetForm({ ...newBudgetForm, color })}
                        className={cls(
                          "h-7 w-7 rounded-full transition-colors",
                          color,
                          newBudgetForm.color === color ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900" : "ring-1 ring-slate-700"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Budget"}
                </Button>
              </form>
            </Card>

            <Card>
              <SectionHeader
                title="Your Budgets"
                subtitle="Track budget usage and remaining balance by category."
                right={<span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">{budgets.length} budgets</span>}
              />

              <div className="max-h-[560px] divide-y divide-slate-800 overflow-y-auto">
                {budgets && budgets.length > 0 ? (
                  budgets.map((budget) => {
                    const percentage = getPercentage(budget.spent, budget.amount);
                    const isOverBudget = budget.spent > budget.amount;
                    const progressColor = getProgressColor(percentage);

                    return (
                      <div key={budget.id} className="px-5 py-4 transition-colors hover:bg-slate-800/40">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-medium text-slate-100">{budget.category}</h3>
                            <p className="mt-1 text-xs text-slate-400">
                              Budget: NPR {parseFloat(budget.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 text-right">
                            <div>
                              <p className={cls("text-lg font-semibold", isOverBudget ? "text-rose-300" : "text-slate-100")}>
                                NPR {parseFloat(budget.spent).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </p>
                              <p className="text-xs text-slate-500">
                                / {parseFloat(budget.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                            <Button variant="danger" className="px-2.5 py-1 text-xs" onClick={() => handleDeleteBudget(budget.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div className={cls(progressColor, "h-1.5 rounded-full transition-all duration-300")} style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400">{percentage.toFixed(0)}% used</span>
                            {isOverBudget ? (
                              <span className="font-medium text-rose-300">
                                Over budget by NPR {(budget.spent - budget.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-slate-400">
                    {loading ? "Loading budgets..." : "No budgets yet. Add one to get started."}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Card>
              <SectionHeader
                title="Budget Suggestions"
                subtitle="Recommendations based on your current spending behavior."
              />

              <div className="space-y-3 p-5">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                      <h3 className="text-sm font-semibold text-slate-100">{suggestion.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{suggestion.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="primary" className="px-3 py-1.5 text-xs" onClick={() => navigate("/dashboard")}>
                          {suggestion.action}
                        </Button>
                        <Button variant="secondary" className="px-3 py-1.5 text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                    Keep spending below 80% of your budgets for better recommendations.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader title="Quick Budget Tips" subtitle="Simple practices to stay financially disciplined." />

              <ul className="space-y-3 p-5 text-sm text-slate-300">
                {[
                  "Track daily expenses to stay within budget.",
                  "Set aside 20% of income for savings first.",
                  "Review and adjust budgets monthly.",
                  "Build an emergency fund for unexpected expenses.",
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
