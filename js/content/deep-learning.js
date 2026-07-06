window.MODULES.push({
  id: "deep-learning",
  name: "Deep Learning",
  tagline: "La sala pesi olimpici: reti neurali, visione artificiale, sequenze e audio — i meccanismi veri, costruiti a mano.",
  intro: "PyTorch, TensorFlow e Keras non girano in un browser (troppo pesanti, nessuna build per questo ambiente): niente demo finte con quei nomi. Qui costruisci i meccanismi VERI con NumPy — lo stesso identico calcolo che quei framework fanno dietro le quinte — e alleni reti vere con scikit-learn su dataset piccoli e reali (comprese immagini vere, 8×8 pixel). Capirai come funziona una rete neurale meglio di chi si limita a chiamare `model.fit()`.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Il perceptron: la cellula base", html: `
<p>Un <strong>perceptron</strong> fa tre cose: moltiplica ogni input per un peso, somma tutto (più un <em>bias</em>), e applica una funzione di attivazione. È il mattone di ogni rete neurale, dalla più semplice a GPT:</p>
<pre><code>z = x1*w1 + x2*w2 + b       # somma pesata
output = attivazione(z)     # es. una soglia: 1 se z >= 0, altrimenti 0</code></pre>
<p>Con i pesi giusti, un solo perceptron impara funzioni logiche linearmente separabili come AND e OR. Il problema (e la ragione per cui servono più livelli) arriva con XOR — lo vedrai tra poco.</p>
`, more: `
<p>Geometricamente, un perceptron traccia un <strong>iperpiano</strong> nello spazio degli input: nel caso 2D dell'esempio AND, è semplicemente una retta che separa i punti dove l'output deve essere 1 da quelli dove deve essere 0. I pesi <code>w1, w2</code> determinano l'orientamento di quella retta, il bias <code>b</code> quanto è spostata dall'origine — esattamente gli stessi ruoli di pendenza e intercetta in una regressione lineare, vista nella sala Scikit-learn Base.</p>
<p>Il nome "perceptron" viene da un algoritmo storico (Rosenblatt, 1958) che imparava i pesi automaticamente da esempi etichettati, con una regola di aggiornamento molto semplice: se la previsione è sbagliata, sposta i pesi nella direzione che l'avrebbe resa corretta. È l'antenato diretto della discesa del gradiente (vista più avanti in questa sala), anche se la formulazione moderna è diversa nei dettagli matematici.</p>
<p>"Linearmente separabile" significa che esiste ALMENO UNA retta (o iperpiano, in più dimensioni) che separa perfettamente le due classi. AND e OR lo sono; XOR no — è il limite esatto che ha portato, storicamente, all'abbandono temporaneo della ricerca sui perceptron negli anni '70, fino alla riscoperta delle reti multi-livello negli anni '80.</p>
` },

    {
      type: "exercise", id: "nn-01", kg: 10, title: "Il tuo primo perceptron: la porta AND",
      task: `<p>Con pesi <code>w = [1.0, 1.0]</code> e bias <code>b = -1.5</code>, calcola l'output del perceptron (soglia a 0) per tutte e 4 le combinazioni di <code>X</code> (porta logica AND).</p>`,
      starter: `import numpy as np

X = np.array([[0,0],[0,1],[1,0],[1,1]])
w = np.array([1.0, 1.0])
b = -1.5

def step(x):
    return (x >= 0).astype(int)

z = X @ w + b
output = step(z)

print(z)
print(output)`,
      check: `import numpy as np
assert list(output) == [0, 0, 0, 1], "Solo (1,1) deve dare 1: e' la tabella di verita' di AND"`,
      hint: `<p>Con (1,1): <code>z = 1+1-1.5 = 0.5 &gt;= 0</code> → 1. Con (0,1): <code>z = 1-1.5 = -0.5 &lt; 0</code> → 0.</p>`,
      solution: `import numpy as np

X = np.array([[0,0],[0,1],[1,0],[1,1]])
w = np.array([1.0, 1.0])
b = -1.5

def step(x):
    return (x >= 0).astype(int)

z = X @ w + b
output = step(z)

print(z)
print(output)`
    },

    { type: "theory", title: "Funzioni di attivazione", html: `
<p>La funzione a soglia (step) non è derivabile — un problema per l'addestramento (serve calcolare gradienti). Le reti vere usano attivazioni "morbide":</p>
<pre><code>sigmoid(x) = 1 / (1 + e^-x)     # schiaccia tutto tra 0 e 1: buona per probabilita'
relu(x)    = max(0, x)          # zero sotto zero, identita' sopra: la piu' usata oggi
tanh(x)    = np.tanh(x)         # come sigmoid ma tra -1 e 1, centrata sullo zero</code></pre>
<p><code>ReLU</code> ha vinto nella pratica perché è velocissima da calcolare e non "satura" per valori positivi grandi (a differenza di sigmoid e tanh, che si appiattiscono e rallentano l'apprendimento).</p>
`, more: `
<p>Il problema della "saturazione" di sigmoid e tanh è concreto, non teorico: per valori di input molto grandi o molto piccoli, la curva diventa quasi piatta — la derivata (il gradiente) si avvicina a zero. Durante l'addestramento, un gradiente vicino a zero significa che quel neurone smette praticamente di imparare (i suoi pesi non si aggiornano più in modo significativo), un fenomeno chiamato "vanishing gradient" che diventa più grave quante più strati attraversa il segnale all'indietro.</p>
<p>ReLU non è priva di difetti: un neurone può "morire" (restare bloccato a produrre sempre zero) se i suoi pesi finiscono in una zona dove l'input è sempre negativo — a quel punto il gradiente è zero e non c'è modo di "risvegliarlo" con la discesa del gradiente standard. Varianti come <code>LeakyReLU</code> (che lascia passare una piccola pendenza anche per input negativi, invece di azzerarli del tutto) mitigano questo problema.</p>
<p>La scelta dell'attivazione nell'ultimo layer di output dipende dal tipo di problema, non è arbitraria: <code>sigmoid</code> per classificazione binaria (un'unica probabilità tra 0 e 1), <code>softmax</code> (non ancora vista, generalizzazione di sigmoid a più classi) per classificazione multi-classe, nessuna attivazione (identità) per la regressione — mentre nei layer NASCOSTI, ReLU è quasi sempre la scelta di default moderna, indipendentemente dal tipo di problema finale.</p>
` },

    {
      type: "exercise", id: "nn-02", kg: 10, title: "Le tre attivazioni a confronto",
      task: `<p>Implementa <code>sigmoid</code>, <code>relu</code> (con <code>np.maximum</code>) e usa <code>np.tanh</code>. Applicale tutte a <code>x</code>.</p>`,
      starter: `import numpy as np

x = np.array([-2.0, -0.5, 0.0, 0.5, 2.0])

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

s = sigmoid(x)
r = relu(x)
t = np.tanh(x)

print(s.round(3))
print(r)
print(t.round(3))`,
      check: `import numpy as np
assert np.allclose(s, [0.119, 0.378, 0.5, 0.622, 0.881], atol=1e-3)
assert list(r) == [0.0, 0.0, 0.0, 0.5, 2.0]
assert np.allclose(t, [-0.964, -0.462, 0.0, 0.462, 0.964], atol=1e-3)`,
      hint: `<p><code>sigmoid(0) = 0.5</code> sempre; <code>relu</code> azzera tutto ciò che è negativo, lascia intatto il resto.</p>`,
      solution: `import numpy as np

x = np.array([-2.0, -0.5, 0.0, 0.5, 2.0])

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

s = sigmoid(x)
r = relu(x)
t = np.tanh(x)

print(s.round(3))
print(r)
print(t.round(3))`
    },

    { type: "theory", title: "XOR: perché serve un livello nascosto", html: `
<p>Un solo perceptron traccia un confine <strong>lineare</strong> (una retta). XOR — vero solo quando gli input differiscono — non è separabile da nessuna retta: serve combinare più perceptron in un <strong>livello nascosto</strong>.</p>
<pre><code>h1 = sigmoid(X @ W1 + b1)    # livello nascosto: impara sotto-pattern (es. OR, NAND)
output = sigmoid(h1 @ W2 + b2)   # livello di output: li combina</code></pre>
<p>Con pesi scelti a mano, un hidden layer di 2 neuroni può calcolare <code>OR</code> e <code>NAND</code>, e l'output li combina con un <code>AND</code>: <code>OR AND NAND = XOR</code>. È l'esempio storico (1969, il "problema XOR" di Minsky-Papert) che ha mostrato i limiti dei perceptron singoli — e la soluzione che ha rilanciato le reti multi-livello.</p>
`, more: `
<p>Il "livello nascosto" si chiama così perché non è né l'input né l'output: è uno stadio intermedio di rappresentazione, che la rete costruisce da sola durante l'addestramento (nell'esempio di questa sala i pesi sono scelti a mano apposta per essere didattici, ma in una rete vera vengono imparati automaticamente). Ogni neurone nascosto impara a "riconoscere" un pattern parziale utile, che i layer successivi combinano in pattern più complessi — è il principio alla base di tutto il deep learning: rappresentazioni via via più astratte, costruite componendo rappresentazioni più semplici.</p>
<p>Il numero di neuroni nascosti necessari per un problema non è sempre ovvio a priori: per XOR bastano 2 (come in questo esempio), ma problemi più complessi possono richiedere centinaia o migliaia di neuroni distribuiti su più layer. Il <em>teorema di approssimazione universale</em> garantisce che una rete con UN SOLO layer nascosto abbastanza largo può approssimare qualsiasi funzione continua — ma non dice quanto largo debba essere, e in pratica reti più PROFONDE (più layer, ciascuno più stretto) spesso funzionano meglio di reti più larghe con un solo layer, a parità di parametri totali.</p>
<p>Il fatto che i pesi in questo esercizio siano scelti a mano (invece che imparati) è deliberato per isolare il concetto: la parte difficile del deep learning non è capire CHE una rete a 2 livelli può risolvere XOR, ma capire COME trovare automaticamente quei pesi partendo da dati ed etichette — è esattamente il problema che risolve la discesa del gradiente, vista poco più avanti in questa sala.</p>
` },

    {
      type: "exercise", id: "nn-03", kg: 20, title: "Risolvi XOR a mano",
      task: `<p>Con i pesi già forniti (che codificano OR nel primo neurone nascosto e NAND nel secondo), calcola il forward pass completo per tutti e 4 gli input di XOR.</p>`,
      starter: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

X = np.array([[0,0],[0,1],[1,0],[1,1]])
W1 = np.array([[20.0, -20.0], [20.0, -20.0]])
b1 = np.array([-10.0, 30.0])
W2 = np.array([20.0, 20.0])
b2 = -30.0

h = sigmoid(X @ W1 + b1)
output = sigmoid(h @ W2 + b2)

print(h.round(3))
print(output.round(3))`,
      check: `import numpy as np
assert np.allclose(output.round(0), [0, 1, 1, 0]), "Deve riprodurre la tabella di verita' di XOR: 0,1,1,0"`,
      hint: `<p>Il primo neurone nascosto (colonna 0 di <code>W1</code>) calcola OR, il secondo (colonna 1) calcola NAND. L'output li combina con un AND: solo quando ENTRAMBI sono attivi (cioè esattamente uno tra x1,x2 è acceso) l'output si accende.</p>`,
      solution: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

X = np.array([[0,0],[0,1],[1,0],[1,1]])
W1 = np.array([[20.0, -20.0], [20.0, -20.0]])
b1 = np.array([-10.0, 30.0])
W2 = np.array([20.0, 20.0])
b2 = -30.0

h = sigmoid(X @ W1 + b1)
output = sigmoid(h @ W2 + b2)

print(h.round(3))
print(output.round(3))`
    },

    { type: "theory", title: "Loss: misurare quanto sbaglia la rete", html: `
<p>Prima di correggere i pesi, serve un numero che dica "quanto va male": la <strong>funzione di perdita</strong> (loss). Due delle più comuni:</p>
<pre><code># MSE (Mean Squared Error) — per la regressione
mse = np.mean((y_vero - y_predetto) ** 2)

# Binary Cross-Entropy — per la classificazione binaria (y in {0,1}, pred = probabilita')
bce = -np.mean(y_vero*np.log(y_predetto) + (1-y_vero)*np.log(1-y_predetto))</code></pre>
<p>La BCE punisce moltissimo una previsione <em>sicura e sbagliata</em> (es. prevedere 0.99 quando la verità è 0): il logaritmo tende a −∞ vicino agli estremi. È per questo che si usa in classificazione invece della MSE: penalizza l'overconfidence in modo molto più severo.</p>
`, more: `
<p>Per la classificazione multi-classe (più di due categorie), la BCE si generalizza in <strong>categorical cross-entropy</strong>, applicata insieme all'attivazione <code>softmax</code> nell'ultimo layer (che trasforma un vettore di numeri arbitrari in una distribuzione di probabilità che somma a 1 su tutte le classi) — lo stesso principio della BCE, esteso a più di due esiti possibili.</p>
<p>La scelta della loss non è indipendente dal problema: usare MSE su un problema di classificazione (invece della cross-entropy) funziona ma tipicamente converge più lentamente e produce gradienti meno informativi vicino agli estremi — un disallineamento tra la loss e la vera natura del problema che, pur non essendo un errore "fatale", peggiora la qualità dell'addestramento.</p>
<p>La loss calcolata sul training set durante l'addestramento non è la stessa cosa della METRICA che userai per valutare il modello (accuratezza, R², precision) — la loss deve essere DIFFERENZIABILE per permettere la discesa del gradiente, mentre una metrica come l'accuratezza (che conta quante previsioni sono esatte) non lo è. Per questo si ottimizza una loss "proxy" (BCE, MSE) sperando che minimizzarla migliori anche la metrica che interessa davvero — di solito funziona, ma le due cose non sono matematicamente identiche.</p>
` },

    {
      type: "exercise", id: "nn-04", kg: 15, title: "Calcola le due loss",
      task: `<p>Con <code>y_true</code> (etichette vere) e <code>y_pred</code> (probabilità previste): calcola <code>mse</code> e <code>bce</code>.</p>`,
      starter: `import numpy as np

y_true = np.array([1, 0, 1, 1])
y_pred = np.array([0.9, 0.2, 0.6, 0.8])

mse = np.mean((y_true - y_pred) ** 2)
bce = -np.mean(y_true*np.log(y_pred) + (1-y_true)*np.log(1-y_pred))

print(mse)
print(bce)`,
      check: `assert abs(mse - 0.0625) < 1e-6
assert abs(bce - 0.2656183105130591) < 1e-6`,
      hint: `<p>Entrambe seguono la formula esattamente come scritta nella teoria: nessun ciclo necessario, sono già vettorizzate.</p>`,
      solution: `import numpy as np

y_true = np.array([1, 0, 1, 1])
y_pred = np.array([0.9, 0.2, 0.6, 0.8])

mse = np.mean((y_true - y_pred) ** 2)
bce = -np.mean(y_true*np.log(y_pred) + (1-y_true)*np.log(1-y_pred))

print(mse)
print(bce)`
    },

    { type: "theory", title: "Discesa del gradiente", html: `
<p>Per ridurre la loss, si spostano i pesi nella direzione che la fa scendere più in fretta: quella opposta al <strong>gradiente</strong> (la derivata). Sul singolo numero, l'idea si vede già chiara:</p>
<pre><code>def f(x): return (x - 3) ** 2   # minimo in x=3
x = 0.0
lr = 0.1                        # learning rate: quanto ci si muove ad ogni passo
for _ in range(20):
    grad = 2 * (x - 3)          # derivata di f
    x = x - lr * grad           # passo nella direzione opposta al gradiente</code></pre>
<p>Un <code>lr</code> troppo piccolo converge lentissimo; troppo grande "salta" oltre il minimo e può divergere. Le reti neurali fanno esattamente questo, milioni di volte, su milioni di pesi contemporaneamente — è tutto ciò che "addestrare" significa.</p>
`, more: `
<p>Nelle reti vere, il gradiente non si calcola con la formula analitica a mano (come <code>2*(x-3)</code> in questo esempio 1D): si usa la <strong>backpropagation</strong>, un algoritmo che applica la regola della catena del calcolo differenziale per propagare il gradiente della loss all'indietro attraverso ogni layer, dall'output verso l'input — è esattamente il meccanismo che PyTorch e TensorFlow automatizzano con l'"autograd" (visto nella teoria finale di questa sala), evitando di dover derivare a mano formule complesse per reti con milioni di parametri.</p>
<p>La variante usata in pratica non è la discesa del gradiente "pura" (su tutto il dataset ad ogni passo, troppo lenta su dataset grandi) ma lo <strong>stochastic gradient descent (SGD)</strong> o le sue varianti (Adam, RMSprop): si calcola il gradiente su un piccolo sottoinsieme casuale di dati (un "mini-batch") ad ogni passo, non sull'intero dataset — più rumoroso ma molto più veloce, e il rumore stesso aiuta a volte a scappare da minimi locali poco profondi.</p>
<p>Il <code>learning rate</code> non deve necessariamente restare costante per tutto l'addestramento: strategie di "learning rate scheduling" lo riducono progressivamente (passi grandi all'inizio per avvicinarsi velocemente, passi piccoli alla fine per affinare la convergenza) — un compromesso pratico tra velocità iniziale e precisione finale che un singolo valore fisso non può ottenere altrettanto bene.</p>
` },

    {
      type: "exercise", id: "nn-05", kg: 15, title: "Discesa del gradiente in 1D",
      task: `<p>Minimizza <code>f(x) = (x-3)^2</code> partendo da <code>x=0.0</code>, con <code>lr=0.1</code>, per 20 passi. Salva il valore finale in <code>x_finale</code>.</p>`,
      starter: `x = 0.0
lr = 0.1

for _ in range(20):
    grad = 2 * (x - 3)
    x = x - lr * grad

x_finale = x
print(x_finale)`,
      check: `assert abs(x_finale - 3) < 0.1, "Dopo 20 passi x deve essere vicinissimo al minimo vero, che e' 3"`,
      hint: `<p>Ogni passo riduce la distanza dal minimo del 20% (perché <code>grad = 2*(x-3)</code> e <code>lr=0.1</code> danno un fattore di correzione di 0.2): dopo 20 passi la distanza iniziale (3) è quasi azzerata.</p>`,
      solution: `x = 0.0
lr = 0.1

for _ in range(20):
    grad = 2 * (x - 3)
    x = x - lr * grad

x_finale = x
print(x_finale)`
    },

    {
      type: "exercise", id: "nn-06", kg: 20, title: "Verifica un gradiente senza calcolarlo a mano",
      task: `<p>Il <strong>gradiente numerico</strong> approssima la derivata senza fare calcolo simbolico: <code>(f(x+eps) - f(x-eps)) / (2*eps)</code>. Su <code>f(x) = x^2 + 3*x</code> in <code>x0=2.0</code>, calcola <code>grad_numerico</code> e confrontalo con la derivata vera <code>2*x0 + 3</code> in <code>grad_vero</code>.</p>`,
      starter: `def f(x):
    return x**2 + 3*x

x0 = 2.0
eps = 1e-5

grad_numerico = (f(x0 + eps) - f(x0 - eps)) / (2 * eps)
grad_vero = 2 * x0 + 3

print(grad_numerico, grad_vero)`,
      check: `assert abs(grad_numerico - grad_vero) < 1e-4, "Il gradiente numerico deve avvicinarsi moltissimo a quello analitico"`,
      hint: `<p>Questa tecnica ("gradient checking") è usata per VERIFICARE che una backpropagation scritta a mano sia corretta: se il gradiente calcolato dalla rete non combacia con quello numerico, c'è un bug nella derivazione.</p>`,
      solution: `def f(x):
    return x**2 + 3*x

x0 = 2.0
eps = 1e-5

grad_numerico = (f(x0 + eps) - f(x0 - eps)) / (2 * eps)
grad_vero = 2 * x0 + 3

print(grad_numerico, grad_vero)`
    },

    { type: "theory", title: "Una rete vera, allenata da scikit-learn", html: `
<p>Costruire il forward pass a mano insegna il meccanismo; allenarlo (con backpropagation e discesa del gradiente su migliaia di pesi) lo fa una libreria. Scikit-learn ha una rete feedforward pronta, <code>MLPClassifier</code> (Multi-Layer Perceptron):</p>
<pre><code>from sklearn.neural_network import MLPClassifier
rete = MLPClassifier(hidden_layer_sizes=(10,), max_iter=2000, random_state=0)
rete.fit(X_train, y_train)
rete.score(X_test, y_test)</code></pre>
<p><code>hidden_layer_sizes=(10,)</code> significa un livello nascosto da 10 neuroni; <code>(20, 10)</code> significherebbe due livelli, 20 e poi 10 neuroni — questo è letteralmente "deep" learning, più livelli impilati. Stesso identico rito <code>fit</code>/<code>score</code> di ogni altro modello scikit-learn già visto.</p>
`, more: `
<p><code>MLPClassifier</code> di scikit-learn è pensato per compiti relativamente piccoli e didattici: non supporta l'addestramento su GPU, non ha le architetture specializzate (convoluzionali, ricorrenti) viste più avanti in questa sala, ed è generalmente molto più lento di PyTorch/TensorFlow su reti grandi. È perfetto per capire il concetto e sperimentare rapidamente su dataset piccoli come <code>digits</code>, ma un progetto di deep learning vero userebbe uno dei framework dedicati.</p>
<p>Oltre a <code>hidden_layer_sizes</code>, altri iperparametri rilevanti di <code>MLPClassifier</code>: <code>activation</code> (default <code>"relu"</code>, ma può essere <code>"tanh"</code> o <code>"logistic"</code>), <code>solver</code> (l'algoritmo di ottimizzazione — <code>"adam"</code> di default, una variante moderna della discesa del gradiente), <code>learning_rate_init</code> (il tasso di apprendimento iniziale, stesso concetto visto nella teoria sulla discesa del gradiente).</p>
<p>Un errore comune da principianti: dimenticare che <code>MLPClassifier</code> (come KNN e SVM) è sensibile alla SCALA delle feature, perché l'ottimizzazione converge meglio quando gli input sono su range simili — uno <code>StandardScaler</code> in pipeline (visto nella sala Scikit-learn Avanzato) è quasi sempre una buona idea, tranne quando le feature sono già naturalmente sulla stessa scala (come i pixel 0-16 del dataset digits, visto più avanti in questa sala).</p>
` },

    {
      type: "exercise", id: "nn-07", kg: 20, title: "La tua prima rete neurale vera",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (dataset a due lune, non linearmente separabile): addestra <code>rete</code> (<code>MLPClassifier(hidden_layer_sizes=(10,), max_iter=2000, random_state=0)</code>) e confrontala con <code>log</code> (<code>LogisticRegression</code>).</p>`,
      setup: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
X, y = make_moons(n_samples=300, noise=0.2, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
# X_train, X_test, y_train, y_test: gia' pronti (dataset "a due lune")

rete = MLPClassifier(hidden_layer_sizes=(10,), max_iter=2000, random_state=0)
rete.fit(X_train, y_train)
acc_rete = rete.score(X_test, y_test)

log = LogisticRegression()
log.fit(X_train, y_train)
acc_log = log.score(X_test, y_test)

print(acc_rete, acc_log)`,
      check: `assert acc_rete > 0.75
assert acc_log > 0.75`,
      hint: `<p>Su dati a forma di "due lune" (non separabili da una retta), la rete neurale ha il vantaggio strutturale di poter imparare confini curvi — proprio come la SVM con kernel RBF vista in scikit-learn.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression

rete = MLPClassifier(hidden_layer_sizes=(10,), max_iter=2000, random_state=0)
rete.fit(X_train, y_train)
acc_rete = rete.score(X_test, y_test)

log = LogisticRegression()
log.fit(X_train, y_train)
acc_log = log.score(X_test, y_test)

print(acc_rete, acc_log)`
    },

    {
      type: "exercise", id: "nn-08", kg: 20, title: "Una rete per la regressione",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (una sinusoide rumorosa): addestra <code>MLPRegressor(hidden_layer_sizes=(20,20), max_iter=5000, random_state=0)</code> e calcola <code>r2</code>.</p>`,
      setup: `import numpy as np
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
Xr = rng.uniform(-3, 3, size=(100,1))
yr = np.sin(Xr).ravel() + rng.normal(0, 0.1, size=100)
X_train, X_test, y_train, y_test = train_test_split(Xr, yr, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPRegressor
# X_train, X_test, y_train, y_test: gia' pronti (sinusoide rumorosa)

modello = MLPRegressor(hidden_layer_sizes=(20, 20), max_iter=5000, random_state=0)
modello.fit(X_train, y_train)
r2 = modello.score(X_test, y_test)

print(r2)`,
      check: `assert r2 > 0.8, "Con due livelli nascosti la rete deve approssimare bene una sinusoide"`,
      hint: `<p>Una sinusoide non è una retta: una regressione lineare fallirebbe. Due livelli nascosti danno alla rete abbastanza "curve" per seguirla.</p>`,
      solution: `from sklearn.neural_network import MLPRegressor

modello = MLPRegressor(hidden_layer_sizes=(20, 20), max_iter=5000, random_state=0)
modello.fit(X_train, y_train)
r2 = modello.score(X_test, y_test)

print(r2)`
    },

    { type: "theory", title: "Overfitting nelle reti: più neuroni non è sempre meglio", html: `
<p>Stessa lezione già vista con gli alberi di decisione, qui sulle reti neurali: una rete enorme, allenata a lungo su pochi dati rumorosi, può <strong>memorizzare</strong> il rumore invece di imparare il pattern vero.</p>
<pre><code>MLPClassifier(hidden_layer_sizes=(2,), ...)         # piccola: fatica a memorizzare
MLPClassifier(hidden_layer_sizes=(200, 200), ...)   # enorme: rischia di memorizzare tutto</code></pre>
<p>Il sintomo è lo stesso di sempre: <code>accuracy_train</code> molto più alta di <code>accuracy_test</code>. I rimedi pratici sono: meno neuroni, meno iterazioni (<code>max_iter</code>), o aumentare <code>alpha</code> (la penalità di regolarizzazione L2 della rete — stessa idea di Ridge, applicata ai pesi della rete).</p>
`, more: `
<p>Oltre alla regolarizzazione L2 (<code>alpha</code>), le reti neurali hanno una tecnica di regolarizzazione specifica molto efficace: il <strong>dropout</strong>, che durante l'addestramento "spegne" casualmente una frazione dei neuroni ad ogni passo, costringendo la rete a non affidarsi troppo a nessun singolo neurone (ridondanza forzata). <code>MLPClassifier</code> di scikit-learn non supporta il dropout nativamente — è una delle ragioni per cui framework come PyTorch/Keras offrono più controllo fine sulla regolarizzazione.</p>
<p>Un'altra tecnica comune (anch'essa non disponibile in <code>MLPClassifier</code> ma standard in framework più completi) è l'<strong>early stopping</strong>: invece di allenare per un numero fisso di iterazioni, si monitora la loss su un set di validazione separato e si ferma l'addestramento non appena quella loss smette di migliorare — anche se la loss sul training continuerebbe a scendere, segno che la rete sta iniziando a overfittare.</p>
<p>La stessa firma diagnostica (gap train-test che cresce con la complessità del modello) vista qui per le reti neurali è identica a quella degli alberi di decisione nella sala Scikit-learn Avanzato: non è un caso, è la manifestazione universale dell'overfitting in QUALSIASI famiglia di modelli sufficientemente flessibile — il rimedio concettuale (meno complessità, più dati, o regolarizzazione) è sempre lo stesso, cambia solo come applicarlo al modello specifico.</p>
` },

    {
      type: "exercise", id: "nn-09", kg: 25, title: "Sorprendi l'overfitting sul fatto",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (dataset piccolo e rumoroso): confronta una rete piccola <code>(2,)</code> e una enorme <code>(200,200)</code> (entrambe con <code>alpha=1e-7</code>, pochissima regolarizzazione, per lasciare che l'overfitting emerga). Calcola <code>gap_piccola</code> e <code>gap_grande</code> (train − test).</p>`,
      setup: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
X, y = make_moons(n_samples=60, noise=0.4, random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=1)`,
      starter: `from sklearn.neural_network import MLPClassifier
# X_train, X_test, y_train, y_test: gia' pronti

piccola = MLPClassifier(hidden_layer_sizes=(2,), max_iter=5000, alpha=1e-7, random_state=0)
piccola.fit(X_train, y_train)
gap_piccola = piccola.score(X_train, y_train) - piccola.score(X_test, y_test)

grande = MLPClassifier(hidden_layer_sizes=(200, 200), max_iter=5000, alpha=1e-7, random_state=0)
grande.fit(X_train, y_train)
gap_grande = grande.score(X_train, y_train) - grande.score(X_test, y_test)

print(gap_piccola, gap_grande)
print("train grande:", grande.score(X_train, y_train))`,
      check: `assert gap_grande > gap_piccola, "La rete enorme deve mostrare un divario train-test maggiore: e' la firma dell'overfitting"
assert grande.score(X_train, y_train) > 0.99, "La rete enorme deve quasi memorizzare perfettamente il training"`,
      hint: `<p>La rete <code>(200,200)</code> arriva a <code>accuracy_train</code> vicina al 100%, ma il vantaggio non si trasferisce del tutto al test: il divario è la prova numerica dell'overfitting, non un'impressione.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier

piccola = MLPClassifier(hidden_layer_sizes=(2,), max_iter=5000, alpha=1e-7, random_state=0)
piccola.fit(X_train, y_train)
gap_piccola = piccola.score(X_train, y_train) - piccola.score(X_test, y_test)

grande = MLPClassifier(hidden_layer_sizes=(200, 200), max_iter=5000, alpha=1e-7, random_state=0)
grande.fit(X_train, y_train)
gap_grande = grande.score(X_train, y_train) - grande.score(X_test, y_test)

print(gap_piccola, gap_grande)
print("train grande:", grande.score(X_train, y_train))`
    },

    { type: "theory", title: "Computer vision: un'immagine è solo una matrice di numeri", html: `
<p>Per un computer, un'immagine in scala di grigi è una matrice 2D: ogni cella è l'intensità di un pixel. <code>load_digits()</code> di scikit-learn dà 1797 immagini VERE di cifre scritte a mano, 8×8 pixel, in scala di grigi 0-16:</p>
<pre><code>from sklearn.datasets import load_digits
dati = load_digits()
dati.images.shape   # (1797, 8, 8) — immagini 2D, per guardarle
dati.data.shape     # (1797, 64)   — le stesse immagini "appiattite" in vettori, per un MLP
dati.target[:5]     # le etichette vere: che cifra e'</code></pre>
<p>Un <code>MLPClassifier</code> normale non "vede" la struttura 2D: gli passi il vettore appiattito da 64 numeri, e impara comunque a riconoscere le cifre — ma senza sapere che il pixel 8 è "sotto" il pixel 0. Questo limite è esattamente il motivo per cui esistono le CNN, che vedrai tra poco.</p>
`, more: `
<p>Un'immagine A COLORI aggiunge una terza dimensione, il <strong>canale</strong>: invece di una singola matrice 2D, è un array 3D (altezza × larghezza × 3), dove i tre canali rappresentano tipicamente rosso, verde e blu (RGB). Un pixel colorato è quindi una combinazione di tre intensità, non una sola — il dataset digits di questa sala, in scala di grigi, è il caso più semplice possibile (un solo canale).</p>
<p>Il fatto che <code>dati.data</code> sia già "appiattito" (64 numeri invece di 8×8) mostra concretamente il costo di ignorare la struttura spaziale: il pixel in posizione (2,3) e quello in posizione (2,4), fisicamente adiacenti nell'immagine, diventano nel vettore appiattito posizioni 19 e 20 — vicini per puro caso di come li hai srotolati, non per una proprietà che il modello riconosce esplicitamente. Un MLP tratta questi due numeri come indipendenti quanto tratterebbe il primo e l'ultimo pixel dell'immagine.</p>
<p>Le dimensioni tipiche delle immagini in dataset reali sono molto più grandi di 8×8: MNIST (cifre scritte a mano, il dataset "storico" del deep learning) usa 28×28, i dataset di foto reali spesso 224×224 o più — appiattire un'immagine 224×224×3 darebbe un vettore di oltre 150.000 numeri, rendendo un MLP normale sia computazionalmente costoso sia inefficace nel catturare pattern spaziali: la ragione pratica, oltre a quella teorica, per cui le CNN dominano la visione artificiale.</p>
` },

    {
      type: "exercise", id: "nn-10", kg: 15, title: "Le tue prime immagini vere",
      task: `<p>Su <code>dati</code> (già caricato): <code>prima_immagine</code> (la prima, 8×8), <code>prima_etichetta</code>, <code>range_pixel</code> (tupla min,max di tutta <code>dati.data</code>).</p>`,
      setup: `from sklearn.datasets import load_digits
dati = load_digits()`,
      starter: `# dati e' gia' caricato
prima_immagine = dati.images[0]
prima_etichetta = dati.target[0]
range_pixel = (dati.data.min(), dati.data.max())

print(prima_immagine)
print(prima_etichetta)
print(range_pixel)`,
      check: `assert prima_immagine.shape == (8, 8)
assert range_pixel == (0.0, 16.0)`,
      hint: `<p>Le immagini di questo dataset usano solo 17 livelli di grigio (0-16), non 256 come una foto vera: sono state pre-elaborate per essere piccole e semplici da maneggiare.</p>`,
      solution: `prima_immagine = dati.images[0]
prima_etichetta = dati.target[0]
range_pixel = (dati.data.min(), dati.data.max())

print(prima_immagine)
print(prima_etichetta)
print(range_pixel)`
    },

    {
      type: "exercise", id: "nn-11", kg: 20, title: "Riconosci le cifre scritte a mano",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (cifre già splittate): addestra <code>MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0)</code>, calcola <code>acc</code>.</p>`,
      setup: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
d = load_digits()
X_train, X_test, y_train, y_test = train_test_split(d.data, d.target, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
# X_train, X_test, y_train, y_test: gia' pronti

rete = MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9, "Il riconoscimento cifre e' un compito relativamente facile: la rete deve superare il 90%"`,
      hint: `<p>Hai appena addestrato un vero riconoscitore di cifre scritte a mano — la stessa famiglia di compito del leggendario dataset MNIST, solo più piccolo.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier

rete = MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`
    },

    { type: "theory", title: "Convoluzione: il cuore delle CNN", html: `
<p>Una <strong>rete convoluzionale</strong> (CNN) non appiattisce l'immagine: fa scorrere un piccolo <em>kernel</em> (una mini-matrice di pesi) su ogni posizione, calcolando una somma pesata locale. Questo cattura pattern spaziali (bordi, angoli, texture) indipendentemente da dove si trovano nell'immagine:</p>
<pre><code>def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out</code></pre>
<p>Un kernel come <code>[[1,0,-1],[1,0,-1],[1,0,-1]]</code> è un classico <strong>rilevatore di bordi verticali</strong>: dà una risposta forte dove l'immagine passa bruscamente da chiaro a scuro in orizzontale. Una CNN vera impara i kernel da sola (sono pesi allenabili); qui li scriviamo a mano per vedere l'effetto.</p>
`, more: `
<p>Il vantaggio strutturale chiave della convoluzione rispetto a un layer denso è la <strong>condivisione dei pesi</strong>: lo STESSO kernel scorre su ogni posizione dell'immagine, quindi un pattern (es. un bordo) viene riconosciuto indipendentemente da DOVE si trova — un layer denso dovrebbe invece imparare pesi separati per riconoscere lo stesso pattern in ogni possibile posizione, uno spreco enorme di parametri (visto concretamente nell'esercizio "conta i parametri" di questa sala, dove un layer convoluzionale ha ordini di grandezza meno parametri di uno denso equivalente).</p>
<p>Una CNN vera applica tipicamente MOLTI kernel in parallelo nello stesso layer (non uno solo come nell'esempio didattico), ciascuno specializzato a rilevare un pattern diverso — bordi orizzontali, verticali, texture, angoli — e il numero di kernel di un layer si chiama numero di "canali di output" o "feature map". I layer successivi combinano questi pattern semplici in pattern via via più complessi (da bordi a forme, da forme a oggetti).</p>
<p>Il parametro <code>stride</code> (non usato nell'esempio, dove implicitamente vale 1) controlla di quante posizioni si sposta il kernel ad ogni passo: <code>stride=1</code> lo fa scorrere pixel per pixel (output quasi della stessa dimensione dell'input), <code>stride=2</code> lo fa saltare ogni due posizioni (dimezzando circa l'output) — un modo alternativo al pooling (prossima teoria) per ridurre la risoluzione spaziale mentre si processa l'immagine.</p>
` },

    {
      type: "exercise", id: "nn-12", kg: 20, title: "Costruisci un rilevatore di bordi",
      task: `<p>Implementa <code>conv2d(img, kernel)</code> (già abbozzata) e applicala a <code>img</code> (un bordo verticale netto: metà chiara, metà scura) con il kernel rilevatore di bordi fornito.</p>`,
      starter: `import numpy as np

img = np.array([
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
], dtype=float)

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

edges = conv2d(img, kernel)
print(edges)`,
      check: `import numpy as np
assert edges.shape == (4, 4), "Con immagine 6x6 e kernel 3x3, l'output e' 6-3+1=4 per lato"
assert np.allclose(edges[:, 1], 30.0), "La colonna dove passa il bordo (chiaro->scuro) deve avere risposta forte (30)"
assert np.allclose(edges[:, 0], 0.0), "Lontano dal bordo, la risposta deve essere zero"`,
      hint: `<p>Il kernel risponde forte solo dove, scorrendo da sinistra a destra, i valori passano da alti a bassi: esattamente dove sta il bordo nell'immagine.</p>`,
      solution: `import numpy as np

img = np.array([
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
    [10,10,10,0,0,0],
], dtype=float)

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

edges = conv2d(img, kernel)
print(edges)`
    },

    {
      type: "exercise", id: "nn-13", kg: 20, title: "Applica la tua convoluzione a una cifra vera",
      task: `<p>Riusa <code>conv2d</code> (fornita) su <code>immagine</code>, la prima cifra vera del dataset digits (8×8), con lo stesso kernel rilevatore di bordi verticali. Trova <code>posizione_bordo_piu_forte</code>: le coordinate (riga, colonna) della risposta massima in valore assoluto.</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_digits
immagine = load_digits().images[0]

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out`,
      starter: `import numpy as np
# immagine, conv2d: gia' pronti

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)
risposta = conv2d(immagine, kernel)

posizione_bordo_piu_forte = np.unravel_index(np.argmax(np.abs(risposta)), risposta.shape)

print(risposta.round(1))
print(posizione_bordo_piu_forte)`,
      check: `assert risposta.shape == (6, 6)
assert len(posizione_bordo_piu_forte) == 2`,
      hint: `<p><code>np.unravel_index(indice_piatto, shape)</code> converte un indice "appiattito" (come restituito da <code>argmax</code> su un array 2D) in coordinate (riga, colonna).</p>`,
      solution: `import numpy as np

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)
risposta = conv2d(immagine, kernel)

posizione_bordo_piu_forte = np.unravel_index(np.argmax(np.abs(risposta)), risposta.shape)

print(risposta.round(1))
print(posizione_bordo_piu_forte)`
    },

    { type: "theory", title: "Pooling: comprimere mantenendo l'essenziale", html: `
<p>Dopo la convoluzione, le CNN spesso applicano <strong>pooling</strong>: riducono la risoluzione tenendo solo l'informazione più importante di ogni piccola zona. Il più comune è il <strong>max pooling</strong>:</p>
<pre><code>def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out</code></pre>
<p>Con <code>size=2</code>, ogni blocco 2×2 diventa un solo numero (il massimo). Il vantaggio: l'immagine si rimpicciolisce (meno calcoli nei livelli successivi) e la rete diventa un po' più tollerante a piccoli spostamenti del soggetto nell'immagine.</p>
`, more: `
<p>La "tolleranza a piccoli spostamenti" (invarianza traslazionale approssimata) è una proprietà preziosa in visione artificiale: se un gatto in una foto si sposta di un pixel a destra, un buon riconoscitore dovrebbe continuare a dire "gatto" — il max pooling contribuisce a questo perché il massimo di un blocco 2×2 spesso resta lo stesso anche se il pattern rilevante si sposta leggermente all'interno di quel blocco.</p>
<p>Oltre al max pooling, esiste l'<strong>average pooling</strong> (la media invece del massimo di ogni blocco): il max pooling tende a preservare meglio i pattern più "forti" e distintivi (bordi netti, attivazioni intense), mentre l'average pooling produce una rappresentazione più "smussata" — in pratica il max pooling è storicamente il più usato nelle CNN per la classificazione di immagini.</p>
<p>Le architetture CNN moderne più recenti (es. ResNet e successori) tendono a usare il pooling con più parsimonia rispetto ai design classici, preferendo spesso lo <code>stride</code> nella convoluzione stessa (visto nella teoria sulla convoluzione) per ridurre la risoluzione — un dettaglio implementativo che dimostra come anche componenti "standard" come il pooling continuino ad evolversi con la ricerca, non sono un ingrediente fisso e immutabile.</p>
` },

    {
      type: "exercise", id: "nn-14", kg: 20, title: "Comprimi con il max pooling",
      task: `<p>Implementa <code>max_pool(mat, size)</code> e applicala a <code>m</code> (4×4) con <code>size=2</code>.</p>`,
      starter: `import numpy as np

m = np.array([
    [1,3,2,4],
    [5,6,1,2],
    [7,8,3,0],
    [1,2,9,5],
], dtype=float)

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out

pooled = max_pool(m, 2)
print(pooled)`,
      check: `import numpy as np
assert pooled.shape == (2, 2)
assert np.array_equal(pooled, [[6.0, 4.0], [8.0, 9.0]])`,
      hint: `<p>Il blocco in alto a sinistra è <code>[[1,3],[5,6]]</code>: il massimo è 6. Il blocco in basso a destra è <code>[[3,0],[9,5]]</code>: il massimo è 9.</p>`,
      solution: `import numpy as np

m = np.array([
    [1,3,2,4],
    [5,6,1,2],
    [7,8,3,0],
    [1,2,9,5],
], dtype=float)

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out

pooled = max_pool(m, 2)
print(pooled)`
    },

    { type: "theory", title: "RNN: reti con memoria per le sequenze", html: `
<p>Una rete feedforward normale non ha memoria: ogni input è indipendente dal precedente. Per dati <strong>sequenziali</strong> (testo, audio, serie temporali) servono le <strong>RNN</strong> (Recurrent Neural Network): ad ogni passo, la rete combina l'input corrente con uno <em>stato nascosto</em> che porta memoria dei passi precedenti.</p>
<pre><code>h = 0   # stato nascosto iniziale
for x in sequenza:
    h = tanh(Wx*x + Wh*h + b)   # il nuovo stato dipende da input E stato precedente
    # h ora "ricorda" un riassunto di tutto cio' che e' successo finora</code></pre>
<p>Lo stesso <code>h</code> viene riutilizzato (da cui "ricorrente") ad ogni passo temporale: la rete non ha pesi separati per ogni posizione della sequenza, ma li condivide nel tempo — proprio come le CNN condividono i pesi nello spazio.</p>
`, more: `
<p>Le RNN possono essere usate in diverse configurazioni a seconda del problema: "many-to-one" (un'intera sequenza in input, un solo output finale — es. classificare il sentiment di una frase), "many-to-many" (una sequenza in input, una sequenza in output della stessa lunghezza — es. etichettare ogni parola di una frase), o "sequence-to-sequence" (input e output di lunghezza diversa — es. traduzione automatica, dove serve un'architettura encoder-decoder più elaborata).</p>
<p>Il problema del <strong>gradiente che svanisce</strong> (accennato anche nella teoria sulle LSTM) è particolarmente severo nelle RNN semplici: durante la backpropagation nel tempo, il gradiente viene moltiplicato ripetutamente per gli stessi pesi <code>Wh</code> ad ogni passo indietro — se quei pesi hanno modulo minore di 1, il gradiente si riduce esponenzialmente con la lunghezza della sequenza, rendendo praticamente impossibile per la rete imparare dipendenze a lungo raggio (es. collegare l'inizio e la fine di una frase lunga).</p>
<p>Oggi, per molti compiti su testo (dove le RNN erano storicamente dominanti), l'architettura <strong>Transformer</strong> (alla base di GPT e simili) ha in gran parte soppiantato le RNN: invece di processare la sequenza un passo alla volta, i Transformer guardano l'intera sequenza contemporaneamente con un meccanismo di "attenzione" — più parallelizzabile e spesso più efficace nel catturare dipendenze a lungo raggio. Le RNN restano comunque un concetto fondamentale per capire l'evoluzione storica e per compiti più semplici o con risorse limitate.</p>
` },

    {
      type: "exercise", id: "nn-15", kg: 20, title: "La tua prima cella RNN",
      task: `<p>Con pesi scalari <code>Wx=0.5</code>, <code>Wh=0.8</code>, <code>b=0.0</code>: fai scorrere <code>sequenza = [1.0, 0.5, -0.2]</code> attraverso la cella RNN, salvando ogni stato nascosto in <code>stati</code>.</p>`,
      starter: `import numpy as np

Wx, Wh, b = 0.5, 0.8, 0.0
sequenza = [1.0, 0.5, -0.2]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

print(stati)`,
      check: `import numpy as np
assert len(stati) == 3
assert abs(stati[0] - np.tanh(0.5)) < 1e-9, "Il primo stato dipende solo da Wx*x (h iniziale e' 0)"
assert abs(stati[1] - np.tanh(0.5*0.5 + 0.8*stati[0])) < 1e-9, "Dal secondo passo in poi, lo stato precedente contribuisce"`,
      hint: `<p>Al primo passo <code>h</code> parte da 0, quindi <code>Wh*h</code> non contribuisce ancora: è solo dal secondo passo che la "memoria" entra in gioco.</p>`,
      solution: `import numpy as np

Wx, Wh, b = 0.5, 0.8, 0.0
sequenza = [1.0, 0.5, -0.2]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

print(stati)`
    },

    { type: "theory", title: "LSTM: memoria a lungo termine con i gate", html: `
<p>Le RNN semplici soffrono del <strong>gradiente che svanisce</strong>: su sequenze lunghe, l'informazione dei primi passi si diluisce fino a sparire. Le <strong>LSTM</strong> (Long Short-Term Memory) risolvono il problema con una "cella di memoria" <code>c</code> separata dallo stato nascosto, controllata da tre <em>gate</em> (cancelli, tra 0 e 1, calcolati con sigmoid):</p>
<pre><code>f_t = sigmoid(...)      # forget gate: quanto della vecchia memoria dimenticare
i_t = sigmoid(...)      # input gate: quanto del nuovo input far entrare
c_tilde = tanh(...)     # candidato di nuova informazione
c_t = f_t*c_prev + i_t*c_tilde     # aggiorna la memoria: dimentica un po', aggiungi un po'
o_t = sigmoid(...)      # output gate: quanto della memoria esporre come output
h_t = o_t * tanh(c_t)</code></pre>
<p>Il punto chiave è <code>c_t = f_t*c_prev + i_t*c_tilde</code>: è una somma (non un prodotto ripetuto come nelle RNN semplici), quindi il gradiente può fluire indietro nel tempo senza svanire esponenzialmente. Da qui il "long-term" nel nome.</p>
`, more: `
<p>Ogni gate ha un ruolo intuitivo se pensato come un cancello regolabile: il <strong>forget gate</strong> vicino a 0 significa "dimentica quasi tutto della vecchia memoria", vicino a 1 significa "conserva quasi tutto"; l'<strong>input gate</strong> regola analogamente quanto del nuovo candidato <code>c_tilde</code> entra nella memoria; l'<strong>output gate</strong> decide quanto della memoria aggiornata diventa visibile come output <code>h_t</code> — la cella di memoria <code>c_t</code> può quindi contenere informazione che non è (ancora) esposta all'esterno, un concetto che le RNN semplici non hanno.</p>
<p>Una variante più semplice e oggi molto diffusa è la <strong>GRU</strong> (Gated Recurrent Unit), che fonde forget e input gate in un unico "update gate" e non ha una cella di memoria separata dallo stato nascosto — meno parametri della LSTM, spesso prestazioni comparabili, un compromesso pratico tra semplicità computazionale e capacità di modellazione.</p>
<p>Nonostante il nome "long short-term memory" suggerisca memoria illimitata, le LSTM in pratica faticano comunque su sequenze ESTREMAMENTE lunghe (centinaia o migliaia di passi) — mitigano il problema del gradiente che svanisce, non lo eliminano del tutto. È uno dei motivi per cui, su testo lungo, i Transformer (menzionati anche nella teoria sulle RNN) hanno preso il sopravvento: il loro meccanismo di attenzione accede direttamente a qualsiasi posizione della sequenza, senza dover "propagare" informazione passo dopo passo come le RNN/LSTM.</p>
` },

    {
      type: "exercise", id: "nn-16", kg: 25, title: "Un passo di LSTM, gate per gate",
      task: `<p>Con i pesi scalari forniti e stato precedente <code>h_prev=0.5</code>, <code>c_prev=0.2</code>, input <code>x_t=1.0</code>: calcola tutti e 4 i gate e lo stato finale <code>h_t</code>.</p>`,
      starter: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

x_t, h_prev, c_prev = 1.0, 0.5, 0.2
Wf, bf = 0.6, 0.1
Wi, bi = 0.5, 0.0
Wc, bc = 0.4, 0.0
Wo, bo = 0.3, 0.1

f_t = sigmoid(Wf*(x_t + h_prev) + bf)
i_t = sigmoid(Wi*(x_t + h_prev) + bi)
c_tilde = np.tanh(Wc*(x_t + h_prev) + bc)
c_t = f_t*c_prev + i_t*c_tilde
o_t = sigmoid(Wo*(x_t + h_prev) + bo)
h_t = o_t * np.tanh(c_t)

print(f_t, i_t, c_tilde, c_t, o_t, h_t)`,
      check: `import numpy as np
assert abs(f_t - 0.7310585786300049) < 1e-9
assert abs(c_t - 0.5109643420324347) < 1e-9
assert abs(h_t - 0.2984852300280866) < 1e-9`,
      hint: `<p>Ogni gate è un <code>sigmoid</code> (o <code>tanh</code> per il candidato) applicato a una somma pesata: segui la formula riga per riga, l'ordine di calcolo è già quello giusto.</p>`,
      solution: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

x_t, h_prev, c_prev = 1.0, 0.5, 0.2
Wf, bf = 0.6, 0.1
Wi, bi = 0.5, 0.0
Wc, bc = 0.4, 0.0
Wo, bo = 0.3, 0.1

f_t = sigmoid(Wf*(x_t + h_prev) + bf)
i_t = sigmoid(Wi*(x_t + h_prev) + bi)
c_tilde = np.tanh(Wc*(x_t + h_prev) + bc)
c_t = f_t*c_prev + i_t*c_tilde
o_t = sigmoid(Wo*(x_t + h_prev) + bo)
h_t = o_t * np.tanh(c_t)

print(f_t, i_t, c_tilde, c_t, o_t, h_t)`
    },

    { type: "theory", title: "Audio: una forma d'onda è un array di numeri", html: `
<p>Il microfono campiona la pressione dell'aria migliaia di volte al secondo: il risultato è un array 1D di numeri, la <strong>forma d'onda</strong>. Generarne una sinusoide sintetica è un ottimo modo per capire i parametri fondamentali:</p>
<pre><code>sr = 100                       # sample rate: campioni al secondo (Hz). L'audio vero usa 44100 o 16000
t = np.arange(0, 1, 1/sr)      # 1 secondo di tempo, campionato
freq = 5                       # frequenza del tono, in Hz
onda = np.sin(2 * np.pi * freq * t)</code></pre>
<p>Più alto il <code>sample rate</code>, più fedele la ricostruzione delle frequenze alte (per il teorema di Nyquist, si possono catturare correttamente solo frequenze fino a metà del sample rate). Ogni pipeline di ML audio parte esattamente da questo array.</p>
`, more: `
<p>Il <strong>teorema di Nyquist-Shannon</strong>, citato nella teoria, è più di un dettaglio tecnico: spiega perché l'audio "da CD" usa 44100 Hz (cattura correttamente frequenze fino a 22050 Hz, oltre il limite dell'udito umano tipico di circa 20000 Hz) mentre il parlato per riconoscimento vocale spesso usa solo 16000 Hz (sufficienti per le frequenze rilevanti della voce umana, risparmiando spazio e calcolo). Campionare più in fretta del necessario spreca risorse; campionare troppo lentamente introduce un artefatto chiamato "aliasing", dove frequenze alte vengono erroneamente ricostruite come frequenze basse, diverse dall'originale.</p>
<p>Una forma d'onda grezza raramente viene data in pasto direttamente a un modello di machine learning per l'audio: si preferisce quasi sempre trasformarla prima in una rappresentazione più informativa, tipicamente uno <strong>spettrogramma</strong> (come cambia il contenuto in frequenza nel TEMPO, non solo la frequenza dominante di tutto il segnale) o i <strong>coefficienti MFCC</strong> (Mel-Frequency Cepstral Coefficients, una rappresentazione ispirata a come l'orecchio umano percepisce le frequenze) — la FFT vista nella prossima teoria di questa sala è il primo passo concettuale verso entrambe.</p>
<p>Il "clipping" (quando l'ampiezza di un segnale supera il range rappresentabile, es. ±1.0 per audio normalizzato) introduce distorsione: i picchi vengono "tagliati" invece di essere rappresentati fedelmente. Normalizzare un segnale (dividerlo per il suo valore massimo assoluto, così che rientri sempre in [-1, 1]) è un passo di pre-processing comune prima di qualsiasi elaborazione successiva, esattamente come lo scaling delle feature numeriche visto nella sala Scikit-learn Avanzato.</p>
` },

    {
      type: "exercise", id: "nn-17", kg: 15, title: "Genera un tono puro",
      task: `<p>Genera <code>onda</code>: un tono sinusoidale a 5 Hz, campionato a 100 Hz, per 1 secondo. Calcola <code>n_campioni</code> e <code>valore_massimo</code>.</p>`,
      starter: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
freq = 5

onda = np.sin(2 * np.pi * freq * t)
n_campioni = len(onda)
valore_massimo = onda.max()

print(n_campioni, round(valore_massimo, 3))`,
      check: `assert n_campioni == 100
assert abs(valore_massimo - 1.0) < 1e-6`,
      hint: `<p>Con <code>sr=100</code> e 1 secondo di durata, hai esattamente 100 campioni: un seno oscilla sempre tra -1 e 1.</p>`,
      solution: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
freq = 5

onda = np.sin(2 * np.pi * freq * t)
n_campioni = len(onda)
valore_massimo = onda.max()

print(n_campioni, round(valore_massimo, 3))`
    },

    { type: "theory", title: "Dal tempo alla frequenza: la FFT", html: `
<p>Guardare la forma d'onda nel tempo non dice facilmente "che note contiene". La <strong>Trasformata di Fourier</strong> (FFT, Fast Fourier Transform) converte il segnale nel <strong>dominio delle frequenze</strong>: quali frequenze lo compongono, e con quale intensità.</p>
<pre><code>spettro = np.fft.fft(onda)                  # numeri complessi: una ampiezza per frequenza
frequenze = np.fft.fftfreq(len(onda), 1/sr)  # a quali Hz corrisponde ogni voce dello spettro
ampiezze = np.abs(spettro)                   # l'intensita' di ogni frequenza (modulo del complesso)</code></pre>
<p>Lo spettro è simmetrico (metà con frequenze negative, uno specchio matematico senza significato fisico per segnali reali): si guarda di solito solo la prima metà. La frequenza col picco più alto è la "nota" dominante — è il fondamento di ogni riconoscimento vocale o musicale.</p>
`, more: `
<p>La FFT (Fast Fourier Transform) è un algoritmo efficiente per calcolare la Trasformata di Fourier Discreta (DFT): la versione "naive" della DFT richiederebbe un tempo proporzionale a N² (N = numero di campioni), la FFT lo riduce a N·log(N) — una differenza enorme su segnali audio reali con migliaia o milioni di campioni, ed è il motivo per cui la FFT (non la DFT diretta) è lo standard pratico ovunque si processi audio.</p>
<p>Un limite importante della FFT su un segnale intero: assume implicitamente che il contenuto in frequenza sia COSTANTE per tutta la durata del segnale — perfetto per un tono puro che non cambia, ma inadatto per l'audio reale (una voce che cambia continuamente altezza e timbro). La soluzione pratica è la <strong>STFT</strong> (Short-Time Fourier Transform): si applica la FFT a tante piccole finestre temporali sovrapposte del segnale, ottenendo uno spettrogramma che mostra come lo spettro CAMBIA nel tempo — il chunking dei documenti visto nella sala RAG e questo "chunking nel tempo" dell'audio condividono la stessa logica di fondo.</p>
<p>La FFT si applica identica a qualsiasi segnale periodico o quasi-periodico, non solo all'audio: un sensore di vibrazione industriale, un elettrocardiogramma, una serie temporale di vendite con stagionalità settimanale — ovunque serva capire "quali cicli/periodicità compongono questo segnale nel tempo", la stessa tecnica si applica senza modifiche concettuali.</p>
` },

    {
      type: "exercise", id: "nn-18", kg: 20, title: "Trova la frequenza nascosta",
      task: `<p>Su <code>onda</code> (tono puro, sample rate 100 Hz): calcola lo spettro con <code>np.fft.fft</code>, le frequenze corrispondenti con <code>np.fft.fftfreq</code>, e trova <code>frequenza_dominante</code> (guardando solo la prima metà dello spettro).</p>`,
      setup: `import numpy as np
sr = 100
t = np.arange(0, 1, 1/sr)
onda = np.sin(2*np.pi*5*t)`,
      starter: `import numpy as np
# onda, sr: gia' pronti (un tono nascosto, non sai a priori la frequenza)

spettro = np.fft.fft(onda)
frequenze = np.fft.fftfreq(len(onda), 1/sr)
ampiezze = np.abs(spettro)

meta = len(onda) // 2
frequenza_dominante = frequenze[:meta][np.argmax(ampiezze[:meta])]

print(frequenza_dominante)`,
      check: `assert abs(frequenza_dominante - 5.0) < 1e-9, "Il tono era a 5 Hz: la FFT deve ritrovarlo esattamente"`,
      hint: `<p>Lavora solo sulla prima metà (<code>[:meta]</code>) di frequenze e ampiezze: la seconda metà è lo specchio matematico delle frequenze negative, senza nuova informazione per un segnale reale.</p>`,
      solution: `import numpy as np

spettro = np.fft.fft(onda)
frequenze = np.fft.fftfreq(len(onda), 1/sr)
ampiezze = np.abs(spettro)

meta = len(onda) // 2
frequenza_dominante = frequenze[:meta][np.argmax(ampiezze[:meta])]

print(frequenza_dominante)`
    },

    {
      type: "exercise", id: "nn-19", kg: 25, title: "Separa due note sovrapposte",
      task: `<p><code>accordo</code> contiene due frequenze sovrapposte (5 Hz e 20 Hz, la seconda più debole). Trova <code>top2_frequenze</code>: le 2 frequenze coi picchi di ampiezza più alti, ordinate crescenti.</p>`,
      setup: `import numpy as np
sr = 100
t = np.arange(0, 1, 1/sr)
accordo = np.sin(2*np.pi*5*t) + 0.5*np.sin(2*np.pi*20*t)`,
      starter: `import numpy as np
# accordo, sr: gia' pronti

spettro = np.fft.fft(accordo)
frequenze = np.fft.fftfreq(len(accordo), 1/sr)
ampiezze = np.abs(spettro)

meta = len(accordo) // 2
freq_meta = frequenze[:meta]
amp_meta = ampiezze[:meta]

top2_idx = np.argsort(amp_meta)[::-1][:2]
top2_frequenze = sorted(freq_meta[top2_idx])

print(top2_frequenze)`,
      check: `import numpy as np
assert np.allclose(sorted(top2_frequenze), [5.0, 20.0])`,
      hint: `<p>Anche se una delle due componenti è più debole (ampiezza dimezzata), la FFT la separa comunque nettamente dalle altre frequenze quasi-zero: per questo <code>argsort</code> + i primi 2 bastano.</p>`,
      solution: `spettro = np.fft.fft(accordo)
frequenze = np.fft.fftfreq(len(accordo), 1/sr)
ampiezze = np.abs(spettro)

meta = len(accordo) // 2
freq_meta = frequenze[:meta]
amp_meta = ampiezze[:meta]

top2_idx = np.argsort(amp_meta)[::-1][:2]
top2_frequenze = sorted(freq_meta[top2_idx])

print(top2_frequenze)`
    },

    { type: "theory", title: "PyTorch, TensorFlow, Keras: la stessa idea, tre sintassi", html: `
<p>Questi framework non girano in un browser, ma la loro <strong>API</strong> vale la pena conoscerla: sono tutti wrapper attorno agli stessi concetti che hai appena costruito a mano (tensori, layer, forward pass, backward automatico).</p>
<pre><code># Keras / TensorFlow: uno stack dichiarativo di layer
modello = keras.Sequential([
    keras.layers.Dense(32, activation="relu", input_shape=(64,)),
    keras.layers.Dense(10, activation="softmax"),
])

# PyTorch: una classe con un metodo forward esplicito
class Rete(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = torch.nn.Linear(64, 32)
        self.fc2 = torch.nn.Linear(32, 10)
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)</code></pre>
<p>Keras è più dichiarativo (descrivi la struttura, il framework gestisce il resto); PyTorch è più esplicito (scrivi tu il forward pass, il framework calcola automaticamente i gradienti all'indietro con <em>autograd</em>). Concettualmente sono lo stesso identico grafo di calcolo che hai già manipolato a mano in questa sala.</p>
`, more: `
<p><strong>Autograd</strong> (il meccanismo di differenziazione automatica di PyTorch, ma il concetto è analogo in TensorFlow) è ciò che rende inutile derivare a mano i gradienti come negli esercizi di questa sala: ogni operazione su un tensore "tracciato" viene registrata in un grafo, e chiamare <code>.backward()</code> su un valore finale (tipicamente la loss) percorre quel grafo all'indietro calcolando automaticamente il gradiente rispetto a OGNI parametro coinvolto, per complesso che sia il modello — la stessa idea della backpropagation manuale, ma automatizzata e affidabile anche su reti con milioni di parametri.</p>
<p>Keras (oggi parte integrante di TensorFlow) e PyTorch riflettono due filosofie di design diverse ma equivalenti in potenza: Keras privilegia la rapidità di prototipazione per architetture standard (uno stack sequenziale di layer si scrive in poche righe), PyTorch privilegia il controllo esplicito e la trasparenza (utile quando l'architettura è insolita o serve debuggare un comportamento specifico) — la scelta tra i due è spesso una questione di preferenza del team o dell'ecosistema di librerie collegate, non di capacità intrinseche superiori dell'uno sull'altro.</p>
<p>Il "tensore" che dà il nome a entrambi i framework è semplicemente la generalizzazione di scalare (0 dimensioni), vettore (1D), matrice (2D) a un numero arbitrario di dimensioni — un batch di immagini a colori, ad esempio, è un tensore 4D (batch × altezza × larghezza × canali). Gli array NumPy usati in questa intera sala SONO concettualmente tensori; la differenza pratica è che i tensori di PyTorch/TensorFlow possono vivere sulla GPU e portano con sé il grafo per l'autograd, due funzionalità che un semplice <code>ndarray</code> NumPy non ha.</p>
` },

    {
      type: "exercise", id: "nn-20", kg: 20, title: "Conta i parametri di un layer denso",
      task: `<p>Un layer denso (fully-connected) da <code>input_units</code> a <code>output_units</code> ha <code>input_units * output_units</code> pesi più <code>output_units</code> bias. Scrivi <code>parametri_dense(input_units, output_units)</code> e calcola i parametri totali di una rete <code>64 → 32 → 10</code> (due layer).</p>`,
      starter: `def parametri_dense(input_units, output_units):
    return input_units * output_units + output_units

layer1 = parametri_dense(64, 32)
layer2 = parametri_dense(32, 10)
totale = layer1 + layer2

print(layer1, layer2, totale)`,
      check: `assert layer1 == 2080
assert layer2 == 330
assert totale == 2410`,
      hint: `<p>64*32=2048 pesi + 32 bias = 2080 per il primo layer. È esattamente il numero che vedresti stampato da <code>model.summary()</code> in Keras.</p>`,
      solution: `def parametri_dense(input_units, output_units):
    return input_units * output_units + output_units

layer1 = parametri_dense(64, 32)
layer2 = parametri_dense(32, 10)
totale = layer1 + layer2

print(layer1, layer2, totale)`
    },

    {
      type: "exercise", id: "nn-21", kg: 20, title: "Che forma ha l'output di una convoluzione?",
      task: `<p>Scrivi <code>shape_conv(dimensione, kernel, stride, padding)</code>: <code>(dimensione - kernel + 2*padding) // stride + 1</code>. Calcola l'output per un'immagine 28×28 con kernel 3, stride 1, padding 0 e con padding 1 ("same" padding).</p>`,
      starter: `def shape_conv(dimensione, kernel, stride, padding):
    return (dimensione - kernel + 2*padding) // stride + 1

senza_padding = shape_conv(28, 3, 1, 0)
con_padding = shape_conv(28, 3, 1, 1)

print(senza_padding, con_padding)`,
      check: `assert senza_padding == 26
assert con_padding == 28`,
      hint: `<p>Con <code>padding=1</code> e kernel 3×3, l'output ha la STESSA dimensione dell'input ("same padding"): è la configurazione più comune nelle CNN moderne.</p>`,
      solution: `def shape_conv(dimensione, kernel, stride, padding):
    return (dimensione - kernel + 2*padding) // stride + 1

senza_padding = shape_conv(28, 3, 1, 0)
con_padding = shape_conv(28, 3, 1, 1)

print(senza_padding, con_padding)`
    },

    {
      type: "exercise", id: "nn-22", kg: 25, title: "Progetta una mini-CNN sulla carta",
      task: `<p>Scrivi <code>parametri_conv(kh, kw, canali_in, canali_out)</code>: <code>(kh*kw*canali_in + 1) * canali_out</code> (il <code>+1</code> è il bias, condiviso per output channel). Calcola i parametri di due layer convoluzionali in sequenza: primo <code>3x3, 1→8</code> canali, secondo <code>3x3, 8→16</code> canali.</p>`,
      starter: `def parametri_conv(kh, kw, canali_in, canali_out):
    return (kh*kw*canali_in + 1) * canali_out

conv1 = parametri_conv(3, 3, 1, 8)
conv2 = parametri_conv(3, 3, 8, 16)
totale_conv = conv1 + conv2

print(conv1, conv2, totale_conv)`,
      check: `assert conv1 == 80
assert conv2 == 1168
assert totale_conv == 1248`,
      hint: `<p>Nota quanto sono POCHI questi parametri rispetto ai layer densi dell'esercizio precedente (2410 per soli due layer FC): i kernel convoluzionali si riusano su tutta l'immagine invece di avere un peso per ogni pixel, il vero motivo per cui le CNN scalano bene sulle immagini.</p>`,
      solution: `def parametri_conv(kh, kw, canali_in, canali_out):
    return (kh*kw*canali_in + 1) * canali_out

conv1 = parametri_conv(3, 3, 1, 8)
conv2 = parametri_conv(3, 3, 8, 16)
totale_conv = conv1 + conv2

print(conv1, conv2, totale_conv)`
    },

    {
      type: "exercise", id: "nn-23", kg: 25, title: "Combo: pipeline conv + pool su una cifra vera",
      task: `<p>Su <code>immagine</code> (8×8, cifra vera): applica <code>conv2d</code> con il kernel edge-detector (risultato 6×6), poi <code>max_pool</code> con <code>size=2</code> sul risultato (deve dare 3×3). Verifica che l'informazione sui bordi sopravviva alla compressione.</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_digits
immagine = load_digits().images[3]

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out`,
      starter: `import numpy as np
# immagine, conv2d, max_pool: gia' pronti

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

feature_map = conv2d(immagine, kernel)
compressa = max_pool(feature_map, 2)

print(feature_map.shape, compressa.shape)
print(compressa.round(1))`,
      check: `assert feature_map.shape == (6, 6)
assert compressa.shape == (3, 3)
assert compressa.max() >= feature_map.max() - 1e-9`,
      hint: `<p>Il max di <code>compressa</code> deve coincidere col max di <code>feature_map</code>: il max pooling non perde MAI il valore più alto di ogni blocco, solo la sua posizione esatta.</p>`,
      solution: `kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

feature_map = conv2d(immagine, kernel)
compressa = max_pool(feature_map, 2)

print(feature_map.shape, compressa.shape)
print(compressa.round(1))`
    },

    {
      type: "exercise", id: "nn-24", kg: 25, title: "Combo: RNN su una sequenza più lunga",
      task: `<p>Estendi la cella RNN a una sequenza di 6 valori. Trova <code>stato_finale</code> e <code>indice_stato_massimo</code> (a quale passo temporale lo stato nascosto è stato più alto).</p>`,
      starter: `import numpy as np

Wx, Wh, b = 0.6, 0.7, 0.1
sequenza = [1.0, -0.5, 0.8, 0.3, -1.0, 0.6]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

stato_finale = stati[-1]
indice_stato_massimo = int(np.argmax(stati))

print(stati)
print(stato_finale, indice_stato_massimo)`,
      check: `import numpy as np
assert len(stati) == 6
assert abs(stato_finale - stati[-1]) < 1e-12
assert stati[indice_stato_massimo] == max(stati)`,
      hint: `<p>Lo stato finale porta "memoria" di tutta la sequenza, ma diluita: è l'aspetto che rende le RNN semplici deboli su sequenze molto lunghe — il problema che le LSTM risolvono.</p>`,
      solution: `import numpy as np

Wx, Wh, b = 0.6, 0.7, 0.1
sequenza = [1.0, -0.5, 0.8, 0.3, -1.0, 0.6]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

stato_finale = stati[-1]
indice_stato_massimo = int(np.argmax(stati))

print(stati)
print(stato_finale, indice_stato_massimo)`
    },

    {
      type: "exercise", id: "nn-25", kg: 25, title: "Massimale: classificatore audio giocattolo",
      task: `<p>Hai 4 suoni sintetici (frequenza dominante diversa). Scrivi <code>classifica_suono(onda, sr)</code>: calcola la FFT, trova la frequenza dominante, e restituisce <code>"basso"</code> (&lt;10Hz), <code>"medio"</code> (10-25Hz) o <code>"alto"</code> (&gt;25Hz). Applicala a tutti i suoni.</p>`,
      starter: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
suoni = [np.sin(2*np.pi*f*t) for f in [3, 15, 30, 8]]

def classifica_suono(onda, sr):
    spettro = np.fft.fft(onda)
    frequenze = np.fft.fftfreq(len(onda), 1/sr)
    ampiezze = np.abs(spettro)
    meta = len(onda) // 2
    freq_dom = frequenze[:meta][np.argmax(ampiezze[:meta])]
    if freq_dom < 10:
        return "basso"
    if freq_dom <= 25:
        return "medio"
    return "alto"

classificazioni = [classifica_suono(s, sr) for s in suoni]
print(classificazioni)`,
      check: `assert classificazioni == ["basso", "medio", "alto", "basso"]`,
      hint: `<p>Questo è, in miniatura, il primo passo di ogni pipeline di classificazione audio reale: dal segnale grezzo, estrai una feature numerica (qui la frequenza dominante), poi applica una regola o un modello su quella feature.</p>`,
      solution: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
suoni = [np.sin(2*np.pi*f*t) for f in [3, 15, 30, 8]]

def classifica_suono(onda, sr):
    spettro = np.fft.fft(onda)
    frequenze = np.fft.fftfreq(len(onda), 1/sr)
    ampiezze = np.abs(spettro)
    meta = len(onda) // 2
    freq_dom = frequenze[:meta][np.argmax(ampiezze[:meta])]
    if freq_dom < 10:
        return "basso"
    if freq_dom <= 25:
        return "medio"
    return "alto"

classificazioni = [classifica_suono(s, sr) for s in suoni]
print(classificazioni)`
    },

    {
      type: "exercise", id: "nn-26", kg: 25, title: "Massimale: la rete batte la baseline?",
      task: `<p>Sul dataset digits (già splittato): confronta <code>MLPClassifier</code>, <code>LogisticRegression</code> e <code>KNeighborsClassifier</code> (senza scaler: i pixel sono già tutti sulla stessa scala 0-16). Trova <code>campione</code> (il migliore) e <code>margine</code> (differenza dal peggiore).</p>`,
      setup: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
d = load_digits()
X_train, X_test, y_train, y_test = train_test_split(d.data, d.target, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {
    "rete": MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0).fit(X_train, y_train).score(X_test, y_test),
    "logistic": LogisticRegression(max_iter=5000).fit(X_train, y_train).score(X_test, y_test),
    "knn": KNeighborsClassifier().fit(X_train, y_train).score(X_test, y_test),
}

campione = max(risultati, key=risultati.get)
margine = max(risultati.values()) - min(risultati.values())

print(risultati)
print(campione, round(margine, 3))`,
      check: `assert all(v > 0.85 for v in risultati.values()), "Su digits tutti e tre i modelli devono andare bene: e' un dataset pulito e piccolo"
assert campione in risultati`,
      hint: `<p>Su un dataset piccolo, pulito e a bassa dimensionalità come digits (64 feature), spesso i modelli "semplici" (KNN, logistic) tengono testa a una rete neurale: la potenza extra delle reti si vede soprattutto su problemi più complessi e con più dati.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier

risultati = {
    "rete": MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0).fit(X_train, y_train).score(X_test, y_test),
    "logistic": LogisticRegression(max_iter=5000).fit(X_train, y_train).score(X_test, y_test),
    "knn": KNeighborsClassifier().fit(X_train, y_train).score(X_test, y_test),
}

campione = max(risultati, key=risultati.get)
margine = max(risultati.values()) - min(risultati.values())

print(risultati)
print(campione, round(margine, 3))`
    },

    {
      type: "exercise", id: "nn-27", kg: 10, title: "Drill: il perceptron della porta OR",
      task: `<p>Con pesi <code>w = [1.0, 1.0]</code> e bias <code>b = -0.5</code>: calcola l'output (soglia a 0) per tutte e 4 le combinazioni di <code>X</code>.</p>`,
      starter: `import numpy as np

X = np.array([[0,0],[0,1],[1,0],[1,1]])
w = np.array([1.0, 1.0])
b = -0.5

def step(x):
    return (x >= 0).astype(int)

z = X @ w + b
output = step(z)

print(z)
print(output)`,
      check: `assert list(output) == [0, 1, 1, 1], "E' la tabella di verita' di OR: basta un solo input attivo"`,
      hint: `<p>Con (0,0): <code>z = -0.5 &lt; 0</code> → 0. Con qualsiasi altro input, almeno un termine vale 1, portando <code>z</code> a 0.5 o 1.5, sempre ≥ 0.</p>`,
      solution: `import numpy as np

X = np.array([[0,0],[0,1],[1,0],[1,1]])
w = np.array([1.0, 1.0])
b = -0.5

def step(x):
    return (x >= 0).astype(int)

z = X @ w + b
output = step(z)

print(z)
print(output)`
    },

    {
      type: "exercise", id: "nn-28", kg: 10, title: "Drill: attivazioni su altri valori",
      task: `<p>Applica <code>sigmoid</code>, <code>relu</code> e <code>tanh</code> a <code>x = [-1.0, -0.25, 0.25, 1.0, 3.0]</code>.</p>`,
      starter: `import numpy as np

x = np.array([-1.0, -0.25, 0.25, 1.0, 3.0])

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

s = sigmoid(x)
r = relu(x)
t = np.tanh(x)

print(s.round(3))
print(r)
print(t.round(3))`,
      check: `import numpy as np
assert np.allclose(s, [0.269, 0.438, 0.562, 0.731, 0.953], atol=1e-3)
assert list(r) == [0.0, 0.0, 0.25, 1.0, 3.0]
assert np.allclose(t, [-0.762, -0.245, 0.245, 0.762, 0.995], atol=1e-3)`,
      hint: `<p><code>relu</code> azzera solo i valori negativi (-1.0 e -0.25): il resto passa invariato.</p>`,
      solution: `import numpy as np

x = np.array([-1.0, -0.25, 0.25, 1.0, 3.0])

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

s = sigmoid(x)
r = relu(x)
t = np.tanh(x)

print(s.round(3))
print(r)
print(t.round(3))`
    },

    {
      type: "exercise", id: "nn-29", kg: 20, title: "Ispeziona i singoli neuroni nascosti di XOR",
      task: `<p>Con la stessa rete XOR (pesi già forniti): verifica che il PRIMO neurone nascosto calcoli OR (<code>h[:,0]</code>) e il SECONDO calcoli NAND (<code>h[:,1]</code>), separatamente dall'output finale.</p>`,
      starter: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

X = np.array([[0,0],[0,1],[1,0],[1,1]])
W1 = np.array([[20.0, -20.0], [20.0, -20.0]])
b1 = np.array([-10.0, 30.0])

h = sigmoid(X @ W1 + b1)
neurone_or = h[:, 0].round().astype(int)
neurone_nand = h[:, 1].round().astype(int)

print(neurone_or)
print(neurone_nand)`,
      check: `assert list(neurone_or) == [0, 1, 1, 1], "Il primo neurone nascosto calcola OR"
assert list(neurone_nand) == [1, 1, 1, 0], "Il secondo neurone nascosto calcola NAND"`,
      hint: `<p>Ogni colonna di <code>W1</code> definisce un neurone nascosto indipendente: puoi ispezionarli separatamente prima ancora di combinarli nel layer di output.</p>`,
      solution: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

X = np.array([[0,0],[0,1],[1,0],[1,1]])
W1 = np.array([[20.0, -20.0], [20.0, -20.0]])
b1 = np.array([-10.0, 30.0])

h = sigmoid(X @ W1 + b1)
neurone_or = h[:, 0].round().astype(int)
neurone_nand = h[:, 1].round().astype(int)

print(neurone_or)
print(neurone_nand)`
    },

    {
      type: "exercise", id: "nn-30", kg: 15, title: "Drill: le due loss su un altro caso",
      task: `<p>Con <code>y_true</code> e <code>y_pred</code>: calcola <code>mse</code> e <code>bce</code>.</p>`,
      starter: `import numpy as np

y_true = np.array([0, 1, 0, 1])
y_pred = np.array([0.1, 0.7, 0.3, 0.9])

mse = np.mean((y_true - y_pred) ** 2)
bce = -np.mean(y_true*np.log(y_pred) + (1-y_true)*np.log(1-y_pred))

print(mse)
print(bce)`,
      check: `assert abs(mse - 0.05) < 1e-6
assert abs(bce - 0.2310177297982794) < 1e-6`,
      hint: `<p>Stessa formula di sempre, applicata vettorizzata su tutto l'array in un colpo.</p>`,
      solution: `import numpy as np

y_true = np.array([0, 1, 0, 1])
y_pred = np.array([0.1, 0.7, 0.3, 0.9])

mse = np.mean((y_true - y_pred) ** 2)
bce = -np.mean(y_true*np.log(y_pred) + (1-y_true)*np.log(1-y_pred))

print(mse)
print(bce)`
    },

    {
      type: "exercise", id: "nn-31", kg: 15, title: "Drill: discesa del gradiente su un altro minimo",
      task: `<p>Minimizza <code>f(x) = (x-5)^2</code> partendo da <code>x=10.0</code>, con <code>lr=0.15</code>, per 15 passi.</p>`,
      starter: `x = 10.0
lr = 0.15

for _ in range(15):
    grad = 2 * (x - 5)
    x = x - lr * grad

x_finale = x
print(x_finale)`,
      check: `assert abs(x_finale - 5) < 0.1`,
      hint: `<p>Stesso meccanismo dell'esercizio base: ogni passo riduce la distanza dal minimo vero, che qui è 5.</p>`,
      solution: `x = 10.0
lr = 0.15

for _ in range(15):
    grad = 2 * (x - 5)
    x = x - lr * grad

x_finale = x
print(x_finale)`
    },

    {
      type: "exercise", id: "nn-32", kg: 20, title: "Drill: verifica un secondo gradiente",
      task: `<p>Su <code>f(x) = 3*x^2 - 2*x</code> in <code>x0=1.5</code>: calcola <code>grad_numerico</code> e <code>grad_vero</code> (<code>6*x0 - 2</code>).</p>`,
      starter: `def f(x):
    return 3*x**2 - 2*x

x0 = 1.5
eps = 1e-5

grad_numerico = (f(x0 + eps) - f(x0 - eps)) / (2 * eps)
grad_vero = 6 * x0 - 2

print(grad_numerico, grad_vero)`,
      check: `assert abs(grad_numerico - grad_vero) < 1e-4`,
      hint: `<p>La derivata di <code>3x^2 - 2x</code> è <code>6x - 2</code>: il gradiente numerico deve avvicinarcisi moltissimo.</p>`,
      solution: `def f(x):
    return 3*x**2 - 2*x

x0 = 1.5
eps = 1e-5

grad_numerico = (f(x0 + eps) - f(x0 - eps)) / (2 * eps)
grad_vero = 6 * x0 - 2

print(grad_numerico, grad_vero)`
    },

    {
      type: "exercise", id: "nn-33", kg: 20, title: "Drill: rete su cerchi concentrici",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (dataset a cerchi concentrici, non linearmente separabile): addestra <code>MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)</code>.</p>`,
      setup: `from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
X, y = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
# X_train, X_test, y_train, y_test: gia' pronti

rete = MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.85, "Su cerchi concentrici (confine circolare), una rete con un layer nascosto deve riuscire a separare bene le classi"`,
      hint: `<p>Nessuna retta può separare un cerchio interno da uno esterno: la rete deve imparare un confine curvo, esattamente come farebbe una SVM con kernel RBF.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier

rete = MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "nn-34", kg: 20, title: "Drill: rete per una parabola rumorosa",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (una parabola rumorosa): addestra <code>MLPRegressor(hidden_layer_sizes=(20,20), max_iter=5000, random_state=0)</code>.</p>`,
      setup: `import numpy as np
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(1)
Xr = rng.uniform(-3, 3, size=(100,1))
yr = (Xr**2).ravel() + rng.normal(0, 0.3, size=100)
X_train, X_test, y_train, y_test = train_test_split(Xr, yr, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPRegressor
# X_train, X_test, y_train, y_test: gia' pronti (parabola rumorosa)

modello = MLPRegressor(hidden_layer_sizes=(20, 20), max_iter=5000, random_state=0)
modello.fit(X_train, y_train)
r2 = modello.score(X_test, y_test)

print(r2)`,
      check: `assert r2 > 0.8`,
      hint: `<p>Una parabola non è una retta: due layer nascosti danno alla rete abbastanza flessibilità per seguirne la curvatura.</p>`,
      solution: `from sklearn.neural_network import MLPRegressor

modello = MLPRegressor(hidden_layer_sizes=(20, 20), max_iter=5000, random_state=0)
modello.fit(X_train, y_train)
r2 = modello.score(X_test, y_test)

print(r2)`
    },

    {
      type: "exercise", id: "nn-35", kg: 25, title: "Drill: overfitting con più o meno regolarizzazione",
      task: `<p>Sullo stesso dataset piccolo e rumoroso: confronta <code>alpha=1e-7</code> (pochissima regolarizzazione) e <code>alpha=1.0</code> (molta), stessa architettura <code>(200,200)</code>. Calcola <code>gap_debole</code> e <code>gap_forte</code>.</p>`,
      setup: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
X, y = make_moons(n_samples=60, noise=0.4, random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=1)`,
      starter: `from sklearn.neural_network import MLPClassifier
# X_train, X_test, y_train, y_test: gia' pronti

debole = MLPClassifier(hidden_layer_sizes=(200,200), max_iter=5000, alpha=1e-7, random_state=0)
debole.fit(X_train, y_train)
gap_debole = debole.score(X_train, y_train) - debole.score(X_test, y_test)

forte = MLPClassifier(hidden_layer_sizes=(200,200), max_iter=5000, alpha=1.0, random_state=0)
forte.fit(X_train, y_train)
gap_forte = forte.score(X_train, y_train) - forte.score(X_test, y_test)

print(gap_debole, gap_forte)`,
      check: `assert gap_forte < gap_debole, "Con piu' regolarizzazione (alpha piu' alto), il divario train-test deve ridursi"`,
      hint: `<p><code>alpha</code> alto penalizza i pesi grandi, come Ridge nella regressione lineare: la rete non può più "memorizzare" il rumore con la stessa libertà.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier

debole = MLPClassifier(hidden_layer_sizes=(200,200), max_iter=5000, alpha=1e-7, random_state=0)
debole.fit(X_train, y_train)
gap_debole = debole.score(X_train, y_train) - debole.score(X_test, y_test)

forte = MLPClassifier(hidden_layer_sizes=(200,200), max_iter=5000, alpha=1.0, random_state=0)
forte.fit(X_train, y_train)
gap_forte = forte.score(X_train, y_train) - forte.score(X_test, y_test)

print(gap_debole, gap_forte)`
    },

    {
      type: "exercise", id: "nn-36", kg: 15, title: "Drill: un'altra cifra vera",
      task: `<p>Su <code>dati</code> (già caricato): <code>settima_immagine</code> (indice 7, 8×8), <code>settima_etichetta</code>.</p>`,
      setup: `from sklearn.datasets import load_digits
dati = load_digits()`,
      starter: `# dati e' gia' caricato
settima_immagine = dati.images[7]
settima_etichetta = dati.target[7]

print(settima_immagine)
print(settima_etichetta)`,
      check: `assert settima_immagine.shape == (8, 8)
assert settima_etichetta == 7`,
      hint: `<p>Nel dataset digits, le prime 10 immagini sono nell'ordine 0,1,2,...,9: la settima (indice 7) è la cifra "7".</p>`,
      solution: `settima_immagine = dati.images[7]
settima_etichetta = dati.target[7]

print(settima_immagine)
print(settima_etichetta)`
    },

    {
      type: "exercise", id: "nn-37", kg: 20, title: "Drill: un solo layer più grande",
      task: `<p>Su <code>X_train, X_test, y_train, y_test</code> (cifre): addestra <code>MLPClassifier(hidden_layer_sizes=(64,), max_iter=1000, random_state=0)</code>.</p>`,
      setup: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
d = load_digits()
X_train, X_test, y_train, y_test = train_test_split(d.data, d.target, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
# X_train, X_test, y_train, y_test: gia' pronti

rete = MLPClassifier(hidden_layer_sizes=(64,), max_iter=1000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`,
      check: `assert acc > 0.9`,
      hint: `<p>Un layer nascosto più grande (64 invece di 32) ha più capacità: su un compito facile come digits, il miglioramento è comunque marginale.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier

rete = MLPClassifier(hidden_layer_sizes=(64,), max_iter=1000, random_state=0)
rete.fit(X_train, y_train)
acc = rete.score(X_test, y_test)

print(acc)`
    },

    {
      type: "exercise", id: "nn-38", kg: 20, title: "Drill: rilevatore di bordi orizzontali",
      task: `<p>Con un kernel per bordi ORIZZONTALI (<code>[[1,1,1],[0,0,0],[-1,-1,-1]]</code>): applicalo a <code>img</code> (metà chiara sopra, metà scura sotto).</p>`,
      starter: `import numpy as np

img = np.array([
    [10,10,10,10,10,10],
    [10,10,10,10,10,10],
    [10,10,10,10,10,10],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
], dtype=float)

kernel_h = np.array([[1,1,1],[0,0,0],[-1,-1,-1]], dtype=float)

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

edges = conv2d(img, kernel_h)
print(edges)`,
      check: `import numpy as np
assert edges.shape == (4, 4)
assert np.allclose(edges[1, :], 30.0), "La riga dove passa il bordo orizzontale deve avere risposta forte (30)"
assert np.allclose(edges[0, :], 0.0), "Lontano dal bordo, la risposta deve essere zero"`,
      hint: `<p>Questo kernel è ruotato di 90° rispetto a quello per bordi verticali: risponde forte dove l'immagine passa da chiaro (sopra) a scuro (sotto), non da sinistra a destra.</p>`,
      solution: `import numpy as np

img = np.array([
    [10,10,10,10,10,10],
    [10,10,10,10,10,10],
    [10,10,10,10,10,10],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
], dtype=float)

kernel_h = np.array([[1,1,1],[0,0,0],[-1,-1,-1]], dtype=float)

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

edges = conv2d(img, kernel_h)
print(edges)`
    },

    {
      type: "exercise", id: "nn-39", kg: 20, title: "Drill: convoluzione su un'altra cifra",
      task: `<p>Applica <code>conv2d</code> (fornita) con il kernel edge-detector verticale su <code>immagine</code> (la cifra a indice 7).</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_digits
immagine = load_digits().images[7]

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out`,
      starter: `import numpy as np
# immagine, conv2d: gia' pronti

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)
risposta = conv2d(immagine, kernel)

posizione_bordo_piu_forte = np.unravel_index(np.argmax(np.abs(risposta)), risposta.shape)

print(risposta.round(1))
print(posizione_bordo_piu_forte)`,
      check: `assert risposta.shape == (6, 6)
assert len(posizione_bordo_piu_forte) == 2`,
      hint: `<p>Stesso identico procedimento visto sulla prima cifra, applicato qui a un'immagine diversa: il codice non cambia, solo il dato in ingresso.</p>`,
      solution: `kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)
risposta = conv2d(immagine, kernel)

posizione_bordo_piu_forte = np.unravel_index(np.argmax(np.abs(risposta)), risposta.shape)

print(risposta.round(1))
print(posizione_bordo_piu_forte)`
    },

    {
      type: "exercise", id: "nn-40", kg: 20, title: "Drill: max pooling su un'altra matrice",
      task: `<p>Applica <code>max_pool</code> (fornita) a <code>m</code> (4×4) con <code>size=2</code>.</p>`,
      starter: `import numpy as np

m = np.array([
    [2,1,0,3],
    [4,9,2,1],
    [3,3,8,7],
    [0,1,6,5],
], dtype=float)

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out

pooled = max_pool(m, 2)
print(pooled)`,
      check: `import numpy as np
assert pooled.shape == (2, 2)
assert np.array_equal(pooled, [[9.0, 3.0], [3.0, 8.0]])`,
      hint: `<p>Il blocco in alto a sinistra è <code>[[2,1],[4,9]]</code>: il massimo è 9. Quello in basso a destra è <code>[[8,7],[6,5]]</code>: il massimo è 8.</p>`,
      solution: `import numpy as np

m = np.array([
    [2,1,0,3],
    [4,9,2,1],
    [3,3,8,7],
    [0,1,6,5],
], dtype=float)

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out

pooled = max_pool(m, 2)
print(pooled)`
    },

    {
      type: "exercise", id: "nn-41", kg: 20, title: "Drill: un'altra cella RNN",
      task: `<p>Con <code>Wx=0.4</code>, <code>Wh=0.6</code>, <code>b=0.1</code>: fai scorrere <code>sequenza = [0.5, -1.0, 0.3, 0.7]</code> attraverso la cella RNN.</p>`,
      starter: `import numpy as np

Wx, Wh, b = 0.4, 0.6, 0.1
sequenza = [0.5, -1.0, 0.3, 0.7]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

print(stati)`,
      check: `import numpy as np
assert len(stati) == 4
assert abs(stati[0] - np.tanh(0.4*0.5 + 0.1)) < 1e-9
assert abs(stati[1] - np.tanh(0.4*(-1.0) + 0.6*stati[0] + 0.1)) < 1e-9`,
      hint: `<p>Al primo passo <code>h</code> parte da 0: <code>Wh*h</code> non contribuisce ancora. Dal secondo passo, lo stato precedente entra nella formula.</p>`,
      solution: `import numpy as np

Wx, Wh, b = 0.4, 0.6, 0.1
sequenza = [0.5, -1.0, 0.3, 0.7]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

print(stati)`
    },

    {
      type: "exercise", id: "nn-42", kg: 25, title: "Drill: un altro passo di LSTM",
      task: `<p>Con i pesi forniti e stato precedente <code>h_prev=-0.3</code>, <code>c_prev=0.4</code>, input <code>x_t=0.5</code>: calcola tutti e 4 i gate e <code>h_t</code>.</p>`,
      starter: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

x_t, h_prev, c_prev = 0.5, -0.3, 0.4
Wf, bf = 0.5, 0.2
Wi, bi = 0.4, 0.1
Wc, bc = 0.3, 0.0
Wo, bo = 0.6, 0.0

f_t = sigmoid(Wf*(x_t + h_prev) + bf)
i_t = sigmoid(Wi*(x_t + h_prev) + bi)
c_tilde = np.tanh(Wc*(x_t + h_prev) + bc)
c_t = f_t*c_prev + i_t*c_tilde
o_t = sigmoid(Wo*(x_t + h_prev) + bo)
h_t = o_t * np.tanh(c_t)

print(f_t, i_t, c_tilde, c_t, o_t, h_t)`,
      check: `import numpy as np
assert abs(f_t - 0.574442516811659) < 1e-9
assert abs(c_t - 0.26243056539767257) < 1e-9
assert abs(h_t - 0.13597155916879097) < 1e-9`,
      hint: `<p>Stessa sequenza di calcoli dell'esercizio base, con pesi e stato iniziale diversi: segui la formula riga per riga.</p>`,
      solution: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

x_t, h_prev, c_prev = 0.5, -0.3, 0.4
Wf, bf = 0.5, 0.2
Wi, bi = 0.4, 0.1
Wc, bc = 0.3, 0.0
Wo, bo = 0.6, 0.0

f_t = sigmoid(Wf*(x_t + h_prev) + bf)
i_t = sigmoid(Wi*(x_t + h_prev) + bi)
c_tilde = np.tanh(Wc*(x_t + h_prev) + bc)
c_t = f_t*c_prev + i_t*c_tilde
o_t = sigmoid(Wo*(x_t + h_prev) + bo)
h_t = o_t * np.tanh(c_t)

print(f_t, i_t, c_tilde, c_t, o_t, h_t)`
    },

    {
      type: "exercise", id: "nn-43", kg: 15, title: "Drill: un tono a frequenza diversa",
      task: `<p>Genera <code>onda</code>: un tono sinusoidale a 10 Hz, campionato a 200 Hz, per 1 secondo. Calcola <code>n_campioni</code> e <code>valore_massimo</code>.</p>`,
      starter: `import numpy as np

sr = 200
t = np.arange(0, 1, 1/sr)
freq = 10

onda = np.sin(2 * np.pi * freq * t)
n_campioni = len(onda)
valore_massimo = onda.max()

print(n_campioni, round(valore_massimo, 3))`,
      check: `assert n_campioni == 200
assert abs(valore_massimo - 1.0) < 1e-6`,
      hint: `<p>Con <code>sr=200</code> e 1 secondo, hai 200 campioni: il seno oscilla sempre tra -1 e 1, qualunque sia la frequenza.</p>`,
      solution: `import numpy as np

sr = 200
t = np.arange(0, 1, 1/sr)
freq = 10

onda = np.sin(2 * np.pi * freq * t)
n_campioni = len(onda)
valore_massimo = onda.max()

print(n_campioni, round(valore_massimo, 3))`
    },

    {
      type: "exercise", id: "nn-44", kg: 20, title: "Drill: trova un'altra frequenza nascosta",
      task: `<p>Su <code>onda</code> (tono puro a 12 Hz, sample rate 100 Hz): trova <code>frequenza_dominante</code> con la FFT.</p>`,
      setup: `import numpy as np
sr = 100
t = np.arange(0, 1, 1/sr)
onda = np.sin(2*np.pi*12*t)`,
      starter: `import numpy as np
# onda, sr: gia' pronti

spettro = np.fft.fft(onda)
frequenze = np.fft.fftfreq(len(onda), 1/sr)
ampiezze = np.abs(spettro)

meta = len(onda) // 2
frequenza_dominante = frequenze[:meta][np.argmax(ampiezze[:meta])]

print(frequenza_dominante)`,
      check: `assert abs(frequenza_dominante - 12.0) < 1e-9`,
      hint: `<p>Stesso identico procedimento: la FFT ritrova esattamente la frequenza usata per generare il tono, qualunque essa sia.</p>`,
      solution: `spettro = np.fft.fft(onda)
frequenze = np.fft.fftfreq(len(onda), 1/sr)
ampiezze = np.abs(spettro)

meta = len(onda) // 2
frequenza_dominante = frequenze[:meta][np.argmax(ampiezze[:meta])]

print(frequenza_dominante)`
    },

    {
      type: "exercise", id: "nn-45", kg: 25, title: "Drill: separa tre note sovrapposte",
      task: `<p><code>accordo</code> contiene tre frequenze sovrapposte (5, 15 e 35 Hz, ampiezze decrescenti). Trova <code>top3_frequenze</code>, ordinate crescenti.</p>`,
      setup: `import numpy as np
sr = 100
t = np.arange(0, 1, 1/sr)
accordo = np.sin(2*np.pi*5*t) + 0.6*np.sin(2*np.pi*15*t) + 0.3*np.sin(2*np.pi*35*t)`,
      starter: `import numpy as np
# accordo, sr: gia' pronti

spettro = np.fft.fft(accordo)
frequenze = np.fft.fftfreq(len(accordo), 1/sr)
ampiezze = np.abs(spettro)

meta = len(accordo) // 2
freq_meta = frequenze[:meta]
amp_meta = ampiezze[:meta]

top3_idx = np.argsort(amp_meta)[::-1][:3]
top3_frequenze = sorted(freq_meta[top3_idx])

print(top3_frequenze)`,
      check: `import numpy as np
assert np.allclose(sorted(top3_frequenze), [5.0, 15.0, 35.0])`,
      hint: `<p>Anche con tre componenti di ampiezza molto diversa, la FFT le separa nettamente da tutte le altre frequenze quasi-zero.</p>`,
      solution: `spettro = np.fft.fft(accordo)
frequenze = np.fft.fftfreq(len(accordo), 1/sr)
ampiezze = np.abs(spettro)

meta = len(accordo) // 2
freq_meta = frequenze[:meta]
amp_meta = ampiezze[:meta]

top3_idx = np.argsort(amp_meta)[::-1][:3]
top3_frequenze = sorted(freq_meta[top3_idx])

print(top3_frequenze)`
    },

    {
      type: "exercise", id: "nn-46", kg: 20, title: "Drill: parametri di una rete più grande",
      task: `<p>Con <code>parametri_dense</code> (stessa firma vista prima): calcola i parametri totali di una rete <code>128 → 64 → 10</code>.</p>`,
      starter: `def parametri_dense(input_units, output_units):
    return input_units * output_units + output_units

layer1 = parametri_dense(128, 64)
layer2 = parametri_dense(64, 10)
totale = layer1 + layer2

print(layer1, layer2, totale)`,
      check: `assert layer1 == 8256
assert layer2 == 650
assert totale == 8906`,
      hint: `<p>128*64=8192 pesi + 64 bias = 8256 per il primo layer.</p>`,
      solution: `def parametri_dense(input_units, output_units):
    return input_units * output_units + output_units

layer1 = parametri_dense(128, 64)
layer2 = parametri_dense(64, 10)
totale = layer1 + layer2

print(layer1, layer2, totale)`
    },

    {
      type: "exercise", id: "nn-47", kg: 20, title: "Drill: forma dell'output con stride 2",
      task: `<p>Con <code>shape_conv</code> (stessa firma vista prima): calcola l'output per un'immagine 32×32, kernel 5, con <code>stride=2, padding=0</code> e con <code>stride=1, padding=2</code> ("same").</p>`,
      starter: `def shape_conv(dimensione, kernel, stride, padding):
    return (dimensione - kernel + 2*padding) // stride + 1

senza_padding = shape_conv(32, 5, 2, 0)
con_padding = shape_conv(32, 5, 1, 2)

print(senza_padding, con_padding)`,
      check: `assert senza_padding == 14
assert con_padding == 32`,
      hint: `<p>Con kernel 5×5, il padding "same" corretto è 2 (metà del kernel arrotondata per difetto): ecco perché <code>con_padding</code> ritorna esattamente 32.</p>`,
      solution: `def shape_conv(dimensione, kernel, stride, padding):
    return (dimensione - kernel + 2*padding) // stride + 1

senza_padding = shape_conv(32, 5, 2, 0)
con_padding = shape_conv(32, 5, 1, 2)

print(senza_padding, con_padding)`
    },

    {
      type: "exercise", id: "nn-48", kg: 25, title: "Drill: parametri di due layer convoluzionali più grandi",
      task: `<p>Con <code>parametri_conv</code> (stessa firma vista prima): calcola i parametri di due layer in sequenza: primo <code>5x5, 3→16</code> canali, secondo <code>3x3, 16→32</code> canali.</p>`,
      starter: `def parametri_conv(kh, kw, canali_in, canali_out):
    return (kh*kw*canali_in + 1) * canali_out

conv1 = parametri_conv(5, 5, 3, 16)
conv2 = parametri_conv(3, 3, 16, 32)
totale_conv = conv1 + conv2

print(conv1, conv2, totale_conv)`,
      check: `assert conv1 == 1216
assert conv2 == 4640
assert totale_conv == 5856`,
      hint: `<p>(5×5×3 + 1) × 16 = 76 × 16 = 1216 per il primo layer, che parte da 3 canali (come un'immagine a colori RGB).</p>`,
      solution: `def parametri_conv(kh, kw, canali_in, canali_out):
    return (kh*kw*canali_in + 1) * canali_out

conv1 = parametri_conv(5, 5, 3, 16)
conv2 = parametri_conv(3, 3, 16, 32)
totale_conv = conv1 + conv2

print(conv1, conv2, totale_conv)`
    },

    {
      type: "exercise", id: "nn-49", kg: 25, title: "Combo: conv + pool su un'altra cifra",
      task: `<p>Su <code>immagine</code> (indice 7): applica <code>conv2d</code> col kernel edge-detector, poi <code>max_pool</code> con <code>size=2</code>. Verifica che il massimo sopravviva alla compressione.</p>`,
      setup: `import numpy as np
from sklearn.datasets import load_digits
immagine = load_digits().images[7]

def conv2d(img, kernel):
    kh, kw = kernel.shape
    h, w = img.shape
    out = np.zeros((h-kh+1, w-kw+1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = np.sum(img[i:i+kh, j:j+kw] * kernel)
    return out

def max_pool(mat, size):
    h, w = mat.shape
    out = np.zeros((h//size, w//size))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i,j] = mat[i*size:(i+1)*size, j*size:(j+1)*size].max()
    return out`,
      starter: `import numpy as np
# immagine, conv2d, max_pool: gia' pronti

kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

feature_map = conv2d(immagine, kernel)
compressa = max_pool(feature_map, 2)

print(feature_map.shape, compressa.shape)
print(compressa.round(1))`,
      check: `assert feature_map.shape == (6, 6)
assert compressa.shape == (3, 3)
assert compressa.max() >= feature_map.max() - 1e-9`,
      hint: `<p>Il max pooling non perde mai il valore più alto di ogni blocco 2×2, solo la sua posizione esatta all'interno del blocco.</p>`,
      solution: `kernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)

feature_map = conv2d(immagine, kernel)
compressa = max_pool(feature_map, 2)

print(feature_map.shape, compressa.shape)
print(compressa.round(1))`
    },

    {
      type: "exercise", id: "nn-50", kg: 25, title: "Combo: RNN su una sequenza di 8 valori",
      task: `<p>Estendi la cella RNN a una sequenza di 8 valori. Trova <code>stato_finale</code> e <code>indice_stato_minimo</code> (a quale passo lo stato è stato più basso).</p>`,
      starter: `import numpy as np

Wx, Wh, b = 0.5, 0.6, 0.0
sequenza = [1.0, -0.8, 0.5, -0.3, 0.9, -1.0, 0.2, 0.4]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

stato_finale = stati[-1]
indice_stato_minimo = int(np.argmin(stati))

print(stati)
print(stato_finale, indice_stato_minimo)`,
      check: `import numpy as np
assert len(stati) == 8
assert abs(stato_finale - stati[-1]) < 1e-12
assert stati[indice_stato_minimo] == min(stati)`,
      hint: `<p>Stesso schema della sequenza da 6 valori, solo più lunga: ogni stato dipende sempre da input corrente e stato precedente.</p>`,
      solution: `import numpy as np

Wx, Wh, b = 0.5, 0.6, 0.0
sequenza = [1.0, -0.8, 0.5, -0.3, 0.9, -1.0, 0.2, 0.4]

h = 0.0
stati = []
for x in sequenza:
    h = np.tanh(Wx*x + Wh*h + b)
    stati.append(h)

stato_finale = stati[-1]
indice_stato_minimo = int(np.argmin(stati))

print(stati)
print(stato_finale, indice_stato_minimo)`
    },

    {
      type: "exercise", id: "nn-51", kg: 25, title: "Massimale: classificatore audio, seconda ondata",
      task: `<p>Con <code>classifica_suono</code> (stessa firma vista prima): applica a 4 nuovi suoni con frequenze diverse.</p>`,
      starter: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
suoni = [np.sin(2*np.pi*f*t) for f in [4, 18, 40, 22]]

def classifica_suono(onda, sr):
    spettro = np.fft.fft(onda)
    frequenze = np.fft.fftfreq(len(onda), 1/sr)
    ampiezze = np.abs(spettro)
    meta = len(onda) // 2
    freq_dom = frequenze[:meta][np.argmax(ampiezze[:meta])]
    if freq_dom < 10:
        return "basso"
    if freq_dom <= 25:
        return "medio"
    return "alto"

classificazioni = [classifica_suono(s, sr) for s in suoni]
print(classificazioni)`,
      check: `assert classificazioni == ["basso", "medio", "alto", "medio"]`,
      hint: `<p>4 Hz è sotto 10 (basso), 18 e 22 Hz sono nel range medio (10-25), 40 Hz supera 25 (alto).</p>`,
      solution: `import numpy as np

sr = 100
t = np.arange(0, 1, 1/sr)
suoni = [np.sin(2*np.pi*f*t) for f in [4, 18, 40, 22]]

def classifica_suono(onda, sr):
    spettro = np.fft.fft(onda)
    frequenze = np.fft.fftfreq(len(onda), 1/sr)
    ampiezze = np.abs(spettro)
    meta = len(onda) // 2
    freq_dom = frequenze[:meta][np.argmax(ampiezze[:meta])]
    if freq_dom < 10:
        return "basso"
    if freq_dom <= 25:
        return "medio"
    return "alto"

classificazioni = [classifica_suono(s, sr) for s in suoni]
print(classificazioni)`
    },

    {
      type: "exercise", id: "nn-52", kg: 25, title: "Massimale finale: rete vs baseline sui cerchi",
      task: `<p>Sul dataset a cerchi concentrici (già splittato): confronta <code>MLPClassifier</code>, <code>LogisticRegression</code> e <code>SVC</code> (kernel rbf). Trova <code>campione</code> e <code>margine</code>.</p>`,
      setup: `from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
X, y = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)`,
      starter: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
# X_train, X_test, y_train, y_test: gia' pronti

risultati = {
    "rete": MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0).fit(X_train, y_train).score(X_test, y_test),
    "logistic": LogisticRegression().fit(X_train, y_train).score(X_test, y_test),
    "svm": SVC(kernel="rbf").fit(X_train, y_train).score(X_test, y_test),
}

campione = max(risultati, key=risultati.get)
margine = max(risultati.values()) - min(risultati.values())

print(risultati)
print(campione, round(margine, 3))`,
      check: `assert risultati["rete"] > 0.85
assert risultati["svm"] > 0.85
assert risultati["logistic"] < risultati["rete"], "Su un confine circolare, la logistic regression (lineare) deve fare peggio di rete e SVM (entrambe capaci di confini curvi)"
assert campione in risultati`,
      hint: `<p>La logistic regression traccia solo confini lineari: su un problema a cerchi concentrici, nessuna retta può separare bene le due classi, a differenza di rete neurale e SVM con kernel curvo.</p>`,
      solution: `from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

risultati = {
    "rete": MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0).fit(X_train, y_train).score(X_test, y_test),
    "logistic": LogisticRegression().fit(X_train, y_train).score(X_test, y_test),
    "svm": SVC(kernel="rbf").fit(X_train, y_train).score(X_test, y_test),
}

campione = max(risultati, key=risultati.get)
margine = max(risultati.values()) - min(risultati.values())

print(risultati)
print(campione, round(margine, 3))`
    }
  ]
});
