Templates.register(class extends BaseTemplate {
  static keys = ['TEXTAREA'];

  static template = '<div><span class="title-container"><span class="title"></span><span class="required">*</span></span><textarea></textarea></div>';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        title:       {default: null,  types: ['string', 'null']},
        value:       {default: '',    types: ['string']},
        placeholder: {default: '',    types: ['string']},
        required:    {default: false, types: ['boolean']}, // TODO
        trim:        {default: false, types: ['boolean']},
        disabled:    {default: false, types: ['boolean']}, // TODO
        resizeable:  {default: false, types: ['boolean']}, // TODO
        nullOnEmpty: {default: false, types: ['boolean']},

        onChange: {default: () => {}, types: ['function']},
        onEnter:  {default: () => {}, types: ['function']},
      },
    };
  }

  elements = {
    title: null,
    titleContainer: null,
    required: null,
    textarea: null,
  };

  _onInput() {
    const value = this.value();
    if (value === this._lastValue) { return; }
    this._setValue(this.elements.textarea.value);
    if (this._onChangeCallback) { this._onChangeCallback(value); }
  }

  _onKeyUp(e) {
    if (e.key === 'Enter') {
      if (this._onEnterCallback) { this._onEnterCallback(this.value()); }
    }
  }

  _setTitle(title) {
    this.elements.titleContainer.classList.toggle('hidden', title == null);
    this.elements.textarea.classList.toggle('titleless', title == null);

    this.elements.title.innerText = title;
  }

  _lastValue = null;
  _setValue(value) {
    this.elements.textarea.value = value;
    this._lastValue = value;
  }

  _setPlaceholder(value) {
    this.elements.textarea.placeholder = value;
  }

  _setRequired(value) {
    this.elements.required.classList.toggle('hidden', !value);
  }

  _setDisabled(value) {
    // TODO
  }

  _trim = null;
  _nullOnEmpty = null;
  _onChangeCallback = null;
  _onEnterCallback = null;

  async onInit(input) {
    this.elements.titleContainer = this.element.getElementsByClassName('title-container')[0];
    this.elements.title = this.element.getElementsByClassName('title')[0];
    this.elements.required = this.element.getElementsByClassName('required')[0];
    this.elements.textarea = this.element.getElementsByTagName('textarea')[0];

    this.elements.textarea.addEventListener('keyup', this._onKeyUp.bind(this));
    this.elements.textarea.addEventListener('input', this._onInput.bind(this));

    this._trim = input.trim;
    this._nullOnEmpty = input.nullOnEmpty;
    this._onChangeCallback = input.onChange;
    this._onEnterCallback = input.onEnter;

    this._setTitle(input.title);
    this._setValue(input.value);
    this._setPlaceholder(input.placeholder);
    this._setRequired(input.required);
    this._setDisabled(input.disabled);
  }

  async onUpdate(input) {
    if ('value' in input) {
      this._setValue(input.value);
    }

    // TODO
  }

  value() {
    let value = this.elements.textarea.value;
    if (this._trim) { value = value.trim(); }
    if (this._nullOnEmpty && value.length === 0) { value = null; }
    return value;
  }
});
