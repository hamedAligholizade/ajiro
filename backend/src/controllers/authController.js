/**
 * Authentication controller for user signup, signin, verification
 */
const { User, VerificationCode, Shop } = require('../models');
const { generateToken } = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize');

// Helper to send SMS - in a real implementation, integrate with SMS provider
const sendSMS = async (phone, message) => {
  // Mock SMS sending - in production, integrate with SMS provider
  console.log(`SMS to ${phone}: ${message}`);
  return true;
};

/**
 * Sign up a new user with either email/password or mobile
 * @route POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { email, password, mobile, shop_name } = req.body;
    
    // Require either email/password or mobile
    if ((!email || !password) && !mobile) {
      return res.status(400).json({
        status: 'error',
        message: 'ایمیل و رمز عبور یا شماره موبایل الزامی است'
      });
    }
    
    // Require shop name
    if (!shop_name) {
      return res.status(400).json({
        status: 'error',
        message: 'نام فروشگاه الزامی است'
      });
    }
    
    // Check if user with email or mobile already exists
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          email ? { email } : null,
          mobile ? { mobile } : null,
        ].filter(Boolean),
      },
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'این ایمیل یا شماره موبایل قبلاً ثبت شده است'
      });
    }
    
    // Create shop
    const shop = await Shop.create({
      name: shop_name,
    });
    
    // Create user with reference to shop
    const user = await User.create({
      email,
      password,
      mobile,
      shop_id: shop.id,
      is_verified: mobile ? false : true, // Email users are auto-verified for simplicity
    });
    
    // If using mobile, create and send verification code
    if (mobile) {
      // Create verification code
      const code = VerificationCode.generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code expires in 10 minutes
      
      await VerificationCode.create({
        user_id: user.id,
        code,
        expires_at: expiresAt,
        type: 'mobile',
      });
      
      // Send SMS with code
      await sendSMS(mobile, `کد تایید آژیرو: ${code}`);
      
      return res.status(201).json({
        status: 'success',
        message: 'کد تایید به شماره موبایل شما ارسال شد',
        requires_verification: true,
        user_id: user.id,
      });
    }
    
    // For email users, generate token
    const token = generateToken(user);
    
    return res.status(201).json({
      status: 'success',
      message: 'ثبت نام با موفقیت انجام شد',
      token,
      user: {
        id: user.id,
        email: user.email,
        shop_id: user.shop_id,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در ثبت نام کاربر'
    });
  }
};

/**
 * Sign in an existing user
 * @route POST /api/auth/signin
 */
const signin = async (req, res) => {
  try {
    const { email, password, mobile } = req.body;
    
    // Require either email/password or mobile
    if ((!email || !password) && !mobile) {
      return res.status(400).json({
        status: 'error',
        message: 'ایمیل و رمز عبور یا شماره موبایل الزامی است'
      });
    }
    
    // Find user by email or mobile
    const user = await User.findOne({
      where: email ? { email } : { mobile },
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'کاربر یافت نشد'
      });
    }
    
    // For email/password login
    if (email) {
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'ایمیل یا رمز عبور اشتباه است'
        });
      }
      
      // Get shop data
      const shop = await Shop.findByPk(user.shop_id);
      
      // Generate token
      const token = generateToken(user);
      
      return res.status(200).json({
        status: 'success',
        message: 'ورود موفقیت آمیز',
        token,
        user: {
          id: user.id,
          email: user.email,
          shop_id: user.shop_id,
          shop: shop ? {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            created_at: shop.created_at
          } : null
        },
      });
    }
    
    // For mobile login, create and send verification code
    if (mobile) {
      // Create verification code
      const code = VerificationCode.generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code expires in 10 minutes
      
      await VerificationCode.create({
        user_id: user.id,
        code,
        expires_at: expiresAt,
        type: 'mobile',
      });
      
      // Send SMS with code
      await sendSMS(mobile, `کد تایید آژیرو: ${code}`);
      
      return res.status(200).json({
        status: 'success',
        message: 'کد تایید به شماره موبایل شما ارسال شد',
        requires_verification: true,
        user_id: user.id,
      });
    }
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در ورود به سیستم'
    });
  }
};

/**
 * Verify a code for mobile authentication
 * @route POST /api/auth/verify
 */
const verify = async (req, res) => {
  try {
    const { user_id, code } = req.body;
    
    if (!user_id || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه کاربر و کد تایید الزامی است'
      });
    }
    
    // Find the latest unused verification code for this user
    const verificationCode = await VerificationCode.findOne({
      where: {
        user_id,
        code,
        is_used: false,
      },
      order: [['created_at', 'DESC']], // Get the latest code
    });
    
    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'کد تایید نامعتبر است'
      });
    }
    
    // Check if code is expired
    if (!verificationCode.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'کد تایید منقضی شده است'
      });
    }
    
    // Mark code as used
    await verificationCode.update({ is_used: true });
    
    // Find and update user
    const user = await User.findByPk(user_id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'کاربر یافت نشد'
      });
    }
    
    // Mark user as verified
    if (!user.is_verified) {
      await user.update({ is_verified: true });
    }
    
    // Get shop data
    const shop = await Shop.findByPk(user.shop_id);
    
    // Generate token
    const token = generateToken(user);
    
    return res.status(200).json({
      status: 'success',
      message: 'تایید موفقیت آمیز',
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        shop_id: user.shop_id,
        shop: shop ? {
          id: shop.id,
          name: shop.name,
          address: shop.address,
          created_at: shop.created_at
        } : null
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در تایید کد'
    });
  }
};

/**
 * Resend verification code
 * @route POST /api/auth/resend-code
 */
const resendCode = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه کاربر الزامی است'
      });
    }
    
    // Find user
    const user = await User.findByPk(user_id);
    
    if (!user || !user.mobile) {
      return res.status(404).json({
        status: 'error',
        message: 'کاربر یافت نشد یا شماره موبایل ندارد'
      });
    }
    
    // Create verification code
    const code = VerificationCode.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code expires in 10 minutes
    
    await VerificationCode.create({
      user_id: user.id,
      code,
      expires_at: expiresAt,
      type: 'mobile',
    });
    
    // Send SMS with code
    await sendSMS(user.mobile, `کد تایید آژیرو: ${code}`);
    
    return res.status(200).json({
      status: 'success',
      message: 'کد تایید جدید به شماره موبایل شما ارسال شد',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در ارسال مجدد کد تایید'
    });
  }
};

/**
 * Get the currently authenticated user
 * @route GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the authenticateJWT middleware
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'کاربر احراز هویت نشده است'
      });
    }
    
    // Get the user with shop data
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Shop,
          as: 'shop'
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'کاربر یافت نشد'
      });
    }
    
    // Return user data without sensitive information
    return res.status(200).json({
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      shop_id: user.shop_id,
      shop: user.shop ? {
        id: user.shop.id,
        name: user.shop.name,
        address: user.shop.address,
        created_at: user.shop.created_at
      } : null,
      is_verified: user.is_verified,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت اطلاعات کاربر'
    });
  }
};

module.exports = {
  signup,
  signin,
  verify,
  resendCode,
  getCurrentUser
}; 