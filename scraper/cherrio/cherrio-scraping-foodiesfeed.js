var fs = require('fs');
var csv = require('fast-csv');

function scraping(i, url) {
  const request = require('request');
  const cheerio = require('cheerio');
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      //console.log(`current link : ${url}`);
      if (body.data == '') {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $('.pi-wrap .pi-link');

      var imgStore = [];
      images.map((item) => {
        const link = images[item].attribs.href;
        imgStore.push(link);
      });

      resolve(imgStore);
    });
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i <= 55) {
    if (i == 1) {
      var url = 'https://www.foodiesfeed.com/author/jakubkapusnak/';
    } else {
      var url = `https://www.foodiesfeed.com/author/jakubkapusnak/page/${i}/`;
    }
    var scrapingImg = await scraping(i, url);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
    console.log('complete ...... : ' + result.length);
  }
  console.log('result : ' + result.length);
  var json = JSON.stringify(result);
  //console.log(json);
  fs.writeFile('foodiesfeed-jakubkapusnak-v2.json', json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });
}

main();
