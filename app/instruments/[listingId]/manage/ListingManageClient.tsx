'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { safeListingWithAddress, SafeUser } from '@/types';
import Container from '@/components/Container';
import Heading from '@/components/Heading';
import Button from '@/components/Button';
import Input from '@/components/inputs/Input';
import CategoryInput from '@/components/inputs/CategoryInput';
import ImageUpload from '@/components/inputs/ImageUpload';
import ExactAddressInput from '@/components/inputs/ExactAddressInput';
import InstrumentAutocomplete from '@/components/inputs/InstrumentAutocomplete';
import { categories } from '@/components/navbar/Categories';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

interface ListingManageClientProps {
  listing: safeListingWithAddress;
  currentUser: SafeUser;
}

const WEEKDAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
];

const ListingManageClient: React.FC<ListingManageClientProps> = ({
  listing,
  currentUser
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'location' | 'availability' | 'images'>('info');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      title: listing.title,
      description: listing.description,
      category: listing.category,
      instrumentType: listing.instrumentType,
      experienceLevel: listing.experienceLevel,
      price: listing.price,
      imageSrc: listing.imageSrc || [],
      exactAddress: listing.exactAddress,
      city: listing.city,
      state: listing.state,
      zipCode: listing.zipCode,
      latitude: listing.latitude,
      longitude: listing.longitude,
      pickupStartTime: listing.pickupStartTime || '09:00',
      pickupEndTime: listing.pickupEndTime || '17:00',
      returnStartTime: listing.returnStartTime || '09:00',
      returnEndTime: listing.returnEndTime || '17:00',
      availableDays: listing.availableDays || []
    }
  });

  const category = watch('category');
  const instrumentType = watch('instrumentType');
  const experienceLevel = watch('experienceLevel');
  const imageSrc = watch('imageSrc');
  const availableDays = watch('availableDays');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      await axios.patch(`/api/listings/${listing.id}`, data);
      toast.success('Listing updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.delete(`/api/listings/${listing.id}`);
      toast.success('Listing deleted');
      router.push('/instruments');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [listing.id, router]);

  const handleDayToggle = (day: string) => {
    const currentDays = availableDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];
    setCustomValue('availableDays', newDays);
  };

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto relative z-0">
        <div className="flex flex-col gap-6">
          <div>
            <Heading
              title="Manage Your Listing"
              subtitle={listing.title}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveSection('info')}
                  className={`text-left px-4 py-3 rounded-lg transition ${
                    activeSection === 'info' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveSection('location')}
                  className={`text-left px-4 py-3 rounded-lg transition ${
                    activeSection === 'location' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveSection('availability')}
                  className={`text-left px-4 py-3 rounded-lg transition ${
                    activeSection === 'availability' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Availability
                </button>
                <button
                  onClick={() => setActiveSection('images')}
                  className={`text-left px-4 py-3 rounded-lg transition ${
                    activeSection === 'images' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Images
                </button>
              </div>

              <hr className="my-6" />

              <Button
                outline
                label="Delete Listing"
                onClick={handleDelete}
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                {activeSection === 'info' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="text-2xl font-semibold mb-4">
                        Basic Information
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          id="title"
                          label="Title"
                          disabled={isLoading}
                          register={register}
                          errors={errors}
                          required
                        />
                        <Input
                          id="description"
                          label="Description"
                          disabled={isLoading}
                          register={register}
                          errors={errors}
                          required
                          multiline
                          rows={4}
                        />
                        <Input
                          id="price"
                          label="Price per day"
                          formatPrice
                          type="number"
                          disabled={isLoading}
                          register={register}
                          errors={errors}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-xl font-semibold mb-4">
                        Instrument Details
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                        {categories.map((item) => (
                          <div key={item.label} className="col-span-1">
                            <CategoryInput
                              onClick={(value) => setCustomValue('category', value)}
                              selected={category === item.label}
                              label={item.label}
                              icon={item.icon}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {category && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Specific Instrument Type
                        </div>
                        <InstrumentAutocomplete
                          value={instrumentType}
                          onChange={(value) => setCustomValue('instrumentType', value)}
                          placeholder="Select specific instrument"
                          error={!!errors.instrumentType}
                        />
                      </div>
                    )}

                    <div>
                      <div className="text-xl font-semibold mb-2">
                        Required Experience Level
                      </div>
                      <div className="text-gray-600 mb-4">
                        What level of experience should the renter have?
                      </div>
                      <div className="relative">
                        <select
                          value={experienceLevel}
                          onChange={(e) => setCustomValue('experienceLevel', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed pr-10"
                          style={{ 
                            backgroundColor: '#ffffff !important',
                            backgroundImage: 'none !important',
                            background: '#ffffff !important'
                          }}
                          disabled={isLoading}
                        >
                          <option value={1}>Beginner</option>
                          <option value={2}>Intermediate</option>
                          <option value={3}>Advanced</option>
                          <option value={4}>Professional</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'location' && (
                  <div className="flex flex-col gap-8">
                    <div className="text-2xl font-semibold">
                      Pickup/Return Location
                    </div>
                    <ExactAddressInput
                      value={watch('exactAddress')}
                      onChange={(value) => {
                        setCustomValue('exactAddress', value);
                      }}
                      onValidSelection={async (isValid, locationData) => {
                        if (isValid && locationData) {
                          if (locationData.city) setCustomValue('city', locationData.city);
                          if (locationData.state) setCustomValue('state', locationData.state);
                          if (locationData.zipCode) setCustomValue('zipCode', locationData.zipCode);
                          
                          // Geocode the address to get coordinates
                          try {
                            const response = await fetch(`/api/geocode?address=${encodeURIComponent(watch('exactAddress'))}`);
                            const data = await response.json();
                            if (data.coordinates && data.coordinates.length === 2) {
                              setCustomValue('latitude', data.coordinates[0]);
                              setCustomValue('longitude', data.coordinates[1]);
                            }
                          } catch (error) {
                            console.error('Geocoding error:', error);
                          }
                        }
                      }}
                    />
                    
                    {watch('exactAddress') && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium text-gray-700 mb-2">{watch('exactAddress')}</div>
                          {watch('city') && <div>City: {watch('city')}</div>}
                          {watch('state') && <div>State: {watch('state')}</div>}
                          {watch('zipCode') && <div>ZIP: {watch('zipCode')}</div>}
                          {watch('latitude') && watch('longitude') && (
                            <div className="mt-2 text-xs">
                              Coordinates: {watch('latitude').toFixed(6)}, {watch('longitude').toFixed(6)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'availability' && (
                  <div className="flex flex-col gap-8">
                    <div className="text-2xl font-semibold">
                      Availability Settings
                    </div>

                    <div>
                      <div className="text-xl font-semibold mb-4">
                        Available Days
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {WEEKDAYS.map((day) => (
                          <label
                            key={day.value}
                            className={`
                              flex items-center justify-center px-4 py-3 
                              border-2 rounded-lg cursor-pointer transition
                              ${availableDays?.includes(day.value)
                                ? 'border-amber-600 bg-amber-600 text-black'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={availableDays?.includes(day.value)}
                              onChange={() => handleDayToggle(day.value)}
                              disabled={isLoading}
                            />
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-lg font-semibold mb-4">
                          Pickup Hours
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              Start Time
                            </label>
                            <input
                              type="time"
                              {...register('pickupStartTime')}
                              className="w-full px-4 py-2 border rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              End Time
                            </label>
                            <input
                              type="time"
                              {...register('pickupEndTime')}
                              className="w-full px-4 py-2 border rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-lg font-semibold mb-4">
                          Return Hours
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              Start Time
                            </label>
                            <input
                              type="time"
                              {...register('returnStartTime')}
                              className="w-full px-4 py-2 border rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              End Time
                            </label>
                            <input
                              type="time"
                              {...register('returnEndTime')}
                              className="w-full px-4 py-2 border rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'images' && (
                  <div className="flex flex-col gap-8">
                    <div className="text-2xl font-semibold">
                      Listing Images
                    </div>
                    <ImageUpload
                      value={imageSrc}
                      onChange={(value) => setCustomValue('imageSrc', value)}
                      maxImages={10}
                    />
                    <div className="text-sm text-gray-600">
                      You can upload up to 10 images. Drag to reorder.
                    </div>
                  </div>
                )}

                <div className="mt-8 mb-8 flex gap-6">
                  <Button
                    label="Save Changes"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                  />
                  <Button
                    outline
                    label="Cancel"
                    onClick={() => router.push('/instruments')}
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ListingManageClient;