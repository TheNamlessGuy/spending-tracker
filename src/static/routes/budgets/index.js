class Local extends BaseLocal {
  static backendRoute = '/api/models/budget';
  static sortBy = 'name';
  static load = ['categories'];

  static newItemButtonTitle = 'New budget';
  static newItemButtonModalID = Modals.BUDGETS.NEW;

  static async onDeleteItem(item) {
    console.log('Local.onDeleteItem', item);
  }

  static async displayCategories(item, type) {
    const container = document.createElement('span');

    for (const category of item.categories) {
      if (category.type !== type) { continue; }
      const icon = await Templates.init(Templates.ICON, {title: category.name, icon: category.icon, fg: category.icon_fg_color, bg: category.icon_bg_color});
      icon.appendTo(container);
    }

    return container;
  }

  static async loadItems() {
    super.loadItems();
    Budgets.reload();
  }

  static async displayItems(items, container) {
    const table = await Templates.init(Templates.TABLE, {
      items: items,
      columns: [{
        name: 'Name',
        display: (item) => item.name,
      }, {
        name: 'Starting amount',
        display: (item) => Helpers.valueOrEmpty(item.active_starting_amount),
      }, {
        name: 'Limit',
        display: (item) => Helpers.valueOrEmpty(item.active_amount_limit),
      }, {
        name: 'Addition categories',
        display: (item) => Local.displayCategories(item, 'ADD'),
      }, {
        name: 'Subtraction categories',
        display: (item) => Local.displayCategories(item, 'SUB'),
      }, {
        name: 'Reset categories',
        display: (item) => Local.displayCategories(item, 'RESET'),
      }],
      buttons: [{
        display: {
          type: 'cancel',
          icon: 'trash',
          tooltip: 'Delete budget',
        },
        onClick: Local.onDeleteItem.bind(Local),
      }],
    });

    table.appendTo(container);
  }
}

window.addEventListener('load', Local.onLoad.bind(Local));
