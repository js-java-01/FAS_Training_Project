// src/pages/DepartmentManagement.tsx
import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { PermissionGate } from '../components/PermissionGate';

// Import APIs
import { departmentApi } from '../api/departmentApi';
import { locationApi } from '../api/locationApi';

// Import Types
import { Department, CreateDepartmentRequest } from '../types/department';
import { Location } from '../types/location';
import { ImportModal } from '../components/ImportModal';

export const DepartmentManagement: React.FC = () => {
    // --- STATE ---
    const [departments, setDepartments] = useState<Department[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State Import & Delete
    const [showImportModal, setShowImportModal] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [newDepartment, setNewDepartment] = useState<CreateDepartmentRequest>({
        name: '', code: '', description: '', locationId: '',
    });

    // --- EFFECT: LOAD DATA ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [deptData, locList] = await Promise.all([
                departmentApi.getAllDepartments(),
                locationApi.getAllLocations()
            ]);
            const finalDeptList = Array.isArray(deptData) ? deptData : (deptData as any).content || [];
            setDepartments(finalDeptList);
            setLocations(locList);
        } catch (error: any) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleDownloadTemplate = async () => {
        try { await departmentApi.downloadTemplate(); }
        catch (error) { alert("Failed to download template."); }
    };

    const handleImportDepartments = async (file: File) => {
        await departmentApi.importDepartments(file);
        alert("Import successful!");
        loadData();
    };
    const handleExport = async () => {
        try {
            await departmentApi.exportDepartments();
        } catch (error) {
            console.error(error);
            alert("Failed to export data.");
        }
    };

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await departmentApi.createDepartment(newDepartment);
            alert('Department created successfully!');
            setShowCreateModal(false);
            setNewDepartment({ name: '', code: '', description: '', locationId: '' });
            loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error creating department';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (dept: Department) => {
        setDepartmentToDelete(dept);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!departmentToDelete) return;
        setIsDeleting(true);
        try {
            await departmentApi.deleteDepartment(departmentToDelete.id);
            setIsDeleteModalOpen(false);
            setDepartmentToDelete(null);
            loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error deleting department';
            alert(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- CHUYỂN ĐỔI GIỮA CREATE VÀ IMPORT ---
    const switchToImport = () => {
        setShowCreateModal(false); // Đóng form tạo mới
        setShowImportModal(true);  // Mở form import
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="p-8 text-center text-gray-500">Loading data...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>

                <div className="flex gap-2">
                    {/* NÚT EXPORT (MỚI) */}
                    <PermissionGate permission="DEPARTMENT_CREATE"> {/* Hoặc DEPARTMENT_EXPORT */}
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
                        >
                            {/* Icon Download */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export
                        </button>
                    </PermissionGate>

                    {/* NÚT CREATE */}
                    <PermissionGate permission="DEPARTMENT_CREATE">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Create Department
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* TABLE SECTION (Giữ nguyên) */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {departments.length > 0 ? (
                        departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono border border-gray-200">{dept.code}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{dept.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {dept.location?.name || <span className="text-gray-400 italic">N/A</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <PermissionGate permission="DEPARTMENT_DELETE">
                                        <button onClick={() => openDeleteModal(dept)} className="text-red-600 hover:text-red-900 transition-colors font-semibold">Delete</button>
                                    </PermissionGate>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No departments found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* === CREATE MODAL (CÓ CHỨA NÚT IMPORT) === */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h2 className="text-xl font-bold text-gray-900">Create New Department</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>

                        {/* --- NEW: IMPORT OPTION INSIDE CREATE MODAL --- */}
                            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-blue-800">Has an Excel file?</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={switchToImport}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                                >
                                    Import data instead
                                </button>
                            </div>

                        {/* ----------------------------------------------- */}

                        <form onSubmit={handleCreateDepartment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
                                <input type="text" required value={newDepartment.name} onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none" placeholder="e.g. IT Department" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code <span className="text-red-500">*</span></label>
                                <input type="text" required value={newDepartment.code} onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none" placeholder="e.g. IT_DEPT" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={3} value={newDepartment.description} onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none outline-none" placeholder="Short description..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                                <select required value={newDepartment.locationId} onChange={(e) => setNewDepartment({ ...newDepartment, locationId: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none">
                                    <option value="">-- Select location --</option>
                                    {locations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors shadow-sm">{isSubmitting ? 'Saving...' : 'Create Department'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL (Giữ nguyên) */}
            {isDeleteModalOpen && departmentToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsDeleteModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">Delete department?</h3>
                                        <div className="mt-2"><p className="text-sm text-gray-500">You are about to permanently delete <span className="font-bold text-gray-800">{departmentToDelete.name}</span>...</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL COMPONENT */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Import Departments"
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImportDepartments}
            />

        </MainLayout>
    );
};