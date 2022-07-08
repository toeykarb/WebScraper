const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
const { stockphotoTags, IMAGES_EXTENSION, splitText } = require('./utils');
const domains_in_blacklist = [
  'cm.g.doubleclick.net',
  'ssum-sec.casalemedia.com',
  'pagead2.googlesyndication.com',
  'www.googletagservices.com',
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
];
(async (url = 'https://www.flickr.com/photos/elmsn/52105268831/', config = {}) => {
  const requests_blocked = [];
  var projectTags = ['#pdgroupflickrnasa1'];
  var internalTags = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', (consoleObj) => console.log(consoleObj.text()));

  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  await page.goto(url);

  await page.waitForTimeout(5000);
  const data = {
    projectTags,
    url,
    tags: [],
    internalTags: [],
  };

  // await page.waitForSelector(".auto-size .sizes");
  // await page.screenshot({
  //   path: "test.jpeg",
  //   type: "jpeg",
  //   fullPage: true,
  //   quality: 50,
  // });
  // console.log("Get Image Link");
  // data.imageLink = await page.evaluate(() => {
  //   var link;
  //   var checkImagelink = document.querySelector(
  //     ".auto-size .sizes .Original a"
  //   );
  //   var metatag = document.querySelector(`[property='og:image']`);
  //   if (checkImagelink) {
  //     link = checkImagelink.getAttribute("href");
  //   } else if (metatag) {
  //     link = metatag.getAttribute("content").split("https:")[1];
  //   }
  //   return link;
  // });
  // if (!data.imageLink) {
  //   console.log(`No image link for ${url} - skip scraping`);
  //   return {
  //     statusCode: 200,
  //     body: {
  //       message: `Image link not present on page - skip scraping  ${url}`,
  //     },
  //   };
  // }

  // if (data.imageLink.startsWith("//")) {
  //   data.imageLink = `https:${data.imageLink}`;
  // }
  // console.log("Get License Text");
  let licenseText = '';
  try {
    licenseText = await page.evaluate(
      "document.querySelector('.photo-license-url') ? document.querySelector('.photo-license-url').innerText.toLowerCase() : ''"
    );
    if (licenseText == '') {
      licenseText = await page.evaluate(
        `document.querySelector('[rel="license"]') ? document.querySelector('[rel="license"]').innerText.toLowerCase() : ''`
      );
    }
  } catch (error) {
    console.log(error);
  }
  if (projectTags.some((str) => str.includes('nasa'))) {
    data.isCC0 =
      licenseText.includes('creative commons cc0') ||
      licenseText.includes('creative commons zero') ||
      licenseText.includes('public domain') ||
      licenseText.includes('united states government work') ||
      licenseText.includes('no known copyright restrictions');
    data.internalTags.push('#test1');
  } else {
    data.isCC0 =
      licenseText.includes('creative commons cc0') ||
      licenseText.includes('creative commons zero') ||
      licenseText.includes('public domain') ||
      licenseText.includes('united states government work');
    data.internalTags.push('#test2');
  }

  data.internalTags.push(
    `#${licenseText
      .trim()
      .toLowerCase()
      .replace(new RegExp('[^a-z0-9]', 'gi'), '')
      .replace(new RegExp(' ', 'gi'), '')
      .trim()}`
  );
  if (data.isCC0) {
    data.internalTags.push('#nolicenseissue');

    if (data.internalTags.includes('#unitedstatesgovernmentwork')) {
      data.tags.push('U.S. government work');
    }
  } else {
    data.internalTags.push('#licenseissue');
  }
  console.log(licenseText);
  console.log(data.internalTags);
  // Get author tags and link
  console.log('Get Author Link');
  let rawAuthorLink = '';
  let rawAuthorText = '';
  try {
    rawAuthorLink = await page.evaluate(
      "document.querySelector('.attribution-info a.owner-name') ? document.querySelector('.attribution-info a.owner-name').getAttribute('href') : ''"
    );
    rawAuthorText = await page.evaluate(
      "document.querySelector('.attribution-info .owner-name').innerText"
    );
  } catch (error) {
    console.log(error);
  }
  if (rawAuthorLink && rawAuthorLink.startsWith('/')) {
    rawAuthorLink = `https://www.flickr.com${rawAuthorLink}`;
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
  console.log('data.authorTags', data.authorTags);
  // console.log("Get Description");
  // data.description = "";
  // data.description_more = "";
  // try {
  //   const descriptionSelector = Array.isArray(config.descriptionSelector)
  //     ? config.descriptionSelector
  //     : [".meta-field.photo-desc"];

  //   const descriptions = [];
  //   for (let index = 0; index < descriptionSelector.length; index += 1) {
  //     const text = await page.evaluate(
  //       `document.querySelector('${descriptionSelector[index]}') && document.querySelector('${descriptionSelector[index]}').innerText`
  //     );
  //     if (
  //       text &&
  //       text.length &&
  //       (text.trim().length < 10 || text.trim().includes(" "))
  //     ) {
  //       descriptions.push(text);
  //     }
  //   }

  //   const description = descriptions.join("\n");

  //   data.description =
  //     description && description.length
  //       ? description.replace(new RegExp("\\n", "gi"), "<br/>")
  //       : "";
  //   const descriptionLink = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Flickr</a>`;
  //   if (data.description && data.description.trim().length) {
  //     data.description = data.description.trim().endsWith(".")
  //       ? `${data.description.trim()} ${descriptionLink}`
  //       : `${data.description.trim()}. ${descriptionLink}`;
  //   } else {
  //     data.description = descriptionLink;
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
  // const warningTag = stockphotoTags.some(
  //   (substring) =>
  //     data.description.toLowerCase().includes(substring.toLowerCase()) ||
  //     data.description.includes("AP")
  // );
  // if (warningTag) {
  //   data.internalTags.push("#licensewarning");
  // }
  // const descriptionValue = splitText(data.description);

  // data.description = descriptionValue.description;
  // data.description_more = descriptionValue.descriptionMore;

  // console.log("Get ArticleId");
  // data.articleId = url.replace("://", "").split("/")[3];
  // if (!parseInt(data.articleId, 10)) {
  //   console.log(
  //     `incorrect articleId ${data.articleId} for ${url} - skip scraping`
  //   );
  //   return {
  //     statusCode: 200,
  //     body: {
  //       message: `Image link not present on page - skip scraping  ${url}`,
  //     },
  //   };
  // }

  // // // -------------------------------------------------------------------------------------------
  // // Get tags
  // // Warning: From here chrome is not on the main URL.

  // console.log("Get tags");
  // try {
  //   const tags = await page.evaluate(
  //     "[...document.querySelectorAll('.tags-list a:not(.remove-tag)')].map(a => a.innerText.trim().toLowerCase())"
  //   );

  //   if (Array.isArray(tags)) {
  //     if (!data.internalTags.includes("#licensewarning")) {
  //       var joinTags = tags.join(" ");
  //       const checkTags = stockphotoTags.some(
  //         (substring) =>
  //           joinTags.toLowerCase().includes(substring.toLowerCase()) ||
  //           joinTags.includes("AP")
  //       );
  //       if (checkTags) {
  //         data.internalTags.push("#licensewarning");
  //       }
  //     }

  //     data.tags.push(...tags);
  //   }
  // } catch (error) {
  //   console.log(error);
  // }

  // console.log(data.tags);
  await browser.close();
})();
