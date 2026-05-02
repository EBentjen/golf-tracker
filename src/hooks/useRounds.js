import { useState, useEffect } from 'react';

export const STORAGE_KEY = 'golf_rounds';
export const TARGETS_KEY = 'golf_targets';
export const COURSES_KEY = 'golf_courses';
export const PRACTICE_KEY = 'golf_practice_sessions';

const DEFAULT_TARGETS = { score: 85, fairways: 9, gir: 9, putts: 30 };

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

  function replaceRounds(nextRounds) {
    setRounds(Array.isArray(nextRounds) ? nextRounds : []);
  }

  return { rounds, addRound, deleteRound, replaceRounds };
}

export function useCourses() {
  const [courses, setCourses] = useState(() => {
    try {
      const raw = localStorage.getItem(COURSES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  function saveCourseData(courseName, tees, courseRating, slopeRating) {
    if (!courseName || !tees) return;
    const key = `${courseName.trim().toLowerCase()}|${tees.trim().toLowerCase()}`;
    const updated = { ...courses, [key]: { courseRating, slopeRating } };
    setCourses(updated);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  }

  function lookupCourse(courseName, tees) {
    if (!courseName || !tees) return null;
    const key = `${courseName.trim().toLowerCase()}|${tees.trim().toLowerCase()}`;
    return courses[key] ?? null;
  }

  return { saveCourseData, lookupCourse };
}

function loadPracticeSessions() {
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function usePracticeSessions() {
  const [sessions, setSessions] = useState(loadPracticeSessions);

  useEffect(() => {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  function addPracticeSession(session) {
    setSessions((prev) => [
      {
        ...session,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function deletePracticeSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function replacePracticeSessions(nextSessions) {
    setSessions(Array.isArray(nextSessions) ? nextSessions : []);
  }

  return { sessions, addPracticeSession, deletePracticeSession, replacePracticeSessions };
}

export function useTargets() {
  const [targets, setTargets] = useState(() => {
    try {
      const raw = localStorage.getItem(TARGETS_KEY);
      return raw ? { ...DEFAULT_TARGETS, ...JSON.parse(raw) } : DEFAULT_TARGETS;
    } catch {
      return DEFAULT_TARGETS;
    }
  });

  function saveTargets(t) {
    setTargets(t);
    localStorage.setItem(TARGETS_KEY, JSON.stringify(t));
  }

  return { targets, saveTargets };
}
