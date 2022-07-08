var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      //console.log(`current link : ${url}`);
      if (!body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $('#select-resource0');

      if (images?.length) {
        console.log('Have resource', url);
        resolve(url);
      }
      resolve(false);
    });
  });
}

async function main() {
  var url = [
    'https://www.loc.gov/item/94504655/',
    'https://www.loc.gov/item/94504684/',
    'https://www.loc.gov/item/94505348/',
    'https://www.loc.gov/item/2006683785/',
    'https://www.loc.gov/item/2021631087/',
    'https://www.loc.gov/item/2017658622/',
    'https://www.loc.gov/item/2022640149/',
    'https://www.loc.gov/item/2022640150/',
    'https://www.loc.gov/item/2022640151/',
    'https://www.loc.gov/item/2022640152/',
    'https://www.loc.gov/item/2022640153/',
    'https://www.loc.gov/item/2022640155/',
    'https://www.loc.gov/item/2022640156/',
    'https://www.loc.gov/item/2022640157/',
    'https://www.loc.gov/item/98504365/',
    'https://www.loc.gov/item/00652311/',
    'https://www.loc.gov/item/00652314/',
    'https://www.loc.gov/item/00650982/',
    'https://www.loc.gov/item/00650983/',
    'https://www.loc.gov/item/00650984/',
    'https://www.loc.gov/item/2022633531/',
    'https://www.loc.gov/item/98508534/',
    'https://www.loc.gov/item/98507851/',
    'https://www.loc.gov/item/96520617/',
    'https://www.loc.gov/item/96515763/',
    'https://www.loc.gov/item/2017645476/',
    'https://www.loc.gov/item/2003671267/',
    'https://www.loc.gov/item/2006675183/',
    'https://www.loc.gov/item/2010651667/',
    'https://www.loc.gov/item/00649701/',
    'https://www.loc.gov/item/2014646200/',
    'https://www.loc.gov/item/2009633310/',
    'https://www.loc.gov/item/94505572/',
    'https://www.loc.gov/item/2005681327/',
  ];
  var result = [];
  console.log(url.length);
  for (var i = 0; i < url.length; i++) {
    var scrapingImg = await scraping(url[i]);
    console.log(`current : ${url[i]}`);
    // if (scrapingImg == false) {
    //   console.log(`Error : ${url[i]}`);
    // }
    if (scrapingImg) {
      result = [...result, scrapingImg];
    }
  }
  console.log('result : ' + result.length);
  var json = JSON.stringify(result);

  fs.writeFile(`check-loc-noresource6.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
    return true;
  });
}

main();
