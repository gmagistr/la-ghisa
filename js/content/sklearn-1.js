window.MODULES.push({
  id: "sklearn-1",
  name: "Scikit-learn · Base",
  tagline: "La sala macchine: fit, predict, metriche. I primi modelli veri, con il bilancino della valutazione onesta.",
  intro: "Machine learning con scikit-learn: modelli che imparano dai dati. La prima volta il caricamento è pesante (scikit-learn è grosso) — come sempre in palestra, il ferro pesa. Poi si vola.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Il rito di scikit-learn: fit e predict", html: `
<p>Tutti i modelli di scikit-learn parlano la stessa lingua, e impararla una volta vale per sempre:</p>
<pre><code>from sklearn.linear_model import LinearRegression
model = LinearRegression()   # 1. crea il modello
model.fit(X, y)              # 2. impara dai dati
model.predict(X_nuovi)       # 3. prevedi su dati nuovi</code></pre>
<p>Le convenzioni sacre: <code>X</code> è la matrice delle <strong>feature</strong> (2D: righe = osservazioni, colonne = variabili — <em>sempre 2D, anche con una sola colonna!</em>), <code>y</code> è il vettore del <strong>target</strong> (1D). Una regressione lineare impara i coefficienti della retta: <code>model.coef_</code> e <code>model.intercept_</code> (il trattino basso finale = "imparato dal fit").</p>
`, more: `
<p>L'errore da principiante più comune con scikit-learn è passare <code>X</code> come array 1D (es. <code>np.array([5, 10, 15])</code>) invece che 2D: il modello solleva <code>ValueError: Expected 2D array, got 1D array instead</code>. La cura standard è <code>.reshape(-1, 1)</code>, che trasforma un vettore di N elementi in una matrice N×1 — il <code>-1</code> dice "calcola tu quante righe servono", l'<code>1</code> fissa una sola colonna.</p>
<p>Il trattino basso finale (<code>coef_</code>, <code>intercept_</code>, e in generale ogni attributo che finisce con <code>_</code>) è una convenzione precisa di scikit-learn: indica un attributo che esiste SOLO dopo <code>.fit()</code>. Prima del fit, un modello appena creato non ha <code>coef_</code> — è un modo per la libreria di distinguere "parametri che tu hai scelto alla creazione" (es. <code>n_neighbors</code>) da "parametri che il modello ha imparato dai dati".</p>
<p>Il rito fit/predict è identico per QUALSIASI modello di scikit-learn, dalla regressione lineare più semplice alle reti neurali di <code>MLPClassifier</code> (che vedrai nella sala Deep Learning): questa uniformità è probabilmente il motivo principale del successo della libreria — una volta imparato il pattern, cambiare modello è questione di cambiare una riga di import, non di riscrivere la logica.</p>
` },

    {
      type: "exercise", id: "sk-01", kg: 10, title: "La prima alzata",
      task: `<p>I dati <code>X</code> (ore di studio, colonna singola) e <code>y</code> (voto all'esame) sono pronti e seguono quasi perfettamente una retta. Fai:</p>
<ul>
<li><code>model</code>: una <code>LinearRegression</code> addestrata su X e y</li>
<li><code>pendenza</code>: il primo (e unico) coefficiente, come float (è <code>model.coef_[0]</code>)</li>
<li><code>previsione</code>: il voto previsto per 25 ore di studio (occhio: <code>predict</code> vuole una matrice 2D: <code>[[25]]</code>), come float</li>
</ul>`,
      setup: `import numpy as np
X = np.array([[5], [10], [15], [20], [30], [40]])
y = np.array([19.5, 21.0, 22.4, 24.1, 27.0, 30.0])`,
      starter: `from sklearn.linear_model import LinearRegression
# X (ore di studio) e y (voto) sono gia' pronti

model = ...
# addestra!

pendenza = ...
previsione = ...

print(pendenza, previsione)`,
      check: `import numpy as np
assert 'model' in globals() and hasattr(model, "coef_"), "model deve essere una LinearRegression gia' addestrata con .fit(X, y)"
assert 'pendenza' in globals() and 0.25 < float(pendenza) < 0.35, "pendenza: model.coef_[0] — circa 0.3 voti per ora di studio"
assert 'previsione' in globals() and 24.5 < float(previsione) < 26.5, "previsione: model.predict([[25]]) — deve venire circa 25.5"`,
      hint: `<p>Tre righe: <code>model = LinearRegression()</code>, <code>model.fit(X, y)</code>, poi <code>float(model.predict([[25]])[0])</code> — predict restituisce un array, prendi il primo elemento.</p>`,
      solution: `from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X, y)

pendenza = float(model.coef_[0])
previsione = float(model.predict([[25]])[0])

print(pendenza, previsione)`
    },

    { type: "theory", title: "Train/test split: l'esame va fatto su domande nuove", html: `
<p>Valutare un modello sugli stessi dati su cui ha imparato è come giudicare uno studente sulle domande che ha già visto: voto gonfiato, sempre. La regola d'oro del machine learning: <strong>si valuta su dati mai visti</strong>.</p>
<pre><code>from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42)
model.fit(X_train, y_train)      # impara SOLO dal train
score = model.score(X_test, y_test)   # esame sul test</code></pre>
<p><code>random_state</code> fissa il caso (come i semi di NumPy): stessi split, risultati riproducibili. <code>test_size=0.25</code> tiene da parte il 25% per l'esame. Da qui in avanti, ogni valutazione senza split è squalificata.</p>
`, more: `
<p>Il parametro <code>stratify=y</code> (visto negli esercizi di classificazione) merita una spiegazione: senza di esso, uno split casuale su un dataset con classi sbilanciate (es. 90% classe A, 10% classe B) potrebbe per sfortuna finire con pochissimi o zero esempi della classe minoritaria nel test set, rendendo la valutazione inaffidabile. <code>stratify=y</code> impone che la proporzione tra le classi nel train e nel test rispecchi quella del dataset originale — una precauzione quasi sempre corretta in classificazione.</p>
<p>Un solo split è una fotografia, non un film: la performance stimata dipende in parte da QUALE 25% è finito per caso nel test. La <strong>cross-validation</strong> (che vedrai nella sala Scikit-learn Avanzato) risolve questo ripetendo lo split più volte in modo sistematico e mediando i risultati — più robusta di un singolo <code>train_test_split</code>, ma anche più costosa computazionalmente.</p>
<p>Una regola che vale per SEMPRE, non solo per il primo split: qualsiasi trasformazione che "impara" qualcosa dai dati (uno <code>StandardScaler</code>, un'imputazione con la media, una selezione di feature) va addestrata SOLO sul train e poi applicata anche al test — mai il contrario. Fare la standardizzazione prima dello split "fa trapelare" informazione dal test al train (un fenomeno chiamato <em>data leakage</em>), gonfiando artificialmente il punteggio finale.</p>
` },

    {
      type: "exercise", id: "sk-02", kg: 10, title: "Dividi il carico",
      task: `<p>Dataset sintetico <code>X, y</code> (80 osservazioni) già pronto. Fai:</p>
<ul>
<li>Split con <code>test_size=0.25</code> e <code>random_state=0</code> nei quattro pezzi canonici</li>
<li><code>n_train</code>, <code>n_test</code>: quante osservazioni in ciascuno</li>
<li><code>model</code>: LinearRegression addestrata <strong>solo sul train</strong></li>
<li><code>r2_test</code>: <code>model.score(X_test, y_test)</code>, come float</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(3)
X = rng.uniform(0, 10, size=(80, 2))
y = 3 * X[:, 0] - 2 * X[:, 1] + 5 + rng.normal(0, 1.5, size=80)`,
      starter: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
# X (80x2) e y sono gia' pronti

X_train, X_test, y_train, y_test = ...
n_train = ...
n_test = ...

model = ...

r2_test = ...
print(n_train, n_test, r2_test)`,
      check: `import numpy as np
assert 'n_train' in globals() and 'n_test' in globals() and n_train == 60 and n_test == 20, "Con test_size=0.25 su 80 osservazioni: 60 train, 20 test"
assert 'X_train' in globals() and len(X_train) == 60, "X_train deve avere 60 righe: controlla l'ordine dei 4 output di train_test_split"
assert 'model' in globals() and hasattr(model, 'coef_'), "Addestra il modello con fit(X_train, y_train)"
assert 'r2_test' in globals() and float(r2_test) > 0.9, "r2_test deve superare 0.9: i dati sono quasi lineari. Se e' basso, forse hai addestrato sul test?"`,
      hint: `<p>L'ordine di uscita è fisso e va imparato a memoria: <code>X_train, X_test, y_train, y_test</code>. Poi <code>len(X_train)</code> e <code>model.score(X_test, y_test)</code>.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
n_train = len(X_train)
n_test = len(X_test)

model = LinearRegression()
model.fit(X_train, y_train)

r2_test = float(model.score(X_test, y_test))
print(n_train, n_test, r2_test)`
    },

    { type: "theory", title: "Metriche di regressione: MAE, MSE, R²", html: `
<p>"Quanto sbaglia" ha più risposte, e ognuna dice una cosa diversa:</p>
<pre><code>from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
mean_absolute_error(y_test, pred)  # MAE: errore medio, nelle unita' di y. Leggibile.
mean_squared_error(y_test, pred)   # MSE: errori al quadrato — punisce i disastri
r2_score(y_test, pred)             # R2: frazione di varianza spiegata (1 = perfetto)</code></pre>
<p>Il MAE è quello da raccontare ("sbagliamo in media di 12 ms"); l'MSE è sensibile agli errori grossi (un errore di 10 pesa come cento errori di 1); l'R² confronta col modello più stupido possibile (predire sempre la media): <strong>R² = 0 significa "inutile"</strong>, e può pure venire negativo — peggio della media fissa.</p>
`, more: `
<p>L'MSE ha un parente più leggibile: la <strong>RMSE</strong> (root mean squared error), semplicemente <code>np.sqrt(mse)</code> — torna nelle stesse unità di misura di y (a differenza dell'MSE, che essendo un quadrato è in unità al quadrato, difficili da interpretare direttamente). Molti report preferiscono RMSE all'MSE grezzo proprio per questo motivo, pur mantenendo la stessa sensibilità agli errori grandi.</p>
<p>La scelta tra MAE e MSE/RMSE non è solo estetica: se un errore enorme occasionale è molto più grave di tanti piccoli errori diffusi (es. prevedere il fabbisogno di sangue in ospedale: sbagliare di poco spesso è tollerabile, sbagliare di tanto una volta può essere pericoloso), l'MSE è la metrica che riflette meglio quella priorità, perché penalizza quadraticamente gli errori grandi. Se invece ogni unità di errore ha lo stesso costo, il MAE è più onesto.</p>
<p><code>model.score(X, y)</code> per un regressore restituisce SEMPRE l'R², è solo una scorciatoia — <code>model.score(X_test, y_test)</code> e <code>r2_score(y_test, model.predict(X_test))</code> danno esattamente lo stesso numero. Sapere questo evita di trattarli come due controlli indipendenti quando in realtà sono lo stesso calcolo scritto in due modi.</p>
` },

    {
      type: "exercise", id: "sk-03", kg: 15, title: "Il bilancino a tre pesi",
      task: `<p>Un modello è già addestrato e ha prodotto <code>pred</code> sul test. Misuralo:</p>
<ul>
<li><code>mae</code>, <code>mse</code>, <code>r2</code>: le tre metriche, confrontando <code>y_test</code> con <code>pred</code></li>
<li><code>mae_stupido</code>: il MAE di un "modello" che predice sempre la <strong>media di y_test</strong> (costruisci con <code>np.full_like</code> o moltiplicando)</li>
<li>Domanda implicita: il tuo modello batte lo stupido? (la verifica lo controlla)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(11)
_X = rng.uniform(0, 10, size=(100, 2))
_y = 4 * _X[:, 0] - 1.5 * _X[:, 1] + rng.normal(0, 3.0, size=100)
_m = LinearRegression().fit(_X[:75], _y[:75])
X_test, y_test = _X[75:], _y[75:]
pred = _m.predict(X_test)`,
      starter: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# y_test e pred sono gia' pronti

mae = ...
mse = ...
r2 = ...

pred_stupida = ...
mae_stupido = ...

print(f"MAE {mae:.2f}  MSE {mse:.2f}  R2 {r2:.3f}")
print(f"MAE del modello-media: {mae_stupido:.2f}")`,
      check: `import numpy as np
from sklearn.metrics import mean_absolute_error
assert 'mae' in globals() and abs(float(mae) - float(mean_absolute_error(y_test, pred))) < 1e-9, "mae: mean_absolute_error(y_test, pred)"
assert 'mse' in globals() and float(mse) > float(mae), "Con questi dati l'MSE viene piu' grande del MAE (gli errori > 1 al quadrato crescono)"
assert 'r2' in globals() and 0.8 < float(r2) <= 1.0, "r2: r2_score(y_test, pred) — qui deve venire alto"
assert 'mae_stupido' in globals() and float(mae_stupido) > 3 * float(mae), "mae_stupido: MAE di una previsione costante pari a y_test.mean() — deve essere MOLTO peggio del modello"`,
      hint: `<p>La previsione stupida è un array della stessa lunghezza di y_test, tutto uguale alla media: <code>np.full_like(y_test, y_test.mean())</code>. Poi passala a <code>mean_absolute_error</code> come se fosse una previsione.</p>`,
      solution: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, pred)
