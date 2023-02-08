Templates.registerType('backend-user', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    name: ['string'],
  });
});
