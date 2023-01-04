var fs = require("fs");
const cheerio = require("cheerio");
function main() {
  let get_link = [];

  var itemId = [
    7017949, 7037989, 7038090, 7041682, 7050418, 7050420, 7050431, 7050446, 7050473, 7050477,
    7050479, 7050494, 7050501, 7050513, 7050514, 7050525, 7050532, 7050543, 7050548, 7050557,
    7050570, 7050578, 7050583, 7050588, 7050594, 7050595, 7050619, 7050633, 7050648, 7050649,
    7050656, 7050658, 7050662, 7050669, 7050677, 7050689, 7050691, 7050692, 7050706, 7050717,
    7050718, 7050738, 7050743, 7050744, 7050748, 7050766, 7050775, 7050783, 7050787, 7050791,
    7050793, 7050806, 7050828, 7050829, 7050836, 7050839, 7050844, 7050848, 7050855, 7050865,
    7050873, 7050882, 7050898, 7050907, 7050910, 7050913, 7050927, 7050928, 7050934, 7050941,
    7050967, 7050976, 7050983, 7050986, 7050993, 7050994, 7050996, 7051021, 7051029, 7051032,
    7051035, 7051043, 7051048, 7051060, 7051062, 7051069, 7051074, 7051076, 7051077, 7051079,
    7051089, 7051090, 7051099, 7051113, 7051124, 7051131, 7051133, 7051134, 7051136, 7051140,
    7051146, 7051152, 7051157, 7051164, 7051173, 7051174, 7051177, 7051180, 7051185, 7051195,
    7051201, 7051203, 7051209, 7051211, 7051216, 7051223, 7051253, 7051262, 7051270, 7051273,
    7051274, 7051275, 7051285, 7051289, 7051295, 7100112, 7100195, 7100197, 7100271, 7100284,
    7100334, 7100353, 7100407, 7100490, 7100498, 7100592, 7100596, 7100613, 7100629, 7100639,
    7100648, 7100652, 7100701, 7100724, 7100756, 7100768, 7100769, 7100778, 7100794, 7100801,
    7100816, 7100828, 7100849, 7100876, 7101106, 7101162, 7101270, 7101291, 7101309, 7101334,
    7113564, 7113572, 7113585, 7113594, 7113602, 7113614, 7113625, 7113717, 7115004, 7145356,
    7145412, 7145506, 7145560, 7145977, 7145998, 7146006, 7146009, 7146024, 7146183, 7146185,
    7146193, 7146221, 7146234, 7146599, 7146711, 7146734, 7146743, 7146751, 7146760, 7146764,
    7146766, 7146779, 7146791, 7146885, 7146889, 7146900, 7146903, 7146920, 7146929, 7146941,
    7146942, 7146947, 7147005, 7147043, 7147060, 7147075, 7147079, 7147097, 7147100, 7147101,
    7147102, 7147134, 7147135, 7147191, 7147211, 7147223, 7147307, 7147310, 7147331, 7147359,
    7147377, 7147382, 7147404, 7147408, 7147434, 7147436, 7147457, 7147461, 7147485, 7147486,
    7147494, 7147514, 7147536, 7147537, 7147538, 7147539, 7147544, 7147553, 7147555, 7147559,
    7147572, 7147667, 7147672, 7147717, 7147744, 7147752, 7147758, 7147778, 7147804, 7147808,
    7147852, 7147867, 7147873, 7147874, 7147876, 7147881, 7147884, 7147886, 7147888, 7147889,
    7147892, 7147896, 7147903, 7147912, 7147918, 7147924, 7147930, 7147932, 7147933, 7147938,
    7147947, 7147948, 7147951, 7147974, 7147989, 7147997, 7148002, 7148004, 7148005, 7148006,
    7148018, 7148022, 7148026, 7148029, 7148034, 7148039, 7148040, 7148042, 7148044, 7148049,
    7148050, 7148051, 7148060, 7148063, 7148067, 7148069, 7148078, 7148079, 7148081, 7148084,
    7148086, 7148098, 7148102, 7148104, 7148115, 7148120, 7148124, 7148133, 7148141, 7148144,
    7148146, 7148157, 7148162, 7148191, 7148335, 7148410, 7148423, 7148424, 7148503, 7148553,
    7148556, 7148559, 7148563, 7148565, 7148567, 7148572, 7148577, 7148588, 7148668, 7168319,
    7168364, 7168369, 7168754, 7168759, 7168813, 7168874, 7170380, 7302467,
  ];

  let rawdata = fs.readFileSync(`metadata-url.json`);

  let jsonObjItem = JSON.parse(rawdata);
  itemId.map((id) => {
    var getLinkFromDes = "";
    var description_more = jsonObjItem[id]["description_more"]
      ? jsonObjItem[id]["description_more"]
      : "";
    var description = jsonObjItem[id]["description"] ? jsonObjItem[id]["description"] : "";
    if (description_more.includes("Original public domain image from")) {
      getLinkFromDes = description_more;
    } else if (description.includes("Original public domain image from")) {
      getLinkFromDes = description;
    }
    // var imageLink = getLinkFromDes.split("Original public domain image from")[1];
    const $ = cheerio.load(getLinkFromDes);
    let getHref = $("a");
    let link = getHref.attr("href");
    var data = {
      imageId: id,
      url: link,
    };
    get_link.push(data);
  });
  var json = JSON.stringify(get_link);
  // console.log(get_link);
  fs.writeFile("data/wiki/get-link/wiki-update-chunk5.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();