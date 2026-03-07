import { useState, useEffect } from 'react';

const STORAGE_KEY = 'golf_rounds';

function loadRounds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRounds() {
  const [rounds, setRounds] = useState(loadRounds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  }, [rounds]);

  function addRound(round) {
    setRounds((prev) => [
      ...prev,
      { ...round, id: crypto.randomUUID() },
    ]);
  }

  function deleteRound(id) {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  }

  return { rounds, addRound, deleteRound };
}
