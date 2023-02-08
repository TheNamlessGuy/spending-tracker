class BaseException(Exception):
  def __init__(self, msg):
    self.message = msg

class ValidationException(BaseException):
  pass
