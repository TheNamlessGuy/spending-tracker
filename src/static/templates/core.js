class BaseTemplate {
  static id;
  static cssClass;
  static script;
  static keys;

  static template;
  static templateFile;
  static _parsedTemplate;

  static style;
  static styleFile;
  static _styleElement;

  static inputRules() {
    return {
      cssClasses: {default: [], types: ['string[]']},
    };
  }

  static _staticIsInitiated;

  static _validateInput(input, update) {
    const rules = this.inputRules();
    const skipped = [];

    for (const key in rules) {
      if (key in input) {
        const types = rules[key].types ?? ['*', '*[]'];
        if (!Templates.valueMatchesTypes(input[key], types)) {
            throw new Error('Input key "' + key + '" does not match the expected typing for template "' + this.id + '"');
        }
      } else if (update) {
        skipped.push(key);
      } else if (rules[key].required ?? false) {
        throw new Error('Input key "' + key + '" required for template "' + this.id + '", not given');
      } else {
        input[key] = rules[key].default ?? null;
      }
    }

    const expectedKeys = Object.keys(rules);
    const actualKeys = Object.keys(input);
    let diff = actualKeys.filter((x) => !expectedKeys.includes(x));
    if (diff.length > skipped.length) {
      diff = diff.filter((x) => !skipped.includes(x));
      throw new Error('Found unexpected input keys: ' + diff.join(', '));
    }

    return input;
  }

  static _prefixCSSWithID(style, prefix) {
    style = style.trim().split('\n');

    for (let i = 0; i < style.length; ++i) {
      if (style[i].trim().length === 0 || style[i].startsWith(' ') || style[i].startsWith('}')) { continue; }

      if (style[i].includes('{{ID}}')) {
        style[i] = style[i].replace('{{ID}}', '.' + prefix);
      } else {
        style[i] = '.' + prefix + ' ' + style[i];
      }
    }

    return style.join('\n');
  }

  static _staticInit() {
    this.cssClass = 'template--instance-of--' + this.id;

    this._staticIsInitiated = new Promise(async (resolve) => {
      // Style
      if (typeof this.styleFile === 'string') {
        this.style = await this._readFile(this.styleFile);
      }

      if (typeof this.style === 'string') {
        this.styleElement = document.createElement('style');
        this.styleElement.innerHTML = this._prefixCSSWithID(this.style, this.cssClass);
        document.head.appendChild(this.styleElement);
      }

      // Template
      if (typeof this.templateFile === 'string') {
        this.template = await this._readFile(this.templateFile);
      }

      if (typeof this.template === 'string') {
        this._parsedTemplate = new DOMParser().parseFromString(this.template, 'text/html').body.firstChild;
      }

      resolve();
    });
  }

  static async _readFile(path) {
    if (!path.startsWith('/')) {
      const url = new URL(this.script.src);
      path = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1) + path;
    }

    const fetched = await fetch(path);
    return await fetched.text();
  }

  self;
  element;

  constructor() {
    if (this.constructor == BaseTemplate) { throw new Error('Cannot instantiate abstract class BaseTemplate'); }
  }

  async init(self, input) {
    this.self = self;
    await this.self._staticIsInitiated;

    this.element = this.self._parsedTemplate.cloneNode(true);
    this.element.classList.add(this.self.cssClass);
    input = this.self._validateInput(input);

    if ('cssClasses' in input) {
      for (const cssClass of input.cssClasses) {
        this.element.classList.add(cssClass);
      }
    }

    await this.onInit(input);
  }

  async update(input) {
    input = this.self._validateInput(input, true);

    if ('cssClasses' in input) {
      const current = Array.from(this.element.classList).filter(x => !x.startsWith('template--'));
      for (const cssClass of current) {
        if (!input.cssClasses.includes(current)) {
          this.element.classList.remove(cssClass);
        }
      }

      for (const cssClass of input.cssClasses) {
        this.element.classList.add(cssClass);
      }
    }

    await this.onUpdate(input);
  }

  // START: on* functions
  async onInit(input) { throw new Error('Template "' + this.self.id + '" has not overridden the "onInit" function'); }
  async onInserted() {}
  async onUpdate(input) { throw new Error('Template "' + this.self.id + '" has not overridden the "onUpdate" function'); }
  async onRemoval() {}
  // END: on* functions

  static _elementToDOMElement(elem) {
    return elem instanceof BaseTemplate ? elem.element : elem;
  }

  // START: Element DOM handling functions
  async appendTo(elem) {
    this.self._elementToDOMElement(elem).appendChild(this.element);
    await this.onInserted();
  }

  async insertAtTopOf(elem) {
    elem = this.self._elementToDOMElement(elem);
    elem.insertBefore(this.element, elem.firstChild);
    await this.onInserted();
  }

  async replace(elem) {
    elem = this.self._elementToDOMElement(elem);
    elem.parentNode.replaceChild(this.element, elem);
    await this.onInserted();
  }

  async replaceTag(tagName, context = document) {
    await this.replace(context.getElementsByTagName(tagName)[0]);
  }

  async remove() {
    await this.onRemoval();
    this.element.parentNode?.removeChild(this.element);
  }
  // END: Element DOM handling functions

  _helpers = {
    deleteChildren: function(elem) {
      while (elem.lastChild) {
        elem.removeChild(elem.lastChild);
      }
    },

    initTemplate: function(template) {
      return template.content.firstElementChild.cloneNode(true);
    },
  };
}

