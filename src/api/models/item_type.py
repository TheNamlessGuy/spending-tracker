from flask_app import flask_app

import api.models.base as Base

from models.item_type import Class as ItemType

@flask_app.route('/api/models/item-type', methods=['GET'])
def api_models_itemtype_get():
  return Base.get(ItemType)

@flask_app.route('/api/models/item-type', methods=['POST'])
def api_models_itemtype_post():
  return Base.post(ItemType)

@flask_app.route('/api/models/item-type', methods=['DELETE'])
def api_models_itemtype_delete():
  return Base.delete(ItemType)
