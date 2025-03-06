import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Change language handler
  const changeLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = newLang;
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/favicon.svg"
                alt={t('app.name')}
              />
              <span className="mr-2 text-xl font-bold">{t('app.name')}</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex md:mr-6 md:space-x-8 md:space-x-reverse">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-white"
                >
                  {t('dashboard.title')}
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-white"
                >
                  {t('products.title')}
                </Link>
                <Link
                  to="/transactions"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-white"
                >
                  {t('transactions.title')}
                </Link>
                <Link
                  to="/customers"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-white"
                >
                  {t('customer.customers')}
                </Link>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex md:items-center">
            <button
              type="button"
              onClick={changeLanguage}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {i18n.language === 'fa' ? 'English' : 'فارسی'}
            </button>
            
            {isAuthenticated ? (
              <div className="mr-3 relative">
                <div className="flex items-center">
                  <span className="mr-2">{user?.email || user?.mobile}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('dashboard.title')}
                </Link>
                <Link
                  to="/products"
                  className="block px-3 py-2 text-base font-medium hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('products.title')}
                </Link>
                <Link
                  to="/transactions"
                  className="block px-3 py-2 text-base font-medium hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('transactions.title')}
                </Link>
                <Link
                  to="/customers"
                  className="block px-3 py-2 text-base font-medium hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('customer.customers')}
                </Link>
              </>
            )}
            
            <button
              type="button"
              onClick={changeLanguage}
              className="block w-full text-right px-3 py-2 text-base font-medium hover:bg-primary-600"
            >
              {i18n.language === 'fa' ? 'English' : 'فارسی'}
            </button>
            
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-right px-3 py-2 text-base font-medium text-red-300 hover:bg-primary-600"
              >
                {t('auth.logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 text-base font-medium hover:bg-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 