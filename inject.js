var badWords = ['fuck', 'dick', 'faggot', 'penis', 'pussy', 'orgasm', 'cum', 'sexy', 'sex', 'part']
var animal = ['money']

function changeTextColor(keyword) {
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

function unchangeTextColor() {
    let keyword = this.textContent;
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

function hideWords(json){
    console.log('Hiding:' + badWords)
    for (let s of badWords) {
        changeTextColor(s);
    }
    if (json) {
        console.log('Hiding:' + json)
        for (let r of json){
            changeTextColor(r)
        }
    }
}



document.addEventListener('scroll', function(){
    var offset = window.pageYOffset
    console.log('Scolling' + offset + 'px')
    if (offset%5 == 0){
        var fulltext = document.body.innerText
        var modifiedtext = fulltext.replace(/[^\w]/g, " ");
        console.log('Current content: ' + modifiedtext)
        //hideWords(["badWordsFromNLP"])

        var url = "https://trollshield-n7eh3uinzq-uc.a.run.app"
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', 'url', true); //第二步：打开连接/***发送json格式文件必须设置请求头 ；如下 - */
        httpRequest.setRequestHeader("Content-type","application/json");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）var obj = { name: 'zhansgan', age: 18 };
        httpRequest.send(JSON.stringify(modifiedtext));//发送请求 将json写入send中
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            console.log('Status:' + httpRequest.status)
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                var json = httpRequest.responseText;//获取到服务端返回的数据
                console.log('--------------------successful receive response------------------'+json);
                hideWords(json)
            }
        };

        

        // var myJSONObject = {"text": modifiedtext}
        // var request = ({
        //       url: "https://6191873441928b001769009c.mockapi.io/:endpoint",
        //       method: "POST",
        //       json: true,   // <--Very important!!!
        //       body: myJSONObject
        //   }, function (error, response, body){
        //       return response.text()
        //       console.log('----Response----:'+response);
        //       hideWords(response)
              
        //   });
    }
})

//Initial trigger on 
hideWords(null)
