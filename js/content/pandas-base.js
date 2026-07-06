window.MODULES.push({
  id: "pandas-base",
  name: "Pandas · Fondamenta",
  tagline: "La zona funzionale: DataFrame, selezione, filtri. Dove i dati diventano tabelle che rispondono.",
  intro: "Pandas è il tavolo da lavoro della data science: tabelle con colonne nominate, filtri leggibili, statistiche in una riga. Gli esercizi usano il registro allenamenti della palestra stessa — ma i gesti sono identici su un dataset aziendale da un milione di righe.",
  packages: ["pandas"],
  items: [

    { type: "theory", title: "DataFrame e Series", html: `
<p>Il <strong>DataFrame</strong> è una tabella: righe = osservazioni, colonne = variabili. Ogni colonna è una <strong>Series</strong> (un array NumPy con etichette). Il modo più semplice di crearne uno è da un dizionario di liste:</p>
<pre><code>import pandas as pd
df = pd.DataFrame({
    "esercizio": ["squat", "panca", "stacco"],
    "kg":        [80, 60, 100],
})
df.shape     # (3, 2) — righe, colonne
df.columns   # i nomi delle colonne
df.head()    # le prime righe
df["kg"]     # una colonna → Series</code></pre>
<p>Riflesso da allenare subito: appena hai un DataFrame davanti, guarda <code>shape</code>, <code>head()</code> e <code>dtypes</code>. Sempre.</p>
`, more: `
<p>Un DataFrame è costruito su NumPy: ogni colonna è internamente un <code>ndarray</code> (o una struttura simile), il che spiega perché tanta sintassi vista nella sala NumPy (slicing, maschere booleane, <code>axis</code>) ritorna quasi identica qui. La differenza fondamentale è che Pandas aggiunge <strong>etichette</strong> (nomi di colonna, indice di riga) sopra quei blocchi numerici — è "NumPy con nomi", pensato per dati eterogenei (colonne di tipo diverso: testo, numeri, date) invece che per matrici omogenee.</p>
<p>Il modo più comune di creare un DataFrame nella pratica non è da un dizionario scritto a mano (come in questo primo esercizio) ma da un file: <code>pd.read_csv</code>, <code>pd.read_excel</code>, <code>pd.read_json</code>, <code>pd.read_sql</code> — la sala li introdurrà tra poco. Un dizionario di liste resta comunque il modo più chiaro per costruire ESEMPI piccoli e controllati, come quelli di questa palestra.</p>
<p><code>df.info()</code> (non ancora usato in questa sala, ma utilissimo) riassume in un colpo solo shape, dtypes e conteggio di valori non-nulli per colonna — spesso il primo comando da lanciare su un DataFrame sconosciuto, prima ancora di <code>head()</code>.</p>
` },

    {
      type: "exercise", id: "pd-01", kg: 5, title: "Monta il tavolo",
      task: `<p>Costruisci il DataFrame <code>df</code> con tre colonne: <code>esercizio</code> (<code>"squat", "panca", "stacco"</code>), <code>kg</code> (<code>80, 60, 100</code>) e <code>serie</code> (<code>4, 4, 3</code>). Poi crea:</p>
<ul>
<li><code>n_righe</code>: il numero di righe, letto da <code>df.shape</code></li>
<li><code>colonna_kg</code>: la Series della colonna <code>kg</code></li>
</ul>`,
      starter: `import pandas as pd

df = ...

n_righe = ...
colonna_kg = ...

print(df)`,
      check: `import pandas as pd
assert 'df' in globals() and isinstance(df, pd.DataFrame), "df deve essere un DataFrame"
assert sorted(df.columns) == ["esercizio", "kg", "serie"], "Le colonne devono chiamarsi esercizio, kg, serie"
assert 'n_righe' in globals() and n_righe == 3, "n_righe deve essere 3: df.shape[0]"
assert 'colonna_kg' in globals() and isinstance(colonna_kg, pd.Series) and colonna_kg.tolist() == [80, 60, 100], "colonna_kg deve essere la Series df['kg']"`,
      hint: `<p><code>pd.DataFrame({"esercizio": [...], "kg": [...], "serie": [...]})</code> — un dizionario di liste della stessa lunghezza.</p>`,
      solution: `import pandas as pd

df = pd.DataFrame({
    "esercizio": ["squat", "panca", "stacco"],
    "kg": [80, 60, 100],
    "serie": [4, 4, 3],
})

n_righe = df.shape[0]
colonna_kg = df["kg"]

print(df)`
    },

    { type: "theory", title: "Leggere un CSV", html: `
<p>Nella vita reale i dati arrivano da file: <code>pd.read_csv("allenamenti.csv")</code>. Qui in palestra il "file" è una stringa passata tramite <code>io.StringIO</code>, ma l'oggetto risultante è identico.</p>
<pre><code>df = pd.read_csv("misure.csv")
df.dtypes    # tipo di ogni colonna: pandas li indovina dal contenuto
len(df)      # numero di righe
df["kg"].mean()   # le colonne numeriche sanno fare statistica</code></pre>
<p>Controlla <strong>sempre</strong> <code>dtypes</code> dopo la lettura: una colonna numerica letta come testo (perché contiene un refuso) è il classico bug silenzioso.</p>
`, more: `
<p><code>read_csv</code> ha decine di parametri opzionali per gestire file "sporchi" della vita reale: <code>sep=";"</code> se il separatore non è la virgola (comune nei CSV europei), <code>decimal=","</code> per la virgola decimale, <code>encoding="latin-1"</code> quando il file non è in UTF-8 (causa tipica di caratteri accentati che appaiono come simboli strani), <code>na_values=["N/D", "-"]</code> per dire esplicitamente quali stringhe vanno lette come dati mancanti invece che come testo letterale.</p>
<p>Per file molto grandi che non stanno comodamente in memoria, <code>read_csv</code> supporta <code>chunksize=10000</code>: invece di caricare tutto in un colpo, restituisce un iteratore che produce il file a pezzi da 10.000 righe, permettendo di elaborarlo progressivamente senza esaurire la RAM — una tecnica che diventa rilevante ben oltre le dimensioni di questa palestra, ma buona da sapere che esiste.</p>
<p>Un'abitudine da costruire fin da subito: dopo ogni <code>read_csv</code>, prima ancora di iniziare l'analisi, chiediti "questo numero di righe ha senso? questi tipi sono quelli attesi? ci sono colonne che dovrebbero essere numeriche ma sono lette come testo?" — la maggior parte dei bug di analisi dati nasce da un file letto in modo silenziosamente sbagliato, non da un errore nella logica di analisi vera e propria.</p>
` },

    {
      type: "exercise", id: "pd-02", kg: 5, title: "Scarico merci",
      task: `<p>Il CSV <code>dati</code> è già pronto (un registro allenamenti). Leggi e ispeziona:</p>
<ul>
<li><code>df</code>: il DataFrame letto con <code>pd.read_csv(dati)</code></li>
<li><code>n</code>: il numero di righe</li>
<li><code>kg_medio</code>: la media della colonna <code>kg</code></li>
</ul>`,
      setup: `import io
dati = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")`,
      starter: `import pandas as pd
# 'dati' e' gia' pronto: passalo a pd.read_csv come fosse un file

df = ...
n = ...
kg_medio = ...

print(df.head())
print(n, kg_medio)`,
      check: `import pandas as pd
assert 'df' in globals() and isinstance(df, pd.DataFrame) and df.shape == (6, 4), "df deve avere 6 righe e 4 colonne: pd.read_csv(dati)"
assert 'n' in globals() and n == 6, "n deve essere 6: len(df) o df.shape[0]"
assert 'kg_medio' in globals() and abs(float(kg_medio) - 531.6666666667) < 1e-6, "kg_medio: df['kg'].mean()"`,
      hint: `<p><code>pd.read_csv(dati)</code> e basta — StringIO si comporta come un file aperto. Poi <code>len(df)</code> e <code>df["kg"].mean()</code>.</p>`,
      solution: `import pandas as pd

df = pd.read_csv(dati)
n = len(df)
kg_medio = df["kg"].mean()

print(df.head())
print(n, kg_medio)`
    },

    { type: "theory", title: "Selezionare: colonne, loc e iloc", html: `
<p>Tre gesti di presa distinti:</p>
<pre><code>df["kg"]                  # una colonna → Series
df[["esercizio", "kg"]]   # piu' colonne (nota la doppia parentesi!) → DataFrame
df.loc[3, "kg"]           # per ETICHETTA: riga con indice 3, colonna "kg"
df.iloc[0, 1]             # per POSIZIONE: prima riga, seconda colonna
df.iloc[:3]               # prime 3 righe (slicing posizionale)</code></pre>
<p><code>loc</code> usa le etichette dell'indice, <code>iloc</code> i numeri di posizione — coincidono finché l'indice è 0,1,2…, ma dopo un filtro o un ordinamento <strong>divergono</strong>, ed è lì che nascono i bug. Regola di palestra: posizione → <code>iloc</code>, etichetta/condizione → <code>loc</code>.</p>
`, more: `
<p>L'indice di un DataFrame non deve per forza essere una sequenza di interi 0,1,2...: può essere impostato su una colonna significativa con <code>df.set_index("id_cliente")</code>, dopodiché <code>df.loc["cliente_42"]</code> recupera la riga per quell'etichetta specifica, non per posizione. Questo è il caso d'uso "vero" di <code>loc</code>: accesso per CHIAVE significativa, non solo per numero — l'indice di default (0,1,2...) è solo il caso più semplice, non l'unico.</p>
<p>Uno slicing con <code>loc</code> su etichette si comporta diversamente da uno slicing con <code>iloc</code> su un dettaglio sottile: <code>df.loc[2:5]</code> INCLUDE l'etichetta 5 (l'estremo destro è compreso, a differenza dello slicing Python normale), mentre <code>df.iloc[2:5]</code> la ESCLUDE (segue la stessa regola dello slicing di liste vista nel riscaldamento). È un'asimmetria che sorprende molti principianti e vale la pena memorizzare esplicitamente.</p>
<p><code>df.at[etichetta, colonna]</code> e <code>df.iat[pos_riga, pos_colonna]</code> sono le versioni "scalari" di <code>loc</code>/<code>iloc</code>: leggermente più veloci quando sai per certo di voler leggere/scrivere UN SOLO valore, non un intervallo — un'ottimizzazione che conta su cicli ripetuti migliaia di volte, trascurabile altrimenti.</p>
` },

    {
      type: "exercise", id: "pd-03", kg: 10, title: "Prese di precisione",
      task: `<p>Sul DataFrame <code>df</code> (già caricato, stesso dei precedenti):</p>
<ul>
<li><code>sotto_tabella</code>: DataFrame con solo le colonne <code>esercizio</code> e <code>durata</code></li>
<li><code>terza_riga</code>: la riga in <strong>posizione</strong> 2 (usa <code>iloc</code>)</li>
<li><code>rip_di_trazioni</code>: il valore di <code>ripetizioni</code> della riga con indice 1 (usa <code>loc</code>)</li>
</ul>`,
      setup: `import io
import pandas as pd
_csv = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")
df = pd.read_csv(_csv)`,
      starter: `# df e' gia' caricato
print(df)

sotto_tabella = ...
terza_riga = ...
rip_di_trazioni = ...`,
      check: `import pandas as pd
assert 'sotto_tabella' in globals() and isinstance(sotto_tabella, pd.DataFrame) and list(sotto_tabella.columns) == ["esercizio", "durata"], "sotto_tabella: df[['esercizio', 'durata']] — lista dentro le parentesi"
assert 'terza_riga' in globals() and terza_riga["esercizio"] == "affondi", "terza_riga deve essere la riga di 'affondi': df.iloc[2]"
assert 'rip_di_trazioni' in globals() and int(rip_di_trazioni) == 12, "rip_di_trazioni deve essere 12: df.loc[1, 'ripetizioni']"`,
      hint: `<p>Più colonne = lista di nomi dentro le quadre: <code>df[["esercizio", "durata"]]</code>. Per il valore singolo: <code>df.loc[1, "ripetizioni"]</code>.</p>`,
      solution: `print(df)

sotto_tabella = df[["esercizio", "durata"]]
terza_riga = df.iloc[2]
rip_di_trazioni = df.loc[1, "ripetizioni"]`
    },

    { type: "theory", title: "Filtri booleani sul DataFrame", html: `
<p>Come in NumPy, una condizione produce una maschera e la maschera seleziona le righe:</p>
<pre><code>df[df["durata"] &gt; 80]                # righe con durata > 80
df[(df["kg"] &gt; 400) &amp; (df["durata"] &lt; 100)]   # E logico: parentesi obbligatorie
df[df["esercizio"].isin(["squat", "stacco"])]     # appartenenza a un insieme
df.loc[df["durata"] &gt; 80, "esercizio"]   # filtro righe + scelta colonna insieme</code></pre>
<p>Nota l'ultima forma: <code>.loc[maschera, colonna]</code> filtra e seleziona in un colpo solo — più pulita di due passaggi separati e indispensabile quando vorrai <em>modificare</em> i valori filtrati.</p>
`, more: `
<p>Un errore classico che Pandas segnala con un avviso (<code>SettingWithCopyWarning</code>) è scrivere <code>df[df["kg"] > 400]["nuova"] = 1</code>: il primo <code>[...]</code> può restituire una VISTA o una COPIA a seconda dei casi, e Pandas non lo garantisce — il risultato dell'assegnazione può essere silenziosamente perso. La forma corretta e affidabile è sempre <code>df.loc[df["kg"] > 400, "nuova"] = 1</code>, che filtra righe e assegna la colonna in un solo passaggio esplicito, senza ambiguità sulla vista.</p>
<p>Le maschere booleane si combinano con gli stessi operatori visti in NumPy: <code>&amp;</code> (e), <code>|</code> (o), <code>~</code> (negazione) — MAI le parole Python <code>and</code>/<code>or</code>/<code>not</code>, che su una Series intera sollevano un errore (<code>ValueError: truth value of a Series is ambiguous</code>) perché Python non sa come convertire un intero array di booleani in un singolo True/False.</p>
<p><code>df["esercizio"].isin([...])</code> è l'equivalente vettorizzato di scrivere <code>(df["esercizio"] == "squat") | (df["esercizio"] == "stacco") | ...</code>: stessa idea del riscaldamento (appartenenza a un insieme), ma applicata colonna per colonna invece che elemento per elemento su una lista Python.</p>
` },

    {
      type: "exercise", id: "pd-04", kg: 10, title: "Dogana delle righe",
      task: `<p>Sempre sul <code>df</code> del registro allenamenti (già caricato):</p>
<ul>
<li><code>lunghe</code>: le righe con <code>durata</code> maggiore di 80</li>
<li><code>pesanti_lunghe</code>: le righe con <code>kg &gt; 600</code> <strong>e</strong> <code>durata &gt; 90</code></li>
<li><code>esercizi_lunghi</code>: solo la colonna <code>esercizio</code> delle righe con durata &gt; 80 (usa <code>.loc</code>)</li>
</ul>`,
      setup: `import io
import pandas as pd
_csv = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")
df = pd.read_csv(_csv)`,
      starter: `# df e' gia' caricato
lunghe = ...
pesanti_lunghe = ...
esercizi_lunghi = ...

print(lunghe)
print(esercizi_lunghi.tolist())`,
      check: `import pandas as pd
assert 'lunghe' in globals() and len(lunghe) == 4, "lunghe deve avere 4 righe (durate 95, 84, 88, 102)"
assert 'pesanti_lunghe' in globals() and len(pesanti_lunghe) == 2 and set(pesanti_lunghe["esercizio"]) == {"squat"}, "pesanti_lunghe: i due 'squat' — (df['kg'] > 600) & (df['durata'] > 90), con le parentesi"
assert 'esercizi_lunghi' in globals() and isinstance(esercizi_lunghi, pd.Series) and esercizi_lunghi.tolist() == ["squat", "panca", "stacco", "squat"], "esercizi_lunghi: df.loc[df['durata'] > 80, 'esercizio']"`,
      hint: `<p>Terzo punto in un colpo solo: <code>df.loc[df["durata"] &gt; 80, "esercizio"]</code> — maschera per le righe, nome per la colonna.</p>`,
      solution: `lunghe = df[df["durata"] > 80]
pesanti_lunghe = df[(df["kg"] > 600) & (df["durata"] > 90)]
esercizi_lunghi = df.loc[df["durata"] > 80, "esercizio"]

print(lunghe)
print(esercizi_lunghi.tolist())`
    },

    { type: "theory", title: "Creare colonne nuove", html: `
<p>Una colonna nuova si crea assegnando a un nome che non esiste ancora, con operazioni vettorizzate tra colonne:</p>
<pre><code>df["volume"] = df["kg"] * df["ripetizioni"]
df["kg_log"] = np.log(df["kg"])
df["lunga"] = df["durata"] &gt; 80        # colonna booleana</code></pre>
<p>Questo si chiama <em>feature engineering</em> quando lo fai per un modello: trasformare le variabili grezze in variabili informative. Il "volume di allenamento" (kg × ripetizioni) dice più di kg e ripetizioni separati — è il tipo di variabile derivata che farai in ogni progetto vero.</p>
`, more: `
<p>Le operazioni tra colonne sono <strong>vettorizzate e allineate per indice</strong>: <code>df["a"] + df["b"]</code> somma elemento per elemento nella posizione corrispondente dell'indice, non nell'ordine fisico delle righe. Se due DataFrame hanno indici diversi, Pandas allinea per etichetta e mette <code>NaN</code> dove non c'è corrispondenza — un dettaglio invisibile quando l'indice è 0,1,2... ma cruciale quando hai unito o filtrato dati con indici sparsi.</p>
<p>Per applicare una funzione più complessa di un'operazione aritmetica, esiste <code>.apply()</code>: <code>df["cat"] = df["kg"].apply(lambda x: "pesante" if x > 500 else "leggero")</code>. È comodo ma più lento delle operazioni vettorizzate native, perché internamente esegue un ciclo Python riga per riga — da preferire solo quando la logica non si esprime con operatori aritmetici o booleani diretti (come <code>np.where</code> o <code>pd.cut</code>, che restano la scelta più veloce quando possibile).</p>
<p>Assegnare una colonna con un singolo valore scalare la ripete automaticamente su tutte le righe: <code>df["fonte"] = "manuale"</code> crea una colonna costante — utile per marcare la provenienza dei dati quando unisci più DataFrame insieme (un tema che tornerà nella sala Pandas Potenza con <code>concat</code> e <code>merge</code>).</p>
` },

    {
      type: "exercise", id: "pd-05", kg: 10, title: "Fabbrica di colonne",
      task: `<p>Aggiungi a <code>df</code> (già caricato) tre colonne:</p>
<ul>
<li><code>volume</code>: <code>kg * ripetizioni</code></li>
<li><code>durata_min</code>: la durata in <strong>minuti</strong> (da secondi)</li>
<li><code>lunga</code>: booleana, <code>True</code> se la durata supera 80 secondi</li>
</ul>`,
      setup: `import io
import pandas as pd
_csv = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")
df = pd.read_csv(_csv)`,
      starter: `# df e' gia' caricato: aggiungi le colonne direttamente
df["volume"] = ...
df["durata_min"] = ...
df["lunga"] = ...

print(df)`,
      check: `import pandas as pd
assert "volume" in df.columns and int(df.loc[1, "volume"]) == 290*12, "volume = df['kg'] * df['ripetizioni']"
assert "durata_min" in df.columns and abs(float(df.loc[0, "durata_min"]) - 95/60) < 1e-9, "durata_min: dividi per 60"
assert "lunga" in df.columns and df["lunga"].tolist() == [True, False, False, True, True, True], "lunga: df['durata'] > 80 (senza if, e' gia' una Series booleana)"`,
      hint: `<p>Nessun ciclo, nessun if: <code>df["lunga"] = df["durata"] &gt; 80</code> crea direttamente la colonna di True/False.</p>`,
      solution: `df["volume"] = df["kg"] * df["ripetizioni"]
df["durata_min"] = df["durata"] / 60
df["lunga"] = df["durata"] > 80

print(df)`
    },

    { type: "theory", title: "Ordinare e prendere i top", html: `
<p>Ordinare e classificare:</p>
<pre><code>df.sort_values("durata")                       # crescente
df.sort_values("durata", ascending=False)      # decrescente
df.sort_values(["esercizio", "kg"])            # per piu' colonne
df.nlargest(3, "durata")                       # top 3 in una mossa
df.nsmallest(2, "kg")</code></pre>
<p>Attenzione: <code>sort_values</code> <strong>restituisce una copia</strong>, non tocca <code>df</code>. Se vuoi tenerla, assegnala. E dopo l'ordinamento l'indice resta quello vecchio, mescolato: un motivo in più per usare <code>iloc</code> quando ragioni per posizione.</p>
`, more: `
<p>Se l'indice mescolato dopo un <code>sort_values</code> dà fastidio (ad esempio prima di iterare o esportare), <code>df.sort_values("durata").reset_index(drop=True)</code> ricrea un indice pulito 0,1,2... scartando quello vecchio (<code>drop=True</code>; senza, il vecchio indice diventerebbe una colonna chiamata <code>"index"</code>).</p>
<p><code>sort_values</code> accetta anche liste parallele per ordinare per più colonne con direzioni diverse: <code>df.sort_values(["esercizio", "kg"], ascending=[True, False])</code> ordina alfabeticamente per esercizio, e a parità di esercizio per kg decrescente — un pattern comune nei report ("prima raggruppa per categoria, poi ordina per importanza dentro ogni categoria").</p>
<p><code>nlargest</code>/<code>nsmallest</code> sono preferibili a <code>sort_values(...).head(n)</code> non solo per brevità ma anche per prestazioni: internamente usano un algoritmo di selezione parziale, più efficiente di un ordinamento completo quando serve solo la "cima" della classifica su tabelle grandi.</p>
` },

    {
      type: "exercise", id: "pd-06", kg: 15, title: "La classifica",
      task: `<p>Sul solito <code>df</code> del registro allenamenti:</p>
<ul>
<li><code>per_durata</code>: il DataFrame ordinato per durata <strong>decrescente</strong></li>
<li><code>top3</code>: le 3 righe con <code>kg</code> più alto (usa <code>nlargest</code>)</li>
<li><code>esercizio_piu_breve</code>: la stringa dell'esercizio con la durata minima (usa <code>nsmallest</code>, poi estrai con <code>iloc</code>)</li>
</ul>`,
      setup: `import io
import pandas as pd
_csv = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")
df = pd.read_csv(_csv)`,
      starter: `# df e' gia' caricato
per_durata = ...
top3 = ...
esercizio_piu_breve = ...

print(per_durata[["esercizio", "durata"]])
print(esercizio_piu_breve)`,
      check: `import pandas as pd
assert 'per_durata' in globals() and per_durata["durata"].tolist() == [102, 95, 88, 84, 72, 70], "per_durata: sort_values('durata', ascending=False)"
assert 'top3' in globals() and len(top3) == 3 and set(top3["esercizio"]) == {"squat", "stacco"}, "top3: df.nlargest(3, 'kg') — squat (810), squat (790), stacco (500)"
assert 'esercizio_piu_breve' in globals() and esercizio_piu_breve == "affondi", "esercizio_piu_breve deve essere 'affondi' (70): es. df.nsmallest(1, 'durata')['esercizio'].iloc[0]"`,
      hint: `<p>Per l'ultima: <code>df.nsmallest(1, "durata")</code> dà un DataFrame di una riga; <code>["esercizio"].iloc[0]</code> ne estrae la stringa. <code>iloc</code>, non <code>loc</code>: l'indice originale è mescolato.</p>`,
      solution: `per_durata = df.sort_values("durata", ascending=False)
top3 = df.nlargest(3, "kg")
esercizio_piu_breve = df.nsmallest(1, "durata")["esercizio"].iloc[0]

print(per_durata[["esercizio", "durata"]])
print(esercizio_piu_breve)`
    },

    { type: "theory", title: "Contare categorie: value_counts", html: `
<p>Per le variabili categoriali il gesto fondamentale è <code>value_counts()</code>:</p>
<pre><code>df["esercizio"].value_counts()          # conteggi, dal piu' frequente
df["esercizio"].value_counts(normalize=True)   # proporzioni
df["esercizio"].nunique()               # quanti esercizi distinti
df["esercizio"].unique()                # quali sono</code></pre>
<p>Il risultato è una Series con le categorie come indice: <code>conteggi["squat"]</code> ti dà il conteggio di "squat", e <code>conteggi.idxmax()</code> la categoria più frequente. È l'equivalente in una riga del dizionario di conteggi del riscaldamento.</p>
`, more: `
<p><code>value_counts()</code> per default ignora i <code>NaN</code>: non compaiono nel conteggio. Se vuoi sapere anche quanti valori mancanti ci sono nella variabile categoriale, passa <code>dropna=False</code>: <code>df["colonna"].value_counts(dropna=False)</code> — utile quando i dati mancanti sono essi stessi una categoria informativa (es. "non ha risposto").</p>
<p><code>value_counts()</code> ordina per default dal più frequente al meno frequente. Per un ordine diverso — ad esempio alfabetico sulle categorie stesse invece che sulla frequenza — usa <code>.sort_index()</code> dopo: <code>df["colonna"].value_counts().sort_index()</code>.</p>
<p>Su una colonna NUMERICA continua (non categoriale), <code>value_counts()</code> è quasi sempre inutile — ogni valore tende a comparire una sola volta. Per capire la distribuzione di una variabile continua servono altri strumenti: <code>describe()</code> (statistiche riassuntive: media, quartili, min, max) o, discretizzandola prima con <code>pd.cut</code> (già visto in un esercizio di questa sala) per poi contarne le fasce.</p>
` },

    {
      type: "exercise", id: "pd-07", kg: 15, title: "Censimento degli esercizi",
      task: `<p>Il DataFrame <code>log</code> (già caricato) ha 12 serie di allenamento. Calcola:</p>
<ul>
<li><code>conteggi</code>: i conteggi di ogni esercizio</li>
<li><code>proporzioni</code>: le proporzioni (somma 1)</li>
<li><code>dominante</code>: l'esercizio più frequente (metodo <code>idxmax</code>, niente occhio-metro)</li>
</ul>`,
      setup: `import pandas as pd
log = pd.DataFrame({
    "esercizio": ["squat", "trazioni", "squat", "panca", "stacco", "squat", "trazioni", "panca", "squat", "affondi", "panca", "squat"],
    "durata": [95, 72, 88, 84, 90, 102, 70, 80, 91, 66, 78, 99],
})`,
      starter: `# log e' gia' caricato
print(log.head())

conteggi = ...
proporzioni = ...
dominante = ...

print(conteggi)
print(dominante)`,
      check: `import pandas as pd
assert 'conteggi' in globals() and conteggi["squat"] == 5 and conteggi["panca"] == 3, "conteggi: log['esercizio'].value_counts() — 'squat' compare 5 volte"
assert 'proporzioni' in globals() and abs(float(proporzioni.sum()) - 1.0) < 1e-9 and abs(float(proporzioni["squat"]) - 5/12) < 1e-9, "proporzioni: value_counts(normalize=True)"
assert 'dominante' in globals() and dominante == "squat", "dominante: conteggi.idxmax()"`,
      hint: `<p><code>idxmax()</code> restituisce l'<em>indice</em> del valore massimo — e in un <code>value_counts</code> l'indice sono le categorie.</p>`,
      solution: `print(log.head())

conteggi = log["esercizio"].value_counts()
proporzioni = log["esercizio"].value_counts(normalize=True)
dominante = conteggi.idxmax()

print(conteggi)
print(dominante)`
    },

    { type: "theory", title: "Valori mancanti: NaN", html: `
<p>I buchi nei dati si presentano come <code>NaN</code> (Not a Number). Pandas li ignora nelle statistiche (<code>mean()</code> li salta) ma bisogna saperli vedere e trattare:</p>
<pre><code>df.isna().sum()          # quanti NaN per colonna — LA diagnosi
df.dropna()              # butta le righe con almeno un NaN
df["kg"].fillna(df["kg"].mean())   # riempi con la media della colonna</code></pre>
<p><code>dropna</code> è onesto ma spreca dati; <code>fillna</code> conserva le righe ma inventa valori. Quale usare dipende da quanti sono e dal perché mancano — ne riparliamo seriamente nella sala Pulizia. Per ora: <strong>mai</strong> ignorarli senza averli contati.</p>
`, more: `
<p><code>dropna()</code> senza argomenti butta una riga se ha <strong>anche un solo</strong> NaN in QUALSIASI colonna — spesso troppo aggressivo. <code>dropna(subset=["kg"])</code> butta le righe solo se il NaN è nella colonna <code>kg</code> specificamente, ignorando NaN altrove; <code>dropna(how="all")</code> butta una riga solo se TUTTE le sue colonne sono NaN (utile per righe completamente vuote da un export malfatto).</p>
<p><code>fillna</code> con la media è la scelta più comune ma non l'unica: <code>fillna(df["kg"].median())</code> è più robusta se ci sono outlier (la mediana non si sposta per pochi valori estremi, la media sì); <code>fillna(method="ffill")</code> propaga l'ultimo valore valido in avanti — utile per serie temporali dove "manca un dato" spesso significa "è rimasto uguale al giorno prima".</p>
<p>Prima di riempire qualsiasi NaN, la domanda pedagogicamente più importante è: <strong>perché mancano?</strong> Se mancano a caso, riempire con la media è ragionevole. Se mancano sistematicamente (es. tutti i valori NaN appartengono a un certo reparto, o venivano registrati solo sopra una certa soglia), riempire con la media introduce un bias silenzioso nel dataset — questo è esattamente il tema che approfondirà la sala Pulizia & EDA.</p>
` },

    {
      type: "exercise", id: "pd-08", kg: 15, title: "Tappa i buchi",
      task: `<p>Il DataFrame <code>mis</code> (già caricato) ha dei NaN nella colonna <code>kg</code>. Procedi:</p>
<ul>
<li><code>buchi_per_colonna</code>: la Series dei conteggi di NaN per colonna</li>
<li><code>mis_pieno</code>: copia di <code>mis</code> dove i NaN di <code>kg</code> sono riempiti con la <strong>media di kg</strong> (nuova variabile, non modificare <code>mis</code>)</li>
<li><code>quanti_erano</code>: il numero di NaN che c'erano in <code>kg</code> (intero)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
mis = pd.DataFrame({
    "esercizio": ["squat", "trazioni", "affondi", "panca", "stacco", "squat"],
    "kg": [810.0, np.nan, 330.0, 470.0, np.nan, 790.0],
    "durata": [95, 72, 70, 84, 88, 102],
})`,
      starter: `# mis e' gia' caricato (guardalo!)
print(mis)

buchi_per_colonna = ...
quanti_erano = ...
mis_pieno = ...

print(mis_pieno)`,
      check: `import pandas as pd
assert 'buchi_per_colonna' in globals() and buchi_per_colonna["kg"] == 2 and buchi_per_colonna["durata"] == 0, "buchi_per_colonna: mis.isna().sum()"
assert 'quanti_erano' in globals() and int(quanti_erano) == 2, "quanti_erano deve essere 2"
assert 'mis_pieno' in globals() and mis_pieno["kg"].isna().sum() == 0, "mis_pieno non deve piu' avere NaN in kg"
assert abs(float(mis_pieno.loc[1, "kg"]) - 600.0) < 1e-9, "I NaN vanno riempiti con la media dei valori PRESENTI di kg (600.0)"
assert mis["kg"].isna().sum() == 2, "mis originale non va modificato: lavora su una copia, es. mis.copy() o assegna il risultato di fillna a mis_pieno"`,
      hint: `<p>Un modo pulito: <code>mis_pieno = mis.copy()</code> poi <code>mis_pieno["kg"] = mis_pieno["kg"].fillna(mis["kg"].mean())</code>. La media di [810, 330, 470, 790] è 600.</p>`,
      solution: `print(mis)

buchi_per_colonna = mis.isna().sum()
quanti_erano = int(buchi_per_colonna["kg"])

mis_pieno = mis.copy()
mis_pieno["kg"] = mis_pieno["kg"].fillna(mis["kg"].mean())

print(mis_pieno)`
    },

    { type: "theory", title: "Ricodificare: map e replace", html: `
<p>Classico da dataset gestionale: le categorie sono codificate come numeri (0, 1, 2) e vanno tradotte in etichette leggibili. <code>.map()</code> con un dizionario fa esattamente questo:</p>
<pre><code>codici = {0: "bassa", 1: "media", 2: "alta"}
df["priorita"] = df["cod"].map(codici)</code></pre>
<p>Attenzione: se un valore non è nel dizionario, <code>map</code> lo trasforma in <code>NaN</code> — ottimo per scovare codici sporchi, pericoloso se non controlli dopo. <code>.replace(codici)</code> invece lascia intatti i valori non mappati. Dopo un <code>map</code>, un <code>isna().sum()</code> di controllo è d'obbligo.</p>
`, more: `
<p><code>map</code> accetta anche una FUNZIONE invece di un dizionario: <code>df["kg"].map(lambda x: x / 2.2)</code> converte libbre in kg per ogni valore. Con dizionario è una ricodifica (categoria → categoria), con funzione è una trasformazione (numero → numero), ma il meccanismo — applica a ogni elemento della Series — è lo stesso.</p>
<p>Per ricodifiche più complesse su intervalli numerici (non singoli valori esatti), <code>pd.cut</code> — già introdotto negli esercizi di questa sala — è lo strumento giusto: trasforma un numero continuo in una fascia categoriale. <code>map</code> con dizionario funziona bene per codici discreti (0,1,2,3...), <code>pd.cut</code> per soglie continue (età, punteggio, prezzo).</p>
<p>Un pattern diagnostico da ricordare: se dopo un <code>map</code> compaiono NaN inattesi, <code>df[df["priorita"].isna()]["cod"].unique()</code> ti mostra ESATTAMENTE quali codici originali non erano nel dizionario — la prima cosa da controllare prima di decidere se aggiornare la mappa o scartare quelle righe.</p>
` },

    {
      type: "exercise", id: "pd-09", kg: 20, title: "Decodifica il ticket",
      task: `<p>Nel DataFrame <code>ticket</code> la colonna <code>cod</code> usa i codici numerici di un servizio assistenza: <code>0 = "bassa"</code>, <code>1 = "media"</code>, <code>2 = "alta"</code>. Fai:</p>
<ul>
<li><code>ticket["priorita"]</code>: nuova colonna con le etichette, via <code>.map()</code></li>
<li><code>persi</code>: quanti NaN ha prodotto il map (dovrebbe essere 0... o no?)</li>
<li><code>conteggio_alta</code>: quante righe hanno priorità <code>"alta"</code></li>
</ul>`,
      setup: `import pandas as pd
ticket = pd.DataFrame({
    "id": ["t01", "t02", "t03", "t04", "t05", "t06", "t07", "t08"],
    "cod": [0, 1, 2, 1, 0, 3, 2, 1],
    "attesa_min": [12, 34, 8, 41, 9, 55, 30, 21],
})`,
      starter: `# ticket e' gia' caricato: occhio alla colonna cod...
print(ticket)

codici = {0: "bassa", 1: "media", 2: "alta"}
ticket["priorita"] = ...
persi = ...
conteggio_alta = ...

print(ticket)
print("NaN prodotti:", persi)`,
      check: `import pandas as pd
assert "priorita" in ticket.columns and ticket.loc[0, "priorita"] == "bassa" and ticket.loc[1, "priorita"] == "media", "priorita: ticket['cod'].map(codici)"
assert 'persi' in globals() and int(persi) == 1, "persi deve essere 1: c'e' un codice 3 non previsto! map lo ha trasformato in NaN — e tu l'hai scoperto"
assert 'conteggio_alta' in globals() and int(conteggio_alta) == 2, "conteggio_alta deve essere 2: (ticket['priorita'] == 'alta').sum() o value_counts"`,
      hint: `<p><code>persi = ticket["priorita"].isna().sum()</code>. Il codice 3 alla riga t06 non è nel dizionario: <code>map</code> l'ha segnalato trasformandolo in NaN. Nei dati veri succede sempre.</p>`,
      solution: `print(ticket)

codici = {0: "bassa", 1: "media", 2: "alta"}
ticket["priorita"] = ticket["cod"].map(codici)
persi = int(ticket["priorita"].isna().sum())
conteggio_alta = int((ticket["priorita"] == "alta").sum())

print(ticket)
print("NaN prodotti:", persi)`
    },

    { type: "theory", title: "isin, rename e query: leggere pandas come una frase", html: `
<p>Tre rifiniture che rendono il codice pandas più leggibile. <code>.isin()</code> testa l'appartenenza a un insieme di valori (comodo al posto di tanti <code>|</code>):</p>
<pre><code>df[df["esercizio"].isin(["squat", "stacco"])]</code></pre>
<p><code>.rename()</code> rinomina colonne senza ricreare il DataFrame:</p>
<pre><code>df = df.rename(columns={"kg": "peso_kg"})</code></pre>
<p>E <code>.query()</code> scrive il filtro come una frase, spesso più leggibile dei bracket per condizioni composte:</p>
<pre><code>df.query("kg > 400 and durata < 100")   # equivalente a df[(df.kg>400)&(df.durata<100)]</code></pre>
`, more: `
<p><code>.query()</code> può riferirsi a variabili Python esterne con il prefisso <code>@</code>: <code>soglia = 400; df.query("kg > @soglia")</code> — indispensabile quando la soglia non è una costante scritta a mano ma calcolata (es. una media o un percentile), altrimenti dovresti concatenare stringhe a mano per costruire la query.</p>
<p><code>.rename()</code> funziona anche con una funzione invece di un dizionario, applicata a TUTTI i nomi: <code>df.rename(columns=str.upper)</code> mette tutte le colonne in maiuscolo in un colpo solo — comodo per normalizzare nomi di colonna provenienti da fonti diverse (es. un CSV con intestazioni "Kg" e uno con "KG").</p>
<p>Tra bracket (<code>df[maschera]</code>) e <code>.query()</code> la scelta è spesso di leggibilità, non di correttezza: per condizioni semplici i bracket sono immediati, per condizioni con molte colonne e operatori <code>.query()</code> si legge più come una frase in linguaggio naturale. Entrambe le forme sono idiomatiche in pandas — non esiste una sola "corretta", ma è bene saperle leggere entrambe perché le troverai mescolate nel codice altrui.</p>
` },

    {
      type: "exercise", id: "pd-10", kg: 15, title: "Riscrivi con stile",
      task: `<p>Sul <code>df</code> del registro allenamenti (già caricato):</p>
<ul>
<li><code>solo_gambe</code>: righe con esercizio <code>"squat"</code> o <code>"affondi"</code>, usando <code>.isin()</code></li>
<li><code>df_rinominato</code>: <code>df</code> con la colonna <code>kg</code> rinominata in <code>peso_kg</code> (usa <code>.rename</code>, non toccare <code>df</code>)</li>
<li><code>pesanti_brevi</code>: righe con <code>kg &gt; 400</code> e <code>durata &lt; 100</code>, scritte con <code>.query()</code></li>
</ul>`,
      setup: `import io
import pandas as pd
_csv = io.StringIO("""esercizio,kg,ripetizioni,durata
squat,810,3,95
trazioni,290,12,72
affondi,330,10,70
panca,470,8,84
stacco,500,5,88
squat,790,3,102""")
df = pd.read_csv(_csv)`,
      starter: `# df e' gia' caricato
solo_gambe = ...
df_rinominato = ...
pesanti_brevi = ...

print(solo_gambe)
print(df_rinominato.columns.tolist())
print(pesanti_brevi)`,
      check: `import pandas as pd
assert 'solo_gambe' in globals() and set(solo_gambe["esercizio"]) == {"squat", "affondi"}, "solo_gambe: df[df['esercizio'].isin(['squat', 'affondi'])]"
assert 'df_rinominato' in globals() and "peso_kg" in df_rinominato.columns and "kg" not in df_rinominato.columns, "df_rinominato: df.rename(columns={'kg': 'peso_kg'})"
assert "kg" in df.columns, "df originale non deve essere modificato"
assert 'pesanti_brevi' in globals() and len(pesanti_brevi) == 3 and set(pesanti_brevi["esercizio"]) == {"squat", "panca", "stacco"}, "pesanti_brevi: df.query('kg > 400 and durata < 100') — squat (95), panca (84), stacco (88); l'altro squat ha durata 102, escluso"`,
      hint: `<p><code>.query()</code> accetta i nomi di colonna come parole nella frase, senza <code>df[...]</code> ripetuto: <code>df.query("kg > 400 and durata < 100")</code>.</p>`,
      solution: `solo_gambe = df[df["esercizio"].isin(["squat", "affondi"])]
df_rinominato = df.rename(columns={"kg": "peso_kg"})
pesanti_brevi = df.query("kg > 400 and durata < 100")

print(solo_gambe)
print(df_rinominato.columns.tolist())
print(pesanti_brevi)`
    },

    {
      type: "exercise", id: "pd-11", kg: 25, title: "Massimale: mini-analisi completa",
      task: `<p>Tutto insieme, sul DataFrame <code>voc</code> (già caricato: 10 serie con kg, volume e durata). Il protocollo:</p>
<ul>
<li><code>voc["intensita"]</code>: nuova colonna <code>kg / ripetizioni</code></li>
<li><code>pesanti</code>: il sotto-DataFrame con <code>intensita &gt; 90</code> (allenamenti a basse ripetizioni e carico alto)</li>
<li><code>durata_media_pesanti</code>: la durata media degli allenamenti pesanti</li>
<li><code>report</code>: le colonne <code>esercizio</code> e <code>intensita</code> dei pesanti, ordinate per intensità decrescente</li>
</ul>`,
      setup: `import pandas as pd
voc = pd.DataFrame({
    "esercizio": ["squat", "trazioni", "affondi", "panca", "stacco", "squat", "trazioni", "panca", "affondi", "stacco"],
    "kg": [810, 29, 33, 470, 500, 790, 30, 460, 34, 510],
    "ripetizioni": [3, 12, 10, 8, 5, 3, 12, 8, 10, 5],
    "durata": [95, 72, 70, 84, 88, 102, 74, 80, 68, 90],
})`,
      starter: `# voc e' gia' caricato
print(voc.head())

voc["intensita"] = ...
pesanti = ...
durata_media_pesanti = ...
report = ...

print(report)
print(durata_media_pesanti)`,
      check: `import pandas as pd
assert "intensita" in voc.columns and abs(float(voc.loc[0, "intensita"]) - 270.0) < 1e-9, "intensita = kg / ripetizioni"
assert 'pesanti' in globals() and len(pesanti) == 4 and set(pesanti["esercizio"]) == {"squat", "stacco"}, "pesanti: intensita > 90 seleziona i due squat e i due stacco"
assert 'durata_media_pesanti' in globals() and abs(float(durata_media_pesanti) - 93.75) < 1e-9, "durata_media_pesanti deve essere 93.75"
assert 'report' in globals() and list(report.columns) == ["esercizio", "intensita"], "report deve avere solo le colonne esercizio e intensita"
assert report["esercizio"].tolist() == ["squat", "squat", "stacco", "stacco"], "report va ordinato per intensita decrescente"`,
      hint: `<p>Catena: filtro → <code>pesanti["durata"].mean()</code> → <code>pesanti[["esercizio", "intensita"]].sort_values("intensita", ascending=False)</code>. Verifica: (95+102+88+90)/4 = 93.75.</p>`,
      solution: `print(voc.head())

voc["intensita"] = voc["kg"] / voc["ripetizioni"]
pesanti = voc[voc["intensita"] > 90]
durata_media_pesanti = pesanti["durata"].mean()
report = pesanti[["esercizio", "intensita"]].sort_values("intensita", ascending=False)

print(report)
print(durata_media_pesanti)`
    },

    {
      type: "exercise", id: "pd-12", kg: 5, title: "Drill: catalogo biblioteca",
      task: `<p>Costruisci <code>df</code>: colonne <code>titolo</code> (<code>"Alpha","Beta","Gamma"</code>), <code>pagine</code> (<code>320,150,410</code>), <code>anno</code> (<code>2018,2021,2015</code>). Crea <code>n_libri</code> e <code>colonna_anno</code>.</p>`,
      starter: `import pandas as pd

df = ...
n_libri = ...
colonna_anno = ...

print(df)`,
      check: `import pandas as pd
assert df.shape == (3, 3)
assert n_libri == 3
assert colonna_anno.tolist() == [2018, 2021, 2015]`,
      hint: `<p><code>pd.DataFrame({"titolo": [...], "pagine": [...], "anno": [...]})</code>.</p>`,
      solution: `import pandas as pd

df = pd.DataFrame({
    "titolo": ["Alpha", "Beta", "Gamma"],
    "pagine": [320, 150, 410],
    "anno": [2018, 2021, 2015],
})
n_libri = df.shape[0]
colonna_anno = df["anno"]

print(df)`
    },

    {
      type: "exercise", id: "pd-13", kg: 5, title: "Drill: bollettino meteo da CSV",
      task: `<p>Leggi <code>dati</code> in <code>df</code>. Calcola <code>n</code> (righe) e <code>temp_media</code>.</p>`,
      setup: `import io
dati = io.StringIO("""citta,temp,umidita
Roma,28,55
Milano,22,70
Napoli,30,60
Torino,20,45
Palermo,29,50""")`,
      starter: `import pandas as pd

df = ...
n = ...
temp_media = ...

print(df)
print(n, temp_media)`,
      check: `import pandas as pd
assert df.shape == (5, 3)
assert n == 5
assert abs(temp_media - 25.8) < 1e-9`,
      hint: `<p><code>pd.read_csv(dati)</code>, poi <code>len(df)</code> e <code>df["temp"].mean()</code>.</p>`,
      solution: `import pandas as pd

df = pd.read_csv(dati)
n = len(df)
temp_media = df["temp"].mean()

print(df)
print(n, temp_media)`
    },

    {
      type: "exercise", id: "pd-14", kg: 10, title: "Drill: il menu della caffetteria",
      task: `<p>Su <code>menu</code>: <code>prezzi</code> (solo colonna <code>prezzo</code>), <code>seconda_voce</code> (riga in posizione 1), <code>ordini_del_te</code> (valore <code>ordini</code> della riga con indice 2, via <code>loc</code>).</p>`,
      setup: `import pandas as pd
menu = pd.DataFrame({
    "bevanda": ["caffe", "cappuccino", "te", "cioccolata"],
    "prezzo": [1.2, 1.8, 2.0, 2.5],
    "ordini": [340, 210, 90, 60],
})`,
      starter: `# menu e' gia' caricato
prezzi = ...
seconda_voce = ...
ordini_del_te = ...

print(prezzi)
print(ordini_del_te)`,
      check: `import pandas as pd
assert prezzi.tolist() == [1.2, 1.8, 2.0, 2.5]
assert seconda_voce["bevanda"] == "cappuccino"
assert ordini_del_te == 90`,
      hint: `<p><code>menu["prezzo"]</code>, <code>menu.iloc[1]</code>, <code>menu.loc[2, "ordini"]</code>.</p>`,
      solution: `prezzi = menu["prezzo"]
seconda_voce = menu.iloc[1]
ordini_del_te = menu.loc[2, "ordini"]

print(prezzi)
print(ordini_del_te)`
    },

    {
      type: "exercise", id: "pd-15", kg: 10, title: "Drill: gli stipendi IT",
      task: `<p>Su <code>dip</code>: <code>alti</code> (stipendio &gt; 3000), <code>it_alti</code> (stipendio &gt; 3000 <strong>e</strong> reparto <code>"IT"</code>), <code>nomi_alti</code> (solo i nomi con stipendio &gt; 3000, via <code>.loc</code>).</p>`,
      setup: `import pandas as pd
dip = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan", "Eva"],
    "stipendio": [2800, 3200, 4100, 2500, 3900],
    "reparto": ["IT", "HR", "IT", "Sales", "IT"],
})`,
      starter: `# dip e' gia' caricato
alti = ...
it_alti = ...
nomi_alti = ...

print(alti)
print(it_alti)
print(nomi_alti)`,
      check: `assert len(alti) == 3
assert set(it_alti["nome"]) == {"Cin", "Eva"}
assert nomi_alti.tolist() == ["Bo", "Cin", "Eva"]`,
      hint: `<p><code>dip[(dip["stipendio"] &gt; 3000) &amp; (dip["reparto"] == "IT")]</code>.</p>`,
      solution: `alti = dip[dip["stipendio"] > 3000]
it_alti = dip[(dip["stipendio"] > 3000) & (dip["reparto"] == "IT")]
nomi_alti = dip.loc[dip["stipendio"] > 3000, "nome"]

print(alti)
print(it_alti)
print(nomi_alti)`
    },

    {
      type: "exercise", id: "pd-16", kg: 10, title: "Drill: costi di consegna",
      task: `<p>Su <code>cons</code>, aggiungi <code>costo</code> (<code>pacchi * 2.5</code>) e <code>lunga</code> (booleana, <code>km &gt; 50</code>).</p>`,
      setup: `import pandas as pd
cons = pd.DataFrame({
    "corriere": ["A", "B", "C", "D"],
    "pacchi": [10, 25, 5, 40],
    "km": [30, 80, 20, 60],
})`,
      starter: `# cons e' gia' caricato
cons["costo"] = ...
cons["lunga"] = ...

print(cons)`,
      check: `assert cons["costo"].tolist() == [25.0, 62.5, 12.5, 100.0]
assert cons["lunga"].tolist() == [False, True, False, True]`,
      hint: `<p><code>cons["pacchi"] * 2.5</code>, <code>cons["km"] &gt; 50</code>.</p>`,
      solution: `cons["costo"] = cons["pacchi"] * 2.5
cons["lunga"] = cons["km"] > 50

print(cons)`
    },

    {
      type: "exercise", id: "pd-17", kg: 15, title: "Drill: i film del momento",
      task: `<p>Su <code>stream</code>: <code>top2_voto</code> (2 film col voto più alto), <code>per_durata</code> (ordinati per durata decrescente).</p>`,
      setup: `import pandas as pd
stream = pd.DataFrame({
    "film": ["Alpha", "Beta", "Gamma", "Delta"],
    "durata": [120, 95, 140, 110],
    "voto": [7.5, 8.9, 6.2, 9.1],
})`,
      starter: `# stream e' gia' caricato
top2_voto = ...
per_durata = ...

print(top2_voto)
print(per_durata)`,
      check: `assert top2_voto["film"].tolist() == ["Delta", "Beta"]
assert per_durata["film"].tolist() == ["Gamma", "Alpha", "Delta", "Beta"]`,
      hint: `<p><code>stream.nlargest(2, "voto")</code>, <code>stream.sort_values("durata", ascending=False)</code>.</p>`,
      solution: `top2_voto = stream.nlargest(2, "voto")
per_durata = stream.sort_values("durata", ascending=False)

print(top2_voto)
print(per_durata)`
    },

    {
      type: "exercise", id: "pd-18", kg: 15, title: "Drill: il genere più prestato",
      task: `<p>Su <code>bib</code> (colonna <code>genere</code>, 12 prestiti): <code>conteggi</code> e <code>genere_top</code>.</p>`,
      setup: `import pandas as pd
bib = pd.DataFrame({"genere": ["Giallo","Fantasy","Giallo","Storico","Giallo","Fantasy","Giallo","Storico","Fantasy","Giallo","Storico","Giallo"]})`,
      starter: `# bib e' gia' caricato
conteggi = ...
genere_top = ...

print(conteggi)
print(genere_top)`,
      check: `assert conteggi["Giallo"] == 6
assert genere_top == "Giallo"`,
      hint: `<p><code>bib["genere"].value_counts()</code>, poi <code>.idxmax()</code>.</p>`,
      solution: `conteggi = bib["genere"].value_counts()
genere_top = conteggi.idxmax()

print(conteggi)
print(genere_top)`
    },

    {
      type: "exercise", id: "pd-19", kg: 15, title: "Drill: stipendi mancanti",
      task: `<p>Su <code>dip2</code> (con NaN in <code>stipendio</code>): <code>n_mancanti</code> e <code>stipendio_pieno</code> (NaN riempiti con la media).</p>`,
      setup: `import pandas as pd
import numpy as np
dip2 = pd.DataFrame({"nome": ["A", "B", "C", "D"], "stipendio": [3000.0, np.nan, 2800.0, np.nan]})`,
      starter: `# dip2 e' gia' caricato
n_mancanti = ...
stipendio_pieno = ...

print(n_mancanti)
print(stipendio_pieno)`,
      check: `assert n_mancanti == 2
assert abs(stipendio_pieno.iloc[1] - 2900.0) < 1e-9`,
      hint: `<p><code>dip2["stipendio"].isna().sum()</code>, <code>dip2["stipendio"].fillna(dip2["stipendio"].mean())</code>.</p>`,
      solution: `n_mancanti = dip2["stipendio"].isna().sum()
stipendio_pieno = dip2["stipendio"].fillna(dip2["stipendio"].mean())

print(n_mancanti)
print(stipendio_pieno)`
    },

    {
      type: "exercise", id: "pd-20", kg: 20, title: "Drill: stato spedizione",
      task: `<p>Su <code>cons2</code> (<code>stato_cod</code>: 0=in_attesa, 1=spedito, 2=consegnato): crea <code>stato</code> con <code>.map()</code>, poi <code>n_sconosciuti</code> (i NaN prodotti).</p>`,
      setup: `import pandas as pd
cons2 = pd.DataFrame({"id": ["c1","c2","c3","c4"], "stato_cod": [0, 1, 2, 3]})`,
      starter: `# cons2 e' gia' caricato
codici = {0: "in_attesa", 1: "spedito", 2: "consegnato"}
cons2["stato"] = ...
n_sconosciuti = ...

print(cons2)
print(n_sconosciuti)`,
      check: `assert cons2.loc[0, "stato"] == "in_attesa"
assert n_sconosciuti == 1`,
      hint: `<p><code>cons2["stato_cod"].map(codici)</code>, poi <code>.isna().sum()</code>.</p>`,
      solution: `codici = {0: "in_attesa", 1: "spedito", 2: "consegnato"}
cons2["stato"] = cons2["stato_cod"].map(codici)
n_sconosciuti = cons2["stato"].isna().sum()

print(cons2)
print(n_sconosciuti)`
    },

    {
      type: "exercise", id: "pd-21", kg: 20, title: "Drill: solo le bevande calde",
      task: `<p>Su <code>menu</code> (già visto): <code>calde</code> (bevanda in <code>["caffe","te","cioccolata"]</code>, via <code>.isin</code>), <code>rinominato</code> (colonna <code>ordini</code> rinominata <code>vendite</code>), <code>economiche</code> (via <code>.query</code>: <code>prezzo &lt; 2</code>).</p>`,
      setup: `import pandas as pd
menu = pd.DataFrame({
    "bevanda": ["caffe", "cappuccino", "te", "cioccolata"],
    "prezzo": [1.2, 1.8, 2.0, 2.5],
    "ordini": [340, 210, 90, 60],
})`,
      starter: `# menu e' gia' caricato
calde = ...
rinominato = ...
economiche = ...

print(calde["bevanda"].tolist())
print(rinominato.columns.tolist())
print(economiche["bevanda"].tolist())`,
      check: `assert calde["bevanda"].tolist() == ["caffe", "te", "cioccolata"]
assert "vendite" in rinominato.columns and "ordini" not in rinominato.columns
assert economiche["bevanda"].tolist() == ["caffe", "cappuccino"]`,
      hint: `<p><code>menu["bevanda"].isin([...])</code>, <code>menu.rename(columns={"ordini": "vendite"})</code>, <code>menu.query("prezzo &lt; 2")</code>.</p>`,
      solution: `calde = menu[menu["bevanda"].isin(["caffe", "te", "cioccolata"])]
rinominato = menu.rename(columns={"ordini": "vendite"})
economiche = menu.query("prezzo < 2")

print(calde["bevanda"].tolist())
print(rinominato.columns.tolist())
print(economiche["bevanda"].tolist())`
    },

    {
      type: "exercise", id: "pd-22", kg: 15, title: "Drill: durata in ore",
      task: `<p>Su <code>stream</code> (già visto): aggiungi <code>durata_ore</code> (durata in minuti / 60, arrotondata a 2 decimali con <code>.round(2)</code>).</p>`,
      setup: `import pandas as pd
stream = pd.DataFrame({
    "film": ["Alpha", "Beta", "Gamma", "Delta"],
    "durata": [120, 95, 140, 110],
    "voto": [7.5, 8.9, 6.2, 9.1],
})`,
      starter: `# stream e' gia' caricato
stream["durata_ore"] = ...
print(stream)`,
      check: `assert stream["durata_ore"].tolist() == [2.0, 1.58, 2.33, 1.83]`,
      hint: `<p><code>(stream["durata"] / 60).round(2)</code>.</p>`,
      solution: `stream["durata_ore"] = (stream["durata"] / 60).round(2)
print(stream)`
    },

    {
      type: "exercise", id: "pd-23", kg: 15, title: "Drill: la libreria per decennio",
      task: `<p>Su <code>bib2</code> (con colonna <code>anno</code>), crea <code>decennio</code> (<code>(anno // 10) * 10</code>, es. 2018 → 2010), poi <code>conteggio_decenni</code> (value_counts).</p>`,
      setup: `import pandas as pd
bib2 = pd.DataFrame({"titolo": ["A","B","C","D","E"], "anno": [2018, 1995, 2021, 1992, 2015]})`,
      starter: `# bib2 e' gia' caricato
bib2["decennio"] = ...
conteggio_decenni = ...

print(bib2)
print(conteggio_decenni)`,
      check: `assert bib2["decennio"].tolist() == [2010, 1990, 2020, 1990, 2010]
assert conteggio_decenni[1990] == 2`,
      hint: `<p>La divisione intera <code>//</code> tronca i decimali: <code>(anno // 10) * 10</code> azzera l'ultima cifra.</p>`,
      solution: `bib2["decennio"] = (bib2["anno"] // 10) * 10
conteggio_decenni = bib2["decennio"].value_counts()

print(bib2)
print(conteggio_decenni)`
    },

    {
      type: "exercise", id: "pd-24", kg: 20, title: "Combo: le 2 caffetterie migliori",
      task: `<p>Su <code>menu</code> (già visto): calcola <code>menu["incasso"]</code> (<code>prezzo * ordini</code>), poi <code>top2_incasso</code>: le 2 bevande con incasso più alto, solo colonne <code>bevanda</code> e <code>incasso</code>.</p>`,
      setup: `import pandas as pd
menu = pd.DataFrame({
    "bevanda": ["caffe", "cappuccino", "te", "cioccolata"],
    "prezzo": [1.2, 1.8, 2.0, 2.5],
    "ordini": [340, 210, 90, 60],
})`,
      starter: `# menu e' gia' caricato
menu["incasso"] = ...
top2_incasso = ...

print(top2_incasso)`,
      check: `assert menu["incasso"].tolist() == [408.0, 378.0, 180.0, 150.0]
assert top2_incasso["bevanda"].tolist() == ["caffe", "cappuccino"]
assert list(top2_incasso.columns) == ["bevanda", "incasso"]`,
      hint: `<p><code>menu.nlargest(2, "incasso")[["bevanda", "incasso"]]</code>.</p>`,
      solution: `menu["incasso"] = menu["prezzo"] * menu["ordini"]
top2_incasso = menu.nlargest(2, "incasso")[["bevanda", "incasso"]]

print(top2_incasso)`
    },

    {
      type: "exercise", id: "pd-25", kg: 20, title: "Combo: dipendenti senior IT",
      task: `<p>Su <code>staff</code>: crea <code>senior</code> (booleana, <code>anni_servizio &gt;= 5</code>), poi <code>senior_it</code> (righe senior <strong>e</strong> reparto IT, via <code>.query</code> con una variabile — usa <code>@senior</code> non serve, filtra su colonne: <code>"anni_servizio &gt;= 5 and reparto == 'IT'"</code>).</p>`,
      setup: `import pandas as pd
staff = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan"],
    "reparto": ["IT", "IT", "HR", "IT"],
    "anni_servizio": [7, 2, 6, 5],
})`,
      starter: `# staff e' gia' caricato
staff["senior"] = ...
senior_it = staff.query("anni_servizio >= 5 and reparto == 'IT'")

print(staff)
print(senior_it)`,
      check: `assert staff["senior"].tolist() == [True, False, True, True]
assert senior_it["nome"].tolist() == ["Ada", "Dan"]`,
      hint: `<p><code>staff["anni_servizio"] &gt;= 5</code> per la colonna booleana; nel <code>.query()</code> le stringhe si confrontano con apici singoli dentro le doppie.</p>`,
      solution: `staff["senior"] = staff["anni_servizio"] >= 5
senior_it = staff.query("anni_servizio >= 5 and reparto == 'IT'")

print(staff)
print(senior_it)`
    },

    {
      type: "exercise", id: "pd-26", kg: 20, title: "Combo: report ordini caffetteria",
      task: `<p>Su <code>menu</code> (già visto): trova <code>bevanda_top</code> (quella con più ordini), poi crea <code>report</code>: f-string <code>"X e' la piu' ordinata con N ordini"</code>.</p>`,
      setup: `import pandas as pd
menu = pd.DataFrame({
    "bevanda": ["caffe", "cappuccino", "te", "cioccolata"],
    "prezzo": [1.2, 1.8, 2.0, 2.5],
    "ordini": [340, 210, 90, 60],
})`,
      starter: `# menu e' gia' caricato
riga_top = menu.nlargest(1, "ordini").iloc[0]
bevanda_top = riga_top["bevanda"]
report = f"{bevanda_top} e' la piu' ordinata con {riga_top['ordini']} ordini"

print(report)`,
      check: `assert bevanda_top == "caffe"
assert report == "caffe e' la piu' ordinata con 340 ordini"`,
      hint: `<p><code>.nlargest(1, "ordini").iloc[0]</code> restituisce una riga (Series): puoi leggerne i campi come un dizionario.</p>`,
      solution: `riga_top = menu.nlargest(1, "ordini").iloc[0]
bevanda_top = riga_top["bevanda"]
report = f"{bevanda_top} e' la piu' ordinata con {riga_top['ordini']} ordini"

print(report)`
    },

    {
      type: "exercise", id: "pd-27", kg: 20, title: "Combo: dai voti alle stelle",
      task: `<p>Su <code>stream</code> (già visto): crea <code>stelle</code> con <code>pd.cut</code>: soglie <code>[0, 6, 8, 10]</code>, etichette <code>["scarso","buono","ottimo"]</code> sul voto.</p>`,
      setup: `import pandas as pd
stream = pd.DataFrame({
    "film": ["Alpha", "Beta", "Gamma", "Delta"],
    "durata": [120, 95, 140, 110],
    "voto": [7.5, 8.9, 6.2, 9.1],
})`,
      starter: `# stream e' gia' caricato
stream["stelle"] = ...
print(stream)`,
      check: `assert stream["stelle"].tolist() == ["buono", "ottimo", "buono", "ottimo"]`,
      hint: `<p><code>pd.cut(stream["voto"], bins=[0, 6, 8, 10], labels=["scarso", "buono", "ottimo"])</code>.</p>`,
      solution: `stream["stelle"] = pd.cut(stream["voto"], bins=[0, 6, 8, 10], labels=["scarso", "buono", "ottimo"])
print(stream)`
    },

    {
      type: "exercise", id: "pd-28", kg: 20, title: "Combo: doppio filtro sulla libreria",
      task: `<p>Su <code>bib3</code>: <code>recenti_popolari</code>: libri con <code>anno &gt;= 2015</code> <strong>e</strong> <code>prestiti &gt; 50</code>, ordinati per prestiti decrescente, solo colonne <code>titolo</code> e <code>prestiti</code>.</p>`,
      setup: `import pandas as pd
bib3 = pd.DataFrame({
    "titolo": ["A", "B", "C", "D", "E"],
    "anno": [2018, 2010, 2020, 2016, 2005],
    "prestiti": [80, 90, 30, 65, 100],
})`,
      starter: `# bib3 e' gia' caricato
recenti_popolari = ...
print(recenti_popolari)`,
      check: `assert recenti_popolari["titolo"].tolist() == ["A", "D"]
assert list(recenti_popolari.columns) == ["titolo", "prestiti"]`,
      hint: `<p>Filtra prima con la doppia condizione, poi ordina, poi seleziona le colonne — o in qualsiasi ordine che dia lo stesso risultato finale.</p>`,
      solution: `recenti_popolari = bib3[(bib3["anno"] >= 2015) & (bib3["prestiti"] > 50)].sort_values("prestiti", ascending=False)[["titolo", "prestiti"]]
print(recenti_popolari)`
    },

    {
      type: "exercise", id: "pd-29", kg: 25, title: "Massimale: pipeline caffetteria completa",
      task: `<p>Su <code>menu</code> (già visto), in un'unica pipeline:</p>
<ul>
<li><code>menu["incasso"]</code>: <code>prezzo * ordini</code></li>
<li><code>menu["fascia"]</code>: <code>pd.cut</code> su <code>incasso</code>, soglie <code>[0, 200, 400, 1000]</code>, etichette <code>["basso","medio","alto"]</code></li>
<li><code>alte</code>: solo le righe con fascia <code>"alto"</code></li>
<li><code>riepilogo</code>: f-string <code>"N bevande in fascia alta, incasso totale: X.XX"</code> (N = len(alte), X = somma incasso di alte, 2 decimali)</li>
</ul>`,
      setup: `import pandas as pd
menu = pd.DataFrame({
    "bevanda": ["caffe", "cappuccino", "te", "cioccolata"],
    "prezzo": [1.2, 1.8, 2.0, 2.5],
    "ordini": [340, 210, 90, 60],
})`,
      starter: `# menu e' gia' caricato
menu["incasso"] = ...
menu["fascia"] = ...
alte = ...
riepilogo = ...

print(menu)
print(riepilogo)`,
      check: `assert menu["incasso"].tolist() == [408.0, 378.0, 180.0, 150.0]
assert menu["fascia"].tolist() == ["alto", "medio", "basso", "basso"]
assert len(alte) == 1
assert riepilogo == "1 bevande in fascia alta, incasso totale: 408.00"`,
      hint: `<p>Solo il caffè (408) supera 400: è l'unico in fascia alta. Costruisci il riepilogo con <code>f"{len(alte)} bevande in fascia alta, incasso totale: {alte['incasso'].sum():.2f}"</code>.</p>`,
      solution: `menu["incasso"] = menu["prezzo"] * menu["ordini"]
menu["fascia"] = pd.cut(menu["incasso"], bins=[0, 200, 400, 1000], labels=["basso", "medio", "alto"])
alte = menu[menu["fascia"] == "alto"]
riepilogo = f"{len(alte)} bevande in fascia alta, incasso totale: {alte['incasso'].sum():.2f}"

print(menu)
print(riepilogo)`
    },

    {
      type: "exercise", id: "pd-30", kg: 25, title: "Massimale: bonifica leggera e classifica",
      task: `<p>Su <code>staff2</code> (con un NaN e un valore fuori scala): riempi lo stipendio mancante con la mediana, poi crea <code>livello</code> con <code>np.where</code>: <code>"executive"</code> se stipendio &gt; 5000, altrimenti <code>"standard"</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
staff2 = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan"],
    "stipendio": [3000.0, np.nan, 8000.0, 2800.0],
})`,
      starter: `import numpy as np
# staff2 e' gia' caricato
staff2["stipendio"] = staff2["stipendio"].fillna(staff2["stipendio"].median())
staff2["livello"] = ...

print(staff2)`,
      check: `import numpy as np
assert staff2["stipendio"].isna().sum() == 0
assert abs(staff2.loc[1, "stipendio"] - 3000.0) < 1e-9, "La mediana di [3000, 8000, 2800] e' 3000"
assert staff2["livello"].tolist() == ["standard", "standard", "executive", "standard"]`,
      hint: `<p><code>np.where(staff2["stipendio"] &gt; 5000, "executive", "standard")</code>.</p>`,
      solution: `import numpy as np
staff2["stipendio"] = staff2["stipendio"].fillna(staff2["stipendio"].median())
staff2["livello"] = np.where(staff2["stipendio"] > 5000, "executive", "standard")

print(staff2)`
    },

    {
      type: "exercise", id: "pd-31", kg: 5, title: "Drill: il negozio di animali",
      task: `<p>Costruisci <code>df</code>: <code>prodotto</code> (<code>"crocchette","guinzaglio","cuccia"</code>), <code>prezzo</code> (<code>25,12,45</code>), <code>scorte</code> (<code>30,50,10</code>). Crea <code>n_prodotti</code> e <code>colonna_prezzo</code>.</p>`,
      starter: `import pandas as pd

df = ...
n_prodotti = ...
colonna_prezzo = ...

print(df)`,
      check: `import pandas as pd
assert df.shape == (3, 3)
assert n_prodotti == 3
assert colonna_prezzo.tolist() == [25, 12, 45]`,
      hint: `<p><code>pd.DataFrame({"prodotto": [...], "prezzo": [...], "scorte": [...]})</code>.</p>`,
      solution: `import pandas as pd

df = pd.DataFrame({
    "prodotto": ["crocchette", "guinzaglio", "cuccia"],
    "prezzo": [25, 12, 45],
    "scorte": [30, 50, 10],
})
n_prodotti = df.shape[0]
colonna_prezzo = df["prezzo"]

print(df)`
    },

    {
      type: "exercise", id: "pd-32", kg: 5, title: "Drill: i voti d'esame da CSV",
      task: `<p>Leggi <code>dati</code> in <code>df</code>. Calcola <code>n</code> (righe) e <code>voto_medio</code>.</p>`,
      setup: `import io
dati = io.StringIO("""studente,voto,ore_studio
Alice,28,10
Bruno,22,4
Carla,30,12
Dario,18,2
Elena,26,8""")`,
      starter: `import pandas as pd

df = ...
n = ...
voto_medio = ...

print(df)
print(n, voto_medio)`,
      check: `import pandas as pd
assert df.shape == (5, 3)
assert n == 5
assert abs(voto_medio - 24.8) < 1e-9`,
      hint: `<p><code>pd.read_csv(dati)</code>, poi <code>len(df)</code> e <code>df["voto"].mean()</code>.</p>`,
      solution: `import pandas as pd

df = pd.read_csv(dati)
n = len(df)
voto_medio = df["voto"].mean()

print(df)
print(n, voto_medio)`
    },

    {
      type: "exercise", id: "pd-33", kg: 10, title: "Drill: la reception dell'hotel",
      task: `<p>Su <code>hotel</code>: <code>sotto_tabella</code> (solo <code>camera</code> e <code>prezzo_notte</code>), <code>terza_riga</code> (posizione 2, via <code>iloc</code>), <code>notti_seconda</code> (valore <code>notti</code> della riga con indice 1, via <code>loc</code>).</p>`,
      setup: `import pandas as pd
hotel = pd.DataFrame({
    "camera": ["101", "102", "103", "104"],
    "notti": [3, 5, 2, 7],
    "prezzo_notte": [80, 60, 100, 50],
})`,
      starter: `# hotel e' gia' caricato
sotto_tabella = ...
terza_riga = ...
notti_seconda = ...

print(sotto_tabella)
print(notti_seconda)`,
      check: `assert list(sotto_tabella.columns) == ["camera", "prezzo_notte"]
assert terza_riga["camera"] == "103"
assert notti_seconda == 5`,
      hint: `<p><code>hotel[["camera", "prezzo_notte"]]</code>, <code>hotel.iloc[2]</code>, <code>hotel.loc[1, "notti"]</code>.</p>`,
      solution: `sotto_tabella = hotel[["camera", "prezzo_notte"]]
terza_riga = hotel.iloc[2]
notti_seconda = hotel.loc[1, "notti"]

print(sotto_tabella)
print(notti_seconda)`
    },

    {
      type: "exercise", id: "pd-34", kg: 10, title: "Drill: gli ordini grandi",
      task: `<p>Su <code>ordini</code>: <code>grandi</code> (<code>importo &gt; 100</code>), <code>grandi_spediti</code> (<code>importo &gt; 100</code> <strong>e</strong> <code>spedito</code>), <code>importi_grandi_ordini</code> (solo gli id degli ordini con importo &gt; 100, via <code>.loc</code>).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "ordine": ["o1", "o2", "o3", "o4", "o5"],
    "importo": [120, 45, 300, 80, 220],
    "spedito": [True, False, True, True, False],
})`,
      starter: `# ordini e' gia' caricato
grandi = ...
grandi_spediti = ...
importi_grandi_ordini = ...

print(grandi)
print(importi_grandi_ordini.tolist())`,
      check: `assert len(grandi) == 3
assert set(grandi_spediti["ordine"]) == {"o1", "o3"}
assert importi_grandi_ordini.tolist() == ["o1", "o3", "o5"]`,
      hint: `<p><code>ordini[(ordini["importo"] &gt; 100) &amp; (ordini["spedito"])]</code> — attenzione alle parentesi.</p>`,
      solution: `grandi = ordini[ordini["importo"] > 100]
grandi_spediti = ordini[(ordini["importo"] > 100) & (ordini["spedito"])]
importi_grandi_ordini = ordini.loc[ordini["importo"] > 100, "ordine"]

print(grandi)
print(importi_grandi_ordini.tolist())`
    },

    {
      type: "exercise", id: "pd-35", kg: 10, title: "Drill: tempo di consegna stimato",
      task: `<p>Su <code>cons</code>: aggiungi <code>tempo_stimato</code> (<code>km * 2</code>, minuti) e <code>oltre_10km</code> (booleana, <code>km &gt; 10</code>).</p>`,
      setup: `import pandas as pd
cons = pd.DataFrame({
    "corriere": ["A", "B", "C"],
    "pacchi": [10, 20, 15],
    "km": [5, 20, 12],
})`,
      starter: `# cons e' gia' caricato
cons["tempo_stimato"] = ...
cons["oltre_10km"] = ...

print(cons)`,
      check: `assert cons["tempo_stimato"].tolist() == [10, 40, 24]
assert cons["oltre_10km"].tolist() == [False, True, True]`,
      hint: `<p><code>cons["km"] * 2</code>, <code>cons["km"] &gt; 10</code>.</p>`,
      solution: `cons["tempo_stimato"] = cons["km"] * 2
cons["oltre_10km"] = cons["km"] > 10

print(cons)`
    },

    {
      type: "exercise", id: "pd-36", kg: 15, title: "Drill: classifica del campionato",
      task: `<p>Su <code>lega</code>: <code>per_punti</code> (ordinato per punti decrescente), <code>top2</code> (2 squadre coi punti più alti), <code>squadra_ultima</code> (nome della squadra ultima in classifica).</p>`,
      setup: `import pandas as pd
lega = pd.DataFrame({
    "squadra": ["Rossi", "Blu", "Verdi", "Gialli"],
    "punti": [45, 60, 38, 52],
})`,
      starter: `# lega e' gia' caricato
per_punti = ...
top2 = ...
squadra_ultima = ...

print(per_punti)
print(squadra_ultima)`,
      check: `assert per_punti["squadra"].tolist() == ["Blu", "Gialli", "Rossi", "Verdi"]
assert set(top2["squadra"]) == {"Blu", "Gialli"}
assert squadra_ultima == "Verdi"`,
      hint: `<p><code>lega.nsmallest(1, "punti")["squadra"].iloc[0]</code> per l'ultima.</p>`,
      solution: `per_punti = lega.sort_values("punti", ascending=False)
top2 = lega.nlargest(2, "punti")
squadra_ultima = lega.nsmallest(1, "punti")["squadra"].iloc[0]

print(per_punti)
print(squadra_ultima)`
    },

    {
      type: "exercise", id: "pd-37", kg: 15, title: "Drill: la categoria di ticket più comune",
      task: `<p>Su <code>tk</code> (10 ticket di assistenza): <code>conteggi</code> e <code>dominante</code>.</p>`,
      setup: `import pandas as pd
tk = pd.DataFrame({"categoria": ["bug","bug","feature","bug","support","feature","bug","support","bug","feature"]})`,
      starter: `# tk e' gia' caricato
conteggi = ...
dominante = ...

print(conteggi)
print(dominante)`,
      check: `assert conteggi["bug"] == 5
assert dominante == "bug"`,
      hint: `<p><code>tk["categoria"].value_counts()</code>, poi <code>.idxmax()</code>.</p>`,
      solution: `conteggi = tk["categoria"].value_counts()
dominante = conteggi.idxmax()

print(conteggi)
print(dominante)`
    },

    {
      type: "exercise", id: "pd-38", kg: 15, title: "Drill: sondaggio con risposte mancanti",
      task: `<p>Su <code>sond</code> (con NaN in <code>voto</code>): <code>buchi</code> (conteggio NaN) e <code>voto_pieno</code> (NaN riempiti con la media).</p>`,
      setup: `import pandas as pd
import numpy as np
sond = pd.DataFrame({"utente": ["u1","u2","u3","u4","u5"], "voto": [8.0, np.nan, 6.0, np.nan, 9.0]})`,
      starter: `# sond e' gia' caricato
buchi = ...
voto_pieno = ...

print(buchi)
print(voto_pieno)`,
      check: `assert buchi == 2
assert abs(voto_pieno.iloc[1] - 7.666666667) < 1e-6`,
      hint: `<p><code>sond["voto"].isna().sum()</code>, <code>sond["voto"].fillna(sond["voto"].mean())</code>.</p>`,
      solution: `buchi = sond["voto"].isna().sum()
voto_pieno = sond["voto"].fillna(sond["voto"].mean())

print(buchi)
print(voto_pieno)`
    },

    {
      type: "exercise", id: "pd-39", kg: 20, title: "Drill: stato dell'ordine ricodificato",
      task: `<p>Su <code>ord2</code> (<code>stato_cod</code>: 0=nuovo, 1=in_lavorazione, 2=completato): crea <code>stato</code> con <code>.map()</code>, poi <code>persi</code> (i NaN prodotti) e <code>conteggio_completato</code>.</p>`,
      setup: `import pandas as pd
ord2 = pd.DataFrame({"id": ["a","b","c","d"], "stato_cod": [0, 1, 2, 4]})`,
      starter: `# ord2 e' gia' caricato
codici = {0: "nuovo", 1: "in_lavorazione", 2: "completato"}
ord2["stato"] = ...
persi = ...
conteggio_completato = ...

print(ord2)
print(persi)`,
      check: `assert ord2.loc[0, "stato"] == "nuovo"
assert persi == 1
assert conteggio_completato == 1`,
      hint: `<p><code>ord2["stato_cod"].map(codici)</code>; il codice 4 non è previsto, diventa NaN.</p>`,
      solution: `codici = {0: "nuovo", 1: "in_lavorazione", 2: "completato"}
ord2["stato"] = ord2["stato_cod"].map(codici)
persi = ord2["stato"].isna().sum()
conteggio_completato = int((ord2["stato"] == "completato").sum())

print(ord2)
print(persi)`
    },

    {
      type: "exercise", id: "pd-40", kg: 20, title: "Drill: i piani di abbonamento",
      task: `<p>Su <code>piani</code>: <code>premium</code> (piano <code>"pro"</code> o <code>"enterprise"</code>, via <code>.isin</code>), <code>rinominato</code> (<code>prezzo</code> rinominata <code>costo_mensile</code>), <code>economici</code> (via <code>.query</code>: <code>prezzo &lt; 50</code>).</p>`,
      setup: `import pandas as pd
piani = pd.DataFrame({
    "piano": ["free", "pro", "enterprise", "pro"],
    "prezzo": [0, 20, 100, 20],
    "utenti": [500, 80, 5, 80],
})`,
      starter: `# piani e' gia' caricato
premium = ...
rinominato = ...
economici = ...

print(premium)
print(rinominato.columns.tolist())
print(economici["piano"].tolist())`,
      check: `assert len(premium) == 3
assert "costo_mensile" in rinominato.columns and "prezzo" not in rinominato.columns
assert economici["piano"].tolist() == ["free", "pro", "pro"]`,
      hint: `<p><code>piani["piano"].isin(["pro", "enterprise"])</code>, <code>piani.rename(columns={"prezzo": "costo_mensile"})</code>, <code>piani.query("prezzo &lt; 50")</code>.</p>`,
      solution: `premium = piani[piani["piano"].isin(["pro", "enterprise"])]
rinominato = piani.rename(columns={"prezzo": "costo_mensile"})
economici = piani.query("prezzo < 50")

print(premium)
print(rinominato.columns.tolist())
print(economici["piano"].tolist())`
    },

    {
      type: "exercise", id: "pd-41", kg: 25, title: "Massimale: occupazione dei corsi in palestra",
      task: `<p>Su <code>sessioni</code>, in un'unica pipeline:</p>
<ul>
<li><code>sessioni["occupazione"]</code>: <code>iscritti / capienza</code></li>
<li><code>piene</code>: le sessioni con <code>occupazione &gt;= 0.9</code></li>
<li><code>report</code>: colonne <code>corso</code> e <code>occupazione</code> di <code>piene</code>, ordinate per occupazione decrescente</li>
<li><code>occupazione_media_piene</code>: la media di occupazione tra le sessioni piene</li>
</ul>`,
      setup: `import pandas as pd
sessioni = pd.DataFrame({
    "corso": ["yoga", "spinning", "pilates", "yoga", "spinning", "pilates"],
    "iscritti": [18, 25, 12, 20, 25, 15],
    "capienza": [20, 25, 15, 25, 25, 15],
})`,
      starter: `# sessioni e' gia' caricato
sessioni["occupazione"] = ...
piene = ...
report = ...
occupazione_media_piene = ...

print(report)
print(occupazione_media_piene)`,
      check: `import pandas as pd
assert abs(float(sessioni.loc[0, "occupazione"]) - 0.9) < 1e-9, "occupazione = iscritti / capienza"
assert 'piene' in globals() and len(piene) == 4, "piene: occupazione >= 0.9 esclude le due sessioni pilates/yoga da 0.8"
assert 'report' in globals() and list(report.columns) == ["corso", "occupazione"], "report deve avere solo corso e occupazione"
assert report["corso"].tolist() == ["spinning", "spinning", "pilates", "yoga"], "ordina report per occupazione decrescente"
assert 'occupazione_media_piene' in globals() and abs(float(occupazione_media_piene) - 0.975) < 1e-9, "media di [1.0, 1.0, 1.0, 0.9]"`,
      hint: `<p>18/20=0.9, 25/25=1.0, 12/15=0.8, 20/25=0.8, 25/25=1.0, 15/15=1.0 — solo le 0.8 restano fuori da <code>piene</code>.</p>`,
      solution: `sessioni["occupazione"] = sessioni["iscritti"] / sessioni["capienza"]
piene = sessioni[sessioni["occupazione"] >= 0.9]
report = piene[["corso", "occupazione"]].sort_values("occupazione", ascending=False)
occupazione_media_piene = piene["occupazione"].mean()

print(report)
print(occupazione_media_piene)`
    },

    {
      type: "exercise", id: "pd-42", kg: 5, title: "Drill: le stazioni meteo",
      task: `<p>Costruisci <code>df</code>: <code>citta</code> (<code>"Roma","Milano","Napoli"</code>), <code>temp</code> (<code>30,24,32</code>), <code>umidita</code> (<code>50,65,55</code>). Crea <code>n_stazioni</code> e <code>colonna_temp</code>.</p>`,
      starter: `import pandas as pd

df = ...
n_stazioni = ...
colonna_temp = ...

print(df)`,
      check: `assert df.shape == (3, 3)
assert n_stazioni == 3
assert colonna_temp.tolist() == [30, 24, 32]`,
      hint: `<p><code>pd.DataFrame({"citta": [...], "temp": [...], "umidita": [...]})</code>.</p>`,
      solution: `import pandas as pd

df = pd.DataFrame({
    "citta": ["Roma", "Milano", "Napoli"],
    "temp": [30, 24, 32],
    "umidita": [50, 65, 55],
})
n_stazioni = df.shape[0]
colonna_temp = df["temp"]

print(df)`
    },

    {
      type: "exercise", id: "pd-43", kg: 5, title: "Drill: il club del libro",
      task: `<p>Costruisci <code>df</code>: <code>titolo</code> (<code>"X","Y","Z"</code>), <code>pagine</code> (<code>200,350,150</code>), <code>voto</code> (<code>4.2,3.8,4.5</code>). Crea <code>n_libri</code> e <code>colonna_voto</code>.</p>`,
      starter: `import pandas as pd

df = ...
n_libri = ...
colonna_voto = ...

print(df)`,
      check: `assert df.shape == (3, 3)
assert n_libri == 3
assert colonna_voto.tolist() == [4.2, 3.8, 4.5]`,
      hint: `<p><code>pd.DataFrame({"titolo": [...], "pagine": [...], "voto": [...]})</code>.</p>`,
      solution: `import pandas as pd

df = pd.DataFrame({
    "titolo": ["X", "Y", "Z"],
    "pagine": [200, 350, 150],
    "voto": [4.2, 3.8, 4.5],
})
n_libri = df.shape[0]
colonna_voto = df["voto"]

print(df)`
    },

    {
      type: "exercise", id: "pd-44", kg: 10, title: "Drill: il parcheggio",
      task: `<p>Su <code>park</code>: <code>sotto</code> (solo <code>posto</code> e <code>tariffa</code>), <code>seconda_riga</code> (posizione 1, via <code>iloc</code>), <code>tariffa_terza</code> (valore <code>tariffa</code> della riga con indice 2, via <code>loc</code>).</p>`,
      setup: `import pandas as pd
park = pd.DataFrame({
    "posto": ["P1", "P2", "P3", "P4"],
    "occupato": [True, False, True, False],
    "tariffa": [2.0, 2.0, 3.0, 3.0],
})`,
      starter: `# park e' gia' caricato
sotto = ...
seconda_riga = ...
tariffa_terza = ...

print(sotto)
print(tariffa_terza)`,
      check: `assert list(sotto.columns) == ["posto", "tariffa"]
assert seconda_riga["posto"] == "P2"
assert tariffa_terza == 3.0`,
      hint: `<p><code>park[["posto", "tariffa"]]</code>, <code>park.iloc[1]</code>, <code>park.loc[2, "tariffa"]</code>.</p>`,
      solution: `sotto = park[["posto", "tariffa"]]
seconda_riga = park.iloc[1]
tariffa_terza = park.loc[2, "tariffa"]

print(sotto)
print(tariffa_terza)`
    },

    {
      type: "exercise", id: "pd-45", kg: 10, title: "Drill: i corsi online popolari",
      task: `<p>Su <code>corsi</code>: <code>popolari</code> (<code>iscritti &gt; 150</code>), <code>ottimi_popolari</code> (<code>iscritti &gt; 150</code> <strong>e</strong> <code>voto_medio &gt; 4.5</code>), <code>nomi_popolari</code> (solo i nomi dei corsi popolari, via <code>.loc</code>).</p>`,
      setup: `import pandas as pd
corsi = pd.DataFrame({
    "corso": ["Python", "SQL", "ML", "Docker"],
    "iscritti": [300, 150, 220, 90],
    "voto_medio": [4.5, 4.2, 4.8, 3.9],
})`,
      starter: `# corsi e' gia' caricato
popolari = ...
ottimi_popolari = ...
nomi_popolari = ...

print(popolari)
print(nomi_popolari.tolist())`,
      check: `assert len(popolari) == 2
assert ottimi_popolari["corso"].tolist() == ["ML"]
assert nomi_popolari.tolist() == ["Python", "ML"]`,
      hint: `<p>150 non è "&gt; 150": SQL resta fuori da <code>popolari</code>.</p>`,
      solution: `popolari = corsi[corsi["iscritti"] > 150]
ottimi_popolari = corsi[(corsi["iscritti"] > 150) & (corsi["voto_medio"] > 4.5)]
nomi_popolari = corsi.loc[corsi["iscritti"] > 150, "corso"]

print(popolari)
print(nomi_popolari.tolist())`
    },

    {
      type: "exercise", id: "pd-46", kg: 15, title: "Drill: il conto del ristorante",
      task: `<p>Su <code>menu2</code>: aggiungi <code>totale</code> (<code>prezzo * quantita</code>) e <code>economico</code> (booleana, <code>prezzo &lt; 10</code>).</p>`,
      setup: `import pandas as pd
menu2 = pd.DataFrame({
    "piatto": ["pasta", "pizza", "insalata"],
    "prezzo": [12, 15, 8],
    "quantita": [3, 5, 10],
})`,
      starter: `# menu2 e' gia' caricato
menu2["totale"] = ...
menu2["economico"] = ...

print(menu2)`,
      check: `assert menu2["totale"].tolist() == [36, 75, 80]
assert menu2["economico"].tolist() == [False, False, True]`,
      hint: `<p><code>menu2["prezzo"] * menu2["quantita"]</code>, <code>menu2["prezzo"] &lt; 10</code>.</p>`,
      solution: `menu2["totale"] = menu2["prezzo"] * menu2["quantita"]
menu2["economico"] = menu2["prezzo"] < 10

print(menu2)`
    },

    {
      type: "exercise", id: "pd-47", kg: 15, title: "Drill: i corsi più affollati",
      task: `<p>Su <code>corsi2</code>: <code>top2</code> (2 corsi con più iscritti), <code>per_iscritti</code> (ordinati per iscritti decrescente).</p>`,
      setup: `import pandas as pd
corsi2 = pd.DataFrame({
    "corso": ["yoga", "spinning", "pilates", "crossfit"],
    "iscritti": [18, 25, 12, 30],
})`,
      starter: `# corsi2 e' gia' caricato
top2 = ...
per_iscritti = ...

print(top2)
print(per_iscritti)`,
      check: `assert set(top2["corso"]) == {"crossfit", "spinning"}
assert per_iscritti["corso"].tolist() == ["crossfit", "spinning", "yoga", "pilates"]`,
      hint: `<p><code>corsi2.nlargest(2, "iscritti")</code>, <code>corsi2.sort_values("iscritti", ascending=False)</code>.</p>`,
      solution: `top2 = corsi2.nlargest(2, "iscritti")
per_iscritti = corsi2.sort_values("iscritti", ascending=False)

print(top2)
print(per_iscritti)`
    },

    {
      type: "exercise", id: "pd-48", kg: 15, title: "Drill: il piano telefonico più diffuso",
      task: `<p>Su <code>tel</code> (7 clienti): <code>conteggi</code> e <code>piano_top</code>.</p>`,
      setup: `import pandas as pd
tel = pd.DataFrame({"piano": ["base","pro","base","premium","base","pro","base"]})`,
      starter: `# tel e' gia' caricato
conteggi = ...
piano_top = ...

print(conteggi)
print(piano_top)`,
      check: `assert conteggi["base"] == 4
assert piano_top == "base"`,
      hint: `<p><code>tel["piano"].value_counts()</code>, poi <code>.idxmax()</code>.</p>`,
      solution: `conteggi = tel["piano"].value_counts()
piano_top = conteggi.idxmax()

print(conteggi)
print(piano_top)`
    },

    {
      type: "exercise", id: "pd-49", kg: 20, title: "Drill: scorte di magazzino incomplete",
      task: `<p>Su <code>mag</code> (con NaN in <code>scorte</code>): <code>n_mancanti</code> e <code>scorte_piena</code> (NaN riempiti con la media).</p>`,
      setup: `import pandas as pd
import numpy as np
mag = pd.DataFrame({"prodotto": ["p1","p2","p3","p4"], "scorte": [100.0, np.nan, 50.0, np.nan]})`,
      starter: `# mag e' gia' caricato
n_mancanti = ...
scorte_piena = ...

print(n_mancanti)
print(scorte_piena)`,
      check: `assert n_mancanti == 2
assert abs(scorte_piena.iloc[1] - 75.0) < 1e-9`,
      hint: `<p><code>mag["scorte"].isna().sum()</code>, <code>mag["scorte"].fillna(mag["scorte"].mean())</code>.</p>`,
      solution: `n_mancanti = mag["scorte"].isna().sum()
scorte_piena = mag["scorte"].fillna(mag["scorte"].mean())

print(n_mancanti)
print(scorte_piena)`
    },

    {
      type: "exercise", id: "pd-50", kg: 20, title: "Drill: stato dei voli",
      task: `<p>Su <code>voli</code> (<code>stato_cod</code>: 0=in_orario, 1=ritardo, 2=cancellato): crea <code>stato</code> con <code>.map()</code>, poi <code>n_sconosciuti</code>.</p>`,
      setup: `import pandas as pd
voli = pd.DataFrame({"volo": ["v1","v2","v3","v4"], "stato_cod": [0, 1, 2, 5]})`,
      starter: `# voli e' gia' caricato
codici = {0: "in_orario", 1: "ritardo", 2: "cancellato"}
voli["stato"] = ...
n_sconosciuti = ...

print(voli)
print(n_sconosciuti)`,
      check: `assert voli.loc[0, "stato"] == "in_orario"
assert n_sconosciuti == 1`,
      hint: `<p><code>voli["stato_cod"].map(codici)</code>, poi <code>.isna().sum()</code>.</p>`,
      solution: `codici = {0: "in_orario", 1: "ritardo", 2: "cancellato"}
voli["stato"] = voli["stato_cod"].map(codici)
n_sconosciuti = voli["stato"].isna().sum()

print(voli)
print(n_sconosciuti)`
    },

    {
      type: "exercise", id: "pd-51", kg: 20, title: "Combo: il centro adozioni animali",
      task: `<p>Su <code>rifugio</code>: <code>cuccioli</code> (<code>eta &lt;= 2</code>), <code>rinominato</code> (<code>eta</code> rinominata <code>eta_anni</code>), <code>adottati_cuccioli</code> (via <code>.query</code>: <code>eta &lt;= 2 and adottato == True</code>).</p>`,
      setup: `import pandas as pd
rifugio = pd.DataFrame({
    "animale": ["cane", "gatto", "coniglio", "cane"],
    "eta": [2, 5, 1, 3],
    "adottato": [True, False, True, True],
})`,
      starter: `# rifugio e' gia' caricato
cuccioli = ...
rinominato = ...
adottati_cuccioli = ...

print(cuccioli)
print(adottati_cuccioli)`,
      check: `assert len(cuccioli) == 2
assert "eta_anni" in rinominato.columns and "eta" not in rinominato.columns
assert len(adottati_cuccioli) == 2`,
      hint: `<p><code>.query("eta &lt;= 2 and adottato == True")</code> — le stringhe booleane vanno bene anche senza <code>== True</code>, ma qui è più esplicito.</p>`,
      solution: `cuccioli = rifugio[rifugio["eta"] <= 2]
rinominato = rifugio.rename(columns={"eta": "eta_anni"})
adottati_cuccioli = rifugio.query("eta <= 2 and adottato == True")

print(cuccioli)
print(adottati_cuccioli)`
    },

    {
      type: "exercise", id: "pd-52", kg: 20, title: "Combo: il margine dei film in streaming",
      task: `<p>Su <code>stream2</code>: crea <code>margine</code> (<code>visualizzazioni - costo_produzione</code>), poi <code>top2_margine</code>: i 2 film col margine più alto, solo colonne <code>film</code> e <code>margine</code>.</p>`,
      setup: `import pandas as pd
stream2 = pd.DataFrame({
    "film": ["A", "B", "C", "D"],
    "visualizzazioni": [1000, 2500, 800, 3000],
    "costo_produzione": [500, 1200, 300, 2000],
})`,
      starter: `# stream2 e' gia' caricato
stream2["margine"] = ...
top2_margine = ...

print(top2_margine)`,
      check: `assert stream2["margine"].tolist() == [500, 1300, 500, 1000]
assert top2_margine["film"].tolist() == ["B", "D"]
assert list(top2_margine.columns) == ["film", "margine"]`,
      hint: `<p><code>stream2.nlargest(2, "margine")[["film", "margine"]]</code>.</p>`,
      solution: `stream2["margine"] = stream2["visualizzazioni"] - stream2["costo_produzione"]
top2_margine = stream2.nlargest(2, "margine")[["film", "margine"]]

print(top2_margine)`
    },

    {
      type: "exercise", id: "pd-53", kg: 20, title: "Combo: fasce di voto degli studenti",
      task: `<p>Su <code>esame</code>: crea <code>fascia</code> con <code>pd.cut</code>: soglie <code>[0, 10, 20, 30]</code>, etichette <code>["basso","medio","alto"]</code> sul voto.</p>`,
      setup: `import pandas as pd
esame = pd.DataFrame({
    "studente": ["A", "B", "C", "D"],
    "voto": [15, 22, 28, 10],
})`,
      starter: `# esame e' gia' caricato
esame["fascia"] = ...
print(esame)`,
      check: `assert esame["fascia"].tolist() == ["medio", "alto", "alto", "basso"]`,
      hint: `<p><code>pd.cut(esame["voto"], bins=[0, 10, 20, 30], labels=["basso", "medio", "alto"])</code> — 10 cade nella prima fascia (estremo destro incluso).</p>`,
      solution: `esame["fascia"] = pd.cut(esame["voto"], bins=[0, 10, 20, 30], labels=["basso", "medio", "alto"])
print(esame)`
    },

    {
      type: "exercise", id: "pd-54", kg: 25, title: "Combo: i prodotti coi resi più alti",
      task: `<p>Su <code>vendite</code>: <code>alte_reso</code>: i prodotti con più di 10 resi, ordinati per resi decrescente, solo colonne <code>prodotto</code> e <code>resi</code>.</p>`,
      setup: `import pandas as pd
vendite = pd.DataFrame({
    "prodotto": ["A", "B", "C", "D", "E"],
    "resi": [5, 20, 2, 15, 30],
    "vendute": [100, 90, 50, 120, 200],
})`,
      starter: `# vendite e' gia' caricato
alte_reso = ...
print(alte_reso)`,
      check: `assert alte_reso["prodotto"].tolist() == ["E", "B", "D"]
assert list(alte_reso.columns) == ["prodotto", "resi"]`,
      hint: `<p>Filtra <code>resi &gt; 10</code>, poi ordina per resi decrescente, poi seleziona le due colonne.</p>`,
      solution: `alte_reso = vendite[vendite["resi"] > 10].sort_values("resi", ascending=False)[["prodotto", "resi"]]
print(alte_reso)`
    },

    {
      type: "exercise", id: "pd-55", kg: 25, title: "Combo: posti letto in ospedale",
      task: `<p>Su <code>osp</code> (con NaN in <code>posti_letto</code>): <code>n_mancanti</code> e <code>posti_pieno</code> (NaN riempiti con la media dei valori presenti).</p>`,
      setup: `import pandas as pd
import numpy as np
osp = pd.DataFrame({
    "reparto": ["cardio", "orto", "cardio", "neuro"],
    "posti_letto": [20.0, np.nan, 15.0, np.nan],
})`,
      starter: `# osp e' gia' caricato
n_mancanti = ...
posti_pieno = ...

print(n_mancanti)
print(posti_pieno)`,
      check: `assert n_mancanti == 2
assert abs(posti_pieno.iloc[1] - 17.5) < 1e-9
assert abs(posti_pieno.iloc[3] - 17.5) < 1e-9`,
      hint: `<p>La media dei valori presenti (20, 15) è 17.5.</p>`,
      solution: `n_mancanti = osp["posti_letto"].isna().sum()
posti_pieno = osp["posti_letto"].fillna(osp["posti_letto"].mean())

print(n_mancanti)
print(posti_pieno)`
    },

    {
      type: "exercise", id: "pd-56", kg: 25, title: "Massimale: i soci veterani della palestra",
      task: `<p>Su <code>soci</code>, in un'unica pipeline:</p>
<ul>
<li><code>soci["totale_speso"]</code>: <code>mesi_iscrizione * quota_mensile</code></li>
<li><code>soci["fedelta"]</code>: <code>pd.cut</code> su <code>mesi_iscrizione</code>, soglie <code>[0, 3, 12, 24]</code>, etichette <code>["nuovo","abituale","veterano"]</code></li>
<li><code>veterani</code>: solo i soci con fedeltà <code>"veterano"</code></li>
<li><code>riepilogo</code>: f-string <code>"N membri veterani, spesa totale: X.XX"</code></li>
</ul>`,
      setup: `import pandas as pd
soci = pd.DataFrame({
    "membro": ["m1", "m2", "m3", "m4", "m5"],
    "mesi_iscrizione": [3, 12, 6, 24, 1],
    "quota_mensile": [30, 25, 30, 20, 35],
})`,
      starter: `# soci e' gia' caricato
soci["totale_speso"] = ...
soci["fedelta"] = ...
veterani = ...
riepilogo = ...

print(soci)
print(riepilogo)`,
      check: `import pandas as pd
assert soci["totale_speso"].tolist() == [90, 300, 180, 480, 35]
assert soci["fedelta"].tolist() == ["nuovo", "abituale", "abituale", "veterano", "nuovo"]
assert len(veterani) == 1
assert riepilogo == "1 membri veterani, spesa totale: 480.00"`,
      hint: `<p>Solo m4 (24 mesi) cade nella fascia veterano (12, 24]. <code>f"{len(veterani)} membri veterani, spesa totale: {veterani['totale_speso'].sum():.2f}"</code>.</p>`,
      solution: `soci["totale_speso"] = soci["mesi_iscrizione"] * soci["quota_mensile"]
soci["fedelta"] = pd.cut(soci["mesi_iscrizione"], bins=[0, 3, 12, 24], labels=["nuovo", "abituale", "veterano"])
veterani = soci[soci["fedelta"] == "veterano"]
riepilogo = f"{len(veterani)} membri veterani, spesa totale: {veterani['totale_speso'].sum():.2f}"

print(soci)
print(riepilogo)`
    },

    {
      type: "exercise", id: "pd-57", kg: 25, title: "Massimale: incasso e livello dei prodotti",
      task: `<p>Su <code>prod</code> (con un NaN in <code>prezzo</code>): riempi il prezzo mancante con la mediana, calcola <code>incasso</code> (<code>prezzo * venduti</code>), poi <code>livello</code> con <code>np.where</code>: <code>"top"</code> se incasso &gt; 800, altrimenti <code>"standard"</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
prod = pd.DataFrame({
    "prodotto": ["p1", "p2", "p3", "p4"],
    "prezzo": [10.0, np.nan, 25.0, 15.0],
    "venduti": [100, 50, 20, 80],
})`,
      starter: `import numpy as np
# prod e' gia' caricato
prod["prezzo"] = prod["prezzo"].fillna(prod["prezzo"].median())
prod["incasso"] = ...
prod["livello"] = ...

print(prod)`,
      check: `import numpy as np
assert abs(prod.loc[1, "prezzo"] - 15.0) < 1e-9, "La mediana di [10, 25, 15] e' 15"
assert prod["incasso"].tolist() == [1000.0, 750.0, 500.0, 1200.0]
assert prod["livello"].tolist() == ["top", "standard", "standard", "top"]`,
      hint: `<p><code>np.where(prod["incasso"] &gt; 800, "top", "standard")</code>.</p>`,
      solution: `import numpy as np
prod["prezzo"] = prod["prezzo"].fillna(prod["prezzo"].median())
prod["incasso"] = prod["prezzo"] * prod["venduti"]
prod["livello"] = np.where(prod["incasso"] > 800, "top", "standard")

print(prod)`
    },

    {
      type: "exercise", id: "pd-58", kg: 25, title: "Massimale: i corrieri più efficienti",
      task: `<p>Su <code>cons3</code>: calcola <code>costo</code> (<code>pacchi * 2.5</code>) ed <code>efficienza</code> (<code>pacchi / km</code>), poi <code>migliori</code>: i 2 corrieri con efficienza più alta, solo colonne <code>corriere</code> e <code>efficienza</code>.</p>`,
      setup: `import pandas as pd
cons3 = pd.DataFrame({
    "corriere": ["A", "B", "C", "D"],
    "pacchi": [10, 25, 5, 40],
    "km": [30, 80, 20, 60],
})`,
      starter: `# cons3 e' gia' caricato
cons3["costo"] = ...
cons3["efficienza"] = ...
migliori = ...

print(migliori)`,
      check: `assert cons3["costo"].tolist() == [25.0, 62.5, 12.5, 100.0]
assert migliori["corriere"].tolist() == ["D", "A"]
assert list(migliori.columns) == ["corriere", "efficienza"]`,
      hint: `<p>Efficienza: 10/30≈0.33, 25/80≈0.31, 5/20=0.25, 40/60≈0.67 — D vince, poi A.</p>`,
      solution: `cons3["costo"] = cons3["pacchi"] * 2.5
cons3["efficienza"] = cons3["pacchi"] / cons3["km"]
migliori = cons3.nlargest(2, "efficienza")[["corriere", "efficienza"]]

print(migliori)`
    },

    {
      type: "exercise", id: "pd-59", kg: 25, title: "Massimale: rendimento per ora di studio",
      task: `<p>Su <code>esame2</code>: calcola <code>voto_per_ora</code> (<code>voto / ore_studio</code>), poi <code>report</code>: gli studenti con <code>voto_per_ora &gt; 4</code>, colonne <code>studente</code> e <code>voto_per_ora</code>, ordinati decrescente.</p>`,
      setup: `import pandas as pd
esame2 = pd.DataFrame({
    "studente": ["A", "B", "C", "D", "E"],
    "voto": [28, 15, 22, 30, 10],
    "ore_studio": [10, 3, 7, 12, 1],
})`,
      starter: `# esame2 e' gia' caricato
esame2["voto_per_ora"] = ...
report = ...

print(report)`,
      check: `import pandas as pd
assert abs(float(esame2.loc[1, "voto_per_ora"]) - 5.0) < 1e-9
assert report["studente"].tolist() == ["E", "B"]
assert list(report.columns) == ["studente", "voto_per_ora"]`,
      hint: `<p>voto_per_ora: A=2.8, B=5.0, C≈3.14, D=2.5, E=10.0 — solo B ed E superano 4, con E in testa.</p>`,
      solution: `esame2["voto_per_ora"] = esame2["voto"] / esame2["ore_studio"]
report = esame2[esame2["voto_per_ora"] > 4][["studente", "voto_per_ora"]].sort_values("voto_per_ora", ascending=False)

print(report)`
    },

    {
      type: "exercise", id: "pd-60", kg: 25, title: "Massimale: soci pro fedeli",
      task: `<p>Su <code>soci2</code> (<code>piano_cod</code>: 0=base, 1=pro, 2=elite): crea <code>piano</code> con <code>.map()</code>, poi <code>pro_lunghi</code> (via <code>.query</code>: piano <code>"pro"</code> e <code>mesi &gt; 10</code>) e <code>riepilogo</code> (f-string <code>"N soci pro fedeli da oltre 10 mesi"</code>).</p>`,
      setup: `import pandas as pd
soci2 = pd.DataFrame({
    "membro": ["m1", "m2", "m3", "m4"],
    "piano_cod": [0, 1, 2, 1],
    "mesi": [3, 15, 8, 20],
})`,
      starter: `# soci2 e' gia' caricato
codici = {0: "base", 1: "pro", 2: "elite"}
soci2["piano"] = ...
pro_lunghi = ...
riepilogo = ...

print(soci2)
print(riepilogo)`,
      check: `assert soci2.loc[1, "piano"] == "pro"
assert len(pro_lunghi) == 2
assert riepilogo == "2 soci pro fedeli da oltre 10 mesi"`,
      hint: `<p><code>soci2.query("piano == 'pro' and mesi > 10")</code> — m2 (15 mesi) e m4 (20 mesi).</p>`,
      solution: `codici = {0: "base", 1: "pro", 2: "elite"}
soci2["piano"] = soci2["piano_cod"].map(codici)
pro_lunghi = soci2.query("piano == 'pro' and mesi > 10")
riepilogo = f"{len(pro_lunghi)} soci pro fedeli da oltre 10 mesi"

print(soci2)
print(riepilogo)`
    }
  ]
});
