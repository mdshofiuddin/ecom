const { validationResult } = require('express-validator');
const {
  registerValidationRules,
  loginValidationRules,
  checkoutValidationRules,
  productValidationRules
} = require('../config/validationRules');

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

module.exports = {
  registerValidationRules,
  loginValidationRules,
  checkoutValidationRules,
  productValidationRules,
  handleValidationErrors
};
