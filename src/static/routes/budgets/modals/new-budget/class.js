Templates.register(class extends BaseTemplate {
  static keys = ['BUDGETS', 'NEW', 'CATEGORY', 'SELECTOR'];
  static templateFile = './category-selector-body.html';
  static styleFile = './category-selector-style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        error: {default: null, types: ['string', 'null']},
        categories: {required: true, types: ['backend-category[]']},
        deletable: {required: true, types: ['boolean']},
        onDelete: {required: true, types: ['function']},
      },
    };
  }

  elements = {
    category: null,
    type: null,
    deleteBtn: null,
  };

  async _displayCategory(item) {
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

  async _displayType(item) {
    return item;
  }

  _onCategoryChange() {
    this.elements.category.update({error: null});
  }

  _onTypeChange(newValue, oldValue) {
    this.elements.type.update({error: null});
    if (newValue === 'Reset') {

    }
  }

  _onDeleteCallback = null;
  _onDelete() {
    this._onDeleteCallback(this);
    this.remove();
  }

  async onInit(input) {
    this._onDeleteCallback = input.onDelete;

    this.elements.category = await Templates.init(Templates.SELECT.ONE, {
      title: 'Category',
      required: true,
      selectable: input.categories,
      displayDropdown: this._displayCategory.bind(this),
      displaySelected: this._displayCategory.bind(this),
      //onChange: this._onCategoryChange.bind(this),
    });
    this.elements.category.replaceTag('category-dropdown', this.element);

    this.elements.type = await Templates.init(Templates.SELECT.ONE, {
      title: 'Type',
      required: true,
      selectable: Object.keys(this._typeConversionMatrix),
      displayDropdown: this._displayType.bind(this),
      displaySelected: this._displayType.bind(this),
      selectedCheck: (a, b) => a === b,
      //onChange: this._onTypeChange.bind(this),
    });
    this.elements.type.replaceTag('type-dropdown', this.element);

    this.elements.deleteBtn = await Templates.init(Templates.BUTTON, {icon: 'trash', tooltip: 'Remove', disabled: !input.deletable, type: 'cancel', onClick: this._onDelete.bind(this)});
    this.elements.deleteBtn.replaceTag('delete-btn', this.element);
  }

  isValid() {
    let isValid = true;

    if (this.elements.category.value() == null) {
      this.elements.category.update({error: 'Category is required'});
      isValid = false;
    }

    if (this.elements.type.value() == null) {
      this.elements.type.update({error: 'Type is required'});
      isValid = false;
    }

    return isValid;
  }

  _typeConversionMatrix = {'Add': 'ADD', 'Subtract': 'SUB', 'Reset': 'RESET'};
  value() {
    let type = this.elements.type.value();
    if (type) {
      type = this._typeConversionMatrix[type];
    }

    return {
      category_id: this.elements.category.value()?.id ?? null,
      type: type,
    };
  }
});

Modals.register(class extends BaseModal {
  static keys = ['BUDGETS', 'NEW'];

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

    name: null,
    startingAmount: null,
    limit: null,

    categoryContainer: null,
    categories: [],

    btn: {
      save: null,
      cancel: null,
      addCategory: null,
    },
  };

  _onCategoryRemoval(item) {
    this.elements.categories.splice(this.elements.categories.indexOf(item), 1);
  }

  async _createCategory() {
    const category = await Templates.init(Templates.BUDGETS.NEW.CATEGORY.SELECTOR, {
      categories: this._categories,
      deletable: this.elements.categories.length > 0,
      onDelete: this._onCategoryRemoval.bind(this),
    });
    this.elements.categories.push(category);
    category.appendTo(this.elements.categoryContainer);
    Modals.recenter(this.self.id);
  }

  _onSaveCallback = null;
  _onSave() {
    this.elements.errors.clear();
    this.elements.name.update({error: null});
    this.elements.limit.update({error: null});
    this.elements.startingAmount.update({error: null});

    const payload = {
      name: this.elements.name.value(),
      active_amount_limit: this.elements.limit.value(),
      active_starting_amount: this.elements.startingAmount.value(),
      categories: [],
    };

    let isValid = true;
    if (payload.name.length === 0) {
      this.elements.name.update({error: 'Name cannot be empty'});
      isValid = false;
    }

    if (payload.active_starting_amount == null) {
      // Noop - This is fine
    } else if (payload.active_starting_amount < 0) {
      this.elements.limit.update({error: 'Starting amount cannot be negative'});
      isValid = false;
    }

    if (payload.active_amount_limit == null) {
      // Noop - This is fine
    } else if (payload.active_amount_limit < 0) {
      this.elements.limit.update({error: 'Limit cannot be negative'});
      isValid = false;
    }

    for (const category of this.elements.categories) {
      if (category.isValid()) {
        payload.categories.push(category.value());
      } else {
        isValid = false;
      }
    }

    if (!isValid) { return; }

    Modals.hide(this.self.id);
    Modals.show(Modals.LOADING, {title: 'Creating budget...'});
    Backend.post('/api/models/budget', payload)
      .onSuccess((response) => {
        Modals.hide(Modals.LOADING);
        this._onSaveCallback();
      })
      .onFailure((response) => {
        Modals.hide(Modals.LOADING);
        Modals.show(this.self.id, {}, true, false);
        response.errors().forEach(x => this.elements.errors.add(x));
      })
      .send();
  }

  _onCancel() {
    Modals.hide(this.self.id);
  }

  async onInit() {
    this.elements.errors = await Templates.init(Templates.ERRORS);
    this.elements.errors.replaceTag('errors', this.element);

    this.elements.name = await Templates.init(Templates.INPUT, {title: 'Name', required: true, trim: true});
    this.elements.name.replaceTag('name-input', this.element);

    this.elements.startingAmount = await Templates.init(Templates.INPUT, {title: 'Starting amount', type: 'number', trim: true, value: 0});
    this.elements.startingAmount.replaceTag('starting-amount-input', this.element);

    this.elements.limit = await Templates.init(Templates.INPUT, {title: 'Limit', type: 'number', trim: true, value: 0});
    this.elements.limit.replaceTag('limit-input', this.element);

    this.elements.categoryContainer = this.element.getElementsByClassName('category-container')[0];

    this.elements.btn.save = await Templates.init(Templates.BUTTON, {title: 'Save', type: 'ok', onClick: this._onSave.bind(this)});
    this.elements.btn.save.replaceTag('save-btn', this.element);

    this.elements.btn.cancel = await Templates.init(Templates.BUTTON, {title: 'Cancel', type: 'cancel', onClick: this._onCancel.bind(this)});
    this.elements.btn.cancel.replaceTag('cancel-btn', this.element);

    this.elements.btn.addCategory = await Templates.init(Templates.BUTTON, {title: 'Add category', type: 'ok', onClick: this._createCategory.bind(this)});
    this.elements.btn.addCategory.replaceTag('add-new-category-btn', this.element);
  }

  async onShow(input) {
    this._onSaveCallback = input.onSave;
  }

  _categories = null;
  async onReset() {
    this.elements.name.update({value: ''});
    this.elements.startingAmount.update({value: 0});
    this.elements.limit.update({value: 0});

    for (const category of this.elements.categories) {
      category.remove();
    }
    this.elements.categories = [];

    const categories = await Backend.get('/api/models/category', {'sort-by': 'name'}).send();
    if (categories.failed()) {
      console.error('TODO', 'Modals.BUDGETS.NEW::onReset', categories);
    }
    this._categories = categories.results();

    await this._createCategory();
  }
});
