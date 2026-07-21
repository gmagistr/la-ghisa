window.MODULES.push({
  id: "model-evaluation",
  name: "Validazione dei Modelli",
  tagline: "La sala del giudice onesto: CV, leakage, ROC, soglie. Dove si scopre se il modello vale davvero o si è solo illuso.",
  intro: "Il modello dice 99% di accuratezza. Ci credi? Questa sala insegna a non farti ingannare: split corretti, cross-validation, il leakage che gonfia tutto, e le metriche che raccontano la verità quando l'accuratezza mente. Serve scikit-learn.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Train, validation, test: tre ruoli diversi", html: `
<p>Un modello valutato sugli stessi dati con cui è stato addestrato è come un atleta che si dà i voti da solo: sempre ottimi. Servono dati mai visti. La divisione classica è in tre:</p>
<ul>
<li><strong>Train</strong>: il modello impara qui i suoi parametri;</li>
<li><strong>Validation</strong>: qui scegli iperparametri e confronti modelli;</li>
<li><strong>Test</strong>: toccato UNA volta sola, alla fine, per la stima onesta finale.</li>
</ul>
<pre><code>from sklearn.model_selection import train_test_split
# prima separo il test (30%), poi divido il resto in train/val
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=0)</code></pre>
<p>La regola d'oro: il test set si guarda <strong>una volta sola</strong>, alla fine. Ogni volta che "aggiusti" il modello guardando il test, lo stai trasformando in un validation set — e la stima finale diventa ottimistica.</p>
`, more: `
<p>Perché tre insiemi e non due? Perché scegliere gli iperparametri È una forma di apprendimento. Se usassi il test per scegliere il miglior modello tra 50 candidati, il vincitore sarebbe in parte fortunato su QUEL test specifico, e la sua performance risulterebbe gonfiata. Il validation assorbe questa "usura da scelta"; il test resta vergine per la stima finale. Con la cross-validation (prossima lavagna) il validation diventa mobile e usi i dati meglio, ma la logica non cambia: qualcosa che ha guidato le tue decisioni non può stimare onestamente il risultato.</p>
<p>Le proporzioni tipiche (60/20/20 o 70/15/15) non sono sacre: dipendono da quanti dati hai. Con milioni di esempi, anche l'1% di test è più che sufficiente (decine di migliaia di casi danno stime stabili); con poche centinaia di dati, un test del 20% è troppo rumoroso per fidarsi, e lì la cross-validation diventa quasi obbligatoria. La domanda giusta non è "quale percentuale" ma "quanti esempi assoluti servono al test/validation per una stima stabile della metrica che mi interessa".</p>
<p>Il <code>random_state</code> fissa il seed dello split: è indispensabile per la riproducibilità (stesso split ad ogni esecuzione), ma nasconde un rischio — se scegli il modello confrontando risultati su UN solo split, stai vedendo una sola realizzazione del caso. Cambiare seed può cambiare la classifica dei modelli quando le differenze sono piccole. È esattamente il rumore che la cross-validation media via, misurando anche quanto ballano i risultati tra split diversi.</p>
` },

    {
      type: "exercise", id: "me-01", kg: 5, title: "Il primo split onesto",
      task: `<p>Dividi i dati in train e test (test 30%), addestra e confronta le due accuratezze:</p>
<ul>
<li><code>X_train, X_test, y_train, y_test</code>: da <code>train_test_split</code> con <code>test_size=0.3, random_state=0</code></li>
<li><code>acc_train</code>: accuratezza sul train</li>
<li><code>acc_test</code>: accuratezza sul test</li>
<li><code>ottimista</code>: <code>True</code> se <code>acc_train &gt; acc_test</code> (quasi sempre: sul train il modello gioca in casa)</li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: `from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
# X, y: dataset breast cancer

X_train, X_test, y_train, y_test = ...

clf = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
acc_train = ...
acc_test = ...
ottimista = ...

print(f"train {acc_train:.3f} | test {acc_test:.3f} | ottimista sul train: {ottimista}")`,
      check: `from sklearn.model_selection import train_test_split
assert 'X_train' in globals() and 'X_test' in globals(), "usa train_test_split(X, y, test_size=0.3, random_state=0)"
assert abs(len(X_test)/len(X) - 0.3) < 0.02, "test_size deve essere 0.3"
assert 'acc_train' in globals() and abs(float(acc_train) - 1.0) < 1e-6, "acc_train: un albero senza limiti memorizza il train -> 1.0"
assert 'acc_test' in globals() and float(acc_test) < 1.0, "acc_test: sul test la performance e' inferiore (dati mai visti)"
assert 'ottimista' in globals() and ottimista == True, "ottimista: True — l'albero e' perfetto sul train ma no sul test: valutare sul train inganna"`,
      hint: `<p><code>train_test_split(X, y, test_size=0.3, random_state=0)</code> restituisce 4 pezzi in quest'ordine. L'albero senza <code>max_depth</code> memorizza il train (accuratezza 1.0), ma sul test crolla: ecco perché il train non basta.</p>`,
      solution: `from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

clf = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
acc_train = clf.score(X_train, y_train)
acc_test = clf.score(X_test, y_test)
ottimista = acc_train > acc_test

print(f"train {acc_train:.3f} | test {acc_test:.3f} | ottimista sul train: {ottimista}")`
    },

    { type: "theory", title: "K-fold cross-validation", html: `
<p>Un solo split spreca dati (il test non serve mai ad addestrare) e dà una stima rumorosa (dipende da QUALE 30% è finito nel test). La <strong>k-fold cross-validation</strong> risolve entrambi: divide i dati in k parti, addestra k volte usando ogni volta una parte diversa come validation e le altre come train.</p>
<pre><code>from sklearn.model_selection import cross_val_score
scores = cross_val_score(modello, X, y, cv=5)   # 5 fold
scores.mean()   # stima media della performance
scores.std()    # quanto balla tra i fold: l'incertezza</code></pre>
<p>Ogni esempio finisce nel validation esattamente una volta e nel train k-1 volte: nessun dato sprecato. La <strong>media</strong> dei k punteggi è la stima; la <strong>deviazione standard</strong> dice quanto è stabile. Valori tipici di k: 5 o 10.</p>
`, more: `
<p>Il trade-off di k: k grande (es. 10) significa più dati di training in ogni fold (stima meno distorta, più vicina a quella che avresti con tutti i dati) ma k addestramenti costosi e fold di validation piccoli (stime per-fold più rumorose). k piccolo (es. 3) è veloce ma ogni modello vede meno dati. Il caso estremo è il <strong>Leave-One-Out</strong> (k = n, ogni fold valida su un solo esempio): quasi non distorto ma costosissimo e con alta varianza. Il 5 o 10 è il compromesso standard perché bilancia bene questi effetti nella maggior parte dei casi.</p>
<p>La deviazione standard tra i fold è informazione preziosa che un singolo split non dà: se il modello A ha media 0.85±0.02 e il modello B 0.86±0.08, B è "migliore" in media ma molto più instabile — su nuovi dati potrebbe fare peggio di A. Confrontare modelli solo sulle medie, ignorando la variabilità, porta a scegliere modelli fragili. Una differenza di media più piccola della somma delle deviazioni standard raramente è una differenza reale.</p>
<p>Cruciale e ripetuto da tutta la sala precedente: qualunque preprocessing che impari dai dati (scaling, imputazione, selezione feature, encoding) va rifittato DENTRO ogni fold, sul solo train del fold. <code>cross_val_score</code> lo fa automaticamente SOLO se gli passi una <code>Pipeline</code> completa, non i dati già trasformati. Passare <code>cross_val_score(modello, X_gia_scalato, y)</code> è leakage silenzioso: le statistiche di scaling hanno già visto tutti i dati, inclusi quelli di validation di ogni fold.</p>
` },

    {
      type: "exercise", id: "me-02", kg: 10, title: "Cinque giudici invece di uno",
      task: `<p>Valuta un modello con la 5-fold CV e leggi media e stabilità:</p>
<ul>
<li><code>scores</code>: i 5 punteggi di <code>cross_val_score</code> (cv=5)</li>
<li><code>media</code>, <code>deviazione</code>: media e deviazione standard dei punteggi</li>
<li><code>n_punteggi</code>: quanti punteggi (deve essere 5)</li>
<li><code>stabile</code>: <code>True</code> se la deviazione è piccola (&lt; 0.05): il modello si comporta in modo coerente tra i fold</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
X, y = load_wine(return_X_y=True)`,
      starter: `from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
# X, y: dataset wine

modello = RandomForestClassifier(random_state=0)
scores = ...
media = ...
deviazione = ...
n_punteggi = ...
stabile = ...

print(f"punteggi: {scores.round(3)} | media {media:.3f} +/- {deviazione:.3f} | stabile: {stabile}")`,
      check: `import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
_s = cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5)
assert 'scores' in globals() and len(scores) == 5, "scores: cross_val_score(modello, X, y, cv=5) -> 5 valori"
assert 'media' in globals() and abs(float(media) - float(_s.mean())) < 1e-6, "media: scores.mean()"
assert 'deviazione' in globals() and abs(float(deviazione) - float(_s.std())) < 1e-6, "deviazione: scores.std()"
assert 'n_punteggi' in globals() and n_punteggi == 5, "n_punteggi: len(scores) = 5"
assert 'stabile' in globals() and stabile == True, "stabile: True — la RF su wine e' molto coerente tra i fold"`,
      hint: `<p><code>cross_val_score(modello, X, y, cv=5)</code> restituisce un array di 5 punteggi. Media e deviazione con <code>.mean()</code> e <code>.std()</code>. <code>stabile = deviazione &lt; 0.05</code>.</p>`,
      solution: `from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

modello = RandomForestClassifier(random_state=0)
scores = cross_val_score(modello, X, y, cv=5)
media = scores.mean()
deviazione = scores.std()
n_punteggi = len(scores)
stabile = deviazione < 0.05

print(f"punteggi: {scores.round(3)} | media {media:.3f} +/- {deviazione:.3f} | stabile: {stabile}")`
    },

    { type: "theory", title: "Stratified CV: mantenere le proporzioni", html: `
<p>Con classi sbilanciate (95% clienti che restano, 5% che abbandonano), un k-fold casuale può creare fold con proporzioni diverse — o addirittura fold senza nessun caso della classe rara. La <strong>stratified k-fold</strong> garantisce che ogni fold rispetti le proporzioni delle classi del dataset completo.</p>
<pre><code>from sklearn.model_selection import StratifiedKFold, cross_val_score
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
cross_val_score(modello, X, y, cv=skf)</code></pre>
<p>Buona notizia: per i problemi di <strong>classificazione</strong>, <code>cross_val_score</code> usa la stratificazione <em>di default</em> quando passi <code>cv=5</code> (un intero). Ma è bene conoscerla esplicitamente, perché serve controllarla quando i dati hanno struttura (gruppi, tempo).</p>
`, more: `
<p>Senza stratificazione, il rischio con classi molto rare è concreto e grave: un fold potrebbe non contenere ALCUN esempio della classe minoritaria, rendendo impossibile calcolare metriche come recall o precision per quella classe (divisione per zero, o metrica indefinita). Anche quando non è così estremo, fold con proporzioni ballerine gonfiano artificialmente la varianza tra i fold — parte della "instabilità" che osservi non è del modello ma dello split mal fatto. La stratificazione toglie questa fonte di rumore spuria.</p>
<p>Attenzione a quando la stratificazione NON basta o è sbagliata: (1) con dati <strong>raggruppati</strong> (più righe dello stesso paziente, cliente, utente) serve <code>GroupKFold</code>, che tiene tutte le righe di un gruppo nello stesso fold — altrimenti lo stesso soggetto finisce sia in train che in validation e il modello "riconosce" invece di generalizzare (una forma di leakage); (2) con dati <strong>temporali</strong> la stratificazione casuale è proprio vietata, perché mescola passato e futuro — lì serve lo split temporale della prossima lavagna. La domanda da porsi sempre prima di scegliere lo splitter: "i miei dati hanno una struttura — classi, gruppi, tempo — che lo split deve rispettare?".</p>
` },

    {
      type: "exercise", id: "me-03", kg: 10, title: "Fold equilibrati con classi rare",
      task: `<p>Un dataset sbilanciato (85%/15%). Confronta la variabilità tra fold stratificati e non:</p>
<ul>
<li><code>skf</code>: <code>StratifiedKFold(n_splits=5, shuffle=True, random_state=0)</code></li>
<li><code>prop_per_fold</code>: lista della proporzione della classe 1 nel VALIDATION di ogni fold stratificato (dovrebbero essere tutte simili)</li>
<li><code>prop_globale</code>: proporzione della classe 1 nell'intero dataset</li>
<li><code>ben_stratificato</code>: <code>True</code> se ogni proporzione dista meno di 0.03 da quella globale</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(500, 4))
y = (rng.random(500) < 0.15).astype(int)   # ~15% classe 1`,
      starter: `import numpy as np
from sklearn.model_selection import StratifiedKFold
# X, y: dataset sbilanciato (~15% classe 1)

skf = ...
prop_globale = y.mean()

prop_per_fold = []
for train_idx, val_idx in skf.split(X, y):
    prop_per_fold.append(y[val_idx].mean())

ben_stratificato = ...

print("proporzioni per fold:", [round(p, 3) for p in prop_per_fold])
print("globale:", round(prop_globale, 3), "| ben stratificato:", ben_stratificato)`,
      check: `import numpy as np
from sklearn.model_selection import StratifiedKFold
assert 'skf' in globals() and isinstance(skf, StratifiedKFold), "skf: StratifiedKFold(n_splits=5, shuffle=True, random_state=0)"
assert 'prop_per_fold' in globals() and len(prop_per_fold) == 5, "prop_per_fold: una proporzione per fold, 5 in tutto"
assert 'ben_stratificato' in globals() and ben_stratificato == True, "ben_stratificato: True — ogni fold rispetta il ~15% globale entro 0.03"`,
      hint: `<p>Costruisci lo <code>StratifiedKFold</code>, poi cicla su <code>skf.split(X, y)</code>. Per il controllo: <code>all(abs(p - prop_globale) &lt; 0.03 for p in prop_per_fold)</code>.</p>`,
      solution: `import numpy as np
from sklearn.model_selection import StratifiedKFold

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
prop_globale = y.mean()

prop_per_fold = []
for train_idx, val_idx in skf.split(X, y):
    prop_per_fold.append(y[val_idx].mean())

ben_stratificato = all(abs(p - prop_globale) < 0.03 for p in prop_per_fold)

print("proporzioni per fold:", [round(p, 3) for p in prop_per_fold])
print("globale:", round(prop_globale, 3), "| ben stratificato:", ben_stratificato)`
    },

    { type: "theory", title: "Data leakage: il killer silenzioso", html: `
<p>Il <strong>data leakage</strong> è quando informazione che in produzione non avresti "trapela" nel training, gonfiando i risultati in modo invisibile finché non è troppo tardi. È l'errore numero uno per cui i modelli brillano in test e falliscono in produzione.</p>
<p>Le forme più comuni:</p>
<ul>
<li><strong>Preprocessing prima dello split</strong>: scalare/imputare su tutti i dati fa vedere al train le statistiche del test;</li>
<li><strong>Feature dal futuro</strong>: usare informazione registrata DOPO il momento della predizione;</li>
<li><strong>Feature-target proxy</strong>: una colonna che è quasi la risposta (es. "data di disdetta" per predire chi disdice);</li>
<li><strong>Duplicati o gruppi</strong>: lo stesso soggetto in train e test.</li>
</ul>
<p>Sintomo classico: accuratezza sospettosamente alta (0.99+) su un problema difficile. Se sembra troppo bello, è leakage finché non dimostri il contrario.</p>
`, more: `
<p>Il leakage da <strong>preprocessing</strong> è il più subdolo perché il codice "sembra" giusto: <code>StandardScaler().fit_transform(X)</code> seguito da split è un pattern che si vede ovunque, e l'effetto è piccolo ma reale (il train conosce media e varianza globali, quindi anche del test). Su dataset piccoli o con forte scaling può spostare le metriche di diversi punti. La difesa strutturale, ripetuta per tutta la sala Feature Engineering, è la <code>Pipeline</code>: mette il preprocessing DENTRO la cross-validation, dove viene rifittato sul solo train di ogni fold. Non è pignoleria: è l'unico modo di misurare quello che vedrai davvero in produzione.</p>
<p>Il leakage <strong>temporale</strong> è il più costoso in denaro. "Spesa media del cliente" calcolata su tutto lo storico, usata per predire un acquisto a gennaio, include acquisti di marzo che a gennaio non esistevano. Il modello impara a "sbirciare nel futuro", il backtest è trionfale, la produzione è un disastro. Ogni feature aggregata in un contesto temporale deve avere una finestra che finisce PRIMA del momento predetto, e va validata con lo split temporale (prossima lavagna), mai con CV casuale.</p>
<p>Il leakage da <strong>proxy del target</strong> è spesso il più imbarazzante: una colonna che è di fatto la risposta travestita. Predire il churn con una feature "motivo_disdetta" (compilata solo da chi ha già disdetto), predire una malattia con "farmaco_prescritto" (dato solo ai malati). Accuratezza 0.99, modello inutile: in produzione quella colonna è vuota per i casi che devi ancora predire. Il test diagnostico: per OGNI feature ad alta importanza chiediti "questo valore esisteva, ed era già noto, nell'istante in cui devo fare la predizione?". Se la risposta è no o "solo per i casi positivi", è leakage.</p>
` },

    {
      type: "exercise", id: "me-04", kg: 15, title: "Lo scaling che bara",
      task: `<p>Dimostra il leakage da preprocessing: scalare PRIMA dello split vs dentro una pipeline. Su questo dataset l'effetto è visibile:</p>
<ul>
<li><code>acc_leakage</code>: CV score scalando TUTTO <code>X</code> prima (leakage), poi passando i dati scalati a cross_val_score</li>
<li><code>acc_corretto</code>: CV score con una <code>Pipeline</code>(scaler + modello) — scaling rifittato in ogni fold</li>
<li><code>leakage_gonfia</code>: <code>True</code> se <code>acc_leakage &gt;= acc_corretto</code> (il leakage non peggiora mai, spesso migliora la stima falsata)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=200, n_features=40, n_informative=5, random_state=1)`,
      starter: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
# X, y: 200 campioni, 40 feature

# SBAGLIATO: scalo tutto prima
X_scaled = StandardScaler().fit_transform(X)
acc_leakage = cross_val_score(KNeighborsClassifier(), X_scaled, y, cv=5).mean()

# CORRETTO: scaling dentro la pipeline
pipe = ...
acc_corretto = ...

leakage_gonfia = ...

print(f"con leakage: {acc_leakage:.3f} | corretto: {acc_corretto:.3f} | leakage gonfia: {leakage_gonfia}")`,
      check: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
_xs = StandardScaler().fit_transform(X)
_al = cross_val_score(KNeighborsClassifier(), _xs, y, cv=5).mean()
_pipe = Pipeline([("sc", StandardScaler()), ("knn", KNeighborsClassifier())])
_ac = cross_val_score(_pipe, X, y, cv=5).mean()
assert 'pipe' in globals() and isinstance(pipe, Pipeline), "pipe: Pipeline([('sc', StandardScaler()), ('knn', KNeighborsClassifier())])"
assert 'acc_corretto' in globals() and abs(float(acc_corretto) - _ac) < 1e-6, "acc_corretto: cross_val_score(pipe, X, y, cv=5).mean()"
assert 'leakage_gonfia' in globals() and leakage_gonfia == bool(_al >= _ac), "leakage_gonfia: acc_leakage >= acc_corretto"`,
      hint: `<p>La pipeline: <code>Pipeline([("sc", StandardScaler()), ("knn", KNeighborsClassifier())])</code>, poi <code>cross_val_score(pipe, X, y, cv=5).mean()</code>. Passandole X grezzo, ogni fold rifitta lo scaler correttamente.</p>`,
      solution: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

X_scaled = StandardScaler().fit_transform(X)
acc_leakage = cross_val_score(KNeighborsClassifier(), X_scaled, y, cv=5).mean()

pipe = Pipeline([("sc", StandardScaler()), ("knn", KNeighborsClassifier())])
acc_corretto = cross_val_score(pipe, X, y, cv=5).mean()

leakage_gonfia = acc_leakage >= acc_corretto

print(f"con leakage: {acc_leakage:.3f} | corretto: {acc_corretto:.3f} | leakage gonfia: {leakage_gonfia}")`
    },

    {
      type: "exercise", id: "me-05", kg: 15, title: "La feature che è la risposta",
      task: `<p>Un caso di leakage da proxy del target: una colonna che è quasi identica a y. Smaschera l'inganno:</p>
<ul>
<li><code>acc_con_proxy</code>: accuratezza CV con TUTTE le feature (inclusa la proxy)</li>
<li><code>acc_senza_proxy</code>: accuratezza CV senza la colonna proxy (l'ultima)</li>
<li><code>importanza_proxy</code>: l'importanza della feature proxy in una RandomForest addestrata su tutto</li>
<li><code>proxy_sospetta</code>: <code>True</code> se acc_con_proxy &gt; 0.98 E importanza_proxy &gt; 0.5 (domina tutto: è la risposta travestita)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=300, n_features=5, n_informative=3, random_state=2)
# aggiungo una colonna che E' quasi il target (leakage!)
proxy = y + np.random.default_rng(2).normal(0, 0.01, size=len(y))
X_leak = np.column_stack([X, proxy])`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
# X_leak: 6 feature, l'ultima e' una copia rumorosa di y

acc_con_proxy = ...
acc_senza_proxy = ...

rf = RandomForestClassifier(random_state=0).fit(X_leak, y)
importanza_proxy = ...   # importanza dell'ultima colonna
proxy_sospetta = ...

print(f"con proxy: {acc_con_proxy:.3f} | senza: {acc_senza_proxy:.3f} | importanza proxy: {importanza_proxy:.2f}")`,
      check: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
_ac = cross_val_score(RandomForestClassifier(random_state=0), X_leak, y, cv=5).mean()
_as = cross_val_score(RandomForestClassifier(random_state=0), X_leak[:,:-1], y, cv=5).mean()
assert 'acc_con_proxy' in globals() and abs(float(acc_con_proxy) - _ac) < 1e-6, "acc_con_proxy: cross_val_score su X_leak completo"
assert 'acc_senza_proxy' in globals() and abs(float(acc_senza_proxy) - _as) < 1e-6, "acc_senza_proxy: cross_val_score su X_leak[:, :-1]"
assert 'importanza_proxy' in globals() and float(importanza_proxy) > 0.5, "importanza_proxy: rf.feature_importances_[-1] domina (> 0.5)"
assert 'proxy_sospetta' in globals() and proxy_sospetta == True, "proxy_sospetta: True — accuratezza quasi perfetta + una feature che domina = classico proxy del target"`,
      hint: `<p>Con proxy: <code>cross_val_score(rf, X_leak, y, cv=5).mean()</code>. Senza: passa <code>X_leak[:, :-1]</code>. L'importanza della proxy: <code>rf.feature_importances_[-1]</code>. Quando UNA feature spiega quasi tutto e l'accuratezza è ~1.0, sospetta il leakage.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

acc_con_proxy = cross_val_score(RandomForestClassifier(random_state=0), X_leak, y, cv=5).mean()
acc_senza_proxy = cross_val_score(RandomForestClassifier(random_state=0), X_leak[:, :-1], y, cv=5).mean()

rf = RandomForestClassifier(random_state=0).fit(X_leak, y)
importanza_proxy = rf.feature_importances_[-1]
proxy_sospetta = acc_con_proxy > 0.98 and importanza_proxy > 0.5

print(f"con proxy: {acc_con_proxy:.3f} | senza: {acc_senza_proxy:.3f} | importanza proxy: {importanza_proxy:.2f}")`
    },

    { type: "theory", title: "Time series split: rispettare il tempo", html: `
<p>Con dati temporali (prezzi, vendite, log) NON puoi mescolare a caso: usare il futuro per predire il passato è leakage garantito. Il <strong>TimeSeriesSplit</strong> rispetta l'ordine cronologico — addestra sempre sul passato, valida sul futuro.</p>
<pre><code>from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, val_idx in tscv.split(X):
    # train_idx e' sempre PRIMA di val_idx nel tempo
    # e cresce ad ogni fold (walk-forward)
    ...</code></pre>
<p>Il meccanismo è "walk-forward": fold 1 addestra su [0:100], valida su [100:200]; fold 2 su [0:200], valida [200:300]; e così via. Il training cresce, la validation è sempre nel futuro immediato. È l'unico modo onesto di valutare un modello che in produzione predirà il domani coi dati di oggi.</p>
`, more: `
<p>La differenza chiave dal k-fold classico: nel k-fold ogni esempio viene validato una volta e i fold sono intercambiabili; nel TimeSeriesSplit c'è una direzione — il tempo — e i primi dati non vengono MAI validati (servono solo come training iniziale), mentre gli ultimi non addestrano mai il modello valutato prima di loro. È asimmetrico per necessità: replica esattamente la situazione reale in cui predici sempre in avanti.</p>
<p>Due raffinamenti che i colloqui premiano: (1) il <strong>gap</strong> tra train e validation, per simulare che la predizione non è istantanea — se predici le vendite di domani ma i dati di oggi arrivano con un giorno di ritardo, lasci un buco tra fine-train e inizio-validation (<code>TimeSeriesSplit(gap=...)</code>); (2) la <strong>finestra scorrevole</strong> vs espansiva — di default la finestra di training si espande (usa tutto il passato), ma per serie non stazionarie (dove il comportamento vecchio non è più rilevante) può essere meglio una finestra fissa che dimentica il passato remoto.</p>
<p>L'errore da non fare MAI: normalizzare, creare feature aggregate o imputare usando statistiche calcolate su tutta la serie prima di splittare. La media mobile, la deviazione standard, i quantili per il binning — tutto va calcolato usando solo dati fino al momento t per predire t+1. Anche una singola statistica globale (es. standardizzare con la media dell'intera serie) inietta informazione dal futuro. Con dati temporali, la regola "fit sul train" diventa "fit su tutto ciò che precede il punto predetto", ed è più facile sbagliarla che con dati normali.</p>
` },

    {
      type: "exercise", id: "me-06", kg: 15, title: "Walk-forward sul futuro",
      task: `<p>Verifica che il TimeSeriesSplit non usi mai il futuro per il training:</p>
