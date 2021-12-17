from tortoise import fields
from ..config import Config


class DBBaseModel:
    uuid = fields.UUIDField(pk=True)
    system_id = fields.CharField(20, default=Config.get_instance().get_config_value("SYSTEM_ID"))
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
