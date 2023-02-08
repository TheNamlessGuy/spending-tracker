from flask import json as flask_json
from flask_app import flask_app

def json(d, *, status=200, mimetype='application/json;charset=UTF-8'):
  return flask_app.response_class(
    response = flask_json.dumps(d),
    status = status,
    mimetype = mimetype,
  )

def _toArray(var):
  if isinstance(var, list):
    return var
  return [var]

def errors(errors, *, status = 400):
  return json({'errors': _toArray(errors)}, status = status)

def results(results, *, status = 200):
  return json({'results': _toArray(results)}, status = status)

def status(status = 200):
  return json({}, status = status)

def redirect_to(url, *, status = 200):
  return json({'redirect_to': url}, status = status)

def backend_models(models, *, status = 200, load = [], sort_by = None, sort_direction = None):
  load = _toArray(load)
  models = list(map(lambda x: x.load(load).toJSON(), _toArray(models)))

  if sort_by is not None:
    direction = sort_direction if sort_direction is not None else 'ASC'
    if direction not in ['ASC', 'DESC']:
      return errors("Unknown sort direction '" + direction + "'. Valid options: 'ASC', 'DESC'")
    models.sort(reverse = direction == 'DESC', key = lambda x: x[sort_by])

  return results(models, status = status)
