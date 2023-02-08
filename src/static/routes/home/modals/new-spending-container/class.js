Templates.register(class extends BaseTemplate {
  static keys = ['HOME', 'SPENDING_CONTAINER', 'NEW', 'ITEM'];

  static templateFile = './item-body.html';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        error:      {default: null,  types: ['string', 'null']},
        itemTypes:  {required: true, types: ['backend-item-type[]']},
        categories: {required: true, types: ['backend-category[]']},
      },
    };
  }

  elements = {
    paidAmount: null,
    actualAmount: null,
    itemAmount: null,
    itemType: null,
    notes: null,
    weightUnit: null,
    categorySelect: null,
  };

  _displayItemTypeDropdown(item) {
    const elem = document.createElement('span');
    elem.innerText = item.name;
    if (item.notes) { elem.title = item.notes; }
    return elem;
  }

  _displayItemTypeSelected(item) {
    return item.name;
  }

  async _displayCategoryDropdown(item) {
    const container = document.createElement('span');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    const icon = await Templates.init(Templates.ICON, {title: item.name, icon: item.icon, fg: item.icon_fg_color, bg: item.icon_bg_color});
    icon.appendTo(container);

    const text = document.createElement('span');
    text.innerText = item.name;
    container.appendChild(text);

    return container;
  }

  async _displayCategorySelected(item) {
    return await Templates.init(Templates.ICON, {
      title: item.name,
      icon: item.icon,
      fg: item.icon_fg_color,
      bg: item.icon_bg_color,
    });
  }

  _displayWeightUnit(item) {
    return item;
  }

  _onItemTypeChange(to) {
    if (to == null) {
      // noop
    } else if (to.type === 'WEIGHT') {
      this.elements.weightUnit.update({cssClasses: [], selected: null});
      this.elements.itemAmount.update({title: 'Weight'});
      this.elements.paidAmount.update({title: 'Paid/Unit', tooltip: 'Price per KG, for example.\n\nWhat you actually paid.'});
      this.elements.actualAmount.update({title: 'Actual/Unit', tooltip: 'Price per KG, for example.\n\nWhat you would have paid if the item wasn\'t on sale.'});
    } else if (to.type === 'UNIT') {
      this.elements.weightUnit.update({cssClasses: ['hidden'], selected: null});
      this.elements.itemAmount.update({title: 'Items'});
      this.elements.paidAmount.update({title: 'Paid', tooltip: 'What you actually paid.'});
      this.elements.actualAmount.update({title: 'Actual', tooltip: 'What you would have paid if the item wasn\'t on sale.'});
    } else {
      throw new Error('Unknown item type type "' + to.type + "'");
    }
  }

  _onPaidAmountChange(newValue, oldValue) {
    if (newValue != null && this.elements.actualAmount.value() === oldValue) {
      this.elements.actualAmount.update({value: newValue});
    }
  }

  async onInit(input) {
    this.elements.paidAmount = await Templates.init(Templates.INPUT, {
      title: 'Paid',
      type: 'number',
      value: 0,
      required: true,
      tooltip: 'What you actually paid.',
      onChange: this._onPaidAmountChange.bind(this),
    });
    this.elements.paidAmount.replaceTag('paid-amount', this.element);

    this.elements.actualAmount = await Templates.init(Templates.INPUT, {
      title: 'Actual',
      type: 'number',
      value: 0,
      required: true,
      tooltip: 'What you would have paid if the item wasn\'t on sale.',
    });
    this.elements.actualAmount.replaceTag('actual-amount', this.element);

    this.elements.itemAmount = await Templates.init(Templates.INPUT, {title: 'Items', type: 'number', value: 1, required: true});
    this.elements.itemAmount.replaceTag('item-amount', this.element);

    this.elements.weightUnit = await Templates.init(Templates.SELECT.ONE, {
      title: 'Weight Unit',
      required: true,
      selectable: ['KG'],
      displayDropdown: this._displayWeightUnit,
      displaySelected: this._displayWeightUnit,
      selectedCheck: (a, b) => a === b,
      cssClasses: ['hidden'],
    });
    this.elements.weightUnit.replaceTag('weight-unit-select', this.element);

    this.elements.itemType = await Templates.init(Templates.SELECT.ONE, {
      title: 'Item type',
      required: true,
      selectable: input.itemTypes,
      displayDropdown: this._displayItemTypeDropdown,
      displaySelected: this._displayItemTypeSelected,
      onChange: this._onItemTypeChange.bind(this),
    });
    this.elements.itemType.replaceTag('item-type', this.element);

    this.elements.categorySelect = await Templates.init(Templates.SELECT.MANY, {
      title: 'Categories',
      required: true,
      selectable: input.categories,
      displayDropdown: this._displayCategoryDropdown,
      displaySelected: this._displayCategorySelected,
    });
    this.elements.categorySelect.replaceTag('category-select', this.element);

    this.elements.notes = await Templates.init(Templates.TEXTAREA, {title: 'Notes', trim: true, nullOnEmpty: true});
    this.elements.notes.replaceTag('notes', this.element);
  }

  async onUpdate(input) {
    if ('error' in input) {
      this.elements.paidAmount.update({error: input.error});
      this.elements.actualAmount.update({error: input.error});
      this.elements.itemAmount.update({error: input.error});
      this.elements.itemType.update({error: input.error});
      this.elements.notes.update({error: input.error});
      this.elements.categorySelect.update({error: input.error});
    }
  }

  isValid() {
    let isValid = true;

    let value = this.elements.paidAmount.value();
    const paid = value;
    if (value == null || value < 0) {
      this.elements.paidAmount.update({error: 'Paid amount cannot be empty or negative'});
      isValid = false;
    }

    const itemType = this.elements.itemType.value();
    if (itemType == null) {
      this.elements.itemType.update({error: 'Item type is required'});
      isValid = false;
    }

    value = this.elements.weightUnit.value();
    if (value != null && itemType?.type === 'UNIT') {
      this.elements.weightUnit.update({error: 'Weight unit should not be set'});
      isValid = false;
    } else if (value == null && itemType?.type === 'WEIGHT') {
      this.elements.weightUnit.update({error: 'Weight unit must be set'});
      isValid = false;
    }

    value = this.elements.actualAmount.value();
    if (value == null || value < 0) {
      this.elements.actualAmount.update({error: 'Actual amount cannot be empty or negative'});
      isValid = false;
    } else if (value < paid) {
      this.elements.actualAmount.update({error: 'Actual amount has to be greater or equal to the paid amount'});
      isValid = false;
    }

    value = this.elements.itemAmount.value();
    if (value == null || value < 0) {
      this.elements.itemAmount.update({error: 'Item amount cannot be empty or negative'});
      isValid = false;
    }

    value = this.elements.categorySelect.value();
    if (value.length < 1) {
      this.elements.categorySelect.update({error: 'At least one category is required'});
      isValid = false;
    }

    return isValid;
  }

  _sinage(value, isNegative) {
    return isNegative ? -value : value;
  }

  value(isNegative) {
    return {
      paid_amount: this._sinage(this.elements.paidAmount.value(), isNegative),
      actual_amount: this._sinage(this.elements.actualAmount.value(), isNegative),
      item_amount: this.elements.itemAmount.value(),
      item_type_id: this.elements.itemType.value()?.id,
      notes: this.elements.notes.value(),
      weight_unit: this.elements.weightUnit.value(),
      categories: this.elements.categorySelect.value().map(x => x.id),
    };
  }
});

