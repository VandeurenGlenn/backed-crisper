const path = require('path');
const { readFile, mkdir, writeFile } = require('fs');
const parse5 = require('parse5');
const isTextNode = node => {
  return Boolean(node.nodeName === '#text');
};
const resolvePath = source => {
  return path.win32.resolve(process.cwd(), source);
};
const relativePath = source => {
  return path.win32.relative(process.cwd(), source);
};
const distPath = (source, dest) => {
  if (dest === null) {
    dest = 'dist';
  }
  return path.win32.join(path.win32.dirname(source), dest, path.win32.basename(source));
};
const write = (destination, content) => {
  writeFile(destination, content, error => {
    if (error) {
      if (error.code === 'ENOENT') {
        const relative = relativePath(destination);
        const parts = path.win32.dirname(relative).split(path.sep);
        let prepath = '';
        for (let part of parts) {
          prepath = path.join(prepath, part);
          mkdir(prepath, error => {
            return console.error(error);
          });
        }
        return write(destination, content);
      } else {
        console.log(error);
      }
    }
  });
};
const writeJs = (path, content) => {
  write(path, content);
};
const resolvePaths = (source, html, js, dist) => {
  return new Promise((resolve, reject) => {
    try {
      const duplicates = { html: false, js: false };
      if (html === source) {
        html = distPath(html, dist);
      }
      if (js === source) {
        js = distPath(js, dist);
      }
      source = resolvePath(source);
      html = html || distPath(source, dist);
      js = js || distPath(source, dist).replace('.html', '.js');
      resolve({
        source: source,
        html: resolvePath(html),
        js: resolvePath(js)
      });
    } catch (error) {
      reject(error);
    }
  });
};
const getFileContent = (source, contents) => {
  return new Promise((resolve, reject) => {
    if (contents) {
      return resolve(contents);
    }
    readFile(source, 'utf-8', (error, content) => {
      if (error) {
        reject(error);
      } else {
        resolve(content);
      }
    });
  });
};
const transformParse = string => {
  return new Promise((resolve, reject) => {
    if (!string.includes('<html>')) {
      string = '<!DOCTYPE html><html><head></head><body>' + string + '</body></html>';
    }
    try {
      resolve(parse5.parse(string));
    } catch (error) {
      reject(error);
    }
  });
};
const getChildNodes = document => {
  return new Promise(function (resolve, reject) {
    try {
      resolve(document.childNodes[1].childNodes[1].childNodes);
    } catch (error) {
      reject(error);
    }
  });
};
class CrisperBase {
  constructor(value, type) {
    this[type] = value;
    this.type = type;
  }
  get childNodes() {
    if (this.type === 'node') {
      return this.node.childNodes;
    }
    return this[this.type].content.childNodes;
  }
  get content() {
    let content = '';
    for (let child of this.childNodes) {
      if (isTextNode(child)) {
        content += child.value;
      }
    }
    return content.trim();
  }
  indexOfAttribute(attribute, node = {}) {
    try {
      const attrs = node.attrs || this[this.type].attrs;
      for (let attr of attrs) {
        if (attr.name.toLowerCase() === attribute.toLowerCase()) {
          return attrs.indexOf(attr);
        }
      }
      return -1;
    } catch (error) {
      console.error(error);
    }
  }
  hasAttribute(attribute, node) {
    return Boolean(this.indexOfAttribute(attribute, node || this[this.type]) !== -1);
  }
  getAttribute(attribute) {
    attribute = this[this.type].attrs[this.indexOfAttribute(attribute)].value;
    if (attribute === '') {
      attribute = null;
    }
    return attribute;
  }
  setAttribute(name, value) {
    if (this.hasAttribute(name)) this[this.type].attrs[this.indexOfAttribute(name)].value = value;else this[this.type].attrs.push({
      name: name,
      value: value
    });
  }
  serializeAttribute(name, value) {
    return `${name}="${value}"`;
  }
  serializeAttributes() {
    let attributes = '';
    for (let attr of this[this.type].attrs) {
      attributes += ` ${this.serializeAttribute(attr.name, attr.value)}`;
    }
    return attributes;
  }
}
class CrisperNode extends CrisperBase {
  constructor(node) {
    super(node, 'node');
  }
}
class CrisperTemplate extends CrisperBase {
  constructor(template) {
    super(template, 'template');
  }
  get id() {
    return this.getAttribute('id');
  }
  set id(value) {
    this.setAttribute('id', value);
  }
  get outerHTML() {
    const attributes = this.serializeAttributes();
    return `<template${attributes}>\n  ${this.content}\n</template>`;
  }
}
module.exports = (source = null, opts = { html: null, js: null, dist: null, contents: null }) => {
  if (source === null) {
    return console.warn('source::undefined');
  }
  async function run() {
    const paths = await resolvePaths(source, opts.html, opts.js, opts.dist);
    const content = await getFileContent(paths.source, opts.contents);
    const document = await transformParse(content);
    const childNodes = await getChildNodes(document);
    let script = null;
    let template = null;
    for (let child of childNodes) {
      if (!isTextNode(child)) {
        if (child.tagName && child.tagName === 'script') {
          let el = new CrisperNode(child);
          if (!el.hasAttribute('src')) {
            script = el;
          }
        } else if (child.tagName && child.tagName === 'template') {
          template = new CrisperTemplate(child);
        }
      }
    }
    let scriptTag = null;
    if (script) {
      const relative = relativePath(paths.js);
      scriptTag = `<script src="${relative}"></script>`;
      writeJs(paths.js, script.content);
    }
    if (template) {
      if (template.id === null) template.id = path.win32.basename(paths.source, '.html');
      const outerHTML = template.outerHTML;
      let content = scriptTag ? `${scriptTag}\n\n${outerHTML}` : outerHTML;
      write(paths.html, content);
    }
  }
  run();
};
//# sourceMappingURL=crisper-es.js.map
