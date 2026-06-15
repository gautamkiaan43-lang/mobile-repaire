const { errorResponse } = require('../utils/response');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));
      
      let mainMessage = 'Validation error';
      if (details.length > 0) {
        const firstError = details[0];
        if (firstError.field.toLowerCase().includes('email')) {
          mainMessage = 'Invalid email';
        } else {
          mainMessage = firstError.message.replace(/\"/g, ''); // Remove quotes from Joi messages
        }
      }
      
      return errorResponse(res, mainMessage, 400, details);
    }
    
    // Replace body with validated/sanitized value
    req.body = value;
    next();
  };
};

module.exports = {
  validateBody
};
