from flask import redirect
from flask_app import flask_app

import helpers.session as session
import helpers.render as render

@flask_app.route('/login/', methods=['GET'])
def routes_login():
  is_logged_in = session.is_logged_in()
  user_exists = is_logged_in and session.logged_in_user_exists()

  if is_logged_in:
    if user_exists:
      return redirect('/home/')
    else:
      session.unset_user()

  return render.html(
    'login.html',
  )
