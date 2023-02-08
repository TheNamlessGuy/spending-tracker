# TODO: DELETEME
from flask_app import flask_app

import helpers.render as render

@flask_app.route('/debug/', methods=['GET'])
def routes_debug():
  return render.html(
    'debug.html',
  )