<ul>
<li><code>tscv</code>: <code>TimeSeriesSplit(n_splits=5)</code></li>
<li><code>max_train_indices</code>: lista del massimo indice di train per ogni fold</li>
<li><code>min_val_indices</code>: lista del minimo indice di validation per ogni fold</li>
<li><code>sempre_passato</code>: <code>True</code> se in OGNI fold il massimo indice di train è minore del minimo di validation (il train precede sempre la validation)</li>
</ul>`,
      setup: `import numpy as np
X = np.arange(600).reshape(-1, 1)   # 600 punti temporali ordinati`,
      starter: `import numpy as np
from sklearn.model_selection import TimeSeriesSplit
# X: 600 punti in ordine cronologico

tscv = ...

max_train_indices = []
min_val_indices = []
for train_idx, val_idx in tscv.split(X):
    max_train_indices.append(train_idx.max())
    min_val_indices.append(val_idx.min())

sempre_passato = ...

print("max train per fold:", max_train_indices)
print("min val per fold:", min_val_indices)
print("il train precede sempre la validation:", sempre_passato)`,
      check: `import numpy as np
from sklearn.model_selection import TimeSeriesSplit
assert 'tscv' in globals() and isinstance(tscv, TimeSeriesSplit), "tscv: TimeSeriesSplit(n_splits=5)"
assert 'max_train_indices' in globals() and len(max_train_indices) == 5, "max_train_indices: uno per fold"
assert 'sempre_passato' in globals() and sempre_passato == True, "sempre_passato: True — in ogni fold max(train) < min(val): mai il futuro nel training"
assert max_train_indices == sorted(max_train_indices), "il training deve crescere ad ogni fold (walk-forward)"`,
      hint: `<p>Costruisci <code>TimeSeriesSplit(n_splits=5)</code> e cicla sui suoi split. Il controllo: <code>all(mt &lt; mv for mt, mv in zip(max_train_indices, min_val_indices))</code>.</p>`,
      solution: `import numpy as np
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)

max_train_indices = []
min_val_indices = []
for train_idx, val_idx in tscv.split(X):
    max_train_indices.append(train_idx.max())
    min_val_indices.append(val_idx.min())

sempre_passato = all(mt < mv for mt, mv in zip(max_train_indices, min_val_indices))

print("max train per fold:", max_train_indices)
print("min val per fold:", min_val_indices)
print("il train precede sempre la validation:", sempre_passato)`
    },

    {
      type: "exercise", id: "me-07", kg: 20, title: "Il backtest che mente",
      task: `<p>Dimostra perché la CV casuale inganna sui dati temporali. Una serie con trend crescente: valutala nei due modi.</p>
<ul>
<li><code>score_casuale</code>: R² medio con KFold casuale (shuffle=True) — vede anche il futuro</li>
<li><code>score_temporale</code>: R² medio con TimeSeriesSplit — solo passato&rarr;futuro</li>
<li><code>casuale_ottimista</code>: <code>True</code> se <code>score_casuale &gt; score_temporale</code> (la CV casuale sovrastima perché mescola i tempi)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(3)
t = np.arange(300)
# serie con trend + rumore: il valore dipende dal tempo
X = t.reshape(-1, 1).astype(float)
y = 0.5 * t + 10 * np.sin(t / 10) + rng.normal(0, 5, size=300)`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, KFold, TimeSeriesSplit
# X: tempo | y: serie con trend

modello = LinearRegression()
score_casuale = cross_val_score(modello, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
score_temporale = ...
casuale_ottimista = ...

print(f"CV casuale: {score_casuale:.3f} | CV temporale: {score_temporale:.3f} | casuale ottimista: {casuale_ottimista}")`,
      check: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, KFold, TimeSeriesSplit
_st = cross_val_score(LinearRegression(), X, y, cv=TimeSeriesSplit(5)).mean()
assert 'score_temporale' in globals() and abs(float(score_temporale) - _st) < 1e-6, "score_temporale: cross_val_score con cv=TimeSeriesSplit(5)"
assert 'casuale_ottimista' in globals() and casuale_ottimista == bool(cross_val_score(LinearRegression(), X, y, cv=KFold(5, shuffle=True, random_state=0)).mean() > _st), "casuale_ottimista: score_casuale > score_temporale"`,
      hint: `<p>Per la CV temporale: <code>cross_val_score(modello, X, y, cv=TimeSeriesSplit(5)).mean()</code>. La CV casuale interpola tra punti passati e futuri (facile); quella temporale deve estrapolare in avanti (onesta, più dura).</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, KFold, TimeSeriesSplit

modello = LinearRegression()
score_casuale = cross_val_score(modello, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
score_temporale = cross_val_score(modello, X, y, cv=TimeSeriesSplit(5)).mean()
casuale_ottimista = score_casuale > score_temporale

print(f"CV casuale: {score_casuale:.3f} | CV temporale: {score_temporale:.3f} | casuale ottimista: {casuale_ottimista}")`
    },

    { type: "theory", title: "La matrice di confusione", html: `
<p>L'accuratezza (frazione di predizioni giuste) nasconde tutto quando le classi sono sbilanciate. La <strong>matrice di confusione</strong> mostra i quattro esiti possibili di un classificatore binario:</p>
<pre><code>from sklearn.metrics import confusion_matrix
confusion_matrix(y_true, y_pred)
#              predetto 0    predetto 1
# reale 0  [[   TN            FP      ]     TN = veri negativi
# reale 1   [   FN            TP      ]]    FP = falsi positivi (falso allarme)
#                                          FN = falsi negativi (mancato)
#                                          TP = veri positivi</code></pre>
<p>I due errori NON sono equivalenti: un <strong>falso positivo</strong> (dire "malato" a un sano) costa diverso da un <strong>falso negativo</strong> (dire "sano" a un malato). Il contesto decide quale sia peggio — ed è da questa matrice che nascono tutte le metriche serie.</p>
`, more: `
<p>La distinzione FP vs FN è il cuore di ogni problema di classificazione reale, e cambia completamente col dominio. Screening medico per una malattia grave: un FN (mandare a casa un malato) è catastrofico, un FP (un accertamento in più a un sano) è tollerabile — si tara il modello per minimizzare i FN anche a costo di molti FP. Filtro antispam: un FP (un'email importante finita nello spam) è molto peggio di un FN (un po' di spam che passa) — l'opposto. Non esiste "l'errore da minimizzare" in astratto: esiste il costo relativo dei due errori NEL tuo dominio, e da quello discende come tarare il modello.</p>
<p>Su classi sbilanciate la matrice smaschera l'inganno dell'accuratezza in modo brutale. 1000 casi, 990 negativi e 10 positivi: un modello che predice SEMPRE "negativo" ha accuratezza 99% — sembra eccellente — ma la sua matrice ha 10 FN e 0 TP: non becca NESSUN caso positivo, è inutile per lo scopo (trovare i positivi). L'accuratezza premia la classe maggioritaria; la matrice mostra che sulla classe che conta il modello è cieco. Da qui nascono precision e recall, che guardano proprio la classe positiva.</p>
<p>Per problemi multi-classe la matrice diventa k&times;k e diventa uno strumento diagnostico prezioso: la diagonale sono i corretti, e le celle fuori diagonale dicono ESATTAMENTE quali classi il modello confonde tra loro (le "5" scambiate per "6", i "gatti" per "cani"). Spesso rivela che l'errore non è uniforme ma concentrato tra poche classi simili — informazione che una singola metrica aggregata cancella e che invece guida il prossimo passo (più dati per quelle classi, feature che le distinguono).</p>
` },

    {
      type: "exercise", id: "me-08", kg: 15, title: "I quattro esiti",
      task: `<p>Calcola la matrice di confusione e estrai i quattro valori:</p>
<ul>
<li><code>cm</code>: la <code>confusion_matrix(y_true, y_pred)</code></li>
<li><code>tn, fp, fn, tp</code>: i quattro valori (usa <code>.ravel()</code> sulla matrice 2×2)</li>
<li><code>falsi_allarmi</code>: quanti falsi positivi (sani detti malati)</li>
<li><code>mancati</code>: quanti falsi negativi (malati detti sani — l'errore grave qui)</li>
</ul>`,
      setup: `import numpy as np
# 0 = sano, 1 = malato
y_true = np.array([0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1])
y_pred = np.array([0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0])`,
      starter: `import numpy as np
from sklearn.metrics import confusion_matrix
# y_true, y_pred: 0=sano, 1=malato

cm = ...
tn, fp, fn, tp = ...
falsi_allarmi = ...
mancati = ...

print("matrice:\\n", cm)
print(f"TN={tn} FP={fp} FN={fn} TP={tp} | falsi allarmi={falsi_allarmi} | mancati={mancati}")`,
      check: `import numpy as np
from sklearn.metrics import confusion_matrix
_cm = confusion_matrix(y_true, y_pred)
_tn, _fp, _fn, _tp = _cm.ravel()
assert 'cm' in globals() and np.array_equal(cm, _cm), "cm: confusion_matrix(y_true, y_pred)"
assert 'tn' in globals() and (tn, fp, fn, tp) == (int(_tn), int(_fp), int(_fn), int(_tp)), "tn,fp,fn,tp = cm.ravel()"
assert 'falsi_allarmi' in globals() and falsi_allarmi == int(_fp), "falsi_allarmi = fp"
assert 'mancati' in globals() and mancati == int(_fn), "mancati = fn (i malati detti sani)"`,
      hint: `<p><code>cm.ravel()</code> srotola la matrice 2×2 nell'ordine tn, fp, fn, tp. I falsi allarmi sono <code>fp</code>, i mancati sono <code>fn</code> — e in ambito medico i mancati sono l'errore che fa paura.</p>`,
      solution: `import numpy as np
from sklearn.metrics import confusion_matrix

cm = confusion_matrix(y_true, y_pred)
tn, fp, fn, tp = cm.ravel()
falsi_allarmi = fp
mancati = fn

print("matrice:\\n", cm)
print(f"TN={tn} FP={fp} FN={fn} TP={tp} | falsi allarmi={falsi_allarmi} | mancati={mancati}")`
    },

    { type: "theory", title: "Precision, recall, F1", html: `
<p>Dalla matrice di confusione nascono le metriche che contano quando l'accuratezza mente:</p>
<pre><code>from sklearn.metrics import precision_score, recall_score, f1_score
# Precision = TP / (TP + FP): dei predetti positivi, quanti lo erano davvero?
# Recall    = TP / (TP + FN): dei positivi reali, quanti ne ho beccati?
# F1        = media armonica di precision e recall</code></pre>
<p><strong>Precision</strong> risponde a "quando dico positivo, ci azzecco?" — conta quando i falsi allarmi costano (antispam: non voglio bloccare email vere). <strong>Recall</strong> risponde a "quanti positivi mi sfuggono?" — conta quando i mancati costano (diagnosi: non voglio perdere malati). L'<strong>F1</strong> le combina quando servono entrambe.</p>
`, more: `
<p>Precision e recall sono in <strong>tensione</strong>: alzare una tende ad abbassare l'altra. Un modello che grida "positivo!" a tutti ha recall 100% (non si perde nessun positivo) ma precision bassissima (marea di falsi allarmi); uno cautissimo che dice positivo solo quando è sicurissimo ha precision alta ma recall basso (si perde molti positivi veri). Questo trade-off si governa spostando la soglia di decisione (prossima lavagna) — non esiste il modello che massimizza entrambe insieme, esiste la scelta di dove stare sulla curva.</p>
<p>L'F1 è la <strong>media armonica</strong>, non aritmetica, e la scelta è intenzionale: la media armonica è dominata dal valore più piccolo. Precision 0.9 e recall 0.1 danno F1 ≈ 0.18 (non 0.5): l'F1 "punisce" gli squilibri, premia solo chi è buono su ENTRAMBE. È la metrica giusta quando ti servono davvero sia pochi falsi allarmi sia pochi mancati. Ma attenzione: l'F1 pesa precision e recall UGUALMENTE, e spesso nella realtà non è così — l'F-beta (<code>fbeta_score</code> con beta&gt;1 pesa più il recall, beta&lt;1 più la precision) permette di dichiarare quale conta di più.</p>
<p>Per problemi multi-classe o multi-label, il modo di mediare cambia tutto: <strong>macro</strong> (media semplice delle metriche per classe — ogni classe pesa uguale, anche le rare), <strong>weighted</strong> (pesata per numerosità — le classi frequenti dominano), <strong>micro</strong> (aggrega tutti i TP/FP/FN globali — equivale all'accuratezza nel multi-classe). Su dati sbilanciati la scelta è sostanziale: la macro-F1 espone se il modello è pessimo sulle classi rare (che spesso sono quelle che ti interessano), la weighted la nasconde dietro le classi comuni. Riportare "F1 0.85" senza dire quale media è mezza informazione.</p>
` },

    {
      type: "exercise", id: "me-09", kg: 15, title: "Quando l'accuratezza mente",
      task: `<p>Dataset sbilanciato 95/5. Confronta un modello "pigro" (predice sempre la maggioranza) con le metriche giuste:</p>
<ul>
<li><code>acc_pigro</code>: accuratezza del modello che predice SEMPRE 0 (la maggioranza)</li>
<li><code>recall_pigro</code>: il recall del modello pigro sulla classe 1 (userà <code>zero_division=0</code>)</li>
<li><code>accuratezza_inganna</code>: <code>True</code> se acc_pigro &gt; 0.9 MA recall_pigro == 0 (alta accuratezza, zero positivi beccati)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
y_true = (rng.random(400) < 0.05).astype(int)   # ~5% positivi`,
      starter: `import numpy as np
from sklearn.metrics import accuracy_score, recall_score
# y_true: ~5% positivi (classe 1)

y_pred_pigro = np.zeros_like(y_true)   # predice sempre 0

acc_pigro = ...
recall_pigro = recall_score(y_true, y_pred_pigro, zero_division=0)
accuratezza_inganna = ...

print(f"accuratezza modello pigro: {acc_pigro:.3f} | recall sulla classe 1: {recall_pigro:.3f}")
print("l'accuratezza inganna:", accuratezza_inganna)`,
      check: `import numpy as np
from sklearn.metrics import accuracy_score, recall_score
_ap = accuracy_score(y_true, np.zeros_like(y_true))
assert 'acc_pigro' in globals() and abs(float(acc_pigro) - _ap) < 1e-6, "acc_pigro: accuracy_score(y_true, tutti_zero) — circa 0.95"
assert 'recall_pigro' in globals() and float(recall_pigro) == 0.0, "recall_pigro: 0 — non becca NESSUN positivo"
assert 'accuratezza_inganna' in globals() and accuratezza_inganna == True, "accuratezza_inganna: True — 95% accuratezza ma recall zero: il modello e' inutile e l'accuratezza lo nasconde"`,
      hint: `<p>Il modello pigro azzecca tutti i negativi (il 95%) ma nessun positivo: accuratezza ~0.95, recall 0. <code>accuratezza_inganna = acc_pigro &gt; 0.9 and recall_pigro == 0</code>.</p>`,
      solution: `import numpy as np
from sklearn.metrics import accuracy_score, recall_score

y_pred_pigro = np.zeros_like(y_true)

acc_pigro = accuracy_score(y_true, y_pred_pigro)
recall_pigro = recall_score(y_true, y_pred_pigro, zero_division=0)
accuratezza_inganna = acc_pigro > 0.9 and recall_pigro == 0

print(f"accuratezza modello pigro: {acc_pigro:.3f} | recall sulla classe 1: {recall_pigro:.3f}")
print("l'accuratezza inganna:", accuratezza_inganna)`
    },

    {
      type: "exercise", id: "me-10", kg: 15, title: "Precision contro recall",
      task: `<p>Calcola le tre metriche da predizioni reali e ragiona sul trade-off:</p>
<ul>
<li><code>prec</code>, <code>rec</code>, <code>f1</code>: precision, recall e F1 sulla classe 1</li>
<li><code>f1_manuale</code>: l'F1 ricalcolato a mano dalla formula <code>2*prec*rec/(prec+rec)</code></li>
<li><code>f1_corretto</code>: <code>True</code> se <code>f1</code> e <code>f1_manuale</code> coincidono (l'F1 è la media armonica)</li>
</ul>`,
      setup: `import numpy as np
y_true = np.array([1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0])
y_pred = np.array([1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1])`,
      starter: `import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
# y_true, y_pred: classificazione binaria

prec = ...
rec = ...
f1 = ...
f1_manuale = ...
f1_corretto = ...

print(f"precision {prec:.3f} | recall {rec:.3f} | F1 {f1:.3f} | F1 manuale {f1_manuale:.3f}")`,
      check: `import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
_p = precision_score(y_true, y_pred); _r = recall_score(y_true, y_pred); _f = f1_score(y_true, y_pred)
assert 'prec' in globals() and abs(float(prec) - _p) < 1e-6, "prec: precision_score(y_true, y_pred)"
assert 'rec' in globals() and abs(float(rec) - _r) < 1e-6, "rec: recall_score(y_true, y_pred)"
assert 'f1' in globals() and abs(float(f1) - _f) < 1e-6, "f1: f1_score(y_true, y_pred)"
assert 'f1_manuale' in globals() and abs(float(f1_manuale) - 2*_p*_r/(_p+_r)) < 1e-6, "f1_manuale: 2*prec*rec/(prec+rec)"
assert 'f1_corretto' in globals() and f1_corretto == True, "f1_corretto: True — l'F1 di sklearn E' la media armonica di precision e recall"`,
      hint: `<p>Le tre funzioni prendono <code>(y_true, y_pred)</code>. L'F1 manuale: <code>2*prec*rec/(prec+rec)</code>. Devono coincidere: <code>abs(f1 - f1_manuale) &lt; 1e-9</code>.</p>`,
      solution: `import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

prec = precision_score(y_true, y_pred)
rec = recall_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred)
f1_manuale = 2 * prec * rec / (prec + rec)
f1_corretto = abs(f1 - f1_manuale) < 1e-9

print(f"precision {prec:.3f} | recall {rec:.3f} | F1 {f1:.3f} | F1 manuale {f1_manuale:.3f}")`
    },

    { type: "theory", title: "ROC e AUC", html: `
<p>Un classificatore non dà solo 0/1: dà una <em>probabilità</em>, e tu scegli la soglia. La curva <strong>ROC</strong> mostra come si comporta il modello a TUTTE le soglie insieme, tracciando il tasso di veri positivi (recall) contro il tasso di falsi positivi.</p>
<pre><code>from sklearn.metrics import roc_auc_score, roc_curve
proba = modello.predict_proba(X_test)[:, 1]   # probabilita' della classe 1
auc = roc_auc_score(y_test, proba)
fpr, tpr, soglie = roc_curve(y_test, proba)</code></pre>
<p>L'<strong>AUC</strong> (area sotto la curva) riassume tutto in un numero: 0.5 = modello casuale (tira a caso), 1.0 = perfetto. Interpretazione elegante: l'AUC è la probabilità che, presi un positivo e un negativo a caso, il modello dia al positivo un punteggio più alto. Non dipende dalla soglia né dallo sbilanciamento della soglia scelta.</p>
`, more: `
<p>Il grande vantaggio dell'AUC è che valuta il <strong>ranking</strong>, indipendente dalla soglia: misura se il modello sa ORDINARE i casi (positivi più in alto dei negativi), separando questa capacità dalla scelta operativa di dove tagliare. Due modelli con lo stesso AUC possono comportarsi diversissimo alla soglia 0.5 ma sono equivalenti nella capacità di discriminare — e spesso la soglia si aggiusta dopo (prossima lavagna), mentre il ranking è ciò che il modello "sa" davvero.</p>
<p>La trappola dell'AUC su dati fortemente <strong>sbilanciati</strong>: il tasso di falsi positivi ha al denominatore TUTTI i negativi, che sono tantissimi, quindi anche molti FP in valore assoluto muovono poco la curva ROC. Il risultato è che l'AUC-ROC può restare alta e ottimistica anche quando il modello, in pratica, annega i pochi veri positivi in una marea di falsi allarmi. Per questi casi si usa la <strong>curva Precision-Recall</strong> e la sua area (average precision): la precision ha al denominatore i predetti positivi, quindi è molto più sensibile ai falsi positivi quando i positivi sono rari. Regola: classi bilanciate → ROC-AUC va bene; classe positiva rara e preziosa (frodi, malattie rare) → guarda la PR curve.</p>
<p>Nota tecnica che salva da errori: <code>roc_auc_score</code> vuole i PUNTEGGI/probabilità (<code>predict_proba[:, 1]</code> o <code>decision_function</code>), NON le etichette 0/1 predette. Passargli <code>y_pred</code> binario è un errore comune che calcola un'AUC degradata (di fatto valuta una sola soglia). E per il multi-classe serve specificare la strategia (<code>multi_class='ovr'</code> o <code>'ovo'</code>) e passare le probabilità di tutte le classi.</p>
` },

    {
      type: "exercise", id: "me-11", kg: 15, title: "L'area che misura il ranking",
      task: `<p>Addestra un classificatore, ottieni le probabilità e calcola l'AUC:</p>
<ul>
<li><code>proba</code>: le probabilità della classe 1 sul test (<code>predict_proba[:, 1]</code>)</li>
<li><code>auc</code>: <code>roc_auc_score(y_test, proba)</code></li>
<li><code>auc_da_etichette</code>: l'AUC calcolata (erroneamente) sulle etichette 0/1 invece che sulle probabilità</li>
<li><code>proba_meglio</code>: <code>True</code> se <code>auc &gt; auc_da_etichette</code> (le probabilità danno più informazione delle sole etichette)</li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=500, n_features=10, weights=[0.7, 0.3], random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
# X_train/test, y_train/test: gia' pronti

clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)

proba = ...
auc = ...
y_pred = clf.predict(X_test)
auc_da_etichette = roc_auc_score(y_test, y_pred)
proba_meglio = ...

print(f"AUC da probabilita': {auc:.3f} | AUC da etichette: {auc_da_etichette:.3f} | proba meglio: {proba_meglio}")`,
      check: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
_clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
_proba = _clf.predict_proba(X_test)[:, 1]
_auc = roc_auc_score(y_test, _proba)
assert 'proba' in globals() and abs(float(roc_auc_score(y_test, proba)) - _auc) < 1e-6, "proba: clf.predict_proba(X_test)[:, 1]"
assert 'auc' in globals() and abs(float(auc) - _auc) < 1e-6, "auc: roc_auc_score(y_test, proba)"
assert 'proba_meglio' in globals() and proba_meglio == True, "proba_meglio: True — l'AUC dalle probabilita' supera quella dalle etichette binarie (piu' informazione sul ranking)"`,
      hint: `<p><code>clf.predict_proba(X_test)[:, 1]</code> dà le probabilità della classe 1. Passa QUELLE a <code>roc_auc_score</code>, non le etichette 0/1: le probabilità contengono l'ordinamento completo.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)

proba = clf.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, proba)
y_pred = clf.predict(X_test)
auc_da_etichette = roc_auc_score(y_test, y_pred)
proba_meglio = auc > auc_da_etichette

print(f"AUC da probabilita': {auc:.3f} | AUC da etichette: {auc_da_etichette:.3f} | proba meglio: {proba_meglio}")`
    },

    {
      type: "exercise", id: "me-12", kg: 20, title: "ROC contro Precision-Recall",
      task: `<p>Su dati fortemente sbilanciati, l'AUC-ROC può essere ottimista mentre la PR curve racconta la verità. Confrontale:</p>
<ul>
<li><code>auc_roc</code>: <code>roc_auc_score</code> con le probabilità</li>
<li><code>ap</code>: <code>average_precision_score</code> (area sotto la PR curve) con le stesse probabilità</li>
<li><code>roc_piu_alta</code>: <code>True</code> se <code>auc_roc &gt; ap</code> (su classi molto sbilanciate la ROC appare più generosa)</li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=2000, n_features=10, weights=[0.97, 0.03],
                            n_informative=5, random_state=5)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]`,
      starter: `from sklearn.metrics import roc_auc_score, average_precision_score
