const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
const { imageExtension, stockphotoTags } = require('./utils');
const data = {
  projectTags: [],
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
  const browser = await puppeteer.launch({ handless: false });
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
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  //   await page.goto("https://pxhere.com/en/photo/1168447", {
  //     waitUntil: ["networkidle0", "domcontentloaded"],
  //   });
  await page.goto('https://pxhere.com/en/photo/1029609', {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });
  var imageLink = await page.evaluate(() => {
    const results = document.querySelector('.hub-photo-modal .current-page-photo');

    if (results) {
      return results.getAttribute('href');
    }
    return null;
  });
  console.log('ImageLink ', imageLink);
  if (!imageLink || !imageLink.length) {
    console.log(imageLink);
    console.log('No image link - skip scraping');
  } else {
    console.log('passs');
  }

  await browser.close();
})();
