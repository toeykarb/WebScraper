const { getFormattedUTCParts } = require('./date');

function main() {
  //   var keyValue = 'private/static/files/website/2022-05/wk3244373-image.jpg';
  //   var splitKey = keyValue.split('/');
  //   console.log(splitKey);
  //   splitKey[4] = '2022-04';
  //   console.log(splitKey);
  //   var test = splitKey.join('/');
  //   console.log(test);

  let firstName = getCatalogStoragePath('files');
  const imageKey = `${firstName}/test`;
  var imageKeyArr = imageKey.split('/');
  var currentDate = new Date(imageKeyArr[4]);
  var lastDate = new Date('2021-04');
  while (currentDate > lastDate) {
    currentDate.setUTCMonth(currentDate.getUTCMonth() - 1);
    var fullyear = `${currentDate.getUTCFullYear()}`;
    var getMonth = `0${currentDate.getUTCMonth() + 1}`.slice(-2);
    imageKeyArr[4] = `${fullyear}-${getMonth}`;
    var newImageKey = imageKeyArr.join('/');
    console.log(currentDate);
  }
}

main();

function getCatalogStoragePath(type = 'files', lowRes = false) {
  const prefix = 'private';
  const parts = getFormattedUTCParts(new Date());
  const datePart = `${parts.y}-${parts.m}`;
  const main = lowRes ? 'lr' : 'static';
  return `${prefix}/${main}/${type}/website/${datePart}`;
}
