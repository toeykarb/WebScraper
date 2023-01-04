var fs = require("fs");
// function main() {
//   var AllarticleId = [];

//   let rawdata = fs.readFileSync("data/aichicago/all-file-07.json");
//   let getData = JSON.parse(rawdata);

//   console.log("getData", getData.length);
//   // console.log(getData[0]);
//   getData.forEach((element) => {
//     let getUrl = `https://www.artic.edu/artworks/${element["id"]}`;
//     AllarticleId.push(getUrl);
//   });
//   // console.log(AllarticleId);
//   // //console.log(uniqueitem);

//   var json = JSON.stringify(AllarticleId);
//   // console.log(json);

//   fs.writeFile("data/aichicago/getUrl/chunk-07.json", json, function (err) {
//     if (err) {
//       return console.log(err);
//     }

//     console.log("The file was saved!");
//   });
// }
function main() {
  var AllarticleId = [];
  var departmentId = [
    "Applied Arts of Europe",
    "Architecture and Design",
    "Arts of Africa",
    "Arts of Asia",
    "Arts of the Americas",
    "Arts of the Ancient Mediterranean and Byzantium",
    "Modern Art",
    "Painting and Sculpture of Europe",
    "Photography and Media",
    "Prints and Drawings",
    "Textiles",
    // "Contemporary Art",
    "AIC Archives",
    // "Ryerson and Burnham Libraries Special Collections",
    // "Modern and Contemporary Art",
  ];
  for (var i = 1; i <= 7; i++) {
    let rawdata = fs.readFileSync(`data/aichicago/all-file-0${i}.json`);
    let getData = JSON.parse(rawdata);
    getData.forEach((element) => {
      if (![...departmentId].includes(element["department_title"]) && element["department_title"]) {
        let getUrl = `https://www.artic.edu/artworks/${element["id"]}`;
        AllarticleId.push(element);
      }
    });
  }
  console.log(AllarticleId.length);
  var json = JSON.stringify(AllarticleId);
  // console.log(json);

  fs.writeFile("data/aichicago/all-groupby-department/test.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
