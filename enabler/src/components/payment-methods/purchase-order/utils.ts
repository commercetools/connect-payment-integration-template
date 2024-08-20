import styles from '../../../style/style.module.scss';
import inputFieldStyles from '../../../style/inputField.module.scss';

export const fieldIds = {
  poNumber: 'purchaseOrderForm-poNumber',
  invoiceMemo: 'purchaseOrderForm-invoiceMemo',
};

export const getInput = (field: string) => (document.querySelector(`#${field}`) as HTMLInputElement);

const showErrorIfInvalid = (field: string) => {
  if (!isFieldValid(field)) {
    const input = getInput(field);
    input.parentElement.classList.add(inputFieldStyles.error);
    input.parentElement.querySelector(`#${field} + .${inputFieldStyles.errorField}`).classList.remove(styles.hidden);
  }
}

const hideErrorIfValid = (field: string) => {
  if (isFieldValid(field)) {
    const input = getInput(field);
    input.parentElement.classList.remove(inputFieldStyles.error);
    input.parentElement.querySelector(`#${field} + .${inputFieldStyles.errorField}`).classList.add(styles.hidden);
  }
}

export const validateAllFields = () => {
  let isValid = true;
  Object.values(fieldIds).forEach((field) => {
    if (!isFieldValid(field)) {
      isValid = false;
      showErrorIfInvalid(field);
    }
  });
  return isValid;
}

const handleFieldValidation = (field: string) => {
  const input = getInput(field);
  console.log(input)
  input.addEventListener('input', () => {
    hideErrorIfValid(field);
  });
  input.addEventListener('focusout', () => {
    showErrorIfInvalid(field);
    input.value.length > 0 ? input.parentElement.classList.add(inputFieldStyles.containValue) : input.parentElement.classList.remove(inputFieldStyles.containValue);
  });
}

const isFieldValid = (field: string) => {
  const input = getInput(field);
  switch (field) {
    case 'purchaseOrderForm-poNumber':
      return input.value.replace(/\s/g, '').length > 0;
    case 'purchaseOrderForm-invoiceMemo':
      return true
    default:
      return false;
  }
}

const addPoNumberEventListeners = () => {
  console.log(fieldIds.poNumber)
  handleFieldValidation(fieldIds.poNumber);
}

// const addInvoiceMemoEventListeners = () => {
//   handleFieldValidation(fieldIds.invoiceMemo);
// }

export const addFormFieldsEventListeners = () => {
  addPoNumberEventListeners();
  // addInvoiceMemoEventListeners();
}
