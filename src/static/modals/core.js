class BaseModal {
  static keys;
  static id;
  static cssClass;
  static script;
  static singleton;

  static templateFile;
  static template;

  static styleFile;
  static style;
  static _styleElement;

  static inputRules() {
    return {};
  }

  static _initInput(input) {
    const rules = this.inputRules();

    for (const key in rules) {
      if (key in input) { continue; }

      const required = rules[key].required ?? false;
      const defaultValue = rules[key].default ?? null;

      if (required) {
        throw new Error('Input key "' + key + '" required, not given');
      } else {
        input[key] = defaultValue;
      }
    }

    const expectedKeys = Object.keys(rules);
    const actualKeys = Object.keys(input);
    const diff = actualKeys.filter((x) => !expectedKeys.includes(x));
    if (diff.length > 0) {
      throw new Error('Found unexpected input keys: ' + diff.join(', '));
    }

    return input;
  }

  static async _getElement() {
    let content;
    if (typeof this.templateFile === 'string') {
      content = await this._readFile(this.templateFile);
    } else if (typeof this.template === 'string') {
      content = this.template;
    } else {
      return;
    }

    return new DOMParser().parseFromString(content, 'text/html').body.firstChild;
  }

  static _prefixCSSWithID(style, prefix) {
    style = style.trim().split('\n');

    for (let i = 0; i < style.length; ++i) {
      if (style[i].trim().length === 0 || style[i].startsWith(' ') || style[i].startsWith('}')) { continue; }

      style[i] = '.' + prefix + ' '  + style[i];
    }

    return style.join('\n');
  }

  static async _setupStyle() {
    let content;
    if (typeof this.styleFile === 'string') {
      content = await this._readFile(this.styleFile);
    } else if (typeof this.style === 'string') {
      content = this.style;
    } else {
      return;
    }

    this._styleElement = document.createElement('style');
    this._styleElement.innerHTML = this._prefixCSSWithID(content, this.cssClass);
    document.head.appendChild(this._styleElement);
  }

  static async _readFile(path) {
    if (!path.startsWith('/')) {
      const url = new URL(this.script.src);
      path = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1) + path;
    }

    const fetched = await fetch(path);
    const content = await fetched.body.getReader().read();
    return new TextDecoder().decode(content.value);
  }

  _isInitiated;

  self;
  element;

  constructor(self, id, script) {
    if (this.constructor == BaseModal) { throw new Error('Cannot instantiate abstract class BaseModal'); }

    this.self = self;
    this.self.id = id;
    this.self.cssClass = 'modal--instance-of--' + this.self.id;
    this.self.script = script;
  }

  // START: on* functions
  async onInit() {}
  async onShow(input) {}
  async onUpdate(input) {}
  async onHide() {}
  async onReset() {}
  // END: on* functions

  init() {
    this._isInitiated = new Promise(async (resolve) => {
      await this.self._setupStyle();
      this.element = await this.self._getElement();
      await this.onInit();
      resolve();
    });
    return this._isInitiated;
  }

  async show(input) {
    await this._isInitiated;
    await this.onShow(this.self._initInput(input));
  }

  async update(input) {
    await this._isInitiated;
    await this.onUpdate(this.self._initInput(input));
  }

  async reset() {
    await this.onReset();
  }

  async hide() {
    await this.onHide();
  }

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

const Modals = {
  _container: null,
  _loadingModalModal: null,

  _active: null,

  _classes: {},
  _scripts: {},

  register: async function(classDef) {
    const script = document.currentScript;
    let keys = classDef.keys;
    const id = keys.map((x) => x.toLowerCase().replace('-', '_')).join('_');
    const key = keys.pop();

    let container = Modals;
    for (const k of keys) {
      if (!(k in container)) { container[k] = {}; }
      container = container[k];
    }

    container[key] = id;
    Modals._scripts[id] = script;
    Modals._classes[id] = classDef;
  },

  show: async function(id, input = {}, sticky = false, reset = true) {
    Modals._showLoadingModalModal();

    const instance = Modals._classes[id].singleton;
    if (reset) {
      instance.reset();
      await instance.show(input);
    }

    if (sticky) { instance.element.classList.add('modal-sticky'); }
    Modals._active = instance;

    Modals._replaceLoadingModalModal();
    return instance;
  },

  update: async function(id, input) {
    if (!Modals.isActive(id)) { return; }
    await Modals._active.update(input);
  },

  hide: function(id = null) {
    if (!Modals.isActive(id)) { return; }

    Modals._active.hide();
    Modals._active.element.classList.add('hidden');
    Modals._active.element.classList.remove('modal-sticky');
    Modals._active = null;

    Modals._container.classList.add('hidden');
  },

  recenter: function(id = null) {
    if (!Modals.isActive(id)) { return; }

    const element = Modals._active.element;
    element.style.marginLeft = -(element.offsetWidth  / 2) + 'px';
    element.style.marginTop  = -(element.offsetHeight / 2) + 'px';

    const rect = element.getBoundingClientRect();
    if (rect.y - 5 < 0) {
      element.style.marginTop = -(element.offsetHeight / 2) + Math.abs(rect.y - 5) + 'px';
    }
  },

  getActiveID: function() {
    return Modals.isActive() ? Modals._active.self.id : null;
  },

  isActive: function(id = null) {
    if (id == null) {
      return Modals._active != null;
    }

    return Modals._active != null && Modals._active.self.id === id;
  },

  isSticky: function() {
    return Modals.isActive() && Modals._active.element.classList.contains('modal-sticky');
  },

  _showLoadingModalModal: function() {
    Modals._container.classList.remove('hidden');
    Modals._loadingModalModal.classList.remove('hidden');
  },

  _replaceLoadingModalModal: function() {
    Modals._loadingModalModal.classList.add('hidden');
    Modals._active.element.classList.remove('hidden');
    Modals.recenter();
  },

  _onPageLoad: async function() {
    Modals._container = document.getElementById('modal-container');
    Modals._container.classList.add('hidden');
    Modals._container.addEventListener('click', (e) => { if (!Modals.isSticky() && !e._doNotCloseModal) { Modals.hide(); }});

    Modals._loadingModalModal = document.createElement('img');
    Modals._loadingModalModal.src = '/static/images/loading.apng';
    Modals._loadingModalModal.classList.add('loading-modal-modal');
    Modals._loadingModalModal.classList.add('hidden');
    Modals._container.appendChild(Modals._loadingModalModal);

    const doNotCloseModal = (e) => { e._doNotCloseModal = true; };
    for (const id in Modals._classes) {
      const classDef = Modals._classes[id];
      classDef.singleton = new classDef(classDef, id, Modals._scripts[id]);
      await classDef.singleton.init();

      classDef.singleton.element.addEventListener('click', doNotCloseModal);
      classDef.singleton.element.classList.add('modal', 'hidden', classDef.cssClass);
      Modals._container.appendChild(classDef.singleton.element);
    }

    document.addEventListener('keyup', (e) => {
      if (!Modals.isActive()) { return; }

      if (e.key === 'Escape' && !Modals.isSticky()) { Modals.hide(); }
    });
  },
};

window.addEventListener('DOMContentLoaded', Modals._onPageLoad);
