Templates.register(class extends BaseTemplate {
  static keys = ['LOGIN', 'USER'];

  static template = '<div class="login-user-container"><span class="login-user"></span></div>';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        item: {required: true, types: ['backend-user']},
        onClick: {required: true, types: ['function']},
      },
    };
  }

  elements = {
    user: null,
  };

  _item = null;
  _onClickCallback = null;
  _onClick() {
    if (this._onClickCallback) { this._onClickCallback(this._item); }
  }

  async onInit(input) {
    this._item = input.item;
    this.elements.user = this.element.getElementsByClassName('login-user')[0];
    this.elements.user.innerText = input.item.name;

    this._onClickCallback = input.onClick;
    this.elements.user.addEventListener('click', this._onClick.bind(this));
  }
});
