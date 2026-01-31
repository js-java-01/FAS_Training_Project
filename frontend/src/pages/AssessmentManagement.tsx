import React from 'react';
import {
    Eye,
    SquarePen,
    Trash2,
    Search,
    RotateCcw,
    Download,
    Upload,
    Plus,
} from 'lucide-react';

import { PermissionGate } from '../components/PermissionGate';
import { MainLayout } from '../components/MainLayout';
import { useAssessment } from '../hooks/useAssessment';

export const AssessmentManagement: React.FC = () => {
    const {
        assessments,
        isLoading,
        searchTerm,
        showCreateModal,
        isEditMode,
        newAssessment,
        setShowCreateModal,
        setNewAssessment,
        search,
        createAssessment,
        updateAssessment,
        openCreateModal,
        openEditModal,
        deleteAssessment,
        reload,
        setSearchTerm,
    } = useAssessment();

    const getBadgeStyle = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('test'))
            return 'bg-blue-50 text-blue-600 border-blue-100';
        if (lowerName.includes('assignment'))
            return 'bg-green-50 text-green-600 border-green-100';
        if (lowerName.includes('challenge'))
            return 'bg-cyan-50 text-cyan-600 border-cyan-100';
        if (lowerName.includes('interview'))
            return 'bg-gray-50 text-gray-600 border-gray-100';
        if (lowerName.includes('exam'))
            return 'bg-red-50 text-red-600 border-red-100';
        if (lowerName.includes('check'))
            return 'bg-purple-50 text-purple-600 border-purple-100';
        return 'bg-blue-50 text-blue-600 border-blue-100';
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
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
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Assessment Types
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage assessment type definitions
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-1.5 border rounded-md text-sm
                            hover:bg-gray-100 hover:border-gray-400 transition">
                            <Download size={16} />
                            <span>Export</span>
                        </button>

                        <button className="flex items-center space-x-2 px-3 py-1.5 border rounded-md text-sm
                            hover:bg-gray-100 hover:border-gray-400 transition">
                            <Upload size={16} />
                            <span>Import</span>
                        </button>

                        <PermissionGate permission="ASSESSMENT_CREATE">
                            <button
                                onClick={openCreateModal}
                                className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 text-white rounded-md
                                    hover:bg-blue-700 hover:shadow transition"
                            >
                                <Plus size={16} />
                                <span>Add</span>
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={15}
                        />
                        <input
                            value={searchTerm}
                            onChange={(e) => search(e.target.value)}
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 w-full border rounded-md
                                focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            reload();
                        }}
                        className="p-2 border rounded-md
                            hover:bg-gray-100 hover:border-gray-400 transition"
                        title="Reset"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold">#</th>
                            <th className="px-6 py-3 text-left text-xs font-bold">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold">
                                Created Date
                            </th>
                            <th className="px-6 py-3 ml-4 text-left text-xs font-bold">
                                <div className="ml-6">
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {assessments.map((assessment, index) => (
                            <tr
                                key={assessment.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm">
                                    {index + 1}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-md text-sm border ${getBadgeStyle(
                                            assessment.name
                                        )}`}
                                    >
                                        {assessment.name}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {assessment.description || '-'}
                                </td>


                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(assessment.createdAt)}
                                </td>

                                

                                <td className="px-6 py-4 text-right">
                                    <div className="flex space-x-3">
                                        <button
                                            className="p-1 rounded hover:bg-gray-100 hover:text-blue-600 transition"
                                            title="View"
                                        >
                                            <Eye size={15} />
                                        </button>

                                        <PermissionGate permission="ASSESSMENT_UPDATE">
                                            <button
                                                onClick={() => openEditModal(assessment)}
                                                className="p-1 rounded hover:bg-gray-100 hover:text-yellow-600 transition"
                                                title="Edit"
                                            >
                                                <SquarePen size={15} />
                                            </button>
                                        </PermissionGate>

                                        <PermissionGate permission="ASSESSMENT_DELETE">
                                            <button
                                                onClick={() =>
                                                    deleteAssessment(assessment.id)
                                                }
                                                className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </PermissionGate>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {isEditMode ? 'Update Assessment' : 'Create New Assessment'}
                        </h2>

                        <form
                            
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (isEditMode)
                                    updateAssessment();
                                else
                                    createAssessment();
                            }}
                            className="space-y-4"
                        >
                            <input
                                required
                                value={newAssessment.name}
                                onChange={(e) =>
                                    setNewAssessment({
                                        ...newAssessment,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border px-3 py-2 rounded-md
                                    focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Name"
                            />

                            <textarea
                                required
                                value={newAssessment.description}
                                onChange={(e) =>
                                    setNewAssessment({
                                        ...newAssessment,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full border px-3 py-2 rounded-md
                                    focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Description"
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border rounded-md
                                        hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md
                                        hover:bg-blue-700 hover:shadow transition"
                                >
                                    {isEditMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};