mse = mean_squared_error(y_test, pred)
r2 = r2_score(y_test, pred)

pred_stupida = np.full_like(y_test, y_test.mean())
mae_stupido = mean_absolute_error(y_test, pred_stupida)

print(f"MAE {mae:.2f}  MSE {mse:.2f}  R2 {r2:.3f}")
print(f"MAE del modello-media: {mae_stupido:.2f}")`
    },

    { type: "theory", title: "Regressione multipla e coefficienti", html: `
<p>Con più feature il modello impara un coefficiente per ciascuna: quanto cambia y quando quella feature sale di 1, <em>a parità delle altre</em>. Il dataset <code>diabetes</code> (incluso in scikit-learn, già standardizzato) è la palestra classica:</p>
<pre><code>from sklearn.datasets import load_diabetes
data = load_diabetes()
X, y = data.data, data.target       # 442 pazienti, 10 feature
data.feature_names                  # ['age', 'sex', 'bmi', 'bp', ...]</code></pre>
<p>Siccome le feature sono sulla stessa scala, i coefficienti si possono confrontare: quello con valore assoluto più grande è la feature che pesa di più. Con feature su scale diverse questo confronto sarebbe una bugia — ci torniamo nella prossima sala.</p>
`, more: `
<p>Perché il confronto tra coefficienti richiede scale uniformi: un coefficiente rappresenta "quanto cambia y per un aumento di 1 UNITÀ della feature". Se una feature è misurata in millimetri (range 0-1000) e un'altra in metri (range 0-1), i loro coefficienti non sono comparabili anche se la seconda feature fosse in realtà più importante — un aumento di "1 metro" è un cambiamento enorme, un aumento di "1 millimetro" è trascurabile. Il dataset diabetes è già standardizzato internamente proprio per rendere questo confronto legittimo.</p>
<p>Con feature su scale diverse (il caso più comune nella pratica), la soluzione standard è passare i dati attraverso uno <code>StandardScaler</code> PRIMA di addestrare — trasforma ogni feature in modo che abbia media 0 e deviazione standard 1, rendendo i coefficienti risultanti direttamente comparabili in termini di "quante deviazioni standard di y cambia per una deviazione standard della feature".</p>
<p>Un'insidia più sottile: due feature CORRELATE tra loro (es. età e anni di esperienza lavorativa) possono "spartirsi" artificialmente l'importanza tra i loro coefficienti, facendo sembrare entrambe meno importanti di quanto lo sarebbero singolarmente — un fenomeno chiamato multicollinearità. Il coefficiente di una regressione lineare, da solo, non è sempre un indicatore affidabile di "importanza reale" quando le feature non sono indipendenti tra loro.</p>
` },

    {
      type: "exercise", id: "sk-04", kg: 15, title: "Chi solleva davvero il peso?",
      task: `<p>Addestra sul dataset diabetes (già caricato e già splittato):</p>
<ul>
<li><code>model</code>: LinearRegression su train</li>
<li><code>r2_test</code>: score sul test</li>
<li><code>feature_top</code>: il <strong>nome</strong> della feature con coefficiente più grande in valore assoluto (usa <code>np.argmax</code> su <code>np.abs(model.coef_)</code> e indicizza <code>nomi</code>)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
X, y = _data.data, _data.target
nomi = list(_data.feature_names)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
# X_train, X_test, y_train, y_test, nomi: gia' pronti
print(nomi)

model = ...

r2_test = ...
feature_top = ...

print(r2_test, feature_top)`,
      check: `import numpy as np
assert 'model' in globals() and hasattr(model, 'coef_') and len(model.coef_) == 10, "model: LinearRegression().fit(X_train, y_train) — 10 coefficienti"
assert 'r2_test' in globals() and 0.3 < float(r2_test) < 0.7, "r2_test realistico per questo dataset: ~0.4-0.55. Il mondo reale non e' il dataset sintetico!"
assert 'feature_top' in globals() and feature_top in nomi, "feature_top deve essere uno dei nomi in 'nomi'"
assert feature_top == nomi[int(np.argmax(np.abs(model.coef_)))], "feature_top: nomi[np.argmax(np.abs(model.coef_))] — il piu' grande IN VALORE ASSOLUTO"`,
      hint: `<p>Un coefficiente di −800 pesa più di uno di +500: per questo <code>np.abs</code> prima di <code>argmax</code>. E nota l'R²: sui dati veri 0.5 può essere un buon risultato.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
print(nomi)

model = LinearRegression()
model.fit(X_train, y_train)

r2_test = float(model.score(X_test, y_test))
feature_top = nomi[int(np.argmax(np.abs(model.coef_)))]

print(r2_test, feature_top)`
    },

    { type: "theory", title: "Classificazione: prevedere categorie", html: `
<p>Se il target è una <strong>categoria</strong> (spam/non spam, vocale /a/ vs /i/) si parla di classificazione. Il rito non cambia — fit, predict — cambia il modello. La <code>LogisticRegression</code>, nonostante il nome, è un classificatore:</p>
<pre><code>from sklearn.linear_model import LogisticRegression
clf = LogisticRegression()
clf.fit(X_train, y_train)          # y contiene classi: 0/1, "a"/"i"...
clf.predict(X_test)                # restituisce classi
clf.predict_proba(X_test)          # probabilita' per classe: piu' informativo</code></pre>
<p>Il dataset <code>iris</code> (150 fiori, 4 misure, 3 specie) è la palestra canonica. <code>predict_proba</code> è il valore aggiunto: sapere che il modello è sicuro al 51% o al 99% cambia tutto nelle decisioni.</p>
`, more: `
<p>Nonostante il nome contenga "regression", <code>LogisticRegression</code> è un classificatore a tutti gli effetti: il nome viene dal fatto che internamente stima la PROBABILITÀ di appartenenza a una classe attraverso una funzione (la sigmoide/logistica) applicata a una combinazione lineare delle feature — è "regressione" nel meccanismo interno, "classificazione" nell'uso pratico finale. Non lasciarti ingannare dal nome quando lo incontri per la prima volta.</p>
<p>Con più di due classi (come le 3 specie di iris), scikit-learn gestisce automaticamente il problema con una strategia interna (tipicamente "multinomiale" o "one-vs-rest" a seconda della versione) — non serve configurare nulla di speciale, la stessa <code>LogisticRegression().fit(X, y)</code> funziona identica sia con 2 che con N classi, a differenza di altri framework dove la classificazione multi-classe richiede impostazioni esplicite.</p>
<p><code>predict_proba</code> apre a decisioni più sfumate del semplice "classe A o B": in un contesto medico, ad esempio, potresti scegliere di segnalare per revisione umana ogni caso con probabilità della classe più probabile sotto il 70%, anche se <code>predict</code> darebbe comunque una risposta netta — la soglia di decisione non deve essere per forza 0.5, e <code>predict_proba</code> è ciò che rende possibile personalizzarla (un esercizio di questa sala esplora esattamente questa idea).</p>
` },

    {
      type: "exercise", id: "sk-05", kg: 15, title: "Il primo classificatore",
      task: `<p>Iris è già caricato e splittato. Fai:</p>
<ul>
<li><code>clf</code>: una <code>LogisticRegression(max_iter=1000)</code> addestrata sul train</li>
<li><code>acc</code>: l'accuratezza sul test (<code>clf.score</code>)</li>
<li><code>prime_previsioni</code>: le classi previste per le prime 5 righe del test (array)</li>
<li><code>proba_primo</code>: le 3 probabilità del primo fiore del test (array, deve sommare a 1)</li>
</ul>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X, y = _iris.data, _iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)`,
      starter: `from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti

clf = ...

acc = ...
prime_previsioni = ...
proba_primo = ...

print(acc)
print(prime_previsioni)
print(proba_primo)`,
      check: `import numpy as np
assert 'clf' in globals() and hasattr(clf, 'classes_'), "clf: LogisticRegression(max_iter=1000).fit(X_train, y_train)"
assert 'acc' in globals() and float(acc) > 0.85, "acc: clf.score(X_test, y_test) — su iris deve venire alta"
assert 'prime_previsioni' in globals() and len(prime_previsioni) == 5, "prime_previsioni: clf.predict(X_test[:5])"
assert 'proba_primo' in globals() and abs(float(np.sum(proba_primo)) - 1.0) < 1e-6 and len(np.ravel(proba_primo)) == 3, "proba_primo: clf.predict_proba(X_test[:1])[0] — tre probabilita' che sommano a 1"`,
      hint: `<p><code>predict_proba(X_test[:1])</code> restituisce una matrice 1×3: il <code>[0]</code> finale estrae la riga. <code>max_iter=1000</code> serve solo a far convergere l'ottimizzatore senza warning.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

acc = float(clf.score(X_test, y_test))
prime_previsioni = clf.predict(X_test[:5])
proba_primo = clf.predict_proba(X_test[:1])[0]

print(acc)
print(prime_previsioni)
print(proba_primo)`
    },

    { type: "theory", title: "La matrice di confusione: dove sbaglia, non solo quanto", html: `
