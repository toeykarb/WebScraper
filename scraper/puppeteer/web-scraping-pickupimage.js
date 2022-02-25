const puppeteer = require('puppeteer');
const { IMAGES_EXTENSION, stockphotoTags } = require('./utils');
const FormData = require('form-data');
const fileType = require('file-type');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cookie = require('cookie');

const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: '',
  articleId: null,
};
(async (config = {}) => {
  const browser = await puppeteer.launch();
  //const browser = await puppeteer.launch({ headless: false });
  //const loginpage = await browser.newPage();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 600,
    deviceScaleFactor: 1,
  });
  await page.goto(
    'https://pickupimage.com/auth/myphotos.cfm?CFID=0c987c6e-32c5-4460-be28-c47b8ebf7de9&CFTOKEN=0',
    { waitUntil: 'networkidle0' }
  );
  var checkLogin = await page.evaluate(
    "document.querySelector(`.top-bar-acc [href='/auth']`) ? document.querySelector(`.top-bar-acc [href='/auth']`).innerText.toLowerCase() : ''"
  );
  console.log(checkLogin);
  if (checkLogin !== 'my page') {
    await page.type('#email', 'pickupimagetest');
    await page.type('#passwd', 'test1234@');
    await page.click('#place_order');
    console.log('login success');
    await page.waitForTimeout(3000);
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });
    await page.waitForTimeout(3000);
  }

  const allCookies = await page._client.send('Network.getAllCookies');
  const pageCookies = allCookies.cookies.filter((c) => c.domain.includes('pickupimage.com'));
  // Open the page as a logged-in user
  var url = 'https://pickupimage.com/free-photos/Cantaloupe-melons-background/2357217';
  await page.goto(url, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });
  await page.waitForTimeout(3000);

  var sourceCollection = '';
  sourceCollection = await page.evaluate(() => {
    const sourceCollectionIndex = [
      // @ts-ignore
      ...document.querySelectorAll('.fw-col-sm-41 table tbody tr *'),
    ].findIndex((node) => node.textContent.trim() === 'L');
    const textSource =
      sourceCollectionIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll('.fw-col-sm-41 table tbody tr *')][
            sourceCollectionIndex + 6
          ].getAttribute('href')
        : '';
    return textSource;
  });
  if (sourceCollection.length) {
    data.imageLink = `https://pickupimage.com/${sourceCollection}`;
  }
  console.log(data.imageLink);
  const imageExtensions = data.imageLink.split('.').pop().toLowerCase();
  console.log(imageExtensions);
  const [imageBuffer, imageMetadata, imageExtension] = await downloadPickupimageFile(
    data.imageLink,
    pageCookies
  );

  let licenseText = '';
  try {
    licenseText = await page.evaluate(
      "document.querySelector('.details_box .section_head') ? document.querySelector('.details_box .section_head').innerText.toLowerCase():''"
    );
  } catch (error) {
    console.log(error);
  }
  data.isCC0 = licenseText.includes('cc0');

  if (data.isCC0) {
    data.internalTags.push('#nolicenseissue');
    //console.log(data.internalTags);
    console.log(data.isCC0);
  } else {
    console.log(data.isCC0);
  }

  // Get author tags and link
  let rawAuthorLink = '';
  let rawAuthorText = '';
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector(`.fw-col-sm-41 a`) ? document.querySelector(`.fw-col-sm-41 a`).getAttribute('href') : ''"
    );
  } catch (error) {
    console.log(error);
  }
  data.authorLink =
    rawAuthorLink && rawAuthorLink.length ? `https://pickupimage.com${rawAuthorLink}` : '';
  console.log(data.authorLink);
  rawAuthorText = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink.split('uname=')[1] : '';

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
  console.log(data.authorTags);

  data.articleId = url.replace('://', '').split('/')[3];
  console.log(data.articleId);

  data.description = '';
  data.description_more = '';
  data.description = await page.evaluate(
    `document.querySelector('.fw-col-sm-8 .margin20') ? document.querySelector('.fw-col-sm-8 .margin20').innerText : ''`
  );
  data.description_more = `View public domain image source <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">here</a>`;
  console.log(data.description);
  console.log(data.description_more);

  console.log('Get tags');
  try {
    const tags =
      (await page.evaluate(
        `[...document.querySelectorAll('.kw_title')].map(a => a.innerText.trim().toLowerCase())`
      )) || [];

    data.tags.push(...tags);
  } catch (error) {
    console.log(error);
  }
  console.log(data.tags);

  // await page.goto(
  //   'https://pickupimage.com/auth/myphotos.cfm?CFID=0c987c6e-32c5-4460-be28-c47b8ebf7de9&CFTOKEN=0',
  //   {
  //     waitUntil: ['networkidle0', 'domcontentloaded'],
  //   }
  // );
  // await page.waitForTimeout(3000);
  // await page.click('.want');
  // console.log('logout');

  await page.screenshot({
    path: 'pickupimage.jpeg',
    type: 'jpeg',
    fullPage: true,
    quality: 50,
  });
  console.log('done');
  await browser.close();
})();

const downloadPickupimageFile = async (url, pageCookies) => {
  const cookieString = pageCookies
    .map(({ name, value, ...options }) => {
      delete options.expires;
      return cookie.serialize(name, value, options);
    })
    .join(';');
  //console.log(cookieString);
  // @ts-ignore
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      cookie: cookieString,
    },
  });
  const contentType = await response.headers.get('content-type');
  console.log(contentType);
  const buffer = await response.buffer();
  console.log(buffer);
  const imageType = await fileType.fromBuffer(buffer);
  console.log(imageType);
  if (!imageType?.ext) {
    throw new Error('Invalid image');
  }
  const imageExtension = imageType.ext;
  // @ts-ignore
  return [buffer, { contentType }, imageExtension];
};
