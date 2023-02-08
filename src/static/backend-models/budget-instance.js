Templates.registerType('backend-budget-instance', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    amount: ['number'],
    amount_limit: ['number', 'null'],
    budget_id: ['number'],
    deactivated_at: ['string', 'null'],

    budget: ['null', 'backend-budget'],
    active: ['null', 'backend-budget-instance'],
    inactive: ['null', 'backend-budget-instance[]'],
  });
});
