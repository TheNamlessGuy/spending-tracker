from flask import request
from flask_app import flask_app

import helpers.globals as globals
import helpers.session as session
import helpers.error_handling as error_handling

unsecure_addresses = [
  ['/api/login', 'POST'],
  ['/api/models/user', 'GET'],
  ['/api/models/user', 'POST'],
]

@flask_app.before_request
def is_api():
  globals.is_api(request.path.startswith('/api/'))
  if globals.is_api():
    if not session.is_logged_in_as_valid_user():
      is_unsecure_call = request.path.startswith('/api/debug/')
      if not is_unsecure_call:
        for address in unsecure_addresses:
          if request.path == address[0] and request.method == address[1]:
            is_unsecure_call = True
            break
        if not is_unsecure_call:
          session.unset_user()
          return error_handling.errorhandling_401(None)

    if request.method in ['POST', 'DELETE']:
      globals.request_body(request.get_json())
    elif request.method == 'GET':
      globals.request_body(request.args)
