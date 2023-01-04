var fs = require("fs");
function main() {
  let image_id = fs.readFileSync("data/loc/get-link/unitest-page-link-1.json");
  image_id = JSON.parse(image_id);

  let rawdata = fs.readFileSync("data/loc/get-link/unitest-page-8.json");
  let get_link = [];
  let test = JSON.parse(rawdata);
  image_id.map((index) => {
    get_link.push(test[index].weblink);
  });

  var json = JSON.stringify(get_link);
  fs.writeFile("data/get-link8.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
