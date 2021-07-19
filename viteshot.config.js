const playwrightShooter = require("viteshot/shooters/playwright");
const playwright = require("playwright");

module.exports = {
  framework: "react",
  shooter: playwrightShooter(playwright.chromium),
  filePathPattern: "**/*.screenshot.@(js|jsx|tsx|vue|svelte)",
};
