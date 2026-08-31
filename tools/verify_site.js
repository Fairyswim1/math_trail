const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("dialog", async (dialog) => dialog.accept());

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  const bodyText = await page.locator("body").innerText();
  const initialChoices = await page.locator("#answer-grid .answer-choice").count();
  const currentImageLoaded = await page.locator("#current-problem").evaluate((img) => (
    img.complete && img.naturalWidth > 0 && img.naturalHeight > 0
  ));
  const teacherTabCount = await page.locator('button[data-view="teacher"]').count();

  await page.click('#answer-grid .answer-choice[data-answer="2"]');
  const titleAfterPick = await page.locator("#current-title").innerText();
  const choicesAfterPick = await page.locator("#answer-grid .answer-choice").count();
  const secondSlotText = await page.locator(".trail-slot").nth(1).innerText();

  await page.click("#undo-run");
  const choicesAfterUndo = await page.locator("#answer-grid .answer-choice").count();

  await page.click('button[data-view="all"]');
  const allCards = await page.locator(".all-card").count();
  const allModeSwitchCount = await page.locator("[data-all-mode]").count();

  await page.screenshot({ path: "C:/Users/BTY/Desktop/maths_trail/tmp/site-check.png", fullPage: true });
  await browser.close();

  console.log(JSON.stringify({
    hasTitle: bodyText.includes("종합 (2-3)"),
    initialChoices,
    currentImageLoaded,
    teacherTabCount,
    titleAfterPick,
    choicesAfterPick,
    secondSlotText,
    choicesAfterUndo,
    allCards,
    allModeSwitchCount,
    errors,
  }, null, 2));
})();
