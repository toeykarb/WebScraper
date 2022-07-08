const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
var fs = require('fs');

async function scraping(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(3000);
    await page.waitForSelector('.sdms-image-result');

    const data = {
      url,
      link: [],
      internalTags: [],
    };

    const cssSelector = '.sdms-load-more';
    let loadMoreVisible = await isElementVisible(page, cssSelector);

    var counter = 0;
    while (loadMoreVisible) {
      console.log('loadMoreVisible', loadMoreVisible);
      //console.log(counter);
      await page.click(cssSelector).catch(() => {});
      loadMoreVisible = await isElementVisible(page, cssSelector);

      if (counter % 30 == 0) {
        var getitem = await getLink(page);
        data.link.push(...getitem);
      }
      counter++;
    }

    console.log('Get link');
    let imagelink = [];
    await page.waitForTimeout(3000);
    var getImageLink = await getLink(page);
    data.link.push(...getImageLink);
    await browser.close();
    return data.link;
  } catch (error) {
    console.log(error);
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var url = [
    'https://commons.wikimedia.org/w/index.php?search=Ryan+Kaldari&title=Special:MediaSearch&go=Go&type=image&haslicense=unrestricted&fileres=%3E1000',
  ];
  // 'https://commons.wikimedia.org/w/index.php?search=Szilas&title=Special:MediaSearch&go=Go&type=image&haslicense=unrestricted&fileres=%3E1000',

  for (var i = 0; i < url.length; i++) {
    var result = [];
    let items = await scraping(url[i]);
    if (items.length == 0) {
      console.log(`Error : ${url[i]}`);
    } else {
      result = [...result, ...items];
    }

    console.log('complete ...... : ' + result.length);

    console.log(`All result : ${result.length}`);
    const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
    console.log(`Unique result : ${getNotDup.length}`);
    var json = JSON.stringify(getNotDup);
    // console.log(json);
    fs.writeFile(`data/wiki/${i}.json`, json, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
      return true;
    });
  }
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 2000);
    });
  });
}

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
