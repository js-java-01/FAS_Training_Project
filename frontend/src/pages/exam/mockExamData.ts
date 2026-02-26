import type {
  UserAssessment,
  Submission,
  SubmissionQuestion,
  SubmissionResult,
} from "@/types/exam";

// ===== MOCK ASSESSMENTS (for SelectAssessmentPage) =====
export const MOCK_ASSESSMENTS: UserAssessment[] = [
  {
    assessmentId: 1,
    code: "JAVA-101",
    title: "Java Fundamentals",
    description: "Test your understanding of core Java concepts including OOP, data types, and control flow.",
    totalScore: 100,
    passScore: 60,
    timeLimitMinutes: 30,
    attemptLimit: 3,
    attemptCount: 0,
    latestStatus: "NEW",
    isPassed: null,
    lastSubmissionId: null,
  },
  {
    assessmentId: 2,
    code: "REACT-201",
    title: "React & TypeScript",
    description: "Covers hooks, context, component patterns, and TypeScript integration with React.",
    totalScore: 80,
    passScore: 50,
    timeLimitMinutes: 45,
    attemptLimit: 2,
    attemptCount: 1,
    latestStatus: "IN_PROGRESS",
    isPassed: null,
    lastSubmissionId: "sub-react-001",
  },
  {
    assessmentId: 3,
    code: "SQL-301",
    title: "Advanced SQL Queries",
    description: "Complex joins, subqueries, window functions, and query optimization techniques.",
    totalScore: 60,
    passScore: 36,
    timeLimitMinutes: 25,
    attemptLimit: 0,
    attemptCount: 2,
    latestStatus: "SUBMITTED",
    isPassed: true,
    lastSubmissionId: "sub-sql-002",
  },
  {
    assessmentId: 4,
    code: "SPRING-401",
    title: "Spring Boot Essentials",
    description: "REST APIs, dependency injection, JPA, and security basics in Spring Boot.",
    totalScore: 100,
    passScore: 70,
    timeLimitMinutes: 60,
    attemptLimit: 2,
    attemptCount: 2,
    latestStatus: "SUBMITTED",
    isPassed: false,
    lastSubmissionId: "sub-spring-002",
  },
  {
    assessmentId: 5,
    code: "GIT-101",
    title: "Git & Version Control",
    description: "Branching, merging, rebasing, and collaborative workflows with Git.",
    totalScore: 50,
    passScore: 30,
    timeLimitMinutes: 15,
    attemptLimit: 5,
    attemptCount: 0,
    latestStatus: "NEW",
    isPassed: null,
    lastSubmissionId: null,
  },
  {
    assessmentId: 6,
    code: "DS-201",
    title: "Data Structures & Algorithms",
    description: "Arrays, linked lists, trees, graphs, sorting, and searching algorithms.",
    totalScore: 120,
    passScore: 72,
    timeLimitMinutes: 90,
    attemptLimit: 3,
    attemptCount: 1,
    latestStatus: "SUBMITTED",
    isPassed: true,
    lastSubmissionId: "sub-ds-001",
  },
];

