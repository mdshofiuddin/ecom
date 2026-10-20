const { body, query, validationResult } = require('express-validator');

// Validation error handler helper
const handleValidationErrors = (viewToRender, pageTitle) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorList = errors.array().map(e => e.msg);
      return res.status(400).render(viewToRender, {
        title: pageTitle || 'Form Error',
        validationErrors: errorList,
        formData: req.body,
        product: req.body, // In case of product edit
        ...res.locals
      });
    }
    next();
  };
};

const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must include at least one number.')
    .matches(/[\W_]/).withMessage('Password must include at least one special character (!@#$%^&*).'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

const checkoutValidationRules = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.')
    .escape(),
  body('customer_email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Valid email required.')
    .normalizeEmail(),
  body('shipping_address')
    .trim()
    .notEmpty().withMessage('Shipping address is required.')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters.')
    .escape(),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required.')
    .isLength({ min: 2, max: 50 }).withMessage('City is invalid.')
    .escape(),
  body('postal_code')
    .trim()
    .notEmpty().withMessage('Postal code is required.')
    .isLength({ min: 3, max: 12 }).withMessage('Invalid postal code.')
    .escape(),
  body('card_number')
    .trim()
    .notEmpty().withMessage('Credit card number is required.')
    .custom(val => {
      const sanitized = val.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(sanitized)) {
        throw new Error('Card number must contain 16 digits.');
      }
      return true;
    }),
  body('card_expiry')
    .trim()
    .notEmpty().withMessage('Expiration date required.')
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/).withMessage('Expiry format must be MM/YY.'),
  body('card_cvv')
    .trim()
    .notEmpty().withMessage('CVV is required.')
    .matches(/^\d{3,4}$/).withMessage('CVV must be 3 or 4 digits.')
];

const productValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ min: 3, max: 120 }).withMessage('Name must be 3-120 characters.')
    .escape(),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Category is invalid.')
    .escape(),
  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0.'),
  body('stock')
    .notEmpty().withMessage('Stock is required.')
    .isInt({ min: 0 }).withMessage('Stock must be an integer >= 0.'),
  body('image_url')
    .trim()
    .notEmpty().withMessage('Image URL is required.')
    .isURL().withMessage('Image must be a valid URL (e.g. https://...).'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters.')
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  checkoutValidationRules,
  productValidationRules,
  handleValidationErrors
};
