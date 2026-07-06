window.MODULES.push({
  id: "llm-toolkit",
  name: "LLM Toolkit",
  tagline: "L'angolo dei bilancieri smart: parlare con modelli linguistici via API, tokenizzare, capire il fine-tuning leggero.",
  intro: "Ollama, Hugging Face Transformers e unsloth condividono lo stesso scopo: usare o adattare modelli linguistici già addestrati, invece di costruirne uno da zero. Un vero modello pesa gigabyte e non gira in un browser: qui usiamo API simulate (ma con la stessa identica forma di quelle vere) per allenare il gesto — la chiamata, il formato dei messaggi, la lettura della risposta — che userai identico con le librerie reali sul tuo computer.",
  packages: [],
  items: [

    { type: "theory", title: "Il formato universale: liste di messaggi", html: `
<p>Tutti i modelli di chat — locali con Ollama, o via API — parlano lo stesso formato: una <strong>lista di messaggi</strong>, ciascuno con un <code>role</code> (chi parla) e un <code>content</code> (cosa dice).</p>
<pre><code>messaggi = [
    {"role": "system", "content": "Sei un assistente conciso."},
    {"role": "user", "content": "Cos'e' l'overfitting?"},
]</code></pre>
<p>Tre ruoli standard: <code>system</code> (le istruzioni di comportamento, di solito il primo messaggio), <code>user</code> (quello che scrive la persona), <code>assistant</code> (le risposte del modello — anche i turni precedenti, per dargli memoria della conversazione). Questa lista <em>è</em> l'intera conversazione: il modello non ha memoria propria, la riceve da capo ad ogni chiamata.</p>
`, more: `
<p>Il fatto che il modello "non abbia memoria propria" ha una conseguenza pratica enorme: OGNI chiamata è indipendente e stateless, e il costo (in token, quindi in tempo e denaro) cresce con la lunghezza dell'intera conversazione, non solo con l'ultimo messaggio. Una conversazione lunga rimanda l'INTERA cronologia ad ogni turno — è il motivo per cui il troncamento della cronologia (visto in un'altra teoria di questa sala) è un problema pratico reale, non solo un esercizio accademico.</p>
<p>Alcune API distinguono anche un quarto ruolo, <code>tool</code> (o <code>function</code>): il risultato dell'esecuzione di uno strumento richiesto dal modello (visto nella teoria sul function calling), da reinserire nella conversazione perché il modello possa leggerlo e continuare a ragionare — la lista di messaggi è quindi il "verbale" completo di un'intera interazione, non solo dello scambio testuale diretto tra utente e modello.</p>
<p>Il messaggio <code>system</code> non è solo "istruzioni di comportamento" nel senso di uno stile (conciso, formale): è anche il posto giusto per dare CONTESTO stabile che non cambia turno per turno — la data corrente, il ruolo dell'assistente, i vincoli di formato della risposta. Un errore comune da principianti è mettere queste informazioni stabili dentro ogni messaggio <code>user</code>, ripetendole inutilmente e sprecando token ad ogni turno.</p>
` },

    {
      type: "exercise", id: "llm-01", kg: 5, title: "Costruisci la conversazione",
      task: `<p>Costruisci <code>messaggi</code>, una lista con:</p>
<ul>
<li>Un messaggio <code>system</code>: "Rispondi in una sola frase."</li>
<li>Un messaggio <code>user</code>: "Cos'e' un array NumPy?"</li>
</ul>
<p>Poi calcola <code>n_per_ruolo</code>: un dizionario che conta quanti messaggi ci sono per ciascun ruolo.</p>`,
      starter: `messaggi = [
    ...
]

n_per_ruolo = {}
for m in messaggi:
    ...

print(messaggi)
print(n_per_ruolo)`,
      check: `assert 'messaggi' in globals() and len(messaggi) == 2, "messaggi deve avere 2 elementi"
assert messaggi[0] == {"role": "system", "content": "Rispondi in una sola frase."}, "Il primo messaggio deve essere il system prompt"
assert messaggi[1] == {"role": "user", "content": "Cos'e' un array NumPy?"}, "Il secondo deve essere il messaggio user"
assert 'n_per_ruolo' in globals() and n_per_ruolo == {"system": 1, "user": 1}, "n_per_ruolo: conta i ruoli con il pattern .get(k, 0) + 1 visto nel riscaldamento"`,
      hint: `<p>Ogni messaggio è un dizionario <code>{"role": ..., "content": ...}</code>. Per contare: <code>n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1</code>.</p>`,
      solution: `messaggi = [
    {"role": "system", "content": "Rispondi in una sola frase."},
    {"role": "user", "content": "Cos'e' un array NumPy?"},
]

n_per_ruolo = {}
for m in messaggi:
    n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1

print(messaggi)
print(n_per_ruolo)`
    },

    { type: "theory", title: "Chiamare un modello locale (Ollama)", html: `
<p>Ollama fa girare modelli linguistici <strong>sul tuo computer</strong>, esposti come una piccola API locale. Il client Python ha una firma semplicissima:</p>
<pre><code>import ollama
risposta = ollama.chat(model="llama3", messages=messaggi)
risposta["message"]["content"]   # il testo generato, dentro un dizionario annidato</code></pre>
<p>Qui simuliamo questa firma esatta con <code>MockOllama</code> (fornita nel setup): stessa struttura di chiamata e di risposta di quella vera, ma con risposte pre-scritte invece di un modello reale — perché un modello vero non gira in un browser. Il gesto che impari — chiamare, poi scavare in <code>risposta["message"]["content"]</code> — è letteralmente identico.</p>
`, more: `
<p>Ollama gira come un servizio in background sulla tua macchina (avviato con <code>ollama serve</code>, spesso automatico all'installazione) ed espone un'API HTTP locale, tipicamente su <code>localhost:11434</code> — il pacchetto Python <code>ollama</code> è solo un client comodo che parla con quel servizio, ma nulla vieta di interrogarlo anche con una semplice richiesta HTTP (<code>requests.post</code>) se preferisci non usare la libreria dedicata.</p>
<p>Prima di poter usare un modello con Ollama serve scaricarlo una volta con <code>ollama pull llama3</code> (o il nome del modello scelto) — un passo equivalente a <code>pip install</code> per una libreria, ma per un modello che può pesare diversi gigabyte. Una volta scaricato, resta disponibile localmente per tutte le chiamate successive senza bisogno di rete.</p>
<p>Il vantaggio principale di un modello locale rispetto a un'API cloud (OpenAI, Anthropic, ecc.) è la privacy e il costo: i dati non lasciano mai la tua macchina, e non paghi per token generato — lo svantaggio è che servono risorse hardware locali (RAM, spesso una GPU) proporzionali alla dimensione del modello, e le prestazioni di un modello locale relativamente piccolo sono generalmente inferiori a quelle dei modelli di punta offerti via API.</p>
` },

    {
      type: "exercise", id: "llm-02", kg: 10, title: "Il tuo primo mock-modello",
      task: `<p><code>ollama</code> (mock) è già pronto. Fai una chiamata e leggi la risposta:</p>
<ul>
<li><code>risposta</code>: il dizionario restituito da <code>ollama.chat(model="llama3", messages=messaggi)</code></li>
<li><code>testo</code>: solo il testo della risposta, scavando nel dizionario annidato</li>
</ul>`,
      setup: `class MockOllama:
    def chat(self, model, messages):
        ultimo = messages[-1]["content"].lower()
        if "overfitting" in ultimo:
            testo = "L'overfitting e' quando un modello impara a memoria il training set invece di generalizzare."
        else:
            testo = "Non ho una risposta pronta per questo, ma il formato della chiamata e' quello vero."
        return {"model": model, "message": {"role": "assistant", "content": testo}}

ollama = MockOllama()
messaggi = [{"role": "user", "content": "Spiegami l'overfitting"}]`,
      starter: `# ollama e messaggi sono gia' pronti
risposta = ...
testo = ...

print(risposta)
print(testo)`,
      check: `assert 'risposta' in globals() and "message" in risposta, "risposta: ollama.chat(model='llama3', messages=messaggi)"
assert 'testo' in globals() and "overfitting" in testo.lower(), "testo: risposta['message']['content'] — deve contenere la spiegazione dell'overfitting"`,
      hint: `<p>La risposta ha la forma <code>{"model": ..., "message": {"role": ..., "content": ...}}</code>: il testo è due livelli sotto, <code>risposta["message"]["content"]</code>.</p>`,
      solution: `risposta = ollama.chat(model="llama3", messages=messaggi)
testo = risposta["message"]["content"]

print(risposta)
print(testo)`
    },

    { type: "theory", title: "Parametri di generazione: temperature e max_tokens", html: `
<p>Ogni chiamata a un modello generativo accetta parametri che controllano <em>come</em> genera, non <em>cosa</em> sa:</p>
<ul>
<li><code>temperature</code> (di solito 0–2): 0 = sempre la risposta più probabile (deterministico, ripetibile), valori alti = più varietà e imprevedibilità</li>
<li><code>top_p</code> (0–1): considera solo le parole più probabili fino a coprire quella percentuale di probabilità cumulata</li>
<li><code>max_tokens</code>: il tetto massimo di token che il modello può generare in risposta — oltre, la risposta viene troncata</li>
</ul>
<p>Per un compito che richiede precisione (estrarre dati, scrivere codice) si usa <code>temperature</code> bassa; per un compito creativo (brainstorming, variazioni di stile) si alza. Non esiste un valore "giusto" universale, ma esiste un valore sbagliato per il compito.</p>
`, more: `
<p>Tecnicamente, <code>temperature</code> agisce sulla distribuzione di probabilità che il modello calcola per il prossimo token: a temperatura 0 (o molto bassa) il modello sceglie quasi sempre il token più probabile (comportamento "greedy", deterministico); a temperatura alta la distribuzione viene "appiattita", dando più chance anche a token meno probabili di essere scelti — è lo stesso principio del campionamento pesato, non una scelta arbitraria di "quanto essere strano".</p>
<p><code>top_p</code> (nucleus sampling) e <code>top_k</code> (non menzionato nella lavagna ma comune) sono filtri alternativi/complementari alla temperatura: <code>top_k=50</code> considera solo i 50 token più probabili scartando la coda lunga di opzioni improbabili, <code>top_p=0.9</code> considera un insieme di token che insieme coprono il 90% della probabilità cumulata (una soglia dinamica, non un numero fisso di opzioni). Usare temperatura E top_p insieme è comune, ma i loro effetti si sommano — alzare entrambi contemporaneamente al massimo produce output molto instabile.</p>
<p><code>max_tokens</code> non è solo un limite di sicurezza contro risposte infinite: incide direttamente sul COSTO (se paghi per token generato) e sulla LATENZA (più token da generare, più tempo di attesa, perché i modelli generano un token alla volta, in sequenza). Impostarlo troppo basso tronca risposte a metà frase in modo brutto; troppo alto spreca soldi/tempo se la risposta attesa è breve — va calibrato sul compito specifico, non lasciato al valore di default della libreria.</p>
` },

    {
      type: "exercise", id: "llm-03", kg: 10, title: "Configura la generazione",
      task: `<p>Scrivi la funzione <code>valida_config(cfg)</code> che restituisce <code>True</code> se il dizionario <code>cfg</code> ha <code>temperature</code> tra 0 e 2 (inclusi) <strong>e</strong> <code>top_p</code> tra 0 e 1 (inclusi), <code>False</code> altrimenti. Poi:</p>
<ul>
<li><code>config_precisa</code>: dizionario con <code>temperature=0.1</code>, <code>top_p=0.9</code>, <code>max_tokens=200</code> — per un task di estrazione dati</li>
<li><code>config_creativa</code>: dizionario con <code>temperature=1.4</code>, <code>top_p=0.95</code>, <code>max_tokens=500</code> — per un task creativo</li>
<li><code>entrambe_valide</code>: <code>True</code> se entrambe passano <code>valida_config</code></li>
</ul>`,
      starter: `def valida_config(cfg):
    ...

config_precisa = {"temperature": 0.1, "top_p": 0.9, "max_tokens": 200}
config_creativa = {"temperature": 1.4, "top_p": 0.95, "max_tokens": 500}

entrambe_valide = ...

print(valida_config(config_precisa), valida_config(config_creativa))
print(entrambe_valide)`,
      check: `assert 'valida_config' in globals() and callable(valida_config), "Devi definire valida_config"
assert valida_config({"temperature": 0.5, "top_p": 0.5}) == True, "temperature=0.5, top_p=0.5 devono essere validi"
assert valida_config({"temperature": 3.0, "top_p": 0.5}) == False, "temperature=3.0 e' fuori range (> 2)"
assert valida_config({"temperature": 0.5, "top_p": 1.5}) == False, "top_p=1.5 e' fuori range (> 1)"
assert 'entrambe_valide' in globals() and entrambe_valide == True, "entrambe_valide: valida_config(config_precisa) and valida_config(config_creativa)"`,
      hint: `<p><code>return 0 &lt;= cfg["temperature"] &lt;= 2 and 0 &lt;= cfg["top_p"] &lt;= 1</code> — il confronto a catena <code>0 &lt;= x &lt;= 2</code> funziona in Python esattamente come te lo aspetti.</p>`,
      solution: `def valida_config(cfg):
    return 0 <= cfg["temperature"] <= 2 and 0 <= cfg["top_p"] <= 1

config_precisa = {"temperature": 0.1, "top_p": 0.9, "max_tokens": 200}
config_creativa = {"temperature": 1.4, "top_p": 0.95, "max_tokens": 500}

entrambe_valide = valida_config(config_precisa) and valida_config(config_creativa)

print(valida_config(config_precisa), valida_config(config_creativa))
print(entrambe_valide)`
    },

    { type: "theory", title: "La pipeline di Hugging Face", html: `
<p>La libreria <strong>Transformers</strong> di Hugging Face espone modelli pre-addestrati dietro un'interfaccia semplicissima, la <code>pipeline</code>: dai un compito, ottieni una funzione pronta all'uso.</p>
<pre><code>from transformers import pipeline
classifica = pipeline("sentiment-analysis")
classifica("Questo prodotto e' fantastico!")
# [{"label": "POSITIVE", "score": 0.9998}]</code></pre>
<p>Dietro le quinte scarica un modello (centinaia di MB), lo carica in memoria e lo usa per inferenza — impossibile qui. Simuliamo la stessa <em>interfaccia</em> con <code>classifica_mock</code>, una funzione che restituisce esattamente la stessa forma (lista di dizionari con <code>label</code> e <code>score</code>), così il gesto di chiamarla e leggerne l'output è quello vero.</p>
`, more: `
<p>La <code>pipeline</code> di Transformers non è specifica del sentiment analysis: lo stesso pattern <code>pipeline("nome-task")</code> copre decine di compiti — <code>"text-generation"</code>, <code>"translation"</code>, <code>"summarization"</code>, <code>"question-answering"</code>, <code>"zero-shot-classification"</code> (classificare senza esempi di training, dando solo le categorie possibili come testo) — ognuno restituisce una forma di output diversa ma coerente al tipo di compito, documentata nella libreria.</p>
<p>La prima chiamata a <code>pipeline(...)</code> scarica il modello di default per quel compito da Hugging Face Hub (un repository pubblico di modelli pre-addestrati, analogo concettualmente a Docker Hub per le immagini) e lo mette in cache locale — le chiamate successive riusano la cache, evitando di riscaricare gigabyte ogni volta.</p>
<p>Un dettaglio pratico su <code>score</code>: rappresenta la CONFIDENZA del modello nella sua predizione, un numero tra 0 e 1, non una misura di "quanto è positivo/negativo" il testo — un testo ambiguo o neutro spesso produce uno score basso indipendentemente dal label assegnato, un segnale che il modello stesso non è molto sicuro della propria classificazione (esattamente il limite emerso nell'esercizio "Classifica il sentiment" di questa sala, dove una recensione neutra viene comunque forzata in una delle due categorie).</p>
` },

    {
      type: "exercise", id: "llm-04", kg: 15, title: "Classifica il sentiment",
      task: `<p><code>classifica_mock</code> è già pronta (nel setup) e si comporta come <code>pipeline("sentiment-analysis")</code>. Su <code>recensioni</code> (lista di frasi):</p>
<ul>
<li><code>risultati</code>: lista di risultati, uno per recensione, chiamando <code>classifica_mock</code> su ognuna</li>
<li><code>n_positive</code>: quante recensioni hanno <code>label == "POSITIVE"</code></li>
<li><code>piu_sicura</code>: il testo della recensione con lo <code>score</code> più alto (qualunque sia il label)</li>
</ul>`,
      setup: `PAROLE_POSITIVE = {"fantastico", "ottimo", "adoro", "perfetto"}
PAROLE_NEGATIVE = {"pessimo", "orribile", "delusione", "male"}

def classifica_mock(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    n_pos = len(parole & PAROLE_POSITIVE)
    n_neg = len(parole & PAROLE_NEGATIVE)
    if n_pos >= n_neg:
        return [{"label": "POSITIVE", "score": 0.6 + 0.1 * n_pos}]
    return [{"label": "NEGATIVE", "score": 0.6 + 0.1 * n_neg}]

recensioni = [
    "Prodotto fantastico, lo adoro!",
    "Servizio davvero pessimo quest oggi.",
    "Nella media, niente di che.",
    "Perfetto, ottimo in tutto e per tutto!",
]`,
      starter: `# classifica_mock e recensioni sono gia' pronte
risultati = ...
n_positive = ...
piu_sicura = ...

print(risultati)
print(n_positive)
print(piu_sicura)`,
      check: `assert 'risultati' in globals() and len(risultati) == 4, "risultati: [classifica_mock(r) for r in recensioni]"
assert 'n_positive' in globals() and n_positive == 3, "n_positive: conta i risultati con label POSITIVE — nota che la recensione neutra (0 parole positive e 0 negative) finisce POSITIVE per come e' scritto il mock (n_pos >= n_neg, e 0 >= 0): un limite reale di questi classificatori binari"
assert 'piu_sicura' in globals() and piu_sicura == "Prodotto fantastico, lo adoro!", "piu_sicura: due recensioni condividono lo score piu' alto (0.7): con max(..., key=...) vince la PRIMA che lo raggiunge"`,
      hint: `<p><code>classifica_mock(r)</code> restituisce una <strong>lista di un dizionario</strong>: <code>classifica_mock(r)[0]["label"]</code>. Per trovare il massimo, confronta gli <code>score</code> con un ciclo o con <code>max(..., key=...)</code> — in caso di pareggio, <code>max</code> restituisce sempre il primo che ha raggiunto quel valore.</p>`,
      solution: `risultati = [classifica_mock(r) for r in recensioni]
n_positive = sum(1 for r in risultati if r[0]["label"] == "POSITIVE")

migliore_idx = max(range(len(risultati)), key=lambda i: risultati[i][0]["score"])
piu_sicura = recensioni[migliore_idx]

print(risultati)
print(n_positive)
print(piu_sicura)`
    },

    { type: "theory", title: "Tokenizzazione: come un modello 'legge'", html: `
<p>Un modello linguistico non legge caratteri né parole intere: legge <strong>token</strong>, pezzi di sottoparola scelti da un vocabolario fisso (es. "overfitting" può diventare <code>["over", "fit", "ting"]</code>). Il numero di token, non di caratteri, determina costo e limiti di contesto.</p>
<pre><code>tokenizer.encode("ciao mondo")   # es. [1023, 4521] — due id numerici
tokenizer.decode([1023, 4521])   # "ciao mondo" — il percorso inverso</code></pre>
<p>Qui usiamo <code>tokenizza_mock</code>, un tokenizzatore giocattolo che spezza sullo spazio e poi sulle desinenze più comuni — non è quello di un vero modello, ma il concetto (una stringa diventa una <em>lista di pezzi</em>, non un numero solo) è identico, ed è il motivo per cui "contare le parole" e "contare i token" non sono mai la stessa cosa.</p>
`, more: `
<p>I tokenizzatori veri (BPE - Byte Pair Encoding, WordPiece, SentencePiece, a seconda del modello) imparano il proprio vocabolario da un corpus enorme durante l'addestramento, fondendo iterativamente le coppie di caratteri/sottoparole più frequenti — è per questo che "overfitting" può diventare <code>["over", "fit", "ting"]</code>: quei tre pezzi sono risultati abbastanza frequenti nel corpus di addestramento da meritare un token proprio, mentre una parola rara verrebbe spezzata in pezzi ancora più piccoli, fino ai singoli caratteri nel caso estremo.</p>
<p>Lingue diverse tokenizzano in modo molto diseguale con lo stesso tokenizzatore: un tokenizzatore addestrato prevalentemente su inglese spesso spezza l'italiano (o altre lingue meno rappresentate nel corpus di training) in più token per la stessa quantità di testo — la stessa frase può costare significativamente più token in italiano che in inglese, un fattore concreto quando si stima il costo di un'applicazione multilingue.</p>
<p>La regola pratica "1 token ≈ 4 caratteri in inglese, un po' meno in altre lingue" è una stima approssimativa comune per fare calcoli di massima sul costo di un prompt, ma NON è affidabile: dipende dal tokenizzatore specifico del modello, dalla lingua, e dal tipo di testo (codice, prosa, numeri tendono a tokenizzare diversamente). Per un conteggio esatto serve sempre il tokenizzatore reale del modello che userai, non una stima a spanne.</p>
` },

    {
      type: "exercise", id: "llm-05", kg: 15, title: "Conta davvero i token",
      task: `<p>Con <code>tokenizza_mock</code> (già pronta):</p>
<ul>
<li><code>token_prompt</code>: la lista di token di <code>prompt</code></li>
<li><code>n_token</code>: quanti sono</li>
<li><code>vocabolario</code>: l'insieme (<code>set</code>) dei token <strong>distinti</strong> usati in tutte le frasi di <code>corpus</code> (un ciclo che aggiorna un set con <code>.update()</code>)</li>
</ul>`,
      setup: `def tokenizza_mock(testo):
    token = []
    for parola in testo.lower().replace(",", "").replace(".", "").split():
        if parola.endswith("mente") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##mente")
        elif parola.endswith("zione") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##zione")
        else:
            token.append(parola)
    return token

prompt = "La generazione automatica di testo funziona sorprendentemente bene."
corpus = ["Il modello genera testo.", "La classificazione e' rapida.", "Ottima generazione oggi."]`,
      starter: `# tokenizza_mock, prompt e corpus sono gia' pronti
token_prompt = ...
n_token = ...

vocabolario = set()
for frase in corpus:
    ...

print(token_prompt)
print(n_token)
print(vocabolario)`,
      check: `assert 'token_prompt' in globals() and "##zione" in token_prompt, "token_prompt: tokenizza_mock(prompt) — 'generazione' deve spezzarsi con il suffisso ##zione"
assert 'n_token' in globals() and n_token == len(token_prompt), "n_token: len(token_prompt)"
assert 'vocabolario' in globals() and "##zione" in vocabolario and "testo" in vocabolario, "vocabolario: aggiorna un set con vocabolario.update(tokenizza_mock(frase)) per ogni frase"`,
      hint: `<p>Nel ciclo: <code>vocabolario.update(tokenizza_mock(frase))</code> — <code>.update()</code> su un set aggiunge tutti gli elementi di una lista in un colpo, senza doppioni.</p>`,
      solution: `token_prompt = tokenizza_mock(prompt)
n_token = len(token_prompt)

vocabolario = set()
for frase in corpus:
    vocabolario.update(tokenizza_mock(frase))

print(token_prompt)
print(n_token)
print(vocabolario)`
    },

    { type: "theory", title: "Prompt template: il testo come funzione", html: `
<p>Un <strong>prompt template</strong> è una stringa con dei buchi, riempiti a runtime con dati diversi — esattamente come una funzione. È il mattone base di ogni applicazione seria sopra un LLM (e la base del RAG, nella prossima sala):</p>
<pre><code>template = """Rispondi alla domanda usando SOLO il contesto fornito.

Contesto: {contesto}
Domanda: {domanda}
Risposta:"""

prompt = template.format(contesto="Parigi e' la capitale della Francia.", domanda="Qual e' la capitale della Francia?")</code></pre>
<p>Separare template e dati (invece di scrivere ogni prompt a mano) rende il sistema testabile e riusabile: cambi i dati, il "programma" (le istruzioni) resta identico — la stessa filosofia delle funzioni con parametri.</p>
`, more: `
<p>Un template ben scritto è spesso il singolo fattore che più influenza la qualità dell'output di un LLM, più della scelta del modello stesso: istruzioni chiare su formato atteso, esempi (few-shot, prossima teoria), vincoli espliciti ("rispondi SOLO con...", "non inventare informazioni non presenti nel contesto") riducono drasticamente risposte fuori formato o inventate. La progettazione di questi template è spesso chiamata "prompt engineering" — una disciplina empirica più che teorica, fatta di iterazione e test.</p>
<p>Oltre a <code>.format()</code>, le f-string (viste nel riscaldamento) funzionano altrettanto bene per template semplici, ma perdono il vantaggio di poter salvare il template come STRINGA separata dai dati (una f-string valuta le variabili nel momento in cui viene scritta, un <code>.format()</code> le riceve dopo, potenzialmente da un file di configurazione o da input utente) — per template riusabili e configurabili, <code>.format()</code> o librerie dedicate (Jinja2) sono la scelta più solida.</p>
<p>Un rischio di sicurezza reale quando il template include dati provenienti da input utente non fidato: il <strong>prompt injection</strong>, dove un utente scrive un input che contiene istruzioni pensate per "confondere" il modello facendogli ignorare le istruzioni originali del <code>system</code> prompt (es. "ignora le istruzioni precedenti e fai X"). Non esiste una difesa perfetta, ma delimitare chiaramente dove finisce l'istruzione e dove inizia il dato dell'utente (con marcatori espliciti, validazione dell'output) riduce il rischio.</p>
` },

    {
      type: "exercise", id: "llm-06", kg: 15, title: "Il tuo primo template",
      task: `<p>Costruisci:</p>
<ul>
<li><code>template</code>: una stringa con due segnaposto, <code>{ruolo}</code> e <code>{compito}</code>, che formi la frase: <code>"Agisci come {ruolo} e svolgi questo compito: {compito}"</code></li>
<li><code>prompt_coach</code>: il template compilato con <code>ruolo="un personal trainer"</code> e <code>compito="crea una scheda per principianti"</code></li>
<li><code>prompt_nutrizionista</code>: lo stesso template compilato con valori diversi a tua scelta, purché contenga la parola "nutrizionista"</li>
</ul>`,
      starter: `template = "Agisci come {ruolo} e svolgi questo compito: {compito}"

prompt_coach = template.format(ruolo="un personal trainer", compito="crea una scheda per principianti")
prompt_nutrizionista = ...

print(prompt_coach)
print(prompt_nutrizionista)`,
      check: `assert 'template' in globals() and "{ruolo}" in template and "{compito}" in template, "template deve contenere i segnaposto {ruolo} e {compito}"
assert 'prompt_coach' in globals() and prompt_coach == "Agisci come un personal trainer e svolgi questo compito: crea una scheda per principianti", "prompt_coach: template.format(...) con i valori indicati"
assert 'prompt_nutrizionista' in globals() and "nutrizionista" in prompt_nutrizionista and prompt_nutrizionista.startswith("Agisci come"), "prompt_nutrizionista: usa lo stesso template, con 'nutrizionista' da qualche parte nei valori"`,
      hint: `<p><code>template.format(ruolo=..., compito=...)</code> sostituisce ogni segnaposto col valore passato per nome — stesso principio degli argomenti nominati di una funzione.</p>`,
      solution: `template = "Agisci come {ruolo} e svolgi questo compito: {compito}"

prompt_coach = template.format(ruolo="un personal trainer", compito="crea una scheda per principianti")
prompt_nutrizionista = template.format(ruolo="un nutrizionista sportivo", compito="proponi un piano alimentare")

print(prompt_coach)
print(prompt_nutrizionista)`
    },

    { type: "theory", title: "Fine-tuning leggero: LoRA e unsloth", html: `
<p>Ri-addestrare <em>tutti</em> i miliardi di parametri di un LLM per specializzarlo su un compito è quasi sempre proibitivo. <strong>LoRA</strong> (Low-Rank Adaptation) congela il modello originale e aggiunge poche matrici piccole e allenabili accanto ai layer esistenti: si addestra solo una frazione minima dei parametri totali, con risultati sorprendentemente vicini al fine-tuning completo.</p>
<pre><code>lora_config = {
    "r": 16,               # rango delle matrici aggiunte: piu' alto = piu' capacita', piu' memoria
    "lora_alpha": 32,       # fattore di scala dell'adattamento
    "target_modules": ["q_proj", "v_proj"],   # su quali layer applicarlo
}</code></pre>
<p><strong>unsloth</strong> è una libreria che rende questo processo drasticamente più veloce e leggero in memoria (fino a 2-5 volte), permettendo di fare fine-tuning LoRA anche su una singola GPU consumer — un'operazione che altrimenti richiederebbe hardware da data center. Il concetto centrale da portarsi via: <strong>meno parametri allenabili → meno memoria, meno tempo, meno dati necessari</strong>, spesso senza perdere quasi nulla in qualità.</p>
`, more: `
<p>Perché LoRA funziona nonostante congeli quasi tutto il modello: l'ipotesi (verificata empiricamente) è che l'"adattamento" necessario per specializzare un modello su un nuovo compito viva in uno spazio di dimensione molto più bassa di quanto suggerisca il numero enorme di parametri del modello originale — le matrici piccole aggiunte da LoRA (di "rango basso", da cui il nome) catturano quell'adattamento senza dover toccare i pesi originali, che restano la base di conoscenza generale.</p>
<p><code>QLoRA</code> (Quantized LoRA) è un'estensione ulteriore che comprime anche i pesi CONGELATI del modello originale a precisione numerica ridotta (es. 4 bit invece dei tipici 16 o 32) prima di applicare LoRA sopra — riduce drasticamente la memoria richiesta per il modello base, permettendo di fare fine-tuning di modelli molto grandi anche su una singola GPU consumer con pochi GB di VRAM, al prezzo di una piccola perdita di precisione numerica.</p>
<p>Il risultato di un fine-tuning LoRA non è un nuovo modello completo da salvare da zero: sono solo le piccole matrici aggiuntive (l'"adapter"), tipicamente qualche decina di MB invece dei gigabyte del modello intero. Questo permette di tenere UN modello base condiviso e switchare tra diversi adapter specializzati (uno per compito, uno per cliente) caricandoli e scaricandoli al volo, invece di duplicare l'intero modello per ogni variante — un vantaggio pratico enorme in produzione.</p>
` },

    {
      type: "exercise", id: "llm-07", kg: 20, title: "Quanto pesa un fine-tuning leggero?",
      task: `<p>Un modello ha <code>parametri_totali</code> parametri. Con LoRA, i parametri <strong>allenabili</strong> sono dati dalla funzione <code>parametri_lora(r, n_layer, dim)</code> già fornita. Calcola:</p>
<ul>
<li><code>allenabili</code>: i parametri allenabili con <code>r=16</code>, <code>n_layer=32</code>, <code>dim=4096</code></li>
<li><code>percentuale</code>: che percentuale di <code>parametri_totali</code> rappresentano (float, es. 0.5 per 0.5%)</li>
<li><code>config</code>: il dizionario <code>{"r": 16, "lora_alpha": 32, "target_modules": ["q_proj", "v_proj"]}</code></li>
<li><code>chiavi_richieste_presenti</code>: <code>True</code> se <code>config</code> contiene tutte e tre le chiavi <code>"r"</code>, <code>"lora_alpha"</code>, <code>"target_modules"</code> (verificalo col codice)</li>
</ul>`,
      setup: `def parametri_lora(r, n_layer, dim):
    # ogni layer aggiunge due matrici r x dim: un'approssimazione didattica realistica
    return n_layer * 2 * r * dim

parametri_totali = 7_000_000_000  # 7 miliardi, un modello "piccolo" tipico`,
      starter: `# parametri_lora e parametri_totali sono gia' pronti
allenabili = ...
percentuale = ...

config = {
    "r": 16,
    "lora_alpha": 32,
    "target_modules": ["q_proj", "v_proj"],
}
chiavi_richieste_presenti = ...

print(allenabili, f"{percentuale:.4f}%")
print(chiavi_richieste_presenti)`,
      check: `assert 'allenabili' in globals() and allenabili == 4194304, "allenabili: parametri_lora(16, 32, 4096) = 32 * 2 * 16 * 4096"
assert 'percentuale' in globals() and abs(percentuale - (4194304 / 7_000_000_000 * 100)) < 1e-9, "percentuale: allenabili / parametri_totali * 100"
assert percentuale < 0.1, "La percentuale deve essere piccolissima (sotto lo 0.1%): e' proprio il punto di LoRA"
assert 'chiavi_richieste_presenti' in globals() and chiavi_richieste_presenti == all(k in config for k in ["r", "lora_alpha", "target_modules"]), "chiavi_richieste_presenti: verifica con 'all(k in config for k in [...])', non scriverlo a mano"`,
      hint: `<p><code>allenabili = parametri_lora(16, 32, 4096)</code>, poi <code>percentuale = allenabili / parametri_totali * 100</code>. Per le chiavi: <code>all(k in config for k in ["r", "lora_alpha", "target_modules"])</code>.</p>`,
      solution: `allenabili = parametri_lora(16, 32, 4096)
percentuale = allenabili / parametri_totali * 100

config = {
    "r": 16,
    "lora_alpha": 32,
    "target_modules": ["q_proj", "v_proj"],
}
chiavi_richieste_presenti = all(k in config for k in ["r", "lora_alpha", "target_modules"])

print(allenabili, f"{percentuale:.4f}%")
print(chiavi_richieste_presenti)`
    },

    {
      type: "exercise", id: "llm-08", kg: 25, title: "Massimale: una chiamata robusta",
      task: `<p>Metti insieme tutto quello visto in questa sala. <code>chiama_modello_instabile</code> (già fornita) si comporta come una vera API: a volte solleva <code>RuntimeError("rate limit")</code>. Scrivi <code>chiama_con_retry(messaggi, tentativi=3)</code> che:</p>
<ul>
<li>Prova a chiamare <code>chiama_modello_instabile(messaggi)</code></li>
<li>Se solleva <code>RuntimeError</code>, riprova, fino a <code>tentativi</code> volte in totale</li>
<li>Se tutti i tentativi falliscono, restituisce <code>None</code> invece di far crollare il programma</li>
<li>Se riesce, restituisce <code>risposta["message"]["content"]</code></li>
</ul>
<p>Poi usala su <code>messaggi</code> (già pronto) e salva il risultato in <code>testo_finale</code>.</p>`,
      setup: `import random
random.seed(7)

def chiama_modello_instabile(messaggi):
    if random.random() < 0.6:
        raise RuntimeError("rate limit")
    return {"message": {"role": "assistant", "content": "Risposta arrivata al secondo/terzo tentativo."}}

messaggi = [{"role": "user", "content": "Ciao"}]`,
      starter: `def chiama_con_retry(messaggi, tentativi=3):
    for i in range(tentativi):
        try:
            risposta = chiama_modello_instabile(messaggi)
            return risposta["message"]["content"]
        except RuntimeError:
            ...
    return None

testo_finale = chiama_con_retry(messaggi)
print(testo_finale)`,
      check: `assert 'chiama_con_retry' in globals() and callable(chiama_con_retry), "Devi definire chiama_con_retry"
assert 'testo_finale' in globals() and testo_finale == "Risposta arrivata al secondo/terzo tentativo.", "Con il seed fissato a 7, i primi due tentativi falliscono ma il terzo riesce: la chiamata deve riuscire entro 3 tentativi"
import random as _r
_r.seed(3)
def _sempre_fallisce(m):
    raise RuntimeError("rate limit")
_bak = chiama_modello_instabile
globals()['chiama_modello_instabile'] = _sempre_fallisce
assert chiama_con_retry(messaggi, tentativi=3) is None, "Se TUTTI i tentativi falliscono, deve restituire None, non sollevare l'errore"
globals()['chiama_modello_instabile'] = _bak`,
      hint: `<p>Nel blocco <code>except RuntimeError:</code> non serve fare nulla di speciale (il ciclo <code>for</code> passa al tentativo successivo da solo) — basta un <code>pass</code> o semplicemente lasciare il ciclo continuare. Il <code>return None</code> dopo il ciclo scatta solo se nessun tentativo è riuscito.</p>`,
      solution: `def chiama_con_retry(messaggi, tentativi=3):
    for i in range(tentativi):
        try:
            risposta = chiama_modello_instabile(messaggi)
            return risposta["message"]["content"]
        except RuntimeError:
            pass
    return None

testo_finale = chiama_con_retry(messaggi)
print(testo_finale)`
    },

    { type: "theory", title: "Few-shot: insegnare con esempi nel prompt", html: `
<p>Il modo più semplice di migliorare la qualità di una risposta senza addestrare nulla: mostrare <strong>esempi</strong> del compito direttamente nel prompt (few-shot learning), invece di spiegarlo solo a parole (zero-shot).</p>
<pre><code>prompt = """Classifica il sentiment.

Testo: "Adoro questo prodotto"
Sentiment: positivo

Testo: "Non funziona per niente"
Sentiment: negativo

Testo: "{nuovo_testo}"
Sentiment:"""</code></pre>
<p>Il modello impara il <em>formato</em> della risposta attesa dagli esempi, non solo dall'istruzione — spesso basta 2-3 esempi ben scelti per migliorare drasticamente coerenza e formato dell'output.</p>
`, more: `
<p>La scelta degli esempi non è neutra: esempi troppo simili tra loro (tutti positivi, o tutti sullo stesso argomento) rischiano di far "copiare" un pattern superficiale al modello invece di generalizzare davvero — buona pratica è coprire con gli esempi la VARIETÀ dei casi attesi (positivo, negativo, ambiguo; corto, lungo; diversi argomenti), non solo il numero minimo per far capire il formato.</p>
<p>L'ordine degli esempi in un prompt few-shot può influenzare il risultato più di quanto ci si aspetterebbe (un fenomeno documentato nella ricerca su questi modelli): mettere l'esempio più simile al caso da risolvere per ultimo, appena prima della domanda vera, spesso aiuta — è un dettaglio empirico da testare caso per caso, non una regola assoluta.</p>
<p>Il few-shot è il gradino intermedio tra zero-shot (nessun esempio, solo istruzioni) e il fine-tuning vero (LoRA, visto nella teoria precedente): non richiede addestramento, costa solo qualche token in più ad ogni chiamata, ma è meno "profondo" di un fine-tuning — non cambia il comportamento del modello in modo permanente, va ripetuto ad ogni chiamata. Per compiti che si ripetono migliaia di volte con lo stesso pattern, il fine-tuning diventa spesso più economico nel lungo periodo, nonostante il costo iniziale più alto.</p>
` },

    {
      type: "exercise", id: "llm-09", kg: 15, title: "Costruisci un prompt few-shot",
      task: `<p>Costruisci <code>prompt_few_shot</code> concatenando: due esempi già pronti (<code>esempio1</code>, <code>esempio2</code>) e la domanda finale su <code>nuovo_testo</code>, separati da riga vuota. Usa il <code>template</code> fornito.</p>`,
      starter: `template = 'Testo: "{testo}"\\nSentiment: {sentiment}'

esempio1 = template.format(testo="Adoro questo prodotto", sentiment="positivo")
esempio2 = template.format(testo="Non funziona per niente", sentiment="negativo")
domanda = 'Testo: "Consegna puntuale, tutto ok"\\nSentiment:'

prompt_few_shot = "\\n\\n".join([esempio1, esempio2, domanda])
print(prompt_few_shot)`,
      check: `assert prompt_few_shot.count("Sentiment:") == 3
assert "positivo" in prompt_few_shot and "negativo" in prompt_few_shot
assert prompt_few_shot.strip().endswith("Sentiment:")`,
      hint: `<p>La domanda finale termina con <code>"Sentiment:"</code> senza risposta: è lì che il modello dovrà completare, seguendo il pattern visto negli esempi.</p>`,
      solution: `template = 'Testo: "{testo}"\\nSentiment: {sentiment}'

esempio1 = template.format(testo="Adoro questo prodotto", sentiment="positivo")
esempio2 = template.format(testo="Non funziona per niente", sentiment="negativo")
domanda = 'Testo: "Consegna puntuale, tutto ok"\\nSentiment:'

prompt_few_shot = "\\n\\n".join([esempio1, esempio2, domanda])
print(prompt_few_shot)`
    },

    { type: "theory", title: "Il contesto ha un limite: troncare la cronologia", html: `
<p>Ogni modello ha una <strong>finestra di contesto</strong> massima (in token): oltre quella soglia, i messaggi più vecchi vanno tagliati per far spazio ai nuovi. Una strategia semplice e comune: tieni sempre il <code>system</code> prompt, poi solo gli ultimi N messaggi della conversazione.</p>
<pre><code>def tronca_storico(messaggi, max_messaggi=4):
    sistema = [m for m in messaggi if m["role"] == "system"]
    resto = [m for m in messaggi if m["role"] != "system"]
    return sistema + resto[-max_messaggi:]</code></pre>
<p>Perdere il system prompt sarebbe peggio che perdere qualche turno di conversazione: per questo va sempre preservato esplicitamente, invece di essere soggetto al taglio automatico.</p>
`, more: `
<p>Il taglio "per numero di messaggi" (visto nell'esercizio di questa sala) è la strategia più semplice ma non l'unica: un troncamento più preciso lavora per numero di TOKEN (non di messaggi), perché due conversazioni con lo stesso numero di turni possono avere lunghezze in token molto diverse — un messaggio con un lungo paragrafo di codice pesa molto più di uno con "ok, grazie".</p>
<p>Una strategia più sofisticata della semplice troncatura è il <strong>riassunto progressivo</strong>: invece di scartare del tutto i messaggi più vecchi, li si fa riassumere dal modello stesso in poche frasi, e si sostituisce quel blocco di storia con il riassunto — si perde dettaglio ma si conserva il "senso" della conversazione precedente occupando molti meno token del testo originale integrale.</p>
<p>Alcune applicazioni con conversazioni molto lunghe (assistenti che devono "ricordare" informazioni su sessioni distanti nel tempo) usano una <strong>memoria esterna</strong> invece di rimandare tutto nel contesto: fatti rilevanti vengono estratti e salvati in un database (spesso vettoriale, concetto che approfondirai nella sala RAG) e recuperati solo quando pertinenti al turno corrente — un'architettura più complessa del semplice troncamento, ma necessaria oltre una certa scala di conversazione.</p>
` },

    {
      type: "exercise", id: "llm-10", kg: 20, title: "Tronca la cronologia",
      task: `<p>Scrivi <code>tronca_storico(messaggi, max_messaggi)</code>: tiene il messaggio <code>system</code> (se c'è) più gli ultimi <code>max_messaggi</code> messaggi non-system. Applicala a <code>conversazione</code> con <code>max_messaggi=2</code>.</p>`,
      starter: `def tronca_storico(messaggi, max_messaggi):
    sistema = [m for m in messaggi if m["role"] == "system"]
    resto = [m for m in messaggi if m["role"] != "system"]
    return sistema + resto[-max_messaggi:]

conversazione = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Turno 1"},
    {"role": "assistant", "content": "Risposta 1"},
    {"role": "user", "content": "Turno 2"},
    {"role": "assistant", "content": "Risposta 2"},
    {"role": "user", "content": "Turno 3"},
]

troncata = tronca_storico(conversazione, 2)
print(troncata)`,
      check: `assert len(troncata) == 3
assert troncata[0]["role"] == "system"
assert troncata[-1]["content"] == "Turno 3"
assert troncata[1]["content"] == "Risposta 2"`,
      hint: `<p>Il system prompt va sempre in testa al risultato, indipendentemente da dove si trovava nell'originale; gli ultimi 2 non-system sono "Risposta 2" e "Turno 3".</p>`,
      solution: `def tronca_storico(messaggi, max_messaggi):
    sistema = [m for m in messaggi if m["role"] == "system"]
    resto = [m for m in messaggi if m["role"] != "system"]
    return sistema + resto[-max_messaggi:]

conversazione = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Turno 1"},
    {"role": "assistant", "content": "Risposta 1"},
    {"role": "user", "content": "Turno 2"},
    {"role": "assistant", "content": "Risposta 2"},
    {"role": "user", "content": "Turno 3"},
]

troncata = tronca_storico(conversazione, 2)
print(troncata)`
    },

    {
      type: "exercise", id: "llm-11", kg: 20, title: "Quanti documenti entrano nel budget?",
      task: `<p>Hai <code>documenti</code> (testo, token stimati) e un <code>budget</code> di token. Scrivi <code>seleziona_per_budget(documenti, budget)</code>: aggiunge documenti in ordine finché il totale non supererebbe il budget (greedy, si ferma al primo che non entra più), restituisce la lista scelta.</p>`,
      starter: `documenti = [
    {"testo": "doc1", "token": 500},
    {"testo": "doc2", "token": 300},
    {"testo": "doc3", "token": 800},
    {"testo": "doc4", "token": 200},
]
budget = 1000

def seleziona_per_budget(documenti, budget):
    scelti = []
    totale = 0
    for d in documenti:
        if totale + d["token"] <= budget:
            scelti.append(d)
            totale += d["token"]
    return scelti

scelti = seleziona_per_budget(documenti, budget)
print([d["testo"] for d in scelti])`,
      check: `assert [d["testo"] for d in scelti] == ["doc1", "doc2", "doc4"]`,
      hint: `<p>doc1 (500) entra, doc2 (300) porta il totale a 800, doc3 (800) NON entra (supererebbe 1000), ma il ciclo continua e doc4 (200) entra: 800+200=1000, al limite esatto.</p>`,
      solution: `documenti = [
    {"testo": "doc1", "token": 500},
    {"testo": "doc2", "token": 300},
    {"testo": "doc3", "token": 800},
    {"testo": "doc4", "token": 200},
]
budget = 1000

def seleziona_per_budget(documenti, budget):
    scelti = []
    totale = 0
    for d in documenti:
        if totale + d["token"] <= budget:
            scelti.append(d)
            totale += d["token"]
    return scelti

scelti = seleziona_per_budget(documenti, budget)
print([d["testo"] for d in scelti])`
    },

    {
      type: "exercise", id: "llm-12", kg: 20, title: "Classifica un batch di ticket",
      task: `<p>Con <code>classifica_mock</code> (stessa firma vista prima, fornita nel setup): classifica tutti i <code>ticket</code>, conta quanti sono NEGATIVE, e trova <code>ticket_piu_critico</code> (il NEGATIVE con score più alto — il caso su cui il modello è più sicuro che qualcosa vada male).</p>`,
      setup: `PAROLE_POSITIVE = {"ottimo", "perfetto", "grazie", "risolto"}
PAROLE_NEGATIVE = {"rotto", "pessimo", "bloccato", "urgente"}

def classifica_mock(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    n_pos = len(parole & PAROLE_POSITIVE)
    n_neg = len(parole & PAROLE_NEGATIVE)
    if n_pos >= n_neg:
        return [{"label": "POSITIVE", "score": 0.6 + 0.1 * n_pos}]
    return [{"label": "NEGATIVE", "score": 0.6 + 0.1 * n_neg}]

ticket = [
    "Grazie, tutto risolto perfetto",
    "Il servizio e' bloccato e rotto urgente",
    "Tutto ok nella norma",
    "Sistema bloccato serve intervento urgente",
]`,
      starter: `# classifica_mock e ticket sono gia' pronti
risultati = [classifica_mock(t)[0] for t in ticket]
n_negativi = sum(1 for r in risultati if r["label"] == "NEGATIVE")

negativi_idx = [i for i, r in enumerate(risultati) if r["label"] == "NEGATIVE"]
idx_critico = max(negativi_idx, key=lambda i: risultati[i]["score"])
ticket_piu_critico = ticket[idx_critico]

print(n_negativi)
print(ticket_piu_critico)`,
      check: `assert n_negativi == 2
assert ticket_piu_critico == "Il servizio e' bloccato e rotto urgente"`,
      hint: `<p>Il ticket più critico ha 3 parole negative ("bloccato", "rotto", "urgente") contro le 2 dell'altro ticket negativo: score più alto.</p>`,
      solution: `risultati = [classifica_mock(t)[0] for t in ticket]
n_negativi = sum(1 for r in risultati if r["label"] == "NEGATIVE")

negativi_idx = [i for i, r in enumerate(risultati) if r["label"] == "NEGATIVE"]
idx_critico = max(negativi_idx, key=lambda i: risultati[i]["score"])
ticket_piu_critico = ticket[idx_critico]

print(n_negativi)
print(ticket_piu_critico)`
    },

    { type: "theory", title: "Output strutturato: chiedere JSON", html: `
<p>Spesso non vuoi testo libero ma dati strutturati da usare nel resto del programma. Molte API permettono di chiedere output in <strong>JSON</strong>, che poi si analizza con <code>json.loads</code>:</p>
<pre><code>import json
risposta_testo = '{"sentiment": "positivo", "confidenza": 0.92}'
dati = json.loads(risposta_testo)
dati["sentiment"]   # "positivo" — ora e' un dizionario Python vero</code></pre>
<p>Attenzione: un modello può restituire JSON leggermente malformato (virgolette sbagliate, virgole in più). Un <code>try/except json.JSONDecodeError</code> attorno al parsing è disciplina base per qualsiasi integrazione reale.</p>
`, more: `
<p>Molte API di modelli moderni offrono una modalità dedicata (spesso chiamata "JSON mode" o "structured output") che vincola il modello a generare SOLO JSON sintatticamente valido, invece di sperare che lo faccia bene chiedendolo solo nel prompt — un livello di garanzia più forte del semplice "per favore rispondi in JSON" scritto a parole, perché la restrizione avviene durante la generazione stessa, non dopo.</p>
<p>Anche con "JSON mode" attivo, il JSON può essere sintatticamente valido ma semanticamente sbagliato: campi mancanti, tipi inattesi (una stringa dove ti aspettavi un numero), valori fuori dal range plausibile. Una validazione robusta va oltre <code>json.loads</code>: librerie come <code>pydantic</code> permettono di definire uno SCHEMA atteso (nomi di campo, tipi) e validare automaticamente la struttura, sollevando errori chiari quando qualcosa non corrisponde — un livello di difesa in più oltre al semplice parsing.</p>
<p>Un pattern robusto per output strutturato in produzione combina più livelli di difesa: 1) chiedere JSON esplicitamente nel prompt con un esempio del formato atteso (few-shot), 2) usare la JSON mode dell'API se disponibile, 3) validare la struttura con uno schema dopo il parsing, 4) avere una strategia di fallback (ritentare, o restituire un default) quando anche dopo tutto questo il risultato non è utilizzabile — nessun singolo livello da solo è sufficientemente affidabile per un sistema che deve funzionare senza supervisione umana costante.</p>
` },

    {
      type: "exercise", id: "llm-13", kg: 20, title: "Analizza la risposta JSON",
      task: `<p>Scrivi <code>estrai_sentiment(risposta_testo)</code>: prova a fare <code>json.loads</code> e restituire il campo <code>"sentiment"</code>; se il parsing fallisce (<code>json.JSONDecodeError</code>), restituisce <code>"sconosciuto"</code>. Testala su una risposta valida e una malformata.</p>`,
      starter: `import json

def estrai_sentiment(risposta_testo):
    try:
        dati = json.loads(risposta_testo)
        return dati["sentiment"]
    except json.JSONDecodeError:
        return "sconosciuto"

valida = '{"sentiment": "positivo", "confidenza": 0.92}'
malformata = "{sentiment: positivo}"

r1 = estrai_sentiment(valida)
r2 = estrai_sentiment(malformata)

print(r1, r2)`,
      check: `assert r1 == "positivo"
assert r2 == "sconosciuto"`,
      hint: `<p><code>{sentiment: positivo}</code> non è JSON valido (le chiavi devono avere le virgolette doppie): <code>json.loads</code> lo rifiuta con un'eccezione, che il <code>try/except</code> intercetta.</p>`,
      solution: `import json

def estrai_sentiment(risposta_testo):
    try:
        dati = json.loads(risposta_testo)
        return dati["sentiment"]
    except json.JSONDecodeError:
        return "sconosciuto"

valida = '{"sentiment": "positivo", "confidenza": 0.92}'
malformata = "{sentiment: positivo}"

r1 = estrai_sentiment(valida)
r2 = estrai_sentiment(malformata)

print(r1, r2)`
    },

    { type: "theory", title: "Function calling: il modello che chiede aiuto", html: `
<p>Le API moderne permettono di descrivere <strong>strumenti</strong> (funzioni) disponibili al modello: invece di rispondere a parole, il modello può decidere di "chiamare" uno strumento passandogli argomenti — che poi il TUO codice esegue davvero.</p>
<pre><code>tool_schema = {
    "name": "get_meteo",
    "description": "Restituisce il meteo attuale per una citta'",
    "parameters": {"citta": "string"},
}
# il modello risponde con qualcosa come:
chiamata = {"tool": "get_meteo", "argomenti": {"citta": "Roma"}}</code></pre>
<p>Il modello non esegue mai nulla da solo: decide <em>quale</em> funzione chiamare e <em>con quali argomenti</em>, e restituisce quella decisione in un formato strutturato — sei tu (il codice) a eseguirla davvero e a restituire il risultato in un turno successivo.</p>
`, more: `
<p>Il ciclo completo del function calling è multi-turno: 1) mandi al modello la domanda dell'utente più la lista di strumenti disponibili (con nome, descrizione, parametri attesi), 2) il modello risponde con una richiesta di chiamata invece che con del testo, 3) il TUO codice esegue davvero la funzione, 4) il risultato viene rimandato al modello come un nuovo messaggio (spesso con ruolo <code>tool</code>, visto nella teoria sui messaggi), 5) il modello genera la risposta finale in linguaggio naturale usando quel risultato. Sono quindi almeno due chiamate al modello per ogni "uso di strumento", non una sola.</p>
<p>Il modello decide autonomamente SE serve uno strumento e QUALE, basandosi sulla domanda dell'utente e sulle descrizioni degli strumenti forniti — descrizioni vaghe o ambigue portano a scelte sbagliate (il modello sceglie lo strumento sbagliato, o inventa argomenti plausibili ma non richiesti dall'utente); descrizioni precise, con esempi di quando usare ogni strumento, migliorano drasticamente l'affidabilità.</p>
<p>Un rischio pratico da non sottovalutare: se uno strumento ha effetti collaterali reali (inviare un'email, cancellare un file, eseguire un pagamento), eseguirlo automaticamente sulla sola decisione del modello — senza conferma umana — può essere pericoloso in caso di allucinazioni o interpretazioni sbagliate della richiesta. Sistemi di produzione seri spesso richiedono una conferma esplicita dell'utente prima di eseguire strumenti con conseguenze irreversibili.</p>
` },

    {
      type: "exercise", id: "llm-14", kg: 25, title: "Esegui la chiamata decisa dal modello",
      task: `<p>Con <code>chiamata</code> (la decisione del modello, già pronta) e un dizionario <code>strumenti_disponibili</code> (nome→funzione reale): scrivi <code>esegui_chiamata(chiamata, strumenti_disponibili)</code> che invoca la funzione giusta con gli argomenti giusti, o restituisce <code>None</code> se lo strumento richiesto non esiste.</p>`,
      starter: `def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

strumenti_disponibili = {"get_meteo": get_meteo}
chiamata = {"tool": "get_meteo", "argomenti": {"citta": "Roma"}}

def esegui_chiamata(chiamata, strumenti_disponibili):
    funzione = strumenti_disponibili.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

risultato = esegui_chiamata(chiamata, strumenti_disponibili)
chiamata_sconosciuta = {"tool": "get_borsa", "argomenti": {}}
risultato_sconosciuto = esegui_chiamata(chiamata_sconosciuta, strumenti_disponibili)

print(risultato)
print(risultato_sconosciuto)`,
      check: `assert risultato == "soleggiato"
assert risultato_sconosciuto is None`,
      hint: `<p><code>funzione(**chiamata["argomenti"])</code> spacchetta il dizionario di argomenti in parametri nominati — se <code>argomenti</code> è <code>{"citta": "Roma"}</code>, equivale a chiamare <code>funzione(citta="Roma")</code>.</p>`,
      solution: `def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

strumenti_disponibili = {"get_meteo": get_meteo}
chiamata = {"tool": "get_meteo", "argomenti": {"citta": "Roma"}}

def esegui_chiamata(chiamata, strumenti_disponibili):
    funzione = strumenti_disponibili.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

risultato = esegui_chiamata(chiamata, strumenti_disponibili)
chiamata_sconosciuta = {"tool": "get_borsa", "argomenti": {}}
risultato_sconosciuto = esegui_chiamata(chiamata_sconosciuta, strumenti_disponibili)

print(risultato)
print(risultato_sconosciuto)`
    },

    { type: "theory", title: "Embedding: il significato come vettore", html: `
<p>Un <strong>embedding</strong> trasforma un testo in un vettore di numeri, costruito in modo che testi con significato simile abbiano vettori "vicini" (stessa idea del TF-IDF che vedrai nella sala RAG, ma qui il vettore cattura il <em>significato</em>, non solo le parole condivise). La vicinanza si misura di nuovo con la <strong>similarità del coseno</strong>:</p>
<pre><code>import numpy as np
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))</code></pre>
<p>Qui simuliamo embedding "giocattolo" con vettori scritti a mano, ma la formula della similarità è quella vera, usata identica sia con TF-IDF sia con veri embedding neurali.</p>
`, more: `
<p>Gli embedding veri hanno tipicamente centinaia o migliaia di dimensioni (non 2 come nell'esempio giocattolo), imparate da un modello addestrato specificamente a mettere vicino nello spazio vettoriale testi semanticamente simili — anche se non condividono NEMMENO UNA parola in comune. "Il gatto dorme sul divano" e "Il felino riposa sul sofà" avrebbero embedding molto vicini nonostante zero parole condivise, un salto qualitativo enorme rispetto al TF-IDF (che vedrai nella sala RAG), che invece si basa sulla sovrapposizione letterale di parole.</p>
<p>Gli embedding sono il mattone su cui si costruisce la <strong>ricerca semantica</strong>: invece di cercare parole chiave esatte in un database, si trasforma la query in un embedding e si cercano i documenti con embedding più vicino — è esattamente il meccanismo alla base dei database vettoriali che vedrai nella sala RAG, applicato qui a similarità coseno calcolata a mano.</p>
<p>La similarità coseno misura solo la DIREZIONE dei due vettori, ignorandone la magnitudine (lunghezza) — due vettori paralleli ma di lunghezza diversa hanno similarità coseno 1.0. Questo è deliberato per gli embedding testuali: la "direzione" cattura il significato, mentre la magnitudine spesso riflette solo quanto è lungo il testo originale, un'informazione che di solito non vuoi che influenzi il confronto di similarità.</p>
` },

    {
      type: "exercise", id: "llm-15", kg: 20, title: "Chi è più simile a chi?",
      task: `<p>Con tre embedding giocattolo (2D, per semplicità) di altrettante frasi: calcola la similarità coseno di <code>query_vec</code> con ciascuno, trova <code>indice_piu_simile</code>.</p>`,
      starter: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

frasi = ["il gatto dorme", "il cane corre", "il gatto gioca"]
embedding = [np.array([0.9, 0.1]), np.array([0.1, 0.9]), np.array([0.85, 0.2])]
query_vec = np.array([0.95, 0.05])

similarita = [cosine_sim(query_vec, e) for e in embedding]
indice_piu_simile = int(np.argmax(similarita))

print([round(s, 3) for s in similarita])
print(frasi[indice_piu_simile])`,
      check: `assert indice_piu_simile == 0
assert frasi[indice_piu_simile] == "il gatto dorme"`,
      hint: `<p>Il vettore query è quasi identico (direzione) al primo embedding: la similarità coseno lo riconosce anche se i numeri non sono uguali, perché guarda solo la direzione.</p>`,
      solution: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

frasi = ["il gatto dorme", "il cane corre", "il gatto gioca"]
embedding = [np.array([0.9, 0.1]), np.array([0.1, 0.9]), np.array([0.85, 0.2])]
query_vec = np.array([0.95, 0.05])

similarita = [cosine_sim(query_vec, e) for e in embedding]
indice_piu_simile = int(np.argmax(similarita))

print([round(s, 3) for s in similarita])
print(frasi[indice_piu_simile])`
    },

    { type: "theory", title: "Streaming: la risposta a pezzi", html: `
<p>Le interfacce chat moderne mostrano la risposta parola per parola mentre arriva, invece di aspettare il testo completo: è lo <strong>streaming</strong>. L'API restituisce un flusso di piccoli pezzi (chunk) che vanno concatenati:</p>
<pre><code>chunks = ["Cia", "o, c", "ome", " posso", " aiutarti?"]
testo_completo = "".join(chunks)</code></pre>
<p>Lato utente migliora solo la percezione di velocità (il modello non è più veloce, la prima parola arriva prima); lato codice, serve gestire l'accumulo dei pezzi invece di un singolo valore di ritorno.</p>
`, more: `
<p>Nel codice reale, lo streaming non arriva come una lista già pronta (come nell'esempio semplificato di questa sala) ma come un <strong>iteratore</strong>: <code>for chunk in client.chat(messages=..., stream=True): print(chunk["message"]["content"], end="")</code> — ogni iterazione del ciclo riceve un pezzo nuovo appena disponibile, e stamparlo subito (con <code>end=""</code> per non andare a capo) produce l'effetto "digitazione in tempo reale" delle chat moderne.</p>
<p>Un dettaglio tecnico da gestire: i chunk non corrispondono necessariamente a parole intere o a token singoli — un chunk può contenere mezza parola, più parole, o anche solo un carattere, a seconda di come il server decide di raggruppare l'output. Il codice che consuma lo streaming non deve mai assumere che ogni chunk sia un'unità linguistica sensata: va sempre trattato come testo grezzo da concatenare, e solo il risultato FINALE va tokenizzato o analizzato (esattamente il punto dell'esercizio "stampa lo streaming e conta le parole" di questa sala).</p>
<p>Lo streaming complica il function calling e l'output JSON strutturato (visti in altre teorie di questa sala): se il modello sta generando JSON pezzo per pezzo, il JSON parziale accumulato fino a un certo punto non è quasi mai sintatticamente valido finché non arriva l'ultimo chunk — per questo motivo, spesso si disabilita lo streaming quando serve un output strutturato completo da validare, oppure si usano parser JSON "streaming-aware" più sofisticati che sanno gestire input incompleti.</p>
` },

    {
      type: "exercise", id: "llm-16", kg: 15, title: "Ricomponi la risposta in streaming",
      task: `<p>Con <code>chunks</code> (pezzi di risposta, nell'ordine di arrivo): <code>testo_completo</code> (concatenazione), <code>n_chunk</code> (quanti pezzi).</p>`,
      starter: `chunks = ["Il ", "modello ", "genera ", "token ", "uno ", "alla ", "volta."]

testo_completo = "".join(chunks)
n_chunk = len(chunks)

print(testo_completo)
print(n_chunk)`,
      check: `assert testo_completo == "Il modello genera token uno alla volta."
assert n_chunk == 7`,
      hint: `<p><code>"".join(lista)</code> concatena tutti gli elementi senza separatore.</p>`,
      solution: `chunks = ["Il ", "modello ", "genera ", "token ", "uno ", "alla ", "volta."]

testo_completo = "".join(chunks)
n_chunk = len(chunks)

print(testo_completo)
print(n_chunk)`
    },

    {
      type: "exercise", id: "llm-17", kg: 20, title: "Combo: stampa lo streaming e conta le parole",
      task: `<p>Su <code>chunks</code> (di nuovo): ricomponi il testo, poi <code>n_parole</code> (conteggio parole nel testo completo), <code>prima_parola</code>.</p>`,
      starter: `chunks = ["Il futuro ", "dei modelli ", "linguistici ", "e' promettente."]

testo = "".join(chunks)
parole = testo.split()
n_parole = len(parole)
prima_parola = parole[0]

print(testo)
print(n_parole, prima_parola)`,
      check: `assert n_parole == 7
assert prima_parola == "Il"`,
      hint: `<p>Prima ricomponi con <code>.join</code>, POI tokenizza con <code>.split()</code>: l'ordine conta, non puoi contare le parole sui pezzi grezzi (potrebbero spezzare una parola a metà).</p>`,
      solution: `chunks = ["Il futuro ", "dei modelli ", "linguistici ", "e' promettente."]

testo = "".join(chunks)
parole = testo.split()
n_parole = len(parole)
prima_parola = parole[0]

print(testo)
print(n_parole, prima_parola)`
    },

    {
      type: "exercise", id: "llm-18", kg: 20, title: "Combo: cache delle risposte",
      task: `<p>Chiamare un modello costa (tempo, soldi): una <strong>cache</strong> evita di richiamarlo per la stessa domanda. Scrivi <code>chiama_con_cache(domanda, cache, chiama_modello)</code>: se <code>domanda</code> è già in <code>cache</code>, restituisce quella; altrimenti chiama <code>chiama_modello(domanda)</code>, salva il risultato in cache, e lo restituisce.</p>`,
      starter: `chiamate_reali = 0

def chiama_modello_costoso(domanda):
    global chiamate_reali
    chiamate_reali += 1
    return f"Risposta a: {domanda}"

def chiama_con_cache(domanda, cache, chiama_modello):
    if domanda in cache:
        return cache[domanda]
    risposta = chiama_modello(domanda)
    cache[domanda] = risposta
    return risposta

cache = {}
r1 = chiama_con_cache("Ciao", cache, chiama_modello_costoso)
r2 = chiama_con_cache("Ciao", cache, chiama_modello_costoso)
r3 = chiama_con_cache("Come stai?", cache, chiama_modello_costoso)

print(chiamate_reali)
print(r1 == r2)`,
      check: `assert chiamate_reali == 2, "La seconda chiamata con la STESSA domanda deve usare la cache, non richiamare il modello: solo 2 chiamate reali su 3 richieste"
assert r1 == r2`,
      hint: `<p>La seconda chiamata a "Ciao" trova la domanda già in cache e non incrementa <code>chiamate_reali</code>: verifica che la funzione controlli la cache PRIMA di chiamare il modello.</p>`,
      solution: `chiamate_reali = 0

def chiama_modello_costoso(domanda):
    global chiamate_reali
    chiamate_reali += 1
    return f"Risposta a: {domanda}"

def chiama_con_cache(domanda, cache, chiama_modello):
    if domanda in cache:
        return cache[domanda]
    risposta = chiama_modello(domanda)
    cache[domanda] = risposta
    return risposta

cache = {}
r1 = chiama_con_cache("Ciao", cache, chiama_modello_costoso)
r2 = chiama_con_cache("Ciao", cache, chiama_modello_costoso)
r3 = chiama_con_cache("Come stai?", cache, chiama_modello_costoso)

print(chiamate_reali)
print(r1 == r2)`
    },

    {
      type: "exercise", id: "llm-19", kg: 20, title: "Combo: stima del costo di una conversazione",
      task: `<p>Con <code>tokenizza_mock</code> (fornita) e una lista di <code>messaggi</code>: <code>costo_totale</code>, il numero di token totali di tutti i <code>content</code> insieme, sapendo che ogni token costa <code>0.0001</code> — <code>costo_euro</code>.</p>`,
      setup: `def tokenizza_mock(testo):
    token = []
    for parola in testo.lower().replace(",", "").replace(".", "").split():
        if parola.endswith("mente") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##mente")
        elif parola.endswith("zione") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##zione")
        else:
            token.append(parola)
    return token`,
      starter: `# tokenizza_mock e' gia' pronta
messaggi = [
    {"role": "system", "content": "Sei un assistente utile."},
    {"role": "user", "content": "Spiega la generazione automatica di testo."},
    {"role": "assistant", "content": "La generazione automatica produce testo token per token."},
]

n_token_totali = sum(len(tokenizza_mock(m["content"])) for m in messaggi)
costo_euro = n_token_totali * 0.0001

print(n_token_totali)
print(round(costo_euro, 5))`,
      check: `assert n_token_totali > 0
assert abs(costo_euro - n_token_totali * 0.0001) < 1e-9`,
      hint: `<p><code>sum(... for m in messaggi)</code> somma i token di OGNI messaggio della conversazione, non solo dell'ultimo.</p>`,
      solution: `messaggi = [
    {"role": "system", "content": "Sei un assistente utile."},
    {"role": "user", "content": "Spiega la generazione automatica di testo."},
    {"role": "assistant", "content": "La generazione automatica produce testo token per token."},
]

n_token_totali = sum(len(tokenizza_mock(m["content"])) for m in messaggi)
costo_euro = n_token_totali * 0.0001

print(n_token_totali)
print(round(costo_euro, 5))`
    },

    {
      type: "exercise", id: "llm-20", kg: 25, title: "Combo: instrada il ticket al team giusto",
      task: `<p>Costruisci un router basato su parole chiave: <code>instrada(testo)</code> restituisce <code>"fatturazione"</code> se contiene parole come "pagamento"/"fattura"/"rimborso", <code>"tecnico"</code> se contiene "bug"/"errore"/"non funziona", altrimenti <code>"generale"</code>. Applica a una lista di ticket.</p>`,
      starter: `PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

ticket = [
    "Non ho ricevuto la fattura di questo mese",
    "L'app ha un bug nella schermata di login",
    "Vorrei informazioni sui vostri orari",
    "Il pagamento e' stato addebitato due volte",
]

instradamenti = [instrada(t) for t in ticket]
print(instradamenti)`,
      check: `assert instradamenti == ["fatturazione", "tecnico", "generale", "fatturazione"]`,
      hint: `<p>L'ordine dei controlli conta quando un testo potrebbe contenere parole di più categorie: qui si controlla prima "fatturazione", poi "tecnico".</p>`,
      solution: `PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

ticket = [
    "Non ho ricevuto la fattura di questo mese",
    "L'app ha un bug nella schermata di login",
    "Vorrei informazioni sui vostri orari",
    "Il pagamento e' stato addebitato due volte",
]

instradamenti = [instrada(t) for t in ticket]
print(instradamenti)`
    },

    {
      type: "exercise", id: "llm-21", kg: 25, title: "Combo: confronta due embedding testuali",
      task: `<p>Con embedding giocattolo di 4 frasi: costruisci <code>matrice_similarita</code>, una matrice 4×4 dove <code>[i,j]</code> è la similarità coseno tra frase i e frase j (usa un doppio ciclo). La diagonale deve essere ~1 (ogni frase è identica a se stessa).</p>`,
      starter: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding = [np.array([1,0]), np.array([0.9,0.1]), np.array([0,1]), np.array([0.1,0.9])]

n = len(embedding)
matrice_similarita = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_similarita[i, j] = cosine_sim(embedding[i], embedding[j])

print(matrice_similarita.round(3))`,
      check: `import numpy as np
assert matrice_similarita.shape == (4, 4)
assert np.allclose(np.diag(matrice_similarita), 1.0, atol=1e-6)
assert matrice_similarita[0, 1] > matrice_similarita[0, 2], "La frase 0 deve essere piu' simile alla 1 (vicina in direzione) che alla 2 (quasi opposta)"`,
      hint: `<p>Il doppio ciclo <code>for i ... for j ...</code> riempie ogni cella della matrice confrontando ogni coppia di embedding, inclusa una frase con se stessa (da cui la diagonale a 1).</p>`,
      solution: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding = [np.array([1,0]), np.array([0.9,0.1]), np.array([0,1]), np.array([0.1,0.9])]

n = len(embedding)
matrice_similarita = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_similarita[i, j] = cosine_sim(embedding[i], embedding[j])

print(matrice_similarita.round(3))`
    },

    {
      type: "exercise", id: "llm-22", kg: 25, title: "Massimale: valida la configurazione LoRA",
      task: `<p>Scrivi <code>valida_lora_config(config)</code>: restituisce una lista di problemi controllando che <code>r</code> sia una potenza di 2 tra 4 e 64, che <code>lora_alpha</code> sia almeno <code>r</code>, e che <code>target_modules</code> non sia vuoto. Testala su una config valida e una non valida.</p>`,
      starter: `def valida_lora_config(config):
    problemi = []
    r = config.get("r", 0)
    if r not in [4, 8, 16, 32, 64]:
        problemi.append("r deve essere una potenza di 2 tra 4 e 64")
    if config.get("lora_alpha", 0) < r:
        problemi.append("lora_alpha dovrebbe essere almeno pari a r")
    if not config.get("target_modules"):
        problemi.append("target_modules non puo' essere vuoto")
    return problemi

buona = {"r": 16, "lora_alpha": 32, "target_modules": ["q_proj", "v_proj"]}
cattiva = {"r": 10, "lora_alpha": 5, "target_modules": []}

problemi_buona = valida_lora_config(buona)
problemi_cattiva = valida_lora_config(cattiva)

print(problemi_buona)
print(problemi_cattiva)`,
      check: `assert problemi_buona == []
assert len(problemi_cattiva) == 3`,
      hint: `<p>La config cattiva fallisce tutti e tre i controlli: r=10 non è potenza di 2 valida, alpha (5) è minore di r (10), e la lista dei moduli è vuota.</p>`,
      solution: `def valida_lora_config(config):
    problemi = []
    r = config.get("r", 0)
    if r not in [4, 8, 16, 32, 64]:
        problemi.append("r deve essere una potenza di 2 tra 4 e 64")
    if config.get("lora_alpha", 0) < r:
        problemi.append("lora_alpha dovrebbe essere almeno pari a r")
    if not config.get("target_modules"):
        problemi.append("target_modules non puo' essere vuoto")
    return problemi

buona = {"r": 16, "lora_alpha": 32, "target_modules": ["q_proj", "v_proj"]}
cattiva = {"r": 10, "lora_alpha": 5, "target_modules": []}

problemi_buona = valida_lora_config(buona)
problemi_cattiva = valida_lora_config(cattiva)

print(problemi_buona)
print(problemi_cattiva)`
    },

    {
      type: "exercise", id: "llm-23", kg: 25, title: "Massimale: pipeline di moderazione",
      task: `<p>Prima di rispondere, un sistema serio filtra input pericolosi. Scrivi <code>modera(testo, parole_vietate)</code>: restituisce <code>(True, None)</code> se il testo è pulito, <code>(False, parola)</code> con la prima parola vietata trovata altrimenti. Applica a una lista di messaggi.</p>`,
      starter: `parole_vietate = {"exploit", "malware", "attacco"}

def modera(testo, parole_vietate):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

messaggi = ["come si allena un modello", "spiegami un exploit di sicurezza", "cos'e' il fine-tuning"]

risultati = [modera(m, parole_vietate) for m in messaggi]
print(risultati)`,
      check: `assert risultati[0] == (True, None)
assert risultati[1] == (False, "exploit")
assert risultati[2] == (True, None)`,
      hint: `<p>Restituire una tupla <code>(bool, dettaglio)</code> è un pattern comune quando il chiamante deve sapere sia SE qualcosa è andato storto sia COSA esattamente.</p>`,
      solution: `parole_vietate = {"exploit", "malware", "attacco"}

def modera(testo, parole_vietate):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

messaggi = ["come si allena un modello", "spiegami un exploit di sicurezza", "cos'e' il fine-tuning"]

risultati = [modera(m, parole_vietate) for m in messaggi]
print(risultati)`
    },

    {
      type: "exercise", id: "llm-24", kg: 25, title: "Massimale: agente con due strumenti",
      task: `<p>Estendi il function-calling a due strumenti: <code>get_meteo(citta)</code> e <code>converti_valuta(importo, da, a)</code> (tasso fisso 1 EUR = 1.08 USD già fornito). Scrivi <code>esegui_chiamata</code> generica, testala su entrambi gli strumenti.</p>`,
      starter: `TASSO_EUR_USD = 1.08

def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

def converti_valuta(importo, da, a):
    if da == "EUR" and a == "USD":
        return round(importo * TASSO_EUR_USD, 2)
    if da == "USD" and a == "EUR":
        return round(importo / TASSO_EUR_USD, 2)
    return None

strumenti = {"get_meteo": get_meteo, "converti_valuta": converti_valuta}

def esegui_chiamata(chiamata, strumenti):
    funzione = strumenti.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

r1 = esegui_chiamata({"tool": "get_meteo", "argomenti": {"citta": "Milano"}}, strumenti)
r2 = esegui_chiamata({"tool": "converti_valuta", "argomenti": {"importo": 100, "da": "EUR", "a": "USD"}}, strumenti)

print(r1, r2)`,
      check: `assert r1 == "nuvoloso"
assert r2 == 108.0`,
      hint: `<p>La stessa funzione <code>esegui_chiamata</code> gestisce QUALSIASI strumento nel dizionario, senza bisogno di un if-else per ciascuno: è il vantaggio di un registro di strumenti.</p>`,
      solution: `TASSO_EUR_USD = 1.08

def get_meteo(citta):
    dati = {"Roma": "soleggiato", "Milano": "nuvoloso"}
    return dati.get(citta, "sconosciuto")

def converti_valuta(importo, da, a):
    if da == "EUR" and a == "USD":
        return round(importo * TASSO_EUR_USD, 2)
    if da == "USD" and a == "EUR":
        return round(importo / TASSO_EUR_USD, 2)
    return None

strumenti = {"get_meteo": get_meteo, "converti_valuta": converti_valuta}

def esegui_chiamata(chiamata, strumenti):
    funzione = strumenti.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

r1 = esegui_chiamata({"tool": "get_meteo", "argomenti": {"citta": "Milano"}}, strumenti)
r2 = esegui_chiamata({"tool": "converti_valuta", "argomenti": {"importo": 100, "da": "EUR", "a": "USD"}}, strumenti)

print(r1, r2)`
    },

    {
      type: "exercise", id: "llm-25", kg: 25, title: "Massimale finale: assistente completo",
      task: `<p>Metti insieme più pezzi della sala in <code>gestisci_richiesta(testo)</code>: 1) modera il testo (parole vietate già viste), 2) se pulito, instrada al team giusto (fatturazione/tecnico/generale), 3) restituisce un dizionario <code>{"ok": bool, "instradamento": ..., "motivo_blocco": ...}</code>.</p>`,
      starter: `parole_vietate = {"exploit", "malware"}
PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def modera(testo):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

def gestisci_richiesta(testo):
    ok, parola_bloccata = modera(testo)
    if not ok:
        return {"ok": False, "instradamento": None, "motivo_blocco": parola_bloccata}
    return {"ok": True, "instradamento": instrada(testo), "motivo_blocco": None}

r1 = gestisci_richiesta("Non ho ricevuto la fattura")
r2 = gestisci_richiesta("Vorrei un exploit per il sistema")

print(r1)
print(r2)`,
      check: `assert r1 == {"ok": True, "instradamento": "fatturazione", "motivo_blocco": None}
assert r2 == {"ok": False, "instradamento": None, "motivo_blocco": "exploit"}`,
      hint: `<p>Se la moderazione blocca il testo, la funzione si ferma lì (nessun instradamento ha senso per un testo bloccato): è un <code>return</code> anticipato, come nel riscaldamento.</p>`,
      solution: `parole_vietate = {"exploit", "malware"}
PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def modera(testo):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

def gestisci_richiesta(testo):
    ok, parola_bloccata = modera(testo)
    if not ok:
        return {"ok": False, "instradamento": None, "motivo_blocco": parola_bloccata}
    return {"ok": True, "instradamento": instrada(testo), "motivo_blocco": None}

r1 = gestisci_richiesta("Non ho ricevuto la fattura")
r2 = gestisci_richiesta("Vorrei un exploit per il sistema")

print(r1)
print(r2)`
    },

    {
      type: "exercise", id: "llm-26", kg: 10, title: "Drill: conversazione di supporto",
      task: `<p>Costruisci <code>messaggi</code> con un <code>system</code> ("Sei un assistente di supporto tecnico.") e uno <code>user</code> ("Il mio ordine non e' arrivato"). Poi <code>n_per_ruolo</code>.</p>`,
      starter: `messaggi = [
    {"role": "system", "content": "Sei un assistente di supporto tecnico."},
    {"role": "user", "content": "Il mio ordine non e' arrivato"},
]

n_per_ruolo = {}
for m in messaggi:
    n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1

print(messaggi)
print(n_per_ruolo)`,
      check: `assert len(messaggi) == 2
assert n_per_ruolo == {"system": 1, "user": 1}`,
      hint: `<p>Stesso pattern di conteggio del riscaldamento, applicato ai ruoli dei messaggi.</p>`,
      solution: `messaggi = [
    {"role": "system", "content": "Sei un assistente di supporto tecnico."},
    {"role": "user", "content": "Il mio ordine non e' arrivato"},
]

n_per_ruolo = {}
for m in messaggi:
    n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1

print(messaggi)
print(n_per_ruolo)`
    },

    {
      type: "exercise", id: "llm-27", kg: 10, title: "Drill: un secondo mock-modello",
      task: `<p>Con <code>ollama</code> (mock, già pronto): chiama il modello sul tema "clustering" e leggi la risposta in <code>testo</code>.</p>`,
      setup: `class MockOllama:
    def chat(self, model, messages):
        ultimo = messages[-1]["content"].lower()
        if "clustering" in ultimo:
            testo = "Il clustering raggruppa dati simili senza etichette."
        else:
            testo = "Non ho una risposta pronta per questo."
        return {"model": model, "message": {"role": "assistant", "content": testo}}

ollama = MockOllama()
messaggi = [{"role": "user", "content": "Spiegami il clustering"}]`,
      starter: `# ollama e messaggi sono gia' pronti
risposta = ollama.chat(model="llama3", messages=messaggi)
testo = risposta["message"]["content"]

print(testo)`,
      check: `assert "clustering" in testo.lower()`,
      hint: `<p>Stesso scavo di sempre: <code>risposta["message"]["content"]</code>.</p>`,
      solution: `risposta = ollama.chat(model="llama3", messages=messaggi)
testo = risposta["message"]["content"]

print(testo)`
    },

    {
      type: "exercise", id: "llm-28", kg: 10, title: "Drill: due configurazioni agli estremi",
      task: `<p>Con <code>valida_config</code> (stessa firma vista prima): <code>config_veloce</code> (temperature=0.0, top_p=0.5) e <code>config_esplorativa</code> (temperature=2.0, top_p=1.0) — entrambe ai limiti del range valido.</p>`,
      starter: `def valida_config(cfg):
    return 0 <= cfg["temperature"] <= 2 and 0 <= cfg["top_p"] <= 1

config_veloce = {"temperature": 0.0, "top_p": 0.5, "max_tokens": 50}
config_esplorativa = {"temperature": 2.0, "top_p": 1.0, "max_tokens": 1000}

entrambe_valide = valida_config(config_veloce) and valida_config(config_esplorativa)

print(entrambe_valide)`,
      check: `assert entrambe_valide == True`,
      hint: `<p>0 e 2 sono i limiti INCLUSI del range di <code>temperature</code>: entrambe le configurazioni sono ai bordi, ma valide.</p>`,
      solution: `def valida_config(cfg):
    return 0 <= cfg["temperature"] <= 2 and 0 <= cfg["top_p"] <= 1

config_veloce = {"temperature": 0.0, "top_p": 0.5, "max_tokens": 50}
config_esplorativa = {"temperature": 2.0, "top_p": 1.0, "max_tokens": 1000}

entrambe_valide = valida_config(config_veloce) and valida_config(config_esplorativa)

print(entrambe_valide)`
    },

    {
      type: "exercise", id: "llm-29", kg: 15, title: "Drill: sentiment sulle recensioni del delivery",
      task: `<p>Con <code>classifica_mock</code> (stessa firma vista prima): su <code>recensioni</code>, trova <code>n_positive</code> e <code>piu_sicura</code>.</p>`,
      setup: `PAROLE_POSITIVE = {"fantastico", "ottimo", "adoro", "perfetto"}
PAROLE_NEGATIVE = {"pessimo", "orribile", "delusione", "male"}

def classifica_mock(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    n_pos = len(parole & PAROLE_POSITIVE)
    n_neg = len(parole & PAROLE_NEGATIVE)
    if n_pos >= n_neg:
        return [{"label": "POSITIVE", "score": 0.6 + 0.1 * n_pos}]
    return [{"label": "NEGATIVE", "score": 0.6 + 0.1 * n_neg}]

recensioni = [
    "Consegna ottimo e veloce",
    "Cibo freddo e orribile",
    "Nella media di tutto",
    "Servizio perfetto ottimo davvero",
]`,
      starter: `# classifica_mock e recensioni sono gia' pronte
risultati = [classifica_mock(r) for r in recensioni]
n_positive = sum(1 for r in risultati if r[0]["label"] == "POSITIVE")

migliore_idx = max(range(len(risultati)), key=lambda i: risultati[i][0]["score"])
piu_sicura = recensioni[migliore_idx]

print(n_positive)
print(piu_sicura)`,
      check: `assert n_positive == 3
assert piu_sicura == "Servizio perfetto ottimo davvero"`,
      hint: `<p>La quarta recensione ha due parole positive ("perfetto", "ottimo"): score più alto di tutte.</p>`,
      solution: `risultati = [classifica_mock(r) for r in recensioni]
n_positive = sum(1 for r in risultati if r[0]["label"] == "POSITIVE")

migliore_idx = max(range(len(risultati)), key=lambda i: risultati[i][0]["score"])
piu_sicura = recensioni[migliore_idx]

print(n_positive)
print(piu_sicura)`
    },

    {
      type: "exercise", id: "llm-30", kg: 15, title: "Drill: tokenizza un secondo testo",
      task: `<p>Con <code>tokenizza_mock</code> (stessa firma vista prima): <code>token_prompt</code> e <code>vocabolario</code> di <code>corpus</code>.</p>`,
      setup: `def tokenizza_mock(testo):
    token = []
    for parola in testo.lower().replace(",", "").replace(".", "").split():
        if parola.endswith("mente") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##mente")
        elif parola.endswith("zione") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##zione")
        else:
            token.append(parola)
    return token

prompt = "La classificazione rapida del testo funziona bene."
corpus = ["Il modello impara.", "La generazione e' rapida.", "Ottima soluzione oggi."]`,
      starter: `# tokenizza_mock, prompt e corpus sono gia' pronti
token_prompt = tokenizza_mock(prompt)
n_token = len(token_prompt)

vocabolario = set()
for frase in corpus:
    vocabolario.update(tokenizza_mock(frase))

print(token_prompt)
print(vocabolario)`,
      check: `assert "##zione" in token_prompt
assert n_token == len(token_prompt)
assert "##zione" in vocabolario and "modello" in vocabolario`,
      hint: `<p>"classificazione" si spezza in "classifica" + "##zione"; nel corpus, "generazione" e "soluzione" fanno lo stesso.</p>`,
      solution: `token_prompt = tokenizza_mock(prompt)
n_token = len(token_prompt)

vocabolario = set()
for frase in corpus:
    vocabolario.update(tokenizza_mock(frase))

print(token_prompt)
print(vocabolario)`
    },

    {
      type: "exercise", id: "llm-31", kg: 15, title: "Drill: template per professionisti",
      task: `<p>Costruisci <code>template</code> ("Sei {ruolo}. Il tuo obiettivo e': {obiettivo}"), <code>prompt_medico</code> e <code>prompt_avvocato</code> (deve contenere "avvocato").</p>`,
      starter: `template = "Sei {ruolo}. Il tuo obiettivo e': {obiettivo}"

prompt_medico = template.format(ruolo="un medico", obiettivo="diagnosticare i sintomi")
prompt_avvocato = template.format(ruolo="un avvocato", obiettivo="valutare il contratto")

print(prompt_medico)
print(prompt_avvocato)`,
      check: `assert "{ruolo}" in template and "{obiettivo}" in template
assert prompt_medico == "Sei un medico. Il tuo obiettivo e': diagnosticare i sintomi"
assert "avvocato" in prompt_avvocato`,
      hint: `<p><code>template.format(ruolo=..., obiettivo=...)</code>, come nel primo template della sala.</p>`,
      solution: `template = "Sei {ruolo}. Il tuo obiettivo e': {obiettivo}"

prompt_medico = template.format(ruolo="un medico", obiettivo="diagnosticare i sintomi")
prompt_avvocato = template.format(ruolo="un avvocato", obiettivo="valutare il contratto")

print(prompt_medico)
print(prompt_avvocato)`
    },

    {
      type: "exercise", id: "llm-32", kg: 20, title: "Drill: LoRA con rango più basso",
      task: `<p>Con <code>parametri_lora</code> (stessa funzione vista prima): calcola <code>allenabili</code> con <code>r=8</code>, <code>n_layer=24</code>, <code>dim=2048</code>, poi <code>percentuale</code> su <code>parametri_totali=7_000_000_000</code>.</p>`,
      starter: `def parametri_lora(r, n_layer, dim):
    return n_layer * 2 * r * dim

parametri_totali = 7_000_000_000

allenabili = parametri_lora(8, 24, 2048)
percentuale = allenabili / parametri_totali * 100

print(allenabili, f"{percentuale:.5f}%")`,
      check: `assert allenabili == 786432
assert abs(percentuale - (786432 / 7_000_000_000 * 100)) < 1e-9
assert percentuale < 0.1`,
      hint: `<p>24 × 2 × 8 × 2048 = 786432: un rango più basso (8 invece di 16) dimezza i parametri allenabili.</p>`,
      solution: `def parametri_lora(r, n_layer, dim):
    return n_layer * 2 * r * dim

parametri_totali = 7_000_000_000

allenabili = parametri_lora(8, 24, 2048)
percentuale = allenabili / parametri_totali * 100

print(allenabili, f"{percentuale:.5f}%")`
    },

    {
      type: "exercise", id: "llm-33", kg: 15, title: "Drill: few-shot per traduzione",
      task: `<p>Costruisci <code>prompt_few_shot</code> con due esempi di traduzione e la domanda finale su <code>nuovo_testo</code>, usando il <code>template</code> fornito.</p>`,
      starter: `template = 'Italiano: "{it}"\\nInglese: {en}'

esempio1 = template.format(it="Buongiorno", en="Good morning")
esempio2 = template.format(it="Grazie mille", en="Thank you very much")
domanda = 'Italiano: "Come stai?"\\nInglese:'

prompt_few_shot = "\\n\\n".join([esempio1, esempio2, domanda])
print(prompt_few_shot)`,
      check: `assert prompt_few_shot.count("Inglese:") == 3
assert "Good morning" in prompt_few_shot
assert prompt_few_shot.strip().endswith("Inglese:")`,
      hint: `<p>La domanda finale termina con "Inglese:" senza risposta, seguendo il pattern degli esempi.</p>`,
      solution: `template = 'Italiano: "{it}"\\nInglese: {en}'

esempio1 = template.format(it="Buongiorno", en="Good morning")
esempio2 = template.format(it="Grazie mille", en="Thank you very much")
domanda = 'Italiano: "Come stai?"\\nInglese:'

prompt_few_shot = "\\n\\n".join([esempio1, esempio2, domanda])
print(prompt_few_shot)`
    },

    {
      type: "exercise", id: "llm-34", kg: 20, title: "Drill: tronca con più messaggi da tenere",
      task: `<p>Con <code>tronca_storico</code> (stessa firma vista prima): applica a <code>conversazione</code> con <code>max_messaggi=3</code>.</p>`,
      starter: `def tronca_storico(messaggi, max_messaggi):
    sistema = [m for m in messaggi if m["role"] == "system"]
    resto = [m for m in messaggi if m["role"] != "system"]
    return sistema + resto[-max_messaggi:]

conversazione = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Turno 1"},
    {"role": "assistant", "content": "Risposta 1"},
    {"role": "user", "content": "Turno 2"},
    {"role": "assistant", "content": "Risposta 2"},
    {"role": "user", "content": "Turno 3"},
]

troncata = tronca_storico(conversazione, 3)
print(troncata)`,
      check: `assert len(troncata) == 4
assert troncata[0]["role"] == "system"
assert troncata[-1]["content"] == "Turno 3"
assert troncata[1]["content"] == "Turno 2"`,
      hint: `<p>Con <code>max_messaggi=3</code>, i tenuti sono gli ultimi 3 messaggi non-system: "Turno 2", "Risposta 2", "Turno 3" (più il system in testa, 4 in tutto).</p>`,
      solution: `def tronca_storico(messaggi, max_messaggi):
    sistema = [m for m in messaggi if m["role"] == "system"]
    resto = [m for m in messaggi if m["role"] != "system"]
    return sistema + resto[-max_messaggi:]

conversazione = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Turno 1"},
    {"role": "assistant", "content": "Risposta 1"},
    {"role": "user", "content": "Turno 2"},
    {"role": "assistant", "content": "Risposta 2"},
    {"role": "user", "content": "Turno 3"},
]

troncata = tronca_storico(conversazione, 3)
print(troncata)`
    },

    {
      type: "exercise", id: "llm-35", kg: 20, title: "Drill: budget diverso, documenti diversi",
      task: `<p>Con <code>seleziona_per_budget</code> (stessa firma vista prima): applica a <code>documenti</code> con <code>budget=700</code>.</p>`,
      starter: `documenti = [
    {"testo": "docA", "token": 400},
    {"testo": "docB", "token": 250},
    {"testo": "docC", "token": 100},
    {"testo": "docD", "token": 300},
]
budget = 700

def seleziona_per_budget(documenti, budget):
    scelti = []
    totale = 0
    for d in documenti:
        if totale + d["token"] <= budget:
            scelti.append(d)
            totale += d["token"]
    return scelti

scelti = seleziona_per_budget(documenti, budget)
print([d["testo"] for d in scelti])`,
      check: `assert [d["testo"] for d in scelti] == ["docA", "docB"]`,
      hint: `<p>docA (400) e docB (250) portano il totale a 650; docC (100) sfonderebbe a 750, quindi salta, e anche docD (300) supererebbe il budget rispetto ai 650 già usati.</p>`,
      solution: `documenti = [
    {"testo": "docA", "token": 400},
    {"testo": "docB", "token": 250},
    {"testo": "docC", "token": 100},
    {"testo": "docD", "token": 300},
]
budget = 700

def seleziona_per_budget(documenti, budget):
    scelti = []
    totale = 0
    for d in documenti:
        if totale + d["token"] <= budget:
            scelti.append(d)
            totale += d["token"]
    return scelti

scelti = seleziona_per_budget(documenti, budget)
print([d["testo"] for d in scelti])`
    },

    {
      type: "exercise", id: "llm-36", kg: 20, title: "Drill: batch di ticket, seconda ondata",
      task: `<p>Con <code>classifica_mock</code> (stessa firma vista in altri esercizi): classifica <code>ticket</code>, trova <code>n_negativi</code> e <code>ticket_piu_critico</code>.</p>`,
      setup: `PAROLE_POSITIVE = {"ottimo", "perfetto", "grazie", "risolto"}
PAROLE_NEGATIVE = {"rotto", "pessimo", "bloccato", "urgente"}

def classifica_mock(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    n_pos = len(parole & PAROLE_POSITIVE)
    n_neg = len(parole & PAROLE_NEGATIVE)
    if n_pos >= n_neg:
        return [{"label": "POSITIVE", "score": 0.6 + 0.1 * n_pos}]
    return [{"label": "NEGATIVE", "score": 0.6 + 0.1 * n_neg}]

ticket = [
    "Grazie mille problema risolto",
    "Sistema completamente rotto e bloccato",
    "Tutto regolare",
    "Servizio pessimo bloccato urgente aiuto",
]`,
      starter: `# classifica_mock e ticket sono gia' pronti
risultati = [classifica_mock(t)[0] for t in ticket]
n_negativi = sum(1 for r in risultati if r["label"] == "NEGATIVE")

negativi_idx = [i for i, r in enumerate(risultati) if r["label"] == "NEGATIVE"]
idx_critico = max(negativi_idx, key=lambda i: risultati[i]["score"])
ticket_piu_critico = ticket[idx_critico]

print(n_negativi)
print(ticket_piu_critico)`,
      check: `assert n_negativi == 2
assert ticket_piu_critico == "Servizio pessimo bloccato urgente aiuto"`,
      hint: `<p>Il quarto ticket ha 3 parole negative contro le 2 del secondo: score più alto tra i negativi.</p>`,
      solution: `risultati = [classifica_mock(t)[0] for t in ticket]
n_negativi = sum(1 for r in risultati if r["label"] == "NEGATIVE")

negativi_idx = [i for i, r in enumerate(risultati) if r["label"] == "NEGATIVE"]
idx_critico = max(negativi_idx, key=lambda i: risultati[i]["score"])
ticket_piu_critico = ticket[idx_critico]

print(n_negativi)
print(ticket_piu_critico)`
    },

    {
      type: "exercise", id: "llm-37", kg: 20, title: "Drill: estrai un campo qualsiasi dal JSON",
      task: `<p>Scrivi <code>estrai_campo(risposta_testo, campo)</code>: come <code>estrai_sentiment</code> ma generico su qualsiasi campo. Testala su un JSON valido e uno malformato.</p>`,
      starter: `import json

def estrai_campo(risposta_testo, campo):
    try:
        dati = json.loads(risposta_testo)
        return dati[campo]
    except json.JSONDecodeError:
        return "sconosciuto"

valida = '{"intento": "prenotazione", "confidenza": 0.88}'
malformata = "{intento: prenotazione}"

r1 = estrai_campo(valida, "intento")
r2 = estrai_campo(malformata, "intento")

print(r1, r2)`,
      check: `assert r1 == "prenotazione"
assert r2 == "sconosciuto"`,
      hint: `<p>Stesso pattern try/except di <code>estrai_sentiment</code>, ma con il nome del campo passato come parametro invece che fisso.</p>`,
      solution: `import json

def estrai_campo(risposta_testo, campo):
    try:
        dati = json.loads(risposta_testo)
        return dati[campo]
    except json.JSONDecodeError:
        return "sconosciuto"

valida = '{"intento": "prenotazione", "confidenza": 0.88}'
malformata = "{intento: prenotazione}"

r1 = estrai_campo(valida, "intento")
r2 = estrai_campo(malformata, "intento")

print(r1, r2)`
    },

    {
      type: "exercise", id: "llm-38", kg: 25, title: "Drill: esegui la ricerca prodotto",
      task: `<p>Con <code>esegui_chiamata</code> (stessa firma vista prima) e uno strumento <code>cerca_prodotto(nome)</code>: esegui una chiamata valida e una su uno strumento inesistente.</p>`,
      starter: `def cerca_prodotto(nome):
    dati = {"mouse": 15.0, "tastiera": 35.0}
    return dati.get(nome, None)

strumenti_disponibili = {"cerca_prodotto": cerca_prodotto}
chiamata = {"tool": "cerca_prodotto", "argomenti": {"nome": "mouse"}}

def esegui_chiamata(chiamata, strumenti_disponibili):
    funzione = strumenti_disponibili.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

risultato = esegui_chiamata(chiamata, strumenti_disponibili)
chiamata_sconosciuta = {"tool": "cerca_offerta", "argomenti": {}}
risultato_sconosciuto = esegui_chiamata(chiamata_sconosciuta, strumenti_disponibili)

print(risultato)
print(risultato_sconosciuto)`,
      check: `assert risultato == 15.0
assert risultato_sconosciuto is None`,
      hint: `<p><code>funzione(**chiamata["argomenti"])</code> spacchetta il dizionario degli argomenti in parametri nominati.</p>`,
      solution: `def cerca_prodotto(nome):
    dati = {"mouse": 15.0, "tastiera": 35.0}
    return dati.get(nome, None)

strumenti_disponibili = {"cerca_prodotto": cerca_prodotto}
chiamata = {"tool": "cerca_prodotto", "argomenti": {"nome": "mouse"}}

def esegui_chiamata(chiamata, strumenti_disponibili):
    funzione = strumenti_disponibili.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

risultato = esegui_chiamata(chiamata, strumenti_disponibili)
chiamata_sconosciuta = {"tool": "cerca_offerta", "argomenti": {}}
risultato_sconosciuto = esegui_chiamata(chiamata_sconosciuta, strumenti_disponibili)

print(risultato)
print(risultato_sconosciuto)`
    },

    {
      type: "exercise", id: "llm-39", kg: 20, title: "Drill: similarità coseno tra frasi meteo",
      task: `<p>Con tre embedding giocattolo e una query: trova <code>indice_piu_simile</code>.</p>`,
      starter: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

frasi = ["il sole splende", "la pioggia cade", "il sole scalda"]
embedding = [np.array([0.9, 0.1]), np.array([0.1, 0.9]), np.array([0.88, 0.15])]
query_vec = np.array([0.92, 0.08])

similarita = [cosine_sim(query_vec, e) for e in embedding]
indice_piu_simile = int(np.argmax(similarita))

print([round(s, 4) for s in similarita])
print(frasi[indice_piu_simile])`,
      check: `assert indice_piu_simile == 0
assert frasi[indice_piu_simile] == "il sole splende"`,
      hint: `<p>Il vettore query è quasi parallelo al primo embedding: la similarità coseno lo premia anche se il secondo embedding è numericamente vicino.</p>`,
      solution: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

frasi = ["il sole splende", "la pioggia cade", "il sole scalda"]
embedding = [np.array([0.9, 0.1]), np.array([0.1, 0.9]), np.array([0.88, 0.15])]
query_vec = np.array([0.92, 0.08])

similarita = [cosine_sim(query_vec, e) for e in embedding]
indice_piu_simile = int(np.argmax(similarita))

print([round(s, 4) for s in similarita])
print(frasi[indice_piu_simile])`
    },

    {
      type: "exercise", id: "llm-40", kg: 15, title: "Drill: ricomponi un secondo streaming",
      task: `<p>Con <code>chunks</code>: <code>testo_completo</code> e <code>n_chunk</code>.</p>`,
      starter: `chunks = ["Buon", "gior", "no a ", "tutti"]

testo_completo = "".join(chunks)
n_chunk = len(chunks)

print(testo_completo)
print(n_chunk)`,
      check: `assert testo_completo == "Buongiorno a tutti"
assert n_chunk == 4`,
      hint: `<p><code>"".join(lista)</code> concatena senza separatore: nota che i pezzi possono spezzare una parola a metà ("Buon"+"gior"+"no").</p>`,
      solution: `chunks = ["Buon", "gior", "no a ", "tutti"]

testo_completo = "".join(chunks)
n_chunk = len(chunks)

print(testo_completo)
print(n_chunk)`
    },

    {
      type: "exercise", id: "llm-41", kg: 20, title: "Combo: solo i messaggi dell'assistente",
      task: `<p>Su <code>messaggi</code> (conversazione multi-turno): <code>n_per_ruolo</code> e <code>solo_assistant</code> (lista dei soli content con ruolo assistant).</p>`,
      starter: `messaggi = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Domanda 1"},
    {"role": "assistant", "content": "risp1"},
    {"role": "user", "content": "Domanda 2"},
    {"role": "assistant", "content": "risp2"},
]

n_per_ruolo = {}
for m in messaggi:
    n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1

solo_assistant = [m["content"] for m in messaggi if m["role"] == "assistant"]

print(n_per_ruolo)
print(solo_assistant)`,
      check: `assert n_per_ruolo == {"system": 1, "user": 2, "assistant": 2}
assert solo_assistant == ["risp1", "risp2"]`,
      hint: `<p>Una comprehension con filtro estrae solo i content dei messaggi che soddisfano la condizione sul ruolo.</p>`,
      solution: `messaggi = [
    {"role": "system", "content": "Sei conciso."},
    {"role": "user", "content": "Domanda 1"},
    {"role": "assistant", "content": "risp1"},
    {"role": "user", "content": "Domanda 2"},
    {"role": "assistant", "content": "risp2"},
]

n_per_ruolo = {}
for m in messaggi:
    n_per_ruolo[m["role"]] = n_per_ruolo.get(m["role"], 0) + 1

solo_assistant = [m["content"] for m in messaggi if m["role"] == "assistant"]

print(n_per_ruolo)
print(solo_assistant)`
    },

    {
      type: "exercise", id: "llm-42", kg: 20, title: "Combo: il retry si ferma appena riesce",
      task: `<p>Con lo stesso meccanismo di retry, verifica che, appena la chiamata riesce, il ciclo si fermi SENZA consumare i tentativi rimanenti. Conta le chiamate reali in <code>chiamate_count</code>.</p>`,
      setup: `import random
random.seed(7)
chiamate_count = 0

def chiama_modello_instabile(messaggi):
    global chiamate_count
    chiamate_count += 1
    if random.random() < 0.6:
        raise RuntimeError("rate limit")
    return {"message": {"role": "assistant", "content": "ok"}}

messaggi = [{"role": "user", "content": "Ciao"}]`,
      starter: `def chiama_con_retry(messaggi, tentativi=5):
    for i in range(tentativi):
        try:
            risposta = chiama_modello_instabile(messaggi)
            return risposta["message"]["content"]
        except RuntimeError:
            pass
    return None

testo = chiama_con_retry(messaggi, 5)
print(testo, chiamate_count)`,
      check: `assert testo == "ok"
assert chiamate_count == 3, "Con il seed 7, il terzo tentativo riesce: il ciclo deve fermarsi li', senza usare il quarto e quinto tentativo"`,
      hint: `<p><code>return</code> dentro il <code>try</code>, appena la chiamata riesce, esce immediatamente dalla funzione: i tentativi rimanenti non vengono mai eseguiti.</p>`,
      solution: `def chiama_con_retry(messaggi, tentativi=5):
    for i in range(tentativi):
        try:
            risposta = chiama_modello_instabile(messaggi)
            return risposta["message"]["content"]
        except RuntimeError:
            pass
    return None

testo = chiama_con_retry(messaggi, 5)
print(testo, chiamate_count)`
    },

    {
      type: "exercise", id: "llm-43", kg: 20, title: "Combo: ispeziona il contenuto della cache",
      task: `<p>Con <code>chiama_con_cache</code> (stessa firma vista prima): dopo tre chiamate (due domande diverse, una ripetuta), verifica che <code>cache</code> contenga esattamente le chiavi attese.</p>`,
      starter: `chiamate_reali = 0

def chiama_modello_costoso(domanda):
    global chiamate_reali
    chiamate_reali += 1
    return f"Risposta a: {domanda}"

def chiama_con_cache(domanda, cache, chiama_modello):
    if domanda in cache:
        return cache[domanda]
    risposta = chiama_modello(domanda)
    cache[domanda] = risposta
    return risposta

cache = {}
chiama_con_cache("Ciao", cache, chiama_modello_costoso)
chiama_con_cache("Come va?", cache, chiama_modello_costoso)
chiama_con_cache("Ciao", cache, chiama_modello_costoso)

print(cache)
print(chiamate_reali)`,
      check: `assert set(cache.keys()) == {"Ciao", "Come va?"}
assert chiamate_reali == 2`,
      hint: `<p>Anche se sono state fatte 3 chiamate, "Ciao" compare due volte: la cache ha solo 2 chiavi distinte, e il modello vero è stato chiamato solo 2 volte.</p>`,
      solution: `chiamate_reali = 0

def chiama_modello_costoso(domanda):
    global chiamate_reali
    chiamate_reali += 1
    return f"Risposta a: {domanda}"

def chiama_con_cache(domanda, cache, chiama_modello):
    if domanda in cache:
        return cache[domanda]
    risposta = chiama_modello(domanda)
    cache[domanda] = risposta
    return risposta

cache = {}
chiama_con_cache("Ciao", cache, chiama_modello_costoso)
chiama_con_cache("Come va?", cache, chiama_modello_costoso)
chiama_con_cache("Ciao", cache, chiama_modello_costoso)

print(cache)
print(chiamate_reali)`
    },

    {
      type: "exercise", id: "llm-44", kg: 20, title: "Combo: stima costo, seconda conversazione",
      task: `<p>Con <code>tokenizza_mock</code>: stima <code>n_token_totali</code> e <code>costo_euro</code> (0.0001 a token) di una nuova conversazione.</p>`,
      setup: `def tokenizza_mock(testo):
    token = []
    for parola in testo.lower().replace(",", "").replace(".", "").split():
        if parola.endswith("mente") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##mente")
        elif parola.endswith("zione") and len(parola) > 7:
            token.append(parola[:-5]); token.append("##zione")
        else:
            token.append(parola)
    return token`,
      starter: `messaggi = [
    {"role": "user", "content": "Come funziona la generazione automatica"},
    {"role": "assistant", "content": "La generazione utilizza probabilita' condizionali"},
]

n_token_totali = sum(len(tokenizza_mock(m["content"])) for m in messaggi)
costo_euro = n_token_totali * 0.0001

print(n_token_totali)
print(round(costo_euro, 5))`,
      check: `assert n_token_totali > 0
assert abs(costo_euro - n_token_totali * 0.0001) < 1e-9`,
      hint: `<p>La somma copre TUTTI i messaggi della conversazione, non solo l'ultimo.</p>`,
      solution: `messaggi = [
    {"role": "user", "content": "Come funziona la generazione automatica"},
    {"role": "assistant", "content": "La generazione utilizza probabilita' condizionali"},
]

n_token_totali = sum(len(tokenizza_mock(m["content"])) for m in messaggi)
costo_euro = n_token_totali * 0.0001

print(n_token_totali)
print(round(costo_euro, 5))`
    },

    {
      type: "exercise", id: "llm-45", kg: 25, title: "Combo: instrada un batch più vario",
      task: `<p>Con <code>instrada</code> (stessa firma vista prima): applica a un nuovo batch di 4 ticket.</p>`,
      starter: `PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

ticket = [
    "Problema con il pagamento della fattura",
    "Ho trovato un bug che non funziona",
    "Vorrei sapere gli orari di apertura",
    "Ho diritto al rimborso del mio ordine",
]

instradamenti = [instrada(t) for t in ticket]
print(instradamenti)`,
      check: `assert instradamenti == ["fatturazione", "tecnico", "generale", "fatturazione"]`,
      hint: `<p>Il primo e il quarto ticket contengono parole di fatturazione ("pagamento"/"fattura", "rimborso"); il secondo contiene "bug" e "funziona".</p>`,
      solution: `PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

ticket = [
    "Problema con il pagamento della fattura",
    "Ho trovato un bug che non funziona",
    "Vorrei sapere gli orari di apertura",
    "Ho diritto al rimborso del mio ordine",
]

instradamenti = [instrada(t) for t in ticket]
print(instradamenti)`
    },

    {
      type: "exercise", id: "llm-46", kg: 25, title: "Combo: matrice di similarità a tre dimensioni",
      task: `<p>Con embedding 3D di 4 frasi: costruisci <code>matrice_similarita</code> (4×4), verifica la diagonale e un confronto.</p>`,
      starter: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding = [np.array([1,0,0]), np.array([0.9,0.1,0]), np.array([0,0,1]), np.array([0,0.1,0.9])]

n = len(embedding)
matrice_similarita = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_similarita[i, j] = cosine_sim(embedding[i], embedding[j])

print(matrice_similarita.round(3))`,
      check: `import numpy as np
assert matrice_similarita.shape == (4, 4)
assert np.allclose(np.diag(matrice_similarita), 1.0, atol=1e-6)
assert matrice_similarita[0, 1] > matrice_similarita[0, 2]`,
      hint: `<p>Come nell'esercizio 2D di questa sala, ma con vettori a 3 dimensioni: la formula del coseno funziona identica indipendentemente dal numero di dimensioni.</p>`,
      solution: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding = [np.array([1,0,0]), np.array([0.9,0.1,0]), np.array([0,0,1]), np.array([0,0.1,0.9])]

n = len(embedding)
matrice_similarita = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_similarita[i, j] = cosine_sim(embedding[i], embedding[j])

print(matrice_similarita.round(3))`
    },

    {
      type: "exercise", id: "llm-47", kg: 25, title: "Massimale: valida un'altra configurazione LoRA",
      task: `<p>Con <code>valida_lora_config</code> (stessa firma vista prima): testala su una configurazione valida e una con tre problemi insieme.</p>`,
      starter: `def valida_lora_config(config):
    problemi = []
    r = config.get("r", 0)
    if r not in [4, 8, 16, 32, 64]:
        problemi.append("r deve essere una potenza di 2 tra 4 e 64")
    if config.get("lora_alpha", 0) < r:
        problemi.append("lora_alpha dovrebbe essere almeno pari a r")
    if not config.get("target_modules"):
        problemi.append("target_modules non puo' essere vuoto")
    return problemi

buona = {"r": 32, "lora_alpha": 64, "target_modules": ["k_proj"]}
cattiva = {"r": 100, "lora_alpha": 10, "target_modules": None}

problemi_buona = valida_lora_config(buona)
problemi_cattiva = valida_lora_config(cattiva)

print(problemi_buona)
print(problemi_cattiva)`,
      check: `assert problemi_buona == []
assert len(problemi_cattiva) == 3`,
      hint: `<p>La config cattiva fallisce tutti e tre i controlli: r fuori dai valori validi, alpha minore di r, e target_modules vuoto (None).</p>`,
      solution: `def valida_lora_config(config):
    problemi = []
    r = config.get("r", 0)
    if r not in [4, 8, 16, 32, 64]:
        problemi.append("r deve essere una potenza di 2 tra 4 e 64")
    if config.get("lora_alpha", 0) < r:
        problemi.append("lora_alpha dovrebbe essere almeno pari a r")
    if not config.get("target_modules"):
        problemi.append("target_modules non puo' essere vuoto")
    return problemi

buona = {"r": 32, "lora_alpha": 64, "target_modules": ["k_proj"]}
cattiva = {"r": 100, "lora_alpha": 10, "target_modules": None}

problemi_buona = valida_lora_config(buona)
problemi_cattiva = valida_lora_config(cattiva)

print(problemi_buona)
print(problemi_cattiva)`
    },

    {
      type: "exercise", id: "llm-48", kg: 25, title: "Massimale: un'altra pipeline di moderazione",
      task: `<p>Con <code>modera</code> (stessa firma vista prima) e nuove parole vietate: applica a tre nuovi messaggi.</p>`,
      starter: `parole_vietate = {"virus", "hack", "rubare"}

def modera(testo, parole_vietate):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

messaggi = ["come proteggere una rete wifi", "vorrei sapere come hack un sistema", "spiegami la crittografia"]

risultati = [modera(m, parole_vietate) for m in messaggi]
print(risultati)`,
      check: `assert risultati[0] == (True, None)
assert risultati[1] == (False, "hack")
assert risultati[2] == (True, None)`,
      hint: `<p>Solo il secondo messaggio contiene una parola vietata ("hack") come parola intera.</p>`,
      solution: `parole_vietate = {"virus", "hack", "rubare"}

def modera(testo, parole_vietate):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

messaggi = ["come proteggere una rete wifi", "vorrei sapere come hack un sistema", "spiegami la crittografia"]

risultati = [modera(m, parole_vietate) for m in messaggi]
print(risultati)`
    },

    {
      type: "exercise", id: "llm-49", kg: 25, title: "Massimale: agente con ricerca e sconto",
      task: `<p>Estendi il function-calling con due nuovi strumenti: <code>cerca_prodotto(nome)</code> e <code>calcola_sconto(prezzo, percentuale)</code>. Testali entrambi con <code>esegui_chiamata</code>.</p>`,
      starter: `def cerca_prodotto(nome):
    dati = {"mouse": 15.0, "tastiera": 35.0}
    return dati.get(nome, None)

def calcola_sconto(prezzo, percentuale):
    return round(prezzo * (1 - percentuale / 100), 2)

strumenti = {"cerca_prodotto": cerca_prodotto, "calcola_sconto": calcola_sconto}

def esegui_chiamata(chiamata, strumenti):
    funzione = strumenti.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

r1 = esegui_chiamata({"tool": "cerca_prodotto", "argomenti": {"nome": "mouse"}}, strumenti)
r2 = esegui_chiamata({"tool": "calcola_sconto", "argomenti": {"prezzo": 100, "percentuale": 20}}, strumenti)

print(r1, r2)`,
      check: `assert r1 == 15.0
assert r2 == 80.0`,
      hint: `<p>La stessa <code>esegui_chiamata</code> generica gestisce entrambi gli strumenti, senza bisogno di un if-else per ciascuno.</p>`,
      solution: `def cerca_prodotto(nome):
    dati = {"mouse": 15.0, "tastiera": 35.0}
    return dati.get(nome, None)

def calcola_sconto(prezzo, percentuale):
    return round(prezzo * (1 - percentuale / 100), 2)

strumenti = {"cerca_prodotto": cerca_prodotto, "calcola_sconto": calcola_sconto}

def esegui_chiamata(chiamata, strumenti):
    funzione = strumenti.get(chiamata["tool"])
    if funzione is None:
        return None
    return funzione(**chiamata["argomenti"])

r1 = esegui_chiamata({"tool": "cerca_prodotto", "argomenti": {"nome": "mouse"}}, strumenti)
r2 = esegui_chiamata({"tool": "calcola_sconto", "argomenti": {"prezzo": 100, "percentuale": 20}}, strumenti)

print(r1, r2)`
    },

    {
      type: "exercise", id: "llm-50", kg: 25, title: "Massimale finale: assistente completo, seconda versione",
      task: `<p>Ricostruisci <code>gestisci_richiesta(testo)</code> con nuove parole vietate e categorie, seguendo lo stesso schema (modera poi instrada).</p>`,
      starter: `parole_vietate = {"virus", "hack"}
PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def modera(testo):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

def gestisci_richiesta(testo):
    ok, parola_bloccata = modera(testo)
    if not ok:
        return {"ok": False, "instradamento": None, "motivo_blocco": parola_bloccata}
    return {"ok": True, "instradamento": instrada(testo), "motivo_blocco": None}

r1 = gestisci_richiesta("Ho un problema con il pagamento")
r2 = gestisci_richiesta("Vorrei un hack per il sistema")

print(r1)
print(r2)`,
      check: `assert r1 == {"ok": True, "instradamento": "fatturazione", "motivo_blocco": None}
assert r2 == {"ok": False, "instradamento": None, "motivo_blocco": "hack"}`,
      hint: `<p>Se la moderazione blocca il testo, la funzione restituisce subito senza calcolare l'instradamento.</p>`,
      solution: `parole_vietate = {"virus", "hack"}
PAROLE_FATTURAZIONE = {"pagamento", "fattura", "rimborso"}
PAROLE_TECNICO = {"bug", "errore", "funziona"}

def modera(testo):
    parole = set(testo.lower().split())
    trovate = parole & parole_vietate
    if trovate:
        return False, sorted(trovate)[0]
    return True, None

def instrada(testo):
    parole = set(testo.lower().replace(".", "").replace("!", "").split())
    if parole & PAROLE_FATTURAZIONE:
        return "fatturazione"
    if parole & PAROLE_TECNICO:
        return "tecnico"
    return "generale"

def gestisci_richiesta(testo):
    ok, parola_bloccata = modera(testo)
    if not ok:
        return {"ok": False, "instradamento": None, "motivo_blocco": parola_bloccata}
    return {"ok": True, "instradamento": instrada(testo), "motivo_blocco": None}

r1 = gestisci_richiesta("Ho un problema con il pagamento")
r2 = gestisci_richiesta("Vorrei un hack per il sistema")

print(r1)
print(r2)`
    }
  ]
});
