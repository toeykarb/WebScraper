const DOMParser = require('xmldom').DOMParser;

const isValidXHTML = (text) => {
  let error = null;
  var parser = new DOMParser();
  parser.options.errorHandler = (e) => {
    console.log(e);
    error = e;
  };
  parser.parseFromString(text, 'text/xhtml');
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
    newText = newText.replace(/\<br\/\>$/g, '');
    newText = newText.replace(/\<br \/\>$/g, '');
    newText = newText.replace(/\<br\>\<\/br\>$/g, '');
    newText = newText.replace(/^\<br\/\>/g, '');
    newText = newText.replace(/^\<br \/\>/g, '');
    newText = newText.replace(/^\<br\>\<\/br\>/g, '');
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

    const innerWords = sentence.split(' ');
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
      !nextSentence.startsWith('<')
    ) {
      return false;
    }
    if (!isValidXHTML(text.substring(0, length))) {
      return false;
    }
    if (!isValidXHTML(text.substring(length))) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '(', ')')) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '<', '>')) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '[', ']')) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '{', '}')) {
      return false;
    }
    if (!hasMatchingChars(text.substring(0, length), '"', '"')) {
      return false;
    }
    return true;
  });

  if (index >= 0) {
    const first = tokenized.slice(0, index + 2).join('');
    const second = text.substring(first.length);
    return {
      description: trim(first),
      descriptionMore: trim(second),
    };
  } else {
    return {
      description: text,
      descriptionMore: '',
    };
  }
};

module.exports.splitText = split;