// ===== MOCK QUESTIONS (for QuizPage) =====
const MOCK_QUESTIONS: SubmissionQuestion[] = [
  {
    id: "sq-1",
    originalQuestionId: "oq-1",
    questionType: "SINGLE_CHOICE",
    content: "Which keyword is used to define a class in Java?",
    score: 10,
    orderIndex: 0,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-1a", content: "<code>class</code>", orderIndex: 0, isCorrect: null },
      { id: "opt-1b", content: "<code>Class</code>", orderIndex: 1, isCorrect: null },
      { id: "opt-1c", content: "<code>define</code>", orderIndex: 2, isCorrect: null },
      { id: "opt-1d", content: "<code>struct</code>", orderIndex: 3, isCorrect: null },
    ],
  },
  {
    id: "sq-2",
    originalQuestionId: "oq-2",
    questionType: "MULTI_CHOICE",
    content: "Which of the following are valid Java primitive types? (Select all that apply)",
    score: 15,
    orderIndex: 1,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-2a", content: "<code>int</code>", orderIndex: 0, isCorrect: null },
      { id: "opt-2b", content: "<code>String</code>", orderIndex: 1, isCorrect: null },
      { id: "opt-2c", content: "<code>boolean</code>", orderIndex: 2, isCorrect: null },
      { id: "opt-2d", content: "<code>double</code>", orderIndex: 3, isCorrect: null },
      { id: "opt-2e", content: "<code>Integer</code>", orderIndex: 4, isCorrect: null },
    ],
  },
  {
    id: "sq-3",
    originalQuestionId: "oq-3",
    questionType: "TRUE_FALSE",
    content: "In Java, all classes inherit from <code>Object</code> class by default.",
    score: 10,
    orderIndex: 2,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-3a", content: "True", orderIndex: 0, isCorrect: null },
      { id: "opt-3b", content: "False", orderIndex: 1, isCorrect: null },
    ],
  },
  {
    id: "sq-4",
    originalQuestionId: "oq-4",
    questionType: "SINGLE_CHOICE",
    content: "What is the default value of a <code>boolean</code> variable in Java?",
    score: 10,
    orderIndex: 3,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-4a", content: "<code>true</code>", orderIndex: 0, isCorrect: null },
      { id: "opt-4b", content: "<code>false</code>", orderIndex: 1, isCorrect: null },
      { id: "opt-4c", content: "<code>null</code>", orderIndex: 2, isCorrect: null },
      { id: "opt-4d", content: "<code>0</code>", orderIndex: 3, isCorrect: null },
    ],
  },
  {
    id: "sq-5",
    originalQuestionId: "oq-5",
    questionType: "FILL_IN",
    content: "What keyword is used in Java to handle exceptions? Write the keyword used in the block that catches exceptions.",
    score: 15,
    orderIndex: 4,
    isCorrect: null,
    userAnswer: null,
    options: [],
  },
  {
    id: "sq-6",
    originalQuestionId: "oq-6",
    questionType: "SINGLE_CHOICE",
    content: "Which access modifier makes a member accessible only within its own class?",
    score: 10,
    orderIndex: 5,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-6a", content: "<code>public</code>", orderIndex: 0, isCorrect: null },
      { id: "opt-6b", content: "<code>protected</code>", orderIndex: 1, isCorrect: null },
      { id: "opt-6c", content: "<code>private</code>", orderIndex: 2, isCorrect: null },
      { id: "opt-6d", content: "<code>default</code>", orderIndex: 3, isCorrect: null },
    ],
  },
  {
    id: "sq-7",
    originalQuestionId: "oq-7",
    questionType: "MULTI_CHOICE",
    content: "Which of these are features of OOP in Java? (Select all that apply)",
    score: 15,
    orderIndex: 6,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-7a", content: "Encapsulation", orderIndex: 0, isCorrect: null },
      { id: "opt-7b", content: "Pointer arithmetic", orderIndex: 1, isCorrect: null },
      { id: "opt-7c", content: "Inheritance", orderIndex: 2, isCorrect: null },
      { id: "opt-7d", content: "Polymorphism", orderIndex: 3, isCorrect: null },
    ],
  },
  {
    id: "sq-8",
    originalQuestionId: "oq-8",
    questionType: "TRUE_FALSE",
    content: "Java supports multiple class inheritance (a class can extend more than one class).",
    score: 10,
    orderIndex: 7,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-8a", content: "True", orderIndex: 0, isCorrect: null },
      { id: "opt-8b", content: "False", orderIndex: 1, isCorrect: null },
    ],
  },
  {
    id: "sq-9",
    originalQuestionId: "oq-9",
    questionType: "SINGLE_CHOICE",
    content: "Which method is the entry point for a Java application?",
    score: 5,
    orderIndex: 8,
    isCorrect: null,
    userAnswer: null,
    options: [
      { id: "opt-9a", content: "<code>public static void main(String[] args)</code>", orderIndex: 0, isCorrect: null },
      { id: "opt-9b", content: "<code>public void start()</code>", orderIndex: 1, isCorrect: null },
      { id: "opt-9c", content: "<code>static void run()</code>", orderIndex: 2, isCorrect: null },
      { id: "opt-9d", content: "<code>void init()</code>", orderIndex: 3, isCorrect: null },
    ],
  },
  {
    id: "sq-10",
    originalQuestionId: "oq-10",
    questionType: "FILL_IN",
    content: "What is the output of <code>System.out.println(10 + 20 + \"Hello\")</code>?",
    score: 10,
    orderIndex: 9,
    isCorrect: null,
    userAnswer: null,
    options: [],
  },
];

// ===== CORRECT ANSWERS (used for grading during mock submit) =====
const CORRECT_ANSWERS: Record<string, string> = {
  "sq-1": "opt-1a",                   // class
  "sq-2": "opt-2a,opt-2c,opt-2d",     // int, boolean, double
  "sq-3": "opt-3a",                   // True
  "sq-4": "opt-4b",                   // false
  "sq-5": "catch",                    // catch
  "sq-6": "opt-6c",                   // private
  "sq-7": "opt-7a,opt-7c,opt-7d",     // Encapsulation, Inheritance, Polymorphism
  "sq-8": "opt-8b",                   // False
  "sq-9": "opt-9a",                   // main
  "sq-10": "30Hello",                 // 30Hello
};

