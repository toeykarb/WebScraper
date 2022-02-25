var fs = require("fs");

const puppeteer = require("puppeteer");
fetch("/about")
  .then(function (response) {
    // The API call was successful!
    return response.text();
  })
  .then(function (html) {
    // Convert the HTML string into a document object
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
  })
  .catch(function (err) {
    // There was an error
    console.warn("Something went wrong.", err);
  });

scraping = async (browser, url) => {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url, {
    waitUntil: "load",
    // Remove the timeout
    timeout: 0,
  });
  await page.waitForSelector(".breadcrumb-data *");
  var sourceCollection = "";
  sourceCollection = await page.evaluate(() => {
    const sourceCollectionIndex = [
      ...document.querySelectorAll(".breadcrumb-data *"),
    ].findIndex((node) => node.textContent.trim() === "Downloads:");
    const textSource =
      sourceCollectionIndex !== -1
        ? [...document.querySelectorAll(".breadcrumb-data *")][
            sourceCollectionIndex - 1
          ].textContent
        : "";

    return textSource;
  });
  var downloadResult = sourceCollection.replace("Downloads:", "");
  const parsed = parseInt(downloadResult);
  await page.close();
  return parsed;
};

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  let rawdata = fs.readFileSync(
    "/Users/beer/Desktop/SandBox/web-scraping/LOC/scraper/sheet1.json"
  );
  var dataAutor = JSON.parse(rawdata);
  var scrapingDownloads = "";
  for (var i = 0; i < 100; i++) {
    console.log("complete ...... : " + i);
    scrapingDownloads = await scraping(browser, dataAutor.Sheet1[i].link);
    dataAutor.Sheet1[i].downloads = scrapingDownloads;
  }
  var json = JSON.stringify(dataAutor);

  fs.writeFile("test-author2.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
