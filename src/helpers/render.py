from flask import render_template

def html(file, **kwargs):
  return render_template(
    file,
    theme = 'dark', # TODO: Load from user preferences
    **kwargs,
  )
