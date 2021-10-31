let badWords = ['fuck', 'dick', 'faggot', 'penis', 'pussy', 'orgasm', 'cum', 'sexy', 'sex']
let animal = ['money']

function getCurrentTab(callback) {
  let queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0].id);
  });
}

function changeTextColor(keyword) {
  function script(keyword) {
    let regex = new RegExp(String(keyword).replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'), 'igu'),
        temp,
        nodes = [],
        walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while (true) {
      temp = walker.nextNode();
      if (!temp) break;
      nodes.push(temp);
    }

    for (let node of nodes) {
      let nodeText = node.nodeValue,
          offset = 0,
          current;

      while (true) {
        current = regex.exec(nodeText);
        if (!current) break;
        let pos1 = current.index,
            pos2 = regex.lastIndex,
            first = node.splitText(pos1 - offset),
            second = first.splitText(pos2 - pos1),
            mark = document.createElement('mark');
            mark.style.backgroundColor = 'grey';
            mark.style.color = 'grey';
            // For unchangeTextColor()
            mark.setAttribute("data-highlightee", keyword.toLowerCase());

        node.parentNode.insertBefore(mark, second);
        mark.appendChild(first);
        node = second;
        offset = pos2;
      }
    }
  }

  chrome.tabs.executeScript({
    code: `(${script})(${JSON.stringify(keyword)});`
  });
}

function unchangeTextColor() {
  let keyword = this.textContent;
  function script(keyword) {
    let regex = new RegExp(String(keyword).replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'), 'igu'),
          temp,
          nodes = [],
          walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);

    while (true) {
      temp = walker.nextNode();
      if (!temp) break;
      nodes.push(temp);
    }

    for (let node of nodes) {
      if (node.tagName === "MARK" && node.getAttribute("data-highlightee") === keyword.toLowerCase()) {
        while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
        node.parentNode.removeChild(node);
      }
    }
    document.body.normalize();
  }


  chrome.tabs.executeScript({
    code: `(${script})(${JSON.stringify(keyword)})`
  });
}

function getChangedTexts(tab, callback) {
  let tabs = localStorage.getItem('tabs') || '{}';
  callback(JSON.parse(tabs));
}

function saveTextColor(tab, texts) {
  getChangedTexts(tab, function(tabs) {
    tabs[tab] = texts;
    localStorage.setItem('tabs', JSON.stringify(tabs));
  });
}

document.addEventListener('DOMContentLoaded', function() {
  let textbox = document.getElementById("keyword");
  textbox.focus();
  textbox.select();
  getCurrentTab(function(tab) {
    getChangedTexts(tab, function(tabs) {
      let keywords = tabs[tab] || [];

      function createNewLi(keyword) {
        let newLi = document.createElement("li");
        newLi.textContent = keyword;
        document.getElementById("keyword_list").appendChild(newLi);
        newLi.addEventListener("click", unchangeTextColor.bind(newLi));
        newLi.addEventListener("click", function() {
          newLi.parentNode.removeChild(newLi);
          keywords.splice(keywords.indexOf(keyword), 1);
          saveTextColor(tab, keywords);
        });
      }

      for (let key of keywords) {
        createNewLi(key);
      }

      document.getElementById("highlight_form").addEventListener("submit", function(event) {
        event.preventDefault();
        let text = document.getElementById("keyword").value;
        if (!text) return;
        changeTextColor(text);
        createNewLi(text);
        keywords.push(text);
        saveTextColor(tab, keywords);
      });
    });
  });
});

for (let s of badWords) {
  changeTextColor(s);
}
