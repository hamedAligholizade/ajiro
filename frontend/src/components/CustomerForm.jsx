import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomerForm = ({ shopId, initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      birthDate: '',
      notes: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      let response;
      
      if (isEditing) {
        // Update existing customer
        response = await axios.put(
          `/api/customers/shops/${shopId}/customers/${initialData.id}`,
          data
        );
        toast.success(t('customer.updateSuccess'));
      } else {
        // Create new customer
        response = await axios.post(
          `/api/customers/shops/${shopId}/customers`,
          data
        );
        toast.success(t('customer.createSuccess'));
        reset();
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(t('common.errorOccurred'));
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h3 className="text-lg font-medium mb-4">
        {isEditing 
          ? t('customer.editCustomer') 
          : t('customer.addNewCustomer')}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customer.firstName')} *
            </label>
            <input
              type="text"
              {...register('firstName', { required: t('validation.required') })}
              className={`w-full p-2 border rounded ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customer.lastName')} *
            </label>
            <input
              type="text"
              {...register('lastName', { required: t('validation.required') })}
              className={`w-full p-2 border rounded ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
          
          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customer.mobileNumber')} *
            </label>
            <input
              type="text"
              dir="ltr"
              {...register('mobileNumber', { 
                required: t('validation.required'),
                pattern: {
                  value: /^(0|98|\+98)9(0[1-5]|[1 3]\d|2[0-2]|98)\d{7}$/,
                  message: t('validation.invalidMobileNumber')
                }
              })}
              className={`w-full p-2 border rounded ${
                errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>
            )}
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customer.email')}
            </label>
            <input
              type="email"
              dir="ltr"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('validation.invalidEmail')
                }
              })}
              className={`w-full p-2 border rounded ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('customer.birthDate')}
            </label>
            <input
              type="date"
              dir="ltr"
              {...register('birthDate')}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('customer.notes')}
          </label>
          <textarea
            {...register('notes')}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? t('common.saving') : (isEditing ? t('common.update') : t('common.save'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm; 