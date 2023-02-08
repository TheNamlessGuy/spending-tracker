from models.base import BaseModelClass

import models.rel_budget_category as RelBudgetCategory
import models.category as Category
import models.user as User
import models.budget_instance as BudgetInstance

import helpers.model_validation as Validate
import helpers.convert as convert
import helpers.db as db

class Class(BaseModelClass):
  display = 'Budget'
  table = 'budgets'

  def categories(self, *, force_reload = False):
    return self.get_relation('categories', force_reload, lambda: RelBudgetCategory.Class.query_all(budget_id = self.id))

  def user(self, *, force_reload = False):
    return self.get_relation('user', force_reload, lambda: User.Class.query_one(id = self.user_id))

  def budget_instances(self, *, force_reload = False):
    return self.get_relation('budget_instances', force_reload, lambda: BudgetInstance.Class.query_all(budget_id = self.id))

  def active_budget_instance(self, *, force_reload = False):
    return self.get_relation('active_budget_instance', force_reload, lambda: BudgetInstance.Class.query_one(budget_id = self.id, deactivated_at = None))

  columns = ['id', 'name', 'user_id', 'active_amount_limit', 'active_starting_amount']
  visible = ['id', 'name', 'user_id', 'active_amount_limit', 'active_starting_amount']
  relations = {
    'categories':             {'func': categories,             'reverse': 'budgets'},
    'user':                   {'func': user,                   'reverse': 'budgets'},
    'budget_instances':       {'func': budget_instances,       'reverse': 'budget'},
    'active_budget_instance': {'func': active_budget_instance, 'reverse': 'budget'},
  }

  def toJSON(self, relations_to_ignore = []):
    result = super().toJSON(relations_to_ignore + ['categories'])

    if self.is_loaded('categories'):
      result['categories'] = list(map(lambda x: x.toJSON([], 'category'), self.categories()))

    result['active_amount_limit'] = convert.to_float(result['active_amount_limit'])
    result['active_starting_amount'] = convert.to_float(result['active_starting_amount'])
    return result

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':                     [Validate.NotExists()],
      'name':                   [Validate.Exists(), Validate.Type(str), Validate.Len(min = 1)],
      'user_id':                [Validate.Exists(), Validate.Relation(User.Class)],
      'active_amount_limit':    [Validate.Type(float, nullable = True), Validate.GreaterThan('active_starting_amount', or_equal = True)],
      'active_starting_amount': [Validate.Type(float, nullable = True), Validate.GreaterThan(0, or_equal = True)],
    })

  @classmethod
  def post_create(cls, model):
    BudgetInstance.Class.create(
      budget_id = model.id,
      amount_limit = float(model.active_amount_limit) if model.active_amount_limit is not None else None,
      amount = float(model.active_starting_amount) if model.active_starting_amount is not None else 0,
      deactivated_at = None,
    )

  @classmethod
  def relation_creation(cls, model, relations):
    if 'categories' in relations:
      for category in relations['categories']:
        RelBudgetCategory.Class.create(
          budget_id = model.id,
          category_id = category['category_id'],
          type = category['type'],
        )

  def update_amount(self, spending_item, type):
    self.active_budget_instance().update_amount(spending_item, type)
