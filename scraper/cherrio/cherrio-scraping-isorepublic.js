var fs = require("fs");
var csv = require("fast-csv");

function scraping(url) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      console.log(`current link : ${url}`);
      if (body.data == "") {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $("#photo-grid .photo-grid-item");
      //console.log(images);
      var imgStore = [];
      images.map((item) => {
        const link = images[item].attribs.href;
        //console.log(link);
        imgStore.push(link);
      });

      resolve(imgStore);
    });
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i <= 121) {
    if (i == 1) {
      var url = "https://isorepublic.com/";
    } else {
      var url = `https://isorepublic.com/page/${i}/`;
    }
    var scrapingImg = await scraping(url);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
  }
  console.log("result : " + result.length);
  var json = JSON.stringify(result);

  fs.writeFile("isorepublic.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
