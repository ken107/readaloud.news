
function Speech(texts, options) {
  var self = this;
  var index = 0;
  var speechlet;
  if (options.hack) texts = textBreaker.breakTexts(texts, options.spchletMaxLen);

  this.play = play;
  this.pause = pause;
  this.isActive = false;

  function play() {
    return pause()
      .then(function() {
        if (index < texts.length) {
          speechlet = new Speechlet(texts[index], function() {index++; play()}, options.hack ? 16*1000 : 0);
          self.isActive = true;
          return speechlet.speak();
        }
        else {
          if (options.onEnd) options.onEnd();
        }
      })
  }

  function pause() {
    if (speechlet) {
      var promise = speechlet.stop();
      speechlet = null;
      self.isActive = false;
      return promise;
    }
    else return Promise.resolve();
  }
}


function Speechlet(text, onComplete, timeout) {
  var timer = 0;
  var interrupted = false;
  var utterance = new SpeechSynthesisUtterance(text);

  utterance.onend = function() {
    clearTimeout(timer);
    if (!interrupted) onComplete();
  };

  this.speak = function() {
    return new Promise(function(fulfill) {
      utterance.onstart = fulfill;
      if (timeout) timer = setTimeout(speechSynthesis.cancel, timeout);
      speechSynthesis.speak(utterance);
    })
  };

  this.stop = function() {
    clearTimeout(timer);
    interrupted = true;
    speechSynthesis.cancel();
    return Promise.resolve();
  };
}


var textBreaker = new function() {
  this.breakTexts = breakTexts;

  function breakTexts(texts, wordLimit) {
    return [].concat.apply([], texts.map(function(text) {
      return breakText(text, wordLimit);
    }));
  }

  function breakText(text, wordLimit) {
    return merge(getSentences(text), wordLimit, breakSentence);
  }

  function breakSentence(sentence, wordLimit) {
    return merge(getPhrases(sentence), wordLimit, breakPhrase);
  }

  function breakPhrase(phrase, wordLimit) {
    var words = getWords(phrase);
    var splitPoint = Math.min(Math.ceil(words.length/2), wordLimit);
    var result = [];
    while (words.length) {
      result.push(words.slice(0, splitPoint).join(""));
      words = words.slice(splitPoint);
    }
    return result;
  }

  function merge(parts, wordLimit, breakPart) {
    var result = [];
    var group = {parts: [], wordCount: 0};
    var flush = function() {
      if (group.parts.length) {
        result.push(group.parts.join(""));
        group = {parts: [], wordCount: 0};
      }
    };
    parts.forEach(function(part) {
      var wordCount = getWords(part).length;
      if (wordCount > wordLimit) {
        flush();
        var subParts = breakPart(part, wordLimit);
        for (var i=0; i<subParts.length; i++) result.push(subParts[i]);
      }
      else {
        if (group.wordCount + wordCount > wordLimit) flush();
        group.parts.push(part);
        group.wordCount += wordCount;
      }
    });
    flush();
    return result;
  }

  function getSentences(text) {
    var tokens = text.split(/([.!?]+\s)/);
    var result = [];
    for (var i=0; i<tokens.length; i+=2) {
      if (i+1 < tokens.length) result.push(tokens[i] + tokens[i+1]);
      else result.push(tokens[i]);
    }
    return result;
  }

  function getPhrases(sentence) {
    var tokens = sentence.split(/([,;:]\s|\s-+\s|—)/);
    var result = [];
    for (var i=0; i<tokens.length; i+=2) {
      if (i+1 < tokens.length) result.push(tokens[i] + tokens[i+1]);
      else result.push(tokens[i]);
    }
    return result;
  }

  function getWords(sentence) {
    var tokens = sentence.trim().split(/([~@#%^*_+=<>]|[\s\-—/]+|\.(?=\w{2,})|,(?=[0-9]))/);
    var result = [];
    for (var i=0; i<tokens.length; i+=2) {
      if (tokens[i]) result.push(tokens[i]);
      if (i+1 < tokens.length) {
        if (/^[~@#%^*_+=<>]$/.test(tokens[i+1])) result.push(tokens[i+1]);
        else if (result.length) result[result.length-1] += tokens[i+1];
      }
    }
    return result;
  }
}
