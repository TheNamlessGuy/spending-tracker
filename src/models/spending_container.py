from models.base import BaseModelClass

import models.user as User
import models.spending_item as SpendingItem

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Spending Container'
  table = 'spending_containers'

  def user(self, *, force_reload = False):
    return self.get_relation('user', force_reload, lambda: User.Class.get(id = self.user_id))

  def spending_items(self, *, force_reload = False):
    return self.get_relation('spending_items', force_reload, lambda: SpendingItem.Class.query_all(spending_container_id = self.id))

  columns = ['id', 'user_id', 'date', 'title', 'notes']
  visible = ['id', 'date', 'title', 'notes']
  relations = {
    'user':           {'func': user,           'reverse': 'spending_containers'},
    'spending_items': {'func': spending_items, 'reverse': 'spending_container'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':      [Validate.NotExists()],
      'user_id': [Validate.Exists(), Validate.Relation(User.Class)],
      'date':    [Validate.Exists(), Validate.IsIsoDateString()],
      'title':   [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)],
      'notes':   [Validate.Exists(), Validate.Type(str, nullable = True), Validate.Len(min = 1)],
    })

  @classmethod
  def relation_creation(cls, model, relations):
    if 'spending_items' in relations:
      for item in relations['spending_items']:
        categories = item['categories'] if 'categories' in item else []

        SpendingItem.Class.create(
          spending_container_id = model.id,

          paid_amount   = item['paid_amount'],
          actual_amount = item['actual_amount'],
          item_amount   = item['item_amount'],
          item_type_id  = item['item_type_id'],
          notes         = item['notes'],
          weight_unit   = item['weight_unit'],

          categories    = categories,
        )

  def delete_relations(self):
    for item in self.spending_items():
      item.delete()
