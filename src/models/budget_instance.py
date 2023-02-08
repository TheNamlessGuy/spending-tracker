from models.base import BaseModelClass

import models.budget as Budget

import helpers.model_validation as Validate
import helpers.convert as convert

class Class(BaseModelClass):
  display = 'Budget Instance'
  table = 'budget_instances'

  def budget(self, *, force_reload = False):
    return self.get_relation('budget', force_reload, lambda: Budget.Class.query_one(id = self.budget_id))

  def active(self, *, force_reload = False):
    return self.get_relation('active', force_reload, lambda: Class.query_one(budget_id = self.budget_id, deactivated_at = None))

  def inactive(self, *, force_reload = False):
    return self.get_relation('inactive', force_reload, lambda: Class.query_all(budget_id = self.budget_id)) # TODO: deactivated_at != None

  columns = ['id', 'budget_id', 'amount_limit', 'amount', 'deactivated_at']
  visible = ['id', 'budget_id', 'amount_limit', 'amount', 'deactivated_at']
  relations = {
    'budget':   {'func': budget,   'reverse': 'budget_instances'},
    'active':   {'func': active,   'reverse': 'inactive'},
    'inactive': {'func': inactive, 'reverse': 'active'},
  }

  def toJSON(self, relations_to_ignore = []):
    result = super().toJSON(relations_to_ignore)
    result['amount'] = convert.to_float(result['amount'])
    result['amount_limit'] = convert.to_float(result['amount_limit'])
    return result

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':             [Validate.NotExists()],
      'budget_id':      [Validate.Exists(), Validate.Relation(Budget.Class)],
      'amount_limit':   [Validate.Type(float, nullable = True), Validate.GreaterThan('amount', or_equal = True)],
      'amount':         [Validate.Exists(), Validate.Type(float), Validate.GreaterThan(0, or_equal = True)],
      'deactivated_at': [Validate.Exists(), Validate.IsIsoDateString(nullable = True)],
    })

  def update_amount(self, spending_item, type):
    amount = convert.to_float(self.amount)
    paid = convert.to_float(spending_item.paid_amount)

    if spending_item.item_type().type == 'WEIGHT':
      paid *= convert.to_float(spending_item.item_amount)
    elif spending_item.item_type().type == 'UNIT':
      paid *= convert.to_float(spending_item.item_amount)
    else:
      print('UNKNOWN ITEM TYPE TYPE', spending_item.item_type().type)

    if type == 'RESET':
      amount = convert.to_float(self.budget().active_starting_amount)
      if amount is None:
        amount = paid
    elif type == 'ADD':
      amount -= paid
    elif type == 'SUB':
      amount += paid

    if amount != self.amount:
      self.update(amount = amount)
