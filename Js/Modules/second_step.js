import { ValidationStep } from "./first-step.js";
import { cList, select } from "../script.js";

export class NavigationStep extends ValidationStep {
  #CurrentMobile = 0;
  #CurrentDesktop = 0;
  //?[Array]
  _PAGES_NUM = [0, 1, 2, 3, 4];
  _PAGES = ["details", "plan", "adds-on", "finish-up", "thanks"];
  //!============================================[Data attribute]
  _Desktop = `[data-display="desktop"]`;
  _Mobile = `[data-display="mobile"]`;
  _DesktopS = `[data-display="slider-desktop"]`;
  _MobileS = `[data-display="slider-mobile"]`;
  _Slider = `[data-slider]`;
  _BtnBack = select.elAll(document, `[data-action="go-back"]`);
  _BtnNext = select.elAll(document, `[data-action="next-step"]`);
  _TabIndex = `[data-tab]`;
  _ActionChange = `[data-action="change"]`;

  constructor() {
    super();
    this.unlock = false;
    this.currentPageNum;
  }
  //!==================================================================[Getters for elements]

  get _SliderDesktop_() {
    const parent = select.el(document, this._DesktopS);
    return select.elAll(parent, this._Slider);
  }

  get _SliderMobile_() {
    const parent = select.el(document, this._MobileS);
    return select.elAll(parent, this._Slider);
  }

  get _ControllerDesktop_() {
    const parent = select.el(document, this._Desktop);
    if (!parent) return "";
    const controller = select.elAll(parent, `[data-controller]`);
    return controller;
  }

  get _ControllerMobile_() {
    const parent = select.el(document, this._Mobile);
    if (!parent) return "";
    const controller = select.elAll(parent, `[data-controller]`);
    return controller;
  }

  get _Change_() {
    const change = select.elAll(document, this._ActionChange);
    return change;
  }

  //!======================================================{Methods}

