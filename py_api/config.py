from typing import List
from dotenv import dotenv_values
import os


class Config:
    __instance = None

    @classmethod
    def get_instance(cls):
        if Config.__instance is None:
            Config.__instance = Config()
        return Config.__instance

    def __init__(self):
        self.needed_keys = []
        self.validated = False
        self.config = {
            **dotenv_values('.env'),
            **os.environ,
        }

    def get_config_value(self, key: str, default: str = None) -> str:
        result = self.config.get(key, default)
        if not result:
            raise Exception(f'"{key}" is not in the config! '
                            'You should register it first and validate it or pass a default')
        return result

    # set config value at runtime (only used for tests)
    def set_config_value(self, key: str, value: str):
        self.config[key] = value

    def register_needed_keys(self, key: str = None, keys: List[str] = None):
        if self.validated:
            raise Exception('Keys already validated')
        if key:
            self.needed_keys.append(key)
        if keys:
            for i in keys:
                self.needed_keys.append(i)

    def validate_needed_keys(self):
        for key in self.needed_keys:
            if key not in self.config.keys():
                raise Exception(f'Config Validation Error: "{key}" is not in the config')
        self.validated = True
