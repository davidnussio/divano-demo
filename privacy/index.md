# Divano — Informativa sulla privacy / Privacy policy

*Ultimo aggiornamento / Last updated: 18 ottobre 2026 / October 18, 2026.*

## Italiano

Divano è un lettore: non fornisce contenuti, canali o abbonamenti. Riproduce soltanto le sorgenti (playlist M3U, account Xtream, guide XMLTV) che inserisci tu.

**Dati che restano sul tuo dispositivo**
- Le sorgenti che aggiungi, con indirizzi, nome utente e password, cifrati con una chiave conservata nell'Android Keystore del dispositivo. I link dei singoli canali e titoli ricevuti dalla playlist, che possono contenere le stesse credenziali, sono nel database dell'app, accessibile solo all'app stessa.
- Preferiti, lista "Da vedere", cronologia di visione e posizioni di ripresa, elementi nascosti, nomi personalizzati, categorie bloccate, promemoria.
- Le informazioni sui titoli ricevute dalle sorgenti (genere, trama, anno), conservate per mostrarle nella ricerca.
- Il PIN del controllo genitori, salvato solo come impronta (hash), mai in chiaro.
- La registrazione di un canale messo in pausa, che resta finché non la cancelli o non ne avvii un'altra, e i film o episodi scaricati per l'offline.
- La data del primo avvio dell'app.

Questi dati non vengono inviati a noi né a terzi, salvo in forma cifrata se attivi la sincronizzazione (vedi sotto), non vengono inclusi nei backup di sistema di Android e vengono cancellati disinstallando l'app.

**Collegamenti di rete**
L'app si collega soltanto agli indirizzi delle sorgenti e delle guide che hai inserito (per scaricare elenchi, guide, locandine e riprodurre i flussi), al server di sincronizzazione se la attivi, a Wikipedia quando apri la scheda di un canale (riceve solo il nome del canale, per mostrarne una breve descrizione) e, se apri il trailer di un film, a YouTube. Questi servizi ricevono le informazioni tecniche di ogni connessione (ad esempio l'indirizzo IP) secondo le loro regole. Molti fornitori IPTV usano connessioni non cifrate (HTTP): l'app le consente perché altrimenti non potrebbe riprodurli.

**Configurazione dal telefono**
Sulla TV, mentre aggiungi una sorgente, l'app apre una pagina web temporanea sulla rete locale (raggiungibile solo con il codice QR mostrato) per ricevere i dati della sorgente dal telefono. La pagina si chiude uscendo dalla schermata.

**Sincronizzazione tra dispositivi**
È disattivata finché non la attivi. Se la attivi, profili, preferiti, cronologia, posizioni di ripresa, sorgenti (con le password) e impostazioni passano tra i tuoi dispositivi attraverso un server, cifrati sul dispositivo con una chiave che conoscono solo i tuoi dispositivi: il server non può leggerli. Del server ufficiale:
- Conserva i dati cifrati, e ne vede quindi il numero, la dimensione approssimativa e quando cambiano; per lo spazio (l'insieme dei tuoi dispositivi) la data di creazione e dell'ultimo uso, all'ora; per ogni dispositivo il tipo (TV, telefono, tablet, altro), un'impronta del suo codice d'accesso, la data di creazione e dell'ultimo uso.
- Mentre colleghi un nuovo dispositivo, per al massimo 10 minuti, il suo tipo, il suo nome e la sua chiave pubblica.
- Non registra indirizzi IP. Il servizio gira su Vercel e i dati sono nel database di Neon, aziende con sede negli Stati Uniti: Vercel riceve le informazioni tecniche di ogni connessione (ad esempio l'indirizzo IP) per consegnare le richieste e proteggere il servizio dagli abusi.
- I dati cancellati vengono dimenticati dopo 90 giorni; uno spazio non usato per un anno viene eliminato con tutto il suo contenuto. Puoi eliminare lo spazio o togliere un dispositivo in qualsiasi momento.

Se scegli un altro server, valgono le regole di chi lo gestisce: l'app ne mostra nome e contatti nelle impostazioni di sincronizzazione.

**Backup su file**
Se esporti un backup, il file contiene le tue sorgenti con le password in chiaro: conservalo in un posto sicuro.

**Nessuna pubblicità, nessun tracciamento**
L'app non contiene pubblicità, strumenti di analisi o tracciamento.

Contatti: [app+divano@dambox.ch](mailto:app+divano@dambox.ch)

## English

Divano is a player: it provides no content, channels or subscriptions. It only plays the sources (M3U playlists, Xtream accounts, XMLTV guides) you add.

**Data that stays on your device**
- The sources you add, with addresses, user names and passwords, encrypted with a key kept in the device's Android Keystore. The links of individual channels and titles received from the playlist, which may contain the same credentials, are in the app's database, readable only by the app.
- Favorites, the "To watch" list, watch history and resume positions, hidden items, renamed channels, locked categories, reminders.
- Details about titles received from your sources (genre, plot, year), kept to show them in search.
- The parental PIN, stored only as a hash, never in plain text.
- The recording of a paused channel, kept until you delete it or start another one, and movies or episodes downloaded for offline viewing.
- The date the app was first opened.

This data is not sent to us or to third parties, except in encrypted form if you turn on sync (see below), is not included in Android system backups, and is deleted when you uninstall the app.

**Network connections**
The app only connects to the source and guide addresses you entered (to download lists, guides and artwork and to play streams), to the sync server if you turn sync on, to Wikipedia when you open a channel's card (it receives only the channel name, to show a short description) and, if you open a movie trailer, to YouTube. Those services receive the technical details of each connection (such as your IP address) under their own terms. Many IPTV providers use unencrypted (HTTP) connections: the app allows them because it could not play them otherwise.

**Setting up from a phone**
On a TV, while you add a source, the app opens a temporary web page on the local network (reachable only through the QR code shown) to receive the source details from your phone. It closes when you leave that screen.

**Sync between devices**
It stays off until you turn it on. When on, profiles, favorites, history, resume positions, sources (with their passwords) and settings travel between your devices through a server, encrypted on the device with a key only your devices know: the server cannot read them. The official server:
- Keeps the encrypted data, so it sees how many items there are, roughly how big they are and when they change; for the space (the set of your devices) when it was created and last used, to the hour; for each device its kind (TV, phone, tablet, other), a hash of its access token, when it was created and last used.
- While you link a new device, for at most 10 minutes, its kind, its name and its public key.
- Does not record IP addresses. The service runs on Vercel and the data is in Neon's database, companies based in the United States: Vercel receives the technical details of each connection (such as your IP address) to deliver requests and protect the service from abuse.
- Deleted data is forgotten after 90 days; a space unused for a year is deleted with everything in it. You can delete the space or remove a device at any time.

If you pick another server, its operator's rules apply: the app shows its name and contacts in the sync settings.

**Backup files**
An exported backup contains your sources with their passwords in plain text: keep it somewhere safe.

**No ads, no tracking**
The app contains no advertising, analytics or tracking.

Contact: [app+divano@dambox.ch](mailto:app+divano@dambox.ch)
