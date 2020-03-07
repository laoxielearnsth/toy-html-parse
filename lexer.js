"use strict";
// <tag> </tag> <tag /> <tag> 一共四种种类的标签，起始标签，结束标签，自闭合，自闭合不带/
// 属性不能出现在结束标签里
// <tag key="value"> <tag key> <tag key='value'> key不带value则默认为true，k-v必须连着写

class HTMLLexicalParser{
    constructor(html) {
        this.state = this.start;
        this.tokens = [];
        this.token = null;
        this.html = html ? html : '';
    }

    parse() {
        for (let c of this.html) {
            this.state(c);
        }
        return this.tokens;
    }

    start(c) {
        if (c === "<") {
            return this.state = this.tagOpen
        }
        if (c === ">") {
            return this.error();
        }
        if (/[\t\n\f ]/.test(c)) {
            return this.state = this.start;
        }
        this.token = new Text();
        this.token.value = c;
        return this.state = this.getText;
    }

    getText(c) {
        if (c === "<") {
            this.emitToken(this.token);
            return this.state = this.tagOpen;
        }
        if (c === ">") {
            return this.error();
        }
        this.token.value += c;
        return this.state = this.getText;
    }

    tagOpen(c) {
        if (c === "/") {
            return this.state = this.endTagOpen;
        }
        if (/[a-zA-Z]/.test(c)) {
            this.token = new StartTag();
            this.token.name = c.toLowerCase();
            this.token.attrs = {};
            return this.state = this.tagName;
        }
        return error(c);
    }

    endTagOpen(c) {
        if (/[a-zA-Z]/.test(c)) {
            this.token = new EndTag();
            this.token.name = c.toLowerCase();
            return this.state = this.endTagName;
        }
        if (c === ">") {
            return this.error(c);
        }
    }

    tagName(c) {
        if (/[a-zA-Z]/.test(c)) {
            this.token.name += c.toLowerCase();
            return this.state = this.tagName;
        }
        if (c === "/") {
            return this.state = this.selfCloseingTag;
        }
        if (c === ">") {
            this.emitToken(this.token);
            return this.state = this.start;
        }
        if (/[\t\n\f ]/.test(c)) {
            return this.state = this.waitForAttrs;
        }
    }

    waitForAttrs(c) {
        if (/[ \t\f\n]/.test(c)) {
            return this.state = this.waitForAttrs;
        }
        if (/[a-zA-Z]/.test(c)) {
            this.attrs = new Attribute();
            this.attrs.name = c.toLowerCase();
            this.attrs.value = '';
            return this.state = this.attrName;
        }
        if (c === ">") {
            this.emitToken(this.token);
            return this.state = this.start;
        }
        if (c === "/") {
            return this.state = this.selfCloseingTag;
        }
        return this.error(c);
    }

    attrName(c) {
        if (/[a-zA-Z]/.test(c)) {
            this.attrs.name += c;
            return this.state = this.attrName;
        }
        if (c === "=") {
            return this.state = this.beforeAttrVal;
        }
        if (c === " ") {
            this.attrs.value = true;
            this.token.attrs[this.attrs.name] = this.attrs.value;
            return this.state = this.waitForAttrs;
        }
        return this.error(c);
    }

    beforeAttrVal(c) {
        if (c === "'") {
            return this.state = this.attributeValueSingleQuoted;
        }
        if (c === '"') {
            return this.state = this.attributeValueDoubleQuoted;
        }
        return this.error(c);
    }

    attributeValueSingleQuoted(c) {
        if (c === "'") {
            this.token.attrs[this.attrs.name] = this.attrs.value;
            return this.state = this.waitForAttrs;
        }
        this.attrs.value += c;
        return this.state=this.attributeValueSingleQuoted;
    }

    attributeValueDoubleQuoted(c) {
        if (c === '"') {
            this.token.attrs[this.attrs.name] = this.attrs.value;
            return this.state = this.waitForAttrs;
        }
        this.attrs.value += c;
        return this.state = this.attributeValueDoubleQuoted;
    }

    endTagName(c) {
        if (/[a-zA-Z]/.test(c)) {
            this.token.name += c.toLowerCase();
            return this.state = this.endTagName;
        }
        if (c === ">") {
            this.emitToken(this.token);
            return this.state = this.start;
        }
        return this.error(c);
    }

    selfCloseingTag(c) {
        if (c === ">") {
            console.log(this.token);
            this.emitToken(this.token);
            let endToken = new EndTag();
            endToken.name = this.token.name;
            this.emitToken(endToken);
            return this.state = this.start;
        }
    }

    emitToken(token) {
        this.tokens.push(token);
    }

    error(c) {
        console.warn(`unexpect char ${c}`);
    }
}

export class StartTag {}

export class EndTag {}

export class Attribute {}

export class Text {}

export default HTMLLexicalParser;
