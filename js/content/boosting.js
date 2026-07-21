window.MODULES.push({
  id: "boosting",
  name: "Boosting & Modelli Avanzati",
  tagline: "La sala dei pesi massimi: gradient boosting, clustering, anomaly detection. I modelli che vincono le gare e trovano l'ago nel pagliaio.",
  intro: "Oltre la Random Forest: boosting che corregge i propri errori, clustering che scopre gruppi senza etichette, rilevatori di anomalie. XGBoost/LightGBM non girano in Pyodide — li spieghiamo, ma qui si allena con i loro parenti scikit-learn, che condividono le stesse idee.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Bagging vs Boosting: due modi di fare squadra", html: `
<p>Gli <strong>ensemble</strong> combinano molti modelli deboli in uno forte. Due filosofie opposte:</p>
<p><strong>Bagging</strong> (Random Forest): addestra tanti alberi <em>in parallelo</em>, ognuno su un campione bootstrap diverso, poi media le loro predizioni. Riduce la <strong>varianza</strong> — tanti alberi che sbagliano in modi scorrelati, mediati, sbagliano meno.</p>
<p><strong>Boosting</strong> (Gradient Boosting, XGBoost): addestra alberi <em>in sequenza</em>, ognuno che corregge gli errori del precedente. Riduce il <strong>bias</strong> — parte da un modello debole e lo raffina passo dopo passo concentrandosi sugli errori residui.</p>
<pre><code>from sklearn.ensemble import RandomForestClassifier      # bagging
from sklearn.ensemble import GradientBoostingClassifier  # boosting</code></pre>
<p>Regola pratica: il boosting spesso vince in accuratezza (domina le competizioni Kaggle su dati tabulari), ma è più delicato da tarare e più incline all'overfitting. Il bagging è più robusto e "funziona e basta".</p>
`, more: `
<p>La distinzione bias/varianza è il perché profondo. Un albero profondo singolo ha basso bias (può catturare qualsiasi pattern) ma alta varianza (cambia molto al variare dei dati). Il bagging lascia gli alberi profondi ma ne media tanti addestrati su campioni diversi: la varianza crolla (media di stimatori scorrelati) mentre il bias resta basso. Il boosting parte dall'estremo opposto: alberi <em>deboli</em> (spesso profondità 1-3, alto bias, bassa varianza) e ne somma tanti, ciascuno che abbassa un po' il bias correggendo l'errore residuo del comitato finora. Due strade diverse verso lo stesso obiettivo — un modello a bias e varianza entrambi bassi.</p>
<p>La conseguenza pratica sull'overfitting è opposta e va conosciuta: in una Random Forest, aggiungere alberi non fa MAI overfitting (la media converge, al più smetti di migliorare) — più alberi è sempre sicuro, solo più lento. Nel gradient boosting, aggiungere alberi PUÒ far overfitting perché ogni albero insegue sempre più da vicino gli errori residui, incluso il rumore: il numero di alberi è esso stesso un iperparametro di regolarizzazione da tarare (con early stopping, visto nella sala Model Evaluation). Sapere che "più alberi" è sicuro per la RF ma pericoloso per il boosting è una domanda da colloquio.</p>
<p>Perché il boosting domina i dati tabulari mentre il deep learning domina immagini/testo: sui dati strutturati (colonne eterogenee, interazioni non lineari, dimensioni moderate) gli alberi boosted trovano soglie e interazioni in modo efficientissimo, senza bisogno di enormi quantità di dati né di scaling, e con poca ingegneria. Le reti neurali brillano quando c'è struttura spaziale/sequenziale da sfruttare (pixel vicini, parole in sequenza) e dati abbondanti. Per un problema tabulare "normale", il primo modello serio da provare nel 2026 resta un gradient boosting — non una rete.</p>
` },

    {
      type: "exercise", id: "bo-01", kg: 10, title: "Parallelo contro sequenziale",
      task: `<p>Confronta bagging (Random Forest) e boosting (Gradient Boosting) sullo stesso dataset:</p>
<ul>
<li><code>acc_rf</code>: accuratezza CV (5-fold) della RandomForest</li>
<li><code>acc_gb</code>: accuratezza CV del GradientBoosting</li>
<li><code>entrambi_buoni</code>: <code>True</code> se entrambi superano 0.9</li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: `from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
# X, y: breast cancer

acc_rf = ...
acc_gb = ...
entrambi_buoni = ...

print(f"Random Forest (bagging): {acc_rf:.3f} | Gradient Boosting: {acc_gb:.3f}")`,
      check: `from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
_rf = cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5).mean()
_gb = cross_val_score(GradientBoostingClassifier(random_state=0), X, y, cv=5).mean()
assert 'acc_rf' in globals() and abs(float(acc_rf) - _rf) < 0.02, "acc_rf: cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5).mean()"
assert 'acc_gb' in globals() and abs(float(acc_gb) - _gb) < 0.02, "acc_gb: cross_val_score(GradientBoostingClassifier(random_state=0), X, y, cv=5).mean()"
assert 'entrambi_buoni' in globals() and entrambi_buoni == True, "entrambi_buoni: True — su breast cancer entrambi superano 0.9"`,
      hint: `<p>Usa <code>random_state=0</code> in entrambi e <code>cross_val_score(..., cv=5).mean()</code>. Il bagging media alberi in parallelo, il boosting li concatena in serie: qui danno risultati simili, ma con approcci opposti.</p>`,
      solution: `from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

acc_rf = cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5).mean()
acc_gb = cross_val_score(GradientBoostingClassifier(random_state=0), X, y, cv=5).mean()
entrambi_buoni = acc_rf > 0.9 and acc_gb > 0.9

print(f"Random Forest (bagging): {acc_rf:.3f} | Gradient Boosting: {acc_gb:.3f}")`
    },

    { type: "theory", title: "Come funziona il gradient boosting", html: `
<p>Il <strong>gradient boosting</strong> costruisce il modello a piccoli passi. Ogni nuovo albero non predice il target, ma i <strong>residui</strong> — gli errori — del comitato finora:</p>
<pre><code>predizione = f0                    # partenza: media o log-odds
for m in range(M):
    residui = y - predizione_corrente        # dove sbaglio ancora?
    albero_m = fit(X, residui)                # un albero che predice l'errore
    predizione_corrente += learning_rate * albero_m.predict(X)</code></pre>
<p>Il <strong>learning rate</strong> è cruciale: scala il contributo di ogni albero. Piccolo (0.01-0.1) = passi prudenti, servono più alberi ma il modello generalizza meglio; grande (0.3+) = passi aggressivi, rischio overfitting. La coppia <code>learning_rate</code> &times; <code>n_estimators</code> è il compromesso centrale da tarare: più basso il primo, più alto deve essere il secondo.</p>
`, more: `
<p>Il "gradient" nel nome è letterale: i residui che ogni albero insegue sono (per la perdita quadratica) il <em>gradiente negativo</em> della funzione di costo rispetto alle predizioni. Il boosting è quindi una discesa del gradiente NELLO SPAZIO DELLE FUNZIONI — ogni albero è un passo nella direzione che riduce di più la perdita. Cambiando la funzione di costo cambiano i "residui" da inseguire: perdita quadratica per regressione, log-loss per classificazione, pinball loss per quantili. Questa generalità è ciò che rende il framework così potente e adattabile.</p>
<p>Gli iperparametri chiave e cosa controllano: <code>learning_rate</code> e <code>n_estimators</code> (il compromesso principale, legati inversamente — c'è "shrinkage", passi piccoli e tanti generalizzano meglio di pochi grandi); <code>max_depth</code> degli alberi (2-5 tipicamente, controlla quanto interagiscono le feature — profondità 1 = solo effetti additivi, nessuna interazione); <code>subsample</code> &lt; 1 (stochastic gradient boosting: ogni albero vede solo una frazione dei dati, aggiunge casualità benefica come nel bagging); <code>min_samples_leaf</code>/regolarizzazione (contro l'overfitting delle foglie). Tararli è più delicato che con la Random Forest, che spesso funziona bene coi default.</p>
<p>Il legame con l'early stopping (sala Model Evaluation): dato che aggiungere alberi può far overfitting, il numero ottimale di alberi si trova monitorando una validation e fermandosi quando smette di migliorare. Con un learning rate basso questa curva è liscia e l'ottimo è chiaro; con learning rate alto è rumorosa e si rischia di superare il punto migliore tra un controllo e l'altro. È il motivo pratico per preferire learning rate bassi: non solo generalizzano meglio, ma rendono l'early stopping affidabile.</p>
` },

    {
      type: "exercise", id: "bo-02", kg: 15, title: "Boosting a mano sui residui",
      task: `<p>Costruisci un mini gradient boosting per regressione, a mano, per capire il meccanismo. Tre alberi deboli in sequenza:</p>
<ul>
<li><code>pred</code>: la predizione, che parte dalla media di y e viene aggiornata 3 volte</li>
<li>ad ogni passo: fitta un albero (profondità 2) sui <strong>residui</strong> correnti e aggiungi <code>lr * albero.predict(X)</code> con <code>lr=0.5</code></li>
<li><code>mse_finale</code>: MSE della predizione finale</li>
<li><code>migliora</code>: <code>True</code> se l'MSE finale è minore di quello del solo valore iniziale (la media)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
X = np.sort(rng.uniform(0, 10, size=100)).reshape(-1, 1)
y = np.sin(X).ravel() + rng.normal(0, 0.1, size=100)`,
      starter: `import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error
# X, y: una sinusoide rumorosa | lr = 0.5

lr = 0.5
pred = np.full(len(y), y.mean())   # partenza: la media
mse_iniziale = mean_squared_error(y, pred)

for m in range(3):
    residui = y - pred
    albero = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, residui)
    pred = ...   # aggiorna: pred + lr * predizione dell'albero sui residui

mse_finale = ...
migliora = ...

print(f"MSE iniziale (solo media): {mse_iniziale:.3f} -> dopo 3 alberi: {mse_finale:.3f}")`,
      check: `import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error
_pred = np.full(len(y), y.mean())
for m in range(3):
    _res = y - _pred
    _a = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, _res)
    _pred = _pred + 0.5 * _a.predict(X)
_mf = mean_squared_error(y, _pred)
assert 'mse_finale' in globals() and abs(float(mse_finale) - _mf) < 1e-6, "mse_finale: MSE dopo i 3 aggiornamenti sui residui"
assert 'migliora' in globals() and migliora == True and _mf < mean_squared_error(y, np.full(len(y), y.mean())), "migliora: True — ogni albero sui residui riduce l'errore"`,
      hint: `<p>L'aggiornamento è <code>pred = pred + lr * albero.predict(X)</code>. Ogni albero impara DOVE il comitato sbaglia ancora (i residui) e corregge un po' (scalato da lr). È il boosting in 3 righe.</p>`,
      solution: `import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error

lr = 0.5
pred = np.full(len(y), y.mean())
mse_iniziale = mean_squared_error(y, pred)

for m in range(3):
    residui = y - pred
    albero = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, residui)
    pred = pred + lr * albero.predict(X)

