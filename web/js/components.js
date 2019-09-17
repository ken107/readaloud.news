
var wsUrl = "https://service.lsdsoftware.com/news-scraper";

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
      $.post({
        url: wsUrl,
        contentType: "application/json",
        data: JSON.stringify({
          method: "listSources"
        }),
        dataType: "json",
        success: fulfill
      })
    })
    .then(function(result) {
      return result
        .map(function(source, index) {
          return {value: index, text: source.name, visible: source.lang == lang};
        })
        .filter(function(item) {
          return item.visible;
        })
    })
  }
  this.getSpeech = function(sources) {
    return sources && sources.map(function(s) {return s.text}).map(addNumbering).map(addPeriod);
  }
}

function TopicsPage() {
  this.sources = {};
  this.loadSource = function(sourceIndex) {
    return new Promise(function(fulfill) {
      $.post({
        url: wsUrl,
        contentType: "application/json",
        data: JSON.stringify({
          method: "getSource",
          sourceIndex: sourceIndex
        }),
        dataType: "json",
        success: fulfill
      })
    })
    .then(function(result) {
      return {
        name: result.name,
        topics: result.topics.map(function(topic, index) {
          return {value: index, text: topic.name};
        })
      }
    })
  }
  this.getSpeech = function(topics) {
    return topics && topics.map(function(t) {return t.text}).map(addNumbering).map(addPeriod);
  }
}

function ArticlesPage() {
  this.topics = {};
  this.loadTopic = function(sourceIndex, topicIndex) {
    return new Promise(function(fulfill) {
      $.post({
        url: wsUrl,
        contentType: "application/json",
        data: JSON.stringify({
          method: "getTopic",
          sourceIndex: sourceIndex,
          topicIndex: topicIndex
        }),
        dataType: "json",
        success: fulfill
      })
    })
    .then(function(result) {
      return {
        name: result.name,
        articles: result.articles.map(function(article, index) {
          return {
            value: index,
            text: article.source ? (article.source + " - " + article.title) : article.title
          };
        })
      }
    })
  }
  this.getSpeech = function(topic) {
    return topic && [topic.name + '.'].concat(topic.articles.map(function(a) {return a.text}).map(addNumbering).map(addPeriod));
  }
}

function ReadingPage(viewRoot) {
  this.articles = {};
  this.loadArticle = function(sourceIndex, topicIndex, articleIndex) {
    return new Promise(function(fulfill) {
      $.post({
        url: wsUrl,
        contentType: "application/json",
        data: JSON.stringify({
          method: "getArticle",
          sourceIndex: sourceIndex,
          topicIndex: topicIndex,
          articleIndex: articleIndex
        }),
        dataType: "json",
        success: fulfill
      })
    })
  }
  this.getSpeech = function(article) {
    return article && [article.title].concat(article.texts);
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
