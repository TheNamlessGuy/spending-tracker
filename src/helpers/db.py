import psycopg2
import psycopg2.extras

import helpers.error_handling
import helpers.dotenv as dotenv

###########
# Helpers #
###########
def open_connection():
  env = dotenv.read()
  return psycopg2.connect(dbname=env['DB_NAME'], user=env['DB_USER'], password=env['DB_PASSWORD'], host=env['DB_NETWORK_ALIAS'], port=5432)

def default_on_failed_connection(e):
  error_handling.exception(e)
  return None

def use_connection(func, args = {}, cursor_factory = None, on_failed_connection = default_on_failed_connection):
  conn = None
  cur = None

  try:
    conn = open_connection()
    if conn is None:
      on_failed_connection()
    cur = conn.cursor(cursor_factory = cursor_factory)

    return func(conn, cur, args)
  except psycopg2.OperationalError as e:
    return on_failed_connection(e)
  finally:
    if cur:
      cur.close()
    if conn:
      conn.close()

############
# Generics #
############
def _select_one(conn, cur, args):
  if args['params'] is None:
    cur.execute(args['query'])
  else:
    cur.execute(args['query'], args['params'])

  return cur.fetchone()

def select_one(query, params = None, cursor_factory = psycopg2.extras.RealDictCursor):
  return use_connection(_select_one, {'query': query, 'params': params}, cursor_factory)

def _select_all(conn, cur, args):
  if args['params'] is None:
    cur.execute(args['query'])
  else:
    cur.execute(args['query'], args['params'])

  return cur.fetchall()

def select_all(query, params = None, cursor_factory = psycopg2.extras.RealDictCursor):
  return use_connection(_select_all, {'query': query, 'params': params}, cursor_factory)

def _insert_one(conn, cur, args):
  if args['params'] is None:
    cur.execute(args['query'])
  else:
    cur.execute(args['query'], args['params'])
  retval = cur.fetchone()

  if retval is not None:
    conn.commit()

  return retval

def insert_one(query, params = None, cursor_factory = psycopg2.extras.RealDictCursor):
  return use_connection(_insert_one, {'query': query, 'params': params}, cursor_factory)

def _update_one(conn, cur, args):
  if args['params'] is None:
    cur.execute(args['query'])
  else:
    cur.execute(args['query'], args['params'])
  retval = cur.fetchone()

  if retval is not None:
    conn.commit()

  return retval

def update_one(query, params = None, cursor_factory = psycopg2.extras.RealDictCursor):
  return use_connection(_update_one, {'query': query, 'params': params}, cursor_factory)

def _delete_one(conn, cur, args):
  if args['params'] is None:
    cur.execute(args['query'])
  else:
    cur.execute(args['query'], args['params'])

  conn.commit()

def delete_one(query, params = None, cursor_factory = psycopg2.extras.RealDictCursor):
  use_connection(_delete_one, {'query': query, 'params': params}, cursor_factory)
#################
# Create tables #
#################
def _create_tables__enum(name, values):
  values_str = "'" + "', '".join(values) + "'"
  return """
DO $$
BEGIN
  IF NOT EXISTS (SELECT * FROM pg_type INNER JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace WHERE pg_namespace.nspname = 'spending_tracker' AND pg_type.typname = '""" + name + """') THEN
    CREATE TYPE spending_tracker.""" + name + """ AS ENUM(""" + values_str + """);
  END IF;
END$$;
"""

def _create_tables(conn, cur, args):
  cur.execute('CREATE SCHEMA IF NOT EXISTS spending_tracker')

  # users
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
""")

  # user_settings
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.user_settings (
  user_id BIGSERIAL NOT NULL UNIQUE,
  settings JSON NOT NULL,

  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES spending_tracker.users(id)
);
""")

  # spending_containers
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.spending_containers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGSERIAL NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,

  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES spending_tracker.users(id)
);
""")

  # item_type_type
  cur.execute(_create_tables__enum('item_type_type', ('WEIGHT', 'UNIT')))

  # item_types
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.item_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type spending_tracker.item_type_type NOT NULL,
  notes TEXT
);
""")

  # item_type_type
  cur.execute(_create_tables__enum('weight_unit', ('KG', 'HG', 'G')))

  # spending_items
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.spending_items (
  id BIGSERIAL PRIMARY KEY,
  paid_amount NUMERIC NOT NULL,
  actual_amount NUMERIC NOT NULL,
  item_amount NUMERIC NOT NULL,
  item_type_id BIGSERIAL NOT NULL,
  spending_container_id BIGINT NOT NULL,
  weight_unit spending_tracker.weight_unit,
  notes TEXT,

  CONSTRAINT fk_item_type          FOREIGN KEY(item_type_id)          REFERENCES spending_tracker.item_types(id),
  CONSTRAINT fk_spending_container FOREIGN KEY(spending_container_id) REFERENCES spending_tracker.spending_containers(id)
);
""")

  # categories
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id BIGSERIAL NOT NULL,
  icon TEXT NOT NULL,
  icon_fg_color TEXT NOT NULL,
  icon_bg_color TEXT NOT NULL,

  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES spending_tracker.users(id)
);
""")

  # budgets
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.budgets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id BIGSERIAL NOT NULL,
  active_amount_limit NUMERIC,
  active_starting_amount NUMERIC,

  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES spending_tracker.users(id)
);
""")

  # budget_instances
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.budget_instances (
  id BIGSERIAL PRIMARY KEY,
  budget_id BIGSERIAL NOT NULL,
  amount_limit NUMERIC,
  amount NUMERIC NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_budget FOREIGN KEY(budget_id) REFERENCES spending_tracker.budgets(id)
);
""")

  # budget_category_action
  cur.execute(_create_tables__enum('budget_category_type', ('ADD', 'SUB', 'RESET')))

  # rel_budgets_categories
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.rel_budgets_categories (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGSERIAL NOT NULL,
  budget_id BIGSERIAL NOT NULL,
  type spending_tracker.budget_category_type,

  CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES spending_tracker.categories(id),
  CONSTRAINT fk_budget   FOREIGN KEY(budget_id)   REFERENCES spending_tracker.budgets(id)
);
""")

  # rel_spending_items_categories
  cur.execute("""
CREATE TABLE IF NOT EXISTS spending_tracker.rel_spending_items_categories (
  id BIGSERIAL PRIMARY KEY,
  spending_item_id BIGSERIAL NOT NULL,
  category_id BIGSERIAL NOT NULL,

  CONSTRAINT fk_category      FOREIGN KEY(category_id)      REFERENCES spending_tracker.categories(id),
  CONSTRAINT fk_spending_item FOREIGN KEY(spending_item_id) REFERENCES spending_tracker.spending_items(id)
);
""")

  conn.commit()

def create_tables():
  return use_connection(_create_tables)

##################
# DEBUG STUFF    #
# TODO: DELETEME #
##################
def _drop_everything(conn, cur, args):
  cur.execute('DROP SCHEMA IF EXISTS spending_tracker CASCADE')
  conn.commit()

def drop_everything():
  return use_connection(_drop_everything)
