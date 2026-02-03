import React, { useState, useEffect } from 'react';
import { departmentApi } from '../api/departmentApi';
import { MainLayout } from '../components/layout/MainLayout';
import { PermissionGate } from '../components/PermissionGate';
import { locationApi } from '../api/locationApi';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [existingLocations, setExistingLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        locationId: ''
    });
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);

    useEffect(() => {
        loadDepartments();
        loadExistingLocations();
    }, []);

    const loadExistingLocations = async () => {
        try {
            const res = await locationApi.searchLocations(0, 100);
            setExistingLocations(res.content);
        } catch (err) {
            console.error("Error loading existing locations");
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await departmentApi.getAll();
            setDepartments(data);
        } catch (err) {
            console.error("Error loading departments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await departmentApi.create(formData);
            setShowModal(false);
            setFormData({ name: '', code: '', description: '', locationId: '' });
            loadDepartments();
        } catch (err: any) {
            alert("Error saving department: " + (err.response?.data?.message || "Check permissions"));
        }
    };

    const handleDelete = async (id: any) => {
        if (window.confirm("Delete this department?")) {
            try {
                await departmentApi.delete(id);
                loadDepartments();
            } catch (err) {
                alert("Error deleting");
            }
        }
    };

    if (isLoading) {
        return <MainLayout><div className="p-8 text-center">Loading...</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
                <PermissionGate permission="DEPARTMENT_CREATE">
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                        Create Department
                    </button>
                </PermissionGate>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{dept.name}</h3>
                                    <span
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{dept.code}</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    📍 Location: <span className="font-medium text-gray-700">
                                        {dept.locationName || "Not yet"}
                                    </span>
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSelectedDept(dept);
                                        setShowViewModal(true);
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    View
                                </button>

                                <PermissionGate permission="DEPARTMENT_DELETE">
                                    <button onClick={() => handleDelete(dept.id)}
                                            className="text-red-600 hover:underline">Delete
                                    </button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
                        <h2 className="text-xl font-bold mb-4">Create New Department</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    placeholder="e.g. Software Development"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    placeholder="e.g. SD_01"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    placeholder="Optional description..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <select
                                required
                                value={formData.locationId}
                                onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                                className="mt-1 block w-full p-2 border rounded-md"
                            >
                                <option value="">Select Location <span className="text-red-500">*</span></option>
                                {existingLocations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>


                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
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

            {showViewModal && selectedDept && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full m-4 overflow-hidden shadow-2xl">
                        {/* Header layout */}
                        <div className="p-6 border-b bg-gray-50 flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedDept.name}</h2>
                                <p className="text-sm text-gray-500">ID: #{selectedDept.id}</p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="ml-auto text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        {/* Content layout theo bảng */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500 font-medium"># Department Code</span>
                                <span className="text-gray-900">{selectedDept.code}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500 font-medium">📝 Description</span>
                                <span className="text-gray-900 text-right max-w-[250px]">{selectedDept.description || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500 font-medium">📍 Location</span>
                                <span className="text-gray-900">{selectedDept.locationName || "Hà Nội HQ"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500 font-medium">⚙️ Status</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">👥 Total Employees</span>
                                <span className="text-gray-900 font-bold">87</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </MainLayout>
    );
};

export default DepartmentManagement;