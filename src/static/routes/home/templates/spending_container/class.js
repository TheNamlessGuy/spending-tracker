Templates.register(class extends BaseTemplate {
  static keys = ['HOME', 'SPENDING_CONTAINER', 'DISPLAY'];

  static templateFile = './body.html';
  static styleFile = './style.css';

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        item: {required: true, types: ['backend-spending-container']},
      }
    };
  }

  elements = {
    title: null,
    date: null,
    value: null,
    categoryContainer: null,
  };

  async onInit(input) {
    this.elements.title = this.element.getElementsByClassName('title')[0];
    this.elements.value = this.element.getElementsByClassName('value')[0];
    this.elements.date = this.element.getElementsByClassName('date')[0];
    this.elements.categoryContainer = this.element.getElementsByClassName('category-container')[0];

    this.elements.title.innerText = input.item.title;
    this.elements.date.innerText = Helpers.formatDate(new Date(input.item.date));

    const items = input.item.spending_items ?? [];

    let value = 0;
    const displayedCategories = [];
    for (const item of items) {
      if (item.item_type.type === 'WEIGHT') {
        value += (item.item_amount * item.paid_amount);
      } else if (item.item_type.type === 'UNIT') {
        value += item.paid_amount * item.item_amount;
      } else {
        throw new Error("Unknown item_type type '" + item.item_type.type + "'");
      }

      for (const category of item.categories) {
        if (displayedCategories.includes(category.id)) {
          continue;
        }
        displayedCategories.push(category.id);

        const icon = await Templates.init(Templates.ICON, {title: category.name, icon: category.icon, fg: category.icon_fg_color, bg: category.icon_bg_color});
        icon.appendTo(this.elements.categoryContainer);
      }
    }

    value = Helpers.formatDecimals(value);
    this.elements.value.innerText = value;
    this.elements.value.classList.toggle('negative', value < 0);
    this.elements.value.classList.toggle('positive', value > 0);
  }
});
