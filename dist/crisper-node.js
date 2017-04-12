'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));

var path = require('path');
var _require = require('fs');
var readFile = _require.readFile;
var mkdir = _require.mkdir;
var writeFile = _require.writeFile;
var parse5 = require('parse5');
var isTextNode = function isTextNode(node) {
  return Boolean(node.nodeName === '#text');
};
var resolvePath = function resolvePath(source) {
  return path.win32.resolve(process.cwd(), source);
};
var relativePath = function relativePath(source) {
  return path.win32.relative(process.cwd(), source);
};
var distPath = function distPath(source, dest) {
  if (dest === null) {
    dest = 'dist';
  }
  return path.win32.join(path.win32.dirname(source), dest, path.win32.basename(source));
};
var write = function write(destination, content) {
  writeFile(destination, content, function (error) {
    if (error) {
      if (error.code === 'ENOENT') {
        var relative = relativePath(destination);
        var parts = path.win32.dirname(relative).split(path.sep);
        var prepath = '';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
        try {
          for (var _iterator = parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var part = _step.value;
            prepath = path.join(prepath, part);
            mkdir(prepath, function (error) {
              return console.error(error);
            });
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
        return write(destination, content);
      } else {
        console.log(error);
      }
    }
  });
};
var writeJs = function writeJs(path, content) {
  write(path, content);
};
var resolvePaths = function resolvePaths(source, html, js, dist) {
  return new Promise(function (resolve, reject) {
    try {
      var duplicates = { html: false, js: false };
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
var getFileContent = function getFileContent(source, contents) {
  return new Promise(function (resolve, reject) {
    if (contents) {
      return resolve(contents);
    }
    readFile(source, 'utf-8', function (error, content) {
      if (error) {
        reject(error);
      } else {
        resolve(content);
      }
    });
  });
};
var transformParse = function transformParse(string) {
  return new Promise(function (resolve, reject) {
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
var getChildNodes = function getChildNodes(document) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(document.childNodes[1].childNodes[1].childNodes);
    } catch (error) {
      reject(error);
    }
  });
};
var CrisperBase = function () {
  function CrisperBase(value, type) {
    _classCallCheck(this, CrisperBase);
    this[type] = value;
    this.type = type;
  }
  _createClass(CrisperBase, [{
    key: 'indexOfAttribute',
    value: function indexOfAttribute(attribute) {
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      try {
        var attrs = node.attrs || this[this.type].attrs;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;
        try {
          for (var _iterator2 = attrs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var attr = _step2.value;
            if (attr.name.toLowerCase() === attribute.toLowerCase()) {
              return attrs.indexOf(attr);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
        return -1;
      } catch (error) {
        console.error(error);
      }
    }
  }, {
    key: 'hasAttribute',
    value: function hasAttribute(attribute, node) {
      return Boolean(this.indexOfAttribute(attribute, node || this[this.type]) !== -1);
    }
  }, {
    key: 'getAttribute',
    value: function getAttribute(attribute) {
      attribute = this[this.type].attrs[this.indexOfAttribute(attribute)].value;
      if (attribute === '') {
        attribute = null;
      }
      return attribute;
    }
  }, {
    key: 'setAttribute',
    value: function setAttribute(name, value) {
      if (this.hasAttribute(name)) this[this.type].attrs[this.indexOfAttribute(name)].value = value;else this[this.type].attrs.push({
        name: name,
        value: value
      });
    }
  }, {
    key: 'serializeAttribute',
    value: function serializeAttribute(name, value) {
      return name + '="' + value + '"';
    }
  }, {
    key: 'serializeAttributes',
    value: function serializeAttributes() {
      var attributes = '';
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;
      try {
        for (var _iterator3 = this[this.type].attrs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var attr = _step3.value;
          attributes += ' ' + this.serializeAttribute(attr.name, attr.value);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
      return attributes;
    }
  }, {
    key: 'childNodes',
    get: function get$$1() {
      if (this.type === 'node') {
        return this.node.childNodes;
      }
      return this[this.type].content.childNodes;
    }
  }, {
    key: 'content',
    get: function get$$1() {
      var content = '';
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;
      try {
        for (var _iterator4 = this.childNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var child = _step4.value;
          if (isTextNode(child)) {
            content += child.value;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
      return content.trim();
    }
  }]);
  return CrisperBase;
}();
var CrisperNode = function (_CrisperBase) {
  _inherits(CrisperNode, _CrisperBase);
  function CrisperNode(node) {
    _classCallCheck(this, CrisperNode);
    return _possibleConstructorReturn(this, (CrisperNode.__proto__ || Object.getPrototypeOf(CrisperNode)).call(this, node, 'node'));
  }
  return CrisperNode;
}(CrisperBase);
var CrisperTemplate = function (_CrisperBase2) {
  _inherits(CrisperTemplate, _CrisperBase2);
  function CrisperTemplate(template) {
    _classCallCheck(this, CrisperTemplate);
    return _possibleConstructorReturn(this, (CrisperTemplate.__proto__ || Object.getPrototypeOf(CrisperTemplate)).call(this, template, 'template'));
  }
  _createClass(CrisperTemplate, [{
    key: 'id',
    get: function get$$1() {
      return this.getAttribute('id');
    },
    set: function set$$1(value) {
      this.setAttribute('id', value);
    }
  }, {
    key: 'outerHTML',
    get: function get$$1() {
      var attributes = this.serializeAttributes();
      return '<template' + attributes + '>\n  ' + this.content + '\n</template>';
    }
  }]);
  return CrisperTemplate;
}(CrisperBase);
module.exports = function () {
  var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { html: null, js: null, dist: null, contents: null };
  if (source === null) {
    return console.warn('source::undefined');
  }
  async function run() {
    var paths = await resolvePaths(source, opts.html, opts.js, opts.dist);
    var content = await getFileContent(paths.source, opts.contents);
    var document = await transformParse(content);
    var childNodes = await getChildNodes(document);
    var script = null;
    var template = null;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;
    try {
      for (var _iterator5 = childNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var child = _step5.value;
        if (!isTextNode(child)) {
          if (child.tagName && child.tagName === 'script') {
            var el = new CrisperNode(child);
            if (!el.hasAttribute('src')) {
              script = el;
            }
          } else if (child.tagName && child.tagName === 'template') {
            template = new CrisperTemplate(child);
          }
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
    var scriptTag = null;
    if (script) {
      var relative = relativePath(paths.js);
      scriptTag = '<script src="' + relative + '"></script>';
      writeJs(paths.js, script.content);
    }
    if (template) {
      if (template.id === null) template.id = path.win32.basename(paths.source, '.html');
      var outerHTML = template.outerHTML;
      var _content = scriptTag ? scriptTag + '\n\n' + outerHTML : outerHTML;
      write(paths.html, _content);
    }
  }
  run();
};
//# sourceMappingURL=crisper-node.js.map
