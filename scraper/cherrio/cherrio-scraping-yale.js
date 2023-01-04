// var fs = require("fs");
// const request = require("request");
// const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");

// async function scraping(url) {
//   // try {
//   const browser = await puppeteer.launch({
//     headless: false,
//     // devtools: true,
//   });
//   const page = await browser.newPage();
//   let imagelink = [];
//   try {
//     page.on("console", (consoleObj) => console.log(consoleObj.text()));

//     await page.goto(url, {
//       waitUntil: "networkidle0",
//     });

//     await page.waitForTimeout(5000);

//     console.log("current link : ", url);

//     let linkItems = await page.evaluate(() => {
//       let links = [...document.querySelectorAll("#documents .masonry .thumbnail a")].map((a) => {
//         let item = `https://collections.britishart.yale.edu${a.getAttribute("href")}`;
//         return item;
//       });
//       return links;
//     });
//     imagelink.push(...linkItems);
//   } catch (error) {
//     console.log(error);
//   } finally {
//     await browser.close();
//   }

//   return imagelink;
// }

// async function main() {
//   var i = 1;
//   var result = [];
//   try {
//     while (i <= 100) {
//       if (i == 1) {
//         var url = `https://collections.britishart.yale.edu/?f%5Bhas_image_ss%5D%5B%5D=available&f%5Brights_ss%5D%5B%5D=Free+to+Use`;
//       } else {
//         var url = `https://collections.britishart.yale.edu/?f%5Bhas_image_ss%5D%5B%5D=available&f%5Brights_ss%5D%5B%5D=Free+to+Use&page=${i}`;
//       }
//       const encoded_url = new URL(url);
//       var scrapingImg = await scraping(url);
//       if (scrapingImg.length < 1) {
//         console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
//       }
//       result = [...result, ...scrapingImg];
//       i++;

//       console.log("complete ...... : " + result.length);
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   } catch (err) {
//     console.log(err);
//     console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
//   }
//   console.log(`All result : ${result.length}`);
//   const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
//   // console.log(`Unique result : ${getNotDup.length}`);
//   var json = JSON.stringify(result);
//   // var json2 = JSON.stringify(result);
//   // console.log(json);
//   fs.writeFile("data/met/all-themet/notdup/the-met-01.json", json, function (err) {
//     if (err) {
//       return console.log(err);
//     }

//     console.log("The file was saved!");
//   });

//   return true;
// }

// main();

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

      var images = $("#documents .masonry .thumbnail a");

      var imgStore = [];
      images.map(async (item) => {
        let getLink = images[item].attribs.href;
        if (getLink?.length) {
          const link = `https://collections.britishart.yale.edu${getLink}`;
          imgStore.push(link);
        }

        // let deleteZoom = link.replace("/zoom", "");
      });
      setTimeout(() => resolve(imgStore), 2000);
    });
  });
}

async function main() {
  var i = 401;
  var result = [];

  while (i <= 410) {
    var url = `https://collections.britishart.yale.edu/?f%5Bhas_image_ss%5D%5B%5D=available&f%5Brights_ss%5D%5B%5D=Free+to+Use&page=${i}`;

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
  fs.writeFile("data/yale/yale-batch5.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
    return true;
  });
}

main();
