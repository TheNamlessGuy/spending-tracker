from flask import g

def is_api(value = None):
  if value is None:
    return g.is_api if 'is_api' in g else False
  g.is_api = value

def request_body(value = None):
  if value is None:
    return g.request_body if 'request_body' in g else {}
  g.request_body = value
