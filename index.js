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

// Replace each "\alpha", "\beta" and similar latex symbols with
// their unicode representation.
function convertLatexSymbols(str) {
  for (var i = 0; i < symbols.length; i++) {
    str = str.replace(symbols[i][0], symbols[i][1], 'g');
  }
  return str;
}

// Example: modifier = "^", D = superscripts
// This will search for the ^ signs and replace the next
// digit or (digits when {} is used) with its/their uppercase representation.
function applyModifier(text, modifier, D) {
  text = text.replace(modifier, "^", "g");
  var newtext = "";
  var mode_normal = 0;
  var mode_modified = 1;
  var mode_long = 2;

  var mode = mode_normal;
  var ch;

  for (var i = 0; i < text.length; i++) {
    ch = text[i];
    if (mode == mode_normal && ch == '^') {
      mode = mode_modified;
      continue;
    } else if (mode == mode_modified && ch == '{') {
      mode = mode_long;
      continue;
    } else if (mode == mode_modified) {
      newtext += D[ch] !== undefined ? D[ch] : ch;
      mode = mode_normal;
      continue;
    } else if (mode == mode_long && ch == '}') {
      mode = mode_normal;
      continue;
    }

    if (mode == mode_normal) {
      newtext += ch;
    } else {
      newtext += D[ch] !== undefined ? D[ch] : ch;
    }
  }
  return newtext;
}

// Apply all of the modifiers
function applyAllModifiers(str) {
  str = applyModifier(str, '^', superscripts);
  str = applyModifier(str, '_', subscripts);
  str = applyModifier(str, '\\bb', textbb);
  str = applyModifier(str, '\\bf', textbf);
  str = applyModifier(str, '\\it', textit);
  str = applyModifier(str, '\\cal', textcal);
  str = applyModifier(str, '\\frak', textfrak);
  str = applyModifier(str, '\\mono', textmono);
  return str;
}

// Replace str with unicode representations
module.exports = function(str) {

  str = convertLatexSymbols(str);

  str = applyAllModifiers(str);

  return str;
};