  /**
   * ?Updates the slide positions based on the current index.
   * @param {HTMLElement[]} slider - Array of slide elements.
   * @param {number} currentIndex - The current index of the slide.
   */
  #handleUpdateSlide(slider, currentIndex) {
    slider.forEach((slide, index) => {
      slide.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
    });
  }

  /**
   * ?Updates the active dot indicators based on the current index.
   * @param {HTMLElement[]} dots - Array of dot elements.
   * @param {number} currentIndex - The current index of the slide.
   */
  #handleUpdateDot(dots, currentIndex) {
    dots.forEach((dot, index) => {
      index === currentIndex
        ? cList.add(dot, "active")
        : cList.rem(dot, "active");
    });
  }

  /**
   * ?Synchronizes the current slide index based on navigation direction.
   * @param {boolean} prev - Indicates if navigating to the previous slide.
   * @param {boolean} next - Indicates if navigating to the next slide.
   * @param {boolean} goLeft - Indicates if navigating left.
   * @param {boolean} goRight - Indicates if navigating right.
   * @param {HTMLElement[]} slider - Array of slide elements.
   * @param {boolean} desktop - Indicates if the view is desktop.
   */
  #sliderSync(prev, next, goLeft, goRight, slider, desktop = false) {
    const currentIndex = desktop ? this.#CurrentDesktop : this.#CurrentMobile;
    switch (true) {
      case desktop && prev:
        this.#CurrentDesktop = goLeft ? currentIndex - 1 : slider.length - 1;
        break;
      case desktop && next:
        this.#CurrentDesktop = goRight ? currentIndex + 1 : 0;
        break;
      case !desktop && prev:
        this.#CurrentMobile = goLeft ? currentIndex - 1 : slider.length - 1;
        break;
      case !desktop && next:
        this.#CurrentMobile = goRight ? currentIndex + 1 : 0;
        break;
      default:
        break;
    }
    //  prettier-ignore
    this.#handleUpdateSlide(slider, desktop ? this.#CurrentDesktop : this.#CurrentMobile);
  }

  /**
   * ?Changes the slide based on the direction.
   * @param {HTMLElement[]} slider - Array of slide elements.
   * @param {string} direction - The direction to change the slide ("prev" or "next").
   * @param {number} currentIndex - The current index of the slide.
   * @param {boolean} desktop - Indicates if the view is desktop.
   */
  #changeSlide(slider, direction, currentIndex, desktop = false) {
    const prev = direction === "prev";
    const next = direction === "next";
    const goLeft = currentIndex > 0;
    const goRight = currentIndex < slider.length - 1;
    this.#sliderSync(prev, next, goLeft, goRight, slider, desktop);
  }

  /**
   * ?Handles the navigation direction for slides.
   * @param {boolean} next - Indicates if navigating to the next slide.
   */
  #direction(next) {
    // prettier-ignore
    if (next) {
      this.#changeSlide(this._SliderDesktop_, "next", this.#CurrentDesktop, true);
      this.#changeSlide(this._SliderMobile_, "next", this.#CurrentMobile);
    } else {
      this.#changeSlide(this._SliderDesktop_,"prev",this.#CurrentDesktop,true);
      this.#changeSlide(this._SliderMobile_, "prev", this.#CurrentMobile);
    }

    this.#handleUpdateDot(this._ControllerDesktop_, this.#CurrentDesktop);
    this.#handleUpdateDot(this._ControllerMobile_, this.#CurrentMobile);
  }

  /**
   * ?Initializes the sliders by setting their initial positions.
   */
  initSlider() {
    this.#handleUpdateSlide(this._SliderDesktop_, this.#CurrentDesktop);
    this.#handleUpdateSlide(this._SliderMobile_, this.#CurrentMobile);
  }

  //!============================================={Button & Page logic}
  /**
   * ?Updates the index for the current slide and UI elements.
   */
  #updateIndex() {
    this.#handleUpdateSlide(this._SliderDesktop_, this.#CurrentDesktop);
    this.#handleUpdateSlide(this._SliderMobile_, this.#CurrentMobile);
    this.#handleUpdateDot(this._ControllerDesktop_, this.#CurrentDesktop);
    this.#handleUpdateDot(this._ControllerMobile_, this.#CurrentMobile);
  }

  /**
   * ?Gets the current page elements based on the index.
   * @param {number} index - The index of the page.
   * @param {boolean} node - Whether to return nodes or current page.
   * @return {HTMLElement[]} Array of current page elements or parent nodes.
   */
  #getCurrentPage(index, node = false) {
    const parents = select.elAll(document, this._Slider);
    // prettier-ignore
    const currentPage = select.elAll(document,`[data-display="${this._PAGES[index]}"]`);
    return node ? parents : currentPage;
  }

  /**
   * ?Resets the tabindex of all tab elements.
   */
  #resetIndexValue() {
    const tab = select.elAll(document, this._TabIndex);
    tab.forEach((tab) => {
      const type = cList.attribute(tab, "type");
      type
        ? cList.setAttribute(tab, "tabindex", "-1")
        : cList.remAttribute(tab, "tabindex");
    });
  }

  /**
   * ?Sets the tabindex of the element based on its state.
   * @param {HTMLElement} tab - The tab element to update.
   * @param {string} tabValue - The desired tabindex value.
   * @param {boolean} input - Indicates if the element is an input.
   * @param {boolean} addTab - Indicates if tabindex should be added.
   */

  #tabIndexValue(tab, tabValue, input = false, addTab = false) {
    switch (tabValue) {
      case "-1":
        if (input)
          addTab
            ? cList.remAttribute(tab, "tabindex")
            : cList.setAttribute(tab, "tabindex", "-1");
        break;
      case "0":
        if (!input)
          addTab
            ? cList.setAttribute(tab, "tabindex", "0")
            : cList.remAttribute(tab, "tabindex");
        break;
      default:
        console.error("Invalid tabValue");
        break;
    }
  }
  /**
   * ?Handles tabindex logic for accessibility.
   * @param {HTMLElement} page - The current page element.
   */
  #handleTabIndex(page) {
    const tabAcc = select.elAll(page, this._TabIndex);
    tabAcc.forEach((tab) => {
      const tabValue = cList.attribute(tab, "data-tab");
      const type = cList.attribute(tab, "type");
      type
        ? this.#tabIndexValue(tab, tabValue, true, true)
        : this.#tabIndexValue(tab, tabValue, false, true);
    });
  }

  /**
   * ?Displays the current page and handles tabindex for accessibility.
   * @param {number} page - The index of the current page.
   */
  #pageDisplay(page) {
    const currentPage = this.#getCurrentPage(page);
    if (page === 4) return;
    currentPage.forEach((page) => this.#handleTabIndex(page));
  }

  /**
   * ?Toggles the visibility and tabindex of a button.
   * @param {HTMLElement} btn - The button element.
   * @param {boolean} remove - Indicates if the button should be hidden.
   */
  #toggleDisplay(btn, remove = false) {
    if (remove) {
      cList.rem(btn, "show");
      cList.setAttribute(btn, "tabindex", "-1");
    } else {
      cList.add(btn, "show");
      cList.remAttribute(btn, "tabindex");
    }
  }

  /**
   * ?Handles button logic based on the current page.
   * @param {number} time - Delay time for resetting the page.
   */
  #btnLogic() {
    const currentPage = this.#CurrentDesktop || this.#CurrentMobile;
    const [page0, page1, page2, page3, page4] = this._PAGES_NUM;

    switch (currentPage) {
      case page0:
        this.unlock = this._validateAllInputs();
        this._BtnBack.forEach((btn) => this.#toggleDisplay(btn, true));
        this.#resetIndexValue();
        this.#pageDisplay(page0);
        break;
      case page1:
        this.unlock = this._validateAllInputCheck(false);
        this._BtnBack.forEach((btn) => this.#toggleDisplay(btn, false));
        this.#resetIndexValue();
        this.#pageDisplay(page1);
        break;
      case page2:
        this.unlock = this._validateAllInputCheck(true);
        this.#resetIndexValue();
        this.#pageDisplay(page2);
        break;
      case page3:
        this.#resetIndexValue();
        this.#pageDisplay(page3);
        break;
      case page4:
        this.unlock = false;
        this._BtnBack.forEach((btn) => this.#toggleDisplay(btn, true));
        this._BtnNext.forEach((btn) => this.#toggleDisplay(btn, true));
        break;
      default:
        break;
    }
  }

  //!=================[Radio controller]
  /**
   * ?Gets the index from the clicked radio input.
   * @param {Event} e - The event object.
   * @return {number} The index of the clicked radio input.
   */
  #getIndex(e) {
    const input = this.#isLabel(e)
      ? this.#getNameFromLabel(e, true)
      : e.target.dataset.input;

    if (!input) return;
    const inputDetails = input.split(" ");

    const [, index] = inputDetails;
    if (!index) return "";
    return +index;
  }

  /**
   * ?Retrieves the name attribute from the label or control element.
   * @param {Event} e - The event object.
   * @param {boolean} element - If true, return raw index.
   * @return {string} The name or raw index.
   */
  #getNameFromLabel(e, element = false) {
    const control = select.el(e.target, `[data-controller]`);
    if (!control) return;
    const name = cList.attribute(control, "name");
    const rawIndex = cList.attribute(control, "data-input");
    return element ? rawIndex : name;
  }

  /**
   * ?Checks if the event target is a label.
   * @param {Event} e - The event object.
   * @return {boolean} True if the target is a label.
   */
  #isLabel(e) {
    const isLabel = cList.attribute(e.target, "for");
    return isLabel;
  }

  /**
   * ?Handles radio button logic and updates the corresponding slide.
   * @param {Event} e - The event object.
   * @param {HTMLElement[]} slider - Array of slide elements.
   * @param {number} time - Delay time for transition.
   * @param {boolean} desktop - Indicates if the view is desktop.
   */
  #radioLogic(e, slider, time, desktop = false) {
    const name = this.#isLabel(e)
      ? this.#getNameFromLabel(e)
      : cList.attribute(e.target, "name");
    if (!name.includes("controller")) return;
    // TODO
    const index = this.#getIndex(e);
    desktop ? (this.#CurrentDesktop = index) : (this.#CurrentMobile = index);

    desktop
      ? this.#handleUpdateDot(this._ControllerDesktop_, index)
      : this.#handleUpdateDot(this._ControllerMobile_, index);
    this.#handleUpdateSlide(slider, index);
    this.#btnLogic(time);
  }

  //!============================================================[Init]
  /**
   * ?Initializes the logic for the page transition.
   * @param {Event} e - The event object.
   * @param {number} time - Delay time for transition.
   */
  _initLogic(e, time) {
    this.#btnLogic();
    if (!this.unlock) return;

    const name = this.#isLabel(e)
      ? this.#getNameFromLabel(e)
      : cList.attribute(e.target, "name");

    if (!name) return;
    if (!name.includes("controller")) return;
    this.#radioLogic(e, this._SliderDesktop_, time, true);
    this.#radioLogic(e, this._SliderMobile_, time);
  }

  /**
   * ?Checks the current active page index.
   * @return {number} The current page index.
   */
  _checkCurrentPage() {
    return this.#CurrentDesktop || this.#CurrentMobile;
  }

  /**
   * ?Navigates to the plan page.
   */
  navigateToPlan() {
    this.#CurrentDesktop = 1;
    this.#CurrentMobile = 1;
    this.#updateIndex();
    this.#btnLogic();
  }

  /**
   * ?Initializes the current page state and buttons.
   */
  initPage() {
    this.#btnLogic();
  }

  /**
   * ?Initializes the back navigation logic.
   */
  initBack() {
    this.#btnLogic();
    this.#direction();
  }

  /**
   * ?Initializes the next navigation logic.
   * @param {Event} e - The event object.
   */

  #renderErrorBasedOnCurrentPage(page) {
    const [page0, page1, page2] = this._PAGES_NUM;

    switch (page) {
      case page0:
        this._validateAllInputs(true);
        break;
      case page1:
        this._validateAllInputCheck(false, true);
        break;
      case page2:
        this._validateAllInputCheck(true, true);
        break;
      default:
        break;
    }
  }

  initNext() {
    const currentPage = this.#CurrentDesktop || this.#CurrentMobile;
    this.#renderErrorBasedOnCurrentPage(currentPage);
    this.#btnLogic();

    if (this.unlock !== true) return;
    this.#direction(true);
  }

  _currentPageIs(argument) {
    return (
      this.#CurrentDesktop === argument && this.#CurrentMobile === argument
    );
  }

  /**
   * ?Initializes the logic for the page transition.
   * @param {Event} e - The event object.
   */
  initLogic(e) {
    this._initLogic(e);
  }

  /**
   * ?Handles keydown events for navigation controls.
   * @param {Event} e - The event object.
   */
  handleKeydownControl(e) {
    this._initLogic(e);
  }
}

export const navigationStep = new NavigationStep();
