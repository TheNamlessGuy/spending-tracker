from models.base import BaseModelClass

import models.spending_item as SpendingItem

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Item Type'
  table = 'item_types'

  def spending_items(self, *, force_reload = False):
    return self.get_relation('spending_items', force_reload, lambda: SpendingItem.Class.query_all(item_type_id = self.id))

  columns = ['id', 'name', 'type', 'notes']
  visible = ['id', 'name', 'type', 'notes']
  relations = {
    'spending_items': {'func': spending_items, 'reverse': 'item_type'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':    [Validate.NotExists()],
      'name':  [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)],
      'type':  [Validate.Exists(), Validate.Enum(('WEIGHT', 'UNIT'))],
      'notes': [Validate.Exists(), Validate.Type(str, nullable = True), Validate.Len(min = 1)],
    })
