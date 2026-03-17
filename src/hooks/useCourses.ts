"use client";

import { useState, useEffect, useCallback } from "react";
import { coursesAPI, subjectsAPI, type Course, type Subject } from "@/lib/api";

// Hook for fetching courses
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const createCourse = async (data: { name: string; description?: string; color?: string; icon?: string }) => {
    const newCourse = await coursesAPI.create(data);
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = async (courseId: string, data: { name?: string; description?: string; color?: string; icon?: string }) => {
    const updated = await coursesAPI.update(courseId, data);
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)));
    return updated;
  };

  const deleteCourse = async (courseId: string) => {
    await coursesAPI.delete(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

// Hook for fetching a single course
export function useCourse(courseId: string | null) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setCourse(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await coursesAPI.getOne(courseId);
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const createSubject = async (data: { name: string; color?: string; icon?: string }) => {
    if (!courseId) throw new Error("No course selected");
    const newSubject = await subjectsAPI.create(courseId, data);
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjectsCount: prev.subjectsCount + 1,
        subjects: [...prev.subjects, newSubject],
      };
    });
    return newSubject;
  };

  const deleteSubject = async (subjectId: string) => {
    await subjectsAPI.delete(subjectId);
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjectsCount: prev.subjectsCount - 1,
        subjects: prev.subjects.filter((s) => s.id !== subjectId),
      };
    });
  };

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
    createSubject,
    deleteSubject,
  };
}

// Hook for fetching a single subject
export function useSubject(subjectId: string | null) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubject = useCallback(async () => {
    if (!subjectId) {
      setSubject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await subjectsAPI.getOne(subjectId);
      setSubject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subject");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  return {
    subject,
    loading,
    error,
    refetch: fetchSubject,
  };
}
