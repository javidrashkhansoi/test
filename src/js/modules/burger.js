import { App } from "./app.js";
import { Scrolling } from "./scrolling.js";

const { burger: app, dialogs, document: { body }, headerObservers: { $header }, html: { htmlClassList } } = App;
const selectors = {
  button: "[data-burger=\"button\"]",
  close: "[data-burger=\"close\"]",
  menu: "[data-burger=\"menu\"]",
  open: "[data-burger=\"open\"]",
  wrapper: "[data-burger=\"wrapper\"]",
  pageWrapper: "[data-wrapper]",
};
const { button, close, menu, open, wrapper } = selectors;
/** @type {HTMLButtonElement} */
const $button = document.querySelector(button);
const $menu = document.querySelector(menu);
const $placeholder = document.createElement("div");
const addingClass = "burger-active";
const buttons = !$button &&
  document.querySelector(open) && document.querySelector(close) ?
  {
    /** @type {HTMLButtonElement} */
    $close: document.querySelector(close),
    /** @type {HTMLButtonElement} */
    $open: document.querySelector(open)
  } : null;
const id = `burgerID-${Date.now().toString(36)}`;
const isButtonsSame = !!$button;
const menuLabel = $menu?.ariaLabel || $menu?.querySelector("nav")?.ariaLabel;

class Burger {
  #a11y;
  #breakpoint;
  #inertingElements;
  #matchMedia;
  #onClickOutside = this.#closeOnClickOutside.bind(this);
  #onClose = this.close.bind(this);
  #onEscape = this.#closeOnEscape.bind(this);
  #onOpen = this.open.bind(this);
  #onToggle = this.#toggle.bind(this);

  /** @param {BurgerOptions} options */
  constructor(options = {}) {
    if (($button || buttons) && $menu) {
      this.#breakpoint = options.breakpoint ?? 768;

      if (this.#breakpoint) {
        this.#matchMedia = matchMedia(`(max-width: ${this.#breakpoint}px)`);
      }

      this.#a11y = {
        buttonsLabels: {
          close: options.a11y?.buttonsLabels?.close ?? `Закрыть "${menuLabel || "бургер-меню"}"`,
          open: options.a11y?.buttonsLabels?.open ?? `Открыть "${menuLabel || "бургер-меню"}"`
        },
        inertElementsSelectors: options.a11y?.inertElementsSelectors ?? `${selectors.pageWrapper} > *:not(${selectors.wrapper})`,
        moveMenu: options.a11y?.moveMenu ?? false,
        wrapperSelector: options.a11y?.wrapperSelector ?? wrapper
      }
      this.#inertingElements = document.querySelectorAll(this.#a11y.inertElementsSelectors);

      this.#init();
    }
  }

  #init() {
    $menu.id = id;
    $placeholder.hidden = true;
    app.close = this.#onClose;
    app.matchMedia = this.#matchMedia;

    if (this.#breakpoint) {
      this.#matchMedia.matches ? this.#activate() : this.#hideButtons();

      this.#matchMedia.addEventListener("change", event => {
        const { matches } = event;

        if (matches) {
          this.#activate();
          this.#showButtons();
        } else {
          if (app.isActive) this.close(true);

          this.#inactivate();
          this.#hideButtons();
        }
      });
    } else {
      this.#activate();
    }
  }

  #activate() {
    if (isButtonsSame) {
      $button.ariaLabel = this.#a11y.buttonsLabels.open;
      $button.setAttribute("aria-controls", id);
      $button.ariaExpanded = false;
      $button.addEventListener("click", this.#onToggle);
    } else {
      buttons.$open.ariaLabel = this.#a11y.buttonsLabels.open;
      buttons.$open.setAttribute("aria-controls", id);
      buttons.$open.ariaExpanded = false;
      buttons.$open.addEventListener("click", this.#onOpen);
      buttons.$close.ariaLabel = this.#a11y.buttonsLabels.close;
      buttons.$close.addEventListener("click", this.#onClose);
    }

    if (this.#a11y.moveMenu) {
      $menu.insertAdjacentElement("afterend", $placeholder);

      $header ? $header.insertAdjacentElement("afterend", $menu) :
        body.insertAdjacentElement("afterbegin", $menu);
    }
  }

  #inactivate() {
    if (isButtonsSame) {
      $button.removeAttribute("aria-label");
      $button.removeAttribute("aria-controls");
      $button.removeAttribute("aria-expanded");
      $button.removeEventListener("click", this.#onToggle);
    } else {
      buttons.$open.removeAttribute("aria-label");
      buttons.$open.removeAttribute("aria-controls");
      buttons.$open.removeAttribute("aria-expanded");
      buttons.$open.removeEventListener("click", this.#onOpen);
      buttons.$close.removeAttribute("aria-label");
      buttons.$close.removeEventListener("click", this.#onClose);
    }

    if (this.#a11y.moveMenu) {
      $placeholder.insertAdjacentElement("afterend", $menu);
      $placeholder.remove();
    }
  }

  #hideButtons() {
    if (isButtonsSame) {
      $button.hidden = true;
    } else {
      buttons.$open.hidden = true;
      buttons.$close.hidden = true;
    }
  }

  #showButtons() {
    if (isButtonsSame) {
      $button.hidden = false;
    } else {
      buttons.$open.hidden = false;
      buttons.$close.hidden = false;
    }
  }

  #toggle() {
    app.isActive ? this.close() : this.open();
  }

  /**
   * @description
   * Открывает бургер-меню.
   *
   * @returns {void}
   */
  open() {
    app.isActive = true;

    if (isButtonsSame) {
      $button.ariaLabel = this.#a11y.buttonsLabels.close;
      $button.ariaExpanded = true;
    } else {
      buttons.$open.ariaExpanded = true;
      buttons.$close.focus();
    }

    this.#inertingElements?.forEach(inertElement => {
      inertElement.setAttribute("inert", "");
    });

    document.addEventListener("keydown", this.#onEscape);
    document.addEventListener("click", this.#onClickOutside);
    Scrolling.lock();
    htmlClassList.add(addingClass);
  }

  /**
   * @description
   * Закрывает бургер-меню.
   *
   * @param {boolean} force - Если `true`, бургер-меню закроется принудительно. По умолчанию `false`.
   *
   * @returns {void}
   */
  close(force = false) {
    if (force || !dialogs.activeDialogs) {
      app.isActive = false;

      if (isButtonsSame) {
        $button.ariaLabel = this.#a11y.buttonsLabels.open;
        $button.ariaExpanded = false;
        $button.focus();
      } else {
        buttons.$open.ariaExpanded = false;
        buttons.$open.focus();
      }

      this.#inertingElements?.forEach(inertElement => {
        inertElement.removeAttribute("inert");
      });

      document.removeEventListener("keydown", this.#onEscape);
      document.removeEventListener("click", this.#onClickOutside);

      if (!dialogs.activeDialogs) Scrolling.unlock();

      htmlClassList.remove(addingClass);
    }
  }

  /** @param {KeyboardEvent} event */
  #closeOnEscape(event) {
    if (event.code === "Escape") this.close();
  }

  /** @param {MouseEvent} event */
  #closeOnClickOutside(event) {
    /** @type {{target: Element}} */
    const { target } = event;

    if (isButtonsSame) {
      if (!target.closest(this.#a11y.wrapperSelector) && !target.closest(button) && !target.closest(menu)) this.close();
    } else {
      if (!target.closest(this.#a11y.wrapperSelector) && !target.closest(open) && !target.closest(menu)) this.close();
    }
  }
}

export { Burger };
