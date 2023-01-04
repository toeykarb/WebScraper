const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const FormData = require("form-data");
IMAGES_EXTENSION = ["jpeg", "jpg", "png", "tif", "tiff", "svg"];
const downloadFile = async () => {
  const response = await fetch(
    "http://www.kansallisgalleria.fi/api/image-download?filename=319622.jpg"
  );

  let jsonVal = await response.json();
  console.log(jsonVal);
  [imageBuffer, imageMetadata, extension] = await downloadImage(jsonVal["url"]);
  console.log(imageBuffer);
  console.log(imageMetadata);
  console.log(extension);
};

downloadFile();

const downloadImage = async (url) => {
  try {
    const response = await fetch(url);
    console.log(response.status);
    const contentType = await response.headers.get("content-type");
    console.log(response.headers);
    const buffer = await response.buffer();
    const imageType = await fileType.fromBuffer(buffer);
    if (!imageType?.ext) {
      throw new Error("Invalid image");
    }
    const imageExtension = imageType.ext;
    return [buffer, { contentType }, imageExtension];
  } catch (err) {
    console.log(err);
  }
};

// var options = {
//   method: "GET",
//   url: "http://www.kansallisgalleria.fi/api/image-download",
//   qs: { filename: "1231069.jpg" },
//   headers: { "postman-token": "8bbeeaab-e263-5ed7-ad23-6408498f3711", "cache-control": "no-cache" },
// };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });
