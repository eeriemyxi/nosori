const popup = document.querySelector("#popup");

const mainForm = document.querySelector("#main-form");
const setsForm = document.querySelector("#sets-form");

const activePresetIn = document.querySelector("#activePresetIn");

const INPUT_DEFAULTS = {
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

updateInputs(mainForm);

setsForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

activePresetIn.addEventListener("input", () => {
  updateInputs(setsForm, activePresetIn.value);
  updateInputs(mainForm, activePresetIn.value);
});

function* iterateInputs(form) {
  for (const ele of form.elements) {
    if (ele.tagName != "INPUT" || !ele.name) continue;
    yield ele;
  }
}

function updateInputs(form, preset_name = null) {
  const activePresetName = preset_name || getActivePresetName();
  const preset = getPreset(activePresetName);

  console.log("Updating for activePresetName=%s", activePresetName);

  for (const input of iterateInputs(form)) {
    if (input.name == "activePreset") continue;
    input.value = preset[input.name] || INPUT_DEFAULTS[input.name];
  }
}

function getActivePresetName() {
  return localStorage.getItem("activePreset") || INPUT_DEFAULTS["activePreset"];
}

function getPresets() {
  return JSON.parse(localStorage.getItem("presets") || "{}");
}

function getPreset(preset = null) {
  const presets = getPresets();
  return presets[preset || "activePreset"] || {};
}

function savePreset(preset, value = {}) {
  const presets = getPresets();
  console.log("preset=", preset);
  console.log("presets=", presets);

  const preset_value = presets[preset] || {};

  const merged = Object.assign({}, preset_value, value);

  presets[preset] = merged;
  console.log("updated presets=", presets);

  localStorage.setItem("presets", JSON.stringify(presets));
  localStorage.setItem("activePreset", preset);
}

function showPopup() {
  const activePresetName = getActivePresetName();
  const preset = getPreset(activePresetName);

  for (const input of iterateInputs(setsForm)) {
    input.value = preset[input.name] ||
      INPUT_DEFAULTS[input.name];
  }

  popup.style.display = "flex";
}

function closePopup() {
  const preset = {};

  for (const input of iterateInputs(setsForm)) {
    preset[input.name] = input.value;
  }

  for (const input of iterateInputs(mainForm)) {
    preset[input.name] = input.value;
  }

  savePreset(activePresetIn.value, preset);
  updateInputs(mainForm);

  popup.style.display = "none";
}

function handleMainSubmit(event) {
  event.preventDefault();

  const activePresetName = getActivePresetName();
  const preset = getPreset(activePresetName);

  for (const input of iterateInputs(mainForm)) {
    preset[input.name] = input.value;
  }

  for (const input of iterateInputs(setsForm)) {
    preset[input.name] = input.value;
  }

  savePreset(activePresetName, preset);

  const params = (new URLSearchParams(preset)).toString();

  if (event.target.action.indexOf("?") != -1) {
    event.target.action =
      event.target.action.slice(0, event.target.action.indexOf("?")) + "?" +
      params;
  } else {
    event.target.action += "?" + params;
  }

  window.location.href = event.target.action;
}
