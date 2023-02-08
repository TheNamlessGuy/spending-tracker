from flask import request

import helpers.globals as globals

def has(key):
  data = globals.request_body()
  return key in data

def get(key, *, default = None):
  data = globals.request_body()
  return data[key] if key in data else default

def get_all():
  return dict(globals.request_body())
