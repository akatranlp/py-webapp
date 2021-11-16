# SE2-VS Server

### Benjamin, Fabian, Kajsa, Pascal, Dominik

Es handelt sich um einen Python Server, der mithilfe des Frameworks FastApi
geschrieben wurde.

Zum starten des Servers wird eine python version > 3.6 benötigt (beim developement wurde 3.9 genutzt).

Nachdem die dependencies mithilfe der setup.py installiert wurden, wird der Server über
"uvicorn main:app" fürs development gestartet.

Um die Tests durchzuführen benutzen wir "pytest" hierzu für wir nur den Befehl "pytest" aus 
und alle Tests aus files mit dem Namen \*\_test.py oder test_*.py werden ausgeführt 
