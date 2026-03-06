import axiosInstance from "./axiosInstance";
import type { Submission, SubmissionResult, SubmitAnswerRequest } from "@/types/exam";

const BASE = "/submissions";

/**
 * POST /api/submissions/start/{assessmentId}
 * Bắt đầu làm bài. Server tự lấy user từ JWT.
 */
export const startSubmission = async (assessmentId: string): Promise<Submission> => {
  const res = await axiosInstance.post<Submission>(`${BASE}/start/${assessmentId}`);
  return res.data;
};

/**
 * POST /api/submissions/{submissionId}/answer
 * Lưu / cập nhật đáp án cho một câu hỏi.
 */
export const submitAnswer = async (
  submissionId: string,
  payload: SubmitAnswerRequest
): Promise<Submission> => {
  const res = await axiosInstance.post<Submission>(`${BASE}/${submissionId}/answer`, payload);
  return res.data;
};

/**
 * POST /api/submissions/{submissionId}/submit
 * Nộp bài, trigger grading.
 */
export const submitSubmission = async (submissionId: string): Promise<Submission> => {
  const res = await axiosInstance.post<Submission>(`${BASE}/${submissionId}/submit`);
  return res.data;
};

/**
 * GET /api/submissions/{submissionId}/result
 * Lấy kết quả: totalQuestions, correctAnswers, wrongAnswers, totalScore, passScore, isPassed
 */
export const getSubmissionResult = async (submissionId: string): Promise<SubmissionResult> => {
  const res = await axiosInstance.get<SubmissionResult>(`${BASE}/${submissionId}/result`);
  return res.data;
};

/**
 * GET /api/submissions/{submissionId}/review
 * Xem lại bài làm với đáp án đúng.
 */
export const getSubmissionForReview = async (submissionId: string): Promise<Submission> => {
  const res = await axiosInstance.get<Submission>(`${BASE}/${submissionId}/review`);
  return res.data;
};
