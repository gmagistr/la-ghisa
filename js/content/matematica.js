window.MODULES.push({
  id: "matematica",
  name: "Matematica per il ML",
  tagline: "La sala dei fondamenti: derivate, gradiente, autovalori, SVD, PCA a mano. La matematica che fa girare tutto, con NumPy.",
  intro: "Sotto ogni modello c'è matematica: derivate per la discesa del gradiente, autovalori per la PCA, SVD per compressione e raccomandazione. Qui la costruisci a mano con NumPy, per capire cosa succede davvero dentro gli algoritmi. Serve NumPy: il primo caricamento pesa un po'.",
  packages: ["numpy"],
  items: [

    { type: "theory", title: "La derivata: pendenza e velocità di cambiamento", html: `
<p>La <strong>derivata</strong> di una funzione in un punto è la sua pendenza lì: quanto velocemente cambia l'output al variare dell'input. È il concetto che permette l'ottimizzazione — sapere in che direzione muoversi per minimizzare una perdita.</p>
<p>Numericamente si approssima con la definizione di limite (differenze finite):</p>
<pre><code>import numpy as np
def derivata(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)   # differenza centrata

derivata(lambda x: x**2, 3)   # ~6 (la derivata di x^2 e' 2x, in 3 vale 6)</code></pre>
<p>La <strong>differenza centrata</strong> (usa x+h e x-h) è più accurata di quella in avanti (solo x+h). Dove la derivata è zero, la funzione ha un punto stazionario: minimo, massimo o sella — è lì che l'ottimizzazione cerca di arrivare.</p>
`, more: `
<p>La differenza centrata è più accurata per una ragione precisa: sviluppando in serie di Taylor, l'errore della differenza in avanti (f(x+h)-f(x))/h è dell'ordine di h (lineare), mentre quello della centrata (f(x+h)-f(x-h))/(2h) è dell'ordine di h² (quadratico) — gli errori del primo ordine si cancellano per simmetria. In pratica: con h piccolo la centrata è molto più precisa a parità di costo. Ma h non può essere troppo piccolo: sotto ~1e-8 gli errori di arrotondamento in virgola mobile (sottrarre due numeri quasi uguali) dominano e la stima peggiora. C'è un h ottimale intermedio, tipicamente attorno a 1e-6.</p>
<p>Perché la derivata è il cuore del machine learning: addestrare un modello significa MINIMIZZARE una funzione di perdita rispetto ai parametri. La derivata dice in che direzione la perdita cresce; muoversi nella direzione OPPOSTA la riduce. Tutta la discesa del gradiente (prossima lavagna) è questo, esteso a milioni di parametri. Nelle reti neurali le derivate non si calcolano numericamente (troppo lento e impreciso su milioni di parametri) ma analiticamente con la <strong>backpropagation</strong> (regola della catena applicata all'indietro nel grafo di calcolo) — la differenziazione automatica di PyTorch/TensorFlow. La versione numerica che pratichi qui serve per CAPIRE e per verificare (gradient checking).</p>
<p>Punti stazionari (derivata zero) e la loro natura: la derivata prima nulla identifica minimi, massimi e selle indistintamente; è la derivata SECONDA (la curvatura) a distinguerli — positiva = minimo (concavità verso l'alto), negativa = massimo, e in più dimensioni entra in gioco l'Hessiano. Nell'ottimizzazione ML questo importa perché le superfici di perdita hanno moltissimi punti stazionari, e non tutti sono buoni: i minimi locali e soprattutto i punti di sella (dove alcune direzioni salgono e altre scendono) sono la sfida principale dell'ottimizzazione ad alta dimensione.</p>
` },

    {
      type: "exercise", id: "ma-01", kg: 10, title: "La pendenza numerica",
      task: `<p>Implementa la derivata numerica con la differenza centrata e verificala su funzioni note:</p>
<ul>
<li><code>derivata</code>: funzione <code>(f(x+h) - f(x-h)) / (2h)</code> con h=1e-6 (fornita)</li>
<li><code>d_quadrato</code>: la derivata di <code>x**2</code> in x=3 (attesa: 2·3 = 6)</li>
<li><code>d_cubo</code>: la derivata di <code>x**3</code> in x=2 (attesa: 3·4 = 12)</li>
<li><code>punto_stazionario</code>: <code>True</code> se la derivata di <code>x**2</code> in x=0 è quasi zero (|d| &lt; 1e-4)</li>
</ul>`,
      starter: `import numpy as np

def derivata(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

d_quadrato = ...
d_cubo = ...
punto_stazionario = ...

print(f"d(x^2)/dx in 3 = {d_quadrato:.3f} | d(x^3)/dx in 2 = {d_cubo:.3f}")
print("x=0 e' stazionario per x^2:", punto_stazionario)`,
      check: `import numpy as np
def _d(f, x, h=1e-6): return (f(x+h)-f(x-h))/(2*h)
assert 'd_quadrato' in globals() and abs(float(d_quadrato) - 6.0) < 1e-3, "d_quadrato: derivata(lambda x: x**2, 3), circa 6"
assert 'd_cubo' in globals() and abs(float(d_cubo) - 12.0) < 1e-3, "d_cubo: derivata(lambda x: x**3, 2), circa 12"
assert 'punto_stazionario' in globals() and punto_stazionario == True, "punto_stazionario: True — la derivata di x^2 in 0 e' 0 (minimo)"`,
      hint: `<p>Passa una lambda a <code>derivata</code>: <code>derivata(lambda x: x**2, 3)</code>. Per il punto stazionario: <code>abs(derivata(lambda x: x**2, 0)) &lt; 1e-4</code>.</p>`,
      solution: `import numpy as np

def derivata(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

d_quadrato = derivata(lambda x: x**2, 3)
d_cubo = derivata(lambda x: x**3, 2)
punto_stazionario = abs(derivata(lambda x: x**2, 0)) < 1e-4

print(f"d(x^2)/dx in 3 = {d_quadrato:.3f} | d(x^3)/dx in 2 = {d_cubo:.3f}")
print("x=0 e' stazionario per x^2:", punto_stazionario)`
    },

    { type: "theory", title: "Il gradiente: la derivata in più dimensioni", html: `
<p>Con più variabili, la derivata diventa il <strong>gradiente</strong>: il vettore delle derivate parziali, una per ogni variabile. Punta nella direzione di massima crescita della funzione.</p>
<pre><code>import numpy as np
def gradiente(f, x, h=1e-6):
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        x_piu = x.copy(); x_piu[i] += h
        x_meno = x.copy(); x_meno[i] -= h
        grad[i] = (f(x_piu) - f(x_meno)) / (2 * h)
    return grad

# per f(x,y) = x^2 + y^2, il gradiente in (1,2) e' (2, 4)</code></pre>
<p>Ogni componente misura quanto la funzione cambia muovendo SOLO quella variabile. Il gradiente è la bussola dell'ottimizzazione: per MINIMIZZARE una funzione, ci si muove nella direzione OPPOSTA al gradiente (discesa del gradiente).</p>
`, more: `
<p>La proprietà chiave del gradiente è geometrica: punta nella direzione di massima PENDENZA in salita, ed è perpendicolare alle curve di livello (le linee dove la funzione è costante). Immagina una collina: il gradiente indica dove salire più ripidamente; il suo opposto, dove scendere. Il suo modulo dice quanto è ripida la pendenza — gradiente grande = superficie ripida, gradiente vicino a zero = quasi piatta (vicino a un punto stazionario). Questo rende il gradiente la guida naturale dell'ottimizzazione: segui -gradiente e scendi verso un minimo.</p>
<p>Il calcolo numerico del gradiente costa n valutazioni della funzione (una perturbazione per dimensione), il che lo rende impraticabile per le reti neurali con milioni di parametri — n valutazioni di una rete enorme per un solo passo sarebbe assurdo. Ecco perché esiste la backpropagation: calcola TUTTE le derivate parziali in un solo passaggio all'indietro, con costo comparabile a una singola valutazione della funzione, applicando la regola della catena in modo intelligente. Il gradiente numerico resta prezioso per il <strong>gradient checking</strong>: verificare che l'implementazione analitica della backprop sia corretta confrontandola con quella numerica su pochi parametri.</p>
<p>Estensioni del gradiente che i colloqui a volte toccano: il <strong>Jacobiano</strong> generalizza il gradiente a funzioni con output VETTORIALE (una matrice di derivate parziali, righe=output, colonne=input) — essenziale nella backprop attraverso i layer; l'<strong>Hessiano</strong> è la matrice delle derivate SECONDE, che cattura la curvatura e permette metodi di ottimizzazione del secondo ordine (Newton) più veloci ma costosi. In pratica il ML moderno usa quasi sempre il primo ordine (solo gradiente) perché l'Hessiano su milioni di parametri è proibitivo, ma capire la gerarchia derivata → gradiente → Jacobiano → Hessiano è capire l'impalcatura dell'ottimizzazione.</p>
` },

    {
      type: "exercise", id: "ma-02", kg: 15, title: "Il gradiente della conca",
      task: `<p>Implementa il gradiente numerico e calcolalo per <code>f(x,y) = x² + y²</code> (una conca):</p>
<ul>
<li><code>gradiente</code>: funzione che calcola le derivate parziali (fornita nello starter)</li>
<li><code>grad_in_1_2</code>: il gradiente di <code>f</code> nel punto (1, 2) — atteso ≈ (2, 4)</li>
<li><code>grad_nel_minimo</code>: il gradiente in (0, 0) — deve essere ≈ (0, 0), il minimo</li>
<li><code>nel_minimo</code>: <code>True</code> se la norma del gradiente in (0,0) è quasi zero</li>
</ul>`,
      starter: `import numpy as np

def f(v):
    return v[0]**2 + v[1]**2

def gradiente(f, x, h=1e-6):
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp = x.astype(float).copy(); xp[i] += h
        xm = x.astype(float).copy(); xm[i] -= h
        grad[i] = (f(xp) - f(xm)) / (2 * h)
    return grad

grad_in_1_2 = ...
grad_nel_minimo = ...
nel_minimo = ...

print("gradiente in (1,2):", np.round(grad_in_1_2, 3))
print("gradiente in (0,0):", np.round(grad_nel_minimo, 6), "| e' il minimo:", nel_minimo)`,
      check: `import numpy as np
def _f(v): return v[0]**2 + v[1]**2
def _g(f, x, h=1e-6):
    g = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp = x.astype(float).copy(); xp[i]+=h
        xm = x.astype(float).copy(); xm[i]-=h
        g[i]=(f(xp)-f(xm))/(2*h)
    return g
_g12 = _g(_f, np.array([1.0,2.0]))
assert 'grad_in_1_2' in globals() and np.allclose(grad_in_1_2, _g12, atol=1e-3) and np.allclose(grad_in_1_2, [2,4], atol=1e-3), "grad_in_1_2: gradiente(f, np.array([1.0, 2.0])), circa (2, 4)"
assert 'grad_nel_minimo' in globals() and np.linalg.norm(grad_nel_minimo) < 1e-4, "grad_nel_minimo: gradiente in (0,0), circa (0,0)"
assert 'nel_minimo' in globals() and nel_minimo == True, "nel_minimo: True — nel minimo il gradiente si annulla"`,
      hint: `<p>Passa array float: <code>gradiente(f, np.array([1.0, 2.0]))</code>. Per (0,0): la norma <code>np.linalg.norm(grad_nel_minimo) &lt; 1e-4</code>. Il gradiente di x²+y² è (2x, 2y).</p>`,
      solution: `import numpy as np

def f(v):
    return v[0]**2 + v[1]**2

def gradiente(f, x, h=1e-6):
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp = x.astype(float).copy(); xp[i] += h
        xm = x.astype(float).copy(); xm[i] -= h
        grad[i] = (f(xp) - f(xm)) / (2 * h)
    return grad

grad_in_1_2 = gradiente(f, np.array([1.0, 2.0]))
grad_nel_minimo = gradiente(f, np.array([0.0, 0.0]))
nel_minimo = np.linalg.norm(grad_nel_minimo) < 1e-4

print("gradiente in (1,2):", np.round(grad_in_1_2, 3))
print("gradiente in (0,0):", np.round(grad_nel_minimo, 6), "| e' il minimo:", nel_minimo)`
    },

    {
      type: "exercise", id: "ma-03", kg: 20, title: "Discesa del gradiente a mano",
      task: `<p>Usa il gradiente per MINIMIZZARE <code>f(x,y) = x² + y²</code> partendo da un punto lontano. Implementa la discesa del gradiente:</p>
<ul>
<li>parti da <code>punto = [4.0, -3.0]</code>, learning rate <code>lr=0.1</code></li>
<li>ripeti 50 volte: <code>punto = punto - lr * gradiente(f, punto)</code></li>
<li><code>punto_finale</code>: il punto dopo le 50 iterazioni</li>
<li><code>vicino_al_minimo</code>: <code>True</code> se il punto finale è vicino a (0,0) (norma &lt; 0.1)</li>
<li><code>f_diminuita</code>: <code>True</code> se f(punto_finale) &lt; f(punto_iniziale)</li>
</ul>`,
      starter: `import numpy as np

def f(v):
    return v[0]**2 + v[1]**2

def gradiente(f, x, h=1e-6):
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp = x.copy(); xp[i] += h
        xm = x.copy(); xm[i] -= h
        grad[i] = (f(xp) - f(xm)) / (2 * h)
    return grad

punto = np.array([4.0, -3.0])
f_iniziale = f(punto)
lr = 0.1

for _ in range(50):
    punto = ...   # un passo di discesa

punto_finale = punto
vicino_al_minimo = ...
f_diminuita = ...

print("punto finale:", np.round(punto_finale, 4))
print(f"f: {f_iniziale:.2f} -> {f(punto_finale):.4f} | vicino al minimo: {vicino_al_minimo}")`,
      check: `import numpy as np
def _f(v): return v[0]**2 + v[1]**2
def _g(f, x, h=1e-6):
    g = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp=x.copy(); xp[i]+=h; xm=x.copy(); xm[i]-=h; g[i]=(f(xp)-f(xm))/(2*h)
    return g
_p = np.array([4.0,-3.0])
for _ in range(50): _p = _p - 0.1*_g(_f, _p)
assert 'punto_finale' in globals() and np.allclose(punto_finale, _p, atol=1e-3), "punto_finale: itera punto = punto - lr * gradiente(f, punto)"
assert 'vicino_al_minimo' in globals() and vicino_al_minimo == True and np.linalg.norm(_p) < 0.1, "vicino_al_minimo: True — la discesa converge a (0,0)"
assert 'f_diminuita' in globals() and f_diminuita == True, "f_diminuita: True — la perdita e' crollata da 25 a ~0"`,
      hint: `<p>Il passo di discesa: <code>punto = punto - lr * gradiente(f, punto)</code>. Segui l'OPPOSTO del gradiente per scendere. Dopo 50 passi da (4,-3) con lr=0.1 arrivi vicinissimo a (0,0). <code>vicino_al_minimo = np.linalg.norm(punto_finale) &lt; 0.1</code>.</p>`,
      solution: `import numpy as np

def f(v):
    return v[0]**2 + v[1]**2

def gradiente(f, x, h=1e-6):
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        xp = x.copy(); xp[i] += h
        xm = x.copy(); xm[i] -= h
        grad[i] = (f(xp) - f(xm)) / (2 * h)
    return grad

punto = np.array([4.0, -3.0])
f_iniziale = f(punto)
lr = 0.1

for _ in range(50):
    punto = punto - lr * gradiente(f, punto)

punto_finale = punto
vicino_al_minimo = np.linalg.norm(punto_finale) < 0.1
f_diminuita = f(punto_finale) < f_iniziale

print("punto finale:", np.round(punto_finale, 4))
print(f"f: {f_iniziale:.2f} -> {f(punto_finale):.4f} | vicino al minimo: {vicino_al_minimo}")`
    },

    { type: "theory", title: "Vettori, prodotto scalare, norme", html: `
<p>Il ML vive nello spazio dei vettori. Tre operazioni fondamentali:</p>
<pre><code>import numpy as np
a = np.array([1, 2, 3]); b = np.array([4, 5, 6])
a @ b                    # prodotto scalare: 1*4 + 2*5 + 3*6 = 32
np.linalg.norm(a)        # norma L2 (lunghezza): sqrt(1+4+9) = 3.74
np.linalg.norm(a, ord=1) # norma L1 (somma dei moduli): 6</code></pre>
<p>Il <strong>prodotto scalare</strong> misura quanto due vettori "vanno d'accordo": positivo se puntano nella stessa direzione, zero se ortogonali, negativo se opposti. È dietro la similarità coseno, i layer densi delle reti (input · pesi), e le proiezioni.</p>
<p>Le <strong>norme</strong> misurano la lunghezza: la L2 (euclidea) è la distanza in linea d'aria, la L1 (Manhattan) la somma dei passi lungo gli assi. Compaiono ovunque nella regolarizzazione (L1 sparsifica, L2 restringe).</p>
`, more: `
<p>Il prodotto scalare unifica concetti che sembrano diversi. Geometricamente, a·b = |a||b|cos(θ): contiene sia le lunghezze sia l'angolo tra i vettori — da cui la similarità coseno (sala NLP) è semplicemente il prodotto scalare normalizzato per le lunghezze. Nelle reti neurali, ogni neurone calcola un prodotto scalare tra input e pesi (poi una non-linearità): l'intera moltiplicazione matrice-vettore di un layer denso è un fascio di prodotti scalari. Capire il prodotto scalare è capire l'operazione atomica del deep learning.</p>
<p>La differenza tra norma L1 e L2 ha conseguenze pratiche profonde nella regolarizzazione (sala Feature Engineering). La <strong>L2</strong> (Ridge) penalizza il quadrato dei pesi: restringe tutti i coefficienti verso zero in modo dolce, senza mai azzerarli del tutto. La <strong>L1</strong> (Lasso) penalizza il valore assoluto: geometricamente il suo "vincolo a rombo" ha spigoli sugli assi, e la soluzione ottima tende a cadere su quegli spigoli — dove alcuni coefficienti sono ESATTAMENTE zero. Ecco perché L1 fa selezione delle feature (sparsità) e L2 no: è pura geometria delle norme, non un dettaglio implementativo.</p>
<p>Le norme generalizzano (norma Lp), e i casi estremi sono istruttivi: la norma L∞ è il massimo dei moduli (il componente più grande domina), la "norma L0" (non è una vera norma) conta i componenti non-zero — è ciò che la sparsità VORREBBE minimizzare, ma essendo non differenziabile e combinatoria si usa la L1 come suo surrogato convesso trattabile. Nel ML ad alta dimensione le norme interagiscono con la maledizione della dimensionalità in modi controintuitivi: in spazi con migliaia di dimensioni, le distanze euclidee tra punti casuali tendono a concentrarsi (tutti quasi equidistanti), un fenomeno che degrada i metodi basati su distanza (KNN, clustering) e motiva la riduzione dimensionale — che ci porta alla PCA.</p>
` },

    {
      type: "exercise", id: "ma-04", kg: 10, title: "Prodotto scalare e norme",
      task: `<p>Calcola le operazioni vettoriali fondamentali:</p>
<ul>
<li><code>prod_scalare</code>: il prodotto scalare <code>a @ b</code></li>
<li><code>norma_l2_a</code>: la norma L2 (euclidea) di <code>a</code></li>
<li><code>norma_l1_a</code>: la norma L1 di <code>a</code></li>
<li><code>ortogonali</code>: <code>True</code> se <code>c</code> e <code>d</code> sono ortogonali (prodotto scalare ≈ 0)</li>
</ul>`,
      setup: `import numpy as np
a = np.array([3.0, 4.0])
b = np.array([1.0, 2.0])
c = np.array([1.0, 0.0])
d = np.array([0.0, 5.0])`,
      starter: `import numpy as np
# a, b, c, d: vettori 2D

prod_scalare = ...
norma_l2_a = ...
norma_l1_a = ...
ortogonali = ...

print(f"a @ b = {prod_scalare} | |a|_2 = {norma_l2_a} | |a|_1 = {norma_l1_a}")
print("c e d ortogonali:", ortogonali)`,
      check: `import numpy as np
assert 'prod_scalare' in globals() and abs(float(prod_scalare) - 11.0) < 1e-9, "prod_scalare: a @ b = 3*1 + 4*2 = 11"
assert 'norma_l2_a' in globals() and abs(float(norma_l2_a) - 5.0) < 1e-9, "norma_l2_a: np.linalg.norm(a) = sqrt(9+16) = 5"
assert 'norma_l1_a' in globals() and abs(float(norma_l1_a) - 7.0) < 1e-9, "norma_l1_a: np.linalg.norm(a, ord=1) = |3|+|4| = 7"
assert 'ortogonali' in globals() and ortogonali == True, "ortogonali: True — c @ d = 0 (uno su un asse, l'altro sull'altro)"`,
      hint: `<p><code>a @ b</code> per lo scalare, <code>np.linalg.norm(a)</code> per la L2, <code>np.linalg.norm(a, ord=1)</code> per la L1. <code>ortogonali = abs(c @ d) &lt; 1e-9</code>.</p>`,
      solution: `import numpy as np

prod_scalare = a @ b
norma_l2_a = np.linalg.norm(a)
norma_l1_a = np.linalg.norm(a, ord=1)
ortogonali = abs(c @ d) < 1e-9

print(f"a @ b = {prod_scalare} | |a|_2 = {norma_l2_a} | |a|_1 = {norma_l1_a}")
print("c e d ortogonali:", ortogonali)`
    },

    { type: "theory", title: "Matrici come trasformazioni", html: `
<p>Una matrice non è solo una tabella di numeri: è una <strong>trasformazione</strong> dello spazio. Moltiplicare un vettore per una matrice lo ruota, scala, riflette o proietta.</p>
<pre><code>import numpy as np
A = np.array([[2, 0], [0, 3]])   # scala x2 in orizzontale, x3 in verticale
v = np.array([1, 1])
A @ v                             # -> [2, 3]
A @ B                             # composizione: prima B, poi A</code></pre>
<p>La moltiplicazione matrice-vettore è l'operazione base delle reti neurali (ogni layer è <code>W @ x + b</code>). La moltiplicazione matrice-matrice compone trasformazioni. Concetti chiave: la <strong>trasposta</strong> (<code>A.T</code>, scambia righe e colonne), l'<strong>inversa</strong> (<code>np.linalg.inv</code>, "annulla" la trasformazione), il <strong>determinante</strong> (<code>np.linalg.det</code>, quanto la trasformazione dilata i volumi).</p>
`, more: `
<p>Il <strong>determinante</strong> ha un'interpretazione geometrica illuminante: è il fattore di cui la trasformazione moltiplica le aree (in 2D) o i volumi (in 3D+). Determinante 2 = la trasformazione raddoppia le aree; determinante 1 = le preserva (rotazioni, riflessioni); determinante NEGATIVO = la trasformazione "ribalta" l'orientamento (riflessione); determinante ZERO = la trasformazione COLLASSA lo spazio in una dimensione inferiore (schiaccia un piano su una retta), perdendo informazione in modo irreversibile. Ed è proprio il determinante zero a segnalare che una matrice NON è invertibile: non puoi "tornare indietro" da uno spazio collassato.</p>
<p>L'<strong>inversa</strong> annulla la trasformazione (A⁻¹A = I, l'identità), ma esiste solo se il determinante è non-zero (matrice "non singolare"). Nel ML, invertire matrici compare nella soluzione in forma chiusa della regressione lineare (equazioni normali: β = (XᵀX)⁻¹Xᵀy), ma in pratica si EVITA di calcolare inverse esplicite — sono numericamente instabili e costose (O(n³)). Si usano invece decomposizioni (QR, SVD, Cholesky) che risolvono il sistema senza invertire. La regola pratica: se ti trovi a scrivere <code>np.linalg.inv</code>, quasi sempre c'è un modo migliore (<code>np.linalg.solve</code> per i sistemi, le decomposizioni per il resto).</p>
<p>La moltiplicazione tra matrici NON è commutativa (A@B ≠ B@A in generale) — e questo ha senso pensando alle trasformazioni: ruotare poi scalare è diverso da scalare poi ruotare. L'ordine delle operazioni conta, ed è il motivo per cui l'ordine dei layer in una rete neurale non è arbitrario. Le dimensioni devono anche combaciare (le colonne della prima = le righe della seconda), un vincolo che nella pratica del ML è la fonte numero uno di errori di shape — capire il flusso delle dimensioni attraverso i layer (batch × features → batch × hidden → ...) è metà del debugging delle reti.</p>
` },

    {
      type: "exercise", id: "ma-05", kg: 15, title: "La matrice che trasforma",
      task: `<p>Esplora le matrici come trasformazioni:</p>
<ul>
<li><code>v_trasf</code>: applica la matrice <code>A</code> al vettore <code>v</code> (<code>A @ v</code>)</li>
<li><code>det_A</code>: il determinante di A (di quanto dilata le aree)</li>
<li><code>A_inv</code>: l'inversa di A</li>
<li><code>torna_indietro</code>: <code>True</code> se applicando A e poi la sua inversa si torna a <code>v</code> (<code>A_inv @ (A @ v)</code> ≈ <code>v</code>)</li>
<li><code>non_commutativa</code>: <code>True</code> se <code>A @ B</code> ≠ <code>B @ A</code></li>
</ul>`,
      setup: `import numpy as np
A = np.array([[2.0, 1.0], [0.0, 3.0]])
B = np.array([[1.0, 2.0], [3.0, 1.0]])
v = np.array([1.0, 1.0])`,
      starter: `import numpy as np
# A, B: matrici 2x2 | v: vettore

v_trasf = ...
det_A = ...
A_inv = ...
torna_indietro = ...
non_commutativa = ...

print(f"A @ v = {v_trasf} | det(A) = {det_A} | torna indietro: {torna_indietro}")
print("A@B != B@A:", non_commutativa)`,
      check: `import numpy as np
assert 'v_trasf' in globals() and np.allclose(v_trasf, A @ v), "v_trasf: A @ v"
assert 'det_A' in globals() and abs(float(det_A) - float(np.linalg.det(A))) < 1e-6, "det_A: np.linalg.det(A) = 6"
assert 'A_inv' in globals() and np.allclose(A_inv, np.linalg.inv(A)), "A_inv: np.linalg.inv(A)"
assert 'torna_indietro' in globals() and torna_indietro == True, "torna_indietro: True — A_inv @ (A @ v) riporta a v"
assert 'non_commutativa' in globals() and non_commutativa == True, "non_commutativa: True — A@B != B@A per queste matrici"`,
      hint: `<p><code>np.linalg.det(A)</code>, <code>np.linalg.inv(A)</code>. <code>torna_indietro = np.allclose(A_inv @ (A @ v), v)</code>. <code>non_commutativa = not np.allclose(A @ B, B @ A)</code>.</p>`,
      solution: `import numpy as np

v_trasf = A @ v
det_A = np.linalg.det(A)
A_inv = np.linalg.inv(A)
torna_indietro = np.allclose(A_inv @ (A @ v), v)
non_commutativa = not np.allclose(A @ B, B @ A)

print(f"A @ v = {v_trasf} | det(A) = {det_A} | torna indietro: {torna_indietro}")
print("A@B != B@A:", non_commutativa)`
    },

    { type: "theory", title: "Autovalori e autovettori", html: `
<p>Per una trasformazione (matrice) A, un <strong>autovettore</strong> è un vettore speciale la cui DIREZIONE non cambia quando gli applichi A — viene solo scalato. Il fattore di scala è l'<strong>autovalore</strong>.</p>
<pre><code>import numpy as np
A @ v = lambda_ * v      # la definizione: A trasforma v in un suo multiplo
autoval, autovec = np.linalg.eig(A)   # autovalori e autovettori (in colonne)</code></pre>
<p>Intuizione: gli autovettori sono gli "assi naturali" della trasformazione, le direzioni lungo cui A agisce in modo più semplice (solo stiramento). Un autovalore grande significa che A stira molto in quella direzione; piccolo, che la comprime.</p>
<p>Sono ovunque nel ML: la <strong>PCA</strong> trova gli autovettori della matrice di covarianza (le direzioni di massima varianza), PageRank usa l'autovettore dominante, la stabilità dei sistemi dipende dagli autovalori.</p>
`, more: `
<p>Per le matrici <strong>simmetriche</strong> (come le matrici di covarianza, sempre simmetriche) gli autovettori hanno proprietà speciali e bellissime: sono tutti ORTOGONALI tra loro e gli autovalori sono tutti REALI. Questo è il teorema spettrale, ed è la ragione profonda per cui la PCA funziona: la matrice di covarianza dei dati è simmetrica, quindi i suoi autovettori formano un sistema di assi ortogonali — le componenti principali — lungo cui la varianza si decompone in modo pulito, senza sovrapposizioni. Per matrici simmetriche si usa <code>np.linalg.eigh</code> (più veloce e stabile di <code>eig</code>, sfrutta la simmetria e garantisce autovalori reali ordinati).</p>
<p>L'interpretazione degli autovalori come "quanta varianza" è il cuore della PCA: la matrice di covarianza ha come autovettori le direzioni principali dei dati e come autovalori la VARIANZA lungo ciascuna. L'autovettore con l'autovalore più grande è la direzione lungo cui i dati si spargono di più — la prima componente principale. Ordinando gli autovalori in modo decrescente si ordinano le componenti per importanza, e la loro somma è la varianza totale: il rapporto autovalore_i / somma dà la frazione di varianza "spiegata" da ogni componente, il criterio per decidere quante tenere.</p>
<p>Oltre alla PCA, gli autovalori raccontano proprietà globali di una matrice: il loro prodotto è il determinante (quanto dilata i volumi), la loro somma è la traccia (somma della diagonale), il più grande in modulo governa la stabilità dei sistemi dinamici e la velocità di convergenza dei metodi iterativi. Il <strong>numero di condizionamento</strong> (rapporto tra il più grande e il più piccolo autovalore) misura quanto una matrice è "malposta" numericamente: alto = piccole perturbazioni dell'input causano grandi variazioni dell'output, un problema serio nella soluzione di sistemi lineari e nella stabilità dell'addestramento. Gli autovalori sono una lente diagnostica sull'intera algebra lineare del ML.</p>
` },

    {
      type: "exercise", id: "ma-06", kg: 20, title: "Le direzioni che non ruotano",
      task: `<p>Trova autovalori e autovettori di una matrice e verifica la definizione <code>A @ v = λ v</code>:</p>
<ul>
<li><code>autoval</code>, <code>autovec</code>: da <code>np.linalg.eig(A)</code></li>
<li><code>lambda_max</code>: l'autovalore più grande</li>
<li><code>v_dominante</code>: l'autovettore corrispondente all'autovalore più grande (la colonna giusta di <code>autovec</code>)</li>
<li><code>verifica</code>: <code>True</code> se <code>A @ v_dominante</code> ≈ <code>lambda_max * v_dominante</code> (la definizione di autovettore)</li>
</ul>`,
      setup: `import numpy as np
A = np.array([[4.0, 1.0], [2.0, 3.0]])`,
      starter: `import numpy as np
# A: matrice 2x2

autoval, autovec = np.linalg.eig(A)
idx_max = np.argmax(autoval)
lambda_max = autoval[idx_max]
v_dominante = autovec[:, idx_max]   # autovettori sono nelle COLONNE
verifica = ...

print("autovalori:", np.round(autoval, 3))
print("autovalore dominante:", round(float(lambda_max), 3))
print("A @ v == lambda * v:", verifica)`,
      check: `import numpy as np
_av, _ave = np.linalg.eig(A)
_im = np.argmax(_av)
_lm = _av[_im]; _vd = _ave[:, _im]
assert 'lambda_max' in globals() and abs(float(lambda_max) - float(_lm)) < 1e-6, "lambda_max: autoval[np.argmax(autoval)]"
assert 'v_dominante' in globals() and np.allclose(np.abs(v_dominante), np.abs(_vd)), "v_dominante: autovec[:, idx_max] — gli autovettori sono nelle COLONNE"
assert 'verifica' in globals() and verifica == True and np.allclose(A @ _vd, _lm * _vd), "verifica: np.allclose(A @ v_dominante, lambda_max * v_dominante)"`,
      hint: `<p><code>np.linalg.eig</code> mette gli autovettori nelle COLONNE: <code>autovec[:, i]</code> è l'i-esimo. La definizione: <code>verifica = np.allclose(A @ v_dominante, lambda_max * v_dominante)</code>.</p>`,
      solution: `import numpy as np

autoval, autovec = np.linalg.eig(A)
idx_max = np.argmax(autoval)
lambda_max = autoval[idx_max]
v_dominante = autovec[:, idx_max]
verifica = np.allclose(A @ v_dominante, lambda_max * v_dominante)

print("autovalori:", np.round(autoval, 3))
print("autovalore dominante:", round(float(lambda_max), 3))
print("A @ v == lambda * v:", verifica)`
    },

    { type: "theory", title: "La PCA dagli autovalori della covarianza", html: `
<p>La <strong>PCA</strong> (Principal Component Analysis) riduce la dimensione trovando le direzioni di massima varianza. Sotto il cofano è pura algebra lineare: gli autovettori della matrice di <strong>covarianza</strong> dei dati.</p>
<pre><code>import numpy as np
X_c = X - X.mean(axis=0)              # centra i dati (media 0)
cov = np.cov(X_c, rowvar=False)       # matrice di covarianza
autoval, autovec = np.linalg.eigh(cov)  # eigh: per matrici simmetriche
# gli autovettori sono le componenti principali;
# gli autovalori, la varianza lungo ciascuna</code></pre>
<p>La prima componente principale è l'autovettore con l'autovalore più grande — la direzione lungo cui i dati variano di più. Proiettando i dati sui primi k autovettori si riduce da n dimensioni a k, mantenendo più varianza possibile. È compressione con la minima perdita di informazione.</p>
`, more: `
<p>Il centraggio dei dati (sottrarre la media) è un passo OBBLIGATORIO, non opzionale: la PCA cerca direzioni di varianza, e la varianza è definita rispetto alla media. Senza centrare, la prima componente punterebbe verso la media dei dati invece che verso la direzione di massima dispersione — un risultato privo di senso. Spesso si standardizza anche (dividere per la deviazione standard): senza, le feature con range più grande dominano la covarianza e quindi le componenti, esattamente come dominano le distanze in KNN. La scelta centra-solo vs standardizza dipende da se le scale delle feature sono confrontabili o no.</p>
<p>La <strong>varianza spiegata</strong> è ciò che rende la PCA quantitativa: ogni autovalore diviso la somma di tutti dà la frazione di varianza catturata da quella componente. Sommando le frazioni delle prime k componenti (in ordine decrescente di autovalore) si sa quanta informazione si conserva riducendo a k dimensioni — "le prime 2 componenti spiegano il 95% della varianza" significa che comprimendo da n a 2 dimensioni si perde solo il 5%. È il criterio per scegliere k: si tiene il numero di componenti che raggiunge una soglia di varianza (es. 90-95%), o si cerca il "gomito" nel grafico degli autovalori (scree plot), la stessa logica del gomito nel clustering.</p>
<p>PCA e SVD sono intimamente legate (prossima lavagna): la PCA si può calcolare via autovalori della covarianza (come qui) O direttamente via SVD della matrice dati centrata, e nella pratica sklearn usa la SVD perché è più stabile numericamente ed evita di costruire esplicitamente la matrice di covarianza (che può amplificare gli errori). Concettualmente sono la stessa cosa vista da due angoli. Limiti della PCA da conoscere: è LINEARE (non cattura strutture curve — per quelle servono kernel PCA, t-SNE, UMAP), è non supervisionata (massimizza la varianza, non la separabilità delle classi — la direzione di massima varianza non è necessariamente quella più utile per predire y), e le componenti sono combinazioni lineari di TUTTE le feature originali, quindi difficili da interpretare.</p>
` },

    {
      type: "exercise", id: "ma-07", kg: 20, title: "PCA a mano sulla covarianza",
      task: `<p>Implementa la PCA da zero usando gli autovettori della covarianza. Su dati allungati lungo una diagonale, la prima componente deve trovare quella direzione:</p>
<ul>
<li><code>X_c</code>: i dati centrati (media sottratta)</li>
<li><code>cov</code>: matrice di covarianza (<code>np.cov(X_c, rowvar=False)</code>)</li>
<li><code>autoval</code>, <code>autovec</code>: da <code>np.linalg.eigh(cov)</code></li>
<li><code>varianza_spiegata_pc1</code>: la frazione di varianza della PRIMA componente (autovalore più grande / somma). Nota: eigh ordina in modo CRESCENTE, quindi il più grande è l'ULTIMO</li>
<li><code>pc1_domina</code>: <code>True</code> se la prima componente spiega più del 90% della varianza (i dati sono quasi 1D)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
# dati allungati lungo la diagonale y=x (molta varianza in una direzione)
t = rng.normal(0, 5, 200)
X = np.column_stack([t + rng.normal(0, 0.3, 200), t + rng.normal(0, 0.3, 200)])`,
      starter: `import numpy as np
# X: 200 punti allungati lungo una diagonale

X_c = X - X.mean(axis=0)
cov = np.cov(X_c, rowvar=False)
autoval, autovec = np.linalg.eigh(cov)   # ATTENZIONE: eigh ordina crescente

# il piu' grande e' l'ultimo autovalore
varianza_spiegata_pc1 = autoval[-1] / autoval.sum()
pc1_domina = ...

print("autovalori (crescenti):", np.round(autoval, 2))
print(f"varianza spiegata PC1: {varianza_spiegata_pc1:.3f} | domina: {pc1_domina}")`,
      check: `import numpy as np
_xc = X - X.mean(axis=0)
_cov = np.cov(_xc, rowvar=False)
_av, _ave = np.linalg.eigh(_cov)
_vs = _av[-1] / _av.sum()
assert 'X_c' in globals() and np.allclose(X_c, _xc), "X_c: X - X.mean(axis=0)"
assert 'cov' in globals() and np.allclose(cov, _cov), "cov: np.cov(X_c, rowvar=False)"
assert 'varianza_spiegata_pc1' in globals() and abs(float(varianza_spiegata_pc1) - float(_vs)) < 1e-6, "varianza_spiegata_pc1: autoval[-1] / autoval.sum()"
assert 'pc1_domina' in globals() and pc1_domina == True and _vs > 0.9, "pc1_domina: True — i dati sono quasi su una retta, la PC1 cattura oltre il 90%"`,
      hint: `<p><code>np.linalg.eigh</code> restituisce gli autovalori in ordine CRESCENTE, quindi il più grande è <code>autoval[-1]</code>. <code>pc1_domina = varianza_spiegata_pc1 &gt; 0.9</code>. I dati sono quasi 1D (lungo la diagonale), quindi la prima componente domina.</p>`,
      solution: `import numpy as np

X_c = X - X.mean(axis=0)
cov = np.cov(X_c, rowvar=False)
autoval, autovec = np.linalg.eigh(cov)

varianza_spiegata_pc1 = autoval[-1] / autoval.sum()
pc1_domina = varianza_spiegata_pc1 > 0.9

print("autovalori (crescenti):", np.round(autoval, 2))
print(f"varianza spiegata PC1: {varianza_spiegata_pc1:.3f} | domina: {pc1_domina}")`
    },

    {
      type: "exercise", id: "ma-08", kg: 20, title: "Proiettare e ridurre",
      task: `<p>Completa la PCA: proietta i dati sulla prima componente, riducendo da 2D a 1D, e misura quanta informazione resta:</p>
<ul>
<li><code>pc1</code>: la prima componente principale (l'autovettore con autovalore più grande = ultima colonna di <code>autovec</code>)</li>
<li><code>proiezione</code>: i dati centrati proiettati su pc1 (<code>X_c @ pc1</code>) — ora ogni punto è UN numero</li>
<li><code>var_proiezione</code>: la varianza della proiezione</li>
<li><code>var_conservata</code>: <code>True</code> se la varianza della proiezione è vicina all'autovalore più grande (la PCA conserva la varianza lungo pc1)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
t = rng.normal(0, 5, 200)
X = np.column_stack([t + rng.normal(0, 0.3, 200), t + rng.normal(0, 0.3, 200)])
X_c = X - X.mean(axis=0)
cov = np.cov(X_c, rowvar=False)
autoval, autovec = np.linalg.eigh(cov)`,
      starter: `import numpy as np
# X_c: dati centrati | autoval, autovec: da eigh (crescenti)

pc1 = autovec[:, -1]   # ultima colonna = autovalore piu' grande
proiezione = ...        # X_c @ pc1: ogni punto diventa uno scalare
var_proiezione = proiezione.var()
var_conservata = ...

print("shape proiezione:", proiezione.shape, "(da 2D a 1D)")
print(f"varianza proiezione: {var_proiezione:.2f} | autovalore max: {autoval[-1]:.2f}")`,
      check: `import numpy as np
_pc1 = autovec[:, -1]
_proj = X_c @ _pc1
_vp = _proj.var()
assert 'proiezione' in globals() and np.allclose(proiezione, _proj), "proiezione: X_c @ pc1"
assert 'proiezione' in globals() and np.asarray(proiezione).ndim == 1, "proiezione: 1D — da 2 coordinate a 1 numero per punto"
assert 'var_proiezione' in globals() and abs(float(var_proiezione) - float(_vp)) < 1e-6, "var_proiezione: proiezione.var()"
assert 'var_conservata' in globals() and var_conservata == True, "var_conservata: True — la varianza della proiezione ~ autovalore max (a meno del fattore n/(n-1))"`,
      hint: `<p><code>X_c @ pc1</code> proietta ogni punto (2 numeri) su un solo numero lungo pc1. La varianza della proiezione è circa l'autovalore massimo: <code>var_conservata = abs(var_proiezione - autoval[-1]) &lt; 1.0</code> (piccola differenza per ddof).</p>`,
      solution: `import numpy as np

pc1 = autovec[:, -1]
proiezione = X_c @ pc1
var_proiezione = proiezione.var()
var_conservata = abs(var_proiezione - autoval[-1]) < 1.0

print("shape proiezione:", proiezione.shape, "(da 2D a 1D)")
print(f"varianza proiezione: {var_proiezione:.2f} | autovalore max: {autoval[-1]:.2f}")`
    },

    { type: "theory", title: "SVD: la decomposizione universale", html: `
<p>La <strong>SVD</strong> (Singular Value Decomposition) è forse la decomposizione più importante dell'algebra lineare applicata: scompone QUALSIASI matrice (anche non quadrata) in tre fattori.</p>
<pre><code>import numpy as np
U, s, Vt = np.linalg.svd(A, full_matrices=False)
# A = U @ diag(s) @ Vt
# U, Vt: matrici ortogonali (rotazioni)
# s: valori singolari (scala), sempre >= 0 e ordinati decrescenti</code></pre>
<p>Interpretazione geometrica: ogni trasformazione lineare è una <strong>rotazione</strong> (Vt), poi uno <strong>stiramento</strong> lungo gli assi (s), poi un'altra <strong>rotazione</strong> (U). I <strong>valori singolari</strong> (s) misurano quanto la matrice stira in ciascuna direzione principale — l'analogo degli autovalori, ma per matrici qualsiasi.</p>
<p>Applicazioni: compressione (tieni solo i valori singolari grandi), PCA (la SVD dei dati centrati dà le componenti), sistemi di raccomandazione (fattorizzazione della matrice utenti×item), riduzione del rumore.</p>
`, more: `
<p>Il legame SVD-PCA è diretto: i valori singolari della matrice dati centrata sono le radici quadrate degli autovalori della covarianza (a meno di un fattore di scala), e le righe di Vt sono le componenti principali. Per questo sklearn calcola la PCA via SVD invece che via autovalori della covarianza: è più stabile numericamente (non costruisce esplicitamente XᵀX, che eleva al quadrato il numero di condizionamento e amplifica gli errori) e funziona anche quando ci sono più feature che campioni. Sono due strade allo stesso risultato, ma la SVD è la strada ingegneristicamente migliore.</p>
<p>La <strong>SVD troncata</strong> è la magia della compressione: tenendo solo i primi k valori singolari (i più grandi) e le corrispondenti colonne/righe di U e Vt, si ottiene la MIGLIORE approssimazione di rango k della matrice originale (teorema di Eckart-Young). Questo è ciò che comprime le immagini (una foto è una matrice di pixel; poche decine di valori singolari ne catturano l'essenza), riduce il rumore (i valori singolari piccoli spesso corrispondono a rumore, scartarli pulisce il segnale), e riduce le dimensioni. Il rapporto tra i valori singolari tenuti e la loro somma totale dice quanta "energia" della matrice si conserva.</p>
<p>Nei <strong>sistemi di raccomandazione</strong>, la SVD (e le sue varianti come la matrix factorization) decompone la matrice sparsa utenti×item (chi ha valutato cosa) in fattori latenti: ogni utente e ogni item diventano vettori in uno spazio di "gusti" nascosti (azione, romanticismo, ...), e il prodotto scalare tra i loro vettori predice il gradimento. È l'idea che ha vinto il Netflix Prize e che sta sotto ai recommender classici. La SVD è così l'anello che collega algebra lineare pura, PCA, compressione e una delle applicazioni ML di maggior valore commerciale — vale la pena vederne l'unità concettuale, non come tecniche separate.</p>
` },

    {
      type: "exercise", id: "ma-09", kg: 20, title: "Scomporre e ricomporre",
      task: `<p>Decomponi una matrice con la SVD e verifica che i tre fattori la ricostruiscano:</p>
<ul>
<li><code>U</code>, <code>s</code>, <code>Vt</code>: da <code>np.linalg.svd(A, full_matrices=False)</code></li>
<li><code>ricostruita</code>: <code>U @ np.diag(s) @ Vt</code></li>
<li><code>ricostruzione_esatta</code>: <code>True</code> se <code>ricostruita</code> ≈ <code>A</code></li>
<li><code>valori_singolari_decrescenti</code>: <code>True</code> se <code>s</code> è ordinato in modo decrescente</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
A = rng.normal(0, 1, size=(5, 3))`,
      starter: `import numpy as np
# A: matrice 5x3

U, s, Vt = ...
ricostruita = ...
ricostruzione_esatta = ...
valori_singolari_decrescenti = ...

print("valori singolari:", np.round(s, 3))
print("ricostruzione esatta:", ricostruzione_esatta, "| s decrescente:", valori_singolari_decrescenti)`,
      check: `import numpy as np
_U, _s, _Vt = np.linalg.svd(A, full_matrices=False)
_ric = _U @ np.diag(_s) @ _Vt
assert 's' in globals() and np.allclose(s, _s), "s: valori singolari da np.linalg.svd(A, full_matrices=False)"
assert 'ricostruita' in globals() and np.allclose(ricostruita, _ric), "ricostruita: U @ np.diag(s) @ Vt"
assert 'ricostruzione_esatta' in globals() and ricostruzione_esatta == True, "ricostruzione_esatta: True — i tre fattori ricostruiscono A esattamente"
assert 'valori_singolari_decrescenti' in globals() and valori_singolari_decrescenti == True, "valori_singolari_decrescenti: True — la SVD li ordina sempre in modo decrescente"`,
      hint: `<p><code>U, s, Vt = np.linalg.svd(A, full_matrices=False)</code>. Ricostruzione: <code>U @ np.diag(s) @ Vt</code>. Per l'ordine: <code>np.all(np.diff(s) &lt;= 0)</code>.</p>`,
      solution: `import numpy as np

U, s, Vt = np.linalg.svd(A, full_matrices=False)
ricostruita = U @ np.diag(s) @ Vt
ricostruzione_esatta = np.allclose(ricostruita, A)
valori_singolari_decrescenti = bool(np.all(np.diff(s) <= 0))

print("valori singolari:", np.round(s, 3))
print("ricostruzione esatta:", ricostruzione_esatta, "| s decrescente:", valori_singolari_decrescenti)`
    },

    {
      type: "exercise", id: "ma-10", kg: 20, title: "Compressione con SVD troncata",
      task: `<p>Comprimi una matrice tenendo solo i primi k valori singolari (la migliore approssimazione di rango k). Verifica il compromesso qualità/compressione:</p>
<ul>
<li><code>U</code>, <code>s</code>, <code>Vt</code>: la SVD della matrice</li>
<li><code>k</code>: 2 (teniamo 2 valori singolari su 6)</li>
<li><code>A_k</code>: la ricostruzione di rango k = <code>U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]</code></li>
<li><code>energia_conservata</code>: frazione di "energia" tenuta = <code>(s[:k]**2).sum() / (s**2).sum()</code></li>
<li><code>buona_compressione</code>: <code>True</code> se con 2 componenti su 6 si conserva oltre l'85% dell'energia (la matrice ha struttura a basso rango)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
# matrice a basso rango + poco rumore: 2 direzioni dominanti
base = rng.normal(0, 1, size=(20, 2))
A = base @ rng.normal(0, 1, size=(2, 6)) + rng.normal(0, 0.1, size=(20, 6))`,
      starter: `import numpy as np
# A: 20x6, ma con struttura quasi di rango 2

U, s, Vt = np.linalg.svd(A, full_matrices=False)
k = 2

A_k = ...
energia_conservata = ...
buona_compressione = ...

print("valori singolari:", np.round(s, 2))
print(f"energia conservata con k={k}: {energia_conservata:.3f} | buona: {buona_compressione}")`,
      check: `import numpy as np
_U, _s, _Vt = np.linalg.svd(A, full_matrices=False)
_Ak = _U[:, :2] @ np.diag(_s[:2]) @ _Vt[:2, :]
_e = (_s[:2]**2).sum() / (_s**2).sum()
assert 'A_k' in globals() and np.allclose(A_k, _Ak), "A_k: U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]"
assert 'energia_conservata' in globals() and abs(float(energia_conservata) - float(_e)) < 1e-6, "energia_conservata: (s[:k]**2).sum() / (s**2).sum()"
assert 'buona_compressione' in globals() and buona_compressione == True and _e > 0.85, "buona_compressione: True — 2 componenti su 6 catturano >85% (la matrice e' quasi di rango 2)"`,
      hint: `<p>La troncata: <code>U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]</code>. L'energia è la somma dei quadrati dei valori singolari tenuti su totale. <code>buona_compressione = energia_conservata &gt; 0.85</code>.</p>`,
      solution: `import numpy as np

U, s, Vt = np.linalg.svd(A, full_matrices=False)
k = 2

A_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]
energia_conservata = (s[:k]**2).sum() / (s**2).sum()
buona_compressione = energia_conservata > 0.85

print("valori singolari:", np.round(s, 2))
print(f"energia conservata con k={k}: {energia_conservata:.3f} | buona: {buona_compressione}")`
    },

    {
      type: "exercise", id: "ma-11", kg: 15, title: "Quiz: la matematica sotto il ML",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Il gradiente punta nella direzione di massima crescita; per minimizzare ci si muove nel verso opposto"</li>
<li><code>a2</code>: "La PCA trova gli autovettori della matrice di covarianza dei dati"</li>
<li><code>a3</code>: "Un determinante pari a zero indica una matrice invertibile"</li>
<li><code>a4</code>: "La SVD funziona solo su matrici quadrate"</li>
<li><code>a5</code>: "Nella SVD troncata, tenere i valori singolari più grandi dà la migliore approssimazione di rango basso"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: -gradiente e' la direzione di discesa"
assert a2 == True, "a2 VERA: PCA = autovettori della covarianza (o SVD dei dati centrati)"
assert a3 == False, "a3 FALSA: determinante ZERO -> matrice NON invertibile (singolare, collassa lo spazio)"
assert a4 == False, "a4 FALSA: la SVD funziona su QUALSIASI matrice, anche non quadrata — e' il suo punto di forza"
assert a5 == True, "a5 VERA: teorema di Eckart-Young, i valori singolari grandi catturano piu' struttura"`,
      hint: `<p>Le due trappole: a3 (det=0 significa NON invertibile) e a4 (la SVD funziona su qualunque matrice, non solo quadrate). Le altre riprendono le lavagne: gradiente (a1), PCA (a2), SVD troncata (a5).</p>`,
      solution: `a1 = True
a2 = True
a3 = False
a4 = False
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "ma-12", kg: 25, title: "MASSIMALE: regressione lineare da zero",
      task: `<p>Il gran finale: implementa la regressione lineare in DUE modi — con la discesa del gradiente e con la soluzione in forma chiusa (equazioni normali) — e verifica che convergano allo stesso risultato. Tutta matematica, zero sklearn per il fit.</p>
<ul>
<li><code>X_b</code>: X con una colonna di 1 aggiunta all'inizio (per l'intercetta)</li>
<li><code>theta_closed</code>: soluzione in forma chiusa <code>(X_bᵀ X_b)⁻¹ X_bᵀ y</code> (equazioni normali, usa <code>np.linalg.inv</code>)</li>
<li><code>theta_gd</code>: soluzione con discesa del gradiente (1000 iter, lr=0.05) — il gradiente dell'MSE è <code>(2/n) X_bᵀ (X_b θ − y)</code></li>
<li><code>convergono</code>: <code>True</code> se le due soluzioni sono vicine (norma della differenza &lt; 0.01)</li>
<li><code>r2</code>: R² della soluzione in forma chiusa (1 − SS_res/SS_tot)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
n = 200
X = rng.uniform(-3, 3, size=(n, 2))
# relazione vera: y = 4 + 2*x0 - 3*x1 + rumore
y = 4 + 2*X[:, 0] - 3*X[:, 1] + rng.normal(0, 0.3, n)`,
      starter: `import numpy as np
# X: (200, 2) | y: target lineare + rumore

n = len(y)
X_b = np.column_stack([np.ones(n), X])   # colonna di 1 per l'intercetta

# 1) forma chiusa (equazioni normali)
theta_closed = ...

# 2) discesa del gradiente
theta_gd = np.zeros(X_b.shape[1])
lr = 0.05
for _ in range(1000):
    grad = (2/n) * X_b.T @ (X_b @ theta_gd - y)
    theta_gd = theta_gd - lr * grad

convergono = ...

# R2 della forma chiusa
y_pred = X_b @ theta_closed
ss_res = ((y - y_pred)**2).sum()
ss_tot = ((y - y.mean())**2).sum()
r2 = 1 - ss_res/ss_tot

print("theta forma chiusa:", np.round(theta_closed, 3))
print("theta gradient descent:", np.round(theta_gd, 3))
print(f"convergono: {convergono} | R2: {r2:.4f}")`,
      check: `import numpy as np
n = len(y)
_Xb = np.column_stack([np.ones(n), X])
_tc = np.linalg.inv(_Xb.T @ _Xb) @ _Xb.T @ y
_tg = np.zeros(_Xb.shape[1])
for _ in range(1000):
    _tg = _tg - 0.05 * (2/n) * _Xb.T @ (_Xb @ _tg - y)
assert 'theta_closed' in globals() and np.allclose(theta_closed, _tc, atol=1e-6), "theta_closed: np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y"
assert 'convergono' in globals() and convergono == True and np.linalg.norm(_tc - _tg) < 0.01, "convergono: True — i due metodi arrivano quasi allo stesso theta"
assert 'r2' in globals() and float(r2) > 0.98, "r2: > 0.98 — la relazione e' quasi perfettamente lineare"
assert np.allclose(_tc, [4, 2, -3], atol=0.2), "theta deve recuperare i coefficienti veri (4, 2, -3)"`,
      hint: `<p>La forma chiusa: <code>np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y</code> (le equazioni normali). La discesa è già scritta nel ciclo. <code>convergono = np.linalg.norm(theta_closed - theta_gd) &lt; 0.01</code>. Entrambe recuperano (4, 2, -3), i coefficienti veri.</p>`,
      solution: `import numpy as np

n = len(y)
X_b = np.column_stack([np.ones(n), X])

theta_closed = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y

theta_gd = np.zeros(X_b.shape[1])
lr = 0.05
for _ in range(1000):
    grad = (2/n) * X_b.T @ (X_b @ theta_gd - y)
    theta_gd = theta_gd - lr * grad

convergono = np.linalg.norm(theta_closed - theta_gd) < 0.01

y_pred = X_b @ theta_closed
ss_res = ((y - y_pred)**2).sum()
ss_tot = ((y - y.mean())**2).sum()
r2 = 1 - ss_res/ss_tot

print("theta forma chiusa:", np.round(theta_closed, 3))
print("theta gradient descent:", np.round(theta_gd, 3))
print(f"convergono: {convergono} | R2: {r2:.4f}")`
    }

  ]
});
