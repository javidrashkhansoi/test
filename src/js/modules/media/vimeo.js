import { selectors, addedClass, hostings } from "./media.js";

const { vimeo } = hostings;
const { blocks, hostingName } = vimeo;
const localStorageName = `${hostingName}-thumbnails`;

if (!localStorage.getItem(localStorageName)) localStorage.setItem(localStorageName, "{}");

class VimeoMedia {
  #apiLink = "https://player.vimeo.com/api/player.js";
  #isApiLoaded = false;
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
    const src = `https://vumbnail.com/${media}.jpg`;

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
      this.#isApiLoaded ? this.#createIframe(block) : this.#loadApi(block);
    });
  }

  /** @type {MediaLoadApi} */
  #loadApi(block) {
    const script = document.createElement("script");
    const firstScriptTag = document.getElementsByTagName("script")[0];

    script.src = this.#apiLink;
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    this.#isApiLoaded = true;

    script.addEventListener("load", () => {
      this.#createIframe(block);
    });
  }

  /** @type {MediaCreateIframe} */
  #createIframe(block) {
    const { dataset, classList } = block;
    const { media } = dataset;
    /** @type {HTMLPictureElement | HTMLImageElement} */
    const picture = block.querySelector(selectors.picture);
    /** @type {HTMLButtonElement | HTMLAnchorElement | Element} */
    const button = block.querySelector(selectors.button);

    if (typeof this.onPlay === "function") this.onPlay(block);

    picture.remove();
    button.remove();
    classList.add(addedClass);

    new Vimeo.Player(block, {
      id: media,
      autoplay: true,
    });
  }
}

export { VimeoMedia };
