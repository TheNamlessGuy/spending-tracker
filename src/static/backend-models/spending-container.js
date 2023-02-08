Templates.registerType('backend-spending-container', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    date: ['string'],
    title: ['string'],
    notes: ['string', 'null'],
    spending_items: ['backend-spending-item[]', 'null'],
  });
});
