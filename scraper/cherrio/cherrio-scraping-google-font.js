var fs = require("fs");
var csv = require("fast-csv");

function scraping(url) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      //console.log(`current link : ${url}`);
      if (body.data == "") {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $(".header .family");

      var imgStore = [];
      images.map((item) => {
        const link = $(images[item]).text();
        if (link.includes("Noto ")) {
          var replaceSpace = link.replace(/\s/g, "+");
          var result = `https://fonts.google.com/noto/specimen/${replaceSpace}`;
        } else {
          var replaceSpace = link.replace(/\s/g, "+");
          var result = `https://fonts.google.com/specimen/${replaceSpace}`;
        }
        imgStore.push(result);
      });

      resolve(imgStore);
    });
  });
}

async function main() {
  var i = 1;

  var result = [];

  var url = "https://fonts.google.com/attribution";

  var scrapingImg = await scraping(url);
  if (scrapingImg == false) {
    console.log(`Error`);
  }
  result = [...scrapingImg];

  console.log("result : " + result.length);
  var json = JSON.stringify(result);
  //console.log(json);
  fs.writeFile("google-font4.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
