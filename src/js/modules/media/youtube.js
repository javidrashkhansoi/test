import { selectors, addedClass, hostings } from "./media.js";

const { youtube } = hostings;
const { blocks, hostingName } = youtube;
const localStorageName = `${hostingName}-thumbnails`;

if (!localStorage.getItem(localStorageName)) localStorage.setItem(localStorageName, "{}");

class YoutubeMedia {
  #apiLink = "https://www.youtube.com/iframe_api";
  #isApiLoaded = false;
  #thumbnailNames = ["maxresdefault", "hq720", "sddefault", "sd3", "sd2", "sd1", "hqdefault", "hqdefault", "hq3", "hq2", "hq1", "0", "mqdefault", "mq3", "mq2", "mq1"];
  #thumbnailNamesLength = this.#thumbnailNames.length;
  /** @type {YoutubeThumbnailStorage} */
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
        const iframePlaceholder = document.createElement("div");
        const picture = this.#getThumbnailImage(block, media);

        iframePlaceholder.dataset.iframePlaceholder = "";

        block.prepend(iframePlaceholder, picture);
        this.#buttonClickEvent(block, button);
      }
    });
  }

  /** @type {GetMediaThumbnailImage} */
  #getThumbnailImage(block, media) {
    /** @type {HTMLPictureElement | HTMLImageElement} */
    let picture = block.querySelector(selectors.picture);

    if (!picture) {
      const source = document.createElement("source");
      const img = document.createElement("img");

      picture = document.createElement("picture");

      if (this.#thumbnailsStorage[media]) {
        const { jpg, webp } = this.#thumbnailsStorage[media];

        source.srcset = webp;
        img.src = jpg;
      } else {
        this.#thumbnailsStorage[media] = {};
        this.#getThumbnailSrc(source, media);
        this.#getThumbnailSrc(img, media);
      }

      source.type = "image/webp";
      img.alt = "";
      picture.append(source, img);
    }

    return picture;
  }

  /** @type {GetYoutubeThumbnailSrc} */
  #getThumbnailSrc(imageElement, media, index = 0) {
    if (index >= this.#thumbnailNamesLength) return;

    const type = imageElement instanceof HTMLSourceElement ? "webp" : "jpg";
    const img = document.createElement("img");
    const thumbnailName = this.#thumbnailNames[index];
    const src = `https://i.ytimg.com/vi${type === "webp" ? `_${type}` : ""}/${media}/${thumbnailName}.${type}`;

    img.src = src;

    img.addEventListener("load", () => {
      const { width, height } = img;

      if (width === 120 && height === 90) {
        this.#getThumbnailSrc(imageElement, media, ++index);
      } else {
        imageElement[type === "webp" ? "srcset" : "src"] = src;
        this.#thumbnailsStorage[media][type] = src;
        localStorage.setItem(localStorageName, JSON.stringify(this.#thumbnailsStorage));
      }
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
      /** @type {HTMLScriptElement} */
      const api = document.querySelector("script#www-widgetapi-script");

      api.addEventListener("load", () => {
        this.#createIframe(block);
      });
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
    /** @type {HTMLDivElement} */
    const iframePlaceholder = block.querySelector("[data-iframe-placeholder]");

    if (typeof this.onPlay === "function") this.onPlay(block);

    picture.remove();
    button.remove();
    classList.add(addedClass);

    new YT.Player(iframePlaceholder, {
      videoId: media,
      playerVars: {
        "autoplay": 1,
        "rel": 0,
        "playsinline": 1,
      },
      events: {
        "onReady": (event) => {
          const { target } = event;

          if (matchMedia("(hover: none)").matches) target.mute();

          target.playVideo();
        },
      },
    });
  }
}

export { YoutubeMedia };
