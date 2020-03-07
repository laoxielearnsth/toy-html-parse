class DOMTree{
    constructor(tagName, props, children) {
        this.tagName = tagName;
        this.props = props || {};
        this.children = children || [];
    }

    render(){
        let el = document.createElement(this.tagName);
        let props = this.props;
        for (let prop in props) {
            try {
                el.setAttribute(prop, props[prop]);
            } catch (e) {
                console.log(e);
            }
        }
        this.children.forEach((child) => {
            let childEl = child instanceof DOMTree ? child.render() : document.createTextNode(child);
            el.appendChild(childEl);
        });
        return el;
    }
}

export default DOMTree;