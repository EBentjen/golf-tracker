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

  function deleteRound(id) {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  }

  return { rounds, addRound, deleteRound };
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