const Templates = {
  _classes: {},

  register: function(classDef) {
    classDef.script = document.currentScript;
    if (!(classDef.prototype instanceof BaseTemplate)) {
      throw new Error('Tried to register a template that doesn\'t inherit BaseTemplate');
    }

    let keys = [...classDef.keys];
    classDef.id = keys.map((x) => x.toLowerCase().replace('-', '_')).join('_');

    const keysArentUppercase = keys.some(x => typeof x !== 'string' || x !== x.toUpperCase());
    if (keysArentUppercase) {
      throw new Error('Keys "' + keys.join('", "') + '" contains at least one non-uppercase string');
    }

    const key = keys.pop();

    let container = Templates;
    for (const k of keys) {
      if (!(k in container)) { container[k] = {}; }
      container = container[k];
    }

    container[key] = classDef.id;
    Templates._classes[classDef.id] = classDef;
  },

  init: async function(id, input = {}) {
    if (!(id in Templates._classes)) { throw new Error('Unknown template ID "' + id + '"'); }

    const classDef = Templates._classes[id];

    const elem = new classDef();
    await elem.init(classDef, input);
    return elem;
  },

  initStaticTemplate: async function(elem) {
    const id = element.getAttribute('template');

    let input = {};
    if (element.hasAttribute('input')) {
      input = window[element.getAttribute('input')](element); // TODO: Find a way to do this with an arbitrarily deep function. const/let aren't part of the window scope :(
    } else {
      for (const attribute of element.attributes) {
        if (attribute.name === 'template') { continue; }
        input[attribute.name] = attribute.value;
      }
    }

    (await Templates.init(id, input)).replace(element);
  },

  _onDOMContentLoaded: function() {
    for (const id in Templates._classes) {
      Templates._classes[id]._staticInit();
    }

    const elements = document.getElementsByTagName('static-template');
    for (const elem of elements) {
      Templates.initStaticTemplate(element);
    }
  },

  // START: Typing
  _types: {
    '*':        (value) => { return true; },
    'null':     (value) => { return value == null; },
    'string':   (value) => { return typeof value === 'string'; },
    'number':   (value) => { return typeof value === 'number'; },
    'object':   (value) => { return Object.prototype.toString.call(value) === '[object Object]'; },
    'boolean':  (value) => { return [true, false].includes(value); },
    'element': (value) => { return value instanceof HTMLElement; },
    'function': (value) => { return value instanceof Function; },
  },

  registerType: function(key, callback) {
    Templates._types[key] = callback;
  },

  valueMatchesTypes: function(value, types) {
    let result = false;

    for (const type of types) {
      if (Templates.valueMatchesType(value, type)) {
        result = true;
        break;
      }
    }

    return result;
  },

  valueMatchesType: function(value, type) {
    if (!type.endsWith('[]')) {
      if (!(type in Templates._types)) {
        throw new Error('Unknown template type: "' + type + '"');
      }
      return Templates._types[type](value);
    } else if (!Array.isArray(value)) {
      return false;
    }

    type = type.substring(0, type.length - 2);
    if (!(type in Templates._types)) {
      throw new Error('Unknown template type: "' + type + '"');
    }

    for (const v of value) {
      if (!Templates._types[type](v)) {
        return false;
      }
    }

    return true;
  },

  valueIsObject: function(value, keys) {
    if (!Templates.valueMatchesType(value, 'object')) {
      return false;
    }

    for (const key in keys) {
      if (!Templates.valueMatchesTypes(value[key], keys[key])) {
        return false;
      }
    }

    const actualKeys = Object.keys(value);
    const expectedKeys = Object.keys(keys);
    return !actualKeys.some(x => !expectedKeys.includes(x));
  },
  // END: Typing
};

window.addEventListener('DOMContentLoaded', Templates._onDOMContentLoaded);
