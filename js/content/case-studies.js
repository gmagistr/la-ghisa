window.MODULES.push({
  id: "case-studies",
  name: "Casi Studio",
  tagline: "La sala dei problemi veri: churn, recommender, frodi, valutare un chatbot. Dal problema di business alla soluzione ML.",
  intro: "\"Netflix perde utenti, da dove inizi?\" I casi studio dei colloqui non chiedono codice ma RAGIONAMENTO: tradurre un problema di business in un problema ML, scegliere dati, metriche e approccio. Qui li affronti passo passo, con la logica costruita nelle sale precedenti. Puro Python + NumPy.",
  packages: ["numpy"],
  items: [

    { type: "theory", title: "Dal problema di business al problema ML", html: `
<p>Un caso studio inizia sempre da un problema vago di business ("perdiamo clienti", "le vendite calano") e chiede di trasformarlo in un problema ML ben posto. Il framework di ragionamento:</p>
<ol>
<li><strong>Chiarisci l'obiettivo</strong>: cosa vuole DAVVERO il business? (ridurre il churn? aumentare i ricavi?)</li>
<li><strong>Formula il problema ML</strong>: classificazione? regressione? ranking? È supervisionato? Qual è la <em>target</em>?</li>
<li><strong>Definisci la metrica</strong>: quella di business (ricavi salvati) E quella tecnica (recall, AUC), allineate;</li>
<li><strong>Pensa ai dati</strong>: cosa abbiamo? cosa serve? c'è rischio di leakage?</li>
<li><strong>Parti dal baseline</strong>: la soluzione più semplice che potrebbe funzionare, poi complica se serve.</li>
</ol>
<p>La chiave: NON saltare al modello. Il 90% del valore sta nel formulare bene il problema.</p>
`, more: `
<p>L'errore più comune nei casi studio è saltare subito a "userei una Random Forest / un transformer" senza aver capito il problema. I selezionatori vogliono vedere il RAGIONAMENTO a monte: chiedere chiarimenti (l'obiettivo è sotto-specificato apposta), definire cosa si predice esattamente e a quale orizzonte, allineare la metrica tecnica con l'obiettivo di business. "Ridurre il churn" non è un problema ML finché non lo traduci in "predire quali clienti abbandoneranno nei prossimi 30 giorni, per intervenire" — con una definizione precisa di target (churn = nessun acquisto in 30 giorni? disdetta esplicita?), orizzonte, e azione conseguente.</p>
<p>Il collegamento metrica tecnica ↔ metrica di business è dove si distingue il senior: una AUC alta non serve a nulla se non si traduce in valore. Per il churn: la metrica tecnica (recall sui churner) va legata a quella di business (clienti trattenuti × valore per cliente − costo delle campagne di retention). Questo richiede di sapere il COSTO dell'azione (una campagna di retention costa X) e il VALORE dell'esito (un cliente trattenuto vale Y), da cui deriva la soglia operativa ottimale. Un modello ottimizzato in astratto senza questo aggancio economico è un esercizio accademico.</p>
<p>Il principio "parti dal baseline" è cruciale e sottovalutato: prima di modelli sofisticati, qual è la soluzione più semplice? Per il churn, una regola tipo "chi non compra da 60 giorni è a rischio" è un baseline che potrebbe già catturare gran parte del valore, è interpretabile, e dà il riferimento contro cui misurare i modelli complessi. Molti problemi di business si risolvono con regole semplici o modelli lineari; la complessità va aggiunta solo se dimostra di valere il suo costo. Proporre il baseline PRIMA del modello sofisticato è segno di pragmatismo ingegneristico, non di pigrizia — e spesso il baseline è ciò che va davvero in produzione.</p>
` },

    {
      type: "exercise", id: "cs-01", kg: 10, title: "Tradurre il problema",
      task: `<p>"Netflix perde utenti." Traduci in un problema ML ben posto assegnando ogni pezzo:</p>
<ul>
<li><code>tipo_problema</code>: "classificazione" o "regressione"? (predire SE un utente abbandonerà)</li>
<li><code>target</code>: la stringa "churn_30_giorni" — cosa predici esattamente (abbandono nei prossimi 30 giorni)</li>
<li><code>metrica_tecnica</code>: "recall" — vogliamo BECCARE i churner (i mancati sono clienti persi)</li>
<li><code>metrica_business</code>: la stringa "clienti_trattenuti" — l'obiettivo reale</li>
<li><code>parti_da_baseline</code>: <code>True</code> — prima una regola semplice (es. "inattivo da X giorni"), poi il modello</li>
</ul>`,
      starter: `# "Netflix perde utenti, da dove inizi?"

tipo_problema = "classificazione"
target = "churn_30_giorni"
metrica_tecnica = ...
metrica_business = ...
parti_da_baseline = ...

print(f"problema: {tipo_problema} | target: {target}")
print(f"metriche: {metrica_tecnica} (tecnica), {metrica_business} (business)")`,
      check: `assert tipo_problema == "classificazione", "tipo_problema: predire SE abbandona -> classificazione binaria"
assert target == "churn_30_giorni", "target: definizione precisa di churn con orizzonte"
assert metrica_tecnica == "recall", "metrica_tecnica: recall — beccare i churner (i mancati sono clienti persi)"
assert metrica_business == "clienti_trattenuti", "metrica_business: l'obiettivo reale, allineato al recall"
assert parti_da_baseline == True, "parti_da_baseline: True — prima una regola semplice, poi il modello"`,
      hint: `<p>Predire SE (sì/no) = classificazione. Vogliamo beccare i churner → recall. La metrica di business è i clienti trattenuti. E si parte sempre da un baseline semplice.</p>`,
      solution: `tipo_problema = "classificazione"
target = "churn_30_giorni"
metrica_tecnica = "recall"
metrica_business = "clienti_trattenuti"
parti_da_baseline = True

print(f"problema: {tipo_problema} | target: {target}")
print(f"metriche: {metrica_tecnica} (tecnica), {metrica_business} (business)")`
    },

    { type: "theory", title: "Caso: churn prediction", html: `
<p>Il <strong>churn</strong> (abbandono clienti) è il caso studio più comune. Il ragionamento completo:</p>
<ul>
<li><strong>Target</strong>: definisci il churn precisamente (nessun acquisto/accesso in N giorni? disdetta esplicita?) e l'orizzonte (prossimi 30 giorni);</li>
<li><strong>Feature</strong>: recency (giorni dall'ultimo accesso), frequency (quanto usa il servizio), monetary (quanto spende), trend (l'uso sta calando?), engagement;</li>
<li><strong>Attenzione al leakage temporale</strong>: le feature devono usare solo dati PRIMA del momento di predizione;</li>
<li><strong>Metrica</strong>: recall (beccare i churner) bilanciato con la precision (non sprecare campagne su chi resterebbe comunque);</li>
<li><strong>Azione</strong>: il modello serve a INTERVENIRE (offerte di retention) — quindi conta il valore netto: (clienti salvati × valore) − (costo campagne).</li>
</ul>
`, more: `
<p>Il framework <strong>RFM</strong> (Recency, Frequency, Monetary) è il punto di partenza classico per il churn e per la segmentazione clienti: quanto di recente ha interagito, quanto spesso, quanto ha speso. Sono feature potenti, interpretabili e quasi sempre disponibili. La RECENCY in particolare (giorni dall'ultima attività) è spesso il predittore singolo più forte del churn — chi non si vede da tanto probabilmente sta andando via. Un baseline basato solo sulla recency ("a rischio se inattivo da &gt; N giorni") cattura sorprendentemente tanto valore ed è il riferimento contro cui misurare modelli più complessi.</p>
<p>Il leakage temporale è il rischio numero uno nel churn e va gestito con cura: le feature devono essere calcolate a una DATA DI RIFERIMENTO (cutoff), usando solo dati precedenti, e il target guarda i 30 giorni SUCCESSIVI a quella data. Costruire feature su "tutto lo storico" incluso il periodo del target è leakage garantito — il modello sembra perfetto in backtest e fallisce in produzione. La validazione deve essere temporale (train su un periodo, test sul periodo successivo, sala Time Series), mai casuale, perché il churn ha una dimensione temporale intrinseca.</p>
<p>L'aggancio all'AZIONE è ciò che rende il churn un problema di business, non accademico: il modello non serve a "sapere chi abbandona" ma a INTERVENIRE (offerte, contatti, sconti). Questo cambia tutto: (1) la soglia va tarata sul valore netto — intervenire su chi ha alta probabilità di churn E alto valore, non su tutti; (2) serve considerare chi sarebbe rimasto COMUNQUE (intervenire su di loro spreca budget) e chi è irrecuperabile (intervenire è inutile) — idealmente si predice l'UPLIFT dell'intervento, non solo il churn (uplift modeling, concetto avanzato che impressiona); (3) la metrica finale è economica: ricavi trattenuti meno costo delle campagne. Un modello di churn che ignora l'azione e il suo costo ottimizza la metrica sbagliata.</p>
` },

    {
      type: "exercise", id: "cs-02", kg: 15, title: "Feature RFM per il churn",
      task: `<p>Costruisci le feature RFM per predire il churn da dati di transazioni. Per ogni cliente calcola recency, frequency, monetary:</p>
<ul>
<li>dato <code>oggi=100</code> (giorno di riferimento) e le transazioni per cliente (giorno, importo)</li>
<li><code>recency</code>: giorni dall'ultima transazione (oggi - giorno_ultima) per il cliente "A"</li>
<li><code>frequency</code>: numero di transazioni di "A"</li>
<li><code>monetary</code>: spesa totale di "A"</li>
<li><code>a_rischio</code>: <code>True</code> se recency &gt; 30 (baseline: inattivo da oltre un mese)</li>
</ul>`,
      setup: `oggi = 100
transazioni_A = [(20, 50), (45, 30), (60, 80)]   # (giorno, importo) del cliente A`,
      starter: `# transazioni_A: lista di (giorno, importo) | oggi = 100

giorni = [g for g, imp in transazioni_A]
importi = [imp for g, imp in transazioni_A]

recency = oggi - max(giorni)      # giorni dall'ultima transazione
frequency = ...
monetary = ...
a_rischio = ...

print(f"recency: {recency} giorni | frequency: {frequency} | monetary: {monetary}")
print("a rischio churn:", a_rischio)`,
      check: `_giorni = [g for g,i in transazioni_A]; _imp = [i for g,i in transazioni_A]
assert recency == 100 - 60 == 40, "recency: oggi - ultimo giorno (60) = 40"
assert frequency == 3, "frequency: 3 transazioni"
assert monetary == 160, "monetary: 50+30+80 = 160"
assert a_rischio == True, "a_rischio: recency 40 > 30 -> a rischio (baseline)"`,
      hint: `<p><code>frequency = len(transazioni_A)</code>, <code>monetary = sum(importi)</code>. <code>a_rischio = recency &gt; 30</code>. La recency (40 giorni) supera la soglia: il cliente è inattivo da troppo.</p>`,
      solution: `giorni = [g for g, imp in transazioni_A]
importi = [imp for g, imp in transazioni_A]

recency = oggi - max(giorni)
frequency = len(transazioni_A)
monetary = sum(importi)
a_rischio = recency > 30

print(f"recency: {recency} giorni | frequency: {frequency} | monetary: {monetary}")
print("a rischio churn:", a_rischio)`
    },

    {
      type: "exercise", id: "cs-03", kg: 20, title: "Il valore netto dell'intervento",
      task: `<p>Il churn serve a INTERVENIRE. Calcola il valore netto di una campagna di retention e trova la soglia che lo massimizza:</p>
<ul>
<li>ogni cliente salvato vale 200€; ogni campagna costa 20€ (inviata a chi supera la soglia di rischio)</li>
<li>dato il tasso di successo della campagna (30%) e i clienti con probabilità di churn, calcola il valore netto</li>
<li><code>clienti_contattati</code>: quanti clienti hanno prob &gt; soglia 0.5</li>
<li><code>salvati_attesi</code>: clienti_contattati × tasso_successo (0.30)</li>
<li><code>valore_netto</code>: salvati_attesi × 200 − clienti_contattati × 20</li>
<li><code>campagna_conviene</code>: <code>True</code> se il valore netto è positivo</li>
</ul>`,
      setup: `import numpy as np
prob_churn = np.array([0.9, 0.7, 0.6, 0.4, 0.3, 0.8, 0.55, 0.2])
VALORE_CLIENTE = 200
COSTO_CAMPAGNA = 20
TASSO_SUCCESSO = 0.30
soglia = 0.5`,
      starter: `import numpy as np
# prob_churn: probabilita' di churn per 8 clienti

clienti_contattati = int((prob_churn > soglia).sum())
salvati_attesi = ...
valore_netto = ...
campagna_conviene = ...

print(f"clienti contattati: {clienti_contattati}")
print(f"salvati attesi: {salvati_attesi:.1f}")
print(f"valore netto: {valore_netto:.0f} EUR | conviene: {campagna_conviene}")`,
      check: `import numpy as np
_cc = int((prob_churn > 0.5).sum())
_sa = _cc * 0.30
_vn = _sa * 200 - _cc * 20
assert clienti_contattati == 5, "clienti_contattati: 5 clienti con prob > 0.5 (0.9,0.7,0.6,0.8,0.55)"
assert abs(salvati_attesi - _sa) < 1e-9, "salvati_attesi: clienti_contattati * 0.30"
assert abs(valore_netto - _vn) < 1e-9, "valore_netto: salvati*200 - contattati*20"
assert campagna_conviene == True, "campagna_conviene: valore netto positivo (200 EUR)"`,
      hint: `<p><code>salvati_attesi = clienti_contattati * TASSO_SUCCESSO</code>, <code>valore_netto = salvati_attesi * VALORE_CLIENTE - clienti_contattati * COSTO_CAMPAGNA</code>. 5 contattati → 1.5 salvati → 300−100 = 200€ netti.</p>`,
      solution: `import numpy as np

clienti_contattati = int((prob_churn > soglia).sum())
salvati_attesi = clienti_contattati * TASSO_SUCCESSO
valore_netto = salvati_attesi * VALORE_CLIENTE - clienti_contattati * COSTO_CAMPAGNA
campagna_conviene = valore_netto > 0

print(f"clienti contattati: {clienti_contattati}")
print(f"salvati attesi: {salvati_attesi:.1f}")
print(f"valore netto: {valore_netto:.0f} EUR | conviene: {campagna_conviene}")`
    },

    { type: "theory", title: "Caso: sistema di raccomandazione", html: `
<p>"Come costruiresti un recommender?" Il ragionamento:</p>
<ul>
<li><strong>Tipo di problema</strong>: non classificazione ma <em>ranking</em> — ordinare gli item per rilevanza per ogni utente;</li>
<li><strong>Due approcci base</strong>: <em>collaborative filtering</em> (utenti simili a te hanno apprezzato X) e <em>content-based</em> (item simili a quelli che ti sono piaciuti);</li>
<li><strong>Il problema del cold start</strong>: nuovi utenti/item senza storia — servono fallback (popolarità, feature del contenuto);</li>
<li><strong>Metriche</strong>: non accuracy, ma metriche di ranking (precision@K, recall@K, NDCG) — conta l'ordine dei primi K risultati;</li>
<li><strong>Oltre l'accuratezza</strong>: diversità, novità, serendipità — un recommender che suggerisce sempre le stesse cose è noioso.</li>
</ul>
`, more: `
<p>Il <strong>collaborative filtering</strong> (CF) è l'idea fondante: "utenti che hanno apprezzato ciò che piace a te hanno apprezzato anche X". Non serve capire il CONTENUTO degli item, solo il pattern di interazioni utente-item (la matrice di rating/click). La matrix factorization (SVD, sala Matematica) decompone questa matrice sparsa in fattori latenti — ogni utente e ogni item diventano vettori in uno spazio di "gusti" nascosti, e il prodotto scalare predice l'affinità. È l'approccio che ha vinto il Netflix Prize. Il limite: soffre il <strong>cold start</strong> (un nuovo utente/item senza interazioni non ha vettore) e la sparsità estrema (la maggior parte degli utenti non ha interagito con la maggior parte degli item).</p>
<p>Il <strong>content-based</strong> raccomanda item SIMILI (per caratteristiche: genere, autore, tag) a quelli che l'utente ha già apprezzato — usa le feature del contenuto, non il comportamento altrui. Risolve il cold start degli ITEM (un nuovo film si può raccomandare dalle sue caratteristiche) ma non degli UTENTI, e tende a chiudere l'utente in una "bolla" (raccomanda sempre lo stesso genere). I sistemi reali sono IBRIDI: combinano CF e content-based per coprire i rispettivi punti deboli, spesso con un modello di ranking finale (learning to rank) che integra molti segnali.</p>
<p>La metrica giusta è forse il punto più frainteso: un recommender NON si valuta con l'accuracy (predire il rating esatto conta meno di ORDINARE bene). Contano le metriche di RANKING sui primi K risultati (quelli che l'utente vede davvero): precision@K (dei K raccomandati, quanti rilevanti), recall@K, e soprattutto NDCG (che pesa di più le posizioni alte — un item rilevante in cima vale più di uno in fondo). E oltre la rilevanza, i sistemi maturi ottimizzano DIVERSITÀ (non tutti item simili), NOVELTY (non solo i best-seller ovvi), e SERENDIPITÀ (scoperte inaspettate ma gradite) — perché un recommender che azzecca ma è prevedibile e noioso non trattiene gli utenti. La lezione da colloquio: "l'accuratezza del rating non è l'obiettivo; l'engagement lo è, e richiede rilevanza PIÙ diversità".</p>
` },

    {
      type: "exercise", id: "cs-04", kg: 20, title: "Collaborative filtering a mano",
      task: `<p>Implementa il cuore del collaborative filtering: trova utenti simili e raccomanda ciò che hanno apprezzato. Usa la similarità coseno tra i vettori di rating:</p>
<ul>
<li>matrice utenti × item con i rating (fornita); l'utente 0 è quello per cui raccomandare</li>
<li><code>similarita</code>: la similarità coseno tra l'utente 0 e ogni altro utente</li>
<li><code>utente_piu_simile</code>: l'indice dell'utente più simile all'utente 0 (escluso sé stesso)</li>
<li><code>item_da_raccomandare</code>: un item che l'utente simile ha valutato alto (=5) ma l'utente 0 non ha valutato (=0)</li>
</ul>`,
      setup: `import numpy as np
# righe = utenti, colonne = item; 0 = non valutato
ratings = np.array([
    [5, 4, 0, 0, 1],   # utente 0 (target): non ha visto l'item 2
    [5, 5, 5, 0, 2],   # utente 1: gusti simili a 0, e ha amato l'item 2 (=5)
    [1, 0, 5, 4, 0],   # utente 2: gusti diversi
])`,
      starter: `import numpy as np
# ratings: matrice utenti x item

def cos(a, b):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

utente_0 = ratings[0]
similarita = [cos(utente_0, ratings[u]) for u in range(len(ratings))]
# escludi sé stesso (indice 0) cercando il max tra gli altri
utente_piu_simile = ...

# item che il simile ha valutato 5 e l'utente 0 non ha valutato (0)
simile = ratings[utente_piu_simile]
item_da_raccomandare = ...

print("similarita':", [round(s, 2) for s in similarita])
print("utente piu' simile:", utente_piu_simile)`,
      check: `import numpy as np
def _cos(a, b):
    if np.linalg.norm(a)==0 or np.linalg.norm(b)==0: return 0.0
    return float(a @ b / (np.linalg.norm(a)*np.linalg.norm(b)))
_sim = [_cos(ratings[0], ratings[u]) for u in range(len(ratings))]
_ups = max(range(1, len(ratings)), key=lambda u: _sim[u])
assert utente_piu_simile == _ups == 1, "utente_piu_simile: l'utente 1 (gusti simili a 0)"
assert item_da_raccomandare is not None, "item_da_raccomandare: un item che il simile ama e 0 non ha visto"
assert ratings[0][item_da_raccomandare] == 0, "l'item raccomandato non deve essere gia' valutato dall'utente 0"`,
      hint: `<p><code>utente_piu_simile = max(range(1, len(ratings)), key=lambda u: similarita[u])</code> (escludi lo 0). Per l'item: cerca dove <code>simile[i] == 5 and utente_0[i] == 0</code>.</p>`,
      solution: `import numpy as np

def cos(a, b):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

utente_0 = ratings[0]
similarita = [cos(utente_0, ratings[u]) for u in range(len(ratings))]
utente_piu_simile = max(range(1, len(ratings)), key=lambda u: similarita[u])

simile = ratings[utente_piu_simile]
item_da_raccomandare = next(i for i in range(len(simile)) if simile[i] == 5 and utente_0[i] == 0)

print("similarita':", [round(s, 2) for s in similarita])
print("utente piu' simile:", utente_piu_simile)`
    },

    {
      type: "exercise", id: "cs-05", kg: 15, title: "Precision@K per il ranking",
      task: `<p>Un recommender si valuta col ranking, non l'accuracy. Calcola la precision@K: dei primi K item raccomandati, quanti erano rilevanti?</p>
<ul>
<li><code>raccomandati</code>: gli item raccomandati in ordine (dal più al meno rilevante secondo il modello)</li>
<li><code>rilevanti</code>: il set degli item che l'utente ha davvero apprezzato</li>
<li><code>precision_at_3</code>: dei primi 3 raccomandati, la frazione che è nei rilevanti</li>
<li><code>precision_at_5</code>: idem per i primi 5</li>
<li><code>top_e_meglio</code>: <code>True</code> se precision@3 &ge; precision@5 (il modello mette i migliori in cima)</li>
</ul>`,
      setup: `raccomandati = [10, 25, 7, 3, 99]   # in ordine di rilevanza predetta
rilevanti = {10, 7, 42, 3}          # ciò che l'utente ha davvero apprezzato`,
      starter: `# raccomandati: lista ordinata | rilevanti: set dei veri apprezzati

def precision_at_k(racc, rilev, k):
    primi_k = racc[:k]
    hit = sum(1 for item in primi_k if item in rilev)
    return hit / k

precision_at_3 = precision_at_k(raccomandati, rilevanti, 3)
precision_at_5 = ...
top_e_meglio = ...

print(f"precision@3: {precision_at_3:.2f} | precision@5: {precision_at_5:.2f}")`,
      check: `def _pk(r, rel, k): return sum(1 for i in r[:k] if i in rel)/k
_p3 = _pk(raccomandati, rilevanti, 3); _p5 = _pk(raccomandati, rilevanti, 5)
assert abs(precision_at_3 - _p3) < 1e-9 and abs(precision_at_3 - 2/3) < 1e-9, "precision@3: 10 e 7 sono rilevanti su 3 = 2/3"
assert abs(precision_at_5 - _p5) < 1e-9 and abs(precision_at_5 - 3/5) < 1e-9, "precision@5: 10,7,3 rilevanti su 5 = 3/5"
assert top_e_meglio == True, "top_e_meglio: precision@3 (0.67) >= precision@5 (0.60) -> i migliori sono in cima"`,
      hint: `<p><code>precision_at_5 = precision_at_k(raccomandati, rilevanti, 5)</code>. Dei primi 3: 10 e 7 rilevanti = 2/3. Dei primi 5: 10,7,3 = 3/5. <code>top_e_meglio = precision_at_3 &gt;= precision_at_5</code>.</p>`,
      solution: `def precision_at_k(racc, rilev, k):
    primi_k = racc[:k]
    hit = sum(1 for item in primi_k if item in rilev)
    return hit / k

precision_at_3 = precision_at_k(raccomandati, rilevanti, 3)
precision_at_5 = precision_at_k(raccomandati, rilevanti, 5)
top_e_meglio = precision_at_3 >= precision_at_5

print(f"precision@3: {precision_at_3:.2f} | precision@5: {precision_at_5:.2f}")`
    },

    { type: "theory", title: "Caso: rilevamento frodi", html: `
<p>"Come rileveresti frodi?" Il caso classico di classe estremamente sbilanciata:</p>
<ul>
<li><strong>Sbilanciamento estremo</strong>: le frodi sono lo 0.1-1%. L'accuracy è inutile; servono PR-AUC, recall, precision;</li>
<li><strong>Costi asimmetrici</strong>: una frode non rilevata costa molto (l'importo); un falso allarme costa poco (una verifica). Soglia bassa, recall prioritario;</li>
<li><strong>Approcci</strong>: classificazione supervisionata (se hai frodi etichettate) O anomaly detection (se le frodi sono rare/nuove/non etichettate);</li>
<li><strong>Feature</strong>: importo, frequenza, luogo/orario insoliti, deviazione dal comportamento abituale;</li>
<li><strong>Vincolo pratico</strong>: latenza — la decisione va presa in tempo reale (online inference), e il sistema deve reggere adversari che si adattano.</li>
</ul>
`, more: `
<p>La scelta tra classificazione supervisionata e anomaly detection dipende dai dati: se hai abbastanza esempi ETICHETTATI di frodi passate, un classificatore (con class_weight o resampling per lo sbilanciamento) impara i pattern noti. Se le frodi sono rarissime, nuove, o non etichettate, l'ANOMALY DETECTION (Isolation Forest, sala Boosting) cerca ciò che devia dal normale senza bisogno di esempi di frode. Nella pratica si combinano: anomaly detection per beccare pattern nuovi/sconosciuti, classificazione per quelli noti. E il sistema deve evolvere perché i frodatori si ADATTANO — un modello statico diventa obsoleto man mano che le frodi cambiano forma (concept drift accelerato da un avversario intelligente).</p>
<p>I costi asimmetrici dominano il design: una frode non rilevata costa l'importo della transazione (potenzialmente migliaia di euro); un falso allarme costa una verifica (una notifica, forse una telefonata). Rapporto spesso 100:1 o più → soglia bassa, si accettano molti falsi allarmi pur di non perdere frodi (recall prioritario). Ma non all'infinito: troppi falsi allarmi degradano l'esperienza (carte bloccate ingiustamente, clienti irritati) e sommergono il team di verifica. Il punto ottimale bilancia il costo delle frodi perse con il costo operativo e reputazionale dei falsi allarmi — di nuovo un problema di soglia guidata dai costi (sala Model Evaluation), non una scelta astratta.</p>
<p>I vincoli PRATICI distinguono il caso frodi dagli esercizi accademici: la LATENZA (la decisione va presa in millisecondi mentre la transazione è in corso — online inference, non batch); la SCALABILITÀ (milioni di transazioni); l'ADVERSARIALITÀ (i frodatori sondano attivamente il sistema per aggirarlo, quindi le feature "ovvie" vengono neutralizzate e servono segnali sempre nuovi); l'INTERPRETABILITÀ (spesso richiesta per legge e per contestare le frodi — perché questa transazione è stata bloccata?). Un buon sistema anti-frode combina un modello veloce in tempo reale, regole esperte per i casi noti, anomaly detection per i nuovi, monitoring continuo del drift, e un ciclo di feedback dagli analisti umani che verificano i casi dubbi e ri-etichettano — un sistema vivo, non un modello statico. Menzionare questi vincoli operativi è ciò che mostra esperienza reale.</p>
` },

    {
      type: "exercise", id: "cs-06", kg: 15, title: "Frodi: la metrica giusta",
      task: `<p>Un dataset di transazioni con 0.5% di frodi. Scegli metrica e approccio corretti:</p>
<ul>
<li><code>accuracy_inutile</code>: <code>True</code> — con lo 0.5% di frodi, l'accuracy è ingannevole</li>
<li><code>metrica_giusta</code>: la stringa "pr_auc" — la PR-AUC è onesta su classi rarissime (meglio della ROC)</li>
<li><code>priorita</code>: la stringa "recall" — non voglio farmi sfuggire frodi (i mancati costano l'importo)</li>
<li><code>approccio_se_non_etichettate</code>: la stringa "anomaly_detection" — se le frodi non sono etichettate</li>
<li><code>soglia_bassa</code>: <code>True</code> — costo asimmetrico (FN &gt;&gt; FP) → soglia bassa</li>
</ul>`,
      starter: `# transazioni: 0.5% frodi, FN costa l'importo, FP costa una verifica

accuracy_inutile = ...
metrica_giusta = ...
priorita = ...
approccio_se_non_etichettate = ...
soglia_bassa = ...

print(f"metrica: {metrica_giusta} | priorita': {priorita}")
print(f"se non etichettate: {approccio_se_non_etichettate}")`,
      check: `assert accuracy_inutile == True, "accuracy_inutile: True — 0.5% frodi, predire 'mai frode' da' 99.5% accuracy"
assert metrica_giusta == "pr_auc", "metrica_giusta: PR-AUC, onesta su classi rarissime"
assert priorita == "recall", "priorita: recall — i mancati (frodi) costano l'importo"
assert approccio_se_non_etichettate == "anomaly_detection", "se non etichettate -> anomaly detection (Isolation Forest)"
assert soglia_bassa == True, "soglia_bassa: True — FN >> FP -> soglia bassa, piu' positivi predetti"`,
      hint: `<p>Con 0.5% di frodi l'accuracy è inutile (accuracy_inutile=True). PR-AUC per classi rare, recall come priorità, anomaly detection se non etichettate, soglia bassa per il costo asimmetrico. Tutto discende dallo sbilanciamento e dai costi.</p>`,
      solution: `accuracy_inutile = True
metrica_giusta = "pr_auc"
priorita = "recall"
approccio_se_non_etichettate = "anomaly_detection"
soglia_bassa = True

print(f"metrica: {metrica_giusta} | priorita': {priorita}")
print(f"se non etichettate: {approccio_se_non_etichettate}")`
    },

    {
      type: "exercise", id: "cs-07", kg: 20, title: "Anomaly score per le frodi",
      task: `<p>Costruisci un semplice rilevatore di frodi basato su anomalia: quanto ogni transazione devia dal comportamento normale (z-score). Alto z = sospetta:</p>
<ul>
<li>dato lo storico di importi normali di un utente (media e std), calcola l'anomalia di nuove transazioni</li>
<li><code>z_scores</code>: lo z-score di ogni transazione in <code>nuove</code> (usa media e std dello storico)</li>
<li><code>sospette</code>: le transazioni con |z| &gt; 3 (deviazione estrema)</li>
<li><code>n_sospette</code>: quante sono sospette</li>
<li><code>becca_la_frode</code>: <code>True</code> se la transazione anomala (5000, contro media ~50) è tra le sospette</li>
</ul>`,
      setup: `import numpy as np
storico = np.array([45, 50, 55, 48, 52, 47, 53, 49])   # spese normali
media = storico.mean()
std = storico.std()
nuove = np.array([51, 5000, 46])   # la seconda (5000) e' anomala!`,
      starter: `import numpy as np
# storico: spese normali | nuove: transazioni da valutare

z_scores = (nuove - media) / std
sospette = nuove[np.abs(z_scores) > 3]
n_sospette = ...
becca_la_frode = ...

print("z-scores:", np.round(z_scores, 1).tolist())
print("transazioni sospette:", sospette.tolist())`,
      check: `import numpy as np
_z = (nuove - storico.mean()) / storico.std()
_sosp = nuove[np.abs(_z) > 3]
assert np.allclose(z_scores, _z), "z_scores: (nuove - media) / std"
assert 5000 in sospette, "sospette: il 5000 deve essere segnalato (z enorme)"
assert n_sospette == 1, "n_sospette: solo la transazione da 5000"
assert becca_la_frode == True, "becca_la_frode: True — l'importo anomalo e' beccato dallo z-score"`,
      hint: `<p><code>n_sospette = len(sospette)</code>. <code>becca_la_frode = 5000 in sospette</code>. La transazione da 5000, con media ~50 e std ~3, ha z enorme (&gt;3): anomalia evidente.</p>`,
      solution: `import numpy as np

z_scores = (nuove - media) / std
sospette = nuove[np.abs(z_scores) > 3]
n_sospette = len(sospette)
becca_la_frode = 5000 in sospette

print("z-scores:", np.round(z_scores, 1).tolist())
print("transazioni sospette:", sospette.tolist())`
    },

    { type: "theory", title: "Caso: valutare un chatbot / LLM", html: `
<p>"Come valuteresti un chatbot?" Caso moderno e insidioso, perché l'output è testo aperto senza una singola risposta "giusta":</p>
<ul>
<li><strong>Perché è difficile</strong>: non c'è una label unica (molte risposte valide), la qualità è multidimensionale (correttezza, utilità, tono, sicurezza);</li>
<li><strong>Metriche automatiche</strong>: per compiti con riferimento (traduzione, riassunto) BLEU/ROUGE; per la similarità semantica, embedding — ma catturano male la qualità reale;</li>
<li><strong>LLM-as-judge</strong>: usare un altro LLM per valutare le risposte su criteri definiti — scalabile ma con bias;</li>
<li><strong>Valutazione umana</strong>: il gold standard, ma costosa e soggettiva (serve accordo tra annotatori);</li>
<li><strong>Metriche di prodotto</strong>: alla fine conta l'engagement, la soddisfazione, il tasso di risoluzione — non solo la qualità del testo.</li>
</ul>
`, more: `
<p>La difficoltà fondamentale è l'assenza di ground truth unico: per la classificazione c'è una label giusta, per un chatbot ci sono infinite risposte valide con qualità sfumata su più dimensioni (è corretta? utile? sicura? nel tono giusto? concisa?). Le metriche automatiche classiche (BLEU, ROUGE) confrontano con risposte di riferimento e funzionano solo per compiti vincolati (traduzione, riassunto) — per il dialogo aperto sono quasi inutili, perché una risposta ottima ma diversa dal riferimento riceve punteggio basso. La similarità di embedding cattura il significato meglio ma non la CORRETTEZZA (due risposte semanticamente simili possono essere una giusta e una sbagliata).</p>
<p>L'<strong>LLM-as-judge</strong> è l'approccio scalabile emergente: usare un LLM potente per valutare le risposte su criteri espliciti (una rubrica), con o senza risposta di riferimento, spesso confrontando due risposte (quale è migliore?). Scala molto meglio della valutazione umana e correla decentemente con essa, MA ha bias noti da conoscere: preferenza per risposte lunghe, per il proprio stile (un LLM giudica meglio output simili ai suoi), sensibilità all'ordine di presentazione, e la circolarità di usare un LLM per giudicarne un altro. Va calibrato contro giudizi umani e usato con consapevolezza dei suoi limiti — non è oracolo.</p>
<p>La gerarchia della valutazione, dalla più economica alla più affidabile: metriche automatiche (veloci, economiche, ma catturano poco) → LLM-as-judge (scalabile, correla con l'umano, ma con bias) → valutazione umana (gold standard, ma costosa, lenta, soggettiva — richiede più annotatori e misura dell'accordo tra loro, es. Cohen's kappa). E sopra tutto, le METRICHE DI PRODOTTO: alla fine un chatbot si valuta su ciò che conta per il business — tasso di risoluzione dei problemi, soddisfazione utente (thumbs up/down, sondaggi), engagement, tasso di escalation a un umano, riduzione dei costi di supporto. Un chatbot con ottime metriche testuali ma che non risolve i problemi degli utenti è un fallimento. La valutazione matura combina i livelli: automatica per il monitoring continuo su larga scala, LLM-judge per confronti di versioni, umana per la validazione periodica e i casi critici, metriche di prodotto per il verdetto finale. Menzionare questa stratificazione e i bias dell'LLM-judge è la risposta di livello senior a un caso che sempre più colloqui pongono.</p>
` },

    {
      type: "exercise", id: "cs-08", kg: 15, title: "Valutare risposte con LLM-as-judge",
      task: `<p>Simula un LLM-as-judge: valuta le risposte di un chatbot su una rubrica e aggrega i punteggi. Ragiona anche sui limiti:</p>
<ul>
<li>ogni risposta ha punteggi su 3 criteri (correttezza, utilità, sicurezza) da 1 a 5 (forniti)</li>
<li><code>punteggio_medio</code>: dict risposta&rarr;media dei suoi 3 criteri</li>
<li><code>migliore</code>: la risposta con punteggio medio più alto</li>
<li><code>bias_da_ricordare</code>: la stringa "lunghezza" — un bias noto dell'LLM-judge (preferisce risposte lunghe)</li>
<li><code>serve_validazione_umana</code>: <code>True</code> — l'LLM-judge va calibrato contro giudizi umani</li>
</ul>`,
      setup: `valutazioni = {
    "risposta_A": {"correttezza": 5, "utilita": 4, "sicurezza": 5},
    "risposta_B": {"correttezza": 3, "utilita": 3, "sicurezza": 4},
    "risposta_C": {"correttezza": 4, "utilita": 5, "sicurezza": 5},
}`,
      starter: `# valutazioni: risposta -> punteggi su 3 criteri

punteggio_medio = {r: sum(crit.values()) / len(crit) for r, crit in valutazioni.items()}
migliore = ...
bias_da_ricordare = ...
serve_validazione_umana = ...

print("punteggi medi:", {r: round(p, 2) for r, p in punteggio_medio.items()})
print("migliore:", migliore)`,
      check: `_pm = {r: sum(c.values())/len(c) for r, c in valutazioni.items()}
_best = max(_pm, key=_pm.get)
assert punteggio_medio == _pm, "punteggio_medio: media dei 3 criteri per risposta"
assert migliore == _best == "risposta_A", "migliore: risposta_A (media 4.67)"
assert bias_da_ricordare == "lunghezza", "bias_da_ricordare: l'LLM-judge tende a preferire risposte lunghe"
assert serve_validazione_umana == True, "serve_validazione_umana: True — l'LLM-judge va calibrato sull'umano"`,
      hint: `<p><code>migliore = max(punteggio_medio, key=punteggio_medio.get)</code>. Ricorda i limiti dell'LLM-judge: il bias di lunghezza e la necessità di validazione umana. <code>serve_validazione_umana = True</code>.</p>`,
      solution: `punteggio_medio = {r: sum(crit.values()) / len(crit) for r, crit in valutazioni.items()}
migliore = max(punteggio_medio, key=punteggio_medio.get)
bias_da_ricordare = "lunghezza"
serve_validazione_umana = True

print("punteggi medi:", {r: round(p, 2) for r, p in punteggio_medio.items()})
print("migliore:", migliore)`
    },

    { type: "theory", title: "Il cold start e i baseline", html: `
<p>Due concetti trasversali a tutti i casi studio, che i colloqui amano sondare:</p>
<p>Il <strong>cold start</strong>: cosa fai quando non hai dati? Nuovo utente senza storia (recommender), nuovo prodotto senza vendite, sistema appena lanciato. Soluzioni: fallback su popolarità/media, usare feature del contenuto invece del comportamento, chiedere informazioni all'onboarding, transfer learning.</p>
<p>Il <strong>baseline</strong>: la soluzione più semplice che potrebbe funzionare, il riferimento contro cui misurare tutto. Per il churn: "inattivo da N giorni". Per il recommender: "i più popolari". Per la regressione: "la media". Se il tuo modello complesso non batte il baseline, non serve.</p>
`, more: `
<p>Il cold start è un problema pratico che affligge OGNI sistema al lancio e ogni volta che arriva un'entità nuova. Le strategie dipendono dal tipo: per un NUOVO UTENTE (nessuna storia comportamentale) — raccomanda i più popolari, chiedi preferenze all'onboarding, usa dati demografici; per un NUOVO ITEM (nessuna interazione) — usa le sue caratteristiche di contenuto (content-based), promuovilo per raccogliere dati; per un SISTEMA nuovo — parti con regole esperte e baseline, raccogli dati, poi passa gradualmente al ML man mano che i dati si accumulano. Il cold start spiega perché i sistemi reali sono ibridi e perché non si può partire "puri ML" da zero — serve una strategia per il periodo senza dati.</p>
<p>Il baseline è il concetto più pratico e più ignorato dai principianti. La sua funzione: (1) dà un RIFERIMENTO — un modello che non batte il baseline non aggiunge valore, per quanto sofisticato; (2) è spesso GIÀ SUFFICIENTE — molti problemi di business si risolvono con una regola semplice o un modello lineare, e la complessità aggiuntiva non ripaga il suo costo di sviluppo/manutenzione; (3) è INTERPRETABILE e robusto. Nei colloqui, proporre il baseline PRIMA del modello complesso ("inizierei con la regola X come baseline, poi valuterei se un modello lo batte abbastanza da valere la complessità") è segno di pragmatismo che i selezionatori premiano. Il baseline non è pigrizia: è disciplina ingegneristica.</p>
<p>Questi due concetti chiudono il cerchio dei casi studio e collegano l'intero percorso: un buon data scientist non parte dal modello più potente, ma dal problema (formularlo bene), dai dati (cosa ho, cosa manca, cold start), dal baseline (il riferimento semplice), e sale in complessità SOLO quando i dati lo giustificano — misurando sempre contro il baseline e la metrica di business. È l'opposto dell'approccio "ho imparato i transformer, li uso ovunque". La maturità è scegliere lo strumento più semplice che risolve il problema, non il più impressionante. Tutto il percorso della palestra — dalle basi di Python alle reti neurali — serve ad avere l'INTERO ventaglio di strumenti e il giudizio per scegliere quello giusto per ogni problema.</p>
` },

    {
      type: "exercise", id: "cs-09", kg: 15, title: "Cold start e baseline",
      task: `<p>Gestisci il cold start di un recommender e stabilisci il baseline giusto:</p>
<ul>
<li>un nuovo utente senza storia: non puoi usare il collaborative filtering</li>
<li><code>raccomandazione_nuovo_utente</code>: la stringa "popolari" — il fallback per il cold start (i più popolari)</li>
<li><code>popolari</code>: i 3 item più popolari (dato il dict item&rarr;numero_di_apprezzamenti)</li>
<li><code>baseline_churn</code>: la stringa "inattivo_da_N_giorni" — il baseline per il churn</li>
<li><code>modello_deve_battere_baseline</code>: <code>True</code> — un modello complesso vale solo se batte il baseline</li>
</ul>`,
      setup: `popolarita = {"film_1": 500, "film_2": 1200, "film_3": 800, "film_4": 300, "film_5": 950}`,
      starter: `# popolarita: item -> numero di apprezzamenti

raccomandazione_nuovo_utente = "popolari"
# i 3 item piu' popolari (fallback per il cold start)
popolari = [item for item, _ in sorted(popolarita.items(), key=lambda kv: kv[1], reverse=True)[:3]]
baseline_churn = ...
modello_deve_battere_baseline = ...

print("per un nuovo utente raccomando i popolari:", popolari)`,
      check: `_pop = [i for i, _ in sorted(popolarita.items(), key=lambda kv: kv[1], reverse=True)[:3]]
assert raccomandazione_nuovo_utente == "popolari", "cold start di un nuovo utente -> fallback sui popolari"
assert popolari == _pop == ["film_2", "film_5", "film_3"], "popolari: i 3 con piu' apprezzamenti (1200, 950, 800)"
assert baseline_churn == "inattivo_da_N_giorni", "baseline_churn: la regola semplice di riferimento"
assert modello_deve_battere_baseline == True, "modello_deve_battere_baseline: True — altrimenti la complessita' non vale"`,
      hint: `<p>Il cold start si gestisce coi popolari (già calcolati). Il baseline del churn è "inattivo da N giorni". Un modello complesso deve battere il baseline per giustificarsi: <code>modello_deve_battere_baseline = True</code>.</p>`,
      solution: `raccomandazione_nuovo_utente = "popolari"
popolari = [item for item, _ in sorted(popolarita.items(), key=lambda kv: kv[1], reverse=True)[:3]]
baseline_churn = "inattivo_da_N_giorni"
modello_deve_battere_baseline = True

print("per un nuovo utente raccomando i popolari:", popolari)`
    },

    {
      type: "exercise", id: "cs-10", kg: 25, title: "MASSIMALE: il caso studio completo",
      task: `<p>Il gran finale: affronta un caso studio da capo a fondo. "Un'app fitness perde iscritti. Costruisci un sistema per ridurre il churn." Metti insieme formulazione, feature, baseline, modello, valore.</p>
<ul>
<li><code>formulazione</code>: dict con "tipo" ("classificazione"), "target" ("churn_30gg"), "metrica" ("recall")</li>
<li>dati clienti con recency e frequency (forniti); calcola il baseline</li>
<li><code>a_rischio_baseline</code>: i clienti con recency &gt; 30 (baseline: inattivi)</li>
<li><code>n_a_rischio</code>: quanti a rischio secondo il baseline</li>
<li><code>valore_campagna</code>: se contatti i clienti a rischio (costo 15 ciascuno), ne salvi il 25% (valore 180 ciascuno): calcola il valore netto</li>
<li><code>sistema_conviene</code>: <code>True</code> se il valore netto della campagna è positivo</li>
</ul>`,
      setup: `import numpy as np
# clienti: (recency in giorni, frequency)
clienti = [
    {"id": 1, "recency": 45, "frequency": 3},
    {"id": 2, "recency": 10, "frequency": 20},
    {"id": 3, "recency": 60, "frequency": 2},
    {"id": 4, "recency": 5, "frequency": 15},
    {"id": 5, "recency": 40, "frequency": 5},
    {"id": 6, "recency": 90, "frequency": 1},
]
COSTO, TASSO_SALVI, VALORE = 15, 0.25, 180`,
      starter: `import numpy as np
# clienti: lista con recency e frequency | COSTO/TASSO_SALVI/VALORE della campagna

formulazione = {"tipo": "classificazione", "target": "churn_30gg", "metrica": "recall"}

# baseline: a rischio se inattivo da oltre 30 giorni
a_rischio_baseline = [c for c in clienti if c["recency"] > 30]
n_a_rischio = len(a_rischio_baseline)

# valore della campagna sui clienti a rischio
salvati = n_a_rischio * TASSO_SALVI
valore_campagna = salvati * VALORE - n_a_rischio * COSTO
sistema_conviene = ...

print("formulazione:", formulazione)
print(f"a rischio (baseline): {n_a_rischio} clienti")
print(f"valore netto campagna: {valore_campagna:.0f} EUR | conviene: {sistema_conviene}")`,
      check: `_ar = [c for c in clienti if c["recency"] > 30]
_n = len(_ar)
_vc = _n * 0.25 * 180 - _n * 15
assert formulazione["tipo"] == "classificazione" and formulazione["metrica"] == "recall", "formulazione: classificazione, recall"
assert n_a_rischio == 4, "n_a_rischio: 4 clienti con recency > 30 (id 1,3,5,6)"
assert abs(valore_campagna - _vc) < 1e-9, "valore_campagna: salvati*180 - contattati*15"
assert sistema_conviene == True, "sistema_conviene: valore netto positivo (120 EUR)"`,
      hint: `<p>4 clienti a rischio (recency &gt; 30). Salvati = 4×0.25 = 1; valore = 1×180 − 4×15 = 180−60 = 120€. <code>sistema_conviene = valore_campagna &gt; 0</code>. È il caso completo: formula → baseline → valore economico.</p>`,
      solution: `import numpy as np

formulazione = {"tipo": "classificazione", "target": "churn_30gg", "metrica": "recall"}

a_rischio_baseline = [c for c in clienti if c["recency"] > 30]
n_a_rischio = len(a_rischio_baseline)

salvati = n_a_rischio * TASSO_SALVI
valore_campagna = salvati * VALORE - n_a_rischio * COSTO
sistema_conviene = valore_campagna > 0

print("formulazione:", formulazione)
print(f"a rischio (baseline): {n_a_rischio} clienti")
print(f"valore netto campagna: {valore_campagna:.0f} EUR | conviene: {sistema_conviene}")`
    }

  ]
});
