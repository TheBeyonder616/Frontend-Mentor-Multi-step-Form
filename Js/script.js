// !#region start=================================================[Helpers]
const isElement = (el) => el instanceof Element;
const isValid = (el) => isElement(el) || el instanceof Document;

const isNode = (el, sl) => {
  if (!isValid(el)) return false;
  const node = el.querySelectorAll(sl);
  const isEmpty = node.length === 0;
  if (isEmpty) return false;
  return true;
};

const error = (el, sl, node = false) => {
  const message = node
    ? `Element Not Found || Invalid node list: ${el}, For Item ${sl}`
    : `Element Not Found: ${el}, For Item ${sl}`;
  throw new Error(message);
};

const handleId = (sl) => {
  const invalid = typeof sl !== "string" || !sl;
  if (invalid) throw new Error(`ID not provided, expected a string`);
  const element = document.getElementById(sl);
  if (!element) error(sl, "ID");
  return element;
};

/**
 * ? Provides utility functions for managing CSS classes and attributes of DOM elements.
 */
export const cList = {
  add: (el, cl) => (isElement(el) ? el.classList.add(cl) : error(el, cl)),
  rem: (el, cl) => (isElement(el) ? el.classList.remove(cl) : error(el, cl)),
  tog: (el, cl) => (isElement(el) ? el.classList.toggle(cl) : error(el, cl)),
  contains: (el, cl) =>
    isElement(el) ? el.classList.contains(cl) : error(el, cl),
  attribute: (el, at) => (isElement(el) ? el.getAttribute(at) : error(el, at)),
  setAttribute: (el, att, value) =>
    isElement(el) ? el.setAttribute(att, value) : error(el, att),
  remAttribute: (el, att) =>
    isElement(el) ? el.removeAttribute(att) : error(el, att),
};

/**
 * ? Provides utility functions for selecting and manipulating DOM elements.
 * Provides methods to query elements, retrieve attributes, and find ancestors.
 */
export const select = {
  el: (el, sl) => (isValid(el) ? el.querySelector(sl) : error(el, sl)),
  elAll: (el, sl) =>
    isNode(el, sl) ? el.querySelectorAll(sl) : error(el, sl, true),
  closest: (el, sl) => (isValid(el) ? el.closest(sl) : error(el, sl)),
  id: (sl) => handleId(sl),
  attribute: (el, sl) => (isValid(el) ? el.getAttribute(sl) : error(el, sl)),
};

//!#region-end =============================================================[Helpers]

class Script {
  _FormContainer = `[data-display="form-container]`;
  _INPUT = `[data-input]`;
  _StepPlan = `[data-display="plan"]`;
  _ActionPlan = `[data-action="plan"]`;
  _InputPlan = `[data-input="plan"]`;
  _Validation = `[data-display="validation"]`;
  _PlanALL = select.elAll(document, this._InputPlan);
  //!========================[Event]
  //?============================================[Input]
  /**
   * ?Generates mobile and desktop data based on input name and id.
   * @param {string} name - The name of the input element.
   * @param {string} id - The id of the input element.
   * @return {[string, string]} An array containing the desktop name and desktop id.
   */
  #mobileData(name, id) {
    const desk = "-desktop";
    const [, number] = id.split("-");
    const desktop = `${name}${desk}`;

