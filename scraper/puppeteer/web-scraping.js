var fs = require("fs");
var csv = require("fast-csv");

function scraping(i) {
  const request = require("request");
  const cheerio = require("cheerio");
  return new Promise((resolve) => {
    request(
      `https://www.loc.gov/search/?fa=contributor:hine,+lewis+wickes%7Conline-format:image&sp=${i}&st=grid`,
      function (error, response, body) {
        console.log(
          `current link : https://www.loc.gov/search/?c=100&fa=contributor:hine,+lewis+wickes%7Conline-format:image&sp=${i}&st=grid`
        );
        if (body.data == "") {
          resolve(false);
        }

        var $ = cheerio.load(body);

        var images = $(".item-description-title a");

        var imgStore = [];
        images.map((item, index) => {
          imgStore.push(images[item].attribs.href);
        });
        resolve(imgStore);
      }
    );
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i < 65) {
    var scrapingImg = await scraping(i);
    if (scrapingImg == false) {
      console.log(
        `https://www.loc.gov/search/?fa=contributor:hine,+lewis+wickes%7Conline-format:image&sp=${i}&st=grid`
      );
    }
    result = [...result, ...scrapingImg];
    i++;
    //console.log(result);
    console.log("complete ...... : " + result.length);
  }
  console.log("result : " + result.length);
  var json = JSON.stringify(result);

  fs.writeFile("LOC-v2.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
