window.MODULES.push({
  id: "pandas-power",
  name: "Pandas · Potenza",
  tagline: "La sala carichi pesanti: groupby, merge, pivot. Dove le tabelle si combinano e rispondono a domande vere.",
  intro: "Qui si passa dai singoli movimenti alle alzate composte: aggregare per gruppi, unire tabelle diverse, ribaltarle in tabelle di sintesi. È il 90% del lavoro quotidiano con dati reali.",
  packages: ["pandas"],
  items: [

    { type: "theory", title: "groupby: dividi, applica, combina", html: `
<p>La domanda più frequente in analisi dati è "qual è la statistica X <strong>per ogni</strong> gruppo Y?". <code>groupby</code> la risolve in tre mosse invisibili: <em>divide</em> le righe per gruppo, <em>applica</em> la statistica a ciascuno, <em>combina</em> i risultati.</p>
<pre><code>df.groupby("esercizio")["durata"].mean()
# esercizio
# panca    82.0
# squat    98.7     ← una riga per gruppo</code></pre>
<p>Il risultato è una Series con i gruppi come indice: <code>medie["squat"]</code>, <code>medie.idxmax()</code>, <code>medie.sort_values()</code> funzionano tutti. Leggi la riga come una frase: "raggruppa per esercizio, prendi la durata, fai la media".</p>
`, more: `
<p><code>df.groupby("esercizio")</code> da solo, senza selezionare una colonna, restituisce un oggetto <code>GroupBy</code> "in attesa" — non stampa nulla di utile finché non gli dici quale colonna e quale statistica vuoi (<code>["durata"].mean()</code>) oppure iteri su di esso con <code>for nome, gruppo in df.groupby("esercizio"):</code>, dove <code>gruppo</code> è il sotto-DataFrame di quella categoria. Questa forma iterativa è utile quando la logica per ogni gruppo è troppo complessa per un singolo <code>.agg()</code>.</p>
<p>Puoi applicare <code>groupby</code> anche a un'intera selezione di colonne invece che a una sola: <code>df.groupby("esercizio")[["kg", "durata"]].mean()</code> restituisce un DataFrame con una riga per gruppo e una colonna per ciascuna delle statistiche richieste — comodo per non ripetere tre volte lo stesso <code>groupby</code> su colonne diverse.</p>
<p>Un errore comune per chi viene da Excel: pensare a <code>groupby</code> come a un filtro. Non lo è — non restringe le righe, le <strong>ripartiziona</strong>. Il numero di righe nel risultato è pari al numero di gruppi distinti, non al numero di righe originali; se hai bisogno delle righe originali con la statistica di gruppo affiancata (es. "quanto si scosta ogni sessione dalla media del suo esercizio"), serve <code>.transform()</code>, non <code>.agg()</code> — un'estensione che vedrai in progetti più avanzati.</p>
` },

    {
      type: "exercise", id: "pw-01", kg: 10, title: "Una media per gruppo",
      task: `<p>Il DataFrame <code>voc</code> (già caricato) contiene 12 serie di 4 esercizi. Calcola:</p>
<ul>
<li><code>durata_media</code>: la durata media <strong>per esercizio</strong></li>
<li><code>kg_max</code>: il massimo di <code>kg</code> per esercizio</li>
<li><code>piu_lunga</code>: l'esercizio con la durata media più alta (dalla Series, con un metodo)</li>
</ul>`,
      setup: `import pandas as pd
voc = pd.DataFrame({
    "esercizio": ["squat", "trazioni", "squat", "panca", "stacco", "squat", "trazioni", "panca", "stacco", "squat", "trazioni", "panca"],
    "kg": [810, 29, 790, 470, 500, 820, 30, 460, 510, 800, 29.5, 465],
    "durata": [95, 72, 88, 84, 90, 102, 70, 80, 92, 99, 74, 82],
})`,
      starter: `# voc e' gia' caricato
durata_media = ...
kg_max = ...
piu_lunga = ...

print(durata_media)
print(piu_lunga)`,
      check: `import pandas as pd
assert 'durata_media' in globals() and abs(float(durata_media["squat"]) - 96.0) < 1e-9 and abs(float(durata_media["trazioni"]) - 72.0) < 1e-9, "durata_media: voc.groupby('esercizio')['durata'].mean() — per 'squat' viene 96.0"
assert 'kg_max' in globals() and float(kg_max["squat"]) == 820 and float(kg_max["panca"]) == 470, "kg_max: groupby + .max()"
assert 'piu_lunga' in globals() and piu_lunga == "squat", "piu_lunga: durata_media.idxmax()"`,
      hint: `<p>Schema fisso: <code>df.groupby(colonna_gruppo)[colonna_valore].statistica()</code>. Poi <code>.idxmax()</code> sulla Series risultante.</p>`,
      solution: `durata_media = voc.groupby("esercizio")["durata"].mean()
kg_max = voc.groupby("esercizio")["kg"].max()
piu_lunga = durata_media.idxmax()

print(durata_media)
print(piu_lunga)`
    },

    { type: "theory", title: "agg: più statistiche, più gruppi", html: `
<p>Due estensioni naturali. Primo: raggruppare per <strong>più colonne</strong> passando una lista — ottieni un gruppo per ogni combinazione. Secondo: calcolare <strong>più statistiche insieme</strong> con <code>.agg()</code>:</p>
<pre><code>df.groupby("esercizio")["durata"].agg(["mean", "std", "count"])
#           mean   std  count
# esercizio
# squat      96.0  5.89      4

df.groupby(["atleta", "esercizio"])["kg"].mean()   # indice a due livelli</code></pre>
<p>Il <code>count</code> accanto alla media non è decorazione: una media su 3 osservazioni e una su 300 non meritano la stessa fiducia. Riportale sempre insieme.</p>
`, more: `
<p><code>.agg()</code> accetta anche un dizionario per applicare statistiche DIVERSE a colonne diverse nello stesso comando: <code>df.groupby("esercizio").agg({"durata": "mean", "kg": "max", "atleta": "count"})</code> — una riga per gruppo, ma ogni colonna del risultato calcolata con la funzione che le hai assegnato specificamente. È la forma più potente e compatta di riassumere un DataFrame raggruppato.</p>
<p>Il raggruppamento per più colonne (<code>groupby(["atleta", "esercizio"])</code>) produce un indice a più livelli (<code>MultiIndex</code>): per accedere a un valore preciso serve una tupla, <code>medie[("a01", "squat")]</code>, non due accessi separati. Per "srotolare" un MultiIndex in colonne normali, <code>.reset_index()</code> lo trasforma in un DataFrame piatto con "atleta" ed "esercizio" come colonne vere — spesso il passo successivo naturale prima di esportare o unire il risultato con un'altra tabella.</p>
<p>Le funzioni di aggregazione non si limitano a quelle built-in (<code>"mean"</code>, <code>"sum"</code>, <code>"std"</code>...): puoi passare una funzione personalizzata, anche una <code>lambda</code>: <code>.agg(lambda x: x.max() - x.min())</code> calcola l'escursione (range) di ogni gruppo — utile quando la statistica che ti serve non ha già un nome pronto in Pandas.</p>
` },

    {
      type: "exercise", id: "pw-02", kg: 15, title: "La scheda tecnica",
      task: `<p>Sempre su <code>voc</code> (stesso dataset di prima):</p>
<ul>
<li><code>scheda</code>: per ogni esercizio, <code>mean</code>, <code>std</code> e <code>count</code> della durata (un solo <code>.agg</code>)</li>
<li><code>gruppo_piccolo</code>: il numero di osservazioni del gruppo meno numeroso (dalla colonna <code>count</code> di <code>scheda</code>, come intero)</li>
</ul>`,
      setup: `import pandas as pd
voc = pd.DataFrame({
    "esercizio": ["squat", "trazioni", "squat", "panca", "stacco", "squat", "trazioni", "panca", "stacco", "squat", "trazioni", "panca"],
    "kg": [810, 29, 790, 470, 500, 820, 30, 460, 510, 800, 29.5, 465],
    "durata": [95, 72, 88, 84, 90, 102, 70, 80, 92, 99, 74, 82],
})`,
      starter: `# voc e' gia' caricato
scheda = ...
gruppo_piccolo = ...

print(scheda)
print(gruppo_piccolo)`,
      check: `import pandas as pd
assert 'scheda' in globals() and set(["mean", "std", "count"]).issubset(set(scheda.columns)), "scheda: .agg(['mean', 'std', 'count']) sulla durata raggruppata per esercizio"
assert abs(float(scheda.loc["squat", "mean"]) - 96.0) < 1e-9, "La media di 'squat' deve essere 96.0"
assert int(scheda.loc["stacco", "count"]) == 2, "'stacco' ha 2 osservazioni"
assert 'gruppo_piccolo' in globals() and int(gruppo_piccolo) == 2, "gruppo_piccolo: scheda['count'].min() — occhio, 'stacco' ha solo 2 dati: la sua media pesa meno!"`,
      hint: `<p><code>voc.groupby("esercizio")["durata"].agg(["mean", "std", "count"])</code> restituisce un DataFrame: le statistiche sono colonne, i gruppi righe.</p>`,
      solution: `scheda = voc.groupby("esercizio")["durata"].agg(["mean", "std", "count"])
gruppo_piccolo = int(scheda["count"].min())

print(scheda)
print(gruppo_piccolo)`
    },

    { type: "theory", title: "merge: unire tabelle", html: `
<p>I dati veri vivono in più tabelle: gli allenamenti in una, l'anagrafica atleti in un'altra. <code>pd.merge</code> le unisce allineando una colonna chiave:</p>
<pre><code>pd.merge(allenamenti, atleti, on="atleta")            # inner: solo chiavi presenti in ENTRAMBE
pd.merge(allenamenti, atleti, on="atleta", how="left") # left: tutte le righe di allenamenti, NaN dove manca l'anagrafica</code></pre>
<p>La scelta di <code>how</code> è una decisione sui dati, non un dettaglio: <code>inner</code> butta silenziosamente le righe senza corrispondenza, <code>left</code> le tiene e ti mostra i buchi. Dopo ogni merge, controlla <code>len()</code>: se le righe sono più di prima, la chiave aveva duplicati e le righe si sono <em>moltiplicate</em>.</p>
`, more: `
<p>Oltre a <code>inner</code> e <code>left</code> esistono <code>right</code> (speculare di left: tutte le righe della tabella di destra) e <code>outer</code> (tutte le righe di entrambe, NaN dove manca la corrispondenza in una delle due) — <code>outer</code> è utile quando vuoi vedere esplicitamente sia le chiavi orfane a sinistra sia quelle a destra in un colpo solo, tipicamente in fase di controllo qualità di un dataset appena ricevuto.</p>
<p>Se le colonne chiave hanno nomi diversi nelle due tabelle (es. <code>"atleta"</code> in una e <code>"id_atleta"</code> nell'altra), <code>on</code> non basta: serve <code>pd.merge(a, b, left_on="atleta", right_on="id_atleta")</code>. Il risultato conterrà entrambe le colonne chiave (spesso ridondanti) — è normale doverne eliminare una dopo con <code>.drop(columns=...)</code>.</p>
<p>Il "moltiplicarsi delle righe" citato sopra è il bug da merge più insidioso in assoluto: se la chiave di join ha duplicati in ENTRAMBE le tabelle, il merge produce il prodotto cartesiano delle righe che condividono quella chiave (es. 3 righe con "a01" a sinistra × 2 righe con "a01" a destra = 6 righe in output, non 3 o 2). La difesa standard è verificare <code>df["chiave"].duplicated().any()</code> su entrambe le tabelle PRIMA di un merge quando ti aspetti una relazione uno-a-uno o uno-a-molti.</p>
` },

    {
      type: "exercise", id: "pw-03", kg: 15, title: "Aggancia l'anagrafica",
      task: `<p>Hai <code>allenamenti</code> (6 righe: atleta, esercizio, kg) e <code>atleti</code> (anagrafica: atleta, livello, eta). Fai:</p>
<ul>
<li><code>completo</code>: il merge <strong>inner</strong> sulla colonna <code>atleta</code></li>
<li><code>n_righe</code>: quante righe ha <code>completo</code> (guarda bene: sono meno di 6?)</li>
<li><code>kg_medio_avanzati</code>: la media di <code>kg</code> delle sole righe con livello <code>"avanzato"</code></li>
</ul>`,
      setup: `import pandas as pd
allenamenti = pd.DataFrame({
    "atleta": ["a01", "a02", "a01", "a03", "a02", "a04"],
    "esercizio": ["squat", "squat", "trazioni", "squat", "trazioni", "panca"],
    "kg": [820, 780, 30, 850, 29, 460],
})
atleti = pd.DataFrame({
    "atleta": ["a01", "a02", "a03"],
    "livello": ["avanzato", "intermedio", "avanzato"],
    "eta": [24, 31, 28],
})`,
      starter: `# allenamenti e atleti sono gia' caricati
print(allenamenti)
print(atleti)

completo = ...
n_righe = ...
kg_medio_avanzati = ...

print(completo)`,
      check: `import pandas as pd
assert 'completo' in globals() and "livello" in completo.columns, "completo: pd.merge(allenamenti, atleti, on='atleta')"
assert 'n_righe' in globals() and int(n_righe) == 5, "n_righe deve essere 5: a04 non e' nell'anagrafica e l'inner join l'ha scartato — silenziosamente!"
assert 'kg_medio_avanzati' in globals() and abs(float(kg_medio_avanzati) - (820 + 30 + 850) / 3) < 1e-9, "kg_medio_avanzati: filtra livello == 'avanzato' e fai la media di kg (a01 due volte + a03)"`,
      hint: `<p>L'atleta a04 compare negli allenamenti ma non nell'anagrafica: con <code>how="inner"</code> (il default) la sua riga sparisce. Per la media: <code>completo.loc[completo["livello"] == "avanzato", "kg"].mean()</code>.</p>`,
      solution: `completo = pd.merge(allenamenti, atleti, on="atleta")
n_righe = len(completo)
kg_medio_avanzati = completo.loc[completo["livello"] == "avanzato", "kg"].mean()

print(completo)`
    },

    {
      type: "exercise", id: "pw-04", kg: 20, title: "Il registro degli assenti",
      task: `<p>Stesso setup, ma stavolta non vuoi perdere nessuno. Fai:</p>
<ul>
<li><code>tutti</code>: il merge <strong>left</strong> (tutte le righe di <code>allenamenti</code> sopravvivono)</li>
<li><code>senza_anagrafica</code>: il sotto-DataFrame delle righe dove <code>livello</code> è NaN (usa <code>.isna()</code> come maschera)</li>
<li><code>atleti_mancanti</code>: la lista (Python) dei codici atleta senza anagrafica, senza doppioni (usa <code>.unique()</code> e <code>list()</code>)</li>
</ul>`,
      setup: `import pandas as pd
allenamenti = pd.DataFrame({
    "atleta": ["a01", "a02", "a01", "a03", "a02", "a04"],
    "esercizio": ["squat", "squat", "trazioni", "squat", "trazioni", "panca"],
    "kg": [820, 780, 30, 850, 29, 460],
})
atleti = pd.DataFrame({
    "atleta": ["a01", "a02", "a03"],
    "livello": ["avanzato", "intermedio", "avanzato"],
    "eta": [24, 31, 28],
})`,
      starter: `# allenamenti e atleti sono gia' caricati
tutti = ...
senza_anagrafica = ...
atleti_mancanti = ...

print(tutti)
print(atleti_mancanti)`,
      check: `import pandas as pd
assert 'tutti' in globals() and len(tutti) == 6, "tutti deve avere 6 righe: how='left' tiene tutti gli allenamenti"
assert tutti["livello"].isna().sum() == 1, "Deve esserci esattamente 1 riga con livello NaN (a04)"
assert 'senza_anagrafica' in globals() and len(senza_anagrafica) == 1 and senza_anagrafica["atleta"].iloc[0] == "a04", "senza_anagrafica: tutti[tutti['livello'].isna()]"
assert 'atleti_mancanti' in globals() and atleti_mancanti == ["a04"], "atleti_mancanti deve essere la lista ['a04']"`,
      hint: `<p>Il left join trasforma le assenze in NaN visibili: <code>tutti[tutti["livello"].isna()]</code> è il tuo registro degli assenti. Poi <code>list(...["atleta"].unique())</code>.</p>`,
      solution: `tutti = pd.merge(allenamenti, atleti, on="atleta", how="left")
senza_anagrafica = tutti[tutti["livello"].isna()]
atleti_mancanti = list(senza_anagrafica["atleta"].unique())

print(tutti)
print(atleti_mancanti)`
    },

    { type: "theory", title: "pivot_table: la tabella di sintesi", html: `
<p>Un <code>groupby</code> su due variabili produce una lista lunga; spesso la vuoi <strong>a griglia</strong> — una variabile sulle righe, una sulle colonne. È la pivot:</p>
<pre><code>df.pivot_table(values="kg", index="esercizio", columns="livello", aggfunc="mean")
# livello     avanzato  intermedio
# esercizio
# squat          823.3       781.5
# trazioni        30.0        29.0</code></pre>
<p>È la tabella che metteresti in un report. <code>aggfunc</code> può essere <code>"mean"</code>, <code>"count"</code>, <code>"std"</code>… Il risultato è un normale DataFrame: <code>tab.loc["squat", "avanzato"]</code> pesca una cella.</p>
`, more: `
<p>Quando una combinazione riga×colonna non ha osservazioni (es. nessun principiante ha mai fatto stacchi), la cella corrispondente resta <code>NaN</code> per default. Il parametro <code>fill_value=0</code> (già usato in uno degli esercizi di questa sala) sostituisce quei buchi con uno zero esplicito — appropriato quando il "vuoto" significa davvero zero occorrenze, non "dato mancante da indagare".</p>
<p><code>pivot_table</code> accetta anche <strong>più valori</strong> contemporaneamente: <code>df.pivot_table(values=["kg", "durata"], index="esercizio", columns="livello", aggfunc="mean")</code> produce colonne annidate (un livello per il valore, uno per la categoria) — utile per un report che riassume più metriche nella stessa griglia invece di costruire due pivot separate.</p>
<p>Per invertire una pivot (da tabella larga a lista lunga), esiste <code>.melt()</code>: è l'operazione opposta, spesso necessaria prima di ridisegnare un grafico o rifare un groupby su dati che qualcun altro ti ha già consegnato in formato "a griglia".</p>
` },

    {
      type: "exercise", id: "pw-05", kg: 15, title: "La tabella da report",
      task: `<p>Il DataFrame <code>dati</code> (già caricato) ha kg per esercizio e livello. Costruisci:</p>
<ul>
<li><code>tabella</code>: pivot con esercizi sulle righe, livelli sulle colonne, media di <code>kg</code> nelle celle</li>
<li><code>squat_avanzato</code>: il valore della cella (esercizio "squat", livello "avanzato"), come float</li>
<li><code>differenze</code>: la Series <code>tabella["avanzato"] - tabella["intermedio"]</code> (di quanto il carico avanzato supera l'intermedio, per esercizio)</li>
</ul>`,
      setup: `import pandas as pd
dati = pd.DataFrame({
    "esercizio": ["squat", "squat", "squat", "squat", "trazioni", "trazioni", "trazioni", "trazioni", "affondi", "affondi", "affondi", "affondi"],
    "livello": ["avanzato", "avanzato", "intermedio", "intermedio", "avanzato", "avanzato", "intermedio", "intermedio", "avanzato", "avanzato", "intermedio", "intermedio"],
    "kg": [850, 830, 760, 740, 32, 31, 28, 27, 36, 35, 31, 30],
})`,
      starter: `# dati e' gia' caricato
tabella = ...
squat_avanzato = ...
differenze = ...

print(tabella)
print(differenze)`,
      check: `import pandas as pd
assert 'tabella' in globals() and abs(float(tabella.loc["squat", "avanzato"]) - 840.0) < 1e-9 and abs(float(tabella.loc["trazioni", "intermedio"]) - 27.5) < 1e-9, "tabella: pivot_table(values='kg', index='esercizio', columns='livello', aggfunc='mean')"
assert 'squat_avanzato' in globals() and abs(float(squat_avanzato) - 840.0) < 1e-9, "squat_avanzato: tabella.loc['squat', 'avanzato']"
assert 'differenze' in globals() and abs(float(differenze["squat"]) - 90.0) < 1e-9 and abs(float(differenze["affondi"]) - 5.0) < 1e-9, "differenze: tabella['avanzato'] - tabella['intermedio'] — per 'squat' viene 90"`,
      hint: `<p>Le colonne della pivot sono i valori di <code>livello</code>: <code>tabella["avanzato"]</code> è una Series indicizzata per esercizio, quindi la sottrazione si allinea da sola.</p>`,
      solution: `tabella = dati.pivot_table(values="kg", index="esercizio", columns="livello", aggfunc="mean")
squat_avanzato = float(tabella.loc["squat", "avanzato"])
differenze = tabella["avanzato"] - tabella["intermedio"]

print(tabella)
print(differenze)`
    },

    { type: "theory", title: "np.where e apply: trasformazioni condizionali", html: `
<p>Per creare una colonna che dipende da una condizione, l'attrezzo giusto è <code>np.where</code> (già visto in NumPy — funziona sulle Series):</p>
<pre><code>df["fascia"] = np.where(df["kg"] &gt; 100, "carico alto", "carico basso")</code></pre>
<p>Quando la logica è troppo articolata per <code>np.where</code>, c'è <code>.apply(funzione)</code>, che chiama una funzione Python su ogni valore. È flessibile ma <strong>lento</strong> (è un ciclo travestito): usalo come ultima risorsa, non come prima. Gerarchia di palestra: operazione vettorizzata &gt; <code>np.where</code> / <code>map</code> &gt; <code>apply</code>.</p>
`, more: `
<p><code>np.select</code> estende <code>np.where</code> a PIÙ di due condizioni senza dover annidare where dentro where: <code>np.select([df["kg"]>=100, df["kg"]>=50], ["alto", "medio"], default="basso")</code> valuta le condizioni in ordine e assegna la prima che risulta vera — spesso preferibile a una funzione con <code>.apply()</code> quando la logica è comunque a soglie numeriche, perché resta vettorizzata (quindi veloce) invece di iterare riga per riga.</p>
<p><code>.apply()</code> su un intero DataFrame (non su una singola colonna) può operare per riga passando <code>axis=1</code>: <code>df.apply(lambda riga: riga["kg"] / riga["ripetizioni"], axis=1)</code> — utile quando la logica combina più colonne della stessa riga in un modo che non si esprime come semplice aritmetica tra Series (es. una regola con più <code>if</code> che dipendono da più colonne insieme).</p>
<p>La lentezza di <code>.apply()</code> non è un dettaglio teorico: su un DataFrame di poche righe come quelli di questa palestra è invisibile, ma su un dataset di centinaia di migliaia di righe la differenza tra un'operazione vettorizzata e un <code>.apply()</code> riga per riga può essere di decine o centinaia di volte in tempo di esecuzione — un motivo concreto per abituarsi fin da subito a cercare prima l'alternativa vettorizzata.</p>
` },

    {
      type: "exercise", id: "pw-06", kg: 15, title: "Etichette condizionali",
      task: `<p>Sul DataFrame <code>shop</code> (prodotti del negozio della palestra, con vendite):</p>
<ul>
<li><code>shop["popolare"]</code>: <code>"si"</code> se <code>vendite &gt;= 80</code>, altrimenti <code>"no"</code> — con <code>np.where</code>, senza apply</li>
<li><code>shop["fascia"]</code>: tre livelli con la funzione <code>fascia()</code> già scritta, applicata con <code>.apply()</code></li>
<li><code>n_popolari</code>: quanti prodotti sono popolari</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
shop = pd.DataFrame({
    "prodotto": ["manubri", "tappetino", "borraccia", "corda", "fascia_elastica", "integratore"],
    "vendite": [120, 45, 88, 30, 95, 8],
})`,
      starter: `import numpy as np
# shop e' gia' caricato

def fascia(v):
    if v >= 100: return "alta"
    if v >= 40:  return "media"
    return "bassa"

shop["popolare"] = ...
shop["fascia"] = ...
n_popolari = ...

print(shop)`,
      check: `import pandas as pd
assert "popolare" in shop.columns and shop["popolare"].tolist() == ["si", "no", "si", "no", "si", "no"], "popolare: np.where(shop['vendite'] >= 80, 'si', 'no')"
assert "fascia" in shop.columns and shop["fascia"].tolist() == ["alta", "media", "media", "bassa", "media", "bassa"], "fascia: shop['vendite'].apply(fascia)"
assert 'n_popolari' in globals() and int(n_popolari) == 3, "n_popolari deve essere 3"`,
      hint: `<p><code>np.where(condizione, valore_se_vero, valore_se_falso)</code> per due livelli; per tre o più, la funzione con <code>.apply</code> è legittima. Conteggio: <code>(shop["popolare"] == "si").sum()</code>.</p>`,
      solution: `import numpy as np

def fascia(v):
    if v >= 100: return "alta"
    if v >= 40:  return "media"
    return "bassa"

shop["popolare"] = np.where(shop["vendite"] >= 80, "si", "no")
shop["fascia"] = shop["vendite"].apply(fascia)
n_popolari = int((shop["popolare"] == "si").sum())

print(shop)`
    },

    { type: "theory", title: "Lavorare con le stringhe: .str", html: `
<p>Le colonne di testo hanno un accessore dedicato, <code>.str</code>, che vettorizza i metodi delle stringhe:</p>
<pre><code>df["prodotto"].str.upper()             # tutte maiuscole
df["prodotto"].str.len()               # lunghezza di ogni nome
df["prodotto"].str.contains("tt")      # maschera booleana
df["prodotto"].str.startswith("c")     # idem
df["prodotto"].str[0]                  # prima lettera di ognuno</code></pre>
<p>Le maschere di <code>.str.contains</code> si usano come qualsiasi filtro: <code>df[df["prodotto"].str.contains("tt")]</code>. Per ogni catalogo, listino o log testuale, questo accessore è mezza cassetta degli attrezzi.</p>
`, more: `
<p><code>.str.contains()</code> tratta il pattern come una REGEX per default, non come testo letterale: caratteri come <code>.</code>, <code>(</code>, <code>)</code>, <code>+</code> hanno un significato speciale. Se devi cercare un carattere letterale che è anche speciale in regex (es. un punto in un codice prodotto "A.01"), passa <code>regex=False</code>: <code>df["codice"].str.contains(".", regex=False)</code> — altrimenti il punto significa "qualsiasi carattere", non "un punto vero".</p>
<p><code>.str.split()</code> divide una stringa in una lista di pezzi, e con <code>expand=True</code> li trasforma direttamente in colonne separate: <code>df["nome"].str.split(" ", expand=True)</code> spezza "Mario Rossi" in due colonne, "Mario" e "Rossi" — il primo passo tipico quando ricevi un campo "nome completo" che va scorporato in nome e cognome per un'analisi.</p>
<p>Attenzione ai valori mancanti: se una colonna di testo ha dei <code>NaN</code>, i metodi <code>.str</code> li propagano come <code>NaN</code> invece di sollevare un errore (es. <code>.str.upper()</code> su un NaN resta NaN) — comodo perché non serve gestirli a parte, ma va tenuto a mente quando conti quante righe soddisfano una condizione testuale: i NaN non contano né come True né come False esplicito nella maschera risultante.</p>
` },

    {
      type: "exercise", id: "pw-07", kg: 15, title: "Ginnastica sul catalogo",
      task: `<p>Sul DataFrame <code>shop</code> (già caricato, prodotti del negozio):</p>
<ul>
<li><code>shop["lunghezza"]</code>: la lunghezza in caratteri di ogni nome prodotto</li>
<li><code>doppie</code>: il sotto-DataFrame dei prodotti che contengono una doppia <code>pp</code>, <code>ll</code> oppure <code>rr</code> (suggerimento: <code>.str.contains</code> accetta una regex: <code>"pp|ll|rr"</code>)</li>
<li><code>inizia_con_c</code>: quanti prodotti iniziano per "c"</li>
</ul>`,
      setup: `import pandas as pd
shop = pd.DataFrame({
    "prodotto": ["manubri", "tappetino", "borraccia", "corda", "cavigliere", "collant", "cintura"],
    "vendite": [120, 45, 88, 30, 60, 40, 71],
})`,
      starter: `# shop e' gia' caricato
shop["lunghezza"] = ...
doppie = ...
inizia_con_c = ...

print(shop)
print(doppie["prodotto"].tolist())`,
      check: `import pandas as pd
assert "lunghezza" in shop.columns and shop["lunghezza"].tolist() == [7, 9, 9, 5, 10, 7, 7], "lunghezza: shop['prodotto'].str.len()"
assert 'doppie' in globals() and sorted(doppie["prodotto"]) == ["borraccia", "collant", "tappetino"], "doppie: shop[shop['prodotto'].str.contains('pp|ll|rr')]"
assert 'inizia_con_c' in globals() and int(inizia_con_c) == 4, "inizia_con_c deve essere 4 (corda, cavigliere, collant, cintura): .str.startswith('c') e somma la maschera"`,
      hint: `<p><code>shop["prodotto"].str.contains("pp|ll|rr")</code> — la barra verticale è l'OR delle regex. Il conteggio: <code>shop["prodotto"].str.startswith("c").sum()</code>.</p>`,
      solution: `shop["lunghezza"] = shop["prodotto"].str.len()
doppie = shop[shop["prodotto"].str.contains("pp|ll|rr")]
inizia_con_c = int(shop["prodotto"].str.startswith("c").sum())

print(shop)
print(doppie["prodotto"].tolist())`
    },

    { type: "theory", title: "Date e tempi: to_datetime e .dt", html: `
<p>Le date arrivano quasi sempre come stringhe. <code>pd.to_datetime</code> le converte in veri timestamp, e l'accessore <code>.dt</code> ne estrae i pezzi:</p>
<pre><code>df["data"] = pd.to_datetime(df["data"])   # da "2026-03-15" a Timestamp
df["data"].dt.month        # 3
df["data"].dt.year         # 2026
df["data"].dt.day_name()   # "Sunday"</code></pre>
<p>Una volta convertite, le date si confrontano (<code>df["data"] &gt; "2026-06-01"</code>) e si usano nei groupby: "sessioni per mese" è un <code>groupby(df["data"].dt.month)</code>. Finché restano stringhe, niente di tutto questo funziona.</p>
`, more: `
<p>Raggruppare per numero di mese (<code>.dt.month</code>) ha un limite: gennaio 2025 e gennaio 2026 finiscono nello stesso gruppo "1", mescolando anni diversi. Per un raggruppamento che rispetta anche l'anno, usa <code>.dt.to_period("M")</code> (crea un periodo "2026-03" invece del solo numero) oppure raggruppa su una tupla <code>(anno, mese)</code> con <code>groupby([df["data"].dt.year, df["data"].dt.month])</code>.</p>
<p>Oltre a <code>.dt.month</code>/<code>.dt.year</code>/<code>.dt.day_name()</code>, altri accessori utili: <code>.dt.dayofweek</code> (0=lunedì...6=domenica, comodo per filtrare weekend numericamente), <code>.dt.quarter</code> (trimestre 1-4), <code>.dt.is_month_end</code> (booleano). Tutti seguono lo stesso pattern: prefisso <code>.dt.</code> su una colonna già convertita in datetime.</p>
<p>Sottrarre due colonne datetime produce un <code>Timedelta</code>, non un numero: <code>df["durata_giorni"] = (df["data_fine"] - df["data_inizio"]).dt.days</code> estrae il numero intero di giorni — il pattern standard per calcolare durate (giorni di consegna, giorni di iscrizione, età di un ticket) a partire da due timestamp.</p>
` },

    {
      type: "exercise", id: "pw-08", kg: 20, title: "Il diario degli allenamenti",
      task: `<p><code>sessioni</code> registra le sessioni di allenamento (data come stringa!). Fai:</p>
<ul>
<li>Converti la colonna <code>data</code> in datetime (sovrascrivila)</li>
<li><code>sessioni["mese"]</code>: il mese di ogni sessione</li>
<li><code>volume_per_mese</code>: la <strong>somma</strong> di <code>volume</code> per mese (groupby sulla nuova colonna)</li>
<li><code>mese_top</code>: il mese (numero) con più volume totale</li>
</ul>`,
      setup: `import pandas as pd
sessioni = pd.DataFrame({
    "data": ["2026-03-02", "2026-03-18", "2026-04-05", "2026-04-22", "2026-04-29", "2026-05-11"],
    "atleta": ["a01", "a02", "a03", "a01", "a02", "a03"],
    "volume": [4200, 3500, 5000, 4400, 3800, 4600],
})`,
      starter: `import pandas as pd
# sessioni e' gia' caricato: la colonna data e' testo!
print(sessioni.dtypes)

sessioni["data"] = ...
sessioni["mese"] = ...
volume_per_mese = ...
mese_top = ...

print(volume_per_mese)`,
      check: `import pandas as pd
assert str(sessioni["data"].dtype).startswith("datetime"), "La colonna data deve diventare datetime: pd.to_datetime(sessioni['data'])"
assert "mese" in sessioni.columns and sessioni["mese"].tolist() == [3, 3, 4, 4, 4, 5], "mese: sessioni['data'].dt.month"
assert 'volume_per_mese' in globals() and int(volume_per_mese[4]) == 13200, "volume_per_mese: groupby('mese')['volume'].sum() — aprile fa 13200"
assert 'mese_top' in globals() and int(mese_top) == 4, "mese_top: volume_per_mese.idxmax() — aprile"`,
      hint: `<p>Prima la conversione, poi tutto scorre: <code>.dt.month</code>, <code>groupby("mese")["volume"].sum()</code>, <code>.idxmax()</code>.</p>`,
      solution: `import pandas as pd
print(sessioni.dtypes)

sessioni["data"] = pd.to_datetime(sessioni["data"])
sessioni["mese"] = sessioni["data"].dt.month
volume_per_mese = sessioni.groupby("mese")["volume"].sum()
mese_top = volume_per_mese.idxmax()

print(volume_per_mese)`
    },

    { type: "theory", title: "concat: impilare tabelle simili", html: `
<p><code>merge</code> unisce tabelle diverse allineando una chiave <em>in orizzontale</em>; <code>pd.concat</code> invece impila tabelle con le <strong>stesse colonne</strong> <em>in verticale</em> — il caso classico di due mesi di export separati:</p>
<pre><code>gennaio = pd.DataFrame({"atleta": ["a01"], "volume": [4000]})
febbraio = pd.DataFrame({"atleta": ["a01"], "volume": [4200]})
tutto = pd.concat([gennaio, febbraio], ignore_index=True)</code></pre>
<p><code>ignore_index=True</code> è quasi sempre quello che vuoi: senza, i due DataFrame portano dietro i loro indici originali (spesso duplicati, es. 0,1,2,0,1,2), fonte di bug silenziosi in ogni join o accesso successivo.</p>
`, more: `
<p><code>pd.concat</code> può impilare anche tabelle con colonne PARZIALMENTE diverse: dove una colonna manca in uno dei due DataFrame, il risultato mette <code>NaN</code> per le righe di quel DataFrame — utile ma da controllare sempre con <code>.isna().sum()</code> subito dopo, perché un nome di colonna scritto in modo leggermente diverso tra i due file (es. <code>"Kg"</code> invece di <code>"kg"</code>) produce silenziosamente DUE colonne invece di unirle in una.</p>
<p>Con <code>axis=1</code>, <code>concat</code> impila in ORIZZONTALE invece che in verticale: <code>pd.concat([df1, df2], axis=1)</code> affianca le colonne di due DataFrame allineandole per indice — utile quando hai calcolato più Series o DataFrame separatamente (es. una statistica diversa alla volta) e vuoi ricomporli in un'unica tabella, a patto che condividano lo stesso indice.</p>
<p>La differenza concettuale da ricordare rispetto a <code>merge</code>: <code>concat</code> non guarda il CONTENUTO delle colonne per decidere come allineare le righe (lo fa solo per posizione o indice), mentre <code>merge</code> allinea in base al VALORE di una colonna chiave. Usa <code>concat</code> quando sai già che le righe corrispondono nell'ordine giusto (stesso schema, provenienza diversa), <code>merge</code> quando devi far corrispondere righe in base a un identificatore condiviso.</p>
` },

    {
      type: "exercise", id: "pw-09", kg: 15, title: "Unisci i mesi",
      task: `<p>Hai due DataFrame separati, <code>marzo</code> e <code>aprile</code>, stesse colonne. Fai:</p>
<ul>
<li><code>trimestre</code>: concatenazione dei due con indice ricostruito da zero</li>
<li><code>n_totale</code>: quante righe ha <code>trimestre</code></li>
<li><code>volume_totale</code>: la somma di <code>volume</code> su tutto il trimestre</li>
</ul>`,
      setup: `import pandas as pd
marzo = pd.DataFrame({"atleta": ["a01", "a02"], "volume": [4000, 3600]})
aprile = pd.DataFrame({"atleta": ["a01", "a02", "a03"], "volume": [4200, 3700, 5100]})`,
      starter: `# marzo e aprile sono gia' pronti
trimestre = ...
n_totale = ...
volume_totale = ...

print(trimestre)
print(n_totale, volume_totale)`,
      check: `import pandas as pd
assert 'trimestre' in globals() and len(trimestre) == 5, "trimestre: pd.concat([marzo, aprile], ignore_index=True) — 2 + 3 righe"
assert list(trimestre.index) == [0, 1, 2, 3, 4], "L'indice deve essere ricostruito da zero: ignore_index=True"
assert 'n_totale' in globals() and n_totale == 5, "n_totale: len(trimestre)"
assert 'volume_totale' in globals() and int(volume_totale) == 20600, "volume_totale: trimestre['volume'].sum()"`,
      hint: `<p><code>pd.concat([marzo, aprile], ignore_index=True)</code> — senza <code>ignore_index</code> ti ritroveresti con indici ripetuti (0,1,0,1,2).</p>`,
      solution: `trimestre = pd.concat([marzo, aprile], ignore_index=True)
n_totale = len(trimestre)
volume_totale = trimestre["volume"].sum()

print(trimestre)
print(n_totale, volume_totale)`
    },

    { type: "theory", title: "crosstab e cumsum: conteggi incrociati e progressivi", html: `
<p><code>pd.crosstab</code> è la pivot dedicata ai <strong>conteggi</strong> incrociati tra due categoriche (quante osservazioni per ogni combinazione):</p>
<pre><code>pd.crosstab(df["esercizio"], df["livello"])
# livello     avanzato  intermedio
# esercizio
# squat              2           1</code></pre>
<p><code>.cumsum()</code> invece accumula un totale progressivo lungo una Series — perfetto per un "volume totale sollevato nel tempo":</p>
<pre><code>df["volume_progressivo"] = df["volume"].cumsum()</code></pre>
`, more: `
<p><code>pd.crosstab</code> accetta <code>normalize=True</code> (o <code>"index"</code>/<code>"columns"</code>) per trasformare i conteggi assoluti in proporzioni: <code>pd.crosstab(df["esercizio"], df["livello"], normalize="index")</code> mostra, per ogni esercizio, quale FRAZIONE delle sue osservazioni appartiene a ciascun livello — spesso più leggibile dei conteggi grezzi quando i gruppi hanno dimensioni molto diverse tra loro.</p>
<p><code>.cumsum()</code> ha dei parenti diretti che seguono la stessa logica "progressiva": <code>.cummax()</code> (il massimo visto finora, riga dopo riga — utile per "il record personale aggiornato ad ogni sessione"), <code>.cummin()</code>, e <code>.cumprod()</code> (prodotto cumulativo, usato ad esempio per calcolare un rendimento composto riga dopo riga).</p>
<p>Una precondizione facile da dimenticare: <code>cumsum</code> è significativo solo se le righe sono già nell'ORDINE giusto (temporale, di solito). Se il DataFrame non è ordinato per data prima del cumsum, il "progressivo" che ottieni è un artefatto dell'ordine casuale delle righe, non una vera evoluzione nel tempo — <code>df.sort_values("data")</code> prima del cumsum è quasi sempre un passo necessario, non opzionale.</p>
` },

    {
      type: "exercise", id: "pw-10", kg: 20, title: "Incroci e progressi",
      task: `<p>Sul log <code>log</code> (già caricato, ordinato per data):</p>
<ul>
<li><code>incrocio</code>: <code>pd.crosstab</code> tra <code>esercizio</code> e <code>livello</code> (conteggio delle combinazioni)</li>
<li><code>log["volume_progressivo"]</code>: il totale cumulativo di <code>volume</code> riga dopo riga</li>
<li><code>totale_finale</code>: l'ultimo valore del progressivo (deve coincidere con la somma di tutto <code>volume</code>)</li>
</ul>`,
      setup: `import pandas as pd
log = pd.DataFrame({
    "esercizio": ["squat", "squat", "panca", "squat", "panca"],
    "livello": ["avanzato", "intermedio", "avanzato", "avanzato", "avanzato"],
    "volume": [2400, 2000, 1800, 2500, 1900],
})`,
      starter: `# log e' gia' caricato, ordinato per data
incrocio = ...
log["volume_progressivo"] = ...
totale_finale = ...

print(incrocio)
print(log)
print(totale_finale)`,
      check: `import pandas as pd
assert 'incrocio' in globals() and int(incrocio.loc["squat", "avanzato"]) == 2 and int(incrocio.loc["squat", "intermedio"]) == 1, "incrocio: pd.crosstab(log['esercizio'], log['livello'])"
assert "volume_progressivo" in log.columns and log["volume_progressivo"].tolist() == [2400, 4400, 6200, 8700, 10600], "volume_progressivo: log['volume'].cumsum()"
assert 'totale_finale' in globals() and int(totale_finale) == 10600 and int(totale_finale) == int(log["volume"].sum()), "totale_finale: l'ultimo valore del cumsum, uguale alla somma totale"`,
      hint: `<p><code>pd.crosstab(log["esercizio"], log["livello"])</code> conta automaticamente le combinazioni, senza bisogno di value_counts a mano. Il cumsum si legge riga per riga: ogni valore è la somma di tutti i precedenti più se stesso.</p>`,
      solution: `incrocio = pd.crosstab(log["esercizio"], log["livello"])
log["volume_progressivo"] = log["volume"].cumsum()
totale_finale = log["volume_progressivo"].iloc[-1]

print(incrocio)
print(log)
print(totale_finale)`
    },

    {
      type: "exercise", id: "pw-11", kg: 25, title: "Massimale: dalla materia grezza al report",
      task: `<p>Pipeline completa. Hai <code>allenamenti</code> (kg per atleta ed esercizio) e <code>atleti</code> (anagrafica con livello). Protocollo:</p>
<ul>
<li><code>completo</code>: merge <strong>left</strong> di allenamenti con atleti</li>
<li>Elimina le righe senza livello: tieni solo quelle complete in <code>completo</code> stesso (riassegna, usando <code>dropna(subset=["livello"])</code>)</li>
<li><code>tabella</code>: pivot esercizio × livello con la <strong>media</strong> di kg</li>
<li><code>escursione</code>: la differenza tra il massimo e il minimo della colonna <code>"avanzato"</code> della tabella (un float: l'ampiezza dei carichi tra esercizi per gli avanzati)</li>
</ul>`,
      setup: `import pandas as pd
allenamenti = pd.DataFrame({
    "atleta": ["a01", "a01", "a02", "a02", "a03", "a03", "a04", "a04", "a05", "a05"],
    "esercizio": ["squat", "trazioni", "squat", "trazioni", "squat", "trazioni", "squat", "trazioni", "squat", "trazioni"],
    "kg": [845, 32, 760, 27, 855, 33, 745, 26, 900, 40],
})
atleti = pd.DataFrame({
    "atleta": ["a01", "a02", "a03", "a04"],
    "livello": ["avanzato", "intermedio", "avanzato", "intermedio"],
})`,
      starter: `# allenamenti e atleti sono gia' caricati (a05 manca dall'anagrafica)
completo = ...
completo = ...
tabella = ...
escursione = ...

print(tabella)
print(escursione)`,
      check: `import pandas as pd
assert 'completo' in globals() and len(completo) == 8 and completo["livello"].isna().sum() == 0, "completo: merge left, poi dropna(subset=['livello']) — restano 8 righe (a05 esce)"
assert 'tabella' in globals() and abs(float(tabella.loc["squat", "avanzato"]) - 850.0) < 1e-9 and abs(float(tabella.loc["trazioni", "intermedio"]) - 26.5) < 1e-9, "tabella: pivot_table(values='kg', index='esercizio', columns='livello', aggfunc='mean')"
assert 'escursione' in globals() and abs(float(escursione) - 817.5) < 1e-9, "escursione: tabella['avanzato'].max() - tabella['avanzato'].min() = 850 - 32.5 = 817.5"`,
      hint: `<p>Cella per cella: squat/avanzato = (845+855)/2 = 850, trazioni/avanzato = (32+33)/2 = 32.5, quindi escursione = 817.5. Se la tua tabella include a05, hai dimenticato il dropna.</p>`,
      solution: `completo = pd.merge(allenamenti, atleti, on="atleta", how="left")
completo = completo.dropna(subset=["livello"])
tabella = completo.pivot_table(values="kg", index="esercizio", columns="livello", aggfunc="mean")
escursione = float(tabella["avanzato"].max() - tabella["avanzato"].min())

print(tabella)
print(escursione)`
    },

    {
      type: "exercise", id: "pw-12", kg: 10, title: "Drill: media incasso per prodotto",
      task: `<p>Su <code>ordini</code>: <code>media_prodotto</code> (media <code>importo</code> per <code>prodotto</code>).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "prodotto": ["A","B","A","A","B","B"],
    "regione": ["Nord","Sud","Nord","Sud","Nord","Sud"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `# ordini e' gia' caricato
media_prodotto = ...
print(media_prodotto)`,
      check: `assert abs(media_prodotto["A"] - 50.0) < 1e-9
assert abs(media_prodotto["B"] - 200/3) < 1e-6`,
      hint: `<p><code>ordini.groupby("prodotto")["importo"].mean()</code>.</p>`,
      solution: `media_prodotto = ordini.groupby("prodotto")["importo"].mean()
print(media_prodotto)`
    },

    {
      type: "exercise", id: "pw-13", kg: 15, title: "Drill: scheda vendite per prodotto",
      task: `<p>Su <code>ordini</code> (stesso di prima): <code>scheda</code> con <code>mean</code>, <code>sum</code>, <code>count</code> per prodotto.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "prodotto": ["A","B","A","A","B","B"],
    "regione": ["Nord","Sud","Nord","Sud","Nord","Sud"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `# ordini e' gia' caricato
scheda = ...
print(scheda)`,
      check: `assert scheda.loc["A","sum"] == 150
assert scheda.loc["B","count"] == 3`,
      hint: `<p><code>ordini.groupby("prodotto")["importo"].agg(["mean","sum","count"])</code>.</p>`,
      solution: `scheda = ordini.groupby("prodotto")["importo"].agg(["mean", "sum", "count"])
print(scheda)`
    },

    {
      type: "exercise", id: "pw-14", kg: 15, title: "Drill: aggancia i clienti",
      task: `<p>Fai il merge <strong>inner</strong> di <code>ordini</code> con <code>clienti</code> su <code>cliente</code>, salva in <code>completo</code>, e <code>n</code> (righe risultanti — nota che c3 sparisce).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "prodotto": ["A","B","A","A","B","B"],
    "importo": [50,80,60,40,90,30],
})
clienti = pd.DataFrame({"cliente": ["c1","c2","c4"], "livello": ["gold","silver","gold"]})`,
      starter: `# ordini e clienti sono gia' caricati
completo = ...
n = ...
print(n)`,
      check: `assert n == 5
assert "livello" in completo.columns`,
      hint: `<p><code>pd.merge(ordini, clienti, on="cliente")</code> — c3 non è nell'anagrafica clienti, sparisce con l'inner join.</p>`,
      solution: `completo = pd.merge(ordini, clienti, on="cliente")
n = len(completo)
print(n)`
    },

    {
      type: "exercise", id: "pw-15", kg: 20, title: "Drill: chi manca dall'anagrafica",
      task: `<p>Stesso <code>ordini</code>/<code>clienti</code>. Fai il merge <strong>left</strong>, poi <code>clienti_mancanti</code>: lista dei codici cliente senza <code>livello</code> (NaN), senza doppioni.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "prodotto": ["A","B","A","A","B","B"],
    "importo": [50,80,60,40,90,30],
})
clienti = pd.DataFrame({"cliente": ["c1","c2","c4"], "livello": ["gold","silver","gold"]})`,
      starter: `# ordini e clienti sono gia' caricati
tutti = pd.merge(ordini, clienti, on="cliente", how="left")
clienti_mancanti = ...
print(clienti_mancanti)`,
      check: `assert clienti_mancanti == ["c3"]`,
      hint: `<p><code>list(tutti[tutti["livello"].isna()]["cliente"].unique())</code>.</p>`,
      solution: `tutti = pd.merge(ordini, clienti, on="cliente", how="left")
clienti_mancanti = list(tutti[tutti["livello"].isna()]["cliente"].unique())
print(clienti_mancanti)`
    },

    {
      type: "exercise", id: "pw-16", kg: 15, title: "Drill: incasso medio prodotto × regione",
      task: `<p>Su <code>ordini</code> (con colonna <code>regione</code>): <code>tabella</code>, pivot con prodotto sulle righe, regione sulle colonne, media di importo.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "prodotto": ["A","B","A","A","B","B"],
    "regione": ["Nord","Sud","Nord","Sud","Nord","Sud"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `# ordini e' gia' caricato
tabella = ...
print(tabella)`,
      check: `assert abs(tabella.loc["A","Nord"] - 55.0) < 1e-9
assert abs(tabella.loc["B","Sud"] - 55.0) < 1e-9`,
      hint: `<p><code>ordini.pivot_table(values="importo", index="prodotto", columns="regione", aggfunc="mean")</code>.</p>`,
      solution: `tabella = ordini.pivot_table(values="importo", index="prodotto", columns="regione", aggfunc="mean")
print(tabella)`
    },

    {
      type: "exercise", id: "pw-17", kg: 15, title: "Drill: ordini alto/basso valore",
      task: `<p>Su <code>ordini</code>: <code>ordini["fascia"]</code> con <code>np.where</code>: <code>"alto"</code> se importo &gt;= 60, altrimenti <code>"basso"</code>.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c2","c1","c3","c2","c1"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `import numpy as np
# ordini e' gia' caricato
ordini["fascia"] = ...
print(ordini)`,
      check: `assert ordini["fascia"].tolist() == ["basso","alto","alto","basso","alto","basso"]`,
      hint: `<p><code>np.where(ordini["importo"] &gt;= 60, "alto", "basso")</code>.</p>`,
      solution: `import numpy as np
ordini["fascia"] = np.where(ordini["importo"] >= 60, "alto", "basso")
print(ordini)`
    },

    {
      type: "exercise", id: "pw-18", kg: 15, title: "Drill: nomi dei clienti",
      task: `<p>Su <code>nomi</code> (Series di nomi completi): <code>lunghezze</code> (caratteri) e <code>con_a</code> (maschera, contiene "a", case-insensitive).</p>`,
      starter: `import pandas as pd

nomi = pd.Series(["Mario Rossi", "Ada Bo", "Elena Fi"])

lunghezze = ...
con_a = ...

print(lunghezze.tolist())
print(con_a.tolist())`,
      check: `assert lunghezze.tolist() == [11, 6, 8]
assert con_a.tolist() == [True, True, True]`,
      hint: `<p><code>nomi.str.len()</code>, <code>nomi.str.contains("a", case=False)</code>.</p>`,
      solution: `import pandas as pd

nomi = pd.Series(["Mario Rossi", "Ada Bo", "Elena Fi"])

lunghezze = nomi.str.len()
con_a = nomi.str.contains("a", case=False)

print(lunghezze.tolist())
print(con_a.tolist())`
    },

    {
      type: "exercise", id: "pw-19", kg: 20, title: "Drill: incasso per mese",
      task: `<p>Su <code>date_ord</code> (colonna <code>data</code> testuale): converti in datetime, crea <code>mese</code>, poi <code>per_mese</code> (somma importo per mese).</p>`,
      setup: `import pandas as pd
date_ord = pd.DataFrame({"data": ["2026-01-05", "2026-01-20", "2026-02-02"], "importo": [50, 80, 60]})`,
      starter: `# date_ord e' gia' caricato
date_ord["data"] = ...
date_ord["mese"] = ...
per_mese = ...

print(per_mese)`,
      check: `assert per_mese[1] == 130
assert per_mese[2] == 60`,
      hint: `<p><code>pd.to_datetime(...)</code>, poi <code>.dt.month</code>, poi <code>groupby("mese")["importo"].sum()</code>.</p>`,
      solution: `date_ord["data"] = pd.to_datetime(date_ord["data"])
date_ord["mese"] = date_ord["data"].dt.month
per_mese = date_ord.groupby("mese")["importo"].sum()

print(per_mese)`
    },

    {
      type: "exercise", id: "pw-20", kg: 15, title: "Drill: unisci due mesi",
      task: `<p>Concatena <code>gennaio</code> e <code>febbraio</code> (stesse colonne) in <code>tot</code>, con indice ricostruito. <code>totale_importo</code>: somma di tutto.</p>`,
      setup: `import pandas as pd
gennaio = pd.DataFrame({"cliente": ["c1"], "importo": [100]})
febbraio = pd.DataFrame({"cliente": ["c1", "c2"], "importo": [50, 70]})`,
      starter: `# gennaio e febbraio sono gia' pronti
tot = ...
totale_importo = ...

print(len(tot), totale_importo)`,
      check: `assert len(tot) == 3
assert totale_importo == 220`,
      hint: `<p><code>pd.concat([gennaio, febbraio], ignore_index=True)</code>.</p>`,
      solution: `tot = pd.concat([gennaio, febbraio], ignore_index=True)
totale_importo = tot["importo"].sum()

print(len(tot), totale_importo)`
    },

    {
      type: "exercise", id: "pw-21", kg: 20, title: "Drill: incroci e progressivo",
      task: `<p>Su <code>ordini</code> (con regione): <code>incrocio</code> (crosstab prodotto×regione, conteggi), <code>ordini["cum"]</code> (cumsum di importo).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "prodotto": ["A","B","A","A","B","B"],
    "regione": ["Nord","Sud","Nord","Sud","Nord","Sud"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `# ordini e' gia' caricato
incrocio = ...
ordini["cum"] = ...

print(incrocio)
print(ordini["cum"].tolist())`,
      check: `assert incrocio.loc["A","Nord"] == 2
assert ordini["cum"].tolist() == [50,130,190,230,320,350]`,
      hint: `<p><code>pd.crosstab(ordini["prodotto"], ordini["regione"])</code>, <code>ordini["importo"].cumsum()</code>.</p>`,
      solution: `incrocio = pd.crosstab(ordini["prodotto"], ordini["regione"])
ordini["cum"] = ordini["importo"].cumsum()

print(incrocio)
print(ordini["cum"].tolist())`
    },

    {
      type: "exercise", id: "pw-22", kg: 20, title: "Combo: cliente più fedele",
      task: `<p>Su <code>ordini</code> (colonna cliente): trova <code>n_ordini_cliente</code> (conteggio ordini per cliente, <code>value_counts</code>) e <code>cliente_top</code> (chi ne ha di più).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c1","c3","c2","c1"], "importo": [50,80,60,40,90,30]})`,
      starter: `# ordini e' gia' caricato
n_ordini_cliente = ...
cliente_top = ...

print(n_ordini_cliente)
print(cliente_top)`,
      check: `assert n_ordini_cliente["c1"] == 3
assert cliente_top == "c1"`,
      hint: `<p><code>ordini["cliente"].value_counts()</code>, poi <code>.idxmax()</code>.</p>`,
      solution: `n_ordini_cliente = ordini["cliente"].value_counts()
cliente_top = n_ordini_cliente.idxmax()

print(n_ordini_cliente)
print(cliente_top)`
    },

    {
      type: "exercise", id: "pw-23", kg: 20, title: "Combo: spesa totale per cliente, ordinata",
      task: `<p>Su <code>ordini</code> (stesso di prima): <code>spesa_cliente</code> (somma importo per cliente, groupby), ordinata decrescente.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c1","c3","c2","c1"], "importo": [50,80,60,40,90,30]})`,
      starter: `# ordini e' gia' caricato
spesa_cliente = ...
print(spesa_cliente)`,
      check: `assert spesa_cliente.iloc[0] == 170 and spesa_cliente.index[0] == "c2"`,
      hint: `<p><code>ordini.groupby("cliente")["importo"].sum().sort_values(ascending=False)</code>.</p>`,
      solution: `spesa_cliente = ordini.groupby("cliente")["importo"].sum().sort_values(ascending=False)
print(spesa_cliente)`
    },

    {
      type: "exercise", id: "pw-24", kg: 20, title: "Combo: merge + fascia + conteggio",
      task: `<p>Merge left di <code>ordini</code> e <code>clienti</code>, poi conta quanti ordini sono di clienti <code>"gold"</code> (attenzione ai NaN: usa <code>== "gold"</code>, che è già <code>False</code> su NaN).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c1","c3"], "importo": [50,80,60,40]})
clienti = pd.DataFrame({"cliente": ["c1","c2"], "livello": ["gold","silver"]})`,
      starter: `# ordini e clienti sono gia' caricati
completo = pd.merge(ordini, clienti, on="cliente", how="left")
n_gold = ...

print(completo)
print(n_gold)`,
      check: `assert n_gold == 2`,
      hint: `<p><code>(completo["livello"] == "gold").sum()</code> — per c3 (NaN), il confronto è automaticamente False.</p>`,
      solution: `completo = pd.merge(ordini, clienti, on="cliente", how="left")
n_gold = (completo["livello"] == "gold").sum()

print(completo)
print(n_gold)`
    },

    {
      type: "exercise", id: "pw-25", kg: 20, title: "Combo: pivot e differenza tra regioni",
      task: `<p>Su <code>ordini</code> (con regione): pivot prodotto×regione (media), poi <code>differenza</code>: <code>tabella["Nord"] - tabella["Sud"]</code>.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "prodotto": ["A","B","A","A","B","B"],
    "regione": ["Nord","Sud","Nord","Sud","Nord","Sud"],
    "importo": [50,80,60,40,90,30],
})`,
      starter: `# ordini e' gia' caricato
tabella = ordini.pivot_table(values="importo", index="prodotto", columns="regione", aggfunc="mean")
differenza = ...

print(differenza)`,
      check: `assert abs(differenza["A"] - 15.0) < 1e-9
assert abs(differenza["B"] - 35.0) < 1e-9`,
      hint: `<p><code>tabella["Nord"] - tabella["Sud"]</code>: due Series indicizzate per prodotto, si sottraggono allineandosi da sole.</p>`,
      solution: `tabella = ordini.pivot_table(values="importo", index="prodotto", columns="regione", aggfunc="mean")
differenza = tabella["Nord"] - tabella["Sud"]

print(differenza)`
    },

    {
      type: "exercise", id: "pw-26", kg: 20, title: "Combo: settimane concatenate e classificate",
      task: `<p>Unisci <code>sett1</code> e <code>sett2</code> con <code>concat</code>, poi crea <code>fascia</code> con <code>pd.cut</code>: soglie <code>[0, 50, 100, 1000]</code>, etichette <code>["bassa","media","alta"]</code> sull'importo.</p>`,
      setup: `import pandas as pd
sett1 = pd.DataFrame({"importo": [30, 70]})
sett2 = pd.DataFrame({"importo": [120, 45]})`,
      starter: `# sett1 e sett2 sono gia' pronti
tot = pd.concat([sett1, sett2], ignore_index=True)
tot["fascia"] = ...

print(tot)`,
      check: `assert tot["fascia"].tolist() == ["bassa", "media", "alta", "bassa"]`,
      hint: `<p><code>pd.cut(tot["importo"], bins=[0, 50, 100, 1000], labels=["bassa", "media", "alta"])</code>.</p>`,
      solution: `tot = pd.concat([sett1, sett2], ignore_index=True)
tot["fascia"] = pd.cut(tot["importo"], bins=[0, 50, 100, 1000], labels=["bassa", "media", "alta"])

print(tot)`
    },

    {
      type: "exercise", id: "pw-27", kg: 25, title: "Massimale: report clienti gold",
      task: `<p>Pipeline: merge left <code>ordini</code>/<code>clienti</code>, tieni solo <code>livello == "gold"</code>, poi <code>totale_gold</code>: somma importo di quei soli ordini.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c1","c3","c2"], "importo": [50,80,60,40,90]})
clienti = pd.DataFrame({"cliente": ["c1","c2","c3"], "livello": ["gold","silver","gold"]})`,
      starter: `# ordini e clienti sono gia' caricati
completo = pd.merge(ordini, clienti, on="cliente", how="left")
solo_gold = ...
totale_gold = ...

print(solo_gold)
print(totale_gold)`,
      check: `assert len(solo_gold) == 3
assert totale_gold == 150`,
      hint: `<p><code>completo[completo["livello"] == "gold"]</code>, poi <code>["importo"].sum()</code>.</p>`,
      solution: `completo = pd.merge(ordini, clienti, on="cliente", how="left")
solo_gold = completo[completo["livello"] == "gold"]
totale_gold = solo_gold["importo"].sum()

print(solo_gold)
print(totale_gold)`
    },

    {
      type: "exercise", id: "pw-28", kg: 25, title: "Massimale: mese migliore per prodotto",
      task: `<p>Su <code>vendite</code> (data testuale, prodotto, importo): converti la data, estrai il mese, trova <code>tabella</code> (pivot prodotto×mese, somma), poi <code>mese_top_A</code>: il mese col valore più alto per il prodotto "A" (dalla riga della tabella, <code>.idxmax()</code>).</p>`,
      setup: `import pandas as pd
vendite = pd.DataFrame({
    "data": ["2026-01-10","2026-02-05","2026-01-20","2026-02-15"],
    "prodotto": ["A","A","B","A"],
    "importo": [100, 250, 80, 60],
})`,
      starter: `# vendite e' gia' caricato
vendite["data"] = pd.to_datetime(vendite["data"])
vendite["mese"] = vendite["data"].dt.month

tabella = vendite.pivot_table(values="importo", index="prodotto", columns="mese", aggfunc="sum", fill_value=0)
mese_top_A = ...

print(tabella)
print(mese_top_A)`,
      check: `assert tabella.loc["A", 1] == 100
assert tabella.loc["A", 2] == 310
assert mese_top_A == 2`,
      hint: `<p><code>tabella.loc["A"].idxmax()</code> — su una riga, l'indice sono i mesi.</p>`,
      solution: `vendite["data"] = pd.to_datetime(vendite["data"])
vendite["mese"] = vendite["data"].dt.month

tabella = vendite.pivot_table(values="importo", index="prodotto", columns="mese", aggfunc="sum", fill_value=0)
mese_top_A = tabella.loc["A"].idxmax()

print(tabella)
print(mese_top_A)`
    },

    {
      type: "exercise", id: "pw-29", kg: 25, title: "Massimale: doppio groupby e confronto",
      task: `<p>Su <code>ordini</code> (cliente, prodotto, importo): <code>per_cliente_prodotto</code> (somma per combinazione cliente+prodotto, <code>groupby</code> su lista di due colonne), poi <code>quante_combinazioni</code>: quante righe ha il risultato.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({
    "cliente": ["c1","c1","c2","c1","c2"],
    "prodotto": ["A","B","A","A","A"],
    "importo": [50,30,80,60,20],
})`,
      starter: `# ordini e' gia' caricato
per_cliente_prodotto = ordini.groupby(["cliente", "prodotto"])["importo"].sum()
quante_combinazioni = ...

print(per_cliente_prodotto)
print(quante_combinazioni)`,
      check: `assert per_cliente_prodotto.loc[("c1","A")] == 110
assert quante_combinazioni == 3`,
      hint: `<p>Il risultato di un groupby su due colonne ha un indice a due livelli: <code>len(per_cliente_prodotto)</code> conta le combinazioni effettivamente presenti (c1-A, c1-B, c2-A).</p>`,
      solution: `per_cliente_prodotto = ordini.groupby(["cliente", "prodotto"])["importo"].sum()
quante_combinazioni = len(per_cliente_prodotto)

print(per_cliente_prodotto)
print(quante_combinazioni)`
    },

    {
      type: "exercise", id: "pw-30", kg: 25, title: "Massimale finale: pipeline commerciale",
      task: `<p>Tutto insieme su <code>ordini</code> e <code>clienti</code>:</p>
<ul>
<li><code>completo</code>: merge left</li>
<li><code>completo["fascia"]</code>: <code>np.where(importo >= 60, "alto", "basso")</code></li>
<li><code>report</code>: crosstab tra <code>livello</code> (riempi i NaN prima con <code>"nessuno"</code> via <code>fillna</code>) e <code>fascia</code></li>
</ul>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c1","c3"], "importo": [50,80,60,40]})
clienti = pd.DataFrame({"cliente": ["c1","c2"], "livello": ["gold","silver"]})`,
      starter: `import numpy as np
# ordini e clienti sono gia' caricati
completo = pd.merge(ordini, clienti, on="cliente", how="left")
completo["fascia"] = np.where(completo["importo"] >= 60, "alto", "basso")
completo["livello"] = completo["livello"].fillna("nessuno")
report = pd.crosstab(completo["livello"], completo["fascia"])

print(completo)
print(report)`,
      check: `assert report.loc["gold", "basso"] == 1
assert report.loc["gold", "alto"] == 1
assert report.loc["nessuno", "basso"] == 1`,
      hint: `<p>Riempi prima i NaN di <code>livello</code>, altrimenti il crosstab li ignora silenziosamente invece di mostrare la categoria "nessuno".</p>`,
      solution: `import numpy as np
completo = pd.merge(ordini, clienti, on="cliente", how="left")
completo["fascia"] = np.where(completo["importo"] >= 60, "alto", "basso")
completo["livello"] = completo["livello"].fillna("nessuno")
report = pd.crosstab(completo["livello"], completo["fascia"])

print(completo)
print(report)`
    },

    {
      type: "exercise", id: "pw-31", kg: 10, title: "Drill: prezzo medio per tipo di camera",
      task: `<p>Su <code>prenotazioni</code>: <code>prezzo_medio</code> (media prezzo per tipo camera), <code>camera_top</code> (il tipo con prezzo medio più alto).</p>`,
      setup: `import pandas as pd
prenotazioni = pd.DataFrame({
    "tipo_camera": ["singola","doppia","singola","suite","doppia","singola"],
    "prezzo": [60, 90, 55, 200, 95, 65],
})`,
      starter: `# prenotazioni e' gia' caricato
prezzo_medio = ...
camera_top = ...

print(prezzo_medio)
print(camera_top)`,
      check: `assert abs(prezzo_medio["singola"] - 60.0) < 1e-9
assert camera_top == "suite"`,
      hint: `<p><code>prenotazioni.groupby("tipo_camera")["prezzo"].mean()</code>, poi <code>.idxmax()</code>.</p>`,
      solution: `prezzo_medio = prenotazioni.groupby("tipo_camera")["prezzo"].mean()
camera_top = prezzo_medio.idxmax()

print(prezzo_medio)
print(camera_top)`
    },

    {
      type: "exercise", id: "pw-32", kg: 15, title: "Drill: scheda prestiti per genere",
      task: `<p>Su <code>prestiti</code>: <code>scheda</code> con <code>mean</code>, <code>sum</code>, <code>count</code> dei giorni di prestito per genere.</p>`,
      setup: `import pandas as pd
prestiti = pd.DataFrame({
    "genere": ["Giallo","Fantasy","Giallo","Storico","Giallo"],
    "giorni": [7, 10, 5, 14, 6],
})`,
      starter: `# prestiti e' gia' caricato
scheda = ...
print(scheda)`,
      check: `assert scheda.loc["Giallo","sum"] == 18
assert scheda.loc["Giallo","count"] == 3`,
      hint: `<p><code>prestiti.groupby("genere")["giorni"].agg(["mean","sum","count"])</code>.</p>`,
      solution: `scheda = prestiti.groupby("genere")["giorni"].agg(["mean", "sum", "count"])
print(scheda)`
    },

    {
      type: "exercise", id: "pw-33", kg: 15, title: "Drill: aggancia le categorie di magazzino",
      task: `<p>Merge <strong>inner</strong> di <code>prodotti</code> con <code>categorie</code> su <code>sku</code>, poi <code>n_righe</code> e <code>qty_medio_elettronica</code> (media qty delle righe "elettronica").</p>`,
      setup: `import pandas as pd
prodotti = pd.DataFrame({
    "sku": ["s1","s2","s1","s3","s2","s4"],
    "qty": [10, 5, 8, 3, 7, 2],
})
categorie = pd.DataFrame({"sku": ["s1","s2","s3"], "categoria": ["elettronica","casa","elettronica"]})`,
      starter: `# prodotti e categorie sono gia' caricati
completo = ...
n_righe = ...
qty_medio_elettronica = ...

print(n_righe)
print(qty_medio_elettronica)`,
      check: `assert n_righe == 5
assert abs(qty_medio_elettronica - 7.0) < 1e-9`,
      hint: `<p>s4 non è in <code>categorie</code>: l'inner join lo scarta. Elettronica: s1(10), s1(8), s3(3) → media 7.0.</p>`,
      solution: `completo = pd.merge(prodotti, categorie, on="sku")
n_righe = len(completo)
qty_medio_elettronica = completo.loc[completo["categoria"] == "elettronica", "qty"].mean()

print(n_righe)
print(qty_medio_elettronica)`
    },

    {
      type: "exercise", id: "pw-34", kg: 20, title: "Drill: i rider senza zona",
      task: `<p>Merge <strong>left</strong> di <code>consegne</code> con <code>riders</code> su <code>rider</code>, poi <code>senza_zona</code> (righe con zona NaN) e <code>rider_mancanti</code> (lista senza doppioni).</p>`,
      setup: `import pandas as pd
consegne = pd.DataFrame({
    "rider": ["r1","r2","r1","r3","r2","r4"],
    "pacchi": [5, 8, 3, 6, 4, 2],
})
riders = pd.DataFrame({"rider": ["r1","r2","r3"], "zona": ["nord","sud","nord"]})`,
      starter: `# consegne e riders sono gia' caricati
tutti = pd.merge(consegne, riders, on="rider", how="left")
senza_zona = ...
rider_mancanti = ...

print(senza_zona)
print(rider_mancanti)`,
      check: `assert len(senza_zona) == 1
assert rider_mancanti == ["r4"]`,
      hint: `<p><code>tutti[tutti["zona"].isna()]</code>, poi <code>list(...["rider"].unique())</code>.</p>`,
      solution: `tutti = pd.merge(consegne, riders, on="rider", how="left")
senza_zona = tutti[tutti["zona"].isna()]
rider_mancanti = list(senza_zona["rider"].unique())

print(senza_zona)
print(rider_mancanti)`
    },

    {
      type: "exercise", id: "pw-35", kg: 15, title: "Drill: voti medi materia × classe",
      task: `<p>Su <code>voti</code>: <code>tabella</code> (pivot materia sulle righe, classe sulle colonne, media voto), <code>differenza</code> (<code>tabella["A"] - tabella["B"]</code>).</p>`,
      setup: `import pandas as pd
voti = pd.DataFrame({
    "materia": ["mat","mat","ita","mat","ita","ita"],
    "classe": ["A","B","A","A","B","A"],
    "voto": [7, 6, 8, 9, 7, 6],
})`,
      starter: `# voti e' gia' caricato
tabella = ...
differenza = ...

print(tabella)
print(differenza)`,
      check: `assert abs(tabella.loc["mat","A"] - 8.0) < 1e-9
assert abs(tabella.loc["ita","B"] - 7.0) < 1e-9
assert abs(differenza["mat"] - 2.0) < 1e-9`,
      hint: `<p><code>voti.pivot_table(values="voto", index="materia", columns="classe", aggfunc="mean")</code>.</p>`,
      solution: `tabella = voti.pivot_table(values="voto", index="materia", columns="classe", aggfunc="mean")
differenza = tabella["A"] - tabella["B"]

print(tabella)
print(differenza)`
    },

    {
      type: "exercise", id: "pw-36", kg: 15, title: "Drill: ticket urgenti",
      task: `<p>Su <code>tk</code>: <code>tk["urgente"]</code> con <code>np.where</code>: <code>"si"</code> se <code>attesa_min &gt; 30</code>, altrimenti <code>"no"</code>. Poi <code>n_urgenti</code>.</p>`,
      setup: `import pandas as pd
tk = pd.DataFrame({"id": ["t1","t2","t3","t4"], "attesa_min": [5, 45, 10, 60]})`,
      starter: `import numpy as np
# tk e' gia' caricato
tk["urgente"] = ...
n_urgenti = ...

print(tk)
print(n_urgenti)`,
      check: `assert tk["urgente"].tolist() == ["no","si","no","si"]
assert n_urgenti == 2`,
      hint: `<p><code>np.where(tk["attesa_min"] &gt; 30, "si", "no")</code>, poi <code>(tk["urgente"] == "si").sum()</code>.</p>`,
      solution: `import numpy as np
tk["urgente"] = np.where(tk["attesa_min"] > 30, "si", "no")
n_urgenti = int((tk["urgente"] == "si").sum())

print(tk)
print(n_urgenti)`
    },

    {
      type: "exercise", id: "pw-37", kg: 15, title: "Drill: il catalogo dell'arredamento",
      task: `<p>Su <code>prod</code>: <code>lunghezza</code> (caratteri del nome), <code>doppie</code> (nomi con doppia "ff" o "ll"), <code>inizia_con_s</code> (quanti iniziano per "S").</p>`,
      setup: `import pandas as pd
prod = pd.DataFrame({"nome": ["Sedia","Tavolo","Sgabello","Lampada","Scaffale"]})`,
      starter: `# prod e' gia' caricato
prod["lunghezza"] = ...
doppie = ...
inizia_con_s = ...

print(prod)
print(doppie["nome"].tolist())
print(inizia_con_s)`,
      check: `assert prod["lunghezza"].tolist() == [5, 6, 8, 7, 8]
assert sorted(doppie["nome"]) == ["Scaffale", "Sgabello"]
assert inizia_con_s == 3`,
      hint: `<p><code>prod["nome"].str.contains("ff|ll")</code>, <code>prod["nome"].str.startswith("S").sum()</code>.</p>`,
      solution: `prod["lunghezza"] = prod["nome"].str.len()
doppie = prod[prod["nome"].str.contains("ff|ll")]
inizia_con_s = int(prod["nome"].str.startswith("S").sum())

print(prod)
print(doppie["nome"].tolist())
print(inizia_con_s)`
    },

    {
      type: "exercise", id: "pw-38", kg: 20, title: "Drill: incasso abbonamenti per mese",
      task: `<p>Su <code>abbonamenti</code> (data testuale): converti, crea <code>mese</code>, poi <code>per_mese</code> (somma prezzo per mese) e <code>mese_top</code>.</p>`,
      setup: `import pandas as pd
abbonamenti = pd.DataFrame({
    "data": ["2026-01-15","2026-01-28","2026-02-03","2026-03-10"],
    "prezzo": [20, 20, 25, 20],
})`,
      starter: `# abbonamenti e' gia' caricato
abbonamenti["data"] = ...
abbonamenti["mese"] = ...
per_mese = ...
mese_top = ...

print(per_mese)
print(mese_top)`,
      check: `assert per_mese[1] == 40
assert mese_top == 1`,
      hint: `<p><code>pd.to_datetime(...)</code>, <code>.dt.month</code>, <code>groupby("mese")["prezzo"].sum()</code>, <code>.idxmax()</code>.</p>`,
      solution: `abbonamenti["data"] = pd.to_datetime(abbonamenti["data"])
abbonamenti["mese"] = abbonamenti["data"].dt.month
per_mese = abbonamenti.groupby("mese")["prezzo"].sum()
mese_top = per_mese.idxmax()

print(per_mese)
print(mese_top)`
    },

    {
      type: "exercise", id: "pw-39", kg: 15, title: "Drill: due settimane di log",
      task: `<p>Concatena <code>sett1</code> e <code>sett2</code> (stesse colonne) in <code>tot</code>, con indice ricostruito. <code>totale_minuti</code>: somma di tutti i minuti.</p>`,
      setup: `import pandas as pd
sett1 = pd.DataFrame({"utente": ["u1","u2"], "minuti": [30, 45]})
sett2 = pd.DataFrame({"utente": ["u1","u3"], "minuti": [40, 20]})`,
      starter: `# sett1 e sett2 sono gia' pronti
tot = ...
totale_minuti = ...

print(len(tot), totale_minuti)`,
      check: `assert len(tot) == 4
assert totale_minuti == 135`,
      hint: `<p><code>pd.concat([sett1, sett2], ignore_index=True)</code>.</p>`,
      solution: `tot = pd.concat([sett1, sett2], ignore_index=True)
totale_minuti = tot["minuti"].sum()

print(len(tot), totale_minuti)`
    },

    {
      type: "exercise", id: "pw-40", kg: 20, title: "Drill: presenze in palestra, incrocio e progressivo",
      task: `<p>Su <code>pres</code>: <code>incrocio</code> (crosstab corso×giorno, conteggi), <code>pres["cum"]</code> (cumsum di presenze).</p>`,
      setup: `import pandas as pd
pres = pd.DataFrame({
    "corso": ["yoga","yoga","pilates","yoga","pilates"],
    "giorno": ["lun","mar","lun","mer","mar"],
    "presenze": [15, 18, 10, 20, 12],
})`,
      starter: `# pres e' gia' caricato
incrocio = ...
pres["cum"] = ...

print(incrocio)
print(pres["cum"].tolist())`,
      check: `assert incrocio.loc["yoga","lun"] == 1
assert pres["cum"].tolist() == [15, 33, 43, 63, 75]`,
      hint: `<p><code>pd.crosstab(pres["corso"], pres["giorno"])</code>, <code>pres["presenze"].cumsum()</code>.</p>`,
      solution: `incrocio = pd.crosstab(pres["corso"], pres["giorno"])
pres["cum"] = pres["presenze"].cumsum()

print(incrocio)
print(pres["cum"].tolist())`
    },

    {
      type: "exercise", id: "pw-41", kg: 25, title: "Massimale: pipeline soci e corsi",
      task: `<p>Pipeline completa su <code>iscrizioni</code> e <code>soci</code>:</p>
<ul>
<li><code>completo</code>: merge <strong>left</strong>, poi tieni solo le righe con <code>livello</code> non NaN (riassegna con <code>dropna(subset=["livello"])</code>)</li>
<li><code>tabella</code>: pivot corso × livello, media di <code>mesi</code></li>
<li><code>escursione</code>: <code>tabella["gold"].max() - tabella["gold"].min()</code></li>
</ul>`,
      setup: `import pandas as pd
iscrizioni = pd.DataFrame({
    "membro": ["m1","m1","m2","m2","m3","m3","m4","m4"],
    "corso": ["yoga","pilates","yoga","pilates","yoga","pilates","yoga","pilates"],
    "mesi": [12, 10, 6, 5, 18, 22, 3, 2],
})
soci = pd.DataFrame({"membro": ["m1","m2","m3"], "livello": ["gold","silver","gold"]})`,
      starter: `# iscrizioni e soci sono gia' caricati (m4 manca dall'anagrafica)
completo = ...
completo = ...
tabella = ...
escursione = ...

print(tabella)
print(escursione)`,
      check: `import pandas as pd
assert 'completo' in globals() and len(completo) == 6 and completo["livello"].isna().sum() == 0, "completo: merge left poi dropna(subset=['livello']) — m4 esce, restano 6 righe"
assert 'tabella' in globals() and abs(float(tabella.loc["yoga","gold"]) - 15.0) < 1e-9 and abs(float(tabella.loc["pilates","gold"]) - 16.0) < 1e-9, "tabella: pivot_table(values='mesi', index='corso', columns='livello', aggfunc='mean')"
assert 'escursione' in globals() and abs(float(escursione) - 1.0) < 1e-9, "escursione: 16.0 - 15.0 = 1.0"`,
      hint: `<p>gold/yoga = (12+18)/2 = 15.0, gold/pilates = (10+22)/2 = 16.0 → escursione = 1.0.</p>`,
      solution: `completo = pd.merge(iscrizioni, soci, on="membro", how="left")
completo = completo.dropna(subset=["livello"])
tabella = completo.pivot_table(values="mesi", index="corso", columns="livello", aggfunc="mean")
escursione = float(tabella["gold"].max() - tabella["gold"].min())

print(tabella)
print(escursione)`
    },

    {
      type: "exercise", id: "pw-42", kg: 10, title: "Drill: prezzo medio per categoria",
      task: `<p>Su <code>mag</code>: <code>media_categoria</code> (media prezzo per categoria).</p>`,
      setup: `import pandas as pd
mag = pd.DataFrame({"categoria": ["elettronica","casa","elettronica","casa"], "prezzo": [100, 50, 120, 60]})`,
      starter: `# mag e' gia' caricato
media_categoria = ...
print(media_categoria)`,
      check: `assert abs(media_categoria["elettronica"] - 110.0) < 1e-9
assert abs(media_categoria["casa"] - 55.0) < 1e-9`,
      hint: `<p><code>mag.groupby("categoria")["prezzo"].mean()</code>.</p>`,
      solution: `media_categoria = mag.groupby("categoria")["prezzo"].mean()
print(media_categoria)`
    },

    {
      type: "exercise", id: "pw-43", kg: 15, title: "Drill: scheda prezzi per categoria",
      task: `<p>Su <code>mag</code> (stesso di prima): <code>scheda</code> con <code>mean</code>, <code>sum</code>, <code>count</code> per categoria.</p>`,
      setup: `import pandas as pd
mag = pd.DataFrame({"categoria": ["elettronica","casa","elettronica","casa"], "prezzo": [100, 50, 120, 60]})`,
      starter: `# mag e' gia' caricato
scheda = ...
print(scheda)`,
      check: `assert scheda.loc["elettronica","sum"] == 220
assert scheda.loc["casa","count"] == 2`,
      hint: `<p><code>mag.groupby("categoria")["prezzo"].agg(["mean","sum","count"])</code>.</p>`,
      solution: `scheda = mag.groupby("categoria")["prezzo"].agg(["mean", "sum", "count"])
print(scheda)`
    },

    {
      type: "exercise", id: "pw-44", kg: 15, title: "Drill: aggancia le città dei clienti",
      task: `<p>Merge <strong>inner</strong> di <code>ordini</code> con <code>clienti</code> su <code>cliente</code>, poi <code>n</code>.</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c3"], "importo": [100, 200, 150]})
clienti = pd.DataFrame({"cliente": ["c1","c2"], "citta": ["Roma","Milano"]})`,
      starter: `# ordini e clienti sono gia' caricati
completo = ...
n = ...
print(n)`,
      check: `assert n == 2`,
      hint: `<p><code>pd.merge(ordini, clienti, on="cliente")</code> — c3 non è nell'anagrafica, sparisce.</p>`,
      solution: `completo = pd.merge(ordini, clienti, on="cliente")
n = len(completo)
print(n)`
    },

    {
      type: "exercise", id: "pw-45", kg: 20, title: "Drill: clienti senza città",
      task: `<p>Stesso <code>ordini</code>/<code>clienti</code>. Merge <strong>left</strong>, poi <code>clienti_mancanti</code> (lista senza doppioni).</p>`,
      setup: `import pandas as pd
ordini = pd.DataFrame({"cliente": ["c1","c2","c3"], "importo": [100, 200, 150]})
clienti = pd.DataFrame({"cliente": ["c1","c2"], "citta": ["Roma","Milano"]})`,
      starter: `# ordini e clienti sono gia' caricati
tutti = pd.merge(ordini, clienti, on="cliente", how="left")
clienti_mancanti = ...
print(clienti_mancanti)`,
      check: `assert clienti_mancanti == ["c3"]`,
      hint: `<p><code>list(tutti[tutti["citta"].isna()]["cliente"].unique())</code>.</p>`,
      solution: `tutti = pd.merge(ordini, clienti, on="cliente", how="left")
clienti_mancanti = list(tutti[tutti["citta"].isna()]["cliente"].unique())
print(clienti_mancanti)`
    },

    {
      type: "exercise", id: "pw-46", kg: 15, title: "Drill: incasso ristorante piatto × giorno",
      task: `<p>Su <code>ordini2</code>: <code>tabella</code> (pivot piatto sulle righe, giorno sulle colonne, somma incasso).</p>`,
      setup: `import pandas as pd
ordini2 = pd.DataFrame({
    "piatto": ["pasta","pizza","pasta","pizza"],
    "giorno": ["lun","lun","mar","mar"],
    "incasso": [100, 150, 120, 140],
})`,
      starter: `# ordini2 e' gia' caricato
tabella = ...
print(tabella)`,
      check: `assert tabella.loc["pasta","lun"] == 100
assert tabella.loc["pizza","mar"] == 140`,
      hint: `<p><code>ordini2.pivot_table(values="incasso", index="piatto", columns="giorno", aggfunc="sum")</code>.</p>`,
      solution: `tabella = ordini2.pivot_table(values="incasso", index="piatto", columns="giorno", aggfunc="sum")
print(tabella)`
    },

    {
      type: "exercise", id: "pw-47", kg: 15, title: "Drill: ticket urgenti v2",
      task: `<p>Su <code>tk2</code>: <code>tk2["urgente"]</code> con <code>np.where</code>: <code>"si"</code> se <code>attesa &gt; 30</code>, altrimenti <code>"no"</code>.</p>`,
      setup: `import pandas as pd
tk2 = pd.DataFrame({"id": ["a","b","c"], "attesa": [20, 50, 15]})`,
      starter: `import numpy as np
# tk2 e' gia' caricato
tk2["urgente"] = ...
print(tk2)`,
      check: `assert tk2["urgente"].tolist() == ["no","si","no"]`,
      hint: `<p><code>np.where(tk2["attesa"] &gt; 30, "si", "no")</code>.</p>`,
      solution: `import numpy as np
tk2["urgente"] = np.where(tk2["attesa"] > 30, "si", "no")
print(tk2)`
    },

    {
      type: "exercise", id: "pw-48", kg: 15, title: "Drill: nomi dei mobili in maiuscolo",
      task: `<p>Su <code>prod2</code> (Series): <code>maiuscole</code> e <code>lunghezze</code>.</p>`,
      starter: `import pandas as pd

prod2 = pd.Series(["divano", "poltrona", "cuscino"])

maiuscole = ...
lunghezze = ...

print(maiuscole.tolist())
print(lunghezze.tolist())`,
      check: `assert maiuscole.tolist() == ["DIVANO", "POLTRONA", "CUSCINO"]
assert lunghezze.tolist() == [6, 8, 7]`,
      hint: `<p><code>prod2.str.upper()</code>, <code>prod2.str.len()</code>.</p>`,
      solution: `import pandas as pd

prod2 = pd.Series(["divano", "poltrona", "cuscino"])

maiuscole = prod2.str.upper()
lunghezze = prod2.str.len()

print(maiuscole.tolist())
print(lunghezze.tolist())`
    },

    {
      type: "exercise", id: "pw-49", kg: 20, title: "Drill: incasso mensile vendite",
      task: `<p>Su <code>vend</code> (data testuale): converti, crea <code>mese</code>, poi <code>per_mese</code> (somma importo per mese).</p>`,
      setup: `import pandas as pd
vend = pd.DataFrame({"data": ["2026-05-01","2026-05-20","2026-06-02"], "importo": [100, 150, 200]})`,
      starter: `# vend e' gia' caricato
vend["data"] = ...
vend["mese"] = ...
per_mese = ...

print(per_mese)`,
      check: `assert per_mese[5] == 250
assert per_mese[6] == 200`,
      hint: `<p><code>pd.to_datetime(...)</code>, <code>.dt.month</code>, <code>groupby("mese")["importo"].sum()</code>.</p>`,
      solution: `vend["data"] = pd.to_datetime(vend["data"])
vend["mese"] = vend["data"].dt.month
per_mese = vend.groupby("mese")["importo"].sum()

print(per_mese)`
    },

    {
      type: "exercise", id: "pw-50", kg: 15, title: "Drill: unisci i trimestri",
      task: `<p>Concatena <code>q1</code> e <code>q2</code> in <code>tot</code> con indice ricostruito. <code>totale</code>: somma di tutto.</p>`,
      setup: `import pandas as pd
q1 = pd.DataFrame({"valore": [10, 20]})
q2 = pd.DataFrame({"valore": [30]})`,
      starter: `# q1 e q2 sono gia' pronti
tot = ...
totale = ...

print(len(tot), totale)`,
      check: `assert len(tot) == 3
assert totale == 60`,
      hint: `<p><code>pd.concat([q1, q2], ignore_index=True)</code>.</p>`,
      solution: `tot = pd.concat([q1, q2], ignore_index=True)
totale = tot["valore"].sum()

print(len(tot), totale)`
    },

    {
      type: "exercise", id: "pw-51", kg: 20, title: "Combo: incrocio regione × fascia",
      task: `<p>Su <code>ord3</code>: crea <code>fascia</code> con <code>np.where</code> (<code>"alto"</code> se importo &gt;= 60), poi <code>report</code> (crosstab regione × fascia).</p>`,
      setup: `import pandas as pd
ord3 = pd.DataFrame({"regione": ["nord","sud","nord","sud"], "importo": [80, 40, 120, 30]})`,
      starter: `import numpy as np
# ord3 e' gia' caricato
ord3["fascia"] = ...
report = ...

print(report)`,
      check: `assert report.loc["nord","alto"] == 2
assert report.loc["sud","basso"] == 2`,
      hint: `<p><code>np.where(ord3["importo"] &gt;= 60, "alto", "basso")</code>, poi <code>pd.crosstab(ord3["regione"], ord3["fascia"])</code>.</p>`,
      solution: `import numpy as np
ord3["fascia"] = np.where(ord3["importo"] >= 60, "alto", "basso")
report = pd.crosstab(ord3["regione"], ord3["fascia"])

print(report)`
    },

    {
      type: "exercise", id: "pw-52", kg: 20, title: "Combo: cliente con la spesa più alta",
      task: `<p>Su <code>spesa</code>: <code>spesa_cliente</code> (somma importo per cliente, ordinata decrescente).</p>`,
      setup: `import pandas as pd
spesa = pd.DataFrame({"cliente": ["c1","c2","c1","c3"], "importo": [50, 80, 70, 40]})`,
      starter: `# spesa e' gia' caricato
spesa_cliente = ...
print(spesa_cliente)`,
      check: `assert spesa_cliente.iloc[0] == 120
assert spesa_cliente.index[0] == "c1"`,
      hint: `<p><code>spesa.groupby("cliente")["importo"].sum().sort_values(ascending=False)</code>.</p>`,
      solution: `spesa_cliente = spesa.groupby("cliente")["importo"].sum().sort_values(ascending=False)
print(spesa_cliente)`
    },

    {
      type: "exercise", id: "pw-53", kg: 20, title: "Combo: incasso per città dopo il merge",
      task: `<p>Merge <code>ordini3</code> con <code>clienti3</code> su <code>cliente</code>, poi <code>per_citta</code> (somma importo per città).</p>`,
      setup: `import pandas as pd
ordini3 = pd.DataFrame({"cliente": ["c1","c2","c1"], "prodotto": ["A","B","A"], "importo": [50, 80, 70]})
clienti3 = pd.DataFrame({"cliente": ["c1","c2"], "citta": ["Roma","Milano"]})`,
      starter: `# ordini3 e clienti3 sono gia' caricati
completo = pd.merge(ordini3, clienti3, on="cliente")
per_citta = ...

print(per_citta)`,
      check: `assert per_citta["Roma"] == 120
assert per_citta["Milano"] == 80`,
      hint: `<p><code>completo.groupby("citta")["importo"].sum()</code>.</p>`,
      solution: `completo = pd.merge(ordini3, clienti3, on="cliente")
per_citta = completo.groupby("citta")["importo"].sum()

print(per_citta)`
    },

    {
      type: "exercise", id: "pw-54", kg: 20, title: "Combo: differenza di voto tra sessi",
      task: `<p>Su <code>voti2</code>: <code>tabella</code> (pivot materia × sesso, media voto), <code>differenza</code> (<code>tabella["F"] - tabella["M"]</code>).</p>`,
      setup: `import pandas as pd
voti2 = pd.DataFrame({
    "materia": ["mat","mat","ita","ita"],
    "sesso": ["M","F","M","F"],
    "voto": [7, 8, 6, 9],
})`,
      starter: `# voti2 e' gia' caricato
tabella = voti2.pivot_table(values="voto", index="materia", columns="sesso", aggfunc="mean")
differenza = ...

print(differenza)`,
      check: `assert abs(differenza["mat"] - 1.0) < 1e-9
assert abs(differenza["ita"] - 3.0) < 1e-9`,
      hint: `<p><code>tabella["F"] - tabella["M"]</code>.</p>`,
      solution: `tabella = voti2.pivot_table(values="voto", index="materia", columns="sesso", aggfunc="mean")
differenza = tabella["F"] - tabella["M"]

print(differenza)`
    },

    {
      type: "exercise", id: "pw-55", kg: 20, title: "Combo: due mesi concatenati e classificati",
      task: `<p>Concatena <code>gen</code> e <code>feb</code> in <code>tot</code>, poi <code>fascia</code> con <code>pd.cut</code>: soglie <code>[0, 30, 70, 1000]</code>, etichette <code>["bassa","media","alta"]</code>.</p>`,
      setup: `import pandas as pd
gen = pd.DataFrame({"importo": [20, 60]})
feb = pd.DataFrame({"importo": [90, 10]})`,
      starter: `# gen e feb sono gia' pronti
tot = pd.concat([gen, feb], ignore_index=True)
tot["fascia"] = ...

print(tot)`,
      check: `assert tot["fascia"].tolist() == ["bassa","media","alta","bassa"]`,
      hint: `<p><code>pd.cut(tot["importo"], bins=[0, 30, 70, 1000], labels=["bassa","media","alta"])</code>.</p>`,
      solution: `tot = pd.concat([gen, feb], ignore_index=True)
tot["fascia"] = pd.cut(tot["importo"], bins=[0, 30, 70, 1000], labels=["bassa", "media", "alta"])

print(tot)`
    },

    {
      type: "exercise", id: "pw-56", kg: 25, title: "Massimale: giorni di prestito dei soci premium",
      task: `<p>Merge <strong>left</strong> di <code>prestiti2</code> con <code>soci2</code>, poi <code>solo_premium</code> (righe con <code>tipo == "premium"</code>) e <code>totale_premium</code> (somma dei loro giorni).</p>`,
      setup: `import pandas as pd
prestiti2 = pd.DataFrame({"socio": ["s1","s2","s1","s3","s2"], "giorni": [7, 10, 5, 14, 6]})
soci2 = pd.DataFrame({"socio": ["s1","s2","s3"], "tipo": ["premium","standard","premium"]})`,
      starter: `# prestiti2 e soci2 sono gia' caricati
completo = pd.merge(prestiti2, soci2, on="socio", how="left")
solo_premium = ...
totale_premium = ...

print(solo_premium)
print(totale_premium)`,
      check: `assert len(solo_premium) == 3
assert totale_premium == 26`,
      hint: `<p><code>completo[completo["tipo"] == "premium"]</code>, poi <code>["giorni"].sum()</code>.</p>`,
      solution: `completo = pd.merge(prestiti2, soci2, on="socio", how="left")
solo_premium = completo[completo["tipo"] == "premium"]
totale_premium = solo_premium["giorni"].sum()

print(solo_premium)
print(totale_premium)`
    },

    {
      type: "exercise", id: "pw-57", kg: 25, title: "Massimale: mese migliore per piano di abbonamento",
      task: `<p>Su <code>abb2</code>: converti la data, estrai il mese, calcola <code>tabella</code> (pivot piano × mese, somma importo, <code>fill_value=0</code>), poi <code>mese_top_pro</code>: il mese col valore più alto per il piano "pro".</p>`,
      setup: `import pandas as pd
abb2 = pd.DataFrame({
    "data": ["2026-01-05","2026-02-10","2026-01-20","2026-02-25"],
    "piano": ["pro","pro","base","pro"],
    "importo": [20, 20, 10, 20],
})`,
      starter: `# abb2 e' gia' caricato
abb2["data"] = pd.to_datetime(abb2["data"])
abb2["mese"] = abb2["data"].dt.month

tabella = abb2.pivot_table(values="importo", index="piano", columns="mese", aggfunc="sum", fill_value=0)
mese_top_pro = ...

print(tabella)
print(mese_top_pro)`,
      check: `assert tabella.loc["pro", 1] == 20
assert tabella.loc["pro", 2] == 40
assert mese_top_pro == 2`,
      hint: `<p><code>tabella.loc["pro"].idxmax()</code>.</p>`,
      solution: `abb2["data"] = pd.to_datetime(abb2["data"])
abb2["mese"] = abb2["data"].dt.month

tabella = abb2.pivot_table(values="importo", index="piano", columns="mese", aggfunc="sum", fill_value=0)
mese_top_pro = tabella.loc["pro"].idxmax()

print(tabella)
print(mese_top_pro)`
    },

    {
      type: "exercise", id: "pw-58", kg: 25, title: "Massimale: combinazioni rappresentante × prodotto",
      task: `<p>Su <code>vend2</code>: <code>per_rp</code> (somma importo per combinazione rappresentante+prodotto, groupby su due colonne), <code>quante_combinazioni</code>.</p>`,
      setup: `import pandas as pd
vend2 = pd.DataFrame({
    "rappresentante": ["r1","r1","r2","r1","r2"],
    "prodotto": ["A","B","A","A","A"],
    "importo": [50, 30, 80, 60, 20],
})`,
      starter: `# vend2 e' gia' caricato
per_rp = vend2.groupby(["rappresentante", "prodotto"])["importo"].sum()
quante_combinazioni = ...

print(per_rp)
print(quante_combinazioni)`,
      check: `assert per_rp.loc[("r1","A")] == 110
assert quante_combinazioni == 3`,
      hint: `<p><code>len(per_rp)</code> conta le combinazioni effettivamente presenti (r1-A, r1-B, r2-A).</p>`,
      solution: `per_rp = vend2.groupby(["rappresentante", "prodotto"])["importo"].sum()
quante_combinazioni = len(per_rp)

print(per_rp)
print(quante_combinazioni)`
    },

    {
      type: "exercise", id: "pw-59", kg: 25, title: "Massimale: affidabilità dei corrieri",
      task: `<p>Pipeline: merge <strong>left</strong> di <code>sped</code> con <code>corrieri</code>, crea <code>fascia</code> (<code>"alto"</code> se costo &gt;= 60), riempi <code>affidabile</code> mancante con <code>"sconosciuto"</code>, poi <code>report</code> (crosstab affidabile × fascia).</p>`,
      setup: `import pandas as pd
sped = pd.DataFrame({"corriere": ["c1","c2","c1","c3"], "costo": [50, 80, 60, 40]})
corrieri = pd.DataFrame({"corriere": ["c1","c2"], "affidabile": ["si","no"]})`,
      starter: `import numpy as np
# sped e corrieri sono gia' caricati
completo = pd.merge(sped, corrieri, on="corriere", how="left")
completo["fascia"] = ...
completo["affidabile"] = ...
report = ...

print(completo)
print(report)`,
      check: `assert report.loc["si","basso"] == 1
assert report.loc["si","alto"] == 1
assert report.loc["sconosciuto","basso"] == 1`,
      hint: `<p><code>np.where(completo["costo"] &gt;= 60, "alto", "basso")</code>, <code>completo["affidabile"].fillna("sconosciuto")</code>, <code>pd.crosstab(completo["affidabile"], completo["fascia"])</code>.</p>`,
      solution: `import numpy as np
completo = pd.merge(sped, corrieri, on="corriere", how="left")
completo["fascia"] = np.where(completo["costo"] >= 60, "alto", "basso")
completo["affidabile"] = completo["affidabile"].fillna("sconosciuto")
report = pd.crosstab(completo["affidabile"], completo["fascia"])

print(completo)
print(report)`
    },

    {
      type: "exercise", id: "pw-60", kg: 25, title: "Massimale finale: scheda venditori con agg a dizionario",
      task: `<p>Su <code>vendite3</code>: <code>scheda</code> con <code>.agg({"importo": "sum", "quantita": "sum"})</code> per venditore, poi <code>venditore_top</code> (chi ha l'importo totale più alto).</p>`,
      setup: `import pandas as pd
vendite3 = pd.DataFrame({
    "venditore": ["v1","v1","v2","v2","v3"],
    "prodotto": ["A","B","A","B","A"],
    "quantita": [10, 5, 8, 12, 6],
    "importo": [100, 50, 80, 120, 60],
})`,
      starter: `# vendite3 e' gia' caricato
scheda = ...
venditore_top = ...

print(scheda)
print(venditore_top)`,
      check: `assert scheda.loc["v1","importo"] == 150
assert venditore_top == "v2"`,
      hint: `<p><code>vendite3.groupby("venditore").agg({"importo": "sum", "quantita": "sum"})</code>, poi <code>scheda["importo"].idxmax()</code>.</p>`,
      solution: `scheda = vendite3.groupby("venditore").agg({"importo": "sum", "quantita": "sum"})
venditore_top = scheda["importo"].idxmax()

print(scheda)
print(venditore_top)`
    }
  ]
});
