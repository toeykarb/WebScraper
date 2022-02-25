const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const FormData = require("form-data");

const downloadFile = async (url) => {
  console.log(url);
  const response = await fetch(url);

  const contentType = await response.headers.get("content-type");

  const buffer = await response.buffer();

  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;
  return [buffer, contentType, imageExtension];
};

downloadFile(
  "https://openclipart.org/detail/335501/year-of-the-tiger-circles"
).then(([imageBuffer, imageMetadata, extension]) => {
  console.log(imageBuffer);
  console.log(extension);
  console.log(imageMetadata);
});
