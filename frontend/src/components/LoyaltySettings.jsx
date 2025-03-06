import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoyaltySettings = ({ shopId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    isEnabled: true,
    pointsPerUnit: 1,
    redemptionValue: 100,
    pointsExpiryDays: null,
    tierThresholds: {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      platinum: 20000
    },
    tierMultipliers: {
      bronze: 1,
      silver: 1.1,
      gold: 1.2,
      platinum: 1.5
    },
    specialRules: {
      birthdayBonus: 500,
      welcomeBonus: 200,
      referralBonus: 300
    }
  });

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/loyalty/shops/${shopId}/loyalty/config`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching loyalty settings:', error);
        toast.error(t('loyalty.fetchSettingsError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [shopId, t]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value === '' ? null : Number(value)
    }));
  };

  // Handle tier threshold changes
  const handleTierThresholdChange = (tier, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      tierThresholds: {
        ...prevSettings.tierThresholds,
        [tier]: value === '' ? 0 : Number(value)
      }
    }));
  };

  // Handle tier multiplier changes
  const handleTierMultiplierChange = (tier, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      tierMultipliers: {
        ...prevSettings.tierMultipliers,
        [tier]: value === '' ? 1 : Number(value)
      }
    }));
  };

  // Handle special rule changes
  const handleSpecialRuleChange = (rule, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      specialRules: {
        ...prevSettings.specialRules,
        [rule]: value === '' ? 0 : Number(value)
      }
    }));
  };

  // Save settings
  const handleSave = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await axios.put(`/api/loyalty/shops/${shopId}/loyalty/config`, settings);
      toast.success(t('loyalty.settingsSaved'));
    } catch (error) {
      console.error('Error saving loyalty settings:', error);
      toast.error(t('loyalty.saveSettingsError'));
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">{t('loyalty.programSettings')}</h2>
      
      <form onSubmit={handleSave}>
        {/* Basic Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 pb-2 border-b">{t('loyalty.basicSettings')}</h3>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isEnabled"
                checked={settings.isEnabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{t('loyalty.enableProgram')}</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('loyalty.pointsPerUnit')}
                <span className="text-gray-500 text-xs mr-1">
                  ({t('loyalty.per1000Tomans')})
                </span>
              </label>
              <input
                type="number"
                name="pointsPerUnit"
                value={settings.pointsPerUnit}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('loyalty.pointsPerUnitHelp')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('loyalty.redemptionValue')}
                <span className="text-gray-500 text-xs mr-1">
                  ({t('loyalty.tomansPerPoint')})
                </span>
              </label>
              <input
                type="number"
                name="redemptionValue"
                value={settings.redemptionValue}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('loyalty.redemptionValueHelp')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('loyalty.pointsExpiryDays')}
              </label>
              <input
                type="number"
                name="pointsExpiryDays"
                value={settings.pointsExpiryDays === null ? '' : settings.pointsExpiryDays}
                onChange={handleInputChange}
                min="0"
                placeholder={t('loyalty.never')}
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('loyalty.expiryHelp')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tier Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 pb-2 border-b">{t('loyalty.tierSettings')}</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">
              {t('loyalty.tierThresholds')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
                <div key={`threshold-${tier}`}>
                  <label className="block text-sm mb-1">
                    {t(`customer.tier.${tier}`)}:
                  </label>
                  <input
                    type="number"
                    value={settings.tierThresholds[tier]}
                    onChange={(e) => handleTierThresholdChange(tier, e.target.value)}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded"
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('loyalty.tierMultipliers')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
                <div key={`multiplier-${tier}`}>
                  <label className="block text-sm mb-1">
                    {t(`customer.tier.${tier}`)}:
                  </label>
                  <input
                    type="number"
                    value={settings.tierMultipliers[tier]}
                    onChange={(e) => handleTierMultiplierChange(tier, e.target.value)}
                    min="1"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Special Bonuses */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 pb-2 border-b">{t('loyalty.specialBonuses')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">
                {t('loyalty.birthdayBonus')}:
              </label>
              <input
                type="number"
                value={settings.specialRules.birthdayBonus}
                onChange={(e) => handleSpecialRuleChange('birthdayBonus', e.target.value)}
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">
                {t('loyalty.welcomeBonus')}:
              </label>
              <input
                type="number"
                value={settings.specialRules.welcomeBonus}
                onChange={(e) => handleSpecialRuleChange('welcomeBonus', e.target.value)}
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">
                {t('loyalty.referralBonus')}:
              </label>
              <input
                type="number"
                value={settings.specialRules.referralBonus}
                onChange={(e) => handleSpecialRuleChange('referralBonus', e.target.value)}
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
                dir="ltr"
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('common.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoyaltySettings; 