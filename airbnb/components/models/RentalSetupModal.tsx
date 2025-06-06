'use client';

import { useCallback, useMemo, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';
import axios from 'axios';

import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import Button from '../Button';

interface RentalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
  onComplete: () => void;
}

enum STEPS {
  PICKUP_ADDRESS = 0,
  PICKUP_TIME = 1,
  RETURN_DETAILS = 2,
  REVIEW = 3,
}

const RentalSetupModal: React.FC<RentalSetupModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onComplete,
}) => {
  const [step, setStep] = useState(STEPS.PICKUP_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      pickupAddress: reservation.listing.exactAddress || '',
      pickupInstructions: '',
      pickupStartTime: format(new Date(reservation.startDate), "yyyy-MM-dd'T'HH:mm"),
      pickupEndTime: format(addDays(new Date(reservation.startDate), 1), "yyyy-MM-dd'T'HH:mm"),
      returnAddress: '',
      returnInstructions: '',
      returnDeadline: format(new Date(reservation.endDate), "yyyy-MM-dd'T'HH:mm"),
      ownerNotes: '',
    },
  });

  const pickupAddress = watch('pickupAddress');
  const returnAddress = watch('returnAddress');

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (data) => {
      if (step !== STEPS.REVIEW) {
        return onNext();
      }

      setIsLoading(true);

      try {
        // Use pickup address as return address if not specified
        const submissionData = {
          ...data,
          returnAddress: data.returnAddress || data.pickupAddress,
        };

        await axios.put(`/api/reservations/${reservation.id}/setup`, submissionData);

        toast.success('Rental details set successfully!');
        reset();
        setStep(STEPS.PICKUP_ADDRESS);
        onComplete();
        onClose();
      } catch (error) {
        toast.error('Failed to update rental details');
      } finally {
        setIsLoading(false);
      }
    },
    [step, reservation.id, reset, onNext, onComplete, onClose]
  );

  const actionLabel = useMemo(() => {
    if (step === STEPS.REVIEW) {
      return 'Complete Setup';
    }

    return 'Next';
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.PICKUP_ADDRESS) {
      return undefined;
    }

    return 'Back';
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Where should the renter pick up the instrument?"
        subtitle="You can use your listing address or specify a different location"
      />
      <Input
        id="pickupAddress"
        label="Pickup Address"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="pickupInstructions"
        label="Pickup Instructions (optional)"
        disabled={isLoading}
        register={register}
        errors={errors}
        multiline
        placeholder="e.g., Ring doorbell, parking available in driveway, etc."
      />
    </div>
  );

  if (step === STEPS.PICKUP_TIME) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="When can the renter pick up the instrument?"
          subtitle="Set a pickup window for the rental start date"
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            Pickup Start Time
          </label>
          <input
            type="datetime-local"
            {...register('pickupStartTime', { required: true })}
            className="w-full p-3 border rounded-lg"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Pickup End Time
          </label>
          <input
            type="datetime-local"
            {...register('pickupEndTime', { required: true })}
            className="w-full p-3 border rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.RETURN_DETAILS) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="How should the instrument be returned?"
          subtitle="Specify return location and deadline"
        />
        <Input
          id="returnAddress"
          label="Return Address (leave empty to use pickup address)"
          disabled={isLoading}
          register={register}
          errors={errors}
          placeholder={pickupAddress}
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            Return Deadline
          </label>
          <input
            type="datetime-local"
            {...register('returnDeadline', { required: true })}
            className="w-full p-3 border rounded-lg"
            disabled={isLoading}
          />
        </div>
        <Input
          id="returnInstructions"
          label="Return Instructions (optional)"
          disabled={isLoading}
          register={register}
          errors={errors}
          multiline
          placeholder="e.g., Please text when returning, place in case, etc."
        />
        <Input
          id="ownerNotes"
          label="Additional Notes for Renter (optional)"
          disabled={isLoading}
          register={register}
          errors={errors}
          multiline
        />
      </div>
    );
  }

  if (step === STEPS.REVIEW) {
    const formData = watch();
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Review Rental Details"
          subtitle="Please confirm all the information is correct"
        />
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Pickup Details</h4>
            <p className="text-sm text-gray-600">Address: {formData.pickupAddress}</p>
            <p className="text-sm text-gray-600">
              Time: {format(new Date(formData.pickupStartTime), 'MMM dd, h:mm a')} - 
              {format(new Date(formData.pickupEndTime), 'h:mm a')}
            </p>
            {formData.pickupInstructions && (
              <p className="text-sm text-gray-600">Instructions: {formData.pickupInstructions}</p>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold">Return Details</h4>
            <p className="text-sm text-gray-600">
              Address: {formData.returnAddress || formData.pickupAddress}
            </p>
            <p className="text-sm text-gray-600">
              Deadline: {format(new Date(formData.returnDeadline), 'MMM dd, yyyy h:mm a')}
            </p>
            {formData.returnInstructions && (
              <p className="text-sm text-gray-600">Instructions: {formData.returnInstructions}</p>
            )}
          </div>

          {formData.ownerNotes && (
            <div>
              <h4 className="font-semibold">Additional Notes</h4>
              <p className="text-sm text-gray-600">{formData.ownerNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={isOpen}
      title="Set Up Rental Details"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.PICKUP_ADDRESS ? undefined : onBack}
      onClose={onClose}
      body={bodyContent}
    />
  );
};

export default RentalSetupModal;