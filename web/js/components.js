
var wsUrl = "https://support.lsdsoftware.com:30112";

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
  this.title = null;
}

function Footer() {
}

function ItemList() {
}

function  SourcesPage() {
  this.loadSources = function() {
    var lang = this.lang;
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper", function(result) {
        fulfill(result.filter(function(source) {return source.lang == lang}).map(function(source) {return source.name}))
      });
    })
  }
  this.speak = function(voiceEngine, sources) {
    if (sources) {
      var speech = sources.map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      //voiceEngine.speak(speech)
    }
  }
}

function TopicsPage() {
  this.loadSource = function(sourceIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex, function(result) {
        fulfill({
          name: result.name,
          topics: result.topics.map(function(topic) {return topic.name})
        })
      });
    })
  }
  this.speak = function(voiceEngine, topics) {
    if (topics) {
      var speech = topics.map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      //voiceEngine.speak(speech)
    }
  }
}

function ArticlesPage() {
  this.loadTopic = function(sourceIndex, topicIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex + "/" + topicIndex, function(result) {
        fulfill({
          name: result.name,
          articles: result.articles.map(function(article) {
            if (article.source) return article.source + " - " + article.title;
            else return article.title;
          })
        })
      });
    })
  }
  this.speak = function(voiceEngine, topic) {
    if (topic) {
      var speech = [topic.name + '.'].concat(topic.articles.map(addNumbering).map(addPeriod));
      console.log(speech);
      voiceEngine.speak(speech)
    }
  }
}

function ReadingPage(viewRoot) {
  this.loadArticle = function(sourceIndex, topicIndex, articleIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex + "/" + topicIndex + "/" + articleIndex, fulfill);
    })
  }
  this.speak = function(voiceEngine, article) {
    if (article) {
      var speech = [article.title].concat(article.texts);
      console.log(speech);
      voiceEngine.speak(speech)
    }
  }
  this.onSelect = function(index, article) {
    switch (index) {
      case 0:
        $(viewRoot).triggerHandler('next-article');
        break;
      case 1:
        window.open(article.link, "_blank");
        break;
    }
  }
}
