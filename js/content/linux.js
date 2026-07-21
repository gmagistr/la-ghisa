window.MODULES.push({
  id: "linux",
  name: "Linux & Shell",
  tagline: "La sala della riga di comando: grep, find, pipe, permessi, processi. Ricostruiti in Python per capirne la logica.",
  intro: "Ogni data scientist lavora su server Linux: filtrare log, cercare file, comporre comandi con le pipe. Qui non hai un vero terminale (Pyodide non lo espone), ma ricostruisci in Python la logica di grep, find, awk, dei permessi e delle pipe — l'essenziale che i colloqui chiedono.",
  packages: [],
  items: [

    { type: "theory", title: "La filosofia Unix: piccoli strumenti componibili", html: `
<p>La potenza della shell Unix nasce da una filosofia: <strong>tanti strumenti piccoli, ognuno che fa UNA cosa bene, componibili tra loro</strong>. Non un mega-programma che fa tutto, ma <code>grep</code> (filtra righe), <code>sort</code> (ordina), <code>wc</code> (conta), <code>cut</code> (estrae colonne) — che si combinano con le <strong>pipe</strong>.</p>
<pre><code># la pipe | passa l'output di un comando come input al successivo:
cat log.txt | grep ERROR | sort | uniq -c | sort -rn | head
# leggi | filtra errori | ordina | conta unici | riordina | primi 10</code></pre>
<p>Ogni comando legge da stdin, scrive su stdout, e la pipe li concatena. In Python questa logica è una catena di trasformazioni su una lista di righe: filtra, mappa, ordina. Capire la pipe come "flusso di dati che attraversa trasformazioni" è capire il 90% della shell.</p>
`, more: `
<p>I tre <strong>stream standard</strong> sono il fondamento: <code>stdin</code> (input, di default la tastiera), <code>stdout</code> (output normale, di default lo schermo), <code>stderr</code> (errori, separato apposta per non inquinare l'output nella pipe). La pipe <code>|</code> connette lo stdout di un comando allo stdin del successivo; la ridirezione <code>&gt;</code> manda stdout a un file, <code>2&gt;</code> manda stderr, <code>&lt;</code> prende stdin da un file. La separazione stderr/stdout è geniale: <code>comando 2&gt; errori.log | processa</code> lascia passare i dati validi nella pipe mentre gli errori vanno altrove. Molti principianti non sanno perché "l'errore appare comunque a schermo anche con &gt; file.txt" — è perché va su stderr, non stdout.</p>
<p>La composizionalità è ciò che rende la shell un linguaggio di programmazione dei dati: comandi che da soli fanno poco, concatenati, risolvono problemi complessi in una riga. "Trova i 10 IP che hanno fatto più richieste con errore 500 oggi" è una singola pipeline di grep+cut+sort+uniq+sort+head. Questa mentalità — scomporre un problema in trasformazioni successive di un flusso di testo — è esattamente quella dei data pipeline (e non a caso pandas, Spark, i functional stream sono la stessa idea). Chi pensa "a pipeline" in shell pensa a pipeline ovunque.</p>
<p>Il testo come interfaccia universale è l'altra colonna della filosofia Unix: quasi tutto è testo a righe, quindi gli stessi strumenti (grep, sort, awk) funzionano su log, CSV, output di programmi, configurazioni. È meno efficiente di formati binari, ma la UNIVERSALITÀ ripaga: un solo set di strumenti per tutto. I limiti si vedono con dati strutturati complessi (JSON annidato, dove servono strumenti dedicati come <code>jq</code>), ma per l'80% del lavoro quotidiano su server — ispezionare log, filtrare, contare, trasformare — la pipeline di testo resta imbattibile per velocità di scrittura. In questa sala la ricostruisci in Python, dove una pipeline è letteralmente una catena di list comprehension e funzioni.</p>
` },

    {
      type: "exercise", id: "li-01", kg: 5, title: "La pipe come catena di trasformazioni",
      task: `<p>Simula la pipeline <code>cat | grep ERROR | wc -l</code> (conta le righe di errore) come trasformazioni Python su una lista di righe:</p>
<ul>
<li><code>righe_errore</code>: le righe che contengono "ERROR" (come <code>grep ERROR</code>)</li>
<li><code>conteggio</code>: quante sono (come <code>wc -l</code>)</li>
<li><code>prima_riga_errore</code>: la prima riga di errore trovata</li>
</ul>`,
      setup: `log = [
    "INFO avvio sistema",
    "ERROR connessione fallita",
    "INFO caricamento dati",
    "ERROR timeout database",
    "WARNING memoria alta",
    "ERROR disco pieno",
]`,
      starter: `# log: lista di righe (come le righe di un file)

righe_errore = [r for r in log if "ERROR" in r]   # grep ERROR
conteggio = ...                                     # wc -l
prima_riga_errore = ...

print("righe di errore:", righe_errore)
print("conteggio:", conteggio)`,
      check: `assert righe_errore == ["ERROR connessione fallita", "ERROR timeout database", "ERROR disco pieno"], "righe_errore: le righe con 'ERROR'"
assert conteggio == 3, "conteggio: len(righe_errore) = 3"
assert prima_riga_errore == "ERROR connessione fallita", "prima_riga_errore: righe_errore[0]"`,
      hint: `<p>La pipe in Python è una catena: prima filtri (grep = list comprehension con <code>if</code>), poi conti (wc -l = <code>len</code>). <code>conteggio = len(righe_errore)</code>.</p>`,
      solution: `righe_errore = [r for r in log if "ERROR" in r]
conteggio = len(righe_errore)
prima_riga_errore = righe_errore[0]

print("righe di errore:", righe_errore)
print("conteggio:", conteggio)`
    },

    { type: "theory", title: "grep: filtrare per pattern", html: `
<p><code>grep</code> è lo strumento più usato: stampa le righe che contengono un pattern. Con le <strong>regex</strong> (espressioni regolari) diventa potentissimo.</p>
<pre><code>grep ERROR log.txt           # righe con "ERROR"
grep -i error log.txt        # -i: ignora maiuscole/minuscole
grep -v INFO log.txt         # -v: INVERTE, righe SENZA "INFO"
grep -c ERROR log.txt        # -c: conta invece di stampare
grep -E "ERROR|WARN" log.txt # -E: regex estesa (OR)</code></pre>
<p>In Python, <code>grep</code> è un filtro con <code>in</code> (match semplice) o con il modulo <code>re</code> (regex). Le opzioni corrispondono a varianti del filtro: <code>-i</code> è confronto in minuscolo, <code>-v</code> è la condizione negata, <code>-c</code> è un conteggio.</p>
`, more: `
<p>Le <strong>regex</strong> sono il vero superpotere di grep e uno strumento trasversale (Python <code>re</code>, JavaScript, editor, quasi ogni linguaggio). I mattoni essenziali: <code>.</code> (qualsiasi carattere), <code>*</code> (zero o più del precedente), <code>+</code> (uno o più), <code>?</code> (zero o uno), <code>[abc]</code> (uno tra a,b,c), <code>[0-9]</code> (una cifra), <code>^</code> (inizio riga), <code>$</code> (fine riga), <code>\\d</code> (cifra), <code>\\w</code> (carattere di parola). "Trova righe che iniziano con una data" diventa <code>^\\d{4}-\\d{2}-\\d{2}</code>. Le regex compaiono in ogni colloquio tecnico e in ogni pipeline di parsing di log — vale la pena padroneggiarle.</p>
<p>La distinzione tra le famiglie di grep confonde: <code>grep</code> base usa regex "BRE" (basic, dove <code>+</code> e <code>?</code> vanno escapati); <code>grep -E</code> (o <code>egrep</code>) usa regex "ERE" (extended, sintassi moderna); <code>grep -P</code> usa regex Perl (le più potenti, con lookahead ecc.). Nella pratica si usa quasi sempre <code>-E</code> o <code>-P</code> per avere la sintassi che ci si aspetta. In Python il modulo <code>re</code> usa una sintassi vicina a quella Perl, quindi ciò che impari in Python trasferisce a <code>grep -P</code>.</p>
<p>Opzioni di grep che salvano tempo nel lavoro reale su server: <code>-r</code> (ricorsivo, cerca in tutti i file di una cartella e sottocartelle — "dove è definita questa funzione?"), <code>-n</code> (mostra il numero di riga), <code>-l</code> (mostra solo i NOMI dei file che contengono il pattern, non le righe), <code>-A 3</code>/<code>-B 3</code>/<code>-C 3</code> (mostra 3 righe After/Before/Context attorno al match — cruciale per vedere il contesto di un errore nei log). La combinazione <code>grep -rn "TODO" .</code> per trovare tutti i TODO nel progetto, o <code>grep -C 5 "Exception" app.log</code> per vedere cosa circonda un'eccezione, sono nel repertorio quotidiano di chiunque lavori su server.</p>
` },

    {
      type: "exercise", id: "li-02", kg: 10, title: "grep con le sue opzioni",
      task: `<p>Implementa <code>grep</code> con le opzioni <code>-i</code> (case-insensitive) e <code>-v</code> (invertito):</p>
<ul>
<li><code>grep_semplice</code>: righe che contengono "error" (case-sensitive)</li>
<li><code>grep_i</code>: righe che contengono "error" ignorando le maiuscole (<code>-i</code>) — deve trovare anche "ERROR" e "Error"</li>
<li><code>grep_v</code>: righe che NON contengono "INFO" (<code>-v INFO</code>)</li>
<li><code>conteggio_i</code>: quante righe trova <code>grep -i</code></li>
</ul>`,
      setup: `log = ["INFO ok", "ERROR grave", "error minore", "Error medio", "INFO fine", "WARN attento"]`,
      starter: `# log: righe con "error" in varie forme

grep_semplice = [r for r in log if "error" in r]
grep_i = ...   # -i: usa .lower() per ignorare le maiuscole
grep_v = ...   # -v INFO: righe SENZA "INFO"
conteggio_i = len(grep_i)

print("grep 'error':", grep_semplice)
print("grep -i 'error':", grep_i)
print("grep -v 'INFO':", grep_v)`,
      check: `assert grep_semplice == ["error minore"], "grep_semplice: solo 'error' minuscolo -> 1 riga"
assert grep_i == ["ERROR grave", "error minore", "Error medio"], "grep_i: -i trova ERROR, error, Error -> 3 righe (usa r.lower())"
assert grep_v == ["ERROR grave", "error minore", "Error medio", "WARN attento"], "grep_v: righe senza 'INFO'"
assert conteggio_i == 3, "conteggio_i: 3"`,
      hint: `<p>Per <code>-i</code>: confronta in minuscolo, <code>"error" in r.lower()</code>. Per <code>-v</code>: nega la condizione, <code>"INFO" not in r</code>.</p>`,
      solution: `grep_semplice = [r for r in log if "error" in r]
grep_i = [r for r in log if "error" in r.lower()]
grep_v = [r for r in log if "INFO" not in r]
conteggio_i = len(grep_i)

print("grep 'error':", grep_semplice)
print("grep -i 'error':", grep_i)
print("grep -v 'INFO':", grep_v)`
    },

    {
      type: "exercise", id: "li-03", kg: 15, title: "grep con le regex",
      task: `<p>Usa il modulo <code>re</code> per grep con pattern avanzati, come <code>grep -E</code>:</p>
<ul>
<li><code>righe_data</code>: le righe che INIZIANO con una data formato <code>AAAA-MM-GG</code> (regex <code>^\\d{4}-\\d{2}-\\d{2}</code>)</li>
<li><code>righe_errore_o_warn</code>: righe che contengono "ERROR" O "WARN" (regex <code>ERROR|WARN</code>)</li>
<li><code>n_con_data</code>: quante righe iniziano con una data</li>
</ul>`,
      setup: `log = [
    "2026-07-21 ERROR crash",
    "manca la data WARN qui",
    "2026-07-22 INFO tutto ok",
    "2026-07-23 WARN memoria",
    "riga senza niente",
]`,
      starter: `import re
# log: alcune righe iniziano con una data, altre no

righe_data = [r for r in log if re.match(r"\\d{4}-\\d{2}-\\d{2}", r)]
righe_errore_o_warn = [r for r in log if re.search(r"ERROR|WARN", r)]
n_con_data = ...

print("righe con data:", righe_data)
print("righe ERROR o WARN:", righe_errore_o_warn)`,
      check: `import re
_rd = [r for r in log if re.match(r"\\d{4}-\\d{2}-\\d{2}", r)]
_re = [r for r in log if re.search(r"ERROR|WARN", r)]
assert righe_data == _rd and len(_rd) == 3, "righe_data: 3 righe iniziano con una data (re.match)"
assert righe_errore_o_warn == _re, "righe_errore_o_warn: re.search con 'ERROR|WARN'"
assert n_con_data == 3, "n_con_data: len(righe_data) = 3"`,
      hint: `<p><code>re.match</code> verifica l'INIZIO della stringa (come <code>^</code>), <code>re.search</code> cerca ovunque. Il pattern <code>ERROR|WARN</code> è l'OR delle regex. <code>n_con_data = len(righe_data)</code>.</p>`,
      solution: `import re

righe_data = [r for r in log if re.match(r"\\d{4}-\\d{2}-\\d{2}", r)]
righe_errore_o_warn = [r for r in log if re.search(r"ERROR|WARN", r)]
n_con_data = len(righe_data)

print("righe con data:", righe_data)
print("righe ERROR o WARN:", righe_errore_o_warn)`
    },

    { type: "theory", title: "Pipe complesse: sort, uniq, cut", html: `
<p>La vera potenza emerge combinando strumenti. Un'analisi tipica di log:</p>
<pre><code>cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head -5
# estrai IP | ordina | conta unici | riordina per conteggio | top 5</code></pre>
<ul>
<li><code>cut -d' ' -f1</code>: taglia la 1ª colonna, separatore spazio (come <code>riga.split(" ")[0]</code>);</li>
<li><code>sort</code>: ordina (necessario prima di uniq);</li>
<li><code>uniq -c</code>: conta le occorrenze consecutive (come <code>Counter</code>);</li>
<li><code>sort -rn</code>: ordina numerico decrescente;</li>
<li><code>head -5</code>: primi 5.</li>
</ul>
<p>In Python questa pipeline è: <code>Counter</code> per contare, <code>most_common</code> per il "top N". Un idioma che risolve tantissime domande da colloquio ("trova i 5 IP più attivi", "le parole più frequenti").</p>
`, more: `
<p>La sottigliezza di <code>uniq</code> che confonde e che i colloqui sfruttano: <code>uniq</code> rimuove/conta solo i duplicati CONSECUTIVI, non tutti i duplicati nel file. Per questo si mette SEMPRE <code>sort | uniq</code> insieme — sort raggruppa gli elementi uguali, poi uniq li collassa. <code>uniq</code> da solo su dati non ordinati dà risultati sbagliati. È il motivo per cui la pipeline canonica è sempre <code>... | sort | uniq -c | ...</code>. In Python <code>collections.Counter</code> fa entrambe le cose (conta senza bisogno di ordinare prima), rendendo esplicito che uniq è solo un modo di contare.</p>
<p><code>cut</code> vs <code>awk</code> per estrarre colonne: <code>cut</code> è semplice (taglia per posizione o delimitatore fisso) ma fragile con separatori multipli o variabili; <code>awk</code> è un mini-linguaggio che gestisce campi in modo robusto (<code>awk '{print $1}'</code> stampa il primo campo, splittando su spazi multipli automaticamente) e permette logica (<code>awk '$3 &gt; 100 {print $1}'</code> = "stampa il campo 1 delle righe dove il campo 3 supera 100"). Per estrazioni semplici cut basta; quando servono condizioni o campi separati da spazi irregolari, awk vince. In Python entrambi sono <code>riga.split()</code> più eventuale logica.</p>
<p>Questo idioma "conta e ordina per frequenza" (<code>sort | uniq -c | sort -rn</code>, o <code>Counter().most_common()</code> in Python) è forse il pattern di analisi dati più universale che esista: le parole più frequenti in un testo, gli IP più attivi in un log, gli errori più comuni, i prodotti più venduti, gli endpoint più chiamati. È la stessa operazione di un <code>GROUP BY ... COUNT ... ORDER BY count DESC</code> in SQL (sala SQL) e di un <code>value_counts()</code> in pandas. Riconoscere che shell, SQL e pandas esprimono lo STESSO concetto con sintassi diverse è ciò che rende un data scientist fluente nel passare da uno strumento all'altro a seconda di dove vivono i dati.</p>
` },

    {
      type: "exercise", id: "li-04", kg: 15, title: "I 3 IP più attivi",
      task: `<p>Ricostruisci la pipeline <code>cut -f1 | sort | uniq -c | sort -rn | head -3</code> per trovare i 3 IP più attivi in un access log:</p>
<ul>
<li><code>ip</code>: la prima "colonna" (l'IP) di ogni riga, separatore spazio (come <code>cut -d' ' -f1</code>)</li>
<li><code>conteggi</code>: un <code>Counter</code> degli IP</li>
<li><code>top3</code>: i 3 IP più frequenti con il loro conteggio (<code>most_common(3)</code>)</li>
<li><code>ip_piu_attivo</code>: l'IP in cima</li>
</ul>`,
      setup: `access = [
    "10.0.0.1 GET /home",
    "10.0.0.2 GET /login",
    "10.0.0.1 POST /data",
    "10.0.0.1 GET /home",
    "10.0.0.3 GET /api",
    "10.0.0.2 GET /home",
    "10.0.0.1 GET /api",
]`,
      starter: `from collections import Counter
# access: righe "IP METODO PERCORSO"

ip = [riga.split(" ")[0] for riga in access]   # cut -d' ' -f1
conteggi = ...                                   # sort | uniq -c
top3 = ...                                        # sort -rn | head -3
ip_piu_attivo = top3[0][0]

print("conteggi:", conteggi)
print("top 3:", top3)`,
      check: `from collections import Counter
_ip = [r.split(" ")[0] for r in access]
_c = Counter(_ip)
assert ip == _ip, "ip: riga.split(' ')[0] per ogni riga"
assert conteggi == _c, "conteggi: Counter(ip)"
assert top3 == _c.most_common(3), "top3: conteggi.most_common(3)"
assert ip_piu_attivo == "10.0.0.1", "ip_piu_attivo: 10.0.0.1 (4 richieste)"`,
      hint: `<p><code>Counter(ip)</code> conta (sort+uniq -c in un colpo), <code>.most_common(3)</code> dà i top 3 ordinati (sort -rn | head -3). L'IP in cima: <code>top3[0][0]</code>.</p>`,
      solution: `from collections import Counter

ip = [riga.split(" ")[0] for riga in access]
conteggi = Counter(ip)
top3 = conteggi.most_common(3)
ip_piu_attivo = top3[0][0]

print("conteggi:", conteggi)
print("top 3:", top3)`
    },

    {
      type: "exercise", id: "li-05", kg: 15, title: "awk: colonne con condizione",
      task: `<p>Simula <code>awk '$3 > 100 {print $1}'</code> — stampa la prima colonna delle righe dove la terza supera 100:</p>
<ul>
<li>ogni riga è "nome categoria valore" (3 campi separati da spazio)</li>
<li><code>nomi_sopra_100</code>: i nomi (campo 1) delle righe dove il valore (campo 3, da convertire a int) supera 100</li>
<li><code>somma_valori</code>: la somma di tutti i valori (campo 3), come <code>awk '{s+=$3} END {print s}'</code></li>
</ul>`,
      setup: `dati = [
    "mele frutta 150",
    "pane forno 80",
    "vino cantina 200",
    "latte frigo 50",
    "carne banco 120",
]`,
      starter: `# dati: righe "nome categoria valore"

nomi_sopra_100 = [riga.split()[0] for riga in dati if int(riga.split()[2]) > 100]
somma_valori = ...   # somma del campo 3 di tutte le righe

print("nomi con valore > 100:", nomi_sopra_100)
print("somma valori:", somma_valori)`,
      check: `_ns = [r.split()[0] for r in dati if int(r.split()[2]) > 100]
_sv = sum(int(r.split()[2]) for r in dati)
assert nomi_sopra_100 == _ns == ["mele", "vino", "carne"], "nomi_sopra_100: mele(150), vino(200), carne(120)"
assert somma_valori == _sv == 600, "somma_valori: 150+80+200+50+120 = 600"`,
      hint: `<p><code>riga.split()</code> divide sui campi. Il campo 3 (indice 2) va convertito con <code>int()</code>. La somma: <code>sum(int(r.split()[2]) for r in dati)</code>.</p>`,
      solution: `nomi_sopra_100 = [riga.split()[0] for riga in dati if int(riga.split()[2]) > 100]
somma_valori = sum(int(riga.split()[2]) for riga in dati)

print("nomi con valore > 100:", nomi_sopra_100)
print("somma valori:", somma_valori)`
    },

    { type: "theory", title: "find: cercare file", html: `
<p><code>find</code> cerca file e cartelle nell'albero del filesystem, con filtri per nome, tipo, dimensione, data. È lo strumento per "dov'è quel file?" e per operazioni di massa.</p>
<pre><code>find . -name "*.py"              # tutti i .py da qui in giù
find . -type f -size +1M         # file (non cartelle) più grandi di 1MB
find . -name "*.log" -mtime +7   # log modificati più di 7 giorni fa
find . -name "*.tmp" -delete     # trova ed elimina i .tmp</code></pre>
<p>In Python la logica di <code>find</code> è <code>os.walk</code> (o <code>pathlib.Path.rglob</code>): scendi ricorsivamente nell'albero e filtra i percorsi per estensione, dimensione, tipo. La ricorsione nell'albero delle cartelle è il cuore — <code>find</code> visita ogni nodo e applica i test.</p>
`, more: `
<p>La forza di <code>find</code> è combinare filtri E azioni. I filtri (<code>-name</code>, <code>-type f</code>/<code>-type d</code>, <code>-size</code>, <code>-mtime</code>/<code>-mmin</code> per età, <code>-user</code>) si accumulano in AND. L'azione più potente è <code>-exec</code>, che esegue un comando su ogni file trovato: <code>find . -name "*.jpg" -exec convert {} {}.png \\;</code> converte tutte le immagini, dove <code>{}</code> è sostituito dal nome del file. Questo trasforma find da "cerca" a "cerca e agisci in massa" — rinominare, comprimere, spostare, cancellare centinaia di file con una riga. È anche dove si fanno danni: <code>find . -name "*.tmp" -delete</code> è comodo, ma un pattern sbagliato cancella cose importanti. Provare sempre PRIMA senza <code>-delete</code>/<code>-exec</code> per vedere cosa matcha.</p>
<p>La combinazione <code>find ... | xargs ...</code> è un idioma da conoscere: <code>xargs</code> prende l'elenco di file da find e li passa come argomenti a un altro comando, spesso più efficiente di <code>-exec</code> (raggruppa i file in poche invocazioni invece di una per file). <code>find . -name "*.log" | xargs grep ERROR</code> cerca ERROR in tutti i log trovati. Attenzione ai nomi di file con spazi, che rompono xargs — si usa <code>find -print0 | xargs -0</code> per gestirli. È il tipo di dettaglio che distingue chi ha davvero lavorato su server da chi ha letto un tutorial.</p>
<p>In Python moderno, <code>pathlib</code> rende la logica di find elegante: <code>Path(".").rglob("*.py")</code> trova ricorsivamente tutti i .py, <code>p.stat().st_size</code> dà la dimensione, <code>p.is_file()</code>/<code>p.is_dir()</code> il tipo, <code>p.stat().st_mtime</code> la data di modifica. Concettualmente è lo stesso: attraversare l'albero e filtrare per attributi. Che tu usi <code>find</code> su un server, <code>os.walk</code> in uno script, o <code>Path.rglob</code> in codice moderno, l'operazione è identica — visita ricorsiva con predicati. In questa sala la ricostruisci su un mini-filesystem rappresentato come dizionario.</p>
` },

    {
      type: "exercise", id: "li-06", kg: 15, title: "find per estensione e dimensione",
      task: `<p>Simula <code>find</code> su un mini-filesystem (lista di file con nome e dimensione). Filtra come farebbe find:</p>
<ul>
<li><code>file_py</code>: i nomi dei file che finiscono con ".py" (come <code>find -name "*.py"</code>)</li>
<li><code>file_grandi</code>: i nomi dei file più grandi di 1000 byte (come <code>find -size +1000c</code>)</li>
<li><code>log_grandi</code>: i file che sono ".log" E più grandi di 500 byte (filtri in AND)</li>
</ul>`,
      setup: `filesystem = [
    {"nome": "app.py", "size": 2400},
    {"nome": "config.yaml", "size": 300},
    {"nome": "error.log", "size": 1500},
    {"nome": "test.py", "size": 800},
    {"nome": "debug.log", "size": 200},
    {"nome": "data.csv", "size": 5000},
]`,
      starter: `# filesystem: lista di {nome, size}

file_py = [f["nome"] for f in filesystem if f["nome"].endswith(".py")]
file_grandi = ...   # size > 1000
log_grandi = ...     # .log AND size > 500

print("file .py:", file_py)
print("file > 1000 byte:", file_grandi)
print("log grandi:", log_grandi)`,
      check: `assert file_py == ["app.py", "test.py"], "file_py: i .py"
assert file_grandi == ["app.py", "error.log", "data.csv"], "file_grandi: size > 1000"
assert log_grandi == ["error.log"], "log_grandi: .log AND size > 500 -> solo error.log (debug.log e' troppo piccolo)"`,
      hint: `<p>Combina i filtri in AND: <code>[f["nome"] for f in filesystem if f["nome"].endswith(".log") and f["size"] &gt; 500]</code>. È così che find accumula condizioni.</p>`,
      solution: `file_py = [f["nome"] for f in filesystem if f["nome"].endswith(".py")]
file_grandi = [f["nome"] for f in filesystem if f["size"] > 1000]
log_grandi = [f["nome"] for f in filesystem if f["nome"].endswith(".log") and f["size"] > 500]

print("file .py:", file_py)
print("file > 1000 byte:", file_grandi)
print("log grandi:", log_grandi)`
    },

    {
      type: "exercise", id: "li-07", kg: 20, title: "find ricorsivo nell'albero",
      task: `<p>Il vero <code>find</code> scende ricorsivamente nelle cartelle. Simula un filesystem ad albero (dizionari annidati) e trova tutti i file .py a qualsiasi profondità:</p>
<ul>
<li><code>trova_py</code>: funzione ricorsiva che raccoglie tutti i percorsi dei file .py (fornita)</li>
<li><code>tutti_py</code>: la lista di tutti i file .py nell'albero</li>
<li><code>n_py</code>: quanti file .py in totale</li>
<li><code>trova_in_sottocartelle</code>: <code>True</code> se ne ha trovati anche in sottocartelle (non solo alla radice)</li>
</ul>`,
      setup: `# albero: cartella -> {file: ..., sottocartelle: {...}}
fs = {
    "app.py": "file",
    "utils.py": "file",
    "readme.md": "file",
    "src": {
        "main.py": "file",
        "helpers.py": "file",
        "tests": {
            "test_main.py": "file",
        },
    },
}`,
      starter: `def trova_py(albero, prefisso=""):
    risultati = []
    for nome, contenuto in albero.items():
        percorso = prefisso + "/" + nome if prefisso else nome
        if contenuto == "file":
            if nome.endswith(".py"):
                risultati.append(percorso)
        else:
            # e' una sottocartella: scendi ricorsivamente
            risultati.extend(trova_py(contenuto, percorso))
    return risultati

tutti_py = trova_py(fs)
n_py = ...
trova_in_sottocartelle = ...

print("file .py trovati:", tutti_py)
print("totale:", n_py)`,
      check: `def _tp(a, p=""):
    r=[]
    for n,c in a.items():
        pc = p+"/"+n if p else n
        if c=="file":
            if n.endswith(".py"): r.append(pc)
        else: r.extend(_tp(c, pc))
    return r
_all = _tp(fs)
assert set(tutti_py) == set(_all) and len(_all) == 5, "tutti_py: 5 file .py (app, utils, src/main, src/helpers, src/tests/test_main)"
assert n_py == 5, "n_py: 5"
assert trova_in_sottocartelle == True, "trova_in_sottocartelle: True — ne trova in src/ e src/tests/, non solo alla radice"`,
      hint: `<p>La funzione ricorsiva è già scritta: chiamala con <code>trova_py(fs)</code>. <code>n_py = len(tutti_py)</code>. Per l'ultimo: <code>trova_in_sottocartelle = any("/" in p for p in tutti_py)</code> (i percorsi con "/" sono in sottocartelle).</p>`,
      solution: `def trova_py(albero, prefisso=""):
    risultati = []
    for nome, contenuto in albero.items():
        percorso = prefisso + "/" + nome if prefisso else nome
        if contenuto == "file":
            if nome.endswith(".py"):
                risultati.append(percorso)
        else:
            risultati.extend(trova_py(contenuto, percorso))
    return risultati

tutti_py = trova_py(fs)
n_py = len(tutti_py)
trova_in_sottocartelle = any("/" in p for p in tutti_py)

print("file .py trovati:", tutti_py)
print("totale:", n_py)`
    },

    { type: "theory", title: "Permessi dei file", html: `
<p>Ogni file Unix ha <strong>permessi</strong> per tre categorie di utenti: <em>owner</em> (proprietario), <em>group</em> (gruppo), <em>others</em> (tutti gli altri). E tre tipi di permesso: <strong>r</strong>ead (4), <strong>w</strong>rite (2), e<strong>x</strong>ecute (1).</p>
<pre><code>chmod 755 script.sh    # rwx per owner, r-x per group e others
chmod 644 dati.txt     # rw- per owner, r-- per group e others
ls -l                  # mostra i permessi: -rwxr-xr-x</code></pre>
<p>Il numero ottale codifica i permessi: ogni cifra è la somma di r(4)+w(2)+x(1) per una categoria. <strong>755</strong> = 7 (rwx=4+2+1) per owner, 5 (r-x=4+1) per group, 5 per others. <strong>644</strong> = 6 (rw-) owner, 4 (r--) group e others. È il sistema che protegge i file su ogni server.</p>
`, more: `
<p>La lettura di <code>ls -l</code> merita decodifica perché è onnipresente: <code>-rwxr-xr-x</code> — il primo carattere è il TIPO (<code>-</code> file, <code>d</code> directory, <code>l</code> link simbolico), poi tre terzine rwx per owner/group/others. <code>-rw-r--r--</code> (644) è un file dati tipico: il proprietario legge e scrive, tutti gli altri solo leggono. <code>drwxr-xr-x</code> (755) è una cartella tipica. Sui file eseguibili e sugli script serve il bit <code>x</code> (altrimenti "Permission denied" anche se il contenuto è giusto) — l'errore numero uno dei principianti che scrivono uno script e non capiscono perché non parte.</p>
<p>Il permesso <code>x</code> ha significati diversi per file e cartelle, cosa che confonde: su un FILE significa "eseguibile" (puoi lanciarlo); su una CARTELLA significa "attraversabile" (puoi entrarci con cd e accedere ai file dentro, se conosci i nomi). Una cartella con <code>r</code> ma senza <code>x</code> ti fa vedere l'elenco dei nomi ma non accedere ai file; una con <code>x</code> ma senza <code>r</code> ti fa accedere ai file di cui conosci il nome ma non elencarli. Questa distinzione è alla base di certi schemi di sicurezza (cartelle "attraversabili ma non elencabili").</p>
<p>Concetti collegati che i colloqui su ruoli DevOps/infra toccano: <code>chown</code> cambia il proprietario, <code>chgrp</code> il gruppo; <code>sudo</code> esegue come superutente (root, che ignora i permessi — da qui il pericolo); il <code>umask</code> definisce i permessi di default dei nuovi file. E il principio del <strong>minimo privilegio</strong>: dare a ogni file/processo solo i permessi strettamente necessari. Il classico anti-pattern <code>chmod 777</code> (rwx per tutti) "per far funzionare le cose" è un buco di sicurezza — chiunque può modificare o eseguire quel file. In contesti reali (specie con dati sensibili) i permessi sono la prima linea di difesa, e capire la codifica ottale è competenza di base per chiunque gestisca server.</p>
` },

    {
      type: "exercise", id: "li-08", kg: 15, title: "Decodificare chmod",
      task: `<p>Converti tra permessi ottali e la notazione rwx. Implementa la decodifica di una cifra ottale:</p>
<ul>
<li><code>decodifica</code>: funzione che data una cifra (0-7) restituisce la stringa rwx (es. 7&rarr;"rwx", 5&rarr;"r-x", 4&rarr;"r--") — fornita</li>
<li><code>perm_755</code>: la stringa completa dei permessi 755 (owner+group+others, es. "rwxr-xr-x")</li>
<li><code>perm_644</code>: la stringa dei permessi 644</li>
<li><code>owner_puo_eseguire_755</code>: <code>True</code> se in 755 l'owner ha il permesso di esecuzione</li>
</ul>`,
      starter: `def decodifica(cifra):
    r = "r" if cifra & 4 else "-"
    w = "w" if cifra & 2 else "-"
    x = "x" if cifra & 1 else "-"
    return r + w + x

def perm_completo(ottale):
    return "".join(decodifica(int(c)) for c in str(ottale))

perm_755 = perm_completo(755)
perm_644 = ...
owner_puo_eseguire_755 = ...   # nel 755, l'owner (prima terzina) ha la x?

print("755 ->", perm_755)
print("644 ->", perm_644)`,
      check: `def _d(c):
    return ("r" if c&4 else "-")+("w" if c&2 else "-")+("x" if c&1 else "-")
def _pc(o): return "".join(_d(int(c)) for c in str(o))
assert perm_755 == "rwxr-xr-x", "perm_755: rwx (owner) r-x (group) r-x (others)"
assert perm_644 == "rw-r--r--", "perm_644: rw- r-- r--"
assert owner_puo_eseguire_755 == True, "owner_puo_eseguire_755: True — la prima terzina di 755 e' 'rwx', contiene x"`,
      hint: `<p>Le funzioni sono fornite: <code>perm_644 = perm_completo(644)</code>. Per l'ultimo: guarda se la prima terzina di <code>perm_755</code> contiene "x", cioè <code>"x" in perm_755[:3]</code>.</p>`,
      solution: `def decodifica(cifra):
    r = "r" if cifra & 4 else "-"
    w = "w" if cifra & 2 else "-"
    x = "x" if cifra & 1 else "-"
    return r + w + x

def perm_completo(ottale):
    return "".join(decodifica(int(c)) for c in str(ottale))

perm_755 = perm_completo(755)
perm_644 = perm_completo(644)
owner_puo_eseguire_755 = "x" in perm_755[:3]

print("755 ->", perm_755)
print("644 ->", perm_644)`
    },

    { type: "theory", title: "Processi: ps, top, kill", html: `
<p>Su Linux ogni programma in esecuzione è un <strong>processo</strong>, con un identificatore unico (<strong>PID</strong>). Gli strumenti per gestirli:</p>
<pre><code>ps aux              # elenca tutti i processi (con CPU, memoria, comando)
top                 # monitor interattivo in tempo reale (CPU/RAM live)
kill 1234           # invia SIGTERM al processo 1234 (chiedi di terminare)
kill -9 1234        # SIGKILL: termina forzatamente (non ignorabile)
ps aux | grep python  # trova i processi python</code></pre>
<p>La distinzione chiave: <code>kill</code> (SIGTERM, 15) chiede gentilmente al processo di chiudersi, permettendogli di salvare e pulire; <code>kill -9</code> (SIGKILL) lo termina brutalmente, senza possibilità di reagire — da usare solo quando SIGTERM non basta. In Python, la logica di "trova e gestisci processi" è filtrare una lista di dizionari (PID, comando, CPU, memoria).</p>
`, more: `
<p>I <strong>segnali</strong> Unix sono il meccanismo di comunicazione coi processi, e la differenza tra SIGTERM e SIGKILL è una domanda da colloquio classica. <code>SIGTERM</code> (15, il default di <code>kill</code>) è educato: il processo lo RICEVE e può gestirlo — salvare lo stato, chiudere connessioni, cancellare file temporanei, poi uscire pulito. <code>SIGKILL</code> (9) è brutale: il kernel termina il processo IMMEDIATAMENTE, il processo non lo vede nemmeno arrivare, nessuna pulizia possibile — rischio di dati corrotti, file lasciati a metà, lock non rilasciati. La regola: prova sempre <code>kill</code> (SIGTERM) prima; usa <code>kill -9</code> solo se il processo è bloccato e ignora SIGTERM. Altri segnali utili: <code>SIGHUP</code> (1, spesso "ricarica la configurazione"), <code>SIGINT</code> (2, quello di Ctrl+C).</p>
<p>Leggere <code>ps aux</code> è competenza quotidiana su server: le colonne chiave sono PID (identificatore), %CPU e %MEM (uso di risorse — per trovare chi consuma), STAT (stato: R running, S sleeping, Z zombie, D uninterruptible), e COMMAND (cosa è). I processi <strong>zombie</strong> (Z) sono un classico: processi finiti ma il cui genitore non ha ancora "raccolto" il codice di uscita — innocui in piccole quantità ma sintomo di bug se si accumulano. <code>top</code> (o il più moderno <code>htop</code>) dà la stessa informazione in tempo reale e ordinabile, per rispondere dal vivo a "il server è lento, chi sta mangiando la CPU?".</p>
<p>La gerarchia dei processi è un albero: ogni processo ha un genitore (PPID), e tutto discende da <code>init</code>/<code>systemd</code> (PID 1). Questo importa per capire cosa succede quando uccidi un processo con figli, per il concetto di processi "orfani" (adottati da init quando il genitore muore), e per i container (sala Docker): dentro un container, il processo principale è PID 1, e se muore il container si ferma — motivo per cui la gestione dei segnali nel processo principale di un container è cruciale per spegnimenti puliti. Il collegamento shell → processi → container mostra che questi concetti Linux di base sono il fondamento su cui poggia tutta l'infrastruttura moderna.</p>
` },

    {
      type: "exercise", id: "li-09", kg: 15, title: "Trovare e gestire processi",
      task: `<p>Simula <code>ps aux | grep</code> e la logica di <code>kill</code> su una lista di processi:</p>
<ul>
<li><code>processi_python</code>: i processi il cui comando contiene "python" (come <code>ps aux | grep python</code>)</li>
<li><code>pid_piu_cpu</code>: il PID del processo che usa più CPU</li>
<li><code>da_terminare</code>: i PID dei processi con CPU &gt; 80 (candidati al kill perché fuori controllo)</li>
<li><code>sigterm_prima</code>: <code>True</code> se la buona pratica è provare SIGTERM (kill) prima di SIGKILL (kill -9)</li>
</ul>`,
      setup: `processi = [
    {"pid": 101, "cpu": 95.0, "cmd": "python train.py"},
    {"pid": 102, "cpu": 2.0, "cmd": "nginx"},
    {"pid": 103, "cpu": 88.0, "cmd": "python serve.py"},
    {"pid": 104, "cpu": 15.0, "cmd": "postgres"},
    {"pid": 105, "cpu": 1.0, "cmd": "python idle.py"},
]`,
      starter: `# processi: lista di {pid, cpu, cmd}

processi_python = [p for p in processi if "python" in p["cmd"]]
pid_piu_cpu = max(processi, key=lambda p: p["cpu"])["pid"]
da_terminare = ...   # PID con cpu > 80
sigterm_prima = ...

print("processi python:", [p["pid"] for p in processi_python])
print("PID che usa piu' CPU:", pid_piu_cpu)
print("da terminare (cpu>80):", da_terminare)`,
      check: `_pp = [p for p in processi if "python" in p["cmd"]]
_dt = [p["pid"] for p in processi if p["cpu"] > 80]
assert [p["pid"] for p in processi_python] == [101, 103, 105], "processi_python: i 3 con 'python' nel cmd"
assert pid_piu_cpu == 101, "pid_piu_cpu: 101 (95% CPU)"
assert da_terminare == _dt == [101, 103], "da_terminare: PID con cpu > 80 (101 e 103)"
assert sigterm_prima == True, "sigterm_prima: True — sempre kill (SIGTERM) prima di kill -9 (SIGKILL)"`,
      hint: `<p><code>da_terminare = [p["pid"] for p in processi if p["cpu"] &gt; 80]</code>. La buona pratica è sempre SIGTERM prima di SIGKILL: <code>sigterm_prima = True</code>.</p>`,
      solution: `processi_python = [p for p in processi if "python" in p["cmd"]]
pid_piu_cpu = max(processi, key=lambda p: p["cpu"])["pid"]
da_terminare = [p["pid"] for p in processi if p["cpu"] > 80]
sigterm_prima = True

print("processi python:", [p["pid"] for p in processi_python])
print("PID che usa piu' CPU:", pid_piu_cpu)
print("da terminare (cpu>80):", da_terminare)`
    },

    { type: "theory", title: "curl, wget e variabili d'ambiente", html: `
<p>Due strumenti per scaricare/interagire con la rete, e un concetto chiave per la configurazione.</p>
<pre><code>curl https://api.example.com/dati        # scarica e stampa (o interroga API)
curl -X POST -d '{"k":"v"}' url          # invia una richiesta POST
wget https://example.com/file.zip        # scarica un file su disco
export API_KEY="segreto"                 # variabile d'ambiente
echo $API_KEY                            # leggila</code></pre>
<p><code>curl</code> è il coltellino svizzero delle richieste HTTP (testare API, inviare dati); <code>wget</code> è specializzato nel download di file. Le <strong>variabili d'ambiente</strong> (<code>export</code>) configurano programmi senza modificarne il codice — ed è dove si mettono i segreti (API key, password), MAI nel codice sorgente.</p>
`, more: `
<p>Le <strong>variabili d'ambiente</strong> sono il modo standard di configurare applicazioni in modo separato dal codice, ed è un principio (il "config" del Twelve-Factor App) che i colloqui su ruoli backend/MLOps apprezzano. Il vantaggio: lo stesso codice gira in sviluppo, staging e produzione cambiando solo le variabili (URL del database, livello di log, chiavi API), senza toccare né ricompilare il codice. In Python si leggono con <code>os.environ.get("NOME")</code> (visto nella sala Docker). La regola d'oro di sicurezza: i <strong>segreti</strong> (password, token, chiavi) vanno nelle variabili d'ambiente o in gestori di segreti dedicati, MAI hardcoded nel sorgente né committati su Git — un segreto in un commit pubblico è compromesso per sempre (anche se lo rimuovi dopo, resta nella storia). È esattamente la lezione che ha portato a scegliere il gist con token scoped invece del token nel codice, in un'altra parte di questo stesso progetto.</p>
<p><code>curl</code> è indispensabile per testare API durante lo sviluppo (e nei colloqui pratici): <code>-X</code> specifica il metodo (GET, POST, PUT, DELETE), <code>-d</code> invia dati nel body, <code>-H</code> aggiunge header (es. <code>-H "Authorization: Bearer $TOKEN"</code>), <code>-i</code> mostra gli header di risposta, <code>-s</code> silenzia la barra di progresso. La combinazione <code>curl -s url | jq</code> (scarica JSON e lo formatta/filtra con jq) è il modo standard di esplorare un'API da terminale. Saper testare un endpoint con curl prima di scrivere codice client è una skill pratica quotidiana.</p>
<p>curl vs wget, la distinzione da colloquio: <code>wget</code> è ottimizzato per SCARICARE (download ricorsivi di siti, ripresa di download interrotti, mirroring), <code>curl</code> per INTERAGIRE con protocolli e API (supporta più protocolli, upload, richieste complesse, ed è una libreria oltre che un comando). Per "scarica questo file" entrambi vanno; per "manda questa POST con questi header a un'API" curl è lo strumento. Molti workflow di data engineering iniziano proprio così: <code>curl</code> o <code>wget</code> per ingerire dati da un'API o un URL, poi la pipeline di elaborazione — chiudendo il cerchio con la filosofia Unix di comandi componibili con cui è iniziata questa sala.</p>
` },

    {
      type: "exercise", id: "li-10", kg: 15, title: "Segreti nelle variabili d'ambiente",
      task: `<p>Simula la lettura di configurazione da variabili d'ambiente e la regola dei segreti:</p>
<ul>
<li><code>env</code>: un dizionario che simula l'ambiente (fornito)</li>
<li><code>api_key</code>: leggi "API_KEY" da env, con fallback None se assente (come <code>os.environ.get</code>)</li>
<li><code>db_url</code>: leggi "DATABASE_URL"</li>
<li><code>log_level</code>: leggi "LOG_LEVEL" con default "INFO" se assente</li>
<li><code>segreto_non_nel_codice</code>: <code>True</code> se i segreti vanno nelle env, NON hardcoded nel sorgente</li>
</ul>`,
      setup: `env = {
    "API_KEY": "sk-abc123",
    "DATABASE_URL": "postgres://localhost/mydb",
    # LOG_LEVEL non e' definita
}`,
      starter: `# env: simula os.environ

api_key = env.get("API_KEY")
db_url = ...
log_level = ...   # con default "INFO" se assente
segreto_non_nel_codice = ...

print("API key:", api_key)
print("DB URL:", db_url)
print("log level (default INFO):", log_level)`,
      check: `assert api_key == "sk-abc123", "api_key: env.get('API_KEY')"
assert db_url == "postgres://localhost/mydb", "db_url: env.get('DATABASE_URL')"
assert log_level == "INFO", "log_level: env.get('LOG_LEVEL', 'INFO') -> 'INFO' perche' non definita"
assert segreto_non_nel_codice == True, "segreto_non_nel_codice: True — i segreti vanno nelle env, MAI hardcoded nel codice"`,
      hint: `<p><code>env.get("LOG_LEVEL", "INFO")</code>: il secondo argomento è il default quando la chiave manca. La regola d'oro: <code>segreto_non_nel_codice = True</code>.</p>`,
      solution: `api_key = env.get("API_KEY")
db_url = env.get("DATABASE_URL")
log_level = env.get("LOG_LEVEL", "INFO")
segreto_non_nel_codice = True

print("API key:", api_key)
print("DB URL:", db_url)
print("log level (default INFO):", log_level)`
    },

    {
      type: "exercise", id: "li-11", kg: 15, title: "Quiz: shell e Linux",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "La pipe | passa lo stdout di un comando come stdin del successivo"</li>
<li><code>a2</code>: "uniq rimuove tutti i duplicati anche se non sono su righe consecutive"</li>
<li><code>a3</code>: "chmod 755 dà rwx all'owner e r-x a group e others"</li>
<li><code>a4</code>: "kill -9 (SIGKILL) permette al processo di salvare e pulire prima di chiudersi"</li>
<li><code>a5</code>: "I segreti (API key, password) vanno nelle variabili d'ambiente, non hardcoded nel codice"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: e' la definizione di pipe"
assert a2 == False, "a2 FALSA: uniq rimuove solo i duplicati CONSECUTIVI -> serve 'sort | uniq'"
assert a3 == True, "a3 VERA: 7=rwx, 5=r-x, 5=r-x"
assert a4 == False, "a4 FALSA: e' SIGTERM (kill) a permettere la pulizia; SIGKILL (-9) termina brutalmente"
assert a5 == True, "a5 VERA: segreti nelle env, mai nel sorgente"`,
      hint: `<p>Le due trappole: a2 (uniq solo consecutivi, serve sort prima) e a4 (SIGKILL è brutale, è SIGTERM il gentile). Le altre riprendono le lavagne: pipe (a1), chmod (a3), segreti (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = False
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "li-12", kg: 25, title: "MASSIMALE: analisi di un access log",
      task: `<p>Il gran finale: analizza un access log con una pipeline completa, come faresti su un server con <code>grep | cut | sort | uniq -c | sort -rn</code>. Rispondi a domande operative reali.</p>
<ul>
<li>ogni riga è "IP - - [data] \"METODO percorso\" status size"</li>
<li><code>errori_5xx</code>: le righe con status 5xx (server error): status che inizia con "5"</li>
<li><code>ip_con_errori</code>: i PID... anzi gli IP (primo campo) che hanno generato errori 5xx, unici</li>
<li><code>endpoint_piu_chiamato</code>: il percorso (dentro le virgolette, 2° token) più frequente in TUTTO il log</li>
<li><code>tasso_errore</code>: frazione di richieste con status 5xx sul totale</li>
<li><code>report</code>: dizionario con "n_errori", "n_ip_problematici", "endpoint_top", "tasso_errore" (arrotondato a 3)</li>
</ul>`,
      setup: `log = [
    '10.0.0.1 - - [21/Jul] "GET /home" 200 1024',
    '10.0.0.2 - - [21/Jul] "GET /api/data" 500 0',
    '10.0.0.1 - - [21/Jul] "GET /home" 200 1024',
    '10.0.0.3 - - [21/Jul] "POST /login" 503 0',
    '10.0.0.2 - - [21/Jul] "GET /api/data" 500 0',
    '10.0.0.1 - - [21/Jul] "GET /home" 200 1024',
    '10.0.0.4 - - [21/Jul] "GET /about" 404 512',
]`,
      starter: `from collections import Counter
import re
# log: righe di access log in formato comune

def status_di(riga):
    # lo status e' il penultimo campo numerico prima della size
    parti = riga.split('" ')[1].split()   # dopo la chiusura delle virgolette
    return parti[0]

def endpoint_di(riga):
    # il percorso e' dentro le virgolette: "METODO percorso"
    dentro = riga.split('"')[1]           # es. 'GET /home'
    return dentro.split()[1]              # '/home'

errori_5xx = [r for r in log if status_di(r).startswith("5")]
ip_con_errori = sorted(set(r.split()[0] for r in errori_5xx))

endpoint_tutti = [endpoint_di(r) for r in log]
endpoint_piu_chiamato = Counter(endpoint_tutti).most_common(1)[0][0]

tasso_errore = round(len(errori_5xx) / len(log), 3)

report = {
    "n_errori": len(errori_5xx),
    "n_ip_problematici": len(ip_con_errori),
    "endpoint_top": endpoint_piu_chiamato,
    "tasso_errore": tasso_errore,
}

print("REPORT:", report)
print("IP con errori 5xx:", ip_con_errori)`,
      check: `from collections import Counter
def _s(r): return r.split('" ')[1].split()[0]
def _e(r): return r.split('"')[1].split()[1]
_err = [r for r in log if _s(r).startswith("5")]
_ip = sorted(set(r.split()[0] for r in _err))
_ep = Counter([_e(r) for r in log]).most_common(1)[0][0]
_te = round(len(_err)/len(log), 3)
assert errori_5xx == _err and len(_err) == 3, "errori_5xx: 3 righe con status 5xx (500, 503, 500)"
assert ip_con_errori == _ip == ["10.0.0.2", "10.0.0.3"], "ip_con_errori: IP unici con errori 5xx"
assert endpoint_piu_chiamato == _ep == "/home", "endpoint_piu_chiamato: /home (3 volte)"
assert abs(tasso_errore - _te) < 1e-9 and tasso_errore == round(3/7, 3), "tasso_errore: 3/7 = 0.429"
assert report["n_errori"] == 3 and report["n_ip_problematici"] == 2 and report["endpoint_top"] == "/home", "report completo e coerente"`,
      hint: `<p>Le funzioni di parsing sono fornite: devi solo verificare che la pipeline giri. Il flusso è quello classico: filtra (grep 5xx) &rarr; estrai IP unici (cut + sort + uniq) &rarr; conta endpoint (uniq -c + sort). Esegui e controlla il report.</p>`,
      solution: `from collections import Counter
import re

def status_di(riga):
    parti = riga.split('" ')[1].split()
    return parti[0]

def endpoint_di(riga):
    dentro = riga.split('"')[1]
    return dentro.split()[1]

errori_5xx = [r for r in log if status_di(r).startswith("5")]
ip_con_errori = sorted(set(r.split()[0] for r in errori_5xx))

endpoint_tutti = [endpoint_di(r) for r in log]
endpoint_piu_chiamato = Counter(endpoint_tutti).most_common(1)[0][0]

tasso_errore = round(len(errori_5xx) / len(log), 3)

report = {
    "n_errori": len(errori_5xx),
    "n_ip_problematici": len(ip_con_errori),
    "endpoint_top": endpoint_piu_chiamato,
    "tasso_errore": tasso_errore,
}

print("REPORT:", report)
print("IP con errori 5xx:", ip_con_errori)`
    }

  ]
});
