window.MODULES.push({
  id: "mlops",
  name: "MLOps",
  tagline: "La sala della produzione: experiment tracking, versioning, deploy, monitoring, drift. Il ciclo di vita di un modello, simulato in Python.",
  intro: "Addestrare un modello è il 10% del lavoro; portarlo e tenerlo in produzione è il resto. Experiment tracking (stile MLflow), versioning, serving, monitoring e data drift — i concetti MLOps che i colloqui chiedono, ricostruiti in Python.",
  packages: [],
  items: [

    { type: "theory", title: "Perché esiste MLOps", html: `
<p>Un modello in un notebook non serve a nessuno: il valore arriva quando è <strong>in produzione</strong>, serve predizioni affidabili, e resta buono nel tempo. <strong>MLOps</strong> (Machine Learning Operations) è l'insieme di pratiche per gestire il ciclo di vita completo di un modello ML.</p>
<p>Il ciclo di vita, oltre l'addestramento:</p>
<ul>
<li><strong>Experiment tracking</strong>: registrare ogni esperimento (parametri, metriche, dati) per riprodurlo;</li>
<li><strong>Versioning</strong>: versionare codice, dati E modelli insieme;</li>
<li><strong>Deploy</strong>: mettere il modello dietro un'API o in batch;</li>
<li><strong>Monitoring</strong>: sorvegliare prestazioni e input nel tempo;</li>
<li><strong>Retraining</strong>: riaddestrare quando il modello degrada.</li>
</ul>
`, more: `
<p>MLOps nasce perché il ML in produzione ha problemi che il software tradizionale non ha. Il codice è deterministico e testabile; un modello dipende dai DATI (che cambiano), dal RANDOM SEED, dalle VERSIONI delle librerie — riprodurre "lo stesso risultato" è sorprendentemente difficile senza tracciare tutto. E soprattutto: il software non "si degrada" se il mondo cambia, un modello SÌ (data drift, prossima lavagna). Un'app bancaria funziona uguale oggi e tra un anno; un modello di credit scoring addestrato pre-pandemia può diventare inutile quando il comportamento dei clienti cambia. MLOps è la disciplina che gestisce questa natura vivente e degradabile dei modelli.</p>
<p>Il concetto di <strong>debito tecnico nascosto</strong> del ML (dal celebre paper di Google "Machine Learning: The High-Interest Credit Card of Technical Debt") è cultura da colloquio: i sistemi ML accumulano debito in modi invisibili — dipendenze da dati instabili, pipeline aggrovigliate, feature che nessuno sa più perché ci sono, modelli che dipendono da altri modelli (correlation chains). Il codice ML "che funziona" è spesso una piccola parte circondata da una massa di infrastruttura per dati, serving, monitoring. MLOps rende esplicita e gestibile questa infrastruttura invece di lasciarla crescere caotica.</p>
<p>La maturità MLOps è una scala (i "livelli" definiti da Google): livello 0 = tutto manuale (notebook, deploy a mano — dove sono molti team); livello 1 = pipeline di training automatizzata con retraining; livello 2 = CI/CD completa per il ML, con test automatici dei modelli, deploy automatico, monitoring integrato. Non tutti i progetti hanno bisogno del livello 2 — un modello che si riaddestrà una volta all'anno non serve una pipeline continua. Saper valutare QUANTO MLOps serve a un progetto (evitando sia l'under-engineering che porta a disastri sia l'over-engineering che spreca risorse) è giudizio da senior, più prezioso della conoscenza dei singoli strumenti.</p>
` },

    {
      type: "exercise", id: "ml-01", kg: 5, title: "Le fasi del ciclo di vita",
      task: `<p>Ordina le fasi del ciclo di vita MLOps di un modello (1-5):</p>
<ul>
<li><code>ord_train</code>: addestrare e tracciare l'esperimento</li>
<li><code>ord_deploy</code>: mettere in produzione dietro un'API</li>
<li><code>ord_monitor</code>: monitorare prestazioni e input</li>
<li><code>ord_retrain</code>: riaddestrare quando degrada</li>
</ul>
<p>(Ordine: prima addestri, poi fai deploy, poi monitori, e infine riaddestri quando serve.)</p>`,
      starter: `ord_train = 1
ord_deploy = ...
ord_monitor = ...
ord_retrain = ...

print(ord_train, ord_deploy, ord_monitor, ord_retrain)`,
      check: `assert ord_train == 1, "addestrare e' il primo passo"
assert ord_deploy == 2, "deploy dopo l'addestramento"
assert ord_monitor == 3, "monitorare dopo il deploy"
assert ord_retrain == 4, "riaddestrare quando il monitoring segnala degrado — chiude il ciclo"`,
      hint: `<p>Il ciclo: addestra (1) &rarr; deploy (2) &rarr; monitora (3) &rarr; riaddestra (4), e si torna al deploy. È un CICLO, non una linea.</p>`,
      solution: `ord_train = 1
ord_deploy = 2
ord_monitor = 3
ord_retrain = 4

print(ord_train, ord_deploy, ord_monitor, ord_retrain)`
    },

    { type: "theory", title: "Experiment tracking", html: `
<p>Addestrando decine di modelli con parametri diversi, come ricordi quale ha funzionato e perché? L'<strong>experiment tracking</strong> (MLflow, Weights & Biases) registra ogni run: parametri, metriche, artefatti, versione dei dati.</p>
<pre><code># concettualmente (stile MLflow):
run = {
    "params": {"learning_rate": 0.1, "max_depth": 5},
    "metrics": {"accuracy": 0.87, "f1": 0.85},
    "artifacts": ["modello.pkl", "confusion_matrix.png"],
    "timestamp": "2026-07-21T10:00",
}
# poi confronti tutti i run per trovare il migliore</code></pre>
<p>Senza tracking, dopo 50 esperimenti non sai più quale configurazione ha dato l'accuratezza migliore né come riprodurla. Con il tracking, ogni run è registrato e confrontabile: la base della <strong>riproducibilità</strong> e della scelta informata del modello da promuovere.</p>
`, more: `
<p>Cosa tracciare, in dettaglio: <strong>parametri</strong> (iperparametri, scelte di preprocessing), <strong>metriche</strong> (accuratezza, loss, e la loro evoluzione durante il training), <strong>artefatti</strong> (il modello serializzato, grafici, il dataset o il suo hash), e il <strong>contesto</strong> (versione del codice/commit git, versioni delle librerie, hardware, random seed). Quest'ultimo è il più trascurato e il più importante per la RIPRODUCIBILITÀ: "accuratezza 0.87" è inutile se non sai con quale codice, quali dati e quale seed è stata ottenuta. Il tracking completo permette di tornare a QUALSIASI esperimento passato e rieseguirlo identico — impossibile a memoria dopo decine di run.</p>
<p>Il valore va oltre il singolo progetto: l'experiment tracking crea MEMORIA ORGANIZZATIVA. Un nuovo membro del team può vedere cosa è stato provato e con quali risultati, evitando di rifare esperimenti falliti; si possono confrontare modelli addestrati mesi prima; si documenta il PERCHÉ di una scelta ("abbiamo scelto questo modello perché, guarda i run, gli altri overfittavano"). Nei colloqui, "userei MLflow per tracciare gli esperimenti" alla domanda "come gestiresti decine di run" è la risposta attesa — e spiegarne il perché (riproducibilità, confronto, memoria) distingue chi l'ha usato davvero.</p>
<p>MLflow struttura questo in concetti: <strong>run</strong> (una singola esecuzione di training), <strong>experiment</strong> (un gruppo di run correlati, es. "tuning del modello di churn"), <strong>model registry</strong> (un catalogo versionato dei modelli promossi, con stadi: staging, production, archived). Weights & Biases aggiunge visualizzazioni ricche e collaborazione. Ma lo strumento conta meno del PRINCIPIO: se non tracci, non puoi riprodurre né migliorare sistematicamente — procedi a intuito, e a intuito non si costruiscono sistemi ML affidabili. Il tracking è ciò che trasforma l'addestramento da artigianato irripetibile a processo ingegneristico.</p>
` },

    {
      type: "exercise", id: "ml-02", kg: 10, title: "Tracciare e confrontare i run",
      task: `<p>Simula un experiment tracker: registra più run e trova il migliore per una metrica:</p>
<ul>
<li><code>tracker</code>: lista di run (fornita), ognuno con params e metrics</li>
<li><code>miglior_run</code>: il run con l'accuratezza più alta (usa <code>max</code> con key)</li>
<li><code>miglior_lr</code>: il learning_rate del run migliore</li>
<li><code>miglior_accuracy</code>: l'accuratezza del run migliore</li>
</ul>`,
      setup: `tracker = [
    {"params": {"lr": 0.01, "depth": 3}, "metrics": {"accuracy": 0.82}},
    {"params": {"lr": 0.1, "depth": 5}, "metrics": {"accuracy": 0.89}},
    {"params": {"lr": 0.3, "depth": 5}, "metrics": {"accuracy": 0.85}},
    {"params": {"lr": 0.1, "depth": 10}, "metrics": {"accuracy": 0.87}},
]`,
      starter: `# tracker: lista di run con params e metrics

miglior_run = max(tracker, key=lambda r: r["metrics"]["accuracy"])
miglior_lr = ...
miglior_accuracy = ...

print("miglior run:", miglior_run)
print(f"lr={miglior_lr}, accuracy={miglior_accuracy}")`,
      check: `_best = max(tracker, key=lambda r: r["metrics"]["accuracy"])
assert miglior_run == _best, "miglior_run: max(tracker, key=accuracy)"
assert miglior_lr == 0.1, "miglior_lr: il run migliore ha lr=0.1"
assert abs(miglior_accuracy - 0.89) < 1e-9, "miglior_accuracy: 0.89"`,
      hint: `<p><code>max(tracker, key=lambda r: r["metrics"]["accuracy"])</code> trova il run con accuratezza massima. Poi estrai <code>miglior_run["params"]["lr"]</code> e <code>miglior_run["metrics"]["accuracy"]</code>.</p>`,
      solution: `miglior_run = max(tracker, key=lambda r: r["metrics"]["accuracy"])
miglior_lr = miglior_run["params"]["lr"]
miglior_accuracy = miglior_run["metrics"]["accuracy"]

print("miglior run:", miglior_run)
print(f"lr={miglior_lr}, accuracy={miglior_accuracy}")`
    },

    { type: "theory", title: "Salvare i modelli: pickle vs joblib", html: `
<p>Un modello addestrato va <strong>serializzato</strong> (salvato su disco) per poterlo caricare in produzione senza riaddestrare. In Python i due modi principali:</p>
<pre><code>import pickle, joblib
# pickle: serializzazione generica di Python
pickle.dump(modello, open("modello.pkl", "wb"))
modello = pickle.load(open("modello.pkl", "rb"))

# joblib: ottimizzato per oggetti con grandi array NumPy (i modelli sklearn!)
joblib.dump(modello, "modello.joblib")
modello = joblib.load("modello.joblib")</code></pre>
<p><strong>joblib</strong> è preferito per i modelli scikit-learn: gestisce meglio i grandi array NumPy (più veloce, file più compatti). <strong>pickle</strong> è più generale. Regola di sicurezza cruciale: <strong>NON caricare mai un pickle/joblib da fonte non fidata</strong> — la deserializzazione può eseguire codice arbitrario.</p>
`, more: `
<p>Il rischio di sicurezza è concreto e serio: <code>pickle.load</code> (e joblib, che lo usa sotto) può eseguire CODICE ARBITRARIO durante la deserializzazione — un file pickle malevolo può lanciare comandi sul tuo sistema al momento del caricamento. Quindi: carica solo modelli che TU hai serializzato o che vengono da fonti fidate; MAI un pickle ricevuto da un utente via API, scaricato da fonte ignota, o da un repository non verificato. È l'esatta ragione per cui via API si accetta JSON (dati inerti) e non pickle. Per condividere modelli in modo più sicuro esistono formati come ONNX (interoperabile e non eseguibile) o safetensors (per i pesi delle reti).</p>
<p>Il problema più insidioso della serializzazione è la DIPENDENZA dall'ambiente: un modello sklearn salvato con la versione X della libreria potrebbe non caricarsi (o caricarsi ma comportarsi diversamente) con la versione Y. Il pickle salva la struttura dell'oggetto, non il codice delle classi — se la definizione di <code>RandomForestClassifier</code> cambia tra versioni, il caricamento può fallire o dare warning. Per questo il versioning del modello DEVE includere le versioni delle librerie (requirements bloccati), e per la produzione a lungo termine si preferiscono formati indipendenti dalla versione (ONNX) o si containerizza l'ambiente esatto (Docker, che congela le versioni — collegamento con la sala Docker).</p>
<p>Cosa salvare oltre al modello: un modello serializzato da solo spesso non basta. Serve salvare l'INTERA pipeline (preprocessing incluso — scaler, encoder, imputer — altrimenti in produzione devi ricostruirli identici a mano, fonte di training-serving skew); i metadati (versione, metriche, data di training, schema dell'input atteso); e idealmente un esempio di input/output per validare che il modello caricato si comporti come atteso. Salvare <code>Pipeline([preprocessing, modello])</code> in un unico artefatto (come visto nella sala Feature Engineering) è la pratica giusta: un solo file che contiene tutto ciò che serve per predire, riducendo il rischio di divergenze tra training e produzione.</p>
` },

    {
      type: "exercise", id: "ml-03", kg: 10, title: "Serializzare e ricaricare",
      task: `<p>Simula il salvataggio e caricamento di un modello con pickle (in memoria, via <code>pickle.dumps/loads</code>):</p>
<ul>
<li><code>modello</code>: un dizionario che rappresenta un modello addestrato (pesi + metadati)</li>
<li><code>serializzato</code>: i byte del modello (<code>pickle.dumps</code>)</li>
<li><code>ricaricato</code>: il modello ricostruito (<code>pickle.loads</code>)</li>
<li><code>roundtrip_ok</code>: <code>True</code> se il ricaricato è uguale all'originale</li>
<li><code>joblib_meglio_per_sklearn</code>: <code>True</code> se joblib è preferito ai modelli con grandi array NumPy</li>
</ul>`,
      setup: `import pickle
modello = {"tipo": "RandomForest", "pesi": [0.2, 0.5, 0.3], "accuracy": 0.88, "versione": "1.0"}`,
      starter: `import pickle
# modello: dizionario che simula un modello addestrato

serializzato = pickle.dumps(modello)
ricaricato = ...
roundtrip_ok = ...
joblib_meglio_per_sklearn = ...

print("serializzato:", len(serializzato), "byte")
print("ricaricato:", ricaricato)
print("roundtrip ok:", roundtrip_ok)`,
      check: `import pickle
assert 'serializzato' in globals() and isinstance(serializzato, bytes), "serializzato: pickle.dumps(modello) -> bytes"
assert 'ricaricato' in globals() and ricaricato == modello, "ricaricato: pickle.loads(serializzato)"
assert roundtrip_ok == True, "roundtrip_ok: ricaricato == modello"
assert joblib_meglio_per_sklearn == True, "joblib_meglio_per_sklearn: True — joblib gestisce meglio i grandi array NumPy"`,
      hint: `<p><code>pickle.dumps</code> serializza in byte, <code>pickle.loads</code> ricostruisce. <code>roundtrip_ok = ricaricato == modello</code>. joblib è preferito per sklearn: <code>True</code>.</p>`,
      solution: `import pickle

serializzato = pickle.dumps(modello)
ricaricato = pickle.loads(serializzato)
roundtrip_ok = ricaricato == modello
joblib_meglio_per_sklearn = True

print("serializzato:", len(serializzato), "byte")
print("ricaricato:", ricaricato)
print("roundtrip ok:", roundtrip_ok)`
    },

    { type: "theory", title: "Versioning: codice, dati, modelli", html: `
<p>Nel software si versiona il codice (Git). Nel ML servono TRE versioning coordinati: <strong>codice</strong> (Git), <strong>dati</strong> (DVC, lakeFS), <strong>modelli</strong> (model registry). Perché un risultato ML è riproducibile solo se conosci tutti e tre.</p>
<pre><code># un modello in produzione e' identificato da:
modello_prod = {
    "codice": "git:a1b2c3",        # commit del codice di training
    "dati": "dvc:v2.1",           # versione del dataset
    "modello": "registry:churn-v5", # versione del modello nel registry
    "metriche": {"auc": 0.91},
}</code></pre>
<p>Versionare solo il codice non basta: lo STESSO codice su dati diversi dà modelli diversi. Il <strong>model registry</strong> cataloga i modelli con stadi (staging &rarr; production &rarr; archived), permettendo rollback a una versione precedente se la nuova degrada.</p>
`, more: `
<p>Il versioning dei DATI è la parte che il software tradizionale non ha e che i principianti dimenticano. Git è pensato per il codice (file di testo piccoli), non per dataset da gigabyte. Strumenti come <strong>DVC</strong> (Data Version Control) risolvono: versionano i dati salvando gli hash e i puntatori in Git mentre i dati veri stanno in storage (S3, ecc.), così puoi fare "checkout" di una versione esatta del dataset come fai col codice. Senza versioning dei dati, "riaddestra il modello di 3 mesi fa" è impossibile — i dati sono cambiati e non sai com'erano. La riproducibilità richiede di congelare TUTTI gli ingredienti, e i dati sono l'ingrediente principale.</p>
<p>Il <strong>model registry</strong> con i suoi stadi è il meccanismo che rende il deploy sicuro e reversibile. Un modello nasce in "staging" (candidato, sotto test), viene promosso a "production" (serve traffico reale) dopo validazione, e i vecchi vanno in "archived" (non attivi ma conservati per rollback). Questo permette il <strong>rollback</strong> istantaneo: se il modello v5 appena promosso degrada in produzione, torni a v4 con un cambio di puntatore, senza riaddestrare. È l'equivalente ML del rollback di un deploy software — e la sua assenza (deploy manuale senza registry) significa che un modello difettoso in produzione richiede ore di panico per tornare indietro.</p>
<p>La riproducibilità completa è più profonda di codice+dati+modello: include anche l'AMBIENTE (versioni delle librerie, che cambiano il comportamento — sala Docker), il random seed, e l'hardware (GPU diverse possono dare risultati leggermente diversi in floating point). Il "gold standard" è poter dire: dato il commit git X, la versione dati Y, l'ambiente Z e il seed S, ottengo BIT-PER-BIT lo stesso modello. Raggiungerlo davvero è difficile (fonti di non-determinismo si nascondono ovunque), ma avvicinarsi è ciò che distingue un progetto ML ingegnerizzato da uno artigianale. Il collegamento con Git (versioning del codice) e Docker (versioning dell'ambiente) mostra che MLOps orchestra strumenti che hai già incontrato, aggiungendo il pezzo mancante: il versioning di dati e modelli.</p>
` },

    {
      type: "exercise", id: "ml-04", kg: 15, title: "Il registry e il rollback",
      task: `<p>Simula un model registry con stadi e un rollback. I modelli hanno versione, stadio e metrica:</p>
<ul>
<li><code>registry</code>: lista di modelli (fornita), con versione, stadio e auc</li>
<li><code>in_produzione</code>: il modello attualmente in stadio "production"</li>
<li>simula un rollback: la v5 (production) degrada, promuovi la v4 a production e archivia la v5</li>
<li><code>nuova_produzione</code>: la versione ora in produzione dopo il rollback (deve essere "v4")</li>
<li><code>rollback_possibile</code>: <code>True</code> se avere le versioni vecchie archiviate rende il rollback istantaneo</li>
</ul>`,
      setup: `registry = [
    {"versione": "v3", "stadio": "archived", "auc": 0.85},
    {"versione": "v4", "stadio": "archived", "auc": 0.90},
    {"versione": "v5", "stadio": "production", "auc": 0.88},
]`,
      starter: `# registry: modelli con versione, stadio, auc

in_produzione = next(m for m in registry if m["stadio"] == "production")

# rollback: v5 degrada -> archivia v5, promuovi v4
for m in registry:
    if m["versione"] == "v5":
        m["stadio"] = "archived"
    if m["versione"] == "v4":
        m["stadio"] = "production"

nuova_produzione = ...
rollback_possibile = ...

print("prima:", in_produzione["versione"])
print("dopo rollback:", nuova_produzione)`,
      check: `_prod = next(m for m in registry if m["stadio"] == "production")
assert _prod["versione"] == "v4", "dopo il rollback, v4 e' in production"
assert nuova_produzione == "v4", "nuova_produzione: 'v4'"
assert rollback_possibile == True, "rollback_possibile: True — le versioni archiviate permettono di tornare indietro senza riaddestrare"
assert next(m for m in registry if m["versione"]=="v5")["stadio"] == "archived", "v5 deve essere archiviata"`,
      hint: `<p>Dopo il ciclo di rollback, trova il modello in production: <code>nuova_produzione = next(m for m in registry if m["stadio"]=="production")["versione"]</code>. Il rollback è possibile grazie all'archivio: <code>True</code>.</p>`,
      solution: `in_produzione = next(m for m in registry if m["stadio"] == "production")

for m in registry:
    if m["versione"] == "v5":
        m["stadio"] = "archived"
    if m["versione"] == "v4":
        m["stadio"] = "production"

nuova_produzione = next(m for m in registry if m["stadio"] == "production")["versione"]
rollback_possibile = True

print("prima:", in_produzione["versione"])
print("dopo rollback:", nuova_produzione)`
    },

    { type: "theory", title: "Batch vs online inference", html: `
<p>Un modello in produzione serve predizioni in due modalità principali, con requisiti opposti:</p>
<ul>
<li><strong>Batch inference</strong>: predici su GRANDI volumi di dati periodicamente (es. ogni notte, il rischio di churn di tutti i clienti). Alto throughput, latenza irrilevante.</li>
<li><strong>Online (real-time) inference</strong>: predici su UNA richiesta alla volta, all'istante (es. raccomandazione mentre l'utente naviga). Bassa latenza, dietro un'API.</li>
</ul>
<pre><code># batch: processa tutto in una volta, salva i risultati
predizioni = modello.predict(tutti_i_clienti)   # milioni di righe

# online: una richiesta, risposta immediata
@app.post("/predict")
def predici(dati): return modello.predict([dati])[0]</code></pre>
<p>La scelta dipende dal caso d'uso: se la predizione serve "ora" (durante un'interazione), online; se serve "aggiornata periodicamente" (report, campagne), batch.</p>
`, more: `
<p>Il trade-off fondamentale è latenza vs throughput. La <strong>batch inference</strong> ottimizza il THROUGHPUT: processa milioni di record insieme, sfruttando la vettorizzazione e il parallelismo, senza vincoli di tempo di risposta (se il job notturno impiega 2 ore va bene). È semplice da gestire (uno script schedulato), robusta, economica. La <strong>online inference</strong> ottimizza la LATENZA: ogni singola richiesta deve rispondere in millisecondi, il che impone infrastruttura sempre attiva, gestione della concorrenza, ottimizzazione del modello (modelli più piccoli/veloci, caching), e monitoring in tempo reale. È più complessa e costosa, ma necessaria quando la predizione fa parte di un'interazione dal vivo.</p>
<p>Esiste una via di mezzo, la <strong>micro-batch / streaming inference</strong>: raggruppare le richieste che arrivano in una piccola finestra (es. 100ms) e processarle insieme, per avere throughput migliore mantenendo latenza accettabile — usato ad alto volume. E il <strong>feature store</strong> risolve un problema pratico dell'online: le feature spesso richiedono calcoli (aggregazioni, join) troppo lenti da fare in tempo reale; il feature store le pre-calcola in batch e le serve pronte all'online inference, garantendo anche che le STESSE feature siano usate in training e serving (prevenendo il training-serving skew, uno dei bug più insidiosi del ML in produzione).</p>
<p>La scelta batch vs online è una domanda architetturale da colloquio, e la risposta matura parte dai REQUISITI, non dalla tecnologia: "quanto deve essere fresca la predizione?" (se va bene di ieri → batch; se deve riflettere l'azione appena fatta → online), "qual è il volume e il pattern di richieste?", "qual è il budget di latenza?". Molti sistemi usano ENTRAMBE: batch per pre-calcolare la maggior parte (raccomandazioni base aggiornate ogni notte) e online per personalizzare al volo (aggiustare in base al comportamento della sessione corrente). Riconoscere che non è un aut-aut ma una scelta guidata dai requisiti, spesso ibrida, è ciò che distingue chi ha progettato sistemi ML reali.</p>
` },

    {
      type: "exercise", id: "ml-05", kg: 15, title: "Batch o online?",
      task: `<p>Classifica ogni caso d'uso come "batch" o "online" e implementa entrambe le modalità:</p>
<ul>
<li><code>caso_churn_notturno</code>: "calcolare il rischio churn di tutti i clienti ogni notte" &rarr; "batch" o "online"?</li>
<li><code>caso_raccomandazione</code>: "raccomandare un prodotto mentre l'utente naviga" &rarr; ?</li>
<li><code>batch_result</code>: predizione batch su una lista di 5 clienti (usa una list comprehension con la funzione <code>modello</code>)</li>
<li><code>online_result</code>: predizione online su UN cliente</li>
</ul>`,
      setup: `def modello(x):
    return "rischio" if x > 50 else "sicuro"

clienti_batch = [30, 70, 45, 90, 20]
cliente_singolo = 65`,
      starter: `# modello(x): predice per un valore | clienti_batch: lista | cliente_singolo: uno

caso_churn_notturno = ...
caso_raccomandazione = ...

batch_result = [modello(c) for c in clienti_batch]   # tutti in una volta
online_result = modello(cliente_singolo)              # uno solo, subito

print("churn notturno:", caso_churn_notturno)
print("raccomandazione live:", caso_raccomandazione)
print("batch:", batch_result)
print("online:", online_result)`,
      check: `assert caso_churn_notturno == "batch", "churn notturno: grandi volumi periodici -> batch"
assert caso_raccomandazione == "online", "raccomandazione live: una richiesta, subito -> online"
assert batch_result == ["sicuro", "rischio", "sicuro", "rischio", "sicuro"], "batch_result: modello su ogni cliente"
assert online_result == "rischio", "online_result: modello(65) = 'rischio' (65 > 50)"`,
      hint: `<p>"Ogni notte, tutti i clienti" = batch (volume, periodico). "Mentre naviga" = online (uno, subito). Il batch è una list comprehension, l'online una singola chiamata.</p>`,
      solution: `caso_churn_notturno = "batch"
caso_raccomandazione = "online"

batch_result = [modello(c) for c in clienti_batch]
online_result = modello(cliente_singolo)

print("churn notturno:", caso_churn_notturno)
print("raccomandazione live:", caso_raccomandazione)
print("batch:", batch_result)
print("online:", online_result)`
    },

    { type: "theory", title: "Monitoring in produzione", html: `
<p>Un modello in produzione va <strong>sorvegliato</strong> come qualsiasi servizio, MA con metriche in più specifiche del ML. Tre livelli di monitoring:</p>
<ul>
<li><strong>Operativo</strong>: latenza, throughput, tasso di errore, uso risorse (come ogni API);</li>
<li><strong>Qualità delle predizioni</strong>: accuratezza/metriche nel tempo (quando arriva il ground truth);</li>
<li><strong>Dati</strong>: distribuzione degli input e degli output (per rilevare il drift).</li>
</ul>
<pre><code># metriche da tracciare per finestra temporale:
metriche = {
    "latenza_p95_ms": 45,
    "richieste_al_min": 1200,
    "accuracy_settimanale": 0.84,   # scesa da 0.89!
    "media_feature_1": 62.3,        # era 50 al training: drift?
}</code></pre>
`, more: `
<p>La sfida unica del monitoring ML rispetto al software: il <strong>ground truth arriva in ritardo o mai</strong>. Sai se una predizione di churn era giusta solo settimane dopo (quando il cliente resta o se ne va); una diagnosi solo dopo l'esito clinico; alcune predizioni non hanno mai una verità verificabile. Quindi non puoi misurare l'accuratezza in tempo reale come misuri la latenza. Questo rende il monitoring dei DATI (le distribuzioni di input/output, che sono osservabili subito) un proxy essenziale: se gli input iniziano a sembrare diversi da quelli di training, è un allarme PRECOCE che la qualità potrebbe degradare, mesi prima che il ground truth confermi il calo.</p>
<p>Il concetto di <strong>proxy metrics</strong> è quindi centrale: quando non hai il ground truth, monitori segnali correlati alla qualità. La distribuzione delle predizioni (se un modello che prediceva 10% di frodi inizia a predirne 40%, qualcosa è cambiato); la confidenza media (se cala, il modello è meno sicuro); il tasso di predizioni "border-line" vicino alla soglia; i feedback impliciti (gli utenti ignorano le raccomandazioni? cliccano di meno?). Questi proxy non sostituiscono la metrica vera ma la anticipano, permettendo di intervenire prima del disastro.</p>
<p>Un sistema di monitoring maturo ha ALLARMI e AUTOMAZIONE, non solo dashboard: soglie che scattano (latenza p95 sopra X, drift oltre Y, accuratezza sotto Z) e triggerano azioni (notifica al team, retraining automatico, rollback al modello precedente). Il collegamento con la sala Model Evaluation è diretto: le metriche che lì si calcolavano una volta (in validazione), qui si calcolano CONTINUAMENTE nel tempo, e il loro DEGRADO è il segnale d'azione. Un modello non è "finito" quando raggiunge una buona accuratezza in validazione — è un servizio vivo che va sorvegliato per tutta la sua vita in produzione. Chi pensa che il lavoro finisca al deploy non ha mai gestito un modello reale.</p>
` },

    {
      type: "exercise", id: "ml-06", kg: 15, title: "Sorvegliare le metriche",
      task: `<p>Analizza le metriche di monitoring di un modello nel tempo e scatena gli allarmi giusti:</p>
<ul>
<li><code>metriche</code>: dizionario delle metriche correnti (fornito), con soglie di allarme</li>
<li><code>allarme_latenza</code>: <code>True</code> se la latenza p95 supera 100 ms</li>
<li><code>allarme_accuracy</code>: <code>True</code> se l'accuratezza è scesa sotto 0.80 (era 0.89 al training)</li>
<li><code>allarmi_attivi</code>: la lista dei nomi degli allarmi scattati</li>
<li><code>serve_intervento</code>: <code>True</code> se c'è almeno un allarme</li>
</ul>`,
      setup: `metriche = {
    "latenza_p95_ms": 45,
    "accuracy_settimanale": 0.76,   # era 0.89 al training!
    "richieste_al_min": 1200,
}`,
      starter: `# metriche: stato corrente del modello in produzione

allarme_latenza = metriche["latenza_p95_ms"] > 100
allarme_accuracy = ...

allarmi_attivi = []
if allarme_latenza: allarmi_attivi.append("latenza")
if allarme_accuracy: allarmi_attivi.append("accuracy")

serve_intervento = ...

print("allarmi:", allarmi_attivi)
print("serve intervento:", serve_intervento)`,
      check: `assert allarme_latenza == False, "allarme_latenza: 45 < 100 -> no allarme"
assert allarme_accuracy == True, "allarme_accuracy: 0.76 < 0.80 -> allarme! (era 0.89, e' degradato)"
assert allarmi_attivi == ["accuracy"], "allarmi_attivi: solo 'accuracy'"
assert serve_intervento == True, "serve_intervento: True — l'accuratezza degradata richiede indagine/retraining"`,
      hint: `<p><code>allarme_accuracy = metriche["accuracy_settimanale"] &lt; 0.80</code>. <code>serve_intervento = len(allarmi_attivi) &gt; 0</code>. Un calo di accuratezza da 0.89 a 0.76 è il segnale classico di degrado.</p>`,
      solution: `allarme_latenza = metriche["latenza_p95_ms"] > 100
allarme_accuracy = metriche["accuracy_settimanale"] < 0.80

allarmi_attivi = []
if allarme_latenza: allarmi_attivi.append("latenza")
if allarme_accuracy: allarmi_attivi.append("accuracy")

serve_intervento = len(allarmi_attivi) > 0

print("allarmi:", allarmi_attivi)
print("serve intervento:", serve_intervento)`
    },

    { type: "theory", title: "Data drift e concept drift", html: `
<p>Il nemico numero uno di un modello in produzione: il mondo cambia, ma il modello resta fermo a com'era al training. Due tipi di deriva:</p>
<ul>
<li><strong>Data drift</strong> (covariate shift): la distribuzione degli INPUT cambia. Es. l'età media dei clienti sale, arrivano nuove aree geografiche. Le feature non sono più come quelle di training.</li>
<li><strong>Concept drift</strong>: cambia la RELAZIONE tra input e output. Es. dopo una crisi economica, gli stessi profili di cliente si comportano diversamente. La regola che il modello ha imparato non vale più.</li>
</ul>
<pre><code># rilevare data drift: confronta le distribuzioni
media_training = 50
media_produzione = 62      # la feature e' derivata
# test statistico (es. Kolmogorov-Smirnov) o soglia sulla differenza</code></pre>
`, more: `
<p>La distinzione è sottile ma cruciale per la diagnosi. Il <strong>data drift</strong> riguarda P(X) — la distribuzione delle feature cambia, ma la relazione X→y potrebbe reggere ancora. Esempio: il tuo modello di prezzi immobiliari vede case sempre più grandi (drift dell'input), ma "più grande = più caro" resta vero. Il <strong>concept drift</strong> riguarda P(y|X) — la RELAZIONE cambia. Esempio: dopo una crisi, case della stessa metratura e zona valgono meno (la mappa input→prezzo si è spostata). Il data drift può degradare il modello (opera su input fuori distribuzione, dove è meno affidabile) ma il concept drift lo INVALIDA (ha imparato una regola che non vale più). Riconoscere quale dei due stai affrontando guida la cura.</p>
<p>Rilevare il drift senza ground truth è l'arte pratica: per il DATA drift bastano gli input (osservabili subito) — confronti la distribuzione delle feature in produzione con quella di training usando test statistici (Kolmogorov-Smirnov per feature continue, chi-quadro per categoriche — sala Statistica) o metriche di distanza tra distribuzioni (PSI, population stability index, molto usato nel credit scoring). Per il CONCEPT drift servono le predizioni E il ground truth (che arriva in ritardo), oppure proxy come il calo di confidenza o l'aumento del disaccordo tra modelli. Il data drift è quindi un allarme PRECOCE ed economico; il concept drift si conferma dopo, quando arriva la verità.</p>
<p>La cura del drift chiude il ciclo di vita MLOps: quando il monitoring rileva drift significativo, si TRIGGERA il retraining su dati recenti che riflettono la nuova realtà. Le strategie: retraining schedulato (ogni settimana/mese, semplice ma può essere troppo tardi o spreco); retraining triggerato dal drift (efficiente, riaddestra solo quando serve); online learning continuo (il modello si aggiorna in tempo reale, potente ma rischioso e complesso). La scelta dipende da quanto velocemente il fenomeno deriva: previsioni meteo derivano in fretta, un modello di riconoscimento di cifre scritte a mano quasi mai. Il drift è il motivo profondo per cui MLOps esiste: un modello non è un artefatto statico da costruire una volta, ma un sistema vivo che il mondo continua a rendere obsoleto, e che va monitorato e rinnovato per tutta la sua vita — è la lezione finale che unisce tutta questa sala.</p>
` },

    {
      type: "exercise", id: "ml-07", kg: 20, title: "Rilevare il data drift",
      task: `<p>Rileva data drift confrontando la distribuzione di una feature tra training e produzione. Usa una soglia sulla differenza normalizzata:</p>
<ul>
<li><code>drift_score</code>: la differenza assoluta tra media di produzione e media di training, normalizzata per la std di training: <code>abs(media_prod - media_train) / std_train</code></li>
<li><code>c_e_drift</code>: <code>True</code> se il drift_score supera 1.0 (la media è slittata di oltre 1 std)</li>
<li><code>feature_1_drift</code>, <code>feature_2_drift</code>: applica il calcolo alle due feature</li>
<li><code>quali_drift</code>: la lista delle feature in drift (tra "f1", "f2")</li>
</ul>`,
      setup: `import numpy as np
# statistiche al training
train_stats = {
    "f1": {"media": 50.0, "std": 10.0},
    "f2": {"media": 100.0, "std": 20.0},
}
# statistiche osservate in produzione
prod_stats = {
    "f1": {"media": 68.0},   # slittata molto (era 50)
    "f2": {"media": 105.0},  # slittata poco (era 100)
}`,
      starter: `# train_stats / prod_stats: medie e std delle feature

def drift_score(media_prod, media_train, std_train):
    return abs(media_prod - media_train) / std_train

feature_1_drift = drift_score(prod_stats["f1"]["media"], train_stats["f1"]["media"], train_stats["f1"]["std"])
feature_2_drift = ...

c_e_drift_f1 = feature_1_drift > 1.0
c_e_drift_f2 = feature_2_drift > 1.0

quali_drift = ...

print(f"drift f1: {feature_1_drift:.2f} | drift f2: {feature_2_drift:.2f}")
print("feature in drift:", quali_drift)`,
      check: `def _ds(mp, mt, st): return abs(mp - mt) / st
_f1 = _ds(68.0, 50.0, 10.0); _f2 = _ds(105.0, 100.0, 20.0)
assert abs(feature_1_drift - _f1) < 1e-9 and abs(feature_1_drift - 1.8) < 1e-9, "feature_1_drift: |68-50|/10 = 1.8"
assert abs(feature_2_drift - _f2) < 1e-9 and abs(feature_2_drift - 0.25) < 1e-9, "feature_2_drift: |105-100|/20 = 0.25"
assert quali_drift == ["f1"], "quali_drift: solo f1 (drift 1.8 > 1.0); f2 (0.25) e' stabile"`,
      hint: `<p><code>feature_2_drift = drift_score(prod_stats["f2"]["media"], train_stats["f2"]["media"], train_stats["f2"]["std"])</code>. f1 è slittata di 1.8 std (drift!), f2 solo 0.25 (ok). <code>quali_drift = [f for f, s in [("f1",feature_1_drift),("f2",feature_2_drift)] if s > 1.0]</code>.</p>`,
      solution: `def drift_score(media_prod, media_train, std_train):
    return abs(media_prod - media_train) / std_train

feature_1_drift = drift_score(prod_stats["f1"]["media"], train_stats["f1"]["media"], train_stats["f1"]["std"])
feature_2_drift = drift_score(prod_stats["f2"]["media"], train_stats["f2"]["media"], train_stats["f2"]["std"])

c_e_drift_f1 = feature_1_drift > 1.0
c_e_drift_f2 = feature_2_drift > 1.0

quali_drift = [f for f, s in [("f1", feature_1_drift), ("f2", feature_2_drift)] if s > 1.0]

print(f"drift f1: {feature_1_drift:.2f} | drift f2: {feature_2_drift:.2f}")
print("feature in drift:", quali_drift)`
    },

    {
      type: "exercise", id: "ml-08", kg: 20, title: "Data drift con test statistico",
      task: `<p>Rileva il drift in modo rigoroso col test di Kolmogorov-Smirnov (confronta due distribuzioni). Usa scipy... anzi, questa sala è pura Python: usa una soglia sulla differenza delle medie normalizzata E confronta anche le std.</p>
<ul>
<li>hai due campioni: <code>train_sample</code> e <code>prod_sample</code> (fornite come liste)</li>
<li><code>media_train</code>, <code>media_prod</code>: le medie dei due campioni (a mano: sum/len)</li>
<li><code>shift_medie</code>: la differenza assoluta tra le medie</li>
<li><code>drift_significativo</code>: <code>True</code> se lo shift supera il 20% della media di training (drift rilevante)</li>
</ul>`,
      setup: `train_sample = [48, 52, 50, 49, 51, 53, 47, 50, 52, 48]
prod_sample = [70, 68, 72, 69, 71, 67, 73, 70, 68, 72]`,
      starter: `# train_sample / prod_sample: valori di una feature nei due periodi

media_train = sum(train_sample) / len(train_sample)
media_prod = ...
shift_medie = ...
drift_significativo = ...   # shift > 20% della media di training

print(f"media training: {media_train:.1f} | media produzione: {media_prod:.1f}")
print(f"shift: {shift_medie:.1f} | drift significativo: {drift_significativo}")`,
      check: `_mt = sum(train_sample)/len(train_sample)
_mp = sum(prod_sample)/len(prod_sample)
_sh = abs(_mp - _mt)
assert abs(media_prod - _mp) < 1e-9, "media_prod: sum(prod_sample)/len(prod_sample)"
assert abs(shift_medie - _sh) < 1e-9, "shift_medie: abs(media_prod - media_train)"
assert drift_significativo == bool(_sh > 0.2 * _mt), "drift_significativo: shift > 20% della media training -> True (media salita da ~50 a ~70)"
assert drift_significativo == True, "il campione di produzione e' chiaramente slittato: drift!"`,
      hint: `<p><code>media_prod = sum(prod_sample)/len(prod_sample)</code> (~70). <code>shift_medie = abs(media_prod - media_train)</code> (~20). <code>drift_significativo = shift_medie &gt; 0.2 * media_train</code> — 20 &gt; 10, quindi drift.</p>`,
      solution: `media_train = sum(train_sample) / len(train_sample)
media_prod = sum(prod_sample) / len(prod_sample)
shift_medie = abs(media_prod - media_train)
drift_significativo = shift_medie > 0.2 * media_train

print(f"media training: {media_train:.1f} | media produzione: {media_prod:.1f}")
print(f"shift: {shift_medie:.1f} | drift significativo: {drift_significativo}")`
    },

    {
      type: "exercise", id: "ml-09", kg: 15, title: "Quiz: MLOps",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "L'experiment tracking serve a rendere gli esperimenti riproducibili e confrontabili"</li>
<li><code>a2</code>: "Caricare un pickle da fonte non fidata è sicuro"</li>
<li><code>a3</code>: "Il data drift è quando cambia la distribuzione degli INPUT rispetto al training"</li>
<li><code>a4</code>: "La batch inference ottimizza la latenza per singola richiesta in tempo reale"</li>
<li><code>a5</code>: "Un model registry con stadi permette il rollback a una versione precedente"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: tracking = riproducibilita' + confronto"
assert a2 == False, "a2 FALSA: pickle da fonte non fidata puo' eseguire codice arbitrario — MAI"
assert a3 == True, "a3 VERA: data drift = cambia P(X), la distribuzione degli input"
assert a4 == False, "a4 FALSA: e' l'ONLINE inference a ottimizzare la latenza; la batch ottimizza il throughput"
assert a5 == True, "a5 VERA: gli stadi (production/archived) permettono rollback istantaneo"`,
      hint: `<p>Le trappole: a2 (pickle non fidato è pericoloso) e a4 (batch = throughput, online = latenza). Le altre riprendono le lavagne: tracking (a1), data drift (a3), registry e rollback (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = False
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "ml-10", kg: 25, title: "MASSIMALE: il ciclo MLOps completo",
      task: `<p>Il gran finale: orchestra un ciclo MLOps completo — traccia esperimenti, promuovi il migliore, servi, monitora il drift, decidi il retraining.</p>
<ul>
<li>dai run in <code>esperimenti</code>, trova il migliore per f1 &rarr; <code>modello_scelto</code></li>
<li>simula il deploy: <code>in_produzione</code> = versione del modello scelto</li>
<li>monitora: dato <code>drift_score</code> e <code>accuracy_attuale</code>, decidi se serve retraining</li>
<li><code>serve_retraining</code>: <code>True</code> se drift &gt; 1.5 OPPURE accuracy &lt; 0.80</li>
<li><code>report</code>: dizionario con "modello_in_prod", "f1_scelto", "serve_retraining", "motivo" ("drift" se drift alto, "accuracy" se accuracy bassa, "nessuno" se ok)</li>
<li><code>ciclo_completo</code>: <code>True</code> se il report è coerente</li>
</ul>`,
      setup: `esperimenti = [
    {"versione": "v1", "f1": 0.81},
    {"versione": "v2", "f1": 0.88},
    {"versione": "v3", "f1": 0.85},
]
drift_score = 1.8       # drift alto!
accuracy_attuale = 0.83`,
      starter: `# esperimenti: run tracciati | drift_score, accuracy_attuale: monitoring

modello_scelto = max(esperimenti, key=lambda r: r["f1"])
in_produzione = modello_scelto["versione"]

drift_alto = drift_score > 1.5
accuracy_bassa = accuracy_attuale < 0.80
serve_retraining = ...

if drift_alto:
    motivo = "drift"
elif accuracy_bassa:
    motivo = "accuracy"
else:
    motivo = "nessuno"

report = {
    "modello_in_prod": in_produzione,
    "f1_scelto": modello_scelto["f1"],
    "serve_retraining": serve_retraining,
    "motivo": motivo,
}
ciclo_completo = ...

print("REPORT:", report)`,
      check: `_best = max(esperimenti, key=lambda r: r["f1"])
assert modello_scelto["versione"] == "v2", "modello_scelto: v2 (f1 0.88, il migliore)"
assert in_produzione == "v2", "in_produzione: v2"
assert serve_retraining == True, "serve_retraining: True — drift 1.8 > 1.5"
assert report["motivo"] == "drift", "motivo: 'drift' (il drift alto ha priorita')"
assert ciclo_completo == True, "ciclo_completo: True"`,
      hint: `<p><code>serve_retraining = drift_alto or accuracy_bassa</code>. Il drift (1.8 &gt; 1.5) scatena il retraining con motivo "drift". <code>ciclo_completo = report["serve_retraining"] == True and report["modello_in_prod"] == "v2"</code>.</p>`,
      solution: `modello_scelto = max(esperimenti, key=lambda r: r["f1"])
in_produzione = modello_scelto["versione"]

drift_alto = drift_score > 1.5
accuracy_bassa = accuracy_attuale < 0.80
serve_retraining = drift_alto or accuracy_bassa

if drift_alto:
    motivo = "drift"
elif accuracy_bassa:
    motivo = "accuracy"
else:
    motivo = "nessuno"

report = {
    "modello_in_prod": in_produzione,
    "f1_scelto": modello_scelto["f1"],
    "serve_retraining": serve_retraining,
    "motivo": motivo,
}
ciclo_completo = report["serve_retraining"] == True and report["modello_in_prod"] == "v2"

print("REPORT:", report)`
    }

  ]
});
