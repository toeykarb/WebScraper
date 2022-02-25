var fs = require("fs");
var csv = require("fast-csv");

function scraping(i, url) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      //console.log(`current link : ${url}`);
      if (body.data == "") {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $(".row .status-publish a");

      var imgStore = [];
      images.map((item) => {
        const checkAuthor = $(images[item])
          .find(".photo-author a")
          .text()
          .toLowerCase();

        if (
          checkAuthor != "felix russell-saw" &&
          checkAuthor != "karolina grabowska"
        ) {
          const link = $(images[item]).find(".photo-link").attr("href");
          //console.log(link);
          imgStore.push(link);
        }
      });

      resolve(imgStore);
    });
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i <= 136) {
    if (i == 1) {
      var url = "https://magdeleine.co/license/cc0/";
    } else {
      var url = `https://magdeleine.co/license/cc0/page/${i}/`;
    }
    var scrapingImg = await scraping(i, url);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
    console.log("complete ...... : " + result.length);
  }
  console.log("result : " + result.length);
  var json = JSON.stringify(result);

  fs.writeFile("magdeleine.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
