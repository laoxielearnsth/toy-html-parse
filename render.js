import HTMLLexicalParser from "./lexer.js";
import {Text, StartTag, EndTag} from "./lexer.js";
import DOMTree from "./DOMTree.js";

let html = `<header>
    <nav>
        <ul>
            <li>首页</li>
            <li>dashboard</li>
            <li>个人中心</li>
            <li>退出登录</li>
        </ul>
    </nav>
</header><main>
    <p>
        this is a p
    </p>
    <img src="./wenwen.jpeg" alt="呜呜呜">
</main><footer>
    <address>
        mail: xie5997231@gmail.com<br>
        address: Futian,Shenzhen,Guangdong,China
    </address>
</footer>`;
// 简化一下,将多个空格替换成单个空格
html = html.replace(/[\s\n\r ]+/g, " ");

let p = new HTMLLexicalParser(html);

let tokens = p.parse();

const root = new DOMTree('div');

//利用栈来存储结构。
let stack = [root];

let current = stack[stack.length - 1];

// startTag进栈，EndTag出栈，假设没有错误。
for (let item of tokens) {
    if (item instanceof StartTag) {
        let el = new DOMTree(item.name, item.attrs, []);
        current.children.push(el);
        // 处理一些 自闭合 但是不带/的标签
        if (item.name === "br" || item.name === "img") {
            // do nothing
        } else {
            stack.push(el);
        }
    } else if (item instanceof EndTag) {
        stack.pop();
    } else if (item instanceof Text) {
        current.children.push(item.value);
    }
    current = stack[stack.length - 1];
}

let app = document.getElementById("app");
app.appendChild(root.render());
