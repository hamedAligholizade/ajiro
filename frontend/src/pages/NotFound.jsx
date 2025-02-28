import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-semibold mt-4 text-gray-900">
            {t('notFound.title', 'صفحه مورد نظر یافت نشد')}
          </h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {t('notFound.message', 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.')}
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="btn-primary inline-block"
            >
              {t('notFound.backHome', 'بازگشت به صفحه اصلی')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound; 