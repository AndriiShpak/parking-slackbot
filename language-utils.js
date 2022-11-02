const plateCharsMap = {
  'А': 'A',
  'В': 'B',
  'Е': 'E',
  'І': 'I',
  'К': 'K',
  'М': 'M',
  'Н': 'H',
  'О': 'O',
  'Р': 'P',
  'С': 'C',
  'Т': 'T',
  'У': 'Y',
  'Х': 'X',
}


function ukranianToEnglishCharsInPlate(str) {
  str = str || '';
  var result = [];

  for (var i = 0; i < str.length; i++) {
    result.push(plateCharsMap[str[i]] ? plateCharsMap[str[i]] : str[i]);
  }

  return result.join('');
}

module.exports = {
  ukranianToEnglishCharsInPlate,
}
