import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import { loginStart, loginSuccess, loginFailure, verificationNeeded } from '../store/authSlice';
import Layout from '../components/layout/Layout';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, isVerificationNeeded, verificationData } = useSelector(
    (state) => state.auth
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Redirect to verification page if needed
  useEffect(() => {
    if (isVerificationNeeded && verificationData) {
      navigate('/verify');
    }
  }, [isVerificationNeeded, verificationData, navigate]);

  // Show error message as toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      
      // Determine if the input is an email or mobile number
      const isEmail = data.identifier.includes('@');
      const credentials = isEmail 
        ? { email: data.identifier, password: data.password }
        : { mobile: data.identifier, password: data.password };
      
      const response = await authService.signin(credentials);
      
      if (response.status === 'success' && response.token) {
        // Login successful
        dispatch(loginSuccess(response.user));
        navigate('/dashboard');
      } else if (response.status === 'verification_needed') {
        // Verification needed
        dispatch(verificationNeeded({
          userId: response.userId,
          method: isEmail ? 'email' : 'mobile',
          identifier: data.identifier
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('errors.serverError');
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="card w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  {t('login.identifier')}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  {...register('identifier', { 
                    required: t('errors.required'),
                  })}
                  className="input-field relative block w-full rounded border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder={t('login.identifierPlaceholder')}
                />
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  {...register('password', { 
                    required: t('errors.required'),
                    minLength: { value: 6, message: t('errors.tooShort', { count: 6 }) }
                  })}
                  className="input-field relative block w-full rounded border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder={t('login.password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                  {t('login.remember')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  {t('login.forgot')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center"
              >
                {isLoading ? t('login.loading') : t('login.submit')}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm">
                {t('login.register')} 
                <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 mr-1">
                  {t('login.registerLink')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 