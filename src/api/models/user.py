from flask_app import flask_app

import api.models.base as Base

from models.user import Class as User

@flask_app.route('/api/models/user', methods = ['GET'])
def api_models_user_get():
  return Base.get(User)

@flask_app.route('/api/models/user', methods = ['POST'])
def api_models_user_post():
  return Base.post(User)

@flask_app.route('/api/models/user', methods = ['DELETE'])
def api_models_user_delete():
  return Base.delete(User)
