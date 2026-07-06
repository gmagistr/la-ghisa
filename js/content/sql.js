window.MODULES.push({
  id: "sql",
  name: "SQL",
  tagline: "La sala attrezzi con i pesi a disco: query dichiarative su tabelle vere, dentro un database vero nel browser.",
  intro: "SQL non è un linguaggio di programmazione qualunque: è un modo di *chiedere* ai dati, non di calcolarli passo passo. Qui usiamo SQLite (un database vero, incorporato in Python) su un piccolo gestionale di palestra: iscritti, abbonamenti, prenotazioni corsi.",
  packages: ["sqlite3"],
  items: [

    { type: "theory", title: "Una tabella dentro un database vero", html: `
<p>SQLite è un database completo che vive in un singolo file (o, qui, in memoria). Il modulo <code>sqlite3</code> è nella libreria standard di Python: connessione, cursore, esecuzione.</p>
<pre><code>import sqlite3
con = sqlite3.connect(":memory:")   # database in RAM, sparisce alla fine
cur = con.cursor()
cur.execute("CREATE TABLE iscritti (id INTEGER, nome TEXT, eta INTEGER)")
cur.execute("INSERT INTO iscritti VALUES (1, 'Anna', 28)")
con.commit()
cur.execute("SELECT * FROM iscritti")
cur.fetchall()   # [(1, 'Anna', 28)] — una lista di tuple</code></pre>
<p><code>fetchall()</code> restituisce sempre una <strong>lista di tuple</strong>, una per riga. <code>commit()</code> salva le modifiche (INSERT, UPDATE, DELETE) — dimenticarlo è un classico primo errore.</p>
`, more: `
<p>Scrivere i valori direttamente dentro la stringa SQL (come negli esempi di questa lavagna) è comodo per esercizi piccoli, ma nel codice vero è un rischio serio: se un valore viene da input esterno (un form, un file, un utente), costruire la query concatenando stringhe apre la porta alla <strong>SQL injection</strong> — un attacco in cui un input malevolo modifica la query stessa. La difesa standard sono i <strong>parametri</strong>: <code>cur.execute("INSERT INTO iscritti VALUES (?, ?, ?)", (1, "Anna", 28))</code>, dove i <code>?</code> vengono sostituiti in modo sicuro dal driver, mai concatenati come testo.</p>
<p><code>cur.executemany(query, lista_di_tuple)</code> (che vedrai negli esercizi di questa sala) esegue la stessa query parametrizzata una volta per ogni tupla della lista — molto più efficiente e leggibile di un ciclo <code>for</code> con tanti <code>execute</code> separati, quando devi inserire più righe insieme.</p>
<p><code>:memory:</code> crea un database che vive solo in RAM e sparisce alla fine del processo — perfetto per esercizi e test. Nella pratica, <code>sqlite3.connect("dati.db")</code> con un nome di file vero crea (o apre) un database persistente su disco, che sopravvive al riavvio del programma: la sintassi è identica, cambia solo cosa succede alla connessione dopo che il programma termina.</p>
` },

    {
      type: "exercise", id: "sql-01", kg: 5, title: "Crea e popola",
      task: `<p>Sulla connessione <code>con</code> (già aperta), usa un cursore per:</p>
<ul>
<li>Creare la tabella <code>iscritti</code> con colonne <code>id INTEGER, nome TEXT, eta INTEGER</code></li>
<li>Inserire tre righe: (1, 'Anna', 28), (2, 'Bruno', 34), (3, 'Carla', 22)</li>
<li><code>righe</code>: il risultato di <code>SELECT * FROM iscritti</code>, come lista di tuple</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")`,
      starter: `# con e' gia' aperta
cur = con.cursor()

cur.execute("CREATE TABLE iscritti (id INTEGER, nome TEXT, eta INTEGER)")
cur.execute("INSERT INTO iscritti VALUES (1, 'Anna', 28)")
# aggiungi le altre due righe
...
con.commit()

cur.execute("SELECT * FROM iscritti")
righe = cur.fetchall()
print(righe)`,
      check: `assert 'righe' in globals(), "righe deve esistere"
assert righe == [(1, "Anna", 28), (2, "Bruno", 34), (3, "Carla", 22)], "righe deve contenere le 3 iscrizioni, nell'ordine di inserimento"`,
      hint: `<p>Ripeti <code>cur.execute("INSERT INTO iscritti VALUES (...)")</code> per ogni riga, con i valori tra parentesi separati da virgola. Le stringhe vanno tra apici singoli dentro la query.</p>`,
      solution: `cur = con.cursor()

cur.execute("CREATE TABLE iscritti (id INTEGER, nome TEXT, eta INTEGER)")
cur.execute("INSERT INTO iscritti VALUES (1, 'Anna', 28)")
cur.execute("INSERT INTO iscritti VALUES (2, 'Bruno', 34)")
cur.execute("INSERT INTO iscritti VALUES (3, 'Carla', 22)")
con.commit()

cur.execute("SELECT * FROM iscritti")
righe = cur.fetchall()
print(righe)`
    },

    { type: "theory", title: "SELECT, WHERE, ORDER BY", html: `
<p>Le tre clausole che userai in quasi ogni query. <code>SELECT</code> sceglie le colonne, <code>WHERE</code> filtra le righe, <code>ORDER BY</code> le ordina:</p>
<pre><code>SELECT nome, eta FROM iscritti WHERE eta > 25 ORDER BY eta DESC;</code></pre>
<p>Leggila come una frase: "prendi nome ed età dagli iscritti dove l'età supera 25, ordinati per età decrescente". <code>*</code> al posto dei nomi seleziona tutte le colonne. <code>DESC</code> inverte l'ordine (default <code>ASC</code>, crescente).</p>
`, more: `
<p><code>WHERE</code> supporta gli stessi operatori logici visti ovunque: <code>AND</code>, <code>OR</code>, <code>NOT</code>, e per condizioni composte le parentesi sono importanti tanto quanto in Python: <code>WHERE (eta > 18 AND livello = 'base') OR eta > 65</code> non è la stessa cosa senza le parentesi attorno alla prima condizione — SQL valuta <code>AND</code> con precedenza più alta di <code>OR</code>, ma affidarsi alla precedenza implicita è un rischio di bug quanto in qualsiasi altro linguaggio.</p>
<p><code>BETWEEN a AND b</code> è una scorciatoia per un intervallo chiuso (INCLUSI gli estremi): <code>WHERE eta BETWEEN 18 AND 65</code> equivale a <code>WHERE eta >= 18 AND eta <= 65</code>, ma si legge meglio quando il confronto è esplicitamente un intervallo. Analogamente, <code>IN (18, 25, 30)</code> è la scorciatoia per una serie di <code>OR</code> su valori discreti — l'equivalente SQL di <code>.isin()</code> in Pandas.</p>
<p><code>*</code> (seleziona tutte le colonne) è comodo in fase di esplorazione ma va evitato nel codice di produzione: se la tabella cambia struttura (una colonna aggiunta o rimossa), una query con <code>*</code> cambia silenziosamente cosa restituisce, mentre elencare esplicitamente le colonne (<code>SELECT nome, eta FROM ...</code>) rende il contratto della query stabile e prevedibile nel tempo.</p>
` },

    {
      type: "exercise", id: "sql-02", kg: 10, title: "Filtra e ordina",
      task: `<p>Sulla tabella <code>abbonati</code> (già popolata), scrivi query SQL per ottenere:</p>
<ul>
<li><code>maggiorenni</code>: nome ed età di chi ha 18 anni o più, ordinati per età crescente (lista di tuple)</li>
<li><code>nomi_over30</code>: solo i nomi di chi ha più di 30 anni, ordinati alfabeticamente</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE abbonati (id INTEGER, nome TEXT, eta INTEGER)")
cur.executemany("INSERT INTO abbonati VALUES (?, ?, ?)", [
    (1, "Anna", 28), (2, "Bruno", 34), (3, "Carla", 16), (4, "Dario", 41), (5, "Elisa", 19)
])
con.commit()`,
      starter: `# con, cur e la tabella 'abbonati' sono gia' pronte
cur.execute("SELECT nome, eta FROM abbonati WHERE eta >= 18 ORDER BY eta ASC")
maggiorenni = cur.fetchall()

cur.execute("SELECT nome FROM abbonati WHERE eta > 30 ORDER BY nome")
nomi_over30 = [riga[0] for riga in cur.fetchall()]

print(maggiorenni)
print(nomi_over30)`,
      check: `assert 'maggiorenni' in globals() and maggiorenni == [("Elisa", 19), ("Anna", 28), ("Bruno", 34), ("Dario", 41)], "maggiorenni: WHERE eta >= 18 ORDER BY eta ASC — Carla (16) e' esclusa"
assert 'nomi_over30' in globals() and nomi_over30 == ["Bruno", "Dario"], "nomi_over30: solo i nomi (colonna 0 di ogni tupla), ordinati alfabeticamente"`,
      hint: `<p>Ogni riga di <code>fetchall()</code> è una tupla anche con una sola colonna selezionata: <code>[riga[0] for riga in cur.fetchall()]</code> estrae solo il primo elemento di ciascuna.</p>`,
      solution: `cur.execute("SELECT nome, eta FROM abbonati WHERE eta >= 18 ORDER BY eta ASC")
maggiorenni = cur.fetchall()

cur.execute("SELECT nome FROM abbonati WHERE eta > 30 ORDER BY nome")
nomi_over30 = [riga[0] for riga in cur.fetchall()]

print(maggiorenni)
print(nomi_over30)`
    },

    { type: "theory", title: "Funzioni di aggregazione", html: `
<p>SQL sa fare statistica in una riga, proprio come Pandas: <code>COUNT</code>, <code>AVG</code>, <code>SUM</code>, <code>MIN</code>, <code>MAX</code>.</p>
<pre><code>SELECT COUNT(*) FROM abbonati;             -- quante righe in totale
SELECT AVG(eta) FROM abbonati;             -- media
SELECT COUNT(*) FROM abbonati WHERE eta > 30;  -- conteggio filtrato</code></pre>
<p><code>COUNT(*)</code> conta le righe indipendentemente dal contenuto; <code>COUNT(colonna)</code> conta solo i valori non-NULL di quella colonna — una distinzione che avrai già visto in Pandas come <code>len(df)</code> vs <code>df["x"].count()</code>.</p>
`, more: `
<p>Le funzioni di aggregazione si possono combinare in una sola <code>SELECT</code>: <code>SELECT COUNT(*), AVG(eta), MIN(eta), MAX(eta) FROM abbonati</code> restituisce una singola riga (una tupla) con quattro valori insieme — non serve una query separata per ciascuna statistica, esattamente come <code>df.describe()</code> raccoglie più statistiche in un colpo solo.</p>
<p><code>SUM(colonna)</code> completa il quartetto (insieme a COUNT, AVG, MIN, MAX): utile per totali, es. <code>SELECT SUM(prezzo) FROM ordini</code> per l'incasso complessivo. Come <code>AVG</code>, ignora automaticamente i valori NULL nella somma — un dettaglio da tenere a mente se ti aspetti che NULL si comporti come zero (non lo fa).</p>
<p>Le funzioni di aggregazione senza <code>GROUP BY</code> trattano SEMPRE l'intera tabella (o il risultato del <code>WHERE</code>, se presente) come un unico grande gruppo — è il caso limite di <code>GROUP BY</code> con un solo gruppo implicito. Capire questo aiuta a capire perché <code>GROUP BY</code> (prossima teoria) è semplicemente l'estensione naturale: invece di UN gruppo (tutta la tabella), ne crei tanti quante sono le categorie distinte della colonna di raggruppamento.</p>
` },

    {
      type: "exercise", id: "sql-03", kg: 10, title: "Statistiche in una riga",
      task: `<p>Sulla tabella <code>abbonati</code> (stessa di prima). Scrivi query per ottenere:</p>
<ul>
<li><code>totale</code>: il numero totale di abbonati (intero)</li>
<li><code>eta_media</code>: l'età media (float)</li>
<li><code>eta_massima</code>: l'età massima</li>
</ul>
<p>Ricorda: <code>fetchone()</code> restituisce <strong>una singola tupla</strong> (utile quando ti aspetti un solo risultato), <code>[0]</code> ne estrae il primo valore.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE abbonati (id INTEGER, nome TEXT, eta INTEGER)")
cur.executemany("INSERT INTO abbonati VALUES (?, ?, ?)", [
    (1, "Anna", 28), (2, "Bruno", 34), (3, "Carla", 16), (4, "Dario", 41), (5, "Elisa", 19)
])
con.commit()`,
      starter: `# con, cur e 'abbonati' sono gia' pronte
cur.execute("SELECT COUNT(*) FROM abbonati")
totale = cur.fetchone()[0]

cur.execute("SELECT AVG(eta) FROM abbonati")
eta_media = ...

cur.execute("SELECT MAX(eta) FROM abbonati")
eta_massima = ...

print(totale, eta_media, eta_massima)`,
      check: `assert 'totale' in globals() and totale == 5, "totale deve essere 5"
assert 'eta_media' in globals() and abs(float(eta_media) - 27.6) < 1e-6, "eta_media: SELECT AVG(eta), poi fetchone()[0]"
assert 'eta_massima' in globals() and eta_massima == 41, "eta_massima: SELECT MAX(eta)"`,
      hint: `<p>Sempre lo stesso schema: <code>cur.execute("SELECT ...")</code>, poi <code>cur.fetchone()[0]</code> per prendere il valore singolo dalla tupla di risultato.</p>`,
      solution: `cur.execute("SELECT COUNT(*) FROM abbonati")
totale = cur.fetchone()[0]

cur.execute("SELECT AVG(eta) FROM abbonati")
eta_media = cur.fetchone()[0]

cur.execute("SELECT MAX(eta) FROM abbonati")
eta_massima = cur.fetchone()[0]

print(totale, eta_media, eta_massima)`
    },

    { type: "theory", title: "GROUP BY: l'equivalente SQL del groupby", html: `
<p>La stessa idea del <code>groupby</code> di Pandas, in SQL: raggruppa le righe per una colonna e calcola un'aggregazione per ciascun gruppo.</p>
<pre><code>SELECT corso, COUNT(*) AS n_iscritti
FROM prenotazioni
GROUP BY corso
ORDER BY n_iscritti DESC;</code></pre>
<p><code>AS</code> rinomina il risultato ("alias"), utile per leggerlo o riusarlo. Regola ferrea: nel <code>SELECT</code> puoi mettere solo le colonne che sono nel <code>GROUP BY</code> oppure dentro una funzione di aggregazione — altrimenti SQL non saprebbe quale valore mostrare per un gruppo con più righe.</p>
`, more: `
<p>SQLite è più permissivo di molti altri database (PostgreSQL, MySQL in modalità strict) riguardo alla regola "solo colonne nel GROUP BY o aggregate": alcuni motori sollevano un errore esplicito se provi a selezionare una colonna non raggruppata e non aggregata, SQLite a volte lascia passare la query restituendo un valore arbitrario (non specificato) per quella colonna. Non affidarti a questo comportamento permissivo: è considerato codice fragile anche quando "funziona" su SQLite.</p>
<p>Si può raggruppare per più di una colonna passandole entrambe al <code>GROUP BY</code> separate da virgola: <code>GROUP BY corso, mese</code> crea un gruppo per ogni combinazione unica di corso E mese — esattamente come <code>groupby(["corso", "mese"])</code> in Pandas, visto anche in un massimale di questa sala.</p>
<p>L'ordine logico di esecuzione di una query SQL (non l'ordine in cui la scrivi!) è: prima <code>FROM</code> (da quale tabella), poi <code>WHERE</code> (filtro riga per riga), poi <code>GROUP BY</code> (raggruppamento), poi <code>HAVING</code> (filtro sui gruppi, prossima teoria), poi <code>SELECT</code> (quali colonne/aggregazioni mostrare), infine <code>ORDER BY</code> e <code>LIMIT</code>. Capire questo ordine spiega perché non puoi usare nel <code>WHERE</code> un alias definito nel <code>SELECT</code> — al momento del <code>WHERE</code>, il <code>SELECT</code> non è stato ancora calcolato.</p>
` },

    {
      type: "exercise", id: "sql-04", kg: 15, title: "Il corso più gettonato",
      task: `<p>Sulla tabella <code>prenotazioni</code> (corso prenotato da ogni iscritto, con ripetizioni). Scrivi query per:</p>
<ul>
<li><code>per_corso</code>: lista di tuple (corso, conteggio) per ogni corso, ordinate per conteggio decrescente</li>
<li><code>corso_top</code>: il nome del corso più prenotato (stringa, dal primo elemento di <code>per_corso</code>)</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prenotazioni (iscritto TEXT, corso TEXT)")
cur.executemany("INSERT INTO prenotazioni VALUES (?, ?)", [
    ("Anna", "yoga"), ("Bruno", "spinning"), ("Carla", "yoga"), ("Dario", "pesi"),
    ("Elisa", "yoga"), ("Anna", "spinning"), ("Bruno", "pesi"), ("Fabio", "yoga"),
])
con.commit()`,
      starter: `# con, cur e 'prenotazioni' sono gia' pronte
cur.execute("""
    SELECT corso, COUNT(*) AS n
    FROM prenotazioni
    GROUP BY corso
    ORDER BY n DESC
""")
per_corso = cur.fetchall()
corso_top = per_corso[0][0]

print(per_corso)
print(corso_top)`,
      check: `assert 'per_corso' in globals() and per_corso == [("yoga", 4), ("spinning", 2), ("pesi", 2)], "per_corso: GROUP BY corso, ordina per conteggio decrescente — yoga vince con 4 prenotazioni"
assert 'corso_top' in globals() and corso_top == "yoga", "corso_top: il primo elemento della prima tupla di per_corso"`,
      hint: `<p>Il nome della colonna alias (<code>n</code>) si usa anche nell'<code>ORDER BY</code>. Ogni tupla in <code>per_corso</code> è <code>(corso, conteggio)</code>: <code>per_corso[0][0]</code> pesca il corso della prima tupla.</p>`,
      solution: `cur.execute("""
    SELECT corso, COUNT(*) AS n
    FROM prenotazioni
    GROUP BY corso
    ORDER BY n DESC
""")
per_corso = cur.fetchall()
corso_top = per_corso[0][0]

print(per_corso)
print(corso_top)`
    },

    { type: "theory", title: "JOIN: unire tabelle come in Pandas", html: `
<p>L'equivalente SQL di <code>pd.merge</code>: unire righe di due tabelle in base a una chiave comune. <code>INNER JOIN</code> tiene solo le combinazioni che esistono in entrambe le tabelle:</p>
<pre><code>SELECT i.nome, p.corso
FROM iscritti i
INNER JOIN prenotazioni p ON i.nome = p.iscritto;</code></pre>
<p><code>i</code> e <code>p</code> sono <strong>alias</strong> di tabella: abbreviazioni che evitano di riscrivere il nome intero ad ogni colonna, indispensabili quando due tabelle condividono nomi di colonna. <code>LEFT JOIN</code> (come <code>how="left"</code> in Pandas) tiene tutte le righe della tabella di sinistra anche senza corrispondenza, riempiendo con <code>NULL</code>.</p>
`, more: `
<p>SQLite non supporta nativamente <code>RIGHT JOIN</code> né <code>FULL OUTER JOIN</code> (a differenza di PostgreSQL) — se serve l'equivalente di un right join, la soluzione pratica è invertire l'ordine delle tabelle e usare un <code>LEFT JOIN</code> (<code>B LEFT JOIN A</code> invece di <code>A RIGHT JOIN B</code>), oppure combinare due <code>LEFT JOIN</code> con <code>UNION</code> per simulare un outer join completo.</p>
<p>Il pericolo più insidioso di un JOIN è la stessa moltiplicazione di righe già vista per <code>pd.merge</code>: se la chiave di join ha duplicati in entrambe le tabelle, ogni combinazione viene prodotta — 3 righe con una chiave a sinistra per 2 a destra danno 6 righe in output, non 3 o 2. Un controllo di sanità dopo ogni JOIN complesso: confrontare <code>COUNT(*)</code> del risultato con quello che ti aspetteresti dalla cardinalità della relazione (uno-a-uno, uno-a-molti, molti-a-molti).</p>
<p>Si possono incatenare più JOIN nella stessa query (visto in un esercizio "combo" di questa sala, con 3 tabelle): <code>FROM a JOIN b ON ... JOIN c ON ...</code> — ogni JOIN successivo lavora sul risultato COMBINATO dei JOIN precedenti, non sulla tabella originale isolata. L'ordine in cui scrivi i JOIN non cambia il risultato finale (SQL è dichiarativo: descrivi COSA vuoi, non l'ordine ESATTO in cui va calcolato), ma può influenzare le prestazioni su tabelle grandi.</p>
` },

    {
      type: "exercise", id: "sql-05", kg: 20, title: "Chi fa cosa",
      task: `<p>Hai <code>iscritti</code> (id, nome) e <code>prenotazioni</code> (iscritto_id, corso). Scrivi query per:</p>
<ul>
<li><code>accoppiati</code>: <code>INNER JOIN</code> che restituisce (nome, corso) per ogni prenotazione, ordinato per nome</li>
<li><code>senza_corso</code>: <code>LEFT JOIN</code> per trovare i nomi di chi <strong>non</strong> ha nessuna prenotazione (dove <code>corso IS NULL</code>)</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE iscritti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO iscritti VALUES (?, ?)", [(1, "Anna"), (2, "Bruno"), (3, "Carla"), (4, "Dario")])
cur.execute("CREATE TABLE prenotazioni (iscritto_id INTEGER, corso TEXT)")
cur.executemany("INSERT INTO prenotazioni VALUES (?, ?)", [(1, "yoga"), (2, "pesi"), (1, "spinning")])
con.commit()`,
      starter: `# con, cur, 'iscritti' e 'prenotazioni' sono gia' pronte
cur.execute("""
    SELECT i.nome, p.corso
    FROM iscritti i
    INNER JOIN prenotazioni p ON i.id = p.iscritto_id
    ORDER BY i.nome
""")
accoppiati = cur.fetchall()

cur.execute("""
    SELECT i.nome
    FROM iscritti i
    LEFT JOIN prenotazioni p ON i.id = p.iscritto_id
    WHERE p.corso IS NULL
""")
senza_corso = [r[0] for r in cur.fetchall()]

print(accoppiati)
print(senza_corso)`,
      check: `assert 'accoppiati' in globals() and accoppiati == [("Anna", "spinning"), ("Anna", "yoga"), ("Bruno", "pesi")], "accoppiati: INNER JOIN — Anna compare due volte (due prenotazioni), Carla e Dario non hanno prenotazioni quindi non compaiono"
assert 'senza_corso' in globals() and senza_corso == ["Carla", "Dario"], "senza_corso: LEFT JOIN + WHERE corso IS NULL trova chi non ha corrispondenza"`,
      hint: `<p>L'<code>INNER JOIN</code> scarta silenziosamente Carla e Dario (nessuna prenotazione). Il <code>LEFT JOIN</code> invece li tiene con <code>corso</code> a <code>NULL</code>: è lì che li filtri con <code>IS NULL</code> (non <code>= NULL</code>, che in SQL non funziona mai).</p>`,
      solution: `cur.execute("""
    SELECT i.nome, p.corso
    FROM iscritti i
    INNER JOIN prenotazioni p ON i.id = p.iscritto_id
    ORDER BY i.nome
""")
accoppiati = cur.fetchall()

cur.execute("""
    SELECT i.nome
    FROM iscritti i
    LEFT JOIN prenotazioni p ON i.id = p.iscritto_id
    WHERE p.corso IS NULL
""")
senza_corso = [r[0] for r in cur.fetchall()]

print(accoppiati)
print(senza_corso)`
    },

    { type: "theory", title: "HAVING: filtrare i gruppi, non le righe", html: `
<p><code>WHERE</code> filtra le righe <em>prima</em> di raggruppare; per filtrare <em>dopo</em> l'aggregazione (es. "solo i corsi con più di 2 iscritti") serve <code>HAVING</code>:</p>
<pre><code>SELECT corso, COUNT(*) AS n
FROM prenotazioni
GROUP BY corso
HAVING COUNT(*) > 2;</code></pre>
<p>La regola mnemonica: <code>WHERE</code> lavora riga per riga, prima del <code>GROUP BY</code>; <code>HAVING</code> lavora gruppo per gruppo, dopo. Non puoi scrivere <code>WHERE COUNT(*) > 2</code> — al momento del <code>WHERE</code>, i gruppi non esistono ancora.</p>
`, more: `
<p><code>WHERE</code> e <code>HAVING</code> si possono usare INSIEME nella stessa query, e spesso è la combinazione più utile: <code>WHERE</code> scarta le righe indesiderate PRIMA di raggruppare (es. "ignora le prenotazioni cancellate"), <code>HAVING</code> filtra i gruppi risultanti DOPO l'aggregazione (es. "solo i corsi con più di 2 iscritti tra quelli rimasti"). Applicare il filtro giusto al momento giusto (WHERE quando è per riga, HAVING quando dipende dall'aggregazione) evita di dover ricalcolare l'aggregazione su dati che potevi già scartare prima.</p>
<p>L'espressione dentro <code>HAVING</code> non deve necessariamente ripetere esattamente quella nel <code>SELECT</code>: puoi filtrare su un'aggregazione anche se non la mostri nel risultato finale, es. <code>SELECT corso FROM prenotazioni GROUP BY corso HAVING COUNT(*) > 2</code> restituisce solo il nome del corso, pur filtrando in base al conteggio.</p>
<p>Un errore concettuale comune per chi viene da Pandas: pensare a <code>HAVING</code> come a un secondo <code>WHERE</code> generico. Non lo è — <code>HAVING</code> ha senso SOLO in presenza di un'aggregazione (con o senza <code>GROUP BY</code> esplicito); usarlo per condizioni che non coinvolgono funzioni di aggregazione funziona ma è concettualmente fuorviante e va scritto come <code>WHERE</code> per chiarezza.</p>
` },

    {
      type: "exercise", id: "sql-06", kg: 20, title: "Solo i corsi popolari",
      task: `<p>Sulla tabella <code>prenotazioni</code>: trova i corsi con <strong>più di 2</strong> prenotazioni.</p>
<ul>
<li><code>popolari</code>: lista di tuple (corso, conteggio) per i corsi con conteggio &gt; 2, ordinati per conteggio decrescente</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prenotazioni (iscritto TEXT, corso TEXT)")
cur.executemany("INSERT INTO prenotazioni VALUES (?, ?)", [
    ("a", "yoga"), ("b", "yoga"), ("c", "yoga"), ("d", "yoga"),
    ("e", "pesi"), ("f", "pesi"), ("g", "pesi"),
    ("h", "spinning"), ("i", "spinning"),
])
con.commit()`,
      starter: `# con, cur e 'prenotazioni' sono gia' pronte
cur.execute("""
    SELECT corso, COUNT(*) AS n
    FROM prenotazioni
    GROUP BY corso
    HAVING COUNT(*) > 2
    ORDER BY n DESC
""")
popolari = cur.fetchall()

print(popolari)`,
      check: `assert 'popolari' in globals() and popolari == [("yoga", 4), ("pesi", 3)], "popolari deve escludere spinning (solo 2 prenotazioni): HAVING COUNT(*) > 2"`,
      hint: `<p><code>HAVING</code> va dopo <code>GROUP BY</code> e usa la stessa espressione di aggregazione (<code>COUNT(*)</code>) che useresti nel <code>SELECT</code>.</p>`,
      solution: `cur.execute("""
    SELECT corso, COUNT(*) AS n
    FROM prenotazioni
    GROUP BY corso
    HAVING COUNT(*) > 2
    ORDER BY n DESC
""")
popolari = cur.fetchall()

print(popolari)`
    },

    {
      type: "exercise", id: "sql-07", kg: 25, title: "Massimale: report completo",
      task: `<p>Database completo: <code>iscritti</code> (id, nome, livello) e <code>prenotazioni</code> (iscritto_id, corso, mese). Costruisci un report in un'unica query:</p>
<ul>
<li><code>report</code>: per ogni <strong>livello</strong> di iscritto, il numero di prenotazioni totali fatte da iscritti di quel livello (JOIN + GROUP BY), ordinato per conteggio decrescente</li>
<li><code>livello_top</code>: il livello con più prenotazioni (stringa)</li>
</ul>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE iscritti (id INTEGER, nome TEXT, livello TEXT)")
cur.executemany("INSERT INTO iscritti VALUES (?, ?, ?)", [
    (1, "Anna", "avanzato"), (2, "Bruno", "base"), (3, "Carla", "avanzato"), (4, "Dario", "base"),
])
cur.execute("CREATE TABLE prenotazioni (iscritto_id INTEGER, corso TEXT, mese INTEGER)")
cur.executemany("INSERT INTO prenotazioni VALUES (?, ?, ?)", [
    (1, "yoga", 3), (1, "spinning", 4), (2, "pesi", 3), (3, "yoga", 3),
    (3, "pesi", 4), (3, "spinning", 4), (4, "yoga", 4),
])
con.commit()`,
      starter: `# con, cur, 'iscritti' e 'prenotazioni' sono gia' pronte
cur.execute("""
    SELECT i.livello, COUNT(*) AS n
    FROM iscritti i
    JOIN prenotazioni p ON i.id = p.iscritto_id
    GROUP BY i.livello
    ORDER BY n DESC
""")
report = cur.fetchall()
livello_top = report[0][0]

print(report)
print(livello_top)`,
      check: `assert 'report' in globals() and report == [("avanzato", 5), ("base", 2)], "report: Anna (avanzato) ha 2 prenotazioni, Carla (avanzato) ne ha 3 → 5 totali per 'avanzato'; Bruno e Dario (base) ne hanno 1 ciascuno → 2 totali"
assert 'livello_top' in globals() and livello_top == "avanzato", "livello_top: report[0][0]"`,
      hint: `<p>Conta a mano prima di scrivere SQL, per sapere cosa aspettarti: Anna (avanzato) ha 2 prenotazioni, Carla (avanzato) ne ha 3 → 5 totali per "avanzato"; Bruno e Dario (base) ne hanno 1 ciascuno → 2 totali. Se il tuo numero non torna, controlla il JOIN.</p>`,
      solution: `cur.execute("""
    SELECT i.livello, COUNT(*) AS n
    FROM iscritti i
    JOIN prenotazioni p ON i.id = p.iscritto_id
    GROUP BY i.livello
    ORDER BY n DESC
""")
report = cur.fetchall()
livello_top = report[0][0]

print(report)
print(livello_top)`
    },

    {
      type: "exercise", id: "sql-08", kg: 10, title: "Drill: quanti generi diversi",
      task: `<p>Su <code>libri</code> (già popolata): <code>generi</code>, i generi distinti (query con <code>DISTINCT</code>).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT, anno INTEGER, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?,?,?)", [
 (1,"Ombre di Nord","Rossi",2015,12.5,"Giallo"),
 (2,"Il Sentiero","Bianchi",2020,18.0,"Fantasy"),
 (3,"Anni Lenti","Rossi",2010,9.9,"Storico"),
 (4,"Notte Blu","Verdi",2020,15.0,"Giallo"),
 (5,"Fumo","Neri",2005,7.5,"Storico"),
 (6,"Il Sentiero 2","Bianchi",2022,20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT DISTINCT genere FROM libri")
generi = cur.fetchall()
print(generi)`,
      check: `assert set(g[0] for g in generi) == {"Giallo", "Fantasy", "Storico"}`,
      hint: `<p><code>SELECT DISTINCT colonna FROM tabella</code> elimina i duplicati dal risultato.</p>`,
      solution: `cur.execute("SELECT DISTINCT genere FROM libri")
generi = cur.fetchall()
print(generi)`
    },

    {
      type: "exercise", id: "sql-09", kg: 10, title: "Drill: ordina per genere e prezzo",
      task: `<p>Su <code>libri</code>: <code>ordinati</code>, tutti i titoli e prezzi ordinati per <code>genere</code> (alfabetico) e poi per <code>prezzo</code> decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT, anno INTEGER, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?,?,?)", [
 (1,"Ombre di Nord","Rossi",2015,12.5,"Giallo"),
 (2,"Il Sentiero","Bianchi",2020,18.0,"Fantasy"),
 (3,"Anni Lenti","Rossi",2010,9.9,"Storico"),
 (4,"Notte Blu","Verdi",2020,15.0,"Giallo"),
 (5,"Fumo","Neri",2005,7.5,"Storico"),
 (6,"Il Sentiero 2","Bianchi",2022,20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT titolo, genere, prezzo FROM libri ORDER BY genere ASC, prezzo DESC")
ordinati = cur.fetchall()
print(ordinati)`,
      check: `assert ordinati[0][1] == "Fantasy" and ordinati[0][0] == "Il Sentiero 2"
assert ordinati[-1][1] == "Storico"`,
      hint: `<p>Più colonne nell'<code>ORDER BY</code>, separate da virgola: la seconda decide solo a parità della prima.</p>`,
      solution: `cur.execute("SELECT titolo, genere, prezzo FROM libri ORDER BY genere ASC, prezzo DESC")
ordinati = cur.fetchall()
print(ordinati)`
    },

    { type: "theory", title: "LIKE: cercare pattern nel testo", html: `
<p><code>LIKE</code> filtra il testo per corrispondenza approssimata, con due jolly: <code>%</code> (zero o più caratteri qualsiasi) e <code>_</code> (esattamente un carattere):</p>
<pre><code>SELECT * FROM libri WHERE titolo LIKE 'Il %';    -- inizia per "Il "
SELECT * FROM libri WHERE titolo LIKE '%Sentiero%';  -- contiene "Sentiero" ovunque
SELECT * FROM libri WHERE autore LIKE '_o%';   -- seconda lettera "o"</code></pre>
<p>È l'equivalente SQL di <code>.str.contains()</code> / <code>.str.startswith()</code> di Pandas, con una sintassi diversa ma lo stesso identico scopo.</p>
`, more: `
<p>Per default <code>LIKE</code> in SQLite è <strong>case-insensitive</strong> per i caratteri ASCII: <code>'giallo'</code> e <code>'GIALLO'</code> corrispondono allo stesso pattern <code>LIKE '%iallo%'</code> — un comportamento diverso da <code>=</code>, che invece è sempre case-sensitive di default. Se serve un confronto case-sensitive esplicito con LIKE, esiste il pragma <code>PRAGMA case_sensitive_like = true</code>, ma è raro doverlo attivare nella pratica.</p>
<p>Il carattere jolly <code>_</code> (underscore, corrisponde a ESATTAMENTE un carattere) è meno usato di <code>%</code> ma utile per pattern a lunghezza fissa: <code>WHERE codice LIKE 'A___'</code> trova codici che iniziano per "A" seguiti da esattamente 3 caratteri qualsiasi — un vincolo che <code>%</code> da solo non potrebbe esprimere (accetterebbe anche "A" seguito da 1, 2, o 100 caratteri).</p>
<p>Per pattern più complessi di quanto <code>LIKE</code> permetta (es. "inizia con una cifra", "contiene esattamente due vocali consecutive"), SQLite offre anche <code>GLOB</code> (sintassi in stile Unix shell, case-sensitive) e, con l'estensione apposita, il supporto a vere espressioni regolari — ma per la stragrande maggioranza dei filtri testuali pratici, <code>LIKE</code> con <code>%</code> e <code>_</code> è più che sufficiente.</p>
` },

    {
      type: "exercise", id: "sql-10", kg: 10, title: "Drill: titoli con pattern",
      task: `<p>Su <code>libri</code>: <code>serie_sentiero</code>, i titoli che contengono la parola <code>"Sentiero"</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT, anno INTEGER, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?,?,?)", [
 (1,"Ombre di Nord","Rossi",2015,12.5,"Giallo"),
 (2,"Il Sentiero","Bianchi",2020,18.0,"Fantasy"),
 (3,"Anni Lenti","Rossi",2010,9.9,"Storico"),
 (4,"Notte Blu","Verdi",2020,15.0,"Giallo"),
 (5,"Fumo","Neri",2005,7.5,"Storico"),
 (6,"Il Sentiero 2","Bianchi",2022,20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT titolo FROM libri WHERE titolo LIKE '%Sentiero%'")
serie_sentiero = [r[0] for r in cur.fetchall()]
print(serie_sentiero)`,
      check: `assert serie_sentiero == ["Il Sentiero", "Il Sentiero 2"]`,
      hint: `<p><code>LIKE '%Sentiero%'</code>: il <code>%</code> prima e dopo permette qualsiasi cosa attorno alla parola.</p>`,
      solution: `cur.execute("SELECT titolo FROM libri WHERE titolo LIKE '%Sentiero%'")
serie_sentiero = [r[0] for r in cur.fetchall()]
print(serie_sentiero)`
    },

    { type: "theory", title: "LIMIT: solo le prime N righe", html: `
<p><code>LIMIT n</code> tronca il risultato alle prime <code>n</code> righe — utilissimo insieme a <code>ORDER BY</code> per query tipo "i 3 più cari", "i 5 più recenti":</p>
<pre><code>SELECT titolo FROM libri ORDER BY prezzo DESC LIMIT 3;</code></pre>
<p>Senza <code>ORDER BY</code>, <code>LIMIT</code> prende righe in un ordine non garantito — quasi sempre lo si usa insieme.</p>
`, more: `
<p><code>LIMIT</code> ha un secondo parametro opzionale, <code>OFFSET</code>, che salta le prime N righe prima di iniziare a contare: <code>ORDER BY prezzo DESC LIMIT 3 OFFSET 3</code> restituisce dal 4° al 6° libro più caro — la combinazione standard per implementare la "paginazione" (pagina 2 di una lista, pagina 3, ecc.) senza dover ricaricare tutti i dati precedenti.</p>
<p>Su tabelle grandi, <code>LIMIT</code> combinato con un buon <code>ORDER BY</code> indicizzato è molto più efficiente di caricare tutte le righe in Python e poi tagliarle a mano con lo slicing (<code>risultati[:3]</code>): il database può fermarsi non appena ha trovato le righe richieste, senza dover ordinare ed esaminare l'intera tabella se l'indice lo permette.</p>
<p>Un'insidia da ricordare: <code>LIMIT</code> SENZA <code>ORDER BY</code> non ha alcuna garanzia sull'ordine delle righe restituite — SQLite potrebbe restituire righe in un ordine diverso a seconda della versione, del piano di esecuzione interno, o persino tra due esecuzioni della stessa query sugli stessi dati. Se il risultato deve essere deterministico e riproducibile (come in un test automatico), <code>ORDER BY</code> non è opzionale.</p>
` },

    {
      type: "exercise", id: "sql-11", kg: 10, title: "Drill: i 2 libri più cari",
      task: `<p>Su <code>libri</code>: <code>top2_cari</code>, i 2 titoli più cari.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT, anno INTEGER, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?,?,?)", [
 (1,"Ombre di Nord","Rossi",2015,12.5,"Giallo"),
 (2,"Il Sentiero","Bianchi",2020,18.0,"Fantasy"),
 (3,"Anni Lenti","Rossi",2010,9.9,"Storico"),
 (4,"Notte Blu","Verdi",2020,15.0,"Giallo"),
 (5,"Fumo","Neri",2005,7.5,"Storico"),
 (6,"Il Sentiero 2","Bianchi",2022,20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT titolo FROM libri ORDER BY prezzo DESC LIMIT 2")
top2_cari = [r[0] for r in cur.fetchall()]
print(top2_cari)`,
      check: `assert top2_cari == ["Il Sentiero 2", "Il Sentiero"]`,
      hint: `<p><code>ORDER BY prezzo DESC LIMIT 2</code>: prima ordina dal più caro, poi tronca a 2.</p>`,
      solution: `cur.execute("SELECT titolo FROM libri ORDER BY prezzo DESC LIMIT 2")
top2_cari = [r[0] for r in cur.fetchall()]
print(top2_cari)`
    },

    { type: "theory", title: "UPDATE: modificare righe esistenti", html: `
<p><code>UPDATE</code> cambia valori nelle righe che soddisfano una condizione. <strong>Senza <code>WHERE</code>, aggiorna tutte le righe della tabella</strong> — l'errore più pericoloso e più comune di SQL:</p>
<pre><code>UPDATE libri SET prezzo = prezzo * 0.9 WHERE genere = 'Giallo';   -- sconto del 10% solo sui gialli</code></pre>
<p>Buona pratica: prima di un <code>UPDATE</code>, esegui la stessa condizione dentro un <code>SELECT</code> per vedere ESATTAMENTE quali righe verranno toccate.</p>
`, more: `
<p><code>UPDATE</code> può assegnare più colonne insieme separandole con virgola: <code>UPDATE libri SET prezzo = prezzo * 0.9, disponibile = 1 WHERE genere = 'Giallo'</code> — entrambe le colonne cambiano nella stessa istruzione, per le stesse righe filtrate dal <code>WHERE</code>.</p>
<p>Il lato destro di un <code>SET</code> può riferirsi al valore ATTUALE della stessa riga (come <code>prezzo * 0.9</code>, che legge il prezzo prima di sovrascriverlo): questo è concettualmente identico a un'operazione vettorizzata di Pandas come <code>df["prezzo"] = df["prezzo"] * 0.9</code> — entrambe leggono il valore vecchio e scrivono quello nuovo, riga per riga, senza un ciclo esplicito nel codice.</p>
<p>La verifica "prima esegui un SELECT con la stessa condizione" non è solo prudenza teorica: è la differenza pratica tra un errore recuperabile (hai visto poche righe attese, ti fermi) e un incidente vero (hai lanciato l'UPDATE senza WHERE su un database di produzione). Su un database reale, senza un backup recente, un UPDATE o DELETE sbagliato può essere irreversibile — un motivo in più per testare sempre le condizioni con un SELECT prima di eseguire la modifica.</p>
` },

    {
      type: "exercise", id: "sql-12", kg: 15, title: "Drill: sconto sui gialli",
      task: `<p>Su <code>libri</code>: applica uno sconto del 10% (<code>prezzo * 0.9</code>) solo ai libri di genere <code>"Giallo"</code>, poi verifica in <code>prezzi_giallo</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"Ombre di Nord",12.5,"Giallo"),
 (2,"Il Sentiero",18.0,"Fantasy"),
 (4,"Notte Blu",15.0,"Giallo"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("UPDATE libri SET prezzo = prezzo * 0.9 WHERE genere = 'Giallo'")
con.commit()

cur.execute("SELECT titolo, prezzo FROM libri WHERE genere = 'Giallo'")
prezzi_giallo = cur.fetchall()
print(prezzi_giallo)`,
      check: `assert abs(prezzi_giallo[0][1] - 11.25) < 1e-9
assert abs(prezzi_giallo[1][1] - 13.5) < 1e-9`,
      hint: `<p>Il <code>WHERE</code> nell'<code>UPDATE</code> funziona esattamente come in <code>SELECT</code>: filtra quali righe vengono toccate.</p>`,
      solution: `cur.execute("UPDATE libri SET prezzo = prezzo * 0.9 WHERE genere = 'Giallo'")
con.commit()

cur.execute("SELECT titolo, prezzo FROM libri WHERE genere = 'Giallo'")
prezzi_giallo = cur.fetchall()
print(prezzi_giallo)`
    },

    { type: "theory", title: "DELETE: rimuovere righe", html: `
<p><code>DELETE FROM tabella WHERE condizione</code> rimuove le righe che soddisfano la condizione. Stesso pericolo dell'<code>UPDATE</code>: <strong>senza <code>WHERE</code>, svuota l'intera tabella</strong>.</p>
<pre><code>DELETE FROM libri WHERE anno < 2010;</code></pre>
<p>A differenza di <code>DROP TABLE</code> (che elimina la tabella stessa, struttura compresa), <code>DELETE</code> rimuove solo righe: la tabella resta, vuota o parziale.</p>
`, more: `
<p><code>DELETE FROM tabella</code> senza alcun <code>WHERE</code> svuota completamente la tabella, riga per riga — è un'operazione diversa da <code>DROP TABLE tabella</code> (che elimina anche la struttura: colonne, tipi, vincoli) e da <code>TRUNCATE</code> (non supportato da SQLite, ma presente in altri database: svuota una tabella più velocemente di un DELETE su tabelle enormi, perché non registra ogni riga eliminata singolarmente).</p>
<p>Come per <code>UPDATE</code>, la condizione del <code>WHERE</code> in un <code>DELETE</code> può usare subquery, JOIN impliciti tramite <code>IN</code>/<code>NOT IN</code>, e qualunque espressione valida in un <code>WHERE</code> normale: <code>DELETE FROM prenotazioni WHERE iscritto_id NOT IN (SELECT id FROM iscritti)</code> ripulisce le prenotazioni "orfane" che puntano a un iscritto ormai cancellato — un pattern comune di pulizia dati relazionali.</p>
<p>Dopo un <code>DELETE</code> (o un <code>UPDATE</code>), <code>cur.rowcount</code> restituisce quante righe sono state effettivamente toccate dall'ultima istruzione eseguita su quel cursore — un modo rapido per verificare a runtime che l'operazione abbia avuto l'effetto atteso, senza dover rifare un <code>SELECT COUNT(*)</code> separato.</p>
` },

    {
      type: "exercise", id: "sql-13", kg: 15, title: "Drill: elimina i libri vecchi",
      task: `<p>Su <code>libri</code>: elimina quelli con <code>anno &lt; 2010</code>, poi <code>rimasti</code> (conteggio finale).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, anno INTEGER)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"Ombre di Nord",2015), (3,"Anni Lenti",2010), (5,"Fumo",2005), (6,"Il Sentiero 2",2022),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("DELETE FROM libri WHERE anno < 2010")
con.commit()

cur.execute("SELECT COUNT(*) FROM libri")
rimasti = cur.fetchone()[0]
print(rimasti)`,
      check: `assert rimasti == 3, "Solo 'Fumo' (2005) va eliminato: 'Anni Lenti' ha anno 2010, non e' < 2010"`,
      hint: `<p>Attenzione al confronto stretto: <code>anno &lt; 2010</code> non include il 2010 stesso.</p>`,
      solution: `cur.execute("DELETE FROM libri WHERE anno < 2010")
con.commit()

cur.execute("SELECT COUNT(*) FROM libri")
rimasti = cur.fetchone()[0]
print(rimasti)`
    },

    { type: "theory", title: "CASE WHEN: l'if-else di SQL", html: `
<p><code>CASE WHEN ... THEN ... ELSE ... END</code> classifica righe in categorie, dentro una <code>SELECT</code> — l'equivalente di <code>np.where</code>/<code>np.select</code>:</p>
<pre><code>SELECT titolo,
    CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END AS fascia
FROM libri;</code></pre>
<p>Si possono incatenare più <code>WHEN</code> per più di due categorie, esattamente come <code>np.select</code> con più condizioni.</p>
`, more: `
<p>Esiste anche la forma "semplice" di <code>CASE</code>, senza condizioni booleane esplicite: <code>CASE colonna WHEN 0 THEN 'nuovo' WHEN 1 THEN 'attivo' ELSE 'sconosciuto' END</code> confronta <code>colonna</code> per UGUAGLIANZA con ciascun valore elencato — l'equivalente SQL di <code>.map()</code> con dizionario in Pandas. La forma con condizioni booleane (<code>CASE WHEN prezzo >= 15 THEN ...</code>) è più generale e permette confronti di qualsiasi tipo, non solo l'uguaglianza.</p>
<p>Se nessun <code>WHEN</code> corrisponde e non c'è un <code>ELSE</code>, il risultato di <code>CASE</code> è <code>NULL</code> — un comportamento analogo a <code>map()</code> in Pandas che trasforma in <code>NaN</code> i valori non presenti nel dizionario. Scrivere sempre un <code>ELSE</code> esplicito, anche solo per un valore di default come <code>'altro'</code>, evita NULL inattesi che poi vanno gestiti a valle.</p>
<p>Un <code>CASE WHEN</code> può comparire ovunque sia lecita un'espressione: non solo nel <code>SELECT</code>, ma anche dentro un <code>ORDER BY</code> (per un ordinamento personalizzato non alfabetico né numerico) o dentro un <code>WHERE</code> (per condizioni complesse dipendenti da più rami) — è un'espressione come un'altra, non un comando a sé stante.</p>
` },

    {
      type: "exercise", id: "sql-14", kg: 15, title: "Drill: fasce di prezzo",
      task: `<p>Su <code>libri</code>: <code>fasce</code>, lista di tuple (titolo, fascia) con <code>CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"Ombre di Nord",12.5), (2,"Il Sentiero",18.0), (3,"Anni Lenti",9.9), (4,"Notte Blu",15.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT titolo, CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END
    FROM libri
""")
fasce = cur.fetchall()
print(fasce)`,
      check: `assert fasce == [("Ombre di Nord","economico"), ("Il Sentiero","caro"), ("Anni Lenti","economico"), ("Notte Blu","caro")]`,
      hint: `<p>Nota che 15.0 rientra in "caro" perché la condizione è <code>&gt;=</code>, non <code>&gt;</code>.</p>`,
      solution: `cur.execute("""
    SELECT titolo, CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END
    FROM libri
""")
fasce = cur.fetchall()
print(fasce)`
    },

    {
      type: "exercise", id: "sql-15", kg: 15, title: "Drill: quanti autori distinti",
      task: `<p>Su <code>libri</code>: <code>n_autori</code>, il numero di autori distinti (con <code>COUNT(DISTINCT ...)</code>).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"Ombre di Nord","Rossi"), (2,"Il Sentiero","Bianchi"), (3,"Anni Lenti","Rossi"), (6,"Il Sentiero 2","Bianchi"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT COUNT(DISTINCT autore) FROM libri")
n_autori = cur.fetchone()[0]
print(n_autori)`,
      check: `assert n_autori == 2`,
      hint: `<p><code>COUNT(DISTINCT colonna)</code> conta i valori distinti, non le righe totali.</p>`,
      solution: `cur.execute("SELECT COUNT(DISTINCT autore) FROM libri")
n_autori = cur.fetchone()[0]
print(n_autori)`
    },

    { type: "theory", title: "Subquery: una query dentro l'altra", html: `
<p>Una <strong>subquery</strong> è una <code>SELECT</code> usata come valore dentro un'altra query — utile quando la condizione dipende da un'aggregazione calcolata sui dati stessi:</p>
<pre><code>SELECT titolo FROM libri
WHERE prezzo > (SELECT AVG(prezzo) FROM libri);   -- solo i libri sopra la media</code></pre>
<p>La subquery tra parentesi viene calcolata per prima (qui, la media di tutti i prezzi), e il suo risultato diventa il termine di paragone nella query esterna.</p>
`, more: `
<p>Le subquery che restituiscono un SOLO valore (come <code>(SELECT AVG(prezzo) FROM libri)</code>) si usano ovunque sia lecito un valore singolo: dopo <code>=</code>, <code>&gt;</code>, <code>&lt;</code>. Le subquery che restituiscono una LISTA di valori (come <code>(SELECT libro_id FROM prestiti)</code>, vista nell'esercizio "mai prestati" di questa sala) si usano con <code>IN</code> o <code>NOT IN</code>, che confrontano contro l'intero elenco.</p>
<p>Esiste anche la <strong>subquery correlata</strong>, più avanzata: una subquery che si riferisce a una colonna della query ESTERNA, ricalcolata per ogni riga esterna — es. "trova i libri con prezzo sopra la media del LORO genere" (non la media globale) richiederebbe una subquery che filtra per <code>genere</code> uguale a quello della riga esterna. Sono potenti ma spesso più lente di un JOIN equivalente, perché concettualmente vengono rieseguite per ogni riga.</p>
<p>Una subquery nel <code>FROM</code> (invece che nel <code>WHERE</code>) tratta il risultato di una query come se fosse essa stessa una tabella temporanea: <code>SELECT * FROM (SELECT genere, AVG(prezzo) AS media FROM libri GROUP BY genere) WHERE media > 15</code> — utile quando serve filtrare o unire un risultato già aggregato, che altrimenti non potresti filtrare direttamente con <code>WHERE</code> (ricorda l'ordine di esecuzione: <code>WHERE</code> viene prima di <code>GROUP BY</code>, quindi non può vedere aggregazioni già calcolate se non tramite <code>HAVING</code> o, appunto, una subquery).</p>
` },

    {
      type: "exercise", id: "sql-16", kg: 20, title: "Drill: sopra la media",
      task: `<p>Su <code>libri</code>: <code>sopra_media</code>, i titoli con prezzo superiore alla media di tutti i prezzi.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"Ombre di Nord",12.5), (2,"Il Sentiero",18.0), (3,"Anni Lenti",9.9), (4,"Notte Blu",15.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT titolo FROM libri WHERE prezzo > (SELECT AVG(prezzo) FROM libri)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`,
      check: `assert sopra_media == ["Il Sentiero", "Notte Blu"], "Media = (12.5+18+9.9+15)/4 = 13.85: solo Il Sentiero e Notte Blu la superano"`,
      hint: `<p>La media di questi 4 prezzi è 13.85: verifica quali superano quel valore.</p>`,
      solution: `cur.execute("SELECT titolo FROM libri WHERE prezzo > (SELECT AVG(prezzo) FROM libri)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`
    },

    {
      type: "exercise", id: "sql-17", kg: 20, title: "Drill: statistica per genere",
      task: `<p>Su <code>libri</code>: <code>per_genere</code>, per ogni genere il conteggio e il prezzo medio, ordinato per conteggio decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"Ombre di Nord",12.5,"Giallo"), (2,"Il Sentiero",18.0,"Fantasy"),
 (3,"Anni Lenti",9.9,"Storico"), (4,"Notte Blu",15.0,"Giallo"),
 (5,"Fumo",7.5,"Storico"), (6,"Il Sentiero 2",20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT genere, COUNT(*) AS n, AVG(prezzo) AS media
    FROM libri
    GROUP BY genere
    ORDER BY n DESC
""")
per_genere = cur.fetchall()
print(per_genere)`,
      check: `assert len(per_genere) == 3
assert all(row[1] == 2 for row in per_genere)`,
      hint: `<p>Con questi dati ogni genere ha esattamente 2 libri: il conteggio non discrimina l'ordine, che quindi dipende dall'ordine "naturale" restituito da SQLite.</p>`,
      solution: `cur.execute("""
    SELECT genere, COUNT(*) AS n, AVG(prezzo) AS media
    FROM libri
    GROUP BY genere
    ORDER BY n DESC
""")
per_genere = cur.fetchall()
print(per_genere)`
    },

    {
      type: "exercise", id: "sql-18", kg: 20, title: "Drill: i libri più prestati",
      task: `<p>Su <code>prestiti</code> (libro_id ripetuto per ogni prestito): <code>popolari</code>, i <code>libro_id</code> con più di 1 prestito, con il loro conteggio, ordinati per conteggio decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER, utente_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?,?)", [
 (1,1,1),(2,1,2),(3,2,1),(4,4,3),(5,1,3),(6,2,2),(7,3,1),
])
con.commit()`,
      starter: `# con, cur, 'prestiti' sono gia' pronti
cur.execute("""
    SELECT libro_id, COUNT(*) AS n
    FROM prestiti
    GROUP BY libro_id
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
popolari = cur.fetchall()
print(popolari)`,
      check: `assert popolari == [(1, 3), (2, 2)]`,
      hint: `<p><code>HAVING</code> filtra i gruppi DOPO l'aggregazione: qui, solo i libro_id con più di 1 prestito.</p>`,
      solution: `cur.execute("""
    SELECT libro_id, COUNT(*) AS n
    FROM prestiti
    GROUP BY libro_id
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
popolari = cur.fetchall()
print(popolari)`
    },

    {
      type: "exercise", id: "sql-19", kg: 20, title: "Combo: chi ha letto cosa",
      task: `<p>Unisci <code>prestiti</code>, <code>utenti</code> e <code>libri</code> in <code>letture</code>: (nome utente, titolo libro), ordinato per nome e poi titolo.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?)", [(1,"Ombre di Nord"),(2,"Il Sentiero"),(3,"Anni Lenti"),(4,"Notte Blu")])
cur.execute("CREATE TABLE utenti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO utenti VALUES (?,?)", [(1,"Anna"),(2,"Bo"),(3,"Cin")])
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER, utente_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?,?)", [(1,1,1),(2,1,2),(3,2,1),(4,4,3)])
con.commit()`,
      starter: `# con, cur, 'libri', 'utenti', 'prestiti' sono gia' pronti
cur.execute("""
    SELECT u.nome, l.titolo
    FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    JOIN libri l ON p.libro_id = l.id
    ORDER BY u.nome, l.titolo
""")
letture = cur.fetchall()
print(letture)`,
      check: `assert letture == [("Anna","Il Sentiero"), ("Anna","Ombre di Nord"), ("Bo","Ombre di Nord"), ("Cin","Notte Blu")]`,
      hint: `<p>Due <code>JOIN</code> in fila: prima colleghi prestiti a utenti, poi lo stesso risultato a libri — l'ordine dei JOIN non cambia il risultato finale, solo la leggibilità.</p>`,
      solution: `cur.execute("""
    SELECT u.nome, l.titolo
    FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    JOIN libri l ON p.libro_id = l.id
    ORDER BY u.nome, l.titolo
""")
letture = cur.fetchall()
print(letture)`
    },

    {
      type: "exercise", id: "sql-20", kg: 20, title: "Combo: il lettore più attivo",
      task: `<p>Stesso schema di prima (3 tabelle): <code>lettore_top</code>, il nome dell'utente con più prestiti.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?)", [(1,"Ombre di Nord"),(2,"Il Sentiero"),(3,"Anni Lenti"),(4,"Notte Blu")])
cur.execute("CREATE TABLE utenti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO utenti VALUES (?,?)", [(1,"Anna"),(2,"Bo"),(3,"Cin")])
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER, utente_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?,?)", [(1,1,1),(2,1,2),(3,2,1),(4,4,3),(5,3,1)])
con.commit()`,
      starter: `# con, cur, 'libri', 'utenti', 'prestiti' sono gia' pronti
cur.execute("""
    SELECT u.nome, COUNT(*) AS n
    FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    GROUP BY u.nome
    ORDER BY n DESC
    LIMIT 1
""")
lettore_top = cur.fetchone()[0]
print(lettore_top)`,
      check: `assert lettore_top == "Anna"`,
      hint: `<p>Unire <code>JOIN</code> + <code>GROUP BY</code> + <code>ORDER BY</code> + <code>LIMIT 1</code> è il modo standard per trovare "il primo classificato" in SQL.</p>`,
      solution: `cur.execute("""
    SELECT u.nome, COUNT(*) AS n
    FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    GROUP BY u.nome
    ORDER BY n DESC
    LIMIT 1
""")
lettore_top = cur.fetchone()[0]
print(lettore_top)`
    },

    {
      type: "exercise", id: "sql-21", kg: 20, title: "Combo: sconto e conteggio insieme",
      task: `<p>Su <code>libri</code>: applica uno sconto di 2 euro a tutti i libri con <code>anno &lt; 2015</code> (senza andare sotto 0), poi <code>quanti_scontati</code>: quante righe sono state toccate (usa un <code>SELECT COUNT</code> con la stessa condizione, PRIMA di aggiornare).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, anno INTEGER, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"Ombre di Nord",2015,12.5), (3,"Anni Lenti",2010,9.9), (5,"Fumo",2005,7.5), (6,"Il Sentiero 2",2022,20.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("SELECT COUNT(*) FROM libri WHERE anno < 2015")
quanti_scontati = cur.fetchone()[0]

cur.execute("UPDATE libri SET prezzo = prezzo - 2 WHERE anno < 2015")
con.commit()

print(quanti_scontati)`,
      check: `assert quanti_scontati == 2, "Solo Anni Lenti (2010) e Fumo (2005) hanno anno < 2015"`,
      hint: `<p>Contare PRIMA di modificare è buona pratica: dopo l'<code>UPDATE</code>, la condizione originale potrebbe non essere più verificabile allo stesso modo.</p>`,
      solution: `cur.execute("SELECT COUNT(*) FROM libri WHERE anno < 2015")
quanti_scontati = cur.fetchone()[0]

cur.execute("UPDATE libri SET prezzo = prezzo - 2 WHERE anno < 2015")
con.commit()

print(quanti_scontati)`
    },

    {
      type: "exercise", id: "sql-22", kg: 20, title: "Combo: fasce e conteggio con CASE",
      task: `<p>Su <code>libri</code>: <code>conteggio_fasce</code>, quanti libri per fascia (usa <code>CASE WHEN</code> dentro un <code>GROUP BY</code> — SQLite permette di raggruppare per l'espressione CASE ripetendola, oppure usando un alias).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"A",12.5), (2,"B",18.0), (3,"C",9.9), (4,"D",15.0), (5,"E",20.0), (6,"F",8.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT
        CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END AS fascia,
        COUNT(*) AS n
    FROM libri
    GROUP BY fascia
""")
conteggio_fasce = dict(cur.fetchall())
print(conteggio_fasce)`,
      check: `assert conteggio_fasce == {"caro": 3, "economico": 3}`,
      hint: `<p>In SQLite puoi raggruppare direttamente per l'alias definito nel <code>SELECT</code> (<code>fascia</code>), senza ripetere l'intera espressione <code>CASE</code>.</p>`,
      solution: `cur.execute("""
    SELECT
        CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END AS fascia,
        COUNT(*) AS n
    FROM libri
    GROUP BY fascia
""")
conteggio_fasce = dict(cur.fetchall())
print(conteggio_fasce)`
    },

    {
      type: "exercise", id: "sql-23", kg: 25, title: "Combo: chi non ha mai preso in prestito",
      task: `<p>Con <code>utenti</code> e <code>prestiti</code>: <code>mai_preso</code>, i nomi degli utenti senza NESSUN prestito (usa <code>LEFT JOIN</code> + <code>WHERE ... IS NULL</code>, come nel massimale della sala base).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE utenti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO utenti VALUES (?,?)", [(1,"Anna"),(2,"Bo"),(3,"Cin"),(4,"Dan")])
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER, utente_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?,?)", [(1,1,1),(2,2,1),(3,1,3)])
con.commit()`,
      starter: `# con, cur, 'utenti', 'prestiti' sono gia' pronti
cur.execute("""
    SELECT u.nome
    FROM utenti u
    LEFT JOIN prestiti p ON u.id = p.utente_id
    WHERE p.id IS NULL
""")
mai_preso = [r[0] for r in cur.fetchall()]
print(mai_preso)`,
      check: `assert mai_preso == ["Bo", "Dan"]`,
      hint: `<p>Anna e Cin hanno prestiti (compaiono in <code>prestiti</code>); Bo e Dan no: il <code>LEFT JOIN</code> lascia <code>p.id</code> a NULL per loro.</p>`,
      solution: `cur.execute("""
    SELECT u.nome
    FROM utenti u
    LEFT JOIN prestiti p ON u.id = p.utente_id
    WHERE p.id IS NULL
""")
mai_preso = [r[0] for r in cur.fetchall()]
print(mai_preso)`
    },

    {
      type: "exercise", id: "sql-24", kg: 25, title: "Combo: genere con prezzo medio più alto",
      task: `<p>Su <code>libri</code>: <code>genere_top</code>, il genere con il prezzo medio più alto (query con <code>GROUP BY</code>, <code>ORDER BY</code>, <code>LIMIT 1</code>).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"Ombre di Nord",12.5,"Giallo"), (2,"Il Sentiero",18.0,"Fantasy"),
 (3,"Anni Lenti",9.9,"Storico"), (4,"Notte Blu",15.0,"Giallo"),
 (5,"Fumo",7.5,"Storico"), (6,"Il Sentiero 2",20.0,"Fantasy"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT genere, AVG(prezzo) AS media
    FROM libri
    GROUP BY genere
    ORDER BY media DESC
    LIMIT 1
""")
genere_top = cur.fetchone()[0]
print(genere_top)`,
      check: `assert genere_top == "Fantasy"`,
      hint: `<p>Fantasy ha media (18+20)/2=19, la più alta tra i tre generi.</p>`,
      solution: `cur.execute("""
    SELECT genere, AVG(prezzo) AS media
    FROM libri
    GROUP BY genere
    ORDER BY media DESC
    LIMIT 1
""")
genere_top = cur.fetchone()[0]
print(genere_top)`
    },

    {
      type: "exercise", id: "sql-25", kg: 25, title: "Combo: autori con più di un libro",
      task: `<p>Su <code>libri</code>: <code>autori_prolifici</code>, gli autori con più di 1 libro pubblicato, col loro conteggio.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, autore TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"Ombre di Nord","Rossi"), (2,"Il Sentiero","Bianchi"),
 (3,"Anni Lenti","Rossi"), (4,"Notte Blu","Verdi"), (6,"Il Sentiero 2","Bianchi"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT autore, COUNT(*) AS n
    FROM libri
    GROUP BY autore
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
autori_prolifici = cur.fetchall()
print(autori_prolifici)`,
      check: `assert set(autori_prolifici) == {("Rossi", 2), ("Bianchi", 2)}`,
      hint: `<p>Verdi ha un solo libro: <code>HAVING COUNT(*) &gt; 1</code> lo esclude.</p>`,
      solution: `cur.execute("""
    SELECT autore, COUNT(*) AS n
    FROM libri
    GROUP BY autore
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
autori_prolifici = cur.fetchall()
print(autori_prolifici)`
    },

    {
      type: "exercise", id: "sql-26", kg: 25, title: "Massimale: report prezzo per genere e decennio",
      task: `<p>Su <code>libri</code>: raggruppa per <code>genere</code> E per decennio (calcolato con <code>(anno / 10) * 10</code>, divisione intera anche in SQL con numeri interi), conta quanti libri per combinazione.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, anno INTEGER, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"A",2015,"Giallo"), (2,"B",2020,"Fantasy"), (3,"C",2012,"Giallo"), (4,"D",2022,"Fantasy"), (5,"E",2011,"Storico"),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT genere, (anno / 10) * 10 AS decennio, COUNT(*) AS n
    FROM libri
    GROUP BY genere, decennio
    ORDER BY genere, decennio
""")
report = cur.fetchall()
print(report)`,
      check: `assert (("Giallo", 2010, 2) in report)
assert (("Fantasy", 2020, 2) in report)
assert (("Storico", 2010, 1) in report)`,
      hint: `<p><code>GROUP BY</code> con due espressioni crea un gruppo per ogni combinazione unica delle due, esattamente come <code>groupby(["a","b"])</code> in Pandas.</p>`,
      solution: `cur.execute("""
    SELECT genere, (anno / 10) * 10 AS decennio, COUNT(*) AS n
    FROM libri
    GROUP BY genere, decennio
    ORDER BY genere, decennio
""")
report = cur.fetchall()
print(report)`
    },

    {
      type: "exercise", id: "sql-27", kg: 25, title: "Massimale: pulizia e interrogazione",
      task: `<p>Su <code>libri</code> (con un prezzo NULL): 1) aggiorna i NULL con il prezzo medio dei non-NULL (subquery), 2) poi conta quanti libri superano 15 euro.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"A",12.0), (2,"B",None), (3,"C",20.0), (4,"D",16.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti (un prezzo e' NULL)
cur.execute("SELECT AVG(prezzo) FROM libri WHERE prezzo IS NOT NULL")
media = cur.fetchone()[0]

cur.execute("UPDATE libri SET prezzo = ? WHERE prezzo IS NULL", (media,))
con.commit()

cur.execute("SELECT COUNT(*) FROM libri WHERE prezzo > 15")
n_costosi = cur.fetchone()[0]
print(media, n_costosi)`,
      check: `assert abs(media - 16.0) < 1e-9
assert n_costosi == 3, "Dopo il fillna, i prezzi sono 12, 16, 20, 16: tre di questi superano 15"`,
      hint: `<p>La media dei 3 prezzi non-NULL è 16.0 — che diventa anche il prezzo del libro B: ora tre libri su quattro (16, 20, 16) superano la soglia di 15.</p>`,
      solution: `cur.execute("SELECT AVG(prezzo) FROM libri WHERE prezzo IS NOT NULL")
media = cur.fetchone()[0]

cur.execute("UPDATE libri SET prezzo = ? WHERE prezzo IS NULL", (media,))
con.commit()

cur.execute("SELECT COUNT(*) FROM libri WHERE prezzo > 15")
n_costosi = cur.fetchone()[0]
print(media, n_costosi)`
    },

    {
      type: "exercise", id: "sql-28", kg: 25, title: "Massimale: doppio filtro con subquery",
      task: `<p>Su <code>libri</code> e <code>prestiti</code>: <code>mai_prestati</code>, i titoli dei libri il cui <code>id</code> non compare mai in <code>prestiti.libro_id</code> (usa <code>WHERE id NOT IN (SELECT libro_id FROM prestiti)</code>).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?)", [(1,"A"),(2,"B"),(3,"C"),(4,"D")])
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?)", [(1,1),(2,3)])
con.commit()`,
      starter: `# con, cur, 'libri', 'prestiti' sono gia' pronti
cur.execute("""
    SELECT titolo FROM libri
    WHERE id NOT IN (SELECT libro_id FROM prestiti)
""")
mai_prestati = [r[0] for r in cur.fetchall()]
print(mai_prestati)`,
      check: `assert mai_prestati == ["B", "D"]`,
      hint: `<p><code>NOT IN (subquery)</code> è l'opposto di <code>IN</code>: tiene le righe il cui valore NON compare nell'elenco prodotto dalla subquery.</p>`,
      solution: `cur.execute("""
    SELECT titolo FROM libri
    WHERE id NOT IN (SELECT libro_id FROM prestiti)
""")
mai_prestati = [r[0] for r in cur.fetchall()]
print(mai_prestati)`
    },

    {
      type: "exercise", id: "sql-29", kg: 25, title: "Massimale: classifica prezzo con etichetta",
      task: `<p>Su <code>libri</code>: <code>report</code>, lista di (titolo, prezzo, fascia CASE WHEN) ordinata per prezzo decrescente, SOLO per la fascia "caro" (&gt;=15). Un'unica query con <code>WHERE</code> e <code>CASE</code> insieme.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL)")
cur.executemany("INSERT INTO libri VALUES (?,?,?)", [
 (1,"A",12.5), (2,"B",18.0), (3,"C",9.9), (4,"D",15.0), (5,"E",22.0),
])
con.commit()`,
      starter: `# con, cur, 'libri' sono gia' pronti
cur.execute("""
    SELECT titolo, prezzo, CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END AS fascia
    FROM libri
    WHERE prezzo >= 15
    ORDER BY prezzo DESC
""")
report = cur.fetchall()
print(report)`,
      check: `assert report == [("E", 22.0, "caro"), ("B", 18.0, "caro"), ("D", 15.0, "caro")]`,
      hint: `<p>Il <code>WHERE</code> filtra le righe prima ancora che vengano restituite; il <code>CASE</code> qui è quasi ridondante (tutte le righe rimaste sono "caro"), ma mostra che i due si possono combinare.</p>`,
      solution: `cur.execute("""
    SELECT titolo, prezzo, CASE WHEN prezzo >= 15 THEN 'caro' ELSE 'economico' END AS fascia
    FROM libri
    WHERE prezzo >= 15
    ORDER BY prezzo DESC
""")
report = cur.fetchall()
print(report)`
    },

    {
      type: "exercise", id: "sql-30", kg: 25, title: "Massimale finale: cruscotto biblioteca",
      task: `<p>Costruisci <code>cruscotto</code>, un dizionario con: <code>"totale_libri"</code>, <code>"prezzo_medio"</code>, <code>"genere_top"</code> (più libri), <code>"lettore_top"</code> (più prestiti), usando le tabelle <code>libri</code>, <code>prestiti</code>, <code>utenti</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE libri (id INTEGER, titolo TEXT, prezzo REAL, genere TEXT)")
cur.executemany("INSERT INTO libri VALUES (?,?,?,?)", [
 (1,"A",12.5,"Giallo"), (2,"B",18.0,"Fantasy"), (3,"C",9.9,"Giallo"), (4,"D",15.0,"Storico"),
])
cur.execute("CREATE TABLE utenti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO utenti VALUES (?,?)", [(1,"Anna"),(2,"Bo")])
cur.execute("CREATE TABLE prestiti (id INTEGER, libro_id INTEGER, utente_id INTEGER)")
cur.executemany("INSERT INTO prestiti VALUES (?,?,?)", [(1,1,1),(2,2,1),(3,3,2)])
con.commit()`,
      starter: `# con, cur, 'libri', 'utenti', 'prestiti' sono gia' pronti
cur.execute("SELECT COUNT(*), AVG(prezzo) FROM libri")
totale_libri, prezzo_medio = cur.fetchone()

cur.execute("SELECT genere FROM libri GROUP BY genere ORDER BY COUNT(*) DESC LIMIT 1")
genere_top = cur.fetchone()[0]

cur.execute("""
    SELECT u.nome FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    GROUP BY u.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
""")
lettore_top = cur.fetchone()[0]

cruscotto = {
    "totale_libri": totale_libri,
    "prezzo_medio": prezzo_medio,
    "genere_top": genere_top,
    "lettore_top": lettore_top,
}
print(cruscotto)`,
      check: `assert cruscotto["totale_libri"] == 4
assert abs(cruscotto["prezzo_medio"] - 13.85) < 1e-9
assert cruscotto["genere_top"] == "Giallo"
assert cruscotto["lettore_top"] == "Anna"`,
      hint: `<p>Un cruscotto è semplicemente la raccolta di più query indipendenti in un solo dizionario finale: nessuna tecnica nuova, solo la somma di tutto ciò che hai imparato in questa sala.</p>`,
      solution: `cur.execute("SELECT COUNT(*), AVG(prezzo) FROM libri")
totale_libri, prezzo_medio = cur.fetchone()

cur.execute("SELECT genere FROM libri GROUP BY genere ORDER BY COUNT(*) DESC LIMIT 1")
genere_top = cur.fetchone()[0]

cur.execute("""
    SELECT u.nome FROM prestiti p
    JOIN utenti u ON p.utente_id = u.id
    GROUP BY u.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
""")
lettore_top = cur.fetchone()[0]

cruscotto = {
    "totale_libri": totale_libri,
    "prezzo_medio": prezzo_medio,
    "genere_top": genere_top,
    "lettore_top": lettore_top,
}
print(cruscotto)`
    },

    {
      type: "exercise", id: "sql-31", kg: 5, title: "Drill: crea e popola dipendenti",
      task: `<p>Sulla connessione <code>con</code>: crea la tabella <code>dipendenti (id INTEGER, nome TEXT, stipendio INTEGER)</code>, inserisci 3 righe, poi <code>righe</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")`,
      starter: `cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, nome TEXT, stipendio INTEGER)")
cur.execute("INSERT INTO dipendenti VALUES (1, 'Ada', 2800)")
# aggiungi le altre due righe: (2, 'Bo', 3200), (3, 'Cin', 2600)
...
con.commit()

cur.execute("SELECT * FROM dipendenti")
righe = cur.fetchall()
print(righe)`,
      check: `assert righe == [(1, "Ada", 2800), (2, "Bo", 3200), (3, "Cin", 2600)]`,
      hint: `<p>Ripeti <code>cur.execute("INSERT INTO dipendenti VALUES (...)")</code> per ciascuna riga.</p>`,
      solution: `cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, nome TEXT, stipendio INTEGER)")
cur.execute("INSERT INTO dipendenti VALUES (1, 'Ada', 2800)")
cur.execute("INSERT INTO dipendenti VALUES (2, 'Bo', 3200)")
cur.execute("INSERT INTO dipendenti VALUES (3, 'Cin', 2600)")
con.commit()

cur.execute("SELECT * FROM dipendenti")
righe = cur.fetchall()
print(righe)`
    },

    {
      type: "exercise", id: "sql-32", kg: 10, title: "Drill: prodotti economici e cari",
      task: `<p>Su <code>prodotti</code>: <code>economici</code> (nomi con prezzo &lt; 10, ordinati per prezzo crescente), <code>cari_ordinati</code> (nome e prezzo con prezzo &gt;= 15, decrescente).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",15.0), (2,"B",8.0), (3,"C",22.0), (4,"D",5.0), (5,"E",12.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("SELECT nome FROM prodotti WHERE prezzo < 10 ORDER BY prezzo ASC")
economici = [r[0] for r in cur.fetchall()]

cur.execute("SELECT nome, prezzo FROM prodotti WHERE prezzo >= 15 ORDER BY prezzo DESC")
cari_ordinati = cur.fetchall()

print(economici)
print(cari_ordinati)`,
      check: `assert economici == ["D", "B"]
assert cari_ordinati == [("C", 22.0), ("A", 15.0)]`,
      hint: `<p>D (5.0) è più economico di B (8.0): l'ordine crescente li mette in quella sequenza.</p>`,
      solution: `cur.execute("SELECT nome FROM prodotti WHERE prezzo < 10 ORDER BY prezzo ASC")
economici = [r[0] for r in cur.fetchall()]

cur.execute("SELECT nome, prezzo FROM prodotti WHERE prezzo >= 15 ORDER BY prezzo DESC")
cari_ordinati = cur.fetchall()

print(economici)
print(cari_ordinati)`
    },

    {
      type: "exercise", id: "sql-33", kg: 10, title: "Drill: statistiche sugli ordini",
      task: `<p>Su <code>ordini</code>: <code>totale</code>, <code>importo_medio</code>, <code>importo_massimo</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE ordini (id INTEGER, cliente TEXT, importo REAL)")
cur.executemany("INSERT INTO ordini VALUES (?,?,?)", [
 (1,"x",50.0), (2,"y",80.0), (3,"x",30.0), (4,"z",100.0), (5,"y",20.0),
])
con.commit()`,
      starter: `# con, cur, 'ordini' sono gia' pronti
cur.execute("SELECT COUNT(*) FROM ordini")
totale = cur.fetchone()[0]

cur.execute("SELECT AVG(importo) FROM ordini")
importo_medio = cur.fetchone()[0]

cur.execute("SELECT MAX(importo) FROM ordini")
importo_massimo = cur.fetchone()[0]

print(totale, importo_medio, importo_massimo)`,
      check: `assert totale == 5
assert abs(importo_medio - 56.0) < 1e-6
assert importo_massimo == 100.0`,
      hint: `<p>Stesso schema di sempre: <code>COUNT</code>, <code>AVG</code>, <code>MAX</code>, ognuna con <code>fetchone()[0]</code>.</p>`,
      solution: `cur.execute("SELECT COUNT(*) FROM ordini")
totale = cur.fetchone()[0]

cur.execute("SELECT AVG(importo) FROM ordini")
importo_medio = cur.fetchone()[0]

cur.execute("SELECT MAX(importo) FROM ordini")
importo_massimo = cur.fetchone()[0]

print(totale, importo_medio, importo_massimo)`
    },

    {
      type: "exercise", id: "sql-34", kg: 15, title: "Drill: la categoria di ticket più comune",
      task: `<p>Su <code>ticket</code>: <code>per_categoria</code> (conteggi decrescenti), <code>categoria_top</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE ticket (id INTEGER, categoria TEXT)")
cur.executemany("INSERT INTO ticket VALUES (?,?)", [
 (1,"bug"),(2,"bug"),(3,"feature"),(4,"bug"),(5,"support"),(6,"feature"),(7,"bug"),(8,"support"),(9,"support"),
])
con.commit()`,
      starter: `# con, cur, 'ticket' sono gia' pronti
cur.execute("""
    SELECT categoria, COUNT(*) AS n
    FROM ticket
    GROUP BY categoria
    ORDER BY n DESC
""")
per_categoria = cur.fetchall()
categoria_top = per_categoria[0][0]

print(per_categoria)
print(categoria_top)`,
      check: `assert per_categoria == [("bug", 4), ("support", 3), ("feature", 2)]
assert categoria_top == "bug"`,
      hint: `<p><code>GROUP BY categoria</code> più <code>ORDER BY n DESC</code>: lo stesso schema del corso più gettonato.</p>`,
      solution: `cur.execute("""
    SELECT categoria, COUNT(*) AS n
    FROM ticket
    GROUP BY categoria
    ORDER BY n DESC
""")
per_categoria = cur.fetchall()
categoria_top = per_categoria[0][0]

print(per_categoria)
print(categoria_top)`
    },

    {
      type: "exercise", id: "sql-35", kg: 20, title: "Drill: dipendenti e reparti",
      task: `<p>Con <code>dipendenti</code> (id, nome, reparto_id) e <code>reparti</code> (id, nome): <code>accoppiati</code>, (nome dipendente, nome reparto), ordinato per nome dipendente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, nome TEXT, reparto_id INTEGER)")
cur.executemany("INSERT INTO dipendenti VALUES (?,?,?)", [(1,"Ada",1),(2,"Bo",2),(3,"Cin",1)])
cur.execute("CREATE TABLE reparti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO reparti VALUES (?,?)", [(1,"IT"),(2,"HR")])
con.commit()`,
      starter: `# con, cur, 'dipendenti' e 'reparti' sono gia' pronte
cur.execute("""
    SELECT d.nome, r.nome
    FROM dipendenti d
    JOIN reparti r ON d.reparto_id = r.id
    ORDER BY d.nome
""")
accoppiati = cur.fetchall()
print(accoppiati)`,
      check: `assert accoppiati == [("Ada", "IT"), ("Bo", "HR"), ("Cin", "IT")]`,
      hint: `<p><code>d.reparto_id = r.id</code>: la chiave di join collega la tabella dei dipendenti a quella dei reparti.</p>`,
      solution: `cur.execute("""
    SELECT d.nome, r.nome
    FROM dipendenti d
    JOIN reparti r ON d.reparto_id = r.id
    ORDER BY d.nome
""")
accoppiati = cur.fetchall()
print(accoppiati)`
    },

    {
      type: "exercise", id: "sql-36", kg: 20, title: "Drill: clienti con più ordini",
      task: `<p>Su <code>ordini</code> (colonna cliente): <code>frequenti</code>, i clienti con più di 1 ordine, con conteggio, ordinati decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE ordini (id INTEGER, cliente TEXT)")
cur.executemany("INSERT INTO ordini VALUES (?,?)", [
 (1,"x"),(2,"x"),(3,"y"),(4,"z"),(5,"x"),(6,"y"),
])
con.commit()`,
      starter: `# con, cur, 'ordini' sono gia' pronti
cur.execute("""
    SELECT cliente, COUNT(*) AS n
    FROM ordini
    GROUP BY cliente
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
frequenti = cur.fetchall()
print(frequenti)`,
      check: `assert frequenti == [("x", 3), ("y", 2)]`,
      hint: `<p><code>z</code> ha un solo ordine: <code>HAVING COUNT(*) &gt; 1</code> lo esclude.</p>`,
      solution: `cur.execute("""
    SELECT cliente, COUNT(*) AS n
    FROM ordini
    GROUP BY cliente
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
frequenti = cur.fetchall()
print(frequenti)`
    },

    {
      type: "exercise", id: "sql-37", kg: 10, title: "Drill: film con pattern nel titolo",
      task: `<p>Su <code>film</code>: <code>inizia_il</code>, i titoli che iniziano per <code>"Il "</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE film (id INTEGER, titolo TEXT)")
cur.executemany("INSERT INTO film VALUES (?,?)", [
 (1,"Il Ritorno"), (2,"La Fuga"), (3,"Il Ritorno 2"), (4,"Notte"),
])
con.commit()`,
      starter: `# con, cur, 'film' sono gia' pronti
cur.execute("SELECT titolo FROM film WHERE titolo LIKE 'Il %'")
inizia_il = [r[0] for r in cur.fetchall()]
print(inizia_il)`,
      check: `assert inizia_il == ["Il Ritorno", "Il Ritorno 2"]`,
      hint: `<p><code>LIKE 'Il %'</code>: il <code>%</code> finale permette qualsiasi cosa dopo "Il ".</p>`,
      solution: `cur.execute("SELECT titolo FROM film WHERE titolo LIKE 'Il %'")
inizia_il = [r[0] for r in cur.fetchall()]
print(inizia_il)`
    },

    {
      type: "exercise", id: "sql-38", kg: 10, title: "Drill: i film meglio votati",
      task: `<p>Su <code>film</code> (con voto): <code>top2</code>, i 2 titoli col voto più alto.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE film (id INTEGER, titolo TEXT, voto REAL)")
cur.executemany("INSERT INTO film VALUES (?,?,?)", [
 (1,"A",7.5), (2,"B",9.1), (3,"C",6.2), (4,"D",8.9),
])
con.commit()`,
      starter: `# con, cur, 'film' sono gia' pronti
cur.execute("SELECT titolo FROM film ORDER BY voto DESC LIMIT 2")
top2 = [r[0] for r in cur.fetchall()]
print(top2)`,
      check: `assert top2 == ["B", "D"]`,
      hint: `<p><code>ORDER BY voto DESC LIMIT 2</code>: ordina dal migliore, poi tronca a 2.</p>`,
      solution: `cur.execute("SELECT titolo FROM film ORDER BY voto DESC LIMIT 2")
top2 = [r[0] for r in cur.fetchall()]
print(top2)`
    },

    {
      type: "exercise", id: "sql-39", kg: 15, title: "Drill: sconto elettronica",
      task: `<p>Su <code>prodotti</code> (con categoria): sconta del 20% (<code>prezzo * 0.8</code>) solo <code>"elettronica"</code>, poi <code>prezzi_elettronica</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, categoria TEXT, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?,?)", [
 (1,"TV","elettronica",500.0), (2,"Sedia","arredo",80.0), (3,"Telefono","elettronica",300.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("UPDATE prodotti SET prezzo = prezzo * 0.8 WHERE categoria = 'elettronica'")
con.commit()

cur.execute("SELECT nome, prezzo FROM prodotti WHERE categoria = 'elettronica'")
prezzi_elettronica = cur.fetchall()
print(prezzi_elettronica)`,
      check: `assert prezzi_elettronica == [("TV", 400.0), ("Telefono", 240.0)]`,
      hint: `<p>500 × 0.8 = 400, 300 × 0.8 = 240.</p>`,
      solution: `cur.execute("UPDATE prodotti SET prezzo = prezzo * 0.8 WHERE categoria = 'elettronica'")
con.commit()

cur.execute("SELECT nome, prezzo FROM prodotti WHERE categoria = 'elettronica'")
prezzi_elettronica = cur.fetchall()
print(prezzi_elettronica)`
    },

    {
      type: "exercise", id: "sql-40", kg: 15, title: "Drill: elimina i prodotti esauriti",
      task: `<p>Su <code>prodotti</code> (con scorte): elimina quelli con <code>scorte = 0</code>, poi <code>rimasti</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, scorte INTEGER)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",0), (2,"B",15), (3,"C",0), (4,"D",5),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("DELETE FROM prodotti WHERE scorte = 0")
con.commit()

cur.execute("SELECT COUNT(*) FROM prodotti")
rimasti = cur.fetchone()[0]
print(rimasti)`,
      check: `assert rimasti == 2`,
      hint: `<p>A e C hanno scorte 0: <code>DELETE ... WHERE scorte = 0</code> li elimina entrambi.</p>`,
      solution: `cur.execute("DELETE FROM prodotti WHERE scorte = 0")
con.commit()

cur.execute("SELECT COUNT(*) FROM prodotti")
rimasti = cur.fetchone()[0]
print(rimasti)`
    },

    {
      type: "exercise", id: "sql-41", kg: 15, title: "Drill: promossi e bocciati",
      task: `<p>Su <code>studenti</code>: <code>fasce</code>, (nome, "promosso" se voto &gt;= 60 altrimenti "bocciato").</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE studenti (id INTEGER, nome TEXT, voto INTEGER)")
cur.executemany("INSERT INTO studenti VALUES (?,?,?)", [
 (1,"A",55), (2,"B",72), (3,"C",90), (4,"D",40),
])
con.commit()`,
      starter: `# con, cur, 'studenti' sono gia' pronti
cur.execute("""
    SELECT nome, CASE WHEN voto >= 60 THEN 'promosso' ELSE 'bocciato' END
    FROM studenti
""")
fasce = cur.fetchall()
print(fasce)`,
      check: `assert fasce == [("A","bocciato"), ("B","promosso"), ("C","promosso"), ("D","bocciato")]`,
      hint: `<p>55 e 40 sono sotto 60: bocciati. 72 e 90 sono promossi.</p>`,
      solution: `cur.execute("""
    SELECT nome, CASE WHEN voto >= 60 THEN 'promosso' ELSE 'bocciato' END
    FROM studenti
""")
fasce = cur.fetchall()
print(fasce)`
    },

    {
      type: "exercise", id: "sql-42", kg: 20, title: "Drill: stipendi sopra la media",
      task: `<p>Su <code>dipendenti</code>: <code>sopra_media</code>, i nomi con stipendio sopra la media di tutti.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, nome TEXT, stipendio REAL)")
cur.executemany("INSERT INTO dipendenti VALUES (?,?,?)", [
 (1,"A",2000.0), (2,"B",3500.0), (3,"C",2800.0), (4,"D",4200.0),
])
con.commit()`,
      starter: `# con, cur, 'dipendenti' sono gia' pronti
cur.execute("SELECT nome FROM dipendenti WHERE stipendio > (SELECT AVG(stipendio) FROM dipendenti)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`,
      check: `assert sopra_media == ["B", "D"], "Media = (2000+3500+2800+4200)/4 = 3125: solo B e D la superano"`,
      hint: `<p>La media è 3125: solo B (3500) e D (4200) la superano.</p>`,
      solution: `cur.execute("SELECT nome FROM dipendenti WHERE stipendio > (SELECT AVG(stipendio) FROM dipendenti)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`
    },

    {
      type: "exercise", id: "sql-43", kg: 25, title: "Massimale: incasso per reparto",
      task: `<p>Con <code>dipendenti</code> (id, nome, reparto) e <code>vendite</code> (dipendente_id, importo): <code>report</code>, incasso totale per reparto (JOIN + GROUP BY, decrescente), <code>reparto_top</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, nome TEXT, reparto TEXT)")
cur.executemany("INSERT INTO dipendenti VALUES (?,?,?)", [
 (1,"Ada","IT"), (2,"Bo","HR"), (3,"Cin","IT"), (4,"Dan","HR"),
])
cur.execute("CREATE TABLE vendite (dipendente_id INTEGER, importo REAL)")
cur.executemany("INSERT INTO vendite VALUES (?,?)", [
 (1,100.0), (1,50.0), (2,80.0), (3,120.0), (3,60.0), (4,40.0),
])
con.commit()`,
      starter: `# con, cur, 'dipendenti' e 'vendite' sono gia' pronte
cur.execute("""
    SELECT d.reparto, SUM(v.importo) AS n
    FROM dipendenti d
    JOIN vendite v ON d.id = v.dipendente_id
    GROUP BY d.reparto
    ORDER BY n DESC
""")
report = cur.fetchall()
reparto_top = report[0][0]

print(report)
print(reparto_top)`,
      check: `assert report == [("IT", 330.0), ("HR", 120.0)]
assert reparto_top == "IT"`,
      hint: `<p>IT: Ada (150) + Cin (180) = 330; HR: Bo (80) + Dan (40) = 120.</p>`,
      solution: `cur.execute("""
    SELECT d.reparto, SUM(v.importo) AS n
    FROM dipendenti d
    JOIN vendite v ON d.id = v.dipendente_id
    GROUP BY d.reparto
    ORDER BY n DESC
""")
report = cur.fetchall()
reparto_top = report[0][0]

print(report)
print(reparto_top)`
    },

    {
      type: "exercise", id: "sql-44", kg: 10, title: "Drill: categorie distinte",
      task: `<p>Su <code>prodotti</code>: <code>categorie</code>, le categorie distinte.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, categoria TEXT)")
cur.executemany("INSERT INTO prodotti VALUES (?,?)", [
 (1,"elettronica"), (2,"arredo"), (3,"elettronica"), (4,"giardino"), (5,"arredo"),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("SELECT DISTINCT categoria FROM prodotti")
categorie = cur.fetchall()
print(categorie)`,
      check: `assert set(c[0] for c in categorie) == {"elettronica", "arredo", "giardino"}`,
      hint: `<p><code>SELECT DISTINCT</code> elimina i duplicati dal risultato.</p>`,
      solution: `cur.execute("SELECT DISTINCT categoria FROM prodotti")
categorie = cur.fetchall()
print(categorie)`
    },

    {
      type: "exercise", id: "sql-45", kg: 10, title: "Drill: ordina per reparto e stipendio",
      task: `<p>Su <code>dipendenti</code>: <code>ordinati</code>, reparto e stipendio ordinati per reparto (alfabetico) e poi stipendio decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE dipendenti (id INTEGER, reparto TEXT, stipendio REAL)")
cur.executemany("INSERT INTO dipendenti VALUES (?,?,?)", [
 (1,"IT",3000.0), (2,"HR",2800.0), (3,"IT",3500.0), (4,"HR",3100.0),
])
con.commit()`,
      starter: `# con, cur, 'dipendenti' sono gia' pronti
cur.execute("SELECT reparto, stipendio FROM dipendenti ORDER BY reparto ASC, stipendio DESC")
ordinati = cur.fetchall()
print(ordinati)`,
      check: `assert ordinati[0] == ("HR", 3100.0)
assert ordinati[-1] == ("IT", 3000.0)`,
      hint: `<p>La seconda colonna dell'<code>ORDER BY</code> decide solo a parità della prima.</p>`,
      solution: `cur.execute("SELECT reparto, stipendio FROM dipendenti ORDER BY reparto ASC, stipendio DESC")
ordinati = cur.fetchall()
print(ordinati)`
    },

    {
      type: "exercise", id: "sql-46", kg: 15, title: "Drill: sconto sui piani pro",
      task: `<p>Su <code>abbonamenti</code>: dimezza il prezzo (<code>prezzo * 0.5</code>) solo per il piano <code>"pro"</code>, poi <code>prezzi_pro</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE abbonamenti (id INTEGER, piano TEXT, prezzo REAL)")
cur.executemany("INSERT INTO abbonamenti VALUES (?,?,?)", [
 (1,"pro",20.0), (2,"base",10.0), (3,"pro",20.0),
])
con.commit()`,
      starter: `# con, cur, 'abbonamenti' sono gia' pronti
cur.execute("UPDATE abbonamenti SET prezzo = prezzo * 0.5 WHERE piano = 'pro'")
con.commit()

cur.execute("SELECT prezzo FROM abbonamenti WHERE piano = 'pro'")
prezzi_pro = [r[0] for r in cur.fetchall()]
print(prezzi_pro)`,
      check: `assert prezzi_pro == [10.0, 10.0]`,
      hint: `<p>20 × 0.5 = 10, per entrambe le righe "pro".</p>`,
      solution: `cur.execute("UPDATE abbonamenti SET prezzo = prezzo * 0.5 WHERE piano = 'pro'")
con.commit()

cur.execute("SELECT prezzo FROM abbonamenti WHERE piano = 'pro'")
prezzi_pro = [r[0] for r in cur.fetchall()]
print(prezzi_pro)`
    },

    {
      type: "exercise", id: "sql-47", kg: 15, title: "Drill: elimina gli ordini annullati",
      task: `<p>Su <code>ordini</code> (con stato): elimina quelli <code>"annullato"</code>, poi <code>rimasti</code>.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE ordini (id INTEGER, stato TEXT)")
cur.executemany("INSERT INTO ordini VALUES (?,?)", [
 (1,"completato"), (2,"annullato"), (3,"completato"), (4,"annullato"),
])
con.commit()`,
      starter: `# con, cur, 'ordini' sono gia' pronti
cur.execute("DELETE FROM ordini WHERE stato = 'annullato'")
con.commit()

cur.execute("SELECT COUNT(*) FROM ordini")
rimasti = cur.fetchone()[0]
print(rimasti)`,
      check: `assert rimasti == 2`,
      hint: `<p>Due ordini sono "annullato": restano i due "completato".</p>`,
      solution: `cur.execute("DELETE FROM ordini WHERE stato = 'annullato'")
con.commit()

cur.execute("SELECT COUNT(*) FROM ordini")
rimasti = cur.fetchone()[0]
print(rimasti)`
    },

    {
      type: "exercise", id: "sql-48", kg: 15, title: "Drill: tre fasce di prezzo",
      task: `<p>Su <code>prodotti</code>: <code>fasce</code>, (nome, fascia) con <code>CASE</code>: <code>&lt;10</code> "basso", <code>&lt;30</code> "medio", altrimenti "alto".</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",5.0), (2,"B",25.0), (3,"C",15.0), (4,"D",50.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("""
    SELECT nome,
        CASE WHEN prezzo < 10 THEN 'basso' WHEN prezzo < 30 THEN 'medio' ELSE 'alto' END
    FROM prodotti
""")
fasce = cur.fetchall()
print(fasce)`,
      check: `assert fasce == [("A","basso"), ("B","medio"), ("C","medio"), ("D","alto")]`,
      hint: `<p>Il primo <code>WHEN</code> che risulta vero decide la categoria: 25 non è &lt;10, ma è &lt;30, quindi "medio".</p>`,
      solution: `cur.execute("""
    SELECT nome,
        CASE WHEN prezzo < 10 THEN 'basso' WHEN prezzo < 30 THEN 'medio' ELSE 'alto' END
    FROM prodotti
""")
fasce = cur.fetchall()
print(fasce)`
    },

    {
      type: "exercise", id: "sql-49", kg: 15, title: "Drill: quante città diverse",
      task: `<p>Su <code>clienti</code>: <code>n_citta</code>, il numero di città distinte.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE clienti (id INTEGER, citta TEXT)")
cur.executemany("INSERT INTO clienti VALUES (?,?)", [
 (1,"Roma"), (2,"Milano"), (3,"Roma"), (4,"Napoli"), (5,"Milano"), (6,"Roma"),
])
con.commit()`,
      starter: `# con, cur, 'clienti' sono gia' pronti
cur.execute("SELECT COUNT(DISTINCT citta) FROM clienti")
n_citta = cur.fetchone()[0]
print(n_citta)`,
      check: `assert n_citta == 3`,
      hint: `<p><code>COUNT(DISTINCT citta)</code> conta i valori distinti, non le righe.</p>`,
      solution: `cur.execute("SELECT COUNT(DISTINCT citta) FROM clienti")
n_citta = cur.fetchone()[0]
print(n_citta)`
    },

    {
      type: "exercise", id: "sql-50", kg: 20, title: "Drill: prezzi sopra la media, seconda versione",
      task: `<p>Su <code>prodotti</code>: <code>sopra_media</code>, i nomi con prezzo sopra la media.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",10.0), (2,"B",30.0), (3,"C",20.0), (4,"D",5.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("SELECT nome FROM prodotti WHERE prezzo > (SELECT AVG(prezzo) FROM prodotti)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`,
      check: `assert sopra_media == ["B", "C"], "Media = (10+30+20+5)/4 = 16.25: B e C la superano"`,
      hint: `<p>La media è 16.25: solo B (30) e C (20) la superano.</p>`,
      solution: `cur.execute("SELECT nome FROM prodotti WHERE prezzo > (SELECT AVG(prezzo) FROM prodotti)")
sopra_media = [r[0] for r in cur.fetchall()]
print(sopra_media)`
    },

    {
      type: "exercise", id: "sql-51", kg: 20, title: "Drill: vendite per regione",
      task: `<p>Su <code>vendite</code>: <code>per_regione</code>, conteggio e media importo per regione.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE vendite (id INTEGER, regione TEXT, importo REAL)")
cur.executemany("INSERT INTO vendite VALUES (?,?,?)", [
 (1,"Nord",100.0), (2,"Nord",200.0), (3,"Sud",50.0), (4,"Sud",70.0), (5,"Sud",90.0),
])
con.commit()`,
      starter: `# con, cur, 'vendite' sono gia' pronti
cur.execute("""
    SELECT regione, COUNT(*) AS n, AVG(importo) AS media
    FROM vendite
    GROUP BY regione
    ORDER BY regione
""")
per_regione = cur.fetchall()
print(per_regione)`,
      check: `assert per_regione == [("Nord", 2, 150.0), ("Sud", 3, 70.0)]`,
      hint: `<p>Nord: (100+200)/2=150. Sud: (50+70+90)/3=70.</p>`,
      solution: `cur.execute("""
    SELECT regione, COUNT(*) AS n, AVG(importo) AS media
    FROM vendite
    GROUP BY regione
    ORDER BY regione
""")
per_regione = cur.fetchall()
print(per_regione)`
    },

    {
      type: "exercise", id: "sql-52", kg: 20, title: "Drill: categorie con più di 2 prodotti",
      task: `<p>Su <code>prodotti</code> (colonna categoria): <code>frequenti</code>, categorie con più di 2 prodotti.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, categoria TEXT)")
cur.executemany("INSERT INTO prodotti VALUES (?,?)", [
 (1,"A"),(2,"A"),(3,"A"),(4,"B"),(5,"B"),(6,"C"),(7,"A"),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("""
    SELECT categoria, COUNT(*) AS n
    FROM prodotti
    GROUP BY categoria
    HAVING COUNT(*) > 2
""")
frequenti = cur.fetchall()
print(frequenti)`,
      check: `assert frequenti == [("A", 4)]`,
      hint: `<p>Solo "A" (4 prodotti) supera la soglia di 2; B (2) e C (1) restano fuori.</p>`,
      solution: `cur.execute("""
    SELECT categoria, COUNT(*) AS n
    FROM prodotti
    GROUP BY categoria
    HAVING COUNT(*) > 2
""")
frequenti = cur.fetchall()
print(frequenti)`
    },

    {
      type: "exercise", id: "sql-53", kg: 20, title: "Combo: chi ha comprato cosa",
      task: `<p>Con <code>clienti</code>, <code>ordini</code> (cliente_id, prodotto_id) e <code>prodotti</code>: <code>acquisti</code>, (nome cliente, nome prodotto), ordinato per cliente e poi prodotto.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE clienti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO clienti VALUES (?,?)", [(1,"Ana"),(2,"Bo")])
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO prodotti VALUES (?,?)", [(1,"Sedia"),(2,"Tavolo")])
cur.execute("CREATE TABLE ordini (id INTEGER, cliente_id INTEGER, prodotto_id INTEGER)")
cur.executemany("INSERT INTO ordini VALUES (?,?,?)", [(1,1,1),(2,1,2),(3,2,1)])
con.commit()`,
      starter: `# con, cur, 'clienti', 'prodotti', 'ordini' sono gia' pronte
cur.execute("""
    SELECT c.nome, p.nome
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    JOIN prodotti p ON o.prodotto_id = p.id
    ORDER BY c.nome, p.nome
""")
acquisti = cur.fetchall()
print(acquisti)`,
      check: `assert acquisti == [("Ana","Sedia"), ("Ana","Tavolo"), ("Bo","Sedia")]`,
      hint: `<p>Due JOIN in fila: prima colleghi ordini a clienti, poi lo stesso risultato a prodotti.</p>`,
      solution: `cur.execute("""
    SELECT c.nome, p.nome
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    JOIN prodotti p ON o.prodotto_id = p.id
    ORDER BY c.nome, p.nome
""")
acquisti = cur.fetchall()
print(acquisti)`
    },

    {
      type: "exercise", id: "sql-54", kg: 20, title: "Combo: il cliente che spende di più",
      task: `<p>Con <code>clienti</code> e <code>ordini</code> (cliente_id, importo): <code>cliente_top</code>, il nome del cliente con la spesa totale più alta.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE clienti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO clienti VALUES (?,?)", [(1,"Ana"),(2,"Bo")])
cur.execute("CREATE TABLE ordini (id INTEGER, cliente_id INTEGER, importo REAL)")
cur.executemany("INSERT INTO ordini VALUES (?,?,?)", [(1,1,50.0),(2,2,80.0),(3,1,70.0),(4,2,20.0)])
con.commit()`,
      starter: `# con, cur, 'clienti' e 'ordini' sono gia' pronte
cur.execute("""
    SELECT c.nome, SUM(o.importo) AS n
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    GROUP BY c.nome
    ORDER BY n DESC
    LIMIT 1
""")
cliente_top = cur.fetchone()[0]
print(cliente_top)`,
      check: `assert cliente_top == "Ana", "Ana: 50+70=120; Bo: 80+20=100 — Ana vince"`,
      hint: `<p>Ana totalizza 120 (50+70), Bo 100 (80+20): Ana vince.</p>`,
      solution: `cur.execute("""
    SELECT c.nome, SUM(o.importo) AS n
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    GROUP BY c.nome
    ORDER BY n DESC
    LIMIT 1
""")
cliente_top = cur.fetchone()[0]
print(cliente_top)`
    },

    {
      type: "exercise", id: "sql-55", kg: 20, title: "Combo: conta e poi ripristina lo stock",
      task: `<p>Su <code>prodotti</code> (con scorte): <code>quanti_esauriti</code> (conteggio PRIMA di aggiornare), poi aggiorna a 10 le scorte dei prodotti esauriti.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, scorte INTEGER)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",5), (2,"B",0), (3,"C",12), (4,"D",0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("SELECT COUNT(*) FROM prodotti WHERE scorte = 0")
quanti_esauriti = cur.fetchone()[0]

cur.execute("UPDATE prodotti SET scorte = 10 WHERE scorte = 0")
con.commit()

print(quanti_esauriti)`,
      check: `assert quanti_esauriti == 2`,
      hint: `<p>Conta PRIMA di aggiornare: dopo l'UPDATE, la condizione <code>scorte = 0</code> non troverebbe più nessuna riga.</p>`,
      solution: `cur.execute("SELECT COUNT(*) FROM prodotti WHERE scorte = 0")
quanti_esauriti = cur.fetchone()[0]

cur.execute("UPDATE prodotti SET scorte = 10 WHERE scorte = 0")
con.commit()

print(quanti_esauriti)`
    },

    {
      type: "exercise", id: "sql-56", kg: 20, title: "Combo: conteggio per fascia con CASE",
      task: `<p>Su <code>prodotti</code>: <code>conteggio_fasce</code>, quanti prodotti per fascia (<code>&lt;10</code> basso, <code>&lt;25</code> medio, altrimenti alto).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?)", [
 (1,5.0), (2,15.0), (3,25.0), (4,8.0), (5,30.0), (6,12.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("""
    SELECT
        CASE WHEN prezzo < 10 THEN 'basso' WHEN prezzo < 25 THEN 'medio' ELSE 'alto' END AS fascia,
        COUNT(*) AS n
    FROM prodotti
    GROUP BY fascia
""")
conteggio_fasce = dict(cur.fetchall())
print(conteggio_fasce)`,
      check: `assert conteggio_fasce == {"basso": 2, "medio": 2, "alto": 2}`,
      hint: `<p>5 e 8 sono "basso"; 15 e 12 sono "medio"; 25 e 30 sono "alto" (25 non è &lt;25, quindi cade nell'ELSE).</p>`,
      solution: `cur.execute("""
    SELECT
        CASE WHEN prezzo < 10 THEN 'basso' WHEN prezzo < 25 THEN 'medio' ELSE 'alto' END AS fascia,
        COUNT(*) AS n
    FROM prodotti
    GROUP BY fascia
""")
conteggio_fasce = dict(cur.fetchall())
print(conteggio_fasce)`
    },

    {
      type: "exercise", id: "sql-57", kg: 25, title: "Combo: i clienti che non hanno mai ordinato",
      task: `<p>Con <code>clienti</code> e <code>ordini</code> (cliente_id): <code>mai_ordinato</code>, i nomi senza nessun ordine.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE clienti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO clienti VALUES (?,?)", [(1,"Ana"),(2,"Bo"),(3,"Cin"),(4,"Dan")])
cur.execute("CREATE TABLE ordini (id INTEGER, cliente_id INTEGER)")
cur.executemany("INSERT INTO ordini VALUES (?,?)", [(1,1),(2,3)])
con.commit()`,
      starter: `# con, cur, 'clienti' e 'ordini' sono gia' pronte
cur.execute("""
    SELECT c.nome
    FROM clienti c
    LEFT JOIN ordini o ON c.id = o.cliente_id
    WHERE o.id IS NULL
""")
mai_ordinato = [r[0] for r in cur.fetchall()]
print(mai_ordinato)`,
      check: `assert mai_ordinato == ["Bo", "Dan"]`,
      hint: `<p>Ana e Cin hanno un ordine (compaiono in <code>ordini</code>); Bo e Dan no: il <code>LEFT JOIN</code> lascia <code>o.id</code> a NULL per loro.</p>`,
      solution: `cur.execute("""
    SELECT c.nome
    FROM clienti c
    LEFT JOIN ordini o ON c.id = o.cliente_id
    WHERE o.id IS NULL
""")
mai_ordinato = [r[0] for r in cur.fetchall()]
print(mai_ordinato)`
    },

    {
      type: "exercise", id: "sql-58", kg: 25, title: "Combo: la categoria col prezzo medio più alto",
      task: `<p>Su <code>prodotti</code>: <code>categoria_top</code>, quella con prezzo medio più alto.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, categoria TEXT, prezzo REAL)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?)", [
 (1,"A",10.0), (2,"A",20.0), (3,"B",50.0), (4,"B",60.0), (5,"C",5.0),
])
con.commit()`,
      starter: `# con, cur, 'prodotti' sono gia' pronti
cur.execute("""
    SELECT categoria, AVG(prezzo) AS media
    FROM prodotti
    GROUP BY categoria
    ORDER BY media DESC
    LIMIT 1
""")
categoria_top = cur.fetchone()[0]
print(categoria_top)`,
      check: `assert categoria_top == "B"`,
      hint: `<p>A ha media 15, B ha media 55, C ha media 5: B vince nettamente.</p>`,
      solution: `cur.execute("""
    SELECT categoria, AVG(prezzo) AS media
    FROM prodotti
    GROUP BY categoria
    ORDER BY media DESC
    LIMIT 1
""")
categoria_top = cur.fetchone()[0]
print(categoria_top)`
    },

    {
      type: "exercise", id: "sql-59", kg: 25, title: "Combo: dipendenti su più progetti",
      task: `<p>Su <code>assegnazioni</code> (dipendente, progetto): <code>multi_progetto</code>, i dipendenti assegnati a più di 1 progetto, con conteggio decrescente.</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE assegnazioni (dipendente TEXT, progetto TEXT)")
cur.executemany("INSERT INTO assegnazioni VALUES (?,?)", [
 ("Ana","p1"), ("Ana","p2"), ("Bo","p1"), ("Cin","p1"), ("Cin","p2"), ("Cin","p3"),
])
con.commit()`,
      starter: `# con, cur, 'assegnazioni' sono gia' pronte
cur.execute("""
    SELECT dipendente, COUNT(*) AS n
    FROM assegnazioni
    GROUP BY dipendente
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
multi_progetto = cur.fetchall()
print(multi_progetto)`,
      check: `assert multi_progetto == [("Cin", 3), ("Ana", 2)]`,
      hint: `<p>Bo ha un solo progetto: <code>HAVING COUNT(*) &gt; 1</code> lo esclude.</p>`,
      solution: `cur.execute("""
    SELECT dipendente, COUNT(*) AS n
    FROM assegnazioni
    GROUP BY dipendente
    HAVING COUNT(*) > 1
    ORDER BY n DESC
""")
multi_progetto = cur.fetchall()
print(multi_progetto)`
    },

    {
      type: "exercise", id: "sql-60", kg: 25, title: "Massimale finale: cruscotto del negozio",
      task: `<p>Con <code>prodotti</code>, <code>clienti</code> e <code>ordini</code> (prodotto_id, cliente_id): costruisci <code>cruscotto</code> con <code>"totale_prodotti"</code>, <code>"prezzo_medio"</code>, <code>"categoria_top"</code> (più prodotti), <code>"cliente_top"</code> (più ordini).</p>`,
      setup: `import sqlite3
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE prodotti (id INTEGER, nome TEXT, prezzo REAL, categoria TEXT)")
cur.executemany("INSERT INTO prodotti VALUES (?,?,?,?)", [
 (1,"A",10.0,"elettronica"), (2,"B",20.0,"arredo"), (3,"C",15.0,"elettronica"),
 (4,"D",5.0,"arredo"), (5,"E",8.0,"elettronica"),
])
cur.execute("CREATE TABLE clienti (id INTEGER, nome TEXT)")
cur.executemany("INSERT INTO clienti VALUES (?,?)", [(1,"Ana"),(2,"Bo")])
cur.execute("CREATE TABLE ordini (id INTEGER, prodotto_id INTEGER, cliente_id INTEGER)")
cur.executemany("INSERT INTO ordini VALUES (?,?,?)", [(1,1,1),(2,2,1),(3,3,2)])
con.commit()`,
      starter: `# con, cur, 'prodotti', 'clienti', 'ordini' sono gia' pronte
cur.execute("SELECT COUNT(*), AVG(prezzo) FROM prodotti")
totale_prodotti, prezzo_medio = cur.fetchone()

cur.execute("SELECT categoria FROM prodotti GROUP BY categoria ORDER BY COUNT(*) DESC LIMIT 1")
categoria_top = cur.fetchone()[0]

cur.execute("""
    SELECT c.nome FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    GROUP BY c.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
""")
cliente_top = cur.fetchone()[0]

cruscotto = {
    "totale_prodotti": totale_prodotti,
    "prezzo_medio": prezzo_medio,
    "categoria_top": categoria_top,
    "cliente_top": cliente_top,
}
print(cruscotto)`,
      check: `assert cruscotto["totale_prodotti"] == 5
assert abs(cruscotto["prezzo_medio"] - 11.6) < 1e-9
assert cruscotto["categoria_top"] == "elettronica"
assert cruscotto["cliente_top"] == "Ana"`,
      hint: `<p>elettronica ha 3 prodotti contro i 2 di arredo; Ana ha 2 ordini contro l'1 di Bo.</p>`,
      solution: `cur.execute("SELECT COUNT(*), AVG(prezzo) FROM prodotti")
totale_prodotti, prezzo_medio = cur.fetchone()

cur.execute("SELECT categoria FROM prodotti GROUP BY categoria ORDER BY COUNT(*) DESC LIMIT 1")
categoria_top = cur.fetchone()[0]

cur.execute("""
    SELECT c.nome FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    GROUP BY c.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
""")
cliente_top = cur.fetchone()[0]

cruscotto = {
    "totale_prodotti": totale_prodotti,
    "prezzo_medio": prezzo_medio,
    "categoria_top": categoria_top,
    "cliente_top": cliente_top,
}
print(cruscotto)`
    }
  ]
});
