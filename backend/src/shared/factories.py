from fastapi import HTTPException

custom_HTTPException_factory = lambda status_code, message, **kw: HTTPException(status_code=status_code, detail={'success': False, 'message': message}, **kw)
