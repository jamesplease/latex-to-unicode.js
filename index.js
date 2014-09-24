// Load all of our data
var subscripts = require('./data/subscripts');
var superscripts = require('./data/superscripts');
var symbols = require('./data/symbols');
var textbb = require('./data/textbb');
var textbf = require('./data/textbf');
var textcal = require('./data/textcal');
var textfrak = require('./data/textfrak');
var textit = require('./data/textit');
var textmono = require('./data/textmono');

// Attempts to find a replacement for a value in one
// of our objects. If none exists, it returns the
// original object
var attemptReplace = function(obj, key) {
  return obj[key] !== undefined ? obj[key] : key;
};

// Loops through our string, converting all of the symbols
// that it finds. It also handles grouped symbols, as in:
// \frak{ABC}
function applyModifier(text, modifier, obj) {
  text = text.replace(modifier, '^');
  var newText = '', mode = 'normal', i, unit;

  for (i = 0; i < text.length; i++) {
    unit = text[i];
    if (mode === 'normal' && unit === '^') {
      mode = 'modified';
      continue;
    } else if (mode === 'modified' && unit === '{') {
      mode = 'long';
      continue;
    } else if (mode === 'modified') {
      newText += attemptReplace(obj, unit);
      mode = 'normal';
      continue;
    } else if (mode === 'long' && unit === '}') {
      mode = 'normal';
      continue;
    }

    if (mode === 'normal') {
      newText += unit;
    } else {
      newText += attemptReplace(obj, unit);
    }
  }

  return newText;
}

// Replace str with unicode representations
module.exports = function(str) {

  // Replace all of our symbols
  Object.keys(symbols).forEach(function(key) {
    var val = symbols[key];
    str = str.replace(key, val);
  });

  // Apply all of the modifiers
  str = applyModifier(str, '^', superscripts);
  str = applyModifier(str, '_', subscripts);
  str = applyModifier(str, '\\bb', textbb);
  str = applyModifier(str, '\\bf', textbf);
  str = applyModifier(str, '\\it', textit);
  str = applyModifier(str, '\\cal', textcal);
  str = applyModifier(str, '\\frak', textfrak);
  str = applyModifier(str, '\\mono', textmono);

  return str;
};
