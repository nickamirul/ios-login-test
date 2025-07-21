const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    status: 'success',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    status: 'error',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendValidationErrorResponse = (res, errors) => {
  const validationErrors = errors.array().map(error => ({
    field: error.path,
    message: error.msg,
    value: error.value
  }));

  return sendErrorResponse(
    res,
    'Validation failed',
    400,
    validationErrors
  );
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendValidationErrorResponse
}; 