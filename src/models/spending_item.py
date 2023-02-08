from models.base import BaseModelClass

import models.spending_container as SpendingContainer
import models.item_type as ItemType
import models.rel_spending_item_category as RelSpendingItemCategory

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'Spending Item'
  table = 'spending_items'

  def spending_container(self, *, force_reload = False):
    return self.get_relation('spending_containers', force_reload, lambda: SpendingContainer.Class.query_one(id = self.spending_container_id))

  def item_type(self, *, force_reload = False):
    return self.get_relation('item_type', force_reload, lambda: ItemType.Class.query_one(id = self.item_type_id))

  def categories(self, *, force_reload = False):
    return self.get_relation('categories', force_reload, lambda: RelSpendingItemCategory.Class.query_all(spending_item_id = self.id))

  columns = ['id', 'paid_amount', 'actual_amount', 'item_amount', 'item_type_id', 'spending_container_id', 'notes', 'weight_unit']
  visible = ['id', 'paid_amount', 'actual_amount', 'item_amount', 'item_type_id', 'spending_container_id', 'notes', 'weight_unit']
  relations = {
    'spending_container': {'func': spending_container, 'reverse': 'spending_items'},
    'item_type':          {'func': item_type,          'reverse': 'spending_items'},
    'categories':         {'func': categories,         'reverse': 'spending_item'},
  }

  def toJSON(self, relations_to_ignore = []):
    result = super().toJSON(relations_to_ignore + ['categories'])

    if self.is_loaded('categories'):
      result['categories'] = list(map(lambda x: x.toJSON([], 'category'), self.categories()))

    result['paid_amount'] = float(result['paid_amount'])
    result['actual_amount'] = float(result['actual_amount'])
    result['item_amount'] = float(result['item_amount'])
    return result

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':                    [Validate.NotExists()],
      'notes':                 [Validate.Exists(), Validate.Type(str, nullable = True), Validate.Len(min = 1)],
      'item_type_id':          [Validate.Exists(), Validate.Relation(ItemType.Class)],
      'spending_container_id': [Validate.Exists(), Validate.Relation(SpendingContainer.Class)],
    })

    item_type = ItemType.Class.query_one(id = kwargs['item_type_id'])
    if item_type.type == 'UNIT':
      Validate.validate(kwargs, cls.columns, {
        'item_amount':   [Validate.Exists(), Validate.Type(int), Validate.GreaterThan(0)],
        'paid_amount':   [Validate.Exists(), Validate.Type(float)],
        'actual_amount': [Validate.Exists(), Validate.Type(float)],
        'weight_unit':   [Validate.Exists(), Validate.IsNull()],
      })
    elif item_type.type == 'WEIGHT':
      Validate.validate(kwargs, cls.columns, {
        'item_amount':   [Validate.Exists(), Validate.Type(float), Validate.GreaterThan(0)],
        'paid_amount':   [Validate.Exists(), Validate.Type(float)],
        'actual_amount': [Validate.Exists(), Validate.Type(float)],
        'weight_unit':   [Validate.Exists(), Validate.Enum(('KG',))],
      })
    else:
      raise Exception('Unknown item type "' + str(item_type.type) + '"')

  @classmethod
  def relation_creation(cls, model, relations):
    if 'categories' in relations:
      for category_id in relations['categories']:
        RelSpendingItemCategory.Class.create(
          spending_item_id = model.id,
          category_id = category_id,
        )
