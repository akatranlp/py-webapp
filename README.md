# SE2-VS Server

### Benjamin, Fabian, Kajsa, Pascal, Dominik

Es handelt sich um einen Python Server, der mithilfe des Frameworks FastApi
geschrieben wurde.

Zum starten des Servers wird eine Python Version > 3.6 benötigt (beim Developement wurde 3.9 genutzt).

Zuerst müssen die Dependencies mithilfe der setup.py installiert wurden.

Dann muss die .env_sample zu .env kopiert und die Werte nach eigenen Wünschen gesetzt werden 

Anschließend wird der Server über "uvicorn main:app" fürs Development gestartet.

Dann muss die write_data.py ausgeführt werden, hier werden zwei Benutzer erstellt aber auch die StatusTabelle mit ihren Daten gefüllt.

FastAPI erstellt automatisch eine interaktive Doku mit Swagger oder alternativ mit ReDoc
hierfür sind die links /docs und /redoc

Um die Tests durchzuführen, benutzen wir "pytest". Hierzu führen wir nur den Befehl "pytest" aus, dabei werden 
alle Tests aus Datein mit dem Namen \*\_test.py oder test_*.py ausgeführt

Eine Beschreibung, wie ein Plugin entwickelt wird, befindet sich in der [Plugins Readme](https://ci02.inf.fh-flensburg.de/SE2VS2021_Gruppe6/server/blob/master/py_api/plugins/README.md)
