from models.base import BaseModelClass

import models.user as User

import helpers.db as db
import helpers.models as ModelHelper

class Class(BaseModelClass):
  display = 'User Settings'
  table = 'user_settings'

  def user(self, *, force_reload = False):
    return self.get_relation('user', force_reload, lambda: User.Class.query_one(id = self.user_id))

  columns = ['user_id', 'settings']
  visible = ['settings']
  relations = {
    'user': {'func': user, 'reverse': 'settings'},
  }

  @classmethod
  def create_validation(cls, kwargs, relations):
    Validate.validate(kwargs, cls.columns, {
      'user_id':  [Validate.Exists(), Validate.Relation(User.Class)],
      'settings': [Validate.Exists()],
    })

    # TODO: Validate settings is a JSON
