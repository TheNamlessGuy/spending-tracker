Templates.registerType('backend-budget', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    name: ['string'],
    user_id: ['number'],
    active_amount_limit: ['number', 'null'],
    active_starting_amount: ['number', 'null'],

    categories: ['null', 'backend-category[]'],
    user: ['null', 'backend-user'],
    budget_instances: ['null', 'backend-budget-instance[]'],
    active_budget_instance: ['null', 'backend-budget-instance'],
  });
});