<p>L'accuratezza è un numero solo e può mentire: con 95% di email legittime, un modello che dice sempre "non spam" ha il 95% di accuratezza ed è inutile. La <strong>matrice di confusione</strong> mostra <em>dove</em> finiscono gli errori:</p>
<pre><code>from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_test, pred)
# righe = classe VERA, colonne = classe PREVISTA
# cm[i, j] = quanti della classe i sono stati previsti come j
# diagonale = azzeccati; fuori diagonale = confusioni</code></pre>
<p>La diagonale racconta i successi; ogni cella fuori diagonale è una confusione specifica ("le /e/ scambiate per /i/"), che spesso è l'informazione scientificamente interessante.</p>
`, more: `
<p>In un problema binario (2 classi), le quattro celle della matrice 2×2 hanno nomi standard che vale la pena memorizzare: <strong>TP</strong> (veri positivi, cm[1,1]), <strong>TN</strong> (veri negativi, cm[0,0]), <strong>FP</strong> (falsi positivi, cm[0,1] — il modello ha gridato "positivo" ma era negativo, un falso allarme), <strong>FN</strong> (falsi negativi, cm[1,0] — il modello ha detto "negativo" ma era positivo, un caso mancato). Precision e recall (visti in un'altra teoria di questa sala) sono definiti direttamente in termini di queste quattro celle.</p>
<p>Il costo di un FP e di un FN è quasi sempre ASIMMETRICO nella pratica: in uno screening medico, un falso negativo (malattia non rilevata) è tipicamente molto più grave di un falso positivo (esame di conferma inutile ma nessun danno). La matrice di confusione rende visibile questa asimmetria in un modo che l'accuratezza da sola nasconde completamente.</p>
<p>Per visualizzare una matrice di confusione in modo più leggibile di una tabella di numeri, <code>ConfusionMatrixDisplay</code> di scikit-learn la disegna come un grafico a griglia colorata — non disponibile in questa palestra testuale, ma il formato standard con cui la incontrerai in qualsiasi notebook di analisi reale.</p>
` },

    {
      type: "exercise", id: "sk-06", kg: 20, title: "Leggi la confusione",
      task: `<p>Un classificatore su iris è già addestrato, con le previsioni in <code>pred</code>. Analizza:</p>
<ul>
<li><code>cm</code>: la matrice di confusione tra <code>y_test</code> e <code>pred</code></li>
<li><code>azzeccati</code>: il totale dei corretti (la somma della diagonale: <code>np.trace</code> o <code>cm.diagonal().sum()</code>), come intero</li>
<li><code>errori</code>: il totale degli errori, come intero</li>
<li><code>acc_a_mano</code>: l'accuratezza ricostruita dalla matrice (corretti / totale), che deve coincidere con <code>accuracy_score</code></li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=7, stratify=_iris.target)
_clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score
# y_test e pred sono gia' pronti

cm = ...
azzeccati = ...
errori = ...
acc_a_mano = ...

print(cm)
print(azzeccati, errori, acc_a_mano)`,
      check: `import numpy as np
from sklearn.metrics import accuracy_score
assert 'cm' in globals() and cm.shape == (3, 3), "cm: confusion_matrix(y_test, pred) — 3 classi, matrice 3x3"
assert 'azzeccati' in globals() and int(azzeccati) == int(np.trace(cm)), "azzeccati: la somma della diagonale"
assert 'errori' in globals() and int(errori) == int(cm.sum() - np.trace(cm)), "errori: tutto meno la diagonale"
assert 'acc_a_mano' in globals() and abs(float(acc_a_mano) - float(accuracy_score(y_test, pred))) < 1e-9, "acc_a_mano = azzeccati / cm.sum() deve coincidere con accuracy_score: l'accuratezza E' la diagonale sulla matrice"`,
      hint: `<p><code>np.trace(cm)</code> somma la diagonale; <code>cm.sum()</code> è il numero totale di osservazioni del test. L'accuratezza è il loro rapporto — adesso sai da dove viene quel numero.</p>`,
      solution: `import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score

cm = confusion_matrix(y_test, pred)
azzeccati = int(np.trace(cm))
errori = int(cm.sum() - np.trace(cm))
acc_a_mano = azzeccati / cm.sum()

print(cm)
print(azzeccati, errori, acc_a_mano)`
    },

    { type: "theory", title: "KNN: classificare per somiglianza", html: `
<p>Il <strong>k-nearest neighbors</strong> è il modello più intuitivo che esista: per classificare un punto nuovo, guarda i <code>k</code> punti più vicini nel training e fai votare la maggioranza. Niente formule imparate: la "conoscenza" è il dataset stesso.</p>
<pre><code>from sklearn.neighbors import KNeighborsClassifier
clf = KNeighborsClassifier(n_neighbors=5)   # k = 5 vicini
clf.fit(X_train, y_train)</code></pre>
<p>Il valore di <code>k</code> è un <strong>iperparametro</strong>: non lo impara il modello, lo scegli tu. k=1 memorizza tutto (e il rumore vince), k enorme appiattisce tutto verso la classe più comune. La scelta degli iperparametri è metà del mestiere — e siccome KNN ragiona sulle <em>distanze</em>, le scale delle feature contano tantissimo (prossima sala).</p>
`, more: `
<p>KNN è chiamato modello <strong>"lazy"</strong> (pigro): a differenza della regressione lineare, che durante il <code>fit</code> calcola coefficienti e poi li usa per prevedere, KNN durante il <code>fit</code> si limita a MEMORIZZARE l'intero training set — tutto il lavoro (calcolare le distanze, trovare i k vicini, votare) avviene al momento di <code>predict</code>. Questo significa che il "modello" cresce in dimensione con il training set: KNN su un milione di righe è lento in previsione, non solo in addestramento.</p>
<p>Il KNN estende naturalmente alla regressione con <code>KNeighborsRegressor</code>: invece di far votare la classe più comune tra i k vicini, fa la MEDIA dei loro valori target — stesso principio di somiglianza, applicato a un target continuo invece che categoriale.</p>
<p>La scelta di k giusta oscilla tra due rischi opposti: k troppo piccolo (es. 1) rende il modello estremamente sensibile al rumore — un singolo punto anomalo nel training può cambiare la previsione; k troppo grande fa "votare" anche punti lontani e poco simili, appiattendo le previsioni verso la classe più comune del dataset intero, indipendentemente da dove si trovi il punto da classificare. Il valore ottimale si trova quasi sempre per tentativi, come nell'esercizio "torneo dei k" di questa sala — o più sistematicamente con la cross-validation della prossima.</p>
` },

    {
      type: "exercise", id: "sk-07", kg: 20, title: "Il torneo dei k",
      task: `<p>Su iris (già splittato), scopri quale k funziona meglio:</p>
<ul>
<li><code>accuratezze</code>: un <strong>dizionario</strong> {k: accuratezza sul test} per k in <code>[1, 5, 15, 50]</code> (ciclo for!)</li>
<li><code>k_migliore</code>: il k col punteggio più alto (usa <code>max(accuratezze, key=accuratezze.get)</code>)</li>
<li><code>acc_migliore</code>: la sua accuratezza</li>
</ul>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

accuratezze = {}
for k in [1, 5, 15, 50]:
    ...

k_migliore = ...
acc_migliore = ...

print(accuratezze)
print(k_migliore, acc_migliore)`,
      check: `assert 'accuratezze' in globals() and isinstance(accuratezze, dict) and sorted(accuratezze.keys()) == [1, 5, 15, 50], "accuratezze deve avere le chiavi 1, 5, 15, 50"
assert all(0.5 < v <= 1.0 for v in accuratezze.values()), "Ogni valore deve essere un'accuratezza sul TEST (clf.score(X_test, y_test))"
assert accuratezze[50] <= max(accuratezze[1], accuratezze[5], accuratezze[15]), "Con k=50 (un terzo del training!) il modello si appiattisce: non puo' essere il migliore"
assert 'k_migliore' in globals() and 'acc_migliore' in globals() and abs(float(acc_migliore) - accuratezze[k_migliore]) < 1e-12, "k_migliore e acc_migliore devono essere coerenti col dizionario"`,
      hint: `<p>Nel ciclo: crea <code>KNeighborsClassifier(n_neighbors=k)</code>, fit sul train, e <code>accuratezze[k] = clf.score(X_test, y_test)</code>. Quattro righe in tutto.</p>`,
      solution: `from sklearn.neighbors import KNeighborsClassifier

accuratezze = {}
for k in [1, 5, 15, 50]:
    clf = KNeighborsClassifier(n_neighbors=k)
    clf.fit(X_train, y_train)
    accuratezze[k] = clf.score(X_test, y_test)

k_migliore = max(accuratezze, key=accuratezze.get)
acc_migliore = accuratezze[k_migliore]

print(accuratezze)
print(k_migliore, acc_migliore)`
    },

    {
      type: "exercise", id: "sk-08", kg: 25, title: "Massimale: la sfida dei modelli",
      task: `<p>Gara vera sul dataset wine (178 vini, 13 feature chimiche, 3 cantine — già splittato). Confronta due contendenti:</p>
<ul>
<li><code>acc_logistic</code>: accuratezza sul test di <code>LogisticRegression(max_iter=5000)</code></li>
<li><code>acc_knn</code>: accuratezza sul test di <code>KNeighborsClassifier(n_neighbors=5)</code></li>
<li><code>vincitore</code>: la stringa <code>"logistic"</code> o <code>"knn"</code>, decisa <strong>dal codice</strong> (if/else sulle accuratezze)</li>
<li><code>cm_vincitore</code>: la matrice di confusione del modello vincente</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix
# X_train, X_test, y_train, y_test: gia' pronti

log_clf = ...
acc_logistic = ...

knn_clf = ...
acc_knn = ...

vincitore = ...
cm_vincitore = ...

print(f"logistic: {acc_logistic:.3f}  knn: {acc_knn:.3f}  → vince {vincitore}")
print(cm_vincitore)`,
      check: `import numpy as np
assert 'acc_logistic' in globals() and 'acc_knn' in globals() and 0.5 < float(acc_knn) < float(acc_logistic), "Su wine, senza standardizzazione, la logistic deve battere il KNN: le 13 feature hanno scale diversissime e le distanze del KNN sono dominate da una sola feature"
assert 'vincitore' in globals() and vincitore == "logistic", "vincitore deve essere 'logistic', deciso con un if sulle accuratezze"
assert 'cm_vincitore' in globals() and cm_vincitore.shape == (3, 3) and int(np.trace(cm_vincitore)) >= int(round(float(acc_logistic) * cm_vincitore.sum())) - 1, "cm_vincitore: la matrice di confusione del modello vincente (la logistic)"`,
      hint: `<p>Il KNN qui crolla (~0.7) perché la prolina ha valori ~1000 e domina ogni distanza euclidea, mentre le altre feature contano zero. Ricordati questo momento: nella prossima sala lo standardizzatore ribalta il risultato.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix

log_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
acc_logistic = log_clf.score(X_test, y_test)

knn_clf = KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train)
acc_knn = knn_clf.score(X_test, y_test)

if acc_logistic >= acc_knn:
    vincitore = "logistic"
    cm_vincitore = confusion_matrix(y_test, log_clf.predict(X_test))
else:
    vincitore = "knn"
    cm_vincitore = confusion_matrix(y_test, knn_clf.predict(X_test))

print(f"logistic: {acc_logistic:.3f}  knn: {acc_knn:.3f}  → vince {vincitore}")
print(cm_vincitore)`
    },

    { type: "theory", title: "Naive Bayes: probabilità che si moltiplicano", html: `
<p>Il <strong>Naive Bayes</strong> parte da un'ipotesi semplificatrice ("naive"): le feature sono indipendenti tra loro dato il valore della classe. È spesso falso in pratica, eppure il modello funziona sorprendentemente bene, è velocissimo da addestrare e richiede pochissimi dati.</p>
<pre><code>from sklearn.naive_bayes import GaussianNB
nb = GaussianNB()
nb.fit(X_train, y_train)
nb.score(X_test, y_test)</code></pre>
<p>La versione <code>GaussianNB</code> assume che ogni feature, dentro ogni classe, segua una distribuzione normale — adatta a feature numeriche continue come le misure di un fiore o di un vino. È un ottimo modello "baseline": veloce da provare prima di modelli più pesanti.</p>
`, more: `
<p>Il nome "Bayes" viene dal teorema di Bayes, che il modello usa per invertire la domanda: invece di chiedere direttamente "qual è la classe più probabile dati questi valori di feature?", calcola "quanto sono probabili QUESTI valori di feature, per ciascuna classe possibile?" (assumendo l'indipendenza "naive") e poi sceglie la classe che rende i dati osservati più plausibili. È un ragionamento all'indietro rispetto a modelli come la regressione logistica.</p>
<p>Oltre a <code>GaussianNB</code> (per feature continue), scikit-learn offre <code>MultinomialNB</code> (per conteggi discreti, tipicamente usato nella classificazione di testo con conteggi di parole) e <code>BernoulliNB</code> (per feature binarie 0/1). La scelta della variante dipende dalla natura delle feature, non dalla natura del problema — usare <code>GaussianNB</code> su conteggi di parole, o <code>MultinomialNB</code> su misure fisiche continue, produce risultati scadenti perché l'assunzione statistica sottostante non corrisponde ai dati.</p>
<p>Il grande vantaggio pratico di Naive Bayes, oltre alla velocità, è che richiede pochissimi dati per stimare parametri ragionevoli (solo media e varianza per feature e classe) — dove un modello più complesso rischierebbe overfitting su un dataset piccolo, Naive Bayes spesso resta stabile. Il prezzo da pagare è l'assunzione di indipendenza, quasi sempre falsa nella realtà (in un'immagine, i pixel vicini sono chiaramente correlati tra loro) ma che nella pratica sorprendentemente spesso non compromette troppo le prestazioni finali.</p>
` },

    {
      type: "exercise", id: "sk-09", kg: 15, title: "Il modello tascabile",
      task: `<p>Su iris (già splittato), confronta Naive Bayes con la logistic regression:</p>
<ul>
<li><code>nb</code>: un <code>GaussianNB()</code> addestrato sul train</li>
<li><code>acc_nb</code>: la sua accuratezza sul test</li>
<li><code>log_clf</code>: una <code>LogisticRegression(max_iter=1000)</code> addestrata sul train</li>
<li><code>acc_log</code>: la sua accuratezza sul test</li>
<li><code>differenza</code>: <code>acc_log - acc_nb</code> (può essere piccola: su iris sono spesso vicini)</li>
</ul>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti

nb = ...
acc_nb = ...

log_clf = ...
acc_log = ...

differenza = ...
print(f"NB: {acc_nb:.3f}  Logistic: {acc_log:.3f}  differenza: {differenza:.3f}")`,
      check: `assert 'nb' in globals() and hasattr(nb, "theta_"), "nb: GaussianNB().fit(X_train, y_train) — theta_ e' l'attributo con le medie imparate"
assert 'acc_nb' in globals() and float(acc_nb) > 0.85, "acc_nb: nb.score(X_test, y_test) — su iris deve venire alta"
assert 'log_clf' in globals() and hasattr(log_clf, "coef_"), "log_clf: LogisticRegression(max_iter=1000).fit(X_train, y_train)"
assert 'acc_log' in globals() and float(acc_log) > 0.85, "acc_log: log_clf.score(X_test, y_test)"
assert 'differenza' in globals() and abs(float(differenza) - (float(acc_log) - float(acc_nb))) < 1e-12, "differenza: acc_log - acc_nb"`,
      hint: `<p>Stesso rito di sempre: crea, <code>fit</code>, <code>score</code>. Cambia solo la classe importata da <code>sklearn.naive_bayes</code> invece che da <code>sklearn.linear_model</code>.</p>`,
      solution: `from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression

nb = GaussianNB()
nb.fit(X_train, y_train)
acc_nb = nb.score(X_test, y_test)

log_clf = LogisticRegression(max_iter=1000)
log_clf.fit(X_train, y_train)
acc_log = log_clf.score(X_test, y_test)

differenza = acc_log - acc_nb
print(f"NB: {acc_nb:.3f}  Logistic: {acc_log:.3f}  differenza: {differenza:.3f}")`
    },

    { type: "theory", title: "Precision, recall, F1: oltre l'accuratezza", html: `
<p>L'accuratezza mischia due tipi di errore che spesso hanno costi diversissimi. Per una classe bersaglio (es. "malato", "spam", "difettoso"):</p>
<ul>
<li><strong>precision</strong>: delle volte che ho detto "sì", quante erano vere? (pochi falsi allarmi)</li>
<li><strong>recall</strong>: dei casi veri, quanti ne ho trovati? (pochi casi persi)</li>
<li><strong>F1</strong>: la loro media armonica, un compromesso in un solo numero</li>
</ul>
<pre><code>from sklearn.metrics import classification_report, precision_score, recall_score, f1_score
print(classification_report(y_test, pred))     # tabella completa, per classe
precision_score(y_test, pred, average="macro")
recall_score(y_test, pred, average="macro")</code></pre>
<p><code>average="macro"</code> fa la media semplice tra le classi — utile quando le classi sono sbilanciate e non vuoi che quella maggioritaria domini il punteggio.</p>
` },

    {
      type: "exercise", id: "sk-10", kg: 20, title: "Precisione e richiamo",
      task: `<p>Un classificatore su wine è già addestrato con previsioni in <code>pred</code>. Calcola (tutte con <code>average="macro"</code>):</p>
<ul>
<li><code>precision</code>: precision_score</li>
<li><code>recall</code>: recall_score</li>
<li><code>f1</code>: f1_score</li>
<li><code>report_testo</code>: la stringa di <code>classification_report(y_test, pred)</code></li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)
_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score, classification_report
# y_test e pred sono gia' pronti

precision = ...
recall = ...
f1 = ...
report_testo = ...

print(report_testo)`,
      check: `from sklearn.metrics import precision_score, recall_score, f1_score
assert 'precision' in globals() and abs(float(precision) - float(precision_score(y_test, pred, average="macro"))) < 1e-9, "precision: precision_score(y_test, pred, average='macro')"
assert 'recall' in globals() and abs(float(recall) - float(recall_score(y_test, pred, average="macro"))) < 1e-9, "recall: recall_score(y_test, pred, average='macro')"
assert 'f1' in globals() and abs(float(f1) - float(f1_score(y_test, pred, average="macro"))) < 1e-9, "f1: f1_score(y_test, pred, average='macro')"
assert 'report_testo' in globals() and "precision" in report_testo, "report_testo: classification_report(y_test, pred) — e' una stringa formattata"`,
      hint: `<p>Le tre metriche condividono la stessa firma: <code>funzione(y_test, pred, average="macro")</code>. <code>classification_report</code> invece restituisce direttamente il testo pronto da stampare.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score, classification_report

precision = precision_score(y_test, pred, average="macro")
recall = recall_score(y_test, pred, average="macro")
f1 = f1_score(y_test, pred, average="macro")
report_testo = classification_report(y_test, pred)

print(report_testo)`
    },

    { type: "theory", title: "SVM: separare con il margine più ampio", html: `
<p>La <strong>Support Vector Machine</strong> cerca il confine tra classi che massimizza il <strong>margine</strong> — la distanza dai punti più vicini di ciascuna classe. Con <code>kernel="rbf"</code> può disegnare confini curvi, non solo rette:</p>
<pre><code>from sklearn.svm import SVC
svm = SVC(kernel="rbf", C=1.0)
svm.fit(X_train, y_train)</code></pre>
<p><code>C</code> è un iperparametro di compromesso: alto = confine più fedele al training (rischio overfitting), basso = confine più "morbido" e generalizzabile. Come il KNN, la SVM ragiona sulle distanze tra punti: <strong>senza standardizzazione i risultati sono inaffidabili</strong>, quindi va quasi sempre in pipeline con uno scaler.</p>
`, more: `
<p>Il "trucco del kernel" (kernel trick) è l'idea matematica alla base della SVM con <code>kernel="rbf"</code>: invece di cercare esplicitamente un confine curvo nello spazio originale delle feature, il kernel proietta implicitamente i dati in uno spazio a dimensione molto più alta (a volte infinita) dove un confine CURVO nello spazio originale diventa un semplice iperpiano DRITTO — e i calcoli necessari per farlo restano comunque efficienti, senza mai costruire esplicitamente quello spazio enorme.</p>
<p>Oltre a <code>"rbf"</code> (il kernel più flessibile, buono come default) e <code>"linear"</code> (un confine dritto, più veloce e interpretabile, adatto quando sospetti che le classi siano già linearmente separabili), esiste <code>"poly"</code> (confini polinomiali di grado configurabile) — la scelta del kernel è essa stessa un iperparametro da confrontare empiricamente, non una decisione teorica a priori.</p>
<p><code>make_pipeline(StandardScaler(), SVC(...))</code> non è solo comodità sintattica: garantisce che lo scaler venga addestrato SOLO sul train quando chiami <code>pipe.fit(X_train, y_train)</code>, e poi applicato automaticamente (con gli stessi parametri imparati) quando chiami <code>pipe.score(X_test, y_test)</code> o <code>pipe.predict(X_nuovi)</code> — evitando manualmente il rischio di data leakage descritto nella teoria sul train/test split di questa sala.</p>
` },

    {
      type: "exercise", id: "sk-11", kg: 20, title: "Il confine a margine massimo",
      task: `<p>Su wine (già splittato), costruisci una pipeline con la SVM:</p>
<ul>
<li><code>pipe</code>: <code>StandardScaler</code> + <code>SVC(kernel="rbf", C=1.0)</code>, addestrata sul train</li>
<li><code>acc_svm</code>: accuratezza sul test</li>
<li><code>pipe_senza_scaler</code>: la stessa SVM ma <strong>senza</strong> scaler, addestrata direttamente sui dati grezzi</li>
<li><code>acc_senza_scaler</code>: la sua accuratezza (per vedere quanto conta lo scaler anche qui)</li>
</ul>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

pipe = ...

acc_svm = ...

pipe_senza_scaler = ...

acc_senza_scaler = ...

print(f"con scaler: {acc_svm:.3f}   senza: {acc_senza_scaler:.3f}")`,
      check: `assert 'pipe' in globals() and 'acc_svm' in globals() and float(acc_svm) > 0.9, "pipe: make_pipeline(StandardScaler(), SVC(kernel='rbf', C=1.0)) — su wine standardizzato deve superare 0.9"
assert 'pipe_senza_scaler' in globals() and 'acc_senza_scaler' in globals(), "pipe_senza_scaler: SVC(kernel='rbf', C=1.0).fit(X_train, y_train) sui dati grezzi"
assert float(acc_svm) > float(acc_senza_scaler), "La SVM con scaler deve battere quella senza: anche la SVM ragiona per distanze, come il KNN"`,
      hint: `<p>Stessa lezione del KNN nella sala precedente: la SVM misura distanze, quindi la scala della prolina (~1000) schiaccerebbe tutto senza uno StandardScaler prima.</p>`,
      solution: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1.0))
