const request = require("request");
const cheerio = require("cheerio");
var fs = require("fs");

function checklicense(url) {
  return new Promise((resolve) => {
    request(url, function (error, response, body) {
      if (body.data == "") {
        resolve(false);
      }

      var $ = cheerio.load(body);

      var licenseText = $(
        '.photo__details .photo__meta [rel="nofollow license"]'
      );
      var imgStore = [];
      if (licenseText.length != 0) {
        const checkLicense = licenseText
          .text()
          .toLowerCase()
          .includes("creative commons");
        if (checkLicense) {
          resolve(url);
        }
        resolve(false);
      }
    });
  });
}
async function main() {
  const items = {
    queueUrl: "test1",
    _queueUrl: "test2",
    batchSize: 10,
    delaySeconds: 5,
    projectTags: ["tag1"],
    config: {
      _withDate: true,
      _dateLimit: "2018-06-01",
    },
    items: [],
  };

  // var test = [];

  // for (var i = 0; i < items.length; i++) {
  //   var result = await checklicense(items[i]);

  //   if (result.length) {
  //     test.push(result);
  //   }
  //   console.log(i);
  // }
  // console.log(test);
  var json = JSON.stringify(items);
  console.log(json);
  // fs.writeFile("burstshoptify-nolicense-1.json", json, function (err) {
  //   if (err) {
  //     return console.log(err);
  //   }

  //   console.log("The file was saved!");
  //   return true;
  // });
}
main();