# proba: probabilita' della classe 1 (molto rara, 3%)

auc_roc = ...
ap = ...
roc_piu_alta = ...

print(f"AUC-ROC: {auc_roc:.3f} | Average Precision (PR): {ap:.3f} | ROC piu' alta: {roc_piu_alta}")`,
      check: `from sklearn.metrics import roc_auc_score, average_precision_score
_ar = roc_auc_score(y_test, proba); _ap = average_precision_score(y_test, proba)
assert 'auc_roc' in globals() and abs(float(auc_roc) - _ar) < 1e-6, "auc_roc: roc_auc_score(y_test, proba)"
assert 'ap' in globals() and abs(float(ap) - _ap) < 1e-6, "ap: average_precision_score(y_test, proba)"
assert 'roc_piu_alta' in globals() and roc_piu_alta == bool(_ar > _ap), "roc_piu_alta: auc_roc > ap — su classi al 3% la ROC e' piu' generosa della PR"`,
      hint: `<p><code>average_precision_score(y_test, proba)</code> è l'area sotto la curva precision-recall. Con positivi al 3%, la ROC resta alta ma la AP crolla: la PR è più onesta quando la classe positiva è rara.</p>`,
      solution: `from sklearn.metrics import roc_auc_score, average_precision_score

auc_roc = roc_auc_score(y_test, proba)
ap = average_precision_score(y_test, proba)
roc_piu_alta = auc_roc > ap

print(f"AUC-ROC: {auc_roc:.3f} | Average Precision (PR): {ap:.3f} | ROC piu' alta: {roc_piu_alta}")`
    },

    { type: "theory", title: "Threshold tuning: spostare la soglia", html: `
<p>Di default un classificatore predice 1 se la probabilità supera <strong>0.5</strong>. Ma 0.5 non è sacro: è solo il default. Spostare la <strong>soglia</strong> è il modo diretto di scegliere il punto sul trade-off precision/recall che serve al tuo problema.</p>
<pre><code>proba = modello.predict_proba(X_test)[:, 1]
# soglia bassa (0.3): piu' positivi predetti -> recall alto, precision bassa
y_pred_sensibile = (proba >= 0.3).astype(int)
# soglia alta (0.7): meno positivi -> precision alta, recall basso
y_pred_prudente = (proba >= 0.7).astype(int)</code></pre>
<p>Abbassare la soglia = "nel dubbio, positivo" (recuperi più positivi, più falsi allarmi). Alzarla = "positivo solo se sicuro" (meno falsi allarmi, più mancati). La soglia giusta dipende dal <strong>costo relativo</strong> dei due errori nel tuo dominio, non da una regola universale.</p>
`, more: `
<p>La scelta della soglia è una decisione di BUSINESS, non statistica, e va fatta esplicitamente. Se un falso negativo (frode non rilevata) costa 1000&euro; e un falso positivo (transazione legittima bloccata, cliente irritato) costa 10&euro;, il rapporto 100:1 dice di abbassare molto la soglia — accetti tanti falsi allarmi pur di non perdere frodi. Il modo rigoroso è definire una matrice di costo e scegliere la soglia che minimizza il costo atteso totale, calcolabile scorrendo tutte le soglie sulla curva. "Uso 0.5" senza giustificazione è quasi sempre subottimale.</p>
<p>Errore metodologico grave: scegliere la soglia ottimale sul TEST set e poi riportare le metriche sullo stesso test. La soglia è un iperparametro come gli altri — va scelta su validation (o in CV), poi la performance si misura sul test intatto. Sceglierla sul test gonfia i risultati esattamente come ogni altra forma di leakage: stai adattando una decisione ai dati con cui poi ti valuti.</p>
<p>Un modello può avere ranking eccellente (AUC alta) ma probabilità <strong>mal calibrate</strong> — dire "0.9" quando la frequenza reale è 0.6. Per il threshold tuning basato sul ranking questo non importa (sposti comunque la soglia sulla curva), ma se le probabilità servono DIRETTAMENTE per decisioni (valore atteso, prezzo, comunicazione al cliente "hai il 90% di rischio") allora la calibrazione diventa cruciale — ed è il tema della prossima e ultima lavagna. Ranking buono e probabilità affidabili sono due proprietà diverse, e servono a scopi diversi.</p>
` },

    {
      type: "exercise", id: "me-13", kg: 20, title: "La soglia che sceglie il rischio",
      task: `<p>Con lo stesso modello, tre soglie diverse. Osserva come precision e recall si scambiano:</p>
<ul>
<li><code>pred_03</code>, <code>pred_05</code>, <code>pred_07</code>: predizioni con soglia 0.3, 0.5, 0.7</li>
<li><code>recall_03</code>, <code>recall_07</code>: recall a soglia 0.3 e 0.7</li>
<li><code>prec_03</code>, <code>prec_07</code>: precision a soglia 0.3 e 0.7</li>
<li><code>trade_off</code>: <code>True</code> se soglia bassa dà più recall (recall_03 &gt; recall_07) E soglia alta dà più precision (prec_07 &gt; prec_03)</li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=600, n_features=8, weights=[0.6, 0.4], random_state=3)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]`,
      starter: `import numpy as np
from sklearn.metrics import precision_score, recall_score
# proba: probabilita' classe 1 sul test

pred_03 = (proba >= 0.3).astype(int)
pred_05 = ...
pred_07 = ...

recall_03 = recall_score(y_test, pred_03)
recall_07 = ...
prec_03 = precision_score(y_test, pred_03)
prec_07 = ...

trade_off = ...

print(f"soglia 0.3: recall {recall_03:.2f} prec {prec_03:.2f}")
print(f"soglia 0.7: recall {recall_07:.2f} prec {prec_07:.2f}")
print("trade-off confermato:", trade_off)`,
      check: `import numpy as np
from sklearn.metrics import precision_score, recall_score
_r3 = recall_score(y_test, (proba>=0.3).astype(int)); _r7 = recall_score(y_test, (proba>=0.7).astype(int))
_p3 = precision_score(y_test, (proba>=0.3).astype(int)); _p7 = precision_score(y_test, (proba>=0.7).astype(int))
assert 'pred_07' in globals() and np.array_equal(pred_07, (proba>=0.7).astype(int)), "pred_07: (proba >= 0.7).astype(int)"
assert 'recall_07' in globals() and abs(float(recall_07) - _r7) < 1e-6, "recall_07: recall a soglia 0.7"
assert 'prec_07' in globals() and abs(float(prec_07) - _p7) < 1e-6, "prec_07: precision a soglia 0.7"
assert 'trade_off' in globals() and trade_off == True and _r3 > _r7 and _p7 > _p3, "trade_off: True — soglia bassa piu' recall, soglia alta piu' precision"`,
      hint: `<p>La predizione a una soglia: <code>(proba &gt;= soglia).astype(int)</code>. Il trade-off: <code>recall_03 &gt; recall_07 and prec_07 &gt; prec_03</code>. Abbassare la soglia recupera positivi ma con più falsi allarmi.</p>`,
      solution: `import numpy as np
from sklearn.metrics import precision_score, recall_score

pred_03 = (proba >= 0.3).astype(int)
pred_05 = (proba >= 0.5).astype(int)
pred_07 = (proba >= 0.7).astype(int)

recall_03 = recall_score(y_test, pred_03)
recall_07 = recall_score(y_test, pred_07)
prec_03 = precision_score(y_test, pred_03)
prec_07 = precision_score(y_test, pred_07)

trade_off = (recall_03 > recall_07) and (prec_07 > prec_03)

print(f"soglia 0.3: recall {recall_03:.2f} prec {prec_03:.2f}")
print(f"soglia 0.7: recall {recall_07:.2f} prec {prec_07:.2f}")
print("trade-off confermato:", trade_off)`
    },

    {
      type: "exercise", id: "me-14", kg: 20, title: "La soglia che minimizza il costo",
      task: `<p>Un falso negativo (frode persa) costa 100, un falso positivo (blocco ingiusto) costa 5. Trova la soglia che minimizza il costo totale scorrendo tutte le opzioni:</p>
<ul>
<li><code>costi</code>: lista dei costi totali per ogni soglia in <code>soglie</code></li>
<li><code>soglia_ottima</code>: la soglia che minimizza il costo</li>
<li><code>meglio_di_05</code>: <code>True</code> se il costo alla soglia ottima è minore del costo a soglia 0.5</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
X, y = make_classification(n_samples=1500, n_features=10, weights=[0.9, 0.1],
                            n_informative=5, random_state=7)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=0, stratify=y)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]`,
      starter: `import numpy as np
from sklearn.metrics import confusion_matrix
# proba: probabilita' della classe 1 (frode, 10%)
COSTO_FN = 100   # frode persa
COSTO_FP = 5     # blocco ingiusto

soglie = np.arange(0.05, 0.95, 0.05)

def costo_a_soglia(s):
    pred = (proba >= s).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    return fp * COSTO_FP + fn * COSTO_FN

costi = ...
soglia_ottima = ...
meglio_di_05 = ...

print(f"soglia ottima: {soglia_ottima:.2f} | costo: {min(costi)}")
print(f"costo a 0.5: {costo_a_soglia(0.5)}")`,
      check: `import numpy as np
from sklearn.metrics import confusion_matrix
COSTO_FN, COSTO_FP = 100, 5
soglie = np.arange(0.05, 0.95, 0.05)
def _c(s):
    pred = (proba >= s).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    return fp*COSTO_FP + fn*COSTO_FN
_costi = [_c(s) for s in soglie]
_opt = soglie[int(np.argmin(_costi))]
assert 'costi' in globals() and list(costi) == _costi, "costi: [costo_a_soglia(s) for s in soglie]"
assert 'soglia_ottima' in globals() and abs(float(soglia_ottima) - _opt) < 1e-9, "soglia_ottima: soglie[np.argmin(costi)]"
assert 'meglio_di_05' in globals() and meglio_di_05 == bool(min(_costi) < _c(0.5)), "meglio_di_05: il costo ottimo batte quello a 0.5"
assert _opt < 0.5, "con FN 20 volte piu' caro dei FP, la soglia ottima e' sotto 0.5 (piu' aggressiva nel predire frode)"`,
      hint: `<p><code>costi = [costo_a_soglia(s) for s in soglie]</code>. La soglia ottima: <code>soglie[np.argmin(costi)]</code>. Con FN 20 volte più caro dei FP, conviene una soglia bassa: meglio tanti falsi allarmi che perdere frodi.</p>`,
      solution: `import numpy as np
from sklearn.metrics import confusion_matrix
COSTO_FN = 100
COSTO_FP = 5

soglie = np.arange(0.05, 0.95, 0.05)

def costo_a_soglia(s):
    pred = (proba >= s).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    return fp * COSTO_FP + fn * COSTO_FN

costi = [costo_a_soglia(s) for s in soglie]
soglia_ottima = soglie[int(np.argmin(costi))]
meglio_di_05 = min(costi) < costo_a_soglia(0.5)

print(f"soglia ottima: {soglia_ottima:.2f} | costo: {min(costi)}")
print(f"costo a 0.5: {costo_a_soglia(0.5)}")`
    },

    { type: "theory", title: "Nested CV: valutare la ricerca di iperparametri", html: `
<p>Se usi la cross-validation per SCEGLIERE gli iperparametri (con GridSearchCV) e poi riporti il miglior punteggio di quella stessa CV, stai barando: quel punteggio è ottimistico, perché hai scelto il vincitore proprio su quei fold. La <strong>nested cross-validation</strong> risolve il problema con due livelli.</p>
<pre><code>from sklearn.model_selection import GridSearchCV, cross_val_score
# loop INTERNO: sceglie gli iperparametri
grid = GridSearchCV(modello, parametri, cv=5)
# loop ESTERNO: valuta onestamente il processo (grid incluso)
score = cross_val_score(grid, X, y, cv=5)</code></pre>
<p>Il loop interno cerca i migliori iperparametri; il loop esterno valuta l'intero processo (ricerca + modello) su dati mai toccati dalla ricerca. La media del loop esterno è la stima onesta di come si comporterà il tuo pipeline di tuning su dati nuovi.</p>
`, more: `
<p>Il bias della CV non-nested è reale e misurabile: scegliere il migliore tra molti candidati su un set di fold produce un vincitore che è in parte fortunato SU QUEI fold, e più candidati provi più il bias cresce (è lo stesso fenomeno del p-hacking: testa abbastanza configurazioni e una sembrerà ottima per caso). Su problemi con molti iperparametri e pochi dati, la differenza tra il punteggio non-nested (ottimistico) e quello nested (onesto) può essere di diversi punti percentuali — abbastanza da far sembrare pubblicabile un modello che in realtà non generalizza.</p>
<p>Il costo computazionale è il motivo per cui la nested CV non è sempre usata: con loop esterno da 5 fold e interno da 5, ogni configurazione viene addestrata 25 volte, moltiplicato per il numero di configurazioni della griglia. Per questo nella pratica si adottano scorciatoie: un unico <strong>hold-out test set</strong> intoccato (semplice ed efficace se hai dati a sufficienza), oppure nested CV solo quando serve una stima pubblicabile/rigorosa della generalizzazione. La regola pragmatica: se stai solo cercando i migliori iperparametri per METTERLI in produzione, la CV semplice basta; se devi RIPORTARE quanto bene generalizza il tuo processo di modellazione, serve la nested CV o un test set separato.</p>
<p>Sottigliezza spesso fraintesa: la nested CV NON serve a scegliere gli iperparametri finali (ogni fold esterno può sceglierne di diversi!), serve a STIMARE la performance del processo di scelta. Gli iperparametri finali da mettere in produzione si ottengono con un <code>GridSearchCV</code> su TUTTI i dati, dopo. La nested CV risponde a "quanto bene funziona il mio metodo di tuning?", non a "quali iperparametri uso?" — sono due domande diverse che richiedono due procedure diverse.</p>
` },

    {
      type: "exercise", id: "me-15", kg: 20, title: "I due livelli onesti",
      task: `<p>Confronta la stima non-nested (ottimistica) con la nested (onesta):</p>
<ul>
<li><code>grid</code>: <code>GridSearchCV</code> di un albero, cercando <code>max_depth</code> in [2, 5, 10, None], cv=5</li>
<li><code>score_non_nested</code>: fitta il grid su tutti i dati e prendi <code>grid.best_score_</code> (ottimistico)</li>
<li><code>score_nested</code>: <code>cross_val_score(grid, X, y, cv=5).mean()</code> (onesto)</li>
<li><code>non_nested_ottimista</code>: <code>True</code> se <code>score_non_nested &gt;= score_nested</code></li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: `from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score
# X, y: breast cancer

parametri = {"max_depth": [2, 5, 10, None]}
grid = ...

grid.fit(X, y)
score_non_nested = ...

score_nested = ...
non_nested_ottimista = ...

print(f"non-nested (ottimistico): {score_non_nested:.4f} | nested (onesto): {score_nested:.4f}")
print("non-nested piu' ottimista:", non_nested_ottimista)`,
      check: `from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score
_g = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth":[2,5,10,None]}, cv=5)
_g.fit(X, y)
_nn = _g.best_score_
_n = cross_val_score(GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth":[2,5,10,None]}, cv=5), X, y, cv=5).mean()
assert 'grid' in globals() and isinstance(grid, GridSearchCV), "grid: GridSearchCV(DecisionTreeClassifier(random_state=0), parametri, cv=5)"
assert 'score_non_nested' in globals() and abs(float(score_non_nested) - _nn) < 1e-6, "score_non_nested: grid.best_score_ dopo fit su tutti i dati"
assert 'score_nested' in globals() and abs(float(score_nested) - _n) < 0.02, "score_nested: cross_val_score(grid, X, y, cv=5).mean()"
assert 'non_nested_ottimista' in globals() and non_nested_ottimista == True, "non_nested_ottimista: True — il best_score_ e' scelto sugli stessi fold, quindi ottimistico"`,
      hint: `<p>Usa <code>DecisionTreeClassifier(random_state=0)</code> dentro il grid. Il <code>best_score_</code> è ottimistico (ha scelto il meglio su quei fold); la nested lo mette dentro un altro <code>cross_val_score</code> per valutare l'intero processo.</p>`,
      solution: `from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score

parametri = {"max_depth": [2, 5, 10, None]}
grid = GridSearchCV(DecisionTreeClassifier(random_state=0), parametri, cv=5)

grid.fit(X, y)
score_non_nested = grid.best_score_

score_nested = cross_val_score(grid, X, y, cv=5).mean()
non_nested_ottimista = score_non_nested >= score_nested

print(f"non-nested (ottimistico): {score_non_nested:.4f} | nested (onesto): {score_nested:.4f}")
print("non-nested piu' ottimista:", non_nested_ottimista)`
    },

    { type: "theory", title: "Overfitting, underfitting e curve di apprendimento", html: `
<p>Due modi di fallire, opposti. <strong>Overfitting</strong>: il modello memorizza il train (accuratezza altissima) ma non generalizza (test scarso) — troppo complesso, ha imparato anche il rumore. <strong>Underfitting</strong>: il modello è troppo semplice, va male anche sul train — non ha catturato la struttura.</p>
<p>Il sintomo si legge nel <strong>gap</strong> train-test:</p>
<ul>
<li>Train alto, test basso, gap grande &rarr; <strong>overfitting</strong> (riduci complessità, più regolarizzazione, più dati);</li>
<li>Train basso E test basso &rarr; <strong>underfitting</strong> (più complessità, feature migliori);</li>
<li>Train alto, test alto, gap piccolo &rarr; il punto giusto.</li>
</ul>
<pre><code>from sklearn.model_selection import validation_curve, learning_curve</code></pre>
`, more: `
<p>La <strong>validation curve</strong> mostra train e validation score al variare di UN iperparametro di complessità (profondità dell'albero, C della SVM, k del KNN): tipicamente il train sale monotòno con la complessità, mentre il validation prima sale (esce dall'underfitting) poi scende (entra nell'overfitting), disegnando una U rovesciata. Il picco del validation è la complessità giusta — e vederla graficamente insegna a riconoscere le due patologie meglio di qualunque regola.</p>
<p>La <strong>learning curve</strong> mostra invece train e validation al variare della QUANTITÀ di dati, e risponde alla domanda che vale soldi: "mi conviene raccogliere più dati?". Se le due curve convergono verso un plateau già raggiunto, più dati non aiuteranno — il limite è il modello o le feature, e devi cambiare quelli. Se il validation sta ancora salendo e il gap col train si sta chiudendo, più dati miglioreranno ancora — vale la pena raccoglierli. Se train e validation sono entrambi bassi e piatti fin da subito, è underfitting: il modello è troppo semplice, più dati non servono a niente. Leggere una learning curve prima di decidere se investire in raccolta dati è una competenza da senior.</p>
<p>Le cure dell'overfitting, in ordine di preferenza pratica: (1) PIÙ DATI, quasi sempre la cura migliore quando possibile — riduce l'overfitting senza sacrificare capacità; (2) regolarizzazione (L1/L2, dropout, limiti di profondità/foglie) — vincola il modello a soluzioni più semplici; (3) meno feature / feature selection — meno gradi di libertà per memorizzare rumore; (4) modello meno complesso. L'underfitting ha cure speculari: modello più espressivo, feature più ricche (interazioni, non-linearità), meno regolarizzazione. Riconoscere quale delle due patologie hai, dal gap train-test, è il primo passo per sapere in quale direzione muoverti — spingere sulla complessità quando hai overfitting peggiora tutto.</p>
` },

    {
      type: "exercise", id: "me-16", kg: 15, title: "Diagnosi dal gap",
      task: `<p>Tre modelli, tre diagnosi. Dai punteggi train/test, classifica ciascuno:</p>
<ul>
<li><code>diag_a</code>: train 0.99, test 0.72 &rarr; stringa "overfitting"</li>
<li><code>diag_b</code>: train 0.68, test 0.66 &rarr; stringa "underfitting"</li>
<li><code>diag_c</code>: train 0.91, test 0.89 &rarr; stringa "buono"</li>
<li><code>cura_a</code>: la cura per il caso A, stringa tra "piu_complessita", "piu_regolarizzazione", "nessuna" — quale serve all'overfitting?</li>
</ul>`,
      starter: `# classifica in base al gap train-test
casi = {"a": (0.99, 0.72), "b": (0.68, 0.66), "c": (0.91, 0.89)}

def diagnosi(train, test):
    if train > 0.9 and (train - test) > 0.15:
        return "overfitting"
    elif train < 0.75 and test < 0.75:
        return "underfitting"
    else:
        return "buono"

diag_a = ...
diag_b = ...
diag_c = ...
cura_a = ...

print(diag_a, diag_b, diag_c, "| cura A:", cura_a)`,
      check: `assert diag_a == "overfitting", "A: train altissimo, test basso, gap enorme -> overfitting"
assert diag_b == "underfitting", "B: entrambi bassi -> underfitting (modello troppo semplice)"
assert diag_c == "buono", "C: entrambi alti, gap piccolo -> il punto giusto"
assert cura_a == "piu_regolarizzazione", "l'overfitting si cura riducendo la complessita' / piu' regolarizzazione (o piu' dati), NON aumentando la complessita'"`,
      hint: `<p>Applica la funzione <code>diagnosi</code> ai tre casi. Per l'overfitting la cura è ridurre la complessità (più regolarizzazione), mai aumentarla: <code>cura_a = "piu_regolarizzazione"</code>.</p>`,
      solution: `casi = {"a": (0.99, 0.72), "b": (0.68, 0.66), "c": (0.91, 0.89)}

def diagnosi(train, test):
    if train > 0.9 and (train - test) > 0.15:
        return "overfitting"
    elif train < 0.75 and test < 0.75:
        return "underfitting"
    else:
        return "buono"

diag_a = diagnosi(*casi["a"])
diag_b = diagnosi(*casi["b"])
diag_c = diagnosi(*casi["c"])
cura_a = "piu_regolarizzazione"

print(diag_a, diag_b, diag_c, "| cura A:", cura_a)`
    },

    {
      type: "exercise", id: "me-17", kg: 20, title: "La curva di validazione",
      task: `<p>Traccia la validation curve di un albero al variare di <code>max_depth</code> e trova la profondità ottima:</p>
<ul>
<li><code>train_scores</code>, <code>val_scores</code>: le matrici da <code>validation_curve</code> (param_range dato)</li>
<li><code>train_medi</code>, <code>val_medi</code>: le medie sui fold (axis=1)</li>
<li><code>depth_ottima</code>: la <code>max_depth</code> col massimo validation score medio</li>
<li><code>overfitting_in_fondo</code>: <code>True</code> se all'ultima profondità il train supera il validation di oltre 0.05 (l'albero profondo overfitta)</li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import validation_curve
# X, y: breast cancer

param_range = [1, 2, 3, 5, 8, 15]
train_scores, val_scores = validation_curve(
    DecisionTreeClassifier(random_state=0), X, y,
    param_name="max_depth", param_range=param_range, cv=5)

train_medi = train_scores.mean(axis=1)
val_medi = ...
depth_ottima = param_range[...]
overfitting_in_fondo = ...

print("depth:", param_range)
print("val medi:", val_medi.round(3))
print("profondita' ottima:", depth_ottima, "| overfitting in fondo:", overfitting_in_fondo)`,
      check: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import validation_curve
param_range = [1, 2, 3, 5, 8, 15]
_tr, _vl = validation_curve(DecisionTreeClassifier(random_state=0), X, y, param_name="max_depth", param_range=param_range, cv=5)
_vm = _vl.mean(axis=1); _tm = _tr.mean(axis=1)
assert 'val_medi' in globals() and np.allclose(val_medi, _vm), "val_medi: val_scores.mean(axis=1)"
assert 'depth_ottima' in globals() and depth_ottima == param_range[int(np.argmax(_vm))], "depth_ottima: param_range[np.argmax(val_medi)]"
assert 'overfitting_in_fondo' in globals() and overfitting_in_fondo == bool(_tm[-1] - _vm[-1] > 0.05), "overfitting_in_fondo: train[-1] - val[-1] > 0.05"`,
      hint: `<p><code>val_scores.mean(axis=1)</code> media sui fold. La profondità ottima: <code>param_range[np.argmax(val_medi)]</code>. Per l'overfitting in fondo: <code>train_medi[-1] - val_medi[-1] &gt; 0.05</code>.</p>`,
      solution: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import validation_curve

param_range = [1, 2, 3, 5, 8, 15]
train_scores, val_scores = validation_curve(
    DecisionTreeClassifier(random_state=0), X, y,
    param_name="max_depth", param_range=param_range, cv=5)

train_medi = train_scores.mean(axis=1)
val_medi = val_scores.mean(axis=1)
depth_ottima = param_range[int(np.argmax(val_medi))]
overfitting_in_fondo = train_medi[-1] - val_medi[-1] > 0.05

print("depth:", param_range)
print("val medi:", val_medi.round(3))
print("profondita' ottima:", depth_ottima, "| overfitting in fondo:", overfitting_in_fondo)`
    },

    {
      type: "exercise", id: "me-18", kg: 20, title: "Più dati servono davvero?",
      task: `<p>La learning curve dice se raccogliere più dati aiuterà. Calcolala e interpretala:</p>
<ul>
<li><code>train_sizes_abs</code>, <code>train_sc</code>, <code>val_sc</code>: gli output di <code>learning_curve</code></li>
<li><code>val_iniziale</code>, <code>val_finale</code>: validation score medio col minimo e col massimo dei dati</li>
<li><code>piu_dati_aiutano</code>: <code>True</code> se <code>val_finale &gt; val_iniziale</code> (la curva di validazione sale ancora con più dati)</li>
</ul>`,
      setup: `from sklearn.datasets import load_digits
X, y = load_digits(return_X_y=True)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve
# X, y: cifre scritte a mano

train_sizes_abs, train_sc, val_sc = learning_curve(
    RandomForestClassifier(random_state=0), X, y,
    train_sizes=[0.1, 0.3, 0.5, 0.7, 1.0], cv=5)

val_medi = val_sc.mean(axis=1)
val_iniziale = ...
val_finale = ...
piu_dati_aiutano = ...

print("dimensioni train:", train_sizes_abs)
print("val medi:", val_medi.round(3))
print("piu' dati aiutano:", piu_dati_aiutano)`,
      check: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve
_ts, _tr, _vl = learning_curve(RandomForestClassifier(random_state=0), X, y, train_sizes=[0.1,0.3,0.5,0.7,1.0], cv=5)
_vm = _vl.mean(axis=1)
assert 'val_iniziale' in globals() and abs(float(val_iniziale) - float(_vm[0])) < 1e-6, "val_iniziale: val_medi[0] (col 10% dei dati)"
assert 'val_finale' in globals() and abs(float(val_finale) - float(_vm[-1])) < 1e-6, "val_finale: val_medi[-1] (con tutti i dati)"
assert 'piu_dati_aiutano' in globals() and piu_dati_aiutano == bool(_vm[-1] > _vm[0]), "piu_dati_aiutano: val_finale > val_iniziale"`,
      hint: `<p><code>val_sc.mean(axis=1)</code> dà il validation medio per ogni dimensione. Confronta il primo (<code>[0]</code>, pochi dati) con l'ultimo (<code>[-1]</code>, tutti). Se sale, raccogliere dati paga.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve

train_sizes_abs, train_sc, val_sc = learning_curve(
    RandomForestClassifier(random_state=0), X, y,
    train_sizes=[0.1, 0.3, 0.5, 0.7, 1.0], cv=5)

val_medi = val_sc.mean(axis=1)
val_iniziale = val_medi[0]
val_finale = val_medi[-1]
piu_dati_aiutano = val_finale > val_iniziale

print("dimensioni train:", train_sizes_abs)
print("val medi:", val_medi.round(3))
print("piu' dati aiutano:", piu_dati_aiutano)`
    },

    { type: "theory", title: "Calibrazione delle probabilità", html: `
<p>Un modello può ordinare bene (AUC alta) ma dare probabilità <em>sbagliate come numeri</em>: dire "0.9" quando la frequenza reale di quel gruppo è 0.6. Un modello <strong>calibrato</strong> è quello per cui, tra i casi a cui dà probabilità 0.7, circa il 70% è davvero positivo.</p>
<pre><code>from sklearn.calibration import calibration_curve, CalibratedClassifierCV
# la curva confronta probabilita' predette vs frequenze reali
prob_vere, prob_predette = calibration_curve(y_test, proba, n_bins=10)
# un modello perfetto sta sulla diagonale (predetto = reale)</code></pre>
<p>Serve quando le probabilità si usano DIRETTAMENTE per decisioni: valore atteso, prezzo di una polizza, comunicazione al cliente ("hai il 30% di rischio"). Modelli come Naive Bayes o SVM danno spesso punteggi mal calibrati; Random Forest tende a essere troppo cauta agli estremi.</p>
`, more: `
<p>Ranking e calibrazione sono proprietà <strong>indipendenti</strong>, ed è il concetto chiave di questa lavagna: un modello può avere AUC 0.95 (ordina benissimo) ma probabilità pessime come valori assoluti, e viceversa. Se usi il modello solo per ORDINARE (mostrare i 100 clienti più a rischio, rankare risultati di ricerca) la calibrazione non importa. Se usi le probabilità come NUMERI in un calcolo a valle (valore atteso = probabilità &times; valore, soglia su un costo monetario, prezzo attuariale) allora una probabilità mal calibrata produce decisioni economiche sbagliate anche con ranking perfetto.</p>
<p>Le due tecniche di ricalibrazione, entrambe in <code>CalibratedClassifierCV</code>: <strong>Platt scaling</strong> (sigmoid) fitta una sigmoide sui punteggi grezzi — poche assunzioni, adatto a piccoli dataset e a distorsioni a forma di S (tipiche delle SVM); <strong>isotonic regression</strong> è non parametrica, più flessibile, ma rischia overfitting con pochi dati e richiede più campioni. Cruciale: la calibrazione va appresa su un set SEPARATO da quello di training del modello (altrimenti impari a calibrare sull'overfitting) — <code>CalibratedClassifierCV</code> lo gestisce in CV internamente.</p>
<p>Perché certi modelli sono mal calibrati per natura: le <strong>Random Forest</strong> mediano tante predizioni e raramente producono probabilità vicine a 0 o 1 (serve che TUTTI gli alberi concordino), quindi sono troppo caute agli estremi — sottostimano le alte, sovrastimano le basse. Il <strong>Naive Bayes</strong>, per l'assunzione di indipendenza violata, tende a probabilità estreme e sovraconfidenti. La <strong>regressione logistica</strong>, ottimizzando direttamente la log-loss, è invece naturalmente ben calibrata — motivo per cui resta la scelta di default quando le probabilità devono essere affidabili come numeri, non solo come ordinamento. La metrica per misurare la calibrazione è la <strong>Brier score</strong> (errore quadratico medio tra probabilità e outcome) o la log-loss, non l'AUC che ignora la calibrazione per costruzione.</p>
` },

    {
      type: "exercise", id: "me-19", kg: 20, title: "Ordina bene, ma i numeri?",
      task: `<p>Confronta due modelli: uno ben calibrato (logistica) e uno spesso mal calibrato (Naive Bayes), a parità di ranking discreto. Usa la Brier score (più bassa = meglio calibrato):</p>
<ul>
<li><code>brier_lr</code>: Brier score della LogisticRegression</li>
<li><code>brier_nb</code>: Brier score del GaussianNB</li>
<li><code>auc_lr</code>, <code>auc_nb</code>: le due AUC (per mostrare che il ranking può essere simile)</li>
<li><code>lr_meglio_calibrato</code>: <code>True</code> se <code>brier_lr &lt; brier_nb</code></li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=2000, n_features=20, n_informative=10, random_state=4)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import brier_score_loss, roc_auc_score
# X_train/test, y_train/test: gia' pronti

lr = LogisticRegression(max_iter=1000).fit(X_train, y_train)
nb = GaussianNB().fit(X_train, y_train)

proba_lr = lr.predict_proba(X_test)[:, 1]
proba_nb = nb.predict_proba(X_test)[:, 1]

brier_lr = ...
brier_nb = ...
auc_lr = roc_auc_score(y_test, proba_lr)
auc_nb = roc_auc_score(y_test, proba_nb)
lr_meglio_calibrato = ...

print(f"Brier LR {brier_lr:.3f} (AUC {auc_lr:.3f}) | Brier NB {brier_nb:.3f} (AUC {auc_nb:.3f})")
print("LR meglio calibrato:", lr_meglio_calibrato)`,
      check: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import brier_score_loss
_lr = LogisticRegression(max_iter=1000).fit(X_train, y_train)
_nb = GaussianNB().fit(X_train, y_train)
_bl = brier_score_loss(y_test, _lr.predict_proba(X_test)[:,1])
_bn = brier_score_loss(y_test, _nb.predict_proba(X_test)[:,1])
assert 'brier_lr' in globals() and abs(float(brier_lr) - _bl) < 1e-6, "brier_lr: brier_score_loss(y_test, proba_lr)"
assert 'brier_nb' in globals() and abs(float(brier_nb) - _bn) < 1e-6, "brier_nb: brier_score_loss(y_test, proba_nb)"
assert 'lr_meglio_calibrato' in globals() and lr_meglio_calibrato == bool(_bl < _bn), "lr_meglio_calibrato: brier_lr < brier_nb — la logistica ottimizza la log-loss, quindi e' naturalmente calibrata"`,
      hint: `<p><code>brier_score_loss(y_test, proba)</code> misura quanto le probabilità si discostano dagli outcome reali. La logistica, ottimizzando la log-loss, è calibrata per costruzione; il Naive Bayes tende a probabilità estreme.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import brier_score_loss, roc_auc_score

lr = LogisticRegression(max_iter=1000).fit(X_train, y_train)
nb = GaussianNB().fit(X_train, y_train)

proba_lr = lr.predict_proba(X_test)[:, 1]
proba_nb = nb.predict_proba(X_test)[:, 1]

brier_lr = brier_score_loss(y_test, proba_lr)
brier_nb = brier_score_loss(y_test, proba_nb)
auc_lr = roc_auc_score(y_test, proba_lr)
auc_nb = roc_auc_score(y_test, proba_nb)
lr_meglio_calibrato = brier_lr < brier_nb

print(f"Brier LR {brier_lr:.3f} (AUC {auc_lr:.3f}) | Brier NB {brier_nb:.3f} (AUC {auc_nb:.3f})")
print("LR meglio calibrato:", lr_meglio_calibrato)`
    },

    {
      type: "exercise", id: "me-20", kg: 20, title: "Ricalibrare un modello",
      task: `<p>Prendi un modello mal calibrato e ricalibralo con <code>CalibratedClassifierCV</code>:</p>
<ul>
<li><code>nb_calibrato</code>: un <code>CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5)</code> addestrato</li>
<li><code>brier_prima</code>: Brier del GaussianNB grezzo</li>
<li><code>brier_dopo</code>: Brier del modello calibrato</li>
<li><code>calibrazione_migliora</code>: <code>True</code> se <code>brier_dopo &lt; brier_prima</code></li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=3000, n_features=20, n_informative=8, random_state=6)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss
# X_train/test, y_train/test: gia' pronti

