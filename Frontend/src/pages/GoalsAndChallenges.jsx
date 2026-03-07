// src/pages/GoalsAndChallengesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Target, Trophy, Plus, Edit2, Trash2, 
  CheckCircle 
} from 'lucide-react';

function GoalsAndChallengesPage() {
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

  // Load goals from backend
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/goals');
        setGoals(response.data);
      } catch (error) {
        console.error("Failed to load goals:", error);
        setGoals([]); // fallback
      }
    };
    fetchGoals();
  }, []);

  const handleInputChange = e => setNewGoal({ ...newGoal, [e.target.name]: e.target.value });

  const handleAddGoal = async e => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target) {
      alert("Please fill Goal Title and Target Amount");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/goals', newGoal);
      setGoals([...goals, response.data]);
      setNewGoal({ title: '', target: '', deadline: '', category: 'Savings', notes: '' });
      alert("Goal saved successfully! 🎉");
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
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newCurrent = Math.min((goal.current || 0) + amount, goal.target);

      const response = await axios.put(`http://localhost:8000/api/goals/${id}`, {
        current: newCurrent
      });

      setGoals(goals.map(g =>
        g.id === id ? { ...g, current: response.data.current } : g
      ));
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    }
  };

  const deleteGoal = async id => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal.");
    }
  };

  const toggleChallenge = id => {
    setChallenges(challenges.map(c =>
      c.id === id ? { ...c, completed: !c.completed } : c
    ));
    alert("Great job! Reward points added 🎉");
  };

  return (
    <div className="min-h-screen bg-[#0a1428] text-white pb-20">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-gray-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-gray-700 rounded-xl transition-colors">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Goals & Challenges</h1>
            <p className="text-gray-400 text-sm mt-1">Track progress • Stay motivated • Earn rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">Nitika • Premium</div>
            <div className="text-2xl font-semibold text-emerald-400">
              NRP 28,450 <span className="text-sm">↑12% saved</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            N
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#1e293b] rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Active Goals</p>
            <p className="text-5xl font-bold mt-2">{goals.length}</p>
          </div>
          <div className="bg-[#1e293b] rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Completed Goals</p>
            <p className="text-5xl font-bold mt-2 text-emerald-400">4</p>
          </div>
          <div className="bg-[#1e293b] rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Reward Points</p>
            <p className="text-5xl font-bold mt-2 text-purple-400">2,340</p>
          </div>
          <div className="bg-[#1e293b] rounded-3xl p-6 flex items-center gap-5">
            <Trophy className="text-yellow-400" size={48} />
            <div>
              <p className="text-gray-400 text-sm">Current Streak</p>
              <p className="text-4xl font-bold">14 days 🔥</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left - Add Goal Form */}
          <div className="lg:col-span-5 bg-[#1e293b] rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center">
                <Target className="text-purple-500" size={32} />
              </div>
              <h2 className="text-3xl font-semibold">Create New Goal</h2>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Goal Title</label>
                <input
                  name="title"
                  value={newGoal.title}
                  onChange={handleInputChange}
                  className="w-full bg-[#334155] border border-gray-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g. New smartphone for online classes"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Target (NRP)</label>
                  <input
                    name="target"
                    type="number"
                    value={newGoal.target}
                    onChange={handleInputChange}
                    className="w-full bg-[#334155] border border-gray-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
                    placeholder="150000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Target Date</label>
                  <input
                    name="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={handleInputChange}
                    className="w-full bg-[#334155] border border-gray-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category</label>
                <select
                  name="category"
                  value={newGoal.category}
                  onChange={handleInputChange}
                  className="w-full bg-[#334155] border border-gray-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
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
                <label className="block text-gray-400 text-sm mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={newGoal.notes}
                  onChange={handleInputChange}
                  className="w-full bg-[#334155] border border-gray-700 rounded-2xl px-5 py-4 h-28 text-lg focus:outline-none focus:border-blue-500"
                  placeholder="Any special notes or motivation..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-5 rounded-2xl text-xl font-semibold flex items-center justify-center gap-3 mt-4"
              >
                <Plus size={28} /> Save Goal
              </button>
            </form>
          </div>

          {/* Right - Active Goals */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold flex items-center gap-3">
                <Target className="text-purple-500" size={32} /> Active Goals
              </h2>
              <span className="text-blue-400 hover:underline cursor-pointer">View completed →</span>
            </div>

            <div className="space-y-6">
              {goals.length === 0 ? (
                <div className="bg-[#1e293b] rounded-3xl p-12 text-center text-gray-400">
                  No goals yet — create your first goal on the left!
                </div>
              ) : (
                goals.map(goal => {
                  const progress = Math.min(100, Math.floor(((goal.current || 0) / goal.target) * 100));
                  const remaining = goal.target - (goal.current || 0);
                  return (
                    <div key={goal.id} className="bg-[#1e293b] rounded-3xl p-7">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-5">
                          <div className="w-14 h-14 bg-purple-600/15 rounded-2xl flex items-center justify-center shrink-0">
                            <Target className="text-purple-500" size={32} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold">{goal.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {goal.category} • {goal.deadline || 'No deadline'}
                            </p>
                            {goal.notes && (
                              <p className="text-gray-500 text-sm mt-2 italic">{goal.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-3xl font-bold text-emerald-400">
                            NRP {(goal.current || 0).toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            of NRP {goal.target.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-gray-700 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm mt-2 text-gray-400">
                        <span>{progress}% achieved</span>
                        <span className="text-emerald-400">
                          NRP {remaining.toLocaleString()} remaining
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-8">
                        <button
                          onClick={() => addProgress(goal.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 py-4 rounded-2xl font-medium transition-colors"
                        >
                          + Log Progress
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2">
                          <Edit2 size={20} /> Edit
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="bg-red-600/80 hover:bg-red-700 py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={20} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="text-yellow-400" size={36} />
            <h2 className="text-3xl font-semibold">Current Challenges</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map(challenge => (
              <div
                key={challenge.id}
                className={`bg-[#1e293b] rounded-3xl p-8 transition-all ${
                  challenge.completed ? 'opacity-70 ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold leading-tight">{challenge.title}</h3>
                    <p className="text-sm text-gray-400 mt-3">
                      {challenge.daysLeft} days left • +{challenge.reward.toLocaleString()} pts
                    </p>
                  </div>
                  {challenge.completed ? (
                    <CheckCircle className="text-emerald-500 shrink-0" size={40} />
                  ) : (
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      className="px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GoalsAndChallengesPage;