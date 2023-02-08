import logging
import waitress

from flask_app import flask_app

import helpers.error_handling
import preprocessing

import api.session
import api.models.budget
import api.models.category
import api.models.item_type
import api.models.spending_container
import api.models.spending_item
import api.models.user

import routes.root
import routes.login
import routes.home
import routes.budgets
import routes.categories
import routes.item_types

import helpers.db as db

# Debug stuff below
# TODO: DELETEME
import api.debug
import routes.debug

if __name__ == '__main__':
  log = logging.getLogger('werkzeug')
  log.disabled = True
  flask_app.logger.disabled = True

  db.create_tables()

  waitress.serve(flask_app, host = '0.0.0.0', port = 8000, _quiet = True) # https://stackoverflow.com/a/64980625
