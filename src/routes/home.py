from flask import redirect
from flask_app import flask_app

import helpers.session as session
import helpers.render as render
import helpers.menu as menu

@flask_app.route('/home/', methods=['GET'])
def routes_home():
  if not session.is_logged_in_as_valid_user():
    session.unset_user()
    return redirect('/login')

  return render.html(
    'home.html',
    username = session.username(),
    menu_items = menu.get('/home/'),
  )
