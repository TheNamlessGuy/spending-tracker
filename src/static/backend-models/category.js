Templates.registerType('backend-category', function(value) {
  return Templates.valueIsObject(value, {
    id: ['number'],
    name: ['string'],
    icon: ['string'],
    icon_fg_color: ['string'],
    icon_bg_color: ['string'],
    user_id: ['number'],
  });
});