pipe.fit(X_train, y_train)
acc_svm = pipe.score(X_test, y_test)

pipe_senza_scaler = SVC(kernel="rbf", C=1.0)
pipe_senza_scaler.fit(X_train, y_train)
acc_senza_scaler = pipe_senza_scaler.score(X_test, y_test)

print(f"con scaler: {acc_svm:.3f}   senza: {acc_senza_scaler:.3f}")`
    },

    {
      type: "exercise", id: "sk-12", kg: 10, title: "Drill: la retta perfetta",
      task: `<p>Su <code>X, y</code> (relazione perfettamente lineare y=2x+1): addestra <code>model</code>, leggi <code>pendenza</code> e <code>intercetta</code>, previsione per x=10 in <code>previsione_10</code>.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4],[5]])
y = np.array([3,5,7,9,11])

model = LinearRegression()
model.fit(X, y)

pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_10 = float(model.predict([[10]])[0])

print(pendenza, intercetta, previsione_10)`,
      check: `assert abs(pendenza - 2.0) < 1e-6
assert abs(intercetta - 1.0) < 1e-6
assert abs(previsione_10 - 21.0) < 1e-6`,
      hint: `<p>Con dati perfettamente lineari, <code>coef_</code> e <code>intercept_</code> ricostruiscono esattamente la formula che ha generato i dati.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4],[5]])
y = np.array([3,5,7,9,11])

model = LinearRegression()
model.fit(X, y)

pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_10 = float(model.predict([[10]])[0])

print(pendenza, intercetta, previsione_10)`
    },

    {
      type: "exercise", id: "sk-13", kg: 10, title: "Drill: dimensioni dello split",
      task: `<p>Su 50 osservazioni (<code>Xs, ys</code>), con <code>test_size=0.2</code> e <code>random_state=1</code>: <code>n_train</code> e <code>n_test</code>.</p>`,
      starter: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(100).reshape(50, 2)
ys = np.arange(50)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.2, random_state=1)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`,
      check: `assert n_train == 40
assert n_test == 10`,
      hint: `<p>Con 50 righe e <code>test_size=0.2</code>: 10 vanno al test, 40 restano al train.</p>`,
      solution: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(100).reshape(50, 2)
ys = np.arange(50)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.2, random_state=1)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`
    },

    {
      type: "exercise", id: "sk-14", kg: 15, title: "Drill: le tre metriche a confronto",
      task: `<p>Con <code>y_test</code> e <code>pred</code> già pronti: <code>mae</code>, <code>mse</code>, <code>r2</code>.</p>`,
      setup: `import numpy as np
