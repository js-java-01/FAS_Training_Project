export interface Student {
  id: string;
  studentId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  major?: string;
  yearLevel?: string;
  enrollmentDate: string;
  graduationDate?: string;
  phoneNumber?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  studentId: string;
  userId: string;
  dateOfBirth: string;
  major?: string;
  yearLevel?: string;
  enrollmentDate: string;
  graduationDate?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
}

export interface UpdateStudentRequest {
  dateOfBirth?: string;
  major?: string;
  yearLevel?: string;
  enrollmentDate?: string;
  graduationDate?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
}
