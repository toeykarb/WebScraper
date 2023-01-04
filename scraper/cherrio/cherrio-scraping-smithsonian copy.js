const puppeteer = require("puppeteer");
var fs = require("fs");

async function scraping(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: ["domcontentloaded"] });

    await page.waitForTimeout(3000);

    console.log("Get link");
    console.log(url);
    let imagelink = [];
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll(".has-media .node a")].map((a) => {
        let item = a.getAttribute("href");
        return `https://www.si.edu${item}`;
      });
    });

    await browser.close();
    return imagelink;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function main() {
  var i = 1;
  var result = [];
  try {
    while (i <= 10) {
      if (i == 1) {
        var url = `https://www.si.edu/search/collection-images?edan_q=&edan_fq%5B0%5D=unit_code%3ACHNDM%20OR%20unit_code%3ACHNDM_BL%20OR%20unit_code%3ACHNDM_YT&edan_fq%5B1%5D=media_usage%3A%22CC0%22`;
      } else {
        var url = `https://www.si.edu/search/collection-images?page=${
          i - 1
        }&edan_q=&edan_fq%5B0%5D=unit_code%3ACHNDM%20OR%20unit_code%3ACHNDM_BL%20OR%20unit_code%3ACHNDM_YT&edan_fq%5B1%5D=media_usage%3A%22CC0%22`;
      }

      var items = await scraping(url);
      if (items.length == 0) {
        console.log(`Error : ${url}`);
      } else {
        result = [...result, ...items];
      }
      console.log("complete ...... : " + result.length);
      i++;
    }
  } catch (err) {
    console.log(err);
    console.log("last url", url);
  }

  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  fs.writeFile(`data/smithsonian/smithsonian-01.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
    return true;
  });
}

main();
