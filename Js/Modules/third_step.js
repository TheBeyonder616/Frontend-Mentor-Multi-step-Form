import { NavigationStep } from "./second_step.js";
import { cList, select } from "../script.js";

class ResultDisplay extends NavigationStep {
  //? [Yearly and Monthly price Arrays]
  _YearlyPriceAdd = ["+$10/yr", "+$20/yr", "+20/yr"];
  _YearlyPricePlan = ["$90/yr", "$120/yr", "$150/yr"];
  _MonthlyPriceAdd = ["+$1/mo", "+$2/mo", "+2/mo"];
  _MonthlyPricePlan = ["$9/mo", "$12/mo", "$15/mo"];
  _TOTAL = ["Total (per month)", "Total (per year)"];
  //? Price type selectors
  // prettier-ignore
  _PriceType = ["plan-mobile", "plan-desktop", "adds-on-mobile", "adds-on-desktop",];
  //?--------------------------------[Element]
  //Element selectors
  _ParentELement = `[data-toggle="yearly"]`;
  _Price = "[data-price]";
  _Invoice = `[data-display="invoice-list"]`;
  _LabelAddsOn = `[data-display="label--adds-on"]`;
  _FinishUpHeading = `[data-display="finish-up-heading"]`;
  _FormAddsOn = `[data-display="adds-on"]`;
  _FormPlan = `[data-display="plan"]`;
  _FupPlanPrice = `[data-display]`;
  _ParentTotal = `[data-display="total"]`;
  _DPrice = `[data-display-price]`;
  _IPlanCD = `[data-input="plan-controller-desktop"]`;
  _IPlanCM = `[data-input="planController"]`;

  constructor() {
    super();
    this.total = 0;
  }
  //!==========================================================={Getters for elements}
  get _Yearly_() {
    return select.elAll(document, this._ParentELement);
  }

  get _Price_() {
    return select.elAll(document, this._Price);
  }

  get _InvoiceList_() {
    return select.elAll(document, this._Invoice);
  }

  get _HeadingFinishUp_() {
    return select.elAll(document, this._FinishUpHeading);
  }
  get _AddsOn_() {
    return select.elAll(document, this._FormAddsOn);
  }

  get _Plan_() {
    return select.elAll(document, this._FormPlan);
  }
  //!============================================================={Results}

  /**
   * ?Validates the target element from the event.
   * @param {Event} e - The event object.
   * @returns {[string, HTMLElement]} - Returns an array containing the name of the input and the input element itself.
   */
  #validateTarget(e) {
    const label = select.attribute(e.target, "for");
    const input = select.el(e.target, this._INPUT);
    const name = label
      ? select.attribute(input, "name")
      : select.attribute(e.target, "name");

