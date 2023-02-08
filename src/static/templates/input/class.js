Templates.registerType('input-type', function(value) {
  return ['text', 'number'].includes(value);
});

Templates.register(class extends BaseTemplate {
  static keys = ['INPUT'];

  static template = '<div><div><span class="input-title-container"><span class="input-title"></span><span class="required">*</span></span><input class="input"></div><div class="error"></div></div>';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        type:        {default: 'text',   types: ['input-type']},
        title:       {default: null,     types: ['null', 'string']},
        value:       {default: '',       types: ['string', 'number']},
        placeholder: {default: '',       types: ['string']},
        trim:        {default: false,    types: ['boolean']},
        required:    {default: false,    types: ['boolean']},
        disabled:    {default: false,    types: ['boolean']}, // TODO
        error:       {default: null,     types: ['string', 'null']},
        tooltip:     {default: null,     types: ['string', 'null']},
        width:       {default: null,     types: ['string']},

        onChange:    {default: null, types: ['function']},
        onEnter:     {default: null, types: ['function']},
        onBlur:      {default: null, types: ['function']},
      },
    };
  }

  elements = {
    titleContainer: null,
    title: null,
    required: null,
    input: null,
    error: null,
  };

  _type = null;
  _onChangeCallback = null;
  _onEnterCallback = null;
  _onBlurCallback = null;
  _trim = null;

  _setError(value) {
    this.element.classList.toggle('has-error', value != null);
    this.elements.error.innerText = value;
  }

  _setTitle(title) {
    this.elements.titleContainer.classList.toggle('hidden', title == null);
    this.elements.input.classList.toggle('titleless', title == null);

    this.elements.title.innerText = title;
  }

  _setValue(value) {
    this.elements.input.value = value;
    this._lastValue = this.value();
  }

  _setRequired(value) {
    this.elements.required.classList.toggle('hidden', !value);
  }

  _setTooltip(value) {
    this.elements.titleContainer.title = value ?? '';
  }

  _setWidth(value) {
    if (value == null) { return; }

    this.element.style.width = 'fit-content';
    this.elements.input.style.width = value;
  }

  _lastValue = null;
  _onInput() {
    let oldLastValue = this._lastValue;
    let value = this.elements.input.value;
    if (this._trim) { value = value.trim(); }

    if (value === this._lastValue) { return; }

    if (this._type === 'number') {
      value = value.replaceAll(',', '.');
      if (!['', '-', '.'].includes(value) && (isNaN(value) || isNaN(parseFloat(value)))) {
        this._setValue(this._lastValue);
        return;
      }
      this.elements.input.value = value;
    }

    this._setValue(this.elements.input.value);
    if (this._onChangeCallback) { this._onChangeCallback(this.value(), oldLastValue); }
  }

  _onBlur(e) {
    if (this._onBlurCallback) { this._onBlurCallback(e); }
  }

  _onKeyUp(e) {
    if (e.key === 'Enter') {
      if (this._onEnterCallback) { this._onEnterCallback(); }
    }
  }

  async onInit(input) {
    this.elements.titleContainer = this.element.getElementsByClassName('input-title-container')[0];
    this.elements.title = this.element.getElementsByClassName('input-title')[0];
    this.elements.required = this.element.getElementsByClassName('required')[0];
    this.elements.input = this.element.getElementsByClassName('input')[0];
    this.elements.error = this.element.getElementsByClassName('error')[0];

    this.elements.input.addEventListener('keyup', this._onKeyUp.bind(this));
    this.elements.input.addEventListener('input', this._onInput.bind(this));
    this.elements.input.addEventListener('blur', this._onBlur.bind(this));

    this._type = input.type;
    this._trim = input.trim;
    this._onChangeCallback = input.onChange;
    this._onEnterCallback = input.onEnter;
    this._onBlurCallback = input.onBlur;

    this.elements.input.placeholder = input.placeholder;

    this._setTooltip(input.tooltip);
    this._setTitle(input.title);
    this._setValue(input.value);
    this._setRequired(input.required);
    this._setError(input.error);
    this._setWidth(input.width);
  }

  async onUpdate(input) {
    if ('value' in input) {
      this._setValue(input.value);
    }

    if ('title' in input) {
      this._setTitle(input.title);
    }

    if ('tooltip' in input) {
      this._setTooltip(input.tooltip);
    }

    if ('placeholder' in input) {
      this.elements.input.placeholder = input.placeholder;
    }

    if ('type' in input) {
      this._type = input.type;
    }

    if ('error' in input) {
      this._setError(input.error);
    }
  }

  value() {
    if (this._type === 'number') {
      const value = parseFloat(this.elements.input.value);
      return isNaN(value) ? null : value;
    }
    return this.elements.input.value;
  }

  focus() {
    this.elements.input.focus();
  }
});
