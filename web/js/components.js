
var wsUrl = "https://support.lsdsoftware.com:30112";

$("<div/>").load("components.html", function() {
  $(this).children("[data-class]").each(function() {
    var className = $(this).data("class");
    if (!window[className]) throw new Error("Missing class " + className);
    dataBinder.views[className] = {template: this, controller: window[className]};
  })
});

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
        fulfill(result.map(function(source, index) {
          return {value: index, text: source.name, visible: source.lang == lang};
        })
        .filter(function(item) {
          return item.visible;
        }));
      });
    })
  }
  this.speak = function(voiceEngine, sources) {
    if (sources) {
      var speech = sources.map(function(s) {return s.text}).map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      //voiceEngine.speak(speech)
    }
  }
}

function TopicsPage() {
  this.sources = {};
  this.loadSource = function(sourceIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex, function(result) {
        fulfill({
          name: result.name,
          topics: result.topics.map(function(topic, index) {
            return {value: index, text: topic.name};
          })
        })
      });
    })
  }
  this.speak = function(voiceEngine, topics) {
    if (topics) {
      var speech = topics.map(function(t) {return t.text}).map(addNumbering).map(addPeriod).join("\n");
      console.log(speech);
      //voiceEngine.speak(speech)
    }
  }
}

function ArticlesPage() {
  this.topics = {};
  this.loadTopic = function(sourceIndex, topicIndex) {
    return new Promise(function(fulfill) {
      $.get(wsUrl + "/news-scraper/" + sourceIndex + "/" + topicIndex, function(result) {
        fulfill({
          name: result.name,
          articles: result.articles.map(function(article, index) {
            return {
              value: index,
              text: article.source ? (article.source + " - " + article.title) : article.title
            };
          })
        })
      });
    })
  }
  this.speak = function(voiceEngine, topic) {
    if (topic) {
      var speech = [topic.name + '.'].concat(topic.articles.map(function(a) {return a.text}).map(addNumbering).map(addPeriod));
      console.log(speech);
      voiceEngine.speak(speech)
    }
  }
}

function ReadingPage(viewRoot) {
  this.articles = {};
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
  this.onSelect = function(cmd, article) {
    switch (cmd) {
      case 'next-article':
        $(viewRoot).triggerHandler('next-article');
        break;
      case 'view-original':
        window.open(article.link, "_blank");
        break;
    }
  }
}
