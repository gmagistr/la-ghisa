window.MODULES.push({
  id: "ai-engineering",
  name: "AI Engineering",
  tagline: "La sala orchestrazione: LangChain, LangGraph, LangSmith — non chiamare un LLM, ma costruirci sopra un sistema affidabile.",
  intro: "LangChain, LangGraph e LangSmith non sono modelli: sono l'impalcatura attorno ai modelli — componi passi, gestisci stato tra più fasi, osservi cosa succede quando qualcosa va storto. Non sono installabili in questo ambiente (verificato: nessuna build compatibile), quindi qui costruisci i loro meccanismi VERI in Python puro: uno StateGraph che funziona davvero, un decoratore di tracing che registra davvero le chiamate. Il mestiere dell'AI engineer è più orchestrazione che machine learning — questa sala è quel mestiere.",
  packages: [],
  items: [

    { type: "theory", title: "Perché serve un'impalcatura sopra l'LLM", html: `
<p>Chiamare un modello linguistico con un prompt e leggere la risposta funziona per una demo. Un <strong>sistema</strong> in produzione deve invece: comporre più passi in sequenza, mantenere memoria tra i turni, decidere dinamicamente quale strumento usare, gestire errori e fallback, e — soprattutto — essere <em>osservabile</em> quando qualcosa va storto con un utente vero.</p>
<pre><code># una chiamata isolata: nessun problema, ma nessuna struttura
risposta = modello.genera(prompt)

# un sistema: passi composti, stato condiviso, tracciabilita'
chain = prompt_template | modello | output_parser
risultato = chain.invoke({"domanda": "..."})</code></pre>
<p><strong>LangChain</strong> fornisce i mattoni per comporre catene di passi; <strong>LangGraph</strong> estende l'idea a grafi con cicli e diramazioni (necessari per gli agenti, che spesso devono "ripensarci" prima di rispondere); <strong>LangSmith</strong> osserva tutto questo dall'esterno, registrando ogni passo per debug e valutazione. Sono tre livelli dello stesso problema: comporre, eseguire, osservare.</p>
`, more: `
<p>Vale la pena essere onesti su un punto: questi tre strumenti sono <strong>framework</strong>, non magia. Tutto ciò che fanno — comporre funzioni, gestire uno stato condiviso, registrare log — è esprimibile in Python puro, e infatti è esattamente quello che costruirai in questa sala. La ragione per cui esistono (e per cui vale la pena impararli, oltre ai meccanismi) è la standardizzazione: quando un intero team, o un intero ecosistema di librerie di terze parti (integrazioni con basi vettoriali, provider di modelli, strumenti di monitoraggio), condivide lo stesso vocabolario — <code>Runnable</code>, <code>invoke</code>, <code>StateGraph</code>, <code>trace</code> — il codice diventa leggibile e componibile tra progetti diversi senza reinventare ogni volta le stesse astrazioni.</p>
<p>Un'osservazione altrettanto onesta nella direzione opposta: questi framework si evolvono rapidissimamente (LangChain ha riscritto la propria API più volte in pochi anni) e aggiungono un livello di indirection che a volte nasconde più di quanto chiarisca — un errore dentro una catena di 5 astrazioni può essere molto più difficile da debuggare di uno stesso errore scritto a mano in 20 righe di Python semplice. Molti team esperti, sui progetti più critici, scelgono di orchestrare "a mano" (le stesse funzioni pure che vedrai qui) invece di appoggiarsi al framework, proprio per mantenere il controllo totale su cosa succede in ogni passo. Sapere COME funzionano questi strumenti sotto il cofano — l'obiettivo di questa sala — ti permette di scegliere consapevolmente quando usarli e quando no, invece di adottarli per abitudine.</p>
` },

    {
      type: "exercise", id: "ai-01", kg: 10, title: "La tua prima catena, a funzioni",
      task: `<p>Una "chain" è solo una sequenza di funzioni applicate in ordine. Costruisci <code>chain</code>: una lista di 3 funzioni (<code>formatta</code>, <code>modello_finto</code>, <code>estrai_maiuscolo</code>, già definite), poi scrivi <code>esegui_chain(chain, input_iniziale)</code> che applica ognuna al risultato della precedente.</p>`,
      starter: `def formatta(domanda):
    return f"Rispondi brevemente: {domanda}"

def modello_finto(prompt):
    return f"Risposta a: {prompt}"

def estrai_maiuscolo(testo):
    return testo.upper()

chain = [formatta, modello_finto, estrai_maiuscolo]

def esegui_chain(chain, input_iniziale):
    valore = input_iniziale
    for passo in chain:
        valore = passo(valore)
    return valore

risultato = esegui_chain(chain, "che ore sono?")
print(risultato)`,
      check: `assert risultato == "RISPOSTA A: RISPONDI BREVEMENTE: CHE ORE SONO?"`,
      hint: `<p>Ogni funzione riceve l'output della precedente: il ciclo <code>for</code> incatena i tre passi senza bisogno di scriverli a mano uno dentro l'altro.</p>`,
      solution: `def formatta(domanda):
    return f"Rispondi brevemente: {domanda}"

def modello_finto(prompt):
    return f"Risposta a: {prompt}"

def estrai_maiuscolo(testo):
    return testo.upper()

chain = [formatta, modello_finto, estrai_maiuscolo]

def esegui_chain(chain, input_iniziale):
    valore = input_iniziale
    for passo in chain:
        valore = passo(valore)
    return valore

risultato = esegui_chain(chain, "che ore sono?")
print(risultato)`
    },

    { type: "theory", title: "LCEL: comporre passi con l'operatore |", html: `
<p>LangChain usa l'operatore <code>|</code> (normalmente "OR" bit a bit) per comporre passi in modo leggibile — la LangChain Expression Language (LCEL): <code>chain = prompt | modello | parser</code>. È possibile perché in Python puoi <strong>ridefinire</strong> il comportamento di un operatore per una tua classe, implementando il metodo speciale <code>__or__</code>:</p>
<pre><code>class Runnable:
    def __init__(self, fn):
        self.fn = fn
    def __or__(self, altro):
        nuova_fn = lambda x: altro.fn(self.fn(x))
        return Runnable(nuova_fn)
    def invoke(self, x):
        return self.fn(x)</code></pre>
<p>Quando scrivi <code>a | b</code> con <code>a</code> e <code>b</code> istanze di <code>Runnable</code>, Python chiama automaticamente <code>a.__or__(b)</code>. Non è sintassi speciale del framework: è overloading di operatori, una funzionalità del linguaggio che LangChain sfrutta per dare un aspetto dichiarativo a normalissima composizione di funzioni.</p>
`, more: `
<p>Il meccanismo dei <strong>metodi speciali</strong> (chiamati anche "dunder methods", da "double underscore") è più generale di quanto sembri: <code>__add__</code> ridefinisce <code>+</code>, <code>__eq__</code> ridefinisce <code>==</code>, <code>__len__</code> fa funzionare <code>len(oggetto)</code>, <code>__getitem__</code> fa funzionare <code>oggetto[chiave]</code>. NumPy li usa ovunque: quando scrivi <code>array1 + array2</code>, stai chiamando <code>array1.__add__(array2)</code>, che internamente esegue la somma elemento per elemento invece della concatenazione che avviene con le liste native. È lo stesso identico meccanismo che rende leggibile <code>prompt | modello | parser</code>.</p>
<p>Un dettaglio implementativo della versione mostrata: <code>Runnable.__or__</code> restituisce un <strong>nuovo</strong> oggetto <code>Runnable</code> che avvolge una funzione composta, non modifica <code>self</code>. Questo è importante — se <code>__or__</code> mutasse l'oggetto originale, comporre lo stesso passo in due catene diverse (<code>a | b</code> e <code>a | c</code>) causerebbe interferenze impreviste tra le due catene, perché entrambe condividerebbero lo stesso oggetto <code>a</code> modificato. Restituire un oggetto nuovo ad ogni composizione (lo stesso principio dell'immutabilità che rende sicuro il codice funzionale) evita completamente la categoria di bug "una catena ne rovina un'altra senza che sia ovvio perché".</p>
` },

    {
      type: "exercise", id: "ai-02", kg: 20, title: "Implementa il tuo operatore pipe",
      task: `<p>Completa la classe <code>Runnable</code> (con <code>__or__</code> e <code>invoke</code>), poi componi 3 passi con <code>|</code> e chiama <code>.invoke()</code>.</p>`,
      starter: `class Runnable:
    def __init__(self, fn):
        self.fn = fn

    def __or__(self, altro):
        nuova_fn = lambda x: altro.fn(self.fn(x))
        return Runnable(nuova_fn)

    def invoke(self, x):
        return self.fn(x)

raddoppia = Runnable(lambda x: x * 2)
incrementa = Runnable(lambda x: x + 1)
a_stringa = Runnable(lambda x: f"risultato: {x}")

catena = raddoppia | incrementa | a_stringa
output = catena.invoke(10)

print(output)`,
      check: `assert output == "risultato: 21"`,
      hint: `<p>10 raddoppiato fa 20, +1 fa 21, poi la stringa lo avvolge: <code>"risultato: 21"</code>. La composizione con due <code>|</code> di fila funziona perché ogni <code>__or__</code> restituisce un nuovo <code>Runnable</code>, pronto per essere combinato ancora.</p>`,
      solution: `class Runnable:
    def __init__(self, fn):
        self.fn = fn

    def __or__(self, altro):
        nuova_fn = lambda x: altro.fn(self.fn(x))
        return Runnable(nuova_fn)

    def invoke(self, x):
        return self.fn(x)

raddoppia = Runnable(lambda x: x * 2)
incrementa = Runnable(lambda x: x + 1)
a_stringa = Runnable(lambda x: f"risultato: {x}")

catena = raddoppia | incrementa | a_stringa
output = catena.invoke(10)

print(output)`
    },

    { type: "theory", title: "Chat prompt template: più messaggi, un template", html: `
<p>Un <strong>ChatPromptTemplate</strong> costruisce l'intera lista di messaggi (system/user/assistant, come visto nella sala LLM Toolkit) da un template con segnaposto, invece di scriverla a mano ogni volta:</p>
<pre><code>class ChatPromptTemplate:
    def __init__(self, messaggi_template):
        self.messaggi_template = messaggi_template  # lista di (ruolo, template_stringa)

    def format(self, **variabili):
        return [
            {"role": ruolo, "content": template.format(**variabili)}
            for ruolo, template in self.messaggi_template
        ]</code></pre>
<p>Il vantaggio è lo stesso di ogni template: separare la <em>struttura</em> della conversazione (quanti messaggi, che ruoli) dai <em>dati</em> che la riempiono, così puoi riusare lo stesso template con migliaia di input diversi.</p>
` },

    {
      type: "exercise", id: "ai-03", kg: 20, title: "Costruisci un ChatPromptTemplate",
      task: `<p>Implementa <code>ChatPromptTemplate</code> (già abbozzata) e usala per creare un template a 2 messaggi (system fisso + user con segnaposto), poi formattalo con una domanda vera.</p>`,
      starter: `class ChatPromptTemplate:
    def __init__(self, messaggi_template):
        self.messaggi_template = messaggi_template

    def format(self, **variabili):
        return [
            {"role": ruolo, "content": template.format(**variabili)}
            for ruolo, template in self.messaggi_template
        ]

template = ChatPromptTemplate([
    ("system", "Sei un assistente che risponde in una sola frase."),
    ("user", "Domanda: {domanda}"),
])

messaggi = template.format(domanda="Cos'e' una chain?")
print(messaggi)`,
      check: `assert messaggi == [
    {"role": "system", "content": "Sei un assistente che risponde in una sola frase."},
    {"role": "user", "content": "Domanda: Cos'e' una chain?"},
]`,
      hint: `<p>Il messaggio <code>system</code> non ha segnaposto, quindi <code>.format(**variabili)</code> lo lascia invariato; solo il messaggio <code>user</code> viene effettivamente riempito.</p>`,
      solution: `class ChatPromptTemplate:
    def __init__(self, messaggi_template):
        self.messaggi_template = messaggi_template

    def format(self, **variabili):
        return [
            {"role": ruolo, "content": template.format(**variabili)}
            for ruolo, template in self.messaggi_template
        ]

template = ChatPromptTemplate([
    ("system", "Sei un assistente che risponde in una sola frase."),
    ("user", "Domanda: {domanda}"),
])

messaggi = template.format(domanda="Cos'e' una chain?")
print(messaggi)`
    },

    { type: "theory", title: "Output parser: dal testo libero a dati strutturati", html: `
<p>Un modello risponde con testo; il tuo programma spesso vuole dati strutturati (una lista, un numero, un dizionario). Un <strong>output parser</strong> fa da ponte:</p>
<pre><code>def parser_lista(testo):
    return [elemento.strip() for elemento in testo.split(",")]

parser_lista("mela, pane, latte")   # ["mela", "pane", "latte"]</code></pre>
<p>Nei framework veri, i parser gestiscono anche i casi limite (spazi extra, virgole finali, formati leggermente diversi da quello atteso) e sollevano errori chiari quando il testo non è analizzabile — esattamente come il parsing JSON visto nella sala LLM Toolkit, di cui questo è un caso più generale.</p>
` },

    {
      type: "exercise", id: "ai-04", kg: 15, title: "Il parser a lista separata da virgole",
      task: `<p>Scrivi <code>parser_lista(testo)</code>: spezza sulla virgola e rimuove spazi bianchi attorno a ogni elemento. Applicalo a una risposta "sporca" del modello.</p>`,
      starter: `def parser_lista(testo):
    return [elemento.strip() for elemento in testo.split(",")]

risposta_modello = "python,  sql ,docker,  numpy"
lista = parser_lista(risposta_modello)

print(lista)`,
      check: `assert lista == ["python", "sql", "docker", "numpy"]`,
      hint: `<p><code>.strip()</code> rimuove gli spazi bianchi (anche irregolari, come <code>"  sql "</code>) da inizio e fine di ogni pezzo.</p>`,
      solution: `def parser_lista(testo):
    return [elemento.strip() for elemento in testo.split(",")]

risposta_modello = "python,  sql ,docker,  numpy"
lista = parser_lista(risposta_modello)

print(lista)`
    },

    { type: "theory", title: "Memoria conversazionale come oggetto", html: `
<p>Una <strong>memoria</strong> conversazionale incapsula la cronologia di una chat dietro un'interfaccia semplice, invece di passare liste di messaggi a mano ovunque:</p>
<pre><code>class ConversationMemory:
    def __init__(self):
        self.messaggi = []
    def aggiungi_utente(self, testo):
        self.messaggi.append({"role": "user", "content": testo})
    def aggiungi_assistente(self, testo):
        self.messaggi.append({"role": "assistant", "content": testo})
    def storico(self):
        return self.messaggi</code></pre>
<p>Nei framework veri, la memoria può anche riassumere automaticamente i turni vecchi quando la conversazione cresce troppo (per non sforare la finestra di contesto, vista nella sala LLM Toolkit) — un dettaglio implementativo in più sopra la stessa idea di base.</p>
` },

    {
      type: "exercise", id: "ai-05", kg: 15, title: "Costruisci la memoria di una chat",
      task: `<p>Implementa <code>ConversationMemory</code> e usala per registrare uno scambio di 2 turni (utente, assistente, utente, assistente).</p>`,
      starter: `class ConversationMemory:
    def __init__(self):
        self.messaggi = []

    def aggiungi_utente(self, testo):
        self.messaggi.append({"role": "user", "content": testo})

    def aggiungi_assistente(self, testo):
        self.messaggi.append({"role": "assistant", "content": testo})

    def storico(self):
        return self.messaggi

mem = ConversationMemory()
mem.aggiungi_utente("Ciao")
mem.aggiungi_assistente("Ciao, come posso aiutarti?")
mem.aggiungi_utente("Cos'e' Python?")
mem.aggiungi_assistente("Un linguaggio di programmazione.")

n_turni = len(mem.storico())
print(mem.storico())
print(n_turni)`,
      check: `assert n_turni == 4
assert mem.storico()[0]["role"] == "user"
assert mem.storico()[-1]["content"] == "Un linguaggio di programmazione."`,
      hint: `<p>4 chiamate, 4 messaggi in ordine: la memoria è semplicemente una lista che cresce ad ogni turno.</p>`,
      solution: `class ConversationMemory:
    def __init__(self):
        self.messaggi = []

    def aggiungi_utente(self, testo):
        self.messaggi.append({"role": "user", "content": testo})

    def aggiungi_assistente(self, testo):
        self.messaggi.append({"role": "assistant", "content": testo})

    def storico(self):
        return self.messaggi

mem = ConversationMemory()
mem.aggiungi_utente("Ciao")
mem.aggiungi_assistente("Ciao, come posso aiutarti?")
mem.aggiungi_utente("Cos'e' Python?")
mem.aggiungi_assistente("Un linguaggio di programmazione.")

n_turni = len(mem.storico())
print(mem.storico())
print(n_turni)`
    },

    { type: "theory", title: "Il ciclo ReAct: pensa, agisci, osserva", html: `
<p>Un <strong>agente</strong> non risponde subito: alterna passi di <em>ragionamento</em> (Thought), <em>azione</em> (Action — di solito chiamare uno strumento) e <em>osservazione</em> (Observation — il risultato dello strumento), ripetendo finché non ha abbastanza informazioni per rispondere. È il pattern <strong>ReAct</strong> (Reasoning + Acting), il cuore di ogni <code>AgentExecutor</code>:</p>
<pre><code>Thought: mi serve la temperatura di Roma
Action: get_meteo("Roma")
Observation: soleggiato, 28 gradi
Thought: ora posso rispondere
Final Answer: a Roma ci sono 28 gradi, soleggiato</code></pre>
<p>Il "ragionamento" qui non è magia: è il modello che genera testo nel formato Thought/Action, il tuo codice che intercetta la riga <code>Action</code>, esegue davvero la funzione, e reinserisce il risultato come <code>Observation</code> nel prossimo giro. È un ciclo, non una singola chiamata — esattamente come il function calling della sala LLM Toolkit, ma ripetuto più volte con memoria dei passi precedenti.</p>
`, more: `
<p>Un dettaglio spesso sottovalutato: il ciclo ReAct deve avere un <strong>limite massimo di iterazioni</strong> (di solito chiamato <code>max_iterations</code> nei framework). Senza un tetto, un agente che continua a "pensare di aver bisogno di più informazioni" senza mai arrivare a una risposta finale gira all'infinito, consumando chiamate al modello (e soldi) senza produrre nulla — un bug di produzione reale e frequentissimo nei primi prototipi di agenti. La difesa standard è un contatore: se si supera il limite, l'agente restituisce comunque una risposta parziale con un messaggio esplicito ("non sono riuscito a completare il compito in tempo") invece di continuare indefinitamente.</p>
<p>Un secondo dettaglio pratico: il formato testuale <code>Thought:/Action:/Observation:</code> è fragile — se il modello scrive una riga leggermente diversa dal formato atteso (un'indentazione in più, un due punti mancante), il parser che intercetta l'<code>Action</code> può fallire silenziosamente. Per questo i framework più moderni preferiscono, quando il provider del modello lo supporta, il <em>function calling nativo</em> (visto nella sala LLM Toolkit) — l'API restituisce direttamente una struttura dati (nome funzione + argomenti in JSON) invece di testo libero da interpretare, eliminando un'intera classe di bug di parsing.</p>
` },

    {
      type: "exercise", id: "ai-06", kg: 25, title: "Simula un ciclo ReAct",
      task: `<p>Con gli strumenti disponibili e una lista di passi di ragionamento già decisi dal modello (simulati), esegui il ciclo: per ogni <code>(pensiero, azione, argomento)</code> in <code>piano</code>, se <code>azione</code> non è <code>"rispondi"</code> esegui lo strumento e stampa l'osservazione; altrimenti quello è il finale.</p>`,
      starter: `strumenti = {
    "meteo": lambda citta: f"{citta}: soleggiato, 28 gradi",
}

piano = [
    ("mi serve il meteo di Roma", "meteo", "Roma"),
    ("ora ho l'informazione", "rispondi", "A Roma ci sono 28 gradi, soleggiato."),
]

osservazioni = []
risposta_finale = None

for pensiero, azione, argomento in piano:
    if azione == "rispondi":
        risposta_finale = argomento
    else:
        risultato = strumenti[azione](argomento)
        osservazioni.append(risultato)

print(osservazioni)
print(risposta_finale)`,
      check: `assert osservazioni == ["Roma: soleggiato, 28 gradi"]
assert risposta_finale == "A Roma ci sono 28 gradi, soleggiato."`,
      hint: `<p>Il ciclo <code>for</code> scorre il "piano" (che qui simula le decisioni del modello) passo per passo: azioni normali eseguono uno strumento, l'azione speciale <code>"rispondi"</code> chiude il ciclo con la risposta finale.</p>`,
      solution: `strumenti = {
    "meteo": lambda citta: f"{citta}: soleggiato, 28 gradi",
}

piano = [
    ("mi serve il meteo di Roma", "meteo", "Roma"),
    ("ora ho l'informazione", "rispondi", "A Roma ci sono 28 gradi, soleggiato."),
]

osservazioni = []
risposta_finale = None

for pensiero, azione, argomento in piano:
    if azione == "rispondi":
        risposta_finale = argomento
    else:
        risultato = strumenti[azione](argomento)
        osservazioni.append(risultato)

print(osservazioni)
print(risposta_finale)`
    },

    { type: "theory", title: "LangGraph: il workflow come grafo di stati", html: `
<p>Una catena lineare (LCEL) va bene finché i passi sono sempre gli stessi, nello stesso ordine. Un agente reale spesso deve <strong>tornare indietro</strong>, <strong>saltare passi</strong>, o <strong>ripetere</strong> finché una condizione non è soddisfatta — serve un <strong>grafo</strong>, non una linea. <strong>LangGraph</strong> modella il workflow come nodi (funzioni che trasformano uno stato condiviso) collegati da archi (che dicono quale nodo eseguire dopo):</p>
<pre><code>class StateGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry = None
    def add_node(self, name, fn):
        self.nodes[name] = fn
    def set_entry_point(self, name):
        self.entry = name
    def add_edge(self, frm, to):
        self.edges[frm] = to
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            current = self.edges[current]
        return state</code></pre>
<p>Ogni nodo è una funzione pura <code>state -&gt; nuovo_state</code>: riceve il dizionario di stato condiviso, lo modifica (o ne crea uno nuovo), lo restituisce. Il grafo si limita a decidere l'ORDINE in cui i nodi vengono chiamati — la logica vera vive tutta nelle funzioni dei nodi, normalissimo Python.</p>
` },

    {
      type: "exercise", id: "ai-07", kg: 25, title: "Il tuo primo StateGraph",
      task: `<p>Implementa <code>StateGraph</code> (con <code>add_node</code>, <code>set_entry_point</code>, <code>add_edge</code>, <code>invoke</code>) e costruisci un grafo lineare a 2 nodi: <code>saluta</code> (aggiunge un messaggio) poi <code>firma</code> (aggiunge una firma), poi <code>"END"</code>.</p>`,
      starter: `class StateGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry = None

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def set_entry_point(self, name):
        self.entry = name

    def add_edge(self, frm, to):
        self.edges[frm] = to

    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            current = self.edges[current]
        return state

def nodo_saluta(state):
    state["testo"] = "Ciao!"
    return state

def nodo_firma(state):
    state["testo"] += " — Il tuo assistente"
    return state

g = StateGraph()
g.add_node("saluta", nodo_saluta)
g.add_node("firma", nodo_firma)
g.set_entry_point("saluta")
g.add_edge("saluta", "firma")
g.add_edge("firma", "END")

risultato = g.invoke({})
print(risultato)`,
      check: `assert risultato == {"testo": "Ciao! — Il tuo assistente"}`,
      hint: `<p>Il ciclo <code>while</code> in <code>invoke</code> segue gli archi finché non arriva a <code>"END"</code>: con due nodi collegati in fila, esegue prima <code>saluta</code>, poi <code>firma</code>.</p>`,
      solution: `class StateGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry = None

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def set_entry_point(self, name):
        self.entry = name

    def add_edge(self, frm, to):
        self.edges[frm] = to

    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            current = self.edges[current]
        return state

def nodo_saluta(state):
    state["testo"] = "Ciao!"
    return state

def nodo_firma(state):
    state["testo"] += " — Il tuo assistente"
    return state

g = StateGraph()
g.add_node("saluta", nodo_saluta)
g.add_node("firma", nodo_firma)
g.set_entry_point("saluta")
g.add_edge("saluta", "firma")
g.add_edge("firma", "END")

risultato = g.invoke({})
print(risultato)`
    },

    { type: "theory", title: "Archi condizionali: instradare in base allo stato", html: `
<p>Un arco normale (<code>add_edge</code>) va sempre allo stesso nodo successivo. Un <strong>arco condizionale</strong> invece chiama una funzione "router" che guarda lo stato attuale e decide dinamicamente quale nodo eseguire dopo — è il modo in cui LangGraph esprime cicli e diramazioni:</p>
<pre><code>def router(state):
    if state["numero"] < 3:
        return "conta"    # torna indietro: e' un CICLO
    return "END"           # condizione soddisfatta: esci

g.add_conditional_edges("conta", router)</code></pre>
<p>Con un router che a volte restituisce il nome del nodo CORRENTE, si ottiene un ciclo: il nodo si richiama finché la condizione non cambia — esattamente come un <code>while</code>, ma espresso come grafo. È il meccanismo con cui un agente "ripensa" più volte prima di rispondere.</p>
` },

    {
      type: "exercise", id: "ai-08", kg: 25, title: "Costruisci un ciclo con arco condizionale",
      task: `<p>Estendi <code>StateGraph</code> con <code>add_conditional_edges(frm, router)</code> (il router riceve lo stato e restituisce il nome del prossimo nodo, o <code>"END"</code>). Costruisci un grafo con un solo nodo <code>conta</code> che si ripete finché <code>numero &lt; 3</code>.</p>`,
      starter: `class StateGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry = None

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def set_entry_point(self, name):
        self.entry = name

    def add_edge(self, frm, to):
        self.edges[frm] = to

    def add_conditional_edges(self, frm, router):
        self.edges[frm] = router

    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

def nodo_conta(state):
    state["numero"] = state.get("numero", 0) + 1
    return state

def router(state):
    return "conta" if state["numero"] < 3 else "END"

g = StateGraph()
g.add_node("conta", nodo_conta)
g.set_entry_point("conta")
g.add_conditional_edges("conta", router)

risultato = g.invoke({})
print(risultato)`,
      check: `assert risultato == {"numero": 3}`,
      hint: `<p>Il nodo <code>conta</code> viene eseguito 3 volte (numero passa da 0 a 1, poi a 2, poi a 3): solo quando <code>numero</code> raggiunge 3, il router smette di rimandare al nodo stesso e restituisce <code>"END"</code>.</p>`,
      solution: `class StateGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry = None

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def set_entry_point(self, name):
        self.entry = name

    def add_edge(self, frm, to):
        self.edges[frm] = to

    def add_conditional_edges(self, frm, router):
        self.edges[frm] = router

    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

def nodo_conta(state):
    state["numero"] = state.get("numero", 0) + 1
    return state

def router(state):
    return "conta" if state["numero"] < 3 else "END"

g = StateGraph()
g.add_node("conta", nodo_conta)
g.set_entry_point("conta")
g.add_conditional_edges("conta", router)

risultato = g.invoke({})
print(risultato)`
    },

    { type: "theory", title: "Il pattern supervisore: un router tra specialisti", html: `
<p>Un problema comune nei sistemi multi-agente: invece di un solo agente generalista, si usano più agenti <strong>specializzati</strong> (uno per la ricerca, uno per la scrittura, uno per il codice) e un nodo <strong>supervisore</strong> che decide, guardando lo stato, a chi passare il turno:</p>
<pre><code>def supervisore(state):
    if "cerca" in state["compito"]:
        return "ricercatore"
    if "scrivi" in state["compito"]:
        return "scrittore"
    return "END"</code></pre>
<p>È lo stesso identico pattern del router di instradamento ticket visto nella sala LLM Toolkit, applicato però a un GRAFO invece che a una singola classificazione: qui il supervisore può richiamare più specialisti in sequenza, aggiornando lo stato condiviso ad ogni passaggio, finché il compito non è completo.</p>
` },

    {
      type: "exercise", id: "ai-09", kg: 25, title: "Un supervisore che instrada a due specialisti",
      task: `<p>Costruisci un grafo con nodo di ingresso <code>supervisore</code> che instrada a <code>ricercatore</code> o <code>scrittore</code> in base a <code>state["compito"]</code>, ed entrambi tornano al supervisore finché non c'è più lavoro da fare (usa un flag <code>state["fatto"]</code>).</p>`,
      starter: `def nodo_supervisore(state):
    return state  # il supervisore non modifica lo stato, solo instrada

def router_supervisore(state):
    if state.get("fatto"):
        return "END"
    if "cerca" in state["compito"]:
        return "ricercatore"
    return "scrittore"

def nodo_ricercatore(state):
    state["risultati"] = f"dati trovati su: {state['compito']}"
    state["fatto"] = True
    return state

def nodo_scrittore(state):
    state["risultati"] = f"testo scritto su: {state['compito']}"
    state["fatto"] = True
    return state

class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def add_edge(self, frm, to): self.edges[frm] = to
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

g = StateGraph()
g.add_node("supervisore", nodo_supervisore)
g.add_node("ricercatore", nodo_ricercatore)
g.add_node("scrittore", nodo_scrittore)
g.set_entry_point("supervisore")
g.add_conditional_edges("supervisore", router_supervisore)
g.add_edge("ricercatore", "supervisore")
g.add_edge("scrittore", "supervisore")

risultato = g.invoke({"compito": "cerca notizie sul clima"})
print(risultato)`,
      check: `assert risultato["risultati"] == "dati trovati su: cerca notizie sul clima"
assert risultato["fatto"] == True`,
      hint: `<p>Il compito contiene "cerca", quindi il supervisore instrada al ricercatore; il ricercatore fa il suo lavoro, marca <code>fatto=True</code>, e torna al supervisore, che questa volta trova <code>fatto</code> vero e chiude con <code>"END"</code>.</p>`,
      solution: `def nodo_supervisore(state):
    return state

def router_supervisore(state):
    if state.get("fatto"):
        return "END"
    if "cerca" in state["compito"]:
        return "ricercatore"
    return "scrittore"

def nodo_ricercatore(state):
    state["risultati"] = f"dati trovati su: {state['compito']}"
    state["fatto"] = True
    return state

def nodo_scrittore(state):
    state["risultati"] = f"testo scritto su: {state['compito']}"
    state["fatto"] = True
    return state

class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def add_edge(self, frm, to): self.edges[frm] = to
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

g = StateGraph()
g.add_node("supervisore", nodo_supervisore)
g.add_node("ricercatore", nodo_ricercatore)
g.add_node("scrittore", nodo_scrittore)
g.set_entry_point("supervisore")
g.add_conditional_edges("supervisore", router_supervisore)
g.add_edge("ricercatore", "supervisore")
g.add_edge("scrittore", "supervisore")

risultato = g.invoke({"compito": "cerca notizie sul clima"})
print(risultato)`
    },

    { type: "theory", title: "LangSmith: osservare cosa fa davvero il sistema", html: `
<p>Quando una chain o un agente sbaglia in produzione, "non funziona" non basta per fare debug: serve sapere ESATTAMENTE quali passi sono stati eseguiti, con quali input, quali output, quanto tempo hanno impiegato. <strong>LangSmith</strong> registra tutto questo automaticamente; il meccanismo di base è un <strong>decoratore</strong> che avvolge ogni funzione tracciata:</p>
<pre><code>import time

log_tracce = []

def trace(fn):
    def wrapper(*args, **kwargs):
        inizio = time.time()
        risultato = fn(*args, **kwargs)
        durata = time.time() - inizio
        log_tracce.append({"funzione": fn.__name__, "input": args, "output": risultato, "durata": durata})
        return risultato
    return wrapper

@trace
def chiamata_llm(prompt):
    return f"risposta a {prompt}"</code></pre>
<p>Con <code>@trace</code> sopra una funzione, ogni chiamata viene registrata automaticamente in <code>log_tracce</code> — nessuna modifica al corpo della funzione stessa. È un altro esempio del principio "non serve un framework per il meccanismo, serve per lo standard condiviso": un decoratore di 8 righe fa il lavoro di base di un intero prodotto di osservabilità.</p>
`, more: `
<p>I <strong>decoratori</strong> sono uno dei pattern più potenti (e più incompresi) di Python: una funzione che prende un'altra funzione e ne restituisce una versione "avvolta" con comportamento aggiuntivo, senza toccare il codice originale. La sintassi <code>@trace</code> sopra <code>def chiamata_llm(...)</code> è zucchero sintattico per <code>chiamata_llm = trace(chiamata_llm)</code> — letteralmente riassegna il nome alla versione avvolta. Questo è il motivo per cui, dopo la decorazione, ogni chiamata a <code>chiamata_llm(...)</code> passa automaticamente attraverso <code>wrapper</code>, che fa il suo lavoro di logging e poi delega alla funzione originale tramite <code>fn(*args, **kwargs)</code>.</p>
<p>In un sistema di tracing reale, ogni "traccia" (trace) è tipicamente organizzata gerarchicamente: una chiamata di alto livello (es. "rispondi alla domanda dell'utente") contiene al suo interno più "span" (le sotto-chiamate: recupero documenti, chiamata al modello, parsing dell'output), ciascuno con il proprio tempo di inizio/fine. Questo permette di rispondere a domande come "quale dei 4 passi della mia chain sta impiegando l'80% del tempo totale?" — un'informazione che una singola misura di durata complessiva non potrebbe mai dare. Il decoratore che hai appena scritto è la versione più semplice possibile di questa idea: uno "span" piatto, senza gerarchia, ma con lo stesso identico scopo.</p>
` },

    {
      type: "exercise", id: "ai-10", kg: 20, title: "Costruisci il tuo decoratore di tracing",
      task: `<p>Implementa <code>trace</code> (senza misurare il tempo per semplicità, solo input/output) e applicalo a due funzioni finte di un sistema. Verifica che <code>log_tracce</code> registri entrambe le chiamate.</p>`,
      starter: `log_tracce = []

def trace(fn):
    def wrapper(*args, **kwargs):
        risultato = fn(*args, **kwargs)
        log_tracce.append({"funzione": fn.__name__, "input": args, "output": risultato})
        return risultato
    return wrapper

@trace
def recupera_documenti(query):
    return [f"doc su {query}"]

@trace
def genera_risposta(contesto):
    return f"risposta basata su {contesto}"

docs = recupera_documenti("python")
risposta = genera_risposta(docs)

print(log_tracce)
print(len(log_tracce))`,
      check: `assert len(log_tracce) == 2
assert log_tracce[0]["funzione"] == "recupera_documenti"
assert log_tracce[1]["funzione"] == "genera_risposta"`,
      hint: `<p>Ogni funzione decorata con <code>@trace</code> aggiunge automaticamente una voce a <code>log_tracce</code> quando viene chiamata: non serve scrivere nulla di esplicito dentro <code>recupera_documenti</code> o <code>genera_risposta</code>.</p>`,
      solution: `log_tracce = []

def trace(fn):
    def wrapper(*args, **kwargs):
        risultato = fn(*args, **kwargs)
        log_tracce.append({"funzione": fn.__name__, "input": args, "output": risultato})
        return risultato
    return wrapper

@trace
def recupera_documenti(query):
    return [f"doc su {query}"]

@trace
def genera_risposta(contesto):
    return f"risposta basata su {contesto}"

docs = recupera_documenti("python")
risposta = genera_risposta(docs)

print(log_tracce)
print(len(log_tracce))`
    },

    {
      type: "exercise", id: "ai-11", kg: 20, title: "Misura la durata di ogni passo",
      task: `<p>Estendi il decoratore per misurare la durata con <code>time.perf_counter()</code>, poi trova <code>passo_piu_lento</code>: il nome della funzione tracciata con durata maggiore.</p>`,
      starter: `import time

log_tracce = []

def trace(fn):
    def wrapper(*args, **kwargs):
        inizio = time.perf_counter()
        risultato = fn(*args, **kwargs)
        durata = time.perf_counter() - inizio
        log_tracce.append({"funzione": fn.__name__, "durata": durata})
        return risultato
    return wrapper

@trace
def passo_veloce():
    return sum(range(100))

@trace
def passo_lento():
    return sum(range(1000000))

passo_veloce()
passo_lento()

passo_piu_lento = max(log_tracce, key=lambda t: t["durata"])["funzione"]
print(log_tracce)
print(passo_piu_lento)`,
      check: `assert passo_piu_lento == "passo_lento"`,
      hint: `<p><code>time.perf_counter()</code> è il cronometro ad alta precisione consigliato per misurare durate brevi in Python; sommare un milione di numeri richiede oggettivamente più tempo che sommarne 100.</p>`,
      solution: `import time

log_tracce = []

def trace(fn):
    def wrapper(*args, **kwargs):
        inizio = time.perf_counter()
        risultato = fn(*args, **kwargs)
        durata = time.perf_counter() - inizio
        log_tracce.append({"funzione": fn.__name__, "durata": durata})
        return risultato
    return wrapper

@trace
def passo_veloce():
    return sum(range(100))

@trace
def passo_lento():
    return sum(range(1000000))

passo_veloce()
passo_lento()

passo_piu_lento = max(log_tracce, key=lambda t: t["durata"])["funzione"]
print(log_tracce)
print(passo_piu_lento)`
    },

    { type: "theory", title: "Valutare una chain: dataset + scoring", html: `
<p>Come sai se una nuova versione di un prompt è davvero migliore della precedente? Servono un <strong>dataset di test</strong> (input con risposta attesa) e una <strong>funzione di scoring</strong> che confronta l'output reale con quello atteso — lo stesso principio delle metriche di scikit-learn, applicato a una chain intera invece che a un modello:</p>
<pre><code>dataset = [
    {"input": "2+2", "atteso": "4"},
    {"input": "3+3", "atteso": "6"},
]

def valuta(chain_fn, dataset):
    corretti = sum(1 for caso in dataset if chain_fn(caso["input"]) == caso["atteso"])
    return corretti / len(dataset)</code></pre>
<p>Con questo strumento puoi confrontare oggettivamente due versioni di un prompt (o due modelli, o due strategie di retrieval) sullo stesso dataset, invece di giudicare "a occhio" leggendo qualche esempio — lo stesso salto di rigore che il train/test split ha portato al machine learning classico.</p>
` },

    {
      type: "exercise", id: "ai-12", kg: 20, title: "Valuta due versioni di una chain",
      task: `<p>Con <code>dataset</code> (5 casi) e due funzioni chain (<code>chain_v1</code>, <code>chain_v2</code>): calcola <code>valuta(chain_fn, dataset)</code> per entrambe e trova <code>migliore</code>.</p>`,
      starter: `dataset = [
    {"input": "ciao", "atteso": "CIAO"},
    {"input": "python", "atteso": "PYTHON"},
    {"input": "test", "atteso": "TEST"},
    {"input": "chain", "atteso": "CHAIN"},
    {"input": "agente", "atteso": "AGENTE"},
]

def chain_v1(testo):
    return testo.upper()

def chain_v2(testo):
    return testo.capitalize()

def valuta(chain_fn, dataset):
    corretti = sum(1 for caso in dataset if chain_fn(caso["input"]) == caso["atteso"])
    return corretti / len(dataset)

punteggio_v1 = valuta(chain_v1, dataset)
punteggio_v2 = valuta(chain_v2, dataset)
migliore = "v1" if punteggio_v1 >= punteggio_v2 else "v2"

print(punteggio_v1, punteggio_v2, migliore)`,
      check: `assert punteggio_v1 == 1.0
assert punteggio_v2 == 0.0
assert migliore == "v1"`,
      hint: `<p><code>.capitalize()</code> rende maiuscola solo la prima lettera ("Ciao", non "CIAO"): contro un atteso tutto maiuscolo, sbaglia sempre. <code>.upper()</code> combacia perfettamente.</p>`,
      solution: `dataset = [
    {"input": "ciao", "atteso": "CIAO"},
    {"input": "python", "atteso": "PYTHON"},
    {"input": "test", "atteso": "TEST"},
    {"input": "chain", "atteso": "CHAIN"},
    {"input": "agente", "atteso": "AGENTE"},
]

def chain_v1(testo):
    return testo.upper()

def chain_v2(testo):
    return testo.capitalize()

def valuta(chain_fn, dataset):
    corretti = sum(1 for caso in dataset if chain_fn(caso["input"]) == caso["atteso"])
    return corretti / len(dataset)

punteggio_v1 = valuta(chain_v1, dataset)
punteggio_v2 = valuta(chain_v2, dataset)
migliore = "v1" if punteggio_v1 >= punteggio_v2 else "v2"

print(punteggio_v1, punteggio_v2, migliore)`
    },

    { type: "theory", title: "Fallback chain: cosa fare quando un passo fallisce", html: `
<p>In produzione, un modello (o un servizio esterno) può fallire: timeout, rate limit, errore del provider. Una <strong>fallback chain</strong> prova un'opzione primaria e, se fallisce, prova un'alternativa — invece di far crollare l'intero sistema:</p>
<pre><code>def chain_con_fallback(input_dato, primaria, fallback):
    try:
        return primaria(input_dato)
    except Exception:
        return fallback(input_dato)</code></pre>
<p>Le fallback si possono incatenare (primaria → fallback1 → fallback2 → risposta di default) e spesso si combinano con il retry visto nella sala LLM Toolkit: prima ritenta la stessa opzione un paio di volte (potrebbe essere un errore temporaneo), poi passa alla successiva se il problema persiste.</p>
` },

    {
      type: "exercise", id: "ai-13", kg: 20, title: "Chain con paracadute",
      task: `<p>Scrivi <code>chain_con_fallback(input_dato, primaria, fallback)</code> e testala sia nel caso in cui la primaria funziona sia nel caso in cui fallisce.</p>`,
      starter: `def modello_instabile(x):
    raise RuntimeError("servizio non disponibile")

def modello_di_riserva(x):
    return f"risposta di riserva per {x}"

def modello_stabile(x):
    return f"risposta normale per {x}"

def chain_con_fallback(input_dato, primaria, fallback):
    try:
        return primaria(input_dato)
    except Exception:
        return fallback(input_dato)

r1 = chain_con_fallback("domanda1", modello_stabile, modello_di_riserva)
r2 = chain_con_fallback("domanda2", modello_instabile, modello_di_riserva)

print(r1)
print(r2)`,
      check: `assert r1 == "risposta normale per domanda1"
assert r2 == "risposta di riserva per domanda2"`,
      hint: `<p>Quando <code>primaria</code> solleva un'eccezione, il blocco <code>except</code> intercetta il problema e passa la palla a <code>fallback</code> — l'utente non vede mai l'errore, solo una risposta (magari più semplice) che comunque arriva.</p>`,
      solution: `def modello_instabile(x):
    raise RuntimeError("servizio non disponibile")

def modello_di_riserva(x):
    return f"risposta di riserva per {x}"

def modello_stabile(x):
    return f"risposta normale per {x}"

def chain_con_fallback(input_dato, primaria, fallback):
    try:
        return primaria(input_dato)
    except Exception:
        return fallback(input_dato)

r1 = chain_con_fallback("domanda1", modello_stabile, modello_di_riserva)
r2 = chain_con_fallback("domanda2", modello_instabile, modello_di_riserva)

print(r1)
print(r2)`
    },

    { type: "theory", title: "RAG come chain: retriever + prompt + modello", html: `
<p>Il sistema RAG costruito nella sala omonima (TF-IDF + similarità coseno) è, nel vocabolario di LangChain, un <strong>Retriever</strong>: un componente con un solo compito, dato un testo restituire i documenti più rilevanti. Componendolo in una chain con prompt e modello si ottiene una <strong>RetrievalChain</strong> completa:</p>
<pre><code>class Retriever:
    def __init__(self, documenti, funzione_ricerca):
        self.documenti = documenti
        self.cerca = funzione_ricerca
    def invoke(self, domanda):
        return self.cerca(domanda, self.documenti)

def rag_chain(domanda, retriever, genera_risposta):
    contesto = retriever.invoke(domanda)
    return genera_risposta(domanda, contesto)</code></pre>
<p>Concettualmente non c'è nulla di nuovo rispetto alla sala RAG: qui il retrieval è solo "impacchettato" dietro un'interfaccia standard (<code>.invoke()</code>), la stessa usata per prompt, modelli e parser — così tutti i pezzi di un sistema LangChain condividono lo stesso modo di essere chiamati e composti.</p>
` },

    {
      type: "exercise", id: "ai-14", kg: 25, title: "Impacchetta il retrieval in una classe",
      task: `<p>Implementa <code>Retriever</code> (con <code>.invoke()</code>) usando la funzione di ricerca per parole condivise già vista nella sala RAG, poi componila con un generatore di risposta finto in <code>rag_chain</code>.</p>`,
      starter: `def cerca_per_parole(domanda, documenti):
    parole_domanda = set(domanda.lower().split())
    punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in documenti]
    idx_migliore = punteggi.index(max(punteggi))
    return documenti[idx_migliore]

class Retriever:
    def __init__(self, documenti, funzione_ricerca):
        self.documenti = documenti
        self.cerca = funzione_ricerca

    def invoke(self, domanda):
        return self.cerca(domanda, self.documenti)

def genera_risposta(domanda, contesto):
    return f"Basandomi su '{contesto}', rispondo a: {domanda}"

def rag_chain(domanda, retriever, genera_risposta):
    contesto = retriever.invoke(domanda)
    return genera_risposta(domanda, contesto)

documenti = [
    "il riscaldamento riduce il rischio di infortuni",
    "dormire bene migliora il recupero muscolare",
]

retriever = Retriever(documenti, cerca_per_parole)
risposta = rag_chain("come miglioro il recupero dopo l'allenamento?", retriever, genera_risposta)

print(risposta)`,
      check: `assert "recupero muscolare" in risposta`,
      hint: `<p>La domanda condivide più parole con il secondo documento ("recupero", "miglioro"/"migliora"): il retriever lo sceglie, e il generatore lo incorpora nella risposta finale.</p>`,
      solution: `def cerca_per_parole(domanda, documenti):
    parole_domanda = set(domanda.lower().split())
    punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in documenti]
    idx_migliore = punteggi.index(max(punteggi))
    return documenti[idx_migliore]

class Retriever:
    def __init__(self, documenti, funzione_ricerca):
        self.documenti = documenti
        self.cerca = funzione_ricerca

    def invoke(self, domanda):
        return self.cerca(domanda, self.documenti)

def genera_risposta(domanda, contesto):
    return f"Basandomi su '{contesto}', rispondo a: {domanda}"

def rag_chain(domanda, retriever, genera_risposta):
    contesto = retriever.invoke(domanda)
    return genera_risposta(domanda, contesto)

documenti = [
    "il riscaldamento riduce il rischio di infortuni",
    "dormire bene migliora il recupero muscolare",
]

retriever = Retriever(documenti, cerca_per_parole)
risposta = rag_chain("come miglioro il recupero dopo l'allenamento?", retriever, genera_risposta)

print(risposta)`
    },

    {
      type: "exercise", id: "ai-15", kg: 25, title: "Combo: chain tracciata con Runnable",
      task: `<p>Combina <code>Runnable</code> (con <code>|</code>) e <code>trace</code>: avvolgi ogni passo di una catena in <code>trace</code> PRIMA di comporlo con <code>Runnable</code>, così ogni invocazione della chain composta lascia un log completo.</p>`,
      starter: `log_tracce = []

def trace(fn):
    def wrapper(x):
        risultato = fn(x)
        log_tracce.append({"funzione": fn.__name__, "output": risultato})
        return risultato
    wrapper.__name__ = fn.__name__
    return wrapper

class Runnable:
    def __init__(self, fn):
        self.fn = fn
    def __or__(self, altro):
        return Runnable(lambda x: altro.fn(self.fn(x)))
    def invoke(self, x):
        return self.fn(x)

def raddoppia(x):
    return x * 2

def incrementa(x):
    return x + 1

passo1 = Runnable(trace(raddoppia))
passo2 = Runnable(trace(incrementa))

catena = passo1 | passo2
risultato = catena.invoke(5)

print(risultato)
print(log_tracce)
print(len(log_tracce))`,
      check: `assert risultato == 11
assert len(log_tracce) == 2
assert log_tracce[0]["funzione"] == "raddoppia"
assert log_tracce[1]["funzione"] == "incrementa"`,
      hint: `<p><code>wrapper.__name__ = fn.__name__</code> è un dettaglio necessario: senza, <code>trace(raddoppia).__name__</code> sarebbe <code>"wrapper"</code> per ogni funzione decorata, rendendo i log illeggibili.</p>`,
      solution: `log_tracce = []

def trace(fn):
    def wrapper(x):
        risultato = fn(x)
        log_tracce.append({"funzione": fn.__name__, "output": risultato})
        return risultato
    wrapper.__name__ = fn.__name__
    return wrapper

class Runnable:
    def __init__(self, fn):
        self.fn = fn
    def __or__(self, altro):
        return Runnable(lambda x: altro.fn(self.fn(x)))
    def invoke(self, x):
        return self.fn(x)

def raddoppia(x):
    return x * 2

def incrementa(x):
    return x + 1

passo1 = Runnable(trace(raddoppia))
passo2 = Runnable(trace(incrementa))

catena = passo1 | passo2
risultato = catena.invoke(5)

print(risultato)
print(log_tracce)
print(len(log_tracce))`
    },

    {
      type: "exercise", id: "ai-16", kg: 25, title: "Combo: agente con memoria e strumenti",
      task: `<p>Unisci <code>ConversationMemory</code> e un ciclo ReAct semplificato: per ogni domanda dell'utente, registra il turno in memoria, decidi se serve uno strumento (parola chiave "meteo") o si può rispondere direttamente, esegui, registra la risposta.</p>`,
      starter: `class ConversationMemory:
    def __init__(self):
        self.messaggi = []
    def aggiungi_utente(self, testo):
        self.messaggi.append({"role": "user", "content": testo})
    def aggiungi_assistente(self, testo):
        self.messaggi.append({"role": "assistant", "content": testo})

def get_meteo(citta):
    return f"{citta}: soleggiato"

def gestisci_domanda(domanda, memoria):
    memoria.aggiungi_utente(domanda)
    if "meteo" in domanda.lower():
        citta = domanda.split()[-1]
        risposta = get_meteo(citta)
    else:
        risposta = "Non ho uno strumento per questo, rispondo a parole: " + domanda
    memoria.aggiungi_assistente(risposta)
    return risposta

mem = ConversationMemory()
r1 = gestisci_domanda("che meteo fa a Roma", mem)
r2 = gestisci_domanda("raccontami una barzelletta", mem)

print(r1)
print(r2)
print(len(mem.messaggi))`,
      check: `assert r1 == "Roma: soleggiato"
assert "barzelletta" in r2
assert len(mem.messaggi) == 4`,
      hint: `<p>Ogni chiamata a <code>gestisci_domanda</code> aggiunge 2 messaggi (utente + assistente): con 2 chiamate, la memoria deve contenerne 4 in tutto.</p>`,
      solution: `class ConversationMemory:
    def __init__(self):
        self.messaggi = []
    def aggiungi_utente(self, testo):
        self.messaggi.append({"role": "user", "content": testo})
    def aggiungi_assistente(self, testo):
        self.messaggi.append({"role": "assistant", "content": testo})

def get_meteo(citta):
    return f"{citta}: soleggiato"

def gestisci_domanda(domanda, memoria):
    memoria.aggiungi_utente(domanda)
    if "meteo" in domanda.lower():
        citta = domanda.split()[-1]
        risposta = get_meteo(citta)
    else:
        risposta = "Non ho uno strumento per questo, rispondo a parole: " + domanda
    memoria.aggiungi_assistente(risposta)
    return risposta

mem = ConversationMemory()
r1 = gestisci_domanda("che meteo fa a Roma", mem)
r2 = gestisci_domanda("raccontami una barzelletta", mem)

print(r1)
print(r2)
print(len(mem.messaggi))`
    },

    {
      type: "exercise", id: "ai-17", kg: 25, title: "Combo: valuta un agente su un mini-dataset",
      task: `<p>Con <code>dataset_test</code> (domande + risposta attesa) e la funzione agente della sala: calcola l'accuratezza dell'agente sul dataset, come nella teoria sulla valutazione.</p>`,
      starter: `def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

def agente(domanda):
    if "meteo" in domanda.lower():
        citta = domanda.split()[-1]
        return get_meteo(citta)
    return "non so rispondere"

dataset_test = [
    {"domanda": "meteo Roma", "atteso": "soleggiato"},
    {"domanda": "meteo Milano", "atteso": "nuvoloso"},
    {"domanda": "meteo Napoli", "atteso": "sconosciuto"},
]

corretti = sum(1 for caso in dataset_test if agente(caso["domanda"]) == caso["atteso"])
accuratezza = corretti / len(dataset_test)

print(accuratezza)`,
      check: `assert accuratezza == 1.0`,
      hint: `<p>L'agente gestisce correttamente anche il caso "sconosciuto" (Napoli non è nel suo dizionario): per questo l'accuratezza è perfetta anche sul caso limite.</p>`,
      solution: `def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

def agente(domanda):
    if "meteo" in domanda.lower():
        citta = domanda.split()[-1]
        return get_meteo(citta)
    return "non so rispondere"

dataset_test = [
    {"domanda": "meteo Roma", "atteso": "soleggiato"},
    {"domanda": "meteo Milano", "atteso": "nuvoloso"},
    {"domanda": "meteo Napoli", "atteso": "sconosciuto"},
]

corretti = sum(1 for caso in dataset_test if agente(caso["domanda"]) == caso["atteso"])
accuratezza = corretti / len(dataset_test)

print(accuratezza)`
    },

    {
      type: "exercise", id: "ai-18", kg: 25, title: "Massimale: grafo con tre nodi e ciclo di revisione",
      task: `<p>Costruisci un grafo: <code>scrivi</code> (produce una bozza), <code>revisiona</code> (controlla se la bozza è abbastanza lunga, altrimenti la allunga e ci si ricicla), <code>pubblica</code> (finale). Usa archi condizionali dopo <code>revisiona</code>.</p>`,
      starter: `class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_edge(self, frm, to): self.edges[frm] = to
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

def nodo_scrivi(state):
    state.setdefault("bozza", "Testo breve.")
    return state

def nodo_revisiona(state):
    if len(state["bozza"]) < 30:
        state["bozza"] += " Aggiungo altro dettaglio per allungare il testo."
    return state

def router_revisione(state):
    return "pubblica" if len(state["bozza"]) >= 30 else "revisiona"

def nodo_pubblica(state):
    state["pubblicato"] = True
    return state

g = StateGraph()
g.add_node("scrivi", nodo_scrivi)
g.add_node("revisiona", nodo_revisiona)
g.add_node("pubblica", nodo_pubblica)
g.set_entry_point("scrivi")
g.add_edge("scrivi", "revisiona")
g.add_conditional_edges("revisiona", router_revisione)
g.add_edge("pubblica", "END")

risultato = g.invoke({})
print(risultato)`,
      check: `assert risultato["pubblicato"] == True
assert len(risultato["bozza"]) >= 30`,
      hint: `<p>Dopo <code>scrivi</code>, la bozza è troppo corta (meno di 30 caratteri): il router rimanda a <code>revisiona</code> una volta, che la allunga; alla revisione successiva è già abbastanza lunga e si passa a <code>pubblica</code>.</p>`,
      solution: `class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_edge(self, frm, to): self.edges[frm] = to
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

def nodo_scrivi(state):
    state.setdefault("bozza", "Testo breve.")
    return state

def nodo_revisiona(state):
    if len(state["bozza"]) < 30:
        state["bozza"] += " Aggiungo altro dettaglio per allungare il testo."
    return state

def router_revisione(state):
    return "pubblica" if len(state["bozza"]) >= 30 else "revisiona"

def nodo_pubblica(state):
    state["pubblicato"] = True
    return state

g = StateGraph()
g.add_node("scrivi", nodo_scrivi)
g.add_node("revisiona", nodo_revisiona)
g.add_node("pubblica", nodo_pubblica)
g.set_entry_point("scrivi")
g.add_edge("scrivi", "revisiona")
g.add_conditional_edges("revisiona", router_revisione)
g.add_edge("pubblica", "END")

risultato = g.invoke({})
print(risultato)`
    },

    {
      type: "exercise", id: "ai-19", kg: 25, title: "Massimale: pipeline RAG tracciata e valutata",
      task: `<p>Combina retrieval, generazione, tracing e valutazione in un'unica pipeline. Costruisci <code>rag_tracciato</code> (decorato con <code>trace</code>), eseguilo su un mini-dataset, e calcola l'accuratezza.</p>`,
      starter: `log_tracce = []

def trace(fn):
    def wrapper(*args):
        risultato = fn(*args)
        log_tracce.append({"funzione": fn.__name__, "input": args})
        return risultato
    return wrapper

documenti = [
    "il riscaldamento riduce gli infortuni",
    "dormire bene aiuta il recupero",
]

def cerca(domanda, documenti):
    parole = set(domanda.lower().split())
    punteggi = [len(parole & set(d.lower().split())) for d in documenti]
    return documenti[punteggi.index(max(punteggi))]

@trace
def rag_tracciato(domanda):
    contesto = cerca(domanda, documenti)
    if "infortuni" in contesto or "riscaldamento" in contesto:
        return "riscaldamento"
    return "recupero"

dataset = [
    {"domanda": "come evito infortuni durante l'allenamento?", "atteso": "riscaldamento"},
    {"domanda": "come miglioro il recupero dopo lo sforzo?", "atteso": "recupero"},
]

risultati = [rag_tracciato(caso["domanda"]) for caso in dataset]
corretti = sum(1 for r, caso in zip(risultati, dataset) if r == caso["atteso"])
accuratezza = corretti / len(dataset)

print(risultati)
print(accuratezza)
print(len(log_tracce))`,
      check: `assert accuratezza == 1.0
assert len(log_tracce) == 2`,
      hint: `<p>Ogni chiamata a <code>rag_tracciato</code> lascia una traccia E produce un risultato valutabile: tracing e valutazione non si escludono a vicenda, anzi nei sistemi reali convivono sempre.</p>`,
      solution: `log_tracce = []

def trace(fn):
    def wrapper(*args):
        risultato = fn(*args)
        log_tracce.append({"funzione": fn.__name__, "input": args})
        return risultato
    return wrapper

documenti = [
    "il riscaldamento riduce gli infortuni",
    "dormire bene aiuta il recupero",
]

def cerca(domanda, documenti):
    parole = set(domanda.lower().split())
    punteggi = [len(parole & set(d.lower().split())) for d in documenti]
    return documenti[punteggi.index(max(punteggi))]

@trace
def rag_tracciato(domanda):
    contesto = cerca(domanda, documenti)
    if "infortuni" in contesto or "riscaldamento" in contesto:
        return "riscaldamento"
    return "recupero"

dataset = [
    {"domanda": "come evito infortuni durante l'allenamento?", "atteso": "riscaldamento"},
    {"domanda": "come miglioro il recupero dopo lo sforzo?", "atteso": "recupero"},
]

risultati = [rag_tracciato(caso["domanda"]) for caso in dataset]
corretti = sum(1 for r, caso in zip(risultati, dataset) if r == caso["atteso"])
accuratezza = corretti / len(dataset)

print(risultati)
print(accuratezza)
print(len(log_tracce))`
    },

    {
      type: "exercise", id: "ai-20", kg: 25, title: "Massimale finale: supervisore con tracing su tre specialisti",
      task: `<p>L'ultima serie: un grafo supervisore-specialisti (come visto prima) ma con OGNI nodo decorato da <code>trace</code>, così a fine esecuzione hai un log completo di chi ha lavorato su cosa. Aggiungi un terzo specialista, <code>programmatore</code>.</p>`,
      starter: `log_tracce = []

def trace(nome):
    def decoratore(fn):
        def wrapper(state):
            risultato = fn(state)
            log_tracce.append(nome)
            return risultato
        return wrapper
    return decoratore

class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_edge(self, frm, to): self.edges[frm] = to
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

@trace("supervisore")
def nodo_supervisore(state):
    return state

def router_supervisore(state):
    if state.get("fatto"):
        return "END"
    if "cerca" in state["compito"]:
        return "ricercatore"
    if "scrivi" in state["compito"]:
        return "scrittore"
    return "programmatore"

@trace("ricercatore")
def nodo_ricercatore(state):
    state["risultati"] = "dati trovati"
    state["fatto"] = True
    return state

@trace("scrittore")
def nodo_scrittore(state):
    state["risultati"] = "testo scritto"
    state["fatto"] = True
    return state

@trace("programmatore")
def nodo_programmatore(state):
    state["risultati"] = "codice scritto"
    state["fatto"] = True
    return state

g = StateGraph()
g.add_node("supervisore", nodo_supervisore)
g.add_node("ricercatore", nodo_ricercatore)
g.add_node("scrittore", nodo_scrittore)
g.add_node("programmatore", nodo_programmatore)
g.set_entry_point("supervisore")
g.add_conditional_edges("supervisore", router_supervisore)
g.add_edge("ricercatore", "supervisore")
g.add_edge("scrittore", "supervisore")
g.add_edge("programmatore", "supervisore")

risultato = g.invoke({"compito": "programma una funzione in python"})
print(risultato)
print(log_tracce)`,
      check: `assert risultato["risultati"] == "codice scritto"
assert log_tracce == ["supervisore", "programmatore", "supervisore"]`,
      hint: `<p>Il compito non contiene né "cerca" né "scrivi": il router arriva quindi al ramo <code>else</code>, che instrada al <code>programmatore</code>.</p>`,
      solution: `log_tracce = []

def trace(nome):
    def decoratore(fn):
        def wrapper(state):
            risultato = fn(state)
            log_tracce.append(nome)
            return risultato
        return wrapper
    return decoratore

class StateGraph:
    def __init__(self):
        self.nodes, self.edges, self.entry = {}, {}, None
    def add_node(self, name, fn): self.nodes[name] = fn
    def set_entry_point(self, name): self.entry = name
    def add_edge(self, frm, to): self.edges[frm] = to
    def add_conditional_edges(self, frm, router): self.edges[frm] = router
    def invoke(self, state):
        current = self.entry
        while current != "END":
            state = self.nodes[current](state)
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

@trace("supervisore")
def nodo_supervisore(state):
    return state

def router_supervisore(state):
    if state.get("fatto"):
        return "END"
    if "cerca" in state["compito"]:
        return "ricercatore"
    if "scrivi" in state["compito"]:
        return "scrittore"
    return "programmatore"

@trace("ricercatore")
def nodo_ricercatore(state):
    state["risultati"] = "dati trovati"
    state["fatto"] = True
    return state

@trace("scrittore")
def nodo_scrittore(state):
    state["risultati"] = "testo scritto"
    state["fatto"] = True
    return state

@trace("programmatore")
def nodo_programmatore(state):
    state["risultati"] = "codice scritto"
    state["fatto"] = True
    return state

g = StateGraph()
g.add_node("supervisore", nodo_supervisore)
g.add_node("ricercatore", nodo_ricercatore)
g.add_node("scrittore", nodo_scrittore)
g.add_node("programmatore", nodo_programmatore)
g.set_entry_point("supervisore")
g.add_conditional_edges("supervisore", router_supervisore)
g.add_edge("ricercatore", "supervisore")
g.add_edge("scrittore", "supervisore")
g.add_edge("programmatore", "supervisore")

risultato = g.invoke({"compito": "programma una funzione in python"})
print(risultato)
print(log_tracce)`
    }
  ]
});
