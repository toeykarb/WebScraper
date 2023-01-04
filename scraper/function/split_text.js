var fs = require("fs");

function main() {
  var strArray = [];

  let spiltText = strArray.map((item) => `${item.split("skip scraping ")[1]}`);

  const getNotDup = spiltText.filter((value, index, self) => self.indexOf(value) === index);
  const getNotDup2 = spiltText.filter((value, index, self) => self.indexOf(value) !== index);
  console.log(getNotDup2);
  // console.log(getNotDup2);
  console.log("getNotDup", getNotDup.length);
  console.log("spiltText", spiltText.length);
  var json = JSON.stringify(getNotDup);
  fs.writeFile("aichicago-downloadlink-batch1.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
