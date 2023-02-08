from models.base import BaseModelClass

import models.budget as Budget
import models.category as Category

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Relation between budget and category'
  table = 'rel_budgets_categories'

  def budget(self, *, force_reload = False):
    return self.get_relation('budget', force_reload, lambda: Budget.Class.query_one(id = self.budget_id))

  def category(self, *, force_reload = False):
    return self.get_relation('category', force_reload, lambda: Category.Class.query_one(id = self.category_id))

  columns = ['id', 'category_id', 'budget_id', 'type']
  visible = ['id', 'category_id', 'budget_id', 'type']
  relations = {
    'budget':   {'func': budget, 'reverse': 'categories'},
    'category': {'func': category, 'reverse': 'budgets'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':          [Validate.NotExists()],
      'budget_id':   [Validate.Exists(), Validate.Relation(Budget.Class)],
      'category_id': [Validate.Exists(), Validate.Relation(Category.Class)],
      'type':        [Validate.Exists(), Validate.Enum(('ADD', 'SUB', 'RESET'))],
    })

  def toJSON(self, relations_to_ignore = [], conversion_direction = None):
    if conversion_direction == 'budget':
      data = self.budget().toJSON(relations_to_ignore)
      data['type'] = self.type
      return data
    elif conversion_direction == 'category':
      data = self.category().toJSON(relations_to_ignore)
      data['type'] = self.type
      return data
    return super().toJSON(relations_to_ignore)

  def update_amount(self, spending_item):
    self.budget().update_amount(spending_item, self.type)
