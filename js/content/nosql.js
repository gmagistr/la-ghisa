window.MODULES.push({
  id: "nosql",
  name: "NoSQL",
  tagline: "La sala funzionale senza rack fissi: documenti flessibili, niente schema rigido, ogni oggetto porta la sua forma.",
  intro: "I database NoSQL a documenti (MongoDB e simili) non hanno tabelle con colonne fisse: salvano oggetti JSON-like, con struttura libera. Qui costruiamo un mini-motore di query in puro Python — stesse operazioni concettuali di un vero database a documenti, senza bisogno di installare nulla.",
  packages: [],
  items: [

    { type: "theory", title: "Documenti invece di righe", html: `
<p>In SQL ogni riga di una tabella ha le stesse colonne. In un database a documenti, ogni <strong>documento</strong> è un dizionario libero: due iscritti possono avere campi diversi, e va bene così — utile quando i dati sono davvero eterogenei (un iscritto con un piano nutrizionale, uno senza).</p>
<pre><code>iscritti = [
    {"nome": "Anna", "eta": 28, "corsi": ["yoga", "pesi"]},
    {"nome": "Bruno", "eta": 34, "corsi": ["spinning"], "obiettivo": "dimagrimento"},
]</code></pre>
<p>Bruno ha un campo <code>obiettivo</code> che Anna non ha: in SQL servirebbe una colonna NULL per tutti gli altri, qui è semplicemente assente. La "query" più semplice è una list comprehension con un filtro — lo stesso gesto del riscaldamento.</p>
`, more: `
<p>Questa flessibilità ha un prezzo: leggere un campo che potrebbe non esistere su TUTTI i documenti richiede attenzione. <code>d["obiettivo"]</code> solleva <code>KeyError</code> se il documento non ha quel campo; <code>d.get("obiettivo")</code> restituisce <code>None</code> in sicurezza, <code>d.get("obiettivo", "non specificato")</code> restituisce un default esplicito. In un database a schema libero, <code>.get()</code> con default è la norma, non l'eccezione — a differenza di SQL dove ogni colonna esiste sempre (anche se NULL).</p>
<p>Il termine "NoSQL" è un po' fuorviante: non significa "senza SQL" in senso stretto, ma raggruppa famiglie di database molto diverse tra loro che condividono solo l'assenza dello schema fisso relazionale: database a <strong>documenti</strong> (MongoDB, qui simulato), a <strong>chiave-valore</strong> (Redis, prossima teoria), a <strong>grafo</strong> (Neo4j, per relazioni complesse tra entità), a <strong>colonne larghe</strong> (Cassandra, per scrivere enormi volumi in scrittura). Ognuna risolve un problema diverso, non sono intercambiabili.</p>
<p>La scelta tra SQL e un database a documenti dipende dalla forma reale dei dati: se ogni "riga" ha davvero le stesse colonne e le relazioni tra tabelle sono il cuore del problema (un e-commerce con ordini, clienti, prodotti collegati da chiavi), SQL resta spesso la scelta più solida. Se i documenti sono naturalmente eterogenei e annidati (un profilo utente con impostazioni personalizzate diverse per ognuno, un catalogo prodotti con attributi che variano per categoria), un document store elimina l'attrito di forzare quella varietà in tabelle rigide.</p>
` },

    {
      type: "exercise", id: "nosql-01", kg: 5, title: "Filtra i documenti",
      task: `<p>Hai <code>collezione</code>, una lista di documenti (dizionari) che rappresenta gli iscritti. Trova:</p>
<ul>
<li><code>maggiorenni</code>: i documenti (dizionari interi) con <code>eta &gt;= 18</code></li>
<li><code>nomi_yoga</code>: i <code>nome</code> di chi ha <code>"yoga"</code> nella lista <code>corsi</code></li>
</ul>`,
      starter: `collezione = [
    {"nome": "Anna", "eta": 28, "corsi": ["yoga", "pesi"]},
    {"nome": "Bruno", "eta": 34, "corsi": ["spinning"]},
    {"nome": "Carla", "eta": 16, "corsi": ["yoga"]},
    {"nome": "Dario", "eta": 41, "corsi": ["pesi", "yoga"]},
]

maggiorenni = ...
nomi_yoga = ...

print(maggiorenni)
print(nomi_yoga)`,
      check: `assert 'maggiorenni' in globals() and len(maggiorenni) == 3 and all(d["eta"] >= 18 for d in maggiorenni), "maggiorenni: [d for d in collezione if d['eta'] >= 18] — Carla (16) esclusa"
assert 'nomi_yoga' in globals() and nomi_yoga == ["Anna", "Carla", "Dario"], "nomi_yoga: [d['nome'] for d in collezione if 'yoga' in d['corsi']]"`,
      hint: `<p>L'operatore <code>in</code> su una lista funziona anche dentro le comprehension: <code>"yoga" in d["corsi"]</code> è <code>True</code> o <code>False</code> come qualsiasi condizione.</p>`,
      solution: `collezione = [
    {"nome": "Anna", "eta": 28, "corsi": ["yoga", "pesi"]},
    {"nome": "Bruno", "eta": 34, "corsi": ["spinning"]},
    {"nome": "Carla", "eta": 16, "corsi": ["yoga"]},
    {"nome": "Dario", "eta": 41, "corsi": ["pesi", "yoga"]},
]

maggiorenni = [d for d in collezione if d["eta"] >= 18]
nomi_yoga = [d["nome"] for d in collezione if "yoga" in d["corsi"]]

print(maggiorenni)
print(nomi_yoga)`
    },

    { type: "theory", title: "insert_one / find: il vocabolario di Mongo", html: `
<p>I database a documenti reali (MongoDB in testa) usano un vocabolario standard: <code>insert_one</code>/<code>insert_many</code> per scrivere, <code>find</code> per cercare con un filtro a dizionario, <code>find_one</code> per un solo risultato. Qui lo replichiamo con una classe minima, <code>MiniMongo</code> (già fornita), che si comporta come l'originale:</p>
<pre><code>db = MiniMongo()
db.insert_one({"nome": "Anna", "eta": 28})
db.find({"eta": 28})          # lista di documenti che combaciano ESATTAMENTE sul campo
db.find_one({"nome": "Anna"}) # il primo che combacia, o None</code></pre>
<p>Il filtro <code>{"campo": valore}</code> è un <strong>pattern di uguaglianza</strong>: seleziona solo i documenti dove quel campo vale esattamente quello. È l'equivalente concettuale del <code>WHERE campo = valore</code> di SQL, ma senza schema fisso.</p>
`, more: `
<p>Un vero MongoDB estende il pattern di uguaglianza con <strong>operatori di confronto</strong> dentro il filtro: <code>db.find({"eta": {"$gt": 25}})</code> (maggiore di), <code>{"$lt": ...}</code> (minore), <code>{"$in": [...]}</code> (appartenenza a una lista di valori) — la nostra <code>MiniMongo</code> semplificata supporta solo l'uguaglianza esatta, un limite deliberato per restare concentrati sul concetto centrale prima di aggiungere complessità.</p>
<p><code>insert_many(lista_di_documenti)</code> (non implementato nella nostra classe minima, ma presente in ogni driver reale) inserisce più documenti in una sola chiamata — l'equivalente di <code>executemany</code> in SQL, utile quando devi popolare una collezione con dati che arrivano già in blocco (es. da un file JSON).</p>
<p>Il fatto che <code>find</code> restituisca sempre una lista (anche vuota, se nessun documento combacia) mentre <code>find_one</code> restituisca <code>None</code> quando non trova nulla è una convenzione importante da ricordare: verificare <code>if risultato:</code> su una lista vuota o su <code>None</code> funziona in entrambi i casi (entrambi sono "falsy" in Python), ma il TIPO di dato che ricevi indietro è diverso — un dettaglio che conta se il codice successivo si aspetta una lista da iterare o un singolo documento da cui leggere campi.</p>
` },

    {
      type: "exercise", id: "nosql-02", kg: 10, title: "Il tuo primo database a documenti",
      task: `<p><code>MiniMongo</code> è già definita (nel setup). Usala per:</p>
<ul>
<li>Inserire tre documenti in <code>db</code>: {"nome": "Anna", "corso": "yoga"}, {"nome": "Bruno", "corso": "pesi"}, {"nome": "Carla", "corso": "yoga"}</li>
<li><code>yoga_people</code>: risultato di <code>db.find({"corso": "yoga"})</code></li>
<li><code>bruno</code>: risultato di <code>db.find_one({"nome": "Bruno"})</code></li>
</ul>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None

db = MiniMongo()`,
      starter: `# db e' gia' pronta (una MiniMongo vuota)
db.insert_one({"nome": "Anna", "corso": "yoga"})
# inserisci gli altri due
...

yoga_people = ...
bruno = ...

print(yoga_people)
print(bruno)`,
      check: `assert 'yoga_people' in globals() and len(yoga_people) == 2 and {d["nome"] for d in yoga_people} == {"Anna", "Carla"}, "yoga_people: db.find({'corso': 'yoga'}) deve trovare Anna e Carla"
assert 'bruno' in globals() and bruno == {"nome": "Bruno", "corso": "pesi"}, "bruno: db.find_one({'nome': 'Bruno'})"`,
      hint: `<p><code>db.insert_one({...})</code> due volte in più, poi <code>db.find({"corso": "yoga"})</code> e <code>db.find_one({"nome": "Bruno"})</code>.</p>`,
      solution: `db.insert_one({"nome": "Anna", "corso": "yoga"})
db.insert_one({"nome": "Bruno", "corso": "pesi"})
db.insert_one({"nome": "Carla", "corso": "yoga"})

yoga_people = db.find({"corso": "yoga"})
bruno = db.find_one({"nome": "Bruno"})

print(yoga_people)
print(bruno)`
    },

    { type: "theory", title: "Documenti annidati: dati dentro dati", html: `
<p>Il punto di forza dei documenti è annidare strutture: un iscritto può contenere direttamente il suo abbonamento, invece di vivere in una tabella separata da unire con un JOIN.</p>
<pre><code>{
    "nome": "Anna",
    "abbonamento": {"tipo": "annuale", "prezzo": 420},
    "presenze": [12, 8, 15, 20]
}</code></pre>
<p>Accedere ai campi annidati è normale accesso a dizionari/liste: <code>doc["abbonamento"]["prezzo"]</code>, <code>sum(doc["presenze"])</code>. Questo evita join, ma sposta la complessità altrove: se il prezzo dell'abbonamento cambia, va aggiornato in <em>ogni</em> documento che lo contiene (in SQL, in una sola riga). È un compromesso, non un pranzo gratis.</p>
`, more: `
<p>L'annidamento può avere quanti livelli servono: <code>doc["indirizzo"]["citta"]["cap"]</code> non è raro in documenti complessi (un ordine con cliente, che ha un indirizzo, che ha una città con un cap) — ma ogni livello in più aumenta il rischio di <code>KeyError</code> se un campo intermedio manca. Un accesso sicuro a più livelli richiede catene di <code>.get()</code>: <code>doc.get("indirizzo", {}).get("citta", {}).get("cap")</code>, dove ogni <code>.get()</code> con default <code>{}</code> garantisce che il successivo <code>.get()</code> abbia comunque un dizionario su cui operare invece di fallire su <code>None</code>.</p>
<p>Quando un campo annidato è esso stesso una LISTA di documenti (es. <code>"presenze_dettagliate": [{"data": "2026-01-05", "durata": 45}, ...]</code> invece di una semplice lista di numeri), estrarre un aggregato richiede una comprehension annidata: <code>sum(p["durata"] for p in doc["presenze_dettagliate"])</code> — stesso principio del <code>sum(doc["presenze"])</code> più semplice, solo con un livello di struttura in più da attraversare.</p>
<p>La denormalizzazione (copiare dati dentro il documento invece di referenziarli altrove) non è gratuita nemmeno in lettura: un documento con troppi dati annidati e duplicati diventa più pesante da trasferire e da tenere in memoria, anche quando la maggior parte di quei campi non serve alla query specifica. Il compromesso "un documento grande e autosufficiente" contro "molti documenti piccoli collegati da id" è la stessa decisione normalizzare/denormalizzare che vedrai esplicitamente in un'altra teoria di questa sala.</p>
` },

    {
      type: "exercise", id: "nosql-03", kg: 15, title: "Scava nei documenti annidati",
      task: `<p>Hai <code>iscritti</code>, documenti con abbonamento annidato e lista di presenze mensili. Calcola:</p>
<ul>
<li><code>ricavo_totale</code>: la somma dei prezzi di <strong>tutti</strong> gli abbonamenti</li>
<li><code>presenze_totali</code>: dizionario nome → somma delle presenze di quella persona</li>
<li><code>piu_presente</code>: il nome di chi ha più presenze totali</li>
</ul>`,
      starter: `iscritti = [
    {"nome": "Anna", "abbonamento": {"tipo": "annuale", "prezzo": 420}, "presenze": [12, 8, 15, 20]},
    {"nome": "Bruno", "abbonamento": {"tipo": "mensile", "prezzo": 45}, "presenze": [4, 6]},
    {"nome": "Carla", "abbonamento": {"tipo": "annuale", "prezzo": 420}, "presenze": [10, 10, 10, 10, 10]},
]

ricavo_totale = ...
presenze_totali = ...
piu_presente = ...

print(ricavo_totale)
print(presenze_totali)
print(piu_presente)`,
      check: `assert 'ricavo_totale' in globals() and ricavo_totale == 885, "ricavo_totale: somma di d['abbonamento']['prezzo'] per ogni documento — 420+45+420"
assert 'presenze_totali' in globals() and presenze_totali == {"Anna": 55, "Bruno": 10, "Carla": 50}, "presenze_totali: dizionario nome -> sum(d['presenze'])"
assert 'piu_presente' in globals() and piu_presente == "Anna", "piu_presente: la chiave col valore massimo in presenze_totali"`,
      hint: `<p><code>sum(d["abbonamento"]["prezzo"] for d in iscritti)</code> per il ricavo. Per il massimo su un dizionario: <code>max(presenze_totali, key=presenze_totali.get)</code> — lo stesso trucco del riscaldamento.</p>`,
      solution: `iscritti = [
    {"nome": "Anna", "abbonamento": {"tipo": "annuale", "prezzo": 420}, "presenze": [12, 8, 15, 20]},
    {"nome": "Bruno", "abbonamento": {"tipo": "mensile", "prezzo": 45}, "presenze": [4, 6]},
    {"nome": "Carla", "abbonamento": {"tipo": "annuale", "prezzo": 420}, "presenze": [10, 10, 10, 10, 10]},
]

ricavo_totale = sum(d["abbonamento"]["prezzo"] for d in iscritti)
presenze_totali = {d["nome"]: sum(d["presenze"]) for d in iscritti}
piu_presente = max(presenze_totali, key=presenze_totali.get)

print(ricavo_totale)
print(presenze_totali)
print(piu_presente)`
    },

    { type: "theory", title: "Chiave-valore: il NoSQL più semplice possibile", html: `
<p>Il database <strong>chiave-valore</strong> (come Redis) è la forma più elementare di NoSQL: una gigantesca mappa chiave → valore, letture e scritture velocissime, nessuna query complessa. In Python è, letteralmente, un dizionario:</p>
<pre><code>cache = {}
cache["utente:42:sessione"] = {"scaduta": False, "minuti_rimasti": 15}
cache.get("utente:42:sessione")   # lettura O(1): istantanea anche con miliardi di chiavi</code></pre>
<p>Le chiavi spesso codificano una gerarchia con dei separatori (<code>"utente:42:sessione"</code>) invece di usare tabelle annidate: è un compromesso deliberato tra semplicità e struttura, tipico di ogni cache applicativa (contatori, sessioni, classifiche in tempo reale).</p>
`, more: `
<p>Redis (il database chiave-valore reale più diffuso) non si limita a valori scalari: supporta liste, insiemi, hash (dizionari annidati) e insiemi ordinati come TIPO di valore per ogni chiave, con operazioni atomiche dedicate (es. <code>LPUSH</code> per aggiungere in testa a una lista, <code>ZADD</code> per un insieme ordinato usato tipicamente per classifiche in tempo reale). In Python, l'equivalente concettuale sarebbe un dizionario i cui valori sono a loro volta liste, insiemi o altri dizionari.</p>
<p>Un uso tipico e concreto delle cache chiave-valore è il <strong>caching applicativo</strong>: invece di ricalcolare un risultato costoso (una query lenta, un calcolo pesante) ogni volta, lo si salva con una chiave che ne descrive univocamente i parametri, e alle richieste successive si controlla prima la cache — se la chiave esiste, si evita il ricalcolo. Questo pattern ("controlla la cache, se assente calcola e salva") è probabilmente l'uso più comune di Redis in produzione.</p>
<p>Le chiavi in una cache spesso hanno anche una <strong>scadenza</strong> (TTL, time-to-live): dopo un certo numero di secondi la chiave sparisce automaticamente — utile per dati che diventano obsoleti da soli (una sessione utente, un token temporaneo, un risultato di query che va ricalcolato periodicamente). Un dizionario Python puro non ha questo concetto nativo; simularlo richiederebbe salvare anche un timestamp di scadenza insieme al valore e controllarlo ad ogni lettura.</p>
` },

    {
      type: "exercise", id: "nosql-04", kg: 10, title: "La cache delle presenze",
      task: `<p>Simula una cache chiave-valore per il check-in in palestra. Fai:</p>
<ul>
<li><code>cache</code>: dizionario con chiavi <code>"presenze:squat"</code> → 1, <code>"presenze:yoga"</code> → 1 (due check-in)</li>
<li>Simula un terzo check-in a "squat": incrementa <code>cache["presenze:squat"]</code> di 1 (usa <code>.get</code> per sicurezza)</li>
<li><code>corso_piu_gettonato</code>: la chiave (stringa intera, es. <code>"presenze:squat"</code>) col valore più alto</li>
</ul>`,
      starter: `cache = {}
cache["presenze:squat"] = 1
cache["presenze:yoga"] = 1

# simula un altro check-in a squat
cache["presenze:squat"] = ...

corso_piu_gettonato = ...

print(cache)
print(corso_piu_gettonato)`,
      check: `assert cache == {"presenze:squat": 2, "presenze:yoga": 1}, "Dopo il check-in, presenze:squat deve valere 2"
assert 'corso_piu_gettonato' in globals() and corso_piu_gettonato == "presenze:squat", "corso_piu_gettonato: max(cache, key=cache.get)"`,
      hint: `<p><code>cache["presenze:squat"] = cache.get("presenze:squat", 0) + 1</code> — lo stesso pattern del conteggio nel riscaldamento, qui usato per incrementare una cache.</p>`,
      solution: `cache = {}
cache["presenze:squat"] = 1
cache["presenze:yoga"] = 1

cache["presenze:squat"] = cache.get("presenze:squat", 0) + 1

corso_piu_gettonato = max(cache, key=cache.get)

print(cache)
print(corso_piu_gettonato)`
    },

    { type: "theory", title: "Aggregation pipeline: query a stadi", html: `
<p>MongoDB non ha <code>GROUP BY</code>, ma un concetto equivalente e più flessibile: la <strong>aggregation pipeline</strong>, una sequenza di stadi che ogni documento attraversa in ordine (filtra, raggruppa, ordina...). In Python puro, la stessa idea si scrive come una catena di trasformazioni sui dati:</p>
<pre><code># stadio 1: filtra
attivi = [d for d in iscritti if d["attivo"]]
# stadio 2: raggruppa e aggrega
da_livello = {}
for d in attivi:
    da_livello.setdefault(d["livello"], []).append(d["eta"])
medie = {liv: sum(voti)/len(voti) for liv, voti in da_livello.items()}</code></pre>
<p><code>.setdefault(chiave, default)</code> è la variante di <code>.get</code> pensata per costruire liste: se la chiave non c'è, la crea con il valore di default e la restituisce, pronta per l'<code>.append</code>.</p>
`, more: `
<p>Una vera aggregation pipeline MongoDB usa stadi con nomi standard che vale la pena conoscere anche solo per riconoscerli: <code>$match</code> (equivalente al <code>WHERE</code>/filtro, il nostro stadio 1), <code>$group</code> (equivalente al <code>GROUP BY</code>, il nostro stadio 2 con <code>.setdefault</code>), <code>$sort</code> (ordinamento), <code>$project</code> (seleziona/rinomina i campi da mostrare, come il <code>SELECT</code>) — ogni stadio riceve l'output dello stadio precedente e lo passa al successivo, esattamente come una catena di trasformazioni Python.</p>
<p>Un vantaggio concreto delle pipeline (sia in Mongo che nella versione Python) è la <strong>componibilità</strong>: puoi testare e ragionare su ogni stadio separatamente prima di incatenarli, e riordinare gli stadi (es. filtrare prima di raggruppare, non dopo) per ottimizzare le prestazioni — filtrare presto riduce quanti documenti gli stadi successivi devono processare.</p>
<p>Il pattern "stadio 1 filtra, stadio 2 raggruppa con <code>.setdefault</code>, stadio 3 riduce a un numero" (che vedrai ripetuto in più esercizi di questa sala) è lo scheletro generale di QUALSIASI aggregazione, sia in Mongo, sia in Pandas (<code>filter</code> → <code>groupby</code> → <code>agg</code>), sia in SQL (<code>WHERE</code> → <code>GROUP BY</code> → funzione di aggregazione nel <code>SELECT</code>). Riconoscere questo scheletro comune è più utile che memorizzare la sintassi specifica di un singolo strumento.</p>
` },

    {
      type: "exercise", id: "nosql-05", kg: 20, title: "Pipeline a stadi",
      task: `<p>Sulla collezione <code>iscritti</code>, ricostruisci una pipeline a due stadi:</p>
<ul>
<li>Stadio 1 — <code>attivi</code>: solo i documenti con <code>"attivo": True</code></li>
<li>Stadio 2 — <code>eta_per_livello</code>: dizionario livello → lista delle età (usa <code>.setdefault</code>)</li>
<li><code>media_per_livello</code>: dizionario livello → età media (float)</li>
</ul>`,
      starter: `iscritti = [
    {"nome": "Anna", "eta": 28, "livello": "avanzato", "attivo": True},
    {"nome": "Bruno", "eta": 34, "livello": "base", "attivo": False},
    {"nome": "Carla", "eta": 22, "livello": "avanzato", "attivo": True},
    {"nome": "Dario", "eta": 41, "livello": "base", "attivo": True},
    {"nome": "Elisa", "eta": 30, "livello": "avanzato", "attivo": True},
]

attivi = ...

eta_per_livello = {}
for d in attivi:
    ...

media_per_livello = ...

print(attivi)
print(eta_per_livello)
print(media_per_livello)`,
      check: `assert 'attivi' in globals() and len(attivi) == 4 and all(d["attivo"] for d in attivi), "attivi: [d for d in iscritti if d['attivo']] — Bruno (attivo False) escluso"
assert 'eta_per_livello' in globals() and sorted(eta_per_livello["avanzato"]) == [22, 28, 30] and eta_per_livello["base"] == [41], "eta_per_livello: raggruppa le eta' degli attivi per livello con .setdefault"
assert 'media_per_livello' in globals() and abs(media_per_livello["avanzato"] - 80/3) < 1e-9 and media_per_livello["base"] == 41.0, "media_per_livello: media delle liste in eta_per_livello"`,
      hint: `<p>Nel ciclo: <code>eta_per_livello.setdefault(d["livello"], []).append(d["eta"])</code>. Poi <code>{liv: sum(v)/len(v) for liv, v in eta_per_livello.items()}</code>.</p>`,
      solution: `iscritti = [
    {"nome": "Anna", "eta": 28, "livello": "avanzato", "attivo": True},
    {"nome": "Bruno", "eta": 34, "livello": "base", "attivo": False},
    {"nome": "Carla", "eta": 22, "livello": "avanzato", "attivo": True},
    {"nome": "Dario", "eta": 41, "livello": "base", "attivo": True},
    {"nome": "Elisa", "eta": 30, "livello": "avanzato", "attivo": True},
]

attivi = [d for d in iscritti if d["attivo"]]

eta_per_livello = {}
for d in attivi:
    eta_per_livello.setdefault(d["livello"], []).append(d["eta"])

media_per_livello = {liv: sum(v) / len(v) for liv, v in eta_per_livello.items()}

print(attivi)
print(eta_per_livello)
print(media_per_livello)`
    },

    { type: "theory", title: "Normalizzare o annidare? La domanda di sempre", html: `
<p>SQL ti spinge a <strong>normalizzare</strong>: ogni informazione vive in una sola tabella, e i join la ricompongono al bisogno — niente duplicazione, aggiornamenti sicuri. NoSQL ti permette di <strong>denormalizzare</strong>: duplicare deliberatamente i dati dentro ogni documento per leggerli più in fretta, senza join.</p>
<p>Non è una scelta "giusta o sbagliata" in assoluto: è un compromesso lettura/scrittura. Se il nome di un corso cambia raramente ma viene letto milioni di volte, copiarlo dentro ogni prenotazione (denormalizzare) può avere senso; se cambia spesso, tenerlo in un solo posto (normalizzare, come in SQL) evita di dover aggiornare mille copie.</p>
`, more: `
<p>Il rischio concreto della denormalizzazione è l'<strong>inconsistenza</strong>: se il nome di un corso è copiato in mille prenotazioni e ne aggiorni solo alcune (per un bug, un crash a metà operazione, una dimenticanza), quelle mille copie iniziano a raccontare storie diverse — un problema che in un database normalizzato semplicemente non può esistere, perché il dato vive in un unico posto. La denormalizzazione scambia questa garanzia di coerenza per velocità di lettura.</p>
<p>Una via di mezzo comune nella pratica reale: denormalizzare SOLO i campi che cambiano raramente o che, se leggermente disallineati per un breve periodo, non causano danni gravi (es. il nome di un prodotto in un ordine storico — anche se il prodotto viene rinominato dopo, l'ordine passato può legittimamente mostrare il nome di allora), mentre si tengono normalizzati i campi critici che devono essere sempre coerenti (es. il prezzo attuale disponibile per l'acquisto).</p>
<p>Il criterio pratico per decidere: conta quante volte un dato viene LETTO rispetto a quante volte viene SCRITTO/aggiornato. Rapporti letture/scritture molto alti (un catalogo prodotti consultato migliaia di volte al minuto, aggiornato una volta al giorno) favoriscono la denormalizzazione; rapporti bassi o scritture frequenti (un prezzo che cambia ogni ora) favoriscono la normalizzazione, perché il costo di mantenere sincronizzate molte copie supererebbe il beneficio di lettura più veloce.</p>
` },

    {
      type: "exercise", id: "nosql-06", kg: 25, title: "Massimale: denormalizza e verifica",
      task: `<p>Hai due collezioni <strong>normalizzate</strong> (SQL-style): <code>iscritti</code> e <code>prenotazioni</code> con solo l'id. Costruisci la versione <strong>denormalizzata</strong> (NoSQL-style): un documento per prenotazione, con il nome dell'iscritto <strong>copiato dentro</strong>.</p>
<ul>
<li><code>mappa_nomi</code>: dizionario id → nome, costruito da <code>iscritti</code></li>
<li><code>denormalizzate</code>: lista di documenti <code>{"nome": ..., "corso": ...}</code>, uno per ogni prenotazione, usando <code>mappa_nomi</code> per risolvere l'id</li>
<li><code>per_nome</code>: dizionario nome → lista dei corsi prenotati da quella persona</li>
</ul>`,
      starter: `iscritti = [
    {"id": 1, "nome": "Anna"},
    {"id": 2, "nome": "Bruno"},
    {"id": 3, "nome": "Carla"},
]
prenotazioni = [
    {"iscritto_id": 1, "corso": "yoga"},
    {"iscritto_id": 2, "corso": "pesi"},
    {"iscritto_id": 1, "corso": "spinning"},
    {"iscritto_id": 3, "corso": "yoga"},
]

mappa_nomi = ...
denormalizzate = ...
per_nome = {}
for doc in denormalizzate:
    ...

print(denormalizzate)
print(per_nome)`,
      check: `assert 'mappa_nomi' in globals() and mappa_nomi == {1: "Anna", 2: "Bruno", 3: "Carla"}, "mappa_nomi: dict(zip(...)) o dizionario costruito da 'iscritti', id -> nome"
assert 'denormalizzate' in globals() and len(denormalizzate) == 4 and denormalizzate[0] == {"nome": "Anna", "corso": "yoga"}, "denormalizzate: per ogni prenotazione, {'nome': mappa_nomi[p['iscritto_id']], 'corso': p['corso']}"
assert 'per_nome' in globals() and per_nome == {"Anna": ["yoga", "spinning"], "Bruno": ["pesi"], "Carla": ["yoga"]}, "per_nome: raggruppa i corsi di denormalizzate per nome con .setdefault"`,
      hint: `<p><code>mappa_nomi = {d["id"]: d["nome"] for d in iscritti}</code>. Poi per ogni prenotazione: <code>{"nome": mappa_nomi[p["iscritto_id"]], "corso": p["corso"]}</code>. Infine <code>per_nome.setdefault(doc["nome"], []).append(doc["corso"])</code>.</p>`,
      solution: `iscritti = [
    {"id": 1, "nome": "Anna"},
    {"id": 2, "nome": "Bruno"},
    {"id": 3, "nome": "Carla"},
]
prenotazioni = [
    {"iscritto_id": 1, "corso": "yoga"},
    {"iscritto_id": 2, "corso": "pesi"},
    {"iscritto_id": 1, "corso": "spinning"},
    {"iscritto_id": 3, "corso": "yoga"},
]

mappa_nomi = {d["id"]: d["nome"] for d in iscritti}
denormalizzate = [{"nome": mappa_nomi[p["iscritto_id"]], "corso": p["corso"]} for p in prenotazioni]

per_nome = {}
for doc in denormalizzate:
    per_nome.setdefault(doc["nome"], []).append(doc["corso"])

print(denormalizzate)
print(per_nome)`
    },

    {
      type: "exercise", id: "nosql-07", kg: 5, title: "Drill: catalogo prodotti",
      task: `<p>Hai <code>catalogo</code>, documenti prodotto. Trova <code>disponibili</code> (documenti con <code>"scorte" &gt; 0</code>) e <code>n_esauriti</code> (quanti hanno scorte a 0).</p>`,
      starter: `catalogo = [
    {"nome": "cuffie", "prezzo": 29.9, "scorte": 12},
    {"nome": "mouse", "prezzo": 15.0, "scorte": 0},
    {"nome": "webcam", "prezzo": 40.0, "scorte": 5},
    {"nome": "tastiera", "prezzo": 35.0, "scorte": 0},
]

disponibili = ...
n_esauriti = ...

print(disponibili)
print(n_esauriti)`,
      check: `assert len(disponibili) == 2
assert n_esauriti == 2`,
      hint: `<p><code>[d for d in catalogo if d["scorte"] &gt; 0]</code>, <code>sum(1 for d in catalogo if d["scorte"] == 0)</code>.</p>`,
      solution: `catalogo = [
    {"nome": "cuffie", "prezzo": 29.9, "scorte": 12},
    {"nome": "mouse", "prezzo": 15.0, "scorte": 0},
    {"nome": "webcam", "prezzo": 40.0, "scorte": 5},
    {"nome": "tastiera", "prezzo": 35.0, "scorte": 0},
]

disponibili = [d for d in catalogo if d["scorte"] > 0]
n_esauriti = sum(1 for d in catalogo if d["scorte"] == 0)

print(disponibili)
print(n_esauriti)`
    },

    {
      type: "exercise", id: "nosql-08", kg: 10, title: "Drill: ordini nel document store",
      task: `<p>Con <code>MiniMongo</code> (già pronta): inserisci 3 ordini, poi <code>ordini_spediti</code> (find su stato "spedito"), <code>primo_in_attesa</code> (find_one su stato "in_attesa").</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None

db = MiniMongo()`,
      starter: `# db e' gia' pronta
db.insert_one({"id": "o1", "stato": "spedito"})
db.insert_one({"id": "o2", "stato": "in_attesa"})
db.insert_one({"id": "o3", "stato": "spedito"})

ordini_spediti = db.find({"stato": "spedito"})
primo_in_attesa = db.find_one({"stato": "in_attesa"})

print(ordini_spediti)
print(primo_in_attesa)`,
      check: `assert len(ordini_spediti) == 2
assert primo_in_attesa == {"id": "o2", "stato": "in_attesa"}`,
      hint: `<p><code>db.find({"stato": "spedito"})</code> restituisce tutte le corrispondenze; <code>find_one</code> solo la prima.</p>`,
      solution: `db.insert_one({"id": "o1", "stato": "spedito"})
db.insert_one({"id": "o2", "stato": "in_attesa"})
db.insert_one({"id": "o3", "stato": "spedito"})

ordini_spediti = db.find({"stato": "spedito"})
primo_in_attesa = db.find_one({"stato": "in_attesa"})

print(ordini_spediti)
print(primo_in_attesa)`
    },

    { type: "theory", title: "update_one e delete_one: modificare documenti", html: `
<p>Oltre a inserire e cercare, un document store deve poter modificare o rimuovere: <code>update_one</code> trova il primo documento che combacia e ne aggiorna i campi; <code>delete_one</code> lo rimuove.</p>
<pre><code>class MiniMongo:
    ...
    def update_one(self, filtro, nuovi_valori):
        doc = self.find_one(filtro)
        if doc is not None:
            doc.update(nuovi_valori)   # aggiorna i campi indicati, lascia gli altri intatti

    def delete_one(self, filtro):
        doc = self.find_one(filtro)
        if doc is not None:
            self.docs.remove(doc)</code></pre>
<p><code>dict.update()</code> (il metodo nativo di Python, non collegato a Mongo) fonde un dizionario nell'altro: le chiavi esistenti vengono sovrascritte, quelle nuove aggiunte.</p>
`, more: `
<p>Un vero MongoDB distingue <code>update_one</code> (aggiorna il primo documento che combacia) da <code>update_many</code> (aggiorna TUTTI i documenti che combaciano) — la stessa distinzione concettuale tra <code>UPDATE ... LIMIT 1</code> (raro in SQL) e <code>UPDATE ... WHERE condizione</code> (che tocca ogni riga corrispondente). La nostra <code>MiniMongo</code> implementa solo la versione "singola" per restare semplice, ma il principio si estende naturalmente: <code>update_many</code> farebbe lo stesso ciclo di <code>find</code> più <code>.update()</code> per OGNI documento trovato, non solo il primo.</p>
<p>MongoDB reale usa anche operatori di aggiornamento speciali invece di sovrascrivere l'intero valore: <code>{"$inc": {"contatore": 1}}</code> incrementa atomicamente un numero senza doverlo leggere e riscrivere a mano, <code>{"$push": {"tag": "nuovo"}}</code> aggiunge un elemento a un array annidato — operazioni pensate per essere sicure anche con più processi che scrivono contemporaneamente sullo stesso documento (un problema di concorrenza che il semplice <code>dict.update()</code> di Python non affronta).</p>
<p>Un'insidia di <code>delete_one</code> come implementato qui: usa <code>self.docs.remove(doc)</code>, che rimuove per UGUAGLIANZA del contenuto del dizionario, non per identità di posizione — se due documenti fossero identici in ogni campo, <code>remove</code> toglierebbe il primo che trova, non necessariamente quello "giusto" se la tua intenzione era un altro. In un database reale, ogni documento ha un identificatore univoco generato automaticamente (l'<code>_id</code> di MongoDB) proprio per evitare questa ambiguità.</p>
` },

    {
      type: "exercise", id: "nosql-09", kg: 15, title: "Drill: aggiorna lo stato ordine",
      task: `<p>Con <code>db</code> (già popolata e con <code>update_one</code> disponibile): aggiorna l'ordine "o2" a stato "spedito", poi verifica in <code>o2_aggiornato</code>.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None
    def update_one(self, filtro, nuovi_valori):
        doc = self.find_one(filtro)
        if doc is not None:
            doc.update(nuovi_valori)

db = MiniMongo()
db.insert_one({"id": "o1", "stato": "spedito"})
db.insert_one({"id": "o2", "stato": "in_attesa"})`,
      starter: `# db e' gia' popolata
db.update_one({"id": "o2"}, {"stato": "spedito"})
o2_aggiornato = db.find_one({"id": "o2"})

print(o2_aggiornato)`,
      check: `assert o2_aggiornato == {"id": "o2", "stato": "spedito"}`,
      hint: `<p>Il primo argomento di <code>update_one</code> TROVA il documento; il secondo dice COSA cambiare.</p>`,
      solution: `db.update_one({"id": "o2"}, {"stato": "spedito"})
o2_aggiornato = db.find_one({"id": "o2"})

print(o2_aggiornato)`
    },

    {
      type: "exercise", id: "nosql-10", kg: 15, title: "Drill: cancella un ordine",
      task: `<p>Con <code>db</code> (già popolata e con <code>delete_one</code> disponibile): elimina l'ordine "o1", poi <code>n_rimasti</code>.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None
    def delete_one(self, filtro):
        doc = self.find_one(filtro)
        if doc is not None:
            self.docs.remove(doc)

db = MiniMongo()
db.insert_one({"id": "o1", "stato": "spedito"})
db.insert_one({"id": "o2", "stato": "in_attesa"})
db.insert_one({"id": "o3", "stato": "spedito"})`,
      starter: `# db e' gia' popolata
db.delete_one({"id": "o1"})
n_rimasti = len(db.docs)

print(n_rimasti)`,
      check: `assert n_rimasti == 2
assert db.find_one({"id": "o1"}) is None`,
      hint: `<p>Dopo <code>delete_one</code>, cercare quel documento con <code>find_one</code> deve restituire <code>None</code>.</p>`,
      solution: `db.delete_one({"id": "o1"})
n_rimasti = len(db.docs)

print(n_rimasti)`
    },

    {
      type: "exercise", id: "nosql-11", kg: 15, title: "Drill: profilo con indirizzo annidato",
      task: `<p>Hai <code>utenti</code>, documenti con indirizzo annidato. Crea <code>citta_utenti</code> (lista delle città) e <code>di_milano</code> (nomi degli utenti che vivono a Milano).</p>`,
      starter: `utenti = [
    {"nome": "Anna", "indirizzo": {"citta": "Milano", "cap": "20100"}},
    {"nome": "Bo", "indirizzo": {"citta": "Roma", "cap": "00100"}},
    {"nome": "Cin", "indirizzo": {"citta": "Milano", "cap": "20121"}},
]

citta_utenti = ...
di_milano = ...

print(citta_utenti)
print(di_milano)`,
      check: `assert citta_utenti == ["Milano", "Roma", "Milano"]
assert di_milano == ["Anna", "Cin"]`,
      hint: `<p><code>[u["indirizzo"]["citta"] for u in utenti]</code>, poi filtra dove quella città è "Milano".</p>`,
      solution: `utenti = [
    {"nome": "Anna", "indirizzo": {"citta": "Milano", "cap": "20100"}},
    {"nome": "Bo", "indirizzo": {"citta": "Roma", "cap": "00100"}},
    {"nome": "Cin", "indirizzo": {"citta": "Milano", "cap": "20121"}},
]

citta_utenti = [u["indirizzo"]["citta"] for u in utenti]
di_milano = [u["nome"] for u in utenti if u["indirizzo"]["citta"] == "Milano"]

print(citta_utenti)
print(di_milano)`
    },

    {
      type: "exercise", id: "nosql-12", kg: 15, title: "Drill: contatore di visualizzazioni",
      task: `<p>Simula una cache di visualizzazioni pagina. Parti da <code>cache</code> vuota, registra 3 visite a "/home" e 1 a "/shop" (incrementando con <code>.get</code>), poi <code>pagina_top</code>.</p>`,
      starter: `cache = {}
visite = ["/home", "/shop", "/home", "/home"]

for pagina in visite:
    cache[pagina] = cache.get(pagina, 0) + 1

pagina_top = max(cache, key=cache.get)

print(cache)
print(pagina_top)`,
      check: `assert cache == {"/home": 3, "/shop": 1}
assert pagina_top == "/home"`,
      hint: `<p>Lo stesso identico pattern di conteggio del riscaldamento, qui applicato a una "cache" di visite.</p>`,
      solution: `cache = {}
visite = ["/home", "/shop", "/home", "/home"]

for pagina in visite:
    cache[pagina] = cache.get(pagina, 0) + 1

pagina_top = max(cache, key=cache.get)

print(cache)
print(pagina_top)`
    },

    {
      type: "exercise", id: "nosql-13", kg: 20, title: "Drill: pipeline su ordini attivi",
      task: `<p>Su <code>ordini</code>: stadio 1, <code>attivi</code> (stato != "annullato"); stadio 2, <code>totale_per_cliente</code> (somma importo per cliente, dict).</p>`,
      starter: `ordini = [
    {"cliente": "Anna", "importo": 50, "stato": "spedito"},
    {"cliente": "Bo", "importo": 30, "stato": "annullato"},
    {"cliente": "Anna", "importo": 20, "stato": "consegnato"},
    {"cliente": "Cin", "importo": 80, "stato": "spedito"},
]

attivi = [o for o in ordini if o["stato"] != "annullato"]

totale_per_cliente = {}
for o in attivi:
    totale_per_cliente[o["cliente"]] = totale_per_cliente.get(o["cliente"], 0) + o["importo"]

print(attivi)
print(totale_per_cliente)`,
      check: `assert len(attivi) == 3
assert totale_per_cliente == {"Anna": 70, "Cin": 80}`,
      hint: `<p>Bo sparisce dallo stadio 1 (annullato); nello stadio 2 restano solo i clienti con almeno un ordine attivo.</p>`,
      solution: `ordini = [
    {"cliente": "Anna", "importo": 50, "stato": "spedito"},
    {"cliente": "Bo", "importo": 30, "stato": "annullato"},
    {"cliente": "Anna", "importo": 20, "stato": "consegnato"},
    {"cliente": "Cin", "importo": 80, "stato": "spedito"},
]

attivi = [o for o in ordini if o["stato"] != "annullato"]

totale_per_cliente = {}
for o in attivi:
    totale_per_cliente[o["cliente"]] = totale_per_cliente.get(o["cliente"], 0) + o["importo"]

print(attivi)
print(totale_per_cliente)`
    },

    {
      type: "exercise", id: "nosql-14", kg: 20, title: "Drill: denormalizza il catalogo",
      task: `<p>Hai <code>prodotti</code> (id, nome) e <code>recensioni</code> (prodotto_id, voto). Costruisci <code>recensioni_denorm</code>: un documento per recensione con il <strong>nome</strong> del prodotto copiato dentro.</p>`,
      starter: `prodotti = [{"id": 1, "nome": "cuffie"}, {"id": 2, "nome": "mouse"}]
recensioni = [{"prodotto_id": 1, "voto": 5}, {"prodotto_id": 2, "voto": 3}, {"prodotto_id": 1, "voto": 4}]

mappa_nomi = {p["id"]: p["nome"] for p in prodotti}
recensioni_denorm = [{"prodotto": mappa_nomi[r["prodotto_id"]], "voto": r["voto"]} for r in recensioni]

print(recensioni_denorm)`,
      check: `assert recensioni_denorm == [{"prodotto": "cuffie", "voto": 5}, {"prodotto": "mouse", "voto": 3}, {"prodotto": "cuffie", "voto": 4}]`,
      hint: `<p>Prima costruisci la mappa id→nome, poi usala per "spalmare" il nome dentro ogni recensione.</p>`,
      solution: `prodotti = [{"id": 1, "nome": "cuffie"}, {"id": 2, "nome": "mouse"}]
recensioni = [{"prodotto_id": 1, "voto": 5}, {"prodotto_id": 2, "voto": 3}, {"prodotto_id": 1, "voto": 4}]

mappa_nomi = {p["id"]: p["nome"] for p in prodotti}
recensioni_denorm = [{"prodotto": mappa_nomi[r["prodotto_id"]], "voto": r["voto"]} for r in recensioni]

print(recensioni_denorm)`
    },

    { type: "theory", title: "Array dentro i documenti", html: `
<p>Un campo documento può essere direttamente una <strong>lista</strong> — tag, commenti, storico ordini di un cliente — senza bisogno di una tabella separata:</p>
<pre><code>cliente = {"nome": "Anna", "tag": ["vip", "newsletter"]}
cliente["tag"].append("black_friday")   # aggiungere e' un semplice append</code></pre>
<p>Cercare dentro gli array è altrettanto diretto: <code>"vip" in cliente["tag"]</code>, o una comprehension per filtrare documenti che contengono un certo tag.</p>
`, more: `
<p>Un vero MongoDB estende il filtro di uguaglianza per lavorare direttamente su array: <code>db.find({"tag": "vip"})</code> trova i documenti dove <code>"vip"</code> è UNO degli elementi dell'array <code>tag</code> (non richiede che l'intero array sia esattamente <code>["vip"]</code>) — un comportamento che la nostra <code>MiniMongo</code> semplificata non replica, perché il suo confronto è sempre di uguaglianza esatta sull'intero valore del campo, array compreso.</p>
<p>Operazioni comuni sugli array oltre ad <code>.append()</code>: <code>.remove(valore)</code> toglie la prima occorrenza di un valore specifico, <code>len(lista)</code> conta gli elementi (utile per ordinare documenti per "quanti tag ha ciascuno", visto in un esercizio di questa sala), e le comprehension per trasformare l'array intero (es. <code>[t.upper() for t in cliente["tag"]]</code> per una versione tutta maiuscola dei tag).</p>
<p>Un array dentro un documento può contenere a sua volta altri documenti (non solo stringhe o numeri): <code>"commenti": [{"autore": "Anna", "testo": "..."}, {"autore": "Bo", "testo": "..."}]</code> — in quel caso filtrare o aggregare richiede di scendere di un livello, iterando sull'array e poi accedendo ai campi di ciascun elemento, lo stesso pattern visto per i documenti annidati più in generale.</p>
` },

    {
      type: "exercise", id: "nosql-15", kg: 15, title: "Drill: aggiungi un tag",
      task: `<p>Su <code>cliente</code> (con lista tag): aggiungi <code>"black_friday"</code> ai tag, poi <code>ha_vip</code> (booleana, controlla se "vip" è tra i tag).</p>`,
      starter: `cliente = {"nome": "Anna", "tag": ["vip", "newsletter"]}

cliente["tag"].append("black_friday")
ha_vip = "vip" in cliente["tag"]

print(cliente)
print(ha_vip)`,
      check: `assert cliente["tag"] == ["vip", "newsletter", "black_friday"]
assert ha_vip == True`,
      hint: `<p><code>.append()</code> aggiunge in coda; <code>in</code> testa l'appartenenza.</p>`,
      solution: `cliente = {"nome": "Anna", "tag": ["vip", "newsletter"]}

cliente["tag"].append("black_friday")
ha_vip = "vip" in cliente["tag"]

print(cliente)
print(ha_vip)`
    },

    {
      type: "exercise", id: "nosql-16", kg: 20, title: "Drill: clienti per numero di tag",
      task: `<p>Su <code>clienti</code> (ognuno con lista tag): <code>ordinati</code>, i documenti ordinati per <strong>numero</strong> di tag decrescente.</p>`,
      starter: `clienti = [
    {"nome": "Anna", "tag": ["vip", "newsletter", "black_friday"]},
    {"nome": "Bo", "tag": ["newsletter"]},
    {"nome": "Cin", "tag": ["vip", "black_friday"]},
]

ordinati = sorted(clienti, key=lambda c: len(c["tag"]), reverse=True)
print([c["nome"] for c in ordinati])`,
      check: `assert [c["nome"] for c in ordinati] == ["Anna", "Cin", "Bo"]`,
      hint: `<p><code>key=lambda c: len(c["tag"])</code>: ordina in base alla LUNGHEZZA della lista, non al suo contenuto.</p>`,
      solution: `clienti = [
    {"nome": "Anna", "tag": ["vip", "newsletter", "black_friday"]},
    {"nome": "Bo", "tag": ["newsletter"]},
    {"nome": "Cin", "tag": ["vip", "black_friday"]},
]

ordinati = sorted(clienti, key=lambda c: len(c["tag"]), reverse=True)
print([c["nome"] for c in ordinati])`
    },

    {
      type: "exercise", id: "nosql-17", kg: 20, title: "Drill: quanti tag diversi in totale",
      task: `<p>Su <code>clienti</code> (stessa struttura): <code>tag_distinti</code>, l'insieme di tutti i tag distinti usati da chiunque (usa <code>.update()</code> su un set, in un ciclo).</p>`,
      starter: `clienti = [
    {"nome": "Anna", "tag": ["vip", "newsletter"]},
    {"nome": "Bo", "tag": ["newsletter"]},
    {"nome": "Cin", "tag": ["vip", "black_friday"]},
]

tag_distinti = set()
for c in clienti:
    tag_distinti.update(c["tag"])

print(tag_distinti)`,
      check: `assert tag_distinti == {"vip", "newsletter", "black_friday"}`,
      hint: `<p><code>set().update(lista)</code> aggiunge tutti gli elementi della lista al set, senza doppioni.</p>`,
      solution: `clienti = [
    {"nome": "Anna", "tag": ["vip", "newsletter"]},
    {"nome": "Bo", "tag": ["newsletter"]},
    {"nome": "Cin", "tag": ["vip", "black_friday"]},
]

tag_distinti = set()
for c in clienti:
    tag_distinti.update(c["tag"])

print(tag_distinti)`
    },

    { type: "theory", title: "Indici: cercare senza scandire tutto", html: `
<p>Cercare un documento per id scandendo l'intera collezione (<code>for d in docs: if d["id"]==x</code>) è <strong>lineare</strong>: con un milione di documenti, un milione di confronti nel caso peggiore. Un <strong>indice</strong> — un dizionario id→documento costruito una volta — rende la ricerca <strong>istantanea</strong> (O(1)):</p>
<pre><code>indice = {d["id"]: d for d in docs}
indice["u42"]   # accesso diretto, non serve scandire nulla</code></pre>
<p>È esattamente il meccanismo dietro gli indici dei database veri (SQL compreso): una struttura dati ausiliaria che sacrifica un po' di memoria per guadagnare moltissima velocità di lettura.</p>
`, more: `
<p>Il costo nascosto di un indice è la <strong>manutenzione</strong>: se i documenti cambiano (inserimenti, cancellazioni, aggiornamenti del campo indicizzato), l'indice deve essere aggiornato di conseguenza, altrimenti punta a documenti obsoleti o inesistenti. Nei database veri questo avviene automaticamente e in modo trasparente; nel nostro dizionario Python costruito a mano, sei tu a doverti ricordare di ricostruirlo (o aggiornarlo) ogni volta che la collezione sottostante cambia.</p>
<p>Un indice su un campo NON univoco (es. un indice per "città" invece che per "id", dove più persone vivono nella stessa città) non può essere un semplice <code>{valore: documento}</code> — servirebbe <code>{valore: [documento1, documento2, ...]}</code>, la stessa struttura "dizionario di liste" costruita con <code>.setdefault()</code> vista nella teoria sulla pipeline di aggregazione di questa sala. È lo stesso identico pattern applicato a uno scopo diverso: instradare velocemente verso i documenti giusti invece di aggregarli.</p>
<p>Nei database relazionali reali, un indice non è quasi mai un semplice dizionario ma una struttura ad albero (tipicamente un <strong>B-tree</strong>), che mantiene i valori ORDINATI e permette non solo ricerche esatte istantanee ma anche ricerche per intervallo (<code>WHERE eta BETWEEN 20 AND 30</code>) in tempo logaritmico invece che lineare — un vantaggio che un semplice dizionario Python (ottimo per l'uguaglianza esatta) non offre altrettanto naturalmente.</p>
` },

    {
      type: "exercise", id: "nosql-18", kg: 20, title: "Drill: costruisci un indice",
      task: `<p>Su <code>utenti</code> (con <code>id</code>): costruisci <code>indice</code> (dict id→documento), poi usalo per ottenere <code>utente_42</code> senza cicli.</p>`,
      starter: `utenti = [
    {"id": "u10", "nome": "Anna"},
    {"id": "u42", "nome": "Bo"},
    {"id": "u77", "nome": "Cin"},
]

indice = {u["id"]: u for u in utenti}
utente_42 = indice["u42"]

print(utente_42)`,
      check: `assert utente_42 == {"id": "u42", "nome": "Bo"}`,
      hint: `<p>Una volta costruito l'indice, <code>indice["u42"]</code> è un accesso diretto, non una ricerca.</p>`,
      solution: `utenti = [
    {"id": "u10", "nome": "Anna"},
    {"id": "u42", "nome": "Bo"},
    {"id": "u77", "nome": "Cin"},
]

indice = {u["id"]: u for u in utenti}
utente_42 = indice["u42"]

print(utente_42)`
    },

    {
      type: "exercise", id: "nosql-19", kg: 20, title: "Combo: aggiorna tramite indice",
      task: `<p>Costruisci <code>indice</code> (id→documento) su <code>prodotti</code>, poi aggiorna direttamente il prezzo del prodotto "p2" a 99.9 <strong>attraverso l'indice</strong> (le modifiche su un dizionario ottenuto da comprehension puntano agli STESSI oggetti originali).</p>`,
      starter: `prodotti = [
    {"id": "p1", "nome": "cuffie", "prezzo": 29.9},
    {"id": "p2", "nome": "mouse", "prezzo": 15.0},
]

indice = {p["id"]: p for p in prodotti}
indice["p2"]["prezzo"] = 99.9

print(prodotti)`,
      check: `assert prodotti[1]["prezzo"] == 99.9, "Modificando tramite l'indice, cambia anche il documento originale in 'prodotti': sono lo stesso oggetto in memoria"`,
      hint: `<p>I dizionari in <code>indice</code> non sono copie: sono riferimenti agli stessi documenti di <code>prodotti</code>. Modificarne uno modifica anche l'altro.</p>`,
      solution: `prodotti = [
    {"id": "p1", "nome": "cuffie", "prezzo": 29.9},
    {"id": "p2", "nome": "mouse", "prezzo": 15.0},
]

indice = {p["id"]: p for p in prodotti}
indice["p2"]["prezzo"] = 99.9

print(prodotti)`
    },

    {
      type: "exercise", id: "nosql-20", kg: 20, title: "Combo: notifiche non lette",
      task: `<p>Su <code>notifiche</code> (con lista <code>destinatari</code>): <code>per_utente</code>, un cache-dict che conta quante notifiche ha ricevuto ciascun utente (un utente può comparire in più notifiche).</p>`,
      starter: `notifiche = [
    {"testo": "Offerta", "destinatari": ["Anna", "Bo"]},
    {"testo": "Reminder", "destinatari": ["Anna"]},
    {"testo": "Novita'", "destinatari": ["Bo", "Cin"]},
]

per_utente = {}
for n in notifiche:
    for utente in n["destinatari"]:
        per_utente[utente] = per_utente.get(utente, 0) + 1

print(per_utente)`,
      check: `assert per_utente == {"Anna": 2, "Bo": 2, "Cin": 1}`,
      hint: `<p>Due cicli annidati: uno sulle notifiche, uno sui destinatari di ciascuna.</p>`,
      solution: `notifiche = [
    {"testo": "Offerta", "destinatari": ["Anna", "Bo"]},
    {"testo": "Reminder", "destinatari": ["Anna"]},
    {"testo": "Novita'", "destinatari": ["Bo", "Cin"]},
]

per_utente = {}
for n in notifiche:
    for utente in n["destinatari"]:
        per_utente[utente] = per_utente.get(utente, 0) + 1

print(per_utente)`
    },

    {
      type: "exercise", id: "nosql-21", kg: 25, title: "Combo: pipeline a tre stadi",
      task: `<p>Su <code>eventi</code> (log utente): stadio 1, <code>validi</code> (escludi <code>tipo == "errore"</code>); stadio 2, <code>per_tipo</code> (raggruppa per tipo con <code>.setdefault</code>); stadio 3, <code>conteggio_per_tipo</code> (quante voci per tipo).</p>`,
      starter: `eventi = [
    {"utente": "Anna", "tipo": "login"},
    {"utente": "Bo", "tipo": "errore"},
    {"utente": "Anna", "tipo": "acquisto"},
    {"utente": "Cin", "tipo": "login"},
    {"utente": "Bo", "tipo": "login"},
]

validi = [e for e in eventi if e["tipo"] != "errore"]

per_tipo = {}
for e in validi:
    per_tipo.setdefault(e["tipo"], []).append(e["utente"])

conteggio_per_tipo = {tipo: len(utenti) for tipo, utenti in per_tipo.items()}

print(validi)
print(per_tipo)
print(conteggio_per_tipo)`,
      check: `assert len(validi) == 4
assert per_tipo["login"] == ["Anna", "Cin", "Bo"]
assert conteggio_per_tipo == {"login": 3, "acquisto": 1}`,
      hint: `<p>Lo stadio 1 filtra, lo stadio 2 raggruppa, lo stadio 3 riduce a un numero: la stessa progressione di ogni pipeline di aggregazione.</p>`,
      solution: `eventi = [
    {"utente": "Anna", "tipo": "login"},
    {"utente": "Bo", "tipo": "errore"},
    {"utente": "Anna", "tipo": "acquisto"},
    {"utente": "Cin", "tipo": "login"},
    {"utente": "Bo", "tipo": "login"},
]

validi = [e for e in eventi if e["tipo"] != "errore"]

per_tipo = {}
for e in validi:
    per_tipo.setdefault(e["tipo"], []).append(e["utente"])

conteggio_per_tipo = {tipo: len(utenti) for tipo, utenti in per_tipo.items()}

print(validi)
print(per_tipo)
print(conteggio_per_tipo)`
    },

    {
      type: "exercise", id: "nosql-22", kg: 25, title: "Combo: MiniMongo con filtro su annidato",
      task: `<p>Con <code>MiniMongo</code> di base (senza modifiche): non supporta filtri su campi annidati con la sintassi <code>{"indirizzo": {...}}</code> a causa del confronto per uguaglianza esatta di dizionari. Verificalo: inserisci due utenti con indirizzo annidato, poi mostra che un filtro esatto sull'intero sotto-dizionario funziona SOLO se combacia perfettamente.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]

db = MiniMongo()`,
      starter: `# db e' gia' pronta
db.insert_one({"nome": "Anna", "indirizzo": {"citta": "Milano", "cap": "20100"}})
db.insert_one({"nome": "Bo", "indirizzo": {"citta": "Milano", "cap": "20121"}})

trovati_esatti = db.find({"indirizzo": {"citta": "Milano", "cap": "20100"}})
trovati_manuali = [d for d in db.docs if d["indirizzo"]["citta"] == "Milano"]

print(trovati_esatti)
print(trovati_manuali)`,
      check: `assert len(trovati_esatti) == 1, "Il filtro esatto trova SOLO Anna: il dizionario deve combaciare byte per byte, cap compreso"
assert len(trovati_manuali) == 2, "Il filtro manuale sul campo annidato trova entrambi: e' piu' flessibile del confronto esatto"`,
      hint: `<p>Un vero MongoDB gestisce nativamente i filtri annidati (<code>{"indirizzo.citta": "Milano"}</code>); la nostra versione semplificata no — un limite onesto della simulazione, utile da riconoscere.</p>`,
      solution: `db.insert_one({"nome": "Anna", "indirizzo": {"citta": "Milano", "cap": "20100"}})
db.insert_one({"nome": "Bo", "indirizzo": {"citta": "Milano", "cap": "20121"}})

trovati_esatti = db.find({"indirizzo": {"citta": "Milano", "cap": "20100"}})
trovati_manuali = [d for d in db.docs if d["indirizzo"]["citta"] == "Milano"]

print(trovati_esatti)
print(trovati_manuali)`
    },

    {
      type: "exercise", id: "nosql-23", kg: 25, title: "Combo: top prodotto per recensioni",
      task: `<p>Su <code>recensioni</code> (prodotto, voto): <code>media_per_prodotto</code> (dict), <code>prodotto_migliore</code> (media più alta), <code>n_recensioni</code> (dict, quante per prodotto — serve per non fidarsi di una media su 1 sola recensione).</p>`,
      starter: `recensioni = [
    {"prodotto": "cuffie", "voto": 5},
    {"prodotto": "mouse", "voto": 5},
    {"prodotto": "cuffie", "voto": 3},
    {"prodotto": "cuffie", "voto": 4},
]

voti_per_prodotto = {}
for r in recensioni:
    voti_per_prodotto.setdefault(r["prodotto"], []).append(r["voto"])

media_per_prodotto = {p: sum(v)/len(v) for p, v in voti_per_prodotto.items()}
n_recensioni = {p: len(v) for p, v in voti_per_prodotto.items()}
prodotto_migliore = max(media_per_prodotto, key=media_per_prodotto.get)

print(media_per_prodotto)
print(n_recensioni)
print(prodotto_migliore)`,
      check: `assert abs(media_per_prodotto["cuffie"] - 4.0) < 1e-9
assert media_per_prodotto["mouse"] == 5.0
assert n_recensioni["mouse"] == 1
assert prodotto_migliore == "mouse", "mouse ha la media piu' alta (5.0), anche se basata su una sola recensione: n_recensioni serve proprio a segnalare questo rischio"`,
      hint: `<p>"mouse" vince sulla media pura, ma <code>n_recensioni["mouse"] == 1</code> ti avverte che quella media è statisticamente fragile — la stessa lezione del <code>count</code> visto in Pandas groupby.</p>`,
      solution: `recensioni = [
    {"prodotto": "cuffie", "voto": 5},
    {"prodotto": "mouse", "voto": 5},
    {"prodotto": "cuffie", "voto": 3},
    {"prodotto": "cuffie", "voto": 4},
]

voti_per_prodotto = {}
for r in recensioni:
    voti_per_prodotto.setdefault(r["prodotto"], []).append(r["voto"])

media_per_prodotto = {p: sum(v)/len(v) for p, v in voti_per_prodotto.items()}
n_recensioni = {p: len(v) for p, v in voti_per_prodotto.items()}
prodotto_migliore = max(media_per_prodotto, key=media_per_prodotto.get)

print(media_per_prodotto)
print(n_recensioni)
print(prodotto_migliore)`
    },

    {
      type: "exercise", id: "nosql-24", kg: 25, title: "Combo: sincronizza due collezioni",
      task: `<p>Hai <code>utenti_attivi</code> (lista di id) e <code>tutti_utenti</code> (documenti). Marca <code>doc["attivo"] = True/False</code> su ciascun documento di <code>tutti_utenti</code> in base alla presenza nell'altra lista — senza ricreare i documenti, modificandoli sul posto.</p>`,
      starter: `utenti_attivi = ["u1", "u3"]
tutti_utenti = [
    {"id": "u1", "nome": "Anna"},
    {"id": "u2", "nome": "Bo"},
    {"id": "u3", "nome": "Cin"},
]

attivi_set = set(utenti_attivi)
for u in tutti_utenti:
    u["attivo"] = u["id"] in attivi_set

print(tutti_utenti)`,
      check: `assert tutti_utenti[0]["attivo"] == True
assert tutti_utenti[1]["attivo"] == False
assert tutti_utenti[2]["attivo"] == True`,
      hint: `<p>Convertire <code>utenti_attivi</code> in <code>set</code> rende il controllo di appartenenza (<code>in</code>) istantaneo invece che una scansione ripetuta della lista.</p>`,
      solution: `utenti_attivi = ["u1", "u3"]
tutti_utenti = [
    {"id": "u1", "nome": "Anna"},
    {"id": "u2", "nome": "Bo"},
    {"id": "u3", "nome": "Cin"},
]

attivi_set = set(utenti_attivi)
for u in tutti_utenti:
    u["attivo"] = u["id"] in attivi_set

print(tutti_utenti)`
    },

    {
      type: "exercise", id: "nosql-25", kg: 25, title: "Massimale: carrello abbandonato",
      task: `<p>Su <code>carrelli</code> (documenti con lista <code>articoli</code> e <code>completato</code>): trova <code>abbandonati</code> (carrelli non completati con almeno 1 articolo), <code>valore_perso</code> (somma del valore totale — <code>prezzo * quantita</code> per ogni articolo — di tutti i carrelli abbandonati).</p>`,
      starter: `carrelli = [
    {"utente": "Anna", "completato": False, "articoli": [{"prezzo": 10, "quantita": 2}, {"prezzo": 5, "quantita": 1}]},
    {"utente": "Bo", "completato": True, "articoli": [{"prezzo": 20, "quantita": 1}]},
    {"utente": "Cin", "completato": False, "articoli": []},
    {"utente": "Dan", "completato": False, "articoli": [{"prezzo": 8, "quantita": 3}]},
]

abbandonati = [c for c in carrelli if not c["completato"] and len(c["articoli"]) > 0]

valore_perso = 0
for c in abbandonati:
    for a in c["articoli"]:
        valore_perso += a["prezzo"] * a["quantita"]

print([c["utente"] for c in abbandonati])
print(valore_perso)`,
      check: `assert [c["utente"] for c in abbandonati] == ["Anna", "Dan"]
assert valore_perso == 49`,
      hint: `<p>Cin è esclusa: non completato ma carrello vuoto (nessun articolo, niente valore da recuperare). Il valore: (10*2 + 5*1) + (8*3) = 25 + 24 = 49.</p>`,
      solution: `carrelli = [
    {"utente": "Anna", "completato": False, "articoli": [{"prezzo": 10, "quantita": 2}, {"prezzo": 5, "quantita": 1}]},
    {"utente": "Bo", "completato": True, "articoli": [{"prezzo": 20, "quantita": 1}]},
    {"utente": "Cin", "completato": False, "articoli": []},
    {"utente": "Dan", "completato": False, "articoli": [{"prezzo": 8, "quantita": 3}]},
]

abbandonati = [c for c in carrelli if not c["completato"] and len(c["articoli"]) > 0]

valore_perso = 0
for c in abbandonati:
    for a in c["articoli"]:
        valore_perso += a["prezzo"] * a["quantita"]

print([c["utente"] for c in abbandonati])
print(valore_perso)`
    },

    {
      type: "exercise", id: "nosql-26", kg: 25, title: "Massimale: feed ordinato e paginato",
      task: `<p>Su <code>post</code> (con <code>likes</code>): ordina per popolarità decrescente, poi <code>pagina_1</code> (primi 2) e <code>pagina_2</code> (successivi 2) — la "paginazione" di un feed social.</p>`,
      starter: `post = [
    {"autore": "Anna", "likes": 34},
    {"autore": "Bo", "likes": 102},
    {"autore": "Cin", "likes": 12},
    {"autore": "Dan", "likes": 88},
    {"autore": "Elio", "likes": 55},
]

ordinati = sorted(post, key=lambda p: p["likes"], reverse=True)
pagina_1 = ordinati[0:2]
pagina_2 = ordinati[2:4]

print([p["autore"] for p in pagina_1])
print([p["autore"] for p in pagina_2])`,
      check: `assert [p["autore"] for p in pagina_1] == ["Bo", "Dan"]
assert [p["autore"] for p in pagina_2] == ["Elio", "Anna"]`,
      hint: `<p>La paginazione è solo slicing su una lista già ordinata: pagina N è <code>[dimensione*(N-1) : dimensione*N]</code>.</p>`,
      solution: `post = [
    {"autore": "Anna", "likes": 34},
    {"autore": "Bo", "likes": 102},
    {"autore": "Cin", "likes": 12},
    {"autore": "Dan", "likes": 88},
    {"autore": "Elio", "likes": 55},
]

ordinati = sorted(post, key=lambda p: p["likes"], reverse=True)
pagina_1 = ordinati[0:2]
pagina_2 = ordinati[2:4]

print([p["autore"] for p in pagina_1])
print([p["autore"] for p in pagina_2])`
    },

    {
      type: "exercise", id: "nosql-27", kg: 25, title: "Massimale: unione di due collezioni con conflitti",
      task: `<p>Hai <code>locale</code> e <code>remoto</code> (stessi id utente, dati leggermente diversi). "Sincronizza": per ogni id presente in entrambi, vince il dato <code>remoto</code>; gli id presenti solo in uno dei due si tengono così come sono. Risultato in <code>sincronizzati</code> (dict id→documento).</p>`,
      starter: `locale = {"u1": {"nome": "Anna", "eta": 28}, "u2": {"nome": "Bo", "eta": 31}}
remoto = {"u1": {"nome": "Anna", "eta": 29}, "u3": {"nome": "Cin", "eta": 22}}

sincronizzati = dict(locale)
sincronizzati.update(remoto)

print(sincronizzati)`,
      check: `assert sincronizzati["u1"]["eta"] == 29, "u1 e' in entrambi: vince il dato remoto (eta 29, non 28)"
assert sincronizzati["u2"]["nome"] == "Bo", "u2 e' solo nel locale: resta invariato"
assert sincronizzati["u3"]["nome"] == "Cin", "u3 e' solo nel remoto: viene aggiunto"`,
      hint: `<p><code>dict(locale)</code> crea una copia superficiale; <code>.update(remoto)</code> sovrascrive le chiavi comuni con i valori di <code>remoto</code> e aggiunge quelle nuove.</p>`,
      solution: `locale = {"u1": {"nome": "Anna", "eta": 28}, "u2": {"nome": "Bo", "eta": 31}}
remoto = {"u1": {"nome": "Anna", "eta": 29}, "u3": {"nome": "Cin", "eta": 22}}

sincronizzati = dict(locale)
sincronizzati.update(remoto)

print(sincronizzati)`
    },

    {
      type: "exercise", id: "nosql-28", kg: 25, title: "Massimale: report multi-collezione",
      task: `<p>Hai tre collezioni: <code>utenti</code>, <code>ordini</code>, <code>recensioni</code>. Costruisci <code>report</code>: per ogni utente, un documento con <code>nome</code>, <code>n_ordini</code>, <code>n_recensioni</code> — senza JOIN espliciti, solo con indici costruiti a mano.</p>`,
      starter: `utenti = [{"id": "u1", "nome": "Anna"}, {"id": "u2", "nome": "Bo"}]
ordini = [{"utente_id": "u1"}, {"utente_id": "u1"}, {"utente_id": "u2"}]
recensioni = [{"utente_id": "u1"}]

conteggio_ordini = {}
for o in ordini:
    conteggio_ordini[o["utente_id"]] = conteggio_ordini.get(o["utente_id"], 0) + 1

conteggio_recensioni = {}
for r in recensioni:
    conteggio_recensioni[r["utente_id"]] = conteggio_recensioni.get(r["utente_id"], 0) + 1

report = []
for u in utenti:
    report.append({
        "nome": u["nome"],
        "n_ordini": conteggio_ordini.get(u["id"], 0),
        "n_recensioni": conteggio_recensioni.get(u["id"], 0),
    })

print(report)`,
      check: `assert report == [
    {"nome": "Anna", "n_ordini": 2, "n_recensioni": 1},
    {"nome": "Bo", "n_ordini": 1, "n_recensioni": 0},
]`,
      hint: `<p>Due dizionari di conteggio, costruiti separatamente, poi combinati in un terzo ciclo: è la versione "a mano" di un LEFT JOIN con GROUP BY.</p>`,
      solution: `utenti = [{"id": "u1", "nome": "Anna"}, {"id": "u2", "nome": "Bo"}]
ordini = [{"utente_id": "u1"}, {"utente_id": "u1"}, {"utente_id": "u2"}]
recensioni = [{"utente_id": "u1"}]

conteggio_ordini = {}
for o in ordini:
    conteggio_ordini[o["utente_id"]] = conteggio_ordini.get(o["utente_id"], 0) + 1

conteggio_recensioni = {}
for r in recensioni:
    conteggio_recensioni[r["utente_id"]] = conteggio_recensioni.get(r["utente_id"], 0) + 1

report = []
for u in utenti:
    report.append({
        "nome": u["nome"],
        "n_ordini": conteggio_ordini.get(u["id"], 0),
        "n_recensioni": conteggio_recensioni.get(u["id"], 0),
    })

print(report)`
    },

    {
      type: "exercise", id: "nosql-29", kg: 25, title: "Massimale: versione di un documento",
      task: `<p>Simula un mini version-control per un documento: <code>storico</code> è una lista di versioni (ogni volta che il documento cambia, se ne aggiunge una copia). Trova <code>versione_corrente</code> (l'ultima) e <code>quante_modifiche_prezzo</code> (quante volte il prezzo è effettivamente cambiato rispetto alla versione precedente).</p>`,
      starter: `storico = [
    {"v": 1, "prezzo": 100},
    {"v": 2, "prezzo": 100},
    {"v": 3, "prezzo": 90},
    {"v": 4, "prezzo": 90},
    {"v": 5, "prezzo": 85},
]

versione_corrente = storico[-1]

quante_modifiche_prezzo = 0
for i in range(1, len(storico)):
    if storico[i]["prezzo"] != storico[i-1]["prezzo"]:
        quante_modifiche_prezzo += 1

print(versione_corrente)
print(quante_modifiche_prezzo)`,
      check: `assert versione_corrente == {"v": 5, "prezzo": 85}
assert quante_modifiche_prezzo == 2`,
      hint: `<p>Confronta ogni versione con quella immediatamente precedente (<code>storico[i-1]</code>): il prezzo cambia solo 2 volte su 5 versioni (100→90, 90→85).</p>`,
      solution: `storico = [
    {"v": 1, "prezzo": 100},
    {"v": 2, "prezzo": 100},
    {"v": 3, "prezzo": 90},
    {"v": 4, "prezzo": 90},
    {"v": 5, "prezzo": 85},
]

versione_corrente = storico[-1]

quante_modifiche_prezzo = 0
for i in range(1, len(storico)):
    if storico[i]["prezzo"] != storico[i-1]["prezzo"]:
        quante_modifiche_prezzo += 1

print(versione_corrente)
print(quante_modifiche_prezzo)`
    },

    {
      type: "exercise", id: "nosql-30", kg: 25, title: "Massimale finale: motore di ricerca giocattolo",
      task: `<p>Costruisci un mini motore di ricerca full-text su <code>articoli</code> (documenti con <code>testo</code>): <code>cerca(parola)</code> restituisce i titoli degli articoli il cui testo contiene quella parola (case-insensitive). Costruisci anche <code>indice_inverso</code>: dict parola→lista di titoli che la contengono (per tutte le parole distinte di tutti gli articoli), la vera struttura dietro un motore di ricerca.</p>`,
      starter: `articoli = [
    {"titolo": "A1", "testo": "Il gatto dorme sul divano"},
    {"titolo": "A2", "testo": "Il cane gioca in giardino"},
    {"titolo": "A3", "testo": "Il gatto insegue il topo"},
]

def cerca(parola):
    parola = parola.lower()
    return [a["titolo"] for a in articoli if parola in a["testo"].lower().split()]

indice_inverso = {}
for a in articoli:
    for parola in set(a["testo"].lower().split()):
        indice_inverso.setdefault(parola, []).append(a["titolo"])

print(cerca("gatto"))
print(indice_inverso["il"])`,
      check: `assert cerca("gatto") == ["A1", "A3"]
assert cerca("cane") == ["A2"]
assert sorted(indice_inverso["il"]) == ["A1", "A2", "A3"]`,
      hint: `<p>L'<code>indice_inverso</code> è esattamente ciò che userebbe un vero motore di ricerca per rispondere a <code>cerca()</code> senza scandire ogni volta tutti gli articoli: lo costruisci una sola volta, poi lo consulti all'istante.</p>`,
      solution: `articoli = [
    {"titolo": "A1", "testo": "Il gatto dorme sul divano"},
    {"titolo": "A2", "testo": "Il cane gioca in giardino"},
    {"titolo": "A3", "testo": "Il gatto insegue il topo"},
]

def cerca(parola):
    parola = parola.lower()
    return [a["titolo"] for a in articoli if parola in a["testo"].lower().split()]

indice_inverso = {}
for a in articoli:
    for parola in set(a["testo"].lower().split()):
        indice_inverso.setdefault(parola, []).append(a["titolo"])

print(cerca("gatto"))
print(indice_inverso["il"])`
    },

    {
      type: "exercise", id: "nosql-31", kg: 5, title: "Drill: filtra il catalogo libri",
      task: `<p>Su <code>libri</code>: <code>lunghi</code> (documenti con <code>pagine &gt; 300</code>), <code>titoli_giallo</code> (titoli con <code>genere == "giallo"</code>).</p>`,
      starter: `libri = [
    {"titolo": "A", "pagine": 320, "genere": "giallo"},
    {"titolo": "B", "pagine": 150, "genere": "fantasy"},
    {"titolo": "C", "pagine": 410, "genere": "giallo"},
]

lunghi = ...
titoli_giallo = ...

print(lunghi)
print(titoli_giallo)`,
      check: `assert len(lunghi) == 2
assert titoli_giallo == ["A", "C"]`,
      hint: `<p><code>[d for d in libri if d["pagine"] &gt; 300]</code>, <code>[d["titolo"] for d in libri if d["genere"] == "giallo"]</code>.</p>`,
      solution: `libri = [
    {"titolo": "A", "pagine": 320, "genere": "giallo"},
    {"titolo": "B", "pagine": 150, "genere": "fantasy"},
    {"titolo": "C", "pagine": 410, "genere": "giallo"},
]

lunghi = [d for d in libri if d["pagine"] > 300]
titoli_giallo = [d["titolo"] for d in libri if d["genere"] == "giallo"]

print(lunghi)
print(titoli_giallo)`
    },

    {
      type: "exercise", id: "nosql-32", kg: 10, title: "Drill: pazienti nel document store",
      task: `<p>Con <code>MiniMongo</code> (già pronta): inserisci 3 pazienti, poi <code>reparto_cardio</code> (find su reparto "cardiologia"), <code>primo_neuro</code> (find_one su reparto "neurologia").</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None

db = MiniMongo()`,
      starter: `# db e' gia' pronta
db.insert_one({"id": "p1", "reparto": "cardiologia"})
db.insert_one({"id": "p2", "reparto": "neurologia"})
db.insert_one({"id": "p3", "reparto": "cardiologia"})

reparto_cardio = db.find({"reparto": "cardiologia"})
primo_neuro = db.find_one({"reparto": "neurologia"})

print(reparto_cardio)
print(primo_neuro)`,
      check: `assert len(reparto_cardio) == 2
assert primo_neuro == {"id": "p2", "reparto": "neurologia"}`,
      hint: `<p><code>db.find({"reparto": "cardiologia"})</code> trova tutte le corrispondenze; <code>find_one</code> solo la prima.</p>`,
      solution: `db.insert_one({"id": "p1", "reparto": "cardiologia"})
db.insert_one({"id": "p2", "reparto": "neurologia"})
db.insert_one({"id": "p3", "reparto": "cardiologia"})

reparto_cardio = db.find({"reparto": "cardiologia"})
primo_neuro = db.find_one({"reparto": "neurologia"})

print(reparto_cardio)
print(primo_neuro)`
    },

    {
      type: "exercise", id: "nosql-33", kg: 15, title: "Drill: spedizioni annidate",
      task: `<p>Su <code>ordini</code> (con indirizzo di spedizione annidato): <code>citta_spedizione</code> (lista delle città), <code>di_roma</code> (id degli ordini spediti a Roma).</p>`,
      starter: `ordini = [
    {"id": "o1", "spedizione": {"citta": "Roma", "cap": "00100"}},
    {"id": "o2", "spedizione": {"citta": "Milano", "cap": "20100"}},
]

citta_spedizione = ...
di_roma = ...

print(citta_spedizione)
print(di_roma)`,
      check: `assert citta_spedizione == ["Roma", "Milano"]
assert di_roma == ["o1"]`,
      hint: `<p><code>[o["spedizione"]["citta"] for o in ordini]</code>, poi filtra dove quella città è "Roma".</p>`,
      solution: `ordini = [
    {"id": "o1", "spedizione": {"citta": "Roma", "cap": "00100"}},
    {"id": "o2", "spedizione": {"citta": "Milano", "cap": "20100"}},
]

citta_spedizione = [o["spedizione"]["citta"] for o in ordini]
di_roma = [o["id"] for o in ordini if o["spedizione"]["citta"] == "Roma"]

print(citta_spedizione)
print(di_roma)`
    },

    {
      type: "exercise", id: "nosql-34", kg: 10, title: "Drill: contatore di visite pagina",
      task: `<p>Simula una cache di visualizzazioni. Parti da <code>cache</code> vuota, registra le visite in <code>views</code>, poi <code>pagina_top</code>.</p>`,
      starter: `cache = {}
views = ["p1", "p2", "p1", "p1", "p2"]

for v in views:
    cache[v] = cache.get(v, 0) + 1

pagina_top = max(cache, key=cache.get)

print(cache)
print(pagina_top)`,
      check: `assert cache == {"p1": 3, "p2": 2}
assert pagina_top == "p1"`,
      hint: `<p>Lo stesso pattern di conteggio del riscaldamento.</p>`,
      solution: `cache = {}
views = ["p1", "p2", "p1", "p1", "p2"]

for v in views:
    cache[v] = cache.get(v, 0) + 1

pagina_top = max(cache, key=cache.get)

print(cache)
print(pagina_top)`
    },

    {
      type: "exercise", id: "nosql-35", kg: 20, title: "Drill: pipeline vendite per categoria",
      task: `<p>Su <code>vendite</code>: stadio 1, <code>per_categoria</code> (dict categoria→lista importi, con <code>.setdefault</code>); stadio 2, <code>totale_per_categoria</code> (somma); <code>categoria_top</code>.</p>`,
      starter: `vendite = [
    {"categoria": "A", "importo": 100},
    {"categoria": "B", "importo": 50},
    {"categoria": "A", "importo": 80},
    {"categoria": "B", "importo": 20},
    {"categoria": "C", "importo": 30},
]

per_categoria = {}
for v in vendite:
    per_categoria.setdefault(v["categoria"], []).append(v["importo"])

totale_per_categoria = {c: sum(vals) for c, vals in per_categoria.items()}
categoria_top = max(totale_per_categoria, key=totale_per_categoria.get)

print(totale_per_categoria)
print(categoria_top)`,
      check: `assert totale_per_categoria == {"A": 180, "B": 70, "C": 30}
assert categoria_top == "A"`,
      hint: `<p>A: 100+80=180, B: 50+20=70, C: 30 — A vince.</p>`,
      solution: `vendite = [
    {"categoria": "A", "importo": 100},
    {"categoria": "B", "importo": 50},
    {"categoria": "A", "importo": 80},
    {"categoria": "B", "importo": 20},
    {"categoria": "C", "importo": 30},
]

per_categoria = {}
for v in vendite:
    per_categoria.setdefault(v["categoria"], []).append(v["importo"])

totale_per_categoria = {c: sum(vals) for c, vals in per_categoria.items()}
categoria_top = max(totale_per_categoria, key=totale_per_categoria.get)

print(totale_per_categoria)
print(categoria_top)`
    },

    {
      type: "exercise", id: "nosql-36", kg: 25, title: "Massimale: denormalizza le recensioni",
      task: `<p>Hai <code>prodotti</code> (id, nome) e <code>recensioni</code> (prodotto_id, voto). Costruisci <code>denorm</code> (documenti con nome copiato dentro), <code>media_per_prodotto</code>, <code>prodotto_top</code>.</p>`,
      starter: `prodotti = [{"id": 1, "nome": "cuffie"}, {"id": 2, "nome": "mouse"}, {"id": 3, "nome": "tastiera"}]
recensioni = [{"prodotto_id": 1, "voto": 5}, {"prodotto_id": 2, "voto": 3}, {"prodotto_id": 1, "voto": 4}, {"prodotto_id": 3, "voto": 5}]

mappa_nomi = {p["id"]: p["nome"] for p in prodotti}
denorm = [{"prodotto": mappa_nomi[r["prodotto_id"]], "voto": r["voto"]} for r in recensioni]

per_prodotto = {}
for d in denorm:
    per_prodotto.setdefault(d["prodotto"], []).append(d["voto"])

media_per_prodotto = {p: sum(v) / len(v) for p, v in per_prodotto.items()}
prodotto_top = max(media_per_prodotto, key=media_per_prodotto.get)

print(media_per_prodotto)
print(prodotto_top)`,
      check: `assert abs(media_per_prodotto["cuffie"] - 4.5) < 1e-9
assert media_per_prodotto["mouse"] == 3.0
assert prodotto_top == "tastiera"`,
      hint: `<p>cuffie: (5+4)/2=4.5, mouse: 3.0, tastiera: 5.0 (una sola recensione) — tastiera vince sulla media pura.</p>`,
      solution: `prodotti = [{"id": 1, "nome": "cuffie"}, {"id": 2, "nome": "mouse"}, {"id": 3, "nome": "tastiera"}]
recensioni = [{"prodotto_id": 1, "voto": 5}, {"prodotto_id": 2, "voto": 3}, {"prodotto_id": 1, "voto": 4}, {"prodotto_id": 3, "voto": 5}]

mappa_nomi = {p["id"]: p["nome"] for p in prodotti}
denorm = [{"prodotto": mappa_nomi[r["prodotto_id"]], "voto": r["voto"]} for r in recensioni]

per_prodotto = {}
for d in denorm:
    per_prodotto.setdefault(d["prodotto"], []).append(d["voto"])

media_per_prodotto = {p: sum(v) / len(v) for p, v in per_prodotto.items()}
prodotto_top = max(media_per_prodotto, key=media_per_prodotto.get)

print(media_per_prodotto)
print(prodotto_top)`
    },

    {
      type: "exercise", id: "nosql-37", kg: 5, title: "Drill: filtra i dipendenti",
      task: `<p>Su <code>dipendenti</code>: <code>it_dipendenti</code> (reparto "IT"), <code>nomi_alti</code> (nomi con stipendio &gt; 2700).</p>`,
      starter: `dipendenti = [
    {"nome": "A", "stipendio": 2800, "reparto": "IT"},
    {"nome": "B", "stipendio": 3200, "reparto": "HR"},
    {"nome": "C", "stipendio": 2600, "reparto": "IT"},
]

it_dipendenti = ...
nomi_alti = ...

print(it_dipendenti)
print(nomi_alti)`,
      check: `assert len(it_dipendenti) == 2
assert nomi_alti == ["A", "B"]`,
      hint: `<p><code>[d for d in dipendenti if d["reparto"] == "IT"]</code>, <code>[d["nome"] for d in dipendenti if d["stipendio"] &gt; 2700]</code>.</p>`,
      solution: `dipendenti = [
    {"nome": "A", "stipendio": 2800, "reparto": "IT"},
    {"nome": "B", "stipendio": 3200, "reparto": "HR"},
    {"nome": "C", "stipendio": 2600, "reparto": "IT"},
]

it_dipendenti = [d for d in dipendenti if d["reparto"] == "IT"]
nomi_alti = [d["nome"] for d in dipendenti if d["stipendio"] > 2700]

print(it_dipendenti)
print(nomi_alti)`
    },

    {
      type: "exercise", id: "nosql-38", kg: 10, title: "Drill: ticket di assistenza",
      task: `<p>Con <code>MiniMongo</code>: inserisci 3 ticket, poi <code>alta_priorita</code> (find su priorita "alta"), <code>primo_bassa</code> (find_one su priorita "bassa").</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None

db = MiniMongo()`,
      starter: `# db e' gia' pronta
db.insert_one({"id": "t1", "priorita": "alta"})
db.insert_one({"id": "t2", "priorita": "bassa"})
db.insert_one({"id": "t3", "priorita": "alta"})

alta_priorita = db.find({"priorita": "alta"})
primo_bassa = db.find_one({"priorita": "bassa"})

print(alta_priorita)
print(primo_bassa)`,
      check: `assert len(alta_priorita) == 2
assert primo_bassa == {"id": "t2", "priorita": "bassa"}`,
      hint: `<p>Stesso schema del find/find_one visto altrove in questa sala.</p>`,
      solution: `db.insert_one({"id": "t1", "priorita": "alta"})
db.insert_one({"id": "t2", "priorita": "bassa"})
db.insert_one({"id": "t3", "priorita": "alta"})

alta_priorita = db.find({"priorita": "alta"})
primo_bassa = db.find_one({"priorita": "bassa"})

print(alta_priorita)
print(primo_bassa)`
    },

    {
      type: "exercise", id: "nosql-39", kg: 15, title: "Drill: risolvi il ticket",
      task: `<p>Con <code>db</code> (già popolata e con <code>update_one</code>): aggiorna il ticket "t1" a stato "risolto", poi verifica in <code>t1_aggiornato</code>.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None
    def update_one(self, filtro, nuovi_valori):
        doc = self.find_one(filtro)
        if doc is not None:
            doc.update(nuovi_valori)

db = MiniMongo()
db.insert_one({"id": "t1", "stato": "aperto"})
db.insert_one({"id": "t2", "stato": "aperto"})`,
      starter: `# db e' gia' popolata
db.update_one({"id": "t1"}, {"stato": "risolto"})
t1_aggiornato = db.find_one({"id": "t1"})

print(t1_aggiornato)`,
      check: `assert t1_aggiornato == {"id": "t1", "stato": "risolto"}`,
      hint: `<p>Il primo argomento trova il documento, il secondo dice cosa cambiare.</p>`,
      solution: `db.update_one({"id": "t1"}, {"stato": "risolto"})
t1_aggiornato = db.find_one({"id": "t1"})

print(t1_aggiornato)`
    },

    {
      type: "exercise", id: "nosql-40", kg: 15, title: "Drill: rimuovi un articolo dal catalogo",
      task: `<p>Con <code>db</code> (già popolata e con <code>delete_one</code>): elimina l'articolo "i2", poi <code>n_rimasti</code>.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]
    def find_one(self, filtro=None):
        risultati = self.find(filtro)
        return risultati[0] if risultati else None
    def delete_one(self, filtro):
        doc = self.find_one(filtro)
        if doc is not None:
            self.docs.remove(doc)

db = MiniMongo()
db.insert_one({"id": "i1"})
db.insert_one({"id": "i2"})
db.insert_one({"id": "i3"})`,
      starter: `# db e' gia' popolata
db.delete_one({"id": "i2"})
n_rimasti = len(db.docs)

print(n_rimasti)`,
      check: `assert n_rimasti == 2
assert db.find_one({"id": "i2"}) is None`,
      hint: `<p>Dopo <code>delete_one</code>, cercare quel documento restituisce <code>None</code>.</p>`,
      solution: `db.delete_one({"id": "i2"})
n_rimasti = len(db.docs)

print(n_rimasti)`
    },

    {
      type: "exercise", id: "nosql-41", kg: 15, title: "Drill: impostazioni utente annidate",
      task: `<p>Su <code>utenti</code> (con impostazioni annidate): <code>temi</code> (lista), <code>con_notifiche</code> (nomi con notifiche attive).</p>`,
      starter: `utenti = [
    {"nome": "Ana", "impostazioni": {"tema": "scuro", "notifiche": True}},
    {"nome": "Bo", "impostazioni": {"tema": "chiaro", "notifiche": False}},
]

temi = ...
con_notifiche = ...

print(temi)
print(con_notifiche)`,
      check: `assert temi == ["scuro", "chiaro"]
assert con_notifiche == ["Ana"]`,
      hint: `<p><code>[u["impostazioni"]["tema"] for u in utenti]</code>, poi filtra dove <code>u["impostazioni"]["notifiche"]</code> è vero.</p>`,
      solution: `utenti = [
    {"nome": "Ana", "impostazioni": {"tema": "scuro", "notifiche": True}},
    {"nome": "Bo", "impostazioni": {"tema": "chiaro", "notifiche": False}},
]

temi = [u["impostazioni"]["tema"] for u in utenti]
con_notifiche = [u["nome"] for u in utenti if u["impostazioni"]["notifiche"]]

print(temi)
print(con_notifiche)`
    },

    {
      type: "exercise", id: "nosql-42", kg: 15, title: "Drill: contatore delle chiamate API",
      task: `<p>Registra le chiamate in <code>chiamate</code> in una <code>cache</code>, poi <code>endpoint_top</code>.</p>`,
      starter: `cache = {}
chiamate = ["get_user", "get_user", "post_order", "get_user"]

for c in chiamate:
    cache[c] = cache.get(c, 0) + 1

endpoint_top = max(cache, key=cache.get)

print(cache)
print(endpoint_top)`,
      check: `assert cache == {"get_user": 3, "post_order": 1}
assert endpoint_top == "get_user"`,
      hint: `<p>Stesso pattern del contatore di visite: incrementa con <code>.get(chiave, 0) + 1</code>.</p>`,
      solution: `cache = {}
chiamate = ["get_user", "get_user", "post_order", "get_user"]

for c in chiamate:
    cache[c] = cache.get(c, 0) + 1

endpoint_top = max(cache, key=cache.get)

print(cache)
print(endpoint_top)`
    },

    {
      type: "exercise", id: "nosql-43", kg: 15, title: "Drill: aggiungi un brano alla playlist",
      task: `<p>Su <code>playlist</code> (con lista brani): aggiungi <code>"Song3"</code>, poi <code>ha_song1</code> (booleana).</p>`,
      starter: `playlist = {"nome": "Rock Classics", "brani": ["Song1", "Song2"]}

playlist["brani"].append("Song3")
ha_song1 = "Song1" in playlist["brani"]

print(playlist)
print(ha_song1)`,
      check: `assert playlist["brani"] == ["Song1", "Song2", "Song3"]
assert ha_song1 == True`,
      hint: `<p><code>.append()</code> aggiunge in coda, <code>in</code> testa l'appartenenza.</p>`,
      solution: `playlist = {"nome": "Rock Classics", "brani": ["Song1", "Song2"]}

playlist["brani"].append("Song3")
ha_song1 = "Song1" in playlist["brani"]

print(playlist)
print(ha_song1)`
    },

    {
      type: "exercise", id: "nosql-44", kg: 20, title: "Drill: squadre per numero di membri",
      task: `<p>Su <code>squadre</code> (ognuna con lista membri): <code>ordinate</code>, per numero di membri decrescente.</p>`,
      starter: `squadre = [
    {"nome": "Alpha", "membri": ["a", "b", "c"]},
    {"nome": "Beta", "membri": ["d"]},
    {"nome": "Gamma", "membri": ["e", "f"]},
]

ordinate = sorted(squadre, key=lambda s: len(s["membri"]), reverse=True)
print([s["nome"] for s in ordinate])`,
      check: `assert [s["nome"] for s in ordinate] == ["Alpha", "Gamma", "Beta"]`,
      hint: `<p><code>key=lambda s: len(s["membri"])</code>: ordina per lunghezza della lista, non per contenuto.</p>`,
      solution: `squadre = [
    {"nome": "Alpha", "membri": ["a", "b", "c"]},
    {"nome": "Beta", "membri": ["d"]},
    {"nome": "Gamma", "membri": ["e", "f"]},
]

ordinate = sorted(squadre, key=lambda s: len(s["membri"]), reverse=True)
print([s["nome"] for s in ordinate])`
    },

    {
      type: "exercise", id: "nosql-45", kg: 20, title: "Drill: tutte le competenze distinte",
      task: `<p>Su <code>dipendenti</code> (ognuno con lista skill): <code>skill_distinte</code> (set complessivo).</p>`,
      starter: `dipendenti = [
    {"nome": "A", "skill": ["python", "sql"]},
    {"nome": "B", "skill": ["sql"]},
    {"nome": "C", "skill": ["python", "docker"]},
]

skill_distinte = set()
for d in dipendenti:
    skill_distinte.update(d["skill"])

print(skill_distinte)`,
      check: `assert skill_distinte == {"python", "sql", "docker"}`,
      hint: `<p><code>set().update(lista)</code> aggiunge tutti gli elementi senza doppioni.</p>`,
      solution: `dipendenti = [
    {"nome": "A", "skill": ["python", "sql"]},
    {"nome": "B", "skill": ["sql"]},
    {"nome": "C", "skill": ["python", "docker"]},
]

skill_distinte = set()
for d in dipendenti:
    skill_distinte.update(d["skill"])

print(skill_distinte)`
    },

    {
      type: "exercise", id: "nosql-46", kg: 20, title: "Drill: indice sui prodotti",
      task: `<p>Su <code>prodotti</code> (con <code>id</code>): costruisci <code>indice</code>, poi <code>prodotto_p2</code> senza cicli.</p>`,
      starter: `prodotti = [
    {"id": "p1", "nome": "cuffie"},
    {"id": "p2", "nome": "mouse"},
    {"id": "p3", "nome": "tastiera"},
]

indice = {p["id"]: p for p in prodotti}
prodotto_p2 = indice["p2"]

print(prodotto_p2)`,
      check: `assert prodotto_p2 == {"id": "p2", "nome": "mouse"}`,
      hint: `<p>Una volta costruito l'indice, <code>indice["p2"]</code> è un accesso diretto.</p>`,
      solution: `prodotti = [
    {"id": "p1", "nome": "cuffie"},
    {"id": "p2", "nome": "mouse"},
    {"id": "p3", "nome": "tastiera"},
]

indice = {p["id"]: p for p in prodotti}
prodotto_p2 = indice["p2"]

print(prodotto_p2)`
    },

    {
      type: "exercise", id: "nosql-47", kg: 20, title: "Combo: aggiorna lo stock tramite indice",
      task: `<p>Costruisci <code>indice</code> su <code>magazzino</code>, poi aggiorna le scorte di "m2" a 100 <strong>attraverso l'indice</strong>.</p>`,
      starter: `magazzino = [
    {"id": "m1", "nome": "vite", "scorte": 50},
    {"id": "m2", "nome": "bullone", "scorte": 20},
]

indice = {m["id"]: m for m in magazzino}
indice["m2"]["scorte"] = 100

print(magazzino)`,
      check: `assert magazzino[1]["scorte"] == 100`,
      hint: `<p>I dizionari nell'indice sono gli STESSI oggetti di <code>magazzino</code>: modificarne uno modifica anche l'altro.</p>`,
      solution: `magazzino = [
    {"id": "m1", "nome": "vite", "scorte": 50},
    {"id": "m2", "nome": "bullone", "scorte": 20},
]

indice = {m["id"]: m for m in magazzino}
indice["m2"]["scorte"] = 100

print(magazzino)`
    },

    {
      type: "exercise", id: "nosql-48", kg: 20, title: "Combo: partecipazione agli eventi",
      task: `<p>Su <code>eventi</code> (con lista partecipanti): <code>per_persona</code>, quante volte ciascuno ha partecipato.</p>`,
      starter: `eventi = [
    {"nome": "Concerto", "partecipanti": ["Ana", "Bo"]},
    {"nome": "Teatro", "partecipanti": ["Ana"]},
    {"nome": "Cinema", "partecipanti": ["Bo", "Cin"]},
]

per_persona = {}
for e in eventi:
    for p in e["partecipanti"]:
        per_persona[p] = per_persona.get(p, 0) + 1

print(per_persona)`,
      check: `assert per_persona == {"Ana": 2, "Bo": 2, "Cin": 1}`,
      hint: `<p>Due cicli annidati: uno sugli eventi, uno sui partecipanti di ciascuno.</p>`,
      solution: `eventi = [
    {"nome": "Concerto", "partecipanti": ["Ana", "Bo"]},
    {"nome": "Teatro", "partecipanti": ["Ana"]},
    {"nome": "Cinema", "partecipanti": ["Bo", "Cin"]},
]

per_persona = {}
for e in eventi:
    for p in e["partecipanti"]:
        per_persona[p] = per_persona.get(p, 0) + 1

print(per_persona)`
    },

    {
      type: "exercise", id: "nosql-49", kg: 25, title: "Combo: pipeline sulle transazioni",
      task: `<p>Su <code>transazioni</code>: stadio 1, <code>validi</code> (escludi <code>tipo == "rimborso"</code>); stadio 2, <code>totale_per_tipo</code>.</p>`,
      starter: `transazioni = [
    {"tipo": "deposito", "importo": 100},
    {"tipo": "prelievo", "importo": 30},
    {"tipo": "deposito", "importo": 50},
    {"tipo": "rimborso", "importo": 20},
    {"tipo": "deposito", "importo": 80},
]

validi = [t for t in transazioni if t["tipo"] != "rimborso"]

per_tipo = {}
for t in validi:
    per_tipo.setdefault(t["tipo"], []).append(t["importo"])

totale_per_tipo = {tipo: sum(v) for tipo, v in per_tipo.items()}

print(len(validi))
print(totale_per_tipo)`,
      check: `assert len(validi) == 4
assert totale_per_tipo == {"deposito": 230, "prelievo": 30}`,
      hint: `<p>Il rimborso esce dallo stadio 1; deposito somma 100+50+80=230.</p>`,
      solution: `transazioni = [
    {"tipo": "deposito", "importo": 100},
    {"tipo": "prelievo", "importo": 30},
    {"tipo": "deposito", "importo": 50},
    {"tipo": "rimborso", "importo": 20},
    {"tipo": "deposito", "importo": 80},
]

validi = [t for t in transazioni if t["tipo"] != "rimborso"]

per_tipo = {}
for t in validi:
    per_tipo.setdefault(t["tipo"], []).append(t["importo"])

totale_per_tipo = {tipo: sum(v) for tipo, v in per_tipo.items()}

print(len(validi))
print(totale_per_tipo)`
    },

    {
      type: "exercise", id: "nosql-50", kg: 25, title: "Combo: filtro annidato esatto vs manuale",
      task: `<p>Con <code>MiniMongo</code> di base: verifica che il filtro esatto su un campo annidato trovi solo il documento identico byte per byte, mentre un filtro manuale sul singolo campo sia più flessibile.</p>`,
      setup: `class MiniMongo:
    def __init__(self):
        self.docs = []
    def insert_one(self, doc):
        self.docs.append(dict(doc))
    def find(self, filtro=None):
        filtro = filtro or {}
        return [d for d in self.docs if all(d.get(k) == v for k, v in filtro.items())]

db = MiniMongo()`,
      starter: `# db e' gia' pronta
db.insert_one({"id": "o1", "fatturazione": {"paese": "Italia", "citta": "Roma"}})
db.insert_one({"id": "o2", "fatturazione": {"paese": "Italia", "citta": "Milano"}})

trovati_esatti = db.find({"fatturazione": {"paese": "Italia", "citta": "Roma"}})
trovati_manuali = [d for d in db.docs if d["fatturazione"]["paese"] == "Italia"]

print(trovati_esatti)
print(trovati_manuali)`,
      check: `assert len(trovati_esatti) == 1
assert len(trovati_manuali) == 2`,
      hint: `<p>Il filtro esatto richiede che l'intero sotto-dizionario combaci, cap compreso; il filtro manuale su un solo campo è più permissivo.</p>`,
      solution: `db.insert_one({"id": "o1", "fatturazione": {"paese": "Italia", "citta": "Roma"}})
db.insert_one({"id": "o2", "fatturazione": {"paese": "Italia", "citta": "Milano"}})

trovati_esatti = db.find({"fatturazione": {"paese": "Italia", "citta": "Roma"}})
trovati_manuali = [d for d in db.docs if d["fatturazione"]["paese"] == "Italia"]

print(trovati_esatti)
print(trovati_manuali)`
    },

    {
      type: "exercise", id: "nosql-51", kg: 25, title: "Combo: corso migliore, con cautela statistica",
      task: `<p>Su <code>voti</code> (corso, voto): <code>media</code> (dict), <code>n</code> (dict, quante recensioni), <code>corso_top</code>.</p>`,
      starter: `voti = [
    {"corso": "yoga", "voto": 5},
    {"corso": "pilates", "voto": 5},
    {"corso": "yoga", "voto": 3},
    {"corso": "yoga", "voto": 4},
]

per_corso = {}
for v in voti:
    per_corso.setdefault(v["corso"], []).append(v["voto"])

media = {c: sum(vv) / len(vv) for c, vv in per_corso.items()}
n = {c: len(vv) for c, vv in per_corso.items()}
corso_top = max(media, key=media.get)

print(media)
print(n)
print(corso_top)`,
      check: `assert abs(media["yoga"] - 4.0) < 1e-9
assert media["pilates"] == 5.0
assert n["pilates"] == 1
assert corso_top == "pilates"`,
      hint: `<p>"pilates" ha una media più alta ma basata su una sola recensione: <code>n</code> serve proprio a segnalare quanto fidarsi di quel numero.</p>`,
      solution: `voti = [
    {"corso": "yoga", "voto": 5},
    {"corso": "pilates", "voto": 5},
    {"corso": "yoga", "voto": 3},
    {"corso": "yoga", "voto": 4},
]

per_corso = {}
for v in voti:
    per_corso.setdefault(v["corso"], []).append(v["voto"])

media = {c: sum(vv) / len(vv) for c, vv in per_corso.items()}
n = {c: len(vv) for c, vv in per_corso.items()}
corso_top = max(media, key=media.get)

print(media)
print(n)
print(corso_top)`
    },

    {
      type: "exercise", id: "nosql-52", kg: 25, title: "Combo: marca gli utenti premium",
      task: `<p>Su <code>tutti</code> (documenti utente) e <code>utenti_premium</code> (lista id): aggiungi <code>u["premium"]</code> a ciascun documento, senza ricrearli.</p>`,
      starter: `utenti_premium = ["u2", "u4"]
tutti = [
    {"id": "u1", "nome": "A"},
    {"id": "u2", "nome": "B"},
    {"id": "u3", "nome": "C"},
    {"id": "u4", "nome": "D"},
]

premium_set = set(utenti_premium)
for u in tutti:
    u["premium"] = u["id"] in premium_set

print(tutti)`,
      check: `assert tutti[0]["premium"] == False
assert tutti[1]["premium"] == True
assert tutti[3]["premium"] == True`,
      hint: `<p>Convertire <code>utenti_premium</code> in <code>set</code> rende il controllo di appartenenza istantaneo.</p>`,
      solution: `utenti_premium = ["u2", "u4"]
tutti = [
    {"id": "u1", "nome": "A"},
    {"id": "u2", "nome": "B"},
    {"id": "u3", "nome": "C"},
    {"id": "u4", "nome": "D"},
]

premium_set = set(utenti_premium)
for u in tutti:
    u["premium"] = u["id"] in premium_set

print(tutti)`
    },

    {
      type: "exercise", id: "nosql-53", kg: 25, title: "Massimale: wishlist abbandonate",
      task: `<p>Su <code>wishlist</code> (con lista articoli e flag <code>acquistata</code>): <code>attive</code> (non acquistate, con almeno un articolo), <code>valore_totale</code> (somma prezzo × quantità di tutte le attive).</p>`,
      starter: `wishlist = [
    {"utente": "Ana", "acquistata": False, "articoli": [{"prezzo": 20, "quantita": 1}, {"prezzo": 15, "quantita": 2}]},
    {"utente": "Bo", "acquistata": True, "articoli": [{"prezzo": 30, "quantita": 1}]},
    {"utente": "Cin", "acquistata": False, "articoli": []},
    {"utente": "Dan", "acquistata": False, "articoli": [{"prezzo": 10, "quantita": 5}]},
]

attive = [w for w in wishlist if not w["acquistata"] and len(w["articoli"]) > 0]

valore_totale = 0
for w in attive:
    for a in w["articoli"]:
        valore_totale += a["prezzo"] * a["quantita"]

print([w["utente"] for w in attive])
print(valore_totale)`,
      check: `assert [w["utente"] for w in attive] == ["Ana", "Dan"]
assert valore_totale == 100`,
      hint: `<p>Cin è esclusa (wishlist vuota). Ana: 20+30=50, Dan: 50 → totale 100.</p>`,
      solution: `wishlist = [
    {"utente": "Ana", "acquistata": False, "articoli": [{"prezzo": 20, "quantita": 1}, {"prezzo": 15, "quantita": 2}]},
    {"utente": "Bo", "acquistata": True, "articoli": [{"prezzo": 30, "quantita": 1}]},
    {"utente": "Cin", "acquistata": False, "articoli": []},
    {"utente": "Dan", "acquistata": False, "articoli": [{"prezzo": 10, "quantita": 5}]},
]

attive = [w for w in wishlist if not w["acquistata"] and len(w["articoli"]) > 0]

valore_totale = 0
for w in attive:
    for a in w["articoli"]:
        valore_totale += a["prezzo"] * a["quantita"]

print([w["utente"] for w in attive])
print(valore_totale)`
    },

    {
      type: "exercise", id: "nosql-54", kg: 25, title: "Massimale: commenti paginati",
      task: `<p>Su <code>commenti</code> (con voti): ordina per popolarità decrescente, poi <code>pagina_1</code> (primi 2), <code>pagina_2</code> (successivi 2).</p>`,
      starter: `commenti = [
    {"autore": "A", "voti": 10},
    {"autore": "B", "voti": 45},
    {"autore": "C", "voti": 5},
    {"autore": "D", "voti": 30},
    {"autore": "E", "voti": 22},
]

ordinati = sorted(commenti, key=lambda c: c["voti"], reverse=True)
pagina_1 = ordinati[0:2]
pagina_2 = ordinati[2:4]

print([c["autore"] for c in pagina_1])
print([c["autore"] for c in pagina_2])`,
      check: `assert [c["autore"] for c in pagina_1] == ["B", "D"]
assert [c["autore"] for c in pagina_2] == ["E", "A"]`,
      hint: `<p>La paginazione è slicing su una lista già ordinata.</p>`,
      solution: `commenti = [
    {"autore": "A", "voti": 10},
    {"autore": "B", "voti": 45},
    {"autore": "C", "voti": 5},
    {"autore": "D", "voti": 30},
    {"autore": "E", "voti": 22},
]

ordinati = sorted(commenti, key=lambda c: c["voti"], reverse=True)
pagina_1 = ordinati[0:2]
pagina_2 = ordinati[2:4]

print([c["autore"] for c in pagina_1])
print([c["autore"] for c in pagina_2])`
    },

    {
      type: "exercise", id: "nosql-55", kg: 25, title: "Massimale: sincronizza le impostazioni",
      task: `<p>Hai <code>locale</code> e <code>remoto</code> (stessi id, dati diversi). Vince <code>remoto</code> sui conflitti; <code>sincronizzati</code>.</p>`,
      starter: `locale = {"s1": {"tema": "scuro"}, "s2": {"tema": "chiaro"}}
remoto = {"s1": {"tema": "chiaro"}, "s3": {"tema": "scuro"}}

sincronizzati = dict(locale)
sincronizzati.update(remoto)

print(sincronizzati)`,
      check: `assert sincronizzati["s1"]["tema"] == "chiaro"
assert sincronizzati["s2"]["tema"] == "chiaro"
assert sincronizzati["s3"]["tema"] == "scuro"`,
      hint: `<p><code>dict(locale)</code> copia, <code>.update(remoto)</code> sovrascrive i conflitti e aggiunge le chiavi nuove.</p>`,
      solution: `locale = {"s1": {"tema": "scuro"}, "s2": {"tema": "chiaro"}}
remoto = {"s1": {"tema": "chiaro"}, "s3": {"tema": "scuro"}}

sincronizzati = dict(locale)
sincronizzati.update(remoto)

print(sincronizzati)`
    },

    {
      type: "exercise", id: "nosql-56", kg: 25, title: "Massimale: report ticket per agente",
      task: `<p>Hai <code>agenti</code>, <code>ticket</code> (agente_id) e <code>recensioni_agente</code> (agente_id). Costruisci <code>report</code>: nome, n_ticket, n_recensioni per agente.</p>`,
      starter: `agenti = [{"id": "a1", "nome": "Ana"}, {"id": "a2", "nome": "Bo"}]
ticket = [{"agente_id": "a1"}, {"agente_id": "a1"}, {"agente_id": "a2"}]
recensioni_agente = [{"agente_id": "a1"}]

conteggio_ticket = {}
for t in ticket:
    conteggio_ticket[t["agente_id"]] = conteggio_ticket.get(t["agente_id"], 0) + 1

conteggio_recensioni = {}
for r in recensioni_agente:
    conteggio_recensioni[r["agente_id"]] = conteggio_recensioni.get(r["agente_id"], 0) + 1

report = []
for a in agenti:
    report.append({
        "nome": a["nome"],
        "n_ticket": conteggio_ticket.get(a["id"], 0),
        "n_recensioni": conteggio_recensioni.get(a["id"], 0),
    })

print(report)`,
      check: `assert report == [
    {"nome": "Ana", "n_ticket": 2, "n_recensioni": 1},
    {"nome": "Bo", "n_ticket": 1, "n_recensioni": 0},
]`,
      hint: `<p>Due dizionari di conteggio separati, poi combinati in un terzo ciclo: la versione "a mano" di un LEFT JOIN con GROUP BY.</p>`,
      solution: `agenti = [{"id": "a1", "nome": "Ana"}, {"id": "a2", "nome": "Bo"}]
ticket = [{"agente_id": "a1"}, {"agente_id": "a1"}, {"agente_id": "a2"}]
recensioni_agente = [{"agente_id": "a1"}]

conteggio_ticket = {}
for t in ticket:
    conteggio_ticket[t["agente_id"]] = conteggio_ticket.get(t["agente_id"], 0) + 1

conteggio_recensioni = {}
for r in recensioni_agente:
    conteggio_recensioni[r["agente_id"]] = conteggio_recensioni.get(r["agente_id"], 0) + 1

report = []
for a in agenti:
    report.append({
        "nome": a["nome"],
        "n_ticket": conteggio_ticket.get(a["id"], 0),
        "n_recensioni": conteggio_recensioni.get(a["id"], 0),
    })

print(report)`
    },

    {
      type: "exercise", id: "nosql-57", kg: 25, title: "Massimale: cronologia delle modifiche",
      task: `<p>Su <code>storico</code> (versioni di un documento): <code>versione_corrente</code>, <code>quante_modifiche_titolo</code> (confrontando ogni versione con la precedente).</p>`,
      starter: `storico = [
    {"v": 1, "titolo": "Bozza"},
    {"v": 2, "titolo": "Bozza"},
    {"v": 3, "titolo": "Finale"},
    {"v": 4, "titolo": "Finale v2"},
    {"v": 5, "titolo": "Finale v2"},
]

versione_corrente = storico[-1]

quante_modifiche_titolo = 0
for i in range(1, len(storico)):
    if storico[i]["titolo"] != storico[i-1]["titolo"]:
        quante_modifiche_titolo += 1

print(versione_corrente)
print(quante_modifiche_titolo)`,
      check: `assert versione_corrente == {"v": 5, "titolo": "Finale v2"}
assert quante_modifiche_titolo == 2`,
      hint: `<p>Il titolo cambia due volte su cinque versioni: Bozza→Finale, Finale→Finale v2.</p>`,
      solution: `storico = [
    {"v": 1, "titolo": "Bozza"},
    {"v": 2, "titolo": "Bozza"},
    {"v": 3, "titolo": "Finale"},
    {"v": 4, "titolo": "Finale v2"},
    {"v": 5, "titolo": "Finale v2"},
]

versione_corrente = storico[-1]

quante_modifiche_titolo = 0
for i in range(1, len(storico)):
    if storico[i]["titolo"] != storico[i-1]["titolo"]:
        quante_modifiche_titolo += 1

print(versione_corrente)
print(quante_modifiche_titolo)`
    },

    {
      type: "exercise", id: "nosql-58", kg: 25, title: "Massimale: motore di ricerca sulle FAQ",
      task: `<p>Su <code>faq</code> (documenti con testo): <code>cerca(parola)</code> (id degli articoli che la contengono), <code>indice_inverso</code> (parola→lista id).</p>`,
      starter: `faq = [
    {"id": "f1", "testo": "Come resettare la password dimenticata"},
    {"id": "f2", "testo": "Come contattare il supporto tecnico"},
    {"id": "f3", "testo": "Come cambiare la password del profilo"},
]

def cerca(parola):
    parola = parola.lower()
    return [f["id"] for f in faq if parola in f["testo"].lower().split()]

indice_inverso = {}
for f in faq:
    for parola in set(f["testo"].lower().split()):
        indice_inverso.setdefault(parola, []).append(f["id"])

print(cerca("password"))
print(cerca("supporto"))
print(sorted(indice_inverso["come"]))`,
      check: `assert cerca("password") == ["f1", "f3"]
assert cerca("supporto") == ["f2"]
assert sorted(indice_inverso["come"]) == ["f1", "f2", "f3"]`,
      hint: `<p>"come" compare in tutte e tre le FAQ: l'indice inverso lo riflette con una lista di 3 id.</p>`,
      solution: `faq = [
    {"id": "f1", "testo": "Come resettare la password dimenticata"},
    {"id": "f2", "testo": "Come contattare il supporto tecnico"},
    {"id": "f3", "testo": "Come cambiare la password del profilo"},
]

def cerca(parola):
    parola = parola.lower()
    return [f["id"] for f in faq if parola in f["testo"].lower().split()]

indice_inverso = {}
for f in faq:
    for parola in set(f["testo"].lower().split()):
        indice_inverso.setdefault(parola, []).append(f["id"])

print(cerca("password"))
print(cerca("supporto"))
print(sorted(indice_inverso["come"]))`
    },

    {
      type: "exercise", id: "nosql-59", kg: 15, title: "Drill: totale delle righe di fattura",
      task: `<p>Su <code>fattura</code> (con righe annidate): <code>totale</code> (somma prezzo × quantità di ogni riga).</p>`,
      starter: `fattura = {
    "numero": "F001",
    "righe": [{"prodotto": "A", "prezzo": 10, "quantita": 3}, {"prodotto": "B", "prezzo": 5, "quantita": 2}],
}

totale = sum(r["prezzo"] * r["quantita"] for r in fattura["righe"])
print(totale)`,
      check: `assert totale == 40`,
      hint: `<p>30 (A) + 10 (B) = 40.</p>`,
      solution: `fattura = {
    "numero": "F001",
    "righe": [{"prodotto": "A", "prezzo": 10, "quantita": 3}, {"prodotto": "B", "prezzo": 5, "quantita": 2}],
}

totale = sum(r["prezzo"] * r["quantita"] for r in fattura["righe"])
print(totale)`
    },

    {
      type: "exercise", id: "nosql-60", kg: 25, title: "Massimale finale: cruscotto del negozio",
      task: `<p>Con <code>prodotti</code> (id, nome, categoria) e <code>vendite</code> (prodotto_id, importo): costruisci <code>dashboard</code> con <code>"incasso_totale"</code> e <code>"categoria_top"</code> — senza JOIN espliciti, solo indici.</p>`,
      starter: `prodotti = [
    {"id": "p1", "nome": "cuffie", "categoria": "audio"},
    {"id": "p2", "nome": "mouse", "categoria": "periferiche"},
    {"id": "p3", "nome": "tastiera", "categoria": "periferiche"},
]
vendite = [
    {"prodotto_id": "p1", "importo": 100},
    {"prodotto_id": "p2", "importo": 50},
    {"prodotto_id": "p1", "importo": 80},
    {"prodotto_id": "p3", "importo": 30},
]

indice_prodotti = {p["id"]: p for p in prodotti}

incasso_per_prodotto = {}
for v in vendite:
    incasso_per_prodotto[v["prodotto_id"]] = incasso_per_prodotto.get(v["prodotto_id"], 0) + v["importo"]

incasso_per_categoria = {}
for pid, importo in incasso_per_prodotto.items():
    cat = indice_prodotti[pid]["categoria"]
    incasso_per_categoria[cat] = incasso_per_categoria.get(cat, 0) + importo

categoria_top = max(incasso_per_categoria, key=incasso_per_categoria.get)

dashboard = {
    "incasso_totale": sum(incasso_per_prodotto.values()),
    "categoria_top": categoria_top,
}

print(incasso_per_categoria)
print(dashboard)`,
      check: `assert dashboard == {"incasso_totale": 260, "categoria_top": "audio"}`,
      hint: `<p>audio: 180 (solo cuffie); periferiche: 50+30=80 — audio vince nonostante sia una sola categoria di prodotto.</p>`,
      solution: `prodotti = [
    {"id": "p1", "nome": "cuffie", "categoria": "audio"},
    {"id": "p2", "nome": "mouse", "categoria": "periferiche"},
    {"id": "p3", "nome": "tastiera", "categoria": "periferiche"},
]
vendite = [
    {"prodotto_id": "p1", "importo": 100},
    {"prodotto_id": "p2", "importo": 50},
    {"prodotto_id": "p1", "importo": 80},
    {"prodotto_id": "p3", "importo": 30},
]

indice_prodotti = {p["id"]: p for p in prodotti}

incasso_per_prodotto = {}
for v in vendite:
    incasso_per_prodotto[v["prodotto_id"]] = incasso_per_prodotto.get(v["prodotto_id"], 0) + v["importo"]

incasso_per_categoria = {}
for pid, importo in incasso_per_prodotto.items():
    cat = indice_prodotti[pid]["categoria"]
    incasso_per_categoria[cat] = incasso_per_categoria.get(cat, 0) + importo

categoria_top = max(incasso_per_categoria, key=incasso_per_categoria.get)

dashboard = {
    "incasso_totale": sum(incasso_per_prodotto.values()),
    "categoria_top": categoria_top,
}

print(incasso_per_categoria)
print(dashboard)`
    }
  ]
});
