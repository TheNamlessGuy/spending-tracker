Modals.register(class extends BaseModal {
  static keys = ['LOGIN', 'USER', 'NEW'];

  static template = `
<div>
  <div class="modal-title">Add new user</div>
  <errors></errors>
  <div class="modal-row">
    <name-input></name-input>
  </div>
  <div class="modal-row modal-button-row">
    <ok-btn></ok-btn>
    <cancel-btn></cancel-btn>
  </div>
</div>
`;

  static style = '.errors { margin: 5px; }';

  static inputRules() {
    return {
      onSave: {required: true},
    };
  }

  elements = {
    input: null,
    errors: null,

    btn: {
      ok: null,
      cancel: null,
    },
  };

  _onSaveCallback = null;
  _onSave(response) {
    this._onSaveCallback(response.results()[0]);
  }

  _onFailureCallback = null;
  _onFailure(response) {
    Modals.hide(Modals.LOADING);
    Modals.show(this.self.id, {}, false, false);
    response.errors().forEach(x => this.elements.errors.add(x));

    if (this._onFailureCallback) { this._onFailureCallback(response.errors()); }
  }

  _onOKClick() {
    this.elements.errors.clear();

    Modals.hide(this.self.id);
    Modals.show(Modals.LOADING, {title: 'Creating new user...'}, true);
    Backend.post('/api/models/user', {name: this.elements.input.value()})
      .onSuccess(this._onSave.bind(this))
      .onFailure(this._onFailure.bind(this))
      .finally(() => Modals.hide(Modals.LOADING))
      .send();
  }

  _onCancelClick() {
    Modals.hide(this.self.id);
  }

  async onInit() {
    this.elements.errors = await Templates.init(Templates.ERRORS);
    this.elements.errors.replaceTag('errors', this.element);

    this.elements.input = await Templates.init(Templates.INPUT, {type: 'text', title: 'Name', value: '', placeholder: 'User name', trim: true, onEnter: this._onOKClick.bind(this)});
    this.elements.input.replaceTag('name-input', this.element);

    this.elements.btn.ok = await Templates.init(Templates.BUTTON, {type: 'ok', title: 'OK', onClick: this._onOKClick.bind(this)});
    this.elements.btn.ok.replaceTag('ok-btn', this.element);

    this.elements.btn.cancel = await Templates.init(Templates.BUTTON, {type: 'cancel', title: 'Cancel', onClick: this._onCancelClick.bind(this)});
    this.elements.btn.cancel.replaceTag('cancel-btn', this.element);
  }

  async onShow(input) {
    this._onSaveCallback = input.onSave;
    this._onFailureCallback = input.onFailure;

    setTimeout(() => this.elements.input.focus());
  }

  async onHide() {}
  async onReset() {
    this.elements.errors.clear();
    this.elements.input.update({value: ''});
  }
});