y_test = np.array([10.0, 15.0, 20.0, 25.0])
pred = np.array([11.0, 14.0, 22.0, 24.0])`,
      starter: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# y_test e pred sono gia' pronti

mae = ...
mse = ...
r2 = ...

print(mae, mse, r2)`,
      check: `assert abs(mae - 1.25) < 1e-9
assert abs(mse - 1.75) < 1e-9
assert r2 > 0.9`,
      hint: `<p><code>mean_absolute_error(y_test, pred)</code>, <code>mean_squared_error(y_test, pred)</code>, <code>r2_score(y_test, pred)</code>.</p>`,
      solution: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, pred)
mse = mean_squared_error(y_test, pred)
r2 = r2_score(y_test, pred)

print(mae, mse, r2)`
    },

    {
      type: "exercise", id: "sk-15", kg: 15, title: "Drill: due feature, due coefficienti",
      task: `<p>Su <code>X</code> (2 feature) e <code>y = 3*x1 - 2*x2</code> (esatto, senza rumore): addestra e leggi i due coefficienti in <code>coefficienti</code> (array).</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,1],[2,1],[1,2],[3,2],[2,3]])
y = 3*X[:,0] - 2*X[:,1]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`,
      check: `import numpy as np
assert np.allclose(coefficienti, [3.0, -2.0], atol=1e-6)`,
      hint: `<p>Con una relazione esatta (senza rumore), i coefficienti imparati coincidono esattamente con quelli veri della formula.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,1],[2,1],[1,2],[3,2],[2,3]])
y = 3*X[:,0] - 2*X[:,1]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`
    },

    {
      type: "exercise", id: "sk-16", kg: 15, title: "Drill: diagnosi con logistic regression",
      task: `<p>Sul dataset <code>breast_cancer</code> (già splittato): addestra <code>clf</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Stesso rito di sempre: crea, <code>fit</code>, <code>score</code>.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-17", kg: 15, title: "Drill: quanto è sicuro il modello?",
      task: `<p>Con <code>clf</code> già addestrato su breast_cancer: <code>proba_primo</code> (probabilità delle 2 classi per il primo caso test), <code>classe_prevista</code> (0 o 1, dalla stessa riga).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `import numpy as np
# clf, X_test: gia' pronti

proba_primo = clf.predict_proba(X_test[:1])[0]
classe_prevista = clf.predict(X_test[:1])[0]

print(proba_primo, classe_prevista)`,
      check: `import numpy as np
assert len(proba_primo) == 2
assert abs(float(np.sum(proba_primo)) - 1.0) < 1e-6
assert classe_prevista in [0, 1]`,
      hint: `<p><code>predict_proba</code> restituisce una probabilità per classe, che sommano sempre a 1.</p>`,
      solution: `import numpy as np

proba_primo = clf.predict_proba(X_test[:1])[0]
classe_prevista = clf.predict(X_test[:1])[0]

print(proba_primo, classe_prevista)`
    },

    {
      type: "exercise", id: "sk-18", kg: 20, title: "Drill: la matrice 2×2",
      task: `<p>Con <code>y_test</code> e <code>pred</code> di un classificatore binario (breast_cancer): <code>cm</code> (matrice di confusione), <code>veri_positivi</code> (cm[1,1]), <code>falsi_negativi</code> (cm[1,0]).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `from sklearn.metrics import confusion_matrix
# y_test, pred: gia' pronti

cm = confusion_matrix(y_test, pred)
veri_positivi = cm[1, 1]
falsi_negativi = cm[1, 0]

print(cm)
print(veri_positivi, falsi_negativi)`,
      check: `assert cm.shape == (2, 2)
assert veri_positivi > falsi_negativi, "Un buon classificatore deve avere piu' veri positivi che falsi negativi sulla classe 1"`,
      hint: `<p>Riga 1 = casi VERI di classe 1; colonna 0 = previsti come classe 0. <code>cm[1,0]</code> sono quindi i casi di classe 1 mancati (falsi negativi).</p>`,
      solution: `from sklearn.metrics import confusion_matrix

cm = confusion_matrix(y_test, pred)
veri_positivi = cm[1, 1]
falsi_negativi = cm[1, 0]

print(cm)
print(veri_positivi, falsi_negativi)`
    },

    {
      type: "exercise", id: "sk-19", kg: 15, title: "Drill: KNN con k=7",
      task: `<p>Su wine (già splittato): addestra un <code>KNeighborsClassifier(n_neighbors=7)</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

clf = KNeighborsClassifier(n_neighbors=7)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`,
      check: `assert 0.5 < acc < 0.85, "Senza standardizzazione il KNN su wine resta mediocre: e' lo stesso limite visto nel massimale della sala"`,
      hint: `<p>Nessuna standardizzazione qui: il risultato mediocre è atteso, non un errore tuo.</p>`,
      solution: `from sklearn.neighbors import KNeighborsClassifier

clf = KNeighborsClassifier(n_neighbors=7)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-20", kg: 15, title: "Drill: previsione su un caso singolo",
      task: `<p>Con <code>clf</code> già addestrato su breast_cancer: verifica se la previsione sul primo caso di test coincide con l'etichetta vera, in <code>corretto</code> (booleano).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `# clf, X_test, y_test: gia' pronti
previsione = clf.predict(X_test[:1])[0]
vera = y_test[0]
corretto = (previsione == vera)

print(previsione, vera, corretto)`,
      check: `assert 'corretto' in globals() and isinstance(bool(corretto), bool)
assert bool(corretto) == True`,
      hint: `<p>Confrontare previsione singola con etichetta vera è l'atomo base di ogni metrica di classificazione.</p>`,
      solution: `previsione = clf.predict(X_test[:1])[0]
vera = y_test[0]
corretto = (previsione == vera)

print(previsione, vera, corretto)`
    },

    {
      type: "exercise", id: "sk-21", kg: 15, title: "Drill: Naive Bayes su wine",
      task: `<p>Su wine (già splittato): addestra <code>GaussianNB</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.naive_bayes import GaussianNB
# X_train, X_test, y_train, y_test: gia' pronti

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9, "Naive Bayes, a differenza del KNN, non ha bisogno di scaling: deve andare bene anche sui dati grezzi"`,
      hint: `<p>Nota il contrasto con l'esercizio precedente: stesso dataset grezzo, ma Naive Bayes non soffre della mancanza di scaling come il KNN.</p>`,
      solution: `from sklearn.naive_bayes import GaussianNB

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-22", kg: 20, title: "Drill: precisione e richiamo su diagnosi",
      task: `<p>Con <code>y_test</code> e <code>pred</code> (breast_cancer): <code>precision</code>, <code>recall</code>, <code>f1</code> (senza <code>average</code>: qui la classe positiva è già binaria, 0/1).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score
# y_test, pred: gia' pronti

precision = ...
recall = ...
f1 = ...

print(precision, recall, f1)`,
      check: `assert precision > 0.9
assert recall > 0.9
assert f1 > 0.9`,
      hint: `<p><code>precision_score(y_test, pred)</code>, <code>recall_score(y_test, pred)</code>, <code>f1_score(y_test, pred)</code> — senza <code>average</code>, funzionano solo su classificazione binaria (2 classi), come qui.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, pred)
recall = recall_score(y_test, pred)
f1 = f1_score(y_test, pred)

print(precision, recall, f1)`
    },

    {
      type: "exercise", id: "sk-23", kg: 20, title: "Drill: SVM lineare su iris",
      task: `<p>Su iris (già splittato): addestra <code>SVC(kernel="linear")</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.svm import SVC
# X_train, X_test, y_train, y_test: gia' pronti

svm = SVC(kernel="linear")
svm.fit(X_train, y_train)
acc = svm.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p><code>kernel="linear"</code> cerca un confine dritto tra le classi, invece della curva di <code>"rbf"</code> visto nel massimale della sala precedente.</p>`,
      solution: `from sklearn.svm import SVC

svm = SVC(kernel="linear")
svm.fit(X_train, y_train)
acc = svm.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-24", kg: 20, title: "Combo: tre modelli, un dataset",
      task: `<p>Su breast_cancer (già splittato): addestra <code>LogisticRegression</code>, <code>GaussianNB</code>, <code>SVC</code> di default, salva le tre accuratezze in <code>risultati</code> (dizionario).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
risultati["logistic"] = LogisticRegression(max_iter=5000).fit(X_train, y_train).score(X_test, y_test)
risultati["naive_bayes"] = GaussianNB().fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = SVC().fit(X_train, y_train).score(X_test, y_test)

print(risultati)`,
      check: `assert set(risultati.keys()) == {"logistic", "naive_bayes", "svm"}
assert all(v > 0.85 for v in risultati.values())`,
      hint: `<p>Puoi incatenare <code>.fit(...).score(...)</code> in una riga sola quando non ti serve tenere il modello per altro.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC

risultati = {}
risultati["logistic"] = LogisticRegression(max_iter=5000).fit(X_train, y_train).score(X_test, y_test)
risultati["naive_bayes"] = GaussianNB().fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = SVC().fit(X_train, y_train).score(X_test, y_test)

print(risultati)`
    },

    {
      type: "exercise", id: "sk-25", kg: 20, title: "Combo: il coefficiente più pesante",
      task: `<p>Su breast_cancer: addestra la logistic regression, trova <code>feature_top</code> (nome della feature col coefficiente più grande in valore assoluto), usando <code>data.feature_names</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
nomi = list(_bc.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `import numpy as np
from sklearn.linear_model import LogisticRegression
# X_train, y_train, nomi: gia' pronti

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)

feature_top = nomi[np.argmax(np.abs(clf.coef_[0]))]
print(feature_top)`,
      check: `assert feature_top in nomi`,
      hint: `<p><code>clf.coef_[0]</code> (non <code>clf.coef_</code> da solo) perché nella classificazione binaria scikit-learn restituisce una matrice con una sola riga.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)

