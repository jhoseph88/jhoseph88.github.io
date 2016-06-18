require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  Transformation rules for Brill's POS tagger
  Copyright (C) 2015 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Usage: 
// transformationRules = new BrillTransformationRules();
// transformationRules.rules.forEach(function(ruleFunction) {
//   ruleFunction(taggedSentence, i);
// });
// where taggedSentence is an array of arrays of the form:
// [[the, DET], [red, JJ], [book, NN]] and i the position to be processed

function BrillTransformationRules() {
  this.rules = [rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8];
}

BrillTransformationRules.prototype.getRule = function(index) {
  return(this.rules[index]);
};

BrillTransformationRules.prototype.setRule = function(index, rule) {
  this.rules[index] = rule;
};

BrillTransformationRules.prototype.appendRule = function(rule) {
  this.rules[this.rules.length] = rule;
};

BrillTransformationRules.prototype.setRules = function(newRules) {
  this.rules = newRules;
};

BrillTransformationRules.prototype.getRules = function() {
  return(this.rules);
};

/**
 * Indicates whether or not this string starts with the specified string.
 * @param {Object} string
 */
function startsWith($this, string) {
  if (!string) {
    return false;
  }
  return $this.indexOf(string) == 0;
}

/**
 * Indicates whether or not this string ends with the specified string.
 * @param {Object} string
 */
function endsWith($this, string) {
  if (!string || string.length > $this.length) {
    return false;
  }
  return $this.indexOf(string) == $this.length - string.length;
}

//  rule 1: DT, {VBD | VBP} --> DT, NN
function rule1(taggedSentence, index) {
  if ((index > 0) && (taggedSentence[index - 1][1] === "DT")) {
    if ((taggedSentence[index][1] === "VBD") ||
      (taggedSentence[index][1] === "VBP") ||
      (taggedSentence[index][1] === "VB")) {
      taggedSentence[index][1] = "NN";
    }
  }
}

// rule 2: convert a noun to a number (CD) if "." appears in the word
function rule2(taggedSentence, index) {
  if (startsWith(taggedSentence[index][1], "N")) {
    if (taggedSentence[index][0].indexOf(".") > -1) {
      // url if there are two contiguous alpha characters
      if (/[a-zA-Z]{2}/.test(taggedSentence[index][0])) {
        taggedSentence[index][1] = "URL";
      }
      else {
        taggedSentence[index][1] = "CD";
      }
    }
    // Attempt to convert into a number
    if (!isNaN(parseFloat(taggedSentence[index][0]))) {
      taggedSentence[index][1] = "CD";
    }
  }
}

// rule 3: convert a noun to a past participle if words[i] ends with "ed"
function rule3(taggedSentence, index) {
  if (startsWith(taggedSentence[index][1], "N") && endsWith(taggedSentence[index][0], "ed")) {
    taggedSentence[index][1] = "VBN";
  }
}

// rule 4: convert any type to adverb if it ends in "ly";
function rule4(taggedSentence, index) {
  if (endsWith(taggedSentence[index][0], "ly")) {
    taggedSentence[index][1] = "RB";
  }
}

// rule 5: convert a common noun (NN or NNS) to a adjective if it ends with "al"
function rule5(taggedSentence, index) {
  if (startsWith(taggedSentence[index][1], "NN") && endsWith(taggedSentence[index][0], "al")) {
    taggedSentence[index][1] = "JJ";
  }
}

// rule 6: convert a noun to a verb if the preceding work is "would"
function rule6(taggedSentence, index) {
  if ((index > 0) && startsWith(taggedSentence[index][1], "NN") && (taggedSentence[index][0].toLowerCase() === "would")) {
    taggedSentence[index][1] = "VB";
  }
}

// rule 7: if a word has been categorized as a common noun and it ends with "s",
//         then set its type to plural common noun (NNS)
function rule7(taggedSentence, index) {
  if ((taggedSentence[index][1] === "NN") && (endsWith(taggedSentence[index][0], "s"))) {
    taggedSentence[index][1] = "NNS";
  }
}

// rule 8: convert a common noun to a present participle verb (i.e., a gerund)
function rule8(taggedSentence, index) {
  if (startsWith(taggedSentence[index][1], "NN") && endsWith(taggedSentence[index][0], "ing")) {
    taggedSentence[index][1] = "VBG";
  }
}

module.exports = BrillTransformationRules;
},{}],2:[function(require,module,exports){
/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 */

var TransformationRules = require('./BrillTransformationRules');
var transformationRules = new TransformationRules();

module.exports = POSTagger;
function POSTagger(){
    this.lexicon = require('./lexicon');
}

POSTagger.prototype.wordInLexicon = function(word){
    var ss = this.lexicon[word];
    if (ss != null)
        return true;
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss)
        ss = this.lexicon[word.toLowerCase()];
    if (ss)
        return true;
    return false;
}

POSTagger.prototype.tag = function(words) {
  var taggedSentence = new Array(words.length);

  // Initialise taggedSentence with words and initial categories
  for (var i = 0, size = words.length; i < size; i++) {
    taggedSentence[i] = new Array(2);
    taggedSentence[i][0] = words[i];
    // lexicon maps a word to an array of possible categories
    var ss = this.lexicon[words[i]];
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss)
      ss = this.lexicon[words[i].toLowerCase()];
    if (!ss && (words[i].length === 1))
      taggedSentence[i][1] = words[i] + "^";
    // We need to catch scenarios where we pass things on the prototype
    // that aren't in the lexicon: "constructor" breaks this otherwise
    if (!ss || (typeof ss === "function"))
      taggedSentence[i][1] = "NN";
    else
      taggedSentence[i][1] = ss[0];
  }

  // Apply transformation rules
  taggedSentence.forEach(function(taggedWord, index) {
    transformationRules.getRules().forEach(function(rule) {
      rule(taggedSentence, index);
    });
  });
  return taggedSentence;
}

POSTagger.prototype.prettyPrint = function(taggedWords) {
	for (i in taggedWords) {
        print(taggedWords[i][0] + "(" + taggedWords[i][1] + ")");
    }
}

POSTagger.prototype.extendLexicon = function(lexicon) {
  for (var word in lexicon) {
    if (!this.lexicon.hasOwnProperty(word)) {
      this.lexicon[word] = lexicon[word];
    }
  }
}

//print(new POSTagger().tag(["i", "went", "to", "the", "store", "to", "buy", "5.2", "gallons", "of", "milk"]));

},{"./BrillTransformationRules":1,"./lexicon":4}],3:[function(require,module,exports){
/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the GNU LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 */

module.exports = Lexer;

var re = {
  number: /[0-9]*\.[0-9]+|[0-9]+/ig,
  space: /\s+/ig,
  unblank: /\S/,
  punctuation: /[\/\.\,\?\!\"\'\:\;\$\(\)\#]/ig
}

function LexerNode(string, regex, regexs){
  this.string = string;
  this.children = [];

  if (string) {
    this.matches = string.match(regex);
    var childElements = string.split(regex);
  }

  if (!this.matches) {
    this.matches = [];
    var childElements = [string];
  }

  if (!regexs.length) {
    // no more regular expressions, we're done
    this.children = childElements;
  } else {
    // descend recursively
    var nextRegex = regexs[0]
      , nextRegexes = regexs.slice(1);

    for (var i in childElements) {
      if (childElements.hasOwnProperty(i)) {
        this.children.push(
          new LexerNode(childElements[i], nextRegex, nextRegexes));
      }
    }
  }
}

LexerNode.prototype.fillArray = function(array){
  for (var i in this.children) {
    if (this.children.hasOwnProperty(i)) {
      var child = this.children[i];

      if (child.fillArray) {
        child.fillArray(array);
      } else if (re.unblank.test(child)) {
        array.push(child);
      }

      if (i < this.matches.length) {
        var match = this.matches[i];
        if (re.unblank.test(match))
          array.push(match);
      }
    }
  }
}

LexerNode.prototype.toString = function(){
  var array = [];
  this.fillArray(array);
  return array.toString();
}

function Lexer(){
  // Split by then numbers, then whitespace, then punctuation
  this.regexs = [re.number, re.space, re.punctuation];
}

Lexer.prototype.lex = function(string){
  var array = []
    , node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));
  node.fillArray(array);
  return array;
}

//var lexer = new Lexer();
//print(lexer.lex("I made $5.60 today in 1 hour of work.  The E.M.T.'s were on time, but only barely.").toString());

},{}],4:[function(require,module,exports){
/*
 * Javascript version of Eric Brill's English lexicon.
 */ 

module.exports = {
    "\'": [
        "\""
    ],
    "\"": [
        "\""
    ],
    "Ranavan": [
        "NNP"
    ], 
    "fawn": [
        "NN"
    ], 
    "pro-Soviet": [
        "JJ"
    ], 
    "Hydro-Electric": [
        "NNP"
    ], 
    "waste-disposal": [
        "JJ", 
        "NN"
    ], 
    "chameleons": [
        "NNS"
    ], 
    "clotted": [
        "JJ"
    ], 
    "spiders": [
        "NNS"
    ], 
    "verses": [
        "NNS"
    ], 
    "hanging": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Hawaiian\\/Japanese": [
        "JJ"
    ], 
    "hastily": [
        "RB"
    ], 
    "comically": [
        "RB"
    ], 
    "REIS": [
        "NNP"
    ], 
    "localized": [
        "JJ", 
        "VBN"
    ], 
    "spidery": [
        "JJ"
    ], 
    "disobeying": [
        "VBG"
    ], 
    "marketing-wise": [
        "JJ"
    ], 
    "plant-closing": [
        "JJ"
    ], 
    "Archuleta": [
        "NNP"
    ], 
    "refunding": [
        "VBG", 
        "VBG|NN", 
        "JJ", 
        "NN"
    ], 
    "Western": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "wrought-iron": [
        "JJ"
    ], 
    "Gravesend": [
        "NNP"
    ], 
    "government-to-government": [
        "JJ"
    ], 
    "Euro": [
        "NNP"
    ], 
    "familiarness": [
        "NN"
    ], 
    "slothful": [
        "JJ"
    ], 
    "Valle": [
        "NNP"
    ], 
    "Famed": [
        "JJ"
    ], 
    "Blade": [
        "NNP"
    ], 
    "Poetry": [
        "NNP", 
        "NN"
    ], 
    "Mizell": [
        "NNP"
    ], 
    "plant-modernization": [
        "JJ"
    ], 
    "Rizopolous": [
        "NNP"
    ], 
    "seamier": [
        "JJR"
    ], 
    "wooded": [
        "JJ"
    ], 
    "grueling": [
        "JJ", 
        "VBG"
    ], 
    "Muniz": [
        "NNP"
    ], 
    "Amparano": [
        "NNP"
    ], 
    "Saco": [
        "NNP"
    ], 
    "Miert": [
        "NN"
    ], 
    "Sack": [
        "NNP"
    ], 
    "virtuosos": [
        "NNS"
    ], 
    "circuitry": [
        "NN"
    ], 
    "crotch": [
        "NN"
    ], 
    "Raptopoulos": [
        "NNP"
    ], 
    "Multilateral": [
        "NNP"
    ], 
    "S-D": [
        "NN"
    ], 
    "immunities": [
        "NNS"
    ], 
    "all-news": [
        "JJ"
    ], 
    "Pinkerton": [
        "NNP"
    ], 
    "gaskets": [
        "NNS"
    ], 
    "Kibbutzim": [
        "NNS"
    ], 
    "Shocked": [
        "VBN", 
        "JJ"
    ], 
    "deadheads": [
        "NNS"
    ], 
    "junkification": [
        "NN"
    ], 
    "Dixiecrat": [
        "NNP"
    ], 
    "Honorable": [
        "NNP"
    ], 
    "Olde": [
        "NNP"
    ], 
    "": [], 
    "snuggled": [
        "VBD"
    ], 
    "inanimate": [
        "JJ"
    ], 
    "errors": [
        "NNS"
    ], 
    "Initially": [
        "RB"
    ], 
    "self-reliant": [
        "JJ"
    ], 
    "defenses": [
        "NNS"
    ], 
    "Hamilton": [
        "NNP"
    ], 
    "HCFA": [
        "NNP"
    ], 
    "designing": [
        "VBG"
    ], 
    "numeral": [
        "NN"
    ], 
    "pawed": [
        "VBN"
    ], 
    "Kosonen": [
        "NNP"
    ], 
    "Designcraft": [
        "NNP"
    ], 
    "mailings": [
        "NNS"
    ], 
    "perforations": [
        "NNS"
    ], 
    "Sussman": [
        "NNP"
    ], 
    "affiliates": [
        "NNS", 
        "VBZ"
    ], 
    "advanced-ceramics": [
        "NN", 
        "NNS"
    ], 
    "perfunctorily": [
        "RB"
    ], 
    "malunya": [
        "NN"
    ], 
    "affiliated": [
        "VBN", 
        "JJ"
    ], 
    "Footnotes": [
        "NNS"
    ], 
    "confronts": [
        "VBZ"
    ], 
    "small-screen": [
        "JJ"
    ], 
    "Manger": [
        "NNP"
    ], 
    "Manges": [
        "NNP"
    ], 
    "Bereuter": [
        "NNP"
    ], 
    "kids": [
        "NNS", 
        "VBZ"
    ], 
    "uplifting": [
        "JJ", 
        "VBG"
    ], 
    "Downfall": [
        "NNP"
    ], 
    "deferring": [
        "VBG"
    ], 
    "controversy": [
        "NN"
    ], 
    "Keillor": [
        "NNP"
    ], 
    "neurologist": [
        "NN"
    ], 
    "electric-power": [
        "JJ"
    ], 
    "orthographies": [
        "NNS"
    ], 
    "Hafiz": [
        "NNP"
    ], 
    "sheep-lined": [
        "JJ"
    ], 
    "projection": [
        "NN"
    ], 
    "inflation-induced": [
        "JJ"
    ], 
    "Harvey": [
        "NNP"
    ], 
    "stern": [
        "JJ", 
        "NN"
    ], 
    "insecurity": [
        "NN"
    ], 
    "Vernor": [
        "NNP"
    ], 
    "inevitable": [
        "JJ"
    ], 
    "Vernon": [
        "NNP"
    ], 
    "distortions": [
        "NNS"
    ], 
    "reasserting": [
        "VBG"
    ], 
    "sermons": [
        "NNS"
    ], 
    "grounds-care": [
        "JJ"
    ], 
    "populations": [
        "NNS"
    ], 
    "exuberantly": [
        "RB"
    ], 
    "Sindona": [
        "NNP"
    ], 
    "Hardshell": [
        "NNP"
    ], 
    "lankmark": [
        "NN"
    ], 
    "whole-heartedly": [
        "RB"
    ], 
    "Pedone": [
        "NNP"
    ], 
    "pay-movie": [
        "JJ"
    ], 
    "co-marketing": [
        "JJ"
    ], 
    "intake": [
        "NN"
    ], 
    "morally": [
        "RB"
    ], 
    "Indigo": [
        "NNP"
    ], 
    "Edgardo": [
        "NN"
    ], 
    "non-advertising": [
        "JJ"
    ], 
    "Reichhold": [
        "NNP"
    ], 
    "Gastronomy": [
        "NNP"
    ], 
    "old-guard": [
        "JJ"
    ], 
    "wiretapping": [
        "NN", 
        "VBG"
    ], 
    "deputy": [
        "NN", 
        "JJ"
    ], 
    "wand": [
        "NN"
    ], 
    "R.G.": [
        "NNP"
    ], 
    "grass-fed": [
        "JJ"
    ], 
    "Darling": [
        "NNP", 
        "JJ", 
        "NN", 
        "UH"
    ], 
    "disparagement": [
        "NN"
    ], 
    "titanium": [
        "NN"
    ], 
    "Tippecanoe": [
        "NNP"
    ], 
    "rayon": [
        "NN"
    ], 
    "pinto": [
        "NN"
    ], 
    "nondiscretionary": [
        "JJ"
    ], 
    "well-armed": [
        "JJ"
    ], 
    "Editorials": [
        "NNS"
    ], 
    "co-operation": [
        "NN"
    ], 
    "electrical-engineering": [
        "JJ"
    ], 
    "McCamant": [
        "NNP"
    ], 
    "travel": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Attention": [
        "NN", 
        "VB"
    ], 
    "Businessland": [
        "NNP"
    ], 
    "Nussbaum": [
        "NNP"
    ], 
    "tabac": [
        "NN"
    ], 
    "Bates": [
        "NNP"
    ], 
    "exposited": [
        "VBN"
    ], 
    "Feelers": [
        "NNS"
    ], 
    "assimilated": [
        "VBN", 
        "JJ"
    ], 
    "dinosaurs": [
        "NNS"
    ], 
    "iodocompounds": [
        "NNS"
    ], 
    "Fogg": [
        "NNP"
    ], 
    "stipulate": [
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "sentencing": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "pigment": [
        "NN"
    ], 
    "Tenants": [
        "NNPS"
    ], 
    "CFM": [
        "NNP"
    ], 
    "FINANCIAL": [
        "NNP"
    ], 
    "recombination": [
        "NN"
    ], 
    "CFD": [
        "NNP"
    ], 
    "CFC": [
        "NNP", 
        "NN"
    ], 
    "subplots": [
        "NNS"
    ], 
    "kiloton": [
        "NN"
    ], 
    "b-Current": [
        "JJ", 
        "LS|JJ"
    ], 
    "Shimon": [
        "NNP"
    ], 
    "CFP": [
        "NNP"
    ], 
    "Retention": [
        "NNP"
    ], 
    "sprawling": [
        "VBG", 
        "JJ"
    ], 
    "snugly": [
        "RB"
    ], 
    "libertie": [
        "NN"
    ], 
    "Capistrano": [
        "NNP"
    ], 
    "Blackstone": [
        "NNP", 
        "VBP"
    ], 
    "ice-feeling": [
        "NN"
    ], 
    "Sabreliner": [
        "NNP"
    ], 
    "benefited": [
        "VBD", 
        "VBN"
    ], 
    "Robertson": [
        "NNP"
    ], 
    "Soviet-trained": [
        "JJ"
    ], 
    "activating": [
        "VBG"
    ], 
    "gay-ess": [
        "VBP"
    ], 
    "playhouse": [
        "NN"
    ], 
    "H.L.": [
        "NNP"
    ], 
    "WPS": [
        "NNP"
    ], 
    "ex-dividend": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "His": [
        "PRP$", 
        "NNP"
    ], 
    "Hit": [
        "VBN", 
        "VBP", 
        "NN", 
        "VB"
    ], 
    "fit": [
        "VB", 
        "VBN", 
        "VBP", 
        "JJ", 
        "NN", 
        "RB", 
        "VBD"
    ], 
    "Albrights": [
        "NNPS"
    ], 
    "Schroeder": [
        "NNP"
    ], 
    "screaming": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "gridiron": [
        "NN"
    ], 
    "Admirers": [
        "NNS"
    ], 
    "Bischofberger": [
        "NNP"
    ], 
    "Kavanagh": [
        "NNP"
    ], 
    "Walesa": [
        "NNP"
    ], 
    "Hid": [
        "NNP"
    ], 
    "fig": [
        "NN"
    ], 
    "Rubins": [
        "NNS"
    ], 
    "reentered": [
        "VBD"
    ], 
    "Ciminero": [
        "NNP"
    ], 
    "Him": [
        "PRP", 
        "NNP"
    ], 
    "Galanter": [
        "NNP"
    ], 
    "effecte": [
        "VB"
    ], 
    "Plebian": [
        "JJ"
    ], 
    "Aloe": [
        "NNP"
    ], 
    "vouchers": [
        "NNS"
    ], 
    "top-quality": [
        "JJ"
    ], 
    "Civics": [
        "NNPS"
    ], 
    "Pavlovitch": [
        "NNP"
    ], 
    "effects": [
        "NNS", 
        "VBZ"
    ], 
    "Specialized": [
        "NNP", 
        "JJ"
    ], 
    "McArtor": [
        "NNP"
    ], 
    "honeybee": [
        "NN"
    ], 
    "broiler": [
        "NN"
    ], 
    "whacking": [
        "VBG"
    ], 
    "castigating": [
        "VBG"
    ], 
    "wooden": [
        "JJ"
    ], 
    "Pergamon": [
        "NNP"
    ], 
    "Combine": [
        "VB"
    ], 
    "uninfluenced": [
        "VBN"
    ], 
    "transit-association": [
        "NN"
    ], 
    "Weakening": [
        "VBG"
    ], 
    "Dairies": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "finger-paint": [
        "NN"
    ], 
    "Eyewear": [
        "NNP"
    ], 
    "parasites": [
        "NNS"
    ], 
    "Bullocks": [
        "NNP"
    ], 
    "Pamorex": [
        "NNP"
    ], 
    "Crowds": [
        "NNS"
    ], 
    "ANNOUNCED": [
        "VBD"
    ], 
    "Pomerania": [
        "NNP"
    ], 
    "Denizens": [
        "NNS"
    ], 
    "toleration": [
        "NN"
    ], 
    "Susie": [
        "NNP", 
        "NN"
    ], 
    "enviroment": [
        "NN"
    ], 
    "Sidestepping": [
        "VBG"
    ], 
    "adapt": [
        "VB", 
        "VBP"
    ], 
    "Basement": [
        "NN"
    ], 
    "Chivas": [
        "NNP"
    ], 
    "Kahler": [
        "NNP"
    ], 
    "nightdress": [
        "NN"
    ], 
    "Impressionists": [
        "NNPS"
    ], 
    "MEDIA": [
        "NNP"
    ], 
    "underfoot": [
        "RB"
    ], 
    "Schwarz": [
        "NNP"
    ], 
    "Corinne": [
        "NNP"
    ], 
    "Argabright": [
        "NNP"
    ], 
    "elsewhere": [
        "RB", 
        "NN"
    ], 
    "stereotypical": [
        "JJ"
    ], 
    "Bergelt": [
        "NNP"
    ], 
    "Transformers": [
        "NNPS"
    ], 
    "estimate": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "obliterans": [
        "NNS"
    ], 
    "Egg": [
        "NNP", 
        "NN"
    ], 
    "chlorine": [
        "NN"
    ], 
    "silent": [
        "JJ"
    ], 
    "producer\\/director": [
        "NN"
    ], 
    "Nigel": [
        "NNP"
    ], 
    "disturber": [
        "NN"
    ], 
    "nucleoli": [
        "NNS"
    ], 
    "Woodberry": [
        "NNP"
    ], 
    "Domestically": [
        "RB"
    ], 
    "SIGNED": [
        "VBN"
    ], 
    "disturbed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "dinner-hour": [
        "JJ"
    ], 
    "third-dimensionality": [
        "NN"
    ], 
    "Facts": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "mendacity": [
        "NN"
    ], 
    "Niger": [
        "NNP"
    ], 
    "breed": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Varadero": [
        "NNP"
    ], 
    "Activity": [
        "NN", 
        "NNP"
    ], 
    "Gingerly": [
        "RB"
    ], 
    "megabytes": [
        "NNS"
    ], 
    "Nerves": [
        "NNS"
    ], 
    "Lurie": [
        "NNP"
    ], 
    "olds": [
        "NNS"
    ], 
    "LAND": [
        "NNP"
    ], 
    "renovated": [
        "VBN", 
        "JJ"
    ], 
    "needed": [
        "VBN", 
        "VBN|JJ", 
        "JJ", 
        "VBD"
    ], 
    "master": [
        "NN", 
        "JJ", 
        "VB", 
        "JJR"
    ], 
    "mousseline": [
        "NN"
    ], 
    "genesis": [
        "NN"
    ], 
    "specters": [
        "NNS"
    ], 
    "Russo-American": [
        "JJ"
    ], 
    "Hammerstein": [
        "NNP"
    ], 
    "Aztar": [
        "NNP"
    ], 
    "scrapes": [
        "NNS"
    ], 
    "yield": [
        "VB", 
        "VBP", 
        "JJ", 
        "NN"
    ], 
    "mid-June": [
        "NNP", 
        "NN"
    ], 
    "mutilated": [
        "VBN", 
        "JJ"
    ], 
    "Daddy": [
        "NNP"
    ], 
    "heftiest": [
        "JJS"
    ], 
    "positively": [
        "RB"
    ], 
    "Guardsmen": [
        "NNPS"
    ], 
    "SPAN": [
        "NNP"
    ], 
    "anniversaries": [
        "NNS"
    ], 
    "ozone-destroying": [
        "JJ"
    ], 
    "Moonlighting": [
        "NN", 
        "NNP"
    ], 
    "Zeta": [
        "NNP"
    ], 
    "feeling": [
        "NN", 
        "VBG"
    ], 
    "movie-themed": [
        "JJ"
    ], 
    "Escadrille": [
        "NNP"
    ], 
    "third-round": [
        "JJ"
    ], 
    "value-story": [
        "JJ"
    ], 
    "neuroselective": [
        "JJ"
    ], 
    "Chicago": [
        "NNP"
    ], 
    "straight-from-the-shoulder": [
        "JJ"
    ], 
    "index-options": [
        "NNS"
    ], 
    "consenting": [
        "VBG", 
        "JJ"
    ], 
    "pecs": [
        "NNS"
    ], 
    "brawny": [
        "JJ"
    ], 
    "recapitalized": [
        "VBN"
    ], 
    "skullcap": [
        "NN"
    ], 
    "Theo": [
        "NNP"
    ], 
    "Then": [
        "RB"
    ], 
    "Them": [
        "PRP", 
        "NNP", 
        "DT"
    ], 
    "scraped": [
        "VBD", 
        "VBN"
    ], 
    "wholesome": [
        "JJ"
    ], 
    "Ashenberg": [
        "NNP"
    ], 
    "Grodnik": [
        "NNP"
    ], 
    "Thee": [
        "PRP"
    ], 
    "Tschilwyk": [
        "NNP"
    ], 
    "Myron": [
        "NNP"
    ], 
    "They": [
        "PRP", 
        "NNP"
    ], 
    "v-senv5": [
        "NNP"
    ], 
    "ex-accountant": [
        "NN"
    ], 
    "shipments": [
        "NNS"
    ], 
    "diminishing": [
        "VBG"
    ], 
    "chumminess": [
        "NN"
    ], 
    "resonates": [
        "VBZ"
    ], 
    "Jessye": [
        "NNP"
    ], 
    "tensely": [
        "RB"
    ], 
    "Hubacher": [
        "NNP"
    ], 
    "Pandora": [
        "NNP"
    ], 
    "resonated": [
        "VBD"
    ], 
    "transverse": [
        "JJ", 
        "NN"
    ], 
    "KEARNEY": [
        "NNP"
    ], 
    "Encore": [
        "NNP"
    ], 
    "semicircular": [
        "JJ"
    ], 
    "Pastern": [
        "NNP"
    ], 
    "Lanvin": [
        "NNP"
    ], 
    "state-directed": [
        "JJ"
    ], 
    "Journal-Bulletin": [
        "NNP"
    ], 
    "willinge": [
        "JJ"
    ], 
    "Civilized": [
        "JJ"
    ], 
    "Armide": [
        "NN"
    ], 
    "fugitives": [
        "NNS"
    ], 
    "conservative-led": [
        "JJ"
    ], 
    "purged": [
        "VBN", 
        "VBD"
    ], 
    "saying": [
        "VBG", 
        "NN"
    ], 
    "ffreind": [
        "VB"
    ], 
    "U-2": [
        "NNP"
    ], 
    "Euralliance": [
        "NNP"
    ], 
    "Mignanelli": [
        "NNP"
    ], 
    "Jacobson": [
        "NNP"
    ], 
    "padded": [
        "JJ", 
        "VBN"
    ], 
    "Butterfinger": [
        "NNP"
    ], 
    "Cunha": [
        "NNP"
    ], 
    "incorruptibility": [
        "NN"
    ], 
    "Basinger": [
        "NNP"
    ], 
    "hounded": [
        "VBD"
    ], 
    "apace": [
        "RB"
    ], 
    "Taiyo": [
        "NNP"
    ], 
    "clicked": [
        "VBD", 
        "VBN"
    ], 
    "Rizvi": [
        "NNP"
    ], 
    "excavator": [
        "NN"
    ], 
    "lepidoptery": [
        "NN"
    ], 
    "Ammonium": [
        "NN"
    ], 
    "lube": [
        "NN"
    ], 
    "Geste": [
        "NNP"
    ], 
    "TEACH": [
        "VB"
    ], 
    "L.C.": [
        "NNP"
    ], 
    "familistical": [
        "JJ"
    ], 
    "photo-montage": [
        "JJ"
    ], 
    "INSEAD": [
        "NNP"
    ], 
    "Warnke": [
        "NNP"
    ], 
    "Sibson": [
        "NNP"
    ], 
    "outfielders": [
        "NNS"
    ], 
    "Dionne": [
        "NNP"
    ], 
    "Comenico": [
        "NNP"
    ], 
    "Bancorp.": [
        "NNP"
    ], 
    "affronted": [
        "VBN"
    ], 
    "currencny": [
        "NN"
    ], 
    "Senators": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Ecology": [
        "NN", 
        "NNP"
    ], 
    "Baden-Wuerttemburg": [
        "NNP"
    ], 
    "nicely": [
        "RB"
    ], 
    "Andover": [
        "NNP"
    ], 
    "succumb": [
        "VB"
    ], 
    "Dances": [
        "NNS", 
        "NNPS"
    ], 
    "Dancer": [
        "NNP"
    ], 
    "software-installation": [
        "NN"
    ], 
    "pipers": [
        "NNS"
    ], 
    "Jabe": [
        "NNP"
    ], 
    "programmatic": [
        "JJ"
    ], 
    "concretistic-seeming": [
        "JJ"
    ], 
    "Centerbank": [
        "NNP"
    ], 
    "Anderson": [
        "NNP"
    ], 
    "Boon-Sanwa": [
        "NNP"
    ], 
    "news": [
        "NN", 
        "NNS"
    ], 
    "McChicken": [
        "NNP"
    ], 
    "advisedly": [
        "RB"
    ], 
    "Mosle": [
        "NNP"
    ], 
    "above-market": [
        "JJ"
    ], 
    "Heinkel": [
        "NNP"
    ], 
    "Trinitron": [
        "NNP"
    ], 
    "motional": [
        "JJ"
    ], 
    "guided-missile": [
        "JJ", 
        "NN"
    ], 
    "Chugoku": [
        "NNP"
    ], 
    "Dexedrine": [
        "NNP"
    ], 
    "Tarzana": [
        "NNP"
    ], 
    "Eichner": [
        "NNP"
    ], 
    "Hurst": [
        "NNP"
    ], 
    "requisites": [
        "NNS"
    ], 
    "wage": [
        "NN", 
        "VB"
    ], 
    "redistricting": [
        "VBG", 
        "NN"
    ], 
    "extend": [
        "VB", 
        "VBP", 
        "VBZ"
    ], 
    "nature": [
        "NN", 
        "JJ"
    ], 
    "Eisai": [
        "NNP"
    ], 
    "fruits": [
        "NNS"
    ], 
    "lapping": [
        "VBG"
    ], 
    "superficial": [
        "JJ"
    ], 
    "brainwashed": [
        "VBN"
    ], 
    "Bajakian": [
        "NNP"
    ], 
    "extent": [
        "NN"
    ], 
    "tendons": [
        "NNS"
    ], 
    "airflow": [
        "NN"
    ], 
    "Resolute": [
        "NNP"
    ], 
    "Camusfearna": [
        "NNP"
    ], 
    "lookit": [
        "NN"
    ], 
    "Orkem": [
        "NNP", 
        "VB"
    ], 
    "Handmaid": [
        "NNP"
    ], 
    "lumber-like": [
        "JJ"
    ], 
    "Altairians": [
        "NNPS"
    ], 
    "Oil-related": [
        "JJ"
    ], 
    "fearlessly": [
        "RB"
    ], 
    "Apartment": [
        "NN", 
        "NNP"
    ], 
    "foreclosing": [
        "VBG"
    ], 
    "SCHWARTZ": [
        "NNP"
    ], 
    "Reuter": [
        "NNP", 
        "NN"
    ], 
    "meaningfulness": [
        "NN"
    ], 
    "wearying": [
        "VBG"
    ], 
    "unhealed": [
        "JJ"
    ], 
    "fondled": [
        "VBN"
    ], 
    "minuses": [
        "NNS"
    ], 
    "self-consistent": [
        "JJ"
    ], 
    "month-long": [
        "JJ"
    ], 
    "brindle": [
        "NN"
    ], 
    "humming": [
        "NN", 
        "VBG"
    ], 
    "Instantly": [
        "RB"
    ], 
    "triviality": [
        "NN"
    ], 
    "layette": [
        "NN"
    ], 
    "fro": [
        "RB"
    ], 
    ".": [
        "."
    ], 
    "Nischwitz": [
        "NNP"
    ], 
    "much": [
        "JJ", 
        "DT", 
        "NN", 
        "RB", 
        "RB|JJ"
    ], 
    "Jorio": [
        "NNP"
    ], 
    "Closely": [
        "RB"
    ], 
    "sterilizer": [
        "NN"
    ], 
    "dehumanised": [
        "VBN"
    ], 
    "unleavened": [
        "JJ"
    ], 
    "fry": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Ellman": [
        "NNP"
    ], 
    "Goals": [
        "NNPS"
    ], 
    "doubte": [
        "NN"
    ], 
    "INMAC": [
        "NNP"
    ], 
    "spit": [
        "VB", 
        "NN", 
        "VBD"
    ], 
    "Clayt": [
        "NNP"
    ], 
    "Clays": [
        "NNP"
    ], 
    "spic": [
        "NN"
    ], 
    "Donovan": [
        "NNP"
    ], 
    "doubts": [
        "NNS", 
        "VBZ"
    ], 
    "Akerson": [
        "NNP"
    ], 
    "two-hundredths": [
        "NNS"
    ], 
    "Cipolla": [
        "NNP"
    ], 
    "spin": [
        "VB", 
        "NN"
    ], 
    "Volksgeist": [
        "FW"
    ], 
    "skilfully": [
        "RB"
    ], 
    "wildcat": [
        "NN", 
        "JJ"
    ], 
    "near-irrelevant": [
        "JJ"
    ], 
    "U.N.-chartered": [
        "JJ"
    ], 
    "Ben-Gurion": [
        "NNP"
    ], 
    "bargain-hunters": [
        "NNS"
    ], 
    "contingencies": [
        "NNS"
    ], 
    "crupper": [
        "NN"
    ], 
    "microbiological": [
        "JJ"
    ], 
    "misconstrued": [
        "VBN"
    ], 
    "low-smoke": [
        "JJ"
    ], 
    "red-figured": [
        "JJ"
    ], 
    "Courtrai": [
        "NNP"
    ], 
    "prostrate": [
        "JJ"
    ], 
    "Crusaders": [
        "NNPS", 
        "NNS"
    ], 
    "biddies": [
        "NNS"
    ], 
    "slide-packs": [
        "NNS"
    ], 
    "cupful": [
        "JJ"
    ], 
    "carboxymethyl": [
        "NN"
    ], 
    "Berridge": [
        "NNP"
    ], 
    "Innumerable": [
        "JJ"
    ], 
    "embargos": [
        "NNS"
    ], 
    "conditioned": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "to-morrow": [
        "RB"
    ], 
    "Stanhope": [
        "NNP"
    ], 
    "Brookings": [
        "NNP"
    ], 
    "conditioner": [
        "NN"
    ], 
    "half-billion": [
        "JJ"
    ], 
    "hone": [
        "VB", 
        "VBP"
    ], 
    "memorial": [
        "NN", 
        "JJ"
    ], 
    "WFXT": [
        "NNP"
    ], 
    "inventively": [
        "RB"
    ], 
    "C/NNP.A.J.": [
        "NNP"
    ], 
    "mummified": [
        "VBN"
    ], 
    "honk": [
        "VBP"
    ], 
    "slash-mouthed": [
        "JJ"
    ], 
    "Tahitian": [
        "JJ", 
        "NNP"
    ], 
    "conformed": [
        "VBN", 
        "VBD"
    ], 
    "visitations": [
        "NNS"
    ], 
    "HOSPITALS": [
        "NNS"
    ], 
    "fireweed": [
        "NN"
    ], 
    "saluted": [
        "VBD", 
        "VBN"
    ], 
    "myocardial": [
        "JJ"
    ], 
    "Front-runners": [
        "NNS"
    ], 
    "Maybe": [
        "RB", 
        "UH"
    ], 
    "Alienus": [
        "NNP"
    ], 
    "torpedoes": [
        "NNS"
    ], 
    "low-grade": [
        "JJ"
    ], 
    "pfffted": [
        "VBD"
    ], 
    "torpedoed": [
        "VBN", 
        "VBD"
    ], 
    "cost-effectiveness": [
        "NN"
    ], 
    "holystones": [
        "NNS"
    ], 
    "spotty": [
        "JJ"
    ], 
    "furlough": [
        "NN"
    ], 
    "peremptory": [
        "JJ"
    ], 
    "Verges": [
        "NNP"
    ], 
    "mentors": [
        "NNS"
    ], 
    "Stearn": [
        "NNP"
    ], 
    "academic": [
        "JJ", 
        "NN"
    ], 
    "ALPA": [
        "NNP"
    ], 
    "academia": [
        "NN"
    ], 
    "lonelier": [
        "RBR"
    ], 
    "EBS": [
        "NNP"
    ], 
    "J.MBB": [
        "NNP"
    ], 
    "Table": [
        "NN", 
        "NNP"
    ], 
    "corporate": [
        "JJ"
    ], 
    "massaging": [
        "VBG"
    ], 
    "Hickey": [
        "NNP"
    ], 
    "absurdities": [
        "NNS"
    ], 
    "golden": [
        "JJ"
    ], 
    "half-starved": [
        "JJ"
    ], 
    "topography": [
        "NN"
    ], 
    "valleys": [
        "NNS"
    ], 
    "Feigenbaum": [
        "NNP"
    ], 
    "salt-crusted": [
        "JJ"
    ], 
    "lasso": [
        "NN", 
        "VB"
    ], 
    "claudication": [
        "NN"
    ], 
    "Vitalie": [
        "NNP"
    ], 
    "ham": [
        "NN"
    ], 
    "duffer": [
        "NN"
    ], 
    "out-of-town": [
        "JJ"
    ], 
    "Oscar": [
        "NNP"
    ], 
    "bull-roaring": [
        "JJ"
    ], 
    "Schlemmer": [
        "NNP"
    ], 
    "Mohammedanism": [
        "NNP"
    ], 
    "hay": [
        "NN", 
        "VB"
    ], 
    "duffel": [
        "NN"
    ], 
    "vicitims": [
        "NNS"
    ], 
    "has": [
        "VBZ", 
        "VBN", 
        "."
    ], 
    "hat": [
        "NN"
    ], 
    "Spence": [
        "NNP"
    ], 
    "Housekeeping": [
        "NN", 
        "NNP"
    ], 
    "elders": [
        "NNS"
    ], 
    "Serieuses": [
        "NNP"
    ], 
    "constrictors": [
        "NNS"
    ], 
    "unequivocally": [
        "RB"
    ], 
    "objective": [
        "NN", 
        "JJ"
    ], 
    "indicative": [
        "JJ"
    ], 
    "compaction": [
        "NN"
    ], 
    "Seaboard": [
        "NNP"
    ], 
    "ERNST": [
        "NNP"
    ], 
    "solid-state": [
        "JJ"
    ], 
    "Eurocell": [
        "NNP"
    ], 
    "Tipping": [
        "NN"
    ], 
    "riskiness": [
        "NN"
    ], 
    "Kontrollbank": [
        "NNP"
    ], 
    "sleuthing": [
        "NN"
    ], 
    "Wedtech": [
        "NNP"
    ], 
    "Brenda": [
        "NNP"
    ], 
    "Perfecta": [
        "NNP"
    ], 
    "studiousness": [
        "NN"
    ], 
    "Stiller": [
        "NNP"
    ], 
    "Pentagon": [
        "NNP"
    ], 
    "double-step": [
        "JJ"
    ], 
    "misdemeanors": [
        "NNS"
    ], 
    "Swedish": [
        "JJ", 
        "NNP"
    ], 
    "Quadrex": [
        "NNP"
    ], 
    "crowd": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "walk-on": [
        "NN"
    ], 
    "flue": [
        "NN"
    ], 
    "mosques": [
        "NNS"
    ], 
    "Expressways": [
        "NNP"
    ], 
    "crown": [
        "NN", 
        "VB"
    ], 
    "culpas": [
        "FW"
    ], 
    "Bourcier": [
        "NNP"
    ], 
    "captive": [
        "JJ", 
        "NN"
    ], 
    "Avdel": [
        "NNP"
    ], 
    "emphases": [
        "NNS"
    ], 
    "anti-epilepsy": [
        "JJ"
    ], 
    "fiduciary": [
        "JJ"
    ], 
    "debt-rating": [
        "JJ"
    ], 
    "leather-hard": [
        "JJ"
    ], 
    "perchance": [
        "RB"
    ], 
    "Nixdorf": [
        "NNP"
    ], 
    "bottom": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "inhuman": [
        "JJ"
    ], 
    "Wangenheim": [
        "NNP"
    ], 
    "reqion": [
        "NN"
    ], 
    "Celebration": [
        "NNP"
    ], 
    "Lasorda": [
        "NNP"
    ], 
    "Calls": [
        "NNS", 
        "VBZ"
    ], 
    "non-porous": [
        "JJ"
    ], 
    "considerin": [
        "VBG"
    ], 
    "life-or-death": [
        "NN"
    ], 
    "Kentuck": [
        "NNP"
    ], 
    "brigades": [
        "NNS"
    ], 
    "starring": [
        "VBG", 
        "JJ"
    ], 
    "caskets": [
        "NNS"
    ], 
    "Scwhab": [
        "NNP"
    ], 
    "accelerations": [
        "NNS"
    ], 
    "restlessness": [
        "NN"
    ], 
    "benches": [
        "NNS"
    ], 
    "Transmanche-Link": [
        "NNP"
    ], 
    "anomalous": [
        "JJ"
    ], 
    "officeholders": [
        "NNS"
    ], 
    "catchy": [
        "JJ"
    ], 
    "newly-emerging": [
        "JJ"
    ], 
    "sticle": [
        "VB"
    ], 
    "ribozymes": [
        "NNS"
    ], 
    "classical-music": [
        "JJ"
    ], 
    "lemmings": [
        "NNS"
    ], 
    "Cydonia": [
        "NNP"
    ], 
    "pre-tax": [
        "JJ"
    ], 
    "Concerned": [
        "NNP", 
        "JJ", 
        "VBN"
    ], 
    "honeymoon": [
        "NN", 
        "VB"
    ], 
    "Valdez": [
        "NNP"
    ], 
    "Pontiac-Cadillac": [
        "NNP"
    ], 
    "shoots": [
        "VBZ", 
        "NNS"
    ], 
    "appropriators": [
        "NNS"
    ], 
    "Ends": [
        "NNS", 
        "VBZ", 
        "NNPS"
    ], 
    "despised": [
        "VBD", 
        "VBN"
    ], 
    "fabric": [
        "NN"
    ], 
    "Inherently": [
        "RB"
    ], 
    "raped": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Carolco": [
        "NNP"
    ], 
    "grasping": [
        "VBG"
    ], 
    "GERMANY": [
        "NNP"
    ], 
    "rapes": [
        "NNS", 
        "VBZ"
    ], 
    "avocados": [
        "NNS"
    ], 
    "Endo": [
        "NNP"
    ], 
    "perfumes": [
        "NNS"
    ], 
    "Bonds-b": [
        "NNP", 
        "NNPS"
    ], 
    "denoting": [
        "VBG"
    ], 
    "Telesphere": [
        "NNP", 
        "NN"
    ], 
    "cohnfidunt": [
        "NN"
    ], 
    "perfumed": [
        "JJ", 
        "VBN"
    ], 
    "Roast": [
        "VB"
    ], 
    "Nineteenth": [
        "JJ", 
        "NNP"
    ], 
    "Bensonhurst": [
        "NNP"
    ], 
    "incinerator": [
        "NN"
    ], 
    "Interferon": [
        "NNP"
    ], 
    "congratulations": [
        "NNS", 
        "UH"
    ], 
    "dark-squared": [
        "JJ"
    ], 
    "Whom": [
        "WP", 
        "NNP"
    ], 
    "Year-to-date": [
        "JJ"
    ], 
    "Jaya": [
        "NNP"
    ], 
    "Household": [
        "NNP", 
        "NN"
    ], 
    "VTOL": [
        "NNP"
    ], 
    "County": [
        "NNP", 
        "NN", 
        "NNPS"
    ], 
    "Merom": [
        "NNP"
    ], 
    "open-air": [
        "JJ"
    ], 
    "nicest": [
        "JJS"
    ], 
    "appeals-court": [
        "NN", 
        "JJ"
    ], 
    "soldering": [
        "JJ", 
        "VBG"
    ], 
    "slow-bouncing": [
        "JJ"
    ], 
    "Jays": [
        "NNPS"
    ], 
    "Manderscheid": [
        "NNP"
    ], 
    "passenger": [
        "NN", 
        "JJ"
    ], 
    "disgrace": [
        "NN"
    ], 
    "Ladas": [
        "NNP"
    ], 
    "Tales": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "YOUNG": [
        "JJ", 
        "NNP"
    ], 
    "VARIAN": [
        "NNP"
    ], 
    "two-day": [
        "JJ"
    ], 
    "Fukuda": [
        "NNP"
    ], 
    "ECU-based": [
        "JJ"
    ], 
    "taxable-equivalent": [
        "JJ"
    ], 
    "Fennessy": [
        "NNP"
    ], 
    "Velasco": [
        "NNP"
    ], 
    "Resler": [
        "NNP"
    ], 
    "crowns": [
        "NNS"
    ], 
    "Paraquat": [
        "NN"
    ], 
    "Burke": [
        "NNP"
    ], 
    "wordlessly": [
        "RB"
    ], 
    "Demagogues": [
        "NNS"
    ], 
    "thoroughgoing": [
        "JJ"
    ], 
    "Checchi": [
        "NNP"
    ], 
    "hawked": [
        "VBD", 
        "VBN"
    ], 
    "Melbourne": [
        "NNP"
    ], 
    "SONGsters": [
        "NNS"
    ], 
    "Bucer": [
        "NNP"
    ], 
    "smelling": [
        "VBG"
    ], 
    "hawker": [
        "NN"
    ], 
    "Filofax": [
        "NNP"
    ], 
    "Ida": [
        "NNP"
    ], 
    "meteorologist": [
        "NN"
    ], 
    "continentally": [
        "RB"
    ], 
    "Debutante": [
        "NNP"
    ], 
    "Oriole": [
        "NNP"
    ], 
    "Dragonetti": [
        "NNP"
    ], 
    "BURNHAM": [
        "NNP"
    ], 
    "A.D": [
        "NN"
    ], 
    "Wiley": [
        "NNP"
    ], 
    "chain": [
        "NN", 
        "VBP"
    ], 
    "whoever": [
        "WP"
    ], 
    "Agura": [
        "NNP"
    ], 
    "Spector": [
        "NNP"
    ], 
    "Cairoli": [
        "NNP"
    ], 
    "Ipswich": [
        "NNP"
    ], 
    "chair": [
        "NN", 
        "VB"
    ], 
    "Beyeler": [
        "NNP"
    ], 
    "ballet": [
        "NN", 
        "FW"
    ], 
    "amplification": [
        "NN"
    ], 
    "grapples": [
        "VBZ"
    ], 
    "freelance": [
        "JJ"
    ], 
    "Yemma": [
        "NNP"
    ], 
    "sweat-suits": [
        "NNS"
    ], 
    "balled": [
        "VBN"
    ], 
    "grappled": [
        "VBD"
    ], 
    "underlining": [
        "VBG", 
        "NN"
    ], 
    "circumstances": [
        "NNS"
    ], 
    "oversight": [
        "NN"
    ], 
    "tenacious": [
        "JJ"
    ], 
    "Barret": [
        "NNP"
    ], 
    "windshields": [
        "NNS"
    ], 
    "paychecks": [
        "NNS"
    ], 
    "jerk": [
        "NN", 
        "VB"
    ], 
    "enflamed": [
        "VBN"
    ], 
    "optronics": [
        "NN"
    ], 
    "Barred": [
        "VBN"
    ], 
    "gloomy": [
        "JJ"
    ], 
    "Levittown": [
        "NNP"
    ], 
    "Barren": [
        "NNP"
    ], 
    "locked": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Barrel": [
        "NN"
    ], 
    "upper-lower": [
        "JJ"
    ], 
    "exact": [
        "JJ", 
        "VB"
    ], 
    "minute": [
        "NN", 
        "JJ"
    ], 
    "Tri-State": [
        "NNP"
    ], 
    "Hellman": [
        "NNP"
    ], 
    "reining": [
        "VBG"
    ], 
    "skewed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "illustrators": [
        "NNS"
    ], 
    "erasures": [
        "NNS"
    ], 
    "skewer": [
        "NN"
    ], 
    "reimpose": [
        "VB", 
        "JJ"
    ], 
    "M$": [
        "$"
    ], 
    "Silvio": [
        "NNP"
    ], 
    "versatility": [
        "NN"
    ], 
    "hindered": [
        "VBN", 
        "VBD"
    ], 
    "M.": [
        "NNP", 
        "NN"
    ], 
    "ogles": [
        "VBZ"
    ], 
    "M4": [
        "NNP"
    ], 
    "Olgivanna": [
        "NNP"
    ], 
    "chopping": [
        "VBG", 
        "NN"
    ], 
    "hegemonic": [
        "JJ"
    ], 
    "SFr3": [
        "NNP"
    ], 
    "SFr2": [
        "NNP"
    ], 
    "kindliness": [
        "NN"
    ], 
    "DeRita": [
        "NNP"
    ], 
    "celebrated": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "storability": [
        "NN"
    ], 
    "Premise": [
        "NNP"
    ], 
    "S*/NNS&Ls": [
        "NNP"
    ], 
    "non-caffeine": [
        "JJ"
    ], 
    "celebrates": [
        "VBZ"
    ], 
    "unintentionally": [
        "RB"
    ], 
    "Metrecal": [
        "NNP"
    ], 
    "Me": [
        "PRP", 
        "NNP", 
        "VBP"
    ], 
    "Md": [
        "NNP"
    ], 
    "Ma": [
        "NNP", 
        "FW"
    ], 
    "busyness": [
        "NN"
    ], 
    "Mc": [
        "NNP"
    ], 
    "climbs": [
        "VBZ", 
        "NNS"
    ], 
    "blunted": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "Mo": [
        "NNP"
    ], 
    "Mi": [
        "NNP", 
        "FW"
    ], 
    "plucking": [
        "VBG"
    ], 
    "Mt": [
        "NNP"
    ], 
    "Ms": [
        "NNP"
    ], 
    "Mr": [
        "NNP"
    ], 
    "dwindling": [
        "VBG"
    ], 
    "My": [
        "PRP$", 
        "NN", 
        "NNP"
    ], 
    "blunter": [
        "NN"
    ], 
    "ME": [
        "PRP"
    ], 
    "MG": [
        "NNP"
    ], 
    "MF": [
        "NNP"
    ], 
    "MC": [
        "NNP"
    ], 
    "MB": [
        "NNP"
    ], 
    "impacted": [
        "VBN", 
        "JJ"
    ], 
    "MO": [
        "NNP"
    ], 
    "Pestillo": [
        "NNP"
    ], 
    "Haddix": [
        "NNP"
    ], 
    "queue": [
        "NN"
    ], 
    "snowbirds": [
        "NNS"
    ], 
    "sprouted": [
        "VBD", 
        "VBN"
    ], 
    "MP": [
        "NNP"
    ], 
    "MS": [
        "NNP"
    ], 
    "MR": [
        "NNP"
    ], 
    "ill-fated": [
        "JJ"
    ], 
    "non-circumvention": [
        "NN"
    ], 
    "Kylberg": [
        "NNP"
    ], 
    "Jardin": [
        "NNP"
    ], 
    "stockbuilding": [
        "VBG"
    ], 
    "Dilantin": [
        "NNP"
    ], 
    "houseman": [
        "NN"
    ], 
    "POWs": [
        "NNS"
    ], 
    "Germano-Slavic": [
        "JJ"
    ], 
    "redevelopers": [
        "NNS"
    ], 
    "ex-wives": [
        "NNS"
    ], 
    "BOOSTS": [
        "NNS", 
        "VBZ"
    ], 
    "opposes": [
        "VBZ"
    ], 
    "August": [
        "NNP"
    ], 
    "perished": [
        "VBD", 
        "VBN"
    ], 
    "Watsonville": [
        "NNP"
    ], 
    "ARNOLD": [
        "NNP"
    ], 
    "non-Magyars": [
        "NNPS"
    ], 
    "Rima": [
        "NNP"
    ], 
    "unjust": [
        "JJ"
    ], 
    "Pinsk": [
        "NNP"
    ], 
    "Those": [
        "DT", 
        "NNP"
    ], 
    "perishes": [
        "VBZ"
    ], 
    "Iris": [
        "NNP"
    ], 
    "dampness": [
        "NN"
    ], 
    "Szocs": [
        "NNP"
    ], 
    "ADVANCES": [
        "NNS"
    ], 
    "Proposals": [
        "NNS"
    ], 
    "Bars": [
        "NNP"
    ], 
    "Henley": [
        "NNP", 
        "NN"
    ], 
    "consoles": [
        "NNS", 
        "VBZ"
    ], 
    "Barr": [
        "NNP", 
        "NN"
    ], 
    "Bather": [
        "NN"
    ], 
    "ADVANCED": [
        "NNP"
    ], 
    "gray-black": [
        "JJ"
    ], 
    "Pianos": [
        "NNP"
    ], 
    "Mikoyan": [
        "NNP"
    ], 
    "oscillator": [
        "NN"
    ], 
    "Hershey": [
        "NNP"
    ], 
    "pre-financed": [
        "JJ"
    ], 
    "Laotian": [
        "JJ"
    ], 
    "Wetherell": [
        "NNP"
    ], 
    "following": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "renew": [
        "VB", 
        "VBP"
    ], 
    "Revolutionaries": [
        "NNS"
    ], 
    "unoriginals": [
        "NNS"
    ], 
    "want": [
        "VBP", 
        "VB", 
        "NN"
    ], 
    "mailboxes": [
        "NNS"
    ], 
    "Symphony": [
        "NNP"
    ], 
    "Chula": [
        "NNP"
    ], 
    "Dayna": [
        "NNP"
    ], 
    "Shige": [
        "NNP"
    ], 
    "photoelectronic": [
        "JJ"
    ], 
    "Mantha": [
        "NNP"
    ], 
    "petroleum-related": [
        "JJ"
    ], 
    "Broglie": [
        "NNP"
    ], 
    "Broglio": [
        "NNP"
    ], 
    "T-bills": [
        "NNS"
    ], 
    "anti-toxic": [
        "JJ"
    ], 
    "mid-September": [
        "NNP", 
        "NN"
    ], 
    "thanking": [
        "VBG"
    ], 
    "Sprizzo": [
        "NNP"
    ], 
    "Significant": [
        "JJ"
    ], 
    "Dumb": [
        "JJ"
    ], 
    "Bard": [
        "NNP"
    ], 
    "epidemiologic": [
        "JJ"
    ], 
    "B-flat": [
        "NN"
    ], 
    "Zucker": [
        "NNP"
    ], 
    "convincingly": [
        "RB"
    ], 
    "fueled": [
        "VBN", 
        "VBD"
    ], 
    "laxative": [
        "NN"
    ], 
    "Wiesel": [
        "NNP"
    ], 
    "Softness": [
        "NN"
    ], 
    "warm-blooded": [
        "JJ"
    ], 
    "extended-care": [
        "JJ"
    ], 
    "heliotrope": [
        "NN"
    ], 
    "under-achievers": [
        "NNS"
    ], 
    "Crobsy": [
        "NNP"
    ], 
    "advertiser-sponsored": [
        "JJ"
    ], 
    "inhabiting": [
        "VBG"
    ], 
    "Flexibility": [
        "NN"
    ], 
    "middle-income": [
        "JJ", 
        "NN"
    ], 
    "forebears": [
        "NNS"
    ], 
    "skirmish": [
        "NN"
    ], 
    "Gillespie": [
        "NNP"
    ], 
    "Centredale": [
        "NNP"
    ], 
    "Lumex": [
        "NNP"
    ], 
    "gold-based": [
        "JJ"
    ], 
    "shirked": [
        "VBN"
    ], 
    "colorblindness": [
        "NN"
    ], 
    "Bowie": [
        "NNP"
    ], 
    "LIN": [
        "NNP"
    ], 
    "Hiroaki": [
        "NNP"
    ], 
    "copious": [
        "JJ"
    ], 
    "LIT": [
        "NNP"
    ], 
    "anti-Semites": [
        "NNS", 
        "NN"
    ], 
    "Trustees": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Elias": [
        "NNP"
    ], 
    "Cromwell": [
        "NNP"
    ], 
    "Wetten": [
        "FW"
    ], 
    "jig": [
        "NN"
    ], 
    "disconnect": [
        "VB"
    ], 
    "milked": [
        "VBD", 
        "VBN"
    ], 
    "Stoltzman": [
        "NNP"
    ], 
    "Agencies": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Hopis": [
        "NNPS"
    ], 
    "revenue-raisers": [
        "NNS"
    ], 
    "First-hand": [
        "JJ"
    ], 
    "librarians": [
        "NNS"
    ], 
    "spotlighting": [
        "VBG"
    ], 
    "gold-leaf": [
        "JJ", 
        "NN"
    ], 
    "oral-care": [
        "JJ"
    ], 
    "Veil": [
        "NNP"
    ], 
    "no-brainer": [
        "NN"
    ], 
    "Hiding": [
        "VBG"
    ], 
    "apron": [
        "NN"
    ], 
    "shacked": [
        "VBN"
    ], 
    "Iraqis": [
        "NNPS"
    ], 
    "ENERGY": [
        "NN", 
        "NNP"
    ], 
    "bashful": [
        "JJ"
    ], 
    "EL-10": [
        "NNP"
    ], 
    "overpowering": [
        "JJ"
    ], 
    "Gordon": [
        "NNP"
    ], 
    "now-standard": [
        "JJ"
    ], 
    "workmanlike": [
        "JJ"
    ], 
    "henpecked": [
        "JJ"
    ], 
    "sorted": [
        "VBN", 
        "VBD"
    ], 
    "bedevil": [
        "VB"
    ], 
    "loan-repayment": [
        "NN"
    ], 
    "hickory": [
        "NN"
    ], 
    "didn": [
        "VBD"
    ], 
    "pealing": [
        "VBG"
    ], 
    "Yellow": [
        "NNP", 
        "JJ"
    ], 
    "Bubenik": [
        "NNP"
    ], 
    "cadence": [
        "NN"
    ], 
    "Roslyn": [
        "NNP"
    ], 
    "instability": [
        "NN"
    ], 
    "quarter": [
        "NN"
    ], 
    "Plowman": [
        "NN"
    ], 
    "Merieux-Connaught": [
        "NNP"
    ], 
    "growthy": [
        "JJ"
    ], 
    "bursting": [
        "VBG"
    ], 
    "Yoshiaki": [
        "NNP"
    ], 
    "presages": [
        "VBZ"
    ], 
    "growths": [
        "NNS"
    ], 
    "Venturesome": [
        "JJ"
    ], 
    "frames": [
        "NNS"
    ], 
    "irremediable": [
        "JJ"
    ], 
    "entering": [
        "VBG"
    ], 
    "Soiree": [
        "NNP"
    ], 
    "uselessness": [
        "NN"
    ], 
    "salads": [
        "NNS"
    ], 
    "disasters": [
        "NNS"
    ], 
    "Deborah": [
        "NNP"
    ], 
    "Jiangsu": [
        "NNP"
    ], 
    "assessors": [
        "NNS"
    ], 
    "Imasdounian": [
        "NNP"
    ], 
    "Michigan": [
        "NNP", 
        "JJ"
    ], 
    "Nightclubs": [
        "NNPS"
    ], 
    "staff-written": [
        "JJ"
    ], 
    "seriously": [
        "RB"
    ], 
    "TIGRs": [
        "NNP"
    ], 
    "calming": [
        "VBG", 
        "JJ"
    ], 
    "cash-back": [
        "JJ"
    ], 
    "Bouvier": [
        "NNP"
    ], 
    "Westpac": [
        "NNP"
    ], 
    "incentives": [
        "NNS"
    ], 
    "Recital": [
        "NNP"
    ], 
    "Johsen": [
        "NNP"
    ], 
    "inwardly": [
        "RB"
    ], 
    "crazies": [
        "NNS"
    ], 
    "grandma": [
        "NN"
    ], 
    "la-la": [
        "JJ"
    ], 
    "composer-pianist-conductor": [
        "NN"
    ], 
    "backfiring": [
        "VBG"
    ], 
    "Sun-3\\": [
        "NNP"
    ], 
    "Ventes": [
        "NNP"
    ], 
    "precious-metals": [
        "NNS", 
        "JJ", 
        "NN"
    ], 
    "modest": [
        "JJ"
    ], 
    "Kepler": [
        "NNP"
    ], 
    "Voegtli": [
        "NNP"
    ], 
    "socking": [
        "VBG"
    ], 
    "Yucaipa": [
        "NNP"
    ], 
    "hemorrhoids": [
        "NNS"
    ], 
    "Norwalk": [
        "NNP"
    ], 
    "top-heavy": [
        "JJ"
    ], 
    "Latchford": [
        "NNP"
    ], 
    "cigarette-vending": [
        "JJ"
    ], 
    "spoken": [
        "VBN", 
        "JJ"
    ], 
    "twined": [
        "VBD", 
        "VBN"
    ], 
    "Pixley": [
        "NNP"
    ], 
    "NIH-appointed": [
        "JJ"
    ], 
    "spokes": [
        "NNS"
    ], 
    "periodical": [
        "NN"
    ], 
    "Sinyard": [
        "NNP"
    ], 
    "affords": [
        "VBZ"
    ], 
    "Palos": [
        "NNP"
    ], 
    "Drouot": [
        "NNP"
    ], 
    "Monday": [
        "NNP"
    ], 
    "Cia.": [
        "NNP"
    ], 
    "inflation-offsetting": [
        "JJ"
    ], 
    "carbide-products": [
        "NNS"
    ], 
    "Stuckey": [
        "NNP"
    ], 
    "Mounted": [
        "NNP"
    ], 
    "lingering": [
        "VBG", 
        "JJ"
    ], 
    "subcompacts": [
        "NNS"
    ], 
    "Omron": [
        "NNP"
    ], 
    "RAISED": [
        "VBD"
    ], 
    "whitewash": [
        "NN"
    ], 
    "solid-waste": [
        "NN", 
        "JJ"
    ], 
    "surges": [
        "NNS", 
        "VBZ"
    ], 
    "snatch": [
        "VB", 
        "VBP"
    ], 
    "retrogressive": [
        "JJ"
    ], 
    "Smaby": [
        "NNP"
    ], 
    "Hamilton-oriented": [
        "JJ"
    ], 
    "absorbs": [
        "VBZ"
    ], 
    "surged": [
        "VBD", 
        "VBN"
    ], 
    "drug-cartel": [
        "JJ"
    ], 
    "History": [
        "NN", 
        "NNP"
    ], 
    "government-guaranteed": [
        "JJ"
    ], 
    "Equinox": [
        "NNP"
    ], 
    "Ciao": [
        "FW"
    ], 
    "crossroads": [
        "NNS", 
        "NN"
    ], 
    "so-so": [
        "JJ", 
        "NN"
    ], 
    "oerations": [
        "NNS"
    ], 
    "wandering": [
        "VBG"
    ], 
    "shakeup": [
        "NN"
    ], 
    "Waring": [
        "NNP"
    ], 
    "sumptuous": [
        "JJ"
    ], 
    "turned": [
        "VBD", 
        "VBN"
    ], 
    "jewels": [
        "NNS"
    ], 
    "Field": [
        "NNP", 
        "NN"
    ], 
    "Hubay": [
        "NNP"
    ], 
    "uninterrupted": [
        "JJ"
    ], 
    "Nummi": [
        "NNP"
    ], 
    "Exchange-listed": [
        "JJ"
    ], 
    "politicos": [
        "NNS"
    ], 
    "fashionable": [
        "JJ", 
        "NN"
    ], 
    "coliseum": [
        "NN"
    ], 
    "Forester": [
        "NNP"
    ], 
    "zoo": [
        "NN"
    ], 
    "market-monitoring": [
        "JJ"
    ], 
    "Cinematographer": [
        "NN"
    ], 
    "travel-agency": [
        "NN"
    ], 
    "Klesken": [
        "NNP"
    ], 
    "pistachio": [
        "JJ"
    ], 
    "opposite": [
        "JJ", 
        "IN", 
        "NN"
    ], 
    "discerning": [
        "JJ"
    ], 
    "below-investment-grade": [
        "JJ"
    ], 
    "spewing": [
        "VBG"
    ], 
    "Darman": [
        "NNP"
    ], 
    "oil-rig": [
        "NN"
    ], 
    "Plentywood": [
        "NNP"
    ], 
    "Depositors": [
        "NNS"
    ], 
    "Wong": [
        "NNP"
    ], 
    "Depository": [
        "NNP"
    ], 
    "Melsungen": [
        "NNP"
    ], 
    "Sochaux": [
        "NNP"
    ], 
    "non-vaccinated": [
        "JJ"
    ], 
    "touchy": [
        "JJ"
    ], 
    "Hurwitt": [
        "NNP"
    ], 
    "Instances": [
        "NNS"
    ], 
    "jitters": [
        "NNS", 
        "NN"
    ], 
    "obsidian": [
        "NN"
    ], 
    "jittery": [
        "JJ"
    ], 
    "scavanged": [
        "VBN"
    ], 
    "Sibley": [
        "NNP"
    ], 
    "lung-function": [
        "JJ"
    ], 
    "unmistakable": [
        "JJ"
    ], 
    "imagines": [
        "VBZ"
    ], 
    "friction": [
        "NN"
    ], 
    "Ethiopia": [
        "NNP", 
        "NN"
    ], 
    "inconsistent": [
        "JJ"
    ], 
    "imagined": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "area-sales": [
        "JJ"
    ], 
    "ensembles": [
        "NNS"
    ], 
    "reconciling": [
        "VBG"
    ], 
    "transact": [
        "VB"
    ], 
    "Duponts": [
        "NNPS"
    ], 
    "aimlessly": [
        "RB"
    ], 
    "Adia": [
        "NNP"
    ], 
    "Dolmabahce": [
        "NNP"
    ], 
    "seven-unit": [
        "JJ"
    ], 
    "concurrence": [
        "NN"
    ], 
    "Alfieri": [
        "NNP"
    ], 
    "then-minister": [
        "NN"
    ], 
    "rejoiced": [
        "VBD"
    ], 
    "Surprising": [
        "JJ"
    ], 
    "revolutionized": [
        "VBD", 
        "VBN"
    ], 
    "balconies": [
        "NNS"
    ], 
    "stoicism": [
        "NN"
    ], 
    "skiffs": [
        "NNS"
    ], 
    "rejoices": [
        "VBZ"
    ], 
    "Mid-Atlantic": [
        "NN"
    ], 
    "etcetera": [
        "NN", 
        "FW"
    ], 
    "recombinant": [
        "JJ"
    ], 
    "keenly": [
        "RB"
    ], 
    "Winnie": [
        "NNP"
    ], 
    "bathwater": [
        "NN"
    ], 
    "recurred": [
        "VBD", 
        "VBN"
    ], 
    "Facilities": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "airily": [
        "RB"
    ], 
    "YES": [
        "NNP"
    ], 
    "Pawtucket": [
        "NNP"
    ], 
    "Old-time": [
        "JJ"
    ], 
    "WTBS": [
        "NNP"
    ], 
    "gold-share": [
        "JJ"
    ], 
    "printing-ink": [
        "JJ"
    ], 
    "Osbert": [
        "NNP"
    ], 
    "Nearing": [
        "VBG"
    ], 
    "Ringo": [
        "NNP"
    ], 
    "bishopry": [
        "NN"
    ], 
    "MerchantsBank": [
        "NNP"
    ], 
    "FIAT": [
        "NNP"
    ], 
    "defensively": [
        "RB"
    ], 
    "Arabian-American": [
        "NNP"
    ], 
    "foreign-investment": [
        "JJ"
    ], 
    "Lermer": [
        "NNP"
    ], 
    "Compilation": [
        "NN"
    ], 
    "field-services": [
        "JJ"
    ], 
    "Designated": [
        "NNP"
    ], 
    "Wisdom": [
        "NNP", 
        "NN"
    ], 
    "vaccines": [
        "NNS"
    ], 
    "unlocks": [
        "VBZ"
    ], 
    "kilometer": [
        "NN"
    ], 
    "moons": [
        "NNS"
    ], 
    "Kadane": [
        "NNP"
    ], 
    "Ziegfeld": [
        "NNP"
    ], 
    "welcomes": [
        "VBZ"
    ], 
    "food-sector": [
        "JJ"
    ], 
    "Rademacher": [
        "NNP"
    ], 
    "Hip": [
        "NN"
    ], 
    "severe-looking": [
        "JJ"
    ], 
    "Harbor": [
        "NNP"
    ], 
    "Wachter": [
        "NNP"
    ], 
    "Oglethorpe": [
        "NNP"
    ], 
    "VGA": [
        "NNP"
    ], 
    "Katzenjammer": [
        "NNP"
    ], 
    "Mazowsze": [
        "NNP"
    ], 
    "Teeth": [
        "NNS"
    ], 
    "menacing": [
        "JJ", 
        "VBG"
    ], 
    "wickedly": [
        "RB"
    ], 
    "Cosmos": [
        "NNP"
    ], 
    "uncharacteristically": [
        "RB"
    ], 
    "Ashington-Pickett": [
        "NNP"
    ], 
    "majestically": [
        "RB"
    ], 
    "Collectors": [
        "NNS"
    ], 
    "Hwang": [
        "NNP"
    ], 
    "millionaire": [
        "NN"
    ], 
    "catcalls": [
        "NNS"
    ], 
    "lifeline": [
        "NN"
    ], 
    "workplace": [
        "NN", 
        "JJ"
    ], 
    "raggedness": [
        "NN"
    ], 
    "grooming": [
        "NN", 
        "VBG"
    ], 
    "fix": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "roominess": [
        "NN"
    ], 
    "Yosemite": [
        "NNP"
    ], 
    "Kaganovich": [
        "NNP"
    ], 
    "Fairbanks": [
        "NNP"
    ], 
    "gaiety": [
        "NN"
    ], 
    "Whiteley": [
        "NNP"
    ], 
    "Smiths": [
        "NNPS"
    ], 
    "Carnegey": [
        "NNP"
    ], 
    "cribs": [
        "NNS", 
        "VBZ"
    ], 
    "Nedelya": [
        "NNP"
    ], 
    "Shouldering": [
        "VBG"
    ], 
    "Alperstein": [
        "NNP"
    ], 
    "Chaseman": [
        "NNP"
    ], 
    "Caius": [
        "NNP"
    ], 
    "network-buying": [
        "JJ"
    ], 
    "A.C.": [
        "NNP"
    ], 
    "suppressant": [
        "NN"
    ], 
    "west": [
        "NN", 
        "JJ", 
        "RB", 
        "JJS"
    ], 
    "Interscience": [
        "NNP"
    ], 
    "Asheville": [
        "NNP"
    ], 
    "motives": [
        "NNS"
    ], 
    "MountainBikes": [
        "NNPS"
    ], 
    "toadyism": [
        "NN"
    ], 
    "BankAmerica": [
        "NNP"
    ], 
    "tightener": [
        "NN"
    ], 
    "clergyman": [
        "NN"
    ], 
    "readings": [
        "NNS"
    ], 
    "photos": [
        "NNS"
    ], 
    "tightened": [
        "VBD", 
        "VBN"
    ], 
    "offshore": [
        "JJ", 
        "RB"
    ], 
    "abject": [
        "JJ"
    ], 
    "extant": [
        "JJ"
    ], 
    "Prompted": [
        "VBN"
    ], 
    "Adjusted": [
        "NNP", 
        "VBN", 
        "JJ"
    ], 
    "Muenchen": [
        "NNP"
    ], 
    "fin": [
        "NN"
    ], 
    "pretence": [
        "NN"
    ], 
    "Pozzatti": [
        "NNP"
    ], 
    "bankrupts": [
        "VBZ"
    ], 
    "Cooch": [
        "NNP"
    ], 
    "state-building": [
        "NN"
    ], 
    "Size": [
        "NN"
    ], 
    "graphed": [
        "VBN"
    ], 
    "importation": [
        "NN"
    ], 
    "Zhitzhakli": [
        "NNP"
    ], 
    "over-stitched": [
        "JJ"
    ], 
    "labor-force": [
        "NN"
    ], 
    "limping": [
        "VBG", 
        "JJ"
    ], 
    "depressors": [
        "NNS"
    ], 
    "demolition": [
        "NN", 
        "JJ"
    ], 
    "Profile": [
        "NN"
    ], 
    "Norcen": [
        "NNP"
    ], 
    "ingrained": [
        "JJ"
    ], 
    "sinuously": [
        "RB"
    ], 
    "Profili": [
        "NNP"
    ], 
    "Apocrypha": [
        "NNPS"
    ], 
    "Kiko": [
        "NNP"
    ], 
    "Kiki": [
        "NNP"
    ], 
    "Blood": [
        "NNP", 
        "NN"
    ], 
    "Bloom": [
        "NNP"
    ], 
    "visually": [
        "RB"
    ], 
    "assigns": [
        "VBZ", 
        "NNS"
    ], 
    "hideaway": [
        "NN"
    ], 
    "Map": [
        "NNP"
    ], 
    "saber-toothed": [
        "JJ"
    ], 
    "Clear": [
        "NNP"
    ], 
    "IRS": [
        "NNP"
    ], 
    "anti-Honecker": [
        "JJ"
    ], 
    "IRI": [
        "NNP"
    ], 
    "Anywhere": [
        "RB"
    ], 
    "Clean": [
        "NNP", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Barend": [
        "NNP"
    ], 
    "IRA": [
        "NNP", 
        "NN"
    ], 
    "Temper": [
        "NN", 
        "NNP"
    ], 
    "by-product": [
        "NN"
    ], 
    "agronomist": [
        "NN"
    ], 
    "Tappan": [
        "NNP"
    ], 
    "wane": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Whiting": [
        "NNP"
    ], 
    "Mednis": [
        "NNP"
    ], 
    "Non-lawyers": [
        "NNS"
    ], 
    "Longley": [
        "NNP"
    ], 
    "flatish": [
        "JJ"
    ], 
    "May": [
        "NNP", 
        "MD"
    ], 
    "peculiarities": [
        "NNS"
    ], 
    "nonunionized": [
        "VBN"
    ], 
    "Berlitz": [
        "NNP"
    ], 
    "Sigmund": [
        "NNP"
    ], 
    "highest-ranking": [
        "JJ"
    ], 
    "Magellan": [
        "NNP", 
        "NN"
    ], 
    "persistently": [
        "RB"
    ], 
    "NAB": [
        "NNP"
    ], 
    "NAC": [
        "NNP"
    ], 
    "Mudugno": [
        "NNP"
    ], 
    "Conceivably": [
        "RB"
    ], 
    "being": [
        "VBG", 
        "JJ", 
        "NN", 
        "VBG|JJ"
    ], 
    "Diesel": [
        "NNP", 
        "NN"
    ], 
    "NAM": [
        "NNP"
    ], 
    "NAR": [
        "NNP"
    ], 
    "NAS": [
        "NNP"
    ], 
    "Aeschylus": [
        "NNP"
    ], 
    "B.G.": [
        "NNP"
    ], 
    "Megargel": [
        "NNP"
    ], 
    "temblor": [
        "NN"
    ], 
    "generator": [
        "NN"
    ], 
    "Completed": [
        "VBN"
    ], 
    "adroit": [
        "JJ"
    ], 
    "plunderers": [
        "NNS"
    ], 
    "Mac": [
        "NNP"
    ], 
    "plumed": [
        "JJ"
    ], 
    "grounder": [
        "NN"
    ], 
    "saddened": [
        "JJ", 
        "VBN"
    ], 
    "plumes": [
        "NNS"
    ], 
    "dart-throwing": [
        "NN"
    ], 
    "Crane": [
        "NNP"
    ], 
    "Completes": [
        "VBZ"
    ], 
    "FOREAMI": [
        "NNP"
    ], 
    "foot-loose": [
        "JJ"
    ], 
    "customer-oriented": [
        "JJ"
    ], 
    "absense": [
        "NN"
    ], 
    "unerring": [
        "JJ"
    ], 
    "Tarnoff": [
        "NNP"
    ], 
    "rejoin": [
        "VB", 
        "VBP"
    ], 
    "decomposed": [
        "JJ"
    ], 
    "sums": [
        "NNS", 
        "VBZ"
    ], 
    "romps": [
        "NNS"
    ], 
    "spokespersons": [
        "NNS"
    ], 
    "traffic": [
        "NN"
    ], 
    "preference": [
        "NN"
    ], 
    "decomposes": [
        "VBZ"
    ], 
    "Manon": [
        "NNP"
    ], 
    "sensational": [
        "JJ"
    ], 
    "Coontz": [
        "NNP"
    ], 
    "Millenbruch": [
        "NNP"
    ], 
    "conpired": [
        "VBN"
    ], 
    "Sergio": [
        "NNP"
    ], 
    "piston-brake": [
        "NN"
    ], 
    "Electrochemical": [
        "NNP"
    ], 
    "superiority": [
        "NN"
    ], 
    "Warming": [
        "VBG"
    ], 
    "Valiant": [
        "NNP"
    ], 
    "pizza-eating": [
        "JJ"
    ], 
    "Suggs": [
        "NNP"
    ], 
    "obstruct": [
        "VB", 
        "VBP"
    ], 
    "Case": [
        "NNP", 
        "NN"
    ], 
    "satisfactory": [
        "JJ"
    ], 
    "NAFTA": [
        "NNP"
    ], 
    "Aligning": [
        "VBG"
    ], 
    "rest-room": [
        "NN"
    ], 
    "Expressed": [
        "VBN"
    ], 
    "pervading": [
        "VBG"
    ], 
    "Expresses": [
        "VBZ"
    ], 
    "firstpreference": [
        "NN"
    ], 
    "Sorkin": [
        "NNP"
    ], 
    "Hanifen": [
        "NNP"
    ], 
    "substance": [
        "NN"
    ], 
    "self-effacement": [
        "NN"
    ], 
    "Pharaoh": [
        "NNP"
    ], 
    "Verwoerd": [
        "NNP"
    ], 
    "propylthiouracil": [
        "NN"
    ], 
    "ravines": [
        "NNS"
    ], 
    "bench...": [
        ":"
    ], 
    "Chausson": [
        "NNP"
    ], 
    "bravest-feathered": [
        "JJ"
    ], 
    "averse": [
        "JJ"
    ], 
    "Cartoonist": [
        "NN"
    ], 
    "disparaging": [
        "VBG"
    ], 
    "Pooling": [
        "NNP"
    ], 
    "Gaul": [
        "NNP"
    ], 
    "KCs": [
        "NNS"
    ], 
    "endogamy": [
        "NN"
    ], 
    "Knows": [
        "VBZ"
    ], 
    "exasperating": [
        "VBG", 
        "JJ"
    ], 
    "Bramah": [
        "NNP"
    ], 
    "bio-research": [
        "NN"
    ], 
    "ferromagnetic": [
        "JJ"
    ], 
    "revolutionists": [
        "NNS"
    ], 
    "newsboy": [
        "NN"
    ], 
    "one-iron": [
        "JJ"
    ], 
    "Agoura": [
        "NNP"
    ], 
    "KCS": [
        "NNP"
    ], 
    "Gloria": [
        "NNP"
    ], 
    "Lindzen": [
        "NNP"
    ], 
    "sonority": [
        "NN"
    ], 
    "Hesburgh": [
        "NNP"
    ], 
    "perturbed": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "commingled": [
        "VBN"
    ], 
    "antidote": [
        "NN"
    ], 
    "tangoed": [
        "VBD"
    ], 
    "revivified": [
        "VBN"
    ], 
    "Herber": [
        "NNP"
    ], 
    "Celie": [
        "NNP"
    ], 
    "lively": [
        "JJ", 
        "RB"
    ], 
    "Celia": [
        "NNP"
    ], 
    "pivot": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "biches": [
        "NNS"
    ], 
    "news-magazine": [
        "NN"
    ], 
    "gnashing": [
        "VBG"
    ], 
    "bubbly": [
        "JJ", 
        "NN"
    ], 
    "salicylate": [
        "NN"
    ], 
    "gleam": [
        "NN", 
        "VBP"
    ], 
    "glean": [
        "VB"
    ], 
    "Galamian": [
        "NNP"
    ], 
    "Peninsula": [
        "NNP"
    ], 
    "redirection": [
        "NN"
    ], 
    "Calder": [
        "NNP"
    ], 
    "Steckles": [
        "NNP"
    ], 
    "sealed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "cupids": [
        "NNS"
    ], 
    "bubble": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Political-Military": [
        "NNP"
    ], 
    "tire-makers": [
        "NNS"
    ], 
    "secreted": [
        "VBN"
    ], 
    "emigres": [
        "NNS"
    ], 
    "societal": [
        "JJ"
    ], 
    "Southgate": [
        "NNP"
    ], 
    "with": [
        "IN", 
        "JJ", 
        "RB", 
        "RP"
    ], 
    "Redevelopment": [
        "NNP"
    ], 
    "abused": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "rage": [
        "NN", 
        "VB"
    ], 
    "self-seeking": [
        "JJ", 
        "NN"
    ], 
    "upper-level": [
        "JJ"
    ], 
    "tripe": [
        "NN"
    ], 
    "marginality": [
        "NN"
    ], 
    "chomped": [
        "VBN"
    ], 
    "rags": [
        "NNS"
    ], 
    "operationally": [
        "RB"
    ], 
    "FRANKLIN": [
        "NNP"
    ], 
    "abuser": [
        "NN"
    ], 
    "abuses": [
        "NNS"
    ], 
    "Berea": [
        "NNP"
    ], 
    "trips": [
        "NNS"
    ], 
    "touchstone": [
        "NN"
    ], 
    "dance-committee": [
        "JJ"
    ], 
    "Beaubien": [
        "NNP"
    ], 
    "Hormats": [
        "NNP"
    ], 
    "color-television": [
        "NN"
    ], 
    "Cinderella": [
        "NNP"
    ], 
    "POLITICAL": [
        "JJ"
    ], 
    "Auerbach": [
        "NNP"
    ], 
    "watches": [
        "NNS", 
        "VBZ"
    ], 
    "Meineke": [
        "NNP"
    ], 
    "incepting": [
        "VBG"
    ], 
    "associating": [
        "VBG"
    ], 
    "follow-up": [
        "NN", 
        "JJ"
    ], 
    "formulation": [
        "NN"
    ], 
    "creak": [
        "NN", 
        "VB"
    ], 
    "tremble": [
        "VB", 
        "NN"
    ], 
    "C.H.": [
        "NNP"
    ], 
    "cream": [
        "NN", 
        "JJ"
    ], 
    "Ladd": [
        "NNP"
    ], 
    "Lada": [
        "NNP"
    ], 
    "Burnley": [
        "NNP"
    ], 
    "sympathetically": [
        "RB"
    ], 
    "unparalleled": [
        "JJ"
    ], 
    "Savior": [
        "NNP", 
        "NN"
    ], 
    "Bunyan": [
        "NNP"
    ], 
    "Incinerator": [
        "NNP"
    ], 
    "Lady": [
        "NNP", 
        "NN"
    ], 
    "Amadee": [
        "NNP"
    ], 
    "faxes": [
        "NNS"
    ], 
    "refunded": [
        "VBN"
    ], 
    "waving": [
        "VBG", 
        "NN"
    ], 
    "Kaufnabb": [
        "NNP"
    ], 
    "faxed": [
        "VBD", 
        "VBN"
    ], 
    "hairsplitting": [
        "JJ"
    ], 
    "brotherhood": [
        "NN"
    ], 
    "linebackers": [
        "NNS"
    ], 
    "LeFevre": [
        "NNP"
    ], 
    "tricky": [
        "JJ"
    ], 
    "Krims": [
        "NNPS"
    ], 
    "twinges": [
        "NNS"
    ], 
    "Henh": [
        "UH"
    ], 
    "Mercer-Meidinger-Hansen": [
        "NNP"
    ], 
    "Explained": [
        "NNP"
    ], 
    "maliciously": [
        "RB"
    ], 
    "Casinos": [
        "NNS"
    ], 
    "Lyric": [
        "NNP"
    ], 
    "pre-Revolutionary": [
        "JJ"
    ], 
    "Moorhead": [
        "NNP"
    ], 
    "accreted": [
        "VBN"
    ], 
    "Hens": [
        "NNS", 
        "NNPS"
    ], 
    "industry-government": [
        "JJ", 
        "NN"
    ], 
    "legislatures": [
        "NNS"
    ], 
    "head-to-head": [
        "JJ", 
        "RB", 
        "RBR"
    ], 
    "Drinkhouse": [
        "NNP"
    ], 
    "oathe": [
        "NN"
    ], 
    "caused": [
        "VBN", 
        "VBD"
    ], 
    "beware": [
        "VB", 
        "VBP"
    ], 
    "ceramic": [
        "JJ"
    ], 
    "unitholders": [
        "NNS"
    ], 
    "About": [
        "IN", 
        "RB", 
        "NNP"
    ], 
    "tax-loss": [
        "NN", 
        "JJ"
    ], 
    "Farley": [
        "NNP"
    ], 
    "Alperts": [
        "NNS"
    ], 
    "causes": [
        "NNS", 
        "VBZ"
    ], 
    "Galsworthy": [
        "NNP"
    ], 
    "Rodney-Miss": [
        "NNP"
    ], 
    "predawn": [
        "JJ"
    ], 
    "front-desk": [
        "NN", 
        "JJ"
    ], 
    "contraction-extension": [
        "JJ"
    ], 
    "gall-bladder": [
        "NN"
    ], 
    "overexpose": [
        "VB"
    ], 
    "Grappelly": [
        "NNP"
    ], 
    "norm": [
        "NN"
    ], 
    "re-marketing": [
        "NN"
    ], 
    "break-neck": [
        "JJ"
    ], 
    "floated": [
        "VBD", 
        "VBN"
    ], 
    "TRANSCANADA": [
        "NNP"
    ], 
    "Conversation": [
        "NN"
    ], 
    "Menzel": [
        "NNP"
    ], 
    "floater": [
        "NN"
    ], 
    "Wilkes": [
        "VBZ", 
        "NNP"
    ], 
    "Maniffature": [
        "NNP"
    ], 
    "Wilkey": [
        "NNP"
    ], 
    "insufficiently": [
        "RB"
    ], 
    "sang": [
        "VBD", 
        "FW"
    ], 
    "Hoxa": [
        "NNP"
    ], 
    "sane": [
        "JJ"
    ], 
    "Semifinished": [
        "VBN"
    ], 
    "sana": [
        "FW"
    ], 
    "senselessly": [
        "RB"
    ], 
    "sank": [
        "VBD"
    ], 
    "self-employment": [
        "NN"
    ], 
    "abbreviated": [
        "JJ"
    ], 
    "OEP": [
        "NNP"
    ], 
    "bird-brain": [
        "NN"
    ], 
    "ultravehement": [
        "JJ"
    ], 
    "Thrice": [
        "RB"
    ], 
    "strong-willed": [
        "JJ"
    ], 
    "topcoats": [
        "NNS"
    ], 
    "accreditation": [
        "NN"
    ], 
    "psychosomatic": [
        "JJ"
    ], 
    "straggle": [
        "VBP"
    ], 
    "hyper-trader": [
        "NN"
    ], 
    "Dutch\\/Shell": [
        "NNP"
    ], 
    "computing-services": [
        "JJ"
    ], 
    "PAYS": [
        "VBZ"
    ], 
    "Ogilvy": [
        "NNP", 
        "NN"
    ], 
    "jurist": [
        "NN"
    ], 
    "dwells": [
        "VBZ"
    ], 
    "hash": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "obtrudes": [
        "VBZ"
    ], 
    "hatchway": [
        "NN"
    ], 
    "Huntley": [
        "NNP"
    ], 
    "Departments": [
        "NNPS", 
        "NNP"
    ], 
    "strata": [
        "NNS"
    ], 
    "daunted": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "OEC": [
        "NNP"
    ], 
    "unrewarding": [
        "JJ"
    ], 
    "hast": [
        "VBP"
    ], 
    "less-complicated": [
        "JJ"
    ], 
    "MANHATTAN": [
        "NNP"
    ], 
    "criminality": [
        "NN"
    ], 
    "Histadrut": [
        "NNP"
    ], 
    "Concept": [
        "NNP"
    ], 
    "Fawkes": [
        "NNP"
    ], 
    "Mercer": [
        "NNP"
    ], 
    "Rodman": [
        "NNP"
    ], 
    "Vaikule": [
        "NNP"
    ], 
    "periodic": [
        "JJ"
    ], 
    "free-on-board": [
        "JJ"
    ], 
    "Quintet": [
        "NNP"
    ], 
    "Chazanoff": [
        "NNP"
    ], 
    "skepticism": [
        "NN"
    ], 
    "dehumanized": [
        "VBN"
    ], 
    "Alsatian": [
        "NNP"
    ], 
    "depart": [
        "VB", 
        "VBP"
    ], 
    "retroactive": [
        "JJ"
    ], 
    "reclaimed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Scorpio": [
        "NNP"
    ], 
    "art-auction": [
        "NN"
    ], 
    "traumatized": [
        "VBD", 
        "VBN"
    ], 
    "full-sized": [
        "JJ"
    ], 
    "Puttin": [
        "NNP"
    ], 
    "cynics": [
        "NNS"
    ], 
    "launchings": [
        "NNS"
    ], 
    "shape-up": [
        "JJ"
    ], 
    "rudder": [
        "NN"
    ], 
    "Crash": [
        "NNP", 
        "NN"
    ], 
    "invalidism": [
        "NN"
    ], 
    "prejudging": [
        "VBG"
    ], 
    "Dumpster": [
        "NNP"
    ], 
    "Bamford": [
        "NNP"
    ], 
    "cat-and-mouse": [
        "JJ"
    ], 
    "act...": [
        ":"
    ], 
    "failure-to-supervise": [
        "JJ"
    ], 
    "initiated": [
        "VBN", 
        "VBD"
    ], 
    "company": [
        "NN"
    ], 
    "Frumil": [
        "NNP"
    ], 
    "corrected": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Subways": [
        "NNS"
    ], 
    "initiates": [
        "VBZ", 
        "NNS"
    ], 
    "Subic": [
        "NNP"
    ], 
    "survey-type": [
        "JJ"
    ], 
    "Cybill": [
        "NNP"
    ], 
    "stampings": [
        "NNS"
    ], 
    "Willows": [
        "NNS"
    ], 
    "Gods": [
        "NNP", 
        "NNS"
    ], 
    "installing": [
        "VBG"
    ], 
    "Corsicas": [
        "NNS"
    ], 
    "CORTES": [
        "NNP"
    ], 
    "resorcinol": [
        "NN", 
        "JJ"
    ], 
    "ice-breaker": [
        "JJ", 
        "NN"
    ], 
    "knocked": [
        "VBD", 
        "VBN"
    ], 
    "grope": [
        "VB", 
        "VBP"
    ], 
    "scramble": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Panasonic": [
        "NNP", 
        "JJ"
    ], 
    "bogs": [
        "VBZ"
    ], 
    "Guppy": [
        "NNP"
    ], 
    "meaner": [
        "JJR"
    ], 
    "bogy": [
        "NN"
    ], 
    "Called": [
        "VBN", 
        "VBD", 
        "NNP"
    ], 
    "Somali": [
        "JJ", 
        "NNP"
    ], 
    "clotheslines": [
        "NNS"
    ], 
    "allegro": [
        "JJ"
    ], 
    "electric-driven": [
        "JJ"
    ], 
    "Grits": [
        "NNP"
    ], 
    "recapitalize": [
        "VB"
    ], 
    "Wolfson": [
        "NNP"
    ], 
    "Quinta": [
        "NNP"
    ], 
    "Glasgow": [
        "NNP"
    ], 
    "bonded": [
        "VBN", 
        "JJ"
    ], 
    "brushoff": [
        "NN"
    ], 
    "huge": [
        "JJ"
    ], 
    "Murkland": [
        "NNP"
    ], 
    "hugh": [
        "JJ"
    ], 
    "dismissed": [
        "VBD", 
        "VBN"
    ], 
    "Frances": [
        "NNP"
    ], 
    "top-selling": [
        "JJ"
    ], 
    "Hering": [
        "NNP"
    ], 
    "hugs": [
        "NNS"
    ], 
    "dismisses": [
        "VBZ"
    ], 
    "Sigmen": [
        "NNP"
    ], 
    "Skorich": [
        "NNP"
    ], 
    "thickened": [
        "VBN", 
        "VBD"
    ], 
    "disgraced": [
        "VBN"
    ], 
    "variant": [
        "NN", 
        "JJ"
    ], 
    "ineffectively": [
        "RB"
    ], 
    "hackwork": [
        "NN"
    ], 
    "Declan": [
        "NNP"
    ], 
    "malevolent": [
        "JJ"
    ], 
    "loan-to-value": [
        "JJ"
    ], 
    "resemble": [
        "VB", 
        "VBP"
    ], 
    "twisting": [
        "VBG", 
        "NN"
    ], 
    "France.": [
        "NNP"
    ], 
    "Stuff": [
        "NN"
    ], 
    "Nero": [
        "NNP"
    ], 
    "media": [
        "NNS", 
        "NN"
    ], 
    "exclusions": [
        "NNS"
    ], 
    "Ikle": [
        "NNP"
    ], 
    "everlastingly": [
        "RB"
    ], 
    "accuse": [
        "VB", 
        "VBP"
    ], 
    "Oilfields": [
        "NNS"
    ], 
    "peppy": [
        "JJ"
    ], 
    "installed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "enrollments": [
        "NNS"
    ], 
    "paper": [
        "NN", 
        "VB"
    ], 
    "spirituals": [
        "NNS"
    ], 
    "installer": [
        "NN"
    ], 
    "sceneries": [
        "NNS"
    ], 
    "schoolhouse": [
        "NN"
    ], 
    "sell-through": [
        "NN"
    ], 
    "cheerfulness": [
        "NN"
    ], 
    "bummed": [
        "VBN"
    ], 
    "Parental": [
        "JJ"
    ], 
    "boomerangs": [
        "NNS"
    ], 
    "Fisheries": [
        "NNP", 
        "NNPS"
    ], 
    "bypass": [
        "VB", 
        "NN"
    ], 
    "non-subcommittee": [
        "JJ"
    ], 
    "Brussels": [
        "NNP", 
        "NNS"
    ], 
    "sauce": [
        "NN"
    ], 
    "reintroduced": [
        "VBN", 
        "VBD"
    ], 
    "colleague": [
        "NN"
    ], 
    "Loma": [
        "NNP"
    ], 
    "Lomb": [
        "NNP"
    ], 
    "abandons": [
        "VBZ"
    ], 
    "gadget": [
        "NN"
    ], 
    "MS-DOS": [
        "NNP"
    ], 
    "deliberating": [
        "VBG"
    ], 
    "Berkman": [
        "NNP"
    ], 
    "idols": [
        "NNS"
    ], 
    "Markovic": [
        "NNP"
    ], 
    "Ameritech": [
        "NNP"
    ], 
    "Curley": [
        "NNP"
    ], 
    "cigar-making": [
        "JJ"
    ], 
    "autocracy": [
        "NN"
    ], 
    "Satires": [
        "NNPS"
    ], 
    "anti-price-fixing": [
        "JJ"
    ], 
    "Authority": [
        "NNP", 
        "NN"
    ], 
    "courses": [
        "NNS"
    ], 
    "Day-to-day": [
        "JJ"
    ], 
    "Oswald": [
        "NNP"
    ], 
    "shocking": [
        "JJ", 
        "VBG"
    ], 
    "chipping": [
        "VBG", 
        "NN"
    ], 
    "begged": [
        "VBD", 
        "VBN"
    ], 
    "Bosak": [
        "NNP"
    ], 
    "cicadas": [
        "NNS"
    ], 
    "C.W.": [
        "NNP"
    ], 
    "Bergman": [
        "NNP"
    ], 
    "scarcely-tapped": [
        "JJ"
    ], 
    "lipstick": [
        "NN"
    ], 
    "scoops": [
        "VBZ", 
        "NNS"
    ], 
    "boxed-in": [
        "JJ"
    ], 
    "research": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "RF-082": [
        "NN"
    ], 
    "life-changing": [
        "JJ"
    ], 
    "Report": [
        "NNP", 
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Jewett": [
        "NNP"
    ], 
    "electricals": [
        "NNS"
    ], 
    "cables": [
        "NNS"
    ], 
    "bedlam": [
        "NN"
    ], 
    "Muzo": [
        "NNP"
    ], 
    "Canute": [
        "NNP"
    ], 
    "Bohane": [
        "NNP"
    ], 
    "suntan": [
        "NN"
    ], 
    "CIRCUIT": [
        "NNP"
    ], 
    "airway": [
        "NN"
    ], 
    "ecologically": [
        "RB"
    ], 
    "Nino": [
        "NNP"
    ], 
    "Buell": [
        "NNP"
    ], 
    "tractor-trailer": [
        "NN"
    ], 
    "carry-on": [
        "JJ", 
        "NN"
    ], 
    "Exitosa": [
        "NNP"
    ], 
    "MGM": [
        "NNP"
    ], 
    "Fawaz": [
        "NNP"
    ], 
    "Thyssen": [
        "NNP"
    ], 
    "porpoise": [
        "NN"
    ], 
    "precautionary": [
        "JJ"
    ], 
    "Remains": [
        "NNS"
    ], 
    "Dalai": [
        "NNP"
    ], 
    "preservation": [
        "NN"
    ], 
    "Delancy": [
        "NNP"
    ], 
    "Agonale": [
        "NNP"
    ], 
    "Malocclusion": [
        "NN"
    ], 
    "peaceable": [
        "JJ"
    ], 
    "CH": [
        "NN", 
        "NNP"
    ], 
    "percolator": [
        "NN"
    ], 
    "Started": [
        "VBN"
    ], 
    "swipe": [
        "NN", 
        "VB"
    ], 
    "tradition": [
        "NN"
    ], 
    "Giraffe": [
        "NNP"
    ], 
    "intra-EC": [
        "JJ"
    ], 
    "calculations": [
        "NNS"
    ], 
    "Homebrew": [
        "NNP"
    ], 
    "essays": [
        "NNS"
    ], 
    "Starter": [
        "NNP"
    ], 
    "scimitar-wielding": [
        "JJ"
    ], 
    "tenderfoot": [
        "NN"
    ], 
    "Assignation": [
        "NN"
    ], 
    "hand-covered": [
        "JJ"
    ], 
    "age-and-sex": [
        "JJ"
    ], 
    "Bugs": [
        "NNP", 
        "NNS"
    ], 
    "cheekbones": [
        "NNS"
    ], 
    "Trinen": [
        "NNP"
    ], 
    "Dludsky": [
        "NNP"
    ], 
    "stifle": [
        "VB"
    ], 
    "evicting": [
        "VBG"
    ], 
    "Treble": [
        "NNP"
    ], 
    "Hogg": [
        "NNP"
    ], 
    "Cancer": [
        "NNP", 
        "NN"
    ], 
    "Hoge": [
        "NNP"
    ], 
    "de-emphasized": [
        "VBN"
    ], 
    "getaway": [
        "NN"
    ], 
    "Hogs": [
        "NNS"
    ], 
    "dismantling": [
        "VBG", 
        "NN"
    ], 
    "Shiloh": [
        "NNP"
    ], 
    "mass-producing": [
        "VBG"
    ], 
    "country-and-Western": [
        "JJ"
    ], 
    "Speculative": [
        "JJ"
    ], 
    "exuberant": [
        "JJ"
    ], 
    "forward-moving": [
        "JJ"
    ], 
    "swanky": [
        "JJ"
    ], 
    "Metro-Goldwyn-Mayer": [
        "NNP"
    ], 
    "Oldsmobile": [
        "NNP"
    ], 
    "Anti-Deficiency": [
        "NNP"
    ], 
    "mutilates": [
        "VBZ"
    ], 
    "blond": [
        "JJ", 
        "NN"
    ], 
    "conjugate": [
        "NN"
    ], 
    "Etess": [
        "NNP"
    ], 
    "odors": [
        "NNS"
    ], 
    "Founding": [
        "NNP", 
        "VBG"
    ], 
    "fermented": [
        "VBN"
    ], 
    "permanence": [
        "NN"
    ], 
    "single-B-minus": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "peridontal": [
        "JJ"
    ], 
    "recognizing": [
        "VBG"
    ], 
    "Othello": [
        "NNP"
    ], 
    "Addis": [
        "NNP"
    ], 
    "penman": [
        "NN"
    ], 
    "Recreation": [
        "NNP", 
        "NN"
    ], 
    "singles": [
        "NNS", 
        "VBZ"
    ], 
    "Consultant": [
        "NNP", 
        "NN"
    ], 
    "Pollare": [
        "NNP"
    ], 
    "shake-up": [
        "NN"
    ], 
    "Energetic": [
        "JJ"
    ], 
    "understands": [
        "VBZ"
    ], 
    "wiggled": [
        "VBD"
    ], 
    "seize": [
        "VB", 
        "VBP"
    ], 
    "Brownapopolus": [
        "NNP"
    ], 
    "OTC": [
        "NNP"
    ], 
    "proliferated": [
        "VBN", 
        "VB", 
        "VBD"
    ], 
    "cultivating": [
        "VBG"
    ], 
    "administrate": [
        "VB"
    ], 
    "Indirect": [
        "JJ"
    ], 
    "OTS": [
        "NNP"
    ], 
    "harvests": [
        "NNS"
    ], 
    "wording": [
        "NN"
    ], 
    "ambiguities": [
        "NNS"
    ], 
    "husband-and-wife": [
        "JJ", 
        "NN"
    ], 
    "team-management": [
        "NN"
    ], 
    "far-flung": [
        "JJ"
    ], 
    "Consumption": [
        "NN"
    ], 
    "exterminate": [
        "VB"
    ], 
    "agonize": [
        "VB", 
        "VBP"
    ], 
    "Deadly": [
        "JJ"
    ], 
    "Motown": [
        "NNP"
    ], 
    "affix": [
        "VB"
    ], 
    "Amgen": [
        "NNP"
    ], 
    "Pepperdine": [
        "NNP"
    ], 
    "Behold": [
        "VB"
    ], 
    "overwhelmed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "blender": [
        "NN"
    ], 
    "Bast": [
        "NNP"
    ], 
    "Basu": [
        "NNP"
    ], 
    "Bass": [
        "NNP", 
        "NN"
    ], 
    "two-room": [
        "JJ"
    ], 
    "Dirt": [
        "NN"
    ], 
    "commodity-market": [
        "NN"
    ], 
    "Premiere": [
        "NNP"
    ], 
    "Patrolmen": [
        "NNP"
    ], 
    "gooey": [
        "JJ"
    ], 
    "Basf": [
        "NNP"
    ], 
    "Maxxam": [
        "NNP"
    ], 
    "Base": [
        "NNP", 
        "NN"
    ], 
    "Dire": [
        "JJ"
    ], 
    "Dirk": [
        "NNP"
    ], 
    "Palash": [
        "NNP"
    ], 
    "indifference": [
        "NN"
    ], 
    "non-wealthy": [
        "JJ"
    ], 
    "columns": [
        "NNS"
    ], 
    "chiefdoms": [
        "NNS"
    ], 
    "uncontested": [
        "JJ"
    ], 
    "mousetraps": [
        "NNS"
    ], 
    "pleasure\\": [
        "CC"
    ], 
    "Cooker": [
        "NNP"
    ], 
    "Lesley": [
        "NNP"
    ], 
    "adventurers": [
        "NNS"
    ], 
    "Aroostook": [
        "NNP"
    ], 
    "Cooked": [
        "VBN", 
        "JJ"
    ], 
    "remedy": [
        "NN", 
        "VB"
    ], 
    "Delaware-based": [
        "JJ"
    ], 
    "Finevest": [
        "NNP"
    ], 
    "compass": [
        "NN", 
        "VB"
    ], 
    "damnit": [
        "UH"
    ], 
    "distraction": [
        "NN"
    ], 
    "sects": [
        "NNS"
    ], 
    "incapacitated": [
        "VBN"
    ], 
    "well-off": [
        "JJ"
    ], 
    "tanked": [
        "VBN"
    ], 
    "Improper": [
        "JJ"
    ], 
    "Surveying": [
        "VBG"
    ], 
    "untrustworthiness": [
        "NN"
    ], 
    "tanker": [
        "NN"
    ], 
    "roundhouse": [
        "NN"
    ], 
    "rumored": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "insane": [
        "JJ"
    ], 
    "Criticisms": [
        "NNP"
    ], 
    "handcuffs": [
        "NNS"
    ], 
    "GROUP": [
        "NNP", 
        "NN"
    ], 
    "Sener": [
        "NNP"
    ], 
    "bundling": [
        "VBG"
    ], 
    "activists": [
        "NNS", 
        "VBZ"
    ], 
    "redoubt": [
        "NN"
    ], 
    "Thirty-ninth": [
        "NNP"
    ], 
    "collectively": [
        "RB"
    ], 
    "Founders": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "semidrying": [
        "JJ"
    ], 
    "analog": [
        "NN", 
        "JJ"
    ], 
    "Osram": [
        "NNP"
    ], 
    "Straightening": [
        "VBG"
    ], 
    "Roukema": [
        "NNP"
    ], 
    "dipole": [
        "JJ", 
        "NN"
    ], 
    "Peggy": [
        "NNP"
    ], 
    "exclaimed": [
        "VBD"
    ], 
    "Tieken": [
        "NNP"
    ], 
    "ablated": [
        "VBN"
    ], 
    "hauteur": [
        "NN"
    ], 
    "thrive": [
        "VB", 
        "VBP"
    ], 
    "Hollowell": [
        "NNP"
    ], 
    "pantomimed": [
        "VBD"
    ], 
    "hunter-gatherers": [
        "NNS"
    ], 
    "unsealing": [
        "NN"
    ], 
    "NEKOOSA": [
        "NNP"
    ], 
    "condoned": [
        "VBN", 
        "VBD"
    ], 
    "Fulton": [
        "NNP"
    ], 
    "empowering": [
        "VBG"
    ], 
    "Neil": [
        "NNP"
    ], 
    "legitimately": [
        "RB"
    ], 
    "KRENZ": [
        "NNP"
    ], 
    "out-of-door": [
        "NN"
    ], 
    "money-maker": [
        "NN"
    ], 
    "Boy-Lady": [
        "NNP"
    ], 
    "Wilde": [
        "NNP"
    ], 
    "al-Husseini": [
        "NNP"
    ], 
    "Acapulco": [
        "NNP"
    ], 
    "retarded": [
        "JJ", 
        "NN"
    ], 
    "Wisely": [
        "RB"
    ], 
    "Breton": [
        "NNP"
    ], 
    "bell": [
        "NN"
    ], 
    "Clyde": [
        "NNP"
    ], 
    "adaptation": [
        "NN"
    ], 
    "Mecholyl": [
        "NNP"
    ], 
    "Peanuts": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "belt": [
        "NN"
    ], 
    "nimbler": [
        "JJR"
    ], 
    "Cary": [
        "NNP"
    ], 
    "Blaikie": [
        "NNP"
    ], 
    "Leiby": [
        "NNP"
    ], 
    "Cars": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Stoutt": [
        "NNP"
    ], 
    "satire": [
        "NN"
    ], 
    "imperfections": [
        "NNS"
    ], 
    "longs": [
        "VBZ"
    ], 
    "proprietor": [
        "NN"
    ], 
    "extravagant": [
        "JJ"
    ], 
    "Carl": [
        "NNP"
    ], 
    "Cara": [
        "NNP"
    ], 
    "Card": [
        "NNP", 
        "NN"
    ], 
    "Care": [
        "NNP", 
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Polly": [
        "NNP"
    ], 
    "coahse": [
        "NN"
    ], 
    "N.C.": [
        "NNP"
    ], 
    "Spike-haired": [
        "JJ"
    ], 
    "Polls": [
        "NNS"
    ], 
    "complements": [
        "VBZ", 
        "NNS"
    ], 
    "awake": [
        "JJ", 
        "RB", 
        "VB"
    ], 
    "Sinfonia": [
        "NNP"
    ], 
    "pacemaker": [
        "NN"
    ], 
    "Pollo": [
        "NNP"
    ], 
    "Harriet": [
        "NNP"
    ], 
    "Harrier": [
        "NNP"
    ], 
    "Hiroshima": [
        "NNP"
    ], 
    "Giblen": [
        "NNP"
    ], 
    "lace-drawn": [
        "JJ"
    ], 
    "presses": [
        "NNS", 
        "VBZ"
    ], 
    "Slim-Fast": [
        "NNP"
    ], 
    "Markel": [
        "NNP"
    ], 
    "Drennen": [
        "NNP"
    ], 
    "budget": [
        "NN", 
        "VB"
    ], 
    "Colston": [
        "NNP"
    ], 
    "Biopharm": [
        "NNP"
    ], 
    "Markey": [
        "NNP"
    ], 
    "pressed": [
        "VBN", 
        "VBD"
    ], 
    "Brauerei": [
        "NNP"
    ], 
    "Market": [
        "NNP", 
        "NN"
    ], 
    "error-laden": [
        "JJ"
    ], 
    "hand-wringer": [
        "NN"
    ], 
    "agitation": [
        "NN"
    ], 
    "averaging": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "binding": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "eve": [
        "NN"
    ], 
    "deferred-maintenance": [
        "JJ"
    ], 
    "signal-processing": [
        "JJ", 
        "NN"
    ], 
    "Expressway": [
        "NNP", 
        "NN"
    ], 
    "contract-services": [
        "NNS"
    ], 
    "Bouwer": [
        "NNP"
    ], 
    "raiders": [
        "NNS"
    ], 
    "Norwick": [
        "NNP"
    ], 
    "starlight": [
        "NN"
    ], 
    "Norwich": [
        "NNP"
    ], 
    "economic-efficiency": [
        "NN"
    ], 
    "Leibowitz": [
        "NNP"
    ], 
    "U.S.A": [
        "NNP", 
        "NN"
    ], 
    "behemoths": [
        "NNS"
    ], 
    "Spencerian": [
        "JJ"
    ], 
    "Tidal": [
        "NNP"
    ], 
    "Payments": [
        "NNS", 
        "NNP"
    ], 
    "affairs": [
        "NNS"
    ], 
    "most-watched": [
        "JJ"
    ], 
    "U.S.$": [
        "$"
    ], 
    "cardholders": [
        "NNS"
    ], 
    "Miners": [
        "NNP"
    ], 
    "Likud": [
        "NNP"
    ], 
    "nickname": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "infamous": [
        "JJ"
    ], 
    "Regulator": [
        "NNP"
    ], 
    "hymen": [
        "NN"
    ], 
    "Oregonian": [
        "NNP"
    ], 
    "Haas": [
        "NNP"
    ], 
    "Mexico-based": [
        "JJ"
    ], 
    "Manny": [
        "NNP", 
        "NN"
    ], 
    "Taster": [
        "NNP"
    ], 
    "Mockowiczes": [
        "NNPS"
    ], 
    "copes": [
        "VBZ"
    ], 
    "clasped": [
        "VBD", 
        "VBN"
    ], 
    "Reidy": [
        "NNP"
    ], 
    "O.": [
        "NNP"
    ], 
    "quick-fix": [
        "JJ"
    ], 
    "uncouth": [
        "JJ"
    ], 
    "salvo": [
        "NN", 
        "FW"
    ], 
    "World-Wide": [
        "NNP", 
        "JJ"
    ], 
    "Boyde": [
        "NNP"
    ], 
    "Grenier": [
        "NNP"
    ], 
    "Orphic": [
        "JJ"
    ], 
    "harness-emotions": [
        "JJ"
    ], 
    "Colorliner": [
        "NNP"
    ], 
    "salve": [
        "NN", 
        "VB"
    ], 
    "Marsh": [
        "NNP"
    ], 
    "Harland": [
        "NNP"
    ], 
    "avionics": [
        "NNS", 
        "NN"
    ], 
    "no-strike": [
        "JJ"
    ], 
    "pool-side": [
        "JJ", 
        "NN"
    ], 
    "abstention": [
        "NN"
    ], 
    "F.O.": [
        "NNP"
    ], 
    "Brando": [
        "NNP"
    ], 
    "truism": [
        "NN"
    ], 
    "Nationally": [
        "RB"
    ], 
    "Brande": [
        "NNP"
    ], 
    "audiotex": [
        "NN"
    ], 
    "multi-year": [
        "JJ"
    ], 
    "Brandy": [
        "NNP"
    ], 
    "parents": [
        "NNS"
    ], 
    "Brands": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "closedown": [
        "NN"
    ], 
    "Old-House": [
        "NNP"
    ], 
    "Brandt": [
        "NNP"
    ], 
    "On": [
        "IN", 
        "NNP"
    ], 
    "Ol": [
        "JJ"
    ], 
    "Ok": [
        "NNP", 
        "NN"
    ], 
    "Oi": [
        "NNP"
    ], 
    "Oh": [
        "UH", 
        "NNP"
    ], 
    "Of": [
        "IN", 
        "NNP"
    ], 
    "couple": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "bureaucrat": [
        "NN"
    ], 
    "emanating": [
        "VBG"
    ], 
    "Pepinsky": [
        "NNP"
    ], 
    "oneyear": [
        "JJ"
    ], 
    "polemic": [
        "JJ"
    ], 
    "Oz": [
        "NNP"
    ], 
    "Oy": [
        "NNP"
    ], 
    "Buzz": [
        "NNP"
    ], 
    "colonials": [
        "NNS"
    ], 
    "credit-reporting": [
        "JJ", 
        "NN"
    ], 
    "Or": [
        "CC"
    ], 
    "Cairo-sponsored": [
        "JJ"
    ], 
    "OK": [
        "JJ", 
        "RB", 
        "UH"
    ], 
    "OH": [
        "NN"
    ], 
    "Schacht": [
        "NNP"
    ], 
    "OF": [
        "IN"
    ], 
    "Show": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "Schotter": [
        "NNP"
    ], 
    "Kaydon": [
        "NNP", 
        "NN"
    ], 
    "greenback": [
        "NN"
    ], 
    "chorus": [
        "NN"
    ], 
    "Heideman": [
        "NNP"
    ], 
    "OR": [
        "CC"
    ], 
    "noninterference": [
        "NN"
    ], 
    "Treatment": [
        "NNP", 
        "NN"
    ], 
    "COUP": [
        "NN"
    ], 
    "standing-room": [
        "NN"
    ], 
    "Burlingham": [
        "NNP"
    ], 
    "crapshoot": [
        "NN", 
        "VB"
    ], 
    "bounce": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "bouncy": [
        "JJ"
    ], 
    "Assumption": [
        "NN"
    ], 
    "gold-filled": [
        "JJ"
    ], 
    "earthquake...": [
        ":"
    ], 
    "greener": [
        "JJR"
    ], 
    "underbelly": [
        "NN"
    ], 
    "sorbed": [
        "VBN"
    ], 
    "orderings": [
        "NNS"
    ], 
    "Yacos": [
        "NNP"
    ], 
    "Japanese-based": [
        "JJ"
    ], 
    "microbes": [
        "NNS"
    ], 
    "Rosty": [
        "NNP"
    ], 
    "Frank": [
        "NNP", 
        "NNPS"
    ], 
    "firecracker": [
        "NN"
    ], 
    "Witter": [
        "NNP"
    ], 
    "Frans": [
        "NNP"
    ], 
    "Ogisu": [
        "NNP"
    ], 
    "Witten": [
        "NNP"
    ], 
    "Drexel-underwritten": [
        "JJ"
    ], 
    "Franz": [
        "NNP"
    ], 
    "Aviation": [
        "NNP", 
        "NN"
    ], 
    "LEADER": [
        "NN"
    ], 
    "Hells": [
        "NNP"
    ], 
    "Sculley": [
        "NNP"
    ], 
    "Liaisons": [
        "NNS"
    ], 
    "electronics-instruments": [
        "JJ"
    ], 
    "less-aggressive": [
        "JJ"
    ], 
    "respite": [
        "NN"
    ], 
    "Reeder": [
        "NNP"
    ], 
    "Hello": [
        "UH"
    ], 
    "browny": [
        "JJ"
    ], 
    "disjointed": [
        "VBN", 
        "JJ"
    ], 
    "Soft-spoken": [
        "JJ"
    ], 
    "scraggly": [
        "JJ"
    ], 
    "Kassebaum": [
        "NNP"
    ], 
    "Oso": [
        "NNP"
    ], 
    "Winnetka": [
        "NNP"
    ], 
    "telephone-information": [
        "NN"
    ], 
    "mouth": [
        "NN"
    ], 
    "Rican": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "canning": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "Suhey": [
        "NNP"
    ], 
    "well-versed": [
        "JJ"
    ], 
    "seven-figure": [
        "JJ"
    ], 
    "Herslow": [
        "NNP"
    ], 
    "terrorists": [
        "NNS"
    ], 
    "disturbingly": [
        "RB"
    ], 
    "inti": [
        "NN"
    ], 
    "disease-resistance": [
        "JJ"
    ], 
    "bloodspots": [
        "NNS"
    ], 
    "Flights": [
        "NNS"
    ], 
    "controversies": [
        "NNS"
    ], 
    "el-Fna": [
        "NNP"
    ], 
    "controllers": [
        "NNS"
    ], 
    "Corvallis": [
        "NNP"
    ], 
    "Pellicano": [
        "NNP"
    ], 
    "sightseeing": [
        "NN"
    ], 
    "backbend": [
        "NN"
    ], 
    "uncertainties": [
        "NNS"
    ], 
    "discoid": [
        "JJ"
    ], 
    "Dime": [
        "NNP"
    ], 
    "gases": [
        "NNS"
    ], 
    "atheists": [
        "NNS"
    ], 
    "four-jet": [
        "JJ"
    ], 
    "fragmented": [
        "JJ", 
        "VBN"
    ], 
    "Natcher": [
        "NNP"
    ], 
    "Principal": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "market-reform": [
        "JJ"
    ], 
    "Natchez": [
        "NNP"
    ], 
    "junior-year-abroad": [
        "JJ"
    ], 
    "carping": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Boswell": [
        "NNP"
    ], 
    "frozen-embryo": [
        "NN"
    ], 
    "HelmsleySpear": [
        "NNP"
    ], 
    "Resolution": [
        "NNP", 
        "NN"
    ], 
    "intestines": [
        "NNS"
    ], 
    "Spinnaker": [
        "NNP"
    ], 
    "Consolidated": [
        "NNP", 
        "VBN", 
        "JJ"
    ], 
    "testaments": [
        "NNS"
    ], 
    "paired": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "retaliatory": [
        "JJ"
    ], 
    "purges": [
        "VBZ", 
        "NNS"
    ], 
    "Scotchman": [
        "NN"
    ], 
    "Magoun": [
        "NNP"
    ], 
    "Apex": [
        "NNP"
    ], 
    "Goudsmit": [
        "NNP"
    ], 
    "Enthoven": [
        "NNP"
    ], 
    "deadliest": [
        "JJS"
    ], 
    "haunt": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Vauxhall": [
        "NNP"
    ], 
    "bobbed": [
        "VBD"
    ], 
    "Twins": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "nectaries": [
        "NNS"
    ], 
    "self-victimized": [
        "JJ"
    ], 
    "tragi-comic": [
        "JJ"
    ], 
    "unsaturated": [
        "JJ"
    ], 
    "non-Fed": [
        "JJ"
    ], 
    "intrepid": [
        "JJ"
    ], 
    "puzzling": [
        "JJ", 
        "VBG"
    ], 
    "Hollins": [
        "NNP"
    ], 
    "Hazel": [
        "NNP"
    ], 
    "uranium": [
        "NN"
    ], 
    "Noticing": [
        "VBG"
    ], 
    "Last": [
        "JJ", 
        "NNP", 
        "RB", 
        "VB"
    ], 
    "Gephardt": [
        "NNP"
    ], 
    "Senor": [
        "NNP"
    ], 
    "tech": [
        "NN"
    ], 
    "revision": [
        "NN"
    ], 
    "depredations": [
        "NNS"
    ], 
    "myofibrils": [
        "NNS"
    ], 
    "trans-illuminated": [
        "JJ"
    ], 
    "litigants": [
        "NNS"
    ], 
    "Larchmont": [
        "NNP"
    ], 
    "Longwood": [
        "NNP"
    ], 
    "suppression": [
        "NN"
    ], 
    "Ludie": [
        "NNP"
    ], 
    "bibliographies": [
        "NNS"
    ], 
    "bianco": [
        "NN"
    ], 
    "interfaith": [
        "JJ"
    ], 
    "Dort": [
        "NNP"
    ], 
    "Devery": [
        "NNP"
    ], 
    "methodologies": [
        "NNS"
    ], 
    "Pitman-Moore": [
        "NNP"
    ], 
    "time-share": [
        "JJ"
    ], 
    "Sacramento-based": [
        "JJ"
    ], 
    "crease": [
        "NN"
    ], 
    "transient": [
        "JJ"
    ], 
    "Stamford": [
        "NNP"
    ], 
    "F.E.": [
        "NNP"
    ], 
    "rewt": [
        "NN"
    ], 
    "Hodson": [
        "NNP"
    ], 
    "Bolivar": [
        "NNP"
    ], 
    "Doubt": [
        "NN", 
        "VBP"
    ], 
    "hepatitis": [
        "NN", 
        "NNP"
    ], 
    "Aguirre-Sacasa": [
        "NNP"
    ], 
    "conservative": [
        "JJ", 
        "NN"
    ], 
    "two-seater": [
        "JJ"
    ], 
    "Shortridge": [
        "NNP"
    ], 
    "detectives": [
        "NNS"
    ], 
    "amalgamation": [
        "NN"
    ], 
    "unforseen": [
        "JJ", 
        "NN"
    ], 
    "glows": [
        "NNS"
    ], 
    "Bobar": [
        "NNP"
    ], 
    "carelessly": [
        "RB"
    ], 
    "Bince": [
        "NNP"
    ], 
    "Organ": [
        "NN"
    ], 
    "dicker": [
        "VB"
    ], 
    "account": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Ornithological": [
        "NNP"
    ], 
    "Loantech": [
        "NNP"
    ], 
    "minerals": [
        "NNS"
    ], 
    "rediscovery": [
        "NN"
    ], 
    "detested": [
        "VBD", 
        "VBN"
    ], 
    "Intercity": [
        "JJ"
    ], 
    "amanuensis": [
        "NN"
    ], 
    "diorah": [
        "NN"
    ], 
    "Scobee-Frazier": [
        "NNP"
    ], 
    "extraditing": [
        "VBG"
    ], 
    "Negus": [
        "NNP"
    ], 
    "less-than-brilliant": [
        "JJ"
    ], 
    "vouchsafes": [
        "VBZ"
    ], 
    "Bankruptcy": [
        "NNP", 
        "NN"
    ], 
    "stair-step": [
        "JJ"
    ], 
    "Begins": [
        "VBZ"
    ], 
    "Haqvin": [
        "NNP"
    ], 
    "Winchester": [
        "NNP", 
        "NN"
    ], 
    "cannibals": [
        "NNS"
    ], 
    "castle-themed": [
        "JJ"
    ], 
    "progenitors": [
        "NNS"
    ], 
    "Atlantes": [
        "NN"
    ], 
    "Catskills": [
        "NNPS"
    ], 
    "Hollsworth": [
        "NNP"
    ], 
    "dynamics": [
        "NNS"
    ], 
    "tempted": [
        "VBN", 
        "VBD"
    ], 
    "victor": [
        "NN"
    ], 
    "Entrance": [
        "NN"
    ], 
    "lawbreakers": [
        "NNS"
    ], 
    "sweats": [
        "NNS"
    ], 
    "Association": [
        "NNP", 
        "NN"
    ], 
    "alpha-beta-gammas": [
        "NNS"
    ], 
    "waning": [
        "VBG"
    ], 
    "Kathryn": [
        "NNP"
    ], 
    "multimedia": [
        "NNS"
    ], 
    "mough": [
        "NN"
    ], 
    "sweaty": [
        "JJ"
    ], 
    "Blockade": [
        "NN"
    ], 
    "flowing": [
        "VBG", 
        "JJ"
    ], 
    "Handels": [
        "NNP"
    ], 
    "continously": [
        "RB"
    ], 
    "harassing": [
        "VBG"
    ], 
    "druggist": [
        "NN"
    ], 
    "Brasilia": [
        "NNP"
    ], 
    "wishy-washy": [
        "JJ"
    ], 
    "Luciano": [
        "NNP"
    ], 
    "Puppies": [
        "NNS"
    ], 
    "squirming": [
        "VBG"
    ], 
    "garbage-to-energy": [
        "JJ"
    ], 
    "Seddon": [
        "NNP"
    ], 
    "hi-tech": [
        "JJ"
    ], 
    "credits": [
        "NNS", 
        "VBZ"
    ], 
    "Recycling": [
        "NNP", 
        "NN"
    ], 
    "ould": [
        "JJ"
    ], 
    "information-technology": [
        "JJ"
    ], 
    "Alien": [
        "NNP"
    ], 
    "derby": [
        "NN"
    ], 
    "makes": [
        "VBZ", 
        "NNS", 
        "NN"
    ], 
    "maker": [
        "NN"
    ], 
    "hasps": [
        "NNS"
    ], 
    "panicked": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Tito": [
        "NNP"
    ], 
    "Pigeon": [
        "NNP"
    ], 
    "It-wit": [
        "NN"
    ], 
    "NASDA": [
        "NNP"
    ], 
    "Beronio": [
        "NNP"
    ], 
    "nibbling": [
        "VBG", 
        "NN"
    ], 
    "butyl-lithium": [
        "NN"
    ], 
    "McKusick": [
        "NNP"
    ], 
    "desiring": [
        "VBG"
    ], 
    "Solo": [
        "NNP", 
        "JJ"
    ], 
    "Bookman": [
        "NNP"
    ], 
    "property\\/casualty": [
        "NN"
    ], 
    "Presently": [
        "RB"
    ], 
    "HEARS": [
        "VBZ"
    ], 
    "incertain": [
        "JJ"
    ], 
    "Sold": [
        "VBN"
    ], 
    "Sole": [
        "NNP", 
        "NN"
    ], 
    "Lobbyist": [
        "NN"
    ], 
    "Siegel": [
        "NNP", 
        "NN"
    ], 
    "Masami": [
        "NNP"
    ], 
    "Neutral": [
        "NNP", 
        "JJ"
    ], 
    "surrogates": [
        "NNS"
    ], 
    "NATO": [
        "NNP"
    ], 
    "Kauffmann": [
        "NNP"
    ], 
    "Jadwiga": [
        "NNP"
    ], 
    "ex-FDA": [
        "JJ"
    ], 
    "arbitrage``": [
        "``"
    ], 
    "Chatsworth": [
        "NNP"
    ], 
    "EURODOLLARS": [
        "NNS", 
        "NNPS|NNS", 
        "NNPS"
    ], 
    "rich": [
        "JJ", 
        "NNS", 
        "NN"
    ], 
    "stolidly": [
        "RB"
    ], 
    "undeclared": [
        "JJ"
    ], 
    "Laporte": [
        "NNP"
    ], 
    "Hiawatha": [
        "NNP"
    ], 
    "Growing": [
        "VBG"
    ], 
    "Blackfriar": [
        "NNP"
    ], 
    "customer": [
        "NN"
    ], 
    "Madam": [
        "NNP"
    ], 
    "Shurtleff": [
        "NNP"
    ], 
    "integrating": [
        "VBG"
    ], 
    "meatpacker": [
        "NN"
    ], 
    "Fiedler": [
        "NNP"
    ], 
    "trans-lingually": [
        "RB"
    ], 
    "unknowns": [
        "NNS"
    ], 
    "clean-water": [
        "NN"
    ], 
    "reserves": [
        "NNS", 
        "VBZ"
    ], 
    "retell": [
        "VBP"
    ], 
    "Overland": [
        "NNP"
    ], 
    "English-language": [
        "JJ", 
        "NN"
    ], 
    "Lawford": [
        "NNP"
    ], 
    "scatter": [
        "NN", 
        "VB"
    ], 
    "Harnischfeger": [
        "NNP"
    ], 
    "field-service": [
        "JJ"
    ], 
    "murmuring": [
        "VBG"
    ], 
    "plate": [
        "NN"
    ], 
    "copywriter": [
        "NN"
    ], 
    "billboards": [
        "NNS"
    ], 
    "rode": [
        "VBD"
    ], 
    "ascension": [
        "NN"
    ], 
    "Democratic-controlled": [
        "JJ"
    ], 
    "Panmunjom": [
        "NNP"
    ], 
    "bolstered": [
        "VBN", 
        "VBD"
    ], 
    "Rosie": [
        "NNP", 
        "NN"
    ], 
    "cross-eyed": [
        "JJ"
    ], 
    "tightrope": [
        "NN"
    ], 
    "Vesole": [
        "NNP"
    ], 
    "comedy": [
        "NN"
    ], 
    "sucess": [
        "NN"
    ], 
    "clasping": [
        "VBG"
    ], 
    "fine-looking": [
        "JJ"
    ], 
    "SCRAP": [
        "VBP"
    ], 
    "disassociated": [
        "VBD"
    ], 
    "wignapping": [
        "NN"
    ], 
    "Y-region": [
        "NN"
    ], 
    "re-entering": [
        "VBG"
    ], 
    "Glowering": [
        "VBG"
    ], 
    "Forseth": [
        "NNP"
    ], 
    "Spanberg": [
        "NNP"
    ], 
    "Ono": [
        "NNP"
    ], 
    "Ong": [
        "NNP"
    ], 
    "Grosse": [
        "NNP"
    ], 
    "Bleeker": [
        "NNP"
    ], 
    "Laugh": [
        "NNP"
    ], 
    "Maccario": [
        "NNP"
    ], 
    "Nine-month": [
        "JJ"
    ], 
    "Madson": [
        "NNP"
    ], 
    "evolutionary": [
        "JJ"
    ], 
    "thigh": [
        "NN"
    ], 
    "non-church": [
        "JJ"
    ], 
    "volts": [
        "NNS"
    ], 
    "Shigeru": [
        "NNP"
    ], 
    "altogether": [
        "RB"
    ], 
    "Fitzgerald": [
        "NNP"
    ], 
    "Lincoln-Mercury-Merkur": [
        "NNP"
    ], 
    "summer-holiday": [
        "JJ"
    ], 
    "Mikie": [
        "NNP"
    ], 
    "long-lived": [
        "JJ"
    ], 
    "Reconsider": [
        "VB"
    ], 
    "Emergency": [
        "NNP", 
        "NN"
    ], 
    "cut-rate": [
        "JJ"
    ], 
    "BRIDGEPORT": [
        "NNP"
    ], 
    "high-price": [
        "JJ"
    ], 
    "accompaniments": [
        "NNS"
    ], 
    "barrel-wide": [
        "JJ"
    ], 
    "derivative": [
        "JJ", 
        "NN"
    ], 
    "Home": [
        "NNP", 
        "NN"
    ], 
    "subparagraph": [
        "NN"
    ], 
    "LYNCH": [
        "NNP"
    ], 
    "physicians": [
        "NNS"
    ], 
    "prosper": [
        "VB"
    ], 
    "Yongjian": [
        "NNP"
    ], 
    "Conviction": [
        "NN"
    ], 
    "Teleprompter": [
        "NNP"
    ], 
    "Fortified": [
        "VBN"
    ], 
    "Morrill": [
        "NNP"
    ], 
    "Register": [
        "NNP"
    ], 
    "creedal": [
        "JJ"
    ], 
    "Long-Term": [
        "NNP", 
        "JJ"
    ], 
    "junior-high": [
        "JJ"
    ], 
    "Extensions": [
        "NNS"
    ], 
    "Sense": [
        "NN", 
        "NNP"
    ], 
    "nose-dived": [
        "VBD", 
        "VBN"
    ], 
    "Creators": [
        "NNS"
    ], 
    "grimaced": [
        "VBD"
    ], 
    "STOCK": [
        "NN", 
        "NNP"
    ], 
    "off-center": [
        "JJ"
    ], 
    "five-party": [
        "JJ"
    ], 
    "far-famed": [
        "JJ"
    ], 
    "concave": [
        "JJ"
    ], 
    "Riely": [
        "NNP"
    ], 
    "Wenceslas": [
        "NNP"
    ], 
    "invertebrates": [
        "NNS"
    ], 
    "Bonanno": [
        "NNP"
    ], 
    "reproducing": [
        "VBG"
    ], 
    "homogeneous": [
        "JJ"
    ], 
    "Landis": [
        "NNP"
    ], 
    "Molloy": [
        "NNP"
    ], 
    "self-image": [
        "NN"
    ], 
    "Dunes": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "gravel-voiced": [
        "JJ"
    ], 
    "Recyclers": [
        "NNPS"
    ], 
    "Anniversary": [
        "NNP", 
        "NN"
    ], 
    "Dropping": [
        "VBG"
    ], 
    "Cheng": [
        "NNP"
    ], 
    "Seiyu": [
        "NNP"
    ], 
    "patch": [
        "NN", 
        "VB"
    ], 
    "witness": [
        "NN", 
        "VB"
    ], 
    "mind-set": [
        "NN"
    ], 
    "Treausry": [
        "NNP"
    ], 
    "Noting": [
        "VBG"
    ], 
    "creditworthy": [
        "NN"
    ], 
    "frowns": [
        "VBZ"
    ], 
    "market-on-close": [
        "JJ"
    ], 
    "DuroTest": [
        "NNP"
    ], 
    "Shortly": [
        "RB"
    ], 
    "unwieldy": [
        "JJ"
    ], 
    "greedy": [
        "JJ"
    ], 
    "Monopolies": [
        "NNPS", 
        "NNP"
    ], 
    "convolutions": [
        "NNS"
    ], 
    "ServantCor": [
        "NNP", 
        "NN"
    ], 
    "Hammersla": [
        "NNP"
    ], 
    "Ecco": [
        "NNP"
    ], 
    "Oros": [
        "NNP"
    ], 
    "Angola": [
        "NNP"
    ], 
    "Juliano": [
        "NNP"
    ], 
    "U-I": [
        "NNP"
    ], 
    "Zayre": [
        "NNP"
    ], 
    "countrey": [
        "NN"
    ], 
    "Plenary": [
        "NNP"
    ], 
    "underinvestigated": [
        "JJ"
    ], 
    "troughed": [
        "VBD"
    ], 
    "BOSSES": [
        "NNP"
    ], 
    "Calvert": [
        "NNP"
    ], 
    "receding": [
        "VBG"
    ], 
    "gamekeeper": [
        "NN"
    ], 
    "upper-class": [
        "JJ"
    ], 
    "imprecates": [
        "VBZ"
    ], 
    "jurists": [
        "NNS"
    ], 
    "REINSURERS": [
        "NNS"
    ], 
    "Refco": [
        "NNP"
    ], 
    "landlord-tenant": [
        "JJ"
    ], 
    "Kubek": [
        "NNP"
    ], 
    "Connecting": [
        "NNP"
    ], 
    "Backstairs": [
        "NNS"
    ], 
    "WORKS": [
        "NNP"
    ], 
    "vetoed": [
        "VBD", 
        "VBN"
    ], 
    "Dunston": [
        "NNP"
    ], 
    "erstwhile": [
        "JJ"
    ], 
    "foul-ups": [
        "NNS"
    ], 
    "Pinter": [
        "NNP"
    ], 
    "onslaughts": [
        "NNS"
    ], 
    "lumen": [
        "NN"
    ], 
    "garden-shrub": [
        "NN"
    ], 
    "Kikkoman": [
        "NNP"
    ], 
    "interests": [
        "NNS", 
        "VBZ"
    ], 
    "enforcement": [
        "NN"
    ], 
    "Boardman": [
        "NNP"
    ], 
    "quarry": [
        "NN"
    ], 
    "Dill": [
        "NNP"
    ], 
    "Roosevelt": [
        "NNP"
    ], 
    "Calcium": [
        "NN"
    ], 
    "Xenia": [
        "NNP"
    ], 
    "Copperman": [
        "NNP"
    ], 
    "incongruities": [
        "NNS"
    ], 
    "Heckman": [
        "NNP"
    ], 
    "commandant": [
        "NN"
    ], 
    "Existing": [
        "VBG", 
        "JJ"
    ], 
    "non-research": [
        "JJ"
    ], 
    "orchestrated": [
        "VBD", 
        "VBN"
    ], 
    "Ashton-Tate": [
        "NNP"
    ], 
    "gays": [
        "NNS"
    ], 
    "Doswell": [
        "NNP"
    ], 
    "Tennesse": [
        "NNP"
    ], 
    "Negotiable": [
        "JJ"
    ], 
    "Oldenburg": [
        "NNP"
    ], 
    "false": [
        "JJ", 
        "RB"
    ], 
    "shrinks": [
        "VBZ"
    ], 
    "chivalrous": [
        "JJ"
    ], 
    "Fenimore": [
        "NNP"
    ], 
    "cost-reduction": [
        "JJ", 
        "NN"
    ], 
    "tonight": [
        "RB", 
        "NN"
    ], 
    "Secret": [
        "NNP", 
        "JJ"
    ], 
    "Ledge": [
        "NN", 
        "NNP"
    ], 
    "wave-setting": [
        "JJ"
    ], 
    "mustachioed": [
        "JJ"
    ], 
    "depict": [
        "VB", 
        "VBP"
    ], 
    "Mulloy": [
        "NNP"
    ], 
    "how-to": [
        "JJ"
    ], 
    "Fukuyama": [
        "NNP"
    ], 
    "cloakrooms": [
        "NNS"
    ], 
    "DEFENSE": [
        "NN"
    ], 
    "teetered": [
        "VBD"
    ], 
    "Invisible": [
        "NNP"
    ], 
    "Lansbury": [
        "NNP"
    ], 
    "tall-masted": [
        "JJ"
    ], 
    "Sysco": [
        "NNP"
    ], 
    "manor": [
        "NN"
    ], 
    "Brown-tobacco": [
        "JJ"
    ], 
    "Fizkultura": [
        "NNP"
    ], 
    "hoof-and-mouth": [
        "JJ"
    ], 
    "cipher": [
        "VB"
    ], 
    "Mode": [
        "NNP"
    ], 
    "jimmied": [
        "VBD"
    ], 
    "oil-slicked": [
        "JJ"
    ], 
    "Wheatena": [
        "NNP"
    ], 
    "so-called": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "placement": [
        "NN"
    ], 
    "Barasch": [
        "NNP"
    ], 
    "Soderblom": [
        "NNP"
    ], 
    "bred": [
        "VBN", 
        "VBD"
    ], 
    "Adaptaplex": [
        "NNP"
    ], 
    "Belisle": [
        "NNP"
    ], 
    "lots": [
        "NNS"
    ], 
    "consorting": [
        "VBG"
    ], 
    "O*/NNP&Y": [
        "NN"
    ], 
    "brew": [
        "NN", 
        "VB"
    ], 
    "back...": [
        ":"
    ], 
    "Unstained": [
        "JJ"
    ], 
    "Hasenauer": [
        "NNP"
    ], 
    "Brandes": [
        "NNP"
    ], 
    "Reliance": [
        "NNP", 
        "NN"
    ], 
    "free-traders": [
        "NNS"
    ], 
    "Brandel": [
        "NNP"
    ], 
    "rubric": [
        "NN"
    ], 
    "bean-counting": [
        "NN"
    ], 
    "replaster": [
        "VB"
    ], 
    "taps": [
        "NNS", 
        "VBZ"
    ], 
    "trying": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Betsey": [
        "NNP"
    ], 
    "quickened": [
        "VBD", 
        "VBN"
    ], 
    "Curzon": [
        "NNP"
    ], 
    "entities": [
        "NNS"
    ], 
    "irk": [
        "VB"
    ], 
    "tape": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "reggae-and-rock": [
        "JJ"
    ], 
    "riding": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Storekeepers": [
        "NNS"
    ], 
    "preliminaries": [
        "NNS"
    ], 
    "Schlieren": [
        "NNP"
    ], 
    "undivided": [
        "JJ"
    ], 
    "Hooked": [
        "VBD"
    ], 
    "Tasso": [
        "NNP"
    ], 
    "I.R.S": [
        "NNP"
    ], 
    "unbundle": [
        "VB"
    ], 
    "EnClean": [
        "NNP"
    ], 
    "Keen": [
        "NNP"
    ], 
    "molasses": [
        "NN"
    ], 
    "sinus": [
        "NN"
    ], 
    "wring": [
        "VB"
    ], 
    "strollers": [
        "NNS"
    ], 
    "monkish": [
        "JJ"
    ], 
    "Rating": [
        "NNP", 
        "NN"
    ], 
    "five-block": [
        "JJ"
    ], 
    "State-run": [
        "JJ"
    ], 
    "fez-wearing": [
        "JJ"
    ], 
    "comprising": [
        "VBG"
    ], 
    "taxes": [
        "NNS", 
        "VBZ"
    ], 
    "low-value": [
        "JJ"
    ], 
    "stuff": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "cabaret-like": [
        "JJ"
    ], 
    "taxed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Landesrentenbank": [
        "NNP"
    ], 
    "Brent": [
        "NNP"
    ], 
    "guessing": [
        "VBG", 
        "NN"
    ], 
    "deathward": [
        "RB"
    ], 
    "pronoun": [
        "NN"
    ], 
    "frame": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "AmeriGas": [
        "NNP"
    ], 
    "Joachim": [
        "NNP"
    ], 
    "Fe": [
        "NNP"
    ], 
    "elusiveness": [
        "NN"
    ], 
    "knee-type": [
        "JJ"
    ], 
    "Hooker": [
        "NNP"
    ], 
    "Linden": [
        "NNP"
    ], 
    "dungeon": [
        "NN"
    ], 
    "Nagayama": [
        "NNP"
    ], 
    "destiny": [
        "NN"
    ], 
    "Yanks": [
        "NNS", 
        "NNP"
    ], 
    "Issam": [
        "NNP"
    ], 
    "nuclear": [
        "JJ"
    ], 
    "Hindoo": [
        "NNP"
    ], 
    "Issak": [
        "NNP"
    ], 
    "roiled": [
        "VBN"
    ], 
    "STUBBED": [
        "VBN"
    ], 
    "membrane": [
        "NN"
    ], 
    "onward-driving": [
        "JJ"
    ], 
    "Linder": [
        "NNP"
    ], 
    "incumbent-protection": [
        "JJ"
    ], 
    "post-bankruptcy": [
        "JJ"
    ], 
    "Succasunna": [
        "NNP"
    ], 
    "Courbet": [
        "NNP"
    ], 
    "INQUIRY": [
        "NN"
    ], 
    "hot-selling": [
        "JJ"
    ], 
    "Clairson": [
        "NNP"
    ], 
    "staring": [
        "VBG"
    ], 
    "handstands": [
        "NNS"
    ], 
    "challengers": [
        "NNS"
    ], 
    "marts": [
        "NNS"
    ], 
    "Circus": [
        "NNP"
    ], 
    "Leontief": [
        "NNP"
    ], 
    "Zurich-based": [
        "JJ"
    ], 
    "Ione": [
        "NNP"
    ], 
    "award-winning": [
        "JJ"
    ], 
    "Musmanno": [
        "NNP"
    ], 
    "exalting": [
        "VBG"
    ], 
    "low-altitude": [
        "NN"
    ], 
    "near-term": [
        "JJ", 
        "NN"
    ], 
    "Ledger": [
        "NNP", 
        "NN"
    ], 
    "indict": [
        "VB"
    ], 
    "stylistically": [
        "RB"
    ], 
    "scapulars": [
        "NNS"
    ], 
    "Certificates-a": [
        "NNP", 
        "NNPS"
    ], 
    "Meadows": [
        "NNP"
    ], 
    "mailman": [
        "NN"
    ], 
    "balloonists": [
        "NNS"
    ], 
    "decanting": [
        "VBG"
    ], 
    "open-shelf": [
        "JJ"
    ], 
    "genetic": [
        "JJ"
    ], 
    "willing": [
        "JJ", 
        "VBG"
    ], 
    "entitle": [
        "VB", 
        "VBP"
    ], 
    "Aziz": [
        "NNP"
    ], 
    "feather": [
        "NN", 
        "VB"
    ], 
    "GRiDPad": [
        "NNP", 
        "NN"
    ], 
    "Land-based": [
        "JJ"
    ], 
    "commuter": [
        "NN"
    ], 
    "commutes": [
        "NNS", 
        "VBZ"
    ], 
    "coherence": [
        "NN"
    ], 
    "quasi-performer": [
        "NN"
    ], 
    "commuted": [
        "VBN", 
        "VBD"
    ], 
    "Vicks": [
        "NNP"
    ], 
    "Kupor": [
        "NNP"
    ], 
    "MARKS": [
        "NNS"
    ], 
    "swindling": [
        "VBG"
    ], 
    "Vicky": [
        "NNP"
    ], 
    "banish": [
        "VB"
    ], 
    "countermeasures": [
        "NNS"
    ], 
    "sourly": [
        "RB"
    ], 
    "Widener": [
        "NNP"
    ], 
    "Verbrugge": [
        "NNP"
    ], 
    "Ebersol": [
        "NNP"
    ], 
    "OECD": [
        "NNP"
    ], 
    "Bethlehem": [
        "NNP"
    ], 
    "Mahal-flavor": [
        "NNP"
    ], 
    "Virginians": [
        "NNPS"
    ], 
    "westerly": [
        "JJ", 
        "RB"
    ], 
    "Greek-speaking": [
        "JJ"
    ], 
    "Noces": [
        "NNP", 
        "FW"
    ], 
    "Dalfen": [
        "NNP"
    ], 
    "Yazov": [
        "NNP"
    ], 
    "greater": [
        "JJR", 
        "RBR"
    ], 
    "cohort": [
        "NN"
    ], 
    "ostentatious": [
        "JJ"
    ], 
    "newsroom": [
        "NN"
    ], 
    "descendants": [
        "NNS"
    ], 
    "Judie": [
        "NNP"
    ], 
    "Regular": [
        "NNP", 
        "JJ"
    ], 
    "Stanbury": [
        "NNP"
    ], 
    "chronicling": [
        "VBG"
    ], 
    "unimaginable": [
        "JJ"
    ], 
    "ex-employer": [
        "NN"
    ], 
    "Mandelbaum": [
        "NNP"
    ], 
    "nondescriptly": [
        "RB"
    ], 
    "high-standard": [
        "JJ"
    ], 
    "diplomatically": [
        "RB"
    ], 
    "Decker": [
        "NNP"
    ], 
    "polyesters": [
        "NNS"
    ], 
    "ex-employee": [
        "NN"
    ], 
    "heathenish": [
        "JJ"
    ], 
    "Hanover-Precious": [
        "NNP"
    ], 
    "Dulles": [
        "NNP", 
        "NNS"
    ], 
    "non-fortress-like": [
        "JJ"
    ], 
    "off": [
        "IN", 
        "RB|IN", 
        "JJ", 
        "NN", 
        "RB", 
        "RP"
    ], 
    "EYP": [
        "NNP"
    ], 
    "provocatively": [
        "RB"
    ], 
    "SHIBUMI": [
        "NNP"
    ], 
    "southeastern": [
        "JJ"
    ], 
    "oft": [
        "RB"
    ], 
    "diphtheria": [
        "NN"
    ], 
    "windowless": [
        "JJ"
    ], 
    "Bambi-syndronists": [
        "NNS"
    ], 
    "reefs": [
        "NNS"
    ], 
    "monetarism": [
        "NN"
    ], 
    "newest": [
        "JJS", 
        "JJ"
    ], 
    "Similarly": [
        "RB"
    ], 
    "peer-group": [
        "JJ"
    ], 
    "Lover": [
        "NNP", 
        "NN"
    ], 
    "resuspended": [
        "VBN", 
        "VBD"
    ], 
    "Siegman": [
        "NNP"
    ], 
    "Joyo": [
        "NNP"
    ], 
    "Camdessus": [
        "NNP"
    ], 
    "monetarist": [
        "NN", 
        "JJ"
    ], 
    "Ramcharger": [
        "NNP"
    ], 
    "granulocytic": [
        "JJ"
    ], 
    "W.D.": [
        "NNP"
    ], 
    "Schering": [
        "NNP"
    ], 
    "too-expensive": [
        "JJ"
    ], 
    "moralities": [
        "NNS"
    ], 
    "hot-rolled": [
        "JJ"
    ], 
    "neoliberal": [
        "JJ"
    ], 
    "Countrywide": [
        "NNP"
    ], 
    "crack": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "Unfurling": [
        "VBG"
    ], 
    "one-percentage-point": [
        "JJ"
    ], 
    "Lebo": [
        "NNP"
    ], 
    "Qualitative": [
        "JJ"
    ], 
    "stooped": [
        "VBD"
    ], 
    "falters": [
        "VBZ"
    ], 
    "crux": [
        "NN"
    ], 
    "Ghent": [
        "NNP"
    ], 
    "Photofrin": [
        "NN"
    ], 
    "crus": [
        "NN"
    ], 
    "RESOURCES": [
        "NNP"
    ], 
    "debatable": [
        "JJ"
    ], 
    "Virdon": [
        "NNP"
    ], 
    "bulge": [
        "NN", 
        "VB"
    ], 
    "Insta-Care": [
        "NNP"
    ], 
    "sharp-jawed": [
        "JJ"
    ], 
    "Gino": [
        "NNP"
    ], 
    "Agents": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Hondurans": [
        "NNS"
    ], 
    "become": [
        "VB", 
        "VBD", 
        "VBN", 
        "VBP"
    ], 
    "Earthbeat": [
        "NNP"
    ], 
    "Lauritsen": [
        "NNP"
    ], 
    "Purves": [
        "NNP"
    ], 
    "Newburgh": [
        "NNP"
    ], 
    "Kidder": [
        "NNP", 
        "JJR"
    ], 
    "stress-producing": [
        "JJ"
    ], 
    "Rykoff-Sexton": [
        "NNP"
    ], 
    "Food-price": [
        "JJ"
    ], 
    "castorbeans": [
        "NNS"
    ], 
    "hissing": [
        "NN", 
        "VBG"
    ], 
    "Feldstein": [
        "NNP"
    ], 
    "Belvidere": [
        "NNP"
    ], 
    "recognition": [
        "NN"
    ], 
    "Warrior": [
        "NNP"
    ], 
    "cutting-tools": [
        "NNS"
    ], 
    "passion": [
        "NN"
    ], 
    "saucepan": [
        "NN"
    ], 
    "five-by-eight-inch": [
        "JJ"
    ], 
    "Fruehauf": [
        "NNP"
    ], 
    "sidestreet": [
        "NN"
    ], 
    "biology": [
        "NN"
    ], 
    "Kikuyu": [
        "NNP"
    ], 
    "Komurasaki": [
        "NNP"
    ], 
    "Telefonos": [
        "NNP", 
        "NNPS"
    ], 
    "Jaggers": [
        "NNP"
    ], 
    "last-resort": [
        "JJ"
    ], 
    "Utopia": [
        "NNP", 
        "NN"
    ], 
    "torched": [
        "VBD", 
        "VBN"
    ], 
    "tubing": [
        "NN", 
        ","
    ], 
    "posterity": [
        "NN"
    ], 
    "imaginary": [
        "JJ", 
        "NN"
    ], 
    "milquetoast": [
        "NN"
    ], 
    "Judgments": [
        "NNS"
    ], 
    "debentures": [
        "NNS"
    ], 
    "grayer": [
        "JJR"
    ], 
    "SalFininistas": [
        "NNP"
    ], 
    "Cos": [
        "NNP", 
        "NNPS"
    ], 
    "Replace": [
        "VB"
    ], 
    "Glassell": [
        "NNP"
    ], 
    "moss-covered": [
        "JJ"
    ], 
    "blackness": [
        "NN"
    ], 
    "curative": [
        "JJ"
    ], 
    "mucilage": [
        "NN"
    ], 
    "grayed": [
        "JJ"
    ], 
    "swimming": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "cultivates": [
        "VBZ"
    ], 
    "high-priced": [
        "JJ"
    ], 
    "letters": [
        "NNS"
    ], 
    "Somewhere": [
        "RB", 
        "NNP", 
        "NN"
    ], 
    "Propulsion": [
        "NNP"
    ], 
    "Caesars": [
        "NNP", 
        "NNPS"
    ], 
    "sharpness": [
        "NN"
    ], 
    "Ravel-like": [
        "JJ"
    ], 
    "Schmalzried": [
        "NNP"
    ], 
    "unstanched": [
        "VBN"
    ], 
    "cultivated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "HOLIDAY": [
        "NNP", 
        "NN"
    ], 
    "bothers": [
        "VBZ"
    ], 
    "glistened": [
        "VBD"
    ], 
    "brownies": [
        "NNS"
    ], 
    "zenith": [
        "NN"
    ], 
    "Corton-Charlemagne": [
        "NNP"
    ], 
    "nonfarm": [
        "JJ"
    ], 
    "splintered": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "pairing": [
        "NN", 
        "VBG"
    ], 
    "faster-growing": [
        "JJR"
    ], 
    "providential": [
        "JJ"
    ], 
    "solid-muscle": [
        "JJ"
    ], 
    "terminates": [
        "VBZ"
    ], 
    "Billings": [
        "NNS", 
        "NNP"
    ], 
    "sommelier": [
        "FW"
    ], 
    "Majdan-Tartarski": [
        "NNP"
    ], 
    "Exact": [
        "JJ"
    ], 
    "Wimpys": [
        "NNP"
    ], 
    "public-housing": [
        "JJ", 
        "NN"
    ], 
    "Sanitation": [
        "NNP", 
        "NN"
    ], 
    "airline-hostess": [
        "NN"
    ], 
    "Kloman": [
        "NNP"
    ], 
    "Lo-Jack": [
        "NNP"
    ], 
    "cancer-gene": [
        "JJ"
    ], 
    "FormBase": [
        "NNP"
    ], 
    "Bohn": [
        "NNP"
    ], 
    "Lifson": [
        "NNP"
    ], 
    "Healthcare": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Milstar": [
        "NNP"
    ], 
    "Nu-West": [
        "NNP"
    ], 
    "Guber\\/Peters": [
        "NNP"
    ], 
    "fragmentation": [
        "NN"
    ], 
    "tossed": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "evident": [
        "JJ"
    ], 
    "shrunk": [
        "VBN"
    ], 
    "Terrizzi": [
        "NNP"
    ], 
    "wheellike": [
        "JJ"
    ], 
    "excitement": [
        "NN"
    ], 
    "tosses": [
        "NNS"
    ], 
    "office-supply": [
        "JJ"
    ], 
    "problem": [
        "NN"
    ], 
    "man-to-man": [
        "RB"
    ], 
    "Vowel-Length": [
        "NN"
    ], 
    "Bumkins": [
        "NNP"
    ], 
    "Cementos": [
        "NNP", 
        "NNS"
    ], 
    "Argonne": [
        "NNP"
    ], 
    "obese": [
        "JJ"
    ], 
    "Nath": [
        "NNP"
    ], 
    "Alleghany": [
        "NNP"
    ], 
    "fine-featured": [
        "JJ"
    ], 
    "Nate": [
        "NNP"
    ], 
    "smoothed-muscled": [
        "JJ"
    ], 
    "nonetheless": [
        "RB"
    ], 
    "tubular": [
        "JJ"
    ], 
    "Somers": [
        "NNP"
    ], 
    "leafmold": [
        "NN"
    ], 
    "decisional": [
        "JJ"
    ], 
    "Khare": [
        "NNP"
    ], 
    "details": [
        "NNS", 
        "VBZ"
    ], 
    "D.W.": [
        "NNP"
    ], 
    "gene-replication": [
        "NN"
    ], 
    "Corp.": [
        "NNP", 
        "NN"
    ], 
    "rebelled": [
        "VBD", 
        "VBN"
    ], 
    "Accord": [
        "NNP"
    ], 
    "Trickster": [
        "NNP"
    ], 
    "Matais": [
        "NNP"
    ], 
    "Peery": [
        "NNP"
    ], 
    "Druse": [
        "JJ"
    ], 
    "outlets": [
        "NNS"
    ], 
    "treelike": [
        "JJ"
    ], 
    "ULI": [
        "NNP"
    ], 
    "Monterrey-based": [
        "JJ"
    ], 
    "Delwin": [
        "NNP"
    ], 
    "Praise": [
        "NN"
    ], 
    "Michaels": [
        "NNP", 
        "NNS"
    ], 
    "exposure": [
        "NN"
    ], 
    "export-driven": [
        "JJ"
    ], 
    "Octoroon": [
        "NNP"
    ], 
    "Corps": [
        "NNP", 
        "NNPS", 
        "NN"
    ], 
    "caricaturist": [
        "NN"
    ], 
    "compete": [
        "VB", 
        "VBP"
    ], 
    "villainous": [
        "JJ"
    ], 
    "Rhu-beb-ni-ice": [
        "NN"
    ], 
    "Philly": [
        "RB"
    ], 
    "Infotab": [
        "NNP"
    ], 
    "non-Alternative": [
        "NNP"
    ], 
    "near-strangers": [
        "NNS"
    ], 
    "clamoring": [
        "VBG"
    ], 
    "yield-maintenance": [
        "NN"
    ], 
    "Agile": [
        "FW", 
        "JJ"
    ], 
    "magnetic": [
        "JJ"
    ], 
    "Kensington": [
        "NNP"
    ], 
    "Interlude": [
        "NNP"
    ], 
    "Roche": [
        "NNP"
    ], 
    "Rocha": [
        "NNP"
    ], 
    "tenuous": [
        "JJ"
    ], 
    "Partecipazioni": [
        "NNP"
    ], 
    "integrity": [
        "NN"
    ], 
    "stinks": [
        "VBZ"
    ], 
    "cm.": [
        "NN"
    ], 
    "Brainard": [
        "NNP"
    ], 
    "self-consuming": [
        "JJ"
    ], 
    "Assemblyman": [
        "NNP"
    ], 
    "periodicals": [
        "NNS"
    ], 
    "Immediate": [
        "NNP", 
        "JJ"
    ], 
    "propellants": [
        "NNS"
    ], 
    "neighbours": [
        "NNS"
    ], 
    "Propylene": [
        "NN"
    ], 
    "Greenshields": [
        "NNP"
    ], 
    "over-the-road": [
        "JJ"
    ], 
    "worth": [
        "JJ", 
        "IN", 
        "NN", 
        "RB", 
        "VBN", 
        "VBP"
    ], 
    "alternating": [
        "VBG"
    ], 
    "Aaawww": [
        "UH"
    ], 
    "stud": [
        "NN"
    ], 
    "Ametek": [
        "NNP"
    ], 
    "perishable": [
        "JJ"
    ], 
    "Mancini": [
        "NNP"
    ], 
    "Shaughnessy": [
        "NNP"
    ], 
    "Pipe": [
        "NNP"
    ], 
    "replication": [
        "NN"
    ], 
    "summarized": [
        "VBN", 
        "VBD"
    ], 
    "pre-employment": [
        "JJ", 
        "NN"
    ], 
    "Hands-off": [
        "JJ"
    ], 
    "white-collar-defense": [
        "JJ"
    ], 
    "five-ply": [
        "JJ"
    ], 
    "blanche": [
        "JJ", 
        "NN"
    ], 
    "by-election": [
        "NN", 
        "JJ"
    ], 
    "progression": [
        "NN"
    ], 
    "daydream": [
        "NN"
    ], 
    "Subsidies": [
        "NNS"
    ], 
    "debunked": [
        "VBN"
    ], 
    "samurai": [
        "FW", 
        "NN"
    ], 
    "underground-storage": [
        "NN"
    ], 
    "vegetable-protein": [
        "NN"
    ], 
    "superlunary": [
        "JJ"
    ], 
    "Zagaria": [
        "NNP"
    ], 
    "Conning": [
        "NNP"
    ], 
    "weapons-plant": [
        "JJ"
    ], 
    "professionally": [
        "RB"
    ], 
    "Boats": [
        "NNS", 
        "NNP"
    ], 
    "Thema": [
        "NNP"
    ], 
    "Troubled": [
        "JJ", 
        "VBN", 
        "NNP"
    ], 
    "shatteringly": [
        "RB"
    ], 
    "Capra": [
        "NNP"
    ], 
    "machines": [
        "NNS"
    ], 
    "Salle": [
        "NNP"
    ], 
    "auto-market": [
        "NN"
    ], 
    "filtration": [
        "NN"
    ], 
    "food-service": [
        "NN", 
        "JJ"
    ], 
    "Fireman": [
        "NNP", 
        "NN"
    ], 
    "time-tested": [
        "JJ"
    ], 
    "Grandis": [
        "NNP"
    ], 
    "offshoots": [
        "NNS"
    ], 
    "Whirling": [
        "JJ"
    ], 
    "Mazda": [
        "NNP"
    ], 
    "market-place": [
        "NN"
    ], 
    "baptistery": [
        "NN"
    ], 
    "Sedan": [
        "NNP"
    ], 
    "Olatunji": [
        "NNP"
    ], 
    "Nietzsche": [
        "NNP"
    ], 
    "Photograph": [
        "NN", 
        "NNP"
    ], 
    "No-o-o": [
        "UH"
    ], 
    "viewings": [
        "NNS"
    ], 
    "Caradon": [
        "NNP"
    ], 
    "PARIS": [
        "NNP"
    ], 
    "sub-therapeutic": [
        "JJ"
    ], 
    "Linville": [
        "NNP"
    ], 
    "equals": [
        "VBZ", 
        "NNS"
    ], 
    "remarried": [
        "VBD", 
        "VBN"
    ], 
    "Cadre": [
        "NNP"
    ], 
    "Algonquin": [
        "NNP"
    ], 
    "Taisei": [
        "NNP"
    ], 
    "non-Mexican": [
        "JJ"
    ], 
    "Marshal": [
        "NNP"
    ], 
    "stresses": [
        "NNS", 
        "VBZ"
    ], 
    "bilevel": [
        "JJ"
    ], 
    "Duero": [
        "NNP"
    ], 
    "fireballs": [
        "NNS"
    ], 
    "catch-up": [
        "NN", 
        "JJ"
    ], 
    "Barabba": [
        "NNP"
    ], 
    "Riefling": [
        "NNP"
    ], 
    "stressed": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "sequestering": [
        "NN"
    ], 
    "otters": [
        "NNS"
    ], 
    "Absolute": [
        "JJ"
    ], 
    "Brownell": [
        "NNP"
    ], 
    "Economdis": [
        "NNP"
    ], 
    "water-purification": [
        "NN"
    ], 
    "inequitable": [
        "JJ"
    ], 
    "plenum": [
        "NN"
    ], 
    "Raymonda": [
        "NNP"
    ], 
    "inequitably": [
        "RB"
    ], 
    "building-supplies": [
        "NNS"
    ], 
    "Satan": [
        "NNP", 
        "NN"
    ], 
    "compulsively": [
        "RB"
    ], 
    "HOLLYWOOD": [
        "NNP"
    ], 
    "bra": [
        "NN"
    ], 
    "Cestre": [
        "NNP"
    ], 
    "devastation": [
        "NN"
    ], 
    "Shootin": [
        "VBG"
    ], 
    "Bellini": [
        "NNP", 
        "NNS"
    ], 
    "fulfull": [
        "VB"
    ], 
    "sweater": [
        "NN"
    ], 
    "W.I.L.D": [
        "NNP"
    ], 
    "unrehearsed": [
        "JJ"
    ], 
    "Poughkeepsie": [
        "NNP"
    ], 
    "spearhead": [
        "VB", 
        "NN"
    ], 
    "administering": [
        "VBG"
    ], 
    "sweated": [
        "VBD", 
        "VBN"
    ], 
    "exacts": [
        "VBZ"
    ], 
    "Competes": [
        "VBZ"
    ], 
    "chlorpromazine": [
        "NN"
    ], 
    "Consort": [
        "NNP"
    ], 
    "Skye": [
        "NNP"
    ], 
    "Extracts": [
        "NNS"
    ], 
    "simperers": [
        "NNS"
    ], 
    "ascribe": [
        "VBP", 
        "VB"
    ], 
    "two-drug": [
        "JJ"
    ], 
    "regrouping": [
        "NN", 
        "VBG"
    ], 
    "championships": [
        "NNS"
    ], 
    "profits-optimism": [
        "JJ"
    ], 
    "overstretch": [
        "VB"
    ], 
    "Thurmond": [
        "NNP"
    ], 
    "Count-Duke": [
        "NNP"
    ], 
    "Ormoc": [
        "NNP"
    ], 
    "Normally": [
        "RB", 
        "NNP"
    ], 
    "Svevo": [
        "NNP"
    ], 
    "divorced": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "divorcee": [
        "NN"
    ], 
    "Steele": [
        "NNP"
    ], 
    "honeymooners": [
        "NNS"
    ], 
    "cuddly": [
        "JJ"
    ], 
    "divorces": [
        "NNS"
    ], 
    "era": [
        "NN"
    ], 
    "containment": [
        "NN"
    ], 
    "elbow": [
        "NN"
    ], 
    "Steels": [
        "NNP", 
        "NNS"
    ], 
    "maget": [
        "NN"
    ], 
    "Abe": [
        "NNP"
    ], 
    "quivering": [
        "VBG"
    ], 
    "relativistic": [
        "JJ"
    ], 
    "DiLorenzo": [
        "NNP"
    ], 
    "Abt": [
        "NNP"
    ], 
    "Abu": [
        "NNP"
    ], 
    "Schenley": [
        "NNP"
    ], 
    "RTC-owned": [
        "JJ"
    ], 
    "totaled": [
        "VBD", 
        "VBN", 
        "VBP"
    ], 
    "Caniglia": [
        "NNP"
    ], 
    "impassive": [
        "JJ"
    ], 
    "confidential": [
        "JJ"
    ], 
    "Seafirst": [
        "NNP"
    ], 
    "rationed": [
        "VBN"
    ], 
    "nuts": [
        "NNS", 
        "JJ"
    ], 
    "photoelectrons": [
        "NNS"
    ], 
    "corporation-socialist": [
        "JJ"
    ], 
    "Lelogeais": [
        "NNP"
    ], 
    "LATEST": [
        "JJS"
    ], 
    "chines": [
        "NNS"
    ], 
    "Griggs": [
        "NNP"
    ], 
    "Invoking": [
        "VBG"
    ], 
    "Duluth": [
        "NNP"
    ], 
    "misleads": [
        "VBZ"
    ], 
    "Huard": [
        "NNP"
    ], 
    "Farrell": [
        "NNP"
    ], 
    "Anglo-Dutch": [
        "JJ", 
        "NNP"
    ], 
    "purging": [
        "VBG", 
        "NN"
    ], 
    "pre-1986": [
        "JJ"
    ], 
    "CALL": [
        "NN", 
        "JJ", 
        "VB", 
        "NNP", 
        "NN|JJ"
    ], 
    "Mandom": [
        "NNP"
    ], 
    "well-born": [
        "JJ"
    ], 
    "crystallographic": [
        "JJ"
    ], 
    "Colucci": [
        "NNP"
    ], 
    "greasies": [
        "NNS"
    ], 
    "Brasiliaaircraft": [
        "NNP"
    ], 
    "Guest": [
        "NNP", 
        "NN"
    ], 
    "gumption": [
        "NN"
    ], 
    "slimmed": [
        "VBN"
    ], 
    "undetected": [
        "JJ"
    ], 
    "ancients": [
        "NNS"
    ], 
    "slimmer": [
        "JJR", 
        "RB"
    ], 
    "coiling": [
        "VBG"
    ], 
    "counter-drill": [
        "VB"
    ], 
    "understates": [
        "VBZ"
    ], 
    "pension-plan": [
        "NN"
    ], 
    "defrauded": [
        "VBD", 
        "VBN"
    ], 
    "production": [
        "NN"
    ], 
    "understated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "single-A-1-plus": [
        "NNP"
    ], 
    "fumigants": [
        "NNS"
    ], 
    "Cherwell": [
        "NNP"
    ], 
    "typescript": [
        "NN"
    ], 
    "Ditto": [
        "NN"
    ], 
    "underperform": [
        "VB", 
        "JJ"
    ], 
    "Oman": [
        "NNP"
    ], 
    "Keepers": [
        "NNS"
    ], 
    "Motion": [
        "NNP", 
        "NN"
    ], 
    "Omar": [
        "NNP"
    ], 
    "Arraignment": [
        "NN"
    ], 
    "Hamburger": [
        "NN", 
        "NNP"
    ], 
    "sizenine": [
        "JJ"
    ], 
    "Cross-Purposes": [
        "NNPS"
    ], 
    "Reno-Lake": [
        "NNP|NP"
    ], 
    "principals": [
        "NNS"
    ], 
    "Schoenberg": [
        "NNP"
    ], 
    "reasonably": [
        "RB"
    ], 
    "routines": [
        "NNS"
    ], 
    "reasonable": [
        "JJ"
    ], 
    "Broadcasters": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "varmint": [
        "NN"
    ], 
    "Volatile": [
        "JJ"
    ], 
    "feeds": [
        "VBZ", 
        "NNS"
    ], 
    "Turin-based": [
        "JJ"
    ], 
    "volcanos": [
        "NNS"
    ], 
    "unfocused": [
        "JJ"
    ], 
    "dumping": [
        "VBG", 
        "NN"
    ], 
    "emeralds": [
        "NNS"
    ], 
    "apotheosis": [
        "NN"
    ], 
    "clay-mining": [
        "NN"
    ], 
    "Type": [
        "NN", 
        "NNP"
    ], 
    "Brunswig": [
        "NNP"
    ], 
    "chauvinistic": [
        "JJ"
    ], 
    "Aubrey": [
        "NNP", 
        "NN"
    ], 
    "Gumucio": [
        "NNP"
    ], 
    "trainers": [
        "NNS"
    ], 
    "ruggedly": [
        "RB"
    ], 
    "out-of-sight": [
        "JJ"
    ], 
    "drawn-out": [
        "JJ"
    ], 
    "self-important": [
        "JJ"
    ], 
    "disputed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "barrier": [
        "NN"
    ], 
    "bellhops": [
        "NNS"
    ], 
    "Ubberroth": [
        "NNP"
    ], 
    "certifies": [
        "VBZ"
    ], 
    "death-sentence": [
        "NN"
    ], 
    "funn-eeee": [
        "JJ"
    ], 
    "disputes": [
        "NNS", 
        "VBZ"
    ], 
    "fastening": [
        "NN"
    ], 
    "enlightened": [
        "JJ", 
        "VBN"
    ], 
    "lollipop": [
        "NN"
    ], 
    "certified": [
        "VBN", 
        "JJ"
    ], 
    "scabs": [
        "NNS"
    ], 
    "chortled": [
        "VBD", 
        "VBN"
    ], 
    "baseman": [
        "NN"
    ], 
    "Ugh": [
        "UH"
    ], 
    "Parade": [
        "NNP"
    ], 
    "maniac": [
        "NN"
    ], 
    "shortner": [
        "NN"
    ], 
    "practitioner": [
        "NN"
    ], 
    "One-third": [
        "NN"
    ], 
    "AFFLUENT": [
        "JJ"
    ], 
    "flawless": [
        "JJ"
    ], 
    "sprig": [
        "NN"
    ], 
    "Pernod": [
        "NN"
    ], 
    "chortles": [
        "VBZ"
    ], 
    "manias": [
        "NNS"
    ], 
    "blackout": [
        "NN"
    ], 
    "generalizations": [
        "NNS"
    ], 
    "clouding": [
        "NN"
    ], 
    "JERSEY": [
        "NNP"
    ], 
    "Amendments": [
        "NNPS", 
        "NNS"
    ], 
    "Tracey": [
        "NNP"
    ], 
    "re-enact": [
        "VB"
    ], 
    "railroads": [
        "NNS"
    ], 
    "hamstring": [
        "VB"
    ], 
    "another": [
        "DT", 
        "JJ", 
        "NN"
    ], 
    "Manfred": [
        "NNP", 
        "VBN"
    ], 
    "Vulturidae": [
        "NNS"
    ], 
    "Flavel": [
        "NNP"
    ], 
    "Azoff": [
        "NNP"
    ], 
    "alcoves": [
        "NNS"
    ], 
    "illustrate": [
        "VB", 
        "VBP"
    ], 
    "reconfirming": [
        "VBG"
    ], 
    "public-sector": [
        "NN", 
        "JJ"
    ], 
    "tossers": [
        "NNS"
    ], 
    "U-turn": [
        "NN"
    ], 
    "takeovers": [
        "NNS"
    ], 
    "more-than-ordinary": [
        "JJ"
    ], 
    "sweat-saturated": [
        "JJ"
    ], 
    "Sangamon": [
        "NNP"
    ], 
    "mail-sorting": [
        "VBG"
    ], 
    "dogs": [
        "NNS", 
        "VBZ"
    ], 
    "incitements": [
        "NNS"
    ], 
    "Pike": [
        "NNP"
    ], 
    "Rushdie": [
        "NNP"
    ], 
    "Rare": [
        "JJ"
    ], 
    "over-large": [
        "JJ"
    ], 
    "offhand": [
        "JJ"
    ], 
    "Spaarbank": [
        "NNP"
    ], 
    "Andersson": [
        "NNP"
    ], 
    "enmeshed": [
        "VBN"
    ], 
    "cereal": [
        "NN"
    ], 
    "anti-missile": [
        "JJ", 
        "NN"
    ], 
    "guild": [
        "NN"
    ], 
    "guile": [
        "NN"
    ], 
    "luxuriosly-upholstered": [
        "JJ"
    ], 
    "volume-decliner": [
        "JJ"
    ], 
    "meteorology": [
        "NN"
    ], 
    "step-father": [
        "NN"
    ], 
    "Relation": [
        "NN"
    ], 
    "Lewtas": [
        "NNP"
    ], 
    "Spontex": [
        "NNP"
    ], 
    "Hazzard": [
        "NNP"
    ], 
    "lanzador": [
        "FW"
    ], 
    "microfossils": [
        "NNS"
    ], 
    "AIDS-treatment": [
        "NN"
    ], 
    "Hiltunen": [
        "NNP"
    ], 
    "resettable": [
        "JJ"
    ], 
    "well-meaning": [
        "JJ"
    ], 
    "Lendrum": [
        "NNP"
    ], 
    "Zamislov": [
        "NNP"
    ], 
    "respecting": [
        "VBG"
    ], 
    "Venable": [
        "NNP"
    ], 
    "Lincoln": [
        "NNP", 
        "VBP", 
        "NN"
    ], 
    "i-th": [
        "NN"
    ], 
    "Talbott": [
        "NNP"
    ], 
    "sportsmen": [
        "NNS"
    ], 
    "Kinnear": [
        "NNP"
    ], 
    "admittances": [
        "NNS"
    ], 
    "refreshingly": [
        "RB"
    ], 
    "impelled": [
        "VBN", 
        "VBD"
    ], 
    "DeKalb": [
        "NNP"
    ], 
    "contents": [
        "NNS"
    ], 
    "Q.": [
        "NNP"
    ], 
    "Pravda": [
        "NNP"
    ], 
    "semi-conductors": [
        "NNS"
    ], 
    "field-based": [
        "JJ"
    ], 
    "convenient": [
        "JJ"
    ], 
    "stillness": [
        "NN"
    ], 
    "Confiscated": [
        "VBN|JJ"
    ], 
    "subjects": [
        "NNS", 
        "VBZ"
    ], 
    "quadric": [
        "NN", 
        "JJ"
    ], 
    "thundering": [
        "VBG", 
        "JJ"
    ], 
    "pilgrimage": [
        "NN"
    ], 
    "Phase-3": [
        "NN"
    ], 
    "Phase-2": [
        "NN"
    ], 
    "Emyanitoff": [
        "NNP"
    ], 
    "AMBASSADOR": [
        "NN"
    ], 
    "Flamingo": [
        "NNP"
    ], 
    "Splits": [
        "NNS"
    ], 
    "Button": [
        "NNP"
    ], 
    "Resolving": [
        "NNP", 
        "VBG"
    ], 
    "troughs": [
        "NNS"
    ], 
    "Machine-vision": [
        "JJ"
    ], 
    "weak...": [
        ":"
    ], 
    "ramblings": [
        "NNS"
    ], 
    "immediacy": [
        "NN"
    ], 
    "Yutaka": [
        "NNP"
    ], 
    "return-on-savings": [
        "JJ"
    ], 
    "Atchinson": [
        "NNP"
    ], 
    "blood-pressure": [
        "JJ", 
        "NN"
    ], 
    "nostrils": [
        "NNS"
    ], 
    "witnessed": [
        "VBN", 
        "VBD"
    ], 
    "Shanties": [
        "NNPS"
    ], 
    "enshrined": [
        "VBN"
    ], 
    "QB": [
        "NNP"
    ], 
    "QE": [
        "NNP"
    ], 
    "repudiation": [
        "NN"
    ], 
    "reserve": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "Fultz": [
        "NNP"
    ], 
    "yachters": [
        "NNS"
    ], 
    "Atala": [
        "NNP"
    ], 
    "ESOP": [
        "NNP", 
        "NN"
    ], 
    "Refinements": [
        "NNS"
    ], 
    "foamed-core": [
        "JJ"
    ], 
    "bellow": [
        "NN", 
        "VB"
    ], 
    "value-oriented": [
        "JJ"
    ], 
    "Yocum": [
        "NNP"
    ], 
    "witnesses": [
        "NNS"
    ], 
    "Mapco": [
        "NNP"
    ], 
    "Moselle": [
        "NNP"
    ], 
    "Photography": [
        "NNP"
    ], 
    "mid-flight": [
        "RB"
    ], 
    "fuel-guzzling": [
        "JJ"
    ], 
    "Krueger": [
        "NNP"
    ], 
    "completes": [
        "VBZ"
    ], 
    "industriously": [
        "RB"
    ], 
    "cashews": [
        "NNS"
    ], 
    "facaded": [
        "VBN"
    ], 
    "show-biz": [
        "NN"
    ], 
    "Haitian": [
        "JJ"
    ], 
    "tracers": [
        "NNS"
    ], 
    "Sass": [
        "NNP"
    ], 
    "tin-roofed": [
        "JJ"
    ], 
    "machos": [
        "NNS"
    ], 
    "fluid-filled": [
        "JJ"
    ], 
    "haunted": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "roundabout": [
        "JJ"
    ], 
    "Curie-Weiss": [
        "NNP"
    ], 
    "rolled-up": [
        "JJ"
    ], 
    "conventioneers": [
        "NNS"
    ], 
    "runs": [
        "VBZ", 
        "NNS"
    ], 
    "domesticity": [
        "NN"
    ], 
    "runt": [
        "NN"
    ], 
    "Donoghue": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "SMALL-COMPANY": [
        "JJ"
    ], 
    "Pearce": [
        "NNP"
    ], 
    "gears": [
        "NNS", 
        "VBZ"
    ], 
    "rung": [
        "VBN", 
        "NN"
    ], 
    "Psychical": [
        "JJ"
    ], 
    "insurgents": [
        "NNS"
    ], 
    "freshwater": [
        "JJR"
    ], 
    "Loeser": [
        "NNP"
    ], 
    "Clifford": [
        "NNP"
    ], 
    "smoldered": [
        "VBD", 
        "VBN"
    ], 
    "AEP": [
        "NNP"
    ], 
    "AES": [
        "NNP"
    ], 
    "Jackson": [
        "NNP"
    ], 
    "Caracas": [
        "NNP"
    ], 
    "AEW": [
        "NNP"
    ], 
    "shoe-horn": [
        "VB"
    ], 
    "Shinton": [
        "NNP"
    ], 
    "AEC": [
        "NNP"
    ], 
    "Bleier": [
        "NNP"
    ], 
    "bullhorns": [
        "NNS"
    ], 
    "AEG": [
        "NNP"
    ], 
    "horrendous": [
        "JJ"
    ], 
    "Judeo-Christian": [
        "JJ"
    ], 
    "Meyohas": [
        "NNP"
    ], 
    "pastel": [
        "JJ", 
        "NN"
    ], 
    "draws": [
        "VBZ", 
        "NNS"
    ], 
    "smoggy": [
        "JJ", 
        "NN"
    ], 
    "pasted": [
        "VBN", 
        "VBD"
    ], 
    "Horror": [
        "NNP"
    ], 
    "Fifteenth": [
        "NNP", 
        "JJ"
    ], 
    "Workmen": [
        "NNS"
    ], 
    "cooperation": [
        "NN"
    ], 
    "drawn": [
        "VBN", 
        "JJ"
    ], 
    "drawl": [
        "NN"
    ], 
    "encounters": [
        "NNS", 
        "VBZ"
    ], 
    "Micha": [
        "NNP"
    ], 
    "pastes": [
        "NNS"
    ], 
    "Domingo": [
        "NNP"
    ], 
    "handful": [
        "NN"
    ], 
    "A310-300s": [
        "NNP"
    ], 
    "Hudnut": [
        "NNP"
    ], 
    "rush-hour": [
        "JJ"
    ], 
    "succumbs": [
        "VBZ"
    ], 
    "non-skid": [
        "JJ"
    ], 
    "Koeppel": [
        "NNP"
    ], 
    "Self-Government": [
        "NNP"
    ], 
    "Perish": [
        "VB"
    ], 
    "essentially": [
        "RB"
    ], 
    "psychologists": [
        "NNS"
    ], 
    "han": [
        "NN"
    ], 
    "colorlessness": [
        "NN"
    ], 
    "excrement": [
        "NN"
    ], 
    "Bring": [
        "VB"
    ], 
    "Mich.": [
        "NNP"
    ], 
    "Gtech": [
        "NNP"
    ], 
    "Dawn": [
        "NNP", 
        "NN"
    ], 
    "Brink": [
        "NNP"
    ], 
    "Telemann": [
        "NNP"
    ], 
    "uniformity": [
        "NN"
    ], 
    "tone": [
        "NN", 
        "VB"
    ], 
    "SkyWest": [
        "NNP"
    ], 
    "Conservationists": [
        "NNS"
    ], 
    "had": [
        "VBD", 
        "VBN"
    ], 
    "Molokai": [
        "NNP"
    ], 
    "engulfs": [
        "VBZ"
    ], 
    "Furhmann": [
        "NNP"
    ], 
    "anticipatory": [
        "JJ"
    ], 
    "tons": [
        "NNS"
    ], 
    "infirm": [
        "JJ"
    ], 
    "tony": [
        "JJ"
    ], 
    "guzzlers": [
        "NNS"
    ], 
    "newsmaker": [
        "NN"
    ], 
    "companionway": [
        "NN"
    ], 
    "gratitude": [
        "NN"
    ], 
    "backwardness": [
        "NN"
    ], 
    "Taccetta": [
        "NNP"
    ], 
    "Tchalo": [
        "FW"
    ], 
    "Connecticut": [
        "NNP", 
        "NN"
    ], 
    "Hungarians": [
        "NNPS", 
        "NNS"
    ], 
    "Barge": [
        "NNP", 
        "NN"
    ], 
    "Mamaroneck": [
        "NNP"
    ], 
    "hospitalization": [
        "NN"
    ], 
    "plebeian": [
        "JJ"
    ], 
    "excite": [
        "VB"
    ], 
    "Elections": [
        "NNS", 
        "NNP"
    ], 
    "madhouse": [
        "NN"
    ], 
    "psychically": [
        "RB"
    ], 
    "idolatry": [
        "NN"
    ], 
    "novitiates": [
        "NNS"
    ], 
    "Horstman": [
        "NNP"
    ], 
    "reciprocal": [
        "JJ"
    ], 
    "Canada-Newfoundland": [
        "NNP"
    ], 
    "warbler": [
        "NN"
    ], 
    "rattlers": [
        "NNS"
    ], 
    "thrash": [
        "VB"
    ], 
    "ultracentrifuge": [
        "NN"
    ], 
    "endpoints": [
        "NNS"
    ], 
    "Lamberjack": [
        "NNP"
    ], 
    "Massey": [
        "NNP"
    ], 
    "Marenzio": [
        "NNP"
    ], 
    "beetles": [
        "NNS"
    ], 
    "Amfac": [
        "NNP"
    ], 
    "marksmanship": [
        "NN"
    ], 
    "unblinkingly": [
        "RB"
    ], 
    "CVN": [
        "NNP"
    ], 
    "dizzy": [
        "JJ"
    ], 
    "teutonic": [
        "JJ"
    ], 
    "spectrometric": [
        "JJ"
    ], 
    "CVB": [
        "NNP"
    ], 
    "chip-design": [
        "JJ"
    ], 
    "municipal": [
        "JJ", 
        "NN"
    ], 
    "bilious": [
        "JJ"
    ], 
    "pesticide-free": [
        "JJ"
    ], 
    "Santas": [
        "NNPS"
    ], 
    "Ill.": [
        "NNP"
    ], 
    "addressees": [
        "NNS"
    ], 
    "Smug": [
        "JJ"
    ], 
    "wider-body": [
        "JJR"
    ], 
    "disciplining": [
        "VBG"
    ], 
    "Classroom": [
        "NNP"
    ], 
    "fuss": [
        "NN", 
        "VB"
    ], 
    "Lyndhurst": [
        "NNP"
    ], 
    "unready": [
        "JJ"
    ], 
    "Denver-based": [
        "JJ", 
        "NNP"
    ], 
    "TND.B": [
        "NNP"
    ], 
    "fuse": [
        "NN", 
        "VB"
    ], 
    "Bloeser": [
        "NNP"
    ], 
    "rasping": [
        "JJ"
    ], 
    "venturing": [
        "VBG"
    ], 
    "Takashimaya": [
        "NNP"
    ], 
    "Flippo": [
        "NNP"
    ], 
    "humble": [
        "JJ", 
        "VB"
    ], 
    "Gresham": [
        "NNP"
    ], 
    "Alamito": [
        "NNP"
    ], 
    "neo-stagnationist": [
        "JJ"
    ], 
    "client": [
        "NN"
    ], 
    "casbah": [
        "NN"
    ], 
    "R.W.": [
        "NNP"
    ], 
    "sullenly": [
        "RB"
    ], 
    "Ille": [
        "NNP"
    ], 
    "tax-department": [
        "JJ"
    ], 
    "wops": [
        "VBZ"
    ], 
    "Doubtless": [
        "RB"
    ], 
    "daguerreotypes": [
        "NNS"
    ], 
    "super-Herculean": [
        "JJ"
    ], 
    "Duff": [
        "NNP"
    ], 
    "Lorenzo": [
        "NNP"
    ], 
    "thanks": [
        "NNS", 
        "VBZ", 
        "VB", 
        "UH"
    ], 
    "sabbatical": [
        "NN", 
        "JJ"
    ], 
    "beautifying": [
        "VBG"
    ], 
    "Taft-Hartley": [
        "NNP"
    ], 
    "Suitable": [
        "JJ"
    ], 
    "nilpotent": [
        "JJ"
    ], 
    "similarities": [
        "NNS"
    ], 
    "High-Yield": [
        "NNP"
    ], 
    "Baeyens": [
        "NNP"
    ], 
    "cowhand": [
        "NN"
    ], 
    "Nader": [
        "NNP"
    ], 
    "openings": [
        "NNS"
    ], 
    "Eighth": [
        "NNP", 
        "JJ"
    ], 
    "Democratic-endorsed": [
        "JJ"
    ], 
    "Hubble": [
        "NNP"
    ], 
    "Tabellen": [
        "FW"
    ], 
    "six-footer": [
        "NN"
    ], 
    "Wink": [
        "NNP"
    ], 
    "Winn": [
        "NNP"
    ], 
    "sweet-clover": [
        "NN"
    ], 
    "mail-order": [
        "JJ", 
        "NN"
    ], 
    "Jansen": [
        "NNP"
    ], 
    "InCide": [
        "NNP"
    ], 
    "designers": [
        "NNS"
    ], 
    "Lancet": [
        "NNP"
    ], 
    "Agouron": [
        "NNP"
    ], 
    "Wine": [
        "NNP", 
        "NN"
    ], 
    "eroded": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "rustle": [
        "NN", 
        "VB"
    ], 
    "Hochman": [
        "NNP"
    ], 
    "cool": [
        "JJ", 
        "NN", 
        "RB", 
        "VB", 
        "VBP"
    ], 
    "temporally": [
        "RB"
    ], 
    "slavish": [
        "JJ"
    ], 
    "sawmill": [
        "NN"
    ], 
    "mail-fraud": [
        "NN"
    ], 
    "night": [
        "NN", 
        "RB"
    ], 
    "long-endurance": [
        "JJ"
    ], 
    "fluoride": [
        "NN"
    ], 
    "mazes": [
        "NNS"
    ], 
    "Arrack": [
        "NN"
    ], 
    "dualities": [
        "NNS"
    ], 
    "Supplies": [
        "NNS"
    ], 
    "Steamboat": [
        "NNP"
    ], 
    "OFFENSIVE": [
        "JJ"
    ], 
    "caliper": [
        "NN"
    ], 
    "fine-arts": [
        "NNS"
    ], 
    "Papanicolaou": [
        "NN"
    ], 
    "Commission": [
        "NNP", 
        "FW", 
        "NN"
    ], 
    "Rewarding": [
        "NN"
    ], 
    "Grapefruit": [
        "NNP"
    ], 
    "Italia": [
        "NNP"
    ], 
    "Glantz": [
        "NNP"
    ], 
    "bemused": [
        "JJ"
    ], 
    "contaminating": [
        "VBG"
    ], 
    "glamorize": [
        "VB"
    ], 
    "ungracious": [
        "JJ"
    ], 
    "Malibu": [
        "NNP"
    ], 
    "signifying": [
        "VBG"
    ], 
    "Bieber": [
        "NNP"
    ], 
    "post-conviction": [
        "JJ"
    ], 
    "cortical": [
        "JJ"
    ], 
    "dolce": [
        "FW"
    ], 
    "near-Balkanization": [
        "NN"
    ], 
    "Proceedings": [
        "NNP", 
        "NNS"
    ], 
    "architectural": [
        "JJ"
    ], 
    "Mailing": [
        "NNP", 
        "VBG"
    ], 
    "president-U.S.": [
        "NN"
    ], 
    "non-contributory": [
        "JJ"
    ], 
    "Vajna": [
        "NNP"
    ], 
    "gentler": [
        "JJR"
    ], 
    "docutainment": [
        "NN"
    ], 
    "Briarcliff": [
        "NNP"
    ], 
    "passenger-kilometers": [
        "NNS"
    ], 
    "Dragging": [
        "VBG"
    ], 
    "DEPOSIT": [
        "NN", 
        "NNP"
    ], 
    "Arata": [
        "NNP"
    ], 
    "Priory": [
        "NNP"
    ], 
    "Horizon": [
        "NNP"
    ], 
    "synagogues": [
        "NNS"
    ], 
    "Puglisi": [
        "NNP"
    ], 
    "attorney": [
        "NN"
    ], 
    "catchall": [
        "NN"
    ], 
    "rendering": [
        "VBG", 
        "NN"
    ], 
    "Schnabel": [
        "NNP", 
        "JJ"
    ], 
    "Richfield": [
        "NNP"
    ], 
    "vipers": [
        "NNS"
    ], 
    "Blasi": [
        "NNP"
    ], 
    "Garcias": [
        "NNPS"
    ], 
    "Tatanga": [
        "NNP"
    ], 
    "frill": [
        "NN"
    ], 
    "overblown": [
        "JJ"
    ], 
    "sternal": [
        "JJ"
    ], 
    "Cherkasov": [
        "NNP"
    ], 
    "Regency": [
        "NNP", 
        "NN"
    ], 
    "Presley": [
        "NNP"
    ], 
    "emission-control": [
        "JJ"
    ], 
    "Blast": [
        "NNP"
    ], 
    "Blass": [
        "NNP"
    ], 
    "gaseous": [
        "JJ"
    ], 
    "garaged": [
        "VBN"
    ], 
    "firelight": [
        "NN"
    ], 
    "McChesney": [
        "NNP"
    ], 
    "Bhagat": [
        "NNP"
    ], 
    "U.N.F.P": [
        "NNP"
    ], 
    "garages": [
        "NNS"
    ], 
    "Liipfert": [
        "NNP"
    ], 
    "catalyst": [
        "NN"
    ], 
    "Fanshawe": [
        "NNP"
    ], 
    "sailboats": [
        "NNS"
    ], 
    "human-generated": [
        "JJ"
    ], 
    "reproductive": [
        "JJ"
    ], 
    "crows": [
        "NNS", 
        "VBZ"
    ], 
    "not-knowing": [
        "RB|VBG"
    ], 
    "McGraw-Hill": [
        "NNP"
    ], 
    "Reducing": [
        "VBG"
    ], 
    "Crean": [
        "NNP"
    ], 
    "Cream": [
        "NNP"
    ], 
    "Jessie": [
        "NNP"
    ], 
    "Joint-venture": [
        "JJ"
    ], 
    "aorta": [
        "NN"
    ], 
    "Some": [
        "DT", 
        "NNP", 
        "RB"
    ], 
    "Quill\\/William": [
        "NNP"
    ], 
    "potholes": [
        "NNS"
    ], 
    "direct-marketed": [
        "JJ"
    ], 
    "Repsol": [
        "NNP"
    ], 
    "constriction": [
        "NN"
    ], 
    "valuing": [
        "VBG"
    ], 
    "chantier": [
        "FW"
    ], 
    "denouncing": [
        "VBG"
    ], 
    "Isikoff": [
        "NNP"
    ], 
    "evasive": [
        "JJ"
    ], 
    "test": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Largely": [
        "RB"
    ], 
    "Kaza": [
        "NNP"
    ], 
    "Maxicare": [
        "NNP"
    ], 
    "Behan": [
        "NNP"
    ], 
    "authoritarianism": [
        "NN"
    ], 
    "school-sponsored": [
        "JJ"
    ], 
    "Ouse": [
        "NNP"
    ], 
    "faze": [
        "VB"
    ], 
    "}": [
        ")"
    ], 
    "Escobar": [
        "NNP"
    ], 
    "fourth-ranking": [
        "JJ"
    ], 
    "Hallman": [
        "NNP"
    ], 
    "bestioles": [
        "NNS"
    ], 
    "banquets": [
        "NNS"
    ], 
    "Keller": [
        "NNP"
    ], 
    "Chicken": [
        "NNP", 
        "NN"
    ], 
    "Kelley": [
        "NNP"
    ], 
    "Japanese-language": [
        "JJ", 
        "NN"
    ], 
    "songs": [
        "NNS"
    ], 
    "Draw-file": [
        "NN", 
        "VB"
    ], 
    "concept": [
        "NN"
    ], 
    "Mathias": [
        "NNP"
    ], 
    "redeployment": [
        "NN"
    ], 
    "Containment": [
        "NN", 
        "NNP"
    ], 
    "silverware": [
        "NN"
    ], 
    "horseback": [
        "NN", 
        "JJ", 
        "RB"
    ], 
    "underwriter": [
        "NN"
    ], 
    "Republic": [
        "NNP", 
        "NN"
    ], 
    "roundtable": [
        "JJ"
    ], 
    "battle": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Memoir": [
        "NN"
    ], 
    "tenable": [
        "JJ"
    ], 
    "soothed": [
        "VBD"
    ], 
    "varnish": [
        "NN"
    ], 
    "zeroing": [
        "VBG"
    ], 
    "aristocratic": [
        "JJ"
    ], 
    "Delphine": [
        "NNP"
    ], 
    "Intent": [
        "NN"
    ], 
    "island-fantasy": [
        "JJ"
    ], 
    "headstrong": [
        "JJ"
    ], 
    "extols": [
        "VBZ"
    ], 
    "puppyish": [
        "JJ"
    ], 
    "Prego": [
        "NNP"
    ], 
    "Roles": [
        "NNS"
    ], 
    "graphite-plastic": [
        "JJ"
    ], 
    "treadmill": [
        "NN"
    ], 
    "Rolex": [
        "NNP"
    ], 
    "dark-haired": [
        "JJ"
    ], 
    "Mineralogy": [
        "NNP"
    ], 
    "turns": [
        "VBZ", 
        "NNS"
    ], 
    "gun": [
        "NN", 
        "VB"
    ], 
    "gum": [
        "NN", 
        "VB"
    ], 
    "Butterfield": [
        "NNP"
    ], 
    "car-sales": [
        "NNS"
    ], 
    "guy": [
        "NN"
    ], 
    "Reaganite": [
        "JJ"
    ], 
    "jurisdictional": [
        "JJ"
    ], 
    "Leningrad-Kirov": [
        "NNP"
    ], 
    "Sander": [
        "NNP"
    ], 
    "CML": [
        "NNP"
    ], 
    "CMK": [
        "NNP"
    ], 
    "detonated": [
        "VBN", 
        "VBD"
    ], 
    "CMI": [
        "NNP"
    ], 
    "CME": [
        "NNP"
    ], 
    "Watts": [
        "NNP"
    ], 
    "CMA": [
        "NNP"
    ], 
    "hand-woven": [
        "VBN", 
        "NN"
    ], 
    "Galoob": [
        "NNP"
    ], 
    "wattles": [
        "NNS"
    ], 
    "Aluminum-Bat": [
        "NN"
    ], 
    "CMZ": [
        "NNP"
    ], 
    "forging": [
        "VBG"
    ], 
    "Ziff": [
        "NNP"
    ], 
    "CMS": [
        "NNP"
    ], 
    "Fork": [
        "NNP"
    ], 
    "Corp.-compatible": [
        "JJ"
    ], 
    "Form": [
        "NN", 
        "VB", 
        "NNP"
    ], 
    "heaviness": [
        "NN"
    ], 
    "foregoing": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "shares": [
        "NNS", 
        "NN", 
        "VBZ"
    ], 
    "Ford": [
        "NNP"
    ], 
    "peels": [
        "VBZ"
    ], 
    "Yoshida": [
        "NNP"
    ], 
    "alertness": [
        "NN"
    ], 
    "Fort": [
        "NNP", 
        "VB"
    ], 
    "khaneh": [
        "FW"
    ], 
    "Darin": [
        "NNP"
    ], 
    "handyman": [
        "NN"
    ], 
    "research-and-production": [
        "JJ"
    ], 
    "wonduh": [
        "VB"
    ], 
    "sleepwalkers": [
        "NNS"
    ], 
    "English": [
        "NNP", 
        "JJ", 
        "NNPS", 
        "NNS"
    ], 
    "combatant": [
        "JJ", 
        "NN"
    ], 
    "Lorin": [
        "NNP"
    ], 
    "Bunks": [
        "NNS"
    ], 
    "teacher": [
        "NN"
    ], 
    "sociable": [
        "JJ"
    ], 
    "Perch": [
        "NNP"
    ], 
    "Juvenile": [
        "NNP", 
        "JJ"
    ], 
    "Portugal": [
        "NNP"
    ], 
    "oilfield": [
        "NN"
    ], 
    "lithotripter": [
        "NN"
    ], 
    "Fueling": [
        "VBG"
    ], 
    "Sanlandro": [
        "NNP"
    ], 
    "Percy": [
        "NNP"
    ], 
    "burdensome": [
        "JJ"
    ], 
    "reagents": [
        "NNS"
    ], 
    "Lizzy": [
        "NNP"
    ], 
    "plotted": [
        "VBN", 
        "VBD"
    ], 
    "lighthouses": [
        "NNS"
    ], 
    "Guarascio": [
        "NNP"
    ], 
    "H.A.": [
        "NNP"
    ], 
    "regardless": [
        "RB"
    ], 
    "extra": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "unappeasably": [
        "RB"
    ], 
    "uphill": [
        "JJ", 
        "RB"
    ], 
    "filaments": [
        "NNS"
    ], 
    "puffed": [
        "VBN", 
        "VBD"
    ], 
    "Isaam": [
        "NNP"
    ], 
    "unappeasable": [
        "JJ"
    ], 
    "Isaac": [
        "NNP"
    ], 
    "quenching": [
        "NN"
    ], 
    "Complaint": [
        "NN"
    ], 
    "Semon": [
        "NNP"
    ], 
    "Lines-Trans": [
        "NNP"
    ], 
    "coalesce": [
        "VB", 
        "VBP"
    ], 
    "Fell": [
        "NNP", 
        "VBD"
    ], 
    "unreinforced": [
        "JJ"
    ], 
    "slough": [
        "VB"
    ], 
    "Idols": [
        "NNS"
    ], 
    "Feld": [
        "NNP"
    ], 
    "Government-owned": [
        "JJ"
    ], 
    "Teleflora": [
        "NNP"
    ], 
    "rainfall": [
        "NN"
    ], 
    "Anabaptist": [
        "NN", 
        "NNP"
    ], 
    "Require": [
        "VB"
    ], 
    "celebrity-oriented": [
        "JJ"
    ], 
    "southern-central": [
        "JJ"
    ], 
    "non-member": [
        "NN"
    ], 
    "Westbrook": [
        "NNP"
    ], 
    "Quotations": [
        "NNPS", 
        "NNS"
    ], 
    "spaceships": [
        "NNS"
    ], 
    "prepay": [
        "VB"
    ], 
    "defeats": [
        "NNS", 
        "VBZ"
    ], 
    "Conn.based": [
        "JJ"
    ], 
    "top-management": [
        "JJ", 
        "NN"
    ], 
    "Johann": [
        "NNP"
    ], 
    "syntactically": [
        "RB"
    ], 
    "HEYNOW": [
        "NNP"
    ], 
    "woefully": [
        "RB"
    ], 
    "Homer": [
        "NNP"
    ], 
    "Livermore": [
        "NNP"
    ], 
    "Clough": [
        "NNP"
    ], 
    "Drivers": [
        "NNS"
    ], 
    "self-realized": [
        "JJ"
    ], 
    "chit": [
        "NN"
    ], 
    "Freight": [
        "NNP", 
        "NN"
    ], 
    "ton-per-year": [
        "JJ"
    ], 
    "ERG": [
        "NNP"
    ], 
    "chin": [
        "NN", 
        "VB"
    ], 
    "Runge": [
        "NNP"
    ], 
    "ERC": [
        "NNP"
    ], 
    "chic": [
        "JJ", 
        "NN"
    ], 
    "determinations": [
        "NNS"
    ], 
    "Dubinsky": [
        "NNP"
    ], 
    "emerging-growth": [
        "NN"
    ], 
    "varnishes": [
        "NNS"
    ], 
    "dialysis": [
        "NN"
    ], 
    "discussion": [
        "NN"
    ], 
    "Reber": [
        "NNP"
    ], 
    "switchgear": [
        "NN"
    ], 
    "positional": [
        "JJ"
    ], 
    "antitrust-law": [
        "JJ", 
        "NN"
    ], 
    "Rebel": [
        "NN", 
        "NNP"
    ], 
    "wash-up": [
        "JJ"
    ], 
    "deteriorate": [
        "VB", 
        "VBP"
    ], 
    "armies": [
        "NNS"
    ], 
    "unenforcible": [
        "JJ"
    ], 
    "Biaggi": [
        "NNP"
    ], 
    "peerless": [
        "JJ"
    ], 
    "escalate": [
        "VB", 
        "VBP"
    ], 
    "APARTHEID": [
        "NNP"
    ], 
    "Elaborate": [
        "JJ"
    ], 
    "songbook": [
        "NN"
    ], 
    "push-up": [
        "NN", 
        "JJ"
    ], 
    "Kendrick": [
        "NNP"
    ], 
    "shortcovering": [
        "NN"
    ], 
    "drastic": [
        "JJ", 
        "RB"
    ], 
    "Spiller": [
        "NNP"
    ], 
    "Supavud": [
        "NNP"
    ], 
    "Shih": [
        "NNP"
    ], 
    "Kornbluth": [
        "NNP"
    ], 
    "Dieter": [
        "NNP"
    ], 
    "grandson": [
        "NN"
    ], 
    "HUDSON": [
        "NNP"
    ], 
    "devotees": [
        "NNS"
    ], 
    "beehive": [
        "NN"
    ], 
    "Radio": [
        "NNP", 
        "NN"
    ], 
    "ill-founded": [
        "JJ"
    ], 
    "Sporkin": [
        "NNP"
    ], 
    "Radic": [
        "NNP"
    ], 
    "Grandparent": [
        "NNP"
    ], 
    "Ship": [
        "NNP", 
        "NN"
    ], 
    "conquests": [
        "NNS"
    ], 
    "opts": [
        "VBZ"
    ], 
    "Combustion": [
        "NNP"
    ], 
    "Author": [
        "NNP", 
        "NN"
    ], 
    "backwoods-and-sand-hill": [
        "JJ"
    ], 
    "Hannon": [
        "NNP"
    ], 
    "Jas": [
        "NNP"
    ], 
    "Jap": [
        "NNP"
    ], 
    "Jan": [
        "NNP"
    ], 
    "brain": [
        "NN"
    ], 
    "Mandell": [
        "NNP"
    ], 
    "Jam": [
        "NNP"
    ], 
    "tablets": [
        "NNS"
    ], 
    "obediences": [
        "NNS"
    ], 
    "Jai": [
        "NNP"
    ], 
    "still-building": [
        "JJ"
    ], 
    "still": [
        "RB", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Mandela": [
        "NNP"
    ], 
    "Dolan": [
        "NNP"
    ], 
    "safe-driving": [
        "JJ"
    ], 
    "lyin": [
        "NN"
    ], 
    "big-souled": [
        "JJ"
    ], 
    "customer-driven": [
        "JJ"
    ], 
    "Arkansas-based": [
        "JJ"
    ], 
    "correspondence": [
        "NN"
    ], 
    "Modigliani": [
        "NNP"
    ], 
    "Genghis": [
        "NNP"
    ], 
    "thermometers": [
        "NNS"
    ], 
    "refineries": [
        "NNS"
    ], 
    "Ventspils": [
        "NNP"
    ], 
    "slacks": [
        "NNS"
    ], 
    "five-year-old": [
        "JJ"
    ], 
    "Mattison": [
        "NNP"
    ], 
    "galloping": [
        "VBG", 
        "JJ"
    ], 
    "Zeke": [
        "NNP"
    ], 
    "susceptibility": [
        "NN"
    ], 
    "inversion": [
        "NN"
    ], 
    "placate": [
        "VB"
    ], 
    "WestAir": [
        "NNP"
    ], 
    "drop": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "S.G.": [
        "NNP"
    ], 
    "beings": [
        "NNS"
    ], 
    "Glenview": [
        "NNP"
    ], 
    "extradite": [
        "VB"
    ], 
    "marshals": [
        "NNS"
    ], 
    "seamanship": [
        "NN"
    ], 
    "grouse": [
        "VBP", 
        "NN"
    ], 
    "challenged": [
        "VBD", 
        "VBN"
    ], 
    "mixed-up": [
        "JJ"
    ], 
    "Museum": [
        "NNP", 
        "NN"
    ], 
    "stooping": [
        "VBG"
    ], 
    "free-holders": [
        "NNS"
    ], 
    "yeah": [
        "UH", 
        "NN"
    ], 
    "Kahwaty": [
        "NNP"
    ], 
    "challenges": [
        "NNS", 
        "VBZ"
    ], 
    "Becalmed": [
        "VBN"
    ], 
    "year": [
        "NN", 
        "JJ"
    ], 
    "Zealand-based": [
        "JJ"
    ], 
    "beer-drinker": [
        "NN"
    ], 
    "Thru": [
        "IN"
    ], 
    "quasi-private": [
        "JJ"
    ], 
    "monitors": [
        "NNS", 
        "VBZ"
    ], 
    "crisis-response": [
        "JJ"
    ], 
    "Seattle-based": [
        "JJ"
    ], 
    "Compagnie": [
        "NNP"
    ], 
    "Norwegian": [
        "JJ", 
        "NNP"
    ], 
    "structural-adjustment": [
        "JJ", 
        "NN"
    ], 
    "wholeheartedly": [
        "RB"
    ], 
    "Indochinese": [
        "JJ", 
        "NNS"
    ], 
    "temporizing": [
        "VBG"
    ], 
    "Tariff": [
        "NN", 
        "NNP"
    ], 
    "well-operated": [
        "JJ"
    ], 
    "Iijima": [
        "NNP"
    ], 
    "York-area": [
        "JJ"
    ], 
    "saxophones": [
        "NNS"
    ], 
    "Taiwan-born": [
        "JJ"
    ], 
    "scandal-stench": [
        "NN"
    ], 
    "Itoiz": [
        "NNP"
    ], 
    "advantages": [
        "NNS"
    ], 
    "vuhranduh": [
        "NN"
    ], 
    "Lincoln-Douglas": [
        "NNP"
    ], 
    "repayable": [
        "JJ"
    ], 
    "contemplation": [
        "NN"
    ], 
    "Travelers": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "AgResource": [
        "NNP"
    ], 
    "transition": [
        "NN"
    ], 
    "Erin": [
        "NNP"
    ], 
    "tangled": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Erik": [
        "NNP"
    ], 
    "Ironic": [
        "JJ"
    ], 
    "nonprofit": [
        "JJ"
    ], 
    "Padget": [
        "NNP"
    ], 
    "Payers": [
        "NNS"
    ], 
    "suffice": [
        "VB", 
        "VBP"
    ], 
    "BENTSEN": [
        "NNP"
    ], 
    "Historian": [
        "NN"
    ], 
    "flipping": [
        "VBG", 
        "JJ", 
        "RB"
    ], 
    "TRAVELS": [
        "VBZ"
    ], 
    "aluminum-industry": [
        "NN"
    ], 
    "Vonnegut": [
        "NNP"
    ], 
    "Medicine": [
        "NNP", 
        "NN"
    ], 
    "two-and-a-half-mile": [
        "JJ"
    ], 
    "L.L.": [
        "NNP"
    ], 
    "tomorrow": [
        "NN", 
        "JJ", 
        "RB"
    ], 
    "Petry": [
        "NNP"
    ], 
    "Euro-son": [
        "NN"
    ], 
    "Bruckner": [
        "NNP"
    ], 
    "reinvestment": [
        "NN"
    ], 
    "publicly-traded": [
        "JJ"
    ], 
    "Driscoll": [
        "NNP"
    ], 
    "Zadel": [
        "NNP"
    ], 
    "predomination": [
        "NN"
    ], 
    "Tech-Sym": [
        "NNP"
    ], 
    "typographical": [
        "JJ"
    ], 
    "despises": [
        "VBZ"
    ], 
    "Analyses": [
        "NNS"
    ], 
    "Roaco": [
        "NNP"
    ], 
    "brainy": [
        "JJ"
    ], 
    "Quadrum": [
        "NNP"
    ], 
    "uninformed": [
        "JJ"
    ], 
    "brains": [
        "NNS"
    ], 
    "Jail": [
        "NNP", 
        "NN"
    ], 
    "interbank": [
        "NN", 
        "JJ", 
        "RB", 
        "NN|JJ", 
        "NN|RB", 
        "NN|JJ|RB", 
        "RB|NN|JJ"
    ], 
    "auto-immune": [
        "JJ"
    ], 
    "Karstadt": [
        "NNP"
    ], 
    "professionals": [
        "NNS"
    ], 
    "back-disability": [
        "NN"
    ], 
    "transferred": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "discernment": [
        "NN"
    ], 
    "Bremerton": [
        "NNP"
    ], 
    "diktat": [
        "JJ"
    ], 
    "GERMANS": [
        "NNPS", 
        "NNS", 
        "NN"
    ], 
    "Volland": [
        "NNP"
    ], 
    "overcollateralized": [
        "VBN"
    ], 
    "extinguish": [
        "VB"
    ], 
    "Settlement": [
        "NN", 
        "NNP"
    ], 
    "Ekberg": [
        "NNP"
    ], 
    "unsubstantiated": [
        "JJ"
    ], 
    "Cappy": [
        "NNP"
    ], 
    "Marcor": [
        "NNP"
    ], 
    "Marcos": [
        "NNP"
    ], 
    "beef-hungry": [
        "JJ"
    ], 
    "Orrie": [
        "NNP"
    ], 
    "Capps": [
        "NNP"
    ], 
    "For...": [
        ":"
    ], 
    "OUTSIDE": [
        "JJ"
    ], 
    "Winnipeg": [
        "NNP"
    ], 
    "Deep": [
        "NNP", 
        "JJ", 
        "NN", 
        "RB"
    ], 
    "Petre": [
        "NNP"
    ], 
    "Marcom": [
        "NNP"
    ], 
    "Israelite": [
        "NNP"
    ], 
    "snorting": [
        "NN"
    ], 
    "blonde-headed": [
        "JJ"
    ], 
    "custom-built": [
        "VBN"
    ], 
    "call-in": [
        "JJ"
    ], 
    "Refuses": [
        "VBZ"
    ], 
    "chemical-weapons": [
        "NNS", 
        "JJ"
    ], 
    "Wiseguy": [
        "NNP"
    ], 
    "Package": [
        "NN"
    ], 
    "Vestar": [
        "NNP"
    ], 
    "thesaurus": [
        "NN"
    ], 
    "importantly": [
        "RB"
    ], 
    "Viatech": [
        "NNP"
    ], 
    "Akio": [
        "NNP"
    ], 
    "Akin": [
        "NNP"
    ], 
    "MeraBank": [
        "NNP"
    ], 
    "countries": [
        "NNS"
    ], 
    "Ibaraki": [
        "NNP"
    ], 
    "Ente": [
        "NNP"
    ], 
    "Iveco": [
        "NNP"
    ], 
    "Thermo": [
        "NNP"
    ], 
    "Coupes": [
        "NNP"
    ], 
    "implications": [
        "NNS"
    ], 
    "premiered": [
        "VBD"
    ], 
    "chauffeured": [
        "VBN"
    ], 
    "premieres": [
        "NNS", 
        "VBZ"
    ], 
    "heir-designate": [
        "NN"
    ], 
    "precipice-walled": [
        "JJ"
    ], 
    "Jibril": [
        "NNP"
    ], 
    "Web": [
        "NNP"
    ], 
    "Aggies": [
        "NNP"
    ], 
    "Blount": [
        "NNP"
    ], 
    "Wei": [
        "NNP"
    ], 
    "Character": [
        "NN", 
        "NNP"
    ], 
    "hairpin": [
        "NN"
    ], 
    "play-by-play": [
        "JJ"
    ], 
    "Wes": [
        "NNP"
    ], 
    "cathode-ray": [
        "NN"
    ], 
    "teamed": [
        "VBD", 
        "VBN"
    ], 
    "Wet": [
        "JJ", 
        "NNP"
    ], 
    "bridgework": [
        "NN"
    ], 
    "Sharing": [
        "VBG"
    ], 
    "Jeepers": [
        "UH"
    ], 
    "Nijinska": [
        "NNP"
    ], 
    "Pelletier": [
        "NNP"
    ], 
    "industrialize": [
        "VB"
    ], 
    "embittered": [
        "VBN", 
        "JJ"
    ], 
    "self-supporting": [
        "JJ"
    ], 
    "Nijinsky": [
        "NN"
    ], 
    "Awake": [
        "NNP"
    ], 
    "Cupply": [
        "NNP"
    ], 
    "Marsden": [
        "NNP"
    ], 
    "Adaptations": [
        "NNS"
    ], 
    "paneled": [
        "JJ"
    ], 
    "ten-gallon": [
        "JJ"
    ], 
    "crevasses": [
        "NNS"
    ], 
    "Levinson": [
        "NNP"
    ], 
    "humbled": [
        "VBN", 
        "VBD"
    ], 
    "stroll": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "LD060": [
        "NN"
    ], 
    "well-capitalized": [
        "JJ"
    ], 
    "self-indulgence": [
        "NN"
    ], 
    "rippling": [
        "VBG"
    ], 
    "irritant": [
        "NN"
    ], 
    "Intellectual": [
        "NNP"
    ], 
    "thumbnail": [
        "NN"
    ], 
    "anti-tax": [
        "JJ"
    ], 
    "ambling": [
        "VBG"
    ], 
    "carloads": [
        "NNS"
    ], 
    "Arhat": [
        "NNP"
    ], 
    "Chicago-area": [
        "JJ"
    ], 
    "bannnnnng": [
        "VB"
    ], 
    "EMA": [
        "NNP"
    ], 
    "Whigs": [
        "NNPS", 
        "NNS"
    ], 
    "EMC": [
        "NNP"
    ], 
    "burst": [
        "NN", 
        "VBD", 
        "VBN", 
        "VBP", 
        "VB"
    ], 
    "excoriated": [
        "VBD", 
        "VBN"
    ], 
    "EMI": [
        "NNP"
    ], 
    "anchored": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Harbanse": [
        "NNP"
    ], 
    "EMS": [
        "NNP"
    ], 
    "hoes": [
        "NNS"
    ], 
    "non-discrimination": [
        "NN"
    ], 
    "Tolerance": [
        "NN"
    ], 
    "Index-arbitrage": [
        "NN"
    ], 
    "break-up": [
        "NN", 
        "JJ"
    ], 
    "Rincon": [
        "NNP"
    ], 
    "once-dull": [
        "JJ"
    ], 
    "Krzywy-Rog": [
        "NNP"
    ], 
    "Krieger": [
        "NNP"
    ], 
    "Members": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "complications": [
        "NNS"
    ], 
    "westbound": [
        "JJ"
    ], 
    "intonations": [
        "NNS"
    ], 
    "Diehards": [
        "NNS"
    ], 
    "Puttana": [
        "NN"
    ], 
    "piece-by-piece": [
        "JJ"
    ], 
    "Lieberman": [
        "NNP"
    ], 
    "toting": [
        "VBG"
    ], 
    "Beahrs": [
        "NNP"
    ], 
    "Joseph": [
        "NNP", 
        "NNPS"
    ], 
    "clipboards": [
        "NNS"
    ], 
    "broil": [
        "NN", 
        "VB"
    ], 
    "money-transfer": [
        "JJ", 
        "NN"
    ], 
    "WIN\\": [
        "NNP"
    ], 
    "WINS": [
        "VBZ"
    ], 
    "Adoniram": [
        "NNP"
    ], 
    "undersold": [
        "NN"
    ], 
    "outcuss": [
        "VBZ"
    ], 
    "Malaysia": [
        "NNP", 
        "NN"
    ], 
    "Lavery": [
        "NNP"
    ], 
    "mortgage-industry": [
        "NN"
    ], 
    "botched": [
        "VBN", 
        "JJ"
    ], 
    "Altenburg": [
        "NNP"
    ], 
    "madness": [
        "NN"
    ], 
    "foreboding": [
        "NN", 
        "JJ"
    ], 
    "hybrids": [
        "NNS"
    ], 
    "inexplicable": [
        "JJ"
    ], 
    "exploit": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "Japanese-Americans": [
        "NNPS", 
        "NNS"
    ], 
    "biographer": [
        "NN"
    ], 
    "Velazquez": [
        "NNP"
    ], 
    "Principals": [
        "NNS"
    ], 
    "charismatic": [
        "JJ"
    ], 
    "sledding": [
        "NN", 
        "VBG"
    ], 
    "amino": [
        "JJ"
    ], 
    "muzzling": [
        "JJ"
    ], 
    "Pain": [
        "NN"
    ], 
    "lioness": [
        "NN"
    ], 
    "Meteorological": [
        "NNP"
    ], 
    "micrometeoritic": [
        "JJ"
    ], 
    "Paid": [
        "VBN", 
        "JJ"
    ], 
    "tropical": [
        "JJ", 
        "NN"
    ], 
    "pace-setter": [
        "NN"
    ], 
    "Paix": [
        "NNP"
    ], 
    "Floyd": [
        "NNP"
    ], 
    "dictator": [
        "NN"
    ], 
    "six-dollar": [
        "JJ"
    ], 
    "Goodby": [
        "NNP", 
        "UH"
    ], 
    "Maybelline": [
        "NNP"
    ], 
    "before-school": [
        "JJ"
    ], 
    "aggressions": [
        "NNS"
    ], 
    "straying": [
        "VBG"
    ], 
    "Yr.": [
        "NN"
    ], 
    "discontinuing": [
        "VBG"
    ], 
    "Involved": [
        "VBN"
    ], 
    "fours": [
        "NNS"
    ], 
    "earth-bound": [
        "JJ"
    ], 
    "vagueness": [
        "NN"
    ], 
    "skiers": [
        "NNS"
    ], 
    "Biosystems": [
        "NNP", 
        "NNPS"
    ], 
    "Night": [
        "NNP", 
        "NNPS", 
        "NN"
    ], 
    "freebooters": [
        "NNS"
    ], 
    "financial-service": [
        "NN", 
        "JJ"
    ], 
    "Steroids": [
        "NNS"
    ], 
    "Yaffe": [
        "NNP"
    ], 
    "offbeat": [
        "JJ"
    ], 
    "Hyun": [
        "NNP"
    ], 
    "moderns": [
        "NNS"
    ], 
    "Performed": [
        "VBN"
    ], 
    "biped": [
        "NN"
    ], 
    "Edgewater": [
        "NNP"
    ], 
    "Moody": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Histochemistry": [
        "NNP"
    ], 
    "Aaronson": [
        "NNP"
    ], 
    "GNP": [
        "NNP", 
        "NN"
    ], 
    "bickered": [
        "VBN"
    ], 
    "tilling": [
        "VBG"
    ], 
    "mucus": [
        "NN"
    ], 
    "metric": [
        "JJ", 
        "NN"
    ], 
    "continuing-education": [
        "JJ"
    ], 
    "Insurgent": [
        "JJ"
    ], 
    "Better": [
        "NNP", 
        "RBR", 
        "RB", 
        "JJR"
    ], 
    "Unwilling": [
        "JJ"
    ], 
    "Israel": [
        "NNP"
    ], 
    "develop": [
        "VB", 
        "VBP"
    ], 
    "M.R.": [
        "NNP"
    ], 
    "pester": [
        "VB"
    ], 
    "Notitia": [
        "NNS"
    ], 
    "Bloomberg": [
        "NNP"
    ], 
    "preisolated": [
        "VBN"
    ], 
    "Fed-watching": [
        "JJ"
    ], 
    "near-complete": [
        "JJ"
    ], 
    "Amado": [
        "NNP"
    ], 
    "Hitter": [
        "NN"
    ], 
    "Fertitta": [
        "NNP"
    ], 
    "century...": [
        ":"
    ], 
    "squatted": [
        "VBD", 
        "VBN"
    ], 
    "Telelawyer": [
        "NNP"
    ], 
    "Amada": [
        "NNP"
    ], 
    "rodder": [
        "NN"
    ], 
    "single-sentence": [
        "JJ"
    ], 
    "fifty-cent": [
        "JJ"
    ], 
    "bronchiolitis": [
        "NN"
    ], 
    "Colee": [
        "NNP"
    ], 
    "squatter": [
        "NN"
    ], 
    "irresistable": [
        "JJ"
    ], 
    "Peruvian": [
        "JJ", 
        "NNP"
    ], 
    "nacelle": [
        "NN"
    ], 
    "Caverns": [
        "NNP"
    ], 
    "Terence": [
        "NNP"
    ], 
    "Nesconset": [
        "NNP"
    ], 
    "tarpapered": [
        "JJ"
    ], 
    "Catinari": [
        "NNP"
    ], 
    "Walkers": [
        "NNPS", 
        "NNS"
    ], 
    "depreciation-induced": [
        "JJ"
    ], 
    "Municipals": [
        "NNS", 
        "NNPS"
    ], 
    "airborne-radar": [
        "NN"
    ], 
    "Puma": [
        "NN"
    ], 
    "nondurable": [
        "JJ"
    ], 
    "Service": [
        "NNP", 
        "NN"
    ], 
    "Oaklanders": [
        "NNPS"
    ], 
    "worn-out": [
        "JJ"
    ], 
    "Bafflers": [
        "NNPS"
    ], 
    "neon": [
        "NN"
    ], 
    "moviestar": [
        "NN"
    ], 
    "Gases": [
        "NNS"
    ], 
    "Pump": [
        "NNP", 
        "NN"
    ], 
    "growled": [
        "VBD"
    ], 
    "maternity": [
        "NN"
    ], 
    "greetings": [
        "NNS"
    ], 
    "Euro-that": [
        "NN"
    ], 
    "Syllables": [
        "NNS"
    ], 
    "Molecular": [
        "NNP"
    ], 
    "d-c": [
        "NN"
    ], 
    "Linear": [
        "NNP"
    ], 
    "forward-looking": [
        "JJ"
    ], 
    "Muniak": [
        "NNP"
    ], 
    "abortive": [
        "JJ"
    ], 
    "felicities": [
        "NNS"
    ], 
    "Marysville": [
        "NNP"
    ], 
    "overbought": [
        "VBN", 
        "JJ", 
        "NN"
    ], 
    "Thatcherian": [
        "JJ"
    ], 
    "lowest-cost": [
        "JJ", 
        "JJS"
    ], 
    "Analyst": [
        "NN", 
        "NNP"
    ], 
    "disproportionate": [
        "JJ"
    ], 
    "propped": [
        "VBN", 
        "VBD"
    ], 
    "Outflows": [
        "NNS"
    ], 
    "Tenn.-based": [
        "JJ"
    ], 
    "dialectics": [
        "NNS"
    ], 
    "earnest": [
        "NN", 
        "JJ"
    ], 
    "Plainview": [
        "NNP"
    ], 
    "Playtex": [
        "NNP"
    ], 
    "fortune": [
        "NN"
    ], 
    "heightened": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Regulars": [
        "NNS"
    ], 
    "unrequited": [
        "JJ"
    ], 
    "conducts": [
        "VBZ"
    ], 
    "Greyhound": [
        "NNP"
    ], 
    "roll": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "annually": [
        "RB"
    ], 
    "yearnings": [
        "NNS"
    ], 
    "unspoiled": [
        "JJ"
    ], 
    "scholastics": [
        "NNS"
    ], 
    "Salwen": [
        "NNP"
    ], 
    "Mahran": [
        "NNP"
    ], 
    "output": [
        "NN", 
        "VB"
    ], 
    "Magleby": [
        "NNP"
    ], 
    "falsehood": [
        "NN"
    ], 
    "verbal": [
        "JJ"
    ], 
    "exposed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "tragedies": [
        "NNS"
    ], 
    "cathode": [
        "NN"
    ], 
    "Walnut": [
        "NNP", 
        "NN"
    ], 
    "exposes": [
        "VBZ"
    ], 
    "zealously": [
        "RB"
    ], 
    "slurries": [
        "NNS"
    ], 
    "intend": [
        "VBP", 
        "VB"
    ], 
    "Udall": [
        "NNP"
    ], 
    "ACTH": [
        "NNP"
    ], 
    "salicylic": [
        "JJ"
    ], 
    "manipulator": [
        "NN"
    ], 
    "Symantec": [
        "NNP"
    ], 
    "palms": [
        "NNS"
    ], 
    "AlunJones": [
        "NNP"
    ], 
    "two-minute": [
        "JJ"
    ], 
    "Vinken": [
        "NNP"
    ], 
    "Pompey": [
        "NNP"
    ], 
    "Ion": [
        "NNP"
    ], 
    "Prizzi": [
        "NNP"
    ], 
    "bustlin": [
        "NN"
    ], 
    "elephant-like": [
        "JJ"
    ], 
    "fractures": [
        "NNS", 
        "VBZ"
    ], 
    "Chilean": [
        "JJ"
    ], 
    "Kalmuk": [
        "NNP"
    ], 
    "FT-SE": [
        "NNP"
    ], 
    "carefulness": [
        "NN"
    ], 
    "sweet-natured": [
        "JJ"
    ], 
    "PLACE": [
        "NNP"
    ], 
    "heat-absorbing": [
        "JJ"
    ], 
    "fractured": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "bazaar": [
        "NN"
    ], 
    "Leonardo": [
        "NNP"
    ], 
    "Kalmus": [
        "NNP"
    ], 
    "B.B.C.": [
        "NNP"
    ], 
    "Krakowiak": [
        "NNP"
    ], 
    "Cavenee": [
        "NNP"
    ], 
    "user-inviting": [
        "JJ"
    ], 
    "Scapin": [
        "NNP"
    ], 
    "mugging": [
        "NN"
    ], 
    "Blaine": [
        "NNP"
    ], 
    "Chevron": [
        "NNP", 
        "NN"
    ], 
    "non-resistants": [
        "JJ"
    ], 
    "D&B": [
        "NNP", 
        "VBP", 
        "NN"
    ], 
    "backup": [
        "NN", 
        "JJ"
    ], 
    "Intergovernmental": [
        "NNP"
    ], 
    "Kapoor": [
        "NNP"
    ], 
    "Boogie": [
        "NNP"
    ], 
    "Amicam": [
        "NNP"
    ], 
    "Pavletich": [
        "NNP"
    ], 
    "shrinking": [
        "VBG", 
        "NN"
    ], 
    "intervention": [
        "NN"
    ], 
    "Noctiluca": [
        "NN"
    ], 
    "discount-coupon": [
        "NN"
    ], 
    "Karshilama": [
        "NNP"
    ], 
    "Well-received": [
        "JJ"
    ], 
    "Rounding-off": [
        "NN"
    ], 
    "Yuppily": [
        "RB"
    ], 
    "Budzyn": [
        "NNP"
    ], 
    "Finnie": [
        "NNP"
    ], 
    "Ruschkowski": [
        "NNP"
    ], 
    "explosions": [
        "NNS"
    ], 
    "LOSS\\": [
        "NN"
    ], 
    "Acarbose": [
        "NNP"
    ], 
    "cost-push": [
        "JJ"
    ], 
    "shoestring": [
        "NN"
    ], 
    "pitcher": [
        "NN"
    ], 
    "Kennon": [
        "NNP"
    ], 
    "American-developed": [
        "JJ"
    ], 
    "Calderwood": [
        "NNP"
    ], 
    "Galveston-Port": [
        "NNP"
    ], 
    "shootout": [
        "NN"
    ], 
    "recouped": [
        "VBD", 
        "VBN"
    ], 
    "omelet": [
        "NN"
    ], 
    "pervasively": [
        "RB"
    ], 
    "eighth-floor": [
        "JJ"
    ], 
    "Trouble": [
        "NN"
    ], 
    "wholes": [
        "NNS"
    ], 
    "curtail": [
        "VB", 
        "VBP"
    ], 
    "illustrator": [
        "NN"
    ], 
    "embedded": [
        "VBN", 
        "JJ"
    ], 
    "Ironweed": [
        "NN"
    ], 
    "Two-month": [
        "JJ"
    ], 
    "Survival": [
        "NNP"
    ], 
    "Marston": [
        "NNP"
    ], 
    "waltzing": [
        "VBG"
    ], 
    "Fitzwater": [
        "NNP"
    ], 
    "Adaptation": [
        "NN"
    ], 
    "realigned": [
        "VBD", 
        "JJ"
    ], 
    "Moves": [
        "NNS"
    ], 
    "DEFECT": [
        "VBP"
    ], 
    "sturdiest": [
        "JJS"
    ], 
    "Jacques-Francois": [
        "NNP"
    ], 
    "BALKS": [
        "VBZ"
    ], 
    "rosarians": [
        "NNS"
    ], 
    "Veterans": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "Idol": [
        "NNP"
    ], 
    "finishes": [
        "VBZ", 
        "NNS"
    ], 
    "Howson-Algraphy": [
        "NNP"
    ], 
    "Niven": [
        "NNP"
    ], 
    "inactivation": [
        "NN"
    ], 
    "Finnegan": [
        "NNP"
    ], 
    "Herald-American": [
        "NNP"
    ], 
    "Purpose": [
        "NNP", 
        "NN"
    ], 
    "Daberko": [
        "NNP"
    ], 
    "fools": [
        "NNS"
    ], 
    "poor": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "Engine": [
        "NNP", 
        "NN"
    ], 
    "diaries": [
        "NNS"
    ], 
    "unselfconsciousness": [
        "NN"
    ], 
    "endeavors": [
        "NNS"
    ], 
    "whistling": [
        "VBG"
    ], 
    "drive-through": [
        "JJ"
    ], 
    "vp": [
        "NN"
    ], 
    "vertigo": [
        "NN"
    ], 
    "SIMPLIFYING": [
        "VBG"
    ], 
    "Y.W.C.A.": [
        "NNP"
    ], 
    "Miron": [
        "NNP"
    ], 
    "titillating": [
        "VBG"
    ], 
    "insertions": [
        "NNS"
    ], 
    "Boissoneault": [
        "NNP"
    ], 
    "Comcast": [
        "NNP"
    ], 
    "DIRECTORS": [
        "NNS"
    ], 
    "cores": [
        "NNS"
    ], 
    "overseas": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "Magnolias": [
        "NNS"
    ], 
    "Intervoice": [
        "NNP"
    ], 
    "disaffiliation": [
        "NN"
    ], 
    "interspecies": [
        "NNS"
    ], 
    "ceases": [
        "VBZ"
    ], 
    "JWP": [
        "NNP"
    ], 
    "Unknown": [
        "JJ"
    ], 
    "HURRICANE": [
        "NNP"
    ], 
    "heavy-water": [
        "NN"
    ], 
    "ceased": [
        "VBD", 
        "VBN"
    ], 
    "thoughtful": [
        "JJ"
    ], 
    "unblock": [
        "VB"
    ], 
    "Take": [
        "VB", 
        "NNP", 
        "VBP"
    ], 
    "Shultz": [
        "NNP"
    ], 
    "bulb": [
        "NN"
    ], 
    "pipsqueak": [
        "NN"
    ], 
    "religious": [
        "JJ", 
        "IN", 
        "NN"
    ], 
    "Kasler": [
        "NNP"
    ], 
    "osteoporosis": [
        "NN"
    ], 
    "Cieca": [
        "NNP"
    ], 
    "corps": [
        "NN", 
        "FW"
    ], 
    "Staloff": [
        "NNP"
    ], 
    "Discos": [
        "NNS"
    ], 
    "computerizing": [
        "VBG"
    ], 
    "music-publishing": [
        "JJ"
    ], 
    "sight-seeing": [
        "JJ", 
        "NN"
    ], 
    "volunteer": [
        "NN", 
        "VB", 
        "JJR", 
        "VBP"
    ], 
    "twothirds": [
        "NNS"
    ], 
    "patently": [
        "RB"
    ], 
    "clean-air": [
        "JJ", 
        "NN"
    ], 
    "Hancock": [
        "NNP"
    ], 
    "pseudoephedrine": [
        "NN"
    ], 
    "Status-roles": [
        "NNS"
    ], 
    "coloured": [
        "JJ"
    ], 
    "Celestial": [
        "NNP"
    ], 
    "Surging": [
        "VBG"
    ], 
    "wrangler": [
        "NN"
    ], 
    "Underwoods": [
        "NNPS"
    ], 
    "coupon-distribution": [
        "JJ"
    ], 
    "Terminiello": [
        "NNP"
    ], 
    "anarchical": [
        "JJ"
    ], 
    "Veiling": [
        "VBG"
    ], 
    "artfulness": [
        "NN"
    ], 
    "rationally": [
        "RB"
    ], 
    "reaffirming": [
        "VBG"
    ], 
    "startin": [
        "VBG"
    ], 
    "brucellosis": [
        "NN"
    ], 
    "ass": [
        "NN"
    ], 
    "lulls": [
        "NNS", 
        "VBZ"
    ], 
    "nullity": [
        "NN"
    ], 
    "streets": [
        "NNS"
    ], 
    "GUN": [
        "NNP"
    ], 
    "less-conservative": [
        "JJ"
    ], 
    "coudn": [
        "MD"
    ], 
    "Watchmen": [
        "NNP"
    ], 
    "Youngberg": [
        "NNP"
    ], 
    "Gaetan": [
        "NNP"
    ], 
    "Robb": [
        "NNP"
    ], 
    "bass": [
        "NN"
    ], 
    "heavy-construction": [
        "NN"
    ], 
    "cues": [
        "NNS"
    ], 
    "raw-material": [
        "NN", 
        "JJ"
    ], 
    "lurch": [
        "NN", 
        "VBP"
    ], 
    "nonproliferation": [
        "NN"
    ], 
    "Stenhachs": [
        "NNPS"
    ], 
    "cued": [
        "VBD"
    ], 
    "Importers": [
        "NNP"
    ], 
    "Breda": [
        "NNP"
    ], 
    "scallops": [
        "NNS"
    ], 
    "stockyards": [
        "NNS"
    ], 
    "Chessman": [
        "NNP"
    ], 
    "longshoremen": [
        "NNS"
    ], 
    "Paramus": [
        "NNP"
    ], 
    "confict": [
        "NN"
    ], 
    "continuingly": [
        "RB"
    ], 
    "ragtime": [
        "NN"
    ], 
    "Latinovich": [
        "NNP"
    ], 
    "excess": [
        "JJ", 
        "NN"
    ], 
    "marring": [
        "VBG"
    ], 
    "food-products": [
        "NNS"
    ], 
    "Fokine": [
        "NNP"
    ], 
    "Doll": [
        "NNP"
    ], 
    "cathartic": [
        "JJ"
    ], 
    "psalmist": [
        "NN"
    ], 
    "Dole": [
        "NNP"
    ], 
    "Bolstered": [
        "VBN"
    ], 
    "Krasnik": [
        "NNP"
    ], 
    "Kohnstamm-positive": [
        "JJ", 
        "NNP"
    ], 
    "indirection": [
        "NN"
    ], 
    "Trusthouse": [
        "NNP"
    ], 
    "advertising": [
        "NN", 
        "VBG", 
        "VBG|NN"
    ], 
    "successors": [
        "NNS"
    ], 
    "Plateau": [
        "NNP"
    ], 
    "inspires": [
        "VBZ"
    ], 
    "Tingley": [
        "NNP"
    ], 
    "gun-carrying": [
        "JJ"
    ], 
    "Stateswest": [
        "NNP"
    ], 
    "Chicopee": [
        "NNP"
    ], 
    "S*": [
        "NNP"
    ], 
    "head-topper": [
        "NN"
    ], 
    "S.": [
        "NNP"
    ], 
    "A.S.": [
        "NNP"
    ], 
    "seventeenth": [
        "JJ"
    ], 
    "Climb": [
        "VB"
    ], 
    "S$": [
        "$"
    ], 
    "Commencing": [
        "VBG"
    ], 
    "Moet": [
        "NNP", 
        "JJS"
    ], 
    "Butlers": [
        "NNPS"
    ], 
    "Intouch": [
        "NNP"
    ], 
    "Connor": [
        "NNP"
    ], 
    "Mono-unsaturated": [
        "JJ"
    ], 
    "Backyard": [
        "NN"
    ], 
    "oil-field": [
        "NN", 
        "JJ"
    ], 
    "Struggle": [
        "NNP", 
        "VBP"
    ], 
    "cannibalism": [
        "NN"
    ], 
    "Sheraton-Biltmore": [
        "NNP"
    ], 
    "Sy": [
        "NNP"
    ], 
    "Viewmaster": [
        "NNP"
    ], 
    "Sr": [
        "NNP"
    ], 
    "propellers": [
        "NNS"
    ], 
    "Sp": [
        "NNP"
    ], 
    "Arlt": [
        "NNP"
    ], 
    "Su": [
        "NNP"
    ], 
    "St": [
        "NNP", 
        "NN"
    ], 
    "Banking": [
        "NNP", 
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Si": [
        "NNP"
    ], 
    "sclerotic": [
        "JJ"
    ], 
    "So": [
        "RB", 
        "NNP", 
        "CC", 
        "IN", 
        "UH"
    ], 
    "pretense": [
        "NN"
    ], 
    "Se": [
        "NNP"
    ], 
    "coup-planning": [
        "NN"
    ], 
    "daminozide": [
        "NN"
    ], 
    "macho": [
        "JJ", 
        "NN"
    ], 
    "game-management": [
        "NN"
    ], 
    "spandrels": [
        "NNS"
    ], 
    "SS": [
        "NNP"
    ], 
    "on-again-off-again": [
        "JJ"
    ], 
    "Blumberg": [
        "NNP"
    ], 
    "SP": [
        "NNP"
    ], 
    "SW": [
        "NNP"
    ], 
    "anti-airline": [
        "NN"
    ], 
    "SK": [
        "NNP"
    ], 
    "FELLOWSHIP": [
        "NN"
    ], 
    "SH": [
        "NN", 
        "NNP"
    ], 
    "SO": [
        "RB"
    ], 
    "budgets": [
        "NNS"
    ], 
    "SC": [
        "NNP"
    ], 
    "SA": [
        "NNP"
    ], 
    "self-conscious": [
        "JJ"
    ], 
    "SE": [
        "NNP"
    ], 
    "SD": [
        "NNP"
    ], 
    "Bitten": [
        "VBN"
    ], 
    "IBJ": [
        "NNP"
    ], 
    "persists": [
        "VBZ"
    ], 
    "cubist": [
        "JJ"
    ], 
    "IBM": [
        "NNP", 
        "NN"
    ], 
    "unconcealed": [
        "VBN"
    ], 
    "IBC": [
        "NNP"
    ], 
    "Finberg": [
        "NNP"
    ], 
    "black-draped": [
        "JJ"
    ], 
    "quartets": [
        "NNS"
    ], 
    "Innocent": [
        "JJ"
    ], 
    "Cellist": [
        "NNP"
    ], 
    "Signers": [
        "NNS"
    ], 
    "IBT": [
        "NNP"
    ], 
    "cubism": [
        "NN"
    ], 
    "overcharging": [
        "VBG"
    ], 
    "stymie": [
        "VB"
    ], 
    "surpassed": [
        "VBN", 
        "VBD"
    ], 
    "dismembering": [
        "VBG"
    ], 
    "individualistic": [
        "JJ"
    ], 
    "Brahm": [
        "NNP"
    ], 
    "reject": [
        "VB", 
        "VBP"
    ], 
    "surpasses": [
        "VBZ"
    ], 
    "Falb": [
        "NNP"
    ], 
    "Alcorn": [
        "NNP"
    ], 
    "Lower": [
        "JJR", 
        "NNP"
    ], 
    "Microorganisms": [
        "NNS"
    ], 
    "desisted": [
        "VBD"
    ], 
    "purring": [
        "VBG", 
        "NN"
    ], 
    "compulsory": [
        "JJ"
    ], 
    "Sumat": [
        "NNP"
    ], 
    "criticize": [
        "VB", 
        "VBP"
    ], 
    "Schellke": [
        "NNP"
    ], 
    "Slote": [
        "NNP"
    ], 
    "embark": [
        "VB", 
        "VBP"
    ], 
    "anytime": [
        "RB"
    ], 
    "roommates": [
        "NNS"
    ], 
    "chopsticks": [
        "NNS"
    ], 
    "Euthanasia": [
        "NN"
    ], 
    "Marathon": [
        "NNP"
    ], 
    "ghostbusters": [
        "NNS"
    ], 
    "world-affairs": [
        "NNS"
    ], 
    "groundup": [
        "JJ"
    ], 
    "networking": [
        "NN", 
        "VBG"
    ], 
    "Cholet": [
        "NNP"
    ], 
    "Bedouins": [
        "NNS"
    ], 
    "Definite": [
        "JJ"
    ], 
    "charities": [
        "NNS"
    ], 
    "Southbrook": [
        "NNP"
    ], 
    "lovebirds": [
        "NNS"
    ], 
    "sarcolemmal": [
        "JJ"
    ], 
    "southpaw": [
        "NN"
    ], 
    "Atlas": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "clarinet": [
        "NN"
    ], 
    "Confederacy": [
        "NNP", 
        "NN"
    ], 
    "Property-tax": [
        "JJ"
    ], 
    "may...": [
        ":"
    ], 
    "Pountain": [
        "NNP"
    ], 
    "miter": [
        "VB"
    ], 
    "Temptation": [
        "NN", 
        "NNP"
    ], 
    "Equibank": [
        "NNP"
    ], 
    "absence": [
        "NN"
    ], 
    "prowled": [
        "VBD"
    ], 
    "differed": [
        "VBD", 
        "VBN"
    ], 
    "rabble": [
        "NN"
    ], 
    "Tupolev": [
        "NNP"
    ], 
    "boastings": [
        "NNS"
    ], 
    "misalignment": [
        "NN"
    ], 
    "evening": [
        "NN", 
        "VBG"
    ], 
    "cable-television": [
        "NN"
    ], 
    "Intergroup": [
        "NNP"
    ], 
    "Hostess": [
        "NNP"
    ], 
    "slighter": [
        "JJR"
    ], 
    "musket": [
        "NN"
    ], 
    "Kwang": [
        "NNP"
    ], 
    "flatout": [
        "NN"
    ], 
    "Pre-Legislative": [
        "NNP"
    ], 
    "sexologist": [
        "NN"
    ], 
    "flashlight-type": [
        "JJ"
    ], 
    "fifth-largest": [
        "JJ"
    ], 
    "slighted": [
        "JJ", 
        "VBN"
    ], 
    "Incurably": [
        "RB"
    ], 
    "inflecting": [
        "VBG"
    ], 
    "impressionists": [
        "NNS"
    ], 
    "liquefied": [
        "VBN"
    ], 
    "obligates": [
        "VBZ"
    ], 
    "freebies": [
        "NNS"
    ], 
    "Suez": [
        "NNP"
    ], 
    "bless": [
        "VB"
    ], 
    "Quaid": [
        "NNP"
    ], 
    "disdaining": [
        "VBG"
    ], 
    "Elbaum": [
        "NNP"
    ], 
    "McNaughton": [
        "NNP"
    ], 
    "blest": [
        "VB", 
        "VBN"
    ], 
    "fairy": [
        "JJ", 
        "NN"
    ], 
    "obligated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "heavy": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "thrombi": [
        "NNS"
    ], 
    "transcribe": [
        "VB", 
        "VBP"
    ], 
    "gathering-in": [
        "NN"
    ], 
    "Tax": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "Gentleman": [
        "NN", 
        "NNP"
    ], 
    "Anat": [
        "NNP"
    ], 
    "ballistics": [
        "NNS"
    ], 
    "honest-to-Betsy": [
        "RB"
    ], 
    "Westridge": [
        "NNP"
    ], 
    "Fearon": [
        "NNP"
    ], 
    "four-element": [
        "JJ"
    ], 
    "heave": [
        "NN"
    ], 
    "anarchy": [
        "NN"
    ], 
    "processed-foods": [
        "JJ"
    ], 
    "Tad": [
        "NNP"
    ], 
    "Diethylstilbestrol": [
        "NN"
    ], 
    "jolly": [
        "JJ"
    ], 
    "Besher": [
        "NNP"
    ], 
    "shrivel": [
        "VB"
    ], 
    "reacquisition": [
        "NN"
    ], 
    "Serpentine": [
        "NNP"
    ], 
    "Town": [
        "NNP", 
        "NN"
    ], 
    "Rayfield": [
        "NNP"
    ], 
    "Storyboard": [
        "NNP"
    ], 
    "earns": [
        "VBZ"
    ], 
    "Manjucri": [
        "NNP"
    ], 
    "toiling": [
        "VBG", 
        "NN"
    ], 
    "Senese": [
        "NNP"
    ], 
    "Capitalincludes": [
        "NNS"
    ], 
    "hapless": [
        "JJ"
    ], 
    "Blend": [
        "VB"
    ], 
    "step-up": [
        "NN"
    ], 
    "Fantastic": [
        "JJ"
    ], 
    "broad-based": [
        "JJ"
    ], 
    "Sauvignon": [
        "NNP"
    ], 
    "Bros": [
        "NNP", 
        "NNPS"
    ], 
    "Broe": [
        "NNP"
    ], 
    "Brod": [
        "NNP"
    ], 
    "Feniger": [
        "NNP"
    ], 
    "Supplee": [
        "NNP"
    ], 
    "CNBC": [
        "NNP"
    ], 
    "Samba": [
        "NNP"
    ], 
    "Adds": [
        "VBZ", 
        "NNP"
    ], 
    "spitting": [
        "VBG", 
        "NN"
    ], 
    "quasi-recitative": [
        "JJ"
    ], 
    "Tatler": [
        "NNP"
    ], 
    "Hawksworth": [
        "NNP"
    ], 
    "Adde": [
        "NNP"
    ], 
    "effortless": [
        "JJ"
    ], 
    "visions": [
        "NNS", 
        "VBZ"
    ], 
    "equating": [
        "VBG"
    ], 
    "vote-begging": [
        "NN"
    ], 
    "obtainable": [
        "JJ"
    ], 
    "Grenville": [
        "NNP"
    ], 
    "DEAE-cellulose": [
        "NNP", 
        "NN"
    ], 
    "announcements": [
        "NNS"
    ], 
    "teamsters": [
        "NNS"
    ], 
    "fiddle": [
        "NN", 
        "VB"
    ], 
    "Dutil": [
        "NNP"
    ], 
    "Refuge": [
        "NNP"
    ], 
    "trapped": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Schroll": [
        "NNP"
    ], 
    "BRADSTREET": [
        "NNP"
    ], 
    "trapper": [
        "NN"
    ], 
    "French-Italian": [
        "JJ"
    ], 
    "Initiating": [
        "VBG"
    ], 
    "assaulted": [
        "VBD", 
        "VBN"
    ], 
    "skillfulness": [
        "NN"
    ], 
    "imperiled": [
        "VBN", 
        "JJ"
    ], 
    "clean-fuels": [
        "NNS"
    ], 
    "south-eastern": [
        "JJ"
    ], 
    "Dreamboat": [
        "NNP"
    ], 
    "gnawed": [
        "VBD"
    ], 
    "hesitating": [
        "VBG"
    ], 
    "Mahoganny": [
        "NNP"
    ], 
    "breadbasket": [
        "NN"
    ], 
    "garrison": [
        "NN", 
        "VB"
    ], 
    "Communities": [
        "NNPS", 
        "NNS"
    ], 
    "mooed": [
        "VBD"
    ], 
    "Beretta": [
        "NNP"
    ], 
    "phobia": [
        "NN"
    ], 
    "readapting": [
        "VBG"
    ], 
    "event-driven": [
        "JJ"
    ], 
    "footnote": [
        "NN"
    ], 
    "tearfully": [
        "RB"
    ], 
    "Mizuno": [
        "NNP"
    ], 
    "heaviest": [
        "JJS"
    ], 
    "deflationary": [
        "JJ"
    ], 
    "committment": [
        "NN"
    ], 
    "Late": [
        "RB", 
        "JJ", 
        "NNP"
    ], 
    "ogled": [
        "VBD", 
        "VBN"
    ], 
    "Window": [
        "NN"
    ], 
    "organs": [
        "NNS"
    ], 
    "boorish": [
        "JJ"
    ], 
    "adorns": [
        "VBZ"
    ], 
    "adrift": [
        "RB"
    ], 
    "Wetzler": [
        "NNP"
    ], 
    "Price": [
        "NNP", 
        "NN"
    ], 
    "itemized": [
        "VBN"
    ], 
    "Graduates": [
        "NNS"
    ], 
    "after-dinner": [
        "JJ"
    ], 
    "Swinburne": [
        "NNP"
    ], 
    "Focusing": [
        "VBG"
    ], 
    "Cruze": [
        "NNP"
    ], 
    "caliber": [
        "NN"
    ], 
    "Lucinda": [
        "NNP"
    ], 
    "Lookit": [
        "VB"
    ], 
    "Chief": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "money-back": [
        "JJ"
    ], 
    "Chien": [
        "NNP", 
        "FW"
    ], 
    "Schweitzer": [
        "NNP"
    ], 
    "Polygram": [
        "NNP"
    ], 
    "Killips": [
        "NNP"
    ], 
    "ballyhoo": [
        "NN"
    ], 
    "once-in-a-lifetime": [
        "JJ"
    ], 
    "Usinor": [
        "NNP"
    ], 
    "arising": [
        "VBG"
    ], 
    "Viscerally": [
        "RB"
    ], 
    "Nanjing": [
        "NNP"
    ], 
    "divestiture": [
        "NN"
    ], 
    "Chartered": [
        "NNP"
    ], 
    "ansuh": [
        "VB"
    ], 
    "velocity": [
        "NN"
    ], 
    "rechargeable": [
        "JJ"
    ], 
    "physics": [
        "NN", 
        "NNS"
    ], 
    "stalked": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "homefolk": [
        "NN"
    ], 
    "phenomenon": [
        "NN"
    ], 
    "hovered": [
        "VBD", 
        "VBN"
    ], 
    "gas-tax": [
        "NN"
    ], 
    "Wheaties": [
        "NNPS"
    ], 
    "church-going": [
        "JJ"
    ], 
    "beatniks": [
        "NNS"
    ], 
    "Johannesburg": [
        "NNP"
    ], 
    "Benin": [
        "NNP"
    ], 
    "heavens": [
        "NNS", 
        "UH"
    ], 
    "Venturi": [
        "NNP"
    ], 
    "ERISA": [
        "NNP"
    ], 
    "predilections": [
        "NNS"
    ], 
    "flattery": [
        "NN"
    ], 
    "Prednisone": [
        "NN"
    ], 
    "megabit": [
        "NN"
    ], 
    "Pittston": [
        "NNP"
    ], 
    "French": [
        "JJ", 
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "common-law-marriage": [
        "NN"
    ], 
    "Trustee": [
        "NNP"
    ], 
    "vomica": [
        "NN"
    ], 
    "ymg": [
        "NN"
    ], 
    "Office.": [
        "NNP"
    ], 
    "ten-minute": [
        "JJ"
    ], 
    "sanhedrin": [
        "NN"
    ], 
    "inner-ear": [
        "JJ"
    ], 
    "local-news": [
        "NN"
    ], 
    "Michelle": [
        "NNP", 
        "NN"
    ], 
    "FITC": [
        "NNP"
    ], 
    "retorts": [
        "NNS", 
        "VBZ"
    ], 
    "Uclaf": [
        "NNP"
    ], 
    "Greco": [
        "NNP"
    ], 
    "competing": [
        "VBG", 
        "JJ", 
        "VBG|JJ"
    ], 
    "boils": [
        "VBZ"
    ], 
    "Counselor": [
        "NNP"
    ], 
    "unburned": [
        "JJ"
    ], 
    "Oncogen": [
        "NNP"
    ], 
    "bone-loss": [
        "NN"
    ], 
    "Confucian": [
        "NNP", 
        "JJ"
    ], 
    "employer-paid": [
        "JJ"
    ], 
    "hypo": [
        "JJ"
    ], 
    "hype": [
        "NN"
    ], 
    "doctrinaire": [
        "JJ", 
        "NN"
    ], 
    "wriggled": [
        "VBD"
    ], 
    "Franck": [
        "NNP"
    ], 
    "howled": [
        "VBD"
    ], 
    "Paradox": [
        "NNP"
    ], 
    "Franco": [
        "NNP"
    ], 
    "drafted": [
        "VBN", 
        "VBD"
    ], 
    "locale": [
        "NN"
    ], 
    "Bridgewater": [
        "NNP"
    ], 
    "Kipp": [
        "NNP"
    ], 
    "Laramie": [
        "NNP"
    ], 
    "France": [
        "NNP"
    ], 
    "drenching": [
        "NN"
    ], 
    "Asbury": [
        "NNP"
    ], 
    "Gibbs": [
        "NNP"
    ], 
    "Mama": [
        "NNP", 
        "NN"
    ], 
    "portrait": [
        "NN"
    ], 
    "Poised": [
        "NNP"
    ], 
    "Goldenberg": [
        "NNP"
    ], 
    "Gibby": [
        "NNP"
    ], 
    "payroll-paring": [
        "JJ"
    ], 
    "locals": [
        "NNS"
    ], 
    "Brash": [
        "NNP"
    ], 
    "oldies": [
        "NNS"
    ], 
    "loud-voiced": [
        "JJ"
    ], 
    "tolls": [
        "NNS"
    ], 
    "falsify": [
        "VB"
    ], 
    "Realty": [
        "NNP"
    ], 
    "Tsuruo": [
        "NNP"
    ], 
    "Brass": [
        "NNP"
    ], 
    "FREED": [
        "VBD"
    ], 
    "five-row": [
        "JJ"
    ], 
    "Rodolfo": [
        "NNP"
    ], 
    "Kercheval": [
        "NNP"
    ], 
    "Smelov": [
        "NNP"
    ], 
    "Rippe": [
        "NNP"
    ], 
    "disintegrative": [
        "JJ"
    ], 
    "Redundant": [
        "NNP"
    ], 
    "Elise": [
        "NNP"
    ], 
    "arrears": [
        "NNS"
    ], 
    "abruptly": [
        "RB"
    ], 
    "hoisted": [
        "VBN", 
        "VBD"
    ], 
    "collaborators": [
        "NNS"
    ], 
    "Vadas": [
        "NNP"
    ], 
    "Vadar": [
        "NNP"
    ], 
    "grass-covered": [
        "JJ"
    ], 
    "memorized": [
        "VBN", 
        "VBD"
    ], 
    "higher-cost": [
        "JJ", 
        "JJR"
    ], 
    "drug-store": [
        "NN"
    ], 
    "minorities": [
        "NNS"
    ], 
    "TOURISM": [
        "NN"
    ], 
    "mausoleum": [
        "NN"
    ], 
    "Admirably": [
        "RB"
    ], 
    "SHEDDING": [
        "VBG"
    ], 
    "Mailloux": [
        "NNP"
    ], 
    "Compaq": [
        "NNP", 
        "VB"
    ], 
    "Koerner": [
        "NNP"
    ], 
    "Bader": [
        "NNP"
    ], 
    "Rothshchild": [
        "NNP"
    ], 
    "proton": [
        "NN"
    ], 
    "non-exempt": [
        "JJ"
    ], 
    "Crack": [
        "NN"
    ], 
    "Sullam": [
        "NNP"
    ], 
    "Lookout": [
        "NNP"
    ], 
    "Bracknell": [
        "NNP"
    ], 
    "three-building": [
        "JJ"
    ], 
    "BRITANNICA": [
        "NNP"
    ], 
    "Protection": [
        "NNP", 
        "NN"
    ], 
    "Runiewicz": [
        "NNP"
    ], 
    "Bogdan": [
        "NNP"
    ], 
    "Gott": [
        "FW"
    ], 
    "ganglion": [
        "NN"
    ], 
    "Lenders": [
        "NNS", 
        "NNP"
    ], 
    "Harbison": [
        "NNP"
    ], 
    "enroll": [
        "VB", 
        "VBP"
    ], 
    "N": [
        "NN", 
        "NNP"
    ], 
    "Gilt": [
        "NNP"
    ], 
    "Switch": [
        "NN"
    ], 
    "Donna": [
        "NNP"
    ], 
    "confusions": [
        "NNS"
    ], 
    "Hassan": [
        "NNP"
    ], 
    "F-major": [
        "NN"
    ], 
    "furrow": [
        "NN"
    ], 
    "floating-point": [
        "JJ", 
        "NN"
    ], 
    "substantiates": [
        "VBZ"
    ], 
    "Supplement": [
        "NNP", 
        "NN"
    ], 
    "accidently": [
        "RB"
    ], 
    "Asmara": [
        "NNP"
    ], 
    "LifeSavers": [
        "NNPS", 
        "NNP"
    ], 
    "Qatar": [
        "NNP"
    ], 
    "procedurally": [
        "RB"
    ], 
    "embroidered": [
        "VBN"
    ], 
    "Pulaski": [
        "NNP"
    ], 
    "high-rolling": [
        "JJ"
    ], 
    "industrial-product": [
        "NN"
    ], 
    "Delving": [
        "VBG"
    ], 
    "Bonwit": [
        "NNP"
    ], 
    "Eyes": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "grant": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Luke": [
        "NNP"
    ], 
    "Lafite-Rothschild": [
        "NNP"
    ], 
    "Masks": [
        "VBZ"
    ], 
    "makeshift": [
        "JJ", 
        "NN"
    ], 
    "paid-up": [
        "JJ"
    ], 
    "vulnerable": [
        "JJ"
    ], 
    "grand": [
        "JJ"
    ], 
    "well-hit": [
        "JJ"
    ], 
    "throughput": [
        "NN"
    ], 
    "Lonski": [
        "NNP"
    ], 
    "composition": [
        "NN"
    ], 
    "pleadings": [
        "NNS"
    ], 
    "Faith": [
        "NNP", 
        "NN"
    ], 
    "classmates": [
        "NNS"
    ], 
    "fatty": [
        "JJ"
    ], 
    "indispensability": [
        "NN"
    ], 
    "Seated": [
        "VBN"
    ], 
    "soberly": [
        "RB"
    ], 
    "Bleus": [
        "NNP"
    ], 
    "calcification": [
        "NN"
    ], 
    "Euro-beach": [
        "NN", 
        "JJ"
    ], 
    "Archie": [
        "NNP"
    ], 
    "calibrates": [
        "VBZ"
    ], 
    "sniggered": [
        "VBD"
    ], 
    "Rhenish": [
        "JJ"
    ], 
    "Lupel": [
        "NNP"
    ], 
    "MX": [
        "NNP"
    ], 
    "eighty-nine": [
        "NN"
    ], 
    "synopsis": [
        "NN"
    ], 
    "calibrated": [
        "VBN", 
        "VBD"
    ], 
    "share-trading": [
        "NN"
    ], 
    "influx": [
        "NN"
    ], 
    "mobs": [
        "NNS"
    ], 
    "Schwinn": [
        "NNP"
    ], 
    "POLICY": [
        "NNP"
    ], 
    "Burleson": [
        "NNP"
    ], 
    "settlements": [
        "NNS"
    ], 
    "Grenadian": [
        "JJ"
    ], 
    "reviewed": [
        "VBN", 
        "VBD"
    ], 
    "devastatingly": [
        "RB"
    ], 
    "public-stock": [
        "NN"
    ], 
    "Falconbridge": [
        "NNP"
    ], 
    "Reconstruction": [
        "NNP"
    ], 
    "reviewer": [
        "NN"
    ], 
    "Durables": [
        "NNPS"
    ], 
    "PIK": [
        "NNP"
    ], 
    "informal": [
        "JJ"
    ], 
    "PIC": [
        "NNP"
    ], 
    "shortcut": [
        "NN"
    ], 
    "representational": [
        "JJ", 
        "NN"
    ], 
    "cherries": [
        "NNS"
    ], 
    "questioned": [
        "VBD", 
        "VBN"
    ], 
    "Berkeley": [
        "NNP", 
        "NN"
    ], 
    "PIR": [
        "NNP"
    ], 
    "Spouse": [
        "NN"
    ], 
    "double-hamburger": [
        "NN"
    ], 
    "reemphasizes": [
        "VBZ"
    ], 
    "nymphomaniacs": [
        "NNS"
    ], 
    "capacities": [
        "NNS"
    ], 
    "cruise-ship": [
        "NN", 
        "JJ"
    ], 
    "payment...": [
        ":"
    ], 
    "Antigua": [
        "NNP"
    ], 
    "dearly": [
        "RB"
    ], 
    "tax-accounting": [
        "NN"
    ], 
    "preparatory": [
        "JJ"
    ], 
    "pre-sentencing": [
        "JJ"
    ], 
    "ponds": [
        "NNS"
    ], 
    "Kathie": [
        "NNP"
    ], 
    "maltreatment": [
        "NN"
    ], 
    "helter-skelter": [
        "JJ"
    ], 
    "Systemic": [
        "JJ"
    ], 
    "Personages": [
        "NNS"
    ], 
    "softness": [
        "NN"
    ], 
    "LABORATORIES": [
        "NNP"
    ], 
    "Crip": [
        "NNP"
    ], 
    "terminology": [
        "NN"
    ], 
    "Cris": [
        "NNP"
    ], 
    "F-16s": [
        "NNPS"
    ], 
    "sketch": [
        "NN", 
        "VB"
    ], 
    "Push-ups": [
        "NNS"
    ], 
    "Dancing": [
        "NN"
    ], 
    "Pattern": [
        "NN"
    ], 
    "still-healthy": [
        "JJ"
    ], 
    "Myself": [
        "NNP"
    ], 
    "yolk": [
        "NN"
    ], 
    "lips": [
        "NNS"
    ], 
    "towards": [
        "IN"
    ], 
    "plumbers": [
        "NNS"
    ], 
    "Laos": [
        "NNP"
    ], 
    "callousness": [
        "NN"
    ], 
    "Futures-related": [
        "JJ"
    ], 
    "Manifatture": [
        "NNP"
    ], 
    "MorningStar": [
        "NNP"
    ], 
    "dilapidated": [
        "JJ", 
        "VBN"
    ], 
    "manufacturing-sector": [
        "NN"
    ], 
    "Preparations": [
        "NNP", 
        "NNS"
    ], 
    "Aquacutie": [
        "NNP"
    ], 
    "competitions": [
        "NNS"
    ], 
    "intramuscularly": [
        "RB"
    ], 
    "Davidson": [
        "NNP"
    ], 
    "Sainted": [
        "NNP"
    ], 
    "Southport": [
        "NNP"
    ], 
    "Protestant": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Parliamentarians": [
        "NNP"
    ], 
    "benefactor": [
        "NN"
    ], 
    "undergone": [
        "VBN"
    ], 
    "Biologics": [
        "NNP"
    ], 
    "quota": [
        "NN"
    ], 
    "multivalent": [
        "JJ"
    ], 
    "Biologico": [
        "NNP"
    ], 
    "assists": [
        "VBZ", 
        "NNS"
    ], 
    "viewpoints": [
        "NNS"
    ], 
    "infusion-therapy": [
        "JJ"
    ], 
    "repressions": [
        "NNS"
    ], 
    "Strategies": [
        "NNS", 
        "NNP"
    ], 
    "Swallow": [
        "NNP"
    ], 
    "offside": [
        "NN"
    ], 
    "real-estate-investment": [
        "NN"
    ], 
    "BUYERS": [
        "NNS"
    ], 
    "Taylor": [
        "NNP", 
        "NN"
    ], 
    "anti-Sony": [
        "JJ"
    ], 
    "lyophilized": [
        "VBN"
    ], 
    "mentalities": [
        "NNS"
    ], 
    "Scam": [
        "NN"
    ], 
    "silence": [
        "NN", 
        "VB"
    ], 
    "shavers": [
        "NNS"
    ], 
    "Thi": [
        "NNP"
    ], 
    "not-so-new": [
        "JJ"
    ], 
    "unimpaired": [
        "JJ"
    ], 
    "BATTLE": [
        "NN"
    ], 
    "presupposes": [
        "VBZ"
    ], 
    "Hennessey": [
        "NNP"
    ], 
    "reworked": [
        "VBD", 
        "VBN"
    ], 
    "Evangelicalism": [
        "NNP"
    ], 
    "Norman": [
        "NNP"
    ], 
    "HISPANIC": [
        "JJ"
    ], 
    "placing": [
        "VBG", 
        "NN"
    ], 
    "Kitty": [
        "NNP", 
        "NN"
    ], 
    "visas": [
        "NNS"
    ], 
    "Koch": [
        "NNP"
    ], 
    "unlashed": [
        "VBD"
    ], 
    "Benackova": [
        "NNP"
    ], 
    "Kitti": [
        "NNP"
    ], 
    "opposed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "uncomplaining": [
        "JJ"
    ], 
    "withholding": [
        "NN", 
        "VBG"
    ], 
    "olestra": [
        "NN"
    ], 
    "Secom": [
        "NNP"
    ], 
    "healthful": [
        "JJ"
    ], 
    "Perpetual": [
        "JJ"
    ], 
    "Dakotas": [
        "NNPS"
    ], 
    "tragically": [
        "RB"
    ], 
    "Howe": [
        "NNP"
    ], 
    "investment-banking": [
        "NN", 
        "JJ"
    ], 
    "liberalizing": [
        "VBG"
    ], 
    "Howl": [
        "NNP"
    ], 
    "livability": [
        "NN"
    ], 
    "Rafsanjani": [
        "NNP"
    ], 
    "viciously": [
        "RB"
    ], 
    "limpid": [
        "JJ"
    ], 
    "Okayama": [
        "NNP"
    ], 
    "purloined": [
        "VBN"
    ], 
    "chomp": [
        "NN", 
        "VBP"
    ], 
    "familar": [
        "JJ"
    ], 
    "Newspeak": [
        "NNP"
    ], 
    "graham-flour-based": [
        "JJ"
    ], 
    "MacroChem": [
        "NNP"
    ], 
    "munis": [
        "NNS"
    ], 
    "On-to-Spokane": [
        "NNP"
    ], 
    "Marella": [
        "NNP"
    ], 
    "similar": [
        "JJ"
    ], 
    "CBS-K": [
        "NNP"
    ], 
    "hesitantly": [
        "RB"
    ], 
    "ordered": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Lauder": [
        "NNP"
    ], 
    "metalsmiths": [
        "NNS"
    ], 
    "interventions": [
        "NNS"
    ], 
    "arm-levitation": [
        "NN"
    ], 
    "criminal-abortion": [
        "JJ"
    ], 
    "Edward": [
        "NNP"
    ], 
    "buckle-on": [
        "JJ"
    ], 
    "consoled": [
        "VBD", 
        "VBN"
    ], 
    "aeronautical": [
        "JJ"
    ], 
    "dashed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "fears": [
        "NNS", 
        "VBZ"
    ], 
    "application": [
        "NN"
    ], 
    "Wash.": [
        "NNP"
    ], 
    "department": [
        "NN"
    ], 
    "aprons": [
        "NNS"
    ], 
    "feare": [
        "NN"
    ], 
    "dashes": [
        "NNS", 
        "VBZ"
    ], 
    "Benninger": [
        "NNP"
    ], 
    "smiles": [
        "NNS", 
        "VBZ"
    ], 
    "Exterminatin": [
        "VBG"
    ], 
    "securitiess": [
        "NN"
    ], 
    "Stanford": [
        "NNP", 
        "NN"
    ], 
    "Sentry": [
        "NNP"
    ], 
    "Cott": [
        "NNP"
    ], 
    "Sizwe": [
        "NNP"
    ], 
    "hot-slough": [
        "JJ"
    ], 
    "assayed": [
        "VBN"
    ], 
    "Sentra": [
        "NNP"
    ], 
    "afterglow": [
        "NN"
    ], 
    "graphically": [
        "RB"
    ], 
    "smiled": [
        "VBD", 
        "VBN"
    ], 
    "banalization": [
        "NN"
    ], 
    "Dauchy": [
        "NNP"
    ], 
    "approving": [
        "VBG"
    ], 
    "Roundtable": [
        "NNP"
    ], 
    "aesthetically": [
        "RB"
    ], 
    "Baucus": [
        "NNP"
    ], 
    "correlated": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "syntactical": [
        "JJ"
    ], 
    "resolving": [
        "VBG"
    ], 
    "Perches": [
        "NNP"
    ], 
    "Corrette": [
        "NNP"
    ], 
    "England-born": [
        "NNP|VBN"
    ], 
    "bribe": [
        "NN", 
        "VB"
    ], 
    "Perched": [
        "VBN"
    ], 
    "Soviets": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "infringing": [
        "VBG"
    ], 
    "Apparently": [
        "RB"
    ], 
    "Levinger": [
        "NNP"
    ], 
    "current-carrying": [
        "JJ"
    ], 
    "Bengal": [
        "NNP"
    ], 
    "No-Smoking": [
        "NNP"
    ], 
    "lob-scuse": [
        "NN"
    ], 
    "FALL": [
        "NN"
    ], 
    "Mortality": [
        "NN"
    ], 
    "compact": [
        "JJ", 
        "NN", 
        "NN|JJ"
    ], 
    "GABLE": [
        "NNP"
    ], 
    "Parent": [
        "NNP", 
        "NN"
    ], 
    "insistent": [
        "JJ"
    ], 
    "Nod": [
        "NNP"
    ], 
    "Nob": [
        "NNP"
    ], 
    "uninformative": [
        "JJ"
    ], 
    "Father-God": [
        "NNP"
    ], 
    "anti-communist": [
        "JJ"
    ], 
    "Not": [
        "RB", 
        "NNP", 
        "DT"
    ], 
    "Nov": [
        "NNP"
    ], 
    "Now": [
        "RB", 
        "NNP"
    ], 
    "Nor": [
        "CC"
    ], 
    "unabridged": [
        "JJ"
    ], 
    "rebounding": [
        "VBG"
    ], 
    "Celebrity": [
        "NNP", 
        "NN"
    ], 
    "assuming": [
        "VBG"
    ], 
    "acreage": [
        "NN"
    ], 
    "Donut": [
        "NNP"
    ], 
    "Elbow": [
        "NN", 
        "NNP"
    ], 
    "yourselves": [
        "PRP"
    ], 
    "Curb": [
        "VB"
    ], 
    "No.": [
        "NN", 
        "JJ", 
        "VB", 
        "NNP"
    ], 
    "Organification": [
        "NN"
    ], 
    "meticulously": [
        "RB"
    ], 
    "browny-haired": [
        "JJ"
    ], 
    "booze": [
        "NN"
    ], 
    "Mogul": [
        "NNP"
    ], 
    "Yiddish": [
        "NNP", 
        "JJ"
    ], 
    "Antibody": [
        "NN"
    ], 
    "sedentary": [
        "JJ"
    ], 
    "enforce": [
        "VB", 
        "VBP"
    ], 
    "Antietam": [
        "NNP"
    ], 
    "FHLBB": [
        "NNP"
    ], 
    "overfunded": [
        "VBN"
    ], 
    "jump": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "notwithstanding": [
        "IN", 
        "RB"
    ], 
    "waitress": [
        "NN"
    ], 
    "Gris": [
        "NNP"
    ], 
    "Ramseier": [
        "NNP"
    ], 
    "Milanoff": [
        "NNP"
    ], 
    "Fahey": [
        "NNP"
    ], 
    "anti-party": [
        "JJ"
    ], 
    "Kutney": [
        "NNP"
    ], 
    "Isacsson": [
        "NNP"
    ], 
    "conning": [
        "VBG"
    ], 
    "Grid": [
        "NNP"
    ], 
    "Survived": [
        "VBD"
    ], 
    "Hibler": [
        "NNP"
    ], 
    "houseful": [
        "NN"
    ], 
    "upsetting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "McNealy": [
        "NNP"
    ], 
    "fifteenth": [
        "JJ"
    ], 
    "Hershel": [
        "NNP"
    ], 
    "Conducted": [
        "VBN"
    ], 
    "just-rejuvenated": [
        "JJ"
    ], 
    "Skipjack": [
        "NNP"
    ], 
    "Palace": [
        "NNP", 
        "NN"
    ], 
    "Tequila": [
        "NNP"
    ], 
    "Back": [
        "RB", 
        "NN", 
        "RP", 
        "NNP", 
        "VBP", 
        "JJ"
    ], 
    "Bach": [
        "NNP", 
        "NN"
    ], 
    "ever-anxious": [
        "JJ"
    ], 
    "avaricious": [
        "JJ"
    ], 
    "automotive-product": [
        "NN"
    ], 
    "Kermit": [
        "NNP"
    ], 
    "Organizational": [
        "JJ"
    ], 
    "strong-arm": [
        "JJ"
    ], 
    "patents": [
        "NNS"
    ], 
    "Temperatures": [
        "NNS"
    ], 
    "hilltops": [
        "NNS"
    ], 
    "Oilers": [
        "NNP", 
        "NNPS"
    ], 
    "foresee": [
        "VBP", 
        "VB"
    ], 
    "Krishnamurthy": [
        "NNP"
    ], 
    "adroitness": [
        "NN"
    ], 
    "Assistance": [
        "NNP", 
        "NN"
    ], 
    "manage": [
        "VB", 
        "VBP"
    ], 
    "Pankyo": [
        "NNP"
    ], 
    "all-white": [
        "JJ"
    ], 
    "Loyalist": [
        "JJ"
    ], 
    "Rowland-Morin": [
        "NNP"
    ], 
    "Lanza": [
        "NNP"
    ], 
    "biophysical": [
        "JJ"
    ], 
    "semi-sterile": [
        "JJ"
    ], 
    "Rich-affiliated": [
        "JJ"
    ], 
    "Discontinue": [
        "VB"
    ], 
    "trivializing": [
        "VBG"
    ], 
    "camera": [
        "NN"
    ], 
    "Averae": [
        "NNP"
    ], 
    "Png": [
        "NNP"
    ], 
    "Markus": [
        "NNP"
    ], 
    "salvages": [
        "VBZ"
    ], 
    "Kumagai-Gumi": [
        "NNP"
    ], 
    "Oakar": [
        "NNP"
    ], 
    "Basking": [
        "NNP"
    ], 
    "fifteenth-century": [
        "JJ"
    ], 
    "salvaged": [
        "VBN"
    ], 
    "boards": [
        "NNS", 
        "VBZ"
    ], 
    "parachute": [
        "NN", 
        "VB"
    ], 
    "techno-managerial": [
        "JJ"
    ], 
    "laendler": [
        "JJ"
    ], 
    "meek": [
        "JJ"
    ], 
    "computer-products": [
        "NNS", 
        "JJ"
    ], 
    "averaged": [
        "VBD", 
        "VBN"
    ], 
    "subrogation": [
        "NN"
    ], 
    "test-prep": [
        "JJ"
    ], 
    "longhaul": [
        "NN"
    ], 
    "Generation": [
        "NNP", 
        "NN"
    ], 
    "VIII": [
        "NNP"
    ], 
    "servants": [
        "NNS"
    ], 
    "Caravan": [
        "NNP"
    ], 
    "meet": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "averages": [
        "NNS", 
        "VBZ"
    ], 
    "certainty": [
        "NN"
    ], 
    "Israeli": [
        "JJ", 
        "NNP"
    ], 
    "links": [
        "NNS", 
        "VBZ", 
        "NN"
    ], 
    "money-losing": [
        "JJ"
    ], 
    "radioing": [
        "VBG"
    ], 
    "chinless": [
        "JJ"
    ], 
    "week-end": [
        "NN"
    ], 
    "synchronism": [
        "NN"
    ], 
    "Politics-ridden": [
        "JJ"
    ], 
    "pulling": [
        "VBG"
    ], 
    "intuitions": [
        "NNS"
    ], 
    "peelback": [
        "JJ"
    ], 
    "cave-men": [
        "NNS"
    ], 
    "Wakabayashi": [
        "NNP"
    ], 
    "embodiment": [
        "NN"
    ], 
    "Deeper": [
        "JJR"
    ], 
    "cratering": [
        "VBG"
    ], 
    "well-served": [
        "JJ"
    ], 
    "waterproof": [
        "NN"
    ], 
    "Beast": [
        "NNP"
    ], 
    "Passaic-Clifton": [
        "NNP"
    ], 
    "sentiments": [
        "NNS"
    ], 
    "Reservation": [
        "NNP", 
        "NN"
    ], 
    "instinctively": [
        "RB"
    ], 
    "listens": [
        "VBZ"
    ], 
    "MiniScribe": [
        "NNP"
    ], 
    "filament": [
        "NN"
    ], 
    "embellished": [
        "VBN"
    ], 
    "Baubles": [
        "NNPS"
    ], 
    "ultrasonically": [
        "RB"
    ], 
    "outdid": [
        "VBD"
    ], 
    "Heilbron": [
        "NNP"
    ], 
    "Mrs": [
        "NNP"
    ], 
    "Roman": [
        "NNP", 
        "JJ", 
        "NNPS"
    ], 
    "bibliographical": [
        "JJ"
    ], 
    "Allou": [
        "NNP"
    ], 
    "Allow": [
        "VB"
    ], 
    "Alloy": [
        "NN"
    ], 
    "Wheeling": [
        "NNP"
    ], 
    "Makin": [
        "NNP", 
        "VBG"
    ], 
    "scoop": [
        "NN", 
        "VB"
    ], 
    "Guard": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "encyclopedia": [
        "NN"
    ], 
    "desensitized": [
        "VBN"
    ], 
    "encyclopedic": [
        "JJ"
    ], 
    "sambuca": [
        "NN"
    ], 
    "estate-freeze": [
        "JJ"
    ], 
    "Skelly": [
        "NNP"
    ], 
    "Baltimorean": [
        "NNP"
    ], 
    "Bapepam": [
        "NNP"
    ], 
    "employee-health": [
        "NN"
    ], 
    "carnivores": [
        "NNS"
    ], 
    "interceptor": [
        "NN"
    ], 
    "Favre": [
        "NNP"
    ], 
    "box-office": [
        "NN"
    ], 
    "RAF": [
        "NNP"
    ], 
    "Multiple": [
        "NNP", 
        "JJ"
    ], 
    "equanimity": [
        "NN"
    ], 
    "EASTERN": [
        "NNP"
    ], 
    "Telegraphers": [
        "NNS", 
        "NNPS"
    ], 
    "subroutines": [
        "NNS"
    ], 
    "Baxley": [
        "NNP"
    ], 
    "gymnasts": [
        "NNS"
    ], 
    "Multiply": [
        "VB"
    ], 
    "RAX": [
        "NNP"
    ], 
    "overflights": [
        "NNS"
    ], 
    "popularly": [
        "RB"
    ], 
    "wells": [
        "NNS"
    ], 
    "Loser": [
        "JJ"
    ], 
    "Loses": [
        "VBZ"
    ], 
    "J.E.": [
        "NNP"
    ], 
    "Lewco": [
        "NNP"
    ], 
    "sinfulness": [
        "NN"
    ], 
    "Losec": [
        "NNP"
    ], 
    "unnaturalness": [
        "NN"
    ], 
    "Mendelsohn": [
        "NNP"
    ], 
    "university": [
        "NN"
    ], 
    "Montpelier": [
        "NNP"
    ], 
    "Bellman": [
        "NNP"
    ], 
    "Telemunchen": [
        "NNP"
    ], 
    "tax-based": [
        "JJ"
    ], 
    "slide": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "firings": [
        "NNS"
    ], 
    "Pesce": [
        "NNP"
    ], 
    "drug-delivery": [
        "JJ"
    ], 
    "still-ravaged": [
        "JJ"
    ], 
    "Dream-Sweetmite": [
        "NNP"
    ], 
    "six-minute": [
        "JJ"
    ], 
    "Statistics": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "attachments": [
        "NNS"
    ], 
    "Borges": [
        "NNP"
    ], 
    "Bertrand": [
        "NNP"
    ], 
    "witha": [
        "NN"
    ], 
    "OCC": [
        "NNP"
    ], 
    "constitute": [
        "VBP", 
        "VB"
    ], 
    "buccolic": [
        "JJ"
    ], 
    "psychopomp": [
        "NN"
    ], 
    "Oils": [
        "NNS"
    ], 
    "OCR": [
        "NNP"
    ], 
    "special": [
        "JJ", 
        "NN"
    ], 
    "littered": [
        "VBN", 
        "VBD"
    ], 
    "special-projects": [
        "JJ"
    ], 
    "Parioli": [
        "NNP"
    ], 
    "vestibule": [
        "NN"
    ], 
    "Fermate": [
        "NNP"
    ], 
    "obsessive": [
        "JJ", 
        "NN"
    ], 
    "Anderlini": [
        "NNP"
    ], 
    "Crosbie": [
        "NNP"
    ], 
    "hopscotch": [
        "NN"
    ], 
    "full-season": [
        "JJ"
    ], 
    "Gromov": [
        "NNP"
    ], 
    "darkly": [
        "RB"
    ], 
    "non-Cocom": [
        "JJ"
    ], 
    "Daiwa": [
        "NNP", 
        "NN"
    ], 
    "Relentlessly": [
        "RB"
    ], 
    "improvisational": [
        "JJ"
    ], 
    "Sentor": [
        "NNP"
    ], 
    "Meurons": [
        "NNS"
    ], 
    "delegated": [
        "VBN"
    ], 
    "tulle": [
        "NN"
    ], 
    "Drawing": [
        "VBG", 
        "NNP", 
        "NN"
    ], 
    "resumed": [
        "VBD", 
        "VBN"
    ], 
    "Bombay": [
        "NNP", 
        "NN"
    ], 
    "Cell-free": [
        "JJ"
    ], 
    "Owen": [
        "NNP"
    ], 
    "near-recession": [
        "NN"
    ], 
    "timer": [
        "NN"
    ], 
    "times": [
        "NNS", 
        "VBZ", 
        "CC", 
        "RB"
    ], 
    "Telxon": [
        "NNP"
    ], 
    "Boesky-greed-is-good": [
        "JJ"
    ], 
    "isotropic": [
        "JJ"
    ], 
    "cash-hungry": [
        "JJ"
    ], 
    "resumes": [
        "VBZ", 
        "NNS"
    ], 
    "timed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Lustgarten": [
        "NNP"
    ], 
    "reassessment": [
        "NN"
    ], 
    "Lanier": [
        "NNP"
    ], 
    "Iaciofano": [
        "NNP"
    ], 
    "Merry-go-round": [
        "NNP"
    ], 
    "confuse": [
        "VB", 
        "VBP"
    ], 
    "cramp": [
        "NN"
    ], 
    "unsupported": [
        "JJ"
    ], 
    "French-Canadians": [
        "NNPS"
    ], 
    "bitch": [
        "NN", 
        "VB"
    ], 
    "man-in-the-moon": [
        "JJ"
    ], 
    "Pioneering": [
        "NNP"
    ], 
    "Shann": [
        "NNP"
    ], 
    "Newtonian": [
        "JJ"
    ], 
    "Contracts": [
        "NNS", 
        "NNPS"
    ], 
    "Fran": [
        "NNP"
    ], 
    "Tshombe": [
        "NNP"
    ], 
    "wrapper": [
        "NN"
    ], 
    "Dunker": [
        "NNP"
    ], 
    "Pilko": [
        "NNP"
    ], 
    "Dunkel": [
        "NNP"
    ], 
    "minisupercomputers": [
        "NNS"
    ], 
    "goings-on": [
        "NNS"
    ], 
    "Weill\\/Bertolt": [
        "NNP"
    ], 
    "hard-nosed": [
        "JJ"
    ], 
    "Fray": [
        "NN"
    ], 
    "land-disposal": [
        "NN"
    ], 
    "weepers": [
        "NNS"
    ], 
    "Volney": [
        "NNP"
    ], 
    "crackle": [
        "NN", 
        "VBP"
    ], 
    "innovate": [
        "VB"
    ], 
    "surfing": [
        "NN"
    ], 
    "secco": [
        "NN", 
        "FW"
    ], 
    "objectification": [
        "NN"
    ], 
    "newlywed": [
        "NN"
    ], 
    "RESEARCHERS": [
        "NNS"
    ], 
    "Geary": [
        "NNP"
    ], 
    "catered": [
        "VBD", 
        "JJ"
    ], 
    "bloodiest": [
        "JJS"
    ], 
    "bloat": [
        "NN"
    ], 
    "conscious": [
        "JJ", 
        "NN"
    ], 
    "Malcom": [
        "NNP"
    ], 
    "sidetracked": [
        "VBD"
    ], 
    "Macmillan": [
        "NNP"
    ], 
    "caterer": [
        "NN"
    ], 
    "insignificance": [
        "NN"
    ], 
    "Asti": [
        "NNP"
    ], 
    "enforced": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Asta": [
        "NNP"
    ], 
    "Flying": [
        "NNP", 
        "VBG"
    ], 
    "enforcer": [
        "NN"
    ], 
    "enforces": [
        "VBZ"
    ], 
    "Interview": [
        "NNP", 
        "VB"
    ], 
    "EVEREX": [
        "NNP"
    ], 
    "metaphysics": [
        "NNS", 
        "NN"
    ], 
    "Falstaff": [
        "NNP"
    ], 
    "Administrator": [
        "NNP"
    ], 
    "Solemnly": [
        "RB"
    ], 
    "Parcel": [
        "NNP"
    ], 
    "rosier": [
        "JJR", 
        "RBR"
    ], 
    "thunders": [
        "VBZ"
    ], 
    "Bowery": [
        "NNP"
    ], 
    "pushups": [
        "NNS"
    ], 
    "battles": [
        "NNS", 
        "VBZ"
    ], 
    "Schuman": [
        "NNP"
    ], 
    "grounding": [
        "VBG", 
        "NN"
    ], 
    "battled": [
        "VBD", 
        "VBN"
    ], 
    "Nokomis": [
        "NNP"
    ], 
    "Morgenthau": [
        "NNP"
    ], 
    "mountaintop": [
        "NN"
    ], 
    "polka-dotted": [
        "JJ"
    ], 
    "blades": [
        "NNS"
    ], 
    "venereal": [
        "JJ"
    ], 
    "swollen": [
        "JJ", 
        "VBN"
    ], 
    "acupuncturist": [
        "NN"
    ], 
    "regi": [
        "FW"
    ], 
    "development-aid": [
        "NN"
    ], 
    "Geographic": [
        "NNP", 
        "JJ"
    ], 
    "Countin": [
        "VBG"
    ], 
    "quick-kill": [
        "JJ"
    ], 
    "Rescue": [
        "NNP", 
        "NN"
    ], 
    "Exceed": [
        "VBD"
    ], 
    "free-marketers": [
        "NNS"
    ], 
    "subtracted": [
        "VBN", 
        "VBD"
    ], 
    "Keiyo": [
        "NNP"
    ], 
    "Mold": [
        "NN"
    ], 
    "repeated": [
        "VBN", 
        "VBN|JJ", 
        "VBD", 
        "JJ"
    ], 
    "Fellow": [
        "NN", 
        "JJ", 
        "NNP"
    ], 
    "Rusting": [
        "VBG"
    ], 
    "Lavallade": [
        "NNP"
    ], 
    "skunk": [
        "NN"
    ], 
    "stationing": [
        "VBG"
    ], 
    "Lehn": [
        "NNP"
    ], 
    "sisters-in-law": [
        "NNS"
    ], 
    "Anthea": [
        "NNP"
    ], 
    "loadin": [
        "VBG"
    ], 
    "seclude": [
        "VB"
    ], 
    "Anthem": [
        "NNP"
    ], 
    "Belzec": [
        "NNP"
    ], 
    "halting": [
        "VBG", 
        "JJ"
    ], 
    "Non-residential": [
        "JJ"
    ], 
    "beatific": [
        "JJ"
    ], 
    "telling": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "homeshopping": [
        "NN"
    ], 
    "Holgerson": [
        "NNP"
    ], 
    "Garvier": [
        "NNP"
    ], 
    "unfinished": [
        "JJ"
    ], 
    "sheriff": [
        "NN"
    ], 
    "nitrous": [
        "JJ"
    ], 
    "Waterways": [
        "NNS"
    ], 
    "brighten": [
        "VB"
    ], 
    "Pro-Choice": [
        "JJ"
    ], 
    "won": [
        "VBD", 
        "NN", 
        "NNS", 
        "VBN"
    ], 
    "Newtown": [
        "NNP"
    ], 
    "cameos": [
        "NNS"
    ], 
    "inherited": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "embody": [
        "VBP"
    ], 
    "seasonality": [
        "NN"
    ], 
    "bottom-of-the-barrel": [
        "JJ"
    ], 
    "Lumia": [
        "NNP"
    ], 
    "kinked": [
        "JJ"
    ], 
    "Marquis": [
        "NNP"
    ], 
    "indentations": [
        "NNS"
    ], 
    "alabaster": [
        "NN", 
        "JJR"
    ], 
    "Holtzman": [
        "NNP"
    ], 
    "maritime": [
        "JJ"
    ], 
    "vehicles": [
        "NNS"
    ], 
    "Rosner": [
        "NNP"
    ], 
    "scintillating": [
        "JJ"
    ], 
    "siphons": [
        "NNS"
    ], 
    "Guizot": [
        "NNP"
    ], 
    "Fitness": [
        "NNP"
    ], 
    "post-Deng": [
        "JJ"
    ], 
    "Savelyeva": [
        "NNP"
    ], 
    "dwellings": [
        "NNS"
    ], 
    "Rezsoe": [
        "NNP"
    ], 
    "professors": [
        "NNS"
    ], 
    "Forget": [
        "VB", 
        "NNP"
    ], 
    "tobacco": [
        "NN"
    ], 
    "CANADIAN": [
        "JJ"
    ], 
    "imperious": [
        "JJ"
    ], 
    "French-speaking": [
        "JJ"
    ], 
    "yearn": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "coaxed": [
        "VBN", 
        "VBD"
    ], 
    "Abbe-Scotch": [
        "NNP"
    ], 
    "Darlington": [
        "NNP"
    ], 
    "Austrian": [
        "JJ", 
        "NNP"
    ], 
    "Internatonal": [
        "NNP"
    ], 
    "stock-repurchase": [
        "JJ"
    ], 
    "Senk": [
        "NNP"
    ], 
    "Rainy": [
        "NNP"
    ], 
    "multiplying": [
        "VBG"
    ], 
    "Investing": [
        "VBG", 
        "NN", 
        "NNP"
    ], 
    "Arland": [
        "NNP"
    ], 
    "pro-repeal": [
        "JJ"
    ], 
    "canine": [
        "JJ", 
        "NN"
    ], 
    "Stolzenbach": [
        "NNP"
    ], 
    "hotel\\/entertainment": [
        "NN"
    ], 
    "Cadbury-Schweppes": [
        "NNP"
    ], 
    "rifts": [
        "NNS"
    ], 
    "Mariners": [
        "NNPS"
    ], 
    "intercorporate": [
        "JJ"
    ], 
    "Raine": [
        "NNP"
    ], 
    "conductivity": [
        "NN"
    ], 
    "Nuttle": [
        "NNP"
    ], 
    "washable": [
        "JJ"
    ], 
    "double-entendre": [
        "NN"
    ], 
    "N.H.": [
        "NNP"
    ], 
    "illusory": [
        "JJ"
    ], 
    "southward": [
        "RB", 
        "JJ"
    ], 
    "Normura": [
        "NNP"
    ], 
    "dialectically": [
        "RB"
    ], 
    "Liptak": [
        "NNP"
    ], 
    "McIntyre": [
        "NNP"
    ], 
    "diethylaminoethyl": [
        "NN"
    ], 
    "Sen.": [
        "NNP"
    ], 
    "re-oriented": [
        "VBN"
    ], 
    "keg": [
        "NN"
    ], 
    "hurrying": [
        "VBG", 
        "JJ"
    ], 
    "ovals": [
        "NNS"
    ], 
    "indiscriminate": [
        "JJ"
    ], 
    "Hooray": [
        "UH"
    ], 
    "kicking": [
        "VBG", 
        "NN"
    ], 
    "Projecting": [
        "VBG"
    ], 
    "Benanav": [
        "NNP"
    ], 
    "key": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "reprobating": [
        "VBG"
    ], 
    "flying-mount": [
        "NN"
    ], 
    "Muscovite": [
        "NNP"
    ], 
    "D-night": [
        "NN"
    ], 
    "questionaire": [
        "NN"
    ], 
    "limits": [
        "NNS", 
        "VBP", 
        "VBZ"
    ], 
    "writhed": [
        "VBD"
    ], 
    "outrank": [
        "VBP"
    ], 
    "historichomes": [
        "NNS"
    ], 
    "computer-distributed": [
        "JJ"
    ], 
    "one-size-fits-all": [
        "JJ"
    ], 
    "strains": [
        "NNS"
    ], 
    "heavenward": [
        "JJ"
    ], 
    "Loftus": [
        "NNP"
    ], 
    "red-flag": [
        "VB"
    ], 
    "self-assertion": [
        "NN"
    ], 
    "diplomats": [
        "NNS"
    ], 
    "Integraph": [
        "NNP"
    ], 
    "paranormal": [
        "JJ"
    ], 
    "presaging": [
        "VBG"
    ], 
    "overarming": [
        "VBG"
    ], 
    "accomplishing": [
        "VBG"
    ], 
    "TransTechnology": [
        "NNP"
    ], 
    "ANTHEM": [
        "NNP"
    ], 
    "unaffordable": [
        "JJ"
    ], 
    "aircraft-electronics": [
        "NN"
    ], 
    "glommed": [
        "VBD"
    ], 
    "immense": [
        "JJ", 
        "NN"
    ], 
    "Bolivian": [
        "JJ"
    ], 
    "Spook": [
        "VBP"
    ], 
    "troopers": [
        "NNS"
    ], 
    "controlled": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "retrospective": [
        "NN", 
        "JJ"
    ], 
    "Steinbach": [
        "NNP"
    ], 
    "harborside": [
        "NN"
    ], 
    "replenishment": [
        "NN"
    ], 
    "controller": [
        "NN"
    ], 
    "abortions": [
        "NNS"
    ], 
    "G.N.": [
        "NNP"
    ], 
    "unamusing": [
        "JJ"
    ], 
    "Masnadieri": [
        "NNP"
    ], 
    "Falwell": [
        "NNP"
    ], 
    "Consequently": [
        "RB"
    ], 
    "Hanao": [
        "NNP"
    ], 
    "debtor": [
        "NN", 
        "JJ"
    ], 
    "Gardening": [
        "NNP"
    ], 
    "monohull": [
        "NN"
    ], 
    "energy-industry": [
        "NN"
    ], 
    "Sture": [
        "NNP"
    ], 
    "Atlantans": [
        "NNPS"
    ], 
    "Angotti": [
        "NNP"
    ], 
    "dynamism": [
        "NN"
    ], 
    "Federal-Tiger": [
        "NNP"
    ], 
    "Kneeling": [
        "VBG"
    ], 
    "piloting": [
        "NN", 
        "VBG"
    ], 
    "Stockdale": [
        "NNP"
    ], 
    "comets": [
        "NNS"
    ], 
    "margin-calls": [
        "NNS"
    ], 
    "examines": [
        "VBZ"
    ], 
    "examiner": [
        "NN"
    ], 
    "modestly": [
        "RB"
    ], 
    "Baccarat": [
        "NNP"
    ], 
    "prestidigitation": [
        "NN"
    ], 
    "surface": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Fraas": [
        "NNP"
    ], 
    "examined": [
        "VBD", 
        "VBN"
    ], 
    "Pretty": [
        "RB", 
        "JJ", 
        "NNP"
    ], 
    "cometh": [
        "VBZ"
    ], 
    "day-after-day": [
        "JJ"
    ], 
    "Songbag": [
        "NNP"
    ], 
    "bazaars": [
        "NNS"
    ], 
    "school-based": [
        "JJ"
    ], 
    "Skilton": [
        "NNP"
    ], 
    "Seoul-Moscow": [
        "NNP"
    ], 
    "computer-aided": [
        "JJ"
    ], 
    "Bangkok": [
        "NNP", 
        "NN"
    ], 
    "harmonies": [
        "NNS"
    ], 
    "over-all": [
        "JJ"
    ], 
    "northwest": [
        "RB", 
        "NN", 
        "JJS", 
        "JJ"
    ], 
    "Arabist": [
        "JJ"
    ], 
    "Syse": [
        "NNP"
    ], 
    "glob-flakes": [
        "NN"
    ], 
    "Mockler": [
        "NNP"
    ], 
    "foreign-made": [
        "JJ"
    ], 
    "Types": [
        "NNS"
    ], 
    "dirhams": [
        "NNS"
    ], 
    "Torme": [
        "NNP"
    ], 
    "Buzzy": [
        "NNP"
    ], 
    "anti-viral": [
        "JJ"
    ], 
    "proscribe": [
        "VBP"
    ], 
    "Curie": [
        "NNP"
    ], 
    "stumped": [
        "VBN"
    ], 
    "Curia": [
        "NNP"
    ], 
    "Hallelujah": [
        "NNP", 
        "NN"
    ], 
    "refashion": [
        "NN", 
        "VB"
    ], 
    "steals": [
        "VBZ"
    ], 
    "rift": [
        "NN"
    ], 
    "RB&H": [
        "NNP"
    ], 
    "Macaulay": [
        "NNP"
    ], 
    "EBPI": [
        "NNP"
    ], 
    "Evelyn": [
        "NNP"
    ], 
    "Mayflower": [
        "NNP"
    ], 
    "role-experiment": [
        "NN"
    ], 
    "Tide": [
        "NNP", 
        "NN"
    ], 
    "insurmountable": [
        "JJ"
    ], 
    "Experiments": [
        "NNS"
    ], 
    "furriers": [
        "NNS"
    ], 
    "coronaries": [
        "NNS"
    ], 
    "headcount": [
        "NN"
    ], 
    "Exton": [
        "NNP"
    ], 
    "spy-chaser": [
        "NN"
    ], 
    "By-passing": [
        "VBG"
    ], 
    "increasingly": [
        "RB"
    ], 
    "spotchecks": [
        "NNS"
    ], 
    "lunation": [
        "NN"
    ], 
    "liked": [
        "VBD", 
        "VBN"
    ], 
    "Disappointments": [
        "NNS"
    ], 
    "distant": [
        "JJ"
    ], 
    "Atwell": [
        "NNP"
    ], 
    "VATICAN": [
        "NNP"
    ], 
    "dais": [
        "NN"
    ], 
    "Gaming": [
        "NNP", 
        "NN"
    ], 
    "Bellevue": [
        "NNP"
    ], 
    "community-service": [
        "NN"
    ], 
    "O.K.": [
        "UH", 
        "NNP"
    ], 
    "Spadafora": [
        "NNP"
    ], 
    "Zane": [
        "NNP"
    ], 
    "emblems": [
        "NNS"
    ], 
    "restaurateur": [
        "NN"
    ], 
    "Dorsey": [
        "NNP"
    ], 
    "Dorset": [
        "NNP"
    ], 
    "indignation": [
        "NN"
    ], 
    "precedents": [
        "NNS"
    ], 
    "disappearance": [
        "NN"
    ], 
    "propelled": [
        "VBN", 
        "VBD"
    ], 
    "Herrmann": [
        "NNP"
    ], 
    "Zambon": [
        "NNP"
    ], 
    "propeller": [
        "NN"
    ], 
    "Amerman": [
        "NNP"
    ], 
    "intersection": [
        "NN"
    ], 
    "Total-Cie": [
        "NNP"
    ], 
    "Aug.": [
        "NNP"
    ], 
    "Manuscript": [
        "NNP"
    ], 
    "skips": [
        "VBZ"
    ], 
    "Merely": [
        "RB"
    ], 
    "Drawbacks": [
        "NNS"
    ], 
    "unthaw": [
        "VB"
    ], 
    "payments": [
        "NNS"
    ], 
    "conscripts": [
        "NNS"
    ], 
    "rote": [
        "NN", 
        "JJ"
    ], 
    "climbers": [
        "NNS"
    ], 
    "revisits": [
        "VBZ"
    ], 
    "glare": [
        "NN", 
        "VB"
    ], 
    "Avoid": [
        "VB"
    ], 
    "Colleagues": [
        "NNS"
    ], 
    "Leventhal": [
        "NNP"
    ], 
    "U.": [
        "NNP"
    ], 
    "Kong-based": [
        "JJ", 
        "NNP"
    ], 
    "FOES": [
        "NNS"
    ], 
    "moderates": [
        "NNS", 
        "VBZ"
    ], 
    "Andras": [
        "NNP"
    ], 
    "Boyeki": [
        "NNP"
    ], 
    "objected": [
        "VBD", 
        "VBN"
    ], 
    "Newell": [
        "NNP"
    ], 
    "Enrico": [
        "NNP"
    ], 
    "oppression": [
        "NN"
    ], 
    "cradle": [
        "NN", 
        "VB"
    ], 
    "moderated": [
        "VBN", 
        "VBD"
    ], 
    "inflammation": [
        "NN"
    ], 
    "open-door": [
        "NN", 
        "JJ"
    ], 
    "sweepstakes": [
        "NN", 
        "NNS"
    ], 
    "Strang": [
        "NNP"
    ], 
    "demonstrated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "limitations": [
        "NNS"
    ], 
    "to-and-fro": [
        "RB"
    ], 
    "forgit": [
        "VB", 
        "VBP"
    ], 
    "Straight": [
        "JJ"
    ], 
    "Official": [
        "JJ", 
        "NNP"
    ], 
    "degree-granting": [
        "JJ"
    ], 
    "Up": [
        "IN", 
        "RB", 
        "RP", 
        "NNP"
    ], 
    "Us": [
        "NNP", 
        "NNPS", 
        "PRP"
    ], 
    "Farmwife": [
        "NNP"
    ], 
    "Um": [
        "UH"
    ], 
    "berserk": [
        "JJ", 
        "RB"
    ], 
    "Cartier": [
        "NNP"
    ], 
    "F.R.": [
        "NN"
    ], 
    "Dream-Way": [
        "NNP"
    ], 
    "Euratom": [
        "NNP"
    ], 
    "unhinged": [
        "VBN"
    ], 
    "anchorage": [
        "NN"
    ], 
    "UP": [
        "IN", 
        "RP", 
        "NNP"
    ], 
    "US": [
        "PRP", 
        "NNP"
    ], 
    "quartet": [
        "NN"
    ], 
    "UN": [
        "NNP"
    ], 
    "UH": [
        "NNP"
    ], 
    "UK": [
        "NNP"
    ], 
    "unaided": [
        "JJ"
    ], 
    "interlobular": [
        "JJ"
    ], 
    "CB-radio-style": [
        "JJ"
    ], 
    "ninth-inning": [
        "NN"
    ], 
    "cocoa": [
        "NN"
    ], 
    "restatement": [
        "NN"
    ], 
    "pointless": [
        "JJ"
    ], 
    "cyclorama": [
        "NN"
    ], 
    "Vergessen": [
        "FW"
    ], 
    "additional": [
        "JJ"
    ], 
    "lagged": [
        "VBN", 
        "VBD"
    ], 
    "Stripes": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "Valois": [
        "NNP"
    ], 
    "Souza": [
        "NNP"
    ], 
    "SsangYong": [
        "NNP"
    ], 
    "Franchisee": [
        "NN"
    ], 
    "Fear-maddened": [
        "JJ"
    ], 
    "non-Aryan": [
        "JJ"
    ], 
    "Moss": [
        "NNP"
    ], 
    "Waldo": [
        "NNP"
    ], 
    "heart-disease": [
        "NN"
    ], 
    "gait": [
        "NN"
    ], 
    "squirmy": [
        "JJ"
    ], 
    "gain": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Rauschenbusch": [
        "NNP"
    ], 
    "October-December": [
        "NNP"
    ], 
    "MetroCorp": [
        "NNP"
    ], 
    "highest": [
        "JJS", 
        "RB", 
        "RBS"
    ], 
    "McGinley": [
        "NNP"
    ], 
    "Bordner": [
        "NNP"
    ], 
    "sinusoids": [
        "NNS"
    ], 
    "Kinnock": [
        "NNP"
    ], 
    "derelicts": [
        "NNS"
    ], 
    "Niarchos": [
        "NNP"
    ], 
    "Twist": [
        "NN", 
        "VB", 
        "NNP"
    ], 
    "Einstein": [
        "NNP"
    ], 
    "cavalcades": [
        "NNS"
    ], 
    "Djurdjevic": [
        "NNP"
    ], 
    "Nawal": [
        "NNP"
    ], 
    "marketplace": [
        "NN"
    ], 
    "Invictus": [
        "NNP"
    ], 
    "kisses": [
        "NNS", 
        "VBZ"
    ], 
    "beats": [
        "VBZ", 
        "NNS"
    ], 
    "Doors": [
        "NNS"
    ], 
    "Spierer": [
        "NNP"
    ], 
    "education": [
        "NN"
    ], 
    "take-home": [
        "JJ"
    ], 
    "Lubyanka": [
        "NNP"
    ], 
    "K.C.": [
        "NN"
    ], 
    "Leftist": [
        "JJ"
    ], 
    "cosmopolitans": [
        "NNS"
    ], 
    "ingredients": [
        "NNS"
    ], 
    "RULES": [
        "NNS"
    ], 
    "chock-a-block": [
        "JJ"
    ], 
    "Elmgrove": [
        "NNP"
    ], 
    "proctors": [
        "NNS"
    ], 
    "Wells": [
        "NNP"
    ], 
    "presaged": [
        "VBD"
    ], 
    "Delivery": [
        "NN", 
        "NNP"
    ], 
    "Giles": [
        "NNP"
    ], 
    "Vane": [
        "NNP"
    ], 
    "popularizing": [
        "VBG"
    ], 
    "McCleod": [
        "NNP"
    ], 
    "blunders": [
        "NNS"
    ], 
    "stormbound": [
        "JJ"
    ], 
    "exothermic": [
        "JJ"
    ], 
    "traditionalist": [
        "NN", 
        "JJ"
    ], 
    "tackiest": [
        "JJS"
    ], 
    "Kazikaev": [
        "NNP"
    ], 
    "Hyndman": [
        "NNP"
    ], 
    "foil": [
        "NN", 
        "VB"
    ], 
    "middlebrow": [
        "JJ"
    ], 
    "backstage": [
        "RB"
    ], 
    "Endure": [
        "VBP"
    ], 
    "Novato": [
        "NNP"
    ], 
    "Muncipal": [
        "NNP"
    ], 
    "in-office": [
        "JJ"
    ], 
    "better-prepared": [
        "JJ"
    ], 
    "shuns": [
        "VBZ"
    ], 
    "accidents": [
        "NNS"
    ], 
    "shunt": [
        "NN"
    ], 
    "Tzora": [
        "NNP"
    ], 
    "Rome-based": [
        "JJ"
    ], 
    "Fourteenth": [
        "NNP"
    ], 
    "Stickers": [
        "NNS"
    ], 
    "indirectly": [
        "RB"
    ], 
    "eclipsing": [
        "VBG"
    ], 
    "paperless": [
        "JJ"
    ], 
    "Keul": [
        "NNP"
    ], 
    "Soak": [
        "VB"
    ], 
    "Frontier": [
        "NNP"
    ], 
    "Toubro": [
        "NNP"
    ], 
    "circumlocution": [
        "NN"
    ], 
    "twelve-hour": [
        "JJ"
    ], 
    "high-button": [
        "JJ"
    ], 
    "Energieproduktiebedrijf": [
        "NNP"
    ], 
    "trodden": [
        "JJ"
    ], 
    "Bailey": [
        "NNP"
    ], 
    "Leggett": [
        "NNP"
    ], 
    "Cuauhtemoc": [
        "NNP"
    ], 
    "Soap": [
        "NNP", 
        "NN"
    ], 
    "ruling-class": [
        "JJ"
    ], 
    "Hondo": [
        "NNP"
    ], 
    "auf": [
        "FW"
    ], 
    "swam": [
        "VBD"
    ], 
    "Honda": [
        "NNP", 
        "NN"
    ], 
    "pensions": [
        "NNS"
    ], 
    "Shapovalov": [
        "NNP"
    ], 
    "swat": [
        "NN"
    ], 
    "swap": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Sheets": [
        "NNP"
    ], 
    "Dynafac": [
        "NN", 
        "NNP"
    ], 
    "recycle": [
        "VB"
    ], 
    "aux": [
        "FW"
    ], 
    "sorry": [
        "JJ", 
        "RB", 
        "UH"
    ], 
    "sway": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Pleas": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "collaborate": [
        "VB", 
        "VBP"
    ], 
    "Znaniye": [
        "NNP"
    ], 
    "void": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "Industria": [
        "NNP"
    ], 
    "Panyotis": [
        "NNP"
    ], 
    "trend-spotter": [
        "NN"
    ], 
    "voir": [
        "FW"
    ], 
    "comico-romantico": [
        "JJ"
    ], 
    "Simplot": [
        "NNP"
    ], 
    "deplorably": [
        "RB"
    ], 
    "hurricane-stricken": [
        "JJ"
    ], 
    "Extending": [
        "VBG"
    ], 
    "unrelated": [
        "JJ"
    ], 
    "enhance": [
        "VB", 
        "VBP"
    ], 
    "deplorable": [
        "JJ"
    ], 
    "separation-of-powers": [
        "JJ"
    ], 
    "whirlwind": [
        "NN", 
        "JJ"
    ], 
    "landlords": [
        "NNS"
    ], 
    "Cuisine": [
        "NNP"
    ], 
    "Margaux": [
        "NNP"
    ], 
    "scouted": [
        "VBD"
    ], 
    "Christic": [
        "NNP"
    ], 
    "Herrick": [
        "NNP"
    ], 
    "Christie": [
        "NNP", 
        "NN"
    ], 
    "Yasuda": [
        "NNP"
    ], 
    "hibernate": [
        "VBP", 
        "VB"
    ], 
    "tangential": [
        "JJ"
    ], 
    "kidnap": [
        "VB"
    ], 
    "disintegrated": [
        "VBD"
    ], 
    "ignominiously": [
        "RB"
    ], 
    "tall-growing": [
        "JJ"
    ], 
    "Sikes": [
        "NNP"
    ], 
    "uptempo": [
        "JJ"
    ], 
    "Schenk": [
        "NNP"
    ], 
    "WELLS": [
        "NNP"
    ], 
    "yonder": [
        "NN"
    ], 
    "spokesman": [
        "NN"
    ], 
    "confusin": [
        "NN"
    ], 
    "reviving": [
        "VBG", 
        "JJ"
    ], 
    "mee": [
        "PRP"
    ], 
    "helmets": [
        "NNS"
    ], 
    "market-hog": [
        "JJ"
    ], 
    "mea": [
        "FW"
    ], 
    "back-on-terra-firma": [
        "JJ"
    ], 
    "muzzle": [
        "NN", 
        "VB"
    ], 
    "mem": [
        "FW"
    ], 
    "men": [
        "NNS"
    ], 
    "mei": [
        "FW"
    ], 
    "weirdly": [
        "RB"
    ], 
    "met": [
        "VBD", 
        "VBN"
    ], 
    "Bussieres": [
        "NNP"
    ], 
    "biconcave": [
        "JJ"
    ], 
    "Lassus": [
        "NNP"
    ], 
    "systematized": [
        "VBN"
    ], 
    "Aalseth": [
        "NNP"
    ], 
    "rooster-comb": [
        "NN"
    ], 
    "launch-control": [
        "NN"
    ], 
    "Curry": [
        "NNP"
    ], 
    "Predispositions": [
        "NNS"
    ], 
    "Chiron": [
        "NNP"
    ], 
    "Simeon": [
        "NNP"
    ], 
    "Brakes": [
        "NNS"
    ], 
    "Extra": [
        "NNP"
    ], 
    "Scolatti": [
        "NNP"
    ], 
    "Demonstrations": [
        "NNS"
    ], 
    "defects-office": [
        "NN"
    ], 
    "fajitas": [
        "NNS"
    ], 
    "Ricketts": [
        "NNP"
    ], 
    "have-nots": [
        "NNS"
    ], 
    "Lyon": [
        "NNP"
    ], 
    "mobility": [
        "NN"
    ], 
    "south-central": [
        "JJ"
    ], 
    "objectively": [
        "RB"
    ], 
    "sliced": [
        "VBN", 
        "VBD"
    ], 
    "Fleischmanns": [
        "NNP"
    ], 
    "Norske": [
        "NNP"
    ], 
    "Piano": [
        "NNP", 
        "NN"
    ], 
    "Romanza": [
        "NNP"
    ], 
    "tutelage": [
        "NN"
    ], 
    "Boersen-Zeitung": [
        "NNP"
    ], 
    "rationalist": [
        "JJ", 
        "NN"
    ], 
    "doubled-edged": [
        "JJ"
    ], 
    "LOBBIES": [
        "VBZ"
    ], 
    "gold-oriented": [
        "JJ"
    ], 
    "Drexler": [
        "NNP"
    ], 
    "well-servicing": [
        "JJ"
    ], 
    "Kingsepp": [
        "NNP"
    ], 
    "Rudibaugh": [
        "NNP"
    ], 
    "rationalism": [
        "NN"
    ], 
    "Carbon": [
        "NNP", 
        "NN"
    ], 
    "TASS": [
        "NNP"
    ], 
    "overlooked": [
        "VBN", 
        "VBD"
    ], 
    "grabbin": [
        "VBG"
    ], 
    "surgical-abortion": [
        "JJ"
    ], 
    "multi-state": [
        "JJ"
    ], 
    "workmanship": [
        "NN"
    ], 
    "phraseology": [
        "NN"
    ], 
    "Smelting": [
        "NNP"
    ], 
    "defecated": [
        "VBN"
    ], 
    "rook": [
        "NN"
    ], 
    "room": [
        "NN", 
        "NNP"
    ], 
    "interposition": [
        "NN"
    ], 
    "flue-cured": [
        "JJ"
    ], 
    "roof": [
        "NN"
    ], 
    "Slug": [
        "VB"
    ], 
    "movies": [
        "NNS"
    ], 
    "Fournier": [
        "NNP"
    ], 
    "exceptions": [
        "NNS"
    ], 
    "root": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "troubles": [
        "NNS", 
        "VBZ"
    ], 
    "motor-operated": [
        "JJ"
    ], 
    "Zweibel": [
        "NNP"
    ], 
    "Chrome": [
        "NNP"
    ], 
    "Wizard": [
        "NNP", 
        "NN"
    ], 
    "whistle-blowers": [
        "NNS"
    ], 
    "Scalfaro": [
        "NNP"
    ], 
    "cials": [
        "NNS"
    ], 
    "Maecker": [
        "NNP"
    ], 
    "Hardscrabble": [
        "NNP"
    ], 
    "shelving": [
        "NN"
    ], 
    "Fast-food": [
        "NN"
    ], 
    "elicited": [
        "VBN", 
        "VBD"
    ], 
    "January-August": [
        "NNP"
    ], 
    "decrying": [
        "VBG"
    ], 
    "Darcy": [
        "NNP"
    ], 
    "remonstrated": [
        "VBD"
    ], 
    "Red-Green": [
        "NNP"
    ], 
    "quibble": [
        "VB"
    ], 
    "loggers": [
        "NNS"
    ], 
    "Fidler": [
        "NNP"
    ], 
    "disassemble": [
        "VB"
    ], 
    "manuals": [
        "NNS"
    ], 
    "loyalty": [
        "NN"
    ], 
    "ova": [
        "NN"
    ], 
    "fracas": [
        "NN"
    ], 
    "Kiley": [
        "NNP"
    ], 
    "disassembly": [
        "NN"
    ], 
    "cathoderay": [
        "NN"
    ], 
    "security-type": [
        "JJ"
    ], 
    "lifesaving": [
        "VBG"
    ], 
    "Trujillos": [
        "NNPS"
    ], 
    "defaces": [
        "VBZ"
    ], 
    "EQUITIES": [
        "NNPS"
    ], 
    "Delusion": [
        "NNP"
    ], 
    "Touring": [
        "VBG", 
        "NN"
    ], 
    "neglect": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Ended": [
        "NNP"
    ], 
    "fictitious": [
        "JJ"
    ], 
    "pasteurized": [
        "VBN"
    ], 
    "plagiarizers": [
        "NNS"
    ], 
    "Edwviges": [
        "NNP"
    ], 
    "Textiles": [
        "NNP", 
        "NNS"
    ], 
    "glycols": [
        "NNS"
    ], 
    "determinate": [
        "JJ"
    ], 
    "Agnelli": [
        "NNP"
    ], 
    "high-rep": [
        "JJ"
    ], 
    "inconclusive": [
        "JJ"
    ], 
    "Socialization": [
        "NN"
    ], 
    "W.T.": [
        "NNP"
    ], 
    "fable": [
        "NN"
    ], 
    "fellas": [
        "NNS"
    ], 
    "budding": [
        "VBG", 
        "JJ"
    ], 
    "cattaloe": [
        "NN"
    ], 
    "famille": [
        "FW"
    ], 
    "personae": [
        "NNS"
    ], 
    "deathly": [
        "JJ"
    ], 
    "personal": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "Sun-Times": [
        "NNP"
    ], 
    "Econometric": [
        "NNP"
    ], 
    "MiGs": [
        "NNPS"
    ], 
    "Luber": [
        "NNP"
    ], 
    "stalemate": [
        "NN"
    ], 
    "Butter-Nut": [
        "NNP"
    ], 
    "drops": [
        "VBZ", 
        "NNS"
    ], 
    "confidently": [
        "RB"
    ], 
    "rebutted": [
        "VBN", 
        "VBD"
    ], 
    "comedy-oriented": [
        "JJ"
    ], 
    "madly": [
        "RB"
    ], 
    "combination": [
        "NN"
    ], 
    "Ashwood": [
        "NNP"
    ], 
    "driftin": [
        "VBG"
    ], 
    "Challenge": [
        "NNP", 
        "NN"
    ], 
    "glazes": [
        "NNS"
    ], 
    "demythologize": [
        "VB"
    ], 
    "Agenda": [
        "NNP", 
        "NN"
    ], 
    "Beggiato": [
        "NNP"
    ], 
    "glazed": [
        "VBN"
    ], 
    "imprisoning": [
        "VBG"
    ], 
    "Saitama": [
        "NNP"
    ], 
    "Chesley": [
        "NNP"
    ], 
    "AIDS-related": [
        "JJ"
    ], 
    "emergency-cash": [
        "NN"
    ], 
    "Seita": [
        "NNP"
    ], 
    "Seitz": [
        "NNP"
    ], 
    "ducking": [
        "VBG"
    ], 
    "interpolation": [
        "NN"
    ], 
    "Check": [
        "VB", 
        "NNP"
    ], 
    "punishable": [
        "JJ"
    ], 
    "nonchurchgoing": [
        "JJ"
    ], 
    "Goulde": [
        "NNP"
    ], 
    "admittees": [
        "NNS"
    ], 
    "SS.": [
        "NNP"
    ], 
    "trading": [
        "NN", 
        "NN|VBG", 
        "VBG|NN", 
        "JJ", 
        "VBG"
    ], 
    "forgot": [
        "VBD", 
        "VBN"
    ], 
    "aids": [
        "NNS", 
        "VBZ"
    ], 
    "LeBrun": [
        "NNP"
    ], 
    "comedies": [
        "NNS"
    ], 
    "two-percentage-point": [
        "JJ"
    ], 
    "Obeying": [
        "VBG"
    ], 
    "merchants": [
        "NNS"
    ], 
    "unbound": [
        "JJ", 
        "VBN"
    ], 
    "Menderes": [
        "NNP"
    ], 
    "Eagle-Berol": [
        "NNP"
    ], 
    "Rosabelle": [
        "NNP"
    ], 
    "Skolniks": [
        "NNP"
    ], 
    "bulkheads": [
        "NNS"
    ], 
    "debit": [
        "NN"
    ], 
    "Stockman": [
        "NNP"
    ], 
    "Join": [
        "VB", 
        "NNP", 
        "VBP"
    ], 
    "Clive": [
        "NNP"
    ], 
    "Reps.": [
        "NNP", 
        "NNPS"
    ], 
    "SS-18s": [
        "NNS"
    ], 
    "abate": [
        "VB"
    ], 
    "Healthco": [
        "NNP"
    ], 
    "mushrooming": [
        "NN"
    ], 
    "Salvatori": [
        "NNP"
    ], 
    "resew": [
        "VB"
    ], 
    "gruonded": [
        "VBD"
    ], 
    "Privatizing": [
        "NN"
    ], 
    "SST": [
        "NNP"
    ], 
    "cosmic": [
        "JJ"
    ], 
    "Sudden": [
        "JJ"
    ], 
    "SSI": [
        "NNP"
    ], 
    "uses": [
        "VBZ", 
        "NNS"
    ], 
    "enraged": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Adolf": [
        "NNP"
    ], 
    "causeways": [
        "NNS"
    ], 
    "Freshmen": [
        "NNS"
    ], 
    "oracles": [
        "NNS"
    ], 
    "Waite": [
        "NNP"
    ], 
    "double-A-2": [
        "NN", 
        "JJ"
    ], 
    "double-A-3": [
        "JJ"
    ], 
    "Electro-Optics": [
        "NNP"
    ], 
    "Vectra": [
        "NNP"
    ], 
    "ALBERTA": [
        "NNP"
    ], 
    "Fienberg": [
        "NNP"
    ], 
    "PATRON": [
        "NNP"
    ], 
    "acquaint": [
        "VB"
    ], 
    "Mess": [
        "NN"
    ], 
    "Consolidation": [
        "NN"
    ], 
    "Mullerin": [
        "NNP"
    ], 
    "Johns": [
        "NNP"
    ], 
    "Excellent": [
        "JJ"
    ], 
    "woodwind": [
        "NN"
    ], 
    "gourmets": [
        "NNS"
    ], 
    "McKinleyville": [
        "NNP"
    ], 
    "Commandeering": [
        "VBG"
    ], 
    "Estimated": [
        "VBN", 
        "JJ"
    ], 
    "dower": [
        "NN"
    ], 
    "Yevgeny": [
        "NNP"
    ], 
    "chronicled": [
        "VBD", 
        "VBN"
    ], 
    "Charleston": [
        "NNP", 
        "NN"
    ], 
    "Minikes": [
        "NNP"
    ], 
    "begins": [
        "VBZ"
    ], 
    "homogenized": [
        "VBN"
    ], 
    "Travel-Holiday": [
        "NNP"
    ], 
    "enshrouding": [
        "VBG"
    ], 
    "Exhausted": [
        "JJ"
    ], 
    "conforms": [
        "VBZ"
    ], 
    "Colefax": [
        "NNP"
    ], 
    "exchangeable": [
        "JJ"
    ], 
    "biochemical": [
        "JJ"
    ], 
    "perilla": [
        "NN"
    ], 
    "Bottlers": [
        "NNP", 
        "NNS"
    ], 
    "Mercier": [
        "NNP"
    ], 
    "Snuff": [
        "NNP"
    ], 
    "recommence": [
        "VB"
    ], 
    "Curacao": [
        "NNP"
    ], 
    "rattle": [
        "NN", 
        "VB"
    ], 
    "ebb-and-flow": [
        "NN"
    ], 
    "Lewellyn": [
        "NNP"
    ], 
    "Gideon": [
        "NNP"
    ], 
    "central-planning": [
        "JJ"
    ], 
    "prerecorded": [
        "VBN"
    ], 
    "nine-tenths": [
        "NNS"
    ], 
    "theology": [
        "NN"
    ], 
    "Tashkent": [
        "NNP"
    ], 
    "Egyptian": [
        "JJ", 
        "NNP"
    ], 
    "Kinder-Care": [
        "NNP"
    ], 
    "Gripen": [
        "NNP"
    ], 
    "recordkeeping": [
        "NN"
    ], 
    "quarterback": [
        "NN"
    ], 
    "yearlong": [
        "JJ"
    ], 
    "uproariously": [
        "RB"
    ], 
    "overplayed": [
        "VBD", 
        "VBN"
    ], 
    "criminal-justice": [
        "NN"
    ], 
    "Biological": [
        "JJ", 
        "NNP"
    ], 
    "legal-services": [
        "NNS", 
        "JJ"
    ], 
    "maria": [
        "NNS"
    ], 
    "Sanctuary": [
        "NNP"
    ], 
    "splints": [
        "NNS"
    ], 
    "competitors": [
        "NNS"
    ], 
    "Kyocera": [
        "NNP"
    ], 
    "egg-throwing": [
        "JJ"
    ], 
    "unleashed": [
        "VBN", 
        "VBD"
    ], 
    "Sabre": [
        "NNP"
    ], 
    "PATCO": [
        "NNP"
    ], 
    "armament": [
        "NN"
    ], 
    "UPI": [
        "NNP"
    ], 
    "mineralized": [
        "JJ"
    ], 
    "implying": [
        "VBG"
    ], 
    "flouted": [
        "VBN"
    ], 
    "poison": [
        "NN", 
        "NN|JJ", 
        "JJ", 
        "VB"
    ], 
    "McDuffie": [
        "NNP"
    ], 
    "dampening": [
        "JJ"
    ], 
    "CONSUMERS": [
        "NNS"
    ], 
    "double-A": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "bookish": [
        "JJ"
    ], 
    "double-C": [
        "NN"
    ], 
    "celery": [
        "NN"
    ], 
    "Archbishops": [
        "NNS"
    ], 
    "Post-Newsweek": [
        "NNP"
    ], 
    "Advantages": [
        "NNS"
    ], 
    "Lahus": [
        "NNP"
    ], 
    "Others": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "bangish": [
        "JJ"
    ], 
    "lightening": [
        "VBG"
    ], 
    "company-owned": [
        "JJ"
    ], 
    "extraterrestrials": [
        "NNS"
    ], 
    "preparatives": [
        "NNS"
    ], 
    "nyet": [
        "UH"
    ], 
    "difference...": [
        ":"
    ], 
    "Yesiree": [
        "UH"
    ], 
    "appetizer": [
        "NN"
    ], 
    "trans-Panama": [
        "JJ"
    ], 
    "water-deficient": [
        "JJ"
    ], 
    "pallets": [
        "NNS"
    ], 
    "Holstein": [
        "NNP"
    ], 
    "untradeable": [
        "JJ"
    ], 
    "boom-boom-boom": [
        "JJ"
    ], 
    "dauphin": [
        "NN"
    ], 
    "facilitators": [
        "NNS"
    ], 
    "COMMENTS": [
        "NNS"
    ], 
    "godliness": [
        "NN"
    ], 
    "hookworm": [
        "NN"
    ], 
    "troop": [
        "NN", 
        "VBP"
    ], 
    "adulterous": [
        "JJ"
    ], 
    "Partners": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Star-Spangled": [
        "NNP", 
        "JJ"
    ], 
    "testing": [
        "NN", 
        "VBG", 
        "VBG|NN"
    ], 
    "Af-values": [
        "NNS"
    ], 
    "dog-meat": [
        "NN"
    ], 
    "Indexes": [
        "NNS"
    ], 
    "Dreamers": [
        "NNS", 
        "NNPS"
    ], 
    "non-stop": [
        "JJ"
    ], 
    "hoydenish": [
        "JJ"
    ], 
    "Indexed": [
        "JJ"
    ], 
    "interruptions": [
        "NNS"
    ], 
    "home-entertainment": [
        "JJ"
    ], 
    "Watervliet": [
        "NNP"
    ], 
    "Somebody": [
        "NN", 
        "NNP"
    ], 
    "Plotkin": [
        "NNP"
    ], 
    "narrated": [
        "VBN"
    ], 
    "eighty-sixth": [
        "JJ"
    ], 
    "half-a-dozen": [
        "NN"
    ], 
    "Billed": [
        "VBN"
    ], 
    "by-ways": [
        "NNS"
    ], 
    "Multiplexers": [
        "NNS"
    ], 
    "socio-economic": [
        "JJ", 
        "NN"
    ], 
    "Blumstein": [
        "NNP"
    ], 
    "W.Va.": [
        "NNP"
    ], 
    "Tunnel": [
        "NNP"
    ], 
    "non-governmental": [
        "JJ"
    ], 
    "busloads": [
        "NNS"
    ], 
    "motto": [
        "NN"
    ], 
    "Otherwise": [
        "RB"
    ], 
    "Micawber": [
        "NNP"
    ], 
    "Cylinder": [
        "NN"
    ], 
    "resistant": [
        "JJ", 
        "NN"
    ], 
    "Imperiales": [
        "NNPS"
    ], 
    "uncertainty": [
        "NN"
    ], 
    "elastomer": [
        "NN"
    ], 
    "discount-movie": [
        "JJ"
    ], 
    "RobertsCorp": [
        "NNP"
    ], 
    "Naples-born": [
        "JJ"
    ], 
    "carat": [
        "NN"
    ], 
    "Thrall": [
        "NNP"
    ], 
    "Glimco": [
        "NNP"
    ], 
    "Bahamas": [
        "NNPS", 
        "NNP"
    ], 
    "precut": [
        "JJ"
    ], 
    "half-point": [
        "JJ"
    ], 
    "Muscat": [
        "NNP"
    ], 
    "putt": [
        "NN", 
        "VB"
    ], 
    "oceanography": [
        "NN"
    ], 
    "puts": [
        "VBZ", 
        "NNS"
    ], 
    "regenerate": [
        "VB"
    ], 
    "KANEB": [
        "NNP"
    ], 
    "parsley": [
        "NN"
    ], 
    "Paredon": [
        "NN"
    ], 
    "growth...": [
        ":"
    ], 
    "soft-landing": [
        "JJ"
    ], 
    "entered": [
        "VBD", 
        "VBN"
    ], 
    "lovely": [
        "JJ"
    ], 
    "well-deserved": [
        "JJ"
    ], 
    "SHORT-TERM": [
        "JJ"
    ], 
    "eight-bar": [
        "JJ"
    ], 
    "Emmert": [
        "NNP"
    ], 
    "Flor": [
        "NNP"
    ], 
    "Flow": [
        "NNP"
    ], 
    "BRITISH": [
        "JJ"
    ], 
    "word-games": [
        "NNS"
    ], 
    "Keteyian": [
        "NNP"
    ], 
    "Flom": [
        "NNP"
    ], 
    "Misery": [
        "NN"
    ], 
    "scrubbers": [
        "NNS"
    ], 
    "Voice": [
        "NNP", 
        "NN"
    ], 
    "harshness": [
        "NN"
    ], 
    "Debugging": [
        "VBG"
    ], 
    "Reputedly": [
        "RB"
    ], 
    "vendetta": [
        "NN"
    ], 
    "Process": [
        "NNP", 
        "NN"
    ], 
    "Tatman": [
        "NNP"
    ], 
    "Canaan": [
        "NNP"
    ], 
    "Pines": [
        "NNP"
    ], 
    "ceilings": [
        "NNS"
    ], 
    "CAPITALIST": [
        "JJ"
    ], 
    "sprinted": [
        "VBD"
    ], 
    "cane": [
        "NN"
    ], 
    "bribery-related": [
        "JJ"
    ], 
    "recuperate": [
        "VB"
    ], 
    "well-kept": [
        "JJ"
    ], 
    "Arrangement": [
        "NNP", 
        "NN"
    ], 
    "cant": [
        "NN"
    ], 
    "cans": [
        "NNS", 
        "VBZ"
    ], 
    "inscrutable": [
        "JJ"
    ], 
    "gaze": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "cockatoos": [
        "NNS"
    ], 
    "borough": [
        "NN"
    ], 
    "specialization": [
        "NN"
    ], 
    "Kibbutz": [
        "NNP"
    ], 
    "erudition": [
        "NN"
    ], 
    "realizing": [
        "VBG"
    ], 
    "Sanson": [
        "NNP"
    ], 
    "Chatwal": [
        "NNP"
    ], 
    "Sansom": [
        "NNP"
    ], 
    "small-company-stock": [
        "NN"
    ], 
    "world-famous": [
        "JJ", 
        "NN"
    ], 
    "colonies": [
        "NNS"
    ], 
    "detergency": [
        "NN"
    ], 
    "evolve": [
        "VB", 
        "VBP"
    ], 
    "off-duty": [
        "JJ"
    ], 
    "Hals": [
        "NNP"
    ], 
    "opulent": [
        "JJ"
    ], 
    "Champlain": [
        "NNP"
    ], 
    "impelling": [
        "JJ"
    ], 
    "Dilip": [
        "NNP"
    ], 
    "price-stabilized": [
        "JJ"
    ], 
    "Usually": [
        "RB"
    ], 
    "geological": [
        "JJ"
    ], 
    "interferometers": [
        "NNS"
    ], 
    "Brassbound": [
        "NNP"
    ], 
    "SAKOS": [
        "FW"
    ], 
    "presto": [
        "RB"
    ], 
    "unconditionally": [
        "RB"
    ], 
    "jackdaws": [
        "NNS"
    ], 
    "failing": [
        "VBG", 
        "NN"
    ], 
    "Matson": [
        "NNP"
    ], 
    "resuming": [
        "VBG"
    ], 
    "Janitsch": [
        "NNP"
    ], 
    "perceptiveness": [
        "NN"
    ], 
    "sanctums": [
        "NNS"
    ], 
    "yours": [
        "PRP", 
        "JJ"
    ], 
    "worked-out": [
        "JJ"
    ], 
    "Helicopters": [
        "NNP", 
        "NNPS"
    ], 
    "Griffin": [
        "NNP"
    ], 
    "unclenched": [
        "VBN"
    ], 
    "Significants": [
        "NNS"
    ], 
    "crystallites": [
        "NNS"
    ], 
    "Capone": [
        "NNP", 
        "NN"
    ], 
    "Acceptable": [
        "JJ"
    ], 
    "assigned": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "assignee": [
        "NN"
    ], 
    "fighters": [
        "NNS"
    ], 
    "reformation": [
        "NN"
    ], 
    "salivary": [
        "JJ"
    ], 
    "rent-a-colonel": [
        "NN"
    ], 
    "rent-subsidy": [
        "JJ"
    ], 
    "Bills": [
        "NNS", 
        "NNP"
    ], 
    "pecuniary": [
        "JJ"
    ], 
    "Boss": [
        "NNP", 
        "NN"
    ], 
    "appellant": [
        "FW"
    ], 
    "copyrights": [
        "NNS"
    ], 
    "Backlog": [
        "NN"
    ], 
    "cardiologists": [
        "NNS"
    ], 
    "Buddhism": [
        "NNP", 
        "NN"
    ], 
    "revenue-sharing": [
        "JJ"
    ], 
    "ago.": [
        "RB"
    ], 
    "Kerr-Mills": [
        "NNP"
    ], 
    "Bowman": [
        "NNP"
    ], 
    "boasted": [
        "VBD", 
        "VBN"
    ], 
    "involuntary": [
        "JJ"
    ], 
    "rehash": [
        "NN", 
        "VBP"
    ], 
    "supervisors": [
        "NNS"
    ], 
    "paramilitary": [
        "JJ"
    ], 
    "orthodontic": [
        "JJ"
    ], 
    "hi-fi": [
        "NN"
    ], 
    "Browne": [
        "NNP"
    ], 
    "Picturing": [
        "VBG"
    ], 
    "Arp": [
        "NNP"
    ], 
    "Stolz": [
        "NNP"
    ], 
    "Art": [
        "NNP", 
        "VBZ", 
        "NN"
    ], 
    "repossessed": [
        "JJ", 
        "VBN"
    ], 
    "ramparts": [
        "NNS"
    ], 
    "Arx": [
        "NNP"
    ], 
    "tormentors": [
        "NNS"
    ], 
    "Michele": [
        "NNP"
    ], 
    "Computing": [
        "VBG", 
        "NNP"
    ], 
    "Ara": [
        "NNP"
    ], 
    "Arc": [
        "NNP"
    ], 
    "Are": [
        "VBP", 
        "NNP"
    ], 
    "testers": [
        "NNS"
    ], 
    "talk-aboutiveness": [
        "NN"
    ], 
    "Ark": [
        "NNP", 
        "NN"
    ], 
    "Michels": [
        "NNP"
    ], 
    "Arm": [
        "NN", 
        "VB", 
        "NNP"
    ], 
    "Aro": [
        "NNP"
    ], 
    "cowardice": [
        "NN"
    ], 
    "Arraignments": [
        "NNS"
    ], 
    "dean": [
        "NN", 
        "NNP"
    ], 
    "Generics": [
        "NNS"
    ], 
    "Beef": [
        "NN", 
        "NNP"
    ], 
    "Conduits": [
        "NNS"
    ], 
    "deaf": [
        "JJ"
    ], 
    "Zeising": [
        "NNP"
    ], 
    "Been": [
        "VBN", 
        "NNP"
    ], 
    "yf": [
        "NN"
    ], 
    "Beep": [
        "NNP", 
        "NN"
    ], 
    "Beer": [
        "NN", 
        "NNP"
    ], 
    "yearlings": [
        "NNS"
    ], 
    "Beet": [
        "NNP"
    ], 
    "Browns": [
        "NNP", 
        "NNPS"
    ], 
    "dear": [
        "JJ", 
        "NN", 
        "RB", 
        "UH"
    ], 
    "doll-like": [
        "JJ"
    ], 
    "carts": [
        "NNS"
    ], 
    "microwave": [
        "NN"
    ], 
    "buffer": [
        "NN", 
        "VB"
    ], 
    "Parizeau": [
        "NNP"
    ], 
    "provoking": [
        "VBG", 
        "JJ"
    ], 
    "Leonidas": [
        "NNP"
    ], 
    "carte": [
        "NN"
    ], 
    "Kochan": [
        "NNP"
    ], 
    "trade-in": [
        "NN"
    ], 
    "subscriptions": [
        "NNS"
    ], 
    "codifies": [
        "VBZ"
    ], 
    "predicting": [
        "VBG", 
        "NN"
    ], 
    "Junk": [
        "NN"
    ], 
    "Salman": [
        "NNP"
    ], 
    "defense-electronics": [
        "NNS", 
        "JJ"
    ], 
    "Corey": [
        "NNP"
    ], 
    "buffet": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Blampied": [
        "NNP"
    ], 
    "missive": [
        "NN"
    ], 
    "codified": [
        "VBN"
    ], 
    "backlogs": [
        "NNS"
    ], 
    "lyking": [
        "VBG"
    ], 
    "appeasing": [
        "NN"
    ], 
    "Hoped-for": [
        "JJ"
    ], 
    "leave-taking": [
        "NN"
    ], 
    "blithe": [
        "JJ"
    ], 
    "Merill": [
        "NNP"
    ], 
    "Carstens": [
        "NNP"
    ], 
    "clapboard": [
        "NN"
    ], 
    "second-guessed": [
        "VBN"
    ], 
    "emcee": [
        "NN"
    ], 
    "managers": [
        "NNS"
    ], 
    "Dallas": [
        "NNP"
    ], 
    "Isabell": [
        "NNP"
    ], 
    "memory-pictures": [
        "NNS"
    ], 
    "Pokorny": [
        "NNP"
    ], 
    "HyperCard": [
        "NNP"
    ], 
    "down": [
        "RB", 
        "IN|RB", 
        "RBR", 
        "VBP", 
        "IN", 
        "JJ", 
        "NN", 
        "RP", 
        "VB"
    ], 
    "Southlife": [
        "NNP"
    ], 
    "plain-clothes": [
        "JJ"
    ], 
    "P.D.I.": [
        "NNP"
    ], 
    "Chairmen": [
        "NNS"
    ], 
    "refined": [
        "JJ", 
        "VBN"
    ], 
    "Satrum": [
        "NNP"
    ], 
    "Cranston": [
        "NNP"
    ], 
    "solar-electromagnetic": [
        "NN"
    ], 
    "TRC": [
        "NNP"
    ], 
    "initial": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "U/NNP.S.C.": [
        "NNP"
    ], 
    "districts\\/states": [
        "NNS"
    ], 
    "futureeither": [
        "NN"
    ], 
    "let-down": [
        "NNS"
    ], 
    "editor": [
        "NN"
    ], 
    "fraction": [
        "NN"
    ], 
    "tank-related": [
        "JJ"
    ], 
    "Herman": [
        "NNP", 
        "NN"
    ], 
    "polemical": [
        "JJ"
    ], 
    "creation": [
        "NN"
    ], 
    "clinics": [
        "NNS"
    ], 
    "Lissa": [
        "NNP"
    ], 
    "Bradsby": [
        "NNP"
    ], 
    "Dicello": [
        "NNP"
    ], 
    "anionics": [
        "NNS"
    ], 
    "landing": [
        "NN", 
        "VBG"
    ], 
    "feminine": [
        "JJ", 
        "NN"
    ], 
    "experimentations": [
        "NNS"
    ], 
    "zaiteku": [
        "FW"
    ], 
    "Defeat": [
        "NNP"
    ], 
    "one-stooler": [
        "NN"
    ], 
    "analyst": [
        "NN"
    ], 
    "Urstadt": [
        "NNP"
    ], 
    "evinced": [
        "VBN", 
        "VBD"
    ], 
    "trendiest": [
        "JJS"
    ], 
    "Albanians": [
        "NNPS", 
        "NNS"
    ], 
    "deer-handling": [
        "NN"
    ], 
    "bad-neighbor": [
        "JJ"
    ], 
    "Boismassif": [
        "NNP"
    ], 
    "Langhorne": [
        "NNP"
    ], 
    "Fedders": [
        "NNP", 
        "NNS"
    ], 
    "work-in-progress": [
        "NN"
    ], 
    "northerner": [
        "NN"
    ], 
    "resuscitating": [
        "VBG"
    ], 
    "Richman": [
        "NNP"
    ], 
    "governors-association": [
        "NN"
    ], 
    "Niche-itis": [
        "NN"
    ], 
    "on-air": [
        "JJ"
    ], 
    "Heymann": [
        "NNP"
    ], 
    "flood-lighted": [
        "JJ"
    ], 
    "strengthening": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "pontiff": [
        "NN"
    ], 
    "petit": [
        "FW"
    ], 
    "cure-all": [
        "NN", 
        "JJ"
    ], 
    "HELPS": [
        "VBZ"
    ], 
    "awhile": [
        "RB"
    ], 
    "marinated": [
        "VBN"
    ], 
    "Tiber": [
        "NNP"
    ], 
    "Persona": [
        "NNP"
    ], 
    "exaltations": [
        "NNS"
    ], 
    "Menuhin-Amadeus": [
        "NNP"
    ], 
    "Taisho": [
        "NNP"
    ], 
    "Persons": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "time-strapped": [
        "JJ"
    ], 
    "Lande": [
        "NNP"
    ], 
    "Uplands": [
        "NNPS"
    ], 
    "Romantic": [
        "JJ", 
        "NNP"
    ], 
    "faction": [
        "NN"
    ], 
    "handicap": [
        "NN", 
        "VB"
    ], 
    "super-expensive": [
        "JJ"
    ], 
    "utilities": [
        "NNS"
    ], 
    "Conveyance": [
        "NN"
    ], 
    "brightens": [
        "VBZ"
    ], 
    "export-license": [
        "JJ", 
        "NN"
    ], 
    "Cathy": [
        "NNP"
    ], 
    "twelve-year-old": [
        "JJ"
    ], 
    "bluefish": [
        "NNS"
    ], 
    "Barnard": [
        "NNP", 
        "NN"
    ], 
    "load-shedding": [
        "NNS"
    ], 
    "restorer": [
        "NN"
    ], 
    "annuity": [
        "NN"
    ], 
    "pseudo": [
        "JJ"
    ], 
    "worked": [
        "VBD", 
        "VBN"
    ], 
    "scribblers": [
        "NNS"
    ], 
    "Substitute": [
        "JJ"
    ], 
    "Daikin": [
        "NNP"
    ], 
    "Exploracion": [
        "NNP"
    ], 
    "restored": [
        "VBN", 
        "VBD"
    ], 
    "discreetly": [
        "RB"
    ], 
    "E.G.": [
        "NNP"
    ], 
    "hijacker": [
        "NN"
    ], 
    "Torino": [
        "NNP"
    ], 
    "Tango": [
        "NNP"
    ], 
    "Winning": [
        "VBG", 
        "NNP"
    ], 
    "Kalevi": [
        "NNP"
    ], 
    "redouble": [
        "VB"
    ], 
    "myelofibrosis": [
        "NN"
    ], 
    "hijacked": [
        "VBN", 
        "VBD"
    ], 
    "DALLAS": [
        "NNP"
    ], 
    "swoon": [
        "NN"
    ], 
    "father": [
        "NN", 
        "VB"
    ], 
    "parenchyma": [
        "NN"
    ], 
    "Redskins": [
        "NNPS"
    ], 
    "analogous": [
        "JJ"
    ], 
    "Washington-based": [
        "JJ"
    ], 
    "telegraph": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Lakeland": [
        "NNP"
    ], 
    "Sewanee": [
        "NNP"
    ], 
    "Cantobank": [
        "NNP"
    ], 
    "Tenements": [
        "NNS"
    ], 
    "enslavement": [
        "NN"
    ], 
    "self-proclaimed": [
        "JJ"
    ], 
    "undergirding": [
        "NN"
    ], 
    "airings": [
        "NNS"
    ], 
    "biceps": [
        "NNS", 
        "NN"
    ], 
    "stiffed": [
        "VBD", 
        "VBN"
    ], 
    "cheapest": [
        "JJS"
    ], 
    "proposals": [
        "NNS"
    ], 
    "tartans": [
        "NNS"
    ], 
    "trombones": [
        "NNS"
    ], 
    "turgid": [
        "JJ"
    ], 
    "Mahmoud": [
        "NNP"
    ], 
    "Fidelity": [
        "NNP"
    ], 
    "misimpressions": [
        "NNS"
    ], 
    "stiffer": [
        "JJR"
    ], 
    "talked": [
        "VBD", 
        "VBN"
    ], 
    "Curcio": [
        "NNP"
    ], 
    "Merger": [
        "NN", 
        "NNP"
    ], 
    "four-crate": [
        "JJ"
    ], 
    "onrushing": [
        "JJ"
    ], 
    "measurable": [
        "JJ"
    ], 
    "Pittsburghers": [
        "NNPS"
    ], 
    "measurably": [
        "RB"
    ], 
    "currant": [
        "NN"
    ], 
    "Zoghby": [
        "NNP"
    ], 
    "targets": [
        "NNS", 
        "VBZ"
    ], 
    "Define": [
        "VB"
    ], 
    "majors": [
        "NNS"
    ], 
    "page-one": [
        "JJ", 
        "NN"
    ], 
    "distension": [
        "NN"
    ], 
    "self-redefinition": [
        "NN"
    ], 
    "encrusted": [
        "VBN"
    ], 
    "Comend": [
        "VB"
    ], 
    "Klette": [
        "NNP"
    ], 
    "annals": [
        "NNS", 
        "NN"
    ], 
    "suspect": [
        "VBP", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "noconfidence": [
        "JJ"
    ], 
    "less-than-perfect": [
        "JJ"
    ], 
    "covetousness": [
        "NN"
    ], 
    "processing": [
        "NN", 
        "VBG"
    ], 
    "Bishops": [
        "NNP", 
        "NNS"
    ], 
    "Latvians": [
        "NNPS"
    ], 
    "DSW": [
        "NN"
    ], 
    "Bids": [
        "NNS"
    ], 
    "DSP": [
        "NNP"
    ], 
    "cushioning": [
        "NN", 
        "VBG"
    ], 
    "DSL": [
        "NNP"
    ], 
    "DSM": [
        "NNP"
    ], 
    "DSG": [
        "NNP"
    ], 
    "frosting": [
        "NN"
    ], 
    "colonization": [
        "NN"
    ], 
    "Muffling": [
        "VBG"
    ], 
    "box": [
        "NN", 
        "VB"
    ], 
    "boy": [
        "NN", 
        "UH"
    ], 
    "diagnoses": [
        "NNS", 
        "VBZ"
    ], 
    "Founder": [
        "NN", 
        "NNP"
    ], 
    "bop": [
        "NN"
    ], 
    "grinned": [
        "VBD"
    ], 
    "bow": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Founded": [
        "VBN"
    ], 
    "spheres": [
        "NNS"
    ], 
    "Daylight": [
        "NNP"
    ], 
    "diagnosed": [
        "VBN", 
        "VBD"
    ], 
    "bon": [
        "FW"
    ], 
    "Jaques": [
        "NNP"
    ], 
    "boa": [
        "NN"
    ], 
    "Antonini": [
        "NNP"
    ], 
    "bog": [
        "VB", 
        "NN"
    ], 
    "teenage": [
        "JJ"
    ], 
    "Cortlandt": [
        "NNP"
    ], 
    "KFAC-FM": [
        "NNP"
    ], 
    "passthrough": [
        "JJ"
    ], 
    "Mannix": [
        "NNP"
    ], 
    "Lansing": [
        "NNP"
    ], 
    "close-knit": [
        "JJ"
    ], 
    "mainframe-class": [
        "JJ", 
        "NN"
    ], 
    "transplant": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Couperin": [
        "NNP"
    ], 
    "infinitum": [
        "FW", 
        "NN"
    ], 
    "Conrail": [
        "NNP"
    ], 
    "cooperates": [
        "VBZ"
    ], 
    "uncritical": [
        "JJ"
    ], 
    "Tonio": [
        "NNP"
    ], 
    "vineyard": [
        "NN"
    ], 
    "Aerospace": [
        "NNP", 
        "NN"
    ], 
    "cooperated": [
        "VBN", 
        "VBD"
    ], 
    "Maintaining": [
        "VBG"
    ], 
    "scriptwriters": [
        "NNS"
    ], 
    "Kingwood": [
        "NNP"
    ], 
    "beadwork": [
        "NN"
    ], 
    "Carletonian": [
        "NNP"
    ], 
    "polymerizations": [
        "NNS"
    ], 
    "labyrinth": [
        "NN"
    ], 
    "Behaviour": [
        "NN"
    ], 
    "Customhouse": [
        "NNP"
    ], 
    "forswears": [
        "VBZ"
    ], 
    "AUS": [
        "NNP"
    ], 
    "Money-market": [
        "NN"
    ], 
    "Ginsberg": [
        "NNP"
    ], 
    "bushels": [
        "NNS"
    ], 
    "four-syllable": [
        "JJ"
    ], 
    "JOIN": [
        "VB"
    ], 
    "evil-doers": [
        "NNS"
    ], 
    "McAfee": [
        "NNP"
    ], 
    "quoting": [
        "VBG"
    ], 
    "Scan": [
        "NNP"
    ], 
    "whizzed": [
        "VBD"
    ], 
    "frivolity": [
        "NN"
    ], 
    "drags": [
        "VBZ"
    ], 
    "Numbers": [
        "NNS", 
        "NNPS"
    ], 
    "romanticized": [
        "VBN"
    ], 
    "Ekstrohm": [
        "NNP"
    ], 
    "Abney": [
        "NNP"
    ], 
    "thicknesses": [
        "NNS"
    ], 
    "Purkis": [
        "NNP"
    ], 
    "Heather": [
        "NNP"
    ], 
    "Conalco": [
        "NNP"
    ], 
    "non-user": [
        "NN"
    ], 
    "fuck": [
        "VB"
    ], 
    "forerunners": [
        "NNS"
    ], 
    "Cougar": [
        "NNP"
    ], 
    "floodheads": [
        "NNS"
    ], 
    "RE-ENTRY": [
        "NNP"
    ], 
    "subconsciously": [
        "RB"
    ], 
    "metal-workers": [
        "NNS"
    ], 
    "Earns": [
        "VBZ"
    ], 
    "nonchalant": [
        "JJ"
    ], 
    "Carrollton": [
        "NNP"
    ], 
    "Flotilla": [
        "NNP"
    ], 
    "irreverent": [
        "JJ"
    ], 
    "hazardous-waste": [
        "NN", 
        "JJ"
    ], 
    "Liddell": [
        "NNP"
    ], 
    "Germania": [
        "NNP"
    ], 
    "male-sterile": [
        "JJ"
    ], 
    "Germanic": [
        "JJ", 
        "NNP"
    ], 
    "metamidophos": [
        "NNS"
    ], 
    "Amerongen": [
        "NNP"
    ], 
    "Urn": [
        "NNP"
    ], 
    "proto-senility": [
        "NN"
    ], 
    "hand-tooled": [
        "JJ"
    ], 
    "membership": [
        "NN"
    ], 
    "nondairy": [
        "JJ"
    ], 
    "Urs": [
        "NNP"
    ], 
    "New-construction": [
        "NN"
    ], 
    "CORP.": [
        "NNP"
    ], 
    "sweat-soaked": [
        "JJ"
    ], 
    "fetal-alcohol": [
        "JJ"
    ], 
    "heat-treatment": [
        "NN"
    ], 
    "Braniff": [
        "NNP"
    ], 
    "Restless": [
        "JJ"
    ], 
    "reseller": [
        "JJR", 
        "JJ", 
        "NN"
    ], 
    "elongation": [
        "NN"
    ], 
    "Olean": [
        "NNP"
    ], 
    "Headland": [
        "NNP"
    ], 
    "caption": [
        "NN"
    ], 
    "brokerage-firm": [
        "JJ"
    ], 
    "Nicaraguan": [
        "JJ", 
        "NNP"
    ], 
    "Sequa": [
        "NNP"
    ], 
    "demonstratives": [
        "NNS"
    ], 
    "Hasbrouck": [
        "NNP"
    ], 
    "oncology": [
        "NN"
    ], 
    "spreadsheets": [
        "NNS"
    ], 
    "half-inch": [
        "JJ"
    ], 
    "fatalities": [
        "NNS"
    ], 
    "solder": [
        "JJ", 
        "VB"
    ], 
    "blooded": [
        "VBN"
    ], 
    "Trappings": [
        "NNP"
    ], 
    "Cf.": [
        "VB"
    ], 
    "Muscle": [
        "NN", 
        "NNP"
    ], 
    "police": [
        "NN", 
        "VB", 
        "NNS"
    ], 
    "krater": [
        "NN"
    ], 
    "domestic-policy": [
        "JJ", 
        "NN"
    ], 
    "Rail": [
        "NNP", 
        "NN"
    ], 
    "Rain": [
        "NNP", 
        "NN"
    ], 
    "Regis": [
        "NNP"
    ], 
    "Guatemala": [
        "NNP"
    ], 
    "Opportunity": [
        "NNP", 
        "NN"
    ], 
    "policy": [
        "NN"
    ], 
    "one-out-of-three": [
        "JJ"
    ], 
    "sterility": [
        "NN"
    ], 
    "transparently": [
        "RB"
    ], 
    "reinvested": [
        "VBN", 
        "VBD"
    ], 
    "underpinning": [
        "NN", 
        "VBG"
    ], 
    "Terg-O-Tometer": [
        "NNP"
    ], 
    "Solomons": [
        "NNPS"
    ], 
    "tucked": [
        "VBN", 
        "VBD"
    ], 
    "Burghardt": [
        "NNP"
    ], 
    "soulful": [
        "JJ"
    ], 
    "contravened": [
        "VBD", 
        "VBN"
    ], 
    "lunch": [
        "NN", 
        "VB"
    ], 
    "markings": [
        "NNS"
    ], 
    "Fiasco": [
        "NNP", 
        "NN"
    ], 
    "teller": [
        "NN"
    ], 
    "Kloner": [
        "NNP"
    ], 
    "pimp": [
        "NN"
    ], 
    "Selmer-Sande": [
        "NNP"
    ], 
    "Trabb": [
        "NNP"
    ], 
    "Seville": [
        "NNP"
    ], 
    "showcasing": [
        "VBG"
    ], 
    "home-owners": [
        "NNS"
    ], 
    "PANEL": [
        "NN"
    ], 
    "physiologic": [
        "JJ"
    ], 
    "motherland": [
        "NN"
    ], 
    "one-over-par": [
        "JJ"
    ], 
    "Sentelle": [
        "NNP"
    ], 
    "unachievable": [
        "JJ"
    ], 
    "elephants": [
        "NNS"
    ], 
    "mass-market": [
        "JJ", 
        "NN"
    ], 
    "well-paying": [
        "JJ"
    ], 
    "SERVICES": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "foreign-trading": [
        "JJ"
    ], 
    "Routine": [
        "JJ"
    ], 
    "tax-exemption": [
        "NN"
    ], 
    "Disappointing": [
        "JJ"
    ], 
    "Lollipops": [
        "NNS"
    ], 
    "carrion": [
        "JJ", 
        "NN"
    ], 
    "Successful": [
        "JJ", 
        "NNP"
    ], 
    "HEFTY": [
        "NNP"
    ], 
    "FSLIC": [
        "NNP"
    ], 
    "Pocket": [
        "NNP"
    ], 
    "firewater": [
        "NN"
    ], 
    "bailout": [
        "NN"
    ], 
    "Stansfield": [
        "NNP"
    ], 
    "Longer-term": [
        "JJ", 
        "RB"
    ], 
    "assurance": [
        "NN"
    ], 
    "registries": [
        "NNS"
    ], 
    "irrigating": [
        "VBG"
    ], 
    "G": [
        "NN", 
        "NNP", 
        "LS"
    ], 
    "Rights": [
        "NNP", 
        "NN", 
        "NNS", 
        "NNPS"
    ], 
    "Needing": [
        "VBG"
    ], 
    "non-bank": [
        "JJ"
    ], 
    "publicsector": [
        "JJ"
    ], 
    "coffers": [
        "NNS"
    ], 
    "noisemakers": [
        "NNS"
    ], 
    "Luigi": [
        "NNS"
    ], 
    "ajar": [
        "RB"
    ], 
    "Maharashtra": [
        "NNP"
    ], 
    "Fight": [
        "VB", 
        "NN"
    ], 
    "carnival": [
        "NN"
    ], 
    "waiter": [
        "NN"
    ], 
    "contented": [
        "VBN", 
        "JJ"
    ], 
    "Microscopes": [
        "NNS"
    ], 
    "bar-buddy": [
        "NN"
    ], 
    "Andruses": [
        "NNPS"
    ], 
    "vision": [
        "NN"
    ], 
    "frequent": [
        "JJ", 
        "VBP", 
        "VB"
    ], 
    "adoptees": [
        "NNS"
    ], 
    "Lindens": [
        "NNPS"
    ], 
    "fleeing": [
        "VBG"
    ], 
    "dungeons": [
        "NNS"
    ], 
    "SHEVARDNADZE": [
        "NNP"
    ], 
    "subterfuges": [
        "NNS"
    ], 
    "neo-populist": [
        "JJ"
    ], 
    "Super-Protein": [
        "NNP"
    ], 
    "enthralled": [
        "JJ", 
        "VBN"
    ], 
    "Black": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "intrastate": [
        "JJ"
    ], 
    "overheating": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "noisier": [
        "JJR"
    ], 
    "infant-formula": [
        "NN"
    ], 
    "Lecky": [
        "NNP"
    ], 
    "Isolating": [
        "VBG"
    ], 
    "Anglo-American": [
        "NNP", 
        "JJ"
    ], 
    "Minerva": [
        "NNP"
    ], 
    "Norwell": [
        "NNP"
    ], 
    "home-state": [
        "JJ"
    ], 
    "bare-bones": [
        "JJ"
    ], 
    "flatiron": [
        "NN"
    ], 
    "Saxe": [
        "NNP"
    ], 
    "vacuum-tube": [
        "JJ"
    ], 
    "fifteen-mile": [
        "JJ"
    ], 
    "speaking": [
        "VBG", 
        "NN"
    ], 
    "anti-South": [
        "JJ"
    ], 
    "Oncor": [
        "NNP"
    ], 
    "inefficient": [
        "JJ"
    ], 
    "Miracle": [
        "NNP"
    ], 
    "Ministries": [
        "NNP"
    ], 
    "Denouncing": [
        "VBG"
    ], 
    "Court-packing": [
        "JJ"
    ], 
    "Hanshin": [
        "NNP"
    ], 
    "set-up": [
        "NN"
    ], 
    "Consulting": [
        "NNP", 
        "NN"
    ], 
    "doddering": [
        "JJ"
    ], 
    "log-jam": [
        "NN"
    ], 
    "Addwest": [
        "NNP"
    ], 
    "automakers": [
        "NNS"
    ], 
    "big-shouldered": [
        "JJ"
    ], 
    "Styrofoam": [
        "NNP"
    ], 
    "Jayark": [
        "NNP"
    ], 
    "metre": [
        "NN"
    ], 
    "DeWalt": [
        "NNP"
    ], 
    "thyrotoxic": [
        "JJ"
    ], 
    "EUROPE": [
        "NNP"
    ], 
    "global-news": [
        "NN"
    ], 
    "Prescription-drug": [
        "NN"
    ], 
    "Bandini": [
        "NNP"
    ], 
    "Rockies": [
        "NNPS"
    ], 
    "defecting": [
        "VBG"
    ], 
    "Expectations": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Lovett": [
        "NNP"
    ], 
    "hard-hit": [
        "JJ"
    ], 
    "incontestable": [
        "JJ"
    ], 
    "himself": [
        "PRP"
    ], 
    "pastry": [
        "NN"
    ], 
    "nondefeatist": [
        "JJ"
    ], 
    "Waterston": [
        "NNP"
    ], 
    "Torrance": [
        "NNP"
    ], 
    "squaw": [
        "NN"
    ], 
    "squat": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Steudler": [
        "NNP"
    ], 
    "Broncs": [
        "NNP"
    ], 
    "foreigner": [
        "NN"
    ], 
    "complexity": [
        "NN"
    ], 
    "shocked": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "more-muscular": [
        "JJ"
    ], 
    "squad": [
        "NN"
    ], 
    "quieting": [
        "VBG"
    ], 
    "reacquainted": [
        "VBN"
    ], 
    "Bronco": [
        "NNP"
    ], 
    "Kazakhstan": [
        "NNP"
    ], 
    "Mathematical": [
        "JJ"
    ], 
    "ultimate": [
        "JJ"
    ], 
    "flattered": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Worldwide": [
        "NNP"
    ], 
    "DHL": [
        "NNP"
    ], 
    "innuendoes": [
        "NNS"
    ], 
    "Parrot": [
        "NNP"
    ], 
    "with-it": [
        "JJ"
    ], 
    "arguing": [
        "VBG", 
        "NN"
    ], 
    "cathedrals": [
        "NNS"
    ], 
    "cost-raising": [
        "JJ"
    ], 
    "billon": [
        "NN"
    ], 
    "out-migration": [
        "NN"
    ], 
    "humorists": [
        "NNS"
    ], 
    "Kellum": [
        "NNP"
    ], 
    "tugging": [
        "VBG"
    ], 
    "Keane": [
        "NNP"
    ], 
    "incisive": [
        "JJ"
    ], 
    "wheel-loader": [
        "JJ"
    ], 
    "angst": [
        "NN"
    ], 
    "bleating": [
        "VBG"
    ], 
    "cosponsors": [
        "VBZ"
    ], 
    "Actively": [
        "RB"
    ], 
    "Graubart": [
        "NNP"
    ], 
    "Duty-free": [
        "JJ"
    ], 
    "iniquitous": [
        "JJ"
    ], 
    "Harriers": [
        "NNPS"
    ], 
    "WE": [
        "PRP"
    ], 
    "WB": [
        "NNP"
    ], 
    "big-boned": [
        "JJ"
    ], 
    "Detached": [
        "VBN"
    ], 
    "pro-U.N.F.P.": [
        "JJ"
    ], 
    "Yuppie": [
        "NNP", 
        "NN"
    ], 
    "disunity": [
        "NN"
    ], 
    "WW": [
        "NNP"
    ], 
    "bedside": [
        "NN"
    ], 
    "Barre": [
        "NNP"
    ], 
    "maninstays": [
        "NNS"
    ], 
    "high-profile": [
        "JJ"
    ], 
    "sponsorship": [
        "NN"
    ], 
    "enthusiast": [
        "NN"
    ], 
    "new-rich": [
        "JJ"
    ], 
    "We": [
        "PRP", 
        "NNP", 
        "NN"
    ], 
    "Wa": [
        "NNP", 
        ","
    ], 
    "Wo": [
        "MD"
    ], 
    "non-Soviet": [
        "JJ"
    ], 
    "treasure": [
        "NN", 
        "VBP"
    ], 
    "Uzi-model": [
        "JJ"
    ], 
    "Wu": [
        "NNP"
    ], 
    "windbag": [
        "NN"
    ], 
    "Diary": [
        "NNP"
    ], 
    "coagulating": [
        "VBG"
    ], 
    "travesty": [
        "NN", 
        "VB"
    ], 
    "treasury": [
        "NN"
    ], 
    "enthusiasm": [
        "NN"
    ], 
    "pegged": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Partisan": [
        "NNP"
    ], 
    "program-trade": [
        "JJ"
    ], 
    "even-larger": [
        "JJ"
    ], 
    "Kleist": [
        "NNP"
    ], 
    "self-plagiarisms": [
        "NNS"
    ], 
    "seekin": [
        "VBG"
    ], 
    "Frothingham": [
        "NNP"
    ], 
    "satiety": [
        "NN"
    ], 
    "hailed": [
        "VBD", 
        "VBN"
    ], 
    "gee": [
        "UH"
    ], 
    "juleps": [
        "NNS"
    ], 
    "unaltered": [
        "JJ"
    ], 
    "chiropractor": [
        "NN"
    ], 
    "bitters": [
        "NNS"
    ], 
    "Pelin": [
        "NNP"
    ], 
    "enjoys": [
        "VBZ"
    ], 
    "in-migration": [
        "NN"
    ], 
    "Mommor": [
        "NNP"
    ], 
    "Laird": [
        "NNP"
    ], 
    "Right": [
        "RB", 
        "NNP", 
        "JJ", 
        "NN", 
        "UH"
    ], 
    "Angel": [
        "NNP"
    ], 
    "W.": [
        "NNP", 
        "NN"
    ], 
    "colossus": [
        "NN"
    ], 
    "Snodgrass": [
        "NNP"
    ], 
    "requesting": [
        "VBG"
    ], 
    "growth-stunting": [
        "JJ"
    ], 
    "miles": [
        "NNS"
    ], 
    "Weiler": [
        "NNP"
    ], 
    "less-restrictive": [
        "JJ"
    ], 
    "nostril": [
        "NN"
    ], 
    "Attribute": [
        "NNP"
    ], 
    "Anger": [
        "VBP", 
        "NN"
    ], 
    "tallow": [
        "NN"
    ], 
    "Delacre": [
        "NNP"
    ], 
    "ANR": [
        "NNP"
    ], 
    "declared": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Wyndham": [
        "NNP"
    ], 
    "Grant": [
        "NNP", 
        "VB"
    ], 
    "Provide": [
        "VB", 
        "VBP"
    ], 
    "sear": [
        "VB"
    ], 
    "Wansee": [
        "NNP"
    ], 
    "seat": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "starlet": [
        "NN"
    ], 
    "HELD": [
        "VBD"
    ], 
    "declares": [
        "VBZ"
    ], 
    "Neave": [
        "NNP"
    ], 
    "Grand": [
        "NNP", 
        "FW", 
        "JJ"
    ], 
    "Placement": [
        "NNP", 
        "NN"
    ], 
    "emulating": [
        "VBG"
    ], 
    "Grano": [
        "NNP"
    ], 
    "Shaefer": [
        "NNP"
    ], 
    "Machiguenga": [
        "NNP"
    ], 
    "Nakazato": [
        "NNP"
    ], 
    "Bonecrusher": [
        "NNP"
    ], 
    "indicted": [
        "VBN", 
        "VBD"
    ], 
    "Illiterate": [
        "JJ"
    ], 
    "tongue-tied": [
        "JJ"
    ], 
    "pilot-management": [
        "JJ"
    ], 
    "label": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "boundaries": [
        "NNS"
    ], 
    "public-information": [
        "JJ"
    ], 
    "permeated": [
        "VBN", 
        "VBD"
    ], 
    "Mercantilists": [
        "NNS"
    ], 
    "government...": [
        ":"
    ], 
    "across": [
        "IN", 
        "RB", 
        "RP"
    ], 
    "property-tax": [
        "JJ"
    ], 
    "satiate": [
        "VB"
    ], 
    "Nervousness": [
        "NN"
    ], 
    "infrastructure": [
        "NN"
    ], 
    "august": [
        "JJ"
    ], 
    "FOR": [
        "IN"
    ], 
    "FOX": [
        "NN"
    ], 
    "data-base": [
        "JJ", 
        "NN"
    ], 
    "procreativity": [
        "NN"
    ], 
    "dreamless": [
        "JJ"
    ], 
    "dogging": [
        "VBG"
    ], 
    "Each": [
        "DT"
    ], 
    "beefed-up": [
        "JJ"
    ], 
    "gauntlet": [
        "NN"
    ], 
    "Perse": [
        "NNP"
    ], 
    "per-passenger": [
        "NN"
    ], 
    "Potlatch": [
        "NNP"
    ], 
    "Carver": [
        "NNP"
    ], 
    "philosophically": [
        "RB"
    ], 
    "feelers": [
        "NNS"
    ], 
    "Carvey": [
        "NNP"
    ], 
    "fulminate": [
        "VB"
    ], 
    "badly-needed": [
        "JJ"
    ], 
    "blasts": [
        "NNS"
    ], 
    "sketchy": [
        "JJ"
    ], 
    "Taught": [
        "VBN"
    ], 
    "tout": [
        "VB", 
        "FW", 
        "NN"
    ], 
    "Carved": [
        "JJ"
    ], 
    "Statistical": [
        "NNP", 
        "JJ"
    ], 
    "womanhood": [
        "NN"
    ], 
    "Laboratory": [
        "NNP", 
        "NN"
    ], 
    "longshot": [
        "NN"
    ], 
    "nonentity": [
        "NN"
    ], 
    "long-sleeved": [
        "JJ"
    ], 
    "ISRAEL": [
        "NNP"
    ], 
    "polities": [
        "NNS"
    ], 
    "about-face": [
        "NN"
    ], 
    "Wachtel": [
        "NNP"
    ], 
    "dislocations": [
        "NNS"
    ], 
    "V-shaped": [
        "JJ"
    ], 
    "McLennan": [
        "NNP"
    ], 
    "PRICIEST": [
        "JJS"
    ], 
    "Riley": [
        "NNP"
    ], 
    "considering": [
        "VBG"
    ], 
    "Assembly": [
        "NNP", 
        "NN"
    ], 
    "capable": [
        "JJ"
    ], 
    "wobble": [
        "VB", 
        "NN"
    ], 
    "Affiliates": [
        "NNP", 
        "NNPS"
    ], 
    "Optical": [
        "NNP"
    ], 
    "wobbly": [
        "JJ"
    ], 
    "Assemble": [
        "VB"
    ], 
    "Affiliated": [
        "NNP", 
        "VBN"
    ], 
    "capably": [
        "RB"
    ], 
    "derogation": [
        "NN"
    ], 
    "lustily": [
        "RB"
    ], 
    "vopos": [
        "FW"
    ], 
    "repurchasing": [
        "VBG"
    ], 
    "circumference": [
        "NN"
    ], 
    "Hathaway": [
        "NNP"
    ], 
    "wake": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Solovyov": [
        "NNP"
    ], 
    "stand-ups": [
        "NNS"
    ], 
    "hardcore": [
        "JJ", 
        "NN"
    ], 
    "Revise": [
        "VB"
    ], 
    "plastering": [
        "NN"
    ], 
    "Chiaromonte": [
        "NNP"
    ], 
    "Showalter": [
        "NNP"
    ], 
    "earlier-reported": [
        "JJ"
    ], 
    "Baths": [
        "NNPS"
    ], 
    "investigating": [
        "VBG", 
        "NN"
    ], 
    "Shipbuilders": [
        "NNPS"
    ], 
    "falsified": [
        "VBN"
    ], 
    "blackballed": [
        "VBN"
    ], 
    "Shivers": [
        "NNP"
    ], 
    "Crutzen": [
        "NNP"
    ], 
    "Tibetan-like": [
        "JJ"
    ], 
    "Burge": [
        "NNP"
    ], 
    "Intermediate": [
        "NNP", 
        "JJ"
    ], 
    "Blumenfeld": [
        "NNP"
    ], 
    "Symposium": [
        "NNP", 
        "NN"
    ], 
    "protein": [
        "NN"
    ], 
    "Targetted": [
        "NNP"
    ], 
    "essayish": [
        "JJ"
    ], 
    "doubting": [
        "VBG", 
        "JJ"
    ], 
    "dairies": [
        "NNS"
    ], 
    "paring": [
        "VBG"
    ], 
    "woodland": [
        "JJ"
    ], 
    "Infusion": [
        "NN"
    ], 
    "lava": [
        "NN"
    ], 
    "Destruction": [
        "NN", 
        "NNP"
    ], 
    "grantors": [
        "NNS"
    ], 
    "extended": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "expended": [
        "VBN", 
        "VBD"
    ], 
    "Mustangs": [
        "NNP"
    ], 
    "incarceration": [
        "NN"
    ], 
    "Barcelona": [
        "NNP"
    ], 
    "annulled": [
        "VBD"
    ], 
    "Holliday": [
        "NNP"
    ], 
    "Ortho": [
        "NNP"
    ], 
    "CAPITAL": [
        "NNP", 
        "NN"
    ], 
    "pistoleers": [
        "NNS"
    ], 
    "shopworn": [
        "JJ"
    ], 
    "Hampton": [
        "NNP"
    ], 
    "Indian-summer": [
        "JJ"
    ], 
    "identifiers": [
        "NNS"
    ], 
    "Fosterites": [
        "NNP"
    ], 
    "stunted": [
        "VBN"
    ], 
    "Carlton": [
        "NNP"
    ], 
    "Bit": [
        "NN", 
        "RB"
    ], 
    "admonishing": [
        "VBG"
    ], 
    "Marxists": [
        "NNPS"
    ], 
    "allowance": [
        "NN"
    ], 
    "convened": [
        "VBD", 
        "VBN"
    ], 
    "nitrogen-fertilizer": [
        "NN"
    ], 
    "consisted": [
        "VBD", 
        "VBN"
    ], 
    "alfalfa": [
        "NN"
    ], 
    "Englishy": [
        "JJ"
    ], 
    "Einsatzkommandos": [
        "NNP"
    ], 
    "Feedlots": [
        "NNS"
    ], 
    "snug-fitting": [
        "JJ"
    ], 
    "Pittsburg": [
        "NNP"
    ], 
    "leeway": [
        "NN"
    ], 
    "flavor": [
        "NN"
    ], 
    "embroideries": [
        "NNS"
    ], 
    "statesmen": [
        "NNS"
    ], 
    "willy-nilly": [
        "JJ", 
        "RB"
    ], 
    "decriminalization": [
        "NN"
    ], 
    "tourism": [
        "NN"
    ], 
    "Putka": [
        "NNP"
    ], 
    "pre-clinical": [
        "JJ"
    ], 
    "silver-painted": [
        "JJ"
    ], 
    "Weekes": [
        "NNP"
    ], 
    "Nisbet": [
        "NNP"
    ], 
    "Enver": [
        "NNP"
    ], 
    "swooning": [
        "NN"
    ], 
    "glutinous": [
        "JJ"
    ], 
    "tenses": [
        "NNS"
    ], 
    "First-Born": [
        "NNP"
    ], 
    "Coconut": [
        "NNP"
    ], 
    "tensed": [
        "VBD"
    ], 
    "Telefonica": [
        "NNP"
    ], 
    "Well-trained": [
        "JJ"
    ], 
    "GRAND": [
        "JJ", 
        "NNP"
    ], 
    "Liberal": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "DC-10s": [
        "NNPS", 
        "NNS"
    ], 
    "vertically": [
        "RB"
    ], 
    "acquainted": [
        "VBN"
    ], 
    "vending": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "arsonist": [
        "NN"
    ], 
    "Haase": [
        "NNP"
    ], 
    "utopians": [
        "NNS"
    ], 
    "Gannon": [
        "NNP"
    ], 
    "demography": [
        "NN"
    ], 
    "Moreover": [
        "RB", 
        "JJR"
    ], 
    "passionate": [
        "JJ"
    ], 
    "escalators": [
        "NNS"
    ], 
    "Digest": [
        "NNP", 
        "NN"
    ], 
    "woolly-minded": [
        "JJ"
    ], 
    "Schmidt-Chiari": [
        "NNP"
    ], 
    "obsessions": [
        "NNS"
    ], 
    "Gilkson": [
        "NNP"
    ], 
    "Romana": [
        "NNP"
    ], 
    "pronounce": [
        "VB"
    ], 
    "Analogously": [
        "RB"
    ], 
    "showman": [
        "NN"
    ], 
    "Pembina": [
        "NNP"
    ], 
    "snoring": [
        "VBG", 
        "NN"
    ], 
    "smarting": [
        "VBG"
    ], 
    "prerogatives": [
        "NNS"
    ], 
    "potentiometer": [
        "NN"
    ], 
    "illustrated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Shipyard": [
        "NNP"
    ], 
    "Pasteur": [
        "NNP"
    ], 
    "Skies": [
        "NNPS"
    ], 
    "thrust-to-weight": [
        "JJ"
    ], 
    "staff-reduction": [
        "NN", 
        "JJ"
    ], 
    "snake-like": [
        "JJ"
    ], 
    "job-training": [
        "NN"
    ], 
    "Ciardi": [
        "NNP"
    ], 
    "fitness": [
        "NN"
    ], 
    "sixty-day": [
        "JJ"
    ], 
    "Vietnam": [
        "NNP"
    ], 
    "glycerol": [
        "NN"
    ], 
    "Behavior": [
        "NN"
    ], 
    "Assuredly": [
        "RB"
    ], 
    "glomerular": [
        "JJ"
    ], 
    "Intermediates": [
        "NNPS", 
        "NNS"
    ], 
    "long-studied": [
        "JJ"
    ], 
    "R-shaped": [
        "JJ"
    ], 
    "lithograph": [
        "NN"
    ], 
    "city-states": [
        "NNS"
    ], 
    "Images": [
        "NNP"
    ], 
    "most-dangerous": [
        "JJ"
    ], 
    "purported": [
        "JJ", 
        "VBD"
    ], 
    "fertile": [
        "JJ"
    ], 
    "Middletown": [
        "NNP"
    ], 
    "quintets": [
        "NNS"
    ], 
    "cranny": [
        "NN"
    ], 
    "Buaford": [
        "NNP"
    ], 
    "Maintenance": [
        "NNP", 
        "NN"
    ], 
    "certitudes": [
        "NNS"
    ], 
    "Trapped": [
        "VBN"
    ], 
    "pastures": [
        "NNS"
    ], 
    "hassling": [
        "VBG"
    ], 
    "Leperq": [
        "NNP"
    ], 
    "Baruschke": [
        "NNP"
    ], 
    "distracted": [
        "VBN", 
        "VBD"
    ], 
    "collided": [
        "VBD"
    ], 
    "deadlines": [
        "NNS"
    ], 
    "heroine": [
        "NN"
    ], 
    "Appropriation": [
        "NNP"
    ], 
    "practised": [
        "JJ"
    ], 
    "tyrosine": [
        "NN"
    ], 
    "gains-tax-cut": [
        "JJ"
    ], 
    "spicy": [
        "JJ"
    ], 
    "Baliles": [
        "NNP"
    ], 
    "Dorgan": [
        "NNP"
    ], 
    "wholehearted": [
        "JJ"
    ], 
    "Orlick": [
        "NNP"
    ], 
    "pre-kidnap": [
        "JJ"
    ], 
    "Meller": [
        "NNP"
    ], 
    "information-services": [
        "JJ", 
        "NNS"
    ], 
    "Mellen": [
        "NNP"
    ], 
    "whichever-the-hell": [
        "JJ"
    ], 
    "teddy-bear": [
        "NN"
    ], 
    "BATTLED": [
        "VBD"
    ], 
    "Guber": [
        "NNP"
    ], 
    "spice": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "well-understood": [
        "JJ"
    ], 
    "Eddie": [
        "NNP"
    ], 
    "Angeles-based": [
        "JJ"
    ], 
    "Wheat-germ": [
        "NN"
    ], 
    "powerless": [
        "JJ"
    ], 
    "dawdling": [
        "VBG"
    ], 
    "Hershiser": [
        "NNP"
    ], 
    "aesthetes": [
        "NNS"
    ], 
    "Shijie": [
        "NNP"
    ], 
    "Crucial": [
        "JJ"
    ], 
    "one-sixteenth": [
        "NN"
    ], 
    "undiminished": [
        "JJ"
    ], 
    "examine": [
        "VB", 
        "VBP"
    ], 
    "spat": [
        "VBD", 
        "NN"
    ], 
    "Riding": [
        "VBG", 
        "NNP"
    ], 
    "Weinroth": [
        "NNP"
    ], 
    "Mulligatawny": [
        "NNP"
    ], 
    "casualty": [
        "NN"
    ], 
    "strikers": [
        "NNS"
    ], 
    "Busby": [
        "NNP"
    ], 
    "turmoils": [
        "NNS"
    ], 
    "Cuneo": [
        "NNP"
    ], 
    "designating": [
        "VBG"
    ], 
    "weeded": [
        "VBN"
    ], 
    "Courtenay": [
        "NNP"
    ], 
    "what-nots": [
        "NNS"
    ], 
    "Buddhists": [
        "NNP"
    ], 
    "Somewhat": [
        "RB"
    ], 
    "redeposition": [
        "NN"
    ], 
    "Tse-tung": [
        "NNP"
    ], 
    "painted-in": [
        "NN"
    ], 
    "victimize": [
        "VBP"
    ], 
    "Milko": [
        "NNP"
    ], 
    "Climate": [
        "NNP", 
        "NN"
    ], 
    "deliverers": [
        "NNS"
    ], 
    "FPA": [
        "NNP"
    ], 
    "equitably": [
        "RB"
    ], 
    "Fixed-income": [
        "JJ", 
        "NN"
    ], 
    "FPL": [
        "NNP"
    ], 
    "Yorktown": [
        "NNP"
    ], 
    "custom-made": [
        "JJ", 
        "VBN"
    ], 
    "Milka": [
        "NNP"
    ], 
    "Milky": [
        "NNP"
    ], 
    "Alfredo": [
        "NNP"
    ], 
    "equitable": [
        "JJ"
    ], 
    "itches": [
        "VBZ"
    ], 
    "Beneficial": [
        "NNP"
    ], 
    "blackmailers": [
        "NNS"
    ], 
    "Healthdyne": [
        "NNP"
    ], 
    "wanta": [
        "VB"
    ], 
    "excretion": [
        "NN"
    ], 
    "boosters": [
        "NNS"
    ], 
    "u": [
        "PRP", 
        "NN"
    ], 
    "oases": [
        "NNS"
    ], 
    "double-bolt": [
        "VB"
    ], 
    "grassroots": [
        "NNS"
    ], 
    "Waning": [
        "JJ"
    ], 
    "departmentalizing": [
        "VBG"
    ], 
    "Tomczak": [
        "NNP"
    ], 
    "full-body": [
        "JJ"
    ], 
    "Kaplan": [
        "NNP"
    ], 
    "Asahi": [
        "NNP", 
        "NNS"
    ], 
    "Championship": [
        "NNP"
    ], 
    "McLuhan": [
        "NNP"
    ], 
    "Icahn": [
        "NNP"
    ], 
    "tomes": [
        "NNS"
    ], 
    "PRIME": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "puffs": [
        "VBZ"
    ], 
    "Hazlitt": [
        "NNP"
    ], 
    "righted": [
        "VBN"
    ], 
    "Giorgios": [
        "NNP"
    ], 
    "puffy": [
        "JJ"
    ], 
    "plausibility": [
        "NN"
    ], 
    "yon": [
        "RB"
    ], 
    "Socrates": [
        "NNP"
    ], 
    "Calude": [
        "NNP"
    ], 
    "Pels": [
        "NNP"
    ], 
    "Liman": [
        "NNP"
    ], 
    "clench": [
        "VB"
    ], 
    "Objections": [
        "NNS"
    ], 
    "squirted": [
        "VBD"
    ], 
    "forking": [
        "VBG"
    ], 
    "alma": [
        "JJ", 
        "NN"
    ], 
    "phosphines": [
        "NNS"
    ], 
    "diagnometer": [
        "NN"
    ], 
    "Piraro": [
        "NNP"
    ], 
    "CTCA": [
        "NNP"
    ], 
    "Vilnius": [
        "NNP"
    ], 
    "outworn": [
        "JJ"
    ], 
    "clinch": [
        "VB"
    ], 
    "arithmetized": [
        "VBN"
    ], 
    "straighten": [
        "VB"
    ], 
    "Peppers": [
        "NNP"
    ], 
    "squeezes": [
        "VBZ", 
        "NNS"
    ], 
    "late-summer\\": [
        "JJ"
    ], 
    "Corollas": [
        "NNPS"
    ], 
    "repeals": [
        "VBZ"
    ], 
    "Densmore": [
        "NNP"
    ], 
    "Laro": [
        "NNP"
    ], 
    "wrecked": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "trinket": [
        "NN"
    ], 
    "Muffler": [
        "NNP"
    ], 
    "Hydro": [
        "NNP"
    ], 
    "wrecker": [
        "NN"
    ], 
    "fetishize": [
        "VBP"
    ], 
    "hotbed": [
        "NN"
    ], 
    "HCS": [
        "NNP"
    ], 
    "mull": [
        "VB"
    ], 
    "action-adventure": [
        "JJ"
    ], 
    "bushwhacked": [
        "VBD"
    ], 
    "calculates": [
        "VBZ"
    ], 
    "witchy": [
        "JJ"
    ], 
    "mule": [
        "NN"
    ], 
    "HCC": [
        "NNP"
    ], 
    "Georgescu": [
        "NNP"
    ], 
    "HCF": [
        "NNP"
    ], 
    "affectionately": [
        "RB"
    ], 
    "Fishback": [
        "NNP"
    ], 
    "stupor": [
        "NN"
    ], 
    "Clark": [
        "NNP"
    ], 
    "Clare": [
        "NNP"
    ], 
    "squiggly": [
        "RB"
    ], 
    "Clara": [
        "NNP"
    ], 
    "Wrangle": [
        "VB"
    ], 
    "WLIB": [
        "NNP"
    ], 
    "repaying": [
        "VBG"
    ], 
    "Keenan": [
        "NNP"
    ], 
    "Separating": [
        "VBG"
    ], 
    "Marquette": [
        "NNP"
    ], 
    "collated": [
        "VBN"
    ], 
    "specialize": [
        "VB", 
        "VBP"
    ], 
    "Misawa": [
        "NNP"
    ], 
    "splashes": [
        "VBZ", 
        "NNS"
    ], 
    "Reform": [
        "NNP", 
        "NN"
    ], 
    "phasing-out": [
        "NN"
    ], 
    "munchkin": [
        "NN"
    ], 
    "Mmes.": [
        "NNPS"
    ], 
    "rock-ribbed": [
        "JJ"
    ], 
    "Carboni": [
        "NNP"
    ], 
    "Dolly": [
        "NNP"
    ], 
    "pigmented": [
        "VBN"
    ], 
    "Dolls": [
        "NNP"
    ], 
    "composure": [
        "NN"
    ], 
    "correspondent\\/news": [
        "NNS"
    ], 
    "monocytogenes": [
        "FW"
    ], 
    "Bialystok": [
        "NNP"
    ], 
    "anathema": [
        "NN"
    ], 
    "Astrophysicist": [
        "NN"
    ], 
    "Houtz": [
        "NNP"
    ], 
    "Coming": [
        "VBG", 
        "NNP"
    ], 
    "Lekberg": [
        "NNP"
    ], 
    "Governments": [
        "NNS", 
        "NNP"
    ], 
    "Biblically": [
        "RB"
    ], 
    "engaged": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "jangling": [
        "VBG"
    ], 
    "just-departed": [
        "JJ"
    ], 
    "Communist-led": [
        "JJ"
    ], 
    "Byronic": [
        "JJ"
    ], 
    "disfavor": [
        "NN"
    ], 
    "karaoke": [
        "FW", 
        "NN"
    ], 
    "Purcell": [
        "NNP"
    ], 
    "Brody": [
        "NNP"
    ], 
    "hour": [
        "NN"
    ], 
    "recall": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "sulkily": [
        "RB"
    ], 
    "Activists": [
        "NNS"
    ], 
    "marcato": [
        "FW"
    ], 
    "Stoicism": [
        "NN"
    ], 
    "social-register": [
        "JJ"
    ], 
    "Oregonians": [
        "NNPS"
    ], 
    "remain": [
        "VB", 
        "VBP"
    ], 
    "halts": [
        "NNS", 
        "VBZ"
    ], 
    "reaps": [
        "VBZ"
    ], 
    "proteolytic": [
        "JJ"
    ], 
    "stubborn": [
        "JJ"
    ], 
    "ritual": [
        "NN"
    ], 
    "synchronized": [
        "VBN", 
        "JJ"
    ], 
    "rejuvenated": [
        "VBN", 
        "JJ"
    ], 
    "minimun": [
        "NN"
    ], 
    "collision": [
        "NN"
    ], 
    "minimum": [
        "JJ", 
        "JJ|NN", 
        "NN"
    ], 
    "halfmile": [
        "NN"
    ], 
    "despot": [
        "NN"
    ], 
    "petroleum-exploration": [
        "JJ"
    ], 
    "UNESCO": [
        "NNP"
    ], 
    "Calif": [
        "NNP"
    ], 
    "biography": [
        "NN"
    ], 
    "rejuvenates": [
        "VBZ"
    ], 
    "homicide": [
        "NN"
    ], 
    "Yalta": [
        "NNP"
    ], 
    "Sandhurst": [
        "NNP"
    ], 
    "Mustard": [
        "NN"
    ], 
    "Chromatography": [
        "NN", 
        "NNP"
    ], 
    "misallocated": [
        "VBD"
    ], 
    "technology": [
        "NN"
    ], 
    "comfort": [
        "NN", 
        "VB"
    ], 
    "low-risk": [
        "JJ"
    ], 
    "maps": [
        "NNS"
    ], 
    "Wamre": [
        "NNP"
    ], 
    "Nouns": [
        "NNS"
    ], 
    "stir": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Comanches": [
        "NNPS"
    ], 
    "uninfected": [
        "JJ"
    ], 
    "plasmodium": [
        "NN"
    ], 
    "Kelli": [
        "NNP"
    ], 
    "kitty": [
        "NN"
    ], 
    "divinities": [
        "NNS"
    ], 
    "dry-gulchin": [
        "NN"
    ], 
    "spread-sensitive": [
        "JJ"
    ], 
    "Shafroth": [
        "NNP"
    ], 
    "Transplantation": [
        "NNP"
    ], 
    "countering": [
        "VBG"
    ], 
    "accorded": [
        "VBN", 
        "VBD"
    ], 
    "Erde": [
        "NNP"
    ], 
    "verified": [
        "VBN"
    ], 
    "undecided": [
        "JJ"
    ], 
    "reappeared": [
        "VBD", 
        "VBN"
    ], 
    "hair-trigger": [
        "JJ"
    ], 
    "CLARK": [
        "NNP"
    ], 
    "tradeoffs": [
        "NNS"
    ], 
    "conglomerates": [
        "NNS"
    ], 
    "special-service": [
        "JJ"
    ], 
    "Muscular": [
        "NNP"
    ], 
    "dragon": [
        "NN"
    ], 
    "BVIslander": [
        "NN"
    ], 
    "rebuked": [
        "VBD", 
        "VBN"
    ], 
    "co-exist": [
        "VB"
    ], 
    "BROKERAGE": [
        "NN"
    ], 
    "Kurtzig": [
        "NNP"
    ], 
    "Bish": [
        "NNP"
    ], 
    "mulching": [
        "VBG"
    ], 
    "heartfelt": [
        "JJ"
    ], 
    "RAYCHEM": [
        "NNP"
    ], 
    "Creamer": [
        "NNP"
    ], 
    "Roald": [
        "NNP"
    ], 
    "Inefficient-Market": [
        "NNP"
    ], 
    "Canfield": [
        "NNP"
    ], 
    "hundredth": [
        "JJ"
    ], 
    "comedic": [
        "JJ"
    ], 
    "comedie": [
        "NN"
    ], 
    "emaciated": [
        "VBN", 
        "JJ"
    ], 
    "Final-hour": [
        "JJ"
    ], 
    "verifier": [
        "NN"
    ], 
    "seasonally": [
        "RB"
    ], 
    "three-hour-long": [
        "JJ"
    ], 
    "counter-culture": [
        "JJ"
    ], 
    "Jath": [
        "NNP"
    ], 
    "worshiping": [
        "VBG"
    ], 
    "cinches": [
        "NNS"
    ], 
    "Fuchs": [
        "NNP"
    ], 
    "invigoration": [
        "NN"
    ], 
    "Scana": [
        "NNP"
    ], 
    "hyphens": [
        "NNS"
    ], 
    "compound": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "walk-to": [
        "JJ"
    ], 
    "viewers": [
        "NNS"
    ], 
    "groped": [
        "VBD"
    ], 
    "mystery": [
        "NN"
    ], 
    "huddle": [
        "NN"
    ], 
    "Polished": [
        "JJ"
    ], 
    "Chmn.": [
        "NNP"
    ], 
    "Kika": [
        "NNP"
    ], 
    "Super-Sets": [
        "NNP"
    ], 
    "evade": [
        "VB"
    ], 
    "micro": [
        "JJ"
    ], 
    "Merkurs": [
        "NNPS"
    ], 
    "rattail": [
        "NN"
    ], 
    "submarine-launched": [
        "JJ"
    ], 
    "repeating": [
        "VBG", 
        "JJ"
    ], 
    "integrated-circuit": [
        "JJ"
    ], 
    "politicize": [
        "VB"
    ], 
    "fuel-economy": [
        "NN"
    ], 
    "Berle": [
        "NNP"
    ], 
    "above-ceiling": [
        "NN"
    ], 
    "engaging": [
        "VBG", 
        "JJ"
    ], 
    "managements": [
        "NNS"
    ], 
    "suspecting": [
        "VBG"
    ], 
    "edged": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "wisecracks": [
        "NNS"
    ], 
    "bandaged": [
        "VBN", 
        "JJ"
    ], 
    "acquisitive": [
        "JJ"
    ], 
    "Coor": [
        "NNP"
    ], 
    "Braumeisters": [
        "NNPS"
    ], 
    "traitorous": [
        "JJ"
    ], 
    "sickness": [
        "NN"
    ], 
    "T-helper": [
        "NN"
    ], 
    "Cook": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "evaluation": [
        "NN"
    ], 
    "Cool": [
        "JJ", 
        "VB", 
        "NNP"
    ], 
    "semi-celebrities": [
        "NNS"
    ], 
    "Long-range": [
        "JJ"
    ], 
    "office\\/dept.": [
        "NN"
    ], 
    "backer": [
        "NN"
    ], 
    "extraordinary": [
        "JJ", 
        "NN"
    ], 
    "asked...": [
        ":"
    ], 
    "Enos": [
        "NNP"
    ], 
    "deflate": [
        "VB"
    ], 
    "backed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Migliorino": [
        "NNP"
    ], 
    "Nielsen": [
        "NNP"
    ], 
    "faucet": [
        "NN"
    ], 
    "Archbishop": [
        "NNP"
    ], 
    "constraining": [
        "VBG"
    ], 
    "Puritan": [
        "NNP", 
        "JJ"
    ], 
    "white-spirits": [
        "JJ"
    ], 
    "PAPER": [
        "NN", 
        "NNP", 
        "NNS"
    ], 
    "Puritans": [
        "NNS"
    ], 
    "free-spiritedness": [
        "NN"
    ], 
    "bawh": [
        "NN"
    ], 
    "private-bank": [
        "JJ"
    ], 
    "Lorena": [
        "NNP"
    ], 
    "advertisement": [
        "NN"
    ], 
    "Smukler": [
        "NNP"
    ], 
    "treetops": [
        "NNS"
    ], 
    "Homewood": [
        "NNP"
    ], 
    "welcome": [
        "JJ", 
        "NN", 
        "VB", 
        "VBP"
    ], 
    "pituitary-gland": [
        "NN"
    ], 
    "major-burden-to-the-planet": [
        "NN"
    ], 
    "steel-gray": [
        "JJ"
    ], 
    "faultlessly": [
        "RB"
    ], 
    "mercilessly": [
        "RB"
    ], 
    "Screen": [
        "NN"
    ], 
    "WPP": [
        "NNP"
    ], 
    "jetty": [
        "NN"
    ], 
    "Slums": [
        "NNP"
    ], 
    "Environmental": [
        "NNP", 
        "JJ"
    ], 
    "paper-products": [
        "NNS", 
        "JJ"
    ], 
    "four-count": [
        "JJ"
    ], 
    "Silesia": [
        "NNP"
    ], 
    "catapult": [
        "VB", 
        "VBP"
    ], 
    "Justin": [
        "NNP"
    ], 
    "Ballenger": [
        "NNP"
    ], 
    "Napkins": [
        "NNS"
    ], 
    "sea-launched": [
        "JJ"
    ], 
    "differentiate": [
        "VB", 
        "VBP"
    ], 
    "Dividend": [
        "NN", 
        "NNP"
    ], 
    "reedbuck": [
        "NN"
    ], 
    "after-school": [
        "JJ"
    ], 
    "cost-savings": [
        "JJ", 
        "NNS"
    ], 
    "Franklyn": [
        "NNP"
    ], 
    "allurement": [
        "NN"
    ], 
    "Juncal": [
        "NNP"
    ], 
    "third-dimensional": [
        "JJ"
    ], 
    "clear-it-out": [
        "JJ"
    ], 
    "Cimoli": [
        "NNP"
    ], 
    "unbroken": [
        "JJ"
    ], 
    "ONCE": [
        "RB"
    ], 
    "Sprinkel": [
        "NNP"
    ], 
    "swerve": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "confessional": [
        "NN", 
        "JJ"
    ], 
    "ditcher": [
        "NN"
    ], 
    "focally": [
        "RB"
    ], 
    "Eurocops": [
        "NNPS"
    ], 
    "Amusing": [
        "JJ"
    ], 
    "make-ready": [
        "NN"
    ], 
    "Aterman": [
        "NNP"
    ], 
    "three-quarters": [
        "NNS", 
        "NN"
    ], 
    "Administrative": [
        "NNP", 
        "JJ"
    ], 
    "ditched": [
        "VBD"
    ], 
    "Limitations": [
        "NNS", 
        "NNPS"
    ], 
    "Lucio": [
        "NNP"
    ], 
    "Shoreline": [
        "NN"
    ], 
    "Bernardo": [
        "NNP"
    ], 
    "Ukrainian": [
        "JJ", 
        "NNP"
    ], 
    "Clostridium": [
        "NN"
    ], 
    "Lucie": [
        "NNP"
    ], 
    "Cudahy": [
        "NNP"
    ], 
    "Lucia": [
        "NNP"
    ], 
    "lifts": [
        "VBZ", 
        "NNS"
    ], 
    "zitless": [
        "JJ"
    ], 
    "Laband": [
        "NNP"
    ], 
    "electro-optical": [
        "JJ"
    ], 
    "arbitrager": [
        "NN"
    ], 
    "chary": [
        "JJ"
    ], 
    "frequent-flyer": [
        "NN"
    ], 
    "serene": [
        "JJ", 
        "NN"
    ], 
    "godfather": [
        "NN"
    ], 
    "eggs": [
        "NNS"
    ], 
    "Holes": [
        "NNS"
    ], 
    "chart": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "serviced": [
        "VBN", 
        "VBD"
    ], 
    "Holen": [
        "NNP"
    ], 
    "charm": [
        "NN", 
        "VB"
    ], 
    "Evans-Black": [
        "NNP"
    ], 
    "services": [
        "NNS", 
        "VBZ"
    ], 
    "Fresh": [
        "JJ", 
        "NNP"
    ], 
    "Taras": [
        "NNP"
    ], 
    "teems": [
        "VBZ"
    ], 
    "Anointing": [
        "VBG"
    ], 
    "honkytonks": [
        "NNS"
    ], 
    "dealer-related": [
        "JJ"
    ], 
    "WATCH": [
        "VB"
    ], 
    "gin": [
        "NN"
    ], 
    "curtain-raiser": [
        "NN"
    ], 
    "Beira": [
        "NNP"
    ], 
    "seething": [
        "VBG", 
        "JJ"
    ], 
    "Rexall": [
        "NNP"
    ], 
    "consanguineous": [
        "JJ"
    ], 
    "chelas": [
        "NNS"
    ], 
    "rebels": [
        "NNS", 
        "VBZ"
    ], 
    "swelling": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "charter-shipping": [
        "JJ"
    ], 
    "passer-by": [
        "NN"
    ], 
    "Confident": [
        "JJ"
    ], 
    "shut-in": [
        "JJ"
    ], 
    "Billiken": [
        "NNP"
    ], 
    "headlines": [
        "NNS"
    ], 
    "tight-fistedness": [
        "NN"
    ], 
    "exteriors": [
        "NNS"
    ], 
    "Freeman": [
        "NNP"
    ], 
    "sluggishly": [
        "RB"
    ], 
    "music-making": [
        "NN"
    ], 
    "Sellers": [
        "NNP", 
        "NNS"
    ], 
    "Caterpillar": [
        "NNP"
    ], 
    "Solomon-like": [
        "JJ"
    ], 
    "sanitize": [
        "VBP"
    ], 
    "thruways": [
        "RB"
    ], 
    "Concluding": [
        "VBG"
    ], 
    "unagi": [
        "FW"
    ], 
    "general-insurance": [
        "NN"
    ], 
    "Keeny": [
        "NNP"
    ], 
    "City-based": [
        "JJ"
    ], 
    "U.N.-monitored": [
        "JJ"
    ], 
    "Guilford-Martin": [
        "NNP"
    ], 
    "Favorite": [
        "NNP", 
        "JJ"
    ], 
    "toddlers": [
        "NNS"
    ], 
    "mid-1950s": [
        "NNS"
    ], 
    "rotted": [
        "VBN"
    ], 
    "Amending": [
        "VBG"
    ], 
    "irresolution": [
        "NN"
    ], 
    "methanol-powered": [
        "JJ"
    ], 
    "judiciously": [
        "RB"
    ], 
    "Keene": [
        "NNP"
    ], 
    "Riddle": [
        "NN"
    ], 
    "Scenarios": [
        "NNS"
    ], 
    "spikes": [
        "NNS"
    ], 
    "motorcycles": [
        "NNS"
    ], 
    "Distributors": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "enclaves": [
        "NNS"
    ], 
    "Lucullan": [
        "JJ"
    ], 
    "Ecogen": [
        "NNP"
    ], 
    "Minneapolis": [
        "NNP", 
        "NNS"
    ], 
    "motorcycled": [
        "VBD"
    ], 
    "pre-production": [
        "JJ"
    ], 
    "spiked": [
        "JJ", 
        "VBN"
    ], 
    "Female": [
        "JJ"
    ], 
    "Apologies": [
        "NNS"
    ], 
    "restaurants": [
        "NNS"
    ], 
    "light-flared": [
        "JJ"
    ], 
    "Morse": [
        "NNP"
    ], 
    "semi-finished": [
        "JJ"
    ], 
    "semisecret": [
        "JJ"
    ], 
    "overburdened": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "short-contact": [
        "JJ"
    ], 
    "internationalist": [
        "JJ"
    ], 
    "Woodside": [
        "NNP"
    ], 
    "Omnicorp": [
        "NNP"
    ], 
    "Sigemund": [
        "NNP"
    ], 
    "GET": [
        "VB"
    ], 
    "antimaterialism": [
        "NN"
    ], 
    "GE\\": [
        "NNP"
    ], 
    "GEC": [
        "NNP"
    ], 
    "cahoots": [
        "NNS"
    ], 
    "eight-year": [
        "JJ"
    ], 
    "Richards": [
        "NNP"
    ], 
    "internationalism": [
        "NN"
    ], 
    "Bayaderka": [
        "NNP"
    ], 
    "Superstar": [
        "NNP"
    ], 
    "rbi": [
        "NNS"
    ], 
    "trustingly": [
        "RB"
    ], 
    "mailbox": [
        "NN"
    ], 
    "Archibald": [
        "NNP"
    ], 
    "premise": [
        "NN"
    ], 
    "mirth": [
        "NN"
    ], 
    "plutonium-powered": [
        "JJ"
    ], 
    "inimitable": [
        "JJ"
    ], 
    "axiom": [
        "NN"
    ], 
    "glorification": [
        "NN"
    ], 
    "Detective": [
        "NNP"
    ], 
    "Yeh": [
        "NNP"
    ], 
    "defunct": [
        "JJ", 
        "VB"
    ], 
    "Slower": [
        "JJR"
    ], 
    "docudrama": [
        "NN"
    ], 
    "appropriations": [
        "NNS"
    ], 
    "Yea": [
        "UH"
    ], 
    "Gann": [
        "NNP"
    ], 
    "foreign": [
        "JJ"
    ], 
    "sparring": [
        "VBG", 
        "NN"
    ], 
    "Reservoirs": [
        "NNP"
    ], 
    "suede": [
        "NN"
    ], 
    "Carving": [
        "NN"
    ], 
    "focused": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Dawson": [
        "NNP"
    ], 
    "anlayst": [
        "NN"
    ], 
    "Yet": [
        "RB", 
        "RB|CC", 
        "CC"
    ], 
    "Yew": [
        "NNP", 
        "NN"
    ], 
    "subpar": [
        "JJ"
    ], 
    "combinable": [
        "JJ"
    ], 
    "duplicable": [
        "JJ"
    ], 
    "Surrounded": [
        "VBN"
    ], 
    "Rastus": [
        "NNP"
    ], 
    "panicking": [
        "VBG"
    ], 
    "undersecretary": [
        "NN"
    ], 
    "Schaumburg": [
        "NNP"
    ], 
    "cross-functional": [
        "JJ"
    ], 
    "non-instinctive": [
        "JJ"
    ], 
    "Institut": [
        "NNP"
    ], 
    "sinuousness": [
        "NN"
    ], 
    "Checks": [
        "NNS"
    ], 
    "Defendant": [
        "NN"
    ], 
    "Khmer": [
        "NNP"
    ], 
    "fused": [
        "VBN", 
        "VBD"
    ], 
    "Middenstandsbank": [
        "NNP"
    ], 
    "viscometer": [
        "NN"
    ], 
    "Wendell": [
        "NNP"
    ], 
    "apostle": [
        "NN"
    ], 
    "Processing": [
        "NNP", 
        "NN", 
        "VBG"
    ], 
    "appall": [
        "VBP"
    ], 
    "TV-Cable": [
        "NNP"
    ], 
    "screened": [
        "VBN", 
        "VBD"
    ], 
    "grandsons": [
        "NNS"
    ], 
    "peppery": [
        "JJ"
    ], 
    "fuses": [
        "NNS"
    ], 
    "peppers": [
        "NNS"
    ], 
    "middle-of-the-roaders": [
        "NNS"
    ], 
    "nukes": [
        "NNS"
    ], 
    "freelancing": [
        "NN"
    ], 
    "assorted": [
        "JJ", 
        "VBN"
    ], 
    "ineptitude": [
        "NN"
    ], 
    "decorous": [
        "JJ"
    ], 
    "roved": [
        "VBD"
    ], 
    "non-Germans": [
        "NNS"
    ], 
    "two-valued": [
        "JJ"
    ], 
    "Stockholm": [
        "NNP", 
        "NN"
    ], 
    "Rory": [
        "NNP"
    ], 
    "resisted": [
        "VBN", 
        "VBD"
    ], 
    "outriggers": [
        "NNS"
    ], 
    "patriarchy": [
        "NN"
    ], 
    "evangelical": [
        "JJ"
    ], 
    "Indications": [
        "NNS"
    ], 
    "dicks": [
        "NNS"
    ], 
    "politician": [
        "NN"
    ], 
    "Pohly": [
        "NNP"
    ], 
    "deferred": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "skiff": [
        "NN"
    ], 
    "teaspoonful": [
        "JJ", 
        "NN"
    ], 
    "mechanochemically": [
        "RB"
    ], 
    "Institue": [
        "NNP"
    ], 
    "radiosterilized": [
        "VBN"
    ], 
    "Rehfeld": [
        "NNP"
    ], 
    "escheat": [
        "NN"
    ], 
    "century": [
        "NN"
    ], 
    "perilously": [
        "RB"
    ], 
    "Irv": [
        "NN"
    ], 
    "audience-friendly": [
        "JJ"
    ], 
    "Delay": [
        "NNP", 
        "NN"
    ], 
    "confining": [
        "VBG"
    ], 
    "DataQuest": [
        "NNP"
    ], 
    "stoves": [
        "NNS"
    ], 
    "Ira": [
        "NNP"
    ], 
    "Elliott": [
        "NNP"
    ], 
    "Ahm": [
        "PRP"
    ], 
    "all-important": [
        "JJ"
    ], 
    "urethra": [
        "NN"
    ], 
    "ethylene": [
        "NN"
    ], 
    "infernally": [
        "RB"
    ], 
    "Copp": [
        "NNP"
    ], 
    "lap-shoulder": [
        "JJ"
    ], 
    "Sonnenschein": [
        "NNP"
    ], 
    "bristle": [
        "VBP", 
        "VB", 
        "NN"
    ], 
    "Heine": [
        "NNP"
    ], 
    "Copy": [
        "NNP", 
        "VBP", 
        "NN"
    ], 
    "riddling": [
        "VBG"
    ], 
    "currencies": [
        "NNS"
    ], 
    "Cash-pressed": [
        "JJ"
    ], 
    "PETROLEUM": [
        "NNP"
    ], 
    "deterrence...": [
        ":"
    ], 
    "SISAL": [
        "NNP"
    ], 
    "stripe": [
        "NN"
    ], 
    "unveil": [
        "VB"
    ], 
    "LVI": [
        "NNP"
    ], 
    "horse-drawn": [
        "JJ"
    ], 
    "gestures": [
        "NNS", 
        "VBZ"
    ], 
    "organically": [
        "RB"
    ], 
    "Serving": [
        "VBG"
    ], 
    "whores": [
        "NNS"
    ], 
    "PLANS": [
        "VBZ"
    ], 
    "Plainly": [
        "RB"
    ], 
    "Councils": [
        "NNPS"
    ], 
    "Healthvest": [
        "NNP"
    ], 
    "Superconductivity": [
        "NN"
    ], 
    "Carolus": [
        "NNP"
    ], 
    "iffy": [
        "JJ"
    ], 
    "Economic": [
        "NNP", 
        "JJ"
    ], 
    "Insitutional": [
        "JJ"
    ], 
    "briquettes": [
        "NNS"
    ], 
    "Fiscal-year": [
        "JJ"
    ], 
    "consumer-minded": [
        "JJ"
    ], 
    "know\\/no": [
        "NN"
    ], 
    "Albany": [
        "NNP", 
        "NN"
    ], 
    "criss-cross": [
        "VBP", 
        "JJ"
    ], 
    "Kennewick": [
        "NNP"
    ], 
    "Obispo": [
        "NNP"
    ], 
    "zestfully": [
        "RB"
    ], 
    "segregate": [
        "VB"
    ], 
    "Boren": [
        "NNP"
    ], 
    "Picon": [
        "NNP"
    ], 
    "shrewdly": [
        "RB"
    ], 
    "Minolta": [
        "NNP"
    ], 
    "place-names": [
        "NN", 
        "NNS"
    ], 
    "choreographers": [
        "NNS"
    ], 
    "Aspirin": [
        "NNP"
    ], 
    "McGann": [
        "NNP"
    ], 
    "postal": [
        "JJ"
    ], 
    "Proprietorships": [
        "NNP", 
        "NNS"
    ], 
    "PROPOSE": [
        "VB"
    ], 
    "adjusters": [
        "NNS"
    ], 
    "coal-black": [
        "JJ"
    ], 
    "studious": [
        "JJ"
    ], 
    "Christopher": [
        "NNP"
    ], 
    "impassible": [
        "JJ"
    ], 
    "clamping": [
        "VBG"
    ], 
    "Astra": [
        "NNP"
    ], 
    "per-ad": [
        "JJ"
    ], 
    "Belknap": [
        "NNP"
    ], 
    "malfunctions": [
        "NNS"
    ], 
    "Commons": [
        "NNP", 
        "NN", 
        "NNPS"
    ], 
    "Truth": [
        "NN", 
        "NNP"
    ], 
    "bribing": [
        "VBG"
    ], 
    "knock": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Butterwyn": [
        "NNP"
    ], 
    "L-shaped": [
        "JJ"
    ], 
    "hard-wire": [
        "JJ"
    ], 
    "preradiation": [
        "NN"
    ], 
    "objectiveness": [
        "NN"
    ], 
    "parsimonious": [
        "JJ"
    ], 
    "borrows": [
        "VBZ"
    ], 
    "loyalist": [
        "NN", 
        "JJ"
    ], 
    "foolish": [
        "JJ"
    ], 
    "machinegun": [
        "NN"
    ], 
    "Happens": [
        "VBZ"
    ], 
    "outscored": [
        "VBD"
    ], 
    "drill-bit": [
        "NN"
    ], 
    "lastest": [
        "JJS"
    ], 
    "Fischbach": [
        "NNP"
    ], 
    "Deliberately": [
        "RB"
    ], 
    "blow": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "re-regulation": [
        "NN"
    ], 
    "TALENT": [
        "NN"
    ], 
    "infliction": [
        "NN"
    ], 
    "scalps": [
        "NNS"
    ], 
    "Togs": [
        "NNP"
    ], 
    "balmy": [
        "JJ"
    ], 
    "phantasy": [
        "NN"
    ], 
    "pleats": [
        "NNS"
    ], 
    "revenue-desperate": [
        "JJ"
    ], 
    "fixations": [
        "NNS"
    ], 
    "inimical": [
        "JJ"
    ], 
    "Ambridge": [
        "NNP"
    ], 
    "Bosket": [
        "NNP"
    ], 
    "Freni": [
        "NNP"
    ], 
    "Cascade": [
        "NNP"
    ], 
    "Sourcing": [
        "VBG"
    ], 
    "self-published": [
        "JJ"
    ], 
    "Birkel": [
        "NNP"
    ], 
    "feigning": [
        "VBG"
    ], 
    "Nomani": [
        "NNP"
    ], 
    "Cocoa": [
        "NNP", 
        "NN"
    ], 
    "canvassing": [
        "VBG"
    ], 
    "Cocom": [
        "NNP"
    ], 
    "hindrances": [
        "NNS"
    ], 
    "buffoons": [
        "NNS"
    ], 
    "tiff": [
        "NN"
    ], 
    "abusive": [
        "JJ"
    ], 
    "retailer": [
        "NN"
    ], 
    "seating": [
        "NN", 
        "VBG"
    ], 
    "English-rights": [
        "JJ"
    ], 
    "Increase": [
        "VB", 
        "NN", 
        "NNP"
    ], 
    "inhospitable": [
        "JJ"
    ], 
    "Oberkfell": [
        "NNP"
    ], 
    "retailed": [
        "VBN"
    ], 
    "Zaroubin": [
        "NNP"
    ], 
    "locking-in": [
        "NN"
    ], 
    "U.S.-style": [
        "JJ"
    ], 
    "Feeley": [
        "NNP"
    ], 
    "police-dodging": [
        "NN"
    ], 
    "underused": [
        "VBN"
    ], 
    "Cordis": [
        "NNP"
    ], 
    "out-plunging": [
        "JJ"
    ], 
    "underlines": [
        "VBZ"
    ], 
    "Esperanza": [
        "NNP"
    ], 
    "Stephenson": [
        "NNP"
    ], 
    "exterminated": [
        "VBN"
    ], 
    "Filter": [
        "NNP"
    ], 
    "mechanistic": [
        "JJ"
    ], 
    "underlined": [
        "VBD", 
        "VBN"
    ], 
    "Supply-sider": [
        "NNP"
    ], 
    "HONECKER": [
        "NNP"
    ], 
    "Beijing": [
        "NNP", 
        "VBG"
    ], 
    "pickers": [
        "NNS"
    ], 
    "CORNUCOPIA": [
        "NN"
    ], 
    "Kazakh": [
        "NNP"
    ], 
    "corkscrews": [
        "NNS"
    ], 
    "Bennett": [
        "NNP", 
        "NN"
    ], 
    "Groucho": [
        "NNP"
    ], 
    "drug-traffickers": [
        "NNS"
    ], 
    "market-specific": [
        "JJ"
    ], 
    "Potala": [
        "NNP"
    ], 
    "curt": [
        "JJ"
    ], 
    "constant": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "pseudonymous": [
        "JJ"
    ], 
    "GORBACHEV": [
        "NNP"
    ], 
    "beckoning": [
        "VBG", 
        "NN"
    ], 
    "scarlet": [
        "JJ"
    ], 
    "Charisma": [
        "NNP"
    ], 
    "cure": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "network-writer": [
        "JJ"
    ], 
    "fabricating": [
        "VBG", 
        "NN"
    ], 
    "Linda": [
        "NNP"
    ], 
    "curl": [
        "VB", 
        "VBP"
    ], 
    "stripper": [
        "NN"
    ], 
    "Municipalities": [
        "NNS"
    ], 
    "pecks": [
        "NNS"
    ], 
    "Commissioned": [
        "VBN"
    ], 
    "Neo-Classicists": [
        "NNPS"
    ], 
    "mayonnaise": [
        "NN"
    ], 
    "confine": [
        "VB", 
        "VBP"
    ], 
    "dark-green": [
        "JJ"
    ], 
    "Advance": [
        "NNP", 
        "JJ"
    ], 
    "Bowles": [
        "NNP"
    ], 
    "Kleiman": [
        "NNP"
    ], 
    "Slogan": [
        "NNP"
    ], 
    "endocrine": [
        "JJ"
    ], 
    "marijuana-smuggling": [
        "JJ"
    ], 
    "less-risky": [
        "JJ"
    ], 
    "showgirls": [
        "NNS"
    ], 
    "HDTV": [
        "NN", 
        "NNP"
    ], 
    "Hainan": [
        "NNP"
    ], 
    "cater": [
        "VBP", 
        "VB"
    ], 
    "utterly": [
        "RB"
    ], 
    "fructose": [
        "NN"
    ], 
    "balm-of-Gilead": [
        "NN"
    ], 
    "unenforceable": [
        "JJ"
    ], 
    "reflectors": [
        "NNS"
    ], 
    "Bartville": [
        "NNP"
    ], 
    "Taft": [
        "NNP"
    ], 
    "implies": [
        "VBZ"
    ], 
    "cooker": [
        "NN"
    ], 
    "healers": [
        "NNS"
    ], 
    "red-and-yellow": [
        "JJ"
    ], 
    "mortgage-interest": [
        "JJ"
    ], 
    "cooked": [
        "VBN", 
        "VBD"
    ], 
    "implied": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Determine": [
        "VB"
    ], 
    "razing": [
        "VBG"
    ], 
    "uterus": [
        "NN"
    ], 
    "conjugal": [
        "JJ"
    ], 
    "verstrichen": [
        "FW"
    ], 
    "Voegelin": [
        "NNP"
    ], 
    "portraying": [
        "VBG"
    ], 
    "groceries": [
        "NNS"
    ], 
    "fascinatingly": [
        "RB"
    ], 
    "Coons": [
        "NNP"
    ], 
    "Angelina": [
        "NNP"
    ], 
    "marveled": [
        "VBD", 
        "VBN"
    ], 
    "Bonds": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Gatsby-in-reverse": [
        "NN"
    ], 
    "ill-suited": [
        "JJ"
    ], 
    "reductions": [
        "NNS"
    ], 
    "Prepayments": [
        "NNS"
    ], 
    "masculine": [
        "JJ", 
        "NN"
    ], 
    "Sietsma": [
        "NNP"
    ], 
    "pleasing": [
        "JJ", 
        "NN", 
        "VBG"
    ], 
    "NTSB": [
        "NNP"
    ], 
    "nervousness": [
        "NN"
    ], 
    "Redoute": [
        "NNP"
    ], 
    "proctor": [
        "NN"
    ], 
    "presently": [
        "RB"
    ], 
    "Sportswriters": [
        "NNS"
    ], 
    "Ibbotson": [
        "NNP"
    ], 
    "radiophonic": [
        "JJ"
    ], 
    "startlingly": [
        "RB"
    ], 
    "hoards": [
        "NNS"
    ], 
    "uttuh": [
        "VB"
    ], 
    "entire": [
        "JJ", 
        "NN"
    ], 
    "economic-reform": [
        "JJ", 
        "NN"
    ], 
    "diverging": [
        "VBG"
    ], 
    "A.N.": [
        "NNP"
    ], 
    "RepublicBank": [
        "NNP"
    ], 
    "Gatos": [
        "NNP"
    ], 
    "busier": [
        "JJR"
    ], 
    "busies": [
        "NNS"
    ], 
    "pre-emancipation": [
        "NN"
    ], 
    "flex-time": [
        "JJ"
    ], 
    "havens": [
        "NNS"
    ], 
    "Timken": [
        "NNP"
    ], 
    "Sacred": [
        "NNP"
    ], 
    "Howard": [
        "NNP", 
        "RP", 
        "NNPS"
    ], 
    "Neoax": [
        "NNP"
    ], 
    "Onsets": [
        "NNS"
    ], 
    "Fast": [
        "NNP", 
        "JJ"
    ], 
    "Birns": [
        "NNP"
    ], 
    "squabble": [
        "NN"
    ], 
    "Faso": [
        "NNP"
    ], 
    "wider-than-normal": [
        "JJ"
    ], 
    "repurchased": [
        "VBN", 
        "VBD"
    ], 
    "par-5": [
        "JJ"
    ], 
    "par-3": [
        "NN"
    ], 
    "emigrations": [
        "NNS"
    ], 
    "fat": [
        "JJ", 
        "NN"
    ], 
    "IUD": [
        "NNP"
    ], 
    "Butts": [
        "NNP"
    ], 
    "Necessity": [
        "NN"
    ], 
    "Butte": [
        "NNP"
    ], 
    "employerpaid": [
        "JJ"
    ], 
    "Tindal": [
        "NNP"
    ], 
    "Nugget": [
        "NNP"
    ], 
    "apologetic": [
        "JJ"
    ], 
    "vexatious": [
        "JJ"
    ], 
    "Afranio": [
        "NNP"
    ], 
    "packing": [
        "VBG", 
        "NN"
    ], 
    "healing": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "pinch-hitter": [
        "NN"
    ], 
    "safer": [
        "JJR"
    ], 
    "DEVELOPMENTS": [
        "NNPS"
    ], 
    "million-gallon": [
        "JJ"
    ], 
    "Oreos": [
        "NNPS"
    ], 
    "windfalls": [
        "NNS"
    ], 
    "Jennifer": [
        "NNP"
    ], 
    "Correll": [
        "NNP"
    ], 
    "Henritze": [
        "NNP"
    ], 
    "Week-end": [
        "NN"
    ], 
    "implement": [
        "VB", 
        "VBP"
    ], 
    "depressant": [
        "NN"
    ], 
    "Reedville": [
        "NNP"
    ], 
    "absolutes": [
        "NNS"
    ], 
    "bumming": [
        "VBG"
    ], 
    "obsolesence": [
        "NN"
    ], 
    "light-duty": [
        "JJ"
    ], 
    "Starlings": [
        "NNS"
    ], 
    "Beneficiary": [
        "NN"
    ], 
    "Rhode": [
        "NNP"
    ], 
    "Rhoda": [
        "NNP"
    ], 
    "Batchelder": [
        "NNP"
    ], 
    "over-50": [
        "JJ"
    ], 
    "Answer": [
        "NN", 
        "VB"
    ], 
    "welcomed": [
        "VBD", 
        "VBN"
    ], 
    "Aston": [
        "NNP"
    ], 
    "oilfields": [
        "NNS"
    ], 
    "abhorrently": [
        "RB"
    ], 
    "Tarter": [
        "NNP"
    ], 
    "Garrin": [
        "NNP"
    ], 
    "Mentality": [
        "NN"
    ], 
    "hammered": [
        "VBN", 
        "VBD"
    ], 
    "once-moribund": [
        "JJ"
    ], 
    "little-known": [
        "JJ"
    ], 
    "totality": [
        "NN"
    ], 
    "year-ago": [
        "JJ"
    ], 
    "Eastman": [
        "NNP"
    ], 
    "Astor": [
        "NNP"
    ], 
    "prized": [
        "VBN", 
        "JJ"
    ], 
    "disgust": [
        "NN"
    ], 
    "locker-room": [
        "NN"
    ], 
    "Honest": [
        "UH"
    ], 
    "Revolution": [
        "NNP", 
        "NN"
    ], 
    "prizes": [
        "NNS", 
        "VBZ"
    ], 
    "Latour": [
        "NNP"
    ], 
    "many-bodied": [
        "JJ"
    ], 
    "steroid-induced": [
        "JJ"
    ], 
    "silvery": [
        "JJ"
    ], 
    "headstands": [
        "NNS"
    ], 
    "non-communist": [
        "JJ"
    ], 
    "fooling": [
        "VBG", 
        "NN"
    ], 
    "jeers": [
        "NNS"
    ], 
    "tobacco-product": [
        "JJ"
    ], 
    "grated": [
        "VBD", 
        "JJ"
    ], 
    "public-asset": [
        "JJ"
    ], 
    "closing": [
        "VBG", 
        "JJ", 
        "NN", 
        "VBG|NN"
    ], 
    "Asylum": [
        "NNP"
    ], 
    "fetch": [
        "VB", 
        "VBP"
    ], 
    "experiential": [
        "JJ"
    ], 
    "blabs": [
        "VBZ"
    ], 
    "Camping": [
        "NN"
    ], 
    "invoices": [
        "NNS"
    ], 
    "teamster": [
        "NN"
    ], 
    "lammed": [
        "VBD"
    ], 
    "McGeorge": [
        "NNP"
    ], 
    "homoerotic": [
        "JJ"
    ], 
    "Meninas": [
        "NNP"
    ], 
    "hair-care": [
        "NN", 
        "JJ"
    ], 
    "well-wishing": [
        "NN"
    ], 
    "Chapdelaine": [
        "NNP"
    ], 
    "varied": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Yo": [
        "NNP"
    ], 
    "Worrell": [
        "NNP"
    ], 
    "Drink": [
        "VB", 
        "NN"
    ], 
    "Ye": [
        "NNP"
    ], 
    "Fridge": [
        "NNP"
    ], 
    "Respondents": [
        "NNS"
    ], 
    "KFC": [
        "NNP"
    ], 
    "NZ$": [
        "$"
    ], 
    "Yr": [
        "NN"
    ], 
    "Yu": [
        "NNP"
    ], 
    "profile": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "Riegle": [
        "NNP"
    ], 
    "rumpus": [
        "NN"
    ], 
    "incompetence": [
        "NN"
    ], 
    "leukemia": [
        "NN"
    ], 
    "Washington-Alexandria": [
        "NNP"
    ], 
    "dockyards": [
        "NNS"
    ], 
    "incompetency": [
        "NN"
    ], 
    "beer-runner": [
        "NN"
    ], 
    "Hedison": [
        "NNP"
    ], 
    "pleasantness": [
        "NN"
    ], 
    "Gosson": [
        "NNP"
    ], 
    "chasing": [
        "VBG", 
        "NN"
    ], 
    "friendlier": [
        "JJR", 
        "RBR"
    ], 
    "Texas-Louisiana": [
        "NNP"
    ], 
    "Y.": [
        "NNP"
    ], 
    "interviewees": [
        "NNS"
    ], 
    "nonworking": [
        "JJ"
    ], 
    "miscues": [
        "NNS"
    ], 
    "trembling": [
        "VBG", 
        "JJ"
    ], 
    "year...": [
        ":"
    ], 
    "sensitively": [
        "RB"
    ], 
    "Adultery": [
        "NNP"
    ], 
    "furious": [
        "JJ"
    ], 
    "solos": [
        "NNS", 
        "VBZ"
    ], 
    "subsequently": [
        "RB"
    ], 
    "B-52": [
        "NNP", 
        "NN"
    ], 
    "cease-fire": [
        "NN", 
        "JJ"
    ], 
    "rutted": [
        "JJ"
    ], 
    "disarm": [
        "VB"
    ], 
    "Theatres": [
        "NNP"
    ], 
    "McMillin": [
        "NNP"
    ], 
    "east-west": [
        "JJ"
    ], 
    "flattering": [
        "JJ"
    ], 
    "electors": [
        "NNS"
    ], 
    "Rotman": [
        "NNP"
    ], 
    "enactments": [
        "NNS"
    ], 
    "twirls": [
        "VBZ"
    ], 
    "Legislators": [
        "NNS"
    ], 
    "integrators": [
        "NNS"
    ], 
    "twirly": [
        "JJ"
    ], 
    "wadded": [
        "VBD"
    ], 
    "accredited": [
        "VBD", 
        "VBN"
    ], 
    "bull-necked": [
        "JJ"
    ], 
    "blatant": [
        "JJ"
    ], 
    "circumspectly": [
        "RB"
    ], 
    "disrupts": [
        "VBZ"
    ], 
    "youngish": [
        "JJ"
    ], 
    "sapling": [
        "NN"
    ], 
    "bolder": [
        "JJR"
    ], 
    "Nickelodeon": [
        "NNP"
    ], 
    "century-old": [
        "JJ"
    ], 
    "Robie": [
        "NNP"
    ], 
    "LeMans": [
        "NNP"
    ], 
    "tetragonal": [
        "JJ"
    ], 
    "ineffably": [
        "RB"
    ], 
    "Robin": [
        "NNP"
    ], 
    "building-control": [
        "NN"
    ], 
    "flail": [
        "NN"
    ], 
    "frayed": [
        "JJ", 
        "VBN"
    ], 
    "blindfolded": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "shelf-registered": [
        "JJ"
    ], 
    "Indicated": [
        "VBD"
    ], 
    "Gari": [
        "NNP"
    ], 
    "mammals": [
        "NNS"
    ], 
    "Kailin": [
        "NNP"
    ], 
    "cowhide": [
        "NN"
    ], 
    "Moroccan": [
        "NNP", 
        "JJ"
    ], 
    "Gary": [
        "NNP"
    ], 
    "Talsky": [
        "NNP"
    ], 
    "theatergoing": [
        "JJ"
    ], 
    "Sanjay": [
        "NNP"
    ], 
    "two-inch": [
        "JJ"
    ], 
    "footsy": [
        "NN"
    ], 
    "-ism": [
        "NN"
    ], 
    "pantry": [
        "NN"
    ], 
    "recoated": [
        "VBN"
    ], 
    "Finucane": [
        "NNP"
    ], 
    "Print": [
        "VB"
    ], 
    "table-top": [
        "JJ"
    ], 
    "sexual": [
        "JJ"
    ], 
    "Prins": [
        "NNP"
    ], 
    "Kaliniak": [
        "NNP"
    ], 
    "Griston": [
        "NNP"
    ], 
    "Nu": [
        "NNP"
    ], 
    "Hein": [
        "NNP"
    ], 
    "Ching": [
        "NNP"
    ], 
    "China": [
        "NNP"
    ], 
    "barley": [
        "NN"
    ], 
    "Chino": [
        "NNP"
    ], 
    "Chinn": [
        "NNP"
    ], 
    "tradeable": [
        "JJ"
    ], 
    "Bostonian": [
        "NNP"
    ], 
    "Kakita": [
        "NNP"
    ], 
    "Trappist": [
        "JJ"
    ], 
    "fluctuates": [
        "VBZ"
    ], 
    "NJ": [
        "NNP"
    ], 
    "Natick": [
        "NNP"
    ], 
    "Picks": [
        "VBZ"
    ], 
    "fluctuated": [
        "VBD", 
        "VBN"
    ], 
    "Manhattan-based": [
        "JJ"
    ], 
    "goitrogens": [
        "NNS"
    ], 
    "Exceptions": [
        "NNS"
    ], 
    "Specific": [
        "JJ"
    ], 
    "Outlook": [
        "NN", 
        "NNP"
    ], 
    "yard": [
        "NN"
    ], 
    "Durban": [
        "NNP"
    ], 
    "candle-lit": [
        "JJ"
    ], 
    "hinting": [
        "VBG"
    ], 
    "better-educated": [
        "JJ"
    ], 
    "yarn": [
        "NN"
    ], 
    "dumbbell": [
        "NN"
    ], 
    "Rothwell": [
        "NNP"
    ], 
    "V-8": [
        "JJ", 
        "NNP"
    ], 
    "V-6": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Sammy": [
        "NNP"
    ], 
    "Adsi": [
        "NNP"
    ], 
    "handier": [
        "JJR"
    ], 
    "seventy-six": [
        "JJ"
    ], 
    "braced": [
        "VBN", 
        "VBD"
    ], 
    "Emhart": [
        "NNP"
    ], 
    "reaches": [
        "VBZ", 
        "NNS"
    ], 
    "glanders": [
        "NNS"
    ], 
    "Pickup": [
        "NNP"
    ], 
    "Tuitions": [
        "NNS"
    ], 
    "guidebook": [
        "NN"
    ], 
    "Necesarily": [
        "NNP"
    ], 
    "reached": [
        "VBN", 
        "VBD"
    ], 
    "hashes": [
        "NNS"
    ], 
    "braces": [
        "NNS"
    ], 
    "presuming": [
        "VBG"
    ], 
    "pershare": [
        "JJ"
    ], 
    "MANAGEMENT": [
        "NNP"
    ], 
    "coffee-roasting": [
        "JJ"
    ], 
    "Symbol": [
        "NN", 
        "NNP"
    ], 
    "Inheritance": [
        "NN"
    ], 
    "demythologized": [
        "VBN", 
        "JJ"
    ], 
    "paxam": [
        "NN"
    ], 
    "intermediate": [
        "JJ"
    ], 
    "then-Vice": [
        "NNP", 
        "JJ"
    ], 
    "student-directed": [
        "JJ"
    ], 
    "acquiescence": [
        "NN"
    ], 
    "programmable": [
        "JJ"
    ], 
    "cartoonlike": [
        "JJ"
    ], 
    "malapropism": [
        "NN"
    ], 
    "rifle-shotgun": [
        "NN"
    ], 
    "bulldog": [
        "JJ"
    ], 
    "hesitatingly": [
        "RB"
    ], 
    "Gainen": [
        "NNP"
    ], 
    "overexpansion": [
        "NN"
    ], 
    "unsubtle": [
        "JJ"
    ], 
    "Hartweger": [
        "NNP"
    ], 
    "NP": [
        "NNP"
    ], 
    "Gaines": [
        "NNP"
    ], 
    "three-front": [
        "JJ"
    ], 
    "inapt": [
        "JJ"
    ], 
    "coughed": [
        "VBD", 
        "VBN"
    ], 
    "opposition-party": [
        "JJ"
    ], 
    "Pound": [
        "NNP", 
        "NN"
    ], 
    "Portraits": [
        "NNPS"
    ], 
    "Agnese": [
        "NNP"
    ], 
    "Sabrina": [
        "NN", 
        "NNP"
    ], 
    "long-term``": [
        "``"
    ], 
    "tenements": [
        "NNS"
    ], 
    "Stirs": [
        "VBZ"
    ], 
    "Battista": [
        "NNP"
    ], 
    "mastodons": [
        "NNS"
    ], 
    "anthropologist": [
        "NN"
    ], 
    "men-folk": [
        "NNS"
    ], 
    "Hagood": [
        "NNP"
    ], 
    "FRINGE-BENEFIT": [
        "JJ"
    ], 
    "Newhart": [
        "NNP"
    ], 
    "yearned": [
        "VBD", 
        "VBN"
    ], 
    "have": [
        "VBP", 
        "JJ", 
        "NN", 
        "VB", 
        "VBN"
    ], 
    "Dollar-De": [
        "NNP"
    ], 
    "Bacarella": [
        "NNP"
    ], 
    "continents": [
        "NNS"
    ], 
    "black-and-yellow": [
        "JJ"
    ], 
    "shoestrings": [
        "NNS"
    ], 
    "million-share": [
        "JJ", 
        "NN"
    ], 
    "gingerly": [
        "RB", 
        "JJ"
    ], 
    "precipice": [
        "NN"
    ], 
    "capital-to-assets": [
        "JJ", 
        "NNS"
    ], 
    "whistle-stop": [
        "JJ"
    ], 
    "computer-edited": [
        "JJ"
    ], 
    "Omission": [
        "NN"
    ], 
    "LeGere": [
        "NNP"
    ], 
    "Meggs": [
        "NNP", 
        "NNS"
    ], 
    "super-regulator": [
        "NN"
    ], 
    "Morley": [
        "NNP"
    ], 
    "postition": [
        "NN"
    ], 
    "orchestrations": [
        "NNS"
    ], 
    "Scientology": [
        "NNP"
    ], 
    "mimics": [
        "NNS", 
        "VBZ"
    ], 
    "Rafer": [
        "NNP"
    ], 
    "enamels": [
        "NNS"
    ], 
    "clinkers": [
        "NNS"
    ], 
    "prisoner": [
        "NN"
    ], 
    "payment": [
        "NN"
    ], 
    "inexorable": [
        "JJ"
    ], 
    "beets": [
        "NNS"
    ], 
    "misrelated": [
        "VBN"
    ], 
    "disease": [
        "NN"
    ], 
    "deuterium": [
        "NN"
    ], 
    "Banca": [
        "NNP"
    ], 
    "MICROPOLIS": [
        "NNP"
    ], 
    "occasion": [
        "NN", 
        "VB"
    ], 
    "Banco": [
        "NNP"
    ], 
    "contemptuous": [
        "JJ"
    ], 
    "inexorably": [
        "RB"
    ], 
    "squeegee": [
        "VBP"
    ], 
    "Gonzalez": [
        "NNP"
    ], 
    "recess": [
        "NN"
    ], 
    "Britten": [
        "NNP", 
        "NN"
    ], 
    "ejaculated": [
        "VBD"
    ], 
    "Capshaw": [
        "NNP"
    ], 
    "demurred": [
        "VBD"
    ], 
    "Wheelabrator": [
        "NNP"
    ], 
    "hamlet": [
        "NN"
    ], 
    "trustfully": [
        "RB"
    ], 
    "shutoff": [
        "NN"
    ], 
    "submachine": [
        "JJ"
    ], 
    "definable": [
        "JJ"
    ], 
    "ImmunoGen": [
        "NNP"
    ], 
    "demurrer": [
        "NN"
    ], 
    "Pysllium": [
        "NN"
    ], 
    "Snezak": [
        "NNP"
    ], 
    "freedom-conscious": [
        "JJ"
    ], 
    "Colodny": [
        "NNP"
    ], 
    "knowledge": [
        "NN"
    ], 
    "short-seller": [
        "NN"
    ], 
    "Doner": [
        "NNP"
    ], 
    "Vanessa": [
        "NNP"
    ], 
    "no-hit": [
        "JJ"
    ], 
    "sonofabitch": [
        "NN"
    ], 
    "cohesiveness": [
        "NN"
    ], 
    "Arau": [
        "NNP"
    ], 
    "front-office": [
        "NN"
    ], 
    "standard-weight": [
        "JJ"
    ], 
    "emitting": [
        "VBG"
    ], 
    "Handelsbank": [
        "NNP"
    ], 
    "Hummerstone": [
        "NNP"
    ], 
    "Thrift": [
        "NNP", 
        "NN"
    ], 
    "Casanovas": [
        "NNPS"
    ], 
    "hijacking": [
        "NN", 
        "VBG"
    ], 
    "Finnish": [
        "JJ"
    ], 
    "feed-grain": [
        "NN"
    ], 
    "reputations": [
        "NNS"
    ], 
    "microelectronic": [
        "JJ"
    ], 
    "Winnick": [
        "NNP"
    ], 
    "Husak": [
        "NNP"
    ], 
    "Blevins": [
        "NNPS"
    ], 
    "Gaffney": [
        "NNP"
    ], 
    "subways": [
        "NNS"
    ], 
    "teams": [
        "NNS", 
        "VBZ"
    ], 
    "Helaba": [
        "NNP"
    ], 
    "PITCH": [
        "NNP"
    ], 
    "excesses": [
        "NNS"
    ], 
    "Zoe": [
        "NNP"
    ], 
    "hypophyseal": [
        "JJ"
    ], 
    "CONSOLIDATED": [
        "NNP"
    ], 
    "GNP-based": [
        "JJ"
    ], 
    "showdown": [
        "NN"
    ], 
    "metal-hydrido": [
        "NN"
    ], 
    "polyphosphates": [
        "NNS"
    ], 
    "Zoo": [
        "NNP"
    ], 
    "LEAVE": [
        "NN"
    ], 
    "teakwood": [
        "NN"
    ], 
    "daffodils": [
        "NNS"
    ], 
    "Vanuatu": [
        "NNP"
    ], 
    "tuxedos": [
        "NNS"
    ], 
    "Juliber": [
        "NNP"
    ], 
    "Squaresville": [
        "NNP"
    ], 
    "Pettibone": [
        "NNP"
    ], 
    "brunt": [
        "NN"
    ], 
    "Discreet": [
        "JJ"
    ], 
    "wean": [
        "VB"
    ], 
    "invariant": [
        "JJ", 
        "NN"
    ], 
    "tediously": [
        "RB"
    ], 
    "b-Week": [
        "NN", 
        "LS|NN"
    ], 
    "dirty": [
        "JJ", 
        "VB"
    ], 
    "antiquarians": [
        "NNS"
    ], 
    "Nonelectrical": [
        "JJ"
    ], 
    "various": [
        "JJ"
    ], 
    "Incline": [
        "NNP"
    ], 
    "weak": [
        "JJ"
    ], 
    "Inexpensive": [
        "JJ"
    ], 
    "antics": [
        "NNS"
    ], 
    "Elvador": [
        "NNP"
    ], 
    "Financings": [
        "NNS"
    ], 
    "watts": [
        "NNS"
    ], 
    "Tompkins": [
        "NNP"
    ], 
    "effluent": [
        "NN", 
        "JJ"
    ], 
    "Osamu": [
        "NNP"
    ], 
    "revoked": [
        "VBN"
    ], 
    "UAP": [
        "NNP"
    ], 
    "joke": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "equal": [
        "JJ", 
        "NN", 
        "VB", 
        "VBP"
    ], 
    "pulp": [
        "NN", 
        "VB"
    ], 
    "Byrnes": [
        "NNP"
    ], 
    "liquidating": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "politicizing": [
        "VBG"
    ], 
    "placebo": [
        "NN"
    ], 
    "statues": [
        "NNS"
    ], 
    "bond-market": [
        "JJ"
    ], 
    "treasure-trove": [
        "NN"
    ], 
    "disarmament": [
        "NN"
    ], 
    "coexistence": [
        "NN"
    ], 
    "Piscataway": [
        "NNP"
    ], 
    "Machinists": [
        "NNS", 
        "NNS|NPS", 
        "NNPS", 
        "NNP"
    ], 
    "liquidations": [
        "NNS"
    ], 
    "Miklos": [
        "NNP"
    ], 
    "Musica": [
        "NNP"
    ], 
    "Buffet": [
        "NNP"
    ], 
    "honeysuckle": [
        "NN"
    ], 
    "manhood": [
        "NN"
    ], 
    "tax-law": [
        "NN", 
        "JJ"
    ], 
    "asphyxia": [
        "NN"
    ], 
    "playwrights": [
        "NNS"
    ], 
    "magnetized": [
        "VBN"
    ], 
    "devoting": [
        "VBG"
    ], 
    "self-aggrandizing": [
        "JJ"
    ], 
    "Thailand": [
        "NNP", 
        "NN"
    ], 
    "Huerta": [
        "NNP"
    ], 
    "supermarket-refrigeration": [
        "NN"
    ], 
    "thrift-industry": [
        "NN", 
        "JJ"
    ], 
    "EXCHANGE": [
        "NN"
    ], 
    "hard-core": [
        "JJ"
    ], 
    "Massachussets": [
        "NNP"
    ], 
    "Parsow": [
        "NNP"
    ], 
    "Trevor": [
        "NNP"
    ], 
    "Airlines": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "musicality": [
        "NN"
    ], 
    "Parson": [
        "NNP"
    ], 
    "airline-industry": [
        "NN"
    ], 
    "watcher": [
        "NN"
    ], 
    "advance-purchase": [
        "JJ", 
        "NN"
    ], 
    "emergency-relief": [
        "NN"
    ], 
    "welcoming": [
        "VBG", 
        "NN", 
        "JJ"
    ], 
    "Arigato": [
        "FW"
    ], 
    "super-experiment": [
        "NN"
    ], 
    "Spruell": [
        "NNP"
    ], 
    "Tissues": [
        "NNPS"
    ], 
    "limited-scale": [
        "JJ"
    ], 
    "General": [
        "NNP", 
        "JJ"
    ], 
    "Nunn": [
        "NNP"
    ], 
    "Pricing": [
        "NN", 
        "NNP", 
        "VBG"
    ], 
    "THREAT": [
        "NN"
    ], 
    "hubs": [
        "NNS"
    ], 
    "ensuing": [
        "VBG"
    ], 
    "outshone": [
        "NN"
    ], 
    "frustrating": [
        "JJ", 
        "VBG"
    ], 
    "lassitude": [
        "NN"
    ], 
    "liberal-democratic": [
        "JJ"
    ], 
    "Carty": [
        "NNP"
    ], 
    "movie-to-be": [
        "NN"
    ], 
    "workplaces": [
        "NNS"
    ], 
    "weighed": [
        "VBD", 
        "VBN"
    ], 
    "arrangements": [
        "NNS"
    ], 
    "closets": [
        "NNS"
    ], 
    "marginalia": [
        "NNS"
    ], 
    "watched": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Beach": [
        "NNP", 
        "NN"
    ], 
    "corporate-lending": [
        "JJ"
    ], 
    "tumbled": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "whirl": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "diety": [
        "NN"
    ], 
    "Fever": [
        "NN"
    ], 
    "Return": [
        "NN", 
        "NNP", 
        "VB"
    ], 
    "Schuette": [
        "NNP"
    ], 
    "MBK": [
        "NNP"
    ], 
    "diets": [
        "NNS"
    ], 
    "MBE": [
        "NNP"
    ], 
    "DiSimone": [
        "NNP"
    ], 
    "MBA": [
        "NN", 
        "NNP"
    ], 
    "MBB": [
        "NNP"
    ], 
    "target-language": [
        "NN"
    ], 
    "sugar-coated": [
        "JJ"
    ], 
    "Polo\\/Ralph": [
        "NNP"
    ], 
    "tumbler": [
        "NN"
    ], 
    "Postel": [
        "NNP"
    ], 
    "powerboat": [
        "NN"
    ], 
    "Posted": [
        "VBN", 
        "VBD"
    ], 
    "garish": [
        "JJ"
    ], 
    "Pemex": [
        "NNP"
    ], 
    "Prevents": [
        "VBZ"
    ], 
    "Aims": [
        "VBZ"
    ], 
    "sauna": [
        "NN"
    ], 
    "Groves": [
        "NNP"
    ], 
    "Grover": [
        "NNP"
    ], 
    "Haste": [
        "NN"
    ], 
    "noncommittally": [
        "RB"
    ], 
    "yoga": [
        "NN"
    ], 
    "unfetter": [
        "VB"
    ], 
    "C.R.": [
        "NNP"
    ], 
    "Westminister": [
        "NNP"
    ], 
    "Pasquale": [
        "NNP"
    ], 
    "disoriented": [
        "VBN", 
        "JJ"
    ], 
    "exceedingly": [
        "RB"
    ], 
    "wobbled": [
        "VBD", 
        "VBN"
    ], 
    "residuals": [
        "NNS"
    ], 
    "redeemable": [
        "JJ"
    ], 
    "Warshaw": [
        "NNP"
    ], 
    "comparisons": [
        "NNS"
    ], 
    "multibilliondollar": [
        "JJ"
    ], 
    "wreckage": [
        "NN"
    ], 
    "Weimar": [
        "NNP"
    ], 
    "stores": [
        "NNS", 
        "VBZ"
    ], 
    "numbering": [
        "VBG", 
        "NN"
    ], 
    "diskette": [
        "NN"
    ], 
    "interim": [
        "JJ", 
        "NN"
    ], 
    "Collected": [
        "NNP"
    ], 
    "localize": [
        "VB"
    ], 
    "flashlight": [
        "NN"
    ], 
    "nerve-shattering": [
        "JJ"
    ], 
    "Aspects": [
        "NNPS"
    ], 
    "repetitious": [
        "JJ"
    ], 
    "reformer": [
        "JJ", 
        "NN"
    ], 
    "onward": [
        "RB"
    ], 
    "demographic": [
        "JJ"
    ], 
    "future-time": [
        "JJ"
    ], 
    "ductwork": [
        "NN"
    ], 
    "slits": [
        "NNS", 
        "VBZ"
    ], 
    "Jacobius": [
        "NNP"
    ], 
    "tremulously": [
        "RB"
    ], 
    "Heiko": [
        "NNP"
    ], 
    "embossed": [
        "VBD", 
        "VBN"
    ], 
    "bishops": [
        "NNS"
    ], 
    "reformed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "characteristically": [
        "RB"
    ], 
    "resolved": [
        "VBN", 
        "VBD"
    ], 
    "footholds": [
        "NNS"
    ], 
    "co-founders": [
        "NNS"
    ], 
    "Thread": [
        "VB"
    ], 
    "Madrigal": [
        "NNP"
    ], 
    "Hadley": [
        "NNP"
    ], 
    "Gran": [
        "NNP", 
        "NN"
    ], 
    "Threat": [
        "NN"
    ], 
    "resolves": [
        "VBZ"
    ], 
    "Release": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "bailiff": [
        "NN"
    ], 
    "futures-market": [
        "NN"
    ], 
    "computer-age": [
        "JJ"
    ], 
    "Inflammatory": [
        "JJ"
    ], 
    "like": [
        "IN", 
        "JJ", 
        "NN", 
        "VB", 
        "VBP"
    ], 
    "minicomputer": [
        "NN"
    ], 
    "vibrant": [
        "JJ"
    ], 
    "Niem": [
        "NNP"
    ], 
    "admitted": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Anders": [
        "NNP"
    ], 
    "H/NNP.A.": [
        "NN"
    ], 
    "chick": [
        "NN"
    ], 
    "job-hunting": [
        "JJ"
    ], 
    "kaleidoscope": [
        "NN"
    ], 
    "coin-cleaning": [
        "JJ"
    ], 
    "one-year-old": [
        "JJ"
    ], 
    "Heldring": [
        "NNP"
    ], 
    "foamed-in-place": [
        "JJ"
    ], 
    "Wasatch": [
        "NNP"
    ], 
    "Meyerbeer": [
        "NNP"
    ], 
    "Arney": [
        "NNP"
    ], 
    "scurried": [
        "VBD"
    ], 
    "federal-court": [
        "JJ", 
        "NN"
    ], 
    "Arai": [
        "NNP"
    ], 
    "hail": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "hair": [
        "NN"
    ], 
    "Tribune-Democrat": [
        "NNP"
    ], 
    "Palatine": [
        "NNP"
    ], 
    "Janofsky": [
        "NNP"
    ], 
    "recommendation": [
        "NN"
    ], 
    "elephantine": [
        "JJ"
    ], 
    "indemnify": [
        "VB"
    ], 
    "poseurs": [
        "NNS"
    ], 
    "scurries": [
        "NNS"
    ], 
    "Non-Catholics": [
        "NNS"
    ], 
    "Crosbys": [
        "NNPS"
    ], 
    "trust": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "OS\\": [
        "NNP", 
        "NN"
    ], 
    "hurricane": [
        "NN"
    ], 
    "McDLT": [
        "NNP"
    ], 
    "unalluring": [
        "JJ"
    ], 
    "neurosis": [
        "NN"
    ], 
    "discretion": [
        "NN"
    ], 
    "Racks": [
        "VBZ", 
        "NNS"
    ], 
    "null-type": [
        "JJ"
    ], 
    "fueloil": [
        "NN"
    ], 
    "videotext": [
        "NN"
    ], 
    "Mathues": [
        "NNP"
    ], 
    "Baker": [
        "NNP"
    ], 
    "Bakes": [
        "NNP"
    ], 
    "non-readers": [
        "NNS"
    ], 
    "lieutenant": [
        "NN"
    ], 
    "uptight": [
        "JJ"
    ], 
    "Oubati": [
        "NNP"
    ], 
    "Diebel": [
        "NNP"
    ], 
    "marketable": [
        "JJ"
    ], 
    "consumerism": [
        "NN"
    ], 
    "Foggia": [
        "NNP"
    ], 
    "Indulgence": [
        "NNP"
    ], 
    "Jarrell": [
        "NNP"
    ], 
    "CPAs": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "introduces": [
        "VBZ"
    ], 
    "purism": [
        "NN"
    ], 
    "switchboard": [
        "NN"
    ], 
    "befogged": [
        "JJ"
    ], 
    "Japan": [
        "NNP"
    ], 
    "introduced": [
        "VBN", 
        "VBD"
    ], 
    "Kingman": [
        "NNP"
    ], 
    "Salina": [
        "NNP"
    ], 
    "Psychology": [
        "NNP"
    ], 
    "socks": [
        "NNS"
    ], 
    "Iraqw": [
        "NNP"
    ], 
    "Iraqi": [
        "JJ", 
        "NNP"
    ], 
    "termini": [
        "NNS"
    ], 
    "Mindlin": [
        "NNP"
    ], 
    "lightyears": [
        "NNS"
    ], 
    "Cronkite": [
        "NNP"
    ], 
    "Lanzhou": [
        "NNP"
    ], 
    "Fresca": [
        "NNP"
    ], 
    "impartation": [
        "NN"
    ], 
    "elastic": [
        "JJ", 
        "NN"
    ], 
    "rushed": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "two-tone": [
        "JJ"
    ], 
    "petroleumproducts": [
        "NNS"
    ], 
    "FAST": [
        "NNP"
    ], 
    "rushes": [
        "VBZ", 
        "NNS"
    ], 
    "Artra": [
        "NNP"
    ], 
    "onepage": [
        "JJ"
    ], 
    "glimmer": [
        "NN"
    ], 
    "FASB": [
        "NNP"
    ], 
    "USN.": [
        "NNP"
    ], 
    "touted": [
        "VBN", 
        "VBD"
    ], 
    "insures": [
        "VBZ"
    ], 
    "insurer": [
        "NN"
    ], 
    "coke": [
        "NN"
    ], 
    "insured": [
        "VBN", 
        "VBD", 
        "JJ", 
        "NN"
    ], 
    "propylene": [
        "NN"
    ], 
    "photocathodes": [
        "NNS"
    ], 
    "no-star": [
        "JJ"
    ], 
    "anonymous": [
        "JJ"
    ], 
    "now-obscure": [
        "JJ"
    ], 
    "persimmons": [
        "NNS"
    ], 
    "Ariail": [
        "NNP"
    ], 
    "flit": [
        "VBP"
    ], 
    "non-representation": [
        "JJ"
    ], 
    "flip": [
        "JJ", 
        "VB"
    ], 
    "Konigsberg": [
        "NNP"
    ], 
    "Toshiki": [
        "NNP"
    ], 
    "omnibus": [
        "JJ", 
        "NN"
    ], 
    "Toshiko": [
        "NNP"
    ], 
    "thorn": [
        "NN"
    ], 
    "wage-discrimination": [
        "NN"
    ], 
    "madrigal": [
        "NN"
    ], 
    "replying": [
        "VBG"
    ], 
    "circus": [
        "NN"
    ], 
    "well-defined": [
        "JJ"
    ], 
    "kilogram": [
        "NN"
    ], 
    "shoot-out": [
        "NN"
    ], 
    "commentators": [
        "NNS"
    ], 
    "identities": [
        "NNS"
    ], 
    "Carwood": [
        "NNP"
    ], 
    "Driesell": [
        "NNP"
    ], 
    "Trepp": [
        "NNP"
    ], 
    "geeing": [
        "VBG"
    ], 
    "dressed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Movable": [
        "JJ"
    ], 
    "interdepartmental": [
        "JJ"
    ], 
    "detain": [
        "VB"
    ], 
    "Wireless": [
        "NNP"
    ], 
    "interest-free": [
        "JJ"
    ], 
    "ducked": [
        "VBD"
    ], 
    "dresses": [
        "NNS", 
        "VBZ"
    ], 
    "dresser": [
        "NN"
    ], 
    "convicts": [
        "NNS"
    ], 
    "Cry": [
        "NN", 
        "NNP"
    ], 
    "Fortas": [
        "NNP"
    ], 
    "Hersey": [
        "NNP"
    ], 
    "maturational": [
        "JJ"
    ], 
    "April": [
        "NNP"
    ], 
    "detours": [
        "NNS"
    ], 
    "over-hired": [
        "VBD"
    ], 
    "Prospect": [
        "NNP"
    ], 
    "stirred": [
        "VBD", 
        "VBN"
    ], 
    "ramble": [
        "VB", 
        "VBP"
    ], 
    "AARP": [
        "NNP"
    ], 
    "grimmer": [
        "RBR"
    ], 
    "Alonso": [
        "NNP"
    ], 
    "wine": [
        "NN", 
        "JJ"
    ], 
    "Gratified": [
        "JJ"
    ], 
    "pool-equipment": [
        "NN"
    ], 
    "Communisn": [
        "NN"
    ], 
    "EVERYONE": [
        "NN"
    ], 
    "Minitruck": [
        "NN"
    ], 
    "Zaves": [
        "NNP"
    ], 
    "sterilizing": [
        "VBG"
    ], 
    "dynasty": [
        "NN"
    ], 
    "Communist": [
        "NNP", 
        "NNPS", 
        "JJ", 
        "NN"
    ], 
    "Infirmary": [
        "NNP"
    ], 
    "inexpert": [
        "JJ"
    ], 
    "Employes": [
        "NNS"
    ], 
    "public-relations": [
        "NNS", 
        "JJ", 
        "NN"
    ], 
    "consciences": [
        "NNS"
    ], 
    "Wathen": [
        "NNP"
    ], 
    "glides": [
        "VBZ"
    ], 
    "midseason": [
        "NN"
    ], 
    "activist": [
        "NN", 
        "JJ"
    ], 
    "orange-juice": [
        "NN"
    ], 
    "@": [
        "IN", 
        "SYM"
    ], 
    "noninterest-income": [
        "NN"
    ], 
    "haughtiness": [
        "NN"
    ], 
    "Deluge": [
        "NN"
    ], 
    "non-interest": [
        "JJ", 
        "NN"
    ], 
    "prowls": [
        "VBZ"
    ], 
    "Auvil": [
        "NNP"
    ], 
    "Kevah": [
        "NNP"
    ], 
    "nw.": [
        "NN"
    ], 
    "reiterating": [
        "VBG"
    ], 
    "Shook": [
        "VBD"
    ], 
    "canners": [
        "NNS"
    ], 
    "MONEY": [
        "NN", 
        "NNP"
    ], 
    "harried": [
        "VBN", 
        "VBD"
    ], 
    "ANNUAL": [
        "JJ"
    ], 
    "cannery": [
        "NN"
    ], 
    "drug-pricing": [
        "NN"
    ], 
    "barracks": [
        "NN", 
        "NNS"
    ], 
    "martingale": [
        "NN"
    ], 
    "Norris-LaGuardia": [
        "NNP"
    ], 
    "feathery": [
        "JJ"
    ], 
    "Fortunately": [
        "RB", 
        "NNP"
    ], 
    "Nightmare": [
        "NNP", 
        "NN"
    ], 
    "feathers": [
        "NNS"
    ], 
    "direct": [
        "JJ", 
        "VBP", 
        "RB", 
        "VB"
    ], 
    "Solly": [
        "NNP"
    ], 
    "nail": [
        "NN", 
        "RB", 
        "VB"
    ], 
    "Okamoto": [
        "NNP"
    ], 
    "bubblelike": [
        "JJ"
    ], 
    "Samsung-Corning": [
        "NNP"
    ], 
    "caseworkers": [
        "NNS"
    ], 
    "commemorating": [
        "VBG"
    ], 
    "revolves": [
        "VBZ"
    ], 
    "revolver": [
        "NN"
    ], 
    "liberty": [
        "NN"
    ], 
    "Houdini": [
        "NNP"
    ], 
    "Mmm": [
        "UH"
    ], 
    "oaths": [
        "NNS"
    ], 
    "Manko": [
        "NNP"
    ], 
    "ebbs": [
        "VBZ"
    ], 
    "rubdowns": [
        "NNS"
    ], 
    "revolved": [
        "VBD", 
        "VBN"
    ], 
    "Augustan": [
        "NNP"
    ], 
    "electroshocks": [
        "NNS"
    ], 
    "ultimatums": [
        "NNS"
    ], 
    "half-past": [
        "JJ"
    ], 
    "overplanted": [
        "VBN"
    ], 
    "vertebrates": [
        "NNS"
    ], 
    "GARY": [
        "NNP"
    ], 
    "Fitchburg": [
        "NNP"
    ], 
    "red-and-white": [
        "JJ"
    ], 
    "snacked": [
        "VBD"
    ], 
    "Dames": [
        "NNPS", 
        "NNP"
    ], 
    "Obligations": [
        "NNS"
    ], 
    "counterprogramming": [
        "NN"
    ], 
    "leaves": [
        "VBZ", 
        "JJ", 
        "NNS"
    ], 
    "Elkus": [
        "NNP"
    ], 
    "Per-capita": [
        "JJ"
    ], 
    "White-haired": [
        "JJ"
    ], 
    "Barbados": [
        "NNP"
    ], 
    "midway": [
        "RB", 
        "JJ", 
        "NN"
    ], 
    "issuers": [
        "NNS"
    ], 
    "prints": [
        "NNS", 
        "VBZ"
    ], 
    "consumer-analgesic": [
        "JJ"
    ], 
    "Well-Tempered": [
        "JJ"
    ], 
    "Narrative": [
        "JJ"
    ], 
    "purifying": [
        "VBG"
    ], 
    "Henceforth": [
        "RB"
    ], 
    "Pasadena": [
        "NNP"
    ], 
    "meats": [
        "NNS"
    ], 
    "Lefcourt": [
        "NNP"
    ], 
    "audivi": [
        "FW"
    ], 
    "meaty": [
        "JJ"
    ], 
    "riots": [
        "NNS"
    ], 
    "saleswomen": [
        "NNS"
    ], 
    "gweilo": [
        "FW"
    ], 
    "denationalization": [
        "NN"
    ], 
    "dollar-sellers": [
        "NNS"
    ], 
    "fainting": [
        "NN", 
        "VBG"
    ], 
    "saber": [
        "NN"
    ], 
    "small-employer": [
        "NN"
    ], 
    "Sounion": [
        "NNP"
    ], 
    "Blue-chip": [
        "JJ"
    ], 
    "Legers": [
        "NNPS"
    ], 
    "overstored": [
        "JJ"
    ], 
    "excellent": [
        "JJ"
    ], 
    "Accrued": [
        "VBN"
    ], 
    "Kay-Bee": [
        "NNP"
    ], 
    "supplemental": [
        "JJ"
    ], 
    "Bio-Technology": [
        "NNP"
    ], 
    "Manigat": [
        "NNP"
    ], 
    "philanthropic": [
        "JJ"
    ], 
    "Brahms": [
        "NNP"
    ], 
    "archaism": [
        "NN"
    ], 
    "Lube": [
        "NNP"
    ], 
    "iridium": [
        "NN"
    ], 
    "Fox-Meyer": [
        "NNP"
    ], 
    "Mohan": [
        "NNP"
    ], 
    "Mrad": [
        "NN"
    ], 
    "salvage": [
        "VB", 
        "NN"
    ], 
    "grenade": [
        "NN"
    ], 
    "Buchwald": [
        "NNP"
    ], 
    "male-fertile": [
        "JJ"
    ], 
    "scorekeepers": [
        "NNS"
    ], 
    "overhears": [
        "VBZ"
    ], 
    "Jarvik": [
        "NNP"
    ], 
    "estate": [
        "NN"
    ], 
    "hemoglobin": [
        "NN"
    ], 
    "gadgets": [
        "NNS"
    ], 
    "more-spontaneous": [
        "JJ"
    ], 
    "treasuries": [
        "NNS"
    ], 
    "jumble": [
        "NN"
    ], 
    "keep": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "attract": [
        "VB", 
        "VBP"
    ], 
    "Jarvis": [
        "NNP"
    ], 
    "ceremony": [
        "NN"
    ], 
    "Haywood": [
        "NNP"
    ], 
    "multibank": [
        "NN"
    ], 
    "drummed": [
        "VBD", 
        "VBN"
    ], 
    "finalist": [
        "NN"
    ], 
    "drummer": [
        "NN"
    ], 
    "Poverty": [
        "NN", 
        "NNP"
    ], 
    "pro-environment": [
        "NN"
    ], 
    "Flemings": [
        "NNP", 
        "NNPS"
    ], 
    "char-broiled": [
        "JJ"
    ], 
    "description": [
        "NN"
    ], 
    "first-bracket": [
        "NN"
    ], 
    "insecure": [
        "JJ"
    ], 
    "befoh": [
        "RB"
    ], 
    "astoundingly": [
        "RB"
    ], 
    "Stookey": [
        "NNP"
    ], 
    "ash-blonde": [
        "JJ"
    ], 
    "Wilhelmina": [
        "NNP"
    ], 
    "salsa": [
        "NN"
    ], 
    "Banners": [
        "NNS"
    ], 
    "parallel": [
        "JJ", 
        "RB", 
        "VB", 
        "VBP", 
        "NN"
    ], 
    "provisionally": [
        "RB"
    ], 
    "humiliatingly": [
        "RB"
    ], 
    "Quakeress": [
        "NN"
    ], 
    "Sadler": [
        "NNP"
    ], 
    "hotel-casinos": [
        "NNS"
    ], 
    "HEALTHY": [
        "JJ"
    ], 
    "amid": [
        "IN"
    ], 
    "highpriced": [
        "JJ"
    ], 
    "pullout": [
        "NN"
    ], 
    "summing": [
        "VBG"
    ], 
    "flippantly": [
        "RB"
    ], 
    "funniest": [
        "JJS"
    ], 
    "fourth-biggest": [
        "JJ"
    ], 
    "Rouge": [
        "NNP"
    ], 
    "antique-car": [
        "NN"
    ], 
    "Rough": [
        "JJ", 
        "NN"
    ], 
    "Midvale": [
        "NNP"
    ], 
    "reforming": [
        "VBG"
    ], 
    "glories": [
        "NNS", 
        "VBZ"
    ], 
    "agriculture-related": [
        "JJ"
    ], 
    "resounds": [
        "VBZ"
    ], 
    "Sportin": [
        "VBG"
    ], 
    "staining": [
        "NN", 
        "VBG"
    ], 
    "Nadelmann": [
        "NNP"
    ], 
    "Haselhoff": [
        "NNP"
    ], 
    "How-2": [
        "NNP"
    ], 
    "howdy": [
        "UH"
    ], 
    "RXDC": [
        "NNP"
    ], 
    "dioramas": [
        "NN"
    ], 
    "Reva": [
        "NNP"
    ], 
    "Shopkorn": [
        "NNP"
    ], 
    "rancidity": [
        "NN"
    ], 
    "sob": [
        "VB"
    ], 
    "Convinced": [
        "VBN"
    ], 
    "Blistered": [
        "VBN"
    ], 
    "McCord": [
        "NNP"
    ], 
    "Coastline": [
        "NNP"
    ], 
    "denizens": [
        "NNS"
    ], 
    "blots": [
        "NNS", 
        "VBZ"
    ], 
    "diseases": [
        "NNS"
    ], 
    "coconut-containing": [
        "JJ"
    ], 
    "Kosar": [
        "NNP"
    ], 
    "preconceived": [
        "JJ"
    ], 
    "whitened": [
        "JJ", 
        "VBD"
    ], 
    "diseased": [
        "JJ"
    ], 
    "linguists": [
        "NNS"
    ], 
    "Kosan": [
        "NNP"
    ], 
    "flotation": [
        "NN"
    ], 
    "Nameless": [
        "NNP"
    ], 
    "Online": [
        "NNP"
    ], 
    "ennumerated": [
        "VBD"
    ], 
    "Soldatenko": [
        "NNP"
    ], 
    "long-hair": [
        "JJ"
    ], 
    "steelworkers": [
        "NNS"
    ], 
    "Walden": [
        "NNP"
    ], 
    "Verfahrenstechnik": [
        "NNP"
    ], 
    "Unigesco": [
        "NNP"
    ], 
    "Three-and-a-half": [
        "JJ"
    ], 
    "Adding": [
        "VBG"
    ], 
    "exhilarated": [
        "VBN"
    ], 
    "fishpond": [
        "NN"
    ], 
    "Percent": [
        "NN"
    ], 
    "leftist": [
        "JJ"
    ], 
    "nitrite": [
        "NN"
    ], 
    "Handelsman": [
        "NNP"
    ], 
    "railed": [
        "VBD", 
        "VBN"
    ], 
    "Corpus": [
        "NNP"
    ], 
    "Stock-fund": [
        "JJ", 
        "NN"
    ], 
    "Azusa": [
        "NNP"
    ], 
    "desertion": [
        "NN"
    ], 
    "Restrictive": [
        "JJ"
    ], 
    "Oberlin": [
        "NNP"
    ], 
    "banning": [
        "VBG", 
        "NN"
    ], 
    "foolishly": [
        "RB"
    ], 
    "newly": [
        "RB", 
        "JJ"
    ], 
    "Zeien": [
        "NNP"
    ], 
    "Signore": [
        "NNP"
    ], 
    "independence": [
        "NN"
    ], 
    "Inferential": [
        "NNP"
    ], 
    "Darwen": [
        "NNP"
    ], 
    "associate": [
        "JJ", 
        "VBP", 
        "NN", 
        "VB"
    ], 
    "hump-backed": [
        "JJ"
    ], 
    "unwraps": [
        "VBZ"
    ], 
    "Bitterness": [
        "NN"
    ], 
    "anti-A": [
        "NNP"
    ], 
    "anti-B": [
        "NNP"
    ], 
    "homologous": [
        "RB"
    ], 
    "Signora": [
        "FW", 
        "NNP"
    ], 
    "mastering": [
        "VBG"
    ], 
    "too-hearty": [
        "JJ"
    ], 
    "ASW": [
        "NN"
    ], 
    "mononuclear": [
        "JJ"
    ], 
    "reinstatement": [
        "NN"
    ], 
    "Supervisor": [
        "NNP"
    ], 
    "Photo": [
        "NNP"
    ], 
    "notching": [
        "VBG"
    ], 
    "hyperbolic": [
        "JJ"
    ], 
    "spendthrifts": [
        "NNS"
    ], 
    "days": [
        "NNS"
    ], 
    "hypocracy": [
        "NN"
    ], 
    "Traits": [
        "NNP"
    ], 
    "wowed": [
        "VBD"
    ], 
    "X-rayed": [
        "VBN"
    ], 
    "artistry": [
        "NN"
    ], 
    "F.B.": [
        "NNP"
    ], 
    "weight-training": [
        "NN"
    ], 
    "ayni": [
        "NNS"
    ], 
    "ecumenists": [
        "NNS"
    ], 
    "Interviewed": [
        "VBN"
    ], 
    "lovable": [
        "JJ"
    ], 
    "subcontractor": [
        "NN"
    ], 
    "much-discussed": [
        "JJ"
    ], 
    "Shenandoah": [
        "NNP"
    ], 
    "inter-German": [
        "JJ"
    ], 
    "affilliate": [
        "NN"
    ], 
    "ASC": [
        "NNP"
    ], 
    "fact-finding": [
        "JJ", 
        "NN"
    ], 
    "Insurances": [
        "NNPS"
    ], 
    "Cocoons": [
        "NNS"
    ], 
    "five-foot": [
        "JJ"
    ], 
    "ASA": [
        "NNP"
    ], 
    "pomological": [
        "JJ"
    ], 
    "gowns": [
        "NNS"
    ], 
    "Sweetener": [
        "NNP"
    ], 
    "malingering": [
        "VBG"
    ], 
    "extra-nasty": [
        "JJ"
    ], 
    "speechwriters": [
        "NNS"
    ], 
    "Automated": [
        "NNP", 
        "VBN"
    ], 
    "embellish": [
        "VB"
    ], 
    "Twice": [
        "RB"
    ], 
    "life-enhancement": [
        "NN"
    ], 
    "Thames": [
        "NNP", 
        "NNS"
    ], 
    "Shots": [
        "NNS"
    ], 
    "postcards": [
        "NNS"
    ], 
    "lather": [
        "NN"
    ], 
    "finance-director": [
        "NN"
    ], 
    "Surrey": [
        "NNP"
    ], 
    "reclining": [
        "VBG", 
        "JJ"
    ], 
    "frankly": [
        "RB"
    ], 
    "overinvested": [
        "VBN"
    ], 
    "up-or-down": [
        "JJ"
    ], 
    "visages": [
        "NNS"
    ], 
    "Sputnik": [
        "NNP"
    ], 
    "hemispherical": [
        "JJ"
    ], 
    "seminal": [
        "JJ"
    ], 
    "bridge": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "Christos": [
        "NNP"
    ], 
    "handkerchief": [
        "NN"
    ], 
    "thistles": [
        "NNS"
    ], 
    "Barreiro": [
        "NNP"
    ], 
    "OCC-member": [
        "JJ"
    ], 
    "unpopular": [
        "JJ"
    ], 
    "Help-wanted": [
        "JJ"
    ], 
    "truck-sales": [
        "NNS"
    ], 
    "Binn": [
        "NNP"
    ], 
    "lunchtime": [
        "NN"
    ], 
    "healer": [
        "NN"
    ], 
    "Bernini": [
        "NNP"
    ], 
    "general-merchandise": [
        "NN"
    ], 
    "page-long": [
        "JJ"
    ], 
    "seminar": [
        "NN"
    ], 
    "parliamentarian": [
        "NN"
    ], 
    "thoroughly": [
        "RB"
    ], 
    "Trends": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "thorough": [
        "JJ"
    ], 
    "dermal": [
        "JJ"
    ], 
    "unashamedly": [
        "RB"
    ], 
    "Nikitas": [
        "NNP"
    ], 
    "Economies": [
        "NNS"
    ], 
    "court-appointed": [
        "JJ"
    ], 
    "cross-bay": [
        "JJ"
    ], 
    "tularemia": [
        "NN"
    ], 
    "Schroder": [
        "NNP"
    ], 
    "hotel-restaurant": [
        "NN"
    ], 
    "erasers": [
        "NNS"
    ], 
    "impels": [
        "VBZ"
    ], 
    "rancid": [
        "JJ"
    ], 
    "Promised": [
        "JJ"
    ], 
    "aggrandizing": [
        "VBG"
    ], 
    "pardoned": [
        "VBN", 
        "VBD"
    ], 
    "mega-projects": [
        "NNS"
    ], 
    "overpriced": [
        "VBN", 
        "JJ"
    ], 
    "Anglo-North": [
        "JJ"
    ], 
    "Tsarevich": [
        "NNP"
    ], 
    "U.S.investors": [
        "NNS"
    ], 
    "Spots": [
        "NNS"
    ], 
    "musicals": [
        "NNS"
    ], 
    "Inquirer": [
        "NNP"
    ], 
    "opinionmakers": [
        "NNS"
    ], 
    "aspired": [
        "VBD"
    ], 
    "peddle": [
        "VB", 
        "VBP"
    ], 
    "endowment": [
        "NN"
    ], 
    "LOCKHEED": [
        "NNP"
    ], 
    "prevailed": [
        "VBD", 
        "VBN"
    ], 
    "situations": [
        "NNS"
    ], 
    "sycophantic": [
        "JJ"
    ], 
    "gouty": [
        "JJ"
    ], 
    "liquified": [
        "JJ"
    ], 
    "hardball": [
        "NN"
    ], 
    "greenness": [
        "NN"
    ], 
    "borrowed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "sambur": [
        "NN"
    ], 
    "Handicapped": [
        "NNP"
    ], 
    "neoclassical": [
        "JJ"
    ], 
    "ultimatum": [
        "NN"
    ], 
    "borrower": [
        "NN"
    ], 
    "applejack": [
        "NN"
    ], 
    "Gunder": [
        "NNP"
    ], 
    "considerate": [
        "JJ"
    ], 
    "dog-eared": [
        "JJ"
    ], 
    "Weatherly": [
        "NNP"
    ], 
    "angers": [
        "VBZ"
    ], 
    "bel": [
        "FW"
    ], 
    "spokesperson": [
        "NN"
    ], 
    "igneous": [
        "JJ"
    ], 
    "Mediterranean": [
        "NNP", 
        "JJ"
    ], 
    "massifs": [
        "NNS"
    ], 
    "multinationalism": [
        "NN"
    ], 
    "ailments": [
        "NNS"
    ], 
    "Medialink": [
        "NNP"
    ], 
    "wildflowers": [
        "NNS"
    ], 
    "sharpens": [
        "VBZ"
    ], 
    "skeptically": [
        "RB"
    ], 
    "Wolfe": [
        "NNP"
    ], 
    "Helva": [
        "NNP"
    ], 
    "Wolff": [
        "NNP"
    ], 
    "potty": [
        "NN"
    ], 
    "Formula": [
        "NN"
    ], 
    "Datson": [
        "NNP"
    ], 
    "molehill": [
        "NN"
    ], 
    "Stolley": [
        "NNP"
    ], 
    "mus": [
        "MD"
    ], 
    "Corp.:8.725": [
        "NNP"
    ], 
    "Stoller": [
        "NNP"
    ], 
    "Insomnia": [
        "NN"
    ], 
    "mud": [
        "NN"
    ], 
    "Pizarro": [
        "NNP"
    ], 
    "Hilger": [
        "NNP"
    ], 
    "G.E.": [
        "NNP"
    ], 
    "hopefully": [
        "RB"
    ], 
    "mum": [
        "JJ", 
        "NN"
    ], 
    "furloughs": [
        "NNS"
    ], 
    "herding": [
        "VBG", 
        "NN"
    ], 
    "print-developing": [
        "JJ"
    ], 
    "deposed": [
        "VBN", 
        "VBD"
    ], 
    "Staffordshire": [
        "NNP"
    ], 
    "pre-med": [
        "JJ"
    ], 
    "Zimbabwean": [
        "NNP", 
        "JJ"
    ], 
    "portrays": [
        "VBZ"
    ], 
    "CEREAL": [
        "NNP"
    ], 
    "four-quarter": [
        "JJ"
    ], 
    "NASAA": [
        "NNP"
    ], 
    "Drahuschak": [
        "NNP"
    ], 
    "Bridgeton": [
        "NNP"
    ], 
    "born-to-shop": [
        "JJ"
    ], 
    "fault": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Barnum": [
        "NNP"
    ], 
    "overcooks": [
        "VBZ"
    ], 
    "Pantas": [
        "NNP"
    ], 
    "six-day": [
        "JJ"
    ], 
    "consonantal": [
        "JJ"
    ], 
    "Gandois": [
        "NNP"
    ], 
    "spurs": [
        "NNS", 
        "VBZ"
    ], 
    "industry-specific": [
        "JJ"
    ], 
    "expense": [
        "NN"
    ], 
    "interoffice": [
        "JJ"
    ], 
    "HomeFed": [
        "NNP", 
        "VBN"
    ], 
    "Blomfield": [
        "NNP"
    ], 
    "antiSony": [
        "JJ"
    ], 
    "Geos": [
        "NNS"
    ], 
    "TVs": [
        "NNS", 
        "NNPS"
    ], 
    "hands-down": [
        "JJ"
    ], 
    "foamy-necked": [
        "JJ"
    ], 
    "inactivate": [
        "VB"
    ], 
    "Vendome": [
        "NNP"
    ], 
    "corteggiamento": [
        "FW"
    ], 
    "villains": [
        "NNS"
    ], 
    "pre-selected": [
        "VBN", 
        "JJ"
    ], 
    "Cutty": [
        "NNP"
    ], 
    "FEMALES": [
        "NNS"
    ], 
    "TVX": [
        "NNP"
    ], 
    "Hockett": [
        "NNP"
    ], 
    "warehouses": [
        "NNS", 
        "VBZ"
    ], 
    "sororities": [
        "NNS"
    ], 
    "zigzags": [
        "NNS"
    ], 
    "TVS": [
        "NNP"
    ], 
    "Spencer": [
        "NNP"
    ], 
    "beneficiary": [
        "NN", 
        "JJ"
    ], 
    "Bering": [
        "NNP"
    ], 
    "appestat": [
        "NN"
    ], 
    "TVA": [
        "NNP"
    ], 
    "unchanged": [
        "JJ"
    ], 
    "refuted": [
        "VBD", 
        "VBN"
    ], 
    "Adams": [
        "NNP"
    ], 
    "pecked": [
        "VBD"
    ], 
    "transatlantic": [
        "JJ", 
        "NN"
    ], 
    "Adame": [
        "NNP"
    ], 
    "Geo.": [
        "NNP"
    ], 
    "moldable": [
        "JJ"
    ], 
    "Adamo": [
        "NNP"
    ], 
    "Irretrievably": [
        "RB"
    ], 
    "STATES": [
        "NNS"
    ], 
    "microns": [
        "NNS"
    ], 
    "Fillmore": [
        "NNP"
    ], 
    "Deputy": [
        "NNP", 
        "JJ"
    ], 
    "lb-plus": [
        "JJ"
    ], 
    "Shuiski": [
        "NNP"
    ], 
    "censors": [
        "NNS", 
        "VBZ"
    ], 
    "arnica": [
        "NN"
    ], 
    "SUBURBIA": [
        "NN"
    ], 
    "n": [
        "NN", 
        "CC"
    ], 
    "Herzog": [
        "NNP"
    ], 
    "dashboard": [
        "NN"
    ], 
    "YMCA": [
        "NNP"
    ], 
    "cantles": [
        "NNS"
    ], 
    "AIDS-inspired": [
        "JJ"
    ], 
    "disquisition": [
        "NN"
    ], 
    "persecutory": [
        "JJ"
    ], 
    "persecutors": [
        "NNS"
    ], 
    "card-carrying": [
        "JJ"
    ], 
    "accessories": [
        "NNS"
    ], 
    "dazzled": [
        "VBN", 
        "JJ"
    ], 
    "Tela": [
        "NNP"
    ], 
    "dazzles": [
        "VBZ"
    ], 
    "dazzler": [
        "NN"
    ], 
    "pathology": [
        "NN"
    ], 
    "Microdyne": [
        "NNP"
    ], 
    "Tell": [
        "VB", 
        "NNP"
    ], 
    "Thacher": [
        "NNP"
    ], 
    "Handing": [
        "VBG"
    ], 
    "Abstraction": [
        "NNP", 
        "NN"
    ], 
    "prior": [
        "RB", 
        "NN", 
        "JJ"
    ], 
    "forgitful": [
        "JJ"
    ], 
    "high-polluting": [
        "JJ"
    ], 
    "Woodruff": [
        "NNP"
    ], 
    "beside": [
        "IN", 
        "RB"
    ], 
    "Chongju": [
        "NNP"
    ], 
    "Remarks": [
        "NNS", 
        "NNP", 
        "VBZ"
    ], 
    "single-valued": [
        "JJ"
    ], 
    "Imaginary": [
        "NNP", 
        "JJ"
    ], 
    "Clumps": [
        "NNS"
    ], 
    "Contraction": [
        "NN"
    ], 
    "Primerica": [
        "NNP"
    ], 
    "peaks": [
        "NNS", 
        "VBZ"
    ], 
    "Descending": [
        "VBG"
    ], 
    "Oley": [
        "NNP"
    ], 
    "Oleg": [
        "NNP"
    ], 
    "unyielding": [
        "JJ"
    ], 
    "Cascading": [
        "VBG", 
        "NN"
    ], 
    "Olea": [
        "NNP"
    ], 
    "greeter": [
        "NN"
    ], 
    "goofed": [
        "VBD"
    ], 
    "Patterson": [
        "NNP"
    ], 
    "darned": [
        "RB"
    ], 
    "all-something-or-the-other": [
        "JJ"
    ], 
    "shortly": [
        "RB"
    ], 
    "dada": [
        "NN"
    ], 
    "trash-bag": [
        "NN"
    ], 
    "litigator": [
        "NN"
    ], 
    "Muenchmeyer": [
        "NNP"
    ], 
    "Manager": [
        "NNP", 
        "NN"
    ], 
    "multistage": [
        "JJ"
    ], 
    "Ethical": [
        "NNP"
    ], 
    "Narrow-gauged": [
        "JJ"
    ], 
    "Utility": [
        "NNP", 
        "NN"
    ], 
    "snowman": [
        "NN"
    ], 
    "assembling": [
        "VBG", 
        "NN"
    ], 
    "Estonian": [
        "JJ", 
        "NNP"
    ], 
    "unemployment": [
        "NN"
    ], 
    "ex-housing": [
        "JJ"
    ], 
    "rodent": [
        "NN"
    ], 
    "grades": [
        "NNS"
    ], 
    "grader": [
        "NN"
    ], 
    "less-profitable": [
        "JJ"
    ], 
    "break.": [
        "NN"
    ], 
    "gray-thatched": [
        "JJ"
    ], 
    "megabyte": [
        "NN"
    ], 
    "preparer": [
        "NN"
    ], 
    "sacredness": [
        "NN"
    ], 
    "Kuwait": [
        "NNP"
    ], 
    "warping": [
        "VBG", 
        "NN"
    ], 
    "Konstantin": [
        "NNP"
    ], 
    "Heileman": [
        "NNP"
    ], 
    "gave": [
        "VBD"
    ], 
    "backhome": [
        "NN"
    ], 
    "Epinalers": [
        "NNPS"
    ], 
    "salacious": [
        "JJ"
    ], 
    "breaks": [
        "NNS", 
        "VBZ"
    ], 
    "LEAVING": [
        "VBG"
    ], 
    "Doolin": [
        "NNP"
    ], 
    "Skyline": [
        "NNP"
    ], 
    "descending": [
        "VBG"
    ], 
    "overcrowding": [
        "NN", 
        "JJ"
    ], 
    "b-Includes": [
        "VBZ"
    ], 
    "melting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Chrysalis": [
        "NNP"
    ], 
    "brutality": [
        "NN"
    ], 
    "renames": [
        "VBZ"
    ], 
    "Shevardnadze": [
        "NNP"
    ], 
    "Unmarried": [
        "JJ"
    ], 
    "follower": [
        "NN"
    ], 
    "Echo": [
        "NNP"
    ], 
    "renamed": [
        "VBN", 
        "VBD"
    ], 
    "majored": [
        "VBN"
    ], 
    "Hakko": [
        "NNP"
    ], 
    "envision": [
        "VBP", 
        "VB"
    ], 
    "Mosque": [
        "NNP", 
        "NN"
    ], 
    "Underwear": [
        "NN"
    ], 
    "M30": [
        "NNP"
    ], 
    "Takeover-stock": [
        "JJ"
    ], 
    "election": [
        "NN"
    ], 
    "Champagne": [
        "NNP", 
        "NN"
    ], 
    "Pitiful": [
        "NNP"
    ], 
    "Edinburgh": [
        "NNP"
    ], 
    "Experienced": [
        "VBN"
    ], 
    "SCI": [
        "NNP"
    ], 
    "SCE": [
        "NNP"
    ], 
    "Gurla": [
        "NNP"
    ], 
    "Annalee": [
        "NNP"
    ], 
    "SCA": [
        "NNP"
    ], 
    "mystified": [
        "VBN"
    ], 
    "Hiram": [
        "NNP"
    ], 
    "Spago": [
        "NNP"
    ], 
    "loins": [
        "NNS"
    ], 
    "cable-televison": [
        "NN"
    ], 
    "hunk": [
        "NN"
    ], 
    "Tradition": [
        "NN", 
        "NNP"
    ], 
    "SCR": [
        "NNP"
    ], 
    "khaki": [
        "JJ"
    ], 
    "Huggins": [
        "NNP"
    ], 
    "plugging": [
        "VBG", 
        "NN"
    ], 
    "Camaro": [
        "NNP"
    ], 
    "mark-ups": [
        "NNS"
    ], 
    "Coincidences": [
        "NNPS"
    ], 
    "Kligman": [
        "NNP"
    ], 
    "METALS": [
        "NNS", 
        "NNPS"
    ], 
    "ASDA": [
        "NNP"
    ], 
    "shuck": [
        "VB"
    ], 
    "powpow": [
        "NN"
    ], 
    "Forecasting": [
        "NN"
    ], 
    "Courtaulds": [
        "NNP"
    ], 
    "blabbed": [
        "VBD"
    ], 
    "plying": [
        "VBG"
    ], 
    "Renata": [
        "NNP"
    ], 
    "Strivers": [
        "NNPS"
    ], 
    "Scarface": [
        "NNP"
    ], 
    "Runnan": [
        "NNP"
    ], 
    "tannin": [
        "NN"
    ], 
    "duke": [
        "NN"
    ], 
    "Florio": [
        "NNP"
    ], 
    "aber": [
        "FW"
    ], 
    "disaffiliate": [
        "VBP"
    ], 
    "unsalted": [
        "JJ"
    ], 
    "Keshtmand": [
        "NNP"
    ], 
    "fern": [
        "NN"
    ], 
    "Environment": [
        "NNP", 
        "NN"
    ], 
    "ahs": [
        "UH"
    ], 
    "abed": [
        "RB"
    ], 
    "ussr": [
        "NN"
    ], 
    "RATES": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Tewary": [
        "NNP"
    ], 
    "Islanders": [
        "NNPS"
    ], 
    "vaccination": [
        "NN"
    ], 
    "warrant": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "transoceanic": [
        "JJ"
    ], 
    "sunlight": [
        "NN"
    ], 
    "Hilprecht": [
        "NNP"
    ], 
    "stuck": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Brean": [
        "NNP"
    ], 
    "mid-October": [
        "NNP", 
        "JJ", 
        "NN", 
        "JJR"
    ], 
    "Shiremanstown": [
        "NNP"
    ], 
    "data-storing": [
        "JJ"
    ], 
    "Bread": [
        "NNP", 
        "NN"
    ], 
    "indexers": [
        "NNS"
    ], 
    "Heart-measuring": [
        "JJ"
    ], 
    "Congratulations": [
        "NNS", 
        "UH"
    ], 
    "interrelation": [
        "NN"
    ], 
    "Periclean": [
        "NNP"
    ], 
    "automate": [
        "VB"
    ], 
    "pp.": [
        "NNS"
    ], 
    "pricked": [
        "VBN"
    ], 
    "overcollected": [
        "JJ"
    ], 
    "Aviazione": [
        "NNP"
    ], 
    "deoxyribonucleic": [
        "JJ"
    ], 
    "Finishing": [
        "VBG"
    ], 
    "forborne": [
        "VB"
    ], 
    "Cauff": [
        "NNP"
    ], 
    "Loomans": [
        "NNP"
    ], 
    "Seventy-six": [
        "JJ"
    ], 
    "tipsters": [
        "NNS"
    ], 
    "Mifflin": [
        "NNP"
    ], 
    "mannequins": [
        "NNS"
    ], 
    "Dannemiller": [
        "NNP"
    ], 
    "U.N.-backed": [
        "JJ"
    ], 
    "Ohmae": [
        "NNP"
    ], 
    "nerdy": [
        "JJ"
    ], 
    "more": [
        "JJR", 
        "RBR|NN", 
        "JJ", 
        "JJR|RBR", 
        "NN", 
        "RB", 
        "RP", 
        "RBR|JJR", 
        "RBR"
    ], 
    "nerds": [
        "NNS"
    ], 
    "worshipful": [
        "JJ"
    ], 
    "cobbled": [
        "VBN", 
        "VBD"
    ], 
    "Kunze": [
        "NNP"
    ], 
    "suspicions": [
        "NNS"
    ], 
    "Edouard": [
        "NNP"
    ], 
    "limbic": [
        "JJ"
    ], 
    "sometime": [
        "RB", 
        "JJ"
    ], 
    "cobbler": [
        "NN"
    ], 
    "voter-approved": [
        "JJ"
    ], 
    "Taylors": [
        "NNPS"
    ], 
    "regime": [
        "NN"
    ], 
    "inborn": [
        "JJ"
    ], 
    "eerie": [
        "JJ"
    ], 
    "Panelli": [
        "NNP"
    ], 
    "outgrew": [
        "VBD"
    ], 
    "insurance-policy": [
        "NN"
    ], 
    "mastoideus": [
        "NN"
    ], 
    "Rinker": [
        "NNP"
    ], 
    "Cornwall": [
        "NNP"
    ], 
    "Rouben": [
        "NNP"
    ], 
    "Ewan": [
        "NNP"
    ], 
    "beheading": [
        "NN", 
        "VBG"
    ], 
    "Euro-banners": [
        "NNS"
    ], 
    "but...": [
        ":"
    ], 
    "implant": [
        "NN", 
        "VB"
    ], 
    "erosion": [
        "NN"
    ], 
    "papery": [
        "JJ"
    ], 
    "squeals": [
        "NNS"
    ], 
    "ROARED": [
        "VBD"
    ], 
    "Britoil": [
        "NNP"
    ], 
    "savviest": [
        "JJS"
    ], 
    "SPERANDEO": [
        "NNP"
    ], 
    "football": [
        "NN"
    ], 
    "flushes": [
        "VBZ"
    ], 
    "V.H.": [
        "NNP"
    ], 
    "shirkers": [
        "NNS"
    ], 
    "flushed": [
        "VBN", 
        "VBD"
    ], 
    "Woodhaven": [
        "NNP"
    ], 
    "Forecasters": [
        "NNS"
    ], 
    "agayne": [
        "RB"
    ], 
    "faster": [
        "RBR", 
        "JJR", 
        "RB"
    ], 
    "Universal-International": [
        "NNP"
    ], 
    "verve": [
        "NN"
    ], 
    "vigorously": [
        "RB"
    ], 
    "Clifton": [
        "NNP"
    ], 
    "roomed": [
        "VBD"
    ], 
    "unchallenged": [
        "JJ"
    ], 
    "remarked": [
        "VBD", 
        "VBN"
    ], 
    "fasten": [
        "VB", 
        "VBP"
    ], 
    "nuclei": [
        "NNS"
    ], 
    "item-processing": [
        "JJ"
    ], 
    "relation-back": [
        "JJ"
    ], 
    "Klugt": [
        "NNP"
    ], 
    "winnings": [
        "NNS"
    ], 
    "Tsk": [
        "UH"
    ], 
    "Dutch-descended": [
        "JJ"
    ], 
    "rob": [
        "VB", 
        "VBP"
    ], 
    "Vickstrom": [
        "NNP"
    ], 
    "rod": [
        "NN"
    ], 
    "deliveries": [
        "NNS", 
        "NN"
    ], 
    "Fuqua": [
        "NNP"
    ], 
    "Transcontinental": [
        "NNP"
    ], 
    "Getz": [
        "NNP"
    ], 
    "Kluge": [
        "NNP"
    ], 
    "savings-type": [
        "JJ"
    ], 
    "functioned": [
        "VBD", 
        "VBN"
    ], 
    "Gets": [
        "VBZ", 
        "NNP"
    ], 
    "rot": [
        "NN", 
        "VB"
    ], 
    "row": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "inverse": [
        "JJ", 
        "NN"
    ], 
    "unk-unks": [
        "NNS"
    ], 
    "blind-sided": [
        "JJ", 
        "VBN"
    ], 
    "September-October": [
        "NNP"
    ], 
    "fairy-tale": [
        "NN"
    ], 
    "earthquake": [
        "NN"
    ], 
    "aplomb": [
        "NN"
    ], 
    "unconcernedly": [
        "RB"
    ], 
    "Oesterreichische": [
        "NNP"
    ], 
    "R-Cape": [
        "NNP"
    ], 
    "marrieds": [
        "NNS"
    ], 
    "Snap-On": [
        "NNP"
    ], 
    "Whittlesey": [
        "NNP"
    ], 
    "Holston": [
        "NNP"
    ], 
    "frequencies": [
        "NNS"
    ], 
    "emphasizes": [
        "VBZ"
    ], 
    "Creepers": [
        "UH"
    ], 
    "Tsunami": [
        "NNS"
    ], 
    "Roylott": [
        "NNP"
    ], 
    "feel-good": [
        "JJ"
    ], 
    "emphasized": [
        "VBD", 
        "VBN"
    ], 
    "bathos": [
        "NN"
    ], 
    "hydraulically": [
        "RB"
    ], 
    "near-majority": [
        "JJ"
    ], 
    "Danger": [
        "NNP", 
        "NN"
    ], 
    "Owens-Illinois": [
        "NNP"
    ], 
    "Accounts": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Tyndall": [
        "NNP"
    ], 
    "hotelier": [
        "NN"
    ], 
    "Yok.": [
        "NNP"
    ], 
    "Novo": [
        "NNP"
    ], 
    "irritates": [
        "VBZ"
    ], 
    "Azcuenaga": [
        "NNP"
    ], 
    "Braddock": [
        "NNP"
    ], 
    "Nova": [
        "NNP"
    ], 
    "thickest": [
        "JJS"
    ], 
    "widened": [
        "VBD", 
        "VBN"
    ], 
    "double-bladed": [
        "JJ"
    ], 
    "video-rental": [
        "JJ"
    ], 
    "Savory": [
        "JJ"
    ], 
    "\\*\\*": [
        "SYM", 
        "NN"
    ], 
    "Feuermann": [
        "NNP"
    ], 
    "irritated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "evaporative": [
        "JJ"
    ], 
    "explictly": [
        "RB"
    ], 
    "psyllium-fortified": [
        "JJ"
    ], 
    "goes": [
        "VBZ"
    ], 
    "hopscotched": [
        "VBD"
    ], 
    "Qui": [
        "FW"
    ], 
    "jilted": [
        "VBN"
    ], 
    "now-legal": [
        "JJ"
    ], 
    "Nov.": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "tabulation": [
        "NN"
    ], 
    "Fragua": [
        "NNP"
    ], 
    "slaying": [
        "NN", 
        "VBG"
    ], 
    "learn": [
        "VB", 
        "VBP"
    ], 
    "investment-newsletter": [
        "NN"
    ], 
    "femininity": [
        "NN"
    ], 
    "erembal": [
        "NNP"
    ], 
    "witch": [
        "NN"
    ], 
    "foreign-flag": [
        "NN"
    ], 
    "Pebworth": [
        "NNP"
    ], 
    "Mainz": [
        "NNP"
    ], 
    "oodles": [
        "NN"
    ], 
    "Fischer": [
        "NNP"
    ], 
    "boast": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "rethink": [
        "VB", 
        "NN"
    ], 
    "AGENCY": [
        "NNP", 
        "NN"
    ], 
    "then-Speaker": [
        "JJ"
    ], 
    "lamps": [
        "NNS"
    ], 
    "prudent-man": [
        "JJ"
    ], 
    "Maine": [
        "NNP"
    ], 
    "Leet": [
        "NNP"
    ], 
    "Kress": [
        "NNP"
    ], 
    "Lees": [
        "NNP"
    ], 
    "Visiting": [
        "VBG", 
        "NNP"
    ], 
    "problematic": [
        "JJ"
    ], 
    "atrocious": [
        "JJ"
    ], 
    "wreak": [
        "VB"
    ], 
    "Ohioans": [
        "NNPS"
    ], 
    "Kresa": [
        "NNP"
    ], 
    "civilizations": [
        "NNS"
    ], 
    "touchdown": [
        "NN"
    ], 
    "Jerky": [
        "NNP"
    ], 
    "crisis": [
        "NN"
    ], 
    "bulbs": [
        "NNS"
    ], 
    "Sienkiewicz": [
        "NNP"
    ], 
    "chimps": [
        "NNS"
    ], 
    "variously": [
        "RB"
    ], 
    "Nikon": [
        "NNP"
    ], 
    "Appel": [
        "NNP"
    ], 
    "prey": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "meanes": [
        "NNS"
    ], 
    "prep": [
        "JJ", 
        "NN"
    ], 
    "today": [
        "NN", 
        "JJ", 
        "RB"
    ], 
    "plug": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Westamerica": [
        "NNP", 
        "NN"
    ], 
    "Pellegrini": [
        "NNP"
    ], 
    "cased": [
        "VBD"
    ], 
    "fuel": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "higher-than-normal": [
        "JJ"
    ], 
    "Manningham": [
        "NNP"
    ], 
    "BUFFALO": [
        "NNP"
    ], 
    "spoilage": [
        "NN"
    ], 
    "Lavidge": [
        "NNP"
    ], 
    "depressants": [
        "NNS"
    ], 
    "family-owned": [
        "JJ"
    ], 
    "posthumous": [
        "JJ"
    ], 
    "inveterate": [
        "JJ"
    ], 
    "dthat": [
        "IN"
    ], 
    "Vesco": [
        "NNP"
    ], 
    "Bergsma": [
        "NNP"
    ], 
    "hitmakers": [
        "NNS"
    ], 
    "address": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Kanon": [
        "NNP"
    ], 
    "figure": [
        "NN", 
        "VB", 
        "VBP", 
        "VBZ"
    ], 
    "inexperience": [
        "NN"
    ], 
    "adherent": [
        "JJ", 
        "NN"
    ], 
    "Hutchings": [
        "NNP"
    ], 
    "Encino": [
        "NNP"
    ], 
    "unloads": [
        "VBZ"
    ], 
    "McDowell": [
        "NNP"
    ], 
    "air-cell": [
        "JJ"
    ], 
    "Dilys": [
        "NNP"
    ], 
    "naivete": [
        "NN"
    ], 
    "Concerning": [
        "VBG"
    ], 
    "middle-range": [
        "JJ"
    ], 
    "medium-to-long-range": [
        "JJ"
    ], 
    "mismanagement": [
        "NN"
    ], 
    "Tarwhine": [
        "NNP"
    ], 
    "night-vision": [
        "JJ", 
        "NN"
    ], 
    "fourth": [
        "JJ", 
        "RB"
    ], 
    "Demand": [
        "NN", 
        "VB", 
        "NNP"
    ], 
    "deep-pocketed": [
        "JJ"
    ], 
    "generic-drug": [
        "NN", 
        "JJ"
    ], 
    "digesting": [
        "VBG"
    ], 
    "Coproduction": [
        "NNP"
    ], 
    "bedground": [
        "NN"
    ], 
    "tyke": [
        "NN"
    ], 
    "trickling": [
        "VBG"
    ], 
    "unificationists": [
        "NNS"
    ], 
    "representations": [
        "NNS"
    ], 
    "Eligibility": [
        "NN"
    ], 
    "eighth": [
        "JJ", 
        "NN"
    ], 
    "Exclusive": [
        "JJ"
    ], 
    "Gomez": [
        "NNP"
    ], 
    "Cardin": [
        "NNP"
    ], 
    "utero": [
        "NN"
    ], 
    "Soup": [
        "NNP", 
        "NN"
    ], 
    "substerilization": [
        "NN"
    ], 
    "pastilles": [
        "NNS"
    ], 
    "Spahnie": [
        "NN"
    ], 
    "Newport": [
        "NNP", 
        "NN"
    ], 
    "Behague": [
        "NNP"
    ], 
    "Ratner": [
        "NNP"
    ], 
    "statisticians": [
        "NNS"
    ], 
    "Unruh": [
        "NNP"
    ], 
    "stock-warrant": [
        "NN"
    ], 
    "DOORS": [
        "NNS"
    ], 
    "cistern": [
        "NN"
    ], 
    "mantlepiece": [
        "NN"
    ], 
    "dreading": [
        "VBG"
    ], 
    "farmed": [
        "VBD", 
        "JJ"
    ], 
    "stanchest": [
        "JJS"
    ], 
    "Euromark": [
        "NN"
    ], 
    "Rules": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "cathodoluminescent": [
        "JJ"
    ], 
    "guiltiness": [
        "NN"
    ], 
    "non-confrontational": [
        "JJ"
    ], 
    "hanky": [
        "NN"
    ], 
    "Wesley": [
        "NNP"
    ], 
    "Everywhere": [
        "RB"
    ], 
    "pervade": [
        "VBP"
    ], 
    "farmer": [
        "NN"
    ], 
    "Matamoras": [
        "NNP"
    ], 
    "loophole": [
        "NN"
    ], 
    "leggy": [
        "JJ"
    ], 
    "Ruled": [
        "VBN"
    ], 
    "Throne": [
        "NN"
    ], 
    "Wildlife": [
        "NNP", 
        "NN"
    ], 
    "nomads": [
        "NNS"
    ], 
    "Harmonizing": [
        "NNP"
    ], 
    "Koenigsberg": [
        "NNP"
    ], 
    "non-recessionary": [
        "JJ"
    ], 
    "top-four": [
        "JJ"
    ], 
    "Nobuto": [
        "NNP"
    ], 
    "Ultimate": [
        "NNP", 
        "JJ"
    ], 
    "Ornelas": [
        "NNP"
    ], 
    "inheriting": [
        "VBG"
    ], 
    "invents": [
        "VBZ"
    ], 
    "sop": [
        "NN"
    ], 
    "endangerment": [
        "NN"
    ], 
    "argues...": [
        ":"
    ], 
    "Monsky": [
        "NNP"
    ], 
    "community-based": [
        "JJ"
    ], 
    "all-New": [
        "NNP"
    ], 
    "ordain": [
        "VB"
    ], 
    "whiplash": [
        "NN"
    ], 
    "farewell": [
        "NN", 
        "UH"
    ], 
    "Petersburg": [
        "NNP"
    ], 
    "Poag": [
        "NNP"
    ], 
    "Eugenia": [
        "NNP"
    ], 
    "intended": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "UGI": [
        "NNP"
    ], 
    "computer-market": [
        "JJ"
    ], 
    "concur": [
        "VBP", 
        "VB"
    ], 
    "precooked": [
        "VBN"
    ], 
    "sha": [
        "MD"
    ], 
    "tensions": [
        "NNS"
    ], 
    "prophesized": [
        "VBD"
    ], 
    "UGF": [
        "NNP"
    ], 
    "abounding": [
        "VBG"
    ], 
    "Timpanogos": [
        "NNP"
    ], 
    "with-but-after": [
        "JJ"
    ], 
    "Throw": [
        "VB", 
        "NNP"
    ], 
    "monopolized": [
        "VBD", 
        "VBN"
    ], 
    "eagle": [
        "NN"
    ], 
    "one-owner": [
        "JJ"
    ], 
    "Gregoire": [
        "NNP"
    ], 
    "Economizers": [
        "NNS"
    ], 
    "nuclear-weapons-sites": [
        "NNS"
    ], 
    "rocket-motor": [
        "NN"
    ], 
    "dyed-in-the-wool": [
        "JJ"
    ], 
    "TECHNOLOGIES": [
        "NNP"
    ], 
    "minted": [
        "VBN"
    ], 
    "drilled": [
        "VBN", 
        "VBD"
    ], 
    "Bock": [
        "NNP"
    ], 
    "Battery": [
        "NNP", 
        "NN"
    ], 
    "then-Secretary": [
        "NNP"
    ], 
    "Boca": [
        "NNP"
    ], 
    "Virgins": [
        "NNPS"
    ], 
    "Gringo": [
        "NN", 
        "NNP"
    ], 
    "Holler": [
        "NNP"
    ], 
    "outbreaks": [
        "NNS"
    ], 
    "mortars": [
        "NNS"
    ], 
    "Longview": [
        "NNP"
    ], 
    "Holley": [
        "NNP"
    ], 
    "Ah-ah": [
        "UH"
    ], 
    "long-troubled": [
        "JJ"
    ], 
    "R2-D2": [
        "NN"
    ], 
    "Hyde-to-Jekyll": [
        "JJ"
    ], 
    "parasols": [
        "NNS"
    ], 
    "handled": [
        "VBN", 
        "VBD"
    ], 
    "Chernishev": [
        "NNP"
    ], 
    "unattainable": [
        "JJ", 
        "NN"
    ], 
    "dissolutions": [
        "NNS"
    ], 
    "squashed": [
        "JJ", 
        "VBN"
    ], 
    "in-state": [
        "JJ"
    ], 
    "Lido": [
        "NNP"
    ], 
    "afterthought": [
        "NN"
    ], 
    "spurned": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "native-born": [
        "JJ"
    ], 
    "prayers": [
        "NNS"
    ], 
    "less-than-robust": [
        "JJ"
    ], 
    "Contras": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "DGII": [
        "NNP"
    ], 
    "arousing": [
        "VBG"
    ], 
    "seller-financed": [
        "JJ"
    ], 
    "woodcarver": [
        "NN"
    ], 
    "Aurelius": [
        "NNP"
    ], 
    "international-share": [
        "JJ"
    ], 
    "Lids": [
        "NNS"
    ], 
    "Netty": [
        "NNP"
    ], 
    "Bruckheimer": [
        "NNP"
    ], 
    "Kaufhof": [
        "NNP"
    ], 
    "stylized": [
        "JJ", 
        "VBN"
    ], 
    "SE\\/30": [
        "NNP"
    ], 
    "Netto": [
        "NNP"
    ], 
    "self-betrayal": [
        "NN"
    ], 
    "grunt": [
        "VB", 
        "NN"
    ], 
    "strange-sounding": [
        "JJ"
    ], 
    "prior-approval": [
        "JJ"
    ], 
    "Garment": [
        "NNP"
    ], 
    "Futhermore": [
        "NN"
    ], 
    "barrels-a-day": [
        "JJ"
    ], 
    "newage": [
        "NN"
    ], 
    "Yoshiyuki": [
        "NNP"
    ], 
    "cards": [
        "NNS"
    ], 
    "pulsation": [
        "NN"
    ], 
    "sladang": [
        "NN"
    ], 
    "Thelma": [
        "NNP"
    ], 
    "Bakeries": [
        "NNP"
    ], 
    "BPC": [
        "NNP"
    ], 
    "BPB": [
        "NNP"
    ], 
    "overfill": [
        "VB"
    ], 
    "Grange": [
        "NNP"
    ], 
    "Attraction": [
        "NNP"
    ], 
    "stiffest": [
        "JJS"
    ], 
    "suspense": [
        "NN"
    ], 
    "Navona": [
        "NNP"
    ], 
    "exchanging": [
        "VBG"
    ], 
    "ADR": [
        "NNP"
    ], 
    "price-reporting": [
        "NN"
    ], 
    "wage-setter": [
        "NN"
    ], 
    "batting": [
        "VBG", 
        "NN"
    ], 
    "ADS": [
        "NNPS", 
        "NN", 
        "NNS"
    ], 
    "Karlis": [
        "NNP"
    ], 
    "subsystems": [
        "NNS"
    ], 
    "```": [
        "NN", 
        "VB"
    ], 
    "Lemmon": [
        "NNP"
    ], 
    "Hotelecopy": [
        "NNP"
    ], 
    "Topeka": [
        "NNP"
    ], 
    "sciences": [
        "NNS"
    ], 
    "jade-handled": [
        "JJ"
    ], 
    "Sauternes": [
        "NNP", 
        "NNPS"
    ], 
    "Jachmann": [
        "NNP"
    ], 
    "Londono": [
        "NNP"
    ], 
    "roleplaying": [
        "NN"
    ], 
    "commonplace": [
        "JJ", 
        "NN"
    ], 
    "Korean-American": [
        "JJ", 
        "NNP"
    ], 
    "Barnaba": [
        "NNP"
    ], 
    "Good": [
        "JJ", 
        "NNP", 
        "NN", 
        "UH"
    ], 
    "icon": [
        "NN"
    ], 
    "wireless": [
        "JJ"
    ], 
    "annum": [
        "NN", 
        "FW"
    ], 
    "Geduld": [
        "NNP"
    ], 
    "proud": [
        "JJ"
    ], 
    "pores": [
        "NNS", 
        "VBZ"
    ], 
    "Abreast": [
        "NNP"
    ], 
    "pored": [
        "VBD", 
        "VBN"
    ], 
    "applicator": [
        "NN"
    ], 
    "Gesamtkunstwerke": [
        "FW"
    ], 
    "pop-out": [
        "JJ"
    ], 
    "drastically": [
        "RB"
    ], 
    "inequity": [
        "NN"
    ], 
    "Anglophilia": [
        "NNP"
    ], 
    "antitakeover": [
        "JJR"
    ], 
    "cheat": [
        "VB", 
        "VBP"
    ], 
    "Kanjorski": [
        "NNP"
    ], 
    "allegations": [
        "NNS"
    ], 
    "Research": [
        "NNP", 
        "NN"
    ], 
    "spacer": [
        "NN"
    ], 
    "spaces": [
        "NNS"
    ], 
    "Opposed": [
        "VBN"
    ], 
    "Bundesbank": [
        "NNP"
    ], 
    "inshore": [
        "JJ", 
        "RB"
    ], 
    "painlessly": [
        "RB"
    ], 
    "trot": [
        "NN", 
        "VB"
    ], 
    "Publishers": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "sausage-grinder": [
        "NN"
    ], 
    "Confer": [
        "NNP"
    ], 
    "gunloading": [
        "NN"
    ], 
    "skywave": [
        "NN"
    ], 
    "believing": [
        "VBG"
    ], 
    "Mimi": [
        "NNP"
    ], 
    "Overtega": [
        "NNP"
    ], 
    "Louis": [
        "NNP"
    ], 
    "Annual": [
        "JJ", 
        "NNP"
    ], 
    "broadest": [
        "JJS"
    ], 
    "Europalia": [
        "NNP"
    ], 
    "Kennametal": [
        "NNP"
    ], 
    "Lashof": [
        "NNP"
    ], 
    "Colombatto": [
        "NNP"
    ], 
    "cylinders": [
        "NNS"
    ], 
    "heisted": [
        "VBD"
    ], 
    "cautionary": [
        "JJ"
    ], 
    "burlesque": [
        "JJ"
    ], 
    "Doherty": [
        "NNP"
    ], 
    "high-backed": [
        "JJ"
    ], 
    "contrivances": [
        "NNS"
    ], 
    "Goethe": [
        "NNP"
    ], 
    "Salim": [
        "NNP"
    ], 
    "Gouldoid": [
        "JJ"
    ], 
    "jokes": [
        "NNS", 
        "VBZ"
    ], 
    "Geoff": [
        "NNP"
    ], 
    "predicted": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "E.W.": [
        "NNP"
    ], 
    "Dagens": [
        "NNP"
    ], 
    "Plympton": [
        "NNP"
    ], 
    "Conquest": [
        "NNP"
    ], 
    "Lamphere": [
        "NNP"
    ], 
    "oil-depletion": [
        "JJ"
    ], 
    "Off-Road": [
        "NNP"
    ], 
    "signs": [
        "NNS", 
        "VBZ"
    ], 
    "Jaffray": [
        "NNP"
    ], 
    "Conus": [
        "NNP"
    ], 
    "Dickie": [
        "NNP"
    ], 
    "Bits": [
        "NNS"
    ], 
    "Chicagoans": [
        "NNPS", 
        "NNS"
    ], 
    "Chestnut": [
        "NNP", 
        "NN"
    ], 
    "Tardily": [
        "RB"
    ], 
    "subcompact": [
        "NN", 
        "JJ"
    ], 
    "Hamish": [
        "NNP"
    ], 
    "Bouncing": [
        "NNP"
    ], 
    "Loose": [
        "NNP", 
        "JJ"
    ], 
    "commitments": [
        "NNS"
    ], 
    "Vitro-Anchor": [
        "NNP"
    ], 
    "Galipault": [
        "NNP"
    ], 
    "anti-apartheid": [
        "JJ", 
        "NN"
    ], 
    "Breuer": [
        "NNP"
    ], 
    "Harperner": [
        "NNP"
    ], 
    "saucy": [
        "JJ"
    ], 
    "three-step": [
        "JJ", 
        "NN"
    ], 
    "Seiders": [
        "NNP"
    ], 
    "disaffection": [
        "NN"
    ], 
    "freight-forwarding": [
        "JJ"
    ], 
    "harshly": [
        "RB"
    ], 
    "Westerly": [
        "NNP"
    ], 
    "Indigestion": [
        "NN"
    ], 
    "Tolstoy": [
        "NNP", 
        "NN"
    ], 
    "fathuh": [
        "NN"
    ], 
    "tantalizingly": [
        "RB"
    ], 
    "ISC\\/Bunker": [
        "NNP"
    ], 
    "quiet": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "jillions": [
        "NNS"
    ], 
    "Krat": [
        "NNP"
    ], 
    "Genetics": [
        "NNP", 
        "NNPS"
    ], 
    "Travel": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "staff...": [
        ":"
    ], 
    "period": [
        "NN"
    ], 
    "insist": [
        "VBP", 
        "VB"
    ], 
    "Durning": [
        "NNP"
    ], 
    "ECU-denominated": [
        "JJ"
    ], 
    "sugar-producing": [
        "JJ"
    ], 
    "Numerous": [
        "JJ"
    ], 
    "debt-service": [
        "JJ", 
        "NN"
    ], 
    "Courant": [
        "NNP"
    ], 
    "turkey": [
        "NN", 
        "JJ"
    ], 
    "televising": [
        "NN"
    ], 
    "subscribed": [
        "VBN", 
        "VBD", 
        "VBN|JJ"
    ], 
    "lower-value": [
        "JJR"
    ], 
    "consultancy": [
        "NN"
    ], 
    "Meeker": [
        "NNP"
    ], 
    "Edsel": [
        "NNP"
    ], 
    "subscribes": [
        "VBZ"
    ], 
    "Modest": [
        "JJ"
    ], 
    "ASHTON-TATE": [
        "NNP"
    ], 
    "peaking": [
        "VBG", 
        "NN"
    ], 
    "vulture-like": [
        "JJ"
    ], 
    "direction": [
        "NN"
    ], 
    "Aer": [
        "NNP"
    ], 
    "exasperate": [
        "VB"
    ], 
    "CAAC": [
        "NNP"
    ], 
    "ostentation": [
        "NN"
    ], 
    "surreptitiously": [
        "RB"
    ], 
    "Spilman": [
        "NNP"
    ], 
    "Hartfield-Zodys": [
        "NNP"
    ], 
    "walkie-talkie": [
        "NN"
    ], 
    "roaringest": [
        "JJS"
    ], 
    "TRANSPLANT": [
        "NNP"
    ], 
    "case": [
        "NN", 
        "VB"
    ], 
    "Aeronautics": [
        "NNP"
    ], 
    "multiple-purpose": [
        "JJ"
    ], 
    "deposit-transfer": [
        "NN"
    ], 
    "Stetson": [
        "NNP"
    ], 
    "Intertech": [
        "NNP"
    ], 
    "cash": [
        "NN", 
        "VB"
    ], 
    "cask": [
        "NN"
    ], 
    "fiercer": [
        "JJR"
    ], 
    "cast": [
        "NN", 
        "JJ", 
        "VB", 
        "VBD", 
        "VBN", 
        "VBP"
    ], 
    "Conversion": [
        "NNP", 
        "NN"
    ], 
    "Metamorphosis": [
        "NN"
    ], 
    "intifada": [
        "NN"
    ], 
    "Laurel": [
        "NNP"
    ], 
    "abducted": [
        "VBN", 
        "NN"
    ], 
    "Lauren": [
        "NNP"
    ], 
    "reflectance": [
        "NN"
    ], 
    "antisocial": [
        "JJ"
    ], 
    "clefts": [
        "NNS"
    ], 
    "Dionysian": [
        "JJ"
    ], 
    "duplicating": [
        "VBG"
    ], 
    "refinery": [
        "NN"
    ], 
    "leadoff": [
        "NN"
    ], 
    "flat-bed": [
        "JJ", 
        "NN"
    ], 
    "ironic": [
        "JJ"
    ], 
    "impaled": [
        "VBN"
    ], 
    "refiners": [
        "NNS"
    ], 
    "four-wheel": [
        "JJ"
    ], 
    "Characteristically": [
        "RB"
    ], 
    "hustlers": [
        "NNS"
    ], 
    "Germanys": [
        "NNS", 
        "NNPS"
    ], 
    "revolutions": [
        "NNS"
    ], 
    "participant": [
        "NN"
    ], 
    "MarCor": [
        "NNP"
    ], 
    "sellin": [
        "NN"
    ], 
    "Frenchmen": [
        "NNPS", 
        "NNS"
    ], 
    "fender": [
        "NN"
    ], 
    "Swiftly": [
        "RB"
    ], 
    "injurious": [
        "JJ"
    ], 
    "squadroom": [
        "NN"
    ], 
    "Jacuzzi": [
        "NNP", 
        "NN"
    ], 
    "FileNet": [
        "NNP"
    ], 
    "catfish": [
        "NN"
    ], 
    "manila": [
        "JJ"
    ], 
    "Lasswitz": [
        "NNP"
    ], 
    "frequented": [
        "VBD", 
        "VBN"
    ], 
    "fended": [
        "VBD", 
        "VBN"
    ], 
    "Yancey-6": [
        "NN"
    ], 
    "Aphrodite": [
        "NNP"
    ], 
    "even-handed": [
        "JJ"
    ], 
    "Antone": [
        "NNP"
    ], 
    "Antoni": [
        "NNP"
    ], 
    "first-half": [
        "JJ", 
        "NN"
    ], 
    "one-by-one": [
        "JJ"
    ], 
    "statue": [
        "NN"
    ], 
    "electronics-distribution": [
        "NN"
    ], 
    "epidemiological": [
        "JJ"
    ], 
    "FIDELITY": [
        "NNP"
    ], 
    "Antony": [
        "NNP"
    ], 
    "Off-flavor": [
        "NN"
    ], 
    "electromagnetism": [
        "NN"
    ], 
    "British-French-Israeli": [
        "JJ"
    ], 
    "Psychoanalytic": [
        "NNP"
    ], 
    "Failures": [
        "NNS"
    ], 
    "bodied": [
        "JJ"
    ], 
    "Zirbel": [
        "NNP"
    ], 
    "delectable": [
        "JJ"
    ], 
    "catchword": [
        "NN"
    ], 
    "Pure": [
        "NNP", 
        "JJ"
    ], 
    "delectably": [
        "RB"
    ], 
    "influence-peddling": [
        "NN", 
        "JJ"
    ], 
    "bodies": [
        "NNS", 
        "VBZ"
    ], 
    "justify": [
        "VB", 
        "VBP"
    ], 
    "Pink": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Bokat": [
        "NNP"
    ], 
    "Yakkety": [
        "NNP"
    ], 
    "splices": [
        "VBZ"
    ], 
    "Barrios": [
        "NNP"
    ], 
    "Pina": [
        "NNP"
    ], 
    "Pine": [
        "NNP"
    ], 
    "spliced": [
        "VBN"
    ], 
    "cease": [
        "VB", 
        "VBP"
    ], 
    "polish": [
        "VB", 
        "NN"
    ], 
    "Decorators": [
        "NNP"
    ], 
    "Municipal": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "FDIC": [
        "NNP"
    ], 
    "feminist": [
        "JJ", 
        "NN"
    ], 
    "Missile": [
        "NNP"
    ], 
    "Tamotsu": [
        "NNP"
    ], 
    "ditties": [
        "NNS"
    ], 
    "invasion-theory": [
        "NN"
    ], 
    "Bosworth": [
        "NNP"
    ], 
    "Bonnierforetagen": [
        "NNP"
    ], 
    "feminism": [
        "NN"
    ], 
    "assets*": [
        "NNS"
    ], 
    "Clairton": [
        "NNP"
    ], 
    "Non-smoking": [
        "NN"
    ], 
    "half-states": [
        "NNS"
    ], 
    "co-ordinates": [
        "VBZ"
    ], 
    "the...": [
        ":"
    ], 
    "Motorfair": [
        "NNP"
    ], 
    "Af-stage": [
        "JJ"
    ], 
    "reconfiguration": [
        "NN"
    ], 
    "Accompanied": [
        "VBN"
    ], 
    "U.N.": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Kasen": [
        "NNP"
    ], 
    "television-viewing": [
        "NN"
    ], 
    "acute": [
        "JJ", 
        "NN"
    ], 
    "towel": [
        "NN"
    ], 
    "coursed": [
        "VBN"
    ], 
    "eight-piece": [
        "JJ"
    ], 
    "Old": [
        "NNP", 
        "JJ"
    ], 
    "towed": [
        "VBD", 
        "VBN"
    ], 
    "footballs": [
        "NNS"
    ], 
    "Enhancement": [
        "NNP"
    ], 
    "Ludden": [
        "NNP"
    ], 
    "snatches": [
        "NNS", 
        "VBZ"
    ], 
    "apple-tree": [
        "NN"
    ], 
    "simulator": [
        "NN"
    ], 
    "quick-service": [
        "JJ"
    ], 
    "Master": [
        "NNP", 
        "NN"
    ], 
    "Muynak": [
        "NNP"
    ], 
    "snatched": [
        "VBD", 
        "VBN"
    ], 
    "arms-reduction": [
        "NN", 
        "JJ"
    ], 
    "Struggling": [
        "VBG"
    ], 
    "animalcare": [
        "JJ"
    ], 
    "swaps": [
        "NNS"
    ], 
    "tricks": [
        "NNS", 
        "VBZ"
    ], 
    "Cater": [
        "NNP"
    ], 
    "Tettamanti": [
        "NNP"
    ], 
    "Mercifully": [
        "RB"
    ], 
    "kilter": [
        "NN"
    ], 
    "penny-pinching": [
        "JJ"
    ], 
    "Harmas": [
        "NNP"
    ], 
    "cringing": [
        "VBG", 
        "JJ"
    ], 
    "slaughter": [
        "NN", 
        "VBP"
    ], 
    "pooch": [
        "NN"
    ], 
    "Forsyth": [
        "NNP"
    ], 
    "prattle": [
        "NN"
    ], 
    "lifeboats": [
        "NNS"
    ], 
    "five-consecutive": [
        "JJ"
    ], 
    "treadmills": [
        "NNS"
    ], 
    "fillings": [
        "NNS"
    ], 
    "freight-jumper": [
        "NN"
    ], 
    "Genesee": [
        "NNP"
    ], 
    "thin-soled": [
        "JJ"
    ], 
    "whence": [
        "WRB"
    ], 
    "Celine": [
        "NNP"
    ], 
    "Amherst": [
        "NNP"
    ], 
    "discrimination": [
        "NN"
    ], 
    "Broder": [
        "NNP"
    ], 
    "Anand": [
        "NNP"
    ], 
    "nods": [
        "VBZ", 
        "NNS"
    ], 
    "Toseland": [
        "NNP"
    ], 
    "Cumulative": [
        "JJ", 
        "NNP"
    ], 
    "warbling": [
        "VBG"
    ], 
    "Hosomi": [
        "NNP"
    ], 
    "engendered": [
        "VBN", 
        "VBD"
    ], 
    "rising": [
        "VBG", 
        "NN", 
        "JJ"
    ], 
    "anti-Nazis": [
        "NNPS"
    ], 
    "syringe": [
        "NN"
    ], 
    "syringa": [
        "NN"
    ], 
    "Postmaster": [
        "NNP"
    ], 
    "vine-shaded": [
        "JJ"
    ], 
    "whales": [
        "NNS"
    ], 
    "Norma": [
        "NNP"
    ], 
    "cultured": [
        "JJ", 
        "VBN"
    ], 
    "Clorets": [
        "NNP"
    ], 
    "half-darkness": [
        "NN"
    ], 
    "Norms": [
        "NNS"
    ], 
    "cultures": [
        "NNS"
    ], 
    "Veltri": [
        "NNP"
    ], 
    "Arcadipane": [
        "NNP"
    ], 
    "livestock-dealing": [
        "JJ"
    ], 
    "Tunis": [
        "NNP"
    ], 
    "Permit": [
        "VB"
    ], 
    "triple-C": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "triple-B": [
        "JJ"
    ], 
    "triple-A": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "Turben": [
        "NNP"
    ], 
    "travelogue-like": [
        "JJ"
    ], 
    "competitve": [
        "JJ"
    ], 
    "Boksen": [
        "NNP"
    ], 
    "extermination": [
        "NN"
    ], 
    "incise": [
        "VB"
    ], 
    "Subaru": [
        "NNP"
    ], 
    "de-inking": [
        "JJ"
    ], 
    "closely-held": [
        "JJ"
    ], 
    "Ambigua": [
        "NNP"
    ], 
    "triple-a": [
        "JJ"
    ], 
    "Ringler": [
        "NNP"
    ], 
    "Constructors": [
        "NNPS"
    ], 
    "autoimmune": [
        "JJ"
    ], 
    "theophylline": [
        "NN"
    ], 
    "Biederman": [
        "NNP"
    ], 
    "repatriation": [
        "NN"
    ], 
    "outgrip": [
        "VB"
    ], 
    "Knightsbridge": [
        "NNP"
    ], 
    "scotches": [
        "NNS"
    ], 
    "Fabrri": [
        "NNP"
    ], 
    "deserve": [
        "VBP", 
        "VB"
    ], 
    "Eternal": [
        "NNP"
    ], 
    "Dart": [
        "NNP"
    ], 
    "Dark": [
        "NNP", 
        "JJ"
    ], 
    "Darn": [
        "VB"
    ], 
    "seven-stories": [
        "JJ"
    ], 
    "Lesch-Nyhan": [
        "NNP"
    ], 
    "Panhandle": [
        "NNP", 
        "VB"
    ], 
    "line-drawing": [
        "JJ"
    ], 
    "Dare": [
        "VB"
    ], 
    "Pulitzer": [
        "NNP"
    ], 
    "deviation": [
        "NN"
    ], 
    "mummies": [
        "NNS"
    ], 
    "releasing": [
        "VBG"
    ], 
    "Jaguar": [
        "NNP", 
        "NN"
    ], 
    "T.R.": [
        "NNP"
    ], 
    "uncorked": [
        "VBD", 
        "VBN"
    ], 
    "finale": [
        "NN"
    ], 
    "Foundry": [
        "NNP"
    ], 
    "Dashitchev": [
        "NNP"
    ], 
    "fiberglas": [
        "NNS"
    ], 
    "bullets": [
        "NNS"
    ], 
    "Dragon": [
        "NNP"
    ], 
    "finals": [
        "NNS"
    ], 
    "feedlot": [
        "NN"
    ], 
    "land-locked": [
        "JJ"
    ], 
    "Satisfactory": [
        "JJ"
    ], 
    "Forty-third": [
        "JJ"
    ], 
    "anti-plaque": [
        "JJ"
    ], 
    "teleology": [
        "NN"
    ], 
    "Cuban": [
        "JJ", 
        "NNP"
    ], 
    "directors": [
        "NNS"
    ], 
    "Presbyterians": [
        "NNPS"
    ], 
    "treason": [
        "NN"
    ], 
    "directory": [
        "NN", 
        "JJ"
    ], 
    "numbing": [
        "JJ"
    ], 
    "sorption-desorption": [
        "NN"
    ], 
    "Maple": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "crumpled": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "tarry": [
        "VB"
    ], 
    "Lubowski": [
        "NNP"
    ], 
    "Riggs": [
        "NNP"
    ], 
    "Hendrik": [
        "NNP"
    ], 
    "coach": [
        "NN"
    ], 
    "generalize": [
        "VB", 
        "VBP"
    ], 
    "barons": [
        "NNS"
    ], 
    "Certificates": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "cementing": [
        "VBG"
    ], 
    "decisions": [
        "NNS"
    ], 
    "Subsequently": [
        "RB", 
        "NNP"
    ], 
    "barony": [
        "NN"
    ], 
    "glimpse": [
        "NN"
    ], 
    "apartment": [
        "NN"
    ], 
    "weightings": [
        "NNS"
    ], 
    "subsided": [
        "VBD", 
        "VBN"
    ], 
    "Kurlak": [
        "NNP"
    ], 
    "Frequently": [
        "RB", 
        "NNP"
    ], 
    "subsides": [
        "VBZ", 
        "NNS"
    ], 
    "infringement": [
        "NN"
    ], 
    "Angus": [
        "NNP"
    ], 
    "prognostication": [
        "NN"
    ], 
    "treating": [
        "VBG"
    ], 
    "Silber": [
        "NNP"
    ], 
    "Steptoe": [
        "NNP"
    ], 
    "RUSSIANS": [
        "NNS"
    ], 
    "Dickey": [
        "NNP"
    ], 
    "nahce": [
        "JJ"
    ], 
    "Ress": [
        "NNP"
    ], 
    "clinched": [
        "VBD"
    ], 
    "Rest": [
        "VB", 
        "NNP"
    ], 
    "occurs": [
        "VBZ"
    ], 
    "singularly": [
        "RB"
    ], 
    "Stitched": [
        "VBN"
    ], 
    "Dickel": [
        "NNP"
    ], 
    "threshing": [
        "NN"
    ], 
    "renouncing": [
        "VBG"
    ], 
    "clincher": [
        "NN"
    ], 
    "clinches": [
        "NNS"
    ], 
    "Milbauer": [
        "NNP"
    ], 
    "flick": [
        "NN"
    ], 
    "employing": [
        "VBG"
    ], 
    "JURY": [
        "NN"
    ], 
    "uh-huh": [
        "UH"
    ], 
    "Willow": [
        "NNP"
    ], 
    "Ease": [
        "VB"
    ], 
    "Hennefeld": [
        "NNP"
    ], 
    "Kasten": [
        "NNP"
    ], 
    "Ilka": [
        "NNP"
    ], 
    "Kaster": [
        "NNP"
    ], 
    "granular-type": [
        "JJ"
    ], 
    "Easy": [
        "NNP", 
        "JJ", 
        "RB"
    ], 
    "Flameco": [
        "NNP"
    ], 
    "East": [
        "NNP", 
        "NNPS", 
        "JJ", 
        "NN", 
        "RB", 
        "NNS"
    ], 
    "distributorship": [
        "NN"
    ], 
    "Ionizing": [
        "VBG"
    ], 
    "sue": [
        "VB", 
        "VBP"
    ], 
    "sub": [
        "NN", 
        "FW"
    ], 
    "sun": [
        "NN", 
        "VB"
    ], 
    "sum": [
        "NN", 
        "VB"
    ], 
    "Naturals": [
        "NNPS", 
        "NNP"
    ], 
    "Disposti": [
        "NNP"
    ], 
    "money-winner": [
        "NN"
    ], 
    "sur": [
        "FW"
    ], 
    "sup": [
        "VB"
    ], 
    "skippering": [
        "VBG"
    ], 
    "Straights": [
        "NNS"
    ], 
    "low-cal": [
        "JJ"
    ], 
    "Kodansha": [
        "NNP"
    ], 
    "Barba": [
        "NNP"
    ], 
    "toes": [
        "NNS"
    ], 
    "AIDS-research": [
        "JJ"
    ], 
    "autumn-touched": [
        "JJ"
    ], 
    "Fonstein": [
        "NNP"
    ], 
    "Chardonnay-sipping": [
        "JJ"
    ], 
    "Ginza": [
        "NN", 
        "NNP"
    ], 
    "Gloves": [
        "NNP"
    ], 
    "Glover": [
        "NNP"
    ], 
    "equations": [
        "NNS"
    ], 
    "WAGE": [
        "NN"
    ], 
    "bacteria-contaminated": [
        "JJ"
    ], 
    "underhanded": [
        "JJ"
    ], 
    "high-school": [
        "NN", 
        "JJ"
    ], 
    "dues": [
        "NNS"
    ], 
    "Mathewson": [
        "NNP"
    ], 
    "turnabout": [
        "NN"
    ], 
    "Biondi-Santi": [
        "NNP"
    ], 
    "stiffness": [
        "NN"
    ], 
    "better-remembered": [
        "JJ"
    ], 
    "student-led": [
        "JJ"
    ], 
    "ex-marine": [
        "NN"
    ], 
    "tramping": [
        "VBG"
    ], 
    "camcorder": [
        "NN"
    ], 
    "poignantly": [
        "RB"
    ], 
    "arms-control": [
        "NN", 
        "JJ"
    ], 
    "fee-per-case": [
        "JJ"
    ], 
    "solitude": [
        "NN"
    ], 
    "airlifting": [
        "VBG"
    ], 
    "Providence": [
        "NNP", 
        "NN"
    ], 
    "Louisville": [
        "NNP"
    ], 
    "enlivened": [
        "VBN"
    ], 
    "herring": [
        "NN"
    ], 
    "loping": [
        "VBG"
    ], 
    "Intermarco": [
        "NNP"
    ], 
    "rustic": [
        "JJ"
    ], 
    "vote-diluting": [
        "JJ"
    ], 
    "radar-type": [
        "JJ"
    ], 
    "Richeson": [
        "NNP"
    ], 
    "discipleship": [
        "NN"
    ], 
    "Harlin": [
        "NNP"
    ], 
    "horses": [
        "NNS"
    ], 
    "Theodosian": [
        "JJ"
    ], 
    "immersion": [
        "NN"
    ], 
    "bank-credit": [
        "NN"
    ], 
    "sorcery": [
        "NN"
    ], 
    "antibiotics": [
        "NNS"
    ], 
    "aerialists": [
        "NNS"
    ], 
    "hissed": [
        "VBD"
    ], 
    "Trupins": [
        "NNPS"
    ], 
    "five-member": [
        "JJ"
    ], 
    "Laplace": [
        "NNP"
    ], 
    "Alberding": [
        "NNP"
    ], 
    "Wheeland": [
        "NNP"
    ], 
    "Libyan": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "Showbiz": [
        "NNP"
    ], 
    "Captures": [
        "NNP"
    ], 
    "Gecker": [
        "NNP"
    ], 
    "Cozying": [
        "VBG"
    ], 
    "ineffectual": [
        "JJ"
    ], 
    "caveat": [
        "NN"
    ], 
    "Apropos": [
        "RB"
    ], 
    "absently": [
        "RB"
    ], 
    "Indefinite": [
        "JJ"
    ], 
    "Captured": [
        "VBN"
    ], 
    "technical-services": [
        "NNS"
    ], 
    "Willenson": [
        "NNP"
    ], 
    "searchlight": [
        "NN"
    ], 
    "duets": [
        "NNS"
    ], 
    "Duffey": [
        "NNP"
    ], 
    "asset-rich": [
        "JJ"
    ], 
    "Interco": [
        "NNP"
    ], 
    "metamorphosis": [
        "NN"
    ], 
    "Thompson": [
        "NNP"
    ], 
    "regulation\\/deregulation": [
        "NN"
    ], 
    "Democratique": [
        "NNP"
    ], 
    "third-generation": [
        "JJ"
    ], 
    "ostentatiously": [
        "RB"
    ], 
    "terrestrial": [
        "JJ"
    ], 
    "grey-haired": [
        "JJ"
    ], 
    "Cashin": [
        "NNP"
    ], 
    "liveried": [
        "JJ"
    ], 
    "Cannon": [
        "NNP"
    ], 
    "irrigate": [
        "VB"
    ], 
    "untied": [
        "VBD"
    ], 
    "occasionally": [
        "RB"
    ], 
    "Boseki": [
        "NNP"
    ], 
    "Iodination": [
        "NN"
    ], 
    "antebellum": [
        "JJ"
    ], 
    "Lobo": [
        "NNP"
    ], 
    "biophysics": [
        "NNS"
    ], 
    "cadmium": [
        "NN"
    ], 
    "adventure": [
        "NN", 
        "VB"
    ], 
    "concentrating": [
        "VBG"
    ], 
    "Ceremonial": [
        "NNP"
    ], 
    "PRODUCT": [
        "NN"
    ], 
    "Belgrade": [
        "NNP"
    ], 
    "Single-A-3": [
        "JJ"
    ], 
    "Single-A-2": [
        "JJ"
    ], 
    "meticulous": [
        "JJ"
    ], 
    "stock-optioned": [
        "JJ"
    ], 
    "untenable": [
        "JJ"
    ], 
    "Armen": [
        "NNP"
    ], 
    "fish-export": [
        "JJ"
    ], 
    "Armed": [
        "NNP", 
        "VBN", 
        "JJ"
    ], 
    "PPI": [
        "NNP"
    ], 
    "Yenakiyevo": [
        "NNP"
    ], 
    "SAINT": [
        "NNP"
    ], 
    "Bottom": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Carr-Lowrey": [
        "NNP"
    ], 
    "Alsop": [
        "NNP"
    ], 
    "Tessie": [
        "NNP"
    ], 
    "grille-route": [
        "NN"
    ], 
    "Same": [
        "JJ"
    ], 
    "Ravitz": [
        "NNP"
    ], 
    "Lorrain": [
        "NNP"
    ], 
    "Alson": [
        "NNP"
    ], 
    "Arab-sponsored": [
        "JJ"
    ], 
    "Relational": [
        "NNP"
    ], 
    "Cigarette": [
        "NN", 
        "NNP"
    ], 
    "Roach": [
        "NNP"
    ], 
    "unitary": [
        "JJ"
    ], 
    "Daolet": [
        "NNP"
    ], 
    "transfers": [
        "NNS", 
        "VBZ"
    ], 
    "soccer": [
        "NN"
    ], 
    "somebody": [
        "NN"
    ], 
    "generously": [
        "RB"
    ], 
    "Err": [
        "VB"
    ], 
    "Trimmer": [
        "NNP"
    ], 
    "countercharged": [
        "VBD"
    ], 
    "Era": [
        "NNP", 
        "NN"
    ], 
    "Haack": [
        "NNP"
    ], 
    "countercharges": [
        "NNS"
    ], 
    "U.S.-grown": [
        "JJ"
    ], 
    "instructions": [
        "NNS"
    ], 
    "intolerably": [
        "RB"
    ], 
    "Longue": [
        "NNP"
    ], 
    "Hands-on": [
        "JJ"
    ], 
    "Danes": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "sequester": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "accommodates": [
        "VBZ"
    ], 
    "permanant": [
        "JJ"
    ], 
    "immunoelectrophoresis": [
        "NN"
    ], 
    "Western-owned": [
        "JJ"
    ], 
    "Ready": [
        "JJ", 
        "NNP"
    ], 
    "accommodated": [
        "VBN"
    ], 
    "transportable": [
        "JJ"
    ], 
    "intolerable": [
        "JJ"
    ], 
    "erratic": [
        "JJ"
    ], 
    "intactible": [
        "JJ"
    ], 
    "Bede": [
        "NNP"
    ], 
    "Fabric": [
        "NN", 
        "NNP"
    ], 
    "Kitada": [
        "NNP"
    ], 
    "oppressed": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Butcher": [
        "NNP"
    ], 
    "loopy": [
        "JJ"
    ], 
    "Simat": [
        "NNP"
    ], 
    "mainframes": [
        "NNS"
    ], 
    "loops": [
        "NNS", 
        "VBZ"
    ], 
    "atonal": [
        "JJ"
    ], 
    "oppresses": [
        "VBZ"
    ], 
    "kotowaza": [
        "FW"
    ], 
    "croaking": [
        "NN"
    ], 
    "Abitibi-Price": [
        "NNP"
    ], 
    "firsts": [
        "NNS"
    ], 
    "telltale": [
        "JJ", 
        "NN"
    ], 
    "Vikes": [
        "NNPS"
    ], 
    "anti-depressant": [
        "JJ", 
        "NN"
    ], 
    "disquiet": [
        "NN"
    ], 
    "hilt": [
        "NN"
    ], 
    "hydraulic": [
        "JJ"
    ], 
    "unambiguity": [
        "NN"
    ], 
    "candour": [
        "NN"
    ], 
    "hill": [
        "NN"
    ], 
    "constant-temperature": [
        "NN"
    ], 
    "compounding": [
        "VBG", 
        "NN"
    ], 
    "Samoilov": [
        "NNP"
    ], 
    "Bryce": [
        "NNP"
    ], 
    "roofs": [
        "NNS"
    ], 
    "side-effects": [
        "NNS"
    ], 
    "management-incentive": [
        "JJ"
    ], 
    "yearthat": [
        "NN"
    ], 
    "Opinion": [
        "NNP", 
        "NN"
    ], 
    "shut-off": [
        "JJ"
    ], 
    "Germans.": [
        "NNS"
    ], 
    "bourgeoisie": [
        "NNS", 
        "FW"
    ], 
    "Tempter": [
        "NNP"
    ], 
    "less-than-amicable": [
        "JJ"
    ], 
    "prejudice": [
        "NN", 
        "VB"
    ], 
    "Guardian": [
        "NNP"
    ], 
    "Bland": [
        "JJ"
    ], 
    "Blanc": [
        "NNP"
    ], 
    "Vietor": [
        "NNP"
    ], 
    "Ponder": [
        "VBP"
    ], 
    "shrewish": [
        "JJ"
    ], 
    "seeming": [
        "JJ", 
        "VBG"
    ], 
    "vellum": [
        "JJ"
    ], 
    "Connelly": [
        "NNP"
    ], 
    "Indian": [
        "NNP", 
        "JJ"
    ], 
    "Axel": [
        "NNP"
    ], 
    "distributive": [
        "JJ"
    ], 
    "earthworms": [
        "NNS"
    ], 
    "story": [
        "NN"
    ], 
    "scathing": [
        "JJ"
    ], 
    "Dictionary": [
        "NNP", 
        "NN"
    ], 
    "talismanic": [
        "JJ"
    ], 
    "Durmoy": [
        "NNP"
    ], 
    "leading": [
        "VBG", 
        "JJ|VBG", 
        "VBG|JJ", 
        "JJ", 
        "NN"
    ], 
    "Castro-Medellin": [
        "NNP"
    ], 
    "polyether-type": [
        "JJ"
    ], 
    "Voicetek": [
        "NNP"
    ], 
    "sub-freezing": [
        "JJ"
    ], 
    "market-ready": [
        "JJ"
    ], 
    "often-criticized": [
        "JJ"
    ], 
    "VIACOM": [
        "NNP"
    ], 
    "Danske": [
        "NNP"
    ], 
    "second-class": [
        "JJ"
    ], 
    "Hawker": [
        "NNP"
    ], 
    "Hawkes": [
        "NNP"
    ], 
    "store": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "temptations": [
        "NNS"
    ], 
    "Bevel": [
        "VB"
    ], 
    "saint": [
        "NN"
    ], 
    "Dangerous": [
        "JJ", 
        "NNP"
    ], 
    "retinal": [
        "JJ"
    ], 
    "off-putting": [
        "JJ"
    ], 
    "alumina": [
        "NN"
    ], 
    "Bozic": [
        "NNP"
    ], 
    "five-course": [
        "JJ"
    ], 
    "shrunken": [
        "JJ", 
        "VBN"
    ], 
    "king": [
        "NN"
    ], 
    "kind": [
        "NN", 
        "JJ", 
        "RB"
    ], 
    "Munich-based": [
        "JJ"
    ], 
    "weatherproof": [
        "JJ"
    ], 
    "Semmelman": [
        "NNP"
    ], 
    "Chickasaws": [
        "NNPS"
    ], 
    "Transol": [
        "NNP"
    ], 
    "cut-price": [
        "JJ"
    ], 
    "multibillion": [
        "JJ"
    ], 
    "Gladiator": [
        "NNP"
    ], 
    "Questioned": [
        "VBN"
    ], 
    "tongues": [
        "NNS"
    ], 
    "Ballet": [
        "NNP", 
        "NN"
    ], 
    "skyscrapers": [
        "NNS"
    ], 
    "storytelling": [
        "NN"
    ], 
    "Giampiero": [
        "NNP"
    ], 
    "shrewd": [
        "JJ"
    ], 
    "Marmalstein": [
        "NNP"
    ], 
    "tongued": [
        "VBD", 
        "JJ"
    ], 
    "Westport": [
        "NNP"
    ], 
    "Telegraphie": [
        "NNP"
    ], 
    "Cid": [
        "NNP"
    ], 
    "Caccappolo": [
        "NNP"
    ], 
    "smallpox": [
        "NN"
    ], 
    "Frabotta": [
        "NNP"
    ], 
    "Moreland": [
        "NNP"
    ], 
    "DJS-Inverness": [
        "NNP"
    ], 
    "single-sex": [
        "JJ"
    ], 
    "conforming": [
        "VBG"
    ], 
    "entirety": [
        "NN"
    ], 
    "humanize": [
        "VB"
    ], 
    "establshed": [
        "VBN"
    ], 
    "genetically": [
        "RB"
    ], 
    "Perna": [
        "NNP"
    ], 
    "Levenson": [
        "NNP"
    ], 
    "gild": [
        "VB"
    ], 
    "inconvenience": [
        "NN"
    ], 
    "Equal": [
        "NNP", 
        "JJ"
    ], 
    "architects": [
        "NNS"
    ], 
    "rarefied": [
        "VBN"
    ], 
    "Pedott": [
        "NNP"
    ], 
    "probabilistic": [
        "JJ"
    ], 
    "farmhouses": [
        "NNS"
    ], 
    "dealers": [
        "NNS"
    ], 
    "Gaither": [
        "NNP"
    ], 
    "forerunner": [
        "NN"
    ], 
    "acclaims": [
        "VBZ"
    ], 
    "lying": [
        "VBG", 
        "NN"
    ], 
    "Serenity": [
        "NN"
    ], 
    "vaunted": [
        "JJ", 
        "VBN"
    ], 
    "safeguarding": [
        "VBG"
    ], 
    "barter": [
        "NN"
    ], 
    "grandmas": [
        "NNS"
    ], 
    "Dolores": [
        "NNP", 
        "NNS"
    ], 
    "Suits": [
        "NNS", 
        "NNPS"
    ], 
    "inflexible": [
        "JJ"
    ], 
    "rate-IRA": [
        "NN"
    ], 
    "Suite": [
        "NN", 
        "NNP"
    ], 
    "Lowenthal": [
        "NNP"
    ], 
    "piezoelectric": [
        "JJ"
    ], 
    "Affordable": [
        "NNP", 
        "JJ"
    ], 
    "Lacking": [
        "VBG"
    ], 
    "suburbanized": [
        "VBN"
    ], 
    "Epsilon": [
        "NNP"
    ], 
    "China-investment": [
        "JJ"
    ], 
    "airtime": [
        "NN"
    ], 
    "yet-to-be-formed": [
        "JJ"
    ], 
    "Stratas": [
        "NNP"
    ], 
    "incapacitating": [
        "JJ"
    ], 
    "founding": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "bradykinin": [
        "NN"
    ], 
    "invoke": [
        "VB"
    ], 
    "ungrateful": [
        "JJ"
    ], 
    "Batch": [
        "NN"
    ], 
    "mortgage-backed": [
        "JJ"
    ], 
    "H.J.": [
        "NNP"
    ], 
    "knighted": [
        "VBN"
    ], 
    "reprint": [
        "VB"
    ], 
    "Uno-Ven": [
        "NNP"
    ], 
    "Evren": [
        "NNP"
    ], 
    "syringes": [
        "NNS"
    ], 
    "engraver": [
        "NN"
    ], 
    "Knorr": [
        "NNP"
    ], 
    "tree-huggers": [
        "NNS"
    ], 
    "prescribing": [
        "VBG"
    ], 
    "catharsis": [
        "NN"
    ], 
    "laser-beam-printer": [
        "NN"
    ], 
    "McCoy": [
        "NNP"
    ], 
    "revenues": [
        "NNS"
    ], 
    "engraved": [
        "VBN", 
        "JJ"
    ], 
    "wrote": [
        "VBD"
    ], 
    "Whitehead": [
        "NNP"
    ], 
    "excellences": [
        "NNS"
    ], 
    "charge-excess": [
        "NN"
    ], 
    "rent-subsidized": [
        "JJ"
    ], 
    "procrastinated": [
        "VBD"
    ], 
    "visualize": [
        "VB"
    ], 
    "axially": [
        "RB"
    ], 
    "tummy": [
        "NN"
    ], 
    "worst-marked": [
        "JJ"
    ], 
    "surmounted": [
        "VBD", 
        "VBN"
    ], 
    "ups": [
        "NNS"
    ], 
    "Mmmm": [
        "UH"
    ], 
    "Quell": [
        "NNP"
    ], 
    "Fogelson": [
        "NNP"
    ], 
    "Hsu": [
        "NNP"
    ], 
    "Costanza": [
        "NNP"
    ], 
    "obscenities": [
        "NNS"
    ], 
    "frugality": [
        "NN"
    ], 
    "solo": [
        "NN", 
        "JJ", 
        "RB|JJ", 
        "VB"
    ], 
    "misstep": [
        "NN"
    ], 
    "ushered": [
        "VBD", 
        "VBN"
    ], 
    "silicone": [
        "NN"
    ], 
    "Gasoline": [
        "NN"
    ], 
    "franchises": [
        "NNS", 
        "VBZ"
    ], 
    "attention": [
        "NN"
    ], 
    "Manual": [
        "JJ", 
        "NNP"
    ], 
    "confiscated": [
        "VBN", 
        "VBD"
    ], 
    "bullhide": [
        "NN"
    ], 
    "Workplace": [
        "NN", 
        "NNP"
    ], 
    "fatality": [
        "NN"
    ], 
    "franchisee": [
        "NN"
    ], 
    "franchised": [
        "VBN", 
        "JJ"
    ], 
    "Steinmetz": [
        "NNP"
    ], 
    "oversee": [
        "VB"
    ], 
    "shorthanded": [
        "JJ"
    ], 
    "Aspercreme": [
        "NNP"
    ], 
    "Apollonian": [
        "JJ"
    ], 
    "cancer-susceptible": [
        "JJ"
    ], 
    "much-respected": [
        "JJ"
    ], 
    "nettled": [
        "VBD", 
        "VBN"
    ], 
    "distress": [
        "NN"
    ], 
    "Ex-Cub": [
        "JJ"
    ], 
    "drug-interdiction": [
        "NN", 
        "JJ"
    ], 
    "export-control": [
        "JJ", 
        "NN"
    ], 
    "Snowmass": [
        "NNP"
    ], 
    "Skala": [
        "NNP"
    ], 
    "Metcalf": [
        "NNP"
    ], 
    "Lovie": [
        "UH"
    ], 
    "Ibrahim": [
        "NNP"
    ], 
    "Yoorick": [
        "NNP"
    ], 
    "Cement": [
        "NNP"
    ], 
    "Caitlin": [
        "NNP"
    ], 
    "Fueled": [
        "VBN"
    ], 
    "Edelmann": [
        "NNP"
    ], 
    "Tightened": [
        "JJ"
    ], 
    "Pediatricians": [
        "NNS"
    ], 
    "cone-sphere": [
        "JJ"
    ], 
    "Coeditors": [
        "NNS"
    ], 
    "waste-water": [
        "NN"
    ], 
    "isolationistic": [
        "JJ"
    ], 
    "Sunay": [
        "NNP"
    ], 
    "institutionalized": [
        "VBN", 
        "JJ"
    ], 
    "commodity-options": [
        "NNS"
    ], 
    "flight": [
        "NN"
    ], 
    "Marcile": [
        "NNP"
    ], 
    "proxy-solicitation": [
        "JJ"
    ], 
    "unswagged": [
        "JJ"
    ], 
    "imprudence": [
        "NN"
    ], 
    "precision": [
        "NN", 
        "JJ"
    ], 
    "Corinth": [
        "NNP"
    ], 
    "rescissions": [
        "NNS"
    ], 
    "notables": [
        "NNS"
    ], 
    "instructor": [
        "NN"
    ], 
    "up-tight": [
        "JJ"
    ], 
    "Guccione": [
        "NNP"
    ], 
    "GoldCard": [
        "NNP"
    ], 
    "workmen": [
        "NNS"
    ], 
    "guarding": [
        "VBG"
    ], 
    "indefinitely": [
        "RB"
    ], 
    "Leponex": [
        "NNP"
    ], 
    "Fifty-fifth": [
        "NNP"
    ], 
    "Fabrics": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "kick": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Aikin": [
        "NNP"
    ], 
    "servitude": [
        "NN"
    ], 
    "Forwarding": [
        "NNP"
    ], 
    "unaccompanied": [
        "JJ"
    ], 
    "blue-blood": [
        "JJ"
    ], 
    "Lurgi": [
        "NNP"
    ], 
    "launderer": [
        "NN"
    ], 
    "important-looking": [
        "JJ"
    ], 
    "antithesis": [
        "NN"
    ], 
    "Centrality": [
        "NN"
    ], 
    "Vernitron": [
        "NNP", 
        "NN"
    ], 
    "laundered": [
        "VBN", 
        "VBD"
    ], 
    "Advancers": [
        "NNS"
    ], 
    "Chicago-based": [
        "JJ"
    ], 
    "shirt": [
        "NN"
    ], 
    "sachems": [
        "NNS"
    ], 
    "denunciation": [
        "NN"
    ], 
    "badgering": [
        "VBG"
    ], 
    "HUNGARY": [
        "NNP"
    ], 
    "shirk": [
        "VB"
    ], 
    "yucca": [
        "NN"
    ], 
    "daughters": [
        "NNS"
    ], 
    "higher": [
        "JJR", 
        "RB", 
        "RBR"
    ], 
    "sell": [
        "VB", 
        "VBP", 
        "JJ", 
        "NN"
    ], 
    "GOOD": [
        "JJ"
    ], 
    "Escorts": [
        "NNS"
    ], 
    "restraint": [
        "NN"
    ], 
    "Ranch": [
        "NNP", 
        "NN"
    ], 
    "demarcated": [
        "VBN"
    ], 
    "restrains": [
        "VBZ"
    ], 
    "Crossing": [
        "VBG"
    ], 
    "Triangle": [
        "NNP", 
        "NN"
    ], 
    "Solana": [
        "NNP"
    ], 
    "Fitzgibbon": [
        "NNP"
    ], 
    "Polypropylene": [
        "NN"
    ], 
    "Qureshey": [
        "NNP"
    ], 
    "try": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "magnified": [
        "VBN", 
        "VBD"
    ], 
    "destabilizing": [
        "VBG", 
        "JJ"
    ], 
    "Norsemen": [
        "NNPS"
    ], 
    "machinery": [
        "NN"
    ], 
    "extorted": [
        "VBD"
    ], 
    "magnifies": [
        "VBZ"
    ], 
    "self": [
        "NN", 
        "PRP"
    ], 
    "Liberalism": [
        "NN", 
        "NNP"
    ], 
    "acquisition-minded": [
        "JJ"
    ], 
    "Fitts": [
        "NNP"
    ], 
    "prorata": [
        "FW"
    ], 
    "large-area": [
        "JJ"
    ], 
    "prorate": [
        "VB"
    ], 
    "Anti-nuclear": [
        "JJ"
    ], 
    "pop-music": [
        "NN"
    ], 
    "Dragoumis": [
        "NNP"
    ], 
    "Wonderful": [
        "JJ"
    ], 
    "humaine": [
        "NN"
    ], 
    "Playground": [
        "NNP"
    ], 
    "comprehensively": [
        "RB"
    ], 
    "blank-faced": [
        "JJ"
    ], 
    "Ovonic": [
        "NNP"
    ], 
    "Groff": [
        "NNP"
    ], 
    "summaries": [
        "NNS"
    ], 
    "meanest": [
        "JJS"
    ], 
    "Jackpot": [
        "NNP"
    ], 
    "Ironically": [
        "RB", 
        "NNP"
    ], 
    "Marulanda": [
        "NNP"
    ], 
    "Nokia": [
        "NNP"
    ], 
    "comedy\\": [
        "JJ"
    ], 
    "Pompano": [
        "NNP"
    ], 
    "Shores": [
        "NNP"
    ], 
    "Chadli": [
        "NNP"
    ], 
    "difficile": [
        "FW"
    ], 
    "jostle": [
        "VBP", 
        "VB"
    ], 
    "Ammann": [
        "NNP"
    ], 
    "Sain": [
        "NNP"
    ], 
    "Injection": [
        "NNP", 
        "NN"
    ], 
    "vetoing": [
        "VBG"
    ], 
    "Hilder": [
        "NNP"
    ], 
    "Naumberg": [
        "NNP"
    ], 
    "Artois": [
        "NNP"
    ], 
    "Enzor": [
        "NNP"
    ], 
    "Sail": [
        "NNP"
    ], 
    "Thou": [
        "PRP"
    ], 
    "advocate": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "bemoan": [
        "VB"
    ], 
    "Kurtanjek": [
        "NNP"
    ], 
    "Thor": [
        "NNP"
    ], 
    "Thom": [
        "NNP"
    ], 
    "re-entry": [
        "NN"
    ], 
    "Nakhamkin": [
        "NNP"
    ], 
    "Foliage": [
        "NN", 
        "NNP"
    ], 
    "macromolecular": [
        "JJ"
    ], 
    "Revising": [
        "VBG"
    ], 
    "Uniroyal\\": [
        "NNP"
    ], 
    "skeptical": [
        "JJ"
    ], 
    "cogeneration": [
        "NN"
    ], 
    "confront": [
        "VB", 
        "VBP"
    ], 
    "phosphors": [
        "NNS"
    ], 
    "separately": [
        "RB"
    ], 
    "uproar": [
        "NN"
    ], 
    "deleterious": [
        "JJ"
    ], 
    "Cady": [
        "NNP"
    ], 
    "Bishopsgate": [
        "NNP"
    ], 
    "DALKON": [
        "NNP"
    ], 
    "campagna": [
        "NN"
    ], 
    "new-model": [
        "JJ", 
        "NN"
    ], 
    "policy-makers": [
        "NNS"
    ], 
    "disinclined": [
        "VBN", 
        "JJ"
    ], 
    "Matsunaga": [
        "NNP"
    ], 
    "chaulmoogra": [
        "NN"
    ], 
    "Roustabouts": [
        "NNPS"
    ], 
    "hurriedly": [
        "RB"
    ], 
    "Prosecutor": [
        "NNP"
    ], 
    "Sony\\/Columbia": [
        "NNP"
    ], 
    "LATE": [
        "JJ", 
        "RB", 
        "NNP"
    ], 
    "constitutionality": [
        "NN"
    ], 
    "Klimt": [
        "NNP"
    ], 
    "Gewirtz": [
        "NNP"
    ], 
    "Parvenu": [
        "NNP"
    ], 
    "Sunday-newspaper": [
        "NNP"
    ], 
    "Nishi": [
        "NNP"
    ], 
    "stock-manipulation": [
        "NN", 
        "JJ"
    ], 
    "jumped-up": [
        "JJ"
    ], 
    "Uspensky": [
        "NNP"
    ], 
    "perpendicular": [
        "JJ"
    ], 
    "I-75": [
        "NN"
    ], 
    "refused": [
        "VBD", 
        "VBN"
    ], 
    "Bikers": [
        "NNS"
    ], 
    "consolation": [
        "NN"
    ], 
    "refuses": [
        "VBZ"
    ], 
    "Peiping": [
        "NNP"
    ], 
    "projector": [
        "NN"
    ], 
    "pipeline": [
        "NN"
    ], 
    "asserting": [
        "VBG"
    ], 
    "bristling": [
        "VBG", 
        "JJ"
    ], 
    "raucous": [
        "JJ"
    ], 
    "violins": [
        "NNS"
    ], 
    "careerism": [
        "NN"
    ], 
    "plaza": [
        "NN"
    ], 
    "virus": [
        "NN"
    ], 
    "lifeless": [
        "JJ"
    ], 
    "Bolshevism": [
        "NNP"
    ], 
    "Voyagers.": [
        "NNPS"
    ], 
    "Keizer": [
        "NNP"
    ], 
    "Defrost": [
        "VB"
    ], 
    "youthful": [
        "JJ"
    ], 
    "calloused": [
        "JJ"
    ], 
    "CONFIRMED": [
        "VBD"
    ], 
    "Andersen": [
        "NNP"
    ], 
    "re-engineered": [
        "VBD", 
        "VBN"
    ], 
    "Moffett": [
        "NNP"
    ], 
    "tappets": [
        "NNS"
    ], 
    "Arbogast": [
        "NNP"
    ], 
    "BioScience": [
        "NNP"
    ], 
    "Minster": [
        "NNP"
    ], 
    "artifice": [
        "NN"
    ], 
    "flagellated": [
        "VBN"
    ], 
    "strumming": [
        "VBG"
    ], 
    "stench": [
        "NN"
    ], 
    "impressed": [
        "VBN", 
        "VBN|JJ", 
        "JJ", 
        "VBD"
    ], 
    "acquiesce": [
        "VB"
    ], 
    "lone": [
        "JJ"
    ], 
    "handles": [
        "VBZ", 
        "NNS"
    ], 
    "long": [
        "JJ", 
        "VBP", 
        "RB"
    ], 
    "Microcom": [
        "NNP", 
        "NN"
    ], 
    "Torrid-Breeze": [
        "NNP"
    ], 
    "impresses": [
        "VBZ"
    ], 
    "impresser": [
        "NN"
    ], 
    "etch": [
        "VB"
    ], 
    "EAST": [
        "NNP", 
        "NNS", 
        "JJ"
    ], 
    "Appaloosas": [
        "NNPS"
    ], 
    "authored": [
        "VBN"
    ], 
    "audacious": [
        "JJ"
    ], 
    "monomers": [
        "NNS"
    ], 
    "Barth": [
        "NNP"
    ], 
    "anesthetics": [
        "NNS"
    ], 
    "kitchenware": [
        "NN"
    ], 
    "Elizario": [
        "NNP"
    ], 
    "anti-clericalism": [
        "JJ"
    ], 
    "fulfilling": [
        "VBG"
    ], 
    "Wesleyan": [
        "NNP"
    ], 
    "sanguineum": [
        "NN"
    ], 
    "Barbera": [
        "NNP"
    ], 
    "bankrolling": [
        "VBG"
    ], 
    "price-sensitive": [
        "JJ"
    ], 
    "co-managing": [
        "JJ", 
        "VBG"
    ], 
    "fluctuations": [
        "NNS"
    ], 
    "etc.": [
        "FW", 
        "NN"
    ], 
    "Bankhaus": [
        "NNP"
    ], 
    "fiscally": [
        "RB"
    ], 
    "debt-for-environment": [
        "NN"
    ], 
    "Saxony": [
        "NNP"
    ], 
    "Gerold": [
        "NNP"
    ], 
    "water-cooled": [
        "JJ"
    ], 
    "Nazia": [
        "NNP"
    ], 
    "coordinator": [
        "NN"
    ], 
    "Attack": [
        "NNP", 
        "NN"
    ], 
    "reservoirs": [
        "NNS"
    ], 
    "whitewashing": [
        "VBG"
    ], 
    "rally": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "rained": [
        "VBD", 
        "VBN"
    ], 
    "Nazis": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Cunard": [
        "NNP"
    ], 
    "leadership...": [
        ":"
    ], 
    "rainbow": [
        "NN"
    ], 
    "toeholds": [
        "NNS"
    ], 
    "camcorders": [
        "NNS"
    ], 
    "Jorge": [
        "NNP"
    ], 
    "Ignorance": [
        "NN"
    ], 
    "saffron": [
        "NN"
    ], 
    "Price-boosting": [
        "JJ"
    ], 
    "one-on-one": [
        "JJ", 
        "RB"
    ], 
    "Personally": [
        "RB"
    ], 
    "bandstand": [
        "NN"
    ], 
    "Prefecture": [
        "NNP"
    ], 
    "Colts": [
        "NNP"
    ], 
    "Coupons": [
        "NNS"
    ], 
    "nice": [
        "JJ"
    ], 
    "Audit": [
        "NNP"
    ], 
    "Hackmann": [
        "NNP"
    ], 
    "private-placement": [
        "JJ", 
        "NN"
    ], 
    "smitten": [
        "VBN"
    ], 
    "self-discovery": [
        "NN"
    ], 
    "cityscapes": [
        "NNS"
    ], 
    "dragnet": [
        "NN"
    ], 
    "bonding": [
        "VBG", 
        "NN"
    ], 
    "ROK": [
        "NNP"
    ], 
    "allowing": [
        "VBG"
    ], 
    "Audio": [
        "NNP"
    ], 
    "Saupiquet": [
        "NNP"
    ], 
    "relaunch": [
        "VB"
    ], 
    "HHS": [
        "NNP"
    ], 
    "Asher": [
        "NNP"
    ], 
    "Curling": [
        "NNP"
    ], 
    "Edna": [
        "NNP"
    ], 
    "amusements": [
        "NNS"
    ], 
    "Turned": [
        "VBN"
    ], 
    "departments": [
        "NNS"
    ], 
    "Rubinstein": [
        "NNP"
    ], 
    "Afro-Asian": [
        "NNP"
    ], 
    "Boisvert": [
        "NNP"
    ], 
    "Kinney": [
        "NNP"
    ], 
    "safekeep": [
        "VB"
    ], 
    "Turner": [
        "NNP"
    ], 
    "buffalo": [
        "NN", 
        "NNS"
    ], 
    "Wheelan": [
        "NNP"
    ], 
    "Based": [
        "VBN", 
        "NNP"
    ], 
    "Basel": [
        "NNP"
    ], 
    "Oremland": [
        "NNP"
    ], 
    "Foret": [
        "NNP"
    ], 
    "Lattice": [
        "NNP"
    ], 
    "Braverman": [
        "NNP"
    ], 
    "discordant": [
        "JJ"
    ], 
    "uphold": [
        "VB", 
        "VBP"
    ], 
    "Shippings": [
        "NNS"
    ], 
    "inbreeding": [
        "VBG", 
        "NN"
    ], 
    "graybeards": [
        "NNS"
    ], 
    "Govett": [
        "NNP"
    ], 
    "Morphophonemic": [
        "JJ"
    ], 
    "Axxess": [
        "NNP"
    ], 
    "languages": [
        "NNS", 
        "VBZ"
    ], 
    "warehouseman": [
        "NN"
    ], 
    "repackage": [
        "VB"
    ], 
    "careened": [
        "VBD"
    ], 
    "blended": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "include": [
        "VBP", 
        "VBN", 
        "VB"
    ], 
    "Takahashi": [
        "NNP"
    ], 
    "Matagorda": [
        "NNP"
    ], 
    "face-lifting": [
        "NN"
    ], 
    "Killen": [
        "NNP"
    ], 
    "accommodations": [
        "NNS"
    ], 
    "currency-exchange": [
        "JJ"
    ], 
    "Topaz": [
        "NNP"
    ], 
    "Reaffirming": [
        "VBG"
    ], 
    "Oresme": [
        "NNP"
    ], 
    "skivvies": [
        "NNS"
    ], 
    "Chesterfield": [
        "NNP"
    ], 
    "Bruckmann": [
        "NNP"
    ], 
    "socio-political": [
        "JJ"
    ], 
    "disclaimed": [
        "VBD"
    ], 
    "leveled": [
        "VBD", 
        "VBN"
    ], 
    "Composer": [
        "NN"
    ], 
    "Taurida": [
        "NNP"
    ], 
    "Riverwalk": [
        "NNP"
    ], 
    "Dyazide": [
        "NNP"
    ], 
    "Telecommunications": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Euzhan": [
        "NNP"
    ], 
    "concluded": [
        "VBD", 
        "VBN"
    ], 
    "non-fiction": [
        "JJ", 
        "NN"
    ], 
    "Wames": [
        "NNP"
    ], 
    "Nocturne": [
        "NNP"
    ], 
    "Kerrey": [
        "NNP"
    ], 
    "wrestling": [
        "VBG", 
        "NN"
    ], 
    "malice": [
        "NN"
    ], 
    "electronic-transaction": [
        "JJ"
    ], 
    "aquifer": [
        "NN"
    ], 
    "counter-argument": [
        "NN"
    ], 
    "bedpans": [
        "NNS"
    ], 
    "reunion": [
        "NN"
    ], 
    "acid": [
        "NN", 
        "JJ"
    ], 
    "Cash-heavy": [
        "JJ"
    ], 
    "Shanyun": [
        "NNP"
    ], 
    "Baches": [
        "NNPS"
    ], 
    "bibliophiles": [
        "NNS"
    ], 
    "Governors": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "disentangle": [
        "VB"
    ], 
    "bearish": [
        "JJ"
    ], 
    "Coherent": [
        "NNP"
    ], 
    "occupation": [
        "NN"
    ], 
    "McElvaney": [
        "NNP"
    ], 
    "well-traveled": [
        "JJ"
    ], 
    "chose": [
        "VBD"
    ], 
    "Seton": [
        "NNP"
    ], 
    "kangaroo": [
        "NN"
    ], 
    "Grovers": [
        "NNP"
    ], 
    "wraps": [
        "VBZ", 
        "NNS"
    ], 
    "Apostles": [
        "NNPS"
    ], 
    "explore": [
        "VB", 
        "VBP"
    ], 
    "Yun": [
        "NNP"
    ], 
    "insubordinate": [
        "JJ"
    ], 
    "Belvieu": [
        "NNP"
    ], 
    "Checchi-Skinner": [
        "NNP"
    ], 
    "settling": [
        "VBG", 
        "NN"
    ], 
    "Goodis": [
        "NNP"
    ], 
    "Arvey": [
        "NNP"
    ], 
    "Selection": [
        "NN"
    ], 
    "blue-glazed": [
        "JJ"
    ], 
    "apparat": [
        "NN"
    ], 
    "Christmastime": [
        "NNP"
    ], 
    "operating-system": [
        "JJ", 
        "NN"
    ], 
    "suggests": [
        "VBZ"
    ], 
    "Cheshire": [
        "NNP"
    ], 
    "Palm": [
        "NNP", 
        "NN"
    ], 
    "Pall": [
        "NNP", 
        "NN"
    ], 
    "Palo": [
        "NNP"
    ], 
    "Phosphates": [
        "NNP"
    ], 
    "pre-academic": [
        "JJ"
    ], 
    "Pale": [
        "NNP", 
        "RB"
    ], 
    "pajama": [
        "NN"
    ], 
    "pro-Hearst": [
        "JJ"
    ], 
    "Staffers": [
        "NNS"
    ], 
    "saltier": [
        "JJR"
    ], 
    "Ships": [
        "NNS"
    ], 
    "hardy": [
        "JJ"
    ], 
    "Exit": [
        "NN"
    ], 
    "doubtfully": [
        "RB"
    ], 
    "Froissart": [
        "NNP"
    ], 
    "Wiseman": [
        "NNP"
    ], 
    "no-back": [
        "NN"
    ], 
    "from": [
        "IN", 
        "RB", 
        "RP"
    ], 
    "Neurex": [
        "NNP"
    ], 
    "frog": [
        "NN"
    ], 
    "procrastinate": [
        "VB"
    ], 
    "underscoring": [
        "VBG"
    ], 
    "DEMOCRATS": [
        "NNS"
    ], 
    "circuitous": [
        "JJ"
    ], 
    "rapid-fire": [
        "JJ"
    ], 
    "auxiliaries": [
        "NNS"
    ], 
    "removable": [
        "JJ"
    ], 
    "Gun": [
        "NNP", 
        "NN"
    ], 
    "Wheaton": [
        "NNP"
    ], 
    "Landfill": [
        "NN", 
        "NNP"
    ], 
    "Sequoia": [
        "NNP", 
        "NN"
    ], 
    "Kondratas": [
        "NNP"
    ], 
    "Mig": [
        "NN"
    ], 
    "Guy": [
        "NNP"
    ], 
    "Netsch": [
        "NNP"
    ], 
    "Affair": [
        "NNP", 
        "NN"
    ], 
    "Aghazadeh": [
        "NNP"
    ], 
    "fifth-best": [
        "JJ"
    ], 
    "accrues": [
        "VBZ"
    ], 
    "recessionary": [
        "JJ"
    ], 
    "Calvi": [
        "NNP"
    ], 
    "Comsat": [
        "NNP"
    ], 
    "hookups": [
        "NNS"
    ], 
    "accrued": [
        "VBN", 
        "JJ"
    ], 
    "Tartaglia": [
        "NNP"
    ], 
    "Edmund": [
        "NNP"
    ], 
    "Farnese": [
        "NNP"
    ], 
    "thirsty": [
        "JJ"
    ], 
    "nonverbal": [
        "JJ"
    ], 
    "re-set": [
        "VB"
    ], 
    "L&N": [
        "NNP"
    ], 
    "assumptions": [
        "NNS"
    ], 
    "Reorganizing": [
        "VBG"
    ], 
    "Australian": [
        "JJ", 
        "NNP"
    ], 
    "electronic-defense": [
        "NN"
    ], 
    "autobiography": [
        "NN"
    ], 
    "counting": [
        "VBG", 
        "NN"
    ], 
    "spinnability": [
        "NN"
    ], 
    "then-rampant": [
        "JJ"
    ], 
    "cliches": [
        "NNS"
    ], 
    "Toshiichi": [
        "NNP"
    ], 
    "sidewalks": [
        "NNS"
    ], 
    "stewardship": [
        "NN"
    ], 
    "Large-package": [
        "JJ"
    ], 
    "Garments": [
        "NNS"
    ], 
    "Concocts": [
        "VBZ"
    ], 
    "secular": [
        "JJ"
    ], 
    "cliched": [
        "JJ"
    ], 
    "Mambelli": [
        "NNP"
    ], 
    "ceasing": [
        "VBG"
    ], 
    "detests": [
        "VBZ"
    ], 
    "warehouse-management": [
        "NN"
    ], 
    "normalcy": [
        "NN"
    ], 
    "deltoid": [
        "NN"
    ], 
    "Pockets": [
        "NNS"
    ], 
    "Inability": [
        "NN"
    ], 
    "Ruwe": [
        "NNP"
    ], 
    "Puhl": [
        "NNP"
    ], 
    "somethin": [
        "NN"
    ], 
    "Outdoor": [
        "JJ", 
        "NNP"
    ], 
    "hum": [
        "NN", 
        "VB"
    ], 
    "budge": [
        "VB"
    ], 
    "Sonenberg": [
        "NNP"
    ], 
    "civics": [
        "NNS"
    ], 
    "villas": [
        "NNS"
    ], 
    "Kings": [
        "NNP", 
        "NNPS"
    ], 
    "Liriano": [
        "NNP"
    ], 
    "Sino-foreign": [
        "JJ"
    ], 
    "Craton": [
        "NNP"
    ], 
    "violator": [
        "NN"
    ], 
    "perishing": [
        "VBG"
    ], 
    "sanctioned": [
        "VBN"
    ], 
    "Interference": [
        "NNP"
    ], 
    "interpreted": [
        "VBN", 
        "VBD"
    ], 
    "strove": [
        "VBD"
    ], 
    "Tortoriello": [
        "NNP"
    ], 
    "Mitre": [
        "NNP"
    ], 
    "interpreter": [
        "NN"
    ], 
    "Markese": [
        "NNP"
    ], 
    "small-equipment": [
        "NN"
    ], 
    "late-1988": [
        "JJ"
    ], 
    "dismaying": [
        "JJ"
    ], 
    "Fairly": [
        "RB"
    ], 
    "neighborly": [
        "JJ"
    ], 
    "glee": [
        "NN"
    ], 
    "Lublin": [
        "NNP"
    ], 
    "crowds": [
        "NNS", 
        "VBP", 
        "VBZ"
    ], 
    "Admassy": [
        "NNP"
    ], 
    "Tickets": [
        "NNS"
    ], 
    "Ibn": [
        "NNP"
    ], 
    "undoing": [
        "NN", 
        "VBG"
    ], 
    "impressing": [
        "VBG"
    ], 
    "Deloris": [
        "NNP"
    ], 
    "REPORTS": [
        "NNS"
    ], 
    "ambition": [
        "NN"
    ], 
    "abstractive": [
        "JJ"
    ], 
    "clippings": [
        "NNS"
    ], 
    "measly": [
        "JJ"
    ], 
    "edit": [
        "VB"
    ], 
    "enviable": [
        "JJ"
    ], 
    "subcontinent": [
        "NN"
    ], 
    "redwoods": [
        "NNS"
    ], 
    "three-wood": [
        "JJ"
    ], 
    "Bucky": [
        "NNP"
    ], 
    "computer-operated": [
        "JJ"
    ], 
    "Eliminating": [
        "VBG"
    ], 
    "pleasures": [
        "NNS"
    ], 
    "Bucks": [
        "NNP"
    ], 
    "treads": [
        "VBZ"
    ], 
    "Preferences": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "floutingly": [
        "RB"
    ], 
    "Venezuelans": [
        "NNPS"
    ], 
    "Nihon": [
        "NNP"
    ], 
    "deals...": [
        ":"
    ], 
    "double-wing": [
        "JJ"
    ], 
    "whipsawed": [
        "VBN"
    ], 
    "senior-subordinated": [
        "JJ"
    ], 
    "ambassadors": [
        "NNS"
    ], 
    "Verboort": [
        "NN"
    ], 
    "say-great": [
        "JJ"
    ], 
    "KAISER": [
        "NNP"
    ], 
    "honorably": [
        "RB"
    ], 
    "Civ.": [
        "NNP"
    ], 
    "Waikoloa": [
        "NNP"
    ], 
    "Canseco": [
        "NNP"
    ], 
    "chaos": [
        "NN"
    ], 
    "delivre": [
        "VB"
    ], 
    "Weisberg": [
        "NNP"
    ], 
    "Brokerage": [
        "NN", 
        "NNP"
    ], 
    "M.I.T.-trained": [
        "JJ"
    ], 
    "Unique": [
        "JJ"
    ], 
    "Cartoon": [
        "NN", 
        "NNP"
    ], 
    "Sequent": [
        "NNP"
    ], 
    "Ednee": [
        "NNP"
    ], 
    "Mattis": [
        "NNP"
    ], 
    "pours": [
        "VBZ"
    ], 
    "SUPREME": [
        "NNP"
    ], 
    "up-scale": [
        "JJ"
    ], 
    "Mattie": [
        "NNP"
    ], 
    "Stupid": [
        "JJ"
    ], 
    "Beige": [
        "NNP"
    ], 
    "Mattia": [
        "NNP"
    ], 
    "Paganini": [
        "NNS"
    ], 
    "organic": [
        "JJ"
    ], 
    "g": [
        "NN"
    ], 
    "crashed": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "bioequivalence-therapeutic-equivalence": [
        "JJ"
    ], 
    "Autocollimator": [
        "NN"
    ], 
    "footnoted": [
        "VBN"
    ], 
    "loggerheads": [
        "NNS"
    ], 
    "Renaissance-style": [
        "JJ"
    ], 
    "regaining": [
        "VBG"
    ], 
    "hence": [
        "RB"
    ], 
    "footnotes": [
        "NNS"
    ], 
    "Regionally": [
        "RB"
    ], 
    "self-enclosed": [
        "JJ"
    ], 
    "Belfast": [
        "NNP"
    ], 
    "Lufkin": [
        "NNP"
    ], 
    "eleventh": [
        "JJ"
    ], 
    "Electrical": [
        "NNP", 
        "JJ"
    ], 
    "title-holder": [
        "NN"
    ], 
    "J.G.": [
        "NNP"
    ], 
    "two-wheel-drive": [
        "JJ"
    ], 
    "assailing": [
        "VBG"
    ], 
    "end-of-year": [
        "JJ"
    ], 
    "property-investment": [
        "NN"
    ], 
    "unknown": [
        "JJ", 
        "NN"
    ], 
    "Waving": [
        "VBG"
    ], 
    "glide-bombed": [
        "VBD"
    ], 
    "misunderstood": [
        "VBN", 
        "VBD"
    ], 
    "Nibelungenlied": [
        "NNP"
    ], 
    "Lencioni": [
        "NNP"
    ], 
    "consoling": [
        "VBG"
    ], 
    "Mixtec": [
        "JJ"
    ], 
    "cuckoo-bumblebee": [
        "NN"
    ], 
    "well-organized": [
        "JJ"
    ], 
    "fist-fighting": [
        "NN"
    ], 
    "Intolerable": [
        "JJ"
    ], 
    "Denrees": [
        "NNP"
    ], 
    "bashed": [
        "VBD", 
        "VBN"
    ], 
    "colas": [
        "NNS"
    ], 
    "Quebecers": [
        "NNPS"
    ], 
    "Ellison": [
        "NNP"
    ], 
    "War-era": [
        "NNP"
    ], 
    "willingess": [
        "NN"
    ], 
    "househld": [
        "JJ"
    ], 
    "basher": [
        "NN"
    ], 
    "Cozumel": [
        "NNP"
    ], 
    "creditors": [
        "NNS"
    ], 
    "Diego": [
        "NNP", 
        "JJ"
    ], 
    "co-written": [
        "VBN"
    ], 
    "right-of-entry": [
        "NN"
    ], 
    "Keogh": [
        "NNP"
    ], 
    "teenagers": [
        "NNS"
    ], 
    "thrift-rescue": [
        "JJ", 
        "NN"
    ], 
    "small-stock": [
        "NN", 
        "JJ"
    ], 
    "delineated": [
        "VBN"
    ], 
    "gloomily": [
        "RB"
    ], 
    "Forgiveness": [
        "NN"
    ], 
    "convenants": [
        "NNS"
    ], 
    "declasse": [
        "JJ"
    ], 
    "Howsam": [
        "NNP"
    ], 
    "lightning-like": [
        "JJ"
    ], 
    "propriety": [
        "NN"
    ], 
    "marginalizing": [
        "VBG"
    ], 
    "boastful": [
        "JJ"
    ], 
    "Dock": [
        "NNP"
    ], 
    "trespassing": [
        "NN", 
        "VBG"
    ], 
    "Angrist": [
        "NNP"
    ], 
    "Johansen": [
        "NNP"
    ], 
    "misplacing": [
        "VBG"
    ], 
    "law-based": [
        "JJ"
    ], 
    "Gorenstein": [
        "NNP"
    ], 
    "Moines": [
        "NNP"
    ], 
    "twittering": [
        "VBG"
    ], 
    "mavens": [
        "NNS"
    ], 
    "Dorsten": [
        "NNP"
    ], 
    "agglutinins": [
        "NNS"
    ], 
    "hilltop": [
        "NN"
    ], 
    "Agnelli-related": [
        "JJ"
    ], 
    "GM-Toyota": [
        "JJ"
    ], 
    "why": [
        "WRB"
    ], 
    "Lindsay": [
        "NNP"
    ], 
    "JPI": [
        "NNP"
    ], 
    "Huskins": [
        "NNP"
    ], 
    "ensues": [
        "VBZ"
    ], 
    "oscillated": [
        "VBD"
    ], 
    "off-season": [
        "NN"
    ], 
    "Actress": [
        "NNP"
    ], 
    "pipe": [
        "NN"
    ], 
    "blowup": [
        "NN"
    ], 
    "ensued": [
        "VBD", 
        "VBN"
    ], 
    "Everybody": [
        "NN", 
        "NNP"
    ], 
    "Whose": [
        "WP$"
    ], 
    "balding": [
        "JJ", 
        "VBG"
    ], 
    "stonemason": [
        "NN"
    ], 
    "pleases": [
        "VBZ"
    ], 
    "Shima": [
        "NNP"
    ], 
    "chapters": [
        "NNS"
    ], 
    "Klamath": [
        "NNP"
    ], 
    "Chemical": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "unwinding": [
        "NN", 
        "VBG"
    ], 
    "convertibles": [
        "NNS"
    ], 
    "utter": [
        "JJ", 
        "VBP", 
        "VB"
    ], 
    "pleased": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "litigation": [
        "NN"
    ], 
    "earthquake-proof": [
        "JJ"
    ], 
    "SUPERPOWERS": [
        "NNPS"
    ], 
    "post-modern": [
        "JJ"
    ], 
    "Gramercy": [
        "NNP"
    ], 
    "Dickson": [
        "NNP"
    ], 
    "Tanganika": [
        "NNP"
    ], 
    "he": [
        "PRP", 
        "VB"
    ], 
    "widegrip": [
        "JJ"
    ], 
    "indignant": [
        "JJ"
    ], 
    "cube": [
        "NN"
    ], 
    "skimp": [
        "VB"
    ], 
    "skims": [
        "VBZ"
    ], 
    "Clayton-Pedersen": [
        "NNP"
    ], 
    "Enright": [
        "NNP"
    ], 
    "GPA": [
        "NNP"
    ], 
    "growth-and-income": [
        "JJ"
    ], 
    "Beaman": [
        "NNP"
    ], 
    "cubs": [
        "NNS"
    ], 
    "coordinating": [
        "VBG", 
        "NN"
    ], 
    "aleck": [
        "NN"
    ], 
    "Holman": [
        "NNP"
    ], 
    "Plastics": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Sentence": [
        "NN"
    ], 
    "Ambushes": [
        "NNS"
    ], 
    "Spinning": [
        "VBG"
    ], 
    "paternalism": [
        "NN", 
        "JJ"
    ], 
    "Stalinist-corrupted": [
        "JJ"
    ], 
    "union-busting": [
        "JJ"
    ], 
    "tickertape": [
        "NN"
    ], 
    "Halsey": [
        "NNP"
    ], 
    "editorialize": [
        "VB"
    ], 
    "half-million": [
        "JJ"
    ], 
    "go-go": [
        "JJ"
    ], 
    "workbench": [
        "NN"
    ], 
    "Ungava": [
        "NNP"
    ], 
    "Relocation": [
        "NNP"
    ], 
    "bust-up": [
        "JJ"
    ], 
    "honorariums": [
        "NNS"
    ], 
    "multipart": [
        "JJ"
    ], 
    "Cartusciello": [
        "NNP"
    ], 
    "Bosses": [
        "NNS"
    ], 
    "confrontational": [
        "JJ"
    ], 
    "despoiled": [
        "VBN"
    ], 
    "endothermic": [
        "JJ"
    ], 
    "sparsely": [
        "RB"
    ], 
    "traditionalism": [
        "NN"
    ], 
    "penetrations": [
        "NNS"
    ], 
    "credentialized": [
        "JJ"
    ], 
    "monstrous": [
        "JJ"
    ], 
    "candidate-picking": [
        "JJ"
    ], 
    "multifaceted": [
        "JJ"
    ], 
    "wetting": [
        "VBG", 
        "NN"
    ], 
    "limit": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "defacing": [
        "VBG"
    ], 
    "Diagnoses": [
        "NNPS"
    ], 
    "Gordin": [
        "NNP"
    ], 
    "jot": [
        "NN"
    ], 
    "conclave": [
        "NN"
    ], 
    "horrifyingly": [
        "RB"
    ], 
    "joy": [
        "NN"
    ], 
    "Democrat": [
        "NNP", 
        "NN"
    ], 
    "job": [
        "NN"
    ], 
    "Subway": [
        "NNP", 
        "NN"
    ], 
    "Machiavellian": [
        "JJ"
    ], 
    "Epigraph": [
        "NN"
    ], 
    "stucco": [
        "NN"
    ], 
    "Donnelly": [
        "NNP"
    ], 
    "estuarian": [
        "NN"
    ], 
    "tremolo": [
        "NN"
    ], 
    "valiantly": [
        "RB"
    ], 
    "april": [
        "NNP"
    ], 
    "presidential-primary": [
        "NN"
    ], 
    "Sustaining": [
        "VBG"
    ], 
    "Dealer": [
        "NNP", 
        "NN"
    ], 
    "grounds": [
        "NNS", 
        "VBZ"
    ], 
    "Expos": [
        "NNPS"
    ], 
    "Kuhlman": [
        "NNP"
    ], 
    "Staffe": [
        "NNP"
    ], 
    "heredity": [
        "NN"
    ], 
    "Indianapolis-based": [
        "JJ"
    ], 
    "symphonies": [
        "NNS"
    ], 
    "Staffs": [
        "NNS"
    ], 
    "Abd-al-Aziz": [
        "NNP"
    ], 
    "advertising-backed": [
        "JJ"
    ], 
    "Sternberg": [
        "NNP"
    ], 
    "Postwar": [
        "RB"
    ], 
    "decent": [
        "JJ"
    ], 
    "Campestre": [
        "NNP"
    ], 
    "trademark": [
        "NN"
    ], 
    "responds": [
        "VBZ"
    ], 
    "short-circuited": [
        "VBD", 
        "VBN"
    ], 
    "arbitrator": [
        "NN"
    ], 
    "lipsticks": [
        "NNS"
    ], 
    "Toronto": [
        "NNP", 
        "NN"
    ], 
    "puberty": [
        "NN"
    ], 
    "harshest": [
        "JJS"
    ], 
    "talk-show": [
        "NN", 
        "JJ"
    ], 
    "discimination": [
        "NN"
    ], 
    "frozen-pizza": [
        "NN"
    ], 
    "Westmin": [
        "NNP"
    ], 
    "Face": [
        "NNP", 
        "VBP"
    ], 
    "boozed-out": [
        "JJ"
    ], 
    "naphtha": [
        "NN"
    ], 
    "McGruder": [
        "NNP"
    ], 
    "Junk-holders": [
        "NNS"
    ], 
    "follow-ups": [
        "NNS"
    ], 
    "auto-emission": [
        "NN"
    ], 
    "Regret": [
        "NN"
    ], 
    "Sept.": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "shrimping": [
        "NN"
    ], 
    "lanthanum": [
        "NN"
    ], 
    "leaded-glass": [
        "JJ"
    ], 
    "Not-held": [
        "JJ"
    ], 
    "stunning": [
        "JJ"
    ], 
    "black-eyed": [
        "JJ"
    ], 
    "medicinal": [
        "JJ", 
        "NN"
    ], 
    "Doraville": [
        "NNP"
    ], 
    "Knappertsbusch": [
        "NNP"
    ], 
    "unworkable": [
        "JJ"
    ], 
    "crassness": [
        "NN"
    ], 
    "lower-than-anticipated": [
        "JJ"
    ], 
    "draining": [
        "VBG", 
        "NN"
    ], 
    "lonely": [
        "JJ"
    ], 
    "Marchand": [
        "NNP"
    ], 
    "lightweight": [
        "JJ", 
        "NN"
    ], 
    "disinterred": [
        "VBN"
    ], 
    "Rimini": [
        "NNP"
    ], 
    "over-price": [
        "VB"
    ], 
    "Culver": [
        "NNP"
    ], 
    "maddening": [
        "JJ", 
        "VBG"
    ], 
    "temptingly": [
        "RB"
    ], 
    "lyricists": [
        "NNS"
    ], 
    "exuberance": [
        "NN"
    ], 
    "burnouts": [
        "NNS"
    ], 
    "disciple": [
        "NN"
    ], 
    "Doobie": [
        "NNP"
    ], 
    "disagree": [
        "VBP", 
        "VB"
    ], 
    "Fungi": [
        "NNP"
    ], 
    "Quickening": [
        "VBG"
    ], 
    "overcrowded": [
        "JJ", 
        "VBN"
    ], 
    "recriminations": [
        "NNS"
    ], 
    "picayune": [
        "JJ"
    ], 
    "Rauschenberg": [
        "NNP"
    ], 
    "Loosli": [
        "NNP"
    ], 
    "fur-and-leather": [
        "JJ"
    ], 
    "warming": [
        "NN", 
        "VBG|NN", 
        "VBG"
    ], 
    "Houston": [
        "NNP", 
        "JJ"
    ], 
    "Meaney": [
        "NNP"
    ], 
    "aquisition": [
        "NN"
    ], 
    "timbre": [
        "NN"
    ], 
    "enamored": [
        "JJ"
    ], 
    "self-serve": [
        "NN"
    ], 
    "conquer": [
        "VB", 
        "VBP"
    ], 
    "Ruppert": [
        "NNP"
    ], 
    "re-incorporated": [
        "VBN"
    ], 
    "cameo": [
        "NN", 
        "JJ"
    ], 
    "camel": [
        "NN"
    ], 
    "accosting": [
        "VBG"
    ], 
    "system-management": [
        "NN"
    ], 
    "Balmain": [
        "NNP"
    ], 
    "off-off": [
        "JJ"
    ], 
    "Strawbridge": [
        "NNP"
    ], 
    "Eshleman": [
        "NNP"
    ], 
    "Liebler": [
        "NNP"
    ], 
    "pythons": [
        "NNS"
    ], 
    "Hand-holding": [
        "NN"
    ], 
    "Burkhardt": [
        "NNP"
    ], 
    "archfool": [
        "NN"
    ], 
    "Crumley": [
        "NNP"
    ], 
    "guts": [
        "NNS"
    ], 
    "trade-ethnic": [
        "JJ"
    ], 
    "Quotron": [
        "NNP", 
        "NN"
    ], 
    "usage": [
        "NN"
    ], 
    "Glasses": [
        "NNS"
    ], 
    "Pearson": [
        "NNP"
    ], 
    "provisions": [
        "NNS"
    ], 
    "wagon": [
        "NN"
    ], 
    "Homeowners": [
        "NNP", 
        "NNS"
    ], 
    "term": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "single-handed": [
        "JJ"
    ], 
    "Components": [
        "NNP", 
        "NNPS"
    ], 
    "catchers": [
        "NNS"
    ], 
    "redesign": [
        "NN", 
        "VB"
    ], 
    "Gabe": [
        "NNP"
    ], 
    "Portago": [
        "NNP"
    ], 
    "largest-selling": [
        "JJ"
    ], 
    "CAMBREX": [
        "NNP"
    ], 
    "Vila": [
        "NNP"
    ], 
    "KVA": [
        "NNP"
    ], 
    "gilt-edged": [
        "JJ"
    ], 
    "RISK": [
        "NN"
    ], 
    "perpetual": [
        "JJ"
    ], 
    "housing-assistance": [
        "JJ"
    ], 
    "Treece": [
        "NNP"
    ], 
    "Frosted": [
        "NNP"
    ], 
    "Interfinance": [
        "NNP"
    ], 
    "overtures": [
        "NNS"
    ], 
    "feigned": [
        "JJ", 
        "VBN"
    ], 
    "hosts": [
        "NNS", 
        "VBZ"
    ], 
    "glass-fiber": [
        "JJ"
    ], 
    "anti-cholesterol": [
        "JJ"
    ], 
    "parity": [
        "NN"
    ], 
    "exceed": [
        "VB", 
        "VBP"
    ], 
    "smoothly": [
        "RB"
    ], 
    "contemporaneous": [
        "JJ"
    ], 
    "reclamation": [
        "NN"
    ], 
    "melee": [
        "NN"
    ], 
    "dot-matrix": [
        "NN"
    ], 
    "past.": [
        "NN"
    ], 
    "Zukin": [
        "NNP"
    ], 
    "misadventures": [
        "NNS"
    ], 
    "Biblical": [
        "JJ", 
        "NNP"
    ], 
    "Wildbad": [
        "NNP"
    ], 
    "Himebaugh": [
        "NNP"
    ], 
    "underutilization": [
        "NN"
    ], 
    "Tussard": [
        "NNP"
    ], 
    "Jack-of-all-trades": [
        "NN"
    ], 
    "Korobytsin": [
        "NNP"
    ], 
    "Heartwise": [
        "NNP"
    ], 
    "physician-executive": [
        "JJ"
    ], 
    "pasty": [
        "JJ", 
        "NN"
    ], 
    "across-the-board": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "services-repair": [
        "NN"
    ], 
    "Newall": [
        "NNP"
    ], 
    "Dollars": [
        "NNPS", 
        "NNS"
    ], 
    "Ehman": [
        "NNP"
    ], 
    "Bingles": [
        "NNS"
    ], 
    "fords": [
        "NNS"
    ], 
    "pasta": [
        "NN"
    ], 
    "Bingley": [
        "NNP"
    ], 
    "paste": [
        "NN", 
        "VB"
    ], 
    "calcium-supplemented": [
        "JJ"
    ], 
    "pike": [
        "NN"
    ], 
    "Jurists": [
        "NNP"
    ], 
    "rare": [
        "JJ"
    ], 
    "carried": [
        "VBD", 
        "VBN"
    ], 
    "Dufresne": [
        "NNP"
    ], 
    "goat-drawn": [
        "JJ"
    ], 
    "then-Air": [
        "JJ|NP"
    ], 
    "Carr": [
        "NNP"
    ], 
    "Kreutzer": [
        "NNP"
    ], 
    "carrier": [
        "NN"
    ], 
    "construction-oriented": [
        "JJ"
    ], 
    "outstripped": [
        "NN", 
        "VBD", 
        "VBN"
    ], 
    "Cigna": [
        "NNP"
    ], 
    "Angelica": [
        "NNP", 
        "FW"
    ], 
    "half-heartedly": [
        "JJ"
    ], 
    "outset": [
        "NN"
    ], 
    "WTXF": [
        "NNP"
    ], 
    "polished": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Gorton": [
        "NNP"
    ], 
    "gymnastic": [
        "JJ"
    ], 
    "Gene-Spliced": [
        "JJ"
    ], 
    "Angelico": [
        "NNP"
    ], 
    "polishes": [
        "NNS"
    ], 
    "lawful": [
        "JJ"
    ], 
    "zoology": [
        "NN"
    ], 
    "Penman": [
        "NNP"
    ], 
    "Honeybee": [
        "NNP"
    ], 
    "AWOC": [
        "NNP"
    ], 
    "Schuler": [
        "NNP"
    ], 
    "Feeding": [
        "NNP"
    ], 
    "Grease": [
        "NN"
    ], 
    "Finance": [
        "NNP", 
        "NN"
    ], 
    "crave": [
        "VBP", 
        "VB"
    ], 
    "suburbs": [
        "NNS"
    ], 
    "Capetown": [
        "NNP"
    ], 
    "Transcaucasus": [
        "NNP"
    ], 
    "spiral": [
        "NN", 
        "VB"
    ], 
    "RAAF": [
        "NNP"
    ], 
    "captains": [
        "NNS"
    ], 
    "Hartigan": [
        "NNP"
    ], 
    "gazpacho": [
        "NN"
    ], 
    "Execution": [
        "NNP", 
        "NN"
    ], 
    "Leveraged": [
        "JJ", 
        "VBN"
    ], 
    "Greasy": [
        "JJ"
    ], 
    "automates": [
        "VBZ"
    ], 
    "Davison": [
        "NNP"
    ], 
    "nourish": [
        "VB"
    ], 
    "catsup": [
        "NN"
    ], 
    "supertanker": [
        "NN"
    ], 
    "Galophone-Prissy": [
        "NNP"
    ], 
    "indigents": [
        "NNS"
    ], 
    "DEFICIT": [
        "NNP"
    ], 
    "Witcher": [
        "NNP"
    ], 
    "defamed": [
        "VBN", 
        "VBD"
    ], 
    "administration...": [
        ":"
    ], 
    "protesting": [
        "VBG"
    ], 
    "FCB\\/Leber": [
        "NNP"
    ], 
    "Tawney": [
        "NNP"
    ], 
    "Britain": [
        "NNP"
    ], 
    "graphite": [
        "NN"
    ], 
    "unasterisked": [
        "JJ"
    ], 
    "Hi-Country": [
        "NNP"
    ], 
    "CAE-Link": [
        "NNP"
    ], 
    "monastic": [
        "JJ"
    ], 
    "bewail": [
        "VB"
    ], 
    "Descent": [
        "NN"
    ], 
    "horrific": [
        "JJ"
    ], 
    "Illinois-based": [
        "JJ"
    ], 
    "overhauled": [
        "VBN", 
        "VBD"
    ], 
    "maroon": [
        "JJ"
    ], 
    "Geometric": [
        "NNP", 
        "JJ"
    ], 
    "visa": [
        "NN"
    ], 
    "gizmo": [
        "NN"
    ], 
    "monopolists": [
        "NNS"
    ], 
    "Haskin": [
        "NNP"
    ], 
    "glint": [
        "NN"
    ], 
    "multi-spired": [
        "JJ"
    ], 
    "overprotected": [
        "VBN"
    ], 
    "hurricane-prone": [
        "JJ"
    ], 
    "Elsinore": [
        "NNP"
    ], 
    "coffees": [
        "NNS"
    ], 
    "repute": [
        "NN"
    ], 
    "Raful": [
        "NNP"
    ], 
    "conclusion": [
        "NN"
    ], 
    "Mushr": [
        "NN"
    ], 
    "mildness": [
        "NN"
    ], 
    "kinds": [
        "NNS"
    ], 
    "Lionville": [
        "NNP"
    ], 
    "pumps": [
        "NNS"
    ], 
    "Karim": [
        "NNP"
    ], 
    "Karin": [
        "NNP"
    ], 
    "Acme-Cleveland": [
        "NNP"
    ], 
    "rhapsody": [
        "NN"
    ], 
    "market-related": [
        "JJ"
    ], 
    "Siti": [
        "NNP"
    ], 
    "auxiliary": [
        "JJ", 
        "NN"
    ], 
    "Surviving": [
        "NNP", 
        "VBG"
    ], 
    "adaptable": [
        "JJ"
    ], 
    "Bellas": [
        "NNP"
    ], 
    "Sitz": [
        "NNP"
    ], 
    "tumefaciens": [
        "NN"
    ], 
    "tulips": [
        "NNS"
    ], 
    "dominoes": [
        "NN"
    ], 
    "laundromat": [
        "NN"
    ], 
    "sash": [
        "NN"
    ], 
    "pistol-whipped": [
        "VBD"
    ], 
    "impersonalized": [
        "JJ"
    ], 
    "Campuses": [
        "NNS"
    ], 
    "fig.": [
        "NN"
    ], 
    "tormenting": [
        "VBG"
    ], 
    "Elevated": [
        "NNP"
    ], 
    "Sugar": [
        "NNP", 
        "NN"
    ], 
    "plaudits": [
        "NNS"
    ], 
    "Thriving": [
        "JJ"
    ], 
    "Seekonk": [
        "NNP"
    ], 
    "Thrive": [
        "VBP"
    ], 
    "third-biggest": [
        "JJ"
    ], 
    "little-noted": [
        "JJ"
    ], 
    "consulate": [
        "NN"
    ], 
    "Casey": [
        "NNP"
    ], 
    "fingernails": [
        "NNS"
    ], 
    "couch-potato": [
        "NN"
    ], 
    "Cases": [
        "NNS"
    ], 
    "Winooski": [
        "NNP"
    ], 
    "Regionalism": [
        "NNP"
    ], 
    "illegally": [
        "RB"
    ], 
    "PHOBIA": [
        "NN"
    ], 
    "shielding": [
        "NN", 
        "VBG"
    ], 
    "IXL": [
        "NNP"
    ], 
    "reversibility": [
        "NN"
    ], 
    "Eiszner": [
        "NNP"
    ], 
    "TAINTS": [
        "VBZ"
    ], 
    "Super-NOW": [
        "NNP"
    ], 
    "presser": [
        "NN"
    ], 
    "Waikikians": [
        "NNPS"
    ], 
    "neo-swing": [
        "NN"
    ], 
    "antianemia": [
        "JJ"
    ], 
    "Single-seeded": [
        "JJ"
    ], 
    "Tierno": [
        "NNP"
    ], 
    "tensile": [
        "JJ"
    ], 
    "intensification": [
        "NN"
    ], 
    "disburden": [
        "VB"
    ], 
    "then-Minister": [
        "JJ"
    ], 
    "Whisper": [
        "NNP"
    ], 
    "debuting": [
        "VBG"
    ], 
    "parsympathetic": [
        "JJ"
    ], 
    "B.A.": [
        "NNP"
    ], 
    "world-oriented": [
        "JJ"
    ], 
    "switchblade": [
        "NN"
    ], 
    "Gressette": [
        "NNP"
    ], 
    "crisply": [
        "RB"
    ], 
    "Hockey": [
        "NNP"
    ], 
    "Merlis": [
        "NNP"
    ], 
    "milled": [
        "JJ"
    ], 
    "SIZING": [
        "NNP"
    ], 
    "admire": [
        "VB", 
        "VBP"
    ], 
    "machine-masters": [
        "NNS"
    ], 
    "dangled": [
        "VBD", 
        "VBN"
    ], 
    "whaling": [
        "NN"
    ], 
    "unlisted": [
        "JJ", 
        "VBN"
    ], 
    "Georgene": [
        "NNP"
    ], 
    "Verner": [
        "NNP"
    ], 
    "dangles": [
        "VBZ"
    ], 
    "Arighi": [
        "NNP"
    ], 
    "negated": [
        "VBN", 
        "VBD"
    ], 
    "increasing": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "pictorially": [
        "RB"
    ], 
    "Neville": [
        "NNP"
    ], 
    "Sioux": [
        "NNP", 
        "NNPS"
    ], 
    "PROCTER": [
        "NNP"
    ], 
    "russet-colored": [
        "JJ"
    ], 
    "jasmine": [
        "NN"
    ], 
    "Budget": [
        "NNP", 
        "NN"
    ], 
    "Longer": [
        "JJR"
    ], 
    "Stuttgart": [
        "NNP"
    ], 
    "eight-acre": [
        "JJ"
    ], 
    "Amtech": [
        "NNP"
    ], 
    "Foremost": [
        "RB", 
        "NNP"
    ], 
    "lead\\/sulfur": [
        "NN"
    ], 
    "Yuko": [
        "NNP"
    ], 
    "Yuki": [
        "NNP"
    ], 
    "borrowers": [
        "NNS"
    ], 
    "fast-developing": [
        "JJ"
    ], 
    "Allenport": [
        "NNP"
    ], 
    "hollyhocks": [
        "NNS"
    ], 
    "NOC": [
        "NNP"
    ], 
    "grade-school": [
        "JJ"
    ], 
    "yet...": [
        ":"
    ], 
    "CONSERVATIVES": [
        "NNS"
    ], 
    "NOW": [
        "RB", 
        "NNP"
    ], 
    "NOP": [
        "NN", 
        "NNP"
    ], 
    "burrow": [
        "NN", 
        "VB"
    ], 
    "interferon": [
        "NN"
    ], 
    "Cheered": [
        "VBN"
    ], 
    "Quincy": [
        "NNP"
    ], 
    "previous-year": [
        "JJ"
    ], 
    "high-current": [
        "JJ"
    ], 
    "Jennings": [
        "NNP"
    ], 
    "besets": [
        "VBZ"
    ], 
    "explained": [
        "VBD", 
        "VBN"
    ], 
    "Hallingby": [
        "NNP"
    ], 
    "scoffer": [
        "NN"
    ], 
    "Stock-market": [
        "NN"
    ], 
    "Savoyards": [
        "NNP"
    ], 
    "Quince": [
        "NN"
    ], 
    "Irishmen": [
        "NNPS", 
        "NNS"
    ], 
    "spoke": [
        "VBD", 
        "NN"
    ], 
    "re-emphasize": [
        "VB", 
        "VBP"
    ], 
    "Scheherazade": [
        "NNP"
    ], 
    "overshadow": [
        "VBP", 
        "VB"
    ], 
    "glimmering": [
        "VBG"
    ], 
    "replacement-car": [
        "NN"
    ], 
    "Anticipated": [
        "VBN", 
        "JJ"
    ], 
    "play-it-safe": [
        "JJ"
    ], 
    "Corning": [
        "NNP", 
        "VBG"
    ], 
    "heralded": [
        "VBN", 
        "VBD"
    ], 
    "Sassy": [
        "NNP", 
        "JJ"
    ], 
    "Brainards": [
        "NNPS"
    ], 
    "Bioengineers": [
        "NNS"
    ], 
    "Brighton": [
        "NNP"
    ], 
    "segregationist": [
        "NN", 
        "JJ"
    ], 
    "mired": [
        "VBN", 
        "JJ"
    ], 
    "successful": [
        "JJ"
    ], 
    "greenhouse-effect": [
        "JJ"
    ], 
    "officio": [
        "FW"
    ], 
    "hurt": [
        "VBN", 
        "JJ", 
        "NN", 
        "VB", 
        "VBD", 
        "VBP"
    ], 
    "naczelnik": [
        "FW"
    ], 
    "Genossenschaftsbank": [
        "NNP"
    ], 
    "goddammit": [
        "UH"
    ], 
    "detective-story": [
        "NN"
    ], 
    "straddle": [
        "VB"
    ], 
    "Luna": [
        "NNP"
    ], 
    "vow": [
        "NN", 
        "VBP"
    ], 
    "Lung": [
        "NNP", 
        "NN"
    ], 
    "Gogol": [
        "NNP"
    ], 
    "lower-wage": [
        "JJ"
    ], 
    "Lund": [
        "NNP"
    ], 
    "better-paying": [
        "JJ"
    ], 
    "Mystery": [
        "NN", 
        "NNP"
    ], 
    "unstuffy": [
        "VB"
    ], 
    "droppable": [
        "JJ"
    ], 
    "household": [
        "NN", 
        "JJ"
    ], 
    "Celso": [
        "NNP"
    ], 
    "Insulate": [
        "VB"
    ], 
    "Reality": [
        "NN", 
        "NNP"
    ], 
    "Smith-Colmer": [
        "NNP"
    ], 
    "reprove": [
        "VB"
    ], 
    "money-hungry": [
        "NN"
    ], 
    "rescue": [
        "NN", 
        "VB"
    ], 
    "preferably": [
        "RB"
    ], 
    "Eagle": [
        "NNP"
    ], 
    "Wheaties-box": [
        "JJ"
    ], 
    "complaining": [
        "VBG"
    ], 
    "Atop": [
        "IN"
    ], 
    "damage": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Killing": [
        "NN", 
        "NNP", 
        "VBG"
    ], 
    "machine": [
        "NN"
    ], 
    "methodology": [
        "NN"
    ], 
    "health-maintenance": [
        "NN"
    ], 
    "trading-fraud": [
        "NN"
    ], 
    "Jussel": [
        "NNP"
    ], 
    "agglutination": [
        "NN"
    ], 
    "preferable": [
        "JJ"
    ], 
    "Caldor": [
        "NNP"
    ], 
    "Alcatel": [
        "NNP"
    ], 
    "arylesterase": [
        "NN"
    ], 
    "swing": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "anti-flag-burning": [
        "JJ"
    ], 
    "possum": [
        "NN"
    ], 
    "Matlock": [
        "NNP"
    ], 
    "calves": [
        "NNS"
    ], 
    "wins": [
        "VBZ", 
        "NNS"
    ], 
    "attracts": [
        "VBZ"
    ], 
    "Tiant": [
        "NNP"
    ], 
    "signatories": [
        "NNS"
    ], 
    "wink": [
        "NN", 
        "VB"
    ], 
    "Haskell": [
        "NNP"
    ], 
    "keeps": [
        "VBZ", 
        "NNS"
    ], 
    "Manitoba": [
        "NNP"
    ], 
    "PNC": [
        "NNP"
    ], 
    "Petruchka": [
        "NNP"
    ], 
    "wing": [
        "NN", 
        "VBP"
    ], 
    "wind": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "heavily-upholstered": [
        "JJ"
    ], 
    "Lohmans": [
        "NNP"
    ], 
    "Requirements": [
        "NNS"
    ], 
    "money-retirees": [
        "NNS"
    ], 
    "ARAL-88": [
        "NNP"
    ], 
    "C.B.": [
        "NNP"
    ], 
    "west-central": [
        "JJ"
    ], 
    "handcuff": [
        "VBP"
    ], 
    "lower-cost": [
        "JJ", 
        "JJR"
    ], 
    "affect": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "soothingly": [
        "RB"
    ], 
    "whoring": [
        "NN"
    ], 
    "Kearns": [
        "NNP"
    ], 
    "rankings": [
        "NNS"
    ], 
    "un-Swiss": [
        "JJ"
    ], 
    "Kearny": [
        "NNP"
    ], 
    "narrowest": [
        "JJS"
    ], 
    "Harris": [
        "NNP"
    ], 
    "Prohibited": [
        "NNP"
    ], 
    "endeavoring": [
        "VBG"
    ], 
    "shipbuilder": [
        "NN"
    ], 
    "Shattuck": [
        "NNP"
    ], 
    "woods": [
        "NNS"
    ], 
    "workhorse": [
        "NN"
    ], 
    "universalistic": [
        "JJ"
    ], 
    "Christiansen": [
        "NNP"
    ], 
    "exploding-wire": [
        "JJ"
    ], 
    "commemorate": [
        "VB", 
        "VBP"
    ], 
    "captioned": [
        "VBD"
    ], 
    "tenancy": [
        "NN"
    ], 
    "MRI": [
        "NNP"
    ], 
    "Robbery": [
        "NNP"
    ], 
    "Cards": [
        "NNP", 
        "VBP", 
        "NNPS", 
        "NNS"
    ], 
    "township": [
        "NN"
    ], 
    "Robbers": [
        "NNS"
    ], 
    "MRA": [
        "NNP"
    ], 
    "MRC": [
        "NNP"
    ], 
    "represents": [
        "VBZ"
    ], 
    "China-bound": [
        "JJ"
    ], 
    "Hilkert": [
        "NNP"
    ], 
    "chamber-music": [
        "JJ"
    ], 
    "queues": [
        "NNS"
    ], 
    "dumps": [
        "VBZ", 
        "NNS"
    ], 
    "clothed": [
        "VBN"
    ], 
    "Branford": [
        "NNP"
    ], 
    "Bonnier": [
        "NNP"
    ], 
    "Hoogli": [
        "NNP"
    ], 
    "Mouse": [
        "NNP", 
        "NN"
    ], 
    "queued": [
        "JJ"
    ], 
    "preceded": [
        "VBD", 
        "VBN"
    ], 
    "typifies": [
        "VBZ"
    ], 
    "financial": [
        "JJ"
    ], 
    "swathe": [
        "NN"
    ], 
    "Dortmund": [
        "NNP"
    ], 
    "bowls": [
        "NNS", 
        "VBZ"
    ], 
    "mule-drawn": [
        "JJ"
    ], 
    "precedes": [
        "VBZ"
    ], 
    "fortnight": [
        "NN"
    ], 
    "laboratory": [
        "NN"
    ], 
    "Grauman": [
        "NNP"
    ], 
    "urbane": [
        "JJ"
    ], 
    "Stillwater": [
        "NNP"
    ], 
    "Tarheelia": [
        "NNP"
    ], 
    "Hellisen": [
        "NNP"
    ], 
    "Awkwardly": [
        "RB"
    ], 
    "JT8D-200": [
        "NN"
    ], 
    "rented": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Colorcoat": [
        "NNP"
    ], 
    "Swasey": [
        "NNP"
    ], 
    "Systematically": [
        "RB"
    ], 
    "last-gasp": [
        "JJ"
    ], 
    "Karre": [
        "NNP"
    ], 
    "fugitive": [
        "JJ", 
        "NN"
    ], 
    "sensory": [
        "JJ"
    ], 
    "assures": [
        "VBZ"
    ], 
    "Nutmeg": [
        "NNP"
    ], 
    "Singletary": [
        "NNP"
    ], 
    "sensors": [
        "NNS"
    ], 
    "Poltrack": [
        "NNP"
    ], 
    "Raphael": [
        "NNP"
    ], 
    "Disgrace": [
        "NN"
    ], 
    "Hord": [
        "NNP"
    ], 
    "tsunami-warning": [
        "JJ"
    ], 
    "Hori": [
        "NNP"
    ], 
    "typified": [
        "VBN", 
        "VBD"
    ], 
    "Dubilier": [
        "NNP"
    ], 
    "secularism": [
        "NN"
    ], 
    "obsolescent": [
        "JJ"
    ], 
    "Horn": [
        "NNP", 
        "NN"
    ], 
    "joint-venturing": [
        "NN"
    ], 
    "waddles": [
        "VBZ"
    ], 
    "naturalism": [
        "NN"
    ], 
    "Human": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "clothes": [
        "NNS"
    ], 
    "shopper": [
        "NN"
    ], 
    "heavy-crude": [
        "NN"
    ], 
    "skim-milk": [
        "NN"
    ], 
    "subtlety": [
        "NN"
    ], 
    "Please": [
        "VB", 
        "RB", 
        "UH", 
        "NNP"
    ], 
    "shopped": [
        "VBN", 
        "VBD"
    ], 
    "Turpin": [
        "NNP"
    ], 
    "Canion": [
        "NNP"
    ], 
    "contralto": [
        "NN"
    ], 
    "outstandingly": [
        "RB"
    ], 
    "Skyway": [
        "NNP"
    ], 
    "copyright-infringement": [
        "NN"
    ], 
    "dogmas": [
        "NN", 
        "NNS"
    ], 
    "hardboard": [
        "NN"
    ], 
    "postulate": [
        "VB"
    ], 
    "legs": [
        "NNS"
    ], 
    "persecute": [
        "VBP"
    ], 
    "oil-patch": [
        "JJ", 
        "NN"
    ], 
    "Atmospheric": [
        "NNP"
    ], 
    "collapse": [
        "NN", 
        "VB"
    ], 
    "fibrous": [
        "JJ"
    ], 
    "snooty": [
        "JJ"
    ], 
    "bounty": [
        "NN"
    ], 
    "Precious-metals": [
        "NNS", 
        "JJ"
    ], 
    "Named": [
        "VBN"
    ], 
    "wisdom": [
        "NN"
    ], 
    "Outrunning": [
        "VBG"
    ], 
    "Bertoia": [
        "NNP"
    ], 
    "Chernobyl": [
        "NNP"
    ], 
    "Plummer": [
        "NNP"
    ], 
    "PHOENIX": [
        "NNP"
    ], 
    "iteration": [
        "NN"
    ], 
    "endure": [
        "VB", 
        "VBP"
    ], 
    "warm-toned": [
        "JJ"
    ], 
    "bodyguards": [
        "NNS"
    ], 
    "contribution": [
        "NN"
    ], 
    "recheck": [
        "VBP"
    ], 
    "Computerworld": [
        "NNP"
    ], 
    "Varvara": [
        "NNP"
    ], 
    "groaning": [
        "VBG"
    ], 
    "girder": [
        "NN"
    ], 
    "PLC": [
        "NNP"
    ], 
    "Keeping": [
        "VBG", 
        "NNP"
    ], 
    "demand-related": [
        "JJ"
    ], 
    "Fraud": [
        "NNP", 
        "NN"
    ], 
    "Gursel": [
        "NNP"
    ], 
    "overregulated": [
        "JJ", 
        "VBN"
    ], 
    "Haussmann": [
        "NNP"
    ], 
    "rechartering": [
        "VBG"
    ], 
    "Crotale": [
        "JJ"
    ], 
    "Bans": [
        "NNP"
    ], 
    "responsible": [
        "JJ"
    ], 
    "Northlich": [
        "NNP"
    ], 
    "Tastes": [
        "NNPS", 
        "NNS"
    ], 
    "condensers": [
        "NNS"
    ], 
    "metallic": [
        "JJ"
    ], 
    "Bane": [
        "NNP", 
        "NN"
    ], 
    "Band": [
        "NNP", 
        "NN"
    ], 
    "Bang": [
        "NNP"
    ], 
    "causing": [
        "VBG", 
        "NN"
    ], 
    "defiantly": [
        "RB"
    ], 
    "Banc": [
        "NNP"
    ], 
    "alai": [
        "FW"
    ], 
    "Bani": [
        "NNP"
    ], 
    "Bank": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "commercial-credit": [
        "NN"
    ], 
    "Marrow-Tech": [
        "NNP"
    ], 
    "Anglo\\/Dutch": [
        "NNP"
    ], 
    "Emboldened": [
        "JJ", 
        "VBN"
    ], 
    "gloaters": [
        "NNS"
    ], 
    "mystique": [
        "NN"
    ], 
    "contact-lens": [
        "NN"
    ], 
    "looming": [
        "VBG", 
        "NN"
    ], 
    "deficit-inflation-capital-flight": [
        "JJ"
    ], 
    "well-fortified": [
        "JJ"
    ], 
    "affirmation": [
        "NN"
    ], 
    "Logic": [
        "NNP", 
        "NN"
    ], 
    "retaining": [
        "VBG"
    ], 
    "Puppeteer": [
        "NN"
    ], 
    "conclaves": [
        "NNS"
    ], 
    "morality": [
        "NN"
    ], 
    "initiator": [
        "NN"
    ], 
    "antitrust": [
        "JJ", 
        "NN"
    ], 
    "grove": [
        "NN"
    ], 
    "professor": [
        "NN"
    ], 
    "Kingston": [
        "NNP"
    ], 
    "detectors": [
        "NNS"
    ], 
    "rerun-sales": [
        "NNS"
    ], 
    "alas": [
        "UH"
    ], 
    "braying": [
        "JJ"
    ], 
    "world-at-large": [
        "NN"
    ], 
    "suspicions...": [
        ":"
    ], 
    "budget-cutting": [
        "NN"
    ], 
    "classicism": [
        "NN"
    ], 
    "Ashmolean": [
        "NNP"
    ], 
    "bomb": [
        "NN", 
        "VB"
    ], 
    "pro-enterprise": [
        "JJ"
    ], 
    "Sawallisch": [
        "NNP"
    ], 
    "tequila": [
        "NN"
    ], 
    "advisors": [
        "NNS"
    ], 
    "parolees": [
        "NNS"
    ], 
    "reinstitution": [
        "NN"
    ], 
    "Cinalli": [
        "NNP"
    ], 
    "undefined": [
        "JJ"
    ], 
    "regiments": [
        "NNS"
    ], 
    "gauge": [
        "NN", 
        "VB"
    ], 
    "five-week": [
        "JJ"
    ], 
    "Meyner": [
        "NNP"
    ], 
    "capes": [
        "NNS"
    ], 
    "rock-hard": [
        "JJ"
    ], 
    "copy": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "crisis-management": [
        "JJ", 
        "NN"
    ], 
    "buckboard": [
        "NN"
    ], 
    "menu": [
        "NN"
    ], 
    "adoption-assistance": [
        "JJ"
    ], 
    "buxom": [
        "JJ"
    ], 
    "breath-taking": [
        "JJ", 
        "NN"
    ], 
    "steel-ingot": [
        "NN"
    ], 
    "theme": [
        "NN"
    ], 
    "Beulah": [
        "NNP"
    ], 
    "Evry": [
        "NNP"
    ], 
    "mend": [
        "VB"
    ], 
    "telegrams": [
        "NNS", 
        "VBZ"
    ], 
    "Belated": [
        "JJ"
    ], 
    "quasi-religious": [
        "JJ"
    ], 
    "fellow-countryman": [
        "NN"
    ], 
    "bank-branch": [
        "JJ"
    ], 
    "lenders": [
        "NNS"
    ], 
    "chutney": [
        "NN"
    ], 
    "plane-building": [
        "NN"
    ], 
    "avenger": [
        "NN"
    ], 
    "Pointing": [
        "VBG"
    ], 
    "requalify": [
        "VB"
    ], 
    "slow-scrambling": [
        "JJ"
    ], 
    "IQ": [
        "NNP"
    ], 
    "lurched": [
        "VBD"
    ], 
    "Purified": [
        "VBN"
    ], 
    "Nett": [
        "NNP"
    ], 
    "Clearly": [
        "RB", 
        "NNP"
    ], 
    "two-mile": [
        "JJ"
    ], 
    "traverse": [
        "VB"
    ], 
    "leasing": [
        "NN", 
        "VBG|NN", 
        "VBG"
    ], 
    "consummation": [
        "NN"
    ], 
    "conservatories": [
        "NNS"
    ], 
    "Tenney": [
        "NNP"
    ], 
    "Velveeta": [
        "NNP"
    ], 
    "Liebowitz": [
        "NNP"
    ], 
    "babyhood": [
        "NN"
    ], 
    "natural-gas": [
        "NN", 
        "JJ"
    ], 
    "nocturnal": [
        "JJ"
    ], 
    "best": [
        "JJS", 
        "RBS", 
        "JJSS", 
        "NN", 
        "RB"
    ], 
    "demonologist": [
        "NN"
    ], 
    "stealthy": [
        "JJ"
    ], 
    "killable": [
        "JJ"
    ], 
    "planoconcave": [
        "JJ"
    ], 
    "height-to-diameter": [
        "NN"
    ], 
    "Courts": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "conceptual": [
        "JJ"
    ], 
    "toolmaker": [
        "NN"
    ], 
    "Cage": [
        "NNP"
    ], 
    "pirate": [
        "NN"
    ], 
    "boom-boxes": [
        "NNS"
    ], 
    "donut-sales": [
        "JJ"
    ], 
    "claws": [
        "NNS"
    ], 
    "screwball": [
        "JJ", 
        "NN"
    ], 
    "felons": [
        "NNS"
    ], 
    "cripple-maker": [
        "NN"
    ], 
    "felony": [
        "NN"
    ], 
    "aesthetic": [
        "JJ", 
        "NN"
    ], 
    "non-daily": [
        "JJ"
    ], 
    "Mechanix": [
        "NNP"
    ], 
    "two-sevenths": [
        "NNS"
    ], 
    "Trohan": [
        "NNP"
    ], 
    "drew": [
        "VBD"
    ], 
    "wrap-around": [
        "JJ"
    ], 
    "carbon": [
        "NN"
    ], 
    "Malabar": [
        "NNP"
    ], 
    "Stiemerling": [
        "NNP"
    ], 
    "Veronica": [
        "NN"
    ], 
    "violators": [
        "NNS"
    ], 
    "adapter": [
        "NN"
    ], 
    "PSA": [
        "NNP"
    ], 
    "adventurer": [
        "NN"
    ], 
    "adventures": [
        "NNS"
    ], 
    "PSE": [
        "NNP"
    ], 
    "goal-line": [
        "NN"
    ], 
    "Demented": [
        "JJ"
    ], 
    "estates": [
        "NNS"
    ], 
    "PS\\": [
        "NN", 
        "NNP", 
        "NNS"
    ], 
    "quests": [
        "NNS"
    ], 
    "adapted": [
        "VBN", 
        "VBD"
    ], 
    "nanny": [
        "NN"
    ], 
    "polycrystalline": [
        "JJ"
    ], 
    "irresponsible": [
        "JJ", 
        "NN"
    ], 
    "higher-rate": [
        "JJ"
    ], 
    "Sawicki": [
        "NNP"
    ], 
    "canyon": [
        "NN"
    ], 
    "SAFEWAY": [
        "NNP"
    ], 
    "irresponsibly": [
        "RB"
    ], 
    "linguistically": [
        "RB"
    ], 
    "Weyerhauser": [
        "NNP"
    ], 
    "non-professionals": [
        "NNS"
    ], 
    "eased...": [
        ":"
    ], 
    "Skyros": [
        "NNP"
    ], 
    "corrugations": [
        "NNS"
    ], 
    "anti-psychotic": [
        "JJ"
    ], 
    "D.,Calif": [
        "NNP"
    ], 
    "chrome": [
        "NN"
    ], 
    "work-force": [
        "NN"
    ], 
    "breakoff": [
        "JJ"
    ], 
    "risk-capital": [
        "JJ"
    ], 
    "extraction": [
        "NN"
    ], 
    "neo-dadaist": [
        "NN"
    ], 
    "quadripartite": [
        "JJ"
    ], 
    "tutorials": [
        "NNS"
    ], 
    "Luneburg": [
        "NNP"
    ], 
    "incompetent": [
        "JJ"
    ], 
    "life": [
        "NN", 
        "RB"
    ], 
    "Board-traded": [
        "JJ"
    ], 
    "hospitalized": [
        "VBN", 
        "JJ"
    ], 
    "cash-equivalent": [
        "JJ"
    ], 
    "Poland": [
        "NNP"
    ], 
    "Fergus": [
        "NNP"
    ], 
    "similar-sounding": [
        "JJ"
    ], 
    "Concrete": [
        "NNP", 
        "JJ"
    ], 
    "joust": [
        "NN"
    ], 
    "lift": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "regaled": [
        "VBD", 
        "VBN"
    ], 
    "child": [
        "NN"
    ], 
    "Investigating": [
        "VBG"
    ], 
    "chili": [
        "NN", 
        "NNS"
    ], 
    "self-destructed": [
        "VBD"
    ], 
    "modern-day": [
        "JJ"
    ], 
    "chill": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "unsold": [
        "JJ"
    ], 
    "adaptations": [
        "NNS"
    ], 
    "sanctorum": [
        "FW"
    ], 
    "Grove\\/Weidenfeld": [
        "NN"
    ], 
    "Kippur": [
        "NNP"
    ], 
    "never-predictable": [
        "JJ"
    ], 
    "picturing": [
        "VBG", 
        "NN"
    ], 
    "Potsdam": [
        "NNP"
    ], 
    "Y-cells": [
        "NNS"
    ], 
    "Slyke": [
        "NNP"
    ], 
    "actuated": [
        "VBN"
    ], 
    "letdown": [
        "NN"
    ], 
    "electromagnets": [
        "NNS"
    ], 
    "Sure-sure": [
        "JJ"
    ], 
    "sterno-cleido": [
        "NN"
    ], 
    "schoolbooks": [
        "NNS"
    ], 
    "doorman": [
        "NN"
    ], 
    "Grafin": [
        "NNP"
    ], 
    "Grafil": [
        "NNP"
    ], 
    "buckles": [
        "NNS"
    ], 
    "Confirmation": [
        "NN"
    ], 
    "Lehtinen": [
        "NNP"
    ], 
    "accouterments": [
        "NNS"
    ], 
    "Doronfeld": [
        "NNP"
    ], 
    "impaling": [
        "VBG"
    ], 
    "Barataria": [
        "NNP"
    ], 
    "enlistment": [
        "NN"
    ], 
    "swarthy": [
        "JJ"
    ], 
    "manageability": [
        "NN"
    ], 
    "babies": [
        "NNS"
    ], 
    "nonphysical": [
        "JJ"
    ], 
    "Appleby": [
        "NNP"
    ], 
    "re-incorporation": [
        "NN"
    ], 
    "Taper": [
        "NNP"
    ], 
    "Ranieri": [
        "NNP"
    ], 
    "wholewheat": [
        "JJ"
    ], 
    "Biggio": [
        "NNP"
    ], 
    "Taped": [
        "VBN"
    ], 
    "Peking": [
        "NNP"
    ], 
    "stiffs": [
        "NNS"
    ], 
    "speech-making": [
        "NN"
    ], 
    "pioneers": [
        "NNS"
    ], 
    "wives": [
        "NNS"
    ], 
    "J.J.": [
        "NNP"
    ], 
    "RJR": [
        "NNP"
    ], 
    "stupendous": [
        "JJ"
    ], 
    "kwhr": [
        "NN"
    ], 
    "ventricles": [
        "NNS"
    ], 
    "hair-growing": [
        "JJ"
    ], 
    "IOCSIXF": [
        "NN"
    ], 
    "IOCSIXG": [
        "NN"
    ], 
    "subpoena": [
        "NN", 
        "FW", 
        "VB"
    ], 
    "spearheading": [
        "VBG"
    ], 
    "juridical": [
        "JJ"
    ], 
    "misrepresents": [
        "VBZ"
    ], 
    "fittest": [
        "JJS"
    ], 
    "halfhearted": [
        "JJ"
    ], 
    "adagios": [
        "NNS"
    ], 
    "British-American": [
        "NNP", 
        "JJ"
    ], 
    "Buxtehude": [
        "NNP"
    ], 
    "high-rated": [
        "JJ"
    ], 
    "forsaken": [
        "VBN"
    ], 
    "forsakes": [
        "VBZ"
    ], 
    "life-saving": [
        "JJ"
    ], 
    "deductable": [
        "JJ"
    ], 
    "ungovernable": [
        "JJ"
    ], 
    "plight": [
        "NN"
    ], 
    "caregiver": [
        "NN"
    ], 
    "cellophane": [
        "NN"
    ], 
    "charter-boat": [
        "NN"
    ], 
    "agricultural-research": [
        "JJ"
    ], 
    "Geertz": [
        "NNP"
    ], 
    "HUD-related": [
        "JJ"
    ], 
    "ground-floor": [
        "JJ"
    ], 
    "irradiated": [
        "VBN", 
        "JJ"
    ], 
    "Ligne": [
        "NNP"
    ], 
    "Halebian": [
        "NNP"
    ], 
    "Waltham": [
        "NNP"
    ], 
    "thickening": [
        "VBG"
    ], 
    "Framework": [
        "NNP"
    ], 
    "collections": [
        "NNS"
    ], 
    "delinquents": [
        "NNS"
    ], 
    "Marrill": [
        "NNP"
    ], 
    "contribued": [
        "VBD"
    ], 
    "self-inflicted": [
        "JJ"
    ], 
    "ON": [
        "IN", 
        "RP", 
        "NNP"
    ], 
    "Aeneid": [
        "NNP"
    ], 
    "zero-magnitude": [
        "NN"
    ], 
    "birth": [
        "NN"
    ], 
    "Oceana": [
        "NNP"
    ], 
    "massively": [
        "RB"
    ], 
    "Taksim": [
        "NNP"
    ], 
    "Braving": [
        "VBG"
    ], 
    "articulated": [
        "VBN"
    ], 
    "tapering": [
        "VBG"
    ], 
    "Ingeniera": [
        "NNP"
    ], 
    "de-listed": [
        "VBN"
    ], 
    "Behind": [
        "IN", 
        "NNP", 
        "RB"
    ], 
    "pavement": [
        "NN"
    ], 
    "abscesses": [
        "NNS"
    ], 
    "DEALERS": [
        "NNPS"
    ], 
    "people": [
        "NNS", 
        "NN"
    ], 
    "Pharmacy": [
        "NNP"
    ], 
    "Tropical": [
        "NNP"
    ], 
    "Toensing": [
        "NNP"
    ], 
    "warring": [
        "VBG"
    ], 
    "aspen": [
        "NN", 
        "JJ"
    ], 
    "Shirer": [
        "NNP"
    ], 
    "gasps": [
        "NNS"
    ], 
    "sociology": [
        "NN"
    ], 
    "Quarry": [
        "NNP"
    ], 
    "hulks": [
        "NNS"
    ], 
    "Baum": [
        "NNP"
    ], 
    "Prolusion": [
        "NNP"
    ], 
    "Withdrawals": [
        "NNS"
    ], 
    "impulsively": [
        "RB"
    ], 
    "tarantara": [
        "NN"
    ], 
    "consummately": [
        "RB"
    ], 
    "serpents": [
        "NNS"
    ], 
    "a-raising": [
        "VBG"
    ], 
    "germinate": [
        "VBP"
    ], 
    "Keith": [
        "NNP"
    ], 
    "Royce": [
        "NNP"
    ], 
    "pinched": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "INFORMATION": [
        "NNP", 
        "NN"
    ], 
    "Naess": [
        "NNP"
    ], 
    "Didi": [
        "NNP"
    ], 
    "specialty-machinery": [
        "NN"
    ], 
    "Hauling": [
        "VBG"
    ], 
    "Thing": [
        "NNP", 
        "NN"
    ], 
    "Practices": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "shifting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "pinches": [
        "NNS"
    ], 
    "brokerage": [
        "NN"
    ], 
    "Think": [
        "VBP", 
        "VB", 
        "NNP"
    ], 
    "insinuations": [
        "NNS"
    ], 
    "Snatching": [
        "VBG"
    ], 
    "derailed": [
        "VBD", 
        "VBN"
    ], 
    "Celanese": [
        "NNP"
    ], 
    "rebuffed": [
        "VBN", 
        "VBD"
    ], 
    "Ichi": [
        "NNP"
    ], 
    "Bronson": [
        "NNP"
    ], 
    "despair": [
        "NN", 
        "VB"
    ], 
    "repellent": [
        "JJ", 
        "NN"
    ], 
    "spins": [
        "VBZ"
    ], 
    "Shake": [
        "VB"
    ], 
    "sarakin": [
        "FW"
    ], 
    "Strength": [
        "NN", 
        "NNP"
    ], 
    "Summers": [
        "NNP"
    ], 
    "dashboards": [
        "NNS"
    ], 
    "Occasional": [
        "JJ", 
        "NNP"
    ], 
    "Misses": [
        "NNPS"
    ], 
    "fixed-price": [
        "JJ"
    ], 
    "Hirschman": [
        "NNP"
    ], 
    "attrition": [
        "NN"
    ], 
    "reducing": [
        "VBG", 
        "NN"
    ], 
    "Repligen": [
        "NNP"
    ], 
    "ownerships": [
        "NNS"
    ], 
    "Ali": [
        "NNP"
    ], 
    "panorama": [
        "NN"
    ], 
    "Paestum": [
        "NNP"
    ], 
    "vinegar": [
        "NN"
    ], 
    "Wichita": [
        "NNP"
    ], 
    "common-law": [
        "JJ", 
        "NN"
    ], 
    "Amaury": [
        "NNP"
    ], 
    "Ogura": [
        "NNP"
    ], 
    "thrips": [
        "NN"
    ], 
    "happy": [
        "JJ"
    ], 
    "alloys": [
        "NNS"
    ], 
    "fascination": [
        "NN"
    ], 
    "grokking": [
        "VBG"
    ], 
    "Completing": [
        "VBG"
    ], 
    "Dentistry": [
        "NNP"
    ], 
    "conclusively": [
        "RB"
    ], 
    "Dabney": [
        "NNP"
    ], 
    "gripes": [
        "NNS", 
        "VBZ"
    ], 
    "Boole": [
        "NNP"
    ], 
    "hemisphere": [
        "NN"
    ], 
    "melanin": [
        "NN"
    ], 
    "materals": [
        "NNS"
    ], 
    "silliness": [
        "NN"
    ], 
    "mirthless": [
        "JJ"
    ], 
    "Reductions": [
        "NNS"
    ], 
    "antiCommunist": [
        "JJ"
    ], 
    "peso": [
        "NN"
    ], 
    "pest": [
        "NN", 
        "JJS"
    ], 
    "pontificate": [
        "VB"
    ], 
    "panels": [
        "NNS"
    ], 
    "five-inch": [
        "JJ"
    ], 
    "Mancuso": [
        "NNP", 
        "NN"
    ], 
    "juvenile": [
        "JJ", 
        "NN"
    ], 
    "liberal": [
        "JJ", 
        "NN"
    ], 
    "Variety": [
        "NNP"
    ], 
    "Dixiecrats": [
        "NNS"
    ], 
    "tournament": [
        "NN"
    ], 
    "muscatel": [
        "NN"
    ], 
    "Zuercher": [
        "NNP"
    ], 
    "Raimondo": [
        "NNP"
    ], 
    "exist": [
        "VB", 
        "VBP", 
        "NNP"
    ], 
    "obligations": [
        "NNS"
    ], 
    "accounting": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "provisons": [
        "NNS"
    ], 
    "supporters": [
        "NNS"
    ], 
    "solicitation": [
        "NN"
    ], 
    "dotted": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Gherlein": [
        "NNP"
    ], 
    "ROBERT": [
        "NNP"
    ], 
    "Beismortier": [
        "NNP"
    ], 
    "Hennessy": [
        "NNP"
    ], 
    "Nolan": [
        "NNP"
    ], 
    "deep-seated": [
        "JJ"
    ], 
    "dissimiliar": [
        "JJ"
    ], 
    "Ceramics": [
        "NNPS"
    ], 
    "disastrously": [
        "RB"
    ], 
    "Shuwa": [
        "NNP"
    ], 
    "Reinforcing": [
        "VBG"
    ], 
    "nondriver": [
        "NN"
    ], 
    "invested": [
        "VBN", 
        "VBN|JJ", 
        "VBD"
    ], 
    "persecution": [
        "NN"
    ], 
    "Barberini": [
        "NNP"
    ], 
    "anti-white": [
        "JJ"
    ], 
    "Carpathians": [
        "NNPS"
    ], 
    "Jutish": [
        "JJ"
    ], 
    "Stirring": [
        "VBG"
    ], 
    "spades": [
        "NNS"
    ], 
    "deformational": [
        "JJ"
    ], 
    "sniffed": [
        "VBD"
    ], 
    "Ellsworth": [
        "NNP"
    ], 
    "Aureliano": [
        "NNP"
    ], 
    "DevelopMate": [
        "NNP"
    ], 
    "goaded": [
        "VBD", 
        "VBN"
    ], 
    "McKid": [
        "NNP"
    ], 
    "Steinhart": [
        "NNP"
    ], 
    "fares": [
        "NNS", 
        "NN", 
        "VBZ"
    ], 
    "novelty": [
        "NN"
    ], 
    "Indians": [
        "NNPS", 
        "NNP"
    ], 
    "Glauber": [
        "NNP"
    ], 
    "avalanche": [
        "NN"
    ], 
    "anti-airline-takeover": [
        "JJ"
    ], 
    "gallbladder": [
        "NN"
    ], 
    "Indiana": [
        "NNP"
    ], 
    "Falkland": [
        "NNP"
    ], 
    "Plump": [
        "JJ"
    ], 
    "cupped": [
        "VBD", 
        "JJ"
    ], 
    "rousing": [
        "JJ", 
        "NN"
    ], 
    "Truckers": [
        "NNS"
    ], 
    "indolent": [
        "JJ"
    ], 
    "behave": [
        "VB", 
        "VBP"
    ], 
    "Lighting": [
        "NNP", 
        "VBG", 
        "NN"
    ], 
    "veterans": [
        "NNS"
    ], 
    "Hnilica": [
        "NNP"
    ], 
    "single-employer": [
        "JJ", 
        "NN"
    ], 
    "prepaid": [
        "JJ", 
        "VBN", 
        "VB"
    ], 
    "Scranton": [
        "NNP"
    ], 
    "refinance": [
        "VB"
    ], 
    "SunAmerica": [
        "NNP"
    ], 
    "mourn": [
        "VB"
    ], 
    "servicing": [
        "NN", 
        "VBG"
    ], 
    "Seko": [
        "NNP"
    ], 
    "sun-browned": [
        "JJ"
    ], 
    "Experimental": [
        "JJ"
    ], 
    "fire-resistant": [
        "JJ"
    ], 
    "wondrously": [
        "RB"
    ], 
    "Dugan": [
        "NNP"
    ], 
    "short-range": [
        "JJ"
    ], 
    "solves": [
        "VBZ"
    ], 
    "Northeastern": [
        "JJ", 
        "NNP"
    ], 
    "corporate-identity": [
        "JJ"
    ], 
    "Intelogic": [
        "NNP"
    ], 
    "Aeromexico": [
        "NNP"
    ], 
    "solved": [
        "VBN", 
        "VBD"
    ], 
    "Quigley": [
        "NNP"
    ], 
    "Cantonese": [
        "NNP", 
        "JJ"
    ], 
    "Subsidizing": [
        "VBG"
    ], 
    "Tables": [
        "NNS"
    ], 
    "officiate": [
        "VB"
    ], 
    "Marmi": [
        "NNP"
    ], 
    "steaks": [
        "NNS"
    ], 
    "Bldg.": [
        "NNP"
    ], 
    "Hingham": [
        "NNP"
    ], 
    "erotic": [
        "JJ"
    ], 
    "anti-androgen": [
        "JJ"
    ], 
    "Dellums": [
        "NNP"
    ], 
    "Tricia": [
        "NNP"
    ], 
    "cleanliness": [
        "NN"
    ], 
    "Brumidi-Costaggini": [
        "NNP"
    ], 
    "crackpot": [
        "NN"
    ], 
    "current": [
        "JJ", 
        "NN"
    ], 
    "extraterrestrial": [
        "JJ"
    ], 
    "whipcracking": [
        "NN"
    ], 
    "Crowell": [
        "NNP"
    ], 
    "all-powerful": [
        "JJ"
    ], 
    "Cays": [
        "NNP"
    ], 
    "drewe": [
        "VBD"
    ], 
    "tough-looking": [
        "JJ"
    ], 
    "Machold": [
        "NNP"
    ], 
    "UNION": [
        "NN", 
        "NNP"
    ], 
    "amalgam": [
        "NN"
    ], 
    "Caetani": [
        "NNP"
    ], 
    "Decca": [
        "NNP", 
        "NN"
    ], 
    "Eighties": [
        "NNP"
    ], 
    "Nynex": [
        "NNP"
    ], 
    "Godwin": [
        "NNP"
    ], 
    "government-relations": [
        "NNS"
    ], 
    "Baton": [
        "NNP"
    ], 
    "studied": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "tassels": [
        "NNS"
    ], 
    "Exegete": [
        "NNP"
    ], 
    "therein": [
        "RB"
    ], 
    "Miglia": [
        "NNP"
    ], 
    "studies": [
        "NNS", 
        "VBZ"
    ], 
    "bearable": [
        "JJ"
    ], 
    "carpets": [
        "NNS"
    ], 
    "indiscriminantly": [
        "RB"
    ], 
    "defense-budget": [
        "NN"
    ], 
    "SOYBEANS": [
        "NNS", 
        "NNPS"
    ], 
    "Rogin": [
        "NNP"
    ], 
    "properties.``": [
        "``"
    ], 
    "Alberto": [
        "NNP"
    ], 
    "Alberta": [
        "NNP"
    ], 
    "monaural": [
        "JJ"
    ], 
    "grimmest": [
        "JJS"
    ], 
    "fresher": [
        "JJR"
    ], 
    "Emanuele": [
        "NNP"
    ], 
    "Abello": [
        "NNP"
    ], 
    "predictions": [
        "NNS"
    ], 
    "public-land": [
        "JJ"
    ], 
    "Pontius": [
        "NNP"
    ], 
    "corners": [
        "NNS"
    ], 
    "Kafkaesque": [
        "JJ"
    ], 
    "One-Leg": [
        "NNP"
    ], 
    "Califon": [
        "NNP"
    ], 
    "cranked": [
        "VBD", 
        "VBN"
    ], 
    "afford": [
        "VB", 
        "VBP"
    ], 
    "apparent": [
        "JJ", 
        "NN"
    ], 
    "MD-90s": [
        "NNS"
    ], 
    "wrenches": [
        "NNS", 
        "VBZ"
    ], 
    "easiest": [
        "JJS"
    ], 
    "behalf": [
        "NN"
    ], 
    "Oum": [
        "NNP"
    ], 
    "COS.": [
        "NNP"
    ], 
    "lumberjack": [
        "NN"
    ], 
    "overloaded": [
        "VBN", 
        "JJ"
    ], 
    "cooked-over": [
        "JJ"
    ], 
    "believer": [
        "NN"
    ], 
    "believes": [
        "VBZ"
    ], 
    "God-curst": [
        "JJ"
    ], 
    "Appliances": [
        "NNPS"
    ], 
    "believed": [
        "VBD", 
        "VBN"
    ], 
    "scenics": [
        "NNS"
    ], 
    "Worth-based": [
        "JJ"
    ], 
    "O.N.": [
        "NNP"
    ], 
    "Sepulveda": [
        "NNP"
    ], 
    "Inward": [
        "NNP"
    ], 
    "teaspoons": [
        "NNS"
    ], 
    "wrenched": [
        "VBD", 
        "VBN"
    ], 
    "Bandaging": [
        "NNP"
    ], 
    "Officine": [
        "NNP"
    ], 
    "intransigent": [
        "JJ"
    ], 
    "hides": [
        "NNS", 
        "VBZ"
    ], 
    "fiche": [
        "FW"
    ], 
    "philological": [
        "JJ"
    ], 
    "agendas": [
        "NNS"
    ], 
    "uncles": [
        "NNS"
    ], 
    "deserves": [
        "VBZ"
    ], 
    "Vyacheslav": [
        "NNP"
    ], 
    "ticklebrush": [
        "NN"
    ], 
    "agave": [
        "NN"
    ], 
    "elephant": [
        "NN"
    ], 
    "Holmberg": [
        "NNP"
    ], 
    "parameter": [
        "NN"
    ], 
    "Newlywed": [
        "NNP"
    ], 
    "belongs": [
        "VBZ"
    ], 
    "snaps": [
        "VBZ"
    ], 
    "Aeroquip": [
        "NNP"
    ], 
    "EQU": [
        "NN"
    ], 
    "blasting": [
        "VBG", 
        "JJ"
    ], 
    "transportation-cost": [
        "JJ"
    ], 
    "rehabilitate": [
        "VB"
    ], 
    "Managua": [
        "NNP"
    ], 
    "overfunding": [
        "NN"
    ], 
    "date": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Become": [
        "VB"
    ], 
    "data": [
        "NNS", 
        "NN|NNS", 
        "NNS|NN", 
        "NN"
    ], 
    "Shandong": [
        "NNP"
    ], 
    "Yoshihashi": [
        "NNP"
    ], 
    "sectors": [
        "NNS"
    ], 
    "interest-sensitive": [
        "JJ"
    ], 
    "aseptically": [
        "RB"
    ], 
    "approximation": [
        "NN"
    ], 
    "applicant": [
        "NN"
    ], 
    "sclerosis": [
        "NN"
    ], 
    "yielding": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Catching": [
        "VBG"
    ], 
    "definitions": [
        "NNS"
    ], 
    "quatrain": [
        "NN"
    ], 
    "scents": [
        "NNS"
    ], 
    "wavelengths": [
        "NNS"
    ], 
    "debt-coverage": [
        "JJ"
    ], 
    "unfavorably": [
        "RB"
    ], 
    "haute": [
        "FW", 
        "JJ"
    ], 
    "unacceptable": [
        "JJ"
    ], 
    "Leaguers": [
        "NNP", 
        "NNPS"
    ], 
    "bibulous": [
        "JJ"
    ], 
    "unacceptably": [
        "RB"
    ], 
    "ungentlemanly": [
        "JJ"
    ], 
    "unfavorable": [
        "JJ"
    ], 
    "stills": [
        "NNS"
    ], 
    "Clemson": [
        "NNP"
    ], 
    "Shaw": [
        "NNP"
    ], 
    "solitary": [
        "JJ", 
        "NN"
    ], 
    "Karalis": [
        "NNP"
    ], 
    "Zolo": [
        "NNP"
    ], 
    "lackluster": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "bagels": [
        "NNS"
    ], 
    "Unlimited": [
        "NNP", 
        "JJ"
    ], 
    "covertly": [
        "RB"
    ], 
    "creations": [
        "NNS"
    ], 
    "orchestrating": [
        "VBG"
    ], 
    "Rafeedie": [
        "NNP"
    ], 
    "Persky": [
        "NNP"
    ], 
    "decades": [
        "NNS"
    ], 
    "into": [
        "IN", 
        "RP"
    ], 
    "Amin": [
        "NNP"
    ], 
    "stabilizers": [
        "NNS"
    ], 
    "three-family": [
        "JJ"
    ], 
    "matches": [
        "VBZ", 
        "NNS"
    ], 
    "cholesterol-reduction": [
        "NN"
    ], 
    "Socialist": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "insomnia": [
        "NN"
    ], 
    "Sherwin-Williams": [
        "NNP"
    ], 
    "Langer": [
        "NNP"
    ], 
    "records": [
        "NNS", 
        "VBZ"
    ], 
    "Socialism": [
        "NN", 
        "NNP"
    ], 
    "six-week": [
        "JJ"
    ], 
    "arriving": [
        "VBG"
    ], 
    "in-laws": [
        "NNS"
    ], 
    "non-brain": [
        "JJ"
    ], 
    "runners": [
        "NNS"
    ], 
    "matched": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "revery": [
        "NN"
    ], 
    "Newest": [
        "JJS"
    ], 
    "revert": [
        "VB", 
        "VBP"
    ], 
    "McCrory": [
        "NNP"
    ], 
    "wetness": [
        "NN"
    ], 
    "bowling": [
        "NN", 
        "VBG"
    ], 
    "target-hunting": [
        "JJ"
    ], 
    "manors": [
        "NNS"
    ], 
    "workman": [
        "NN"
    ], 
    "sex-manuals": [
        "NNS"
    ], 
    "Richmond-area": [
        "JJ"
    ], 
    "ALCOHOL": [
        "NNP"
    ], 
    "whosoever": [
        "WP"
    ], 
    "Snyder": [
        "NNP"
    ], 
    "bovine": [
        "JJ", 
        "NN"
    ], 
    "low-wage": [
        "JJ"
    ], 
    "Calderone": [
        "NNP"
    ], 
    "Habicht": [
        "NNP"
    ], 
    "Ferraros": [
        "NNPS"
    ], 
    "revises": [
        "VBZ"
    ], 
    "Shah": [
        "NNP"
    ], 
    "giddy": [
        "JJ"
    ], 
    "Eire": [
        "NNP", 
        "NN"
    ], 
    "canvas": [
        "NN"
    ], 
    "workaholic": [
        "NN", 
        "JJ"
    ], 
    "Anwar": [
        "NN"
    ], 
    "top-performing": [
        "JJ"
    ], 
    "methylene": [
        "NN"
    ], 
    "unreleasable": [
        "JJ"
    ], 
    "Emission": [
        "NN"
    ], 
    "Hollis": [
        "NNP"
    ], 
    "sibilant": [
        "JJ", 
        "NN"
    ], 
    "suggesting": [
        "VBG"
    ], 
    "linguine": [
        "NN"
    ], 
    "bordering": [
        "VBG"
    ], 
    "flurries": [
        "NNS"
    ], 
    "clustering": [
        "VBG", 
        "NN"
    ], 
    "joiners": [
        "NNS"
    ], 
    "Braille": [
        "NNP"
    ], 
    "treaty-making": [
        "NN"
    ], 
    "possibility": [
        "NN"
    ], 
    "untidiness": [
        "NN"
    ], 
    "KOFY-FM": [
        "NNP"
    ], 
    "intensely": [
        "RB"
    ], 
    "Aye-yah-ah-ah": [
        "UH"
    ], 
    "huskiness": [
        "NN"
    ], 
    "toned": [
        "VBN"
    ], 
    "Bruyette": [
        "NNP"
    ], 
    "Monet": [
        "NNP"
    ], 
    "Monex": [
        "NNP"
    ], 
    "Money": [
        "NNP", 
        "NN"
    ], 
    "thunderclaps": [
        "NNS"
    ], 
    "Jeffry": [
        "NNP"
    ], 
    "grinder": [
        "NN"
    ], 
    "story-book": [
        "NN"
    ], 
    "livable": [
        "JJ"
    ], 
    "Euro-pillows": [
        "NNS"
    ], 
    "Hovarter": [
        "NNP"
    ], 
    "Monel": [
        "NNP"
    ], 
    "famine-relief": [
        "NN"
    ], 
    "Sanford": [
        "NNP"
    ], 
    "Tailback": [
        "NNP"
    ], 
    "now-purged": [
        "JJ"
    ], 
    "Blanco": [
        "NNP"
    ], 
    "Conradie": [
        "NNP"
    ], 
    "hair-raising": [
        "JJ"
    ], 
    "nested": [
        "VBN", 
        "VBD"
    ], 
    "vote": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "nester": [
        "NN"
    ], 
    "Blancs": [
        "NNP"
    ], 
    "intermolecular": [
        "JJ"
    ], 
    "Benington": [
        "NNP"
    ], 
    "merger-related": [
        "JJ"
    ], 
    "phonetics": [
        "NNS"
    ], 
    "Franco-German": [
        "NNP"
    ], 
    "survivability": [
        "NN"
    ], 
    "Garza": [
        "NNP"
    ], 
    "Spagna": [
        "FW"
    ], 
    "Uses": [
        "NNS"
    ], 
    "six-lane": [
        "JJ"
    ], 
    "Homestake": [
        "NNP"
    ], 
    "Petruzzi": [
        "NNP"
    ], 
    "debt-servicing": [
        "NN"
    ], 
    "dealmakers": [
        "NNS"
    ], 
    "Grandson": [
        "NNP"
    ], 
    "white-stucco": [
        "JJ"
    ], 
    "Aircoa": [
        "NNP"
    ], 
    "Haskayne": [
        "NNP"
    ], 
    "boomtown": [
        "NN"
    ], 
    "space-rocket": [
        "NN"
    ], 
    "padding": [
        "NN", 
        "VBG"
    ], 
    "redoubled": [
        "VBN", 
        "VBD"
    ], 
    "Northwest-Skinner": [
        "NNP"
    ], 
    "Sept": [
        "NNP"
    ], 
    "offocus": [
        "NN"
    ], 
    "High-priced": [
        "JJ"
    ], 
    "Embarrassed": [
        "JJ"
    ], 
    "encrypting": [
        "VBG"
    ], 
    "exacted": [
        "VBD"
    ], 
    "Titan": [
        "NNP"
    ], 
    "non-members": [
        "NNS"
    ], 
    "Emmerich": [
        "NNP"
    ], 
    "Alejandro": [
        "NNP"
    ], 
    "future": [
        "NN", 
        "JJ"
    ], 
    "Trump-watchers": [
        "NNS"
    ], 
    "opens": [
        "VBZ"
    ], 
    "Holynskyj": [
        "NNP"
    ], 
    "cavalier": [
        "JJ"
    ], 
    "financings": [
        "NNS"
    ], 
    "prospect": [
        "NN"
    ], 
    "FLIGHT": [
        "NN"
    ], 
    "tasted": [
        "VBD", 
        "VBN"
    ], 
    "round-faced": [
        "JJ"
    ], 
    "tastes": [
        "NNS", 
        "VBZ"
    ], 
    "Inquiry": [
        "NNP"
    ], 
    "lurking": [
        "VBG"
    ], 
    "dragooned": [
        "VBD"
    ], 
    "hand-carved": [
        "JJ"
    ], 
    "serials": [
        "NNS"
    ], 
    "sanctimonious": [
        "JJ"
    ], 
    "LeRoy": [
        "NNP"
    ], 
    "undercover": [
        "JJ"
    ], 
    "Aspin": [
        "NNP"
    ], 
    "take": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "vandals": [
        "NNS"
    ], 
    "convulsive": [
        "JJ"
    ], 
    "long-life": [
        "JJ"
    ], 
    "altered": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Galant": [
        "NNP"
    ], 
    "Katutura": [
        "NNP"
    ], 
    "candidly": [
        "RB"
    ], 
    "Kerr": [
        "NNP"
    ], 
    "transpirating": [
        "VBG"
    ], 
    "Kern": [
        "NNP"
    ], 
    "standard-bearer": [
        "NN"
    ], 
    "Rogaine": [
        "NNP"
    ], 
    "Radames": [
        "NNP"
    ], 
    "Belin": [
        "NNP"
    ], 
    "Settled": [
        "VBN"
    ], 
    "Portuguese": [
        "JJ", 
        "NNP"
    ], 
    "enamel": [
        "NN"
    ], 
    "ex-convict": [
        "NN"
    ], 
    "French-government-owned": [
        "JJ"
    ], 
    "occidental": [
        "JJ"
    ], 
    "Mame": [
        "NNP"
    ], 
    "AK-47": [
        "NNP"
    ], 
    "Swingin": [
        "NNP"
    ], 
    "Strip": [
        "NNP", 
        "VB"
    ], 
    "affirmed": [
        "VBD", 
        "VBN"
    ], 
    "Hereby": [
        "RB"
    ], 
    "surplus": [
        "NN", 
        "JJ"
    ], 
    "Kurland": [
        "NNP"
    ], 
    "consumption-tax": [
        "NN"
    ], 
    "mince": [
        "VB"
    ], 
    "Hamilton-Dorgan": [
        "NNP"
    ], 
    "LAWYER": [
        "NN"
    ], 
    "realists": [
        "NNS"
    ], 
    "unkind": [
        "JJ"
    ], 
    "ready-to-eat": [
        "JJ"
    ], 
    "robs": [
        "VBZ"
    ], 
    "Greek-Canadian": [
        "JJ"
    ], 
    "Fraga": [
        "NNP"
    ], 
    "ALLOWED": [
        "VBD"
    ], 
    "robe": [
        "NN"
    ], 
    "clawing": [
        "VBG"
    ], 
    "Real-estate": [
        "NN"
    ], 
    "charmed": [
        "VBN", 
        "VBD"
    ], 
    "sweet-smelling": [
        "JJ"
    ], 
    "morphological": [
        "JJ"
    ], 
    "Lexington": [
        "NNP", 
        "NN"
    ], 
    "countered": [
        "VBD", 
        "VBN"
    ], 
    "breakfast-table": [
        "NN"
    ], 
    "cursing": [
        "VBG", 
        "NN"
    ], 
    "Kiowa": [
        "NNP"
    ], 
    "Farmingdale": [
        "NNP"
    ], 
    "Products": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Ta-Hu-Wa-Hu-Wai": [
        "NNP"
    ], 
    "Sikhs": [
        "NNPS"
    ], 
    "literal-minded": [
        "JJ"
    ], 
    "Givers": [
        "NNP"
    ], 
    "assimilate": [
        "VB"
    ], 
    "Madsen": [
        "NNP"
    ], 
    "neutralist": [
        "JJ", 
        "NN"
    ], 
    "nociceptive": [
        "JJ"
    ], 
    "neutralism": [
        "NN"
    ], 
    "liable": [
        "JJ"
    ], 
    "Kassem": [
        "NNP"
    ], 
    "disparage": [
        "VB"
    ], 
    "surgeries": [
        "NNS"
    ], 
    "gout": [
        "NN"
    ], 
    "raged": [
        "VBD", 
        "VBN"
    ], 
    "dived": [
        "VBD", 
        "VBN"
    ], 
    "Specifically": [
        "RB"
    ], 
    "cheesecloth": [
        "NN"
    ], 
    "BOARD": [
        "NNP"
    ], 
    "Goldwag": [
        "NNP"
    ], 
    "surgery": [
        "NN"
    ], 
    "Ravencroft": [
        "NNP"
    ], 
    "diver": [
        "NN"
    ], 
    "Tirello": [
        "NNP"
    ], 
    "rages": [
        "VBZ", 
        "NNS"
    ], 
    "bugler": [
        "NN"
    ], 
    "gastrointestinal": [
        "JJ"
    ], 
    "thease": [
        "NN"
    ], 
    "Zafris": [
        "NNP"
    ], 
    "Librium": [
        "NNP"
    ], 
    "Vandenberg": [
        "NNP"
    ], 
    "Audiovisual": [
        "NNP"
    ], 
    "high-net": [
        "NN"
    ], 
    "discount-rate": [
        "JJ"
    ], 
    "vote-loser": [
        "NN"
    ], 
    "Mather": [
        "NNP"
    ], 
    "Determining": [
        "VBG"
    ], 
    "affecting": [
        "VBG"
    ], 
    "Primakov": [
        "NNP"
    ], 
    "Keeling": [
        "NNP"
    ], 
    "Bible": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Velon": [
        "NNP"
    ], 
    "charmer": [
        "NN"
    ], 
    "supermarket": [
        "NN"
    ], 
    "HLTs": [
        "NNS"
    ], 
    "rapacious": [
        "JJ"
    ], 
    "jovial": [
        "JJ"
    ], 
    "jaunts": [
        "NNS"
    ], 
    "hit-run": [
        "NN"
    ], 
    "demonetized": [
        "VBN"
    ], 
    "Hodgkin": [
        "NNP"
    ], 
    "second-worst": [
        "JJ"
    ], 
    "shit-sick": [
        "JJ"
    ], 
    "necropsy": [
        "NN"
    ], 
    "Citation": [
        "NNP"
    ], 
    "Worms": [
        "NNPS", 
        "NNP"
    ], 
    "Glynis": [
        "NNP"
    ], 
    "loudly": [
        "RB"
    ], 
    "Cornelius": [
        "NNP"
    ], 
    "expression": [
        "NN"
    ], 
    "Mollie": [
        "NNP"
    ], 
    "Liber": [
        "NNP"
    ], 
    "ants": [
        "NNS"
    ], 
    "homosexuality": [
        "NN"
    ], 
    "stereophonic": [
        "JJ"
    ], 
    "anti": [
        "IN", 
        "NN"
    ], 
    "Libel": [
        "NNP"
    ], 
    "ante": [
        "NN", 
        "FW", 
        "VB"
    ], 
    "human-sounding": [
        "JJ"
    ], 
    "thick-skulled": [
        "JJ"
    ], 
    "contingent-fee": [
        "JJ"
    ], 
    "combines": [
        "VBZ", 
        "NNS"
    ], 
    "booms": [
        "NNS", 
        "VBZ"
    ], 
    "teddy": [
        "NN"
    ], 
    "breath": [
        "NN", 
        "VB"
    ], 
    "combined": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "lowincome": [
        "JJ"
    ], 
    "Signor": [
        "NNP"
    ], 
    "Plus-one": [
        "JJ"
    ], 
    "squinted": [
        "VBD", 
        "VBN"
    ], 
    "Distressed": [
        "JJ"
    ], 
    "influence": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Torrence": [
        "NNP"
    ], 
    "sturdily": [
        "RB"
    ], 
    "Rotary": [
        "NNP"
    ], 
    "administrator": [
        "NN"
    ], 
    "Agatha": [
        "NNP"
    ], 
    "rematches": [
        "NNS"
    ], 
    "globally": [
        "RB"
    ], 
    "blowfish": [
        "NN"
    ], 
    "Honshu": [
        "NNP"
    ], 
    "shanty": [
        "NN"
    ], 
    "Wedd": [
        "NNP"
    ], 
    "disbelieve": [
        "VB"
    ], 
    "vote-getters": [
        "NNS"
    ], 
    "COMMUNICATIONS": [
        "NNPS", 
        "NNP"
    ], 
    "newspaperman": [
        "NN"
    ], 
    "Doctrine": [
        "NNP", 
        "NN"
    ], 
    "curricula": [
        "NNS"
    ], 
    "girth": [
        "NN"
    ], 
    "malevolencies": [
        "NNS"
    ], 
    "brow": [
        "NN"
    ], 
    "Jolt": [
        "NNP", 
        "VB"
    ], 
    "brok": [
        "VBD"
    ], 
    "M.D": [
        "NNP"
    ], 
    "Ilyushins": [
        "NNPS"
    ], 
    "three-second": [
        "JJ"
    ], 
    "shuts": [
        "VBZ", 
        "NNS"
    ], 
    "funds-service": [
        "JJ"
    ], 
    "spiraling": [
        "VBG", 
        "JJ"
    ], 
    "Trettien": [
        "NNP"
    ], 
    "expediently": [
        "RB"
    ], 
    "Rodney-Honor": [
        "NNP"
    ], 
    "unemployed": [
        "JJ"
    ], 
    "cramming": [
        "VBG"
    ], 
    "two-year-old": [
        "JJ", 
        "NN"
    ], 
    "Bondholder": [
        "NN"
    ], 
    "unmanageably": [
        "RB"
    ], 
    "cheere": [
        "VBP"
    ], 
    "glycerolized": [
        "VBN"
    ], 
    "State-owned": [
        "JJ"
    ], 
    "Anchorage": [
        "NNP"
    ], 
    "carillons": [
        "NNS"
    ], 
    "cheers": [
        "NNS", 
        "VBZ"
    ], 
    "Birtcher": [
        "NNP"
    ], 
    "Diagnostics": [
        "NNPS"
    ], 
    "unmanageable": [
        "JJ"
    ], 
    "cheery": [
        "JJ"
    ], 
    "Kirschbaum": [
        "NNP"
    ], 
    "Silkworms": [
        "NNP"
    ], 
    "escorts": [
        "VBZ", 
        "NNS"
    ], 
    "coste": [
        "VB"
    ], 
    "Slay": [
        "VBP"
    ], 
    "flocks": [
        "NNS"
    ], 
    "antihistamine": [
        "NN"
    ], 
    "sharp-rising": [
        "JJ"
    ], 
    "Simultaneous": [
        "JJ"
    ], 
    "engulfing": [
        "VBG", 
        "JJ"
    ], 
    "genii": [
        "NN"
    ], 
    "bravura": [
        "NN", 
        "JJ"
    ], 
    "trains": [
        "NNS", 
        "VBZ"
    ], 
    "genie": [
        "NN"
    ], 
    "Soule": [
        "NNP"
    ], 
    "Slab": [
        "NN"
    ], 
    "Botswana": [
        "NNP"
    ], 
    "Mexicana": [
        "NNP"
    ], 
    "idleness": [
        "NN"
    ], 
    "barbecues": [
        "NNS"
    ], 
    "McGlothlin": [
        "NNP"
    ], 
    "mediumistic": [
        "JJ"
    ], 
    "break-down": [
        "NN"
    ], 
    "DISCOUNT": [
        "NN", 
        "NNP", 
        "JJ"
    ], 
    "Mexicans": [
        "NNPS", 
        "NNS"
    ], 
    "Daniel": [
        "NNP"
    ], 
    "Hurrays": [
        "NNP"
    ], 
    "non-binding": [
        "JJ"
    ], 
    "McGillivray": [
        "NNP"
    ], 
    "Bygdeman": [
        "NNP"
    ], 
    "barbecued": [
        "VBN"
    ], 
    "Pepper\\/Seven": [
        "NNP"
    ], 
    "blondes": [
        "NNS"
    ], 
    "Mullen": [
        "NNP"
    ], 
    "Zack": [
        "NNP"
    ], 
    "Zach": [
        "NNP"
    ], 
    "Phineoppus": [
        "NNP"
    ], 
    "near-left": [
        "NN"
    ], 
    "hereabouts": [
        "RB"
    ], 
    "Stirlen": [
        "NNP"
    ], 
    "formative": [
        "JJ", 
        "NN"
    ], 
    "lengthens": [
        "VBZ"
    ], 
    "Transgenics": [
        "NNP"
    ], 
    "Copernicus-the-astronomer": [
        "NN"
    ], 
    "Muller": [
        "NNP"
    ], 
    "Hitchcock": [
        "NNP"
    ], 
    "Cuckoo": [
        "NN"
    ], 
    "Mona": [
        "NNP"
    ], 
    "unquiet": [
        "JJ"
    ], 
    "Korra": [
        "NNP"
    ], 
    "Monk": [
        "NNP"
    ], 
    "Drake": [
        "NNP"
    ], 
    "Mis-ter": [
        "NNP"
    ], 
    "Mont": [
        "NNP"
    ], 
    "Wellman": [
        "NNP"
    ], 
    "Mony": [
        "NNP"
    ], 
    "clan": [
        "NN"
    ], 
    "clam": [
        "NN", 
        "VBP"
    ], 
    "clad": [
        "VBN", 
        "JJ"
    ], 
    "overhyped": [
        "JJ"
    ], 
    "Rabinowiczes": [
        "NNPS"
    ], 
    "yearly": [
        "JJ", 
        "RB"
    ], 
    "Muammar": [
        "NNP"
    ], 
    "Tasuku": [
        "NNP"
    ], 
    "full-scale": [
        "JJ"
    ], 
    "clay": [
        "NN"
    ], 
    "claw": [
        "NN"
    ], 
    "Cervetto": [
        "NNP"
    ], 
    "clap": [
        "NN"
    ], 
    "sewing-machine": [
        "NN"
    ], 
    "Ostrager": [
        "NNP"
    ], 
    "winds": [
        "NNS", 
        "VBZ"
    ], 
    "Brandon": [
        "NNP"
    ], 
    "yyyy": [
        "NN"
    ], 
    "all-pervading": [
        "JJ"
    ], 
    "endeavor": [
        "NN", 
        "VB"
    ], 
    "Cecchini": [
        "NNP"
    ], 
    "obviousness": [
        "NN"
    ], 
    "Piranesi": [
        "NNP"
    ], 
    "innoculation": [
        "NN"
    ], 
    "riveting": [
        "VBG", 
        "JJ"
    ], 
    "Timidly": [
        "RB"
    ], 
    "Bleckner": [
        "NNP"
    ], 
    "oblige": [
        "VB", 
        "NN"
    ], 
    "juggernaut": [
        "NN"
    ], 
    "Projects": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "state-provided": [
        "JJ"
    ], 
    "unsuccessfully": [
        "RB"
    ], 
    "philosophizing": [
        "VBG", 
        "NN"
    ], 
    "Concordance": [
        "NN"
    ], 
    "contingent": [
        "JJ", 
        "NN"
    ], 
    "confided": [
        "VBD", 
        "VBN"
    ], 
    "relented": [
        "VBD", 
        "VBN"
    ], 
    "Testifying": [
        "VBG"
    ], 
    "Awareness": [
        "NN", 
        "NNP"
    ], 
    "ration": [
        "NN"
    ], 
    "Proteins": [
        "NNPS"
    ], 
    "sprung": [
        "VBN"
    ], 
    "imminence": [
        "NN"
    ], 
    "confides": [
        "VBZ"
    ], 
    "ratios": [
        "NNS"
    ], 
    "standpoint": [
        "NN"
    ], 
    "Curzio": [
        "NNP"
    ], 
    "Chardonnays": [
        "NNPS"
    ], 
    "joyfully": [
        "RB"
    ], 
    "counterbids": [
        "NNS"
    ], 
    "fightin": [
        "VBG"
    ], 
    "evil-minded": [
        "JJ"
    ], 
    "act": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Timber": [
        "NN", 
        "NNP"
    ], 
    "Macchiarola": [
        "NNP"
    ], 
    "commercial-property": [
        "NN"
    ], 
    "curling": [
        "NN", 
        "VBG"
    ], 
    "Litz": [
        "NNP"
    ], 
    "Advancement": [
        "NNP"
    ], 
    "home-furnishings": [
        "NNS"
    ], 
    "Eppelmann": [
        "NNP"
    ], 
    "Hansen": [
        "NNP"
    ], 
    "parties": [
        "NNS", 
        "VBZ"
    ], 
    "Lite": [
        "NNP"
    ], 
    "somnolent": [
        "JJ"
    ], 
    "Pakistani": [
        "JJ", 
        "NNP"
    ], 
    "Lita": [
        "NNP"
    ], 
    "Gilhooley": [
        "NNP"
    ], 
    "blood-bought": [
        "JJ"
    ], 
    "V.E.": [
        "NNP"
    ], 
    "yeasts": [
        "NNS"
    ], 
    "Equimark": [
        "NNP"
    ], 
    "bobbing": [
        "VBG"
    ], 
    "recommends": [
        "VBZ"
    ], 
    "BORLAND": [
        "NNP"
    ], 
    "TeleVideo": [
        "NNP"
    ], 
    "Yanes": [
        "NNP"
    ], 
    "fastidious": [
        "JJ"
    ], 
    "lane": [
        "NN"
    ], 
    "McFeeley": [
        "NNP"
    ], 
    "cloned": [
        "VBN"
    ], 
    "Francais": [
        "NNP"
    ], 
    "Teniente": [
        "NNP"
    ], 
    "Guido": [
        "NNP"
    ], 
    "DRAM": [
        "NNP"
    ], 
    "Detroit-over-San": [
        "JJ"
    ], 
    "wickets": [
        "NNS"
    ], 
    "Guide": [
        "NNP", 
        "NN"
    ], 
    "buying": [
        "VBG", 
        "NN", 
        "JJ", 
        "VBG|NN"
    ], 
    "rotundity": [
        "NN"
    ], 
    "Wrigley": [
        "NNP"
    ], 
    "confessions": [
        "NNS"
    ], 
    "algorithm": [
        "NN"
    ], 
    "in-law": [
        "NN"
    ], 
    "sales-building": [
        "JJ"
    ], 
    "Won": [
        "NNP"
    ], 
    "severally": [
        "RB"
    ], 
    "Close": [
        "RB", 
        "VB", 
        "NNP", 
        "VBP", 
        "JJ"
    ], 
    "torso": [
        "NN"
    ], 
    "agree": [
        "VB", 
        "VBP"
    ], 
    "detailed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "gone": [
        "VBN", 
        "JJ", 
        "VBN|JJ"
    ], 
    "carves": [
        "VBZ"
    ], 
    "dovish": [
        "JJ"
    ], 
    "Quietism": [
        "NNP"
    ], 
    "ag": [
        "NN", 
        "JJ"
    ], 
    "Seigner": [
        "NNP"
    ], 
    "ah": [
        "UH", 
        "VBP"
    ], 
    "am": [
        "VBP", 
        "FW", 
        "RB"
    ], 
    "Amiel": [
        "NNP"
    ], 
    "Deatherage": [
        "NNP"
    ], 
    "Nacional": [
        "NNP"
    ], 
    "as": [
        "IN", 
        "NNP", 
        "JJ", 
        "RB"
    ], 
    "Becca": [
        "NNP"
    ], 
    "au": [
        "FW", 
        "NN"
    ], 
    "at": [
        "IN", 
        "VBD", 
        "RB", 
        "RP"
    ], 
    "Garrisonian": [
        "NN"
    ], 
    "ax": [
        "NN"
    ], 
    "marine-transport": [
        "NN"
    ], 
    "Quietist": [
        "NNP"
    ], 
    "carven": [
        "VBN"
    ], 
    "Serve-Air": [
        "NNP"
    ], 
    "self-referential": [
        "JJ"
    ], 
    "prosceniums": [
        "NNS"
    ], 
    "oilcloth": [
        "NN"
    ], 
    "Salamander": [
        "NNP"
    ], 
    "Machos": [
        "FW"
    ], 
    "Simpsons": [
        "NNPS"
    ], 
    "Machon": [
        "NNP"
    ], 
    "gunboats": [
        "NNS"
    ], 
    "Birenbaum": [
        "NNP"
    ], 
    "spatial": [
        "JJ"
    ], 
    "jell": [
        "VB"
    ], 
    "contemporaries": [
        "NNS"
    ], 
    "bizarrely": [
        "RB"
    ], 
    "IBRD": [
        "NNP"
    ], 
    "unrefrigerated": [
        "JJ"
    ], 
    "fluorinated": [
        "VBN"
    ], 
    "annex": [
        "NN", 
        "VB"
    ], 
    "Maier": [
        "NNP"
    ], 
    "slant": [
        "NN", 
        "VB"
    ], 
    "a.": [
        "NN"
    ], 
    "herbs": [
        "NNS"
    ], 
    "middling": [
        "JJ"
    ], 
    "Pekin": [
        "NNP"
    ], 
    "PROFITT": [
        "NNP"
    ], 
    "Sabol": [
        "NNP"
    ], 
    "mite-box": [
        "NN"
    ], 
    "Explanations": [
        "NNS"
    ], 
    "PROFITS": [
        "NNS"
    ], 
    "Retin-A": [
        "NNP"
    ], 
    "Vicar": [
        "NNP"
    ], 
    "dogleg": [
        "NN"
    ], 
    "police-community": [
        "JJ"
    ], 
    "padlock": [
        "NN"
    ], 
    "Absorbing": [
        "VBG"
    ], 
    "Twiggy": [
        "NNP"
    ], 
    "mimic": [
        "VB", 
        "VBP"
    ], 
    "cps": [
        "NNS"
    ], 
    "Vical": [
        "NNP"
    ], 
    "cpu": [
        "NN"
    ], 
    "overeager": [
        "JJ"
    ], 
    "Canada": [
        "NNP"
    ], 
    "externally": [
        "RB"
    ], 
    "instincts": [
        "NNS"
    ], 
    "asteroids": [
        "NNS"
    ], 
    "ex-Beecham": [
        "JJ"
    ], 
    "Currier": [
        "NNP"
    ], 
    "Amdahl": [
        "NNP"
    ], 
    "sugar-using": [
        "JJ"
    ], 
    "upkeep": [
        "NN"
    ], 
    "fairness": [
        "NN"
    ], 
    "revolting": [
        "JJ"
    ], 
    "Mateyo": [
        "NNP"
    ], 
    "Wickhams": [
        "NNP"
    ], 
    "caveats": [
        "NNS"
    ], 
    "disciples": [
        "NNS"
    ], 
    "pornographic": [
        "JJ"
    ], 
    "Early-morning": [
        "JJ"
    ], 
    "champions": [
        "NNS", 
        "VBZ"
    ], 
    "piddling": [
        "JJ"
    ], 
    "co-signed": [
        "JJ"
    ], 
    "dressing": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "Precious": [
        "NNP", 
        "JJ", 
        "RB"
    ], 
    "well-cut": [
        "JJ"
    ], 
    "splashing": [
        "VBG"
    ], 
    "state-produced": [
        "JJ"
    ], 
    "compromising": [
        "VBG", 
        "JJ"
    ], 
    "gemlike": [
        "JJ"
    ], 
    "fullbacking": [
        "VBG"
    ], 
    "Severence": [
        "NNP"
    ], 
    "self-experimentation": [
        "NN"
    ], 
    "purpose...": [
        ":"
    ], 
    "Kweisi": [
        "NNP"
    ], 
    "manageable": [
        "JJ"
    ], 
    "price-moving": [
        "JJ"
    ], 
    "Cockburn": [
        "NNP"
    ], 
    "`": [
        "``"
    ], 
    "Noam": [
        "NNP"
    ], 
    "Noah": [
        "NNP"
    ], 
    "accompanying": [
        "VBG", 
        "JJ"
    ], 
    "DELAYED": [
        "VBN"
    ], 
    "underclothes": [
        "NNS"
    ], 
    "dinosaur": [
        "NN"
    ], 
    "scrapping": [
        "VBG", 
        "NN"
    ], 
    "Darrell": [
        "NNP"
    ], 
    "program-driven": [
        "JJ"
    ], 
    "Chiat\\": [
        "NNP", 
        "JJ"
    ], 
    "Powless": [
        "NNP"
    ], 
    "humongous": [
        "JJ"
    ], 
    "antibiotic": [
        "NN", 
        "JJ"
    ], 
    "pretenses": [
        "NNS"
    ], 
    "two-class": [
        "JJ"
    ], 
    "Nordmann": [
        "NNP"
    ], 
    "fill-ins": [
        "NNS"
    ], 
    "nation-state": [
        "NN", 
        "JJ"
    ], 
    "Dilly": [
        "NNP"
    ], 
    "Arlin": [
        "NNP"
    ], 
    "flashback": [
        "NN"
    ], 
    "Immaculate": [
        "NNP"
    ], 
    "prime-1": [
        "NN"
    ], 
    "one-drug": [
        "JJ"
    ], 
    "poisonous": [
        "JJ"
    ], 
    "burgundy": [
        "NN"
    ], 
    "Safari": [
        "NNP"
    ], 
    "non-medical": [
        "JJ"
    ], 
    "avenues": [
        "NNS"
    ], 
    "super-user": [
        "NN"
    ], 
    "celluloses": [
        "NNS"
    ], 
    "Patronage": [
        "NN"
    ], 
    "Bureaus": [
        "NNP", 
        "NNPS"
    ], 
    "installations": [
        "NNS"
    ], 
    "Deminex": [
        "NNP"
    ], 
    "re-examines": [
        "VBZ"
    ], 
    "electronic-bomb": [
        "NN"
    ], 
    "pidgin": [
        "NN", 
        "JJ"
    ], 
    "DALIS": [
        "NNPS"
    ], 
    "Fireside\\/Simon": [
        "NNP"
    ], 
    "dreamlessly": [
        "RB"
    ], 
    "non-performing": [
        "JJ"
    ], 
    "dramatist": [
        "NN"
    ], 
    "backlash": [
        "NN"
    ], 
    "squashy": [
        "JJ"
    ], 
    "mudslinging": [
        "NN"
    ], 
    "Planet": [
        "NNP", 
        "NN"
    ], 
    "ultra-safe": [
        "JJ"
    ], 
    "Westendorf": [
        "NNP"
    ], 
    "L-1011": [
        "NNP"
    ], 
    "Zurich": [
        "NNP", 
        "NN"
    ], 
    "Totaling": [
        "VBG"
    ], 
    "compliance": [
        "NN"
    ], 
    "Litowski": [
        "NNP"
    ], 
    "interconnected": [
        "VBN"
    ], 
    "atelier": [
        "NN"
    ], 
    "Richardson-Smith": [
        "NNP"
    ], 
    "cap-and-ball": [
        "JJ"
    ], 
    "gunfights": [
        "NNS"
    ], 
    "brimmed": [
        "VBD", 
        "VBN"
    ], 
    "Lytton": [
        "NNP"
    ], 
    "Astarte": [
        "NNP"
    ], 
    "Auf": [
        "NNP"
    ], 
    "filial": [
        "JJ"
    ], 
    "Sleepy-eyed": [
        "JJ"
    ], 
    "Aul": [
        "NNP"
    ], 
    "Cotty": [
        "NNP"
    ], 
    "conspiratorial": [
        "JJ"
    ], 
    "Pouilly-Fuisse": [
        "NNP"
    ], 
    "worry-free": [
        "JJ"
    ], 
    "intermediate-range": [
        "JJ"
    ], 
    "unbleached": [
        "JJ"
    ], 
    "Elements": [
        "NNS", 
        "NNPS"
    ], 
    "Optimists": [
        "NNS"
    ], 
    "Peat": [
        "NNP"
    ], 
    "mothers-in-law": [
        "NNS"
    ], 
    "bigness": [
        "NN"
    ], 
    "AMDAHL": [
        "NNP"
    ], 
    "Peal": [
        "NNP"
    ], 
    "Peak": [
        "NNP", 
        "JJ"
    ], 
    "Scratchard": [
        "NNP"
    ], 
    "Meaningful": [
        "JJ"
    ], 
    "Financing": [
        "NNP", 
        "VBG", 
        "NN"
    ], 
    "Canoga": [
        "NNP"
    ], 
    "contrive": [
        "VB"
    ], 
    "Philippines": [
        "NNP", 
        "NNPS"
    ], 
    "Humble": [
        "NNP"
    ], 
    "spoils": [
        "NNS"
    ], 
    "LaFalce": [
        "NNP"
    ], 
    "Slick": [
        "JJ"
    ], 
    "expansively": [
        "RB"
    ], 
    "riverbank": [
        "NN"
    ], 
    "DIOCS": [
        "NN"
    ], 
    "delphic": [
        "JJ"
    ], 
    "evolves": [
        "VBZ"
    ], 
    "Carltons": [
        "NNPS"
    ], 
    "chisel": [
        "NN", 
        "VB"
    ], 
    "Coney": [
        "NNP"
    ], 
    "indicating": [
        "VBG"
    ], 
    "evolved": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Compelled": [
        "VBN"
    ], 
    "beautiful": [
        "JJ"
    ], 
    "Denton": [
        "NNP"
    ], 
    "impacts": [
        "NNS"
    ], 
    "stated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "rustled": [
        "VBN", 
        "JJ"
    ], 
    "dislikes": [
        "VBZ", 
        "NN", 
        "NNS"
    ], 
    "moon": [
        "NN", 
        "VB"
    ], 
    "accept": [
        "VB", 
        "VBP"
    ], 
    "autumn": [
        "NN"
    ], 
    "Laban": [
        "NNP"
    ], 
    "Venezuelan": [
        "JJ", 
        "NNP"
    ], 
    "rustler": [
        "NN"
    ], 
    "elaborately": [
        "RB"
    ], 
    "McCulley": [
        "NNP"
    ], 
    "faster-spending": [
        "JJ"
    ], 
    "equities": [
        "NNS"
    ], 
    "Fulham": [
        "NNP"
    ], 
    "earnings": [
        "NNS", 
        "NN"
    ], 
    "cling": [
        "VBP", 
        "VB"
    ], 
    "Maquila": [
        "NN"
    ], 
    "telegraphic": [
        "JJ"
    ], 
    "Hanover": [
        "NNP"
    ], 
    "Correspondence": [
        "NN"
    ], 
    "BancOklahoma": [
        "NNP"
    ], 
    "expense-account": [
        "NN"
    ], 
    "Bracken": [
        "NNP"
    ], 
    "Ditka": [
        "NNP"
    ], 
    "Maxentius": [
        "NNP"
    ], 
    "re-evaluating": [
        "JJ", 
        "VBG"
    ], 
    "haggardly": [
        "RB"
    ], 
    "backyard": [
        "NN"
    ], 
    "Yastrow": [
        "NNP"
    ], 
    "unhesitant": [
        "JJ"
    ], 
    "summarization": [
        "NN"
    ], 
    "debility": [
        "NN"
    ], 
    "Authority-Garden": [
        "NNP"
    ], 
    "MANUFACTURERS": [
        "NNPS"
    ], 
    "hauling": [
        "VBG", 
        "NN"
    ], 
    "Beowulf": [
        "NNP"
    ], 
    "chemistries": [
        "NNS"
    ], 
    "pre-historic": [
        "JJ"
    ], 
    "marine-research": [
        "NN"
    ], 
    "pans": [
        "NNS", 
        "VBZ"
    ], 
    "veridical": [
        "JJ"
    ], 
    "pant": [
        "NN"
    ], 
    "Nana": [
        "NNP"
    ], 
    "pany": [
        "NN"
    ], 
    "MICRO": [
        "NNP"
    ], 
    "sinning": [
        "NN"
    ], 
    "pane": [
        "NN"
    ], 
    "Scofield": [
        "NNP"
    ], 
    "Seasonings": [
        "NNPS"
    ], 
    "Nkrumah": [
        "NNP"
    ], 
    "Alter": [
        "VB", 
        "NNP"
    ], 
    "Abbie": [
        "NNP"
    ], 
    "Collateral": [
        "NN"
    ], 
    "Seifert": [
        "NNP"
    ], 
    "Llewellyn": [
        "NNP"
    ], 
    "debilitated": [
        "VBN", 
        "JJ"
    ], 
    "decision-maker": [
        "NN"
    ], 
    "deeds": [
        "NNS", 
        "VBZ"
    ], 
    "urbanization": [
        "NN"
    ], 
    "MD11": [
        "NNP"
    ], 
    "ocean-shipping": [
        "NN"
    ], 
    "hysterectomy": [
        "NN"
    ], 
    "nonparticulate": [
        "NN"
    ], 
    "rigids": [
        "NNS"
    ], 
    "VandenBerg": [
        "NNP"
    ], 
    "lineback": [
        "NN"
    ], 
    "consign": [
        "VB"
    ], 
    "iridescent": [
        "JJ"
    ], 
    "Experimentally": [
        "RB"
    ], 
    "Gerhard": [
        "NNP"
    ], 
    "Creative": [
        "NNP", 
        "JJ"
    ], 
    "Partnerships": [
        "NNS"
    ], 
    "Alcibiades": [
        "NNP"
    ], 
    "be-thonged": [
        "JJ"
    ], 
    "judgeships": [
        "NNS"
    ], 
    "real-estate": [
        "NN", 
        "JJ"
    ], 
    "Menet": [
        "NNP"
    ], 
    "Newton": [
        "NNP"
    ], 
    "truths": [
        "NNS"
    ], 
    "impugning": [
        "VBG"
    ], 
    "Pole": [
        "NNP", 
        "NN"
    ], 
    "plurality": [
        "NN"
    ], 
    "Thanks": [
        "NNS", 
        "UH"
    ], 
    "Pola": [
        "NNP"
    ], 
    "Polo": [
        "NNP"
    ], 
    "recovery-program": [
        "NN"
    ], 
    "Poll": [
        "NNP", 
        "NN"
    ], 
    "Polk": [
        "NNP"
    ], 
    "fee-related": [
        "JJ"
    ], 
    "Menem": [
        "NNP"
    ], 
    "transforming": [
        "VBG"
    ], 
    "bends": [
        "NNS", 
        "VBZ"
    ], 
    "catalogues": [
        "NNS"
    ], 
    "Dactyls": [
        "NNPS"
    ], 
    "Balenciaga": [
        "NNP"
    ], 
    "exorbitant": [
        "JJ"
    ], 
    "Setting": [
        "VBG"
    ], 
    "fewer": [
        "JJR", 
        "RB", 
        "RBR"
    ], 
    "Peoples": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Mon-Fay": [
        "NNP"
    ], 
    "catalogued": [
        "VBN", 
        "VBD"
    ], 
    "takeing": [
        "VBG"
    ], 
    "BMC": [
        "NNP"
    ], 
    "BMA": [
        "NNP"
    ], 
    "BMI": [
        "NNP"
    ], 
    "mattered": [
        "VBD", 
        "VBN"
    ], 
    "pea-green": [
        "JJ"
    ], 
    "BMP": [
        "NN", 
        "NNP"
    ], 
    "goitrogen": [
        "NN"
    ], 
    "BMW": [
        "NNP"
    ], 
    "BMT": [
        "NNP"
    ], 
    "TREND-SETTER": [
        "NN"
    ], 
    "expiation": [
        "NN"
    ], 
    "Railroad": [
        "NNP", 
        "NN"
    ], 
    "Beckstrom": [
        "NNP"
    ], 
    "Folding": [
        "VBG"
    ], 
    "free-spending": [
        "JJ"
    ], 
    "drifting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "porcelain": [
        "NN"
    ], 
    "disheveled": [
        "JJ"
    ], 
    "Burgundies": [
        "NNPS"
    ], 
    "paucity": [
        "NN"
    ], 
    "pitfalls": [
        "NNS"
    ], 
    "proxy": [
        "NN", 
        "JJ"
    ], 
    "imagine": [
        "VB", 
        "VBP"
    ], 
    "Nonprofit": [
        "JJ"
    ], 
    "reproach": [
        "NN"
    ], 
    "Hispanic": [
        "JJ", 
        "NNP"
    ], 
    "uplands": [
        "NNS"
    ], 
    "chlorothiazide": [
        "NN"
    ], 
    "positioning": [
        "VBG", 
        "NN"
    ], 
    "Allotments": [
        "NNS"
    ], 
    "instigation": [
        "NN"
    ], 
    "bookies": [
        "NNS"
    ], 
    "Spanos": [
        "NNP"
    ], 
    "conductors": [
        "NNS"
    ], 
    "Doran": [
        "NNP"
    ], 
    "redeemded": [
        "VBN"
    ], 
    "Tabacs": [
        "NNP"
    ], 
    "waspishly": [
        "RB"
    ], 
    "corrugated": [
        "JJ", 
        "VBN"
    ], 
    "vowel": [
        "NN", 
        "JJ"
    ], 
    "protectionist": [
        "JJ", 
        "NN"
    ], 
    "thereafter": [
        "RB"
    ], 
    "preordainment": [
        "NN"
    ], 
    "slipper": [
        "NN"
    ], 
    "Services\\/Japan": [
        "NNP"
    ], 
    "Kinnett": [
        "NNP"
    ], 
    "Kagan": [
        "NNP"
    ], 
    "SMALL": [
        "NNP", 
        "JJ"
    ], 
    "Treiger": [
        "NNP"
    ], 
    "Isham": [
        "NNP"
    ], 
    "protectionism": [
        "NN"
    ], 
    "intervention...": [
        ":"
    ], 
    "unexplained": [
        "JJ"
    ], 
    "tadpoles": [
        "NNS"
    ], 
    "Courier": [
        "NNP"
    ], 
    "Hualien": [
        "NNP"
    ], 
    "Helmet": [
        "NN"
    ], 
    "erupted": [
        "VBD", 
        "VBN"
    ], 
    "Mathavious": [
        "NNP"
    ], 
    "tangency": [
        "NN"
    ], 
    "crisscrossed": [
        "VBN", 
        "VBD"
    ], 
    "sympathies": [
        "NNS"
    ], 
    "Doubts": [
        "NNS"
    ], 
    "relationship": [
        "NN"
    ], 
    "eucalyptus": [
        "NN"
    ], 
    "soft-drinks": [
        "NNS"
    ], 
    "immediate": [
        "JJ"
    ], 
    "credit-market": [
        "JJ"
    ], 
    "mishap": [
        "NN"
    ], 
    "consult": [
        "VB"
    ], 
    "focusing": [
        "VBG", 
        "NN"
    ], 
    "unprofitable": [
        "JJ"
    ], 
    "observatory": [
        "NN"
    ], 
    "Equator": [
        "NNP", 
        "NN"
    ], 
    "Jean-Pascal": [
        "NNP"
    ], 
    "professoriate": [
        "NN"
    ], 
    "computer-guided": [
        "JJ"
    ], 
    "Inhouse": [
        "JJ"
    ], 
    "drawled": [
        "VBD"
    ], 
    "PegaSys": [
        "NNP"
    ], 
    "Migs": [
        "NNS"
    ], 
    "lovelorn": [
        "JJ"
    ], 
    "less-influential": [
        "JJ"
    ], 
    "revelling": [
        "VBG"
    ], 
    "carrier-current": [
        "JJ"
    ], 
    "Sanjiv": [
        "NNP"
    ], 
    "refrigerators": [
        "NNS"
    ], 
    "fights": [
        "NNS", 
        "VBZ"
    ], 
    "well-developed": [
        "JJ"
    ], 
    "Donnay": [
        "NNP"
    ], 
    "Adverse": [
        "JJ"
    ], 
    "Donnan": [
        "NNP"
    ], 
    "Loevner": [
        "NNP"
    ], 
    "more-senior": [
        "JJR", 
        "JJ"
    ], 
    "ballerina": [
        "NN"
    ], 
    "honeybees": [
        "NNS"
    ], 
    "Kyoto": [
        "NNP"
    ], 
    "trowel": [
        "NN"
    ], 
    "Makwah": [
        "NNP"
    ], 
    "equaled": [
        "VBD", 
        "VBN"
    ], 
    "analogy": [
        "NN"
    ], 
    "chest-back-lat-shoulder": [
        "JJ"
    ], 
    "MacKinnon": [
        "NNP"
    ], 
    "fellers": [
        "NNS"
    ], 
    "civil-investigative": [
        "JJ"
    ], 
    "effecting": [
        "VBG"
    ], 
    "benefit-plan": [
        "JJ"
    ], 
    "Prentice-Hall": [
        "NNP"
    ], 
    "viscoelasticity": [
        "NN"
    ], 
    "high-rate": [
        "JJ"
    ], 
    "funnier": [
        "JJR"
    ], 
    "Tanzi": [
        "NNP"
    ], 
    "Lysol": [
        "NNP"
    ], 
    "tokens": [
        "NNS"
    ], 
    "unequal": [
        "JJ"
    ], 
    "Tomsho": [
        "NNP"
    ], 
    "covet": [
        "VB", 
        "VBP"
    ], 
    "cover": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "coves": [
        "NNS"
    ], 
    "low-stress": [
        "JJ"
    ], 
    "autofluorescence": [
        "NN"
    ], 
    "Fauntroy": [
        "NNP"
    ], 
    "Physicochemical": [
        "JJ"
    ], 
    "Swirsky": [
        "NNP"
    ], 
    "Singing": [
        "VBG", 
        "NNP"
    ], 
    "fiscal-fourth": [
        "JJ"
    ], 
    "trip-hammer": [
        "NN"
    ], 
    "notebook-size": [
        "JJ"
    ], 
    "Burnsville": [
        "NNP"
    ], 
    "Kidnaper": [
        "NN"
    ], 
    "Gridley": [
        "NNP"
    ], 
    "aghast": [
        "JJ"
    ], 
    "Mail-Order": [
        "JJ"
    ], 
    "well-endowed": [
        "JJ"
    ], 
    "Soviet-American": [
        "JJ"
    ], 
    "Melloan": [
        "NNP"
    ], 
    "Hajime": [
        "NNP"
    ], 
    "AIDS-like": [
        "JJ"
    ], 
    "electronic-quote": [
        "NN"
    ], 
    "SCUD": [
        "NNP"
    ], 
    "condos": [
        "NNS"
    ], 
    "undying": [
        "JJ"
    ], 
    "Istvan": [
        "NNP"
    ], 
    "Tagamet": [
        "NNP"
    ], 
    "Lodestar": [
        "NNP"
    ], 
    "bastion": [
        "NN"
    ], 
    "T.B.": [
        "NNP"
    ], 
    "alloted": [
        "VBN"
    ], 
    "Broomfield": [
        "NNP"
    ], 
    "Oddy": [
        "NNP"
    ], 
    "Masters": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "magicians": [
        "NNS"
    ], 
    "Stouffer": [
        "NNP"
    ], 
    "gratis": [
        "JJ", 
        "RB"
    ], 
    "Point-Pepperell": [
        "NNP"
    ], 
    "Odds": [
        "NNS", 
        "NNPS"
    ], 
    "eies": [
        "NNS"
    ], 
    "upholstery": [
        "NN"
    ], 
    "Dana-Farber": [
        "NNP"
    ], 
    "Heikes": [
        "NNP"
    ], 
    "Yaaba": [
        "NNP"
    ], 
    "Pereira": [
        "NNP"
    ], 
    "Minutes": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "dustin": [
        "VBG"
    ], 
    "Tator": [
        "NNP"
    ], 
    "tumors": [
        "NNS"
    ], 
    "demeanors": [
        "NNS"
    ], 
    "low-fat": [
        "JJ"
    ], 
    "obscure": [
        "JJ", 
        "VB"
    ], 
    "sew": [
        "VB", 
        "VBP"
    ], 
    "dryin": [
        "VBG"
    ], 
    "seq": [
        "NN"
    ], 
    "overwhelm": [
        "VB", 
        "VBP"
    ], 
    "Fox": [
        "NNP"
    ], 
    "Foy": [
        "NNP"
    ], 
    "sex": [
        "NN", 
        "VB"
    ], 
    "Foe": [
        "NNP"
    ], 
    "see": [
        "VB", 
        "UH", 
        "VBP"
    ], 
    "Fog": [
        "NN"
    ], 
    "unsheltered": [
        "JJ"
    ], 
    "migration": [
        "NN"
    ], 
    "sea": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Stedt": [
        "NNP"
    ], 
    "Umm": [
        "UH"
    ], 
    "institutes": [
        "NN"
    ], 
    "Westbound": [
        "NNP"
    ], 
    "Calabria": [
        "NNP"
    ], 
    "bone-marrow": [
        "NN"
    ], 
    "vitamins": [
        "NNS"
    ], 
    "Yale-New": [
        "NNP"
    ], 
    "unmarketable": [
        "JJ"
    ], 
    "topmost": [
        "JJ"
    ], 
    "avuncular": [
        "JJ"
    ], 
    "Belinda": [
        "NNP", 
        "NN"
    ], 
    "Ungaretti": [
        "NNP"
    ], 
    "Rebounding": [
        "VBG"
    ], 
    "Pocketing": [
        "VBG"
    ], 
    "ego-adaptive": [
        "JJ"
    ], 
    "embargoes": [
        "NNS"
    ], 
    "Dmitri": [
        "NNP"
    ], 
    "redesigning": [
        "VBG"
    ], 
    "Serves": [
        "VBZ"
    ], 
    "hooted": [
        "VBD", 
        "VBN"
    ], 
    "shortlived": [
        "JJ"
    ], 
    "Served": [
        "VBN"
    ], 
    "pagan": [
        "JJ"
    ], 
    "embargoed": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Kaskaskia": [
        "NNP"
    ], 
    "Nortek": [
        "NNP"
    ], 
    "RETIREMENT": [
        "NNP"
    ], 
    "Goldscheider": [
        "NNP"
    ], 
    "fifty-year": [
        "JJ"
    ], 
    "repainted": [
        "VBN", 
        "JJ"
    ], 
    "scams": [
        "NNS"
    ], 
    "Halloran": [
        "NNP"
    ], 
    "long-term": [
        "JJ", 
        "NN", 
        "RB", 
        "NNS"
    ], 
    "Nortex": [
        "NNP"
    ], 
    "volcanic": [
        "JJ"
    ], 
    "electrician": [
        "NN"
    ], 
    "Spectator": [
        "NNP"
    ], 
    "drunk": [
        "JJ", 
        "NN", 
        "VBN"
    ], 
    "underwent": [
        "VBD"
    ], 
    "Ephlin": [
        "NNP"
    ], 
    "forklift": [
        "NN"
    ], 
    "USGA": [
        "NNP"
    ], 
    "triservice": [
        "NN"
    ], 
    "community": [
        "NN"
    ], 
    "hollow": [
        "JJ", 
        "NN"
    ], 
    "agents": [
        "NNS"
    ], 
    "BREWERS": [
        "NNS"
    ], 
    "creeds": [
        "NNS"
    ], 
    "underlay": [
        "VBP"
    ], 
    "runups": [
        "NNS"
    ], 
    "worthless": [
        "JJ"
    ], 
    "vehemently": [
        "RB"
    ], 
    "numinous": [
        "JJ"
    ], 
    "APPLE": [
        "NNP"
    ], 
    "Trail": [
        "NNP", 
        "VB"
    ], 
    "A321s": [
        "NNS"
    ], 
    "scions": [
        "NNS"
    ], 
    "McBride": [
        "NNP"
    ], 
    "flounced": [
        "VBN"
    ], 
    "self-deceived": [
        "JJ"
    ], 
    "semi-public": [
        "JJ"
    ], 
    "Burwell": [
        "NNP"
    ], 
    "Waseda": [
        "NNP"
    ], 
    "repayments": [
        "NNS"
    ], 
    "then-21": [
        "JJ"
    ], 
    "towne": [
        "NN"
    ], 
    "fund": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "McRoberts": [
        "NNP"
    ], 
    "vortex": [
        "NN"
    ], 
    "Ninja": [
        "NNP"
    ], 
    "womanizing": [
        "VBG"
    ], 
    "insiders": [
        "NNS"
    ], 
    "towns": [
        "NNS"
    ], 
    "ligands": [
        "NNS"
    ], 
    "Standard-issue": [
        "JJ"
    ], 
    "tweaked": [
        "VBD"
    ], 
    "Dallara": [
        "NNP"
    ], 
    "judicial": [
        "JJ"
    ], 
    "Duplicating": [
        "VBG"
    ], 
    "sesame": [
        "NN"
    ], 
    "Fighters": [
        "NNP"
    ], 
    "sociality": [
        "NN"
    ], 
    "redounds": [
        "VBZ"
    ], 
    "Measure": [
        "NN", 
        "NNP", 
        "VB"
    ], 
    "front-loaded": [
        "JJ"
    ], 
    "Keschl": [
        "NNP"
    ], 
    "road-crossing": [
        "NN"
    ], 
    "owed": [
        "VBN", 
        "VBD"
    ], 
    "Hubermann": [
        "NNP"
    ], 
    "Hartzog": [
        "NNP"
    ], 
    "owes": [
        "VBZ"
    ], 
    "mediating": [
        "VBG"
    ], 
    "decor": [
        "NN"
    ], 
    "Ayres": [
        "NNP"
    ], 
    "volume-based": [
        "JJ"
    ], 
    "decoy": [
        "NN"
    ], 
    "two-color": [
        "JJ"
    ], 
    "Morelli": [
        "NNP"
    ], 
    "ingot": [
        "NN"
    ], 
    "voraciously": [
        "RB"
    ], 
    "Jocelyn": [
        "NNP"
    ], 
    "Apergillus": [
        "NN"
    ], 
    "monasticism": [
        "NN"
    ], 
    "doan": [
        "VBP"
    ], 
    "levels": [
        "NNS", 
        "VBZ"
    ], 
    "dollar-and-cents": [
        "JJ"
    ], 
    "Raleigh": [
        "NNP"
    ], 
    "Expands": [
        "VBZ"
    ], 
    "oddest": [
        "JJS"
    ], 
    "Cameo": [
        "NNP"
    ], 
    "Camel": [
        "NNP"
    ], 
    "Woodbridge": [
        "NNP"
    ], 
    "upland": [
        "JJ", 
        "RB"
    ], 
    "Rate": [
        "NNP", 
        "NN"
    ], 
    "regulating": [
        "VBG", 
        "NN"
    ], 
    "Nastro": [
        "NNP"
    ], 
    "Uxbridge": [
        "NNP"
    ], 
    "Resourceful": [
        "JJ"
    ], 
    "Rath": [
        "NNP"
    ], 
    "Segal": [
        "NNP"
    ], 
    "red-haired": [
        "JJ"
    ], 
    "hypothesized": [
        "VBN"
    ], 
    "militiamen": [
        "NNS"
    ], 
    "Alabamans": [
        "NNS"
    ], 
    "rumbling": [
        "VBG"
    ], 
    "LAYOFFS": [
        "NNS"
    ], 
    "Segar": [
        "NNP"
    ], 
    "contradicting": [
        "VBG"
    ], 
    "relevancy": [
        "NN"
    ], 
    "dissociation": [
        "NN"
    ], 
    "interregnum": [
        "NN"
    ], 
    "Rahway": [
        "NNP"
    ], 
    "sweet-shrub": [
        "NN"
    ], 
    "VCOR": [
        "NNP"
    ], 
    "Varian": [
        "NNP"
    ], 
    "ellipsoids": [
        "NNS"
    ], 
    "location": [
        "NN"
    ], 
    "DM850-a-month": [
        "JJ"
    ], 
    "billable": [
        "JJ"
    ], 
    "relevance": [
        "NN"
    ], 
    "Fukuoka": [
        "NNP"
    ], 
    "Shartzer": [
        "NNP"
    ], 
    "victims": [
        "NNS"
    ], 
    "Frenchwoman": [
        "NNP"
    ], 
    "rigatoni": [
        "NN"
    ], 
    "Merhige": [
        "NNP"
    ], 
    "instructors": [
        "NNS"
    ], 
    "Vermejo": [
        "NNP"
    ], 
    "deflationist": [
        "NN"
    ], 
    "Duffus": [
        "NNP"
    ], 
    "integrated-steel": [
        "NN"
    ], 
    "contraptions": [
        "NNS"
    ], 
    "Aransas": [
        "NNP"
    ], 
    "governess": [
        "NN"
    ], 
    "criminal-defense": [
        "JJ", 
        "NN"
    ], 
    "amicably": [
        "RB"
    ], 
    "Dams": [
        "NNS"
    ], 
    "Damp": [
        "JJ"
    ], 
    "DES": [
        "NNP", 
        "NN"
    ], 
    "Yamatake": [
        "NNP"
    ], 
    "Damn": [
        "VB", 
        "JJ"
    ], 
    "sight": [
        "NN", 
        "VB"
    ], 
    "nostrums": [
        "NNS"
    ], 
    "DEA": [
        "NNP"
    ], 
    "DEC": [
        "NNP"
    ], 
    "amicable": [
        "JJ"
    ], 
    "Dame": [
        "NNP"
    ], 
    "wrongful": [
        "JJ"
    ], 
    "Balcerowicz": [
        "NNP"
    ], 
    "Viewmaster-Ideal": [
        "NNP"
    ], 
    "stamens": [
        "NNS"
    ], 
    "stables": [
        "NNS"
    ], 
    "sheet-fed": [
        "JJ"
    ], 
    "stabled": [
        "VBD"
    ], 
    "film-processing": [
        "NN"
    ], 
    "blood-red": [
        "NN"
    ], 
    "cop-killer": [
        "JJ"
    ], 
    "durables": [
        "NNS"
    ], 
    "EPO-treated": [
        "JJ"
    ], 
    "tankers": [
        "NNS"
    ], 
    "lubra": [
        "NN"
    ], 
    "two-for-one": [
        "JJ"
    ], 
    "Riviera": [
        "NNP"
    ], 
    "Soll": [
        "NNP"
    ], 
    "U.S.-SOVIET": [
        "JJ"
    ], 
    "vitals": [
        "NNS"
    ], 
    "non-tariff": [
        "JJ"
    ], 
    "Earth-quake": [
        "NN"
    ], 
    "scarify": [
        "VB"
    ], 
    "wildlife": [
        "NN"
    ], 
    "Fulgoni": [
        "NNP"
    ], 
    "anything": [
        "NN"
    ], 
    "global-market": [
        "JJ"
    ], 
    "Shawano": [
        "NNP"
    ], 
    "ambush": [
        "NN", 
        "VB"
    ], 
    "computational": [
        "JJ"
    ], 
    "Hatless": [
        "JJ"
    ], 
    "Bensten": [
        "NNP"
    ], 
    "Young": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "ACS": [
        "NNP"
    ], 
    "adverbs": [
        "NNS"
    ], 
    "Skillman": [
        "NNP"
    ], 
    "Riger": [
        "NNP"
    ], 
    "ACT": [
        "NNP"
    ], 
    "burdens": [
        "NNS", 
        "VBZ"
    ], 
    "next": [
        "JJ", 
        "IN", 
        "RB"
    ], 
    "CoGen": [
        "NNP"
    ], 
    "criticisms": [
        "NNS"
    ], 
    "straight-line": [
        "JJ"
    ], 
    "bargaining": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "assuring": [
        "VBG"
    ], 
    "textual": [
        "JJ"
    ], 
    "occupy": [
        "VB", 
        "VBP"
    ], 
    "often-disparaged": [
        "JJ"
    ], 
    "pixie-like": [
        "JJ"
    ], 
    "BONO": [
        "FW"
    ], 
    "rhetorical": [
        "JJ"
    ], 
    "DowBrands": [
        "NNP"
    ], 
    "excavating": [
        "VBG"
    ], 
    "impudent": [
        "JJ"
    ], 
    "Klimpl": [
        "NNP"
    ], 
    "Mlle": [
        "NNP"
    ], 
    "retina": [
        "NN"
    ], 
    "Trafton": [
        "NNP"
    ], 
    "vowing": [
        "VBG"
    ], 
    "numismatic": [
        "JJ"
    ], 
    "High-yielding": [
        "JJ"
    ], 
    "cortico-hypothalamic": [
        "JJ"
    ], 
    "port-shopping": [
        "NN"
    ], 
    "Bandish": [
        "NNP"
    ], 
    "nieces": [
        "NNS"
    ], 
    "redeemed": [
        "VBN", 
        "VBD"
    ], 
    "feather-bedding": [
        "NN"
    ], 
    "Indoor": [
        "JJ"
    ], 
    "Ohlman": [
        "NNP"
    ], 
    "electrophorus": [
        "NN"
    ], 
    "Erdos": [
        "NNP"
    ], 
    "mature": [
        "JJ", 
        "VB", 
        "NNP", 
        "VBP"
    ], 
    "supervisor": [
        "NN"
    ], 
    "Gobbee": [
        "NNP"
    ], 
    "WALL": [
        "NNP"
    ], 
    "Disposal": [
        "NNP", 
        "NN"
    ], 
    "Jolla": [
        "NNP"
    ], 
    "Parks": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "Gutfreund-Postel": [
        "NNP"
    ], 
    "Mishelevka": [
        "NNP"
    ], 
    "Frothy": [
        "JJ"
    ], 
    "Memory": [
        "NN", 
        "NNP"
    ], 
    "Parke": [
        "NNP"
    ], 
    "wove": [
        "VBD"
    ], 
    "formalism": [
        "NN"
    ], 
    "Chesshire": [
        "NNP"
    ], 
    "bad-cop": [
        "JJ"
    ], 
    "Sundstrand": [
        "NNP"
    ], 
    "Brush-off": [
        "NN", 
        "NNP"
    ], 
    "Dividends": [
        "NNS"
    ], 
    "leftward": [
        "JJ"
    ], 
    "overshoots": [
        "VBZ"
    ], 
    "actors": [
        "NNS"
    ], 
    "brazier": [
        "NN"
    ], 
    "Monchecourt": [
        "NNP"
    ], 
    "pockmarked": [
        "JJ", 
        "VBN"
    ], 
    "rumor-fraught": [
        "JJ"
    ], 
    "sided": [
        "VBD", 
        "VBN"
    ], 
    "faintly": [
        "RB"
    ], 
    "Gorilla": [
        "NNP"
    ], 
    "Onan": [
        "NNP"
    ], 
    "DRILLING": [
        "NN"
    ], 
    "Railway": [
        "NNP"
    ], 
    "Biscuits": [
        "NNP", 
        "NNPS"
    ], 
    "sides": [
        "NNS"
    ], 
    "worsened": [
        "VBD", 
        "VBN"
    ], 
    "unionized": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "one-set": [
        "JJ"
    ], 
    "TR.": [
        "NNP"
    ], 
    "Ritter": [
        "NNP"
    ], 
    "superstate": [
        "NN"
    ], 
    "summit": [
        "NN", 
        "JJ"
    ], 
    "walker": [
        "NN"
    ], 
    "Exchange-rate": [
        "JJ"
    ], 
    "Krauts": [
        "NNS"
    ], 
    "essay": [
        "NN"
    ], 
    "CPI": [
        "NNP"
    ], 
    "pooched": [
        "VBD"
    ], 
    "Taxonomists": [
        "NNS"
    ], 
    "CPA": [
        "NNP"
    ], 
    "Tweed": [
        "NNP"
    ], 
    "CPC": [
        "NNP"
    ], 
    "results": [
        "NNS", 
        "VBZ"
    ], 
    "June-to-September": [
        "NNP"
    ], 
    "dedicates": [
        "VBZ"
    ], 
    "Nonconformists": [
        "NNS"
    ], 
    "CPR": [
        "NNP"
    ], 
    "QVC": [
        "NNP"
    ], 
    "CPT": [
        "NN"
    ], 
    "ORDERS": [
        "VBZ"
    ], 
    "inferences": [
        "NNS"
    ], 
    "Taraday": [
        "NNP"
    ], 
    "renunciations": [
        "NNS"
    ], 
    "Milhaud": [
        "NNP"
    ], 
    "court-supervised": [
        "JJ"
    ], 
    "send": [
        "VB", 
        "VBP"
    ], 
    "outlooks": [
        "NNS"
    ], 
    "commuter-airline": [
        "NN"
    ], 
    "Bharati": [
        "NNP"
    ], 
    "Candide": [
        "NNP"
    ], 
    "sent": [
        "VBD", 
        "VBN"
    ], 
    "pestering": [
        "VBG"
    ], 
    "recitals": [
        "NNS"
    ], 
    "Sanctions": [
        "NNS", 
        "NNPS"
    ], 
    "Goldstein": [
        "NNP"
    ], 
    "languished": [
        "VBN", 
        "VBD"
    ], 
    "Following": [
        "VBG", 
        "NN"
    ], 
    "languishes": [
        "VBZ"
    ], 
    "pyrometer": [
        "NN"
    ], 
    "seven-member": [
        "JJ"
    ], 
    "categories": [
        "NNS"
    ], 
    "Kimball": [
        "NNP"
    ], 
    "travel-services": [
        "NNS"
    ], 
    "recognizance": [
        "NN"
    ], 
    "Related": [
        "NNP", 
        "JJ", 
        "VBN"
    ], 
    "Talking": [
        "VBG"
    ], 
    "bemoans": [
        "VBZ"
    ], 
    "obesity": [
        "NN"
    ], 
    "Seattle": [
        "NNP", 
        "NN"
    ], 
    "thirty-foot": [
        "JJ"
    ], 
    "Lynford": [
        "NNP"
    ], 
    "burrowed": [
        "VBD"
    ], 
    "agrarian": [
        "JJ", 
        "NN"
    ], 
    "Redbirds": [
        "NNP"
    ], 
    "buckskins": [
        "NNS"
    ], 
    "Newbery": [
        "NNP"
    ], 
    "Newberg": [
        "NNP"
    ], 
    "re-enactments": [
        "NNS", 
        "NN"
    ], 
    "Reinhardt": [
        "NNP"
    ], 
    "shivery": [
        "JJ"
    ], 
    "Jessica": [
        "NNP"
    ], 
    "firma": [
        "FW", 
        "NN"
    ], 
    "Alai": [
        "NNP"
    ], 
    "Giddings": [
        "NNP"
    ], 
    "analogously": [
        "RB"
    ], 
    "Alan": [
        "NNP"
    ], 
    "laxity": [
        "NN"
    ], 
    "Alar": [
        "NN", 
        "NNP"
    ], 
    "Alas": [
        "UH", 
        "RB"
    ], 
    "firms": [
        "NNS", 
        "VBZ"
    ], 
    "Diario": [
        "NNP"
    ], 
    "Barbudos": [
        "NNPS"
    ], 
    "Newton-John": [
        "NNP"
    ], 
    "fertilization": [
        "NN"
    ], 
    "panelists": [
        "NNS"
    ], 
    "jammies": [
        "NNS"
    ], 
    "Lammermoor": [
        "NNP"
    ], 
    "identifications": [
        "NNS"
    ], 
    "Tremdine": [
        "NNP"
    ], 
    "aerodynamic": [
        "JJ"
    ], 
    "physiology": [
        "NN"
    ], 
    "Streak": [
        "NNP"
    ], 
    "sentimentality": [
        "NN"
    ], 
    "engage": [
        "VB", 
        "VBP"
    ], 
    "Stream": [
        "NNP"
    ], 
    "firm.": [
        "NN"
    ], 
    "Energy": [
        "NNP", 
        "NN"
    ], 
    "Ala.": [
        "NNP"
    ], 
    "McCarthy-era": [
        "JJ"
    ], 
    "bank-affiliated": [
        "JJ"
    ], 
    "Militia": [
        "NNS"
    ], 
    "Religious": [
        "JJ", 
        "NNP"
    ], 
    "Dohnanyi": [
        "NNP"
    ], 
    "debts": [
        "NNS"
    ], 
    "Decay": [
        "NNP"
    ], 
    "finagling": [
        "NN"
    ], 
    "Alleged": [
        "JJ"
    ], 
    "distrusted": [
        "VBN", 
        "VBD"
    ], 
    "Industrielle": [
        "NNP"
    ], 
    "moonlighting": [
        "NN", 
        "VBG"
    ], 
    "F-14": [
        "NN", 
        "NNP"
    ], 
    "F-15": [
        "NNP", 
        "NN"
    ], 
    "trivialize": [
        "VB"
    ], 
    "F-18": [
        "NN"
    ], 
    "F.E.L.": [
        "NNP"
    ], 
    "cheered": [
        "VBD", 
        "VBN"
    ], 
    "Ha": [
        "NNP", 
        "UH"
    ], 
    "Outright": [
        "JJ"
    ], 
    "archbishop": [
        "NN"
    ], 
    "whipping": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "painstakingly": [
        "RB"
    ], 
    "ministers": [
        "NNS"
    ], 
    "cash-or-shares": [
        "JJ"
    ], 
    "Oppenheim": [
        "NNP"
    ], 
    "muffed": [
        "VBD", 
        "VBN"
    ], 
    "Telmex": [
        "NNP"
    ], 
    "Delawareans": [
        "NNPS"
    ], 
    "Kaisers": [
        "NNPS"
    ], 
    "chloride": [
        "NN"
    ], 
    "Biny": [
        "NNP"
    ], 
    "crisscrossing": [
        "VBG"
    ], 
    "Bricktop": [
        "NNP"
    ], 
    "monophonic": [
        "JJ"
    ], 
    "Gumi": [
        "NNP"
    ], 
    "one-megabit": [
        "JJ"
    ], 
    "Hosting": [
        "VBG"
    ], 
    "Cimabue": [
        "NNP"
    ], 
    "Gums": [
        "NNS"
    ], 
    "Gump": [
        "NNP"
    ], 
    "Sucre": [
        "NNP"
    ], 
    "sharply": [
        "RB"
    ], 
    "roller-coaster": [
        "NN"
    ], 
    "promotional": [
        "JJ"
    ], 
    "folder": [
        "NN"
    ], 
    "pollutant": [
        "NN"
    ], 
    "cross-margining": [
        "JJ", 
        "NN"
    ], 
    "Christoph": [
        "NNP"
    ], 
    "insists": [
        "VBZ"
    ], 
    "instinctual": [
        "JJ"
    ], 
    "Subtle": [
        "JJ"
    ], 
    "hare-brained": [
        "JJ"
    ], 
    "campsites": [
        "NNS"
    ], 
    "million-member-Teamsters": [
        "NNPS"
    ], 
    "wed": [
        "VBN", 
        "VB"
    ], 
    "Shrieves": [
        "NNP"
    ], 
    "Sherrie": [
        "NNP"
    ], 
    "depiction": [
        "NN"
    ], 
    "beckoned": [
        "VBD", 
        "VBN"
    ], 
    "Several": [
        "JJ", 
        "NNP"
    ], 
    "trumpet": [
        "NN", 
        "VBP"
    ], 
    "Shoupe": [
        "NNP"
    ], 
    "Osler": [
        "NNP"
    ], 
    "nuts-and-bolts": [
        "JJ"
    ], 
    "hydrophilic": [
        "JJ"
    ], 
    "Crocodile": [
        "NNP"
    ], 
    "Bolling": [
        "NNP"
    ], 
    "Ransy": [
        "NNP"
    ], 
    "expansion-minded": [
        "JJ"
    ], 
    "tableau": [
        "NN"
    ], 
    "Ittleson": [
        "NNP"
    ], 
    "Tigershark": [
        "NNP"
    ], 
    "Railcar": [
        "NNP"
    ], 
    "stand": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "ACQUISITIONS": [
        "NNS"
    ], 
    "blocks": [
        "NNS", 
        "VBZ"
    ], 
    "Flax": [
        "NNP"
    ], 
    "wallpaper": [
        "NN"
    ], 
    "Poitrine": [
        "NNP"
    ], 
    "paleo": [
        "NN"
    ], 
    "blocky": [
        "JJ"
    ], 
    "Garcia": [
        "NNP"
    ], 
    "notebook": [
        "NN"
    ], 
    "demonstrating": [
        "VBG"
    ], 
    "Ingrid": [
        "NNP"
    ], 
    "lagoons": [
        "NNS"
    ], 
    "near-total": [
        "JJ"
    ], 
    "efficiently": [
        "RB"
    ], 
    "Welmers": [
        "NNS"
    ], 
    "selectors": [
        "NNS"
    ], 
    "critical-intellectual": [
        "JJ"
    ], 
    "intellectuals": [
        "NNS"
    ], 
    "Leisire": [
        "NNP"
    ], 
    "Buhrmann-Tetterode": [
        "NNP"
    ], 
    "Kaiser": [
        "NNP"
    ], 
    "jigger": [
        "NN"
    ], 
    "unpalatable": [
        "JJ"
    ], 
    "comma": [
        "NN"
    ], 
    "N.C.-based": [
        "JJ"
    ], 
    "Brenna": [
        "NNP"
    ], 
    "Octobrists": [
        "NNPS"
    ], 
    "operative": [
        "JJ", 
        "NN"
    ], 
    "easements": [
        "NNS"
    ], 
    "recreating": [
        "VBG"
    ], 
    "unpeace": [
        "NN"
    ], 
    "excretory": [
        "JJ"
    ], 
    "Shroeder": [
        "NNP"
    ], 
    "hypothesize": [
        "VB"
    ], 
    "Southeastern": [
        "NNP", 
        "JJ"
    ], 
    "shudder": [
        "VB", 
        "VBP"
    ], 
    "spoiling": [
        "VBG"
    ], 
    "hobby": [
        "NN"
    ], 
    "Bazaar": [
        "NNP"
    ], 
    "French-franc": [
        "NN"
    ], 
    "burping": [
        "VBG"
    ], 
    "crucial": [
        "JJ"
    ], 
    "Excluding": [
        "VBG", 
        "NNP"
    ], 
    "Reichenberg": [
        "NNP"
    ], 
    "Manzanola": [
        "NNP"
    ], 
    "triphosphorous": [
        "JJ"
    ], 
    "Wynston": [
        "NNP"
    ], 
    "A&M": [
        "NNP", 
        "NN"
    ], 
    "Katz": [
        "NNP"
    ], 
    "rail-equipment": [
        "JJ"
    ], 
    "installment": [
        "NN", 
        "JJ"
    ], 
    "gallstones": [
        "NNS"
    ], 
    "A&E": [
        "NNP"
    ], 
    "Sporting": [
        "NNP", 
        "NN"
    ], 
    "M-19": [
        "NN"
    ], 
    "merge": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "Informix": [
        "NNP"
    ], 
    "Kato": [
        "NNP"
    ], 
    "accounts": [
        "NNS", 
        "VBZ"
    ], 
    "A&W": [
        "NNP"
    ], 
    "A&P": [
        "NNP", 
        "NN"
    ], 
    "Kate": [
        "NNP", 
        "NN"
    ], 
    "veracious": [
        "JJ"
    ], 
    "Lumpur": [
        "NNP"
    ], 
    "kisha": [
        "FW"
    ], 
    "BUSINESS": [
        "NN", 
        "NNP"
    ], 
    "Treasure": [
        "NNP", 
        "NN"
    ], 
    "Mills": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "Millo": [
        "NNP"
    ], 
    "Most-Favored": [
        "JJS"
    ], 
    "intangible": [
        "JJ", 
        "NN"
    ], 
    "Dispatch": [
        "NNP"
    ], 
    "Treasury": [
        "NNP", 
        "NN"
    ], 
    "repainting": [
        "NN", 
        "VBG"
    ], 
    "Mille": [
        "NNP"
    ], 
    "WOLFSON": [
        "NNP"
    ], 
    "Lynes": [
        "NNP"
    ], 
    "wander": [
        "VB", 
        "VBP"
    ], 
    "Least-cost": [
        "JJ"
    ], 
    "Agreement": [
        "NNP", 
        "NN"
    ], 
    "HIAA": [
        "NNP"
    ], 
    "venom": [
        "NN"
    ], 
    "exults": [
        "VBZ"
    ], 
    "saltbush": [
        "NN"
    ], 
    "Contractors": [
        "NNS", 
        "NNPS"
    ], 
    "czar": [
        "NN"
    ], 
    "Bakkers": [
        "NNPS"
    ], 
    "interactions": [
        "NNS"
    ], 
    "Grove": [
        "NNP", 
        "NN"
    ], 
    "yawns": [
        "NNS"
    ], 
    "opinion-makers": [
        "NNS"
    ], 
    "Albanese": [
        "NNP"
    ], 
    "Herwick": [
        "NNP"
    ], 
    "BICC": [
        "NNP"
    ], 
    "Freddy": [
        "NNP"
    ], 
    "loomed": [
        "VBD", 
        "VBN"
    ], 
    "Cuellar": [
        "NNP"
    ], 
    "eyeballing": [
        "VBG"
    ], 
    "monographs": [
        "NNS"
    ], 
    "Aided": [
        "VBN"
    ], 
    "Bachman": [
        "NNP"
    ], 
    "shuld": [
        "MD"
    ], 
    "congressonal": [
        "JJ"
    ], 
    "mesmerized": [
        "VBN"
    ], 
    "followings": [
        "NNS"
    ], 
    "low-calorie": [
        "JJ"
    ], 
    "Aides": [
        "NNS"
    ], 
    "Caper": [
        "NNP"
    ], 
    "Wheeler": [
        "NNP"
    ], 
    "transmitters": [
        "NNS"
    ], 
    "Capet": [
        "NNP"
    ], 
    "Hypocrisy": [
        "NN"
    ], 
    "pines": [
        "NNS"
    ], 
    "Review": [
        "NNP", 
        "NN"
    ], 
    "owned": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "straining": [
        "VBG"
    ], 
    "owner": [
        "NN"
    ], 
    "Capek": [
        "NNP"
    ], 
    "Sovtransavto": [
        "NNP"
    ], 
    "Pampers": [
        "NNPS", 
        "NNP"
    ], 
    "Capel": [
        "NNP"
    ], 
    "Naturally": [
        "RB"
    ], 
    "legislative": [
        "JJ"
    ], 
    "Solidarity-led": [
        "JJ"
    ], 
    "STOCKS": [
        "NNS"
    ], 
    "Y-MP\\/832": [
        "NNP"
    ], 
    "foreign-based": [
        "JJ"
    ], 
    "upstate": [
        "JJ", 
        "RB"
    ], 
    "tulip-shaped": [
        "JJ"
    ], 
    "state-controlled": [
        "JJ"
    ], 
    "acknowleged": [
        "VBD"
    ], 
    "Bahrenburg": [
        "NNP"
    ], 
    "spaceship": [
        "NN"
    ], 
    "painful": [
        "JJ"
    ], 
    "twinjets": [
        "NNS"
    ], 
    "HERO": [
        "NN"
    ], 
    "Levin": [
        "NNP"
    ], 
    "trestle": [
        "NN"
    ], 
    "midlevel": [
        "JJ"
    ], 
    "printmaking": [
        "NN"
    ], 
    "applauds": [
        "VBZ"
    ], 
    "BRANDS": [
        "NNPS"
    ], 
    "Meanwile": [
        "RB"
    ], 
    "marquees": [
        "NNS"
    ], 
    "delimits": [
        "VBZ"
    ], 
    "steel": [
        "NN", 
        "JJ"
    ], 
    "buttocks": [
        "NNS"
    ], 
    "boot-wearer": [
        "JJ"
    ], 
    "steed": [
        "NN"
    ], 
    "manpower": [
        "NN"
    ], 
    "haystacks": [
        "NNS"
    ], 
    "restaffed": [
        "VBD"
    ], 
    "malpractice": [
        "NN", 
        "VB"
    ], 
    "punctured": [
        "JJ", 
        "VBN"
    ], 
    "Paschall": [
        "NNP"
    ], 
    "Re-enactments": [
        "NNS"
    ], 
    "steep": [
        "JJ", 
        "NN"
    ], 
    "torrent": [
        "NN"
    ], 
    "steer": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "Jolivet": [
        "NNP"
    ], 
    "seaborne": [
        "JJ"
    ], 
    "Results": [
        "NNS", 
        "NNP"
    ], 
    "PLODDERS": [
        "NNS"
    ], 
    "chromium-plated": [
        "JJ"
    ], 
    "Mercedes-Benz": [
        "NNP"
    ], 
    "devotions": [
        "NNS"
    ], 
    "Zorn": [
        "NNP"
    ], 
    "Haferkamp": [
        "NNP"
    ], 
    "blockbuster": [
        "NN", 
        "JJ"
    ], 
    "Balag": [
        "NNP"
    ], 
    "clearly": [
        "RB"
    ], 
    "Remember": [
        "VB"
    ], 
    "Claws": [
        "NNS"
    ], 
    "wryness": [
        "NN"
    ], 
    "documents": [
        "NNS", 
        "VBZ"
    ], 
    "soak": [
        "VB"
    ], 
    "bacterium": [
        "NN"
    ], 
    "bassoon": [
        "NN"
    ], 
    "vented": [
        "VBD", 
        "VBN"
    ], 
    "probly": [
        "RB"
    ], 
    "mechanism": [
        "NN"
    ], 
    "decomposing": [
        "VBG"
    ], 
    "bonanza": [
        "NN"
    ], 
    "mechanist": [
        "NN"
    ], 
    "soap": [
        "NN"
    ], 
    "Dare-Base": [
        "NNP"
    ], 
    "regard": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "snuff": [
        "VB", 
        "NN"
    ], 
    "BEWARE": [
        "VB"
    ], 
    "safety-first": [
        "JJ"
    ], 
    "sophomoric": [
        "JJ"
    ], 
    "psychiatry": [
        "NN"
    ], 
    "Hurricanes": [
        "NNPS"
    ], 
    "HOLD": [
        "VB"
    ], 
    "medal": [
        "NN"
    ], 
    "Patents": [
        "NNP"
    ], 
    "RCSB": [
        "NNP"
    ], 
    "thirdquarter": [
        "JJ", 
        "NN"
    ], 
    "Expedition": [
        "NNP"
    ], 
    "reignite": [
        "VB", 
        "NN"
    ], 
    "endrocrine": [
        "JJ"
    ], 
    "Pancho": [
        "NNP"
    ], 
    "disallowance": [
        "NN"
    ], 
    "montgolfiere": [
        "FW"
    ], 
    "Marquess": [
        "NNP"
    ], 
    "Sophias": [
        "NNP"
    ], 
    "leftfield": [
        "NN"
    ], 
    "EXE": [
        "NNP"
    ], 
    "Evidences": [
        "NNS"
    ], 
    "dissociate": [
        "VB"
    ], 
    "understate": [
        "VBP"
    ], 
    "EXP": [
        "NNP"
    ], 
    "Wolzein": [
        "NNP"
    ], 
    "Removal": [
        "NNP", 
        "NN"
    ], 
    "asylum": [
        "NN"
    ], 
    "ELP": [
        "NNP"
    ], 
    "jostling": [
        "VBG"
    ], 
    "illumine": [
        "VB"
    ], 
    "planter": [
        "NN"
    ], 
    "championed": [
        "VBN", 
        "VBD"
    ], 
    "ex-chairman": [
        "NN"
    ], 
    "emancipate": [
        "VB"
    ], 
    "Serif": [
        "NNP"
    ], 
    "planted": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "poohbah": [
        "NN"
    ], 
    "matronly": [
        "JJ"
    ], 
    "Bergsten": [
        "NNP"
    ], 
    "maggots": [
        "NNS"
    ], 
    "bourbon": [
        "NN"
    ], 
    "Saltiel": [
        "NNP"
    ], 
    "maggoty": [
        "JJ"
    ], 
    "Keswick": [
        "NNP"
    ], 
    "pogroms": [
        "NNS"
    ], 
    "Sumita": [
        "NNP"
    ], 
    "Owners": [
        "NNS", 
        "NNP"
    ], 
    "humanness": [
        "NN"
    ], 
    "internationals": [
        "NNS"
    ], 
    "intellectually": [
        "RB"
    ], 
    "Ekman": [
        "NNP"
    ], 
    "flower-scented": [
        "JJ"
    ], 
    "fronds": [
        "NNS"
    ], 
    "Fashions": [
        "NNPS"
    ], 
    "River": [
        "NNP", 
        "NN"
    ], 
    "multiyear": [
        "JJ"
    ], 
    "quarter-mile": [
        "NN", 
        "JJ"
    ], 
    "dishearten": [
        "VB"
    ], 
    "Lydall": [
        "NNP"
    ], 
    "spatula": [
        "NN"
    ], 
    "Brahmin": [
        "NNP"
    ], 
    "luminosity": [
        "NN"
    ], 
    "nise": [
        "JJ"
    ], 
    "disapprobation": [
        "NN"
    ], 
    "streamlined": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "DeGol": [
        "NNP"
    ], 
    "Anniston": [
        "NNP"
    ], 
    "incurably": [
        "RB"
    ], 
    "Wilshire": [
        "NNP"
    ], 
    "Histrionix": [
        "NNP"
    ], 
    "creationist": [
        "JJ"
    ], 
    "catastrophic": [
        "JJ"
    ], 
    "heartburn": [
        "NN"
    ], 
    "edition": [
        "NN"
    ], 
    "Pre-attack": [
        "JJ"
    ], 
    "corrals": [
        "NNS"
    ], 
    "subcommittee": [
        "NN"
    ], 
    "bidders": [
        "NNS"
    ], 
    "incurable": [
        "JJ"
    ], 
    "Nonunion": [
        "NNP"
    ], 
    "creationism": [
        "NN"
    ], 
    "yodel": [
        "NN"
    ], 
    "bossman": [
        "NN"
    ], 
    "Hannes": [
        "NNP"
    ], 
    "partisan": [
        "JJ", 
        "NN"
    ], 
    "Euro-Belge": [
        "NNP"
    ], 
    "extraneousness": [
        "NN"
    ], 
    "Two-part": [
        "JJ"
    ], 
    "injustice": [
        "NN"
    ], 
    "Jean-Pierre": [
        "NNP"
    ], 
    "Jones-Irwin": [
        "NNP"
    ], 
    "reauthorization": [
        "NN"
    ], 
    "classless": [
        "JJ"
    ], 
    "faceless": [
        "JJ"
    ], 
    "Forum": [
        "NNP"
    ], 
    "WFRR": [
        "NNP"
    ], 
    "Amdura": [
        "NNP"
    ], 
    "bright-eyed": [
        "JJ"
    ], 
    "Admistration": [
        "NNP"
    ], 
    "port-of-call": [
        "NN"
    ], 
    "candybar": [
        "NN"
    ], 
    "drum": [
        "VB", 
        "NN"
    ], 
    "Ter-Arutunian": [
        "NNP"
    ], 
    "unflinching": [
        "JJ"
    ], 
    "sevenday": [
        "JJ"
    ], 
    "Ethiopian": [
        "JJ"
    ], 
    "drug": [
        "NN"
    ], 
    "Serum": [
        "NN"
    ], 
    "sugared": [
        "JJ", 
        "VBN"
    ], 
    "Anlage": [
        "NNP"
    ], 
    "irruptions": [
        "NNS"
    ], 
    "Vaughan": [
        "NNP"
    ], 
    "clamshell": [
        "NN"
    ], 
    "cm": [
        "NN"
    ], 
    "cc": [
        "NN"
    ], 
    "Guinea": [
        "NNP"
    ], 
    "ca": [
        "MD"
    ], 
    "skylights": [
        "NNS"
    ], 
    "laity": [
        "NN"
    ], 
    "missile-guidance": [
        "JJ"
    ], 
    "nonstops": [
        "NNS"
    ], 
    "pounced": [
        "VBD"
    ], 
    "rapidement": [
        "FW"
    ], 
    "allocated": [
        "VBN", 
        "VBD"
    ], 
    "paperboy": [
        "NN"
    ], 
    "cu": [
        "NN"
    ], 
    "equips": [
        "VBZ"
    ], 
    "Get": [
        "VB", 
        "NNP", 
        "VBP"
    ], 
    "trajectory": [
        "NN"
    ], 
    "dazzling": [
        "JJ", 
        "VBG"
    ], 
    "anhydrously": [
        "RB"
    ], 
    "Chennault": [
        "NNP"
    ], 
    "Gee": [
        "UH", 
        "NNP"
    ], 
    "ex-member": [
        "NN"
    ], 
    "QUANTUM": [
        "NNP"
    ], 
    "hottest": [
        "JJS"
    ], 
    "I.D.": [
        "NN"
    ], 
    "break-even": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Marous": [
        "NNP"
    ], 
    "Gem": [
        "NNP"
    ], 
    "Gel": [
        "NNP"
    ], 
    "Mid-sized": [
        "JJ"
    ], 
    "stalled": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "rioting": [
        "NN"
    ], 
    "Enthusiastic": [
        "JJ"
    ], 
    "Cytogen": [
        "NNP"
    ], 
    "geysering": [
        "VBG"
    ], 
    "laser": [
        "NN"
    ], 
    "Continentals": [
        "NNS"
    ], 
    "grinning": [
        "VBG", 
        "JJ"
    ], 
    "Pulling": [
        "VBG"
    ], 
    "Fatman": [
        "NNP"
    ], 
    "Hickok": [
        "NNP"
    ], 
    "rigged": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "maul": [
        "VB"
    ], 
    "Eros": [
        "NNP"
    ], 
    "rethought": [
        "JJ"
    ], 
    "movie-studio": [
        "NN"
    ], 
    "Burnsides": [
        "NNPS"
    ], 
    "preppie": [
        "NN"
    ], 
    "delaying": [
        "VBG", 
        "JJ", 
        "NN|VBG"
    ], 
    "lush": [
        "JJ"
    ], 
    "L.R.": [
        "NNP"
    ], 
    "lust": [
        "NN"
    ], 
    "five-cylinder": [
        "JJ"
    ], 
    "Crestmont": [
        "NNP"
    ], 
    "Rajter": [
        "NNP"
    ], 
    "cremation": [
        "NN"
    ], 
    "waspish": [
        "JJ"
    ], 
    "maligned": [
        "VBN"
    ], 
    "concealing": [
        "VBG"
    ], 
    "Pettee": [
        "NNP"
    ], 
    "highlighted": [
        "VBN", 
        "VBD"
    ], 
    "Raoul": [
        "NNPS", 
        "NNP"
    ], 
    "Geothermal": [
        "NNP"
    ], 
    "five-pound": [
        "JJ"
    ], 
    "glares": [
        "VBZ"
    ], 
    "infarction": [
        "NN"
    ], 
    "Wertheimer": [
        "NNP"
    ], 
    "inlaid": [
        "VBN"
    ], 
    "balm": [
        "NN"
    ], 
    "ball": [
        "NN"
    ], 
    "balk": [
        "VB", 
        "VBP"
    ], 
    "Canadian-fisheries": [
        "NNS"
    ], 
    "Jase": [
        "NNP"
    ], 
    "forecasts": [
        "NNS", 
        "VBZ"
    ], 
    "heaped": [
        "VBN", 
        "VBD"
    ], 
    "robotic": [
        "JJ"
    ], 
    "Hires": [
        "NNP"
    ], 
    "overalls": [
        "NNS"
    ], 
    "whyfores": [
        "NNS"
    ], 
    "Julio": [
        "NNP"
    ], 
    "Oklahoman": [
        "NNP"
    ], 
    "Julie": [
        "NNP"
    ], 
    "Julia": [
        "NNP"
    ], 
    "Sontag": [
        "NNP"
    ], 
    "clambering": [
        "VBG"
    ], 
    "Thutmose": [
        "NNP"
    ], 
    "wigmaker": [
        "NN"
    ], 
    "Ito-Yokado": [
        "NNP"
    ], 
    "Sahour": [
        "NNP"
    ], 
    "snake": [
        "NN"
    ], 
    "gully": [
        "NN"
    ], 
    "Marcia": [
        "NNP"
    ], 
    "moments": [
        "NNS"
    ], 
    "glut": [
        "NN", 
        "VB"
    ], 
    "hand-blower": [
        "NN"
    ], 
    "LABOR": [
        "NNP", 
        "NN"
    ], 
    "Emphasis": [
        "NN"
    ], 
    "glum": [
        "JJ", 
        "NN"
    ], 
    "Drobny": [
        "NNP"
    ], 
    "glue": [
        "NN"
    ], 
    "Flynn": [
        "NNP"
    ], 
    "Bahrain": [
        "NNP", 
        "NN"
    ], 
    "Ankara": [
        "NNP"
    ], 
    "Unbelievable": [
        "JJ"
    ], 
    "Works": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "Ketchikan": [
        "NNP"
    ], 
    "politique": [
        "FW"
    ], 
    "fifth-straight": [
        "JJ"
    ], 
    "coattails": [
        "NNS"
    ], 
    "Levesque": [
        "NNP"
    ], 
    "Osterreichische": [
        "NNP"
    ], 
    "Zoeller": [
        "NNP"
    ], 
    "unrecoverable": [
        "JJ"
    ], 
    "fluctuating": [
        "VBG"
    ], 
    "Unfortunately": [
        "RB"
    ], 
    "taunt": [
        "NN", 
        "VB"
    ], 
    "famously": [
        "RB"
    ], 
    "Slatkin": [
        "NNP"
    ], 
    "Kaddish": [
        "NNP"
    ], 
    "SGA": [
        "NNP"
    ], 
    "car-rental": [
        "JJ", 
        "NN"
    ], 
    "bayonets": [
        "NNS"
    ], 
    "Skating": [
        "NNP"
    ], 
    "SGB": [
        "NNP"
    ], 
    "crisp": [
        "JJ", 
        "NN"
    ], 
    "onion": [
        "NN"
    ], 
    "Gensichen": [
        "NNP"
    ], 
    "bigotry": [
        "NN"
    ], 
    "scenic": [
        "JJ"
    ], 
    "Wakayama": [
        "NNP"
    ], 
    "Quit": [
        "VB"
    ], 
    "indications": [
        "NNS"
    ], 
    "Kodama": [
        "NNP"
    ], 
    "guaranty": [
        "NN"
    ], 
    "U.N.F.P.": [
        "NNP"
    ], 
    "foreseeable": [
        "JJ"
    ], 
    "footage": [
        "NN"
    ], 
    "Withrow": [
        "NNP"
    ], 
    "ballot": [
        "NN"
    ], 
    "hashers": [
        "NNS"
    ], 
    "Tenderfoot": [
        "NN"
    ], 
    "Procaine": [
        "NN"
    ], 
    "Barron": [
        "NNP"
    ], 
    "hoarder": [
        "NN"
    ], 
    "Gardner-Denver": [
        "NNP"
    ], 
    "leveraged": [
        "JJ", 
        "VBN", 
        "NN"
    ], 
    "snappy": [
        "JJ"
    ], 
    "half-crocked": [
        "JJ"
    ], 
    "high-definition": [
        "JJ", 
        "NN"
    ], 
    "forgiven": [
        "VBN"
    ], 
    "Barrow": [
        "NNP"
    ], 
    "Eden": [
        "NNP"
    ], 
    "Markrud": [
        "NNP"
    ], 
    "haulage": [
        "JJ", 
        "NN"
    ], 
    "shortage": [
        "NN"
    ], 
    "ornithologist": [
        "NN"
    ], 
    "Brizola": [
        "NNP"
    ], 
    "senior-management": [
        "NN"
    ], 
    "fetal-vulnerability": [
        "JJ"
    ], 
    "Eder": [
        "NNP"
    ], 
    "Toward": [
        "IN", 
        "NNP"
    ], 
    "mosquito-plagued": [
        "JJ"
    ], 
    "gained": [
        "VBD", 
        "VBN", 
        "VB"
    ], 
    "embolisms": [
        "NNS"
    ], 
    "ingest": [
        "VBP", 
        "VB"
    ], 
    "idolize": [
        "VBP"
    ], 
    "Talon": [
        "NNP"
    ], 
    "seeds": [
        "NNS"
    ], 
    "gainer": [
        "NN"
    ], 
    "kneebreeches": [
        "NNS"
    ], 
    "seedy": [
        "JJ"
    ], 
    "strode": [
        "VBD"
    ], 
    "Grune": [
        "NNP"
    ], 
    "German-born": [
        "JJ"
    ], 
    "Consuming": [
        "VBG"
    ], 
    "clotheshorse": [
        "NN"
    ], 
    "unbent": [
        "JJ"
    ], 
    "libertarians": [
        "NNS"
    ], 
    "jingles": [
        "NNS"
    ], 
    "uninterruptedly": [
        "RB"
    ], 
    "Charters": [
        "NNP"
    ], 
    "abreaction": [
        "NN"
    ], 
    "Coen": [
        "NNP"
    ], 
    "Sensibility": [
        "NN"
    ], 
    "jingled": [
        "VBD"
    ], 
    "recapitalizations": [
        "NNS"
    ], 
    "sander": [
        "NN"
    ], 
    "Serra": [
        "NNP"
    ], 
    "Young-Jin": [
        "NNP"
    ], 
    "Sickness": [
        "NN"
    ], 
    "off-speed": [
        "JJ"
    ], 
    "housing": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "Dictates": [
        "NNS"
    ], 
    "stamina": [
        "NN"
    ], 
    "Expenditure": [
        "NNP"
    ], 
    "Republicanism": [
        "NNP"
    ], 
    "unresponsive": [
        "JJ"
    ], 
    "Deor": [
        "NNP"
    ], 
    "daughter-in-law": [
        "NN"
    ], 
    "hoosegows": [
        "NNS"
    ], 
    "storehouse": [
        "NN"
    ], 
    "beeped": [
        "VBN"
    ], 
    "delivery": [
        "NN"
    ], 
    "Suppose": [
        "VB"
    ], 
    "delivers": [
        "VBZ"
    ], 
    "Balance": [
        "NNP"
    ], 
    "illustrative": [
        "JJ"
    ], 
    "beeper": [
        "NN", 
        "JJR"
    ], 
    "straightaway": [
        "NN", 
        "RB"
    ], 
    "Jessy": [
        "NNP"
    ], 
    "Bicycle": [
        "NNP", 
        "NN"
    ], 
    "official": [
        "NN", 
        "JJ"
    ], 
    "reinforcement": [
        "NN"
    ], 
    "harvested": [
        "VBN"
    ], 
    "gold-phone": [
        "NN"
    ], 
    "unguaranteed": [
        "JJ"
    ], 
    "Vagabond": [
        "NNP"
    ], 
    "Jesse": [
        "NNP"
    ], 
    "Lusser": [
        "NNP"
    ], 
    "televison-record": [
        "NN"
    ], 
    "BOSTON": [
        "NNP"
    ], 
    "Riga": [
        "NNP"
    ], 
    "Leixlip": [
        "NNP"
    ], 
    "denote": [
        "VB", 
        "VBP"
    ], 
    "semi-arid": [
        "JJ"
    ], 
    "Neisse-Oder": [
        "NNP"
    ], 
    "shepherded": [
        "VBD"
    ], 
    "Thoma": [
        "NNP"
    ], 
    "Benets": [
        "NNPS"
    ], 
    "battery-powered": [
        "JJ"
    ], 
    "anaerobic": [
        "JJ"
    ], 
    "Imam": [
        "NNP"
    ], 
    "Imai": [
        "NNP"
    ], 
    "variety": [
        "NN"
    ], 
    "Griswold": [
        "NNP"
    ], 
    "saunas": [
        "NNS"
    ], 
    "fast-rising": [
        "JJ"
    ], 
    "deficit-racked": [
        "JJ"
    ], 
    "intermission": [
        "NN"
    ], 
    "Anti-Jones": [
        "JJ"
    ], 
    "WANES": [
        "VBZ"
    ], 
    "penciled": [
        "VBN"
    ], 
    "satellite-dish": [
        "NN"
    ], 
    "FELLED": [
        "VBD"
    ], 
    "videocasette": [
        "NN"
    ], 
    "footprints": [
        "NNS"
    ], 
    "foreleg": [
        "NN"
    ], 
    "unswerving": [
        "JJ"
    ], 
    "Dulude": [
        "NNP"
    ], 
    "arbiter": [
        "NN"
    ], 
    "McFeely": [
        "RB"
    ], 
    "Fifty-two": [
        "JJ"
    ], 
    "Arvin": [
        "NNP"
    ], 
    "pacify": [
        "VB"
    ], 
    "Wafaa": [
        "NNP"
    ], 
    "Appleseeds": [
        "NNPS"
    ], 
    "Page": [
        "NNP", 
        "NN"
    ], 
    "matrix": [
        "NN"
    ], 
    "time-on-the-job": [
        "JJ"
    ], 
    "buyin": [
        "NN"
    ], 
    "limousines": [
        "NNS"
    ], 
    "Fujimoto": [
        "NNP"
    ], 
    "transports": [
        "NNS", 
        "VBZ"
    ], 
    "undercutting": [
        "VBG"
    ], 
    "orders-related": [
        "JJ"
    ], 
    "coquette": [
        "NN"
    ], 
    "Soaring": [
        "VBG"
    ], 
    "pension": [
        "NN"
    ], 
    "Trotting": [
        "VBG"
    ], 
    "buoy": [
        "VB"
    ], 
    "knockers": [
        "NNS"
    ], 
    "Sadly": [
        "RB"
    ], 
    "consolidated": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "C-90": [
        "NN"
    ], 
    "Rous": [
        "NNP"
    ], 
    "Boies": [
        "NNP"
    ], 
    "Antler": [
        "NNP"
    ], 
    "oldest": [
        "JJS"
    ], 
    "Sicurella": [
        "NNP"
    ], 
    "consolidates": [
        "VBZ"
    ], 
    "psychopathic": [
        "JJ"
    ], 
    "underclassman": [
        "NN"
    ], 
    "metropolitian": [
        "JJ"
    ], 
    "sputtered": [
        "VBD"
    ], 
    "Schmolka": [
        "NNP"
    ], 
    "forte-pianos": [
        "NNS"
    ], 
    "physiological": [
        "JJ"
    ], 
    "knife-edge": [
        "NN"
    ], 
    "Architects": [
        "NNS", 
        "NNPS"
    ], 
    "Rangel": [
        "NNP"
    ], 
    "Ranger": [
        "NNP"
    ], 
    "Sasebo": [
        "NNP"
    ], 
    "Schonberg": [
        "NNP"
    ], 
    "hell-for-leather": [
        "RB"
    ], 
    "slowest": [
        "JJS"
    ], 
    "Pololu": [
        "NNP"
    ], 
    "overpaying": [
        "VBG"
    ], 
    "litle": [
        "JJ", 
        "NN"
    ], 
    "League": [
        "NNP", 
        "NN"
    ], 
    "Breed": [
        "NNP", 
        "NN"
    ], 
    "higher-multiple": [
        "JJ"
    ], 
    "fireplaces": [
        "NNS"
    ], 
    "geology": [
        "NN"
    ], 
    "blanket": [
        "NN", 
        "VBP", 
        "NN|JJ", 
        "JJ", 
        "VB"
    ], 
    "distort": [
        "VB", 
        "VBP"
    ], 
    "sellers": [
        "NNS"
    ], 
    "Telectronics": [
        "NNP"
    ], 
    "Adlai": [
        "NNP"
    ], 
    "disobedient": [
        "JJ"
    ], 
    "Brindisi": [
        "NNP"
    ], 
    "XRAL": [
        "NNP"
    ], 
    "Canada-North": [
        "NNP"
    ], 
    "uninviting": [
        "JJ"
    ], 
    "Surrounding": [
        "VBG"
    ], 
    "ACLU": [
        "NNP"
    ], 
    "antagonize": [
        "VB", 
        "VBP"
    ], 
    "Amudarya": [
        "NNP"
    ], 
    "auto-insurance": [
        "NN"
    ], 
    "Shevchenko": [
        "NNP"
    ], 
    "League-sponsored": [
        "JJ"
    ], 
    "Ambiguan": [
        "JJ"
    ], 
    "Lubrizol": [
        "NNP"
    ], 
    "chaffing": [
        "VBG"
    ], 
    "belaboring": [
        "VBG", 
        "NN"
    ], 
    "Kiryat": [
        "NNP"
    ], 
    "dwindles": [
        "VBZ"
    ], 
    "Idealist": [
        "NN"
    ], 
    "Bauman": [
        "NNP"
    ], 
    "Avoidance": [
        "NNP"
    ], 
    "established": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "disk": [
        "NN"
    ], 
    "LSC": [
        "NNP"
    ], 
    "DeMyer": [
        "NNP"
    ], 
    "Dresdner-ABD": [
        "NNP"
    ], 
    "+": [
        "SYM", 
        "NN"
    ], 
    "Sherman": [
        "NNP"
    ], 
    "walkout": [
        "NN"
    ], 
    "LSI": [
        "NNP"
    ], 
    "sideman": [
        "NN"
    ], 
    "LSU": [
        "NNP"
    ], 
    "reconstruction": [
        "NN"
    ], 
    "drug-laden": [
        "JJ"
    ], 
    "SECURITY": [
        "NN"
    ], 
    "LSX": [
        "NNP"
    ], 
    "textures": [
        "NNS"
    ], 
    "Yeller": [
        "JJ"
    ], 
    "Stiles": [
        "NNP"
    ], 
    "Tiepolo": [
        "NNP"
    ], 
    "Yellen": [
        "NNP"
    ], 
    "textured": [
        "JJ"
    ], 
    "noncompliant": [
        "JJ"
    ], 
    "Dimitris": [
        "NNP"
    ], 
    "celebration": [
        "NN"
    ], 
    "F.S.B.": [
        "NNP"
    ], 
    "Vanities": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Widsith": [
        "NNP"
    ], 
    "Martinair": [
        "NNP"
    ], 
    "rigorously": [
        "RB"
    ], 
    "Tuesday": [
        "NNP"
    ], 
    "alter-ego": [
        "NN"
    ], 
    "Brozman": [
        "NNP"
    ], 
    "bunked": [
        "VBD"
    ], 
    "smoke": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "bunker": [
        "NN"
    ], 
    "Negotiations": [
        "NNS"
    ], 
    "secure": [
        "VB", 
        "JJ", 
        "VBP"
    ], 
    "Cristal": [
        "NNP"
    ], 
    "windowpane": [
        "NN"
    ], 
    "phase-two": [
        "JJ"
    ], 
    "modulated": [
        "VBN"
    ], 
    "Interleukin-3": [
        "NN"
    ], 
    "wrack": [
        "NN", 
        "VBP"
    ], 
    "BEVERLY": [
        "NNP"
    ], 
    "linearly": [
        "RB"
    ], 
    "experimentation": [
        "NN"
    ], 
    "shams": [
        "NNS"
    ], 
    "Nezhari": [
        "NNP"
    ], 
    "castor-oil": [
        "NN"
    ], 
    "Lock": [
        "NNP"
    ], 
    "knoll": [
        "NN"
    ], 
    "Corestates": [
        "NNP"
    ], 
    "Ssmc": [
        "NN", 
        "NNP"
    ], 
    "fragmentary": [
        "JJ", 
        "RB"
    ], 
    "two-pronged": [
        "JJ"
    ], 
    "Dells": [
        "NNP"
    ], 
    "Plunkett": [
        "NNP"
    ], 
    "already-strained": [
        "JJ"
    ], 
    "sunbleached": [
        "VBN"
    ], 
    "stochastic": [
        "JJ"
    ], 
    "emeritus": [
        "NN", 
        "JJ"
    ], 
    "tariff": [
        "NN"
    ], 
    "authentically": [
        "RB"
    ], 
    "Della": [
        "NNP"
    ], 
    "soils": [
        "NNS"
    ], 
    "Porters": [
        "NNPS"
    ], 
    "unfailing": [
        "JJ"
    ], 
    "Courtier": [
        "NNP", 
        "NN"
    ], 
    "grovel": [
        "VB"
    ], 
    "Habib": [
        "NNP"
    ], 
    "groves": [
        "NNS"
    ], 
    "tinder": [
        "NN"
    ], 
    "gallons": [
        "NNS"
    ], 
    "Astronaut": [
        "NN"
    ], 
    "Glance": [
        "VB"
    ], 
    "could": [
        "MD"
    ], 
    "piers": [
        "NNS"
    ], 
    "ascetic": [
        "NN"
    ], 
    "chemical-arms-control": [
        "JJ"
    ], 
    "Carnochan": [
        "NNP"
    ], 
    "whole-bank": [
        "JJ"
    ], 
    "flunking": [
        "VBG"
    ], 
    "unreadable": [
        "JJ"
    ], 
    "Freie": [
        "NNP"
    ], 
    "Nizer": [
        "NNP"
    ], 
    "Rowan": [
        "NNP"
    ], 
    "scientist-consultant": [
        "NN"
    ], 
    "unsatisfying": [
        "JJ"
    ], 
    "indifferent": [
        "JJ"
    ], 
    "altitudes": [
        "NNS"
    ], 
    "MOHAWK": [
        "NNP"
    ], 
    "envenomed": [
        "VBN"
    ], 
    "Iran-Iraq": [
        "NNP"
    ], 
    "IPTAY": [
        "NNP"
    ], 
    "snobbishly": [
        "RB"
    ], 
    "morbid": [
        "JJ"
    ], 
    "minuet": [
        "NN"
    ], 
    "objets": [
        "FW"
    ], 
    "if": [
        "IN"
    ], 
    "memorization": [
        "NN"
    ], 
    "tax-deductible": [
        "JJ"
    ], 
    "doable": [
        "JJ"
    ], 
    "Extruded": [
        "VBN"
    ], 
    "Gottshall": [
        "NNP"
    ], 
    "theatricality": [
        "NN"
    ], 
    "suing": [
        "VBG"
    ], 
    "unmiked": [
        "VBN"
    ], 
    "bottler": [
        "NN"
    ], 
    "chromatogram": [
        "NN"
    ], 
    "LeSabre": [
        "NNP"
    ], 
    "underbracing": [
        "NN"
    ], 
    "repeats": [
        "VBZ", 
        "NNS"
    ], 
    "Trusk": [
        "NNP"
    ], 
    "homeowners": [
        "NNS"
    ], 
    "fund-objective": [
        "JJ"
    ], 
    "nascent": [
        "JJ"
    ], 
    "corvettes": [
        "NNS"
    ], 
    "Trust": [
        "NNP", 
        "NN", 
        "VB", 
        "VBP"
    ], 
    "claimant": [
        "NN"
    ], 
    "ridings": [
        "NNS"
    ], 
    "Fitzwilliam": [
        "NNP"
    ], 
    "tricked": [
        "VBN"
    ], 
    "Switchgear": [
        "NNP"
    ], 
    "Innes": [
        "NNP"
    ], 
    "Inner": [
        "NNP", 
        "JJ"
    ], 
    "New-home": [
        "JJ"
    ], 
    "priciest": [
        "JJS"
    ], 
    "mayor": [
        "NN"
    ], 
    "Catholics": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "marketmaking": [
        "NN"
    ], 
    "Kalyani": [
        "NNP"
    ], 
    "waterworks": [
        "NN", 
        "NN|NNS"
    ], 
    "bronchiole": [
        "NN"
    ], 
    "bunching": [
        "VBG"
    ], 
    "count": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "beakers": [
        "NNS"
    ], 
    "fragment": [
        "NN"
    ], 
    "most-recommended-issues": [
        "JJ"
    ], 
    "promulgators": [
        "NNS"
    ], 
    "soothing": [
        "VBG", 
        "JJ"
    ], 
    "stanza-form": [
        "NN"
    ], 
    "Labatt": [
        "NNP"
    ], 
    "loose-jowled": [
        "JJ"
    ], 
    "classified": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "backgrounds": [
        "NNS"
    ], 
    "naysay": [
        "VB"
    ], 
    "Softer": [
        "JJR"
    ], 
    "hexameter": [
        "NN"
    ], 
    "hard-won": [
        "JJ"
    ], 
    "MARGIN": [
        "NN"
    ], 
    "excavations": [
        "NNS"
    ], 
    "Newtonville": [
        "NNP"
    ], 
    "Kinnevik": [
        "NNP"
    ], 
    "councils": [
        "NNS"
    ], 
    "autocollimator": [
        "NN"
    ], 
    "pin-point": [
        "JJ"
    ], 
    "stronger-than-expected": [
        "JJ"
    ], 
    "Cyclone": [
        "NNP"
    ], 
    "Nellcor": [
        "NNP"
    ], 
    "radio-location": [
        "NN"
    ], 
    "Psyche": [
        "NNP"
    ], 
    "Lampe": [
        "NNP"
    ], 
    "Wary": [
        "JJ"
    ], 
    "Wars": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "vessels": [
        "NNS"
    ], 
    "strangers": [
        "NNS"
    ], 
    "forte": [
        "NN"
    ], 
    "Warm": [
        "JJ"
    ], 
    "understaffs": [
        "VBZ"
    ], 
    "Ward": [
        "NNP"
    ], 
    "Chatham": [
        "NNP"
    ], 
    "forth": [
        "RB", 
        "RP"
    ], 
    "Convocations": [
        "NNS"
    ], 
    "PILGRIM": [
        "NNP"
    ], 
    "appointments": [
        "NNS"
    ], 
    "putty": [
        "NN"
    ], 
    "Palaces": [
        "NNPS"
    ], 
    "Scare": [
        "NNP", 
        "NN"
    ], 
    "monoliths": [
        "NNS"
    ], 
    "Cambridge": [
        "NNP", 
        "NN"
    ], 
    "Eastern": [
        "NNP", 
        "JJ"
    ], 
    "Gellert": [
        "NNP"
    ], 
    "construing": [
        "VBG"
    ], 
    "ordering": [
        "VBG", 
        "NN"
    ], 
    "four-bagger": [
        "NN"
    ], 
    "waterfall": [
        "NN"
    ], 
    "unenticing": [
        "JJ"
    ], 
    "low-paying": [
        "JJ"
    ], 
    "EuroTV": [
        "NNP"
    ], 
    "Rohm": [
        "NNP"
    ], 
    "truthfulness": [
        "NN"
    ], 
    "COAHR": [
        "NNP"
    ], 
    "E-71": [
        "NNP"
    ], 
    "Nationalized": [
        "VBN"
    ], 
    "beaching": [
        "VBG"
    ], 
    "toconsolidated": [
        "VBN"
    ], 
    "Cell": [
        "NNP", 
        "NN"
    ], 
    "Stalinist": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "four-day": [
        "JJ"
    ], 
    "Squeezing": [
        "VBG"
    ], 
    "blossomed": [
        "VBD", 
        "VBN"
    ], 
    "Doerner": [
        "NNP"
    ], 
    "drones": [
        "NNS"
    ], 
    "Harveys": [
        "NNPS"
    ], 
    "ficials": [
        "NNS"
    ], 
    "Cela": [
        "NNP"
    ], 
    "Rohs": [
        "NNP"
    ], 
    "Rohr": [
        "NNP"
    ], 
    "Magruder": [
        "NNP"
    ], 
    "gooseberry": [
        "NN"
    ], 
    "hearse": [
        "NN"
    ], 
    "protracted": [
        "JJ", 
        "VBN"
    ], 
    "German-made": [
        "JJ"
    ], 
    "Shreveport": [
        "NNP"
    ], 
    "flagpole": [
        "NN"
    ], 
    "Isolde": [
        "FW", 
        "NNP"
    ], 
    "Koshland": [
        "NNP"
    ], 
    "Census": [
        "NNP", 
        "NN"
    ], 
    "vetoes": [
        "NNS", 
        "VBZ"
    ], 
    "ludicrously": [
        "RB"
    ], 
    "early-season": [
        "JJ"
    ], 
    "plant-expansion": [
        "JJ"
    ], 
    "Guffey": [
        "NNP"
    ], 
    "totted": [
        "VBN"
    ], 
    "Forsan": [
        "FW"
    ], 
    "Necklace": [
        "NNP"
    ], 
    "Brookmeyer": [
        "NNP"
    ], 
    "ever-existent": [
        "JJ"
    ], 
    "Communism": [
        "NNP", 
        "NN"
    ], 
    "extracurricular": [
        "JJ"
    ], 
    "one-pound-or-so": [
        "JJ"
    ], 
    "kung-fu": [
        "NN"
    ], 
    "tavern": [
        "NN"
    ], 
    "admonitions": [
        "NNS"
    ], 
    "Kerensky": [
        "NNP"
    ], 
    "Dompierre": [
        "NNP"
    ], 
    "devious": [
        "JJ"
    ], 
    "Purina": [
        "NNP"
    ], 
    "encumbered": [
        "VBN"
    ], 
    "bronchitis": [
        "NN"
    ], 
    "Romero": [
        "NNP"
    ], 
    "Tax-loss": [
        "NN"
    ], 
    "Mironenko": [
        "NNP"
    ], 
    "DIAPER": [
        "NN"
    ], 
    "House-Senate": [
        "NNP", 
        "JJ"
    ], 
    "stomach": [
        "NN", 
        "VB"
    ], 
    "Correct": [
        "JJ"
    ], 
    "Cumhuriyet": [
        "NNP"
    ], 
    "alors": [
        "FW"
    ], 
    "stomack": [
        "NN"
    ], 
    "mean-spirited": [
        "JJ"
    ], 
    "MUMBO": [
        "NN"
    ], 
    "Nymex": [
        "NNP"
    ], 
    "Tudor-style": [
        "JJ"
    ], 
    "magnum": [
        "NN"
    ], 
    "Mahathir": [
        "NNP"
    ], 
    "Stolen": [
        "NNP"
    ], 
    "Dniepr": [
        "NNP"
    ], 
    "prohibitive": [
        "JJ"
    ], 
    "Naderite": [
        "NNP|JJ"
    ], 
    "devoutly": [
        "RB"
    ], 
    "Olivier": [
        "NNP"
    ], 
    "cumulatively": [
        "RB"
    ], 
    "Side": [
        "NNP", 
        "NN"
    ], 
    "manifested": [
        "VBD", 
        "VBN"
    ], 
    "Excise-tax": [
        "JJ"
    ], 
    "leavening": [
        "VBG"
    ], 
    "antidepressant": [
        "NN"
    ], 
    "deacon": [
        "NN"
    ], 
    "unsophisticated": [
        "JJ"
    ], 
    "Jerrico": [
        "NNP"
    ], 
    "notion": [
        "NN"
    ], 
    "fussy": [
        "JJ"
    ], 
    "dredged": [
        "VBD"
    ], 
    "Amatayakul": [
        "NNP"
    ], 
    "Kiep": [
        "NNP"
    ], 
    "Kiev": [
        "NNP"
    ], 
    "Carriers": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "anti-abortion": [
        "JJ", 
        "NN"
    ], 
    "barbiturate": [
        "NN"
    ], 
    "HUNTLEY": [
        "NNP"
    ], 
    "Gouldings": [
        "NNPS"
    ], 
    "infrared": [
        "JJ", 
        "NN"
    ], 
    "serenely": [
        "RB"
    ], 
    "IH.": [
        "NNP"
    ], 
    "dredges": [
        "VBZ"
    ], 
    "wrung": [
        "VB"
    ], 
    "good-size": [
        "JJ"
    ], 
    "bemaddening": [
        "VBG"
    ], 
    "Kiel": [
        "NNP"
    ], 
    "latent": [
        "JJ", 
        "NN"
    ], 
    "Brand": [
        "NN", 
        "NNP"
    ], 
    "Republicans": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Bldg": [
        "NNP"
    ], 
    "frivolities": [
        "NNS"
    ], 
    "SCHLOSS": [
        "NNP"
    ], 
    "custom-fit": [
        "VB"
    ], 
    "summarizing": [
        "VBG"
    ], 
    "accompanists": [
        "NNS"
    ], 
    "Brant": [
        "NNP"
    ], 
    "fatboy": [
        "NN"
    ], 
    "financial-related": [
        "JJ"
    ], 
    "Plumrose": [
        "NNP"
    ], 
    "predecessor": [
        "NN"
    ], 
    "Harms": [
        "NNP"
    ], 
    "center-fire": [
        "JJ"
    ], 
    "auditor-general": [
        "NN"
    ], 
    "frowning": [
        "VBG"
    ], 
    "Soviet": [
        "JJ", 
        "NNP"
    ], 
    "Nikonov": [
        "NNP"
    ], 
    "chastened": [
        "VBD", 
        "VBN"
    ], 
    "Armstrong": [
        "NNP"
    ], 
    "blunderings": [
        "NNS"
    ], 
    "Fresnel": [
        "NNP"
    ], 
    "oil-industry": [
        "NN"
    ], 
    "Denman": [
        "NNP"
    ], 
    "syllabicity": [
        "NN"
    ], 
    "Upson": [
        "NNP"
    ], 
    "Weasel": [
        "NNP"
    ], 
    "endosperm": [
        "NN"
    ], 
    "Overextension": [
        "NN"
    ], 
    "Pull": [
        "VB"
    ], 
    "Pepperidge": [
        "NNP"
    ], 
    "Bailkin": [
        "NNP"
    ], 
    "now-misplaced": [
        "JJ"
    ], 
    "sewage-polluted": [
        "JJ"
    ], 
    "Homecoming": [
        "NN", 
        "NNP"
    ], 
    "SEEKS": [
        "VBZ"
    ], 
    "bake-offs": [
        "NNS"
    ], 
    "ES250": [
        "NNP"
    ], 
    "Quick-Wate": [
        "NNP"
    ], 
    "snoozing": [
        "VBG", 
        "NN"
    ], 
    "Presbyterianism": [
        "NN"
    ], 
    "symmetric": [
        "JJ"
    ], 
    "Asensio": [
        "NNP"
    ], 
    "chattels": [
        "NNS"
    ], 
    "multiple-paged": [
        "JJ"
    ], 
    "Cralin": [
        "NNP"
    ], 
    "paramagnetic": [
        "JJ"
    ], 
    "slugs": [
        "NNS"
    ], 
    "Ten-year": [
        "JJ"
    ], 
    "Preoccupied": [
        "VBN", 
        "JJ"
    ], 
    "pre-conscious": [
        "JJ"
    ], 
    "Argus": [
        "NNP"
    ], 
    "city-bred": [
        "JJ"
    ], 
    "Westmoreland": [
        "NNP"
    ], 
    "CENTERIOR": [
        "NNP"
    ], 
    "Metromedia-ITT": [
        "NNP"
    ], 
    "Genie": [
        "NNP"
    ], 
    "data-handling": [
        "NN"
    ], 
    "saloonkeeper": [
        "NN"
    ], 
    "VICTOR": [
        "NNP"
    ], 
    "Pickford": [
        "NNP"
    ], 
    "common-carrier": [
        "NN"
    ], 
    "Focus": [
        "NNP"
    ], 
    "workroom": [
        "NN"
    ], 
    "twos": [
        "NNS"
    ], 
    "Leads": [
        "VBZ"
    ], 
    "axle-breaking": [
        "JJ"
    ], 
    "capital-draining": [
        "VBG"
    ], 
    "gobbledygook": [
        "NN"
    ], 
    "Garman": [
        "NNP"
    ], 
    "requests": [
        "NNS", 
        "VBZ"
    ], 
    "negotiation": [
        "NN"
    ], 
    "eyesight": [
        "NN"
    ], 
    "non-core": [
        "JJ"
    ], 
    "Electricity": [
        "NNP", 
        "NN"
    ], 
    "KMW": [
        "NNP"
    ], 
    "Galicians": [
        "NNPS"
    ], 
    "money-strapped": [
        "JJ"
    ], 
    "Groupe": [
        "NNP"
    ], 
    "broadening": [
        "VBG", 
        "NN"
    ], 
    "FREIGHTWAYS": [
        "NNP", 
        "NNPS"
    ], 
    "moon-splashed": [
        "JJ"
    ], 
    "chimneys": [
        "NNS"
    ], 
    "Hillary": [
        "NNP"
    ], 
    "Boxer": [
        "NNP"
    ], 
    "Rust": [
        "NNP"
    ], 
    "Groups": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "post-retirement": [
        "JJ"
    ], 
    "Igdaloff": [
        "NNP"
    ], 
    "Bootle": [
        "NNP"
    ], 
    "cutouts": [
        "NNS"
    ], 
    "families": [
        "NNS"
    ], 
    "autumns": [
        "NNS"
    ], 
    "beastly": [
        "JJ"
    ], 
    "Citizens": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "jeopardized": [
        "VBN"
    ], 
    "carbamazepine": [
        "NN"
    ], 
    "coherent": [
        "JJ"
    ], 
    "Montreux": [
        "NNP"
    ], 
    "Superstitions": [
        "NNPS"
    ], 
    "jeopardizes": [
        "VBZ"
    ], 
    "Bozeman": [
        "NNP"
    ], 
    "nose-dive": [
        "NN"
    ], 
    "Cynical": [
        "JJ"
    ], 
    "soundproof": [
        "JJ"
    ], 
    "Chelmno": [
        "NNP"
    ], 
    "Altos": [
        "NNP"
    ], 
    "pre-colonial": [
        "NN"
    ], 
    "depictions": [
        "NNS"
    ], 
    "Accused": [
        "NNP", 
        "JJ"
    ], 
    "abrupt": [
        "JJ"
    ], 
    "Dried": [
        "VBN", 
        "JJ"
    ], 
    "coffin": [
        "NN"
    ], 
    "mealtime": [
        "NN"
    ], 
    "double-digit": [
        "JJ", 
        "NN"
    ], 
    "smorgasbord": [
        "NN"
    ], 
    "Thence": [
        "RB"
    ], 
    "discourses": [
        "NNS"
    ], 
    "Crises": [
        "NNS"
    ], 
    "dumped": [
        "VBD", 
        "VBN"
    ], 
    "glutamic": [
        "JJ"
    ], 
    "plastic-coated": [
        "JJ"
    ], 
    "British-built": [
        "JJ"
    ], 
    "Jelke": [
        "NNP"
    ], 
    "comparative": [
        "JJ", 
        "NN"
    ], 
    "Falling": [
        "VBG", 
        "NNP"
    ], 
    "Rococo": [
        "JJ"
    ], 
    "confirmed": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "One-Horse": [
        "JJ"
    ], 
    "patent": [
        "NN", 
        "JJ"
    ], 
    "punctuation": [
        "NN"
    ], 
    "skyjacked": [
        "VBN"
    ], 
    "unharmed": [
        "JJ"
    ], 
    "Ingersoll": [
        "NNP"
    ], 
    "raid": [
        "NN", 
        "VB"
    ], 
    "Crisman": [
        "NNP"
    ], 
    "high-frequency": [
        "JJ"
    ], 
    "blames": [
        "VBZ"
    ], 
    "Hocke": [
        "NNP"
    ], 
    "closings": [
        "NNS"
    ], 
    "rain": [
        "NN", 
        "VB"
    ], 
    "Basel-based": [
        "JJ"
    ], 
    "Berol": [
        "NNP"
    ], 
    "Milquetoasts": [
        "NNS"
    ], 
    "Y": [
        "NNP", 
        "PRP", 
        "FW", 
        "JJ", 
        "NN"
    ], 
    "faiths": [
        "NNS"
    ], 
    "blamed": [
        "VBD", 
        "VBN"
    ], 
    "literatures": [
        "NNS"
    ], 
    "Diplomats": [
        "NNS"
    ], 
    "Kegham": [
        "NNP"
    ], 
    "scenario": [
        "NN"
    ], 
    "counterman": [
        "NN"
    ], 
    "Electrification": [
        "NNP"
    ], 
    "orgasms": [
        "NNS"
    ], 
    "bodes": [
        "VBZ"
    ], 
    "Proper": [
        "JJ"
    ], 
    "camps": [
        "NNS"
    ], 
    "deficit-debt": [
        "NN"
    ], 
    "kinship": [
        "NN"
    ], 
    "privately-owned": [
        "JJ"
    ], 
    "Sheldon": [
        "NNP"
    ], 
    "Able": [
        "NNP"
    ], 
    "repose": [
        "NN"
    ], 
    "Bonn-sponsored": [
        "NNP"
    ], 
    "Surprise": [
        "NN", 
        "NNP"
    ], 
    "convivial": [
        "JJ"
    ], 
    "adding": [
        "VBG", 
        "NN"
    ], 
    "Lazy": [
        "NNP"
    ], 
    "starboard": [
        "VB"
    ], 
    "order-taker": [
        "NN"
    ], 
    "dished": [
        "VBD"
    ], 
    "Leeches": [
        "NNS"
    ], 
    "Offenbach": [
        "NNP"
    ], 
    "surtax": [
        "NN"
    ], 
    "rescission": [
        "NN"
    ], 
    "Slovenia": [
        "NNP"
    ], 
    "advisories": [
        "NNS"
    ], 
    "transformed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "VALLEY": [
        "NNP"
    ], 
    "plasma": [
        "NN"
    ], 
    "Tampa": [
        "NNP"
    ], 
    "Filipino": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "basses": [
        "NNS"
    ], 
    "Aarvik": [
        "NNP"
    ], 
    "Combis": [
        "NNPS"
    ], 
    "Envigado": [
        "NNP"
    ], 
    "Priem": [
        "NNP"
    ], 
    "printing-press": [
        "NN"
    ], 
    "arak": [
        "FW"
    ], 
    "penny-stockbroker": [
        "NN"
    ], 
    "disadvantage": [
        "NN"
    ], 
    "multiplexing": [
        "NN"
    ], 
    "insurgent": [
        "JJ"
    ], 
    "Guadalupe": [
        "NNP"
    ], 
    "immoralities": [
        "NNS"
    ], 
    "midcapitalization": [
        "NN"
    ], 
    "Zambian": [
        "JJ"
    ], 
    "lapsed": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "tight-turn": [
        "JJ"
    ], 
    "Trading": [
        "NN", 
        "NNP", 
        "VBG"
    ], 
    "Necci": [
        "NNP"
    ], 
    "lapses": [
        "NNS", 
        "VBZ"
    ], 
    "Yao": [
        "NNP"
    ], 
    "starvation": [
        "NN"
    ], 
    "gas-guzzling": [
        "JJ"
    ], 
    "sends": [
        "VBZ"
    ], 
    "Divided": [
        "VBN"
    ], 
    "Tom": [
        "NNP"
    ], 
    "antimonide": [
        "NN"
    ], 
    "webs": [
        "NNS"
    ], 
    "Loewenstern": [
        "NNP"
    ], 
    "Planeten": [
        "NNP"
    ], 
    "Seasoned": [
        "JJ"
    ], 
    "separateness": [
        "NN"
    ], 
    "Mesaba": [
        "NNP"
    ], 
    "Lea": [
        "NNP"
    ], 
    "Lipman": [
        "NNP"
    ], 
    "Led": [
        "VBN", 
        "VBD"
    ], 
    "Lee": [
        "NNP"
    ], 
    "Leg": [
        "NNP", 
        "NN"
    ], 
    "phenomenal": [
        "JJ"
    ], 
    "Lek": [
        "NNP"
    ], 
    "Kots": [
        "NNP"
    ], 
    "Len": [
        "NNP"
    ], 
    "Leo": [
        "NNP"
    ], 
    "Lep": [
        "NNP"
    ], 
    "Les": [
        "NNP", 
        "FW"
    ], 
    "Let": [
        "VB", 
        "NNP", 
        "VBD"
    ], 
    "Leu": [
        "NNP"
    ], 
    "Lev": [
        "NNP"
    ], 
    "Lew": [
        "NNP"
    ], 
    "Lex": [
        "NNP"
    ], 
    "lagers": [
        "NNS"
    ], 
    "WNET": [
        "NNP"
    ], 
    "past-due": [
        "JJ"
    ], 
    "scribbles": [
        "VBZ"
    ], 
    "Hedman": [
        "NNP"
    ], 
    "half-city": [
        "NN"
    ], 
    "Caucusing": [
        "VBG"
    ], 
    "unswaggering": [
        "JJ"
    ], 
    "patienthood": [
        "NN"
    ], 
    "graduates": [
        "NNS", 
        "VBZ"
    ], 
    "blander": [
        "JJR"
    ], 
    "Swine": [
        "JJ"
    ], 
    "Swing": [
        "NNP"
    ], 
    "scarves": [
        "NN"
    ], 
    "Swink": [
        "NNP"
    ], 
    "Deryck": [
        "NNP"
    ], 
    "dines": [
        "VBZ"
    ], 
    "diner": [
        "NN"
    ], 
    "impenetrable": [
        "JJ"
    ], 
    "theirs": [
        "PRP", 
        "JJ"
    ], 
    "Ceramic": [
        "JJ"
    ], 
    "Mortage": [
        "NNP"
    ], 
    "bone-deep": [
        "JJ"
    ], 
    "dined": [
        "VBD", 
        "VBN"
    ], 
    "cherish": [
        "VB", 
        "VBP"
    ], 
    "Pupil": [
        "NN"
    ], 
    "Ciciulla": [
        "NNP"
    ], 
    "pegged-down": [
        "JJ"
    ], 
    "mantle": [
        "NN"
    ], 
    "Factory-to-You": [
        "NNP"
    ], 
    "Make": [
        "VB", 
        "VBP", 
        "NN", 
        "NNP"
    ], 
    "delighted": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Poison": [
        "NN"
    ], 
    "balances": [
        "NNS", 
        "VBZ"
    ], 
    "Weinberger": [
        "NNP"
    ], 
    "balanced": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "lewd": [
        "JJ"
    ], 
    "malignancies": [
        "NNS"
    ], 
    "Sirs": [
        "NNPS", 
        "NNS"
    ], 
    "Ketchum": [
        "NNP"
    ], 
    "fuchsia": [
        "NN"
    ], 
    "liquidated": [
        "VBN", 
        "VBD"
    ], 
    "Solzhenitsyn": [
        "NNP"
    ], 
    "unstressed": [
        "JJ"
    ], 
    "general-election": [
        "NN", 
        "JJ"
    ], 
    "crime-infested": [
        "JJ"
    ], 
    "book-selection": [
        "NN"
    ], 
    "vitality": [
        "NN"
    ], 
    "Kurzweil": [
        "NNP"
    ], 
    "McLauchlin": [
        "NNP"
    ], 
    "encoded": [
        "VBN"
    ], 
    "Filigreed": [
        "JJ"
    ], 
    "reset": [
        "NN", 
        "VBN", 
        "JJ", 
        "VB"
    ], 
    "responding": [
        "VBG"
    ], 
    "unthinkable": [
        "JJ", 
        "NN"
    ], 
    "generosity": [
        "NN"
    ], 
    "Bacterial": [
        "JJ"
    ], 
    "Milman": [
        "NNP"
    ], 
    "Milstein": [
        "NNP"
    ], 
    "Chicago-Manchester": [
        "NNP"
    ], 
    "private-sector": [
        "JJ", 
        "NN"
    ], 
    "hotter": [
        "JJR"
    ], 
    "electric-sewer-water": [
        "JJ"
    ], 
    "theorizing": [
        "NN"
    ], 
    "Scampini": [
        "NNP"
    ], 
    "Wanderjahr": [
        "NN"
    ], 
    "Hector": [
        "NNP"
    ], 
    "subsist": [
        "VB"
    ], 
    "cacao": [
        "NN"
    ], 
    "Blunt": [
        "NNP", 
        "JJ"
    ], 
    "mole": [
        "NN"
    ], 
    "dosages": [
        "NNS"
    ], 
    "inculcated": [
        "VBD", 
        "VBN"
    ], 
    "baguette": [
        "FW"
    ], 
    "Jacobean": [
        "JJ"
    ], 
    "weaned": [
        "VBN"
    ], 
    "weakened": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "handmade": [
        "JJ"
    ], 
    "foot-tall": [
        "JJ"
    ], 
    "liberalized": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "negotiators": [
        "NNS", 
        "VBZ"
    ], 
    "Carrozza": [
        "NN"
    ], 
    "Supercritical": [
        "NNP"
    ], 
    "shoji": [
        "FW"
    ], 
    "limited-partnership": [
        "NN", 
        "JJ"
    ], 
    "tripped": [
        "VBD", 
        "VBN"
    ], 
    "ENCYCLOPAEDIA": [
        "NNP"
    ], 
    "EXECUTIVES": [
        "NNPS", 
        "NNS"
    ], 
    "Dallas-Fort": [
        "NNP"
    ], 
    "Gifting": [
        "NN"
    ], 
    "Stalinists": [
        "NNPS", 
        "NNS"
    ], 
    "guiltless": [
        "JJ"
    ], 
    "yardage": [
        "NN"
    ], 
    "CHEWING": [
        "VBG"
    ], 
    "Massive": [
        "JJ", 
        "NNP"
    ], 
    "Monument": [
        "NNP", 
        "NN"
    ], 
    "action-results": [
        "NNS"
    ], 
    "Fausto": [
        "NNP"
    ], 
    "auto-obscuria": [
        "NN"
    ], 
    "B.V.": [
        "NNP"
    ], 
    "pseudo-thinking": [
        "NN"
    ], 
    "cheated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "hemophilia": [
        "NN"
    ], 
    "Tritium": [
        "NN"
    ], 
    "pollings": [
        "NNS"
    ], 
    "woodworm": [
        "NN"
    ], 
    "affidavit": [
        "NN"
    ], 
    "Gourman": [
        "NNP"
    ], 
    "cheater": [
        "NN"
    ], 
    "Ropart": [
        "NNP"
    ], 
    "Teutonic": [
        "JJ"
    ], 
    "Penutian": [
        "NNP"
    ], 
    "centuries-old": [
        "JJ"
    ], 
    "lineup": [
        "NN"
    ], 
    "Situated": [
        "VBN"
    ], 
    "government-sponsored": [
        "JJ"
    ], 
    "computer-assembly": [
        "NN"
    ], 
    "vampires": [
        "NNS"
    ], 
    "write-off": [
        "NN"
    ], 
    "single-family": [
        "JJ", 
        "NN"
    ], 
    "global": [
        "JJ"
    ], 
    "Parsley": [
        "NNP"
    ], 
    "Dundee": [
        "NNP"
    ], 
    "Lintner": [
        "NNP"
    ], 
    "irritants": [
        "NNS"
    ], 
    "Haugh": [
        "NNP"
    ], 
    "Quite": [
        "RB", 
        "PDT", 
        "JJ"
    ], 
    "tea-drinking": [
        "NN"
    ], 
    "brochure": [
        "NN"
    ], 
    "Comparable": [
        "JJ"
    ], 
    "grape": [
        "NN"
    ], 
    "zone": [
        "NN"
    ], 
    "flask": [
        "NN"
    ], 
    "hums": [
        "VBZ"
    ], 
    "adenocard": [
        "NN"
    ], 
    "flash": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "Jean-Luc": [
        "NNP"
    ], 
    "Strenuous": [
        "JJ"
    ], 
    "videos": [
        "NNS"
    ], 
    "feebly": [
        "RB"
    ], 
    "protective": [
        "JJ", 
        "NN"
    ], 
    "Zhu": [
        "NNP"
    ], 
    "Effoa": [
        "NNP"
    ], 
    "dispelled": [
        "VBN", 
        "VBD"
    ], 
    "Amfesco": [
        "NNP"
    ], 
    "financeer": [
        "NN"
    ], 
    "Kililngsworth": [
        "NNP"
    ], 
    "floodlighted": [
        "VBN"
    ], 
    "Klinger": [
        "NNP"
    ], 
    "Volunteers": [
        "NNPS", 
        "NNP"
    ], 
    "Cincinnati-based": [
        "JJ"
    ], 
    "feeble": [
        "JJ"
    ], 
    "Rapoport": [
        "NNP"
    ], 
    "tooling": [
        "VBG", 
        "NN"
    ], 
    "Facility": [
        "NNP"
    ], 
    "altering": [
        "VBG"
    ], 
    "Rita-Sue": [
        "NNP"
    ], 
    "fragile": [
        "JJ"
    ], 
    "puppy": [
        "NN"
    ], 
    "Cheerful": [
        "JJ"
    ], 
    "ruminants": [
        "NNS"
    ], 
    "Pastures": [
        "NNS"
    ], 
    "Transylvania": [
        "NNP"
    ], 
    "PCS": [
        "NNP"
    ], 
    "PCP": [
        "NNP"
    ], 
    "repetitive": [
        "JJ"
    ], 
    "PCM": [
        "NNP"
    ], 
    "Bryson": [
        "NNP"
    ], 
    "Rodale": [
        "NNP"
    ], 
    "Bapilly": [
        "NNP"
    ], 
    "Rider": [
        "NNP"
    ], 
    "decelerating": [
        "VBG"
    ], 
    "Fittro": [
        "NNP"
    ], 
    "Lowe": [
        "NNP"
    ], 
    "Lown": [
        "NNP"
    ], 
    "PCs": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "scaffold": [
        "NN"
    ], 
    "voume": [
        "NN"
    ], 
    "Gebrueder": [
        "NNP"
    ], 
    "Basso": [
        "NNP"
    ], 
    "During": [
        "IN", 
        "NNP"
    ], 
    "Viaje": [
        "NNP"
    ], 
    "supporting": [
        "VBG", 
        "JJ"
    ], 
    "burn": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "explosion": [
        "NN"
    ], 
    "Berri": [
        "NNP"
    ], 
    "overseers": [
        "NNS"
    ], 
    "corporate-earnings": [
        "NNS"
    ], 
    "Berra": [
        "NNP"
    ], 
    "Hentoff": [
        "NNP"
    ], 
    "Berry": [
        "NNP", 
        "NN"
    ], 
    "demonizing": [
        "NN"
    ], 
    "Bassi": [
        "NNP"
    ], 
    "rubbery": [
        "JJ"
    ], 
    "appears": [
        "VBZ", 
        "NNS"
    ], 
    "change": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Skandinaviska": [
        "NNP"
    ], 
    "pedals": [
        "NNS", 
        "VBZ"
    ], 
    "MacNeil-Lehrer": [
        "NNP"
    ], 
    "Edzard": [
        "NNP"
    ], 
    "Humpty": [
        "NNP"
    ], 
    "Cardiovasculatory": [
        "NNP"
    ], 
    "Sweig": [
        "NNP"
    ], 
    "detonate": [
        "VB", 
        "VBP"
    ], 
    "trial": [
        "NN", 
        "VB"
    ], 
    "aviation-services": [
        "NNS", 
        "JJ"
    ], 
    "Resnick": [
        "NNP"
    ], 
    "jaw": [
        "NN"
    ], 
    "seedcoats": [
        "NNS"
    ], 
    "triad": [
        "NN", 
        "JJ"
    ], 
    "Fahlgren": [
        "NNP"
    ], 
    "agates": [
        "NNS"
    ], 
    "inference": [
        "NN"
    ], 
    "Rangoni": [
        "NNP"
    ], 
    "Zwei": [
        "NNP"
    ], 
    "lending": [
        "NN", 
        "VBG", 
        "NN|VBG", 
        "JJ"
    ], 
    "Palasts": [
        "NNPS"
    ], 
    "Malays": [
        "NNP"
    ], 
    "Update": [
        "NNP"
    ], 
    "keeper": [
        "NN"
    ], 
    "retires": [
        "VBZ"
    ], 
    "suicides": [
        "NNS"
    ], 
    "discrediting": [
        "NN", 
        "VBG"
    ], 
    "terminal": [
        "NN", 
        "JJ"
    ], 
    "streetcar": [
        "NN"
    ], 
    "Stritch": [
        "NNP"
    ], 
    "Tiger": [
        "NNP", 
        "NN"
    ], 
    "Caddyshack": [
        "NNP"
    ], 
    "live": [
        "VB", 
        "RB", 
        "VBP", 
        "JJ"
    ], 
    "jam": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Tammy": [
        "NNP"
    ], 
    "eccentrics": [
        "NNS"
    ], 
    "marginally": [
        "RB"
    ], 
    "deluxer": [
        "NN"
    ], 
    "re-insure": [
        "VB"
    ], 
    "credulity": [
        "NN"
    ], 
    "Waltermire": [
        "NNP"
    ], 
    "ABC": [
        "NNP"
    ], 
    "Echeandia": [
        "NNP"
    ], 
    "Beverage": [
        "NNP"
    ], 
    "Ulanys": [
        "NNP", 
        "NNPS"
    ], 
    "risk-analysis": [
        "NN"
    ], 
    "pay-out": [
        "NN"
    ], 
    "misconception": [
        "NN"
    ], 
    "Moune": [
        "NNP"
    ], 
    "clumps": [
        "NNS"
    ], 
    "yelling": [
        "VBG", 
        "NN"
    ], 
    "logarithm": [
        "NN"
    ], 
    "Concise": [
        "JJ"
    ], 
    "Jens": [
        "NNP"
    ], 
    "Epilepsy": [
        "NNP"
    ], 
    "MMS": [
        "NNP"
    ], 
    "theater-exhibition": [
        "NN"
    ], 
    "gathers": [
        "VBZ"
    ], 
    "MMI": [
        "NNP"
    ], 
    "Alessio": [
        "NNP"
    ], 
    "Jena": [
        "NNP"
    ], 
    "Corporations": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "shock-damping": [
        "JJ"
    ], 
    "MMC": [
        "NNP"
    ], 
    "breeds": [
        "NNS", 
        "VBZ"
    ], 
    "dedicated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "warm-hearted": [
        "JJ"
    ], 
    "AH-64": [
        "NN", 
        "NNP"
    ], 
    "saith": [
        "VBZ", 
        "VB"
    ], 
    "expanding": [
        "VBG", 
        "JJ"
    ], 
    "winehead": [
        "NN"
    ], 
    "supremacy": [
        "NN"
    ], 
    "Neoliberal": [
        "JJ"
    ], 
    "purity": [
        "NN"
    ], 
    "STRUGGLED": [
        "VBD"
    ], 
    "pong": [
        "NN"
    ], 
    "unlovable": [
        "JJ"
    ], 
    "Dataproducts": [
        "NNP", 
        "NNPS"
    ], 
    "quota-increase": [
        "JJ"
    ], 
    "Magog": [
        "NNP"
    ], 
    "trophies": [
        "NNS"
    ], 
    "Fleischer": [
        "NNP"
    ], 
    "Norm": [
        "NNP"
    ], 
    "Acorn": [
        "NNP"
    ], 
    "Karkazis": [
        "NNP"
    ], 
    "Gene-splicing": [
        "NN"
    ], 
    "staircase": [
        "NN"
    ], 
    "planetary-science": [
        "JJ"
    ], 
    "commodity-oriented": [
        "JJ"
    ], 
    "prohibition": [
        "NN"
    ], 
    "banding": [
        "VBG"
    ], 
    "Trumplane": [
        "NNP"
    ], 
    "Lorincze": [
        "NNP"
    ], 
    "Pilson": [
        "NNP"
    ], 
    "crepe": [
        "JJ"
    ], 
    "remember": [
        "VB", 
        "VBP"
    ], 
    "Two-day": [
        "JJ"
    ], 
    "candles": [
        "NNS"
    ], 
    "tag-team": [
        "JJ"
    ], 
    "chin-out": [
        "JJ"
    ], 
    "home-mortgage": [
        "JJ"
    ], 
    "baseballs": [
        "NNS"
    ], 
    "truley": [
        "RB"
    ], 
    "crept": [
        "VBD", 
        "VBN"
    ], 
    "Rawlings": [
        "NNP"
    ], 
    "bleedings": [
        "NNS"
    ], 
    "Sulzer": [
        "NNP"
    ], 
    "installment-loan": [
        "JJ"
    ], 
    "embassies": [
        "NNS"
    ], 
    "tagged": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Farm-machine": [
        "NN"
    ], 
    "foreclosure": [
        "NN"
    ], 
    "Spanish-American": [
        "NNP", 
        "JJ"
    ], 
    "colt": [
        "NN"
    ], 
    "toward": [
        "IN"
    ], 
    "goad": [
        "NN"
    ], 
    "cross-currency": [
        "JJ"
    ], 
    "Brezinski": [
        "NNP"
    ], 
    "coli": [
        "NNS"
    ], 
    "cold": [
        "JJ", 
        "NN"
    ], 
    "cole": [
        "NN"
    ], 
    "birds": [
        "NNS"
    ], 
    "cola": [
        "NN"
    ], 
    "Landini": [
        "NNP"
    ], 
    "sloe-eyed": [
        "JJ"
    ], 
    "rooftop": [
        "NN"
    ], 
    "Greater": [
        "NNP", 
        "JJR"
    ], 
    "assiduity": [
        "NN"
    ], 
    "Transactions": [
        "NNS", 
        "NNP"
    ], 
    "selves": [
        "NNS"
    ], 
    "reacting": [
        "VBG"
    ], 
    "Landing": [
        "NNP", 
        "VBG"
    ], 
    "immortality": [
        "NN"
    ], 
    "Leesona-Holt": [
        "NNP"
    ], 
    "resurfaced": [
        "VBD", 
        "VBN"
    ], 
    "enny": [
        "JJ"
    ], 
    "feats": [
        "NNS"
    ], 
    "Blythe": [
        "NNP"
    ], 
    "halt": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "Trexler": [
        "NNP"
    ], 
    "Robertsons": [
        "NNPS"
    ], 
    "delinking": [
        "NN"
    ], 
    "Compliance": [
        "NNP", 
        "NN"
    ], 
    "Zupan": [
        "NNP"
    ], 
    "wielded": [
        "VBN", 
        "VBD"
    ], 
    "appoints": [
        "VBZ"
    ], 
    "Preventive": [
        "JJ"
    ], 
    "Elinor": [
        "NNP"
    ], 
    "hall": [
        "NN"
    ], 
    "halo": [
        "NN"
    ], 
    "Fery": [
        "NNP"
    ], 
    "LIVERPOOL": [
        "NNP"
    ], 
    "better-quality": [
        "JJ"
    ], 
    "Marlene": [
        "NNP"
    ], 
    "construction-management": [
        "JJ"
    ], 
    "jurisprudence": [
        "NN"
    ], 
    "Critical": [
        "NNP", 
        "JJ"
    ], 
    "dramatical": [
        "JJ"
    ], 
    "Lowenstein": [
        "NNP"
    ], 
    "cancer-suppressing": [
        "JJ"
    ], 
    "em": [
        "PRP"
    ], 
    "Desire": [
        "NN"
    ], 
    "en": [
        "IN", 
        "FW", 
        "RB"
    ], 
    "eh": [
        "UH"
    ], 
    "Baer": [
        "NNP"
    ], 
    "trade-offs": [
        "NNS", 
        "NN"
    ], 
    "worriedly": [
        "RB"
    ], 
    "Except": [
        "IN", 
        "NNP"
    ], 
    "Guadalajara": [
        "NNP"
    ], 
    "show\\": [
        "NN"
    ], 
    "Philadelphia-based": [
        "JJ"
    ], 
    "newscaster": [
        "NN"
    ], 
    "ex": [
        "FW", 
        "JJ"
    ], 
    "et": [
        "FW", 
        "VBD", 
        "CC", 
        "NNP"
    ], 
    "er": [
        "UH"
    ], 
    "vying": [
        "VBG"
    ], 
    "foot-thick": [
        "JJ"
    ], 
    "opened": [
        "VBD", 
        "VBN"
    ], 
    "space": [
        "NN", 
        "VB"
    ], 
    "VH-1": [
        "NNP"
    ], 
    "Torquemada": [
        "NNP"
    ], 
    "opener": [
        "NN"
    ], 
    "showy": [
        "JJ"
    ], 
    "castlelike": [
        "JJ"
    ], 
    "too-naked": [
        "JJ"
    ], 
    "eidetic": [
        "JJ"
    ], 
    "Mattei": [
        "NNP"
    ], 
    "Ghanaian": [
        "JJ"
    ], 
    "Stans": [
        "NNP"
    ], 
    "earthquake-related": [
        "JJ"
    ], 
    "mid-1989": [
        "NN"
    ], 
    "Covey": [
        "NNP"
    ], 
    "mid-1986": [
        "NN"
    ], 
    "Cover": [
        "NNP", 
        "VB"
    ], 
    "eluted": [
        "VBN"
    ], 
    "quart": [
        "NN"
    ], 
    "Stand": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Lockwood": [
        "NNP"
    ], 
    "Foreign": [
        "NNP", 
        "JJ"
    ], 
    "Ransomes": [
        "NNP"
    ], 
    "rearrangements": [
        "NNS"
    ], 
    "barest": [
        "JJS"
    ], 
    "Beatie": [
        "NNP"
    ], 
    "Guiana": [
        "NNP"
    ], 
    "Bavarian": [
        "JJ"
    ], 
    "domes": [
        "NNS"
    ], 
    "Konner": [
        "NNP"
    ], 
    "Sarsaparilla": [
        "NN"
    ], 
    "Promise": [
        "NNP"
    ], 
    "domed": [
        "JJ"
    ], 
    "Even": [
        "RB", 
        "JJ"
    ], 
    "concertos": [
        "NNS"
    ], 
    "Teslik": [
        "NNP"
    ], 
    "Asil": [
        "NNP"
    ], 
    "impossibly": [
        "RB"
    ], 
    "Fumio": [
        "NN"
    ], 
    "Asia": [
        "NNP", 
        "NN"
    ], 
    "Inca": [
        "NNP", 
        "JJ"
    ], 
    "Landers": [
        "NNP"
    ], 
    "orthographic": [
        "JJ"
    ], 
    "Rookie": [
        "NN", 
        "NNP"
    ], 
    "impossible": [
        "JJ"
    ], 
    "forwarding": [
        "NN", 
        "VBG"
    ], 
    "Ever": [
        "RB", 
        "NNP"
    ], 
    "Al-Sabah": [
        "NNP"
    ], 
    "Inco": [
        "NNP"
    ], 
    "sheep": [
        "NN", 
        "NNS"
    ], 
    "sheer": [
        "JJ", 
        "NN"
    ], 
    "Diamond": [
        "NNP", 
        "NN"
    ], 
    "sheet": [
        "NN"
    ], 
    "jugs": [
        "NNS"
    ], 
    "lightened": [
        "VBD", 
        "VBN"
    ], 
    "weekdays": [
        "NNS", 
        "RB"
    ], 
    "transaminase": [
        "NN"
    ], 
    "naughtier": [
        "JJR"
    ], 
    "co-pilots": [
        "NNS"
    ], 
    "Galicia": [
        "NNP"
    ], 
    "Calmer": [
        "JJR"
    ], 
    "long-vanished": [
        "JJ"
    ], 
    "much-despised": [
        "JJ"
    ], 
    "sheen": [
        "NN"
    ], 
    "larder": [
        "NN"
    ], 
    "shampooed": [
        "VBN"
    ], 
    "Johansson": [
        "NNP"
    ], 
    "Waterseller": [
        "NNP"
    ], 
    "Neck": [
        "NNP"
    ], 
    "courier": [
        "NN"
    ], 
    "pelting": [
        "JJ", 
        "VBG"
    ], 
    "sewer": [
        "NN"
    ], 
    "spot-checking": [
        "NN"
    ], 
    "peck": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "Inc.": [
        "NNP", 
        "NNPS", 
        "NN"
    ], 
    "Quinzaine": [
        "NNP"
    ], 
    "rugged": [
        "JJ"
    ], 
    "Heisch": [
        "NNP"
    ], 
    "Speculators": [
        "NNS"
    ], 
    "Larkspur": [
        "NNP"
    ], 
    "non-union": [
        "JJ"
    ], 
    "shady": [
        "JJ"
    ], 
    "sublime": [
        "JJ", 
        "NN"
    ], 
    "Furillo": [
        "NNP"
    ], 
    "Remarketers": [
        "NNS"
    ], 
    "saute": [
        "VB"
    ], 
    "correction": [
        "NN"
    ], 
    "World-Journal-Tribune": [
        "NNP"
    ], 
    "Cali": [
        "NNP"
    ], 
    "too-simple-to-be-true": [
        "JJ"
    ], 
    "Call": [
        "VB", 
        "NNP", 
        "NN"
    ], 
    "Calm": [
        "JJ"
    ], 
    "abnormalities": [
        "NNS"
    ], 
    "breakfast": [
        "NN"
    ], 
    "Crawford": [
        "NNP"
    ], 
    "Cale": [
        "NNP"
    ], 
    "Calf": [
        "NNP"
    ], 
    "sterilized": [
        "VBN", 
        "VBD"
    ], 
    "anti-Kabul": [
        "JJ"
    ], 
    "Phi": [
        "NNP"
    ], 
    "cavemen": [
        "NNS"
    ], 
    "skidding": [
        "VBG"
    ], 
    "Hellene": [
        "NNP"
    ], 
    "Non-interest": [
        "JJ"
    ], 
    "mismeasurement": [
        "NN"
    ], 
    "Exodus": [
        "NNP"
    ], 
    "faciunt": [
        "FW"
    ], 
    "six-cylinder": [
        "JJ"
    ], 
    "trans-Pacific": [
        "JJ"
    ], 
    "Osipenko": [
        "NNP"
    ], 
    "SUNY": [
        "NNP"
    ], 
    "Colombians": [
        "NNPS", 
        "NNS"
    ], 
    "PS": [
        "NNP"
    ], 
    "Markoe": [
        "NNP"
    ], 
    "Less-than-truckload": [
        "JJ"
    ], 
    "Nacion": [
        "NNP"
    ], 
    "Duyvil": [
        "NNP"
    ], 
    "hamstrung": [
        "JJ", 
        "VBN", 
        "VBP"
    ], 
    "Cal.": [
        "NN"
    ], 
    "Ph.": [
        "NNP", 
        "NNPS", 
        "NN"
    ], 
    "largish": [
        "JJ"
    ], 
    "sunset": [
        "NN", 
        "VB"
    ], 
    "diagonals": [
        "NNS"
    ], 
    "dispersed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "higher-caliber": [
        "JJR"
    ], 
    "Fifth": [
        "NNP", 
        "JJ"
    ], 
    "posse": [
        "NN"
    ], 
    "brainchild": [
        "NN"
    ], 
    "Accutane": [
        "NNP"
    ], 
    "Polevoi": [
        "NNP"
    ], 
    "hydride": [
        "NN"
    ], 
    "misrepresenting": [
        "VBG"
    ], 
    "Sony-owned": [
        "JJ"
    ], 
    "hydrido": [
        "NN"
    ], 
    "Schwartzman": [
        "NNP"
    ], 
    "Centurion": [
        "NNP"
    ], 
    "Seismographic": [
        "NNP"
    ], 
    "cheeseburgers": [
        "NNS"
    ], 
    "crackling": [
        "NN"
    ], 
    "ikey-kikey": [
        "JJ"
    ], 
    "gnaw": [
        "VB"
    ], 
    "ratio": [
        "NN"
    ], 
    "unedifying": [
        "JJ"
    ], 
    "probings": [
        "NNS"
    ], 
    "high-fidelity": [
        "NN"
    ], 
    "Solar": [
        "NNP", 
        "JJ"
    ], 
    "underfunded": [
        "VBN", 
        "JJ"
    ], 
    "Leasco": [
        "NNP"
    ], 
    "Katya": [
        "NNP"
    ], 
    "NATIONAL": [
        "NNP", 
        "JJ"
    ], 
    "telomeric": [
        "JJ"
    ], 
    "prides": [
        "VBZ"
    ], 
    "Plunging": [
        "VBG"
    ], 
    "fortifications": [
        "NNS"
    ], 
    "remoter": [
        "JJR"
    ], 
    "prided": [
        "VBD", 
        "VBN"
    ], 
    "revulsion": [
        "NN"
    ], 
    "European-minded": [
        "JJ"
    ], 
    "appreciatively": [
        "RB"
    ], 
    "Grumbled": [
        "VBD"
    ], 
    "seldom": [
        "RB"
    ], 
    "Alley": [
        "NNP", 
        "NN"
    ], 
    "Jeux": [
        "FW"
    ], 
    "guttered": [
        "VBD"
    ], 
    "Rundfunk": [
        "NNP"
    ], 
    "Allen": [
        "NNP", 
        "NNPS"
    ], 
    "electroreality": [
        "NN"
    ], 
    "PM": [
        "NNP"
    ], 
    "bluebloods": [
        "NNS"
    ], 
    "pouches": [
        "NNS"
    ], 
    "irradiation": [
        "NN"
    ], 
    "once-prevailing": [
        "JJ"
    ], 
    "Runyon": [
        "NNP"
    ], 
    "unmarried": [
        "JJ", 
        "VBN"
    ], 
    "Parkhouse": [
        "NNP"
    ], 
    "fanned": [
        "VBD", 
        "VBN"
    ], 
    "famine": [
        "NN"
    ], 
    "Winslow": [
        "NNP"
    ], 
    "matter-of-factly": [
        "RB"
    ], 
    "tackling": [
        "VBG"
    ], 
    "halides": [
        "NNS"
    ], 
    "big-daddy": [
        "JJ"
    ], 
    "Berlin": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "work-out": [
        "JJ", 
        "NN"
    ], 
    "Butt": [
        "NNP"
    ], 
    "herbal": [
        "JJ"
    ], 
    "Butz": [
        "NNP"
    ], 
    "Equations": [
        "NNS"
    ], 
    "extraordinary...": [
        ":"
    ], 
    "Antares": [
        "NNP"
    ], 
    "post-revolutionary": [
        "JJ"
    ], 
    "Palmolive": [
        "NNP"
    ], 
    "transluscent": [
        "JJ"
    ], 
    "OSHA": [
        "NNP"
    ], 
    "spitfire": [
        "NN"
    ], 
    "industrial-automation": [
        "NN"
    ], 
    "UNITED": [
        "NNP"
    ], 
    "Swamped": [
        "VBN"
    ], 
    "diocesan": [
        "JJ"
    ], 
    "self-interest": [
        "NN", 
        "JJ"
    ], 
    "heatshield": [
        "NN"
    ], 
    "successor-designate": [
        "JJ"
    ], 
    "unfrosted": [
        "VBN"
    ], 
    "characterization": [
        "NN"
    ], 
    "Chevalier": [
        "NNP"
    ], 
    "mirroring": [
        "VBG", 
        "NN"
    ], 
    "pilings": [
        "NNS"
    ], 
    "moreover": [
        "RB"
    ], 
    "imcomparable": [
        "JJ"
    ], 
    "deducting": [
        "VBG"
    ], 
    "capitalizations": [
        "NNS"
    ], 
    "Anthology": [
        "NNP"
    ], 
    "interleukin-1": [
        "NN"
    ], 
    "lawsuit": [
        "NN"
    ], 
    "rebuild": [
        "VB"
    ], 
    "manmade-fiber": [
        "JJ"
    ], 
    "SCECorp": [
        "NNP"
    ], 
    "lumpish": [
        "JJ"
    ], 
    "relatedness": [
        "NN"
    ], 
    "sewage-treatment": [
        "NN"
    ], 
    "whispers": [
        "NNS", 
        "VBZ"
    ], 
    "dangers": [
        "NNS"
    ], 
    "build-better-for-less": [
        "JJ"
    ], 
    "rebuilt": [
        "VBN"
    ], 
    "prie-dieu": [
        "FW"
    ], 
    "exhaustion": [
        "NN"
    ], 
    "shortages": [
        "NNS"
    ], 
    "pesticide": [
        "NN"
    ], 
    "Hamburg": [
        "NNP"
    ], 
    "non-veterans": [
        "NNS"
    ], 
    "Creamette": [
        "NNP"
    ], 
    "observers": [
        "NNS"
    ], 
    "Vorontsov": [
        "NNP"
    ], 
    "Enforcers": [
        "NNS"
    ], 
    "casino-company": [
        "NN"
    ], 
    "countless": [
        "JJ"
    ], 
    "OEX": [
        "NNP"
    ], 
    "Continuation": [
        "NN"
    ], 
    "Merced": [
        "NNP"
    ], 
    "fruitbowl": [
        "NN"
    ], 
    "Reins": [
        "NNP"
    ], 
    "pseudo-patriotism": [
        "NN"
    ], 
    "Serlin": [
        "NNP"
    ], 
    "Greenhouse": [
        "NN"
    ], 
    "OEL": [
        "NNP"
    ], 
    "dregs": [
        "NNS"
    ], 
    "Reine": [
        "NNP"
    ], 
    "landslide": [
        "NN"
    ], 
    "PARTICIPATED": [
        "VBD"
    ], 
    "piglets": [
        "NNS"
    ], 
    "Reina": [
        "NNP"
    ], 
    "baccalaureate": [
        "NN"
    ], 
    "Dice": [
        "NNS"
    ], 
    "Dick": [
        "NNP"
    ], 
    "Me-210": [
        "NNP", 
        "JJ"
    ], 
    "South-East": [
        "NNP"
    ], 
    "bias": [
        "NN"
    ], 
    "embrace": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "bestial": [
        "JJ"
    ], 
    "heels": [
        "NNS"
    ], 
    "multitudes": [
        "NNS"
    ], 
    "mediocre": [
        "JJ"
    ], 
    "Bolsa": [
        "NNP"
    ], 
    "Mediumistic": [
        "JJ"
    ], 
    "commuting": [
        "VBG", 
        "NN"
    ], 
    "Arden": [
        "NNP"
    ], 
    "epoch": [
        "NN"
    ], 
    "Lock-Up": [
        "NN"
    ], 
    "fair-weather": [
        "JJ"
    ], 
    "pedantic": [
        "JJ"
    ], 
    "finish": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "buccaneers": [
        "NNS"
    ], 
    "Shady": [
        "NNP"
    ], 
    "reunions": [
        "NNS"
    ], 
    "Pinsoneault": [
        "NNP"
    ], 
    "Stash": [
        "NNP"
    ], 
    "videotaped": [
        "VBN", 
        "VBD"
    ], 
    "Steelworkers": [
        "NNPS", 
        "NNP"
    ], 
    "woulda": [
        "MD"
    ], 
    "Shade": [
        "NNP", 
        "NN"
    ], 
    "Hersh": [
        "NNP"
    ], 
    "ringside": [
        "NN"
    ], 
    "inspector-general": [
        "JJ"
    ], 
    "Joining": [
        "VBG"
    ], 
    "Ackermann": [
        "NNP"
    ], 
    "theater": [
        "NN"
    ], 
    "fluorescein-labeled": [
        "JJ"
    ], 
    "sex-for-hire": [
        "JJ"
    ], 
    "diatomic": [
        "JJ"
    ], 
    "hospital-care": [
        "NN"
    ], 
    "slugged": [
        "VBD", 
        "VBN"
    ], 
    "choreography": [
        "NN"
    ], 
    "edema": [
        "NN"
    ], 
    "wintered": [
        "VBN"
    ], 
    "tablespoonful": [
        "NN", 
        "JJ"
    ], 
    "slugger": [
        "NN"
    ], 
    "slanting": [
        "VBG", 
        "JJ"
    ], 
    "dueling": [
        "VBG", 
        "NN"
    ], 
    "revaluation": [
        "NN"
    ], 
    "tirade": [
        "NN"
    ], 
    "daydreaming": [
        "NN"
    ], 
    "conclude": [
        "VB", 
        "VBP"
    ], 
    "sportin": [
        "VBG"
    ], 
    "washbasin": [
        "NN"
    ], 
    "ESOPs": [
        "NNS", 
        "NNP"
    ], 
    "well-set": [
        "JJ"
    ], 
    "sportif": [
        "FW"
    ], 
    "participative": [
        "JJ"
    ], 
    "near-solid": [
        "JJ"
    ], 
    "SoHo": [
        "NNP"
    ], 
    "real": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "Renwick": [
        "NNP"
    ], 
    "preliterate": [
        "JJ"
    ], 
    "Tuck": [
        "NNP"
    ], 
    "read": [
        "VB", 
        "NN", 
        "VBP|VBD", 
        "VBD", 
        "VBN", 
        "VBP", 
        "VBD|VBP"
    ], 
    "Phillip": [
        "NNP"
    ], 
    "detoxify": [
        "VB"
    ], 
    "Reorganized": [
        "NNP"
    ], 
    "leapfrog": [
        "VB", 
        "NN"
    ], 
    "quickness": [
        "NN"
    ], 
    "unreflective": [
        "JJ"
    ], 
    "detract": [
        "VB", 
        "VBP"
    ], 
    "pesetas": [
        "NNS"
    ], 
    "French-polished": [
        "JJ"
    ], 
    "Adrien": [
        "NNP"
    ], 
    "reap": [
        "VB", 
        "VBP"
    ], 
    "rear": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Kenlake": [
        "NNP"
    ], 
    "fractionally": [
        "RB"
    ], 
    "suppliers": [
        "NNS"
    ], 
    "yg-globulin": [
        "NN"
    ], 
    "Theocracy": [
        "NN"
    ], 
    "glass-making": [
        "NN", 
        "JJ"
    ], 
    "abjection": [
        "NN"
    ], 
    "evidencing": [
        "VBG"
    ], 
    "Hawkinses": [
        "NNPS"
    ], 
    "servile": [
        "JJ"
    ], 
    "rival-bashing": [
        "JJ"
    ], 
    "Szanton": [
        "NNP"
    ], 
    "hacks": [
        "NNS"
    ], 
    "astronomer": [
        "NN"
    ], 
    "Archives": [
        "NNPS", 
        "NNP"
    ], 
    "duration": [
        "NN"
    ], 
    "Barbaresco": [
        "NNP"
    ], 
    "slaughtering": [
        "VBG"
    ], 
    "putter": [
        "NN"
    ], 
    "recorded": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Landrieu": [
        "NNP"
    ], 
    "descents": [
        "NNS"
    ], 
    "Southeast": [
        "NNP", 
        "JJ", 
        "NN", 
        "RB"
    ], 
    "featherless": [
        "JJ"
    ], 
    "recorder": [
        "NN"
    ], 
    "putted": [
        "VBD"
    ], 
    "Marilyn": [
        "NNP"
    ], 
    "architectonic": [
        "JJ"
    ], 
    "stagecoaches": [
        "NNS"
    ], 
    "Hunt": [
        "NNP"
    ], 
    "dejection": [
        "NN"
    ], 
    "winnowing": [
        "NN"
    ], 
    "sedimentation": [
        "NN"
    ], 
    "seducing": [
        "VBG"
    ], 
    "hectic": [
        "JJ"
    ], 
    "Promotion": [
        "NNP", 
        "NN"
    ], 
    "anti-Catholic": [
        "JJ"
    ], 
    "fondness": [
        "NN"
    ], 
    "Weavers": [
        "NNS", 
        "NNPS"
    ], 
    "easy-to-read": [
        "JJ"
    ], 
    "explusion": [
        "NN"
    ], 
    "paints": [
        "NNS", 
        "VBZ"
    ], 
    "STRIPES": [
        "NNP"
    ], 
    "Grandmothers": [
        "NNP"
    ], 
    "greatly": [
        "RB"
    ], 
    "Forgot": [
        "VBN"
    ], 
    "Depressive": [
        "NNP"
    ], 
    "Dubaih": [
        "NNP"
    ], 
    "heater": [
        "NN"
    ], 
    "disinfectant": [
        "NN"
    ], 
    "Cousin": [
        "NNP", 
        "NN"
    ], 
    "more-advanced": [
        "JJ", 
        "JJR"
    ], 
    "Memories": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Fallout": [
        "NNP"
    ], 
    "Wyser-Pratte": [
        "NNP"
    ], 
    "Hung": [
        "NNP"
    ], 
    "nicotine": [
        "NN"
    ], 
    "Bard\\/EMS": [
        "NNP"
    ], 
    "heated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Steppers": [
        "NNPS", 
        "NNS"
    ], 
    "wellspring": [
        "NN"
    ], 
    "gungho": [
        "JJ"
    ], 
    "prepare": [
        "VB", 
        "VBP"
    ], 
    "co-ops": [
        "NN"
    ], 
    "Vaux": [
        "NNP"
    ], 
    "stoppage": [
        "NN"
    ], 
    "Engelken": [
        "NNP"
    ], 
    "DISPLAYED": [
        "VBD"
    ], 
    "Hotei": [
        "NNP"
    ], 
    "stealth": [
        "NN"
    ], 
    "Birthday": [
        "NN", 
        "NNP"
    ], 
    "unclasping": [
        "VBG"
    ], 
    "uremia": [
        "NN"
    ], 
    "faulted": [
        "VBN", 
        "VBD"
    ], 
    "eluate": [
        "NN"
    ], 
    "Motorcycles": [
        "NNS"
    ], 
    "highway-relief": [
        "JJ"
    ], 
    "Nagykanizsa": [
        "NNP"
    ], 
    "TSH-treated": [
        "JJ"
    ], 
    "Calimala": [
        "NNP"
    ], 
    "Tripoli": [
        "NNP"
    ], 
    "DDG-51": [
        "NNP"
    ], 
    "Calcutta": [
        "NNP"
    ], 
    "appareled": [
        "VBN"
    ], 
    "irreversible": [
        "JJ"
    ], 
    "Department-store": [
        "JJ"
    ], 
    "McKay": [
        "NNP"
    ], 
    "Leinoff": [
        "NNP"
    ], 
    "Monday-morning": [
        "JJ"
    ], 
    "comics": [
        "NNS"
    ], 
    "condemnatory": [
        "JJ"
    ], 
    "Leyte": [
        "NNP"
    ], 
    "enameling": [
        "NN", 
        "VBG"
    ], 
    "Grisebach": [
        "NNP"
    ], 
    "Grenfell": [
        "NNP"
    ], 
    "keyboarding": [
        "VBG"
    ], 
    "Shrugged": [
        "VBN"
    ], 
    "builders": [
        "NNS"
    ], 
    "Nobuya": [
        "NNP"
    ], 
    "commercial-banking": [
        "NN", 
        "JJ"
    ], 
    "septa": [
        "NNS"
    ], 
    "cartons": [
        "NNS"
    ], 
    "oxen": [
        "NNS"
    ], 
    "subdue": [
        "VB"
    ], 
    "Cemetery": [
        "NNP", 
        "NN"
    ], 
    "sales": [
        "NNS", 
        "JJ", 
        "VBZ"
    ], 
    "pummeling": [
        "NN"
    ], 
    "Tijd": [
        "NNP"
    ], 
    "erawhere": [
        "NN"
    ], 
    "reassumed": [
        "VBN"
    ], 
    "flat-to-lower": [
        "JJ"
    ], 
    "credibility": [
        "NN"
    ], 
    "storage": [
        "NN", 
        "JJ"
    ], 
    "thither": [
        "RB"
    ], 
    "cinematography": [
        "NN"
    ], 
    "hobbyists": [
        "NNS"
    ], 
    "gambling": [
        "NN", 
        "VBG"
    ], 
    "seven-week-old": [
        "JJ"
    ], 
    "surest": [
        "JJS"
    ], 
    "Vicki": [
        "NNP"
    ], 
    "Iwatare": [
        "NNP"
    ], 
    "desolation": [
        "NN"
    ], 
    "Misinformation": [
        "NN"
    ], 
    "eromonga": [
        "FW"
    ], 
    "Renaults": [
        "NNPS"
    ], 
    "technologies\\": [
        "JJ"
    ], 
    "flattened": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "nerve-racking": [
        "JJ"
    ], 
    "Pissarro": [
        "NNP"
    ], 
    "Surrealists": [
        "NNS"
    ], 
    "Whitefish": [
        "NNP"
    ], 
    "Stuffing": [
        "VBG"
    ], 
    "chords": [
        "NNS"
    ], 
    "adsorbed": [
        "VBN"
    ], 
    "Workshops": [
        "NNS"
    ], 
    "pectoral-front": [
        "JJ"
    ], 
    "titration": [
        "NN"
    ], 
    "Gypsy": [
        "NN"
    ], 
    "Ovitz": [
        "NNP"
    ], 
    "Pablo": [
        "NNP"
    ], 
    "maturity": [
        "NN"
    ], 
    "beachhead": [
        "NN"
    ], 
    "hateful": [
        "JJ"
    ], 
    "pointing": [
        "VBG", 
        "NN"
    ], 
    "Griesa": [
        "NNP"
    ], 
    "rumdum": [
        "NN"
    ], 
    "splitting": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "slimming": [
        "VBG"
    ], 
    "Alcarria": [
        "NNP"
    ], 
    "bequeath": [
        "VB"
    ], 
    "cardiologist": [
        "NN"
    ], 
    "gaucherie": [
        "NN"
    ], 
    "Schmidt": [
        "NNP"
    ], 
    "Astwood": [
        "NNP"
    ], 
    "dimesize": [
        "JJ"
    ], 
    "Brown": [
        "NNP", 
        "JJ"
    ], 
    "compatiblizers": [
        "NNS"
    ], 
    "altruism": [
        "NN"
    ], 
    "FORCE": [
        "VBP"
    ], 
    "interior-decorating": [
        "JJ"
    ], 
    "Ralston": [
        "NNP"
    ], 
    "Syms": [
        "NNP", 
        "NNS"
    ], 
    "Parallel": [
        "JJ"
    ], 
    "mpg": [
        "NN"
    ], 
    "sprains": [
        "NNS"
    ], 
    "Recovering": [
        "VBG"
    ], 
    "very": [
        "RB", 
        "JJ"
    ], 
    "indubitable": [
        "JJ"
    ], 
    "officials-cum-drug-traffickers": [
        "NNS"
    ], 
    "based-CAE": [
        "JJ|NP"
    ], 
    "mph": [
        "NN", 
        "JJ"
    ], 
    "vertex": [
        "NN"
    ], 
    "verb": [
        "NN"
    ], 
    "minded": [
        "VBD", 
        "VBN"
    ], 
    "UVB": [
        "NN"
    ], 
    "austerity": [
        "NN"
    ], 
    "morphemic": [
        "JJ"
    ], 
    "suzerain": [
        "NN"
    ], 
    "randomness": [
        "NN"
    ], 
    "Beethoven": [
        "NNP"
    ], 
    "Khalifa": [
        "NNP"
    ], 
    "guileless": [
        "JJ"
    ], 
    "Midnight": [
        "NNP"
    ], 
    "Kruger": [
        "NNP"
    ], 
    "Ancel": [
        "NNP"
    ], 
    "Electrostatic": [
        "JJ"
    ], 
    "cash-rich": [
        "JJ"
    ], 
    "Wyo.": [
        "NNP"
    ], 
    "Reiss": [
        "NNP"
    ], 
    "Henrich": [
        "NNP"
    ], 
    "Genuine": [
        "NNP"
    ], 
    "TSH": [
        "NNP"
    ], 
    "TSB": [
        "NNP"
    ], 
    "reminiscence": [
        "NN"
    ], 
    "self-contained": [
        "JJ", 
        "NN"
    ], 
    "Glaxo": [
        "NNP"
    ], 
    "ELECTRONICS": [
        "NNP"
    ], 
    "Valens": [
        "NNP"
    ], 
    "Circles": [
        "NNS"
    ], 
    "papering": [
        "VBG"
    ], 
    "apologizes": [
        "VBZ"
    ], 
    "Widened": [
        "VBD"
    ], 
    "bituminous": [
        "JJ"
    ], 
    "three-game": [
        "JJ"
    ], 
    "Ronnie": [
        "NNP"
    ], 
    "Harmful": [
        "JJ"
    ], 
    "Feeney": [
        "NNP"
    ], 
    "apologized": [
        "VBD", 
        "VBN"
    ], 
    "Probing": [
        "VBG"
    ], 
    "egalitarianism": [
        "NN"
    ], 
    "Tammany": [
        "NNP"
    ], 
    "repugnant": [
        "JJ"
    ], 
    "Violeta": [
        "NNP"
    ], 
    "Alexei": [
        "NNP"
    ], 
    "entailing": [
        "VBG"
    ], 
    "recruits": [
        "NNS", 
        "VBZ"
    ], 
    "rudimentary": [
        "JJ"
    ], 
    "answers": [
        "NNS", 
        "VBZ"
    ], 
    "Grindlay": [
        "NNP"
    ], 
    "sardines": [
        "NNS"
    ], 
    "yummy": [
        "JJ", 
        "NN"
    ], 
    "consumer-oriented": [
        "JJ"
    ], 
    "conflation": [
        "NN"
    ], 
    "Borden": [
        "NNP", 
        "NN"
    ], 
    "interposed": [
        "VBN"
    ], 
    "Phamaceutical": [
        "NNP"
    ], 
    "will-to-power": [
        "NN"
    ], 
    "ahead": [
        "RB", 
        "JJ"
    ], 
    "disclaimers": [
        "NNS"
    ], 
    "dream-ridden": [
        "JJ"
    ], 
    "telecast": [
        "NN"
    ], 
    "soldier": [
        "NN"
    ], 
    "bestowal": [
        "NN"
    ], 
    "whoppers": [
        "NNS"
    ], 
    "innovativeness": [
        "NN"
    ], 
    "Woessner": [
        "NNP"
    ], 
    "Border": [
        "NNP", 
        "NN"
    ], 
    "Victor": [
        "NNP"
    ], 
    "sidearms": [
        "NNS"
    ], 
    "Independents": [
        "NNPS"
    ], 
    "Exactly": [
        "RB"
    ], 
    "T-1600": [
        "NNP"
    ], 
    "capacity-expansion": [
        "JJ", 
        "NN"
    ], 
    "agonized": [
        "VBD", 
        "JJ"
    ], 
    "order-entry": [
        "JJ", 
        "NN"
    ], 
    "Molesworth": [
        "NNP"
    ], 
    "Compulsions": [
        "NNP"
    ], 
    "original-issue": [
        "JJ"
    ], 
    "unpleasantness": [
        "NN"
    ], 
    "income-producing": [
        "JJ"
    ], 
    "Clarks": [
        "NNS"
    ], 
    "Tredyffrin": [
        "NNP"
    ], 
    "easy-to-use": [
        "JJ"
    ], 
    "Creating": [
        "VBG"
    ], 
    "Elf": [
        "NNP"
    ], 
    "injure": [
        "VB", 
        "VBP"
    ], 
    "overharvesting": [
        "NN"
    ], 
    "microeconomics": [
        "NNS"
    ], 
    "reserving": [
        "VBG"
    ], 
    "Lapham": [
        "NNP"
    ], 
    "CLUBS": [
        "NNS"
    ], 
    "ROME": [
        "NNP"
    ], 
    "girds": [
        "VBZ"
    ], 
    "doubtlessly": [
        "RB"
    ], 
    "wide-winged": [
        "JJ"
    ], 
    "injury": [
        "NN"
    ], 
    "stand-up": [
        "JJ"
    ], 
    "erode": [
        "VB", 
        "VBP"
    ], 
    "Policemen": [
        "NNS", 
        "NNPS"
    ], 
    "Chickens": [
        "NNS"
    ], 
    "Colson": [
        "NNP"
    ], 
    "powerhouses": [
        "NNS"
    ], 
    "suction": [
        "NN"
    ], 
    "Oral": [
        "NNP"
    ], 
    "Oran": [
        "NNP"
    ], 
    "Sheila": [
        "NNP"
    ], 
    "aspirational": [
        "JJ"
    ], 
    "Yoshitoki": [
        "NNP"
    ], 
    "AFDC": [
        "NNP"
    ], 
    "metal-cutting": [
        "JJ"
    ], 
    "Hartlib": [
        "NNP"
    ], 
    "sweeps": [
        "NNS", 
        "VBZ"
    ], 
    "Soxhlet": [
        "NN"
    ], 
    "peals": [
        "NNS"
    ], 
    "reshaping": [
        "VBG", 
        "NN"
    ], 
    "Kerkorian": [
        "NNP"
    ], 
    "Staining": [
        "VBG"
    ], 
    "missile-transporter": [
        "NN"
    ], 
    "parasol": [
        "NN"
    ], 
    "stampede": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Chubb": [
        "NNP"
    ], 
    "Bronislava": [
        "NNP"
    ], 
    "near-misses": [
        "NN"
    ], 
    "exclude": [
        "VB", 
        "VBP"
    ], 
    "grey-skied": [
        "JJ"
    ], 
    "sci-fi": [
        "JJ", 
        "NN"
    ], 
    "Wergeland": [
        "NNP"
    ], 
    "lithographic": [
        "JJ"
    ], 
    "pocketful": [
        "NN"
    ], 
    "telefax": [
        "NN"
    ], 
    "cloying": [
        "JJ", 
        "JJ|VBG"
    ], 
    "ransom": [
        "NN"
    ], 
    "Ganis": [
        "NNP"
    ], 
    "Heightened": [
        "JJ"
    ], 
    "tattoo": [
        "NN"
    ], 
    "Fitzpatrick": [
        "NNP"
    ], 
    "Pass": [
        "NNP", 
        "VB"
    ], 
    "germinal": [
        "JJ"
    ], 
    "Yilin": [
        "NNP"
    ], 
    "rose-of-Sharon": [
        "NN"
    ], 
    "idiocy": [
        "NN"
    ], 
    "roadblocks": [
        "NNS"
    ], 
    "escutcheon": [
        "NN"
    ], 
    "collectability": [
        "NN"
    ], 
    "gasp": [
        "NN", 
        "VB"
    ], 
    "inconceivable": [
        "JJ"
    ], 
    "INC.": [
        "NNP"
    ], 
    "Milcote": [
        "NNP"
    ], 
    "Adamec": [
        "NNP"
    ], 
    "prerequisites": [
        "NNS"
    ], 
    "lava-rocks": [
        "NNS"
    ], 
    "mortgage-backed-securities": [
        "NNS"
    ], 
    "overnight": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "buns": [
        "NNS"
    ], 
    "renewing": [
        "VBG"
    ], 
    "Fila": [
        "NNP"
    ], 
    "Ubermenschen": [
        "NNPS"
    ], 
    "File": [
        "NN", 
        "VB"
    ], 
    "Film": [
        "NNP"
    ], 
    "Fill": [
        "VB", 
        "VBP"
    ], 
    "chicks": [
        "NNS"
    ], 
    "Fishery": [
        "NNP"
    ], 
    "uncensored": [
        "JJ"
    ], 
    "Floresville": [
        "NNP"
    ], 
    "Africans": [
        "NNPS", 
        "NNP"
    ], 
    "dine": [
        "VB"
    ], 
    "space-station": [
        "NN", 
        "JJ"
    ], 
    "tousled": [
        "VBN", 
        "JJ"
    ], 
    "rebuilder": [
        "NN"
    ], 
    "non-negative": [
        "JJ"
    ], 
    "then-owner": [
        "JJ"
    ], 
    "Cardinals": [
        "NNP", 
        "NNPS"
    ], 
    "Superstition": [
        "NN"
    ], 
    "painstaking": [
        "JJ"
    ], 
    "fines": [
        "NNS", 
        "NN"
    ], 
    "post-war": [
        "JJ", 
        "NN"
    ], 
    "fool": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "drunk-and-disorderlies": [
        "NNS"
    ], 
    "spear-throwing": [
        "JJ"
    ], 
    "Syndicates": [
        "NNS"
    ], 
    "food": [
        "NN"
    ], 
    "awarding": [
        "VBG", 
        "NN"
    ], 
    "prenatal": [
        "JJ", 
        "RB"
    ], 
    "grandfathers": [
        "NNS"
    ], 
    "Syndicated": [
        "NNP"
    ], 
    "Sunward": [
        "NNP"
    ], 
    "foot": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "sixth-grade": [
        "JJ"
    ], 
    "Stillwell": [
        "NNP"
    ], 
    "Lewisohn": [
        "NNP"
    ], 
    "desperately": [
        "RB"
    ], 
    "SFX": [
        "NNP"
    ], 
    "croupier": [
        "NN"
    ], 
    "Suns": [
        "NNPS", 
        "NNS"
    ], 
    "sailor": [
        "NN"
    ], 
    "Ekwanok": [
        "NNP"
    ], 
    "heavyweights": [
        "NNS"
    ], 
    "D&H": [
        "NNP"
    ], 
    "Bueno": [
        "FW"
    ], 
    "SFD": [
        "NNP"
    ], 
    "SFE": [
        "NNP"
    ], 
    "Sung": [
        "NNP"
    ], 
    "Toland": [
        "NNP"
    ], 
    "in-grown": [
        "JJ"
    ], 
    "unachieved": [
        "VBN"
    ], 
    "savored": [
        "VBD", 
        "VBN"
    ], 
    "editor-in-chief": [
        "NN"
    ], 
    "inspirational": [
        "JJ"
    ], 
    "fees": [
        "NNS"
    ], 
    "gentlelady": [
        "NN"
    ], 
    "wacky": [
        "JJ"
    ], 
    "mortgage-servicing": [
        "NN"
    ], 
    "irreconcilable": [
        "JJ"
    ], 
    "cemented": [
        "VBN"
    ], 
    "bulking": [
        "VBG"
    ], 
    "Minella": [
        "NNP"
    ], 
    "Kessler": [
        "NNP"
    ], 
    "Starve": [
        "NNP", 
        "VB"
    ], 
    "Zemlya": [
        "NNP"
    ], 
    "Bloomingdales": [
        "NNP"
    ], 
    "presumptuous": [
        "JJ"
    ], 
    "since": [
        "IN", 
        "RB"
    ], 
    "temporary": [
        "JJ"
    ], 
    "InterNorth": [
        "NNP"
    ], 
    "ultrasonics": [
        "NNS"
    ], 
    "laxatives": [
        "NNS"
    ], 
    "M\\/A-Com": [
        "NNP"
    ], 
    "Bent-Arm": [
        "NNP"
    ], 
    "dunk": [
        "NN", 
        "VB"
    ], 
    "pun": [
        "NN"
    ], 
    "flaunt": [
        "VB", 
        "VBP"
    ], 
    "asw": [
        "NN"
    ], 
    "ast": [
        "JJ"
    ], 
    "forty-niners": [
        "NNS"
    ], 
    "production-sharing": [
        "JJ", 
        "NN"
    ], 
    "dung": [
        "NN"
    ], 
    "dune": [
        "NN"
    ], 
    "heroin": [
        "NN"
    ], 
    "ask": [
        "VB", 
        "VBP"
    ], 
    "spread-out": [
        "JJ"
    ], 
    "Palladio": [
        "NNP"
    ], 
    "ash": [
        "NN"
    ], 
    "pup": [
        "NN"
    ], 
    "Investments": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "heroic": [
        "JJ"
    ], 
    "ketorolac": [
        "NNP"
    ], 
    "Sohmer": [
        "NNP"
    ], 
    "perceptual": [
        "JJ"
    ], 
    "fugures": [
        "NNS"
    ], 
    "tenets": [
        "NNS"
    ], 
    "six-fold": [
        "RB"
    ], 
    "tortoises": [
        "NNS"
    ], 
    "cheering": [
        "VBG"
    ], 
    "Respect": [
        "NN"
    ], 
    "yield-management": [
        "NN"
    ], 
    "lantana": [
        "NN"
    ], 
    "Selma": [
        "NNP"
    ], 
    "liquefies": [
        "VBZ"
    ], 
    "DAYTON": [
        "NNP"
    ], 
    "penny-ante": [
        "JJ"
    ], 
    "reflected": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "Badura-Skoda-Vienna": [
        "NNP"
    ], 
    "Hubbell": [
        "NNP"
    ], 
    "tektites": [
        "NNS"
    ], 
    "alliterative": [
        "JJ"
    ], 
    "Gorce": [
        "NNP"
    ], 
    "herbicides": [
        "NNS"
    ], 
    "Jeremiah": [
        "NNP"
    ], 
    "Plekhanov": [
        "NNP"
    ], 
    "ballot-burning": [
        "JJ"
    ], 
    "Mortgage-backed": [
        "JJ"
    ], 
    "Lipchitz": [
        "NNP"
    ], 
    "price-setting": [
        "NN"
    ], 
    "handshaker": [
        "NN"
    ], 
    "diabetes": [
        "NN"
    ], 
    "vilification": [
        "NN"
    ], 
    "Brinkley": [
        "NNP"
    ], 
    "shifted": [
        "VBD", 
        "VBN"
    ], 
    "hardbound": [
        "JJ"
    ], 
    "Modell": [
        "NNP"
    ], 
    "Ventura": [
        "NNP"
    ], 
    "anti-Western": [
        "JJ"
    ], 
    "Venture": [
        "NNP", 
        "NN"
    ], 
    "McGraw": [
        "NNP"
    ], 
    "western": [
        "JJ"
    ], 
    "Gianicolo": [
        "NNP"
    ], 
    "Calais": [
        "NNP"
    ], 
    "Searle": [
        "NNP"
    ], 
    "squeaky": [
        "JJ", 
        "RB"
    ], 
    "inducted": [
        "VBN"
    ], 
    "collaborations": [
        "NNS"
    ], 
    "prejudged": [
        "VBN"
    ], 
    "squeaks": [
        "VBZ"
    ], 
    "photographing": [
        "VBG", 
        "NN"
    ], 
    "grogginess": [
        "NN"
    ], 
    "Leninskoye": [
        "NNP"
    ], 
    "Figs.": [
        "NNS", 
        "NN", 
        "NNP"
    ], 
    "Quotidien": [
        "NNP"
    ], 
    "Extinction": [
        "NNP"
    ], 
    "rationalizations": [
        "NNS"
    ], 
    "Saudis": [
        "NNPS", 
        "VBP"
    ], 
    "substantiated": [
        "JJ"
    ], 
    "Conduct": [
        "NNP", 
        "VB"
    ], 
    "Father": [
        "NNP", 
        "NN"
    ], 
    "juicy": [
        "JJ"
    ], 
    "unthematic": [
        "JJ"
    ], 
    "Stenhach": [
        "NNP"
    ], 
    "juice": [
        "NN"
    ], 
    "ecstatically": [
        "RB"
    ], 
    "bridled": [
        "VBN"
    ], 
    "income-oriented": [
        "JJ"
    ], 
    "sensual": [
        "JJ"
    ], 
    "GTE": [
        "NNP"
    ], 
    "Gruene": [
        "NNP"
    ], 
    "outbound": [
        "JJ"
    ], 
    "retracted": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Band-Aid": [
        "NNP"
    ], 
    "Arger": [
        "NNP"
    ], 
    "flaming": [
        "JJ", 
        "VBG"
    ], 
    "cargoes": [
        "NNS"
    ], 
    "labour": [
        "NN"
    ], 
    "checklist": [
        "NN"
    ], 
    "Ryrie": [
        "NNP"
    ], 
    "Puccini": [
        "NNP"
    ], 
    "Pissocra": [
        "NNP"
    ], 
    "repossesed": [
        "JJ"
    ], 
    "Thy": [
        "PRP", 
        "PRP$"
    ], 
    "frauds": [
        "NNS"
    ], 
    "Companies": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Kakutani": [
        "NNP"
    ], 
    "Foxmoor": [
        "NNP"
    ], 
    "Stronach": [
        "NNP"
    ], 
    "hothouse": [
        "JJ"
    ], 
    "Aviva": [
        "NNP"
    ], 
    "The": [
        "DT", 
        "NNP", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Mulligan": [
        "NNP"
    ], 
    "gregarious": [
        "JJ"
    ], 
    "Bolstering": [
        "VBG"
    ], 
    "prolongation": [
        "NN"
    ], 
    "Mommy": [
        "NNP"
    ], 
    "outbidding": [
        "VBG"
    ], 
    "Postscript": [
        "NNP"
    ], 
    "Momma": [
        "NNP"
    ], 
    "bridge-financing": [
        "JJ"
    ], 
    "Fishing": [
        "NNP", 
        "NN"
    ], 
    "World-wide": [
        "JJ"
    ], 
    "Mahagonny": [
        "NNP"
    ], 
    "giggles": [
        "NNS"
    ], 
    "acerbic": [
        "JJ"
    ], 
    "fiercest": [
        "JJS"
    ], 
    "Croonen": [
        "NNP"
    ], 
    "flounders": [
        "VBZ"
    ], 
    "hefted": [
        "VBD"
    ], 
    "top-notch": [
        "JJ"
    ], 
    "giggled": [
        "VBD", 
        "VBN"
    ], 
    "church-owned": [
        "JJ"
    ], 
    "begets": [
        "VBZ"
    ], 
    "Nishiki": [
        "NNP"
    ], 
    "copyright": [
        "NN", 
        "JJ"
    ], 
    "Norberto": [
        "NNP"
    ], 
    "government-plus": [
        "JJ"
    ], 
    "bonheur": [
        "NN"
    ], 
    "CHARLES": [
        "NNP"
    ], 
    "no-good-bums": [
        "NNS"
    ], 
    "darted": [
        "VBD"
    ], 
    "pre-history": [
        "JJ", 
        "NN"
    ], 
    "necking": [
        "NN"
    ], 
    "long-familiar": [
        "JJ"
    ], 
    "world-weary": [
        "JJ"
    ], 
    "pretty": [
        "RB", 
        "JJ"
    ], 
    "Bolger": [
        "NNP"
    ], 
    "NatWest": [
        "NNP"
    ], 
    "low-interest": [
        "JJ"
    ], 
    "seven-session": [
        "JJ"
    ], 
    "custodian": [
        "NN"
    ], 
    "custodial": [
        "JJ"
    ], 
    "trees": [
        "NNS"
    ], 
    "Dupuy": [
        "NNP"
    ], 
    "Crystal": [
        "NNP", 
        "NN"
    ], 
    "spackle": [
        "VB"
    ], 
    "tossing": [
        "VBG", 
        "NN"
    ], 
    "gloved": [
        "VBN", 
        "JJ"
    ], 
    "sacrificed": [
        "VBN"
    ], 
    "MICROSYSTEMS": [
        "NNP"
    ], 
    "full-bodied": [
        "JJ"
    ], 
    "sacrifices": [
        "NNS", 
        "VBZ"
    ], 
    "CHARITABLE": [
        "JJ"
    ], 
    "Unitarians": [
        "NNPS", 
        "NNP"
    ], 
    "gloves": [
        "NNS"
    ], 
    "glover": [
        "NN"
    ], 
    "battlegrounds": [
        "NNS"
    ], 
    "Pritchett": [
        "NNP"
    ], 
    "crams": [
        "VBZ"
    ], 
    "re-rated": [
        "VBN"
    ], 
    "W.N.": [
        "NNP"
    ], 
    "Decent": [
        "JJ"
    ], 
    "outboard": [
        "JJ"
    ], 
    "YEEEEEECH": [
        "UH"
    ], 
    "manning": [
        "VBG"
    ], 
    "horoscopes": [
        "NNS"
    ], 
    "transportation": [
        "NN"
    ], 
    "Knife-grinder": [
        "NNP"
    ], 
    "Babin": [
        "NNP"
    ], 
    "Liddle": [
        "NNP"
    ], 
    "patties": [
        "NNS"
    ], 
    "horrid": [
        "JJ"
    ], 
    "Lectec": [
        "NNP"
    ], 
    "dramatics": [
        "NNS"
    ], 
    "FATHER": [
        "NN"
    ], 
    "Tikopia": [
        "NNP"
    ], 
    "grocer": [
        "NN"
    ], 
    "VIDEO": [
        "NN", 
        "NNP"
    ], 
    "thermistor": [
        "NN"
    ], 
    "architect": [
        "NN"
    ], 
    "Kissinger": [
        "NNP"
    ], 
    "management-employee": [
        "NN"
    ], 
    "NHTSA": [
        "NNP"
    ], 
    "gynecologists": [
        "NNS"
    ], 
    "Zacks": [
        "NNP"
    ], 
    "genre": [
        "NN"
    ], 
    "Haro": [
        "NNP"
    ], 
    "Harm": [
        "NNP"
    ], 
    "Hark": [
        "NNP"
    ], 
    "unknowing": [
        "JJ"
    ], 
    "Fisk": [
        "NNP"
    ], 
    "Fish": [
        "NNP", 
        "NN"
    ], 
    "Hard": [
        "NNP", 
        "JJ", 
        "RB"
    ], 
    "Briscoe": [
        "NNP"
    ], 
    "Hara": [
        "NNP"
    ], 
    "Rhoads": [
        "NNP"
    ], 
    "watchtowers": [
        "NNS"
    ], 
    "crackpots": [
        "NNS"
    ], 
    "Allingham": [
        "NNP"
    ], 
    "Argiento": [
        "NNP"
    ], 
    "searchlights": [
        "NNS"
    ], 
    "government-held": [
        "JJ"
    ], 
    "batters": [
        "NNS", 
        "VBZ"
    ], 
    "likee": [
        "VB"
    ], 
    "ridiculing": [
        "VBG"
    ], 
    "trans-Canadian": [
        "JJ"
    ], 
    "assortments": [
        "NNS"
    ], 
    "Discussion": [
        "NN"
    ], 
    "strenghtening": [
        "VBG"
    ], 
    "ideologues": [
        "NNS"
    ], 
    "badminton": [
        "NN"
    ], 
    "Maidens": [
        "NNPS"
    ], 
    "likes": [
        "VBZ", 
        "NNS", 
        "NN"
    ], 
    "private-line": [
        "JJ"
    ], 
    "Mose": [
        "NNP"
    ], 
    "neck-deep": [
        "JJ"
    ], 
    "described": [
        "VBN", 
        "VBD"
    ], 
    "Mosk": [
        "NNP"
    ], 
    "Batangas": [
        "NNP"
    ], 
    "resellers": [
        "NNS"
    ], 
    "Most": [
        "JJS", 
        "NNP", 
        "RBS", 
        "RB"
    ], 
    "describes": [
        "VBZ"
    ], 
    "maintenance": [
        "NN"
    ], 
    "preventable": [
        "JJ"
    ], 
    "Astrid": [
        "NNP"
    ], 
    "SX-21": [
        "NNP"
    ], 
    "Tomoshige": [
        "NNP"
    ], 
    "Honecker": [
        "NNP"
    ], 
    "budgeted": [
        "VBN", 
        "VBD"
    ], 
    "three-foot-wide": [
        "JJ"
    ], 
    "lodgings": [
        "NNS"
    ], 
    "wet": [
        "JJ", 
        "NN", 
        "VBD", 
        "VB", 
        "VBP"
    ], 
    "append": [
        "VB"
    ], 
    "else": [
        "RB", 
        "JJ", 
        "NN"
    ], 
    "Westvaco": [
        "NNP"
    ], 
    "transacting": [
        "VBG"
    ], 
    "second-quarter": [
        "JJ", 
        "NN"
    ], 
    "referrals": [
        "NNS"
    ], 
    "utmost": [
        "JJ", 
        "NN"
    ], 
    "conspirator": [
        "NN"
    ], 
    "virologist": [
        "NN"
    ], 
    "all-paper": [
        "JJ", 
        "NN"
    ], 
    "governor": [
        "NN"
    ], 
    "Memotec": [
        "NNP"
    ], 
    "Verdi": [
        "NNP"
    ], 
    "Mallinckrodt": [
        "NNP"
    ], 
    "eateries": [
        "NNS"
    ], 
    "erupting": [
        "VBG"
    ], 
    "straggling": [
        "VBG"
    ], 
    "voters": [
        "NNS"
    ], 
    "Furthermore": [
        "RB"
    ], 
    "Spuyten": [
        "NNP"
    ], 
    "sharecrop": [
        "NN"
    ], 
    "cellular-phone": [
        "NN"
    ], 
    "wartorn": [
        "NN"
    ], 
    "Cassandras": [
        "NNPS"
    ], 
    "Meistersinger": [
        "NNP"
    ], 
    "shuttered": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Ryerson": [
        "NNP"
    ], 
    "shag": [
        "JJ"
    ], 
    "shad": [
        "NN"
    ], 
    "shah": [
        "NN"
    ], 
    "Meir": [
        "NNP"
    ], 
    "sham": [
        "NN", 
        "JJ"
    ], 
    "Huff": [
        "NNP"
    ], 
    "Pollution-control": [
        "JJ"
    ], 
    "receptions": [
        "NNS"
    ], 
    "curators": [
        "NNS"
    ], 
    "Transmission": [
        "NNP", 
        "NN"
    ], 
    "Alliant": [
        "NNP"
    ], 
    "overweight": [
        "JJ", 
        "NN"
    ], 
    "feds": [
        "NNS"
    ], 
    "user": [
        "NN"
    ], 
    "priceless": [
        "JJ"
    ], 
    "takeover-proof": [
        "JJ"
    ], 
    "plugs": [
        "NNS", 
        "VBZ"
    ], 
    "Telerama": [
        "NNP"
    ], 
    "much-beloved": [
        "JJ"
    ], 
    "unrolls": [
        "VBZ"
    ], 
    "wedged": [
        "VBN", 
        "VBD"
    ], 
    "grind": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "segmented": [
        "JJ"
    ], 
    "center-stage": [
        "JJ"
    ], 
    "stubbed": [
        "VBN"
    ], 
    "Vaezi": [
        "NNP"
    ], 
    "grins": [
        "NNS"
    ], 
    "Girl": [
        "NNP", 
        "NN"
    ], 
    "Dennis": [
        "NNP", 
        "NNS"
    ], 
    "mislaid": [
        "VBN"
    ], 
    "authoritatively": [
        "RB"
    ], 
    "distances": [
        "NNS", 
        "VBZ"
    ], 
    "Chugai": [
        "NNP"
    ], 
    "MOVED": [
        "VBD"
    ], 
    "escorted": [
        "VBD", 
        "VBN"
    ], 
    "atrophy": [
        "NN", 
        "VBP"
    ], 
    "unhedged": [
        "VBN"
    ], 
    "inlets": [
        "NNS"
    ], 
    "hemolytic": [
        "JJ"
    ], 
    "praying": [
        "VBG", 
        "NN"
    ], 
    "Killpath": [
        "NNP"
    ], 
    "$": [
        "$"
    ], 
    "moist": [
        "JJ"
    ], 
    "pier": [
        "NN"
    ], 
    "Football": [
        "NNP", 
        "NN"
    ], 
    "guaranteed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Finished": [
        "VBN"
    ], 
    "havin": [
        "VBG"
    ], 
    "Spiegelman": [
        "NNP"
    ], 
    "specialty-chemical": [
        "NN"
    ], 
    "Germany": [
        "NNP"
    ], 
    "decontamination": [
        "NN"
    ], 
    "guarantees": [
        "NNS", 
        "VBZ"
    ], 
    "Maclean": [
        "NNP"
    ], 
    "Tivoli": [
        "NNP"
    ], 
    "march": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "fast-acting": [
        "JJ"
    ], 
    "Stallkamp": [
        "NNP"
    ], 
    "thousand-person": [
        "JJ"
    ], 
    "culturally": [
        "RB"
    ], 
    "Owego": [
        "NNP"
    ], 
    "Biehl": [
        "NNP"
    ], 
    "well-equipped": [
        "JJ"
    ], 
    "Waited": [
        "VBN"
    ], 
    "overriding": [
        "VBG", 
        "JJ"
    ], 
    "Shukri": [
        "NNP"
    ], 
    "Scanner": [
        "NNP"
    ], 
    "UBS": [
        "NNP"
    ], 
    "interestingly": [
        "RB"
    ], 
    "Smallwood": [
        "NNP"
    ], 
    "immunization": [
        "NN"
    ], 
    "Pepto-Bismol": [
        "NNP"
    ], 
    "Learning": [
        "NNP", 
        "VBG"
    ], 
    "Shu-tt": [
        "VB"
    ], 
    "woodshed": [
        "NN"
    ], 
    "Sidecar": [
        "NN"
    ], 
    "art-nouveau": [
        "JJ"
    ], 
    "brakes": [
        "NNS", 
        "VBZ"
    ], 
    "philandering": [
        "VBG"
    ], 
    "histology": [
        "NN"
    ], 
    "Salomonovich": [
        "NNP"
    ], 
    "trade-union": [
        "NN", 
        "JJ"
    ], 
    "fanfare": [
        "NN"
    ], 
    "Verbatim": [
        "JJ"
    ], 
    "higher-octane": [
        "JJ"
    ], 
    "Pittsburgh": [
        "NNP"
    ], 
    "gratuity": [
        "NN"
    ], 
    "exceeding": [
        "VBG", 
        "JJ"
    ], 
    "slash": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "phasing": [
        "VBG"
    ], 
    "Hokan": [
        "NNP"
    ], 
    "variances": [
        "NNS"
    ], 
    "chargin": [
        "VBG"
    ], 
    "ruh": [
        "FW"
    ], 
    "run": [
        "VB", 
        "VBD", 
        "VBN", 
        "VBP", 
        "NN"
    ], 
    "pulpwood": [
        "NN"
    ], 
    "rum": [
        "NN"
    ], 
    "rub": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "first-time": [
        "JJ"
    ], 
    "Pymm": [
        "NNP"
    ], 
    "rug": [
        "NN"
    ], 
    "rue": [
        "NN"
    ], 
    "macro-instructions": [
        "NNS"
    ], 
    "short-story": [
        "NN"
    ], 
    "panhandle": [
        "NN"
    ], 
    "ochre": [
        "JJ", 
        "NN"
    ], 
    "rut": [
        "NN"
    ], 
    "Grannell": [
        "NNP"
    ], 
    "integers": [
        "NNS"
    ], 
    "Girozentrale": [
        "NNP"
    ], 
    "Showdown": [
        "NNP"
    ], 
    "metrazol": [
        "NN"
    ], 
    "Lior": [
        "NNP"
    ], 
    "sourdough": [
        "JJ", 
        "NN"
    ], 
    "Lion": [
        "NNP"
    ], 
    "Courier-Journal": [
        "NNP"
    ], 
    "F.O.O.D.": [
        "NNP"
    ], 
    "nonequivalent": [
        "JJ"
    ], 
    "Diagnosis": [
        "NNP"
    ], 
    "Thomp": [
        "NN"
    ], 
    "Eclectic": [
        "JJ"
    ], 
    "gambits": [
        "NNS"
    ], 
    "Racing": [
        "NNP", 
        "VBG"
    ], 
    "rolls": [
        "NNS", 
        "VBZ"
    ], 
    "Racine": [
        "NNP"
    ], 
    "Caddy": [
        "NNP"
    ], 
    "accountability": [
        "NN"
    ], 
    "marble-encased": [
        "JJ"
    ], 
    "heritage": [
        "NN"
    ], 
    "Northamptonshire": [
        "NNP"
    ], 
    "Kuster": [
        "NNP"
    ], 
    "Noll": [
        "NNP"
    ], 
    "sizzle": [
        "NN", 
        "VB"
    ], 
    "bursitis": [
        "NN"
    ], 
    "lowprofile": [
        "JJ"
    ], 
    "syndicators": [
        "NNS"
    ], 
    "Individuals": [
        "NNS"
    ], 
    "Micronite": [
        "NN"
    ], 
    "warlike": [
        "JJ"
    ], 
    "fiber-end": [
        "JJ"
    ], 
    "Bostic": [
        "NNP"
    ], 
    "Kazis": [
        "NNP"
    ], 
    "lacheln": [
        "FW"
    ], 
    "Lilac": [
        "NNP"
    ], 
    "physical-chemical": [
        "JJ"
    ], 
    "U.N.-sponsored": [
        "JJ"
    ], 
    "Bostik": [
        "NNP"
    ], 
    "Tyszkiewicz": [
        "NNP"
    ], 
    "Murray": [
        "NNP", 
        "NN"
    ], 
    "foresight": [
        "NN"
    ], 
    "origin...": [
        ":"
    ], 
    "gymnastics": [
        "NNS"
    ], 
    "stragglers": [
        "NNS"
    ], 
    "Wis.-based": [
        "JJ"
    ], 
    "Haarlem": [
        "NNP"
    ], 
    "Uchida": [
        "NNP"
    ], 
    "Shaw-Crier": [
        "NNP"
    ], 
    "fleshpots": [
        "NNS"
    ], 
    "animal-health": [
        "NN"
    ], 
    "Sizova": [
        "NNP"
    ], 
    "tormenters": [
        "NNS"
    ], 
    "pattered": [
        "VBD"
    ], 
    "Summertime": [
        "NN"
    ], 
    "tomography": [
        "NN"
    ], 
    "Kyodo": [
        "NNP"
    ], 
    "rough-tough": [
        "JJ"
    ], 
    "Lugar": [
        "NNP"
    ], 
    "ECUs": [
        "NNS"
    ], 
    "Kazan": [
        "NNP"
    ], 
    "Leather": [
        "NNP"
    ], 
    "preachers": [
        "NNS"
    ], 
    "Speaking": [
        "VBG", 
        "NN", 
        "NNP"
    ], 
    "vagabonds": [
        "NNS"
    ], 
    "lap-top": [
        "JJ"
    ], 
    "curriculum": [
        "NN"
    ], 
    "spectators": [
        "NNS"
    ], 
    "re-election": [
        "NN", 
        "JJ"
    ], 
    "visits": [
        "NNS", 
        "VBZ"
    ], 
    "Thought": [
        "NNP", 
        "VBD", 
        "NN"
    ], 
    "neocortex": [
        "NN"
    ], 
    "Teague": [
        "NNP"
    ], 
    "Emmett": [
        "NNP"
    ], 
    "S&P-down": [
        "NN"
    ], 
    "Mexicanos": [
        "NNP"
    ], 
    "required": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "humiliated": [
        "VBN", 
        "JJ"
    ], 
    "cable-TV-system": [
        "NN"
    ], 
    "factually": [
        "RB"
    ], 
    "humiliates": [
        "VBZ"
    ], 
    "requires": [
        "VBZ"
    ], 
    "evenly": [
        "RB"
    ], 
    "block-buster": [
        "NN"
    ], 
    "eradicated": [
        "VBN", 
        "VBD"
    ], 
    "nuns": [
        "NNS"
    ], 
    "Pell": [
        "NNP", 
        "NN"
    ], 
    "unalloyed": [
        "JJ"
    ], 
    "Wright-style": [
        "JJ"
    ], 
    "marbleizing": [
        "NN"
    ], 
    "go": [
        "VB", 
        "JJ", 
        "NN", 
        "RP", 
        "VBP"
    ], 
    "gm": [
        "NN"
    ], 
    "Integrated": [
        "NNP"
    ], 
    "Af-fold": [
        "JJ"
    ], 
    "Cuisinart": [
        "NNP"
    ], 
    "baron": [
        "NN"
    ], 
    "earthbound": [
        "JJ"
    ], 
    "transacted": [
        "VBN"
    ], 
    "chinos": [
        "NNS"
    ], 
    "wizard": [
        "NN"
    ], 
    "airplay": [
        "NN"
    ], 
    "government-owned": [
        "JJ"
    ], 
    "attired": [
        "JJ", 
        "VBN"
    ], 
    "brass-bound": [
        "JJ"
    ], 
    "Bet": [
        "NNP"
    ], 
    "Goriot": [
        "NNP"
    ], 
    "schooner": [
        "NN"
    ], 
    "Pulley": [
        "NNP"
    ], 
    "pro-family": [
        "NN"
    ], 
    "thermos": [
        "NN"
    ], 
    "self-diagnostic": [
        "JJ"
    ], 
    "Pullen": [
        "NNP"
    ], 
    "Bisi": [
        "NNP"
    ], 
    "SpA": [
        "NNP"
    ], 
    "defamatory": [
        "JJ"
    ], 
    "Hindelong": [
        "NNP"
    ], 
    "Teerlink": [
        "NNP"
    ], 
    "Spy": [
        "NNP"
    ], 
    "tonal": [
        "JJ"
    ], 
    "non-food": [
        "JJ", 
        "NN"
    ], 
    "cyclosporine": [
        "NN", 
        "JJ"
    ], 
    "Schuylkill": [
        "NNP", 
        "NN"
    ], 
    "insurance-premium-finance": [
        "JJ"
    ], 
    "Spa": [
        "NNP"
    ], 
    "innately": [
        "RB"
    ], 
    "Solebury": [
        "NNP"
    ], 
    "five-count": [
        "JJ"
    ], 
    "oddball": [
        "JJ"
    ], 
    "Thynne": [
        "NNP"
    ], 
    "jetplane": [
        "NN"
    ], 
    "punishing": [
        "VBG", 
        "JJ"
    ], 
    "digest-size": [
        "JJ"
    ], 
    "expunging": [
        "NN"
    ], 
    "Farentino": [
        "NNP"
    ], 
    "Same-store": [
        "JJ"
    ], 
    "clotting": [
        "VBG"
    ], 
    "predispositions": [
        "NNS"
    ], 
    "Soothing": [
        "VBG"
    ], 
    "limited-edition": [
        "JJ"
    ], 
    "Poirot": [
        "NNP"
    ], 
    "Rohatyn": [
        "NNP"
    ], 
    "auspices": [
        "NNS"
    ], 
    "Briefly": [
        "RB"
    ], 
    "sophists": [
        "NNS"
    ], 
    "Boyd": [
        "NNP"
    ], 
    "opaque": [
        "JJ"
    ], 
    "dealer": [
        "NN"
    ], 
    "espresso": [
        "NN"
    ], 
    "Boym": [
        "NNP"
    ], 
    "Boys": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "rotten": [
        "JJ"
    ], 
    "Kirkland": [
        "NNP"
    ], 
    "Aulnay": [
        "NNP"
    ], 
    "schoolboys": [
        "NNS"
    ], 
    "Quatre": [
        "NNP"
    ], 
    "newcasts": [
        "NNS"
    ], 
    "vodkas": [
        "NNS"
    ], 
    "burnt-red": [
        "JJ"
    ], 
    "A.D.L.": [
        "NNP"
    ], 
    "Houghton": [
        "NNP"
    ], 
    "stance": [
        "NN"
    ], 
    "brokering": [
        "VBG", 
        "NN"
    ], 
    "stanch": [
        "VB", 
        "JJ"
    ], 
    "stock-fraud": [
        "NN"
    ], 
    "BANKERS": [
        "NNS", 
        "NNPS"
    ], 
    "woolly-headed": [
        "JJ"
    ], 
    "growing": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "inceptor": [
        "NN"
    ], 
    "Crimean": [
        "NNP"
    ], 
    "affidavits": [
        "NNS"
    ], 
    "Hedding": [
        "NNP"
    ], 
    "material0F.": [
        "NN"
    ], 
    "likened": [
        "VBD", 
        "VBN"
    ], 
    "Colder": [
        "JJR"
    ], 
    "PATTON": [
        "NNP"
    ], 
    "Aho": [
        "NNP"
    ], 
    "Billheimer": [
        "NNP"
    ], 
    "repel": [
        "VB", 
        "VBP"
    ], 
    "products": [
        "NNS"
    ], 
    "cataloging": [
        "VBG"
    ], 
    "fellow-men": [
        "NNS"
    ], 
    "Wonder": [
        "NNP", 
        "NN", 
        "VBP"
    ], 
    "examining": [
        "VBG", 
        "NN"
    ], 
    "half-time": [
        "NN", 
        "JJ", 
        "RB"
    ], 
    "Portuguese-language": [
        "JJ"
    ], 
    "centum": [
        "NN"
    ], 
    "clout": [
        "NN"
    ], 
    "Lipson": [
        "NNP"
    ], 
    "Waldheim": [
        "NNP"
    ], 
    "ligament": [
        "NN"
    ], 
    "anomalies": [
        "NNS"
    ], 
    "horticultural": [
        "JJ"
    ], 
    "Dai-Tokyo": [
        "NNP"
    ], 
    "manipulate": [
        "VB", 
        "VBP"
    ], 
    "strapped": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "aspirants": [
        "NNS"
    ], 
    "swanlike": [
        "JJ"
    ], 
    "arsines": [
        "NNS"
    ], 
    "Birkhead": [
        "NNP"
    ], 
    "vine-crisscrossed": [
        "JJ"
    ], 
    "indefensible": [
        "JJ"
    ], 
    "Appropriations": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "statutes": [
        "NNS"
    ], 
    "benchmark": [
        "NN", 
        "JJ"
    ], 
    "self-criticism": [
        "NN"
    ], 
    "missile": [
        "NN"
    ], 
    "Editorial": [
        "JJ", 
        "NN"
    ], 
    "Anti-Ballistic": [
        "NNP"
    ], 
    "shrieked": [
        "VBD"
    ], 
    "burr-headed": [
        "JJ"
    ], 
    "SNET": [
        "NNP"
    ], 
    "RADIO": [
        "NN", 
        "NNP"
    ], 
    "nurture": [
        "VB", 
        "NN"
    ], 
    "Englanders": [
        "NNPS"
    ], 
    "repairman": [
        "NN"
    ], 
    "anthropological": [
        "JJ"
    ], 
    "headstand": [
        "NN"
    ], 
    "Similarities": [
        "NNS"
    ], 
    "Almighty": [
        "NNP"
    ], 
    "documenting": [
        "VBG"
    ], 
    "Aoki": [
        "NNP"
    ], 
    "hesitate": [
        "VB", 
        "VBP"
    ], 
    "sealift": [
        "NN"
    ], 
    "ambivalence": [
        "NN"
    ], 
    "reoriented": [
        "VBN"
    ], 
    "Rothschilds": [
        "NNPS"
    ], 
    "digested": [
        "VBN"
    ], 
    "Furey": [
        "NNP"
    ], 
    "poetry": [
        "NN"
    ], 
    "YOUR": [
        "JJ", 
        "PRP$"
    ], 
    "compiled": [
        "VBN", 
        "VBD"
    ], 
    "cladding": [
        "NN"
    ], 
    "ideologically": [
        "RB"
    ], 
    "pink": [
        "JJ", 
        "NN"
    ], 
    "fostered": [
        "VBN", 
        "VBD"
    ], 
    "entree": [
        "NN", 
        "FW"
    ], 
    "jiffy": [
        "NN"
    ], 
    "debasement": [
        "NN"
    ], 
    "Alleghenies": [
        "NNPS"
    ], 
    "Ltee": [
        "NNP"
    ], 
    "foment": [
        "VB"
    ], 
    "Ambassador-at-Large": [
        "NNP"
    ], 
    "sky-high": [
        "JJ"
    ], 
    "pansies": [
        "NNS"
    ], 
    "buoying": [
        "VBG"
    ], 
    "adjectival": [
        "JJ"
    ], 
    "Farewell": [
        "NNP"
    ], 
    "agenda": [
        "NN", 
        "NNS"
    ], 
    "supply-sider": [
        "NN"
    ], 
    "immensity": [
        "NN"
    ], 
    "unsolved": [
        "JJ"
    ], 
    "unbreakable": [
        "JJ"
    ], 
    "Hongkong": [
        "NNP"
    ], 
    "frescoing": [
        "NN"
    ], 
    "offences": [
        "NNS"
    ], 
    "bogeymen": [
        "NNS"
    ], 
    "stator": [
        "NN"
    ], 
    "Schantz": [
        "NNP"
    ], 
    "Patchen": [
        "NNP"
    ], 
    "Bangles": [
        "NNPS"
    ], 
    "PWA-owned": [
        "JJ"
    ], 
    "special-technology": [
        "NN"
    ], 
    "exclusion": [
        "NN"
    ], 
    "housewife": [
        "NN"
    ], 
    "Allocation": [
        "NN"
    ], 
    "still-to-be-named": [
        "JJ"
    ], 
    "stock-index-futures": [
        "NNS", 
        "JJ"
    ], 
    "Volunteer": [
        "NNP"
    ], 
    "Philibert": [
        "NNP"
    ], 
    "fieldmice": [
        "NN"
    ], 
    "sterios": [
        "NNS"
    ], 
    "pure": [
        "JJ"
    ], 
    "stratification": [
        "NN"
    ], 
    "unflaky": [
        "JJ"
    ], 
    "tile": [
        "NN"
    ], 
    "Salsich": [
        "NNP"
    ], 
    "Repeating": [
        "VBG"
    ], 
    "starchiness": [
        "NN"
    ], 
    "Coolest": [
        "JJS"
    ], 
    "Supreme": [
        "NNP"
    ], 
    "Yamane": [
        "NNP"
    ], 
    "fundraisers": [
        "NNS"
    ], 
    "McNear": [
        "NNP"
    ], 
    "foiling": [
        "VBG"
    ], 
    "McNeal": [
        "NNP"
    ], 
    "pools": [
        "NNS", 
        "VBZ"
    ], 
    "lead-exposure": [
        "JJ"
    ], 
    "indolently": [
        "RB"
    ], 
    "Displaying": [
        "VBG"
    ], 
    "denuclearized": [
        "VBN"
    ], 
    "Albertson": [
        "NNP"
    ], 
    "SURVEYS": [
        "NNS"
    ], 
    "prognosticators": [
        "NNS"
    ], 
    "aggravates": [
        "VBZ"
    ], 
    "Hoxan": [
        "NNP"
    ], 
    "chunk": [
        "NN"
    ], 
    "index-linked": [
        "JJ"
    ], 
    "aggravated": [
        "VBN", 
        "VBD"
    ], 
    "text-form": [
        "NN"
    ], 
    "seesaw": [
        "NN", 
        "JJ"
    ], 
    "designer": [
        "NN"
    ], 
    "sands": [
        "NNS"
    ], 
    "Narbonne": [
        "NNP"
    ], 
    "sandy": [
        "JJ"
    ], 
    "lukewarm": [
        "JJ"
    ], 
    "EGYPT": [
        "NNP"
    ], 
    "Season": [
        "NN", 
        "NNP"
    ], 
    "McVities": [
        "NNP"
    ], 
    "repositioning": [
        "NN", 
        "VBG"
    ], 
    "fathom": [
        "VB"
    ], 
    "Juliette": [
        "NNP"
    ], 
    "scimitar": [
        "NN"
    ], 
    "Towering": [
        "VBG", 
        "JJ"
    ], 
    "amendatory": [
        "JJ"
    ], 
    "spacesuits": [
        "NNS"
    ], 
    "Engle": [
        "NNP"
    ], 
    "Brumidi": [
        "NNP"
    ], 
    "Aptitude": [
        "NNP"
    ], 
    "terminated": [
        "VBN", 
        "VBD"
    ], 
    "Gershen": [
        "NNP"
    ], 
    "Fundamental": [
        "JJ", 
        "NNP"
    ], 
    "conservatives": [
        "NNS"
    ], 
    "alchemists": [
        "NNS"
    ], 
    "Judd-Boston": [
        "NNP"
    ], 
    "befriended": [
        "VBD", 
        "VBN"
    ], 
    "Steiger": [
        "NNP"
    ], 
    "post-hearing": [
        "JJ"
    ], 
    "Stuart-family": [
        "NN"
    ], 
    "McLendon": [
        "NNP"
    ], 
    "Guimet": [
        "NNP"
    ], 
    "childless": [
        "JJ"
    ], 
    "standbys": [
        "NNS"
    ], 
    "mono-iodotyrosine": [
        "JJ", 
        "NN"
    ], 
    "original-equipment": [
        "JJ", 
        "NN"
    ], 
    "Sondheim": [
        "NNP"
    ], 
    "Newburger": [
        "NNP"
    ], 
    "Hybritech": [
        "NNP"
    ], 
    "Managing": [
        "NNP", 
        "VBG", 
        "NN"
    ], 
    "reserve-building": [
        "NN"
    ], 
    "lobule": [
        "NN"
    ], 
    "Burdett": [
        "NNP"
    ], 
    "Gunner": [
        "NNP"
    ], 
    "introspective": [
        "JJ"
    ], 
    "Pantasaph": [
        "NNP"
    ], 
    "NORTHEAST": [
        "NN", 
        "NNP"
    ], 
    "fella": [
        "NN", 
        "UH"
    ], 
    "ASP": [
        "NNP"
    ], 
    "WORD": [
        "NN"
    ], 
    "AST": [
        "NNP"
    ], 
    "guys": [
        "NNS"
    ], 
    "WORK": [
        "VBP"
    ], 
    "adjoins": [
        "VBZ"
    ], 
    "AS\\": [
        "NNP", 
        "NN"
    ], 
    "chintz": [
        "VBP"
    ], 
    "attach": [
        "VB", 
        "VBP"
    ], 
    "attack": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "buckaroos": [
        "NNS"
    ], 
    "Odom": [
        "NNP"
    ], 
    "motorcyle": [
        "NN"
    ], 
    "Klan": [
        "NNP"
    ], 
    "Rinehart": [
        "NNP"
    ], 
    "Roquemore": [
        "NNP"
    ], 
    "Teixeira": [
        "NNP"
    ], 
    "Bini": [
        "NNP"
    ], 
    "DUN": [
        "NNP"
    ], 
    "Rev.": [
        "NNP"
    ], 
    "Bing": [
        "NNP"
    ], 
    "clanging": [
        "NN", 
        "VBG"
    ], 
    "DUF": [
        "NN"
    ], 
    "formalities": [
        "NNS"
    ], 
    "Bride": [
        "NNP"
    ], 
    "R": [
        "NN", 
        "NNP"
    ], 
    "Dutton": [
        "NNP"
    ], 
    "World-Telegram": [
        "NNP"
    ], 
    "overwhelming": [
        "JJ", 
        "VBG"
    ], 
    "updating": [
        "VBG", 
        "NN"
    ], 
    "Grossman": [
        "NNP"
    ], 
    "choreographed": [
        "VBN", 
        "JJ"
    ], 
    "Channing": [
        "NNP"
    ], 
    "Bognato": [
        "NNP"
    ], 
    "electroshock": [
        "NN"
    ], 
    "distinguishes": [
        "VBZ"
    ], 
    "beg": [
        "VBP", 
        "VB"
    ], 
    "bed": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "bee": [
        "NN"
    ], 
    "RENT-A-CAR": [
        "NNP"
    ], 
    "snazzy": [
        "JJ"
    ], 
    "distinguished": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "bet": [
        "NN", 
        "RB", 
        "VB", 
        "VBD", 
        "VBN", 
        "VBP"
    ], 
    "exhibit": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "rhythmic": [
        "JJ"
    ], 
    "Baris": [
        "NNP"
    ], 
    "Curtiss-Wright": [
        "NNP"
    ], 
    "R-stage": [
        "JJ"
    ], 
    "Gillette": [
        "NNP", 
        "NN"
    ], 
    "Swiggett": [
        "NNP"
    ], 
    "carrots": [
        "NNS"
    ], 
    "center-field": [
        "NN"
    ], 
    "photographic-products": [
        "JJ"
    ], 
    "sardonic": [
        "JJ"
    ], 
    "battlegroups": [
        "NNS"
    ], 
    "torment": [
        "NN", 
        "VB"
    ], 
    "all-options": [
        "JJ"
    ], 
    "Vegetable": [
        "NN"
    ], 
    "constrained": [
        "VBN", 
        "JJ"
    ], 
    "batwings": [
        "NNS"
    ], 
    "rice-processing": [
        "JJ"
    ], 
    "Isabel": [
        "NNP"
    ], 
    "mainstays": [
        "NNS"
    ], 
    "square-built": [
        "JJ"
    ], 
    "INVESTORS": [
        "NNS"
    ], 
    "Retton": [
        "NNP"
    ], 
    "no-frills": [
        "JJ"
    ], 
    "instancy": [
        "NN"
    ], 
    "Dillinger": [
        "NNP"
    ], 
    "self-hatred": [
        "NN"
    ], 
    "instance": [
        "NN"
    ], 
    "romances": [
        "NNS"
    ], 
    "dimming": [
        "VBG"
    ], 
    "option-related": [
        "JJ"
    ], 
    "floundered": [
        "VBN", 
        "VBD"
    ], 
    "hoodlums": [
        "NNS"
    ], 
    "Urals": [
        "NNPS", 
        "NNS"
    ], 
    "Worlders": [
        "NNPS"
    ], 
    "demise": [
        "NN"
    ], 
    "Norths": [
        "NNPS"
    ], 
    "nuisance": [
        "NN", 
        "JJ"
    ], 
    "Northy": [
        "NNP"
    ], 
    "bloodthirsty": [
        "JJ"
    ], 
    "Somersaults": [
        "NNS"
    ], 
    "consequences": [
        "NNS"
    ], 
    "WSJ\\/NBC": [
        "NNP", 
        "NN"
    ], 
    "semi-retired": [
        "JJ"
    ], 
    "Growth": [
        "NN", 
        "NNP"
    ], 
    "conventional-arms": [
        "NNS", 
        "JJ"
    ], 
    "Brendel": [
        "NNP"
    ], 
    "ex-franchise": [
        "NN"
    ], 
    "affair": [
        "NN"
    ], 
    "six-ton": [
        "JJ"
    ], 
    "reprehensible": [
        "JJ"
    ], 
    "kiddie": [
        "NN"
    ], 
    "adjudicator": [
        "NN"
    ], 
    "anyway": [
        "RB"
    ], 
    "contour-obliterating": [
        "JJ"
    ], 
    "farfetched": [
        "JJ"
    ], 
    "coal-mining": [
        "JJ"
    ], 
    "parked": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "unenvied": [
        "JJ"
    ], 
    "Manske": [
        "NNP"
    ], 
    "counterterror": [
        "JJ"
    ], 
    "boutiques": [
        "NNS"
    ], 
    "remunerated": [
        "VBN"
    ], 
    "Bonaccolta": [
        "NNP"
    ], 
    "fiberglass": [
        "NNS", 
        "NN"
    ], 
    "ever-lovin": [
        "JJ"
    ], 
    "millennia": [
        "NN", 
        "NNS"
    ], 
    "Creditanstalt-Bankverein": [
        "NNP"
    ], 
    "attained": [
        "VBD", 
        "VBN"
    ], 
    "sulfur": [
        "NN"
    ], 
    "stocks-index": [
        "JJ"
    ], 
    "Leszek": [
        "NNP"
    ], 
    "Medici": [
        "NNPS"
    ], 
    "quantified": [
        "VBN"
    ], 
    "Eats": [
        "NNS"
    ], 
    "bodybuilders": [
        "NNS"
    ], 
    "assimilable": [
        "JJ"
    ], 
    "User-friendly": [
        "JJ"
    ], 
    "Politically": [
        "RB"
    ], 
    "Ilva": [
        "NNP"
    ], 
    "ascended": [
        "VBD"
    ], 
    "evolution": [
        "NN"
    ], 
    "heart-wrenching": [
        "JJ"
    ], 
    "shy": [
        "JJ", 
        "NN", 
        "RB", 
        "VB", 
        "VBP"
    ], 
    "pricetags": [
        "NNS"
    ], 
    "uprisings": [
        "NNS"
    ], 
    "she": [
        "PRP"
    ], 
    "mixologists": [
        "NNS"
    ], 
    "Incrementally": [
        "RB"
    ], 
    "solicitous": [
        "JJ"
    ], 
    "flogged": [
        "VBD"
    ], 
    "Two-year": [
        "JJ"
    ], 
    "Stroking": [
        "VBG"
    ], 
    "sho": [
        "UH"
    ], 
    "movie-making": [
        "NN"
    ], 
    "home-building": [
        "JJ", 
        "NN"
    ], 
    "accuses": [
        "VBZ"
    ], 
    "accuser": [
        "NN"
    ], 
    "halving": [
        "VBG"
    ], 
    "WEFA": [
        "NNP"
    ], 
    "typhoons": [
        "NNS"
    ], 
    "inkling": [
        "NN"
    ], 
    "differs": [
        "VBZ"
    ], 
    "Williamstown": [
        "NNP"
    ], 
    "accused": [
        "VBN", 
        "VBD", 
        "JJ", 
        "NN"
    ], 
    "usefulness": [
        "NN"
    ], 
    "Tartary": [
        "NNP"
    ], 
    "configuration-data": [
        "JJ"
    ], 
    "pianism": [
        "NN"
    ], 
    "add-ons": [
        "NNS"
    ], 
    "Hergesheimer": [
        "NNP"
    ], 
    "Chiriqui": [
        "NNP"
    ], 
    "Dimaggio": [
        "NNP"
    ], 
    "horribly": [
        "RB"
    ], 
    "willpower": [
        "NN"
    ], 
    "arraigned": [
        "VBD", 
        "VBN"
    ], 
    "horrible": [
        "JJ", 
        "NN"
    ], 
    "neither": [
        "DT", 
        "NN", 
        "RB", 
        "CC"
    ], 
    "INCREASING": [
        "VBG"
    ], 
    "kidneys": [
        "NNS"
    ], 
    "Wipe": [
        "VB"
    ], 
    "BellSouth-LIN": [
        "NNP", 
        "JJ"
    ], 
    "McAlinden": [
        "NNP"
    ], 
    "ultracentrifugation": [
        "NN"
    ], 
    "spares": [
        "NNS", 
        "VBZ"
    ], 
    "Campo": [
        "NNP"
    ], 
    "Recall": [
        "VB", 
        "VBP"
    ], 
    "extolling": [
        "VBG"
    ], 
    "seemed": [
        "VBD", 
        "VBN"
    ], 
    "spared": [
        "VBN", 
        "VBD"
    ], 
    "Remain": [
        "VB"
    ], 
    "Race": [
        "NNP", 
        "NN"
    ], 
    "middle-level": [
        "JJ"
    ], 
    "ailerons": [
        "NNS"
    ], 
    "approval": [
        "NN"
    ], 
    "mujahideen": [
        "FW"
    ], 
    "Tunnard": [
        "NNP"
    ], 
    "undetermined": [
        "JJ"
    ], 
    "Poling": [
        "NNP"
    ], 
    "meritless": [
        "JJ"
    ], 
    "Revlon": [
        "NNP", 
        "NN"
    ], 
    "at-risk": [
        "JJ"
    ], 
    "control-room": [
        "NN"
    ], 
    "anchormen": [
        "NNS"
    ], 
    "Masson": [
        "NNP"
    ], 
    "year-before": [
        "JJ"
    ], 
    "Headlines": [
        "NNS"
    ], 
    "High-grade": [
        "JJ"
    ], 
    "fee-per-day": [
        "NN"
    ], 
    "Kyo-zan": [
        "NN"
    ], 
    "Chabrier": [
        "NNP"
    ], 
    "franchise": [
        "NN", 
        "VB"
    ], 
    "Tabuchi": [
        "NNP"
    ], 
    "quantity-based": [
        "JJ"
    ], 
    "feeblest": [
        "JJS"
    ], 
    "Regalia": [
        "NNP"
    ], 
    "Middle-Eastern": [
        "JJ"
    ], 
    "addition": [
        "NN"
    ], 
    "new-mown": [
        "JJ"
    ], 
    "Immigration": [
        "NNP"
    ], 
    "conjoined": [
        "VBN"
    ], 
    "chimiques": [
        "FW"
    ], 
    "MOTOR": [
        "NNP"
    ], 
    "do-nothing": [
        "JJ"
    ], 
    "Raider": [
        "NNP"
    ], 
    "armistice": [
        "NN"
    ], 
    "isolating": [
        "VBG", 
        "JJ"
    ], 
    "banshees": [
        "NNS"
    ], 
    "well-paid": [
        "JJ"
    ], 
    "Pretend": [
        "VB"
    ], 
    "SEC.": [
        "NNP"
    ], 
    "ghoulish": [
        "JJ"
    ], 
    "expenditure": [
        "NN"
    ], 
    "Repayment": [
        "NNP"
    ], 
    "Lutsenko": [
        "NNP"
    ], 
    "brunch": [
        "NN"
    ], 
    "capering": [
        "VBG"
    ], 
    "Logistics": [
        "NNP"
    ], 
    "owne": [
        "JJ"
    ], 
    "Tired": [
        "JJ", 
        "VBN"
    ], 
    "contexts": [
        "NNS"
    ], 
    "supervened": [
        "VBN"
    ], 
    "ripen": [
        "VBP"
    ], 
    "Avocado": [
        "NNP"
    ], 
    "chanceries": [
        "NNS"
    ], 
    "Tires": [
        "NNS", 
        "NNPS"
    ], 
    "disaster-subsidy": [
        "JJ"
    ], 
    "Rusty": [
        "NNP"
    ], 
    "tt": [
        "NN"
    ], 
    "non-surgical": [
        "JJ"
    ], 
    "inaccurately": [
        "RB"
    ], 
    "owns": [
        "VBZ"
    ], 
    "cornering": [
        "VBG"
    ], 
    "bi-modal": [
        "JJ"
    ], 
    "Cyprus": [
        "NNP"
    ], 
    "TAKING": [
        "VBG"
    ], 
    "ArgoSystems": [
        "NNPS"
    ], 
    "Troops": [
        "NNS", 
        "NNP"
    ], 
    "Laverty": [
        "NNP"
    ], 
    "neuron": [
        "NN"
    ], 
    "tonic": [
        "NN"
    ], 
    "interrogate": [
        "VB"
    ], 
    "plundered": [
        "VBN"
    ], 
    "deterence": [
        "NN"
    ], 
    "channel-zapping": [
        "JJ"
    ], 
    "disclosures": [
        "NNS", 
        "VBZ"
    ], 
    "windmill": [
        "NN"
    ], 
    "orbital": [
        "JJ", 
        "NN"
    ], 
    "Dresdner": [
        "NNP"
    ], 
    "calamitous": [
        "JJ"
    ], 
    "incumbent": [
        "JJ", 
        "NN"
    ], 
    "blight": [
        "NN"
    ], 
    "Machelle": [
        "NNP"
    ], 
    "Mix-Up": [
        "NN"
    ], 
    "Viareggio": [
        "NNP"
    ], 
    "post-reapportionment": [
        "JJ"
    ], 
    "Repairing": [
        "VBG"
    ], 
    "Huddle": [
        "NN"
    ], 
    "hardliner": [
        "NN"
    ], 
    "Financial-service": [
        "NN"
    ], 
    "rightfully": [
        "RB"
    ], 
    "Lucassen": [
        "NNP"
    ], 
    "compared": [
        "VBN", 
        "VBD"
    ], 
    "Sabo": [
        "NNP"
    ], 
    "wrongly": [
        "RB"
    ], 
    "Saba": [
        "NNP"
    ], 
    "Grimes": [
        "NNP"
    ], 
    "Norsk": [
        "NNP"
    ], 
    "transaction": [
        "NN"
    ], 
    "freight-transport": [
        "JJ", 
        "NN"
    ], 
    "reflection": [
        "NN"
    ], 
    "Throwing": [
        "VBG"
    ], 
    "Meinckian": [
        "NNP"
    ], 
    "Damonne": [
        "NNP"
    ], 
    "sanipractor": [
        "NN"
    ], 
    "campaign-decided": [
        "NN"
    ], 
    "HEUBLEIN": [
        "NNP"
    ], 
    "Superman": [
        "NNP"
    ], 
    "She": [
        "PRP", 
        "NN"
    ], 
    "taller": [
        "JJR", 
        "RBR"
    ], 
    "non-communists": [
        "NNS"
    ], 
    "schnooks": [
        "NNS"
    ], 
    "tell...": [
        ":"
    ], 
    "Blaber": [
        "NNP"
    ], 
    "Perasso": [
        "NNP"
    ], 
    "centralizing": [
        "VBG", 
        "JJ"
    ], 
    "incentive-spurred": [
        "JJ"
    ], 
    "spells": [
        "VBZ", 
        "NNS"
    ], 
    "reaffirmation": [
        "NN"
    ], 
    "saviour": [
        "NN"
    ], 
    "Waldenbooks": [
        "NNP"
    ], 
    "beta-blocker": [
        "NN"
    ], 
    "stock-picking": [
        "JJ", 
        "NN"
    ], 
    "fine-tune": [
        "VB"
    ], 
    "deposits": [
        "NNS", 
        "VBZ"
    ], 
    "deuterated": [
        "VBD"
    ], 
    "Broner": [
        "NNP"
    ], 
    "footballer": [
        "NN"
    ], 
    "drug-supply": [
        "JJ"
    ], 
    "homework": [
        "NN"
    ], 
    "Yasser": [
        "NNP"
    ], 
    "sonic": [
        "JJ"
    ], 
    "wooed": [
        "VBN", 
        "VBD"
    ], 
    "definitive": [
        "JJ"
    ], 
    "fate": [
        "NN"
    ], 
    "whims": [
        "NNS"
    ], 
    "swami": [
        "NNS"
    ], 
    "fats": [
        "NNS"
    ], 
    "die-up": [
        "NN"
    ], 
    "historic": [
        "JJ"
    ], 
    "Autolatina": [
        "NNP"
    ], 
    "Attributes": [
        "NNS"
    ], 
    "dental-products": [
        "NNS"
    ], 
    "Proof": [
        "NN"
    ], 
    "Inspectors": [
        "NNS"
    ], 
    "break-the-rules": [
        "JJ"
    ], 
    "renegade": [
        "NN"
    ], 
    "nameplate": [
        "NN"
    ], 
    "sizes": [
        "NNS", 
        "VBZ"
    ], 
    "worthwile": [
        "VB"
    ], 
    "Burchuladze": [
        "NNP"
    ], 
    "candy": [
        "NN"
    ], 
    "sized": [
        "VBD", 
        "JJ", 
        "VBN"
    ], 
    "tablespoons": [
        "NNS"
    ], 
    "pinging": [
        "VBG"
    ], 
    "hydrolyzed": [
        "VBN"
    ], 
    "lends": [
        "VBZ"
    ], 
    "Hoaps": [
        "NNP"
    ], 
    "Albrecht": [
        "NNP"
    ], 
    "Gerbig": [
        "NNP"
    ], 
    "rims": [
        "NNS"
    ], 
    "Teipel": [
        "NNP"
    ], 
    "upswing": [
        "NN"
    ], 
    "goats": [
        "NNS"
    ], 
    "Babylon": [
        "NNP"
    ], 
    "Seizes": [
        "VBZ"
    ], 
    "price-and-seasonally": [
        "RB"
    ], 
    "sorption": [
        "NN"
    ], 
    "Institutio": [
        "NNP"
    ], 
    "retirements": [
        "NNS"
    ], 
    "Rhythms": [
        "NNPS"
    ], 
    "medieval": [
        "JJ", 
        "NN"
    ], 
    "Practically": [
        "RB"
    ], 
    "Leavenworth": [
        "NNP"
    ], 
    "expansion": [
        "NN", 
        "JJ"
    ], 
    "Strobel": [
        "NNP"
    ], 
    "imperfectly": [
        "RB"
    ], 
    "choked": [
        "VBD", 
        "VBN"
    ], 
    "Aslanian": [
        "NNP"
    ], 
    "Pyrometer": [
        "NNP"
    ], 
    "Antiquity": [
        "NN"
    ], 
    "eatables": [
        "NNS"
    ], 
    "U": [
        "NNP", 
        "NN"
    ], 
    "seraphim": [
        "NN"
    ], 
    "reptile": [
        "NN"
    ], 
    "celebrations": [
        "NNS"
    ], 
    "Ford-Kissinger": [
        "NNP"
    ], 
    "citron": [
        "JJ"
    ], 
    "Graph": [
        "NN"
    ], 
    "evocation": [
        "NN"
    ], 
    "mushrooms": [
        "NNS"
    ], 
    "Foxx": [
        "NNP"
    ], 
    "brusquely": [
        "RB"
    ], 
    "secretive": [
        "JJ"
    ], 
    "winging": [
        "VBG"
    ], 
    "Nakamura": [
        "NNP"
    ], 
    "agin": [
        "IN", 
        "RB"
    ], 
    "Rameau": [
        "NNP"
    ], 
    "Dunlop": [
        "NNP"
    ], 
    "Dayton": [
        "NNP"
    ], 
    "Lorca": [
        "NNP"
    ], 
    "CGE": [
        "NNP"
    ], 
    "accountant": [
        "NN"
    ], 
    "figuratively": [
        "RB"
    ], 
    "inner": [
        "JJ"
    ], 
    "CGP": [
        "NNP"
    ], 
    "TEDs": [
        "NNS"
    ], 
    "backhand": [
        "NN"
    ], 
    "R.F.": [
        "NNP"
    ], 
    "Perin": [
        "NNP"
    ], 
    "FED": [
        "NNP"
    ], 
    "prophetic": [
        "JJ"
    ], 
    "Campitelli": [
        "NNP"
    ], 
    "government-encouraged": [
        "JJ"
    ], 
    "administrators": [
        "NNS"
    ], 
    "Daschle": [
        "NNP"
    ], 
    "fraternities": [
        "NNS"
    ], 
    "Hesse": [
        "NNP"
    ], 
    "Harrows": [
        "NNPS"
    ], 
    "Industrial": [
        "NNP", 
        "JJ"
    ], 
    "apiece": [
        "RB", 
        "JJ"
    ], 
    "annuities": [
        "NNS"
    ], 
    "millstones": [
        "NNS"
    ], 
    "projecting": [
        "VBG"
    ], 
    "Seashore": [
        "NNP"
    ], 
    "gagged": [
        "VBN", 
        "VBD"
    ], 
    "Cacao": [
        "NNP"
    ], 
    "i.d.": [
        "NN"
    ], 
    "Industrias": [
        "NNP"
    ], 
    "mechanics": [
        "NNS"
    ], 
    "Semel": [
        "NNP"
    ], 
    "Alla": [
        "NNP"
    ], 
    "boulevards": [
        "NNS"
    ], 
    "cost-efficiency": [
        "NN"
    ], 
    "Tasaki": [
        "NNP"
    ], 
    "Fellows": [
        "NNS"
    ], 
    "impulse-related": [
        "JJ"
    ], 
    "build-ups": [
        "NNS"
    ], 
    "Ally": [
        "VBP"
    ], 
    "baksheesh": [
        "NN"
    ], 
    "folio": [
        "NN"
    ], 
    "castigation": [
        "NN"
    ], 
    "equiment": [
        "NN"
    ], 
    "torrid": [
        "JJ"
    ], 
    "savagely": [
        "RB"
    ], 
    "Appell": [
        "NNP"
    ], 
    "meteor": [
        "NN"
    ], 
    "Telecommuncations": [
        "NNPS"
    ], 
    "jamming": [
        "NN"
    ], 
    "Mexico-watchers": [
        "NNS"
    ], 
    "indiscretions": [
        "NNS"
    ], 
    "deficit-reduction": [
        "NN", 
        "JJ"
    ], 
    "Depicted": [
        "VBN"
    ], 
    "impurity": [
        "NN"
    ], 
    "bronchi": [
        "NNS"
    ], 
    "Allday": [
        "NNP"
    ], 
    "Aflatoxin": [
        "NN"
    ], 
    "Date": [
        "NN", 
        "NNP"
    ], 
    "Healey": [
        "NNP"
    ], 
    "tightest": [
        "JJS", 
        "RBS"
    ], 
    "unsteadily": [
        "RB"
    ], 
    "Chambers": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "retirees": [
        "NNS"
    ], 
    "Savage": [
        "NNP", 
        "JJ"
    ], 
    "Engraph": [
        "NNP"
    ], 
    "Bernstein-Macaulay": [
        "NNP"
    ], 
    "coal-preparation": [
        "JJ"
    ], 
    "protest": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Toledo": [
        "NNP", 
        "NN"
    ], 
    "intermingle": [
        "VBP"
    ], 
    "IJAL": [
        "NNP"
    ], 
    "up.": [
        "RB"
    ], 
    "fronts": [
        "NNS"
    ], 
    "Liverpool": [
        "NNP"
    ], 
    "Klein": [
        "NNP"
    ], 
    "Lunge": [
        "NNP"
    ], 
    "restriction": [
        "NN"
    ], 
    "onstage": [
        "NN", 
        "RB"
    ], 
    "high-coupon": [
        "JJ"
    ], 
    "Grocery": [
        "NNP", 
        "NN"
    ], 
    "pro-environmental": [
        "JJ"
    ], 
    "activation": [
        "NN"
    ], 
    "Auschwitz": [
        "NNP"
    ], 
    "clear-channel": [
        "JJ", 
        "NN"
    ], 
    "dealer-managers": [
        "NNS"
    ], 
    "advocating": [
        "VBG"
    ], 
    "Queks": [
        "NNPS"
    ], 
    "snowflakes": [
        "NNS"
    ], 
    "well-structured": [
        "JJ"
    ], 
    "shoelace": [
        "NN"
    ], 
    "pure-meat": [
        "NN"
    ], 
    "nursery": [
        "NN", 
        "JJ"
    ], 
    "greenish": [
        "JJ"
    ], 
    "fortiori": [
        "FW"
    ], 
    "closed-circuit": [
        "JJ"
    ], 
    "machine-gun": [
        "NN"
    ], 
    "swoons": [
        "NNS"
    ], 
    "bimonthly": [
        "JJ"
    ], 
    "Strasbourg": [
        "NNP"
    ], 
    "concise": [
        "JJ"
    ], 
    "Negative": [
        "JJ"
    ], 
    "Hounds": [
        "NNPS"
    ], 
    "evaluated": [
        "VBN", 
        "VBD"
    ], 
    "twiddled": [
        "VBD"
    ], 
    "Affected": [
        "VBN"
    ], 
    "desirous": [
        "JJ"
    ], 
    "hang-tough": [
        "JJ"
    ], 
    "now-ousted": [
        "JJ"
    ], 
    "unskilled": [
        "JJ"
    ], 
    "fetish": [
        "NN"
    ], 
    "Anselmo": [
        "NNP"
    ], 
    "evolving": [
        "VBG"
    ], 
    "centric": [
        "JJ"
    ], 
    "baby-food": [
        "JJ"
    ], 
    "Items": [
        "NNS"
    ], 
    "never": [
        "RB", 
        "RBR"
    ], 
    "Artisans": [
        "NNS"
    ], 
    "S.I.": [
        "NNP"
    ], 
    "second-hand": [
        "JJ"
    ], 
    "cardboard": [
        "NN", 
        "JJ"
    ], 
    "Georgano": [
        "NNP"
    ], 
    "Fragile": [
        "NNP"
    ], 
    "buckled": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "vulnerability": [
        "NN"
    ], 
    "groveling": [
        "VBG", 
        "NN"
    ], 
    "piercing": [
        "VBG", 
        "JJ"
    ], 
    "Soering": [
        "NNP"
    ], 
    "tolerating": [
        "VBG", 
        "JJ"
    ], 
    "golds": [
        "NNS"
    ], 
    "weapons-grade": [
        "JJ"
    ], 
    "monosyllable": [
        "NN"
    ], 
    "Lilley": [
        "NNP"
    ], 
    "astute": [
        "JJ"
    ], 
    "Archangel": [
        "NNP"
    ], 
    "exquisiteness": [
        "NN"
    ], 
    "hunch": [
        "NN", 
        "VB"
    ], 
    "elaborated": [
        "VBN"
    ], 
    "second-deadliest": [
        "JJ"
    ], 
    "shelter.": [
        "NN"
    ], 
    "dehumanize": [
        "VB"
    ], 
    "treatment": [
        "NN"
    ], 
    "elaborates": [
        "VBZ"
    ], 
    "near-monopoly": [
        "NN", 
        "JJ"
    ], 
    "Telemundo": [
        "NNP"
    ], 
    "Binning": [
        "NNP"
    ], 
    "drowned": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "college-educated": [
        "JJ"
    ], 
    "Armies": [
        "NNP"
    ], 
    "Corresponding": [
        "VBG"
    ], 
    "mortality": [
        "NN"
    ], 
    "unsteadiness": [
        "NN"
    ], 
    "Heuvelmans": [
        "NNP"
    ], 
    "exited": [
        "VBD", 
        "VBN"
    ], 
    "panacea": [
        "NN"
    ], 
    "Loire": [
        "NNP"
    ], 
    "misfiring": [
        "VBG"
    ], 
    "Insisting": [
        "VBG"
    ], 
    "Removed": [
        "VBN"
    ], 
    "tell": [
        "VB", 
        "VBP"
    ], 
    "slam-dunk": [
        "NN", 
        "VB"
    ], 
    "expose": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "Yuen": [
        "NNP"
    ], 
    "underwear": [
        "NN"
    ], 
    "Hibbard": [
        "NNP"
    ], 
    "loony": [
        "JJ"
    ], 
    "A.D.": [
        "NNP", 
        "FW", 
        "NN", 
        "RB"
    ], 
    "shelters": [
        "NNS"
    ], 
    "counter-trade": [
        "JJ"
    ], 
    "Esrey": [
        "NNP"
    ], 
    "inhabited": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "directorial": [
        "JJ"
    ], 
    "Vittorio": [
        "NNP"
    ], 
    "rights": [
        "NNS"
    ], 
    "Cornwallis": [
        "NNP"
    ], 
    "Vittoria": [
        "NNP"
    ], 
    "foliage": [
        "NN"
    ], 
    "Japan-made": [
        "JJ"
    ], 
    "frantic": [
        "JJ"
    ], 
    "home-center": [
        "NN"
    ], 
    "endow": [
        "VB", 
        "VBP"
    ], 
    "Short-term": [
        "JJ", 
        "NNP"
    ], 
    "summarizes": [
        "VBZ"
    ], 
    "barbers": [
        "NNS"
    ], 
    "U.s": [
        "NNP"
    ], 
    "Ricken": [
        "NNP"
    ], 
    "squirting": [
        "VBG"
    ], 
    "CALLS": [
        "NNPS"
    ], 
    "give": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "high-efficiency": [
        "NN"
    ], 
    "TransAtlantic": [
        "NNP"
    ], 
    "Humphries": [
        "NNP"
    ], 
    "gleefully": [
        "RB"
    ], 
    "artifically": [
        "RB"
    ], 
    "laser-surgery": [
        "NN"
    ], 
    "crystallized": [
        "VBD", 
        "VBN"
    ], 
    "U.S": [
        "NNP", 
        "SYM"
    ], 
    "polio": [
        "NN"
    ], 
    "Phoenix": [
        "NNP"
    ], 
    "Gaisman": [
        "NNP"
    ], 
    "scrivener": [
        "NN"
    ], 
    "braids": [
        "NNS"
    ], 
    "stupidity": [
        "NN"
    ], 
    "Jack": [
        "NNP"
    ], 
    "polis": [
        "NN"
    ], 
    "Mokaba": [
        "NNP"
    ], 
    "butting": [
        "VBG"
    ], 
    "U.K": [
        "NNP"
    ], 
    "U.N": [
        "NNP"
    ], 
    "Hashing": [
        "NN", 
        "NNP"
    ], 
    "Excision": [
        "NN"
    ], 
    "peopled": [
        "VBN"
    ], 
    "Neesen": [
        "NNP"
    ], 
    "futures-exchange": [
        "NN"
    ], 
    "abdomen": [
        "NN"
    ], 
    "Connolly": [
        "NNP"
    ], 
    "Prickly": [
        "JJ"
    ], 
    "Quinton": [
        "NNP"
    ], 
    "do-gooder": [
        "JJ", 
        "NN"
    ], 
    "Shlomo": [
        "NNP"
    ], 
    "kangaroo-committee": [
        "NN"
    ], 
    "summarize": [
        "VB"
    ], 
    "muddling": [
        "VBG"
    ], 
    "ambivalent": [
        "JJ"
    ], 
    "suppressants": [
        "NNS"
    ], 
    "DEFERRED": [
        "JJ"
    ], 
    "U.S.A.": [
        "NNP", 
        "NN"
    ], 
    "electronic-test": [
        "JJ"
    ], 
    "under-50": [
        "JJ"
    ], 
    "gulling": [
        "VBG"
    ], 
    "anti-miscarriage": [
        "JJ"
    ], 
    "cold-cuts": [
        "NNS"
    ], 
    "L.B.": [
        "NNP"
    ], 
    "cofactors": [
        "NNS"
    ], 
    "Sharps": [
        "NNP"
    ], 
    "amplifying": [
        "VBG"
    ], 
    "overstepping": [
        "VBG"
    ], 
    "elucidations": [
        "NNS"
    ], 
    "Sharpe": [
        "NNP"
    ], 
    "panthers": [
        "NNS"
    ], 
    "partisans": [
        "NNS"
    ], 
    "indispensible": [
        "JJ"
    ], 
    "private-label": [
        "JJ", 
        "NN"
    ], 
    "three-week-old": [
        "JJ"
    ], 
    "soaking": [
        "VBG", 
        "JJ", 
        "NN", 
        "RB"
    ], 
    "stopover": [
        "NN"
    ], 
    "DIASONICS": [
        "NNP"
    ], 
    "superhighway": [
        "NN"
    ], 
    "anti-lobbying": [
        "JJ"
    ], 
    "Bobby": [
        "NNP"
    ], 
    "decions": [
        "NNS"
    ], 
    "Detail": [
        "NNP"
    ], 
    "underscore": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "family-welfare": [
        "NN"
    ], 
    "Frederik": [
        "NNP"
    ], 
    "heavy-industry": [
        "NN"
    ], 
    "Weakens": [
        "VBZ"
    ], 
    "Capitol-EMI": [
        "NNP"
    ], 
    "brightness": [
        "NN"
    ], 
    "quarter-century": [
        "NN", 
        "JJ"
    ], 
    "calibrating": [
        "VBG"
    ], 
    "investigator": [
        "NN"
    ], 
    "Sapanski": [
        "NNP"
    ], 
    "lucy": [
        "NN"
    ], 
    "Goose": [
        "NNP"
    ], 
    "Fortescue": [
        "NNP"
    ], 
    "Milan": [
        "NNP"
    ], 
    "less-cyclical": [
        "JJ"
    ], 
    "Tacker": [
        "NNP"
    ], 
    "motoring": [
        "VBG"
    ], 
    "luck": [
        "NN"
    ], 
    "adobe": [
        "NN"
    ], 
    "enthusiasts": [
        "NNS"
    ], 
    "Dressed": [
        "VBN"
    ], 
    "Wow": [
        "UH"
    ], 
    "RNAs": [
        "NNS"
    ], 
    "Charts": [
        "NNS"
    ], 
    "Waleson": [
        "NNP"
    ], 
    "Woo": [
        "NNP"
    ], 
    "taught": [
        "VBN", 
        "VBD"
    ], 
    "Bogner": [
        "NNP"
    ], 
    "polivinylchloride": [
        "NN"
    ], 
    "Woe": [
        "NN"
    ], 
    "enclosure": [
        "NN"
    ], 
    "Dresses": [
        "NNS"
    ], 
    "Dresser": [
        "NNP"
    ], 
    "conjectures": [
        "NNS", 
        "VBZ"
    ], 
    "roadblock": [
        "NN"
    ], 
    "decree": [
        "NN"
    ], 
    "COOPER": [
        "NNP"
    ], 
    "pig-infested": [
        "JJ"
    ], 
    "stagemate": [
        "NN"
    ], 
    "freelancers": [
        "NNS"
    ], 
    "anesthetically": [
        "RB"
    ], 
    "ranted": [
        "VBD"
    ], 
    "HMS": [
        "NNP"
    ], 
    "conjectured": [
        "VBN"
    ], 
    "Tractarians": [
        "NNS"
    ], 
    "appraisers": [
        "NNS"
    ], 
    "HMA": [
        "NNP"
    ], 
    "Warners": [
        "NNS"
    ], 
    "primitive-eclogue": [
        "JJ"
    ], 
    "spring-joints": [
        "NN"
    ], 
    "grease": [
        "NN"
    ], 
    "Emeryville": [
        "NNP"
    ], 
    "Ricans": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Weigand": [
        "NNP"
    ], 
    "Crowder": [
        "NNP"
    ], 
    "over-emphasize": [
        "JJ"
    ], 
    "mistress": [
        "NN"
    ], 
    "monologue": [
        "NN"
    ], 
    "tax-rate": [
        "JJ", 
        "NN"
    ], 
    "greasy": [
        "JJ"
    ], 
    "logging": [
        "NN", 
        "VBG", 
        "JJ"
    ], 
    "childishly": [
        "RB"
    ], 
    "trade-mark": [
        "NN"
    ], 
    "ist": [
        "FW"
    ], 
    "prodigal": [
        "JJ"
    ], 
    "braggadocio": [
        "NN"
    ], 
    "perforated": [
        "JJ"
    ], 
    "cellars": [
        "NNS"
    ], 
    "loud": [
        "JJ", 
        "RB"
    ], 
    "skilled-nursing": [
        "JJ"
    ], 
    "grownups": [
        "NNS"
    ], 
    "Dorothee": [
        "NNP"
    ], 
    "hoop": [
        "NN"
    ], 
    "Sovereign": [
        "NNP"
    ], 
    "hoot": [
        "NN", 
        "VBP"
    ], 
    "hook": [
        "NN", 
        "VB"
    ], 
    "Villanova": [
        "NNP"
    ], 
    "Folks": [
        "NNS"
    ], 
    "hoof": [
        "NN"
    ], 
    "hood": [
        "NN"
    ], 
    "Attali": [
        "NNP"
    ], 
    "goblins": [
        "NNS"
    ], 
    "ECA": [
        "NNP"
    ], 
    "financial-futures": [
        "NNS"
    ], 
    "Hanover-Pebble": [
        "NNP"
    ], 
    "non-realistic": [
        "JJ"
    ], 
    "ECI": [
        "NNP"
    ], 
    "business-like": [
        "JJ"
    ], 
    "ECU": [
        "NNP"
    ], 
    "Wittgreen": [
        "NNP"
    ], 
    "Dainippon": [
        "NNP"
    ], 
    "ECP": [
        "NNP"
    ], 
    "non-duck": [
        "JJ"
    ], 
    "inferno": [
        "NN"
    ], 
    "twenty-first-century": [
        "JJ"
    ], 
    "steamily": [
        "RB"
    ], 
    "ballyhooey": [
        "NN"
    ], 
    "inflow": [
        "NN"
    ], 
    "mutate": [
        "VB"
    ], 
    "bed-and-breakfast": [
        "JJ"
    ], 
    "nondefense": [
        "JJ", 
        "NN"
    ], 
    "individual-contributor": [
        "NN"
    ], 
    "self-restraint": [
        "NN"
    ], 
    "Boonton": [
        "NNP"
    ], 
    "Neighbor": [
        "NN"
    ], 
    "Geroge": [
        "NNP"
    ], 
    "swells": [
        "NNS", 
        "VBZ"
    ], 
    "mid-thirties": [
        "NNS"
    ], 
    "Purchases": [
        "NNS", 
        "NNPS"
    ], 
    "bondholder": [
        "NN"
    ], 
    "M.A.": [
        "NNP"
    ], 
    "cruelly": [
        "RB"
    ], 
    "depraved": [
        "JJ", 
        "VBN"
    ], 
    "Galina": [
        "NNP"
    ], 
    "Sticker": [
        "NN"
    ], 
    "normalizing": [
        "VBG"
    ], 
    "artillerist": [
        "NN"
    ], 
    "matter": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Colin": [
        "NNP"
    ], 
    "childlike": [
        "JJ"
    ], 
    "espouse": [
        "VBP"
    ], 
    "clerical-lay": [
        "JJ"
    ], 
    "Louisiana-Pacific": [
        "NNP"
    ], 
    "Floor": [
        "NNP", 
        "NN"
    ], 
    "pistons": [
        "NNS"
    ], 
    "rivers": [
        "NNS"
    ], 
    "Flood": [
        "NNP", 
        "VBP"
    ], 
    "Coaching": [
        "NN"
    ], 
    "childcare": [
        "NN"
    ], 
    "expeditions": [
        "NNS"
    ], 
    "reprieve": [
        "NN"
    ], 
    "Poets": [
        "NNS"
    ], 
    "power-hungry": [
        "JJ"
    ], 
    "boaters": [
        "NNS"
    ], 
    "it...": [
        ":"
    ], 
    "demoralizing": [
        "VBG"
    ], 
    "subcontracts": [
        "NNS"
    ], 
    "Khin": [
        "NNP"
    ], 
    "Instructions": [
        "NNS", 
        "NNP"
    ], 
    "Dirks": [
        "NNP", 
        "NNS"
    ], 
    "wrists": [
        "NNS"
    ], 
    "psychologically": [
        "RB"
    ], 
    "replenished": [
        "VBN", 
        "VBD"
    ], 
    "Ludlow": [
        "NNPS"
    ], 
    "repatriate": [
        "VB", 
        "VBP"
    ], 
    "Adelia": [
        "NNP"
    ], 
    "government-set": [
        "VBN"
    ], 
    "inconsistency": [
        "NN"
    ], 
    "Trenton": [
        "NNP"
    ], 
    "Dynasts": [
        "NNPS"
    ], 
    "torchbearer": [
        "NN"
    ], 
    "greased": [
        "VBD", 
        "VBN"
    ], 
    "Dynasty": [
        "NNP", 
        "NN"
    ], 
    "summitry": [
        "NN"
    ], 
    "SHOPPERS": [
        "NNS"
    ], 
    "greases": [
        "NNS"
    ], 
    "moviemakers": [
        "NNS"
    ], 
    "half-implemented": [
        "JJ"
    ], 
    "Marketers": [
        "NNS", 
        "NNPS"
    ], 
    "Karsner": [
        "NNP"
    ], 
    "visitor": [
        "NN"
    ], 
    "brilliance": [
        "NN"
    ], 
    "calculable": [
        "JJ"
    ], 
    "Bay-front": [
        "JJ"
    ], 
    "Alvan": [
        "NNP"
    ], 
    "evil-but-cute": [
        "JJ"
    ], 
    "resisting": [
        "VBG"
    ], 
    "divinity": [
        "NN"
    ], 
    "unleashes": [
        "VBZ"
    ], 
    "wooden-leg": [
        "NN"
    ], 
    "paralleling": [
        "VBG"
    ], 
    "Amana": [
        "NNP"
    ], 
    "MicroGeneSys": [
        "NNP"
    ], 
    "acne": [
        "NN"
    ], 
    "folded": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "interpenetration": [
        "NN"
    ], 
    "Wight": [
        "NNP"
    ], 
    "Wolverton": [
        "NNP"
    ], 
    "integrate": [
        "VB", 
        "VBP"
    ], 
    "slender-waisted": [
        "JJ"
    ], 
    "edict": [
        "NN"
    ], 
    "early-childhood": [
        "NN"
    ], 
    "Unitours": [
        "NNPS"
    ], 
    "somnambulates": [
        "VBZ"
    ], 
    "Comics": [
        "NNPS"
    ], 
    "warmheartedness": [
        "NN"
    ], 
    "stop": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "Cawley": [
        "NNP"
    ], 
    "libellos": [
        "NNS"
    ], 
    "cracks": [
        "NNS", 
        "VBZ"
    ], 
    "HEWLETT-PACKARD": [
        "NNP"
    ], 
    "coating": [
        "NN", 
        "VBG"
    ], 
    "thermoforming": [
        "JJ"
    ], 
    "comply": [
        "VB", 
        "VBP"
    ], 
    "Gloucester": [
        "NNP"
    ], 
    "briefer": [
        "JJR"
    ], 
    "POUNDED": [
        "VBD"
    ], 
    "Sally": [
        "NNP", 
        "NN"
    ], 
    "rime": [
        "NN"
    ], 
    "thrusts": [
        "NNS", 
        "VBZ"
    ], 
    "weed-killing": [
        "JJ"
    ], 
    "briefed": [
        "VBN", 
        "VBD"
    ], 
    "consanguineously": [
        "RB"
    ], 
    "prowazwki": [
        "NN"
    ], 
    "fertility": [
        "NN"
    ], 
    "Straniera": [
        "NNP"
    ], 
    "Clapping": [
        "VBG"
    ], 
    "Joint-research": [
        "JJ"
    ], 
    "ethical": [
        "JJ"
    ], 
    "reference": [
        "NN"
    ], 
    "Roark": [
        "NNP"
    ], 
    "tie-up": [
        "NN"
    ], 
    "sturgeon": [
        "NN"
    ], 
    "Kempinski": [
        "NNP"
    ], 
    "Juanita": [
        "NNP"
    ], 
    "Viag": [
        "NNP"
    ], 
    "Wangemans": [
        "NNPS"
    ], 
    "ficus": [
        "NN"
    ], 
    "constrictor": [
        "NN"
    ], 
    "revenuers": [
        "NNS"
    ], 
    "causeway": [
        "NN"
    ], 
    "auto-strop": [
        "JJ"
    ], 
    "tantamount": [
        "JJ"
    ], 
    "electricity-industry": [
        "NN"
    ], 
    "unbanning": [
        "VBG", 
        "NN"
    ], 
    "Bucknell": [
        "NNP"
    ], 
    "Yards": [
        "NNP"
    ], 
    "Eurofighter": [
        "NNP"
    ], 
    "juxtapose": [
        "VBP"
    ], 
    "deflecting": [
        "VBG"
    ], 
    "Podolsky": [
        "NNP"
    ], 
    "were": [
        "VBD", 
        "VB"
    ], 
    "pickins": [
        "NNS"
    ], 
    "richest": [
        "JJS"
    ], 
    "telecopier": [
        "NN"
    ], 
    "modeling": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "picking": [
        "VBG", 
        "NN"
    ], 
    "white-clad": [
        "JJ"
    ], 
    "mucky": [
        "JJ"
    ], 
    "horsemen": [
        "NNS"
    ], 
    "prudential": [
        "JJ"
    ], 
    "subverting": [
        "VBG"
    ], 
    "Abnormal": [
        "JJ"
    ], 
    "Refcorps": [
        "NNS"
    ], 
    "distinction": [
        "NN"
    ], 
    "Reasoning": [
        "NN", 
        "NNP"
    ], 
    "typist": [
        "NN"
    ], 
    "Devoted": [
        "VBN"
    ], 
    "appeared": [
        "VBD", 
        "VBN"
    ], 
    "Jouvet": [
        "NNP"
    ], 
    "Snow": [
        "NNP", 
        "NN"
    ], 
    "hygiene": [
        "NN"
    ], 
    "administrations": [
        "NNS"
    ], 
    "Wentworth": [
        "NNP"
    ], 
    "Constantin": [
        "NNP"
    ], 
    "turnouts": [
        "NNS"
    ], 
    "dusting": [
        "VBG", 
        "NN"
    ], 
    "unsloped": [
        "JJ"
    ], 
    "particulars": [
        "NNS"
    ], 
    "recognised": [
        "VBD"
    ], 
    "Cagayan": [
        "NNP"
    ], 
    "ethers": [
        "NNS"
    ], 
    "obtained": [
        "VBN", 
        "VBD", 
        "VBP"
    ], 
    "Stout": [
        "NNP"
    ], 
    "quantities": [
        "NNS"
    ], 
    "sunshine": [
        "NN"
    ], 
    "less.": [
        "NN"
    ], 
    "marijuana": [
        "NN"
    ], 
    "sunshiny": [
        "JJ"
    ], 
    "Marines": [
        "NNPS", 
        "NNS"
    ], 
    "individualists": [
        "NNS"
    ], 
    "misquoted": [
        "VBN"
    ], 
    "Huskers": [
        "NNPS"
    ], 
    "Boothby": [
        "NNP"
    ], 
    "profitably": [
        "RB"
    ], 
    "Sellars": [
        "NNP"
    ], 
    "near": [
        "IN", 
        "RB", 
        "VB", 
        "JJ"
    ], 
    "apocryphal": [
        "JJ"
    ], 
    "neat": [
        "JJ"
    ], 
    "motorist": [
        "NN"
    ], 
    "DESPITE": [
        "IN"
    ], 
    "Tigard": [
        "NNP"
    ], 
    "Enel": [
        "NNP"
    ], 
    "anchor": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "power-starved": [
        "JJ"
    ], 
    "automotive-emissions-testing": [
        "JJ"
    ], 
    "traditionalistic": [
        "JJ"
    ], 
    "ip": [
        "NN"
    ], 
    "is": [
        "VBZ", 
        "RB", 
        "NNS", 
        "VBP"
    ], 
    "it": [
        "PRP"
    ], 
    "Dante": [
        "NNP", 
        "NN"
    ], 
    "strivers": [
        "NNS"
    ], 
    "Ruder": [
        "NNP"
    ], 
    "ij": [
        "NN"
    ], 
    "jest": [
        "NN"
    ], 
    "in": [
        "IN", 
        "FW", 
        "NN", 
        "RB", 
        "RP", 
        "IN|RP", 
        "NNP", 
        "RP|IN", 
        "RBR", 
        "VBD"
    ], 
    "textiles": [
        "NNS"
    ], 
    "sanitized": [
        "VBN"
    ], 
    "two-product": [
        "JJ"
    ], 
    "convulsively": [
        "RB"
    ], 
    "overstated": [
        "VBN", 
        "VBD"
    ], 
    "bottles": [
        "NNS", 
        "VBZ"
    ], 
    "Fergeson": [
        "NNP"
    ], 
    "anoint": [
        "VB"
    ], 
    "insulin-dependent": [
        "JJ"
    ], 
    "bottled": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "Berettas": [
        "NNS"
    ], 
    "overstates": [
        "VBZ"
    ], 
    "Chilblains": [
        "NNS"
    ], 
    "phobias": [
        "NNS"
    ], 
    "Pencils": [
        "NNS"
    ], 
    "astringent": [
        "JJ"
    ], 
    "no-man": [
        "JJ"
    ], 
    "declaring": [
        "VBG"
    ], 
    "redevelop": [
        "VB"
    ], 
    "Neihart": [
        "NNP"
    ], 
    "self-sufficiency": [
        "NN"
    ], 
    "Bramwell": [
        "NNP"
    ], 
    "lonesome": [
        "JJ"
    ], 
    "Hard-Hearted": [
        "NNP"
    ], 
    "Truck": [
        "NNP", 
        "NN"
    ], 
    "quarter-inch": [
        "JJ"
    ], 
    "potentials": [
        "NNS"
    ], 
    "Craftsmen": [
        "NNPS", 
        "NNP"
    ], 
    "Air": [
        "NNP", 
        "NN"
    ], 
    "stiffened": [
        "VBD", 
        "VBN"
    ], 
    "pari-mutuel": [
        "JJ"
    ], 
    "Pelican": [
        "NNP"
    ], 
    "practiced": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "BeechNut": [
        "NNP"
    ], 
    "timeouts": [
        "NNS"
    ], 
    "Pucik": [
        "NNP"
    ], 
    "drug-policy": [
        "NN"
    ], 
    "Sakaguchi": [
        "NNP"
    ], 
    "Sonja": [
        "NNP"
    ], 
    "crabapple": [
        "NN"
    ], 
    "Vasvani": [
        "NNP"
    ], 
    "squamous": [
        "JJ"
    ], 
    "practices": [
        "NNS", 
        "VBZ"
    ], 
    "tombstone": [
        "NN"
    ], 
    "Minicar": [
        "JJ"
    ], 
    "Packaged-goods": [
        "NNS"
    ], 
    "Thornburg": [
        "NNP"
    ], 
    "facto": [
        "FW", 
        "JJ", 
        "NN"
    ], 
    "Musician": [
        "NN"
    ], 
    "Sulaiman": [
        "NNP"
    ], 
    "molar": [
        "NN"
    ], 
    "sporting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "belowground": [
        "NN"
    ], 
    "bandwidth": [
        "NN"
    ], 
    "identify": [
        "VB", 
        "VBP"
    ], 
    "Drivon": [
        "NNP"
    ], 
    "supernormal": [
        "JJ"
    ], 
    "facts": [
        "NNS"
    ], 
    "Shenzhen": [
        "NNP"
    ], 
    "bed-type": [
        "JJ"
    ], 
    "sunflower": [
        "NN"
    ], 
    "Mattone": [
        "NNP"
    ], 
    "regarded": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Rotunda": [
        "NNP"
    ], 
    "defray": [
        "VB"
    ], 
    "Censorship": [
        "NN"
    ], 
    "moody": [
        "JJ"
    ], 
    "ALLY": [
        "NN"
    ], 
    "beholds": [
        "VBZ"
    ], 
    "fluidity": [
        "NN"
    ], 
    "Holch": [
        "NNP"
    ], 
    "Freya": [
        "NNP"
    ], 
    "darlings": [
        "NNS"
    ], 
    "twin-jet": [
        "NN"
    ], 
    "converged": [
        "VBD"
    ], 
    "Albania": [
        "NNP"
    ], 
    "vapors": [
        "NNS"
    ], 
    "Lucca": [
        "NNP"
    ], 
    "reconsidering": [
        "VBG"
    ], 
    "coarseness": [
        "NN"
    ], 
    "low-down": [
        "NN", 
        "JJ"
    ], 
    "Alvise": [
        "NNP"
    ], 
    "criminal-law": [
        "NN"
    ], 
    "Targo": [
        "JJ"
    ], 
    "esthetics": [
        "NNS"
    ], 
    "svelte-looking": [
        "JJ"
    ], 
    "signposts": [
        "NNS"
    ], 
    "unexplored": [
        "JJ"
    ], 
    "anodes": [
        "NNS"
    ], 
    "package-delivery": [
        "JJ"
    ], 
    "holdup": [
        "NN"
    ], 
    "Crude-goods": [
        "NNS"
    ], 
    "scrimmage": [
        "NN"
    ], 
    "Klauber": [
        "NNP"
    ], 
    "first-three": [
        "JJ"
    ], 
    "Denverite": [
        "NNP"
    ], 
    "Lifeco": [
        "NNP"
    ], 
    "Maddry": [
        "NNP"
    ], 
    "red-turbaned": [
        "JJ"
    ], 
    "notification": [
        "NN"
    ], 
    "Covering": [
        "NNP"
    ], 
    "Triandos": [
        "NNP"
    ], 
    "daytime": [
        "JJ", 
        "NN"
    ], 
    "RNA-based": [
        "JJ"
    ], 
    "motor-control": [
        "JJ"
    ], 
    "societyonly": [
        "RB"
    ], 
    "JMB": [
        "NNP"
    ], 
    "unmagnified": [
        "JJ"
    ], 
    "nonpoisonous": [
        "JJ"
    ], 
    "Basse": [
        "NNP"
    ], 
    "friend-of-the-court": [
        "JJ"
    ], 
    "bank-backed": [
        "JJ"
    ], 
    "burl": [
        "NN"
    ], 
    "car-safety": [
        "JJ", 
        "NN"
    ], 
    "Baileefe": [
        "NNP"
    ], 
    "Swedes": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Sweden": [
        "NNP"
    ], 
    "firemen": [
        "NNS"
    ], 
    "burr": [
        "NN"
    ], 
    "bury": [
        "VB", 
        "VBP"
    ], 
    "unendurable": [
        "JJ"
    ], 
    "BECHTEL": [
        "NNP"
    ], 
    "zur": [
        "FW"
    ], 
    "B.F.": [
        "NNP"
    ], 
    "Conceptually": [
        "RB"
    ], 
    "untenured": [
        "VBN"
    ], 
    "gabbing": [
        "VBG"
    ], 
    "sleep-disorder": [
        "JJ"
    ], 
    "unwillingly": [
        "RB"
    ], 
    "Technicians": [
        "NNPS", 
        "NNS"
    ], 
    "Evidence": [
        "NN"
    ], 
    "incentive-maximizing": [
        "JJ"
    ], 
    "Lappenberg": [
        "NNP"
    ], 
    "Idal": [
        "NNP"
    ], 
    "Rindos": [
        "NNP"
    ], 
    "correspondents": [
        "NNS"
    ], 
    "Tomash": [
        "NNP"
    ], 
    "RJR-style": [
        "JJ"
    ], 
    "Tomaso": [
        "NNP"
    ], 
    "formerly": [
        "RB"
    ], 
    "pilot-training": [
        "JJ", 
        "NN"
    ], 
    "ploy": [
        "NN"
    ], 
    "gut-Democratic": [
        "JJ"
    ], 
    "Hymowitz": [
        "NNP"
    ], 
    "intellectual": [
        "JJ", 
        "NN"
    ], 
    "Krutchensky": [
        "NNP"
    ], 
    "Playback": [
        "NNP"
    ], 
    "Cosmetics": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "frightened": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Behind-the-scenes": [
        "JJ"
    ], 
    "Withholding": [
        "NN"
    ], 
    "snorts": [
        "VBZ"
    ], 
    "magnetisms": [
        "NNS"
    ], 
    "catlike": [
        "JJ"
    ], 
    "per-share": [
        "JJ", 
        "NN"
    ], 
    "pitons": [
        "NNS"
    ], 
    "Cantoni": [
        "NNP"
    ], 
    "lurid": [
        "JJ"
    ], 
    "undergrowth": [
        "NN"
    ], 
    "irreversibility": [
        "NN"
    ], 
    "placeless": [
        "JJ"
    ], 
    "unknowable": [
        "JJ"
    ], 
    "drought-stricken": [
        "JJ"
    ], 
    "garments": [
        "NNS"
    ], 
    "Convenience": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "powerfully": [
        "RB"
    ], 
    "Survey": [
        "NNP", 
        "NN"
    ], 
    "Bauer": [
        "NNP"
    ], 
    "massacred": [
        "VBD", 
        "VBN"
    ], 
    "obsequies": [
        "NNS"
    ], 
    "Melzi": [
        "NNP"
    ], 
    "tryin": [
        "NN", 
        "VBG"
    ], 
    "Semi-Tech": [
        "NNP"
    ], 
    "hikers": [
        "NNS"
    ], 
    "bellwether": [
        "NN", 
        "JJ"
    ], 
    "unvarying": [
        "VBG"
    ], 
    "hyalinization": [
        "NN"
    ], 
    "foul-up": [
        "NN"
    ], 
    "Ratners": [
        "NNP"
    ], 
    "Gaithersburg": [
        "NNP"
    ], 
    "Rayon": [
        "NNP"
    ], 
    "daddy": [
        "NN"
    ], 
    "separated": [
        "VBN", 
        "JJ", 
        "VBD", 
        "VBP"
    ], 
    "field-hands": [
        "NN"
    ], 
    "trotter": [
        "NN"
    ], 
    "sticks": [
        "NNS", 
        "VBZ"
    ], 
    "sidestep": [
        "VB", 
        "VBP"
    ], 
    "all-woman": [
        "JJ"
    ], 
    "sticky": [
        "JJ"
    ], 
    "scrawl": [
        "NN"
    ], 
    "Conner": [
        "NNP"
    ], 
    "fashioned": [
        "VBN", 
        "VBD"
    ], 
    "stirrings": [
        "NNS"
    ], 
    "gowned": [
        "JJ"
    ], 
    "nonpareil": [
        "JJ"
    ], 
    "Jeffersonian": [
        "JJ"
    ], 
    "oversimplification": [
        "NN"
    ], 
    "alerts": [
        "VBZ", 
        "NNS"
    ], 
    "half-witted": [
        "JJ"
    ], 
    "breakwaters": [
        "NNS"
    ], 
    "co-insurance": [
        "JJ", 
        "NN"
    ], 
    "ribbons": [
        "NNS"
    ], 
    "dies": [
        "VBZ", 
        "NNS"
    ], 
    "pinball-parlor": [
        "NN"
    ], 
    "diet": [
        "NN", 
        "VB"
    ], 
    "grassland": [
        "NN"
    ], 
    "diem": [
        "FW", 
        "NN"
    ], 
    "Colloton": [
        "NNP"
    ], 
    "died": [
        "VBD", 
        "VBN"
    ], 
    "derail": [
        "VB", 
        "VBP"
    ], 
    "Roxy": [
        "NNP"
    ], 
    "pessimists": [
        "NNS"
    ], 
    "Vattern": [
        "NNP"
    ], 
    "Giants-Houston": [
        "NNP"
    ], 
    "Mitterrand": [
        "NNP"
    ], 
    "sobering": [
        "VBG", 
        "JJ"
    ], 
    "spokeman": [
        "NN"
    ], 
    "Changeable": [
        "JJ"
    ], 
    "mobilized": [
        "VBN", 
        "VBD"
    ], 
    "gunslingers": [
        "NNS"
    ], 
    "skip": [
        "VB", 
        "VBP"
    ], 
    "jingling": [
        "VBG"
    ], 
    "skit": [
        "NN"
    ], 
    "low-temperature": [
        "JJ", 
        "NN"
    ], 
    "option-based": [
        "JJ"
    ], 
    "abatement": [
        "NN"
    ], 
    "tourist-delivery": [
        "JJ"
    ], 
    "skim": [
        "VB", 
        "VBP", 
        "JJ"
    ], 
    "Sneed": [
        "NNP"
    ], 
    "skin": [
        "NN"
    ], 
    "morphology": [
        "NN"
    ], 
    "skid": [
        "NN", 
        "VB", 
        "VBD"
    ], 
    "Evening": [
        "NNP", 
        "NN"
    ], 
    "deceitful": [
        "JJ"
    ], 
    "paper-goods": [
        "NNS"
    ], 
    "Sylphide": [
        "NNP"
    ], 
    "Hopley": [
        "NNP"
    ], 
    "Broadcast": [
        "NNP"
    ], 
    "answered": [
        "VBD", 
        "VBN"
    ], 
    "phonemes": [
        "NNS"
    ], 
    "Lifeguard": [
        "NN"
    ], 
    "better-than-average": [
        "JJ"
    ], 
    "string": [
        "NN", 
        "VB"
    ], 
    "PriMerit": [
        "NNP"
    ], 
    "mass-reproduced": [
        "JJ"
    ], 
    "HUD": [
        "NNP"
    ], 
    "Explicit": [
        "JJ"
    ], 
    "geometrical": [
        "JJ"
    ], 
    "dinghy": [
        "NN"
    ], 
    "heroin-user": [
        "NN"
    ], 
    "pay-in-kind": [
        "JJ", 
        "NN"
    ], 
    "Wildwood": [
        "NNP"
    ], 
    "Where": [
        "WRB", 
        "NNP"
    ], 
    "LANDOR": [
        "NNP"
    ], 
    "Vent": [
        "NN"
    ], 
    "Recess": [
        "NN", 
        "VB"
    ], 
    "LAWYERS": [
        "NNS", 
        "NNP"
    ], 
    "staples": [
        "NNS"
    ], 
    "banished": [
        "VBN", 
        "VBD"
    ], 
    "Health-care": [
        "JJ"
    ], 
    "miniaturized": [
        "VBN"
    ], 
    "boat-yard": [
        "NN"
    ], 
    "Lesbian": [
        "NNP"
    ], 
    "magnet": [
        "NN"
    ], 
    "banishes": [
        "VBZ"
    ], 
    "humanistic": [
        "JJ"
    ], 
    "two-timed": [
        "VBN"
    ], 
    "Lorlyn": [
        "NNP"
    ], 
    "Venn": [
        "NNP"
    ], 
    "recooned": [
        "VBD"
    ], 
    "extenuating": [
        "VBG"
    ], 
    "pregnancies": [
        "NNS"
    ], 
    "frequent-flier": [
        "JJ"
    ], 
    "trading-related": [
        "JJ"
    ], 
    "less-liquid": [
        "JJR"
    ], 
    "Loesser": [
        "NNP"
    ], 
    "NESB": [
        "NNP"
    ], 
    "U.S.-dollar": [
        "NN"
    ], 
    "Grads": [
        "NNS"
    ], 
    "Macassar": [
        "NNP"
    ], 
    "ere": [
        "IN"
    ], 
    "overcoming...": [
        ":"
    ], 
    "photosensitive": [
        "JJ"
    ], 
    "leatherbound": [
        "JJ", 
        "NN"
    ], 
    "Masterpiece": [
        "NNP"
    ], 
    "half-forgotten": [
        "JJ"
    ], 
    "unrestricted": [
        "JJ"
    ], 
    "Quack": [
        "NNP", 
        "NN", 
        "UH"
    ], 
    "Damian": [
        "NNP"
    ], 
    "Sensenbrenner": [
        "NNP"
    ], 
    "bandwagon": [
        "NN"
    ], 
    "Coward": [
        "NNP"
    ], 
    "Variations": [
        "NNPS", 
        "NNS"
    ], 
    "Seaton": [
        "NNP"
    ], 
    "weir": [
        "NN"
    ], 
    "Uniondale": [
        "NNP"
    ], 
    "snagging": [
        "VBG"
    ], 
    "congestion": [
        "NN"
    ], 
    "deceit": [
        "NN"
    ], 
    "Leath": [
        "NNP"
    ], 
    "comptroller": [
        "NN"
    ], 
    "Brendle": [
        "NNP"
    ], 
    "Theatre-by-the-Sea": [
        "NNP"
    ], 
    "bids...": [
        ":"
    ], 
    "exploitation": [
        "NN"
    ], 
    "Ikegai": [
        "NNP"
    ], 
    "souring": [
        "NN", 
        "VBG"
    ], 
    "cyst": [
        "NN"
    ], 
    "crusading": [
        "VBG"
    ], 
    "Matrix": [
        "NNP"
    ], 
    "convenience-store": [
        "NN"
    ], 
    "OBrion": [
        "NNP"
    ], 
    "Hammarskjold": [
        "NNP"
    ], 
    "professorships": [
        "NNS"
    ], 
    "Alkylate": [
        "NNP"
    ], 
    "Viss": [
        "NNP"
    ], 
    "pollute": [
        "VB"
    ], 
    "Bridgestone\\/Firestone": [
        "NNP"
    ], 
    "SunCor": [
        "NNP"
    ], 
    "Visx": [
        "NNP"
    ], 
    "scenarios": [
        "NNS"
    ], 
    "Guadalupes": [
        "NNPS"
    ], 
    "Visa": [
        "NNP", 
        "NN"
    ], 
    "balks": [
        "VBZ"
    ], 
    "armchairs": [
        "NNS"
    ], 
    "brashest": [
        "JJS"
    ], 
    "grow-or-die": [
        "JJ"
    ], 
    "Inhalation": [
        "NNP"
    ], 
    "McGonagle": [
        "NNP"
    ], 
    "airline-acquisition": [
        "JJ"
    ], 
    "satirizes": [
        "VBZ"
    ], 
    "Grisoni": [
        "NNP"
    ], 
    "subsistent": [
        "JJ"
    ], 
    "Leinonen": [
        "NNP"
    ], 
    "performance-sharing": [
        "JJ"
    ], 
    "Brae": [
        "NNP"
    ], 
    "Brad": [
        "NNP"
    ], 
    "calorimetric": [
        "JJ"
    ], 
    "Bran": [
        "NNP"
    ], 
    "antismoking": [
        "JJ"
    ], 
    "Benelli": [
        "NNP"
    ], 
    "balk.": [
        "VBP"
    ], 
    "veterinarians": [
        "NNS"
    ], 
    "electrotherapist": [
        "NN"
    ], 
    "Pallo": [
        "NNP"
    ], 
    "repressing": [
        "VBG"
    ], 
    "Children": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "deceased": [
        "JJ", 
        "NN", 
        "VBN"
    ], 
    "Oatnut": [
        "NNP"
    ], 
    "Caring": [
        "VBG"
    ], 
    "cost-saving": [
        "JJ"
    ], 
    "proscriptive": [
        "JJ"
    ], 
    "Baruch": [
        "NNP"
    ], 
    "Lamma": [
        "NNP"
    ], 
    "FOOTNOTE": [
        "NNP"
    ], 
    "pawning": [
        "VBG"
    ], 
    "coincident": [
        "JJ"
    ], 
    "Dutch": [
        "JJ", 
        "NNPS", 
        "NNP"
    ], 
    "bad-law": [
        "NN"
    ], 
    "dimwits": [
        "NNS"
    ], 
    "sell-order": [
        "JJ"
    ], 
    "normalize": [
        "VB"
    ], 
    "strainin": [
        "VBG"
    ], 
    "rays": [
        "NNS"
    ], 
    "Dahmane": [
        "NNP"
    ], 
    "slim-waisted": [
        "JJ"
    ], 
    "tilt": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "necklaces": [
        "NNS"
    ], 
    "ping": [
        "NN", 
        "VB"
    ], 
    "pine": [
        "NN", 
        "VBP"
    ], 
    "tax-fraud": [
        "NN"
    ], 
    "chemical": [
        "NN", 
        "JJ"
    ], 
    "till": [
        "IN", 
        "VB"
    ], 
    "HUH": [
        "NNP"
    ], 
    "skates": [
        "NNS"
    ], 
    "pins": [
        "NNS", 
        "VBZ"
    ], 
    "concertmaster": [
        "NN"
    ], 
    "consulting-firm": [
        "NN"
    ], 
    "pint": [
        "NN"
    ], 
    "spy-plane": [
        "NN"
    ], 
    "Hubba": [
        "UH"
    ], 
    "thermometric": [
        "JJ"
    ], 
    "Oher": [
        "NNP"
    ], 
    "whodunnit": [
        "UH"
    ], 
    "designed": [
        "VBN", 
        "VBD"
    ], 
    "scalloped": [
        "JJ"
    ], 
    "millionths-of-a-second": [
        "JJ"
    ], 
    "aviator": [
        "NN"
    ], 
    "Hippophagique": [
        "NNP"
    ], 
    "Furs": [
        "NNP"
    ], 
    "domestic-inflation": [
        "NN"
    ], 
    "Hendl": [
        "NNP"
    ], 
    "twice-around": [
        "JJ"
    ], 
    "Fury": [
        "NNP", 
        "NN"
    ], 
    "maybe": [
        "RB"
    ], 
    "unobvious": [
        "JJ"
    ], 
    "carriers": [
        "NNS"
    ], 
    "exterminator": [
        "NN"
    ], 
    "Gaussian": [
        "JJ"
    ], 
    "fluent": [
        "JJ"
    ], 
    "provide": [
        "VB", 
        "VBP"
    ], 
    "thorny": [
        "JJ"
    ], 
    "pickets": [
        "NNS"
    ], 
    "thorns": [
        "NNS"
    ], 
    "gesture": [
        "NN"
    ], 
    "Feared": [
        "VBN"
    ], 
    "cute": [
        "JJ"
    ], 
    "daily-wear": [
        "JJ"
    ], 
    "free-buying": [
        "JJ"
    ], 
    "Item-Categories": [
        "NNPS"
    ], 
    "entity": [
        "NN"
    ], 
    "stability": [
        "NN"
    ], 
    "Medicaid-covered": [
        "JJ"
    ], 
    "Walzer": [
        "NNP"
    ], 
    "cuts": [
        "NNS", 
        "VBZ", 
        "NN"
    ], 
    "CAHNERS": [
        "NNP"
    ], 
    "Utahans": [
        "NNPS"
    ], 
    "Merrill-Lynch": [
        "NNP"
    ], 
    "Budieshein": [
        "NNP"
    ], 
    "Jean-Rene": [
        "NNP"
    ], 
    "freight-car": [
        "NN"
    ], 
    "Kozak": [
        "NNP"
    ], 
    "plagiarized": [
        "VBN"
    ], 
    "salves": [
        "NNS"
    ], 
    "Iranian-backed": [
        "JJ"
    ], 
    "serenaded": [
        "VBN", 
        "VBD"
    ], 
    "Wage-settlement": [
        "JJ"
    ], 
    "extirpated": [
        "VBN"
    ], 
    "alluvial": [
        "JJ"
    ], 
    "nouveau": [
        "JJ"
    ], 
    "finance": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "captivated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "P.S": [
        "NN"
    ], 
    "killer": [
        "NN"
    ], 
    "shatter": [
        "VB"
    ], 
    "sooner": [
        "RBR", 
        "RB"
    ], 
    "Usines": [
        "NNP"
    ], 
    "state-sector": [
        "JJ"
    ], 
    "misinterpreters": [
        "NNS"
    ], 
    "budget-sensitive": [
        "JJ"
    ], 
    "aspirations": [
        "NNS"
    ], 
    "Kestner": [
        "NNP"
    ], 
    "killed": [
        "VBN", 
        "VBD"
    ], 
    "ornraier": [
        "RBR"
    ], 
    "Bonniers": [
        "NNP"
    ], 
    "Stores": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "Storer": [
        "NNP"
    ], 
    "resignation": [
        "NN"
    ], 
    "Wakeman": [
        "NNP"
    ], 
    "pickoff": [
        "NN"
    ], 
    "nonfood": [
        "NN"
    ], 
    "unwashed": [
        "JJ"
    ], 
    "Hispanic-market": [
        "JJ"
    ], 
    "peasant": [
        "NN", 
        "JJ"
    ], 
    "P.m": [
        "NN"
    ], 
    "disseration": [
        "NN"
    ], 
    "Southwestern": [
        "NNP", 
        "JJ"
    ], 
    "stock-quote": [
        "JJ"
    ], 
    "thin-margin": [
        "JJ"
    ], 
    "Amstel": [
        "NNP"
    ], 
    "Borrioboola-Gha": [
        "NNP"
    ], 
    "Lux": [
        "FW"
    ], 
    "Luz": [
        "NNP"
    ], 
    "oil-exporting": [
        "NN"
    ], 
    "Misconceptions": [
        "NNS"
    ], 
    "Luc": [
        "NNP"
    ], 
    "gurgling": [
        "VBG"
    ], 
    "aloof": [
        "JJ", 
        "RB"
    ], 
    "Touted": [
        "VBN"
    ], 
    "Steamship": [
        "NNP"
    ], 
    "socialized": [
        "VBN", 
        "VBD"
    ], 
    "flintless": [
        "JJ"
    ], 
    "undulate": [
        "VB", 
        "VBP"
    ], 
    "socializes": [
        "VBZ"
    ], 
    "Ehrman": [
        "NNP"
    ], 
    "papers": [
        "NNS"
    ], 
    "Maureen": [
        "NNP"
    ], 
    "Mastering": [
        "VBG"
    ], 
    "nudes": [
        "NNS"
    ], 
    "ladder": [
        "NN"
    ], 
    "unless": [
        "IN"
    ], 
    "Siamese": [
        "NNP"
    ], 
    "gagging": [
        "VBG"
    ], 
    "democracies": [
        "NNS"
    ], 
    "cholesterol-lowering": [
        "JJ"
    ], 
    "vinyl": [
        "NN"
    ], 
    "Whelen": [
        "NNP"
    ], 
    "follow-on": [
        "JJ"
    ], 
    "Farrar": [
        "NNP"
    ], 
    "Deciding": [
        "VBG"
    ], 
    "Intuition": [
        "NN"
    ], 
    "Already": [
        "RB"
    ], 
    "language": [
        "NN"
    ], 
    "bared": [
        "VBD"
    ], 
    "widths": [
        "NNS"
    ], 
    "drizzling": [
        "VBG", 
        "JJ"
    ], 
    "listings": [
        "NNS"
    ], 
    "proffered": [
        "VBD", 
        "VBN"
    ], 
    "Haden": [
        "NNP"
    ], 
    "foreign-entry-limit": [
        "JJ"
    ], 
    "blacksmith": [
        "NN"
    ], 
    "rewrites": [
        "VBZ"
    ], 
    "Windex": [
        "NNP"
    ], 
    "exotic": [
        "JJ"
    ], 
    "water-borne": [
        "JJ"
    ], 
    "Braye": [
        "NNP"
    ], 
    "scandalized": [
        "VBD", 
        "VBN"
    ], 
    "Didion": [
        "NNP"
    ], 
    "test-like": [
        "JJ"
    ], 
    "ISI": [
        "NNP"
    ], 
    "XIII": [
        "NNP"
    ], 
    "ISO": [
        "NNP"
    ], 
    "Anthong": [
        "NNP"
    ], 
    "ISC": [
        "NNP"
    ], 
    "Rotorex": [
        "NNP"
    ], 
    "restaurant-industry": [
        "JJ"
    ], 
    "scandalizes": [
        "VBZ"
    ], 
    "rivets": [
        "VBZ", 
        "NNS"
    ], 
    "incompetently": [
        "RB"
    ], 
    "honesty": [
        "NN"
    ], 
    "vermeil": [
        "JJ"
    ], 
    "old-grad-type": [
        "NN"
    ], 
    "Pringle": [
        "NNP"
    ], 
    "plains": [
        "NNS"
    ], 
    "Inflation": [
        "NN"
    ], 
    "fellowships": [
        "NNS"
    ], 
    "workability": [
        "NN"
    ], 
    "Botts": [
        "NNP"
    ], 
    "helpings": [
        "NNS"
    ], 
    "Midsized": [
        "JJ"
    ], 
    "less-than-alarming": [
        "JJ"
    ], 
    "massaged": [
        "VBN"
    ], 
    "accurately": [
        "RB"
    ], 
    "maquette": [
        "NN"
    ], 
    "SEMICONDUCTOR": [
        "NNP"
    ], 
    "videodisks": [
        "NNS"
    ], 
    "stipulation": [
        "NN"
    ], 
    "cartels": [
        "NNS"
    ], 
    "Maclaine": [
        "NNP"
    ], 
    "framers": [
        "NNS"
    ], 
    "gotta": [
        "VB", 
        "VBN", 
        "VBP", 
        "VBN|TO", 
        "VBP|TO"
    ], 
    "LifeSpan": [
        "NNP"
    ], 
    "orgy": [
        "NN"
    ], 
    "swearing-in": [
        "NN"
    ], 
    "venture": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "Sexism": [
        "NN"
    ], 
    "commends": [
        "VBZ"
    ], 
    "Autobiography": [
        "NNP"
    ], 
    "Jockey": [
        "NNP"
    ], 
    "dollop": [
        "NN"
    ], 
    "stoicaly": [
        "RB"
    ], 
    "fifth-consecutive": [
        "JJ"
    ], 
    "E.E.": [
        "NNP"
    ], 
    "plunge": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "France-Germany": [
        "NNP"
    ], 
    "Arnolphe": [
        "NNP"
    ], 
    "backwoods": [
        "NNS", 
        "JJ"
    ], 
    "Tollman-Hundley": [
        "NNP"
    ], 
    "prize-fighter": [
        "NN"
    ], 
    "Dworkin-Cosell": [
        "NNP"
    ], 
    "personalized": [
        "VBN", 
        "JJ"
    ], 
    "pranks": [
        "NNS"
    ], 
    "present-time": [
        "JJ"
    ], 
    "Ballhaus": [
        "NNP"
    ], 
    "Articles": [
        "NNPS", 
        "NNS"
    ], 
    "Ravenscroft": [
        "NNP"
    ], 
    "non-prescription": [
        "JJ", 
        "NN"
    ], 
    "investigations": [
        "NNS"
    ], 
    "weakwilled": [
        "JJ"
    ], 
    "anarchist-adventurers": [
        "NNS"
    ], 
    "Strawberry": [
        "NNP"
    ], 
    "indwelling": [
        "VBG", 
        "JJ"
    ], 
    "contrasts": [
        "NNS", 
        "VBZ"
    ], 
    "conspicuous": [
        "JJ"
    ], 
    "Magarity": [
        "NNP"
    ], 
    "Teich": [
        "NNP"
    ], 
    "beachfront": [
        "NN", 
        "JJ"
    ], 
    "refunds": [
        "NNS"
    ], 
    "fills": [
        "VBZ"
    ], 
    "gyro": [
        "NN"
    ], 
    "wreathed": [
        "VBN"
    ], 
    "Arrayed": [
        "VBN"
    ], 
    "filly": [
        "NN"
    ], 
    "sixteen-year-old": [
        "JJ"
    ], 
    "Kasavubu": [
        "NNP"
    ], 
    "fille": [
        "FW"
    ], 
    "massacres": [
        "NNS"
    ], 
    "Galena": [
        "NNP"
    ], 
    "Monastery": [
        "NNP"
    ], 
    "obligatto": [
        "NN"
    ], 
    "Blohm": [
        "NNP"
    ], 
    "trotted": [
        "VBD", 
        "VBN"
    ], 
    "obstructive": [
        "JJ"
    ], 
    "Indicator": [
        "NN"
    ], 
    "Ltd.": [
        "NNP", 
        "NN"
    ], 
    "Hoyvald": [
        "NNP"
    ], 
    "filed": [
        "VBN", 
        "VBD"
    ], 
    "contemporary": [
        "JJ", 
        "NN"
    ], 
    "Graduate": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "Gato": [
        "NNP"
    ], 
    "Gati": [
        "NNP"
    ], 
    "Gate": [
        "NNP", 
        "NN"
    ], 
    "Monogamy": [
        "NN"
    ], 
    "lieder": [
        "JJ", 
        "NN"
    ], 
    "pluri-party": [
        "JJ"
    ], 
    "Payless": [
        "NNP"
    ], 
    "Stapleton": [
        "NNP"
    ], 
    "histories": [
        "NNS"
    ], 
    "Cafferarelli": [
        "NNP"
    ], 
    "nickels": [
        "NNS"
    ], 
    "Saltzburg": [
        "NNP"
    ], 
    "anti-program-trading": [
        "JJ"
    ], 
    "reproducibility": [
        "NN"
    ], 
    "savoring": [
        "VBG"
    ], 
    "underage": [
        "JJ"
    ], 
    "Leaves": [
        "NNS"
    ], 
    "spraying": [
        "NN", 
        "VBG"
    ], 
    "free-floater": [
        "NN"
    ], 
    "framing": [
        "NN", 
        "VBG"
    ], 
    "Toodle": [
        "NNP"
    ], 
    "Midway": [
        "NNP", 
        "RB"
    ], 
    "third-straight": [
        "JJ"
    ], 
    "reading": [
        "NN", 
        "VBG"
    ], 
    "snorted": [
        "VBD"
    ], 
    "Yuli": [
        "NNP"
    ], 
    "Wycombe": [
        "NNP"
    ], 
    "ruddy": [
        "JJ", 
        "RB"
    ], 
    "Malmesbury": [
        "NNP"
    ], 
    "Soeren": [
        "NNP"
    ], 
    "space-shuttle": [
        "NN"
    ], 
    "kernel": [
        "NN"
    ], 
    "lethargy": [
        "NN"
    ], 
    "rookie-of-the-year": [
        "NN"
    ], 
    "monarchists": [
        "NNS"
    ], 
    "anti-conservation": [
        "JJ"
    ], 
    "defense-procurement": [
        "NN"
    ], 
    "innovative": [
        "JJ"
    ], 
    "Exhibits": [
        "NNPS"
    ], 
    "Sigourney": [
        "NNP"
    ], 
    "unsecured": [
        "JJ"
    ], 
    "Hopefully": [
        "RB", 
        "NNP"
    ], 
    "calendar": [
        "NN"
    ], 
    "cost-benefit": [
        "JJ"
    ], 
    "steadfast": [
        "JJ", 
        "RB"
    ], 
    "Stena": [
        "NNP"
    ], 
    "Forgive": [
        "VB"
    ], 
    "performance-oriented": [
        "JJ"
    ], 
    "whereabouts": [
        "NN", 
        "NNS"
    ], 
    "metabolites": [
        "NNS"
    ], 
    "rads": [
        "NNS"
    ], 
    "Ferrier": [
        "NNP"
    ], 
    "Houston-Montgomery": [
        "NNP"
    ], 
    "checks": [
        "NNS", 
        "VBZ"
    ], 
    "oversized": [
        "JJ", 
        "VBN"
    ], 
    "deletions": [
        "NNS"
    ], 
    "Barkley": [
        "NNP"
    ], 
    "single-warhead": [
        "NN"
    ], 
    "killing": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "Competitors": [
        "NNS"
    ], 
    "Froelich": [
        "NNP"
    ], 
    "pillared": [
        "JJ", 
        "VBN"
    ], 
    "top-rated": [
        "JJ"
    ], 
    "pre-World-War": [
        "JJ"
    ], 
    "Thirty-eighth": [
        "NNP"
    ], 
    "cents-per-hour": [
        "JJ"
    ], 
    "nomenclature": [
        "NN"
    ], 
    "indelicate": [
        "JJ"
    ], 
    "Tours": [
        "NNPS"
    ], 
    "disappointment": [
        "NN"
    ], 
    "holders": [
        "NNS"
    ], 
    "decimals": [
        "NNS"
    ], 
    "forecasting": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "over-regulation": [
        "NN"
    ], 
    "SV-10": [
        "NN"
    ], 
    "Elizabethan": [
        "JJ", 
        "NNP"
    ], 
    "Kuse": [
        "NNP"
    ], 
    "Whitlock": [
        "NNP"
    ], 
    "possessive": [
        "JJ"
    ], 
    "Zellerbach": [
        "NNP"
    ], 
    "Tigue": [
        "NNP"
    ], 
    "perpetuating": [
        "VBG"
    ], 
    "Corash": [
        "NNP"
    ], 
    "Sotnikov": [
        "NNP"
    ], 
    "quadrupling": [
        "VBG", 
        "NN"
    ], 
    "arts": [
        "NNS"
    ], 
    "caricature": [
        "NN", 
        "VB"
    ], 
    "all-too-familiar": [
        "JJ"
    ], 
    "localisms": [
        "NNS"
    ], 
    "shortening": [
        "VBG", 
        "NN"
    ], 
    "self-regulator": [
        "NN"
    ], 
    "constituencies": [
        "NNS"
    ], 
    "trading-oriented": [
        "JJ"
    ], 
    "graveyard": [
        "NN"
    ], 
    "business-communications": [
        "NNS"
    ], 
    "agranulocytosis": [
        "NN"
    ], 
    "codpiece": [
        "NN"
    ], 
    "Allstates": [
        "NNP"
    ], 
    "Taxpayers": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Picus": [
        "NNP"
    ], 
    "spills": [
        "NNS", 
        "VBZ"
    ], 
    "overdose": [
        "NN"
    ], 
    "Selwyn": [
        "NNP"
    ], 
    "those": [
        "DT"
    ], 
    "mid-section": [
        "NN"
    ], 
    "job-classification": [
        "NN"
    ], 
    "Minoru": [
        "NNP"
    ], 
    "litterbug": [
        "NN"
    ], 
    "Minors": [
        "NNS"
    ], 
    "disconnected": [
        "VBN", 
        "JJ"
    ], 
    "Discounts": [
        "NNS"
    ], 
    "Malmo": [
        "NNP"
    ], 
    "Fixture": [
        "NNP"
    ], 
    "aircraft-engine": [
        "JJ", 
        "NN"
    ], 
    "client-service": [
        "JJ", 
        "NN"
    ], 
    "Fallick": [
        "NNP"
    ], 
    "deformities": [
        "NNS"
    ], 
    "awakened": [
        "VBN", 
        "VBD"
    ], 
    "grantee": [
        "NN"
    ], 
    "endothelial": [
        "JJ"
    ], 
    "Basketball": [
        "NNP", 
        "NN"
    ], 
    "corn-buying": [
        "JJ"
    ], 
    "Florian": [
        "NNP"
    ], 
    "endowed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "rubbing": [
        "VBG", 
        "NN"
    ], 
    "undertones": [
        "NNS"
    ], 
    "camp-made": [
        "JJ"
    ], 
    "kindnesses": [
        "NNS"
    ], 
    "middle": [
        "NN", 
        "JJ"
    ], 
    "Koyo": [
        "NNP"
    ], 
    "ferns": [
        "NNS"
    ], 
    "Puffing": [
        "VBG"
    ], 
    "family-run": [
        "JJ"
    ], 
    "wimping": [
        "VBG"
    ], 
    "Hoyt": [
        "NNP"
    ], 
    "insofar": [
        "RB", 
        "IN"
    ], 
    "same": [
        "JJ"
    ], 
    "deference": [
        "NN"
    ], 
    "intermediary": [
        "NN", 
        "JJ"
    ], 
    "autonomously": [
        "RB"
    ], 
    "Peabody": [
        "NNP"
    ], 
    "gaspingly": [
        "RB"
    ], 
    "Leroy": [
        "NNP"
    ], 
    "Message": [
        "NN", 
        "NNP"
    ], 
    "devours": [
        "VBZ"
    ], 
    "munch": [
        "VB"
    ], 
    "disincentives": [
        "NNS"
    ], 
    "Canticle": [
        "NNP"
    ], 
    "Defaults": [
        "NNS"
    ], 
    "Smeal": [
        "NNP"
    ], 
    "Mortars": [
        "NNS"
    ], 
    "exluding": [
        "VBG"
    ], 
    "discernable": [
        "JJ"
    ], 
    "intermittent": [
        "JJ"
    ], 
    "Tamerlane": [
        "NNP"
    ], 
    "DOONESBURY": [
        "NNP"
    ], 
    "Phibro": [
        "NNP"
    ], 
    "expressionism": [
        "NN"
    ], 
    "Rubega": [
        "NNP"
    ], 
    "imprint": [
        "VB", 
        "NN"
    ], 
    "Hiss": [
        "NNP"
    ], 
    "adrenal": [
        "JJ", 
        "NN"
    ], 
    "Chavis": [
        "NNP"
    ], 
    "ethyl": [
        "NN"
    ], 
    "dipped": [
        "VBD", 
        "VBN"
    ], 
    "cash-up-front": [
        "NN"
    ], 
    "Genelabs": [
        "NNPS"
    ], 
    "Rattner": [
        "NNP"
    ], 
    "Carmody": [
        "NNP"
    ], 
    "swath": [
        "NN"
    ], 
    "vivify": [
        "VB"
    ], 
    "dipper": [
        "NN"
    ], 
    "Jeep\\/Eagle": [
        "NNP"
    ], 
    "Ethics": [
        "NNP", 
        "NN", 
        "NNS"
    ], 
    "Banquet": [
        "NNP", 
        "NN"
    ], 
    "nos.": [
        "NN"
    ], 
    "liken": [
        "VBP"
    ], 
    "presentable": [
        "JJ"
    ], 
    "Carat": [
        "NNP"
    ], 
    "Concert-Disc": [
        "NNP"
    ], 
    "admitting": [
        "VBG"
    ], 
    "dimensioning": [
        "JJ", 
        "VBG"
    ], 
    "F.S.L.I.C": [
        "NNP"
    ], 
    "Moosilauke": [
        "NNP"
    ], 
    "blankets": [
        "NNS", 
        "VBZ"
    ], 
    "Executioner": [
        "NN"
    ], 
    "noncompetitively": [
        "RB"
    ], 
    "nosy": [
        "JJ"
    ], 
    "CPTs": [
        "NNS"
    ], 
    "Artfully": [
        "RB"
    ], 
    "chamber": [
        "NN"
    ], 
    "audience": [
        "NN"
    ], 
    "nose": [
        "NN", 
        "VB"
    ], 
    "neuronal": [
        "JJ"
    ], 
    "Pathology": [
        "NNP"
    ], 
    "Enron": [
        "NNP"
    ], 
    "Dress": [
        "NNP", 
        "VB"
    ], 
    "specifies": [
        "VBZ"
    ], 
    "Democracy": [
        "NNP", 
        "NN"
    ], 
    "alternated": [
        "VBD", 
        "VBN"
    ], 
    "Ned": [
        "NNP"
    ], 
    "Neb": [
        "NNP"
    ], 
    "Nec": [
        "FW"
    ], 
    "specified": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Nev": [
        "NNP"
    ], 
    "New": [
        "NNP", 
        "NNPS", 
        "JJ", 
        "NN"
    ], 
    "Net": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "spasm": [
        "NN"
    ], 
    "car-dealers": [
        "NNS"
    ], 
    "gross": [
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Intermoda": [
        "NNP"
    ], 
    "Lempesis": [
        "NNP"
    ], 
    "PS\\/2": [
        "NNP"
    ], 
    "Gogo": [
        "NNP"
    ], 
    "Valspar": [
        "NNP"
    ], 
    "Artie": [
        "NNP"
    ], 
    "custody": [
        "NN"
    ], 
    "Gogh": [
        "NNP"
    ], 
    "Barokocy": [
        "NNP"
    ], 
    "reinbursement": [
        "NN"
    ], 
    "buttressed": [
        "VBN"
    ], 
    "Lycidas": [
        "NNP"
    ], 
    "Doritos": [
        "NNS"
    ], 
    "underwriters": [
        "NNS", 
        ","
    ], 
    "cliques": [
        "NNS"
    ], 
    "thefts": [
        "NNS"
    ], 
    "broker": [
        "NN"
    ], 
    "squall": [
        "NN"
    ], 
    "broken": [
        "VBN", 
        "JJ"
    ], 
    "Kyne": [
        "NNP"
    ], 
    "buttresses": [
        "NNS", 
        "VBZ"
    ], 
    "highest-priced": [
        "JJS"
    ], 
    "mysticism": [
        "NN"
    ], 
    "squarely": [
        "RB"
    ], 
    "Husky": [
        "NNP", 
        "JJ"
    ], 
    "roaming": [
        "VBG", 
        "NN"
    ], 
    "pettinesses": [
        "NNS"
    ], 
    "California-bashing": [
        "JJ"
    ], 
    "opium": [
        "NN"
    ], 
    "tease": [
        "VB", 
        "NN", 
        "VBP"
    ], 
    "othe": [
        "JJ"
    ], 
    "bilharziasis": [
        "NN"
    ], 
    "Kalin": [
        "NNP"
    ], 
    "arty": [
        "JJ"
    ], 
    "MANY": [
        "JJ"
    ], 
    "organizers": [
        "NNS"
    ], 
    "check-processing": [
        "JJ", 
        "NN"
    ], 
    "Dimensions": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "Functions": [
        "NNPS"
    ], 
    "Contacts": [
        "NNPS"
    ], 
    "not-strictly-practical": [
        "JJ"
    ], 
    "then-current": [
        "JJ"
    ], 
    "Xydis": [
        "NNP"
    ], 
    "Kwasha": [
        "NNP"
    ], 
    "theories...": [
        ":"
    ], 
    "Baring": [
        "NNP"
    ], 
    "state-private": [
        "JJ"
    ], 
    "Larsson": [
        "NNP"
    ], 
    "argumentation": [
        "NN"
    ], 
    "Conductor": [
        "NN", 
        "NNP"
    ], 
    "daubed": [
        "VBD"
    ], 
    "Nest": [
        "NNP"
    ], 
    "Greiner": [
        "NNP"
    ], 
    "brute": [
        "NN", 
        "JJ"
    ], 
    "fates": [
        "NNS"
    ], 
    "Suffering": [
        "VBG"
    ], 
    "Nesi": [
        "NNP"
    ], 
    "Luth": [
        "NNP"
    ], 
    "two-tiered": [
        "JJ"
    ], 
    "Counsel": [
        "NNP", 
        "NN"
    ], 
    "mornings": [
        "NNS"
    ], 
    "countersuing": [
        "VBG"
    ], 
    "hesitance": [
        "NN"
    ], 
    "proportionately": [
        "RB"
    ], 
    "debt\\/equity": [
        "NN"
    ], 
    "Transition": [
        "NN", 
        "NNP"
    ], 
    "DIAL-A-PIANO-LESSON": [
        "NNP"
    ], 
    "anti-infectives": [
        "NNS"
    ], 
    "wiping": [
        "VBG"
    ], 
    "collosal": [
        "JJ"
    ], 
    "staircases": [
        "NNS"
    ], 
    "Walker": [
        "NNP"
    ], 
    "Gutfreund": [
        "NNP"
    ], 
    "Castle": [
        "NNP", 
        "NN"
    ], 
    "hesitancy": [
        "NN"
    ], 
    "municipally-sponsored": [
        "JJ"
    ], 
    "belated": [
        "JJ"
    ], 
    "bomb-proof": [
        "JJ"
    ], 
    "Cigarette-vending": [
        "JJ"
    ], 
    "commonality": [
        "NN"
    ], 
    "HUD-supervised": [
        "JJ"
    ], 
    "co-chief": [
        "JJ", 
        "NN"
    ], 
    "anemated": [
        "VBN"
    ], 
    "Nouvelle": [
        "NNP"
    ], 
    "sudden-end": [
        "JJ"
    ], 
    "SHOULD": [
        "MD"
    ], 
    "strawberry": [
        "NN"
    ], 
    "solvents": [
        "NNS"
    ], 
    "suitcase": [
        "NN"
    ], 
    "Commissioning": [
        "VBG"
    ], 
    "undereducated": [
        "JJ"
    ], 
    "Blues": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "ossification": [
        "NN"
    ], 
    "Alison": [
        "NN"
    ], 
    "Allgemeine": [
        "NNP"
    ], 
    "COFFEE": [
        "NN", 
        "NNP"
    ], 
    "TuHulHulZote": [
        "NNP"
    ], 
    "leaked": [
        "VBN", 
        "VBD"
    ], 
    "croons": [
        "VBZ"
    ], 
    "VISX": [
        "NNP"
    ], 
    "leaker": [
        "NN"
    ], 
    "VISA": [
        "NNP"
    ], 
    "girlfriend": [
        "NN"
    ], 
    "lifetime": [
        "NN", 
        "JJ"
    ], 
    "deterrent": [
        "NN"
    ], 
    "go-betweens": [
        "NNS"
    ], 
    "Nieman": [
        "NNP"
    ], 
    "PKbanken": [
        "NNP"
    ], 
    "Miringoff": [
        "NNP"
    ], 
    "slew": [
        "NN"
    ], 
    "drouth": [
        "NN"
    ], 
    "bragging": [
        "VBG", 
        "NN"
    ], 
    "unaccustomed": [
        "JJ"
    ], 
    "Drilling": [
        "NNP", 
        "NN"
    ], 
    "Frontage": [
        "NN"
    ], 
    "definition-specialization": [
        "JJ", 
        "NN"
    ], 
    "entertainment-industry": [
        "NN"
    ], 
    "students": [
        "NNS"
    ], 
    "Geolite": [
        "NN"
    ], 
    "Vadehra": [
        "NNP"
    ], 
    "Balanchine": [
        "NNP"
    ], 
    "deriving": [
        "VBG"
    ], 
    "obsesses": [
        "VBZ"
    ], 
    "Houten": [
        "NNP"
    ], 
    "elastomers": [
        "NNS"
    ], 
    "tackle": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "revolve": [
        "VB", 
        "VBP"
    ], 
    "unpopularity": [
        "NN"
    ], 
    "remote": [
        "JJ"
    ], 
    "Restructure": [
        "VBP"
    ], 
    "recapitulation": [
        "NN"
    ], 
    "thrift-resolution": [
        "NN"
    ], 
    "Intangible": [
        "JJ"
    ], 
    "Secretary-designate": [
        "NNP"
    ], 
    "home-health-care": [
        "JJ"
    ], 
    "high-balance": [
        "JJ"
    ], 
    "nutrient": [
        "JJ"
    ], 
    "sterility-assurance": [
        "NN"
    ], 
    "counter-trend": [
        "JJ"
    ], 
    "starting": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "bottoming": [
        "VBG"
    ], 
    "growling": [
        "VBG"
    ], 
    "Trish": [
        "NNP"
    ], 
    "Gallitano": [
        "NNP"
    ], 
    "Voute": [
        "NNP"
    ], 
    "mug": [
        "NN"
    ], 
    "suburban": [
        "JJ"
    ], 
    "alerting": [
        "VBG"
    ], 
    "Wayne": [
        "NNP"
    ], 
    "half-owned": [
        "JJ"
    ], 
    "Theorem": [
        "NN"
    ], 
    "b-reflects": [
        "VBZ"
    ], 
    "Euler": [
        "NNP"
    ], 
    "reluctant": [
        "JJ"
    ], 
    "Transcaucasian": [
        "JJ"
    ], 
    "Fremont": [
        "NNP"
    ], 
    "odyssey": [
        "NN"
    ], 
    "investigational": [
        "JJ"
    ], 
    "Bologna": [
        "NNP", 
        "NN"
    ], 
    "Fulghum": [
        "NNP"
    ], 
    "selloffs": [
        "NNS"
    ], 
    "nightfall": [
        "NN"
    ], 
    "Beame": [
        "NNP"
    ], 
    "bevy": [
        "NN"
    ], 
    "self-deception": [
        "NN"
    ], 
    "shifters": [
        "NNS"
    ], 
    "rambunctious": [
        "JJ"
    ], 
    "Vehicles": [
        "NNPS", 
        "NNS"
    ], 
    "overdone": [
        "VBN"
    ], 
    "Holliston": [
        "NNP"
    ], 
    "scour": [
        "VBP", 
        "VB"
    ], 
    "posseman": [
        "NN"
    ], 
    "bottleneck": [
        "NN"
    ], 
    "capillary": [
        "NN"
    ], 
    "Ventured": [
        "NNP"
    ], 
    "extractors": [
        "NNS"
    ], 
    "benevolent": [
        "JJ"
    ], 
    "industrialization": [
        "NN"
    ], 
    "Course": [
        "NNP"
    ], 
    "crckdown.": [
        "NN"
    ], 
    "Rector": [
        "NNP"
    ], 
    "mistaking": [
        "VBG", 
        "NN"
    ], 
    "incompatibles": [
        "NNS"
    ], 
    "Surety": [
        "NNP"
    ], 
    "Buds": [
        "NNPS"
    ], 
    "fauteuil": [
        "FW"
    ], 
    "titled": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "MacGregor": [
        "NNP"
    ], 
    "periodicity": [
        "NN"
    ], 
    "JSP-supported": [
        "JJ"
    ], 
    "Benzell": [
        "NNP"
    ], 
    "knitted": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "titles": [
        "NNS"
    ], 
    "lawyer": [
        "NN"
    ], 
    "Budd": [
        "NNP"
    ], 
    "Unam": [
        "NNP"
    ], 
    "Wycoff": [
        "NNP"
    ], 
    "novitiate": [
        "NN"
    ], 
    "CHECKUPS": [
        "NNS"
    ], 
    "Liberties": [
        "NNPS", 
        "NNP"
    ], 
    "high-profit-margin": [
        "JJ"
    ], 
    "Ellington": [
        "NNP"
    ], 
    "sociologically": [
        "RB"
    ], 
    "Grievances": [
        "NNP", 
        "NNPS"
    ], 
    "Eskandarian": [
        "NNP"
    ], 
    "unreported": [
        "JJ"
    ], 
    "HENRI": [
        "NNP"
    ], 
    "pupated": [
        "VBN"
    ], 
    "K": [
        "NNP", 
        "LS", 
        "NN"
    ], 
    "beacon": [
        "NN"
    ], 
    "venerated": [
        "VBN"
    ], 
    "HENRY": [
        "NNP"
    ], 
    "biweekly": [
        "JJ", 
        "NN"
    ], 
    "drubbed": [
        "VBN"
    ], 
    "fatter": [
        "JJR"
    ], 
    "search": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "feminine-care": [
        "JJ"
    ], 
    "Pumwani": [
        "NNP"
    ], 
    "super-headache": [
        "NN"
    ], 
    "emergency-claims": [
        "NNS"
    ], 
    "Nissei": [
        "NNP"
    ], 
    "fatten": [
        "VB", 
        "VBP"
    ], 
    "pathological": [
        "JJ"
    ], 
    "Devin": [
        "NNP"
    ], 
    "Devil": [
        "NNP", 
        "NN"
    ], 
    "Scriptures": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "bathe": [
        "VB"
    ], 
    "Warriors": [
        "NNP", 
        "NNPS"
    ], 
    "transit": [
        "NN", 
        "JJ"
    ], 
    "sadist": [
        "NN"
    ], 
    "seceded": [
        "VBN"
    ], 
    "debugged": [
        "VBN"
    ], 
    "Yaddo": [
        "NNP"
    ], 
    "sadism": [
        "NN"
    ], 
    "establish": [
        "VB", 
        "VBP"
    ], 
    "barked": [
        "VBD"
    ], 
    "issues-such": [
        "JJ"
    ], 
    "Conoco": [
        "NNP"
    ], 
    "Hard-surface": [
        "JJ"
    ], 
    "rotogravures": [
        "NNS"
    ], 
    "cultivation": [
        "NN"
    ], 
    "water-holding": [
        "JJ"
    ], 
    "Transfer": [
        "NN", 
        "NNP"
    ], 
    "OUR": [
        "PRP$"
    ], 
    "achieving": [
        "VBG"
    ], 
    "OUT": [
        "IN", 
        "RP"
    ], 
    "BOTH": [
        "DT"
    ], 
    "Glamorous": [
        "JJ"
    ], 
    "Boeing": [
        "NNP", 
        "VBG"
    ], 
    "career-bound": [
        "JJ"
    ], 
    "FEDERAL": [
        "NNP", 
        "JJ"
    ], 
    "brisk": [
        "JJ"
    ], 
    "dammit": [
        "UH", 
        "VB"
    ], 
    "Chukchi": [
        "NNP"
    ], 
    "Racal": [
        "NNP"
    ], 
    "maharajahs": [
        "NNS"
    ], 
    "Schwartau": [
        "NNP"
    ], 
    "none": [
        "NN"
    ], 
    "income-paying": [
        "JJ"
    ], 
    "intercepted": [
        "VBD", 
        "VBN"
    ], 
    "Comany": [
        "NNP"
    ], 
    "clergy": [
        "NN", 
        "NNS"
    ], 
    "Tagalog": [
        "NNP"
    ], 
    "refugee": [
        "NN"
    ], 
    "blastdown": [
        "NN"
    ], 
    "ex-jazz": [
        "JJ"
    ], 
    "compare": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Personal-computer": [
        "NN"
    ], 
    "buttress": [
        "VB"
    ], 
    "ionizing": [
        "VBG"
    ], 
    "raisin": [
        "NN"
    ], 
    "socal": [
        "JJ"
    ], 
    "AHSC": [
        "NNP"
    ], 
    "electronography": [
        "NN"
    ], 
    "minimum-tax": [
        "NN"
    ], 
    "gray-looking": [
        "JJ"
    ], 
    "wisely": [
        "RB"
    ], 
    "Ex-Presidents": [
        "NNS"
    ], 
    "thallium": [
        "NN"
    ], 
    "morning-session": [
        "NN"
    ], 
    "Carpenter": [
        "NNP"
    ], 
    "Stacy": [
        "NNP"
    ], 
    "Cabanne": [
        "NNP"
    ], 
    "Balkanize": [
        "VB"
    ], 
    "Stack": [
        "NNP"
    ], 
    "heartwarmingly": [
        "RB"
    ], 
    "galactic": [
        "JJ"
    ], 
    "charms": [
        "NNS", 
        "VBZ"
    ], 
    "petite": [
        "JJ"
    ], 
    "servicers": [
        "NNS"
    ], 
    "capital-intensive": [
        "JJ"
    ], 
    "slangy-confidential": [
        "JJ"
    ], 
    "bouffant": [
        "JJ", 
        "NN"
    ], 
    "petits": [
        "FW", 
        "JJ"
    ], 
    "Jepson": [
        "NNP"
    ], 
    "Sophie": [
        "NNP"
    ], 
    "Cadbury": [
        "NNP"
    ], 
    "bloom": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Sophia": [
        "NNP"
    ], 
    "coffin-sized": [
        "JJ"
    ], 
    "coax": [
        "VB"
    ], 
    "unreservedly": [
        "RB"
    ], 
    "coat": [
        "NN", 
        "VB"
    ], 
    "cemeteries": [
        "NNS"
    ], 
    "coal": [
        "NN"
    ], 
    "Prawiro": [
        "NNP"
    ], 
    "What": [
        "WP", 
        "NNP", 
        "PDT", 
        "WDT"
    ], 
    "finalized": [
        "VBN", 
        "VBD"
    ], 
    "U.K.": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "setback": [
        "NN"
    ], 
    "Pearlman": [
        "NNP"
    ], 
    "Intermark": [
        "NNP"
    ], 
    "dough": [
        "NN"
    ], 
    "M\\/I": [
        "NNP"
    ], 
    "existence": [
        "NN"
    ], 
    "clumsily": [
        "RB"
    ], 
    "Wham": [
        "UH"
    ], 
    "Whah": [
        "WRB"
    ], 
    "anaplasmosis": [
        "NN"
    ], 
    "Ranking": [
        "NN", 
        "VBG"
    ], 
    "Pinola": [
        "NNP"
    ], 
    "Morehouse": [
        "NNP"
    ], 
    "render": [
        "VB", 
        "VBP"
    ], 
    "sodium": [
        "NN"
    ], 
    "Leyland": [
        "NNP"
    ], 
    "Marietta": [
        "NNP"
    ], 
    "clamor": [
        "VBP", 
        "NN"
    ], 
    "bereft": [
        "JJ", 
        "VBN"
    ], 
    "infantrymen": [
        "NNS"
    ], 
    "pollen-and-nectar": [
        "NN"
    ], 
    "time-temperature": [
        "JJ", 
        "NN"
    ], 
    "Gullah": [
        "NNP"
    ], 
    "minting": [
        "VBG"
    ], 
    "Dorcas": [
        "NNP"
    ], 
    "walls": [
        "NNS"
    ], 
    "Hansmann": [
        "NNP"
    ], 
    "Seelenfreund": [
        "NNP"
    ], 
    "detach": [
        "VB"
    ], 
    "Mogadishu": [
        "NNP"
    ], 
    "Afrique": [
        "NNP"
    ], 
    "Dist": [
        "NNP"
    ], 
    "Chung": [
        "NNP"
    ], 
    "suprise": [
        "NN"
    ], 
    "token": [
        "JJ", 
        "NN"
    ], 
    "Kronish": [
        "NNP"
    ], 
    "subjugation": [
        "NN"
    ], 
    "under-owned": [
        "JJ"
    ], 
    "Dish": [
        "NNP"
    ], 
    "McDonnell": [
        "NNP", 
        "NN"
    ], 
    "Disk": [
        "NN"
    ], 
    "upper-echelon": [
        "JJ"
    ], 
    "clamp": [
        "VB", 
        "NN"
    ], 
    "paper-company": [
        "JJ", 
        "NN"
    ], 
    "clams": [
        "NNS"
    ], 
    "low-pass": [
        "JJ"
    ], 
    "nakedness": [
        "NN"
    ], 
    "beret": [
        "NN"
    ], 
    "securities-laws": [
        "NNS"
    ], 
    "dullish": [
        "JJ"
    ], 
    "implicated": [
        "VBN"
    ], 
    "Granville": [
        "NNP"
    ], 
    "Pattenden": [
        "NNP"
    ], 
    "seniority": [
        "NN"
    ], 
    "allusions": [
        "NNS"
    ], 
    "sub-minimum": [
        "JJ"
    ], 
    "ides": [
        "NNS"
    ], 
    "initiatives": [
        "NNS", 
        "VBZ"
    ], 
    "reinstating": [
        "VBG"
    ], 
    "Lawyers": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "HOLDINGS": [
        "NNPS"
    ], 
    "Popkin": [
        "NNP"
    ], 
    "numbingly": [
        "RB"
    ], 
    "Outlet": [
        "NNP"
    ], 
    "avenge": [
        "VB"
    ], 
    "Rocketdyne": [
        "NNP"
    ], 
    "Ukraine": [
        "NNP"
    ], 
    "Rosalynn": [
        "NNP"
    ], 
    "stridently": [
        "RB"
    ], 
    "Parsons": [
        "NNP"
    ], 
    "Anytime": [
        "RB"
    ], 
    "Inacio": [
        "NNP"
    ], 
    "Chin-Use": [
        "VB"
    ], 
    "Fenerty": [
        "NNP"
    ], 
    "Magoon": [
        "NNP"
    ], 
    "disposition": [
        "NN"
    ], 
    "Capwell": [
        "NNP"
    ], 
    "Squeezed": [
        "VBN"
    ], 
    "Pelham": [
        "NNP"
    ], 
    "Yankees": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "junk-bond-financed": [
        "JJ"
    ], 
    "Raines": [
        "NNP"
    ], 
    "Rainer": [
        "NNP"
    ], 
    "Tasaki-Riger": [
        "NNP"
    ], 
    "settlers": [
        "NNS"
    ], 
    "omit": [
        "VB", 
        "VBP"
    ], 
    "Nazzella": [
        "NNP"
    ], 
    "Gettleman": [
        "NNP"
    ], 
    "Homeowner": [
        "NNP"
    ], 
    "audacity": [
        "NN"
    ], 
    "Inna": [
        "NNP"
    ], 
    "Kieslowski": [
        "NNP"
    ], 
    "McKinley": [
        "NNP"
    ], 
    "Pullman": [
        "NNP"
    ], 
    "CONVICTS": [
        "VBZ"
    ], 
    "seduction": [
        "NN"
    ], 
    "soot-stained": [
        "JJ"
    ], 
    "bullies": [
        "VBZ", 
        "NNS"
    ], 
    "Officers": [
        "NNS", 
        "NNPS", 
        "NN", 
        "NNP"
    ], 
    "smaller": [
        "JJR", 
        "RBR"
    ], 
    "elevator": [
        "NN"
    ], 
    "Salerno": [
        "NNP"
    ], 
    "Gilbert": [
        "NNP"
    ], 
    "unfunnily": [
        "RB"
    ], 
    "Lipton": [
        "NNP"
    ], 
    "Saltis-McErlane": [
        "NNP"
    ], 
    "energy-hungry": [
        "JJ"
    ], 
    "Slight": [
        "JJ"
    ], 
    "totally": [
        "RB"
    ], 
    "kob": [
        "NN"
    ], 
    "entreated": [
        "VBD"
    ], 
    "suffixand": [
        "NN"
    ], 
    "Pediatric": [
        "NNP"
    ], 
    "beardown": [
        "JJ"
    ], 
    "casework": [
        "NN"
    ], 
    "matching-fund": [
        "JJ"
    ], 
    "Oberreit": [
        "NNP"
    ], 
    "ravings": [
        "NNS"
    ], 
    "mentality": [
        "NN"
    ], 
    "DTF": [
        "NN"
    ], 
    "madmen": [
        "NNS"
    ], 
    "vernier": [
        "NN"
    ], 
    "turboprop": [
        "NN"
    ], 
    "newswire": [
        "NN"
    ], 
    "three-fifths": [
        "JJ"
    ], 
    "liquid-chromatography": [
        "NN"
    ], 
    "pickups": [
        "NNS"
    ], 
    "colander": [
        "NN"
    ], 
    "Philco-sponsored": [
        "JJ"
    ], 
    "workbenches": [
        "NNS"
    ], 
    "riddance": [
        "NN"
    ], 
    "interactive": [
        "JJ"
    ], 
    "Jurong": [
        "NNP"
    ], 
    "emanation": [
        "NN"
    ], 
    "Waterville": [
        "NNP"
    ], 
    "actuary": [
        "NN"
    ], 
    "plead": [
        "VB", 
        "VBP"
    ], 
    "interloper": [
        "NN"
    ], 
    "Schmetterer": [
        "NNP"
    ], 
    "intestine": [
        "NN"
    ], 
    "Somerset": [
        "NNP"
    ], 
    "collateralized": [
        "JJ", 
        "VBN"
    ], 
    "Kozloff": [
        "NNP"
    ], 
    "schizoid": [
        "JJ"
    ], 
    "Virginia": [
        "NNP"
    ], 
    "onset": [
        "NN"
    ], 
    "extracted": [
        "VBN", 
        "VBD"
    ], 
    "Joffrey": [
        "NNP"
    ], 
    "press-freedom": [
        "NN"
    ], 
    "hecatomb": [
        "NN"
    ], 
    "commentary": [
        "NN"
    ], 
    "listeria": [
        "FW"
    ], 
    "RPM": [
        "NNP"
    ], 
    "Beefsteak": [
        "NNP"
    ], 
    "Hanwa": [
        "NNP"
    ], 
    "equipping": [
        "VBG", 
        "NN"
    ], 
    "medium-sized": [
        "JJ"
    ], 
    "depths": [
        "NNS"
    ], 
    "Communications": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "oat-bran": [
        "NN"
    ], 
    "self-correcting": [
        "JJ"
    ], 
    "Anatomically": [
        "RB"
    ], 
    "pocketing": [
        "VBG"
    ], 
    "squelched": [
        "VBN"
    ], 
    "handscrolls": [
        "NNS"
    ], 
    "loners": [
        "NNS"
    ], 
    "Encouraging": [
        "VBG"
    ], 
    "squelch": [
        "VBP"
    ], 
    "ASDIC": [
        "NNP"
    ], 
    "Armageddon": [
        "NN", 
        "NNP"
    ], 
    "Regime": [
        "NNP"
    ], 
    "COLLECTING": [
        "NN"
    ], 
    "lumping": [
        "VBG"
    ], 
    "Helms": [
        "NNP"
    ], 
    "antisubmarine": [
        "JJ"
    ], 
    "Bixby": [
        "NNP"
    ], 
    "hillside": [
        "NN"
    ], 
    "sanctity": [
        "NN"
    ], 
    "tax-backed": [
        "JJ"
    ], 
    "Fiechter": [
        "NNP"
    ], 
    "persuasively": [
        "RB"
    ], 
    "mother-naked": [
        "JJ"
    ], 
    "Sensor": [
        "NNP"
    ], 
    "goose-stepping": [
        "VBG"
    ], 
    "gangs": [
        "NNS"
    ], 
    "philanthropists": [
        "NNS"
    ], 
    "Takihyo": [
        "NNP"
    ], 
    "J.T.": [
        "NNP"
    ], 
    "anachronisms": [
        "NNS"
    ], 
    "freedoms": [
        "NNS"
    ], 
    "generators": [
        "NNS"
    ], 
    "Whitlow": [
        "NNP"
    ], 
    "first-preference": [
        "NN"
    ], 
    "cysts": [
        "NNS"
    ], 
    "prowess": [
        "NN"
    ], 
    "notation": [
        "NN"
    ], 
    "permission": [
        "NN"
    ], 
    "Marry": [
        "NNP"
    ], 
    "Barre-Montpelier": [
        "NNP"
    ], 
    "horsemeat": [
        "NN"
    ], 
    "UNCERTAINTY": [
        "NN"
    ], 
    "Marra": [
        "NNP"
    ], 
    "promptings": [
        "NNS"
    ], 
    "Reich": [
        "NNP"
    ], 
    "annexation": [
        "NN"
    ], 
    "Kingdome": [
        "NNP"
    ], 
    "slingers": [
        "NNS"
    ], 
    "cumulate": [
        "VB"
    ], 
    "real-life": [
        "JJ"
    ], 
    "twiggy-looking": [
        "JJ"
    ], 
    "Smartt": [
        "NNP"
    ], 
    "Hebrews": [
        "NNPS"
    ], 
    "series-production": [
        "NN"
    ], 
    "reputable": [
        "JJ"
    ], 
    "Op.": [
        "NNP", 
        "NN"
    ], 
    "Attendance": [
        "NN"
    ], 
    "McGurk": [
        "NNP"
    ], 
    "tended": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Wright": [
        "NNP"
    ], 
    "individual": [
        "JJ", 
        "NN"
    ], 
    "tender": [
        "NN", 
        "VBP", 
        "JJ", 
        "VB"
    ], 
    "Tuchman": [
        "NNP"
    ], 
    "enveloped": [
        "VBN"
    ], 
    "Collaborative": [
        "NNP"
    ], 
    "multiparty": [
        "NN", 
        "JJ"
    ], 
    "manumitted": [
        "VBN"
    ], 
    "TCU": [
        "NNP"
    ], 
    "TCR": [
        "NNP"
    ], 
    "aviary": [
        "NN"
    ], 
    "halves": [
        "NNS", 
        "VBZ"
    ], 
    "Plunking": [
        "VBG"
    ], 
    "envelopes": [
        "NNS"
    ], 
    "TCI": [
        "NNP"
    ], 
    "TCF": [
        "NNP"
    ], 
    "guilt": [
        "NN"
    ], 
    "Isaiah": [
        "NNP"
    ], 
    "technical-ladder": [
        "JJ"
    ], 
    "interfaces": [
        "NNS"
    ], 
    "constitutional-law": [
        "JJ", 
        "NN"
    ], 
    "analogues": [
        "NNS"
    ], 
    "overvalued": [
        "VBN", 
        "VBN|JJ", 
        "VBD", 
        "JJ"
    ], 
    "trespassed": [
        "VBN", 
        "VBD"
    ], 
    "cleaned-up": [
        "JJ"
    ], 
    "Belshazzar": [
        "NNP"
    ], 
    "Preambles": [
        "NNS"
    ], 
    "understand\\/adopt": [
        "VB"
    ], 
    "combustibles": [
        "NNS"
    ], 
    "mid-February": [
        "NNP"
    ], 
    "Grieco": [
        "NNP"
    ], 
    "PW4060": [
        "NNP"
    ], 
    "Rossi": [
        "NNP"
    ], 
    "Krauss-Maffei": [
        "NNP"
    ], 
    "Jenner": [
        "NNP"
    ], 
    "Sidney": [
        "NNP"
    ], 
    "sugar-subsidy": [
        "NN"
    ], 
    "Counselors": [
        "NNPS"
    ], 
    "Ladehoff": [
        "NNP"
    ], 
    "openness": [
        "NN"
    ], 
    "Payline": [
        "NNP"
    ], 
    "suppressing": [
        "VBG"
    ], 
    "seven-inning": [
        "JJ"
    ], 
    "blood-kinship": [
        "NN"
    ], 
    "create": [
        "VB", 
        "VBP"
    ], 
    "TROUBLES": [
        "NNS"
    ], 
    "Ever-more": [
        "RB"
    ], 
    "Lousie": [
        "NNP"
    ], 
    "fast-frozen": [
        "JJ"
    ], 
    "Senora": [
        "NNP"
    ], 
    "Lubbock": [
        "NNP"
    ], 
    "Ritchie": [
        "NNP"
    ], 
    "hopefuls": [
        "NNS"
    ], 
    "roomette": [
        "NN"
    ], 
    "Servant": [
        "NNP"
    ], 
    "flavorful": [
        "JJ"
    ], 
    "Casino": [
        "NNP", 
        "NN"
    ], 
    "COVER": [
        "NN"
    ], 
    "pre-1933": [
        "JJ"
    ], 
    "understand": [
        "VB", 
        "VBP"
    ], 
    "realms": [
        "NNS"
    ], 
    "Dycom": [
        "NNP"
    ], 
    "Pozen": [
        "NNP"
    ], 
    "Sino-British": [
        "JJ"
    ], 
    "Ding": [
        "NNP"
    ], 
    "bile": [
        "NN"
    ], 
    "unify": [
        "VB"
    ], 
    "enchanted": [
        "VBN", 
        "JJ"
    ], 
    "Dino": [
        "NNP"
    ], 
    "laxness": [
        "NN"
    ], 
    "bill": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "bilk": [
        "VB"
    ], 
    "Salpetriere": [
        "NNP"
    ], 
    "Dinh": [
        "NNP"
    ], 
    "prolusions": [
        "NNS"
    ], 
    "Defending": [
        "VBG"
    ], 
    "CONTAMINATION": [
        "NN"
    ], 
    "non-Dow": [
        "NNP"
    ], 
    "Incorrect": [
        "JJ"
    ], 
    "vaults": [
        "NNS"
    ], 
    "shoddy": [
        "JJ"
    ], 
    "credit-worthiness": [
        "NN"
    ], 
    "rancor": [
        "NN"
    ], 
    "decoration": [
        "NN"
    ], 
    "cadge": [
        "VBP"
    ], 
    "tribesmen": [
        "NNS"
    ], 
    "arenas": [
        "NNS"
    ], 
    "computer-network": [
        "NN"
    ], 
    "Monarque": [
        "FW"
    ], 
    "saline": [
        "NN", 
        "JJ"
    ], 
    "headless": [
        "JJ"
    ], 
    "Zimmer": [
        "NNP"
    ], 
    "leafed": [
        "VBD"
    ], 
    "Carrying": [
        "VBG"
    ], 
    "copying": [
        "NN", 
        "VBG"
    ], 
    "Martinique": [
        "NNP"
    ], 
    "dishonouring": [
        "VBG"
    ], 
    "F.D.": [
        "NNP"
    ], 
    "less-hurried": [
        "JJ"
    ], 
    "Barksdale": [
        "NNP"
    ], 
    "Motor": [
        "NNP", 
        "NN"
    ], 
    "itch": [
        "VB", 
        "NN"
    ], 
    "praising": [
        "VBG"
    ], 
    "Sinhalese-dominated": [
        "JJ"
    ], 
    "most-obvious": [
        "JJ"
    ], 
    "moment": [
        "NN"
    ], 
    "citadels": [
        "NNS"
    ], 
    "Bermuda-based": [
        "JJ"
    ], 
    "information-display": [
        "JJ", 
        "NN"
    ], 
    "sandals": [
        "NNS"
    ], 
    "carver": [
        "NN"
    ], 
    "Coffin": [
        "NNP"
    ], 
    "knowed": [
        "VBN"
    ], 
    "grown-up": [
        "JJ", 
        "NN"
    ], 
    "Figura": [
        "NNP"
    ], 
    "Langbo": [
        "NNP"
    ], 
    "Figure": [
        "NN", 
        "VB", 
        "NNP"
    ], 
    "percentages": [
        "NNS"
    ], 
    "high-tech-sounding": [
        "JJ"
    ], 
    "morrow": [
        "NN"
    ], 
    "cornball": [
        "NN"
    ], 
    "y": [
        "NNP", 
        "NN"
    ], 
    "revising": [
        "VBG"
    ], 
    "absolving": [
        "VBG"
    ], 
    "chemistry": [
        "NN"
    ], 
    "Considering": [
        "VBG"
    ], 
    "echoing": [
        "VBG"
    ], 
    "purview": [
        "NN"
    ], 
    "makeshifts": [
        "NNS"
    ], 
    "Bremen": [
        "NNP"
    ], 
    "Cycads": [
        "NNS"
    ], 
    "Chojnowski": [
        "NNP"
    ], 
    "Sheckley": [
        "NNP"
    ], 
    "zodiacal": [
        "JJ"
    ], 
    "dishonesty": [
        "NN"
    ], 
    "alignment": [
        "NN"
    ], 
    "diversions": [
        "NNS"
    ], 
    "Overstreet": [
        "NNP"
    ], 
    "excites": [
        "VBZ"
    ], 
    "exciter": [
        "NN"
    ], 
    "shouting": [
        "VBG", 
        "NN"
    ], 
    "bridal": [
        "JJ"
    ], 
    "Alida": [
        "NNP"
    ], 
    "Scholars": [
        "NNPS", 
        "NNS"
    ], 
    "co-manager": [
        "NN"
    ], 
    "chambermaid": [
        "NN"
    ], 
    "co-managed": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "matters": [
        "NNS", 
        "VBZ"
    ], 
    "reapportionment": [
        "NN"
    ], 
    "Enhance": [
        "NNP"
    ], 
    "Trichinella": [
        "NN"
    ], 
    "wave-particle": [
        "NN"
    ], 
    "wisenheimer": [
        "NN"
    ], 
    "disrepair": [
        "NN"
    ], 
    "enervation": [
        "NN"
    ], 
    "forepart": [
        "NN"
    ], 
    "Sigoloff": [
        "NNP"
    ], 
    "Reedy": [
        "NNP"
    ], 
    "glove": [
        "NN"
    ], 
    "Orthodoxy": [
        "NNP"
    ], 
    "deshabille": [
        "NN"
    ], 
    "INFLATION": [
        "NN"
    ], 
    "gut-flattening": [
        "JJ"
    ], 
    "friezes": [
        "NNS"
    ], 
    "Rawlins": [
        "NNP"
    ], 
    "protein-restricted": [
        "JJ"
    ], 
    "Chosen": [
        "NNP"
    ], 
    "peddlers": [
        "NNS"
    ], 
    "gravy": [
        "NN"
    ], 
    "examples": [
        "NNS"
    ], 
    "quarter-point": [
        "NN", 
        "JJ"
    ], 
    "fee-shifting": [
        "JJ"
    ], 
    "ferroelectric": [
        "JJ"
    ], 
    "scrim": [
        "NN"
    ], 
    "Bretz": [
        "NNP"
    ], 
    "aerobic": [
        "JJ"
    ], 
    "pew": [
        "NN"
    ], 
    "Brett": [
        "NNP"
    ], 
    "integration": [
        "NN"
    ], 
    "per": [
        "IN", 
        "FW", 
        "RP", 
        "NNP"
    ], 
    "pen": [
        "NN", 
        "VB"
    ], 
    "Simplex": [
        "JJ"
    ], 
    "best-performing": [
        "JJ", 
        "JJS"
    ], 
    "peg": [
        "VBP", 
        "NN", 
        "VB"
    ], 
    "commentator": [
        "NN"
    ], 
    "pea": [
        "NN"
    ], 
    "anarchic": [
        "JJ"
    ], 
    "F18s": [
        "NNS"
    ], 
    "robbery": [
        "NN"
    ], 
    "chartists": [
        "NNS"
    ], 
    "Roulac": [
        "NNP"
    ], 
    "all-night": [
        "JJ"
    ], 
    "pulse-jet": [
        "NN"
    ], 
    "I.N.D.": [
        "NNP"
    ], 
    "Bledsoe": [
        "NNP"
    ], 
    "chanting": [
        "VBG", 
        "NN"
    ], 
    "Elsie": [
        "NNP"
    ], 
    "chargeable": [
        "JJ"
    ], 
    "defrayed": [
        "VBN"
    ], 
    "engorged": [
        "VBN"
    ], 
    "judicial-conduct": [
        "NN"
    ], 
    "Banfield": [
        "NNP"
    ], 
    "dystopia": [
        "NN"
    ], 
    "Lovingood": [
        "NNP"
    ], 
    "robbers": [
        "NNS"
    ], 
    "conciliatory": [
        "JJ"
    ], 
    "bestseller": [
        "NN"
    ], 
    "beans": [
        "NNS"
    ], 
    "Privately": [
        "RB", 
        "NNP"
    ], 
    "industrial-gas": [
        "JJ"
    ], 
    "Pastiche": [
        "NN"
    ], 
    "C.A.I.P.": [
        "NNP"
    ], 
    "Datsun": [
        "NNP"
    ], 
    "reckonings": [
        "NNS"
    ], 
    "code-sharing": [
        "NN"
    ], 
    "neutrality": [
        "NN"
    ], 
    "Helps": [
        "VBZ"
    ], 
    "STUDIES": [
        "NNS"
    ], 
    "uncaused": [
        "JJ"
    ], 
    "meet...": [
        ":"
    ], 
    "witchcraft": [
        "NN"
    ], 
    "Tbilisi": [
        "NNP"
    ], 
    "Sleepwalkers": [
        "NNS"
    ], 
    "forward": [
        "RB", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "Punjab": [
        "NNP"
    ], 
    "doctored": [
        "VBN"
    ], 
    "precision-timing": [
        "NN"
    ], 
    "Mikulski": [
        "NNP"
    ], 
    "roadbuilding": [
        "NN"
    ], 
    "weaker": [
        "JJR", 
        "RBR"
    ], 
    "interagency": [
        "NN", 
        "JJ"
    ], 
    "nodular": [
        "JJ"
    ], 
    "re-enacting": [
        "VBG"
    ], 
    "juxtaposed": [
        "VBN"
    ], 
    "dueled": [
        "VBD"
    ], 
    "juxtaposes": [
        "VBZ"
    ], 
    "brain-damaged": [
        "JJ"
    ], 
    "pre-sale": [
        "JJ"
    ], 
    "Debban": [
        "NNP"
    ], 
    "Doing": [
        "NNP", 
        "VBG"
    ], 
    "Soon": [
        "RB"
    ], 
    "floppy-tie": [
        "JJ"
    ], 
    "Kuhlke": [
        "NNP"
    ], 
    "uninitiate": [
        "NN"
    ], 
    "circumvention": [
        "NN"
    ], 
    "Ohio": [
        "NNP"
    ], 
    "unequally": [
        "RB"
    ], 
    "groove": [
        "NN"
    ], 
    "MVP": [
        "NNP"
    ], 
    "Accident": [
        "NNP", 
        "NN"
    ], 
    "life-like": [
        "JJ"
    ], 
    "congruence": [
        "NN"
    ], 
    "Jenco": [
        "NNP"
    ], 
    "spoonfuls": [
        "NNS"
    ], 
    "omens": [
        "NNS"
    ], 
    "dispensation": [
        "NN"
    ], 
    "revenue-law": [
        "JJ", 
        "NN"
    ], 
    "semi-catatonic": [
        "JJ"
    ], 
    "Versailles": [
        "NNP"
    ], 
    "bracket": [
        "NN"
    ], 
    "TXO": [
        "NNP"
    ], 
    "fogged": [
        "JJ"
    ], 
    "Sumarlin": [
        "NNP"
    ], 
    "swamp": [
        "NN", 
        "VB"
    ], 
    "Rieke": [
        "NNP"
    ], 
    "plugged": [
        "VBN", 
        "VBD"
    ], 
    "bronchioles": [
        "NNS"
    ], 
    "Fiberglas": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "excrete": [
        "VB"
    ], 
    "Andrews": [
        "NNP"
    ], 
    "Ebaugh": [
        "NNP"
    ], 
    "aunt": [
        "NN"
    ], 
    "transferors": [
        "NNS"
    ], 
    "Cardenas": [
        "NNP"
    ], 
    "seventh-biggest": [
        "JJ"
    ], 
    "Tonkin": [
        "NNP"
    ], 
    "escapade": [
        "NN"
    ], 
    "Intercede": [
        "VB"
    ], 
    "aggregates": [
        "NNS"
    ], 
    "fished": [
        "VBN"
    ], 
    "fervently": [
        "RB"
    ], 
    "Branagan": [
        "NNP"
    ], 
    "oceanthermal": [
        "JJ"
    ], 
    "retranslated": [
        "VBN"
    ], 
    "Zapfel": [
        "NNP"
    ], 
    "amused": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Scots": [
        "NNS", 
        "NNP", 
        "NNPS"
    ], 
    "Scott": [
        "NNP"
    ], 
    "Worldly": [
        "RB", 
        "NNP"
    ], 
    "boathouses": [
        "NNS"
    ], 
    "Nordine": [
        "NNP"
    ], 
    "out-of-bounds": [
        "JJ"
    ], 
    "Haldeman": [
        "NNP"
    ], 
    "Intrepid": [
        "NNP"
    ], 
    "dogged": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Meagher": [
        "NNP"
    ], 
    "front-page": [
        "JJ", 
        "NN"
    ], 
    "dioxins": [
        "NNS"
    ], 
    "Saint": [
        "NNP"
    ], 
    "Isle": [
        "NNP"
    ], 
    "Islander": [
        "NNP"
    ], 
    "Someone": [
        "NN", 
        "NNP"
    ], 
    "waterflows": [
        "NNS"
    ], 
    "Weir": [
        "NNP"
    ], 
    "Orly": [
        "NNP"
    ], 
    "granular": [
        "JJ"
    ], 
    "Wein": [
        "NNP"
    ], 
    "Weil": [
        "NNP"
    ], 
    "Ernesto": [
        "NNP"
    ], 
    "Hempel": [
        "NNP"
    ], 
    "internment": [
        "NN"
    ], 
    "inject": [
        "VB", 
        "VBP"
    ], 
    "cortisone": [
        "NN"
    ], 
    "Bridewell": [
        "NNP"
    ], 
    "countriman": [
        "NN"
    ], 
    "confounding": [
        "VBG"
    ], 
    "Berets": [
        "NNPS"
    ], 
    "Telesis": [
        "NNP"
    ], 
    "Dirion": [
        "NNP"
    ], 
    "resonant": [
        "JJ"
    ], 
    "subservient": [
        "JJ"
    ], 
    "surgeon": [
        "NN"
    ], 
    "samovar": [
        "FW", 
        "NN"
    ], 
    "knight": [
        "NN"
    ], 
    "Brumbaugh": [
        "NNP"
    ], 
    "supine": [
        "NN"
    ], 
    "burlesques": [
        "NNS"
    ], 
    "Preparedness": [
        "NN"
    ], 
    "Abbot": [
        "NNP"
    ], 
    "mobilize": [
        "VB"
    ], 
    "Cesar": [
        "NNP"
    ], 
    "Select": [
        "NNP", 
        "VB"
    ], 
    "unpublishable": [
        "JJ"
    ], 
    "Turkey": [
        "NNP", 
        "NN"
    ], 
    "ovens": [
        "NNS"
    ], 
    "hardening": [
        "VBG"
    ], 
    "educators": [
        "NNS"
    ], 
    "antigen": [
        "NN"
    ], 
    "tinny": [
        "JJ", 
        "NN"
    ], 
    "mural": [
        "NN"
    ], 
    "Smalling": [
        "NNP"
    ], 
    "bloodshot": [
        "JJ"
    ], 
    "agricolas": [
        "FW"
    ], 
    "high-sulfur": [
        "JJ"
    ], 
    "WHAT": [
        "WP", 
        "WDT"
    ], 
    "WHAS": [
        "NNP"
    ], 
    "campuses": [
        "NNS"
    ], 
    "Machinist-union": [
        "NNP"
    ], 
    "T-34": [
        "NN"
    ], 
    "Johnnie": [
        "NNP"
    ], 
    "T-37": [
        "NN"
    ], 
    "T-38": [
        "NN"
    ], 
    "Supplemental": [
        "NNP", 
        "JJ", 
        "NN"
    ], 
    "free-mail": [
        "NN"
    ], 
    "Weakest": [
        "JJS"
    ], 
    "raccoons": [
        "NNS"
    ], 
    "Seize": [
        "NNP", 
        "VB"
    ], 
    "Biscuit": [
        "NNP"
    ], 
    "Backstage": [
        "RB"
    ], 
    "nonexistent": [
        "JJ"
    ], 
    "bachelor": [
        "NN"
    ], 
    "intercept": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "puffed-up": [
        "JJ"
    ], 
    "Cheil": [
        "NNP"
    ], 
    "Unida": [
        "NNP"
    ], 
    "jockeys": [
        "NNS"
    ], 
    "Jeep-brand": [
        "JJ"
    ], 
    "mindset": [
        "NN"
    ], 
    "Unocal": [
        "NNP", 
        "JJ"
    ], 
    "Petrone": [
        "NNP"
    ], 
    "Storeria": [
        "NNP"
    ], 
    "DISAPPOINTMENTS": [
        "NNS"
    ], 
    "resurrect": [
        "VB", 
        "VBP"
    ], 
    "compellingly": [
        "RB"
    ], 
    "adult-literacy": [
        "NN"
    ], 
    "Papandreou": [
        "NNP"
    ], 
    "four-family": [
        "JJ"
    ], 
    "Conmel": [
        "NNP"
    ], 
    "fourth-quarter": [
        "JJ", 
        "NN"
    ], 
    "Kapadia": [
        "NNP"
    ], 
    "Chancellorsville": [
        "NNP"
    ], 
    "agribusiness": [
        "NN"
    ], 
    "Blossom": [
        "NNP"
    ], 
    "SMU": [
        "NNP"
    ], 
    "Interstate\\/Johnson": [
        "NNP"
    ], 
    "asynchrony": [
        "NN"
    ], 
    "beanstalk": [
        "NN"
    ], 
    "dudgeon": [
        "NN"
    ], 
    "facades": [
        "NNS"
    ], 
    "Manila": [
        "NNP"
    ], 
    "ups-and-downs": [
        "NNS"
    ], 
    "oval": [
        "JJ", 
        "NN"
    ], 
    "resolutions": [
        "NNS"
    ], 
    "SMD": [
        "NNP"
    ], 
    "name-dropping": [
        "NN", 
        "NNP"
    ], 
    "Status": [
        "NN", 
        "NNP"
    ], 
    "lamplight": [
        "NN"
    ], 
    "Barcelona-based": [
        "JJ"
    ], 
    "Statue": [
        "NNP"
    ], 
    "Declaration": [
        "NNP", 
        "NN"
    ], 
    "McCaughey": [
        "NNP"
    ], 
    "Galway": [
        "NNP"
    ], 
    "Vasady": [
        "NNP"
    ], 
    "Single-subject": [
        "JJ"
    ], 
    "Kattus": [
        "NNP"
    ], 
    "armadillo": [
        "NN"
    ], 
    "ashamed": [
        "JJ"
    ], 
    "informally": [
        "RB"
    ], 
    "parapsychology": [
        "NN"
    ], 
    "Bulletin": [
        "NNP", 
        "NN"
    ], 
    "misty-eyed": [
        "JJ"
    ], 
    "grandmotherly": [
        "JJ"
    ], 
    "RIGHTS": [
        "NNS"
    ], 
    "vaudeville": [
        "NN"
    ], 
    "REVENUE": [
        "NN"
    ], 
    "Period": [
        "NN", 
        "NNP"
    ], 
    "nullified": [
        "VBN", 
        "VBD"
    ], 
    "do-everything": [
        "JJ"
    ], 
    "celiac": [
        "JJ"
    ], 
    "Inconsistent": [
        "JJ"
    ], 
    "double-B-minus\\": [
        "NN"
    ], 
    "Impressions": [
        "NNS"
    ], 
    "parkway": [
        "NN"
    ], 
    "wooooosh": [
        "NN"
    ], 
    "poseur": [
        "NN"
    ], 
    "steel-related": [
        "JJ"
    ], 
    "Shining": [
        "NNP", 
        "VBG"
    ], 
    "pool-care": [
        "JJ"
    ], 
    "CONSULTING": [
        "NNP"
    ], 
    "whitehaired": [
        "JJ"
    ], 
    "Comroe": [
        "NNP"
    ], 
    "Goldenthal": [
        "NNP"
    ], 
    "flour-milling": [
        "JJ", 
        "NN"
    ], 
    "second-year": [
        "JJ"
    ], 
    "effectively": [
        "RB"
    ], 
    "Galata": [
        "NNP"
    ], 
    "Starks": [
        "NNP"
    ], 
    "spruce": [
        "NN", 
        "VB"
    ], 
    "contempt": [
        "NN"
    ], 
    "debt-heavy": [
        "JJ"
    ], 
    "cinderblock": [
        "NN"
    ], 
    "emotionalism": [
        "NN"
    ], 
    "regions": [
        "NNS"
    ], 
    "druther": [
        "VB"
    ], 
    "fete": [
        "VB"
    ], 
    "Graciela": [
        "NNP"
    ], 
    "Ridgway": [
        "NNP"
    ], 
    "Fryar": [
        "NNP"
    ], 
    "aft": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "carvers": [
        "NNS"
    ], 
    "vitreous-china": [
        "NN"
    ], 
    "Cliff": [
        "NNP"
    ], 
    "Continuity": [
        "NN"
    ], 
    "Institutionalization": [
        "NN"
    ], 
    "Technical": [
        "NNP", 
        "JJ"
    ], 
    "annexed": [
        "VBD"
    ], 
    "xxxx": [
        "NN"
    ], 
    "market-research": [
        "NN", 
        "JJ"
    ], 
    "frenzy-free": [
        "JJ"
    ], 
    "UKRAINIANS": [
        "NNS"
    ], 
    "Japanese-South": [
        "NNP"
    ], 
    "cost-finding": [
        "JJ"
    ], 
    "Gazing": [
        "VBG"
    ], 
    "Freightways": [
        "NNP", 
        "NNPS"
    ], 
    "primers": [
        "NNS"
    ], 
    "italics": [
        "NNS"
    ], 
    "Livestock": [
        "NN", 
        "NNP"
    ], 
    "Healy": [
        "NNP"
    ], 
    "MacDowell": [
        "NNP"
    ], 
    "Resist": [
        "VB"
    ], 
    "cuvees": [
        "NNS"
    ], 
    "stevedore": [
        "NN"
    ], 
    "retail-banking": [
        "JJ", 
        "NN"
    ], 
    "minivan": [
        "NN"
    ], 
    "fallback": [
        "NN", 
        "JJ"
    ], 
    "Hausman": [
        "NNP"
    ], 
    "HUGO": [
        "NNP"
    ], 
    "deliberative": [
        "JJ"
    ], 
    "Dunbar": [
        "NNP"
    ], 
    "in-house": [
        "JJ", 
        "NN", 
        "RB"
    ], 
    "downtime": [
        "NN"
    ], 
    "Pherwani": [
        "NNP"
    ], 
    "hugged": [
        "VBD"
    ], 
    "lands": [
        "NNS", 
        "VBZ"
    ], 
    "Shangri-La": [
        "NNP"
    ], 
    "bow-tied": [
        "JJ"
    ], 
    "Hermann": [
        "NNP"
    ], 
    "American-trained": [
        "JJ"
    ], 
    "Hindle": [
        "NNP"
    ], 
    "band-wagon": [
        "JJ"
    ], 
    "sic": [
        "RB", 
        "FW", 
        "VB"
    ], 
    "Schedule": [
        "NNP"
    ], 
    "boy-meets-girl": [
        "NN"
    ], 
    "lampposts": [
        "NNS"
    ], 
    "acres": [
        "NNS"
    ], 
    "resorting": [
        "VBG"
    ], 
    "latitude": [
        "NN"
    ], 
    "farm-trade": [
        "JJ"
    ], 
    "Presbyterian-St": [
        "JJ|NP"
    ], 
    "Pembridge": [
        "NNP"
    ], 
    "unnerved": [
        "VBD", 
        "JJ"
    ], 
    "Stricken": [
        "NNP"
    ], 
    "phagocytes": [
        "NNS"
    ], 
    "repassed": [
        "VBN"
    ], 
    "Hard-hitting": [
        "JJ"
    ], 
    "GMAC": [
        "NNP"
    ], 
    "institutionally": [
        "RB"
    ], 
    "doffing": [
        "VBG"
    ], 
    "Churpek": [
        "NNP"
    ], 
    "Adobe": [
        "NNP"
    ], 
    "Unemployment": [
        "NN", 
        "NNP"
    ], 
    "ahdawam": [
        "UH"
    ], 
    "Baltimore-Washington": [
        "NNP"
    ], 
    "Uyl": [
        "NNP"
    ], 
    "slipping": [
        "VBG"
    ], 
    "vivified": [
        "VBN"
    ], 
    "LaRosa": [
        "NNP"
    ], 
    "reintroducing": [
        "VBG"
    ], 
    "Previous": [
        "JJ"
    ], 
    "Ghost": [
        "NN", 
        "NNP"
    ], 
    "Whaley": [
        "NNP"
    ], 
    "thwart": [
        "VB", 
        "NN", 
        "RB"
    ], 
    "transported": [
        "VBN", 
        "VBD"
    ], 
    "Whaler": [
        "NNP"
    ], 
    "programmed": [
        "VBN", 
        "JJ"
    ], 
    "Sino-Soviet": [
        "JJ"
    ], 
    "live-oak": [
        "NN"
    ], 
    "Mercers": [
        "NNPS"
    ], 
    "programmes": [
        "NNS"
    ], 
    "most-valuable": [
        "JJ"
    ], 
    "Rotterdam": [
        "NNP"
    ], 
    "Westland": [
        "NNP"
    ], 
    "defend": [
        "VB", 
        "VBP"
    ], 
    "Sussex": [
        "NNP"
    ], 
    "Tut": [
        "NNP"
    ], 
    "magic-practicing": [
        "JJ"
    ], 
    "opining": [
        "VBG"
    ], 
    "rec": [
        "NN"
    ], 
    "electronics": [
        "NNS", 
        "NN"
    ], 
    "red": [
        "JJ", 
        "NN"
    ], 
    "franc": [
        "NN"
    ], 
    "Magwitch": [
        "NNP"
    ], 
    "Aitken": [
        "NNP"
    ], 
    "aflatoxin": [
        "NN"
    ], 
    "retrieved": [
        "VBN", 
        "VBD"
    ], 
    "consortiums": [
        "NNS"
    ], 
    "soreheads": [
        "NNS"
    ], 
    "Theodor": [
        "NNP"
    ], 
    "chattily": [
        "RB"
    ], 
    "EXPECT": [
        "VBP"
    ], 
    "trends": [
        "NNS"
    ], 
    "Turbofan": [
        "NN"
    ], 
    "Buffalo": [
        "NNP", 
        "NN"
    ], 
    "retriever": [
        "NN"
    ], 
    "power-hitter": [
        "NN"
    ], 
    "cured": [
        "VBN", 
        "VBD"
    ], 
    "Multi-employer": [
        "JJ"
    ], 
    "cures": [
        "NNS", 
        "VBZ"
    ], 
    "taxable-fund": [
        "JJ"
    ], 
    "imput": [
        "NN"
    ], 
    "Operators": [
        "NNP", 
        "NNS"
    ], 
    "strippers": [
        "NNS"
    ], 
    "STEEL": [
        "NNP"
    ], 
    "plastics": [
        "NNS"
    ], 
    "dusty-green": [
        "JJ"
    ], 
    "hay-fever": [
        "NN"
    ], 
    "embarrassed": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "hurdle": [
        "NN", 
        "VB"
    ], 
    "Birdwood": [
        "NNP"
    ], 
    "rusticated": [
        "VBN"
    ], 
    "afield": [
        "RB"
    ], 
    "Hans-Ulrich": [
        "NNP"
    ], 
    "splotched": [
        "JJ"
    ], 
    "data-processing": [
        "NN", 
        "JJ"
    ], 
    "non-Christians": [
        "NNPS", 
        "NNP"
    ], 
    "ripples": [
        "NNS"
    ], 
    "realistically": [
        "RB"
    ], 
    "talkfest": [
        "NN"
    ], 
    "rippled": [
        "VBD"
    ], 
    "wistfully": [
        "RB"
    ], 
    "less-traveled": [
        "JJ"
    ], 
    "Warhol": [
        "NNP"
    ], 
    "Kilty": [
        "NNP"
    ], 
    "strongman": [
        "NN"
    ], 
    "Deacon": [
        "NNP"
    ], 
    "environmental": [
        "JJ"
    ], 
    "sporadically": [
        "RB"
    ], 
    "absent-minded": [
        "JJ"
    ], 
    "Battle-tested": [
        "JJ"
    ], 
    "Pesaro": [
        "NNP"
    ], 
    "non-executive": [
        "JJ"
    ], 
    "plumage": [
        "NN"
    ], 
    "slack": [
        "JJ", 
        "VB", 
        "NN"
    ], 
    "Sabha": [
        "NNP"
    ], 
    "shrapnel": [
        "NN"
    ], 
    "Low-flying": [
        "JJ"
    ], 
    "shampoo": [
        "NN"
    ], 
    "splotches": [
        "NNS"
    ], 
    "MATTEL": [
        "NNP"
    ], 
    "calamity": [
        "NN"
    ], 
    "boyish": [
        "JJ"
    ], 
    "Engineer": [
        "NNP"
    ], 
    "Moiseyeva": [
        "NNP"
    ], 
    "NUCLEAR": [
        "NN"
    ], 
    "Lech": [
        "NNP"
    ], 
    "two-year-long": [
        "JJ"
    ], 
    "patting": [
        "VBG"
    ], 
    "discussions": [
        "NNS"
    ], 
    "Rudnick": [
        "NNP"
    ], 
    "thyroidal": [
        "JJ"
    ], 
    "handsets": [
        "NNS"
    ], 
    "X-linked": [
        "JJ"
    ], 
    "Nugent": [
        "NNP"
    ], 
    "lawmkers": [
        "NNS"
    ], 
    "MLSS": [
        "NN"
    ], 
    "safety-related": [
        "JJ"
    ], 
    "debt-reduction": [
        "NN", 
        "JJ"
    ], 
    "KnowledgeWare": [
        "NNP"
    ], 
    "Airways": [
        "NNPS", 
        "NNP"
    ], 
    "Goldman": [
        "NNP"
    ], 
    "Hitching": [
        "VBG"
    ], 
    "Flem": [
        "NNP"
    ], 
    "program-related": [
        "JJ"
    ], 
    "Flea": [
        "NNP"
    ], 
    "doubleheader": [
        "NN"
    ], 
    "Flee": [
        "VBP"
    ], 
    "mooring": [
        "NN"
    ], 
    "Nikes": [
        "NNPS"
    ], 
    "HOME-SALE": [
        "JJ"
    ], 
    "hazel": [
        "JJ"
    ], 
    "Cheri": [
        "NNP"
    ], 
    "tartan-patterned": [
        "JJ"
    ], 
    "diathermy": [
        "NN"
    ], 
    "WACS": [
        "NNPS"
    ], 
    "Matteson": [
        "NNP"
    ], 
    "tax-writing": [
        "JJ"
    ], 
    "W.E.": [
        "NNP"
    ], 
    "heartening": [
        "JJ"
    ], 
    "Illustrated": [
        "NNP"
    ], 
    "Mohamad": [
        "NNP"
    ], 
    "discursive": [
        "JJ"
    ], 
    "absurd": [
        "JJ"
    ], 
    "trobles": [
        "NNS"
    ], 
    "planks": [
        "NNS"
    ], 
    "SMALL-BUSINESS": [
        "NN"
    ], 
    "Sansui": [
        "NNP"
    ], 
    "Irrawaddy": [
        "NNP"
    ], 
    "overhangs": [
        "NNS"
    ], 
    "Straighten": [
        "VB"
    ], 
    "rusted": [
        "JJ"
    ], 
    "chevre": [
        "NN"
    ], 
    "Unconscionable": [
        "JJ"
    ], 
    "coloring": [
        "NN"
    ], 
    "debacles": [
        "NNS"
    ], 
    "hydroelectric": [
        "JJ"
    ], 
    "Yoshimoto": [
        "NNP"
    ], 
    "anthropic": [
        "JJ"
    ], 
    "Complaints": [
        "NNS"
    ], 
    "SOUTHERN": [
        "NNP"
    ], 
    "equilibrium": [
        "NN"
    ], 
    "Sgt.": [
        "NNP"
    ], 
    "chairmanships": [
        "NNS"
    ], 
    "Reversal": [
        "NNP"
    ], 
    "bat-roost": [
        "JJ"
    ], 
    "thrived": [
        "VBD", 
        "VBN"
    ], 
    "Matsui": [
        "NNP"
    ], 
    "can..": [
        "MD"
    ], 
    "SAVINGS": [
        "NNP", 
        "NNPS"
    ], 
    "gardenettes": [
        "NNS"
    ], 
    "timing": [
        "NN", 
        "VBG"
    ], 
    "thrives": [
        "VBZ"
    ], 
    "areas": [
        "NNS", 
        "VBN"
    ], 
    "crabs": [
        "NNS"
    ], 
    "Back-of-the-envelope": [
        "JJ"
    ], 
    "organ": [
        "NN"
    ], 
    "king-sized": [
        "JJ"
    ], 
    "eyebrow": [
        "NN"
    ], 
    "excreted": [
        "VBN"
    ], 
    "Pistol-whipping": [
        "IN"
    ], 
    "Oriental": [
        "JJ", 
        "NNP"
    ], 
    "dissolves": [
        "VBZ"
    ], 
    "Ca.": [
        "NNP"
    ], 
    "madam": [
        "NN"
    ], 
    "debt-limit": [
        "NN"
    ], 
    "farthest": [
        "JJS", 
        "RBS"
    ], 
    "heightens": [
        "VBZ"
    ], 
    "subsidizing": [
        "VBG"
    ], 
    "preprinting": [
        "NN"
    ], 
    "Symes": [
        "NNP"
    ], 
    "yearning": [
        "NN", 
        "VBG"
    ], 
    "scholastic": [
        "JJ", 
        "NN"
    ], 
    "refrained": [
        "VBD", 
        "VBN"
    ], 
    "lotter": [
        "NN"
    ], 
    "Talmadge": [
        "NNP"
    ], 
    "Boil": [
        "VB"
    ], 
    "kinesthetically": [
        "RB"
    ], 
    "Dnieper": [
        "NNP"
    ], 
    "exploited": [
        "VBN", 
        "VBD"
    ], 
    "respiration...": [
        ":"
    ], 
    "cheaters": [
        "NNS"
    ], 
    "ex-reporters": [
        "NNS"
    ], 
    "purses": [
        "NNS"
    ], 
    "exploiter": [
        "NN"
    ], 
    "homogenate": [
        "NN"
    ], 
    "pursed": [
        "VBD"
    ], 
    "July": [
        "NNP"
    ], 
    "Keye\\/Donna\\/Pearlstein": [
        "NN"
    ], 
    "Avedisian": [
        "NNP"
    ], 
    "grumble": [
        "VBP", 
        "VB"
    ], 
    "Sabinson": [
        "NNP"
    ], 
    "jeopardizing": [
        "VBG"
    ], 
    "propulsions": [
        "NNS"
    ], 
    "Axa": [
        "NNP"
    ], 
    "Axe": [
        "NNP"
    ], 
    "Gagarin": [
        "NNP"
    ], 
    "professional-design": [
        "JJ"
    ], 
    "optional": [
        "JJ"
    ], 
    "Crary": [
        "NNP"
    ], 
    "Juergen": [
        "NNP"
    ], 
    "deadlock": [
        "NN"
    ], 
    "instant": [
        "NN", 
        "JJ"
    ], 
    "robberies": [
        "NNS"
    ], 
    "provincial": [
        "JJ"
    ], 
    "Olshan": [
        "NNP"
    ], 
    "predispose": [
        "VB", 
        "VBP"
    ], 
    "dBase": [
        "NNP"
    ], 
    "conquered": [
        "VBN", 
        "VBD"
    ], 
    "passing": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "glorious": [
        "JJ"
    ], 
    "UMW": [
        "NNP"
    ], 
    "underhandedness": [
        "NN"
    ], 
    "alphabetically": [
        "RB"
    ], 
    "unventilated": [
        "VBN"
    ], 
    "Savannakhet": [
        "NNP"
    ], 
    "Magpie": [
        "NNP"
    ], 
    "rocket-fuel": [
        "NN"
    ], 
    "seashores": [
        "NNS"
    ], 
    "laugh": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Run-down": [
        "JJ"
    ], 
    "Weird": [
        "JJ", 
        "NNP"
    ], 
    "instigators": [
        "NNS"
    ], 
    "deliberation": [
        "NN"
    ], 
    "piecewise": [
        "RB"
    ], 
    "Lithuanian": [
        "JJ"
    ], 
    "Salmon": [
        "NNP"
    ], 
    "rpm": [
        "NN"
    ], 
    "Electro-Optical": [
        "NNP"
    ], 
    "kitchen": [
        "NN"
    ], 
    "Corot": [
        "NNP"
    ], 
    "perennially": [
        "RB"
    ], 
    "asymmetrically": [
        "RB"
    ], 
    "arises": [
        "VBZ"
    ], 
    "perplexed": [
        "JJ", 
        "VBN"
    ], 
    "America\\/International": [
        "NNP"
    ], 
    "arisen": [
        "VBN"
    ], 
    "atmospheric": [
        "JJ"
    ], 
    "censuses": [
        "NNS"
    ], 
    "contradicted": [
        "VBD", 
        "VBN"
    ], 
    "Appignanesi": [
        "NNP"
    ], 
    "Blockbuster": [
        "NNP"
    ], 
    "Chicago-centric": [
        "JJ"
    ], 
    "Jacobs": [
        "NNP"
    ], 
    "likable": [
        "JJ"
    ], 
    "prosy": [
        "JJ"
    ], 
    "ornithology": [
        "NN"
    ], 
    "Jacoby": [
        "NNP"
    ], 
    "blood": [
        "NN"
    ], 
    "paper-manufacturing": [
        "JJ"
    ], 
    "CD-type": [
        "JJ"
    ], 
    "Bellcore": [
        "NNP"
    ], 
    "Wrongs": [
        "NNS"
    ], 
    "haunches": [
        "NNS"
    ], 
    "prose": [
        "NN"
    ], 
    "portray": [
        "VB", 
        "VBP"
    ], 
    "Cristiani": [
        "NNP"
    ], 
    "untoward": [
        "JJ"
    ], 
    "progressing": [
        "VBG"
    ], 
    "indistinguishable": [
        "JJ"
    ], 
    "plenipotentiary": [
        "NN"
    ], 
    "Car": [
        "NNP", 
        "NN"
    ], 
    "shuttle": [
        "NN", 
        "JJ"
    ], 
    "Herzfeld": [
        "NNP"
    ], 
    "Orden": [
        "NNP"
    ], 
    "Lombarde": [
        "NNP"
    ], 
    "material": [
        "NN", 
        "JJ"
    ], 
    "TURMOIL": [
        "NN"
    ], 
    "Lombardo": [
        "NNP"
    ], 
    "Dusseldorf": [
        "NNP"
    ], 
    "Lombardi": [
        "NNP"
    ], 
    "bullying": [
        "VBG"
    ], 
    "assessing": [
        "VBG"
    ], 
    "flew": [
        "VBD"
    ], 
    "neckline": [
        "NN"
    ], 
    "ante-bellum": [
        "FW", 
        "JJ", 
        "NN"
    ], 
    "Order": [
        "NNP", 
        "NN"
    ], 
    "besmirch": [
        "VB"
    ], 
    "uncombable": [
        "JJ"
    ], 
    "center": [
        "NN", 
        "JJ", 
        "RB", 
        "VB", 
        "VBP"
    ], 
    "around-the-clock": [
        "JJ"
    ], 
    "roughhewn": [
        "JJ"
    ], 
    "overshadowed": [
        "VBN", 
        "VBD"
    ], 
    "householder": [
        "NN"
    ], 
    "Globally": [
        "RB"
    ], 
    "retiring": [
        "VBG", 
        "JJ"
    ], 
    "supercharged": [
        "JJ"
    ], 
    "oops": [
        "UH"
    ], 
    "publicize": [
        "VB"
    ], 
    "restuarant": [
        "JJ"
    ], 
    "fixated": [
        "VBN"
    ], 
    "reupholstering": [
        "VBG"
    ], 
    "Ragsdale": [
        "NNP"
    ], 
    "granddad": [
        "NN"
    ], 
    "Sirot": [
        "NNP"
    ], 
    "super-absorbent": [
        "JJ"
    ], 
    "Seaman": [
        "NNP", 
        "RB"
    ], 
    "Abscam-indicted": [
        "JJ"
    ], 
    "books": [
        "NNS", 
        "NN|POS"
    ], 
    "surpass": [
        "VB", 
        "VBP"
    ], 
    "seats": [
        "NNS", 
        "VBZ"
    ], 
    "Scraps": [
        "NNS"
    ], 
    "anye": [
        "JJ"
    ], 
    "raves": [
        "VBZ"
    ], 
    "swig": [
        "NN"
    ], 
    "field": [
        "NN", 
        "JJ", 
        "VB", 
        "VBP"
    ], 
    "area-wide": [
        "JJ"
    ], 
    "Kamehameha": [
        "NNP"
    ], 
    "bluebonnets": [
        "NNS"
    ], 
    "bench": [
        "NN", 
        "VB"
    ], 
    "adminstrative": [
        "JJ"
    ], 
    "bogey-symbol": [
        "NN"
    ], 
    "foreign-policy": [
        "NN", 
        "JJ"
    ], 
    "raved": [
        "VBD"
    ], 
    "citizen": [
        "NN"
    ], 
    "Comparable-store": [
        "JJ"
    ], 
    "Aqazadeh": [
        "NNP"
    ], 
    "Greenwood": [
        "NNP"
    ], 
    "tests": [
        "NNS", 
        "VBZ"
    ], 
    "haltingly": [
        "RB"
    ], 
    "worlds": [
        "NNS"
    ], 
    "testy": [
        "JJ"
    ], 
    "repulsions": [
        "NNS"
    ], 
    "deployment": [
        "NN"
    ], 
    "condescending": [
        "JJ", 
        "VBG"
    ], 
    "Mennen": [
        "NNP"
    ], 
    "Tarantino": [
        "NNP"
    ], 
    "incompletely": [
        "RB"
    ], 
    "noncommunist": [
        "NN"
    ], 
    "housekeeper": [
        "NN"
    ], 
    "newly-appointed": [
        "JJ"
    ], 
    "porous": [
        "JJ"
    ], 
    "commencements": [
        "NNS"
    ], 
    "Darvocet-N": [
        "NNP"
    ], 
    "corporativists": [
        "NNS"
    ], 
    "Laundered": [
        "VBN"
    ], 
    "BVI": [
        "NNP"
    ], 
    "works": [
        "NNS", 
        "VBZ"
    ], 
    "lucidly": [
        "RB"
    ], 
    "imprints": [
        "NNS"
    ], 
    "graphic-arts": [
        "NNS"
    ], 
    "mushroomed": [
        "VBN", 
        "VBD"
    ], 
    "Mineola": [
        "NNP"
    ], 
    "president\\/finance": [
        "NN"
    ], 
    "majeure": [
        "NN", 
        "FW"
    ], 
    "whiner": [
        "NN"
    ], 
    "deviants": [
        "NNS"
    ], 
    "Editor": [
        "NNP", 
        "NN"
    ], 
    "legislated": [
        "VBN", 
        "VBD"
    ], 
    "Mukherjee": [
        "NNP"
    ], 
    "job-hunters": [
        "NNS"
    ], 
    "whined": [
        "VBD"
    ], 
    "Hardball": [
        "NNP"
    ], 
    "Mike": [
        "NNP"
    ], 
    "est": [
        "FW"
    ], 
    "encouraging": [
        "VBG", 
        "JJ"
    ], 
    "obsessed": [
        "VBN", 
        "JJ"
    ], 
    "dunes": [
        "NNS"
    ], 
    "biotechnology-based": [
        "JJ"
    ], 
    "cents-off": [
        "JJ"
    ], 
    "Wenger": [
        "NNP"
    ], 
    "kidnappers": [
        "NNS"
    ], 
    "panes": [
        "NNS"
    ], 
    "lumpen-intellectual": [
        "JJ"
    ], 
    "manifesting": [
        "VBG"
    ], 
    "electrical-safety": [
        "JJ"
    ], 
    "Glenham": [
        "NNP"
    ], 
    "snapper": [
        "NN"
    ], 
    "Newarker": [
        "NNP"
    ], 
    "Lousy": [
        "JJ"
    ], 
    "snapped": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "ORDERED": [
        "VBN"
    ], 
    "well-informed": [
        "JJ"
    ], 
    "InterVoice": [
        "NNP"
    ], 
    "panel": [
        "NN"
    ], 
    "E.M.": [
        "NNP"
    ], 
    "radio-controlled": [
        "JJ"
    ], 
    "distilling": [
        "VBG", 
        "NN"
    ], 
    "smartly": [
        "RB"
    ], 
    "sea-transport": [
        "JJ"
    ], 
    "comet-like": [
        "JJ"
    ], 
    "Rucellai": [
        "NNP"
    ], 
    "Financially": [
        "RB"
    ], 
    "large-deposit": [
        "JJ"
    ], 
    "Questions": [
        "NNS", 
        "NNP", 
        "VBZ"
    ], 
    "Bessie": [
        "NNP"
    ], 
    "predictor": [
        "NN"
    ], 
    "baseless": [
        "JJ"
    ], 
    "Law-enforcement": [
        "JJ", 
        "NN"
    ], 
    "rendered": [
        "VBN", 
        "VBD"
    ], 
    "varitinted": [
        "JJ"
    ], 
    "State-Local": [
        "NNP"
    ], 
    "public-health": [
        "JJ", 
        "NN"
    ], 
    "rhythmical": [
        "JJ"
    ], 
    "billions": [
        "NNS"
    ], 
    "lacked": [
        "VBD", 
        "VBN"
    ], 
    "weekends": [
        "NNS"
    ], 
    "eine": [
        "FW"
    ], 
    "calorie-heavy": [
        "JJ"
    ], 
    "earnings-driven": [
        "JJ"
    ], 
    "Single-occupancy": [
        "NN"
    ], 
    "enticed": [
        "VBD"
    ], 
    "Owens-Corning": [
        "NNP"
    ], 
    "growth-controlling": [
        "JJ"
    ], 
    "AGAIN": [
        "RB"
    ], 
    "buy": [
        "VB", 
        "VBP", 
        "VB|NN", 
        "JJ", 
        "NN"
    ], 
    "co-anchored": [
        "VBN"
    ], 
    "bus": [
        "NN"
    ], 
    "Der": [
        "NNP"
    ], 
    "Losses": [
        "NNS", 
        "NNP"
    ], 
    "Paperboard": [
        "NNP", 
        "NN"
    ], 
    "but": [
        "CC", 
        "IN", 
        "JJ", 
        "RB"
    ], 
    "shute": [
        "VB"
    ], 
    "authenticator": [
        "NN"
    ], 
    "Dei": [
        "NNP", 
        "FW"
    ], 
    "Del": [
        "NNP"
    ], 
    "Den": [
        "NNP"
    ], 
    "Deo": [
        "NNP"
    ], 
    "first-floor": [
        "JJ", 
        "NN"
    ], 
    "Deb": [
        "NNP"
    ], 
    "Dec": [
        "NNP"
    ], 
    "Dee": [
        "NNP"
    ], 
    "Def": [
        "NNP"
    ], 
    "embargo": [
        "NN", 
        "VB"
    ], 
    "misty": [
        "JJ"
    ], 
    "princes": [
        "NNS"
    ], 
    "Salant": [
        "NNP"
    ], 
    "frugally": [
        "RB"
    ], 
    "breweries": [
        "NNS"
    ], 
    "Albertine": [
        "NNP"
    ], 
    "Salang": [
        "NNP"
    ], 
    "minutes": [
        "NNS"
    ], 
    "moralizing": [
        "VBG", 
        "JJ"
    ], 
    "windless": [
        "JJ"
    ], 
    "probaby": [
        "NN"
    ], 
    "air-quality": [
        "NN"
    ], 
    "airmen": [
        "NNS"
    ], 
    "Meantime": [
        "RB", 
        "NNP"
    ], 
    "wide-eyed": [
        "JJ"
    ], 
    "Hofstad": [
        "NNP"
    ], 
    "Dunkirk": [
        "NNP"
    ], 
    "Euromarket": [
        "NNP"
    ], 
    "Marches": [
        "NNPS"
    ], 
    "Shvets": [
        "NNP"
    ], 
    "virtual": [
        "JJ"
    ], 
    "shearing": [
        "NN", 
        "VBG"
    ], 
    "Worker": [
        "NNP"
    ], 
    "ledge": [
        "NN"
    ], 
    "Altogether": [
        "RB"
    ], 
    "Phase": [
        "NN", 
        "NNP"
    ], 
    "I...": [
        ":"
    ], 
    "Aca": [
        "NNP"
    ], 
    "greater-fool": [
        "JJ", 
        "JJR"
    ], 
    "Annihilate": [
        "VB"
    ], 
    "Ace": [
        "NNP", 
        "NN"
    ], 
    "brainlessly": [
        "RB"
    ], 
    "Jerebohms": [
        "NNP"
    ], 
    "glacier-like": [
        "JJ"
    ], 
    "weaponry": [
        "NN"
    ], 
    "Act": [
        "NNP", 
        "NN"
    ], 
    "Zhitkov": [
        "NNP"
    ], 
    "McFall": [
        "NNP"
    ], 
    "Scotchgard": [
        "NNP"
    ], 
    "godsend": [
        "NN"
    ], 
    "solution-type": [
        "JJ"
    ], 
    "contraceptive": [
        "JJ", 
        "NN"
    ], 
    "deluxe": [
        "JJ"
    ], 
    "Ashurst": [
        "NNP"
    ], 
    "test-preparation": [
        "JJ"
    ], 
    "Stock-loan": [
        "NN"
    ], 
    "winders": [
        "NNS"
    ], 
    "pupil": [
        "NN"
    ], 
    "AYER": [
        "NNP"
    ], 
    "Scandal": [
        "NN", 
        "NNP"
    ], 
    "augmented": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "low-load": [
        "JJ"
    ], 
    "Pacemakers": [
        "NNPS"
    ], 
    "state-supported": [
        "JJ"
    ], 
    "represent": [
        "VB", 
        "VBP"
    ], 
    "twice-extended": [
        "JJ"
    ], 
    "liar": [
        "NN"
    ], 
    "dere": [
        "NN"
    ], 
    "revoking": [
        "VBG"
    ], 
    "Uhl": [
        "NNP"
    ], 
    "poorest": [
        "JJS"
    ], 
    "adoption-business": [
        "NN"
    ], 
    "Grumman": [
        "NNP"
    ], 
    "Additionally": [
        "RB"
    ], 
    "non-consolidated": [
        "JJ"
    ], 
    "tweed": [
        "NN"
    ], 
    "pride": [
        "NN", 
        "VBP"
    ], 
    "Merabank": [
        "NNP"
    ], 
    "placated": [
        "VBN"
    ], 
    "Unpopular": [
        "JJ"
    ], 
    "nonresident": [
        "JJ"
    ], 
    "Pilgrim": [
        "NNP", 
        "NN"
    ], 
    "Pilgrin": [
        "NNP"
    ], 
    "human-robot": [
        "NN"
    ], 
    "Industry": [
        "NN", 
        "NNP"
    ], 
    "despondency": [
        "NN"
    ], 
    "Metzler": [
        "NNP"
    ], 
    "position-squaring": [
        "NN"
    ], 
    "every": [
        "DT"
    ], 
    "softened": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "upstream": [
        "RB", 
        "JJ"
    ], 
    "Durenberger": [
        "NNP"
    ], 
    "Industri": [
        "NNP"
    ], 
    "Steak": [
        "NNP"
    ], 
    "Steam": [
        "NN"
    ], 
    "Origin": [
        "NN"
    ], 
    "Presence": [
        "NNP"
    ], 
    "ovation": [
        "NN"
    ], 
    "Archipelago": [
        "NNP"
    ], 
    "Hanover-Misty": [
        "NNP"
    ], 
    "phonebook": [
        "NN"
    ], 
    "Hemphill": [
        "NNP"
    ], 
    "make-work": [
        "JJ", 
        "NN"
    ], 
    "MacNamara": [
        "NNP"
    ], 
    "joggers": [
        "NNS"
    ], 
    "Batchelor": [
        "NNP"
    ], 
    "Shareholders": [
        "NNS", 
        "NNP"
    ], 
    "picketed": [
        "VBD", 
        "VBN"
    ], 
    "cooperative": [
        "JJ", 
        "NN"
    ], 
    "Arab-Israeli": [
        "JJ"
    ], 
    "Express-Buick": [
        "NNP"
    ], 
    "Sokolov": [
        "NNP"
    ], 
    "weddings": [
        "NNS"
    ], 
    "estimates": [
        "NNS", 
        "VBZ"
    ], 
    "Rash": [
        "NNP"
    ], 
    "crocketed": [
        "JJ"
    ], 
    "persuade": [
        "VB", 
        "VBP"
    ], 
    "Cosgrove": [
        "NNP"
    ], 
    "freehand": [
        "JJ", 
        "RB"
    ], 
    "estimated": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "Burroughs": [
        "NNP"
    ], 
    "Obsolescence": [
        "NNP"
    ], 
    "allowances": [
        "NNS"
    ], 
    "third-class": [
        "JJ"
    ], 
    "rustler-hunter": [
        "NN"
    ], 
    "specification": [
        "NN"
    ], 
    "Continuous": [
        "JJ"
    ], 
    "sheeted": [
        "JJ"
    ], 
    "morbid-minded": [
        "JJ"
    ], 
    "Hachuel": [
        "NNP"
    ], 
    "smidgins": [
        "NNS"
    ], 
    "conduct": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "streetcars": [
        "NNS"
    ], 
    "injections": [
        "NNS"
    ], 
    "city-trading": [
        "NN"
    ], 
    "pats": [
        "NNS"
    ], 
    "Indonesia": [
        "NNP", 
        "NN"
    ], 
    "bearishly": [
        "RB"
    ], 
    "Holiness": [
        "NN", 
        "NNP"
    ], 
    "stared": [
        "VBD", 
        "VBN"
    ], 
    "market-oriented": [
        "JJ"
    ], 
    "transmits": [
        "VBZ"
    ], 
    "Ferraro": [
        "NNP"
    ], 
    "Ferrari": [
        "NNP"
    ], 
    "contentions": [
        "NNS"
    ], 
    "bulks": [
        "VBZ"
    ], 
    "path": [
        "NN"
    ], 
    "stares": [
        "NNS"
    ], 
    "Ferrara": [
        "NNP"
    ], 
    "orthodoxy": [
        "NN"
    ], 
    "reversals": [
        "NNS"
    ], 
    "Herwig": [
        "NNP"
    ], 
    "connoisseur": [
        "NN"
    ], 
    "Coddington": [
        "NNP"
    ], 
    "auction": [
        "NN", 
        "VB"
    ], 
    "Hoof": [
        "NNP"
    ], 
    "proportioned": [
        "JJ"
    ], 
    "Pieces": [
        "NNP", 
        "NNS"
    ], 
    "Engaging": [
        "VBG"
    ], 
    "characterizing": [
        "VBG"
    ], 
    "monogamous": [
        "JJ"
    ], 
    "pay-back": [
        "JJ"
    ], 
    "vacations": [
        "NNS"
    ], 
    "Idrissa": [
        "NNP"
    ], 
    "tie-in": [
        "NN", 
        "JJ"
    ], 
    "touchdowns": [
        "NNS"
    ], 
    "charisma": [
        "NN"
    ], 
    "visibly": [
        "RB"
    ], 
    "anticus": [
        "NN"
    ], 
    "visible": [
        "JJ"
    ], 
    "Kids": [
        "NNP", 
        "NNS", 
        "NNPS"
    ], 
    "protein-1": [
        "NN"
    ], 
    "Leech": [
        "NNP"
    ], 
    "Minority": [
        "NNP", 
        "NN"
    ], 
    "Housed": [
        "VBN"
    ], 
    "privet": [
        "NN"
    ], 
    "discrepancies": [
        "NNS"
    ], 
    "Houses": [
        "NNS"
    ], 
    "government-mandated": [
        "JJ"
    ], 
    "Interfunding": [
        "NNP"
    ], 
    "Grimesby": [
        "NNP"
    ], 
    "acceded": [
        "VBD", 
        "VBN"
    ], 
    "microwavable": [
        "JJ"
    ], 
    "minicrash": [
        "NN"
    ], 
    "mV": [
        "NN"
    ], 
    "corporis": [
        "FW"
    ], 
    "casualties": [
        "NNS"
    ], 
    "mother.": [
        "NN"
    ], 
    "cerebellum": [
        "NN"
    ], 
    "Stanger": [
        "NNP"
    ], 
    "mg": [
        "NN", 
        "JJ"
    ], 
    "ma": [
        "FW", 
        "NN"
    ], 
    "mm": [
        "NN"
    ], 
    "ml": [
        "NN"
    ], 
    "mo": [
        "NN"
    ], 
    "Alternatives": [
        "NNP"
    ], 
    "WBBM-TV": [
        "NNP"
    ], 
    "Bramalea": [
        "NNP"
    ], 
    "my": [
        "PRP$", 
        "UH", 
        "PRP", 
        "JJ"
    ], 
    "quarrel": [
        "NN", 
        "VB"
    ], 
    "mnemonic": [
        "JJ"
    ], 
    "Sark": [
        "NNP"
    ], 
    "autoloader": [
        "NN"
    ], 
    "high-sounding": [
        "JJ"
    ], 
    "then-Treasury": [
        "JJ", 
        "NNP"
    ], 
    "Gutfreunds": [
        "NNPS"
    ], 
    "Motel": [
        "NNP"
    ], 
    "Sara": [
        "NNP"
    ], 
    "Sidewalks": [
        "NNPS"
    ], 
    "DJS": [
        "NNP"
    ], 
    "Sary": [
        "NNP"
    ], 
    "Mardis": [
        "NNP"
    ], 
    "predicting-machines": [
        "NNS"
    ], 
    "end": [
        "NN", 
        "VBP", 
        "JJ", 
        "RB", 
        "VB"
    ], 
    "Fundamentals": [
        "NNS", 
        "NNPS"
    ], 
    "idosyncratic": [
        "JJ"
    ], 
    "frescos": [
        "NNS"
    ], 
    "Jeep": [
        "NN", 
        "NNP"
    ], 
    "Kreisler": [
        "NNP"
    ], 
    "that...": [
        ":"
    ], 
    "six-thirty": [
        "JJ"
    ], 
    "charging": [
        "VBG", 
        "NN"
    ], 
    "toasted-nut": [
        "NN"
    ], 
    "Handelsbanken": [
        "NNP"
    ], 
    "Essentially": [
        "RB"
    ], 
    "VCRs": [
        "NNS"
    ], 
    "unanimously": [
        "RB"
    ], 
    "protuberance": [
        "NN"
    ], 
    "polymerase": [
        "NN"
    ], 
    "ivory-inlay": [
        "NN"
    ], 
    "unit-making": [
        "VBG"
    ], 
    "SMART": [
        "JJ"
    ], 
    "stronghold": [
        "NN"
    ], 
    "PUBLICITY": [
        "NN"
    ], 
    "Maxwell": [
        "NNP"
    ], 
    "arbitrate": [
        "VB"
    ], 
    "Praver": [
        "NNP"
    ], 
    "enervating": [
        "VBG"
    ], 
    "scout": [
        "NN", 
        "VB"
    ], 
    "Cattle": [
        "NNS", 
        "NNP"
    ], 
    "Seidler": [
        "NNP"
    ], 
    "frontend": [
        "NN"
    ], 
    "Wintour": [
        "NNP"
    ], 
    "imbued": [
        "VBN"
    ], 
    "Selected": [
        "JJ", 
        "NNP", 
        "VBN"
    ], 
    "non-identity": [
        "JJ"
    ], 
    "half-brothers": [
        "NNS"
    ], 
    "computer-aided-software-engineering": [
        "NN"
    ], 
    "reformers": [
        "NNS"
    ], 
    "fads": [
        "NNS"
    ], 
    "Dahl": [
        "NNP"
    ], 
    "Leonid": [
        "NNP"
    ], 
    "canto": [
        "FW", 
        "NN"
    ], 
    "stingrays": [
        "NNS"
    ], 
    "expectations": [
        "NNS"
    ], 
    "Keats": [
        "NNP"
    ], 
    "Keath": [
        "NNP"
    ], 
    "egotist...": [
        ":"
    ], 
    "fade": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Lauber": [
        "NNP"
    ], 
    "tall-oil": [
        "JJ"
    ], 
    "KRAFT": [
        "NNP"
    ], 
    "moontrack": [
        "NN"
    ], 
    "Bristol-Myers": [
        "NNP"
    ], 
    "cost-containment": [
        "NN", 
        "JJ"
    ], 
    "Sturdy": [
        "JJ"
    ], 
    "Gotta": [
        "VB", 
        "NNP"
    ], 
    "carrier-based": [
        "JJ"
    ], 
    "roost": [
        "VB", 
        "NN"
    ], 
    "disparaged": [
        "VBD", 
        "VBN"
    ], 
    "Geffen": [
        "NNP"
    ], 
    "Injun": [
        "NNP"
    ], 
    "Odysseus": [
        "NNP"
    ], 
    "Russian-dominated": [
        "JJ"
    ], 
    "DBL": [
        "NNP"
    ], 
    "cronyism": [
        "NN"
    ], 
    "Laguerre": [
        "NNP"
    ], 
    "DBC": [
        "NNP"
    ], 
    "mothers": [
        "NNS"
    ], 
    "chuck": [
        "NN", 
        "VB"
    ], 
    "Sting": [
        "NNP"
    ], 
    "Moritz": [
        "NNP"
    ], 
    "filling": [
        "VBG", 
        "NN"
    ], 
    "yakking": [
        "VBG"
    ], 
    "Morita": [
        "NNP"
    ], 
    "victory": [
        "NN"
    ], 
    "skeletal": [
        "JJ"
    ], 
    "DBS": [
        "NNP"
    ], 
    "woolgather": [
        "VB"
    ], 
    "lasting": [
        "VBG", 
        "JJ"
    ], 
    "Lanese": [
        "NNP"
    ], 
    "signing": [
        "VBG", 
        "NN"
    ], 
    "Messerschmitt-Boelkow": [
        "NNP"
    ], 
    "Hodge": [
        "NNP"
    ], 
    "proportion": [
        "NN"
    ], 
    "fussing": [
        "VBG"
    ], 
    "magnets": [
        "NNS"
    ], 
    "Hippocrates": [
        "NNP", 
        "NNS"
    ], 
    "poncho": [
        "NN"
    ], 
    "frog-haiku": [
        "NN"
    ], 
    "clozapine": [
        "NN"
    ], 
    "goo": [
        "NN"
    ], 
    "Katonah": [
        "NNP"
    ], 
    "vade": [
        "FW"
    ], 
    "trumpeter": [
        "NN"
    ], 
    "market-opening": [
        "JJ"
    ], 
    "co-produce": [
        "VB"
    ], 
    "two-hour": [
        "JJ"
    ], 
    "gob": [
        "NN"
    ], 
    "ex-lawyer": [
        "NN"
    ], 
    "metal-processing": [
        "JJ"
    ], 
    "millennium": [
        "NN"
    ], 
    "Imprimis": [
        "NNP"
    ], 
    "Telephone-operations": [
        "NNS"
    ], 
    "interconnectedness": [
        "NN"
    ], 
    "got": [
        "VBD", 
        "VBN", 
        "VBP", 
        "VB"
    ], 
    "Telecussed": [
        "VBD"
    ], 
    "investment-promotion": [
        "NN"
    ], 
    "scopes": [
        "NNS"
    ], 
    "Rugged": [
        "JJ"
    ], 
    "stock-loan": [
        "NN"
    ], 
    "cirrhosis": [
        "NN"
    ], 
    "Circus-Circus": [
        "NNP"
    ], 
    "scoped": [
        "NN"
    ], 
    "hand": [
        "NN", 
        "RB", 
        "VB", 
        "VBP", 
        "JJ"
    ], 
    "AFP": [
        "NNP"
    ], 
    "glisten": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "mailgram": [
        "NN"
    ], 
    "laborer": [
        "NN"
    ], 
    "periodontal": [
        "JJ"
    ], 
    "inexpensive": [
        "JJ"
    ], 
    "Mountain": [
        "NNP", 
        "NN"
    ], 
    "priorities": [
        "NNS"
    ], 
    "labored": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Embassy": [
        "NNP", 
        "NN"
    ], 
    "Sisulu": [
        "NNP"
    ], 
    "cooperating": [
        "VBG"
    ], 
    "Pharmics": [
        "NNP"
    ], 
    "Nicolas": [
        "NNP"
    ], 
    "Impetus": [
        "NN"
    ], 
    "already": [
        "RB"
    ], 
    "Working": [
        "NNP", 
        "JJ", 
        "NN", 
        "VBG"
    ], 
    "Leverett": [
        "NNP"
    ], 
    "Incredulous": [
        "JJ"
    ], 
    "selfless": [
        "JJ"
    ], 
    "sober": [
        "JJ"
    ], 
    "categorize": [
        "VB"
    ], 
    "Overlords": [
        "NNPS"
    ], 
    "Flaherty": [
        "NNP"
    ], 
    "solicitations": [
        "NNS"
    ], 
    "Cocktail": [
        "NN"
    ], 
    "shareholder-owned": [
        "JJ"
    ], 
    "physician-reimbursement": [
        "JJ"
    ], 
    "euphoric": [
        "JJ"
    ], 
    "euphoria": [
        "NN"
    ], 
    "six-time": [
        "JJ"
    ], 
    "ballistic": [
        "JJ"
    ], 
    "Wolstenholme": [
        "NNP"
    ], 
    "analgesic": [
        "JJ", 
        "NN"
    ], 
    "ASSOCIATION": [
        "NNP", 
        "NN"
    ], 
    "Fur": [
        "NNP", 
        "NN"
    ], 
    "servo": [
        "NN", 
        "JJ"
    ], 
    "Seldom": [
        "RB"
    ], 
    "tool": [
        "NN"
    ], 
    "abates": [
        "VBZ"
    ], 
    "took": [
        "VBD"
    ], 
    "Londontowne": [
        "NNP"
    ], 
    "Patterns": [
        "NNS"
    ], 
    "Sunset": [
        "NNP"
    ], 
    "dBASE": [
        "NNP"
    ], 
    "Fun": [
        "NNP"
    ], 
    "abated": [
        "VBN", 
        "VBD"
    ], 
    "nonpartisan": [
        "JJ"
    ], 
    "whereby": [
        "WRB"
    ], 
    "Features": [
        "NNPS"
    ], 
    "near-Communists": [
        "NNS"
    ], 
    "foul-smelling": [
        "JJ"
    ], 
    "unsentimental": [
        "JJ"
    ], 
    "more-attractive": [
        "JJ"
    ], 
    "cowhands": [
        "NNS"
    ], 
    "steady-Eddies": [
        "NNS"
    ], 
    "Pocasset": [
        "NNP"
    ], 
    "Adele": [
        "NNP"
    ], 
    "lifesize": [
        "JJ"
    ], 
    "Dimly": [
        "RB"
    ], 
    "fashion": [
        "NN", 
        "VB"
    ], 
    "unrest": [
        "NN"
    ], 
    "Dying": [
        "NNP", 
        "VBG"
    ], 
    "overleveraging": [
        "VBG"
    ], 
    "Hanover-Lucy": [
        "NNP"
    ], 
    "talking": [
        "VBG", 
        "NN", 
        "NN|VBG"
    ], 
    "oil-tanker": [
        "NN"
    ], 
    "staggeringly": [
        "RB"
    ], 
    "conditioning...": [
        ":"
    ], 
    "Etsuro": [
        "NNP"
    ], 
    "paid-in": [
        "JJ"
    ], 
    "doughty": [
        "JJ"
    ], 
    "Jasmine": [
        "NNP"
    ], 
    "balling": [
        "VBG"
    ], 
    "R.V.": [
        "NNP"
    ], 
    "localities": [
        "NNS"
    ], 
    "shelf": [
        "NN"
    ], 
    "effectiveness": [
        "NN"
    ], 
    "mid-twentieth": [
        "JJ"
    ], 
    "hot-dog": [
        "JJ"
    ], 
    "Absent": [
        "VB", 
        "IN", 
        "JJ", 
        "JJ|IN"
    ], 
    "evangelist": [
        "NN"
    ], 
    "grape-arbor": [
        "NN"
    ], 
    "near-identical": [
        "JJ"
    ], 
    "CWP": [
        "NNP"
    ], 
    "Collective": [
        "NNP"
    ], 
    "humbly": [
        "RB"
    ], 
    "Priestess": [
        "NNP"
    ], 
    "rumble": [
        "NN", 
        "VBP"
    ], 
    "Communistic": [
        "JJ"
    ], 
    "centering": [
        "VBG", 
        "NN"
    ], 
    "evangelism": [
        "NN"
    ], 
    "tabling": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "prostitute": [
        "NN", 
        "VB"
    ], 
    "peers": [
        "NNS", 
        "VBZ"
    ], 
    "romantick": [
        "JJ"
    ], 
    "tallyho": [
        "NN"
    ], 
    "epistolatory": [
        "JJ"
    ], 
    "anti-leak": [
        "JJ"
    ], 
    "Anaconda": [
        "NN", 
        "NNP"
    ], 
    "crankshaft": [
        "NN"
    ], 
    "Loathing": [
        "NN"
    ], 
    "silencing": [
        "VBG"
    ], 
    "Go-Go": [
        "NN"
    ], 
    "Collateralized": [
        "NNP"
    ], 
    "Populace": [
        "NN"
    ], 
    "special-purpose": [
        "JJ"
    ], 
    "reorganize": [
        "VB"
    ], 
    "arrayed": [
        "VBN"
    ], 
    "McDonough": [
        "NNP"
    ], 
    "EDISON": [
        "NNP"
    ], 
    "all-lesbian": [
        "JJ"
    ], 
    "studiously": [
        "RB"
    ], 
    "snickers": [
        "NNS"
    ], 
    "satiric": [
        "JJ"
    ], 
    "Furniture": [
        "NNP", 
        "NN"
    ], 
    "rinsing": [
        "NN", 
        "VBG"
    ], 
    "mixture": [
        "NN"
    ], 
    "Soifer": [
        "NNP"
    ], 
    "Manute": [
        "NNP"
    ], 
    "novelists": [
        "NNS"
    ], 
    "blinking": [
        "JJ", 
        "VBG", 
        "RB"
    ], 
    "baffle": [
        "VB"
    ], 
    "Gingl": [
        "NNP"
    ], 
    "Weymouth": [
        "NNP"
    ], 
    "demagogues": [
        "NNS"
    ], 
    "Armco": [
        "NNP"
    ], 
    "intersperses": [
        "VBZ"
    ], 
    "Watson-Watt": [
        "NNP"
    ], 
    "spice-laden": [
        "JJ"
    ], 
    "Raimer": [
        "NNP"
    ], 
    "Disabled": [
        "JJ", 
        "NN", 
        "NNP", 
        "VBN"
    ], 
    "interspersed": [
        "VBN"
    ], 
    "Rodrigo": [
        "NNP"
    ], 
    "Guterman": [
        "NNP"
    ], 
    "Burritt": [
        "NNP"
    ], 
    "rail-car": [
        "NN"
    ], 
    "thwarting": [
        "VBG"
    ], 
    "strainers": [
        "NNS"
    ], 
    "lay-sisters": [
        "NNS"
    ], 
    "demented": [
        "JJ", 
        "VBN"
    ], 
    "Galax": [
        "NNP"
    ], 
    "taxied": [
        "VBD"
    ], 
    "Braitman": [
        "NNP"
    ], 
    "discriminating": [
        "VBG", 
        "JJ"
    ], 
    "gladiator": [
        "NN"
    ], 
    "Herron": [
        "NNP"
    ], 
    "amalgamated": [
        "VBN"
    ], 
    "capacity": [
        "NN"
    ], 
    "postride": [
        "JJ"
    ], 
    "interviewing": [
        "VBG", 
        "NN"
    ], 
    "luminescent": [
        "JJ"
    ], 
    "loopaholics": [
        "NNS"
    ], 
    "Clarke": [
        "NNP"
    ], 
    "Statistique": [
        "NNP"
    ], 
    "Shuxian": [
        "NNP"
    ], 
    "Roderick": [
        "NNP"
    ], 
    "Small-business": [
        "NN"
    ], 
    "volumetric": [
        "JJ"
    ], 
    "Unificationism": [
        "NNP"
    ], 
    "G.B.S.": [
        "NN"
    ], 
    "adage": [
        "NN"
    ], 
    "Impco": [
        "NNP"
    ], 
    "Unificationist": [
        "JJ"
    ], 
    "byways": [
        "NNS"
    ], 
    "flowering": [
        "NN", 
        "VBG"
    ], 
    "improve": [
        "VB", 
        "VBP"
    ], 
    "Danco": [
        "NNP"
    ], 
    "slow-spending": [
        "JJ"
    ], 
    "Dance": [
        "NNP", 
        "NN"
    ], 
    "make...": [
        ":"
    ], 
    "Famine": [
        "NN"
    ], 
    "layered": [
        "VBN"
    ], 
    "conceits": [
        "NN"
    ], 
    "snooker": [
        "NN"
    ], 
    "imported-food": [
        "NN"
    ], 
    "monograph": [
        "NN"
    ], 
    "self-respect": [
        "NN"
    ], 
    "Kaye": [
        "NNP"
    ], 
    "direct-steelmaking": [
        "NN"
    ], 
    "Supra-Expressionism": [
        "NNP"
    ], 
    "towels": [
        "NNS"
    ], 
    "BSPP": [
        "NNP"
    ], 
    "double-breasted": [
        "JJ"
    ], 
    "Destler": [
        "NNP"
    ], 
    "unfurled": [
        "VBN"
    ], 
    "Malacca": [
        "NNP"
    ], 
    "stirringly": [
        "RB"
    ], 
    "foully": [
        "RB"
    ], 
    "Chance": [
        "NN", 
        "NNP"
    ], 
    "trampled": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "diskettes": [
        "NNS"
    ], 
    "fantasies": [
        "NNS"
    ], 
    "Hucksters": [
        "NNP"
    ], 
    "metal-coil": [
        "JJ"
    ], 
    "snips": [
        "NNS"
    ], 
    "automotive-lighting": [
        "JJ", 
        "NN"
    ], 
    "bladder": [
        "NN"
    ], 
    "usurped": [
        "VBN"
    ], 
    "oil-spill": [
        "NN", 
        "JJ"
    ], 
    "Budlong": [
        "NNP"
    ], 
    "auto-industry": [
        "NN", 
        "JJ"
    ], 
    "dissatisfactions": [
        "NNS"
    ], 
    "Mahone": [
        "NNP"
    ], 
    "lessen": [
        "VB"
    ], 
    "Medibank": [
        "NNP"
    ], 
    "lesser": [
        "JJR", 
        "RBR"
    ], 
    "Domingos": [
        "NNP"
    ], 
    "teachers": [
        "NNS"
    ], 
    "office-furniture": [
        "JJ"
    ], 
    "inexplicit": [
        "JJ"
    ], 
    "Gross": [
        "NNP", 
        "JJ"
    ], 
    "zip-code": [
        "NN"
    ], 
    "Eurodebentures": [
        "NNS"
    ], 
    "nightgowns": [
        "NNS"
    ], 
    "usable": [
        "JJ"
    ], 
    "Simms": [
        "NNP"
    ], 
    "Attridge": [
        "NNP"
    ], 
    "operator-services": [
        "NNS"
    ], 
    "surcharge": [
        "NN"
    ], 
    "Cramer": [
        "NNP"
    ], 
    "snobbery": [
        "NN"
    ], 
    "four-page-a-minute": [
        "JJ"
    ], 
    "Stahl": [
        "NNP"
    ], 
    "wound": [
        "NN", 
        "VBD", 
        "VBN", 
        "VB"
    ], 
    "yahoos": [
        "NNS"
    ], 
    "BOGGS": [
        "NNP"
    ], 
    "RECORD": [
        "NNP"
    ], 
    "complex": [
        "JJ", 
        "NN"
    ], 
    "Vieux": [
        "NNP"
    ], 
    "CBS-owned": [
        "JJ"
    ], 
    "interparty": [
        "NN"
    ], 
    "Fla.-based": [
        "JJ"
    ], 
    "Investors": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "Minkow": [
        "NNP"
    ], 
    "pampering": [
        "VBG"
    ], 
    "twiddling": [
        "VBG"
    ], 
    "Spectra": [
        "NNS", 
        "NNP"
    ], 
    "constricting": [
        "VBG"
    ], 
    "amortization": [
        "NN"
    ], 
    "co-optation": [
        "NN"
    ], 
    "laissez-faire": [
        "FW", 
        "JJ", 
        "NN"
    ], 
    "monumentalism": [
        "NN"
    ], 
    "Pedestrian": [
        "NNP"
    ], 
    "Hilton": [
        "NNP"
    ], 
    "vilifies": [
        "VBZ"
    ], 
    "Ethyl": [
        "NNP"
    ], 
    "highway-construction": [
        "JJ"
    ], 
    "feuded": [
        "VBD"
    ], 
    "Williamsburg": [
        "NNP"
    ], 
    "councilman": [
        "NN"
    ], 
    "APPLIANCES": [
        "NNPS"
    ], 
    "uncooperative": [
        "JJ"
    ], 
    "Herder": [
        "NNP"
    ], 
    "Intercepting": [
        "VBG"
    ], 
    "forfeiture": [
        "NN"
    ], 
    "flutist": [
        "NN"
    ], 
    "Raghib": [
        "NNP"
    ], 
    "Wing": [
        "NNP"
    ], 
    "Wind": [
        "NNP", 
        "NN"
    ], 
    "hairless": [
        "JJ"
    ], 
    "interprets": [
        "VBZ"
    ], 
    "humanity": [
        "NN"
    ], 
    "Guttman-type": [
        "JJ"
    ], 
    "actresses": [
        "NNS"
    ], 
    "quake-hit": [
        "JJ"
    ], 
    "D": [
        "NN", 
        "LS", 
        "NNP"
    ], 
    "Fluorescence": [
        "NN"
    ], 
    "Tichy": [
        "NNP"
    ], 
    "Gabriel": [
        "NNP"
    ], 
    "timber-dependent": [
        "JJ"
    ], 
    "Content": [
        "JJ"
    ], 
    "reapportion": [
        "VBP"
    ], 
    "valewe": [
        "NN"
    ], 
    "Rudolf": [
        "NNP"
    ], 
    "apart": [
        "RB", 
        "RP", 
        "JJ"
    ], 
    "anti-Newtonian": [
        "JJ"
    ], 
    "intertwined": [
        "VBN", 
        "JJ"
    ], 
    "clearheaded": [
        "JJ"
    ], 
    "gift": [
        "NN"
    ], 
    "remanding": [
        "VBG"
    ], 
    "Lichtenstein": [
        "NNP"
    ], 
    "M.I.M.": [
        "NNP"
    ], 
    "anciently": [
        "RB"
    ], 
    "ditty": [
        "NN"
    ], 
    "splendor": [
        "NN"
    ], 
    "all-Negro": [
        "JJ"
    ], 
    "Educate": [
        "VB"
    ], 
    "overnighters": [
        "NNS"
    ], 
    "weight-height": [
        "NN"
    ], 
    "reunifed": [
        "VBN"
    ], 
    "sanction": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "enrolling": [
        "NN"
    ], 
    "gangbusters": [
        "NNS"
    ], 
    "Hillsborough": [
        "NNP"
    ], 
    "Nippon": [
        "NNP"
    ], 
    "untried": [
        "JJ"
    ], 
    "meters": [
        "NNS", 
        "NN"
    ], 
    "precautions": [
        "NNS"
    ], 
    "Harrigan": [
        "NNP"
    ], 
    "embodied": [
        "VBN", 
        "VBD"
    ], 
    "non-commissioned": [
        "JJ"
    ], 
    "Xanax": [
        "NNP"
    ], 
    "RATTLED": [
        "VBD"
    ], 
    "reinvest": [
        "VB", 
        "VBP"
    ], 
    "Looming": [
        "VBG"
    ], 
    "aid-to-education": [
        "NN"
    ], 
    "prejudicial": [
        "JJ"
    ], 
    "cooped": [
        "JJ", 
        "NN", 
        "VBN"
    ], 
    "Repeatedly": [
        "RB"
    ], 
    "Brezhnev": [
        "NNP"
    ], 
    "Implores": [
        "VBZ"
    ], 
    "cash-laden": [
        "JJ"
    ], 
    "espionage": [
        "NN"
    ], 
    "ironclad": [
        "JJ"
    ], 
    "erodes": [
        "VBZ"
    ], 
    "Tegal": [
        "NNP"
    ], 
    "multi-agency": [
        "JJ", 
        "NN"
    ], 
    "libertine": [
        "NN"
    ], 
    "Oakland-Alameda": [
        "NNP"
    ], 
    "phthalate": [
        "NN"
    ], 
    "CJS": [
        "NNP"
    ], 
    "lookee-loos": [
        "NNS"
    ], 
    "landowners": [
        "NNS"
    ], 
    "nontransferable": [
        "JJ"
    ], 
    "limitation": [
        "NN"
    ], 
    "census": [
        "NN"
    ], 
    "agriculture-chemicals": [
        "NNS"
    ], 
    "Leobardo": [
        "NNP"
    ], 
    "shards": [
        "NNS"
    ], 
    "Kafka": [
        "NNP"
    ], 
    "catkins": [
        "NNS"
    ], 
    "Lucretia": [
        "NNP"
    ], 
    "cooled": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "self-splicing": [
        "JJ"
    ], 
    "Foss": [
        "NNP"
    ], 
    "Novacor": [
        "NNP"
    ], 
    "scandal-plagued": [
        "JJ"
    ], 
    "paddies": [
        "NNS"
    ], 
    "primitive": [
        "JJ"
    ], 
    "Guthrie": [
        "NNP"
    ], 
    "froze": [
        "VBD", 
        "VBN"
    ], 
    "preambles": [
        "NNS"
    ], 
    "Lebans": [
        "NNP"
    ], 
    "tapings": [
        "NNS"
    ], 
    "taffy": [
        "JJ"
    ], 
    "electorate": [
        "NN"
    ], 
    "Survive": [
        "VB"
    ], 
    "cafeteria": [
        "NN"
    ], 
    "jeunes": [
        "FW"
    ], 
    "Dodger": [
        "NNP", 
        "NN"
    ], 
    "disinterest": [
        "NN"
    ], 
    "interlopers": [
        "NNS"
    ], 
    "lags": [
        "VBZ", 
        "NNS"
    ], 
    "Baldy": [
        "NNP"
    ], 
    "unpretentious": [
        "JJ"
    ], 
    "grain-trading": [
        "JJ"
    ], 
    "oil-well": [
        "NN"
    ], 
    "anti-racketeering": [
        "JJ"
    ], 
    "full-clad": [
        "JJ"
    ], 
    "head": [
        "NN", 
        "JJ", 
        "RB", 
        "VB", 
        "VBP"
    ], 
    "medium": [
        "NN", 
        "JJ"
    ], 
    "Sundays": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "preschoolers": [
        "NNS"
    ], 
    "heal": [
        "VB"
    ], 
    "world-leading": [
        "JJ"
    ], 
    "Suckow": [
        "NNP"
    ], 
    "Liffe": [
        "NNP"
    ], 
    "boarding-home": [
        "NN"
    ], 
    "heat": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "hear": [
        "VB", 
        "VBP"
    ], 
    "Ewe": [
        "NNP"
    ], 
    "heap": [
        "NN"
    ], 
    "free-spirited": [
        "JJ"
    ], 
    "nodded": [
        "VBD", 
        "VBN"
    ], 
    "counsel": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Uruguay": [
        "NNP"
    ], 
    "compositional": [
        "JJ"
    ], 
    "lopping": [
        "NN"
    ], 
    "high-powered": [
        "JJ"
    ], 
    "bargain": [
        "NN", 
        "VB"
    ], 
    "danseur": [
        "FW"
    ], 
    "adore": [
        "VBP", 
        "VB"
    ], 
    "advertising-conscious": [
        "JJ"
    ], 
    "co-opted": [
        "VBN"
    ], 
    "mustering": [
        "VBG"
    ], 
    "Electronic": [
        "NNP", 
        "JJ"
    ], 
    "southernmost": [
        "JJ"
    ], 
    "adorn": [
        "VB", 
        "VBP"
    ], 
    "obfuscation": [
        "NN"
    ], 
    "sinful": [
        "JJ"
    ], 
    "one-thousand-zloty": [
        "JJ"
    ], 
    "non-diva-like": [
        "JJ"
    ], 
    "simulations": [
        "NNS"
    ], 
    "pigpens": [
        "NNS"
    ], 
    "M8.7sp": [
        "NNP"
    ], 
    "Nauman": [
        "NNP"
    ], 
    "Chiefs": [
        "NNPS", 
        "NNP"
    ], 
    "willingly": [
        "RB"
    ], 
    "Poo": [
        "NNP"
    ], 
    "Monteath": [
        "NNP"
    ], 
    "isomers": [
        "NNS"
    ], 
    "futures-related": [
        "JJ"
    ], 
    "incestuous": [
        "JJ"
    ], 
    "EST": [
        "NNP", 
        "NN", 
        "RB"
    ], 
    "new-loan": [
        "JJ"
    ], 
    "self-congratulation": [
        "NN"
    ], 
    "ESP": [
        "NNP"
    ], 
    "Heebner": [
        "NNP"
    ], 
    "CyCare": [
        "NNP"
    ], 
    "Tooth": [
        "NN"
    ], 
    "ESB": [
        "NNP"
    ], 
    "ESN": [
        "NN"
    ], 
    "QUARTER": [
        "NN"
    ], 
    "reassuringly": [
        "RB"
    ], 
    "Unconscious": [
        "NNP"
    ], 
    "bullet": [
        "NN"
    ], 
    "uranyl": [
        "NN"
    ], 
    "withhold": [
        "VB", 
        "VBP"
    ], 
    "urethane": [
        "NN"
    ], 
    "Denlea": [
        "NNP"
    ], 
    "oeufs": [
        "FW"
    ], 
    "backward": [
        "RB", 
        "JJ"
    ], 
    "Contributions": [
        "NNS"
    ], 
    "Suvorov": [
        "NNP"
    ], 
    "forgeries": [
        "NNS"
    ], 
    "counseling": [
        "NN", 
        "VBG"
    ], 
    "Choral": [
        "NNP"
    ], 
    "brokerages": [
        "NNS"
    ], 
    "MasterCards": [
        "NNS"
    ], 
    "Iacocca": [
        "NNP"
    ], 
    "fusing": [
        "VBG", 
        "NN"
    ], 
    "Buddy": [
        "NNP"
    ], 
    "brandin": [
        "NN"
    ], 
    "Cilluffo": [
        "NNP"
    ], 
    "S.D.": [
        "NNP"
    ], 
    "contemplating": [
        "VBG"
    ], 
    "flowered": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "trustees": [
        "NNS"
    ], 
    "Waverly": [
        "NNP"
    ], 
    "sceptical": [
        "JJ"
    ], 
    "Rosoff": [
        "NNP"
    ], 
    "Kafaroff": [
        "NNP"
    ], 
    "Haole": [
        "FW"
    ], 
    "formed-tooth": [
        "JJ"
    ], 
    "broadly": [
        "RB"
    ], 
    "Countries": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "thawed": [
        "VBN"
    ], 
    "hattes": [
        "NNS"
    ], 
    "Hargrave": [
        "NNP"
    ], 
    "rockstrewn": [
        "NN"
    ], 
    "drug-abuse": [
        "JJ", 
        "NN"
    ], 
    "roving": [
        "VBG"
    ], 
    "eighteen-year-old": [
        "JJ"
    ], 
    "Indebted": [
        "JJ"
    ], 
    "denounced": [
        "VBD", 
        "VBN"
    ], 
    "Muratore": [
        "NNP"
    ], 
    "Wollman": [
        "NNP"
    ], 
    "denounces": [
        "VBZ"
    ], 
    "money-market": [
        "JJ", 
        "NN"
    ], 
    "Hsieh": [
        "NNP"
    ], 
    "Rederi": [
        "NNP"
    ], 
    "peek": [
        "NN"
    ], 
    "inland": [
        "RB", 
        "JJ"
    ], 
    "off-off-Broadway": [
        "NNP", 
        "JJ"
    ], 
    "nonresidential-contracting": [
        "JJ"
    ], 
    "Diebold": [
        "NNP"
    ], 
    "takeoff": [
        "NN"
    ], 
    "price-consciousness": [
        "NN"
    ], 
    "Durakon": [
        "NNP"
    ], 
    "bake": [
        "JJ", 
        "VB"
    ], 
    "Jana": [
        "NNP"
    ], 
    "allout": [
        "JJ"
    ], 
    "constitution": [
        "NN"
    ], 
    "Theatre": [
        "NNP"
    ], 
    "spire": [
        "NN"
    ], 
    "El-Abed": [
        "NNP"
    ], 
    "manikins": [
        "NNS"
    ], 
    "up-market": [
        "JJ"
    ], 
    "humorist": [
        "NN"
    ], 
    "Reeves": [
        "NNP", 
        "NNS"
    ], 
    "Mirek": [
        "NNP"
    ], 
    "retroviral": [
        "JJ"
    ], 
    "Maneret": [
        "NNP"
    ], 
    "eliminations": [
        "NNS"
    ], 
    "Trackdown": [
        "NNP"
    ], 
    "Annuity": [
        "NNP"
    ], 
    "plant-location": [
        "JJ"
    ], 
    "Khomeini": [
        "NNP"
    ], 
    "dissipates": [
        "VBZ"
    ], 
    "meteorites": [
        "NNS"
    ], 
    "Liechtenstein": [
        "NNP"
    ], 
    "Jan.": [
        "NNP", 
        "NN", 
        "VB"
    ], 
    "groups": [
        "NNS"
    ], 
    "dea": [
        "NN"
    ], 
    "dissipated": [
        "VBN", 
        "VBD"
    ], 
    "lonely-hearts": [
        "NNS"
    ], 
    "Rocket-powered": [
        "JJ"
    ], 
    "unidentified": [
        "JJ"
    ], 
    "pearly": [
        "JJ"
    ], 
    "PEOPLE": [
        "NNS"
    ], 
    "pearls": [
        "NNS"
    ], 
    "culpa": [
        "FW"
    ], 
    "ratable": [
        "JJ"
    ], 
    "marble": [
        "NN"
    ], 
    "aircraft-engine-maintenance": [
        "JJ"
    ], 
    "kerygma": [
        "FW"
    ], 
    "child-rearing": [
        "NN"
    ], 
    "abounded": [
        "VBD"
    ], 
    "crime\\/comedy": [
        "NN"
    ], 
    "Talmud": [
        "NNP"
    ], 
    "Raikin": [
        "NNP"
    ], 
    "patronage-free": [
        "JJ"
    ], 
    "morals": [
        "NNS"
    ], 
    "Catholicism": [
        "NNP"
    ], 
    "Interlake": [
        "NNP"
    ], 
    "AuCoin": [
        "NNP"
    ], 
    "Trend-following": [
        "JJ"
    ], 
    "Brissette": [
        "NNP"
    ], 
    "Vasso": [
        "NNP"
    ], 
    "Hungarian": [
        "JJ", 
        "NNP"
    ], 
    "Radzymin": [
        "NNP"
    ], 
    "criteria": [
        "NNS"
    ], 
    "Gillett": [
        "NNP"
    ], 
    "Affidavits": [
        "NNS"
    ], 
    "blacked-out": [
        "JJ"
    ], 
    "Gintel": [
        "NNP"
    ], 
    "Vivacious": [
        "JJ"
    ], 
    "chocolate": [
        "NN", 
        "JJ"
    ], 
    "Gesualdo": [
        "NNP"
    ], 
    "Groundwater": [
        "NNP"
    ], 
    "Push": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "misreading": [
        "NN"
    ], 
    "goofiness": [
        "NN"
    ], 
    "Carsten": [
        "NNP"
    ], 
    "Crystallographic": [
        "JJ", 
        "NNP"
    ], 
    "trick...": [
        ":"
    ], 
    "zinc-sulphide": [
        "NN"
    ], 
    "districts": [
        "NNS"
    ], 
    "hymselfe": [
        "NN"
    ], 
    "predominating": [
        "VBG"
    ], 
    "slightest": [
        "JJS"
    ], 
    "dropper": [
        "NN"
    ], 
    "Gerolamo": [
        "NNP"
    ], 
    "corrupted": [
        "VBN"
    ], 
    "parings": [
        "NNS"
    ], 
    "amazons": [
        "NNS"
    ], 
    "newsletters": [
        "NNS"
    ], 
    "sky-tapping": [
        "JJ"
    ], 
    "stroke": [
        "NN", 
        "VB"
    ], 
    "corrupter": [
        "NN"
    ], 
    "Lenwood": [
        "NNP"
    ], 
    "Manderbach": [
        "NNP"
    ], 
    "hydrogen": [
        "NN"
    ], 
    "foreign-ownership": [
        "NN"
    ], 
    "requirements": [
        "NNS"
    ], 
    "Marketing": [
        "NNP", 
        "NN", 
        "VBG", 
        "VBG|NN"
    ], 
    "Cartoonists": [
        "NNP"
    ], 
    "minivans": [
        "NNS"
    ], 
    "innumerable": [
        "JJ"
    ], 
    "Considered": [
        "VBN"
    ], 
    "bankruptcylaw": [
        "NN"
    ], 
    "Flyer": [
        "NNP"
    ], 
    "Gallagher": [
        "NNP"
    ], 
    "Wage-price": [
        "JJ"
    ], 
    "speaks": [
        "VBZ"
    ], 
    "Elkhorn": [
        "NNP"
    ], 
    "tipper": [
        "NN"
    ], 
    "irrational": [
        "JJ"
    ], 
    "ballroom": [
        "NN"
    ], 
    "rites": [
        "NNS"
    ], 
    "motorists": [
        "NNS"
    ], 
    "Dinosaur": [
        "NNP"
    ], 
    "outlandish": [
        "JJ"
    ], 
    "tipped": [
        "VBD", 
        "VBN"
    ], 
    "tippee": [
        "NN"
    ], 
    "evoke": [
        "VB", 
        "VBP"
    ], 
    "nannies": [
        "NNS"
    ], 
    "Powers": [
        "NNP"
    ], 
    "Hashimoto": [
        "NNP"
    ], 
    "reposition": [
        "VB"
    ], 
    "flat-bottomed": [
        "JJ"
    ], 
    "misbegotten": [
        "JJ"
    ], 
    "compressing": [
        "VBG"
    ], 
    "fire-control": [
        "JJ"
    ], 
    "persons": [
        "NNS"
    ], 
    "Asleep": [
        "RB"
    ], 
    "glancing": [
        "VBG", 
        "JJ"
    ], 
    "refund": [
        "NN", 
        "VB"
    ], 
    "sonnet": [
        "NN"
    ], 
    "Feiner": [
        "NNP"
    ], 
    "undervalued": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "blocker": [
        "NN"
    ], 
    "fangs": [
        "NNS"
    ], 
    "canard": [
        "NN"
    ], 
    "accolades": [
        "NNS"
    ], 
    "in-store": [
        "JJ"
    ], 
    "academeh": [
        "NN"
    ], 
    "Gorbachev-era": [
        "NN"
    ], 
    "worship": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "blocked": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "segregationists": [
        "NNS"
    ], 
    "rebalancing": [
        "VBG"
    ], 
    "Qualls": [
        "NNP"
    ], 
    "Sierras": [
        "NNPS"
    ], 
    "bead-like": [
        "JJ"
    ], 
    "Falco": [
        "NNP"
    ], 
    "coordinated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Factories": [
        "NNS", 
        "NNPS"
    ], 
    "LD056": [
        "NN"
    ], 
    "meridian": [
        "NN"
    ], 
    "cutter": [
        "NN"
    ], 
    "quick-tempered": [
        "JJ"
    ], 
    "sparing": [
        "VBG", 
        "JJ"
    ], 
    "Highness": [
        "NNP"
    ], 
    "Turtles": [
        "NNPS"
    ], 
    "M.T.": [
        "NNP"
    ], 
    "appraised": [
        "VBN"
    ], 
    "HRT": [
        "NNP"
    ], 
    "radicals": [
        "NNS"
    ], 
    "gourmet": [
        "NN", 
        "JJ"
    ], 
    "warranted": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "asset-growth": [
        "NN"
    ], 
    "HRH": [
        "NNP"
    ], 
    "HRE": [
        "NNP"
    ], 
    "feathered": [
        "JJ", 
        "VBN"
    ], 
    "appraiser": [
        "NN"
    ], 
    "HRB": [
        "NNP"
    ], 
    "Clams": [
        "NNS"
    ], 
    "Josephus": [
        "NNP"
    ], 
    "Bolduc": [
        "NNP"
    ], 
    "opera": [
        "NN"
    ], 
    "Mentum": [
        "NNP"
    ], 
    "belts": [
        "NNS", 
        "VBZ"
    ], 
    "slumps": [
        "VBZ", 
        "NNS"
    ], 
    "Gotterdammerung": [
        "NNP"
    ], 
    "fourth-level": [
        "JJ"
    ], 
    "fair-trade-related": [
        "JJ"
    ], 
    "lower-paid": [
        "JJ"
    ], 
    "Campaigning": [
        "VBG"
    ], 
    "Gilroy": [
        "NNP"
    ], 
    "Heathrow": [
        "NNP"
    ], 
    "Airbus": [
        "NNP"
    ], 
    "weighted": [
        "JJ", 
        "VBD", 
        "VBN"
    ], 
    "nettlesome": [
        "JJ"
    ], 
    "weight-control": [
        "JJ"
    ], 
    "pillaged": [
        "VBD"
    ], 
    "blacked": [
        "VBN"
    ], 
    "Britain-U.S.": [
        "JJ"
    ], 
    "zebra": [
        "NN"
    ], 
    "Forks": [
        "NNS"
    ], 
    "myrtle": [
        "NN"
    ], 
    "reckons": [
        "VBZ"
    ], 
    "quake-torn": [
        "JJ"
    ], 
    "sustains": [
        "VBZ"
    ], 
    "obfuscations": [
        "NNS"
    ], 
    "Shakespearian": [
        "JJ"
    ], 
    "Grabbing": [
        "VBG"
    ], 
    "disposables": [
        "NNS"
    ], 
    "someplace": [
        "RB", 
        "NN"
    ], 
    "Ciporkin": [
        "NNP"
    ], 
    "Bodner": [
        "NNP"
    ], 
    "clover": [
        "NN"
    ], 
    "more-natural": [
        "JJ"
    ], 
    "reformulation": [
        "NN"
    ], 
    "Coudersport": [
        "NNP"
    ], 
    "ENG": [
        "NNP"
    ], 
    "Keilin": [
        "NNP"
    ], 
    "ENI": [
        "NNP"
    ], 
    "Deppy": [
        "NNP"
    ], 
    "key-someone": [
        "NN"
    ], 
    "obituaries": [
        "NNS"
    ], 
    "light-headed": [
        "JJ"
    ], 
    "half-moons": [
        "NNS"
    ], 
    "explorers": [
        "NNS"
    ], 
    "Parity": [
        "NN"
    ], 
    "Leuffer": [
        "NNP"
    ], 
    "Julian": [
        "NNP"
    ], 
    "schnapps": [
        "NN"
    ], 
    "Delray": [
        "NNP"
    ], 
    "Glass-Steagall": [
        "NNP"
    ], 
    "teammates": [
        "NNS"
    ], 
    "deprogrammings": [
        "NNS"
    ], 
    "Industrialistes": [
        "NNP"
    ], 
    "FDA": [
        "NNP"
    ], 
    "Expenditures": [
        "NNS", 
        "NNPS"
    ], 
    "mind-altering": [
        "JJ"
    ], 
    "Slobodin": [
        "NNP"
    ], 
    "faculty": [
        "NN"
    ], 
    "Nairne": [
        "NNP"
    ], 
    "sovereign": [
        "JJ", 
        "NN", 
        "NN|JJ"
    ], 
    "soaring": [
        "VBG", 
        "JJ"
    ], 
    "Scripp": [
        "NNP"
    ], 
    "Forrestal": [
        "NNP"
    ], 
    "Geographical": [
        "JJ"
    ], 
    "disinterested": [
        "JJ"
    ], 
    "surveys": [
        "NNS", 
        "VBZ"
    ], 
    "Johan": [
        "NNP"
    ], 
    "R-Bergen": [
        "NNP"
    ], 
    "Espagnol": [
        "NNP"
    ], 
    "Parkways": [
        "NNP", 
        "NNPS"
    ], 
    "convention": [
        "NN"
    ], 
    "circa": [
        "RB"
    ], 
    "Dove": [
        "NN", 
        "NNP"
    ], 
    "assigned-risk": [
        "NN"
    ], 
    "Biosite": [
        "NNP"
    ], 
    "interest-rate-sensitive": [
        "JJ"
    ], 
    "hug": [
        "NN", 
        "VB", 
        "VBP"
    ], 
    "Whitten": [
        "NNP"
    ], 
    "tempers": [
        "NNS"
    ], 
    "hub": [
        "NN"
    ], 
    "Deregulation": [
        "NN"
    ], 
    "greatcoated": [
        "JJ"
    ], 
    "huh": [
        "UH"
    ], 
    "inexpressible": [
        "JJ"
    ], 
    "hut": [
        "NN"
    ], 
    "inexpressibly": [
        "RB"
    ], 
    "Cortex": [
        "NNP"
    ], 
    "tempera": [
        "NN"
    ], 
    "ill-advised": [
        "JJ"
    ], 
    "circulates": [
        "VBZ"
    ], 
    "holder": [
        "NN"
    ], 
    "Cortes": [
        "NNP"
    ], 
    "petrified": [
        "JJ", 
        "VBN"
    ], 
    "DeLay": [
        "NNP"
    ], 
    "demythologizing": [
        "VBG"
    ], 
    "tawdry": [
        "JJ"
    ], 
    "vapor-pressure": [
        "NN"
    ], 
    "Tryon": [
        "NNP"
    ], 
    "diplomatic": [
        "JJ"
    ], 
    "r": [
        "NN"
    ], 
    "DOWNEY": [
        "NNP"
    ], 
    "Lawful": [
        "JJ"
    ], 
    "change-ringing": [
        "NN"
    ], 
    "Gagne": [
        "NNP"
    ], 
    "EX-OFFICIALS": [
        "NNS"
    ], 
    "broken-nosed": [
        "JJ"
    ], 
    "armored": [
        "JJ", 
        "VBN"
    ], 
    "Hirsch": [
        "NNP"
    ], 
    "underprepared": [
        "JJ"
    ], 
    "right-to-work": [
        "JJ"
    ], 
    "PolyGram": [
        "NNP"
    ], 
    "stolid": [
        "JJ"
    ], 
    "Vollard": [
        "NNP"
    ], 
    "overjoyed": [
        "JJ"
    ], 
    "exploratory": [
        "JJ"
    ], 
    "Sadie": [
        "NNP"
    ], 
    "transcription": [
        "NN"
    ], 
    "Schuller": [
        "NNP"
    ], 
    "Capitalizing": [
        "VBG"
    ], 
    "Watercolor": [
        "NNP"
    ], 
    "dining": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "emphasis": [
        "NN"
    ], 
    "Strouds": [
        "NNP"
    ], 
    "thermometer": [
        "NN"
    ], 
    "Maltese": [
        "NNP", 
        "JJ"
    ], 
    "hyperemic": [
        "JJ"
    ], 
    "Selve": [
        "NNP"
    ], 
    "hyperemia": [
        "NN"
    ], 
    "Exch": [
        "NN"
    ], 
    "sect": [
        "NN"
    ], 
    "stock-basket": [
        "NN", 
        "JJ"
    ], 
    "sterns": [
        "NNS"
    ], 
    "Munro": [
        "NNP"
    ], 
    "botulinum": [
        "NN"
    ], 
    "Mickie": [
        "NNP"
    ], 
    "precluded": [
        "VBD", 
        "VBN", 
        "JJ"
    ], 
    "Sheiner": [
        "NNP"
    ], 
    "visitors": [
        "NNS"
    ], 
    "Gandhi": [
        "NNP"
    ], 
    "brashness": [
        "NN"
    ], 
    "librarian": [
        "NN"
    ], 
    "headcount-control": [
        "NN"
    ], 
    "bioengineers": [
        "NNS"
    ], 
    "littering": [
        "NN"
    ], 
    "encasing": [
        "VBG"
    ], 
    "depreciation": [
        "NN"
    ], 
    "Carpentier": [
        "NNP"
    ], 
    "tax-cut": [
        "JJ", 
        "NN"
    ], 
    "considered": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Morin": [
        "NNP"
    ], 
    "Tensile": [
        "JJ"
    ], 
    "Protectionism": [
        "NNP", 
        "NN"
    ], 
    "Post-Serialism": [
        "NNP"
    ], 
    "Habla": [
        "NNP"
    ], 
    "vetted": [
        "VBN"
    ], 
    "Comecon": [
        "NNP"
    ], 
    "infielder": [
        "NN"
    ], 
    "revamping": [
        "VBG", 
        "NN"
    ], 
    "once-proud": [
        "JJ"
    ], 
    "yen-bond": [
        "JJ"
    ], 
    "southwestern": [
        "JJ"
    ], 
    "Triland": [
        "NNP"
    ], 
    "Syrdarya": [
        "NNP"
    ], 
    "SOUTH": [
        "NNP"
    ], 
    "woolen": [
        "JJ"
    ], 
    "interessant": [
        "FW"
    ], 
    "Veraldi": [
        "NNP"
    ], 
    "half-full": [
        "JJ"
    ], 
    "Rauch": [
        "NNP"
    ], 
    "crimp": [
        "VB", 
        "NN"
    ], 
    "low-lying": [
        "JJ"
    ], 
    "hooting": [
        "JJ"
    ], 
    "Pune": [
        "NNP"
    ], 
    "narrows": [
        "VBZ"
    ], 
    "Piazza": [
        "NNP", 
        "FW"
    ], 
    "Puna": [
        "NNP"
    ], 
    "Piazzo": [
        "NNP"
    ], 
    "boilers": [
        "NNS"
    ], 
    "seventeen-inch": [
        "JJ"
    ], 
    "art-dealing": [
        "JJ"
    ], 
    "substitutionary": [
        "JJ"
    ], 
    "indulgences": [
        "NNS"
    ], 
    "tailor": [
        "VB", 
        "NN"
    ], 
    "food-shop": [
        "JJ"
    ], 
    "primates": [
        "NNS"
    ], 
    "treachery": [
        "NN"
    ], 
    "LXi": [
        "NNP"
    ], 
    "a-Discounted": [
        "JJ", 
        "VBN", 
        "LS|JJ"
    ], 
    "Laurentiis": [
        "NNP"
    ], 
    "mewed": [
        "VBD"
    ], 
    "pinnacle": [
        "NN"
    ], 
    "surrealism": [
        "NN"
    ], 
    "Shantung": [
        "NNP"
    ], 
    "Officielle": [
        "NNP"
    ], 
    "Mirage": [
        "NNP"
    ], 
    "Foulds": [
        "NNP"
    ], 
    "non-writers": [
        "NNS"
    ], 
    "printing-equipment": [
        "NN"
    ], 
    "Loggia": [
        "NNP"
    ], 
    "BELL": [
        "NNP"
    ], 
    "Fontana": [
        "NNP"
    ], 
    "ancestral": [
        "JJ"
    ], 
    "violated": [
        "VBD", 
        "VBN"
    ], 
    "sleepily": [
        "RB"
    ], 
    "simmering": [
        "VBG"
    ], 
    "violates": [
        "VBZ"
    ], 
    "Voyager": [
        "NNP"
    ], 
    "fails": [
        "VBZ", 
        "NNS"
    ], 
    "Frayne": [
        "NNP"
    ], 
    "bicyclist": [
        "NN"
    ], 
    "charters": [
        "NNS", 
        "VBZ"
    ], 
    "seers": [
        "NNS"
    ], 
    "Trunk": [
        "NN", 
        "NNP"
    ], 
    "Bangalore": [
        "NNP"
    ], 
    "sackes": [
        "NNS"
    ], 
    "sacker": [
        "NN"
    ], 
    "Loopholes": [
        "NNS"
    ], 
    "receivers": [
        "NNS"
    ], 
    "best-run": [
        "JJS"
    ], 
    "Northumberland": [
        "NN"
    ], 
    "self-serving": [
        "JJ"
    ], 
    "disdainful": [
        "JJ"
    ], 
    "floundering": [
        "VBG", 
        "JJ"
    ], 
    "bang-sashes": [
        "NNS"
    ], 
    "package-sort": [
        "JJ"
    ], 
    "dutiful": [
        "JJ"
    ], 
    "Ga": [
        "NNP"
    ], 
    "STOCK-INDEX": [
        "NN"
    ], 
    "Songs": [
        "NNPS", 
        "NNS"
    ], 
    "bunko": [
        "NN"
    ], 
    "Falegnami": [
        "NNP"
    ], 
    "discussions..": [
        "NNS"
    ], 
    "poivre": [
        "FW", 
        "NN"
    ], 
    "successes": [
        "NNS"
    ], 
    "darin": [
        "JJ"
    ], 
    "shortstop": [
        "NN"
    ], 
    "Phamaceuticals": [
        "NNPS"
    ], 
    "energies": [
        "NNS"
    ], 
    "Imbrium": [
        "NNP"
    ], 
    "Replies": [
        "NNS"
    ], 
    "Smiling": [
        "VBG"
    ], 
    "bunks": [
        "NNS"
    ], 
    "authoring": [
        "VBG"
    ], 
    "Ransom": [
        "NNP", 
        "NN", 
        "NNPS"
    ], 
    "Flaws": [
        "NNS"
    ], 
    "air-separation": [
        "NN"
    ], 
    "percussionist": [
        "NN"
    ], 
    "physician-patient": [
        "JJ"
    ], 
    "after-effects": [
        "NNS"
    ], 
    "robotics": [
        "NNS"
    ], 
    "Leatherneck": [
        "NNP"
    ], 
    "sampling": [
        "NN", 
        "VBG"
    ], 
    "Luftfahrt": [
        "NNP"
    ], 
    "Sciences": [
        "NNPS", 
        "NNP"
    ], 
    "pole": [
        "NN"
    ], 
    "colon": [
        "NN"
    ], 
    "initialing": [
        "VBG"
    ], 
    "polo": [
        "NN"
    ], 
    "unleaded": [
        "JJ"
    ], 
    "poll": [
        "NN", 
        "JJ", 
        "VB"
    ], 
    "Events": [
        "NNS", 
        "NNP"
    ], 
    "runaway": [
        "JJ", 
        "VBN", 
        "NN"
    ], 
    "squaring": [
        "VBG"
    ], 
    "lifes": [
        "NNS"
    ], 
    "lifer": [
        "NN"
    ], 
    "Kroczek": [
        "NNP"
    ], 
    "Bacillus": [
        "NN", 
        "FW"
    ], 
    "high-profit": [
        "JJ"
    ], 
    "withstanding": [
        "VBG"
    ], 
    "Downgrades": [
        "NNS"
    ], 
    "filmmakers": [
        "NNS"
    ], 
    "gaited": [
        "JJ"
    ], 
    "X-tend": [
        "NN"
    ], 
    "Fall-in": [
        "NNP"
    ], 
    "Knee": [
        "NN"
    ], 
    "carryforwards": [
        "NNS"
    ], 
    "hardly": [
        "RB"
    ], 
    "Downgraded": [
        "VBN"
    ], 
    "WAO": [
        "NNP"
    ], 
    "Kortunov": [
        "NNP"
    ], 
    "product-line": [
        "NN"
    ], 
    "WAC": [
        "NNP"
    ], 
    "Wedged": [
        "VBN"
    ], 
    "stupendously": [
        "RB"
    ], 
    "Shevack": [
        "NNP"
    ], 
    "virutally": [
        "RB"
    ], 
    "WAZ": [
        "NNP"
    ], 
    "cresting": [
        "VBG"
    ], 
    "WAS": [
        "VBD"
    ], 
    "WAR": [
        "NNP", 
        "NN"
    ], 
    "paying": [
        "VBG", 
        "JJ"
    ], 
    "libelous": [
        "JJ"
    ], 
    "McLeod": [
        "NNP"
    ], 
    "postscript": [
        "NN"
    ], 
    "amend": [
        "VB", 
        "VBP"
    ], 
    "two-income": [
        "JJ", 
        "NN"
    ], 
    "explicitness": [
        "NN"
    ], 
    "Reservists": [
        "NNPS"
    ], 
    "straitjacketed": [
        "JJ"
    ], 
    "Someday": [
        "RB", 
        "NN"
    ], 
    "shrieks": [
        "NNS"
    ], 
    "Preseault": [
        "NNP"
    ], 
    "trackless": [
        "JJ"
    ], 
    "SS-24s": [
        "NNPS"
    ], 
    "heelers": [
        "NNS"
    ], 
    "snaking": [
        "VBG"
    ], 
    "Shingles": [
        "NNS"
    ], 
    "clutter": [
        "NN", 
        "VB"
    ], 
    "buy\\": [
        "JJ"
    ], 
    "ETHICS": [
        "NNS"
    ], 
    "Ozick": [
        "NNP"
    ], 
    "Alyce": [
        "NNP"
    ], 
    "volition": [
        "NN"
    ], 
    "helmet": [
        "NN"
    ], 
    "resentful": [
        "JJ"
    ], 
    "Generic-Drug": [
        "JJ"
    ], 
    "Cen-Tennial": [
        "NNP"
    ], 
    "alphabet": [
        "NN"
    ], 
    "unrolled": [
        "JJ"
    ], 
    "coarsely": [
        "RB"
    ], 
    "shifts": [
        "NNS", 
        "VBZ"
    ], 
    "Brotherhood": [
        "NNP"
    ], 
    "Beaverton": [
        "NNP"
    ], 
    "less-popular": [
        "JJ"
    ], 
    "Silver": [
        "NN", 
        "JJ", 
        "NNP"
    ], 
    "toweling": [
        "NN"
    ], 
    "Konowitch": [
        "NNP"
    ], 
    "Kevlar": [
        "NNP"
    ], 
    "libido": [
        "NN"
    ], 
    "booths": [
        "NNS"
    ], 
    "Pullmans": [
        "NNS"
    ], 
    "ninefold": [
        "JJ", 
        "RB"
    ], 
    "producers": [
        "NNS"
    ], 
    "Idle": [
        "JJ"
    ], 
    "half-staff": [
        "JJ"
    ], 
    "weaknesses": [
        "NNS"
    ], 
    "CANDIDATES": [
        "NNS"
    ], 
    "threaded": [
        "VBN"
    ], 
    "Struthers": [
        "NNP"
    ], 
    "insurgents.": [
        "NNS"
    ], 
    "Asset-management": [
        "JJ"
    ], 
    "Amazonia": [
        "NNP"
    ], 
    "Tigrean": [
        "JJ"
    ], 
    "C.O.G.": [
        "NNP"
    ], 
    "DAWDLING": [
        "NN"
    ], 
    "seventy-two": [
        "JJ"
    ], 
    "Byting": [
        "VBG"
    ], 
    "guided": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Krapp": [
        "NNP"
    ], 
    "pariah": [
        "NN"
    ], 
    "differentiation": [
        "NN"
    ], 
    "laser-read": [
        "JJ"
    ], 
    "guides": [
        "NNS", 
        "VBZ"
    ], 
    "Cowan": [
        "NNP"
    ], 
    "overlapped": [
        "VBN", 
        "VBD"
    ], 
    "assemblages": [
        "NNS"
    ], 
    "Tropicana": [
        "NNP"
    ], 
    "Dome": [
        "NNP"
    ], 
    "wall": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "handclasp": [
        "NN"
    ], 
    "Scores": [
        "NNS", 
        "NNPS"
    ], 
    "anti-profiteering": [
        "JJ"
    ], 
    "scheduled": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "POTABLES": [
        "NNS"
    ], 
    "loaned": [
        "VBN", 
        "VBD"
    ], 
    "Tale": [
        "NN", 
        "NNP"
    ], 
    "heterozygous": [
        "JJ"
    ], 
    "headroom": [
        "NN"
    ], 
    "coaxial": [
        "JJ"
    ], 
    "Crafts": [
        "NNPS"
    ], 
    "JVC": [
        "NNP"
    ], 
    "Tall": [
        "JJ"
    ], 
    "left-hand": [
        "JJ"
    ], 
    "sheared": [
        "JJ", 
        "VBN"
    ], 
    "unnerving": [
        "VBG", 
        "JJ"
    ], 
    "Sonatas": [
        "NNS", 
        "NNP"
    ], 
    "Asset-backed": [
        "JJ"
    ], 
    "tape-delay": [
        "NN"
    ], 
    "Revised": [
        "NNP", 
        "VBN"
    ], 
    "Finally": [
        "RB"
    ], 
    "Datatronic": [
        "NNP"
    ], 
    "irreproducibility": [
        "NN"
    ], 
    "arrays": [
        "NNS"
    ], 
    "junk-LBO": [
        "JJ"
    ], 
    "Something": [
        "NN", 
        "NNP"
    ], 
    "surgicenters": [
        "NNS"
    ], 
    "recalls": [
        "VBZ", 
        "NNS"
    ], 
    "Boasts": [
        "VBZ"
    ], 
    "outpaces": [
        "VBZ"
    ], 
    "mileage-based": [
        "JJ"
    ], 
    "Studds": [
        "NNP"
    ], 
    "Army": [
        "NNP", 
        "NN"
    ], 
    "fluttered": [
        "VBD"
    ], 
    "Roslev": [
        "NNP"
    ], 
    "Arms": [
        "NNP", 
        "NNPS", 
        "NNS"
    ], 
    "Brierley-controlled": [
        "JJ"
    ], 
    "Capote": [
        "NNP"
    ], 
    "outpaced": [
        "VBD", 
        "NN", 
        "VB", 
        "VBN", 
        "VBP"
    ], 
    "sociologists": [
        "NNS"
    ], 
    "tonally": [
        "RB"
    ], 
    "informant": [
        "NN"
    ], 
    "top-secret": [
        "JJ"
    ], 
    "adjuncts": [
        "NNS"
    ], 
    "floured": [
        "VBN"
    ], 
    "tintable": [
        "JJ"
    ], 
    "incidentals": [
        "NNS"
    ], 
    "Sacrifice": [
        "NN", 
        "NNP"
    ], 
    "already-tense": [
        "JJ"
    ], 
    "fusty": [
        "JJ"
    ], 
    "Ceil": [
        "NNP"
    ], 
    "colchicum": [
        "NN"
    ], 
    "nutty": [
        "JJ"
    ], 
    "Disc": [
        "NNP"
    ], 
    "compulsion": [
        "NN"
    ], 
    "quitting": [
        "VBG"
    ], 
    "calmed": [
        "VBD", 
        "VBN"
    ], 
    "Orchard": [
        "NNP"
    ], 
    "Wilmington": [
        "NNP", 
        "NN"
    ], 
    "communicate": [
        "VB", 
        "VBP"
    ], 
    "nudist": [
        "JJ"
    ], 
    "outreach": [
        "NN"
    ], 
    "Venetian": [
        "NNP", 
        "JJ"
    ], 
    "anti-Americanism": [
        "NN"
    ], 
    "Roch": [
        "NNP"
    ], 
    "calmer": [
        "JJR"
    ], 
    "Rock": [
        "NNP"
    ], 
    "flattest": [
        "JJS"
    ], 
    "Ramillies": [
        "NNP"
    ], 
    "writer\\/producers": [
        "NNS"
    ], 
    "on": [
        "IN", 
        "NNP", 
        "RBR", 
        "JJ", 
        "RB", 
        "RP"
    ], 
    "tear-filled": [
        "JJ"
    ], 
    "ol": [
        "JJ", 
        "NN", 
        "UH"
    ], 
    "demarcation": [
        "NN"
    ], 
    "oh": [
        "UH"
    ], 
    "of": [
        "IN", 
        "RB", 
        "RP", 
        "NNP"
    ], 
    "indestructibility": [
        "NN"
    ], 
    "reinforcing": [
        "VBG"
    ], 
    "Inverness": [
        "NNP"
    ], 
    "subdues": [
        "VBZ"
    ], 
    "oz": [
        "NN"
    ], 
    "ox": [
        "NN"
    ], 
    "os": [
        "NN"
    ], 
    "Souvanna": [
        "NNP"
    ], 
    "op": [
        "NNP", 
        "NN"
    ], 
    "amber": [
        "JJ", 
        "NN"
    ], 
    "Jordon": [
        "NNP"
    ], 
    "alarmism": [
        "NN"
    ], 
    "garnet": [
        "NN"
    ], 
    "Gebhard": [
        "NNP"
    ], 
    "Backers": [
        "NNS"
    ], 
    "garner": [
        "VB", 
        "VBP"
    ], 
    "bail-jumping": [
        "NN"
    ], 
    "accountants...": [
        ":"
    ], 
    "abrogate": [
        "VB"
    ], 
    "Aronson": [
        "NNP"
    ], 
    "Bowen": [
        "NNP"
    ], 
    "strictly": [
        "RB"
    ], 
    "Tailors": [
        "NNP"
    ], 
    "hazards": [
        "NNS"
    ], 
    "racism": [
        "NN"
    ], 
    "strict": [
        "JJ"
    ], 
    "racist": [
        "JJ", 
        "NN"
    ], 
    "Export-Import": [
        "NNP"
    ], 
    "flaunt-your-wealth": [
        "JJ"
    ], 
    "extolled": [
        "VBD"
    ], 
    "Hospital-Cornell": [
        "NNP"
    ], 
    "condone": [
        "VB"
    ], 
    "equated": [
        "VBN", 
        "VBD"
    ], 
    "Verses": [
        "NNS", 
        "NNPS"
    ], 
    "jua": [
        "FW"
    ], 
    "jug": [
        "NN"
    ], 
    "ABCs": [
        "NNS"
    ], 
    "idea": [
        "NN"
    ], 
    "soprano": [
        "NN", 
        "JJ"
    ], 
    "strenuous": [
        "JJ"
    ], 
    "rosebush": [
        "NN"
    ], 
    "subcontractors": [
        "NNS"
    ], 
    "Media-buying": [
        "NN"
    ], 
    "terminus": [
        "NN"
    ], 
    "applying": [
        "VBG"
    ], 
    "street-corner": [
        "JJ"
    ], 
    "pork-barrel": [
        "JJ", 
        "NN"
    ], 
    "gherkins": [
        "NNS"
    ], 
    "Joanna": [
        "NNP"
    ], 
    "bulb-making": [
        "JJ"
    ], 
    "anti-alcohol": [
        "JJ"
    ], 
    "five-hundred-year-old": [
        "JJ"
    ], 
    "Enemies": [
        "NNS"
    ], 
    "castles": [
        "NNS"
    ], 
    "south-of-the-border": [
        "JJ"
    ], 
    "politico": [
        "NN"
    ], 
    "Imelda": [
        "NNP"
    ], 
    "endearment": [
        "NN"
    ], 
    "Armenians": [
        "NNPS"
    ], 
    "x-There": [
        "EX", 
        "LS|EX"
    ], 
    "revamps": [
        "VBZ"
    ], 
    "lightly": [
        "RB"
    ], 
    "drawin": [
        "VBG"
    ], 
    "politics": [
        "NNS", 
        "NN"
    ], 
    "unteach": [
        "VB"
    ], 
    "beds": [
        "NNS"
    ], 
    "Pentagonese": [
        "NNP"
    ], 
    "bicycling": [
        "NN"
    ], 
    "Doman": [
        "NNP"
    ], 
    "Physicist": [
        "NNP"
    ], 
    "insurance": [
        "NN"
    ], 
    "Slides": [
        "NNS"
    ], 
    "Slider": [
        "NNP"
    ], 
    "hellfire": [
        "NN"
    ], 
    "unneeded": [
        "JJ"
    ], 
    "dismayed": [
        "VBN", 
        "JJ"
    ], 
    "auto-parts": [
        "JJ", 
        "NNS"
    ], 
    "ICI": [
        "NNP"
    ], 
    "Suffers": [
        "VBZ"
    ], 
    "ICN": [
        "NNP"
    ], 
    "ICM": [
        "NNP"
    ], 
    "superconductivity": [
        "NN"
    ], 
    "ICC": [
        "NNP"
    ], 
    "ICA": [
        "NNP"
    ], 
    "gunplay": [
        "NN"
    ], 
    "ICG": [
        "NNP"
    ], 
    "ICE": [
        "NNP"
    ], 
    "fetid": [
        "JJ"
    ], 
    "polyisocyanates": [
        "NNS"
    ], 
    "Franyo": [
        "NNP"
    ], 
    "Cromwellian": [
        "JJ"
    ], 
    "ICS": [
        "NNP"
    ], 
    "Cliffs": [
        "NNP", 
        "NNPS"
    ], 
    "unconstitutionally": [
        "RB"
    ], 
    "illusive": [
        "JJ"
    ], 
    "Caplan": [
        "NNP"
    ], 
    "Azlant": [
        "NNP"
    ], 
    "Surplus": [
        "NNP", 
        "JJ"
    ], 
    "Eminonu": [
        "NNP"
    ], 
    "Nurses": [
        "NNS"
    ], 
    "multimegaton": [
        "JJ"
    ], 
    "odds": [
        "NNS"
    ], 
    "telex": [
        "NN"
    ], 
    "unscathed": [
        "JJ"
    ], 
    "GATT": [
        "NNP"
    ], 
    "Likely": [
        "JJ", 
        "RB"
    ], 
    "rimmed": [
        "JJ", 
        "VBD"
    ], 
    "Primarily": [
        "RB"
    ], 
    "phlegm": [
        "NN"
    ], 
    "Fame": [
        "NNP", 
        "NN"
    ], 
    "Theoretically": [
        "RB"
    ], 
    "underutilized": [
        "VBN"
    ], 
    "migrated": [
        "VBN", 
        "VBD"
    ], 
    "Edison": [
        "NNP", 
        "NN"
    ], 
    "Japan-U.S": [
        "NNP"
    ], 
    "sluggers": [
        "NNS"
    ], 
    "Faint": [
        "JJ"
    ], 
    "Toto": [
        "NNP"
    ], 
    "Tots": [
        "NNP", 
        "NNPS"
    ], 
    "surgical": [
        "JJ"
    ], 
    "migrates": [
        "VBZ"
    ], 
    "unmoved": [
        "JJ"
    ], 
    "long-run": [
        "JJ"
    ], 
    "Hondius": [
        "NNP"
    ], 
    "longstrained": [
        "VBN"
    ], 
    "defaulters": [
        "NNS"
    ], 
    "Neo-Romanticism": [
        "NNP"
    ], 
    "Custodian": [
        "NNP"
    ], 
    "assuage": [
        "VB"
    ], 
    "incisiveness": [
        "NN"
    ], 
    "participants": [
        "NNS"
    ], 
    "diluting": [
        "VBG"
    ], 
    "Mirsky": [
        "NNP"
    ], 
    "program": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "depending": [
        "VBG"
    ], 
    "viz.": [
        "NN"
    ], 
    "presentation": [
        "NN"
    ], 
    "fill-in": [
        "JJ"
    ], 
    "positivists": [
        "NNS"
    ], 
    "woman": [
        "NN", 
        "VB"
    ], 
    "equivocal": [
        "JJ"
    ], 
    "sparkplugs": [
        "NNS"
    ], 
    "thin-lipped": [
        "JJ"
    ], 
    "induce": [
        "VB"
    ], 
    "Raeder": [
        "NNP"
    ], 
    "Classes": [
        "NNS", 
        "NN"
    ], 
    "Morvillo": [
        "NNP"
    ], 
    "soles": [
        "NNS"
    ], 
    "rebounds": [
        "VBZ", 
        "NNS"
    ], 
    "NPL": [
        "NNP"
    ], 
    "writing-instruments": [
        "JJ"
    ], 
    "wave-travel": [
        "JJ"
    ], 
    "unlike": [
        "IN", 
        "JJ", 
        "NN"
    ], 
    "Penang": [
        "NNP"
    ], 
    "sanctify": [
        "VB"
    ], 
    "grandfather": [
        "NN", 
        "VB"
    ], 
    "Aiding": [
        "NNP"
    ], 
    "Kolsrud": [
        "NNP"
    ], 
    "vibes": [
        "NNS"
    ], 
    "Motorcycle": [
        "NNP"
    ], 
    "Pearlstine": [
        "NNP"
    ], 
    "conflicted": [
        "VBD", 
        "VBN"
    ], 
    "coxcombs": [
        "NNS"
    ], 
    "Digate": [
        "NNP"
    ], 
    "manslaughter": [
        "NN"
    ], 
    "chimera-chasing": [
        "JJ"
    ], 
    "Oce-Van": [
        "NNP"
    ], 
    "rats": [
        "NNS"
    ], 
    "Thieme": [
        "NNP"
    ], 
    "Proudfoot": [
        "NNP"
    ], 
    "rate": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "anti-contamination": [
        "JJ"
    ], 
    "Initiation": [
        "NN"
    ], 
    "rata": [
        "FW", 
        "JJ", 
        "NN"
    ], 
    "CALLIOPE": [
        "NNP"
    ], 
    "surprise-filled": [
        "JJ"
    ], 
    "new-generation": [
        "NN"
    ], 
    "sutures": [
        "NNS"
    ], 
    "hesitation": [
        "NN"
    ], 
    "Headly": [
        "NNP"
    ], 
    "ophthalmologists": [
        "NNS"
    ], 
    "Betty": [
        "NNP"
    ], 
    "woodworking": [
        "NN"
    ], 
    "Eveready": [
        "NNP"
    ], 
    "barbecue": [
        "NN", 
        "VB"
    ], 
    "interlaced": [
        "VBN", 
        "JJ"
    ], 
    "guns": [
        "NNS", 
        "VBZ"
    ], 
    "prosaic": [
        "JJ"
    ], 
    "KISSINGER": [
        "NNP"
    ], 
    "eligibility": [
        "NN"
    ], 
    "LOAN": [
        "NNP", 
        "NN"
    ], 
    "Walitzee": [
        "NNP"
    ], 
    "overactive": [
        "JJ"
    ], 
    "Redeemer": [
        "NNP"
    ], 
    "retraining": [
        "NN", 
        "VBG"
    ], 
    "bullishly": [
        "RB"
    ], 
    "vice-presidents": [
        "NNS"
    ], 
    "Ogonyok": [
        "NNP"
    ], 
    "misinterpret": [
        "VB", 
        "VBP"
    ], 
    "caravans": [
        "NNS"
    ], 
    "ornithological": [
        "JJ"
    ], 
    "reincorporating": [
        "VBG"
    ], 
    "Accomplishments": [
        "NNS"
    ], 
    "sculptural": [
        "JJ"
    ], 
    "drunkards": [
        "NNS"
    ], 
    "Grayson": [
        "NNP"
    ], 
    "reshufflings": [
        "NNS"
    ], 
    "cookfire": [
        "NN"
    ], 
    "timber-state": [
        "JJ"
    ], 
    "thankfully": [
        "RB"
    ], 
    "Wendel": [
        "NNP"
    ], 
    "still-raging": [
        "VBG"
    ], 
    "should-be": [
        "JJ"
    ], 
    "controversialists": [
        "NNS"
    ], 
    "Wendee": [
        "NNP"
    ], 
    "Acres": [
        "NNP"
    ], 
    "screens": [
        "NNS", 
        "VBZ"
    ], 
    "impolitic": [
        "JJ"
    ], 
    "armoire": [
        "NN"
    ], 
    "major-league": [
        "JJ"
    ], 
    "feedings": [
        "NNS"
    ], 
    "Aspenstrom": [
        "NNP"
    ], 
    "Arctic": [
        "NNP", 
        "JJ"
    ], 
    "viscoelastic": [
        "JJ"
    ], 
    "forisque": [
        "FW"
    ], 
    "tarpaulin": [
        "NN"
    ], 
    "interception": [
        "NN"
    ], 
    "piggyback": [
        "NN", 
        "VB"
    ], 
    "inlay": [
        "NN"
    ], 
    "Pardus": [
        "NNP"
    ], 
    "Katangans": [
        "NNPS"
    ], 
    "converters": [
        "NNS"
    ], 
    "Intek": [
        "NNP"
    ], 
    "seismograph": [
        "NN"
    ], 
    "Intel": [
        "NNP"
    ], 
    "CNCA": [
        "NNP"
    ], 
    "golly": [
        "UH"
    ], 
    "drips": [
        "VBZ"
    ], 
    "Intensification": [
        "NN"
    ], 
    "draughts": [
        "NN", 
        "NNS"
    ], 
    "Inns": [
        "NNPS"
    ], 
    "Aden": [
        "NNP"
    ], 
    "Inter": [
        "NNP"
    ], 
    "draughty": [
        "JJ"
    ], 
    "end-of-school": [
        "JJ"
    ], 
    "eventuality": [
        "NN"
    ], 
    "debates": [
        "NNS", 
        "VBZ"
    ], 
    "bystanders": [
        "NNS"
    ], 
    "Expanding": [
        "VBG"
    ], 
    "equation": [
        "NN"
    ], 
    "policemen": [
        "NNS"
    ], 
    "recast": [
        "VB"
    ], 
    "debated": [
        "VBN", 
        "VBD"
    ], 
    "exposure-time": [
        "NN"
    ], 
    "Wade": [
        "NNP"
    ], 
    "ROUGH": [
        "JJ"
    ], 
    "bugaboos": [
        "NNS"
    ], 
    "Wada": [
        "NNP"
    ], 
    "evangelicals": [
        "NNS"
    ], 
    "matchmaking": [
        "NN"
    ], 
    "dweller": [
        "NN"
    ], 
    "Baa-2": [
        "JJ", 
        "NNP"
    ], 
    "Baa-3": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "cosmological": [
        "JJ"
    ], 
    "Baa-1": [
        "JJ", 
        "NNP", 
        "NN"
    ], 
    "Intergraph": [
        "NNP"
    ], 
    "sitcom": [
        "NN"
    ], 
    "Rainey": [
        "NNP"
    ], 
    "arise": [
        "VB", 
        "VBP"
    ], 
    "cultivate": [
        "VB"
    ], 
    "anti-monopoly": [
        "JJ"
    ], 
    "offspring": [
        "NN", 
        "NNS"
    ], 
    "Arps": [
        "NNP"
    ], 
    "packaged-goods": [
        "NNS", 
        "JJ"
    ], 
    "transduction": [
        "NN"
    ], 
    "HomeCare": [
        "NNP"
    ], 
    "chip-making": [
        "NN"
    ], 
    "desperation": [
        "NN"
    ], 
    "Bonus": [
        "NNP"
    ], 
    "highest-rated": [
        "JJ"
    ], 
    "cleansing": [
        "NN", 
        "VBG"
    ], 
    "motels": [
        "NNS"
    ], 
    "nitwits": [
        "NNS"
    ], 
    "Tufts": [
        "NNP"
    ], 
    "cytokine": [
        "NN|JJ"
    ], 
    "draw-down": [
        "NN"
    ], 
    "record-high": [
        "JJ"
    ], 
    "emulate": [
        "VB"
    ], 
    "Pointers": [
        "NNS"
    ], 
    "Atkisson": [
        "NNP"
    ], 
    "Laue": [
        "NNP"
    ], 
    "corkscrew": [
        "NN"
    ], 
    "Laux": [
        "NNP"
    ], 
    "indomitable": [
        "JJ"
    ], 
    "Perluss": [
        "NNP"
    ], 
    "capitalize": [
        "VB"
    ], 
    "rotund": [
        "JJ"
    ], 
    "WTVJ": [
        "NNP"
    ], 
    "Davises": [
        "NNPS"
    ], 
    "Everyone": [
        "NN", 
        "NNP"
    ], 
    "Whittenburg": [
        "NNP"
    ], 
    "automobiles": [
        "NNS"
    ], 
    "export-bound": [
        "JJ"
    ], 
    "strutting": [
        "VBG", 
        "JJ"
    ], 
    "specifying": [
        "VBG"
    ], 
    "agnostics": [
        "NNS"
    ], 
    "State-financed": [
        "JJ"
    ], 
    "rentals": [
        "NNS"
    ], 
    "Linus": [
        "NNP"
    ], 
    "unhip": [
        "JJ"
    ], 
    "Siepi": [
        "NNP"
    ], 
    "schillings": [
        "NNS"
    ], 
    "McN": [
        "NNP"
    ], 
    "sloop": [
        "NN"
    ], 
    "Interesting": [
        "JJ"
    ], 
    "anachronistically": [
        "RB"
    ], 
    "Brazos": [
        "NNP"
    ], 
    "trackage": [
        "NN"
    ], 
    "underwhelmed": [
        "VBN"
    ], 
    "Anglo-Jewish": [
        "JJ"
    ], 
    "paunchy": [
        "JJ"
    ], 
    "concentric": [
        "JJ"
    ], 
    "Arias": [
        "NNP"
    ], 
    "Smithfield": [
        "NNP"
    ], 
    "Zhaoxing": [
        "NNP"
    ], 
    "utilizes": [
        "VBZ"
    ], 
    "Lindner": [
        "NNP"
    ], 
    "sky-reaching": [
        "JJ"
    ], 
    "Ohira": [
        "NNP"
    ], 
    "Fitzhugh": [
        "NNP"
    ], 
    "glide": [
        "VB", 
        "VBP"
    ], 
    "environmentalist": [
        "NN", 
        "JJ"
    ], 
    "Carnegie": [
        "NNP"
    ], 
    "environmentalism": [
        "NN"
    ], 
    "nonproductive": [
        "JJ"
    ], 
    "deficit-ridden": [
        "JJ"
    ], 
    "muddied": [
        "VBN", 
        "JJ"
    ], 
    "khaki-bound": [
        "JJ"
    ], 
    "fully-diluted": [
        "JJ"
    ], 
    "Karol": [
        "NN"
    ], 
    "Bandar": [
        "NNP"
    ], 
    "speechless": [
        "JJ"
    ], 
    "units": [
        "NNS"
    ], 
    "evaded": [
        "VBN", 
        "VBD"
    ], 
    "Tualatin": [
        "NNP"
    ], 
    "playthings": [
        "NNS"
    ], 
    "Karos": [
        "NNP"
    ], 
    "bigger": [
        "JJR", 
        "RBR"
    ], 
    "Amadou-Mahtar": [
        "NNP"
    ], 
    "CORNFELD": [
        "NNP"
    ], 
    "non-automotive": [
        "JJ"
    ], 
    "Masons": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "utilized": [
        "VBN", 
        "VBD"
    ], 
    "cantonment": [
        "NN"
    ], 
    "Scottish": [
        "NNP", 
        "JJ"
    ], 
    "short-sellers": [
        "NNS"
    ], 
    "nab": [
        "VB"
    ], 
    "aspens": [
        "NNS"
    ], 
    "Display": [
        "NN", 
        "VB"
    ], 
    "Lobar": [
        "NNP"
    ], 
    "Militant": [
        "JJ"
    ], 
    "modernized": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "knock-out": [
        "JJ"
    ], 
    "Rhea": [
        "NNP"
    ], 
    "Donor": [
        "NN"
    ], 
    "seditious": [
        "JJ"
    ], 
    "Chaplin-like": [
        "JJ"
    ], 
    "sexism": [
        "NN"
    ], 
    "waste-energy": [
        "NN"
    ], 
    "marketplaces": [
        "NNS"
    ], 
    "Third": [
        "NNP", 
        "JJ", 
        "LS", 
        "RB"
    ], 
    "disbelieved": [
        "VBD"
    ], 
    "at-market": [
        "JJ"
    ], 
    "insignificances": [
        "NNS"
    ], 
    "Samuel": [
        "NNP"
    ], 
    "pasted-in": [
        "JJ"
    ], 
    "puckering": [
        "VBG"
    ], 
    "Nightly": [
        "NNP"
    ], 
    "PHONE": [
        "NNP"
    ], 
    "Wazir": [
        "NNP"
    ], 
    "paradise": [
        "NN"
    ], 
    "postponements": [
        "NNS"
    ], 
    "base-stealing": [
        "JJ"
    ], 
    "evader": [
        "NN"
    ], 
    "Deane": [
        "NNP"
    ], 
    "hailing": [
        "VBG"
    ], 
    "boldness": [
        "NN"
    ], 
    "Malt": [
        "NNP"
    ], 
    "gut": [
        "NN", 
        "VB"
    ], 
    "experimenting": [
        "VBG"
    ], 
    "Doolittle": [
        "NNP"
    ], 
    "Year-round": [
        "RB"
    ], 
    "Deans": [
        "NNP", 
        "NNS"
    ], 
    "Mali": [
        "NNP"
    ], 
    "attendant": [
        "NN", 
        "JJ"
    ], 
    "Male": [
        "JJ", 
        "NN", 
        "NNP"
    ], 
    "Bloch": [
        "NNP"
    ], 
    "Block": [
        "NNP", 
        "NN"
    ], 
    "uprising": [
        "NN"
    ], 
    "fiat": [
        "NN"
    ], 
    "Addicts": [
        "NNS"
    ], 
    "coaches": [
        "NNS"
    ], 
    "Rachelle": [
        "NNP"
    ], 
    "soil-bearing": [
        "JJ"
    ], 
    "THIEVES": [
        "NNS"
    ], 
    "high-horsepower": [
        "JJ"
    ], 
    "turne": [
        "VB"
    ], 
    "solidly": [
        "RB"
    ], 
    "unhealthy": [
        "JJ"
    ], 
    "four-sided": [
        "JJ"
    ], 
    "Mendoza": [
        "NNP"
    ], 
    "Bethle": [
        "NN"
    ], 
    "rankles": [
        "VBZ"
    ], 
    "SUSPECT": [
        "JJ"
    ], 
    "defects": [
        "NNS"
    ], 
    "Refsum": [
        "NNP"
    ], 
    "pedal": [
        "VB", 
        "NN"
    ], 
    "Drugstore": [
        "NNP", 
        "NN"
    ], 
    "whale": [
        "NN"
    ], 
    "overrode": [
        "VBD"
    ], 
    "moan": [
        "VB"
    ], 
    "utilization": [
        "NN"
    ], 
    "edginess": [
        "NN"
    ], 
    "rails": [
        "NNS", 
        "VBZ"
    ], 
    "collar": [
        "NN", 
        "VB"
    ], 
    "prescient": [
        "JJ"
    ], 
    "Cummings": [
        "NNP"
    ], 
    "Newer": [
        "JJR"
    ], 
    "reverence": [
        "NN"
    ], 
    "moat": [
        "NN"
    ], 
    "unchecked": [
        "JJ"
    ], 
    "frustrated...": [
        ":"
    ], 
    "Viewers": [
        "NNS"
    ], 
    "Cinzano": [
        "NNP"
    ], 
    "Crabs": [
        "NNP"
    ], 
    "pains": [
        "NNS"
    ], 
    "SINCE": [
        "IN"
    ], 
    "public-opinion": [
        "JJ", 
        "NN"
    ], 
    "Ottawa": [
        "NNP", 
        "NN"
    ], 
    "Arcilla": [
        "NNP"
    ], 
    "rustlings": [
        "NNS"
    ], 
    "Crabb": [
        "NNP"
    ], 
    "ferment": [
        "NN"
    ], 
    "Plumbing": [
        "NNP"
    ], 
    "Montedision": [
        "NN"
    ], 
    "punters": [
        "NNS"
    ], 
    "compartment": [
        "NN"
    ], 
    "Nux": [
        "NN"
    ], 
    "Whosoever": [
        "NN"
    ], 
    "vial": [
        "NN"
    ], 
    "Nut": [
        "NNP"
    ], 
    "NOVA": [
        "NNP"
    ], 
    "and\\/or": [
        "NN"
    ], 
    "Delvin": [
        "NNP"
    ], 
    "gangling": [
        "JJ"
    ], 
    "undiplomatic": [
        "JJ"
    ], 
    "populating": [
        "VBG"
    ], 
    "executioner": [
        "NN"
    ], 
    "mismanaged": [
        "VBD"
    ], 
    "Oliver": [
        "NNP"
    ], 
    "asham": [
        "JJ"
    ], 
    "Olivet": [
        "NNP"
    ], 
    "outstanding": [
        "JJ"
    ], 
    "Longhorns": [
        "NNP"
    ], 
    "second-look": [
        "JJ"
    ], 
    "delisted": [
        "VBN", 
        "VBD"
    ], 
    "Beryl": [
        "NNP"
    ], 
    "MURDER": [
        "NN"
    ], 
    "flight-to-quality": [
        "JJ", 
        "NN"
    ], 
    "Quiney": [
        "NNP"
    ], 
    "hexagonal": [
        "JJ"
    ], 
    "semiliterate": [
        "JJ"
    ], 
    "Masillon": [
        "NNP"
    ], 
    "Cayman": [
        "NNP"
    ], 
    "interferes": [
        "VBZ"
    ], 
    "DiIulio": [
        "NNP"
    ], 
    "lackadaisical": [
        "JJ"
    ], 
    "four-person": [
        "JJ"
    ], 
    "empirically": [
        "RB"
    ], 
    "Drexel": [
        "NNP", 
        "NN"
    ], 
    "chairman": [
        "NN"
    ], 
    "Parsifal": [
        "NNP", 
        "JJ"
    ], 
    "Swede": [
        "NN"
    ], 
    "interfered": [
        "VBD", 
        "VBN"
    ], 
    "foreman": [
        "NN"
    ], 
    "Helpline": [
        "NNP"
    ], 
    "Internaional": [
        "NNP"
    ], 
    "rapist": [
        "NN"
    ], 
    "reckon": [
        "VBP", 
        "VB"
    ], 
    "pillage": [
        "VB", 
        "NN"
    ], 
    "measures": [
        "NNS", 
        "VBZ"
    ], 
    "shimming": [
        "NN"
    ], 
    "reunited": [
        "VBN"
    ], 
    "eight-and-a-half-foot": [
        "JJ"
    ], 
    "SOFTWARE": [
        "NNP"
    ], 
    "Paddock": [
        "NNP"
    ], 
    "measured": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Pieta": [
        "NNP"
    ], 
    "queasily": [
        "RB"
    ], 
    "grams": [
        "NNS"
    ], 
    "time-hotels": [
        "NNS"
    ], 
    "Zen": [
        "NNP"
    ], 
    "Zel": [
        "NNP"
    ], 
    "dissolved": [
        "VBN", 
        "VBD"
    ], 
    "aquifers": [
        "NNS"
    ], 
    "pigeonholing": [
        "NN"
    ], 
    "Gloversville": [
        "NNP"
    ], 
    "Zey": [
        "PRP"
    ], 
    "Perfect": [
        "JJ", 
        "NNP"
    ], 
    "link-ups": [
        "NNS"
    ], 
    "asphalt": [
        "NN", 
        "JJ"
    ], 
    "Knill": [
        "NNP"
    ], 
    "ballplayer": [
        "NN"
    ], 
    "Walters-Donaldson": [
        "NNP"
    ], 
    "Majority": [
        "NNP"
    ], 
    "Genome": [
        "NNP"
    ], 
    "melody": [
        "NN"
    ], 
    "costing": [
        "VBG", 
        "NN"
    ], 
    "oil-leasing": [
        "NN"
    ], 
    "Alexeyeva": [
        "NNP"
    ], 
    "aggravate": [
        "VBP", 
        "VB"
    ], 
    "nevertheless": [
        "RB"
    ], 
    "Instructors": [
        "NNS"
    ], 
    "Troyes": [
        "NNP"
    ], 
    "penalty": [
        "NN"
    ], 
    "Conaway": [
        "NNP"
    ], 
    "Whitby": [
        "NNP"
    ], 
    "Democratization": [
        "NN"
    ], 
    "Kandinsky": [
        "NNP"
    ], 
    "Courcy": [
        "NNP"
    ], 
    "ILA": [
        "NNP"
    ], 
    "counterpoint": [
        "NN"
    ], 
    "aficionado": [
        "NN"
    ], 
    "furnaces": [
        "NNS"
    ], 
    "revered": [
        "VBN", 
        "JJ"
    ], 
    "MiG-23BN": [
        "NN"
    ], 
    "procrastination": [
        "NN"
    ], 
    "Epicurean": [
        "JJ"
    ], 
    "compliments": [
        "NNS"
    ], 
    "Kaddurah-Daouk": [
        "NNP"
    ], 
    "oaks": [
        "NNS"
    ], 
    "non-edible": [
        "JJ"
    ], 
    "crime-busting": [
        "JJ"
    ], 
    "PHH": [
        "NNP"
    ], 
    "keenest": [
        "JJS"
    ], 
    "imponderables": [
        "NNS"
    ], 
    "activity": [
        "NN"
    ], 
    "PHS": [
        "NNP"
    ], 
    "dizziness": [
        "NN"
    ], 
    "paradoxical": [
        "JJ"
    ], 
    "consciously": [
        "RB"
    ], 
    "loveliness": [
        "NN"
    ], 
    "SHORT": [
        "JJ", 
        "NNP"
    ], 
    "martyrdom": [
        "NN"
    ], 
    "Parkersburg": [
        "NNP"
    ], 
    "upsurge": [
        "NN"
    ], 
    "X-rated": [
        "JJ"
    ], 
    "Urielites": [
        "NNPS"
    ], 
    "Homemakers": [
        "NNP"
    ], 
    "Derails": [
        "NNS"
    ], 
    "Boniface": [
        "NNP"
    ], 
    "security-services": [
        "NN"
    ], 
    "efficacious": [
        "JJ"
    ], 
    "move-up": [
        "JJ"
    ], 
    "nailed": [
        "VBN", 
        "VBD"
    ], 
    "Cutrer": [
        "NNP"
    ], 
    "slapped": [
        "VBD", 
        "VBN"
    ], 
    "Codevilla": [
        "NNP"
    ], 
    "Jubal": [
        "NNP"
    ], 
    "incentive-reduced": [
        "JJ"
    ], 
    "Colmer": [
        "NNP"
    ], 
    "Hyannis": [
        "NNP"
    ], 
    "orbiting": [
        "VBG"
    ], 
    "C.D.": [
        "NNP"
    ], 
    "cancelling": [
        "VBG"
    ], 
    "Principal-only": [
        "JJ"
    ], 
    "Outline": [
        "NN"
    ], 
    "Ednie": [
        "NNP"
    ], 
    "days.": [
        "NNS", 
        "NN"
    ], 
    "Janus": [
        "NNP"
    ], 
    "succeed": [
        "VB", 
        "VBP"
    ], 
    "Ignition": [
        "NN"
    ], 
    "venturers": [
        "NNS"
    ], 
    "ciliates": [
        "NNS"
    ], 
    "Willetts": [
        "NNP"
    ], 
    "orchardists": [
        "NNS"
    ], 
    "license": [
        "NN", 
        "VBP", 
        "VB"
    ], 
    "Oxley": [
        "NNP"
    ], 
    "MHz": [
        "NNS"
    ], 
    "Christianson": [
        "NNP"
    ], 
    "Priscilla": [
        "NNP"
    ], 
    "Non-Smokers": [
        "NNP"
    ], 
    "sojourners": [
        "NNS"
    ], 
    "duplicity": [
        "NN"
    ], 
    "breastworks": [
        "NNS"
    ], 
    "vehicle-production": [
        "JJ"
    ], 
    "ARMs": [
        "NNS", 
        "NN"
    ], 
    "off-balance": [
        "JJ"
    ], 
    "whelk": [
        "NN"
    ], 
    "slots": [
        "NNS"
    ], 
    "Mountain-Hi": [
        "NNP"
    ], 
    "Snook": [
        "NNP"
    ], 
    "bolster": [
        "VB", 
        "VBP", 
        "NN"
    ], 
    "Filippo": [
        "NNP"
    ], 
    "Co-op": [
        "NN", 
        "NNP"
    ], 
    "Zomax": [
        "NNP"
    ], 
    "illumined": [
        "VBD"
    ], 
    "apprehensively": [
        "RB"
    ], 
    "pinpoints": [
        "NNS"
    ], 
    "confabulation": [
        "NN"
    ], 
    "Revson": [
        "NNP"
    ], 
    "armory": [
        "NN"
    ], 
    "brick": [
        "NN"
    ], 
    "illumines": [
        "VBZ"
    ], 
    "yielding-Mediterranian-woman": [
        "JJ"
    ], 
    "sending": [
        "VBG", 
        "NN"
    ], 
    "quintet": [
        "NN"
    ], 
    "Blanton": [
        "NNP"
    ], 
    "vaguely": [
        "RB"
    ], 
    "Pioneers": [
        "NNPS", 
        "NNS"
    ], 
    "infuriation": [
        "NN"
    ], 
    "Suitors": [
        "NNS"
    ], 
    "R.L.": [
        "NNP"
    ], 
    "obsessive-compulsive": [
        "JJ"
    ], 
    "corrode": [
        "VBP", 
        "VB"
    ], 
    "employer-provided": [
        "JJ"
    ], 
    "Reily": [
        "NNP"
    ], 
    "parachutes": [
        "NNS"
    ], 
    "tweaking": [
        "VBG", 
        "NN"
    ], 
    "bebop": [
        "NN"
    ], 
    "Kobe": [
        "NNP"
    ], 
    "Shannon": [
        "NNP"
    ], 
    "welding": [
        "NN", 
        "VBG"
    ], 
    "QUOTABLE": [
        "JJ"
    ], 
    "Sumitomo": [
        "NNP"
    ], 
    "Edmonia": [
        "NN"
    ], 
    "Jones-Imboden": [
        "NNP"
    ], 
    "interlacing": [
        "VBG"
    ], 
    "leans": [
        "VBZ"
    ], 
    "vacuumed": [
        "VBD"
    ], 
    "Izaak": [
        "NNP"
    ], 
    "computer-driven": [
        "JJ"
    ], 
    "inspirationally": [
        "RB"
    ], 
    "Jellinek": [
        "NNP"
    ], 
    "OKC": [
        "NNP"
    ], 
    "Idaho-based": [
        "JJ"
    ], 
    "India-born": [
        "JJ"
    ], 
    "sliver": [
        "NN"
    ], 
    "tradedistorting": [
        "JJ"
    ], 
    "arrives": [
        "VBZ"
    ], 
    "Southmark": [
        "NNP"
    ], 
    "wallops": [
        "VBZ"
    ], 
    "Hanford": [
        "NNP"
    ], 
    "Manzoni": [
        "NNP"
    ], 
    "world-commerce": [
        "JJ"
    ], 
    "Prokofieff": [
        "NNP"
    ], 
    "domains": [
        "NNS"
    ], 
    "arrived": [
        "VBD", 
        "VBN"
    ], 
    "Generalissimo": [
        "NNP"
    ], 
    "government-bond": [
        "NN", 
        "JJ"
    ], 
    "Bookies": [
        "NNS"
    ], 
    "undersubscription": [
        "NN"
    ], 
    "robust": [
        "JJ"
    ], 
    "lower": [
        "JJR", 
        "RBR", 
        "VBP", 
        "JJ", 
        "RB", 
        "VB"
    ], 
    "Backe": [
        "NNP"
    ], 
    "equalled": [
        "VBN"
    ], 
    "sumac": [
        "NN"
    ], 
    "persuasive": [
        "JJ"
    ], 
    "bounces": [
        "VBZ", 
        "NNS"
    ], 
    "anybody": [
        "NN"
    ], 
    "Rubeli": [
        "NNP"
    ], 
    "deliverable": [
        "JJ"
    ], 
    "Starkey": [
        "NNP"
    ], 
    "Terrace": [
        "NNP"
    ], 
    "bounced": [
        "VBD", 
        "VBN"
    ], 
    "Broxodent": [
        "NNP"
    ], 
    "data-recording": [
        "NN"
    ], 
    "grievance": [
        "NN"
    ], 
    "precedence": [
        "NN"
    ], 
    "Semmes": [
        "NNP"
    ], 
    "Handmade": [
        "NNP"
    ], 
    "competitive": [
        "JJ"
    ], 
    "mountaineering": [
        "NN"
    ], 
    "inactive": [
        "JJ"
    ], 
    "Suspicion": [
        "NN"
    ], 
    "Poindexter": [
        "NNP"
    ], 
    "margarine": [
        "NN"
    ], 
    "Scripture": [
        "NNP", 
        "NN"
    ], 
    "export-boosting": [
        "JJ"
    ], 
    "pin-curl": [
        "JJ"
    ], 
    "Freida": [
        "NNP"
    ], 
    "advisers": [
        "NNS"
    ], 
    "rowed": [
        "VBD"
    ], 
    "exclusively": [
        "RB"
    ], 
    "exhibition": [
        "NN"
    ], 
    "rocklike": [
        "JJ"
    ], 
    "Filed": [
        "VBN"
    ], 
    "Estancieros": [
        "NNS"
    ], 
    "Visker": [
        "NNP"
    ], 
    "civilizational": [
        "JJ"
    ], 
    "Criminologists": [
        "NNS"
    ], 
    "grapeshot": [
        "NN"
    ], 
    "Baranovichi": [
        "NNP"
    ], 
    "Daihatsu": [
        "NNP"
    ], 
    "Definitely": [
        "RB"
    ], 
    "unwomanly": [
        "RB"
    ], 
    "alkylarysulfonate": [
        "NN"
    ], 
    "Carrie": [
        "NNP"
    ], 
    "jots": [
        "VBZ"
    ], 
    "Kenny": [
        "NNP"
    ], 
    "Salida": [
        "NNP"
    ], 
    "citizen-sparked": [
        "JJ"
    ], 
    "flabbergasted": [
        "JJ", 
        "VBN"
    ], 
    "Stellar": [
        "NNP"
    ], 
    "Bertelsmann": [
        "NNP"
    ], 
    "Aventine": [
        "NNP"
    ], 
    "McMaster": [
        "NNP"
    ], 
    "anti-smokers": [
        "NNS"
    ], 
    "social-issue": [
        "JJ"
    ], 
    "less-than-successful": [
        "JJ"
    ], 
    "folders": [
        "NNS"
    ], 
    "tiefes": [
        "FW"
    ], 
    "ecology": [
        "NN"
    ], 
    "piglet": [
        "NN"
    ], 
    "aciduria": [
        "NN"
    ], 
    "denigration": [
        "NN"
    ], 
    "streaming": [
        "VBG"
    ], 
    "president\\/product": [
        "NN"
    ], 
    "BRNF": [
        "NNP"
    ], 
    "grenades": [
        "NNS"
    ], 
    "newsletter": [
        "NN"
    ], 
    "bellyfull": [
        "NN"
    ], 
    "snake-rail": [
        "JJ"
    ], 
    "bushy-tailed": [
        "JJ"
    ], 
    "capos": [
        "NNS"
    ], 
    "Philippine-studies": [
        "NN"
    ], 
    "tampers": [
        "NNS"
    ], 
    "Raoul-Duval": [
        "NNP"
    ], 
    "Lawsuit": [
        "NNP"
    ], 
    "Tarnopol": [
        "NNP"
    ], 
    "Guar": [
        "JJ"
    ], 
    "jumpy": [
        "JJ"
    ], 
    "beleaguered": [
        "JJ", 
        "VBN"
    ], 
    "graining": [
        "NN"
    ], 
    "jumps": [
        "NNS", 
        "VBZ"
    ], 
    "Harriton": [
        "NNP"
    ], 
    "Arragon": [
        "NNP"
    ], 
    "juju": [
        "NN"
    ], 
    "Altimari": [
        "NNP"
    ], 
    "Payton": [
        "NNP"
    ], 
    "powerplants": [
        "NNS"
    ], 
    "Procedural": [
        "JJ"
    ], 
    "Decries": [
        "VBZ"
    ], 
    "volunteering": [
        "VBG", 
        "NN"
    ], 
    "ordeal": [
        "NN"
    ], 
    "Kimsong": [
        "NNP"
    ], 
    "Bovine": [
        "NNP"
    ], 
    "dune-grass": [
        "NN"
    ], 
    "acquistion": [
        "NN"
    ], 
    "repulsion": [
        "NN"
    ], 
    "Essex": [
        "NNP"
    ], 
    "huffed": [
        "VBD"
    ], 
    "arside": [
        "NN"
    ], 
    "Subsystems": [
        "NNS"
    ], 
    "Skopas": [
        "NNP"
    ], 
    "Bears": [
        "NNPS", 
        "NNP", 
        "NNS"
    ], 
    "deafness": [
        "NN"
    ], 
    "mustached": [
        "JJ"
    ], 
    "holster": [
        "NN"
    ], 
    "mustaches": [
        "NNS"
    ], 
    "centrality": [
        "NN"
    ], 
    "Hillsdown": [
        "NNP"
    ], 
    "Beare": [
        "NNP"
    ], 
    "Beard": [
        "NNP"
    ], 
    "hope...": [
        ":"
    ], 
    "introverted": [
        "VBN", 
        "JJ"
    ], 
    "tumble": [
        "NN", 
        "VB"
    ], 
    "creaked": [
        "VBD"
    ], 
    "Every": [
        "DT"
    ], 
    "oddities": [
        "NNS"
    ], 
    "mountains": [
        "NNS"
    ], 
    "RICOing": [
        "NN"
    ], 
    "Gainesville": [
        "NNP"
    ], 
    "potassium": [
        "NN"
    ], 
    "Gautier": [
        "NNP"
    ], 
    "Boy-Marquita": [
        "NNP"
    ], 
    "taxpayer-related": [
        "JJ"
    ], 
    "Grenada": [
        "NNP"
    ], 
    "deployed": [
        "VBN", 
        "VBD"
    ], 
    "Load": [
        "NN"
    ], 
    "McNabb": [
        "NNP"
    ], 
    "Perdido": [
        "NNP"
    ], 
    "higher-profit": [
        "JJR", 
        "JJ"
    ], 
    "drinkers": [
        "NNS"
    ], 
    "Harrity": [
        "NNP"
    ], 
    "Loan": [
        "NNP", 
        "NN"
    ], 
    "geneticists": [
        "NNS"
    ], 
    "stalking": [
        "VBG", 
        "VBG|NN"
    ], 
    "N.R.": [
        "NNP"
    ], 
    "ingrates": [
        "NNS"
    ], 
    "Elan": [
        "NNP"
    ], 
    "dazzlingly": [
        "RB"
    ], 
    "more-conventional": [
        "JJR"
    ], 
    "sunnier": [
        "JJR"
    ], 
    "LBOs": [
        "NNS", 
        "NNPS", 
        "NNP"
    ], 
    "beguiling": [
        "JJ"
    ], 
    "saturate": [
        "VB"
    ], 
    "associated": [
        "VBN", 
        "VBD", 
        "JJ"
    ], 
    "Calenda": [
        "NNP"
    ], 
    "management-consultant": [
        "NN"
    ], 
    "Management\\": [
        "JJ"
    ], 
    "Underground": [
        "JJ"
    ], 
    "associates": [
        "NNS", 
        "VBZ"
    ], 
    "Singh": [
        "NNP"
    ], 
    "Bagatelles": [
        "NNPS"
    ], 
    "laser-type": [
        "JJ"
    ], 
    "Amstrad": [
        "NNP"
    ], 
    "inequities": [
        "NNS"
    ], 
    "AIDS-prevention": [
        "JJ"
    ], 
    "visualization": [
        "NN"
    ], 
    "income": [
        "NN"
    ], 
    "Recently": [
        "RB"
    ], 
    "Laguna": [
        "NNP"
    ], 
    "pennant": [
        "NN"
    ], 
    "Elected": [
        "VBN"
    ], 
    "jackboots": [
        "NNS"
    ], 
    "develops": [
        "VBZ"
    ], 
    "truth-in-lending": [
        "NN"
    ], 
    "Laughing": [
        "NNP"
    ], 
    "flirtation": [
        "NN"
    ], 
    "weigh": [
        "VB", 
        "VBP"
    ], 
    "Making": [
        "VBG", 
        "NNP"
    ], 
    "halfback": [
        "NN"
    ], 
    "Criminal-defense": [
        "NN"
    ], 
    "Extractor": [
        "NN"
    ], 
    "Letterman": [
        "NNP"
    ], 
    "Andean": [
        "JJ", 
        "NNP"
    ], 
    "potters": [
        "NNS"
    ], 
    "non-enforcement": [
        "JJ"
    ], 
    "bills-measures": [
        "JJ"
    ], 
    "weights": [
        "NNS", 
        "VBZ"
    ], 
    "pyre": [
        "NN"
    ], 
    "Mach": [
        "NN"
    ], 
    "carved": [
        "VBN", 
        "JJ", 
        "VBD"
    ], 
    "proximate": [
        "JJ"
    ], 
    "pervert": [
        "NN"
    ], 
    "Natrona": [
        "NNP"
    ], 
    "B-cell": [
        "NN"
    ], 
    "Cranes": [
        "NNPS", 
        "NNS"
    ], 
    "Panamanian": [
        "JJ", 
        "NNP"
    ], 
    "high-blood-pressure": [
        "JJ"
    ], 
    "computer-service": [
        "JJ"
    ], 
    "motor-car": [
        "NN"
    ], 
    "whiskeys``": [
        "``"
    ], 
    "J.D.": [
        "NNP"
    ], 
    "timberland": [
        "NN"
    ], 
    "long-bodied": [
        "JJ"
    ], 
    "Launching": [
        "VBG"
    ], 
    "Dodge": [
        "NNP"
    ], 
    "Shere": [
        "NNP"
    ], 
    "Hazlett": [
        "NNP"
    ], 
    "disposal": [
        "NN"
    ], 
    "deterministic": [
        "JJ"
    ], 
    "Duclos": [
        "NNP"
    ], 
    "Jovian": [
        "JJ"
    ], 
    "half-gourd": [
        "NN"
    ], 
    "Sarason": [
        "NNP"
    ], 
    "stable": [
        "JJ", 
        "NN"
    ], 
    "Buyer": [
        "NNP"
    ], 
    "Odyssey": [
        "NNP", 
        "NN"
    ], 
    "Mort": [
        "NNP"
    ], 
    "Brassnose": [
        "NNP"
    ], 
    "overlaps": [
        "VBZ"
    ], 
    "Superintendents": [
        "NNS"
    ], 
    "talons": [
        "NNS"
    ], 
    "much-publicized": [
        "JJ"
    ], 
    "reinterpret": [
        "VB"
    ], 
    "electron": [
        "NN"
    ], 
    "bounding": [
        "VBG"
    ], 
    "drinking": [
        "NN", 
        "JJ", 
        "VBG"
    ], 
    "materialism": [
        "NN"
    ], 
    "physiognomy": [
        "NN"
    ], 
    "incoherent": [
        "JJ"
    ], 
    "off-price": [
        "JJ"
    ], 
    "cloud-flecked": [
        "JJ"
    ], 
    "reappearing": [
        "VBG"
    ], 
    "three-judge": [
        "JJ"
    ], 
    "alltime": [
        "NN"
    ], 
    "Zealand-dollar": [
        "NN"
    ], 
    "synthetic-leather": [
        "JJ"
    ], 
    "Silbert": [
        "NNP"
    ], 
    "Waymouth": [
        "NNP"
    ], 
    "Newgate": [
        "NNP"
    ], 
    "State": [
        "NNP", 
        "NNS", 
        "NN"
    ], 
    "Atorino": [
        "NNP"
    ], 
    "anti-Catholicism": [
        "NN"
    ], 
    "Fung": [
        "NNP"
    ], 
    "paleness": [
        "NN"
    ], 
    "Maryland": [
        "NNP", 
        "NN"
    ], 
    "Two-Stem": [
        "JJ"
    ], 
    "checkers": [
        "NNS"
    ], 
    "microanalysis": [
        "NN"
    ], 
    "frankfurters": [
        "NNS"
    ], 
    "radar-eluding": [
        "VBG", 
        "NNP", 
        "JJ"
    ], 
    "outlasted": [
        "VBD"
    ], 
    "colorization": [
        "NN"
    ], 
    "Simmon": [
        "NNP"
    ], 
    "garishness": [
        "NN"
    ], 
    "Henderson": [
        "NNP"
    ], 
    "mutual-aid": [
        "JJ"
    ], 
    "Airports": [
        "NNP", 
        "NNS"
    ], 
    "gaily": [
        "RB"
    ], 
    "Shantz": [
        "NNP"
    ], 
    "Light": [
        "NNP", 
        "JJ", 
        "NN", 
        "VB"
    ], 
    "pushing": [
        "VBG", 
        "JJ", 
        "NN"
    ], 
    "slated": [
        "VBN", 
        "VBD"
    ], 
    "swirled": [
        "VBD"
    ], 
    "MAINTENANCE": [
        "NNP"
    ], 
    "Stat.": [
        "NNP", 
        "NN"
    ], 
    "confiscating": [
        "VBG"
    ], 
    "Job-Bias": [
        "JJ"
    ], 
    "vividness": [
        "NN"
    ], 
    "Maddalena": [
        "NNP"
    ], 
    "low-sugar": [
        "JJ"
    ], 
    "sob-wallow": [
        "NN"
    ], 
    "Yalagaloo": [
        "UH"
    ], 
    "ELDERLY": [
        "JJ"
    ], 
    "Ismaili": [
        "NNP"
    ], 
    "grants-in-aid": [
        "NN"
    ], 
    "warnings": [
        "NNS"
    ], 
    "nervous": [
        "JJ"
    ], 
    "Eckhardt": [
        "NNP"
    ], 
    "Amicable": [
        "NNP"
    ], 
    "payoffs": [
        "NNS"
    ], 
    "reds": [
        "NNS"
    ], 
    "examinations": [
        "NNS"
    ], 
    "slinging": [
        "VBG"
    ], 
    "preferred-stock": [
        "JJ", 
        "NN"
    ], 
    "Treat": [
        "VB", 
        "NN"
    ], 
    "redo": [
        "VB"
    ], 
    "Jergens": [
        "NNP"
    ], 
    "Rafales": [
        "NNPS"
    ], 
    "rackety": [
        "JJ"
    ], 
    "Ernie": [
        "NNP"
    ], 
    "Treasury-bond": [
        "JJ"
    ], 
    "No-Tobacco": [
        "NNP"
    ], 
    "rackets": [
        "NNS"
    ], 
    "MX-missile": [
        "NN"
    ], 
    "Erling": [
        "NNP"
    ], 
    "Pyrrhic": [
        "JJ"
    ], 
    "Andreotti": [
        "NNP"
    ], 
    "Sunda": [
        "NNP"
    ], 
    "Intervenes": [
        "VBZ"
    ], 
    "Count": [
        "NNP", 
        "VBP", 
        "VB"
    ], 
    "by-passed": [
        "VBN"
    ], 
    "Rodriquez": [
        "NNP"
    ], 
    "Chuck": [
        "NNP", 
        "VB"
    ], 
    "pale-blue": [
        "JJ"
    ], 
    "Exclaimed": [
        "VBD"
    ], 
    "Trains": [
        "NNS"
    ], 
    "distractedly": [
        "RB"
    ], 
    "by-passes": [
        "VBZ"
    ], 
    "flabbiness": [
        "NN"
    ], 
    "weighting": [
        "NN"
    ], 
    "Taiwanese": [
        "JJ", 
        "NNP", 
        "NNPS"
    ], 
    "carbon-dioxide": [
        "NN"
    ], 
    "Balcor": [
        "NNP"
    ], 
    "amethystine": [
        "JJ"
    ], 
    "lumber": [
        "NN", 
        "VBP"
    ], 
    "Ptolemaists": [
        "NNS"
    ], 
    "purports": [
        "VBZ"
    ], 
    "befits": [
        "VBZ"
    ], 
    "Mollica": [
        "NNP"
    ], 
    "Jewboy": [
        "NN"
    ], 
    "spying": [
        "VBG", 
        "NN"
    ], 
    "Feature": [
        "NNP"
    ], 
    "mega-problems": [
        "NNS"
    ], 
    "complaisance": [
        "NN"
    ], 
    "villain": [
        "NN"
    ], 
    "carrot": [
        "NN"
    ], 
    "something": [
        "NN"
    ], 
    "hemlines": [
        "NNS"
    ], 
    "B70": [
        "NN"
    ], 
    "summers": [
        "NNS"
    ], 
    "one-branch": [
        "JJ"
    ], 
    "decaying": [
        "VBG", 
        "JJ"
    ], 
    "Pilgrm": [
        "NNP"
    ], 
    "Aldermen": [
        "NNS"
    ], 
    "buoyant": [
        "JJ"
    ], 
    "prognosis": [
        "NN"
    ], 
    "lamechians": [
        "NNS"
    ], 
    "unites": [
        "VBZ"
    ], 
    "gear-box": [
        "NN"
    ], 
    "Shows": [
        "NNS", 
        "VBZ"
    ], 
    "Patriarchy": [
        "NNP"
    ], 
    "tension": [
        "NN"
    ], 
    "Assn": [
        "NNP"
    ], 
    "cupboard": [
        "NN"
    ], 
    "Snellville": [
        "NNP"
    ], 
    "Philo": [
        "NNP"
    ], 
    "Bairnco": [
        "NNP"
    ], 
    "masks": [
        "NNS"
    ], 
    "Gummi-Werke": [
        "NNP"
    ], 
    "Complying": [
        "VBG"
    ], 
    "cheaper": [
        "JJR", 
        "RBR"
    ], 
    "readiness": [
        "NN"
    ], 
    "Bouchard": [
        "NNP"
    ], 
    "Moonan": [
        "NNP"
    ], 
    "straps": [
        "NNS"
    ], 
    "ferret": [
        "VB", 
        "NN"
    ], 
    "Stubblefield": [
        "NNP"
    ], 
    "co-hero": [
        "NN"
    ], 
    "batter": [
        "NN", 
        "VB"
    ], 
    "martini": [
        "NN"
    ], 
    "parsonage": [
        "NN"
    ], 
    "spreads": [
        "VBZ", 
        "NNS"
    ], 
        "JJ", 