mse_finale = mean_squared_error(y, pred)
migliora = mse_finale < mse_iniziale

print(f"MSE iniziale (solo media): {mse_iniziale:.3f} -> dopo 3 alberi: {mse_finale:.3f}")`
    },

    {
      type: "exercise", id: "bo-03", kg: 15, title: "Learning rate: passi prudenti o aggressivi",
      task: `<p>Esplora il compromesso learning_rate × n_estimators. Con pochi alberi, un lr più alto compensa:</p>
<ul>
<li><code>acc_lr_basso</code>: GradientBoosting con <code>learning_rate=0.01, n_estimators=20</code> (passi minuscoli, pochi alberi: sottoallenato)</li>
<li><code>acc_lr_medio</code>: con <code>learning_rate=0.2, n_estimators=20</code></li>
<li><code>medio_meglio_con_pochi_alberi</code>: <code>True</code> se con soli 20 alberi il lr medio batte quello bassissimo</li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=800, n_features=15, n_informative=6, random_state=2)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.ensemble import GradientBoostingClassifier
# X_train/test, y_train/test: gia' pronti

acc_lr_basso = GradientBoostingClassifier(learning_rate=0.01, n_estimators=20, random_state=0).fit(X_train, y_train).score(X_test, y_test)
acc_lr_medio = ...
medio_meglio_con_pochi_alberi = ...

print(f"lr 0.01 (20 alberi): {acc_lr_basso:.3f} | lr 0.2 (20 alberi): {acc_lr_medio:.3f}")`,
      check: `from sklearn.ensemble import GradientBoostingClassifier
_ab = GradientBoostingClassifier(learning_rate=0.01, n_estimators=20, random_state=0).fit(X_train, y_train).score(X_test, y_test)
_am = GradientBoostingClassifier(learning_rate=0.2, n_estimators=20, random_state=0).fit(X_train, y_train).score(X_test, y_test)
assert 'acc_lr_medio' in globals() and abs(float(acc_lr_medio) - _am) < 1e-6, "acc_lr_medio: learning_rate=0.2, n_estimators=20"
assert 'medio_meglio_con_pochi_alberi' in globals() and medio_meglio_con_pochi_alberi == bool(_am > _ab), "medio_meglio_con_pochi_alberi: con soli 20 alberi il lr=0.01 e' troppo timido (sottoallenato), il lr=0.2 fa meglio"`,
      hint: `<p>Con solo 20 alberi, <code>learning_rate=0.01</code> fa passi troppo piccoli per arrivare da nessuna parte (sottoallenamento): serve un lr più alto o molti più alberi. <code>medio_meglio = acc_lr_medio &gt; acc_lr_basso</code>.</p>`,
      solution: `from sklearn.ensemble import GradientBoostingClassifier

acc_lr_basso = GradientBoostingClassifier(learning_rate=0.01, n_estimators=20, random_state=0).fit(X_train, y_train).score(X_test, y_test)
acc_lr_medio = GradientBoostingClassifier(learning_rate=0.2, n_estimators=20, random_state=0).fit(X_train, y_train).score(X_test, y_test)
medio_meglio_con_pochi_alberi = acc_lr_medio > acc_lr_basso

print(f"lr 0.01 (20 alberi): {acc_lr_basso:.3f} | lr 0.2 (20 alberi): {acc_lr_medio:.3f}")`
    },

    { type: "theory", title: "HistGradientBoosting: il boosting moderno in sklearn", html: `
<p>Il <code>GradientBoostingClassifier</code> classico è lento su dataset grandi. scikit-learn ha una versione moderna ispirata a LightGBM: l'<strong>HistGradientBoosting</strong>, che discretizza le feature in istogrammi (bin) per split velocissimi.</p>
<pre><code>from sklearn.ensemble import HistGradientBoostingClassifier
hgb = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.1)
# vantaggi: molto piu' veloce, gestisce i NaN NATIVAMENTE,
# early stopping automatico di default</code></pre>
<p>È il gradient boosting da usare oggi in scikit-learn: velocità paragonabile a LightGBM, gestione nativa dei valori mancanti (niente imputazione necessaria!), ed early stopping integrato. Per dataset con più di qualche migliaio di righe, è nettamente preferibile al GradientBoosting classico.</p>
`, more: `
<p>Il trucco degli <strong>istogrammi</strong> è ciò che dà la velocità: invece di considerare ogni possibile valore di split per una feature continua (costoso: ordina e valuta n-1 soglie), l'algoritmo discretizza ogni feature in ~255 bin una volta sola all'inizio, e poi cerca gli split solo tra i bordi dei bin. Questo trasforma il costo per feature da O(n log n) per albero a O(n_bin), un'accelerazione enorme su dataset grandi con perdita di precisione trascurabile. È la stessa idea alla base di LightGBM, ed è il motivo per cui questi modelli scalano a milioni di righe dove il boosting classico arranca.</p>
<p>La gestione nativa dei NaN è una comodità sostanziale e sottovalutata: l'HistGradientBoosting impara, per ogni split, in quale ramo mandare i valori mancanti (a sinistra o a destra) in base a cosa minimizza la perdita. Questo significa niente pipeline di imputazione, e spesso risultati MIGLIORI dell'imputazione manuale — perché "mancante" può essere informativo (come discusso nella sala Feature Engineering) e il modello sfrutta quell'informazione invece di cancellarla riempiendo con la mediana. Per dati con molti NaN è un argomento forte a favore di questi modelli.</p>
<p>Rapporto con le librerie esterne (XGBoost, LightGBM, CatBoost): l'HistGradientBoosting di sklearn copre il 90% dei casi con un'API pulita e integrata, ma le librerie dedicate offrono di più — LightGBM è spesso ancora più veloce e ha crescita degli alberi leaf-wise, XGBoost ha regolarizzazione più ricca e enorme ecosistema, CatBoost gestisce nativamente le categoriche e riduce un tipo di leakage nell'encoding. Nelle competizioni e in produzione ad alte prestazioni si usano quelle; per lavorare dentro scikit-learn (pipeline, grid search, no dipendenze extra) l'HistGradientBoosting è l'opzione giusta. In Pyodide, dove le librerie C++ esterne non girano, è l'unico gradient boosting "serio" disponibile.</p>
` },

    {
      type: "exercise", id: "bo-04", kg: 15, title: "Il boosting che gestisce i NaN da solo",
      task: `<p>Dimostra che l'HistGradientBoosting gestisce i NaN senza imputazione. Dataset con valori mancanti:</p>
<ul>
<li><code>hgb</code>: <code>HistGradientBoostingClassifier(random_state=0)</code> addestrato DIRETTAMENTE su dati con NaN</li>
<li><code>acc</code>: accuratezza sul test (con NaN anche lì)</li>
<li><code>gestisce_nan</code>: <code>True</code> se il modello si addestra e valuta senza errori nonostante i NaN (acc &gt; 0.7)</li>
<li><code>quanti_nan</code>: quanti NaN ci sono in <code>X_train</code></li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=1000, n_features=10, n_informative=6, random_state=1)
rng = np.random.default_rng(1)
# inserisco NaN casuali (10% delle celle)
mask = rng.random(X.shape) < 0.1
X[mask] = np.nan
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
# X_train/test contengono NaN, y_train/test i target

quanti_nan = ...   # numero di NaN in X_train
hgb = ...
acc = ...
gestisce_nan = ...

print(f"NaN nel train: {quanti_nan} | accuratezza col NaN grezzi: {acc:.3f} | gestisce NaN: {gestisce_nan}")`,
      check: `import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
_h = HistGradientBoostingClassifier(random_state=0).fit(X_train, y_train)
_a = _h.score(X_test, y_test)
assert 'quanti_nan' in globals() and int(quanti_nan) == int(np.isnan(X_train).sum()), "quanti_nan: np.isnan(X_train).sum()"
assert 'hgb' in globals() and isinstance(hgb, HistGradientBoostingClassifier), "hgb: HistGradientBoostingClassifier(random_state=0).fit(X_train, y_train) — direttamente sui NaN!"
assert 'acc' in globals() and abs(float(acc) - _a) < 0.02, "acc: hgb.score(X_test, y_test)"
assert 'gestisce_nan' in globals() and gestisce_nan == True and _a > 0.7, "gestisce_nan: True — nessuna imputazione necessaria, il modello manda i NaN nel ramo giusto da solo"`,
      hint: `<p>Nessun <code>SimpleImputer</code>: passa <code>X_train</code> coi NaN direttamente a <code>.fit()</code>. Conta i NaN con <code>np.isnan(X_train).sum()</code>. È il grande vantaggio pratico di questo modello.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier

quanti_nan = int(np.isnan(X_train).sum())
hgb = HistGradientBoostingClassifier(random_state=0).fit(X_train, y_train)
acc = hgb.score(X_test, y_test)
gestisce_nan = acc > 0.7

print(f"NaN nel train: {quanti_nan} | accuratezza col NaN grezzi: {acc:.3f} | gestisce NaN: {gestisce_nan}")`
    },

    { type: "theory", title: "XGBoost, LightGBM, CatBoost: i campioni delle gare", html: `
<p>Nelle competizioni su dati tabulari, tre librerie dominano — tutte varianti di gradient boosting. NON girano in Pyodide (sono in C++), ma vanno conosciute:</p>
<ul>
<li><strong>XGBoost</strong>: il capostipite moderno. Regolarizzazione forte (L1+L2), gestione dei mancanti, enorme ecosistema. Lo standard di fatto per anni.</li>
<li><strong>LightGBM</strong> (Microsoft): crescita degli alberi <em>leaf-wise</em> (espande la foglia più promettente, non livello per livello) e istogrammi. Spesso il più veloce.</li>
<li><strong>CatBoost</strong> (Yandex): gestione nativa delle categoriche con un encoding ordinato che riduce il leakage. Ottimo con molte feature categoriche.</li>
</ul>
<p>L'<code>HistGradientBoostingClassifier</code> di sklearn che usi in questa sala è il loro cugino stretto: stessa idea (istogrammi, boosting), API sklearn. Ciò che impari qui trasferisce direttamente.</p>
`, more: `
<p>Le differenze tecniche che i colloqui a volte approfondiscono. <strong>LightGBM leaf-wise vs level-wise</strong>: XGBoost (di default) e l'HistGradientBoosting crescono gli alberi livello per livello (tutti i nodi di una profondità prima di scendere); LightGBM espande sempre la foglia che riduce di più la perdita, ovunque sia. Leaf-wise converge più in fretta e spesso a modelli migliori, ma fa più facilmente overfitting su dataset piccoli (alberi sbilanciati e profondi) — va limitato con <code>num_leaves</code> e <code>min_child_samples</code>.</p>
<p><strong>CatBoost e l'ordered target encoding</strong>: il target encoding delle categoriche (sala Feature Engineering) soffre di leakage se una riga vede il proprio target. CatBoost risolve con un encoding "ordinato" — calcola l'encoding di ogni riga usando solo le righe precedenti in un ordinamento casuale, come una validazione online. È il motivo per cui CatBoost eccelle su dataset con molte categoriche ad alta cardinalità con pochissima ingegneria manuale. Un'idea elegante che vale la pena citare.</p>
<p>Quale scegliere, nella pratica: la differenza di accuratezza tra i tre, ben tarati, è spesso minima — la scelta è più su velocità, gestione categoriche, ecosistema e familiarità. La sequenza pragmatica per un problema tabulare nuovo: (1) un baseline lineare o Random Forest per avere un riferimento; (2) HistGradientBoosting/LightGBM con default per un modello forte in fretta; (3) tuning degli iperparametri se serve spremere l'ultimo punto. Saltare direttamente al tuning di XGBoost senza baseline è un errore classico da junior: non sai da cosa stai migliorando, e a volte una feature in più batte qualsiasi tuning.</p>
` },

    {
      type: "exercise", id: "bo-05", kg: 10, title: "Quiz: chi è chi nel boosting",
      task: `<p>Cinque affermazioni sui campioni del boosting. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "LightGBM cresce gli alberi leaf-wise, espandendo la foglia più promettente"</li>
