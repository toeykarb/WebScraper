/**
 * Returns year, month, day parts UTC value of a given date in the format YYYY-MM-DD
 * @param {Date} date
 * @return {{y:string,m:string,d:string}}
 */
module.exports.getFormattedUTCParts = (date) => ({
  y: `${date.getUTCFullYear()}`,
  m: `0${date.getUTCMonth() + 1}`.slice(-2),
  d: `0${date.getUTCDate()}`.slice(-2),
});

/**
 * Return the given UTC date in the format YYYY-MM-DD
 * @param {Date} date
 * @return {string}
 */
module.exports.getFormattedUTCDate = (date) =>
  `${date.getUTCFullYear()}-${`0${date.getUTCMonth() + 1}`.slice(
    -2,
  )}-${`0${date.getUTCDate()}`.slice(-2)}`;

/**
 * Return the given UTC date in short format (01/Aug/2021)
 * @param {Date} date
 * @return {string}
 */
module.exports.getShortUTCDate = (date, locale = 'default') => {
  const day = `${`0${date.getUTCDate()}`.slice(-2)}`;
  const month = date.toLocaleString(locale, {
    timeZone: 'UTC',
    month: 'short',
  });
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Return the given locale date in short format (01/Aug/2021)
 * @param {Date} date
 * @return {string}
 */
module.exports.getShortLocaleDate = (date, locale = 'default') => {
  const day = `${`0${date.getDate()}`.slice(-2)}`;
  const month = date.toLocaleString(locale, {
    month: 'short',
  });
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
