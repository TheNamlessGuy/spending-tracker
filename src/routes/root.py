from flask import redirect
from flask_app import flask_app

import helpers.session as session

@flask_app.route('/', methods=['GET'])
def routes_root():
  if not session.is_logged_in_as_valid_user():
    session.unset_user()
    return redirect('/login')

  return redirect('/home')
