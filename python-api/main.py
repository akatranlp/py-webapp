import warnings
from typing import List
from py_api.plugins.plugin_helper import PluginLoader, PluginSchema
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from py_api.routers import routers_user, routers_auth, routers_client, routers_todo
from tortoise.contrib.fastapi import register_tortoise
from py_api.config import Config

Config.get_instance().register_needed_keys(keys=['JWT_REFRESH_TOKEN_SECRET', 'JWT_ACCESS_TOKEN_SECRET', 'SYSTEM_ID'])

models = ['py_api.models.models_user', 'py_api.models.models_todo', 'py_api.models.models_event',
          'py_api.models.models_contact']

plugin_loader = PluginLoader()

plugin_loader.load_plugins()
print_text = 'Plugin {} could not be loaded because {}'

routers_to_add = {}

for plugin in plugin_loader.plugins:
    routers = plugin.serve_routers()

    correct_routers = True

    for router in routers:
        if not router.prefix.startswith(f'/plugin/{plugin.name}'):
            correct_routers = False
            break

    if not correct_routers:
        warnings.warn(print_text.format(plugin.name, 'the router is not correctly defined'))
        plugin_loader.plugins.remove(plugin)
        continue

    routers_to_add[plugin.name] = routers

    models.append(*plugin.models)

    if plugin.needed_env_keys is not None and plugin.needed_env_keys is not []:
        Config.get_instance().register_needed_keys(keys=plugin.needed_env_keys)

Config.get_instance().validate_needed_keys()

app = FastAPI()

app.include_router(routers_auth.router)
app.include_router(routers_user.router)
app.include_router(routers_client.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

for plugin in plugin_loader.plugins:
    for router in routers_to_add[plugin.name]:
        app.include_router(router)
    if plugin.has_static_files:
        app.mount(f'/{plugin.name}', StaticFiles(directory=f'py_api/plugins/{plugin.name}/static'), name=plugin.name)


@app.get("/plugins", response_model=List[PluginSchema])
def get_plugins() -> List[PluginSchema]:
    plugin_list = []
    for plugin in plugin_loader.plugins:
        plugin_list.append(PluginSchema(
            name=plugin.name,
            routes=[router.prefix for router in routers_to_add[plugin.name]]
        ))
    return plugin_list


@app.get("/hello-world")
def hello():
    return {
        'success': True,
        'message': 'Hello World'
    }


register_tortoise(
    app,
    db_url=Config.get_instance().get_config_value('DATABASE_URL', 'sqlite://db.sqlite3'),
    modules={'models': models},
    generate_schemas=True,
    add_exception_handlers=True,
)
