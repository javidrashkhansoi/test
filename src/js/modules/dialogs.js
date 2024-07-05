import { App } from "./app.js";
import { Scrolling } from "./scrolling.js";

const { burger, dialogs: app, html: { htmlClassList } } = App;

class Dialogs {
  #selectors = {
    buttons: "[data-dialog-id]",
    closeButton: "[data-dialog=\"close\"]",
    inner: "[data-dialog=\"inner\"]"
  }
  #addingClass = "dialog-active";
  /** @type {NodeListOf<HTMLButtonElement>} */
  #buttons = document.querySelectorAll(this.#selectors.buttons);
  /** @type {DialogsObject} */
  #dialogs = {};
  #dialogsArray;
  #onClickDialog = this.#dialogClickEvent.bind(this);
  #onCloseDialog = this.#dialogCloseEvent.bind(this);

  constructor() {
    this.#buttons?.forEach(button => {
      const { dialogId } = button.dataset;

      if (dialogId) {
        /** @type {HTMLDialogElement} */
        const dialog = document.getElementById(dialogId);

        if (dialog) {
          button.setAttribute("aria-controls", dialogId);
          button.ariaExpanded = false;

          this.#dialogs[dialogId] = {
            $button: button,
            $dialog: dialog,
            isActive: false
          };
        }
      }
    });

    this.#dialogsArray = Object.values(this.#dialogs);

    if (this.#dialogsArray.length) {
      this.#init();
    }
  }

  #init() {
    this.#dialogsArray.forEach(dialog => {
      const { $button, $dialog } = dialog;
      /** @type {HTMLButtonElement} */
      const closeButton = $dialog.querySelector(this.#selectors.closeButton);

      $button.addEventListener("click", () => {
        if (!$button.hasAttribute("data-disabled")) {
          $dialog.showModal();
          $button.ariaExpanded = true;
          $dialog.addEventListener("click", this.#onClickDialog);
          $dialog.addEventListener("close", this.#onCloseDialog);
          dialog.isActive = true;

          if (closeButton) closeButton.focus();

          if (!app.activeDialogs) {
            if (!burger.isActive) Scrolling.lock();
            htmlClassList.add(this.#addingClass);
          }

          app.activeDialogs++;
        }
      });
    });
  }

  /** @param {MouseEvent} event */
  #dialogClickEvent(event) {
    const { target } = event;
    /** @type {HTMLDialogElement} */
    const dialog = target.closest("dialog");

    if (!target.closest(this.#selectors.inner) || target.closest(this.#selectors.closeButton)) dialog.close();
  }

  /** @param {Event} event */
  #dialogCloseEvent(event) {
    const { target } = event;
    const { id } = target;
    const { [id]: dialog } = this.#dialogs;
    const { $button, $dialog } = dialog;

    $button.ariaExpanded = false;
    $button.focus();
    $dialog.removeEventListener("click", this.#onClickDialog);
    $dialog.removeEventListener("close", this.#onCloseDialog);
    dialog.isActive = false;
    app.activeDialogs--;

    if (!app.activeDialogs) {
      if (!burger.isActive) Scrolling.unlock();
      htmlClassList.remove(this.#addingClass);
    }
  }
}

export { Dialogs };
