class Slide {
  static addingClass = "slide-active";

  /**
   * @description
   * Плавно раскрывает элемент.
   *
   * @param {Element} element - Элемент, который будет раскрываться.
   *
   * @param {number} duration - Время в миллисекундах, за которое элемент раскроется. По умолчанию 300.
   *
   * @returns {void}
   */
  static down(element, duration = 300) {
    const { classList: elementClassList } = element;

    if (!elementClassList.contains(this.addingClass)) {
      const { style: elementStyle } = element;

      elementClassList.add(this.addingClass);

      if (element.hidden) element.hidden = false;

      elementStyle.overflow = "hidden";
      elementStyle.height = 0;
      elementStyle.paddingTop = 0;
      elementStyle.paddingBottom = 0;
      elementStyle.marginTop = 0;
      elementStyle.marginBottom = 0;
      element.offsetHeight;
      elementStyle.transitionProperty = "height, margin, padding";
      elementStyle.transitionDuration = `${duration}ms`;
      elementStyle.height = `${element.scrollHeight}px`;
      elementStyle.removeProperty("padding-top");
      elementStyle.removeProperty("padding-bottom");
      elementStyle.removeProperty("margin-top");
      elementStyle.removeProperty("margin-bottom");

      setTimeout(() => {
        elementStyle.removeProperty("height");
        elementStyle.removeProperty("overflow");
        elementStyle.removeProperty("transition-duration");
        elementStyle.removeProperty("transition-property");
        elementClassList.remove(this.addingClass);
      }, duration);
    }
  }

  /**
   * @description
   * Плавно скрывает элемент.
   *
   * @param {Element} element - Элемент, который будет скрываться.
   *
   * @param {number} duration - Время в миллисекундах, за которое элемент скроется. По умолчанию 300.
   *
   * @returns {void}
   */
  static up(element, duration = 300) {
    const { classList: elementClassList } = element;

    if (!elementClassList.contains(this.addingClass)) {
      const { style: elementStyle, offsetHeight } = element;

      elementClassList.add(this.addingClass);
      elementStyle.transitionProperty = "height, margin, padding";
      elementStyle.transitionDuration = `${duration}ms`;
      elementStyle.height = `${offsetHeight}px`;
      element.offsetHeight;
      elementStyle.overflow = "hidden";
      elementStyle.height = 0;
      elementStyle.paddingTop = 0;
      elementStyle.paddingBottom = 0;
      elementStyle.marginTop = 0;
      elementStyle.marginBottom = 0;

      setTimeout(() => {
        element.hidden = true;
        elementStyle.removeProperty("height");
        elementStyle.removeProperty("padding-top");
        elementStyle.removeProperty("padding-bottom");
        elementStyle.removeProperty("margin-top");
        elementStyle.removeProperty("margin-bottom");
        elementStyle.removeProperty("overflow");
        elementStyle.removeProperty("transition-duration");
        elementStyle.removeProperty("transition-property");
        elementClassList.remove(this.addingClass);
      }, duration);
    }
  }

  /**
   * @description
   * Плавно раскрывает/скрывает элемент.
   *
   * @param {Element} element - Элемент, который будет раскрываться/скрываться.
   *
   * @param {number} duration - Время в миллисекундах, за которое элемент раскроется/скроется. По умолчанию 300.
   *
   * @returns {void}
   */
  static toggle(element, duration = 300) {
    element.hidden ? this.down(element, duration) : this.up(element, duration);
  }
}

export { Slide };