<li><code>a2</code>: "CatBoost è pensato soprattutto per gestire bene le feature categoriche"</li>
<li><code>a3</code>: "XGBoost, LightGBM e CatBoost girano perfettamente in Pyodide nel browser"</li>
<li><code>a4</code>: "L'HistGradientBoosting di sklearn usa la stessa idea degli istogrammi di LightGBM"</li>
<li><code>a5</code>: "Nel boosting, aggiungere alberi all'infinito non causa MAI overfitting"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: LightGBM e' famoso per la crescita leaf-wise"
assert a2 == True, "a2 VERA: CatBoost eccelle sulle categoriche (ordered target encoding)"
assert a3 == False, "a3 FALSA: sono librerie C++, NON girano in Pyodide — per questo qui usiamo HistGradientBoosting"
assert a4 == True, "a4 VERA: HistGradientBoosting e' il cugino sklearn, stessa idea degli istogrammi"
assert a5 == False, "a5 FALSA: nel BOOSTING aggiungere alberi PUO' overfittare (inseguono i residui, incluso il rumore). E' nella RANDOM FOREST che e' sicuro"`,
      hint: `<p>Le due trappole: (a3) le librerie C++ non girano in Pyodide; (a5) confondere bagging e boosting sull'overfitting — nella RF più alberi è sicuro, nel boosting no.</p>`,
      solution: `a1 = True
a2 = True
a3 = False
a4 = True
a5 = False

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "bo-06", kg: 15, title: "ExtraTrees: alberi ancora più casuali",
      task: `<p>Gli <strong>Extremely Randomized Trees</strong> spingono la casualità oltre la Random Forest: scelgono le soglie di split a caso invece che ottimali. Più veloce e a volte meno overfitting. Confronta:</p>
<ul>
<li><code>acc_rf</code>: accuratezza CV della RandomForest</li>
<li><code>acc_et</code>: accuratezza CV degli ExtraTrees</li>
<li><code>entrambi_competitivi</code>: <code>True</code> se differiscono meno di 0.1 (sono approcci simili, prestazioni vicine)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
X, y = load_wine(return_X_y=True)`,
      starter: `from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.model_selection import cross_val_score
# X, y: wine

acc_rf = cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5).mean()
acc_et = ...
entrambi_competitivi = ...

print(f"Random Forest: {acc_rf:.3f} | Extra Trees: {acc_et:.3f}")`,
      check: `from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.model_selection import cross_val_score
_et = cross_val_score(ExtraTreesClassifier(random_state=0), X, y, cv=5).mean()
assert 'acc_et' in globals() and abs(float(acc_et) - _et) < 0.02, "acc_et: cross_val_score(ExtraTreesClassifier(random_state=0), X, y, cv=5).mean()"
assert 'entrambi_competitivi' in globals() and entrambi_competitivi == True, "entrambi_competitivi: True — ExtraTrees e RandomForest danno risultati simili su wine"`,
      hint: `<p><code>ExtraTreesClassifier</code> ha la stessa interfaccia della RandomForest. La differenza è interna: le soglie di split sono casuali (più veloce, più varianza per albero ma più decorrelazione). <code>entrambi_competitivi = abs(acc_rf - acc_et) &lt; 0.1</code>.</p>`,
      solution: `from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.model_selection import cross_val_score

acc_rf = cross_val_score(RandomForestClassifier(random_state=0), X, y, cv=5).mean()
acc_et = cross_val_score(ExtraTreesClassifier(random_state=0), X, y, cv=5).mean()
entrambi_competitivi = abs(acc_rf - acc_et) < 0.1

print(f"Random Forest: {acc_rf:.3f} | Extra Trees: {acc_et:.3f}")`
    },

    { type: "theory", title: "Il clustering: gruppi senza etichette", html: `
<p>Finora ogni modello aveva una y da predire (apprendimento <em>supervisionato</em>). Il <strong>clustering</strong> è <em>non supervisionato</em>: nessuna etichetta, l'obiettivo è scoprire gruppi naturali nei dati.</p>
<pre><code>from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=0, n_init=10)
etichette = km.fit_predict(X)   # assegna ogni punto a un cluster
km.cluster_centers_             # i centroidi</code></pre>
<p><strong>K-Means</strong> è il più usato: cerca k centri e assegna ogni punto al più vicino, iterando finché i centri si stabilizzano. Applicazioni: segmentazione clienti, compressione, raggruppamento di documenti. Ma ha assunzioni forti: cluster sferici, di dimensione simile, e devi decidere k in anticipo.</p>
`, more: `
<p>K-Means minimizza l'<strong>inerzia</strong> (somma delle distanze quadratiche dei punti dal proprio centroide) con l'algoritmo di Lloyd: assegna i punti ai centri più vicini, ricalcola i centri come media dei punti assegnati, ripeti. Converge sempre, ma a un MINIMO LOCALE che dipende dall'inizializzazione — per questo <code>n_init=10</code> (ripete con inizializzazioni diverse e tiene la migliore) e <code>k-means++</code> (inizializzazione furba che sparpaglia i centri iniziali) sono importanti. Con <code>n_init=1</code> e sfortuna, K-Means può dare cluster palesemente sbagliati.</p>
<p>Le assunzioni che K-Means impone, e quando lo tradiscono: (1) cluster <strong>sferici e isotropi</strong> — fallisce su cluster allungati o a forma di banana (lì servono DBSCAN o clustering spettrale); (2) cluster di <strong>dimensione/densità simile</strong> — un cluster piccolo e denso vicino a uno grande e sparso viene spesso "mangiato"; (3) usa la <strong>distanza euclidea</strong> — quindi lo scaling delle feature è cruciale (come per KNN: senza standardizzazione, la feature con range più grande domina i cluster). Dare per scontato che K-Means "trovi i gruppi giusti" senza controllare queste assunzioni è l'errore tipico.</p>
<p>Il problema del K nel clustering non supervisionato è profondo: NON esiste la risposta giusta oggettiva, perché non ci sono etichette. Ci sono euristiche — il metodo del gomito (elbow) sull'inerzia, il silhouette score — ma alla fine "quanti cluster" dipende da cosa vuoi farci: 3 segmenti clienti per una campagna, 10 per un'analisi fine. Il clustering è esplorativo e le sue "verità" vanno validate rispetto a un obiettivo esterno, non prese come oggettive. È una differenza filosofica dal supervisionato che i colloqui su ruoli analytics amano sondare.</p>
` },

    {
      type: "exercise", id: "bo-07", kg: 15, title: "K-Means trova i gruppi",
      task: `<p>Applica K-Means a dati con 3 blob naturali e verifica che li trovi:</p>
<ul>
<li><code>km</code>: <code>KMeans(n_clusters=3, random_state=0, n_init=10)</code></li>
<li><code>etichette</code>: le assegnazioni con <code>fit_predict</code></li>
<li><code>n_cluster_trovati</code>: quanti cluster distinti (dovrebbero essere 3)</li>
<li><code>centroidi</code>: i centri dei cluster</li>
<li><code>inerzia</code>: l'inerzia finale (<code>km.inertia_</code>)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, y_vero = make_blobs(n_samples=300, centers=3, cluster_std=0.8, random_state=0)`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
# X: 300 punti in 3 blob | y_vero: le vere etichette (che K-Means NON vede)

km = ...
etichette = ...
n_cluster_trovati = len(np.unique(etichette))
centroidi = ...
inerzia = ...

print(f"cluster trovati: {n_cluster_trovati} | inerzia: {inerzia:.1f}")
print("centroidi:\\n", np.round(centroidi, 2))`,
      check: `import numpy as np
from sklearn.cluster import KMeans
_km = KMeans(n_clusters=3, random_state=0, n_init=10).fit(X)
assert 'etichette' in globals() and len(np.unique(etichette)) == 3, "etichette: km.fit_predict(X), 3 cluster distinti"
assert 'n_cluster_trovati' in globals() and n_cluster_trovati == 3, "n_cluster_trovati: 3"
assert 'centroidi' in globals() and np.asarray(centroidi).shape == (3, 2), "centroidi: km.cluster_centers_, 3 centri in 2D"
assert 'inerzia' in globals() and abs(float(inerzia) - _km.inertia_) < 1.0, "inerzia: km.inertia_"`,
      hint: `<p><code>km.fit_predict(X)</code> addestra e assegna in un colpo. I centri: <code>km.cluster_centers_</code>. L'inerzia: <code>km.inertia_</code>. Nota: K-Means NON usa <code>y_vero</code> — scopre i gruppi da solo.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, random_state=0, n_init=10)
etichette = km.fit_predict(X)
n_cluster_trovati = len(np.unique(etichette))
centroidi = km.cluster_centers_
inerzia = km.inertia_

print(f"cluster trovati: {n_cluster_trovati} | inerzia: {inerzia:.1f}")
print("centroidi:\\n", np.round(centroidi, 2))`
    },

    {
      type: "exercise", id: "bo-08", kg: 20, title: "Il metodo del gomito",
      task: `<p>Quanti cluster? Il metodo del gomito cerca il punto in cui i cali di inerzia <strong>improvvisamente si appiattiscono</strong>. Il modo robusto: guardare il RAPPORTO tra cali consecutivi — dove crolla di più, lì è il gomito.</p>
