class BaseLocal {
  static errors = null;
  static errorsTag = 'errors';

  static loadBudgets = false;

  static backendRoute = null;
  static load = [];
  static sortBy = null;
  static sortDirection = 'ASC';

  static itemContainerID = 'item-container';

  static newItemButtonType = 'info';
  static newItemButtonTag = 'add-new-item-btn';
  static newItemButtonTitle = null;
  static newItemButtonModalID = null;

  static async displayItems(items, container) {
    throw new Error('Local.displayItems must be overridden');
  }

  static async loadItems() {
    this.errors.clear();

    const container = document.getElementById(this.itemContainerID);
    Helpers.clearContainer(container);

    const loading = await Templates.init(Templates.LOADING);
    loading.appendTo(container);

    Backend.get(this.backendRoute, {load: this.load, 'sort-by': this.sortBy, 'sort-direction': this.sortDirection})
      .onSuccess(async (response) => await this.displayItems(response.results(), container))
      .onFailure((response) => this.errors.add('Failed to load', ...response.errors()))
      .finally(() => loading.remove())
      .send();
  }

  static async onAddNewItem() {
    Modals.show(this.newItemButtonModalID, {onSave: () => {
      this.loadItems();
    }}, true);
  }

  static async onLoad() {
    this.errors = await Templates.init(Templates.ERRORS);
    this.errors.replaceTag(this.errorsTag);
    window.addEventListener('error', this.onError.bind(this));

    this.loadItems();

    if (this.loadBudgets) {
      Budgets.reload();
    }

    Templates.init(Templates.BUTTON, {
      type: this.newItemButtonType,
      title: this.newItemButtonTitle,
      onClick: this.onAddNewItem.bind(this),
    }).then(x => x.replace(document.getElementsByTagName(this.newItemButtonTag)[0]));
  }

  static async onError(e) {
    this.errors.add('Frontend exception', e);
  }
}
