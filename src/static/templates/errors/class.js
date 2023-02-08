Templates.register(class extends BaseTemplate {
  static keys = ['ERRORS'];

  static template = '<div class="errors"></div>';
  static styleFile = './style.css';

  add(...msgs) {
    for (const msg of msgs) {
      const elem = document.createElement('div');
      elem.innerText = msg;
      elem.classList.add('error');
      this.element.appendChild(elem);
    }
  }

  clear() {
    this._helpers.deleteChildren(this.element);
  }

  async onInit(input) {}
});
