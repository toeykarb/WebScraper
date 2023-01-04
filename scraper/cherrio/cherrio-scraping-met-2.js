var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const axios = require("axios");

async function scrapingfetch(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "cache-control": "no-cache",
    },
  });
  var getText = await response.text();
  console.log("response.data", getText);
  // return new Promise((resolve) => {
  //   request(url, async function (error, response, body) {
  //     console.log(`current link : ${url}`);
  //     // console.log(body);
  //     if (!body) {
  //       setTimeout(() => resolve(false), 500);
  //     }

  //     var $ = cheerio.load(body);

  //     var images = $(".has-media .node a");

  //     var imgStore = [];
  //     images.map(async (item) => {
  //       const link = "https://www.si.edu" + images[item].attribs.href;

  //       imgStore.push(link);
  //     });
  //     setTimeout(() => resolve(imgStore), 600);
  //   });
  // });
}

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);
      // console.log(body);
      if (!body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $(".cs__results .result-object");

      var imgStore = [];
      images.map(async (item) => {
        const link = images[item].attribs.href;

        imgStore.push(link);
      });
      setTimeout(() => resolve(imgStore), 600);
    });
  });
}

async function scrapingRequest(url) {
  var options = {
    method: "GET",
    url: "https://www.metmuseum.org/art/collection/search",
    qs: { showOnly: "openAccess", sortBy: "DateDesc" },
    headers: {
      "cache-control": "no-cache",
    },
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });

  // const response = await request({
  //   options,
  // });
  // // console.log("response.data", response);
  // console.log(response);
  // let $ = cheerio.load(response);

  // var images = $(".cs__results .result-object");
  // console.log(images);
  // var imgStore = [];
  // images.map(async (item) => {
  //   const link = "https://www.si.edu" + images[item].attribs.href;

  //   imgStore.push(link);
  // });
  // console.log(imgStore);
}

async function scrapingcherrio(url) {
  const response = await axios.get(url);
  console.log("response.data", response.data);
  let $ = cheerio.load(response.data);
  // return new Promise((resolve) => {
  //   request(url, async function (error, response, body) {
  //     console.log(`current link : ${url}`);
  //     // console.log(body);
  //     if (!body) {
  //       setTimeout(() => resolve(false), 500);
  //     }

  //     var $ = cheerio.load(body);

  //     var images = $(".has-media .node a");

  //     var imgStore = [];
  //     images.map(async (item) => {
  //       const link = "https://www.si.edu" + images[item].attribs.href;

  //       imgStore.push(link);
  //     });
  //     setTimeout(() => resolve(imgStore), 600);
  //   });
  // });
}

async function scrapingPeupeteer(url) {
  // try {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    // await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForSelector(".cs__results .result-object");
    await page.waitForTimeout(2000);
    console.log("current link : ", url);
    let imagelink = [];
    let returnData = [];
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll(".cs__results .result-object")].map((a) => {
        let item = a.getAttribute("href");
        if (item || item.length > 0) {
          return item;
        } else {
          return "";
        }
      });
    });
    // imagelink.map((a) => returnData.push(a.split("?")[0]));
    // console.log("returnData", returnData);
    return imagelink;
  } catch (error) {
    console.log(error);
    await page.screenshot({
      path: "met-test.jpeg",
      type: "jpeg",
      fullPage: true,
      quality: 50,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  var i = 2501;
  var result = [];
  var errorLog = [];
  var url = "";
  try {
    while (i <= 3000) {
      if (i == 1) {
        url = `https://www.metmuseum.org/art/collection/search?showOnly=openAccess&sortBy=DateDesc`;
      } else {
        url = `https://www.metmuseum.org/art/collection/search?offset=${
          (i - 1) * 40
        }&showOnly=openAccess&sortBy=DateDesc`;
      }
      const encoded_url = new URL(url);
      var scrapingImg = await scrapingPeupeteer(encoded_url.href);

      if (!scrapingImg || !scrapingImg?.length) {
        errorLog.push(url);
        console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
      }
      result = [...result, ...scrapingImg];
      i++;

      console.log("complete ...... : " + result.length);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.log(`\x1b[31m\x1b[43m Error : ${url} - No.${i}  \x1b[0m`);
    console.log(err);
  }
  console.log(`\x1b[31m\x1b[43m Error : ${errorLog}  \x1b[0m`);
  if (errorLog.length > 0) {
    let errorLogJson = JSON.stringify(errorLog);
    fs.writeFile("data/met/all-themet/met-all-image-6-error.json", errorLogJson, function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file error was saved!");
      return true;
    });
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);
  // console.log(json);
  fs.writeFile("data/met/all-themet/met-all-image-6-new-02.json", json2, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
    return true;
  });
}

main();
