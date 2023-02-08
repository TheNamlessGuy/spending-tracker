from flask import session

from models.user import Class as User

def username():
  return session['user'] if 'user' in session else None

def user():
  return User.query_one(name = username())

def set_user(name):
  session['user'] = name

def unset_user():
  if 'user' in session:
    session.pop('user')

def is_logged_in():
  return username() is not None

def logged_in_user_exists():
  return user() is not None

def is_logged_in_as_valid_user():
  return is_logged_in() and logged_in_user_exists()
