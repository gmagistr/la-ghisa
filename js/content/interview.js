window.MODULES.push({
  id: "interview",
  name: "Domande da Colloquio",
  tagline: "La sala sparring: le domande che ti faranno davvero. Trabocchetti su metriche, overfitting, bias, leakage — con la risposta ragionata.",
  intro: "Le domande ricorrenti nei colloqui data science, in forma di esercizi: riconosci la risposta giusta, calcola la metrica corretta, smaschera il trabocchetto. Ogni esercizio ripassa un concetto delle sale precedenti applicandolo a uno scenario reale di colloquio. Puro Python + un po' di NumPy.",
  packages: ["numpy"],
  items: [

    { type: "theory", title: "Come si affronta una domanda da colloquio", html: `
<p>I colloqui data science non cercano chi sa tutto a memoria, ma chi <strong>ragiona bene</strong>. La differenza tra una risposta mediocre e una forte non è la formula, è il METODO:</p>
<ul>
<li><strong>Chiedi il contesto</strong> prima di rispondere: "quali sono i costi dei due errori?", "quanto sono sbilanciate le classi?" — le domande spesso sono volutamente sotto-specificate;</li>
<li><strong>Nomina i trade-off</strong>: raramente c'è UNA risposta giusta; c'è "dipende, e dipende da X, Y, Z";</li>
<li><strong>Parti dal semplice</strong>: proponi il baseline prima del modello complesso;</li>
<li><strong>Riconosci i limiti</strong>: dire "questa metrica inganna se..." vale più di recitarla.</li>
</ul>
<p>Questa sala allena proprio questo: scenari dove la risposta ovvia è sbagliata, e quella giusta richiede di ragionare sul contesto.</p>
`, more: `
<p>Il pattern più premiato nei colloqui è il ragionamento "<strong>dipende, ed ecco da cosa</strong>". Alla domanda "quale metrica useresti?", la risposta debole è "accuracy" o "F1"; quella forte è "dipende dai costi relativi degli errori e dallo sbilanciamento: se i falsi negativi costano molto più dei falsi positivi, ottimizzo il recall; se le classi sono al 99/1, l'accuracy è inutile e guardo la PR-AUC...". Non è verbosità: è mostrare che capisci PERCHÉ una scelta è giusta in un contesto e sbagliata in un altro. I selezionatori sondano proprio questo con domande volutamente ambigue, per vedere se chiedi chiarimenti o rispondi a vuoto.</p>
<p>Le domande trabocchetto classiche testano concetti che sembrano semplici ma nascondono un errore comune: "accuracy 99%, è un buon modello?" (trappola: classi sbilanciate, l'accuracy è ingannevole); "il modello fa 0.95 in training, lo mettiamo in produzione?" (trappola: overfitting, serve il test); "correlazione 0.9, quindi X causa Y?" (trappola: correlazione ≠ causalità); "riaddestro sullo stesso dataset e valuto, va bene?" (trappola: leakage/no test set). Riconoscere la trappola e nominarla è ciò che il colloquio cerca — non cadere nell'ovvio.</p>
<p>Un principio meta-importante: i colloqui valutano anche COME comunichi l'incertezza e i limiti. Ammettere "non sono sicuro, ma ragionerei così..." o "questo approccio ha il rischio di..." è segno di maturità, non di debolezza — nel lavoro reale un data scientist che non riconosce i limiti dei propri modelli è pericoloso. Le sale precedenti hanno costruito i concetti (metriche, overfitting, leakage, drift, causalità); questa sala li mette alla prova negli scenari dove vengono chiesti davvero. Ogni esercizio è una domanda che potresti sentirti fare, con la risposta ragionata da interiorizzare.</p>
` },

    {
      type: "exercise", id: "iv-01", kg: 10, title: "\"Accuracy 99%, buon modello?\"",
      task: `<p>Scenario da colloquio: un modello di rilevamento frodi ha il 99% di accuracy. Le frodi sono l'1% dei casi. Analizza:</p>
<ul>
<li><code>acc_modello_pigro</code>: l'accuracy di un modello che predice SEMPRE "non frode" (su 10000 casi, 100 frodi)</li>
<li><code>frodi_beccate_dal_pigro</code>: quante frodi becca il modello pigro (predicendo sempre "non frode")</li>
<li><code>accuracy_inganna</code>: <code>True</code> se il modello pigro raggiunge ~99% accuracy MA becca 0 frodi</li>
<li><code>metrica_giusta</code>: la stringa "recall" — la metrica da guardare per le frodi (quante ne becchi)</li>
</ul>`,
      starter: `# 10000 casi, 100 frodi (1%), 9900 non-frodi

n_totale = 10000
n_frodi = 100

# modello pigro: predice sempre "non frode" -> azzecca tutti i non-frodi
acc_modello_pigro = (n_totale - n_frodi) / n_totale
frodi_beccate_dal_pigro = ...
accuracy_inganna = ...
metrica_giusta = ...

print(f"accuracy modello pigro: {acc_modello_pigro:.2%}")
print(f"frodi beccate: {frodi_beccate_dal_pigro} su {n_frodi}")`,
      check: `assert abs(acc_modello_pigro - 0.99) < 1e-9, "acc_modello_pigro: 9900/10000 = 99%"
assert frodi_beccate_dal_pigro == 0, "frodi_beccate_dal_pigro: 0 — predicendo sempre 'non frode' non ne becca nessuna"
assert accuracy_inganna == True, "accuracy_inganna: True — 99% accuracy ma zero frodi beccate: inutile"
assert metrica_giusta == "recall", "metrica_giusta: recall (frodi beccate / frodi totali) — l'accuracy nasconde il fallimento"`,
      hint: `<p>Il modello pigro azzecca tutti i 9900 non-frodi (99%) ma 0 frodi. <code>accuracy_inganna = acc_modello_pigro &gt; 0.95 and frodi_beccate_dal_pigro == 0</code>. Per le frodi conta il recall, non l'accuracy.</p>`,
      solution: `n_totale = 10000
n_frodi = 100

acc_modello_pigro = (n_totale - n_frodi) / n_totale
frodi_beccate_dal_pigro = 0
accuracy_inganna = acc_modello_pigro > 0.95 and frodi_beccate_dal_pigro == 0
metrica_giusta = "recall"

print(f"accuracy modello pigro: {acc_modello_pigro:.2%}")
print(f"frodi beccate: {frodi_beccate_dal_pigro} su {n_frodi}")`
    },

    {
      type: "exercise", id: "iv-02", kg: 15, title: "\"Accuracy 99% ma recall 5%: che fai?\"",
      task: `<p>La domanda esatta di tanti colloqui. Un modello ha accuracy 99% ma recall 5% sulla classe positiva (rara). Ragiona:</p>
<ul>
<li><code>problema</code>: la stringa "sbilanciamento" — la causa (le classi sono molto sbilanciate)</li>
<li><code>soluzioni</code>: lista di stringhe con almeno 3 rimedi tra: "soglia" (abbassare la soglia di decisione), "class_weight" (pesare la classe rara), "resampling" (oversampling/SMOTE), "metrica" (ottimizzare recall/F1 non accuracy)</li>
<li><code>ottimizzare_accuracy_e_sbagliato</code>: <code>True</code> — continuare a ottimizzare l'accuracy peggiorerebbe il problema</li>
</ul>`,
      starter: `# accuracy 99%, recall 5% sulla classe rara: il modello ignora i positivi

problema = "sbilanciamento"
soluzioni = ["soglia", "class_weight", "resampling", "metrica"]
ottimizzare_accuracy_e_sbagliato = ...

print("problema:", problema)
print("soluzioni:", soluzioni)`,
      check: `assert problema == "sbilanciamento", "problema: le classi sono sbilanciate, il modello ottimizza l'accuracy ignorando i rari"
assert isinstance(soluzioni, list) and len(soluzioni) >= 3, "soluzioni: almeno 3 rimedi"
assert set(soluzioni) <= {"soglia", "class_weight", "resampling", "metrica"}, "soluzioni: tra soglia/class_weight/resampling/metrica"
assert "metrica" in soluzioni or "soglia" in soluzioni, "almeno cambiare metrica o abbassare la soglia"
assert ottimizzare_accuracy_e_sbagliato == True, "ottimizzare_accuracy_e_sbagliato: True — l'accuracy premia proprio l'ignorare i rari"`,
      hint: `<p>Recall basso su classe rara = sbilanciamento. I rimedi: abbassare la soglia (più positivi predetti), <code>class_weight="balanced"</code>, resampling (SMOTE), e ottimizzare recall/F1 invece dell'accuracy. Continuare con l'accuracy peggiora tutto.</p>`,
      solution: `problema = "sbilanciamento"
soluzioni = ["soglia", "class_weight", "resampling", "metrica"]
ottimizzare_accuracy_e_sbagliato = True

print("problema:", problema)
print("soluzioni:", soluzioni)`
    },

    { type: "theory", title: "Bias-variance: la domanda immancabile", html: `
<p>"Spiegami il trade-off bias-variance" è forse la domanda più frequente in assoluto. La risposta forte:</p>
<ul>
<li><strong>Bias</strong>: errore da assunzioni troppo semplici. Alto bias = <em>underfitting</em>: il modello è troppo rigido, va male su train E test;</li>
<li><strong>Varianza</strong>: sensibilità alle fluttuazioni del training set. Alta varianza = <em>overfitting</em>: il modello memorizza il rumore, ottimo su train, scarso su test;</li>
<li><strong>Il trade-off</strong>: ridurre uno tende ad aumentare l'altro. L'errore totale è bias² + varianza + rumore irriducibile.</li>
</ul>
<p>La diagnosi si legge nel gap train-test: gap grande = varianza (overfitting); entrambi bassi = bias (underfitting). Le cure sono opposte, ed è per questo che diagnosticare bene è metà del lavoro.</p>
`, more: `
<p>La risposta completa collega il trade-off alla COMPLESSITÀ del modello: al crescere della complessità (più parametri, più profondità, meno regolarizzazione), il bias CALA (il modello può catturare pattern più ricchi) ma la varianza CRESCE (diventa più sensibile ai dati specifici di training). Esiste un punto di complessità ottimale che minimizza l'errore totale sul test — a sinistra underfitting, a destra overfitting. Questa è la curva a U dell'errore di test contro la complessità, e saperla disegnare/descrivere è ciò che i selezionatori vogliono vedere. La validation curve (sala Model Evaluation) la mostra empiricamente.</p>
<p>Le CURE opposte sono il punto pratico che distingue chi ha capito: per l'ALTA VARIANZA (overfitting) — più dati, più regolarizzazione, meno feature, modello più semplice, ensemble che mediano (bagging/Random Forest); per l'ALTO BIAS (underfitting) — modello più complesso, più feature/interazioni, meno regolarizzazione, boosting. Applicare la cura sbagliata peggiora: aggiungere complessità a un modello che già overfitta è disastroso. Per questo la diagnosi (dal gap train-test) viene PRIMA della cura, ed è l'errore da colloquio più comune saltare alla soluzione senza diagnosticare.</p>
<p>Una sfumatura moderna che impressiona: il trade-off bias-variance classico è stato messo in discussione dal fenomeno del "double descent" nel deep learning, dove modelli enormemente sovra-parametrizzati (molti più parametri che dati) generalizzano bene nonostante la teoria classica predica overfitting catastrofico. Non serve padroneggiarlo, ma menzionare "il quadro classico è bias-variance, anche se nel deep learning il double descent complica la storia" segnala che conosci lo stato dell'arte oltre i manuali. La maturità è conoscere il framework classico E i suoi limiti.</p>
` },

    {
      type: "exercise", id: "iv-03", kg: 15, title: "Diagnosi bias o varianza",
      task: `<p>Tre modelli, tre gap train-test. Diagnostica e prescrivi la cura giusta:</p>
<ul>
<li><code>diagnosi</code>: funzione che dati (train_score, test_score) restituisce "overfitting" (gap grande), "underfitting" (entrambi bassi) o "buono" — fornita</li>
<li><code>caso_a</code>: train 0.98, test 0.71 &rarr; ?</li>
<li><code>caso_b</code>: train 0.65, test 0.63 &rarr; ?</li>
<li><code>cura_overfitting</code>: la stringa "regolarizzazione" (o più dati) — NON "più complessità"</li>
<li><code>cura_underfitting</code>: la stringa "complessita" — più capacità al modello</li>
</ul>`,
      starter: `def diagnosi(train, test):
    if train > 0.9 and (train - test) > 0.15:
        return "overfitting"
    if train < 0.75 and test < 0.75:
        return "underfitting"
    return "buono"

caso_a = diagnosi(0.98, 0.71)
caso_b = ...
cura_overfitting = ...
cura_underfitting = ...

print("caso A:", caso_a, "-> cura:", cura_overfitting)
print("caso B:", caso_b, "-> cura:", cura_underfitting)`,
      check: `def _d(tr, te):
    if tr > 0.9 and tr-te > 0.15: return "overfitting"
    if tr < 0.75 and te < 0.75: return "underfitting"
    return "buono"
assert caso_a == "overfitting", "caso_a: gap enorme (0.98 vs 0.71) -> overfitting (alta varianza)"
assert caso_b == "underfitting", "caso_b: entrambi bassi -> underfitting (alto bias)"
assert cura_overfitting == "regolarizzazione", "cura_overfitting: regolarizzazione/piu' dati, NON piu' complessita'"
assert cura_underfitting == "complessita", "cura_underfitting: piu' complessita'/capacita' al modello"`,
      hint: `<p><code>caso_b = diagnosi(0.65, 0.63)</code>. Overfitting → regolarizzazione (o più dati); underfitting → più complessità. Le cure sono OPPOSTE: applicare quella sbagliata peggiora.</p>`,
      solution: `def diagnosi(train, test):
    if train > 0.9 and (train - test) > 0.15:
        return "overfitting"
    if train < 0.75 and test < 0.75:
        return "underfitting"
    return "buono"

caso_a = diagnosi(0.98, 0.71)
caso_b = diagnosi(0.65, 0.63)
cura_overfitting = "regolarizzazione"
cura_underfitting = "complessita"

print("caso A:", caso_a, "-> cura:", cura_overfitting)
print("caso B:", caso_b, "-> cura:", cura_underfitting)`
    },

    {
      type: "exercise", id: "iv-04", kg: 15, title: "\"0.95 in training, va in produzione?\"",
      task: `<p>Un collega ha un modello con 0.95 di accuracy IN TRAINING e vuole metterlo in produzione. Cosa rispondi?</p>
<ul>
<li><code>manca</code>: la stringa "test_set" — manca la valutazione su dati mai visti</li>
<li><code>score_training_affidabile</code>: <code>False</code> — lo score sul training NON stima la generalizzazione</li>
<li><code>cosa_chiedere</code>: lista con almeno 2 tra "test_score", "cross_validation", "come_e_stato_fatto_lo_split", "c_e_leakage"</li>
<li><code>rischio_principale</code>: la stringa "overfitting" — 0.95 in training può essere pura memorizzazione</li>
</ul>`,
      starter: `# collega: "il mio modello fa 0.95 in TRAINING, lo deployo?"

manca = "test_set"
score_training_affidabile = ...
cosa_chiedere = ["test_score", "cross_validation", "c_e_leakage"]
rischio_principale = ...

print("cosa manca:", manca)
print("cosa chiedere:", cosa_chiedere)`,
      check: `assert manca == "test_set", "manca: la valutazione su un test set mai visto"
assert score_training_affidabile == False, "score_training_affidabile: False — il training score non stima la generalizzazione"
assert isinstance(cosa_chiedere, list) and len(cosa_chiedere) >= 2, "cosa_chiedere: almeno 2 domande"
assert set(cosa_chiedere) <= {"test_score", "cross_validation", "come_e_stato_fatto_lo_split", "c_e_leakage"}, "domande pertinenti"
assert rischio_principale == "overfitting", "rischio_principale: overfitting — 0.95 in training puo' essere memorizzazione"`,
      hint: `<p>Uno score sul TRAINING non dice nulla sulla generalizzazione: <code>score_training_affidabile = False</code>. Chiedi il test score / la CV / se c'è leakage. Il rischio è l'overfitting: <code>rischio_principale = "overfitting"</code>.</p>`,
      solution: `manca = "test_set"
score_training_affidabile = False
cosa_chiedere = ["test_score", "cross_validation", "c_e_leakage"]
rischio_principale = "overfitting"

print("cosa manca:", manca)
print("cosa chiedere:", cosa_chiedere)`
    },

    { type: "theory", title: "Precision o recall? Dipende dal costo", html: `
<p>"Ottimizzeresti per precision o recall?" è una domanda-trappola: la risposta giusta è "dipende dal COSTO relativo dei due errori nel dominio specifico". Recitare le formule non basta.</p>
<ul>
<li><strong>Ottimizza il RECALL</strong> quando i falsi negativi (mancati) sono costosi: diagnosi di malattia grave (non voglio perdere malati), rilevamento frodi/minacce (non voglio farmele sfuggire);</li>
<li><strong>Ottimizza la PRECISION</strong> quando i falsi positivi (falsi allarmi) sono costosi: filtro antispam (non voglio bloccare email vere), raccomandazioni (non voglio suggerire cose sbagliate e perdere fiducia).</li>
</ul>
<p>La risposta forte: chiedi "quanto costa un falso negativo rispetto a un falso positivo?", poi scegli — e menziona che la soglia di decisione permette di muoversi lungo il trade-off, e l'F-beta di pesarli esplicitamente.</p>
`, more: `
<p>Il ragionamento sul COSTO è ciò che i selezionatori cercano, ed è quantificabile: se un falso negativo costa C_FN e un falso positivo C_FP, la soglia ottimale minimizza il costo atteso totale, e si sposta verso il basso (più positivi predetti, più recall) quanto più C_FN &gt; C_FP. Nel rilevamento frodi bancarie, una frode non rilevata costa migliaia di euro, un falso allarme costa una telefonata di verifica: rapporto 100:1 → soglia bassissima, recall prioritario. Nel filtro spam, un'email importante persa (falso positivo) può costare un contratto, un po' di spam che passa è tollerabile: precision prioritaria. Portare NUMERI (anche stimati) al ragionamento sul costo è la risposta di livello senior.</p>
<p>La menzione della SOGLIA e dell'F-beta completa la risposta: precision e recall sono in tensione (alzare uno abbassa l'altro), e la leva per muoversi lungo la curva è la soglia di decisione (sala Model Evaluation) — non serve riaddestrare, si sposta la soglia. L'F1 pesa i due ugualmente; l'F-beta (beta&gt;1 pesa più il recall, beta&lt;1 la precision) permette di codificare il costo relativo nella metrica stessa. Dire "userei F2 perché nel nostro caso i mancati costano il doppio dei falsi allarmi" è molto più forte di "userei F1".</p>
<p>Un livello ulteriore che impressiona: in molti problemi reali NON si sceglie un singolo punto ma si guarda l'intera curva Precision-Recall (o ROC) e si sceglie la soglia operativa in base ai vincoli di business ("possiamo permetterci di verificare al massimo 100 casi al giorno, quindi la soglia che dà 100 positivi con la massima precision"). E per problemi con costi molto asimmetrici e sbilanciamento forte, l'average precision (area sotto la PR curve) è la metrica di confronto tra modelli più onesta (sala Model Evaluation). La risposta completa non è "precision o recall" ma "ecco come ragionerei sui costi, sceglierei la metrica e la soglia, e valuterei sulla curva" — dimostrando l'intero processo, non una scelta binaria.</p>
` },

    {
      type: "exercise", id: "iv-05", kg: 15, title: "Precision o recall per il dominio",
      task: `<p>Per ogni scenario, scegli quale metrica ottimizzare ("recall" se i mancati costano, "precision" se i falsi allarmi costano):</p>
<ul>
<li><code>s_tumore</code>: screening di un tumore grave &rarr; ? (non voglio perdere malati)</li>
<li><code>s_spam</code>: filtro antispam &rarr; ? (non voglio bloccare email vere)</li>
<li><code>s_frode</code>: rilevamento frodi &rarr; ? (non voglio farmi sfuggire frodi)</li>
<li><code>s_raccomandazione</code>: raccomandazioni prodotti &rarr; ? (non voglio suggerire cose sbagliate)</li>
</ul>`,
      starter: `s_tumore = "recall"
s_spam = ...
s_frode = ...
s_raccomandazione = ...

print(s_tumore, s_spam, s_frode, s_raccomandazione)`,
      check: `assert s_tumore == "recall", "tumore: un mancato (falso negativo) e' gravissimo -> recall"
assert s_spam == "precision", "spam: bloccare un'email vera (falso positivo) e' costoso -> precision"
assert s_frode == "recall", "frode: una frode mancata e' costosa -> recall"
assert s_raccomandazione == "precision", "raccomandazione: suggerimenti sbagliati perdono fiducia -> precision"`,
      hint: `<p>Chiediti: cosa costa di più, un mancato (FN → recall) o un falso allarme (FP → precision)? Tumore/frode: i mancati sono gravi → recall. Spam/raccomandazioni: i falsi allarmi danneggiano → precision.</p>`,
      solution: `s_tumore = "recall"
s_spam = "precision"
s_frode = "recall"
s_raccomandazione = "precision"

print(s_tumore, s_spam, s_frode, s_raccomandazione)`
    },

    {
      type: "exercise", id: "iv-06", kg: 20, title: "La soglia che minimizza il costo",
      task: `<p>Colloquio pratico: dato il costo dei due errori, calcola quale soglia scegliere. FN costa 100, FP costa 10. Dalle predizioni, trova la soglia a costo minimo:</p>
<ul>
<li><code>costo_a_soglia</code>: funzione che data una soglia calcola il costo totale (FN×100 + FP×10) — fornita</li>
<li><code>costi</code>: lista dei costi per ogni soglia in <code>soglie</code></li>
<li><code>soglia_ottima</code>: la soglia col costo minimo</li>
<li><code>bassa_perche_fn_costoso</code>: <code>True</code> se la soglia ottima è &lt; 0.5 (FN costoso → soglia bassa → più positivi predetti)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
y_true = (rng.random(500) < 0.2).astype(int)   # 20% positivi
# probabilita' predette: piu' alte per i veri positivi (modello decente)
proba = np.clip(y_true * 0.4 + rng.random(500) * 0.5, 0, 1)`,
      starter: `import numpy as np
COSTO_FN, COSTO_FP = 100, 10
soglie = np.arange(0.1, 0.9, 0.05)

def costo_a_soglia(s):
    pred = (proba >= s).astype(int)
    fn = int(((pred == 0) & (y_true == 1)).sum())   # veri positivi mancati
    fp = int(((pred == 1) & (y_true == 0)).sum())   # falsi allarmi
    return fn * COSTO_FN + fp * COSTO_FP

costi = ...
soglia_ottima = soglie[int(np.argmin(costi))]
bassa_perche_fn_costoso = ...

print("soglia ottima:", round(float(soglia_ottima), 2))
print("costo minimo:", min(costi))`,
      check: `import numpy as np
COSTO_FN, COSTO_FP = 100, 10
soglie = np.arange(0.1, 0.9, 0.05)
def _c(s):
    pred = (proba >= s).astype(int)
    fn = int(((pred==0)&(y_true==1)).sum()); fp = int(((pred==1)&(y_true==0)).sum())
    return fn*COSTO_FN + fp*COSTO_FP
_costi = [_c(s) for s in soglie]
_opt = soglie[int(np.argmin(_costi))]
assert costi == _costi, "costi: [costo_a_soglia(s) for s in soglie]"
assert abs(float(soglia_ottima) - float(_opt)) < 1e-9, "soglia_ottima: soglie[argmin(costi)]"
assert bassa_perche_fn_costoso == bool(_opt < 0.5), "bassa_perche_fn_costoso: FN costa 10x FP -> soglia bassa"
assert _opt < 0.5, "con FN 10 volte piu' caro, la soglia ottima e' sotto 0.5"`,
      hint: `<p><code>costi = [costo_a_soglia(s) for s in soglie]</code>. <code>bassa_perche_fn_costoso = soglia_ottima &lt; 0.5</code>. Con FN 10 volte più caro dei FP, conviene predire più positivi (soglia bassa) per non perderne.</p>`,
      solution: `import numpy as np
COSTO_FN, COSTO_FP = 100, 10
soglie = np.arange(0.1, 0.9, 0.05)

def costo_a_soglia(s):
    pred = (proba >= s).astype(int)
    fn = int(((pred == 0) & (y_true == 1)).sum())
    fp = int(((pred == 1) & (y_true == 0)).sum())
    return fn * COSTO_FN + fp * COSTO_FP

costi = [costo_a_soglia(s) for s in soglie]
soglia_ottima = soglie[int(np.argmin(costi))]
bassa_perche_fn_costoso = soglia_ottima < 0.5

print("soglia ottima:", round(float(soglia_ottima), 2))
print("costo minimo:", min(costi))`
    },

    { type: "theory", title: "Leakage: il killer dei modelli", html: `
<p>"Il modello va benissimo in test ma malissimo in produzione. Perché?" — la risposta numero uno è <strong>data leakage</strong>: informazione che in produzione non avresti è trapelata nel training/valutazione, gonfiando i risultati.</p>
<p>Le forme che i colloqui chiedono di riconoscere:</p>
<ul>
<li><strong>Preprocessing prima dello split</strong>: scalare/imputare su tutti i dati;</li>
<li><strong>Feature dal futuro</strong>: usare dati registrati DOPO il momento della predizione;</li>
<li><strong>Proxy del target</strong>: una feature che è quasi la risposta ("data di disdetta" per predire chi disdice);</li>
<li><strong>Duplicati/gruppi</strong>: lo stesso soggetto in train e test.</li>
</ul>
<p>Sintomo classico: performance sospettosamente alta. "Se sembra troppo bello, è leakage finché non dimostri il contrario."</p>
`, more: `
<p>Riconoscere il leakage è una skill diagnostica che i colloqui premiano perché è l'errore più costoso e più subdolo del ML in produzione. Il test mentale per OGNI feature: "questo valore esisteva ed era noto NELL'ISTANTE in cui devo fare la predizione?". Se la risposta è no (feature dal futuro) o "solo per i casi positivi" (proxy del target), è leakage. Esempio classico: predire il churn con "numero di chiamate al supporto per disdetta" — quella feature è compilata solo DA chi ha già deciso di disdire, quindi in produzione è vuota per i casi da predire. Accuracy 0.99 in test, inutile in produzione.</p>
<p>Il leakage da preprocessing è il più sottile perché il codice "sembra" corretto: <code>StandardScaler().fit_transform(X)</code> prima dello split fa vedere al training le statistiche (media, varianza) dell'intero dataset, incluso il test. L'effetto è piccolo ma reale, e la difesa strutturale è la Pipeline (sala Feature Engineering/Model Evaluation) che rifitta tutto dentro ogni fold. Il leakage temporale è il più costoso: aggregazioni calcolate su tutto lo storico che includono il futuro rispetto al momento predetto — si scova solo con la validazione temporale (sala Time Series). Il leakage da gruppi (stesso paziente in train e test) richiede GroupKFold.</p>
<p>La risposta forte alla domanda "perché il modello fallisce in produzione" enumera le ipotesi in ordine di probabilità: (1) LEAKAGE (il più comune — la performance in test era gonfiata e falsa); (2) DATA DRIFT (i dati di produzione sono diversi da quelli di training — sala MLOps); (3) TRAINING-SERVING SKEW (le feature calcolate in produzione differiscono da quelle in training, per bug nella pipeline); (4) overfitting non colto (test set troppo piccolo o riusato). Saper elencare queste cause e come diagnosticarle (ricontrollare le feature per leakage, confrontare le distribuzioni per drift, verificare la pipeline per skew) è esattamente il ragionamento da senior che i colloqui cercano.</p>
` },

    {
      type: "exercise", id: "iv-07", kg: 15, title: "Caccia al leakage",
      task: `<p>Cinque situazioni. Segna <code>True</code> se c'è leakage, <code>False</code> se è corretto:</p>
<ul>
<li><code>s1</code>: "predico il churn usando 'motivo_disdetta' (compilato solo da chi ha disdetto)"</li>
<li><code>s2</code>: "scalo i dati con fit solo sul train, transform sul test"</li>
<li><code>s3</code>: "predico le vendite di domani usando la media mobile calcolata anche sui giorni futuri"</li>
<li><code>s4</code>: "stesso paziente con più visite, alcune in train altre in test, split casuale"</li>
<li><code>s5</code>: "uso una Pipeline che rifitta il preprocessing dentro ogni fold della CV"</li>
</ul>`,
      starter: `s1 = ...
s2 = ...
s3 = ...
s4 = ...
s5 = ...

print(s1, s2, s3, s4, s5)`,
      check: `assert s1 == True, "s1 LEAKAGE: 'motivo_disdetta' e' un proxy del target, esiste solo per i positivi"
assert s2 == False, "s2 CORRETTO: fit sul train, transform sul test — la regola giusta"
assert s3 == True, "s3 LEAKAGE: la media mobile sui giorni futuri usa dati non ancora disponibili"
assert s4 == True, "s4 LEAKAGE: lo stesso paziente in train e test -> serve GroupKFold"
assert s5 == False, "s5 CORRETTO: la Pipeline rifitta nel fold, niente leakage"`,
      hint: `<p>Il test: "quel dato era disponibile al momento della predizione?". s1 (proxy del target), s3 (futuro), s4 (gruppi) sono leakage. s2 e s5 seguono le regole (fit sul train, Pipeline in CV).</p>`,
      solution: `s1 = True
s2 = False
s3 = True
s4 = True
s5 = False

print(s1, s2, s3, s4, s5)`
    },

    {
      type: "exercise", id: "iv-08", kg: 15, title: "\"Funziona in test, fallisce in produzione\"",
      task: `<p>Classico scenario. Ordina le ipotesi da verificare per probabilità e associa la diagnosi giusta:</p>
<ul>
<li><code>ipotesi</code>: lista delle cause probabili, con almeno 3 tra "leakage", "data_drift", "training_serving_skew", "overfitting"</li>
<li><code>diagnosi_leakage</code>: come si scova il leakage &rarr; la stringa "ricontrollare_le_feature" (verificare se ogni feature era disponibile alla predizione)</li>
<li><code>diagnosi_drift</code>: come si scova il drift &rarr; la stringa "confrontare_distribuzioni" (train vs produzione)</li>
<li><code>prima_ipotesi</code>: la stringa "leakage" — la causa più comune quando il test era gonfiato</li>
</ul>`,
      starter: `# "il modello va benissimo in test ma male in produzione"

ipotesi = ["leakage", "data_drift", "training_serving_skew", "overfitting"]
diagnosi_leakage = "ricontrollare_le_feature"
diagnosi_drift = ...
prima_ipotesi = ...

print("ipotesi da verificare:", ipotesi)
print("prima ipotesi:", prima_ipotesi)`,
      check: `assert isinstance(ipotesi, list) and len(ipotesi) >= 3, "ipotesi: almeno 3 cause"
assert "leakage" in ipotesi and "data_drift" in ipotesi, "leakage e data_drift tra le ipotesi"
assert diagnosi_leakage == "ricontrollare_le_feature", "leakage si scova ricontrollando le feature (erano disponibili alla predizione?)"
assert diagnosi_drift == "confrontare_distribuzioni", "drift si scova confrontando le distribuzioni train vs produzione"
assert prima_ipotesi == "leakage", "prima_ipotesi: leakage — la causa piu' comune di 'test gonfiato'"`,
      hint: `<p>Le cause in ordine: leakage (test gonfiato), data drift (produzione diversa), training-serving skew (feature diverse), overfitting. Il leakage si scova ricontrollando le feature; il drift confrontando le distribuzioni. <code>prima_ipotesi = "leakage"</code>.</p>`,
      solution: `ipotesi = ["leakage", "data_drift", "training_serving_skew", "overfitting"]
diagnosi_leakage = "ricontrollare_le_feature"
diagnosi_drift = "confrontare_distribuzioni"
prima_ipotesi = "leakage"

print("ipotesi da verificare:", ipotesi)
print("prima ipotesi:", prima_ipotesi)`
    },

    { type: "theory", title: "Correlazione, causalità e p-value", html: `
<p>Tre trappole statistiche che i colloqui adorano:</p>
<ul>
<li><strong>Correlazione ≠ causalità</strong>: "X e Y correlano, quindi X causa Y?" No — può esserci un confondente, causalità inversa, o caso. Solo un esperimento randomizzato prova la causa;</li>
<li><strong>p-value frainteso</strong>: NON è la probabilità che l'ipotesi nulla sia vera, NÉ la probabilità di sbagliarsi. È P(dati così estremi | H0 vera);</li>
<li><strong>Significativo ≠ importante</strong>: con n enorme, effetti minuscoli diventano "significativi". Serve sempre l'effect size.</li>
</ul>
<p>La risposta forte a "questi due sono correlati, agiamo su X?": "la correlazione predice ma non autorizza a intervenire — servirebbe un esperimento per stabilire la causa".</p>
`, more: `
<p>La distinzione predire/intervenire (sala Statistica) è il cuore della trappola correlazione-causalità, ed è dove si fanno danni reali. Per PREDIRE va benissimo la correlazione: i gelati venduti predicono gli annegamenti (entrambi causati dal caldo). Per INTERVENIRE serve la causa: vietare i gelati non salverà nessuno. I modelli ML vivono di correlazioni e funzionano per predire; usare le loro feature importance come "leve d'azione" ("il modello dice che le visite al sito predicono gli acquisti, quindi forziamo più visite") è l'errore che trasforma un buon modello predittivo in decisioni disastrose. La risposta da colloquio: "questa feature è predittiva, ma prima di agirci verificherei se è causale con un esperimento".</p>
<p>Il p-value è forse il concetto più frainteso della statistica, e i colloqui lo sfruttano. Gli errori da NON fare: dire che p=0.03 significa "3% di probabilità che H0 sia vera" (FALSO — è P(dati|H0), la condizionata invertita); dire che "non significativo" prova che non c'è effetto (FALSO — assenza di evidenza ≠ evidenza di assenza, magari mancava potenza statistica); trattare 0.05 come una soglia magica (è convenzione arbitraria). La definizione corretta recitata con sicurezza — "la probabilità di osservare dati almeno così estremi SE l'ipotesi nulla fosse vera" — segnala rigore statistico.</p>
<p>"Significativo ≠ importante" è la trappola del big data: con milioni di osservazioni, il test rileva differenze infinitesimali come "statisticamente significative" (p&lt;0.001) anche se praticamente irrilevanti (un aumento di conversione dello 0.001%). Il p-value misura quanto sei SICURO che l'effetto non sia zero, non quanto l'effetto sia GRANDE. Per questo si riporta sempre l'EFFECT SIZE (la dimensione dell'effetto con il suo intervallo di confidenza) accanto al p-value. Nei test A/B su grandi numeri, la domanda giusta non è "è significativo?" ma "l'effetto è abbastanza grande da valere il costo del cambiamento?". Padroneggiare queste tre trappole — causalità, definizione del p-value, significatività vs importanza — copre una fetta enorme delle domande statistiche da colloquio.</p>
` },

    {
      type: "exercise", id: "iv-09", kg: 15, title: "Le trappole statistiche",
      task: `<p>Cinque affermazioni statistiche da colloquio. <code>True</code> se corretta, <code>False</code> se è un errore:</p>
<ul>
<li><code>a1</code>: "correlazione forte tra X e Y significa che X causa Y"</li>
<li><code>a2</code>: "p=0.03 significa che c'è il 3% di probabilità che l'ipotesi nulla sia vera"</li>
<li><code>a3</code>: "con un campione enorme, un effetto minuscolo può risultare statisticamente significativo ma irrilevante"</li>
<li><code>a4</code>: "solo un esperimento randomizzato permette conclusioni causali solide"</li>
<li><code>a5</code>: "un risultato 'non significativo' dimostra che non c'è alcun effetto"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == False, "a1 FALSA: correlazione != causalita' (confondenti, causalita' inversa, caso)"
assert a2 == False, "a2 FALSA: il p-value e' P(dati|H0), NON P(H0|dati)"
assert a3 == True, "a3 VERA: con n enorme anche effetti trascurabili diventano 'significativi' -> serve l'effect size"
assert a4 == True, "a4 VERA: solo la randomizzazione stabilisce la causa"
assert a5 == False, "a5 FALSA: assenza di evidenza NON e' evidenza di assenza (magari mancava potenza)"`,
      hint: `<p>Le corrette sono a3 (significativo≠importante) e a4 (solo l'esperimento prova la causa). Gli errori: a1 (correlazione≠causa), a2 (p-value invertito), a5 ("non significativo" non prova l'assenza).</p>`,
      solution: `a1 = False
a2 = False
a3 = True
a4 = True
a5 = False

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "iv-10", kg: 20, title: "Significativo ma irrilevante",
      task: `<p>Dimostra la trappola "significativo ≠ importante": con n enorme, un effetto minuscolo dà p bassissimo. Un A/B test con conversione 10.00% vs 10.05% su milioni di utenti:</p>
<ul>
<li><code>uplift_assoluto</code>: la differenza di conversione (0.1005 - 0.10)</li>
<li><code>uplift_relativo</code>: la crescita percentuale ((0.1005-0.10)/0.10)</li>
<li><code>significativo</code>: <code>True</code> se con n=5 milioni per gruppo il p-value è &lt; 0.05 (calcolo fornito)</li>
<li><code>ma_irrilevante</code>: <code>True</code> se l'uplift relativo è comunque minuscolo (&lt; 1%)</li>
<li><code>serve_effect_size</code>: <code>True</code> — il p-value da solo inganna, serve guardare l'effect size</li>
</ul>`,
      starter: `import numpy as np
from math import sqrt
# A/B test: 10.00% vs 10.05%, 5 milioni di utenti per gruppo

p_a, p_b = 0.10, 0.1005
n = 5_000_000

uplift_assoluto = p_b - p_a
uplift_relativo = (p_b - p_a) / p_a

# z-test approssimato
p_pool = (p_a + p_b) / 2
se = sqrt(p_pool * (1 - p_pool) * (2 / n))
z = (p_b - p_a) / se
# p-value a due code (approssimazione: |z|>1.96 -> significativo)
significativo = abs(z) > 1.96
ma_irrilevante = ...
serve_effect_size = ...

print(f"uplift: {uplift_assoluto:.4f} assoluto, {uplift_relativo:.2%} relativo")
print(f"z = {z:.2f} | significativo: {significativo} | ma irrilevante: {ma_irrilevante}")`,
      check: `import numpy as np
from math import sqrt
_ua = 0.1005 - 0.10; _ur = _ua/0.10
_pp = 0.100250; _se = sqrt(_pp*(1-_pp)*(2/5_000_000)); _z = _ua/_se
assert abs(uplift_assoluto - _ua) < 1e-9, "uplift_assoluto: 0.0005"
assert abs(uplift_relativo - _ur) < 1e-9, "uplift_relativo: 0.5%"
assert significativo == True, "significativo: True — con 5 milioni per gruppo anche 0.05 punti e' significativo"
assert ma_irrilevante == True, "ma_irrilevante: True — 0.5% di uplift relativo e' minuscolo"
assert serve_effect_size == True, "serve_effect_size: True — il p-value da solo inganna"`,
      hint: `<p>Con n enorme il test rileva anche 0.05 punti (significativo=True), ma un uplift relativo dello 0.5% è irrilevante. <code>ma_irrilevante = uplift_relativo &lt; 0.01</code>, <code>serve_effect_size = True</code>.</p>`,
      solution: `import numpy as np
from math import sqrt

p_a, p_b = 0.10, 0.1005
n = 5_000_000

uplift_assoluto = p_b - p_a
uplift_relativo = (p_b - p_a) / p_a

p_pool = (p_a + p_b) / 2
se = sqrt(p_pool * (1 - p_pool) * (2 / n))
z = (p_b - p_a) / se
significativo = abs(z) > 1.96
ma_irrilevante = uplift_relativo < 0.01
serve_effect_size = True

print(f"uplift: {uplift_assoluto:.4f} assoluto, {uplift_relativo:.2%} relativo")
print(f"z = {z:.2f} | significativo: {significativo} | ma irrilevante: {ma_irrilevante}")`
    },

    {
      type: "exercise", id: "iv-11", kg: 20, title: "\"Come sceglieresti tra due modelli?\"",
      task: `<p>Due modelli con CV score simili ma variabilità diversa. Il colloquio vuole vedere se guardi oltre la media:</p>
<ul>
<li>modello A: CV media 0.85, deviazione 0.02 | modello B: CV media 0.86, deviazione 0.09</li>
<li><code>media_migliore</code>: la stringa del modello con media più alta ("B")</li>
<li><code>piu_stabile</code>: la stringa del modello più stabile (deviazione minore) ("A")</li>
<li><code>differenza_significativa</code>: <code>False</code> se la differenza di media (0.01) è minore della somma delle deviazioni (probabilmente rumore)</li>
<li><code>scelta_ragionata</code>: la stringa "A" — più stabile, e il vantaggio di B in media non è affidabile</li>
</ul>`,
      starter: `# modello A: 0.85 +/- 0.02 | modello B: 0.86 +/- 0.09
media_a, std_a = 0.85, 0.02
media_b, std_b = 0.86, 0.09

media_migliore = "B"
piu_stabile = ...
differenza_significativa = abs(media_b - media_a) > (std_a + std_b)
scelta_ragionata = ...

print(f"A: {media_a} +/- {std_a} | B: {media_b} +/- {std_b}")
print(f"differenza significativa: {differenza_significativa} | scelta: {scelta_ragionata}")`,
      check: `assert media_migliore == "B", "media_migliore: B ha media 0.86 > 0.85"
assert piu_stabile == "A", "piu_stabile: A ha deviazione 0.02 << 0.09"
assert differenza_significativa == False, "differenza_significativa: False — 0.01 di differenza << somma delle std (0.11): probabilmente rumore"
assert scelta_ragionata == "A", "scelta_ragionata: A — piu' stabile, e il vantaggio di B non e' affidabile"`,
      hint: `<p><code>piu_stabile = "A"</code> (std 0.02 &lt;&lt; 0.09). La differenza di media (0.01) è molto minore della variabilità: probabilmente rumore. Si sceglie A, più affidabile. Guardare solo la media è l'errore.</p>`,
      solution: `media_a, std_a = 0.85, 0.02
media_b, std_b = 0.86, 0.09

media_migliore = "B"
piu_stabile = "A"
differenza_significativa = abs(media_b - media_a) > (std_a + std_b)
scelta_ragionata = "A"

print(f"A: {media_a} +/- {std_a} | B: {media_b} +/- {std_b}")
print(f"differenza significativa: {differenza_significativa} | scelta: {scelta_ragionata}")`
    },

    {
      type: "exercise", id: "iv-12", kg: 25, title: "MASSIMALE: il colloquio completo",
      task: `<p>Il gran finale: uno scenario di colloquio completo. "Un modello di credit scoring ha AUC 0.99 in test. Il capo vuole deployarlo domani." Conduci l'analisi critica:</p>
<ul>
<li><code>sospetto</code>: la stringa "leakage" — AUC 0.99 su un problema difficile è sospetta</li>
<li><code>feature_da_investigare</code>: dato il dict <code>importanze</code>, la feature che domina in modo sospetto (importanza &gt; 0.7)</li>
<li><code>e_un_proxy</code>: <code>True</code> se quella feature ("stato_pagamento_futuro") è chiaramente un proxy del target (informazione dal futuro)</li>
<li><code>domande</code>: lista di almeno 3 domande da fare tra "come_split", "c_e_leakage", "test_temporale", "effect_size", "quanto_costa_errore"</li>
<li><code>raccomandazione</code>: la stringa "non_deployare" — prima va investigato il leakage</li>
<li><code>analisi_completa</code>: <code>True</code> se tutti i pezzi sono coerenti</li>
</ul>`,
      setup: `importanze = {
    "reddito": 0.08,
    "eta": 0.05,
    "storico_credito": 0.12,
    "stato_pagamento_futuro": 0.75,   # sospetto! domina tutto
}`,
      starter: `# scenario: credit scoring, AUC 0.99 in test, deploy domani?

sospetto = "leakage"

# la feature che domina in modo sospetto
feature_da_investigare = max(importanze, key=importanze.get)
e_un_proxy = ...   # "stato_pagamento_futuro" e' informazione dal futuro?

domande = ["come_split", "c_e_leakage", "test_temporale"]
raccomandazione = ...
analisi_completa = ...

print("feature sospetta:", feature_da_investigare)
print("raccomandazione:", raccomandazione)`,
      check: `_fdi = max(importanze, key=importanze.get)
assert sospetto == "leakage", "sospetto: AUC 0.99 su credit scoring e' sospetta -> leakage"
assert feature_da_investigare == "stato_pagamento_futuro", "feature_da_investigare: quella che domina (0.75)"
assert e_un_proxy == True, "e_un_proxy: True — 'stato_pagamento_futuro' e' informazione dal futuro, un proxy del target"
assert isinstance(domande, list) and len(domande) >= 3, "domande: almeno 3"
assert raccomandazione == "non_deployare", "raccomandazione: non deployare finche' il leakage non e' escluso"
assert analisi_completa == True, "analisi_completa: True"`,
      hint: `<p>La feature "stato_pagamento_futuro" domina (0.75) ed è chiaramente informazione dal futuro → <code>e_un_proxy = True</code>. Con un proxy del target, l'AUC 0.99 è finta → <code>raccomandazione = "non_deployare"</code>. <code>analisi_completa = e_un_proxy and raccomandazione == "non_deployare"</code>.</p>`,
      solution: `sospetto = "leakage"

feature_da_investigare = max(importanze, key=importanze.get)
e_un_proxy = "futuro" in feature_da_investigare

domande = ["come_split", "c_e_leakage", "test_temporale"]
raccomandazione = "non_deployare"
analisi_completa = e_un_proxy and raccomandazione == "non_deployare" and len(domande) >= 3

print("feature sospetta:", feature_da_investigare)
print("raccomandazione:", raccomandazione)`
    }

  ]
});
