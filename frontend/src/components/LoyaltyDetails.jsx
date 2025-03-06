import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCoins, FaMedal, FaChartLine, FaHistory } from 'react-icons/fa';

const LoyaltyDetails = ({ shopId, customerId, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [adjustmentPoints, setAdjustmentPoints] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLoyaltyDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/customers/shops/${shopId}/customers/${customerId}/loyalty`);
      setLoyaltyData(response.data);
    } catch (error) {
      console.error('Error fetching loyalty details:', error);
      toast.error(t('loyalty.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyDetails();
  }, [shopId, customerId]);

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    
    if (!adjustmentPoints || isNaN(parseInt(adjustmentPoints))) {
      toast.error(t('loyalty.validPointsRequired'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`/api/customers/shops/${shopId}/customers/${customerId}/points`, {
        points: parseInt(adjustmentPoints),
        description: adjustmentNote || t('loyalty.manualAdjustment')
      });
      
      toast.success(t('loyalty.pointsAdjusted'));
      setAdjustmentPoints('');
      setAdjustmentNote('');
      fetchLoyaltyDetails(); // Refresh data
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error(t('loyalty.adjustmentError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format transaction date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      earned: 'bg-green-100 text-green-800',
      redeemed: 'bg-orange-100 text-orange-800',
      expired: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="p-4 text-center">
          <p className="text-red-500">{t('loyalty.dataNotFound')}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">{t('loyalty.customerLoyalty')}</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Loyalty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <FaCoins className="text-blue-500 mr-2" />
            <h3 className="font-medium">{t('loyalty.availablePoints')}</h3>
          </div>
          <p className="text-2xl font-bold">{loyaltyData.availablePoints}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center mb-2">
            <FaMedal className="text-yellow-500 mr-2" />
            <h3 className="font-medium">{t('loyalty.currentTier')}</h3>
          </div>
          <p className="text-2xl font-bold">{t(`customer.tier.${loyaltyData.tier}`)}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <FaChartLine className="text-green-500 mr-2" />
            <h3 className="font-medium">{t('loyalty.totalPointsEarned')}</h3>
          </div>
          <p className="text-2xl font-bold">{loyaltyData.totalPointsEarned}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center mb-2">
            <FaHistory className="text-purple-500 mr-2" />
            <h3 className="font-medium">{t('loyalty.totalSpent')}</h3>
          </div>
          <p className="text-xl font-bold">
            {new Intl.NumberFormat('fa-IR').format(loyaltyData.totalSpent)} {t('common.currency')}
          </p>
        </div>
      </div>

      {/* Manual Point Adjustment */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-medium mb-3">{t('loyalty.adjustPoints')}</h3>
        <form onSubmit={handleAdjustPoints} className="flex flex-wrap gap-2 items-end">
          <div className="w-full md:w-auto flex-grow">
            <label className="block text-sm mb-1">{t('loyalty.points')}</label>
            <input
              type="number"
              value={adjustmentPoints}
              onChange={(e) => setAdjustmentPoints(e.target.value)}
              placeholder="+100 or -50"
              className="w-full p-2 border border-gray-300 rounded"
              dir="ltr"
            />
          </div>
          <div className="w-full md:w-auto flex-grow">
            <label className="block text-sm mb-1">{t('loyalty.description')}</label>
            <input
              type="text"
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              placeholder={t('loyalty.adjustmentReason')}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isSubmitting ? t('common.processing') : t('loyalty.applyAdjustment')}
          </button>
        </form>
      </div>

      {/* Point Transactions History */}
      <div>
        <h3 className="font-medium mb-3">{t('loyalty.transactionHistory')}</h3>
        
        {loyaltyData.pointTransactions && loyaltyData.pointTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('loyalty.date')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('loyalty.type')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('loyalty.points')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('loyalty.description')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loyaltyData.pointTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getTypeBadgeColor(transaction.type)}`}>
                        {t(`loyalty.type.${transaction.type}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={transaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded text-center">
            <p className="text-gray-500">{t('loyalty.noTransactions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyDetails; 