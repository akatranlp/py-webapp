from typing import List
from ..schemas import schemas_user


class MemoryDatabase:
    def __init__(self):
        self.user_list: List[schemas_user.User] = []
        user1 = schemas_user.User(name="Fabian", password="geheim")
        self.user_list.append(user1)

        user2 = schemas_user.User(name="Dominik", password="geheim2")
        self.user_list.append(user2)


MEMORY_DB = MemoryDatabase()


async def get_all() -> List[schemas_user.User]:
    return MEMORY_DB.user_list
