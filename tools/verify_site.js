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
  const dialogs = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.accept();
  });

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

  await page.click('button[data-view="trail"]');
  await page.evaluate(() => {
    localStorage.setItem("maths-trail-2026-2-3-run", JSON.stringify([1, 2, 8, 5, 11, 10, 6, 3, 7, 9, 4, 12]));
  });
  await page.reload({ waitUntil: "networkidle" });
  const [padletPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.click("#submit-run"),
  ]);
  const resultText = await page.locator("#result-box").innerText();
  const confettiCount = await page.locator(".confetti-piece").count();
  const padletUrl = padletPage.url();
  await padletPage.close();

  await page.screenshot({ path: "C:/Users/BTY/Desktop/maths_trail/tmp/site-check.png", fullPage: true });
  await browser.close();

  console.log(JSON.stringify({
    hasTrailView: bodyText.includes("Circle Number"),
    initialChoices,
    currentImageLoaded,
    teacherTabCount,
    titleAfterPick,
    choicesAfterPick,
    secondSlotText,
    choicesAfterUndo,
    allCards,
    allModeSwitchCount,
    resultText,
    confettiCount,
    padletUrl,
    dialogs,
    errors,
  }, null, 2));
})();
