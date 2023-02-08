from math import isnan

import models.user as User

import helpers.session as session

def select(table, where, *, columns = '*'):
  # Example:
  # select('users', 'id = %s')
  # SELECT * FROM spending_tracker.users WHERE id = %s

  if where != '':
    return 'SELECT ' + columns + ' FROM spending_tracker.' + table + ' WHERE ' + where
  return 'SELECT ' + columns + ' FROM spending_tracker.' + table

def select_via(table, table_identifier, bridge_table, bridge_table_column, bridge_table_where, *, table_columns = '*'):
  # Example:
  # select_via('user_categories', 'id', 'rel_user_categories_user_budgets', 'category_id', 'budget_id = %s')
  # SELECT * FROM spending_tracker.user_categories WHERE id IN (SELECT category_id FROM spending_tracker.rel_user_categories_user_budgets WHERE budget_id = %s)

  return 'SELECT ' + table_columns + ' FROM spending_tracker.' + table + ' WHERE ' + table_identifier + ' IN (SELECT ' + bridge_table_column + ' FROM spending_tracker.' + bridge_table + ' WHERE ' + bridge_table_where + ')'

def insert(table, columns, returning = '*'):
  # Example:
  # insert('users', ['id', 'name'])
  # INSERT INTO spending_tracker.users (id, name) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING *

  query = 'INSERT INTO spending_tracker.' + table + ' ('
  values = ''

  for column in columns:
    query += column + ', '
    values += '%s, '

  query = query[:-2] # Remove the last ', '
  values = values[:-2] # Remove the last ', '

  return query + ') VALUES (' + values + ') ON CONFLICT DO NOTHING RETURNING ' + returning

def update(table, values, where, returning = '*'):
  # Example:
  # update('users', ['id', 'name'], 'id = %s')
  # UPDATE users SET id = %s, name = %s WHERE id = %s RETURNING *

  query = 'UPDATE spending_tracker.' + table + ' SET '

  for value in values:
    query += value + ' = %s, '

  query = query[:-2] # Remove the last ', '
  return query + ' WHERE ' + where + ' RETURNING ' + returning

def delete(table, where, *, returning = '*'):
  # Example:
  # delete('users', 'id = %s')
  # DELETE FROM spending_tracker.users WHERE id = %s

  if where != '':
    return 'DELETE FROM spending_tracker.' + table + ' WHERE ' + where
  return 'DELETE FROM spending_tracker.' + table
