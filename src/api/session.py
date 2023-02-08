from flask_app import flask_app

import helpers.session as session
import helpers.request as request
import helpers.response as response

from models.user import Class as User

@flask_app.route('/api/login', methods=['POST'])
def api_login():
  name = request.get('name', default = '')
  user = User.query_one(name = name)
  if user is None:
    return response.errors("User with name '" + name + "' not found")

  session.set_user(user.name)
  return response.redirect_to('/home')

@flask_app.route('/api/logout', methods=['POST'])
def api_logout():
  session.unset_user()
  return response.redirect_to('/login')
