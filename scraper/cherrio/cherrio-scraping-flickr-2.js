const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
var fs = require("fs");

async function scraping(url) {
  // try {
  var projectTags = ["#pdgroupflickrnasa1"];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (consoleObj) => console.log(consoleObj.text()));

  await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
  await page.goto(url);

  await page.waitForTimeout(5000);
  // await page.waitForSelector('.photo-list-photo-interaction');
  const data = {
    projectTags,
    url,
    link: [],
    internalTags: [],
  };

  const cssSelector = ".infinite-scroll-load-more button";
  let getlink = await getImageLink(page);
  data.link.push(...getlink);
  let loadMoreVisible = await isElementVisible(page, cssSelector);
  while (loadMoreVisible) {
    console.log("loadMoreVisible", loadMoreVisible);

    await page.click(cssSelector).catch(() => {});
    let getlink2 = await getImageLink(page);
    loadMoreVisible = await isElementVisible(page, cssSelector);
    data.link.push(...getlink2);
  }

  // console.log('Get link');
  // let imagelink = [];
  // let mainlink = url;
  // try {
  //   imagelink = await page.evaluate((mainlink) => {
  //     console.log(mainlink);
  //     return [
  //       ...document.querySelectorAll(
  //         '.photo-list-photo-view .photo-list-photo-interaction .overlay'
  //       ),
  //     ].map((a) => {
  //       let item = a.getAttribute('href');
  //       return `https://www.flickr.com${item}`;
  //     });
  //   }, mainlink);
  // } catch (error) {
  //   console.log(error);
  // }

  console.log("done");

  await browser.close();
  return data.link;
  // } catch (error) {
  //   console.log('Error :', url);
  //   return [];
  // }
}

async function main() {
  var i = 1;
  var result = [];

  while (i <= 87) {
    var url = `https://www.flickr.com/photos/lexware-mountainbike-team/page${i}`;
    let items = await scraping(url);
    if (items.length == 0) {
      console.log(`Error : ${url}`);
    } else {
      result = [...result, ...items];
    }

    console.log("complete ...... : " + result.length);
    i++;
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  // console.log(json);
  fs.writeFile("data/flickr/under100/lexware-mountainbike-team.json", json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
    return true;
  });
}

const getImageLink = async (page) => {
  console.log("Get link");
  let imagelink = [];

  try {
    imagelink = await page.evaluate(() => {
      return [
        ...document.querySelectorAll(
          ".photo-list-photo-view .photo-list-photo-interaction .overlay"
        ),
      ].map((a) => {
        let item = a.getAttribute("href");
        return `https://www.flickr.com${item}`;
      });
    });
  } catch (error) {
    console.log(error);
  }
  return imagelink;
};

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
  await page.waitForSelector(cssSelector, { visible: true, timeout: 2000 }).catch(() => {
    visible = false;
  });
  return visible;
};
main();
