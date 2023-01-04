var fs = require("fs");
function main() {
  var AllarticleId = [];

  var DBarticleId = [];

  const getNotDup = AllarticleId.filter(
    (val) => !DBarticleId.includes(val)

    // return inputArray.indexOf(item) == index;
  );

  // console.log("AllarticleId", AllarticleId.length);
  // console.log("DBarticleId", DBarticleId.length);
  var json = JSON.stringify(getNotDup);
  // console.log(json);

  fs.writeFile("ai-check-missing-01.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
