var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scraping(url) {
  // try {
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
  });
  const page = await browser.newPage();
  let imagelink = [];
  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(5000);
    // const cssSelector = ".sdms-load-more";
    // let loadMoreVisible = await isElementVisible(page, cssSelector);

    // var counter = 0;
    // while (loadMoreVisible) {
    //   console.log("loadMoreVisible", loadMoreVisible);
    //   //console.log(counter);
    //   await page.click(cssSelector).catch(() => {});
    //   loadMoreVisible = await isElementVisible(page, cssSelector);

    //   if (counter % 1000 == 0) {
    //     var getitem = await getLink(page);
    //     data.link.push(...getitem);
    //   }
    //   counter++;
    // }
    await page.click(`[data-test-id="layout-button-row"]`);
    await page.waitForTimeout(5000);
    await autoScroll(page);

    console.log("current link : ", url);

    imagelink = await page.evaluate(() => {
      return [
        ...document.querySelectorAll(
          '#searchResultsContainer [data-test-id="search-result-object"] .row'
        ),
      ].map((a) => {
        let item = "https://www.kansallisgalleria.fi" + a.getAttribute("href");
        return item;
      });
    });
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }

  return imagelink;
}

async function main() {
  var i = 1;
  var result = [];

  var url = `https://www.kansallisgalleria.fi/en/search?category=artwork&copyrightFree=true&hasImage=true`;

  const encoded_url = new URL(url);
  var scrapingImg = await scraping(encoded_url.href);
  if (scrapingImg.length < 1) {
    console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
  }
  result = [...result, ...scrapingImg];
  i++;

  console.log("complete ...... : " + result.length);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);
  // console.log(json);
  fs.writeFile("data/fin/test-03.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });

  return true;
}

main();

const isElementVisible = async (page, cssSelector) => {
  await autoScroll(page);
  let visible = true;
  await page.waitForSelector(cssSelector, { visible: true, timeout: 2000 }).catch(() => {
    visible = false;
  });
  return visible;
};

const getLink = async (page) => {
  try {
    console.log("scraping....");
    imagelink = await page.evaluate(() => {
      return [
        ...document.querySelectorAll(
          '#searchResultsContainer [data-test-id="search-result-object"] .jHmDal'
        ),
      ].map((a) => {
        let item = "https://www.kansallisgalleria.fi" + a.getAttribute("href");
        return item;
      });
    });
  } catch (error) {
    console.log(error);
    return [];
  }
  return imagelink;
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var counter = 0;
      var totalHeight = 0;
      var distance = 800;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 3000);
    });
  });
}
