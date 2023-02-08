from flask_app import flask_app

import api.models.base as Base

import helpers.session as session

from models.spending_container import Class as SpendingContainer

@flask_app.route('/api/models/spending-container', methods=['GET'])
def api_models_spending_container_get():
  return Base.get(SpendingContainer, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/spending-container', methods=['POST'])
def api_models_spending_container_post():
  return Base.post(SpendingContainer, {
    'user_id': session.user().id,
  })

@flask_app.route('/api/models/spending-container', methods=['DELETE'])
def api_models_spending_container_delete():
  return Base.delete(SpendingContainer, {
    'user_id': session.user().id,
  })
