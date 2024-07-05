class Ranges {
  /** @type {NodeListOf<HTMLInputElement>} */
  ranges = document.querySelectorAll("input[type=\"range\"]:not([data-default], [data-range=\"init\"])");

  constructor() {
    this.init();
  }

  init() {
    this.ranges.forEach(range => {
      range.dataset.range = "init";

      this.calcFillValue(range);
      this.events(range, "input");
      this.events(range, "change");
      this.mutationObserver(range);

      range.recalculateFillValue = () => {
        this.calcFillValue(range);
      };
      range.setValue =
        /** @param {number | `${number}`} value */
        (value) => {
          range.value = value;
          range.dispatchEvent(new Event("change"));

          return value;
        }
    });
  }

  /**
   * @param {HTMLInputElement} range
   * @param {"input" | "change"} event
   */
  events(range, event) {
    range.addEventListener(event, () => {
      this.calcFillValue(range);
    });
  }

  /** @param {HTMLInputElement} range */
  mutationObserver(range) {
    const rangeMutationObserver = new MutationObserver(entries => {
      entries.forEach((entry) => {
        const { attributeName } = entry;

        if (attributeName === "value") {
          const value = range.getAttribute("value");

          range.value = value;
        }

        this.calcFillValue(range);
      });
    });

    rangeMutationObserver.observe(range, {
      attributeFilter: ["min", "max", "step", "value"],
    });
  }

  /** @param {HTMLInputElement} range */
  calcFillValue(range) {
    let { min, max, value } = range;

    min = +min || 0;
    max = +max || 100;
    value = +value;

    const fillValue = ((value - min) * 100 / (max - min));

    range.style.setProperty("--range-fill-value", fillValue);
  }
}

export { Ranges };
