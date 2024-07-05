import { App } from "./app.js";

const { burger, document: { html } } = App

class Goto {
  #activeClass = "active";
  #blocksThreshold;
  #closeBurger;
  /** @type {{[id: string]: GotoObject}} */
  #goto = {};
  #gotoArray;
  #highlight;
  #links;
  /** @type {MediaQueryList} */
  #matchMedia = burger.matchMedia;
  #on;

  /** @type {GotoConstructor} */
  constructor(selector, options = {}) {
    this.#links = document.querySelectorAll(selector);

    if (this.#links.length) {
      this.#blocksThreshold = options.blocksThreshold ?? 60;
      this.#closeBurger = options.closeBurger ?? true;
      this.#highlight = options.highlight ?? true;
      this.#on = options.on;

      this.#links.forEach(link => {
        const href = link.getAttribute("href");

        if (/^#./.test(href)) {
          const blockSelector = href.replace("#", "");
          const block = document.getElementById(blockSelector);

          if (block) {
            this.#goto[blockSelector] = {
              $block: block,
              $link: link,
              isActive: false
            }
          }
        }
      });

      this.#gotoArray = Object.values(this.#goto);

      if (this.#gotoArray.length) this.#init();
    }
  }

  #init() {
    this.#gotoArray.forEach(goto => {
      const { $block, $link } = goto;

      $link.addEventListener("click", () => {
        $block.focus();
      });

      if (this.#highlight) {
        const { classList: linkClassList } = $link;

        /** @type {IntersectionObserver} */
        let blockIntersectionObserver;

        const blockResizeObserver = new ResizeObserver(entries => {
          entries.forEach(entry => {
            const { target } = entry;

            blockIntersectionObserver?.disconnect();

            blockIntersectionObserver = new IntersectionObserver(
              entries => {
                entries.forEach(entry => {
                  const { isIntersecting } = entry;

                  goto.isActive = isIntersecting;
                  linkClassList.toggle(this.#activeClass, isIntersecting);

                  if (isIntersecting) {
                    if (typeof this.#on?.active === "function") this.#on.active(goto);
                  } else {
                    if (typeof this.#on?.inactive === "function") this.#on.inactive(goto);
                  }

                  if (typeof this.#on?.stateChange === "function") this.#on.stateChange(goto);
                });
              },
              {
                threshold: this.#threshold(target)
              }
            );

            blockIntersectionObserver.observe(target);
          });
        });

        blockResizeObserver.observe($block);
      }
    });

    if (this.#closeBurger) {
      if (this.#matchMedia) {
        if (this.#matchMedia.matches) this.#addLinksEvent();

        this.#matchMedia.addEventListener("change", event => {
          event.matches ? this.#addLinksEvent() : this.#removeLinksEvent();
        });
      } else if (typeof this.#matchMedia !== "undefined") {
        this.#addLinksEvent();
      }
    }
  }

  /** @type {GotoThreshold} */
  #threshold($block) {
    const { clientHeight: htmlClientHeight } = html;
    const { clientHeight: blockClientHeight } = $block;
    const proportion = htmlClientHeight / 100 * this.#blocksThreshold;
    const threshold = proportion / blockClientHeight;

    return threshold < 0 ? 0 : threshold > 1 ? 1 : threshold;
  }

  #addLinksEvent() {
    this.#gotoArray.forEach(goto => {
      const { $link } = goto;

      $link.addEventListener("click", this.#closingBurger);
    });
  }

  #removeLinksEvent() {
    this.#gotoArray.forEach(goto => {
      const { $link } = goto;

      $link.removeEventListener("click", this.#closingBurger);
    });
  }

  #closingBurger() {
    if (burger.isActive) burger.close();
  }
}

export { Goto };
