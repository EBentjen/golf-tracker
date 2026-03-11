import { useState, useEffect } from 'react';

const STORAGE_KEY = 'golf_rounds';
const TARGETS_KEY = 'golf_targets';
const COURSES_KEY = 'golf_courses';

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

  function editRound(id, data) {
    setRounds((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r));
  }

  function deleteRound(id) {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  }

  return { rounds, addRound, editRound, deleteRound };
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

  function saveCourseData(courseName, courseRating, slopeRating) {
    if (!courseName) return;
    const key = courseName.trim().toLowerCase();
    const updated = { ...courses, [key]: { courseRating, slopeRating, name: courseName.trim() } };
    setCourses(updated);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  }

  function lookupCourse(courseName) {
    if (!courseName) return null;
    return courses[courseName.trim().toLowerCase()] ?? null;
  }

  const courseNames = Object.values(courses)
    .map((c) => c.name || null)
    .filter(Boolean)
    .sort();

  return { saveCourseData, lookupCourse, courseNames };
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
