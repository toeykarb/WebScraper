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
IGNORE_WORD = [
  'which',
  'what',
  'where',
  'when',
  'how',
  'many',
  'much',
  'be',
  'this',
  'will',
  'or',
  'in',
  'on',
  'at',
  'the',
  'of',
  'is',
  'am',
  'are',
  'and',
  'by',
  'for',
  'you',
  'we',
  'they',
  'it',
  'its',
  'de',
  'la',
  'par',
  'le',
  'an',
  'to',
  'if',
  'cannot',
  'with',
  'over',
  'negro',
  'negroes',
  'negros',
  'nigger',
  'fuck',
  'shit',
  'slut',
];

const onlyUnique = (value, index, self) => self.indexOf(value) === index;

(async (url = 'https://collections.artsmia.org/art/32467/chrysanthemum-qi-baishi', config = {}) => {
  const requests_blocked = [];
  var projectTags = ['#pdgroupflickrnasa1'];
  var internalTags = [];

  const browser = await puppeteer.launch({ headless: false, devtools: false });
  const page = await browser.newPage();

  // page.on('console', (consoleObj) => console.log(consoleObj.text()));

  //await page.setViewport({ width: 2000, height: 1200, deviceScaleFactor: 1 });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10 * 1000 });
  console.log('Start......');
  await page.waitForTimeout(3000);
  let tags = [];
  const data = {
    projectTags,
    url,
    tags: [],
    internalTags: [],
  };
  await page.waitForSelector('#staticImage');

  // try {
  //   await page.waitForSelector('.link-bar [href]');
  //   data.imageLink = await page.evaluate(
  //     "document.querySelector('.link-bar [download]') ? document.querySelector('.link-bar [download]').getAttribute('href') : ''"
  //   );
  // } catch (err) {
  //   const checkTimeout = String(err).includes('timeout 30000ms');
  //   if (checkTimeout) {
  //     console.log(`Image link timeout - ${url}`);
  //     return {
  //       statusCode: 200,
  //       body: {
  //         message: `Image link timeout - ${url}`,
  //       },
  //     };
  //   }
  //   console.log(`No image link - skip scraping - ${url}`);
  //   return {
  //     statusCode: 200,
  //     body: {
  //       message: `No image link - skip scraping  ${url}`,
  //     },
  //   };
  // }
  data.imageLink = await page.evaluate(
    "document.querySelector('#staticImage img') ? document.querySelector('#staticImage img').getAttribute('src') : ''"
  );
  if (data.imageLink.length) {
    data.imageLink = data.imageLink.replace('/800/', '/full/');
  } else {
    console.log(`No image link - skip scraping - ${url}`);
    // return {
    //   statusCode: 200,
    //   body: {
    //     message: `No image link - skip scraping  ${url}`,
    //   },
    // };
  }
  console.log('imageLink', data.imageLink);
  let { rawAuthorLink, rawAuthorText } = await page.evaluate(() => {
    let rawAuthorLink = '';
    let rawAuthorText = '';
    var authorIndex = [...document.querySelectorAll('.detail-row *')].findIndex((node) => node.textContent.trim() === 'Artist');
    console.log();
    if (authorIndex !== -1) {
      const openAuthorTab = [...document.querySelectorAll('.detail-row *')][authorIndex];

      if (openAuthorTab) {
        openAuthorTab.click();
        rawAuthorLink = document.querySelector('.more-results-link')
          ? document.querySelector('.more-results-link').parentNode.getAttribute('href')
          : '';
        if (rawAuthorLink.length) {
          rawAuthorText = [...document.querySelectorAll('.detail-row *')][authorIndex + 1].textContent;
        }
      }
    }
    return {
      rawAuthorLink,
      rawAuthorText,
    };
  });
  if (rawAuthorLink && rawAuthorLink.startsWith('/')) {
    rawAuthorLink = `https://collections.artsmia.org${rawAuthorLink}`;
  }
  tags.push(rawAuthorText);
  rawAuthorText = rawAuthorText.length
    ? [`#${rawAuthorText.trim().toLowerCase().replace(new RegExp('[^a-z0-9]', 'gi'), '').replace(new RegExp(' ', 'gi'), '').trim()}`]
    : ['#noauthor'];
  console.log('rawAuthorLink', rawAuthorLink);
  console.log('rawAuthorText', rawAuthorText);
  data.internalTags.push(...rawAuthorText);

  let metaData = await page.evaluate(() => {
    let metaDataSource = '';
    var metaDataIndex = [
      // @ts-ignore
      ...document.querySelectorAll('.detail-row *'),
    ].findIndex((node) => node.textContent.trim() === 'Metadata');
    if (metaDataIndex !== -1) {
      // @ts-ignore
      const openMetaDataTab = [...document.querySelectorAll('.detail-row *')][metaDataIndex];

      if (openMetaDataTab) {
        openMetaDataTab.click();
        metaDataSource = document.querySelector('.detail-extra code') ? document.querySelector('.detail-extra code').innerHTML : '';
      }
    }
    return metaDataSource;
  });
  // var metaData = '';
  // metaData = await page.evaluate(() => {
  //   let metaDataSource = '';
  //   var openMetaDataTab = document.querySelector('.artwork-detail .metadata .detail-content');

  //   if (openMetaDataTab) {
  //     openMetaDataTab.click();
  //     console.log(document.querySelector('.artwork-detail .metadata .detail-extra code'));
  //     metaDataSource = document.querySelector('.artwork-detail .metadata .detail-extra code')
  //       ? document.querySelector('.artwork-detail .metadata .detail-extra code').textContent
  //       : '';
  //   }
  //   return metaDataSource;
  // });
  if (!metaData.length) {
    var imageId = url.replace('://', '').split('/')[2];
    var metadataUrl = `https://search.artsmia.org/id/${imageId}`;
    var metaDataFetch = await getMetadata(metadataUrl);
    console.log(metaDataFetch);
    if (metaDataFetch.length) {
      metaData = metaDataFetch;
    }
  }
  console.log('metaData', metaData);
  if (metaData.length) {
    //// check CC0 ////
    const metaDataObj = JSON.parse(metaData);
    let licenseText = metaDataObj.rights_type ? metaDataObj.rights_type : '';
    data.isCC0 =
      licenseText.includes('Public Domain') || licenseText.includes('No Copyright–United States') || licenseText.includes('No Known Copyright');
    if (data.isCC0) {
      data.internalTags.push('#mia');
      data.internalTags.push('#nolicenseissue');
      data.internalTags.push(
        `#${licenseText.trim().toLowerCase().replace(new RegExp('[^a-z0-9]', 'gi'), '').replace(new RegExp(' ', 'gi'), '').trim()}`
      );
    } else {
      console.log(`CC0 ignored - ${url}`);
    }
    console.log('licenseText', licenseText);
    //// articled Id ////
    data.articleId = metaDataObj.id ? metaDataObj.id : '';
    if (!parseInt(data.articleId, 10)) {
      console.log(`incorrect articleId ${data.articleId} for ${url} - skip scraping`);
    }
    console.log('articleId', data.articleId);
    //// Get tag ////
    let dateTag = metaDataObj.dated ? metaDataObj.dated : '';
    if (dateTag.length) {
      tags.push(dateTag);
      dateTag = `#${dateTag.trim().toLowerCase().replace(new RegExp('[^a-z0-9]', 'gi'), '').replace(new RegExp(' ', 'gi'), '').trim()}`;

      data.internalTags.push(dateTag);
    } else {
      console.log('test');
    }
    // let artistTag = metaDataObj.artist ? metaDataObj.artist : '';
    // if (artistTag?.length) {
    //   artistTag = `#${artistTag.trim().toLowerCase().replace(new RegExp('[^a-z0-9]', 'gi'), '').replace(new RegExp(' ', 'gi'), '').replace(new RegExp(' ', 'gi'), '').trim()}`;

    //   data.internalTags.push(dateResult);
    // }

    // let titleTag = (await metaDataObj.title) ? metaDataObj.title.split(',') : '';
    let titleTags = (await metaDataObj.title) ? metaDataObj.title : '';
    let titleTag = [];
    if (titleTags.length) {
      if (titleTags.includes(',')) {
        titleTag = titleTags.split(',');
      } else {
        titleTag = titleTags.split(' ');
      }
      titleTag.map((titleTag) => {
        data.tags.push(titleTag.trim().toLowerCase().replace(new RegExp('[^a-z0-9_ ]', 'gi'), ' '));
      });
    }

    let mediumTags = (await metaDataObj.medium) ? metaDataObj.medium.split(',') : '';
    mediumTags.map((mediumTag) => {
      data.tags.push(mediumTag.trim().toLowerCase().replace(new RegExp('[^a-z0-9_ ]', 'gi'), ' '));
    });
    let classificationTag = (await metaDataObj.classification) ? metaDataObj.classification : '';
    tags.push(classificationTag);

    let objectName = (await metaDataObj.object_name) ? metaDataObj.object_name : '';
    tags.push(objectName);

    let continent = (await metaDataObj.continent) ? metaDataObj.continent : '';
    tags.push(continent);

    let country = (await metaDataObj.country) ? metaDataObj.country : '';
    tags.push(country);

    let style = (await metaDataObj.style) ? metaDataObj.style : '';
    tags.push(style);

    let nationality = (await metaDataObj.nationality) ? metaDataObj.nationality : '';
    tags.push(nationality);

    let lifeDate = (await metaDataObj.life_date) ? metaDataObj.life_date : '';
    tags.push(lifeDate);

    let provenance = (await metaDataObj.provenance) ? metaDataObj.provenance : '';
    tags.push(provenance);

    let department = (await metaDataObj.department) ? metaDataObj.department : '';
    tags.push(department);

    tags.push(licenseText);

    if (metaDataObj.description.length) {
      let keywordDescription = metaDataObj.description.replace(new RegExp('[^a-z0-9]', 'gi'), ' ').split(' ');
      keywordDescription = keywordDescription.map((element) => element.toLowerCase().trim());
      const wordToDeleteSet = new Set(IGNORE_WORD);
      keywordDescription = keywordDescription.filter((word) => {
        //console.log(word, word.length);
        if (word.length > 2) {
          return !wordToDeleteSet.has(word);
        }
        return false;
      });

      data.tags.push(...keywordDescription);
    }

    tags.map((tag) => {
      if (tag.length) {
        data.tags.push(tag.trim().toLowerCase().replace(new RegExp('[^a-z0-9_ ]', 'gi'), ' '));
      }
    });
    data.tags = [...new Set(data.tags)];
    // await data.tags.push(...tags.map((a) => a.trim().toLowerCase()));

    console.log('internaltags', data.internalTags);
    console.log('tags', data.tags);

    data.description = (await metaDataObj.description) ? metaDataObj.description : metaDataObj.title;

    // if (data.description.length) {
    //   data.description = (await metaDataObj.title) ? metaDataObj.title : '';
    // }
    console.log('description', data.description);
  } else {
    console.log(`Not found metadata - ${url}`);
  }
  console.log('articleId', data.articleId);
  // await page.screenshot({
  //   path: 'mia.jpeg',
  //   type: 'jpeg',
  //   fullPage: true,
  //   quality: 50,
  // });
  let imageBuffer = null;
  let imageMetadata = null;
  let imageExtension = null;
  try {
    [imageBuffer, imageMetadata, imageExtension] = await downloadFile(data.imageLink);
  } catch (err) {
    console.log('Error fetchhhhhhhh');
    console.log(err);
  }
  console.log(imageBuffer);
  await page.waitForTimeout(2000);
  await browser.close();
})();

const getMetadata = async (url) => {
  // @ts-ignore
  let data = '';
  console.log(url);
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      data = await response.text();
      // handle data
    }

    return data;
  } catch (err) {
    console.log('test');
    console.log(err);
    r;
  }
};

const downloadFile = async (url) => {
  console.log(url);

  const response = await fetch(url);
  console.log(response);
  const contentType = await response.headers.get('content-type');

  const buffer = 'test';

  const imageType = 'testsetstsetst';
  // if (!imageType?.ext) {
  //   throw new Error('Invalid image');
  // }
  const imageExtension = 'testtestsetst';
  return [buffer, { contentType }, imageExtension];
};
