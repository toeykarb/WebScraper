var fs = require("fs");
const jsdom = require("jsdom");
const request = require("request");
const cheerio = require("cheerio");

function scraping(url) {
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      if (body.data == "") {
        resolve(false);
      }
      var $ = cheerio.load(body);

      // const sourceCollectionIndex = [...$(".breadcrumb-data *")].findIndex(
      //   (node) => node.textContent.trim() === "Downloads:"
      // );
      const sourceCollectionIndex = [...$(".breadcrumb-data *")];
      //console.log(sourceCollectionIndex[19]);
      //console.log(sourceCollectionIndex[19].next.data);
      if (sourceCollectionIndex[19] != null) {
        console.log(`current link : ${url}`);
        resolve(parseInt(sourceCollectionIndex[19].next.data));
      } else {
        console.log("Error!!!!!! " + url);
        resolve("NotFound");
      }
    });
  });
}

// async function scraping(url) {
//   const response = await fetch(url)
//   const users = await response.json();
//   return users;
// }

// fetchUsers().then(users => {
//   users; // fetched users
// });

async function main() {
  let rawdata = fs.readFileSync(
    "/Users/beer/Desktop/SandBox/web-scraping/LOC/scraper/Untitled-1.json"
  );
  var dataAutor = JSON.parse(rawdata);
  var scrapingDownloads = "";
  console.log(dataAutor.Sheet1.length);
  for (var i = 0; i < dataAutor.Sheet1.length; i++) {
    console.log("complete ...... : " + i);
    scrapingDownloads = await scraping(dataAutor.Sheet1[i].link);
    dataAutor.Sheet1[i].downloads = scrapingDownloads;
  }
  var json = JSON.stringify(dataAutor);
  fs.writeFile("author-download-final-ls.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
