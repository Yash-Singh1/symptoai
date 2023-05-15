import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const articles = JSON.parse(readFileSync("articles.json", "utf-8"));

let articlesProcessed: { content: string; title: string }[] = [];

async function processArticles(index: number = 0) {
  if (index >= articles.length) {
    return;
  }
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const article = articles[index];
  const dom = new JSDOM(await (await fetch(article)).text());
  let title: HTMLElement | null | undefined = [
    ...dom.window.document.querySelectorAll("h2"),
  ].find((h2) => h2.textContent?.trim() === "Symptoms");
  let content = `# ${dom.window.document.title.split(" - ")[0]}\n\n`;
  if (typeof title !== "undefined") {
    content += "## Symptoms\n\n";
    while (title!.nextSibling as HTMLElement | null) {
      // if (
      //   (title!.nextSibling.tagName &&
      //     (title!.nextSibling as HTMLElement).tagName.startsWith("h")) ||
      //   title!.nextSibling instanceof dom.window.HTMLParagraphElement
      // ) {
      //   content += (title!.nextSibling as HTMLElement).textContent + "\n";
      // } else
      if (title?.nextSibling instanceof dom.window.HTMLUListElement) {
        for (const li of [...title?.nextSibling.children]) {
          content += `* ${li.textContent}\n`;
        }
        content += "\n";
        break;
      } else if (title?.nextSibling instanceof dom.window.HTMLOListElement) {
        for (const li of [...title?.nextSibling.children]) {
          content += `1. ${li.textContent}\n`;
        }
        content += "\n";
        break;
      }
      // else if (!title?.nextSibling?.tagName) {
      //   // continue;
      // }
      else if ((title!.nextSibling as HTMLElement).tagName === "H2") break;

      title = title?.nextSibling as HTMLElement | null;
    }
  }
  title = [...dom.window.document.querySelectorAll("h2")].find(
    (h2) => h2.textContent?.trim().toLowerCase() === "risk factors"
  );
  if (typeof title !== "undefined") {
    content += "\n## Risk Factors\n\n";
    while (title!.nextSibling as HTMLElement | null) {
      if (
        ('tagName' in title!.nextSibling! &&
          (title!.nextSibling as HTMLElement).tagName.startsWith("h")) ||
        title!.nextSibling instanceof dom.window.HTMLParagraphElement
      ) {
        content += (title!.nextSibling as HTMLElement).textContent + "\n";
      } else if (title?.nextSibling instanceof dom.window.HTMLUListElement) {
        for (const li of [...title?.nextSibling.children]) {
          content += `* ${li.textContent}\n`;
        }
        content += "\n";
      } else if (title?.nextSibling instanceof dom.window.HTMLOListElement) {
        for (const li of [...title?.nextSibling.children]) {
          content += `1. ${li.textContent}\n`;
        }
        content += "\n";
      } else if (!('tagName' in title!.nextSibling!)) {
        // continue;
      } else if ((title!.nextSibling as HTMLElement).tagName === "H2") break;

      title = title?.nextSibling as HTMLElement | null;
    }
  }
  articlesProcessed.push({
    content,
    title: dom.window.document.title.split(" - ")[0],
  });
  console.log(
    'Done with article "' +
      articlesProcessed[articlesProcessed.length - 1].title +
      '"'
  );
  writeFileSync(
    `content/${Date.now()}.md`,
    articlesProcessed[articlesProcessed.length - 1].content
  );
  articlesProcessed = [];
  void processArticles(index + 1);
}

processArticles();
