from models.base import BaseModelClass

import models.rel_budget_category as RelBudgetCategory
import models.rel_spending_item_category as RelSpendingItemCategory
import models.user as User

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Category'
  table = 'categories'

  def budgets(self, *, force_reload = False):
    return self.get_relation('budgets', force_reload, lambda: RelBudgetCategory.Class.query_all(category_id = self.id))

  def user(self, *, force_reload = False):
    return self.get_relation('user', force_reload, lambda: User.Class.query_one(id = self.user_id))

  def spending_items(self, *, force_reload = False):
    return self.get_relation('spending_items', force_reload, lambda: RelSpendingItemCategory.Class.query_all(category_id = self.id))

  columns = ['id', 'name', 'user_id', 'icon', 'icon_fg_color', 'icon_bg_color']
  visible = ['id', 'name', 'user_id', 'icon', 'icon_fg_color', 'icon_bg_color']
  relations = {
    'budgets':        {'func': budgets,        'reverse': 'categories'},
    'user':           {'func': user,           'reverse': 'categories'},
    'spending_items': {'func': spending_items, 'reverse': 'categories'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':            [Validate.NotExists()],
      'name':          [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)],
      'user_id':       [Validate.Exists(), Validate.Relation(User.Class)],
      'icon':          [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)], # TODO: Validate.IsIcon
      'icon_fg_color': [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)], # TODO: Validate.IsColor
      'icon_bg_color': [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)], # TODO: Validate.IsColor
    })
