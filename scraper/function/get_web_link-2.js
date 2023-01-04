var fs = require("fs");
function main(number) {
  var i = 1;
  let get_link = [];
  while (i <= number) {
    let rawdata = fs.readFileSync(`data/loc/get-link/unitest-page-${i}.json`);

    let test = JSON.parse(rawdata);

    var keys = Object.keys(test);

    keys.map((index) => {
      get_link.push(test[index].weblink);
    });
    console.log(i);
    i++;
  }
  var json = JSON.stringify(get_link);
  fs.writeFile(`smk-miss.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log(`The file was saved!`);
  });
}
main(2);