feature_top = nomi[np.argmax(np.abs(clf.coef_[0]))]
print(feature_top)`
    },

    {
      type: "exercise", id: "sk-26", kg: 25, title: "Combo: funzione di diagnosi",
      task: `<p>Scrivi <code>diagnosi(riga, modello)</code>: restituisce <code>"maligno"</code> se <code>modello.predict([riga])[0] == 0</code>, altrimenti <code>"benigno"</code> (nel dataset, 0=maligno, 1=benigno). Applicala alle prime 3 righe di test, salvando in <code>diagnosi_prime3</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `# clf, X_test: gia' pronti

def diagnosi(riga, modello):
    previsione = modello.predict([riga])[0]
    return "maligno" if previsione == 0 else "benigno"

diagnosi_prime3 = [diagnosi(X_test[i], clf) for i in range(3)]
print(diagnosi_prime3)`,
      check: `assert len(diagnosi_prime3) == 3
assert all(d in ["maligno", "benigno"] for d in diagnosi_prime3)`,
      hint: `<p><code>modello.predict([riga])</code> vuole una LISTA di righe anche per una sola previsione — da qui le parentesi quadre attorno a <code>riga</code>.</p>`,
      solution: `def diagnosi(riga, modello):
    previsione = modello.predict([riga])[0]
    return "maligno" if previsione == 0 else "benigno"

diagnosi_prime3 = [diagnosi(X_test[i], clf) for i in range(3)]
print(diagnosi_prime3)`
    },

    {
      type: "exercise", id: "sk-27", kg: 25, title: "Combo: soglia di decisione personalizzata",
      task: `<p>Di solito <code>predict</code> usa soglia 0.5 sulla probabilità. Scrivi <code>predici_con_soglia(modello, X, soglia)</code>: restituisce 1 se <code>predict_proba(X)[:,1] >= soglia</code>, altrimenti 0 (array). Confronta con <code>predict</code> normale usando <code>soglia=0.5</code>: deve dare lo stesso risultato.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `import numpy as np
# clf, X_test: gia' pronti

def predici_con_soglia(modello, X, soglia):
    proba_classe1 = modello.predict_proba(X)[:, 1]
    return (proba_classe1 >= soglia).astype(int)

standard = clf.predict(X_test)
con_soglia_05 = predici_con_soglia(clf, X_test, 0.5)
uguali = np.array_equal(standard, con_soglia_05)

con_soglia_alta = predici_con_soglia(clf, X_test, 0.9)
n_positivi_alta = con_soglia_alta.sum()
n_positivi_standard = standard.sum()

print(uguali, n_positivi_alta, n_positivi_standard)`,
      check: `assert uguali == True
assert n_positivi_alta <= n_positivi_standard, "Con una soglia piu' alta (0.9), il modello deve essere PIU' selettivo: meno positivi, non di piu'"`,
      hint: `<p>Alzare la soglia rende il modello più "prudente" nel dichiarare positivo: naturale che il conteggio di classe 1 non possa aumentare.</p>`,
      solution: `import numpy as np

def predici_con_soglia(modello, X, soglia):
    proba_classe1 = modello.predict_proba(X)[:, 1]
    return (proba_classe1 >= soglia).astype(int)

standard = clf.predict(X_test)
con_soglia_05 = predici_con_soglia(clf, X_test, 0.5)
uguali = np.array_equal(standard, con_soglia_05)

con_soglia_alta = predici_con_soglia(clf, X_test, 0.9)
n_positivi_alta = con_soglia_alta.sum()
n_positivi_standard = standard.sum()

print(uguali, n_positivi_alta, n_positivi_standard)`
    },

    {
      type: "exercise", id: "sk-28", kg: 25, title: "Combo: campione difficile",
      task: `<p>Trova <code>indice_incerto</code>: l'indice (in <code>X_test</code>) del caso su cui il modello è <strong>meno sicuro</strong> — quello con probabilità più vicina a 0.5 in valore assoluto di distanza (usa <code>np.abs(proba - 0.5)</code> e <code>argmin</code>).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `import numpy as np
# clf, X_test: gia' pronti

proba_classe1 = clf.predict_proba(X_test)[:, 1]
indice_incerto = np.argmin(np.abs(proba_classe1 - 0.5))

print(indice_incerto, proba_classe1[indice_incerto])`,
      check: `import numpy as np
assert 0 <= indice_incerto < len(X_test)
assert abs(proba_classe1[indice_incerto] - 0.5) == np.min(np.abs(proba_classe1 - 0.5))`,
      hint: `<p>Più la probabilità è vicina a 0.5, più il modello è "indeciso" tra le due classi: è il caso più interessante da far rivedere a un esperto umano.</p>`,
      solution: `import numpy as np

proba_classe1 = clf.predict_proba(X_test)[:, 1]
indice_incerto = np.argmin(np.abs(proba_classe1 - 0.5))

print(indice_incerto, proba_classe1[indice_incerto])`
    },

    {
      type: "exercise", id: "sk-29", kg: 25, title: "Combo: accuratezza per classe",
      task: `<p>Dalla matrice di confusione, calcola l'accuratezza <strong>separata</strong> per ciascuna classe (quanti veri di quella classe sono stati azzeccati, sul totale dei veri di quella classe): <code>acc_classe0</code>, <code>acc_classe1</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = clf.predict(X_test)`,
      starter: `from sklearn.metrics import confusion_matrix
# y_test, pred: gia' pronti

cm = confusion_matrix(y_test, pred)
acc_classe0 = cm[0, 0] / cm[0].sum()
acc_classe1 = cm[1, 1] / cm[1].sum()

print(cm)
print(acc_classe0, acc_classe1)`,
      check: `assert 0 <= acc_classe0 <= 1
assert 0 <= acc_classe1 <= 1
assert acc_classe0 > 0.8 and acc_classe1 > 0.8`,
      hint: `<p><code>cm[i].sum()</code> è il totale dei casi VERI di classe i (somma di riga); <code>cm[i, i]</code> è quanti ne sono stati azzeccati.</p>`,
      solution: `cm = confusion_matrix(y_test, pred)
acc_classe0 = cm[0, 0] / cm[0].sum()
acc_classe1 = cm[1, 1] / cm[1].sum()

print(cm)
print(acc_classe0, acc_classe1)`
    },

    {
      type: "exercise", id: "sk-30", kg: 25, title: "Massimale finale: report diagnostico completo",
      task: `<p>Metti insieme tutto: su breast_cancer (già splittato), costruisci <code>referto</code>, un dizionario con <code>"accuratezza"</code>, <code>"precisione"</code>, <code>"richiamo"</code>, <code>"f1"</code>, <code>"n_casi_test"</code>, tutti dal modello <code>clf</code> già addestrato.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score
# clf, X_test, y_test: gia' pronti

pred = clf.predict(X_test)

referto = {
    "accuratezza": clf.score(X_test, y_test),
    "precisione": precision_score(y_test, pred),
    "richiamo": recall_score(y_test, pred),
    "f1": f1_score(y_test, pred),
    "n_casi_test": len(X_test),
}

for k, v in referto.items():
    print(k, v)`,
      check: `assert set(referto.keys()) == {"accuratezza", "precisione", "richiamo", "f1", "n_casi_test"}
assert all(0 <= referto[k] <= 1 for k in ["accuratezza", "precisione", "richiamo", "f1"])
assert referto["n_casi_test"] == len(X_test)`,
      hint: `<p>Un dizionario di risultati eterogenei (metriche + conteggi) è il formato più comune per un report finale: facile da stampare, salvare in JSON, o passare ad altre funzioni.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score

pred = clf.predict(X_test)

referto = {
    "accuratezza": clf.score(X_test, y_test),
    "precisione": precision_score(y_test, pred),
    "richiamo": recall_score(y_test, pred),
    "f1": f1_score(y_test, pred),
    "n_casi_test": len(X_test),
}

for k, v in referto.items():
    print(k, v)`
    },

    {
      type: "exercise", id: "sk-31", kg: 10, title: "Drill: un'altra retta perfetta",
      task: `<p>Su <code>X, y</code> (relazione perfettamente lineare y=2x+1): <code>pendenza</code>, <code>intercetta</code>, <code>previsione_20</code>.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[2],[4],[6],[8]])
y = np.array([5,9,13,17])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_20 = float(model.predict([[20]])[0])

print(pendenza, intercetta, previsione_20)`,
      check: `assert abs(pendenza - 2.0) < 1e-6
assert abs(intercetta - 1.0) < 1e-6
assert abs(previsione_20 - 41.0) < 1e-6`,
      hint: `<p>Con dati perfettamente lineari, coefficiente e intercetta ricostruiscono esattamente 2 e 1.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[2],[4],[6],[8]])
y = np.array([5,9,13,17])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_20 = float(model.predict([[20]])[0])

print(pendenza, intercetta, previsione_20)`
    },

    {
      type: "exercise", id: "sk-32", kg: 10, title: "Drill: split con un'altra proporzione",
      task: `<p>Su 100 osservazioni, con <code>test_size=0.3</code> e <code>random_state=2</code>: <code>n_train</code> e <code>n_test</code>.</p>`,
      starter: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(200).reshape(100, 2)
ys = np.arange(100)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.3, random_state=2)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`,
      check: `assert n_train == 70
assert n_test == 30`,
      hint: `<p>Con 100 righe e <code>test_size=0.3</code>: 30 al test, 70 al train.</p>`,
      solution: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(200).reshape(100, 2)
ys = np.arange(100)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.3, random_state=2)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`
    },

    {
      type: "exercise", id: "sk-33", kg: 15, title: "Drill: le tre metriche, altri numeri",
      task: `<p>Con <code>y_test</code> e <code>pred</code> già pronti: <code>mae</code>, <code>mse</code>, <code>r2</code>.</p>`,
      setup: `import numpy as np
y_test = np.array([5.0, 10.0, 15.0, 20.0])
pred = np.array([6.0, 9.0, 17.0, 19.0])`,
      starter: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# y_test e pred sono gia' pronti

mae = ...
mse = ...
r2 = ...

print(mae, mse, r2)`,
      check: `assert abs(mae - 1.25) < 1e-9
assert abs(mse - 1.75) < 1e-9
assert r2 > 0.9`,
      hint: `<p><code>mean_absolute_error</code>, <code>mean_squared_error</code>, <code>r2_score</code> — stessa firma di sempre.</p>`,
      solution: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, pred)
mse = mean_squared_error(y_test, pred)
r2 = r2_score(y_test, pred)

print(mae, mse, r2)`
    },

    {
      type: "exercise", id: "sk-34", kg: 15, title: "Drill: coefficienti esatti, altra formula",
      task: `<p>Su <code>X</code> (2 feature) e <code>y = 5*x1 - x2</code> (esatto): leggi i due coefficienti in <code>coefficienti</code>.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,2],[2,2],[3,1],[4,3],[2,1]])
y = 5*X[:,0] - X[:,1]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`,
      check: `import numpy as np
assert np.allclose(coefficienti, [5.0, -1.0], atol=1e-6)`,
      hint: `<p>Relazione esatta, senza rumore: i coefficienti coincidono con quelli veri della formula.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,2],[2,2],[3,1],[4,3],[2,1]])
y = 5*X[:,0] - X[:,1]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`
    },

    {
      type: "exercise", id: "sk-35", kg: 15, title: "Drill: diagnosi con logistic regression v2",
      task: `<p>Sul dataset <code>breast_cancer</code> (già splittato, split diverso dai precedenti): addestra <code>clf</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=3, stratify=_bc.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Stesso rito di sempre: crea, fit, score.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=5000)
clf.fit(X_train, y_train)
acc = clf.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-36", kg: 20, title: "Drill: un'altra matrice di confusione",
      task: `<p>Un classificatore su iris è già addestrato (split diverso). Calcola <code>cm</code>, <code>azzeccati</code>, <code>errori</code>, <code>acc_a_mano</code> (deve coincidere con <code>accuracy_score</code>).</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=3, stratify=_iris.target)
_clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score
# y_test e pred sono gia' pronti

cm = ...
azzeccati = ...
errori = ...
acc_a_mano = ...

print(cm)
print(azzeccati, errori, acc_a_mano)`,
      check: `import numpy as np
from sklearn.metrics import accuracy_score
assert cm.shape == (3, 3)
assert int(azzeccati) == int(np.trace(cm))
assert int(errori) == int(cm.sum() - np.trace(cm))
assert abs(float(acc_a_mano) - float(accuracy_score(y_test, pred))) < 1e-9`,
      hint: `<p><code>np.trace(cm)</code> per la diagonale, <code>cm.sum()</code> per il totale.</p>`,
      solution: `import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score

cm = confusion_matrix(y_test, pred)
azzeccati = int(np.trace(cm))
errori = int(cm.sum() - np.trace(cm))
acc_a_mano = azzeccati / cm.sum()

print(cm)
print(azzeccati, errori, acc_a_mano)`
    },

    {
      type: "exercise", id: "sk-37", kg: 20, title: "Drill: torneo dei k, altri valori",
      task: `<p>Su iris (già splittato), confronta k in <code>[3, 7, 20]</code>: <code>accuratezze</code> (dizionario), <code>k_migliore</code>, <code>acc_migliore</code>.</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=7, stratify=_iris.target)`,
      starter: `from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

accuratezze = {}
for k in [3, 7, 20]:
    ...

k_migliore = ...
acc_migliore = ...

print(accuratezze)
print(k_migliore, acc_migliore)`,
      check: `assert isinstance(accuratezze, dict) and sorted(accuratezze.keys()) == [3, 7, 20]
assert all(0.5 < v <= 1.0 for v in accuratezze.values())
assert abs(float(acc_migliore) - accuratezze[k_migliore]) < 1e-12`,
      hint: `<p>Nel ciclo: <code>KNeighborsClassifier(n_neighbors=k)</code>, fit, <code>accuratezze[k] = clf.score(X_test, y_test)</code>.</p>`,
      solution: `from sklearn.neighbors import KNeighborsClassifier

accuratezze = {}
for k in [3, 7, 20]:
    clf = KNeighborsClassifier(n_neighbors=k)
    clf.fit(X_train, y_train)
    accuratezze[k] = clf.score(X_test, y_test)

k_migliore = max(accuratezze, key=accuratezze.get)
acc_migliore = accuratezze[k_migliore]

