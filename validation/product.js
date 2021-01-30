const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProductInput(data) {
  let errors = {};

  data.prod_name = !isEmpty(data.prod_name) ? data.prod_name : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.quantity = !isEmpty(data.quantity) ? data.quantity : "";
  data.category = !isEmpty(data.category) ? data.category : "";
  data.model = !isEmpty(data.model) ? data.model : "";
  data.brand = !isEmpty(data.brand) ? data.brand : "";
  data.productCode = !isEmpty(data.productCode) ? data.productCode : "";

  
  if (!Validator.isLength(data.prod_name, { min: 10, max: 50 })) {
    errors.prod_name = "Product name must be between 10 and 50 characters";
  }


  if (!Validator.isLength(data.productCode, { min: 10, max: 50 })) {
    errors.prod_name = "Product code must be between 10 and 50 characters";
  }


  if (!Validator.isLength(data.brand, { min: 2, max: 50 })) {
    errors.brand = "Product brand must be between 2 and 50 characters";
  }

  if (!Validator.isLength(data.model, { min: 2, max: 50 })) {
    errors.model = "Product model must be between 2 and 50 characters";
  }



  if (!Validator.isLength(data.category, { min: 2, max: 50 })) {
    errors.category = "Category must be between 2 and 50 characters";
  }

  if (!Validator.isNumeric(data.price)) {
    errors.price = "Price must be a number";
  }



  if (!Validator.isNumeric(data.quantity)) {
    errors.price = "Price must be a number";
  }

  if (Validator.isEmpty(data.prod_name)) {
    errors.prod_name = "Product name field is required";
  }

  if (Validator.isEmpty(data.productCode)) {
    errors.productCode = "Product code field is required";
  }
  if (Validator.isEmpty(data.model)) {
    errors.model = "Product model field is required";
  }

  if (Validator.isEmpty(data.brand)) {
    errors.brand = "Product brand field is required";
  }
  if (Validator.isEmpty(data.category)) {
    errors.category = "Category field is required";
  }

  if (Validator.isEmpty(data.price)) {
    errors.price = "Price field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
