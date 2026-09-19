# Schach-Kurse Tracker

Eine eigenständige, statische Website zum Tracken deiner Schachkurse — kein Server, kein Build-Schritt, keine Anmeldung nötig.

## Nutzung

Öffne `index.html` einfach im Browser, oder starte einen simplen lokalen Server:

```bash
cd chess-courses-tracker
python3 -m http.server 8080
# dann im Browser: http://localhost:8080
```

## Funktionen

- Kurse hinzufügen mit Titel, Plattform/Trainer, Kategorie (Eröffnung, Mittelspiel, Endspiel, Taktik, Strategie), Niveau, Anzahl Lektionen, Link und Notizen
- Fortschritt pro Kurs tracken (Lektionen abgeschlossen / gesamt) über Schieberegler oder +/- Buttons
- Automatischer Status: Nicht begonnen / In Bearbeitung / Abgeschlossen
- Übersicht mit Gesamtstatistik (Anzahl Kurse, in Bearbeitung, abgeschlossen, durchschnittlicher Fortschritt)
- Suche, Status-Filter und Sortierung (neueste, Fortschritt, Titel)
- Bearbeiten und Löschen von Kursen
- Export/Import der Daten als JSON (Backup)
- Alle Daten werden lokal im Browser gespeichert (`localStorage`)

## Tech-Stack

Reines HTML, CSS und Vanilla JavaScript — keine Abhängigkeiten, kein Framework, kein Build-Prozess.