nb = GaussianNB().fit(X_train, y_train)
brier_prima = brier_score_loss(y_test, nb.predict_proba(X_test)[:, 1])

nb_calibrato = ...
brier_dopo = ...
calibrazione_migliora = ...

print(f"Brier prima {brier_prima:.4f} -> dopo calibrazione {brier_dopo:.4f}")
print("la calibrazione migliora:", calibrazione_migliora)`,
      check: `from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss
_nb = GaussianNB().fit(X_train, y_train)
_bp = brier_score_loss(y_test, _nb.predict_proba(X_test)[:,1])
_cal = CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5).fit(X_train, y_train)
_bd = brier_score_loss(y_test, _cal.predict_proba(X_test)[:,1])
assert 'nb_calibrato' in globals() and isinstance(nb_calibrato, CalibratedClassifierCV), "nb_calibrato: CalibratedClassifierCV(GaussianNB(), method='isotonic', cv=5).fit(X_train, y_train)"
assert 'brier_dopo' in globals() and abs(float(brier_dopo) - _bd) < 0.02, "brier_dopo: brier del modello calibrato"
assert 'calibrazione_migliora' in globals() and calibrazione_migliora == True and _bd < _bp, "calibrazione_migliora: True — la ricalibrazione abbassa la Brier score"`,
      hint: `<p><code>CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5).fit(X_train, y_train)</code>. Poi confronta le Brier score prima/dopo: la calibrazione isotonica riallinea le probabilità alle frequenze reali.</p>`,
      solution: `from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss

