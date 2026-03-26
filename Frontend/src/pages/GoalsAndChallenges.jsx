// src/pages/GoalsAndChallengesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Plus, Edit2, Trash2, 
  CheckCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../api';

const DEFAULT_CHALLENGES = [
  { id: 1, title: 'No online food delivery this month', reward: 500, completed: false, daysLeft: 12, progress: 0, total: 100 },
  { id: 2, title: 'Save NPR 5,000 every week', reward: 300, completed: true, daysLeft: 0, progress: 100, total: 100 },
  { id: 3, title: '30-day no shopping challenge', reward: 800, completed: false, daysLeft: 8, progress: 0, total: 100 },
];

const cx = (...classes) => classes.filter(Boolean).join(' ');

const Card = ({ children, className = '' }) => (
  <section className={cx('rounded-2xl border border-slate-700 bg-[#111827] shadow-sm', className)}>{children}</section>
);

const SectionHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-700 px-6 py-5">
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
    {right}
  </div>
);

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'border border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600',
    danger: 'border border-rose-700 bg-rose-900/50 text-rose-200 hover:bg-rose-800/60',
  };

  return <button className={cx(base, variants[variant], className)} {...props} />;
};

const Input = ({ className = '', ...props }) => (
  <input
    className={cx(
      'w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
      className
    )}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={cx(
      'w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
      className
    )}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={cx(
      'h-28 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
      className
    )}
    {...props}
  />
);

function GoalsAndChallengesPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'user';
  const userInitial = username.charAt(0).toUpperCase() || 'U';

  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    deadline: '',
    category: 'Savings',
    notes: ''
  });

  // Load goals from backend
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [goalsResponse, challengesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/goals/`, { headers }),
          axios.get(`${API_BASE_URL}/api/auth/challenges/`, { headers }),
        ]);

        setGoals(goalsResponse.data || []);
        setChallenges(challengesResponse.data || []);
      } catch (error) {
        console.error('Failed to load goals/challenges:', error);
        setGoals([]);
        setChallenges(DEFAULT_CHALLENGES);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = e => setNewGoal({ ...newGoal, [e.target.name]: e.target.value });

  const handleAddGoal = async e => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target || !newGoal.deadline) {
      alert("Please fill Goal Title, Target Amount, and Target Date");
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        title: newGoal.title,
        target: newGoal.target,
        current: 0,
        deadline: newGoal.deadline,
        category: newGoal.category,
        notes: newGoal.notes,
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/goals/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals([...goals, response.data]);
      setNewGoal({ title: '', target: '', deadline: '', category: 'Savings', notes: '' });
      alert("Goal saved successfully.");
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Failed to save goal.");
    }
  };

  const addProgress = async id => {
    const amountStr = prompt("How much did you add towards this goal? (NRP)");
    const amount = Number(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) return;

    try {
      const token = localStorage.getItem('access_token');
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newCurrent = Math.min(Number(goal.current || 0) + amount, Number(goal.target || 0));

      const response = await axios.patch(`${API_BASE_URL}/api/auth/goals/${id}/`, {
        current: newCurrent
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGoals(goals.map(g =>
        g.id === id ? response.data : g
      ));
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    }
  };

  const deleteGoal = async id => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_URL}/api/auth/goals/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal.");
    }
  };

  const toggleChallenge = async id => {
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return;

    try {
      const token = localStorage.getItem('access_token');
      const completed = !challenge.completed;
      const response = await axios.patch(`${API_BASE_URL}/api/auth/challenges/${id}/`, {
        progress: completed ? Number(challenge.total || 100) : 0,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChallenges(challenges.map(c => (c.id === id ? response.data : c)));
      alert('Great job. Reward points updated.');
    } catch (error) {
      console.error('Error updating challenge:', error);
      alert('Failed to update challenge.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] pb-14 text-slate-100">
      <header className="border-b border-slate-800 bg-[#0f172a]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/features')}
              className="rounded-xl border border-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              title="Back to Home"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Goals & Challenges</h1>
              <p className="mt-0.5 text-sm text-slate-300">Track progress and stay consistent with your financial goals.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#111827] px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200">{username}</p>
              <p className="text-xs text-slate-400">{role === 'admin' ? 'Admin' : 'User'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700 text-sm font-semibold text-slate-200">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active Goals</p>
            <p className="mt-2 text-3xl font-semibold text-white">{goals.length}</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed Goals</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">4</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reward Points</p>
            <p className="mt-2 text-3xl font-semibold text-white">2,340</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Streak</p>
            <p className="mt-2 text-3xl font-semibold text-white">14 days</p>
            <p className="mt-1 text-xs text-slate-500">Consistent savings habit</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Card>
              <SectionHeader title="Create New Goal" subtitle="Add a measurable target and timeline." />
              <form onSubmit={handleAddGoal} className="space-y-5 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Goal Title</label>
                  <Input
                    name="title"
                    value={newGoal.title}
                    onChange={handleInputChange}
                    placeholder="New smartphone for online classes"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Target (NPR)</label>
                    <Input
                      name="target"
                      type="number"
                      value={newGoal.target}
                      onChange={handleInputChange}
                      placeholder="150000"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Target Date</label>
                    <Input
                      name="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Category</label>
                  <Select name="category" value={newGoal.category} onChange={handleInputChange}>
                    <option>Savings</option>
                    <option>Education</option>
                    <option>Vehicle</option>
                    <option>Travel</option>
                    <option>Gadget</option>
                    <option>Home</option>
                    <option>Debt Payoff</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Notes (optional)</label>
                  <Textarea
                    name="notes"
                    value={newGoal.notes}
                    onChange={handleInputChange}
                    placeholder="Any special notes or motivation"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  <Plus size={16} /> Save Goal
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <Card>
              <SectionHeader
                title="Active Goals"
                subtitle="Monitor progress and update contribution amounts."
                right={<span className="text-xs font-medium text-slate-500">{goals.length} goals</span>}
              />

              <div className="space-y-4 p-6">
                {goals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-sm text-slate-400">
                    No goals yet. Create your first goal from the form.
                  </div>
                ) : (
                  goals.map(goal => {
                    const currentValue = Number(goal.current || 0);
                    const targetValue = Number(goal.target || 0);
                    const progress = targetValue > 0 ? Math.min(100, Math.floor((currentValue / targetValue) * 100)) : 0;
                    const remaining = Math.max(targetValue - currentValue, 0);

                    return (
                      <article key={goal.id} className="rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-sm transition-colors hover:bg-slate-800/60">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{goal.category} • {goal.deadline || 'No deadline'}</p>
                            {goal.notes ? <p className="mt-2 text-sm text-slate-500">{goal.notes}</p> : null}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xl font-semibold text-white">NPR {currentValue.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">of NPR {targetValue.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-slate-500">{progress}% achieved</span>
                          <span className="font-medium text-slate-300">NPR {remaining.toLocaleString()} remaining</span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button onClick={() => addProgress(goal.id)} variant="primary" className="px-3 py-2 text-xs">
                            Log Progress
                          </Button>
                          <Button variant="secondary" className="px-3 py-2 text-xs">
                            <Edit2 size={14} /> Edit
                          </Button>
                          <Button onClick={() => deleteGoal(goal.id)} variant="danger" className="px-3 py-2 text-xs">
                            <Trash2 size={14} /> Delete
                          </Button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <SectionHeader title="Current Challenges" subtitle="Complete tasks to build discipline and earn rewards." />

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {challenges.map(challenge => (
                <article key={challenge.id} className="rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-sm transition-colors hover:bg-slate-800/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{challenge.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {Number(challenge.daysLeft || 0)} days left • +{Number(challenge.reward || 0).toLocaleString()} pts
                      </p>
                    </div>

                    {challenge.completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle size={14} /> Completed
                      </span>
                    ) : null}
                  </div>

                  {!challenge.completed ? (
                    <div className="mt-4">
                      <Button onClick={() => toggleChallenge(challenge.id)} variant="secondary" className="w-full">
                        Mark Complete
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default GoalsAndChallengesPage;