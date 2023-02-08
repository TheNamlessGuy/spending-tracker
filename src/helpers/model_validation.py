from helpers.exceptions import ValidationException

def validate(args, columns, rules):
  for key in rules:
    for cls in rules[key]:
      cls.validate(key, args)

  for key in args:
    if key not in columns:
      raise ValidationException("Unknown column '" + key + "'")

class Exists():
  def validate(self, key, args):
    if key not in args:
      raise ValidationException("Field '" + key + "' is required")

class NotExists():
  def validate(self, key, args):
    if key in args:
      raise ValidationException("Field '" + key + "' is not allowed to be specified")

class IsNull():
  def validate(self, key, args):
    if key in args and args[key] is not None:
      raise ValidationException("Field '" + key + "' must be null")

class Type():
  def __init__(self, type, *, nullable = False):
    self.type = type
    self.nullable = nullable

  def validate(self, key, args):
    if key not in args:
      return

    if args[key] is None and self.nullable:
      return

    if self.type == float and isinstance(args[key], int):
      return

    if not isinstance(args[key], self.type):
      raise ValidationException("Field '" + key + "' must be of type " + self.type.__name__)

class Len():
  def __init__(self, *, min = None, max = None):
    self.min = min
    self.max = max

  def validate(self, key, args):
    if key not in args or not isinstance(args[key], str):
      return

    length = len(args[key])
    if self.min is not None and self.min > length:
      raise ValidationException("Field '" + key + "' has to be at least " + str(self.min) + " character(s) long")
    elif self.max is not None and self.max < length:
      raise ValidationException("Field '" + key + "' cannot have more than " + str(self.max) + " character(s)")

class Relation():
  def __init__(self, cls):
    self.cls = cls

  def validate(self, key, args):
    if key not in args:
      return
    elif not isinstance(args[key], int):
      raise ValidationException("Field '" + key + "' must be of type int")

    item = self.cls.query_one(id = args[key])
    if item is None:
      raise ValidationException("Couldn't find a " + self.cls.display + " with ID " + str(args[key]))

class Unique():
  def __init__(self, cls):
    self.cls = cls

  def validate(self, key, args):
    if key not in args:
      return

    query = {}
    query[key] = args[key]
    item = self.cls.query_one(**query)
    if item is not None:
      raise ValidationException("The " + key + " '" + str(args[key]) + "' is already occupied")

class Enum():
  def __init__(self, values):
    self.values = values

  def validate(self, key, args):
    if key not in args:
      return

    if args[key] not in self.values:
      raise ValidationException("Field '" + key + "' must have one of the following values: '" + "', '".join(self.values) + "'. Given: '" + str(args[key]) + "'")

class GreaterThan():
  def __init__(self, value, *, or_equal = False):
    self.value = value
    self.or_equal = or_equal

  def validate(self, key, args):
    if key not in args:
      return

    if args[key] is None:
      return

    value = self.value
    if isinstance(value, str):
      if value not in args:
        return

      value = args[value]
      if value is None:
        return

    if args[key] > value:
      return

    if self.or_equal and args[key] == value:
      return

    raise ValidationException("Field '" + key + "' must be greater than " + ("or equal to " if self.or_equal else "") + str(value))

class IsIsoDateString():
  def __init__(self, *, nullable = False):
    self.nullable = nullable

  def validate(self, key, args):
    pass # TODO
