const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
var fs = require('fs');

async function scraping(url) {
  try {
    var projectTags = ['#pdgroupflickrnasa1'];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(5000);
    // await page.waitForSelector('.photo-list-photo-interaction');
    const data = {
      projectTags,
      url,
      link: [],
      internalTags: [],
    };

    await autoScroll(page);
    // console.log(data.url);
    // await page.screenshot({
    //   path: 'flickr.jpeg',
    //   type: 'jpeg',
    //   fullPage: true,
    //   quality: 50,
    // });
    console.log('Get link');
    let imagelink = [];
    let mainlink = url;
    try {
      imagelink = await page.evaluate((mainlink) => {
        console.log(mainlink);
        return [
          ...document.querySelectorAll(
            '.photo-list-photo-view .photo-list-photo-interaction .overlay'
          ),
        ].map((a) => {
          let item = a.getAttribute('href');
          return `https://www.flickr.com${item}`;
        });
      }, mainlink);
      // const imagelink = await page.evaluate(
      //   `[...document.querySelectorAll('.photo-list-photo-interaction a')].map(a => ${url}a.getAttribute('href'))`
      // );
    } catch (error) {
      console.log(error);
    }
    data.link.push(...imagelink);
    console.log('done');

    await browser.close();
    return data.link;
  } catch (error) {
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var i = 1;
  var result = [];

  while (i <= 4) {
    var url = `https://www.flickr.com/photos/153161295@N04/page${i}`;
    let items = await scraping(url);
    if (items.length == 0) {
      console.log(`Error : ${url}`);
    } else {
      result = [...result, ...items];
    }

    console.log('complete ...... : ' + result.length);
    i++;
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  // console.log(json);
  fs.writeFile('data/flickr/under100/Bogdan Krawczyk.json', json, function (err) {
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
main();
