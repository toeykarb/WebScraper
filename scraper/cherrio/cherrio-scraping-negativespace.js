var fs = require("fs");
var csv = require("fast-csv");

function scraping(i, url) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      console.log(`current link : ${url}`);
      if (body.data == "") {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var images = $(".post-thumb a");

      var imgStore = [];
      images.map((item) => {
        const link = images[item].attribs.href;
        const checkAds = link.toLowerCase().includes("shutterstock.7eer.net");
        if (!checkAds) {
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
  while (i <= 225) {
    if (i == 1) {
      var url = "https://negativespace.co/";
    } else {
      var url = `https://negativespace.co/page/${i}/`;
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

  fs.writeFile("negativespace.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