    const inputElement = label ? input : e.target;
    return [name, inputElement];
  }

  /**
   * ?Toggles the yearly display based on a boolean value.
   * @param {boolean} checked - If true, apply yearly styling; otherwise, remove it.
   */
  #toggleYear(checked = false) {
    this._Yearly_.forEach((plan) => {
      checked
        ? cList.add(plan, "toggle--yearly")
        : cList.rem(plan, "toggle--yearly");
    });
  }

  /**
   * ?Retrieves the price node for a specific price type.
   * @param {string} priceType - The price type to retrieve nodes for.
   * @returns {HTMLElement[]} - An array of price nodes.
   */
  #getPriceNode(priceType) {
    const [pMobile, pDesktop, aMobile, aDesktop] = this._PriceType;
    let node;
    switch (priceType) {
      case pMobile:
        node = select.elAll(document, `[data-price="${pMobile}"]`);
        break;
      case pDesktop:
        node = select.elAll(document, `[data-price="${pDesktop}"]`);
        break;
      case aMobile:
        node = select.elAll(document, `[data-price="${aMobile}"]`);
        break;
      case aDesktop:
        node = select.elAll(document, `[data-price="${aDesktop}"]`);
        break;
      default:
        break;
    }
    return node;
  }

  /**
   * ?Toggles the price display for a given price type based on the selected year type.
   * @param {string} priceType - The price type to toggle.
   * @param {boolean} year - Indicates if the yearly price should be displayed.
   */
  #togglePrice(priceType, year = false) {
    const [pMobile, pDesktop, aMobile, aDesktop] = this._PriceType;
    const priceNodes = this.#getPriceNode(priceType);

    let price;
    switch (priceType) {
      case pMobile:
      case pDesktop:
        price = year ? this._YearlyPricePlan : this._MonthlyPricePlan;
        break;
      case aMobile:
      case aDesktop:
        price = year ? this._YearlyPriceAdd : this._MonthlyPriceAdd;
        break;
      default:
        return;
    }

    if (priceNodes.length !== price.length) throw new Error(price, priceNodes);
    return priceNodes.forEach((priceNode, index) =>
      this.#replaceTextContent(priceNode, price[index])
    );
  }

  /**
   * ?Replaces the text content of a given element.
   * @param {HTMLElement} element - The element whose content will be replaced.
   * @param {string} newContent - The new content to set.
   */
  #replaceTextContent(element, newContent) {
    element.textContent = newContent;
  }

  /**
   * ?Handles the display of prices based on whether yearly is checked.
   * @param {boolean} checked - If true, display yearly prices; otherwise, monthly.
   */
  #handlePriceDisplay(checked) {
    const [pMobile, pDesktop, aMobile, aDesktop] = this._PriceType;
    this.#togglePrice(pMobile, checked);
    this.#togglePrice(pDesktop, checked);
    this.#togglePrice(aMobile, checked);
    this.#togglePrice(aDesktop, checked);
  }

  /**
   * ?Appends markup for add-ons to the invoice list.
   * @param {HTMLElement} el - The element to append the markup to.
   * @param {string} heading - The heading of the add-on.
   * @param {string} price - The price of the add-on.
   * @param {string} id - The identifier for the add-on.
   * @returns {void}
   */
  #handleMarkupAddsOn(el, heading, price, id) {
    const mobileMarkup = () => `
  <li class="invoice__item" data-invoice-id="${id}">
    <h3 class="heading-third">${heading}</h3>
   <span
     class="heading-component heading--plan"
     data-display-price="item"
     data-price-id="${id}" >${price}</span
   >
  </li> `;
    return el.insertAdjacentHTML("afterbegin", mobileMarkup());
  }

  /**
   * ?Updates the text of the plan in the finish up section.
   * @param {HTMLElement} parent - The parent element containing the plan details.
   * @param {string} name - The new name of the plan.
   * @param {string} price - The new price of the plan.
   * @returns {void}
   */
  #handleUpdatePlanText(parent, name, price) {
    const [, cName, , cPrice] = parent.childNodes;
    const nameElement = cName.childNodes[0];
    nameElement.textContent = name;
    cPrice.textContent = price;
  }

  //!=================================================================={Data Management}
  /**
   * ?Determines if the target element is a plan and retrieves its details.
   * @param {HTMLElement} target - The target element to check.
   * @returns {[string, string]} - Returns an array containing the name and price of the plan.
   */
  #isPlan(target) {
    const parent = target.parentNode;
    const priceElement = select.el(parent, this._Price);
    const priceParent = priceElement.parentNode.textContent;

    const name = priceParent.trim().split(" ")[0];
    const price = priceElement.textContent.trim();
    return [name, price];
  }

  /**
   * ?Checks if the element is an add-on and retrieves its details.
   * @param {Event} e - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {[string, string]} - Returns an array containing the name and price of the add-on.
   */
  #isAddsOn(e, target) {
    const label = select.closest(e.target, this._LabelAddsOn);
    const parent = target.parentNode;
    const priceElement = select.el(label, this._Price);
    const nameElement = parent.childNodes[3];

    const nameArr = nameElement.textContent.trim().split(" ");
    const name = `${nameArr[0]} ${nameArr[1]}`;

    const price = priceElement.textContent.trim();
    return [name, price];
  }

  /**
   * ?Retrieves details about the selected plan or add-on.
   * @param {Event} e - The event object.
   * @param {HTMLElement} target - The target element.
   * @param {string} input - The type of input (plan or add-on).
   * @returns {Object} - Returns an object with name and price of the selected item.
   */
  #getDetails(e, target, input) {
    const [data, isPlan] = this.#elementIsChecked(e, target, input);
    const [name, price] = data;

    return isPlan
      ? {
          name: name,
          price: price,
        }
      : {
          name: name,
          price: price,
        };
  }

  /**
   * ?Checks if the element is checked and determines if it's a plan or add-on.
   * @param {Event} e - The event object.
   * @param {HTMLElement} target - The target element.
   * @param {string} input - The input type.
   * @returns {[any, boolean]} - Returns an array containing the data and a boolean indicating if it's a plan.
   */
  #elementIsChecked(e, target, input) {
    const isPlan = input === "plan" || input === "plan-desktop";
    const data = isPlan ? this.#isPlan(target) : this.#isAddsOn(e, target);
    return [data, isPlan];
  }

  /**
   * ?Retrieves the identifier from the target element.
   * @param {HTMLElement} target - The target element.
   * @returns {string} - Returns the identifier.
   */
  #getId(target) {
    return cList.attribute(target, "data-input");
  }

  /**
   * ?Deletes the markup for a given add-on by its ID.
   * @param {string} id - The ID of the add-on to delete.
   * @returns {void}
   */
  #deleteMarkup(id) {
    const element = select.el(document, `[data-invoice-id=${id}]`);
    return element.remove();
  }

  /**
   * ?Checks if the current plan is selected.
   * @returns {boolean} - Returns true if both mobile and desktop plans are checked, false otherwise.
   */
  #checkCurrentPlan() {
    const cMobile = select.el(document, this._IPlanCM);
    // prettier-ignore
    const cDesktop = select.el(document,this._IPlanCD);
    const array = [cDesktop, cMobile];
    // prettier-ignore
    const checked = [...array].every((controller) => controller.checked);
    return checked;
  }

  /**
   * ?Appends state to the finish-up section based on the selected plan or add-on.
   * @param {[boolean, boolean, HTMLElement]} ary - Array containing plan status, checked status, and the target element.
   * @param {Object} obj - Object containing name and price of the selected item.
   * @returns {void}
   */
  #appendStateToFinishUp(ary, obj) {
    const [plan, checked, target] = ary;
    const { name, price } = obj;
    const id = this.#getId(target);

    switch (plan) {
      case true:
        const sub = this.#checkCurrentPlan() ? `(Yearly)` : `(Monthly)`;
        const subP = this.#checkCurrentPlan() ? `yr` : `mo`;
        const filPrice = this.#filterNumber(price, false);

        const aName = `${name} ${sub}`;
        const aPrice = `$${filPrice}/${subP}`;
        // prettier-ignore
        this._HeadingFinishUp_.forEach((heading) =>this.#handleUpdatePlanText(heading, aName, aPrice));
        this.#handleTotalDisplay();
        break;
      case false:
        this._InvoiceList_.forEach((invoice) => {
          checked
            ? this.#handleMarkupAddsOn(invoice, name, price, id)
            : this.#deleteMarkup(id);
        });
        this.#handleTotalDisplay();
        break;
      default:
        console.warn("Unexpected case in saveDataToMapObject");
        break;
    }
  }

  /**
   * ?Checks which subscription inputs are checked in the given parent element.
   * @param {HTMLElement} parent - The parent element containing subscription inputs.
   * @returns {HTMLElement[]} - Returns an array of checked input elements.
   */
  #subScriptionChangeChecked(parent) {
    const control = (input) =>
      input.dataset.input === "plan-controller-desktop" ||
      input.dataset.input === "planController";

    return [...parent]
      .flatMap((addsOn) => [...select.elAll(addsOn, this._INPUT)])
      .filter((input) => input.checked && !control(input));
  }

  /**
   * ?Updates the price of the subscription based on the checked state.
   * @param {HTMLElement} el - The element related to the subscription.
   * @param {boolean} plan - Indicates if it's a plan or add-on.
   * @param {boolean} checked - If true, update the price; otherwise, just for add-ons.
   * @returns {void}
   */
  #updateSubPrice(el, plan, checked) {
    const addsOnF = () => {
      const newPrice = el.parentNode.nextElementSibling;
      const id = this.#getId(el);
      const oldPrice = select.elAll(document, `[data-price-id="${id}"]`);

      oldPrice.forEach((price) => (price.textContent = newPrice.textContent));
    };

    const planF = (checked) => {
      const parent = el.parentNode;
      const newPrice = select.el(parent, this._Price);
      const oldPriceNode = select.elAll(document, this._DPrice);
      const [oldPrice] = [...oldPriceNode];
      const oldParent = oldPrice.parentNode;

      const [, oldNameElement] = oldParent.childNodes;
      const [, , , , , heading] = parent.childNodes;
      const oldName = oldNameElement.childNodes[0];

      const sub = checked ? "(Yearly)" : "(Monthly)";
      const newName = heading.childNodes[0].textContent.trim();
      const name = `${newName} ${sub}`;

      const filteredPrice = [...oldPriceNode].filter((price) => {
        return price.dataset.displayPrice === "plan";
      });

      oldName.textContent = name;
      // prettier-ignore
      filteredPrice.forEach((price) => (price.textContent = newPrice.textContent));
    };

    return plan ? planF(checked) : addsOnF();
  }

  /**
   * ?Updates prices for new subscriptions based on the checked state.
   * @param {HTMLElement[]} array - Array of elements related to the subscription.
   * @param {boolean} plan - Indicates if it's a plan.
   * @param {boolean} checked - If true, update prices; otherwise, just for add-ons.
   * @returns {void}
   */
  #updateNewSubscriptionPrice(array, plan, checked) {
    if (array.length === 0) return;
    array.forEach((el) => this.#updateSubPrice(el, plan, checked));
  }

  /**
   * ?Handles updates for subscriptions when checked.
   * @param {boolean} checked - Indicates if the subscription is checked.
   * @returns {void}
   */
  #handleSubUpdate(checked) {
    const checkedAddsOn = this.#subScriptionChangeChecked(this._AddsOn_);
    const checkedPlan = this.#subScriptionChangeChecked(this._Plan_);
    this.#updateNewSubscriptionPrice(checkedAddsOn, false);
    this.#updateNewSubscriptionPrice(checkedPlan, true, checked);
    this.#handleTotalDisplay(checked);
  }

  /**
   * ?Retrieves total elements for display.
   * @param {HTMLElement} parent - The parent element containing total information.
   * @returns {[HTMLElement, HTMLElement]} - Returns an array containing the name and price elements.
   */
  #getToTalElement(parent) {
    const [, tName, , tPrice] = parent.childNodes;
    return [tName, tPrice];
  }

  /**
   * ?Filters the number from a string or element.
   * @param {string|HTMLElement} string - The string or element to filter the number from.
   * @param {boolean} [element=true] - Indicates if the input is an element (default: true).
   * @returns {number} - The filtered number.
   */
  #filterNumber(string, element = true) {
    const value = element ? string.textContent : string;
    const match = value.match(/[\d]+/);
    return +match[0];
  }

  /**
   * ?Calculates the total price from the given parent element.
   * @param {HTMLElement} parent - The parent element containing price elements.
   * @returns {number} - The total price calculated.
   */
  #calculateTotal(parent) {
    const grandParent = parent.parentNode;
    const priceAll = select.elAll(grandParent, this._DPrice);
    const total = [...priceAll]
      .map((price) => this.#filterNumber(price))
      .reduce((accumulator, price) => accumulator + price, 0);
    return total;
  }

  /**
   * ?Updates and displays the total price in the relevant elements.
   * @returns {void}
   */
  #handleTotalDisplay() {
    const init = (parent) => {
      const total = this.#calculateTotal(parent);

      const subName = this.#checkCurrentPlan() ? `(per year)` : `(per month)`;
      const subPrice = this.#checkCurrentPlan() ? `yr` : `mo`;

      const [nameElement, priceElement] = this.#getToTalElement(parent);
      const name = `Total ${subName}`;
      const sum = `+${total}/${subPrice}`;

      nameElement.textContent = name;
      priceElement.textContent = sum;
    };

    const parentNode = select.elAll(document, this._ParentTotal);
    parentNode.forEach((parent) => init(parent));
  }

  /**
   * ?Handles element check state changes.
   * @param {Event} e - The event object.
   * @param {function} fun - Function to determine the state.
   * @returns {void}
   */
  handleElementIsChecked(e, fun) {
    const [target, input] = fun;
    const isPlan = input === "plan" || input === "plan-desktop";
    const arg = [isPlan, target.checked, target];

    const dataObj = this.#getDetails(e, target, input);
    this.#appendStateToFinishUp(arg, dataObj);
  }

  /**
   * ?Handles the display of yearly or monthly pricing.
   * @param {Event} e - The event object.
   * @returns {void}
   */
  handleYearlyDisplay(e) {
    const [name, input] = this.#validateTarget(e);
    const target =
      name === "planController-desktop" || name === "planController";
    if (!target) return;
    this.#toggleYear(input.checked);
    this.#handlePriceDisplay(input.checked);
    this.#handleSubUpdate(input.checked);
  }
}

export const resultDisplay = new ResultDisplay();
