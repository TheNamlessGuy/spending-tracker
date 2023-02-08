Templates.registerType('backend-spending-item', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    paid_amount: ['number'],
    actual_amount: ['number'],
    item_amount: ['number'],
    item_type_id: ['number'],
    spending_container_id: ['number'],
    notes: ['string', 'null'],
    weight_unit: ['string', 'null'],

    item_type: ['backend-item-type', 'null'],
    categories: ['backend-category[]', 'null']
  });
});
