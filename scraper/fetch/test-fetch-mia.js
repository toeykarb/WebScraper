const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const FormData = require("form-data");
IMAGES_EXTENSION = ["jpeg", "jpg", "png", "tif", "tiff", "svg"];
const downloadFile = async (url) => {
  console.log(url);

  const response = await fetch(url, {
    method: "GET",
  });
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
};

downloadFile(
  "https://www.artic.edu/iiif/2/034a0d6e-e0b0-0a3f-8928-e2c4d762c28a/full/!3000,3000/0/default.jpg"
).then(([imageBuffer, imageMetadata, extension]) => {
  console.log(imageBuffer);
  console.log("extension", extension);
  console.log(imageMetadata);
  console.log("imageMetadata.contentType", imageMetadata.contentType);
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
