from typing import List
from dotenv import dotenv_values
import os

config = {
    **dotenv_values('.env'),
    **os.environ,
}


def get_config_value(name: str, default: str = None):
    return config.get(name, default)


# set config value at runtime (only used for tests)
def set_config_value(name: str, value: str):
    config[name] = value


def validate_needed_keys(keys: List[str]):
    for key in keys:
        if key not in config.keys():
            return False
    else:
        return True
