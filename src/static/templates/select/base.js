class BaseSelectTemplate extends BaseTemplate {
  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        title:           {default: null,  types: ['string', 'null']},
        error:           {default: null,  types: ['string', 'null']},
        required:        {default: false, types: ['boolean']},
        // 'selected' should be implemented in child classes
        selectable:      {required: true, types: ['*[]']},
        selectedCheck:   {default: null,  types: ['function']},
        displayDropdown: {required: true, types: ['function']},
        displaySelected: {required: true, types: ['function']},

        onChange: {default: null, types: ['function']},
      },
    };
  }

  elements = {
    error: null,

    title: {
      container: null,
      field: null,
      required: null,
    },

    display: {
      container: null,
    },

    dropdown: {
      container: null,
    },
  };

  _setError(value) {
    this.element.classList.toggle('has-error', value != null);
    this.elements.error.innerText = value;
  }

  _setTitle(value) {
    this.elements.title.container.classList.toggle('hidden', value == null);
    this.elements.display.container.classList.toggle('titleless', value == null);

    this.elements.title.field.innerText = value;
  }

  _setRequired(value) {
    this.elements.title.required.classList.toggle('hidden', !value);
  }

  _displaySelected = null;
  _displayDropdown = null;

  _defaultSelectedCheckCallback(a, b) {
    throw new Error('Abstract method');
  }

  _onSelectableClicked(item, elem) {
    throw new Error('Abstract method');
  }

  _selectedIsEmpty() {
    throw new Error('Abstract method');
  }

  async _createSelectedItems() {
    throw new Error('Abstract method');
  }

  _actuallySetSelected(item, elem) {
    throw new Error('Abstract method');
  }

  _onChangeCallback = null;
  async _setSelected(item, itemElem = null) {
    this._helpers.deleteChildren(this.elements.display.container);
    if (this._onChangeCallback && !this._selectedCheckCallback(item, this._selected)) {
      this._onChangeCallback(item, this._selected);
    }
    this._actuallySetSelected(item, itemElem);

    const elem = document.createElement('span');
    elem.classList.add('display', 'display-selected');

    if (this._selectedIsEmpty()) {
      elem.classList.add('empty');
      elem.innerText = 'No item selected';
    } else {
      const displays = await this._createSelectedItems();
      for (const display of displays) {
        if (display instanceof BaseTemplate) {
          elem.appendChild(display.element);
        } else if (display instanceof HTMLElement) {
          elem.appendChild(display);
        } else {
          elem.innerText = display;
        }
      }
    }

    this.elements.display.container.appendChild(elem);
  }

  async _createSelectableItem(item) {
    const elem = document.createElement('span');

    if (this._selectedCheckCallback(item, this._selected)) {
      elem.classList.add('selected');
    }

    const display = await Promise.resolve(this._displayDropdown(item));
    if (display instanceof BaseTemplate) {
      elem.appendChild(display.element);
    } else if (display instanceof HTMLElement) {
      elem.appendChild(display);
    } else {
      elem.innerText = display;
    }

    return elem;
  }

  _selectedCheckCallback = null;
  async _setSelectable(items) {
    this._helpers.deleteChildren(this.elements.dropdown.container);

    if (items.length === 0) {
      const elem = document.createElement('span');
      elem.classList.add('display', 'display-dropdown', 'empty');
      elem.innerText = 'No item selectable';
      this.elements.dropdown.container.appendChild(elem);
    } else {
      for (const item of items) {
        const elem = await this._createSelectableItem(item);
        elem.classList.add('display', 'display-dropdown');
        elem.addEventListener('click', () => this._onSelectableClicked(item, elem));
        this.elements.dropdown.container.appendChild(elem);
      }
    }
  }

  _toggleDropdown(value = null) {
    if (value == null) {
      this.elements.dropdown.container.classList.toggle('hidden');
    } else {
      this.elements.dropdown.container.classList.toggle('hidden', value);
    }

    if (!this.elements.dropdown.container.classList.contains('hidden')) {
      this.elements.dropdown.container.focus();
    }
  }

  async onInit(input) {
    this._displaySelected = input.displaySelected;
    this._displayDropdown = input.displayDropdown;
    this._selectedCheckCallback = input.selectedCheck ?? this._defaultSelectedCheckCallback;
    this._onChangeCallback = input.onChange;

    this.elements.error = this.element.getElementsByClassName('error')[0];
    this.elements.title.container = this.element.getElementsByClassName('title-container')[0];
    this.elements.title.field = this.elements.title.container.getElementsByClassName('title')[0];
    this.elements.title.required = this.elements.title.container.getElementsByClassName('required')[0];

    this.elements.display.container = this.element.getElementsByClassName('display-container')[0];

    this.elements.dropdown.container = this.element.getElementsByClassName('dropdown')[0];

    this._setTitle(input.title);
    this._setRequired(input.required);
    this._setSelected(input.selected);
    this._setSelectable(input.selectable);
    this._setError(input.error);

    this.elements.display.container.addEventListener('click', () => this._toggleDropdown());

    this.elements.dropdown.container.addEventListener('focusout', () => this._toggleDropdown(true));
  }

  async onUpdate(input) {
    if ('error' in input) {
      this._setError(input.error);
    }

    // TODO
  }

  value() {
    return this._selected;
  }
}
