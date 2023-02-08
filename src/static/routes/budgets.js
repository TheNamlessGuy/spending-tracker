Templates.register(class extends BaseTemplate {
  static keys = ['SIDEBAR', 'BUDGET', 'DISPLAY'];

  static template = `
<div class="budget">
  <div class="name"></div>
  <div class="has-total hidden">
    <span class="amount"></span> / <span class="total"></span>
  </div>
  <div class="no-total hidden">
    <span class="amount"></span>
  </div>
</div>
`;

  static inputRules() {
    return {
      ...super.inputRules(),
      ...{
        budget: {required: true, types: ['backend-budget']},
      },
    };
  }

  elements = {
    name: null,

    hasTotal: {
      container: null,
      amount: null,
      total: null,
    },

    noTotal: {
      container: null,
      amount: null,
    },
  };

  _getAmountType(amount, limit) {
    if (amount > limit) {
      return 'negative';
    } else if (amount < limit) {
      return 'positive';
    }

    return null;
  }

  async onInit(input) {
    this.elements.name = this.element.getElementsByClassName('name')[0];

    this.elements.hasTotal.container = this.element.getElementsByClassName('has-total')[0];
    this.elements.hasTotal.amount = this.elements.hasTotal.container.getElementsByClassName('amount')[0];
    this.elements.hasTotal.total = this.elements.hasTotal.container.getElementsByClassName('total')[0];

    this.elements.noTotal.container = this.element.getElementsByClassName('no-total')[0];
    this.elements.noTotal.amount = this.elements.noTotal.container.getElementsByClassName('amount')[0];

    this.elements.name.innerText = input.budget.name;

    if (input.budget.active_budget_instance.amount_limit == null) {
      this.elements.noTotal.amount.innerText = Helpers.formatDecimals(input.budget.active_budget_instance.amount);
      this.elements.noTotal.container.classList.remove('hidden');
    } else {
      this.elements.hasTotal.amount.innerText = Helpers.formatDecimals(input.budget.active_budget_instance.amount);

      const type = this._getAmountType(input.budget.active_budget_instance.amount, input.budget.active_budget_instance.amount_limit);
      if (type != null) {
        this.elements.hasTotal.amount.classList.add(type);
      }

      this.elements.hasTotal.total.innerText = input.budget.active_budget_instance.amount_limit;
      this.elements.hasTotal.container.classList.remove('hidden');
    }
  }
});

const Budgets = {
  errors: null,

  reload: async function() {
    await Budgets.loadItems();
  },

  displayItems: async function(items, container) {
    for (const item of items) {
      const template = await Templates.init(Templates.SIDEBAR.BUDGET.DISPLAY, {budget: item});
      template.appendTo(container);
    }
  },

  loadItems: async function() {
    const container = document.getElementById('budgets-container');
    Helpers.clearContainer(container);

    const loading = await Templates.init(Templates.LOADING);
    loading.appendTo(container);

    Backend.get('/api/models/budget', {load: ['active_budget_instance'], 'sort-by': 'name', 'sort-direction': 'ASC'})
      .onSuccess(async (response) => await this.displayItems(response.results(), container))
      .onFailure((response) => this.errors.add('Failed to load', ...response.errors()))
      .finally(() => loading.remove())
      .send();
  },

  onLoad: async function() {
    Budgets.errors = await Templates.init(Templates.ERRORS);
    Budgets.errors.replaceTag('budget-errors', document.getElementById('budgets-container-container'));
  },
};

window.addEventListener('load', Budgets.onLoad.bind(Budgets));
