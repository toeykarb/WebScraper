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
  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(5000);

    console.log("current link : ", url);
    let imagelink = [];

    imagelink = await page.evaluate(() => {
      return [
        ...document.querySelectorAll(".item-title .pull-right .ml-1"),
      ].map((a) => {
        let item = a.getAttribute("href");
        let resultVal = item ? item.replace("/zoom", "") : "";
        return resultVal;
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
  var i = 318;
  var result = [];
  try {
    while (i <= 320) {
      var url = `https://www.webumenia.sk/en/katalog?has_image=1&is_free=1&years-range=-470%2C1800&page=${i}`;

      const encoded_url = new URL(url);
      var scrapingImg = await scraping(encoded_url.href);
      if (scrapingImg.length < 1) {
        console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
      }
      result = [...result, ...scrapingImg];
      i++;

      console.log("complete ...... : " + result.length);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.log(err);
    console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);
  // console.log(json);
  fs.writeFile("data/umenia/umenia--470-1800-2.json", json2, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });

  return true;
}

main();
