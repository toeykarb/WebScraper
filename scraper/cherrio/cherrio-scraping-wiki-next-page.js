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
    await page.waitForSelector('.mw-gallery-traditional');

    const data = {
      url,
      link: [],
      internalTags: [],
    };

    console.log('Get link');
    console.log(url);
    let imagelink = [];
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll('.gallery .gallerybox .thumb a')].map((a) => {
        let item = a.getAttribute('href');
        return `https://commons.wikimedia.org${item}`;
      });
    });
    // data.link.push(...imagelink);

    const nextPage = await page.evaluate(() => {
      const uploadedIndex = [...document.querySelectorAll('#mw-category-media [title]')].findIndex(
        (node) => node.textContent === 'next page'
      );
      const textSource =
        uploadedIndex !== -1
          ? // @ts-ignore
            [...document.querySelectorAll('#mw-category-media [title]')][
              uploadedIndex
            ].getAttribute('href')
          : '';
      return `https://commons.wikimedia.org${textSource}`;
    });

    await browser.close();
    return [imagelink, nextPage];
  } catch (error) {
    console.log(error);
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var url = 'https://commons.wikimedia.org/wiki/Category:Featured_pictures_on_Wikimedia_Commons';
  var i = 1;
  var result = [];
  try {
    while (i <= 79) {
      [items, nextPage] = await scraping(url);
      if (items.length == 0) {
        console.log(`Error : ${url}`);
      } else {
        result = [...result, ...items];
      }

      console.log('complete ...... : ' + result.length);
      if (result.length % 10 !== 0) {
        result.push(`errorlink+${url}`);
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
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  fs.writeFile(`data/wiki/featured-pictures/featured-pictures.json`, json, function (err) {
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
