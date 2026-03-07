export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CourseOnlineFeedbackDTO {
  id?: string;
  courseOnlineId: string;
  studentId?: string;
  studentName?: string; // Tên hiển thị ra UI
  rating: number;       // 1 - 5
  comment?: string;
  status?: FeedbackStatus;
  createdAt?: string;   // Thời gian đánh giá
}