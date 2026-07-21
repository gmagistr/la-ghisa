window.MODULES.push({
  id: "feature-engineering",
  name: "Feature Engineering",
  tagline: "La sala attrezzaggio: encoding, scaling, feature nuove. Dove i dati grezzi diventano carburante per i modelli.",
  intro: "In azienda ci passi metà del tempo: trasformare colonne grezze in feature che i modelli sanno usare. One-hot, scaling, log, interazioni, selezione. Serve scikit-learn: il primo caricamento pesa, poi si vola.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Perché esiste il feature engineering", html: `
<p>Un modello non "capisce" i dati: vede numeri. Il <strong>feature engineering</strong> è l'arte di presentare l'informazione nel modo in cui il modello sa sfruttarla — e spesso conta più della scelta dell'algoritmo. Un buon set di feature con un modello semplice batte quasi sempre feature grezze con un modello sofisticato.</p>
<p>Le operazioni di base che vedrai in questa sala:</p>
<ul>
<li><strong>Encoding</strong>: trasformare categorie (testo) in numeri — one-hot, label, ordinal, target;</li>
<li><strong>Scaling</strong>: portare le colonne numeriche su scale comparabili;</li>
<li><strong>Trasformazioni</strong>: log, polinomiali, interazioni, binning;</li>
<li><strong>Selezione</strong>: tenere le feature che servono, buttare il rumore.</li>
</ul>
<p>Regola d'oro che attraversa tutta la sala: qualunque trasformazione "impari" dai dati (una media, un massimo, le categorie viste) va appresa <strong>solo dal training set</strong> e applicata al test. Impararla dal test è data leakage — l'errore che gonfia i risultati e poi crolla in produzione.</p>
`, more: `
<p>Il feature engineering vive nella tensione tra due mondi. Con modelli <strong>lineari</strong> (regressione, SVM lineare) sei tu a dover costruire la non-linearità: se la relazione è quadratica, il modello non la troverà se non gli dai <code>x²</code> come feature. Con modelli <strong>ad alberi</strong> (Random Forest, gradient boosting) molte trasformazioni diventano superflue — gli alberi trovano soglie da soli, sono insensibili allo scaling monotono e gestiscono interazioni nativamente. Sapere quale famiglia userai cambia quanto lavoro di feature engineering serve: è una delle prime domande da farsi.</p>
<p>C'è però un rischio speculare all'under-engineering: la <strong>proliferazione</strong>. Ogni feature aggiunta è un grado di libertà in più per l'overfitting, più rumore in cui il modello può perdersi, più codice da mantenere e più modi di introdurre leakage. La disciplina moderna preferisce poche feature ben motivate a centinaia generate meccanicamente — e quando servono tante feature, la selezione (fine sala) diventa obbligatoria, non opzionale.</p>
<p>Nota pratica che i colloqui premiano: il feature engineering fatto bene incorpora <strong>conoscenza del dominio</strong>. Sapere che "ore dall'ultimo acquisto" predice il churn meglio di "data dell'ultimo acquisto", o che il rapporto prezzo/metratura conta più dei due valori separati, non lo trovi in nessun algoritmo — lo porti tu. È la parte del lavoro che non si automatizza.</p>
` },

    {
      type: "exercise", id: "fe-01", kg: 5, title: "Riconoscere i tipi di colonna",
      task: `<p>Prima di trasformare, bisogna classificare. Per ogni colonna del dataset soci, assegna il tipo giusto come stringa:</p>
<ul>
<li><code>t_eta</code>: "numerica" — età in anni</li>
<li><code>t_citta</code>: "nominale" — città (categorie senza ordine)</li>
<li><code>t_livello</code>: "ordinale" — livello (principiante &lt; intermedio &lt; avanzato)</li>
<li><code>t_abbonato</code>: "binaria" — è abbonato sì/no</li>
</ul>`,
      starter: `t_eta = ...
t_citta = ...
t_livello = ...
t_abbonato = ...

print(t_eta, t_citta, t_livello, t_abbonato)`,
      check: `assert t_eta == "numerica", "eta: valori continui misurabili -> numerica"
assert t_citta == "nominale", "citta: categorie senza un ordine naturale -> nominale (one-hot)"
assert t_livello == "ordinale", "livello: categorie CON ordine -> ordinale (ordinal encoding)"
assert t_abbonato == "binaria", "abbonato: due soli valori -> binaria (0/1)"`,
      hint: `<p>La distinzione chiave è nominale vs ordinale: la città non ha un ordine (Roma non è "più di" Milano), il livello sì (avanzato &gt; intermedio &gt; principiante). Confonderle porta a encoding sbagliati.</p>`,
      solution: `t_eta = "numerica"
t_citta = "nominale"
t_livello = "ordinale"
t_abbonato = "binaria"

print(t_eta, t_citta, t_livello, t_abbonato)`
    },

    { type: "theory", title: "One-hot encoding: categorie senza ordine", html: `
<p>Una colonna nominale (città, colore, tipo di abbonamento) non si può dare al modello come numero arbitrario: se codifichi Roma=0, Milano=1, Napoli=2, il modello crede che Napoli &gt; Milano &gt; Roma, che è un'assurdità. La soluzione è il <strong>one-hot encoding</strong>: una colonna binaria per categoria.</p>
<pre><code>import pandas as pd
df = pd.DataFrame({"citta": ["Roma", "Milano", "Roma", "Napoli"]})
pd.get_dummies(df, columns=["citta"])
# citta_Milano  citta_Napoli  citta_Roma
#      0             0            1
#      1             0            0
#      ...</code></pre>
<p>Ogni riga ha un solo 1 (da cui "one-hot"). Nessun ordine implicito, nessuna gerarchia inventata. È l'encoding di default per le variabili nominali.</p>
`, more: `
<p>Il costo del one-hot è la <strong>dimensionalità</strong>: una colonna con 1000 città diventa 1000 colonne, quasi tutte zero (sparse). Con molte categorie ad alta cardinalità (codici prodotto, ID utente, CAP) il one-hot esplode e diventa controproducente — è lì che entrano in gioco alternative come il target encoding (più avanti) o le embedding. Regola pratica: one-hot fino a qualche decina di categorie, poi si valutano altre strade.</p>
<p>La <strong>dummy variable trap</strong>: con k categorie, k colonne one-hot sono linearmente dipendenti (se conosci k-1 valori, l'ultimo è determinato). Per i modelli lineari con intercetta questo crea multicollinearità perfetta, e si usa <code>drop_first=True</code> per tenere k-1 colonne. Per alberi e reti neurali invece non serve — anzi, spesso è meglio tenere tutte le colonne per non privilegiare arbitrariamente una categoria di riferimento. Sapere quando droppare la prima colonna è una domanda da colloquio.</p>
<p>La trappola operativa più insidiosa: le <strong>categorie del test assenti nel train</strong> (e viceversa). Se addestri con Roma/Milano/Napoli e in produzione arriva Torino, <code>pd.get_dummies</code> applicato separatamente produce colonne diverse e il modello si rompe. La soluzione robusta è <code>sklearn.preprocessing.OneHotEncoder</code> con <code>handle_unknown='ignore'</code>, che impara le categorie dal solo train e gestisce le sconosciute mettendo tutti zero — di nuovo il principio "fit sul train, transform sul test".</p>
` },

    {
      type: "exercise", id: "fe-02", kg: 10, title: "One-hot delle sale preferite",
      task: `<p>Ogni socio ha una sala preferita (nominale). Applica il one-hot con pandas:</p>
<ul>
<li><code>encoded</code>: il DataFrame con la colonna <code>sala</code> trasformata in one-hot (usa <code>pd.get_dummies</code>)</li>
<li><code>n_colonne_sala</code>: quante colonne <code>sala_*</code> sono state create</li>
<li><code>somma_riga</code>: la somma di ogni riga sulle colonne one-hot (deve essere sempre 1)</li>
</ul>`,
      setup: `import pandas as pd
df = pd.DataFrame({
    "socio": [1, 2, 3, 4, 5, 6],
    "sala": ["pesi", "cardio", "pesi", "funzionale", "cardio", "pesi"],
})`,
      starter: `import pandas as pd
# df: colonne socio, sala

encoded = ...
colonne_sala = [c for c in encoded.columns if c.startswith("sala_")]
n_colonne_sala = ...
somma_riga = ...   # una Series: somma delle colonne sala_* per ogni riga

print(encoded)
print("colonne sala:", n_colonne_sala, "| somme righe:", somma_riga.tolist())`,
      check: `import pandas as pd
assert 'encoded' in globals(), "encoded: pd.get_dummies(df, columns=['sala'])"
cols = [c for c in encoded.columns if c.startswith("sala_")]
assert n_colonne_sala == 3, "3 sale distinte -> 3 colonne one-hot (pesi, cardio, funzionale)"
assert 'somma_riga' in globals() and all(int(v) == 1 for v in somma_riga), "ogni riga ha un solo 1: la somma delle colonne one-hot e' sempre 1"
assert "sala" not in encoded.columns, "la colonna originale 'sala' deve sparire, sostituita dalle one-hot"`,
      hint: `<p><code>pd.get_dummies(df, columns=["sala"])</code>. Per la somma di riga sulle sole colonne one-hot: <code>encoded[colonne_sala].sum(axis=1)</code>.</p>`,
      solution: `import pandas as pd

encoded = pd.get_dummies(df, columns=["sala"])
colonne_sala = [c for c in encoded.columns if c.startswith("sala_")]
n_colonne_sala = len(colonne_sala)
somma_riga = encoded[colonne_sala].sum(axis=1)

print(encoded)
print("colonne sala:", n_colonne_sala, "| somme righe:", somma_riga.tolist())`
    },

    {
      type: "exercise", id: "fe-03", kg: 10, title: "OneHotEncoder e le categorie sconosciute",
      task: `<p>In produzione arrivano categorie mai viste nel training. Usa <code>OneHotEncoder</code> con <code>handle_unknown='ignore'</code>:</p>
<ul>
<li><code>enc</code>: un OneHotEncoder addestrato SOLO su <code>train</code></li>
<li><code>train_enc</code>: la trasformazione del train (array denso: usa <code>sparse_output=False</code>)</li>
<li><code>test_enc</code>: la trasformazione del test (contiene "funzionale", categoria nuova)</li>
<li><code>riga_ignota</code>: la somma della riga di test con la categoria sconosciuta (deve essere 0: tutte le colonne a zero)</li>
</ul>`,
      setup: `import numpy as np
train = np.array([["pesi"], ["cardio"], ["pesi"], ["cardio"]])
test = np.array([["cardio"], ["funzionale"]])`,
      starter: `import numpy as np
from sklearn.preprocessing import OneHotEncoder
# train, test: array colonna di categorie

enc = ...
train_enc = ...
test_enc = ...
riga_ignota = ...   # somma della seconda riga di test_enc

print("train:\\n", train_enc)
print("test:\\n", test_enc)
print("riga sconosciuta somma:", riga_ignota)`,
      check: `import numpy as np
from sklearn.preprocessing import OneHotEncoder
assert 'enc' in globals() and isinstance(enc, OneHotEncoder), "enc: OneHotEncoder(handle_unknown='ignore', sparse_output=False)"
assert 'train_enc' in globals() and np.asarray(train_enc).shape == (4, 2), "train_enc: 4 righe, 2 categorie (pesi, cardio)"
assert 'test_enc' in globals() and np.asarray(test_enc).shape == (2, 2), "test_enc: 2 righe, sempre 2 colonne (quelle imparate dal train)"
assert 'riga_ignota' in globals() and abs(float(riga_ignota)) < 1e-9, "riga_ignota: 'funzionale' non era nel train -> tutte le colonne a 0 -> somma 0. Questo e' handle_unknown='ignore'"`,
      hint: `<p>Costruisci <code>OneHotEncoder(handle_unknown="ignore", sparse_output=False)</code>, poi <code>enc.fit(train)</code> e <code>enc.transform(...)</code>. La riga sconosciuta: <code>test_enc[1].sum()</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
enc.fit(train)
train_enc = enc.transform(train)
test_enc = enc.transform(test)
riga_ignota = test_enc[1].sum()

print("train:\\n", train_enc)
print("test:\\n", test_enc)
print("riga sconosciuta somma:", riga_ignota)`
    },

    { type: "theory", title: "Label e ordinal encoding", html: `
<p>Non tutte le categorie vogliono il one-hot. Due alternative:</p>
<p><strong>Label encoding</strong>: ogni categoria &rarr; un intero. Semplice, ma introduce un ordine fittizio — quindi va bene SOLO per il <em>target</em> (la y da predire, nei problemi di classificazione) o per modelli ad alberi che non interpretano gli interi come grandezze ordinate.</p>
<pre><code>from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y = le.fit_transform(["cane", "gatto", "cane"])   # [0, 1, 0]</code></pre>
<p><strong>Ordinal encoding</strong>: per categorie che HANNO un ordine naturale (principiante &lt; intermedio &lt; avanzato), mappi rispettando l'ordine — così il numero porta informazione vera.</p>
<pre><code>from sklearn.preprocessing import OrdinalEncoder
oe = OrdinalEncoder(categories=[["principiante", "intermedio", "avanzato"]])
oe.fit_transform([["intermedio"], ["avanzato"]])   # [[1], [2]]</code></pre>
`, more: `
<p>La differenza operativa tra <code>LabelEncoder</code> e <code>OrdinalEncoder</code> non è solo l'ordine ma la forma dei dati: <code>LabelEncoder</code> lavora su un vettore 1D (pensato per la y), <code>OrdinalEncoder</code> su una matrice 2D (pensato per le X, più colonne insieme). Usare <code>LabelEncoder</code> sulle feature è un anti-pattern comune: funziona per una colonna ma non si integra nelle pipeline e non gestisce l'ordine esplicito. Regola: <code>LabelEncoder</code> solo per il target, <code>OrdinalEncoder</code> per le feature ordinali.</p>
<p>Il pericolo dell'ordinal encoding applicato a categorie SENZA ordine è lo stesso del label encoding sulle feature: inventi una metrica inesistente. "Roma=0, Milano=1, Napoli=2" dice al modello lineare che Milano è a metà strada tra Roma e Napoli, e che Napoli è "il doppio" di Milano — pura fantasia che degrada le predizioni. Se l'ordine non c'è, one-hot; se c'è, ordinal con l'ordine dichiarato esplicitamente in <code>categories</code>, mai lasciato all'ordine alfabetico di default.</p>
<p>Per il target ordinale (es. predire un rating 1-5 stelle) c'è una scelta di modellazione sottile: trattarlo come classificazione (5 classi indipendenti, perdi l'ordine) o come regressione (usi l'ordine ma assumi distanze uguali tra i livelli) o con modelli di regressione ordinale dedicati. La risposta "dipende da quanto conta l'ordine e da quanto sono equidistanti i livelli" mostra maturità.</p>
` },

    {
      type: "exercise", id: "fe-04", kg: 10, title: "Ordine che conta, ordine che no",
      task: `<p>Due colonne categoriche: <code>livello</code> (ordinale) e <code>citta</code> (nominale). Codificale correttamente:</p>
<ul>
<li><code>livelli_enc</code>: array degli ordinal encoding di <code>livelli</code>, rispettando l'ordine principiante(0) &lt; intermedio(1) &lt; avanzato(2)</li>
<li><code>y_enc</code>: label encoding del target <code>esiti</code> ("rinnova"/"abbandona")</li>
<li><code>usa_onehot_citta</code>: <code>True</code> — la città andrebbe codificata con one-hot, non ordinal (booleano)</li>
</ul>`,
      setup: `import numpy as np
livelli = np.array([["intermedio"], ["avanzato"], ["principiante"], ["avanzato"]])
esiti = np.array(["rinnova", "abbandona", "rinnova", "rinnova"])`,
      starter: `import numpy as np
from sklearn.preprocessing import OrdinalEncoder, LabelEncoder
# livelli: colonna 2D ordinale | esiti: target 1D

oe = OrdinalEncoder(categories=[["principiante", "intermedio", "avanzato"]])
livelli_enc = ...

le = LabelEncoder()
y_enc = ...

usa_onehot_citta = ...

print("livelli:", livelli_enc.ravel().tolist(), "| y:", y_enc.tolist())`,
      check: `import numpy as np
assert 'livelli_enc' in globals() and np.asarray(livelli_enc).ravel().tolist() == [1.0, 2.0, 0.0, 2.0], "livelli_enc: oe.fit_transform(livelli) -> [1,2,0,2] rispettando l'ordine dichiarato"
assert 'y_enc' in globals() and len(np.unique(y_enc)) == 2, "y_enc: le.fit_transform(esiti), due classi 0/1"
assert 'usa_onehot_citta' in globals() and usa_onehot_citta == True, "usa_onehot_citta: True — la citta' non ha ordine, ordinal inventerebbe una gerarchia falsa"`,
      hint: `<p>L'ordinal encoder è già costruito con l'ordine giusto: basta <code>oe.fit_transform(livelli)</code>. Il label encoder per il target: <code>le.fit_transform(esiti)</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import OrdinalEncoder, LabelEncoder

oe = OrdinalEncoder(categories=[["principiante", "intermedio", "avanzato"]])
livelli_enc = oe.fit_transform(livelli)

le = LabelEncoder()
y_enc = le.fit_transform(esiti)

usa_onehot_citta = True

print("livelli:", livelli_enc.ravel().tolist(), "| y:", y_enc.tolist())`
    },

    { type: "theory", title: "Scaling: standardizzazione e normalizzazione", html: `
<p>Feature su scale diverse (età in anni ~20-70, reddito in euro ~10000-100000) confondono i modelli sensibili alla distanza (KNN, SVM, reti neurali) e la regolarizzazione. Lo <strong>scaling</strong> le rende comparabili.</p>
<pre><code>from sklearn.preprocessing import StandardScaler, MinMaxScaler
# Standardizzazione: media 0, deviazione standard 1 (z-score)
StandardScaler().fit_transform(X)
# Normalizzazione: comprime in [0, 1]
MinMaxScaler().fit_transform(X)</code></pre>
<p><strong>StandardScaler</strong> (z-score): centra sulla media e divide per la std. È il default: gestisce bene i dati grossomodo normali e non ha limiti di range. <strong>MinMaxScaler</strong>: comprime tutto tra 0 e 1, utile quando serve un range fisso (immagini, reti con certe attivazioni), ma un singolo outlier schiaccia tutti gli altri valori.</p>
<p>Regola sacra (l'hai vista in scikit-learn): <strong>fit sul train, transform sul test</strong>. Le statistiche di scaling si imparano dal solo training.</p>
`, more: `
<p>Quando NON serve scalare: i modelli ad alberi (decision tree, Random Forest, gradient boosting) sono invarianti a trasformazioni monotone delle singole feature — dividono su soglie, e la soglia "reddito &gt; 50000" o "reddito_scalato &gt; 0.4" produce lo stesso split. Scalare non fa male ma è tempo perso. Al contrario, per KNN e SVM lo scaling non è opzionale: senza, la feature con range più grande domina completamente la distanza e le altre diventano invisibili (l'hai visto nel "massimale" di scikit-learn dove il KNN crollava).</p>
<p><strong>RobustScaler</strong> è la terza opzione, per dati con outlier: usa mediana e IQR invece di media e std, quindi un valore estremo non sballa i parametri di scaling. Se hai visto che <code>StandardScaler</code> lascia code enormi perché la std è gonfiata da pochi outlier, <code>RobustScaler</code> è la risposta. C'è anche <code>Normalizer</code>, che però fa una cosa diversa e spesso confusa: scala ogni RIGA (campione) a norma unitaria, non ogni colonna — utile per dati tipo testo/frequenze, raramente quello che vuoi per feature tabulari.</p>
<p>Il modo corretto e a prova di leakage per applicare lo scaling nella pratica è dentro una <code>Pipeline</code>: <code>Pipeline([("scaler", StandardScaler()), ("model", ...)])</code>. Così durante la cross-validation lo scaler viene rifittato sul solo train di ogni fold automaticamente — farlo a mano prima della CV è un leakage sottile e frequentissimo, perché le statistiche di scaling "vedono" anche i dati di validazione.</p>
` },

    {
      type: "exercise", id: "fe-05", kg: 10, title: "Due scale, un solo metro",
      task: `<p>Due feature su scale diversissime: età (anni) e reddito (euro). Standardizzale col metodo giusto:</p>
<ul>
<li><code>X_train_s</code>: standardizzazione del train (fit + transform)</li>
<li><code>X_test_s</code>: trasformazione del test con le statistiche del train</li>
<li><code>media_train</code>: la media di ogni colonna di <code>X_train_s</code> (deve essere ~0)</li>
<li><code>test_non_zero</code>: <code>True</code> se la media di <code>X_test_s</code> NON è esattamente zero (giusto: usa le stats del train)</li>
</ul>`,
      setup: `import numpy as np
X_train = np.array([[25, 22000.0], [40, 35000], [55, 60000], [30, 28000], [48, 52000]])
X_test = np.array([[35, 40000.0], [60, 70000]])`,
      starter: `import numpy as np
from sklearn.preprocessing import StandardScaler

scaler = ...
X_train_s = ...
X_test_s = ...

media_train = X_train_s.mean(axis=0)
test_non_zero = ...

print("media train (~0):", np.round(media_train, 6))
print("media test:", np.round(X_test_s.mean(axis=0), 3))`,
      check: `import numpy as np
assert 'X_train_s' in globals() and np.allclose(X_train_s.mean(axis=0), 0, atol=1e-9), "X_train_s: media di colonna ~0 dopo fit_transform"
assert np.allclose(X_train_s.std(axis=0), 1, atol=1e-9), "X_train_s: std di colonna ~1"
assert 'X_test_s' in globals() and X_test_s.shape == (2, 2), "X_test_s: scaler.transform(X_test), stessa forma"
assert 'test_non_zero' in globals() and test_non_zero == True, "test_non_zero: True — il test usa media/std del TRAIN, quindi la sua media non e' esattamente 0"
assert abs(X_test_s.mean()) > 1e-6, "conferma: se X_test_s.mean() fosse 0, avresti fatto fit_transform sul test (leakage)"`,
      hint: `<p><code>scaler.fit_transform(X_train)</code> poi <code>scaler.transform(X_test)</code> — mai <code>fit</code> sul test. Per <code>test_non_zero</code>: <code>abs(X_test_s.mean()) &gt; 1e-6</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean(axis=0)
test_non_zero = abs(X_test_s.mean()) > 1e-6

print("media train (~0):", np.round(media_train, 6))
print("media test:", np.round(X_test_s.mean(axis=0), 3))`
    },

    {
      type: "exercise", id: "fe-06", kg: 10, title: "Quando l'outlier schiaccia tutto",
      task: `<p>Una colonna con un outlier estremo. Confronta MinMax (sensibile) e Robust (resistente):</p>
<ul>
<li><code>minmax</code>: la colonna scalata con <code>MinMaxScaler</code></li>
<li><code>robust</code>: la colonna scalata con <code>RobustScaler</code></li>
<li><code>minmax_schiaccia</code>: <code>True</code> se nel MinMax i valori "normali" (tutti tranne l'outlier) stanno sotto 0.1 (schiacciati verso zero dall'outlier)</li>
</ul>`,
      setup: `import numpy as np
col = np.array([[10.0], [12], [11], [13], [9], [1000]])`,
      starter: `import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler
# col: 5 valori normali (~10) + un outlier (1000)

minmax = MinMaxScaler().fit_transform(col)
robust = RobustScaler().fit_transform(col)

# i primi 5 valori (normali) nel minmax:
normali_minmax = minmax[:5]
minmax_schiaccia = ...

print("minmax normali:", np.round(normali_minmax.ravel(), 4))
print("robust normali:", np.round(robust[:5].ravel(), 2))`,
      check: `import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler
assert 'minmax' in globals() and np.allclose(minmax, MinMaxScaler().fit_transform(col)), "minmax: MinMaxScaler().fit_transform(col)"
assert 'robust' in globals() and np.allclose(robust, RobustScaler().fit_transform(col)), "robust: RobustScaler().fit_transform(col)"
assert 'minmax_schiaccia' in globals() and minmax_schiaccia == True, "minmax_schiaccia: True — l'outlier 1000 spinge tutti i valori normali sotto 0.01, indistinguibili tra loro"`,
      hint: `<p>Il MinMax mappa min&rarr;0 e max&rarr;1: con max=1000 i valori attorno a 10 finiscono tutti vicinissimi a zero. Verifica: <code>(normali_minmax &lt; 0.1).all()</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler

minmax = MinMaxScaler().fit_transform(col)
robust = RobustScaler().fit_transform(col)

normali_minmax = minmax[:5]
minmax_schiaccia = bool((normali_minmax < 0.1).all())

print("minmax normali:", np.round(normali_minmax.ravel(), 4))
print("robust normali:", np.round(robust[:5].ravel(), 2))`
    },

    { type: "theory", title: "Log transform: domare le code lunghe", html: `
<p>Molte grandezze reali hanno distribuzioni <strong>storte a destra</strong>: redditi, prezzi, durate di sessione, follower. Pochi valori enormi e una massa di valori piccoli. Il <strong>logaritmo</strong> comprime la coda e rende la distribuzione più simmetrica, spesso quasi normale.</p>
<pre><code>import numpy as np
# log1p = log(1 + x): gestisce anche gli zeri (log(0) sarebbe -inf)
X_log = np.log1p(X)
# per tornare indietro:
X_orig = np.expm1(X_log)</code></pre>
<p>Perché aiuta: (1) i modelli lineari assumono relazioni lineari e residui simmetrici — sul log spesso è vero; (2) riduce l'influenza degli outlier senza buttarli; (3) trasforma relazioni moltiplicative in additive ("+10%" diventa un passo costante). Usa <code>log1p</code>/<code>expm1</code> invece di <code>log</code>/<code>exp</code> per gestire lo zero in sicurezza.</p>
`, more: `
<p>Il log funziona solo su valori positivi (o &ge;0 con <code>log1p</code>): per dati con valori negativi servono altre trasformazioni. La famiglia più generale è <strong>Box-Cox</strong> (solo positivi) e <strong>Yeo-Johnson</strong> (accetta anche negativi e zeri), entrambe in <code>sklearn.preprocessing.PowerTransformer</code>: cercano automaticamente l'esponente che rende i dati più normali possibile, con il log come caso particolare. Quando non sai quale trasformazione di potenza usare, <code>PowerTransformer(method='yeo-johnson')</code> la sceglie per te dai dati.</p>
<p>Trasformare anche il TARGET è una mossa potente e sottovalutata nelle regressioni con y stortissima (prezzi, vendite): predici <code>log(y)</code>, poi riporti indietro con <code>expm1</code>. Attenzione però all'interpretazione — l'errore medio sul log NON è l'errore medio in scala originale, e il "back-transform" della media logaritmica introduce un bias (la media di log non è il log della media). Se riporti le predizioni ai clienti in euro, va gestito; <code>TransformedTargetRegressor</code> di sklearn incapsula andata e ritorno in modo pulito.</p>
<p>Per i modelli ad alberi il log delle FEATURE è di nuovo quasi inutile (trasformazione monotona, gli split non cambiano). Ma il log del TARGET può cambiare cosa il modello ottimizza: minimizzare l'errore quadratico su <code>log(y)</code> equivale a curarsi degli errori RELATIVI (percentuali) invece che assoluti — sbagliare di 100&euro; su una casa da 1M conta meno che sbagliare di 100&euro; su una da 50k. È una scelta di funzione di costo mascherata da feature engineering.</p>
` },

    {
      type: "exercise", id: "fe-07", kg: 10, title: "Il logaritmo raddrizza i redditi",
      task: `<p>I redditi annuali dei soci sono stortissimi. Applica il log e misura il miglioramento di simmetria:</p>
<ul>
<li><code>redditi_log</code>: <code>np.log1p</code> dei redditi</li>
<li><code>skew_prima</code>, <code>skew_dopo</code>: l'asimmetria (skewness) prima e dopo, con <code>scipy.stats.skew</code></li>
<li><code>ricostruiti</code>: i redditi originali riottenuti da <code>redditi_log</code> con <code>np.expm1</code></li>
<li><code>meno_storto</code>: <code>True</code> se |skew_dopo| &lt; |skew_prima|</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(3)
redditi = np.round(rng.lognormal(10.2, 0.6, size=200), 0)`,
      starter: `import numpy as np
from scipy import stats
# redditi: 200 redditi annuali (distribuzione lognormale, storta)

redditi_log = ...
skew_prima = stats.skew(redditi)
skew_dopo = ...
ricostruiti = ...
meno_storto = ...

print(f"skew prima {skew_prima:.2f} -> dopo {skew_dopo:.2f} | ricostruzione ok: {np.allclose(ricostruiti, redditi)}")`,
      check: `import numpy as np
from scipy import stats
assert 'redditi_log' in globals() and np.allclose(redditi_log, np.log1p(redditi)), "redditi_log: np.log1p(redditi)"
assert 'skew_dopo' in globals() and abs(float(skew_dopo) - float(stats.skew(np.log1p(redditi)))) < 1e-6, "skew_dopo: stats.skew(redditi_log)"
assert 'ricostruiti' in globals() and np.allclose(ricostruiti, redditi), "ricostruiti: np.expm1(redditi_log) riporta ai valori originali"
assert 'meno_storto' in globals() and meno_storto == True and abs(float(skew_dopo)) < abs(float(skew_prima)), "meno_storto: True — il log riduce nettamente l'asimmetria"`,
      hint: `<p><code>np.log1p</code> per andare, <code>np.expm1</code> per tornare (sono l'inverso esatto l'una dell'altra). La skewness misura l'asimmetria: vicino a 0 = simmetrica.</p>`,
      solution: `import numpy as np
from scipy import stats

redditi_log = np.log1p(redditi)
skew_prima = stats.skew(redditi)
skew_dopo = stats.skew(redditi_log)
ricostruiti = np.expm1(redditi_log)
meno_storto = abs(skew_dopo) < abs(skew_prima)

print(f"skew prima {skew_prima:.2f} -> dopo {skew_dopo:.2f} | ricostruzione ok: {np.allclose(ricostruiti, redditi)}")`
    },

    {
      type: "exercise", id: "fe-08", kg: 15, title: "PowerTransformer sceglie da solo",
      task: `<p>Non sai quale trasformazione di potenza serve? Lascia decidere ai dati con <code>PowerTransformer</code> (Yeo-Johnson):</p>
<ul>
<li><code>pt</code>: un PowerTransformer (method di default 'yeo-johnson')</li>
<li><code>X_trans</code>: i dati trasformati (fit + transform)</li>
<li><code>skew_dopo</code>: skewness della colonna trasformata (deve avvicinarsi a 0)</li>
<li><code>quasi_normale</code>: <code>True</code> se |skew_dopo| &lt; 0.5</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(8)
X = rng.exponential(3, size=300).reshape(-1, 1)`,
      starter: `import numpy as np
from sklearn.preprocessing import PowerTransformer
from scipy import stats
# X: 300 valori esponenziali (stortissimi), colonna 2D

pt = ...
X_trans = ...
skew_dopo = stats.skew(X_trans.ravel())
quasi_normale = ...

print(f"skew prima {stats.skew(X.ravel()):.2f} -> dopo {skew_dopo:.2f} | quasi normale: {quasi_normale}")`,
      check: `import numpy as np
from sklearn.preprocessing import PowerTransformer
from scipy import stats
assert 'pt' in globals() and isinstance(pt, PowerTransformer), "pt: PowerTransformer()"
assert 'X_trans' in globals() and np.asarray(X_trans).shape == (300, 1), "X_trans: pt.fit_transform(X)"
assert 'skew_dopo' in globals() and abs(float(skew_dopo)) < 0.5, "skew_dopo: dopo Yeo-Johnson deve essere vicino a 0"
assert 'quasi_normale' in globals() and quasi_normale == True, "quasi_normale: True — il PowerTransformer ha trovato l'esponente che normalizza"`,
      hint: `<p><code>PowerTransformer()</code> usa Yeo-Johnson di default. Un solo <code>fit_transform(X)</code> e cerca automaticamente il parametro ottimale. <code>quasi_normale = abs(skew_dopo) &lt; 0.5</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import PowerTransformer
from scipy import stats

pt = PowerTransformer()
X_trans = pt.fit_transform(X)
skew_dopo = stats.skew(X_trans.ravel())
quasi_normale = abs(skew_dopo) < 0.5

print(f"skew prima {stats.skew(X.ravel()):.2f} -> dopo {skew_dopo:.2f} | quasi normale: {quasi_normale}")`
    },

    { type: "theory", title: "Binning: dal continuo al categorico", html: `
<p>A volte una feature continua è più utile a fasce. L'<strong>età</strong> raramente ha un effetto lineare perfetto sulla spesa: più che "+1 anno = +X euro", contano le fasce di vita (giovane, adulto, senior). Il <strong>binning</strong> (discretizzazione) raggruppa i valori continui in intervalli.</p>
<pre><code>import pandas as pd
# bin a larghezza definita da te (bordi espliciti)
pd.cut(eta, bins=[0, 30, 50, 100], labels=["giovane", "adulto", "senior"])
# bin a frequenza uguale (stessi conteggi per bin): quartili
pd.qcut(reddito, q=4, labels=["Q1", "Q2", "Q3", "Q4"])</code></pre>
<p><code>cut</code> divide per <em>valore</em> (bordi che decidi tu): i bin possono avere conteggi molto diversi. <code>qcut</code> divide per <em>quantile</em>: ogni bin ha lo stesso numero di elementi, ma i bordi variano. Il binning cattura non-linearità e riduce l'effetto degli outlier, al prezzo di buttare via informazione fine.</p>
`, more: `
<p>Il trade-off del binning è netto e va dichiarato: <strong>guadagni robustezza e non-linearità, perdi risoluzione</strong>. Un modello lineare su "età" impone una pendenza costante; su fasce d'età può avere un effetto diverso per fascia (di fatto una non-linearità a gradini). Ma raggruppare 31 e 49 anni nello stesso bin "adulto" cancella ogni differenza tra loro — e la scelta dei bordi (30? 35? 40?) è arbitraria e può cambiare i risultati. Per i modelli ad alberi il binning manuale è quasi sempre inutile: gli alberi trovano le soglie ottimali da soli, meglio di bordi scelti a occhio.</p>
<p><code>qcut</code> ha una virtù nascosta: rende la feature <strong>robusta agli outlier per costruzione</strong>, perché lavora sui ranghi/quantili, non sui valori. Il socio più ricco finisce nel quartile top che il suo reddito sia 80k o 8 milioni. Ma attenzione al leakage: i bordi dei quantili si calcolano sul train e si RIapplicano al test (con <code>pd.cut</code> usando i bordi salvati, o meglio <code>KBinsDiscretizer</code> di sklearn che fit/transform separati). Ricalcolare i quantili sul test è lo stesso errore dello scaling rifittato.</p>
<p>Una tecnica avanzata è il <strong>binning supervisionato</strong>: scegliere i bordi in modo da massimizzare la relazione col target (usato molto nel credit scoring, dove diventa il "weight of evidence"). Potente ma pericoloso: usa la y per costruire la feature, quindi va fatto in cross-validation attenta per non introdurre leakage — è la stessa cautela del target encoding che vedrai tra poco.</p>
` },

    {
      type: "exercise", id: "fe-09", kg: 10, title: "Fasce d'età e quartili di spesa",
      task: `<p>Discretizza due colonne in modi diversi:</p>
<ul>
<li><code>fasce</code>: <code>pd.cut</code> dell'età con bordi [0, 30, 50, 100] e label ["giovane", "adulto", "senior"]</li>
<li><code>quartili</code>: <code>pd.qcut</code> della spesa in 4 quartili con label ["Q1", "Q2", "Q3", "Q4"]</li>
<li><code>conteggi_quartili</code>: i conteggi di ogni quartile (devono essere uguali: è la definizione di qcut)</li>
<li><code>tutti_uguali</code>: <code>True</code> se tutti i quartili hanno lo stesso conteggio</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(15)
df = pd.DataFrame({
    "eta": rng.integers(18, 75, size=40),
    "spesa": rng.integers(20, 500, size=40),
})`,
      starter: `import pandas as pd
# df: colonne eta, spesa (40 righe)

fasce = ...
quartili = ...
conteggi_quartili = quartili.value_counts()
tutti_uguali = ...

print("fasce:\\n", fasce.value_counts())
print("quartili:\\n", conteggi_quartili)`,
      check: `import pandas as pd
assert 'fasce' in globals() and set(fasce.dropna().unique()) <= {"giovane", "adulto", "senior"}, "fasce: pd.cut(df['eta'], bins=[0,30,50,100], labels=[...])"
assert 'quartili' in globals() and len(quartili.cat.categories) == 4, "quartili: pd.qcut(df['spesa'], q=4, labels=['Q1','Q2','Q3','Q4'])"
assert 'tutti_uguali' in globals() and tutti_uguali == True, "tutti_uguali: True — qcut mette lo stesso numero di elementi (10) in ogni quartile. 40/4=10"`,
      hint: `<p><code>pd.cut</code> vuole <code>bins=</code> (i bordi), <code>pd.qcut</code> vuole <code>q=</code> (il numero di gruppi). Per <code>tutti_uguali</code>: <code>conteggi_quartili.nunique() == 1</code>.</p>`,
      solution: `import pandas as pd

fasce = pd.cut(df["eta"], bins=[0, 30, 50, 100], labels=["giovane", "adulto", "senior"])
quartili = pd.qcut(df["spesa"], q=4, labels=["Q1", "Q2", "Q3", "Q4"])
conteggi_quartili = quartili.value_counts()
tutti_uguali = conteggi_quartili.nunique() == 1

print("fasce:\\n", fasce.value_counts())
print("quartili:\\n", conteggi_quartili)`
    },

    { type: "theory", title: "Polynomial features e interazioni", html: `
<p>Un modello lineare vede solo relazioni lineari — a meno che tu non gliele costruisca. Le <strong>polynomial features</strong> aggiungono potenze e prodotti delle feature originali, dando al modello lineare il potere di catturare curve e interazioni.</p>
<pre><code>from sklearn.preprocessing import PolynomialFeatures
# da [a, b] genera: [1, a, b, a^2, a*b, b^2]
poly = PolynomialFeatures(degree=2)
poly.fit_transform(X)
# solo interazioni (niente a^2, b^2), utile per non esplodere:
PolynomialFeatures(degree=2, interaction_only=True)</code></pre>
<p>Il termine <strong>a*b</strong> è l'<em>interazione</em>: cattura effetti che dipendono dalla combinazione. "Ore di allenamento" e "qualità del sonno" separatamente predicono i risultati, ma il loro prodotto cattura che allenarsi tanto SENZA dormire non funziona — un effetto che nessuna delle due feature da sola può esprimere.</p>
`, more: `
<p>Il pericolo delle polynomial features è l'<strong>esplosione combinatoria</strong>: con d feature e grado g, il numero di termini cresce come d^g. 10 feature a grado 3 diventano centinaia di colonne — overfitting garantito e costo computazionale. Difese: grado basso (2 quasi sempre basta), <code>interaction_only=True</code> per saltare le pure potenze, e regolarizzazione forte a valle. Il grado 2 con interazioni è il punto di partenza ragionevole; salire di grado raramente ripaga fuori da problemi con struttura polinomiale nota.</p>
<p>Le interazioni più preziose non vengono da <code>PolynomialFeatures</code> a tappeto ma dalla <strong>conoscenza del dominio</strong>: sai che il rischio di infortunio dipende dal prodotto carico&times;frequenza, o che il valore di una casa dipende da prezzo_al_mq &times; metratura. Costruire QUELLE interazioni specifiche, poche e motivate, batte generarne centinaia meccanicamente e sperare che il modello trovi le buone. Il generatore automatico è utile come rete di sicurezza, non come strategia primaria.</p>
<p>Di nuovo la distinzione per famiglia di modelli: gli alberi catturano le interazioni <strong>nativamente</strong> — un albero che splitta prima su "ore" e poi su "sonno" dentro un ramo sta già modellando ore&times;sonno, senza che tu costruisca nulla. Per questo le polynomial features servono soprattutto ai modelli lineari; darle a un gradient boosting è quasi sempre ridondante. Sapere che "gli alberi fanno interazioni da soli" è una risposta che distingue chi ha capito i modelli da chi applica ricette.</p>
` },

    {
      type: "exercise", id: "fe-10", kg: 15, title: "Dare le curve al modello lineare",
      task: `<p>Genera le feature polinomiali di grado 2 da due colonne:</p>
<ul>
<li><code>X_poly</code>: le polynomial features di grado 2 (fit_transform)</li>
<li><code>nomi</code>: i nomi delle feature generate (<code>get_feature_names_out</code>)</li>
<li><code>n_feature</code>: quante colonne sono state generate</li>
<li><code>ha_interazione</code>: <code>True</code> se tra i nomi c'è il termine di interazione tra le due feature (contiene uno spazio, es. "x0 x1")</li>
</ul>`,
      setup: `import numpy as np
X = np.array([[2.0, 3.0], [1, 5], [4, 2]])`,
      starter: `import numpy as np
from sklearn.preprocessing import PolynomialFeatures
# X: 3 righe, 2 colonne (x0, x1)

poly = PolynomialFeatures(degree=2)
X_poly = ...
nomi = poly.get_feature_names_out()
n_feature = ...
ha_interazione = ...

print("nomi:", list(nomi))
print("shape:", X_poly.shape)`,
      check: `import numpy as np
from sklearn.preprocessing import PolynomialFeatures
_p = PolynomialFeatures(degree=2); _xp = _p.fit_transform(X)
assert 'X_poly' in globals() and np.allclose(X_poly, _xp), "X_poly: poly.fit_transform(X)"
assert 'n_feature' in globals() and n_feature == 6, "n_feature: 6 -> [1, x0, x1, x0^2, x0*x1, x1^2]"
assert 'ha_interazione' in globals() and ha_interazione == True, "ha_interazione: True — 'x0 x1' e' il prodotto, il termine di interazione"`,
      hint: `<p>Grado 2 su 2 feature dà 6 termini: bias, le due lineari, i due quadrati e l'interazione. Il termine di interazione nei nomi contiene uno spazio: <code>any(" " in n for n in nomi)</code>.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=2)
X_poly = poly.fit_transform(X)
nomi = poly.get_feature_names_out()
n_feature = X_poly.shape[1]
ha_interazione = any(" " in n for n in nomi)

print("nomi:", list(nomi))
print("shape:", X_poly.shape)`
    },

    {
      type: "exercise", id: "fe-11", kg: 15, title: "L'interazione che conta davvero",
      task: `<p>Il calo di performance dipende dal PRODOTTO di due deviazioni (dal carico ottimale e dal riposo ottimale), centrate su zero. Con feature così, i termini lineari da soli non predicono nulla — solo l'interazione conta:</p>
<ul>
<li><code>r2_base</code>: R² di una <code>LinearRegression</code> con le sole due feature grezze (sarà bassissimo!)</li>
<li><code>X_inter</code>: le feature con in più la colonna prodotto (usa np.column_stack)</li>
<li><code>r2_inter</code>: R² del modello con l'interazione aggiunta</li>
<li><code>interazione_aiuta</code>: <code>True</code> se <code>r2_inter</code> supera nettamente <code>r2_base</code> (di almeno 0.2)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(21)
# deviazioni dal valore ottimale: possono essere negative o positive (centrate su 0)
dev_carico = rng.uniform(-4, 4, size=200)
dev_riposo = rng.uniform(-4, 4, size=200)
# il calo dipende dal PRODOTTO delle deviazioni (sbagliare entrambe insieme e' il peggio)
calo = -3 * (dev_carico * dev_riposo) + rng.normal(0, 3, size=200)
X = np.column_stack([dev_carico, dev_riposo])`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
# X: colonne [dev_carico, dev_riposo], centrate su 0 | calo: dipende dal loro PRODOTTO

r2_base = LinearRegression().fit(X, calo).score(X, calo)

X_inter = ...   # aggiungi la colonna dev_carico*dev_riposo
r2_inter = ...
interazione_aiuta = ...

print(f"R2 senza interazione: {r2_base:.3f} | con interazione: {r2_inter:.3f}")`,
      check: `import numpy as np
from sklearn.linear_model import LinearRegression
_xi = np.column_stack([X, X[:,0]*X[:,1]])
_r2i = LinearRegression().fit(_xi, calo).score(_xi, calo)
assert 'r2_base' in globals() and float(r2_base) < 0.1, "r2_base: quasi zero — con feature centrate, i termini lineari sono ciechi al prodotto"
assert 'X_inter' in globals() and np.asarray(X_inter).shape == (200, 3), "X_inter: 3 colonne = dev_carico, dev_riposo, prodotto"
assert 'r2_inter' in globals() and abs(float(r2_inter) - _r2i) < 1e-6, "r2_inter: R2 del modello con la colonna interazione"
assert 'interazione_aiuta' in globals() and interazione_aiuta == True and float(r2_inter) - float(r2_base) > 0.2, "interazione_aiuta: True — senza il prodotto il lineare e' cieco all'effetto vero"`,
      hint: `<p>La colonna interazione è <code>X[:,0] * X[:,1]</code>; aggiungila con <code>np.column_stack([X, X[:,0]*X[:,1]])</code>. Con deviazioni centrate su zero il prodotto è ORTOGONALE ai termini lineari: il modello base non può proprio vederlo.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression

r2_base = LinearRegression().fit(X, calo).score(X, calo)

X_inter = np.column_stack([X, X[:, 0] * X[:, 1]])
r2_inter = LinearRegression().fit(X_inter, calo).score(X_inter, calo)
interazione_aiuta = (r2_inter - r2_base) > 0.2

print(f"R2 senza interazione: {r2_base:.3f} | con interazione: {r2_inter:.3f}")`
    },

    { type: "theory", title: "Target encoding: le categorie ad alta cardinalità", html: `
<p>Con categorie ad alta cardinalità (migliaia di CAP, codici prodotto, ID) il one-hot esplode. Il <strong>target encoding</strong> le sostituisce con un numero solo: la media del target per quella categoria.</p>
<pre><code># per ogni citta', la conversione media dei soci di quella citta'
medie = df.groupby("citta")["converte"].mean()
df["citta_enc"] = df["citta"].map(medie)</code></pre>
<p>Una città dove il 70% converte prende 0.70; una dove converte il 20% prende 0.20. Una sola colonna, ordinata in modo <em>informativo</em> (a differenza del label encoding), che scala a qualunque cardinalità. Potentissimo — e pericolosissimo, per il leakage.</p>
`, more: `
<p>Il leakage del target encoding è il più insidioso di tutta la sala: se calcoli la media del target usando ANCHE la riga che stai codificando, quella riga "vede" la propria y — e il modello impara scorciatoie che in produzione non esistono. Su categorie rare (una città con un solo socio) è catastrofico: l'encoding di quella riga È il suo target, il modello lo memorizza e sembra perfetto in training e inutile dopo. Le difese sono obbligatorie, non opzionali.</p>
<p>Due difese standard, spesso combinate: (1) <strong>encoding out-of-fold</strong> — calcoli le medie in cross-validation, così ogni riga è codificata con medie che NON la includono (è quello che fa <code>category_encoders.TargetEncoder</code> o il <code>TargetEncoder</code> nativo di sklearn recente); (2) <strong>smoothing</strong> — mescoli la media della categoria con la media globale, pesando per quanti esempi ha la categoria: <code>(n_cat * media_cat + m * media_globale) / (n_cat + m)</code>. Con smoothing, una città con 1 solo socio prende quasi la media globale (non ti fidi di 1 esempio), una con 10000 soci prende quasi la sua media vera. È lo stesso principio bayesiano del prior che si aggiorna con l'evidenza.</p>
<p>Quando conviene rispetto al one-hot: cardinalità alta (decine+ di categorie) e categorie con potere predittivo reale. Quando NO: poche categorie (one-hot è più sicuro e interpretabile), o quando l'interpretabilità conta (il target encoding rende opaco cosa rappresenta la colonna). Nei colloqui, nominare "target encoding con smoothing e out-of-fold" per il problema dell'alta cardinalità è esattamente la risposta che cercano — insieme alla consapevolezza del leakage.</p>
` },

    {
      type: "exercise", id: "fe-12", kg: 15, title: "Codificare col target (senza barare)",
      task: `<p>Target encoding base della città: la conversione media per città. Calcola sul train, applica al test:</p>
<ul>
<li><code>medie_citta</code>: Series città &rarr; conversione media, calcolata sul SOLO train</li>
<li><code>media_globale</code>: la conversione media globale del train (fallback per città nuove)</li>
<li><code>test_enc</code>: la colonna città del test codificata (usa <code>map</code> + <code>fillna</code> con la media globale per le città non viste)</li>
</ul>`,
      setup: `import pandas as pd
train = pd.DataFrame({
    "citta": ["Roma", "Milano", "Roma", "Milano", "Napoli", "Roma"],
    "converte": [1, 0, 1, 0, 1, 0],
})
test = pd.DataFrame({"citta": ["Milano", "Torino"]})  # Torino non e' nel train`,
      starter: `import pandas as pd
# train: citta + converte (0/1) | test: solo citta, con una citta' nuova

medie_citta = ...
media_globale = ...
test_enc = ...

print("medie citta:\\n", medie_citta)
print("test encoded:", test_enc.tolist())`,
      check: `import pandas as pd
assert 'medie_citta' in globals() and abs(float(medie_citta["Roma"]) - 2/3) < 1e-9, "medie_citta: train.groupby('citta')['converte'].mean(), Roma = 2/3"
assert 'media_globale' in globals() and abs(float(media_globale) - 0.5) < 1e-9, "media_globale: train['converte'].mean() = 0.5"
assert 'test_enc' in globals(), "test_enc: test['citta'].map(medie_citta).fillna(media_globale)"
vals = list(test_enc)
assert abs(vals[0] - 0.0) < 1e-9, "Milano nel train converte 0/2 = 0.0"
assert abs(vals[1] - 0.5) < 1e-9, "Torino non e' nel train -> fillna con la media globale 0.5"`,
      hint: `<p><code>train.groupby("citta")["converte"].mean()</code> dà le medie. Poi <code>test["citta"].map(medie_citta).fillna(media_globale)</code>: il fillna gestisce le città sconosciute.</p>`,
      solution: `import pandas as pd

medie_citta = train.groupby("citta")["converte"].mean()
media_globale = train["converte"].mean()
test_enc = test["citta"].map(medie_citta).fillna(media_globale)

print("medie citta:\\n", medie_citta)
print("test encoded:", test_enc.tolist())`
    },

    {
      type: "exercise", id: "fe-13", kg: 20, title: "Lo smoothing salva le categorie rare",
      task: `<p>Il target encoding puro si fida troppo delle categorie con pochi esempi. Applica lo smoothing bayesiano:</p>
<ul>
<li><code>media_globale</code>: conversione media globale</li>
<li><code>stats</code>: per ogni città, conteggio <code>n</code> e media <code>media</code> (usa groupby con agg)</li>
<li><code>encoding</code>: dizionario città &rarr; valore smoothed con formula <code>(n*media + m*media_globale)/(n+m)</code>, con <code>m=10</code></li>
<li><code>rara_verso_globale</code>: <code>True</code> se l'encoding della città con 1 solo socio è più vicino alla media globale che alla sua media grezza</li>
</ul>`,
      setup: `import pandas as pd
df = pd.DataFrame({
    "citta": ["Roma"]*50 + ["Milano"]*40 + ["Lucca"]*1,
    "converte": [1]*35 + [0]*15 + [1]*10 + [0]*30 + [1]*1,
})`,
      starter: `import pandas as pd
m = 10   # forza dello smoothing (peso del prior)
# df: citta + converte. Lucca ha 1 solo socio, che converte (media grezza 1.0)

media_globale = ...
stats = df.groupby("citta")["converte"].agg(["count", "mean"])
stats.columns = ["n", "media"]

encoding = {}
for citta, row in stats.iterrows():
    encoding[citta] = ...

# Lucca: media grezza 1.0, ma con 1 solo socio non ci fidiamo
rara_verso_globale = abs(encoding["Lucca"] - media_globale) < abs(encoding["Lucca"] - 1.0)

print("encoding:", {k: round(v, 3) for k, v in encoding.items()})
print("media globale:", round(media_globale, 3))`,
      check: `import pandas as pd
_mg = df["converte"].mean()
_s = df.groupby("citta")["converte"].agg(["count", "mean"]); _s.columns = ["n","media"]
_exp = {c: (r["n"]*r["media"] + 10*_mg)/(r["n"]+10) for c, r in _s.iterrows()}
assert 'media_globale' in globals() and abs(float(media_globale) - _mg) < 1e-9, "media_globale: df['converte'].mean()"
assert 'encoding' in globals() and all(abs(encoding[c] - _exp[c]) < 1e-6 for c in _exp), "encoding: (n*media + m*media_globale)/(n+m) per ogni citta'"
assert 'rara_verso_globale' in globals() and rara_verso_globale == True, "rara_verso_globale: True — Lucca (1 socio) viene tirata verso la media globale, non verso il suo 1.0 inaffidabile"
assert abs(encoding["Roma"] - _exp["Roma"]) < 1e-6 and encoding["Roma"] > 0.6, "Roma (50 soci) resta vicina alla sua media vera: con tanti dati lo smoothing conta poco"`,
      hint: `<p>La formula pesa la media della categoria (fidata se n grande) contro la globale (prior): <code>(row["n"]*row["media"] + m*media_globale)/(row["n"]+m)</code>. Con n=1 e m=10, il prior domina.</p>`,
      solution: `import pandas as pd
m = 10

media_globale = df["converte"].mean()
stats = df.groupby("citta")["converte"].agg(["count", "mean"])
stats.columns = ["n", "media"]

encoding = {}
for citta, row in stats.iterrows():
    encoding[citta] = (row["n"] * row["media"] + m * media_globale) / (row["n"] + m)

rara_verso_globale = abs(encoding["Lucca"] - media_globale) < abs(encoding["Lucca"] - 1.0)

print("encoding:", {k: round(v, 3) for k, v in encoding.items()})
print("media globale:", round(media_globale, 3))`
    },

    { type: "theory", title: "Feature dai dati temporali e ciclici", html: `
<p>Una data grezza è inutile per un modello: <code>2026-07-15</code> non è un numero sensato. Ma da essa si estraggono feature ricchissime:</p>
<pre><code>df["giorno_settimana"] = df["data"].dt.dayofweek   # 0=lun ... 6=dom
df["mese"] = df["data"].dt.month
df["weekend"] = df["giorno_settimana"].isin([5, 6]).astype(int)
df["ore_da_ultimo_accesso"] = (adesso - df["ultimo_accesso"]).dt.total_seconds() / 3600</code></pre>
<p>Le feature temporali più predittive sono spesso <strong>differenze</strong> ("giorni dall'ultimo acquisto" batte "data dell'ultimo acquisto" per il churn) e <strong>aggregazioni in finestre</strong> (spesa media negli ultimi 30 giorni).</p>
<p>Attenzione ai cicli: il mese 12 (dicembre) e il mese 1 (gennaio) sono adiacenti, ma numericamente distano 11. Per le feature <strong>cicliche</strong> (ora del giorno, mese, giorno della settimana) si usa la codifica seno/coseno.</p>
`, more: `
<p>La codifica ciclica seno/coseno risolve un problema reale: <code>ora=23</code> e <code>ora=0</code> sono adiacenti nel tempo ma distanti 23 come numeri, e un modello lineare crede che mezzanotte sia "lontanissima" dalle 23. Mappando <code>sin(2&pi;&middot;ora/24)</code> e <code>cos(2&pi;&middot;ora/24)</code>, ogni ora diventa un punto su un cerchio: le 23 e le 0 finiscono vicine, la ciclicità è preservata. Servono DUE colonne (seno E coseno) perché una sola non basta a distinguere tutti i punti del cerchio — con il solo seno, le 6 e le 18 avrebbero lo stesso valore.</p>
<p>Il pericolo mortale delle feature temporali è il <strong>leakage dal futuro</strong>: costruire una feature che nella realtà non sarebbe disponibile al momento della predizione. "Spesa media del cliente" calcolata su TUTTO lo storico include acquisti FUTURI rispetto alla data che stai predicendo — in produzione non li avresti. Ogni aggregazione temporale va calcolata con una finestra che finisce PRIMA del momento predetto. È l'errore che fa sembrare un modello geniale in backtest e disastroso in produzione, e la validazione temporale (che vedrai nella sala Model Evaluation) esiste apposta per scovarlo.</p>
<p>Per gli alberi la codifica ciclica è meno critica (trovano soglie, "ora &gt; 22 OR ora &lt; 2" cattura la notte anche coi valori grezzi), ma le feature-differenza e le aggregazioni in finestra restano decisive per tutti i modelli: sono lì che vive quasi tutto il segnale predittivo nei problemi con una dimensione temporale.</p>
` },

    {
      type: "exercise", id: "fe-14", kg: 15, title: "Estrarre segnale dalle date",
      task: `<p>Da una colonna data, estrai feature utili con l'accessor <code>.dt</code>:</p>
<ul>
<li><code>df["giorno_sett"]</code>: giorno della settimana (0-6)</li>
<li><code>df["weekend"]</code>: 1 se sabato/domenica, 0 altrimenti (intero)</li>
<li><code>df["giorni_da_iscrizione"]</code>: giorni tra <code>data</code> e la data di iscrizione fissa 2026-01-01</li>
<li><code>n_weekend</code>: quanti accessi sono nel weekend</li>
</ul>`,
      setup: `import pandas as pd
df = pd.DataFrame({
    "data": pd.to_datetime(["2026-07-13", "2026-07-18", "2026-07-19", "2026-07-20", "2026-07-25"])
})`,
      starter: `import pandas as pd
iscrizione = pd.Timestamp("2026-01-01")
# df: colonna data (datetime)

df["giorno_sett"] = ...
df["weekend"] = ...
df["giorni_da_iscrizione"] = ...
n_weekend = ...

print(df)
print("accessi nel weekend:", n_weekend)`,
      check: `import pandas as pd
assert 'giorno_sett' in df.columns and df["giorno_sett"].tolist() == [0, 5, 6, 0, 5], "giorno_sett: df['data'].dt.dayofweek (0=lun)"
assert 'weekend' in df.columns and df["weekend"].tolist() == [0, 1, 1, 0, 1], "weekend: dt.dayofweek.isin([5,6]).astype(int)"
assert 'giorni_da_iscrizione' in df.columns and df["giorni_da_iscrizione"].iloc[0] == 193, "giorni_da_iscrizione: (df['data'] - iscrizione).dt.days"
assert 'n_weekend' in globals() and int(n_weekend) == 3, "n_weekend: df['weekend'].sum() = 3"`,
      hint: `<p>L'accessor <code>.dt</code> apre tutto: <code>.dt.dayofweek</code>, <code>.dt.month</code>. Il weekend: <code>.isin([5,6]).astype(int)</code>. La differenza tra date: <code>(df["data"] - iscrizione).dt.days</code>.</p>`,
      solution: `import pandas as pd
iscrizione = pd.Timestamp("2026-01-01")

df["giorno_sett"] = df["data"].dt.dayofweek
df["weekend"] = df["giorno_sett"].isin([5, 6]).astype(int)
df["giorni_da_iscrizione"] = (df["data"] - iscrizione).dt.days
n_weekend = df["weekend"].sum()

print(df)
print("accessi nel weekend:", n_weekend)`
    },

    {
      type: "exercise", id: "fe-15", kg: 15, title: "Il cerchio delle ore",
      task: `<p>L'ora del giorno è ciclica: le 23 e le 0 sono vicine. Codificala con seno/coseno:</p>
<ul>
<li><code>sin_ora</code>, <code>cos_ora</code>: <code>sin</code> e <code>cos</code> di <code>2*pi*ora/24</code></li>
<li><code>dist_23_0</code>: distanza euclidea nel piano (sin,cos) tra l'ora 23 e l'ora 0</li>
<li><code>dist_0_12</code>: distanza tra l'ora 0 e l'ora 12 (mezzogiorno, il punto opposto)</li>
<li><code>ciclico_funziona</code>: <code>True</code> se <code>dist_23_0</code> è molto minore di <code>dist_0_12</code> (23 e 0 vicine, 0 e 12 lontane)</li>
</ul>`,
      setup: `import numpy as np
ore = np.array([0, 6, 12, 18, 23])`,
      starter: `import numpy as np
# ore: array di ore (0-23)

sin_ora = ...
cos_ora = ...

# punti nel piano per ore specifiche
def punto(h):
    return np.array([np.sin(2*np.pi*h/24), np.cos(2*np.pi*h/24)])

dist_23_0 = np.linalg.norm(punto(23) - punto(0))
dist_0_12 = np.linalg.norm(punto(0) - punto(12))
ciclico_funziona = ...

print("sin:", np.round(sin_ora, 3))
print(f"dist(23,0)={dist_23_0:.3f} | dist(0,12)={dist_0_12:.3f}")`,
      check: `import numpy as np
assert 'sin_ora' in globals() and np.allclose(sin_ora, np.sin(2*np.pi*ore/24)), "sin_ora: np.sin(2*np.pi*ore/24)"
assert 'cos_ora' in globals() and np.allclose(cos_ora, np.cos(2*np.pi*ore/24)), "cos_ora: np.cos(2*np.pi*ore/24)"
assert 'ciclico_funziona' in globals() and ciclico_funziona == True, "ciclico_funziona: True — dist(23,0) circa 0.26 << dist(0,12) = 2.0. La ciclicita' e' preservata"`,
      hint: `<p>Le due colonne insieme mettono ogni ora su un cerchio unitario. La distanza tra 23 e 0 è piccola (adiacenti sul cerchio), tra 0 e 12 è il diametro (=2). <code>ciclico_funziona = dist_23_0 &lt; dist_0_12</code>.</p>`,
      solution: `import numpy as np

sin_ora = np.sin(2*np.pi*ore/24)
cos_ora = np.cos(2*np.pi*ore/24)

def punto(h):
    return np.array([np.sin(2*np.pi*h/24), np.cos(2*np.pi*h/24)])

dist_23_0 = np.linalg.norm(punto(23) - punto(0))
dist_0_12 = np.linalg.norm(punto(0) - punto(12))
ciclico_funziona = dist_23_0 < dist_0_12

print("sin:", np.round(sin_ora, 3))
print(f"dist(23,0)={dist_23_0:.3f} | dist(0,12)={dist_0_12:.3f}")`
    },

    { type: "theory", title: "Gestire i valori mancanti come feature", html: `
<p>I NaN non sono solo un fastidio da riempire: a volte il <em>fatto stesso</em> che un valore manchi porta informazione. Due strategie complementari:</p>
<pre><code>from sklearn.impute import SimpleImputer
# 1. Imputazione: riempi i buchi
imp = SimpleImputer(strategy="median")   # o "mean", "most_frequent", "constant"
X_imp = imp.fit_transform(X)             # fit sul train!

# 2. Flag di mancanza: una colonna che segna DOVE mancava
df["reddito_mancante"] = df["reddito"].isna().astype(int)</code></pre>
<p>La <strong>mediana</strong> è l'imputazione di default per le numeriche (robusta agli outlier, meglio della media); la <strong>moda</strong> (<code>most_frequent</code>) per le categoriche. Il <strong>flag di mancanza</strong> preserva il segnale: se chi non dichiara il reddito converte diversamente, il modello può usarlo.</p>
`, more: `
<p>Il tipo di "mancanza" cambia la strategia, ed è concetto da colloquio: MCAR (missing completely at random — il buco è puro caso, imputare è sicuro), MAR (missing at random — la mancanza dipende da ALTRE feature osservate, es. i giovani dichiarano meno il reddito: imputabile condizionando sulle altre colonne), MNAR (missing not at random — la mancanza dipende dal valore STESSO mancante, es. i redditi alti si nascondono: qui l'imputazione introduce bias e il flag di mancanza diventa cruciale). Riconoscere che "manca" può essere MNAR — cioè informativo — è ciò che separa un'imputazione ingenua da una consapevole.</p>
<p>L'imputazione con statistiche (media/mediana) va SEMPRE fittata sul solo train: la mediana usata per riempire il test è quella del train, altrimenti è leakage (il test "vede" la distribuzione di se stesso). Per questo <code>SimpleImputer</code> è un transformer con fit/transform separati e va in pipeline. Metodi più sofisticati: <code>KNNImputer</code> (riempie coi vicini più simili) e <code>IterativeImputer</code> (modella ogni colonna in funzione delle altre) — più potenti ma più lenti e più a rischio leakage se usati male.</p>
<p>Combinare imputazione + flag è spesso la mossa migliore: riempi il buco per non rompere il modello, MA aggiungi la colonna che dice "qui era vuoto", così non perdi il segnale della mancanza. Gli alberi moderni (HistGradientBoosting, XGBoost, LightGBM) gestiscono i NaN nativamente — imparano da soli in quale ramo mandare i mancanti — e lì l'imputazione manuale può addirittura peggiorare, cancellando informazione che il modello avrebbe sfruttato meglio da solo.</p>
` },

    {
      type: "exercise", id: "fe-16", kg: 15, title: "Il buco che parla",
      task: `<p>La colonna reddito ha dei NaN, e chi non lo dichiara si comporta diversamente. Imputa E segnala:</p>
<ul>
<li><code>df["reddito_mancante"]</code>: flag 1/0 di dove mancava (calcolalo PRIMA di imputare!)</li>
<li><code>mediana_train</code>: la mediana dei redditi NON mancanti</li>
<li><code>df["reddito"]</code>: la colonna con i NaN riempiti dalla mediana</li>
<li><code>n_imputati</code>: quanti valori sono stati riempiti</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
df = pd.DataFrame({
    "reddito": [25000, np.nan, 40000, 32000, np.nan, 55000, np.nan, 28000],
    "converte": [1, 0, 1, 1, 0, 1, 0, 1],
})`,
      starter: `import pandas as pd
import numpy as np
# df: reddito (con NaN) + converte

df["reddito_mancante"] = ...
n_imputati = ...
mediana_train = ...
df["reddito"] = ...

print(df)
print("imputati:", n_imputati, "| mediana usata:", mediana_train)`,
      check: `import pandas as pd
import numpy as np
assert 'reddito_mancante' in df.columns and df["reddito_mancante"].tolist() == [0,1,0,0,1,0,1,0], "reddito_mancante: df['reddito'].isna().astype(int), calcolato PRIMA di riempire"
assert 'n_imputati' in globals() and int(n_imputati) == 3, "n_imputati: 3 NaN"
assert 'mediana_train' in globals() and abs(float(mediana_train) - 32000) < 1e-6, "mediana_train: mediana dei 5 valori presenti (25000,40000,32000,55000,28000) = 32000"
assert df["reddito"].isna().sum() == 0, "df['reddito'] non deve avere piu' NaN"
assert (df.loc[[1,4,6], "reddito"] == 32000).all(), "i tre buchi devono contenere la mediana 32000"`,
      hint: `<p>Ordine cruciale: <code>isna()</code> PRIMA di riempire, altrimenti il flag sarebbe tutto 0. La mediana: <code>df["reddito"].median()</code> (ignora i NaN da sola). Poi <code>fillna(mediana_train)</code>.</p>`,
      solution: `import pandas as pd
import numpy as np

df["reddito_mancante"] = df["reddito"].isna().astype(int)
n_imputati = df["reddito"].isna().sum()
mediana_train = df["reddito"].median()
df["reddito"] = df["reddito"].fillna(mediana_train)

print(df)
print("imputati:", n_imputati, "| mediana usata:", mediana_train)`
    },

    { type: "theory", title: "Feature selection: meno è meglio", html: `
<p>Più feature non significa modello migliore: feature irrilevanti aggiungono rumore, overfitting e costo. La <strong>feature selection</strong> tiene solo ciò che serve. Tre famiglie:</p>
<p><strong>Filter</strong> (veloci, indipendenti dal modello): scarti feature per statistiche — bassa varianza, bassa correlazione col target.</p>
<pre><code>from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif
VarianceThreshold(threshold=0.0).fit_transform(X)   # via le costanti
SelectKBest(f_classif, k=5).fit_transform(X, y)      # le 5 piu' legate a y</code></pre>
<p><strong>Wrapper</strong> (usano un modello, più lenti): RFE elimina ricorsivamente le feature meno importanti. <strong>Embedded</strong>: il modello seleziona da sé (Lasso azzera coefficienti, gli alberi danno importanze).</p>
`, more: `
<p>La <strong>maledizione della dimensionalità</strong> è il perché profondo: in spazi ad alta dimensione i dati diventano sparsi, le distanze perdono significato (tutti i punti sembrano equidistanti), e servono esponenzialmente più esempi per coprire lo spazio. Ogni feature inutile peggiora questo, specialmente per i modelli basati su distanza. Ridurre le dimensioni non è solo pulizia: è ciò che rende alcuni modelli utilizzabili.</p>
<p>Trappola metodologica gravissima: fare feature selection su TUTTO il dataset prima della cross-validation. Se scegli le "migliori k feature" guardando anche i dati che poi userai per validare, quelle feature "vedono" la y di validazione — leakage, e la CV risulta ottimisticamente gonfiata. La selezione va fatta DENTRO ogni fold, sul solo train del fold. Questo vale doppio per <code>SelectKBest</code> con <code>f_classif</code> e per qualunque metodo che usi il target. La difesa pulita è mettere il selettore in <code>Pipeline</code>, così la CV lo rifitta correttamente ad ogni fold.</p>
<p>Un avvertimento sui metodi filter univariati (SelectKBest guarda una feature alla volta): possono scartare feature che da sole sembrano inutili ma diventano potenti IN COMBINAZIONE, e tenere feature ridondanti tra loro (due colonne quasi identiche, entrambe correlate col target, entrambe selezionate — ma una bastava). I metodi embedded (Lasso, importanze degli alberi) e la permutation importance (sala Explainability) valutano le feature nel contesto delle altre, e per questo spesso selezionano meglio. La regola pragmatica: parti dai filter per sfoltire il grosso a costo zero, poi affina con metodi model-based.</p>
` },

    {
      type: "exercise", id: "fe-17", kg: 15, title: "Via le colonne morte",
      task: `<p>Un dataset con una colonna costante (inutile) e una quasi-costante. Usa <code>VarianceThreshold</code>:</p>
<ul>
<li><code>sel</code>: un <code>VarianceThreshold(threshold=0.0)</code> (elimina solo le costanti pure)</li>
<li><code>X_sel</code>: i dati filtrati (fit_transform)</li>
<li><code>n_rimosse</code>: quante colonne sono state eliminate</li>
<li><code>mantenute</code>: gli indici delle colonne mantenute (<code>sel.get_support(indices=True)</code>)</li>
</ul>`,
      setup: `import numpy as np
# col 0: variabile | col 1: COSTANTE | col 2: variabile | col 3: COSTANTE
X = np.array([
    [1.0, 5, 10, 7],
    [2, 5, 8, 7],
    [3, 5, 15, 7],
    [4, 5, 12, 7],
])`,
      starter: `import numpy as np
from sklearn.feature_selection import VarianceThreshold
# X: 4 colonne, di cui 2 costanti (indici 1 e 3)

sel = ...
X_sel = ...
n_rimosse = X.shape[1] - X_sel.shape[1]
mantenute = ...

print("shape prima:", X.shape, "-> dopo:", X_sel.shape)
print("colonne mantenute:", mantenute.tolist())`,
      check: `import numpy as np
from sklearn.feature_selection import VarianceThreshold
assert 'X_sel' in globals() and X_sel.shape == (4, 2), "X_sel: devono restare 2 colonne (le variabili, indici 0 e 2)"
assert 'n_rimosse' in globals() and n_rimosse == 2, "n_rimosse: 2 colonne costanti eliminate"
assert 'mantenute' in globals() and list(mantenute) == [0, 2], "mantenute: get_support(indices=True) -> [0, 2]"`,
      hint: `<p>Le colonne costanti hanno varianza 0: <code>VarianceThreshold(threshold=0.0)</code> le elimina. <code>get_support(indices=True)</code> dà gli indici sopravvissuti.</p>`,
      solution: `import numpy as np
from sklearn.feature_selection import VarianceThreshold

sel = VarianceThreshold(threshold=0.0)
X_sel = sel.fit_transform(X)
n_rimosse = X.shape[1] - X_sel.shape[1]
mantenute = sel.get_support(indices=True)

print("shape prima:", X.shape, "-> dopo:", X_sel.shape)
print("colonne mantenute:", mantenute.tolist())`
    },

    {
      type: "exercise", id: "fe-18", kg: 20, title: "Le k feature che contano",
      task: `<p>Dataset con feature informative mescolate a rumore puro. Seleziona le migliori con <code>SelectKBest</code>:</p>
<ul>
<li><code>sel</code>: <code>SelectKBest(f_classif, k=3)</code></li>
<li><code>X_sel</code>: i dati ridotti alle 3 migliori feature (fit_transform con X e y)</li>
<li><code>scelte</code>: gli indici delle 3 feature scelte</li>
<li><code>ha_preso_informative</code>: <code>True</code> se le 3 scelte sono un sottoinsieme delle prime 3 colonne (quelle vere informative)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
n = 300
y = rng.integers(0, 2, size=n)
# prime 3 colonne informative (media diversa per classe), altre 5 rumore puro
f0 = y * 2.0 + rng.normal(0, 1, n)
f1 = y * 1.5 + rng.normal(0, 1, n)
f2 = y * 2.5 + rng.normal(0, 1, n)
noise = rng.normal(0, 1, (n, 5))
X = np.column_stack([f0, f1, f2, noise])`,
      starter: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
# X: 8 feature (prime 3 informative, 5 rumore) | y: target binario

sel = ...
X_sel = ...
scelte = sel.get_support(indices=True)
ha_preso_informative = ...

print("feature scelte:", scelte.tolist())`,
      check: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
assert 'X_sel' in globals() and X_sel.shape == (300, 3), "X_sel: 3 colonne selezionate"
assert 'scelte' in globals() and len(scelte) == 3, "scelte: 3 indici"
assert 'ha_preso_informative' in globals() and ha_preso_informative == True, "ha_preso_informative: True — le prime 3 colonne sono le vere informative, SelectKBest le ritrova"
assert set(scelte) <= {0, 1, 2}, "le feature scelte devono essere tra le prime 3 (le informative)"`,
      hint: `<p><code>SelectKBest(f_classif, k=3).fit_transform(X, y)</code>: il test F misura quanto ogni feature separa le classi. Le informative hanno F alto, il rumore F basso. <code>set(scelte) &lt;= {0,1,2}</code>.</p>`,
      solution: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif

sel = SelectKBest(f_classif, k=3)
X_sel = sel.fit_transform(X, y)
scelte = sel.get_support(indices=True)
ha_preso_informative = set(scelte) <= {0, 1, 2}

print("feature scelte:", scelte.tolist())`
    },

    {
      type: "exercise", id: "fe-19", kg: 20, title: "Lasso azzera il superfluo",
      task: `<p>La regolarizzazione L1 (Lasso) fa selezione da sé: azzera i coefficienti delle feature inutili. Verificalo:</p>
<ul>
<li><code>lasso</code>: un <code>Lasso(alpha=5.0)</code> addestrato su dati standardizzati</li>
<li><code>coef</code>: i coefficienti del modello</li>
<li><code>n_azzerati</code>: quanti coefficienti sono esattamente 0 (feature scartate)</li>
<li><code>solo_informative</code>: <code>True</code> se i coefficienti NON nulli sono solo tra le prime 3 colonne (le informative)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_regression
X, y = make_regression(n_samples=200, n_features=8, n_informative=3,
                        shuffle=False, noise=10, random_state=2)`,
      starter: `import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
# X: 8 feature (prime 3 informative) | y: target continuo

X_s = StandardScaler().fit_transform(X)

lasso = ...
coef = ...
n_azzerati = ...
non_nulli = np.where(np.abs(coef) > 1e-6)[0]
solo_informative = ...

print("coef:", np.round(coef, 2))
print("azzerati:", n_azzerati, "| non nulli agli indici:", non_nulli.tolist())`,
      check: `import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
_xs = StandardScaler().fit_transform(X)
_l = Lasso(alpha=5.0).fit(_xs, y)
assert 'lasso' in globals() and isinstance(lasso, Lasso), "lasso: Lasso(alpha=5.0).fit(X_s, y)"
assert 'coef' in globals() and np.allclose(coef, _l.coef_), "coef: lasso.coef_"
assert 'n_azzerati' in globals() and int(n_azzerati) >= 4, "n_azzerati: almeno le 5 feature rumore azzerate (>=4)"
assert 'solo_informative' in globals() and solo_informative == True, "solo_informative: True — Lasso tiene solo (parte del)le prime 3 informative"`,
      hint: `<p>Il Lasso va sui dati standardizzati (i coefficienti devono essere comparabili). <code>lasso.coef_</code> dà i pesi; conta gli zeri con <code>np.sum(np.abs(coef) &lt; 1e-6)</code>. <code>set(non_nulli) &lt;= {0,1,2}</code>.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler

X_s = StandardScaler().fit_transform(X)

lasso = Lasso(alpha=5.0).fit(X_s, y)
coef = lasso.coef_
n_azzerati = int(np.sum(np.abs(coef) < 1e-6))
non_nulli = np.where(np.abs(coef) > 1e-6)[0]
solo_informative = set(non_nulli) <= {0, 1, 2}

print("coef:", np.round(coef, 2))
print("azzerati:", n_azzerati, "| non nulli agli indici:", non_nulli.tolist())`
    },

    { type: "theory", title: "Il ColumnTransformer: tutto insieme, senza leakage", html: `
<p>Un dataset reale mescola colonne numeriche e categoriche, ognuna con la sua trasformazione. Farle a mano è fragile e a rischio leakage. Il <strong>ColumnTransformer</strong> applica trasformazioni diverse a gruppi di colonne diversi, in un solo oggetto fittabile.</p>
<pre><code>from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

pre = ColumnTransformer([
    ("num", StandardScaler(), ["eta", "reddito"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["citta", "livello"]),
])
modello = Pipeline([("pre", pre), ("clf", LogisticRegression())])
modello.fit(X_train, y_train)   # tutto fittato sul solo train, in un colpo</code></pre>
<p>Il vantaggio decisivo: <strong>un solo fit</strong> impara scaler, encoder e modello sul train; un solo <code>transform</code>/<code>predict</code> li applica coerentemente. In cross-validation ogni fold rifitta tutto correttamente — zero leakage, zero codice duplicato.</p>
`, more: `
<p>Il ColumnTransformer + Pipeline è la forma <strong>professionale</strong> del preprocessing, ed è ciò che distingue codice da notebook-usa-e-getta da codice di produzione. I benefici concreti: (1) niente leakage per costruzione — impossibile "dimenticare" di fittare solo sul train, perché la pipeline lo impone; (2) un solo artefatto da serializzare e deployare (l'intera catena preprocessing+modello in un <code>joblib.dump</code>), invece di ricostruire a mano le stesse trasformazioni in produzione con il rischio di divergenze train/serving (il famigerato training-serving skew); (3) grid search sugli iperparametri del preprocessing E del modello insieme.</p>
<p>Il parametro <code>remainder</code> controlla le colonne non menzionate: <code>'drop'</code> (default, le scarta) o <code>'passthrough'</code> (le lascia intatte). Dimenticarlo è un errore comune: colonne che pensavi incluse spariscono silenziosamente. Con <code>make_column_selector</code> puoi anche selezionare le colonne per tipo (<code>dtype_include=np.number</code>) invece che per nome — utile quando le colonne cambiano.</p>
<p>Questo chiude il cerchio del principio ripetuto per tutta la sala: <strong>ogni trasformazione che impara dai dati deve imparare dal solo train</strong>. Scaling, imputazione, encoding, target encoding, feature selection — tutte hanno un fit che va isolato dal test. Il ColumnTransformer dentro una Pipeline non è solo comodità: è la garanzia strutturale che il principio venga rispettato ovunque, anche dentro ogni fold di ogni cross-validation. È la risposta giusta a "come organizzeresti il preprocessing di un progetto ML serio?".</p>
` },

    {
      type: "exercise", id: "fe-20", kg: 20, title: "Numeriche e categoriche, in un colpo",
      task: `<p>Costruisci un ColumnTransformer che scala le numeriche e fa one-hot delle categoriche:</p>
<ul>
<li><code>pre</code>: un <code>ColumnTransformer</code> con StandardScaler su ["eta","reddito"] e OneHotEncoder(handle_unknown="ignore") su ["citta"]</li>
<li><code>X_train_t</code>: il train trasformato (fit_transform)</li>
<li><code>X_test_t</code>: il test trasformato (solo transform — il test ha una città nuova)</li>
<li><code>stesse_colonne</code>: <code>True</code> se train e test trasformati hanno lo stesso numero di colonne</li>
</ul>`,
      setup: `import pandas as pd
X_train = pd.DataFrame({
    "eta": [25, 40, 55, 30], "reddito": [22000, 35000, 60000, 28000],
    "citta": ["Roma", "Milano", "Roma", "Milano"],
})
X_test = pd.DataFrame({
    "eta": [35, 60], "reddito": [40000, 70000],
    "citta": ["Milano", "Napoli"],
})`,
      starter: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
# X_train, X_test: DataFrame con eta, reddito (num) e citta (cat)

pre = ColumnTransformer([
    ("num", ..., ["eta", "reddito"]),
    ("cat", ..., ["citta"]),
])
X_train_t = ...
X_test_t = ...
stesse_colonne = ...

print("train shape:", X_train_t.shape, "| test shape:", X_test_t.shape)`,
      check: `import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
assert 'pre' in globals() and isinstance(pre, ColumnTransformer), "pre: ColumnTransformer([...])"
assert 'X_train_t' in globals() and np.asarray(X_train_t).shape[0] == 4, "X_train_t: 4 righe (fit_transform sul train)"
assert 'X_test_t' in globals() and np.asarray(X_test_t).shape[0] == 2, "X_test_t: 2 righe (solo transform)"
assert 'stesse_colonne' in globals() and stesse_colonne == True, "stesse_colonne: True — grazie a handle_unknown='ignore', Napoli (nuova) non aggiunge colonne: train e test hanno la stessa forma"
assert np.asarray(X_train_t).shape[1] == np.asarray(X_test_t).shape[1], "il numero di colonne deve coincidere tra train e test"`,
      hint: `<p>Riempi i due transformer: <code>StandardScaler()</code> per le numeriche, <code>OneHotEncoder(handle_unknown="ignore")</code> per la città. Poi <code>pre.fit_transform(X_train)</code> e <code>pre.transform(X_test)</code>. Il confronto colonne: <code>X_train_t.shape[1] == X_test_t.shape[1]</code>.</p>`,
      solution: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

pre = ColumnTransformer([
    ("num", StandardScaler(), ["eta", "reddito"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["citta"]),
])
X_train_t = pre.fit_transform(X_train)
X_test_t = pre.transform(X_test)
stesse_colonne = X_train_t.shape[1] == X_test_t.shape[1]

print("train shape:", X_train_t.shape, "| test shape:", X_test_t.shape)`
    },

    {
      type: "exercise", id: "fe-21", kg: 20, title: "La pipeline completa che non bara",
      task: `<p>Incapsula preprocessing e modello in una Pipeline, e verifica che non ci sia leakage confrontando l'accuratezza train vs test:</p>
<ul>
<li><code>modello</code>: una <code>Pipeline</code> con il <code>ColumnTransformer</code> (già dato) + <code>LogisticRegression(max_iter=1000)</code></li>
<li><code>acc_train</code>, <code>acc_test</code>: accuratezza su train e test</li>
<li><code>un_solo_fit</code>: <code>True</code> — con la pipeline basta un <code>fit</code> per addestrare tutto (booleano concettuale)</li>
</ul>`,
      setup: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
import numpy as np
rng = np.random.default_rng(9)
n = 300
df = pd.DataFrame({
    "eta": rng.integers(18, 70, n),
    "reddito": rng.integers(15000, 80000, n),
    "citta": rng.choice(["Roma", "Milano", "Napoli", "Torino"], n),
})
# target: dipende da eta e reddito
prob = 1/(1+np.exp(-(0.05*(df["eta"]-40) + 0.00003*(df["reddito"]-40000))))
df["converte"] = (rng.random(n) < prob).astype(int)
Xtr, Xte, ytr, yte = train_test_split(df.drop(columns="converte"), df["converte"], test_size=0.3, random_state=0)
pre = ColumnTransformer([
    ("num", StandardScaler(), ["eta", "reddito"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["citta"]),
])`,
      starter: `import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
# Xtr, Xte, ytr, yte, pre: gia' pronti

modello = Pipeline([
    ("pre", pre),
    ("clf", ...),
])
modello.fit(Xtr, ytr)

acc_train = ...
acc_test = ...
un_solo_fit = ...

print(f"accuratezza train {acc_train:.3f} | test {acc_test:.3f}")`,
      check: `import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
assert 'modello' in globals() and isinstance(modello, Pipeline), "modello: Pipeline([('pre', pre), ('clf', LogisticRegression(...))])"
assert 'acc_train' in globals() and 'acc_test' in globals(), "acc_train/acc_test: modello.score(...)"
assert float(acc_test) > 0.55, "acc_test: il modello deve funzionare (> 0.55)"
assert 'un_solo_fit' in globals() and un_solo_fit == True, "un_solo_fit: True — la pipeline fitta preprocessing e modello insieme, sul solo train"`,
      hint: `<p>Il classificatore: <code>LogisticRegression(max_iter=1000)</code>. Il <code>.score()</code> di una pipeline applica tutto il preprocessing prima di valutare: <code>modello.score(Xte, yte)</code>.</p>`,
      solution: `import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

modello = Pipeline([
    ("pre", pre),
    ("clf", LogisticRegression(max_iter=1000)),
])
modello.fit(Xtr, ytr)

acc_train = modello.score(Xtr, ytr)
acc_test = modello.score(Xte, yte)
un_solo_fit = True

print(f"accuratezza train {acc_train:.3f} | test {acc_test:.3f}")`
    },

    {
      type: "exercise", id: "fe-22", kg: 15, title: "Quiz: leakage o no?",
      task: `<p>Cinque situazioni. Per ognuna, <code>True</code> se c'è data leakage, <code>False</code> se è corretto:</p>
<ul>
<li><code>s1</code>: "Standardizzo tutto il dataset, POI faccio train/test split"</li>
<li><code>s2</code>: "Fitto lo scaler sul train, lo applico al test"</li>
<li><code>s3</code>: "Calcolo la mediana per l'imputazione su train+test insieme"</li>
<li><code>s4</code>: "Faccio SelectKBest su tutti i dati, poi cross-validation"</li>
<li><code>s5</code>: "Metto scaler e modello in una Pipeline e faccio cross_val_score"</li>
</ul>`,
      starter: `s1 = ...
s2 = ...
s3 = ...
s4 = ...
s5 = ...

print(s1, s2, s3, s4, s5)`,
      check: `assert s1 == True, "s1 LEAKAGE: scalare prima dello split fa vedere al train le statistiche del test"
assert s2 == False, "s2 CORRETTO: fit sul train, transform sul test — la regola d'oro"
assert s3 == True, "s3 LEAKAGE: la mediana calcolata anche sul test fa trapelare info dal test"
assert s4 == True, "s4 LEAKAGE: selezionare le feature guardando tutti i dati contamina i fold di validazione"
assert s5 == False, "s5 CORRETTO: la pipeline rifitta scaler e modello dentro ogni fold, sul solo train del fold"`,
      hint: `<p>Il filo conduttore: qualunque cosa "impari" (media, mediana, categorie, feature migliori) deve vedere SOLO il train. Se vede anche il test/validation, è leakage. La Pipeline lo garantisce automaticamente.</p>`,
      solution: `s1 = True
s2 = False
s3 = True
s4 = True
s5 = False

print(s1, s2, s3, s4, s5)`
    },

    { type: "theory", title: "Feature importance: quali contano davvero", html: `
<p>Dopo aver costruito le feature, quali il modello usa davvero? I modelli ad alberi danno un'<strong>importanza</strong> nativa per ogni feature, basata su quanto quella feature riduce l'errore negli split.</p>
<pre><code>from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier().fit(X, y)
rf.feature_importances_   # un peso per feature, sommano a 1</code></pre>
<p>Utile per capire il modello, comunicare ai non-tecnici ("il reddito conta più dell'età"), e fare selezione. Ma l'importanza da impurità ha un difetto noto: <strong>gonfia le feature ad alta cardinalità</strong> (molti valori distinti offrono più punti di split). Per una misura più affidabile c'è la <em>permutation importance</em>, che vedrai in dettaglio nella sala Explainability.</p>
`, more: `
<p>Il difetto dell'importanza da impurità (impurity-based / Gini importance) è concreto e va conosciuto: privilegia sistematicamente le feature continue e ad alta cardinalità, perché offrono più soglie candidate su cui splittare, anche quando il loro valore predittivo reale è basso. Una colonna di ID casuali (inutile per definizione) può ricevere importanza non trascurabile solo perché ha tanti valori distinti. Per questo l'importanza da impurità è indicativa, non definitiva, e non va usata da sola per decisioni importanti.</p>
<p>Le alternative più affidabili: la <strong>permutation importance</strong> (mescoli i valori di una feature e misuri quanto peggiora il modello — se non peggiora, la feature non serviva davvero) e i valori <strong>SHAP</strong> (che attribuiscono a ogni feature il suo contributo su ogni singola predizione, con solide basi teoriche). Entrambe sono il cuore della sala Explainability. Punto cruciale: la permutation importance va calcolata sul TEST set, non sul train — l'importanza sul train misura quanto il modello si è aggrappato a una feature per memorizzare, non quanto quella feature generalizza.</p>
<p>Avvertimento che chiude la sala e la collega alla lavagna su correlazione/causalità: <strong>feature importance NON è importanza causale</strong>. Dice quali feature il modello USA per predire, non su quali feature INTERVENIRE cambierebbe l'outcome. Un modello può dare altissima importanza a una feature che è solo un proxy di una causa nascosta (le vendite di gelato "importanti" per predire gli annegamenti). Usare le feature importance come lista di leve d'azione — "il modello dice che X conta, quindi cambiamo X" — è l'errore che trasforma un buon modello predittivo in decisioni sbagliate. Predire e intervenire restano due mestieri diversi.</p>
` },

    {
      type: "exercise", id: "fe-23", kg: 15, title: "Chi guida le previsioni",
      task: `<p>Addestra una Random Forest e leggi le importanze delle feature:</p>
<ul>
<li><code>rf</code>: <code>RandomForestClassifier(random_state=0)</code> addestrato</li>
<li><code>importanze</code>: l'array <code>feature_importances_</code></li>
<li><code>somma</code>: la somma delle importanze (deve essere ~1)</li>
<li><code>top_feature</code>: l'indice della feature più importante</li>
<li><code>top_tra_informative</code>: <code>True</code> se la top feature è tra le prime 3 (le vere informative)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=400, n_features=6, n_informative=3,
                            n_redundant=0, shuffle=False, random_state=3)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X: 6 feature (prime 3 informative) | y: target binario

rf = ...
importanze = ...
somma = ...
top_feature = ...
top_tra_informative = ...

print("importanze:", np.round(importanze, 3))
print("somma:", round(somma, 3), "| top:", top_feature)`,
      check: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
assert 'rf' in globals() and isinstance(rf, RandomForestClassifier), "rf: RandomForestClassifier(random_state=0).fit(X, y)"
assert 'importanze' in globals() and len(importanze) == 6, "importanze: rf.feature_importances_, una per feature"
assert 'somma' in globals() and abs(float(somma) - 1.0) < 1e-6, "somma: le importanze sommano sempre a 1"
assert 'top_feature' in globals() and top_tra_informative == True, "top_tra_informative: True — la feature piu' importante e' tra le prime 3 informative"`,
      hint: `<p><code>rf.feature_importances_</code> somma a 1. Per la top: <code>np.argmax(importanze)</code>. <code>top_tra_informative = top_feature in [0,1,2]</code>.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(random_state=0).fit(X, y)
importanze = rf.feature_importances_
somma = importanze.sum()
top_feature = int(np.argmax(importanze))
top_tra_informative = top_feature in [0, 1, 2]

print("importanze:", np.round(importanze, 3))
print("somma:", round(somma, 3), "| top:", top_feature)`
    },

    {
      type: "exercise", id: "fe-24", kg: 20, title: "L'ID che inganna Gini",
      task: `<p>Dimostra il difetto dell'importanza da impurità: una colonna di ID casuali (inutile ma ad alta cardinalità) può rubare importanza. Aggiungi una colonna di rumore continuo ad alta cardinalità:</p>
<ul>
<li><code>X_esteso</code>: X con in più una colonna di valori casuali continui (usa <code>rng.random</code>, quindi tutti distinti)</li>
<li><code>rf</code>: RandomForest addestrata su <code>X_esteso</code></li>
<li><code>imp_rumore</code>: l'importanza assegnata alla colonna rumore (l'ultima)</li>
<li><code>rumore_non_zero</code>: <code>True</code> se il rumore riceve importanza NON trascurabile (&gt; 0.02) pur essendo inutile</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=400, n_features=5, n_informative=3,
                            n_redundant=0, shuffle=False, random_state=4)
rng = np.random.default_rng(4)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X: 5 feature | rng: generatore pronto

rumore = rng.random(X.shape[0]).reshape(-1, 1)   # valori tutti distinti, zero segnale
X_esteso = ...

rf = RandomForestClassifier(random_state=0).fit(X_esteso, y)
imp_rumore = ...   # importanza dell'ultima colonna
rumore_non_zero = ...

print("importanze:", np.round(rf.feature_importances_, 3))
print("importanza del rumore:", round(imp_rumore, 3))`,
      check: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
_r = np.random.default_rng(4).random(X.shape[0]).reshape(-1,1)
_xe = np.column_stack([X, _r])
_rf = RandomForestClassifier(random_state=0).fit(_xe, y)
assert 'X_esteso' in globals() and np.asarray(X_esteso).shape == (400, 6), "X_esteso: np.column_stack([X, rumore]), 6 colonne"
assert 'imp_rumore' in globals() and abs(float(imp_rumore) - _rf.feature_importances_[-1]) < 1e-6, "imp_rumore: rf.feature_importances_[-1]"
assert 'rumore_non_zero' in globals() and rumore_non_zero == True, "rumore_non_zero: True — pur essendo puro rumore, l'alta cardinalita' gli fa rubare importanza. E' il difetto dell'importanza da impurita'"`,
      hint: `<p>Il rumore continuo ha 400 valori distinti = tanti punti di split = importanza gonfiata, anche se non predice nulla. È esattamente il difetto della lavagna. <code>rumore_non_zero = imp_rumore &gt; 0.02</code>.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rumore = rng.random(X.shape[0]).reshape(-1, 1)
X_esteso = np.column_stack([X, rumore])

rf = RandomForestClassifier(random_state=0).fit(X_esteso, y)
imp_rumore = rf.feature_importances_[-1]
rumore_non_zero = imp_rumore > 0.02

print("importanze:", np.round(rf.feature_importances_, 3))
print("importanza del rumore:", round(imp_rumore, 3))`
    },

    {
      type: "exercise", id: "fe-25", kg: 25, title: "MASSIMALE: dal grezzo al modello",
      task: `<p>Il gran finale: un dataset grezzo realistico con numeriche storte, categoriche, NaN e feature temporali. Costruisci l'intera catena di feature engineering e valuta:</p>
<ul>
<li><code>df["reddito_mancante"]</code>: flag dei NaN nel reddito (PRIMA di imputare)</li>
<li><code>df["giorni_iscritto"]</code>: giorni tra <code>ultimo_accesso</code> e <code>iscrizione</code> (2026-01-01)</li>
<li><code>pre</code>: ColumnTransformer con: StandardScaler+SimpleImputer(mediana) sulle numeriche ["reddito","giorni_iscritto","reddito_mancante"], OneHotEncoder(handle_unknown="ignore") su ["citta"]</li>
<li><code>modello</code>: Pipeline(pre + LogisticRegression(max_iter=1000)), valutato con <code>cross_val_score</code> (cv=5)</li>
<li><code>acc_media</code>: accuratezza media in CV</li>
<li><code>funziona</code>: <code>True</code> se acc_media &gt; 0.6</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(42)
n = 400
reddito = rng.lognormal(10.3, 0.5, n)
reddito[rng.random(n) < 0.15] = np.nan   # 15% mancanti
df = pd.DataFrame({
    "reddito": reddito,
    "citta": rng.choice(["Roma", "Milano", "Napoli", "Torino", "Bari"], n),
    "ultimo_accesso": pd.to_datetime("2026-01-01") + pd.to_timedelta(rng.integers(0, 200, n), unit="D"),
})
prob = 1/(1+np.exp(-(0.000015*(np.nan_to_num(reddito, nan=30000)-35000)
                     - 0.01*((df["ultimo_accesso"]-pd.Timestamp("2026-01-01")).dt.days - 100))))
df["converte"] = (rng.random(n) < prob).astype(int)`,
      starter: `import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
# df: reddito(NaN), citta, ultimo_accesso, converte

iscrizione = pd.Timestamp("2026-01-01")
df["reddito_mancante"] = ...
df["giorni_iscritto"] = ...

y = df["converte"]
X = df[["reddito", "giorni_iscritto", "reddito_mancante", "citta"]]

num = ["reddito", "giorni_iscritto", "reddito_mancante"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["citta"]),
])

modello = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
acc_media = ...
funziona = ...

print(f"accuratezza media CV: {acc_media:.3f} | funziona: {funziona}")`,
      check: `import pandas as pd
import numpy as np
assert 'reddito_mancante' in df.columns and df["reddito_mancante"].sum() > 0, "reddito_mancante: df['reddito'].isna().astype(int)"
assert 'giorni_iscritto' in df.columns and df["giorni_iscritto"].min() >= 0, "giorni_iscritto: (df['ultimo_accesso'] - iscrizione).dt.days"
assert 'acc_media' in globals() and float(acc_media) > 0.6, "acc_media: cross_val_score(modello, X, y, cv=5).mean() — deve superare 0.6"
assert 'funziona' in globals() and funziona == True, "funziona: True"`,
      hint: `<p>Il flag: <code>df["reddito"].isna().astype(int)</code>. I giorni: <code>(df["ultimo_accesso"] - iscrizione).dt.days</code>. L'accuratezza: <code>cross_val_score(modello, X, y, cv=5).mean()</code>. Nota il SimpleImputer annidato nella pipeline numerica: imputa PRIMA di scalare, tutto senza leakage.</p>`,
      solution: `import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

iscrizione = pd.Timestamp("2026-01-01")
df["reddito_mancante"] = df["reddito"].isna().astype(int)
df["giorni_iscritto"] = (df["ultimo_accesso"] - iscrizione).dt.days

y = df["converte"]
X = df[["reddito", "giorni_iscritto", "reddito_mancante", "citta"]]

num = ["reddito", "giorni_iscritto", "reddito_mancante"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["citta"]),
])

modello = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
acc_media = cross_val_score(modello, X, y, cv=5).mean()
funziona = acc_media > 0.6

print(f"accuratezza media CV: {acc_media:.3f} | funziona: {funziona}")`
    }

  ]
});
