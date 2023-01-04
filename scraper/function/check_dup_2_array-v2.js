var fs = require("fs");
function main() {
  var AllarticleId = [
    {
      articleid: "EAFEKmCZEqM",
      imagelink:
        "https://www.canva.com/p/templates/EAFEKmCZEqM-blue-and-red-modern-happy-4th-of-july-instagram-story",
    },
    {
      articleid: "EAFCZ1RsAnU",
      imagelink:
        "https://www.canva.com/p/templates/EAFCZ1RsAnU-elegant-white-4th-of-july-instagram-post",
    },
    {
      articleid: "EAFEKnydo5k",
      imagelink:
        "https://www.canva.com/p/templates/EAFEKnydo5k-blue-and-red-modern-happy-4th-of-july-instagram-story",
    },
  ];

  var DBarticleId = [
    {
      articleid: "EAFEKmCZEqM",
      imagelink:
        "https://www.canva.com/p/templates/EAFEKmCZEqM-blue-and-red-modern-happy-4th-of-july-instagram-story",
    },
    {
      articleid: "EAFCZ1RsAnU",
      imagelink:
        "https://www.canva.com/p/templates/EAFCZ1RsAnU-elegant-white-4th-of-july-instagram-post",
    },
    {
      articleid: "EAFELG8LRW8",
      imagelink:
        "https://www.canva.com/p/templates/EAFELG8LRW8-blue-illustrated-independence-day-sale-facebook-post",
    },
  ];
  var ids = new Set(DBarticleId.map(({ articleid }) => articleid));
  var selectedRows = AllarticleId.filter(({ articleid }) => !ids.has(articleid));
  var json = JSON.stringify(selectedRows);
  fs.writeFile("check-dup-2-array-4.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}
main();
