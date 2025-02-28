import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const TransactionDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t('transactions.detail')}
      </h1>
      
      <div className="card bg-white rounded-lg p-6 shadow-md">
        <p className="text-center py-12 text-gray-500">
          {t('transactions.detail')} - ID: {id}
        </p>
      </div>
    </div>
  );
};

export default TransactionDetail; 