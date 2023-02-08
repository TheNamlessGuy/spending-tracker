Templates.registerType('button-type', function(value) {
  return ['info', 'ok', 'cancel'].includes(value);
});

Templates.register(class extends BaseTemplate {
  static keys = ['BUTTON'];

  static template = '<span class="button-container"><button class="button"><i class="button-icon hidden"></i><span class="button-title"></span></button></span>';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        title:    {default: null,  types: ['null', 'string']},
        type:     {default: null,  types: ['null', 'button-type']},
        disabled: {default: false, types: ['boolean']},
        tooltip:  {default: null,  types: ['null', 'string']},
        icon:     {default: null,  types: ['null', 'string']},

        onClick: {required: true, types: ['function']},
      },
    };
  }

  _onClickCallback = null;
  _onClick(e) {
    if (this.isDisabled()) { return; }
    this._onClickCallback(e);
  }

  elements = {
    button: null,
    icon: null,
    title: null,
  };

  _setDisabled(value) {
    this.element.classList.toggle('disabled', value);
  }

  _setType(value) {
    this.elements.button.classList.toggle('button-info', value === 'info');
    this.elements.button.classList.toggle('button-ok', value === 'ok');
    this.elements.button.classList.toggle('button-cancel', value === 'cancel');
  }

  _setTitle(value) {
    this.elements.title.innerText = value ?? '';
  }

  _setIcon(value) {
    this.elements.icon.classList.toggle('hidden', value == null);

    if (value) {
      Array.from(this.elements.icon.classList)
        .filter(x => x.startsWith('fa-'))
        .forEach(x => this.elements.icon.classList.remove(x));
      this.elements.icon.classList.add('fa-solid', 'fa-' + value);
    }
  }

  _setTooltip(value) {
    this.elements.button.title = value ?? '';
  }

  async onInit(input) {
    this._onClickCallback = input.onClick;

    this.elements.button = this.element.getElementsByTagName('button')[0];
    this.elements.icon = this.elements.button.getElementsByClassName('button-icon')[0];
    this.elements.title = this.elements.button.getElementsByClassName('button-title')[0];

    this.elements.button.addEventListener('click', this._onClick.bind(this));

    this._setType(input.type);
    this._setDisabled(input.disabled);
    this._setTitle(input.title);
    this._setIcon(input.icon);
    this._setTooltip(input.tooltip);
  }

  async onUpdate(input) {
    if ('onClick' in input) {
      this._onClickCallback = input.onClick;
    }

    if ('disabled' in input) {
      this._setDisabled(input.disabled);
    }

    if ('type' in input) {
      this._setType(input.type);
    }

    if ('title' in input) {
      this._setTitle(input.title);
    }

    if ('icon' in input) {
      this._setIcon(input.icon);
    }

    if ('tooltip' in input) {
      this._setTooltip(input.tooltip);
    }
  }

  isDisabled() {
    return this.element.classList.contains('disabled');
  }
});
