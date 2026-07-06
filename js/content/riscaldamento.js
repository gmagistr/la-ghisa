window.MODULES.push({
  id: "riscaldamento",
  name: "Riscaldamento",
  tagline: "Mobilità articolare in Python: liste, dizionari, funzioni. Senza questi movimenti ti fai male dopo.",
  intro: "Nessun attrezzo, solo corpo libero: il Python di base che NumPy e Pandas danno per scontato. Se queste serie ti sembrano leggere, ottimo — il riscaldamento deve esserlo.",
  packages: [],
  items: [

    { type: "theory", title: "Liste e slicing", html: `
<p>La lista è il contenitore ordinato di Python: <code>tempi = [820, 950, 1100, 740]</code>. Si accede agli elementi con l'indice, <strong>che parte da 0</strong>: <code>tempi[0]</code> è il primo, <code>tempi[-1]</code> è l'ultimo.</p>
<p>Lo <strong>slicing</strong> estrae una fetta: <code>tempi[1:3]</code> prende dall'indice 1 <strong>incluso</strong> al 3 <strong>escluso</strong>. Omettere un estremo significa "dall'inizio" o "fino alla fine": <code>tempi[:2]</code>, <code>tempi[2:]</code>. Questa sintassi identica la ritroverai in NumPy e Pandas, quindi va in automatismo adesso.</p>
<pre><code>tempi = [820, 950, 1100, 740]
tempi[0]     # 820
tempi[-1]    # 740
tempi[1:3]   # [950, 1100]</code></pre>
`, more: `
<p>Lo slicing accetta anche un terzo numero, il <strong>passo</strong>: <code>tempi[::2]</code> prende un elemento sì e uno no (indici 0, 2, 4...), <code>tempi[::-1]</code> con passo -1 <strong>inverte l'intera lista</strong> — un trucco molto usato perché non richiede una funzione dedicata. Puoi anche combinare tutto: <code>tempi[1:-1:2]</code> significa "dal secondo al penultimo, a salti di 2".</p>
<p>Una trappola comune per chi viene da altri linguaggi: gli indici <strong>fuori range in uno slice non danno errore</strong>. <code>tempi[2:100]</code> restituisce semplicemente tutto quello che c'è da 2 in poi, anche se la lista ha solo 4 elementi — mentre <code>tempi[100]</code> (un indice singolo, non uno slice) SOLLEVA <code>IndexError</code>. Questa asimmetria è intenzionale: lo slicing è pensato per essere "sicuro per costruzione" quando maneggi porzioni di sequenza di lunghezza incerta, mentre l'accesso a un singolo elemento deve fallire rumorosamente se quell'elemento non esiste — altrimenti un bug (un indice sbagliato) passerebbe silenzioso invece di segnalarsi subito.</p>
<p>Infine, una lista è <strong>mutabile</strong>: <code>tempi[0] = 999</code> modifica l'elemento sul posto, mentre le stringhe (che si comportano in modo simile per lo slicing: <code>"ciao"[1:3]</code> funziona identico) sono <strong>immutabili</strong> — <code>"ciao"[0] = "C"</code> solleva <code>TypeError</code>. La distinzione mutabile/immutabile tornerà centrale quando incontrerai i DataFrame di Pandas, dove capire se un'operazione modifica l'originale o ne crea una copia è la fonte più comune di bug per chi inizia.</p>
` },

    {
      type: "exercise", id: "warm-01", kg: 5, title: "Prese sulla lista",
      task: `<p>Hai la lista <code>tempi</code>, i tempi di caricamento (in millisecondi) di 6 pagine di un sito. Crea tre variabili:</p>
<ul>
<li><code>primo</code>: il primo elemento</li>
<li><code>ultimo</code>: l'ultimo elemento (usa l'indice negativo)</li>
<li><code>centrali</code>: la fetta dal secondo al quarto elemento compresi (3 valori)</li>
</ul>`,
      starter: `tempi = [820, 950, 1100, 740, 910, 600]

primo = ...
ultimo = ...
centrali = ...

print(primo, ultimo, centrali)`,
      check: `assert 'primo' in globals() and primo == 820, "primo deve valere 820 (indice 0)"
assert 'ultimo' in globals() and ultimo == 600, "ultimo deve valere 600: usa tempi[-1]"
assert 'centrali' in globals() and centrali == [950, 1100, 740], "centrali deve essere [950, 1100, 740]: la fetta parte dall'indice 1 e finisce PRIMA dell'indice 4"`,
      hint: `<p>Il secondo elemento ha indice 1. Per prenderne tre a partire da lì: <code>tempi[1:4]</code> — ricorda che l'estremo destro è escluso.</p>`,
      solution: `tempi = [820, 950, 1100, 740, 910, 600]

primo = tempi[0]
ultimo = tempi[-1]
centrali = tempi[1:4]

print(primo, ultimo, centrali)`
    },

    { type: "theory", title: "Dizionari", html: `
<p>Il dizionario associa <strong>chiavi</strong> a <strong>valori</strong>: <code>scorte = {"acqua": 20, "sale": 5}</code>. Si legge con <code>scorte["acqua"]</code> e si scrive con <code>scorte["olio"] = 12</code>.</p>
<p>Se la chiave non esiste, <code>scorte["farina"]</code> esplode con <code>KeyError</code>. Il metodo <code>scorte.get("farina", 0)</code> invece restituisce un valore di riserva — perfetto per <strong>contare occorrenze</strong>, il gesto fondamentale di ogni analisi di frequenza:</p>
<pre><code>conteggi = {}
for colore in lista_colori:
    conteggi[colore] = conteggi.get(colore, 0) + 1</code></pre>
`, more: `
<p>Il dizionario in Python moderno (dalla versione 3.7 in poi) <strong>ricorda l'ordine di inserimento</strong> delle chiavi — una garanzia del linguaggio, non un dettaglio implementativo casuale. Questo significa che <code>for chiave in conteggi</code> scorre sempre le chiavi nell'ordine in cui sono state inserite la prima volta, un comportamento su cui puoi contare (utile, ad esempio, per mantenere un ordine "prima visto" quando presenti risultati).</p>
<p>Oltre a <code>.get()</code>, esiste <code>.setdefault(chiave, default)</code>: se la chiave non c'è, la crea con quel valore E la restituisce; se c'è già, restituisce il valore esistente senza toccarlo. È particolarmente comodo quando il "valore" è una struttura mutabile come una lista: <code>gruppi.setdefault(categoria, []).append(elemento)</code> raggruppa elementi per categoria in una riga sola, senza dover controllare a mano se la categoria esiste già.</p>
<p>Una domanda che sorge spontanea: perché non usare semplicemente <code>conteggi[colore] += 1</code> senza <code>.get()</code>? Perché se <code>colore</code> non è ancora una chiave del dizionario, <code>conteggi[colore]</code> da solo solleva <code>KeyError</code> — non esiste ancora nulla da incrementare. <code>.get(colore, 0)</code> risolve il problema fornendo "0" come valore di partenza plausibile, ma è una soluzione specifica per i conteggi: per altri usi (accumulare testo, unire liste) il valore di default dovrebbe cambiare di conseguenza (stringa vuota, lista vuota).</p>
` },

    {
      type: "exercise", id: "warm-02", kg: 5, title: "Il sondaggio dei colori",
      task: `<p>Hai la lista <code>colori</code>, le risposte a un sondaggio ("qual è il tuo colore preferito?"). Costruisci il dizionario <code>conteggi</code> che mappa ogni colore al numero di volte in cui compare. Usa un ciclo <code>for</code> e <code>.get()</code>.</p>`,
      starter: `colori = ["blu", "rosso", "blu", "verde", "giallo", "blu", "rosso", "giallo", "blu", "viola", "giallo"]

conteggi = {}
# il tuo ciclo qui

print(conteggi)`,
      check: `assert 'conteggi' in globals() and isinstance(conteggi, dict), "conteggi deve essere un dizionario"
assert conteggi == {"blu": 4, "rosso": 2, "verde": 1, "giallo": 3, "viola": 1}, "I conteggi non tornano: 'blu' compare 4 volte, 'giallo' 3, 'rosso' 2, 'verde' e 'viola' 1"`,
      hint: `<p>Dentro il ciclo: <code>conteggi[c] = conteggi.get(c, 0) + 1</code>. Il secondo argomento di <code>.get</code> è il valore di partenza quando il colore non è ancora nel dizionario.</p>`,
      solution: `colori = ["blu", "rosso", "blu", "verde", "giallo", "blu", "rosso", "giallo", "blu", "viola", "giallo"]

conteggi = {}
for c in colori:
    conteggi[c] = conteggi.get(c, 0) + 1

print(conteggi)`
    },

    { type: "theory", title: "List comprehension", html: `
<p>La <strong>list comprehension</strong> costruisce una lista trasformando (e filtrando) un'altra sequenza, in una riga sola:</p>
<pre><code>quadrati = [x**2 for x in range(5)]          # [0, 1, 4, 9, 16]
pari     = [x for x in numeri if x % 2 == 0] # solo trasformazione o solo filtro, o entrambi</code></pre>
<p>Leggila così: "<em>metti in lista</em> <code>x**2</code> <em>per ogni</em> <code>x</code> <em>in</em> <code>range(5)</code>, <em>se</em> (condizione)". È il modo idiomatico di trasformare dati in Python: più leggibile e più veloce di un ciclo con <code>.append()</code>.</p>
`, more: `
<p>Esistono anche varianti per dizionari e insiemi, con la stessa identica logica ma parentesi diverse: <code>{x: x**2 for x in range(5)}</code> costruisce un dizionario (dict comprehension), <code>{x for x in lista}</code> costruisce un insieme (set comprehension). Le parentesi quadre <code>[]</code> danno una lista, le graffe <code>{}</code> con i due punti danno un dict, le graffe senza due punti danno un set — la stessa "grammatica" applicata a tre strutture dati diverse.</p>
<p>Le comprehension si possono anche <strong>annidare</strong>: <code>[x*y for x in range(3) for y in range(3)]</code> equivale a due cicli <code>for</code> annidati, nello stesso ordine in cui li scriveresti normalmente (il primo <code>for</code> è quello più esterno). Attenzione però alla leggibilità: una comprehension con più di due <code>for</code>/<code>if</code> diventa spesso più difficile da leggere di un ciclo scritto per esteso — in quel caso, tornare al ciclo tradizionale è la scelta più professionale, non un fallimento.</p>
<p>Perché sono più veloci di un ciclo con <code>.append()</code>? Perché Python può pre-allocare e ottimizzare la costruzione della lista internamente, mentre un ciclo esplicito richiede una chiamata di metodo (<code>.append</code>) ripetuta ad ogni iterazione, con un piccolo overhead che si accumula su liste grandi. La differenza è raramente drammatica per liste piccole, ma diventa misurabile — e la leggibilità resta comunque il motivo principale per preferirle quando l'espressione è semplice.</p>
` },

    {
      type: "exercise", id: "warm-03", kg: 10, title: "Filtra e trasforma",
      task: `<p>Hai <code>catalogo</code>, una lista di tuple <code>(prodotto, vendite)</code> di un negozio online. Con <strong>una list comprehension per variabile</strong> crea:</p>
<ul>
<li><code>bestseller</code>: i prodotti (solo la stringa) con vendite maggiori di 50</li>
<li><code>maiuscole</code>: tutti i nomi prodotto in maiuscolo (usa <code>.upper()</code>)</li>
</ul>`,
      starter: `catalogo = [("cuffie", 120), ("mouse", 45), ("tastiera", 88), ("webcam", 30), ("borraccia", 95)]

bestseller = ...
maiuscole = ...

print(bestseller)
print(maiuscole)`,
      check: `assert 'bestseller' in globals() and bestseller == ["cuffie", "tastiera", "borraccia"], "bestseller deve essere ['cuffie', 'tastiera', 'borraccia']: filtra con if vendite > 50 e prendi solo il nome"
assert 'maiuscole' in globals() and maiuscole == ["CUFFIE", "MOUSE", "TASTIERA", "WEBCAM", "BORRACCIA"], "maiuscole deve contenere tutti e 5 i prodotti in maiuscolo"`,
      hint: `<p>Puoi spacchettare la tupla direttamente nel <code>for</code>: <code>[nome for nome, vendite in catalogo if vendite &gt; 50]</code>.</p>`,
      solution: `catalogo = [("cuffie", 120), ("mouse", 45), ("tastiera", 88), ("webcam", 30), ("borraccia", 95)]

bestseller = [nome for nome, vendite in catalogo if vendite > 50]
maiuscole = [nome.upper() for nome, vendite in catalogo]

print(bestseller)
print(maiuscole)`
    },

    { type: "theory", title: "Funzioni", html: `
<p>Una funzione incapsula un calcolo che vuoi ripetere: <code>def</code>, un nome, parametri, e <code>return</code> per restituire il risultato. Senza <code>return</code> la funzione restituisce <code>None</code>.</p>
<pre><code>def rapporto(a, b):
    if b == 0:
        return None      # caso degenere gestito esplicitamente
    return a / b</code></pre>
<p>Gestire i <strong>casi limite</strong> (lista vuota, divisione per zero) è ciò che distingue codice da palestra da codice che crolla al primo dataset vero.</p>
`, more: `
<p>Una funzione può avere <strong>parametri con valore di default</strong>: <code>def saluta(nome, formale=False)</code> rende <code>formale</code> facoltativo — chi chiama la funzione può scrivere solo <code>saluta("Anna")</code> oppure specificare <code>saluta("Anna", formale=True)</code>. Una regola sintattica da ricordare: i parametri con default devono venire SEMPRE dopo quelli senza, altrimenti Python non saprebbe a quale argomento posizionale assegnare cosa.</p>
<p>Attenzione a un'insidia classica: <strong>non usare mai una lista o un dizionario come valore di default</strong> (<code>def f(lista=[])</code>). L'oggetto di default viene creato UNA SOLA VOLTA, quando la funzione è definita — non ad ogni chiamata — quindi se lo modifichi dentro la funzione (es. <code>lista.append(x)</code>), la modifica "sopravvive" e sporca le chiamate successive, con un bug notoriamente difficile da scovare. La soluzione idiomatica è <code>def f(lista=None): lista = lista if lista is not None else []</code>.</p>
<p>Le funzioni possono anche restituire <strong>più valori</strong> insieme: <code>return minimo, massimo</code> impacchetta i due valori in una tupla, che poi puoi "spacchettare" al volo con <code>mn, mx = trova_range(dati)</code> — lo stesso meccanismo di spacchettamento che userai scorrendo <code>for chiave, valore in dizionario.items()</code>.</p>
` },

    {
      type: "exercise", id: "warm-04", kg: 10, title: "La tua prima media",
      task: `<p>Scrivi la funzione <code>media(voti)</code> che restituisce la media aritmetica di una lista di voti d'esame. Se la lista è vuota deve restituire <code>None</code> (non esplodere!). Usa <code>sum()</code> e <code>len()</code>.</p>`,
      starter: `def media(voti):
    # il tuo codice qui
    ...

print(media([24, 28, 30]))
print(media([]))`,
      check: `assert 'media' in globals() and callable(media), "Devi definire la funzione media"
assert media([24, 28, 30]) == 27.333333333333332 or abs(media([24, 28, 30]) - 27.3333) < 1e-3, "media([24, 28, 30]) deve essere ~27.33"
assert media([18, 30]) == 24, "media([18, 30]) deve essere 24"
assert media([]) is None, "Con la lista vuota deve restituire None, non un errore"`,
      hint: `<p>Prima controlla il caso vuoto: <code>if len(voti) == 0: return None</code>. Poi <code>return sum(voti) / len(voti)</code>.</p>`,
      solution: `def media(voti):
    if len(voti) == 0:
        return None
    return sum(voti) / len(voti)

print(media([24, 28, 30]))
print(media([]))`
    },

    { type: "theory", title: "Ordinare con una chiave", html: `
<p><code>sorted(sequenza)</code> restituisce una nuova lista ordinata. Il parametro <code>key</code> accetta una funzione che dice <em>su cosa</em> ordinare; <code>reverse=True</code> inverte l'ordine.</p>
<p>Per chiavi al volo si usa una <strong>lambda</strong>, una mini-funzione anonima: <code>lambda x: x["vendite"]</code> significa "dato x, restituisci x['vendite']".</p>
<pre><code>prodotti = [{"nome": "mouse", "vendite": 97}, {"nome": "webcam", "vendite": 43}]
per_vendite = sorted(prodotti, key=lambda p: p["vendite"], reverse=True)</code></pre>
<p>Questo pattern (una funzione passata come argomento) tornerà identico in Pandas con <code>.apply()</code> e <code>.map()</code>.</p>
`, more: `
<p>Una <strong>lambda</strong> è una funzione anonima limitata a UNA sola espressione (niente <code>if</code> su più righe, niente cicli, niente più istruzioni separate da a-capo): <code>lambda x: x**2</code> equivale a <code>def quadrato(x): return x**2</code>, ma senza nome e scritta in linea. Il vantaggio è la brevità quando la funzione serve una volta sola, tipicamente come argomento di <code>sorted</code>, <code>key=</code>, <code>filter</code> o <code>map</code>; lo svantaggio è che una lambda complicata diventa illeggibile — se ti serve più di un'espressione semplice, definisci una funzione con nome.</p>
<p><code>sorted()</code> è <strong>stabile</strong>: elementi con la stessa chiave di ordinamento mantengono il loro ordine relativo originale. Questo permette un trucco elegante per ordinare su più criteri con priorità diverse: ordini prima per il criterio SECONDARIO, poi di nuovo per il criterio PRINCIPALE — la stabilità garantisce che, a parità di criterio principale, l'ordine del criterio secondario sopravviva. È un'alternativa alla chiave-tupla (<code>key=lambda x: (x.a, x.b)</code>) utile quando i due criteri richiedono direzioni di ordinamento opposte (uno crescente, uno decrescente).</p>
<p>Da <code>sorted()</code> (che crea una nuova lista) va distinto <code>.sort()</code> (metodo delle liste, che ordina SUL POSTO e restituisce <code>None</code> — un errore comune è scrivere <code>lista = lista.sort()</code>, che assegna <code>None</code> a <code>lista</code>, perdendo i dati).</p>
` },

    {
      type: "exercise", id: "warm-05", kg: 15, title: "La classifica di vendita",
      task: `<p>Hai una lista di dizionari <code>negozio</code>. Crea:</p>
<ul>
<li><code>per_vendite</code>: la lista ordinata per vendite <strong>decrescenti</strong></li>
<li><code>top_prodotto</code>: la stringa del prodotto più venduto (prendila da <code>per_vendite</code>)</li>
</ul>`,
      starter: `negozio = [
    {"prodotto": "tastiera", "vendite": 61},
    {"prodotto": "mouse",    "vendite": 97},
    {"prodotto": "webcam",   "vendite": 43},
    {"prodotto": "cuffie",   "vendite": 85},
]

per_vendite = ...
top_prodotto = ...

print(top_prodotto)`,
      check: `assert 'per_vendite' in globals(), "Devi creare per_vendite"
assert [d["prodotto"] for d in per_vendite] == ["mouse", "cuffie", "tastiera", "webcam"], "L'ordine deve essere decrescente per vendite: mouse, cuffie, tastiera, webcam"
assert 'top_prodotto' in globals() and top_prodotto == "mouse", "top_prodotto deve essere 'mouse': è il primo elemento della lista ordinata"`,
      hint: `<p><code>sorted(negozio, key=lambda d: d["vendite"], reverse=True)</code>, poi <code>per_vendite[0]["prodotto"]</code>.</p>`,
      solution: `negozio = [
    {"prodotto": "tastiera", "vendite": 61},
    {"prodotto": "mouse",    "vendite": 97},
    {"prodotto": "webcam",   "vendite": 43},
    {"prodotto": "cuffie",   "vendite": 85},
]

per_vendite = sorted(negozio, key=lambda d: d["vendite"], reverse=True)
top_prodotto = per_vendite[0]["prodotto"]

print(top_prodotto)`
    },

    { type: "theory", title: "zip: cucire liste insieme", html: `
<p>Spesso i dati arrivano in colonne separate: una lista di città, una di temperature. <code>zip(a, b)</code> le cuce coppia per coppia, e <code>dict(zip(a, b))</code> le trasforma direttamente in dizionario:</p>
<pre><code>citta = ["Roma", "Milano", "Napoli"]
temp  = [28, 22, 30]
list(zip(citta, temp))   # [("Roma", 28), ("Milano", 22), ("Napoli", 30)]
dict(zip(citta, temp))   # {"Roma": 28, "Milano": 22, "Napoli": 30}</code></pre>
<p>È esattamente ciò che fa Pandas quando costruisci un DataFrame da colonne: allinea sequenze parallele.</p>
`, more: `
<p><code>zip</code> si ferma alla sequenza <strong>più corta</strong>: <code>zip([1,2,3], ["a","b"])</code> produce solo due coppie, ignorando silenziosamente il terzo elemento della prima lista. Questo è comodo quando è intenzionale, ma è anche una fonte di bug silenziosi quando due colonne che dovrebbero avere la stessa lunghezza per errore non ce l'hanno — vale la pena controllare <code>len()</code> di entrambe prima di uno <code>zip</code> importante, invece di scoprire il problema a valle.</p>
<p><code>zip</code> può prendere più di due sequenze insieme: <code>zip(nomi, età, città)</code> produce triple invece di coppie. E il trucco <code>zip(*coppie)</code> (con l'asterisco, che spacchetta una lista di tuple in argomenti separati) fa l'operazione INVERSA: da una lista di coppie, ricostruisce le due sequenze originali separate — un'operazione chiamata "trasposizione", utile quando i dati arrivano già accoppiati e li vuoi separare in colonne.</p>
<p>Un'alternativa a <code>dict(zip(chiavi, valori))</code> per costruire dizionari da coppie parallele è la dict comprehension: <code>{k: v for k, v in zip(chiavi, valori)}</code> — più lunga da scrivere ma più facile da estendere se serve trasformare le chiavi o i valori mentre li accoppi.</p>
` },

    {
      type: "exercise", id: "warm-06", kg: 15, title: "Cuci il meteo",
      task: `<p>Hai due liste parallele: <code>citta</code> e <code>umidita</code> (in percentuale). Crea:</p>
<ul>
<li><code>mappa_umidita</code>: dizionario città → umidità</li>
<li><code>citta_umide</code>: lista delle città (stringhe) con umidità superiore a 65 — usa <code>zip</code> in una comprehension</li>
</ul>`,
      starter: `citta = ["Roma", "Milano", "Napoli", "Torino", "Palermo"]
umidita = [55, 70, 75, 45, 40]

mappa_umidita = ...
citta_umide = ...

print(mappa_umidita)
print(citta_umide)`,
      check: `assert 'mappa_umidita' in globals() and mappa_umidita == {"Roma": 55, "Milano": 70, "Napoli": 75, "Torino": 45, "Palermo": 40}, "mappa_umidita deve mappare ogni citta' alla sua umidita': usa dict(zip(...))"
assert 'citta_umide' in globals() and citta_umide == ["Milano", "Napoli"], "citta_umide deve essere ['Milano', 'Napoli']: sono le sole citta' con umidita' > 65"`,
      hint: `<p>Per la seconda: <code>[c for c, u in zip(citta, umidita) if u &gt; 65]</code>.</p>`,
      solution: `citta = ["Roma", "Milano", "Napoli", "Torino", "Palermo"]
umidita = [55, 70, 75, 45, 40]

mappa_umidita = dict(zip(citta, umidita))
citta_umide = [c for c, u in zip(citta, umidita) if u > 65]

print(mappa_umidita)
print(citta_umide)`
    },

    { type: "theory", title: "Insiemi: appartenenza senza doppioni", html: `
<p>Il <code>set</code> è una collezione <strong>senza duplicati e senza ordine</strong>, pensata per due cose: eliminare i doppioni e confrontare gruppi.</p>
<pre><code>iscritti_a = {"anna", "bruno", "carlo"}
iscritti_b = {"bruno", "diana"}

iscritti_a & iscritti_b   # intersezione: {"bruno"}
iscritti_a | iscritti_b   # unione: tutti, senza doppioni
iscritti_a - iscritti_b   # differenza: solo in a → {"anna", "carlo"}
"anna" in iscritti_a      # appartenenza: velocissima, anche su milioni di elementi</code></pre>
<p><code>set(lista)</code> converte in insieme, il modo più rapido per "quanti valori distinti ci sono" o "rimuovi i doppioni".</p>
`, more: `
<p>Un insieme è internamente una <strong>tabella hash</strong> (la stessa struttura dati che sta dietro ai dizionari): questo è il motivo per cui <code>elemento in insieme</code> è quasi istantaneo — O(1) in media, indipendente da quanti elementi contiene l'insieme — mentre <code>elemento in lista</code> deve scandire la lista una posizione alla volta nel caso peggiore, O(n). Su un insieme di 10 elementi la differenza è invisibile; su un insieme di 10 milioni, è la differenza tra un programma istantaneo e uno che gira per minuti.</p>
<p>Prezzo da pagare: un insieme richiede che i suoi elementi siano <strong>hashable</strong> (grosso modo, immutabili) — puoi mettere numeri, stringhe e tuple in un set, ma NON liste o dizionari (che sono mutabili, quindi il loro "hash" non potrebbe restare stabile nel tempo). E un set non mantiene alcun ordine: se serve l'ordine di inserimento oltre alla deduplica, va usato un altro strumento (es. <code>dict.fromkeys(lista)</code>, che deduplica MANTENENDO l'ordine, sfruttando il fatto che i dizionari moderni sono ordinati).</p>
<p>Oltre a <code>&amp;</code>, <code>|</code>, <code>-</code>, esiste la differenza simmetrica <code>^</code>: <code>a ^ b</code> restituisce gli elementi che stanno in uno SOLO dei due insiemi (non in entrambi) — utile per rispondere a "cosa è cambiato" tra due versioni di un insieme di dati.</p>
` },

    {
      type: "exercise", id: "warm-07", kg: 10, title: "Due corsi, stessi iscritti?",
      task: `<p>Hai gli iscritti a due corsi online, <code>corso_python</code> e <code>corso_sql</code> (liste, con possibili doppioni interni). Calcola:</p>
<ul>
<li><code>entrambi</code>: chi è iscritto a <strong>entrambi</strong> i corsi (insieme)</li>
<li><code>solo_python</code>: chi è iscritto <strong>solo</strong> a Python</li>
<li><code>totale_distinti</code>: quante persone distinte in totale tra i due corsi (un intero)</li>
</ul>`,
      starter: `corso_python = ["anna", "bruno", "carlo", "anna", "diana"]
corso_sql = ["bruno", "elena", "carlo"]

entrambi = ...
solo_python = ...
totale_distinti = ...

print(entrambi, solo_python, totale_distinti)`,
      check: `assert 'entrambi' in globals() and entrambi == {"bruno", "carlo"}, "entrambi: set(corso_python) & set(corso_sql)"
assert 'solo_python' in globals() and solo_python == {"anna", "diana"}, "solo_python: set(corso_python) - set(corso_sql)"
assert 'totale_distinti' in globals() and totale_distinti == 5, "totale_distinti: len(set(corso_python) | set(corso_sql)) — anna compare due volte ma conta una sola"`,
      hint: `<p>Prima trasforma entrambe le liste con <code>set(...)</code>, poi usa <code>&amp;</code>, <code>-</code>, <code>|</code>.</p>`,
      solution: `corso_python = ["anna", "bruno", "carlo", "anna", "diana"]
corso_sql = ["bruno", "elena", "carlo"]

sp, ss = set(corso_python), set(corso_sql)
entrambi = sp & ss
solo_python = sp - ss
totale_distinti = len(sp | ss)

print(entrambi, solo_python, totale_distinti)`
    },

    { type: "theory", title: "enumerate: indice e valore insieme", html: `
<p>Iterare e sapere <em>anche</em> la posizione è un bisogno costante. Scrivere un contatore a mano è fragile; <code>enumerate()</code> lo fa per te:</p>
<pre><code>prezzi = [12.0, 8.5, 30.0]
for i, p in enumerate(prezzi):
    print(i, p)          # 0 12.0 / 1 8.5 / 2 30.0

for i, p in enumerate(prezzi, start=1):   # si puo' partire da 1
    print(i, p)</code></pre>
<p>Utile per costruire dizionari posizione→valore, o per trovare "a che indice succede X" senza contatori manuali soggetti a errori.</p>
`, more: `
<p>Un contatore manuale (<code>i = 0</code> prima del ciclo, <code>i += 1</code> all'ultima riga) è un classico da cui nascono bug: dimenticare l'incremento, incrementarlo nel punto sbagliato (prima o dopo un <code>continue</code>), o perdere il conteggio se il ciclo viene interrotto in anticipo. <code>enumerate</code> elimina l'intera categoria di errore: l'indice è generato automaticamente dal linguaggio, sincronizzato per costruzione con l'elemento a cui si riferisce.</p>
<p><code>enumerate</code> funziona su qualsiasi sequenza <strong>iterabile</strong>, non solo le liste: stringhe (<code>for i, carattere in enumerate("ciao")</code>), righe di un file, chiavi di un dizionario. È anche componibile con altri strumenti: <code>list(enumerate(lista))</code> materializza le coppie (indice, valore) come lista di tuple, utile quando serve passarle a una funzione che si aspetta dati già "impacchettati" invece di iterarli sul momento.</p>
<p>Un pattern imparentato: quando serve SOLO l'indice dell'ultimo elemento che soddisfa una condizione (non il primo), si scorre con <code>enumerate</code> SENZA <code>break</code>, lasciando che l'ultima assegnazione "vinca" — la variabile, alla fine del ciclo, contiene naturalmente l'ultimo indice trovato.</p>
` },

    {
      type: "exercise", id: "warm-08", kg: 10, title: "A che posto sei?",
      task: `<p>Hai <code>prezzi</code>, una lista di prezzi in ordine di listino. Usando <code>enumerate</code> (niente contatori manuali):</p>
<ul>
<li><code>posizioni</code>: dizionario indice → prezzo</li>
<li><code>primo_sopra_soglia</code>: l'indice del <strong>primo</strong> prezzo maggiore di 20 (usa un ciclo con <code>enumerate</code> e interrompi con <code>break</code>)</li>
</ul>`,
      starter: `prezzi = [12.0, 8.5, 30.0, 19.9, 45.0]

posizioni = {}
for i, p in enumerate(prezzi):
    posizioni[i] = p

primo_sopra_soglia = None
# completa il ciclo per trovare l'indice
for i, p in enumerate(prezzi):
    ...

print(posizioni)
print(primo_sopra_soglia)`,
      check: `assert 'posizioni' in globals() and posizioni == {0: 12.0, 1: 8.5, 2: 30.0, 3: 19.9, 4: 45.0}, "posizioni deve mappare ogni indice al suo prezzo"
assert 'primo_sopra_soglia' in globals() and primo_sopra_soglia == 2, "primo_sopra_soglia deve essere 2: e' il primo indice con prezzo > 20 (30.0)"`,
      hint: `<p>Dentro il ciclo: <code>if p &gt; 20: primo_sopra_soglia = i; break</code>. Il <code>break</code> ferma il ciclo appena trovato.</p>`,
      solution: `prezzi = [12.0, 8.5, 30.0, 19.9, 45.0]

posizioni = {}
for i, p in enumerate(prezzi):
    posizioni[i] = p

primo_sopra_soglia = None
for i, p in enumerate(prezzi):
    if p > 20:
        primo_sopra_soglia = i
        break

print(posizioni)
print(primo_sopra_soglia)`
    },

    { type: "theory", title: "Gestire gli errori: try/except", html: `
<p>Un programma robusto prevede che qualcosa possa andare storto: una divisione per zero, un testo che non è un numero. <code>try/except</code> intercetta l'errore invece di far crollare tutto:</p>
<pre><code>def dividi(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

def a_numero(testo):
    try:
        return float(testo)
    except ValueError:
        return None</code></pre>
<p>Intercetta <strong>l'eccezione specifica</strong> che ti aspetti (<code>ZeroDivisionError</code>, <code>ValueError</code>), non un generico <code>except:</code> — altrimenti nascondi anche i bug veri. È lo stesso principio del <code>fillna</code> vs <code>dropna</code> che vedrai in Pandas: gestire il caso previsto, senza far sparire l'imprevisto.</p>
`, more: `
<p><code>try/except</code> ha altre due clausole opzionali, meno note ma utili: <code>else</code> (eseguito SOLO se il blocco <code>try</code> non ha sollevato nulla) e <code>finally</code> (eseguito SEMPRE, che ci sia stato un errore o no — tipico per chiudere un file o una connessione, indipendentemente dall'esito). La struttura completa è <code>try / except / else / finally</code>, nell'ordine in cui vanno scritti.</p>
<p>Un errore di principiante da evitare con cura: <code>except:</code> senza specificare il tipo cattura <strong>letteralmente qualsiasi cosa</strong>, incluso premere Ctrl+C per interrompere il programma (che tecnicamente solleva <code>KeyboardInterrupt</code>) o errori di battitura nel tuo stesso codice (<code>NameError</code> per una variabile scritta male). Il programma continua come se nulla fosse, nascondendo bug che avresti voluto vedere subito. La regola pratica: cattura sempre il tipo di eccezione più specifico possibile per il caso che stai davvero gestendo.</p>
<p>Puoi anche sollevare eccezioni tue con <code>raise ValueError("messaggio")</code> — utile per far fallire "rumorosamente e presto" una funzione quando riceve dati che non ha senso processare, invece di lasciare che l'errore si manifesti più tardi, più lontano dalla causa reale, e molto più difficile da diagnosticare.</p>
` },

    {
      type: "exercise", id: "warm-09", kg: 15, title: "Non far crollare tutto",
      task: `<p>Scrivi due funzioni difensive:</p>
<ul>
<li><code>dividi_sicuro(a, b)</code>: restituisce <code>a / b</code>, o <code>None</code> se <code>b</code> è 0</li>
<li><code>a_intero(testo)</code>: converte <code>testo</code> in <code>int</code>, o restituisce <code>None</code> se non è un numero valido (cattura <code>ValueError</code>)</li>
</ul>`,
      starter: `def dividi_sicuro(a, b):
    ...

def a_intero(testo):
    ...

print(dividi_sicuro(10, 2))
print(dividi_sicuro(10, 0))
print(a_intero("42"))
print(a_intero("boh"))`,
      check: `assert 'dividi_sicuro' in globals() and dividi_sicuro(10, 2) == 5.0, "dividi_sicuro(10, 2) deve essere 5.0"
assert dividi_sicuro(10, 0) is None, "dividi_sicuro(10, 0) deve restituire None, non sollevare ZeroDivisionError"
assert 'a_intero' in globals() and a_intero("42") == 42, "a_intero('42') deve essere l'intero 42"
assert a_intero("boh") is None, "a_intero('boh') deve restituire None, non sollevare ValueError"`,
      hint: `<p>Per la prima: <code>if b == 0: return None</code> prima di dividere, oppure un <code>try/except ZeroDivisionError</code>. Per la seconda, <code>try: return int(testo) except ValueError: return None</code>.</p>`,
      solution: `def dividi_sicuro(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

def a_intero(testo):
    try:
        return int(testo)
    except ValueError:
        return None

print(dividi_sicuro(10, 2))
print(dividi_sicuro(10, 0))
print(a_intero("42"))
print(a_intero("boh"))`
    },

    { type: "theory", title: "f-string: formattare l'output", html: `
<p>Le <strong>f-string</strong> incorporano espressioni dentro le stringhe, con formattazione precisa — indispensabili per report leggibili:</p>
<pre><code>prezzo = 19.9
f"Prezzo: {prezzo:.2f} €"       # "Prezzo: 19.90 €" — 2 decimali fissi
f"{0.256:.1%}"                  # "25.6%" — percentuale con 1 decimale
f"{42:>5}"                      # "   42" — allineato a destra su 5 caratteri</code></pre>
<p>Il formato dopo i due punti (<code>:.2f</code>, <code>:.1%</code>) è lo <strong>specificatore</strong>: <code>f</code> per i decimali fissi, <code>%</code> per le percentuali (moltiplica per 100 da sola!), <code>&gt;</code>/<code>&lt;</code>/<code>^</code> per l'allineamento. Userai questo per ogni numero che finisce in un report o in un grafico.</p>
`, more: `
<p>Uno specificatore molto usato che non abbiamo ancora visto: <code>,</code> per il separatore delle migliaia — <code>f"{1234567:,}"</code> produce <code>"1,234,567"</code>, molto più leggibile di una sequenza di cifre senza separatori. Si combina con gli altri: <code>f"{1234567.891:,.2f}"</code> dà <code>"1,234,567.89"</code>.</p>
<p>Le f-string possono contenere <strong>qualsiasi espressione Python</strong>, non solo nomi di variabili: <code>f"{prezzo * 1.22:.2f}"</code> calcola il prezzo con IVA al volo dentro le graffe, e persino <code>f"{nome.upper()}"</code> chiama un metodo direttamente. Un trucco di debug molto usato: <code>f"{variabile=}"</code> (col segno di uguale dentro le graffe, disponibile da Python 3.8) stampa automaticamente sia il nome che il valore, producendo <code>"variabile=42"</code> — comodissimo per stampe di debug veloci senza scrivere <code>print("variabile:", variabile)</code> a mano.</p>
<p>Prima delle f-string (introdotte in Python 3.6), si usava <code>"{}".format(valore)</code> o l'operatore <code>%</code> in stile C (<code>"%d" % valore</code>): li incontrerai ancora in codice più vecchio, ma per codice nuovo le f-string sono lo standard, più leggibili perché il valore compare esattamente dove verrà stampato invece che alla fine della riga.</p>
` },

    {
      type: "exercise", id: "warm-10", kg: 15, title: "Un report che si legge",
      task: `<p>Hai <code>ricavo</code> (float) e <code>quota_online</code> (frazione tra 0 e 1). Costruisci la stringa <code>report</code> con una f-string che produca <strong>esattamente</strong>:</p>
<p><code>Ricavo: 12345.60 € (67.0% online)</code></p>
<p>(il ricavo con 2 decimali, la quota come percentuale con 1 decimale)</p>`,
      starter: `ricavo = 12345.6
quota_online = 0.67

report = ...

print(report)`,
      check: `assert 'report' in globals() and report == "Ricavo: 12345.60 € (67.0% online)", "Controlla gli specificatori: :.2f per il ricavo, :.1% per la quota (che va moltiplicata per 100 automaticamente da %)"`,
      hint: `<p><code>f"Ricavo: {ricavo:.2f} € ({quota_online:.1%} online)"</code> — occhio alle parentesi tonde, sono testo letterale, non fanno parte della formattazione.</p>`,
      solution: `ricavo = 12345.6
quota_online = 0.67

report = f"Ricavo: {ricavo:.2f} € ({quota_online:.1%} online)"

print(report)`
    },

    {
      type: "exercise", id: "warm-11", kg: 5, title: "Serie: slicing su temperature",
      task: `<p>Hai <code>temp</code>, 7 letture giornaliere. Crea <code>primi3</code> (prime 3), <code>ultimi3</code> (ultime 3), <code>centro</code> (dal quarto elemento in poi, escluso l'ultimo — cioè <code>temp[3:-1]</code>).</p>`,
      starter: `temp = [14, 15, 18, 20, 22, 19, 16]

primi3 = ...
ultimi3 = ...
centro = ...

print(primi3, ultimi3, centro)`,
      check: `assert primi3 == [14, 15, 18], "primi3: temp[:3]"
assert ultimi3 == [22, 19, 16], "ultimi3: temp[-3:]"
assert centro == [20, 22, 19], "centro: temp[3:-1] — dal quarto elemento fino al penultimo"`,
      hint: `<p><code>temp[:3]</code>, <code>temp[-3:]</code>, <code>temp[3:-1]</code>.</p>`,
      solution: `temp = [14, 15, 18, 20, 22, 19, 16]

primi3 = temp[:3]
ultimi3 = temp[-3:]
centro = temp[3:-1]

print(primi3, ultimi3, centro)`
    },

    {
      type: "exercise", id: "warm-12", kg: 5, title: "Serie: il carrello della spesa",
      task: `<p>Hai <code>carrello</code>, gli articoli comprati. Costruisci <code>conteggi</code> (quante volte ogni articolo) e <code>articolo_top</code> (quello comprato più volte, con <code>max(..., key=...)</code>).</p>`,
      starter: `carrello = ["mele", "pane", "mele", "latte", "pane", "mele", "uova"]

conteggi = {}
for a in carrello:
    conteggi[a] = conteggi.get(a, 0) + 1

articolo_top = ...

print(conteggi, articolo_top)`,
      check: `assert conteggi == {"mele": 3, "pane": 2, "latte": 1, "uova": 1}, "conteggi sbagliato"
assert articolo_top == "mele", "articolo_top: max(conteggi, key=conteggi.get)"`,
      hint: `<p><code>max(conteggi, key=conteggi.get)</code>.</p>`,
      solution: `carrello = ["mele", "pane", "mele", "latte", "pane", "mele", "uova"]

conteggi = {}
for a in carrello:
    conteggi[a] = conteggi.get(a, 0) + 1

articolo_top = max(conteggi, key=conteggi.get)

print(conteggi, articolo_top)`
    },

    {
      type: "exercise", id: "warm-13", kg: 10, title: "Serie: film ben votati",
      task: `<p>Hai <code>film</code>, lista di tuple <code>(titolo, voto)</code>. Crea <code>buoni</code> (titoli con voto &gt;= 7) e <code>maiuscoli</code> (tutti i titoli in maiuscolo), entrambi con list comprehension.</p>`,
      starter: `film = [("Inception", 8), ("Cats", 3), ("Matrix", 9), ("Sequel Fiacco", 5)]

buoni = ...
maiuscoli = ...

print(buoni)
print(maiuscoli)`,
      check: `assert buoni == ["Inception", "Matrix"], "buoni: [t for t, v in film if v >= 7]"
assert maiuscoli == ["INCEPTION", "CATS", "MATRIX", "SEQUEL FIACCO"], "maiuscoli: [t.upper() for t, v in film]"`,
      hint: `<p><code>[t for t, v in film if v &gt;= 7]</code>.</p>`,
      solution: `film = [("Inception", 8), ("Cats", 3), ("Matrix", 9), ("Sequel Fiacco", 5)]

buoni = [t for t, v in film if v >= 7]
maiuscoli = [t.upper() for t, v in film]

print(buoni)
print(maiuscoli)`
    },

    {
      type: "exercise", id: "warm-14", kg: 10, title: "Serie: il massimo sicuro",
      task: `<p>Scrivi <code>massimo_sicuro(lista)</code>: restituisce <code>max(lista)</code>, o <code>None</code> se la lista è vuota.</p>`,
      starter: `def massimo_sicuro(lista):
    ...

print(massimo_sicuro([3, 7, 2]))
print(massimo_sicuro([]))`,
      check: `assert massimo_sicuro([3, 7, 2]) == 7
assert massimo_sicuro([]) is None
assert massimo_sicuro([-5, -1, -9]) == -1`,
      hint: `<p><code>if not lista: return None</code>, poi <code>return max(lista)</code>.</p>`,
      solution: `def massimo_sicuro(lista):
    if not lista:
        return None
    return max(lista)

print(massimo_sicuro([3, 7, 2]))
print(massimo_sicuro([]))`
    },

    {
      type: "exercise", id: "warm-15", kg: 15, title: "Serie: la libreria per pagine",
      task: `<p>Hai <code>libri</code>, lista di dizionari <code>{"titolo":..., "pagine":...}</code>. Crea <code>per_pagine</code> (ordinati per pagine decrescenti) e <code>piu_lungo</code> (titolo del primo).</p>`,
      starter: `libri = [
    {"titolo": "Racconto Breve", "pagine": 90},
    {"titolo": "Saga Epica", "pagine": 820},
    {"titolo": "Manuale", "pagine": 340},
]

per_pagine = ...
piu_lungo = ...

print(piu_lungo)`,
      check: `assert [l["titolo"] for l in per_pagine] == ["Saga Epica", "Manuale", "Racconto Breve"]
assert piu_lungo == "Saga Epica"`,
      hint: `<p><code>sorted(libri, key=lambda l: l["pagine"], reverse=True)</code>.</p>`,
      solution: `libri = [
    {"titolo": "Racconto Breve", "pagine": 90},
    {"titolo": "Saga Epica", "pagine": 820},
    {"titolo": "Manuale", "pagine": 340},
]

per_pagine = sorted(libri, key=lambda l: l["pagine"], reverse=True)
piu_lungo = per_pagine[0]["titolo"]

print(piu_lungo)`
    },

    {
      type: "exercise", id: "warm-16", kg: 15, title: "Serie: città e popolazione",
      task: `<p>Hai <code>citta</code> e <code>popolazione</code> (liste parallele, in milioni). Crea <code>mappa</code> (dict città→popolazione) e <code>grandi</code> (città con popolazione &gt; 2).</p>`,
      starter: `citta = ["Roma", "Torino", "Milano", "Genova"]
popolazione = [2.8, 0.9, 1.4, 0.6]

mappa = ...
grandi = ...

print(mappa)
print(grandi)`,
      check: `assert mappa == {"Roma": 2.8, "Torino": 0.9, "Milano": 1.4, "Genova": 0.6}
assert grandi == ["Roma"]`,
      hint: `<p><code>[c for c, p in zip(citta, popolazione) if p &gt; 2]</code>.</p>`,
      solution: `citta = ["Roma", "Torino", "Milano", "Genova"]
popolazione = [2.8, 0.9, 1.4, 0.6]

mappa = dict(zip(citta, popolazione))
grandi = [c for c, p in zip(citta, popolazione) if p > 2]

print(mappa)
print(grandi)`
    },

    {
      type: "exercise", id: "warm-17", kg: 10, title: "Serie: due playlist",
      task: `<p>Hai <code>playlist_a</code> e <code>playlist_b</code> (liste di canzoni). Crea <code>comuni</code> (in entrambe), <code>solo_a</code> (solo nella prima), <code>tutte</code> (unione, senza doppioni, come <code>set</code>).</p>`,
      starter: `playlist_a = ["Song1", "Song2", "Song3"]
playlist_b = ["Song2", "Song4"]

comuni = ...
solo_a = ...
tutte = ...

print(comuni, solo_a, tutte)`,
      check: `assert comuni == {"Song2"}
assert solo_a == {"Song1", "Song3"}
assert tutte == {"Song1", "Song2", "Song3", "Song4"}`,
      hint: `<p><code>set(playlist_a) &amp; set(playlist_b)</code>, <code>-</code>, <code>|</code>.</p>`,
      solution: `playlist_a = ["Song1", "Song2", "Song3"]
playlist_b = ["Song2", "Song4"]

a, b = set(playlist_a), set(playlist_b)
comuni = a & b
solo_a = a - b
tutte = a | b

print(comuni, solo_a, tutte)`
    },

    {
      type: "exercise", id: "warm-18", kg: 10, title: "Serie: primo saldo negativo",
      task: `<p>Hai <code>saldi</code>, i saldi di un conto giorno per giorno. Con <code>enumerate</code>, trova <code>primo_negativo</code>: l'indice del primo saldo minore di 0 (o <code>None</code> se non ce n'è).</p>`,
      starter: `saldi = [120, 80, 30, -10, -50, 5]

primo_negativo = None
for i, s in enumerate(saldi):
    ...

print(primo_negativo)`,
      check: `assert primo_negativo == 3`,
      hint: `<p><code>if s &lt; 0: primo_negativo = i; break</code>.</p>`,
      solution: `saldi = [120, 80, 30, -10, -50, 5]

primo_negativo = None
for i, s in enumerate(saldi):
    if s < 0:
        primo_negativo = i
        break

print(primo_negativo)`
    },

    {
      type: "exercise", id: "warm-19", kg: 15, title: "Serie: radice sicura",
      task: `<p>Scrivi <code>radice_sicura(x)</code> che restituisce <code>math.sqrt(x)</code>, o <code>None</code> se <code>x</code> è negativo (cattura <code>ValueError</code>, non controllare il segno a mano).</p>`,
      starter: `import math

def radice_sicura(x):
    ...

print(radice_sicura(16))
print(radice_sicura(-4))`,
      check: `assert abs(radice_sicura(16) - 4.0) < 1e-9
assert radice_sicura(-4) is None
assert abs(radice_sicura(2) - 1.4142135623730951) < 1e-9`,
      hint: `<p><code>try: return math.sqrt(x) except ValueError: return None</code>.</p>`,
      solution: `import math

def radice_sicura(x):
    try:
        return math.sqrt(x)
    except ValueError:
        return None

print(radice_sicura(16))
print(radice_sicura(-4))`
    },

    {
      type: "exercise", id: "warm-20", kg: 15, title: "Serie: bollettino meteo",
      task: `<p>Hai <code>temp</code> e <code>umidita</code> (float). Costruisci <code>bollettino</code> con f-string, esattamente: <code>"18.5°C, umidita' 62.0%"</code> (1 decimale su entrambi).</p>`,
      starter: `temp = 18.5
umidita = 0.62

bollettino = ...

print(bollettino)`,
      check: `assert bollettino == "18.5°C, umidita' 62.0%", "Occhio: umidita' e' una frazione (0.62), va moltiplicata per 100 con :.1%"`,
      hint: `<p><code>f"{temp:.1f}°C, umidita' {umidita:.1%}"</code>.</p>`,
      solution: `temp = 18.5
umidita = 0.62

bollettino = f"{temp:.1f}°C, umidita' {umidita:.1%}"

print(bollettino)`
    },

    {
      type: "exercise", id: "warm-21", kg: 15, title: "Combo: parole lunghe e frequenti",
      task: `<p>Hai <code>testo</code> (una frase). Costruisci <code>conteggi</code>: dizionario che conta SOLO le parole con più di 4 lettere (usa una comprehension per filtrare prima, poi conta con un ciclo).</p>`,
      starter: `testo = "il gatto nero salta sul tavolo del salotto con eleganza"

parole_lunghe = [p for p in testo.split() if len(p) > 4]

conteggi = {}
for p in parole_lunghe:
    ...

print(conteggi)`,
      check: `assert conteggi == {"gatto": 1, "salta": 1, "tavolo": 1, "salotto": 1, "eleganza": 1}, "Solo le parole con piu' di 4 lettere: il, nero(4), sul, del, con sono escluse"`,
      hint: `<p>"nero" ha 4 lettere, non più di 4: resta fuori. Nel ciclo: <code>conteggi[p] = conteggi.get(p, 0) + 1</code>.</p>`,
      solution: `testo = "il gatto nero salta sul tavolo del salotto con eleganza"

parole_lunghe = [p for p in testo.split() if len(p) > 4]

conteggi = {}
for p in parole_lunghe:
    conteggi[p] = conteggi.get(p, 0) + 1

print(conteggi)`
    },

    {
      type: "exercise", id: "warm-22", kg: 15, title: "Combo: prezzo sicuro dal testo",
      task: `<p>Scrivi <code>prezzo_da_testo(s)</code>: converte <code>s</code> in <code>float</code>, o restituisce <code>None</code> se non è un numero valido (cattura <code>ValueError</code>). Poi applicala a <code>voci</code> con una list comprehension, salvando in <code>prezzi</code>.</p>`,
      starter: `def prezzo_da_testo(s):
    ...

voci = ["12.50", "N/D", "8.0", "boh", "20.99"]

prezzi = [prezzo_da_testo(v) for v in voci]
print(prezzi)`,
      check: `assert prezzi == [12.5, None, 8.0, None, 20.99]`,
      hint: `<p><code>try: return float(s) except ValueError: return None</code>.</p>`,
      solution: `def prezzo_da_testo(s):
    try:
        return float(s)
    except ValueError:
        return None

voci = ["12.50", "N/D", "8.0", "boh", "20.99"]

prezzi = [prezzo_da_testo(v) for v in voci]
print(prezzi)`
    },

    {
      type: "exercise", id: "warm-23", kg: 20, title: "Combo: podio dei punteggi",
      task: `<p>Hai <code>giocatori</code>, lista di dizionari <code>{"nome":..., "punti":...}</code>. Crea <code>podio</code>: i nomi (solo stringhe) dei primi 3 per punteggio decrescente, in un colpo solo (sort + slice + comprehension).</p>`,
      starter: `giocatori = [
    {"nome": "Aldo", "punti": 340},
    {"nome": "Bea", "punti": 510},
    {"nome": "Chen", "punti": 290},
    {"nome": "Dina", "punti": 480},
    {"nome": "Elio", "punti": 120},
]

podio = ...
print(podio)`,
      check: `assert podio == ["Bea", "Dina", "Aldo"]`,
      hint: `<p><code>[g["nome"] for g in sorted(giocatori, key=lambda g: g["punti"], reverse=True)[:3]]</code>.</p>`,
      solution: `giocatori = [
    {"nome": "Aldo", "punti": 340},
    {"nome": "Bea", "punti": 510},
    {"nome": "Chen", "punti": 290},
    {"nome": "Dina", "punti": 480},
    {"nome": "Elio", "punti": 120},
]

podio = [g["nome"] for g in sorted(giocatori, key=lambda g: g["punti"], reverse=True)[:3]]
print(podio)`
    },

    {
      type: "exercise", id: "warm-24", kg: 20, title: "Combo: il primo doppione",
      task: `<p>Hai <code>codici</code>, una lista di codici scanner. Trova <code>primo_duplicato</code>: il primo codice che compare per la <strong>seconda</strong> volta (usa un <code>set</code> per tenere traccia di quelli già visti, dentro un ciclo con <code>enumerate</code>).</p>`,
      starter: `codici = ["A1", "B2", "C3", "B2", "D4"]

visti = set()
primo_duplicato = None
for i, c in enumerate(codici):
    ...

print(primo_duplicato)`,
      check: `assert primo_duplicato == "B2"`,
      hint: `<p>Per ogni <code>c</code>: <code>if c in visti: primo_duplicato = c; break</code>, altrimenti <code>visti.add(c)</code>.</p>`,
      solution: `codici = ["A1", "B2", "C3", "B2", "D4"]

visti = set()
primo_duplicato = None
for i, c in enumerate(codici):
    if c in visti:
        primo_duplicato = c
        break
    visti.add(c)

print(primo_duplicato)`
    },

    {
      type: "exercise", id: "warm-25", kg: 20, title: "Combo: unisci tre colonne e filtra",
      task: `<p>Hai tre liste parallele: <code>nome</code>, <code>eta</code>, <code>citta</code>. Crea <code>persone</code>: lista di dizionari <code>{"nome":.., "eta":.., "citta":..}</code> (con <code>zip</code> a tre), poi <code>maggiorenni</code>: solo quelle con età &gt;= 18.</p>`,
      starter: `nome = ["Ada", "Bo", "Cy"]
eta = [17, 22, 30]
citta = ["Roma", "Bari", "Pisa"]

persone = [{"nome": n, "eta": e, "citta": c} for n, e, c in zip(nome, eta, citta)]
maggiorenni = ...

print(persone)
print(maggiorenni)`,
      check: `assert persone[1] == {"nome": "Bo", "eta": 22, "citta": "Bari"}
assert [p["nome"] for p in maggiorenni] == ["Bo", "Cy"]`,
      hint: `<p><code>[p for p in persone if p["eta"] &gt;= 18]</code>.</p>`,
      solution: `nome = ["Ada", "Bo", "Cy"]
eta = [17, 22, 30]
citta = ["Roma", "Bari", "Pisa"]

persone = [{"nome": n, "eta": e, "citta": c} for n, e, c in zip(nome, eta, citta)]
maggiorenni = [p for p in persone if p["eta"] >= 18]

print(persone)
print(maggiorenni)`
    },

    {
      type: "exercise", id: "warm-26", kg: 20, title: "Combo: totale scontrino con doppio ciclo",
      task: `<p>Hai <code>quantita</code> e <code>prezzi</code> per due prodotti diversi in due carrelli. Con un <strong>ciclo annidato</strong> (senza NumPy, lo vedrai vettorizzato più avanti), calcola <code>totali</code>: lista con il totale di ogni carrello.</p>`,
      starter: `carrelli = [[2, 1], [0, 3], [1, 1]]
prezzi = [5.0, 2.0]

totali = []
for carrello in carrelli:
    tot = 0
    for i in range(len(carrello)):
        tot += carrello[i] * prezzi[i]
    totali.append(tot)

print(totali)`,
      check: `assert totali == [12.0, 6.0, 7.0]`,
      hint: `<p>Il ciclo esterno scorre i carrelli, quello interno moltiplica quantità per prezzo posizione per posizione.</p>`,
      solution: `carrelli = [[2, 1], [0, 3], [1, 1]]
prezzi = [5.0, 2.0]

totali = []
for carrello in carrelli:
    tot = 0
    for i in range(len(carrello)):
        tot += carrello[i] * prezzi[i]
    totali.append(tot)

print(totali)`
    },

    { type: "theory", title: "Ricorsione: una funzione che chiama se stessa", html: `
<p>Una funzione <strong>ricorsiva</strong> risolve un problema chiamando una versione più piccola di se stessa, fino a un <strong>caso base</strong> che si risolve senza ricorsione (altrimenti non si ferma mai):</p>
<pre><code>def fattoriale(n):
    if n <= 1:        # caso base
        return 1
    return n * fattoriale(n - 1)   # caso ricorsivo: n volte (n-1)!</code></pre>
<p><code>fattoriale(4)</code> chiama <code>fattoriale(3)</code>, che chiama <code>fattoriale(2)</code>, che chiama <code>fattoriale(1)</code> — che si ferma. Ogni chiamata "si fida" che la versione più piccola dia la risposta giusta. È un modo di pensare diverso dal ciclo, spesso più naturale per strutture ricorsive per natura (alberi, directory annidate).</p>
`, more: `
<p>Python ha un <strong>limite di profondità di ricorsione</strong> (di default circa 1000 chiamate annidate): oltre quella soglia solleva <code>RecursionError</code>. Questo è un limite pratico reale — a differenza di linguaggi ottimizzati per la ricorsione profonda, in Python una funzione ricorsiva su una lista di 100.000 elementi (come <code>somma_ricorsiva</code> vista in questa sala) può letteralmente fallire per superamento dello stack, mentre la stessa operazione con un ciclo <code>for</code> o con <code>sum()</code> non ha questo problema. Regola pratica: la ricorsione è elegante per profondità piccole/moderate e strutture naturalmente ricorsive (alberi), ma per elaborare sequenze lunghe un ciclo resta la scelta più sicura in Python.</p>
<p>Un'ottimizzazione chiamata <strong>tail call optimization</strong> risolverebbe il problema in molti linguaggi (Scheme, alcuni compilatori di Haskell) — ma <strong>Python deliberatamente non la implementa</strong>, una scelta di design controversa ma intenzionale dei suoi creatori, per mantenere i traceback di errore comprensibili (con l'ottimizzazione, i frame intermedi "scompaiono" e capire dove è successo un errore diventerebbe più difficile).</p>
<p>Un pattern avanzato che risolve parte del problema pratico è la <strong>memoization</strong>: se una funzione ricorsiva richiama se stessa con gli stessi argomenti più volte (tipico di <code>fibonacci</code> ricorsivo ingenuo), cachare i risultati già calcolati (con <code>functools.lru_cache</code>, un decoratore pronto all'uso) trasforma un algoritmo esponenziale in uno lineare, senza cambiare una riga della logica ricorsiva.</p>
` },

    {
      type: "exercise", id: "warm-27", kg: 15, title: "Ricorsione: il fattoriale",
      task: `<p>Scrivi <code>fattoriale(n)</code> in modo ricorsivo: caso base <code>n &lt;= 1</code> restituisce 1, altrimenti <code>n * fattoriale(n-1)</code>.</p>`,
      starter: `def fattoriale(n):
    ...

print(fattoriale(5))
print(fattoriale(1))`,
      check: `assert fattoriale(5) == 120
assert fattoriale(1) == 1
assert fattoriale(0) == 1
assert fattoriale(6) == 720`,
      hint: `<p><code>if n &lt;= 1: return 1</code>, poi <code>return n * fattoriale(n - 1)</code>.</p>`,
      solution: `def fattoriale(n):
    if n <= 1:
        return 1
    return n * fattoriale(n - 1)

print(fattoriale(5))
print(fattoriale(1))`
    },

    {
      type: "exercise", id: "warm-28", kg: 15, title: "Ricorsione: somma di una lista",
      task: `<p>Scrivi <code>somma_ricorsiva(lista)</code> senza usare <code>sum()</code>: caso base lista vuota → 0, altrimenti primo elemento + somma ricorsiva del resto (<code>lista[1:]</code>).</p>`,
      starter: `def somma_ricorsiva(lista):
    ...

print(somma_ricorsiva([1, 2, 3, 4]))
print(somma_ricorsiva([]))`,
      check: `assert somma_ricorsiva([1, 2, 3, 4]) == 10
assert somma_ricorsiva([]) == 0
assert somma_ricorsiva([5]) == 5`,
      hint: `<p><code>if not lista: return 0</code>, poi <code>return lista[0] + somma_ricorsiva(lista[1:])</code>.</p>`,
      solution: `def somma_ricorsiva(lista):
    if not lista:
        return 0
    return lista[0] + somma_ricorsiva(lista[1:])

print(somma_ricorsiva([1, 2, 3, 4]))
print(somma_ricorsiva([]))`
    },

    { type: "theory", title: "map e filter: comprehension in altra forma", html: `
<p>Prima delle comprehension, Python usava <code>map</code> e <code>filter</code>: <code>map(funzione, sequenza)</code> applica la funzione a ogni elemento, <code>filter(funzione, sequenza)</code> tiene solo gli elementi per cui la funzione restituisce <code>True</code>.</p>
<pre><code>list(map(str.upper, ["a", "b"]))          # ["A", "B"]
list(filter(lambda x: x > 0, [-2, 3, -1, 5]))   # [3, 5]</code></pre>
<p>Entrambi restituiscono un oggetto "pigro" (va avvolto in <code>list()</code> per vederlo). Oggi si preferiscono le comprehension per leggibilità, ma <code>map</code>/<code>filter</code> compaiono ancora spesso in codice esistente, ed è la stessa idea che ritroverai in <code>.apply()</code> di Pandas.</p>
`, more: `
<p>Il termine tecnico per il comportamento "pigro" di <code>map</code> e <code>filter</code> è <strong>lazy evaluation</strong>: gli elementi non vengono calcolati finché qualcosa non li richiede effettivamente (un ciclo <code>for</code>, o la conversione esplicita <code>list(...)</code>). Questo significa che <code>map(funzione_costosa, lista_enorme)</code> restituisce ISTANTANEAMENTE, perché non ha ancora calcolato nulla — il lavoro vero avviene solo iterando il risultato. È un vantaggio di memoria enorme su sequenze grandi: non serve materializzare l'intera lista di risultati in memoria se ti servono uno alla volta.</p>
<p><code>map</code> può prendere PIÙ sequenze insieme: <code>map(lambda a, b: a+b, lista1, lista2)</code> somma elemento per elemento le due liste, fermandosi alla più corta (stesso comportamento di <code>zip</code>). È l'antenato concettuale delle operazioni vettorizzate di NumPy — <code>array1 + array2</code> fa la stessa cosa, ma a velocità nativa invece che con un ciclo Python mascherato.</p>
<p>Una terza funzione della stessa famiglia, meno nota, è <code>functools.reduce</code>: applica una funzione cumulativamente agli elementi di una sequenza, riducendola a un singolo valore — <code>reduce(lambda a, b: a*b, [1,2,3,4])</code> calcola il fattoriale di 4 senza ricorsione né ciclo esplicito. È potente ma spesso meno leggibile di un ciclo scritto per esteso: usalo con parsimonia.</p>
` },

    {
      type: "exercise", id: "warm-29", kg: 15, title: "map: converti tutto",
      task: `<p>Hai <code>testi</code>, numeri scritti come stringhe. Con <code>map</code>, crea <code>numeri</code>: la lista degli stessi valori convertiti a <code>float</code>.</p>`,
      starter: `testi = ["3.5", "10", "0.2"]

numeri = list(map(float, testi))
print(numeri)`,
      check: `assert numeri == [3.5, 10.0, 0.2]`,
      hint: `<p><code>map(float, testi)</code> applica <code>float()</code> a ogni stringa.</p>`,
      solution: `testi = ["3.5", "10", "0.2"]

numeri = list(map(float, testi))
print(numeri)`
    },

    {
      type: "exercise", id: "warm-30", kg: 15, title: "filter: solo i positivi",
      task: `<p>Con <code>filter</code> e una lambda, crea <code>positivi</code>: solo i valori maggiori di 0 da <code>valori</code>.</p>`,
      starter: `valori = [-3, 5, 0, -1, 8, 2]

positivi = list(filter(lambda x: x > 0, valori))
print(positivi)`,
      check: `assert positivi == [5, 8, 2]`,
      hint: `<p><code>filter(lambda x: x &gt; 0, valori)</code> tiene solo i valori per cui la lambda è <code>True</code>.</p>`,
      solution: `valori = [-3, 5, 0, -1, 8, 2]

positivi = list(filter(lambda x: x > 0, valori))
print(positivi)`
    },

    { type: "theory", title: "Ordinare con più chiavi", html: `
<p><code>sorted</code> può ordinare per più criteri insieme: la <code>key</code> restituisce una <strong>tupla</strong>, e Python confronta le tuple elemento per elemento (prima il primo valore, a parità il secondo, ecc.):</p>
<pre><code>persone = [{"reparto": "B", "eta": 30}, {"reparto": "A", "eta": 25}, {"reparto": "A", "eta": 40}]
sorted(persone, key=lambda p: (p["reparto"], p["eta"]))
# ordina prima per reparto (A prima di B), poi per eta' a parita' di reparto</code></pre>
<p>Per invertire solo una delle due chiavi si usa un trucco: negare i numeri (<code>-p["eta"]</code>) dentro la tupla, oppure ordinare due volte sfruttando la stabilità di <code>sorted</code> (chi è uguale mantiene l'ordine relativo).</p>
`, more: `
<p>Il trucco di negare un numero (<code>-p["eta"]</code>) funziona solo per valori numerici: se vuoi invertire l'ordine di una chiave TESTUALE (es. ordinare l'alfabeto al contrario, ma solo per quella chiave, mentre le altre restano nell'ordine normale), la negazione non è applicabile alle stringhe. In quel caso, il metodo generale è ordinare due volte sfruttando la stabilità: prima ordini per la chiave secondaria (con o senza <code>reverse</code>), poi ordini di nuovo per la chiave primaria — l'ordinamento stabile "ricorda" la sistemazione precedente per gli elementi a parità di chiave primaria.</p>
<p>Il modulo <code>operator</code> della libreria standard offre scorciatoie leggibili al posto delle lambda per i casi più comuni: <code>operator.itemgetter("eta")</code> è equivalente a <code>lambda p: p["eta"]</code> ma leggermente più veloce (è implementato in C) ed è spesso preferito nel codice professionale per ordinamenti su singola chiave, mentre le lambda restano più flessibili per chiavi composte o calcolate.</p>
<p>Un errore concettuale comune: pensare che <code>sorted(lista, key=chiave, reverse=True)</code> sia equivalente a invertire il segno di TUTTI i criteri. In realtà <code>reverse=True</code> inverte l'intero ordinamento finale (compresa la stabilità: a parità di chiave, l'ordine relativo si inverte anch'esso) — non è la stessa cosa che negare la chiave stessa, una distinzione sottile ma che può produrre risultati diversi quando ci sono elementi con chiavi identiche.</p>
` },

    {
      type: "exercise", id: "warm-31", kg: 20, title: "Ordina per reparto e poi età",
      task: `<p>Su <code>dipendenti</code>, crea <code>ordinati</code>: ordinati prima per <code>reparto</code> (alfabetico) e poi, a parità di reparto, per <code>eta</code> crescente.</p>`,
      starter: `dipendenti = [
    {"nome": "Aldo", "reparto": "B", "eta": 30},
    {"nome": "Bea", "reparto": "A", "eta": 40},
    {"nome": "Cin", "reparto": "A", "eta": 25},
]

ordinati = ...
print([(d["nome"], d["reparto"], d["eta"]) for d in ordinati])`,
      check: `assert [d["nome"] for d in ordinati] == ["Cin", "Bea", "Aldo"]`,
      hint: `<p><code>sorted(dipendenti, key=lambda d: (d["reparto"], d["eta"]))</code>.</p>`,
      solution: `dipendenti = [
    {"nome": "Aldo", "reparto": "B", "eta": 30},
    {"nome": "Bea", "reparto": "A", "eta": 40},
    {"nome": "Cin", "reparto": "A", "eta": 25},
]

ordinati = sorted(dipendenti, key=lambda d: (d["reparto"], d["eta"]))
print([(d["nome"], d["reparto"], d["eta"]) for d in ordinati])`
    },

    { type: "theory", title: "Counter e defaultdict: contare senza .get()", html: `
<p>Il modulo <code>collections</code> offre scorciatoie per i pattern che hai già scritto a mano. <code>Counter</code> conta occorrenze in una riga:</p>
<pre><code>from collections import Counter
c = Counter(["a", "b", "a", "a", "c"])
c["a"]                # 3
c.most_common(2)       # [("a", 3), ("b", 1)] — i 2 piu' frequenti</code></pre>
<p><code>defaultdict</code> evita <code>.get(k, default)</code>: crea automaticamente il valore di default alla prima scrittura su una chiave nuova:</p>
<pre><code>from collections import defaultdict
gruppi = defaultdict(list)
gruppi["a"].append(1)   # nessun errore anche se "a" non esisteva ancora</code></pre>
`, more: `
<p><code>Counter</code> è in realtà un dizionario specializzato — eredita da <code>dict</code> — con qualche superpotenza in più oltre a <code>most_common()</code>: due Counter si possono sommare direttamente (<code>counter1 + counter2</code> somma i conteggi chiave per chiave) o sottrarre, ed esiste <code>Counter(lista).total()</code> per il totale di tutti i conteggi insieme. Interrogare una chiave assente restituisce 0 invece di sollevare <code>KeyError</code> — lo stesso comfort di <code>.get(chiave, 0)</code>, ma automatico.</p>
<p><code>defaultdict</code> accetta come argomento qualsiasi <strong>funzione senza argomenti</strong> che produca il valore di default: <code>defaultdict(list)</code> chiama <code>list()</code> (che dà <code>[]</code>) per ogni chiave nuova, <code>defaultdict(int)</code> chiama <code>int()</code> (che dà <code>0</code>, comodo per i conteggi), <code>defaultdict(lambda: "sconosciuto")</code> usa una lambda per un default personalizzato qualsiasi. La sottigliezza da ricordare: il default viene generato SOLO al momento dell'accesso in lettura o scrittura a una chiave mancante — non tutto in anticipo.</p>
<p>Una trappola di <code>defaultdict</code>: anche un semplice controllo di lettura come <code>if defaultdict_var["chiave"]:</code> CREA la chiave con il valore di default se non esisteva, come effetto collaterale — perché internamente sta comunque accedendo (e quindi generando) quella voce. Se vuoi controllare l'esistenza di una chiave SENZA crearla per errore, usa <code>"chiave" in defaultdict_var</code>, che non ha questo effetto collaterale.</p>
` },

    {
      type: "exercise", id: "warm-32", kg: 15, title: "Counter: i tag più usati",
      task: `<p>Con <code>Counter</code>, su <code>tag</code> crea <code>conteggi</code> (un Counter) e <code>top2</code>: i 2 tag più frequenti con il loro conteggio (lista di tuple).</p>`,
      starter: `from collections import Counter

tag = ["python", "sql", "python", "docker", "python", "sql"]

conteggi = Counter(tag)
top2 = ...

print(conteggi)
print(top2)`,
      check: `assert conteggi["python"] == 3
assert top2 == [("python", 3), ("sql", 2)]`,
      hint: `<p><code>conteggi.most_common(2)</code>.</p>`,
      solution: `from collections import Counter

tag = ["python", "sql", "python", "docker", "python", "sql"]

conteggi = Counter(tag)
top2 = conteggi.most_common(2)

print(conteggi)
print(top2)`
    },

    {
      type: "exercise", id: "warm-33", kg: 20, title: "defaultdict: raggruppa per iniziale",
      task: `<p>Con <code>defaultdict(list)</code>, raggruppa <code>parole</code> per lettera iniziale in <code>gruppi</code> (dict: lettera → lista di parole).</p>`,
      starter: `from collections import defaultdict

parole = ["cane", "casa", "topo", "torta", "cane", "tenda"]

gruppi = defaultdict(list)
for p in parole:
    gruppi[p[0]].append(p)

print(dict(gruppi))`,
      check: `assert dict(gruppi) == {"c": ["cane", "casa", "cane"], "t": ["topo", "torta", "tenda"]}`,
      hint: `<p><code>gruppi[p[0]].append(p)</code> — con <code>defaultdict(list)</code> non serve controllare se la chiave esiste già.</p>`,
      solution: `from collections import defaultdict

parole = ["cane", "casa", "topo", "torta", "cane", "tenda"]

gruppi = defaultdict(list)
for p in parole:
    gruppi[p[0]].append(p)

print(dict(gruppi))`
    },

    {
      type: "exercise", id: "warm-34", kg: 25, title: "Massimale: mini-analisi di un testo",
      task: `<p>Su <code>frase</code>, costruisci una pipeline completa senza librerie esterne:</p>
<ul>
<li><code>parole</code>: lista delle parole (minuscolo, split sullo spazio)</li>
<li><code>conteggi</code>: <code>Counter</code> delle parole</li>
<li><code>top3</code>: le 3 parole più frequenti (lista di tuple)</li>
<li><code>report</code>: stringa f-string <code>"Parola piu' comune: 'X' (Nx)"</code> con X e N dalla prima voce di <code>top3</code></li>
</ul>`,
      starter: `from collections import Counter

frase = "il gatto vede il topo il topo scappa il gatto insegue"

parole = frase.lower().split()
conteggi = Counter(parole)
top3 = conteggi.most_common(3)
report = f"Parola piu' comune: '{top3[0][0]}' ({top3[0][1]}x)"

print(top3)
print(report)`,
      check: `assert conteggi["il"] == 4
assert top3[0] == ("il", 4)
assert report == "Parola piu' comune: 'il' (4x)"`,
      hint: `<p><code>top3[0]</code> è una tupla <code>(parola, conteggio)</code>: <code>top3[0][0]</code> e <code>top3[0][1]</code>.</p>`,
      solution: `from collections import Counter

frase = "il gatto vede il topo il topo scappa il gatto insegue"

parole = frase.lower().split()
conteggi = Counter(parole)
top3 = conteggi.most_common(3)
report = f"Parola piu' comune: '{top3[0][0]}' ({top3[0][1]}x)"

print(top3)
print(report)`
    },

    {
      type: "exercise", id: "warm-35", kg: 20, title: "Combo: biglietteria con retry",
      task: `<p>Scrivi <code>valida_eta(testo)</code>: converte <code>testo</code> in <code>int</code> (cattura <code>ValueError</code> → <code>None</code>), poi restituisce <code>"bambino"</code> se &lt; 12, <code>"adulto"</code> altrimenti — o <code>None</code> se la conversione fallisce. Applicala a <code>input_utenti</code> con una comprehension, in <code>categorie</code>.</p>`,
      starter: `def valida_eta(testo):
    try:
        eta = int(testo)
    except ValueError:
        return None
    return "bambino" if eta < 12 else "adulto"

input_utenti = ["8", "35", "abc", "12"]
categorie = [valida_eta(x) for x in input_utenti]
print(categorie)`,
      check: `assert categorie == ["bambino", "adulto", None, "adulto"]`,
      hint: `<p>L'espressione condizionale <code>"bambino" if eta &lt; 12 else "adulto"</code> è un if in una riga.</p>`,
      solution: `def valida_eta(testo):
    try:
        eta = int(testo)
    except ValueError:
        return None
    return "bambino" if eta < 12 else "adulto"

input_utenti = ["8", "35", "abc", "12"]
categorie = [valida_eta(x) for x in input_utenti]
print(categorie)`
    },

    {
      type: "exercise", id: "warm-36", kg: 20, title: "Combo: indici per valore",
      task: `<p>Con <code>defaultdict(list)</code> ed <code>enumerate</code>, costruisci <code>posizioni</code>: dizionario valore → lista degli indici in cui compare in <code>sequenza</code>.</p>`,
      starter: `from collections import defaultdict

sequenza = ["a", "b", "a", "c", "b", "a"]

posizioni = defaultdict(list)
for i, v in enumerate(sequenza):
    posizioni[v].append(i)

print(dict(posizioni))`,
      check: `assert dict(posizioni) == {"a": [0, 2, 5], "b": [1, 4], "c": [3]}`,
      hint: `<p><code>posizioni[v].append(i)</code> dentro il ciclo <code>enumerate</code>.</p>`,
      solution: `from collections import defaultdict

sequenza = ["a", "b", "a", "c", "b", "a"]

posizioni = defaultdict(list)
for i, v in enumerate(sequenza):
    posizioni[v].append(i)

print(dict(posizioni))`
    },

    {
      type: "exercise", id: "warm-37", kg: 25, title: "Massimale: classifica torneo",
      task: `<p>Hai <code>partite</code>, lista di tuple <code>(vincitore, perdente)</code>. Costruisci:</p>
<ul>
<li><code>vittorie</code>: Counter dei vincitori</li>
<li><code>tutti_giocatori</code>: set di tutti i nomi comparsi (vincitori o perdenti)</li>
<li><code>classifica</code>: lista di tuple <code>(nome, vittorie)</code> per <strong>tutti</strong> i giocatori (anche chi ha 0 vittorie!), ordinata per vittorie decrescenti poi nome alfabetico</li>
</ul>`,
      starter: `from collections import Counter

partite = [("Ada", "Bo"), ("Cy", "Bo"), ("Ada", "Cy"), ("Ada", "Bo")]

vittorie = Counter(v for v, p in partite)
tutti_giocatori = set()
for v, p in partite:
    tutti_giocatori.add(v)
    tutti_giocatori.add(p)

classifica = sorted(
    [(nome, vittorie.get(nome, 0)) for nome in tutti_giocatori],
    key=lambda t: (-t[1], t[0])
)
print(classifica)`,
      check: `assert classifica == [("Ada", 3), ("Cy", 1), ("Bo", 0)]`,
      hint: `<p><code>-t[1]</code> nella chiave inverte l'ordine solo sulle vittorie, mentre <code>t[0]</code> (il nome) resta in ordine alfabetico crescente a parità.</p>`,
      solution: `from collections import Counter

partite = [("Ada", "Bo"), ("Cy", "Bo"), ("Ada", "Cy"), ("Ada", "Bo")]

vittorie = Counter(v for v, p in partite)
tutti_giocatori = set()
for v, p in partite:
    tutti_giocatori.add(v)
    tutti_giocatori.add(p)

classifica = sorted(
    [(nome, vittorie.get(nome, 0)) for nome in tutti_giocatori],
    key=lambda t: (-t[1], t[0])
)
print(classifica)`
    },

    {
      type: "exercise", id: "warm-38", kg: 25, title: "Massimale: ricorsione su struttura annidata",
      task: `<p>Hai <code>albero</code>, una struttura annidata di liste dentro liste (numeri e liste, a profondità variabile). Scrivi <code>somma_annidata(struttura)</code> ricorsiva: se l'elemento è un numero lo somma, se è una lista richiama se stessa su di essa.</p>`,
      starter: `albero = [1, [2, 3, [4, 5]], 6, [7]]

def somma_annidata(struttura):
    totale = 0
    for elem in struttura:
        if isinstance(elem, list):
            totale += somma_annidata(elem)
        else:
            totale += elem
    return totale

print(somma_annidata(albero))`,
      check: `assert somma_annidata(albero) == 28
assert somma_annidata([1, [2, [3, [4]]]]) == 10
assert somma_annidata([]) == 0`,
      hint: `<p><code>isinstance(elem, list)</code> distingue un numero da una sotto-lista: se è lista, ricorsione; altrimenti, somma diretta.</p>`,
      solution: `albero = [1, [2, 3, [4, 5]], 6, [7]]

def somma_annidata(struttura):
    totale = 0
    for elem in struttura:
        if isinstance(elem, list):
            totale += somma_annidata(elem)
        else:
            totale += elem
    return totale

print(somma_annidata(albero))`
    },

    {
      type: "exercise", id: "warm-39", kg: 25, title: "Massimale: report vendite giornaliero",
      task: `<p>Hai <code>vendite</code>, lista di dizionari <code>{"prodotto":.., "importo":..}</code>. Costruisci:</p>
<ul>
<li><code>totale_per_prodotto</code>: defaultdict(float) con il totale incassato per prodotto</li>
<li><code>prodotto_top</code>: il prodotto con incasso più alto</li>
<li><code>report</code>: f-string <code>"Il piu' venduto e' 'X' con Y.YY euro"</code>, con Y arrotondato a 2 decimali</li>
</ul>`,
      starter: `from collections import defaultdict

vendite = [
    {"prodotto": "cuffie", "importo": 29.9},
    {"prodotto": "mouse", "importo": 15.0},
    {"prodotto": "cuffie", "importo": 29.9},
    {"prodotto": "webcam", "importo": 40.0},
]

totale_per_prodotto = defaultdict(float)
for v in vendite:
    totale_per_prodotto[v["prodotto"]] += v["importo"]

prodotto_top = max(totale_per_prodotto, key=totale_per_prodotto.get)
report = f"Il piu' venduto e' '{prodotto_top}' con {totale_per_prodotto[prodotto_top]:.2f} euro"

print(dict(totale_per_prodotto))
print(report)`,
      check: `assert abs(totale_per_prodotto["cuffie"] - 59.8) < 1e-9
assert prodotto_top == "cuffie"
assert report == "Il piu' venduto e' 'cuffie' con 59.80 euro"`,
      hint: `<p><code>defaultdict(float)</code> parte da 0.0 per ogni chiave nuova, così <code>+=</code> funziona subito senza controlli.</p>`,
      solution: `from collections import defaultdict

vendite = [
    {"prodotto": "cuffie", "importo": 29.9},
    {"prodotto": "mouse", "importo": 15.0},
    {"prodotto": "cuffie", "importo": 29.9},
    {"prodotto": "webcam", "importo": 40.0},
]

totale_per_prodotto = defaultdict(float)
for v in vendite:
    totale_per_prodotto[v["prodotto"]] += v["importo"]

prodotto_top = max(totale_per_prodotto, key=totale_per_prodotto.get)
report = f"Il piu' venduto e' '{prodotto_top}' con {totale_per_prodotto[prodotto_top]:.2f} euro"

print(dict(totale_per_prodotto))
print(report)`
    },

    {
      type: "exercise", id: "warm-40", kg: 25, title: "Massimale finale: tutto insieme",
      task: `<p>L'ultima serie del riscaldamento. Hai <code>log</code>, lista di dizionari di accessi <code>{"utente":.., "pagina":.., "durata_sec":..}</code>. Costruisci in un'unica pipeline:</p>
<ul>
<li><code>tempo_per_utente</code>: defaultdict(int) con il tempo totale per utente</li>
<li><code>utente_piu_attivo</code>: chi ha totalizzato più tempo</li>
<li><code>pagine_visitate</code>: set delle pagine distinte visitate da <code>utente_piu_attivo</code> (ricicla il ciclo su <code>log</code>)</li>
<li><code>riepilogo</code>: f-string <code>"X ha passato Y secondi su Z pagine diverse"</code> (Z = <code>len(pagine_visitate)</code>)</li>
</ul>`,
      starter: `from collections import defaultdict

log = [
    {"utente": "ada", "pagina": "home", "durata_sec": 30},
    {"utente": "bo", "pagina": "shop", "durata_sec": 120},
    {"utente": "ada", "pagina": "shop", "durata_sec": 45},
    {"utente": "ada", "pagina": "home", "durata_sec": 20},
    {"utente": "bo", "pagina": "home", "durata_sec": 10},
]

tempo_per_utente = defaultdict(int)
for voce in log:
    tempo_per_utente[voce["utente"]] += voce["durata_sec"]

utente_piu_attivo = max(tempo_per_utente, key=tempo_per_utente.get)

pagine_visitate = set()
for voce in log:
    if voce["utente"] == utente_piu_attivo:
        pagine_visitate.add(voce["pagina"])

riepilogo = f"{utente_piu_attivo} ha passato {tempo_per_utente[utente_piu_attivo]} secondi su {len(pagine_visitate)} pagine diverse"
print(riepilogo)`,
      check: `assert tempo_per_utente["ada"] == 95
assert tempo_per_utente["bo"] == 130
assert utente_piu_attivo == "bo"
assert pagine_visitate == {"shop", "home"}
assert riepilogo == "bo ha passato 130 secondi su 2 pagine diverse"`,
      hint: `<p>Attenzione: "bo" totalizza più tempo di "ada" (130 contro 95) pur avendo meno voci nel log — il conteggio va sui secondi, non sul numero di accessi.</p>`,
      solution: `from collections import defaultdict

log = [
    {"utente": "ada", "pagina": "home", "durata_sec": 30},
    {"utente": "bo", "pagina": "shop", "durata_sec": 120},
    {"utente": "ada", "pagina": "shop", "durata_sec": 45},
    {"utente": "ada", "pagina": "home", "durata_sec": 20},
    {"utente": "bo", "pagina": "home", "durata_sec": 10},
]

tempo_per_utente = defaultdict(int)
for voce in log:
    tempo_per_utente[voce["utente"]] += voce["durata_sec"]

utente_piu_attivo = max(tempo_per_utente, key=tempo_per_utente.get)

pagine_visitate = set()
for voce in log:
    if voce["utente"] == utente_piu_attivo:
        pagine_visitate.add(voce["pagina"])

riepilogo = f"{utente_piu_attivo} ha passato {tempo_per_utente[utente_piu_attivo]} secondi su {len(pagine_visitate)} pagine diverse"
print(riepilogo)`
    },

    {
      type: "exercise", id: "warm-41", kg: 5, title: "Drill: slicing a passi",
      task: `<p>Su <code>numeri</code> (10 valori): <code>alterni</code> (uno sì uno no, dal primo), <code>invertiti</code> (l'intera lista al contrario).</p>`,
      starter: `numeri = [10,20,30,40,50,60,70,80,90,100]

alterni = numeri[::2]
invertiti = numeri[::-1]

print(alterni)
print(invertiti)`,
      check: `assert alterni == [10,30,50,70,90]
assert invertiti == [100,90,80,70,60,50,40,30,20,10]`,
      hint: `<p><code>[::2]</code> è passo 2 su tutta la lista; <code>[::-1]</code> è passo -1, cioè "all'indietro".</p>`,
      solution: `numeri = [10,20,30,40,50,60,70,80,90,100]

alterni = numeri[::2]
invertiti = numeri[::-1]

print(alterni)
print(invertiti)`
    },

    {
      type: "exercise", id: "warm-42", kg: 5, title: "Drill: doppioni via, ordine conservato",
      task: `<p>Su <code>visite</code> (pagine visitate, con ripetizioni): <code>uniche</code>, le pagine distinte nell'ordine della PRIMA visita (usa <code>dict.fromkeys</code>).</p>`,
      starter: `visite = ["home", "shop", "home", "contatti", "shop", "home"]

uniche = list(dict.fromkeys(visite))
print(uniche)`,
      check: `assert uniche == ["home", "shop", "contatti"]`,
      hint: `<p><code>dict.fromkeys(lista)</code> crea un dizionario con le voci di <code>lista</code> come chiavi (i doppioni si fondono automaticamente), mantenendo l'ordine di primo inserimento.</p>`,
      solution: `visite = ["home", "shop", "home", "contatti", "shop", "home"]

uniche = list(dict.fromkeys(visite))
print(uniche)`
    },

    {
      type: "exercise", id: "warm-43", kg: 15, title: "Drill: la trappola del default mutabile",
      task: `<p><code>aggiungi_sbagliato</code> ha un bug classico (lista di default condivisa tra chiamate). Scrivi <code>aggiungi_giusto</code> che lo evita usando <code>None</code> come sentinella.</p>`,
      starter: `def aggiungi_sbagliato(valore, lista=[]):
    lista.append(valore)
    return lista

def aggiungi_giusto(valore, lista=None):
    lista = lista if lista is not None else []
    lista.append(valore)
    return lista

# il bug: due chiamate diverse "si sporcano" a vicenda
bug1 = aggiungi_sbagliato(1)
bug2 = aggiungi_sbagliato(2)

corretto1 = aggiungi_giusto(1)
corretto2 = aggiungi_giusto(2)

print(bug1, bug2)
print(corretto1, corretto2)`,
      check: `assert bug2 == [1, 2], "Il bug fa si' che la seconda chiamata erediti il valore della prima: e' il comportamento (sbagliato) da capire"
assert corretto1 == [1]
assert corretto2 == [2], "aggiungi_giusto non deve avere memoria tra chiamate diverse"`,
      hint: `<p>Nella versione corretta, ogni chiamata senza <code>lista</code> esplicita riceve una lista NUOVA (<code>[]</code> creata al momento), invece di riusare sempre lo stesso oggetto creato una volta sola alla definizione della funzione.</p>`,
      solution: `def aggiungi_sbagliato(valore, lista=[]):
    lista.append(valore)
    return lista

def aggiungi_giusto(valore, lista=None):
    lista = lista if lista is not None else []
    lista.append(valore)
    return lista

bug1 = aggiungi_sbagliato(1)
bug2 = aggiungi_sbagliato(2)

corretto1 = aggiungi_giusto(1)
corretto2 = aggiungi_giusto(2)

print(bug1, bug2)
print(corretto1, corretto2)`
    },

    {
      type: "exercise", id: "warm-44", kg: 10, title: "Drill: restituisci più valori",
      task: `<p>Scrivi <code>minmax(valori)</code> che restituisce <code>(minimo, massimo)</code> insieme, poi spacchettali in due variabili.</p>`,
      starter: `def minmax(valori):
    return min(valori), max(valori)

piu_piccolo, piu_grande = minmax([3, 1, 4, 1, 5, 9, 2])
print(piu_piccolo, piu_grande)`,
      check: `assert piu_piccolo == 1
assert piu_grande == 9`,
      hint: `<p><code>return a, b</code> impacchetta i due valori in una tupla; <code>x, y = funzione(...)</code> li spacchetta di nuovo in due variabili separate.</p>`,
      solution: `def minmax(valori):
    return min(valori), max(valori)

piu_piccolo, piu_grande = minmax([3, 1, 4, 1, 5, 9, 2])
print(piu_piccolo, piu_grande)`
    },

    {
      type: "exercise", id: "warm-45", kg: 10, title: "Drill: dict e set comprehension",
      task: `<p>Da <code>parole</code>: <code>lunghezze</code> (dict parola→lunghezza) e <code>iniziali</code> (set delle lettere iniziali distinte).</p>`,
      starter: `parole = ["casa", "cane", "topo", "torta"]

lunghezze = {p: len(p) for p in parole}
iniziali = {p[0] for p in parole}

print(lunghezze)
print(iniziali)`,
      check: `assert lunghezze == {"casa": 4, "cane": 4, "topo": 4, "torta": 5}
assert iniziali == {"c", "t"}`,
      hint: `<p>Graffe con due punti (<code>chiave: valore</code>) danno un dizionario; graffe senza due punti danno un insieme — stessa "grammatica" della comprehension a lista.</p>`,
      solution: `parole = ["casa", "cane", "topo", "torta"]

lunghezze = {p: len(p) for p in parole}
iniziali = {p[0] for p in parole}

print(lunghezze)
print(iniziali)`
    },

    {
      type: "exercise", id: "warm-46", kg: 15, title: "Drill: appiattisci una matrice",
      task: `<p>Con una comprehension a due <code>for</code>, appiattisci <code>matrice</code> (lista di liste) in <code>piatta</code> (lista unica).</p>`,
      starter: `matrice = [[1,2,3],[4,5,6],[7,8,9]]

piatta = [x for riga in matrice for x in riga]
print(piatta)`,
      check: `assert piatta == [1,2,3,4,5,6,7,8,9]`,
      hint: `<p>Il primo <code>for</code> (più a sinistra) è il ciclo ESTERNO: scorre le righe; il secondo scorre gli elementi di ciascuna riga — nello stesso ordine di due cicli annidati scritti per esteso.</p>`,
      solution: `matrice = [[1,2,3],[4,5,6],[7,8,9]]

piatta = [x for riga in matrice for x in riga]
print(piatta)`
    },

    {
      type: "exercise", id: "warm-47", kg: 10, title: "Drill: filtra con una lambda",
      task: `<p>Su <code>prodotti</code> (dizionari con "scorte"): <code>disponibili</code>, filtrati con <code>filter</code> e una lambda.</p>`,
      starter: `prodotti = [{"nome": "A", "scorte": 5}, {"nome": "B", "scorte": 0}, {"nome": "C", "scorte": 12}]

disponibili = list(filter(lambda p: p["scorte"] > 0, prodotti))
print([p["nome"] for p in disponibili])`,
      check: `assert [p["nome"] for p in disponibili] == ["A", "C"]`,
      hint: `<p><code>filter(lambda p: p["scorte"] &gt; 0, prodotti)</code> tiene solo i dizionari per cui la condizione è vera.</p>`,
      solution: `prodotti = [{"nome": "A", "scorte": 5}, {"nome": "B", "scorte": 0}, {"nome": "C", "scorte": 12}]

disponibili = list(filter(lambda p: p["scorte"] > 0, prodotti))
print([p["nome"] for p in disponibili])`
    },

    {
      type: "exercise", id: "warm-48", kg: 15, title: "Drill: ordina con itemgetter",
      task: `<p>Usa <code>operator.itemgetter</code> (invece di una lambda) per ordinare <code>persone</code> per età crescente.</p>`,
      starter: `from operator import itemgetter

persone = [{"nome": "Ada", "eta": 30}, {"nome": "Bo", "eta": 20}, {"nome": "Cin", "eta": 25}]

ordinate = sorted(persone, key=itemgetter("eta"))
print([p["nome"] for p in ordinate])`,
      check: `assert [p["nome"] for p in ordinate] == ["Bo", "Cin", "Ada"]`,
      hint: `<p><code>itemgetter("eta")</code> è equivalente a <code>lambda p: p["eta"]</code>, ma tramite il modulo <code>operator</code> della libreria standard.</p>`,
      solution: `from operator import itemgetter

persone = [{"nome": "Ada", "eta": 30}, {"nome": "Bo", "eta": 20}, {"nome": "Cin", "eta": 25}]

ordinate = sorted(persone, key=itemgetter("eta"))
print([p["nome"] for p in ordinate])`
    },

    {
      type: "exercise", id: "warm-49", kg: 15, title: "Drill: trasponi con zip e *",
      task: `<p>Da <code>coppie</code> (lista di tuple), ricostruisci le due sequenze separate <code>numeri</code> e <code>lettere</code> usando <code>zip(*coppie)</code>.</p>`,
      starter: `coppie = [(1, "a"), (2, "b"), (3, "c")]

numeri, lettere = zip(*coppie)
print(numeri)
print(lettere)`,
      check: `assert numeri == (1, 2, 3)
assert lettere == ("a", "b", "c")`,
      hint: `<p><code>zip(*coppie)</code> spacchetta la lista di tuple e le "ricuce" per colonna invece che per riga: l'operazione inversa di uno <code>zip</code> normale.</p>`,
      solution: `coppie = [(1, "a"), (2, "b"), (3, "c")]

numeri, lettere = zip(*coppie)
print(numeri)
print(lettere)`
    },

    {
      type: "exercise", id: "warm-50", kg: 15, title: "Drill: differenza simmetrica",
      task: `<p>Su due insiemi di iscritti a due corsi: <code>solo_uno</code>, chi è iscritto a esattamente UNO dei due corsi (usa <code>^</code>).</p>`,
      starter: `corso_a = {"Ada", "Bo", "Cin"}
corso_b = {"Bo", "Dan"}

solo_uno = corso_a ^ corso_b
print(solo_uno)`,
      check: `assert solo_uno == {"Ada", "Cin", "Dan"}`,
      hint: `<p><code>^</code> tra due insiemi tiene gli elementi che stanno in UNO SOLO dei due, escludendo chi sta in entrambi (Bo, qui).</p>`,
      solution: `corso_a = {"Ada", "Bo", "Cin"}
corso_b = {"Bo", "Dan"}

solo_uno = corso_a ^ corso_b
print(solo_uno)`
    },

    {
      type: "exercise", id: "warm-51", kg: 10, title: "Drill: enumerate che parte da 1",
      task: `<p>Su <code>classifica</code> (nomi in ordine di arrivo): costruisci <code>posizioni</code>, lista di stringhe <code>"1. Nome"</code>, <code>"2. Nome"</code> ecc. (posizioni da 1, non da 0).</p>`,
      starter: `classifica = ["Ada", "Bo", "Cin"]

posizioni = [f"{i}. {nome}" for i, nome in enumerate(classifica, start=1)]
print(posizioni)`,
      check: `assert posizioni == ["1. Ada", "2. Bo", "3. Cin"]`,
      hint: `<p><code>enumerate(lista, start=1)</code> fa iniziare il conteggio da 1 invece che da 0, utile per classifiche o numerazioni "umane".</p>`,
      solution: `classifica = ["Ada", "Bo", "Cin"]

posizioni = [f"{i}. {nome}" for i, nome in enumerate(classifica, start=1)]
print(posizioni)`
    },

    {
      type: "exercise", id: "warm-52", kg: 15, title: "Drill: try/except/else/finally al completo",
      task: `<p>Scrivi <code>elabora(x)</code> che usa tutte e 4 le clausole: prova a dividere 100 per <code>x</code>, se fallisce (ZeroDivisionError) registra un errore, se riesce (<code>else</code>) registra un successo, e in ogni caso (<code>finally</code>) conta il tentativo.</p>`,
      starter: `log = {"successi": 0, "errori": 0, "tentativi": 0}

def elabora(x):
    try:
        risultato = 100 / x
    except ZeroDivisionError:
        log["errori"] += 1
        risultato = None
    else:
        log["successi"] += 1
    finally:
        log["tentativi"] += 1
    return risultato

elabora(5)
elabora(0)
elabora(10)

print(log)`,
      check: `assert log == {"successi": 2, "errori": 1, "tentativi": 3}`,
      hint: `<p><code>else</code> gira SOLO se il <code>try</code> non ha sollevato nulla; <code>finally</code> gira SEMPRE, indipendentemente da cosa è successo.</p>`,
      solution: `log = {"successi": 0, "errori": 0, "tentativi": 0}

def elabora(x):
    try:
        risultato = 100 / x
    except ZeroDivisionError:
        log["errori"] += 1
        risultato = None
    else:
        log["successi"] += 1
    finally:
        log["tentativi"] += 1
    return risultato

elabora(5)
elabora(0)
elabora(10)

print(log)`
    },

    {
      type: "exercise", id: "warm-53", kg: 20, title: "Drill: solleva e cattura un errore tuo",
      task: `<p>Scrivi <code>valida_eta(eta)</code>: solleva <code>ValueError("eta negativa")</code> se <code>eta &lt; 0</code>, altrimenti restituisce <code>eta</code>. Poi <code>controlla(eta)</code> che chiama <code>valida_eta</code> e restituisce <code>"ok"</code> o <code>"errore: messaggio"</code>.</p>`,
      starter: `def valida_eta(eta):
    if eta < 0:
        raise ValueError("eta negativa")
    return eta

def controlla(eta):
    try:
        valida_eta(eta)
        return "ok"
    except ValueError as e:
        return f"errore: {e}"

r1 = controlla(25)
r2 = controlla(-5)

print(r1)
print(r2)`,
      check: `assert r1 == "ok"
assert r2 == "errore: eta negativa"`,
      hint: `<p><code>except ValueError as e:</code> cattura l'eccezione E la salva nella variabile <code>e</code>: <code>str(e)</code> (o direttamente <code>e</code> dentro una f-string) dà il messaggio passato a <code>raise</code>.</p>`,
      solution: `def valida_eta(eta):
    if eta < 0:
        raise ValueError("eta negativa")
    return eta

def controlla(eta):
    try:
        valida_eta(eta)
        return "ok"
    except ValueError as e:
        return f"errore: {e}"

r1 = controlla(25)
r2 = controlla(-5)

print(r1)
print(r2)`
    },

    {
      type: "exercise", id: "warm-54", kg: 15, title: "Drill: separatore delle migliaia",
      task: `<p>Formatta <code>fatturato</code> (un intero grande) con il separatore delle migliaia in <code>testo</code>.</p>`,
      starter: `fatturato = 1234567

testo = f"{fatturato:,}"
print(testo)`,
      check: `assert testo == "1,234,567"`,
      hint: `<p><code>:,</code> come specificatore inserisce automaticamente le virgole ogni 3 cifre.</p>`,
      solution: `fatturato = 1234567

testo = f"{fatturato:,}"
print(testo)`
    },

    {
      type: "exercise", id: "warm-55", kg: 15, title: "Drill: debug rapido con f-string",
      task: `<p>Usa lo specificatore <code>=</code> per stampare automaticamente nome e valore di due variabili in un colpo solo, senza scriverli a mano.</p>`,
      starter: `prezzo = 19.9
quantita = 3

debug_prezzo = f"{prezzo=}"
debug_quantita = f"{quantita=}"

print(debug_prezzo)
print(debug_quantita)`,
      check: `assert debug_prezzo == "prezzo=19.9"
assert debug_quantita == "quantita=3"`,
      hint: `<p><code>f"{variabile=}"</code> (col segno di uguale dentro le graffe) espande automaticamente sia il nome sia il valore, utilissimo per stampe di debug veloci.</p>`,
      solution: `prezzo = 19.9
quantita = 3

debug_prezzo = f"{prezzo=}"
debug_quantita = f"{quantita=}"

print(debug_prezzo)
print(debug_quantita)`
    },

    {
      type: "exercise", id: "warm-56", kg: 20, title: "Drill: fibonacci con la cache",
      task: `<p>Scrivi <code>fib(n)</code> ricorsiva con <code>@functools.lru_cache</code>: senza cache, <code>fib(30)</code> ricorsiva ingenua sarebbe lentissima; con la cache è istantanea.</p>`,
      starter: `import functools

@functools.lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

risultato = fib(30)
print(risultato)`,
      check: `assert risultato == 832040`,
      hint: `<p><code>lru_cache</code> memorizza il risultato di ogni chiamata (per ogni valore di <code>n</code> già visto): la seconda volta che serve <code>fib(15)</code>, per esempio, non lo ricalcola da zero.</p>`,
      solution: `import functools

@functools.lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

risultato = fib(30)
print(risultato)`
    },

    {
      type: "exercise", id: "warm-57", kg: 20, title: "Drill: map su due sequenze insieme",
      task: `<p>Con <code>map</code> e una lambda a due argomenti, somma <code>quantita</code> e <code>riserva</code> elemento per elemento in <code>totali</code>.</p>`,
      starter: `quantita = [10, 20, 30]
riserva = [1, 2, 3]

totali = list(map(lambda a, b: a + b, quantita, riserva))
print(totali)`,
      check: `assert totali == [11, 22, 33]`,
      hint: `<p><code>map(funzione, seq1, seq2)</code> applica la funzione prendendo un elemento da ciascuna sequenza alla volta — lo stesso "accoppiamento" di <code>zip</code>, ma già trasformato.</p>`,
      solution: `quantita = [10, 20, 30]
riserva = [1, 2, 3]

totali = list(map(lambda a, b: a + b, quantita, riserva))
print(totali)`
    },

    {
      type: "exercise", id: "warm-58", kg: 20, title: "Drill: riduci una lista a un solo numero",
      task: `<p>Con <code>functools.reduce</code>, calcola il prodotto di tutti gli elementi di <code>numeri</code> (senza cicli espliciti né <code>numpy</code>).</p>`,
      starter: `from functools import reduce

numeri = [1, 2, 3, 4, 5]

prodotto = reduce(lambda a, b: a * b, numeri)
print(prodotto)`,
      check: `assert prodotto == 120`,
      hint: `<p><code>reduce(funzione, sequenza)</code> applica la funzione cumulativamente: prima a (1,2), poi al risultato con 3, poi con 4, poi con 5 — il fattoriale di 5.</p>`,
      solution: `from functools import reduce

numeri = [1, 2, 3, 4, 5]

prodotto = reduce(lambda a, b: a * b, numeri)
print(prodotto)`
    },

    {
      type: "exercise", id: "warm-59", kg: 20, title: "Drill: doppio criterio con negazione",
      task: `<p>Ordina <code>prodotti</code> per <code>categoria</code> (alfabetico crescente) e poi per <code>prezzo</code> DECRESCENTE, usando la tupla chiave con negazione del prezzo (non <code>reverse=True</code>, che invertirebbe anche la categoria).</p>`,
      starter: `prodotti = [
    {"nome": "A", "categoria": "food", "prezzo": 10},
    {"nome": "B", "categoria": "food", "prezzo": 25},
    {"nome": "C", "categoria": "tech", "prezzo": 15},
]

ordinati = sorted(prodotti, key=lambda p: (p["categoria"], -p["prezzo"]))
print([p["nome"] for p in ordinati])`,
      check: `assert [p["nome"] for p in ordinati] == ["B", "A", "C"]`,
      hint: `<p>Negare solo <code>prezzo</code> nella tupla chiave inverte SOLO quel criterio, lasciando <code>categoria</code> in ordine normale crescente.</p>`,
      solution: `prodotti = [
    {"nome": "A", "categoria": "food", "prezzo": 10},
    {"nome": "B", "categoria": "food", "prezzo": 25},
    {"nome": "C", "categoria": "tech", "prezzo": 15},
]

ordinati = sorted(prodotti, key=lambda p: (p["categoria"], -p["prezzo"]))
print([p["nome"] for p in ordinati])`
    },

    {
      type: "exercise", id: "warm-60", kg: 20, title: "Drill: somma di due Counter",
      task: `<p>Con due <code>Counter</code> di vendite (mattina, pomeriggio): <code>totale_giorno</code> (somma dei due), <code>top1</code> (il prodotto più venduto in totale).</p>`,
      starter: `from collections import Counter

mattina = Counter({"caffe": 20, "te": 5})
pomeriggio = Counter({"caffe": 8, "te": 15})

totale_giorno = mattina + pomeriggio
top1 = totale_giorno.most_common(1)[0][0]

print(totale_giorno)
print(top1)`,
      check: `assert totale_giorno == Counter({"caffe": 28, "te": 20})
assert top1 == "caffe"`,
      hint: `<p>Due <code>Counter</code> si sommano con <code>+</code> come se fossero numeri: i conteggi delle chiavi condivise si sommano automaticamente.</p>`,
      solution: `from collections import Counter

mattina = Counter({"caffe": 20, "te": 5})
pomeriggio = Counter({"caffe": 8, "te": 15})

totale_giorno = mattina + pomeriggio
top1 = totale_giorno.most_common(1)[0][0]

print(totale_giorno)
print(top1)`
    },

    {
      type: "exercise", id: "warm-61", kg: 20, title: "Drill: la trappola di defaultdict",
      task: `<p>Dimostra la trappola: leggere una chiave assente da un <code>defaultdict</code> la CREA come effetto collaterale. Confronta <code>len()</code> prima e dopo una semplice lettura, poi usa <code>in</code> per un controllo "sicuro" che non crea nulla.</p>`,
      starter: `from collections import defaultdict

d = defaultdict(int)
d["a"] = 1

n_chiavi_prima = len(d)

valore = d["b"]  # leggere una chiave assente... la CREA!

n_chiavi_dopo = len(d)

controllo_sicuro = "c" in d  # questo NON crea nulla

print(n_chiavi_prima, n_chiavi_dopo)
print(controllo_sicuro)
print(len(d))`,
      check: `assert n_chiavi_prima == 1
assert n_chiavi_dopo == 2, "Leggere d['b'] su un defaultdict crea la chiave 'b' con il valore di default (0)"
assert controllo_sicuro == False
assert len(d) == 2, "'in' non deve aver aggiunto altre chiavi"`,
      hint: `<p>Dopo <code>d["b"]</code>, il dizionario ha davvero una nuova chiave <code>"b"</code> con valore 0 — un effetto collaterale sorprendente per chi si aspetta che "leggere" non modifichi mai i dati.</p>`,
      solution: `from collections import defaultdict

d = defaultdict(int)
d["a"] = 1

n_chiavi_prima = len(d)

valore = d["b"]

n_chiavi_dopo = len(d)

controllo_sicuro = "c" in d

print(n_chiavi_prima, n_chiavi_dopo)
print(controllo_sicuro)
print(len(d))`
    },

    {
      type: "exercise", id: "warm-62", kg: 25, title: "Combo: dedup, conta, classifica",
      task: `<p>Da <code>ricerche</code> (query di ricerca, con ripetizioni): <code>distinte</code> (senza doppioni, ordine di prima apparizione), <code>conteggi</code> (Counter), <code>top2</code> (le 2 più frequenti).</p>`,
      starter: `from collections import Counter

ricerche = ["python", "sql", "python", "docker", "python", "sql", "numpy"]

distinte = list(dict.fromkeys(ricerche))
conteggi = Counter(ricerche)
top2 = conteggi.most_common(2)

print(distinte)
print(conteggi)
print(top2)`,
      check: `assert distinte == ["python", "sql", "docker", "numpy"]
assert top2 == [("python", 3), ("sql", 2)]`,
      hint: `<p>Tre attrezzi diversi per tre domande diverse sugli stessi dati grezzi: "quali sono, senza ripetizioni", "quante volte ciascuna", "le più frequenti".</p>`,
      solution: `from collections import Counter

ricerche = ["python", "sql", "python", "docker", "python", "sql", "numpy"]

distinte = list(dict.fromkeys(ricerche))
conteggi = Counter(ricerche)
top2 = conteggi.most_common(2)

print(distinte)
print(conteggi)
print(top2)`
    },

    {
      type: "exercise", id: "warm-63", kg: 25, title: "Combo: somma ricorsiva di una struttura annidata",
      task: `<p>Scrivi <code>somma_annidata(struttura)</code> ricorsiva: se un elemento è una lista, ricorsione; altrimenti sommalo direttamente. Applicala a <code>dati</code> (liste dentro liste, profondità variabile).</p>`,
      starter: `dati = [1, [2, 3], [4, [5, 6]], 7]

def somma_annidata(struttura):
    totale = 0
    for elemento in struttura:
        if isinstance(elemento, list):
            totale += somma_annidata(elemento)
        else:
            totale += elemento
    return totale

risultato = somma_annidata(dati)
print(risultato)`,
      check: `assert risultato == 28`,
      hint: `<p><code>isinstance(elemento, list)</code> distingue un numero da una sotto-lista: se è una lista, il ciclo ricorsivo la esplora ancora; altrimenti somma direttamente il numero.</p>`,
      solution: `dati = [1, [2, 3], [4, [5, 6]], 7]

def somma_annidata(struttura):
    totale = 0
    for elemento in struttura:
        if isinstance(elemento, list):
            totale += somma_annidata(elemento)
        else:
            totale += elemento
    return totale

risultato = somma_annidata(dati)
print(risultato)`
    },

    {
      type: "exercise", id: "warm-64", kg: 25, title: "Combo: ordinamento a due passate",
      task: `<p>Ordina <code>studenti</code> per <code>classe</code> crescente e, a parità di classe, per <code>voto</code> decrescente — usando DUE chiamate separate a <code>sorted</code> che sfruttano la stabilità (non una tupla chiave).</p>`,
      starter: `studenti = [
    {"nome": "Ada", "classe": "1A", "voto": 7},
    {"nome": "Bo", "classe": "1A", "voto": 9},
    {"nome": "Cin", "classe": "1B", "voto": 8},
]

per_voto = sorted(studenti, key=lambda s: s["voto"], reverse=True)
ordinati = sorted(per_voto, key=lambda s: s["classe"])

print([s["nome"] for s in ordinati])`,
      check: `assert [s["nome"] for s in ordinati] == ["Bo", "Ada", "Cin"]`,
      hint: `<p>Il primo <code>sorted</code> (per voto) fissa l'ordine "secondario"; il secondo <code>sorted</code> (per classe, stabile) lo preserva a parità di classe — Bo prima di Ada, entrambi in "1A".</p>`,
      solution: `studenti = [
    {"nome": "Ada", "classe": "1A", "voto": 7},
    {"nome": "Bo", "classe": "1A", "voto": 9},
    {"nome": "Cin", "classe": "1B", "voto": 8},
]

per_voto = sorted(studenti, key=lambda s: s["voto"], reverse=True)
ordinati = sorted(per_voto, key=lambda s: s["classe"])

print([s["nome"] for s in ordinati])`
    },

    {
      type: "exercise", id: "warm-65", kg: 25, title: "Combo: pipeline sicura su input misti",
      task: `<p>Su <code>input_grezzi</code> (stringhe, alcune non numeriche): scrivi <code>a_numero_sicuro(s)</code> (None se fallisce), poi separa in <code>validi</code> e <code>n_scartati</code>.</p>`,
      starter: `input_grezzi = ["12", "abc", "7.5", "", "42"]

def a_numero_sicuro(s):
    try:
        return float(s)
    except ValueError:
        return None

convertiti = [a_numero_sicuro(s) for s in input_grezzi]
validi = [v for v in convertiti if v is not None]
n_scartati = sum(1 for v in convertiti if v is None)

print(validi)
print(n_scartati)`,
      check: `assert validi == [12.0, 7.5, 42.0]
assert n_scartati == 2`,
      hint: `<p>"abc" e "" (stringa vuota) falliscono entrambi la conversione a <code>float</code>: <code>a_numero_sicuro</code> li trasforma in <code>None</code> invece di far crollare tutta la pipeline.</p>`,
      solution: `input_grezzi = ["12", "abc", "7.5", "", "42"]

def a_numero_sicuro(s):
    try:
        return float(s)
    except ValueError:
        return None

convertiti = [a_numero_sicuro(s) for s in input_grezzi]
validi = [v for v in convertiti if v is not None]
n_scartati = sum(1 for v in convertiti if v is None)

print(validi)
print(n_scartati)`
    },

    {
      type: "exercise", id: "warm-66", kg: 25, title: "Combo: indice inverso tag→articoli",
      task: `<p>Da <code>tag_articoli</code> (coppie tag/articolo): costruisci <code>indice</code>, un <code>defaultdict(list)</code> che mappa ogni tag alla lista di articoli che lo usano.</p>`,
      starter: `from collections import defaultdict

tag_articoli = [("rosso", "maglia"), ("blu", "maglia"), ("rosso", "borsa"), ("blu", "scarpe")]

indice = defaultdict(list)
for tag, articolo in tag_articoli:
    indice[tag].append(articolo)

print(dict(indice))`,
      check: `assert dict(indice) == {"rosso": ["maglia", "borsa"], "blu": ["maglia", "scarpe"]}`,
      hint: `<p>Ogni coppia aggiunge l'articolo alla lista del suo tag: con <code>defaultdict(list)</code> non serve controllare se il tag è già una chiave prima di fare <code>.append()</code>.</p>`,
      solution: `from collections import defaultdict

tag_articoli = [("rosso", "maglia"), ("blu", "maglia"), ("rosso", "borsa"), ("blu", "scarpe")]

indice = defaultdict(list)
for tag, articolo in tag_articoli:
    indice[tag].append(articolo)

print(dict(indice))`
    },

    {
      type: "exercise", id: "warm-67", kg: 25, title: "Combo: quanti calcoli risparmia la cache?",
      task: `<p>Con un contatore globale di chiamate REALI (non dalla cache): confronta quante volte <code>fib_lento</code> (senza cache) e <code>fib_veloce</code> (con cache) eseguono davvero il corpo della funzione per calcolare <code>fib(10)</code>.</p>`,
      starter: `import functools

chiamate_lente = 0
def fib_lento(n):
    global chiamate_lente
    chiamate_lente += 1
    if n < 2:
        return n
    return fib_lento(n-1) + fib_lento(n-2)

chiamate_veloci = 0
@functools.lru_cache(maxsize=None)
def fib_veloce(n):
    global chiamate_veloci
    chiamate_veloci += 1
    if n < 2:
        return n
    return fib_veloce(n-1) + fib_veloce(n-2)

fib_lento(10)
fib_veloce(10)

print(chiamate_lente, chiamate_veloci)`,
      check: `assert chiamate_lente > 100, "Senza cache, fib(10) ricorsivo richiede oltre 100 chiamate reali (crescita esponenziale)"
assert chiamate_veloci == 11, "Con la cache, ogni valore da 0 a 10 viene calcolato una sola volta: 11 chiamate reali"`,
      hint: `<p>Senza cache, <code>fib_lento(10)</code> ricalcola più volte gli stessi sotto-problemi (es. <code>fib_lento(5)</code> viene richiesto più e più volte lungo l'albero ricorsivo); con la cache, ogni valore si calcola una volta sola e viene riletto dalla memoria le volte successive.</p>`,
      solution: `import functools

chiamate_lente = 0
def fib_lento(n):
    global chiamate_lente
    chiamate_lente += 1
    if n < 2:
        return n
    return fib_lento(n-1) + fib_lento(n-2)

chiamate_veloci = 0
@functools.lru_cache(maxsize=None)
def fib_veloce(n):
    global chiamate_veloci
    chiamate_veloci += 1
    if n < 2:
        return n
    return fib_veloce(n-1) + fib_veloce(n-2)

fib_lento(10)
fib_veloce(10)

print(chiamate_lente, chiamate_veloci)`
    },

    {
      type: "exercise", id: "warm-68", kg: 25, title: "Combo: parsing di una riga di log",
      task: `<p>Da <code>riga</code> (un log grezzo "utente|azione|durata"): estrai le 3 parti con <code>.split("|")</code>, converti la durata a intero in modo sicuro, costruisci un dizionario pulito.</p>`,
      starter: `riga = "ada|login|45"
riga_rotta = "bo|logout|xx"

def parsea(riga):
    parti = riga.split("|")
    utente, azione, durata_testo = parti
    try:
        durata = int(durata_testo)
    except ValueError:
        durata = None
    return {"utente": utente, "azione": azione, "durata": durata}

evento1 = parsea(riga)
evento2 = parsea(riga_rotta)

print(evento1)
print(evento2)`,
      check: `assert evento1 == {"utente": "ada", "azione": "login", "durata": 45}
assert evento2 == {"utente": "bo", "azione": "logout", "durata": None}`,
      hint: `<p><code>.split("|")</code> spezza la riga in 3 pezzi esatti, che poi si spacchettano direttamente in 3 variabili: <code>utente, azione, durata_testo = parti</code>.</p>`,
      solution: `riga = "ada|login|45"
riga_rotta = "bo|logout|xx"

def parsea(riga):
    parti = riga.split("|")
    utente, azione, durata_testo = parti
    try:
        durata = int(durata_testo)
    except ValueError:
        durata = None
    return {"utente": utente, "azione": azione, "durata": durata}

evento1 = parsea(riga)
evento2 = parsea(riga_rotta)

print(evento1)
print(evento2)`
    },

    {
      type: "exercise", id: "warm-69", kg: 25, title: "Combo: aggregazione a due livelli",
      task: `<p>Da <code>vendite</code> (regione, prodotto, importo): costruisci <code>agg</code>, un dizionario annidato regione→prodotto→totale importo (usa <code>.setdefault</code> due volte).</p>`,
      starter: `vendite = [
    {"regione": "nord", "prodotto": "A", "importo": 10},
    {"regione": "nord", "prodotto": "B", "importo": 20},
    {"regione": "sud", "prodotto": "A", "importo": 15},
    {"regione": "nord", "prodotto": "A", "importo": 5},
]

agg = {}
for v in vendite:
    agg.setdefault(v["regione"], {}).setdefault(v["prodotto"], 0)
    agg[v["regione"]][v["prodotto"]] += v["importo"]

print(agg)`,
      check: `assert agg == {"nord": {"A": 15, "B": 20}, "sud": {"A": 15}}`,
      hint: `<p>Il primo <code>.setdefault</code> assicura che esista un dizionario vuoto per la regione; il secondo assicura che esista il valore 0 per il prodotto DENTRO quel dizionario, pronto per <code>+=</code>.</p>`,
      solution: `vendite = [
    {"regione": "nord", "prodotto": "A", "importo": 10},
    {"regione": "nord", "prodotto": "B", "importo": 20},
    {"regione": "sud", "prodotto": "A", "importo": 15},
    {"regione": "nord", "prodotto": "A", "importo": 5},
]

agg = {}
for v in vendite:
    agg.setdefault(v["regione"], {}).setdefault(v["prodotto"], 0)
    agg[v["regione"]][v["prodotto"]] += v["importo"]

print(agg)`
    },

    {
      type: "exercise", id: "warm-70", kg: 25, title: "Combo: clienti idonei da più criteri",
      task: `<p>Con tre insiemi (clienti attivi, clienti con acquisti recenti, clienti VIP): trova <code>idonei_promo</code> = attivi E (recenti O vip) — combina <code>&amp;</code> e <code>|</code>, con le parentesi giuste.</p>`,
      starter: `attivi = {"Ada", "Bo", "Cin", "Dan"}
recenti = {"Ada", "Cin"}
vip = {"Bo", "Elio"}

idonei_promo = attivi & (recenti | vip)
print(idonei_promo)`,
      check: `assert idonei_promo == {"Ada", "Bo", "Cin"}`,
      hint: `<p>Le parentesi attorno a <code>(recenti | vip)</code> sono obbligatorie: senza, Python valuterebbe l'espressione con un ordine di precedenza diverso da quello inteso.</p>`,
      solution: `attivi = {"Ada", "Bo", "Cin", "Dan"}
recenti = {"Ada", "Cin"}
vip = {"Bo", "Elio"}

idonei_promo = attivi & (recenti | vip)
print(idonei_promo)`
    },

    {
      type: "exercise", id: "warm-71", kg: 25, title: "Combo: posizioni per valore con enumerate",
      task: `<p>Su <code>sequenza</code> (con ripetizioni): costruisci <code>posizioni</code>, un <code>defaultdict(list)</code> che mappa ogni valore distinto a TUTTI gli indici in cui compare.</p>`,
      starter: `from collections import defaultdict

sequenza = ["a", "b", "a", "c", "a", "b"]

posizioni = defaultdict(list)
for i, v in enumerate(sequenza):
    posizioni[v].append(i)

print(dict(posizioni))`,
      check: `assert dict(posizioni) == {"a": [0, 2, 4], "b": [1, 5], "c": [3]}`,
      hint: `<p><code>enumerate</code> dà l'indice, <code>defaultdict(list)</code> raccoglie tutti gli indici per ogni valore senza bisogno di inizializzare le liste a mano.</p>`,
      solution: `from collections import defaultdict

sequenza = ["a", "b", "a", "c", "a", "b"]

posizioni = defaultdict(list)
for i, v in enumerate(sequenza):
    posizioni[v].append(i)

print(dict(posizioni))`
    },

    {
      type: "exercise", id: "warm-72", kg: 25, title: "Combo: massimo progressivo con indice",
      task: `<p>Su <code>valori</code>: costruisci <code>massimi_progressivi</code>, una lista dove ogni posizione è il massimo visto FINO A QUEL PUNTO (incluso).</p>`,
      starter: `valori = [3, 7, 2, 9, 4, 9, 1]

massimi_progressivi = []
massimo_finora = valori[0]
for v in valori:
    massimo_finora = max(massimo_finora, v)
    massimi_progressivi.append(massimo_finora)

print(massimi_progressivi)`,
      check: `assert massimi_progressivi == [3, 7, 7, 9, 9, 9, 9]`,
      hint: `<p>Ogni posizione "ricorda" il massimo di tutto ciò che è venuto prima (se stessa compresa): una volta raggiunto 9 alla quarta posizione, resta il massimo per tutte le successive finché non arriva qualcosa di più grande.</p>`,
      solution: `valori = [3, 7, 2, 9, 4, 9, 1]

massimi_progressivi = []
massimo_finora = valori[0]
for v in valori:
    massimo_finora = max(massimo_finora, v)
    massimi_progressivi.append(massimo_finora)

print(massimi_progressivi)`
    },

    {
      type: "exercise", id: "warm-73", kg: 25, title: "Combo: elabora un batch, non fermarti al primo errore",
      task: `<p>Su <code>richieste</code> (alcune "malformate"): elabora tutte, raccogliendo <code>riusciti</code> e <code>falliti</code> (con il messaggio d'errore), SENZA fermare l'intero batch al primo problema.</p>`,
      starter: `richieste = ["10/2", "5/0", "20/4", "abc/2"]

riusciti = []
falliti = []

for richiesta in richieste:
    try:
        a_testo, b_testo = richiesta.split("/")
        risultato = int(a_testo) / int(b_testo)
        riusciti.append(risultato)
    except (ZeroDivisionError, ValueError) as e:
        falliti.append({"richiesta": richiesta, "errore": str(e)})

print(riusciti)
print(len(falliti))`,
      check: `assert riusciti == [5.0, 5.0]
assert len(falliti) == 2`,
      hint: `<p><code>except (ZeroDivisionError, ValueError) as e:</code> cattura ENTRAMBI i tipi di errore possibili in questo batch (divisione per zero E testo non convertibile) in un solo blocco.</p>`,
      solution: `richieste = ["10/2", "5/0", "20/4", "abc/2"]

riusciti = []
falliti = []

for richiesta in richieste:
    try:
        a_testo, b_testo = richiesta.split("/")
        risultato = int(a_testo) / int(b_testo)
        riusciti.append(risultato)
    except (ZeroDivisionError, ValueError) as e:
        falliti.append({"richiesta": richiesta, "errore": str(e)})

print(riusciti)
print(len(falliti))`
    },

    {
      type: "exercise", id: "warm-74", kg: 25, title: "Massimale: mini-analisi testuale completa",
      task: `<p>Su <code>testo</code> (una frase lunga): tokenizza, conta le parole con più di 3 lettere, trova le 3 più frequenti, e produci <code>report</code> con f-string.</p>`,
      starter: `from collections import Counter

testo = "il gatto nero rincorre il topo grigio mentre il cane nero osserva tutto in silenzio"

parole_lunghe = [p for p in testo.split() if len(p) > 3]
conteggi = Counter(parole_lunghe)
top3 = conteggi.most_common(3)

report = ", ".join(f"{parola} ({n})" for parola, n in top3)

print(top3)
print(report)`,
      check: `assert top3[0] == ("nero", 2)
assert "nero (2)" in report`,
      hint: `<p>"nero" è l'unica parola a comparire due volte tra quelle con più di 3 lettere: deve essere in cima al podio.</p>`,
      solution: `from collections import Counter

testo = "il gatto nero rincorre il topo grigio mentre il cane nero osserva tutto in silenzio"

parole_lunghe = [p for p in testo.split() if len(p) > 3]
conteggi = Counter(parole_lunghe)
top3 = conteggi.most_common(3)

report = ", ".join(f"{parola} ({n})" for parola, n in top3)

print(top3)
print(report)`
    },

    {
      type: "exercise", id: "warm-75", kg: 25, title: "Massimale: classifica con spareggio stabile",
      task: `<p>Su <code>gara</code> (nome, punti, tempo): ordina per punti decrescenti e, a parità di punti, per tempo crescente (chi ci ha messo meno vince lo spareggio) — con una singola tupla chiave.</p>`,
      starter: `gara = [
    {"nome": "Ada", "punti": 90, "tempo": 32.1},
    {"nome": "Bo", "punti": 90, "tempo": 28.5},
    {"nome": "Cin", "punti": 95, "tempo": 40.0},
]

classifica = sorted(gara, key=lambda g: (-g["punti"], g["tempo"]))
print([g["nome"] for g in classifica])`,
      check: `assert [g["nome"] for g in classifica] == ["Cin", "Bo", "Ada"]`,
      hint: `<p><code>-g["punti"]</code> ordina i punti dal più alto (negandoli, il "più piccolo" negativo è il più grande originale); <code>g["tempo"]</code> senza segno resta crescente per lo spareggio.</p>`,
      solution: `gara = [
    {"nome": "Ada", "punti": 90, "tempo": 32.1},
    {"nome": "Bo", "punti": 90, "tempo": 28.5},
    {"nome": "Cin", "punti": 95, "tempo": 40.0},
]

classifica = sorted(gara, key=lambda g: (-g["punti"], g["tempo"]))
print([g["nome"] for g in classifica])`
    },

    {
      type: "exercise", id: "warm-76", kg: 25, title: "Massimale: sincronizza due inventari",
      task: `<p>Hai <code>magazzino_a</code> e <code>magazzino_b</code> (dict prodotto→quantità). Costruisci <code>totale</code>: la somma delle quantità per ogni prodotto presente in ALMENO uno dei due (usa <code>.get</code> per i prodotti mancanti in uno dei due).</p>`,
      starter: `magazzino_a = {"viti": 100, "bulloni": 50}
magazzino_b = {"bulloni": 30, "dadi": 80}

tutti_prodotti = set(magazzino_a) | set(magazzino_b)
totale = {p: magazzino_a.get(p, 0) + magazzino_b.get(p, 0) for p in tutti_prodotti}

print(totale)`,
      check: `assert totale == {"viti": 100, "bulloni": 80, "dadi": 80}`,
      hint: `<p><code>set(dizionario)</code> dà l'insieme delle sue chiavi; l'unione dei due insiemi copre "viti" (solo in A), "dadi" (solo in B), e "bulloni" (in entrambi, da sommare).</p>`,
      solution: `magazzino_a = {"viti": 100, "bulloni": 50}
magazzino_b = {"bulloni": 30, "dadi": 80}

tutti_prodotti = set(magazzino_a) | set(magazzino_b)
totale = {p: magazzino_a.get(p, 0) + magazzino_b.get(p, 0) for p in tutti_prodotti}

print(totale)`
    },

    {
      type: "exercise", id: "warm-77", kg: 25, title: "Massimale: conta i file in cartelle annidate",
      task: `<p>Su <code>struttura</code> (dizionario che rappresenta cartelle annidate: <code>None</code> = file, dizionario = sotto-cartella): scrivi <code>conta_file(struttura)</code> ricorsiva.</p>`,
      starter: `struttura = {
    "a.txt": None,
    "cartella1": {
        "b.txt": None,
        "cartella2": {"c.txt": None, "d.txt": None},
    },
}

def conta_file(struttura):
    totale = 0
    for chiave, valore in struttura.items():
        if valore is None:
            totale += 1
        else:
            totale += conta_file(valore)
    return totale

n_file = conta_file(struttura)
print(n_file)`,
      check: `assert n_file == 4`,
      hint: `<p>La ricorsione "scende" dentro ogni sotto-cartella (un dizionario) esattamente come nell'esercizio sulla struttura annidata di numeri, ma qui il caso base è <code>valore is None</code> invece di "non è una lista".</p>`,
      solution: `struttura = {
    "a.txt": None,
    "cartella1": {
        "b.txt": None,
        "cartella2": {"c.txt": None, "d.txt": None},
    },
}

def conta_file(struttura):
    totale = 0
    for chiave, valore in struttura.items():
        if valore is None:
            totale += 1
        else:
            totale += conta_file(valore)
    return totale

n_file = conta_file(struttura)
print(n_file)`
    },

    {
      type: "exercise", id: "warm-78", kg: 25, title: "Massimale: simulatore di rate limit",
      task: `<p>Simula un limitatore: ogni utente può fare al massimo 3 richieste. Scrivi <code>puo_procedere(utente, contatori)</code> che restituisce <code>True</code>/<code>False</code> e incrementa il contatore SOLO se concede il via libera.</p>`,
      starter: `from collections import defaultdict

contatori = defaultdict(int)

def puo_procedere(utente, contatori, limite=3):
    if contatori[utente] >= limite:
        return False
    contatori[utente] += 1
    return True

risultati = [puo_procedere("Ada", contatori) for _ in range(5)]
print(risultati)
print(dict(contatori))`,
      check: `assert risultati == [True, True, True, False, False]
assert contatori["Ada"] == 3, "Il contatore non deve superare il limite: le richieste rifiutate non incrementano nulla"`,
      hint: `<p>Le prime 3 chiamate passano e incrementano il contatore fino a 3; dalla quarta in poi, <code>contatori[utente] &gt;= limite</code> è già vero, quindi la funzione rifiuta SENZA incrementare oltre.</p>`,
      solution: `from collections import defaultdict

contatori = defaultdict(int)

def puo_procedere(utente, contatori, limite=3):
    if contatori[utente] >= limite:
        return False
    contatori[utente] += 1
    return True

risultati = [puo_procedere("Ada", contatori) for _ in range(5)]
print(risultati)
print(dict(contatori))`
    },

    {
      type: "exercise", id: "warm-79", kg: 25, title: "Massimale finale: log grezzi in report pulito",
      task: `<p>Ultima serie del riscaldamento raddoppiato. Da <code>righe_log</code> (formato "utente|azione|durata", alcune malformate): parsa tutte con gestione errori, aggrega la durata totale per utente, e produci <code>report</code> ordinato per durata decrescente.</p>`,
      starter: `righe_log = ["ada|login|30", "bo|login|20", "ada|shop|45", "rotta|senza_durata", "bo|shop|xx"]

eventi_validi = []
for riga in righe_log:
    try:
        utente, azione, durata_testo = riga.split("|")
        durata = int(durata_testo)
        eventi_validi.append({"utente": utente, "durata": durata})
    except (ValueError,):
        pass

totale_per_utente = {}
for e in eventi_validi:
    totale_per_utente[e["utente"]] = totale_per_utente.get(e["utente"], 0) + e["durata"]

report = sorted(totale_per_utente.items(), key=lambda t: -t[1])

print(eventi_validi)
print(report)`,
      check: `assert len(eventi_validi) == 3, "'rotta|senza_durata' (righe insufficienti per lo split) e 'bo|shop|xx' (durata non numerica) devono essere scartate"
assert report == [("ada", 75), ("bo", 20)]`,
      hint: `<p>"rotta|senza_durata" produce solo 2 pezzi dopo lo <code>split("|")</code>, non 3: lo spacchettamento <code>utente, azione, durata_testo = riga.split("|")</code> fallisce con <code>ValueError</code> (numero sbagliato di valori), catturato dallo stesso <code>except</code> della conversione a intero.</p>`,
      solution: `righe_log = ["ada|login|30", "bo|login|20", "ada|shop|45", "rotta|senza_durata", "bo|shop|xx"]

eventi_validi = []
for riga in righe_log:
    try:
        utente, azione, durata_testo = riga.split("|")
        durata = int(durata_testo)
        eventi_validi.append({"utente": utente, "durata": durata})
    except (ValueError,):
        pass

totale_per_utente = {}
for e in eventi_validi:
    totale_per_utente[e["utente"]] = totale_per_utente.get(e["utente"], 0) + e["durata"]

report = sorted(totale_per_utente.items(), key=lambda t: -t[1])

print(eventi_validi)
print(report)`
    }
  ]
});