<ul>
<li><code>inerzie</code>: lista dell'inerzia per k da 1 a 6</li>
<li><code>cali</code>: lista dei cali di inerzia tra k consecutivi (<code>inerzie[i] - inerzie[i+1]</code>)</li>
<li><code>rapporti</code>: lista dei rapporti tra cali consecutivi (<code>cali[i] / cali[i+1]</code>): dove è massimo, i cali stanno crollando</li>
<li><code>gomito</code>: il k del gomito, <code>int(np.argmax(rapporti)) + 2</code> (i dati hanno 3 blob veri)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=400, centers=3, cluster_std=0.7, random_state=1)`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
# X: 400 punti, 3 blob veri

inerzie = []
for k in range(1, 7):
    km = KMeans(n_clusters=k, random_state=0, n_init=10).fit(X)
    inerzie.append(km.inertia_)

cali = [inerzie[i] - inerzie[i+1] for i in range(len(inerzie)-1)]
# rapporto tra cali consecutivi: quando un calo grande e' seguito da uno piccolo, il rapporto schizza
rapporti = [cali[i] / cali[i+1] for i in range(len(cali)-1)]
gomito = ...

print("inerzie:", [round(v) for v in inerzie])
print("cali:", [round(v) for v in cali])
print("rapporti:", [round(v, 1) for v in rapporti])
print("gomito a k =", gomito)`,
      check: `import numpy as np
from sklearn.cluster import KMeans
_in = []
for k in range(1,7):
    _in.append(KMeans(n_clusters=k, random_state=0, n_init=10).fit(X).inertia_)
_cali = [_in[i]-_in[i+1] for i in range(len(_in)-1)]
_rap = [_cali[i]/_cali[i+1] for i in range(len(_cali)-1)]
assert 'inerzie' in globals() and len(inerzie) == 6, "inerzie: una per k da 1 a 6"
assert 'cali' in globals() and len(cali) == 5, "cali: 5 differenze consecutive"
assert 'rapporti' in globals() and len(rapporti) == 4, "rapporti: 4 rapporti tra cali consecutivi"
assert 'gomito' in globals() and gomito == 3, "gomito: int(np.argmax(rapporti)) + 2 = 3 — dopo k=3 i cali crollano da ~1781 a ~51"`,
      hint: `<p>Il calo 2→3 è ancora grande (~1781), poi crolla a ~51: il rapporto <code>cali[1]/cali[2]</code> è enorme. <code>gomito = int(np.argmax(rapporti)) + 2</code> (indice del rapporto → k dopo il quale si appiattisce).</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans

inerzie = []
for k in range(1, 7):
    km = KMeans(n_clusters=k, random_state=0, n_init=10).fit(X)
    inerzie.append(km.inertia_)

cali = [inerzie[i] - inerzie[i+1] for i in range(len(inerzie)-1)]
rapporti = [cali[i] / cali[i+1] for i in range(len(cali)-1)]
gomito = int(np.argmax(rapporti)) + 2

print("inerzie:", [round(v) for v in inerzie])
print("cali:", [round(v) for v in cali])
print("rapporti:", [round(v, 1) for v in rapporti])
print("gomito a k =", gomito)`
    },

    {
      type: "exercise", id: "bo-09", kg: 20, title: "Silhouette: quanto sono buoni i cluster",
      task: `<p>Il <strong>silhouette score</strong> misura quanto i cluster sono compatti e separati (da -1 a 1, più alto meglio). Usalo per scegliere k:</p>
<ul>
<li><code>silhouette_per_k</code>: dizionario k &rarr; silhouette score, per k da 2 a 5</li>
<li><code>k_migliore</code>: il k col silhouette più alto</li>
<li><code>trova_i_3_blob</code>: <code>True</code> se <code>k_migliore == 3</code> (i blob veri)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=400, centers=3, cluster_std=0.6, random_state=2)`,
      starter: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
# X: 400 punti, 3 blob ben separati

silhouette_per_k = {}
for k in range(2, 6):
    etichette = KMeans(n_clusters=k, random_state=0, n_init=10).fit_predict(X)
    silhouette_per_k[k] = ...

k_migliore = ...
trova_i_3_blob = ...

print("silhouette per k:", {k: round(v, 3) for k, v in silhouette_per_k.items()})
print("k migliore:", k_migliore)`,
      check: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
_s = {}
for k in range(2,6):
    _e = KMeans(n_clusters=k, random_state=0, n_init=10).fit_predict(X)
    _s[k] = silhouette_score(X, _e)
_best = max(_s, key=_s.get)
assert 'silhouette_per_k' in globals() and all(abs(silhouette_per_k[k] - _s[k]) < 1e-6 for k in range(2,6)), "silhouette_per_k[k]: silhouette_score(X, etichette)"
assert 'k_migliore' in globals() and k_migliore == _best, "k_migliore: max(silhouette_per_k, key=silhouette_per_k.get)"
assert 'trova_i_3_blob' in globals() and trova_i_3_blob == True and _best == 3, "trova_i_3_blob: True — il silhouette e' massimo a k=3, i blob veri"`,
      hint: `<p><code>silhouette_score(X, etichette)</code> vuole i dati E le assegnazioni. Il k migliore: <code>max(silhouette_per_k, key=silhouette_per_k.get)</code>. Su 3 blob ben separati, il silhouette premia k=3.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

silhouette_per_k = {}
for k in range(2, 6):
    etichette = KMeans(n_clusters=k, random_state=0, n_init=10).fit_predict(X)
    silhouette_per_k[k] = silhouette_score(X, etichette)

k_migliore = max(silhouette_per_k, key=silhouette_per_k.get)
trova_i_3_blob = k_migliore == 3

print("silhouette per k:", {k: round(v, 3) for k, v in silhouette_per_k.items()})
print("k migliore:", k_migliore)`
    },

    { type: "theory", title: "DBSCAN: cluster di forma qualsiasi", html: `
<p>K-Means fallisce su cluster non sferici (una mezzaluna, una spirale) e richiede di sapere k. Il <strong>DBSCAN</strong> supera entrambi i limiti: trova cluster in base alla <em>densità</em>, di qualunque forma, e scopre da solo quanti sono — segnalando anche gli <strong>outlier</strong>.</p>
<pre><code>from sklearn.cluster import DBSCAN
db = DBSCAN(eps=0.5, min_samples=5)
etichette = db.fit_predict(X)
# eps: raggio del vicinato | min_samples: quanti vicini per essere "denso"
# etichetta -1 = OUTLIER (punto in nessun cluster)</code></pre>
<p>Idea: un punto è "core" se ha almeno <code>min_samples</code> vicini entro <code>eps</code>. I cluster crescono connettendo punti densi vicini; i punti isolati restano fuori (etichetta -1). Perfetto per forme complesse e per rilevare rumore, ma sensibile alla scelta di <code>eps</code>.</p>
`, more: `
<p>La differenza radicale da K-Means: DBSCAN NON assegna ogni punto a un cluster. I punti in zone a bassa densità restano "rumore" (etichetta -1), il che lo rende contemporaneamente un algoritmo di clustering E di anomaly detection. Non devi specificare il numero di cluster — emerge dalla struttura di densità dei dati. E cattura forme arbitrarie: due mezzelune intrecciate, che mandano K-Means nel panico, per DBSCAN sono due cluster ovvi perché segue la densità, non la distanza da un centro.</p>
<p>Il tallone d'Achille è la sensibilità ai due parametri, soprattutto <code>eps</code>. Troppo piccolo: quasi tutto diventa rumore (nessuna zona è "abbastanza densa"). Troppo grande: cluster distinti si fondono in uno solo. E c'è un limite strutturale: DBSCAN assume densità UNIFORME all'interno dei cluster — se hai un cluster denso e uno sparso, nessun singolo <code>eps</code> li cattura entrambi bene (HDBSCAN, una variante gerarchica, risolve proprio questo adattando la densità localmente). L'euristica classica per <code>eps</code> è il grafico delle distanze al k-esimo vicino, cercando il "gomito".</p>
<p>Come K-Means, DBSCAN usa le distanze, quindi lo <strong>scaling è essenziale</strong> — e in più soffre la maledizione della dimensionalità più di K-Means: in molte dimensioni le distanze si appiattiscono e il concetto di "vicinato denso" perde significato, per cui DBSCAN è più adatto a dati a bassa/media dimensionalità (o dopo riduzione dimensionale). Riepilogo per la scelta: K-Means se i cluster sono sferici e sai k e vuoi velocità; DBSCAN se le forme sono irregolari, non sai k, o ti servono gli outlier — su dati non troppo ad alta dimensione e ben scalati.</p>
` },

    {
      type: "exercise", id: "bo-10", kg: 20, title: "Le due mezzelune",
      task: `<p>Dati a forma di mezzaluna: K-Means fallisce, DBSCAN trionfa. Dimostralo:</p>
<ul>
<li><code>etichette_km</code>: assegnazioni di KMeans(n_clusters=2)</li>
<li><code>etichette_db</code>: assegnazioni di DBSCAN(eps=0.2, min_samples=5)</li>
<li><code>ari_km</code>, <code>ari_db</code>: Adjusted Rand Index di ciascuno rispetto alle vere etichette (misura quanto il clustering coincide con la verità)</li>
<li><code>dbscan_vince</code>: <code>True</code> se <code>ari_db &gt; ari_km</code> (DBSCAN segue la forma, K-Means la taglia a metà)</li>
</ul>`,
      setup: `from sklearn.datasets import make_moons
X, y_vero = make_moons(n_samples=300, noise=0.06, random_state=0)`,
      starter: `import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
# X: due mezzelune intrecciate | y_vero: la vera appartenenza

etichette_km = KMeans(n_clusters=2, random_state=0, n_init=10).fit_predict(X)
etichette_db = ...

ari_km = adjusted_rand_score(y_vero, etichette_km)
ari_db = ...
dbscan_vince = ...

print(f"ARI K-Means: {ari_km:.3f} | ARI DBSCAN: {ari_db:.3f} | DBSCAN vince: {dbscan_vince}")`,
      check: `import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
_km = KMeans(n_clusters=2, random_state=0, n_init=10).fit_predict(X)
_db = DBSCAN(eps=0.2, min_samples=5).fit_predict(X)
_ak = adjusted_rand_score(y_vero, _km); _ad = adjusted_rand_score(y_vero, _db)
assert 'etichette_db' in globals() and np.array_equal(np.asarray(etichette_db), _db), "etichette_db: DBSCAN(eps=0.2, min_samples=5).fit_predict(X)"
assert 'ari_db' in globals() and abs(float(ari_db) - _ad) < 1e-6, "ari_db: adjusted_rand_score(y_vero, etichette_db)"
assert 'dbscan_vince' in globals() and dbscan_vince == True and _ad > _ak, "dbscan_vince: True — DBSCAN segue le mezzelune (ARI ~1), K-Means le taglia (ARI basso)"`,
      hint: `<p><code>DBSCAN(eps=0.2, min_samples=5).fit_predict(X)</code>. L'ARI misura l'accordo col vero clustering (1 = perfetto). K-Means impone due sfere e spacca le mezzelune; DBSCAN segue la densità.</p>`,
      solution: `import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score

etichette_km = KMeans(n_clusters=2, random_state=0, n_init=10).fit_predict(X)
etichette_db = DBSCAN(eps=0.2, min_samples=5).fit_predict(X)

ari_km = adjusted_rand_score(y_vero, etichette_km)
ari_db = adjusted_rand_score(y_vero, etichette_db)
dbscan_vince = ari_db > ari_km

print(f"ARI K-Means: {ari_km:.3f} | ARI DBSCAN: {ari_db:.3f} | DBSCAN vince: {dbscan_vince}")`
    },

    {
      type: "exercise", id: "bo-11", kg: 15, title: "DBSCAN scova gli outlier",
      task: `<p>DBSCAN marca i punti isolati con l'etichetta -1. Usalo su dati con rumore sparso:</p>
<ul>
<li><code>etichette</code>: assegnazioni di <code>DBSCAN(eps=0.5, min_samples=5)</code></li>
<li><code>n_outlier</code>: quanti punti hanno etichetta -1 (gli outlier)</li>
<li><code>n_cluster</code>: quanti cluster veri (etichette diverse da -1)</li>
<li><code>trova_outlier</code>: <code>True</code> se <code>n_outlier &gt; 0</code></li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=200, centers=2, cluster_std=0.5, random_state=0)
rng = np.random.default_rng(0)
# aggiungo 15 punti di rumore sparso lontani dai blob
rumore = rng.uniform(-8, 8, size=(15, 2))
X = np.vstack([X, rumore])`,
      starter: `import numpy as np
from sklearn.cluster import DBSCAN
# X: 200 punti in 2 blob + 15 punti di rumore sparso

etichette = ...
n_outlier = ...   # quanti punti hanno etichetta -1
n_cluster = len(set(etichette) - {-1})
trova_outlier = ...

print(f"cluster trovati: {n_cluster} | outlier (rumore): {n_outlier}")`,
      check: `import numpy as np
from sklearn.cluster import DBSCAN
_e = DBSCAN(eps=0.5, min_samples=5).fit_predict(X)
_no = int((_e == -1).sum())
assert 'etichette' in globals() and np.array_equal(np.asarray(etichette), _e), "etichette: DBSCAN(eps=0.5, min_samples=5).fit_predict(X)"
assert 'n_outlier' in globals() and int(n_outlier) == _no, "n_outlier: (etichette == -1).sum()"
assert 'trova_outlier' in globals() and trova_outlier == True and _no > 0, "trova_outlier: True — i punti sparsi finiscono in nessun cluster, etichetta -1"`,
      hint: `<p>Conta gli outlier con <code>(etichette == -1).sum()</code>. L'etichetta -1 è riservata al rumore: nessun altro algoritmo di questa sala te la dà gratis.</p>`,
      solution: `import numpy as np
from sklearn.cluster import DBSCAN

etichette = DBSCAN(eps=0.5, min_samples=5).fit_predict(X)
n_outlier = int((etichette == -1).sum())
n_cluster = len(set(etichette) - {-1})
trova_outlier = n_outlier > 0

print(f"cluster trovati: {n_cluster} | outlier (rumore): {n_outlier}")`
    },

    { type: "theory", title: "Clustering gerarchico", html: `
<p>Il <strong>clustering gerarchico agglomerativo</strong> costruisce una gerarchia di cluster dal basso: parte da ogni punto come cluster a sé, poi fonde ripetutamente i due cluster più vicini, fino ad averne uno solo. Il risultato è un <em>dendrogramma</em> — un albero che mostra le fusioni a ogni livello.</p>
<pre><code>from sklearn.cluster import AgglomerativeClustering
agg = AgglomerativeClustering(n_clusters=3, linkage="ward")
etichette = agg.fit_predict(X)</code></pre>
<p>Vantaggio: non serve decidere k in anticipo per costruire l'albero — puoi "tagliarlo" a qualsiasi altezza per ottenere il numero di cluster che vuoi. Il parametro <code>linkage</code> decide come si misura la distanza tra cluster: <strong>ward</strong> (minimizza la varianza interna, il default robusto), <strong>complete</strong>, <strong>average</strong>, <strong>single</strong>.</p>
`, more: `
<p>La scelta del <strong>linkage</strong> cambia la forma dei cluster ed è concetto d'esame: <em>single</em> (distanza tra i due punti più vicini dei cluster) tende a "catene" e può catturare forme allungate, ma soffre l'effetto chaining (cluster distinti collegati da un ponte di punti); <em>complete</em> (i due più lontani) produce cluster compatti e di diametro simile; <em>average</em> è un compromesso; <em>ward</em> minimizza l'aumento di varianza a ogni fusione, tende a cluster sferici e bilanciati ed è il default più usato — ma richiede distanza euclidea. Su cluster non sferici, single o average possono battere ward.</p>
<p>Il <strong>dendrogramma</strong> è il vero valore aggiunto rispetto a K-Means: mostra la STRUTTURA delle fusioni a ogni scala, permettendo di scegliere k DOPO aver guardato i dati (tagli l'albero dove i "salti" di distanza tra fusioni consecutive sono grandi — l'analogo del gomito). Rivela anche gerarchie annidate reali (specie → generi → famiglie; documenti → sottotemi → temi) che un clustering piatto cancella. È esplorazione, non solo partizione.</p>
<p>Il costo è il limite pratico: il clustering gerarchico agglomerativo è tipicamente O(n²) o peggio in memoria e tempo, quindi non scala oltre qualche migliaio/decina di migliaia di punti — laddove K-Means gestisce milioni di righe. La scelta pragmatica: gerarchico per dataset piccoli quando vuoi esplorare la struttura a più scale e vedere il dendrogramma; K-Means per dataset grandi quando sai (circa) quanti cluster vuoi e ti serve velocità; DBSCAN quando le forme sono irregolari o ti servono gli outlier. Tre strumenti, tre situazioni.</p>
` },

    {
      type: "exercise", id: "bo-12", kg: 15, title: "Fondere dal basso",
      task: `<p>Applica il clustering gerarchico e confrontalo con K-Means sugli stessi blob:</p>
<ul>
<li><code>agg</code>: <code>AgglomerativeClustering(n_clusters=3, linkage="ward")</code></li>
<li><code>etichette_agg</code>: le assegnazioni</li>
<li><code>ari_agg</code>: Adjusted Rand Index rispetto alle vere etichette</li>
<li><code>ottimo</code>: <code>True</code> se <code>ari_agg &gt; 0.9</code> (ritrova i blob veri)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, y_vero = make_blobs(n_samples=300, centers=3, cluster_std=0.7, random_state=3)`,
      starter: `import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score
# X: 300 punti, 3 blob | y_vero: verita'

agg = ...
etichette_agg = ...
ari_agg = ...
ottimo = ...

print(f"ARI clustering gerarchico: {ari_agg:.3f} | ottimo: {ottimo}")`,
      check: `import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score
_a = AgglomerativeClustering(n_clusters=3, linkage="ward").fit_predict(X)
_ari = adjusted_rand_score(y_vero, _a)
assert 'etichette_agg' in globals() and len(np.unique(etichette_agg)) == 3, "etichette_agg: agg.fit_predict(X), 3 cluster"
assert 'ari_agg' in globals() and abs(float(ari_agg) - _ari) < 1e-6, "ari_agg: adjusted_rand_score(y_vero, etichette_agg)"
assert 'ottimo' in globals() and ottimo == True and _ari > 0.9, "ottimo: True — su blob ben separati il gerarchico li ritrova quasi perfettamente"`,
      hint: `<p><code>AgglomerativeClustering</code> non ha <code>random_state</code> (è deterministico). Usa <code>fit_predict(X)</code> e poi <code>adjusted_rand_score(y_vero, etichette_agg)</code>.</p>`,
      solution: `import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score

agg = AgglomerativeClustering(n_clusters=3, linkage="ward")
etichette_agg = agg.fit_predict(X)
ari_agg = adjusted_rand_score(y_vero, etichette_agg)
ottimo = ari_agg > 0.9

print(f"ARI clustering gerarchico: {ari_agg:.3f} | ottimo: {ottimo}")`
    },

    { type: "theory", title: "Gaussian Mixture: cluster probabilistici", html: `
<p>K-Means assegna ogni punto a UN cluster in modo netto (hard assignment). Il <strong>Gaussian Mixture Model</strong> (GMM) è più sfumato: modella i dati come una miscela di gaussiane e dà, per ogni punto, la <em>probabilità</em> di appartenere a ciascun cluster (soft assignment).</p>
<pre><code>from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=3, random_state=0)
gmm.fit(X)
etichette = gmm.predict(X)           # assegnazione netta
proba = gmm.predict_proba(X)         # probabilita' per cluster</code></pre>
<p>Vantaggi su K-Means: (1) cluster <strong>ellittici</strong> di orientamento e dimensione diversi (non solo sfere); (2) <strong>soft assignment</strong> — un punto al confine può essere "60% cluster A, 40% cluster B"; (3) è un modello probabilistico completo, da cui si può campionare e calcolare verosimiglianze.</p>
`, more: `
<p>K-Means è di fatto un CASO PARTICOLARE del GMM: se imponi che tutte le gaussiane siano sferiche, con la stessa varianza, e usi hard assignment, il GMM diventa K-Means. Il GMM generalizza rilassando queste assunzioni — <code>covariance_type</code> controlla quanto: 'spherical' (come K-Means), 'diag' (ellissi allineate agli assi), 'full' (ellissi di qualsiasi orientamento, il più flessibile ma con più parametri da stimare). Più flessibilità significa cluster più fedeli ma più rischio di overfitting e più dati necessari.</p>
<p>Il GMM si addestra con l'algoritmo <strong>EM</strong> (Expectation-Maximization), un elegante ciclo in due passi: E-step (dati i parametri delle gaussiane, calcola la probabilità di ogni punto di appartenere a ciascuna — le "responsabilità"), M-step (date le responsabilità, ri-stima media, covarianza e peso di ogni gaussiana). Si itera fino a convergenza della verosimiglianza. Come K-Means (che è EM semplificato), converge a un massimo LOCALE e dipende dall'inizializzazione — stessa cautela con <code>n_init</code>.</p>
<p>Il soft assignment è il vantaggio pratico più sfruttato: le probabilità per-cluster sono una misura di INCERTEZZA dell'assegnazione. Un punto con probabilità [0.98, 0.01, 0.01] è chiaramente nel primo cluster; uno con [0.4, 0.35, 0.25] è ambiguo, sta in una zona di sovrapposizione. Questa informazione è oro per decidere azioni graduate (un cliente "60% segmento premium" riceve un trattamento diverso da uno "99% premium") o per identificare i punti da rivedere manualmente. Per scegliere il numero di componenti, il GMM permette criteri principiati come AIC/BIC (verosimiglianza penalizzata per complessità), più solidi del gomito euristico di K-Means.</p>
` },

    {
      type: "exercise", id: "bo-13", kg: 20, title: "Assegnazioni morbide",
      task: `<p>Il GMM dà probabilità, non solo etichette. Esploralo su blob che si sovrappongono:</p>
<ul>
<li><code>gmm</code>: <code>GaussianMixture(n_components=3, random_state=0)</code> addestrato</li>
<li><code>proba</code>: le probabilità per cluster di ogni punto (<code>predict_proba</code>)</li>
<li><code>somma_proba</code>: la somma delle probabilità per il primo punto (deve essere ~1)</li>
<li><code>punto_incerto</code>: l'indice del punto con la massima probabilità più bassa (il più ambiguo, al confine tra cluster)</li>
<li><code>max_proba_incerto</code>: la probabilità massima di quel punto (dovrebbe essere lontana da 1)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=300, centers=3, cluster_std=1.8, random_state=0)`,
      starter: `import numpy as np
from sklearn.mixture import GaussianMixture
# X: 3 blob che si sovrappongono (cluster_std alto)

gmm = ...
proba = ...
somma_proba = proba[0].sum()

max_per_punto = proba.max(axis=1)   # per ogni punto, la sua probabilita' massima
punto_incerto = ...   # il punto con max_per_punto piu' BASSO
max_proba_incerto = ...

print(f"somma proba primo punto: {somma_proba:.3f}")
print(f"punto piu' incerto: indice {punto_incerto}, max proba {max_proba_incerto:.3f}")`,
      check: `import numpy as np
from sklearn.mixture import GaussianMixture
_g = GaussianMixture(n_components=3, random_state=0).fit(X)
_p = _g.predict_proba(X)
_mpp = _p.max(axis=1)
_pi = int(np.argmin(_mpp))
assert 'proba' in globals() and np.asarray(proba).shape == (300, 3), "proba: gmm.predict_proba(X), 3 probabilita' per punto"
assert 'somma_proba' in globals() and abs(float(somma_proba) - 1.0) < 1e-6, "somma_proba: le probabilita' di un punto sommano a 1"
assert 'punto_incerto' in globals() and punto_incerto == _pi, "punto_incerto: np.argmin(max_per_punto) — il punto con l'assegnazione piu' ambigua"
assert 'max_proba_incerto' in globals() and float(max_proba_incerto) < 0.9, "max_proba_incerto: il punto piu' incerto ha max proba lontana da 1 (sta al confine)"`,
      hint: `<p><code>proba.max(axis=1)</code> dà per ogni punto la sua probabilità dominante. Il più incerto ha quella dominante più bassa: <code>np.argmin(max_per_punto)</code>. Con cluster_std alto i blob si sovrappongono e nascono i punti ambigui.</p>`,
      solution: `import numpy as np
from sklearn.mixture import GaussianMixture

gmm = GaussianMixture(n_components=3, random_state=0).fit(X)
proba = gmm.predict_proba(X)
somma_proba = proba[0].sum()

max_per_punto = proba.max(axis=1)
punto_incerto = int(np.argmin(max_per_punto))
max_proba_incerto = max_per_punto[punto_incerto]

print(f"somma proba primo punto: {somma_proba:.3f}")
print(f"punto piu' incerto: indice {punto_incerto}, max proba {max_proba_incerto:.3f}")`
    },

    {
      type: "exercise", id: "bo-14", kg: 20, title: "AIC/BIC scelgono le componenti",
      task: `<p>Il GMM permette di scegliere il numero di componenti con criteri principiati (BIC: più basso è meglio). Usalo:</p>
<ul>
<li><code>bic_per_k</code>: dizionario k &rarr; BIC, per k da 1 a 5</li>
<li><code>k_migliore</code>: il k con BIC minimo</li>
<li><code>trova_3</code>: <code>True</code> se <code>k_migliore == 3</code> (le componenti vere)</li>
</ul>`,
      setup: `from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=500, centers=3, cluster_std=0.5, random_state=3)`,
      starter: `import numpy as np
from sklearn.mixture import GaussianMixture
# X: 400 punti, 3 gaussiane vere

bic_per_k = {}
for k in range(1, 6):
    gmm = GaussianMixture(n_components=k, random_state=0).fit(X)
    bic_per_k[k] = ...   # il BIC del modello

k_migliore = ...
trova_3 = ...

print("BIC per k:", {k: round(v) for k, v in bic_per_k.items()})
print("k migliore (BIC minimo):", k_migliore)`,
      check: `import numpy as np
from sklearn.mixture import GaussianMixture
_b = {}
for k in range(1,6):
    _b[k] = GaussianMixture(n_components=k, random_state=0).fit(X).bic(X)
_best = min(_b, key=_b.get)
assert 'bic_per_k' in globals() and all(abs(bic_per_k[k] - _b[k]) < 1.0 for k in range(1,6)), "bic_per_k[k]: gmm.bic(X)"
assert 'k_migliore' in globals() and k_migliore == _best, "k_migliore: min(bic_per_k, key=bic_per_k.get)"
assert 'trova_3' in globals() and trova_3 == True and _best == 3, "trova_3: True — il BIC e' minimo a k=3, le gaussiane vere"`,
      hint: `<p>Il BIC di un GMM addestrato: <code>gmm.bic(X)</code>. Il migliore è il MINIMO (il BIC penalizza la complessità): <code>min(bic_per_k, key=bic_per_k.get)</code>. Più principiato del gomito di K-Means.</p>`,
      solution: `import numpy as np
from sklearn.mixture import GaussianMixture

bic_per_k = {}
for k in range(1, 6):
    gmm = GaussianMixture(n_components=k, random_state=0).fit(X)
    bic_per_k[k] = gmm.bic(X)

k_migliore = min(bic_per_k, key=bic_per_k.get)
trova_3 = k_migliore == 3

print("BIC per k:", {k: round(v) for k, v in bic_per_k.items()})
print("k migliore (BIC minimo):", k_migliore)`
    },

    { type: "theory", title: "Anomaly detection: trovare l'ago nel pagliaio", html: `
<p>L'<strong>anomaly detection</strong> cerca i pochi casi che deviano dalla norma: frodi, guasti, intrusioni, difetti. È diversa dalla classificazione perché le anomalie sono rare, spesso non etichettate, e di tipi imprevedibili. Due approcci in scikit-learn:</p>
<pre><code>from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
# Isolation Forest: isola i punti con partizioni casuali
iso = IsolationForest(contamination=0.05, random_state=0)
anomalie = iso.fit_predict(X)   # -1 = anomalia, 1 = normale</code></pre>
<p>L'<strong>Isolation Forest</strong> parte da un'intuizione brillante: le anomalie sono <em>facili da isolare</em>. Se costruisci alberi che partizionano casualmente lo spazio, un punto anomalo (isolato, lontano) finisce separato in pochi tagli; un punto normale (in mezzo alla folla) richiede molti tagli. Meno tagli per isolarlo = più anomalo.</p>
`, more: `
<p>L'eleganza dell'Isolation Forest è che cerca le anomalie DIRETTAMENTE invece di modellare prima la normalità e poi misurare le deviazioni. Costruisce tanti alberi con split su feature e soglie casuali; per ogni punto misura la profondità media a cui viene isolato attraverso gli alberi. Anomalie = profondità piccola (isolate presto). È efficiente (lineare), scala bene ad alta dimensione (a differenza dei metodi basati su distanza), e non assume alcuna forma per la distribuzione normale. Il parametro <code>contamination</code> dichiara la frazione attesa di anomalie e fissa la soglia — sceglierlo richiede conoscenza del dominio o va tarato.</p>
<p>Il <strong>Local Outlier Factor</strong> (LOF) attacca il problema in modo complementare: confronta la densità locale di un punto con quella dei suoi vicini. Un punto è anomalo se sta in una zona molto meno densa rispetto a dove stanno i suoi vicini — cattura le anomalie LOCALI (un punto normale in assoluto ma anomalo per il suo quartiere) che l'Isolation Forest, più globale, può mancare. Il rovescio: LOF è basato su distanza (scaling essenziale, soffre l'alta dimensionalità) e di default è transduttivo (non ha un <code>predict</code> per nuovi punti, va usato con <code>novelty=True</code> per quello).</p>
<p>La distinzione cruciale da chiarire ai colloqui: <strong>outlier detection</strong> (il training set contiene già anomalie, vuoi trovarle lì dentro — non supervisionato) vs <strong>novelty detection</strong> (addestri sul solo "normale" pulito, poi segnali i nuovi punti che deviano — semi-supervisionato). Sono scenari diversi con API diverse. E rispetto alla classificazione supervisionata: l'anomaly detection si usa proprio quando NON hai abbastanza esempi etichettati di anomalie (sono rare, o di tipi mai visti prima). Se hai molti esempi di entrambe le classi, un classificatore (magari con class_weight per lo sbilanciamento) spesso batte l'anomaly detection — che brilla invece quando le anomalie sono pochissime, non etichettate, o imprevedibili.</p>
` },

    {
      type: "exercise", id: "bo-15", kg: 20, title: "Isolation Forest caccia le frodi",
      task: `<p>Dati normali + poche anomalie sparse. L'Isolation Forest le isola:</p>
<ul>
<li><code>iso</code>: <code>IsolationForest(contamination=0.08, random_state=0)</code></li>
<li><code>pred</code>: le predizioni (<code>fit_predict</code>): -1 anomalia, 1 normale</li>
<li><code>n_anomalie</code>: quante anomalie trovate (pred == -1)</li>
<li><code>recall_anomalie</code>: dei 20 veri outlier (gli ultimi 20 punti), quanti sono stati beccati come -1</li>
<li><code>buona_caccia</code>: <code>True</code> se recall_anomalie &gt; 0.5</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
normali = rng.normal(0, 1, size=(230, 2))
anomalie_vere = rng.uniform(-6, 6, size=(20, 2))   # 20 outlier sparsi
X = np.vstack([normali, anomalie_vere])
# i veri outlier sono gli ultimi 20 (indici 230..249)`,
      starter: `import numpy as np
from sklearn.ensemble import IsolationForest
# X: 230 punti normali + 20 anomalie (gli ultimi 20)

iso = ...
pred = ...
n_anomalie = ...

# dei veri outlier (ultimi 20), quanti beccati come -1?
pred_veri_outlier = pred[-20:]
recall_anomalie = (pred_veri_outlier == -1).mean()
buona_caccia = ...

print(f"anomalie segnalate: {n_anomalie} | recall sui veri outlier: {recall_anomalie:.2f}")`,
      check: `import numpy as np
from sklearn.ensemble import IsolationForest
_iso = IsolationForest(contamination=0.08, random_state=0)
_pred = _iso.fit_predict(X)
_rec = (_pred[-20:] == -1).mean()
assert 'pred' in globals() and np.array_equal(np.asarray(pred), _pred), "pred: iso.fit_predict(X)"
assert 'n_anomalie' in globals() and int(n_anomalie) == int((_pred == -1).sum()), "n_anomalie: (pred == -1).sum()"
assert 'recall_anomalie' in globals() and abs(float(recall_anomalie) - _rec) < 1e-6, "recall_anomalie: (pred[-20:] == -1).mean()"
assert 'buona_caccia' in globals() and buona_caccia == True and _rec > 0.5, "buona_caccia: True — l'Isolation Forest becca la maggioranza dei veri outlier sparsi"`,
      hint: `<p><code>iso.fit_predict(X)</code> dà -1/1. Conta le anomalie con <code>(pred == -1).sum()</code>. Il recall sui veri outlier (gli ultimi 20): <code>(pred[-20:] == -1).mean()</code>.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import IsolationForest

iso = IsolationForest(contamination=0.08, random_state=0)
pred = iso.fit_predict(X)
n_anomalie = int((pred == -1).sum())

pred_veri_outlier = pred[-20:]
recall_anomalie = (pred_veri_outlier == -1).mean()
buona_caccia = recall_anomalie > 0.5

print(f"anomalie segnalate: {n_anomalie} | recall sui veri outlier: {recall_anomalie:.2f}")`
    },

    {
      type: "exercise", id: "bo-16", kg: 20, title: "Local Outlier Factor: l'anomalia di quartiere",
      task: `<p>Il LOF trova anomalie LOCALI: punti in zone meno dense dei loro vicini. Applicalo:</p>
<ul>
<li><code>lof</code>: <code>LocalOutlierFactor(n_neighbors=20, contamination=0.08)</code></li>
<li><code>pred</code>: le predizioni (<code>fit_predict</code>): -1 anomalia, 1 normale</li>
<li><code>n_anomalie</code>: quante anomalie</li>
<li><code>recall_anomalie</code>: dei 20 veri outlier (ultimi 20), quanti beccati</li>
<li><code>funziona</code>: <code>True</code> se recall_anomalie &gt; 0.5</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
normali = rng.normal(0, 1, size=(230, 2))
anomalie_vere = rng.uniform(-6, 6, size=(20, 2))
X = np.vstack([normali, anomalie_vere])`,
      starter: `import numpy as np
from sklearn.neighbors import LocalOutlierFactor
# X: 230 normali + 20 anomalie (ultimi 20). LOF: nota, non ha random_state

lof = ...
pred = ...
n_anomalie = (pred == -1).sum()
recall_anomalie = (pred[-20:] == -1).mean()
funziona = ...

print(f"anomalie segnalate: {n_anomalie} | recall sui veri outlier: {recall_anomalie:.2f}")`,
      check: `import numpy as np
from sklearn.neighbors import LocalOutlierFactor
_lof = LocalOutlierFactor(n_neighbors=20, contamination=0.08)
_pred = _lof.fit_predict(X)
_rec = (_pred[-20:] == -1).mean()
assert 'pred' in globals() and np.array_equal(np.asarray(pred), _pred), "pred: lof.fit_predict(X)"
assert 'n_anomalie' in globals() and int(n_anomalie) == int((_pred==-1).sum()), "n_anomalie: (pred == -1).sum()"
assert 'recall_anomalie' in globals() and abs(float(recall_anomalie) - _rec) < 1e-6, "recall_anomalie: (pred[-20:] == -1).mean()"
assert 'funziona' in globals() and funziona == True and _rec > 0.5, "funziona: True — il LOF becca la maggioranza degli outlier basandosi sulla densita' locale"`,
      hint: `<p><code>LocalOutlierFactor</code> non ha <code>random_state</code>. Usa <code>fit_predict(X)</code> (di default è per outlier detection sul training set). Stessa lettura -1/1 dell'Isolation Forest.</p>`,
      solution: `import numpy as np
from sklearn.neighbors import LocalOutlierFactor

lof = LocalOutlierFactor(n_neighbors=20, contamination=0.08)
pred = lof.fit_predict(X)
n_anomalie = (pred == -1).sum()
recall_anomalie = (pred[-20:] == -1).mean()
funziona = recall_anomalie > 0.5

print(f"anomalie segnalate: {n_anomalie} | recall sui veri outlier: {recall_anomalie:.2f}")`
    },

    { type: "theory", title: "Stacking e voting: unire modelli diversi", html: `
<p>Oltre a bagging e boosting (che combinano copie dello stesso tipo di modello), si possono combinare modelli <em>diversi</em>. Due tecniche:</p>
<pre><code>from sklearn.ensemble import VotingClassifier, StackingClassifier
# Voting: media (o voto di maggioranza) delle predizioni
vot = VotingClassifier([("lr", LogisticRegression()),
                        ("rf", RandomForestClassifier()),
                        ("gb", GradientBoostingClassifier())], voting="soft")
# Stacking: un meta-modello impara a combinare le predizioni dei base
stk = StackingClassifier([("rf", ...), ("gb", ...)],
                         final_estimator=LogisticRegression())</code></pre>
<p><strong>Voting</strong>: combina per media (soft, sulle probabilità) o maggioranza (hard). Semplice ed efficace se i modelli sono diversi e commettono errori scorrelati. <strong>Stacking</strong>: un meta-modello impara <em>come pesare</em> i modelli base — più potente, più costoso, più a rischio overfitting.</p>
`, more: `
<p>Il principio che fa funzionare gli ensemble eterogenei è la <strong>diversità degli errori</strong>: combinare modelli che sbagliano sugli STESSI casi non aiuta (mediare tre modelli identici dà il modello di partenza). Il guadagno arriva quando i modelli sbagliano su casi DIVERSI — un modello lineare, un albero e un boosting hanno bias diversi e catturano aspetti diversi dei dati, quindi i loro errori si compensano parzialmente nella media. Massimizzare la diversità (modelli di famiglie diverse, feature diverse, iperparametri diversi) conta più che avere modelli base individualmente ottimi.</p>
<p>Il <strong>voting soft</strong> (media delle probabilità) di solito batte l'<strong>hard</strong> (voto di maggioranza) perché usa l'informazione di confidenza: un modello sicuro al 95% e uno incerto al 51% nella media pesano diversamente, mentre nel voto di maggioranza contano uguale. Ma il soft richiede che le probabilità siano ben calibrate (sala Model Evaluation) — combinare probabilità mal calibrate può fare più male che bene. Il voting è la scelta pragmatica: nessun addestramento aggiuntivo, robusto, spesso il grosso del guadagno dell'ensembling.</p>
<p>Lo <strong>stacking</strong> è più potente ma insidioso: il meta-modello impara a pesare i base learner, ma se lo addestri sulle predizioni che i base fanno sul PROPRIO training set, quelle predizioni sono ottimisticamente buone (i base hanno visto quei dati) e il meta impara pesi sbagliati — leakage. La soluzione, che <code>StackingClassifier</code> implementa di default, è generare le predizioni per il meta con cross-validation (out-of-fold): ogni base predice su fold che non ha visto in training. È lo stesso principio del target encoding out-of-fold della sala Feature Engineering. Lo stacking ben fatto vince spesso le competizioni, ma il rapporto guadagno/complessità in produzione è spesso a favore di un singolo boosting ben tarato o di un voting semplice.</p>
` },

    {
      type: "exercise", id: "bo-17", kg: 20, title: "L'unione fa la forza",
      task: `<p>Combina tre modelli diversi con un VotingClassifier soft e verifica se batte i singoli:</p>
<ul>
<li><code>voting</code>: <code>VotingClassifier</code> soft con LogisticRegression, RandomForest, GradientBoosting (nomi "lr","rf","gb", tutti con random_state dove serve)</li>
<li><code>acc_voting</code>: accuratezza CV del voting</li>
<li><code>acc_lr</code>, <code>acc_rf</code>, <code>acc_gb</code>: accuratezze CV dei tre singoli</li>
<li><code>voting_competitivo</code>: <code>True</code> se il voting è &ge; della media dei tre singoli</li>
</ul>`,
      setup: `from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)`,
      starter: `import numpy as np
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
# X, y: breast cancer

lr = LogisticRegression(max_iter=5000)
rf = RandomForestClassifier(random_state=0)
gb = GradientBoostingClassifier(random_state=0)

voting = VotingClassifier([("lr", lr), ("rf", rf), ("gb", gb)], voting="soft")

acc_voting = cross_val_score(voting, X, y, cv=5).mean()
acc_lr = cross_val_score(lr, X, y, cv=5).mean()
acc_rf = ...
acc_gb = ...
voting_competitivo = ...

print(f"voting: {acc_voting:.3f} | lr {acc_lr:.3f} rf {acc_rf:.3f} gb {acc_gb:.3f}")`,
      check: `import numpy as np
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
_lr = LogisticRegression(max_iter=5000); _rf = RandomForestClassifier(random_state=0); _gb = GradientBoostingClassifier(random_state=0)
_v = VotingClassifier([("lr",_lr),("rf",_rf),("gb",_gb)], voting="soft")
_av = cross_val_score(_v, X, y, cv=5).mean()
_arf = cross_val_score(_rf, X, y, cv=5).mean(); _agb = cross_val_score(_gb, X, y, cv=5).mean(); _alr = cross_val_score(_lr, X, y, cv=5).mean()
assert 'acc_voting' in globals() and abs(float(acc_voting) - _av) < 0.02, "acc_voting: cross_val_score(voting, X, y, cv=5).mean()"
assert 'acc_rf' in globals() and abs(float(acc_rf) - _arf) < 0.02, "acc_rf: CV della RandomForest"
assert 'acc_gb' in globals() and abs(float(acc_gb) - _agb) < 0.02, "acc_gb: CV del GradientBoosting"
assert 'voting_competitivo' in globals() and voting_competitivo == bool(_av >= (_alr+_arf+_agb)/3), "voting_competitivo: acc_voting >= media dei tre singoli"`,
      hint: `<p>Il voting è già costruito: calcola solo le CV mancanti (<code>acc_rf</code>, <code>acc_gb</code>) e confronta: <code>voting_competitivo = acc_voting &gt;= (acc_lr+acc_rf+acc_gb)/3</code>. Il soft media le probabilità dei tre.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

lr = LogisticRegression(max_iter=5000)
rf = RandomForestClassifier(random_state=0)
gb = GradientBoostingClassifier(random_state=0)

voting = VotingClassifier([("lr", lr), ("rf", rf), ("gb", gb)], voting="soft")

acc_voting = cross_val_score(voting, X, y, cv=5).mean()
acc_lr = cross_val_score(lr, X, y, cv=5).mean()
acc_rf = cross_val_score(rf, X, y, cv=5).mean()
acc_gb = cross_val_score(gb, X, y, cv=5).mean()
voting_competitivo = acc_voting >= (acc_lr + acc_rf + acc_gb) / 3

print(f"voting: {acc_voting:.3f} | lr {acc_lr:.3f} rf {acc_rf:.3f} gb {acc_gb:.3f}")`
    },

    {
      type: "exercise", id: "bo-18", kg: 20, title: "Nearest Neighbors per le anomalie",
      task: `<p>Un approccio semplice all'anomaly detection: la distanza dal k-esimo vicino. I punti lontani da tutti sono anomali. Costruiscilo:</p>
<ul>
<li><code>nn</code>: <code>NearestNeighbors(n_neighbors=6)</code> addestrato su X</li>
<li><code>distanze</code>: le distanze ai 6 vicini (da <code>kneighbors</code>)</li>
<li><code>score_anomalia</code>: per ogni punto, la distanza media ai suoi vicini (esclude sé stesso: colonne 1:)</li>
<li><code>soglia</code>: il 92° percentile degli score (l'8% più lontano = anomalo)</li>
<li><code>anomalie_idx</code>: gli indici dei punti sopra soglia</li>
<li><code>trova_gli_outlier</code>: <code>True</code> se la maggioranza dei veri outlier (ultimi 20) è tra le anomalie</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(2)
normali = rng.normal(0, 1, size=(230, 2))
anomalie_vere = rng.uniform(-6, 6, size=(20, 2))
X = np.vstack([normali, anomalie_vere])`,
      starter: `import numpy as np
from sklearn.neighbors import NearestNeighbors
# X: 230 normali + 20 outlier (ultimi 20)

nn = NearestNeighbors(n_neighbors=6).fit(X)
distanze, indici = nn.kneighbors(X)

# la prima colonna e' il punto stesso (distanza 0): media dalle colonne 1 in poi
score_anomalia = ...
soglia = np.percentile(score_anomalia, 92)
anomalie_idx = np.where(score_anomalia > soglia)[0]

veri_outlier = set(range(230, 250))
beccati = len(set(anomalie_idx) & veri_outlier)
trova_gli_outlier = ...

print(f"anomalie trovate: {len(anomalie_idx)} | veri outlier beccati: {beccati}/20")`,
      check: `import numpy as np
from sklearn.neighbors import NearestNeighbors
_nn = NearestNeighbors(n_neighbors=6).fit(X)
_d, _i = _nn.kneighbors(X)
_sa = _d[:, 1:].mean(axis=1)
_soglia = np.percentile(_sa, 92)
_ai = np.where(_sa > _soglia)[0]
_beccati = len(set(_ai) & set(range(230,250)))
assert 'score_anomalia' in globals() and np.allclose(score_anomalia, _sa), "score_anomalia: distanze[:, 1:].mean(axis=1) — escludi la colonna 0 (se stesso)"
assert 'anomalie_idx' in globals() and np.array_equal(np.sort(anomalie_idx), np.sort(_ai)), "anomalie_idx: np.where(score_anomalia > soglia)[0]"
assert 'trova_gli_outlier' in globals() and trova_gli_outlier == True and _beccati > 10, "trova_gli_outlier: True — la maggioranza dei 20 veri outlier ha distanza media alta"`,
      hint: `<p>La colonna 0 di <code>distanze</code> è il punto con sé stesso (distanza 0): escludila con <code>distanze[:, 1:].mean(axis=1)</code>. I veri outlier, lontani da tutti, hanno score alto. <code>trova_gli_outlier = beccati &gt; 10</code>.</p>`,
      solution: `import numpy as np
from sklearn.neighbors import NearestNeighbors

nn = NearestNeighbors(n_neighbors=6).fit(X)
distanze, indici = nn.kneighbors(X)

score_anomalia = distanze[:, 1:].mean(axis=1)
soglia = np.percentile(score_anomalia, 92)
anomalie_idx = np.where(score_anomalia > soglia)[0]

veri_outlier = set(range(230, 250))
beccati = len(set(anomalie_idx) & veri_outlier)
trova_gli_outlier = beccati > 10

print(f"anomalie trovate: {len(anomalie_idx)} | veri outlier beccati: {beccati}/20")`
    },

    {
      type: "exercise", id: "bo-19", kg: 20, title: "Boosting vs Foresta sul difficile",
      task: `<p>Su un problema con interazioni complesse, il boosting ben tarato spesso supera la foresta. Verificalo con la CV:</p>
<ul>
<li><code>acc_rf</code>: CV di RandomForest(n_estimators=100)</li>
<li><code>acc_hgb</code>: CV di HistGradientBoosting (con early stopping di default)</li>
<li><code>boosting_almeno_pari</code>: <code>True</code> se <code>acc_hgb &gt;= acc_rf - 0.02</code> (competitivo o superiore)</li>
</ul>`,
      setup: `from sklearn.datasets import make_classification
X, y = make_classification(n_samples=2000, n_features=25, n_informative=12,
                            n_redundant=5, class_sep=0.8, random_state=0)`,
      starter: `from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
# X, y: 2000 campioni, problema con interazioni

acc_rf = cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean()
acc_hgb = ...
boosting_almeno_pari = ...

print(f"Random Forest: {acc_rf:.3f} | HistGradientBoosting: {acc_hgb:.3f}")`,
      check: `from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
_hgb = cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=5).mean()
assert 'acc_hgb' in globals() and abs(float(acc_hgb) - _hgb) < 0.02, "acc_hgb: cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=5).mean()"
assert 'boosting_almeno_pari' in globals() and boosting_almeno_pari == True, "boosting_almeno_pari: True — l'HistGradientBoosting e' competitivo o superiore alla RF"`,
      hint: `<p><code>HistGradientBoostingClassifier(random_state=0)</code> con i default (early stopping incluso). <code>boosting_almeno_pari = acc_hgb &gt;= acc_rf - 0.02</code>.</p>`,
      solution: `from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score

acc_rf = cross_val_score(RandomForestClassifier(n_estimators=100, random_state=0), X, y, cv=5).mean()
acc_hgb = cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=5).mean()
boosting_almeno_pari = acc_hgb >= acc_rf - 0.02

print(f"Random Forest: {acc_rf:.3f} | HistGradientBoosting: {acc_hgb:.3f}")`
    },

    {
      type: "exercise", id: "bo-20", kg: 15, title: "Quiz: quale modello per quale problema",
      task: `<p>Cinque situazioni, cinque scelte. Rispondi con la stringa indicata:</p>
<ul>
<li><code>s1</code>: massima accuratezza su dati tabulari da competizione &rarr; "boosting" o "kmeans"?</li>
<li><code>s2</code>: segmentare clienti senza etichette, cluster sferici &rarr; "kmeans" o "isolation_forest"?</li>
<li><code>s3</code>: cluster a forma di spirale/mezzaluna &rarr; "dbscan" o "kmeans"?</li>
<li><code>s4</code>: trovare poche frodi rare non etichettate &rarr; "isolation_forest" o "gradient_boosting"?</li>
<li><code>s5</code>: servono probabilità di appartenenza morbide ai cluster &rarr; "gmm" o "dbscan"?</li>
</ul>`,
      starter: `s1 = ...
s2 = ...
s3 = ...
s4 = ...
s5 = ...

print(s1, s2, s3, s4, s5)`,
      check: `assert s1 == "boosting", "s1: dati tabulari + massima accuratezza -> boosting (domina Kaggle)"
assert s2 == "kmeans", "s2: cluster sferici senza etichette -> K-Means"
assert s3 == "dbscan", "s3: forme irregolari -> DBSCAN (segue la densita', K-Means impone sfere)"
assert s4 == "isolation_forest", "s4: anomalie rare non etichettate -> Isolation Forest (anomaly detection)"
assert s5 == "gmm", "s5: assegnazioni morbide probabilistiche -> Gaussian Mixture (soft assignment)"`,
      hint: `<p>Ripassa le lavagne: boosting per l'accuratezza tabulare, K-Means per cluster sferici, DBSCAN per forme strane, Isolation Forest per anomalie, GMM per il soft assignment.</p>`,
      solution: `s1 = "boosting"
s2 = "kmeans"
s3 = "dbscan"
s4 = "isolation_forest"
s5 = "gmm"

print(s1, s2, s3, s4, s5)`
    },

    {
      type: "exercise", id: "bo-21", kg: 25, title: "MASSIMALE: la pipeline del data scientist",
      task: `<p>Il gran finale della sala: un flusso completo su un problema realistico. Boosting tarato, valutato onestamente, con anomaly detection sui dati.</p>
<ul>
<li><code>iso</code>: <code>IsolationForest(contamination=0.05, random_state=0)</code> per marcare gli outlier in <code>X_train</code></li>
<li><code>mask_puliti</code>: array booleano dei punti NON anomali nel train (pred == 1)</li>
<li><code>X_pulito</code>, <code>y_pulito</code>: il train senza gli outlier</li>
<li><code>acc_sporco</code>: CV accuracy di un HistGradientBoosting sul train COMPLETO</li>
<li><code>acc_pulito</code>: CV accuracy sullo stesso modello ma sul train ripulito dagli outlier</li>
<li><code>n_rimossi</code>: quanti punti rimossi</li>
<li><code>completato</code>: <code>True</code> se n_rimossi &gt; 0 e acc_pulito &gt; 0.7 (il flusso gira)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=1500, n_features=15, n_informative=8,
                            class_sep=0.9, random_state=1)
rng = np.random.default_rng(1)
# inietto rumore in alcune righe del train (outlier artificiali)
idx_rumore = rng.choice(len(X), size=60, replace=False)
X[idx_rumore] += rng.normal(0, 8, size=(60, 15))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `import numpy as np
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
# X_train/test, y_train/test: gia' pronti (il train contiene outlier)

iso = ...
pred_iso = iso.fit_predict(X_train)
mask_puliti = ...   # True dove pred_iso == 1
X_pulito = X_train[mask_puliti]
y_pulito = y_train[mask_puliti]
n_rimossi = ...

acc_sporco = cross_val_score(HistGradientBoostingClassifier(random_state=0), X_train, y_train, cv=5).mean()
acc_pulito = ...
completato = ...

print(f"rimossi {n_rimossi} outlier | CV sporco {acc_sporco:.3f} -> pulito {acc_pulito:.3f}")`,
      check: `import numpy as np
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
_iso = IsolationForest(contamination=0.05, random_state=0)
_p = _iso.fit_predict(X_train)
_mask = _p == 1
_xp, _yp = X_train[_mask], y_train[_mask]
_ap = cross_val_score(HistGradientBoostingClassifier(random_state=0), _xp, _yp, cv=5).mean()
assert 'mask_puliti' in globals() and np.array_equal(np.asarray(mask_puliti), _mask), "mask_puliti: pred_iso == 1"
assert 'n_rimossi' in globals() and int(n_rimossi) == int((~_mask).sum()), "n_rimossi: (~mask_puliti).sum() oppure (pred_iso == -1).sum()"
assert 'acc_pulito' in globals() and abs(float(acc_pulito) - _ap) < 0.03, "acc_pulito: CV sul train ripulito"
assert 'completato' in globals() and completato == True, "completato: True — flusso completo (anomaly detection + boosting valutato in CV)"`,
      hint: `<p><code>mask_puliti = pred_iso == 1</code> (1 = normale). <code>n_rimossi = (~mask_puliti).sum()</code>. Poi <code>cross_val_score</code> sul train ripulito. Il flusso: individua outlier &rarr; ripulisci &rarr; addestra &rarr; valuta onestamente.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score

iso = IsolationForest(contamination=0.05, random_state=0)
pred_iso = iso.fit_predict(X_train)
mask_puliti = pred_iso == 1
X_pulito = X_train[mask_puliti]
y_pulito = y_train[mask_puliti]
n_rimossi = int((~mask_puliti).sum())

acc_sporco = cross_val_score(HistGradientBoostingClassifier(random_state=0), X_train, y_train, cv=5).mean()
acc_pulito = cross_val_score(HistGradientBoostingClassifier(random_state=0), X_pulito, y_pulito, cv=5).mean()
completato = n_rimossi > 0 and acc_pulito > 0.7

print(f"rimossi {n_rimossi} outlier | CV sporco {acc_sporco:.3f} -> pulito {acc_pulito:.3f}")`
    }

  ]
});
