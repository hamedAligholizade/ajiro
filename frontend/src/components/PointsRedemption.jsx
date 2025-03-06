import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCoins, FaExchangeAlt } from 'react-icons/fa';

const PointsRedemption = ({ 
  shopId, 
  customer, 
  totalAmount, 
  onPointsRedeemed, 
  disabled 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redemptionPreview, setRedemptionPreview] = useState(null);

  // Calculate preview when points change
  const calculateRedemptionPreview = async () => {
    const points = parseInt(pointsToRedeem);
    
    if (!points || isNaN(points) || points <= 0 || points > customer.availablePoints) {
      setRedemptionPreview(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/loyalty/shops/${shopId}/loyalty/config`);
      const config = response.data;
      
      if (!config.isEnabled) {
        toast.error(t('loyalty.programDisabled'));
        setRedemptionPreview(null);
        return;
      }
      
      const amountInTomans = points * config.redemptionValue;
      
      // Ensure discount doesn't exceed total amount
      const maxDiscount = Math.min(amountInTomans, totalAmount);
      const actualPoints = Math.floor(maxDiscount / config.redemptionValue);
      const actualDiscount = actualPoints * config.redemptionValue;
      
      setRedemptionPreview({
        points: actualPoints,
        amountInTomans: actualDiscount,
        newTotal: totalAmount - actualDiscount
      });
      
    } catch (error) {
      console.error('Error calculating redemption:', error);
      toast.error(t('loyalty.calculationError'));
      setRedemptionPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Apply redemption
  const handleApplyRedemption = () => {
    if (!redemptionPreview) return;
    
    onPointsRedeemed(redemptionPreview.points, redemptionPreview.amountInTomans);
    toast.success(
      t('loyalty.pointsApplied', { 
        points: redemptionPreview.points, 
        amount: new Intl.NumberFormat('fa-IR').format(redemptionPreview.amountInTomans) 
      })
    );
    
    // Reset form
    setPointsToRedeem('');
    setRedemptionPreview(null);
  };

  // Handle points max button
  const handleUseMaxPoints = async () => {
    if (!customer || customer.availablePoints <= 0) return;
    
    try {
      const response = await axios.get(`/api/loyalty/shops/${shopId}/loyalty/config`);
      const config = response.data;
      
      if (!config.isEnabled) {
        toast.error(t('loyalty.programDisabled'));
        return;
      }
      
      // Calculate max points that can be used based on total amount
      const maxPointsByAmount = Math.floor(totalAmount / config.redemptionValue);
      
      // Use either customer's available points or max by amount, whichever is less
      const maxPoints = Math.min(customer.availablePoints, maxPointsByAmount);
      
      setPointsToRedeem(maxPoints.toString());
      
      // Calculate preview with new points value
      const amountInTomans = maxPoints * config.redemptionValue;
      
      setRedemptionPreview({
        points: maxPoints,
        amountInTomans: amountInTomans,
        newTotal: totalAmount - amountInTomans
      });
      
    } catch (error) {
      console.error('Error calculating max points:', error);
      toast.error(t('loyalty.calculationError'));
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-md border border-amber-200 mb-4">
      <div className="flex items-center mb-3">
        <FaCoins className="text-yellow-600 mr-2" />
        <h3 className="text-lg font-medium">{t('loyalty.redeemPoints')}</h3>
      </div>

      <div className="mb-2">
        <div className="text-sm text-gray-700">
          {t('loyalty.availablePoints')}: <span className="font-semibold">{customer.availablePoints}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="w-full sm:w-auto flex-grow">
          <input
            type="number"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            onBlur={calculateRedemptionPreview}
            placeholder={t('loyalty.enterPointsToRedeem')}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={disabled || loading || customer.availablePoints <= 0}
            dir="ltr"
            min="0"
            max={customer.availablePoints}
          />
        </div>
        <button
          type="button"
          onClick={handleUseMaxPoints}
          disabled={disabled || loading || customer.availablePoints <= 0}
          className="bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600 transition disabled:opacity-50"
        >
          {t('loyalty.useMax')}
        </button>
        <button
          type="button"
          onClick={calculateRedemptionPreview}
          disabled={disabled || loading || !pointsToRedeem || customer.availablePoints <= 0}
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? t('common.calculating') : t('loyalty.calculate')}
        </button>
      </div>

      {redemptionPreview && (
        <div className="bg-white p-3 rounded-md border border-gray-200 mb-3">
          <div className="text-sm text-gray-700 mb-2">
            {t('loyalty.redemptionPreview')}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-gray-500">{t('loyalty.pointsToRedeem')}:</div>
              <div className="font-medium">{redemptionPreview.points}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t('loyalty.discountAmount')}:</div>
              <div className="font-medium text-green-600">
                {new Intl.NumberFormat('fa-IR').format(redemptionPreview.amountInTomans)} {t('common.currency')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t('loyalty.newTotal')}:</div>
              <div className="font-medium">
                {new Intl.NumberFormat('fa-IR').format(redemptionPreview.newTotal)} {t('common.currency')}
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleApplyRedemption}
              disabled={disabled}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              <FaExchangeAlt className="mr-1" /> {t('loyalty.applyRedemption')}
            </button>
          </div>
        </div>
      )}
      
      {customer.availablePoints <= 0 && (
        <div className="text-sm text-gray-500 italic">
          {t('loyalty.noPointsAvailable')}
        </div>
      )}
    </div>
  );
};

export default PointsRedemption; 