from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel
from ..models import models_user

User = pydantic_model_creator(models_user.User, name='User')
UserIn = pydantic_model_creator(models_user.User,
                                name='UserIn',
                                exclude_readonly=True,
                                exclude=('is_active',
                                         'is_admin',
                                         'token_version',
                                         'email'))

UserOut = pydantic_model_creator(models_user.User,
                                 name='UserOut',
                                 exclude_readonly=True,
                                 exclude=('password_hash',
                                          'is_active',
                                          'is_admin',
                                          'token_version'))

UserRegister = pydantic_model_creator(models_user.User,
                                      name='UserRegister',
                                      exclude_readonly=True,
                                      exclude=('is_active',
                                               'is_admin',
                                               'token_version'))


class UserToken(BaseModel):
    access_token: str
    token_type: str
