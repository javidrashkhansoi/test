class Move {
  #$destination;
  #$elementAtIndex;
  #$placeholder = document.createElement("div");
  #$target;
  #breakpoint;
  #breakpointType;
  #destinationChildren;
  #index;
  #matchMedia;

  /** @param {MoveOptions} options */
  constructor(options) {
    this.#$destination = document.querySelector(options.destinationSelector);
    this.#$target = document.querySelector(options.targetSelector);

    if (this.#$destination && this.#$target) {
      this.#breakpoint = options.breakpoint ?? 768;
      this.#breakpointType = options.breakpointType ?? "max";
      this.#destinationChildren = this.#$destination.children;
      this.#index = options.index ?? "last";
      this.#matchMedia = matchMedia(`(${this.#breakpointType}-width: ${this.#breakpoint}px)`);

      if (this.#index !== "first" && this.#index !== "last") {
        this.#$elementAtIndex = this.#destinationChildren[this.#index];
      }

      this.#init();
    }
  }

  #init() {
    this.#$placeholder.hidden = true;

    if (this.#matchMedia.matches) this.#move();

    this.#matchMedia.addEventListener("change", event => {
      event.matches ? this.#move() : this.#remove();
    });
  }

  #move() {
    this.#$target.insertAdjacentElement("beforebegin", this.#$placeholder);

    if (this.#$elementAtIndex) {
      this.#$elementAtIndex.insertAdjacentElement("beforebegin", this.#$target);
    } else if (this.#index === "first") {
      this.#$destination.insertAdjacentElement("afterbegin", this.#$target);
    } else {
      this.#$destination.insertAdjacentElement("beforeend", this.#$target);
    }
  }

  #remove() {
    this.#$placeholder.insertAdjacentElement("beforebegin", this.#$target);
    this.#$placeholder.remove();
  }
}

export { Move };