print(accuratezze)
print(k_migliore, acc_migliore)`
    },

    {
      type: "exercise", id: "sk-38", kg: 15, title: "Drill: Naive Bayes su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): addestra <code>GaussianNB</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=2, stratify=_bc.target)`,
      starter: `from sklearn.naive_bayes import GaussianNB
# X_train, X_test, y_train, y_test: gia' pronti

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.85`,
      hint: `<p>Stesso rito: crea, fit, score — solo l'import cambia.</p>`,
      solution: `from sklearn.naive_bayes import GaussianNB

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-39", kg: 20, title: "Drill: precision/recall macro su iris",
      task: `<p>Con <code>y_test</code> e <code>pred</code> di un classificatore su iris: <code>precision</code>, <code>recall</code>, <code>f1</code> (tutte con <code>average="macro"</code>).</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)
_clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score
# y_test, pred: gia' pronti

precision = ...
recall = ...
f1 = ...

print(precision, recall, f1)`,
      check: `assert precision > 0.85
assert recall > 0.85
assert f1 > 0.85`,
      hint: `<p><code>precision_score(y_test, pred, average="macro")</code> e analoghe per recall e f1.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, pred, average="macro")
recall = recall_score(y_test, pred, average="macro")
f1 = f1_score(y_test, pred, average="macro")

print(precision, recall, f1)`
    },

    {
      type: "exercise", id: "sk-40", kg: 20, title: "Drill: SVM con pipeline su iris",
      task: `<p>Su iris (già splittato): pipeline <code>StandardScaler</code> + <code>SVC(kernel="rbf")</code>, calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p><code>make_pipeline</code> incatena scaler e modello in un solo oggetto con <code>fit</code>/<code>score</code>.</p>`,
      solution: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-41", kg: 25, title: "Massimale: report di regressione su diabetes",
      task: `<p>Su diabetes (già splittato): costruisci <code>referto</code>, un dizionario con <code>"r2"</code>, <code>"mae"</code>, <code>"feature_top"</code> (nome della feature col coefficiente più grande in valore assoluto).</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
_data = load_diabetes()
nomi = list(_data.feature_names)
X_train, X_test, y_train, y_test = train_test_split(_data.data, _data.target, test_size=0.25, random_state=1)`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
# X_train, X_test, y_train, y_test, nomi: gia' pronti

model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)

referto = {
    "r2": model.score(X_test, y_test),
    "mae": mean_absolute_error(y_test, pred),
    "feature_top": nomi[int(np.argmax(np.abs(model.coef_)))],
}

print(referto)`,
      check: `assert set(referto.keys()) == {"r2", "mae", "feature_top"}
assert 0.3 < referto["r2"] < 0.7
assert referto["mae"] > 0
assert referto["feature_top"] in nomi`,
      hint: `<p>Stessa logica dell'esercizio "chi solleva davvero il peso" di questa sala, riassunta in un dizionario.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)

referto = {
    "r2": model.score(X_test, y_test),
    "mae": mean_absolute_error(y_test, pred),
    "feature_top": nomi[int(np.argmax(np.abs(model.coef_)))],
}

print(referto)`
    },

    {
      type: "exercise", id: "sk-42", kg: 10, title: "Drill: retta con intercetta negativa",
      task: `<p>Su <code>X, y</code> (y=2x-3): <code>pendenza</code>, <code>intercetta</code>, <code>previsione_10</code>.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4]])
y = np.array([-1,1,3,5])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_10 = float(model.predict([[10]])[0])

print(pendenza, intercetta, previsione_10)`,
      check: `assert abs(pendenza - 2.0) < 1e-6
assert abs(intercetta - (-3.0)) < 1e-6
assert abs(previsione_10 - 17.0) < 1e-6`,
      hint: `<p>Un'intercetta negativa è perfettamente normale: significa che la retta interseca l'asse y sotto lo zero.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4]])
y = np.array([-1,1,3,5])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])
intercetta = float(model.intercept_)
previsione_10 = float(model.predict([[10]])[0])

print(pendenza, intercetta, previsione_10)`
    },

    {
      type: "exercise", id: "sk-43", kg: 15, title: "Combo: split, addestra, valuta in un flusso",
      task: `<p>Su <code>X, y</code> sintetici (100 righe): split con <code>test_size=0.2</code> e <code>random_state=4</code>, addestra <code>model</code>, calcola <code>r2_test</code>.</p>`,
      setup: `import numpy as np
rng = np.random.default_rng(4)
X = rng.uniform(0, 10, size=(100, 2))
y = 2 * X[:, 0] + 3 * X[:, 1] + 1 + rng.normal(0, 1.0, size=100)`,
      starter: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
# X, y: gia' pronti

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4)
model = LinearRegression().fit(X_train, y_train)
r2_test = model.score(X_test, y_test)

print(r2_test)`,
      check: `assert r2_test > 0.9`,
      hint: `<p>Con rumore basso e relazione quasi lineare, l'R² sul test deve restare alto.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4)
model = LinearRegression().fit(X_train, y_train)
r2_test = model.score(X_test, y_test)

print(r2_test)`
    },

    {
      type: "exercise", id: "sk-44", kg: 15, title: "Drill: metriche con errori diversi",
      task: `<p>Con <code>y_test</code> e <code>pred</code> già pronti: <code>mae</code>, <code>mse</code>.</p>`,
      setup: `import numpy as np
y_test = np.array([100.0, 200.0, 300.0])
pred = np.array([110.0, 190.0, 305.0])`,
      starter: `from sklearn.metrics import mean_absolute_error, mean_squared_error
# y_test e pred sono gia' pronti

mae = ...
mse = ...

print(mae, mse)`,
      check: `assert abs(mae - 8.333333333333334) < 1e-6
assert abs(mse - 75.0) < 1e-6`,
      hint: `<p>Errori: 10, 10, 5 → MAE = 25/3. Errori al quadrato: 100, 100, 25 → MSE = 225/3.</p>`,
      solution: `from sklearn.metrics import mean_absolute_error, mean_squared_error

mae = mean_absolute_error(y_test, pred)
mse = mean_squared_error(y_test, pred)

print(mae, mse)`
    },

    {
      type: "exercise", id: "sk-45", kg: 15, title: "Drill: tre feature, tre coefficienti",
      task: `<p>Su <code>X</code> (3 feature) e <code>y = x1 + 2*x2 - 3*x3</code> (esatto): <code>coefficienti</code>.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,1,1],[2,1,0],[0,2,1],[3,0,2],[1,3,1],[2,2,2]])
y = X[:,0] + 2*X[:,1] - 3*X[:,2]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`,
      check: `import numpy as np
assert np.allclose(coefficienti, [1.0, 2.0, -3.0], atol=1e-6)`,
      hint: `<p>Con tre feature e relazione esatta, i tre coefficienti coincidono con quelli della formula.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1,1,1],[2,1,0],[0,2,1],[3,0,2],[1,3,1],[2,2,2]])
y = X[:,0] + 2*X[:,1] - 3*X[:,2]

model = LinearRegression().fit(X, y)
coefficienti = model.coef_

print(coefficienti)`
    },

    {
      type: "exercise", id: "sk-46", kg: 15, title: "Drill: report testuale su wine",
      task: `<p>Su wine (già splittato): <code>report_testo</code>, la stringa di <code>classification_report</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = clf.predict(X_test)`,
      starter: `from sklearn.metrics import classification_report
# y_test, pred: gia' pronti

report_testo = classification_report(y_test, pred)
print(report_testo)`,
      check: `assert "precision" in report_testo
assert "recall" in report_testo`,
      hint: `<p><code>classification_report</code> restituisce direttamente una stringa formattata, non un dizionario o un numero.</p>`,
      solution: `from sklearn.metrics import classification_report

