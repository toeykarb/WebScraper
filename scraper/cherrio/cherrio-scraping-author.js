var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      if (body.data == '') {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);
      var authorLink = '';
      var images = $('.title-container .truncate').text();
      console.log(images);
      if (images.length) {
        authorLink = `#${images
          .trim()
          .toLowerCase()
          .replace(new RegExp('[^a-z0-9]', 'gi'), '')
          .replace(new RegExp(' ', 'gi'), '')
          .trim()}`;
      }

      setTimeout(() => resolve(authorLink), 500);
    });
  });
}

async function main() {
  var result = [];
  var url = [
    'https://www.flickr.com/photos/18946008@N06/',
    'https://www.flickr.com/people/lexware-mountainbike-team/',
    'https://www.flickr.com/people/dcoetzee/',
    'https://www.flickr.com/photos/seattlecamera/',
    'https://www.flickr.com/photos/9600117@N03/',
    'https://www.flickr.com/people/citytransportinfo/',
    'https://www.flickr.com/people/elmsn/',
    'https://www.flickr.com/people/oscarfava/',
    'https://www.flickr.com/people/55620187@N05/',
    'https://www.flickr.com/photos/swallowedtail/',
  ];

  for (var i = 0; i < url.length; i++) {
    console.log(url[i]);
    var scrapingImg = await scraping(url[i]);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result.push(scrapingImg);
  }
  console.log(result);

  //var json = JSON.stringify(result);
  //console.log(json);
  // fs.writeFile("burstshoptify-5.json", json, function (err) {
  //   if (err) {
  //     return console.log(err);
  //   }

  //   console.log("The file was saved!");
  //   return true;
  // });
}

main();
