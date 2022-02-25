var fs = require('fs');
var csv = require('fast-csv');

function scraping(url) {
  const request = require('request');
  const cheerio = require('cheerio');
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      console.log(`current link : ${url}`);
      if (body.data == '') {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $('.gallery-item a');
      //console.log(images);
      var imgStore = [];
      images.map((item) => {
        const link = 'https://pickupimage.com' + images[item].attribs.href;
        imgStore.push(link);
      });

      resolve(imgStore);
    });
  });
}

async function main() {
  var i = 1258;

  var result = [];
  while (i <= 1401) {
    if (i == 1) {
      var url = 'https://pickupimage.com/search.cfm?kw=&sortby=download';
    } else {
      var url = `https://pickupimage.com/search.cfm?kw=&id=0&sortby=download&page=${i}`;
    }

    var scrapingImg = await scraping(url);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
  }
  console.log('result : ' + result.length);
  var json = JSON.stringify(result);
  //console.log(json);
  fs.writeFile('pickupimage-7.json', json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });
}

main();
