# SymptoAI

SymptoAI is a next-generation AI-based disease predictor that takes in natural language input for your current symptoms and conditions, and outputs the most likely diseases that you have.

## Web Scraping

The web scraping scripts scrape the content provided on the Mayo Clinic website. These scripts are only for educational purposes and are not to be used for anything else. To run these scripts, run the `pnpm` scripts:

- `articles` -- Scrapes out all of the articles that are in the index
- `content` -- Gets the content of all of the previously scraped articles

## Next.js

This site is written using Next.js. To run the site:

- `dev` -- The `dev` script starts up a development server for the Next.js site.
- `build` -- The `build` script generates a production build for the site.
- `start` -- The `start` script starts up a preview server of the generated build.
- `lint` -- The `lint` script runs the `lint` task with Next.js style output.
