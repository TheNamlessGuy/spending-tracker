class Local extends BaseLocal {
  static backendRoute = '/api/models/category';
  static sortBy = 'name';

  static loadBudgets = true;

  static newItemButtonTitle = 'New category';
  static newItemButtonModalID = Modals.CATEGORIES.CATEGORY.NEW;

  static async onDeleteItem(item) {
    console.log('Local.onDeleteItem', item);
  }

  static async displayItems(items, container) {
    const table = await Templates.init(Templates.TABLE, {
      items: items,
      columns: [{
        name: 'Name',
        display: (item) => item.name,
      }, {
        name: 'Icon',
        display: async (item) => await Templates.init(Templates.ICON, {title: item.name, icon: item.icon, fg: item.icon_fg_color, bg: item.icon_bg_color}),
      }],
      buttons: [{
        display: {
          type: 'cancel',
          icon: 'trash',
          tooltip: 'Delete category',
        },
        onClick: Local.onDeleteItem.bind(Local),
      }],
    });

    table.appendTo(container);
  }
}

window.addEventListener('load', Local.onLoad.bind(Local));
