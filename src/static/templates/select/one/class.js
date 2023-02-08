Templates.register(class extends BaseSelectTemplate {
  static keys = ['SELECT', 'ONE'];

  static templateFile = '../body.html';
  static styleFile = '../style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        selected: {default: null, types: ['*']},
      },
    };
  }

  _selected = null;

  _defaultSelectedCheckCallback(a, b) {
    return a?.id === b?.id;
  }

  _selectedIsEmpty() {
    return this._selected == null;
  }

  _actuallySetSelected(item, elem) {
    this._selected = item;
  }

  async _createSelectedItems() {
    let item = this._displaySelected(this._selected);
    item = await Promise.resolve(item);
    return [item];
  }

  async _onSelectableClicked(item, elem) {
    const currentlySelected = this.element.getElementsByClassName('display-dropdown selected')[0];
    if (currentlySelected) {
      currentlySelected.classList.remove('selected');
    }
    elem.classList.add('selected');

    await this._setSelected(item, elem);
    this._toggleDropdown(true);
  }
});
