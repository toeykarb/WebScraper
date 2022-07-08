const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fileType = require('file-type');
const FormData = require('form-data');
IMAGES_EXTENSION = ['jpeg', 'jpg', 'png', 'tif', 'tiff', 'svg'];
const downloadFile = async (url) => {
  console.log(url);
  try {
    const response = await fetch(url);
    console.log(response.status);
    const contentType = await response.headers.get('content-type');
    console.log(response.headers);
    const buffer = await response.buffer();

    const imageType = await fileType.fromBuffer(buffer);
    if (!imageType?.ext) {
      throw new Error('Invalid image');
    }
    const imageExtension = imageType.ext;
    return [buffer, { contentType }, imageExtension];
  } catch (err) {
    console.log(err);
  }
};

downloadFile('https://3.api.artsmia.org/full/21066.jpg').then(([imageBuffer, imageMetadata, extension]) => {
  console.log(imageBuffer);
  console.log(extension);
  console.log(imageMetadata);
  console.log(imageMetadata.contentType);
  if (!imageMetadata.contentType) {
    if (![...IMAGES_EXTENSION].includes(extension)) {
      console.log(`Invalid image extension ${extension} for ${url} - skip scraping`);
      // return {
      //   statusCode: 200,
      //   body: {
      //     message: `Image link not present on page - skip scraping  ${url}`,
      //   },
      // };
    } else {
      imageMetadata.contentType = `image/${extension}`;
    }
  }
  console.log(imageMetadata);
});
