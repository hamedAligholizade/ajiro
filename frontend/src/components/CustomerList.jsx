import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaStar, FaCoins } from 'react-icons/fa';

const CustomerList = ({ shopId, onEditCustomer, onViewLoyalty, refreshTrigger }) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/customers/shops/${shopId}/customers`);
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error(t('customer.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  // Load customers on initial render and when refreshTrigger changes
  useEffect(() => {
    fetchCustomers();
  }, [shopId, refreshTrigger]);

  // Filter customers when searchQuery changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      customer =>
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.mobileNumber.includes(query)
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  // Render tier badge
  const renderTierBadge = (tier) => {
    const tierColors = {
      bronze: 'bg-amber-700',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-blue-400'
    };

    return (
      <span className={`${tierColors[tier]} text-white text-xs px-2 py-1 rounded-full`}>
        {t(`customer.tier.${tier}`)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-md shadow-md">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">{t('customer.customerList')}</h2>
          <div className="relative">
            <input
              type="text"
              placeholder={t('customer.searchCustomers')}
              className="w-full md:w-80 p-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">{t('common.loading')}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            {searchQuery
              ? t('customer.noSearchResults')
              : t('customer.noCustomers')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer.name')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer.mobileNumber')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer.tier')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer.points')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer.totalSpent')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div dir="ltr" className="text-sm text-gray-900">
                      {customer.mobileNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderTierBadge(customer.tier)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.availablePoints}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Intl.NumberFormat('fa-IR').format(customer.totalSpent)} {t('common.currency')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title={t('common.edit')}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onViewLoyalty(customer)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title={t('customer.viewLoyalty')}
                    >
                      <FaCoins />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerList; 