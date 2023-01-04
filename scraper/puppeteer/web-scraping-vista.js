const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const scrapeVistaTemplate = async () => {
  const url =
    'https://create.vista.com/api/v2/search/templates?limit=50&skip=0&templateType=regular%2Canimated&searchByKeyword=false&section=templatesPage&q=fourth+july&_ga=GA1.1.1850159779.1658132136';
  // @ts-ignore
  const response = await fetch(url);
  const contentType = await response.headers.get('content-type');
  var buffer = await response.buffer();
  const checksvg = contentType.toString().replace('+xml', '');
  console.log(checksvg);
  const imageExtension = checksvg.split('/');
  console.log(imageExtension[0]);
  if (imageExtension[0] != 'image') {
    console.log('error');
  }
  
  return [buffer, { contentType }];
};
scrapeVistaTemplate();