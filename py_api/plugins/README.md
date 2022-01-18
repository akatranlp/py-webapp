# Plugin Entwicklung

## Plugin Struktur
```
/app-root/py-api/plugins (root)

plugin_helper.py
your_plugin
    -> __init__.py
    -> (optional) static (dir)
    -> (optional) templates (dir)
    -> your_plugin.py
        -> class Plugin(plugin_helper.PluginInterface)
    
    -> weitere Skripte und Ordner für eigene Struktur 
```
## Router
Um Router bereitzustellen, sollte py_api.routers.routers_helper.APIRouter genutzt werden,
damit bei den URLs die Varianten mit "/" und ohne "/" am Ende beide hinzugefügt werden und somit
Umleitungen beim Vergessen des "/" vermieden werden. Die Router sollten erst nach Aufruf der Funktion serve_routers
initialisiert werden und werden dann als Liste aller Router zurückgegeben.

### Router Definition Beispiel
Am besten definiert man sich eine Konstante mit dem Plugin-Namen und benutzt an allen benötigten Stellen.
Der Prefix muss wie im Beispiel mit dem Plugin-Namen beginnen, falls man mehrere router benutzen möchte.
```python
def serve_routers(self) -> List[APIRouter]:
    router = APIRouter(
        prefix=f'/plugin/{PLUGIN_NAME}',
        tags=[PLUGIN_NAME]
    )
    
    ...
    
    return [router]
```

## Templates
Falls euer Plugin Templates benutzt sollten diese im Ordner templates, wie oben beschrieben, untergebracht werden.
Templates werden mit Jinja2 erstellt und müssen wie folgt definiert werden.
```python
templates = Jinja2Templates(directory=f'py_api/plugins/{PLUGIN_NAME}/templates')
```

## Static Files
Falls euer Plugin Static Files benutzen möchte, muss das Flag in der Plugin-Klasse auf True gesetzt werden.
Der static Ordner muss wie oben beschrieben vorhanden sein und wird dann unter http://server-url/{PLUGIN_NAME}
zur Verfügung stehen.

In Kombination mit den Templates wird die "url_for" Funktion wie folgt genutzt. 
```html
<link href="{{ url_for('{PLUGIN_NAME}', path='/css/index.css') }}" rel="stylesheet">
<script src="{{ url_for('{PLUGIN_NAME}', path='/js/index.js') }}"></script>
```

## Endpoints
Template Endpunkte sollten "include_in_schema=False" beim Erstellen benutzen, damit sie nicht in der API-Doku
auftauchen. Damit man dann doch die URl des Plugins findet, ist ein Endpunkt in der Main-App vorhanden, welcher
die Namen der Plugins ans Frontend weitergibt und das Frontend diese auf der Startseite mit einem Link darstellt.

### Authentication
Wenn ein Endpunkt nur von eingeloggten User benutzt werden sollte, muss von dem module oauth2
die Funktion "get_current_active_user" oder "get_out_user" z.B. wie folgt integriert werden:
```python
@router.get("/...", response_model=...)
async def ...(user: schemas_user.User = Depends(oauth2.get_current_active_user)):
```

## Datenbank Model
Falls euer Plugin Daten persistieren möchte, wird hierfür die bereits integrierte Tortoise-ORM genutzt.
Damit die erforderlichen Models automatisch erkannt werden, muss der Module-Path, in denen die Model-Klassen
enthalten sind, in der Liste self.models gespeichert werden.

### Beispiel:
```python
self.models = [f'py_api.plugins.{PLUGIN_NAME}.models']
```

Hier muss darauf geachtet werden, dass die Model-Klassen keine bereits verwendeten Namen nutzen.
Am besten benennt man seine Modelle wieder mit dem Plugin-Namen.
```python
class ExamplePluginTestModel(Model):
    id = fields.IntField(pk=True)
```

## Environment Variables
Falls euer Plugin bestimmte Umgebungsvariablen benötigt müssen diese in "self.needed_env_keys" gespeichert werden,
eine gesammelte Liste aller benötigten Variablen wird zum Start der App überprüft und die App wird geschlossen,
falls nicht alle vorhanden sind.