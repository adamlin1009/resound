'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from '@/components/Toast';
import axios from 'axios';

import { SafeReservation, SafeUser } from '@/types';
import Container from '@/components/Container';
import Heading from '@/components/Heading';
import Button from '@/components/Button';
import Input from '@/components/inputs/Input';
import { RentalStatus } from '@prisma/client';
import useMessages from '@/hook/useMessages';

interface RentalManageClientProps {
  reservation: SafeReservation & {
    isRenter: boolean;
    isOwner: boolean;
  };
  currentUser?: SafeUser | null;
}

const RentalManageClient: React.FC<RentalManageClientProps> = ({
  reservation,
  currentUser,
}) => {
  const router = useRouter();
  const { startConversation } = useMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Destructure first
  const { listing, user: renter, isRenter, isOwner } = reservation;
  const owner = listing.user;
  
  // Helper function to format addresses
  const formatAddress = (address: string | null | undefined) => {
    if (!address) return '';
    // Remove ', USA' and ensure proper formatting
    return address.replace(/, USA$/, '');
  };
  
  // Form states for inline editing (only instructions are editable now)
  const [pickupInstructions, setPickupInstructions] = useState(reservation.pickupInstructions || '');
  const [returnInstructions, setReturnInstructions] = useState(reservation.returnInstructions || '');
  
  // Use the address from reservation if available, otherwise construct from listing location
  let cleanAddress = '';
  if (reservation.pickupAddress) {
    cleanAddress = reservation.pickupAddress.replace(/, USA$/, '');
  } else if (listing.city && listing.state) {
    cleanAddress = `${listing.city}, ${listing.state}`;
    if (listing.zipCode) {
      cleanAddress += ` ${listing.zipCode}`;
    }
  }
  
  const pickupAddress = cleanAddress;
  const returnAddress = reservation.returnAddress ? reservation.returnAddress.replace(/, USA$/, '') : cleanAddress;

  // Format dates
  const rentalPeriod = `${format(new Date(reservation.startDate), 'MMM dd')} - ${format(
    new Date(reservation.endDate),
    'MMM dd, yyyy'
  )}`;

  // Calculate rental status display
  const getStatusBadge = () => {
    const statusMap = {
      PENDING: { label: 'Awaiting Owner Setup', color: 'bg-yellow-100 text-yellow-800' },
      READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
      PICKED_UP: { label: 'Picked Up', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      AWAITING_RETURN: { label: 'Awaiting Return', color: 'bg-orange-100 text-orange-800' },
      RETURNED: { label: 'Returned', color: 'bg-gray-100 text-gray-800' },
      COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    };

    const status = reservation.rentalStatus || 'PENDING';
    const { label, color } = statusMap[status as keyof typeof statusMap];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Handle contact button
  const handleContact = useCallback(async () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use startConversation with owner and renter IDs
      await startConversation(listing.id, owner.id, renter.id);
      
      // Navigate to messages page
      router.push('/messages');
      toast.success('Conversation started!');
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error.message || 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, listing.id, owner.id, renter.id, startConversation, router]);

  // Handle pickup confirmation
  const handlePickupConfirm = useCallback(async (action: 'confirm' | 'unconfirm') => {
    try {
      setIsLoading(true);
      await axios.post(`/api/reservations/${reservation.id}/pickup`, { action });
      toast.success(action === 'confirm' ? 'Pickup confirmed!' : 'Pickup confirmation removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update pickup confirmation');
    } finally {
      setIsLoading(false);
    }
  }, [reservation.id, router]);

  // Handle return confirmation
  const handleReturnConfirm = useCallback(async (action: 'confirm' | 'unconfirm') => {
    try {
      setIsLoading(true);
      await axios.post(`/api/reservations/${reservation.id}/return`, { action });
      toast.success(action === 'confirm' ? 'Return confirmed!' : 'Return confirmation removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update return confirmation');
    } finally {
      setIsLoading(false);
    }
  }, [reservation.id, router]);

  // Handle setup save
  const handleSetupSave = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const setupData = {
        pickupAddress,
        pickupInstructions,
        returnAddress,
        returnInstructions,
      };
      
      await axios.put(`/api/reservations/${reservation.id}/setup`, setupData);
      
      // Show success message
      toast.success('Instructions saved!');
      
      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save instructions');
    } finally {
      setIsLoading(false);
    }
  }, [reservation.id, pickupAddress, pickupInstructions, returnAddress, returnInstructions, router]);

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Status Alert */}
            {reservation.rentalStatus === 'PENDING' && isRenter && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  The owner is currently setting up pickup details. You&apos;ll be notified once they&apos;re ready.
                </p>
              </div>
            )}

            {/* Owner Setup Alert */}
            {reservation.rentalStatus === 'PENDING' && isOwner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-3">
                  Please set up the rental details for this booking.
                </p>
                <Button
                  label="Set Up Rental Details"
                  onClick={() => setActiveTab('pickup')}
                  small
                />
              </div>
            )}

            {/* Rental Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Rental Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Instrument</p>
                  <p className="font-medium">{listing.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rental Period</p>
                  <p className="font-medium">{rentalPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{isRenter ? 'Owner' : 'Renter'}</p>
                  <p className="font-medium">{isRenter ? owner.name : renter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-medium">${reservation.totalPrice}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  label={`Contact ${isRenter ? 'Owner' : 'Renter'}`}
                  onClick={handleContact}
                  disabled={isLoading}
                />
                <Button
                  label="View Listing"
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  outline
                />
              </div>
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Pickup Information</h3>
              
              {reservation.pickupAddress ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pickup Address</p>
                    <p className="font-medium">{formatAddress(reservation.pickupAddress)}</p>
                  </div>
                  
                  {reservation.pickupStartTime && reservation.pickupEndTime && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pickup Window</p>
                      <p className="font-medium">
                        {format(new Date(reservation.pickupStartTime), 'MMM dd, h:mm a')} - 
                        {format(new Date(reservation.pickupEndTime), 'h:mm a')}
                      </p>
                    </div>
                  )}
                  
                  {reservation.pickupInstructions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pickup Instructions</p>
                      <p className="whitespace-pre-wrap">{reservation.pickupInstructions}</p>
                    </div>
                  )}

                  {/* Pickup Confirmation */}
                  {reservation.rentalStatus === 'READY_FOR_PICKUP' && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3">Pickup Confirmation</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {isOwner ? 'Renter' : 'Your'} confirmation:
                          </span>
                          <span className={`text-sm font-medium ${reservation.pickupConfirmedByRenter ? 'text-green-600' : 'text-gray-400'}`}>
                            {reservation.pickupConfirmedByRenter ? '✓ Confirmed' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {isRenter ? 'Owner' : 'Your'} confirmation:
                          </span>
                          <span className={`text-sm font-medium ${reservation.pickupConfirmedByOwner ? 'text-green-600' : 'text-gray-400'}`}>
                            {reservation.pickupConfirmedByOwner ? '✓ Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {isRenter && !reservation.pickupConfirmedByRenter && (
                          <Button
                            label="Confirm Pickup"
                            onClick={() => handlePickupConfirm('confirm')}
                            disabled={isLoading}
                          />
                        )}
                        {isRenter && reservation.pickupConfirmedByRenter && (
                          <Button
                            label="Remove Confirmation"
                            onClick={() => handlePickupConfirm('unconfirm')}
                            disabled={isLoading}
                            outline
                          />
                        )}
                        {isOwner && !reservation.pickupConfirmedByOwner && (
                          <Button
                            label="Confirm Pickup"
                            onClick={() => handlePickupConfirm('confirm')}
                            disabled={isLoading}
                          />
                        )}
                        {isOwner && reservation.pickupConfirmedByOwner && (
                          <Button
                            label="Remove Confirmation"
                            onClick={() => handlePickupConfirm('unconfirm')}
                            disabled={isLoading}
                            outline
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Edit Section */}
                  {isOwner && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-4">Add Pickup Instructions</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Pickup Instructions</label>
                          <textarea
                            value={pickupInstructions}
                            onChange={(e) => setPickupInstructions(e.target.value)}
                            placeholder="Add any special instructions for pickup (e.g., parking info, building access code, etc.)"
                            rows={3}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            label="Save Instructions"
                            onClick={handleSetupSave}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isOwner ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Pickup Address</label>
                        <div className="mt-1 p-3 bg-gray-100 rounded-md">
                          <p className="font-medium text-gray-900">{cleanAddress}</p>
                        </div>
                      </div>
                      
                      {reservation.pickupStartTime && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Scheduled Pickup Time</label>
                          <div className="mt-1 p-3 bg-gray-100 rounded-md">
                            <p className="font-medium text-gray-900">
                              {format(new Date(reservation.pickupStartTime), 'MMM dd, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Pickup Instructions</label>
                        <textarea
                          value={pickupInstructions}
                          onChange={(e) => setPickupInstructions(e.target.value)}
                          placeholder="Add any special instructions for pickup (e.g., parking info, building access code, etc.)"
                          rows={3}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          label="Save Instructions"
                          onClick={handleSetupSave}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Pickup details will be available once the owner sets them up.</p>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'return':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Return Information</h3>
              
              {reservation.returnAddress ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Return Address</p>
                    <p className="font-medium">{formatAddress(reservation.returnAddress)}</p>
                  </div>
                  
                  {reservation.returnStartTime && reservation.returnEndTime && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Return Window</p>
                      <p className="font-medium">
                        {format(new Date(reservation.returnStartTime), 'MMM dd, h:mm a')} - {format(new Date(reservation.returnEndTime), 'h:mm a')}
                      </p>
                    </div>
                  )}
                  
                  {reservation.returnInstructions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Return Instructions</p>
                      <p className="whitespace-pre-wrap">{reservation.returnInstructions}</p>
                    </div>
                  )}

                  {/* Return Confirmation */}
                  {(reservation.rentalStatus === 'IN_PROGRESS' || reservation.rentalStatus === 'AWAITING_RETURN') && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3">Return Confirmation</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {isOwner ? 'Renter' : 'Your'} confirmation:
                          </span>
                          <span className={`text-sm font-medium ${reservation.returnConfirmedByRenter ? 'text-green-600' : 'text-gray-400'}`}>
                            {reservation.returnConfirmedByRenter ? '✓ Confirmed' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {isRenter ? 'Owner' : 'Your'} confirmation:
                          </span>
                          <span className={`text-sm font-medium ${reservation.returnConfirmedByOwner ? 'text-green-600' : 'text-gray-400'}`}>
                            {reservation.returnConfirmedByOwner ? '✓ Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {isRenter && !reservation.returnConfirmedByRenter && (
                          <Button
                            label="Confirm Return"
                            onClick={() => handleReturnConfirm('confirm')}
                            disabled={isLoading}
                          />
                        )}
                        {isRenter && reservation.returnConfirmedByRenter && (
                          <Button
                            label="Remove Confirmation"
                            onClick={() => handleReturnConfirm('unconfirm')}
                            disabled={isLoading}
                            outline
                          />
                        )}
                        {isOwner && !reservation.returnConfirmedByOwner && (
                          <Button
                            label="Confirm Return"
                            onClick={() => handleReturnConfirm('confirm')}
                            disabled={isLoading}
                          />
                        )}
                        {isOwner && reservation.returnConfirmedByOwner && (
                          <Button
                            label="Remove Confirmation"
                            onClick={() => handleReturnConfirm('unconfirm')}
                            disabled={isLoading}
                            outline
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Edit Section */}
                  {isOwner && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-4">Add Return Instructions</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Return Instructions</label>
                          <textarea
                            value={returnInstructions}
                            onChange={(e) => setReturnInstructions(e.target.value)}
                            placeholder="Add any special instructions for return (e.g., where to leave the instrument, etc.)"
                            rows={3}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            label="Save Instructions"
                            onClick={handleSetupSave}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isOwner ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Return Address</p>
                        <p className="font-medium">{cleanAddress}</p>
                      </div>
                      
                      {reservation.returnStartTime && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Scheduled Return Time</p>
                          <p className="font-medium">
                            {format(new Date(reservation.returnStartTime), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Return Instructions</p>
                        <textarea
                          value={returnInstructions}
                          onChange={(e) => setReturnInstructions(e.target.value)}
                          placeholder="Add any special instructions for return (e.g., where to leave the instrument, etc.)"
                          rows={3}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          label="Save Instructions"
                          onClick={handleSetupSave}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Return details will be available once the owner sets them up.</p>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Messages</h3>
            <p className="text-gray-600 mb-4">
              Communicate directly with the {isRenter ? 'owner' : 'renter'} about this rental.
            </p>
            <Button
              label="Open Messages"
              onClick={handleContact}
              disabled={isLoading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Container>
        <div className="max-w-screen-lg mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="border-b pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <Heading
                    title="Rental Management"
                    subtitle={`Manage your ${listing.title} rental`}
                  />
                  <p className="text-gray-600 mt-2">{rentalPeriod}</p>
                </div>
                <div className="mt-2">
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'pickup', label: 'Pickup Details' },
                  { id: 'return', label: 'Return Details' },
                  { id: 'messages', label: 'Messages' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default RentalManageClient;