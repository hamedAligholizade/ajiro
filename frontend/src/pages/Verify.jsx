import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  setLoading, 
  setError, 
  verificationSuccess, 
  verificationFailure 
} from '../store/authSlice';
import { setCurrentShop } from '../store/shopSlice';
import authService from '../api/authService';
import Layout from '../components/layout/Layout';

const Verify = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, isVerificationNeeded, verificationData } = useSelector(
    (state) => state.auth
  );
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
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
  
  // Redirect if verification is not needed
  useEffect(() => {
    if (!isVerificationNeeded || !verificationData) {
      navigate('/login');
    }
  }, [isVerificationNeeded, verificationData, navigate]);
  
  // Countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      dispatch(setLoading(true));
      
      const response = await authService.verify({
        userId: verificationData.userId,
        code: data.code,
        method: verificationData.method
      });
      
      if (response.status === 'success' && response.token) {
        dispatch(verificationSuccess(response.user));
        
        // If user has shop data, set it in shop state
        if (response.user && response.user.shop) {
          console.log('Setting shop data from verification response:', response.user.shop);
          dispatch(setCurrentShop(response.user.shop));
        }
        
        toast.success(t('verify.success'));
        navigate('/dashboard');
      } else {
        dispatch(verificationFailure(response.message || t('verify.invalidCode')));
        toast.error(response.message || t('verify.invalidCode'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('errors.serverError');
      dispatch(verificationFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;
    
    try {
      setIsResending(true);
      
      const response = await authService.resendCode({
        userId: verificationData.userId,
        method: verificationData.method,
        [verificationData.method === 'email' ? 'email' : 'mobile']: verificationData.identifier
      });
      
      if (response.status === 'success') {
        toast.success(t('verify.resendSuccess'));
        setResendCountdown(60);
      } else {
        toast.error(response.message || t('verify.resendFailed'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('errors.serverError');
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="card w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              {t('verify.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('verify.subtitle', { 
                method: verificationData?.method === 'email' ? t('verify.email') : t('verify.mobile'),
                identifier: verificationData?.identifier 
              })}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                {t('verify.code')}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                {...register('code', { 
                  required: t('errors.required'),
                  pattern: {
                    value: /^\d{6}$/,
                    message: t('verify.invalidCodeFormat')
                  }
                })}
                className="input-field text-center text-lg tracking-widest relative block w-full rounded border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="۰ ۰ ۰ ۰ ۰ ۰"
                maxLength={6}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center"
              >
                {isLoading ? t('verify.verifying') : t('verify.submit')}
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || isResending}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendCountdown > 0 
                  ? `${t('verify.resend')} (${resendCountdown})`
                  : isResending 
                    ? t('verify.resending')
                    : t('verify.resend')
                }
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                {t('verify.back')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Verify; 