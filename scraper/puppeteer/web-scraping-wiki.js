const puppeteer = require('puppeteer');
const { IMAGES_EXTENSION, stockphotoTags, CC0_TAGS } = require('./utils');
const { splitText } = require('./split-text');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const url = 'https://commons.wikimedia.org/wiki/File:MandelbulbObererTeil_20220112_RGBA8.png';
const data = {
  tags: [],
  internalTags: [],
};

(async (config = {}) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  await page.goto(url, { timeout: 3 * 1000 });

  console.log('Start.....');
  data.imageLink = await page.evaluate(() => {
    const results = document.querySelectorAll('.fullMedia > p > a');
    if (results && results[0]) {
      return results[0].getAttribute('href');
    }
    return null;
  });
  if (!data.imageLink || !data.imageLink.length) {
    console.log(`No image link - skip scraping ${url}`);
  }
  const imageExtension = data.imageLink.split('.').pop().toLowerCase();
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    console.log(`Invalid image extension ${imageExtension} for ${url} - skip scraping`);
    console.log(`Image link not present on page - ${url}`);
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${url}`,
      },
    };
  }
  data.isCC0 = await page.evaluate(
    "var data = ''.concat(document.querySelector('.sourcetemplate') ? document.querySelector('.sourcetemplate').innerText.toLowerCase() : '', ' ', document.querySelector('.licensetpl') ? document.querySelector('.licensetpl').innerText.toLowerCase() : ''); data.includes('creative commons cc0 1.0') || data.includes('creative commons zero') || data.includes('public domain');"
  );

  if (data.isCC0) {
    data.internalTags.push('#nolicenseissue');
    data.internalTags.push('#cc0license');
    data.tags.push(...CC0_TAGS);
  } else {
    console.log(`CC0 ignored - ${url}`);
    return {
      statusCode: 200,
      url: url,
      message: 'CC0 ignored',
    };
  }

  data.sourceLink = await page.evaluate(() => {
    // @ts-ignore
    const links = [...document.querySelectorAll('#fileinfotpl_src + td a')];
    const sourceLink = links[0];
    return sourceLink ? sourceLink.getAttribute('href') : null;
  });
  data.sourceTag = data.sourceLink ? '' : '#nosourcelink';
  if (data.sourceLink && data.sourceLink.startsWith('/')) {
    data.sourceLink = `https://commons.wikimedia.org${data.sourceLink}`;
  }
  if (data.sourceLink) {
    const parsedUrl = new URL(data.sourceLink);
    if (parsedUrl.host.includes('unsplash')) {
      data.sourceTag = '#unsplash';
    } else if (parsedUrl.host.includes('pixabay')) {
      data.sourceTag = '#pixabay';
    } else if (parsedUrl.host.includes('freepik')) {
      data.sourceTag = '#freepik';
    } else if (parsedUrl.host.includes('pexels')) {
      data.sourceTag = '#pexels';
    } else if (parsedUrl.host.includes('wikipedia')) {
      data.sourceTag = '#wikipedia';
    }
  }

  // @ts-ignore
  data.articleId = await page.evaluate(() => window.RLCONF.wgArticleId);

  const imageInfos = await page.evaluate(() => {
    // @ts-ignore
    const fileInfos = [...document.querySelectorAll('.fileinfo-paramfield')];
    return fileInfos.reduce((acc, fileInfo) => {
      if (fileInfo && fileInfo.innerText) {
        const key = fileInfo.innerText;
        try {
          const values = fileInfo.parentNode.querySelectorAll('td');
          const value = values[1].innerText;
          return { ...acc, [key]: value };
        } catch (error) {
          console.log(error);
        }
        try {
          const value = fileInfo.nextSibling.innerText;
          return { ...acc, [key]: value };
        } catch (error) {
          console.log(error);
        }
        return { ...acc };
      }
      return acc;
    }, {});
  });
  console.log('image link', data.imageLink);
  console.log('imageInfos', imageInfos);
  console.log('articleId', data.articleId);

  let defaultDescription = '';
  try {
    defaultDescription = await page.evaluate(
      "var content = document.querySelector('td.description .description.en'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
    );
  } catch (error) {}

  if (!defaultDescription || !defaultDescription.length) {
    try {
      defaultDescription = await page.evaluate(
        "var content = document.querySelector('td.description .description'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
      );
    } catch (error) {}
  }
  if (!defaultDescription || !defaultDescription.length) {
    try {
      defaultDescription = await page.evaluate(
        "var content = document.querySelector('td.description'); content && content.querySelector('span') && content.querySelector('span').remove(); content && content.innerText || '';"
      );
    } catch (error) {}
  }

  data.description = imageInfos['Unsplash description']
    ? imageInfos['Unsplash description']
    : imageInfos['Unsplash title']
    ? imageInfos['Unsplash title']
    : defaultDescription && defaultDescription.length
    ? defaultDescription
    : imageInfos['Description']
    ? imageInfos['Description']
    : '';
  if (['unavailable', 'none'].includes(data.description.trim().toLowerCase())) {
    data.description = '';
  }
  const warningTag = stockphotoTags.some(
    (substring) =>
      data.description.toLowerCase().includes(substring.toLowerCase()) ||
      data.description.includes('AP')
  );
  if (warningTag) {
    data.internalTags.push('#licensewarning');
  }
  const descriptionLink = `Original public domain image from <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">Wikimedia Commons</a>`;
  if (data.description && data.description.trim().length) {
    data.description = data.description.trim().endsWith('.')
      ? `${data.description.trim()} ${descriptionLink}`
      : `${data.description.trim()}. ${descriptionLink}`;
  } else {
    data.description = descriptionLink;
  }
  console.log('description', data.description);

  // const descriptionValue = splitText(data.description);

  // data.description = descriptionValue.description;
  // data.description_more = descriptionValue.descriptionMore;
  // Get author tags and link
  let rawAuthorLink = await page.evaluate(
    "document.querySelector('#fileinfotpl_aut') && document.querySelector('#fileinfotpl_aut').nextElementSibling && document.querySelector('#fileinfotpl_aut').nextElementSibling.querySelector('a:not(.image)') ? document.querySelector('#fileinfotpl_aut').nextElementSibling.querySelector('a:not(.image)').getAttribute('href') : ''"
  );
  const rawAuthorTexts =
    rawAuthorLink && rawAuthorLink.length
      ? await page.evaluate(
          "const authors = []; const elements = document.querySelector('#fileinfotpl_aut').nextElementSibling; authors.push(elements.querySelector('a:not(.image)').innerText); elements.querySelectorAll('a').forEach(e => e.remove()); authors.push(elements.innerText); authors;"
        )
      : await page.evaluate(
          "document.querySelector('#fileinfotpl_aut') && document.querySelector('#fileinfotpl_aut').nextElementSibling ? [document.querySelector('#fileinfotpl_aut').nextElementSibling.innerText] : ['']"
        );

  if (rawAuthorLink && rawAuthorLink.startsWith('/')) {
    rawAuthorLink = `https://commons.wikimedia.org${rawAuthorLink}`;
  }
  data.authorLink = rawAuthorLink && rawAuthorLink.length ? rawAuthorLink : '';
  data.authorTags =
    Array.isArray(rawAuthorTexts) && rawAuthorTexts.length
      ? rawAuthorTexts
          .filter((t) => t && t.trim().length)
          .filter((t) => !t.includes('This photo was taken'))
          .map((t) => `#${t.trim().toLowerCase().replace(new RegExp(' ', 'gi'), '')}`)
      : [];
  data.authorTags = [...new Set(data.authorTags)];
  console.log('AuthorTag', data.authorTags);
  console.log('AuthorLink', data.authorLink);
  if (imageInfos['Categories']) {
    const categorieTags = imageInfos['Categories']
      .split('·')
      .map((t) => t.toLowerCase().trim())
      .filter((t) => t && t.length > 1);
    data.tags.push(...categorieTags);
  }
  console.log('Tag', data.tags);
  if (config.withDate === true) {
    let date = '';
    try {
      date = await page.evaluate(
        "document.querySelector('.fileinfotpl-type-information time') && document.querySelector('.fileinfotpl-type-information time').dateTime"
      );
      date = date && date.length >= 10 ? date.substring(0, 10) : '';
      // Try to parse the string in Date element (e.g. 21 August 2012, 22:44:40 (UTC))
      if (!date.length && imageInfos['Date'] && imageInfos['Date'].length) {
        const monthNames = [
          '',
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ];
        const dateElements = imageInfos['Date']
          .toLowerCase()
          .replace('\r\n', '')
          .replace('\n', '')
          .replace('\r', '')
          .replace('before', '')
          .replace('taken on', '')
          .trim()
          .split(',')[0]
          .trim()
          .split(' ');
        if (
          monthNames.includes(dateElements[1]) &&
          dateElements[2] &&
          dateElements[2].length === 4
        ) {
          let monthNumber = String(monthNames.findIndex((e) => e === dateElements[1]));
          monthNumber = `${monthNumber.length === 1 ? '0' : ''}${monthNumber}`;
          const dayNumber = `${dateElements[0].length === 1 ? '0' : ''}${dateElements[0]}`;
          date = `${dateElements[2]}-${monthNumber}-${dayNumber}`;
        }
      }

      if (date && date.length === 10) {
        const d = new Date(date);
        const dateString = `${d.toDateString().split(' ')[2]}${d.toLocaleString('en-US', {
          month: 'long',
        })}${d.toDateString().split(' ')[3]}`.toLowerCase();
        data.internalTags.push(`#${dateString}`);

        if (config.dateLimit && config.dateLimit.length === 10 && date > config.dateLimit) {
          data.internalTags.push('#dateissue');
        }
      } else {
        data.internalTags.push('#dateissue');
      }
    } catch (error) {
      console.log(`Error while scraping the date ${date} for ${url}`);
      data.internalTags.push('#dateissue');
    }
  }
  console.log('internalTags', data.internalTags);

  console.log('Download Image');
  let imageBuffer = null;
  let imageMetadata = null;
  try {
    [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);
  } catch (error) {
    console.log(error);
    if (
      error?.message?.includes('Array buffer allocation failed') ||
      String(error).includes('Array buffer allocation failed') ||
      error?.message?.includes('blocked by cloudflare') ||
      String(error).includes('blocked by cloudflare')
    ) {
      throw error;
    }
    console.log(
      `Image for article [${data.articleId}] download link is not working, skip scraping  ${url}`
    );
    return {
      status: 200,
      message: `Image for article [${data.articleId}] download link is not working, skip scraping  ${url}`,
    };
  }
  console.log('imageBuffer', imageBuffer);
  console.log('imageMetadata', imageMetadata);
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
