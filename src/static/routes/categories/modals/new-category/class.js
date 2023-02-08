Modals.register(class extends BaseModal {
  static keys = ['CATEGORIES', 'CATEGORY', 'NEW'];

  static templateFile = './body.html';
  static styleFile = './style.css';

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
    icon: null,
    iconDisplay: null,
    iconFgColor: null,
    iconBgColor: null,

    btn: {
      save: null,
      cancel: null,
    },
  };

  _onSaveCallback = null;
  _onSave() {
    this.elements.errors.clear();
    this.elements.name.update({error: null});
    this.elements.icon.update({error: null});

    const payload = {
      name: this.elements.name.value(),
      icon: this.elements.icon.value(),
      icon_fg_color: this.elements.iconFgColor.hex(),
      icon_bg_color: this.elements.iconBgColor.hex(),
    };

    let isValid = true;
    if (payload.name.length === 0) {
      this.elements.name.update({error: 'Name cannot be empty'});
      isValid = false;
    }

    if (payload.icon == null) {
      this.elements.icon.update({error: 'Icon is required'});
      isValid = false;
    }

    if (!isValid) { return; }

    Modals.hide(this.self.id);
    Modals.show(Modals.LOADING, {title: 'Creating category...'});
    Backend.post('/api/models/category', payload)
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

  _displayIcon(value) {
    const i = document.createElement('i');
    i.classList.add('fa-solid', 'fa-' + value);

    const span = document.createElement('span');
    span.innerText = ' (' + value + ')';

    const container = document.createElement('span');
    container.appendChild(i);
    container.appendChild(span);

    return container;
  }

  _onIconChange(to) {
    this.elements.iconDisplay?.update({icon: to});
  }

  _onNameChange() {
    this.elements.iconDisplay.update({title: this.elements.name.value()});
  }

  _onFGChange() {
    if (this.elements.iconFgColor && this.elements.iconDisplay) {
      const color = this.elements.iconFgColor.hex();
      this.elements.iconDisplay.update({fg: color});
    }
  }

  _onBGChange() {
    if (this.elements.iconBgColor && this.elements.iconDisplay) {
      const color = this.elements.iconBgColor.hex();
      this.elements.iconDisplay.update({bg: color});
    }
  }

  async onInit() {
    this.elements.errors = await Templates.init(Templates.ERRORS);
    this.elements.errors.replaceTag('errors', this.element);

    this.elements.name = await Templates.init(Templates.INPUT, {title: 'Name', required: true, trim: true, onChange: () => this._onNameChange()});
    this.elements.name.replaceTag('name-input', this.element);

    this.elements.icon = await Templates.init(Templates.SELECT.ONE, {
      title: 'Icon',
      required: true,
      selectable: ICONS,
      displayDropdown: this._displayIcon,
      displaySelected: this._displayIcon,
      selectedCheck: (a, b) => a === b,
      onChange: this._onIconChange.bind(this),
    });
    this.elements.icon.replaceTag('icon-select', this.element);

    this.elements.iconFgColor = await Templates.init(Templates.COLORPICKER, {title: 'Foreground', hex: '#00F', required: true, onChange: () => this._onFGChange()});
    this.elements.iconFgColor.replaceTag('icon-fg-color-picker', this.element);

    this.elements.iconBgColor = await Templates.init(Templates.COLORPICKER, {title: 'Background', hex: '#F00', required: true, onChange: () => this._onBGChange()});
    this.elements.iconBgColor.replaceTag('icon-bg-color-picker', this.element);

    this.elements.iconDisplay = await Templates.init(Templates.ICON, {icon: this.elements.icon.value(), fg: this.elements.iconFgColor.hex(), bg: this.elements.iconBgColor.hex(), title: this.elements.name.value()});
    this.elements.iconDisplay.replaceTag('icon-display', this.element);

    this.elements.btn.save = await Templates.init(Templates.BUTTON, {title: 'Save', type: 'ok', onClick: this._onSave.bind(this)});
    this.elements.btn.save.replaceTag('save-btn', this.element);

    this.elements.btn.cancel = await Templates.init(Templates.BUTTON, {title: 'Cancel', type: 'cancel', onClick: this._onCancel.bind(this)});
    this.elements.btn.cancel.replaceTag('cancel-btn', this.element);
  }

  async onShow(input) {
    this._onSaveCallback = input.onSave;
  }

  async onUpdate(input) {

  }

  async onReset() {
    this.elements.name.update({value: ''});
    this.elements.icon.update({selected: null});
    this.elements.iconFgColor.update({hex: '#00F'});
    this.elements.iconBgColor.update({hex: '#F00'});
    this.elements.iconDisplay.update({icon: this.elements.icon.value(), fg: this.elements.iconFgColor.hex(), bg: this.elements.iconBgColor.hex(), title: this.elements.name.value()});
  }
});
