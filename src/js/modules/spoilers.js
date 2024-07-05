import { Slide } from "./slide.js";

const addingClass = "spoiler-active";
const keyCodes = ["ArrowDown", "ArrowUp", "Home", "End"];
const [down, up, home, end] = keyCodes;
const selectors = {
  button: "[data-spoiler=\"button\"]",
  region: "[data-spoiler=\"region\"]"
}

class Spoilers {
  #accordion;
  /** @type {SpoilerObject} */
  #activeSpoiler;
  #breakpoint;
  #breakpointType;
  /** @type {HTMLButtonElement[]} */
  #buttons = [];
  #firstButton;
  #id = `spoilerID-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;
  #lastButton;
  #matchMedia;
  #onClick = this.#click.bind(this);
  #onKeydown = this.#keydown.bind(this);
  #parent;
  /** @type {boolean} */
  #slided;
  #slideDuration;
  /** @type {Element[]} */
  #spoilers;
  /** @type {SpoilerObject[]} */
  #spoilersArray = [];
  #spoilerSize;
  /** @type {WeakMap<HTMLButtonElement, SpoilerObject>} */
  #spoilersObject = new WeakMap();

  /** @type {SpoilersConstructor} */
  constructor(parent, options = {}) {
    if (parent instanceof Element) {
      this.#parent = parent;
      this.#spoilers = [...this.#parent.children];
    } else if (
      ["string", "undefined"].includes(typeof parent) ||
      parent instanceof NodeList ||
      parent instanceof HTMLCollection
    ) {
      const spoilersParents = ["string", "undefined"].includes(typeof parent) ?
        document.querySelectorAll(parent ?? "[data-spoilers]") : [...parent];
      const spoilersParentsLength = spoilersParents.length;

      if (spoilersParentsLength > 1) {
        const spoilersCollection = (new class Spoilers { });

        spoilersParents.forEach(($spoilerParent, index) => {
          spoilersCollection[index] = new Spoilers($spoilerParent, options);
        });

        return spoilersCollection;
      } else if (spoilersParentsLength === 1) {
        this.#parent = spoilersParents[0];
        this.#spoilers = [...this.#parent.children];
      }
    }

    if (this.#spoilers?.length) {
      const [
        {
          accordion: datasetAccordion,
          breakpoint: datasetBreakpoint,
          breakpointType: datasetBreakpointType,
          slideDuration: datasetSlideDuration
        },
        {
          accordion: optionsAccordion,
          breakpoint: optionsBreakpoint,
          breakpointType: optionsBreakpointType,
          slideDuration: optionsSlideDuration
        }
      ] = this.#checkOptionsValidity(this.#parent.dataset, options);

      this.#accordion = datasetAccordion ?? optionsAccordion ?? true;
      this.#breakpoint = datasetBreakpoint ?? optionsBreakpoint ?? false;

      if (this.#breakpoint) {
        this.#breakpointType = datasetBreakpointType ?? optionsBreakpointType ?? "max";
        this.#matchMedia = matchMedia(`(${this.#breakpointType}-width: ${this.#breakpoint}px)`);
      }

      this.#slideDuration = datasetSlideDuration ?? optionsSlideDuration ?? 300;

      this.#spoilers.forEach(($spoiler, index) => {
        /** @type {HTMLButtonElement} */
        const $button = $spoiler.querySelector(selectors.button);
        /** @type {HTMLDivElement} */
        const $region = $spoiler.querySelector(selectors.region);

        if ($button && $region) {
          const id = `${this.#id}-${index}`;
          const isActive = $spoiler.classList.contains(addingClass);

          let { slideDuration } = $spoiler.dataset;

          this.#buttons.push($button);
          $button.id = `${id}-button`;
          $region.id = `${id}-region`;
          slideDuration = !!slideDuration?.trim() && Number.isInteger(+slideDuration) ?
            +slideDuration : this.#slideDuration;

          /** @type {SpoilerObject} */
          const spoiler = { $button, $region, $spoiler, isActive, slideDuration }

          this.#spoilersObject.set($button, spoiler);
          this.#spoilersArray.push(spoiler);
        }
      });

      this.#spoilerSize = this.#spoilersArray.length;

