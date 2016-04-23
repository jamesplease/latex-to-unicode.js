// Load all of our data
var aliases = require('./data/aliases');
var subscripts = require('./data/subscripts');
var superscripts = require('./data/superscripts');
var symbols = require('./data/symbols');
var textbb = require('./data/textbb');
var textbf = require('./data/textbf');
var textcal = require('./data/textcal');
var textfrak = require('./data/textfrak');
var textit = require('./data/textit');
var textmono = require('./data/textmono');

// Replace all occurences of `search` by `replacement` within the string
// Its use RegExp because `g` flag is not supported in Node
// Moreover, it has to escape the reserved char of `search` 
String.prototype.replaceAll = function(search, replacement) {
  search = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return this.replace(new RegExp(search, 'g'), replacement);
};

// Replace some latex symbols with their alias equivalent
function convertAliases(str) {
  for (var i = 0; i < aliases.length; i++) {
    str = str.replaceAll(aliases[i][0], aliases[i][1]);
  }
  return str;
}

// Replace each '\alpha', '\beta' and similar latex symbols with
// their unicode representation.
function convertLatexSymbols(str) {
  for (var i = 0; i < symbols.length; i++) {
    str = str.replaceAll(symbols[i][0], symbols[i][1]);
  }
  return str;
}

// Example: modifier = '^', D = superscripts
// This will search for the ^ signs and replace the next
// digit or (digits when {} is used) with its/their uppercase representation
function applyModifier(text, modifier, D) {
  text = text.replaceAll(modifier, '^');
  var newtext = '';
  var modeNormal = 0;
  var modeModified = 1;
  var modeLong = 2;

  var mode = modeNormal;
  var ch;

  for (var i = 0; i < text.length; i++) {
    ch = text[i];
    if (mode == modeNormal && ch == '^') {
      mode = modeModified;
      continue;
    } else if (mode == modeModified && ch == '{') {
      mode = modeLong;
      continue;
    } else if (mode == modeModified) {
      newtext += D[ch] !== undefined ? D[ch] : ch;
      mode = modeNormal;
      continue;
    } else if (mode == modeLong && ch == '}') {
      mode = modeNormal;
      continue;
    }

    if (mode == modeNormal) {
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

// Find the content enclosed by brackets
// It will also return the index of the closing bracket associated
// with the opening one starting at position `i` of the string `str`
function parseBracket(str, i, bracket) {
  var open = bracket[0];
  var close = bracket[1];
  var start = i;
  if (str[i] != open) return ['', 0];

  var n = 1;
  var out = '';
  i++;

  while (n > 0 && i < str.length) {
    if (str[i] === open) n++;
    if (str[i] === close) n--;
    if (n != 0 || str[i] != close) out += str[i];
    i++; 
  }

  return [out, i - start];
}

// Convert fractions (\frac{a}{b})
function convertFrac(str) {
  var key = '\\frac';
  while (str.indexOf(key) != -1) {
    var idx = str.indexOf(key);
    var num = parseBracket(str, idx + key.length, '{}');
    var den = parseBracket(str, idx + key.length + num[1], '{}');
    var n = convertFrac(num[0]);
    var d = convertFrac(den[0]);
    var frac = '';
  
    if (n == '1' && d == '2') frac = '½';
    if (n == '1' && d == '3') frac = '⅓';
    if (n == '1' && d == '4') frac = '¼';
    if (n == '1' && d == '5') frac = '⅕';
    if (n == '1' && d == '6') frac = '⅙';
    if (n == '1' && d == '8') frac = '⅛';
    if (n == '2' && d == '3') frac = '⅔';
    if (n == '2' && d == '5') frac = '⅖';
    if (n == '3' && d == '4') frac = '¾';
    if (n == '3' && d == '5') frac = '⅗';
    if (n == '3' && d == '8') frac = '⅜';
    if (n == '4' && d == '5') frac = '⅘';
    if (n == '5' && d == '6') frac = '⅚';
    if (n == '5' && d == '8') frac = '⅝';
    if (n == '7' && d == '8') frac = '⅞';

    if (frac === '') frac = '(' + n + ' / ' + d + ')';
  
    var subLeft = str.substring(0, idx);
    var subRight = str.substring(idx + key.length + num[1] + den[1]);
    str = subLeft + frac + subRight;
  }
  return str;
}

// Convert square roots (\sqrt[a]{b})
function convertSqrt(str) {
  var key = "\\sqrt";
  while (str.indexOf(key) != -1) {
    var idx = str.indexOf(key);
    var degree = parseBracket(str, idx + key.length, "[]");
    var radicand = parseBracket(str, idx + key.length + degree[1], "{}");
    var d = convertSqrt(degree[0]);
    var r = convertSqrt(radicand[0]);
    var sqrt = "";

    if (degree[1] === 0 && radicand[1] === 0) sqrt = "√";
    if (d == "2" || d === "") sqrt = "√(" + r + ")";
    if (d == "3") sqrt = "∛(" + r + ")";
    if (d == "4") sqrt = "∜(" + r + ")";

    if (sqrt === "") {
      var modified = applyModifier("^{" + d + "}", "^", superscripts);
      sqrt = modified + "√(" + r + ")";
    }

    var subLeft = str.substring(0, idx);
    var subRight = str.substring(idx + key.length + degree[1] + radicand[1]);
    str = subLeft + sqrt + subRight;
  }
  return str;
}

// Convert binoms (\binom{a}{b})
function convertBinom(str) {
  var key = "\\binom";
  while (str.indexOf(key) != -1) {
    var idx = str.indexOf(key);
    var nParse = parseBracket(str, idx + key.length, "{}");
    var kParse = parseBracket(str, idx + key.length + nParse[1], "{}");
    var n = convertBinom(nParse[0]);
    var k = convertBinom(kParse[0]);
    var binom = "(" + n + " ¦ " + k + ")";

    var subLeft = str.substring(0, idx);
    var subRight = str.substring(idx + key.length + nParse[1] + kParse[1]);
    str = subLeft + binom + subRight;
  }
  return str;
}

// Replace str with unicode representations
module.exports = function(str) {

  str = convertAliases(str);
  str = convertLatexSymbols(str);
  str = applyAllModifiers(str);
  str = convertFrac(str);
  str = convertSqrt(str);
  str = convertBinom(str);

  return str;
};