nb = GaussianNB().fit(X_train, y_train)
brier_prima = brier_score_loss(y_test, nb.predict_proba(X_test)[:, 1])

nb_calibrato = CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5).fit(X_train, y_train)
brier_dopo = brier_score_loss(y_test, nb_calibrato.predict_proba(X_test)[:, 1])
calibrazione_migliora = brier_dopo < brier_prima

print(f"Brier prima {brier_prima:.4f} -> dopo calibrazione {brier_dopo:.4f}")
print("la calibrazione migliora:", calibrazione_migliora)`
    },

    { type: "theory", title: "Metriche per la regressione", html: `
<p>Per i problemi di regressione (predire un numero, non una classe) le metriche sono diverse:</p>
<pre><code>from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
mae = mean_absolute_error(y_true, y_pred)              # errore medio assoluto
rmse = mean_squared_error(y_true, y_pred) ** 0.5       # radice dell'errore quadratico
r2 = r2_score(y_true, y_pred)                          # frazione di varianza spiegata</code></pre>
<p><strong>MAE</strong>: errore medio in valore assoluto, stessa unità dei dati, robusto agli outlier ("in media sbaglio di 12&euro;"). <strong>RMSE</strong>: penalizza di più gli errori grandi (li eleva al quadrato), sensibile agli outlier. <strong>R²</strong>: adimensionale, 1.0 = perfetto, 0 = come predire sempre la media, negativo = peggio della media.</p>
`, more: `
<p>MAE vs RMSE è una scelta che riflette quanto ti fanno male gli errori grandi. L'RMSE, elevando al quadrato prima di mediare, dà peso sproporzionato agli errori grossi: un singolo errore da 100 conta come 100 errori da 10. Se nel tuo dominio un grande errore occasionale è catastrofico (dimensionamento di una struttura, previsione di picchi di domanda) l'RMSE è giusto. Se tutti gli errori contano proporzionalmente alla loro dimensione e non vuoi che pochi outlier dominino la metrica (previsioni di massa dove sbagliare tanto su pochi casi è tollerabile) il MAE è più appropriato. Non è dettaglio: ottimizzare per l'una o per l'altra produce modelli che sbagliano diversamente.</p>
<p>Il collegamento con la statistica: minimizzare l'RMSE (errore quadratico) equivale a stimare la MEDIA condizionata, minimizzare il MAE equivale a stimare la MEDIANA condizionata. Ecco perché su target con outlier o distribuzioni storte i modelli allenati su MAE (o su quantili) sono più robusti — inseguono la mediana, che gli outlier non spostano, invece della media che loro trascinano. È lo stesso motivo per cui si trasforma il target col log (sala Feature Engineering): cambiare metrica o trasformare il target sono due modi di dire al modello quali errori ti importano.</p>
<p>L'R² ha trappole da conoscere: (1) può essere NEGATIVO — se il modello fa peggio del predire sempre la media, e non è un bug, è una diagnosi (modello inutile o leakage al contrario); (2) cresce SEMPRE aggiungendo feature, anche inutili, quindi sul train è ingannevole — per questo esiste l'R² aggiustato che penalizza il numero di feature; (3) è sensibile al range dei dati: lo stesso modello ha R² diverso su un test con y molto variabile rispetto a uno con y quasi costante, perché il denominatore è la varianza di y. Riportare l'R² senza il MAE/RMSE in unità reali è come dire "modello buono" senza dire quanto sbaglia in euro: metà informazione. Le due vanno insieme — l'R² per il confronto relativo, l'errore in unità per capire se è utilizzabile nella pratica.</p>
` },

    {
      type: "exercise", id: "me-21", kg: 15, title: "MAE, RMSE e l'outlier",
      task: `<p>Le stesse predizioni con un grosso errore su un solo caso. Osserva come MAE e RMSE reagiscono diversamente:</p>
