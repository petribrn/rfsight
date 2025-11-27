from fastapi import status
from src.shared.factories import custom_HTTPException_factory

INVALID_CREDENTIALS = custom_HTTPException_factory(status_code=status.HTTP_401_UNAUTHORIZED, message="Credenciais inválidas.",
                                                             headers={"WWW-Authenticate": "Bearer"})

EXPIRED_TOKEN = custom_HTTPException_factory(status_code=status.HTTP_403_FORBIDDEN, message="Token expirado.")

NO_PERMISSION = custom_HTTPException_factory(status_code=status.HTTP_401_UNAUTHORIZED, message="Permissão insuficiente.")

INTERNAL_ERROR = lambda detail: custom_HTTPException_factory(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                                             message=f'Falha ao processar request: {detail}')

INVALID_FIELD = lambda field: custom_HTTPException_factory(status_code=status.HTTP_400_BAD_REQUEST, message=f'{field} inválido.')

DOCUMENT_INEXISTENT = lambda document: custom_HTTPException_factory(status_code=status.HTTP_404_NOT_FOUND,
                                                                    message=f'{str(document).capitalize()} inexistente.')

UNIQUE_FIELD_DATA_ALREADY_EXISTS = lambda field: custom_HTTPException_factory(status_code=status.HTTP_400_BAD_REQUEST,
                                                                              message=f'{field} já cadastrado.')

MOVE_ITEM_TO_ORGANIZATION_FAILED = lambda item_type: custom_HTTPException_factory(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                                                message=f'Falha ao mover {item_type} para a organização.')

REMOVE_ITEM_FROM_ORG_FAILED = lambda item_type: custom_HTTPException_factory(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                                           message=f'Falha ao remover {item_type} da organização.')

MOVE_DEVICE_TO_NET_FAILED = custom_HTTPException_factory(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                                         message=f'Falha ao mover dispositivo para a rede.')

REMOVE_DEVICE_FROM_NET_FAILED = custom_HTTPException_factory(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                                             message=f'Falha ao remover dispositivo da rede.')

DEVICE_API_FAIL = lambda detail: custom_HTTPException_factory(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                                              message=f'Falha ao executar ação no dispositivo: {detail}')

DEVICE_LOGIN_FAIL = custom_HTTPException_factory(status_code=status.HTTP_401_UNAUTHORIZED,
                                                 message='Falha no login do dispositivo, credenciais incorretas.')

DEVICE_NOT_MANAGEABLE = custom_HTTPException_factory(status_code=status.HTTP_400_BAD_REQUEST, message='Dispositivo não compatĩvel com o gerenciador.')

DEVICE_INACCESSIBLE = custom_HTTPException_factory(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, message='O dispositivo aparenta estar inacessível.')

DEVICE_TO_ADOPT_NOT_FOUND = custom_HTTPException_factory(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, message='O dispositivo não foi encontrado')

DEVICE_ALREADY_ADOPTED = custom_HTTPException_factory(status_code=status.HTTP_400_BAD_REQUEST, message='Dispositivo já está adotado.')

PASSWD_UPDATE_FAILED = custom_HTTPException_factory(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, message='Falha ao atualizar senha.')