// ===== Build an IN_PROGRESS submission for the quiz =====
export function getMockSubmission(submissionId: string): Submission {
  return {
    id: submissionId,
    userId: "mock-user-001",
    assessmentId: 1,
    status: "IN_PROGRESS",
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // started 5 min ago
    submittedAt: null,
    totalScore: null,
    isPassed: null,
    submissionQuestions: MOCK_QUESTIONS.map((q) => ({ ...q })),
  };
}

// ===== Grade and return a SUBMITTED submission =====
export function gradeMockSubmission(
  submissionId: string,
  userAnswers: { submissionQuestionId: string; answerValue: string }[]
): { submission: Submission; result: SubmissionResult } {
  const answerMap = new Map(userAnswers.map((a) => [a.submissionQuestionId, a.answerValue]));
  const passScore = 60;
  let totalScore = 0;

  const gradedQuestions: SubmissionQuestion[] = MOCK_QUESTIONS.map((q) => {
    const userAnswer = answerMap.get(q.id) ?? null;
    const correctAnswer = CORRECT_ANSWERS[q.id];

    let isCorrect = false;

    if (userAnswer && correctAnswer) {
      if (q.questionType === "MULTI_CHOICE") {
        // Compare sorted sets
        const userSet = new Set(userAnswer.split(",").filter(Boolean).sort());
        const correctSet = new Set(correctAnswer.split(",").filter(Boolean).sort());
        isCorrect = userSet.size === correctSet.size && [...userSet].every((v) => correctSet.has(v));
      } else if (q.questionType === "FILL_IN") {
        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      } else {
        isCorrect = userAnswer === correctAnswer;
      }
    }

    if (isCorrect) totalScore += q.score;

    // Reveal correct answers in options
    const gradedOptions = q.options.map((opt) => ({
      ...opt,
      isCorrect: correctAnswer.split(",").includes(opt.id),
    }));

    return {
      ...q,
      userAnswer,
      isCorrect,
      options: gradedOptions,
    };
  });

  const submission: Submission = {
    id: submissionId,
    userId: "mock-user-001",
    assessmentId: 1,
    status: "SUBMITTED",
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
    totalScore,
    isPassed: totalScore >= passScore,
    submissionQuestions: gradedQuestions,
  };

  const result: SubmissionResult = {
    submissionId,
    totalScore,
    passScore,
    isPassed: totalScore >= passScore,
  };

  return { submission, result };
}

// ===== MOCK ATTEMPT HISTORY =====
export function getMockAttemptHistory(assessmentId: string): Submission[] {
  if (assessmentId === "3") {
    return [
      {
        id: "sub-sql-001",
        userId: "mock-user-001",
        assessmentId: 3,
        status: "SUBMITTED",
        startedAt: "2026-02-20T09:00:00Z",
        submittedAt: "2026-02-20T09:18:00Z",
        totalScore: 30,
        isPassed: false,
        submissionQuestions: [],
      },
      {
        id: "sub-sql-002",
        userId: "mock-user-001",
        assessmentId: 3,
        status: "SUBMITTED",
        startedAt: "2026-02-22T14:00:00Z",
        submittedAt: "2026-02-22T14:22:00Z",
        totalScore: 48,
        isPassed: true,
        submissionQuestions: [],
      },
    ];
  }

  if (assessmentId === "4") {
    return [
      {
        id: "sub-spring-001",
        userId: "mock-user-001",
        assessmentId: 4,
        status: "SUBMITTED",
        startedAt: "2026-02-18T10:00:00Z",
        submittedAt: "2026-02-18T10:50:00Z",
        totalScore: 55,
        isPassed: false,
        submissionQuestions: [],
      },
      {
        id: "sub-spring-002",
        userId: "mock-user-001",
        assessmentId: 4,
        status: "SUBMITTED",
        startedAt: "2026-02-24T16:00:00Z",
        submittedAt: "2026-02-24T16:45:00Z",
        totalScore: 60,
        isPassed: false,
        submissionQuestions: [],
      },
    ];
  }

  return [
    {
      id: "sub-ds-001",
      userId: "mock-user-001",
      assessmentId: Number(assessmentId),
      status: "SUBMITTED",
      startedAt: "2026-02-25T08:00:00Z",
      submittedAt: "2026-02-25T09:15:00Z",
      totalScore: 85,
      isPassed: true,
      submissionQuestions: [],
    },
  ];
}
