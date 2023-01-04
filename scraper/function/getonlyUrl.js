var fs = require("fs");
const { url } = require("inspector");
function main(index) {
  var AllarticleId = [];
  for (var i = 1; i <= index; i++) {
    let rawdata = fs.readFileSync(`data/dam-url/generate_scraping_update--1-1.json`);
    let getData = JSON.parse(rawdata);

    console.log("getData", getData.length);
    getData.forEach((element) => {
      // let imageLink = element["url"] ? element["url"] : "";
      // if (imageLink.includes("www.si.edu")) {

      // }
      AllarticleId.push(element["url"]);
    });
  }
  console.log(AllarticleId.length);
  //console.log(uniqueitem);

  var json = JSON.stringify(AllarticleId);
  // console.log(json);

  fs.writeFile("rawpixel-remix.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main(1);
