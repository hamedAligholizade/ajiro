import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { FaPlus, FaCog } from 'react-icons/fa';
import { setCurrentShop } from '../store/shopSlice';
import CustomerList from '../components/CustomerList';
import CustomerForm from '../components/CustomerForm';
import LoyaltyDetails from '../components/LoyaltyDetails';
import LoyaltySettings from '../components/LoyaltySettings';
import Modal from '../components/common/Modal';

const Customers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currentShop, loading: shopLoading } = useSelector((state) => state.shop);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('list');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    document.title = `${t('customer.customers')} | Ajiro`;
  }, [t]);
  
  // Check if user has shop data but currentShop is missing
  useEffect(() => {
    if (!currentShop && user && user.shop) {
      console.log('Found shop in user state but not in shop state, updating shop state');
      dispatch(setCurrentShop(user.shop));
    }
  }, [currentShop, dispatch, user]);

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleViewLoyalty = (customer) => {
    setSelectedCustomer(customer);
    setShowLoyaltyModal(true);
  };

  const handleCustomerSaved = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
    // Trigger refresh of customer list
    setRefreshTrigger(prev => prev + 1);
  };

  const renderTabs = () => {
    return (
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('list')}
        >
          {t('customer.customersList')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'loyalty'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('loyalty')}
        >
          {t('loyalty.settings')}
        </button>
      </div>
    );
  };

  if (shopLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-md p-6">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="ml-3 text-gray-600">{t('shop.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">{t('shop.noShopSelected')}</p>
          <p className="text-yellow-700 mt-2">{t('shop.pleaseContact')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('customer.customersManagement')}</h1>
        
        {activeTab === 'list' && (
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setShowCustomerModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
          >
            <FaPlus className="mr-2" /> {t('customer.addCustomer')}
          </button>
        )}
      </div>
      
      {renderTabs()}
      
      {activeTab === 'list' && currentShop && (
        <CustomerList
          shopId={currentShop.id}
          onEditCustomer={handleEditCustomer}
          onViewLoyalty={handleViewLoyalty}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      {activeTab === 'loyalty' && currentShop && (
        <LoyaltySettings shopId={currentShop.id} />
      )}
      
      {/* Customer Form Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title={selectedCustomer ? t('customer.editCustomer') : t('customer.addCustomer')}
      >
        {currentShop && (
          <CustomerForm
            shopId={currentShop.id}
            initialData={selectedCustomer}
            onSuccess={handleCustomerSaved}
            onCancel={() => setShowCustomerModal(false)}
          />
        )}
      </Modal>
      
      {/* Loyalty Details Modal */}
      <Modal
        isOpen={showLoyaltyModal}
        onClose={() => setShowLoyaltyModal(false)}
        title={t('loyalty.customerLoyalty')}
        maxWidth="max-w-4xl"
      >
        {currentShop && selectedCustomer && (
          <LoyaltyDetails
            shopId={currentShop.id}
            customerId={selectedCustomer.id}
            onClose={() => setShowLoyaltyModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Customers; 