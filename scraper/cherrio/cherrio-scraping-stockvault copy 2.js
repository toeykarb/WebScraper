var fs = require("fs");
var csv = require("fast-csv");

function scraping(i) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(
      `https://www.stockvault.net/user/photos/87395/?s=dl&p=${i}`,
      function (error, response, body) {
        console.log(
          `current link : https://www.stockvault.net/user/photos/87395/?s=dl&p=${i}`
        );
        if (body.data == "") {
          resolve(false);
        }

        var $ = cheerio.load(body);

        var images = $("#flexgrid .item a");

        var imgStore = [];
        images.map((item, index) => {
          const link = "https://www.stockvault.net" + images[item].attribs.href;
          imgStore.push(link);
        });
        resolve(imgStore);
      }
    );
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i <= 198) {
    var scrapingImg = await scraping(i);
    if (scrapingImg == false) {
      console.log(`https://www.stockvault.net/user/photos/87395/?s=dl&p=${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
    console.log("complete ...... : " + result.length);
  }
  console.log("result : " + result.length);
  var json = JSON.stringify(result);

  fs.writeFile("2happy.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
