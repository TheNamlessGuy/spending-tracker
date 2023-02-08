class Local extends BaseLocal {
  static backendRoute = '/api/models/item-type';
  static sortBy = 'name';

  static loadBudgets = true;

  static newItemButtonTitle = 'New item type';
  static newItemButtonModalID = Modals.ITEM_TYPE.NEW;

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
        name: 'Type',
        display: (item) => item.type,
      }, {
        name: 'Notes',
        display: (item) => item.notes,
      }],
      buttons: [{
        display: {
          type: 'cancel',
          icon: 'trash',
          tooltip: 'Delete item type',
        },
        onClick: Local.onDeleteItem.bind(Local),
      }],
    });

    table.appendTo(container);
  }
}

window.addEventListener('load', Local.onLoad.bind(Local));
