import src.shared.http_exceptions as http_exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from src.database.db import DB, get_db
from src.models.Configuration import Configuration, ConfigurationCollection
from src.models.User import User
from src.repositories.configuration import ConfigurationRepository
from src.services.oauth import get_current_user
from src.shared.utils import hash_device_config, validate_id

router = APIRouter(prefix='/configurations', tags=['configurations'])

@router.get('', status_code=status.HTTP_200_OK, response_model=ConfigurationCollection, response_model_by_alias=True)
async def configurations(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    configurations = await ConfigurationRepository.list_configurations(db)
    return configurations
  except HTTPException as h:
    raise h
  except Exception as error:
    raise http_exceptions.INTERNAL_ERROR(detail=str(error))

@router.get('/{config_id}', status_code=status.HTTP_200_OK, response_model=Configuration, response_model_by_alias=True)
async def get_network(config_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    config_id = validate_id(target_id=config_id, id_field_name='config_id')

    config_existent = await ConfigurationRepository.get_configuration_by(db, field='_id', value=config_id)
    if not config_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='configuração')

    return config_existent
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
