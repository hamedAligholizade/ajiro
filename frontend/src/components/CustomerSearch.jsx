import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaUserPlus } from 'react-icons/fa';

const CustomerSearch = ({ shopId, onCustomerSelect, onNewCustomer }) => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState(null);

  const handleSearch = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error(t('customer.validMobileRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/customers/shops/${shopId}/customers/mobile/${mobileNumber}`);
      setCustomer(response.data);
      onCustomerSelect(response.data);
      toast.success(t('customer.customerFound'));
    } catch (error) {
      console.error('Error finding customer:', error);
      if (error.response && error.response.status === 404) {
        toast.info(t('customer.customerNotFound'));
        setCustomer(null);
      } else {
        toast.error(t('common.errorOccurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    onNewCustomer(mobileNumber);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-4">
      <h3 className="text-lg font-medium mb-3">{t('customer.findCustomer')}</h3>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('customer.enterMobileNumber')}
            className="w-full p-2 border border-gray-300 rounded"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            dir="ltr"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.searching')}
            </span>
          ) : (
            <span className="flex items-center">
              <FaSearch className="mr-1" /> {t('common.search')}
            </span>
          )}
        </button>
        <button
          onClick={handleCreateNew}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          <span className="flex items-center">
            <FaUserPlus className="mr-1" /> {t('customer.new')}
          </span>
        </button>
      </div>

      {customer && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <h4 className="font-medium text-blue-800">{t('customer.customerDetails')}</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm text-gray-600">{t('customer.name')}:</p>
              <p className="font-medium">{customer.firstName} {customer.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('customer.mobile')}:</p>
              <p className="font-medium">{customer.mobileNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('customer.loyaltyTier')}:</p>
              <p className="font-medium">{t(`customer.tier.${customer.tier}`)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('customer.availablePoints')}:</p>
              <p className="font-medium">{customer.availablePoints}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch; 