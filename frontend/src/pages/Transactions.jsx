import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTransactions } from '../api/queryHooks';
import { 
  FiPlus,
  FiSearch,
  FiCalendar,
  FiX,
  FiChevronLeft, 
  FiChevronRight,
  FiShoppingCart,
  FiEye
} from 'react-icons/fi';

const Transactions = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  
  // Query transactions with filters
  const { 
    data, 
    isLoading, 
    error 
  } = useTransactions({
    page,
    limit,
    startDate: searchSubmitted ? startDate : '',
    endDate: searchSubmitted ? endDate : ''
  });
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchSubmitted(true);
    setPage(1); // Reset to first page when searching
  };
  
  // Clear filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchSubmitted(false);
    setPage(1);
  };
  
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
  
  // Pagination controls
  const goToPage = (newPage) => {
    setPage(newPage);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('transactions.title')}
        </h1>
        <Link 
          to="/transactions/new" 
          className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          {t('transactions.new')}
        </Link>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
                {t('transactions.startDate')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
                {t('transactions.endDate')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
              >
                <FiSearch className="mr-2" />
                {t('common.search')}
              </button>
              
              {searchSubmitted && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center"
                >
                  <FiX className="mr-2" />
                  {t('common.clear')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* Transactions table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {t('common.error')}: {error.message}
          </div>
        ) : data?.transactions?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transactions.id')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transactions.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transactions.items')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transactions.customerPhone')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transactions.total')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.TransactionItems?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.customer_phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {formatPrice(transaction.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t('pagination.showing')} <span className="font-medium">{((page - 1) * limit) + 1}</span> {t('pagination.to')}{' '}
                      <span className="font-medium">{Math.min(page * limit, data.count)}</span> {t('pagination.of')}{' '}
                      <span className="font-medium">{data.count}</span> {t('transactions.results')}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">{t('pagination.previous')}</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(data.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            page === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === data.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page === data.totalPages 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">{t('pagination.next')}</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-4 mb-4">
              {searchSubmitted 
                ? t('transactions.noSearchResults') 
                : t('transactions.noTransactionsYet')}
            </p>
            <Link
              to="/transactions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiPlus className="mr-2" />
              {t('transactions.new')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 