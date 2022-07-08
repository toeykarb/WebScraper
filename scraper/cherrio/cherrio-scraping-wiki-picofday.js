const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
var fs = require('fs');
async function scraping(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // page.on('console', (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(3000);

    const data = {
      url,
      link: [],
      internalTags: [],
    };

    console.log(url);
    console.log('Get link');
    let imagelink = [];
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll('table tbody .image')].map((a) => {
        let item = a.getAttribute('href');
        return `https://commons.wikimedia.org${item}`;
      });
    });

    await browser.close();
    return imagelink;
  } catch (error) {
    console.log(error);

    return [];
  }
}

async function main() {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const years = [
    '2004',
    '2005',
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
  ];

  var url = 'https://en.wikipedia.org/wiki/Wikipedia:Picture_of_the_day/';
  var result = [];
  var errorList = [];
  for (var i = 0; i < years.length; i++) {
    var k = 0;
    if (years[i] == '2004') {
      k = 4;
    }
    while (k < months.length) {
      var directLink = `${url}${months[k]}_${years[i]}`;

      let items = await scraping(directLink);
      if (items.length == 0) {
        errorList.push(directLink);
        console.log(`Error : ${directLink}`);
      } else {
        result.push(...items);
      }
      k++;
    }
  }

  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  fs.writeFile(`data/wiki/pictureoftheday/pic-of-the-day.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
    return true;
  });
}

main();
