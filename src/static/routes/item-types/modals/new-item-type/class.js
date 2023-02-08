Modals.register(class extends BaseModal {
  static keys = ['ITEM_TYPE', 'NEW'];

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
    name: null,
    type: null,
    errors: null,

    btn: {
      ok: null,
      cancel: null,
    },
  };

  _addError(msg) {
    this.elements.errors.add(msg);
  }

  _onSaveCallback = null;
  _onSave() {
    this.elements.errors.clear();

    const payload = {
      name: this.elements.name.value(),
      type: this.elements.type.value(),
      notes: this.elements.notes.value(),
    };

    if (payload.name.length === 0) {
      this.elements.errors.add('Name cannot be empty');
      return;
    }

    Backend.post('/api/models/item-type', payload)
      .onSuccess((response) => {
        this._onSaveCallback();
        Modals.hide(this.self.id);
      }).onFailure((response) => {
        this.elements.errors.add('Backend error');
        response.errors().forEach(x => this.elements.errors.add(x));
      }).send();
  }

  _onCancel() {
    Modals.hide(this.self.id);
  }

  _displayType(item) {
    return item;
  }

  async onInit() {
    this.elements.errors = await Templates.init(Templates.ERRORS);
    this.elements.errors.replaceTag('errors', this.element);

    this.elements.name = await Templates.init(Templates.INPUT, {title: 'Name', required: true, trim: true, onEnter: this._onSave.bind(this)});
    this.elements.name.replaceTag('name-input', this.element);

    this.elements.type = await Templates.init(Templates.SELECT.ONE, {
      title: 'Type',
      required: true,
      selectable: ['WEIGHT', 'UNIT'],
      displayDropdown: this._displayType,
      displaySelected: this._displayType,
      selectedCheck: (a, b) => a === b,
    });
    this.elements.type.replaceTag('type-select', this.element);

    this.elements.notes = await Templates.init(Templates.TEXTAREA, {title: 'Notes', required: false, trim: true, nullOnEmpty: true});
    this.elements.notes.replaceTag('notes-input', this.element);

    this.elements.btn.ok = await Templates.init(Templates.BUTTON, {type: 'ok', title: 'Save', onClick: this._onSave.bind(this)});
    this.elements.btn.ok.replaceTag('ok-btn', this.element);

    this.elements.btn.cancel = await Templates.init(Templates.BUTTON, {type: 'cancel', title: 'Cancel', onClick: this._onCancel.bind(this)});
    this.elements.btn.cancel.replaceTag('cancel-btn', this.element);
  }

  async onShow(input) {
    this._onSaveCallback = input.onSave;
  }

  async onReset() {
    this.elements.errors.clear();

    this.elements.name.update({value: ''});
    this.elements.type.update({selected: null});
    this.elements.notes.update({value: ''});
  }
});
