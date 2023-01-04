var fs = require(`fs`);

function main() {
  var strArray = [];
  let spiltText = strArray.map((item) => item.split(`	INFO	`)[1]);

  var json = JSON.stringify(spiltText);
  fs.writeFile(`split-text-flickr-test.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log(`The file was saved!`);
  });
}
main();
