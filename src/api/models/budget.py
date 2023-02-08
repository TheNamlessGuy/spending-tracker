from flask_app import flask_app

import api.models.base as Base

import helpers.session as session

from models.budget import Class as Budget

@flask_app.route('/api/models/budget', methods=['GET'])
def api_models_budget_get():
  return Base.get(Budget, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/budget', methods=['POST'])
def api_models_budget_post():
  return Base.post(Budget, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/budget', methods=['DELETE'])
def api_models_budget_delete():
  return Base.delete(Budget, {
    'user_id': session.user().id,
  })
