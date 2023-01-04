var fs = require("fs");
const { url } = require("inspector");
function main() {
  var AllarticleId = [];

  let rawdata = fs.readFileSync("data/aichicago/test.json");
  let getData = JSON.parse(rawdata);

  console.log("getData", getData.length);
  getData.forEach((element) => {
    if (element.includes("https://commons.wikimedia.org/")) {
      AllarticleId.push(element);
    }
  });
  console.log(AllarticleId.length);
  //console.log(uniqueitem);

  var json = JSON.stringify(AllarticleId);
  // console.log(json);

  fs.writeFile("wiki-data-cleasing.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
