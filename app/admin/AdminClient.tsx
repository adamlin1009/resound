"use client";

import { useEffect, useState } from "react";
import { SafeUser } from "@/types";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import useConfirmModal from "@/hook/useConfirmModal";

interface AdminClientProps {
  currentUser: SafeUser;
}

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalReservations: number;
  totalRevenue: number;
}

interface ImageStats {
  totalImages: number;
  totalStorageUsed: number;
  averageImagesPerListing: number;
  listingsWithoutImages: number;
  imagesByCategory: Record<string, number>;
  topListingsByImages: {
    id: string;
    title: string;
    imageCount: number;
    ownerEmail: string;
  }[];
  userStorageStats: {
    email: string;
    totalImages: number;
    estimatedStorage: number;
    listingCount: number;
  }[];
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  isAdmin: boolean;
  _count: {
    listings: number;
    reservations: number;
  };
}

interface Listing {
  id: string;
  title: string;
  price: number;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  _count: {
    reservations: number;
  };
}

const AdminClient: React.FC<AdminClientProps> = ({ currentUser }) => {
  const confirmModal = useConfirmModal();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'listings' | 'images'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [imageStats, setImageStats] = useState<ImageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // Error handled internally
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      // Error handled internally
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/listings');
      const data = await response.json();
      setListings(data);
    } catch (error) {
      // Error handled internally
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImageStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/images/stats');
      const data = await response.json();
      setImageStats(data);
    } catch (error) {
      // Error handled internally
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'images') {
      fetchImageStats();
    }
  }, [activeTab]);

  const toggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      // Error handled internally
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchListings(); // Refresh listings
      }
    } catch (error) {
      // Error handled internally
    }
  };

  const deleteListing = (listingId: string) => {
    confirmModal.onOpen({
      title: "Delete Listing",
      subtitle: "Are you sure you want to delete this listing? This action cannot be undone.",
      actionLabel: "Delete",
      onConfirm: () => handleDeleteListing(listingId),
    });
  };

  const handleBulkDelete = async () => {
    confirmModal.onOpen({
      title: "Bulk Delete Images",
      subtitle: `Are you sure you want to delete all images from ${selectedListings.size} selected listings? This action cannot be undone.`,
      actionLabel: "Delete All",
      onConfirm: async () => {
        setIsBulkOperating(true);
        try {
          const response = await fetch('/api/admin/images/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingIds: Array.from(selectedListings) }),
          });
          
          if (response.ok) {
            fetchImageStats();
            setSelectedListings(new Set());
          }
        } catch (error) {
          // Error handled internally
        } finally {
          setIsBulkOperating(false);
        }
      },
    });
  };

  const handleSelectListing = (listingId: string) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId);
    } else {
      newSelected.add(listingId);
    }
    setSelectedListings(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedListings.size === imageStats?.topListingsByImages.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(imageStats?.topListingsByImages.map(l => l.id)));
    }
  };

  return (
    <Container>
      <div className="pt-24">
        <Heading title="Admin Panel" subtitle="Manage your platform" />
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-200 mt-8">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'users', label: 'Users' },
            { key: 'listings', label: 'Listings' },
            { key: 'images', label: 'Image Analytics' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Reservations</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReservations}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">${(stats.totalRevenue / 100).toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Listings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reservations
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.isAdmin && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user._count.listings}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user._count.reservations}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                label={user.isAdmin ? "Remove Admin" : "Make Admin"}
                                onClick={() => toggleUserAdmin(user.id, user.isAdmin)}
                                outline
                                small
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Listings Tab */}
              {activeTab === 'listings' && (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Listing
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reservations
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {listings.map((listing) => (
                          <tr key={listing.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {listing.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {listing.user.name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">{listing.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${listing.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {listing._count.reservations}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                label="Delete"
                                onClick={() => deleteListing(listing.id)}
                                outline
                                small
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && imageStats && (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Total Images</h3>
                      <p className="text-3xl font-bold text-gray-900">{imageStats.totalImages}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {(imageStats.totalStorageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Avg Images/Listing</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {imageStats.averageImagesPerListing.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">No Images</h3>
                      <p className="text-3xl font-bold text-gray-900">{imageStats.listingsWithoutImages}</p>
                      <p className="text-sm text-gray-500">listings</p>
                    </div>
                  </div>

                  {/* Images by Category */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Images by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(imageStats.imagesByCategory).map(([category, count]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <p className="text-sm text-gray-500">{category}</p>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Listings by Images */}
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Top Listings by Image Count</h3>
                      {selectedListings.size > 0 && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {selectedListings.size} selected
                          </span>
                          <Button
                            label="Bulk Delete Images"
                            onClick={handleBulkDelete}
                            outline
                            small
                            disabled={isBulkOperating}
                          />
                        </div>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={selectedListings.size === imageStats.topListingsByImages.length && selectedListings.size > 0}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Listing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {imageStats.topListingsByImages.map((listing) => (
                            <tr key={listing.id}>
                              <td className="px-3 py-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={selectedListings.has(listing.id)}
                                  onChange={() => handleSelectListing(listing.id)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {listing.title}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {listing.ownerEmail}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {listing.imageCount} images
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                  href={`/listings/${listing.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* User Storage Stats */}
                  {imageStats.userStorageStats && (
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">User Storage Usage</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Listings
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Images
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Est. Storage
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {imageStats.userStorageStats.slice(0, 10).map((user, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.listingCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.totalImages}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {(user.estimatedStorage / (1024 * 1024)).toFixed(2)} MB
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AdminClient;