window.MODULES.push({
  id: "system-design",
  name: "System Design ML",
  tagline: "La sala del progetto in grande: architettura di sistemi ML end-to-end. Dati, training, serving, monitoring che reggono la produzione.",
  intro: "L'ultima sala: progettare un sistema ML completo, non solo un modello. Come i colloqui di system design delle big tech — architettura di dati, feature, training, serving, monitoring. Metti insieme tutto il percorso: pipeline, scalabilità, latenza, affidabilità. Puro ragionamento architetturale.",
  packages: [],
  items: [

    { type: "theory", title: "Anatomia di un sistema ML", html: `
<p>Un sistema ML in produzione è molto più del modello: il modello è una piccola scatola circondata da infrastruttura. I componenti di un system design ML completo:</p>
<ol>
<li><strong>Data pipeline</strong>: raccolta, pulizia, storage dei dati (batch e/o streaming);</li>
<li><strong>Feature engineering / feature store</strong>: calcolo e servizio delle feature, coerenti tra training e serving;</li>
<li><strong>Training pipeline</strong>: addestramento riproducibile, tuning, validazione;</li>
<li><strong>Model registry</strong>: versioning e promozione dei modelli;</li>
<li><strong>Serving</strong>: batch o online, dietro un'API, scalabile;</li>
<li><strong>Monitoring</strong>: prestazioni, drift, allarmi, feedback loop.</li>
</ol>
<p>Il colloquio di system design valuta se sai orchestrare TUTTI questi pezzi, ragionando su scalabilità, latenza, costo e affidabilità — non se sai il miglior algoritmo.</p>
`, more: `
<p>La famosa figura del paper di Google "Hidden Technical Debt in ML Systems" mostra il codice del modello come una minuscola scatola nera in mezzo a un mare di infrastruttura (raccolta dati, verifica, feature extraction, gestione della configurazione, serving, monitoring, gestione delle risorse). È la lezione centrale del system design ML: il modello è il 5% del lavoro, l'infrastruttura intorno è il 95%. Un colloquio di system design ML valuta proprio se capisci questo — se sai progettare i tubi, non solo scegliere l'algoritmo. Chi si concentra solo sul modello ("userei un transformer") mentre ignora dati, serving e monitoring fallisce il colloquio.</p>
<p>L'approccio a un problema di system design segue un metodo, come per i casi studio ma su scala architetturale: (1) CHIARISCI i requisiti — quanti utenti/richieste? latenza richiesta? batch o real-time? quanto devono essere fresche le predizioni?; (2) stima la SCALA — richieste al secondo, volume di dati, dimensione del modello; (3) disegna i COMPONENTI e i loro collegamenti; (4) approfondisci i punti critici (il collo di bottiglia, il componente più difficile); (5) discuti i TRADE-OFF (latenza vs costo, freschezza vs complessità, accuratezza vs interpretabilità). Il metodo conta più della soluzione: mostra ragionamento strutturato.</p>
<p>I requisiti guidano l'architettura, ed è il primo errore da evitare non chiederli: un sistema di raccomandazione batch (aggiornato ogni notte) ha un'architettura completamente diversa da uno real-time (personalizzato al click); un modello chiamato mille volte al giorno vive su una VM piccola, uno chiamato un milione di volte al secondo richiede caching, load balancing, forse un modello più leggero. "Dipende dai requisiti" non è un'evasione ma la risposta corretta: chiedere scala, latenza, freschezza PRIMA di disegnare è ciò che distingue chi ha progettato sistemi reali. Le sale MLOps, Cloud, API, Spark hanno costruito i mattoni; questa sala li assembla in architetture coerenti guidate dai requisiti.</p>
` },

    {
      type: "exercise", id: "sd-01", kg: 10, title: "I componenti del sistema",
      task: `<p>Ordina i componenti di un sistema ML nel flusso corretto (1-5), dal dato grezzo alla predizione servita:</p>
<ul>
<li><code>ord_data_pipeline</code>: raccolta e storage dei dati</li>
<li><code>ord_features</code>: calcolo delle feature</li>
<li><code>ord_training</code>: addestramento del modello</li>
<li><code>ord_serving</code>: servire le predizioni via API</li>
<li><code>ord_monitoring</code>: sorvegliare in produzione</li>
</ul>`,
      starter: `ord_data_pipeline = 1
ord_features = ...
ord_training = ...
ord_serving = ...
ord_monitoring = ...

print(ord_data_pipeline, ord_features, ord_training, ord_serving, ord_monitoring)`,
      check: `assert ord_data_pipeline == 1, "data pipeline: prima raccogli i dati"
assert ord_features == 2, "features: poi calcoli le feature"
assert ord_training == 3, "training: addestri sul dato+feature"
assert ord_serving == 4, "serving: servi le predizioni"
assert ord_monitoring == 5, "monitoring: sorvegli in produzione (e chiude il ciclo verso il retraining)"`,
      hint: `<p>Il flusso: dati (1) → feature (2) → training (3) → serving (4) → monitoring (5). Il monitoring poi chiude il ciclo triggerando il retraining.</p>`,
      solution: `ord_data_pipeline = 1
ord_features = 2
ord_training = 3
ord_serving = 4
ord_monitoring = 5

print(ord_data_pipeline, ord_features, ord_training, ord_serving, ord_monitoring)`
    },

    { type: "theory", title: "Requisiti: latenza, throughput, freschezza", html: `
<p>Prima di disegnare, quantifica i requisiti — sono loro a decidere l'architettura:</p>
<ul>
<li><strong>Latenza</strong>: quanto veloce deve rispondere una predizione? Millisecondi (online, dietro un'interazione) o irrilevante (batch notturno)?</li>
<li><strong>Throughput</strong>: quante predizioni al secondo? Decide quanto scalare;</li>
<li><strong>Freschezza</strong>: quanto devono essere aggiornate le predizioni/feature? In tempo reale, ogni ora, ogni giorno?</li>
<li><strong>Scala</strong>: quanti dati, quanti utenti, quanto grande il modello?</li>
</ul>
<pre><code># stima rapida: 10M richieste/giorno = ~115 richieste/secondo (media)
# ma i PICCHI possono essere 10x la media -> dimensiona per il picco
richieste_al_sec = 10_000_000 / 86400   # ~116/s media</code></pre>
<p>La regola: <strong>l'architettura segue i requisiti, non viceversa</strong>. Batch vs online, quanto caching, quanta scala — tutto discende da questi numeri.</p>
`, more: `
<p>La stima della scala (back-of-the-envelope) è una competenza da colloquio: da "10 milioni di richieste al giorno" ricavi ~116 al secondo di media, ma i PICCHI (ora di punta, eventi) possono essere 5-10x — e devi dimensionare per il picco, non per la media, o il sistema cade quando serve di più. Da lì derivi quante istanze di serving, quanto caching, se serve una coda per assorbire i picchi. Sbagliare di un ordine di grandezza in questa stima porta a sovra-dimensionare (spreco di costi) o sotto-dimensionare (il sistema crolla). I selezionatori vogliono vedere che sai fare questi conti approssimativi rapidamente.</p>
<p>La FRESCHEZZA è il requisito più sottovalutato e quello che più spesso determina batch vs online. "Quanto vecchia può essere la predizione?" — se una raccomandazione basata sui dati di ieri va bene, un job batch notturno è semplice ed economico; se deve riflettere il click appena fatto, serve online inference con feature in tempo reale, molto più complesso e costoso. Molti sistemi sbagliano progettando real-time quando batch basterebbe (over-engineering) o viceversa. La domanda "quanto devono essere fresche le predizioni?" va posta esplicitamente perché il committente spesso non ci ha pensato.</p>
<p>La gerarchia dei requisiti guida i trade-off: la LATENZA stringente (millisecondi) impone modelli leggeri, caching aggressivo, feature pre-calcolate, forse sacrificando accuratezza per velocità; il THROUGHPUT alto impone scalabilità orizzontale e load balancing; la FRESCHEZZA alta impone pipeline real-time costose. Questi requisiti spesso CONFLIGGONO (freschezza vs semplicità, accuratezza vs latenza) e il system design è l'arte di bilanciarli dato ciò che conta di più per QUEL prodotto. Non esiste l'architettura "migliore" in assoluto — esiste quella giusta per i requisiti specifici, ed è per questo che chiarirli prima è il primo passo obbligato.</p>
` },

    {
      type: "exercise", id: "sd-02", kg: 15, title: "Stimare la scala",
      task: `<p>Stima i requisiti di un sistema da 10 milioni di richieste al giorno e dimensiona per il picco:</p>
<ul>
<li><code>richieste_al_giorno</code>: 10 milioni</li>
<li><code>media_al_sec</code>: richieste al secondo in media (giorno = 86400 secondi)</li>
<li><code>picco_al_sec</code>: il picco, stimato 8× la media</li>
<li><code>istanze_necessarie</code>: se ogni istanza regge 50 richieste/sec, quante istanze servono per il PICCO (arrotonda per eccesso)</li>
<li><code>dimensiona_per_picco</code>: <code>True</code> — si dimensiona per il picco, non per la media</li>
</ul>`,
      starter: `import math
richieste_al_giorno = 10_000_000

media_al_sec = richieste_al_giorno / 86400
picco_al_sec = media_al_sec * 8
istanze_necessarie = math.ceil(picco_al_sec / 50)
dimensiona_per_picco = ...

print(f"media: {media_al_sec:.0f}/s | picco: {picco_al_sec:.0f}/s")
print(f"istanze necessarie (per il picco): {istanze_necessarie}")`,
      check: `import math
_media = 10_000_000 / 86400
_picco = _media * 8
_ist = math.ceil(_picco / 50)
assert abs(media_al_sec - _media) < 1e-6, "media_al_sec: 10M / 86400 = ~116/s"
assert abs(picco_al_sec - _picco) < 1e-6, "picco_al_sec: media * 8 = ~926/s"
assert istanze_necessarie == _ist == 19, "istanze_necessarie: ceil(926/50) = 19"
assert dimensiona_per_picco == True, "dimensiona_per_picco: True — dimensionare per la media farebbe crollare il sistema ai picchi"`,
      hint: `<p>Media ~116/s, picco ~926/s. <code>istanze_necessarie = math.ceil(picco_al_sec / 50)</code> = 19. Si dimensiona per il PICCO: <code>dimensiona_per_picco = True</code>.</p>`,
      solution: `import math
richieste_al_giorno = 10_000_000

media_al_sec = richieste_al_giorno / 86400
picco_al_sec = media_al_sec * 8
istanze_necessarie = math.ceil(picco_al_sec / 50)
dimensiona_per_picco = True

print(f"media: {media_al_sec:.0f}/s | picco: {picco_al_sec:.0f}/s")
print(f"istanze necessarie (per il picco): {istanze_necessarie}")`
    },

    { type: "theory", title: "Il feature store", html: `
<p>Il <strong>feature store</strong> risolve uno dei problemi più insidiosi del ML in produzione: garantire che le feature usate in TRAINING siano le STESSE usate in SERVING. Se differiscono, hai il <em>training-serving skew</em>, un bug silenzioso e devastante.</p>
<pre><code># il feature store centralizza il calcolo delle feature:
# - offline (batch): calcola feature storiche per il training
# - online (real-time): serve le stesse feature, aggiornate, per l'inferenza
# STESSA logica di calcolo -> niente skew</code></pre>
<p>Risolve anche: il <strong>riuso</strong> (le stesse feature servono a più modelli — calcolale una volta), la <strong>freschezza</strong> (feature aggiornate per l'online), e il <strong>point-in-time correctness</strong> (per il training, usare i valori delle feature COM'ERANO al momento storico, non quelli attuali — evitando leakage temporale).</p>
`, more: `
<p>Il <strong>training-serving skew</strong> è un bug tra i più difficili da diagnosticare: il modello funziona in training/test ma sottoperforma in produzione, non per drift o leakage, ma perché le feature calcolate al serving DIFFERISCONO da quelle del training. Cause tipiche: la feature "spesa media ultimi 30 giorni" calcolata in training con una query SQL batch e al serving con codice Python diverso — piccole differenze (arrotondamenti, gestione dei NaN, finestre temporali) producono feature leggermente diverse, e il modello, sensibile, degrada. Il feature store elimina questo alla radice: UNA sola definizione della feature, usata sia offline (training) che online (serving), garantendo coerenza per costruzione.</p>
<p>Il <strong>point-in-time correctness</strong> è la funzione più sottile e preziosa del feature store per il training: quando costruisci il dataset storico, ogni feature deve avere il valore che aveva IN QUEL MOMENTO, non quello attuale. Se addestri a predire un evento di gennaio usando la "spesa totale del cliente" calcolata OGGI (che include gli acquisti fatti dopo gennaio), è leakage temporale. Il feature store con versioning temporale ricostruisce le feature "come erano" a ogni istante storico — un time-travel dei dati che previene questo leakage automaticamente, cosa difficilissima da fare a mano correttamente.</p>
<p>Il feature store abilita anche il RIUSO e la governance a livello organizzativo: in un'azienda con molti modelli, le stesse feature (valore cliente, engagement, rischio) servono a più team; calcolarle una volta in un feature store centralizzato evita duplicazione, incoerenze (due team che calcolano "il valore cliente" in modo leggermente diverso), e spreco. Aggiunge anche documentazione, lineage (da dove viene questa feature), e monitoring delle feature (drift a livello di feature, non solo di modello). Non tutti i progetti ne hanno bisogno — per un singolo modello è over-engineering — ma per organizzazioni ML mature è infrastruttura chiave, e menzionarlo in un colloquio di system design (spiegando che risolve lo skew e abilita il riuso) segnala esperienza in ML di produzione su scala.</p>
` },

    {
      type: "exercise", id: "sd-03", kg: 15, title: "Training-serving skew",
      task: `<p>Dimostra il training-serving skew: la stessa feature calcolata diversamente in training e serving degrada il modello. Poi mostra come il feature store lo risolve:</p>
<ul>
<li><code>feature_training</code>: "spesa media" calcolata come <code>media di [100, 200, 300]</code></li>
<li><code>feature_serving_buggata</code>: stessa feature ma calcolata con una logica diversa (per errore, la SOMMA invece della media)</li>
<li><code>c_e_skew</code>: <code>True</code> se le due differiscono (skew presente)</li>
<li><code>feature_serving_corretta</code>: con un feature store, si usa la STESSA logica del training (la media)</li>
<li><code>skew_risolto</code>: <code>True</code> se la feature corretta coincide con quella di training</li>
</ul>`,
      starter: `dati = [100, 200, 300]

feature_training = sum(dati) / len(dati)   # media, usata in training

# BUG: al serving qualcuno calcola la SOMMA invece della media
feature_serving_buggata = sum(dati)
c_e_skew = ...

# FIX: il feature store impone la STESSA logica -> media
feature_serving_corretta = sum(dati) / len(dati)
skew_risolto = ...

print(f"training: {feature_training} | serving buggato: {feature_serving_buggata}")
print(f"skew: {c_e_skew} | risolto col feature store: {skew_risolto}")`,
      check: `_ft = sum([100,200,300])/3
assert abs(feature_training - _ft) < 1e-9, "feature_training: media = 200"
assert c_e_skew == True, "c_e_skew: True — media (200) != somma (600), le feature differiscono"
assert abs(feature_serving_corretta - _ft) < 1e-9, "feature_serving_corretta: stessa logica = media = 200"
assert skew_risolto == True, "skew_risolto: True — stessa logica in training e serving, niente skew"`,
      hint: `<p><code>c_e_skew = feature_training != feature_serving_buggata</code> (200 vs 600). <code>skew_risolto = feature_serving_corretta == feature_training</code>. Il feature store garantisce UNA sola definizione della feature.</p>`,
      solution: `dati = [100, 200, 300]

feature_training = sum(dati) / len(dati)

feature_serving_buggata = sum(dati)
c_e_skew = feature_training != feature_serving_buggata

feature_serving_corretta = sum(dati) / len(dati)
skew_risolto = feature_serving_corretta == feature_training

print(f"training: {feature_training} | serving buggato: {feature_serving_buggata}")
print(f"skew: {c_e_skew} | risolto col feature store: {skew_risolto}")`
    },

    { type: "theory", title: "Batch vs online: l'architettura di serving", html: `
<p>La scelta di serving determina l'intera architettura. Ricapitolando (dalla sala MLOps) applicato al design:</p>
<ul>
<li><strong>Batch serving</strong>: pre-calcola le predizioni periodicamente e le salva (es. il rischio churn di tutti i clienti ogni notte in un database). Il "serving" è una semplice lettura. Semplice, robusto, economico. Limite: le predizioni non riflettono eventi recenti;</li>
<li><strong>Online serving</strong>: calcola la predizione al momento della richiesta, dietro un'API. Riflette lo stato attuale, ma richiede infrastruttura sempre attiva, bassa latenza, gestione dei picchi;</li>
<li><strong>Ibrido</strong>: pre-calcola in batch il grosso, aggiusta online al volo (es. raccomandazioni base batch + re-ranking real-time sul comportamento della sessione).</li>
</ul>
<p>La scelta segue la FRESCHEZZA richiesta: se le predizioni di ieri vanno bene, batch; se devono riflettere l'ultimo istante, online.</p>
`, more: `
<p>Il <strong>batch serving</strong> è sottovalutato ma spesso la scelta giusta: pre-calcolare tutte le predizioni e servirle come semplici lookup da un database trasforma il "serving" nel problema più facile del mondo (leggere un valore per chiave, latenza minima, throughput enorme, nessun modello da tenere caldo). È adatto quando l'insieme delle entità da predire è noto e limitato (tutti i clienti, tutti i prodotti) e la freschezza giornaliera basta. Molti sistemi che sembrano richiedere ML real-time in realtà funzionano benissimo in batch — il rischio churn, i segmenti clienti, le raccomandazioni "per te" aggiornate ogni notte. Proporre batch quando basta è pragmatismo; forzare online è over-engineering costoso.</p>
<p>L'<strong>online serving</strong> è necessario quando la predizione dipende da input non noti in anticipo (le feature della richiesta corrente) o deve riflettere lo stato dell'istante (il carrello attuale, la sessione in corso, una transazione da valutare ORA per la frode). Impone: infrastruttura sempre attiva (VM/container o serverless con i suoi cold start), bassa latenza (modello leggero, feature pre-calcolate dal feature store, caching), scalabilità per i picchi (load balancing, auto-scaling), e alta affidabilità (fallback se il modello non risponde). È molto più complesso e costoso del batch, e va scelto solo quando la freschezza lo richiede davvero.</p>
<p>L'architettura IBRIDA è spesso la soluzione ottimale nei sistemi maturi: pre-calcolare in batch la parte pesante e stabile (le raccomandazioni candidate, gli score di base) e aggiustare online la parte leggera e volatile (re-ranking sui click della sessione, filtri di contesto). Questo dà il meglio dei due mondi — il grosso del calcolo economico in batch, la personalizzazione fresca in online leggero. I sistemi di raccomandazione di YouTube/Netflix funzionano così: candidate generation in batch (da milioni a centinaia), ranking online (le centinaia ordinate al momento). Riconoscere quando un problema si scompone in "parte batch stabile + parte online volatile" è design di livello avanzato, e mostra che capisci come i sistemi reali bilanciano freschezza, costo e latenza.</p>
` },

    {
      type: "exercise", id: "sd-04", kg: 15, title: "Batch, online o ibrido?",
      task: `<p>Per ogni sistema, scegli l'architettura di serving ("batch", "online" o "ibrido"):</p>
<ul>
<li><code>s_churn_report</code>: report settimanale del rischio churn per il team marketing &rarr; ?</li>
<li><code>s_frode_carta</code>: valutare una transazione con carta MENTRE avviene &rarr; ?</li>
<li><code>s_raccomandazioni</code>: raccomandazioni pre-calcolate ma ri-ordinate sui click della sessione &rarr; ?</li>
<li><code>s_prezzo_dinamico</code>: prezzo di un volo che cambia a ogni ricerca dell'utente &rarr; ?</li>
</ul>`,
      starter: `s_churn_report = "batch"
s_frode_carta = ...
s_raccomandazioni = ...
s_prezzo_dinamico = ...

print(s_churn_report, s_frode_carta, s_raccomandazioni, s_prezzo_dinamico)`,
      check: `assert s_churn_report == "batch", "report settimanale -> batch (freschezza settimanale basta)"
assert s_frode_carta == "online", "frode in tempo reale -> online (decisione all'istante)"
assert s_raccomandazioni == "ibrido", "pre-calcolate + ri-ordinate live -> ibrido"
assert s_prezzo_dinamico == "online", "prezzo che cambia a ogni ricerca -> online (stato dell'istante)"`,
      hint: `<p>Report settimanale = batch (freschezza bassa basta). Frode/prezzo all'istante = online. Raccomandazioni pre-calcolate + re-ranking live = ibrido. La freschezza richiesta decide.</p>`,
      solution: `s_churn_report = "batch"
s_frode_carta = "online"
s_raccomandazioni = "ibrido"
s_prezzo_dinamico = "online"

print(s_churn_report, s_frode_carta, s_raccomandazioni, s_prezzo_dinamico)`
    },

    { type: "theory", title: "Affidabilità: fallback e degradazione", html: `
<p>Un sistema ML in produzione DEVE reggere i guasti: il modello può non rispondere, essere lento, o dare output assurdi. Un buon design prevede la <strong>degradazione elegante</strong>.</p>
<ul>
<li><strong>Fallback</strong>: se il modello non risponde (timeout, errore), cosa servi? Un baseline (il più popolare, la media, la regola semplice) è meglio di un errore;</li>
<li><strong>Timeout</strong>: non aspettare all'infinito una predizione — meglio una risposta di fallback veloce che un utente che aspetta;</li>
<li><strong>Circuit breaker</strong>: se il modello fallisce ripetutamente, smetti di chiamarlo e usa il fallback finché non si riprende;</li>
<li><strong>Validazione dell'output</strong>: se il modello dà un valore assurdo (prezzo negativo, probabilità &gt; 1), intercettalo.</li>
</ul>
<p>Principio: <strong>un sistema ML non deve mai bloccare il prodotto</strong>. Meglio una predizione mediocre servita che nessuna predizione.</p>
`, more: `
<p>La <strong>degradazione elegante</strong> distingue un sistema ML giocattolo da uno di produzione: il modello è un componente che PUÒ fallire (bug, sovraccarico, dipendenza esterna giù, input inatteso), e il sistema deve continuare a funzionare comunque. Il pattern del FALLBACK a un baseline è centrale: se il recommender ML non risponde, servi i prodotti più popolari (peggio ma accettabile); se il modello di pricing è giù, usa il prezzo di listino; se lo scoring del rischio fallisce, applica una regola conservativa. Un errore 500 mostrato all'utente perché "il modello non risponde" è un fallimento di design — l'utente non dovrebbe nemmeno accorgersi che c'era un modello.</p>
<p>Il <strong>circuit breaker</strong> è un pattern preso dai sistemi distribuiti: se un componente (il modello) fallisce ripetutamente, il circuito si "apre" e le chiamate vengono deviate immediatamente al fallback senza nemmeno tentare il modello (che è chiaramente in difficoltà), evitando di accumulare timeout che rallenterebbero tutto il sistema. Dopo un po', il circuito prova a "richiudersi" testando se il modello si è ripreso. Questo protegge il sistema dall'effetto domino (un componente lento che rallenta tutti quelli che lo chiamano) ed è essenziale quando il modello è una dipendenza in una catena di servizi.</p>
<p>La validazione dell'OUTPUT del modello è la difesa finale spesso dimenticata: i modelli possono produrre valori assurdi (un prezzo negativo, una probabilità &gt; 1 per un bug, una predizione fuori da ogni range plausibile) specie su input inattesi o fuori distribuzione. Un guardrail che intercetta e corregge/rifiuta questi output (clamp nel range valido, fallback, alert) previene che un output aberrante del modello si propaghi nel prodotto causando danni. Insieme alla validazione dell'INPUT (sala API), forma i due guardrail ai confini del modello: controlla cosa entra, controlla cosa esce. Un sistema ML robusto tratta il modello come un componente inaffidabile da incapsulare in controlli — non come un oracolo di cui fidarsi ciecamente. Questa mentalità difensiva è ciò che i colloqui di system design senior cercano.</p>
` },

    {
      type: "exercise", id: "sd-05", kg: 20, title: "Fallback e degradazione elegante",
      task: `<p>Implementa un serving con fallback: se il modello fallisce o dà output assurdi, servi un baseline invece di un errore:</p>
<ul>
<li><code>servi_con_fallback</code>: funzione che prova il modello; se lancia eccezione O dà output invalido (fuori [0,1]), usa il fallback (fornita)</li>
<li><code>r_ok</code>: il modello funziona e dà 0.7 &rarr; deve restituire 0.7</li>
<li><code>r_eccezione</code>: il modello lancia errore &rarr; deve restituire il fallback (0.5)</li>
<li><code>r_output_assurdo</code>: il modello dà 1.5 (probabilità &gt; 1!) &rarr; deve restituire il fallback</li>
<li><code>mai_errore_all_utente</code>: <code>True</code> se in tutti i casi si restituisce un valore valido (mai un crash)</li>
</ul>`,
      starter: `FALLBACK = 0.5

def servi_con_fallback(modello_fn, x):
    try:
        pred = modello_fn(x)
        # valida l'output: una probabilita' deve stare in [0, 1]
        if not (0 <= pred <= 1):
            return FALLBACK
        return pred
    except Exception:
        return FALLBACK

# modello che funziona
r_ok = servi_con_fallback(lambda x: 0.7, None)
# modello che lancia eccezione
r_eccezione = servi_con_fallback(lambda x: 1/0, None)
# modello che da' output assurdo
r_output_assurdo = servi_con_fallback(lambda x: 1.5, None)

mai_errore_all_utente = ...

print(f"ok: {r_ok} | eccezione: {r_eccezione} | assurdo: {r_output_assurdo}")`,
      check: `FALLBACK = 0.5
def _s(fn, x):
    try:
        p = fn(x)
        return FALLBACK if not (0 <= p <= 1) else p
    except Exception:
        return FALLBACK
assert r_ok == 0.7, "r_ok: il modello valido restituisce 0.7"
assert r_eccezione == 0.5, "r_eccezione: il fallback (0.5) quando il modello crasha"
assert r_output_assurdo == 0.5, "r_output_assurdo: il fallback quando l'output e' fuori [0,1]"
assert mai_errore_all_utente == True, "mai_errore_all_utente: True — in ogni caso un valore valido, mai un crash"`,
      hint: `<p>La funzione è fornita: verifica i tre casi. <code>mai_errore_all_utente = all(0 &lt;= r &lt;= 1 for r in [r_ok, r_eccezione, r_output_assurdo])</code>. Il sistema non mostra mai un errore all'utente: sempre un fallback valido.</p>`,
      solution: `FALLBACK = 0.5

def servi_con_fallback(modello_fn, x):
    try:
        pred = modello_fn(x)
        if not (0 <= pred <= 1):
            return FALLBACK
        return pred
    except Exception:
        return FALLBACK

r_ok = servi_con_fallback(lambda x: 0.7, None)
r_eccezione = servi_con_fallback(lambda x: 1/0, None)
r_output_assurdo = servi_con_fallback(lambda x: 1.5, None)

mai_errore_all_utente = all(0 <= r <= 1 for r in [r_ok, r_eccezione, r_output_assurdo])

print(f"ok: {r_ok} | eccezione: {r_eccezione} | assurdo: {r_output_assurdo}")`
    },

    { type: "theory", title: "Il monitoring loop e il retraining", html: `
<p>Un sistema ML non è "finito" al deploy: è un ciclo continuo. Il <strong>monitoring loop</strong> chiude il sistema su sé stesso:</p>
<pre><code>deploy -> servi predizioni -> monitora (prestazioni, drift, feedback)
       -> se degrado -> riaddestra -> valida -> ri-deploy -> ...</code></pre>
<p>Cosa monitorare (dalla sala MLOps): metriche operative (latenza, errori), qualità delle predizioni (quando arriva il ground truth), drift dei dati (le distribuzioni cambiano). Cosa triggera il retraining: drift significativo, calo di performance, o semplicemente il passare del tempo (retraining schedulato).</p>
<p>Il <strong>feedback loop</strong>: le predizioni influenzano le azioni, che generano nuovi dati, che riaddestrano il modello. Attenzione ai loop viziosi: un modello che raccomanda sempre le stesse cose riceve feedback solo su quelle, rinforzandosi in una bolla.</p>
`, more: `
<p>Il monitoring loop trasforma il ML da "progetto" (finito al deploy) a "sistema vivo" (mantenuto per tutta la sua vita). I trigger di retraining hanno logiche diverse: SCHEDULATO (ogni settimana/mese — semplice, ma può essere troppo tardi o spreco); su DRIFT (efficiente, riaddestra solo quando i dati cambiano — richiede il monitoring del drift); su CALO di performance (quando arriva il ground truth e la metrica scende sotto soglia — reattivo ma in ritardo). I sistemi maturi combinano: monitoring continuo del drift come allarme precoce, valutazione della performance quando il ground truth arriva, e retraining triggerato da entrambi. Il livello più avanzato è la pipeline di retraining AUTOMATICA (MLOps livello 2): rileva il degrado, riaddestra, valida, e se il nuovo modello batte il vecchio lo promuove — con un umano nel loop per i sistemi critici.</p>
<p>I <strong>feedback loop viziosi</strong> sono un rischio sottile e affascinante dei sistemi ML che agiscono sul mondo: le predizioni influenzano le azioni, che generano i dati futuri, che riaddestrano il modello — e questo può creare cicli di rinforzo pericolosi. Esempi: un recommender che mostra solo contenuti popolari riceve click solo su quelli, "imparando" che solo quelli piacciono, rinforzando la bolla (i contenuti di nicchia non vengono mai mostrati, quindi mai cliccati, quindi giudicati "non graditi"); un modello di polizia predittiva che manda pattuglie dove ha predetto crimini genera più arresti lì, confermando la sua predizione indipendentemente dal crimine reale. Questi loop possono amplificare bias e creare profezie autoavveranti. La difesa richiede exploration (mostrare anche opzioni non ottimali per raccogliere feedback non distorto — il trade-off exploration/exploitation), monitoring dei bias, e consapevolezza che il modello CAMBIA il mondo che poi osserva.</p>
<p>Questa è la lezione finale che unisce tutto il percorso: un sistema ML ben progettato è consapevole di essere PARTE del mondo che modella, non un osservatore neutrale. Chiude il cerchio con i temi ricorrenti — il drift (il mondo cambia), la causalità (il modello agisce, non solo predice), l'etica (i loop possono amplificare ingiustizie), il monitoring (sorvegliare per sempre). Progettare un sistema ML non è scegliere un algoritmo: è orchestrare dati, feature, training, serving e monitoring in un ciclo vivo, robusto ai guasti, consapevole dei propri effetti, e guidato dai requisiti di business. È il culmine di tutto ciò che la palestra ha costruito — dagli array NumPy alle reti neurali fino a questo: pensare in sistemi, non in modelli.</p>
` },

    {
      type: "exercise", id: "sd-06", kg: 20, title: "Il trigger di retraining",
      task: `<p>Implementa la logica di monitoring che decide quando riaddestrare, combinando drift, performance e tempo:</p>
<ul>
<li><code>serve_retraining</code>: funzione che dati (drift_score, accuracy, giorni_da_ultimo_training) restituisce True se: drift &gt; 2.0 OPPURE accuracy &lt; 0.75 OPPURE giorni &gt; 30 (fornita)</li>
<li><code>caso_drift</code>: drift 2.5, accuracy 0.85, 10 giorni &rarr; serve?</li>
<li><code>caso_performance</code>: drift 0.5, accuracy 0.70, 5 giorni &rarr; serve?</li>
<li><code>caso_tutto_ok</code>: drift 0.5, accuracy 0.88, 10 giorni &rarr; serve?</li>
<li><code>caso_tempo</code>: drift 0.5, accuracy 0.88, 40 giorni &rarr; serve? (retraining schedulato)</li>
</ul>`,
      starter: `def serve_retraining(drift_score, accuracy, giorni):
    return drift_score > 2.0 or accuracy < 0.75 or giorni > 30

caso_drift = serve_retraining(2.5, 0.85, 10)
caso_performance = ...
caso_tutto_ok = ...
caso_tempo = ...

print(f"drift alto: {caso_drift} | performance bassa: {caso_performance}")
print(f"tutto ok: {caso_tutto_ok} | troppo tempo: {caso_tempo}")`,
      check: `def _sr(d, a, g): return d > 2.0 or a < 0.75 or g > 30
assert caso_drift == True, "caso_drift: drift 2.5 > 2.0 -> retraining"
assert caso_performance == True, "caso_performance: accuracy 0.70 < 0.75 -> retraining"
assert caso_tutto_ok == False, "caso_tutto_ok: tutto sotto soglia -> nessun retraining"
assert caso_tempo == True, "caso_tempo: 40 giorni > 30 -> retraining schedulato"`,
      hint: `<p>La funzione è fornita: applicala ai quattro casi. Il retraining scatta per drift alto, performance bassa, O troppo tempo passato — tre trigger indipendenti in OR.</p>`,
      solution: `def serve_retraining(drift_score, accuracy, giorni):
    return drift_score > 2.0 or accuracy < 0.75 or giorni > 30

caso_drift = serve_retraining(2.5, 0.85, 10)
caso_performance = serve_retraining(0.5, 0.70, 5)
caso_tutto_ok = serve_retraining(0.5, 0.88, 10)
caso_tempo = serve_retraining(0.5, 0.88, 40)

print(f"drift alto: {caso_drift} | performance bassa: {caso_performance}")
print(f"tutto ok: {caso_tutto_ok} | troppo tempo: {caso_tempo}")`
    },

    {
      type: "exercise", id: "sd-07", kg: 20, title: "Il feedback loop vizioso",
      task: `<p>Dimostra un feedback loop vizioso: un recommender che mostra solo i popolari riceve click solo su quelli, rinforzando la bolla. Simula 3 cicli:</p>
<ul>
<li>parti con conteggi di click uguali per 3 item, poi a ogni ciclo mostri SOLO l'item più cliccato e i suoi click aumentano</li>
<li><code>click_finali</code>: i conteggi dopo 3 cicli (fornita la simulazione)</li>
<li><code>item_dominante</code>: l'item con più click alla fine</li>
<li><code>bolla_creata</code>: <code>True</code> se un solo item domina nettamente (i suoi click &gt; somma degli altri × 2)</li>
<li><code>serve_exploration</code>: <code>True</code> — mostrare anche item non-top romperebbe la bolla (exploration)</li>
</ul>`,
      starter: `# 3 item, click iniziali uguali
click = {"A": 10, "B": 10, "C": 10}

# feedback loop vizioso: mostro solo il top, che riceve piu' click
for ciclo in range(3):
    top = max(click, key=click.get)
    click[top] += 20   # solo il top viene mostrato e cliccato

click_finali = click
item_dominante = max(click, key=click.get)
altri = sum(v for k, v in click.items() if k != item_dominante)
bolla_creata = ...
serve_exploration = ...

print("click finali:", click_finali)
print(f"dominante: {item_dominante} | bolla: {bolla_creata}")`,
      check: `_c = {"A": 10, "B": 10, "C": 10}
for _ in range(3):
    _t = max(_c, key=_c.get); _c[_t] += 20
_dom = max(_c, key=_c.get); _altri = sum(v for k,v in _c.items() if k != _dom)
assert click_finali == _c, "click_finali: dopo 3 cicli, il top accumula tutti i click"
assert item_dominante == _dom, "item_dominante: quello mostrato ripetutamente"
assert bolla_creata == bool(_c[_dom] > _altri * 2), "bolla_creata: il dominante ha molti piu' click degli altri"
assert bolla_creata == True, "la bolla si e' creata: un item domina"
assert serve_exploration == True, "serve_exploration: True — l'exploration romperebbe il loop vizioso"`,
      hint: `<p><code>bolla_creata = click[item_dominante] &gt; altri * 2</code>. Il loop rinforza il top all'infinito perché gli altri non vengono mai mostrati. La cura è l'exploration: <code>serve_exploration = True</code>.</p>`,
      solution: `click = {"A": 10, "B": 10, "C": 10}

for ciclo in range(3):
    top = max(click, key=click.get)
    click[top] += 20

click_finali = click
item_dominante = max(click, key=click.get)
altri = sum(v for k, v in click.items() if k != item_dominante)
bolla_creata = click[item_dominante] > altri * 2
serve_exploration = True

print("click finali:", click_finali)
print(f"dominante: {item_dominante} | bolla: {bolla_creata}")`
    },

    {
      type: "exercise", id: "sd-08", kg: 15, title: "Quiz: system design ML",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "In un sistema ML, il codice del modello è di solito la parte più piccola dell'infrastruttura"</li>
<li><code>a2</code>: "Il training-serving skew è quando le feature in training e serving sono calcolate diversamente"</li>
<li><code>a3</code>: "Si dimensiona il sistema per il carico MEDIO, non per il picco"</li>
<li><code>a4</code>: "Un buon serving prevede un fallback: mai mostrare un errore invece di una predizione"</li>
<li><code>a5</code>: "Un sistema ML è finito al deploy: non serve monitorarlo dopo"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: il modello e' una piccola scatola in un mare di infrastruttura"
assert a2 == True, "a2 VERA: training-serving skew = feature calcolate diversamente -> il feature store lo risolve"
assert a3 == False, "a3 FALSA: si dimensiona per il PICCO, altrimenti il sistema crolla nei momenti di punta"
assert a4 == True, "a4 VERA: degradazione elegante, mai un errore all'utente"
assert a5 == False, "a5 FALSA: un sistema ML va monitorato per sempre (drift, degrado, retraining)"`,
      hint: `<p>Le trappole: a3 (si dimensiona per il PICCO) e a5 (il monitoring non finisce mai). Le altre riprendono le lavagne: modello ≪ infrastruttura (a1), skew (a2), fallback (a4).</p>`,
      solution: `a1 = True
a2 = True
a3 = False
a4 = True
a5 = False

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "sd-09", kg: 20, title: "Progettare il serving giusto",
      task: `<p>Dato un insieme di requisiti, deriva le scelte architetturali corrette:</p>
<ul>
<li>requisiti: latenza &lt; 100ms, 500 richieste/sec, predizione deve riflettere lo stato attuale</li>
<li><code>tipo_serving</code>: "batch" o "online"? (deve riflettere lo stato attuale + bassa latenza)</li>
<li><code>serve_caching</code>: <code>True</code> — con 500 req/s e latenza stretta, il caching delle feature aiuta</li>
<li><code>serve_load_balancing</code>: <code>True</code> — 500 req/s richiede più istanze bilanciate</li>
<li><code>serve_fallback</code>: <code>True</code> — con latenza &lt; 100ms serve un fallback veloce se il modello è lento</li>
<li><code>architettura_coerente</code>: <code>True</code> se le scelte sono coerenti coi requisiti</li>
</ul>`,
      starter: `# requisiti: latenza < 100ms, 500 req/s, predizione real-time

tipo_serving = "online"
serve_caching = ...
serve_load_balancing = ...
serve_fallback = ...
architettura_coerente = ...

print(f"serving: {tipo_serving}")
print(f"caching: {serve_caching} | load balancing: {serve_load_balancing} | fallback: {serve_fallback}")`,
      check: `assert tipo_serving == "online", "tipo_serving: online — deve riflettere lo stato attuale con bassa latenza"
assert serve_caching == True, "serve_caching: True — bassa latenza + alto volume"
assert serve_load_balancing == True, "serve_load_balancing: True — 500 req/s su piu' istanze"
assert serve_fallback == True, "serve_fallback: True — latenza stretta richiede un fallback veloce"
assert architettura_coerente == True, "architettura_coerente: True"`,
      hint: `<p>Real-time + bassa latenza = online. Alto volume + latenza stretta → caching e load balancing. Latenza stretta → fallback veloce. Tutto True: <code>architettura_coerente = serve_caching and serve_load_balancing and serve_fallback</code>.</p>`,
      solution: `tipo_serving = "online"
serve_caching = True
serve_load_balancing = True
serve_fallback = True
architettura_coerente = serve_caching and serve_load_balancing and serve_fallback

print(f"serving: {tipo_serving}")
print(f"caching: {serve_caching} | load balancing: {serve_load_balancing} | fallback: {serve_fallback}")`
    },

    {
      type: "exercise", id: "sd-10", kg: 25, title: "MASSIMALE: il sistema ML completo",
      task: `<p>Il gran finale del percorso: progetta l'architettura di un sistema ML end-to-end. "Sistema di raccomandazione per un e-commerce, 5M utenti, deve riflettere il comportamento della sessione." Assembla tutti i componenti.</p>
<ul>
<li><code>architettura</code>: dict che assegna la scelta giusta a ogni componente (da completare): "storage"&rarr;"object_storage", "feature"&rarr;"feature_store" (contro lo skew), "training"&rarr;"batch", "serving"&rarr;"ibrido" (candidati batch + re-ranking online), "monitoring"&rarr;"drift_e_performance"</li>
<li><code>gestisce_skew</code>: <code>True</code> se usa un feature store</li>
<li><code>gestisce_cold_start</code>: <code>True</code> — per nuovi utenti serve un fallback (popolari)</li>
<li><code>gestisce_guasti</code>: <code>True</code> — serve un fallback se il modello non risponde</li>
<li><code>chiude_il_loop</code>: <code>True</code> se c'è monitoring che triggera il retraining</li>
<li><code>sistema_completo</code>: <code>True</code> se tutti gli aspetti sono coperti</li>
</ul>`,
      starter: `# e-commerce recommender, 5M utenti, personalizzazione di sessione

architettura = {
    "storage": "object_storage",
    "feature": "feature_store",       # coerenza training/serving
    "training": "batch",              # riaddestramento periodico
    "serving": ...,                   # candidati batch + re-ranking sulla sessione -> ?
    "monitoring": "drift_e_performance",
}

gestisce_skew = architettura["feature"] == "feature_store"
gestisce_cold_start = True   # fallback sui popolari per nuovi utenti
gestisce_guasti = True       # fallback se il modello non risponde
chiude_il_loop = architettura["monitoring"] == "drift_e_performance"
sistema_completo = ...

print("architettura:", architettura)
print(f"skew: {gestisce_skew} | cold start: {gestisce_cold_start} | guasti: {gestisce_guasti} | loop: {chiude_il_loop}")`,
      check: `assert architettura["feature"] == "feature_store", "feature: feature_store contro il training-serving skew"
assert architettura["serving"] == "ibrido", "serving: ibrido — candidati in batch + re-ranking online sulla sessione"
assert gestisce_skew == True, "gestisce_skew: True (feature store)"
assert gestisce_cold_start == True and gestisce_guasti == True, "cold start e guasti gestiti con fallback"
assert chiude_il_loop == True, "chiude_il_loop: monitoring -> retraining"
assert sistema_completo == True, "sistema_completo: tutti gli aspetti coperti"`,
      hint: `<p>Il serving è "ibrido" (candidati batch + re-ranking di sessione online). <code>sistema_completo = gestisce_skew and gestisce_cold_start and gestisce_guasti and chiude_il_loop</code>. È il sistema completo: storage, feature store (skew), training batch, serving ibrido, monitoring che chiude il ciclo, più i fallback per cold start e guasti.</p>`,
      solution: `architettura = {
    "storage": "object_storage",
    "feature": "feature_store",
    "training": "batch",
    "serving": "ibrido",
    "monitoring": "drift_e_performance",
}

gestisce_skew = architettura["feature"] == "feature_store"
gestisce_cold_start = True
gestisce_guasti = True
chiude_il_loop = architettura["monitoring"] == "drift_e_performance"
sistema_completo = gestisce_skew and gestisce_cold_start and gestisce_guasti and chiude_il_loop

print("architettura:", architettura)
print(f"skew: {gestisce_skew} | cold start: {gestisce_cold_start} | guasti: {gestisce_guasti} | loop: {chiude_il_loop}")`
    }

  ]
});
