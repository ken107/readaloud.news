
var wsUrl = "http://app.diepkhuc.com:30112";

function addNumbering(item, index) {
  return (index +1) + ". " + item;
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
        fulfill(result.filter(function(source) {return source.lang == "vi"}).map(function(source) {return source.name}))
      });
    })
  }
  this.speak = function(voiceEngine, sources) {
    if (sources) {
      var speech = 'Mến chào bạn đến với tin 10h.\n\nXin chọn một trong các nguồn tin sau đây:\n' + sources.map(addNumbering).map(addPeriod).join('\n');
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
    else {
      voiceEngine.cancel();
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
      var speech = 'Xin chọn một trong các chủ đề sau đây:\n' + topics.map(addNumbering).map(addPeriod).join('\n');
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
    else {
      voiceEngine.cancel();
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
      var speech = 'Chủ đề ' + topic.name + ':\n' + topic.articles.map(addNumbering).map(addPeriod).join('\n');
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
    else {
      voiceEngine.cancel();
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
      var speech = addPeriod(article.title) + '\n\n' + article.texts.map(addPeriod).join('\n\n');
      console.log(speech);
      voiceEngine.speak(speech, 'Vietnamese Male')
    }
    else {
      voiceEngine.cancel();
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
