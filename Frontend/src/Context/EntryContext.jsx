import React, { createContext, useState, useContext } from 'react';

const EntryContext = createContext();

export function EntryProvider({ children }) {
  const [entries, setEntries] = useState([]);

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      ...entry,
      createdAt: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    return newEntry;
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id, updatedEntry) => {
    setEntries(entries.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry));
  };

  const getEntriesByCategory = (category) => {
    return entries.filter(entry => entry.category === category);
  };

  const getTotalByType = (type) => {
    return entries
      .filter(entry => entry.type === type)
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  };

  return (
    <EntryContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry, getEntriesByCategory, getTotalByType }}>
      {children}
    </EntryContext.Provider>
  );
}

export function useEntry() {
  const context = useContext(EntryContext);
  if (!context) {
    throw new Error('useEntry must be used within EntryProvider');
  }
  return context;
}
