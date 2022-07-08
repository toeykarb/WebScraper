const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fileType = require('file-type');
const FormData = require('form-data');

const downloadFile = async (url) => {
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
  // console.log(contentType);
  // const imageType = (await fileType.fromBuffer(buffer)) || {
  //   ext: "t",
  // };
  // if (!imageType?.ext) {
  //   throw new Error(`Invalid image - ${url}`);
  // }
  // const imageExtension = imageType.ext.replace("xml", "svg");

  // @ts-ignore
  return [buffer, { contentType }];
};
// const downloadFile = async (url) => {
//   const encoded_url = new URL(url);
//   console.log(`Downloading: ${encoded_url.href}`);
//   // @ts-ignore
//   const result = await fetch(encoded_url.href)
//     .then((response) => {
//       if (response.ok) {
//         return response;
//       }
//       return Promise.reject(
//         new Error(
//           `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`
//         )
//       );
//     })
//     .then(
//       /**
//        * @param {import('node-fetch').Response} response
//        * @return {Promise<[Buffer, {contentType:string}]>}
//        */
//       (response) => {
//         const contentType = response.headers.get("content-type");
//         return Promise.all([
//           response.buffer(),
//           Promise.resolve({
//             contentType,
//           }),
//         ]);
//       }
//     );
//   return result;
// };

downloadFile('https://6.api.artsmia.org/800/76.jpg').then(([imageBuffer, imageMetadata]) => {
  console.log(imageBuffer);
  // console.log(extension);
  // console.log("newextension", newextension);
  console.log(imageMetadata);
});
