class Same {
  /** @type {NodeListOf<HTMLDivElement>} */
  #elements;
  #breakpoint;
  #breakpointType;
  #cssProperties = {
    height: "--same-height",
    width: "--same-width"
  };
  #matchMedia;
  /** @type {ResizeObserver} */
  #observer;
  #same;

  /** @param {SameOptions} options */
  constructor(options) {
    this.#breakpoint = options.breakpoint;
    this.#elements = document.querySelectorAll(options.selector);
    this.#same = options.same;

    if (this.#breakpoint) {
      this.#breakpointType = options.breakpointType ?? "min";
      this.#matchMedia = matchMedia(`(${this.#breakpointType}-width: ${this.#breakpoint}px)`);
    }

    if (this.#elements.length && this.#same) {
      this.#init();
    }
  }

  #init() {
    if (this.#breakpoint) {
      if (this.#matchMedia.matches) this.#resizeObserver();

      this.#matchMedia.addEventListener("change", event => {
        const { matches } = event;

        if (matches) {
          this.#resizeObserver();
        } else {
          this.#observer?.disconnect();

          if (this.#same === "height") {
            this.#removeHeightProperty();
          } else if (this.#same === "width") {
            this.#removeWidthProperty();
          } else {
            this.#removeBothProperties();
          }
        }
      });
    } else {
      this.#resizeObserver();
    }
  }

  #resizeObserver() {
    this.#observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (this.#same === "height") {
          this.#removeHeightProperty();

          const maxHeight = Math.max(...[...this.#elements].map($element => {
            return parseFloat(getComputedStyle($element).height);
          }));

          this.#elements.forEach($element => {
            $element.style.setProperty(this.#cssProperties.height, `${maxHeight || 0}px`);
          });
        } else if (this.#same === "width") {
          this.#removeWidthProperty();

          const maxWidth = Math.max(...[...this.#elements].map($element => {
            return parseFloat(getComputedStyle($element).width);
          }));

          this.#elements.forEach($element => {
            $element.style.setProperty(this.#cssProperties.width, `${maxWidth || 0}px`);
          });
        } else {
          this.#removeBothProperties();

          const maxHeight = Math.max(...[...this.#elements].map($element => {
            return parseFloat(getComputedStyle($element).height);
          }));

          const maxWidth = Math.max(...[...this.#elements].map($element => {
            return parseFloat(getComputedStyle($element).width);
          }));

          this.#elements.forEach($element => {
            $element.style.setProperty(this.#cssProperties.height, `${maxHeight || 0}px`);
            $element.style.setProperty(this.#cssProperties.width, `${maxWidth || 0}px`);
          });
        }
      });
    });

    this.#elements.forEach($element => {
      this.#observer.observe($element);
    });
  }

  #removeHeightProperty() {
    this.#elements.forEach($element => {
      $element.style.removeProperty(this.#cssProperties.height);
    });
  }

  #removeWidthProperty() {
    this.#elements.forEach($element => {
      $element.style.removeProperty(this.#cssProperties.width);
    });
  }

  #removeBothProperties() {
    this.#elements.forEach($element => {
      $element.style.removeProperty(this.#cssProperties.height);
      $element.style.removeProperty(this.#cssProperties.width);
    });
  }
}

export { Same };
