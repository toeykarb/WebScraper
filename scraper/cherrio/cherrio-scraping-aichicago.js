var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);

      if (!body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $("#artworksList .m-listing .m-listing__link");

      var imgStore = [];
      images.map(async (item) => {
        const link = images[item].attribs.href;
        // let deleteZoom = link.replace("/zoom", "");
        imgStore.push(link);
      });
      setTimeout(() => resolve(imgStore), 1000);
    });
  });
}

async function checkMoreResour(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);

      if (body.data == "" || !body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $(".item-description .item-description-title a");

      var imgStore = [];
      images.map(async (item) => {
        const link = images[item].attribs.href;
        imgStore.push(link);
      });
      setTimeout(() => resolve(imgStore), 500);
    });
  });
}

async function main() {
  var i = 1;
  var result = [];

  while (i <= 29) {
    var url = `https://www.artic.edu/collection?is_public_domain=1&department_ids=Prints%20and%20Drawings&date-start=1900&date-end=Present&page=${i}`;

    // } else {
    //   var url = `https://www.loc.gov/collections/national-photo-company/?c=200&fa=online-format:image&sp=2&st=grid`;
    // }

    var scrapingImg = await scraping(url);
    if (scrapingImg == false) {
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
  // var json = JSON.stringify(getNotDup);
  var json = JSON.stringify(result);
  // console.log(json);
  fs.writeFile(
    "data/aichicago/department/Prints and Drawings 1900-Present.json",
    json,
    function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
      return true;
    }
  );
}

main();
