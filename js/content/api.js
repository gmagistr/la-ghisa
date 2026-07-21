window.MODULES.push({
  id: "api",
  name: "API & REST",
  tagline: "La sala dei servizi: endpoint, metodi HTTP, JSON, status code. Un mini-framework REST costruito in Python.",
  intro: "Un modello ML in produzione vive dietro un'API. Qui costruisci un mini-framework stile FastAPI in puro Python — routing, metodi HTTP, JSON, status code, validazione — per capire come si serve un modello e come dialogano i servizi.",
  packages: [],
  items: [

    { type: "theory", title: "Cos'è un'API REST", html: `
<p>Un'<strong>API</strong> (Application Programming Interface) è il modo in cui i programmi si parlano. Un'API <strong>REST</strong> lo fa via HTTP: il client manda una <em>richiesta</em> a un <em>endpoint</em> (un URL), il server risponde con dei dati (di solito JSON).</p>
<pre><code># concettualmente, una richiesta REST:
richiesta = {
    "metodo": "GET",              # cosa voglio fare
    "percorso": "/utenti/42",     # su quale risorsa
    "body": None,                 # dati inviati (per POST/PUT)
}
# la risposta:
risposta = {"status": 200, "body": {"id": 42, "nome": "Anna"}}</code></pre>
<p>REST tratta tutto come <strong>risorse</strong> (utenti, prodotti, ordini) identificate da URL, manipolate con i metodi HTTP standard. È lo stile dominante per le API web, incluse quelle che servono modelli ML: mandi i dati, ricevi la predizione.</p>
`, more: `
<p>I principi REST che i colloqui verificano: le API REST sono <strong>stateless</strong> (ogni richiesta contiene tutto il necessario, il server non ricorda le richieste precedenti — questo permette di scalare aggiungendo server senza condividere sessioni); usano URL orientati alle <strong>risorse</strong> (sostantivi come <code>/utenti/42</code>, non verbi come <code>/getUtente?id=42</code>); e sfruttano i metodi HTTP per l'azione. Lo statelessness è cruciale per la scalabilità: un load balancer può mandare ogni richiesta a un server qualsiasi, perché nessuno "possiede" la conversazione.</p>
<p>Per servire un modello ML, il pattern tipico è un endpoint <code>POST /predict</code>: il client manda le feature nel body JSON, il server le passa al modello, e restituisce la predizione. <code>POST</code> (non GET) perché si inviano dati nel body, e perché la predizione può essere "costosa"/non idempotente concettualmente. Framework come <strong>FastAPI</strong> rendono questo elegantissimo in Python — definisci una funzione, la decori, e diventa un endpoint con validazione automatica dei tipi e documentazione generata. È lo standard de facto per il model serving in Python nel 2026, e conoscerlo (anche solo concettualmente, come qui) è atteso per ruoli ML.</p>
<p>REST non è l'unico stile, e i colloqui a volte chiedono i confronti: <strong>GraphQL</strong> (il client specifica esattamente quali dati vuole in una sola query, evitando over/under-fetching — potente ma più complesso); <strong>gRPC</strong> (binario, velocissimo, per comunicazione servizio-servizio ad alte prestazioni, usato molto nei microservizi e nel serving ML ad alto throughput); <strong>WebSocket</strong> (connessione bidirezionale persistente, per dati in tempo reale). REST resta il default per la sua semplicità, universalità e leggibilità (è solo HTTP + JSON, ispezionabile con curl), ma sapere quando serve altro — gRPC per latenza minima tra servizi, GraphQL per client che vogliono dati flessibili — mostra maturità architetturale.</p>
` },

    {
      type: "exercise", id: "ap-01", kg: 5, title: "Anatomia di una richiesta",
      task: `<p>Costruisci una richiesta REST e la sua risposta come dizionari Python:</p>
<ul>
<li><code>richiesta</code>: un GET su "/prodotti/7" senza body</li>
<li><code>risposta</code>: status 200, body con id 7 e nome "Bilanciere"</li>
<li><code>e_una_lettura</code>: <code>True</code> se il metodo della richiesta è "GET" (una lettura, non modifica nulla)</li>
<li><code>successo</code>: <code>True</code> se lo status della risposta è 200</li>
</ul>`,
      starter: `richiesta = {
    "metodo": "GET",
    "percorso": "/prodotti/7",
    "body": None,
}
risposta = {
    "status": 200,
    "body": {"id": 7, "nome": "Bilanciere"},
}
e_una_lettura = ...
successo = ...

print("richiesta:", richiesta)
print("risposta:", risposta)`,
      check: `assert richiesta["metodo"] == "GET" and richiesta["percorso"] == "/prodotti/7", "richiesta: GET su /prodotti/7"
assert risposta["status"] == 200 and risposta["body"]["nome"] == "Bilanciere", "risposta: status 200, nome Bilanciere"
assert e_una_lettura == True, "e_una_lettura: True — GET e' una lettura"
assert successo == True, "successo: status == 200"`,
      hint: `<p><code>e_una_lettura = richiesta["metodo"] == "GET"</code>. <code>successo = risposta["status"] == 200</code>. GET legge, non modifica.</p>`,
      solution: `richiesta = {
    "metodo": "GET",
    "percorso": "/prodotti/7",
    "body": None,
}
risposta = {
    "status": 200,
    "body": {"id": 7, "nome": "Bilanciere"},
}
e_una_lettura = richiesta["metodo"] == "GET"
successo = risposta["status"] == 200

print("richiesta:", richiesta)
print("risposta:", risposta)`
    },

    { type: "theory", title: "I metodi HTTP", html: `
<p>I <strong>metodi HTTP</strong> esprimono l'INTENZIONE di una richiesta. I quattro principali mappano le operazioni CRUD (Create, Read, Update, Delete):</p>
<pre><code>GET    /utenti/42      # LEGGI: recupera dati (Read). Non modifica nulla.
POST   /utenti         # CREA: crea una nuova risorsa (Create).
PUT    /utenti/42      # AGGIORNA: sostituisce una risorsa esistente (Update).
DELETE /utenti/42      # ELIMINA: cancella una risorsa (Delete).</code></pre>
<p>Due proprietà cruciali per i colloqui: <strong>GET è "safe"</strong> (non ha effetti collaterali, solo lettura); <strong>GET, PUT e DELETE sono idempotenti</strong> (ripeterli dà lo stesso risultato), mentre <strong>POST NON è idempotente</strong> (due POST creano due risorse). Rispettare la semantica dei metodi rende l'API prevedibile e sfruttabile da cache, proxy e client.</p>
`, more: `
<p>L'<strong>idempotenza</strong> è il concetto da capire bene perché ha conseguenze pratiche enormi. Un'operazione è idempotente se eseguirla una o N volte produce lo stesso stato finale. GET (leggi) ovviamente lo è. DELETE lo è: cancellare l'utente 42 due volte lascia comunque l'utente 42 cancellato. PUT lo è: sostituire l'utente con dati completi due volte dà lo stesso utente. POST NON lo è: due POST /utenti creano DUE utenti. Questo conta per l'affidabilità in rete: se una richiesta idempotente fallisce per timeout, il client può ritentarla in sicurezza; con POST no, perché rischi di creare doppioni — motivo per cui i sistemi di pagamento usano "idempotency key" per rendere sicuri i retry.</p>
<p>La distinzione PUT vs PATCH è una domanda frequente: <strong>PUT</strong> sostituisce l'INTERA risorsa (mandi tutti i campi, quelli omessi vengono azzerati); <strong>PATCH</strong> aggiorna solo i campi FORNITI (modifica parziale). Se vuoi cambiare solo l'email di un utente, PATCH con <code>{"email": "..."}</code> è corretto; PUT richiederebbe di rimandare tutti i campi per non perderli. Usare PUT per modifiche parziali è un errore comune che cancella dati per omissione.</p>
<p>Rispettare la semantica HTTP non è pedanteria: abilita l'intera infrastruttura del web. Le CACHE (browser, CDN, proxy) possono cachare i GET perché sono safe e idempotenti, ma non i POST. I browser avvertono prima di ri-inviare un POST (il "vuoi reinviare il modulo?") proprio perché non è idempotente. I motori di ricerca seguono i GET ma non i POST/DELETE. Un'API che usa GET per operazioni che modificano dati (un classico anti-pattern: <code>GET /elimina?id=42</code>) può vedere risorse cancellate da un crawler o da un prefetch del browser — un disastro reale accaduto a chi ha ignorato la semantica dei metodi.</p>
` },

    {
      type: "exercise", id: "ap-02", kg: 10, title: "CRUD e idempotenza",
      task: `<p>Associa ogni metodo HTTP alla sua operazione CRUD e proprietà:</p>
<ul>
<li><code>op_get</code>, <code>op_post</code>, <code>op_put</code>, <code>op_delete</code>: la lettera CRUD di ciascuno ("R", "C", "U", "D")</li>
<li><code>idempotenti</code>: la lista dei metodi idempotenti tra ["GET","POST","PUT","DELETE"] (tutti tranne POST)</li>
<li><code>post_e_idempotente</code>: <code>True</code> o <code>False</code> — POST è idempotente?</li>
</ul>`,
      starter: `op_get = "R"
op_post = ...
op_put = ...
op_delete = ...

idempotenti = ...   # tutti tranne POST
post_e_idempotente = ...

print("GET/POST/PUT/DELETE ->", op_get, op_post, op_put, op_delete)
print("idempotenti:", idempotenti)`,
      check: `assert op_get == "R" and op_post == "C" and op_put == "U" and op_delete == "D", "GET=Read, POST=Create, PUT=Update, DELETE=Delete"
assert set(idempotenti) == {"GET", "PUT", "DELETE"}, "idempotenti: GET, PUT, DELETE (non POST)"
assert post_e_idempotente == False, "post_e_idempotente: False — due POST creano due risorse"`,
      hint: `<p>POST=Create, PUT=Update, DELETE=Delete. Idempotenti sono tutti tranne POST: <code>["GET", "PUT", "DELETE"]</code>. <code>post_e_idempotente = False</code>.</p>`,
      solution: `op_get = "R"
op_post = "C"
op_put = "U"
op_delete = "D"

idempotenti = ["GET", "PUT", "DELETE"]
post_e_idempotente = False

print("GET/POST/PUT/DELETE ->", op_get, op_post, op_put, op_delete)
print("idempotenti:", idempotenti)`
    },

    { type: "theory", title: "Status code HTTP", html: `
<p>Ogni risposta HTTP ha uno <strong>status code</strong> che ne comunica l'esito. Sono raggruppati in classi:</p>
<ul>
<li><strong>2xx</strong> — successo: <code>200</code> OK, <code>201</code> Created (dopo un POST), <code>204</code> No Content;</li>
<li><strong>3xx</strong> — redirezione: <code>301</code> Moved Permanently, <code>304</code> Not Modified (cache);</li>
<li><strong>4xx</strong> — errore del CLIENT: <code>400</code> Bad Request, <code>401</code> Unauthorized, <code>403</code> Forbidden, <code>404</code> Not Found, <code>429</code> Too Many Requests;</li>
<li><strong>5xx</strong> — errore del SERVER: <code>500</code> Internal Server Error, <code>503</code> Service Unavailable.</li>
</ul>
<p>La distinzione chiave: <strong>4xx = colpa del client</strong> (richiesta malformata, non autorizzata, risorsa inesistente), <strong>5xx = colpa del server</strong> (bug, sovraccarico). Restituire lo status giusto è essenziale: dice al client se ritentare, correggere la richiesta, o autenticarsi.</p>
`, more: `
<p>La distinzione 4xx vs 5xx guida il comportamento del client ed è competenza pratica: su un <strong>4xx</strong> il client NON deve ritentare la stessa richiesta identica (è malformata — ritentarla darà lo stesso errore); deve correggere (validare i dati per il 400, autenticarsi per il 401, cambiare risorsa per il 404). Su un <strong>5xx</strong> il client PUÒ ritentare (il server ha avuto un problema temporaneo — un retry con backoff esponenziale spesso risolve). Confondere le due classi porta a client che martellano il server con richieste malformate (ritentando un 400) o che si arrendono su errori temporanei (non ritentando un 503). Il <code>429</code> (Too Many Requests) è un caso speciale: è 4xx ma include spesso un header <code>Retry-After</code> che dice quando ritentare.</p>
<p>Gli errori di autenticazione/autorizzazione confondono: <strong>401 Unauthorized</strong> significa in realtà "non AUTENTICATO" (non so chi sei — manca o è invalido il token/credenziale); <strong>403 Forbidden</strong> significa "so chi sei ma non hai il PERMESSO" (autenticato ma non autorizzato per questa risorsa). Il nome "Unauthorized" per il 401 è storicamente fuorviante. La sequenza pratica: senza credenziali → 401; con credenziali valide ma senza i diritti → 403. Restituire 404 invece di 403 è talvolta una scelta di sicurezza deliberata (non rivelare l'esistenza di una risorsa a chi non può accedervi).</p>
<p>Per il model serving, gli status code raccontano lo stato del servizio: 200 con la predizione nel body (tutto ok); 400 se le feature inviate sono malformate o mancanti (validazione dell'input); 422 (Unprocessable Entity, usato molto da FastAPI) se i dati sono sintatticamente validi ma semanticamente sbagliati; 503 se il modello non è ancora caricato o il servizio è sovraccarico; 500 se il modello lancia un'eccezione imprevista. Un'API di serving ben fatta distingue chiaramente "hai mandato dati sbagliati" (4xx, correggi la richiesta) da "il mio modello è in difficoltà" (5xx, riprova) — cruciale per il monitoring e per i client che devono sapere come reagire.</p>
` },

    {
      type: "exercise", id: "ap-03", kg: 10, title: "Classificare gli status code",
      task: `<p>Scrivi la logica che classifica uno status code e decide se ritentare:</p>
<ul>
<li><code>classe</code>: funzione che dato uno status restituisce "successo" (2xx), "client" (4xx) o "server" (5xx) — fornita</li>
<li><code>classe_404</code>, <code>classe_500</code>, <code>classe_200</code>: le classi di questi tre status</li>
<li><code>puo_ritentare</code>: funzione che restituisce <code>True</code> solo per i 5xx (errori server, ritentabili)</li>
<li><code>ritenta_500</code>, <code>ritenta_400</code>: se ritentare 500 e 400</li>
</ul>`,
      starter: `def classe(status):
    if 200 <= status < 300: return "successo"
    if 400 <= status < 500: return "client"
    if 500 <= status < 600: return "server"
    return "altro"

classe_404 = classe(404)
classe_500 = classe(500)
classe_200 = classe(200)

def puo_ritentare(status):
    return classe(status) == "server"   # solo i 5xx sono ritentabili

ritenta_500 = ...
ritenta_400 = ...

print("404:", classe_404, "| 500:", classe_500, "| 200:", classe_200)
print("ritenta 500:", ritenta_500, "| ritenta 400:", ritenta_400)`,
      check: `assert classe_404 == "client", "404 -> client (colpa del client)"
assert classe_500 == "server", "500 -> server"
assert classe_200 == "successo", "200 -> successo"
assert ritenta_500 == True, "ritenta_500: True — i 5xx sono temporanei, ritentabili"
assert ritenta_400 == False, "ritenta_400: False — un 400 e' malformato, ritentarlo dara' lo stesso errore"`,
      hint: `<p>Le funzioni sono fornite: <code>ritenta_500 = puo_ritentare(500)</code>, <code>ritenta_400 = puo_ritentare(400)</code>. Solo i 5xx (server) vanno ritentati; i 4xx (client) vanno corretti.</p>`,
      solution: `def classe(status):
    if 200 <= status < 300: return "successo"
    if 400 <= status < 500: return "client"
    if 500 <= status < 600: return "server"
    return "altro"

classe_404 = classe(404)
classe_500 = classe(500)
classe_200 = classe(200)

def puo_ritentare(status):
    return classe(status) == "server"

ritenta_500 = puo_ritentare(500)
ritenta_400 = puo_ritentare(400)

print("404:", classe_404, "| 500:", classe_500, "| 200:", classe_200)
print("ritenta 500:", ritenta_500, "| ritenta 400:", ritenta_400)`
    },

    { type: "theory", title: "JSON: il formato dei dati", html: `
<p>Il <strong>JSON</strong> (JavaScript Object Notation) è il formato standard per scambiare dati nelle API. È testo leggibile che rappresenta oggetti, liste, numeri, stringhe, booleani e null.</p>
<pre><code>import json
# da oggetto Python a stringa JSON (serializzazione):
testo = json.dumps({"nome": "Anna", "eta": 30, "attivo": True})
# '{"nome": "Anna", "eta": 30, "attivo": true}'

# da stringa JSON a oggetto Python (deserializzazione):
dati = json.loads('{"nome": "Anna", "eta": 30}')
# {'nome': 'Anna', 'eta': 30}</code></pre>
<p>Mappatura Python↔JSON: dict↔object, list↔array, str↔string, True/False↔true/false, None↔null. <code>json.dumps</code> serializza (Python&rarr;testo), <code>json.loads</code> deserializza (testo&rarr;Python). È così che i dati viaggiano tra client e server.</p>
`, more: `
<p>JSON ha vinto su formati precedenti (XML) per semplicità e leggibilità, ma ha limiti da conoscere: non ha un tipo nativo per date/timestamp (si usano stringhe ISO 8601 per convenzione), non distingue interi da float in modo rigoroso, non supporta commenti, e i numeri molto grandi possono perdere precisione (JavaScript usa float64 per tutti i numeri). Per dati che richiedono schema rigido, tipi ricchi o efficienza binaria si usano alternative: <strong>Protocol Buffers</strong>/gRPC (binario, schema-first, compatto e veloce), <strong>MessagePack</strong> (JSON binario), <strong>Avro</strong>/Parquet (per data engineering). Ma per le API web JSON resta il default per la sua ispezionabilità: puoi leggerlo e debuggarlo a occhio.</p>
<p>La <strong>validazione</strong> del JSON in ingresso è dove le API si difendono dagli input malformati, e dove FastAPI brilla: usando i type hint di Python e Pydantic, definisci uno schema (<code>class Utente(BaseModel): nome: str; eta: int</code>) e FastAPI valida automaticamente ogni richiesta, restituendo un 422 con dettagli precisi se i dati non corrispondono — senza che tu scriva codice di validazione. Questo intercetta a monte gli errori del client (il "garbage in" che altrimenti causerebbe crash o dati corrotti) ed è una delle ragioni della popolarità di FastAPI per il serving ML, dove validare le feature in ingresso è critico.</p>
<p>Attenzione alla sicurezza nella deserializzazione: <code>json.loads</code> è SICURO (produce solo tipi dati inerti), ma <code>pickle.loads</code> (il formato di serializzazione nativo di Python, usato per salvare modelli) NON lo è — deserializzare un pickle da fonte non fidata può eseguire codice arbitrario. Regola: JSON per dati tra sistemi/da fonti esterne; pickle/joblib solo per dati che TU hai serializzato e di cui ti fidi (come i tuoi modelli, sala MLOps). Non accettare mai un pickle da un client via API. Questa distinzione JSON-sicuro / pickle-pericoloso è una domanda di sicurezza che i colloqui più attenti pongono.</p>
` },

    {
      type: "exercise", id: "ap-04", kg: 10, title: "Serializzare e deserializzare",
      task: `<p>Converti tra oggetti Python e JSON, come fa un'API:</p>
<ul>
<li><code>testo</code>: la stringa JSON dell'oggetto <code>utente</code> (usa <code>json.dumps</code>)</li>
<li><code>tornato</code>: l'oggetto Python ricostruito da <code>testo</code> (usa <code>json.loads</code>)</li>
<li><code>roundtrip_ok</code>: <code>True</code> se <code>tornato</code> è uguale all'originale <code>utente</code></li>
<li><code>true_diventa_minuscolo</code>: <code>True</code> se nel JSON il booleano è scritto "true" (minuscolo, stile JSON) e non "True"</li>
</ul>`,
      setup: `import json
utente = {"nome": "Anna", "eta": 30, "attivo": True, "hobby": ["pesi", "corsa"]}`,
      starter: `import json
# utente: un dizionario Python

testo = ...
tornato = ...
roundtrip_ok = ...
true_diventa_minuscolo = "true" in testo   # JSON usa true, non True

print("JSON:", testo)
print("tornato:", tornato)
print("roundtrip ok:", roundtrip_ok)`,
      check: `import json
_t = json.dumps(utente)
assert 'testo' in globals() and json.loads(testo) == utente, "testo: json.dumps(utente)"
assert 'tornato' in globals() and tornato == utente, "tornato: json.loads(testo)"
assert roundtrip_ok == True, "roundtrip_ok: tornato == utente"
assert true_diventa_minuscolo == True, "true_diventa_minuscolo: True — JSON scrive 'true' minuscolo, Python 'True'"`,
      hint: `<p><code>json.dumps(utente)</code> serializza, <code>json.loads(testo)</code> deserializza. Sono l'inverso l'uno dell'altro: <code>roundtrip_ok = tornato == utente</code>.</p>`,
      solution: `import json

testo = json.dumps(utente)
tornato = json.loads(testo)
roundtrip_ok = tornato == utente
true_diventa_minuscolo = "true" in testo

print("JSON:", testo)
print("tornato:", tornato)
print("roundtrip ok:", roundtrip_ok)`
    },

    { type: "theory", title: "Routing: dall'URL alla funzione", html: `
<p>Il <strong>routing</strong> è il cuore di un framework web: mappa (metodo + percorso) alla funzione che deve gestirli. In FastAPI si fa con i decoratori:</p>
<pre><code>@app.get("/utenti/{id}")       # GET su /utenti/qualcosa
def leggi_utente(id: int):
    return {"id": id, "nome": "..."}

@app.post("/utenti")           # POST su /utenti
def crea_utente(dati: dict):
    return {"creato": dati}</code></pre>
<p>Il framework tiene una tabella di rotte; quando arriva una richiesta, cerca la rotta che combacia e chiama la funzione giusta (l'<em>handler</em>), passandole i parametri estratti dall'URL. I <strong>path parameter</strong> (<code>{id}</code>) catturano parti variabili dell'URL. In Python questa logica è un dizionario (metodo, pattern)&rarr;funzione con un po' di matching.</p>
`, more: `
<p>Il routing distingue tre modi di passare dati in una richiesta, ognuno con il suo uso: <strong>path parameter</strong> (<code>/utenti/42</code> — identificano UNA risorsa specifica, parte gerarchica dell'URL); <strong>query parameter</strong> (<code>/utenti?attivo=true&ordina=nome</code> — filtri, ordinamenti, opzioni, dopo il <code>?</code>); <strong>body</strong> (i dati di POST/PUT, il payload JSON vero e proprio). La convenzione: path per identificare, query per modificare la vista (filtrare/paginare/ordinare), body per inviare dati. Mettere dati sensibili nei query parameter è un errore di sicurezza (finiscono nei log del server, nella cronologia del browser) — vanno nel body o negli header.</p>
<p>Il matching delle rotte ha sottigliezze: l'ORDINE conta quando le rotte possono sovrapporsi (<code>/utenti/me</code> deve essere definita PRIMA di <code>/utenti/{id}</code>, altrimenti "me" verrebbe catturato come id); i path parameter tipizzati (<code>{id: int}</code>) permettono al framework di validare e convertire automaticamente (una richiesta <code>/utenti/abc</code> con id:int dà 422 senza arrivare al tuo codice). FastAPI genera anche automaticamente la documentazione interattiva (OpenAPI/Swagger) dalle definizioni delle rotte e dai type hint — un endpoint documentato e testabile dal browser senza scrivere una riga di doc.</p>
<p>Concetti di routing avanzati che scalano a sistemi reali: i <strong>middleware</strong> (funzioni che processano OGNI richiesta prima/dopo l'handler — per logging, autenticazione, CORS, rate limiting — evitando di ripetere la stessa logica in ogni endpoint); la <strong>dependency injection</strong> di FastAPI (dichiari cosa serve a un handler — una connessione al DB, l'utente autenticato — e il framework lo fornisce, rendendo il codice testabile e modulare); il <strong>versioning</strong> (<code>/v1/utenti</code>, <code>/v2/utenti</code> per evolvere l'API senza rompere i client esistenti). In questa sala costruisci il nucleo — la tabella di routing e il dispatch — che è il fondamento su cui poggiano tutte queste funzionalità.</p>
` },

    {
      type: "exercise", id: "ap-05", kg: 20, title: "Un mini-router",
      task: `<p>Costruisci un router che mappa (metodo, percorso) a funzioni handler e le invoca:</p>
<ul>
<li><code>rotte</code>: dizionario (metodo, percorso) &rarr; funzione (fornito, con 2 handler)</li>
<li><code>gestisci</code>: funzione che dato (metodo, percorso) trova e chiama l'handler giusto, o restituisce un errore 404 se la rotta non esiste (fornita)</li>
<li><code>risp_get</code>: il risultato di <code>gestisci("GET", "/ping")</code></li>
<li><code>risp_404</code>: il risultato di <code>gestisci("GET", "/inesistente")</code></li>
<li><code>rotta_mancante_da_404</code>: <code>True</code> se la rotta inesistente restituisce status 404</li>
</ul>`,
      starter: `def handler_ping():
    return {"status": 200, "body": "pong"}

def handler_salute():
    return {"status": 200, "body": "ok"}

rotte = {
    ("GET", "/ping"): handler_ping,
    ("GET", "/salute"): handler_salute,
}

def gestisci(metodo, percorso):
    handler = rotte.get((metodo, percorso))
    if handler is None:
        return {"status": 404, "body": "Not Found"}
    return handler()

risp_get = gestisci("GET", "/ping")
risp_404 = ...
rotta_mancante_da_404 = ...

print("GET /ping ->", risp_get)
print("GET /inesistente ->", risp_404)`,
      check: `def _hp(): return {"status": 200, "body": "pong"}
_rotte = {("GET","/ping"): _hp}
def _g(m, p):
    h = _rotte.get((m, p))
    return h() if h else {"status": 404, "body": "Not Found"}
assert risp_get == {"status": 200, "body": "pong"}, "risp_get: gestisci('GET', '/ping') -> pong"
assert risp_404 == {"status": 404, "body": "Not Found"}, "risp_404: gestisci('GET', '/inesistente') -> 404"
assert rotta_mancante_da_404 == True, "rotta_mancante_da_404: risp_404['status'] == 404"`,
      hint: `<p>Le funzioni sono fornite: <code>risp_404 = gestisci("GET", "/inesistente")</code>. <code>rotta_mancante_da_404 = risp_404["status"] == 404</code>. Il router è un dizionario (metodo,percorso)&rarr;handler con fallback 404.</p>`,
      solution: `def handler_ping():
    return {"status": 200, "body": "pong"}

def handler_salute():
    return {"status": 200, "body": "ok"}

rotte = {
    ("GET", "/ping"): handler_ping,
    ("GET", "/salute"): handler_salute,
}

def gestisci(metodo, percorso):
    handler = rotte.get((metodo, percorso))
    if handler is None:
        return {"status": 404, "body": "Not Found"}
    return handler()

risp_get = gestisci("GET", "/ping")
risp_404 = gestisci("GET", "/inesistente")
rotta_mancante_da_404 = risp_404["status"] == 404

print("GET /ping ->", risp_get)
print("GET /inesistente ->", risp_404)`
    },

    {
      type: "exercise", id: "ap-06", kg: 20, title: "Path e query parameter",
      task: `<p>Estrai i parametri da un URL, distinguendo path e query. Per <code>/utenti/42?attivo=true&ordina=nome</code>:</p>
<ul>
<li><code>separa_url</code>: funzione che divide un URL in (percorso, dict di query param) — fornita</li>
<li><code>percorso</code>, <code>query</code>: le due parti di <code>/utenti/42?attivo=true&ordina=nome</code></li>
<li><code>id_utente</code>: il path parameter — l'ultimo segmento del percorso, convertito a int (42)</li>
<li><code>filtro_attivo</code>: il valore del query param "attivo"</li>
</ul>`,
      starter: `def separa_url(url):
    if "?" in url:
        percorso, qs = url.split("?", 1)
        query = dict(coppia.split("=") for coppia in qs.split("&"))
    else:
        percorso, query = url, {}
    return percorso, query

percorso, query = separa_url("/utenti/42?attivo=true&ordina=nome")
id_utente = ...   # ultimo segmento del percorso, come int
filtro_attivo = ...

print("percorso:", percorso, "| query:", query)
print("id:", id_utente, "| attivo:", filtro_attivo)`,
      check: `def _su(url):
    if "?" in url:
        p, qs = url.split("?", 1)
        q = dict(c.split("=") for c in qs.split("&"))
    else: p, q = url, {}
    return p, q
_p, _q = _su("/utenti/42?attivo=true&ordina=nome")
assert percorso == "/utenti/42", "percorso: la parte prima del ?"
assert query == {"attivo": "true", "ordina": "nome"}, "query: i parametri dopo il ?"
assert id_utente == 42, "id_utente: int(percorso.split('/')[-1]) = 42"
assert filtro_attivo == "true", "filtro_attivo: query['attivo']"`,
      hint: `<p>Il path parameter è l'ultimo pezzo del percorso: <code>int(percorso.split("/")[-1])</code>. Il query param: <code>query["attivo"]</code>. Path per identificare la risorsa, query per i filtri.</p>`,
      solution: `def separa_url(url):
    if "?" in url:
        percorso, qs = url.split("?", 1)
        query = dict(coppia.split("=") for coppia in qs.split("&"))
    else:
        percorso, query = url, {}
    return percorso, query

percorso, query = separa_url("/utenti/42?attivo=true&ordina=nome")
id_utente = int(percorso.split("/")[-1])
filtro_attivo = query["attivo"]

print("percorso:", percorso, "| query:", query)
print("id:", id_utente, "| attivo:", filtro_attivo)`
    },

    { type: "theory", title: "Validazione dell'input", html: `
<p>Un'API non può fidarsi dei dati che riceve: vanno <strong>validati</strong>. Campi mancanti, tipi sbagliati, valori fuori range devono produrre un errore 400/422 chiaro, non un crash del server (500).</p>
<pre><code>def valida_predizione(dati):
    if "features" not in dati:
        return 400, "campo 'features' mancante"
    if not isinstance(dati["features"], list):
        return 400, "'features' deve essere una lista"
    if len(dati["features"]) != 4:
        return 400, "servono esattamente 4 feature"
    return 200, "ok"</code></pre>
<p>Regola d'oro: <strong>valida ai confini</strong>. Ogni dato che entra dall'esterno (body, query, header) è potenzialmente malformato o malevolo. FastAPI + Pydantic automatizzano questo con schemi tipizzati, ma la logica è sempre: controlla presenza, tipo e vincoli PRIMA di usare i dati.</p>
`, more: `
<p>La distinzione tra errore del client (4xx) e crash del server (5xx) dipende ESATTAMENTE dalla validazione. Senza validazione, dati malformati arrivano al codice del modello e causano un'eccezione non gestita → 500 (che dice al client "colpa mia, il server è rotto", fuorviante). Con validazione, gli stessi dati vengono intercettati ai confini e respinti con 400/422 (che dice correttamente "colpa tua, correggi la richiesta"). Questa differenza non è cosmetica: il monitoring distingue i 5xx (allarmi, qualcosa è rotto) dai 4xx (normale, client che sbagliano), e un server che restituisce 500 per input malformati genera falsi allarmi e nasconde i veri problemi.</p>
<p>La validazione è anche la prima linea di <strong>sicurezza</strong>. Input non validati sono il vettore di attacchi classici: SQL injection (input che diventa codice SQL — sala SQL), command injection, payload che esauriscono la memoria (una lista di un milione di elementi), path traversal. "Non fidarti mai dell'input dell'utente" è il principio di sicurezza numero uno, e la validazione ai confini (whitelist di ciò che è permesso, non blacklist di ciò che è vietato) è come lo si applica. Per il serving ML, validare le feature — numero corretto, tipi giusti, range plausibili — protegge sia dagli errori onesti dei client sia dagli abusi.</p>
<p>FastAPI + Pydantic hanno reso la validazione quasi gratuita in Python, ed è la ragione tecnica principale della loro adozione per il serving. Definisci lo schema come una classe con type hint e vincoli (<code>features: list[float] = Field(..., min_items=4, max_items=4)</code>), e ogni richiesta viene validata automaticamente: tipi convertiti, vincoli verificati, e in caso di errore un 422 con un messaggio JSON che dice ESATTAMENTE quale campo è sbagliato e perché. Questo elimina montagne di codice di validazione manuale (error-prone e ripetitivo), documenta l'API (lo schema è la specifica), e dà messaggi d'errore utili ai client. Nei colloqui, "userei Pydantic per validare l'input dell'endpoint" è la risposta attesa alla domanda su come proteggere un'API di serving.</p>
` },

    {
      type: "exercise", id: "ap-07", kg: 20, title: "Validare prima di servire",
      task: `<p>Scrivi la validazione di una richiesta di predizione: deve intercettare i dati malformati con un 400, non lasciarli crashare il modello:</p>
<ul>
<li><code>valida</code>: funzione che controlla presenza di "features", che sia una lista, e che abbia 4 elementi — restituisce (status, messaggio) (fornita, da completare l'ultimo controllo)</li>
<li><code>ok</code>: valida <code>{"features": [1,2,3,4]}</code> (deve dare 200)</li>
<li><code>manca</code>: valida <code>{}</code> (deve dare 400)</li>
<li><code>lunghezza_sbagliata</code>: valida <code>{"features": [1,2]}</code> (deve dare 400)</li>
<li><code>tutti_gestiti</code>: <code>True</code> se i casi malformati danno 400 e quello valido 200 (nessun crash)</li>
</ul>`,
      starter: `def valida(dati):
    if "features" not in dati:
        return 400, "campo 'features' mancante"
    if not isinstance(dati["features"], list):
        return 400, "'features' deve essere una lista"
    if len(dati["features"]) != 4:
        return 400, "servono 4 feature"
    return 200, "ok"

ok = valida({"features": [1, 2, 3, 4]})
manca = valida({})
lunghezza_sbagliata = valida({"features": [1, 2]})
tutti_gestiti = ...

print("valido:", ok)
print("manca features:", manca)
print("lunghezza sbagliata:", lunghezza_sbagliata)`,
      check: `def _v(d):
    if "features" not in d: return 400, "x"
    if not isinstance(d["features"], list): return 400, "x"
    if len(d["features"]) != 4: return 400, "x"
    return 200, "ok"
assert ok[0] == 200, "ok: features valide -> 200"
assert manca[0] == 400, "manca: niente features -> 400"
assert lunghezza_sbagliata[0] == 400, "lunghezza_sbagliata: 2 feature invece di 4 -> 400"
assert tutti_gestiti == True, "tutti_gestiti: True — i malformati danno 400, il valido 200, nessun 500"`,
      hint: `<p>La funzione è fornita: verifica gli status. <code>tutti_gestiti = ok[0] == 200 and manca[0] == 400 and lunghezza_sbagliata[0] == 400</code>. Validare ai confini evita che i dati sbagliati crashino il modello (500).</p>`,
      solution: `def valida(dati):
    if "features" not in dati:
        return 400, "campo 'features' mancante"
    if not isinstance(dati["features"], list):
        return 400, "'features' deve essere una lista"
    if len(dati["features"]) != 4:
        return 400, "servono 4 feature"
    return 200, "ok"

ok = valida({"features": [1, 2, 3, 4]})
manca = valida({})
lunghezza_sbagliata = valida({"features": [1, 2]})
tutti_gestiti = ok[0] == 200 and manca[0] == 400 and lunghezza_sbagliata[0] == 400

print("valido:", ok)
print("manca features:", manca)
print("lunghezza sbagliata:", lunghezza_sbagliata)`
    },

    { type: "theory", title: "Autenticazione e rate limiting", html: `
<p>Un'API pubblica deve sapere CHI la chiama (<strong>autenticazione</strong>) e limitare QUANTO (<strong>rate limiting</strong>). Due meccanismi essenziali.</p>
<pre><code># autenticazione via header (token Bearer):
headers = {"Authorization": "Bearer eyJ..."}
# il server verifica il token prima di rispondere; se manca/invalido -> 401

# rate limiting: max N richieste per finestra temporale
if richieste_utente_ultimo_minuto > 100:
    return 429, "Too Many Requests"</code></pre>
<p>L'autenticazione usa spesso <strong>token</strong> (API key o JWT) negli header, non nell'URL (che finisce nei log). Il <strong>rate limiting</strong> protegge da abusi e sovraccarico: quando un client supera la soglia, riceve <code>429</code> e deve rallentare. Entrambi sono indispensabili per qualsiasi API esposta a Internet.</p>
`, more: `
<p>I <strong>JWT</strong> (JSON Web Token) sono lo standard moderno per l'autenticazione stateless: un token firmato che contiene le informazioni dell'utente (id, ruoli, scadenza) codificate, verificabili dal server SENZA consultare un database (la firma garantisce che non sia stato manomesso). Questo si sposa con lo statelessness di REST: il server non deve tenere sessioni, ogni richiesta porta il suo token auto-verificabile. La struttura di un JWT è header.payload.signature, e un errore comune è mettere dati sensibili nel payload (è codificato base64, NON cifrato — chiunque può leggerlo; la firma protegge dall'ALTERAZIONE, non dalla LETTURA).</p>
<p>Il rate limiting ha algoritmi con trade-off diversi che i colloqui su sistemi toccano: <strong>token bucket</strong> (un secchio si riempie di token a ritmo costante, ogni richiesta consuma un token — permette raffiche fino alla capacità del secchio, poi limita al ritmo di ricarica); <strong>fixed window</strong> (max N richieste per finestra fissa, semplice ma soffre di picchi ai confini delle finestre); <strong>sliding window</strong> (finestra scorrevole, più fluido). Il rate limiting protegge da abusi (scraping, brute force), da sovraccarico accidentale (un client con un bug che chiama in loop), e permette di offrire tier di servizio diversi (free: 100 req/ora, pro: 10000). L'header <code>Retry-After</code> nella risposta 429 dice al client educato quando ritentare.</p>
<p>Per il serving ML, questi meccanismi assumono importanza specifica: l'inferenza può essere COSTOSA (GPU, tempo), quindi il rate limiting protegge risorse care e previene che un client saturi il servizio degradandolo per tutti; l'autenticazione traccia CHI usa il modello (per fatturazione, quota, audit) ed è essenziale se il modello o i dati sono sensibili. Aggiungi il monitoring (quante richieste, latenza, tasso di errore per client) e hai l'ossatura di un servizio di serving production-grade. Questi non sono dettagli opzionali: un modello esposto senza autenticazione né rate limiting è un incidente in attesa di accadere — costi fuori controllo, abusi, o un singolo client che manda giù il servizio.</p>
` },

    {
      type: "exercise", id: "ap-08", kg: 20, title: "Auth e rate limiting",
      task: `<p>Implementa un gate che controlla autenticazione e limite di richieste prima di servire:</p>
<ul>
<li><code>gate</code>: funzione che dati (token, n_richieste_recenti) restituisce lo status: 401 se token assente/None, 429 se n_richieste &gt; 100, 200 altrimenti (fornita)</li>
<li><code>senza_token</code>: <code>gate(None, 5)</code> (deve dare 401)</li>
<li><code>troppo_veloce</code>: <code>gate("valido", 150)</code> (deve dare 429)</li>
<li><code>ok</code>: <code>gate("valido", 10)</code> (deve dare 200)</li>
<li><code>ordine_corretto</code>: <code>True</code> se l'auth (401) viene controllata PRIMA del rate limit (un utente non autenticato riceve 401 anche se sotto il limite)</li>
</ul>`,
      starter: `def gate(token, n_richieste_recenti):
    if token is None:
        return 401   # non autenticato
    if n_richieste_recenti > 100:
        return 429   # troppe richieste
    return 200

senza_token = gate(None, 5)
troppo_veloce = gate("valido", 150)
ok = gate("valido", 10)
# un utente non autenticato riceve 401 anche se sotto il limite di richieste?
ordine_corretto = gate(None, 5) == 401

print("senza token:", senza_token)
print("troppo veloce:", troppo_veloce)
print("ok:", ok)`,
      check: `def _g(t, n):
    if t is None: return 401
    if n > 100: return 429
    return 200
assert senza_token == 401, "senza_token: token None -> 401"
assert troppo_veloce == 429, "troppo_veloce: 150 richieste -> 429"
assert ok == 200, "ok: token valido, sotto il limite -> 200"
assert ordine_corretto == True, "ordine_corretto: True — l'auth si controlla prima del rate limit"`,
      hint: `<p>La funzione è fornita: verifica i tre casi. L'ordine dei controlli conta: prima l'autenticazione (401), poi il rate limit (429). <code>ordine_corretto = gate(None, 5) == 401</code> (401 anche con poche richieste).</p>`,
      solution: `def gate(token, n_richieste_recenti):
    if token is None:
        return 401
    if n_richieste_recenti > 100:
        return 429
    return 200

senza_token = gate(None, 5)
troppo_veloce = gate("valido", 150)
ok = gate("valido", 10)
ordine_corretto = gate(None, 5) == 401

print("senza token:", senza_token)
print("troppo veloce:", troppo_veloce)
print("ok:", ok)`
    },

    {
      type: "exercise", id: "ap-09", kg: 15, title: "Quiz: REST e HTTP",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "POST non è idempotente: due POST identici creano due risorse"</li>
<li><code>a2</code>: "Uno status 404 è un errore del server (5xx)"</li>
<li><code>a3</code>: "I dati malformati dovrebbero dare un 400 (client), non un 500 (server)"</li>
<li><code>a4</code>: "Le API REST sono stateless: ogni richiesta contiene tutto il necessario"</li>
<li><code>a5</code>: "I segreti/token vanno negli header o nel body, non nei query parameter dell'URL"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: POST crea, non e' idempotente"
assert a2 == False, "a2 FALSA: 404 e' 4xx = errore del CLIENT (risorsa non trovata), non 5xx"
assert a3 == True, "a3 VERA: validare ai confini -> 400, non far crashare il server -> 500"
assert a4 == True, "a4 VERA: statelessness, chiave della scalabilita' REST"
assert a5 == True, "a5 VERA: i query param finiscono nei log/cronologia, mai metterci segreti"`,
      hint: `<p>La trappola è a2: 404 è 4xx = colpa del CLIENT (risorsa inesistente), non del server. Le altre riprendono le lavagne: POST non idempotente (a1), validazione 400 vs 500 (a3), statelessness (a4), segreti fuori dall'URL (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "ap-10", kg: 25, title: "MASSIMALE: servire un modello ML",
      task: `<p>Il gran finale: costruisci un mini-servizio di model serving completo — routing, validazione, un "modello" che predice, status code corretti. La spina dorsale di ogni ML in produzione.</p>
<ul>
<li>completa <code>servi</code> (scheletro fornito): gestisce <code>POST /predict</code> validando il body e restituendo la predizione; gestisce <code>GET /health</code>; qualsiasi altra rotta &rarr; 404</li>
<li>la validazione: body senza "features" o con lunghezza ≠ 3 &rarr; 400</li>
<li>il "modello": predizione = somma delle 3 feature &gt; soglia 10 ? "alto" : "basso"</li>
<li><code>r_health</code>: <code>servi("GET", "/health", None)</code> &rarr; status 200</li>
<li><code>r_pred_ok</code>: <code>servi("POST", "/predict", {"features": [5, 4, 3]})</code> &rarr; status 200, classe "alto"</li>
<li><code>r_pred_400</code>: <code>servi("POST", "/predict", {})</code> &rarr; status 400</li>
<li><code>r_404</code>: <code>servi("GET", "/altro", None)</code> &rarr; status 404</li>
<li><code>tutto_ok</code>: <code>True</code> se tutti gli status sono corretti</li>
</ul>`,
      starter: `def modello(features):
    return "alto" if sum(features) > 10 else "basso"

def servi(metodo, percorso, body):
    # health check
    if metodo == "GET" and percorso == "/health":
        return {"status": 200, "body": {"stato": "ok"}}
    # predizione
    if metodo == "POST" and percorso == "/predict":
        if not body or "features" not in body:
            return {"status": 400, "body": {"errore": "features mancanti"}}
        if len(body["features"]) != 3:
            return {"status": 400, "body": {"errore": "servono 3 feature"}}
        pred = modello(body["features"])
        return {"status": 200, "body": {"classe": pred}}
    # rotta non trovata
    return {"status": 404, "body": {"errore": "Not Found"}}

r_health = servi("GET", "/health", None)
r_pred_ok = servi("POST", "/predict", {"features": [5, 4, 3]})
r_pred_400 = servi("POST", "/predict", {})
r_404 = servi("GET", "/altro", None)
tutto_ok = ...

print("health:", r_health)
print("predict ok:", r_pred_ok)
print("predict 400:", r_pred_400)
print("404:", r_404)`,
      check: `def _m(f): return "alto" if sum(f) > 10 else "basso"
def _s(m, p, b):
    if m=="GET" and p=="/health": return {"status":200,"body":{"stato":"ok"}}
    if m=="POST" and p=="/predict":
        if not b or "features" not in b: return {"status":400,"body":{}}
        if len(b["features"])!=3: return {"status":400,"body":{}}
        return {"status":200,"body":{"classe":_m(b["features"])}}
    return {"status":404,"body":{}}
assert r_health["status"] == 200, "r_health: GET /health -> 200"
assert r_pred_ok["status"] == 200 and r_pred_ok["body"]["classe"] == "alto", "r_pred_ok: [5,4,3] somma 12 > 10 -> 'alto', status 200"
assert r_pred_400["status"] == 400, "r_pred_400: body vuoto -> 400"
assert r_404["status"] == 404, "r_404: rotta inesistente -> 404"
assert tutto_ok == True, "tutto_ok: True — tutti gli status corretti"`,
      hint: `<p>Il servizio è completo: calcola solo <code>tutto_ok</code> verificando i 4 status: <code>tutto_ok = r_health["status"]==200 and r_pred_ok["status"]==200 and r_pred_400["status"]==400 and r_404["status"]==404</code>.</p>`,
      solution: `def modello(features):
    return "alto" if sum(features) > 10 else "basso"

def servi(metodo, percorso, body):
    if metodo == "GET" and percorso == "/health":
        return {"status": 200, "body": {"stato": "ok"}}
    if metodo == "POST" and percorso == "/predict":
        if not body or "features" not in body:
            return {"status": 400, "body": {"errore": "features mancanti"}}
        if len(body["features"]) != 3:
            return {"status": 400, "body": {"errore": "servono 3 feature"}}
        pred = modello(body["features"])
        return {"status": 200, "body": {"classe": pred}}
    return {"status": 404, "body": {"errore": "Not Found"}}

r_health = servi("GET", "/health", None)
r_pred_ok = servi("POST", "/predict", {"features": [5, 4, 3]})
r_pred_400 = servi("POST", "/predict", {})
r_404 = servi("GET", "/altro", None)
tutto_ok = (r_health["status"] == 200 and r_pred_ok["status"] == 200
            and r_pred_400["status"] == 400 and r_404["status"] == 404)

print("health:", r_health)
print("predict ok:", r_pred_ok)
print("predict 400:", r_pred_400)
print("404:", r_404)`
    }

  ]
});
