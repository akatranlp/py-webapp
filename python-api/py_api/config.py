from typing import List
from dotenv import dotenv_values
import os

config = {
    **dotenv_values('.env'),
    **os.environ,
}


def get_config_value(name: str, default: str = None):
    res = config.get(name)
    return res if res or not default else default


def validate_needed_keys(keys: List[str]):
    for key in keys:
        if key not in config.keys():
            return False
    else:
        return True
