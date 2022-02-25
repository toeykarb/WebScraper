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

      var images = $(".wrap .other--has-3-columns");
      var imgStore = [];
      for (var index = 0; index < images.length; index++) {
        var imageObj = $(images[index]).find("a");
        imageObj.map((item) => {
          const link = imageObj[item].attribs.href;
          imgStore.push(link);
        });
      }
      resolve(imgStore);
      // images.map((item) => {
      //   const link = images[item].attribs.href;
      //   imgStore.push(link);
      // });
    });
  });
}

async function main() {
  var i = 1;

  var result = [];
  while (i <= 168) {
    if (i == 1) {
      var url = "https://skitterphoto.com/photos?by=downloads";
    } else {
      var url = `https://skitterphoto.com/photos?by=downloads&page=${i}`;
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
  //console.log(json);

  fs.writeFile("skitterphoto.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
