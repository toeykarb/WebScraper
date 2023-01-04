const { DOMParser } = require("xmldom");
const {
  TAGS_MAXIMUM_LENGTH,
  KEYWORDS_SEPARATOR_REGEXP,
  LONG_KEYWORDS_IGNORE_WORDS,
  TEAM_CATALOGS_KEYWORD_SOFT_MAXIMUM_LENGTH,
} = require("./constants/tag");

const isValidXHTML = (text) => {
  let error = null;
  var parser = new DOMParser();
  parser.options.errorHandler = (e) => {
    console.log(e);
    error = e;
  };
  parser.parseFromString(text, "text/xhtml");
  return !error;
};
const hasMatchingChars = (text, inChar, outChar) => {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) === inChar) {
      count += 1;
    }
    if (text.charAt(i) === outChar) {
      count -= 1;
    }
    if (count < 0) {
      return false;
    }
  }
  return count === 0;
};
const trim = (text) => {
  let newText = text;
  while (true) {
    text = newText;
    newText = newText.trim();
    newText = newText.replace(/\<br\/\>$/g, "");
    newText = newText.replace(/\<br \/\>$/g, "");
    newText = newText.replace(/\<br\>\<\/br\>$/g, "");
    newText = newText.replace(/^\<br\/\>/g, "");
    newText = newText.replace(/^\<br \/\>/g, "");
    newText = newText.replace(/^\<br\>\<\/br\>/g, "");
    if (newText === text) {
      break;
    }
  }
  return newText;
};
const split = (text) => {
  text = text.trim();
  const tokenized = text.split(/(\. |\? |! |\<br \/\>|\<br\/\>|\<br\>\<\/br\>)/g);
  let length = 0;

  const index = tokenized.findIndex((sentence, index) => {
    length += sentence.length;

    const innerWords = sentence.split(" ");
    const lastWord = innerWords[innerWords.length - 1];
    const nextSentence = tokenized[index + 1];

    if (innerWords.length < 2) {
      return false;
    }
    if (lastWord.length < 2) {
      return false;
    }
    if (
      lastWord.toLowerCase() !== lastWord &&
      lastWord.length < 5 &&
      nextSentence &&
      !nextSentence.startsWith("<")
    ) {
      return false;
    }
    if (!isValidXHTML(text.substring(0, length))) {
      return false;
    }
    if (!isValidXHTML(text.substring(length))) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), "(", ")")) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), "<", ">")) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), "[", "]")) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), "{", "}")) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '"', '"')) {
      return false;
    }
    return true;
  });

  if (index >= 0) {
    const first = tokenized.slice(0, index + 2).join("");
    const second = text.substring(first.length);
    return {
      description: trim(first),
      descriptionMore: trim(second),
    };
  } else {
    return {
      description: text,
      descriptionMore: "",
    };
  }
};

/**
 * @param {string} input
 * @param {string} [prefix='']
 * @param {object} [options={}]
 * @param {RegExp} [options.keywordSeparator=KEYWORDS_SEPARATOR_REGEXP]
 * @param {boolean} [options.ensureMaxLength=true]
 * @param {number} [options.keywordSoftMaxLength=KEYWORD_SOFT_MAXIMUM_LENGTH]
 * @param {number} [options.tagsMaxLength=TAGS_MAXIMUM_LENGTH]
 * @param {boolean} [options.removeNonAlphaNumericChars=false]
 * @return {string[]}
 */
module.exports.cleanupAndSplitTagsInput = (input, prefix = "", options = {}) => {
  if (!Array.isArray(input) && typeof input !== "string") {
    return [];
  }
  const {
    keywordSeparator = KEYWORDS_SEPARATOR_REGEXP,
    ensureMaxLength = true,
    keywordSoftMaxLength = TEAM_CATALOGS_KEYWORD_SOFT_MAXIMUM_LENGTH,
    tagsMaxLength = TAGS_MAXIMUM_LENGTH,
    removeNonAlphaNumericChars = false,
  } = options;
  const tags = input
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/["“”`/\\^+)(]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(keywordSeparator)
    .filter((t) => t.length > 0)
    .map((t) => {
      if (removeNonAlphaNumericChars) {
        t = t.replace(new RegExp("[^a-z0-9_ ]", "gi"), "");
      }
      if (typeof prefix === "string" && prefix.length > 0) {
        return t.trimStart().startsWith(prefix)
          ? t
          : `${prefix}${t
              .split(" ")
              .map((st) => st.trimStart())
              .join("")}`;
      }
      return t.trim();
    });

  if (!ensureMaxLength) {
    return tags;
  }
  return tags
    .map((t) => {
      if (t.length > keywordSoftMaxLength && t.trim().match(new RegExp("^[^#~$@&]"))) {
        const tList = t
          .split(" ")
          .filter((st) => st.length > 1 && !LONG_KEYWORDS_IGNORE_WORDS.includes(st.trim()))
          .join(" ")
          .split(" ")
          .map((st) => st.trim())
          .filter((st) => st.length > 1);

        const longWordsSplits = [];
        for (let i = 0; i < tList.length; i += 1) {
          longWordsSplits.push(tList[i].substring(0, keywordSoftMaxLength).trim());
        }
        return longWordsSplits.filter((st) => st.trim().length > 1);
      }
      if (t.length > tagsMaxLength) {
        return t.substring(0, tagsMaxLength);
      }

      return t;
    })
    .flat()
    .filter((t) => t.trim().length > 0);
};
module.exports.IMAGES_EXTENSION = ["jpeg", "jpg", "png", "tif", "tiff", "svg"];
module.exports.IGNORE_WORD = [
  "",
  "in",
  "on",
  "at",
  "the",
  "of",
  "is",
  "am",
  "are",
  "and",
  "by",
  "for",
  "a",
];
module.exports.CC0_TAGS = [
  "photo",
  "image",
  "cc0",
  "creative commons",
  "creative commons 0",
  "public domain",
];
module.exports.mimeTypeMapping = async (fileExtension) => {
  const formatContentTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    png: "image/png",
    webp: "image/webp",
    svg: "image/svg+xml",
    psd: "image/vnd.adobe.photoshop",
    zip: "application/zip",
    pdf: "application/pdf",
    eps: "application/postscript",
    tiff: "image/tiff",
    tif: "image/tif",
    default: "application/octet-stream",
  };
  const mime = formatContentTypes[fileExtension.trim().toLowerCase()] || formatContentTypes.default;
  return mime;
};
module.exports.splitText = split;
module.exports.stockphotoTags = [
  "Shutterstock",
  "Getty",
  "iStock",
  "Stocksy",
  "Depositphotos",
  "Dreamstime",
  "Envato",
  "Adobe",
  "Pixabay",
  "Pexels",
  "Unsplash",
  "123rf",
  "bigstock",
  "alamy",
  "stocksnap",
  "canva",
  "offset",
  "pound5",
  "snappa",
  "reuters",
  "AP ",
  "eyeem",
  "Yourworkforthem",
  "Creative Market",
];