report_testo = classification_report(y_test, pred)
print(report_testo)`
    },

    {
      type: "exercise", id: "sk-47", kg: 20, title: "Combo: accuratezza per classe su wine",
      task: `<p>Dalla matrice di confusione di un classificatore su wine (3 classi): calcola l'accuratezza per la classe 0, <code>acc_classe0</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = clf.predict(X_test)`,
      starter: `from sklearn.metrics import confusion_matrix
# y_test, pred: gia' pronti

cm = confusion_matrix(y_test, pred)
acc_classe0 = cm[0, 0] / cm[0].sum()

print(cm)
print(acc_classe0)`,
      check: `assert 0 <= acc_classe0 <= 1
assert acc_classe0 > 0.8`,
      hint: `<p><code>cm[0].sum()</code> è il totale dei veri di classe 0; <code>cm[0,0]</code> quanti ne sono stati azzeccati.</p>`,
      solution: `cm = confusion_matrix(y_test, pred)
acc_classe0 = cm[0, 0] / cm[0].sum()

print(cm)
print(acc_classe0)`
    },

    {
      type: "exercise", id: "sk-48", kg: 20, title: "Combo: KNN vs logistic su breast_cancer",
      task: `<p>Su breast_cancer (già splittato): confronta <code>acc_knn</code> (KNN default) e <code>acc_log</code> (logistic), in <code>differenza</code>.</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)`,
      starter: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti

knn = KNeighborsClassifier().fit(X_train, y_train)
acc_knn = knn.score(X_test, y_test)

log_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
acc_log = log_clf.score(X_test, y_test)

differenza = acc_log - acc_knn
print(acc_knn, acc_log, differenza)`,
      check: `assert 0.7 < acc_knn <= 1.0
assert acc_log > 0.9
assert abs(differenza - (acc_log - acc_knn)) < 1e-12`,
      hint: `<p>Anche senza scaling, breast_cancer ha scale meno estreme di wine: il KNN non crolla del tutto, ma la logistic resta più forte.</p>`,
      solution: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression

knn = KNeighborsClassifier().fit(X_train, y_train)
acc_knn = knn.score(X_test, y_test)

log_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
acc_log = log_clf.score(X_test, y_test)

differenza = acc_log - acc_knn
print(acc_knn, acc_log, differenza)`
    },

    {
      type: "exercise", id: "sk-49", kg: 20, title: "Combo: tre modelli su wine con scaler",
      task: `<p>Su wine (già splittato): confronta <code>LogisticRegression</code>, <code>GaussianNB</code>, <code>SVC</code> — tutti dentro una pipeline con <code>StandardScaler</code>. Salva le accuratezze in <code>risultati</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
risultati["logistic"] = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).score(X_test, y_test)
risultati["naive_bayes"] = make_pipeline(StandardScaler(), GaussianNB()).fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = make_pipeline(StandardScaler(), SVC()).fit(X_train, y_train).score(X_test, y_test)

print(risultati)`,
      check: `assert set(risultati.keys()) == {"logistic", "naive_bayes", "svm"}
assert all(v > 0.9 for v in risultati.values())`,
      hint: `<p>Con lo scaler dentro la pipeline, tutti e tre i modelli su wine ottengono ottimi risultati — anche quelli che senza scaler crollavano.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

risultati = {}
risultati["logistic"] = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).score(X_test, y_test)
risultati["naive_bayes"] = make_pipeline(StandardScaler(), GaussianNB()).fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = make_pipeline(StandardScaler(), SVC()).fit(X_train, y_train).score(X_test, y_test)

print(risultati)`
    },

    {
      type: "exercise", id: "sk-50", kg: 25, title: "Combo: soglia bassa, più allarmi",
      task: `<p>Riusa <code>predici_con_soglia(modello, X, soglia)</code> su breast_cancer con <code>soglia=0.3</code>: <code>n_positivi_bassa</code> deve essere <strong>maggiore o uguale</strong> di quello standard (soglia 0.5).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=1, stratify=_bc.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `import numpy as np
# clf, X_test: gia' pronti

def predici_con_soglia(modello, X, soglia):
    proba_classe1 = modello.predict_proba(X)[:, 1]
    return (proba_classe1 >= soglia).astype(int)

standard = clf.predict(X_test)
con_soglia_bassa = predici_con_soglia(clf, X_test, 0.3)

n_positivi_standard = standard.sum()
n_positivi_bassa = con_soglia_bassa.sum()

print(n_positivi_standard, n_positivi_bassa)`,
      check: `assert n_positivi_bassa >= n_positivi_standard`,
      hint: `<p>Abbassare la soglia rende il modello più "generoso" nel dichiarare positivo: il conteggio non può che salire o restare uguale.</p>`,
      solution: `def predici_con_soglia(modello, X, soglia):
    proba_classe1 = modello.predict_proba(X)[:, 1]
    return (proba_classe1 >= soglia).astype(int)

standard = clf.predict(X_test)
con_soglia_bassa = predici_con_soglia(clf, X_test, 0.3)

n_positivi_standard = standard.sum()
n_positivi_bassa = con_soglia_bassa.sum()

print(n_positivi_standard, n_positivi_bassa)`
    },

    {
      type: "exercise", id: "sk-51", kg: 25, title: "Combo: il caso più incerto su wine",
      task: `<p>Su wine (3 classi, già splittato): trova <code>indice_incerto</code>, il caso di test con la probabilità <strong>massima</strong> più bassa tra le sue 3 probabilità (il modello meno sicuro di una qualsiasi classe).</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `import numpy as np
# clf, X_test: gia' pronti

proba = clf.predict_proba(X_test)
max_proba = proba.max(axis=1)
indice_incerto = np.argmin(max_proba)

print(indice_incerto, max_proba[indice_incerto])`,
      check: `import numpy as np
assert 0 <= indice_incerto < len(X_test)
assert abs(max_proba[indice_incerto] - np.min(max_proba)) < 1e-9`,
      hint: `<p><code>proba.max(axis=1)</code> dà, per ogni riga, la probabilità della classe più probabile: più è bassa, più il modello è indeciso anche sulla sua scelta migliore.</p>`,
      solution: `import numpy as np

proba = clf.predict_proba(X_test)
max_proba = proba.max(axis=1)
indice_incerto = np.argmin(max_proba)

print(indice_incerto, max_proba[indice_incerto])`
    },

    {
      type: "exercise", id: "sk-52", kg: 25, title: "Combo: accuratezza per classe su iris",
      task: `<p>Su iris (3 classi, già splittato): calcola l'accuratezza per ciascuna delle 3 classi in <code>acc_per_classe</code> (lista di 3 float).</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = clf.predict(X_test)`,
      starter: `from sklearn.metrics import confusion_matrix
# y_test, pred: gia' pronti

cm = confusion_matrix(y_test, pred)
acc_per_classe = [cm[i, i] / cm[i].sum() for i in range(3)]

print(cm)
print(acc_per_classe)`,
      check: `assert len(acc_per_classe) == 3
assert all(0 <= a <= 1 for a in acc_per_classe)
assert all(a > 0.7 for a in acc_per_classe)`,
      hint: `<p>Una list comprehension che ripete <code>cm[i,i]/cm[i].sum()</code> per ogni riga della matrice.</p>`,
      solution: `cm = confusion_matrix(y_test, pred)
acc_per_classe = [cm[i, i] / cm[i].sum() for i in range(3)]

print(cm)
print(acc_per_classe)`
    },

    {
      type: "exercise", id: "sk-53", kg: 25, title: "Massimale finale: report multiclasse su wine",
      task: `<p>Su wine (già splittato): costruisci <code>referto</code> con <code>"accuratezza"</code>, <code>"precisione"</code>, <code>"richiamo"</code>, <code>"f1"</code> (tutte macro), <code>"n_casi_test"</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)
clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score
# clf, X_test, y_test: gia' pronti

pred = clf.predict(X_test)

referto = {
    "accuratezza": clf.score(X_test, y_test),
    "precisione": precision_score(y_test, pred, average="macro"),
    "richiamo": recall_score(y_test, pred, average="macro"),
    "f1": f1_score(y_test, pred, average="macro"),
    "n_casi_test": len(X_test),
}

for k, v in referto.items():
    print(k, v)`,
      check: `assert set(referto.keys()) == {"accuratezza", "precisione", "richiamo", "f1", "n_casi_test"}
assert all(0 <= referto[k] <= 1 for k in ["accuratezza", "precisione", "richiamo", "f1"])
assert referto["n_casi_test"] == len(X_test)`,
      hint: `<p>Con più di 2 classi, precision/recall/f1 richiedono <code>average="macro"</code> (o un'altra strategia di media) — senza, scikit-learn solleva un errore.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score

pred = clf.predict(X_test)

referto = {
    "accuratezza": clf.score(X_test, y_test),
    "precisione": precision_score(y_test, pred, average="macro"),
    "richiamo": recall_score(y_test, pred, average="macro"),
    "f1": f1_score(y_test, pred, average="macro"),
    "n_casi_test": len(X_test),
}

for k, v in referto.items():
    print(k, v)`
    },

    {
      type: "exercise", id: "sk-54", kg: 10, title: "Drill: dimensioni dello split, terza versione",
      task: `<p>Su 150 osservazioni, con <code>test_size=0.4</code> e <code>random_state=9</code>: <code>n_train</code> e <code>n_test</code>.</p>`,
      starter: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(300).reshape(150, 2)
ys = np.arange(150)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.4, random_state=9)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`,
      check: `assert n_train == 90
assert n_test == 60`,
      hint: `<p>Con 150 righe e <code>test_size=0.4</code>: 60 al test, 90 al train.</p>`,
      solution: `from sklearn.model_selection import train_test_split
import numpy as np

Xs = np.arange(300).reshape(150, 2)
ys = np.arange(150)

Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.4, random_state=9)
n_train = len(Xtr)
n_test = len(Xte)

print(n_train, n_test)`
    },

    {
      type: "exercise", id: "sk-55", kg: 15, title: "Drill: coefficiente negativo",
      task: `<p>Su <code>X, y</code> (y = -2x, esatto): <code>pendenza</code> deve venire negativa.</p>`,
      starter: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3]])
y = np.array([-2,-4,-6])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])

print(pendenza)`,
      check: `assert abs(pendenza - (-2.0)) < 1e-6
assert pendenza < 0`,
      hint: `<p>Una pendenza negativa significa che y diminuisce quando x aumenta — nessun errore, solo una relazione inversa.</p>`,
      solution: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3]])
y = np.array([-2,-4,-6])

model = LinearRegression().fit(X, y)
pendenza = float(model.coef_[0])

print(pendenza)`
    },

    {
      type: "exercise", id: "sk-56", kg: 15, title: "Drill: Naive Bayes su iris",
      task: `<p>Su iris (già splittato): addestra <code>GaussianNB</code> e calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
_iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(_iris.data, _iris.target, test_size=0.3, random_state=42, stratify=_iris.target)`,
      starter: `from sklearn.naive_bayes import GaussianNB
# X_train, X_test, y_train, y_test: gia' pronti

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.85`,
      hint: `<p>Su iris, Naive Bayes va quasi sempre molto bene: le 4 misure sono ben separate per specie.</p>`,
      solution: `from sklearn.naive_bayes import GaussianNB

nb = GaussianNB()
nb.fit(X_train, y_train)
acc = nb.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-57", kg: 20, title: "Drill: SVM lineare su wine, con scaler",
      task: `<p>Su wine (già splittato): pipeline <code>StandardScaler</code> + <code>SVC(kernel="linear")</code>, calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

pipe = make_pipeline(StandardScaler(), SVC(kernel="linear"))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Con lo scaler, anche il kernel lineare (più semplice dell'rbf) ottiene ottimi risultati su wine.</p>`,
      solution: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

pipe = make_pipeline(StandardScaler(), SVC(kernel="linear"))
pipe.fit(X_train, y_train)
acc = pipe.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "sk-58", kg: 20, title: "Combo: precision/recall su breast_cancer, altro split",
      task: `<p>Su breast_cancer (split diverso): <code>precision</code>, <code>recall</code>, <code>f1</code> (binari, senza <code>average</code>).</p>`,
      setup: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
_bc = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(_bc.data, _bc.target, test_size=0.3, random_state=8, stratify=_bc.target)
_clf = LogisticRegression(max_iter=5000).fit(X_train, y_train)
pred = _clf.predict(X_test)`,
      starter: `from sklearn.metrics import precision_score, recall_score, f1_score
# y_test, pred: gia' pronti

precision = ...
recall = ...
f1 = ...

print(precision, recall, f1)`,
      check: `assert precision > 0.85
assert recall > 0.85
assert f1 > 0.85`,
      hint: `<p>Classificazione binaria: le tre metriche funzionano senza bisogno di <code>average</code>.</p>`,
      solution: `from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, pred)
recall = recall_score(y_test, pred)
f1 = f1_score(y_test, pred)

print(precision, recall, f1)`
    },

    {
      type: "exercise", id: "sk-59", kg: 20, title: "Combo: KNN con scaler su wine, torneo dei k",
      task: `<p>Su wine (già splittato): con una pipeline <code>StandardScaler + KNeighborsClassifier</code>, confronta k in <code>[3, 5, 9]</code> in <code>accuratezze</code>, trova <code>k_migliore</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

accuratezze = {}
for k in [3, 5, 9]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    pipe.fit(X_train, y_train)
    accuratezze[k] = pipe.score(X_test, y_test)

k_migliore = max(accuratezze, key=accuratezze.get)

print(accuratezze)
print(k_migliore)`,
      check: `assert sorted(accuratezze.keys()) == [3, 5, 9]
assert all(v > 0.85 for v in accuratezze.values()), "Con lo scaler, il KNN su wine deve ottenere ottimi risultati per ogni k, a differenza della sala Base senza scaler"`,
      hint: `<p>Con lo StandardScaler dentro la pipeline, il KNN su wine smette di soffrire la scala della prolina: tutti i k testati devono ottenere ottimi risultati.</p>`,
      solution: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

accuratezze = {}
for k in [3, 5, 9]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    pipe.fit(X_train, y_train)
    accuratezze[k] = pipe.score(X_test, y_test)

k_migliore = max(accuratezze, key=accuratezze.get)

print(accuratezze)
print(k_migliore)`
    },

    {
      type: "exercise", id: "sk-60", kg: 25, title: "Massimale finale: gara a tre con scaler su wine",
      task: `<p>Su wine (già splittato): confronta <code>LogisticRegression</code>, <code>SVC</code> e <code>KNeighborsClassifier</code> (tutti con <code>StandardScaler</code>), scegli il vincitore <strong>dal codice</strong>, costruisci <code>referto</code> con <code>"vincitore"</code> e <code>"accuratezza_vincitore"</code>.</p>`,
      setup: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
_wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(_wine.data, _wine.target, test_size=0.3, random_state=5, stratify=_wine.target)`,
      starter: `from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {}
risultati["logistic"] = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = make_pipeline(StandardScaler(), SVC()).fit(X_train, y_train).score(X_test, y_test)
risultati["knn"] = make_pipeline(StandardScaler(), KNeighborsClassifier()).fit(X_train, y_train).score(X_test, y_test)

vincitore = max(risultati, key=risultati.get)

referto = {
    "vincitore": vincitore,
    "accuratezza_vincitore": risultati[vincitore],
}

print(risultati)
print(referto)`,
      check: `assert set(referto.keys()) == {"vincitore", "accuratezza_vincitore"}
assert referto["vincitore"] in {"logistic", "svm", "knn"}
assert referto["accuratezza_vincitore"] > 0.9`,
      hint: `<p><code>max(risultati, key=risultati.get)</code> trova la chiave col valore più alto in un dizionario — lo stesso trucco usato per <code>k_migliore</code> nel torneo dei k.</p>`,
      solution: `from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

risultati = {}
risultati["logistic"] = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).score(X_test, y_test)
risultati["svm"] = make_pipeline(StandardScaler(), SVC()).fit(X_train, y_train).score(X_test, y_test)
risultati["knn"] = make_pipeline(StandardScaler(), KNeighborsClassifier()).fit(X_train, y_train).score(X_test, y_test)

vincitore = max(risultati, key=risultati.get)

referto = {
    "vincitore": vincitore,
    "accuratezza_vincitore": risultati[vincitore],
}

print(risultati)
print(referto)`
    }
  ]
});
