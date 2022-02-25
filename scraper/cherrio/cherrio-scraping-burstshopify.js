var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);
      if (body.data == "") {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $(".photo-card .photo-tile a");

      var imgStore = [];
      images.map(async (item) => {
        const link = "https://burst.shopify.com" + images[item].attribs.href;
        //const check = await checkCC0(link);

        // if (check) {
        //   imgStore.push(link);
        // }
        imgStore.push(link);
      });
      setTimeout(() => resolve(imgStore), 500);
    });
  });
}

async function main() {
  var i = 401;

  var result = [];
  while (i <= 472) {
    if (i == 1) {
      var url = "https://burst.shopify.com/photos?sort=latest";
    } else {
      var url = `https://burst.shopify.com/photos?page=${i}&sort=latest`;
    }
    var scrapingImg = await scraping(url);
    if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    }
    result = [...result, ...scrapingImg];
    i++;

    console.log("complete ...... : " + result.length);
  }

  console.log("result : " + result.length);
  var json = JSON.stringify(result);
  //console.log(json);
  fs.writeFile("burstshoptify-5.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
    return true;
  });
}
checkCC0 = async (url) => {
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      if (body.data == "") {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var licenseText = $(
        '.photo__details .photo__meta [rel="nofollow license"]'
      );
      if (licenseText.length != 0) {
        const checkLicense = licenseText
          .text()
          .toLowerCase()
          .includes("creative commons");
        if (checkLicense) {
          setTimeout(() => resolve(true), 500);
        }
      }
      setTimeout(() => resolve(false), 500);
    });
  });
};

main();
