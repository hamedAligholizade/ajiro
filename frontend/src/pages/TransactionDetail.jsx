import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useTransaction } from '../api/queryHooks';
import { FiArrowLeft, FiShoppingCart, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';

const TransactionDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  
  // Fetch transaction data
  const { 
    data, 
    isLoading, 
    error 
  } = useTransaction(id);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          to="/transactions"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('transactions.details')} #{id}
        </h1>
      </div>
      
      {/* Main content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="mb-2">{t('common.error')}</p>
          <p>{error.message}</p>
        </div>
      ) : data?.transaction ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShoppingCart className="mr-2" />
                  {t('transactions.items')}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('products.name')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('products.price')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('transactions.quantity')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('transactions.subtotal')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.transaction.TransactionItems?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.Product?.name || `Product #${item.product_id}`}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatPrice(item.price_at_sale)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatPrice(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total row */}
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {t('transactions.total')}:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600 text-right">
                          {formatPrice(data.transaction.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900">
                  {t('transactions.details')}
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Transaction ID */}
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    {t('transactions.id')}
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    #{data.transaction.id}
                  </div>
                </div>
                
                {/* Date */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <FiCalendar className="mr-2" />
                    {t('transactions.date')}
                  </div>
                  <div className="mt-1 text-base text-gray-900">
                    {formatDate(data.transaction.transaction_date)}
                  </div>
                </div>
                
                {/* Customer Phone */}
                {data.transaction.customer_phone && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <FiUser className="mr-2" />
                      {t('transactions.customerPhone')}
                    </div>
                    <div className="mt-1 text-base text-gray-900">
                      {data.transaction.customer_phone}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {data.transaction.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <FiFileText className="mr-2" />
                      {t('transactions.notes')}
                    </div>
                    <div className="mt-1 text-base text-gray-900">
                      {data.transaction.notes}
                    </div>
                  </div>
                )}
                
                {/* Total Amount */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-500">
                    {t('transactions.total')}
                  </div>
                  <div className="mt-1 text-lg font-bold text-indigo-600">
                    {formatPrice(data.transaction.total_amount)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('transactions.print')}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {t('transactions.notFound')}
        </div>
      )}
    </div>
  );
};

export default TransactionDetail; 