import warnings
from typing import List
from fastapi import APIRouter
import os
import importlib

'''
Plugin Struktur:
    es muss sich um ein package handeln welches direkt unter ./plugins platziert wird.
    in der __init__.py muss die Plugin Klasse importiert werden z.B.:
        from .example_plugin import Plugin
    die Plugin Klasse muss von PluginInterface erben
    
    static und templates werden in eigenen Ordnern untergebracht, aber im root verzeichnis des Plugins
    ./example_plugin/static
    ./example_plugin/templates
    diese werden dann automatisch in den Ordnern ./plugins/example_plugin/ gespeichert
'''


class PluginInterface:
    name: str
    has_static_files: bool
    models: List[str]
    needed_env_keys: List[str]

    def serve_routers(self) -> List[APIRouter]:
        pass


class PluginLoader:
    def __init__(self):
        self.plugins: List[PluginInterface] = []
        self.__modules = []
        self.__plugin_folder = './py_api/plugins/'
        self.__plugin_module_path = 'py_api.plugins'

    def load_plugins(self):
        print_text = 'Plugin {} could not be loaded because {}'

        for plugin_name in os.listdir(self.__plugin_folder):
            location = os.path.join(self.__plugin_folder, plugin_name)
            if not os.path.isdir(location):
                continue
            if 'plugin' not in plugin_name:
                continue
            module = importlib.import_module(f'{self.__plugin_module_path}.{plugin_name}.{plugin_name}')
            self.__modules.append(module)
            try:
                plugin = module.Plugin()
            except:
                warnings.warn(print_text.format(plugin_name, 'the Plugin has no Class Plugin'))
                continue
            if not isinstance(plugin, PluginInterface):
                warnings.warn(print_text.format(plugin_name, 'the Plugin Class does not inherit from PluginInterface'))
                continue
            if plugin.name != plugin_name:
                warnings.warn(print_text.format(plugin_name, 'the Plugin-Name is not the name of the package'))
                continue
            if plugin.has_static_files and 'static' not in os.listdir(location):
                warnings.warn(print_text.format(plugin_name, 'the static folder was not found'))
                continue

            correct_model = True
            for model in plugin.models:
                if not model.startswith(f'{self.__plugin_module_path}.{plugin_name}'):
                    correct_model = False
                    break

            if not correct_model:
                warnings.warn(print_text.format(plugin_name, 'not all models where in the plugin path'))
                continue

            self.plugins.append(plugin)