    const desktopId = number ? `${desktop}-${number}` : `${id}${desk}`;
    return [desktop, desktopId];
  }

  /**
   * ?Generates mobile and desktop data based on input name and id for desktop devices.
   * @param {string} name - The name of the input element.
   * @param {string} id - The id of the input element.
   * @return {[string, string]} An array containing the mobile name and mobile id.
   */
  #desktopData(name, id) {
    const [input, , number] = id.split("-");
    const split = name.split("-");
    const [mobile] = split;

    const mobileId = number ? `${input}-${number}` : `${input}`;
    return [mobile, mobileId];
  }

  /**
   * ?Determines if the input is for a mobile or desktop device and retrieves the corresponding data.
   * @param {string} name - The name of the input element.
   * @param {string} id - The id of the input element.
   * @return {[string, string]} An array containing the device-specific name and id.
   */
  #getData(name, id) {
    const isDesktop = name.includes("-");

    const data = isDesktop
      ? this.#desktopData(name, id)
      : this.#mobileData(name, id);
    return data;
  }

  /**
   * ?Syncs the value or checked state of one input element with another based on the input type.
   * @param {string} type - The type of the input element (e.g., text, email, checkbox).
   * @param {HTMLElement} target - The source input element.
   * @param {HTMLElement} element - The target input element to be updated.
   */
  #syncInput(type, target, element) {
    switch (type) {
      case "text":
      case "email":
      case "tel":
        element.value = target.value;
        const isFocused = document.activeElement === target;
        if (isFocused) element.focus();
        break;
      case "radio":
        if (target.checked) element.checked = true;
        break;
      case "checkbox":
        target.checked ? (element.checked = true) : (element.checked = false);
        break;
      default:
        break;
    }
  }

  /**
   * ?Handles the input synchronization when an event is triggered.
   * @param {Event} e - The event object from the input event.
   */
  handleSyncInput(e) {
    const labelAttribute = cList.attribute(e.target, "for");
    const labelChild = select.el(e.target, this._INPUT);

    const name = labelAttribute
      ? cList.attribute(labelChild, "name")
      : cList.attribute(e.target, "name");

    const id = labelAttribute
      ? cList.attribute(labelChild, "id")
      : cList.attribute(e.target, "id");

    const [, deviceId] = this.#getData(name, id);
    const element = select.id(deviceId);
    const type = labelAttribute
      ? cList.attribute(labelChild, "type")
      : cList.attribute(e.target, "type");

    const target = labelAttribute ? labelChild : e.target;
    this.#syncInput(type, target, element);
  }

  // ?=====================================================[Key]
  /**
   * ?Sets the event property.
   * @param {Event} e - The event object to be set.
   */
  set #event_(e) {
    this._event = e;
  }

  /**
   * ?Gets the target input element from the event.
   * @return {HTMLElement} The target input element.
   */
  get _target_() {
    return select.el(this._event.target, this._INPUT);
  }

  /**
   * ?Checks if the target input is valid and sets its checked state to true.
   * @param {Event} e - The event object from the check event.
   * @param {boolean} [input=false] - Indicates if the event is from a direct input or not.
   * @return {boolean} The checked state of the target input.
   */
  #checkIsValid(e, input = false) {
    this.#event_ = e;
    const target = input ? e.target : this._target_;
    return (target.checked = true);
  }

  /**
   * ?Checks if the target input is invalid and sets its checked state to false.
   * @param {Event} e - The event object from the uncheck event.
   * @param {boolean} [input=false] - Indicates if the event is from a direct input or not.
   * @return {boolean} The checked state of the target input.
   */
  #CheckIsInValid(e, input = false) {
    this.#event_ = e;
    const target = input ? e.target : this._target_;
    return (target.checked = false);
  }

  /**
   * ?Toggles the checked state of the target input.
   * @param {Event} e - The event object from the toggle event.
   * @param {boolean} [input=false] - Indicates if the event is from a direct input or not.
   */
  #toggleCheck(e, input = false) {
    this.#event_ = e;
    const target = input ? e.target : this._target_;
    const checked = target.checked === true;
    checked ? this.#CheckIsInValid(e, input) : this.#checkIsValid(e, input);
  }

  /**
   *? Handles the checking and unchecking of an input element based on user interaction.
   * @param {Event} e - The event object from the check event.
   * @param {boolean} [checkBox=false] - Indicates if the event is related to a checkbox.
   * @param {boolean} [input=false] - Indicates if the event is from a direct input or not.
   */
  handleCheck(e, checkBox = false, input = false) {
    checkBox ? this.#toggleCheck(e, input) : this.#checkIsValid(e, input);
  }

  //!=====================[Debounce]
  /**
   * ?Creates a debounced version of a function that delays its execution.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay in milliseconds before the function is executed.
   * @return {Function} The debounced version of the function.
   */
  debounce(func, delay) {
    let timeout;
    return (...argument) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, argument), delay);
    };
  }
}

export const script = new Script();
