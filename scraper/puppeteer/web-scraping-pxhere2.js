const puppeteer = require('puppeteer');
const { IMAGES_EXTENSION, stockphotoTags, CC0_TAGS } = require('./utils');
const { splitText } = require('./split-text');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const url = 'https://pxhere.com/en/photo/1587285';
const data = {
  tags: [],
  internalTags: [],
};

(async (config = {}) => {
  blacklistedDomains = [
    'cm.g.doubleclick.net',
    'ssum-sec.casalemedia.com',
    'tpc.googlesyndication.com',
    'googleads.g.doubleclick.net',
    'www.google-analytics.com',
    'www.googletagservices.com',
    'cms.quantserve.com',
    'rtb.openx.net',
    'image6.pubmatic.com',
    'pixel.rubiconproject.com',
    'cc.adingo.jp',
    'unitedstateslibraryofcongress.demdex.net',
    'prebid.adnxs.com',
    'ib.adnxs.com',
    'securepubads.g.doubleclick.net',
    // new domains 26 oct 21
    'match.prod.bidr.io',
    'x.bidswitch.net',
    's.amazon-adsystem.com',
    'px.ads.linkedin.com',
    'resources.infolinks.com',
    'ads.pubmatic.com',
    'prg.smartadserver.com',
    't.flickr.com',
  ];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    if (blacklistedDomains.includes(new URL(interceptedRequest.url()).host)) {
      console.log(`blocked ${interceptedRequest.url()}`);
      interceptedRequest.abort();
    } else {
      interceptedRequest.continue();
    }
  });
  page.on('console', (consoleObj) => console.log(consoleObj.text()));
  await page.goto(url, { timeout: 5 * 1000 });
  await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });

  console.log('Start.....');
  try {
    await page.waitForSelector('.hub-fleximages-related .item', {
      timeout: 3000,
      visible: true,
    });
  } catch (error) {
    // meh..
  }

  // await page.waitForSelector();
  const cookieCloseButton = await page.$('.policy-ok');
  if (cookieCloseButton) {
    cookieCloseButton.click();
    await page.waitForTimeout(1000);
  }
  // var imageLink = await page.evaluate(() => {
  //   var imageResource = '';
  //   // const results = document.querySelectorAll('.current-page-photo');
  //   const results = document.querySelector('.hub-photo-modal .current-page-photo');
  //   console.log(results);
  //   if (results) {
  //     imageResource = results.getAttribute('href');
  //   }
  //   return imageResource;
  // });
  try {
    var imageLink = await page.evaluate(
      "document.querySelector(`.hub-photo-modal .current-page-photo`) ? document.querySelector(`.hub-photo-modal .current-page-photo`).getAttribute('href') : ''"
    );
  } catch (error) {
    console.log(error);
  }
  console.log('ImageLink ', imageLink);
  if (!imageLink.length) {
    console.log(imageLink);
    console.log('No image link - skip scraping');
    try {
      await page.screenshot({
        path: 'test2.jpeg',
        type: 'jpeg',
        fullPage: true,
        quality: 50,
      });
    } catch (e) {
      console.log(`Failed to take the screenshot for ${url}`);
      throw e;
    }
  } else {
    console.log('passs');
  }

  try {
    const tags =
      (await page.evaluate(
        "[...document.querySelectorAll('.photo-tagsinfo-main a')].map(a => a.innerText.trim().toLowerCase())"
      )) || [];
    const hottags =
      (await page.evaluate(
        "[...document.querySelectorAll('.hub-tag-cloud a')].map(a => a.innerText.trim().toLowerCase())"
      )) || [];
    data.tags.push(...new Set([...hottags, ...tags]));
  } catch (error) {
    console.log(error);
  }
  console.log('tags ', data.tags);
  await browser.close();
  return true;
})();

const downloadFile = async (url) => {
  const encodedUrl = new URL(url);
  console.log(`Downloading: ${encodedUrl.href}`);
  // @ts-ignore
  const result = await fetch(encodedUrl.href)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      if (response.status === 520) {
        return Promise.reject(
          new Error(
            `Failed to fetch, blocked by cloudflare ${response.url}: ${response.status} ${response.statusText}`
          )
        );
      }
      return Promise.reject(
        new Error(`Failed to fetch ${response.url}: ${response.status} ${response.statusText}`)
      );
    })
    .then(
      /**
       * @param {import('node-fetch').Response} response
       * @return {Promise<[Buffer, {contentType:string}]>}
       */
      (response) => {
        const contentType = response.headers.get('content-type');
        return Promise.all([
          response.buffer(),
          Promise.resolve({
            contentType,
          }),
        ]);
      }
    );
  return result;
};
