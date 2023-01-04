var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scraping(url) {
  const response = await fetch(url, {
    method: "GET",
  });
  let resposeJson = await response.json();
  let getData = resposeJson["items"];
  let imagelink = [];
  getData.map((item) => {
    let imageLink = item["frontend_url"];
    imagelink.push(imageLink);
  });
  return imagelink;
}

async function main() {
  var i = 31;
  var result = [];
  try {
    while (i <= 39) {
      var url = `https://api.smk.dk/api/v1/art/search/?keys=*&filters=%5Bpublic_domain:true%5D,%5Bhas_image:true%5D&lang=en&offset=${
        i * 1000
      }&rows=1000`;
      const encoded_url = new URL(url);
      var scrapingImg = await scraping(encoded_url.href);
      if (scrapingImg.length < 1) {
        console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
      }
      result = [...result, ...scrapingImg];
      console.log("index", i);
      i++;
      console.log("complete ...... : " + result.length);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.log(err);
    console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  var json2 = JSON.stringify(result);

  // console.log(json);
  fs.writeFile("data/smk/smk-batchv2-4.json", json2, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
  // fs.writeFile(
  //   "data/met/all-themet/dup/the-met-01.json.json",
  //   json2,
  //   function (err) {
  //     if (err) {
  //       return console.log(err);
  //     }

  //     console.log("The file was saved!");
  //   }
  // );
  return true;
}

main();
