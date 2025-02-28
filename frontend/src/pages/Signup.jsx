import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import authService from '../api/authService';
import { verificationNeeded } from '../store/authSlice';

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState('mobile'); // 'email' or 'mobile'
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const toggleIdentifierType = () => {
    setIdentifierType(identifierType === 'email' ? 'mobile' : 'email');
  };
  
  const validateIdentifier = (value) => {
    if (identifierType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || t('errors.invalidEmail');
    } else {
      // Mobile validation (Persian mobile format)
      const mobileRegex = /^(09|\+989)\d{9}$/;
      return mobileRegex.test(value) || 'شماره موبایل نامعتبر است';
    }
  };
  
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Create user data object based on identifier type
      const userData = {
        [identifierType]: data.identifier,
        password: data.password,
        shop_name: data.shopName,
        // Add any other required fields
      };
      
      const response = await authService.signup(userData);
      
      // If verification is needed (for mobile or email)
      if (response.needsVerification) {
        dispatch(verificationNeeded({
          identifier: data.identifier,
          identifierType: identifierType,
          userId: response.userId
        }));
        navigate('/verify');
      } else {
        toast.success(t('signup.success'));
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = t('errors.serverError');
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t('signup.title', 'ثبت نام در آژیرو')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('signup.subtitle', 'حساب کاربری خود را بسازید')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                {identifierType === 'email' ? t('login.email') : t('login.mobile')}
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type={identifierType === 'email' ? 'email' : 'tel'}
                  autoComplete={identifierType === 'email' ? 'email' : 'tel'}
                  required
                  className="input-field w-full"
                  placeholder={t('login.identifierPlaceholder')}
                  {...register('identifier', { 
                    required: t('errors.required'),
                    validate: validateIdentifier
                  })}
                />
              </div>
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-600">{errors.identifier.message}</p>
              )}
              <button
                type="button"
                className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                onClick={toggleIdentifierType}
              >
                {identifierType === 'email' 
                  ? 'استفاده از شماره موبایل' 
                  : 'استفاده از ایمیل'}
              </button>
            </div>

            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                {t('signup.shopName')}
              </label>
              <div className="mt-1">
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder={t('signup.shopNamePlaceholder')}
                  {...register('shopName', { 
                    required: t('errors.required'),
                    minLength: {
                      value: 2,
                      message: t('errors.tooShort', { count: 2 })
                    },
                    maxLength: {
                      value: 50,
                      message: t('errors.tooLong', { count: 50 })
                    }
                  })}
                />
              </div>
              {errors.shopName && (
                <p className="mt-2 text-sm text-red-600">{errors.shopName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field w-full"
                  {...register('password', { 
                    required: t('errors.required'),
                    minLength: {
                      value: 6,
                      message: t('errors.tooShort', { count: 6 })
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('signup.confirmPassword', 'تأیید رمز عبور')}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field w-full"
                  {...register('confirmPassword', { 
                    required: t('errors.required'),
                    validate: (value, formValues) => 
                      value === formValues.password || t('errors.passwordMismatch')
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex justify-center py-2 px-4"
              >
                {isLoading ? t('signup.loading', 'در حال ثبت نام...') : t('signup.submit', 'ثبت نام')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
              {t('signup.haveAccount', 'قبلاً حساب کاربری دارید؟')} {t('signup.loginLink', 'ورود')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 