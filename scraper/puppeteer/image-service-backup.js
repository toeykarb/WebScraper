/* eslint-disable default-param-last, import/no-extraneous-dependencies */
// @ts-check
const AWS = require("aws-sdk");
const { CATALOG_IDS } = require("../constants/catalogs");

const sqs = new AWS.SQS({ apiVersion: "2012-11-05", region: "us-west-2" });

const nanoid = () => {
  const firstEntropy = Math.floor(Math.random() * 46656);
  const secondEntropy = Math.floor(new Date().getTime());
  const firstPart = `000${firstEntropy.toString(36)}`.slice(-3);
  const secondPart = `000${secondEntropy.toString(36)}`.slice(-4);
  return `${firstPart}${secondPart}`;
};

const getServiceOperationQueueName = (service, operation, fifo = true) =>
  `service-${service}-${operation}-${process.env.DOCKER_ENVIRONMENT}${[
    process.env.DOCKER_ENVIRONMENT === "local" ? `-${process.env.RAWPIXEL_DEVELOPER}` : "",
  ]}${fifo ? ".fifo" : ""}`;

module.exports = async (result) => {
  const {
    // articleId,
    url: pageLink,
    sourceLink = "",
    imageS3Key,
    imageSize,
    imageName,
    imageDimensions,
    tags = [],
    titleTag = [],
  } = result;

  await postMessage(
    imageS3Key,
    imageSize,
    imageName,
    imageDimensions,
    [...tags, ...titleTag],
    sourceLink,
    pageLink
  );

  console.log("Posted to image service");
};

const postMessage = (
  s3FileKey,
  fileSize,
  name,
  { width = 0, height = 0 } = {},
  tags,
  sourceLink = null,
  pageLink,
  executeAutomaticKeywords = true
) => {
  const changes = [];
  if (tags) {
    changes.push({
      action: "addTags",
      field: "hashtags",
      values: tags,
    });
  }

  if (sourceLink) {
    changes.push({
      action: "set",
      field: "concepttool",
      values: [sourceLink],
    });
  }
  if (pageLink) {
    changes.push({
      action: "set",
      field: "weblink",
      values: [pageLink],
    });
  }

  if (width && height) {
    console.log({ width, height });
    changes.push({
      action: "set",
      field: "width",
      values: [width],
    });
    changes.push({
      action: "set",
      field: "height",
      values: [height],
    });
  }

  const isJpegOrPng = ["jpeg", "jpg", "png"].includes(s3FileKey.split(".").pop().toLowerCase());
  /** @type {import('../types/job').Operation} */
  const messageData = {
    catalogId: CATALOG_IDS.TEAM,
    executeAutomaticKeywords: isJpegOrPng && executeAutomaticKeywords,
    s3Key: s3FileKey,
    filesize: fileSize,
    name,
    originalName: name,
    changes: changes,
  };
  console.log(JSON.stringify(messageData));

  const queueName = getServiceOperationQueueName("image", "create");
  const messageParams = {
    QueueUrl: `https://sqs.us-west-2.amazonaws.com/996220749359/${queueName}`,
    MessageBody: JSON.stringify(messageData),
    MessageGroupId: String(name.replace(/[^a-z0-9_]/gi, "-").substring(0, 128)),
  };

  return sqs.sendMessage(messageParams).promise();
};

module.exports.sendImageUpdate = async (imageId, changes) => {
  const queueName = getServiceOperationQueueName("image", "update");
  const messageParams = {
    QueueUrl: `https://sqs.us-west-2.amazonaws.com/996220749359/${queueName}`,
    MessageBody: JSON.stringify({
      ids: [imageId],
      changes,
    }),
    MessageGroupId: String(`scraping-update-${imageId}`),
  };

  return sqs.sendMessage(messageParams).promise();
};