<ul>
<li><code>mae</code>, <code>rmse</code>, <code>r2</code>: le tre metriche</li>
<li><code>rmse_maggiore</code>: <code>True</code> se <code>rmse &gt; mae</code> (l'RMSE è sempre &ge; MAE, e il divario cresce con gli errori grandi)</li>
<li><code>rapporto</code>: <code>rmse / mae</code> — quanto l'outlier gonfia l'RMSE rispetto al MAE</li>
</ul>`,
      setup: `import numpy as np
y_true = np.array([100.0, 102, 98, 105, 95, 110, 90])
y_pred = np.array([101.0, 100, 99, 104, 96, 108, 140])   # ultimo: errore enorme (90 vs 140)`,
      starter: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# y_true, y_pred: l'ultimo caso ha un errore enorme

mae = ...
rmse = ...
r2 = ...
rmse_maggiore = ...
rapporto = ...

print(f"MAE {mae:.2f} | RMSE {rmse:.2f} | R2 {r2:.3f} | RMSE/MAE = {rapporto:.2f}")`,
      check: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
_mae = mean_absolute_error(y_true, y_pred); _rmse = mean_squared_error(y_true, y_pred)**0.5; _r2 = r2_score(y_true, y_pred)
assert 'mae' in globals() and abs(float(mae) - _mae) < 1e-6, "mae: mean_absolute_error(y_true, y_pred)"
assert 'rmse' in globals() and abs(float(rmse) - _rmse) < 1e-6, "rmse: mean_squared_error(...) ** 0.5"
assert 'r2' in globals() and abs(float(r2) - _r2) < 1e-6, "r2: r2_score(y_true, y_pred)"
assert 'rmse_maggiore' in globals() and rmse_maggiore == True, "rmse_maggiore: True — l'RMSE e' sempre >= MAE"
assert 'rapporto' in globals() and float(rapporto) > 1.5, "rapporto: rmse/mae > 1.5 — l'outlier gonfia molto l'RMSE (che eleva al quadrato) ma poco il MAE"`,
      hint: `<p>L'RMSE è <code>mean_squared_error(...) ** 0.5</code>. Con un errore enorme (50 sull'ultimo caso), l'RMSE — che eleva al quadrato — schizza, mentre il MAE lo pesa linearmente: il rapporto RMSE/MAE svela l'outlier.</p>`,
      solution: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_true, y_pred)
