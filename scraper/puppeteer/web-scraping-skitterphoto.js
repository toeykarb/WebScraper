const puppeteer = require('puppeteer');
const FormData = require('form-data');
const fileType = require('file-type');
const cookie = require('cookie');

const downloadSkitterphotoFile = require('../fetch/test-fetch-skitter.js');
const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: '',
  articleId: null,
};
(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  var url = 'https://skitterphoto.com/photos/10249/narrow-street-restaurants-and-bars-tokyo-japan';
  page.on('console', (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  await page.goto(url, {
    timeout: 240000,
    waitUntil: ['domcontentloaded'],
  });
  await page.waitForTimeout(10000);
  const allCookies = await page._client.send('Network.getAllCookies');
  //console.log(allCookies);
  const pageCookies = allCookies.cookies.filter((c) => c.domain.includes('skitterphoto'));

  var { getToken, imageLink } = await page.evaluate(() => {
    const results = [...document.querySelectorAll('.has-sidebar .inline-form')].filter((x) =>
      x.getAttribute('action').toString().endsWith('download')
    );
    if (results && results[0]) {
      const imageLink = results[0].getAttribute('action');
      const getToken = results[0].querySelector('input').getAttribute('value');
      return { getToken, imageLink };
    }
    return null;
  });
  // console.log(getToken);
  // console.log(imageLink);

  // const [buffer, { contentType }, imageExtension] =
  //   await downloadSkitterphotoFile(imageLink, getToken, pageCookies);

  let licenseText = '';
  try {
    licenseText = await page.evaluate(
      `document.querySelector('[rel="license"]').innerText.toLowerCase();`
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes('public domain') || licenseText.includes('cc0');

  if (data.isCC0) {
    data.internalTags.push('#nolicenseissue');
    //data.tags.push(...CC0_TAGS);
  } else {
    return {
      statusCode: 200,
      url: url,
      message: 'CC0 ignored',
    };
  }

  let rawAuthorLink = '';
  let rawAuthorText = '';
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.photographer p a`) ? document.querySelector(`.photographer p a`).getAttribute('href') : ''"
    );

    rawAuthorText = await page.evaluate(
      "document.querySelector(`.photographer p a`)  ? document.querySelector(`.photographer p a`) .innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : '';
  data.authorTags = rawAuthorText.length
    ? [
        `#${rawAuthorText
          .trim()
          .toLowerCase()
          .replace(new RegExp('[^a-z0-9]', 'gi'), '')
          .replace(new RegExp(' ', 'gi'), '')
          .trim()}`,
      ]
    : [];
  console.log(data.authorLink);
  console.log(data.authorTags);

  data.articleId = url.replace('://', '').split('/')[2];
  console.log(data.articleId);
  if (!parseInt(data.articleId, 10)) {
    console.log(`incorrect articleId ${data.articleId} for ${url} - skip scraping`);
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${url}`,
      },
    };
  }
  data.description = '';
  data.description_more = '';
  let descriptions = '';
  try {
    descriptions = await page.evaluate(
      "document.querySelector('.has-sidebar div p strong') ? document.querySelector('.has-sidebar div p strong').innerText : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.description = descriptions;
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  // const warningTag = stockphotoTags.some(
  //   (substring) =>
  //     data.description.toLowerCase().includes(substring.toLowerCase()) ||
  //     data.description.includes("AP")
  // );
  // if (warningTag) {
  //   data.internalTags.push("#licensewarning");
  // }
  console.log(data.description);

  console.log('Get tags');
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('[itemprop="keywords"] .tag')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);
  const [imageBuffer, imageMetadata, imageExtension] = await downloadSkitterphotoFile(
    imageLink,
    getToken,
    pageCookies
  );
  console.log(imageBuffer);
  await browser.close();
})();
