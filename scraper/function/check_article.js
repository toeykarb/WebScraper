// function main() {
//   console.log('Start....');
//   let resultStr = '';
//   var Val = 'AACBCBDDA';
//   console.log(Val);
//   var str = Val.split('');
//   var ArrStr = str.filter(onlyUnique);
//   console.log(ArrStr);
//   for (var i = 0; i < ArrStr.length; i++) {
//     console.log(ArrStr[i]);
//     const nextStr = countString(ArrStr[i], Val);

function main() {
  var dict = new Object();
  var Val = 'AACBCBDDA';
  var result = '';
  for (var i = 0; i < Val.length; i++) {
    if (dict.hasOwnProperty(Val[i])) {
      dict[Val[i]] += 1;
    } else {
      dict[Val[i]] = 1;
    }
  }
  const unique = Object.keys(dict);
  console.log(unique);
  for (var i = 0; i < unique.length; i++) {
    result += `${dict[unique[i]]}${unique[i]}`;
  }
  console.log(result);
}

main();
