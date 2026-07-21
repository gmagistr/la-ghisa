window.MODULES.push({
  id: "algoritmi",
  name: "Algoritmi & Strutture Dati",
  tagline: "La sala dei fondamentali CS: hashmap, heap, stack, queue, ricerca binaria, BFS/DFS, Big O. Quello che le big tech chiedono.",
  intro: "Le aziende grosse fanno colloqui di algoritmi anche per ruoli data. Qui costruisci e usi le strutture dati fondamentali e gli algoritmi classici in puro Python, ragionando sulla complessità (Big O) — la base della programmazione efficiente.",
  packages: [],
  items: [

    { type: "theory", title: "Big O: misurare la complessità", html: `
<p>La <strong>notazione Big O</strong> descrive come cresce il tempo (o la memoria) di un algoritmo al crescere dell'input n. Non conta i secondi, ma l'<em>ordine di crescita</em> — cosa succede quando n raddoppia o diventa enorme.</p>
<ul>
<li><strong>O(1)</strong> — costante: accesso a un elemento per indice, lookup in un dizionario;</li>
<li><strong>O(log n)</strong> — logaritmico: ricerca binaria (dimezza a ogni passo);</li>
<li><strong>O(n)</strong> — lineare: scorrere una lista una volta;</li>
<li><strong>O(n log n)</strong> — quasi-lineare: ordinamento efficiente (sort);</li>
<li><strong>O(n²)</strong> — quadratico: doppio ciclo annidato;</li>
<li><strong>O(2ⁿ)</strong> — esponenziale: proibitivo, esplode subito.</li>
</ul>
<p>La differenza è tutto: su un milione di elementi, O(n) fa un milione di operazioni, O(n²) mille miliardi. Scegliere l'algoritmo con la complessità giusta è ciò che rende un programma usabile o inutilizzabile.</p>
`, more: `
<p>Big O misura il comportamento ASINTOTICO (per n grande) e ignora le costanti: O(2n) e O(n) sono entrambi O(n), perché per n enorme il fattore 2 è irrilevante rispetto all'ordine di crescita. Questo è utile (astrae dai dettagli hardware) ma ha un limite pratico: per n piccoli le costanti contano, e a volte un algoritmo O(n²) con costante piccola batte un O(n log n) con costante grande su input modesti. Big O dice come SCALA, non quale è più veloce su un input specifico — un algoritmo O(n log n) è garantito migliore di O(n²) solo per n sufficientemente grande.</p>
<p>Esistono tre "casi" spesso confusi: <strong>best case</strong> (input fortunato), <strong>average case</strong> (tipico), <strong>worst case</strong> (peggiore). Big O di solito si riferisce al worst case (garanzia superiore), ma l'average case è spesso più rilevante nella pratica. Esempio classico: il lookup in una hashmap è O(1) in media ma O(n) nel caso peggiore (tutte le chiavi in collisione) — nella pratica si tratta come O(1) perché il caso peggiore è rarissimo con buone funzioni hash. Sapere distinguere "O(1) ammortizzato/medio" da "O(1) garantito" è finezza da colloquio.</p>
<p>Per i ruoli data la complessità ha risvolti concreti: un'operazione O(n²) su un dataframe di milioni di righe è impraticabile (un join mal fatto, un doppio loop invece di una vettorizzazione); capire perché <code>x in lista</code> è O(n) ma <code>x in set</code> è O(1) evita colli di bottiglia reali; sapere che ordinare è O(n log n) spiega perché certi <code>sort_values</code> ripetuti sono costosi. La differenza tra un data scientist che scrive codice che gira in secondi e uno il cui codice non finisce mai è spesso proprio la scelta della struttura dati e la consapevolezza della complessità — non l'ottimizzazione micro, ma l'ordine di grandezza.</p>
` },

    {
      type: "exercise", id: "al-01", kg: 5, title: "Riconoscere la complessità",
      task: `<p>Associa ogni operazione alla sua complessità Big O (stringa):</p>
<ul>
<li><code>c_indice</code>: accedere a <code>lista[5]</code> &rarr; "O(1)" o "O(n)"?</li>
<li><code>c_ricerca_lista</code>: cercare un valore in una lista non ordinata &rarr; ?</li>
<li><code>c_binaria</code>: ricerca binaria in un array ordinato &rarr; "O(log n)" o "O(n)"?</li>
<li><code>c_doppio_ciclo</code>: confrontare ogni coppia di elementi (doppio for) &rarr; "O(n)" o "O(n^2)"?</li>
</ul>`,
      starter: `c_indice = "O(1)"
c_ricerca_lista = ...
c_binaria = ...
c_doppio_ciclo = ...

print(c_indice, c_ricerca_lista, c_binaria, c_doppio_ciclo)`,
      check: `assert c_indice == "O(1)", "accesso per indice: costante"
assert c_ricerca_lista == "O(n)", "ricerca lineare in lista: devi guardare fino a n elementi"
assert c_binaria == "O(log n)", "ricerca binaria: dimezza lo spazio a ogni passo"
assert c_doppio_ciclo == "O(n^2)", "doppio ciclo annidato: n * n confronti"`,
      hint: `<p>Accesso per indice = costante. Scorrere una lista = lineare. Dimezzare a ogni passo = logaritmico. Due cicli annidati = quadratico.</p>`,
      solution: `c_indice = "O(1)"
c_ricerca_lista = "O(n)"
c_binaria = "O(log n)"
c_doppio_ciclo = "O(n^2)"

print(c_indice, c_ricerca_lista, c_binaria, c_doppio_ciclo)`
    },

    { type: "theory", title: "Hashmap: il lookup O(1)", html: `
<p>La <strong>hashmap</strong> (in Python il <code>dict</code>) è la struttura dati più importante: associa chiavi a valori con accesso, inserimento e cancellazione in tempo <strong>O(1) medio</strong>. Il segreto è la <em>funzione hash</em>: trasforma la chiave in un indice di un array, così l'accesso è diretto invece che una ricerca.</p>
<pre><code>d = {"anna": 30, "bruno": 25}
d["anna"]           # O(1): la hash porta subito alla posizione
d["carlo"] = 40     # O(1): inserimento
"anna" in d         # O(1): verifica presenza — VELOCISSIMA
# confronto: "anna" in una LISTA sarebbe O(n)</code></pre>
<p>Da qui la regola pratica più utile: per verificare l'appartenenza o contare, usa un <code>set</code>/<code>dict</code> (O(1)), non una lista (O(n)). Su grandi volumi la differenza è tra istantaneo e insopportabile. La hashmap è dietro <code>Counter</code>, i join, la deduplicazione, la cache.</p>
`, more: `
<p>Come funziona sotto: la hash map ha un array di "bucket"; la funzione hash mappa ogni chiave a un indice di bucket. Idealmente ogni chiave va in un bucket diverso (accesso O(1)), ma due chiavi diverse possono avere lo stesso hash — una <strong>collisione</strong>. Le hashmap la gestiscono (con chaining, liste nei bucket, o open addressing), e finché le collisioni sono rare l'accesso resta O(1) medio. Nel caso patologico (tutte le chiavi in collisione) degrada a O(n), ma con buone funzioni hash e ridimensionamento automatico dell'array (quando si riempie troppo) questo non accade in pratica. Ecco perché si dice "O(1) ammortizzato/medio", non garantito.</p>
<p>Il requisito delle chiavi hashable è una conseguenza importante: solo oggetti IMMUTABILI possono essere chiavi (stringhe, numeri, tuple), non liste o dizionari — perché l'hash deve restare stabile (se la chiave cambiasse, l'hash cambierebbe e non la ritroveresti più nel suo bucket). È il motivo dell'errore <code>unhashable type: 'list'</code> quando provi a usare una lista come chiave o come elemento di un set. Per usare una collezione come chiave, la converti in tupla (immutabile).</p>
<p>La scelta lista vs set/dict per l'appartenenza è forse l'ottimizzazione più impattante e sottovalutata nel codice quotidiano. <code>if x in grande_lista</code> ripetuto in un ciclo è un classico O(n²) nascosto: n iterazioni, ognuna con una ricerca O(n). Convertire la lista in set una volta (O(n)) e poi fare i lookup O(1) trasforma l'intera operazione in O(n). Su dati grandi questo è letteralmente la differenza tra un secondo e un'ora. Lo stesso vale per deduplicare (<code>set(lista)</code> è O(n) contro il confronto a coppie O(n²)), contare (<code>Counter</code>), e fare join (indicizzare un lato in un dict). Riconoscere quando un problema è "di appartenenza/conteggio/join" e reagire con una hashmap è l'istinto che separa il codice efficiente da quello che non scala.</p>
` },

    {
      type: "exercise", id: "al-02", kg: 10, title: "Set vs lista per l'appartenenza",
      task: `<p>Risolvi un problema di appartenenza in modo efficiente. Data una lista di ID validi, filtra gli accessi:</p>
<ul>
<li><code>id_validi_set</code>: converti <code>id_validi</code> in un set (lookup O(1))</li>
<li><code>accessi_validi</code>: gli accessi il cui id è nel set dei validi</li>
<li><code>n_validi</code>: quanti accessi validi</li>
<li><code>perche_set</code>: la stringa "O(1)" — la complessità del lookup <code>x in set</code> (vs O(n) della lista)</li>
</ul>`,
      setup: `id_validi = [101, 102, 103, 104, 105]
accessi = [102, 999, 104, 888, 101, 103, 777]`,
      starter: `# id_validi: ID autorizzati | accessi: tentativi di accesso

id_validi_set = ...
accessi_validi = [a for a in accessi if a in id_validi_set]
n_validi = ...
perche_set = "O(1)"

print("accessi validi:", accessi_validi)
print("count:", n_validi)`,
      check: `_s = set(id_validi)
_av = [a for a in accessi if a in _s]
assert id_validi_set == _s, "id_validi_set: set(id_validi)"
assert accessi_validi == _av == [102, 104, 101, 103], "accessi_validi: gli accessi con id nel set"
assert n_validi == 4, "n_validi: 4"
assert perche_set == "O(1)", "perche_set: il lookup in un set e' O(1)"`,
      hint: `<p><code>set(id_validi)</code> per il lookup O(1). <code>n_validi = len(accessi_validi)</code>. Usare il set invece della lista rende ogni <code>in</code> istantaneo.</p>`,
      solution: `id_validi_set = set(id_validi)
accessi_validi = [a for a in accessi if a in id_validi_set]
n_validi = len(accessi_validi)
perche_set = "O(1)"

print("accessi validi:", accessi_validi)
print("count:", n_validi)`
    },

    {
      type: "exercise", id: "al-03", kg: 15, title: "Two Sum con hashmap",
      task: `<p>Il classico "Two Sum": trova due numeri nella lista che sommano a un target. Con una hashmap si risolve in O(n) invece di O(n²):</p>
<ul>
<li><code>two_sum</code>: funzione che scorre una volta, tenendo in un dict i valori già visti; per ogni numero cerca il complemento (target - numero) — fornita</li>
<li><code>indici</code>: gli indici della coppia che somma a 9 in <code>nums</code></li>
<li><code>trovato</code>: <code>True</code> se una coppia esiste</li>
<li><code>complessita</code>: "O(n)" — la complessità della soluzione con hashmap</li>
</ul>`,
      setup: `nums = [2, 7, 11, 15]
target = 9`,
      starter: `# nums, target: trova due indici i,j con nums[i]+nums[j]==target

def two_sum(nums, target):
    visti = {}   # valore -> indice
    for i, n in enumerate(nums):
        complemento = target - n
        if complemento in visti:
            return [visti[complemento], i]
        visti[n] = i
    return None

indici = two_sum(nums, target)
trovato = ...
complessita = "O(n)"

print("indici:", indici, "-> valori:", [nums[i] for i in indici] if indici else None)`,
      check: `def _ts(nums, target):
    v={}
    for i,n in enumerate(nums):
        c=target-n
        if c in v: return [v[c], i]
        v[n]=i
    return None
_ind = _ts(nums, target)
assert indici == _ind == [0, 1], "indici: [0, 1] (2 + 7 = 9)"
assert trovato == True, "trovato: indici is not None"
assert complessita == "O(n)", "complessita: la hashmap rende il two-sum O(n), non O(n^2)"`,
      hint: `<p>La funzione è fornita: <code>trovato = indici is not None</code>. L'idea chiave: invece di provare tutte le coppie (O(n²)), per ogni numero controlli in O(1) se hai già visto il suo complemento.</p>`,
      solution: `def two_sum(nums, target):
    visti = {}
    for i, n in enumerate(nums):
        complemento = target - n
        if complemento in visti:
            return [visti[complemento], i]
        visti[n] = i
    return None

indici = two_sum(nums, target)
trovato = indici is not None
complessita = "O(n)"

print("indici:", indici, "-> valori:", [nums[i] for i in indici] if indici else None)`
    },

    { type: "theory", title: "Stack e queue", html: `
<p>Due strutture dati fondamentali che differiscono per l'ordine di uscita degli elementi:</p>
<ul>
<li><strong>Stack</strong> (pila) — LIFO (Last In, First Out): l'ultimo entrato è il primo a uscire. Come una pila di piatti. Operazioni: <code>push</code> (aggiungi in cima), <code>pop</code> (togli dalla cima).</li>
<li><strong>Queue</strong> (coda) — FIFO (First In, First Out): il primo entrato è il primo a uscire. Come una fila alla cassa. Operazioni: <code>enqueue</code> (aggiungi in fondo), <code>dequeue</code> (togli dall'inizio).</li>
</ul>
<pre><code># stack con una lista Python:
stack = []
stack.append(1); stack.append(2)   # push
stack.pop()                          # -> 2 (l'ultimo)

# queue con collections.deque (efficiente ai due estremi):
from collections import deque
q = deque()
q.append(1); q.append(2)            # enqueue
q.popleft()                          # -> 1 (il primo)</code></pre>
`, more: `
<p>La scelta della struttura per la coda conta per l'efficienza: usare una LISTA come coda (<code>lista.pop(0)</code> per dequeue) è O(n), perché rimuovere dall'inizio richiede di spostare tutti gli altri elementi. <code>collections.deque</code> (double-ended queue) offre append e pop O(1) a ENTRAMBE le estremità — è la struttura giusta per code e per algoritmi come BFS. Usare <code>pop(0)</code> su una lista in un loop è un O(n²) nascosto classico. Lo stack, invece, va bene come lista Python: <code>append</code>/<code>pop</code> dalla fine sono O(1).</p>
<p>Gli stack sono ovunque, spesso in modo invisibile: la <strong>call stack</strong> delle chiamate di funzione (ogni chiamata pusha un frame, ogni return lo poppa — e lo stack overflow è letteralmente questa pila che si riempie); il pulsante "undo" (pila di azioni da annullare); il matching di parentesi/tag; la valutazione di espressioni; il backtracking. Ogni volta che serve "torna all'ultimo stato" o "elabora in ordine inverso", c'è uno stack. La ricorsione stessa È uno stack implicito — e trasformare una ricorsione in un loop con stack esplicito è una tecnica per evitare lo stack overflow su input profondi.</p>
<p>Le queue governano l'ELABORAZIONE IN ORDINE e sono il cuore dei sistemi distribuiti moderni: le code di messaggi (RabbitMQ, Kafka, SQS) disaccoppiano produttori e consumatori — un servizio mette lavoro in coda, un altro lo processa quando può, assorbendo i picchi. Nel ML, le code gestiscono le richieste di inferenza (batch di predizioni), i job di training, le pipeline di dati. La variante <strong>priority queue</strong> (coda con priorità, implementata con un heap — prossima lavagna) serve quando alcuni elementi devono essere processati prima di altri indipendentemente dall'ordine di arrivo. Stack e queue sono i mattoni con cui si costruiscono strutture più complesse e interi sistemi.</p>
` },

    {
      type: "exercise", id: "al-04", kg: 10, title: "Stack: parentesi bilanciate",
      task: `<p>Usa uno stack per verificare se le parentesi in una stringa sono bilanciate (il classico problema da colloquio):</p>
<ul>
<li><code>bilanciate</code>: funzione che usa uno stack — push su "(", pop e verifica su ")" (fornita)</li>
<li><code>ok1</code>: verifica "((()))" (bilanciata)</li>
<li><code>ok2</code>: verifica "(()" (NON bilanciata: manca una chiusura)</li>
<li><code>ok3</code>: verifica ")(" (NON bilanciata: chiude prima di aprire)</li>
</ul>`,
      starter: `def bilanciate(s):
    stack = []
    for c in s:
        if c == "(":
            stack.append(c)          # push
        elif c == ")":
            if not stack:            # niente da chiudere
                return False
            stack.pop()              # pop
    return len(stack) == 0           # tutto chiuso?

ok1 = bilanciate("((()))")
ok2 = ...
ok3 = ...

print("((()))  ->", ok1)
print("(()     ->", ok2)
print(")(      ->", ok3)`,
      check: `def _b(s):
    st=[]
    for c in s:
        if c=="(": st.append(c)
        elif c==")":
            if not st: return False
            st.pop()
    return len(st)==0
assert ok1 == True, "ok1: '((()))' e' bilanciata"
assert ok2 == False, "ok2: '(()' non e' bilanciata (resta un'apertura nello stack)"
assert ok3 == False, "ok3: ')(' non e' bilanciata (chiude prima di aprire)"`,
      hint: `<p>La funzione è fornita: <code>ok2 = bilanciate("(()")</code>, <code>ok3 = bilanciate(")(")</code>. Lo stack tiene le parentesi aperte; ogni ")" ne chiude una; alla fine lo stack dev'essere vuoto.</p>`,
      solution: `def bilanciate(s):
    stack = []
    for c in s:
        if c == "(":
            stack.append(c)
        elif c == ")":
            if not stack:
                return False
            stack.pop()
    return len(stack) == 0

ok1 = bilanciate("((()))")
ok2 = bilanciate("(()")
ok3 = bilanciate(")(")

print("((()))  ->", ok1)
print("(()     ->", ok2)
print(")(      ->", ok3)`
    },

    {
      type: "exercise", id: "al-05", kg: 15, title: "Queue con deque",
      task: `<p>Usa una <code>deque</code> come coda FIFO per simulare l'elaborazione di job in ordine di arrivo:</p>
<ul>
<li><code>coda</code>: una <code>deque</code> con i job iniziali</li>
<li>aggiungi un job "job4" in fondo (<code>append</code>)</li>
<li><code>primo_processato</code>: il primo job estratto (<code>popleft</code>) — deve essere "job1" (FIFO)</li>
<li><code>ordine_uscita</code>: la lista dei job nell'ordine in cui escono processando tutta la coda</li>
</ul>`,
      setup: `from collections import deque
job_iniziali = ["job1", "job2", "job3"]`,
      starter: `from collections import deque
# job_iniziali: job gia' in coda

coda = deque(job_iniziali)
coda.append("job4")   # arriva un nuovo job

primo_processato = ...   # popleft: il primo entrato

ordine_uscita = [primo_processato]
while coda:
    ordine_uscita.append(coda.popleft())

print("primo processato:", primo_processato)
print("ordine di uscita:", ordine_uscita)`,
      check: `from collections import deque
_c = deque(["job1","job2","job3"]); _c.append("job4")
_first = _c.popleft()
_ord = [_first]
while _c: _ord.append(_c.popleft())
assert primo_processato == "job1", "primo_processato: FIFO -> il primo entrato (job1) esce per primo"
assert ordine_uscita == ["job1", "job2", "job3", "job4"], "ordine_uscita: FIFO, nell'ordine di arrivo"`,
      hint: `<p><code>coda.popleft()</code> toglie dall'inizio (FIFO). Il primo job estratto è "job1", il primo arrivato. La coda mantiene l'ordine di arrivo.</p>`,
      solution: `from collections import deque

coda = deque(job_iniziali)
coda.append("job4")

primo_processato = coda.popleft()

ordine_uscita = [primo_processato]
while coda:
    ordine_uscita.append(coda.popleft())

print("primo processato:", primo_processato)
print("ordine di uscita:", ordine_uscita)`
    },

    { type: "theory", title: "Heap: la coda con priorità", html: `
<p>Un <strong>heap</strong> (in Python <code>heapq</code>) è una struttura che mantiene sempre accessibile il minimo (o massimo) in O(1), con inserimento e rimozione in O(log n). È la base della <strong>priority queue</strong>: estrai sempre l'elemento con priorità più alta.</p>
<pre><code>import heapq
h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
heapq.heappop(h)      # -> 1 (sempre il minimo)
# per i top-K piu' grandi:
heapq.nlargest(3, [5, 1, 8, 3, 9, 2])   # [9, 8, 5]</code></pre>
<p>L'heap risolve elegantemente il problema "top-K": trovare i K elementi più grandi/piccoli di un grande insieme in O(n log K), senza ordinare tutto (che sarebbe O(n log n)). Usatissimo: i K risultati più rilevanti, gli scheduler con priorità, l'algoritmo di Dijkstra.</p>
`, more: `
<p>La magia dell'heap è la struttura ad albero binario "quasi completo" mantenuta in un semplice array: ogni nodo genitore è &le; dei suoi figli (min-heap). Questo garantisce che la radice (indice 0) sia sempre il minimo — accesso O(1) — mentre inserire e rimuovere ripristinano la proprietà "risalendo/scendendo" l'albero in O(log n) (l'altezza). Non è ordinato completamente (trovare il massimo in un min-heap è O(n)!), ma mantiene invariante SOLO ciò che serve: il minimo sempre pronto. È un compromesso brillante tra una lista ordinata (min O(1) ma inserimento O(n)) e una lista non ordinata (inserimento O(1) ma min O(n)).</p>
<p>Il problema <strong>top-K</strong> mostra perché l'heap è prezioso: per trovare i 10 elementi più grandi di un miliardo, ordinare tutto è O(n log n) e spreca lavoro (ti servono solo 10). Con un heap di dimensione K mantieni solo i migliori K visti finora, scorrendo una volta: O(n log K), enormemente più efficiente quando K &laquo; n, e con memoria O(K) invece di O(n) — puoi processare uno stream infinito tenendo solo i top-K. <code>heapq.nlargest/nsmallest</code> fanno esattamente questo. È il pattern dietro "i 10 prodotti più venduti", "i K documenti più rilevanti", "i top-N per score".</p>
<p>Le priority queue basate su heap sono il cuore di algoritmi fondamentali: <strong>Dijkstra</strong> (cammino minimo — estrai sempre il nodo più vicino non ancora visitato), <strong>A*</strong> (pathfinding), la codifica di <strong>Huffman</strong> (compressione — unisci sempre i due nodi meno frequenti), gli scheduler dei sistemi operativi e dei job (esegui il task a priorità più alta). Nel ML compaiono nel beam search (generazione di testo, tieni le K sequenze più probabili), nei sistemi di raccomandazione (top-K item), nella ricerca dei vicini più prossimi. Riconoscere un problema come "mi serve sempre il minimo/massimo corrente" o "mi servono i top-K" è il segnale per raggiungere un heap invece di riordinare ripetutamente.</p>
` },

    {
      type: "exercise", id: "al-06", kg: 15, title: "Top-K con heap",
      task: `<p>Trova i K elementi più grandi (e più piccoli) di una lista con <code>heapq</code>, senza ordinare tutto:</p>
<ul>
<li><code>top3</code>: i 3 valori più grandi (<code>heapq.nlargest</code>)</li>
<li><code>bottom2</code>: i 2 valori più piccoli (<code>heapq.nsmallest</code>)</li>
<li><code>minimo</code>: usa un heap — pusha tutti gli elementi e fai <code>heappop</code> una volta per avere il minimo</li>
<li><code>complessita_topk</code>: "O(n log K)" — la complessità di nlargest (meglio di O(n log n))</li>
</ul>`,
      setup: `valori = [15, 3, 27, 8, 42, 1, 19, 33]`,
      starter: `import heapq
# valori: lista di numeri

top3 = heapq.nlargest(3, valori)
bottom2 = ...

h = list(valori)
heapq.heapify(h)     # trasforma in heap in O(n)
minimo = ...          # heappop: estrae il minimo

complessita_topk = "O(n log K)"

print("top 3:", top3)
print("bottom 2:", bottom2)
print("minimo:", minimo)`,
      check: `import heapq
_t3 = heapq.nlargest(3, valori); _b2 = heapq.nsmallest(2, valori)
_h = list(valori); heapq.heapify(_h); _min = heapq.heappop(_h)
assert top3 == _t3 == [42, 33, 27], "top3: heapq.nlargest(3, valori)"
assert bottom2 == _b2 == [1, 3], "bottom2: heapq.nsmallest(2, valori)"
assert minimo == _min == 1, "minimo: heappop dopo heapify -> il minimo (1)"
assert complessita_topk == "O(n log K)", "complessita_topk: O(n log K), meglio di ordinare tutto"`,
      hint: `<p><code>heapq.nsmallest(2, valori)</code> per i più piccoli. Dopo <code>heapify</code>, <code>heapq.heappop(h)</code> estrae il minimo. L'heap trova i top-K senza ordinare l'intera lista.</p>`,
      solution: `import heapq

top3 = heapq.nlargest(3, valori)
bottom2 = heapq.nsmallest(2, valori)

h = list(valori)
heapq.heapify(h)
minimo = heapq.heappop(h)

complessita_topk = "O(n log K)"

print("top 3:", top3)
print("bottom 2:", bottom2)
print("minimo:", minimo)`
    },

    { type: "theory", title: "Ricerca binaria", html: `
<p>La <strong>ricerca binaria</strong> trova un elemento in un array ORDINATO in O(log n), dimezzando lo spazio di ricerca a ogni passo. Su un milione di elementi, servono al massimo ~20 confronti invece di un milione.</p>
<pre><code>def ricerca_binaria(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1      # scarta la meta' sinistra
        else:
            hi = mid - 1      # scarta la meta' destra
    return -1                 # non trovato</code></pre>
<p>Il prerequisito è che l'array sia <strong>ordinato</strong>: solo così puoi scartare metà spazio guardando l'elemento centrale. Il modulo <code>bisect</code> di Python la implementa. È l'esempio didattico per eccellenza di O(log n).</p>
`, more: `
<p>La potenza di O(log n) è controintuitiva finché non la si quantifica: raddoppiare l'input aggiunge UN solo passo. 1000 elementi = ~10 confronti; 1 milione = ~20; 1 miliardo = ~30. Questa crescita lentissima è il motivo per cui la ricerca binaria (e le strutture ad albero bilanciato basate sulla stessa idea) scala a dati enormi. È lo stesso principio del "divide et impera": ridurre il problema a metà a ogni passo dà logaritmo. La differenza con la ricerca lineare O(n) diventa abissale su grandi dati — ed è il motivo per cui i database indicizzano (gli indici B-tree sono ricerca binaria generalizzata su disco).</p>
<p>Gli errori di implementazione della ricerca binaria sono famosi e istruttivi — è "facile da capire, difficile da scrivere giusta". I classici: <strong>off-by-one</strong> nei confini (<code>lo &lt;= hi</code> vs <code>lo &lt; hi</code>, <code>mid+1</code> vs <code>mid</code>) che causano loop infiniti o elementi mancati; <strong>overflow</strong> in <code>(lo+hi)</code> in linguaggi con interi a dimensione fissa (in Python non è un problema, ma in C/Java sì — si scrive <code>lo + (hi-lo)//2</code>). Un bug nella ricerca binaria della libreria standard di Java è rimasto nascosto per anni. Scriverla correttamente sotto pressione al colloquio è un test classico di attenzione ai dettagli.</p>
<p>La ricerca binaria è più versatile di "trova un elemento": la vera generalizzazione è "trova il punto di transizione in una sequenza monotona". <code>bisect_left</code>/<code>bisect_right</code> trovano dove INSERIRE un elemento mantenendo l'ordine — usato per inserimenti ordinati, per contare elementi in un range, per trovare il primo/ultimo elemento che soddisfa una condizione. E il pattern "binary search on the answer" risolve problemi di ottimizzazione dove la risposta è monotona (es. "qual è la capacità minima che permette di finire in K giorni?" — cerca binariamente sulla capacità). Riconoscere la monotonia di un problema e applicarci la ricerca binaria trasforma soluzioni O(n) o peggiori in O(log n) — una delle tecniche più eleganti del repertorio algoritmico.</p>
` },

    {
      type: "exercise", id: "al-07", kg: 15, title: "Ricerca binaria a mano",
      task: `<p>Implementa la ricerca binaria e verifica che funzioni e sia efficiente:</p>
<ul>
<li><code>ricerca_binaria</code>: funzione che restituisce l'indice del target o -1 (fornita)</li>
<li><code>pos_42</code>: l'indice di 42 in <code>arr</code> (ordinato)</li>
<li><code>pos_100</code>: il risultato per 100 (assente) — deve essere -1</li>
<li><code>passi_per_1000</code>: quanti confronti servono al MASSIMO per cercare in 1000 elementi (log2(1000) arrotondato per eccesso ≈ 10)</li>
</ul>`,
      setup: `import math
arr = [1, 5, 12, 19, 27, 33, 42, 55, 68, 71]`,
      starter: `import math
# arr: array ORDINATO

def ricerca_binaria(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

pos_42 = ricerca_binaria(arr, 42)
pos_100 = ...
passi_per_1000 = math.ceil(math.log2(1000))

print("posizione di 42:", pos_42)
print("posizione di 100:", pos_100)
print("passi max per 1000 elementi:", passi_per_1000)`,
      check: `import math
def _rb(arr, t):
    lo, hi = 0, len(arr)-1
    while lo<=hi:
        m=(lo+hi)//2
        if arr[m]==t: return m
        elif arr[m]<t: lo=m+1
        else: hi=m-1
    return -1
assert pos_42 == 6, "pos_42: 42 e' all'indice 6"
assert pos_100 == -1, "pos_100: 100 non c'e' -> -1"
assert passi_per_1000 == 10, "passi_per_1000: ceil(log2(1000)) = 10 — bastano 10 confronti per 1000 elementi!"`,
      hint: `<p>La funzione è fornita: <code>pos_100 = ricerca_binaria(arr, 100)</code> (torna -1). Il punto: 10 confronti bastano per 1000 elementi, contro i 1000 della ricerca lineare — potenza del logaritmo.</p>`,
      solution: `import math

def ricerca_binaria(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

pos_42 = ricerca_binaria(arr, 42)
pos_100 = ricerca_binaria(arr, 100)
passi_per_1000 = math.ceil(math.log2(1000))

print("posizione di 42:", pos_42)
print("posizione di 100:", pos_100)
print("passi max per 1000 elementi:", passi_per_1000)`
    },

    { type: "theory", title: "Grafi: BFS e DFS", html: `
<p>Un <strong>grafo</strong> è un insieme di nodi collegati da archi (una rete sociale, una mappa stradale, le dipendenze tra task). Due modi fondamentali di esplorarlo:</p>
<ul>
<li><strong>BFS</strong> (Breadth-First Search): esplora per LIVELLI, prima tutti i vicini, poi i vicini dei vicini. Usa una QUEUE. Trova il cammino più corto (in numero di archi).</li>
<li><strong>DFS</strong> (Depth-First Search): esplora in PROFONDITÀ, seguendo un ramo fino in fondo prima di tornare indietro. Usa uno STACK (o la ricorsione).</li>
</ul>
<pre><code># grafo come dizionario di adiacenza:
grafo = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}

# BFS: queue + insieme dei visitati
from collections import deque
def bfs(grafo, start):
    visitati, coda = {start}, deque([start])
    ordine = []
    while coda:
        nodo = coda.popleft()
        ordine.append(nodo)
        for vicino in grafo[nodo]:
            if vicino not in visitati:
                visitati.add(vicino)
                coda.append(vicino)
    return ordine</code></pre>
`, more: `
<p>La differenza BFS/DFS si riduce alla struttura dati: BFS usa una QUEUE (FIFO — esplora prima ciò che ha scoperto prima, quindi per livelli), DFS usa uno STACK (LIFO — esplora prima ciò che ha scoperto per ultimo, quindi in profondità). Cambiare deque.popleft() in stack.pop() trasforma un BFS in un DFS. La ricorsione è un DFS con lo stack implicito delle chiamate. Questa dualità elegante — stessa struttura di esplorazione, diversa struttura dati, comportamento opposto — è uno dei collegamenti più belli tra strutture dati e algoritmi.</p>
<p>Quando usare quale: <strong>BFS</strong> trova il cammino più CORTO in un grafo non pesato (esplorando per livelli, raggiunge un nodo alla distanza minima) — è la scelta per "qual è il grado di separazione?", "il percorso con meno passaggi", "i nodi entro distanza K". <strong>DFS</strong> è naturale per esplorare tutto, rilevare cicli, ordinamento topologico (dipendenze), trovare componenti connesse, e problemi di backtracking (labirinti, sudoku, tutte le combinazioni). BFS usa più memoria (tiene un intero livello in coda), DFS meno (solo il cammino corrente) ma può andare molto in profondità. La scelta dipende da cosa cerchi: cammino minimo → BFS; esplorazione completa/cicli/dipendenze → DFS.</p>
<p>L'<strong>insieme dei visitati</strong> è cruciale e spesso dimenticato: senza di esso, in un grafo con cicli l'esplorazione va in loop infinito (torni su nodi già visti all'infinito). È una hashmap/set (lookup O(1)) — di nuovo la struttura dati giusta che rende l'algoritmo efficiente. La complessità di BFS/DFS è O(V + E) (nodi + archi): visiti ogni nodo e ogni arco una volta. I grafi modellano una quantità sorprendente di problemi reali — reti sociali (BFS per "amici di amici"), dipendenze di build/task (DFS per ordinamento topologico), routing di rete, knowledge graph, e nel ML le graph neural network e i sistemi di raccomandazione basati su grafi. Saper rappresentare un problema come grafo ed esplorarlo con BFS/DFS è competenza CS fondamentale che i colloqui delle big tech verificano sempre.</p>
` },

    {
      type: "exercise", id: "al-08", kg: 20, title: "BFS: il cammino più corto",
      task: `<p>Implementa BFS per trovare la distanza minima (numero di archi) da un nodo a tutti gli altri:</p>
<ul>
<li><code>bfs_distanze</code>: funzione che restituisce un dict nodo&rarr;distanza dal start, esplorando per livelli con una queue (fornita)</li>
<li><code>distanze</code>: le distanze da "A" nel grafo</li>
<li><code>dist_D</code>: la distanza di D da A (deve essere 2: A&rarr;B&rarr;D o A&rarr;C&rarr;D)</li>
<li><code>usa_queue</code>: <code>True</code> — BFS usa una queue (FIFO), non uno stack</li>
</ul>`,
      setup: `grafo = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
}`,
      starter: `from collections import deque
# grafo: dizionario di adiacenza

def bfs_distanze(grafo, start):
    distanze = {start: 0}
    coda = deque([start])
    while coda:
        nodo = coda.popleft()
        for vicino in grafo[nodo]:
            if vicino not in distanze:
                distanze[vicino] = distanze[nodo] + 1
                coda.append(vicino)
    return distanze

distanze = bfs_distanze(grafo, "A")
dist_D = ...
usa_queue = ...

print("distanze da A:", distanze)`,
      check: `from collections import deque
def _bfs(g, s):
    d={s:0}; c=deque([s])
    while c:
        n=c.popleft()
        for v in g[n]:
            if v not in d: d[v]=d[n]+1; c.append(v)
    return d
_dist = _bfs(grafo, "A")
assert distanze == _dist, "distanze: bfs_distanze(grafo, 'A')"
assert dist_D == 2, "dist_D: D e' a distanza 2 da A (A->B->D)"
assert distanze["E"] == 3, "E e' a distanza 3 (A->B->D->E)"
assert usa_queue == True, "usa_queue: True — BFS esplora per livelli con una queue FIFO"`,
      hint: `<p>La funzione è fornita: <code>dist_D = distanze["D"]</code>. BFS esplora per livelli, quindi la prima volta che raggiunge un nodo è per il cammino più corto. <code>usa_queue = True</code>.</p>`,
      solution: `from collections import deque

def bfs_distanze(grafo, start):
    distanze = {start: 0}
    coda = deque([start])
    while coda:
        nodo = coda.popleft()
        for vicino in grafo[nodo]:
            if vicino not in distanze:
                distanze[vicino] = distanze[nodo] + 1
                coda.append(vicino)
    return distanze

distanze = bfs_distanze(grafo, "A")
dist_D = distanze["D"]
usa_queue = True

print("distanze da A:", distanze)`
    },

    {
      type: "exercise", id: "al-09", kg: 20, title: "DFS: esplorare in profondità",
      task: `<p>Implementa DFS (ricorsivo) per raccogliere tutti i nodi raggiungibili, e confronta l'ordine con BFS:</p>
<ul>
<li><code>dfs</code>: funzione ricorsiva che visita in profondità, tenendo un set di visitati (fornita)</li>
<li><code>ordine_dfs</code>: l'ordine di visita DFS da "A"</li>
<li><code>tutti_raggiunti</code>: <code>True</code> se DFS raggiunge tutti i 5 nodi</li>
<li><code>dfs_usa_stack</code>: <code>True</code> — DFS usa uno stack (o la ricorsione, che è uno stack implicito)</li>
</ul>`,
      setup: `grafo = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E"],
    "D": [],
    "E": [],
}`,
      starter: `# grafo: dizionario di adiacenza

def dfs(grafo, nodo, visitati=None, ordine=None):
    if visitati is None:
        visitati, ordine = set(), []
    visitati.add(nodo)
    ordine.append(nodo)
    for vicino in grafo[nodo]:
        if vicino not in visitati:
            dfs(grafo, vicino, visitati, ordine)
    return ordine

ordine_dfs = dfs(grafo, "A")
tutti_raggiunti = ...
dfs_usa_stack = ...

print("ordine DFS:", ordine_dfs)`,
      check: `def _dfs(g, n, v=None, o=None):
    if v is None: v, o = set(), []
    v.add(n); o.append(n)
    for w in g[n]:
        if w not in v: _dfs(g, w, v, o)
    return o
_od = _dfs(grafo, "A")
assert ordine_dfs == _od == ["A", "B", "D", "C", "E"], "ordine_dfs: A->B->D (fondo), poi torna e fa C->E"
assert tutti_raggiunti == True, "tutti_raggiunti: len(ordine_dfs) == 5"
assert dfs_usa_stack == True, "dfs_usa_stack: True — DFS usa uno stack (la ricorsione e' uno stack implicito)"`,
      hint: `<p>La funzione è fornita: <code>tutti_raggiunti = len(ordine_dfs) == 5</code>. Nota l'ordine: DFS scende A&rarr;B&rarr;D fino in fondo PRIMA di esplorare C. <code>dfs_usa_stack = True</code>.</p>`,
      solution: `def dfs(grafo, nodo, visitati=None, ordine=None):
    if visitati is None:
        visitati, ordine = set(), []
    visitati.add(nodo)
    ordine.append(nodo)
    for vicino in grafo[nodo]:
        if vicino not in visitati:
            dfs(grafo, vicino, visitati, ordine)
    return ordine

ordine_dfs = dfs(grafo, "A")
tutti_raggiunti = len(ordine_dfs) == 5
dfs_usa_stack = True

print("ordine DFS:", ordine_dfs)`
    },

    { type: "theory", title: "Programmazione dinamica", html: `
<p>La <strong>programmazione dinamica</strong> (DP) risolve problemi complessi scomponendoli in sottoproblemi che si ripetono, e MEMORIZZANDO i risultati per non ricalcolarli. Trasforma soluzioni esponenziali in polinomiali.</p>
<pre><code># Fibonacci ingenuo: O(2^n) — ricalcola gli stessi valori all'infinito
def fib_lento(n):
    if n < 2: return n
    return fib_lento(n-1) + fib_lento(n-2)

# con memoization: O(n) — ogni valore calcolato una volta
def fib(n, memo={}):
    if n < 2: return n
    if n not in memo:
        memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]</code></pre>
<p>Due ingredienti: <strong>sottoproblemi sovrapposti</strong> (gli stessi calcoli tornano) e <strong>sottostruttura ottima</strong> (la soluzione ottima si costruisce da quelle dei sottoproblemi). La memoization (top-down) o la tabulazione (bottom-up) evitano il ricalcolo.</p>
`, more: `
<p>Fibonacci illustra perfettamente il salto: la versione ingenua ricalcola fib(5) un numero esponenziale di volte (l'albero delle chiamate esplode), rendendo fib(50) impraticabile. La memoization tiene un dizionario dei valori già calcolati: ogni fib(k) si calcola UNA sola volta, e le chiamate successive lo leggono in O(1) — da O(2ⁿ) a O(n). È di nuovo una hashmap che salva la situazione (il memo), lo stesso principio di "non rifare lavoro già fatto" che attraversa tutti gli algoritmi efficienti.</p>
<p>Le due varianti di DP: <strong>top-down</strong> (ricorsione + memoization — parti dal problema grande e scendi, memorizzando; naturale da scrivere, segue la struttura ricorsiva); <strong>bottom-up</strong> (tabulazione — parti dai sottoproblemi più piccoli e costruisci una tabella fino alla soluzione; spesso più efficiente in memoria e senza rischio di stack overflow ricorsivo). Sono equivalenti in complessità; la scelta è di stile e di vincoli. Il bottom-up permette a volte ottimizzazioni di spazio (se ti servono solo gli ultimi due valori come in Fibonacci, tieni due variabili invece dell'intera tabella — O(1) spazio).</p>
<p>Riconoscere quando un problema è "DP" è la vera competenza: cerca i segnali di sottoproblemi sovrapposti (una ricorsione naïve ricalcola le stesse cose) e sottostruttura ottima (la soluzione si compone da soluzioni parziali). I classici da colloquio: knapsack (zaino con capacità), longest common subsequence (diff tra file, allineamento di sequenze DNA), edit distance (correzione ortografica, la stessa idea del confronto tra stringhe), cammini minimi, taglio dell'asta. Nel ML/data: l'edit distance per il fuzzy matching, gli algoritmi di allineamento in bioinformatica, la programmazione dinamica nei modelli a sequenza (Viterbi negli HMM, che è DP). La DP è potente ma va usata quando serve — se non ci sono sottoproblemi ripetuti, non aiuta; e per problemi enormi anche O(n²) di DP può essere troppo. Ma quando un problema esponenziale diventa trattabile grazie alla DP, la differenza è tra impossibile e istantaneo.</p>
` },

    {
      type: "exercise", id: "al-10", kg: 20, title: "Memoization: da esponenziale a lineare",
      task: `<p>Dimostra il potere della memoization confrontando Fibonacci con e senza. Conta le chiamate:</p>
<ul>
<li><code>chiamate_lento</code>: quante chiamate fa <code>fib_lento(15)</code> (contatore fornito) — sarà esponenziale</li>
<li><code>chiamate_memo</code>: quante ne fa la versione con memoization di fib(15) — lineare</li>
<li><code>stesso_risultato</code>: <code>True</code> se i due danno lo stesso Fibonacci</li>
<li><code>memo_molto_meglio</code>: <code>True</code> se la versione memo fa MOLTE meno chiamate (meno di 1/10)</li>
</ul>`,
      starter: `contatore = {"lento": 0, "memo": 0}

def fib_lento(n):
    contatore["lento"] += 1
    if n < 2: return n
    return fib_lento(n-1) + fib_lento(n-2)

def fib_memo(n, memo={}):
    contatore["memo"] += 1
    if n < 2: return n
    if n not in memo:
        memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

ris_lento = fib_lento(15)
ris_memo = fib_memo(15)
chiamate_lento = contatore["lento"]
chiamate_memo = contatore["memo"]
stesso_risultato = ...
memo_molto_meglio = ...

print(f"fib(15) = {ris_lento} | chiamate: lento={chiamate_lento}, memo={chiamate_memo}")`,
      check: `assert stesso_risultato == True, "stesso_risultato: entrambi danno fib(15) = 610"
assert chiamate_lento > 1000, "chiamate_lento: esponenziale, oltre mille chiamate per fib(15)"
assert chiamate_memo < 35, "chiamate_memo: lineare, poche decine di chiamate"
assert memo_molto_meglio == True, "memo_molto_meglio: la memoization fa ordini di grandezza meno chiamate"`,
      hint: `<p><code>stesso_risultato = ris_lento == ris_memo</code>. <code>memo_molto_meglio = chiamate_memo &lt; chiamate_lento / 10</code>. fib_lento fa ~1973 chiamate, fib_memo ~31: la differenza tra esponenziale e lineare.</p>`,
      solution: `contatore = {"lento": 0, "memo": 0}

def fib_lento(n):
    contatore["lento"] += 1
    if n < 2: return n
    return fib_lento(n-1) + fib_lento(n-2)

def fib_memo(n, memo={}):
    contatore["memo"] += 1
    if n < 2: return n
    if n not in memo:
        memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

ris_lento = fib_lento(15)
ris_memo = fib_memo(15)
chiamate_lento = contatore["lento"]
chiamate_memo = contatore["memo"]
stesso_risultato = ris_lento == ris_memo
memo_molto_meglio = chiamate_memo < chiamate_lento / 10

print(f"fib(15) = {ris_lento} | chiamate: lento={chiamate_lento}, memo={chiamate_memo}")`
    },

    {
      type: "exercise", id: "al-11", kg: 15, title: "Quiz: strutture dati e algoritmi",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Il lookup 'x in dizionario' è O(1) medio, mentre 'x in lista' è O(n)"</li>
<li><code>a2</code>: "Uno stack è FIFO: il primo entrato è il primo a uscire"</li>
<li><code>a3</code>: "La ricerca binaria richiede che l'array sia ordinato"</li>
<li><code>a4</code>: "BFS usa una queue e trova il cammino più corto in un grafo non pesato"</li>
<li><code>a5</code>: "La memoization può trasformare un algoritmo da O(2ⁿ) a O(n)"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: dict/set O(1), lista O(n)"
assert a2 == False, "a2 FALSA: lo stack e' LIFO (Last In First Out); e' la QUEUE a essere FIFO"
assert a3 == True, "a3 VERA: senza ordinamento non puoi scartare meta' spazio"
assert a4 == True, "a4 VERA: BFS + queue = cammino minimo per numero di archi"
assert a5 == True, "a5 VERA: memoizzare i sottoproblemi ripetuti (es. Fibonacci)"`,
      hint: `<p>La trappola è a2: lo stack è LIFO (pila di piatti), è la queue a essere FIFO (fila). Le altre riprendono le lavagne: hashmap O(1) (a1), ricerca binaria ordinata (a3), BFS cammino minimo (a4), memoization (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "al-12", kg: 25, title: "MASSIMALE: la cache LRU",
      task: `<p>Il gran finale: implementa una <strong>LRU cache</strong> (Least Recently Used), la struttura dietro ogni sistema di caching. Combina hashmap (lookup O(1)) e ordine di accesso. Domanda classica delle big tech.</p>
<ul>
<li>completa <code>LRUCache</code> (scheletro fornito): capacità fissa; <code>get(k)</code> restituisce il valore e lo segna come usato di recente; <code>put(k,v)</code> inserisce, e se si supera la capacità elimina il meno recentemente usato</li>
<li>usa un <code>OrderedDict</code> (mantiene l'ordine di inserimento/uso)</li>
<li><code>dopo_operazioni</code>: le chiavi rimaste in cache dopo la sequenza di test</li>
<li><code>a_stato_evitto</code>: <code>True</code> se la chiave "a" è stata evitta (era la meno usata)</li>
<li><code>get_a_dopo_evizione</code>: il risultato di <code>get("a")</code> dopo l'evizione (deve essere None)</li>
</ul>`,
      starter: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacita):
        self.cache = OrderedDict()
        self.capacita = capacita

    def get(self, chiave):
        if chiave not in self.cache:
            return None
        # segna come usata di recente: spostala in fondo
        self.cache.move_to_end(chiave)
        return self.cache[chiave]

    def put(self, chiave, valore):
        if chiave in self.cache:
            self.cache.move_to_end(chiave)
        self.cache[chiave] = valore
        if len(self.cache) > self.capacita:
            # elimina il meno recentemente usato (il primo)
            self.cache.popitem(last=False)

# test: capacita 2
c = LRUCache(2)
c.put("a", 1)
c.put("b", 2)
c.get("a")        # "a" ora e' usata di recente -> "b" diventa la meno usata
c.put("c", 3)     # supera capacita: evince "b"... o "a"?

dopo_operazioni = list(c.cache.keys())
# dopo get('a'), 'a' e' recente e 'b' e' vecchia -> put('c') evince 'b'
b_evitta = "b" not in c.cache
get_b_dopo = c.get("b")

print("chiavi in cache:", dopo_operazioni)
print("b evitta:", b_evitta, "| get('b'):", get_b_dopo)`,
      check: `from collections import OrderedDict
class _LRU:
    def __init__(s,c): s.cache=OrderedDict(); s.cap=c
    def get(s,k):
        if k not in s.cache: return None
        s.cache.move_to_end(k); return s.cache[k]
    def put(s,k,v):
        if k in s.cache: s.cache.move_to_end(k)
        s.cache[k]=v
        if len(s.cache)>s.cap: s.cache.popitem(last=False)
_c=_LRU(2); _c.put("a",1); _c.put("b",2); _c.get("a"); _c.put("c",3)
_keys = list(_c.cache.keys())
assert dopo_operazioni == _keys == ["a", "c"], "dopo_operazioni: ['a','c'] — get('a') l'ha resa recente, quindi put('c') evince 'b'"
assert b_evitta == True, "b_evitta: True — 'b' era la meno recentemente usata"
assert get_b_dopo is None, "get_b_dopo: None — 'b' e' stata evitta dalla cache"`,
      hint: `<p>La classe è completa: verifica solo il comportamento. Dopo <code>get("a")</code>, "a" è la più recente e "b" la più vecchia, quindi <code>put("c")</code> evince "b". <code>dopo_operazioni</code> e <code>b_evitta</code>/<code>get_b_dopo</code> sono già impostati — controlla che il test giri.</p>`,
      solution: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacita):
        self.cache = OrderedDict()
        self.capacita = capacita

    def get(self, chiave):
        if chiave not in self.cache:
            return None
        self.cache.move_to_end(chiave)
        return self.cache[chiave]

    def put(self, chiave, valore):
        if chiave in self.cache:
            self.cache.move_to_end(chiave)
        self.cache[chiave] = valore
        if len(self.cache) > self.capacita:
            self.cache.popitem(last=False)

c = LRUCache(2)
c.put("a", 1)
c.put("b", 2)
c.get("a")
c.put("c", 3)

dopo_operazioni = list(c.cache.keys())
b_evitta = "b" not in c.cache
get_b_dopo = c.get("b")

print("chiavi in cache:", dopo_operazioni)
print("b evitta:", b_evitta, "| get('b'):", get_b_dopo)`
    }

  ]
});
