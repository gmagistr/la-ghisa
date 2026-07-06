window.MODULES.push({
  id: "sklearn-2",
  name: "Scikit-learn · Avanzato",
  tagline: "L'angolo powerlifting: pipeline, cross-validation, ensemble. Tecnica da gara, zero autoinganni.",
  intro: "Qui si impara a non barare senza volerlo: scalare i dati nel modo giusto, validare sul serio, riconoscere l'overfitting. E si scoprono i modelli che vincono le gare vere.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Standardizzare — senza farsi sfuggire il test", html: `
<p>Nel massimale scorso il KNN è crollato per colpa delle scale. La cura è lo <code>StandardScaler</code>: ogni feature diventa media 0, deviazione 1 (lo z-score che hai già fatto a mano in NumPy). Ma c'è una trappola famosa, il <strong>data leakage</strong>:</p>
<pre><code>from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)  # impara media/std DAL SOLO TRAIN
X_test_s  = scaler.transform(X_test)       # applica al test le statistiche del train</code></pre>
<p>Se fai <code>fit</code> su tutti i dati prima dello split, le statistiche del test "sporcano" il training: valutazione gonfiata e invisibile. Regola assoluta: <strong>fit sul train, transform sul test</strong>. Sempre.</p>
`, more: `
<p><code>fit_transform</code> non è una comodità sintattica ma la composizione di due passi distinti: <code>fit</code> (calcola media e deviazione standard dal train) seguito da <code>transform</code> (applica quella trasformazione). Chiamare <code>scaler.fit_transform(X_test)</code> per errore rifarebbe il <code>fit</code> sul test — le statistiche calcolate sarebbero quelle SBAGLIATE (del test, non del train), ed è esattamente l'errore che il controllo "la media di X_test_s non è zero" (visto in un esercizio di questa sala) serve a scovare.</p>
<p>Oltre allo <code>StandardScaler</code> (media 0, std 1), scikit-learn offre altri scaler per casi diversi: <code>MinMaxScaler</code> comprime ogni feature in un intervallo fisso (tipicamente [0,1]) — utile quando serve un range noto a priori, ad esempio per reti neurali con funzioni di attivazione sensibili alla scala; <code>RobustScaler</code> usa mediana e IQR invece di media e deviazione standard, rendendolo meno sensibile agli outlier (uno z-score classico può essere gonfiato da un singolo valore estremo, la mediana molto meno).</p>
<p>Il data leakage descritto qui è solo un caso specifico di un problema più generale: QUALSIASI informazione che passa dal test al training prima della valutazione finale invalida il test come misura onesta. Altri esempi meno ovvi: scegliere le feature guardando la correlazione con y su TUTTO il dataset (non solo il train) prima di splittare, o fare imputazione dei NaN con statistiche calcolate sull'intero dataset invece che sul solo train — stessa famiglia di errore, stessa cura.</p>
` },

    {
      type: "exercise", id: "sk2-01", kg: 15, title: "La rivincita del KNN",
      task: `<p>Stesso wine, stesso split, stesso KNN del massimale scorso — ma stavolta standardizzi (bene):</p>
<ul>
<li><code>X_train_s</code>, <code>X_test_s</code>: standardizzati con la disciplina giusta (fit_transform sul train, transform sul test)</li>
<li><code>acc_prima</code>: KNN(5) sui dati grezzi</li>
<li><code>acc_dopo</code>: KNN(5) sui dati standardizzati</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

acc_prima = ...

scaler = ...
X_train_s = ...
X_test_s = ...

acc_dopo = ...

print(f"grezzo: {acc_prima:.3f} → standardizzato: {acc_dopo:.3f}")`,
      check: `import numpy as np
assert 'X_train_s' in globals() and abs(float(X_train_s.mean())) < 0.1 and abs(float(X_train_s.std()) - 1.0) < 0.1, "X_train_s deve avere media ~0 e std ~1: scaler.fit_transform(X_train)"
assert 'X_test_s' in globals() and abs(float(X_test_s.mean())) > 1e-6, "X_test_s: scaler.transform(X_test) — NON fit_transform! La sua media non sara' esattamente 0, ed e' giusto cosi'"
assert 'acc_prima' in globals() and 'acc_dopo' in globals() and float(acc_dopo) > float(acc_prima) + 0.1, "acc_dopo deve superare nettamente acc_prima: con le scale sistemate il KNN vede finalmente tutte le feature"
assert float(acc_dopo) > 0.9, "Il KNN standardizzato su wine deve superare 0.9"`,
      hint: `<p>Se <code>X_test_s.mean()</code> viene esattamente 0, hai fatto <code>fit_transform</code> anche sul test: è il leakage di cui parlava la lavagna. Il test si trasforma con le statistiche del <em>train</em>.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

acc_prima = KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train).score(X_test, y_test)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

acc_dopo = KNeighborsClassifier(n_neighbors=5).fit(X_train_s, y_train).score(X_test_s, y_test)

print(f"grezzo: {acc_prima:.3f} → standardizzato: {acc_dopo:.3f}")`
    },

    { type: "theory", title: "Pipeline: la sequenza che non sbaglia mai l'ordine", html: `
<p>Scaler + modello = due oggetti da tenere sincronizzati, due occasioni di leakage. La <code>Pipeline</code> li salda in un unico estimatore che fa tutto nell'ordine giusto, automaticamente:</p>
<pre><code>from sklearn.pipeline import make_pipeline
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)     # fit dello scaler sul train + fit del KNN sui dati scalati
pipe.score(X_test, y_test)     # transform del test + valutazione: zero leakage possibile</code></pre>
<p>La pipeline si usa <em>come un modello qualsiasi</em>: fit, predict, score. È la forma professionale di default: quando vedi preprocessing fatto a mano fuori da una pipeline, in produzione, qualcuno prima o poi lo sbaglia.</p>
`, more: `
<p><code>make_pipeline</code> assegna automaticamente un nome a ogni passo (in minuscolo, dal nome della classe: <code>StandardScaler()</code> diventa <code>"standardscaler"</code>). La classe <code>Pipeline</code> (senza "make_") richiede invece di specificare i nomi esplicitamente: <code>Pipeline([("scaler", StandardScaler()), ("knn", KNeighborsClassifier())])</code> — utile quando vuoi nomi più leggibili o quando due passi dello stesso tipo richiedono nomi diversi per distinguerli.</p>
<p>Una pipeline può avere QUANTI passi vuoi prima del modello finale: <code>make_pipeline(SimpleImputer(), StandardScaler(), PCA(n_components=5), SVC())</code> incatena imputazione dei NaN, standardizzazione, riduzione dimensionale e classificazione in un unico oggetto — ognuno di questi passi viene addestrato SOLO sul train e applicato coerentemente al test, con zero rischio di far leakare informazione tra i due.</p>
<p>Un vantaggio pratico della pipeline spesso sottovalutato: si salva e si ricarica come un SINGOLO oggetto (con <code>pickle</code> o <code>joblib</code>). In produzione, questo significa che il preprocessing e il modello viaggiano sempre insieme, sincronizzati — non c'è modo di caricare per errore un modello con uno scaler diverso da quello con cui è stato addestrato, un rischio concreto quando scaler e modello vengono salvati come file separati.</p>
` },

    {
      type: "exercise", id: "sk2-02", kg: 20, title: "Salda la catena",
      task: `<p>Rifai l'esercizio precedente in forma professionale:</p>
<ul>
<li><code>pipe</code>: una pipeline <code>StandardScaler → KNeighborsClassifier(n_neighbors=5)</code>, addestrata sul train</li>
<li><code>acc_pipe</code>: lo score sul test</li>
<li><code>pred_primi3</code>: le previsioni della pipeline per le prime 3 righe di <code>X_test</code> (nota: passi i dati <strong>grezzi</strong>, ci pensa lei a scalarli)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

pipe = ...

acc_pipe = ...
pred_primi3 = ...

print(acc_pipe)
print(pred_primi3)`,
      check: `import numpy as np
from sklearn.pipeline import Pipeline
assert 'pipe' in globals() and isinstance(pipe, Pipeline), "pipe: make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))"
assert 'acc_pipe' in globals() and float(acc_pipe) > 0.9, "acc_pipe: pipe.score(X_test, y_test) — come il KNN standardizzato a mano, ma senza rischio di errori"
assert 'pred_primi3' in globals() and len(pred_primi3) == 3, "pred_primi3: pipe.predict(X_test[:3]) — dati grezzi, la pipeline scala da sola"`,
      hint: `<p>Una riga: <code>make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_train, y_train)</code>. Poi usala come un modello normale.</p>`,
      solution: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)

acc_pipe = float(pipe.score(X_test, y_test))
pred_primi3 = pipe.predict(X_test[:3])

print(acc_pipe)
print(pred_primi3)`
    },

    { type: "theory", title: "Cross-validation: non fidarti di un solo split", html: `
<p>Un singolo train/test split è una lotteria: con uno split fortunato il modello sembra un campione, con uno sfortunato un brocco. La <strong>k-fold cross-validation</strong> divide i dati in k fette e fa k esperimenti, usando ogni fetta una volta come test:</p>
<pre><code>from sklearn.model_selection import cross_val_score
scores = cross_val_score(pipe, X, y, cv=5)   # 5 esperimenti → 5 punteggi
scores.mean()   # la stima onesta
scores.std()    # quanto balla da split a split</code></pre>
<p>Nota che si passa <strong>tutto X e y</strong>: è la CV a fare gli split. E si passa la <em>pipeline</em>, così lo scaling viene rifatto dentro ogni fold — un altro leakage evitato gratis. Riporta sempre media <em>e</em> deviazione: "0.95 ± 0.03" dice molto più di "0.95".</p>
`, more: `
<p>Il parametro <code>cv=5</code> è il valore più comune ma non l'unico: <code>cv=10</code> dà una stima più stabile (più fold, meno varianza nella media) al costo di più tempo di calcolo; per dataset molto piccoli, <code>cv=</code> il numero di righe stesso (detto <em>leave-one-out</em>) usa ogni singola osservazione come test una volta — costosissimo ma a volte l'unica opzione sensata con pochissimi dati.</p>
<p>Per la classificazione, <code>cross_val_score</code> usa di default una variante detta <strong>StratifiedKFold</strong>: ogni fold rispetta le proporzioni tra le classi del dataset originale, lo stesso concetto di <code>stratify=y</code> visto nel train/test split — ma applicato automaticamente a ciascuno dei k fold, non solo a un singolo split.</p>
<p>Quando il gap tra fold è ampio (una deviazione standard alta), è un segnale che il modello è instabile rispetto a QUALE porzione di dati vede — spesso sintomo di training set troppo piccolo, o di outlier che finiscono per caso concentrati in un solo fold. Una CV con std piccola e media alta è la combinazione che indica un modello davvero affidabile, non solo fortunato.</p>
` },

    {
      type: "exercise", id: "sk2-03", kg: 20, title: "Cinque giudici, un verdetto",
      task: `<p>Valuta con la CV la pipeline scaler+KNN su tutto il dataset wine:</p>
<ul>
<li><code>scores</code>: i 5 punteggi della cross-validation (<code>cv=5</code>)</li>
<li><code>media</code>, <code>dev</code>: media e deviazione standard dei punteggi</li>
<li><code>peggiore</code>: il punteggio del fold più sfortunato (float)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
_wine = load_wine()
X, y = _wine.data, _wine.target`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X e y (tutto il dataset): gia' pronti

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))

scores = ...
media = ...
dev = ...
peggiore = ...

print(scores)
print(f"{media:.3f} ± {dev:.3f}  (peggiore: {peggiore:.3f})")`,
      check: `import numpy as np
assert 'scores' in globals() and len(scores) == 5, "scores: cross_val_score(pipe, X, y, cv=5) — 5 fold, 5 punteggi"
assert 'media' in globals() and float(media) > 0.9, "media: scores.mean() — la pipeline su wine va forte"
assert 'dev' in globals() and abs(float(dev) - float(np.std(scores))) < 1e-9, "dev: scores.std()"
assert 'peggiore' in globals() and abs(float(peggiore) - float(np.min(scores))) < 1e-12, "peggiore: scores.min() — e' il numero che ti dice il rischio, non la media"`,
      hint: `<p>Alla CV passi X e y <em>interi</em>: niente split manuale. I 5 numeri che escono sono 5 "esami" indipendenti; guardare solo la media nasconde il fold andato male.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))

scores = cross_val_score(pipe, X, y, cv=5)
media = scores.mean()
dev = scores.std()
peggiore = float(scores.min())

print(scores)
print(f"{media:.3f} ± {dev:.3f}  (peggiore: {peggiore:.3f})")`
    },

    { type: "theory", title: "Overfitting: il muscolo finto", html: `
<p>Un <strong>albero di decisione</strong> classifica con domande a cascata ("f1 &gt; 500? sì → …"). Più è profondo (<code>max_depth</code>), più domande può fare — fino a memorizzare ogni singolo esempio del training, rumore compreso. Quello è l'<strong>overfitting</strong>: muscolo da specchio, che crolla sui dati nuovi.</p>
<pre><code>from sklearn.tree import DecisionTreeClassifier
albero = DecisionTreeClassifier(max_depth=3, random_state=0)</code></pre>
<p>La diagnosi si fa confrontando le due accuratezze: <strong>train alto + test molto più basso = overfitting</strong>. Train e test entrambi bassi = underfitting (modello troppo semplice). Il punto giusto sta in mezzo, e si trova esattamente come stai per fare: provando le profondità e guardando il divario.</p>
`, more: `
<p><code>max_depth</code> non è l'unico modo di controllare la complessità di un albero: <code>min_samples_leaf</code> impone un numero minimo di osservazioni in ogni foglia finale (una foglia con un solo esempio è quasi sempre un sintomo di memorizzazione del rumore), <code>min_samples_split</code> impone un minimo di osservazioni prima di poter dividere ulteriormente un nodo — entrambi sono modi alternativi (spesso complementari a <code>max_depth</code>) di limitare quanto l'albero può "specializzarsi" sul training.</p>
<p>Il grafico "curva di validazione" (accuratezza train e test in funzione di un iperparametro come <code>max_depth</code>) è uno degli strumenti diagnostici più usati in machine learning: a sinistra (iperparametro basso) sia train che test sono bassi (underfitting), al centro entrambi sono alti e vicini (il punto giusto), a destra il train continua a salire mentre il test scende o si appiattisce (overfitting). L'esercizio di questa sala ne è la versione numerica, senza il grafico.</p>
<p>L'overfitting non è un difetto esclusivo degli alberi profondi: qualsiasi modello con "troppa libertà" rispetto alla quantità di dati disponibili può soffrirne — una regressione polinomiale di grado troppo alto, una rete neurale enorme su un dataset piccolo, un KNN con k=1. Il sintomo diagnostico (gap train-test) e la cura concettuale (meno complessità, o più dati, o regolarizzazione — vista più avanti in questa sala con Ridge/Lasso) restano gli stessi in ogni caso.</p>
` },

    {
      type: "exercise", id: "sk2-04", kg: 20, title: "Autopsia di un overfitting",
      task: `<p>Il dataset <code>X, y</code> (rumoroso apposta, già splittato) è perfetto per vedere il fenomeno. Per ogni profondità in <code>[2, 20]</code>:</p>
<ul>
<li><code>risultati</code>: dizionario {profondità: (acc_train, acc_test)} con un albero <code>DecisionTreeClassifier(max_depth=..., random_state=0)</code></li>
<li><code>gap_2</code>, <code>gap_20</code>: il divario train − test alle due profondità</li>
<li><code>overfit</code>: la profondità che mostra overfitting (decidilo dal codice: quella col gap maggiore)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
X = rng.normal(0, 1, size=(300, 5))
y = ((X[:, 0] + X[:, 1] > 0).astype(int) + (rng.uniform(size=300) < 0.25).astype(int)) % 2
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=0)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti (dati volutamente rumorosi)

risultati = {}
for depth in [2, 20]:
    ...

gap_2 = ...
gap_20 = ...
overfit = ...

print(risultati)
print(f"gap depth=2: {gap_2:.3f}   gap depth=20: {gap_20:.3f}")`,
      check: `assert 'risultati' in globals() and sorted(risultati.keys()) == [2, 20], "risultati deve avere le chiavi 2 e 20, con tuple (acc_train, acc_test)"
assert risultati[20][0] > 0.95, "L'albero profondo deve quasi memorizzare il training (acc_train ~1.0)"
assert 'gap_2' in globals() and 'gap_20' in globals() and float(gap_20) > float(gap_2) + 0.1, "Il gap a depth=20 deve essere molto piu' grande: e' la firma dell'overfitting"
assert 'overfit' in globals() and int(overfit) == 20, "overfit deve essere 20, scelto confrontando i gap nel codice"`,
      hint: `<p>Nel ciclo: fit, poi <code>risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))</code>. Il gap è <code>risultati[d][0] - risultati[d][1]</code>. L'albero profondo saprà il training a memoria ma sul test farà peggio di quello potato.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

risultati = {}
for depth in [2, 20]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

gap_2 = risultati[2][0] - risultati[2][1]
gap_20 = risultati[20][0] - risultati[20][1]
overfit = 20 if gap_20 > gap_2 else 2

print(risultati)
print(f"gap depth=2: {gap_2:.3f}   gap depth=20: {gap_20:.3f}")`
    },

    { type: "theory", title: "Random Forest: la saggezza della folla", html: `
<p>Un albero singolo è instabile; cento alberi, ognuno addestrato su un campione diverso dei dati e delle feature, che <strong>votano</strong>, sono un'altra storia. È la <code>RandomForestClassifier</code> — spesso il miglior primo modello "serio" su dati tabellari:</p>
<pre><code>from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)
rf.feature_importances_    # bonus: quanto ogni feature ha contribuito</code></pre>
<p>Gli errori dei singoli alberi si compensano a vicenda (per questo l'ensemble regge l'overfitting molto meglio del singolo albero) e <code>feature_importances_</code> ti regala l'interpretazione: quali variabili guidano davvero la previsione. Altro vantaggio pratico: gli alberi non usano distanze, quindi niente standardizzazione necessaria.</p>
`, more: `
<p>Il meccanismo che rende la foresta più robusta del singolo albero si chiama <strong>bagging</strong> (bootstrap aggregating): ogni albero viene addestrato su un campione casuale CON RIPETIZIONE delle righe originali (un "bootstrap sample"), e su un sottoinsieme casuale delle feature ad ogni divisione. Questa doppia casualità fa sì che i singoli alberi commettano errori diversi e in parte scorrelati tra loro — quando poi votano insieme, gli errori indipendenti tendono a cancellarsi a vicenda più di quanto farebbe un solo albero.</p>
<p><code>n_estimators</code> (il numero di alberi, es. 100) è un compromesso tempo/qualità: più alberi generalmente migliorano (o al peggio non peggiorano) la stabilità del risultato, ma aumentano linearmente il tempo di addestramento e previsione. A differenza di <code>max_depth</code> in un albero singolo, aumentare <code>n_estimators</code> non causa overfitting — è uno degli iperparametri più "sicuri" da alzare quando le risorse di calcolo lo permettono.</p>
<p><code>feature_importances_</code> misura quanto ogni feature ha contribuito a ridurre l'"impurità" (disordine) nei nodi degli alberi, mediato su tutti gli alberi della foresta — non va confuso con una relazione causale: una feature importante per il modello potrebbe essere solo CORRELATA con la vera causa sottostante, non la causa essa stessa (lo stesso avvertimento visto per la correlazione nella sala Pulizia & EDA).</p>
` },

    {
      type: "exercise", id: "sk2-05", kg: 20, title: "Pianta la foresta",
      task: `<p>Su wine (già splittato):</p>
<ul>
<li><code>rf</code>: una RandomForest con 100 alberi e <code>random_state=0</code>, addestrata</li>
<li><code>acc_rf</code>: accuratezza sul test</li>
<li><code>importanze</code>: la Series pandas <code>feature_importances_</code> indicizzata con <code>nomi</code>, ordinata decrescente</li>
<li><code>feature_regina</code>: il nome della feature più importante (il primo indice della Series ordinata)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
nomi = list(_wine.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `import pandas as pd
from sklearn.ensemble import RandomForestClassifier
# X_train, X_test, y_train, y_test, nomi: gia' pronti

rf = ...

acc_rf = ...
importanze = ...
feature_regina = ...

print(acc_rf)
print(importanze.head())`,
      check: `import pandas as pd
assert 'rf' in globals() and hasattr(rf, "feature_importances_"), "rf: RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)"
assert 'acc_rf' in globals() and float(acc_rf) > 0.9, "acc_rf: la foresta su wine deve superare 0.9 anche senza standardizzare (gli alberi non usano distanze!)"
assert 'importanze' in globals() and isinstance(importanze, pd.Series) and len(importanze) == 13 and importanze.iloc[0] >= importanze.iloc[-1], "importanze: pd.Series(rf.feature_importances_, index=nomi).sort_values(ascending=False)"
assert 'feature_regina' in globals() and feature_regina == importanze.index[0], "feature_regina: importanze.index[0]"`,
      hint: `<p><code>pd.Series(rf.feature_importances_, index=nomi).sort_values(ascending=False)</code> — mettere un array in una Series con indice parlante è il trucco per leggere qualsiasi output di scikit-learn.</p>`,
      solution: `import pandas as pd
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

acc_rf = float(rf.score(X_test, y_test))
importanze = pd.Series(rf.feature_importances_, index=nomi).sort_values(ascending=False)
feature_regina = importanze.index[0]

print(acc_rf)
print(importanze.head())`
    },

    { type: "theory", title: "KMeans: trovare gruppi senza etichette", html: `
<p>Finora il target <code>y</code> c'era sempre (apprendimento <em>supervisionato</em>). Ma spesso le etichette non esistono: hai solo misure e la domanda "ci sono gruppi naturali qui dentro?". È il <strong>clustering</strong>, e KMeans è il suo cavallo da tiro:</p>
<pre><code>from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)    # per ogni riga: 0, 1 o 2
km.cluster_centers_              # il "baricentro" di ogni gruppo
km.inertia_                      # dispersione interna: piu' bassa = gruppi piu' compatti</code></pre>
<p>Attenzione ai numeri dei cluster: sono arbitrari (il "cluster 0" di oggi può essere l'"1" di domani), contano i <em>raggruppamenti</em>. E il <code>k</code> lo scegli tu: i dati non ti dicono da soli quanti gruppi hanno — anche qui, distanze in gioco → standardizza prima se le scale differiscono.</p>
`, more: `
<p>Per scegliere <code>k</code> senza etichette vere a disposizione (il caso normale del clustering: se avessi le etichette non ti servirebbe il clustering), un metodo classico è il <strong>metodo del gomito</strong> (elbow method): calcola <code>km.inertia_</code> per k crescenti (1, 2, 3, 4...) e cerca il punto in cui l'inertia smette di scendere rapidamente — quel "gomito" nel grafico è spesso un buon candidato per il numero naturale di gruppi.</p>
<p>KMeans assume implicitamente che i cluster siano di forma sferica e di dimensioni simili — quando i gruppi reali sono allungati, a forma di mezzaluna, o di densità molto diverse tra loro, KMeans può dare risultati fuorvianti anche se i gruppi sono visivamente ovvi a un occhio umano. In quei casi esistono alternative come <code>DBSCAN</code> (basato sulla densità, non richiede di specificare k a priori) o il clustering gerarchico.</p>
<p><code>n_init=10</code> non è un dettaglio tecnico trascurabile: KMeans parte da centri iniziali scelti casualmente, e un'inizializzazione sfortunata può convergere a una soluzione peggiore (un minimo locale). <code>n_init=10</code> ripete l'intero algoritmo 10 volte con inizializzazioni diverse e tiene il risultato con l'inertia più bassa — una difesa economica contro il rischio di un'inizializzazione sfortunata, sempre raccomandata in pratica.</p>
` },

    {
      type: "exercise", id: "sk2-06", kg: 20, title: "Gruppi al buio",
      task: `<p><code>X</code> contiene 90 misure (F1, F2) di vocali <strong>senza etichetta</strong> — tre nuvole ben separate. Trova i gruppi:</p>
<ul>
<li><code>km</code>: KMeans con 3 cluster, <code>n_init=10</code>, <code>random_state=0</code>, addestrato con <code>fit_predict</code></li>
<li><code>etichette</code>: le assegnazioni (una per riga)</li>
<li><code>dimensioni</code>: quante osservazioni per cluster (suggerimento: <code>np.bincount(etichette)</code>)</li>
<li><code>centri</code>: i 3 baricentri (matrice 3×2)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(4)
_a = rng.normal([800, 1300], [40, 60], size=(30, 2))
_i = rng.normal([300, 2250], [25, 80], size=(30, 2))
_u = rng.normal([330, 850], [25, 50], size=(30, 2))
X = np.vstack([_a, _i, _u])`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
# X: 90 coppie (F1, F2), nessuna etichetta

km = ...
etichette = ...
dimensioni = ...
centri = ...

print(dimensioni)
print(centri.round(0))`,
      check: `import numpy as np
assert 'km' in globals() and 'etichette' in globals() and len(etichette) == 90, "etichette: km.fit_predict(X) — 90 assegnazioni"
assert 'dimensioni' in globals() and sorted(np.asarray(dimensioni).tolist()) == [30, 30, 30], "Le tre nuvole sono da 30: se KMeans le trova (e qui deve), i cluster sono 30-30-30"
assert 'centri' in globals() and np.asarray(centri).shape == (3, 2), "centri: km.cluster_centers_"
assert any(abs(float(c[0]) - 800) < 60 and abs(float(c[1]) - 1300) < 90 for c in np.asarray(centri)), "Uno dei centri deve cadere vicino a (800, 1300): ha ritrovato la /a/ senza saperlo!"`,
      hint: `<p><code>fit_predict</code> fa fit e restituisce le etichette in un colpo. <code>np.bincount</code> conta quante volte compare ogni intero: perfetto per contare i cluster.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)
centri = km.cluster_centers_

print(dimensioni)
print(centri.round(0))`
    },

    {
      type: "exercise", id: "sk2-07", kg: 25, title: "Massimale: il protocollo completo",
      task: `<p>L'ultima alzata mette insieme tutta la sala: su wine (dataset intero, già caricato), scegli il modello con il protocollo professionale.</p>
<ul>
<li><code>pipe_knn</code>: pipeline scaler + KNN(5); <code>pipe_log</code>: pipeline scaler + LogisticRegression(max_iter=5000); <code>rf</code>: RandomForest(100, random_state=0) senza scaler</li>
<li><code>cv_risultati</code>: dizionario {"knn": media CV, "logistic": media CV, "forest": media CV} con <code>cv=5</code> su tutto X, y</li>
<li><code>campione</code>: il nome del modello con media più alta (dal dizionario, col metodo di sk-07)</li>
<li><code>margine</code>: differenza tra il migliore e il peggiore dei tre (float)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
_wine = load_wine()
X, y = _wine.data, _wine.target`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
# X, y: il dataset wine completo

pipe_knn = ...
pipe_log = ...
rf = ...

cv_risultati = {
    "knn": ...,
    "logistic": ...,
    "forest": ...,
}

campione = ...
margine = ...

for nome, punteggio in cv_risultati.items():
    print(f"{nome:10s} {punteggio:.3f}")
print(f"Campione: {campione} (margine {margine:.3f})")`,
      check: `assert 'cv_risultati' in globals() and sorted(cv_risultati.keys()) == ["forest", "knn", "logistic"], "cv_risultati deve avere le chiavi knn, logistic, forest"
assert all(0.9 < v <= 1.0 for v in cv_risultati.values()), "Tutte e tre le medie CV devono superare 0.9: se una e' bassa, forse manca lo scaler nella sua pipeline"
assert 'campione' in globals() and campione in cv_risultati and abs(cv_risultati[campione] - max(cv_risultati.values())) < 1e-12, "campione: max(cv_risultati, key=cv_risultati.get)"
assert 'margine' in globals() and abs(float(margine) - (max(cv_risultati.values()) - min(cv_risultati.values()))) < 1e-12, "margine: max - min dei tre punteggi"`,
      hint: `<p>Ogni valore è <code>cross_val_score(modello, X, y, cv=5).mean()</code>. La foresta va senza scaler (gli alberi non usano distanze); KNN e logistic lo vogliono in pipeline. Su wine i tre finiscono vicini: è il margine, non il vincitore, la vera informazione.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

pipe_knn = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe_log = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
rf = RandomForestClassifier(n_estimators=100, random_state=0)

cv_risultati = {
    "knn": cross_val_score(pipe_knn, X, y, cv=5).mean(),
    "logistic": cross_val_score(pipe_log, X, y, cv=5).mean(),
    "forest": cross_val_score(rf, X, y, cv=5).mean(),
}

campione = max(cv_risultati, key=cv_risultati.get)
margine = max(cv_risultati.values()) - min(cv_risultati.values())

for nome, punteggio in cv_risultati.items():
    print(f"{nome:10s} {punteggio:.3f}")
print(f"Campione: {campione} (margine {margine:.3f})")`
    },

    { type: "theory", title: "PCA: comprimere senza perdere l'essenziale", html: `
<p>Con 13 feature (come wine) è impossibile "vedere" i dati. La <strong>PCA</strong> (Principal Component Analysis) trova nuove combinazioni lineari delle feature originali — le <em>componenti principali</em> — ordinate per quanta varianza spiegano, permettendo di comprimere lo spazio conservando il più possibile.</p>
<pre><code>from sklearn.decomposition import PCA
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)   # va fatta DOPO lo scaling!
pca.explained_variance_ratio_        # quanta varianza spiega ogni componente</code></pre>
<p>La PCA è sensibile alla scala tanto quanto KNN e SVM: senza standardizzare prima, la feature con i numeri più grandi domina artificialmente la prima componente. Con 2 componenti puoi anche <em>visualizzare</em> dati ad alta dimensionalità su un piano.</p>
`, more: `
<p>Le componenti principali sono, geometricamente, le direzioni di massima varianza nei dati: la prima componente è la direzione lungo cui i punti sono più "sparpagliati", la seconda è la direzione di massima varianza RESTANTE tra quelle perpendicolari alla prima, e così via. Ogni componente è quindi una combinazione lineare (una somma pesata) di TUTTE le feature originali — non corrisponde a una singola variabile originale, il che rende le componenti meno interpretabili direttamente rispetto alle feature di partenza.</p>
<p>Oltre alla visualizzazione, la PCA serve spesso come passo di preprocessing PRIMA di un modello: riducendo 30 feature correlate a 5-10 componenti che ne conservano la maggior parte dell'informazione, si può addestrare un modello più velocemente e talvolta più robusto (meno feature ridondanti da cui overfittare). L'esercizio "quante componenti servono" di questa sala esplora esattamente questa domanda pratica.</p>
<p>Un'insidia: la PCA massimizza la varianza SPIEGATA, non necessariamente la varianza UTILE per il tuo problema specifico. Due classi potrebbero differire soprattutto lungo una direzione a bassa varianza (che la PCA scarterebbe per prima) — in quel caso comprimere con la PCA prima di classificare può PEGGIORARE le prestazioni, invece di migliorarle. La PCA è un'analisi non supervisionata: non sa nulla del target y, e va sempre validata empiricamente, non applicata come automatismo.</p>
` },

    {
      type: "exercise", id: "sk2-08", kg: 20, title: "Comprimi wine in 2D",
      task: `<p>Su tutto il dataset wine (standardizzato prima!):</p>
