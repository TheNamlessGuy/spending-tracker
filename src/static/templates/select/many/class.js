Templates.register(class extends BaseSelectTemplate {
  static keys = ['SELECT', 'MANY'];

  static templateFile = '../body.html';
  static styleFile = '../style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        selected: {default: [], types: ['*[]']},
      },
    };
  }

  _selected = [];

  _defaultSelectedCheckCallback(a, b) {
    return b?.map(x => x.id).includes(a?.id);
  }

  _selectedIsEmpty() {
    return this._selected.length === 0;
  }

  _actuallySetSelected(item, elem) {
    const isSelected = elem?.classList.contains('selected');
    if (isSelected) {
      this._selected.push(item);
    } else {
      const idx = this._selected.indexOf(item);
      if (idx !== -1) {
        this._selected.splice(this._selected.indexOf(item), 1);
      }
    }
  }

  async _onSelectableClicked(item, elem) {
    elem.classList.toggle('selected');
    elem.getElementsByTagName('input')[0].checked = elem.classList.contains('selected');
    await this._setSelected(item, elem);
  }

  async _createSelectedItems() {
    const retval = [];
    for (const item of this._selected) {
      retval.push(await Promise.resolve(this._displaySelected(item)));
    }
    return retval;
  }

  async _createSelectableItem(item) {
    const elem = await super._createSelectableItem(item);
    elem.style.display = 'flex';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = elem.classList.contains('selected');
    checkbox.addEventListener('click', (e) => e.preventDefault());

    elem.insertBefore(checkbox, elem.firstChild);
    return elem;
  }
});
