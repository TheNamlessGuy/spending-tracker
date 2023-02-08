from flask import render_template
from flask_app import flask_app

import traceback

import helpers.globals as globals
import helpers.response as response

def render_error_page(httpcode, title, description = None):
  return render_template(
    'error.html',
    code = httpcode,
    title = title,
    description = description,
  )

@flask_app.errorhandler(401)
def errorhandling_401(e):
  if globals.is_api():
    return response.errors('Unauthorized', status = 401)
  return render_error_page(401, 'Unauthorized')

@flask_app.errorhandler(404)
def errorhandling_404(e):
  if globals.is_api():
    return response.errors('Not Found', status = 404)
  return render_error_page(404, 'Not Found')

@flask_app.errorhandler(405)
def errorhandling_405(e):
  if globals.is_api():
    return response.errors('Method not allowed', status = 405)
  return render_error_page(405, 'Method not allowed')

@flask_app.errorhandler(Exception)
def errorhandling_exception(e):
  lines = [l[:-1].split('\n') for l in traceback.format_exception(type(e), e, e.__traceback__)]
  lines = [item for sublist in lines for item in sublist]
  print('EXCEPTION:\n' + '\n'.join(lines))

  if globals.is_api():
    return response.errors('Internal Error\n' + '\n'.join(lines), status = 500)

  return render_error_page(500, 'Internal Error', lines)
