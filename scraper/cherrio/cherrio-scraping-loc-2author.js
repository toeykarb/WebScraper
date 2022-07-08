var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);
      if (!body || body.data == '') {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $('[aria-labelledby="item-facet-contributors"]');

      var imgStore = [];
      if (images?.length) {
        imgStore.push(url);
      }

      resolve(imgStore);
    });
  });
}

async function main() {
  var url = [
    'https://www.loc.gov/item/2017713834/',
    'https://www.loc.gov/item/2017713844/',
    'https://www.loc.gov/item/2017713847/',
    'https://www.loc.gov/item/2017713893/',
    'https://www.loc.gov/item/2017713934/',
    'https://www.loc.gov/item/2017713940/',
    'https://www.loc.gov/item/2017713952/',
    'https://www.loc.gov/item/2017713960/',
    'https://www.loc.gov/item/2017713961/',
    'https://www.loc.gov/item/2017713966/',
    'https://www.loc.gov/item/2017714028/',
    'https://www.loc.gov/item/2017714033/',
    'https://www.loc.gov/item/2017714053/',
    'https://www.loc.gov/item/2017714086/',
    'https://www.loc.gov/item/2017714116/',
    'https://www.loc.gov/item/2017714130/',
    'https://www.loc.gov/item/2017714218/',
    'https://www.loc.gov/item/2017714233/',
    'https://www.loc.gov/item/2017714254/',
    'https://www.loc.gov/item/2017714290/',
    'https://www.loc.gov/item/2017714302/',
    'https://www.loc.gov/item/2017714317/',
    'https://www.loc.gov/item/2017714413/',
    'https://www.loc.gov/item/2017714441/',
    'https://www.loc.gov/item/2017714513/',
    'https://www.loc.gov/item/2017714554/',
    'https://www.loc.gov/item/2017714585/',
    'https://www.loc.gov/item/2017714588/',
    'https://www.loc.gov/item/2017714610/',
    'https://www.loc.gov/item/2017714624/',
    'https://www.loc.gov/item/2017714631/',
    'https://www.loc.gov/item/2017714647/',
    'https://www.loc.gov/item/2017714828/',
    'https://www.loc.gov/item/2017714846/',
    'https://www.loc.gov/item/2017714872/',
    'https://www.loc.gov/item/2017714878/',
    'https://www.loc.gov/item/2017714898/',
    'https://www.loc.gov/item/2017714935/',
    'https://www.loc.gov/item/2017714988/',
    'https://www.loc.gov/item/2017714998/',
    'https://www.loc.gov/item/2017715023/',
    'https://www.loc.gov/item/2017715209/',
    'https://www.loc.gov/item/2017715243/',
    'https://www.loc.gov/item/2017715357/',
    'https://www.loc.gov/item/2017715412/',
    'https://www.loc.gov/item/2017715457/',
    'https://www.loc.gov/item/2017715511/',
    'https://www.loc.gov/item/2017715643/',
    'https://www.loc.gov/item/2017715787/',
    'https://www.loc.gov/item/2017715838/',
    'https://www.loc.gov/item/2017715840/',
    'https://www.loc.gov/item/2017715867/',
  ];
  var result = [];
  for (var i = 0; i < url.length; i++) {
    var scrapingImg = await scraping(url[i]);
    // if (scrapingImg == false) {
    //   console.log(`Error : ${url[i]}`);
    // }
    result = [...result, ...scrapingImg];
  }
  console.log('result : ' + result.length);
  var json = JSON.stringify(result);

  fs.writeFile(`loc-link-check-author.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
    return true;
  });
}

main();