rmse = mean_squared_error(y_true, y_pred) ** 0.5
r2 = r2_score(y_true, y_pred)
rmse_maggiore = rmse > mae
rapporto = rmse / mae

print(f"MAE {mae:.2f} | RMSE {rmse:.2f} | R2 {r2:.3f} | RMSE/MAE = {rapporto:.2f}")`
    },

    {
      type: "exercise", id: "me-22", kg: 15, title: "R² può essere negativo",
      task: `<p>Un R² negativo non è un bug: significa "peggio del predire sempre la media". Dimostralo:</p>
<ul>
<li><code>r2_buono</code>: R² di un modello che segue i dati</li>
<li><code>r2_media</code>: R² di chi predice SEMPRE la media di y_true (deve essere ~0)</li>
<li><code>r2_pessimo</code>: R² di predizioni sistematicamente opposte al trend (deve essere negativo)</li>
<li><code>media_da_zero</code>: <code>True</code> se <code>abs(r2_media) &lt; 0.01</code> (predire la media dà R² zero per definizione)</li>
</ul>`,
      setup: `import numpy as np
y_true = np.array([1.0, 2, 3, 4, 5, 6, 7, 8])
pred_buono = np.array([1.1, 2.0, 2.9, 4.1, 5.0, 5.9, 7.1, 8.0])
pred_pessimo = np.array([8.0, 7, 6, 5, 4, 3, 2, 1])   # opposto al trend`,
      starter: `import numpy as np
from sklearn.metrics import r2_score
# y_true: trend crescente | pred_buono: lo segue | pred_pessimo: opposto

r2_buono = r2_score(y_true, pred_buono)
pred_media = np.full_like(y_true, y_true.mean())
r2_media = ...
r2_pessimo = ...
media_da_zero = ...

print(f"R2 buono {r2_buono:.3f} | R2 media {r2_media:.3f} | R2 pessimo {r2_pessimo:.3f}")`,
      check: `import numpy as np
from sklearn.metrics import r2_score
_rm = r2_score(y_true, np.full_like(y_true, y_true.mean()))
_rp = r2_score(y_true, pred_pessimo)
assert 'r2_media' in globals() and abs(float(r2_media) - _rm) < 1e-6, "r2_media: r2_score(y_true, array pieno della media)"
assert 'r2_media' in globals() and abs(float(r2_media)) < 0.01, "r2_media deve essere ~0: predire la media e' il riferimento"
assert 'r2_pessimo' in globals() and abs(float(r2_pessimo) - _rp) < 1e-6 and float(r2_pessimo) < 0, "r2_pessimo: negativo — peggio del predire la media"
assert 'media_da_zero' in globals() and media_da_zero == True, "media_da_zero: True"`,
      hint: `<p>Predire sempre la media: <code>np.full_like(y_true, y_true.mean())</code>. Dà R²=0 per definizione (è il baseline). Un modello che va contro il trend fa peggio del baseline: R² negativo.</p>`,
      solution: `import numpy as np
from sklearn.metrics import r2_score

r2_buono = r2_score(y_true, pred_buono)
pred_media = np.full_like(y_true, y_true.mean())
r2_media = r2_score(y_true, pred_media)
r2_pessimo = r2_score(y_true, pred_pessimo)
media_da_zero = abs(r2_media) < 0.01

print(f"R2 buono {r2_buono:.3f} | R2 media {r2_media:.3f} | R2 pessimo {r2_pessimo:.3f}")`
    },

    {
      type: "exercise", id: "me-23", kg: 15, title: "Quiz: quale metrica, quale split",
      task: `<p>Cinque scenari. Per ognuno scegli la stringa giusta:</p>
<ul>
<li><code>s1</code>: dati di vendite giornaliere da prevedere &rarr; split: "temporale" o "casuale"?</li>
<li><code>s2</code>: rilevare frodi (0.1% dei casi) &rarr; metrica: "accuratezza" o "pr_auc"?</li>
<li><code>s3</code>: più righe per ogni paziente &rarr; split: "group" o "casuale"?</li>
<li><code>s4</code>: predire il prezzo di case, con qualche villa costosissima &rarr; metrica: "mae" o "rmse" (per essere robusti agli outlier)?</li>
<li><code>s5</code>: scegliere iperparametri E stimare onestamente la generalizzazione &rarr; "nested_cv" o "cv_semplice"?</li>
</ul>`,
      starter: `s1 = ...
s2 = ...
s3 = ...
s4 = ...
s5 = ...

print(s1, s2, s3, s4, s5)`,
      check: `assert s1 == "temporale", "s1: dati temporali -> split temporale (mai mescolare passato e futuro)"
assert s2 == "pr_auc", "s2: classe rarissima -> PR-AUC (l'accuratezza e' inutile, la ROC ottimistica)"
assert s3 == "group", "s3: righe raggruppate per paziente -> GroupKFold (stesso paziente non in train E test)"
assert s4 == "mae", "s4: outlier costosi -> MAE, robusto (l'RMSE sarebbe dominato dalle ville)"
assert s5 == "nested_cv", "s5: scegliere iperparametri E stimare -> nested CV (evita il bias ottimistico)"`,
      hint: `<p>Ripassa le lavagne: tempo&rarr;split temporale, classe rara&rarr;PR-AUC, gruppi&rarr;GroupKFold, outlier&rarr;MAE robusto, tuning+stima onesta&rarr;nested CV.</p>`,
      solution: `s1 = "temporale"
s2 = "pr_auc"
s3 = "group"
s4 = "mae"
s5 = "nested_cv"

print(s1, s2, s3, s4, s5)`
    },

    {
      type: "exercise", id: "me-24", kg: 20, title: "Early stopping: fermarsi al momento giusto",
      task: `<p>Il gradient boosting può overfittare se fa troppe iterazioni. L'early stopping ferma l'addestramento quando il validation smette di migliorare. Confronta:</p>
<ul>
<li><code>gb_lungo</code>: <code>GradientBoostingClassifier(n_estimators=500, random_state=0)</code> addestrato</li>
<li><code>gb_early</code>: <code>GradientBoostingClassifier(n_estimators=500, validation_fraction=0.2, n_iter_no_change=10, random_state=0)</code> addestrato</li>
<li><code>iter_lungo</code>, <code>iter_early</code>: numero di alberi effettivamente usati (<code>n_estimators_</code>)</li>
<li><code>early_si_ferma_prima</code>: <code>True</code> se <code>iter_early &lt; iter_lungo</code></li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=1000, n_features=20, n_informative=8, random_state=3)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.ensemble import GradientBoostingClassifier
# X_train/test, y_train/test: gia' pronti

gb_lungo = GradientBoostingClassifier(n_estimators=500, random_state=0).fit(X_train, y_train)
gb_early = ...

iter_lungo = gb_lungo.n_estimators_
iter_early = ...
early_si_ferma_prima = ...

print(f"senza early stopping: {iter_lungo} alberi | con early stopping: {iter_early} alberi")
print("early stopping ferma prima:", early_si_ferma_prima)`,
      check: `from sklearn.ensemble import GradientBoostingClassifier
_ge = GradientBoostingClassifier(n_estimators=500, validation_fraction=0.2, n_iter_no_change=10, random_state=0).fit(X_train, y_train)
assert 'gb_early' in globals() and hasattr(gb_early, 'n_estimators_'), "gb_early: GradientBoostingClassifier con validation_fraction=0.2, n_iter_no_change=10"
assert 'iter_early' in globals() and iter_early == gb_early.n_estimators_, "iter_early: gb_early.n_estimators_"
assert 'early_si_ferma_prima' in globals() and early_si_ferma_prima == True and gb_early.n_estimators_ < 500, "early_si_ferma_prima: True — si ferma molto prima dei 500 alberi quando il validation non migliora piu'"`,
      hint: `<p><code>n_iter_no_change=10</code> ferma dopo 10 iterazioni senza miglioramento sul validation interno (<code>validation_fraction=0.2</code>). <code>n_estimators_</code> (con underscore finale) dà gli alberi effettivamente usati.</p>`,
      solution: `from sklearn.ensemble import GradientBoostingClassifier

gb_lungo = GradientBoostingClassifier(n_estimators=500, random_state=0).fit(X_train, y_train)
gb_early = GradientBoostingClassifier(n_estimators=500, validation_fraction=0.2,
                                       n_iter_no_change=10, random_state=0).fit(X_train, y_train)

iter_lungo = gb_lungo.n_estimators_
iter_early = gb_early.n_estimators_
early_si_ferma_prima = iter_early < iter_lungo

print(f"senza early stopping: {iter_lungo} alberi | con early stopping: {iter_early} alberi")
print("early stopping ferma prima:", early_si_ferma_prima)`
    },

    {
      type: "exercise", id: "me-25", kg: 25, title: "MASSIMALE: la valutazione completa",
      task: `<p>Il gran finale: valuta un modello da capo a fondo, onestamente. Dataset sbilanciato, pipeline con preprocessing, CV corretta, metriche giuste, soglia ottimizzata.</p>
<ul>
<li><code>pipe</code>: <code>Pipeline</code>(StandardScaler + LogisticRegression(max_iter=1000, class_weight="balanced"))</li>
<li><code>cv_auc</code>: AUC media in 5-fold CV stratificata (usa <code>cross_val_score</code> con <code>scoring="roc_auc"</code>) — senza leakage grazie alla pipeline</li>
<li><code>ap_test</code>: average precision sul test (dopo fit su train)</li>
<li><code>soglia_f1</code>: la soglia (tra quelle in <code>soglie</code>) che massimizza l'F1 sul test</li>
<li><code>f1_ottimo</code>: l'F1 a quella soglia</li>
<li><code>meglio_di_default</code>: <code>True</code> se f1_ottimo &ge; F1 alla soglia 0.5</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=2000, n_features=15, n_informative=6,
                            weights=[0.85, 0.15], random_state=8)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)`,
      starter: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import average_precision_score, f1_score
# X_train/test, y_train/test: gia' pronti (classe positiva 15%)

pipe = Pipeline([
    ("sc", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

cv_auc = ...   # cross_val_score su X_train, y_train, scoring="roc_auc"

pipe.fit(X_train, y_train)
proba = pipe.predict_proba(X_test)[:, 1]
ap_test = ...

soglie = np.arange(0.1, 0.9, 0.05)
f1_per_soglia = [f1_score(y_test, (proba >= s).astype(int)) for s in soglie]
soglia_f1 = soglie[int(np.argmax(f1_per_soglia))]
f1_ottimo = max(f1_per_soglia)
f1_default = f1_score(y_test, (proba >= 0.5).astype(int))
meglio_di_default = ...

print(f"CV AUC: {cv_auc:.3f} | AP test: {ap_test:.3f}")
print(f"soglia F1-ottima: {soglia_f1:.2f} | F1 {f1_ottimo:.3f} (default 0.5: {f1_default:.3f})")`,
      check: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import average_precision_score, f1_score
_pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000, class_weight="balanced"))])
_cv = cross_val_score(_pipe, X_train, y_train, cv=5, scoring="roc_auc").mean()
_pipe.fit(X_train, y_train)
_proba = _pipe.predict_proba(X_test)[:,1]
_ap = average_precision_score(y_test, _proba)
assert 'cv_auc' in globals() and abs(float(cv_auc) - _cv) < 0.02, "cv_auc: cross_val_score(pipe, X_train, y_train, cv=5, scoring='roc_auc').mean()"
assert 'ap_test' in globals() and abs(float(ap_test) - _ap) < 1e-6, "ap_test: average_precision_score(y_test, proba)"
assert 'soglia_f1' in globals() and 'f1_ottimo' in globals(), "soglia_f1 / f1_ottimo dalla ricerca su soglie"
assert 'meglio_di_default' in globals() and meglio_di_default == True, "meglio_di_default: True — ottimizzare la soglia non peggiora mai l'F1 rispetto al default 0.5"
assert float(cv_auc) > 0.8, "il modello deve avere AUC > 0.8"`,
      hint: `<p>Il <code>cross_val_score</code> con <code>scoring="roc_auc"</code> su <code>X_train</code>. L'AP: <code>average_precision_score(y_test, proba)</code>. Il confronto finale: <code>f1_ottimo &gt;= f1_default</code>. Tutto il preprocessing è nella pipeline: zero leakage in CV.</p>`,
      solution: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import average_precision_score, f1_score

pipe = Pipeline([
    ("sc", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

cv_auc = cross_val_score(pipe, X_train, y_train, cv=5, scoring="roc_auc").mean()

pipe.fit(X_train, y_train)
proba = pipe.predict_proba(X_test)[:, 1]
ap_test = average_precision_score(y_test, proba)

soglie = np.arange(0.1, 0.9, 0.05)
f1_per_soglia = [f1_score(y_test, (proba >= s).astype(int)) for s in soglie]
soglia_f1 = soglie[int(np.argmax(f1_per_soglia))]
f1_ottimo = max(f1_per_soglia)
f1_default = f1_score(y_test, (proba >= 0.5).astype(int))
meglio_di_default = f1_ottimo >= f1_default

print(f"CV AUC: {cv_auc:.3f} | AP test: {ap_test:.3f}")
print(f"soglia F1-ottima: {soglia_f1:.2f} | F1 {f1_ottimo:.3f} (default 0.5: {f1_default:.3f})")`
    }

  ]
});
