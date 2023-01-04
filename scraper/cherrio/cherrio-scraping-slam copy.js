var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const { LOADIPHLPAPI } = require("dns");

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);
      // console.log(body);
      if (!body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $(".has-media .node a");

      var imgStore = [];
      images.map(async (item) => {
        const link = "https://www.si.edu" + images[item].attribs.href;

        imgStore.push(link);
      });
      setTimeout(() => resolve(imgStore), 600);
    });
  });
}

async function main() {
  var i = 1;
  var result = [];
  var errorlog = [];
  while (i <= 9) {
    if (i == 1) {
      var url = `https://www.si.edu/search/collection-images?edan_q=&edan_fq%5B0%5D=unit_code%3AHMSG%20OR%20unit_code%3AHMSG_YT&edan_fq%5B1%5D=media_usage%3A%22CC0%22`;
    } else {
      var url = `https://www.si.edu/search/collection-images?page=${
        i - 1
      }&edan_q=&edan_fq%5B0%5D=unit_code%3AHMSG%20OR%20unit_code%3AHMSG_YT&edan_fq%5B1%5D=media_usage%3A%22CC0%22`;
    }
    let scrapingImg = [];
    scrapingImg = await scraping(url);
    if (scrapingImg.length < 1) {
      errorlog.push(url);
      console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
    }
    result = [...result, ...scrapingImg];
    i++;

    console.log("complete ...... : " + result.length);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);
  // console.log(json);
  fs.writeFile("data/smithsonian/author/notdup/Hirshhorn.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
  fs.writeFile("data/smithsonian/author/dup/Hirshhorn.json", json2, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
  console.log(`\x1b[31m\x1b[43m Error : ${errorlog}  \x1b[0m`);
  return true;
}

main();
