// @ts-nocheck
const probe = require("probe-image-size");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const postToImageService = require("./image-template-service");

const downloadFile = require("../functions/download-file");
const { IMAGES_EXTENSION } = require("../functions/utils");
const putToS3 = require("../functions/put-to-s3");
const checkImageExists = require("../functions/check-image-exists");
const { getCatalogStoragePath, CATALOG_IDS } = require("../constants/catalogs");
const puppeteer = require("puppeteer");

const sqs = new AWS.SQS({ region: "ap-southeast-1" });

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 200;
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

const sendTemplateToAWS = async (data) => {
  const environment = process.env.DOCKER_ENVIRONMENT;

  const [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);
  const imageExtension = imageMetadata.contentType.split("/").pop().toLowerCase();
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    return {
      status: false,
      body: {
        message: `Image link not present on page - skip scraping  ${data.imageLink}`,
      },
    };
  }
  const environmentFileName = environment !== "prod" ? `${environment}-` : "";
  data.imageName = `creativemarket_template_${data.articleId}${environmentFileName}.${imageExtension}`;

  const imageKey = `${getCatalogStoragePath(CATALOG_IDS.TEAM, "files")}/${data.imageName}`;
  // Check if the image file has already been uploaded.
  const imageExists = await checkImageExists(data.imageName, imageKey);
  if (imageExists) {
    console.log(
      `Image for article [${data.articleId}] already exists, skip scraping - ${data.imageLink} `
    );
    return {
      status: true,
      message: `Image for article [${data.articleId}] already exists, skip scraping - ${data.imageLink} `,
    };
  }
  // Put to S3
  console.log("Put image to s3");

  const image = await putToS3(imageBuffer, imageKey, imageMetadata);
  data.imageDimensions = await probe.sync(imageBuffer);
  await postToImageService({
    ...data,
    imageS3Key: image.s3Key,
    imageSize: image.filesize,
  });

  return {
    status: true,
    body: {
      ...data,
    },
  };
};

async function scrapeCreativeMarketTemplate() {
  var creativeMarketTemplate = [];
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
  });
  const page = await browser.newPage();
  const url = ["https://creativemarket.com/Glanz/2670595-Country-Botanicals-Monograms"];
  try {
    for (var index = 0; index < url.length; index++) {
      var counter = 0;
      await page.setCacheEnabled(false);
      await page.goto(url[index], {
        waitUntil: ["networkidle2"],
      });
      // creative market popular for sort by recent on creative website
      // creative market new for sort by recent on creative website
      const data = {
        tags: ["creative market", "graphic", "creative market popular"],
      };
      data.url = url[index];
      var articleId = await page.evaluate(
        "document.querySelector(`[property='og:product_id']`) ? document.querySelector(`[property='og:product_id']`).getAttribute('content') : '';"
      );
      if (articleId.length <= 0) {
        `\x1b[33m\x1b[45m incorrect articleId ${data.articleId} for ${url} - skip scraping \x1b[0m`;

        return {
          statusCode: 200,
          body: {
            message: `Incorrect articleId ${data.articleId} - skip scraping  ${url}`,
          },
        };
      }
      const tags = await page.evaluate(
        "[...document.querySelectorAll('.suggested-searches .sp-pill .sp-pill__text')].map(a => a.innerText.trim().toLowerCase())"
      );
      data.tags.push(...tags);

      const groupTag = `#groupedimagescreativemarket${articleId}`;

      data.tags.push(groupTag);
      // redirect to imagelink page
      await page.click(".gallery__main-image-wrapper");
      await page.waitForSelector(".full-screen-gallery__images img", {
        visible: true,
      });
      await page.waitForTimeout(2000);
      await autoScroll(page);
      await page.waitForTimeout(2000);
      // get imageLink
      creativeMarketTemplate = await page.evaluate(() => {
        var items = [
          ...document.querySelectorAll(".full-screen-gallery__images .gallery-image img"),
        ].map((item) => {
          var imageLink = item.getAttribute("src");
          return imageLink;
        });
        return items;
      }, []);
      if (creativeMarketTemplate.length > 0) {
        // scrape each page from template page
        for (var i = 0; i < creativeMarketTemplate.length; i++) {
          data.titleTag = [];
          if (i == 0) {
            data.titleTag.push("creative market cover");
          }
          data.imageLink = creativeMarketTemplate[i];
          if (!data.imageLink || !data.imageLink.length) {
            return {
              body: {
                message: `Image link missing - skip scraping  ${url[index]}`,
              },
            };
          }
          data.articleId = `${articleId}-${i + 1}`;
          const sendtoScrape = await sendTemplateToAWS(data);
          if (sendtoScrape.status) {
            counter++;
          } else {
            return sendtoScrape;
          }
        }
        if (counter != creativeMarketTemplate.length) {
          console.log(`\x1b[31m\x1b[43m Template missing - ${url[index]} \x1b[0m`);
        }
      } else {
        console.log(`\x1b[31m\x1b[43m Not have template page - ${url[index]} \x1b[0m`);
      }
    }
  } catch (err) {
    console.log(err);
    console.log(`\x1b[31m\x1b[43m Template error - ${url[index]} \x1b[0m`);
  } finally {
    await browser.close();
  }
}
scrapeCreativeMarketTemplate();
