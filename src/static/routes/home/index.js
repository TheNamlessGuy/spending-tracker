class Local extends BaseLocal {
  static backendRoute = '/api/models/spending-container';
  static load = ['spending_items.item_type', 'spending_items.categories'];
  static sortBy = 'date';
  static sortDirection = 'DESC';

  static newItemButtonTitle = 'New spending entry';
  static newItemButtonModalID = Modals.HOME.SPENDING_CONTAINER.NEW;

  static async displayItems(items, container) {
    for (const item of items) {
      const template = await Templates.init(Templates.HOME.SPENDING_CONTAINER.DISPLAY, {item: item});
      template.appendTo(container);
    }
  }

  static async loadItems() {
    super.loadItems();
    Budgets.reload();
  }
}

window.addEventListener('load', Local.onLoad.bind(Local));
