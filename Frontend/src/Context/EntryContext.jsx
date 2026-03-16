import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../api';

const EntryContext = createContext();

const hasAccessToken = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem('access_token'));
};

export function EntryProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshEntries = useCallback(async () => {
    if (!hasAccessToken()) {
      setError('');
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchTransactions();
      setEntries(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || 'Unable to load transactions.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccessToken()) {
      refreshEntries().catch(() => {});
    }
  }, []);

  const addEntry = async (entry) => {
    if (hasAccessToken()) {
      const createdEntry = await createTransaction(entry);
      setEntries((prev) => [createdEntry, ...prev]);
      setError('');
      return createdEntry;
    }

    const newEntry = {
      id: Date.now(),
      ...entry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const deleteEntryById = async (id) => {
    if (hasAccessToken()) {
      await deleteTransaction(id);
      setError('');
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const updateEntryById = async (id, updatedEntry) => {
    if (hasAccessToken()) {
      const savedEntry = await updateTransaction(id, updatedEntry);
      setEntries((prev) => prev.map((entry) => (entry.id === id ? savedEntry : entry)));
      setError('');
      return savedEntry;
    }

    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...updatedEntry } : entry)));
    return { id, ...updatedEntry };
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
    <EntryContext.Provider
      value={{
        entries,
        loading,
        error,
        refreshEntries,
        addEntry,
        deleteEntry: deleteEntryById,
        updateEntry: updateEntryById,
        getEntriesByCategory,
        getTotalByType,
      }}
    >
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
