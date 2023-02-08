from flask_app import flask_app

import api.models.base as Base

import helpers.session as session

from models.category import Class as Category

@flask_app.route('/api/models/category', methods=['GET'])
def api_models_category_get():
  return Base.get(Category, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/category', methods=['POST'])
def api_models_category_post():
  return Base.post(Category, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/category', methods=['DELETE'])
def api_models_category_delete():
  return Base.delete(Category, {
    'user_id': session.user().id,
  })
