import helpers.request as request
import helpers.response as response

from helpers.exceptions import ValidationException

def get(cls, forced = {}):
  load     = request.get('load',           default = [])
  sort_by  = request.get('sort-by',        default = None)
  sort_dir = request.get('sort-direction', default = 'ASC')
  query    = request.get('query',          default = {})

  query.update(forced)

  try:
    items = cls.query_all(**query)
  except ValidationException as e:
    return response.errors(e.message)

  return response.backend_models(
    items,
    load           = load,
    sort_by        = sort_by,
    sort_direction = sort_dir,
  )

def post(cls, forced = {}):
  query = {}
  req = request.get_all()

  for key in req:
    if key in cls.columns or key in cls.relations:
      query[key] = req[key]
  #for column in cls.columns:
  #  if request.has(column):
  #    query[column] = request.get(column)

  query.update(forced)

  try:
    item = cls.create(**query)
  except ValidationException as e:
    return response.errors(e.message)

  return response.backend_models(item)

def delete(cls, forced = {}):
  query = {
    'id': request.get('id'),
  }

  query.update(forced)

  try:
    item = cls.query_one(**query)
  except ValidationException as e:
    return response.errors(e.message)

  item.delete()
  return response.status(200)
