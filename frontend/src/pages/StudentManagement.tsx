import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import { userApi } from '../api/userApi';
import type { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/student';
import type { User } from '../types/auth';
import { PermissionGate } from '../components/PermissionGate';
import { MainLayout } from '../components/MainLayout';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<CreateStudentRequest>({
    studentId: '',
    userId: '',
    dateOfBirth: '',
    major: '',
    yearLevel: '',
    enrollmentDate: '',
    graduationDate: '',
    phoneNumber: '',
    address: '',
    status: 'ACTIVE',
  });
  const [editStudent, setEditStudent] = useState<UpdateStudentRequest>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, usersData] = await Promise.all([
        studentApi.getAllStudents(),
        userApi.getAllUsers(),
      ]);
      setStudents(studentsData);
      setUsers(usersData.content);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentApi.createStudent(newStudent);
      setShowCreateModal(false);
      setNewStudent({
        studentId: '',
        userId: '',
        dateOfBirth: '',
        major: '',
        yearLevel: '',
        enrollmentDate: '',
        graduationDate: '',
        phoneNumber: '',
        address: '',
        status: 'ACTIVE',
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating student');
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    try {
      await studentApi.updateStudent(selectedStudent.id, editStudent);
      setShowEditModal(false);
      setSelectedStudent(null);
      setEditStudent({});
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentApi.deleteStudent(id);
        loadData();
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setEditStudent({
      dateOfBirth: student.dateOfBirth,
      major: student.major,
      yearLevel: student.yearLevel,
      enrollmentDate: student.enrollmentDate,
      graduationDate: student.graduationDate,
      phoneNumber: student.phoneNumber,
      address: student.address,
      status: student.status,
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <PermissionGate permission="STUDENT_CREATE">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Student
          </button>
        </PermissionGate>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Major
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {student.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.major || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.yearLevel || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      student.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <PermissionGate permission="STUDENT_UPDATE">
                    <button
                      onClick={() => openEditModal(student)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="STUDENT_DELETE">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </PermissionGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User *</label>
                  <select
                    required
                    value={newStudent.userId}
                    onChange={(e) => setNewStudent({ ...newStudent, userId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newStudent.dateOfBirth}
                    onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrollment Date *</label>
                  <input
                    type="date"
                    required
                    value={newStudent.enrollmentDate}
                    onChange={(e) => setNewStudent({ ...newStudent, enrollmentDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Major</label>
                  <input
                    type="text"
                    value={newStudent.major}
                    onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Level</label>
                  <input
                    type="text"
                    value={newStudent.yearLevel}
                    onChange={(e) => setNewStudent({ ...newStudent, yearLevel: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Graduation Date</label>
                  <input
                    type="date"
                    value={newStudent.graduationDate}
                    onChange={(e) => setNewStudent({ ...newStudent, graduationDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newStudent.phoneNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Student: {selectedStudent.studentId}</h2>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={editStudent.dateOfBirth || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, dateOfBirth: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                  <input
                    type="date"
                    value={editStudent.enrollmentDate || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, enrollmentDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Major</label>
                  <input
                    type="text"
                    value={editStudent.major || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, major: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Level</label>
                  <input
                    type="text"
                    value={editStudent.yearLevel || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, yearLevel: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Graduation Date</label>
                  <input
                    type="date"
                    value={editStudent.graduationDate || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, graduationDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={editStudent.phoneNumber || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, phoneNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editStudent.status || 'ACTIVE'}
                    onChange={(e) => setEditStudent({ ...editStudent, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={editStudent.address || ''}
                  onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
