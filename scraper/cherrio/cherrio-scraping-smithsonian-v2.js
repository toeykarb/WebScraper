var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scraping(url) {
  // try {
  const browser = await puppeteer.launch({
    headless: true,
    // devtools: true,
  });
  const page = await browser.newPage();
  let imagelink = [];
  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(5000);

    console.log("current link : ", url);

    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll(".row-fluid .span10 .title")].map(
        (a) => {
          let item = "https://www.si.edu/object/" + a.getAttribute("id");
          return item;
        }
      );
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
  try {
    while (i <= 227) {
      if (i == 1) {
        var url = `https://collections.si.edu/search/results.htm?q=&fq=data_source%3A%22Freer+Gallery+of+Art+and+Arthur+M.+Sackler+Gallery%22&media.CC0=true&start=0`;
      } else {
        var url = `https://collections.si.edu/search/results.htm?media.CC0=true&q=&fq=data_source%3A%22Freer+Gallery+of+Art+and+Arthur+M.+Sackler+Gallery%22&start=${
          (i - 1) * 20
        }`;
      }
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

  fs.writeFile(
    "data/smithsonian/new-web/catalog/Sackler.json",
    json2,
    function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    }
  );
  return true;
}

main();