<ul>
<li><code>X_scaled</code>: <code>X</code> standardizzato con <code>StandardScaler</code></li>
<li><code>pca</code>: <code>PCA(n_components=2)</code> addestrata su <code>X_scaled</code></li>
<li><code>X_2d</code>: la proiezione a 2 componenti (<code>fit_transform</code>)</li>
<li><code>varianza_spiegata</code>: la somma di <code>explained_variance_ratio_</code> (quanta informazione conservano le 2 componenti insieme)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
_wine = load_wine()
X, y = _wine.data, _wine.target`,
      starter: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# X, y: dataset wine completo

X_scaled = ...

pca = ...
X_2d = ...
varianza_spiegata = ...

print(X_2d.shape)
print(f"varianza spiegata dalle 2 componenti: {varianza_spiegata:.1%}")`,
      check: `import numpy as np
assert 'X_scaled' in globals() and abs(float(X_scaled.mean())) < 0.1, "X_scaled: StandardScaler().fit_transform(X)"
assert 'X_2d' in globals() and X_2d.shape == (178, 2), "X_2d: pca.fit_transform(X_scaled) con n_components=2 — 178 righe (il dataset wine), 2 colonne"
assert 'varianza_spiegata' in globals() and 0.4 < float(varianza_spiegata) < 0.7, "varianza_spiegata: pca.explained_variance_ratio_.sum() — su wine standardizzato le prime 2 componenti spiegano circa il 55%"`,
      hint: `<p>Ordine obbligato: prima <code>StandardScaler().fit_transform(X)</code>, POI la PCA sui dati scalati. Invertire l'ordine dà risultati fuorvianti, come per KNN e SVM.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
varianza_spiegata = pca.explained_variance_ratio_.sum()

print(X_2d.shape)
print(f"varianza spiegata dalle 2 componenti: {varianza_spiegata:.1%}")`
    },

    { type: "theory", title: "GridSearchCV: automatizzare la caccia agli iperparametri", html: `
<p>Nella sala Base hai cercato il miglior <code>k</code> del KNN con un ciclo <code>for</code> a mano. <code>GridSearchCV</code> fa lo stesso lavoro in modo sistematico: prova <strong>ogni combinazione</strong> di iperparametri, valutando ciascuna con cross-validation:</p>
<pre><code>from sklearn.model_selection import GridSearchCV
griglia = {"n_neighbors": [1, 3, 5, 10, 20]}
ricerca = GridSearchCV(KNeighborsClassifier(), griglia, cv=5)
ricerca.fit(X_train, y_train)
ricerca.best_params_    # la combinazione vincente
ricerca.best_score_     # il suo punteggio medio in CV</code></pre>
<p>Il vantaggio non è solo la comodità: usando la CV internamente, la ricerca non "sbircia" il test set, quindi <code>ricerca.best_score_</code> resta una stima onesta. Alla fine si valuta comunque <code>ricerca.score(X_test, y_test)</code> sul test tenuto da parte.</p>
`, more: `
<p>Dopo il <code>fit</code>, <code>ricerca</code> stessa si comporta come un modello addestrato: <code>ricerca.predict(X_nuovi)</code> e <code>ricerca.score(...)</code> usano automaticamente il MIGLIOR modello trovato (riaddestrato su tutto il train con i parametri vincenti) — non serve estrarre manualmente <code>best_params_</code> e ricreare la pipeline da zero, anche se è comunque utile ispezionarli per capire cosa ha vinto.</p>
<p><code>GridSearchCV</code> prova OGNI combinazione possibile: con 2 iperparametri e 5 valori ciascuno sono 25 combinazioni, ognuna valutata con k-fold CV (quindi 25×k addestramenti totali) — il costo cresce rapidamente ("maledizione della dimensionalità" della ricerca). Per griglie grandi, <code>RandomizedSearchCV</code> campiona un numero fisso di combinazioni casuali invece di provarle tutte, spesso trovando risultati quasi altrettanto buoni con una frazione del tempo di calcolo.</p>
<p>Un errore comune è confondere <code>best_score_</code> (la media di CV sul TRAIN, usata per scegliere i parametri) con la valutazione finale che deve avvenire su un test set MAI toccato dalla ricerca — se hai usato <code>GridSearchCV(pipe, griglia, cv=5).fit(X_train, y_train)</code>, il numero onesto da riportare è <code>ricerca.score(X_test, y_test)</code>, non <code>best_score_</code>, perché quest'ultimo ha comunque "visto" (indirettamente, tramite la scelta dei parametri) tutto il train.</p>
` },

    {
      type: "exercise", id: "sk2-09", kg: 25, title: "La caccia sistematica",
      task: `<p>Su wine (già splittato), automatizza la ricerca del miglior <code>k</code> per KNN dentro una pipeline:</p>
<ul>
<li><code>pipe</code>: pipeline <code>StandardScaler</code> + <code>KNeighborsClassifier</code></li>
<li><code>griglia</code>: dizionario <code>{"kneighborsclassifier__n_neighbors": [1, 3, 5, 10, 15]}</code> (nota il doppio underscore: così GridSearch sa a quale step della pipeline si riferisce l'iperparametro)</li>
<li><code>ricerca</code>: <code>GridSearchCV(pipe, griglia, cv=5)</code> addestrata sul train</li>
<li><code>k_migliore</code>: il valore scelto, da <code>ricerca.best_params_</code></li>
<li><code>acc_finale</code>: <code>ricerca.score(X_test, y_test)</code></li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())

griglia = {"kneighborsclassifier__n_neighbors": [1, 3, 5, 10, 15]}

ricerca = ...

k_migliore = ...
acc_finale = ...

print(k_migliore, acc_finale)`,
      check: `assert 'ricerca' in globals() and hasattr(ricerca, "best_params_"), "ricerca: GridSearchCV(pipe, griglia, cv=5).fit(X_train, y_train)"
assert 'k_migliore' in globals() and k_migliore in [1, 3, 5, 10, 15], "k_migliore: ricerca.best_params_['kneighborsclassifier__n_neighbors']"
assert 'acc_finale' in globals() and float(acc_finale) > 0.9, "acc_finale: ricerca.score(X_test, y_test) — deve superare 0.9, come il KNN standardizzato manuale"`,
      hint: `<p>Il nome della chiave nella griglia deve combaciare esattamente col nome del passo della pipeline (minuscolo, automatico) più due underscore più il nome del parametro: <code>"kneighborsclassifier__n_neighbors"</code>.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
griglia = {"kneighborsclassifier__n_neighbors": [1, 3, 5, 10, 15]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

k_migliore = ricerca.best_params_["kneighborsclassifier__n_neighbors"]
acc_finale = ricerca.score(X_test, y_test)

print(k_migliore, acc_finale)`
    },

    { type: "theory", title: "Ridge e Lasso: regolarizzare per non overfittare", html: `
<p>Una regressione lineare con molte feature può assegnare coefficienti enormi che si compensano a vicenda — sintomo di overfitting. <strong>Ridge</strong> e <strong>Lasso</strong> aggiungono una penalità che scoraggia i coefficienti grandi:</p>
<pre><code>from sklearn.linear_model import Ridge, Lasso
ridge = Ridge(alpha=1.0)   # penalizza i quadrati dei coefficienti: li restringe verso 0
lasso = Lasso(alpha=1.0)   # penalizza il valore assoluto: puo' azzerarli DEL TUTTO</code></pre>
<p>La differenza pratica: Ridge restringe tutti i coefficienti un po', Lasso ne azzera alcuni completamente — è quindi anche una forma di <strong>selezione automatica delle feature</strong>. <code>alpha</code> controlla la forza della penalità: 0 equivale a una regressione lineare normale, valori alti schiacciano tutto verso zero.</p>
`, more: `
<p>La ragione matematica della differenza tra Ridge e Lasso sta nel tipo di penalità: Ridge penalizza la somma dei QUADRATI dei coefficienti (penalità "L2"), una funzione liscia che spinge i coefficienti verso zero senza mai raggiungerlo esattamente. Lasso penalizza la somma dei VALORI ASSOLUTI (penalità "L1"), una funzione con uno spigolo in zero che matematicamente rende conveniente per l'ottimizzatore azzerare completamente alcuni coefficienti — da qui la selezione automatica delle feature che Ridge non offre.</p>
<p>Esiste anche <code>ElasticNet</code>, che combina entrambe le penalità con un peso configurabile (<code>l1_ratio</code>): un compromesso utile quando vuoi sia un po' di restringimento generale (come Ridge) sia un po' di selezione delle feature (come Lasso), senza dover scegliere nettamente tra i due estremi.</p>
<p>Un buon modo di scegliere <code>alpha</code> non è indovinarlo ma cercarlo sistematicamente, esattamente come il <code>k</code> del KNN o il <code>C</code> della SVM viste in questa sala: <code>GridSearchCV</code> con una griglia di valori di <code>alpha</code>, oppure le varianti <code>RidgeCV</code>/<code>LassoCV</code> che scikit-learn offre apposta, con una cross-validation incorporata per trovare l'alpha ottimale senza scrivere il ciclo a mano.</p>
` },

    {
      type: "exercise", id: "sk2-10", kg: 20, title: "Chi tiene i coefficienti a bada?",
      task: `<p>Sul dataset diabetes (già splittato), confronta tre regressori:</p>
<ul>
<li><code>lin</code>: <code>LinearRegression()</code> addestrata; <code>ridge</code>: <code>Ridge(alpha=1.0)</code>; <code>lasso</code>: <code>Lasso(alpha=1.0)</code></li>
<li><code>coef_max</code>: dizionario {"lineare": ..., "ridge": ..., "lasso": ...} con il <strong>massimo valore assoluto</strong> dei coefficienti di ciascuno</li>
<li><code>n_azzerati_lasso</code>: quanti coefficienti di <code>lasso</code> sono <strong>esattamente</strong> zero (una selezione automatica delle feature!)</li>
</ul>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
# X_train, X_test, y_train, y_test: gia' pronti

lin = ...
ridge = ...
lasso = ...

coef_max = {
    "lineare": ...,
    "ridge": ...,
    "lasso": ...,
}
n_azzerati_lasso = ...

print(coef_max)
print(n_azzerati_lasso)`,
      check: `import numpy as np
assert 'lin' in globals() and 'ridge' in globals() and 'lasso' in globals(), "Crea e addestra i tre modelli: LinearRegression(), Ridge(alpha=1.0), Lasso(alpha=1.0)"
assert 'coef_max' in globals() and coef_max["lineare"] > coef_max["ridge"] and coef_max["lineare"] > coef_max["lasso"], "coef_max['lineare'] deve essere il piu' grande dei tre: sia Ridge che Lasso restringono il coefficiente massimo rispetto alla regressione lineare pura"
assert 'n_azzerati_lasso' in globals() and int(n_azzerati_lasso) >= 1, "n_azzerati_lasso: (np.abs(lasso.coef_) < 1e-10).sum() — Lasso con alpha=1.0 su diabetes azzera almeno una feature"`,
      hint: `<p>Per ogni modello: <code>fit</code>, poi <code>np.abs(modello.coef_).max()</code>. Per contare gli zeri esatti di Lasso: <code>(np.abs(lasso.coef_) &lt; 1e-10).sum()</code> — un confronto diretto a 0.0 rischia problemi di arrotondamento.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso

lin = LinearRegression().fit(X_train, y_train)
ridge = Ridge(alpha=1.0).fit(X_train, y_train)
lasso = Lasso(alpha=1.0).fit(X_train, y_train)

coef_max = {
    "lineare": float(np.abs(lin.coef_).max()),
    "ridge": float(np.abs(ridge.coef_).max()),
    "lasso": float(np.abs(lasso.coef_).max()),
}
n_azzerati_lasso = int((np.abs(lasso.coef_) < 1e-10).sum())

print(coef_max)
print(n_azzerati_lasso)`
    },

    {
      type: "exercise", id: "sk2-11", kg: 15, title: "Drill: la disciplina dello scaler",
      task: `<p>Su breast_cancer (già splittato): <code>scaler</code> fittato SOLO sul train, <code>X_train_s</code> e <code>X_test_s</code>. Verifica: <code>media_train</code> (deve essere ~0).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.preprocessing import StandardScaler
# X_train, X_test: gia' pronti

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`,
      check: `assert abs(media_train) < 1e-6`,
      hint: `<p><code>fit_transform</code> sul train, <code>transform</code> (soltanto) sul test.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`
    },

    {
      type: "exercise", id: "sk2-12", kg: 15, title: "Drill: pipeline su diagnosi",
      task: `<p>Su breast_cancer (già splittato): pipeline <code>StandardScaler</code> + <code>KNeighborsClassifier(5)</code>, <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p><code>make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))</code>, poi usala come un modello qualsiasi.</p>`,
      solution: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk2-13", kg: 20, title: "Drill: cross-validation con SVM",
      task: `<p>Su tutto iris: <code>scores</code> (5-fold CV con <code>SVC()</code> di default), <code>media</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.svm import SVC
from sklearn.datasets import load_iris

iris = load_iris()
scores = cross_val_score(SVC(), iris.data, iris.target, cv=5)
media = scores.mean()

print(scores)
print(media)`,
      check: `assert len(scores) == 5
assert media > 0.9`,
      hint: `<p><code>cross_val_score(modello, X, y, cv=5)</code> restituisce 5 punteggi, uno per fold.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.svm import SVC
from sklearn.datasets import load_iris

iris = load_iris()
scores = cross_val_score(SVC(), iris.data, iris.target, cv=5)
media = scores.mean()

print(scores)
print(media)`
    },

    {
      type: "exercise", id: "sk2-14", kg: 20, title: "Drill: overfitting a tre profondità",
      task: `<p>Su wine (già splittato), per profondità <code>[2, 3, 15]</code>: <code>risultati</code>, dizionario {profondità: (acc_train, acc_test)}.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
for depth in [2, 3, 15]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

print(risultati)`,
      check: `assert sorted(risultati.keys()) == [2, 3, 15]
assert risultati[15][0] > risultati[2][0], "L'albero profondo deve avere accuratezza train piu' alta (memorizza di piu')"`,
      hint: `<p>Guarda come <code>acc_train</code> sale con la profondità mentre <code>acc_test</code> smette di migliorare (o peggiora): è la firma dell'overfitting.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

risultati = {}
for depth in [2, 3, 15]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

print(risultati)`
    },

    {
      type: "exercise", id: "sk2-15", kg: 20, title: "Drill: la feature che conta di più",
      task: `<p>Su wine (già splittato): addestra una <code>RandomForestClassifier(100, random_state=0)</code>, trova <code>feature_top</code> (nome, da <code>nomi</code>).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
nomi = list(_wine.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X_train, y_train, nomi: gia' pronti

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

feature_top = nomi[np.argmax(rf.feature_importances_)]
print(feature_top)`,
      check: `assert feature_top == "alcohol"`,
      hint: `<p><code>rf.feature_importances_</code> è un array parallelo a <code>nomi</code>: stesso indice, stessa feature.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

feature_top = nomi[np.argmax(rf.feature_importances_)]
print(feature_top)`
    },

    {
      type: "exercise", id: "sk2-16", kg: 20, title: "Drill: tre nuvole, tre cluster",
      task: `<p>Su <code>X</code> (60 punti, 3 nuvole ben separate): <code>km</code> con <code>KMeans(n_clusters=3, n_init=10, random_state=0)</code>, <code>dimensioni</code> (conteggio per cluster).</p>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
a = rng.normal([0,0], 0.5, size=(20,2))
b = rng.normal([5,5], 0.5, size=(20,2))
c = rng.normal([0,5], 0.5, size=(20,2))
X = np.vstack([a, b, c])`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
# X: gia' pronto

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`,
      check: `assert sorted(dimensioni.tolist()) == [20, 20, 20]`,
      hint: `<p>Con nuvole ben separate, KMeans le ritrova quasi sempre esattamente.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`
    },

    {
      type: "exercise", id: "sk2-17", kg: 20, title: "Drill: quanto spiega la prima componente?",
      task: `<p>Su breast_cancer, standardizzato: <code>PCA(n_components=1)</code>, <code>varianza_pc1</code> (quota di varianza spiegata dalla prima componente).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
_bc = load_breast_cancer()
X = _bc.data`,
      starter: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# X: gia' pronto

X_scaled = StandardScaler().fit_transform(X)
pca = PCA(n_components=1)
pca.fit(X_scaled)

varianza_pc1 = pca.explained_variance_ratio_[0]
print(varianza_pc1)`,
      check: `assert 0.35 < varianza_pc1 < 0.55`,
      hint: `<p>Una singola componente principale, da sola, cattura una fetta enorme dell'informazione di breast_cancer: segno che molte delle 30 feature originali sono ridondanti tra loro.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X_scaled = StandardScaler().fit_transform(X)
pca = PCA(n_components=1)
pca.fit(X_scaled)

varianza_pc1 = pca.explained_variance_ratio_[0]
print(varianza_pc1)`
    },

    {
      type: "exercise", id: "sk2-18", kg: 25, title: "Drill: GridSearch sul parametro C",
      task: `<p>Su wine (già splittato): pipeline scaler+SVM, griglia <code>{"svc__C": [0.1, 1, 10]}</code>, <code>GridSearchCV(cv=5)</code>. <code>miglior_c</code>, <code>acc_test</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

miglior_c = ricerca.best_params_["svc__C"]
acc_test = ricerca.score(X_test, y_test)

print(miglior_c, acc_test)`,
      check: `assert miglior_c in [0.1, 1, 10]
assert acc_test > 0.9`,
      hint: `<p>Il nome del passo nella pipeline (<code>svc</code>, minuscolo automatico) più due underscore più <code>C</code> formano la chiave della griglia.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

miglior_c = ricerca.best_params_["svc__C"]
acc_test = ricerca.score(X_test, y_test)

print(miglior_c, acc_test)`
    },

    {
      type: "exercise", id: "sk2-19", kg: 20, title: "Drill: Lasso che si svuota",
      task: `<p>Su diabetes (già splittato): per <code>alpha</code> in <code>[0.1, 1.0, 10.0]</code>, conta i coefficienti NON zero di un <code>Lasso(alpha=...)</code>, salva in <code>non_zero</code> (dizionario alpha→conteggio).</p>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import Lasso
# X_train, y_train: gia' pronti

non_zero = {}
for alpha in [0.1, 1.0, 10.0]:
    l = Lasso(alpha=alpha)
    l.fit(X_train, y_train)
    non_zero[alpha] = int(np.sum(np.abs(l.coef_) > 1e-10))

print(non_zero)`,
      check: `assert non_zero[0.1] > non_zero[1.0] > non_zero[10.0], "Piu' alpha cresce, piu' Lasso azzera coefficienti: deve essere una sequenza decrescente"`,
      hint: `<p>È la stessa idea del massimale della sala precedente, ripetuta su più valori di <code>alpha</code>: più penalità, meno feature sopravvivono.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import Lasso

non_zero = {}
for alpha in [0.1, 1.0, 10.0]:
    l = Lasso(alpha=alpha)
    l.fit(X_train, y_train)
    non_zero[alpha] = int(np.sum(np.abs(l.coef_) > 1e-10))

print(non_zero)`
    },

    {
      type: "exercise", id: "sk2-20", kg: 20, title: "Combo: pipeline + cross-validation",
      task: `<p>Su tutto wine: <code>pipe</code> (scaler+SVM), valutala con <code>cross_val_score(cv=5)</code>, <code>media</code> e <code>std</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_wine

wine = load_wine()
pipe = make_pipeline(StandardScaler(), SVC())
scores = cross_val_score(pipe, wine.data, wine.target, cv=5)

media = scores.mean()
std = scores.std()

print(scores)
print(media, std)`,
      check: `assert media > 0.9
assert std < 0.15`,
      hint: `<p>Passando la pipeline (non solo il modello) a <code>cross_val_score</code>, lo scaling viene rifatto correttamente dentro ogni fold.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_wine

wine = load_wine()
pipe = make_pipeline(StandardScaler(), SVC())
scores = cross_val_score(pipe, wine.data, wine.target, cv=5)

media = scores.mean()
std = scores.std()

print(scores)
print(media, std)`
    },

    {
      type: "exercise", id: "sk2-21", kg: 25, title: "Combo: la profondità che massimizza il test",
      task: `<p>Su wine (già splittato): per profondità da 1 a 10, trova <code>depth_migliore</code>: quella con <code>acc_test</code> più alta (non train!).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

acc_test_per_depth = {}
for depth in range(1, 11):
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    acc_test_per_depth[depth] = albero.score(X_test, y_test)

depth_migliore = max(acc_test_per_depth, key=acc_test_per_depth.get)
print(acc_test_per_depth)
print(depth_migliore)`,
      check: `assert 1 <= depth_migliore <= 10
assert acc_test_per_depth[depth_migliore] == max(acc_test_per_depth.values())`,
      hint: `<p>La profondità migliore per il TEST spesso non è la più alta disponibile: dopo un certo punto, l'accuratezza test smette di crescere o cala.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

acc_test_per_depth = {}
for depth in range(1, 11):
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    acc_test_per_depth[depth] = albero.score(X_test, y_test)

depth_migliore = max(acc_test_per_depth, key=acc_test_per_depth.get)
print(acc_test_per_depth)
print(depth_migliore)`
    },

    {
      type: "exercise", id: "sk2-22", kg: 25, title: "Combo: le 3 feature più importanti",
      task: `<p>Su breast_cancer (già splittato): addestra una RandomForest, trova <code>top3_features</code>: i 3 nomi con importanza più alta, in ordine decrescente.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
nomi = list(_bc.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X_train, y_train, nomi: gia' pronti

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

ordine = np.argsort(rf.feature_importances_)[::-1]
top3_features = [nomi[i] for i in ordine[:3]]

print(top3_features)`,
      check: `assert len(top3_features) == 3
assert len(set(top3_features)) == 3`,
      hint: `<p>Stesso pattern argsort+inversione+slice usato in NumPy per i "top-k", applicato qui alle importanze delle feature.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

ordine = np.argsort(rf.feature_importances_)[::-1]
top3_features = [nomi[i] for i in ordine[:3]]

print(top3_features)`
    },

    {
      type: "exercise", id: "sk2-23", kg: 25, title: "Combo: PCA poi KMeans",
      task: `<p>Su <code>X</code> (3 nuvole, ma con 10 feature invece di 2): riduci a 2 componenti con PCA, poi applica KMeans(3) sui dati ridotti. <code>dimensioni</code> deve ritrovare i 3 gruppi originali.</p>`,
      setup: `import numpy as np
rng = np.random.default_rng(2)
centri = [np.zeros(10), np.full(10, 8.0), np.concatenate([np.zeros(5), np.full(5, 8.0)])]
X = np.vstack([rng.normal(c, 0.5, size=(15, 10)) for c in centri])`,
      starter: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
# X: gia' pronto (45 punti, 10 feature, 3 gruppi nascosti)

X_2d = PCA(n_components=2).fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X_2d)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`,
      check: `assert sorted(dimensioni.tolist()) == [15, 15, 15]`,
      hint: `<p>La PCA comprime le 10 feature in 2 assi che preservano comunque la separazione tra i 3 gruppi: il clustering funziona anche sulla versione ridotta.</p>`,
      solution: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

X_2d = PCA(n_components=2).fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X_2d)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`
    },

    {
      type: "exercise", id: "sk2-24", kg: 25, title: "Combo: GridSearch su due iperparametri",
      task: `<p>Su wine (già splittato): griglia con <strong>due</strong> parametri insieme, <code>{"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}</code>. <code>n_combinazioni</code>: quante combinazioni sono state provate (deve essere 3×2×5 fold... ma <code>cv_results_</code> ha una riga per combinazione, non per fold).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
# X_train, y_train: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

n_combinazioni = len(ricerca.cv_results_["params"])
print(n_combinazioni)
print(ricerca.best_params_)`,
      check: `assert n_combinazioni == 6`,
      hint: `<p>3 valori di C × 2 kernel = 6 combinazioni totali; ognuna viene valutata con la CV a 5 fold, ma <code>cv_results_</code> riporta una riga per combinazione (già mediata sui fold).</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

n_combinazioni = len(ricerca.cv_results_["params"])
print(n_combinazioni)
print(ricerca.best_params_)`
    },

    {
      type: "exercise", id: "sk2-25", kg: 25, title: "Combo: Ridge a più livelli di alpha",
      task: `<p>Su diabetes (già splittato): per <code>alpha</code> in <code>[0.01, 1, 100]</code>, calcola <code>r2_test</code> di un <code>Ridge</code>, salva in <code>risultati</code>. Trova <code>alpha_migliore</code>.</p>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `from sklearn.linear_model import Ridge
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
for alpha in [0.01, 1, 100]:
    r = Ridge(alpha=alpha)
    r.fit(X_train, y_train)
    risultati[alpha] = r.score(X_test, y_test)

alpha_migliore = max(risultati, key=risultati.get)
print(risultati)
print(alpha_migliore)`,
      check: `assert set(risultati.keys()) == {0.01, 1, 100}
assert risultati[100] < risultati[1], "alpha=100 e' una penalita' cosi' forte da peggiorare il modello rispetto ad alpha=1 su questi dati"`,
      hint: `<p>Un <code>alpha</code> troppo alto sotto-adatta (underfitting): il modello diventa troppo semplice per catturare la relazione reale.</p>`,
      solution: `from sklearn.linear_model import Ridge

risultati = {}
for alpha in [0.01, 1, 100]:
    r = Ridge(alpha=alpha)
    r.fit(X_train, y_train)
    risultati[alpha] = r.score(X_test, y_test)

alpha_migliore = max(risultati, key=risultati.get)
print(risultati)
print(alpha_migliore)`
    },

    {
      type: "exercise", id: "sk2-26", kg: 25, title: "Combo: confronto finale a 4 modelli",
      task: `<p>Su breast_cancer (dataset intero): confronta con <code>cross_val_score(cv=5).mean()</code> quattro pipeline/modelli: KNN (in pipeline), SVM (in pipeline), RandomForest (senza scaler), LogisticRegression (in pipeline). Salva tutto in <code>classifica</code> (dizionario), poi <code>vincitore</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
_bc = load_breast_cancer()
X, y = _bc.data, _bc.target`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
# X, y: dataset breast_cancer completo

classifica = {
    "knn": cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=5).mean(),
    "svm": cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean(),
    "forest": cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean(),
    "logistic": cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean(),
}
vincitore = max(classifica, key=classifica.get)

print(classifica)
print(vincitore)`,
      check: `assert set(classifica.keys()) == {"knn", "svm", "forest", "logistic"}
assert all(v > 0.85 for v in classifica.values())
assert vincitore in classifica`,
      hint: `<p>Su breast_cancer i modelli finiscono spesso vicinissimi tra loro (tutti sopra il 90%): la scelta finale può dipendere anche da altri fattori (velocità, interpretabilità) oltre alla sola accuratezza.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

classifica = {
    "knn": cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=5).mean(),
    "svm": cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean(),
    "forest": cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean(),
    "logistic": cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean(),
}
vincitore = max(classifica, key=classifica.get)

print(classifica)
print(vincitore)`
    },

    {
      type: "exercise", id: "sk2-27", kg: 25, title: "Massimale: PCA per capire quante componenti servono",
      task: `<p>Su breast_cancer standardizzato: fai la PCA con TUTTE le componenti, poi trova <code>n_componenti_90</code>: il numero minimo di componenti che insieme spiegano almeno il 90% della varianza (usa <code>np.cumsum</code> sulla varianza spiegata).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
_bc = load_breast_cancer()
X = _bc.data`,
      starter: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# X: gia' pronto

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)

cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

print(cumulata.round(3))
print(n_componenti_90)`,
      check: `assert n_componenti_90 < X.shape[1], "Devono bastare MENO componenti delle 30 feature originali per il 90% della varianza"
assert n_componenti_90 >= 1`,
      hint: `<p><code>np.argmax</code> su una maschera booleana trova il primo <code>True</code>: la prima posizione in cui la varianza cumulata raggiunge il 90%. <code>+1</code> perché gli indici partono da 0 ma il conteggio delle componenti da 1.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)

cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

print(cumulata.round(3))
print(n_componenti_90)`
    },

    {
      type: "exercise", id: "sk2-28", kg: 25, title: "Massimale: pipeline completa con GridSearch e report",
      task: `<p>Su wine (dataset intero): costruisci <code>referto</code>, un dizionario con <code>"miglior_c"</code>, <code>"miglior_score_cv"</code> (da <code>best_score_</code>), <code>"n_fold"</code> (5), tutto da una <code>GridSearchCV</code> su pipeline scaler+SVM.</p>`,
      setup: `from sklearn.datasets import load_wine
_wine = load_wine()
X, y = _wine.data, _wine.target`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
# X, y: dataset wine completo

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_fold": 5,
}

print(referto)`,
      check: `assert referto["miglior_c"] in [0.1, 1, 10]
assert referto["miglior_score_cv"] > 0.9
assert referto["n_fold"] == 5`,
      hint: `<p><code>best_score_</code> è già la media della CV per la combinazione vincente: non serve ricalcolarla a parte.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_fold": 5,
}

print(referto)`
    },

    {
      type: "exercise", id: "sk2-29", kg: 25, title: "Massimale: clustering e verità nascosta",
      task: `<p>Su iris (che ha etichette VERE, anche se KMeans non le usa): applica <code>KMeans(n_clusters=3, n_init=10, random_state=0)</code> su <code>X</code> e confronta con <code>y</code> vero usando <code>pd.crosstab</code> (import pandas), per vedere quanto il clustering "ritrova" le specie reali.</p>`,
      setup: `from sklearn.datasets import load_iris
_iris = load_iris()
X, y = _iris.data, _iris.target`,
      starter: `import pandas as pd
from sklearn.cluster import KMeans
# X, y: dataset iris completo

km = KMeans(n_clusters=3, n_init=10, random_state=0)
cluster = km.fit_predict(X)

tabella = pd.crosstab(y, cluster)
print(tabella)

diagonale_massima = tabella.values.max(axis=1).sum()
print(diagonale_massima)`,
      check: `assert diagonale_massima >= 130, "Su iris, KMeans deve ritrovare la maggior parte delle specie reali: almeno ~130 punti su 150 nel cluster dominante di ciascuna specie"`,
      hint: `<p>Il crosstab mostra, per ogni specie vera (riga), come si distribuisce nei cluster trovati (colonne): se una specie finisce quasi tutta in un solo cluster, il clustering "ha funzionato" per quella specie.</p>`,
      solution: `import pandas as pd
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, n_init=10, random_state=0)
cluster = km.fit_predict(X)

tabella = pd.crosstab(y, cluster)
print(tabella)

diagonale_massima = tabella.values.max(axis=1).sum()
print(diagonale_massima)`
    },

    {
      type: "exercise", id: "sk2-30", kg: 25, title: "Massimale finale: il protocollo al completo",
      task: `<p>L'ultima serie della palestra scikit-learn. Su breast_cancer (dataset intero), costruisci il protocollo definitivo in <code>report_finale</code>:</p>
<ul>
<li><code>"cv_scores"</code>: i 5 punteggi di CV di una pipeline scaler+RandomForest... anzi, gli alberi non hanno bisogno di scaler: usa solo RandomForest(100, random_state=0)</li>
<li><code>"cv_media"</code> e <code>"cv_std"</code></li>
<li><code>"top_feature"</code>: la feature più importante (fit su tutto X, y)</li>
<li><code>"n_componenti_90"</code>: quante componenti PCA (su dati standardizzati) servono per il 90% della varianza</li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
_bc = load_breast_cancer()
X, y = _bc.data, _bc.target
nomi = list(_bc.feature_names)`,
      starter: `import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# X, y, nomi: dataset breast_cancer completo

rf = RandomForestClassifier(n_estimators=100, random_state=0)
cv_scores = cross_val_score(rf, X, y, cv=5)

rf.fit(X, y)
top_feature = nomi[np.argmax(rf.feature_importances_)]

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

report_finale = {
    "cv_scores": cv_scores,
    "cv_media": cv_scores.mean(),
    "cv_std": cv_scores.std(),
    "top_feature": top_feature,
    "n_componenti_90": n_componenti_90,
}

for k, v in report_finale.items():
    print(k, v)`,
      check: `assert len(report_finale["cv_scores"]) == 5
assert report_finale["cv_media"] > 0.9
assert report_finale["top_feature"] in nomi
assert report_finale["n_componenti_90"] < 30`,
      hint: `<p>Nessun concetto nuovo qui: è la somma di tutto ciò che hai imparato in questa sala, in un unico report — esattamente il tipo di codice che scriverai davvero in un progetto.</p>`,
      solution: `import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

rf = RandomForestClassifier(n_estimators=100, random_state=0)
cv_scores = cross_val_score(rf, X, y, cv=5)

rf.fit(X, y)
top_feature = nomi[np.argmax(rf.feature_importances_)]

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

report_finale = {
    "cv_scores": cv_scores,
    "cv_media": cv_scores.mean(),
    "cv_std": cv_scores.std(),
    "top_feature": top_feature,
    "n_componenti_90": n_componenti_90,
}

for k, v in report_finale.items():
    print(k, v)`
    },

    {
      type: "exercise", id: "sk2-31", kg: 15, title: "Drill: disciplina dello scaler su wine",
      task: `<p>Su wine (già splittato): <code>scaler</code> fittato SOLO sul train, <code>X_train_s</code> e <code>X_test_s</code>. Verifica <code>media_train</code> (~0).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.preprocessing import StandardScaler
# X_train, X_test: gia' pronti

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`,
      check: `assert abs(media_train) < 1e-6`,
      hint: `<p><code>fit_transform</code> sul train, <code>transform</code> soltanto sul test.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`
    },

    {
      type: "exercise", id: "sk2-32", kg: 20, title: "Drill: pipeline SVM su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): pipeline <code>StandardScaler</code> + <code>SVC()</code>, <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC())
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Stessa forma di sempre: <code>make_pipeline</code>, poi usala come un modello qualsiasi.</p>`,
      solution: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk2-33", kg: 20, title: "Drill: cross-validation con logistic su breast_cancer",
      task: `<p>Su tutto breast_cancer: pipeline scaler+logistic, <code>scores</code> (CV a 5 fold), <code>media</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
scores = cross_val_score(pipe, bc.data, bc.target, cv=5)
media = scores.mean()

print(scores)
print(media)`,
      check: `assert len(scores) == 5
assert media > 0.9`,
      hint: `<p>Passa la pipeline (non solo il modello) a <code>cross_val_score</code>: lo scaling viene rifatto dentro ogni fold.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
scores = cross_val_score(pipe, bc.data, bc.target, cv=5)
media = scores.mean()

print(scores)
print(media)`
    },

    {
      type: "exercise", id: "sk2-34", kg: 20, title: "Drill: overfitting su breast_cancer",
      task: `<p>Su breast_cancer (già splittato), per profondità <code>[2, 3, 20]</code>: <code>risultati</code> (dizionario profondità→(acc_train, acc_test)).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
for depth in [2, 3, 20]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

print(risultati)`,
      check: `assert sorted(risultati.keys()) == [2, 3, 20]
assert risultati[20][0] >= risultati[2][0], "L'albero piu' profondo deve avere acc_train almeno pari a quello meno profondo"`,
      hint: `<p>Guarda come <code>acc_train</code> sale (fino quasi a 1.0) mentre <code>acc_test</code> smette di migliorare: è il gap che segnala overfitting.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

risultati = {}
for depth in [2, 3, 20]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

print(risultati)`
    },

    {
      type: "exercise", id: "sk2-35", kg: 20, title: "Drill: feature top su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): <code>RandomForestClassifier(100, random_state=0)</code>, <code>feature_top</code> (nome).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
nomi = list(_bc.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X_train, y_train, nomi: gia' pronti

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

feature_top = nomi[np.argmax(rf.feature_importances_)]
print(feature_top)`,
      check: `assert feature_top in nomi`,
      hint: `<p><code>rf.feature_importances_</code> è un array parallelo a <code>nomi</code>.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

feature_top = nomi[np.argmax(rf.feature_importances_)]
print(feature_top)`
    },

    {
      type: "exercise", id: "sk2-36", kg: 20, title: "Drill: KMeans su iris (senza etichette)",
      task: `<p>Su iris (solo <code>X</code>, ignora le etichette vere): <code>KMeans(n_clusters=3, n_init=10, random_state=0)</code>, <code>dimensioni</code>.</p>`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

X = load_iris().data

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(dimensioni)
print(dimensioni.sum())`,
      check: `assert len(dimensioni) == 3
assert dimensioni.sum() == 150`,
      hint: `<p>150 fiori totali, divisi in 3 cluster: la somma delle dimensioni deve tornare a 150.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

X = load_iris().data

km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(dimensioni)
print(dimensioni.sum())`
    },

    {
      type: "exercise", id: "sk2-37", kg: 20, title: "Drill: PCA a 2 componenti su wine",
      task: `<p>Su wine (standardizzato): <code>PCA(n_components=2)</code>, <code>varianza_spiegata</code> (somma dei due rapporti).</p>`,
      starter: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
varianza_spiegata = pca.explained_variance_ratio_.sum()

print(X_2d.shape)
print(varianza_spiegata)`,
      check: `assert X_2d.shape == (178, 2)
assert 0.4 < varianza_spiegata < 0.7`,
      hint: `<p>Standardizza sempre PRIMA della PCA: senza, una feature con numeri grandi domina artificialmente la prima componente.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
varianza_spiegata = pca.explained_variance_ratio_.sum()

print(X_2d.shape)
print(varianza_spiegata)`
    },

    {
      type: "exercise", id: "sk2-38", kg: 25, title: "Drill: GridSearch sulla profondità dell'albero",
      task: `<p>Su wine (già splittato): griglia <code>{"max_depth": [2, 4, 6, 8]}</code> su <code>DecisionTreeClassifier(random_state=0)</code>, <code>GridSearchCV(cv=5)</code>. <code>depth_migliore</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

griglia = {"max_depth": [2, 4, 6, 8]}
ricerca = GridSearchCV(DecisionTreeClassifier(random_state=0), griglia, cv=5)
ricerca.fit(X_train, y_train)

depth_migliore = ricerca.best_params_["max_depth"]
acc_test = ricerca.score(X_test, y_test)

print(depth_migliore, acc_test)`,
      check: `assert depth_migliore in [2, 4, 6, 8]
assert acc_test > 0.8`,
      hint: `<p>Senza pipeline (il DecisionTree non ha bisogno di scaler), la chiave della griglia è direttamente <code>"max_depth"</code>, senza prefisso.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier

griglia = {"max_depth": [2, 4, 6, 8]}
ricerca = GridSearchCV(DecisionTreeClassifier(random_state=0), griglia, cv=5)
ricerca.fit(X_train, y_train)

depth_migliore = ricerca.best_params_["max_depth"]
acc_test = ricerca.score(X_test, y_test)

print(depth_migliore, acc_test)`
    },

    {
      type: "exercise", id: "sk2-39", kg: 20, title: "Drill: Ridge vs Lasso, coefficienti massimi",
      task: `<p>Su diabetes (già splittato): <code>ridge</code> e <code>lasso</code> con <code>alpha=0.5</code>, confronta i coefficienti massimi in valore assoluto in <code>coef_max</code> (dizionario).</p>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import Ridge, Lasso
# X_train, y_train: gia' pronti

ridge = Ridge(alpha=0.5).fit(X_train, y_train)
lasso = Lasso(alpha=0.5).fit(X_train, y_train)

coef_max = {
    "ridge": float(np.abs(ridge.coef_).max()),
    "lasso": float(np.abs(lasso.coef_).max()),
}

print(coef_max)`,
      check: `assert set(coef_max.keys()) == {"ridge", "lasso"}
assert coef_max["ridge"] > 0 and coef_max["lasso"] > 0`,
      hint: `<p>Stesso rito di sempre: crea, fit, poi <code>np.abs(modello.coef_).max()</code>.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import Ridge, Lasso

ridge = Ridge(alpha=0.5).fit(X_train, y_train)
lasso = Lasso(alpha=0.5).fit(X_train, y_train)

coef_max = {
    "ridge": float(np.abs(ridge.coef_).max()),
    "lasso": float(np.abs(lasso.coef_).max()),
}

print(coef_max)`
    },

    {
      type: "exercise", id: "sk2-40", kg: 20, title: "Combo: pipeline + CV su iris con SVM",
      task: `<p>Su tutto iris: <code>pipe</code> (scaler+SVM), <code>scores</code> (CV a 5 fold), <code>media</code>, <code>std</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_iris

iris = load_iris()
pipe = make_pipeline(StandardScaler(), SVC())
scores = cross_val_score(pipe, iris.data, iris.target, cv=5)

media = scores.mean()
std = scores.std()

print(scores)
print(media, std)`,
      check: `assert media > 0.9
assert std < 0.15`,
      hint: `<p>Su iris, quasi ogni modello ragionevole con CV supera il 90% di media.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_iris

iris = load_iris()
pipe = make_pipeline(StandardScaler(), SVC())
scores = cross_val_score(pipe, iris.data, iris.target, cv=5)

media = scores.mean()
std = scores.std()

print(scores)
print(media, std)`
    },

    {
      type: "exercise", id: "sk2-41", kg: 25, title: "Combo: la profondità migliore su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): per profondità da 1 a 10, trova <code>depth_migliore</code> (quella con <code>acc_test</code> più alta).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

acc_test_per_depth = {}
for depth in range(1, 11):
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    acc_test_per_depth[depth] = albero.score(X_test, y_test)

depth_migliore = max(acc_test_per_depth, key=acc_test_per_depth.get)
print(acc_test_per_depth)
print(depth_migliore)`,
      check: `assert 1 <= depth_migliore <= 10
assert acc_test_per_depth[depth_migliore] == max(acc_test_per_depth.values())`,
      hint: `<p>La profondità che massimizza <code>acc_train</code> è quasi sempre la più alta; quella che massimizza <code>acc_test</code> è spesso più moderata.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

acc_test_per_depth = {}
for depth in range(1, 11):
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    acc_test_per_depth[depth] = albero.score(X_test, y_test)

depth_migliore = max(acc_test_per_depth, key=acc_test_per_depth.get)
print(acc_test_per_depth)
print(depth_migliore)`
    },

    {
      type: "exercise", id: "sk2-42", kg: 25, title: "Combo: le 3 feature più importanti su wine",
      task: `<p>Su wine (già splittato): RandomForest, <code>top3_features</code> (3 nomi, decrescente).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
nomi = list(_wine.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X_train, y_train, nomi: gia' pronti

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

ordine = np.argsort(rf.feature_importances_)[::-1]
top3_features = [nomi[i] for i in ordine[:3]]

print(top3_features)`,
      check: `assert len(top3_features) == 3
assert len(set(top3_features)) == 3
assert all(f in nomi for f in top3_features)`,
      hint: `<p><code>argsort</code> ordina crescente, <code>[::-1]</code> inverte, <code>[:3]</code> prende i primi 3.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(X_train, y_train)

ordine = np.argsort(rf.feature_importances_)[::-1]
top3_features = [nomi[i] for i in ordine[:3]]

print(top3_features)`
    },

    {
      type: "exercise", id: "sk2-43", kg: 25, title: "Combo: PCA poi KMeans, seconda versione",
      task: `<p>Su <code>X</code> (3 nuvole, 8 feature): riduci a 2 componenti con PCA, poi <code>KMeans(3)</code> sui dati ridotti. <code>dimensioni</code> deve ritrovare i 3 gruppi.</p>`,
      setup: `import numpy as np
rng = np.random.default_rng(3)
centri = [np.zeros(8), np.full(8, 7.0), np.concatenate([np.zeros(4), np.full(4, 7.0)])]
X = np.vstack([rng.normal(c, 0.4, size=(12, 8)) for c in centri])`,
      starter: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
# X: gia' pronto (36 punti, 8 feature, 3 gruppi nascosti)

X_2d = PCA(n_components=2).fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X_2d)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`,
      check: `assert sorted(dimensioni.tolist()) == [12, 12, 12]`,
      hint: `<p>Con nuvole ben separate anche in 8 dimensioni, la PCA a 2 componenti conserva abbastanza struttura per il clustering.</p>`,
      solution: `import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

X_2d = PCA(n_components=2).fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0)
etichette = km.fit_predict(X_2d)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`
    },

    {
      type: "exercise", id: "sk2-44", kg: 25, title: "Combo: GridSearch a due parametri su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): griglia <code>{"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}</code>. <code>n_combinazioni</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
# X_train, y_train: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

n_combinazioni = len(ricerca.cv_results_["params"])
print(n_combinazioni)
print(ricerca.best_params_)`,
      check: `assert n_combinazioni == 6`,
      hint: `<p>3 valori di C per 2 kernel fa 6 combinazioni totali.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

n_combinazioni = len(ricerca.cv_results_["params"])
print(n_combinazioni)
print(ricerca.best_params_)`
    },

    {
      type: "exercise", id: "sk2-45", kg: 25, title: "Combo: Ridge a tre alpha estremi",
      task: `<p>Su diabetes (già splittato): per <code>alpha</code> in <code>[0.001, 1, 1000]</code>, <code>risultati</code> (r2_test per alpha).</p>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `from sklearn.linear_model import Ridge
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
for alpha in [0.001, 1, 1000]:
    r = Ridge(alpha=alpha)
    r.fit(X_train, y_train)
    risultati[alpha] = r.score(X_test, y_test)

print(risultati)`,
      check: `assert set(risultati.keys()) == {0.001, 1, 1000}
assert risultati[1000] < risultati[1], "alpha=1000 e' una penalita' talmente forte da sotto-adattare rispetto ad alpha=1"`,
      hint: `<p>Con alpha altissimo, Ridge schiaccia quasi tutti i coefficienti verso zero: il modello diventa troppo semplice (underfitting).</p>`,
      solution: `from sklearn.linear_model import Ridge

risultati = {}
for alpha in [0.001, 1, 1000]:
    r = Ridge(alpha=alpha)
    r.fit(X_train, y_train)
    risultati[alpha] = r.score(X_test, y_test)

print(risultati)`
    },

    {
      type: "exercise", id: "sk2-46", kg: 25, title: "Combo: quattro modelli su wine",
      task: `<p>Su tutto wine: confronta con CV (cv=5) KNN, SVM, RandomForest e LogisticRegression (i primi tre in pipeline con scaler dove serve). <code>classifica</code>, <code>vincitore</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_wine

wine = load_wine()
X, y = wine.data, wine.target

classifica = {
    "knn": cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=5).mean(),
    "svm": cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean(),
    "forest": cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean(),
    "logistic": cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean(),
}
vincitore = max(classifica, key=classifica.get)

print(classifica)
print(vincitore)`,
      check: `assert set(classifica.keys()) == {"knn", "svm", "forest", "logistic"}
assert all(v > 0.9 for v in classifica.values())
assert vincitore in classifica`,
      hint: `<p>Con lo scaler in pipeline, su wine tutti e quattro i modelli devono ottenere ottimi risultati.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_wine

wine = load_wine()
X, y = wine.data, wine.target

classifica = {
    "knn": cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=5).mean(),
    "svm": cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean(),
    "forest": cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean(),
    "logistic": cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean(),
}
vincitore = max(classifica, key=classifica.get)

print(classifica)
print(vincitore)`
    },

    {
      type: "exercise", id: "sk2-47", kg: 25, title: "Massimale: quante componenti servono su wine",
      task: `<p>Su wine standardizzato: PCA con tutte le componenti, <code>n_componenti_90</code> (minime per il 90% della varianza).</p>`,
      starter: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)

cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

print(cumulata.round(3))
print(n_componenti_90)`,
      check: `assert n_componenti_90 < 13
assert n_componenti_90 >= 1`,
      hint: `<p>Devono bastare meno delle 13 feature originali per catturare il 90% della varianza.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)

cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

print(cumulata.round(3))
print(n_componenti_90)`
    },

    {
      type: "exercise", id: "sk2-48", kg: 25, title: "Massimale: report GridSearch su breast_cancer",
      task: `<p>Su tutto breast_cancer: <code>referto</code> con <code>"miglior_c"</code>, <code>"miglior_score_cv"</code>, <code>"n_fold"</code>, da una <code>GridSearchCV</code> su pipeline scaler+SVM.</p>`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_fold": 5,
}

print(referto)`,
      check: `assert referto["miglior_c"] in [0.1, 1, 10]
assert referto["miglior_score_cv"] > 0.9
assert referto["n_fold"] == 5`,
      hint: `<p><code>best_score_</code> è già la media di CV della combinazione vincente.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_fold": 5,
}

print(referto)`
    },

    {
      type: "exercise", id: "sk2-49", kg: 25, title: "Massimale: clustering e verità nascosta su wine",
      task: `<p>Su wine (che ha etichette vere): <code>KMeans(n_clusters=3, n_init=10, random_state=0)</code> su <code>X</code> <strong>standardizzato</strong>, confronta con <code>y</code> vero via <code>pd.crosstab</code>. <code>diagonale_massima</code>.</p>`,
      starter: `import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.datasets import load_wine

wine = load_wine()
X_scaled = StandardScaler().fit_transform(wine.data)

km = KMeans(n_clusters=3, n_init=10, random_state=0)
cluster = km.fit_predict(X_scaled)

tabella = pd.crosstab(wine.target, cluster)
print(tabella)

diagonale_massima = tabella.values.max(axis=1).sum()
print(diagonale_massima)`,
      check: `assert diagonale_massima >= 130, "Su wine standardizzato, KMeans deve ritrovare la maggior parte delle 3 cantine reali"`,
      hint: `<p>Senza standardizzare prima, il clustering su wine è dominato dalla prolina e va molto peggio: standardizzare è decisivo qui quanto lo era per KNN e SVM.</p>`,
      solution: `import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.datasets import load_wine

wine = load_wine()
X_scaled = StandardScaler().fit_transform(wine.data)

km = KMeans(n_clusters=3, n_init=10, random_state=0)
cluster = km.fit_predict(X_scaled)

tabella = pd.crosstab(wine.target, cluster)
print(tabella)

diagonale_massima = tabella.values.max(axis=1).sum()
print(diagonale_massima)`
    },

    {
      type: "exercise", id: "sk2-50", kg: 25, title: "Massimale finale: protocollo completo su wine",
      task: `<p>Su wine (dataset intero): <code>report_finale</code> con <code>"cv_media"</code>, <code>"cv_std"</code> (RandomForest, cv=5), <code>"top_feature"</code>, <code>"n_componenti_90"</code> (PCA standardizzata).</p>`,
      starter: `import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

wine = load_wine()
X, y = wine.data, wine.target
nomi = list(wine.feature_names)

rf = RandomForestClassifier(n_estimators=100, random_state=0)
cv_scores = cross_val_score(rf, X, y, cv=5)

rf.fit(X, y)
top_feature = nomi[np.argmax(rf.feature_importances_)]

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

report_finale = {
    "cv_media": cv_scores.mean(),
    "cv_std": cv_scores.std(),
    "top_feature": top_feature,
    "n_componenti_90": n_componenti_90,
}

for k, v in report_finale.items():
    print(k, v)`,
      check: `assert report_finale["cv_media"] > 0.9
assert report_finale["top_feature"] in nomi
assert report_finale["n_componenti_90"] < 13`,
      hint: `<p>Stesso protocollo del massimale finale della sala su breast_cancer, applicato qui a wine.</p>`,
      solution: `import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

wine = load_wine()
X, y = wine.data, wine.target
nomi = list(wine.feature_names)

rf = RandomForestClassifier(n_estimators=100, random_state=0)
cv_scores = cross_val_score(rf, X, y, cv=5)

rf.fit(X, y)
top_feature = nomi[np.argmax(rf.feature_importances_)]

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

report_finale = {
    "cv_media": cv_scores.mean(),
    "cv_std": cv_scores.std(),
    "top_feature": top_feature,
    "n_componenti_90": n_componenti_90,
}

for k, v in report_finale.items():
    print(k, v)`
    },

    {
      type: "exercise", id: "sk2-51", kg: 15, title: "Drill: disciplina dello scaler su iris",
      task: `<p>Su iris (già splittato): <code>scaler</code> fittato SOLO sul train. <code>media_train</code> (~0).</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.preprocessing import StandardScaler
# X_train, X_test: gia' pronti

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`,
      check: `assert abs(media_train) < 1e-6`,
      hint: `<p><code>fit_transform</code> sul train, <code>transform</code> soltanto sul test.</p>`,
      solution: `from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

media_train = X_train_s.mean()
print(media_train)`
    },

    {
      type: "exercise", id: "sk2-52", kg: 20, title: "Drill: pipeline KNN su iris",
      task: `<p>Su iris (già splittato): pipeline <code>StandardScaler</code> + <code>KNeighborsClassifier(5)</code>, <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Su iris, KNN con o senza scaler va quasi sempre bene: le 4 misure hanno scale simili.</p>`,
      solution: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk2-53", kg: 20, title: "Drill: cross-validation con RandomForest su wine",
      task: `<p>Su tutto wine: <code>scores</code> (CV a 5 fold di <code>RandomForestClassifier(100, random_state=0)</code>, senza scaler), <code>media</code>.</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_wine

wine = load_wine()
scores = cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), wine.data, wine.target, cv=5)
media = scores.mean()

print(scores)
print(media)`,
      check: `assert len(scores) == 5
assert media > 0.9`,
      hint: `<p>Gli alberi non ragionano per distanze: nessuno scaler necessario, a differenza di KNN e SVM.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_wine

wine = load_wine()
scores = cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), wine.data, wine.target, cv=5)
media = scores.mean()

print(scores)
print(media)`
    },

    {
      type: "exercise", id: "sk2-54", kg: 20, title: "Drill: overfitting su iris",
      task: `<p>Su iris (già splittato), per profondità <code>[2, 20]</code>: <code>gap_2</code>, <code>gap_20</code> (train − test).</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
for depth in [2, 20]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

gap_2 = risultati[2][0] - risultati[2][1]
gap_20 = risultati[20][0] - risultati[20][1]

print(gap_2, gap_20)`,
      check: `assert risultati[20][0] > 0.95, "L'albero profondo deve quasi memorizzare il training (acc_train ~1.0)"
assert gap_2 >= -1e-9 and gap_20 >= -1e-9, "Su un train/test split, l'accuratezza sul train non e' mai peggiore di quella sul test per un albero cosi' flessibile"`,
      hint: `<p>Su iris (un dataset facile, quasi senza rumore) il fenomeno dell'overfitting è meno marcato che sui dati rumorosi apposta della teoria: entrambe le profondità restano vicine al 100% sul train.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier

risultati = {}
for depth in [2, 20]:
    albero = DecisionTreeClassifier(max_depth=depth, random_state=0)
    albero.fit(X_train, y_train)
    risultati[depth] = (albero.score(X_train, y_train), albero.score(X_test, y_test))

gap_2 = risultati[2][0] - risultati[2][1]
gap_20 = risultati[20][0] - risultati[20][1]

print(gap_2, gap_20)`
    },

    {
      type: "exercise", id: "sk2-55", kg: 20, title: "Drill: KMeans su due nuvole",
      task: `<p>Su <code>X</code> (2 nuvole ben separate, 40 punti): <code>KMeans(n_clusters=2, n_init=10, random_state=0)</code>, <code>dimensioni</code>.</p>`,
      setup: `import numpy as np
rng = np.random.default_rng(6)
a = rng.normal([0, 0], 0.4, size=(20, 2))
b = rng.normal([6, 6], 0.4, size=(20, 2))
X = np.vstack([a, b])`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
# X: gia' pronto

km = KMeans(n_clusters=2, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`,
      check: `assert sorted(dimensioni.tolist()) == [20, 20]`,
      hint: `<p>Due nuvole nettamente separate: KMeans le ritrova quasi sempre esattamente 20-20.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans

km = KMeans(n_clusters=2, n_init=10, random_state=0)
etichette = km.fit_predict(X)
dimensioni = np.bincount(etichette)

print(sorted(dimensioni.tolist()))`
    },

    {
      type: "exercise", id: "sk2-56", kg: 20, title: "Drill: prima componente su wine",
      task: `<p>Su wine (standardizzato): <code>PCA(n_components=1)</code>, <code>varianza_pc1</code>.</p>`,
      starter: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=1)
pca.fit(X_scaled)

varianza_pc1 = pca.explained_variance_ratio_[0]
print(varianza_pc1)`,
      check: `assert 0.25 < varianza_pc1 < 0.45`,
      hint: `<p>Su wine, la prima componente da sola cattura una fetta importante ma non enorme dell'informazione (le 13 feature sono meno ridondanti che in breast_cancer).</p>`,
      solution: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine

X = load_wine().data
X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=1)
pca.fit(X_scaled)

varianza_pc1 = pca.explained_variance_ratio_[0]
print(varianza_pc1)`
    },

    {
      type: "exercise", id: "sk2-57", kg: 25, title: "Drill: GridSearch sul k del KNN, breast_cancer",
      task: `<p>Su breast_cancer (già splittato): pipeline scaler+KNN, griglia <code>{"kneighborsclassifier__n_neighbors": [3, 5, 7, 11]}</code>. <code>k_migliore</code>, <code>acc_finale</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
griglia = {"kneighborsclassifier__n_neighbors": [3, 5, 7, 11]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

k_migliore = ricerca.best_params_["kneighborsclassifier__n_neighbors"]
acc_finale = ricerca.score(X_test, y_test)

print(k_migliore, acc_finale)`,
      check: `assert k_migliore in [3, 5, 7, 11]
assert acc_finale > 0.9`,
      hint: `<p>La chiave della griglia combacia col nome del passo pipeline più due underscore più il nome del parametro.</p>`,
      solution: `from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
griglia = {"kneighborsclassifier__n_neighbors": [3, 5, 7, 11]}

ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X_train, y_train)

k_migliore = ricerca.best_params_["kneighborsclassifier__n_neighbors"]
acc_finale = ricerca.score(X_test, y_test)

print(k_migliore, acc_finale)`
    },

    {
      type: "exercise", id: "sk2-58", kg: 25, title: "Combo: Lasso che si svuota, altri alpha",
      task: `<p>Su diabetes (già splittato): per <code>alpha</code> in <code>[0.5, 5, 50]</code>, conta i coefficienti non-zero di Lasso, <code>non_zero</code> (dizionario).</p>`,
      setup: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import Lasso
# X_train, y_train: gia' pronti

non_zero = {}
for alpha in [0.5, 5, 50]:
    l = Lasso(alpha=alpha)
    l.fit(X_train, y_train)
    non_zero[alpha] = int(np.sum(np.abs(l.coef_) > 1e-10))

print(non_zero)`,
      check: `assert non_zero[0.5] >= non_zero[5] >= non_zero[50], "Piu' alpha cresce, meno feature devono sopravvivere (o restare uguali)"`,
      hint: `<p>Con <code>alpha=50</code>, molti (forse tutti) i coefficienti di Lasso su diabetes si azzerano.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import Lasso

non_zero = {}
for alpha in [0.5, 5, 50]:
    l = Lasso(alpha=alpha)
    l.fit(X_train, y_train)
    non_zero[alpha] = int(np.sum(np.abs(l.coef_) > 1e-10))

print(non_zero)`
    },

    {
      type: "exercise", id: "sk2-59", kg: 25, title: "Combo: logistic vs SVM in pipeline su breast_cancer",
      task: `<p>Su tutto breast_cancer: confronta con CV (cv=5) <code>LogisticRegression</code> e <code>SVC</code> (entrambi in pipeline con scaler). <code>differenza</code> (svm − logistic).</p>`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

media_log = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean()
media_svm = cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean()

differenza = media_svm - media_log
print(media_log, media_svm, differenza)`,
      check: `assert media_log > 0.9
assert media_svm > 0.9
assert abs(differenza - (media_svm - media_log)) < 1e-12`,
      hint: `<p>Su breast_cancer, con lo scaler, entrambi i modelli vanno quasi sempre molto bene: la differenza tra loro resta piccola.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

media_log = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean()
media_svm = cross_val_score(make_pipeline(StandardScaler(), SVC()), X, y, cv=5).mean()

differenza = media_svm - media_log
print(media_log, media_svm, differenza)`
    },

    {
      type: "exercise", id: "sk2-60", kg: 25, title: "Massimale finalissimo: GridSearch + PCA su breast_cancer",
      task: `<p>Su breast_cancer (dataset intero): costruisci <code>referto</code> con <code>"miglior_c"</code> e <code>"miglior_score_cv"</code> (da GridSearch su pipeline scaler+SVM, griglia <code>{"svc__C": [0.1, 1, 10, 100]}</code>) e <code>"n_componenti_90"</code> (PCA standardizzata).</p>`,
      starter: `import numpy as np
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10, 100]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_componenti_90": n_componenti_90,
}

print(referto)`,
      check: `assert referto["miglior_c"] in [0.1, 1, 10, 100]
assert referto["miglior_score_cv"] > 0.9
assert referto["n_componenti_90"] < 30`,
      hint: `<p>Nessun concetto nuovo: è la sintesi di GridSearchCV e PCA, i due ultimi attrezzi della sala, in un solo report.</p>`,
      solution: `import numpy as np
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.datasets import load_breast_cancer

bc = load_breast_cancer()
X, y = bc.data, bc.target

pipe = make_pipeline(StandardScaler(), SVC())
griglia = {"svc__C": [0.1, 1, 10, 100]}
ricerca = GridSearchCV(pipe, griglia, cv=5)
ricerca.fit(X, y)

X_scaled = StandardScaler().fit_transform(X)
pca = PCA().fit(X_scaled)
cumulata = np.cumsum(pca.explained_variance_ratio_)
n_componenti_90 = int(np.argmax(cumulata >= 0.90)) + 1

referto = {
    "miglior_c": ricerca.best_params_["svc__C"],
    "miglior_score_cv": ricerca.best_score_,
    "n_componenti_90": n_componenti_90,
}

print(referto)`
    }
  ]
});
