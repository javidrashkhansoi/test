import { selectors, addedClass, hostings } from "./media.js";

const { rutube } = hostings;
const { blocks, hostingName } = rutube;
const localStorageName = `${hostingName}-thumbnails`;

if (!localStorage.getItem(localStorageName)) localStorage.setItem(localStorageName, "{}");

class RutubeMedia {
  /** @type {MediaThumbnailStorage} */
  #thumbnailsStorage = JSON.parse(localStorage.getItem(localStorageName));

  /** @type {MediaConstructor} */
  constructor(options = {}) {
    if (blocks.length) {
      this.onPlay = options.onPlay;
      this.#init();
    }
  }

  #init() {
    blocks.forEach(block => {
      block[hostingName] = this;

      const { dataset } = block;
      const { media } = dataset;

      /** @type {HTMLButtonElement | HTMLAnchorElement | Element} */
      const button = block.querySelector(selectors.button);

      if (button) {
        const picture = this.#getThumbnailImage(block, media);

        block.prepend(picture);
        this.#buttonClickEvent(block, button);
      }
    });
  }

  /** @type {GetMediaThumbnailImage} */
  #getThumbnailImage(block, media) {
    /** @type {HTMLPictureElement | HTMLImageElement} */
    let picture = block.querySelector(selectors.picture);

    if (!picture) {
      picture = document.createElement("img");

      if (this.#thumbnailsStorage[media]) {
        const { jpg } = this.#thumbnailsStorage[media];

        picture.src = jpg;
      } else {
        this.#thumbnailsStorage[media] = {};
        this.#getThumbnailSrc(picture, media);
      }

      picture.alt = "";
    }

    return picture;
  }

  /** @type {GetMediaThumbnailSrc} */
  #getThumbnailSrc(imageElement, media) {
    const img = document.createElement("img");
    const src = `https://rutube.ru/api/video/${media}/thumbnail/?redirect=1`;

    img.src = src;

    img.addEventListener("load", () => {
      imageElement.src = src;
      this.#thumbnailsStorage[media].jpg = src;
      localStorage.setItem(localStorageName, JSON.stringify(this.#thumbnailsStorage));
    });
  }

  /** @type {MediaPlayButtonClickEvent} */
  #buttonClickEvent(block, button) {
    button.addEventListener("click", () => {
      const { dataset, classList } = block;
      const { media } = dataset;
      /** @type {HTMLPictureElement | HTMLImageElement} */
      const picture = block.querySelector(selectors.picture);

      if (typeof this.onPlay === "function") this.onPlay(block);

      picture.remove();
      button.remove();
      classList.add(addedClass);

      const iframe = document.createElement("iframe");

      iframe.src = `https://rutube.ru/play/embed/${media}`;
      iframe.setAttribute("frameborder", "0");
      iframe.allow = "clipboard-write; autoplay";
      iframe.setAttribute("webkitAllowFullScreen", "");
      iframe.setAttribute("mozallowfullscreen", "");
      iframe.allowFullscreen = true;

      block.append(iframe);

      iframe.addEventListener("load", () => {
        iframe.contentWindow.postMessage(JSON.stringify({
          type: "player:play",
          data: {},
        }), "*");
      });
    });
  }
}

export { RutubeMedia };
