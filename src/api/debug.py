# TODO: DELETEME
from flask_app import flask_app

import helpers.db as db
import helpers.request as request
import helpers.response as response

@flask_app.route('/api/debug/clear-db', methods=['POST'])
def api_debug_clear_db():
  db.drop_everything()
  return response.status(200)

@flask_app.route('/api/debug/select-all', methods=['POST'])
def api_debug_select_all():
  data = db.select_all(request.get('query'))
  return response.results(data)

@flask_app.route('/api/debug/insert', methods=['POST'])
def api_debug_insert():
  data = db.insert_one(request.get('query'))
  return response.results(data)

@flask_app.route('/api/debug/update', methods=['POST'])
def api_debug_update():
  data = db.update_one(request.get('query'))
  return response.results(data)

@flask_app.route('/api/debug/delete', methods=['POST'])
def api_debug_delete():
  data = db.delete_one(request.get('query'))
  return response.results(data)
