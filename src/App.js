import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Target, Trophy, Plus, Edit2, Trash2,
  CheckCircle, Flame, Sparkles, TrendingUp, Star
} from 'lucide-react';

function App() {
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([
    { id: 1, title: "No online food delivery this month", reward: 500, completed: false, daysLeft: 12 },
    { id: 2, title: "Save NPR 5,000 every week", reward: 300, completed: true, daysLeft: 0 },
    { id: 3, title: "30-day no shopping challenge", reward: 800, completed: false, daysLeft: 8 }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    deadline: '',
    category: 'Savings',
    notes: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/goals')
      .then(response => setGoals(response.data))
      .catch(error => console.error("Failed to load goals:", error));
  }, []);

  const handleInputChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target) {
      alert("Please fill Goal Title and Target Amount");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/goals', newGoal);
      setGoals([...goals, response.data]);
      setNewGoal({ title: '', target: '', deadline: '', category: 'Savings', notes: '' });
      alert("Goal saved successfully! 🎉");
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Failed to save goal. Check if backend is running.");
    }
  };

  const addProgress = async (id) => {
    const amountStr = prompt("How much did you add towards this goal? (NRP)");
    const amount = Number(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) return;
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;
      const newCurrent = Math.min(goal.current + amount, goal.target);
      const response = await axios.put(`http://localhost:5000/api/goals/${id}`, { current: newCurrent });
      setGoals(goals.map(g => g.id === id ? { ...g, current: response.data.current } : g));
    } catch (error) {
      alert("Failed to update progress.");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      alert("Failed to delete goal.");
    }
  };

  const toggleChallenge = (id) => {
    setChallenges(challenges.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    alert("Great job! Reward points added 🎉");
  };

  const categoryColors = {
    Savings: 'from-blue-600 to-blue-500',
    Education: 'from-violet-600 to-violet-500',
    Vehicle: 'from-amber-600 to-amber-500',
    Travel: 'from-teal-600 to-teal-500',
    Gadget: 'from-indigo-600 to-indigo-500',
    Home: 'from-orange-600 to-orange-500',
    'Debt Payoff': 'from-rose-600 to-rose-500',
  };

  const categoryIcon = {
    Savings: '💰',
    Education: '📚',
    Vehicle: '🚗',
    Travel: '✈️',
    Gadget: '📱',
    Home: '🏠',
    'Debt Payoff': '💳',
  };

  return (
    <div className="min-h-screen pb-16 animate-fade-in" style={{ background: 'var(--navy-900)' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #0f1e3d 0%, rgba(10,20,40,0.95) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button style={{
              padding: '7px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <ArrowLeft size={18} className="text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                Goals & Challenges
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Track progress • Stay motivated • Earn rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Nitika <span style={{
                  background: 'linear-gradient(90deg,#f59e0b,#fcd34d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}>• Premium</span>
              </div>
              <div className="text-base font-bold" style={{ color: '#10b981', letterSpacing: '-0.01em' }}>
                NRP 28,450{' '}
                <span className="text-xs font-medium" style={{
                  background: 'rgba(16,185,129,0.15)',
                  color: '#34d399',
                  padding: '1px 6px',
                  borderRadius: '6px',
                }}>↑12%</span>
              </div>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            }}>
              N
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Active Goals */}
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Active Goals</p>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Target size={14} style={{ color: '#60a5fa' }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
              {goals.length}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>in progress</p>
          </div>

          {/* Completed Goals */}
          <div className="stat-card animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Completed</p>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle size={14} style={{ color: '#34d399' }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#10b981', letterSpacing: '-0.03em' }}>4</p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>goals achieved</p>
          </div>

          {/* Reward Points */}
          <div className="stat-card animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Reward Points</p>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(139,92,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Star size={14} style={{ color: '#a78bfa' }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#8b5cf6', letterSpacing: '-0.03em' }}>2,340</p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>pts earned</p>
          </div>

          {/* Streak */}
          <div className="stat-card animate-slide-up" style={{
            animationDelay: '180ms',
            background: 'linear-gradient(145deg, #1a1f35 0%, #141929 100%)',
            borderColor: 'rgba(245,158,11,0.2)',
          }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Streak</p>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Flame size={14} style={{ color: '#fbbf24' }} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>14</p>
              <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>days 🔥</p>
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>keep it up!</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left - Create Goal Form */}
          <div className="lg:col-span-4 card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} style={{ color: '#a78bfa' }} />
              </div>
              <h2 className="text-base font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                Create New Goal
              </h2>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-subtle)' }}>
                  Goal Title
                </label>
                <input
                  name="title"
                  value={newGoal.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. New smartphone for online classes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-subtle)' }}>
                    Target (NRP)
                  </label>
                  <input
                    name="target"
                    type="number"
                    value={newGoal.target}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="150,000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-subtle)' }}>
                    Target Date
                  </label>
                  <input
                    name="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-subtle)' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={newGoal.category}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ colorScheme: 'dark' }}
                >
                  <option>Savings</option>
                  <option>Education</option>
                  <option>Vehicle</option>
                  <option>Travel</option>
                  <option>Gadget</option>
                  <option>Home</option>
                  <option>Debt Payoff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-subtle)' }}>
                  Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={newGoal.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ height: '80px', resize: 'none' }}
                  placeholder="Any special notes or motivation..."
                />
              </div>

              <button type="submit" className="btn-primary w-full mt-2" style={{ padding: '10px 20px' }}>
                <Plus size={16} />
                Save Goal
              </button>
            </form>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

            {/* Tips compact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: '16px' }}>💡</span>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-subtle)' }}>
                  Quick Tips
                </p>
              </div>
              <ul className="space-y-2">
                {[
                  'Break big goals into small weekly targets',
                  'Track progress every Sunday evening',
                  'Review & adjust goals on 1st of month',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: '#3b82f6', marginTop: '1px' }}>›</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right - Active Goals */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="section-title text-white">
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Target size={14} style={{ color: '#a78bfa' }} />
                </div>
                Active Goals
              </h2>
              <button className="text-xs font-medium transition-colors" style={{ color: '#60a5fa' }}
                onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
                onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
              >
                View completed →
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="card p-10 text-center" style={{ animationDelay: '250ms' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Target size={22} style={{ color: '#60a5fa' }} />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">No active goals yet</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Create your first goal using the form on the left
                  </p>
                </div>
              ) : (
                goals.map((goal, idx) => {
                  const progress = Math.min(100, Math.floor((goal.current / goal.target) * 100));
                  const remaining = goal.target - goal.current;
                  const gradientClass = categoryColors[goal.category] || 'from-blue-600 to-blue-500';
                  const icon = categoryIcon[goal.category] || '🎯';

                  return (
                    <div key={goal.id} className="card card-hover p-5 animate-slide-up"
                      style={{ animationDelay: `${250 + idx * 60}ms` }}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                            background: `linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(79,70,229,0.2) 100%)`,
                            border: '1px solid rgba(59,130,246,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px'
                          }}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate" style={{ letterSpacing: '-0.01em' }}>
                              {goal.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span style={{
                                fontSize: '11px', fontWeight: 500,
                                color: '#94a3b8',
                              }}>{goal.category}</span>
                              {goal.deadline !== 'No deadline' && (
                                <>
                                  <span style={{ color: '#334155', fontSize: '10px' }}>•</span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Due {goal.deadline}</span>
                                </>
                              )}
                            </div>
                            {goal.notes && (
                              <p className="text-xs mt-1 italic truncate" style={{ color: '#475569' }}>
                                {goal.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-bold" style={{ color: '#10b981', letterSpacing: '-0.01em' }}>
                            NRP {goal.current.toLocaleString()}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            of {goal.target.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs mt-1.5">
                          <span style={{ color: 'var(--text-muted)' }}>{progress}% achieved</span>
                          <span style={{ color: '#34d399' }}>NRP {remaining.toLocaleString()} left</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => addProgress(goal.id)} className="btn-emerald flex-1">
                          <TrendingUp size={13} /> Log Progress
                        </button>
                        <button className="btn-ghost">
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => deleteGoal(goal.id)} className="btn-danger">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="mt-10">
          <div className="flex items-center gap-2.5 mb-5">
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={16} style={{ color: '#fbbf24' }} />
            </div>
            <h2 className="text-xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
              Current Challenges
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((challenge, idx) => (
              <div
                key={challenge.id}
                className="card card-hover p-5 relative overflow-hidden animate-slide-up"
                style={{
                  animationDelay: `${idx * 70}ms`,
                  borderColor: challenge.completed
                    ? 'rgba(16,185,129,0.2)'
                    : 'rgba(255,255,255,0.07)',
                }}
              >
                {/* Subtle top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: challenge.completed
                    ? 'linear-gradient(90deg,#059669,#10b981)'
                    : idx === 0
                      ? 'linear-gradient(90deg,#2563eb,#4f46e5)'
                      : idx === 2
                        ? 'linear-gradient(90deg,#7c3aed,#a855f7)'
                        : 'linear-gradient(90deg,#d97706,#f59e0b)',
                  opacity: 0.7
                }} />

                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white leading-snug"
                      style={{ letterSpacing: '-0.01em' }}>
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {!challenge.completed && (
                        <span style={{
                          fontSize: '11px', color: 'var(--text-muted)',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 7px', borderRadius: '5px',
                        }}>
                          {challenge.daysLeft}d left
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: '#fbbf24',
                        background: 'rgba(245,158,11,0.1)',
                        padding: '2px 7px', borderRadius: '5px',
                      }}>
                        +{challenge.reward} pts
                      </span>
                    </div>
                  </div>

                  {challenge.completed ? (
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', flexShrink: 0 }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Banner */}
        <div className="mt-8 rounded-2xl p-6 border animate-slide-up" style={{
          background: 'linear-gradient(135deg, #111827 0%, #0f1e3d 50%, #111827 100%)',
          borderColor: 'rgba(59,130,246,0.15)',
          boxShadow: '0 0 40px rgba(59,130,246,0.06)',
        }}>
          <div className="flex gap-4">
            <div style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>💡</div>
            <div>
              <h3 className="text-sm font-bold text-white mb-3" style={{ letterSpacing: '-0.01em' }}>
                Tips for Reaching Goals Faster
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                {[
                  'Break big goals into small weekly targets',
                  'Track progress every Sunday evening',
                  'Reward yourself for small milestones',
                  'Review & adjust goals on the 1st of every month',
                  'Share your goals with a friend for accountability',
                ].map((tip, i) => (
                  <p key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-subtle)' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 700, marginTop: '1px' }}>›</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;