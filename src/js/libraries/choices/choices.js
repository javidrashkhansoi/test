/** @type {NodeListOf<HTMLSelectElement>} */
const selects = document.querySelectorAll("select:not([data-default])");

selects.forEach(select => {
  const choices = new window.__jr__.Choices(select, {
    allowHTML: false,
    searchEnabled: false,
    position: "bottom",
    shouldSort: false,
    itemSelectText: "",
  });
});
