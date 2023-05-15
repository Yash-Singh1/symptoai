import { writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "%23"];
let articles: string[] = [];

async function processLetter(index: number = 0) {
  if (index >= letters.length) return;
  await new Promise((resolve) => setTimeout(resolve, 10));
  const dom = new JSDOM(
    await (
      await fetch(
        `https://www.mayoclinic.org/diseases-conditions/index?letter=${letters[index]}`
      )
    ).text()
  );
  articles = [
    ...articles,
    ...[
      ...dom.window.document.querySelectorAll(
        `a.cmp-anchor--plain.cmp-button.cmp-button__link.cmp-results-with-primary-name__see-link`
      ),
    ].map((a) => a.getAttribute("href")!),
  ];
  console.log('Done with letter "' + letters[index] + '"');
  await processLetter(index + 1);
}

processLetter().then(() => {
  writeFileSync("articles.json", JSON.stringify([...new Set(articles)], null, 2));
});
