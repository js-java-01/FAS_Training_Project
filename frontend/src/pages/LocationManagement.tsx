import React, { useState, useEffect } from 'react';
import { locationApi } from '../api/locationApi';
import { locationDataApi, type Commune, type Province } from '../api/locationDataApi';

import { type Location, type CreateLocationRequest, LocationStatus } from '../types/location';
import { PermissionGate } from '../components/PermissionGate';
import { MainLayout } from '../components/layout/MainLayout';
import { useDebounce } from '../hooks/useDebounce';

export const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [editCommunes, setEditCommunes] = useState<Commune[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedEditProvince, setSelectedEditProvince] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<LocationStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [newLocation, setNewLocation] = useState<CreateLocationRequest>({
    name: '',
    address: '',
    communeId: '',
    status: undefined as any,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);



  useEffect(() => {
    loadData();
    loadProvinces();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    if (selectedProvince) {
      loadCommunes(selectedProvince);
    } else {
      setCommunes([]);
      setNewLocation({ ...newLocation, communeId: '' });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedEditProvince) {
      loadEditCommunes(selectedEditProvince);
    }
  }, [selectedEditProvince]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await locationApi.searchLocations(
        currentPage,
        10,
        debouncedSearchQuery || undefined,
        undefined,
        statusFilter || undefined
      );
      setLocations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const data = await locationDataApi.getAllProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadCommunes = async (provinceId: string) => {
    try {
      const data = await locationDataApi.getCommunesByProvinceId(provinceId);
      setCommunes(data);
    } catch (error) {
      console.error('Error loading communes:', error);
    }
  };

  const loadEditCommunes = async (provinceId: string) => {
    try {
      const data = await locationDataApi.getCommunesByProvinceId(provinceId);
      setEditCommunes(data);
    } catch (error) {
      console.error('Error loading edit communes:', error);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await locationApi.createLocation(newLocation);
      setShowCreateModal(false);
      setNewLocation({
        name: '',
        address: '',
        communeId: '',
        status: LocationStatus.ACTIVE,
      });
      setSelectedProvince('');
      setCommunes([]);
      setCurrentPage(0);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating location');
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    try {
      await locationApi.updateLocation(selectedLocation.id, {
        name: selectedLocation.name,
        address: selectedLocation.address,
        communeId: selectedLocation.communeId,
        status: selectedLocation.status,
      });
      setShowEditModal(false);
      setSelectedLocation(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating location');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await locationApi.deleteLocation(id);
        loadData();
      } catch (error) {
        alert('Error deleting location');
      }
    }
  };

  const openEditModal = async (location: Location) => {
    setSelectedLocation({ ...location });
    setShowEditModal(true);

    // Find province for this commune
    try {
      const allProvinces = await locationDataApi.getAllProvinces();
      for (const province of allProvinces) {
        const communesData = await locationDataApi.getCommunesByProvinceId(province.id);
        const commune = communesData.find(c => c.id === location.communeId);
        if (commune) {
          setSelectedEditProvince(province.id);
          setEditCommunes(communesData);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadData();
  };

  if (isLoading && locations.length === 0) {
    return (
      <MainLayout>
        <div className="p-8">Loading...</div>
      </MainLayout>
    );
  }

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsImporting(true);
      const result = await locationApi.importLocations(importFile);
      setImportResult(result);
      loadData(); // refresh table
    } catch (error: any) {
      alert(error.response?.data?.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await locationApi.exportLocations();

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'locations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Export failed');
    }
  };

  const handleDownloadTemplate = async () => {
  try {
    const blob = await locationApi.downloadLocationImportTemplate();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'location_import_template.xlsx';
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert('Download template failed');
  }
};


  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <div className="flex gap-2">
            <PermissionGate permission="LOCATION_IMPORT">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Import
              </button>
            </PermissionGate>

            <PermissionGate permission="LOCATION_EXPORT">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export
              </button>
            </PermissionGate>

            <PermissionGate permission="LOCATION_CREATE">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Location
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LocationStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value={LocationStatus.ACTIVE}>Active</option>
              <option value={LocationStatus.INACTIVE}>Inactive</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commune - Province
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
              {locations.map((location, index) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {currentPage * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{location.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {location.communeName}, {location.provinceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${location.status === LocationStatus.ACTIVE
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {location.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <PermissionGate permission="LOCATION_UPDATE">
                      <button
                        onClick={() => openEditModal(location)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                    </PermissionGate>
                    <PermissionGate permission="LOCATION_DELETE">
                      <button
                        onClick={() => {
                          setLocationToDelete(location);
                          setShowDeleteModal(true);
                        }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Location</h2>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  required
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commune</label>
                <select
                  required
                  value={newLocation.communeId}
                  onChange={(e) => setNewLocation({ ...newLocation, communeId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!selectedProvince}
                >
                  <option value="">Select a commune</option>
                  {communes.map((commune) => (
                    <option key={commune.id} value={commune.id}>
                      {commune.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newLocation.status}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, status: e.target.value as LocationStatus })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={LocationStatus.ACTIVE}>Active</option>
                  <option value={LocationStatus.INACTIVE}>Inactive</option>
                </select>
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

      {/* Edit Modal */}
      {showEditModal && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Location</h2>
            <form onSubmit={handleEditLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={selectedLocation.name}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={selectedLocation.address}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, address: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  required
                  value={selectedEditProvince}
                  onChange={(e) => setSelectedEditProvince(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commune</label>
                <select
                  required
                  value={selectedLocation.communeId}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, communeId: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!selectedEditProvince}
                >
                  <option value="">Select a commune</option>
                  {editCommunes.map((commune) => (
                    <option key={commune.id} value={commune.id}>
                      {commune.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedLocation.status}
                  onChange={(e) =>
                    setSelectedLocation({
                      ...selectedLocation,
                      status: e.target.value as LocationStatus,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={LocationStatus.ACTIVE}>Active</option>
                  <option value={LocationStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLocation(null);
                  }}
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
      {/* Delete Permanently Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-red-600 mb-3">
              Delete location?
            </h2>

            <p className="text-sm text-gray-700 mb-6">
              You are about to permanently delete{' '}
              <strong>{locationToDelete.name}</strong> from your organization.
              <br />
              <span className="font-semibold text-red-600">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setLocationToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await locationApi.deleteLocationPermanently(locationToDelete.id);
                    setShowDeleteModal(false);
                    setLocationToDelete(null);
                    loadData();
                  } catch (error) {
                    alert('Error deleting location permanently');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Import and Export Modal */}
      {showImportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold mb-1">Import Locations</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload an Excel file to import locations. Download the template first to see the required format.
      </p>

      {/* Step 1 */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2">Step 1: Download Template</p>
        <button
          onClick={handleDownloadTemplate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ⬇️ Download Template
        </button>
      </div>

      {/* Step 2 */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2">Step 2: Upload File</p>

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      {/* Result */}
      {importResult && (
        <div className="mb-4 text-sm border rounded p-3 bg-gray-50">
          <p>Total: {importResult.total}</p>
          <p className="text-green-600">Success: {importResult.success}</p>

          {importResult.errors?.length > 0 && (
            <ul className="text-red-600 list-disc pl-5 mt-2 max-h-32 overflow-auto">
              {importResult.errors.map((err: any, index: number) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportResult(null);
          }}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>

        <button
          disabled={!importFile || isImporting}
          onClick={handleImport}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  </div>
)}



    </MainLayout>
  );
};