      if (this.#spoilerSize) {
        this.#firstButton = this.#buttons[0];
        this.#lastButton = this.#buttons.at(-1);

        this.#init();
      }
    }
  }

  /** @type {SpoilerOptionsValidation} */
  #checkOptionsValidity(...options) {
    options = options.map(options => {
      let { accordion, breakpoint, breakpointType, slideDuration } = options;

      accordion = ["undefined", "boolean"].includes(typeof accordion) ? accordion :
        ["true", "false"].includes(accordion) ? eval(accordion) : undefined;
      breakpoint = typeof breakpoint === "undefined" || Number.isInteger(breakpoint) ? breakpoint :
        ["false", false].includes(breakpoint) ? false :
          typeof breakpoint === "string" && !!breakpoint.trim() && Number.isInteger(+breakpoint) ?
            +breakpoint : undefined;
      breakpointType = typeof breakpointType === "undefined" || ["min", "max"].includes(breakpointType) ?
        breakpointType : undefined;
      slideDuration = typeof slideDuration === "undefined" || Number.isInteger(slideDuration) ? slideDuration :
        typeof slideDuration === "string" && !!slideDuration.trim() && Number.isInteger(+slideDuration) ?
          +slideDuration : undefined;

      return { accordion, breakpoint, breakpointType, slideDuration };
    });

    return options;
  }

  #init() {
    if (this.#breakpoint) {
      this.#matchMedia.matches ? this.#activate() : this.#disableButtons();

      this.#matchMedia.addEventListener("change", event => {
        event.matches ? this.#activate() : this.#inactivate();
      });
    } else {
      this.#activate();
    }
  }

  #activate() {
    this.#spoilersArray.forEach(spoiler => {
      const { $button, $region, isActive } = spoiler;

      if ($button.hasAttribute("disabled")) this.#activateButtons($button);

      $button.setAttribute("aria-controls", $region.id);
      $button.ariaExpanded = isActive;
      $region.hidden = !isActive;
      $button.addEventListener("click", this.#onClick);
      $button.addEventListener("keydown", this.#onKeydown);

      if (this.#accordion || this.#spoilerSize < 7) {
        $region.setAttribute("role", "region");
        $region.setAttribute("aria-labeledby", $button.id);
      }

      if (this.#accordion && isActive) {
        if (this.#activeSpoiler) {
          const { $button, $region, $spoiler } = this.#activeSpoiler;

          this.#activeSpoiler.isActive = false;
          $button.ariaExpanded = false;
          $region.hidden = true;
          $spoiler.classList.remove(addingClass);
        }

        this.#activeSpoiler = spoiler;
      }
    });
  }

  #inactivate() {
    if (this.#activeSpoiler) this.#activeSpoiler = null;

    this.#spoilersArray.forEach(spoiler => {
      const { $button, $region } = spoiler;

      this.#disableButtons($button);
      $button.removeAttribute("aria-controls");
      $button.removeAttribute("aria-expanded");
      $region.hidden = false;
      $button.removeEventListener("click", this.#onClick);
      $button.removeEventListener("keydown", this.#onKeydown);

      if (this.#accordion || this.#spoilerSize < 7) {
        $region.removeAttribute("role");
        $region.removeAttribute("aria-labeledby");
      }
    });
  }

  /** @param {HTMLButtonElement} $button */
  #disableButtons($button) {
    if ($button) {
      $button.disabled = true;
    } else {
      this.#spoilersArray.forEach(spoiler => {
        spoiler.$button.disabled = true;
      });
    }
  }

  /** @param {HTMLButtonElement} $button */
  #activateButtons($button) {
    if ($button) {
      $button.disabled = false;
    } else {
      this.#spoilersArray.forEach(spoiler => {
        spoiler.$button.disabled = false;
      });
    }
  }

  /** @param {MouseEvent} event */
  #click(event) {
    const spoiler = this.#spoilersObject.get(event.currentTarget);
    const { $region, isActive, slideDuration } = spoiler;

    if (!$region.classList.contains(Slide.addingClass) && !this.#slided) {
      this.#slided = true;

      isActive ? this.#hide(spoiler) : this.#show(spoiler);

      setTimeout(() => {
        this.#slided = false;
      }, slideDuration);
    }
  }

  /** @param {KeyboardEvent} event */
  #keydown(event) {
    const { code } = event;

    if (keyCodes.includes(code)) {
      event.preventDefault();

      const { currentTarget } = event;

      if (
        (currentTarget === this.#firstButton && code === home) ||
        (currentTarget === this.#lastButton && code === end)
      ) return;

      if ([down, up].includes(code)) {
        const index = this.#buttons.indexOf(currentTarget);

        if (code === down) {
          currentTarget === this.#lastButton ? this.#firstButton.focus() :
            index === this.#spoilerSize - 2 ? this.#lastButton.focus() :
              this.#buttons[index + 1].focus();
        } else {
          currentTarget === this.#firstButton ? this.#lastButton.focus() :
            index === 1 ? this.#firstButton.focus() :
              this.#buttons[index - 1].focus();
        }
      } else {
        code === home ? this.#firstButton.focus() : this.#lastButton.focus();
      }
    }
  }

  /** @param {SpoilerObject} spoiler */
  #show(spoiler) {
    const { $button, $region, $spoiler, slideDuration } = spoiler;

    if (this.#accordion && this.#activeSpoiler) this.#hide(this.#activeSpoiler);

    this.#activeSpoiler = spoiler;
    spoiler.isActive = true;
    $button.ariaExpanded = true;
    $spoiler.classList.add(addingClass);
    Slide.down($region, slideDuration);
  }

  /** @param {SpoilerObject} spoiler */
  #hide(spoiler) {
    const { $button, $region, $spoiler, slideDuration } = spoiler;

    this.#activeSpoiler = null;
    spoiler.isActive = false;
    $button.ariaExpanded = false;
    $spoiler.classList.remove(addingClass);
    Slide.up($region, slideDuration);
  }
}

export { Spoilers };
