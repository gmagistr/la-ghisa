window.MODULES.push({
  id: "explainability",
  name: "Explainability",
  tagline: "La sala a specchi: capire PERCHÉ il modello decide. Feature importance, permutation, PDP, SHAP e LIME spiegati.",
  intro: "Un modello accurato ma incomprensibile è un problema — in azienda, in tribunale, dal medico. Questa sala insegna ad aprire la scatola nera: quali feature contano, come, e per la singola predizione. Serve scikit-learn.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Perché serve l'explainability", html: `
<p>Un modello che predice bene ma non sa spiegarsi è spesso inutilizzabile: una banca deve dire PERCHÉ ha negato un prestito, un medico deve capire su cosa si basa una diagnosi, un data scientist deve fidarsi prima di mettere in produzione. L'<strong>explainability</strong> (o interpretabilità) apre la scatola nera.</p>
<p>Due grandi famiglie di domande:</p>
<ul>
<li><strong>Globale</strong>: quali feature contano di più per il modello NEL COMPLESSO? (feature importance, permutation importance, PDP)</li>
<li><strong>Locale</strong>: perché il modello ha deciso COSÌ per QUESTO caso specifico? (SHAP, LIME)</li>
</ul>
<p>E due tipi di modelli: quelli <strong>intrinsecamente interpretabili</strong> (regressione lineare, alberi poco profondi — li leggi direttamente) e quelli <strong>black-box</strong> (Random Forest, boosting, reti) che richiedono tecniche post-hoc per essere spiegati.</p>
`, more: `
<p>C'è un trade-off storico tra accuratezza e interpretabilità: i modelli più semplici (lineari, alberi corti) sono trasparenti ma spesso meno accurati; i più potenti (ensemble, reti profonde) sono accurati ma opachi. L'explainability post-hoc cerca di avere la botte piena e la moglie ubriaca — modelli potenti CON spiegazioni. Ma le spiegazioni post-hoc sono APPROSSIMAZIONI del comportamento del modello, non la verità assoluta: diverse tecniche possono dare risposte diverse sullo stesso modello, e questo va comunicato con onestà.</p>
<p>Il campo distingue interpretabilità (il modello è comprensibile per costruzione) da spiegabilità (spieghiamo a posteriori un modello opaco). In domini ad alto rischio (medicina, giustizia, credito) c'è una scuola di pensiero forte — sostenuta da ricercatrici come Cynthia Rudin — secondo cui in questi contesti si dovrebbero preferire modelli INTRINSECAMENTE interpretabili, perché le spiegazioni post-hoc di un black-box possono essere fuorvianti proprio quando le decisioni contano di più. Non è una questione tecnica ma etica e regolatoria.</p>
<p>Nota normativa che i colloqui su ruoli in finanza/assicurazioni apprezzano: il GDPR europeo prevede un "diritto alla spiegazione" per le decisioni automatizzate, e regolamenti come l'AI Act rendono l'explainability un requisito legale, non un optional. Sapere spiegare un modello non è più solo buona pratica: in molti settori è obbligatorio, e sapere QUALI tecniche reggono a un audit (SHAP con le sue basi teoriche vs euristiche più fragili) è competenza professionale concreta.</p>
` },

    {
      type: "exercise", id: "ex-01", kg: 5, title: "Globale o locale?",
      task: `<p>Classifica ogni domanda come spiegazione "globale" o "locale":</p>
<ul>
<li><code>q1</code>: "Nel complesso, quale feature pesa di più nel modello?" &rarr; "globale" o "locale"?</li>
<li><code>q2</code>: "Perché a QUESTO cliente è stato negato il prestito?" &rarr; ?</li>
<li><code>q3</code>: "Come varia la predizione media al variare dell'età?" &rarr; ?</li>
<li><code>q4</code>: "Quali feature hanno spinto verso il SÌ per il paziente n.42?" &rarr; ?</li>
</ul>`,
      starter: `q1 = ...
q2 = ...
q3 = ...
q4 = ...

print(q1, q2, q3, q4)`,
      check: `assert q1 == "globale", "q1: 'nel complesso' -> globale"
assert q2 == "locale", "q2: 'QUESTO cliente' -> locale (una singola predizione)"
assert q3 == "globale", "q3: l'effetto medio di una feature su tutto il dataset -> globale (e' il Partial Dependence Plot)"
assert q4 == "locale", "q4: 'il paziente n.42' -> locale (SHAP/LIME su un caso)"`,
      hint: `<p>Globale = comportamento del modello sull'intero dataset. Locale = spiegazione di una singola predizione. Le parole chiave "questo/quel caso specifico" segnalano il locale.</p>`,
      solution: `q1 = "globale"
q2 = "locale"
q3 = "globale"
q4 = "locale"

print(q1, q2, q3, q4)`
    },

    { type: "theory", title: "Modelli intrinsecamente interpretabili", html: `
<p>Alcuni modelli si spiegano da soli. La <strong>regressione lineare</strong>: ogni coefficiente è l'effetto di quella feature, a parità di tutto il resto.</p>
<pre><code>from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X, y)
clf.coef_        # un peso per feature: segno = direzione, modulo = forza
clf.intercept_   # il termine costante</code></pre>
<p>Un coefficiente positivo spinge verso la classe 1, negativo verso la 0. Ma attenzione: il modulo è confrontabile tra feature SOLO se le feature sono sulla stessa scala (standardizzate) — altrimenti un coefficiente grande può solo riflettere una feature con valori piccoli.</p>
<p>Anche un <strong>albero decisionale</strong> poco profondo è leggibile: segui i nodi (se età &gt; 40 e reddito &lt; 30k allora...) fino alla foglia. Sopra una certa profondità, però, diventa illeggibile quanto un black-box.</p>
`, more: `
<p>Il tranello dell'interpretazione dei coefficienti lineari: valgono "a parità di tutto il resto" (ceteris paribus), ma se le feature sono <strong>correlate tra loro</strong> questa condizione è irrealistica. Se altezza e peso sono nel modello e fortemente correlate, il coefficiente dell'altezza è "l'effetto dell'altezza tenendo il peso costante" — ma nella realtà altezza e peso variano insieme, quindi quel numero non descrive nessuno scenario osservabile. Con multicollinearità forte i coefficienti diventano instabili (grandi, di segno inatteso, sensibili a piccole variazioni dei dati) pur lasciando le predizioni invariate. Interpretare coefficienti senza controllare le correlazioni è un errore classico.</p>
<p>La standardizzazione è la chiave per confrontare l'IMPORTANZA dalle magnitudini: su feature standardizzate (media 0, std 1), un coefficiente di 0.8 conta più di uno di 0.3 perché entrambi si riferiscono a "un aumento di una deviazione standard". Su feature grezze i coefficienti hanno unità diverse (euro, anni, kg) e i loro moduli non sono confrontabili — un coefficiente di 0.001 sul reddito in euro può rappresentare un effetto enorme. Per questo, quando l'obiettivo è l'interpretazione delle importanze, si standardizza sempre prima.</p>
<p>Gli alberi decisionali offrono un tipo di interpretabilità diverso e prezioso: le <strong>regole</strong>. Un percorso radice-foglia è una regola leggibile ("se età&gt;40 E reddito&lt;30k ALLORA rischio alto"), verificabile da un esperto di dominio, e traducibile in policy. Ma l'interpretabilità crolla con la profondità (un albero da 15 livelli ha migliaia di percorsi) e con l'instabilità (piccole variazioni dei dati cambiano gli split in alto, riscrivendo l'intero albero). Per questo gli alberi singoli poco profondi sono interpretabili, ma le Random Forest — centinaia di alberi — no, e richiedono le tecniche post-hoc di questa sala.</p>
` },

    {
      type: "exercise", id: "ex-02", kg: 10, title: "Leggere i coefficienti",
      task: `<p>Addestra una regressione logistica su feature STANDARDIZZATE e interpreta i coefficienti:</p>
<ul>
<li><code>clf</code>: <code>LogisticRegression(max_iter=1000)</code> su dati standardizzati</li>
<li><code>coef</code>: i coefficienti (<code>clf.coef_[0]</code>)</li>
<li><code>feature_piu_forte</code>: l'indice della feature col coefficiente di modulo massimo</li>
<li><code>segno_positivo</code>: quante feature hanno coefficiente positivo (spingono verso la classe 1)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
data = load_breast_cancer()
X = StandardScaler().fit_transform(data.data)
y = data.target`,
      starter: `import numpy as np
from sklearn.linear_model import LogisticRegression
# X: feature standardizzate | y: target binario

clf = ...
coef = ...
feature_piu_forte = ...
segno_positivo = ...

print(f"feature piu' forte: indice {feature_piu_forte} (coef {coef[feature_piu_forte]:.2f})")
print(f"coefficienti positivi: {segno_positivo}")`,
      check: `import numpy as np
from sklearn.linear_model import LogisticRegression
_clf = LogisticRegression(max_iter=1000).fit(X, y)
_c = _clf.coef_[0]
assert 'coef' in globals() and np.allclose(coef, _c), "coef: clf.coef_[0]"
assert 'feature_piu_forte' in globals() and feature_piu_forte == int(np.argmax(np.abs(_c))), "feature_piu_forte: np.argmax(np.abs(coef))"
assert 'segno_positivo' in globals() and int(segno_positivo) == int((_c > 0).sum()), "segno_positivo: (coef > 0).sum()"`,
      hint: `<p><code>clf.coef_[0]</code> è il vettore dei pesi (per la classe 1). La più forte in assoluto: <code>np.argmax(np.abs(coef))</code>. I positivi: <code>(coef &gt; 0).sum()</code>. Contano i moduli perché le feature sono standardizzate.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=1000).fit(X, y)
coef = clf.coef_[0]
feature_piu_forte = int(np.argmax(np.abs(coef)))
segno_positivo = int((coef > 0).sum())

print(f"feature piu' forte: indice {feature_piu_forte} (coef {coef[feature_piu_forte]:.2f})")
print(f"coefficienti positivi: {segno_positivo}")`
    },

    { type: "theory", title: "Feature importance da impurità (e il suo difetto)", html: `
<p>I modelli ad alberi danno un'importanza nativa: quanto ogni feature riduce l'impurità (Gini/entropia) negli split, mediata su tutti gli alberi.</p>
<pre><code>from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier().fit(X, y)
rf.feature_importances_   # un peso per feature, sommano a 1</code></pre>
<p>Veloce e gratuita (già calcolata durante il training), ma con un difetto grave visto nella sala Feature Engineering: <strong>gonfia le feature ad alta cardinalità</strong> (molti valori distinti = più punti di split candidati). Una colonna di ID casuali, inutile, può ricevere importanza non trascurabile solo perché offre tanti split.</p>
<p>Secondo difetto: è calcolata sul <strong>training set</strong>, quindi misura quanto il modello si è AGGRAPPATO a una feature per memorizzare, non quanto quella feature generalizza. Per una misura onesta serve la permutation importance.</p>
`, more: `
<p>Il meccanismo del difetto di cardinalità: a ogni nodo, l'albero cerca lo split che riduce di più l'impurità tra TUTTI i valori candidati di TUTTE le feature. Una feature continua o ad alta cardinalità offre molti più punti di taglio, quindi ha più probabilità di "vincere" uno split per puro caso, anche se non è predittiva. Questa importanza spuria si accumula su centinaia di alberi. È un bias sistematico, non rumore: si può riprodurre in modo affidabile (come farai in un esercizio) aggiungendo una colonna di rumore continuo e vedendola ricevere importanza.</p>
<p>Il difetto del training set è più sottile ma altrettanto grave. L'importanza da impurità premia le feature su cui il modello ha splittato tanto — incluse quelle usate per memorizzare il rumore del training (overfitting). Una feature che il modello usa per adattarsi a peculiarità del training set riceve alta importanza da impurità pur non aiutando affatto sui dati nuovi. Per questo l'importanza da impurità può indicare come feature "importanti" proprio quelle che causano overfitting — l'opposto di ciò che vuoi sapere.</p>
<p>Quando l'importanza da impurità va comunque bene: come strumento RAPIDO ed ESPLORATIVO per farsi un'idea iniziale, o quando le feature sono tutte sulla stessa scala di cardinalità e il modello non overfitta. Ma per decisioni, comunicazione a stakeholder, o feature selection seria, è da affiancare o sostituire con la permutation importance (calcolata sul test) o SHAP. La regola pratica: usa l'importanza da impurità per un primo sguardo gratis, verifica sempre con un metodo più robusto prima di trarne conclusioni.</p>
` },

    {
      type: "exercise", id: "ex-03", kg: 15, title: "Il difetto della cardinalità, di nuovo",
      task: `<p>Riproduci il difetto: aggiungi a un dataset una colonna di ID casuali (alta cardinalità, zero segnale) e guarda l'importanza da impurità dargli peso:</p>
<ul>
<li><code>X_esteso</code>: X con in più una colonna di valori casuali continui tutti distinti</li>
<li><code>rf</code>: RandomForest addestrata su X_esteso</li>
<li><code>imp_id</code>: l'importanza da impurità della colonna ID (l'ultima)</li>
<li><code>id_ruba_importanza</code>: <code>True</code> se imp_id &gt; 0.03 (pur essendo puro rumore)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=500, n_features=5, n_informative=3, random_state=0)
rng = np.random.default_rng(0)`,
      starter: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
# X: 5 feature | rng: generatore pronto

id_casuali = rng.random(X.shape[0]).reshape(-1, 1)   # valori tutti diversi, zero segnale
X_esteso = ...

rf = RandomForestClassifier(random_state=0).fit(X_esteso, y)
imp_id = ...
id_ruba_importanza = ...

print("importanze:", np.round(rf.feature_importances_, 3))
print(f"importanza dell'ID (rumore puro): {imp_id:.3f}")`,
      check: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
_id = np.random.default_rng(0).random(X.shape[0]).reshape(-1,1)
_xe = np.column_stack([X, _id])
_rf = RandomForestClassifier(random_state=0).fit(_xe, y)
assert 'X_esteso' in globals() and np.asarray(X_esteso).shape == (500, 6), "X_esteso: np.column_stack([X, id_casuali])"
assert 'imp_id' in globals() and abs(float(imp_id) - _rf.feature_importances_[-1]) < 1e-6, "imp_id: rf.feature_importances_[-1]"
assert 'id_ruba_importanza' in globals() and id_ruba_importanza == True, "id_ruba_importanza: True — l'ID casuale ruba importanza per la sua alta cardinalita', pur non predicendo nulla"`,
      hint: `<p><code>np.column_stack([X, id_casuali])</code>. La colonna ID ha 500 valori distinti = tanti split candidati = importanza gonfiata. <code>id_ruba_importanza = imp_id &gt; 0.03</code>.</p>`,
      solution: `import numpy as np
from sklearn.ensemble import RandomForestClassifier

id_casuali = rng.random(X.shape[0]).reshape(-1, 1)
X_esteso = np.column_stack([X, id_casuali])

rf = RandomForestClassifier(random_state=0).fit(X_esteso, y)
imp_id = rf.feature_importances_[-1]
id_ruba_importanza = imp_id > 0.03

print("importanze:", np.round(rf.feature_importances_, 3))
print(f"importanza dell'ID (rumore puro): {imp_id:.3f}")`
    },

    { type: "theory", title: "Permutation importance", html: `
<p>La <strong>permutation importance</strong> misura l'importanza in modo diretto e onesto: prendi una feature, <em>mescola</em> i suoi valori (rompendo il legame con il target) e vedi di quanto peggiora il modello. Se peggiora tanto, la feature era importante; se non cambia nulla, era inutile.</p>
<pre><code>from sklearn.inspection import permutation_importance
r = permutation_importance(modello, X_test, y_test, n_repeats=10, random_state=0)
r.importances_mean   # calo medio di performance per feature
r.importances_std    # variabilita' su piu' permutazioni</code></pre>
<p>Vantaggi decisivi: (1) funziona con QUALSIASI modello (model-agnostic); (2) va calcolata sul <strong>test set</strong>, quindi misura la generalizzazione, non la memorizzazione; (3) non soffre il bias di cardinalità dell'importanza da impurità. È lo standard per l'importanza globale onesta.</p>
`, more: `
<p>Perché il test set: permutare una feature sul TRAIN e vedere il modello peggiorare misura quanto il modello DIPENDE da quella feature per riprodurre il training (inclusa la memorizzazione). Sul TEST misura quanto quella feature contribuisce alla GENERALIZZAZIONE — l'unica cosa che conta davvero. Una feature che il modello ha overfittato peggiora tanto se permutata sul train ma poco sul test: la differenza tra le due è essa stessa un segnale di overfitting su quella feature.</p>
<p>Il tallone d'Achille della permutation importance sono le <strong>feature correlate</strong>. Se due feature sono fortemente correlate e ne permuti una sola, il modello può ancora recuperare l'informazione dall'altra — così ENTRAMBE risultano poco importanti, anche se insieme sono cruciali. Peggio: permutare crea combinazioni di valori irrealistiche (una casa di 20 mq con 8 stanze) su cui il modello non è mai stato addestrato, producendo cali di performance dovuti all'extrapolazione più che alla vera importanza. Con feature correlate si usano varianti (permutazione a gruppi, conditional permutation importance) o direttamente SHAP.</p>
<p>Il parametro <code>n_repeats</code> è importante perché la permutazione è casuale: ripeterla più volte dà una media stabile E una deviazione standard che quantifica l'incertezza. Una feature con importanza media 0.05±0.04 è molto meno affidabile di una 0.05±0.005 — la variabilità va guardata, non solo la media, esattamente come per i punteggi di cross-validation. Riportare la permutation importance senza la sua std è come riportare una stima senza intervallo di confidenza.</p>
` },

    {
      type: "exercise", id: "ex-04", kg: 15, title: "Mescolare per misurare",
      task: `<p>Calcola la permutation importance sul TEST set e confrontala con quella da impurità:</p>
<ul>
<li><code>perm</code>: risultato di <code>permutation_importance</code> sul test (n_repeats=10, random_state=0)</li>
<li><code>imp_perm</code>: le importanze medie (<code>perm.importances_mean</code>)</li>
<li><code>top_perm</code>: l'indice della feature più importante secondo la permutazione</li>
<li><code>top_tra_informative</code>: <code>True</code> se top_perm è tra le prime 3 (le vere informative)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=600, n_features=6, n_informative=3,
                            n_redundant=0, shuffle=False, random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(X_train, y_train)`,
      starter: `import numpy as np
from sklearn.inspection import permutation_importance
# rf: gia' addestrata | X_test, y_test: test set

perm = ...
imp_perm = ...
top_perm = ...
top_tra_informative = ...

print("permutation importance:", np.round(imp_perm, 3))
print("feature top:", top_perm)`,
      check: `import numpy as np
from sklearn.inspection import permutation_importance
_p = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
assert 'imp_perm' in globals() and np.allclose(imp_perm, _p.importances_mean), "imp_perm: perm.importances_mean"
assert 'top_perm' in globals() and top_perm == int(np.argmax(_p.importances_mean)), "top_perm: np.argmax(imp_perm)"
assert 'top_tra_informative' in globals() and top_tra_informative == True, "top_tra_informative: True — la permutazione trova una delle prime 3 feature (informative) come piu' importante"`,
      hint: `<p><code>permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)</code>. Le medie: <code>perm.importances_mean</code>. Sul TEST, quindi misura la generalizzazione. <code>top_tra_informative = top_perm in [0,1,2]</code>.</p>`,
      solution: `import numpy as np
from sklearn.inspection import permutation_importance

perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
imp_perm = perm.importances_mean
top_perm = int(np.argmax(imp_perm))
top_tra_informative = top_perm in [0, 1, 2]

print("permutation importance:", np.round(imp_perm, 3))
print("feature top:", top_perm)`
    },

    {
      type: "exercise", id: "ex-05", kg: 20, title: "Impurità vs permutazione: il verdetto",
      task: `<p>Con una feature rumore ad alta cardinalità nel dataset, mostra che la permutazione la smaschera mentre l'impurità le dà credito:</p>
<ul>
<li><code>imp_gini_rumore</code>: importanza da impurità della colonna rumore (ultima)</li>
<li><code>imp_perm_rumore</code>: permutation importance media della colonna rumore (sul test)</li>
<li><code>permutazione_piu_onesta</code>: <code>True</code> se l'importanza da permutazione del rumore è più vicina a zero di quella da impurità (<code>imp_perm_rumore &lt; imp_gini_rumore</code>)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=800, n_features=5, n_informative=3, shuffle=False, random_state=2)
rng = np.random.default_rng(2)
rumore = rng.random(X.shape[0]).reshape(-1, 1)
X = np.column_stack([X, rumore])
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(X_train, y_train)`,
      starter: `import numpy as np
from sklearn.inspection import permutation_importance
# rf: addestrata su 5 feature + 1 colonna rumore (l'ultima)

imp_gini_rumore = rf.feature_importances_[-1]
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
imp_perm_rumore = ...
permutazione_piu_onesta = ...

print(f"rumore -> impurita': {imp_gini_rumore:.3f} | permutazione: {imp_perm_rumore:.3f}")`,
      check: `import numpy as np
from sklearn.inspection import permutation_importance
_p = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
_pr = _p.importances_mean[-1]
assert 'imp_perm_rumore' in globals() and abs(float(imp_perm_rumore) - _pr) < 1e-6, "imp_perm_rumore: perm.importances_mean[-1]"
assert 'permutazione_piu_onesta' in globals() and permutazione_piu_onesta == bool(_pr < rf.feature_importances_[-1]), "permutazione_piu_onesta: la permutazione da' al rumore importanza ~0, l'impurita' gli da' credito ingiusto"`,
      hint: `<p>La permutation importance del rumore è ~0 (mescolarlo non cambia nulla, non serviva). L'impurità gli dà credito per la cardinalità. <code>permutazione_piu_onesta = imp_perm_rumore &lt; imp_gini_rumore</code>.</p>`,
      solution: `import numpy as np
from sklearn.inspection import permutation_importance

imp_gini_rumore = rf.feature_importances_[-1]
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
imp_perm_rumore = perm.importances_mean[-1]
permutazione_piu_onesta = imp_perm_rumore < imp_gini_rumore

print(f"rumore -> impurita': {imp_gini_rumore:.3f} | permutazione: {imp_perm_rumore:.3f}")`
    },

    { type: "theory", title: "Partial Dependence Plot (PDP)", html: `
<p>Sapere CHE una feature è importante non dice COME influenza la predizione: linearmente? A soglia? A U? Il <strong>Partial Dependence Plot</strong> mostra l'effetto medio di una feature sulla predizione, al variare del suo valore, mediando su tutto il resto.</p>
<pre><code>from sklearn.inspection import partial_dependence
pd_result = partial_dependence(modello, X, features=[0], grid_resolution=20)
pd_result["average"]   # predizione media per ogni valore della feature 0
pd_result["grid_values"]  # i valori della feature testati</code></pre>
<p>Idea: per ogni valore v della feature, imposta QUELLA feature a v per TUTTI i campioni, calcola la predizione media. Il grafico risultante mostra la relazione feature&rarr;predizione "depurata" dalle altre. Una curva piatta = la feature non conta; in salita = più feature, più predizione; a gradino = effetto a soglia.</p>
`, more: `
<p>Il PDP risponde a una domanda diversa dalla feature importance: non "quanto conta" ma "in che FORMA conta". Questo è cruciale per la fiducia e per il dominio: un PDP che mostra il rischio di default salire con l'età fino a 40 anni e poi scendere rivela una relazione a U che nessun singolo numero di importanza cattura, e che un esperto può validare ("sì, ha senso, i giovanissimi e gli anzianissimi sono più rischiosi per ragioni diverse"). Il PDP trasforma il modello da scatola nera a oggetto discutibile con gli stakeholder.</p>
<p>Il limite fondamentale del PDP è l'assunzione di <strong>indipendenza tra le feature</strong>. Impostando la feature a v per tutti i campioni, crea combinazioni che possono non esistere nella realtà (età=20 con 40 anni di anzianità lavorativa). Con feature correlate, il PDP media su regioni dello spazio dove non ci sono dati reali, producendo curve fuorvianti. Il rimedio è il grafico ICE (prossima idea) o gli Accumulated Local Effects (ALE), che mediano solo localmente dove ci sono dati veri.</p>
<p>Il secondo limite è che il PDP MEDIA, e la media può nascondere l'eterogeneità. Se per metà della popolazione una feature ha effetto positivo e per l'altra metà negativo, il PDP medio è piatto — sembra che la feature non conti, mentre conta eccome, in direzioni opposte per sottogruppi diversi. È esattamente il tipo di effetto che il grafico ICE (Individual Conditional Expectation), che traccia una curva PER OGNI campione invece della sola media, rivela: se le curve ICE divergono a ventaglio, c'è interazione/eterogeneità che il PDP medio maschera.</p>
` },

    {
      type: "exercise", id: "ex-06", kg: 20, title: "La forma dell'effetto",
      task: `<p>Calcola il Partial Dependence di una feature e leggi la forma della relazione:</p>
<ul>
<li><code>pdp</code>: risultato di <code>partial_dependence</code> per la feature 0 (grid_resolution=20)</li>
<li><code>valori_medi</code>: le predizioni medie (<code>pdp["average"][0]</code>)</li>
<li><code>crescente</code>: <code>True</code> se la predizione media all'ultimo punto della griglia è maggiore che al primo (relazione complessivamente crescente)</li>
<li><code>range_effetto</code>: quanto varia la predizione media (max - min) lungo la feature</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
# feature 0 ha effetto crescente sul target
X = rng.uniform(0, 10, size=(400, 3))
y = (X[:, 0] * 0.8 + rng.normal(0, 1, 400) > 4).astype(int)
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(random_state=0).fit(X, y)`,
      starter: `import numpy as np
from sklearn.inspection import partial_dependence
# rf: addestrata, feature 0 ha effetto crescente

pdp = partial_dependence(rf, X, features=[0], grid_resolution=20)
valori_medi = pdp["average"][0]
crescente = ...
range_effetto = ...

print("PDP feature 0:", np.round(valori_medi, 2))
print(f"crescente: {crescente} | range effetto: {range_effetto:.2f}")`,
      check: `import numpy as np
from sklearn.inspection import partial_dependence
_pdp = partial_dependence(rf, X, features=[0], grid_resolution=20)
_vm = _pdp["average"][0]
assert 'valori_medi' in globals() and np.allclose(valori_medi, _vm), "valori_medi: pdp['average'][0]"
assert 'crescente' in globals() and crescente == bool(_vm[-1] > _vm[0]), "crescente: valori_medi[-1] > valori_medi[0]"
assert 'range_effetto' in globals() and abs(float(range_effetto) - (float(_vm.max()) - float(_vm.min()))) < 1e-6, "range_effetto: valori_medi.max() - valori_medi.min()"
assert crescente == True, "la feature 0 ha effetto crescente per costruzione: il PDP deve salire"`,
      hint: `<p><code>pdp["average"][0]</code> è l'array delle predizioni medie lungo la griglia. <code>crescente = valori_medi[-1] &gt; valori_medi[0]</code>. Il range: <code>valori_medi.max() - valori_medi.min()</code>.</p>`,
      solution: `import numpy as np
from sklearn.inspection import partial_dependence

pdp = partial_dependence(rf, X, features=[0], grid_resolution=20)
valori_medi = pdp["average"][0]
crescente = valori_medi[-1] > valori_medi[0]
range_effetto = float(valori_medi.max() - valori_medi.min())

print("PDP feature 0:", np.round(valori_medi, 2))
print(f"crescente: {crescente} | range effetto: {range_effetto:.2f}")`
    },

    {
      type: "exercise", id: "ex-07", kg: 20, title: "ICE: quando la media inganna",
      task: `<p>Il PDP media e può nascondere effetti opposti tra sottogruppi. Calcola le curve ICE (una per campione) e verifica se divergono:</p>
<ul>
<li><code>ice</code>: <code>partial_dependence</code> con <code>kind="individual"</code> per la feature 0</li>
<li><code>curve</code>: le curve individuali (<code>ice["individual"][0]</code>, forma: n_campioni × n_griglia)</li>
<li><code>n_curve</code>: quante curve individuali (una per campione)</li>
<li><code>c_è_variabilita</code>: <code>True</code> se le curve NON sono tutte identiche (la deviazione standard tra curve, all'ultimo punto della griglia, è &gt; 0)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
X = rng.uniform(0, 10, size=(200, 3))
y = (X[:, 0] * 0.7 + X[:, 1] * 0.3 + rng.normal(0, 1, 200) > 4).astype(int)
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(random_state=0).fit(X, y)`,
      starter: `import numpy as np
from sklearn.inspection import partial_dependence
# rf: addestrata

ice = partial_dependence(rf, X, features=[0], grid_resolution=20, kind="individual")
curve = ice["individual"][0]
n_curve = ...
std_ultimo_punto = curve[:, -1].std()
c_è_variabilita = ...

print(f"numero curve ICE: {n_curve} | std all'ultimo punto: {std_ultimo_punto:.3f}")`,
      check: `import numpy as np
from sklearn.inspection import partial_dependence
_ice = partial_dependence(rf, X, features=[0], grid_resolution=20, kind="individual")
_c = _ice["individual"][0]
assert 'curve' in globals() and np.asarray(curve).shape[0] == 200, "curve: ice['individual'][0], una riga per campione (200)"
assert 'n_curve' in globals() and n_curve == 200, "n_curve: len(curve) = 200"
assert 'c_è_variabilita' in globals() and c_è_variabilita == bool(_c[:, -1].std() > 0), "c_e_variabilita: le curve ICE non sono identiche -> std > 0 (il PDP medio nasconderebbe questa eterogeneita')"`,
      hint: `<p><code>kind="individual"</code> dà una curva per campione invece della sola media. <code>ice["individual"][0]</code> ha forma (n_campioni, n_griglia). <code>c_è_variabilita = std_ultimo_punto &gt; 0</code>.</p>`,
      solution: `import numpy as np
from sklearn.inspection import partial_dependence

ice = partial_dependence(rf, X, features=[0], grid_resolution=20, kind="individual")
curve = ice["individual"][0]
n_curve = len(curve)
std_ultimo_punto = curve[:, -1].std()
c_è_variabilita = std_ultimo_punto > 0

print(f"numero curve ICE: {n_curve} | std all'ultimo punto: {std_ultimo_punto:.3f}")`
    },

    { type: "theory", title: "SHAP: il contributo equo di ogni feature", html: `
<p>I valori <strong>SHAP</strong> (SHapley Additive exPlanations) sono il metodo più rigoroso per spiegare una SINGOLA predizione: quanto ogni feature ha contribuito, in positivo o negativo, a spostare la predizione dalla media.</p>
<p>L'idea viene dalla <strong>teoria dei giochi</strong> (valori di Shapley): come dividere equamente il "guadagno" (la predizione) tra i "giocatori" (le feature)? La risposta di Shapley considera il contributo marginale di ogni feature su TUTTE le possibili combinazioni delle altre.</p>
<pre><code># libreria shap (non in Pyodide): concettualmente
# predizione = valore_base + somma(shap_values)
# valore_base = predizione media sul dataset
# ogni shap_value: quanto QUELLA feature ha spostato QUESTA predizione</code></pre>
<p>Proprietà chiave (<strong>additività</strong>): la somma dei valori SHAP di un caso, più il valore base, dà esattamente la predizione. Ogni contributo è tracciabile e sommano al totale — è ciò che rende SHAP verificabile e adatto agli audit.</p>
`, more: `
<p>I valori di Shapley sono l'UNICO metodo di attribuzione che soddisfa contemporaneamente quattro proprietà desiderabili, dimostrate matematicamente: <strong>efficienza</strong> (i contributi sommano alla differenza predizione-base), <strong>simmetria</strong> (due feature con lo stesso effetto ricevono lo stesso valore), <strong>dummy</strong> (una feature che non cambia mai la predizione riceve 0), <strong>additività</strong> (i valori si combinano linearmente tra modelli). Questa unicità assiomatica è ciò che dà a SHAP la sua autorevolezza rispetto a metodi euristici — non è "un modo" di attribuire, è "il" modo che rispetta quei principi.</p>
<p>Il costo è computazionale: calcolare i valori di Shapley esatti richiede di valutare il modello su tutte le 2^n combinazioni di feature presenti/assenti — proibitivo oltre poche feature. La libreria <code>shap</code> usa approssimazioni efficienti specifiche per famiglia di modelli: <strong>TreeSHAP</strong> (esatto e veloce per alberi/ensemble, sfrutta la struttura degli alberi), <strong>KernelSHAP</strong> (model-agnostic ma lento, basato su campionamento), <strong>DeepSHAP</strong> (per reti neurali). TreeSHAP ha reso SHAP praticabile su gradient boosting reali ed è il motivo della sua diffusione.</p>
<p>SHAP unifica globale e locale in modo elegante: i valori SHAP sono nativamente LOCALI (un contributo per feature per ogni singola predizione), ma aggregandoli — la media dei valori assoluti su tutto il dataset — si ottiene una misura di importanza GLOBALE che eredita le buone proprietà (niente bias di cardinalità, coerenza). I summary plot SHAP, che mostrano distribuzione e direzione dei contributi per feature, sono diventati lo standard de facto per spiegare i modelli tabulari. Nota per Pyodide: la libreria <code>shap</code> non gira nel browser, quindi qui ne studiamo i principi e ne calcoliamo una versione semplificata a mano per capirne la meccanica.</p>
` },

    {
      type: "exercise", id: "ex-08", kg: 15, title: "L'additività di SHAP",
      task: `<p>Verifica la proprietà fondamentale di SHAP su un modello LINEARE, dove i contributi si calcolano esattamente a mano. Per un modello lineare, il contributo SHAP della feature j al caso x è <code>coef[j] * (x[j] - media[j])</code>:</p>
<ul>
<li><code>valore_base</code>: la predizione del modello sul punto MEDIO (<code>modello.predict([media])[0]</code>)</li>
<li><code>shap_valori</code>: array dei contributi <code>coef * (x_caso - media)</code> per il primo campione</li>
<li><code>ricostruzione</code>: <code>valore_base + shap_valori.sum()</code></li>
<li><code>additivita_ok</code>: <code>True</code> se <code>ricostruzione</code> coincide con la vera predizione del modello sul caso</li>
</ul>`,
      setup: `import numpy as np
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
X = rng.normal(0, 1, size=(200, 4))
y = X @ np.array([2.0, -1.0, 0.5, 3.0]) + rng.normal(0, 0.1, 200)
modello = LinearRegression().fit(X, y)`,
      starter: `import numpy as np
# modello: regressione lineare addestrata | X: dati

media = X.mean(axis=0)
x_caso = X[0]

valore_base = modello.predict([media])[0]
shap_valori = ...   # coef * (x_caso - media)
ricostruzione = valore_base + shap_valori.sum()
vera_predizione = modello.predict([x_caso])[0]
additivita_ok = ...

print(f"base {valore_base:.3f} + contributi {shap_valori.sum():.3f} = {ricostruzione:.3f}")
print(f"predizione vera: {vera_predizione:.3f} | additivita': {additivita_ok}")`,
      check: `import numpy as np
_media = X.mean(axis=0)
_vb = modello.predict([_media])[0]
_sv = modello.coef_ * (X[0] - _media)
_ric = _vb + _sv.sum()
_vera = modello.predict([X[0]])[0]
assert 'shap_valori' in globals() and np.allclose(shap_valori, _sv), "shap_valori: modello.coef_ * (x_caso - media)"
assert 'ricostruzione' in globals() and abs(float(ricostruzione) - _ric) < 1e-6, "ricostruzione: valore_base + shap_valori.sum()"
assert 'additivita_ok' in globals() and additivita_ok == True and abs(_ric - _vera) < 1e-6, "additivita_ok: True — base + contributi = predizione esatta. E' la proprieta' fondante di SHAP"`,
      hint: `<p>Per un modello lineare il contributo SHAP è esatto: <code>modello.coef_ * (x_caso - media)</code>. La somma dei contributi più il valore base ricostruisce la predizione: <code>additivita_ok = abs(ricostruzione - vera_predizione) &lt; 1e-6</code>.</p>`,
      solution: `import numpy as np

media = X.mean(axis=0)
x_caso = X[0]

valore_base = modello.predict([media])[0]
shap_valori = modello.coef_ * (x_caso - media)
ricostruzione = valore_base + shap_valori.sum()
vera_predizione = modello.predict([x_caso])[0]
additivita_ok = abs(ricostruzione - vera_predizione) < 1e-6

print(f"base {valore_base:.3f} + contributi {shap_valori.sum():.3f} = {ricostruzione:.3f}")
print(f"predizione vera: {vera_predizione:.3f} | additivita': {additivita_ok}")`
    },

    {
      type: "exercise", id: "ex-09", kg: 20, title: "SHAP globale dai contributi locali",
      task: `<p>Aggregando i valori SHAP locali (in valore assoluto) si ottiene un'importanza globale robusta. Calcolala per il modello lineare:</p>
<ul>
<li><code>shap_matrix</code>: matrice n_campioni × n_feature dei contributi <code>coef * (X - media)</code> (vettorizzato)</li>
<li><code>importanza_globale</code>: media dei valori ASSOLUTI dei contributi per feature (axis=0)</li>
<li><code>ordine</code>: gli indici delle feature ordinati per importanza decrescente</li>
<li><code>top_feature</code>: la feature più importante globalmente</li>
</ul>`,
      setup: `import numpy as np
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
X = rng.normal(0, 1, size=(300, 4))
# la feature 3 ha il coefficiente piu' grande (3.0) -> piu' importante
y = X @ np.array([2.0, -1.0, 0.5, 3.0]) + rng.normal(0, 0.1, 300)
modello = LinearRegression().fit(X, y)`,
      starter: `import numpy as np
# modello: lineare | X: dati

media = X.mean(axis=0)
shap_matrix = ...   # modello.coef_ * (X - media), broadcasting
importanza_globale = ...   # media dei |contributi| per feature
ordine = np.argsort(importanza_globale)[::-1]
top_feature = ...

print("importanza globale SHAP:", np.round(importanza_globale, 2))
print("ordine (decrescente):", ordine.tolist(), "| top:", top_feature)`,
      check: `import numpy as np
_media = X.mean(axis=0)
_sm = modello.coef_ * (X - _media)
_ig = np.abs(_sm).mean(axis=0)
assert 'shap_matrix' in globals() and np.allclose(shap_matrix, _sm), "shap_matrix: modello.coef_ * (X - media)"
assert 'importanza_globale' in globals() and np.allclose(importanza_globale, _ig), "importanza_globale: np.abs(shap_matrix).mean(axis=0)"
assert 'top_feature' in globals() and top_feature == int(np.argmax(_ig)) == 3, "top_feature: la 3, che ha il coefficiente piu' grande (3.0)"`,
      hint: `<p><code>modello.coef_ * (X - media)</code> sfrutta il broadcasting su tutta la matrice. L'importanza globale: <code>np.abs(shap_matrix).mean(axis=0)</code>. La top: <code>np.argmax(importanza_globale)</code>.</p>`,
      solution: `import numpy as np

media = X.mean(axis=0)
shap_matrix = modello.coef_ * (X - media)
importanza_globale = np.abs(shap_matrix).mean(axis=0)
ordine = np.argsort(importanza_globale)[::-1]
top_feature = int(np.argmax(importanza_globale))

print("importanza globale SHAP:", np.round(importanza_globale, 2))
print("ordine (decrescente):", ordine.tolist(), "| top:", top_feature)`
    },

    { type: "theory", title: "LIME: spiegazioni locali per approssimazione", html: `
<p><strong>LIME</strong> (Local Interpretable Model-agnostic Explanations) spiega una singola predizione in modo diverso da SHAP: approssima il black-box <em>localmente</em>, attorno al caso da spiegare, con un modello semplice e interpretabile (di solito una regressione lineare).</p>
<p>Il procedimento:</p>
<ol>
<li>Prendi il caso da spiegare e generane tante versioni leggermente perturbate;</li>
<li>Chiedi al black-box la predizione per ognuna;</li>
<li>Addestra un modello lineare su queste, pesando di più i punti vicini al caso originale;</li>
<li>I coefficienti di quel modello lineare locale sono la spiegazione.</li>
</ol>
<p>L'intuizione: qualsiasi modello complesso, se lo guardi da vicinissimo attorno a un punto, è approssimabile con qualcosa di lineare — come una curva che localmente sembra una retta.</p>
`, more: `
<p>La differenza filosofica da SHAP: LIME costruisce un modello surrogato LOCALE e ne legge i coefficienti; SHAP calcola contributi con garanzie teoriche dalla teoria dei giochi. LIME è più intuitivo e flessibile (funziona su testo, immagini, tabelle con la stessa idea) ma ha una debolezza seria: la spiegazione dipende da SCELTE arbitrarie — come definisci "vicino" (la larghezza del kernel di pesatura), quante perturbazioni generi, quale modello surrogato usi. Cambiando questi, la spiegazione può cambiare, e questa instabilità è la critica principale a LIME.</p>
<p>Il problema della <strong>stabilità</strong> è concreto: eseguire LIME due volte sullo stesso caso può dare spiegazioni diverse per via del campionamento casuale delle perturbazioni, e spiegazioni per casi vicinissimi possono differire molto. In contesti dove la spiegazione deve essere difendibile (un audit, un tribunale), questa non-riproducibilità è un problema. SHAP, essendo deterministico (nelle versioni esatte) e assiomaticamente fondato, è generalmente preferito quando serve rigore; LIME resta prezioso per la rapidità, l'intuitività e la versatilità cross-dominio (specie su testo e immagini, dove il concetto di "perturbazione" è naturale).</p>
<p>Un rischio sottile comune a LIME e a tutti i metodi basati su perturbazione (inclusa la permutation importance): perturbando si creano punti FUORI DALLA DISTRIBUZIONE reale dei dati, dove il black-box non è mai stato addestrato e può comportarsi in modo arbitrario. La spiegazione locale rischia allora di descrivere il comportamento del modello in regioni che non incontrerà mai, non su dati realistici. È il motivo per cui né LIME né la permutation importance vanno presi come verità assoluta: sono lenti sguardati attraverso, utili ma approssimati, e su feature molto correlate o spazi ad alta dimensione vanno interpretati con cautela.</p>
` },

    {
      type: "exercise", id: "ex-10", kg: 20, title: "LIME a mano: il surrogato locale",
      task: `<p>Implementa il cuore di LIME: spiega una predizione di un black-box addestrando un lineare sulle perturbazioni pesate per vicinanza. Segui i passi nello starter:</p>
<ul>
<li><code>perturbazioni</code>: 800 punti = <code>x_caso + rumore</code> gaussiano (scala 0.6)</li>
<li><code>pred_bb</code>: le predizioni del black-box (RandomForest) sulle perturbazioni (probabilità classe 1)</li>
<li><code>pesi</code>: peso di ogni perturbazione = <code>exp(-distanza²/0.5)</code> (più vicino = più peso)</li>
<li><code>surrogato</code>: <code>LinearRegression</code> pesata (fit con <code>sample_weight=pesi</code>) su perturbazioni&rarr;pred_bb</li>
<li><code>feature_spiegazione</code>: l'indice della feature col coefficiente surrogato di modulo massimo</li>
</ul>`,
      setup: `import numpy as np
from sklearn.ensemble import RandomForestClassifier
rng = np.random.default_rng(0)
X = rng.normal(0, 1, size=(400, 3))
# la feature 0 domina la decisione
y = (X[:, 0] * 2 + X[:, 1] * 0.3 + rng.normal(0, 0.5, 400) > 0).astype(int)
black_box = RandomForestClassifier(random_state=0).fit(X, y)
x_caso = np.array([0.1, 0.1, 0.1])`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
# black_box: RandomForest | x_caso: il punto da spiegare
rng2 = np.random.default_rng(1)

perturbazioni = x_caso + rng2.normal(0, 0.6, size=(800, 3))
pred_bb = black_box.predict_proba(perturbazioni)[:, 1]

distanze = np.linalg.norm(perturbazioni - x_caso, axis=1)
pesi = np.exp(-distanze**2 / 0.5)

surrogato = ...   # LinearRegression().fit(perturbazioni, pred_bb, sample_weight=pesi)
feature_spiegazione = ...

print("coefficienti surrogato:", np.round(surrogato.coef_, 3))
print("feature che spiega la predizione:", feature_spiegazione)`,
      check: `import numpy as np
from sklearn.linear_model import LinearRegression
_rng2 = np.random.default_rng(1)
_pert = x_caso + _rng2.normal(0, 0.6, size=(800, 3))
_pred = black_box.predict_proba(_pert)[:, 1]
_dist = np.linalg.norm(_pert - x_caso, axis=1)
_pesi = np.exp(-_dist**2 / 0.5)
_sur = LinearRegression().fit(_pert, _pred, sample_weight=_pesi)
assert 'surrogato' in globals() and np.allclose(surrogato.coef_, _sur.coef_, atol=1e-6), "surrogato: LinearRegression().fit(perturbazioni, pred_bb, sample_weight=pesi)"
assert 'feature_spiegazione' in globals() and feature_spiegazione == int(np.argmax(np.abs(_sur.coef_))) == 0, "feature_spiegazione: la 0, che domina la decisione del black-box"`,
      hint: `<p>Il surrogato è una regressione lineare PESATA: <code>LinearRegression().fit(perturbazioni, pred_bb, sample_weight=pesi)</code>. La feature che spiega: <code>np.argmax(np.abs(surrogato.coef_))</code>. I pesi fanno sì che il lineare approssimi il black-box PROPRIO attorno a x_caso.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
rng2 = np.random.default_rng(1)

perturbazioni = x_caso + rng2.normal(0, 0.6, size=(800, 3))
pred_bb = black_box.predict_proba(perturbazioni)[:, 1]

distanze = np.linalg.norm(perturbazioni - x_caso, axis=1)
pesi = np.exp(-distanze**2 / 0.5)

surrogato = LinearRegression().fit(perturbazioni, pred_bb, sample_weight=pesi)
feature_spiegazione = int(np.argmax(np.abs(surrogato.coef_)))

print("coefficienti surrogato:", np.round(surrogato.coef_, 3))
print("feature che spiega la predizione:", feature_spiegazione)`
    },

    { type: "theory", title: "Fidarsi delle spiegazioni: limiti e trappole", html: `
<p>Le tecniche di explainability sono potenti ma NON infallibili. Conoscere i loro limiti è parte dell'usarle bene.</p>
<ul>
<li><strong>Feature correlate</strong>: permutation importance e PDP danno risultati fuorvianti quando le feature sono correlate (creano combinazioni irrealistiche);</li>
<li><strong>Spiegazione ≠ causalità</strong>: le tecniche dicono su cosa il modello SI BASA, non cosa CAUSA l'outcome nel mondo reale;</li>
<li><strong>Metodi discordi</strong>: SHAP, LIME e permutazione possono dare risposte diverse sullo stesso modello;</li>
<li><strong>Spiegazioni manipolabili</strong>: esistono attacchi che nascondono comportamenti scorretti dietro spiegazioni rassicuranti.</li>
</ul>
<p>La regola d'oro: una spiegazione descrive il MODELLO, non la REALTÀ. "Il modello si basa molto sul CAP" non significa "il CAP causa il default" né "cambiare CAP cambierebbe il rischio".</p>
`, more: `
<p>Il punto su spiegazione ≠ causalità collega questa sala alla lavagna su correlazione e causalità della Statistica, ed è l'errore più costoso: interpretare le feature importance come leve d'azione. Se un modello dà alta importanza a "numero di visite al sito" per predire gli acquisti, NON segue che forzare più visite aumenterà gli acquisti — le visite sono probabilmente un PROXY dell'intenzione d'acquisto, non la sua causa. Agire sulle feature importanti come se fossero cause è il modo in cui un modello predittivo eccellente genera decisioni disastrose. Le spiegazioni rispondono a "come predice il modello", mai a "cosa succederebbe se intervenissi".</p>
<p>Il rischio delle spiegazioni <strong>manipolabili</strong> è emerso come tema di ricerca serio: esistono tecniche per costruire modelli che si comportano in modo discriminatorio ma producono spiegazioni SHAP/LIME dall'aria innocua, sfruttando proprio il fatto che le spiegazioni post-hoc campionano su dati perturbati/fuori distribuzione. Questo mina l'idea che "basta spiegare il black-box" per renderlo affidabile in contesti sensibili, e rafforza l'argomento per modelli intrinsecamente interpretabili dove le decisioni contano davvero.</p>
<p>La discordanza tra metodi non è un difetto da nascondere ma informazione da usare: se SHAP, permutation importance e coefficienti lineari concordano sulle feature chiave, hai alta fiducia; se discordano, è un segnale che il modello ha strutture complesse (interazioni, correlazioni) che meritano indagine, non che uno dei metodi "sbaglia". La pratica matura usa PIÙ tecniche in triangolazione e comunica l'incertezza, invece di presentare una singola spiegazione come verità. Explainability fatta bene è onesta sui propri limiti quanto sui propri risultati.</p>
` },

    {
      type: "exercise", id: "ex-11", kg: 15, title: "Quiz: le trappole dell'explainability",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Se il modello dà alta importanza al CAP, allora cambiare CAP cambierebbe il rischio reale del cliente"</li>
<li><code>a2</code>: "La permutation importance va calcolata sul test set per misurare la generalizzazione"</li>
<li><code>a3</code>: "SHAP soddisfa proprietà matematiche (additività) che LIME non garantisce"</li>
<li><code>a4</code>: "Con feature correlate, la permutation importance può sottostimare feature che insieme sono importanti"</li>
<li><code>a5</code>: "Una spiegazione descrive il comportamento del modello, non necessariamente la causalità nel mondo reale"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == False, "a1 FALSA: importanza != causalita'. Il CAP e' un proxy, agirci non cambia il rischio reale"
assert a2 == True, "a2 VERA: sul test misura la generalizzazione, non la memorizzazione"
assert a3 == True, "a3 VERA: SHAP ha basi assiomatiche (efficienza, additivita', ...), LIME e' un'approssimazione empirica"
assert a4 == True, "a4 VERA: permutando una sola di due feature correlate, il modello recupera l'info dall'altra -> entrambe sembrano poco importanti"
assert a5 == True, "a5 VERA: la regola d'oro — la spiegazione descrive il MODELLO, non la REALTA'"`,
      hint: `<p>Il filo rosso: le spiegazioni descrivono il modello, non la realtà (a1 falsa, a5 vera). SHAP è più rigoroso di LIME (a3). Permutazione sul test (a2) e attenzione alle correlazioni (a4).</p>`,
      solution: `a1 = False
a2 = True
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "ex-12", kg: 20, title: "Quando i metodi concordano",
      task: `<p>La fiducia cresce quando metodi diversi concordano. Confronta l'ordinamento delle feature per importanza da impurità e per permutazione su un modello pulito:</p>
<ul>
<li><code>ordine_gini</code>: indici feature ordinati per importanza da impurità (decrescente)</li>
<li><code>ordine_perm</code>: indici feature ordinati per permutation importance (decrescente)</li>
<li><code>top1_concorda</code>: <code>True</code> se la feature #1 è la stessa nei due ordinamenti</li>
<li><code>top3_concordano</code>: <code>True</code> se i primi 3 (come insiemi) coincidono</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
X, y = make_classification(n_samples=800, n_features=6, n_informative=3, n_redundant=0,
                            shuffle=False, class_sep=1.5, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(X_train, y_train)`,
      starter: `import numpy as np
from sklearn.inspection import permutation_importance
# rf: addestrata su 6 feature (prime 3 informative)

imp_gini = rf.feature_importances_
imp_perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean

ordine_gini = np.argsort(imp_gini)[::-1]
ordine_perm = ...
top1_concorda = ...
top3_concordano = ...

print("ordine gini:", ordine_gini.tolist())
print("ordine perm:", ordine_perm.tolist())
print(f"top1 concorda: {top1_concorda} | top3 concordano: {top3_concordano}")`,
      check: `import numpy as np
from sklearn.inspection import permutation_importance
_ig = rf.feature_importances_
_ip = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean
_og = np.argsort(_ig)[::-1]; _op = np.argsort(_ip)[::-1]
assert 'ordine_perm' in globals() and np.array_equal(ordine_perm, _op), "ordine_perm: np.argsort(imp_perm)[::-1]"
assert 'top1_concorda' in globals() and top1_concorda == bool(_og[0] == _op[0]), "top1_concorda: ordine_gini[0] == ordine_perm[0]"
assert 'top3_concordano' in globals() and top3_concordano == bool(set(_og[:3]) == set(_op[:3])), "top3_concordano: set dei primi 3 uguali"
assert top3_concordano == True, "su un modello pulito i due metodi devono concordare sui primi 3 (le informative)"`,
      hint: `<p><code>np.argsort(imp)[::-1]</code> ordina in modo decrescente. <code>top1_concorda = ordine_gini[0] == ordine_perm[0]</code>. <code>top3_concordano = set(ordine_gini[:3]) == set(ordine_perm[:3])</code>. Concordanza = fiducia.</p>`,
      solution: `import numpy as np
from sklearn.inspection import permutation_importance

imp_gini = rf.feature_importances_
imp_perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean

ordine_gini = np.argsort(imp_gini)[::-1]
ordine_perm = np.argsort(imp_perm)[::-1]
top1_concorda = ordine_gini[0] == ordine_perm[0]
top3_concordano = set(ordine_gini[:3].tolist()) == set(ordine_perm[:3].tolist())

print("ordine gini:", ordine_gini.tolist())
print("ordine perm:", ordine_perm.tolist())
print(f"top1 concorda: {top1_concorda} | top3 concordano: {top3_concordano}")`
    },

    {
      type: "exercise", id: "ex-13", kg: 20, title: "Spiegare una singola decisione",
      task: `<p>Spiega perché il modello ha predetto quello che ha predetto per UN caso specifico, con i contributi SHAP lineari. Costruisci la "storia" della predizione:</p>
<ul>
<li><code>contributi</code>: i contributi <code>coef * (x_caso - media)</code> per il caso</li>
<li><code>spinta_positiva</code>: la somma dei contributi POSITIVI (spingono verso l'alto)</li>
<li><code>spinta_negativa</code>: la somma dei contributi NEGATIVI (spingono verso il basso)</li>
<li><code>feature_decisiva</code>: l'indice del contributo di modulo massimo (la feature che ha pesato di più su QUESTO caso)</li>
<li><code>verso_alto</code>: <code>True</code> se la predizione del caso è sopra il valore base (le spinte positive vincono)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(3)
X = rng.normal(0, 1, size=(300, 4))
y = X @ np.array([1.5, -2.0, 0.8, 1.0]) + rng.normal(0, 0.2, 300)
modello = LinearRegression().fit(X, y)
x_caso = np.array([2.0, 1.5, -0.5, 0.3])`,
      starter: `import numpy as np
# modello: lineare | x_caso: il caso da spiegare

media = X.mean(axis=0)
valore_base = modello.predict([media])[0]
pred_caso = modello.predict([x_caso])[0]

contributi = ...
spinta_positiva = contributi[contributi > 0].sum()
spinta_negativa = ...
feature_decisiva = ...
verso_alto = ...

print(f"base {valore_base:.2f} -> predizione {pred_caso:.2f}")
print("contributi:", np.round(contributi, 2))
print(f"feature decisiva: {feature_decisiva} | verso l'alto: {verso_alto}")`,
      check: `import numpy as np
_media = X.mean(axis=0)
_vb = modello.predict([_media])[0]
_pc = modello.predict([x_caso])[0]
_c = modello.coef_ * (x_caso - _media)
assert 'contributi' in globals() and np.allclose(contributi, _c), "contributi: modello.coef_ * (x_caso - media)"
assert 'spinta_negativa' in globals() and abs(float(spinta_negativa) - float(_c[_c<0].sum())) < 1e-6, "spinta_negativa: contributi[contributi < 0].sum()"
assert 'feature_decisiva' in globals() and feature_decisiva == int(np.argmax(np.abs(_c))), "feature_decisiva: np.argmax(np.abs(contributi))"
assert 'verso_alto' in globals() and verso_alto == bool(_pc > _vb), "verso_alto: pred_caso > valore_base"`,
      hint: `<p>I contributi: <code>modello.coef_ * (x_caso - media)</code>. La feature decisiva PER QUESTO caso: <code>np.argmax(np.abs(contributi))</code> — nota che dipende dal valore del caso, non solo dal coefficiente. <code>verso_alto = pred_caso &gt; valore_base</code>.</p>`,
      solution: `import numpy as np

media = X.mean(axis=0)
valore_base = modello.predict([media])[0]
pred_caso = modello.predict([x_caso])[0]

contributi = modello.coef_ * (x_caso - media)
spinta_positiva = contributi[contributi > 0].sum()
spinta_negativa = contributi[contributi < 0].sum()
feature_decisiva = int(np.argmax(np.abs(contributi)))
verso_alto = pred_caso > valore_base

print(f"base {valore_base:.2f} -> predizione {pred_caso:.2f}")
print("contributi:", np.round(contributi, 2))
print(f"feature decisiva: {feature_decisiva} | verso l'alto: {verso_alto}")`
    },

    {
      type: "exercise", id: "ex-14", kg: 25, title: "MASSIMALE: il report di spiegazione",
      task: `<p>Il gran finale: produci un report completo di explainability per un modello, combinando globale e locale, con la triangolazione tra metodi.</p>
<ul>
<li><code>imp_perm</code>: permutation importance media sul test</li>
<li><code>top3_globali</code>: i 3 indici più importanti globalmente (permutazione, decrescente)</li>
<li><code>caso_idx</code>: 0 (spieghiamo il primo caso del test)</li>
<li><code>pred_caso</code>: la probabilità predetta per quel caso (classe 1)</li>
<li><code>feature_locali_top</code>: i 3 indici con permutation importance più alta calcolata SOLO su quel caso ripetuto — qui, per semplicità, riusa i <code>top3_globali</code> (in un report reale useresti SHAP locale)</li>
<li><code>report</code>: dizionario con chiavi "top_globali", "pred_caso", "n_feature_importanti" (quante hanno importanza &gt; 0.01)</li>
<li><code>coerente</code>: <code>True</code> se il modello ha almeno 3 feature importanti e pred_caso è una probabilità valida (0-1)</li>
</ul>`,
      setup: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
X, y = make_classification(n_samples=1000, n_features=8, n_informative=4,
                            n_redundant=1, shuffle=False, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(X_train, y_train)`,
      starter: `import numpy as np
from sklearn.inspection import permutation_importance
# rf: addestrata | X_test, y_test: test

imp_perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean
top3_globali = np.argsort(imp_perm)[::-1][:3]

caso_idx = 0
pred_caso = rf.predict_proba(X_test[caso_idx:caso_idx+1])[0, 1]
feature_locali_top = top3_globali

n_feature_importanti = int((imp_perm > 0.01).sum())
report = {
    "top_globali": top3_globali.tolist(),
    "pred_caso": round(float(pred_caso), 3),
    "n_feature_importanti": n_feature_importanti,
}
coerente = ...

print("REPORT:", report)
print("coerente:", coerente)`,
      check: `import numpy as np
from sklearn.inspection import permutation_importance
_ip = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean
_n = int((_ip > 0.01).sum())
_pc = rf.predict_proba(X_test[0:1])[0, 1]
assert 'top3_globali' in globals() and len(top3_globali) == 3, "top3_globali: i 3 indici piu' importanti"
assert 'report' in globals() and report["n_feature_importanti"] == _n, "report['n_feature_importanti']: (imp_perm > 0.01).sum()"
assert 'coerente' in globals() and coerente == True, "coerente: True — almeno 3 feature importanti e pred_caso valida (0-1)"
assert _n >= 3 and 0 <= _pc <= 1, "il modello deve avere >=3 feature importanti e produrre probabilita' valide"`,
      hint: `<p>Il report è già quasi assemblato: definisci solo <code>coerente = n_feature_importanti &gt;= 3 and 0 &lt;= pred_caso &lt;= 1</code>. È la triangolazione: importanza globale (permutazione) + spiegazione del singolo caso.</p>`,
      solution: `import numpy as np
from sklearn.inspection import permutation_importance

imp_perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0).importances_mean
top3_globali = np.argsort(imp_perm)[::-1][:3]

caso_idx = 0
pred_caso = rf.predict_proba(X_test[caso_idx:caso_idx+1])[0, 1]
feature_locali_top = top3_globali

n_feature_importanti = int((imp_perm > 0.01).sum())
report = {
    "top_globali": top3_globali.tolist(),
    "pred_caso": round(float(pred_caso), 3),
    "n_feature_importanti": n_feature_importanti,
}
coerente = n_feature_importanti >= 3 and 0 <= pred_caso <= 1

print("REPORT:", report)
print("coerente:", coerente)`
    }

  ]
});
