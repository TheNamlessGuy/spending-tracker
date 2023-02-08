from flask import redirect
from flask_app import flask_app

import helpers.session as session
import helpers.render as render
import helpers.menu as menu

@flask_app.route('/budgets/', methods=['GET'])
def routes_budgets():
  if not session.is_logged_in_as_valid_user():
    session.unset_user()
    return redirect('/login')

  return render.html(
    'budgets.html',
    username = session.username(),
    menu_items = menu.get('/budgets/'),
  )
