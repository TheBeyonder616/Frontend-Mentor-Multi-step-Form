import { cList, select } from "../script.js";
export class ValidationStep {
  _Error = `[data-display="error-message"]`;
  _FormContainer = `[data-display="form-container"]`;
  _INPUT = `[data-input]`;
  _StepPlan = `[data-display="plan"]`;
  _StepAdds = `[data-display="adds-on"]`;
  _ActionPlan = `[data-action="plan"]`;
  _InputPlan = `[data-input="plan"]`;
  _Validation = `[data-display="validation"]`;
  _PlanALL = select.elAll(document, this._InputPlan);
  _Name_Input = ["text", "email", "tel"];
  _IName = `[data-input="userName"]`;
  _IDName = `[data-input="userName-desktop"]`;
  _IEmail = `[data-input="userEmail"]`;
  _IDEmail = `[data-input="userEmail-desktop"]`;
  _ITel = `[data-input="userTel"]`;
  _IDTel = `[data-input="userTel-desktop"]`;

  //!====================================[Validation-Methods]

  /**
   * ?Validates the user's name against a regex pattern and length requirement.
   * @param {string} name - The name to validate.
   * @return {boolean} True if the name is valid, false otherwise.
   */
  #testName(name) {
    const nameRegex = /^[A-Za-zÀ-ÿ'-]+(?: [A-Za-zÀ-ÿ'-]+)*$/;
    const minLength = name.length > 4;
    const isValid = nameRegex.test(name) && minLength;
    return isValid;
  }

  /**
   * ?Validates an email address against a regex pattern.
   * @param {string} email - The email to validate.
   * @return {boolean} True if the email is valid, false otherwise.
   */
  #testEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * ?Validates a telephone number against a regex pattern and length requirement.
   * @param {string} tel - The telephone number to validate.
   * @return {boolean} True if the telephone number is valid, false otherwise.
   */
  #testTel(tel) {
    const phoneRegex =
      /^(\+?\d{1,3})?[-.\s]?(\(?\d{1,4}?\)?)[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})$/;
    const minLength = tel.length > 8;
    return phoneRegex.test(tel) && minLength;
  }

  /**
   * ?Validates an input based on its type.
   * @param {Event} e - The event object from the input event.
   * @return {boolean} True if the input is valid, false otherwise.
   */
  #validation(e) {
    const [text, email, tel] = this._Name_Input;
    const type = cList.attribute(e.target, "type");
    const value = e.target.value;
    let validate = false;

    switch (type) {
      case text:
        validate = this.#testName(value);
        break;
      case email:
        validate = this.#testEmail(value);
        break;
      case tel:
        validate = this.#testTel(value);
        break;
      default:
        break;
    }
    return validate;
  }

  /**
   * ?Picks an error message based on the input type.
   * @param {string} type - The type of the input.
   * @return {string} The corresponding error message.
   */
  #messagePick(type) {
    const [text, email, tel] = this._Name_Input;
    let error;
    switch (type) {
      case text:
        error = `Invalid input. Use letters (min. 5 characters)`;
        break;
      case email:
        error = `Invalid email address`;
        break;
      case tel:
        error = `Invalid input. Use numbers (min. 8 digits)`;
        break;
      default:
        error = `This filed is required`;
        break;
    }
    return error;
  }

  /**
   * ?Displays an error message for the given input element.
   * @param {Event} e - The event object from the input event.
   * @param {HTMLElement} element - The element where the error message will be displayed.
   * @return {string} The error message displayed.
   */
  #errorMessage(e, element) {
    const [text, email, tel] = this._Name_Input;
    const type = cList.attribute(e.target, "type");
    const notAllowed = type === "radio" || type === "checkbox";

    if (notAllowed) return;
    const value = e.target.value;
    const valueLength = value.length;
    let message = "";

    switch (type) {
      case text:
        // prettier-ignore
        message = valueLength < 1 
          ? this.#messagePick(false) 
          : this.#testName(value) ? "" : this.#messagePick(type)
        break;
      case email:
        // prettier-ignore
        message = valueLength < 1 
          ? this.#messagePick(false) 
          : this.#testEmail(value) ? "" : this.#messagePick(type);
        break;
      case tel:
        // prettier-ignore
        message = valueLength < 1
            ? this.#messagePick(false)
            : this.#testTel(value) ? "" : this.#messagePick(type);
        break;
      default:
        break;
    }

    element.textContent = message;
    return message;
  }

  /**
   * ?Toggles the visibility of the error message based on validity.
   * @param {boolean} isValid - Indicates if the input is valid.
   * @param {HTMLElement} parent - The parent element to toggle the error class.
   */
  #toggleErrorMessage(isValid, parent) {
    isValid
      ? cList.rem(parent, "is--invalid")
      : cList.add(parent, "is--invalid");
  }

  /**
   * ?Validates all input fields in the form.
   * @param {boolean} displayError - Whether to display error messages.
   * @return {boolean} True if all inputs are valid, false otherwise.
   */
  _validateAllInputs(displayError = false) {
    const setError = (el) => {
      const parent = el.parentNode;
      const errorElement = select.el(parent, this._Error);
      errorElement.textContent = this.#messagePick(false);
      if (displayError) cList.add(parent, "is--invalid");
      return false;
    };

    const testValue = (input, func) => {
      if (input.value.length === 0) {
        setError(input);
        return false;
      }
      return func(input.value);
    };

    const nameInput = select.el(document, this._IName);
    const nameInputD = select.el(document, this._IDName);
    const emailInput = select.el(document, this._IEmail);
    const emailInputD = select.el(document, this._IDEmail);
    const telInput = select.el(document, this._ITel);
    const telInputD = select.el(document, this._IDTel);

    testValue(nameInputD, this.#testName);
    testValue(emailInputD, this.#testEmail);
    testValue(telInputD, this.#testEmail);

    const nameValid = testValue(nameInput, this.#testName);
    const emailValid = testValue(emailInput, this.#testEmail);
    const telValid = testValue(telInput, this.#testTel);

    return nameValid && emailValid && telValid;
  }

  /**
   * ?Validates all input checkboxes or radio buttons based on the context.
   * @param {boolean} addsOn - Indicates if the addsOn section should be validated.
   * @return {boolean} True if all required inputs are checked, false otherwise.
   */
  _validateAllInputCheck(addsOn = false, displayError = false) {
    const isPlan = () => {
      const parentAll = select.elAll(document, this._StepPlan);
      const [parent] = parentAll;

      const plan = select.elAll(parent, this._INPUT);
      const radio = [...plan].filter((input) => input.type === "radio");
      const isChecked = this.#isChecked(radio);

      parentAll.forEach((parent) => {
        const validation = select.el(parent, this._Validation);
        if (!isChecked && displayError) cList.add(validation, "is--invalid");
      });

      return isChecked;
    };

    const isAddsOn = () => {
      const parentAll = select.elAll(document, this._StepAdds);
      const [parent] = parentAll;
      const plan = select.elAll(parent, this._INPUT);
      const isChecked = this.#isChecked(plan);

      parentAll.forEach((parent) => {
        const validation = select.el(parent, this._Validation);
        if (!isChecked && displayError) cList.add(validation, "is--invalid");
      });

      return isChecked;
    };

    return addsOn ? isAddsOn() : isPlan();
  }

  /**
   * ?Handles displaying error messages when input validation occurs.
   * @param {Event} e - The event object from the input event.
   */
  handleDisplayError(e) {
    const parent = e.target.parentNode;
    const errorElement = select.el(parent, this._Error);

    const isValid = this.#validation(e);
    this.#errorMessage(e, errorElement);
    this.#toggleErrorMessage(isValid, parent);
  }

  //?===========================================[Check Validation]

  /**
   * ?Validates the state of radio and checkbox inputs.
   * @param {Event} e - The event object from the input event.
   */
  #isValidRadio(e) {
    const type = cList.attribute(e.target, "type");
    const target = type === "radio" || "checkbox";
    if (!target) return;
    const parent = select.closest(e.target, this._Validation);
    if (!parent) return;
    if (e.target.checked) cList.rem(parent, "is--invalid");
  }

  /**
   * ?Checks if at least one checkbox or radio button is checked.
   * @param {HTMLElement[]} ell - The collection of checkbox or radio button elements.
   * @return {boolean} True if any input is checked, false otherwise.
   */
  #isChecked(ell) {
    return [...ell].some((check) => check.checked);
  }

  /**
   * ?Renders an error message if no checkboxes are selected.
   * @param {Event} e - The event object from the input event.
   */
  #renderCheckErrorMessage(e) {
    const parent = select.closest(e.target, this._FormContainer);
    const addsOn = select.el(parent, this._StepAdds);

    const validation = select.el(addsOn, this._Validation);
    const checkbox = select.elAll(addsOn, this._INPUT);
    const checked = this.#isChecked(checkbox);
    if (!checked) cList.add(validation, "is--invalid");
  }

  /**
   * ?Handles validation for checked inputs (radio/checkbox).
   * @param {Event} e - The event object from the input event.
   */
  handleCheckedErrorValidation(e) {
    this.#isValidRadio(e);
  }

  /**
   * ?Checks if any of the nodes are checked.
   * @param {HTMLElement[]} nodes - The collection of checkbox or radio button elements.
   * @return {boolean} True if any node is checked, false otherwise.
   */
  #elementIsChecked(nodes) {
    return [...nodes].some((node) => node.checked);
  }

  /**
   * ?Displays an error message for the plan input validation.
   * @param {Event} e - The event object from the input event.
   */
  #showPlanError(e) {
    const parent = select.closest(e.target, this._FormContainer);
    if (!parent) return;
    const planForm = select.el(parent, this._StepPlan);
    const validation = select.el(planForm, this._Validation);
    const checked = this.#elementIsChecked(this._PlanALL);
    checked
      ? cList.rem(validation, "is--invalid")
      : cList.add(validation, "is--invalid");
  }

  /**
   * ?Resets all form inputs to their initial state.
   */
  _reset() {
    const inputs = select.elAll(document, this._INPUT);
    const validation = select.elAll(document, this._Validation);

    [...inputs]
      .filter((input) => {
        // prettier-ignore
        return (input.type === "text" || input.type === "email" || input.type === "tel");
      })
      .forEach((input) => (input.value = ""));

    [...inputs]
      .filter((input) => {
        // prettier-ignore
        return (input.type === "radio" ||  input.type === "checkbox");
      })
      .forEach((input) => (input.checked = false));
  }

  /**
   * ?Initializes error handling for form validation.
   * @param {Event} e - The event object from the input event.
   */
  initError(e) {
    this.#showPlanError(e);
    this.#renderCheckErrorMessage(e);
  }
}

export const validationStep = new ValidationStep();
