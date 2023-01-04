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
  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    // await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url, {
      waitUntil: "networkidle0",
    });
    const cookieCloseButton = await page.$(`.fixed [data-consent]`);
    if (cookieCloseButton) {
      try {
        await cookieCloseButton.evaluate((b) => b.click());
      } catch (error) {
        console.log(error);
      }
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(5000);

    console.log("current link : ", url);

    let imagelink = await page.evaluate(() => {
      let getImageLink = document.querySelectorAll(".object-teaser-inner .object-teaser-title a")
        ? [...document.querySelectorAll(".object-teaser-inner .object-teaser-title a")].map(
            (a) => `https://sammlung.wienmuseum.at` + a.getAttribute("href")
          )
        : [];
      return getImageLink;
    });
    return imagelink;
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
}

async function main() {
  var i = 1;
  var result = [];
  try {
    while (i <= 6) {
      if (i == 1) {
        var url = `https://sammlung.wienmuseum.at/en/object/?people=p11373&sort=RELEVANCE&layout=NORMAL`;
      } else {
        var url = `https://sammlung.wienmuseum.at/en/object/?people=p11373&skip=${
          (i - 1) * 30
        }&sort=RELEVANCE&layout=NORMAL`;
      }
      var scrapingImg = await scraping(url);
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
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);
  // console.log(json);
  // fs.writeFile(
  //   "data/met/all-themet/notdup/the-met-01.json",
  //   json,
  //   function (err) {
  //     if (err) {
  //       return console.log(err);
  //     }

  //     console.log("The file was saved!");
  //   }
  // );
  fs.writeFile("data/wien/Egon Schiele.json", json2, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
  return true;
}

main();
