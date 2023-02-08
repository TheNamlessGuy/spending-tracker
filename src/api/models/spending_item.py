from flask_app import flask_app

import api.models.base as Base

from models.spending_item import Class as SpendingItem

@flask_app.route('/api/models/spending-item', methods=['GET'])
def api_models_spending_item_get():
  return Base.get(SpendingItem)

@flask_app.route('/api/models/spending-item', methods=['POST'])
def api_models_spending_item_post():
  return Base.post(SpendingItem)

@flask_app.route('/api/models/spending-item', methods=['DELETE'])
def api_models_spending_item_delete():
  return Base.delete(SpendingItem)
