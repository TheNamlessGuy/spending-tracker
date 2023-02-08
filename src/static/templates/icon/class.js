Templates.register(class extends BaseTemplate {
  static keys = ['ICON'];

  static template = '<div><i></i></div>';
  static style = `
{{ID}} {
  border-radius: 5px;
  padding: 5px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 20px;
  height: 20px;
}
`;

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        title: {required: true, types: ['string']},
        icon:  {required: true, types: ['string', 'null']},
        fg:    {required: true, types: ['string', 'null']},
        bg:    {required: true, types: ['string', 'null']},
      },
    };
  }

  elements = {
    i: null,
  };

  _setIcon(value) {
    this.elements.i.className = '';
    if (value) {
      this.elements.i.classList.add('fa-solid', 'fa-' + value);
    }
  }

  _setFG(value) {
    this.element.style.color = value ?? '';
  }

  _setBG(value) {
    this.element.style.backgroundColor = value ?? '';
  }

  _setTitle(value) {
    this.element.title = value;
  }

  async onInit(input) {
    this.elements.i = this.element.getElementsByTagName('i')[0];

    this._setIcon(input.icon);
    this._setFG(input.fg);
    this._setBG(input.bg);
    this._setTitle(input.title);
  }

  async onUpdate(input) {
    if ('icon' in input) {
      this._setIcon(input.icon);
    }

    if ('fg' in input) {
      this._setFG(input.fg);
    }

    if ('bg' in input) {
      this._setBG(input.bg);
    }

    if ('title' in input) {
      this._setTitle(input.title);
    }
  }
});
