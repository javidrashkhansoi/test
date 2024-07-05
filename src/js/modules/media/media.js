const selectors = {
  button: "[data-play], button, a",
  iframe: "iframe",
  mediaBlocks: "[data-media]",
  picture: "img, picture",
};
const addedClass = "media--ready";
/** @type {NodeListOf<HTMLDivElement>} */
const mediaBlocks = document.querySelectorAll(selectors.mediaBlocks);
/** @type {MediaHostings} */
const hostings = {
  rutube: {
    blocks: [],
    hostingName: "rutube",
    idRegExp: /^[a-fA-F0-9]{32}$/,
  },
  vimeo: {
    blocks: [],
    hostingName: "vimeo",
    idRegExp: /^[0-9]{9}$/,
  },
  youtube: {
    blocks: [],
    hostingName: "youtube",
    idRegExp: /^[a-zA-Z0-9_-]{11}$/,
  },
};

mediaBlocks?.forEach(mediaBlock => {
  const { dataset } = mediaBlock;
  const iframeInMediaBlock = mediaBlock.querySelector(selectors.iframe);

  let { media, hosting } = dataset;

  if (media) media = media.trim();
  if (hosting) hosting = hosting.trim();

  if (!iframeInMediaBlock) {
    for (const item in hostings) {
      const { blocks, hostingName, idRegExp } = hostings[item];

      if (hosting === hostingName || idRegExp.test(media)) {
        blocks.push(mediaBlock);
        dataset.hosting = hostingName;
      }
    }
  } else {
    /** @type {HTMLButtonElement | HTMLAnchorElement | Element} */
    const buttonInMediaBlock = mediaBlock.querySelector(selectors.button);
    /** @type {HTMLImageElement | HTMLPictureElement} */
    const pictureInMediaBlock = mediaBlock.querySelector(selectors.picture);

    if (buttonInMediaBlock) buttonInMediaBlock.remove();
    if (pictureInMediaBlock) pictureInMediaBlock.remove();

    mediaBlock.removeAttribute("data-media");
    mediaBlock.removeAttribute("data-hosting");
  }
});

export { selectors, addedClass, hostings };
