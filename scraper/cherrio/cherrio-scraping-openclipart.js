const puppeteer = require('puppeteer');
var fs = require('fs');

async function scraping(url) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(3000);
    await page.waitForSelector('.gallery');

    const data = {
      url,
      link: [],
      internalTags: [],
    };
    const adButton = await page.$('#card .toprow #dismiss-button');
    if (adButton) {
      try {
        adButton.click();
      } catch (error) {
        console.log(error);
      }
      await page.waitForTimeout(500);
    }
    console.log('Get link');
    console.log(url);
    let imagelink = [];
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll('.gallery .artwork a')].map((a) => {
        let item = a.getAttribute('href');
        return `https://openclipart.org${item}`;
      });
    });

    await browser.close();
    return imagelink;
  } catch (error) {
    console.log(error);
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var i = 36;
  var result = [];
  var counter = true;
  try {
    while (i <= 40) {
      var url = `https://openclipart.org/search/?p=${i}&query=glitch`;
      var items = await scraping(url);
      if (items.length == 0) {
        console.log(`Error : ${url}`);
      } else {
        result = [...result, ...items];
      }
      console.log('complete ...... : ' + result.length);
      i++;
    }
  } catch (err) {
    console.log(err);
    console.log('last url', url);
  }

  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  fs.writeFile(`data/openclipart/glitch/glitch-search-02.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
    return true;
  });
}

main();
