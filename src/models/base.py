from abc import ABCMeta, abstractmethod

import helpers.db as db
import helpers.models as ModelHelper

class BaseModelClass(metaclass = ABCMeta):
  # Abstract
  @property
  @abstractmethod
  def table():
    raise NotImplementedError()

  @property
  @abstractmethod
  def display():
    raise NotImplementedError()

  @property
  @abstractmethod
  def columns():
    raise NotImplementedError()

  @property
  @abstractmethod
  def visible():
    raise NotImplementedError()

  @property
  @abstractmethod
  def relations():
    raise NotImplementedError()

  @classmethod
  @abstractmethod
  def create_validation(cls, kwargs, relations):
    raise NotImplementedError()

  @classmethod
  def post_create(cls, model):
    pass

  @classmethod
  def relation_creation(cls, model, relations):
    pass

  # Real
  def __init__(self, data, **kwargs):
    self._dict = data

    for key in kwargs:
      if key not in self.relations:
        raise Exception('Initialization kwarg "' + key + '" is not a recognized relation')
      self._dict[key] = kwargs[key]

  def __getitem__(self, key):
    if key not in self.columns:
      raise Exception('Requested item "' + str(key) + '" not recognized')

    return self._dict[key]

  def __setitem__(self, key, value):
    if key not in self.columns:
      raise Exception('Requested item "' + str(key) + '" not recognized')

    self._dict[key] = value

  def __getattr__(self, key):
    return self.__getitem__(key)

  def __setattr__(self, key, value):
    if key in ['_dict', 'columns', 'visible', 'relations']:
      return super().__setattr__(key, value);
    return self.__setitem__(key, value)

  def get_relation(self, key, force_reload, getter):
    if force_reload or key not in self._dict:
      self._dict[key] = getter()
      # TODO: Set 'reverse' = self
    return self._dict[key]

  def is_loaded(self, relation):
    return relation in self._dict

  def get_loaded_relations(self):
    retval = []

    for relation in self.relations:
      if self.is_loaded(relation):
        #data = self.relations[relation]['func'](self) # TODO: Get the relations loaded relations, add together to a list. If did ".load(['a.b', 'a.c'])" and then ".get_loaded_relations()" it should return ['a.b', 'a.c']
        retval.append(relation)

    return retval

  def _parse_relations(self, relations):
    retval = {}

    for relation in relations:
      split = relation.split(',')
      for r in split:
        load = None
        if '.' in r:
          [r, load] = r.split('.', 1)

        data = retval[r] if r in retval else {'load': []}
        if load is not None:
          data['load'].append(load)

        retval[r] = data

    return retval

  def load(self, relations, *, force_reload = False):
    relations = self._parse_relations(relations)

    for relation in relations:
      if not self.is_loaded(relation):
        data = self.relations[relation]['func'](self, force_reload = force_reload)

        if len(relations[relation]['load']) > 0:
          if isinstance(data, list):
            for entry in data:
              entry.load(relations[relation]['load'])
          else:
            data.load(relations[relation]['load'])

    # TODO: Set 'reverse' = self
    return self

  def toJSON(self, relations_to_ignore = []):
    retval = {}

    for column in self.visible:
      retval[column] = self[column]

    for key in self.relations:
      if key not in relations_to_ignore and self.is_loaded(key):
        ignore = self.relations[key]['reverse']
        if not isinstance(ignore, list):
          ignore = [ignore]

        data = self.relations[key]['func'](self)
        if isinstance(data, list):
          data = list(map(lambda x: x.toJSON(ignore), data))
        elif data is not None:
          data = data.toJSON(ignore)

        retval[key] = data

    return retval

  def delete_relations(self):
    pass # To be overriden in child classes

  def delete(self):
    self.delete_relations()
    db.delete_one(ModelHelper.delete(type(self).table, 'id = %s'), [self.id])
    return True

  def update(self, **kwargs):
    data = db.update_one(ModelHelper.update(type(self).table, kwargs.keys(), 'id = %s'), list(kwargs.values()) + [self.id])
    if data is not None:
      self._dict = data
      return True
    return False

  @classmethod
  def _get_query(cls, kwargs, *, validate = True):
    query = ''
    data = []

    for key in kwargs:
      if validate and key not in cls.columns:
        raise Exception('Key "' + str(key) + '" not found among columns')
      if len(query) > 0: query += ' AND '

      value = kwargs[key]
      if value is None:
        query += key + ' is NULL'
      else:
        query += key + ' = %s'
        data.append(value)

    return [query, data]

  @classmethod
  def query_one(cls, **kwargs):
    [query, data] = cls._get_query(kwargs)
    result = db.select_one(ModelHelper.select(cls.table, query), data)
    return cls(result) if result is not None else None

  @classmethod
  def query_all(cls, **kwargs):
    [query, data] = cls._get_query(kwargs)
    result = db.select_all(ModelHelper.select(cls.table, query), data)
    return list(map(lambda x: cls(x), result))

  @classmethod
  def query_all_via(cls, *, bridge_table, bridge_table_column, **kwargs):
    [query, data] = cls._get_query(kwargs, validate = False)
    result = db.select_all(ModelHelper.select_via(cls.table, 'id', bridge_table, bridge_table_column, query), data)
    return list(map(lambda x: cls(x), result))

  @classmethod
  def create(cls, **kwargs):
    keys = []
    values = []

    relations = {}
    kwarg_keys = list(kwargs.keys())
    for key in kwarg_keys:
      if key in cls.relations:
        relations[key] = kwargs[key]
        del kwargs[key]

    for key in kwargs:
      if key not in cls.columns: # TODO: Column type and value validation. Define cls.settable, formatted: {column: {'type': type, ?'validate_exists': () => {...}, 'nullable': boolean}}
        raise Exception('Key "' + str(key) + '" not found among columns')

      keys.append(key)
      values.append(kwargs[key])

    cls.create_validation(kwargs, relations)

    model = db.insert_one(ModelHelper.insert(cls.table, keys), values)
    model = cls(model) if model is not None else None

    if model is not None:
      cls.post_create(model)

      if len(relations) > 0:
        try:
          cls.relation_creation(model, relations)
        except Exception as e:
          model.delete()
          raise e

    return model

  @classmethod
  def get_or_create(cls, **kwargs):
    result = cls.query_one(**kwargs)
    if result is not None:
      return result

    return cls.create(**kwargs)
