// Thresholds for the number of characters in a text before we split it to individual keyword..
const KEYWORD_SOFT_MAXIMUM_LENGTH = 42;
const TAGS_MAXIMUM_LENGTH = 255;
const TEAM_CATALOGS_KEYWORD_SOFT_MAXIMUM_LENGTH = 100;
// Regexp to split a long phrase into keywords.
const KEYWORDS_SEPARATOR_REGEXP = /[\t\n\r\f\v,‚„،，.;|`"“”)(]+/;
// Regexp to split with space a long phrase into keywords.
const KEYWORDS_WHITESPACE_REGEXP = /[\s\t\n\r\f\v,‚„،，.;|`"“”)(]+/;
// Regexp used to find roman dates XVVII, MCMXCVIII, etc.
const ROMAN_DATE_REGEXP = /\bM{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/gi;
const UNICODE_REGEXP = /[^\x20-\x7E]/gi;
// Regexp to find phone numbers 0123456789, +123456789, 123-456-789, etc.
const PHONE_NUMBER_REGEXP = /\b[0-9]{3,4}[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b/gi;
// Words to remove from the keywords when we create them from a long text.
const LONG_KEYWORDS_IGNORE_WORDS = [
  "which",
  "what",
  "where",
  "when",
  "how",
  "many",
  "much",
  "be",
  "might",
  "this",
  "that",
  "these",
  "will",
  "would",
  "can",
  "or",
  "uno",
  "una",
  "mi",
  "tu",
  "tes",
  "te",
  "in",
  "on",
  "at",
  "the",
  "of",
  "is",
  "am",
  "del",
  "al",
  "el",
  "et",
  "il",
  "are",
  "and",
  "doing",
  "by",
  "nor",
  "you",
  "we",
  "they",
  "it",
  "its",
  "de",
  "la",
  "par",
  "le",
  "an",
  "to",
  "their",
  "no",
  "did",
  "di",
  "his",
  "her",
  "if",
  "do",
  "cannot",
  "cant",
  "for",
  "over",
  "negro",
  "negroes",
  "negros",
  "nigger",
  "fuck",
  "shit",
  "slut",
  "as",
  "up",
  "off",
  "per",
  "via",
  "their",
  "about",
  "after",
  "under",
  "from",
  "into",
  "during",
  "until",
  "till",
  "upon",
  "toward",
  "towards",
  "without",
  "with",
  "since",
  "ago",
  "but",
  "circa",
  "la",
  "le",
  "elle",
  "lui",
  "les",
  "a",
];
module.exports = Object.freeze({
  LONG_KEYWORDS_IGNORE_WORDS,
  KEYWORD_SOFT_MAXIMUM_LENGTH,
  TAGS_MAXIMUM_LENGTH,
  TEAM_CATALOGS_KEYWORD_SOFT_MAXIMUM_LENGTH,
  KEYWORDS_SEPARATOR_REGEXP,
  KEYWORDS_WHITESPACE_REGEXP,
  ROMAN_DATE_REGEXP,
  UNICODE_REGEXP,
  PHONE_NUMBER_REGEXP,
});
