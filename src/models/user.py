from models.base import BaseModelClass

import models.user_settings as UserSettings
import models.spending_container as SpendingContainer

import helpers.model_validation as Validate

class Class(BaseModelClass):
  display = 'User'
  table = 'users'

  def settings(self, *, force_reload = False):
    return self.get_relation('settings', force_reload, lambda: UserSettings.Class.query_one(user_id = self.id))

  def spending_containers(self, *, force_reload = False):
    return self.get_relation('spending_containers', force_reload, lambda: SpendingContainer.Class.query_all(user_id = self.id))

  columns = ['id', 'name']
  visible = ['id', 'name']
  relations = {
    'settings':            {'func': settings,            'reverse': 'user'},
    'spending_containers': {'func': spending_containers, 'reverse': 'user'},
  }

  def toJSON(self, relations_to_ignore = []):
    result = super().toJSON(relations_to_ignore)

    if 'settings' in result:
      result['settings'] = result['settings']['settings']

    return result

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'id':   [Validate.NotExists()],
      'name': [Validate.Exists(), Validate.Len(min = 1), Validate.Unique(Class)],
    })
