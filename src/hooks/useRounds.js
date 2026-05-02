import { useState, useEffect } from 'react';

const KEY = 'golf_rounds';

export function useRounds() {
  const [rounds, setRounds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(rounds));
  }, [rounds]);

  function addRound(round) {
    setRounds(prev => [{ ...round, id: Date.now() }, ...prev]);
  }

  function deleteRound(id) {
    setRounds(prev => prev.filter(r => r.id !== id));
  }

  return { rounds, addRound, deleteRound };
}
