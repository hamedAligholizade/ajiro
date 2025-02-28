import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTransactions } from '../api/queryHooks';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  
  // Fetch recent transactions
  const { data: transactionsData, isLoading } = useTransactions({ page: 1, limit: 5 }, {
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('dashboard.welcome', { name: user?.name || user?.email || user?.mobile })}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Sales Card */}
        <div className="card bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {t('dashboard.todaySales')}
          </h2>
          <p className="text-3xl font-bold text-primary-600">
            ۰ تومان
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ۰ {t('transactions.title')}
          </p>
        </div>
        
        {/* This Month's Sales Card */}
        <div className="card bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {t('dashboard.monthSales')}
          </h2>
          <p className="text-3xl font-bold text-primary-600">
            ۰ تومان
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ۰ {t('transactions.title')}
          </p>
        </div>
        
        {/* Low Stock Items Card */}
        <div className="card bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {t('dashboard.lowStock')}
          </h2>
          <p className="text-3xl font-bold text-red-500">
            ۰
          </p>
          <Link to="/products" className="text-sm text-primary-600 mt-1 block">
            {t('products.title')}
          </Link>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('dashboard.recentTransactions')}
          </h2>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700">
            {t('common.view_all')}
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : transactionsData?.transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('transactions.date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('transactions.amount')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('transactions.items')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('transactions.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionsData.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.transaction_date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(transaction.total_amount).toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.TransactionItems?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {t(`transactions.status_${transaction.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <Link 
                        to={`/transactions/${transaction.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('transactions.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            {t('transactions.noTransactions')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 