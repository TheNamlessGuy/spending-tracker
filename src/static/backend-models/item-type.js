Templates.registerType('backend-item-type-type', function(value) {
  return ['WEIGHT', 'UNIT'].includes(value);
});

Templates.registerType('backend-item-type', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    name: ['string'],
    type: ['backend-item-type-type'],
    notes: ['string', 'null'],
  });
});