Modals.register(class extends BaseModal {
  static keys = ['HOME', 'SPENDING_CONTAINER', 'NEW'];

  static templateFile = './body.html';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        onSave: {required: true, types: ['function']},
      },
    };
  }

  elements = {
    errors: null,
    title: null,
    date: null,
    notes: null,
    typeSelect: null,

    btn: {
      newItem: null,
      ok: null,
      cancel: null,
    },

    itemContainer: null,
    items: [],
  };

  _itemTypes = [];
  _categories = [];
  async _createItem() {
    const item = await Templates.init(Templates.HOME.SPENDING_CONTAINER.NEW.ITEM, {itemTypes: this._itemTypes, categories: this._categories});
    this.elements.items.push(item);
    item.appendTo(this.elements.itemContainer);
    Modals.recenter(this.self.id);
  }

  _clearErrors() {
    this.elements.errors.clear();
    this.elements.title.update({error: null});
    this.elements.date.update({error: null});
    this.elements.notes.update({error: null});

    for (const item of this.elements.items) {
      item.update({error: null});
    }
  }

  _onSaveCallback = null;
  async _onSave() {
    this._clearErrors();
    let isValid = true;

    const payload = {
      title: this.elements.title.value(),
      date: this.elements.date.displayValue(),
      notes: this.elements.notes.value(),
      spending_items: [],
    };

    const isNegative = this.elements.typeSelect.value() === 'Negative';

    if (payload.title.length === 0) {
      this.elements.title.update({error: 'Title is required'});
      isValid = false;
    }

    for (const item of this.elements.items) {
      if (item.isValid()) {
        payload.spending_items.push(item.value(isNegative));
      } else {
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    Modals.hide(this.self.id);
    Modals.show(Modals.LOADING, {title: 'Saving...'});
    Backend.post('/api/models/spending-container', payload)
      .onSuccess(() => {
        Modals.hide(Modals.LOADING);
        if (this._onSaveCallback) { this._onSaveCallback(); }
      })
      .onFailure((response) => {
        response.errors().forEach(x => this.elements.errors.add(x));
        Modals.hide(Modals.LOADING);
        Modals.show(this.self.id, {}, true, false);
      })
      .send();
  }

  _onCancel() {
    Modals.hide(this.self.id);
  }

  async onInit() {
    this.elements.errors = await Templates.init(Templates.ERRORS);

    this.elements.itemContainer = this.element.getElementsByClassName('item-container')[0];

    this.elements.title = await Templates.init(Templates.INPUT, {title: 'Title', required: true, trim: true});
    this.elements.title.replaceTag('title-input', this.element);

    this.elements.date = await Templates.init(Templates.DATEPICKER, {title: 'Date', required: true, value: 0});
    this.elements.date.replaceTag('date-input', this.element);

    this.elements.notes = await Templates.init(Templates.TEXTAREA, {title: 'Notes', trim: true, nullOnEmpty: true});
    this.elements.notes.replaceTag('notes-input', this.element);

    this.elements.typeSelect = await Templates.init(Templates.SELECT.ONE, {
      title: 'Type',
      required: true,
      selectable: ['Positive', 'Negative'],
      selected: 'Negative',
      displayDropdown: (x) => x,
      displaySelected: (x) => x,
      selectedCheck: (x, y) => x === y,
    });
    this.elements.typeSelect.replaceTag('type-select', this.element);

    this.elements.btn.newItem = await Templates.init(Templates.BUTTON, {type: 'info', title: 'Add new item', onClick: this._createItem.bind(this)});
    this.elements.btn.newItem.replaceTag('add-new-item-btn', this.element);

    this.elements.btn.ok = await Templates.init(Templates.BUTTON, {type: 'ok', title: 'Save', onClick: this._onSave.bind(this)});
    this.elements.btn.ok.replaceTag('ok-btn', this.element);

    this.elements.btn.cancel = await Templates.init(Templates.BUTTON, {type: 'cancel', title: 'Cancel', onClick: this._onCancel.bind(this)});
    this.elements.btn.cancel.replaceTag('cancel-btn', this.element);
  }

  async onShow(input) {
    this._onSaveCallback = input.onSave;
  }

  async onReset() {
    this._clearErrors();

    this.elements.title.update({value: ''});
    this.elements.date.update({value: Date.now() / 1000});
    this.elements.notes.update({value: ''});

    for (const item of this.elements.items) {
      item.remove();
    }
    this.elements.items = [];

    const itemTypes = await Backend.get('/api/models/item-type', {'sort-by': 'name'}).send();
    if (itemTypes.failed()) {
      console.error('TODO', 'Templates.HOME.SPENDING_CONTAINER.NEW.ITEM::onInit', 'item-types', itemTypes);
    }
    this._itemTypes = itemTypes.results();

    const categories = await Backend.get('/api/models/category', {'sort-by': 'name'}).send();
    if (categories.failed()) {
      console.error('TODO', 'Templates.HOME.SPENDING_CONTAINER.NEW.ITEM::onInit', 'categories', categories);
    }
    this._categories = categories.results();

    this._createItem();
  }
});
