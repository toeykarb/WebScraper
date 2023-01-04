const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { imageExtension, stockphotoTags } = require("./utils");
const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};

const nanoid = () => {
  const firstEntropy = Math.floor(Math.random() * 46656);
  const secondEntropy = Math.floor(new Date().getTime());
  const firstPart = `000${firstEntropy.toString(36)}`.slice(-3);
  const secondPart = `000${secondEntropy.toString(36)}`.slice(-4);
  return `${firstPart}${secondPart}`;
};
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        const scrollableSection = document.querySelector(
          ".full-screen-gallery__image-scroll-container"
        );
        scrollableSection.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollableSection.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
const scrapeCreativeMarketTemplate = async (data, articleId, page) => {
  var creativeMarketTemplate = [];
  await page.click(".gallery__main-image-wrapper");
  // await page.goto(`${url}#fullscreen`, {
  //   waitUntil: ["networkidle0"],
  // });
  await page.waitForSelector(".full-screen-gallery__images img", {
    visible: true,
  });
  await page.waitForTimeout(2000);
  await autoScroll(page);
  await page.waitForTimeout(2000);

  creativeMarketTemplate = await page.evaluate(() => {
    var items = [
      ...document.querySelectorAll(".full-screen-gallery__images .gallery-image img"),
    ].map((item) => {
      var imageLink = item.getAttribute("src");
      return imageLink;
    });
    return items;
  }, []);
  console.log("creativeMarketTemplate", creativeMarketTemplate);
  console.log("creativeMarketTemplate length", creativeMarketTemplate.length);
  if (creativeMarketTemplate.length > 0) {
    console.log(true);
    for (var i = 0; i < creativeMarketTemplate.length; i++) {
      data.articleId = `${articleId}-${i + 1}`;
      data.imageLink = creativeMarketTemplate[i];
      // console.log(data);
    }
    return true;
  } else {
    console.log(false);
    return false;
  }
};
(async (config = {}) => {
  const url = ["https://creativemarket.com/typeandgraphicslab/2886137-40-Geometric-Frames"];
  for (var index = 0; index < url.length; index++) {
    const browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
    });

    const page = await browser.newPage();
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.goto(url[index], {
      waitUntil: ["networkidle2"],
    });
    const data = {
      tags: ["creative market", "graphic", "creative market popular"],
    };
    const page2 = await browser.newPage();
    await page2.goto(`${url[index]}#fullscreen`, {
      waitUntil: ["networkidle2"],
    });
    await page.screenshot({
      path: "creativemarket-designset.jpeg",
      type: "jpeg",
      fullPage: true,
      quality: 50,
    });
    data.url = url[index];
    var articleId = await page.evaluate(
      "document.querySelector(`[property='og:product_id']`) ? document.querySelector(`[property='og:product_id']`).getAttribute('content') : '';"
    );

    const tags = await page.evaluate(
      "[...document.querySelectorAll('.suggested-searches .sp-pill .sp-pill__text')].map(a => a.innerText.trim().toLowerCase())"
    );
    data.tags.push(...tags);

    const groupTag = `#groupedimages${nanoid()}`;
    data.groupTag = groupTag;
    const sendtoScrape = await scrapeCreativeMarketTemplate(data, articleId, page);

    console.log("Done");

    await browser.close();
  }
})();
