const popup = document.querySelector("#popup");
const mainForm = document.querySelector("#main-form");
const setsForm = document.querySelector("#sets-form");
const activePresetIn = document.querySelector("#activePresetIn");

const DEFAULT_PRESET = {
  activePreset: "1",
  userId: "",
  from: "0",
  to: "-1",
  limit: "-1",
  lookahead: "5",
  baseDomain: "https://coomer.st",
  baseApiPath: "/api/v1",
  serviceName: "onlyfans",
};

addEventListener("load", (event) => updateInputs());
setsForm.addEventListener("submit", (event) => event.preventDefault());
activePresetIn.addEventListener("input", () => {
  if (getPreset(activePresetIn.value)) updateInputs(activePresetIn.value);
});

function* iterateInputs(...forms) {
  for (const form of forms) {
    for (const ele of form.elements) {
      if (ele.tagName != "INPUT" || !ele.name) continue;
      yield ele;
    }
  }
}

function updateInputs(customActivePreset = null) {
  const activePreset =
    customActivePreset || localStorage.getItem("activePreset");
  const preset = getPreset(activePreset)
    ? getPreset(activePreset)
    : DEFAULT_PRESET;
  for (const inp of iterateInputs(mainForm, setsForm)) {
    inp.value = preset[inp.name];
  }
}

function dumpInputsAsPreset() {
  const preset = {};
  for (const inp of iterateInputs(mainForm, setsForm))
    preset[inp.name] = inp.value;
  return preset;
}

function getPreset(name) {
  return JSON.parse(localStorage.getItem("preset-" + name));
}

function savePreset(name, data) {
  localStorage.setItem("preset-" + name, JSON.stringify(data));
}

function showPopup() {
  popup.style.display = "flex";
}

function closePopup() {
  popup.style.display = "none";

  localStorage.setItem("activePreset", activePresetIn.value);
  savePreset(activePresetIn.value, dumpInputsAsPreset());
}

function handleMainSubmit(event) {
  event.preventDefault();

  const preset = dumpInputsAsPreset();
  const params = new URLSearchParams(preset).toString();

  if (event.target.action.indexOf("?") != -1) {
    event.target.action =
      event.target.action.slice(0, event.target.action.indexOf("?")) +
      "?" +
      params;
  } else {
    event.target.action += "?" + params;
  }

  window.location.href = event.target.action;
}
