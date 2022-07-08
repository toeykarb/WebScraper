const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
var fs = require('fs');

async function scraping(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // page.on('console', (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(6000);
    await page.waitForSelector('.mw-search-results');

    const data = {
      url,
      link: [],
      internalTags: [],
    };

    console.log('Get link');
    console.log(url);
    let imagelink = [];
    imagelink = await page.evaluate(() => {
      return [
        ...document.querySelectorAll('.mw-search-results .searchResultImage tr td:nth-child(1) a'),
      ].map((a) => {
        let item = a.getAttribute('href');
        return `https://commons.wikimedia.org${item}`;
      });
    });
    // data.link.push(...imagelink);
    let nextPage = '';
    try {
      nextPage = await page.evaluate(() => {
        const uploadedIndex = document
          .querySelector('.mw-search-pager-bottom .mw-nextlink')
          .getAttribute('href');
        return `https://commons.wikimedia.org${uploadedIndex}`;
      });
    } catch (err) {
      console.log(`empty page ${url}`);
    }

    await browser.close();
    return [imagelink, nextPage];
  } catch (error) {
    console.log(error);
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var url =
    'https://commons.wikimedia.org/w/index.php?title=Special:Search&limit=500&offset=0&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1&search=haswbstatement%3AP6216%3DQ88088423+deepcat%3A%22Quality+Images%22&advancedSearch-current={%22fields%22:{%22deepcategory%22:[%22Quality%20Images%22]}}';
  var i = 1;
  var result = [];
  try {
    while (i <= 8) {
      [items, nextPage] = await scraping(url);
      if (items.length == 0) {
        console.log(`Error : ${url}`);
      } else {
        result = [...result, ...items];
      }

      console.log('complete ...... : ' + result.length);
      if (nextPage == '') {
        break;
      }
      url = nextPage;
      // console.log(nextPage);
      i++;
    }
  } catch (err) {
    console.log(err);
    console.log('last url', url);
  }

  console.log(`All result : ${result.length}`);
  // const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  // console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(result);
  fs.writeFile(`data/wiki/qualityimage/quality-version2-public-domain.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
    return true;
  });
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const isElementVisible = async (page, cssSelector) => {
  await autoScroll(page);
  let visible = true;
  await page.waitForSelector(cssSelector, { visible: true, timeout: 4000 }).catch(() => {
    visible = false;
  });
  return visible;
};

const getLink = async (page) => {
  try {
    console.log('scraping....');
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll('.sdms-image-result')].map((a) => {
        let item = a.getAttribute('href');
        return item;
      });
    });
  } catch (error) {
    console.log(error);
    return [];
  }
  return imagelink;
};
main();
