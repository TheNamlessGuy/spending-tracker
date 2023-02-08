def _get_item(name, href, current_route, top = False):
  return {'name': name, 'href': href, 'is_current': href == current_route, top: top}

def _get_items(name, href, current_route, top = False):
  retval = [_get_item(name, href, current_route, top)]
  if retval[0]['is_current']:
    retval += _get_subitems(href, current_route)
  return retval

def _get_subitems(href, current_route):
  if href == '/calendar/':
    return [
      _get_item('Day',   '/calendar/day/',   current_route),
      _get_item('Week',  '/calendar/week/',  current_route),
      _get_item('Month', '/calendar/month/', current_route),
    ]
  return []

def get(current_route):
  retval = []
  retval += _get_items('Home',       '/home/',       current_route, True)
  retval += _get_items('Budgets',    '/budgets/',    current_route, True)
  retval += _get_items('Categories', '/categories/', current_route, True)
  retval += _get_items('Item types', '/item-types/', current_route, True)
  retval += _get_items('Calendar',   '/calendar/',   current_route, True)
  retval += _get_items('Statistics', '/statistics/', current_route, True)
  return retval
