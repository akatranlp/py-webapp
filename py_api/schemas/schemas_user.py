from typing import Optional
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, Extra
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
                                          'token_version'))

UserRegister = pydantic_model_creator(models_user.User,
                                      name='UserRegister',
                                      exclude_readonly=True,
                                      exclude=('is_active',
                                               'is_admin',
                                               'token_version'))


class UserPut(BaseModel):
    is_active: Optional[bool]
    is_admin: Optional[bool]

    class Config:
        extra = Extra.forbid


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str

    class Config:
        extra = Extra.forbid


class UserToken(BaseModel):
    access_token: str
    token_type: str

    class Config:
        extra = Extra.forbid
