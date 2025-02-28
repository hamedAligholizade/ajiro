import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-700 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-right">
              &copy; {currentYear} {t('app.name')} - {t('footer.rights')}
            </p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <a href="#" className="text-white hover:text-primary-200">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-white hover:text-primary-200">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-white hover:text-primary-200">
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 