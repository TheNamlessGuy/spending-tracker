from models.base import BaseModelClass

import models.spending_item as SpendingItem
import models.category as Category

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Relation between spending item and category'
  table = 'rel_spending_items_categories'

  def spending_item(self, *, force_reload = False):
    return self.get_relation('spending_item', force_reload, lambda: SpendingItem.Class.query_one(id = self.spending_item_id))

  def category(self, *, force_reload = False):
    return self.get_relation('category', force_reload, lambda: Category.Class.query_one(id = self.category_id))

  columns = ['id', 'category_id', 'spending_item_id']
  visible = ['id', 'category_id', 'spending_item_id']
  relations = {
    'spending_item': {'func': spending_item, 'reverse': 'categories'},
    'category':      {'func': category,      'reverse': 'spending_items'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':               [Validate.NotExists()],
      'category_id':      [Validate.Exists(), Validate.Relation(Category.Class)],
      'spending_item_id': [Validate.Exists(), Validate.Relation(SpendingItem.Class)],
    })

  def toJSON(self, relations_to_ignore = [], conversion_direction = None):
    if conversion_direction == 'spending_item':
      return self.spending_item().toJSON(relations_to_ignore)
    elif conversion_direction == 'category':
      return self.category().toJSON(relations_to_ignore)
    return super().toJSON(relations_to_ignore)

  @classmethod
  def post_create(cls, model):
    for budget_rel in model.category().budgets():
      budget_rel.update_amount(model.spending_item())
