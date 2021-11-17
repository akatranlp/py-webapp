from tortoise import fields
from tortoise.models import Model
from .. import hashing


class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(50, unique=True)
    password_hash = fields.CharField(128, null=False)
    is_active = fields.BooleanField(default=True)
    is_admin = fields.BooleanField(default=False)
    token_version = fields.IntField(default=0)
    email = fields.CharField(50, unique=True)

    def verify_password(self, password) -> bool:
        return hashing.verify_password(password, self.password_hash)
