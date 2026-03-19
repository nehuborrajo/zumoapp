// Types for API responses
export interface Course {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  subjectsCount: number;
  documentsCount: number;
  flashcardsCount?: number;
  subjects: SubjectSummary[];
}

export interface SubjectSummary {
  id: string;
  name: string;
  color: string;
  documentsCount: number;
  flashcardsCount?: number;
  documents?: DocumentSummary[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  courseName: string;
  documentsCount: number;
  flashcardsCount: number;
  documents: DocumentSummary[];
}

export interface DocumentSummary {
  id: string;
  title: string;
  description: string | null;
  originalFileUrl: string | null;
  processingStatus: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  flashcardsGenerated: boolean;
  questionsGenerated: boolean;
  flashcardsCount: number;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document extends DocumentSummary {
  extractedText: string | null;
  processingError: string | null;
  subject: {
    id: string;
    name: string;
    color: string;
  };
  course: {
    id: string;
    name: string;
    color: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  streakFreezes: number;
  currentLeague: string;
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    containers: number;
    studySessions: number;
    userAchievements: number;
  };
}

// API helper
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// User API
export const userAPI = {
  getMe: () => fetchAPI<User>("/api/users/me"),
  updateMe: (data: Partial<Pick<User, "displayName" | "username" | "avatarUrl">>) =>
    fetchAPI<User>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Courses API
export const coursesAPI = {
  getAll: () => fetchAPI<Course[]>("/api/courses"),

  getOne: (courseId: string) => fetchAPI<Course>(`/api/courses/${courseId}`),

  create: (data: { name: string; description?: string; color?: string; icon?: string }) =>
    fetchAPI<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (courseId: string, data: { name?: string; description?: string; color?: string; icon?: string }) =>
    fetchAPI<Course>(`/api/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (courseId: string) =>
    fetchAPI<{ success: boolean }>(`/api/courses/${courseId}`, {
      method: "DELETE",
    }),
};

// Subjects API
export const subjectsAPI = {
  getAllForCourse: (courseId: string) =>
    fetchAPI<SubjectSummary[]>(`/api/courses/${courseId}/subjects`),

  getOne: (subjectId: string) => fetchAPI<Subject>(`/api/subjects/${subjectId}`),

  create: (courseId: string, data: { name: string; color?: string; icon?: string }) =>
    fetchAPI<SubjectSummary>(`/api/courses/${courseId}/subjects`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (subjectId: string, data: { name?: string; color?: string; icon?: string }) =>
    fetchAPI<Subject>(`/api/subjects/${subjectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (subjectId: string) =>
    fetchAPI<{ success: boolean }>(`/api/subjects/${subjectId}`, {
      method: "DELETE",
    }),
};

// Documents API
export const documentsAPI = {
  getAllForSubject: (subjectId: string) =>
    fetchAPI<DocumentSummary[]>(`/api/subjects/${subjectId}/documents`),

  getOne: (documentId: string) => fetchAPI<Document>(`/api/documents/${documentId}`),

  create: (subjectId: string, data: { title: string; description?: string; extractedText?: string; originalFileUrl?: string }) =>
    fetchAPI<DocumentSummary>(`/api/subjects/${subjectId}/documents`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (documentId: string, data: { title?: string; description?: string; extractedText?: string; processingStatus?: string }) =>
    fetchAPI<Document>(`/api/documents/${documentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (documentId: string) =>
    fetchAPI<{ success: boolean }>(`/api/documents/${documentId}`, {
      method: "DELETE",
    }),

  generate: (documentId: string, options?: { generateFlashcardsFlag?: boolean; generateQuestionsFlag?: boolean; flashcardsCount?: number; questionsCount?: number }) =>
    fetchAPI<{ success: boolean; flashcardsCreated: number; questionsCreated: number }>(
      `/api/documents/${documentId}/generate`,
      {
        method: "POST",
        body: JSON.stringify(options || {}),
      }
    ),

  process: (documentId: string) =>
    fetchAPI<{ success: boolean; documentId: string; textLength: number; status: string }>(
      `/api/documents/${documentId}/process`,
      { method: "POST" }
    ),

  getFlashcards: (documentId: string) => fetchAPI<Flashcard[]>(`/api/documents/${documentId}/flashcards`),

  getQuestions: (documentId: string) => fetchAPI<Question[]>(`/api/documents/${documentId}/questions`),
};

// Flashcard type
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string | null;
  createdAt: string;
}

// Question type
export interface Question {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "OPEN_ENDED";
  question: string;
  correctAnswer: string;
  options: string[] | null;
  explanation: string | null;
  createdAt: string;
}

// Flashcards API
export const flashcardsAPI = {
  getForDocument: (documentId: string) =>
    fetchAPI<Flashcard[]>(`/api/documents/${documentId}/flashcards`),

  getForSubject: (subjectId: string) =>
    fetchAPI<Flashcard[]>(`/api/subjects/${subjectId}/flashcards`),

  getForDocuments: async (documentIds: string[]): Promise<Flashcard[]> => {
    const results = await Promise.all(
      documentIds.map((id) => fetchAPI<Flashcard[]>(`/api/documents/${id}/flashcards`))
    );
    return results.flat();
  },
};

// Questions API
export const questionsAPI = {
  getForDocument: (documentId: string) =>
    fetchAPI<Question[]>(`/api/documents/${documentId}/questions`),

  getForSubject: (subjectId: string) =>
    fetchAPI<Question[]>(`/api/subjects/${subjectId}/questions`),

  getForDocuments: async (documentIds: string[]): Promise<Question[]> => {
    const results = await Promise.all(
      documentIds.map((id) => fetchAPI<Question[]>(`/api/documents/${id}/questions`))
    );
    return results.flat();
  },
};

// Study Session types
export interface StudySessionCreate {
  subjectId?: string;
  documentId?: string;
  documentIds?: string[];
  mode: "FLASHCARDS" | "QUIZ" | "TRUE_FALSE" | "TUTOR" | "EXAM_SIMULATION";
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds?: number;
}

export interface StudySessionResult {
  session: {
    id: string;
    xpEarned: number;
    coinsEarned: number;
    accuracy: number;
  };
  user: {
    totalXp: number;
    level: number;
    leveledUp: boolean;
    currentStreak: number;
    streakIncreased: boolean;
  };
  achievements: Array<{
    code: string;
    name: string;
    description: string;
    rewardXp: number;
    rewardCoins: number;
    rarity: string;
  }>;
}

export interface StudySession {
  id: string;
  mode: string;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
  durationSeconds: number;
  completedAt: string;
  document: {
    title: string;
    subjectName: string;
    subjectColor: string;
  };
}

// Study Sessions API
export const studySessionsAPI = {
  create: (data: StudySessionCreate) =>
    fetchAPI<StudySessionResult>("/api/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRecent: (limit?: number) =>
    fetchAPI<StudySession[]>(`/api/study-sessions${limit ? `?limit=${limit}` : ""}`),
};

// Upload API
export interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

export const uploadAPI = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  },
};

// Shop types
export interface ShopItem {
  id: string;
  category: "AVATAR_HEAD" | "AVATAR_BODY" | "AVATAR_ACCESSORY" | "AVATAR_BACKGROUND" | "THEME" | "POWERUP" | "CONSUMABLE";
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isPremiumOnly: boolean;
  isLimited: boolean;
  availableUntil: string | null;
  properties: Record<string, unknown>;
  owned: boolean;
  quantity: number;
  isEquipped: boolean;
}

export interface ShopResponse {
  items: ShopItem[];
  userCoins: number;
  isPremium: boolean;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  properties: Record<string, unknown>;
  quantity: number;
  isEquipped: boolean;
  purchasedAt: string;
}

export interface InventoryResponse {
  inventory: InventoryItem[];
  streakFreezes: number;
  xpBoostActive: boolean;
  xpBoostUntil: string | null;
  xpBoostMultiplier: number;
  selectedTheme: string;
}

export interface BuyResponse {
  success: boolean;
  message: string;
  newBalance: number;
  item: {
    id: string;
    name: string;
    category: string;
  };
}

export interface UseItemResponse {
  success: boolean;
  message: string;
  streakFreezes?: number;
  xpBoostUntil?: string;
  xpBoostMultiplier?: number;
}

export interface EquipResponse {
  success: boolean;
  message: string;
  selectedTheme?: string;
  themeColors?: Record<string, string>;
  isEquipped?: boolean;
}

// Shop API
export const shopAPI = {
  getItems: () => fetchAPI<ShopResponse>("/api/shop"),

  getInventory: () => fetchAPI<InventoryResponse>("/api/shop/inventory"),

  buyItem: (itemId: string) =>
    fetchAPI<BuyResponse>("/api/shop/buy", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    }),

  useItem: (itemId: string) =>
    fetchAPI<UseItemResponse>("/api/shop/use", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    }),

  equipItem: (itemId: string) =>
    fetchAPI<EquipResponse>("/api/shop/equip", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    }),
};

// League types
export type LeagueTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "RUBY";

export interface LeagueParticipant {
  position: number;
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  weeklyXp: number;
  isCurrentUser: boolean;
  zone: "promotion" | "safe" | "relegation";
}

export interface CurrentLeagueResponse {
  league: {
    id: string;
    tier: LeagueTier;
    tierName: string;
    weekStartDate: string;
    weekEndDate: string;
    timeRemaining: string;
  };
  currentUser: {
    position: number;
    weeklyXp: number;
  };
  participants: LeagueParticipant[];
  zones: {
    promotionCount: number;
    relegationStart: number;
  };
}

// Leagues API
export const leaguesAPI = {
  getCurrent: () => fetchAPI<CurrentLeagueResponse>("/api/leagues/current"),
};
