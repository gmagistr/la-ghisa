window.MODULES.push({
  id: "pulizia",
  name: "Pulizia & EDA",
  tagline: "La sala funzionale: dati sporchi, duplicati, outlier. Il lavoro vero che nessuno mette su Instagram.",
  intro: "L'80% della data science è questo: capire cosa c'è nel dataset e sistemarlo senza mentire a se stessi. Ogni esercizio qui è un caso realmente accaduto a qualcuno (probabilmente anche a te).",
  packages: ["pandas"],
  items: [

    { type: "theory", title: "EDA: prima guardare, poi toccare", html: `
<p>L'<strong>analisi esplorativa</strong> (EDA) è il check-up prima dell'allenamento. Tre comandi, sempre nello stesso ordine:</p>
<pre><code>df.info()       # righe, colonne, tipi, quanti valori NON nulli
df.describe()   # min, max, media, quartili delle colonne numeriche
df.isna().sum() # la mappa dei buchi</code></pre>
<p><code>describe()</code> è un metal detector: un <code>min</code> negativo su un carico, un <code>max</code> assurdo su una durata, una media lontanissima dalla mediana (50%) — ognuno di questi è un problema trovato <em>prima</em> che rovini l'analisi. Impara a leggerlo riga per riga.</p>
`, more: `
<p>Per default <code>describe()</code> mostra solo le colonne NUMERICHE. Per includere anche le colonne di testo/categoriali, <code>df.describe(include="all")</code> aggiunge statistiche pensate per il testo: <code>unique</code> (quante categorie distinte), <code>top</code> (la più frequente), <code>freq</code> (quante volte compare) — l'equivalente testuale di media e deviazione standard.</p>
<p>Il confronto tra media e mediana (la colonna <code>50%</code> di <code>describe()</code>) è una diagnosi rapida di asimmetria: se sono vicine, la distribuzione è abbastanza simmetrica; se la media è molto più alta della mediana, pochi valori enormi la stanno "tirando su" — un sintomo tipico di outlier o di una distribuzione con coda lunga (es. stipendi, dove pochi valori altissimi alzano la media ma non la mediana).</p>
<p>Un'abitudine da costruire PRIMA di <code>describe()</code>: guardare <code>df.shape</code>. Sembra banale, ma sapere che il dataset ha 40.000 righe invece delle 400 che ti aspettavi cambia immediatamente il modo di leggere ogni altra statistica — un errore di caricamento (es. un file duplicato per sbaglio) si nota subito guardando le dimensioni, prima ancora di guardare i contenuti.</p>
` },

    {
      type: "exercise", id: "cl-01", kg: 10, title: "Il check-up",
      task: `<p>Il DataFrame <code>grezzo</code> (già caricato) viene da un collega frettoloso. Diagnostica senza correggere:</p>
<ul>
<li><code>buchi</code>: la Series dei NaN per colonna</li>
<li><code>durata_min</code>: il valore minimo della colonna <code>durata</code> (che noterai essere... sospetto)</li>
<li><code>n_negativi</code>: quante durate sono negative (fisicamente impossibili!)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
grezzo = pd.DataFrame({
    "item": ["w01", "w02", "w03", "w04", "w05", "w06", "w07", "w08"],
    "durata": [95.0, -12.0, 88.0, np.nan, 102.0, 74.0, -5.0, 91.0],
    "kg": [810.0, 300.0, np.nan, 470.0, 790.0, 330.0, 465.0, 805.0],
})`,
      starter: `# grezzo e' gia' caricato
print(grezzo.describe())

buchi = ...
durata_min = ...
n_negativi = ...

print(buchi)
print(durata_min, n_negativi)`,
      check: `import pandas as pd
assert 'buchi' in globals() and buchi["durata"] == 1 and buchi["kg"] == 1, "buchi: grezzo.isna().sum()"
assert 'durata_min' in globals() and float(durata_min) == -12.0, "durata_min: grezzo['durata'].min() — una durata di -12 secondi non esiste in natura"
assert 'n_negativi' in globals() and int(n_negativi) == 2, "n_negativi deve essere 2: somma la maschera grezzo['durata'] < 0"`,
      hint: `<p>La riga <code>min</code> di <code>describe()</code> ti aveva già mostrato il -12. Il conteggio: <code>(grezzo["durata"] &lt; 0).sum()</code>.</p>`,
      solution: `print(grezzo.describe())

buchi = grezzo.isna().sum()
durata_min = grezzo["durata"].min()
n_negativi = int((grezzo["durata"] < 0).sum())

print(buchi)
print(durata_min, n_negativi)`
    },

    { type: "theory", title: "Duplicati: righe fotocopiate", html: `
<p>Export doppi, copia-incolla, join sbagliati: le righe duplicate gonfiano i conteggi e falsano le medie. Gli attrezzi:</p>
<pre><code>df.duplicated()                  # maschera: True sulle COPIE (la prima occorrenza e' False)
df.duplicated().sum()            # quante copie
df.drop_duplicates()             # tiene la prima di ogni gruppo di cloni
df.drop_duplicates(subset=["item"], keep="last")   # doppioni giudicati solo su 'item'</code></pre>
<p><code>subset</code> è la decisione importante: due righe possono essere duplicate <em>concettualmente</em> (stesso item, stesso atleta) anche se una colonna di contorno differisce. Decidi tu qual è l'identità di una riga.</p>
`, more: `
<p><code>keep</code> ha tre modalità, non solo due: <code>keep="first"</code> (default, tiene la prima occorrenza), <code>keep="last"</code> (tiene l'ultima — utile quando l'ultima registrazione è quella più aggiornata, come in un log di sistema), <code>keep=False</code> (butta TUTTE le occorrenze del gruppo, comprese la prima — utile quando un duplicato è talmente sospetto da non fidarsi di nessuna delle sue copie).</p>
<p>Prima di decidere il <code>subset</code>, è utile ISPEZIONARE i duplicati invece di eliminarli alla cieca: <code>df[df.duplicated(subset=["item"], keep=False)].sort_values("item")</code> mostra tutte le coppie di righe sospette una accanto all'altra, permettendoti di vedere SE le colonne che differiscono sono rumore (es. un timestamp diverso di pochi secondi) o segnale (es. un valore radicalmente diverso, che potrebbe indicare un errore di misura invece di una vera duplicazione).</p>
<p>Un caso pratico che genera duplicati "silenziosi": un <code>merge</code> con una chiave che ha ripetizioni in entrambe le tabelle (visto anche nella sala Pandas Potenza). Se dopo un merge il numero di righe è cresciuto in modo inatteso, il sospetto numero uno non è "ho dei duplicati nel dataset originale" ma "il merge li ha creati lui" — vale la pena controllare <code>len()</code> prima e dopo ogni merge, non solo alla fine della pipeline.</p>
` },

    {
      type: "exercise", id: "cl-02", kg: 15, title: "Caccia ai cloni",
      task: `<p>Nel registro <code>reg</code> qualche riga è entrata due volte. Fai:</p>
<ul>
<li><code>n_cloni</code>: quante righe sono duplicati esatti (intero)</li>
<li><code>pulito</code>: il DataFrame senza duplicati esatti</li>
<li><code>pulito_item</code>: da <code>pulito</code>, tieni una sola riga per <code>item</code> (la <strong>prima</strong>) — scoprirai che c'era anche un doppione subdolo con durata diversa</li>
</ul>`,
      setup: `import pandas as pd
reg = pd.DataFrame({
    "item": ["w01", "w02", "w02", "w03", "w04", "w04", "w05"],
    "durata": [95.0, 88.0, 88.0, 74.0, 91.0, 89.0, 102.0],
})`,
      starter: `# reg e' gia' caricato
print(reg)

n_cloni = ...
pulito = ...
pulito_item = ...

print(pulito_item)`,
      check: `import pandas as pd
assert 'n_cloni' in globals() and int(n_cloni) == 1, "n_cloni deve essere 1: solo la seconda w02 e' un clone esatto (w04 ha durate diverse)"
assert 'pulito' in globals() and len(pulito) == 6, "pulito: drop_duplicates() — restano 6 righe"
assert 'pulito_item' in globals() and len(pulito_item) == 5 and float(pulito_item.loc[pulito_item["item"] == "w04", "durata"].iloc[0]) == 91.0, "pulito_item: drop_duplicates(subset=['item']) — per w04 resta la prima (91.0)"`,
      hint: `<p>Le due righe w04 non sono cloni esatti (91 vs 89): <code>duplicated()</code> non le vede. Solo <code>subset=["item"]</code> le tratta come lo stesso item misurato due volte.</p>`,
      solution: `print(reg)

n_cloni = int(reg.duplicated().sum())
pulito = reg.drop_duplicates()
pulito_item = pulito.drop_duplicates(subset=["item"])

print(pulito_item)`
    },

    { type: "theory", title: "Tipi sporchi: numeri travestiti da testo", html: `
<p>Il classico: il CSV usa la virgola decimale ("12,5") o ha spazi o unità appiccicate ("95 kg"), e Pandas legge la colonna come <code>object</code> (testo). Da lì, niente medie, niente confronti. La cura è in due mosse — ripulire il testo, poi convertire:</p>
<pre><code>df["x"] = df["x"].str.replace(",", ".").astype(float)
pd.to_numeric(df["x"], errors="coerce")   # alternativa tollerante: l'inconvertibile diventa NaN</code></pre>
<p><code>errors="coerce"</code> è prezioso: invece di esplodere sul primo valore marcio, lo trasforma in NaN che poi conti e gestisci come sai già fare.</p>
`, more: `
<p><code>pd.to_numeric</code> ha una terza modalità oltre a <code>"coerce"</code>: <code>errors="raise"</code> (il default, solleva un'eccezione al primo valore non convertibile — utile quando vuoi che il programma si fermi e ti costringa a guardare il dato marcio) ed <code>errors="ignore"</code> (lascia la colonna invariata se anche un solo valore fallisce — raramente quello che vuoi, perché nasconde silenziosamente il problema).</p>
<p>Altri "numeri travestiti da testo" comuni oltre alla virgola decimale: simboli di valuta appiccicati (<code>"€ 95,30"</code>), separatori delle migliaia (<code>"1.234"</code> in stile europeo, che va tolto PRIMA di sostituire la virgola decimale altrimenti la confondi con essa), percentuali con il simbolo (<code>"12%"</code>, da togliere e poi eventualmente dividere per 100). La sequenza generale è sempre: rimuovi i simboli non numerici con <code>.str.replace()</code>, poi converti con <code>to_numeric</code>.</p>
<p>Un controllo di sanità dopo ogni conversione: confronta <code>len(df)</code> prima e <code>df["colonna"].notna().sum()</code> dopo. Se il numero di valori validi è molto più basso delle righe totali, il pattern di pulizia che hai scritto probabilmente non copre tutti i formati presenti nella colonna — vale la pena guardare <code>df[df["colonna_num"].isna()]["colonna"].unique()</code> per vedere ESATTAMENTE quali stringhe non sono state riconosciute.</p>
` },

    {
      type: "exercise", id: "cl-03", kg: 15, title: "Sistema la virgola decimale",
      task: `<p>Il CSV di <code>eu</code> arriva da un'app europea: i kg sollevati sono scritti come <code>"95,3"</code>. E c'è pure un <code>"errore"</code> testuale in mezzo. Fai:</p>
<ul>
<li><code>eu["kg_num"]</code>: sostituisci la virgola col punto e converti con <code>pd.to_numeric(..., errors="coerce")</code></li>
<li><code>n_falliti</code>: quanti valori non erano convertibili</li>
<li><code>media_ok</code>: la media dei valori convertiti (i NaN si escludono da soli)</li>
</ul>`,
      setup: `import pandas as pd
eu = pd.DataFrame({
    "item": ["w01", "w02", "w03", "w04", "w05"],
    "kg": ["95,3", "88,0", "errore", "74,5", "102,2"],
})`,
      starter: `import pandas as pd
# eu e' gia' caricato: guarda il dtype!
print(eu.dtypes)

eu["kg_num"] = ...
n_falliti = ...
media_ok = ...

print(eu)
print(media_ok)`,
      check: `import pandas as pd
assert "kg_num" in eu.columns and str(eu["kg_num"].dtype).startswith("float"), "kg_num deve essere float: str.replace(',', '.') poi pd.to_numeric(..., errors='coerce')"
assert abs(float(eu.loc[0, "kg_num"]) - 95.3) < 1e-9, "Il primo valore deve essere 95.3"
assert 'n_falliti' in globals() and int(n_falliti) == 1, "n_falliti deve essere 1: 'errore' e' diventato NaN"
assert 'media_ok' in globals() and abs(float(media_ok) - 90.0) < 1e-9, "media_ok: la media di 95.3, 88.0, 74.5, 102.2 = 90.0"`,
      hint: `<p>Catena: <code>pd.to_numeric(eu["kg"].str.replace(",", "."), errors="coerce")</code>. Poi <code>.isna().sum()</code> e <code>.mean()</code> sulla colonna nuova.</p>`,
      solution: `import pandas as pd
print(eu.dtypes)

eu["kg_num"] = pd.to_numeric(eu["kg"].str.replace(",", "."), errors="coerce")
n_falliti = int(eu["kg_num"].isna().sum())
media_ok = eu["kg_num"].mean()

print(eu)
print(media_ok)`
    },

    { type: "theory", title: "Categorie sporche: spazi, maiuscole, refusi", html: `
<p>Un'altra fonte classicissima di guai: la stessa categoria scritta in modi diversi — <code>"Squat"</code>, <code>"squat "</code>, <code>"SQUAT"</code> — che Pandas tratta come <strong>tre categorie distinte</strong>. Il sintomo si vede subito con <code>value_counts()</code>: troppe categorie per un dato che dovrebbe averne poche.</p>
<pre><code>df["esercizio"].value_counts()   # 'Squat', 'squat ', 'SQUAT' separati: campanello d'allarme

df["esercizio"] = df["esercizio"].str.strip().str.lower()   # spazi via, tutto minuscolo
df["esercizio"] = df["esercizio"].replace({"stach": "stacco"})   # refusi noti, uno per uno</code></pre>
<p>La sequenza <code>.str.strip().str.lower()</code> è il primo passo quasi automatico su ogni colonna categoriale che arriva da input umano (moduli, fogli Excel, form web).</p>
`, more: `
<p>Oltre agli spazi esterni (<code>.strip()</code>), esistono spazi MULTIPLI interni ("data   science" con tre spazi) che <code>strip</code> non tocca: <code>.str.replace(r"\\s+", " ", regex=True)</code> comprime qualsiasi sequenza di spazi in uno solo — un passo aggiuntivo utile su testo libero incollato da fonti diverse (PDF, form web, copia-incolla da Excel).</p>
<p>Per refusi non catalogabili con un semplice <code>.replace()</code> a dizionario (troppe varianti, o non sai a priori quali refusi esistono), una tecnica più robusta è il "matching fuzzy": librerie come <code>rapidfuzz</code> calcolano una distanza testuale tra stringhe e permettono di raggruppare automaticamente "stach", "stcco", "stacc" tutti come varianti della stessa categoria "stacco" — utile su dataset grandi dove elencare ogni refuso a mano non è praticabile.</p>
<p>Un controllo di sanità dopo la normalizzazione: <code>df["colonna"].value_counts()</code> dovrebbe produrre un numero di categorie "ragionevole" per il dominio (se ti aspetti 3 esercizi e ne trovi ancora 5, c'è un refuso residuo). Non fidarti mai ciecamente della prima passata di pulizia: rileggi sempre il <code>value_counts()</code> DOPO per confermare che il numero di categorie è quello atteso.</p>
` },

    {
      type: "exercise", id: "cl-04", kg: 15, title: "Normalizza le categorie",
      task: `<p>La colonna <code>esercizio</code> di <code>sporca</code> ha spazi, maiuscole sparse e un refuso ("stach" per "stacco"). Fai:</p>
<ul>
<li><code>n_categorie_prima</code>: quante categorie distinte <strong>prima</strong> di pulire (<code>.nunique()</code>)</li>
<li><code>sporca["esercizio"]</code>: sovrascrivi pulendo con <code>.str.strip().str.lower()</code>, poi correggi il refuso con <code>.replace({"stach": "stacco"})</code></li>
<li><code>n_categorie_dopo</code>: quante categorie distinte dopo (dovrebbero essere solo 3: squat, panca, stacco)</li>
</ul>`,
      setup: `import pandas as pd
sporca = pd.DataFrame({
    "esercizio": ["Squat", "squat ", "PANCA", "stach", "Stacco", " squat", "panca "],
    "kg": [80, 82, 60, 100, 102, 81, 61],
})`,
      starter: `# sporca e' gia' caricato
print(sporca["esercizio"].value_counts())

n_categorie_prima = ...
sporca["esercizio"] = ...
n_categorie_dopo = ...

print(sporca["esercizio"].value_counts())
print(n_categorie_prima, n_categorie_dopo)`,
      check: `import pandas as pd
assert 'n_categorie_prima' in globals() and int(n_categorie_prima) == 7, "n_categorie_prima: sporca['esercizio'].nunique() prima della pulizia — 7 varianti diverse"
assert set(sporca["esercizio"].unique()) == {"squat", "panca", "stacco"}, "Dopo strip+lower+replace devono restare solo 3 categorie: squat, panca, stacco"
assert 'n_categorie_dopo' in globals() and int(n_categorie_dopo) == 3, "n_categorie_dopo deve essere 3"`,
      hint: `<p>Ordine giusto: prima <code>.str.strip()</code> (via gli spazi), poi <code>.str.lower()</code> (uniforma il case), infine <code>.replace({"stach": "stacco"})</code> per il refuso che rimane anche dopo la normalizzazione.</p>`,
      solution: `print(sporca["esercizio"].value_counts())

n_categorie_prima = sporca["esercizio"].nunique()
sporca["esercizio"] = sporca["esercizio"].str.strip().str.lower().replace({"stach": "stacco"})
n_categorie_dopo = sporca["esercizio"].nunique()

print(sporca["esercizio"].value_counts())
print(n_categorie_prima, n_categorie_dopo)`
    },

    { type: "theory", title: "Riempire i buchi con criterio: transform", html: `
<p>Riempire i NaN con la media globale è rozzo: se mancano i kg di un esercizio di isolamento, riempirli con la media di <em>tutti</em> gli esercizi (compresi gli squat pesanti) inventa dati assurdi. Meglio la <strong>media del gruppo giusto</strong>.</p>
<p>Serve un attrezzo nuovo: <code>groupby(...).transform("mean")</code> calcola la media per gruppo ma la <strong>riespande su tutte le righe originali</strong> (stessa lunghezza del DataFrame), pronta per un fillna allineato:</p>
<pre><code>medie_gruppo = df.groupby("esercizio")["kg"].transform("mean")  # una riga per riga!
df["kg"] = df["kg"].fillna(medie_gruppo)</code></pre>
<p>Differenza chiave: <code>agg/mean</code> restituisce una riga <em>per gruppo</em>, <code>transform</code> una riga <em>per osservazione</em>. Quando devi combinare statistiche di gruppo con le righe originali, è quasi sempre <code>transform</code>.</p>
`, more: `
<p><code>transform</code> non è limitato a <code>"mean"</code>: accetta qualsiasi funzione di aggregazione (<code>"median"</code>, <code>"std"</code>, <code>"max"</code>) e persino funzioni personalizzate. Un uso frequente oltre al riempimento dei NaN è la normalizzazione per gruppo: <code>df["kg_normalizzato"] = df["kg"] - df.groupby("esercizio")["kg"].transform("mean")</code> centra ogni valore rispetto alla media del SUO gruppo — utile per confrontare "quanto sopra/sotto la propria media" un atleta è su esercizi che hanno scale di carico molto diverse (squat vs trazioni).</p>
<p>Lo z-score per gruppo (visto anche in un esercizio di questa sala) è esattamente <code>transform</code> applicato due volte: una per la media, una per la deviazione standard, poi la formula standard <code>(x - media) / std</code> — l'errore da evitare è calcolare media e std GLOBALI quando i gruppi hanno scale diverse, perché produce z-score fuorvianti (valori piccoli in un gruppo con numeri grandi sembrano outlier per il solo fatto di appartenere a un gruppo diverso).</p>
<p>Una regola pratica per scegliere tra <code>agg</code> e <code>transform</code>: se la domanda è "voglio UNA riga di riepilogo per gruppo" (es. un report), serve <code>agg</code>; se la domanda è "voglio arricchire/modificare le righe ORIGINALI con un'informazione di gruppo" (es. riempire NaN, normalizzare, marcare outlier), serve <code>transform</code> — la lunghezza del risultato è il segnale: uguale al numero di gruppi → agg, uguale al numero di righe originali → transform.</p>
` },

    {
      type: "exercise", id: "cl-05", kg: 20, title: "Riempi con la media del gruppo",
      task: `<p>In <code>voc</code> mancano due kg (uno squat e una trazioni). Riempirli con la media globale sarebbe un errore da principianti (squat e trazioni non sono comparabili). Fai:</p>
<ul>
<li><code>medie_per_esercizio</code>: il <code>transform("mean")</code> di kg raggruppato per esercizio (Series lunga quanto voc)</li>
<li><code>voc["kg_pieno"]</code>: kg con i NaN riempiti da <code>medie_per_esercizio</code></li>
<li><code>valore_squat</code>: il valore imputato allo squat mancante (riga con item w03), come float</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
voc = pd.DataFrame({
    "item": ["w01", "w02", "w03", "w04", "w05", "w06", "w07", "w08"],
    "esercizio": ["squat", "squat", "squat", "trazioni", "trazioni", "trazioni", "squat", "trazioni"],
    "kg": [810.0, 790.0, np.nan, 30.0, np.nan, 29.0, 800.0, 31.0],
})`,
      starter: `# voc e' gia' caricato
print(voc)

medie_per_esercizio = ...
voc["kg_pieno"] = ...
valore_squat = ...

print(voc)`,
      check: `import pandas as pd
assert 'medie_per_esercizio' in globals() and len(medie_per_esercizio) == 8, "medie_per_esercizio deve avere 8 valori (uno per riga): e' transform, non mean!"
assert "kg_pieno" in voc.columns and voc["kg_pieno"].isna().sum() == 0, "kg_pieno non deve avere NaN"
assert 'valore_squat' in globals() and abs(float(valore_squat) - 800.0) < 1e-9, "Lo squat mancante va riempito con la media degli ALTRI squat: (810+790+800)/3 = 800"
assert abs(float(voc.loc[4, "kg_pieno"]) - 30.0) < 1e-9, "La trazioni mancante deve ricevere 30.0 (media delle altre trazioni), non la media globale"`,
      hint: `<p><code>voc.groupby("esercizio")["kg"].transform("mean")</code> ignora i NaN nel calcolo e restituisce, per ogni riga, la media del <em>suo</em> esercizio. Poi <code>fillna(medie_per_esercizio)</code>.</p>`,
      solution: `print(voc)

medie_per_esercizio = voc.groupby("esercizio")["kg"].transform("mean")
voc["kg_pieno"] = voc["kg"].fillna(medie_per_esercizio)
valore_squat = float(voc.loc[2, "kg_pieno"])

print(voc)`
    },

    { type: "theory", title: "Outlier con il metodo IQR", html: `
<p>Oltre allo z-score (visto in NumPy) c'è il metodo dei quartili, più robusto perché non usa la media. L'<strong>IQR</strong> (interquartile range) è la distanza tra il 25° e il 75° percentile; è "normale" ciò che sta entro 1.5 IQR dai quartili:</p>
<pre><code>q1 = df["x"].quantile(0.25)
q3 = df["x"].quantile(0.75)
iqr = q3 - q1
basso, alto = q1 - 1.5 * iqr, q3 + 1.5 * iqr
outlier = (df["x"] &lt; basso) | (df["x"] &gt; alto)
df["x_clip"] = df["x"].clip(basso, alto)    # "clippare": schiacciare ai limiti</code></pre>
<p>È la stessa regola dei baffi del boxplot. <code>clip</code> è l'alternativa gentile all'eliminazione: tiene la riga ma contiene il valore estremo.</p>
`, more: `
<p>Il coefficiente 1.5 nella formula (<code>q1 - 1.5*iqr</code>, <code>q3 + 1.5*iqr</code>) è una convenzione, non una legge fisica — è lo stesso valore usato per disegnare i "baffi" di un boxplot. Un valore più aggressivo come 3.0 individua solo gli outlier più estremi ("outlier estremi" vs "outlier moderati" nella terminologia del boxplot); la scelta dipende da quanto sei disposto a essere severo nel marcare un dato come sospetto.</p>
<p>Tra eliminare la riga (<code>df[~outlier]</code>) e clippare (<code>.clip()</code>), la scelta dipende dal motivo dell'outlier: se è chiaramente un errore di misura o di digitazione (un peso di "3000 kg" per una persona), clippare INVENTA comunque un valore ai limiti della recinzione — a volte è più onesto scartare la riga o marcarla come mancante (<code>NaN</code>) e poi trattarla con le tecniche di imputazione già viste, piuttosto che sostituirla con un numero arbitrario ai bordi della distribuzione.</p>
<p>Il metodo IQR presuppone che la maggior parte dei dati sia "normale" attorno alla mediana — su distribuzioni fortemente asimmetriche (es. redditi, dove pochi valori altissimi sono legittimi e non errori) l'IQR può marcare come outlier osservazioni perfettamente valide. In quei casi, una trasformazione preliminare (es. il logaritmo, già visto nella sala Pandas Fondamenta) spesso rende la distribuzione più simmetrica e il metodo IQR più affidabile.</p>
` },

    {
      type: "exercise", id: "cl-06", kg: 20, title: "La recinzione IQR",
      task: `<p>I tempi di recupero <code>rt</code> (secondi tra una serie e l'altra) hanno code sospette. Applica il protocollo IQR:</p>
<ul>
<li><code>q1</code>, <code>q3</code>, <code>iqr</code>: i quartili e la loro distanza</li>
<li><code>fuori</code>: la maschera degli outlier (sotto q1 − 1.5·IQR <strong>o</strong> sopra q3 + 1.5·IQR)</li>
<li><code>n_fuori</code>: quanti sono</li>
<li><code>rt["rt_clip"]</code>: la colonna clippata ai limiti della recinzione</li>
</ul>`,
      setup: `import pandas as pd
rt = pd.DataFrame({
    "rt": [90.0, 105.0, 95.0, 110.0, 85.0, 100.0, 98.0, 92.0, 320.0, 88.0, 96.0, 20.0],
})`,
      starter: `# rt e' gia' caricato
q1 = ...
q3 = ...
iqr = ...
fuori = ...
n_fuori = ...
rt["rt_clip"] = ...

print(q1, q3, iqr)
print(n_fuori)
print(rt["rt_clip"].max())`,
      check: `import pandas as pd
assert 'q1' in globals() and 'q3' in globals() and 'iqr' in globals() and abs(float(iqr) - (float(q3) - float(q1))) < 1e-9, "iqr = q3 - q1, con quantile(0.25) e quantile(0.75)"
assert 'fuori' in globals() and 'n_fuori' in globals() and int(n_fuori) == 2, "n_fuori deve essere 2: il 320 (troppo lento) e il 20 (troppo veloce)"
assert "rt_clip" in rt.columns and abs(float(rt["rt_clip"].max()) - (float(q3) + 1.5 * float(iqr))) < 1e-9, "rt_clip: clip(q1 - 1.5*iqr, q3 + 1.5*iqr) — il massimo deve coincidere col limite alto"
assert float(rt["rt_clip"].min()) >= float(q1) - 1.5 * float(iqr) - 1e-9, "Anche il minimo deve rientrare nella recinzione"`,
      hint: `<p>Con questi dati q1 e q3 vengono ~89.5 e ~101.25, quindi la recinzione è circa [72, 119]: il 320 e il 20 sono fuori. Maschera con <code>|</code> e parentesi.</p>`,
      solution: `q1 = rt["rt"].quantile(0.25)
q3 = rt["rt"].quantile(0.75)
iqr = q3 - q1
basso, alto = q1 - 1.5 * iqr, q3 + 1.5 * iqr
fuori = (rt["rt"] < basso) | (rt["rt"] > alto)
n_fuori = int(fuori.sum())
rt["rt_clip"] = rt["rt"].clip(basso, alto)

print(q1, q3, iqr)
print(n_fuori)
print(rt["rt_clip"].max())`
    },

    { type: "theory", title: "Binning: da continuo a categorie", html: `
<p>A volte una variabile continua ragiona meglio a fasce: età → classi d'età, vendite → alta/media/bassa. Due attrezzi:</p>
<pre><code>pd.cut(df["eta"], bins=[0, 30, 60, 100], labels=["giovane", "adulto", "senior"])
# tagli a soglie FISSE che decidi tu

pd.qcut(df["vendite"], q=3, labels=["bassa", "media", "alta"])
# tagli ai QUANTILI: gruppi di uguale numerosita'</code></pre>
<p>La differenza è sostanza: <code>cut</code> rispetta soglie teoriche (maggiorenne a 18 anni), <code>qcut</code> garantisce gruppi bilanciati per l'analisi. Il risultato è una colonna categoriale pronta per groupby e value_counts.</p>
`, more: `
<p><code>pd.cut</code> accetta anche un intero invece di soglie esplicite: <code>pd.cut(df["eta"], bins=4)</code> divide automaticamente il range osservato in 4 intervalli di AMPIEZZA UGUALE (non di numerosità uguale — quella è la specialità di <code>qcut</code>). È comodo per un'esplorazione rapida quando non hai ancora soglie teoriche in mente, ma le etichette generate sono intervalli numerici poco leggibili (es. <code>"(23.5, 41.0]"</code>) finché non passi <code>labels=</code> esplicite.</p>
<p>Un dettaglio che genera bug silenziosi: per default <code>pd.cut</code> include l'estremo DESTRO di ogni intervallo (<code>right=True</code>), quindi con soglie <code>[0, 18, 35]</code> il valore esatto 18 cade nella PRIMA fascia (0, 18], non nella seconda. Se il tuo dominio richiede la convenzione opposta (es. "18 anni è già maggiorenne"), il parametro <code>right=False</code> inverte questa regola.</p>
<p>Sia <code>cut</code> che <code>qcut</code> producono un tipo speciale chiamato <code>Categorical</code>, che internamente ricorda anche l'ORDINE delle categorie (bassa < media < alta), non solo la loro identità. Questo permette confronti diretti (<code>df["fascia"] > "bassa"</code>) e un ordinamento coerente in grafici e tabelle, a differenza di una colonna di stringhe qualsiasi dove l'ordine alfabetico non rispecchierebbe l'ordine logico delle fasce.</p>
` },

    {
      type: "exercise", id: "cl-07", kg: 15, title: "Le corsie di vendita",
      task: `<p>Sul catalogo <code>shop</code>:</p>
<ul>
<li><code>shop["fascia_fissa"]</code>: con <code>pd.cut</code>, soglie [0, 50, 100, 1000] ed etichette <code>"bassa", "media", "alta"</code></li>
<li><code>shop["fascia_quant"]</code>: con <code>pd.qcut</code>, 3 gruppi con le stesse etichette</li>
<li><code>conteggio_quant</code>: il <code>value_counts()</code> di <code>fascia_quant</code> — verifica che i gruppi siano bilanciati (3-3-3)</li>
</ul>`,
      setup: `import pandas as pd
shop = pd.DataFrame({
    "prodotto": ["manubri", "tappetino", "borraccia", "corda", "fascia_elastica", "integratore", "zaino", "cuffie", "cintura"],
    "vendite": [120, 45, 88, 30, 95, 8, 130, 62, 71],
})`,
      starter: `import pandas as pd
# shop e' gia' caricato
shop["fascia_fissa"] = ...
shop["fascia_quant"] = ...
conteggio_quant = ...

print(shop)
print(conteggio_quant)`,
      check: `import pandas as pd
assert "fascia_fissa" in shop.columns and str(shop.loc[0, "fascia_fissa"]) == "alta" and str(shop.loc[5, "fascia_fissa"]) == "bassa", "fascia_fissa: pd.cut(shop['vendite'], bins=[0, 50, 100, 1000], labels=['bassa', 'media', 'alta'])"
assert "fascia_quant" in shop.columns, "Crea fascia_quant con pd.qcut"
assert 'conteggio_quant' in globals() and sorted(conteggio_quant.tolist()) == [3, 3, 3], "qcut con q=3 su 9 prodotti deve dare gruppi da 3: e' il suo scopo"
assert str(shop.loc[8, "fascia_quant"]) == "media", "Con i tagli ai terzili, 'cintura' (71) cade nella fascia media"`,
      hint: `<p><code>pd.cut(shop["vendite"], bins=[0, 50, 100, 1000], labels=["bassa", "media", "alta"])</code> e <code>pd.qcut(shop["vendite"], q=3, labels=[...])</code>. Nota come le due colonne non coincidono: soglie diverse, filosofie diverse.</p>`,
      solution: `import pandas as pd
shop["fascia_fissa"] = pd.cut(shop["vendite"], bins=[0, 50, 100, 1000], labels=["bassa", "media", "alta"])
shop["fascia_quant"] = pd.qcut(shop["vendite"], q=3, labels=["bassa", "media", "alta"])
conteggio_quant = shop["fascia_quant"].value_counts()

print(shop)
print(conteggio_quant)`
    },

    { type: "theory", title: "Correlazione: chi si muove con chi", html: `
<p>La <strong>correlazione di Pearson</strong> misura quanto due variabili si muovono insieme, da −1 (opposte) a +1 (in sincrono perfetto), con 0 = nessuna relazione lineare.</p>
<pre><code>df["kg"].corr(df["durata"])   # tra due colonne
df.corr(numeric_only=True)    # matrice completa: tutte le coppie</code></pre>
<p>Due avvertenze da muro della palestra: la correlazione vede solo relazioni <em>lineari</em> (una U perfetta dà corr ≈ 0), e <strong>correlazione non è causazione</strong> — gelati e annegamenti correlano perché entrambi seguono l'estate. In EDA la matrice di correlazione serve a farsi domande, non a chiudere risposte.</p>
`, more: `
<p>Pearson (il default di <code>.corr()</code>) misura specificamente relazioni LINEARI. Per relazioni monotone ma non lineari (es. una crescita che rallenta, non una retta), la correlazione di <strong>Spearman</strong> è più adatta: <code>df["kg"].corr(df["durata"], method="spearman")</code> — confronta i RANGHI dei valori invece dei valori stessi, quindi è insensibile alla forma esatta della relazione, solo alla sua direzione monotona.</p>
<p>Un terzo indizio spesso trascurato: la correlazione è sensibile agli outlier tanto quanto la media. Un singolo valore estremo può gonfiare o azzerare artificialmente una correlazione altrimenti debole o forte — motivo in più per applicare i controlli di outlier (IQR, z-score) PRIMA di fidarsi ciecamente di una matrice di correlazione in fase di EDA.</p>
<p>Visualizzare la matrice come una heatmap (con una libreria di grafici) rende immediatamente evidenti i pattern che in una tabella di numeri richiedono di scorrere riga per riga — non è disponibile in questa palestra testuale, ma è la forma in cui incontrerai quasi sempre una matrice di correlazione in un vero notebook di analisi.</p>
` },

    {
      type: "exercise", id: "cl-08", kg: 20, title: "La matrice delle complicità",
      task: `<p>Sul dataset <code>ds</code> (durata dell'esercizio, kg sollevato, popolarità in palestra di 10 esercizi):</p>
<ul>
<li><code>matrice</code>: la matrice di correlazione delle colonne numeriche</li>
<li><code>corr_durata_kg</code>: la correlazione durata–kg, presa <strong>dalla matrice</strong> con <code>.loc</code></li>
<li><code>coppia_forte</code>: tra <code>("durata","kg")</code> e <code>("durata","popolarita")</code>, la tupla con la correlazione più forte <strong>in valore assoluto</strong></li>
</ul>`,
      setup: `import pandas as pd
ds = pd.DataFrame({
    "durata": [95, 72, 88, 84, 90, 102, 70, 80, 91, 99],
    "kg": [810, 300, 780, 470, 500, 820, 290, 460, 790, 800],
    "popolarita": [20, 130, 45, 60, 55, 15, 140, 70, 40, 25],
})`,
      starter: `# ds e' gia' caricato
matrice = ...
corr_durata_kg = ...
coppia_forte = ...

print(matrice)
print(coppia_forte)`,
      check: `import pandas as pd
assert 'matrice' in globals() and abs(float(matrice.loc["durata", "durata"]) - 1.0) < 1e-9, "matrice: ds.corr() — la diagonale vale 1"
assert 'corr_durata_kg' in globals() and abs(float(corr_durata_kg) - float(ds['durata'].corr(ds['kg']))) < 1e-9, "corr_durata_kg: matrice.loc['durata', 'kg']"
assert 'coppia_forte' in globals() and tuple(coppia_forte) == ("durata", "popolarita"), "coppia_forte: guarda i valori assoluti — durata e popolarita correlano NEGATIVAMENTE ma piu' forte (gli esercizi lunghi sono meno popolari: un effetto reale!)"`,
      hint: `<p>Confronta <code>abs(matrice.loc["durata", "kg"])</code> e <code>abs(matrice.loc["durata", "popolarita"])</code>. Una correlazione di −0.9 è più forte di una di +0.8: conta il valore assoluto.</p>`,
      solution: `matrice = ds.corr()
corr_durata_kg = matrice.loc["durata", "kg"]

if abs(matrice.loc["durata", "popolarita"]) > abs(corr_durata_kg):
    coppia_forte = ("durata", "popolarita")
else:
    coppia_forte = ("durata", "kg")

print(matrice)
print(coppia_forte)`
    },

    { type: "theory", title: "Quanto manca? La percentuale conta più del conteggio", html: `
<p>"12 valori mancanti" non vuol dire nulla senza sapere su quante righe totali. La <strong>percentuale di dati mancanti per colonna</strong> è la prima cosa da calcolare, perché guida la decisione successiva:</p>
<pre><code>perc_mancanti = df.isna().mean() * 100   # media di una maschera booleana = proporzione!</code></pre>
<p>Regola pratica (non scolpita nella pietra, ma un buon punto di partenza): sotto il 5% mancante, si può quasi sempre imputare senza troppi rischi; sopra il 40%, la colonna spesso conviene eliminarla — troppo inventato, poca informazione reale. Nel mezzo, dipende dal contesto e dal perché mancano i dati.</p>
`, more: `
<p>Non tutti i dati mancanti sono uguali. Gli statistici distinguono tre tipi: <strong>MCAR</strong> (Missing Completely At Random — mancano per puro caso, es. un sensore che si scollega a intervalli casuali), <strong>MAR</strong> (Missing At Random — la probabilità di mancare dipende da ALTRE colonne osservate, es. i redditi alti sono più spesso non dichiarati), <strong>MNAR</strong> (Missing Not At Random — la probabilità di mancare dipende dal valore MANCANTE stesso, es. chi ha un punteggio bassissimo in un test smette di rispondere). Solo nel primo caso l'imputazione con media/mediana è davvero innocua; negli altri due introduce un bias sistematico.</p>
<p>Prima di decidere come trattare i NaN di una colonna, un controllo diagnostico utile è verificare se la loro presenza CORRELA con un'altra variabile: <code>df.groupby(df["colonna_target"].isna())["altra_colonna"].mean()</code> confronta la media di un'altra variabile tra le righe con e senza NaN — se le due medie sono molto diverse, i dati probabilmente NON mancano a caso (indizio di MAR o MNAR), e riempirli con una singola statistica globale rischia di distorcere l'analisi.</p>
<p>Un'alternativa più informativa alla semplice eliminazione o imputazione: creare una colonna booleana "era_mancante" PRIMA di riempire i NaN (<code>df["kg_era_mancante"] = df["kg"].isna()</code>). In questo modo, anche dopo aver riempito i buchi per poter fare i calcoli, il modello o l'analisi successiva può ancora "sapere" quali valori erano originariamente mancanti — un'informazione che altrimenti andrebbe persa per sempre nel momento in cui riempi il NaN con un numero qualsiasi.</p>
` },

    {
      type: "exercise", id: "cl-09", kg: 20, title: "Tenere o buttare?",
      task: `<p>Sul DataFrame <code>reg</code> (registro di 20 allenamenti, alcune colonne bucate):</p>
<ul>
<li><code>perc_mancanti</code>: la percentuale di NaN per colonna (Series, valori tra 0 e 100)</li>
<li><code>da_eliminare</code>: la lista dei nomi di colonna con più del 40% di dati mancanti</li>
<li><code>reg_ridotto</code>: <code>reg</code> senza quelle colonne (usa <code>.drop(columns=...)</code>)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(1)
reg = pd.DataFrame({
    "kg": [80.0]*20,
    "note_coach": [np.nan]*15 + ["ok"]*5,
    "battito_medio": [120.0]*17 + [np.nan]*3,
})`,
      starter: `import pandas as pd
# reg e' gia' caricato: 20 righe
print(reg.isna().sum())

perc_mancanti = ...
da_eliminare = ...
reg_ridotto = ...

print(perc_mancanti)
print(da_eliminare)
print(reg_ridotto.columns.tolist())`,
      check: `import pandas as pd
assert 'perc_mancanti' in globals() and abs(float(perc_mancanti["note_coach"]) - 75.0) < 1e-9 and abs(float(perc_mancanti["kg"]) - 0.0) < 1e-9, "perc_mancanti: reg.isna().mean() * 100 — note_coach ha il 75% di NaN (15 su 20)"
assert 'da_eliminare' in globals() and da_eliminare == ["note_coach"], "da_eliminare: solo note_coach supera il 40% (75% > 40%, mentre battito_medio e' al 15%)"
assert 'reg_ridotto' in globals() and "note_coach" not in reg_ridotto.columns and "kg" in reg_ridotto.columns and "battito_medio" in reg_ridotto.columns, "reg_ridotto: reg.drop(columns=da_eliminare)"`,
      hint: `<p><code>reg.isna().mean()</code> è già la proporzione (media di True/False); moltiplica per 100 per la percentuale. Per la lista: <code>list(perc_mancanti[perc_mancanti &gt; 40].index)</code>.</p>`,
      solution: `print(reg.isna().sum())

perc_mancanti = reg.isna().mean() * 100
da_eliminare = list(perc_mancanti[perc_mancanti > 40].index)
reg_ridotto = reg.drop(columns=da_eliminare)

print(perc_mancanti)
print(da_eliminare)
print(reg_ridotto.columns.tolist())`
    },

    {
      type: "exercise", id: "cl-10", kg: 25, title: "Massimale: bonifica completa",
      task: `<p>Il dataset <code>sporco</code> ha tutto il repertorio: kg come testo con la virgola, un valore marcio, NaN, un duplicato esatto e un outlier brutale. Bonifica in ordine e chiama il risultato <code>pulito</code>:</p>
<ul>
<li>1. Converti <code>kg</code> in numeri (virgola → punto, <code>errors="coerce"</code>), sovrascrivendo la colonna</li>
<li>2. Elimina le righe duplicate esatte</li>
<li>3. Riempi i NaN di <code>kg</code> con la <strong>mediana</strong> della colonna</li>
<li>4. Clippa <code>kg</code> nella recinzione IQR (limiti da q1/q3 calcolati DOPO i passi 1-3)</li>
<li><code>media_finale</code>: la media del kg bonificato</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
sporco = pd.DataFrame({
    "item":   ["w01", "w02", "w03", "w03", "w04", "w05", "w06", "w07", "w08", "w09"],
    "kg": ["95,0", "88,4", "74,1", "74,1", "guasto", "102,3", "91,0", "3000,0", "85,2", "79,8"],
})`,
      starter: `import pandas as pd
# sporco e' gia' caricato
pulito = sporco.copy()

# 1. numeri veri
pulito["kg"] = ...
# 2. via i cloni
pulito = ...
# 3. tappa i buchi con la mediana
pulito["kg"] = ...
# 4. recinzione IQR
q1, q3 = ..., ...
iqr = ...
pulito["kg"] = ...

media_finale = ...
print(pulito)
print(media_finale)`,
      check: `import pandas as pd
assert 'pulito' in globals() and len(pulito) == 9, "Dopo drop_duplicates devono restare 9 righe (una w03 se ne va)"
assert str(pulito["kg"].dtype).startswith("float"), "kg deve essere float"
assert pulito["kg"].isna().sum() == 0, "Niente piu' NaN: il 'guasto' va riempito con la mediana"
assert float(pulito["kg"].max()) < 200, "Il 3000 deve essere stato clippato dentro la recinzione IQR"
assert 'media_finale' in globals() and 80 < float(media_finale) < 100, "media_finale deve tornare in zona fisiologica (80-100 kg): se e' enorme, il clip non ha funzionato"`,
      hint: `<p>Ordine dei passi = tutto. Se clippi prima di togliere il duplicato o di convertire, i quartili escono sballati. Il 'guasto' diventa NaN al passo 1 e mediana al passo 3; il 3000 sopravvive fino al passo 4, dove la recinzione lo schiaccia.</p>`,
      solution: `import pandas as pd
pulito = sporco.copy()

pulito["kg"] = pd.to_numeric(pulito["kg"].str.replace(",", "."), errors="coerce")
pulito = pulito.drop_duplicates()
pulito["kg"] = pulito["kg"].fillna(pulito["kg"].median())

q1, q3 = pulito["kg"].quantile(0.25), pulito["kg"].quantile(0.75)
iqr = q3 - q1
pulito["kg"] = pulito["kg"].clip(q1 - 1.5 * iqr, q3 + 1.5 * iqr)

media_finale = pulito["kg"].mean()
print(pulito)
print(media_finale)`
    },

    {
      type: "exercise", id: "cl-11", kg: 10, title: "Drill: check-up di un sondaggio",
      task: `<p>Su <code>sv</code> (punteggi di gradimento, alcuni assurdi): <code>n_nan</code>, <code>n_negativi</code> (punteggi impossibili sotto zero).</p>`,
      setup: `import pandas as pd
import numpy as np
sv = pd.DataFrame({"punteggio": [8, 9, -1, np.nan, 7, 10, -3]})`,
      starter: `# sv e' gia' caricato
print(sv.describe())
n_nan = ...
n_negativi = ...

print(n_nan, n_negativi)`,
      check: `assert n_nan == 1
assert n_negativi == 2`,
      hint: `<p><code>sv["punteggio"].isna().sum()</code>, <code>(sv["punteggio"] &lt; 0).sum()</code>.</p>`,
      solution: `print(sv.describe())
n_nan = sv["punteggio"].isna().sum()
n_negativi = (sv["punteggio"] < 0).sum()

print(n_nan, n_negativi)`
    },

    {
      type: "exercise", id: "cl-12", kg: 15, title: "Drill: risposte doppie",
      task: `<p>Su <code>resp</code>: <code>n_cloni</code> (duplicati esatti), <code>unica_per_id</code> (una riga per <code>id</code>, la prima).</p>`,
      setup: `import pandas as pd
resp = pd.DataFrame({"id": ["r1","r2","r2","r3","r4","r4"], "voto": [5,4,4,3,2,9]})`,
      starter: `# resp e' gia' caricato
n_cloni = ...
unica_per_id = ...

print(n_cloni)
print(unica_per_id)`,
      check: `assert n_cloni == 1
assert unica_per_id["id"].tolist() == ["r1","r2","r3","r4"]
assert unica_per_id.loc[unica_per_id["id"]=="r4","voto"].iloc[0] == 2`,
      hint: `<p>r4 compare due volte con voti diversi (2 e 9): non è un duplicato esatto, ma <code>drop_duplicates(subset=["id"])</code> tiene comunque solo la prima.</p>`,
      solution: `n_cloni = resp.duplicated().sum()
unica_per_id = resp.drop_duplicates(subset=["id"])

print(n_cloni)
print(unica_per_id)`
    },

    {
      type: "exercise", id: "cl-13", kg: 15, title: "Drill: sensore con virgola",
      task: `<p>Su <code>sens</code> (colonna <code>valore</code> testuale, virgola decimale, un errore): crea <code>valore_num</code>, <code>n_falliti</code>, <code>media</code>.</p>`,
      setup: `import pandas as pd
sens = pd.DataFrame({"id": ["s1","s2","s3","s4"], "valore": ["12,5","8,3","err","15,0"]})`,
      starter: `# sens e' gia' caricato
sens["valore_num"] = ...
n_falliti = ...
media = ...

print(sens)
print(n_falliti, media)`,
      check: `assert abs(sens.loc[0,"valore_num"] - 12.5) < 1e-9
assert n_falliti == 1
assert abs(media - 11.933333333333334) < 1e-6`,
      hint: `<p><code>pd.to_numeric(sens["valore"].str.replace(",", "."), errors="coerce")</code>.</p>`,
      solution: `sens["valore_num"] = pd.to_numeric(sens["valore"].str.replace(",", "."), errors="coerce")
n_falliti = sens["valore_num"].isna().sum()
media = sens["valore_num"].mean()

print(sens)
print(n_falliti, media)`
    },

    {
      type: "exercise", id: "cl-14", kg: 15, title: "Drill: metodi di pagamento sporchi",
      task: `<p>Su <code>pay</code>: <code>n_prima</code> (categorie distinte prima), <code>normalizzato</code> (strip+lower), <code>n_dopo</code>.</p>`,
      setup: `import pandas as pd
pay = pd.DataFrame({"metodo": ["Carta", " carta", "CONTANTI", "contanti ", "Carta"]})`,
      starter: `# pay e' gia' caricato
n_prima = ...
normalizzato = ...
n_dopo = ...

print(n_prima, n_dopo)
print(normalizzato.value_counts())`,
      check: `assert n_prima == 4
assert n_dopo == 2
assert set(normalizzato.unique()) == {"carta", "contanti"}`,
      hint: `<p><code>pay["metodo"].str.strip().str.lower()</code>.</p>`,
      solution: `n_prima = pay["metodo"].nunique()
normalizzato = pay["metodo"].str.strip().str.lower()
n_dopo = normalizzato.nunique()

print(n_prima, n_dopo)
print(normalizzato.value_counts())`
    },

    {
      type: "exercise", id: "cl-15", kg: 20, title: "Drill: tempo di consegna per autista",
      task: `<p>Su <code>driv</code> (un tempo mancante): <code>tempo_pieno</code> (NaN riempiti con la media del <strong>proprio</strong> autista, via <code>transform</code>).</p>`,
      setup: `import pandas as pd
import numpy as np
driv = pd.DataFrame({"autista": ["a","a","b","b","a"], "tempo": [30.0, np.nan, 50.0, 55.0, 28.0]})`,
      starter: `# driv e' gia' caricato
medie = driv.groupby("autista")["tempo"].transform("mean")
driv["tempo_pieno"] = ...

print(driv)`,
      check: `assert abs(driv.loc[1,"tempo_pieno"] - 29.0) < 1e-9`,
      hint: `<p><code>driv["tempo"].fillna(medie)</code>.</p>`,
      solution: `medie = driv.groupby("autista")["tempo"].transform("mean")
driv["tempo_pieno"] = driv["tempo"].fillna(medie)

print(driv)`
    },

    {
      type: "exercise", id: "cl-16", kg: 20, title: "Drill: ordine sospetto",
      task: `<p>Su <code>importi</code> (Series): applica il protocollo IQR — <code>outlier</code> (maschera), <code>n_outlier</code>, <code>valori_outlier</code> (i valori marcati).</p>`,
      setup: `import pandas as pd
importi = pd.Series([50, 60, 55, 58, 300, 52, 10, 57])`,
      starter: `# importi e' gia' pronto
q1, q3 = importi.quantile(0.25), importi.quantile(0.75)
iqr = q3 - q1
outlier = ...
n_outlier = ...
valori_outlier = ...

print(n_outlier, valori_outlier)`,
      check: `assert n_outlier == 2
assert sorted(valori_outlier) == [10, 300]`,
      hint: `<p><code>(importi &lt; q1 - 1.5*iqr) | (importi &gt; q3 + 1.5*iqr)</code>, poi <code>importi[outlier].tolist()</code>.</p>`,
      solution: `q1, q3 = importi.quantile(0.25), importi.quantile(0.75)
iqr = q3 - q1
outlier = (importi < q1 - 1.5*iqr) | (importi > q3 + 1.5*iqr)
n_outlier = outlier.sum()
valori_outlier = importi[outlier].tolist()

print(n_outlier, valori_outlier)`
    },

    {
      type: "exercise", id: "cl-17", kg: 15, title: "Drill: fasce d'età",
      task: `<p>Su <code>eta</code> (Series): <code>fasce</code> con <code>pd.cut</code>, soglie <code>[0, 18, 35, 60, 100]</code>, etichette <code>["teen","young","adult","senior"]</code>.</p>`,
      starter: `import pandas as pd

eta = pd.Series([15, 22, 35, 45, 60, 70, 28])

fasce = ...
print(fasce.tolist())`,
      check: `assert fasce.tolist() == ["teen","young","young","adult","adult","senior","young"]`,
      hint: `<p><code>pd.cut(eta, bins=[0, 18, 35, 60, 100], labels=["teen","young","adult","senior"])</code>.</p>`,
      solution: `import pandas as pd

eta = pd.Series([15, 22, 35, 45, 60, 70, 28])

fasce = pd.cut(eta, bins=[0, 18, 35, 60, 100], labels=["teen","young","adult","senior"])
print(fasce.tolist())`
    },

    {
      type: "exercise", id: "cl-18", kg: 20, title: "Drill: pubblicità e vendite",
      task: `<p>Su <code>adv</code>: <code>corr</code> (correlazione tra <code>spesa_ads</code> e <code>vendite</code>).</p>`,
      starter: `import pandas as pd

adv = pd.DataFrame({"spesa_ads": [100, 200, 150, 300, 250], "vendite": [10, 25, 18, 40, 30]})

corr = ...
print(corr)`,
      check: `assert corr > 0.99`,
      hint: `<p><code>adv["spesa_ads"].corr(adv["vendite"])</code>.</p>`,
      solution: `import pandas as pd

adv = pd.DataFrame({"spesa_ads": [100, 200, 150, 300, 250], "vendite": [10, 25, 18, 40, 30]})

corr = adv["spesa_ads"].corr(adv["vendite"])
print(corr)`
    },

    {
      type: "exercise", id: "cl-19", kg: 20, title: "Drill: colonne da buttare",
      task: `<p>Su <code>df19</code> (3 colonne con diverse percentuali di NaN): <code>perc</code> (percentuale per colonna), <code>da_tenere</code> (nomi colonna con meno del 50% di NaN).</p>`,
      setup: `import pandas as pd
import numpy as np
df19 = pd.DataFrame({"a": [1, 2, np.nan, 4], "b": [np.nan, np.nan, np.nan, 1], "c": [1, 2, 3, 4]})`,
      starter: `# df19 e' gia' caricato
perc = ...
da_tenere = ...

print(perc)
print(da_tenere)`,
      check: `assert abs(perc["a"] - 25.0) < 1e-9
assert abs(perc["b"] - 75.0) < 1e-9
assert set(da_tenere) == {"a", "c"}`,
      hint: `<p><code>df19.isna().mean() * 100</code>, poi <code>list(perc[perc &lt; 50].index)</code>.</p>`,
      solution: `perc = df19.isna().mean() * 100
da_tenere = list(perc[perc < 50].index)

print(perc)
print(da_tenere)`
    },

    {
      type: "exercise", id: "cl-20", kg: 20, title: "Combo: pulisci e conta le categorie",
      task: `<p>Su <code>pay2</code> (metodi di pagamento sporchi, con NaN): normalizza (strip+lower), riempi i NaN con <code>"sconosciuto"</code>, poi <code>conteggi</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
pay2 = pd.DataFrame({"metodo": ["Carta", " carta", np.nan, "CONTANTI", "Carta"]})`,
      starter: `# pay2 e' gia' caricato
pay2["metodo"] = pay2["metodo"].str.strip().str.lower()
pay2["metodo"] = ...
conteggi = ...

print(conteggi)`,
      check: `assert conteggi["sconosciuto"] == 1
assert conteggi["carta"] == 3`,
      hint: `<p>Attenzione all'ordine: normalizza PRIMA (i NaN restano NaN, <code>.str</code> li ignora), poi <code>.fillna("sconosciuto")</code>.</p>`,
      solution: `pay2["metodo"] = pay2["metodo"].str.strip().str.lower()
pay2["metodo"] = pay2["metodo"].fillna("sconosciuto")
conteggi = pay2["metodo"].value_counts()

print(conteggi)`
    },

    {
      type: "exercise", id: "cl-21", kg: 20, title: "Combo: outlier per gruppo",
      task: `<p>Su <code>vend</code> (due negozi con scale diverse): calcola lo z-score <strong>per negozio</strong> (non globale!) con <code>groupby().transform</code> per media e std, poi <code>outlier</code> dove <code>|z| &gt; 1.5</code>.</p>`,
      setup: `import pandas as pd
vend = pd.DataFrame({
    "negozio": ["A","A","A","A","A","B","B","B","B","B"],
    "importo": [100, 110, 95, 105, 102, 900, 950, 890, 910, 3000],
})`,
      starter: `# vend e' gia' caricato
medie = vend.groupby("negozio")["importo"].transform("mean")
std = vend.groupby("negozio")["importo"].transform("std")
z = (vend["importo"] - medie) / std
outlier = z.abs() > 1.5

print(z.round(2))
print(outlier.tolist())`,
      check: `assert outlier.tolist() == [False, False, False, False, False, False, False, False, False, True]`,
      hint: `<p>Se calcolassi lo z-score su TUTTO insieme, i valori del negozio A (piccoli) sembrerebbero tutti outlier rispetto alla scala di B: sbagliato. Il calcolo per gruppo evita questo errore.</p>`,
      solution: `medie = vend.groupby("negozio")["importo"].transform("mean")
std = vend.groupby("negozio")["importo"].transform("std")
z = (vend["importo"] - medie) / std
outlier = z.abs() > 1.5

print(z.round(2))
print(outlier.tolist())`
    },

    {
      type: "exercise", id: "cl-22", kg: 20, title: "Combo: binning e conteggio bilanciato",
      task: `<p>Su <code>punteggi</code> (Series di 9 valori): confronta <code>pd.cut</code> a soglie fisse <code>[0,50,80,100]</code> con <code>pd.qcut</code> a 3 gruppi — <code>conteggio_cut</code> e <code>conteggio_qcut</code>.</p>`,
      setup: `import pandas as pd
punteggi = pd.Series([20, 45, 55, 60, 65, 75, 85, 90, 95])`,
      starter: `# punteggi e' gia' pronto
fascia_cut = pd.cut(punteggi, bins=[0, 50, 80, 100], labels=["bassa","media","alta"])
fascia_qcut = pd.qcut(punteggi, q=3, labels=["bassa","media","alta"])

conteggio_cut = fascia_cut.value_counts()
conteggio_qcut = fascia_qcut.value_counts()

print(conteggio_cut)
print(conteggio_qcut)`,
      check: `assert sorted(conteggio_qcut.tolist()) == [3, 3, 3]
assert conteggio_cut["bassa"] == 2`,
      hint: `<p><code>qcut</code> garantisce SEMPRE gruppi di uguale numerosità (3-3-3 su 9 valori); <code>cut</code> no, dipende da dove cadono i dati rispetto alle soglie fisse.</p>`,
      solution: `fascia_cut = pd.cut(punteggi, bins=[0, 50, 80, 100], labels=["bassa","media","alta"])
fascia_qcut = pd.qcut(punteggi, q=3, labels=["bassa","media","alta"])

conteggio_cut = fascia_cut.value_counts()
conteggio_qcut = fascia_qcut.value_counts()

print(conteggio_cut)
print(conteggio_qcut)`
    },

    {
      type: "exercise", id: "cl-23", kg: 20, title: "Combo: matrice di correlazione a tre",
      task: `<p>Su <code>dati3</code> (spesa_ads, visite_sito, vendite): trova la coppia di colonne (diverse da se stesse) con correlazione più alta in valore assoluto, in <code>coppia_top</code> (tupla di 2 nomi).</p>`,
      setup: `import pandas as pd
dati3 = pd.DataFrame({
    "spesa_ads": [100, 200, 150, 300, 250],
    "visite_sito": [500, 900, 700, 1400, 1100],
    "vendite": [10, 25, 18, 40, 22],
})`,
      starter: `# dati3 e' gia' caricato
m = dati3.corr()
print(m)

migliore = None
coppia_top = None
cols = list(m.columns)
for i in range(len(cols)):
    for j in range(i+1, len(cols)):
        val = abs(m.loc[cols[i], cols[j]])
        if migliore is None or val > migliore:
            migliore = val
            coppia_top = (cols[i], cols[j])

print(coppia_top)`,
      check: `assert set(coppia_top) == {"spesa_ads", "visite_sito"}`,
      hint: `<p>Il doppio ciclo con <code>range(i+1, ...)</code> evita di confrontare una colonna con se stessa e di contare due volte la stessa coppia.</p>`,
      solution: `m = dati3.corr()
print(m)

migliore = None
coppia_top = None
cols = list(m.columns)
for i in range(len(cols)):
    for j in range(i+1, len(cols)):
        val = abs(m.loc[cols[i], cols[j]])
        if migliore is None or val > migliore:
            migliore = val
            coppia_top = (cols[i], cols[j])

print(coppia_top)`
    },

    {
      type: "exercise", id: "cl-24", kg: 25, title: "Combo: pipeline sondaggio",
      task: `<p>Su <code>sondaggio</code> (con punteggi impossibili e un NaN): sostituisci i punteggi fuori dal range [0,10] con NaN (usa <code>.where</code>: <code>Series.where(condizione)</code> tiene il valore se la condizione è vera, altrimenti mette NaN), poi riempi tutti i NaN con la mediana.</p>`,
      setup: `import pandas as pd
import numpy as np
sondaggio = pd.DataFrame({"punteggio": [8, 15, 6, -2, np.nan, 9, 7]})`,
      starter: `# sondaggio e' gia' caricato
validi = sondaggio["punteggio"].where((sondaggio["punteggio"] >= 0) & (sondaggio["punteggio"] <= 10))
sondaggio["punteggio_pulito"] = validi.fillna(validi.median())

print(sondaggio)`,
      check: `assert sondaggio["punteggio_pulito"].isna().sum() == 0
assert sondaggio.loc[1, "punteggio_pulito"] == sondaggio.loc[3, "punteggio_pulito"], "15 e -2 diventano entrambi la stessa mediana"
assert sondaggio.loc[1, "punteggio_pulito"] == 7.5`,
      hint: `<p><code>.where(condizione)</code> è l'opposto concettuale di un filtro: non toglie righe, sostituisce con NaN dove la condizione è falsa, mantenendo la stessa lunghezza.</p>`,
      solution: `validi = sondaggio["punteggio"].where((sondaggio["punteggio"] >= 0) & (sondaggio["punteggio"] <= 10))
sondaggio["punteggio_pulito"] = validi.fillna(validi.median())

print(sondaggio)`
    },

    {
      type: "exercise", id: "cl-25", kg: 25, title: "Combo: duplicati concettuali su più colonne",
      task: `<p>Su <code>reg2</code>: alcune righe sono lo stesso evento registrato due volte da sistemi diversi (stesso <code>utente</code> e <code>giorno</code>, orario leggermente diverso). Trova <code>duplicati_concettuali</code>: righe considerate doppioni su <code>["utente","giorno"]</code>, tenendo l'<strong>ultima</strong>.</p>`,
      setup: `import pandas as pd
reg2 = pd.DataFrame({
    "utente": ["u1","u1","u2","u3","u3"],
    "giorno": ["lun","lun","mar","mer","mer"],
    "ora": ["10:00","10:02","09:00","14:00","14:05"],
})`,
      starter: `# reg2 e' gia' caricato
duplicati_concettuali = reg2.drop_duplicates(subset=["utente","giorno"], keep="last")
print(duplicati_concettuali)`,
      check: `assert len(duplicati_concettuali) == 3
assert duplicati_concettuali[duplicati_concettuali["utente"]=="u1"]["ora"].iloc[0] == "10:02"`,
      hint: `<p><code>keep="last"</code> tiene l'ultima occorrenza di ogni combinazione invece della prima.</p>`,
      solution: `duplicati_concettuali = reg2.drop_duplicates(subset=["utente","giorno"], keep="last")
print(duplicati_concettuali)`
    },

    {
      type: "exercise", id: "cl-26", kg: 25, title: "Combo: report di qualità dati",
      task: `<p>Su <code>report_df</code> (3 colonne): costruisci un mini-report con <code>righe_totali</code>, <code>colonne_con_nan</code> (lista di nomi), <code>colonna_peggiore</code> (quella con più NaN in assoluto).</p>`,
      setup: `import pandas as pd
import numpy as np
report_df = pd.DataFrame({
    "a": [1, 2, 3, np.nan],
    "b": [np.nan, np.nan, 3, 4],
    "c": [1, 2, 3, 4],
})`,
      starter: `# report_df e' gia' caricato
righe_totali = len(report_df)
buchi = report_df.isna().sum()
colonne_con_nan = list(buchi[buchi > 0].index)
colonna_peggiore = buchi.idxmax()

print(righe_totali, colonne_con_nan, colonna_peggiore)`,
      check: `assert righe_totali == 4
assert set(colonne_con_nan) == {"a", "b"}
assert colonna_peggiore == "b"`,
      hint: `<p><code>buchi.idxmax()</code> trova la colonna col massimo conteggio di NaN, come già fatto con <code>value_counts</code> altrove.</p>`,
      solution: `righe_totali = len(report_df)
buchi = report_df.isna().sum()
colonne_con_nan = list(buchi[buchi > 0].index)
colonna_peggiore = buchi.idxmax()

print(righe_totali, colonne_con_nan, colonna_peggiore)`
    },

    {
      type: "exercise", id: "cl-27", kg: 25, title: "Combo: normalizza, imputa, clippa",
      task: `<p>Pipeline a tre passi su <code>dati4</code> (colonna <code>peso</code>): 1) riempi i NaN con la mediana, 2) calcola i limiti IQR, 3) clippa. Salva il risultato finale in <code>dati4["peso_finale"]</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
dati4 = pd.DataFrame({"peso": [70.0, 72.0, np.nan, 68.0, 500.0, 71.0, 69.0]})`,
      starter: `# dati4 e' gia' caricato
step1 = dati4["peso"].fillna(dati4["peso"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
dati4["peso_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(dati4)`,
      check: `assert dati4["peso_finale"].isna().sum() == 0
assert dati4["peso_finale"].max() < 100`,
      hint: `<p>L'ordine è fondamentale: se clippi prima di riempire i NaN, il calcolo dei quartili include righe con NaN che sballano tutto.</p>`,
      solution: `step1 = dati4["peso"].fillna(dati4["peso"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
dati4["peso_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(dati4)`
    },

    {
      type: "exercise", id: "cl-28", kg: 25, title: "Combo: chi ha dati incompleti?",
      task: `<p>Su <code>clienti3</code> (più colonne): crea <code>riga_incompleta</code>: booleana, <code>True</code> se la riga ha <strong>almeno un</strong> NaN in una qualsiasi colonna (usa <code>.isna().any(axis=1)</code>), poi <code>incompleti</code>: il sotto-DataFrame corrispondente.</p>`,
      setup: `import pandas as pd
import numpy as np
clienti3 = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan"],
    "email": ["a@x.com", np.nan, "c@x.com", "d@x.com"],
    "telefono": ["123", "456", np.nan, "789"],
})`,
      starter: `# clienti3 e' gia' caricato
riga_incompleta = ...
incompleti = ...

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`,
      check: `assert riga_incompleta.tolist() == [False, True, True, False]
assert incompleti["nome"].tolist() == ["Bo", "Cin"]`,
      hint: `<p><code>clienti3.isna().any(axis=1)</code>: per ogni riga, controlla se ALMENO una colonna è NaN.</p>`,
      solution: `riga_incompleta = clienti3.isna().any(axis=1)
incompleti = clienti3[riga_incompleta]

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`
    },

    {
      type: "exercise", id: "cl-29", kg: 25, title: "Combo: la storia del sensore rumoroso",
      task: `<p>Su <code>storico</code> (letture di un sensore in due giorni diversi, ognuno coi suoi outlier): calcola z-score <strong>per giorno</strong> con transform, marca gli outlier (|z|>1.5), sostituiscili con la mediana del <strong>proprio</strong> giorno (non quella globale!).</p>`,
      setup: `import pandas as pd
import numpy as np
storico = pd.DataFrame({
    "giorno": ["lun"]*5 + ["mar"]*5,
    "valore": [20, 21, 19, 22, 90, 55, 56, 54, 57, 10],
})`,
      starter: `# storico e' gia' caricato
medie = storico.groupby("giorno")["valore"].transform("mean")
std = storico.groupby("giorno")["valore"].transform("std")
mediane = storico.groupby("giorno")["valore"].transform("median")

z = (storico["valore"] - medie) / std
outlier = z.abs() > 1.5
storico["valore_pulito"] = storico["valore"].where(~outlier, mediane)

print(storico)`,
      check: `assert storico.loc[4, "valore_pulito"] == 21.0, "L'outlier di lunedi' (90) va sostituito con la mediana DI LUNEDI' (21)"
assert storico.loc[9, "valore_pulito"] == 55.0, "L'outlier di martedi' (10) va sostituito con la mediana DI MARTEDI' (55)"`,
      hint: `<p><code>Series.where(condizione, altro)</code> tiene il valore originale dove la condizione è vera, e usa <code>altro</code> dove è falsa: qui <code>~outlier</code> (non-outlier) mantiene il valore, gli outlier vengono sostituiti dalla mediana del gruppo.</p>`,
      solution: `medie = storico.groupby("giorno")["valore"].transform("mean")
std = storico.groupby("giorno")["valore"].transform("std")
mediane = storico.groupby("giorno")["valore"].transform("median")

z = (storico["valore"] - medie) / std
outlier = z.abs() > 1.5
storico["valore_pulito"] = storico["valore"].where(~outlier, mediane)

print(storico)`
    },

    {
      type: "exercise", id: "cl-30", kg: 25, title: "Massimale finale: audit completo",
      task: `<p>Su <code>audit</code> (dataset con più problemi insieme): esegui un audit completo e produci <code>riepilogo</code>, un dizionario con: <code>"righe"</code> (totale), <code>"duplicati"</code> (conteggio), <code>"nan_totali"</code> (somma di tutti i NaN in tutte le colonne), <code>"colonna_peggiore"</code> (quella con più NaN).</p>`,
      setup: `import pandas as pd
import numpy as np
audit = pd.DataFrame({
    "id": ["a","b","b","c","d"],
    "valore": [10.0, np.nan, np.nan, 30.0, 40.0],
    "categoria": ["x", "y", "y", np.nan, "z"],
})`,
      starter: `# audit e' gia' caricato
buchi = audit.isna().sum()

riepilogo = {
    "righe": len(audit),
    "duplicati": int(audit.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`,
      check: `assert riepilogo["righe"] == 5
assert riepilogo["duplicati"] == 1
assert riepilogo["nan_totali"] == 3
assert riepilogo["colonna_peggiore"] == "valore"`,
      hint: `<p><code>buchi.sum()</code> somma i NaN di TUTTE le colonne in un solo numero; <code>buchi.idxmax()</code> trova quale colonna contribuisce di più.</p>`,
      solution: `buchi = audit.isna().sum()

riepilogo = {
    "righe": len(audit),
    "duplicati": int(audit.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`
    },

    {
      type: "exercise", id: "cl-31", kg: 10, title: "Drill: check-up dei parametri vitali",
      task: `<p>Su <code>vitali</code> (battito cardiaco, alcuni valori assurdi): <code>n_nan</code>, <code>n_negativi</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
vitali = pd.DataFrame({"paziente": ["p1","p2","p3","p4"], "battito": [72, -5, 88, np.nan]})`,
      starter: `# vitali e' gia' caricato
print(vitali.describe())
n_nan = ...
n_negativi = ...

print(n_nan, n_negativi)`,
      check: `assert n_nan == 1
assert n_negativi == 1`,
      hint: `<p><code>vitali["battito"].isna().sum()</code>, <code>(vitali["battito"] &lt; 0).sum()</code>.</p>`,
      solution: `print(vitali.describe())
n_nan = vitali["battito"].isna().sum()
n_negativi = (vitali["battito"] < 0).sum()

print(n_nan, n_negativi)`
    },

    {
      type: "exercise", id: "cl-32", kg: 15, title: "Drill: pazienti registrati due volte",
      task: `<p>Su <code>pzt</code>: <code>n_cloni</code> (duplicati esatti), <code>unica</code> (una riga per <code>id</code>).</p>`,
      setup: `import pandas as pd
pzt = pd.DataFrame({"id": ["a1","a2","a2","a3"], "eta": [30, 45, 45, 50]})`,
      starter: `# pzt e' gia' caricato
n_cloni = ...
unica = ...

print(n_cloni)
print(unica)`,
      check: `assert n_cloni == 1
assert len(unica) == 3`,
      hint: `<p><code>pzt.duplicated().sum()</code>, <code>pzt.drop_duplicates(subset=["id"])</code>.</p>`,
      solution: `n_cloni = pzt.duplicated().sum()
unica = pzt.drop_duplicates(subset=["id"])

print(n_cloni)
print(unica)`
    },

    {
      type: "exercise", id: "cl-33", kg: 15, title: "Drill: termometro con virgola",
      task: `<p>Su <code>temp</code> (colonna <code>valore</code> testuale, un errore): crea <code>valore_num</code>, <code>n_falliti</code>, <code>media</code>.</p>`,
      setup: `import pandas as pd
temp = pd.DataFrame({"id": ["t1","t2","t3","t4"], "valore": ["21,5","19,0","err","23,2"]})`,
      starter: `# temp e' gia' caricato
temp["valore_num"] = ...
n_falliti = ...
media = ...

print(temp)
print(n_falliti, media)`,
      check: `assert abs(temp.loc[0,"valore_num"] - 21.5) < 1e-9
assert n_falliti == 1
assert abs(media - 21.233333333333333) < 1e-6`,
      hint: `<p><code>pd.to_numeric(temp["valore"].str.replace(",", "."), errors="coerce")</code>.</p>`,
      solution: `temp["valore_num"] = pd.to_numeric(temp["valore"].str.replace(",", "."), errors="coerce")
n_falliti = temp["valore_num"].isna().sum()
media = temp["valore_num"].mean()

print(temp)
print(n_falliti, media)`
    },

    {
      type: "exercise", id: "cl-34", kg: 15, title: "Drill: città scritte in modi diversi",
      task: `<p>Su <code>citta_df</code>: <code>n_prima</code> (categorie distinte prima), <code>normalizzato</code> (strip+lower), <code>n_dopo</code>.</p>`,
      setup: `import pandas as pd
citta_df = pd.DataFrame({"citta": ["Roma", " roma", "MILANO", "milano ", "Roma"]})`,
      starter: `# citta_df e' gia' caricato
n_prima = ...
normalizzato = ...
n_dopo = ...

print(n_prima, n_dopo)`,
      check: `assert n_prima == 4
assert n_dopo == 2
assert set(normalizzato.unique()) == {"roma", "milano"}`,
      hint: `<p><code>citta_df["citta"].str.strip().str.lower()</code>.</p>`,
      solution: `n_prima = citta_df["citta"].nunique()
normalizzato = citta_df["citta"].str.strip().str.lower()
n_dopo = normalizzato.nunique()

print(n_prima, n_dopo)`
    },

    {
      type: "exercise", id: "cl-35", kg: 20, title: "Drill: tempo di consegna per città",
      task: `<p>Su <code>cons</code> (un tempo mancante): <code>tempo_pieno</code> (NaN riempiti con la media della <strong>propria</strong> città, via <code>transform</code>).</p>`,
      setup: `import pandas as pd
import numpy as np
cons = pd.DataFrame({"citta": ["Roma","Roma","Milano","Milano","Roma"], "tempo": [30.0, np.nan, 50.0, 55.0, 28.0]})`,
      starter: `# cons e' gia' caricato
medie = cons.groupby("citta")["tempo"].transform("mean")
cons["tempo_pieno"] = ...

print(cons)`,
      check: `assert abs(cons.loc[1,"tempo_pieno"] - 29.0) < 1e-9`,
      hint: `<p><code>cons["tempo"].fillna(medie)</code>.</p>`,
      solution: `medie = cons.groupby("citta")["tempo"].transform("mean")
cons["tempo_pieno"] = cons["tempo"].fillna(medie)

print(cons)`
    },

    {
      type: "exercise", id: "cl-36", kg: 20, title: "Drill: ordini sospetti v2",
      task: `<p>Su <code>importi2</code> (Series): applica il protocollo IQR — <code>n_outlier</code>, <code>valori_outlier</code>.</p>`,
      setup: `import pandas as pd
importi2 = pd.Series([40, 42, 38, 45, 41, 39, 500, 43, 15])`,
      starter: `# importi2 e' gia' pronto
q1, q3 = importi2.quantile(0.25), importi2.quantile(0.75)
iqr = q3 - q1
outlier = ...
n_outlier = ...
valori_outlier = ...

print(n_outlier, valori_outlier)`,
      check: `assert n_outlier == 2
assert sorted(valori_outlier) == [15, 500]`,
      hint: `<p><code>(importi2 &lt; q1 - 1.5*iqr) | (importi2 &gt; q3 + 1.5*iqr)</code>.</p>`,
      solution: `q1, q3 = importi2.quantile(0.25), importi2.quantile(0.75)
iqr = q3 - q1
outlier = (importi2 < q1 - 1.5*iqr) | (importi2 > q3 + 1.5*iqr)
n_outlier = outlier.sum()
valori_outlier = importi2[outlier].tolist()

print(n_outlier, valori_outlier)`
    },

    {
      type: "exercise", id: "cl-37", kg: 15, title: "Drill: fasce di punteggio",
      task: `<p>Su <code>punti</code> (Series): <code>fasce</code> con <code>pd.cut</code>, soglie <code>[0, 30, 60, 100]</code>, etichette <code>["basso","medio","alto"]</code>.</p>`,
      starter: `import pandas as pd

punti = pd.Series([10, 25, 40, 55, 70, 85, 95])

fasce = ...
print(fasce.tolist())`,
      check: `assert fasce.tolist() == ["basso","basso","medio","medio","alto","alto","alto"]`,
      hint: `<p><code>pd.cut(punti, bins=[0, 30, 60, 100], labels=["basso","medio","alto"])</code>.</p>`,
      solution: `import pandas as pd

punti = pd.Series([10, 25, 40, 55, 70, 85, 95])

fasce = pd.cut(punti, bins=[0, 30, 60, 100], labels=["basso","medio","alto"])
print(fasce.tolist())`
    },

    {
      type: "exercise", id: "cl-38", kg: 20, title: "Drill: ore di studio e voto",
      task: `<p>Su <code>stud</code>: <code>corr</code> (correlazione tra <code>ore</code> e <code>voto</code>).</p>`,
      starter: `import pandas as pd

stud = pd.DataFrame({"ore": [1, 2, 3, 4, 5], "voto": [60, 65, 70, 80, 95]})

corr = ...
print(corr)`,
      check: `assert corr > 0.95`,
      hint: `<p><code>stud["ore"].corr(stud["voto"])</code>.</p>`,
      solution: `import pandas as pd

stud = pd.DataFrame({"ore": [1, 2, 3, 4, 5], "voto": [60, 65, 70, 80, 95]})

corr = stud["ore"].corr(stud["voto"])
print(corr)`
    },

    {
      type: "exercise", id: "cl-39", kg: 20, title: "Drill: quali colonne tenere",
      task: `<p>Su <code>df39</code> (3 colonne con diverse percentuali di NaN): <code>perc</code> e <code>da_tenere</code> (meno del 50% di NaN).</p>`,
      setup: `import pandas as pd
import numpy as np
df39 = pd.DataFrame({"x": [1, np.nan, 3, 4], "y": [np.nan, np.nan, np.nan, 4], "z": [1, 2, 3, 4]})`,
      starter: `# df39 e' gia' caricato
perc = ...
da_tenere = ...

print(perc)
print(da_tenere)`,
      check: `assert abs(perc["x"] - 25.0) < 1e-9
assert abs(perc["y"] - 75.0) < 1e-9
assert set(da_tenere) == {"x", "z"}`,
      hint: `<p><code>df39.isna().mean() * 100</code>, poi <code>list(perc[perc &lt; 50].index)</code>.</p>`,
      solution: `perc = df39.isna().mean() * 100
da_tenere = list(perc[perc < 50].index)

print(perc)
print(da_tenere)`
    },

    {
      type: "exercise", id: "cl-40", kg: 20, title: "Combo: metodi di pagamento con NaN",
      task: `<p>Su <code>metodi</code> (con NaN): normalizza (strip+lower), riempi i NaN con <code>"sconosciuto"</code>, poi <code>conteggi</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
metodi = pd.DataFrame({"tipo": ["Bonifico", " bonifico", np.nan, "CONTANTI", "Bonifico"]})`,
      starter: `# metodi e' gia' caricato
metodi["tipo"] = metodi["tipo"].str.strip().str.lower()
metodi["tipo"] = ...
conteggi = ...

print(conteggi)`,
      check: `assert conteggi["bonifico"] == 3
assert conteggi["sconosciuto"] == 1`,
      hint: `<p>Normalizza PRIMA (i NaN restano NaN), poi <code>.fillna("sconosciuto")</code>.</p>`,
      solution: `metodi["tipo"] = metodi["tipo"].str.strip().str.lower()
metodi["tipo"] = metodi["tipo"].fillna("sconosciuto")
conteggi = metodi["tipo"].value_counts()

print(conteggi)`
    },

    {
      type: "exercise", id: "cl-41", kg: 20, title: "Combo: battito cardiaco anomalo per reparto",
      task: `<p>Su <code>vitali2</code> (due reparti con scale diverse): calcola lo z-score <strong>per reparto</strong> con <code>transform</code>, poi <code>outlier</code> dove <code>|z| &gt; 1.5</code>.</p>`,
      setup: `import pandas as pd
vitali2 = pd.DataFrame({
    "reparto": ["A","A","A","A","A","B","B","B","B","B"],
    "battito": [70, 72, 68, 75, 71, 110, 115, 108, 112, 300],
})`,
      starter: `# vitali2 e' gia' caricato
medie = vitali2.groupby("reparto")["battito"].transform("mean")
std = vitali2.groupby("reparto")["battito"].transform("std")
z = (vitali2["battito"] - medie) / std
outlier = z.abs() > 1.5

print(z.round(2))
print(outlier.tolist())`,
      check: `assert outlier.tolist() == [False, False, False, False, False, False, False, False, False, True]`,
      hint: `<p>Il calcolo per reparto evita che i valori normali di B (scala più alta) sembrino outlier rispetto ad A.</p>`,
      solution: `medie = vitali2.groupby("reparto")["battito"].transform("mean")
std = vitali2.groupby("reparto")["battito"].transform("std")
z = (vitali2["battito"] - medie) / std
outlier = z.abs() > 1.5

print(z.round(2))
print(outlier.tolist())`
    },

    {
      type: "exercise", id: "cl-42", kg: 20, title: "Combo: binning bilanciato v2",
      task: `<p>Su <code>voti3</code> (9 valori): <code>conteggio_cut</code> (soglie fisse <code>[0,40,70,100]</code>, etichette <code>["bassa","media","alta"]</code>) e <code>conteggio_qcut</code> (3 gruppi bilanciati).</p>`,
      setup: `import pandas as pd
voti3 = pd.Series([12, 34, 56, 78, 90, 23, 45, 67, 89])`,
      starter: `# voti3 e' gia' pronto
fascia_cut = pd.cut(voti3, bins=[0, 40, 70, 100], labels=["bassa","media","alta"])
fascia_qcut = pd.qcut(voti3, q=3, labels=["bassa","media","alta"])

conteggio_cut = fascia_cut.value_counts()
conteggio_qcut = fascia_qcut.value_counts()

print(conteggio_cut)
print(conteggio_qcut)`,
      check: `assert conteggio_cut["bassa"] == 3
assert sorted(conteggio_qcut.tolist()) == [3, 3, 3]`,
      hint: `<p><code>qcut</code> garantisce sempre gruppi di uguale numerosità; <code>cut</code> dipende da dove cadono i dati.</p>`,
      solution: `fascia_cut = pd.cut(voti3, bins=[0, 40, 70, 100], labels=["bassa","media","alta"])
fascia_qcut = pd.qcut(voti3, q=3, labels=["bassa","media","alta"])

conteggio_cut = fascia_cut.value_counts()
conteggio_qcut = fascia_qcut.value_counts()

print(conteggio_cut)
print(conteggio_qcut)`
    },

    {
      type: "exercise", id: "cl-43", kg: 20, title: "Combo: la coppia più correlata",
      task: `<p>Su <code>dati5</code> (prezzo, domanda, recensioni): trova la coppia di colonne con correlazione più forte in valore assoluto, in <code>coppia_top</code>.</p>`,
      setup: `import pandas as pd
dati5 = pd.DataFrame({
    "prezzo": [10, 20, 30, 40, 50],
    "domanda": [100, 80, 60, 40, 20],
    "recensioni": [3.0, 3.2, 3.1, 3.4, 3.3],
})`,
      starter: `# dati5 e' gia' caricato
m = dati5.corr()
print(m)

migliore = None
coppia_top = None
cols = list(m.columns)
for i in range(len(cols)):
    for j in range(i+1, len(cols)):
        val = abs(m.loc[cols[i], cols[j]])
        if migliore is None or val > migliore:
            migliore = val
            coppia_top = (cols[i], cols[j])

print(coppia_top)`,
      check: `assert set(coppia_top) == {"prezzo", "domanda"}`,
      hint: `<p>Prezzo e domanda sono in relazione lineare perfetta (corr = -1): nessun'altra coppia può superarla in valore assoluto.</p>`,
      solution: `m = dati5.corr()
print(m)

migliore = None
coppia_top = None
cols = list(m.columns)
for i in range(len(cols)):
    for j in range(i+1, len(cols)):
        val = abs(m.loc[cols[i], cols[j]])
        if migliore is None or val > migliore:
            migliore = val
            coppia_top = (cols[i], cols[j])

print(coppia_top)`
    },

    {
      type: "exercise", id: "cl-44", kg: 25, title: "Combo: pipeline sondaggio v2",
      task: `<p>Su <code>sond2</code> (punteggi impossibili e un NaN): sostituisci i punteggi fuori dal range [0,10] con NaN via <code>.where</code>, poi riempi tutti i NaN con la mediana.</p>`,
      setup: `import pandas as pd
import numpy as np
sond2 = pd.DataFrame({"punteggio": [7, 12, 5, -1, np.nan, 8, 6]})`,
      starter: `# sond2 e' gia' caricato
validi = sond2["punteggio"].where((sond2["punteggio"] >= 0) & (sond2["punteggio"] <= 10))
sond2["punteggio_pulito"] = validi.fillna(validi.median())

print(sond2)`,
      check: `assert sond2["punteggio_pulito"].isna().sum() == 0
assert sond2.loc[1, "punteggio_pulito"] == sond2.loc[3, "punteggio_pulito"]
assert sond2.loc[1, "punteggio_pulito"] == 6.5`,
      hint: `<p>Valori validi: 7, 5, 8, 6 — mediana 6.5. I due valori fuori range (12 e -1) diventano entrambi 6.5.</p>`,
      solution: `validi = sond2["punteggio"].where((sond2["punteggio"] >= 0) & (sond2["punteggio"] <= 10))
sond2["punteggio_pulito"] = validi.fillna(validi.median())

print(sond2)`
    },

    {
      type: "exercise", id: "cl-45", kg: 25, title: "Combo: recensioni doppie sullo stesso prodotto",
      task: `<p>Su <code>rev</code>: <code>dup_concettuali</code>, doppioni su <code>["prodotto","giorno"]</code> tenendo l'<strong>ultima</strong>.</p>`,
      setup: `import pandas as pd
rev = pd.DataFrame({
    "prodotto": ["p1","p1","p2","p3","p3"],
    "giorno": ["lun","lun","mar","mer","mer"],
    "voto": [4, 5, 3, 2, 5],
})`,
      starter: `# rev e' gia' caricato
dup_concettuali = rev.drop_duplicates(subset=["prodotto","giorno"], keep="last")
print(dup_concettuali)`,
      check: `assert len(dup_concettuali) == 3
assert dup_concettuali[dup_concettuali["prodotto"]=="p1"]["voto"].iloc[0] == 5`,
      hint: `<p><code>keep="last"</code> tiene l'ultima occorrenza di ogni combinazione.</p>`,
      solution: `dup_concettuali = rev.drop_duplicates(subset=["prodotto","giorno"], keep="last")
print(dup_concettuali)`
    },

    {
      type: "exercise", id: "cl-46", kg: 25, title: "Combo: report di qualità dati v2",
      task: `<p>Su <code>rep2</code>: <code>righe_totali</code>, <code>colonne_con_nan</code>, <code>colonna_peggiore</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
rep2 = pd.DataFrame({"a": [1, 2, np.nan, 4], "b": [1, np.nan, np.nan, np.nan], "c": [1, 2, 3, 4]})`,
      starter: `# rep2 e' gia' caricato
righe_totali = len(rep2)
buchi = rep2.isna().sum()
colonne_con_nan = list(buchi[buchi > 0].index)
colonna_peggiore = buchi.idxmax()

print(righe_totali, colonne_con_nan, colonna_peggiore)`,
      check: `assert righe_totali == 4
assert set(colonne_con_nan) == {"a", "b"}
assert colonna_peggiore == "b"`,
      hint: `<p><code>buchi.idxmax()</code> individua la colonna col massimo conteggio di NaN.</p>`,
      solution: `righe_totali = len(rep2)
buchi = rep2.isna().sum()
colonne_con_nan = list(buchi[buchi > 0].index)
colonna_peggiore = buchi.idxmax()

print(righe_totali, colonne_con_nan, colonna_peggiore)`
    },

    {
      type: "exercise", id: "cl-47", kg: 25, title: "Combo: normalizza, imputa, clippa v2",
      task: `<p>Su <code>mag2</code> (colonna <code>peso</code>): riempi i NaN con la mediana, clippa con la recinzione IQR. Salva in <code>mag2["peso_finale"]</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
mag2 = pd.DataFrame({"peso": [10.0, 12.0, np.nan, 11.0, 200.0, 9.0, 10.5]})`,
      starter: `# mag2 e' gia' caricato
step1 = mag2["peso"].fillna(mag2["peso"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
mag2["peso_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(mag2)`,
      check: `assert mag2["peso_finale"].isna().sum() == 0
assert mag2["peso_finale"].max() < 100`,
      hint: `<p>Ordine fondamentale: prima riempi i NaN, poi calcoli i quartili, poi clippi.</p>`,
      solution: `step1 = mag2["peso"].fillna(mag2["peso"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
mag2["peso_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(mag2)`
    },

    {
      type: "exercise", id: "cl-48", kg: 25, title: "Combo: dipendenti con dati incompleti",
      task: `<p>Su <code>emp2</code>: <code>riga_incompleta</code> (almeno un NaN in una qualsiasi colonna), <code>incompleti</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
emp2 = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan"],
    "email": ["a@x.com", np.nan, "c@x.com", "d@x.com"],
    "telefono": ["1", np.nan, np.nan, "4"],
})`,
      starter: `# emp2 e' gia' caricato
riga_incompleta = ...
incompleti = ...

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`,
      check: `assert riga_incompleta.tolist() == [False, True, True, False]
assert incompleti["nome"].tolist() == ["Bo", "Cin"]`,
      hint: `<p><code>emp2.isna().any(axis=1)</code>.</p>`,
      solution: `riga_incompleta = emp2.isna().any(axis=1)
incompleti = emp2[riga_incompleta]

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`
    },

    {
      type: "exercise", id: "cl-49", kg: 25, title: "Combo: il sensore rumoroso, seconda puntata",
      task: `<p>Su <code>storico2</code> (letture in due giorni): calcola z-score per giorno, marca gli outlier (<code>|z|&gt;1.5</code>), sostituiscili con la mediana del <strong>proprio</strong> giorno.</p>`,
      setup: `import pandas as pd
storico2 = pd.DataFrame({
    "giorno": ["a"]*5 + ["b"]*5,
    "valore": [10, 11, 9, 12, 50, 30, 31, 29, 32, 5],
})`,
      starter: `# storico2 e' gia' caricato
medie = storico2.groupby("giorno")["valore"].transform("mean")
std = storico2.groupby("giorno")["valore"].transform("std")
mediane = storico2.groupby("giorno")["valore"].transform("median")

z = (storico2["valore"] - medie) / std
outlier = z.abs() > 1.5
storico2["valore_pulito"] = storico2["valore"].where(~outlier, mediane)

print(storico2)`,
      check: `assert storico2.loc[4, "valore_pulito"] == 11.0
assert storico2.loc[9, "valore_pulito"] == 30.0`,
      hint: `<p>La mediana del giorno "a" è 11, quella del giorno "b" è 30: ognuno dei due outlier va sostituito con la mediana del proprio giorno, non con quella globale.</p>`,
      solution: `medie = storico2.groupby("giorno")["valore"].transform("mean")
std = storico2.groupby("giorno")["valore"].transform("std")
mediane = storico2.groupby("giorno")["valore"].transform("median")

z = (storico2["valore"] - medie) / std
outlier = z.abs() > 1.5
storico2["valore_pulito"] = storico2["valore"].where(~outlier, mediane)

print(storico2)`
    },

    {
      type: "exercise", id: "cl-50", kg: 25, title: "Massimale: audit completo v2",
      task: `<p>Su <code>audit2</code>: costruisci <code>riepilogo</code> con <code>"righe"</code>, <code>"duplicati"</code>, <code>"nan_totali"</code>, <code>"colonna_peggiore"</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
audit2 = pd.DataFrame({
    "id": ["x", "y", "y", "z", "w"],
    "valore": [5.0, np.nan, np.nan, 15.0, 25.0],
    "tipo": ["a", "b", "b", np.nan, "c"],
})`,
      starter: `# audit2 e' gia' caricato
buchi = audit2.isna().sum()

riepilogo = {
    "righe": len(audit2),
    "duplicati": int(audit2.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`,
      check: `assert riepilogo["righe"] == 5
assert riepilogo["duplicati"] == 1
assert riepilogo["nan_totali"] == 3
assert riepilogo["colonna_peggiore"] == "valore"`,
      hint: `<p>La riga "y" compare due volte identica (anche i due NaN in valore contano come uguali per <code>duplicated()</code>).</p>`,
      solution: `buchi = audit2.isna().sum()

riepilogo = {
    "righe": len(audit2),
    "duplicati": int(audit2.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`
    },

    {
      type: "exercise", id: "cl-51", kg: 10, title: "Drill: check-up dei voti d'esame",
      task: `<p>Su <code>esami</code>: <code>n_nan</code>, <code>n_negativi</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
esami = pd.DataFrame({"voto": [18, 25, 30, -2, np.nan, 28]})`,
      starter: `# esami e' gia' caricato
print(esami.describe())
n_nan = ...
n_negativi = ...

print(n_nan, n_negativi)`,
      check: `assert n_nan == 1
assert n_negativi == 1`,
      hint: `<p><code>esami["voto"].isna().sum()</code>, <code>(esami["voto"] &lt; 0).sum()</code>.</p>`,
      solution: `print(esami.describe())
n_nan = esami["voto"].isna().sum()
n_negativi = (esami["voto"] < 0).sum()

print(n_nan, n_negativi)`
    },

    {
      type: "exercise", id: "cl-52", kg: 15, title: "Drill: ordini registrati due volte",
      task: `<p>Su <code>ord4</code>: <code>n_cloni</code>, <code>unica</code> (una riga per <code>id</code>).</p>`,
      setup: `import pandas as pd
ord4 = pd.DataFrame({"id": ["o1","o2","o2","o3"], "importo": [50, 80, 80, 40]})`,
      starter: `# ord4 e' gia' caricato
n_cloni = ...
unica = ...

print(n_cloni)
print(unica)`,
      check: `assert n_cloni == 1
assert len(unica) == 3`,
      hint: `<p><code>ord4.duplicated().sum()</code>, <code>ord4.drop_duplicates(subset=["id"])</code>.</p>`,
      solution: `n_cloni = ord4.duplicated().sum()
unica = ord4.drop_duplicates(subset=["id"])

print(n_cloni)
print(unica)`
    },

    {
      type: "exercise", id: "cl-53", kg: 15, title: "Drill: listino prezzi con virgola",
      task: `<p>Su <code>prezzi3</code>: crea <code>prezzo_num</code>, <code>n_falliti</code>, <code>media</code>.</p>`,
      setup: `import pandas as pd
prezzi3 = pd.DataFrame({"id": ["a","b","c","d"], "prezzo": ["10,5","8,0","malformato","12,3"]})`,
      starter: `# prezzi3 e' gia' caricato
prezzi3["prezzo_num"] = ...
n_falliti = ...
media = ...

print(prezzi3)
print(n_falliti, media)`,
      check: `assert abs(prezzi3.loc[0,"prezzo_num"] - 10.5) < 1e-9
assert n_falliti == 1
assert abs(media - 10.266666666666667) < 1e-6`,
      hint: `<p><code>pd.to_numeric(prezzi3["prezzo"].str.replace(",", "."), errors="coerce")</code>.</p>`,
      solution: `prezzi3["prezzo_num"] = pd.to_numeric(prezzi3["prezzo"].str.replace(",", "."), errors="coerce")
n_falliti = prezzi3["prezzo_num"].isna().sum()
media = prezzi3["prezzo_num"].mean()

print(prezzi3)
print(n_falliti, media)`
    },

    {
      type: "exercise", id: "cl-54", kg: 15, title: "Drill: zone geografiche sporche",
      task: `<p>Su <code>gen</code>: <code>n_prima</code>, <code>normalizzato</code>, <code>n_dopo</code>.</p>`,
      setup: `import pandas as pd
gen = pd.DataFrame({"categoria": ["Nord", " nord", "SUD", "sud ", "Nord"]})`,
      starter: `# gen e' gia' caricato
n_prima = ...
normalizzato = ...
n_dopo = ...

print(n_prima, n_dopo)`,
      check: `assert n_prima == 4
assert n_dopo == 2
assert set(normalizzato.unique()) == {"nord", "sud"}`,
      hint: `<p><code>gen["categoria"].str.strip().str.lower()</code>.</p>`,
      solution: `n_prima = gen["categoria"].nunique()
normalizzato = gen["categoria"].str.strip().str.lower()
n_dopo = normalizzato.nunique()

print(n_prima, n_dopo)`
    },

    {
      type: "exercise", id: "cl-55", kg: 20, title: "Drill: peso prodotto per categoria",
      task: `<p>Su <code>prodx</code> (un peso mancante): <code>peso_pieno</code> (NaN riempiti con la media della propria categoria).</p>`,
      setup: `import pandas as pd
import numpy as np
prodx = pd.DataFrame({"categoria": ["libri","libri","elettronica","elettronica","libri"], "peso": [0.5, np.nan, 2.0, 2.2, 0.4]})`,
      starter: `# prodx e' gia' caricato
medie = prodx.groupby("categoria")["peso"].transform("mean")
prodx["peso_pieno"] = ...

print(prodx)`,
      check: `assert abs(prodx.loc[1,"peso_pieno"] - 0.45) < 1e-9`,
      hint: `<p><code>prodx["peso"].fillna(medie)</code>.</p>`,
      solution: `medie = prodx.groupby("categoria")["peso"].transform("mean")
prodx["peso_pieno"] = prodx["peso"].fillna(medie)

print(prodx)`
    },

    {
      type: "exercise", id: "cl-56", kg: 20, title: "Drill: recinzione IQR sui voti",
      task: `<p>Su <code>voti4</code> (Series): <code>n_outlier</code>, <code>valori_outlier</code>.</p>`,
      setup: `import pandas as pd
voti4 = pd.Series([70, 72, 68, 75, 71, 69, 15, 73])`,
      starter: `# voti4 e' gia' pronto
q1, q3 = voti4.quantile(0.25), voti4.quantile(0.75)
iqr = q3 - q1
outlier = ...
n_outlier = ...
valori_outlier = ...

print(n_outlier, valori_outlier)`,
      check: `assert n_outlier == 1
assert valori_outlier == [15]`,
      hint: `<p><code>(voti4 &lt; q1 - 1.5*iqr) | (voti4 &gt; q3 + 1.5*iqr)</code>.</p>`,
      solution: `q1, q3 = voti4.quantile(0.25), voti4.quantile(0.75)
iqr = q3 - q1
outlier = (voti4 < q1 - 1.5*iqr) | (voti4 > q3 + 1.5*iqr)
n_outlier = outlier.sum()
valori_outlier = voti4[outlier].tolist()

print(n_outlier, valori_outlier)`
    },

    {
      type: "exercise", id: "cl-57", kg: 20, title: "Combo: metodi di spedizione con NaN",
      task: `<p>Su <code>sped2</code> (con NaN): normalizza, riempi con <code>"sconosciuto"</code>, poi <code>conteggi</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
sped2 = pd.DataFrame({"metodo": ["Espresso", " espresso", np.nan, "STANDARD", "Espresso"]})`,
      starter: `# sped2 e' gia' caricato
sped2["metodo"] = sped2["metodo"].str.strip().str.lower()
sped2["metodo"] = ...
conteggi = ...

print(conteggi)`,
      check: `assert conteggi["espresso"] == 3
assert conteggi["sconosciuto"] == 1`,
      hint: `<p>Normalizza prima, poi <code>.fillna("sconosciuto")</code>.</p>`,
      solution: `sped2["metodo"] = sped2["metodo"].str.strip().str.lower()
sped2["metodo"] = sped2["metodo"].fillna("sconosciuto")
conteggi = sped2["metodo"].value_counts()

print(conteggi)`
    },

    {
      type: "exercise", id: "cl-58", kg: 25, title: "Combo: normalizza, imputa, clippa v3",
      task: `<p>Su <code>cons2b</code> (colonna <code>tempo</code>): riempi i NaN con la mediana, clippa con la recinzione IQR. Salva in <code>cons2b["tempo_finale"]</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
cons2b = pd.DataFrame({"tempo": [20.0, 22.0, np.nan, 19.0, 300.0, 21.0, 18.0]})`,
      starter: `# cons2b e' gia' caricato
step1 = cons2b["tempo"].fillna(cons2b["tempo"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
cons2b["tempo_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(cons2b)`,
      check: `assert cons2b["tempo_finale"].isna().sum() == 0
assert cons2b["tempo_finale"].max() < 100`,
      hint: `<p>Il 300 è talmente estremo che qualsiasi recinzione IQR ragionevole lo clippa ben sotto 100.</p>`,
      solution: `step1 = cons2b["tempo"].fillna(cons2b["tempo"].median())
q1, q3 = step1.quantile(0.25), step1.quantile(0.75)
iqr = q3 - q1
cons2b["tempo_finale"] = step1.clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

print(cons2b)`
    },

    {
      type: "exercise", id: "cl-59", kg: 25, title: "Combo: fascicoli studenti incompleti",
      task: `<p>Su <code>stud2</code>: <code>riga_incompleta</code>, <code>incompleti</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
stud2 = pd.DataFrame({
    "nome": ["Ada", "Bo", "Cin", "Dan"],
    "email": ["a@x.com", "b@x.com", np.nan, "d@x.com"],
    "matricola": ["1", "2", "3", np.nan],
})`,
      starter: `# stud2 e' gia' caricato
riga_incompleta = ...
incompleti = ...

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`,
      check: `assert riga_incompleta.tolist() == [False, False, True, True]
assert incompleti["nome"].tolist() == ["Cin", "Dan"]`,
      hint: `<p><code>stud2.isna().any(axis=1)</code>.</p>`,
      solution: `riga_incompleta = stud2.isna().any(axis=1)
incompleti = stud2[riga_incompleta]

print(riga_incompleta.tolist())
print(incompleti["nome"].tolist())`
    },

    {
      type: "exercise", id: "cl-60", kg: 25, title: "Massimale finale: audit completo v3",
      task: `<p>Su <code>audit3</code>: costruisci <code>riepilogo</code> con <code>"righe"</code>, <code>"duplicati"</code>, <code>"nan_totali"</code>, <code>"colonna_peggiore"</code>.</p>`,
      setup: `import pandas as pd
import numpy as np
audit3 = pd.DataFrame({
    "id": ["p", "q", "q", "r", "s"],
    "valore": [100.0, np.nan, np.nan, 300.0, 150.0],
    "tag": ["x", "y", "y", np.nan, "z"],
})`,
      starter: `# audit3 e' gia' caricato
buchi = audit3.isna().sum()

riepilogo = {
    "righe": len(audit3),
    "duplicati": int(audit3.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`,
      check: `assert riepilogo["righe"] == 5
assert riepilogo["duplicati"] == 1
assert riepilogo["nan_totali"] == 3
assert riepilogo["colonna_peggiore"] == "valore"`,
      hint: `<p>La riga "q" è identica in entrambe le sue occorrenze, NaN compresi.</p>`,
      solution: `buchi = audit3.isna().sum()

riepilogo = {
    "righe": len(audit3),
    "duplicati": int(audit3.duplicated().sum()),
    "nan_totali": int(buchi.sum()),
    "colonna_peggiore": buchi.idxmax(),
}

print(riepilogo)`
    }
  ]
});
