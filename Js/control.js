import { script, cList, select } from "./script.js";
import { validationStep } from "./Modules/first-step.js";
import { navigationStep } from "./Modules/second_step.js";
import { resultDisplay } from "./Modules/third_step.js";

class Controller {
  #time = 150;
  #timeInput = 250;
  //? Elements
  _ACTION = `[data-action]`;
  _INPUT = `[data-input]`;

  /**
   * ?Initializes the Controller and sets up debounced event handlers.
   */
  //prettier-ignore
  constructor() {
    this.handleClick = script.debounce(this.handleClick.bind(this), this.#time);
    this.handleInput = script.debounce(this.handleInput.bind(this), this.#timeInput);
    this.handleKeyDown = script.debounce(this.handleKeyDown.bind(this), this.#time);
  }
  //!========================================== {Events}
  // ?------------------------[click]

  /**
   * ?Handles page confirmation actions based on the clicked element.
   * @param {Event} e - The click event.
   */
  handlePageConfirmation(e) {
    const type = cList.attribute(e.target, "data-action");
    switch (type) {
      case "go-back":
        navigationStep.initBack();
        break;
      case "next-step":
        navigationStep.initNext();
        break;
      case "change":
        navigationStep.navigateToPlan();
        break;
      default:
        break;
    }
    navigationStep.initLogic(e);
  }

  /**
   * ?General click handler that processes actions.
   * @param {Event} e - The click event.
   */
  handleClick(e) {
    const actionElement = select.closest(e.target, this._ACTION);
    if (!actionElement) return;
    this.handlePageConfirmation(e);
  }
  // ?============================================================[Input]
  /**
   * ?Helper method to get the target input element and its name.
   * @param {Event} e - The input event.
   * @returns {[HTMLElement, string]} - An array containing the target element and its name.
   */
  #getTarget(e) {
    const label = cList.attribute(e.target, "for");
    const input = select.el(e.target, `[data-input]`);
    const target = label ? input : e.target;
    const inputElement = select.attribute(target, "name");
    return [target, inputElement];
  }

  /**
   *? Updates relevant states based on input changes.
   * @param {Event} e - The input event.
   */
  handleUpdate(e) {
    const [target] = this.#getTarget(e);
    if (!target) return;

    const name = cList.attribute(target, "name");
    switch (name) {
      case "profile-desktop":
      case "service-desktop":
      case "storage-desktop":
      case "service":
      case "storage":
      case "profile":
        resultDisplay.handleElementIsChecked(e, this.#getTarget(e));
        break;
      case "plan":
      case "plan-desktop":
        resultDisplay.handleElementIsChecked(e, this.#getTarget(e));
        break;
      default:
        break;
    }
  }

  /**
   * ?Handles input events, including validation and updating displays.
   * @param {Event} e - The input event.
   */
  handleInput(e) {
    const inputElement = select.closest(e.target, this._INPUT);
    if (!inputElement) return;
    script.handleSyncInput(e);
    validationStep.handleDisplayError(e);
    validationStep.handleCheckedErrorValidation(e);
    resultDisplay.handleYearlyDisplay(e);
    this.handleUpdate(e);
  }
  // ?======================================================[Keys]

  /**
   * ?Handles input keydown events for specific actions.
   * @param {Event} e - The keydown event.
   */
  #inputKeyDown(e) {
    const key = e.key === "Enter";
    const inputElement = select.closest(e.target, this._INPUT);

    if (!inputElement) return;
    const input = cList.attribute(inputElement, "data-input");

    const condition = key && input;
    if (!condition) return;

    switch (condition) {
      case "service":
      case "storage":
      case "profile":
        script.handleCheck(e, true, true);
        this.handleUpdate(e);
        break;
      default:
        break;
    }
  }

  /**
   * ?Handles keydown events for action elements.
   * @param {Event} e - The keydown event.
   */
  #actionKeyDown(e) {
    const key = e.key === "Enter";
    const actionElement = select.closest(e.target, this._ACTION);

    if (!actionElement) return;
    const action = cList.attribute(actionElement, "data-action");

    const condition = key && action;
    if (!condition) return;

    switch (condition) {
      case "controller":
        script.handleCheck(e);
        navigationStep.handleKeydownControl(e);
        break;
      case "plan":
        script.handleCheck(e);
        this.handleUpdate(e);
        break;
      case "plan-controller":
        script.handleCheck(e, true);
        resultDisplay.handleYearlyDisplay(e);
        break;
      case "change":
        navigationStep.navigateToPlan(e);
        break;
      default:
        break;
    }
  }

  /**
   * ?General keydown handler that delegates to specific handlers.
   * @param {Event} e - The keydown event.
   */
  handleKeyDown(e) {
    this.#actionKeyDown(e);
    this.#inputKeyDown(e);
  }
  //!==================================[Functions]
  /**
   * ?Initializes functions for the controller.
   */
  initFunction() {
    navigationStep.initSlider();
    navigationStep.initPage();
  }
}

const controller = new Controller();

/**
 * ?Initializes the application once the DOM is fully loaded.
 */
const initApp = () => {
  const main = select.id("main");
  controller.initFunction();
  main.addEventListener("input", controller.handleInput);
  main.addEventListener("click", controller.handleClick);
  main.addEventListener("keydown", controller.handleKeyDown);
};

document.addEventListener("DOMContentLoaded", initApp);
