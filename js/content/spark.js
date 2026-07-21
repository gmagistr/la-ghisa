window.MODULES.push({
  id: "spark",
  name: "Spark & Big Data",
  tagline: "La sala del calcolo distribuito: RDD, lazy evaluation, partizioni, map/reduce, shuffle. Un mini-Spark costruito in Python.",
  intro: "Quando i dati non entrano in una macchina, serve il calcolo distribuito. Spark è lo standard. Qui costruisci un mini-Spark in Python — lazy evaluation, partizioni, trasformazioni e azioni, map/reduce, shuffle — per capire come si elaborano dataset enormi su tante macchine.",
  packages: [],
  items: [

    { type: "theory", title: "Perché il calcolo distribuito", html: `
<p>Quando un dataset è troppo grande per una singola macchina (terabyte, petabyte), o l'elaborazione è troppo lenta, si distribuisce il lavoro su un <strong>cluster</strong> di macchine. <strong>Spark</strong> è il framework dominante per questo.</p>
<p>L'idea centrale: <strong>spezza i dati in partizioni</strong>, distribuiscile sulle macchine, elabora ogni partizione IN PARALLELO, poi ricombina. Il principio guida è "<em>porta il calcolo ai dati</em>", non i dati al calcolo (spostare petabyte è proibitivo).</p>
<pre><code># concettualmente, i dati sono divisi in partizioni distribuite:
dati = [1, 2, 3, 4, 5, 6, 7, 8]
partizioni = [[1, 2], [3, 4], [5, 6], [7, 8]]   # su 4 macchine
# ogni macchina elabora la sua partizione in parallelo</code></pre>
<p>Spark astrae tutto questo: scrivi codice come se i dati fossero locali, e il framework gestisce distribuzione, parallelismo e guasti.</p>
`, more: `
<p>Spark nasce come evoluzione di <strong>MapReduce</strong> (Hadoop), il paradigma che ha reso possibile il big data: esprimere l'elaborazione come operazioni <em>map</em> (trasforma ogni elemento indipendentemente, perfettamente parallelizzabile) e <em>reduce</em> (aggrega i risultati). Il vantaggio di Spark su Hadoop MapReduce è la velocità: Hadoop scrive su disco tra ogni passo, Spark tiene i dati in MEMORIA quando possibile, risultando 10-100x più veloce per pipeline con più passaggi e per algoritmi iterativi (come il ML, che ripete sui dati molte volte). Questa in-memory computing è la ragione principale del dominio di Spark.</p>
<p>Il principio "<strong>porta il calcolo ai dati</strong>" (data locality) è fondamentale e controintuitivo per chi viene dal calcolo locale: quando hai petabyte distribuiti su cento macchine, spostare i dati verso un calcolatore centrale è impossibile (troppo lento, troppa rete). Invece si manda il CODICE (piccolo) alle macchine dove i dati già risiedono, si elabora localmente, e si spostano solo i risultati (piccoli). È lo stesso principio che, nel cloud, sconsiglia l'egress: elabora dove sono i dati. Questo capovolge il modello mentale: non "carico i dati nel programma" ma "distribuisco il programma sui dati".</p>
<p>Quando NON serve Spark è una domanda da colloquio importante: Spark ha un overhead significativo (coordinamento del cluster, serializzazione, avvio) che lo rende PIÙ LENTO di pandas per dati che entrano in una macchina (fino a decine di GB su hardware moderno). La regola: se i dati stanno in RAM, usa pandas/polars; se non ci stanno o servono più macchine, Spark. Molti progetti usano Spark "perché è big data" quando pandas sarebbe più veloce e semplice — over-engineering. Saper riconoscere la soglia (i tuoi dati sono DAVVERO big?) evita complessità inutile. Nel 2026 strumenti come Polars e DuckDB gestiscono su una macchina volumi che una volta richiedevano Spark, alzando quella soglia.</p>
` },

    {
      type: "exercise", id: "sp-01", kg: 5, title: "Partizionare i dati",
      task: `<p>Simula la partizione di un dataset su un cluster: dividi i dati in N partizioni da distribuire sulle macchine:</p>
<ul>
<li><code>partiziona</code>: funzione che divide una lista in <code>n</code> partizioni il più uguali possibile (fornita)</li>
<li><code>partizioni</code>: i dati divisi in 4 partizioni</li>
<li><code>n_partizioni</code>: quante partizioni</li>
<li><code>tutti_i_dati</code>: <code>True</code> se ricomponendo le partizioni si riottengono tutti i dati originali</li>
</ul>`,
      setup: `dati = list(range(1, 13))   # [1, 2, ..., 12]`,
      starter: `# dati: 12 elementi da distribuire

def partiziona(dati, n):
    return [dati[i::n] for i in range(n)]   # round-robin tra n partizioni

partizioni = partiziona(dati, 4)
n_partizioni = ...
ricomposti = sorted(x for p in partizioni for x in p)
tutti_i_dati = ...

print("partizioni:", partizioni)
print("ricomposti:", ricomposti)`,
      check: `def _p(d, n): return [d[i::n] for i in range(n)]
_part = _p(dati, 4)
assert partizioni == _part, "partizioni: partiziona(dati, 4)"
assert n_partizioni == 4, "n_partizioni: 4"
assert tutti_i_dati == True, "tutti_i_dati: ricomponendo si riottengono tutti i 12 dati"
assert sorted(x for p in partizioni for x in p) == dati, "nessun dato perso nella partizione"`,
      hint: `<p><code>n_partizioni = len(partizioni)</code>. <code>tutti_i_dati = ricomposti == dati</code>. Partizionare divide senza perdere né duplicare: ricomponendo si torna all'originale.</p>`,
      solution: `def partiziona(dati, n):
    return [dati[i::n] for i in range(n)]

partizioni = partiziona(dati, 4)
n_partizioni = len(partizioni)
ricomposti = sorted(x for p in partizioni for x in p)
tutti_i_dati = ricomposti == dati

print("partizioni:", partizioni)
print("ricomposti:", ricomposti)`
    },

    { type: "theory", title: "RDD e DataFrame", html: `
<p>Spark offre due astrazioni per i dati distribuiti:</p>
<ul>
<li><strong>RDD</strong> (Resilient Distributed Dataset): la struttura base, una collezione distribuita di oggetti su cui applichi trasformazioni funzionali (map, filter, reduce). Basso livello, flessibile.</li>
<li><strong>DataFrame</strong>: come una tabella pandas ma distribuita, con colonne tipizzate e ottimizzatore SQL. Alto livello, più veloce (grazie all'ottimizzatore Catalyst), è l'API consigliata oggi.</li>
</ul>
<pre><code># RDD stile funzionale:
rdd.map(lambda x: x * 2).filter(lambda x: x > 10).collect()

# DataFrame stile SQL/pandas:
df.select("nome", "eta").filter(df.eta > 30).groupBy("citta").count()</code></pre>
<p>La "R" di RDD è <strong>Resilient</strong>: se una macchina cade, Spark ricostruisce la partizione persa rieseguendo le trasformazioni che l'hanno prodotta (tramite il <em>lineage</em>, la storia delle operazioni). Tolleranza ai guasti automatica.</p>
`, more: `
<p>La <strong>resilienza</strong> tramite lineage è un'idea elegante: invece di replicare i dati (costoso in memoria), Spark ricorda la SEQUENZA di trasformazioni che ha prodotto ogni partizione (il DAG delle operazioni). Se una macchina cade e perde una partizione, Spark la RICALCOLA rieseguendo quelle trasformazioni sui dati d'origine, sulle macchine sopravvissute. È tolleranza ai guasti "per ricostruzione" invece che "per replica" — adatta a cluster grandi dove i guasti sono la norma, non l'eccezione (con centinaia di macchine, qualcuna cade sempre). Questo rende gli RDD "resilienti" senza il costo della replica totale.</p>
<p>Il DataFrame ha soppiantato l'RDD come API consigliata per una ragione di PERFORMANCE: l'ottimizzatore <strong>Catalyst</strong> analizza la query (le operazioni sul DataFrame) e la RISCRIVE in modo più efficiente prima di eseguirla — riordina i filtri (applica i filtri prima possibile per ridurre i dati, predicate pushdown), elimina colonne non usate, ottimizza i join. Con gli RDD, Spark esegue esattamente ciò che scrivi (nessuna ottimizzazione, sei tu responsabile dell'efficienza). Con i DataFrame, scrivi COSA vuoi e l'ottimizzatore decide COME — come in SQL. Per questo, salvo casi che richiedono controllo di basso livello, si usano i DataFrame.</p>
<p>Il collegamento con pandas e SQL è forte e trasferibile: l'API DataFrame di Spark somiglia deliberatamente a pandas (<code>select</code>, <code>filter</code>, <code>groupBy</code>) e a SQL (Spark supporta SQL diretto sui DataFrame). Chi conosce pandas (sale Pandas) e SQL (sala SQL) ritrova gli stessi concetti — selezione, filtro, aggregazione, join — applicati a dati distribuiti. La differenza chiave da interiorizzare è la LAZY EVALUATION (prossima lavagna): in pandas ogni operazione esegue subito, in Spark le trasformazioni si accumulano e l'esecuzione parte solo a un'azione. Questa è la fonte principale di confusione per chi passa da pandas a Spark, e il concetto che sblocca la comprensione del framework.</p>
` },

    {
      type: "exercise", id: "sp-02", kg: 10, title: "Trasformazioni funzionali su RDD",
      task: `<p>Simula un RDD con le trasformazioni funzionali map e filter (in stile Spark, ma su una lista):</p>
<ul>
<li><code>rdd</code>: i dati di partenza</li>
<li><code>mappati</code>: ogni elemento moltiplicato per 2 (come <code>rdd.map(lambda x: x*2)</code>)</li>
<li><code>filtrati</code>: dai mappati, solo quelli &gt; 10 (come <code>.filter(lambda x: x > 10)</code>)</li>
<li><code>somma</code>: la somma dei filtrati (come <code>.reduce(lambda a,b: a+b)</code>)</li>
</ul>`,
      setup: `rdd = [2, 4, 6, 8, 10]`,
      starter: `from functools import reduce
# rdd: dati "distribuiti"

mappati = [x * 2 for x in rdd]                    # map
filtrati = ...                                     # filter: > 10
somma = reduce(lambda a, b: a + b, filtrati)       # reduce

print("mappati:", mappati)
print("filtrati:", filtrati)
print("somma:", somma)`,
      check: `from functools import reduce
_m = [x*2 for x in rdd]; _f = [x for x in _m if x > 10]; _s = reduce(lambda a,b:a+b, _f)
assert mappati == _m == [4, 8, 12, 16, 20], "mappati: ogni elemento * 2"
assert filtrati == _f == [12, 16, 20], "filtrati: i mappati > 10"
assert somma == _s == 48, "somma: reduce di addizione = 48"`,
      hint: `<p><code>filtrati = [x for x in mappati if x > 10]</code>. Le tre operazioni (map, filter, reduce) sono il cuore del paradigma funzionale distribuito: trasforma, seleziona, aggrega.</p>`,
      solution: `from functools import reduce

mappati = [x * 2 for x in rdd]
filtrati = [x for x in mappati if x > 10]
somma = reduce(lambda a, b: a + b, filtrati)

print("mappati:", mappati)
print("filtrati:", filtrati)
print("somma:", somma)`
    },

    { type: "theory", title: "Lazy evaluation: trasformazioni e azioni", html: `
<p>Il concetto più importante di Spark: le operazioni si dividono in due tipi, e la valutazione è <strong>lazy</strong> (pigra).</p>
<ul>
<li><strong>Trasformazioni</strong> (map, filter, groupBy, join): NON eseguono nulla subito. Costruiscono solo un PIANO (il DAG delle operazioni). Sono "lazy".</li>
<li><strong>Azioni</strong> (collect, count, save, take): FANNO PARTIRE l'esecuzione dell'intero piano accumulato.</li>
</ul>
<pre><code>piano = rdd.map(f).filter(g).map(h)   # niente esegue! solo il piano
risultato = piano.collect()            # ORA parte tutto, ottimizzato</code></pre>
<p>Perché lazy? Perché conoscendo l'INTERO piano prima di eseguire, Spark può OTTIMIZZARLO: combinare operazioni, eliminare passaggi inutili, minimizzare i dati spostati. È la stessa idea di un ottimizzatore SQL. La lazy evaluation è la fonte principale di confusione per chi arriva da pandas (dove tutto esegue subito).</p>
`, more: `
<p>La lazy evaluation abilita ottimizzazioni impossibili con l'esecuzione immediata. Esempio: <code>rdd.map(costosa).filter(rara).take(10)</code> — se Spark eseguisse subito, applicherebbe <code>costosa</code> a TUTTI i dati, poi filtrerebbe, poi prenderebbe 10. Essendo lazy, sa che ti servono solo 10 elementi e può fermarsi appena li trova, applicando <code>costosa</code> a una frazione dei dati. Altri esempi: combinare più <code>map</code> consecutivi in un solo passaggio sui dati (pipelining), spingere i filtri il più presto possibile (predicate pushdown) per ridurre i dati elaborati a valle, eliminare trasformazioni i cui risultati non vengono mai usati. Conoscere l'intero piano prima di eseguire è ciò che rende possibile tutto questo.</p>
<p>La confusione tipica di chi viene da pandas: in pandas <code>df[df.x > 5]</code> esegue e restituisce dati SUBITO; in Spark la stessa operazione restituisce solo un nuovo piano, e nulla è calcolato finché non chiami un'azione. Questo spiega comportamenti sconcertanti per i principianti: "il mio codice Spark è istantaneo!" (perché non ha eseguito nulla, ha solo costruito il piano) seguito da "collect() ci mette un'eternità!" (perché ORA esegue tutto). E gli errori possono emergere solo all'azione, non alla trasformazione che li contiene — debugging spiazzante finché non si interiorizza il modello lazy.</p>
<p>Un'implicazione pratica importante: le trasformazioni vengono RIESEGUITE ogni volta che chiami un'azione, perché Spark non conserva i risultati intermedi di default. Se fai <code>piano.count()</code> e poi <code>piano.collect()</code>, l'intero piano gira DUE volte. Per riusare un risultato intermedio costoso si usa <code>cache()</code>/<code>persist()</code> (prossima lavagna), che dice a Spark di conservare quel dataset in memoria. Dimenticare il caching su dati riusati è una delle cause più comuni di lentezza in Spark — il codice funziona ma ricalcola tutto ripetutamente. La lazy evaluation è potente ma richiede di pensare in termini di "piano" e "quando materializzo", un cambio di mentalità rispetto all'esecuzione riga per riga.</p>
` },

    {
      type: "exercise", id: "sp-03", kg: 15, title: "Costruire un piano lazy",
      task: `<p>Simula la lazy evaluation: le trasformazioni accumulano un piano, l'azione lo esegue. Usa una classe che registra le operazioni senza eseguirle finché non chiami <code>collect</code>:</p>
<ul>
<li><code>LazyRDD</code>: classe con <code>map</code>/<code>filter</code> che accumulano operazioni e <code>collect</code> che esegue (fornita)</li>
<li>costruisci un piano: map(×2) poi filter(&gt;5), SENZA eseguire</li>
<li><code>n_operazioni_nel_piano</code>: quante operazioni accumulate PRIMA di collect (deve essere 2)</li>
<li><code>eseguito_solo_con_collect</code>: <code>True</code> se il piano si esegue solo chiamando collect</li>
<li><code>risultato</code>: il risultato di collect()</li>
</ul>`,
      setup: `dati = [1, 2, 3, 4, 5, 6]`,
      starter: `class LazyRDD:
    def __init__(self, dati, operazioni=None):
        self.dati = dati
        self.operazioni = operazioni or []
    def map(self, f):
        return LazyRDD(self.dati, self.operazioni + [("map", f)])
    def filter(self, f):
        return LazyRDD(self.dati, self.operazioni + [("filter", f)])
    def collect(self):
        risultato = list(self.dati)
        for tipo, f in self.operazioni:
            if tipo == "map":
                risultato = [f(x) for x in risultato]
            else:
                risultato = [x for x in risultato if f(x)]
        return risultato

# costruisci il piano (lazy: niente esegue)
piano = LazyRDD(dati).map(lambda x: x * 2).filter(lambda x: x > 5)

n_operazioni_nel_piano = ...
eseguito_solo_con_collect = ...
risultato = piano.collect()

print("operazioni nel piano:", n_operazioni_nel_piano)
print("risultato dopo collect:", risultato)`,
      check: `class _L:
    def __init__(s,d,o=None): s.dati=d; s.op=o or []
    def map(s,f): return _L(s.dati, s.op+[("map",f)])
    def filter(s,f): return _L(s.dati, s.op+[("filter",f)])
    def collect(s):
        r=list(s.dati)
        for t,f in s.op:
            r=[f(x) for x in r] if t=="map" else [x for x in r if f(x)]
        return r
_p = _L(dati).map(lambda x:x*2).filter(lambda x:x>5)
assert n_operazioni_nel_piano == 2, "n_operazioni_nel_piano: len(piano.operazioni) = 2 (map + filter)"
assert eseguito_solo_con_collect == True, "eseguito_solo_con_collect: True — le trasformazioni sono lazy"
assert risultato == _p.collect() == [6, 8, 10, 12], "risultato: [2,4,6,8,10,12] filtrato >5 = [6,8,10,12]"`,
      hint: `<p><code>n_operazioni_nel_piano = len(piano.operazioni)</code> (2, accumulate ma non eseguite). <code>eseguito_solo_con_collect = True</code>. Le trasformazioni costruiscono il piano; solo collect() lo esegue.</p>`,
      solution: `class LazyRDD:
    def __init__(self, dati, operazioni=None):
        self.dati = dati
        self.operazioni = operazioni or []
    def map(self, f):
        return LazyRDD(self.dati, self.operazioni + [("map", f)])
    def filter(self, f):
        return LazyRDD(self.dati, self.operazioni + [("filter", f)])
    def collect(self):
        risultato = list(self.dati)
        for tipo, f in self.operazioni:
            if tipo == "map":
                risultato = [f(x) for x in risultato]
            else:
                risultato = [x for x in risultato if f(x)]
        return risultato

piano = LazyRDD(dati).map(lambda x: x * 2).filter(lambda x: x > 5)

n_operazioni_nel_piano = len(piano.operazioni)
eseguito_solo_con_collect = True
risultato = piano.collect()

print("operazioni nel piano:", n_operazioni_nel_piano)
print("risultato dopo collect:", risultato)`
    },

    { type: "theory", title: "Map-reduce distribuito", html: `
<p>Il pattern <strong>map-reduce</strong> è come si aggregano dati distribuiti. Il conteggio delle parole (word count) è l'esempio canonico:</p>
<pre><code># MAP: ogni partizione produce coppie (parola, 1) — in PARALLELO
partizione_1 -> [("gatto", 1), ("cane", 1), ("gatto", 1)]
partizione_2 -> [("cane", 1), ("gatto", 1)]

# REDUCE: aggrega per chiave, sommando — combina i risultati
risultato -> {"gatto": 3, "cane": 2}</code></pre>
<p>La chiave è che il <strong>map è perfettamente parallelizzabile</strong> (ogni partizione elabora indipendentemente, senza comunicare), mentre il <strong>reduce combina</strong> i risultati parziali. Questo pattern scala a qualsiasi dimensione: raddoppia le macchine, dimezza (idealmente) il tempo del map. È il fondamento di tutto il big data.</p>
`, more: `
<p>La forza di map-reduce è che decompone il calcolo in una parte EMBARRASSINGLY PARALLEL (il map — nessuna dipendenza tra partizioni, scala linearmente con le macchine) e una parte di aggregazione (il reduce). Il word count lo illustra: contare le parole di un petabyte di testo è impossibile su una macchina, ma dividendolo in migliaia di partizioni, ogni macchina conta le SUE parole in parallelo (map), poi si sommano i conteggi parziali per chiave (reduce). Lo stesso pattern calcola somme, medie, massimi, conteggi distinti su dati distribuiti — qualsiasi aggregazione associativa si mappa su map-reduce.</p>
<p>Un'ottimizzazione cruciale è il <strong>combiner</strong> (o reduce locale): prima di spedire i risultati del map attraverso la rete al reduce, ogni macchina aggrega LOCALMENTE i propri risultati. Nel word count, invece di mandare mille coppie ("gatto",1), una macchina manda una sola ("gatto",1000). Questo riduce drasticamente i dati trasferiti sulla rete (il collo di bottiglia dei sistemi distribuiti), ed è possibile solo per operazioni associative e commutative (somma sì, media no direttamente — la media va scomposta in somma e conteggio). Spark applica automaticamente combiner quando può (es. <code>reduceByKey</code> lo fa, <code>groupByKey</code> no — motivo per cui il primo è preferito).</p>
<p>Il map-reduce ha però un limite intrinseco che ci porta allo shuffle (prossima lavagna): il reduce richiede che tutti i valori con la STESSA chiave finiscano sulla stessa macchina. Se "gatto" appare su cento partizioni diverse, i suoi conteggi parziali devono convergere su un unico reducer — e questo movimento di dati attraverso la rete (lo shuffle) è la fase costosa. Il map scala magnificamente (parallelo, locale); è la ridistribuzione per chiave che costa. Capire questa asimmetria — map economico e parallelo, reduce/shuffle costoso perché muove dati — è la chiave per scrivere codice Spark efficiente: minimizzare gli shuffle è la regola d'oro dell'ottimizzazione Spark.</p>
` },

    {
      type: "exercise", id: "sp-04", kg: 15, title: "Word count distribuito",
      task: `<p>Implementa il word count map-reduce, l'"hello world" del big data. Simula partizioni elaborate in parallelo:</p>
<ul>
<li><code>partizioni</code>: 2 partizioni di parole (fornite)</li>
<li><code>map_fase</code>: per ogni partizione, produci le coppie (parola, 1) — poi appiattisci tutto in un'unica lista</li>
<li><code>reduce_fase</code>: aggrega sommando per parola (usa un <code>Counter</code> o dict)</li>
<li><code>conteggio_gatto</code>: quante volte compare "gatto" nel totale</li>
</ul>`,
      setup: `partizioni = [
    ["gatto", "cane", "gatto", "topo"],
    ["cane", "gatto", "cane"],
]`,
      starter: `from collections import Counter
# partizioni: liste di parole "distribuite" su 2 macchine

# MAP: (parola, 1) per ogni parola di ogni partizione
coppie = [(parola, 1) for partizione in partizioni for parola in partizione]

# REDUCE: somma per chiave
reduce_fase = Counter()
for parola, uno in coppie:
    reduce_fase[parola] += uno

conteggio_gatto = ...

print("conteggi:", dict(reduce_fase))
print("gatto:", conteggio_gatto)`,
      check: `from collections import Counter
_coppie = [(p, 1) for part in partizioni for p in part]
_r = Counter()
for p, u in _coppie: _r[p] += u
assert reduce_fase == _r, "reduce_fase: aggrega le coppie per parola"
assert conteggio_gatto == 3, "conteggio_gatto: 'gatto' appare 3 volte (2 nella prima partizione, 1 nella seconda)"
assert reduce_fase["cane"] == 3, "cane appare 3 volte"`,
      hint: `<p>Il map produce le coppie (già fatto), il reduce le somma per chiave (già fatto). <code>conteggio_gatto = reduce_fase["gatto"]</code>. È il pattern che scala a petabyte di testo.</p>`,
      solution: `from collections import Counter

coppie = [(parola, 1) for partizione in partizioni for parola in partizione]

reduce_fase = Counter()
for parola, uno in coppie:
    reduce_fase[parola] += uno

conteggio_gatto = reduce_fase["gatto"]

print("conteggi:", dict(reduce_fase))
print("gatto:", conteggio_gatto)`
    },

    {
      type: "exercise", id: "sp-05", kg: 20, title: "Il combiner riduce la rete",
      task: `<p>Ottimizza il word count con un combiner: aggrega LOCALMENTE ogni partizione prima di combinare, riducendo i dati "spediti sulla rete". Confronta i dati trasferiti:</p>
<ul>
<li><code>senza_combiner</code>: il numero di coppie (parola,1) che verrebbero spedite SENZA combiner (una per parola totale)</li>
<li><code>con_combiner</code>: aggrega ogni partizione localmente, poi conta le coppie (parola, conteggio_locale) da spedire</li>
<li><code>coppie_spedite_con</code>: quante coppie si spediscono col combiner (una per parola UNICA per partizione)</li>
<li><code>combiner_riduce</code>: <code>True</code> se col combiner si spediscono MENO coppie</li>
</ul>`,
      setup: `from collections import Counter
partizioni = [
    ["a", "a", "a", "b", "b"],       # 5 parole, 2 uniche
    ["a", "c", "c", "c", "c", "c"],  # 6 parole, 2 uniche
]`,
      starter: `from collections import Counter
# partizioni: molte ripetizioni -> il combiner aiuta molto

# SENZA combiner: si spedisce una coppia (parola,1) per OGNI occorrenza
senza_combiner = sum(len(p) for p in partizioni)

# CON combiner: ogni partizione aggrega localmente, spedisce (parola, count_locale)
combinate_locali = [Counter(p) for p in partizioni]
coppie_spedite_con = sum(len(c) for c in combinate_locali)

combiner_riduce = ...

print(f"coppie spedite senza combiner: {senza_combiner}")
print(f"coppie spedite col combiner: {coppie_spedite_con}")`,
      check: `from collections import Counter
_senza = sum(len(p) for p in partizioni)
_loc = [Counter(p) for p in partizioni]
_con = sum(len(c) for c in _loc)
assert senza_combiner == _senza == 11, "senza_combiner: 11 coppie (una per occorrenza)"
assert coppie_spedite_con == _con == 4, "coppie_spedite_con: 4 (2 uniche per partizione)"
assert combiner_riduce == True, "combiner_riduce: True — 4 << 11, il combiner riduce i dati sulla rete"`,
      hint: `<p>Senza combiner spedisci 11 coppie (una per parola). Col combiner ogni partizione aggrega prima: la prima manda solo (a,3),(b,2) = 2 coppie invece di 5. <code>combiner_riduce = coppie_spedite_con &lt; senza_combiner</code>.</p>`,
      solution: `from collections import Counter

senza_combiner = sum(len(p) for p in partizioni)

combinate_locali = [Counter(p) for p in partizioni]
coppie_spedite_con = sum(len(c) for c in combinate_locali)

combiner_riduce = coppie_spedite_con < senza_combiner

print(f"coppie spedite senza combiner: {senza_combiner}")
print(f"coppie spedite col combiner: {coppie_spedite_con}")`
    },

    { type: "theory", title: "Lo shuffle: il collo di bottiglia", html: `
<p>Alcune operazioni richiedono di RIDISTRIBUIRE i dati tra le macchine perché tutti i valori con la stessa chiave finiscano insieme: è lo <strong>shuffle</strong>. Succede con <code>groupByKey</code>, <code>join</code>, <code>reduceByKey</code>, <code>sort</code>.</p>
<pre><code># prima dello shuffle: le chiavi sono sparse sulle partizioni
partizione_1: [("a",1), ("b",1)]
partizione_2: [("a",1), ("b",1)]
# shuffle: tutte le "a" su una macchina, tutte le "b" su un'altra
partizione_a: [("a",1), ("a",1)]   # ora si possono aggregare
partizione_b: [("b",1), ("b",1)]</code></pre>
<p>Lo shuffle è l'operazione PIÙ COSTOSA in Spark: muove dati attraverso la rete (lenta) e su disco. La regola d'oro dell'ottimizzazione: <strong>minimizzare gli shuffle</strong>. Operazioni "narrow" (map, filter — ogni partizione indipendente) sono economiche; operazioni "wide" (che richiedono shuffle) sono care.</p>
`, more: `
<p>La distinzione tra trasformazioni <strong>narrow</strong> e <strong>wide</strong> è la chiave dell'efficienza in Spark. Le NARROW (map, filter, union) producono ogni partizione di output da UNA sola partizione di input — nessun movimento di dati tra macchine, perfettamente parallele, economiche, e Spark le "pipelina" insieme in un unico passaggio. Le WIDE (groupByKey, join, sort, distinct) richiedono che ogni partizione di output dipenda da MOLTE partizioni di input — i dati devono muoversi tra macchine (shuffle). Spark divide l'esecuzione in "stage" ai confini degli shuffle: dentro uno stage tutto è narrow e pipelinato; tra stage c'è uno shuffle costoso. Guardare quanti stage ha un job Spark dice quanti shuffle fa.</p>
<p>Perché lo shuffle è così costoso: coinvolge i tre elementi più lenti di un sistema distribuito insieme — la RETE (spostare dati tra macchine, ordini di grandezza più lenta della memoria), il DISCO (i dati di shuffle vengono scritti su disco per resilienza), e la SERIALIZZAZIONE (convertire oggetti in byte per spedirli). Su grandi volumi, uno shuffle può dominare il tempo totale del job. Ed è anche fonte di problemi di memoria: se una chiave ha troppi valori (data skew, prossima idea), il reducer che la riceve può esaurire la memoria.</p>
<p>Le tecniche per minimizzare/ottimizzare gli shuffle sono ottimizzazione Spark avanzata da colloquio: preferire <code>reduceByKey</code> (che aggrega localmente PRIMA dello shuffle, come il combiner) a <code>groupByKey</code> (che shuffla tutto grezzo); usare il <strong>broadcast join</strong> quando una tabella è piccola (la si copia su tutte le macchine invece di shufflare la grande — evita del tutto lo shuffle); partizionare i dati in anticipo sulla chiave di join per evitare shuffle ripetuti; gestire il <strong>data skew</strong> (una chiave con molti più valori delle altre crea una partizione gigante che rallenta tutto — si mitiga con salting o partizionamento custom). La regola pratica riassuntiva: filtra e riduci i dati il prima possibile (mentre sono ancora narrow), e shuffla il meno possibile e solo dati già ridotti. È l'equivalente distribuito del "porta il calcolo ai dati" — qui "riduci i dati prima di muoverli".</p>
` },

    {
      type: "exercise", id: "sp-06", kg: 20, title: "Simulare uno shuffle",
      task: `<p>Simula uno shuffle: ridistribuisci coppie (chiave, valore) sparse su partizioni in modo che tutte le stesse chiavi finiscano insieme, poi aggrega:</p>
<ul>
<li><code>partizioni_input</code>: coppie sparse su 2 partizioni (fornite)</li>
<li><code>dopo_shuffle</code>: un dict chiave &rarr; lista di tutti i valori di quella chiave (raccolti da TUTTE le partizioni)</li>
<li><code>aggregato</code>: dict chiave &rarr; somma dei suoi valori (il reduce dopo lo shuffle)</li>
<li><code>shuffle_e_costoso</code>: <code>True</code> — lo shuffle muove dati sulla rete, è l'operazione più cara (concettuale)</li>
</ul>`,
      setup: `partizioni_input = [
    [("a", 1), ("b", 2), ("a", 3)],
    [("b", 4), ("a", 5), ("c", 6)],
]`,
      starter: `from collections import defaultdict
# partizioni_input: coppie (chiave, valore) sparse

# SHUFFLE: raccogli tutti i valori per chiave da tutte le partizioni
dopo_shuffle = defaultdict(list)
for partizione in partizioni_input:
    for chiave, valore in partizione:
        dopo_shuffle[chiave].append(valore)
dopo_shuffle = dict(dopo_shuffle)

# REDUCE: somma i valori raccolti
aggregato = {k: sum(v) for k, v in dopo_shuffle.items()}
shuffle_e_costoso = ...

print("dopo shuffle:", dopo_shuffle)
print("aggregato:", aggregato)`,
      check: `from collections import defaultdict
_ds = defaultdict(list)
for part in partizioni_input:
    for k, v in part: _ds[k].append(v)
_ds = dict(_ds)
_agg = {k: sum(v) for k, v in _ds.items()}
assert dopo_shuffle == _ds, "dopo_shuffle: raccoglie i valori per chiave da tutte le partizioni"
assert aggregato == _agg == {"a": 9, "b": 6, "c": 6}, "aggregato: a=1+3+5=9, b=2+4=6, c=6"
assert shuffle_e_costoso == True, "shuffle_e_costoso: True — muove dati tra macchine, e' l'operazione piu' cara"`,
      hint: `<p>Lo shuffle raggruppa per chiave (già fatto), il reduce somma (già fatto). <code>shuffle_e_costoso = True</code>. Nota che le "a" erano sparse su entrambe le partizioni e lo shuffle le riunisce: è questo movimento che costa.</p>`,
      solution: `from collections import defaultdict

dopo_shuffle = defaultdict(list)
for partizione in partizioni_input:
    for chiave, valore in partizione:
        dopo_shuffle[chiave].append(valore)
dopo_shuffle = dict(dopo_shuffle)

aggregato = {k: sum(v) for k, v in dopo_shuffle.items()}
shuffle_e_costoso = True

print("dopo shuffle:", dopo_shuffle)
print("aggregato:", aggregato)`
    },

    { type: "theory", title: "Caching e persistenza", html: `
<p>Ricorda: in Spark le trasformazioni si RIeseguono a ogni azione (lazy, nessun risultato conservato). Se riusi lo stesso dataset intermedio più volte, lo ricalcoli ogni volta — spreco enorme. La soluzione è il <strong>caching</strong>.</p>
<pre><code>dati_puliti = rdd.map(pulisci).filter(valido)   # trasformazione costosa
dati_puliti.cache()                              # "conserva in memoria"

# ora questi due usi NON ricalcolano dati_puliti da capo:
totale = dati_puliti.count()
media = dati_puliti.map(lambda x: x.valore).mean()</code></pre>
<p><code>cache()</code> (o <code>persist()</code>) dice a Spark di conservare il risultato in memoria dopo il primo calcolo, così i riusi successivi lo leggono invece di ricalcolarlo. Cruciale per gli algoritmi ITERATIVI (il ML ripete sui dati molte volte) e ovunque un dataset intermedio serva più volte.</p>
`, more: `
<p>Il caching è particolarmente cruciale per il ML su Spark, ed è la ragione storica per cui Spark ha battuto Hadoop MapReduce in questo campo. Gli algoritmi di ML sono ITERATIVI: la discesa del gradiente ripassa sui dati a ogni epoca, il k-means ricalcola i centroidi a ogni iterazione. Senza caching, ogni iterazione ricalcolerebbe l'intera pipeline di preparazione dei dati da zero — con caching, i dati preparati stanno in memoria e ogni iterazione li rilegge velocemente. È la differenza tra un training che finisce in minuti e uno che non finisce mai. Cachare il dataset di training prima del loop iterativo è una regola d'oro del ML su Spark.</p>
<p><code>cache()</code> vs <code>persist()</code>: <code>cache()</code> è una scorciatoia per <code>persist()</code> con il livello di storage di default (memoria). <code>persist()</code> permette di scegliere il livello: solo memoria (più veloce ma se non ci sta ricalcola), memoria+disco (spilla su disco se la memoria finisce), solo disco, con o senza replica/serializzazione. La scelta bilancia velocità e affidabilità in base a quanto è costoso ricalcolare e quanta memoria hai. Per dataset che entrano in memoria, il default va bene; per dataset più grandi della RAM, memoria+disco evita di ricalcolare tutto quando la memoria si esaurisce.</p>
<p>Il caching ha però un costo e va usato con giudizio: occupa memoria (che sottrae ad altre operazioni e allo shuffle), quindi cachare tutto indiscriminatamente è controproducente — si cachano solo i dataset RIUSATI più volte e costosi da ricalcolare. E va rilasciato (<code>unpersist()</code>) quando non serve più, per liberare memoria. L'errore opposto — non cachare dati riusati — è più comune e più dannoso: un codice Spark che sembra corretto ma è lentissimo perché ricalcola ripetutamente la stessa pipeline è un classico, e aggiungere un <code>cache()</code> al punto giusto può accelerarlo di ordini di grandezza. Sapere COSA cachare (riusato + costoso) e QUANDO (prima di un loop o di usi multipli) è competenza pratica che distingue chi ha ottimizzato job Spark reali.</p>
` },

    {
      type: "exercise", id: "sp-07", kg: 20, title: "Il caching evita il ricalcolo",
      task: `<p>Dimostra il valore del caching contando quante volte una trasformazione costosa viene eseguita, con e senza cache:</p>
<ul>
<li><code>senza_cache</code>: simula 3 azioni su un piano NON cachato — la trasformazione gira 3 volte (una per azione)</li>
<li><code>con_cache</code>: con cache, la trasformazione gira 1 volta (il primo calcolo) + 0 per i riusi</li>
<li><code>esecuzioni_senza</code>, <code>esecuzioni_con</code>: quante volte gira la trasformazione nei due casi</li>
<li><code>cache_conviene</code>: <code>True</code> se con la cache si eseguono meno calcoli</li>
</ul>`,
      starter: `# simuliamo un contatore di esecuzioni della trasformazione costosa
n_azioni = 3

# SENZA cache: ogni azione ricalcola tutto da capo
esecuzioni_senza = n_azioni

# CON cache: la trasformazione gira una volta sola, poi si riusa il risultato
esecuzioni_con = 1

cache_conviene = ...
risparmio = esecuzioni_senza - esecuzioni_con

print(f"esecuzioni senza cache: {esecuzioni_senza}")
print(f"esecuzioni con cache: {esecuzioni_con}")
print(f"calcoli risparmiati: {risparmio}")`,
      check: `assert esecuzioni_senza == 3, "esecuzioni_senza: 3 azioni -> 3 ricalcoli (lazy, nessun risultato conservato)"
assert esecuzioni_con == 1, "esecuzioni_con: con cache, 1 solo calcolo, poi riuso"
assert cache_conviene == True, "cache_conviene: True — la cache risparmia i ricalcoli sui riusi"`,
      hint: `<p>Senza cache, 3 azioni = 3 ricalcoli completi (le trasformazioni sono lazy e non conservate). Con cache, 1 calcolo + 2 riusi dal risultato conservato. <code>cache_conviene = esecuzioni_con &lt; esecuzioni_senza</code>.</p>`,
      solution: `n_azioni = 3

esecuzioni_senza = n_azioni
esecuzioni_con = 1

cache_conviene = esecuzioni_con < esecuzioni_senza
risparmio = esecuzioni_senza - esecuzioni_con

print(f"esecuzioni senza cache: {esecuzioni_senza}")
print(f"esecuzioni con cache: {esecuzioni_con}")
print(f"calcoli risparmiati: {risparmio}")`
    },

    {
      type: "exercise", id: "sp-08", kg: 20, title: "Join distribuito e broadcast",
      task: `<p>Simula un join tra un dataset grande e uno piccolo. Il broadcast join copia il piccolo su ogni partizione, evitando lo shuffle del grande:</p>
<ul>
<li><code>grande</code>: dataset grande (id, valore) su partizioni; <code>piccolo</code>: mappa id&rarr;categoria (fornite)</li>
<li><code>broadcast_join</code>: unisci copiando <code>piccolo</code> ovunque — per ogni riga del grande, aggiungi la categoria dal piccolo (fornita)</li>
<li><code>risultato</code>: le righe unite (id, valore, categoria)</li>
<li><code>evita_shuffle_del_grande</code>: <code>True</code> — il broadcast join non shuffla il dataset grande, solo copia il piccolo</li>
</ul>`,
      setup: `grande = [
    (1, "aaa"), (2, "bbb"), (3, "ccc"), (1, "ddd"), (2, "eee"),
]
piccolo = {1: "cat_A", 2: "cat_B", 3: "cat_C"}   # tabella piccola da broadcastare`,
      starter: `# grande: molte righe (id, valore) | piccolo: mappa id->categoria (piccola)

def broadcast_join(grande, piccolo):
    # piccolo viene "copiato" su ogni macchina: lookup locale, niente shuffle del grande
    return [(id, val, piccolo[id]) for (id, val) in grande]

risultato = broadcast_join(grande, piccolo)
evita_shuffle_del_grande = ...

print("risultato del join:")
for r in risultato:
    print(" ", r)`,
      check: `def _bj(g, p): return [(i, v, p[i]) for (i, v) in g]
_r = _bj(grande, piccolo)
assert risultato == _r, "risultato: broadcast_join(grande, piccolo)"
assert risultato[0] == (1, "aaa", "cat_A"), "prima riga: (1, 'aaa', 'cat_A')"
assert len(risultato) == 5, "5 righe unite (una per riga del grande)"
assert evita_shuffle_del_grande == True, "evita_shuffle_del_grande: True — copiando il piccolo si evita di shufflare il grande"`,
      hint: `<p>La funzione è fornita: <code>evita_shuffle_del_grande = True</code>. Il broadcast join è l'ottimizzazione chiave: quando una tabella è piccola, la copi su ogni macchina (broadcast) invece di shufflare la grande — enorme risparmio.</p>`,
      solution: `def broadcast_join(grande, piccolo):
    return [(id, val, piccolo[id]) for (id, val) in grande]

risultato = broadcast_join(grande, piccolo)
evita_shuffle_del_grande = True

print("risultato del join:")
for r in risultato:
    print(" ", r)`
    },

    {
      type: "exercise", id: "sp-09", kg: 15, title: "Quiz: Spark e big data",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "In Spark le trasformazioni (map, filter) sono lazy: non eseguono finché non chiami un'azione"</li>
<li><code>a2</code>: "Lo shuffle è un'operazione economica che non tocca la rete"</li>
<li><code>a3</code>: "Il caching serve a non ricalcolare un dataset intermedio riusato più volte"</li>
<li><code>a4</code>: "Il broadcast join copia la tabella piccola su ogni macchina per evitare lo shuffle della grande"</li>
<li><code>a5</code>: "Spark è sempre più veloce di pandas, anche per dati che entrano in una macchina"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: trasformazioni lazy, azioni eager"
assert a2 == False, "a2 FALSA: lo shuffle e' l'operazione PIU' costosa (muove dati sulla rete e su disco)"
assert a3 == True, "a3 VERA: cache evita i ricalcoli sui riusi"
assert a4 == True, "a4 VERA: broadcast join = copia il piccolo, niente shuffle del grande"
assert a5 == False, "a5 FALSA: per dati che entrano in una macchina, pandas e' spesso PIU' veloce (Spark ha overhead di coordinamento)"`,
      hint: `<p>Le trappole: a2 (lo shuffle è l'operazione PIÙ cara, non economica) e a5 (Spark ha overhead, per dati piccoli pandas vince). Le altre riprendono le lavagne: lazy (a1), caching (a3), broadcast join (a4).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = False

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "sp-10", kg: 25, title: "MASSIMALE: pipeline Spark completa",
      task: `<p>Il gran finale: costruisci una pipeline di analisi distribuita completa su un mini-Spark — partiziona, applica trasformazioni lazy, aggrega con map-reduce, e materializza con un'azione. Analizza vendite per categoria.</p>
<ul>
<li>dati: transazioni (categoria, importo) da analizzare</li>
<li><code>partizioni</code>: dividi le transazioni in 3 partizioni</li>
<li><code>map_locale</code>: per ogni partizione, aggrega localmente (combiner): dict categoria&rarr;somma_locale</li>
<li><code>totali</code>: combina le aggregazioni locali in un totale globale per categoria (il reduce dopo lo shuffle)</li>
<li><code>categoria_top</code>: la categoria con l'importo totale maggiore</li>
<li><code>pipeline_completa</code>: <code>True</code> se i totali sono corretti e c'è una categoria top</li>
</ul>`,
      setup: `from collections import defaultdict
transazioni = [
    ("elettronica", 100), ("libri", 20), ("elettronica", 250),
    ("libri", 15), ("casa", 80), ("elettronica", 120),
    ("casa", 200), ("libri", 30), ("casa", 50),
]`,
      starter: `from collections import defaultdict
# transazioni: (categoria, importo)

# 1. PARTIZIONA in 3
def partiziona(dati, n):
    return [dati[i::n] for i in range(n)]
partizioni = partiziona(transazioni, 3)

# 2. MAP + COMBINER: aggrega localmente ogni partizione
def aggrega_locale(partizione):
    d = defaultdict(float)
    for cat, imp in partizione:
        d[cat] += imp
    return dict(d)
map_locale = [aggrega_locale(p) for p in partizioni]

# 3. REDUCE: combina i totali locali (dopo lo shuffle per categoria)
totali = defaultdict(float)
for locale in map_locale:
    for cat, somma in locale.items():
        totali[cat] += somma
totali = dict(totali)

# 4. AZIONE: trova la categoria top
categoria_top = ...
pipeline_completa = ...

print("aggregazioni locali:", map_locale)
print("totali globali:", totali)
print("categoria top:", categoria_top)`,
      check: `from collections import defaultdict
_tot = defaultdict(float)
for cat, imp in transazioni: _tot[cat] += imp
_tot = dict(_tot)
_top = max(_tot, key=_tot.get)
assert totali == _tot, "totali: elettronica=470, casa=330, libri=65"
assert categoria_top == _top == "elettronica", "categoria_top: elettronica (470, il totale piu' alto)"
assert pipeline_completa == True, "pipeline_completa: True"
assert abs(totali["elettronica"] - 470) < 1e-6, "elettronica deve totalizzare 470"`,
      hint: `<p>La pipeline è quasi completa: <code>categoria_top = max(totali, key=totali.get)</code>. <code>pipeline_completa = categoria_top == "elettronica" and totali["elettronica"] == 470</code>. È il flusso Spark completo: partiziona → map+combiner → shuffle+reduce → azione.</p>`,
      solution: `from collections import defaultdict

def partiziona(dati, n):
    return [dati[i::n] for i in range(n)]
partizioni = partiziona(transazioni, 3)

def aggrega_locale(partizione):
    d = defaultdict(float)
    for cat, imp in partizione:
        d[cat] += imp
    return dict(d)
map_locale = [aggrega_locale(p) for p in partizioni]

totali = defaultdict(float)
for locale in map_locale:
    for cat, somma in locale.items():
        totali[cat] += somma
totali = dict(totali)

categoria_top = max(totali, key=totali.get)
pipeline_completa = categoria_top == "elettronica" and totali["elettronica"] == 470

print("aggregazioni locali:", map_locale)
print("totali globali:", totali)
print("categoria top:", categoria_top)`
    }

  ]
});
