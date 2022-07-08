const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const FileType = require('file-type');
const FormData = require('form-data');
IMAGES_EXTENSION = ['jpeg', 'jpg', 'png', 'tif', 'tiff', 'svg'];
const downloadFile = async (url) => {
  console.log(url);
  const response = await fetch(url);
  var resText = await response.text();

  console.log(resText);

  var res = await response.json();

  return [res];
};

downloadFile('https://search.artsmia.org/id/74041').then(([res]) => {
  console.log(res);
});
