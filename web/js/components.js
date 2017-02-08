
var wsUrl = "http://app.diepkhuc.com:30112";

function addNumbering(item, index) {
  return (index +1) + ": " + item;
}

function addPeriod(item) {
  item = item.trim();
  if (!/[!?.,;:]$/.test(item)) item += ".";
  return item;
}

function ProgressInd() {
}

function Header() {
}

function Footer() {
}

function ItemList() {
}

function  SourcesPage() {
  this.loadSources = function() {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper", function(result) {
        fulfill(result.filter(function(source) {return source.lang == "en"}).map(function(source) {return source.name}))
      });
    })
  }
  this.speak = function(voiceEngine, sources) {
    if (sources) {
      var speech = 'Welcome to Read Aloud News.\n\nPlease select a news source.\n' + sources.map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
  }
}

function TopicsPage() {
  this.loadSource = function(sourceIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex, function(result) {
        fulfill(result.topics.map(function(topic) {return topic.name}))
      });
    })
  }
  this.speak = function(voiceEngine, topics) {
    if (topics) {
      var speech = 'Select a topic.\n' + topics.map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
  }
}

function ArticlesPage() {
  this.loadTopic = function(sourceIndex, topicIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex + "/" + topicIndex, function(result) {
        fulfill({
          name: result.name,
          articles: result.articles.map(function(article) {return article.title})
        })
      });
    })
  }
  this.speak = function(voiceEngine, topic) {
    if (topic) {
      var speech = ['Topic ' + topic.name + '.'].concat(topic.articles.map(addNumbering).map(addPeriod));
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
  }
}

function ReadingPage() {
  this.loadArticle = function(sourceIndex, topicIndex, articleIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex + "/" + topicIndex + "/" + articleIndex, fulfill);
    })
  }
  this.speak = function(voiceEngine, article) {
    if (article) {
      var speech = [article.title].concat(article.texts);
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
  }
  this.onSelect = function(index, article) {
    switch (index) {
      case 0:
        location.href = '#/reading/' + this.sourceIndex + '/' + this.topicIndex + '/' + (Number(this.articleIndex) +1);
        break;
      case 1:
        window.open(article.link, "_blank");
        break;
    }
  }
}
