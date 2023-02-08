def to_float(value):
  if value is None:
    return None

  value = float(value)
  short = int(value)
  if short == value:
    return short
  else:
    return value
