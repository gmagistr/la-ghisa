window.MODULES.push({
  id: "numpy",
  name: "NumPy",
  tagline: "Il rack dei fondamentali: array, vettorizzazione, broadcasting. Qui si costruisce la forza di base.",
  intro: "NumPy è il motore numerico sotto a tutto il resto: Pandas e scikit-learn sono costruiti sopra i suoi array. Impara a pensare per vettori invece che per cicli, e tutto il resto diventa leggero.",
  packages: ["numpy"],
  items: [

    { type: "theory", title: "L'array: una lista che sa di matematica", html: `
<p>L'<code>ndarray</code> di NumPy assomiglia a una lista ma è un blocco di numeri <strong>tutti dello stesso tipo</strong> (<code>dtype</code>), su cui le operazioni matematiche agiscono in blocco e a velocità C.</p>
<pre><code>import numpy as np
a = np.array([1, 2, 3])       # da una lista
r = np.arange(0, 10, 2)       # come range: [0 2 4 6 8]
z = np.zeros(4)               # [0. 0. 0. 0.]
a.shape                       # (3,)  — la forma
a.dtype                       # int64 — il tipo degli elementi</code></pre>
<p><code>shape</code> e <code>dtype</code> sono le prime due cose da controllare su qualsiasi array: metà dei bug di data science sono forme o tipi inattesi.</p>
`, more: `
<p>Il vero motivo per cui NumPy è così più veloce di una lista Python: un <code>ndarray</code> è un blocco di memoria <strong>contiguo</strong> con un tipo fisso e conosciuto in anticipo, mentre una lista Python è in realtà una lista di PUNTATORI a oggetti sparsi in memoria (ogni intero è un oggetto Python vero e proprio, con tutto il suo overhead). Quando NumPy somma due array, il processore può lavorare su blocchi di memoria contigui con istruzioni ottimizzate (SIMD); una lista Python richiede di "smontare" ogni oggetto, fare l'operazione in puro Python, rimontare il risultato — da cui la differenza di velocità anche di 100 volte.</p>
<p>Il <code>dtype</code> non è un dettaglio pignolo: <code>np.array([1, 2, 3])</code> crea un array di interi (<code>int64</code>), mentre <code>np.array([1.0, 2, 3])</code> — con un solo <code>1.0</code> — crea automaticamente un array di <code>float64</code>, perché NumPy sceglie il tipo più "ampio" capace di rappresentare tutti gli elementi senza perdita. Questo "type coercion" implicito è spesso comodo, ma può sorprendere: dividere due array di interi con <code>/</code> restituisce comunque float (divisione "vera"), mentre <code>//</code> forza la divisione intera troncata.</p>
<p>Puoi forzare il tipo esplicitamente con l'argomento <code>dtype</code> alla creazione: <code>np.array([1, 2, 3], dtype=np.float32)</code> usa 32 bit invece dei 64 di default — dimezza la memoria occupata, un dettaglio che conta quando lavori con milioni di righe (dataset di immagini, embedding), a costo di una precisione numerica leggermente minore.</p>
` },

    {
      type: "exercise", id: "np-01", kg: 5, title: "Primi array",
      task: `<p>Crea tre array:</p>
<ul>
<li><code>a</code>: dall'elenco <code>[3, 1, 4, 1, 5]</code></li>
<li><code>b</code>: i numeri da 0 a 20 escluso, a passi di 5 (usa <code>np.arange</code>)</li>
<li><code>c</code>: un array di 6 zeri</li>
</ul>`,
      starter: `import numpy as np

a = ...
b = ...
c = ...

print(a, b, c)`,
      check: `import numpy as np
assert 'a' in globals() and isinstance(a, np.ndarray) and list(a) == [3, 1, 4, 1, 5], "a deve essere np.array([3, 1, 4, 1, 5])"
assert 'b' in globals() and list(b) == [0, 5, 10, 15], "b deve essere [0 5 10 15]: np.arange(0, 20, 5)"
assert 'c' in globals() and c.shape == (6,) and float(c.sum()) == 0.0, "c deve essere np.zeros(6)"`,
      hint: `<p><code>np.arange(inizio, fine, passo)</code> — la fine è esclusa, come nello slicing.</p>`,
      solution: `import numpy as np

a = np.array([3, 1, 4, 1, 5])
b = np.arange(0, 20, 5)
c = np.zeros(6)

print(a, b, c)`
    },

    { type: "theory", title: "Shape e reshape", html: `
<p>Un array può avere più dimensioni: una matrice 3×4 ha <code>shape == (3, 4)</code> — 3 righe, 4 colonne. <code>reshape</code> ridispone gli stessi numeri in un'altra forma (il totale degli elementi deve tornare):</p>
<pre><code>m = np.arange(12).reshape(3, 4)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]</code></pre>
<p>Con <code>astype</code> converti il tipo: <code>m.astype(float)</code>. In data science le tue tabelle numeriche saranno quasi sempre matrici 2D: <strong>righe = osservazioni, colonne = variabili</strong>. Fissa questa convenzione ora.</p>
`, more: `
<p><code>reshape</code> non copia i dati quando può evitarlo: restituisce spesso una <strong>vista</strong> (view) sullo stesso blocco di memoria dell'array originale, semplicemente "letto" con una forma diversa. Questo significa che modificare un elemento della matrice reshaped può modificare anche l'array originale — una sorpresa per chi si aspetta che ogni operazione produca sempre una copia indipendente. Se ti serve la garanzia di una copia separata, usa esplicitamente <code>.copy()</code> dopo il reshape.</p>
<p>Un valore speciale accettato da <code>reshape</code> è <code>-1</code>: <code>arr.reshape(-1, 4)</code> significa "quante righe servono, tu (NumPy) calcolale automaticamente, io fisso solo le colonne a 4". È utilissimo quando conosci una sola dimensione della forma finale e non vuoi calcolare a mano l'altra (specialmente con array grandi, dove sbagliare il conto a mano è un classico).</p>
<p>La convenzione "righe = osservazioni, colonne = variabili" non è solo una buona pratica: è quella che scikit-learn <strong>impone</strong> per la matrice <code>X</code> passata a <code>.fit()</code> — un dataset con una sola feature deve comunque avere forma <code>(n_osservazioni, 1)</code>, non un vettore 1D semplice, un dettaglio che genera l'errore "Expected 2D array, got 1D array" più frequente per chi inizia con scikit-learn.</p>
` },

    {
      type: "exercise", id: "np-02", kg: 5, title: "Dai forma alla ghisa",
      task: `<p>Partendo da <code>np.arange(12)</code>:</p>
<ul>
<li><code>m</code>: la matrice 3×4 ottenuta con <code>reshape</code></li>
<li><code>m_float</code>: la stessa matrice convertita a <code>float</code></li>
<li><code>n_righe</code>: il numero di righe di <code>m</code>, letto da <code>m.shape</code> (non scriverlo a mano!)</li>
</ul>`,
      starter: `import numpy as np

m = ...
m_float = ...
n_righe = ...

print(m)
print(m_float.dtype, n_righe)`,
      check: `import numpy as np
assert 'm' in globals() and m.shape == (3, 4), "m deve avere shape (3, 4)"
assert m[2, 3] == 11, "m deve contenere 0..11 in ordine: usa np.arange(12).reshape(3, 4)"
assert 'm_float' in globals() and m_float.dtype.kind == 'f', "m_float deve avere dtype float: usa .astype(float)"
assert 'n_righe' in globals() and n_righe == 3, "n_righe deve essere 3, preso da m.shape[0]"`,
      hint: `<p><code>m.shape</code> è una tupla <code>(righe, colonne)</code>: il numero di righe è <code>m.shape[0]</code>.</p>`,
      solution: `import numpy as np

m = np.arange(12).reshape(3, 4)
m_float = m.astype(float)
n_righe = m.shape[0]

print(m)
print(m_float.dtype, n_righe)`
    },

    { type: "theory", title: "Indexing 2D: righe, colonne, blocchi", html: `
<p>In 2D si indicizza con <code>m[riga, colonna]</code>. Lo slicing funziona su ogni asse, e i due si combinano:</p>
<pre><code>m[0]        # prima riga (intera)
m[:, 1]     # seconda colonna — ":" significa "tutte le righe"
m[0:2, 1:3] # sottomatrice: righe 0-1, colonne 1-2
m[-1]       # ultima riga</code></pre>
<p>Nota: <code>m[:, 1]</code> restituisce un array 1D, non una "colonna verticale". La stessa sintassi <code>[righe, colonne]</code> la ritroverai in Pandas con <code>.iloc</code>.</p>
`, more: `
<p>Come per <code>reshape</code>, lo slicing di un array NumPy restituisce di norma una <strong>vista</strong>, non una copia: <code>sotto = m[0:2, 0:2]; sotto[0,0] = 999</code> modifica anche <code>m</code> originale. Le liste Python NON si comportano così (<code>lista[0:2]</code> crea sempre una nuova lista indipendente): è una delle differenze di comportamento più insidiose per chi passa da liste a NumPy, e la fonte di molti bug "il mio array è cambiato da solo". Se vuoi una copia indipendente, <code>m[0:2, 0:2].copy()</code>.</p>
<p>Se vuoi una <strong>colonna verticale vera</strong> (forma <code>(n, 1)</code> invece di <code>(n,)</code>), serve un asse in più: <code>m[:, 1:2]</code> (slice invece di indice singolo) o <code>m[:, [1]]</code> (fancy indexing con lista di un elemento) restituiscono entrambi una vera matrice a una colonna, mentre <code>m[:, 1]</code> "appiattisce" la dimensione. La differenza conta quando devi poi fare operazioni matriciali che richiedono forme compatibili.</p>
<p>Puoi anche assegnare con lo slicing: <code>m[:, 0] = 0</code> azzera l'intera prima colonna in un colpo solo, sfruttando il broadcasting (un singolo valore si "propaga" su tutte le posizioni selezionate) — lo stesso principio della sala sul broadcasting, applicato qui alla scrittura invece che alla lettura.</p>
` },

    {
      type: "exercise", id: "np-03", kg: 10, title: "Chirurgia sulla matrice",
      task: `<p>Data la matrice <code>m</code> (4×5, già creata), estrai:</p>
<ul>
<li><code>riga2</code>: la terza riga (indice 2)</li>
<li><code>col_ultima</code>: l'ultima colonna</li>
<li><code>blocco</code>: la sottomatrice 2×2 in alto a destra (prime due righe, ultime due colonne)</li>
</ul>`,
      setup: `import numpy as np
m = np.arange(20).reshape(4, 5)`,
      starter: `# m e' gia' definita: una matrice 4x5
# [[ 0  1  2  3  4]
#  [ 5  6  7  8  9]
#  [10 11 12 13 14]
#  [15 16 17 18 19]]
print(m)

riga2 = ...
col_ultima = ...
blocco = ...`,
      check: `import numpy as np
assert 'riga2' in globals() and list(riga2) == [10, 11, 12, 13, 14], "riga2 deve essere [10 11 12 13 14]: m[2]"
assert 'col_ultima' in globals() and list(col_ultima) == [4, 9, 14, 19], "col_ultima deve essere [4 9 14 19]: m[:, -1]"
assert 'blocco' in globals() and blocco.shape == (2, 2) and blocco.tolist() == [[3, 4], [8, 9]], "blocco deve essere [[3 4],[8 9]]: righe 0:2, colonne -2: (le ultime due)"`,
      hint: `<p>Per le ultime due colonne lo slice è <code>-2:</code>. Quindi <code>m[0:2, -2:]</code> — combinare slice negativi e positivi è normale.</p>`,
      solution: `print(m)

riga2 = m[2]
col_ultima = m[:, -1]
blocco = m[0:2, -2:]`
    },

    { type: "theory", title: "Vettorizzazione: mai più cicli sui numeri", html: `
<p>La superpotenza di NumPy: le operazioni si applicano <strong>a tutto l'array in un colpo</strong>, senza cicli <code>for</code>.</p>
<pre><code>euro = np.array([10, 20, 40])
euro * 1.1            # [11.  22.  44. ] — un rincaro del 10% su tutti
euro + 5              # somma elemento per elemento
np.sqrt(euro)         # funzioni matematiche vettorizzate</code></pre>
<p>Un ciclo Python su un milione di numeri è ~100 volte più lento della stessa operazione vettorizzata. In palestra vale la regola: <strong>se stai scrivendo <code>for</code> su un array, fermati e cerca l'operazione vettorizzata</strong>.</p>
`, more: `
<p>Le funzioni vettorizzate di NumPy si chiamano <strong>ufunc</strong> (universal function): <code>np.sqrt</code>, <code>np.exp</code>, <code>np.log</code>, <code>np.sin</code> sono tutte ufunc, implementate in C e applicate elemento per elemento con lo stesso meccanismo delle operazioni aritmetiche di base. Puoi anche costruire una tua ufunc da una funzione Python qualsiasi con <code>np.vectorize</code> — comodo per la sintassi, ma attenzione: <code>np.vectorize</code> NON accelera nulla, internamente esegue comunque un ciclo Python mascherato. È uno zucchero sintattico, non un'ottimizzazione reale.</p>
<p>Quando un'operazione richiede davvero un ciclo esplicito (una logica troppo complessa per essere espressa con operazioni vettoriali dirette), un compromesso a metà strada è <code>np.frompyfunc</code> o, per i casi più pesanti, librerie come <code>numba</code> (che compila funzioni Python in codice macchina al volo) — strumenti che vanno oltre questa palestra, ma buoni da sapere che esistono quando la vettorizzazione pura non basta.</p>
<p>Una regola pratica per riconoscere se un problema è vettorizzabile: se la stessa operazione si applica a OGNI elemento indipendentemente dagli altri (o dipende solo da una finestra fissa, come nella convoluzione), quasi sempre esiste una via vettorizzata. Se invece il calcolo di un elemento dipende dal RISULTATO del calcolo dell'elemento precedente (come in una somma cumulativa scritta a mano, o in una simulazione sequenziale), la vettorizzazione diretta è più difficile — anche se spesso NumPy offre comunque una funzione dedicata per quei casi specifici (es. <code>np.cumsum</code>, che vedrai più avanti in questa sala).</p>
` },

    {
      type: "exercise", id: "np-04", kg: 10, title: "Da Celsius a Fahrenheit, in blocco",
      task: `<p>Hai le temperature <code>celsius</code> di una settimana. Senza usare cicli:</p>
<ul>
<li><code>fahrenheit</code>: conversione con la formula F = C × 9/5 + 32</li>
<li><code>scarti</code>: la differenza di ogni valore Celsius dalla media (usa <code>celsius.mean()</code>)</li>
</ul>`,
      starter: `import numpy as np

celsius = np.array([18.0, 21.5, 25.0, 19.5, 23.0])

fahrenheit = ...
scarti = ...

print(fahrenheit)
print(scarti)`,
      check: `import numpy as np
assert 'fahrenheit' in globals() and np.allclose(fahrenheit, [64.4, 70.7, 77.0, 67.1, 73.4]), "fahrenheit non torna: la formula e' celsius * 9/5 + 32, applicata all'array intero"
assert 'scarti' in globals() and np.allclose(scarti, celsius - 21.4), "scarti deve essere celsius - celsius.mean()"
assert abs(float(np.sum(scarti))) < 1e-9, "Gli scarti dalla media devono sommare a zero: proprieta' della media!"`,
      hint: `<p>Scrivi le formule come se <code>celsius</code> fosse un numero solo: <code>celsius * 9/5 + 32</code>. NumPy le applica a tutti gli elementi.</p>`,
      solution: `import numpy as np

celsius = np.array([18.0, 21.5, 25.0, 19.5, 23.0])

fahrenheit = celsius * 9/5 + 32
scarti = celsius - celsius.mean()

print(fahrenheit)
print(scarti)`
    },

    { type: "theory", title: "Maschere booleane: il filtro universale", html: `
<p>Confrontare un array con un valore produce un array di <code>True</code>/<code>False</code> — una <strong>maschera</strong>. Usata come indice, seleziona solo gli elementi <code>True</code>:</p>
<pre><code>t = np.array([820, 950, 1100, 740, 600])
t &gt; 800          # [ True  True  True False False]
t[t &gt; 800]       # [ 820  950 1100]
(t &gt; 800).sum()  # 3 — True vale 1: contare = sommare la maschera!</code></pre>
<p>Le condizioni si combinano con <code>&amp;</code> (e), <code>|</code> (o), <code>~</code> (non), <strong>ciascuna tra parentesi</strong>: <code>t[(t &gt; 700) &amp; (t &lt; 1000)]</code>. Questo è IL pattern di selezione dati: in Pandas sarà identico.</p>
`, more: `
<p>Perché non si può scrivere <code>700 &lt; t &lt; 1000</code> come faresti con un numero normale in Python? Perché quella sintassi Python (i confronti incatenati) funziona solo su valori singoli, non su array — e perché non si possono usare <code>and</code>/<code>or</code> nativi di Python al posto di <code>&amp;</code>/<code>|</code>: <code>and</code>/<code>or</code> richiedono di sapere se un intero oggetto è "vero" o "falso" in un colpo solo, ma un array con più di un elemento non ha un singolo valore di verità univoco (è vero SOLO per alcuni elementi e falso per altri). Da qui l'errore tipico <code>"The truth value of an array with more than one element is ambiguous"</code> quando per errore si scrive <code>and</code> invece di <code>&amp;</code>.</p>
<p>Le parentesi attorno a ogni condizione non sono uno stile: sono OBBLIGATORIE per la precedenza degli operatori in Python. <code>&amp;</code> ha precedenza più alta di <code>&gt;</code>, quindi <code>t &gt; 700 &amp; t &lt; 1000</code> senza parentesi verrebbe letto come <code>t &gt; (700 &amp; t) &lt; 1000</code> — un'espressione con un significato completamente diverso da quello voluto, che nella migliore delle ipotesi produce un errore, nella peggiore un risultato silenziosamente sbagliato.</p>
<p>Oltre a filtrare con una maschera, puoi CONTARE quante osservazioni la soddisfano senza materializzare il sotto-array: <code>(condizione).sum()</code> (già visto) o, in modo equivalente ma più esplicito, <code>np.count_nonzero(condizione)</code> — utile perché il nome comunica meglio l'intento a chi legge il codice per la prima volta.</p>
` },

    {
      type: "exercise", id: "np-05", kg: 10, title: "Setaccia i tempi di risposta",
      task: `<p>Hai <code>t</code>, i tempi di risposta (ms) di 10 chiamate a un'API. Calcola:</p>
<ul>
<li><code>lente</code>: l'array delle chiamate con tempo maggiore di 900</li>
<li><code>n_veloci</code>: <em>quante</em> chiamate sono sotto 700 (un numero intero, contato con la maschera)</li>
<li><code>medie</code>: le chiamate tra 700 e 900 <strong>compresi</strong> (due condizioni con <code>&amp;</code>)</li>
</ul>`,
      starter: `import numpy as np

t = np.array([820, 950, 1100, 740, 600, 880, 1300, 650, 900, 710])

lente = ...
n_veloci = ...
medie = ...

print(lente, n_veloci, medie)`,
      check: `import numpy as np
assert 'lente' in globals() and sorted(lente.tolist()) == [950, 1100, 1300], "lente deve contenere 950, 1100, 1300"
assert 'n_veloci' in globals() and int(n_veloci) == 2, "n_veloci deve essere 2 (i valori 600 e 650): somma la maschera t < 700"
assert 'medie' in globals() and sorted(medie.tolist()) == [710, 740, 820, 880, 900], "medie deve contenere 710, 740, 820, 880, 900: (t >= 700) & (t <= 900), parentesi obbligatorie"`,
      hint: `<p>Contare: <code>(t &lt; 700).sum()</code>. Doppia condizione: <code>t[(t &gt;= 700) &amp; (t &lt;= 900)]</code> — senza parentesi Python legge male le precedenze.</p>`,
      solution: `import numpy as np

t = np.array([820, 950, 1100, 740, 600, 880, 1300, 650, 900, 710])

lente = t[t > 900]
n_veloci = (t < 700).sum()
medie = t[(t >= 700) & (t <= 900)]

print(lente, n_veloci, medie)`
    },

    { type: "theory", title: "Aggregazioni e l'asse giusto", html: `
<p>Le aggregazioni riducono un array a numeri: <code>.sum()</code>, <code>.mean()</code>, <code>.std()</code>, <code>.min()</code>, <code>.max()</code>. Su una matrice, il parametro <code>axis</code> decide <strong>lungo quale dimensione</strong> collassare:</p>
<pre><code>m.mean()          # media di tutto
m.mean(axis=0)    # collassa le righe → una media PER COLONNA
m.mean(axis=1)    # collassa le colonne → una media PER RIGA</code></pre>
<p>Il trucco per non confondersi: <code>axis=0</code> "schiaccia verticalmente" (rimangono le colonne), <code>axis=1</code> "schiaccia orizzontalmente" (rimangono le righe). Con righe=soggetti e colonne=variabili: <code>axis=0</code> dà la media di ogni variabile, <code>axis=1</code> la media di ogni soggetto.</p>
`, more: `
<p>Un modo alternativo (e per molti più intuitivo) di ricordare la convenzione di <code>axis</code>: il numero indica QUALE dimensione della <code>shape</code> "sparisce" dal risultato. Una matrice con <code>shape (4, 3)</code> ha <code>axis=0</code> di lunghezza 4 e <code>axis=1</code> di lunghezza 3; <code>m.sum(axis=0)</code> elimina la dimensione 0 (quella da 4) e restituisce un array di 3 valori (uno per colonna), <code>m.sum(axis=1)</code> elimina la dimensione 1 (quella da 3) e restituisce un array di 4 valori (uno per riga). La regola generalizza a più di 2 dimensioni, dove il trucco "verticale/orizzontale" smette di funzionare visivamente ma questo ragionamento sulla shape resta valido.</p>
<p>Con <code>keepdims=True</code>, l'aggregazione NON elimina la dimensione ma la riduce a lunghezza 1 (<code>m.sum(axis=1, keepdims=True)</code> su una matrice <code>(4,3)</code> dà shape <code>(4,1)</code> invece di <code>(4,)</code>): utilissimo quando poi vuoi ri-sottrarre il risultato dalla matrice originale via broadcasting, perché le shape <code>(4,1)</code> e <code>(4,3)</code> si combinano automaticamente, mentre <code>(4,)</code> e <code>(4,3)</code> spesso NON lo fanno nella direzione che ti aspetti.</p>
` },

    {
      type: "exercise", id: "np-06", kg: 15, title: "Medie per riga e per colonna",
      task: `<p><code>punteggi</code> è una matrice 4×3: 4 atleti (righe) × 3 prove di un test fisico (colonne). Calcola:</p>
<ul>
<li><code>media_prova</code>: la media di ogni <strong>prova</strong> (deve avere 3 valori)</li>
<li><code>media_atleti</code>: la media di ogni <strong>atleta</strong> (4 valori)</li>
<li><code>prova_migliore</code>: l'indice della prova con media più alta (usa <code>np.argmax</code>)</li>
</ul>`,
      starter: `import numpy as np

punteggi = np.array([
    [7, 9, 6],
    [8, 6, 7],
    [9, 8, 9],
    [4, 5, 6],
])

media_prova = ...
media_atleti = ...
prova_migliore = ...

print(media_prova, media_atleti, prova_migliore)`,
      check: `import numpy as np
assert 'media_prova' in globals() and media_prova.shape == (3,), "media_prova deve avere 3 valori (uno per prova/colonna): axis=0"
assert np.allclose(media_prova, [7.0, 7.0, 7.0]), "media_prova deve essere [7. 7. 7.]"
assert 'media_atleti' in globals() and np.allclose(media_atleti, [22/3, 7.0, 26/3, 5.0]), "media_atleti deve avere 4 valori (uno per riga): axis=1"
assert 'prova_migliore' in globals() and int(prova_migliore) == 0, "prova_migliore: np.argmax(media_prova) — a parita' di valore argmax restituisce il primo, cioe' 0"`,
      hint: `<p>Vuoi una media per colonna? Le righe devono sparire: <code>axis=0</code>. Una per riga? <code>axis=1</code>.</p>`,
      solution: `import numpy as np

punteggi = np.array([
    [7, 9, 6],
    [8, 6, 7],
    [9, 8, 9],
    [4, 5, 6],
])

media_prova = punteggi.mean(axis=0)
media_atleti = punteggi.mean(axis=1)
prova_migliore = np.argmax(media_prova)

print(media_prova, media_atleti, prova_migliore)`
    },

    { type: "theory", title: "Broadcasting: forme diverse che collaborano", html: `
<p>NumPy può operare tra array di forme diverse "allungando" automaticamente le dimensioni compatibili. Esempio principe: sottrarre da una matrice (4×3) un vettore di 3 valori — il vettore viene applicato <strong>a ogni riga</strong>:</p>
<pre><code>m.shape           # (4, 3)
medie = m.mean(axis=0)   # shape (3,)
centrata = m - medie     # il vettore si "propaga" su tutte le 4 righe</code></pre>
<p>Questo gesto — <strong>centrare le colonne</strong> sottraendo la media di ciascuna — è la base della standardizzazione che userai in scikit-learn. La regola di compatibilità: le forme si confrontano da destra, e ogni dimensione deve essere uguale oppure 1.</p>
`, more: `
<p>La regola di compatibilità per esteso: NumPy confronta le shape dei due array partendo dall'ULTIMA dimensione e andando a ritroso. Due dimensioni sono compatibili se sono uguali, oppure se UNA delle due è 1 (in quel caso viene "ripetuta" virtualmente per combaciare con l'altra — senza realmente copiare i dati in memoria, un dettaglio che rende il broadcasting anche efficiente, non solo comodo). Se una shape ha meno dimensioni dell'altra, viene completata con 1 impliciti a sinistra: una shape <code>(3,)</code> è trattata come <code>(1, 3)</code> quando combinata con una matrice <code>(4, 3)</code>.</p>
<p>Un errore di broadcasting classico: sottrarre un vettore di shape <code>(4,)</code> (uno per RIGA) da una matrice <code>(4, 3)</code>, aspettandosi che si applichi riga per riga. NON funziona: NumPy prova ad allineare da destra, quindi <code>(4,)</code> viene confrontato con la dimensione da 3 (le colonne), non con quella da 4 — le due shape non sono compatibili e NumPy solleva <code>ValueError: operands could not be broadcast together</code>. Per sottrarre "un valore per riga" serve esplicitamente una colonna verticale: <code>vettore.reshape(-1, 1)</code>, shape <code>(4, 1)</code>, che SI allinea correttamente per broadcasting su una matrice <code>(4, 3)</code>.</p>
<p>Il broadcasting è lo stesso identico meccanismo, generalizzato, che permette a <code>array + 5</code> (un array più uno scalare) di funzionare: lo scalare viene trattato come shape <code>()</code>, compatibile per definizione con qualunque altra shape.</p>
` },

    {
      type: "exercise", id: "np-07", kg: 15, title: "Centra e standardizza",
      task: `<p>Data la matrice <code>X</code> (5 persone × 2 misure: altezza in cm, peso in kg), calcola con il broadcasting:</p>
<ul>
<li><code>X_centrata</code>: X meno la media di ogni colonna</li>
<li><code>X_std</code>: X standardizzata, cioè <code>(X - media) / deviazione standard</code> per colonna (z-score)</li>
</ul>
<p>Verifica mentale: dopo, ogni colonna di <code>X_std</code> ha media ≈ 0 e std ≈ 1.</p>`,
      starter: `import numpy as np

X = np.array([
    [170.0,  60.0],
    [180.0,  80.0],
    [165.0,  55.0],
    [175.0,  70.0],
    [160.0,  50.0],
])

X_centrata = ...
X_std = ...

print(X_std.mean(axis=0))  # atteso: ~[0. 0.]
print(X_std.std(axis=0))   # atteso: ~[1. 1.]`,
      check: `import numpy as np
assert 'X_centrata' in globals() and np.allclose(X_centrata.mean(axis=0), [0, 0]), "Le colonne di X_centrata devono avere media 0: sottrai X.mean(axis=0)"
assert 'X_std' in globals() and np.allclose(X_std.mean(axis=0), [0, 0]) and np.allclose(X_std.std(axis=0), [1, 1]), "X_std deve avere media 0 e std 1 per colonna: (X - X.mean(axis=0)) / X.std(axis=0)"`,
      hint: `<p><code>X - X.mean(axis=0)</code> sfrutta il broadcasting: il vettore delle 2 medie si sottrae a tutte le 5 righe. Poi dividi per <code>X.std(axis=0)</code>.</p>`,
      solution: `import numpy as np

X = np.array([
    [170.0,  60.0],
    [180.0,  80.0],
    [165.0,  55.0],
    [175.0,  70.0],
    [160.0,  50.0],
])

X_centrata = X - X.mean(axis=0)
X_std = X_centrata / X.std(axis=0)

print(X_std.mean(axis=0))
print(X_std.std(axis=0))`
    },

    { type: "theory", title: "Trovare posizioni: argmax e argsort", html: `
<p>Spesso non vuoi il valore massimo ma <strong>dove sta</strong>: <code>np.argmax(a)</code> dà l'indice del massimo, <code>np.argsort(a)</code> dà gli indici che ordinerebbero l'array (crescente).</p>
<pre><code>vendite = np.array([45, 120, 88, 30])
np.argmax(vendite)        # 1
ordine = np.argsort(vendite)      # [3 0 2 1] — dal piu' piccolo
ordine[::-1]                      # [1 2 0 3] — dal piu' grande
vendite[np.argsort(vendite)[::-1][:2]]   # i 2 valori top: [120 88]</code></pre>
<p>Il pattern "indici del top-k" (<code>argsort</code> + inversione <code>[::-1]</code> + slice) è onnipresente: prodotti più venduti, feature più importanti, errori più grandi.</p>
`, more: `
<p>Su una matrice, <code>argmax</code>/<code>argsort</code> accettano anch'essi un parametro <code>axis</code>: <code>np.argmax(matrice, axis=1)</code> trova, per OGNI riga, l'indice di colonna col valore massimo — utilissimo, ad esempio, per estrarre "la classe con probabilità più alta" da una matrice di probabilità dove ogni riga è un'osservazione e ogni colonna una classe (esattamente ciò che serve dopo <code>predict_proba</code> in scikit-learn).</p>
<p>Quando i valori hanno dei pareggi (più elementi identici al massimo), <code>argmax</code> restituisce sempre l'indice del <strong>primo</strong> che incontra scorrendo l'array — un comportamento deterministico e documentato, non casuale, ma da tenere a mente se ti aspetti "un qualsiasi" indice tra i pareggiati.</p>
<p>Per un ordinamento "quasi completo" (i k valori più piccoli, senza ordinarli perfettamente tra loro), <code>np.argpartition(array, k)</code> è più veloce di un <code>argsort</code> completo su array molto grandi: <code>argsort</code> ordina TUTTO (costo O(n log n)), <code>argpartition</code> garantisce solo che i primi k elementi siano i k più piccoli, in un ordine qualsiasi tra loro (costo O(n)) — una differenza che conta quando n è nell'ordine dei milioni e ti serve solo "i primi 10", non la classifica intera.</p>
` },

    {
      type: "exercise", id: "np-08", kg: 20, title: "Il podio dei prodotti",
      task: `<p>Hai due array paralleli: <code>prodotti</code> e <code>vendite</code>. Trova:</p>
<ul>
<li><code>piu_venduto</code>: il <strong>prodotto</strong> (stringa) con vendite massime</li>
<li><code>podio</code>: array dei 3 prodotti più venduti, in ordine decrescente di vendite</li>
</ul>`,
      starter: `import numpy as np

prodotti = np.array(["cuffie", "mouse", "webcam", "borraccia", "lampada", "zaino"])
vendite  = np.array([120, 88, 45, 95, 130, 62])

piu_venduto = ...
podio = ...

print(piu_venduto)
print(podio)`,
      check: `import numpy as np
assert 'piu_venduto' in globals() and str(piu_venduto) == "lampada", "piu_venduto deve essere 'lampada' (130): prodotti[np.argmax(vendite)]"
assert 'podio' in globals() and list(podio) == ["lampada", "cuffie", "borraccia"], "podio deve essere ['lampada', 'cuffie', 'borraccia']: usa argsort, inverti con [::-1], prendi i primi 3, e indicizza prodotti"`,
      hint: `<p>Un array può indicizzarne un altro: <code>prodotti[np.argsort(vendite)[::-1][:3]]</code>. Gli indici ordinati per vendite pescano i prodotti giusti.</p>`,
      solution: `import numpy as np

prodotti = np.array(["cuffie", "mouse", "webcam", "borraccia", "lampada", "zaino"])
vendite  = np.array([120, 88, 45, 95, 130, 62])

piu_venduto = prodotti[np.argmax(vendite)]
podio = prodotti[np.argsort(vendite)[::-1][:3]]

print(piu_venduto)
print(podio)`
    },

    { type: "theory", title: "Numeri casuali riproducibili", html: `
<p>Simulazioni, campionamenti, split train/test: il caso serve ovunque, ma deve essere <strong>riproducibile</strong>. Il generatore moderno si crea con un seme fisso:</p>
<pre><code>rng = np.random.default_rng(42)
rng.integers(1, 7, size=10)    # 10 lanci di dado (7 escluso)
rng.normal(0, 1, size=100)     # 100 valori da una normale
rng.choice(arr, size=5)        # campiona 5 elementi</code></pre>
<p>Stesso seme → stessi numeri, sempre. È ciò che rende i tuoi esperimenti (e le tue demo!) replicabili. Combinato con le maschere booleane, permette di stimare probabilità contando.</p>
`, more: `
<p><code>np.random.default_rng(seme)</code> è l'API "moderna" (introdotta nel 2019), pensata per sostituire la vecchia <code>np.random.seed(seme)</code> globale seguita da chiamate dirette come <code>np.random.randint(...)</code>. Il problema della vecchia API: modificava uno STATO GLOBALE condiviso — se due parti del tuo programma (o due librerie diverse) chiamavano funzioni random senza coordinarsi, l'ordine di esecuzione poteva cambiare i risultati in modo non riproducibile. Un oggetto <code>rng</code> locale, passato esplicitamente dove serve, evita completamente questo problema: ogni generatore ha il proprio stato indipendente.</p>
<p>Oltre a <code>integers</code> e <code>normal</code>, un generatore offre decine di distribuzioni: <code>rng.uniform(basso, alto, size)</code> (uniforme continua), <code>rng.binomial(n, p, size)</code> (lanci di moneta ripetuti), <code>rng.poisson(lam, size)</code> (eventi rari nel tempo) — ciascuna utile per simulare fenomeni diversi. <code>rng.shuffle(array)</code> mescola un array SUL POSTO (lo modifica direttamente); <code>rng.permutation(array)</code> restituisce invece una NUOVA versione mescolata, lasciando l'originale intatto — la stessa distinzione vista tra <code>.sort()</code> e <code>sorted()</code> nel riscaldamento.</p>
<p>Un seme fissato garantisce la riproducibilità SOLO all'interno della stessa versione di NumPy: aggiornamenti importanti della libreria hanno occasionalmente cambiato l'algoritmo generatore sottostante, producendo sequenze diverse a parità di seme. Per una riproducibilità garantita a lungo termine (es. per un paper scientifico), è buona norma fissare anche la versione esatta di NumPy usata.</p>
` },

    {
      type: "exercise", id: "np-09", kg: 20, title: "Casinò riproducibile",
      task: `<p>Con il generatore <code>rng</code> già creato (seme 7):</p>
<ul>
<li><code>lanci</code>: 1000 lanci di un dado a 6 facce con <code>rng.integers</code> (attenzione: l'estremo destro è escluso!)</li>
<li><code>prop_sei</code>: la proporzione di 6 usciti (maschera + <code>.mean()</code> — la media di una maschera È la proporzione)</li>
<li><code>somma_alta</code>: quanti lanci valgono 5 <strong>o</strong> 6</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(7)`,
      starter: `# rng e' gia' creato con seme 7: usa QUESTO generatore
lanci = ...
prop_sei = ...
somma_alta = ...

print(prop_sei, somma_alta)`,
      check: `import numpy as np
assert 'lanci' in globals() and len(lanci) == 1000 and int(lanci.min()) >= 1 and int(lanci.max()) <= 6, "lanci: rng.integers(1, 7, size=1000) — con 7 escluso ottieni 1..6"
assert 'prop_sei' in globals() and abs(float(prop_sei) - float((lanci == 6).mean())) < 1e-12, "prop_sei deve essere (lanci == 6).mean()"
assert 0.1 < float(prop_sei) < 0.25, "Con seme 7 la proporzione di 6 deve venire vicina a 1/6"
assert 'somma_alta' in globals() and int(somma_alta) == int(((lanci == 5) | (lanci == 6)).sum()), "somma_alta: somma la maschera (lanci == 5) | (lanci == 6)"`,
      hint: `<p>La media di un array di True/False è la frazione di True: <code>(lanci == 6).mean()</code>. Per il conteggio doppio: <code>((lanci == 5) | (lanci == 6)).sum()</code>.</p>`,
      solution: `lanci = rng.integers(1, 7, size=1000)
prop_sei = (lanci == 6).mean()
somma_alta = ((lanci == 5) | (lanci == 6)).sum()

print(prop_sei, somma_alta)`
    },

    { type: "theory", title: "Prodotto scalare: la somma pesata in un colpo", html: `
<p>Moltiplicare due vettori elemento per elemento e poi sommare — prezzi per quantità, pesi per punteggi — è così frequente da avere un nome ed un operatore dedicato: il <strong>prodotto scalare</strong>.</p>
<pre><code>prezzi = np.array([2.0, 5.0, 1.5])
quantita = np.array([3, 1, 4])
np.dot(prezzi, quantita)     # 2*3 + 5*1 + 1.5*4 = 17.0
prezzi @ quantita            # stesso risultato, sintassi alternativa</code></pre>
<p>Con le matrici, <code>@</code> è la <strong>moltiplicazione riga per colonna</strong>: ogni riga della prima matrice si combina con ogni colonna della seconda. È l'operazione che sta, letteralmente, dentro ogni rete neurale e dentro la regressione lineare che vedrai in scikit-learn.</p>
`, more: `
<p>Una trappola comune per chi inizia: <code>*</code> tra due array NumPy NON è la moltiplicazione matriciale — è la moltiplicazione <strong>elemento per elemento</strong> (element-wise), che richiede le stesse identiche regole del broadcasting viste in questa sala. <code>@</code> (o, equivalentemente, <code>np.matmul</code>) è invece l'operazione dell'algebra lineare vera, con le sue regole di compatibilità delle dimensioni: per moltiplicare una matrice <code>(m, k)</code> per una <code>(k, n)</code>, il numero di colonne della prima DEVE combaciare col numero di righe della seconda, e il risultato ha shape <code>(m, n)</code>.</p>
<p>Perché questa distinzione conta così tanto nella pratica: dentro un livello di una rete neurale, l'operazione <code>input @ pesi + bias</code> è esattamente <code>@</code> (moltiplicazione matriciale, che combina ogni feature dell'input con ogni peso), MAI <code>*</code>. Confondere i due operatori produce codice che gira senza errori (a volte le shape "combaciano per caso" con entrambe le interpretazioni) ma calcola qualcosa di completamente diverso da quello che intendevi — uno dei bug più insidiosi perché silenzioso.</p>
<p>Per array 1D, <code>@</code> calcola il prodotto scalare (uno scalare, non una matrice) esattamente come <code>np.dot</code>: <code>a @ b</code> e <code>np.dot(a, b)</code> sono intercambiabili su vettori, ma <code>@</code> è la notazione preferita nel codice moderno perché si legge meglio quando le espressioni si allungano (<code>X @ pesi</code> invece di <code>np.dot(X, pesi)</code>).</p>
` },

    {
      type: "exercise", id: "np-10", kg: 15, title: "Lo scontrino via matrice",
      task: `<p>Un carrello ha <code>quantita</code> (pezzi per prodotto) e <code>prezzi</code> (prezzo unitario). Calcola:</p>
<ul>
<li><code>totale</code>: il totale dello scontrino con il prodotto scalare (non un ciclo!)</li>
<li><code>matrice_costi</code>: usando <code>@</code>, il totale per <strong>ogni cliente</strong> nella matrice <code>carrelli</code> (3 clienti × 4 prodotti) moltiplicata per <code>prezzi</code> (deve dare un array di 3 totali)</li>
</ul>`,
      starter: `import numpy as np

quantita = np.array([2, 1, 3, 0])
prezzi = np.array([1.5, 3.0, 0.8, 5.0])

carrelli = np.array([
    [2, 1, 3, 0],
    [0, 2, 1, 1],
    [1, 1, 1, 1],
])

totale = ...
matrice_costi = ...

print(totale)
print(matrice_costi)`,
      check: `import numpy as np
assert 'totale' in globals() and abs(float(totale) - 8.4) < 1e-9, "totale: np.dot(quantita, prezzi) oppure quantita @ prezzi — deve fare 8.4"
assert 'matrice_costi' in globals() and np.allclose(matrice_costi, [8.4, 11.8, 10.3]), "matrice_costi: carrelli @ prezzi — un totale per ogni riga (cliente)"`,
      hint: `<p><code>quantita @ prezzi</code> per un singolo carrello; <code>carrelli @ prezzi</code> applica lo stesso prodotto scalare a ogni riga della matrice in un colpo solo.</p>`,
      solution: `import numpy as np

quantita = np.array([2, 1, 3, 0])
prezzi = np.array([1.5, 3.0, 0.8, 5.0])

carrelli = np.array([
    [2, 1, 3, 0],
    [0, 2, 1, 1],
    [1, 1, 1, 1],
])

totale = quantita @ prezzi
matrice_costi = carrelli @ prezzi

print(totale)
print(matrice_costi)`
    },

    { type: "theory", title: "Valori distinti e concatenazione", html: `
<p>Due attrezzi da cassetta degli attrezzi quotidiana. <code>np.unique</code> restituisce i valori distinti <strong>ordinati</strong>, e con <code>return_counts=True</code> conta anche quante volte compaiono:</p>
<pre><code>taglie = np.array(["M", "S", "M", "L", "S", "M"])
np.unique(taglie)                          # ['L' 'M' 'S']
valori, conteggi = np.unique(taglie, return_counts=True)</code></pre>
<p>Per unire array che arrivano separati (due settimane di vendite, due batch di misure) si usa <code>np.concatenate</code> (o le scorciatoie <code>np.hstack</code>/<code>np.vstack</code> per orizzontale/verticale):</p>
<pre><code>sett1 = np.array([10, 12, 9])
sett2 = np.array([11, 14])
np.concatenate([sett1, sett2])   # [10 12  9 11 14]</code></pre>
`, more: `
<p><code>np.unique</code> restituisce sempre i valori <strong>ordinati</strong>: anche su un array di stringhe, l'ordine è alfabetico, indipendentemente da come comparivano nell'array originale. Con <code>return_index=True</code> ottieni anche gli indici della PRIMA occorrenza di ciascun valore distinto — utile per sapere non solo "quali valori ci sono" ma anche "dove sono comparsi la prima volta".</p>
<p><code>np.concatenate</code> richiede che tutti gli array condividano le stesse dimensioni tranne quella lungo cui li stai unendo: concatenare due matrici <code>(3, 4)</code> e <code>(2, 4)</code> lungo <code>axis=0</code> (righe, di default) dà una <code>(5, 4)</code> — ma provare a concatenarle lungo <code>axis=1</code> (colonne) fallisce, perché 3 e 2 righe non sono compatibili in quella direzione. <code>np.vstack</code> e <code>np.hstack</code> sono scorciatoie leggibili per i due casi più comuni: impilare "verticalmente" (righe sopra righe) o "orizzontalmente" (colonne accanto a colonne), senza dover specificare esplicitamente l'<code>axis</code>.</p>
<p>Un'operazione imparentata ma diversa è <code>np.stack</code> (senza prefisso v/h): a differenza di <code>concatenate</code>, CREA una dimensione completamente nuova invece di unire lungo una esistente — <code>np.stack([a, b])</code> su due array 1D di lunghezza 5 produce una matrice <code>(2, 5)</code>, mentre <code>np.concatenate([a, b])</code> sugli stessi due array darebbe un unico vettore 1D di lunghezza 10. La distinzione tra "aggiungere una dimensione" e "estendere una dimensione esistente" è sottile ma importante quando prepari batch di dati per un modello.</p>
` },

    {
      type: "exercise", id: "np-11", kg: 15, title: "Taglie e settimane",
      task: `<p>Fai due cose indipendenti:</p>
<ul>
<li>Da <code>taglie</code>: <code>valori</code> (le taglie distinte, ordinate) e <code>conteggi</code> (quante per taglia), con <code>np.unique(..., return_counts=True)</code></li>
<li><code>totale_mese</code>: concatena <code>sett1</code>, <code>sett2</code>, <code>sett3</code> in un unico array con <code>np.concatenate</code></li>
</ul>`,
      starter: `import numpy as np

taglie = np.array(["M", "S", "M", "L", "S", "M", "L", "L"])
sett1 = np.array([10, 12, 9])
sett2 = np.array([11, 14])
sett3 = np.array([13, 8, 15])

valori = ...
conteggi = ...
totale_mese = ...

print(valori, conteggi)
print(totale_mese)`,
      check: `import numpy as np
assert 'valori' in globals() and list(valori) == ["L", "M", "S"], "valori: np.unique(taglie) ordina alfabeticamente: L, M, S"
assert 'conteggi' in globals() and list(conteggi) == [3, 3, 2], "conteggi: 3 L, 3 M, 2 S, nello stesso ordine di valori"
assert 'totale_mese' in globals() and list(totale_mese) == [10, 12, 9, 11, 14, 13, 8, 15], "totale_mese: np.concatenate([sett1, sett2, sett3])"`,
      hint: `<p><code>valori, conteggi = np.unique(taglie, return_counts=True)</code> restituisce due array allineati. Per unire tre array: <code>np.concatenate([sett1, sett2, sett3])</code>.</p>`,
      solution: `import numpy as np

taglie = np.array(["M", "S", "M", "L", "S", "M", "L", "L"])
sett1 = np.array([10, 12, 9])
sett2 = np.array([11, 14])
sett3 = np.array([13, 8, 15])

valori, conteggi = np.unique(taglie, return_counts=True)
totale_mese = np.concatenate([sett1, sett2, sett3])

print(valori, conteggi)
print(totale_mese)`
    },

    { type: "theory", title: "Fancy indexing: scegliere righe con una lista", html: `
<p>Oltre alle maschere booleane, NumPy accetta un <strong>array di indici</strong> come selettore: sceglie esattamente quelle posizioni, <em>nell'ordine che chiedi tu</em> (anche ripetuto):</p>
<pre><code>voti = np.array([60, 95, 70, 88, 55])
voti[[1, 3]]        # [95 88] — solo le posizioni 1 e 3
voti[[0, 0, 4]]     # [60 60 55] — puoi ripetere e riordinare a piacere</code></pre>
<p>Su una matrice, una lista di indici sulle righe estrae un sottoinsieme di soggetti mantenendo tutte le colonne: <code>m[[0, 2]]</code> prende la riga 0 e la riga 2. È il modo standard di estrarre un campione o riordinare osservazioni.</p>
`, more: `
<p>A differenza dello slicing (che restituisce quasi sempre una vista sullo stesso blocco di memoria), il fancy indexing restituisce SEMPRE una <strong>copia</strong> indipendente: modificare <code>voti[[1, 3]]</code> non tocca l'array <code>voti</code> originale. Questa è una distinzione tecnica importante e spesso fonte di confusione: "indicizzare con una lista o un array di interi" e "indicizzare con uno slice" sembrano sintatticamente simili ma hanno comportamenti di copia/vista opposti.</p>
<p>Il fancy indexing si combina anche con le maschere booleane per selezioni più sofisticate: <code>m[m[:,0] > 100]</code> seleziona le righe INTERE dove il valore della prima colonna supera 100 — un pattern estremamente comune per filtrare un dataset in base a una condizione su una colonna, che ritroverai identico (con sintassi quasi invariata) quando farai lo stesso filtro su un DataFrame Pandas.</p>
<p>Puoi anche usare il fancy indexing su ENTRAMBI gli assi contemporaneamente: <code>m[[0,2], [1,3]]</code> non restituisce un blocco 2×2 come potresti aspettarti, ma solo 2 valori: <code>m[0,1]</code> e <code>m[2,3]</code> — gli indici delle due liste si accoppiano posizione per posizione, come uno <code>zip</code>. Per un vero blocco (tutte le combinazioni), serve invece <code>m[np.ix_([0,2], [1,3])]</code>, una funzione di supporto pensata esattamente per questo caso.</p>
` },

    {
      type: "exercise", id: "np-12", kg: 20, title: "Il campione scelto a mano",
      task: `<p>Data la matrice <code>dati</code> (6 clienti × 2 colonne: spesa, visite):</p>
<ul>
<li><code>campione</code>: le righe con indice <code>[0, 2, 5]</code>, con fancy indexing (una lista dentro le quadre)</li>
<li><code>invertiti</code>: tutte le righe di <code>dati</code> ma in ordine <strong>inverso</strong> (usa <code>[::-1]</code>, non una lista scritta a mano)</li>
</ul>`,
      starter: `import numpy as np

dati = np.array([
    [120, 3],
    [85,  1],
    [200, 5],
    [60,  2],
    [150, 4],
    [95,  2],
])

campione = ...
invertiti = ...

print(campione)
print(invertiti)`,
      check: `import numpy as np
assert 'campione' in globals() and campione.shape == (3, 2) and campione.tolist() == [[120, 3], [200, 5], [95, 2]], "campione: dati[[0, 2, 5]]"
assert 'invertiti' in globals() and invertiti.tolist() == dati[::-1].tolist(), "invertiti: dati[::-1] — nessuna lista scritta a mano"`,
      hint: `<p><code>dati[[0, 2, 5]]</code> per il campione. Per l'inversione, lo slice <code>[::-1]</code> funziona anche sulle righe di una matrice 2D.</p>`,
      solution: `import numpy as np

dati = np.array([
    [120, 3],
    [85,  1],
    [200, 5],
    [60,  2],
    [150, 4],
    [95,  2],
])

campione = dati[[0, 2, 5]]
invertiti = dati[::-1]

print(campione)
print(invertiti)`
    },

    { type: "theory", title: "Prima del massimale: np.where e la mediana", html: `
<p>Due attrezzi per la serie pesante. <code>np.where(condizione, se_vero, se_falso)</code> è l'if vettorizzato: costruisce un array scegliendo elemento per elemento. E la <strong>mediana</strong> (<code>np.median</code>) è il valore centrale: al contrario della media, non si fa trascinare dagli outlier — per questo si usa per <em>sostituirli</em>.</p>
<pre><code>t = np.array([80, 85, 900])   # 900 e' chiaramente un errore di misura
t.mean()      # 355  — rovinata dall'outlier
np.median(t)  # 85   — robusta
pulito = np.where(t &gt; 500, np.median(t), t)  # [80 85 85]</code></pre>
`, more: `
<p><code>np.where(condizione)</code> — con un SOLO argomento invece di tre — ha un comportamento diverso e altrettanto utile: restituisce direttamente gli INDICI dove la condizione è vera, come tupla (un elemento per dimensione dell'array). Su un array 1D, <code>np.where(t > 500)[0]</code> dà l'array degli indici; su una matrice 2D, restituisce una coppia di array (indici di riga, indici di colonna) per ogni posizione che soddisfa la condizione — è la stessa funzione dietro <code>np.unravel_index</code>, visto nella sala Deep Learning per localizzare la risposta massima di una convoluzione.</p>
<p>La mediana è un caso particolare dei <strong>percentili</strong>: <code>np.percentile(array, 50)</code> equivale a <code>np.median(array)</code>, ma la stessa funzione con altri argomenti dà qualsiasi altro punto della distribuzione — <code>np.percentile(array, 25)</code> e <code>np.percentile(array, 75)</code> sono i quartili usati nel metodo IQR per gli outlier, che vedrai formalizzato nella sala Pulizia & EDA.</p>
<p>Perché la mediana resiste agli outlier meglio della media: la media è una somma pesata di TUTTI i valori (un singolo valore enorme sposta il risultato proporzionalmente), mentre la mediana guarda solo "quale valore sta nel mezzo" quando i dati sono ordinati — un valore estremo può diventare ancora più estremo senza spostare di una virgola la posizione centrale. Questa proprietà si chiama <strong>robustezza</strong>, e torna centrale ogni volta che i dati reali contengono errori di misura o valori anomali (praticamente sempre).</p>
` },

    {
      type: "exercise", id: "np-13", kg: 25, title: "Massimale: caccia agli outlier",
      task: `<p>I tempi di risposta <code>t</code> contengono un errore di misura. Protocollo completo, tutto vettorizzato:</p>
<ul>
<li><code>z</code>: gli z-score di <code>t</code> (sottrai la media, dividi per la std)</li>
<li><code>outlier</code>: array booleano, <code>True</code> dove |z| &gt; 2 (usa <code>np.abs</code>)</li>
<li><code>n_outlier</code>: quanti sono</li>
<li><code>t_pulito</code>: come <code>t</code>, ma con gli outlier sostituiti dalla <strong>mediana di t</strong> (usa <code>np.where</code>)</li>
</ul>`,
      starter: `import numpy as np

t = np.array([82., 95., 110., 74., 60., 88., 610., 65., 90., 71., 85., 79.])

z = ...
outlier = ...
n_outlier = ...
t_pulito = ...

print(n_outlier)
print(t_pulito)`,
      check: `import numpy as np
assert 'z' in globals() and abs(float(z.mean())) < 1e-9, "z deve avere media 0: (t - t.mean()) / t.std()"
assert 'outlier' in globals() and outlier.dtype == bool, "outlier deve essere una maschera booleana: np.abs(z) > 2"
assert 'n_outlier' in globals() and int(n_outlier) == 1, "C'e' esattamente 1 outlier (il 610)"
assert 't_pulito' in globals() and float(t_pulito[6]) == 83.5, "Il 610 va sostituito con la mediana di t (83.5): np.where(outlier, np.median(t), t)"
assert float(t_pulito[0]) == 82.0, "I valori normali non devono cambiare"`,
      hint: `<p>In ordine: <code>z = (t - t.mean()) / t.std()</code>, poi <code>outlier = np.abs(z) &gt; 2</code>, poi <code>outlier.sum()</code>, infine <code>np.where(outlier, np.median(t), t)</code>.</p>`,
      solution: `import numpy as np

t = np.array([82., 95., 110., 74., 60., 88., 610., 65., 90., 71., 85., 79.])

z = (t - t.mean()) / t.std()
outlier = np.abs(z) > 2
n_outlier = outlier.sum()
t_pulito = np.where(outlier, np.median(t), t)

print(n_outlier)
print(t_pulito)`
    },

    { type: "theory", title: "np.linspace: punti equidistanti", html: `
<p><code>np.arange</code> avanza a passi fissi ma non ti lascia scegliere quanti punti ottenere. <code>np.linspace(inizio, fine, n)</code> fa l'opposto: <strong>decidi tu quanti punti</strong>, distribuiti uniformemente tra inizio e fine (<em>entrambi inclusi</em>):</p>
<pre><code>np.linspace(0, 1, 5)   # [0.   0.25 0.5  0.75 1.  ] — 5 punti, estremi compresi</code></pre>
<p>Utilissimo per generare griglie di valori da testare (soglie, curve, assi di un grafico).</p>
`, more: `
<p>La differenza pratica tra <code>arange</code> e <code>linspace</code> sta in COSA fissi tu: con <code>arange(inizio, fine, passo)</code> decidi il PASSO tra un punto e l'altro, e il numero di punti risultante dipende dall'intervallo (a volte non ovvio da calcolare a mente, soprattutto con passi non interi); con <code>linspace(inizio, fine, n)</code> decidi direttamente QUANTI punti vuoi, e NumPy calcola il passo di conseguenza. Per generare assi di grafici o griglie di test, <code>linspace</code> è quasi sempre la scelta più prevedibile.</p>
<p>Un'insidia nota di <code>arange</code> con passi decimali: a causa della rappresentazione binaria dei numeri in virgola mobile (lo stesso fenomeno per cui <code>0.1 + 0.2 != 0.3</code> esattamente), <code>np.arange(0, 1, 0.1)</code> può includere o escludere l'ultimo valore in modo inatteso a seconda degli arrotondamenti interni. <code>linspace</code> non ha questo problema, perché non accumula un passo ripetutamente ma calcola ogni punto direttamente dalla posizione — un motivo tecnico in più per preferirlo quando serve precisione sui valori generati.</p>
<p>Con <code>endpoint=False</code>, <code>linspace</code> ESCLUDE l'ultimo valore (utile per generare punti equispaziati su un intervallo "ciclico", come gli angoli di un cerchio, dove l'inizio e la fine altrimenti coinciderebbero).</p>
` },

    {
      type: "exercise", id: "np-14", kg: 5, title: "Serie: griglia di punti",
      task: `<p>Crea <code>griglia</code>: 5 punti equidistanti tra 0 e 1 (estremi inclusi) con <code>np.linspace</code>.</p>`,
      starter: `import numpy as np

griglia = ...
print(griglia)`,
      check: `import numpy as np
assert np.allclose(griglia, [0, 0.25, 0.5, 0.75, 1.0]), "griglia: np.linspace(0, 1, 5)"`,
      hint: `<p><code>np.linspace(0, 1, 5)</code>.</p>`,
      solution: `import numpy as np

griglia = np.linspace(0, 1, 5)
print(griglia)`
    },

    { type: "theory", title: "np.clip: contenere i valori in un intervallo", html: `
<p><code>np.clip(array, minimo, massimo)</code> schiaccia ogni valore fuori range al limite più vicino — la stessa idea del <code>.clip()</code> di Pandas, qui direttamente su array:</p>
<pre><code>np.clip([-5, 10, 45], 0, 40)   # [ 0 10 40]</code></pre>
`, more: `
<p><code>np.clip</code> accetta anche solo un limite: <code>np.clip(array, 0, None)</code> schiaccia solo i valori negativi a zero (equivalente alla funzione ReLU della sala Deep Learning, ma su un array generico invece che nel contesto di una rete neurale), lasciando i valori alti intatti. Analogamente <code>np.clip(array, None, 100)</code> limita solo dall'alto.</p>
<p>Un uso ricorrente di <code>clip</code> è "contenere" un risultato dentro un intervallo fisicamente o logicamente valido dopo un calcolo che potrebbe sforare: probabilità che devono restare tra 0 e 1, età che non può essere negativa, percentuali che non superano 100 — invece di lasciare che un piccolo errore di arrotondamento produca un valore assurdo (<code>1.0000001</code> come probabilità), <code>clip</code> lo riporta silenziosamente nei limiti attesi.</p>
<p>Da distinguere da <code>np.where</code> (già visto): <code>clip</code> conosce solo "sotto/sopra i limiti", mentre <code>where</code> puoi usarlo per QUALSIASI condizione arbitraria, non solo confronti con soglie fisse. Quando la logica è "se sotto/sopra questi due valori, schiaccia ai limiti", <code>clip</code> è più leggibile; per condizioni più elaborate, serve <code>where</code> (o <code>select</code> per più di due casi, visto più avanti in questa sala).</p>
` },

    {
      type: "exercise", id: "np-15", kg: 5, title: "Serie: temperature nei limiti del sensore",
      task: `<p>Il sensore <code>temp</code> ha letture fuori scala (guasti). Crea <code>temp_valida</code>: <code>temp</code> clippata tra 0 e 40.</p>`,
      starter: `import numpy as np

temp = np.array([-5, 10, 45, 22, 41, -2])

temp_valida = ...
print(temp_valida)`,
      check: `import numpy as np
assert list(temp_valida) == [0, 10, 40, 22, 40, 0], "temp_valida: np.clip(temp, 0, 40)"`,
      hint: `<p><code>np.clip(temp, 0, 40)</code>.</p>`,
      solution: `import numpy as np

temp = np.array([-5, 10, 45, 22, 41, -2])

temp_valida = np.clip(temp, 0, 40)
print(temp_valida)`
    },

    {
      type: "exercise", id: "np-16", kg: 5, title: "Drill: slicing sul traffico",
      task: `<p>Hai <code>visite</code>, 8 letture orarie di traffico web. Crea <code>mattina</code> (prime 4 ore), <code>sera</code> (ultime 4), <code>ore_centrali</code> (dalla terza alla sesta, escluse le estremità: indici 2 e 3 solamente).</p>`,
      starter: `import numpy as np

visite = np.array([50, 80, 120, 200, 340, 410, 300, 90])

mattina = ...
sera = ...
ore_centrali = ...

print(mattina, sera, ore_centrali)`,
      check: `import numpy as np
assert list(mattina) == [50, 80, 120, 200]
assert list(sera) == [340, 410, 300, 90]
assert list(ore_centrali) == [120, 200]`,
      hint: `<p><code>visite[:4]</code>, <code>visite[-4:]</code>, <code>visite[2:4]</code>.</p>`,
      solution: `import numpy as np

visite = np.array([50, 80, 120, 200, 340, 410, 300, 90])

mattina = visite[:4]
sera = visite[-4:]
ore_centrali = visite[2:4]

print(mattina, sera, ore_centrali)`
    },

    {
      type: "exercise", id: "np-17", kg: 10, title: "Drill: consegne in ritardo",
      task: `<p>Hai <code>consegne</code>, tempi in minuti. Crea <code>ritardate</code> (tempo &gt; 30) e <code>n_veloci</code> (quante sotto i 20 minuti).</p>`,
      starter: `import numpy as np

consegne = np.array([25, 40, 15, 60, 35, 10, 50])

ritardate = ...
n_veloci = ...

print(ritardate, n_veloci)`,
      check: `import numpy as np
assert sorted(ritardate.tolist()) == [35, 40, 50, 60]
assert int(n_veloci) == 2`,
      hint: `<p><code>consegne[consegne &gt; 30]</code>, <code>(consegne &lt; 20).sum()</code>.</p>`,
      solution: `import numpy as np

consegne = np.array([25, 40, 15, 60, 35, 10, 50])

ritardate = consegne[consegne > 30]
n_veloci = (consegne < 20).sum()

print(ritardate, n_veloci)`
    },

    {
      type: "exercise", id: "np-18", kg: 15, title: "Drill: pagella di classe",
      task: `<p><code>voti</code> è una matrice 4 studenti × 3 materie. Calcola <code>media_materia</code> (per colonna) e <code>media_studente</code> (per riga).</p>`,
      starter: `import numpy as np

voti = np.array([
    [6, 7, 8],
    [9, 5, 6],
    [7, 7, 7],
    [4, 6, 5],
])

media_materia = ...
media_studente = ...

print(media_materia)
print(media_studente)`,
      check: `import numpy as np
assert np.allclose(media_materia, [6.5, 6.25, 6.5])
assert np.allclose(media_studente, [7.0, 20/3, 7.0, 5.0])`,
      hint: `<p><code>axis=0</code> per colonna, <code>axis=1</code> per riga.</p>`,
      solution: `import numpy as np

voti = np.array([
    [6, 7, 8],
    [9, 5, 6],
    [7, 7, 7],
    [4, 6, 5],
])

media_materia = voti.mean(axis=0)
media_studente = voti.mean(axis=1)

print(media_materia)
print(media_studente)`
    },

    {
      type: "exercise", id: "np-19", kg: 15, title: "Drill: standardizza i prezzi azionari",
      task: `<p><code>prezzi</code> è una matrice 4 giorni × 2 azioni. Calcola <code>standardizzati</code>: z-score per colonna con il broadcasting.</p>`,
      starter: `import numpy as np

prezzi = np.array([
    [100.0, 10.0],
    [102.0, 11.0],
    [98.0, 9.0],
    [105.0, 12.0],
])

standardizzati = ...
print(standardizzati.round(3))`,
      check: `import numpy as np
assert np.allclose(standardizzati.mean(axis=0), [0, 0], atol=1e-9)
assert np.allclose(standardizzati.std(axis=0), [1, 1], atol=1e-9)`,
      hint: `<p><code>(prezzi - prezzi.mean(axis=0)) / prezzi.std(axis=0)</code>.</p>`,
      solution: `import numpy as np

prezzi = np.array([
    [100.0, 10.0],
    [102.0, 11.0],
    [98.0, 9.0],
    [105.0, 12.0],
])

standardizzati = (prezzi - prezzi.mean(axis=0)) / prezzi.std(axis=0)
print(standardizzati.round(3))`
    },

    {
      type: "exercise", id: "np-20", kg: 20, title: "Drill: ore di picco del sito",
      task: `<p>Hai <code>traffico</code>, visite orarie. Trova <code>top3_idx</code>: gli indici delle 3 ore con più traffico, in ordine decrescente (argsort + inversione + slice).</p>`,
      starter: `import numpy as np

traffico = np.array([120, 340, 90, 500, 210, 60])

top3_idx = ...
print(top3_idx, traffico[top3_idx])`,
      check: `import numpy as np
assert list(top3_idx) == [3, 1, 4]`,
      hint: `<p><code>np.argsort(traffico)[::-1][:3]</code>.</p>`,
      solution: `import numpy as np

traffico = np.array([120, 340, 90, 500, 210, 60])

top3_idx = np.argsort(traffico)[::-1][:3]
print(top3_idx, traffico[top3_idx])`
    },

    {
      type: "exercise", id: "np-21", kg: 15, title: "Drill: il costo del magazzino",
      task: `<p>Con <code>quantita</code> e <code>costo_unitario</code>, calcola <code>costo_totale</code> con il prodotto scalare (niente cicli).</p>`,
      starter: `import numpy as np

quantita = np.array([3, 2, 5])
costo_unitario = np.array([10.0, 25.0, 4.0])

costo_totale = ...
print(costo_totale)`,
      check: `assert abs(float(costo_totale) - 100.0) < 1e-9`,
      hint: `<p><code>quantita @ costo_unitario</code>.</p>`,
      solution: `import numpy as np

quantita = np.array([3, 2, 5])
costo_unitario = np.array([10.0, 25.0, 4.0])

costo_totale = quantita @ costo_unitario
print(costo_totale)`
    },

    {
      type: "exercise", id: "np-22", kg: 15, title: "Drill: i turni di lavoro",
      task: `<p>Hai <code>turni</code> ("M"=mattina, "P"=pomeriggio, "N"=notte). Trova <code>tipi</code> (distinti, ordinati) e <code>conteggi</code> (quante volte ciascuno).</p>`,
      starter: `import numpy as np

turni = np.array(["M", "P", "N", "M", "M", "P"])

tipi = ...
conteggi = ...

print(tipi, conteggi)`,
      check: `import numpy as np
assert list(tipi) == ["M", "N", "P"]
assert list(conteggi) == [3, 1, 2]`,
      hint: `<p><code>np.unique(turni, return_counts=True)</code>.</p>`,
      solution: `import numpy as np

turni = np.array(["M", "P", "N", "M", "M", "P"])

tipi, conteggi = np.unique(turni, return_counts=True)

print(tipi, conteggi)`
    },

    {
      type: "exercise", id: "np-23", kg: 10, title: "Drill: due settimane di vendite",
      task: `<p>Unisci <code>sett1</code> e <code>sett2</code> in <code>due_settimane</code> con <code>np.concatenate</code>, poi calcola <code>totale</code>: la somma di tutto.</p>`,
      starter: `import numpy as np

sett1 = np.array([10, 12, 9, 14, 11, 13, 15])
sett2 = np.array([8, 10, 12, 9, 11, 14, 13])

due_settimane = ...
totale = ...

print(due_settimane)
print(totale)`,
      check: `import numpy as np
assert len(due_settimane) == 14
assert int(totale) == 161`,
      hint: `<p><code>np.concatenate([sett1, sett2])</code>, poi <code>.sum()</code>.</p>`,
      solution: `import numpy as np

sett1 = np.array([10, 12, 9, 14, 11, 13, 15])
sett2 = np.array([8, 10, 12, 9, 11, 14, 13])

due_settimane = np.concatenate([sett1, sett2])
totale = due_settimane.sum()

print(due_settimane)
print(totale)`
    },

    {
      type: "exercise", id: "np-24", kg: 20, title: "Drill: i migliori clienti scelti a mano",
      task: `<p><code>clienti</code> è una matrice (id, spesa). Estrai <code>selezionati</code>: le righe in posizione 0, 2 e 4, con fancy indexing.</p>`,
      starter: `import numpy as np

clienti = np.array([
    [1, 200],
    [2, 50],
    [3, 340],
    [4, 80],
    [5, 410],
])

selezionati = ...
print(selezionati)`,
      check: `import numpy as np
assert selezionati.tolist() == [[1, 200], [3, 340], [5, 410]]`,
      hint: `<p><code>clienti[[0, 2, 4]]</code>.</p>`,
      solution: `import numpy as np

clienti = np.array([
    [1, 200],
    [2, 50],
    [3, 340],
    [4, 80],
    [5, 410],
])

selezionati = clienti[[0, 2, 4]]
print(selezionati)`
    },

    {
      type: "exercise", id: "np-25", kg: 25, title: "Combo: monitor cardiaco",
      task: `<p><code>bpm</code> ha una lettura anomala del sensore. Con soglia <code>|z| &gt; 1.5</code>: crea <code>outlier</code> (maschera), <code>n_outlier</code> (conteggio), <code>bpm_pulito</code> (outlier sostituiti con la mediana).</p>`,
      starter: `import numpy as np

bpm = np.array([72, 75, 70, 180, 68, 74, 71, 20])

z = (bpm - bpm.mean()) / bpm.std()
outlier = np.abs(z) > 1.5
n_outlier = outlier.sum()
bpm_pulito = np.where(outlier, np.median(bpm), bpm)

print(n_outlier)
print(bpm_pulito)`,
      check: `import numpy as np
assert int(n_outlier) == 1, "Con questa soglia solo il 180 risulta un outlier statistico"
assert bpm_pulito.tolist() == [72.0, 75.0, 70.0, 71.5, 68.0, 74.0, 71.0, 20.0]`,
      hint: `<p>Sorpresa: il 20 (bpm bassissimo) NON supera la soglia di 1.5 in questo campione piccolo — il 180 alza tantissimo la deviazione standard, "nascondendo" l'altro anomalo. Un limite reale del metodo z-score con pochi dati.</p>`,
      solution: `import numpy as np

bpm = np.array([72, 75, 70, 180, 68, 74, 71, 20])

z = (bpm - bpm.mean()) / bpm.std()
outlier = np.abs(z) > 1.5
n_outlier = outlier.sum()
bpm_pulito = np.where(outlier, np.median(bpm), bpm)

print(n_outlier)
print(bpm_pulito)`
    },

    { type: "theory", title: "np.select: più di due condizioni", html: `
<p><code>np.where</code> gestisce solo due casi (vero/falso). Per <strong>più fasce</strong> insieme si usa <code>np.select</code>: una lista di condizioni e una lista di valori corrispondenti, valutate nell'ordine:</p>
<pre><code>cond = [t < 10, (t >= 10) & (t < 25), t >= 25]
val  = ["freddo", "mite", "caldo"]
np.select(cond, val, default="?")</code></pre>
<p><code>default</code> copre il caso in cui nessuna condizione sia vera (buona pratica includerlo sempre, anche se in teoria le condizioni coprono tutti i casi).</p>
`, more: `
<p>Le condizioni in <code>np.select</code> vengono valutate <strong>nell'ordine in cui le scrivi</strong>, e la prima che risulta vera per una data posizione "vince" — anche se una condizione successiva sarebbe anch'essa vera per quella stessa posizione. Questo significa che condizioni sovrapposte non producono un errore silenzioso: basta ordinarle dalla più specifica alla più generale per ottenere il comportamento voluto, esattamente come con una catena di <code>if/elif/elif</code> in Python puro.</p>
<p>Un errore comune: dimenticare che le condizioni devono avere la STESSA shape dell'array che stai classificando (o essere broadcastabili ad essa) — <code>np.select</code> non "sa" automaticamente a quali elementi applicare quale condizione, deve poterle confrontare posizione per posizione.</p>
<p><code>default</code> vale la pena includerlo sempre non solo per completezza teorica ma come <strong>rete di sicurezza contro i NaN</strong>: se ometti <code>default</code> e nessuna condizione risulta vera per un elemento, quella posizione riceve silenziosamente 0 (per array numerici) — un valore che sembra un dato valido ma è in realtà "nessuna condizione ha combaciato", una distinzione facile da perdere se non stai attento. Un <code>default</code> esplicito come <code>"non classificato"</code> rende visibile il problema invece di nasconderlo dietro uno zero plausibile.</p>
` },

    {
      type: "exercise", id: "np-26", kg: 20, title: "Drill: fasce di temperatura",
      task: `<p>Classifica <code>t</code> in <code>"freddo"</code> (&lt;10), <code>"mite"</code> (10-25), <code>"caldo"</code> (&gt;=25) con <code>np.select</code>, salvando in <code>fasce</code>.</p>`,
      starter: `import numpy as np

t = np.array([5, 18, 30, 22, 2, 35])

cond = [t < 10, (t >= 10) & (t < 25), t >= 25]
val = ["freddo", "mite", "caldo"]

fasce = ...
print(fasce)`,
      check: `import numpy as np
assert list(fasce) == ["freddo", "mite", "caldo", "mite", "freddo", "caldo"]`,
      hint: `<p><code>np.select(cond, val, default="?")</code>.</p>`,
      solution: `import numpy as np

t = np.array([5, 18, 30, 22, 2, 35])

cond = [t < 10, (t >= 10) & (t < 25), t >= 25]
val = ["freddo", "mite", "caldo"]

fasce = np.select(cond, val, default="?")
print(fasce)`
    },

    {
      type: "exercise", id: "np-27", kg: 20, title: "Combo: top-2 tra i prodotti popolari",
      task: `<p>Tra i prodotti con <code>vendite &gt; 100</code>, trova <code>top2</code>: i 2 valori di vendita più alti (filtra PRIMA, poi ordina).</p>`,
      starter: `import numpy as np

vendite = np.array([50, 150, 300, 90, 220, 400])

filtrate = vendite[vendite > 100]
top2 = np.sort(filtrate)[::-1][:2]

print(filtrate)
print(top2)`,
      check: `import numpy as np
assert list(top2) == [400, 300]`,
      hint: `<p><code>np.sort</code> ordina i VALORI (non gli indici, a differenza di <code>argsort</code>): utile quando non ti serve sapere le posizioni originali.</p>`,
      solution: `import numpy as np

vendite = np.array([50, 150, 300, 90, 220, 400])

filtrate = vendite[vendite > 100]
top2 = np.sort(filtrate)[::-1][:2]

print(filtrate)
print(top2)`
    },

    {
      type: "exercise", id: "np-28", kg: 20, title: "Combo: punteggio standardizzato per riga",
      task: `<p>Standardizza <code>m</code> per colonna, poi calcola <code>somma_righe</code>: la somma di ogni riga standardizzata (un punteggio composito).</p>`,
      starter: `import numpy as np

m = np.array([
    [10.0, 20.0],
    [30.0, 10.0],
    [20.0, 30.0],
])

standardizzata = (m - m.mean(axis=0)) / m.std(axis=0)
somma_righe = standardizzata.sum(axis=1)

print(standardizzata.round(4))
print(somma_righe.round(4))`,
      check: `import numpy as np
assert np.allclose(somma_righe, [-1.2247, 0.0, 1.2247], atol=1e-3)`,
      hint: `<p>Prima standardizza per colonna (<code>axis=0</code>), poi somma per riga (<code>axis=1</code>): sono due operazioni distinte in sequenza.</p>`,
      solution: `import numpy as np

m = np.array([
    [10.0, 20.0],
    [30.0, 10.0],
    [20.0, 30.0],
])

standardizzata = (m - m.mean(axis=0)) / m.std(axis=0)
somma_righe = standardizzata.sum(axis=1)

print(standardizzata.round(4))
print(somma_righe.round(4))`
    },

    {
      type: "exercise", id: "np-29", kg: 20, title: "Combo: incasso dei soli ordini grandi",
      task: `<p>Con <code>quantita</code> (a prezzo unitario fisso 7.5), calcola <code>incasso_grandi</code>: la somma dell'incasso solo per gli ordini con <code>quantita &gt; 2</code>.</p>`,
      starter: `import numpy as np

quantita = np.array([1, 5, 2, 8, 3])
prezzo_unitario = 7.5

totale_per_ordine = quantita * prezzo_unitario
mask = quantita > 2
incasso_grandi = totale_per_ordine[mask].sum()

print(totale_per_ordine)
print(incasso_grandi)`,
      check: `assert abs(float(incasso_grandi) - 120.0) < 1e-9`,
      hint: `<p>Prima vettorizza il calcolo per tutti, poi filtra con la maschera prima di sommare.</p>`,
      solution: `import numpy as np

quantita = np.array([1, 5, 2, 8, 3])
prezzo_unitario = 7.5

totale_per_ordine = quantita * prezzo_unitario
mask = quantita > 2
incasso_grandi = totale_per_ordine[mask].sum()

print(totale_per_ordine)
print(incasso_grandi)`
    },

    {
      type: "exercise", id: "np-30", kg: 20, title: "Combo: le righe della categoria più comune",
      task: `<p>Trova <code>top_cat</code> (la categoria più frequente in <code>cat</code>) e <code>righe</code>: gli indici dove compare (usa <code>np.where</code> su una condizione, non su un if-else).</p>`,
      starter: `import numpy as np

cat = np.array(["a", "b", "a", "a", "c", "b"])

valori, conteggi = np.unique(cat, return_counts=True)
top_cat = valori[np.argmax(conteggi)]
righe = np.where(cat == top_cat)[0]

print(top_cat)
print(righe)`,
      check: `import numpy as np
assert top_cat == "a"
assert list(righe) == [0, 2, 3]`,
      hint: `<p><code>np.where(condizione)</code> (senza secondo e terzo argomento) restituisce una tupla con gli indici dove la condizione è vera: <code>[0]</code> ne estrae l'array.</p>`,
      solution: `import numpy as np

cat = np.array(["a", "b", "a", "a", "c", "b"])

valori, conteggi = np.unique(cat, return_counts=True)
top_cat = valori[np.argmax(conteggi)]
righe = np.where(cat == top_cat)[0]

print(top_cat)
print(righe)`
    },

    {
      type: "exercise", id: "np-31", kg: 15, title: "Combo: unisci e ridisponi",
      task: `<p>Unisci <code>a1</code> e <code>a2</code> con <code>concatenate</code>, poi ridisponi il risultato in una matrice 4×3 con <code>reshape</code>, salvando in <code>matrice</code>.</p>`,
      starter: `import numpy as np

a1 = np.arange(6)
a2 = np.arange(6, 12)

matrice = np.concatenate([a1, a2]).reshape(4, 3)
print(matrice)`,
      check: `import numpy as np
assert matrice.shape == (4, 3)
assert matrice.tolist() == [[0,1,2],[3,4,5],[6,7,8],[9,10,11]]`,
      hint: `<p>Le due operazioni si incatenano: <code>np.concatenate([a1, a2]).reshape(4, 3)</code>.</p>`,
      solution: `import numpy as np

a1 = np.arange(6)
a2 = np.arange(6, 12)

matrice = np.concatenate([a1, a2]).reshape(4, 3)
print(matrice)`
    },

    {
      type: "exercise", id: "np-32", kg: 20, title: "Drill: la materia migliore per studente",
      task: `<p>Sulla matrice <code>voti</code> (righe = studenti, colonne = materie), trova <code>materia_migliore</code>: per ogni studente, l'indice della materia col voto più alto (<code>argmax</code> con l'asse giusto).</p>`,
      starter: `import numpy as np

voti = np.array([
    [3, 9, 5],
    [8, 2, 7],
    [1, 6, 4],
])

materia_migliore = np.argmax(voti, axis=1)
print(materia_migliore)`,
      check: `import numpy as np
assert list(materia_migliore) == [1, 0, 1]`,
      hint: `<p><code>axis=1</code>: per ogni riga (studente), cerca l'indice di colonna col massimo.</p>`,
      solution: `import numpy as np

voti = np.array([
    [3, 9, 5],
    [8, 2, 7],
    [1, 6, 4],
])

materia_migliore = np.argmax(voti, axis=1)
print(materia_migliore)`
    },

    { type: "theory", title: "np.cumsum: il totale che cresce", html: `
<p><code>np.cumsum</code> restituisce, per ogni posizione, la somma di tutti i valori fino a lì — un totale progressivo, utile per saldi, incassi accumulati, o per capire "quando" si supera una soglia:</p>
<pre><code>np.cumsum([100, 150, 90, 200])   # [100 250 340 540]</code></pre>
`, more: `
<p><code>np.cumsum</code> ha dei parenti con la stessa logica "progressiva" applicata ad altre operazioni: <code>np.cumprod</code> (prodotto cumulativo, utile per calcolare un tasso di crescita composto passo dopo passo), <code>np.cummax</code> e <code>np.cummin</code> (il massimo/minimo visto finora, esattamente il pattern "record storico" che vedrai anche fuori da NumPy). Tutte condividono la stessa forma: l'array risultante ha la STESSA lunghezza dell'originale, non un singolo numero come farebbe l'aggregazione "normale" (<code>sum</code>, <code>max</code>).</p>
<p>Su una matrice, <code>cumsum</code> richiede anch'esso un <code>axis</code>: senza specificarlo, appiattisce prima la matrice in un vettore 1D e accumula su quello (spesso NON quello che vuoi); con <code>axis=0</code> accumula lungo le righe (colonna per colonna), con <code>axis=1</code> lungo le colonne (riga per riga) — la stessa logica di aggregazione vista per <code>sum</code>/<code>mean</code>, ma che qui produce un intero array invece di un singolo numero per ogni riga/colonna.</p>
<p>Un uso pratico frequente: dato un array di incrementi giornalieri, <code>cumsum</code> ricostruisce il "saldo" progressivo nel tempo — ed è anche l'operazione INVERSA di <code>np.diff</code> (le differenze tra elementi consecutivi): <code>np.diff(np.cumsum(x))</code> ti ridà (quasi) l'array <code>x</code> originale, un buon modo per verificare di aver capito la relazione tra le due funzioni.</p>
` },

    {
      type: "exercise", id: "np-33", kg: 15, title: "Drill: incasso progressivo",
      task: `<p>Calcola <code>progressivo</code>: il totale cumulativo di <code>vendite</code> giorno per giorno.</p>`,
      starter: `import numpy as np

vendite = np.array([100, 150, 90, 200])

progressivo = ...
print(progressivo)`,
      check: `import numpy as np
assert list(progressivo) == [100, 250, 340, 540]`,
      hint: `<p><code>np.cumsum(vendite)</code>.</p>`,
      solution: `import numpy as np

vendite = np.array([100, 150, 90, 200])

progressivo = np.cumsum(vendite)
print(progressivo)`
    },

    {
      type: "exercise", id: "np-34", kg: 20, title: "Combo: quando raggiungo l'obiettivo?",
      task: `<p>Con <code>vendite</code> e un <code>obiettivo</code> di incasso, trova <code>giorno_obiettivo</code>: il primo indice in cui il totale cumulativo raggiunge o supera l'obiettivo (usa <code>cumsum</code> + <code>argmax</code> su una maschera: <code>argmax</code> su booleani trova il primo <code>True</code>).</p>`,
      starter: `import numpy as np

vendite = np.array([100, 120, 90, 150, 80, 200])
obiettivo = 400

progressivo = np.cumsum(vendite)
giorno_obiettivo = np.argmax(progressivo >= obiettivo)

print(progressivo)
print(giorno_obiettivo)`,
      check: `assert int(giorno_obiettivo) == 3`,
      hint: `<p><code>argmax</code> su un array booleano restituisce l'indice del PRIMO <code>True</code> (perché <code>True</code> vale 1, il massimo possibile, e argmax prende il primo che lo raggiunge).</p>`,
      solution: `import numpy as np

vendite = np.array([100, 120, 90, 150, 80, 200])
obiettivo = 400

progressivo = np.cumsum(vendite)
giorno_obiettivo = np.argmax(progressivo >= obiettivo)

print(progressivo)
print(giorno_obiettivo)`
    },

    {
      type: "exercise", id: "np-35", kg: 10, title: "Drill: arrotonda i prezzi",
      task: `<p>Arrotonda <code>prezzi</code> a 2 decimali in <code>prezzi_arrotondati</code>.</p>`,
      starter: `import numpy as np

prezzi = np.array([19.996, 5.004, 12.345])

prezzi_arrotondati = ...
print(prezzi_arrotondati)`,
      check: `import numpy as np
assert np.allclose(prezzi_arrotondati, [20.0, 5.0, 12.34], atol=1e-9)`,
      hint: `<p><code>np.round(prezzi, 2)</code>. Nota: 12.345 arrotonda a 12.34, non 12.35 — un effetto della rappresentazione binaria dei decimali, non un bug.</p>`,
      solution: `import numpy as np

prezzi = np.array([19.996, 5.004, 12.345])

prezzi_arrotondati = np.round(prezzi, 2)
print(prezzi_arrotondati)`
    },

    {
      type: "exercise", id: "np-36", kg: 25, title: "Combo: pulisci, classifica, arrotonda",
      task: `<p>Su <code>letture</code> (con un valore anomalo): rimuovi l'outlier (soglia IQR, come nella sala Pulizia ma qui a mano con NumPy), poi classifica ciò che resta in fasce con <code>np.select</code>, poi arrotonda la media finale a 1 decimale.</p>
<ul>
<li><code>pulite</code>: letture con l'outlier sostituito dalla mediana</li>
<li><code>fasce</code>: <code>"basso"</code> (&lt;50), <code>"medio"</code> (50-100), <code>"alto"</code> (&gt;100) su <code>pulite</code></li>
<li><code>media_arrotondata</code>: <code>round(pulite.mean(), 1)</code></li>
</ul>`,
      starter: `import numpy as np

letture = np.array([45.0, 60.0, 900.0, 30.0, 110.0, 55.0])

q1, q3 = np.percentile(letture, [25, 75])
iqr = q3 - q1
outlier = (letture < q1 - 1.5*iqr) | (letture > q3 + 1.5*iqr)
pulite = np.where(outlier, np.median(letture), letture)

cond = [pulite < 50, (pulite >= 50) & (pulite <= 100), pulite > 100]
val = ["basso", "medio", "alto"]
fasce = np.select(cond, val, default="?")

media_arrotondata = round(float(pulite.mean()), 1)

print(pulite)
print(fasce)
print(media_arrotondata)`,
      check: `import numpy as np
assert pulite.tolist() == [45.0, 60.0, 57.5, 30.0, 110.0, 55.0], "900 va sostituito dalla mediana (57.5)"
assert list(fasce) == ["basso", "medio", "medio", "basso", "alto", "medio"]
assert abs(media_arrotondata - 59.6) < 1e-9`,
      hint: `<p>Fai i tre passaggi nell'ordine dato: prima ripulisci l'outlier, POI classifica i dati puliti (non quelli originali!), infine calcola la media sui dati puliti.</p>`,
      solution: `import numpy as np

letture = np.array([45.0, 60.0, 900.0, 30.0, 110.0, 55.0])

q1, q3 = np.percentile(letture, [25, 75])
iqr = q3 - q1
outlier = (letture < q1 - 1.5*iqr) | (letture > q3 + 1.5*iqr)
pulite = np.where(outlier, np.median(letture), letture)

cond = [pulite < 50, (pulite >= 50) & (pulite <= 100), pulite > 100]
val = ["basso", "medio", "alto"]
fasce = np.select(cond, val, default="?")

media_arrotondata = round(float(pulite.mean()), 1)

print(pulite)
print(fasce)
print(media_arrotondata)`
    },

    {
      type: "exercise", id: "np-37", kg: 15, title: "Drill: due sensori a confronto",
      task: `<p>Due sensori misurano la stessa cosa. Conta <code>n_A_maggiore</code>: quante volte <code>sensA</code> ha letto un valore più alto di <code>sensB</code>, posizione per posizione.</p>`,
      starter: `import numpy as np

sensA = np.array([20, 22, 19, 25, 18])
sensB = np.array([21, 20, 19, 24, 20])

n_A_maggiore = ...
print(n_A_maggiore)`,
      check: `assert int(n_A_maggiore) == 2`,
      hint: `<p><code>(sensA &gt; sensB).sum()</code> — confronto elemento per elemento, poi conta i True.</p>`,
      solution: `import numpy as np

sensA = np.array([20, 22, 19, 25, 18])
sensB = np.array([21, 20, 19, 24, 20])

n_A_maggiore = (sensA > sensB).sum()
print(n_A_maggiore)`
    },

    {
      type: "exercise", id: "np-38", kg: 25, title: "Combo: righe sopra la media su tutte le colonne",
      task: `<p>Standardizza <code>m</code> per colonna, poi trova <code>righe_sempre_sopra</code>: la maschera delle righe in cui <strong>tutti</strong> i valori standardizzati sono positivi (usa <code>np.all</code> con l'asse giusto).</p>`,
      starter: `import numpy as np

m = np.array([
    [5.0, 2.0, 8.0],
    [1.0, 9.0, 3.0],
    [6.0, 6.0, 6.0],
])

standardizzata = (m - m.mean(axis=0)) / m.std(axis=0)
righe_sempre_sopra = np.all(standardizzata > 0, axis=1)

print(standardizzata.round(3))
print(righe_sempre_sopra)`,
      check: `import numpy as np
assert list(righe_sempre_sopra) == [False, False, True]`,
      hint: `<p><code>np.all(condizione, axis=1)</code>: per ogni riga, verifica che TUTTI i valori soddisfino la condizione — <code>axis=1</code> perché si collassa lungo le colonne, riga per riga.</p>`,
      solution: `import numpy as np

m = np.array([
    [5.0, 2.0, 8.0],
    [1.0, 9.0, 3.0],
    [6.0, 6.0, 6.0],
])

standardizzata = (m - m.mean(axis=0)) / m.std(axis=0)
righe_sempre_sopra = np.all(standardizzata > 0, axis=1)

print(standardizzata.round(3))
print(righe_sempre_sopra)`
    },

    { type: "theory", title: "Distanza euclidea, vettorizzata", html: `
<p>Per confrontare due punti in uno spazio a più dimensioni si usa la <strong>distanza euclidea</strong>: la radice della somma dei quadrati delle differenze, coordinata per coordinata — esattamente il teorema di Pitagora esteso a più dimensioni.</p>
<pre><code>punto_a = np.array([0, 0])
punto_b = np.array([3, 4])
np.sqrt(((punto_a - punto_b) ** 2).sum())   # 5.0</code></pre>
<p>Grazie al broadcasting, la stessa formula calcola la distanza da un punto a <strong>tutti i punti di una matrice in un colpo solo</strong> (<code>axis=1</code> per sommare lungo le colonne, riga per riga). È esattamente il calcolo che sta dentro il KNN che vedrai in scikit-learn: "il più vicino" è, letteralmente, quello con distanza minima.</p>
`, more: `
<p>La distanza euclidea è solo UNA delle possibili misure di "quanto sono lontani due punti" — la più intuitiva geometricamente, ma non sempre la più adatta. La <strong>distanza di Manhattan</strong> (somma dei valori assoluti delle differenze, <code>np.abs(a-b).sum()</code>, invece della radice della somma dei quadrati) è più robusta agli outlier su singole coordinate e più naturale quando il movimento è vincolato a una griglia (come muoversi negli isolati di una città, da cui il nome). La <strong>similarità del coseno</strong> (vista nella sala RAG) misura invece l'angolo tra due vettori, ignorando completamente la loro lunghezza — utile quando conta solo la "direzione", non la "magnitudine".</p>
<p>NumPy offre <code>np.linalg.norm(vettore)</code> per calcolare direttamente la norma euclidea (la lunghezza di un vettore, cioè la distanza dall'origine) — equivalente a <code>np.sqrt((vettore**2).sum())</code> ma più leggibile, e generalizzabile ad altre norme con il parametro <code>ord</code> (<code>ord=1</code> per Manhattan, <code>ord=2</code>, il default, per euclidea).</p>
<p>Il calcolo "tutte le distanze da un punto a una matrice" generalizza a "tutte le distanze tra OGNI coppia di punti di due matrici" (una matrice di distanze, non solo un vettore): l'operazione fondamentale dietro il clustering gerarchico e molti algoritmi di ricerca del vicino più prossimo su larga scala, spesso implementata in librerie dedicate (come <code>scipy.spatial.distance</code>) per efficienza, ma concettualmente identica a quanto costruito qui a mano.</p>
` },

    {
      type: "exercise", id: "np-39", kg: 20, title: "Drill: il punto più vicino",
      task: `<p>Calcola <code>distanze</code>: la distanza euclidea di <code>query</code> da ogni riga di <code>punti</code> (vettorizzata, niente cicli). Poi <code>piu_vicino</code>: l'indice del punto più vicino.</p>`,
      starter: `import numpy as np

punti = np.array([[0, 0], [3, 4], [1, 1], [5, 5]])
query = np.array([0, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
piu_vicino = np.argmin(distanze)

print(distanze)
print(piu_vicino)`,
      check: `import numpy as np
assert np.allclose(distanze, [0.0, 5.0, np.sqrt(2), np.sqrt(50)])
assert int(piu_vicino) == 0`,
      hint: `<p><code>np.argmin</code> è il gemello di <code>np.argmax</code>: trova l'indice del valore minimo.</p>`,
      solution: `import numpy as np

punti = np.array([[0, 0], [3, 4], [1, 1], [5, 5]])
query = np.array([0, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
piu_vicino = np.argmin(distanze)

print(distanze)
print(piu_vicino)`
    },

    {
      type: "exercise", id: "np-40", kg: 25, title: "Massimale: k-vicini fatti in casa",
      task: `<p>Costruisci un mini-KNN da zero (quello vero, in scikit-learn, farà lo stesso identico calcolo dietro le quinte). Su <code>punti</code> ed <code>etichette</code>, per la <code>query</code> data:</p>
<ul>
<li><code>distanze</code>: distanza euclidea di <code>query</code> da ogni punto</li>
<li><code>k</code>: 3</li>
<li><code>indici_vicini</code>: gli indici dei 3 punti più vicini (dal più al meno vicino)</li>
<li><code>previsione</code>: l'etichetta più frequente tra i 3 vicini (usa <code>Counter</code> come nel riscaldamento, o conta a mano)</li>
</ul>`,
      starter: `import numpy as np
from collections import Counter

punti = np.array([[0,0], [1,1], [5,5], [6,6], [0,1], [5,6]])
etichette = np.array(["A", "A", "B", "B", "A", "B"])
query = np.array([1, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
k = 3
indici_vicini = np.argsort(distanze)[:k]

voti = Counter(etichette[indici_vicini])
previsione = voti.most_common(1)[0][0]

print(distanze.round(2))
print(indici_vicini)
print(previsione)`,
      check: `import numpy as np
assert list(indici_vicini) == [0, 1, 4]
assert previsione == "A"`,
      hint: `<p>I 3 punti più vicini a (1,0) sono (0,0), (1,1) e (0,1) — tutti etichettati "A": la maggioranza vince, "A" è la previsione. Nessuna sorpresa: è letteralmente come funziona KNeighborsClassifier.</p>`,
      solution: `import numpy as np
from collections import Counter

punti = np.array([[0,0], [1,1], [5,5], [6,6], [0,1], [5,6]])
etichette = np.array(["A", "A", "B", "B", "A", "B"])
query = np.array([1, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
k = 3
indici_vicini = np.argsort(distanze)[:k]

voti = Counter(etichette[indici_vicini])
previsione = voti.most_common(1)[0][0]

print(distanze.round(2))
print(indici_vicini)
print(previsione)`
    },

    {
      type: "exercise", id: "np-41", kg: 10, title: "Drill: assegna con lo slicing",
      task: `<p>Su <code>m</code> (matrice 3×3 di zeri): assegna 5 a tutta la prima colonna in un colpo solo (senza cicli).</p>`,
      starter: `import numpy as np

m = np.zeros((3,3))
m[:, 0] = 5

print(m)`,
      check: `import numpy as np
assert np.array_equal(m[:, 0], [5, 5, 5])
assert np.array_equal(m[:, 1], [0, 0, 0])`,
      hint: `<p><code>m[:, 0] = 5</code> sfrutta il broadcasting: il singolo valore 5 si "propaga" su tutte e 3 le righe della colonna selezionata.</p>`,
      solution: `import numpy as np

m = np.zeros((3,3))
m[:, 0] = 5

print(m)`
    },

    {
      type: "exercise", id: "np-42", kg: 20, title: "Drill: centra le righe con keepdims",
      task: `<p>Su <code>mat</code> (2×3): centra ogni RIGA (sottrai la sua media) usando <code>axis=1, keepdims=True</code>, cosa che rende il broadcasting corretto.</p>`,
      starter: `import numpy as np

mat = np.array([[1.,2,3],[4,5,6]])

medie_riga = mat.mean(axis=1, keepdims=True)
centrata = mat - medie_riga

print(medie_riga.shape)
print(centrata)`,
      check: `import numpy as np
assert medie_riga.shape == (2, 1)
assert np.allclose(centrata, [[-1,0,1],[-1,0,1]])`,
      hint: `<p>Senza <code>keepdims=True</code>, <code>medie_riga</code> avrebbe shape <code>(2,)</code>, che il broadcasting allineerebbe alle COLONNE (sbagliato); con <code>keepdims=True</code> ha shape <code>(2,1)</code>, che si allinea correttamente riga per riga.</p>`,
      solution: `import numpy as np

mat = np.array([[1.,2,3],[4,5,6]])

medie_riga = mat.mean(axis=1, keepdims=True)
centrata = mat - medie_riga

print(medie_riga.shape)
print(centrata)`
    },

    {
      type: "exercise", id: "np-43", kg: 20, title: "Drill: la classe più probabile, riga per riga",
      task: `<p><code>proba</code> è una matrice 2×3 (2 osservazioni, probabilità di 3 classi). Trova <code>classi_previste</code>: l'indice della classe più probabile per OGNI riga.</p>`,
      starter: `import numpy as np

proba = np.array([[0.1, 0.7, 0.2], [0.6, 0.3, 0.1]])

classi_previste = np.argmax(proba, axis=1)
print(classi_previste)`,
      check: `import numpy as np
assert list(classi_previste) == [1, 0]`,
      hint: `<p><code>axis=1</code>: per ogni riga (osservazione), cerca l'indice di colonna (classe) col valore massimo — esattamente il pattern che userai dopo <code>predict_proba</code> in scikit-learn.</p>`,
      solution: `import numpy as np

proba = np.array([[0.1, 0.7, 0.2], [0.6, 0.3, 0.1]])

classi_previste = np.argmax(proba, axis=1)
print(classi_previste)`
    },

    {
      type: "exercise", id: "np-44", kg: 20, title: "Drill: i 3 più piccoli, senza ordinare tutto",
      task: `<p>Con <code>np.argpartition</code>, trova i 3 valori più piccoli di <code>arr</code> SENZA usare <code>argsort</code> (che ordinerebbe l'intero array).</p>`,
      starter: `import numpy as np

arr = np.array([5, 1, 9, 3, 7, 2])

idx_piccoli = np.argpartition(arr, 3)[:3]
valori_piccoli = sorted(arr[idx_piccoli].tolist())

print(valori_piccoli)`,
      check: `assert valori_piccoli == [1, 2, 3]`,
      hint: `<p><code>np.argpartition(arr, k)</code> garantisce che i primi k indici restituiti corrispondano ai k valori più piccoli (in un ordine qualsiasi tra loro) — più veloce di un ordinamento completo su array grandi.</p>`,
      solution: `import numpy as np

arr = np.array([5, 1, 9, 3, 7, 2])

idx_piccoli = np.argpartition(arr, 3)[:3]
valori_piccoli = sorted(arr[idx_piccoli].tolist())

print(valori_piccoli)`
    },

    {
      type: "exercise", id: "np-45", kg: 10, title: "Drill: quando il tipo cambia da solo",
      task: `<p>Confronta il <code>dtype</code> di due array quasi identici: <code>a</code> (tutti interi) e <code>b</code> (un solo elemento float).</p>`,
      starter: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([1.0, 2, 3])

dtype_a = a.dtype.kind
dtype_b = b.dtype.kind

print(dtype_a, dtype_b)`,
      check: `assert dtype_a == "i"
assert dtype_b == "f"`,
      hint: `<p>Basta UN solo elemento float per far sì che NumPy converta l'intero array a float — sceglie sempre il tipo più "ampio" capace di rappresentare tutti gli elementi.</p>`,
      solution: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([1.0, 2, 3])

dtype_a = a.dtype.kind
dtype_b = b.dtype.kind

print(dtype_a, dtype_b)`
    },

    {
      type: "exercise", id: "np-46", kg: 15, title: "Drill: reshape condivide la memoria",
      task: `<p>Dimostra che <code>reshape</code> restituisce spesso una VISTA: modifica un elemento della versione reshaped di <code>orig</code> e osserva che anche <code>orig</code> cambia.</p>`,
      starter: `import numpy as np

orig = np.arange(6)
vista = orig.reshape(2, 3)

vista[0, 0] = 99

print(orig)`,
      check: `import numpy as np
assert orig[0] == 99, "Modificare la vista reshaped deve modificare anche l'array originale: condividono la stessa memoria"`,
      hint: `<p><code>reshape</code> non copia i dati quando può evitarlo: restituisce una nuova "finestra" sugli stessi numeri in memoria, non un array indipendente.</p>`,
      solution: `import numpy as np

orig = np.arange(6)
vista = orig.reshape(2, 3)

vista[0, 0] = 99

print(orig)`
    },

    {
      type: "exercise", id: "np-47", kg: 15, title: "Drill: il fancy indexing invece copia",
      task: `<p>Al contrario dello slicing/reshape: modifica il risultato di un fancy indexing su <code>v</code> e verifica che <code>v</code> ORIGINALE resti invariato.</p>`,
      starter: `import numpy as np

v = np.array([10, 20, 30, 40])
selezionati = v[[0, 2]]

selezionati[0] = 999

print(v)
print(selezionati)`,
      check: `import numpy as np
assert list(v) == [10, 20, 30, 40], "v non deve cambiare: il fancy indexing restituisce sempre una copia"
assert list(selezionati) == [999, 30]`,
      hint: `<p>Il fancy indexing (indicizzare con una LISTA di indici, non con uno slice) restituisce sempre una copia indipendente — comportamento opposto allo slicing visto nell'esercizio precedente.</p>`,
      solution: `import numpy as np

v = np.array([10, 20, 30, 40])
selezionati = v[[0, 2]]

selezionati[0] = 999

print(v)
print(selezionati)`
    },

    {
      type: "exercise", id: "np-48", kg: 15, title: "Drill: impila righe e colonne",
      task: `<p>Con <code>a1</code> e <code>a2</code> (righe 1×2): <code>impilate_v</code> (verticalmente, <code>vstack</code>) e <code>impilate_h</code> (orizzontalmente, <code>hstack</code>).</p>`,
      starter: `import numpy as np

a1 = np.array([[1, 2]])
a2 = np.array([[3, 4]])

impilate_v = np.vstack([a1, a2])
impilate_h = np.hstack([a1, a2])

print(impilate_v)
print(impilate_h)`,
      check: `import numpy as np
assert impilate_v.shape == (2, 2)
assert impilate_h.shape == (1, 4)`,
      hint: `<p><code>vstack</code> aggiunge righe (impila "verso il basso"); <code>hstack</code> aggiunge colonne (impila "di lato") — la shape risultante lo conferma.</p>`,
      solution: `import numpy as np

a1 = np.array([[1, 2]])
a2 = np.array([[3, 4]])

impilate_v = np.vstack([a1, a2])
impilate_h = np.hstack([a1, a2])

print(impilate_v)
print(impilate_h)`
    },

    {
      type: "exercise", id: "np-49", kg: 15, title: "Drill: crea una dimensione nuova con stack",
      task: `<p>Con <code>np.stack</code> (non <code>concatenate</code>), unisci <code>s1</code> e <code>s2</code> (vettori 1D di 3 elementi) in una matrice 2×3.</p>`,
      starter: `import numpy as np

s1 = np.array([1, 2, 3])
s2 = np.array([4, 5, 6])

impilati = np.stack([s1, s2])
print(impilati)
print(impilati.shape)`,
      check: `import numpy as np
assert impilati.shape == (2, 3)
assert np.array_equal(impilati[0], s1)
assert np.array_equal(impilati[1], s2)`,
      hint: `<p><code>np.stack</code> crea una dimensione COMPLETAMENTE NUOVA (qui, la dimensione delle "righe"), a differenza di <code>concatenate</code> che estende una dimensione già esistente.</p>`,
      solution: `import numpy as np

s1 = np.array([1, 2, 3])
s2 = np.array([4, 5, 6])

impilati = np.stack([s1, s2])
print(impilati)
print(impilati.shape)`
    },

    {
      type: "exercise", id: "np-50", kg: 15, title: "Drill: due modi di misurare la distanza",
      task: `<p>Tra <code>p1</code> e <code>p2</code>: <code>dist_euclidea</code> e <code>dist_manhattan</code> (somma dei valori assoluti delle differenze).</p>`,
      starter: `import numpy as np

p1 = np.array([0, 0])
p2 = np.array([3, 4])

dist_euclidea = np.sqrt(((p1 - p2) ** 2).sum())
dist_manhattan = np.abs(p1 - p2).sum()

print(dist_euclidea, dist_manhattan)`,
      check: `assert abs(dist_euclidea - 5.0) < 1e-9
assert dist_manhattan == 7`,
      hint: `<p>La distanza euclidea è la "linea d'aria" (5, il teorema di Pitagora su 3 e 4); quella di Manhattan è "quanto ci vorrebbe muovendosi solo in orizzontale e verticale" (3+4=7).</p>`,
      solution: `import numpy as np

p1 = np.array([0, 0])
p2 = np.array([3, 4])

dist_euclidea = np.sqrt(((p1 - p2) ** 2).sum())
dist_manhattan = np.abs(p1 - p2).sum()

print(dist_euclidea, dist_manhattan)`
    },

    {
      type: "exercise", id: "np-51", kg: 15, title: "Drill: la norma di un vettore",
      task: `<p>Con <code>np.linalg.norm</code>, calcola la lunghezza (norma euclidea) di <code>v</code>, e verifica che coincida con il calcolo manuale.</p>`,
      starter: `import numpy as np

v = np.array([3.0, 4.0])

norma_libreria = np.linalg.norm(v)
norma_manuale = np.sqrt((v ** 2).sum())

print(norma_libreria, norma_manuale)`,
      check: `assert abs(norma_libreria - 5.0) < 1e-9
assert abs(norma_libreria - norma_manuale) < 1e-9`,
      hint: `<p><code>np.linalg.norm</code> è solo una scorciatoia leggibile per <code>np.sqrt((v**2).sum())</code> — stesso identico risultato, notazione più compatta.</p>`,
      solution: `import numpy as np

v = np.array([3.0, 4.0])

norma_libreria = np.linalg.norm(v)
norma_manuale = np.sqrt((v ** 2).sum())

print(norma_libreria, norma_manuale)`
    },

    {
      type: "exercise", id: "np-52", kg: 20, title: "Drill: cumsum e diff sono operazioni inverse",
      task: `<p>Su <code>x</code>: calcola <code>c = np.cumsum(x)</code>, poi <code>d = np.diff(c)</code>, e verifica che <code>d</code> ricostruisca <code>x</code> (tranne il primo elemento).</p>`,
      starter: `import numpy as np

x = np.array([2, 5, 3, 8])

c = np.cumsum(x)
d = np.diff(c)

print(c)
print(d)
print(x[1:])`,
      check: `import numpy as np
assert np.array_equal(d, x[1:])`,
      hint: `<p><code>np.diff</code> calcola le differenze tra elementi consecutivi: applicata al totale cumulativo, ti restituisce esattamente gli incrementi originali (a partire dal secondo, perché il primo valore di <code>c</code> non ha un "prima" con cui confrontarsi).</p>`,
      solution: `import numpy as np

x = np.array([2, 5, 3, 8])

c = np.cumsum(x)
d = np.diff(c)

print(c)
print(d)
print(x[1:])`
    },

    {
      type: "exercise", id: "np-53", kg: 15, title: "Drill: quartili e IQR",
      task: `<p>Su <code>dati</code>: calcola <code>q1</code>, <code>q3</code> con <code>np.percentile</code>, e <code>iqr</code> (la loro differenza).</p>`,
      starter: `import numpy as np

dati = np.array([1,2,3,4,5,6,7,8,9,10])

q1, q3 = np.percentile(dati, [25, 75])
iqr = q3 - q1

print(q1, q3, iqr)`,
      check: `assert abs(q1 - 3.25) < 1e-9
assert abs(q3 - 7.75) < 1e-9
assert abs(iqr - 4.5) < 1e-9`,
      hint: `<p><code>np.percentile(dati, [25, 75])</code> restituisce entrambi i quartili in un colpo solo, passando una LISTA di percentili invece di chiamare la funzione due volte.</p>`,
      solution: `import numpy as np

dati = np.array([1,2,3,4,5,6,7,8,9,10])

q1, q3 = np.percentile(dati, [25, 75])
iqr = q3 - q1

print(q1, q3, iqr)`
    },

    {
      type: "exercise", id: "np-54", kg: 15, title: "Drill: where con un solo argomento",
      task: `<p>Con <code>np.where(condizione)</code> (un solo argomento), trova gli INDICI dove <code>t &gt; 20</code>.</p>`,
      starter: `import numpy as np

t = np.array([5, 15, 25, 35])

indici = np.where(t > 20)[0]
print(indici)`,
      check: `import numpy as np
assert list(indici) == [2, 3]`,
      hint: `<p><code>np.where(condizione)</code> con un solo argomento restituisce una TUPLA di array di indici (uno per dimensione): su un array 1D, <code>[0]</code> estrae l'unico array della tupla.</p>`,
      solution: `import numpy as np

t = np.array([5, 15, 25, 35])

indici = np.where(t > 20)[0]
print(indici)`
    },

    {
      type: "exercise", id: "np-55", kg: 20, title: "Drill: coordinate 2D dal massimo",
      task: `<p>Su <code>mat</code>: trova la POSIZIONE (riga, colonna) del valore massimo con <code>np.unravel_index</code>.</p>`,
      starter: `import numpy as np

mat = np.array([[1, 9, 3], [4, 5, 2]])

posizione = np.unravel_index(np.argmax(mat), mat.shape)
print(posizione)`,
      check: `assert tuple(posizione) == (0, 1)`,
      hint: `<p><code>np.argmax(mat)</code> da solo restituisce un indice "appiattito" (come se la matrice fosse una lista unica); <code>np.unravel_index</code> lo riconverte in coordinate (riga, colonna) sulla shape originale.</p>`,
      solution: `import numpy as np

mat = np.array([[1, 9, 3], [4, 5, 2]])

posizione = np.unravel_index(np.argmax(mat), mat.shape)
print(posizione)`
    },

    {
      type: "exercise", id: "np-56", kg: 20, title: "Combo: filtra righe intere da una condizione",
      task: `<p>Su <code>clienti</code> (colonne: id, spesa): estrai le RIGHE INTERE dove la spesa (seconda colonna) supera 100.</p>`,
      starter: `import numpy as np

clienti = np.array([
    [1, 50],
    [2, 150],
    [3, 80],
    [4, 200],
])

grandi_spendaccioni = clienti[clienti[:, 1] > 100]
print(grandi_spendaccioni)`,
      check: `import numpy as np
assert grandi_spendaccioni.shape == (2, 2)
assert np.array_equal(grandi_spendaccioni[:, 0], [2, 4])`,
      hint: `<p><code>clienti[:, 1] &gt; 100</code> crea una maschera booleana lunga quanto il numero di righe; usata come indice di riga (<code>clienti[maschera]</code>), seleziona le righe INTERE che la soddisfano.</p>`,
      solution: `import numpy as np

clienti = np.array([
    [1, 50],
    [2, 150],
    [3, 80],
    [4, 200],
])

grandi_spendaccioni = clienti[clienti[:, 1] > 100]
print(grandi_spendaccioni)`
    },

    {
      type: "exercise", id: "np-57", kg: 20, title: "Combo: azzera i valori fuori range",
      task: `<p>Su <code>letture</code> (con valori fuori scala): usa <code>clip</code> per contenerle tra 0 e 100, poi conta quante sono state effettivamente modificate.</p>`,
      starter: `import numpy as np

letture = np.array([-10, 50, 150, 30, 200, 80])

letture_valide = np.clip(letture, 0, 100)
n_modificate = (letture != letture_valide).sum()

print(letture_valide)
print(n_modificate)`,
      check: `import numpy as np
assert list(letture_valide) == [0, 50, 100, 30, 100, 80]
assert n_modificate == 3`,
      hint: `<p>Confrontare l'array originale con quello clippato (<code>!=</code>) dice esattamente QUALI e QUANTI valori sono stati toccati dal clip.</p>`,
      solution: `import numpy as np

letture = np.array([-10, 50, 150, 30, 200, 80])

letture_valide = np.clip(letture, 0, 100)
n_modificate = (letture != letture_valide).sum()

print(letture_valide)
print(n_modificate)`
    },

    {
      type: "exercise", id: "np-58", kg: 20, title: "Combo: normalizza e conta le anomalie",
      task: `<p>Su <code>x</code>: calcola gli z-score, poi <code>outlier_idx</code> (indici con |z|>2, usando <code>np.where</code> a un argomento), poi <code>quanti</code>.</p>`,
      starter: `import numpy as np

x = np.array([10, 12, 11, 13, 9, 50, 10, 11])

z = (x - x.mean()) / x.std()
outlier_idx = np.where(np.abs(z) > 2)[0]
quanti = len(outlier_idx)

print(z.round(2))
print(outlier_idx, quanti)`,
      check: `import numpy as np
assert quanti == 1
assert outlier_idx[0] == 5`,
      hint: `<p>Il valore 50 è nettamente fuori scala rispetto agli altri (tutti tra 9 e 13): il suo z-score deve superare abbondantemente 2 in valore assoluto.</p>`,
      solution: `import numpy as np

x = np.array([10, 12, 11, 13, 9, 50, 10, 11])

z = (x - x.mean()) / x.std()
outlier_idx = np.where(np.abs(z) > 2)[0]
quanti = len(outlier_idx)

print(z.round(2))
print(outlier_idx, quanti)`
    },

    {
      type: "exercise", id: "np-59", kg: 20, title: "Combo: fasce di età con select",
      task: `<p>Su <code>eta</code>: classifica in <code>"minore"</code> (&lt;18), <code>"adulto"</code> (18-64), <code>"senior"</code> (&gt;=65) con <code>np.select</code>.</p>`,
      starter: `import numpy as np

eta = np.array([15, 30, 70, 18, 64, 65])

cond = [eta < 18, (eta >= 18) & (eta < 65), eta >= 65]
val = ["minore", "adulto", "senior"]

fasce = np.select(cond, val, default="?")
print(fasce)`,
      check: `import numpy as np
assert list(fasce) == ["minore", "adulto", "senior", "adulto", "adulto", "senior"]`,
      hint: `<p>64 rientra ancora in "adulto" (< 65), mentre 65 passa già a "senior": il confine è netto e va rispettato esattamente come scritto nelle condizioni.</p>`,
      solution: `import numpy as np

eta = np.array([15, 30, 70, 18, 64, 65])

cond = [eta < 18, (eta >= 18) & (eta < 65), eta >= 65]
val = ["minore", "adulto", "senior"]

fasce = np.select(cond, val, default="?")
print(fasce)`
    },

    {
      type: "exercise", id: "np-60", kg: 20, title: "Combo: quando supero il budget?",
      task: `<p>Su <code>spese_giornaliere</code> e un <code>budget</code>: trova il PRIMO giorno in cui il totale cumulativo supera il budget.</p>`,
      starter: `import numpy as np

spese_giornaliere = np.array([100, 150, 200, 80, 300])
budget = 400

cumulativo = np.cumsum(spese_giornaliere)
primo_giorno_sforo = int(np.argmax(cumulativo > budget))

print(cumulativo)
print(primo_giorno_sforo)`,
      check: `assert primo_giorno_sforo == 2`,
      hint: `<p><code>argmax</code> su una maschera booleana trova il PRIMO <code>True</code>: il primo indice in cui il totale cumulativo (100, 250, 450...) supera 400.</p>`,
      solution: `import numpy as np

spese_giornaliere = np.array([100, 150, 200, 80, 300])
budget = 400

cumulativo = np.cumsum(spese_giornaliere)
primo_giorno_sforo = int(np.argmax(cumulativo > budget))

print(cumulativo)
print(primo_giorno_sforo)`
    },

    {
      type: "exercise", id: "np-61", kg: 20, title: "Combo: top-3 con i loro valori originali",
      task: `<p>Da <code>punteggi</code> e <code>nomi</code> paralleli: trova <code>top3_nomi</code> e <code>top3_punteggi</code>, ordinati dal migliore.</p>`,
      starter: `import numpy as np

nomi = np.array(["Ada", "Bo", "Cin", "Dan", "Elio"])
punteggi = np.array([72, 95, 60, 88, 91])

ordine = np.argsort(punteggi)[::-1][:3]
top3_nomi = nomi[ordine]
top3_punteggi = punteggi[ordine]

print(top3_nomi)
print(top3_punteggi)`,
      check: `import numpy as np
assert list(top3_nomi) == ["Bo", "Elio", "Dan"]
assert list(top3_punteggi) == [95, 91, 88]`,
      hint: `<p>Lo stesso array di indici (<code>ordine</code>) indicizza SIA <code>nomi</code> SIA <code>punteggi</code>: perché sono array paralleli, gli indici restano coerenti tra i due.</p>`,
      solution: `import numpy as np

nomi = np.array(["Ada", "Bo", "Cin", "Dan", "Elio"])
punteggi = np.array([72, 95, 60, 88, 91])

ordine = np.argsort(punteggi)[::-1][:3]
top3_nomi = nomi[ordine]
top3_punteggi = punteggi[ordine]

print(top3_nomi)
print(top3_punteggi)`
    },

    {
      type: "exercise", id: "np-62", kg: 25, title: "Combo: matrice di distanze tra più punti",
      task: `<p>Con un doppio ciclo, costruisci <code>matrice_distanze</code>: la distanza euclidea tra OGNI coppia di punti in <code>punti</code> (4 punti 2D).</p>`,
      starter: `import numpy as np

punti = np.array([[0,0], [3,4], [6,8], [1,1]])
n = len(punti)

matrice_distanze = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_distanze[i, j] = np.sqrt(((punti[i] - punti[j])**2).sum())

print(matrice_distanze.round(2))`,
      check: `import numpy as np
assert matrice_distanze.shape == (4, 4)
assert np.allclose(np.diag(matrice_distanze), 0.0)
assert abs(matrice_distanze[0,1] - 5.0) < 1e-9`,
      hint: `<p>La diagonale è sempre 0 (la distanza di un punto da se stesso); la matrice è simmetrica (<code>matrice_distanze[i,j] == matrice_distanze[j,i]</code>), perché la distanza non dipende dalla direzione in cui la misuri.</p>`,
      solution: `import numpy as np

punti = np.array([[0,0], [3,4], [6,8], [1,1]])
n = len(punti)

matrice_distanze = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_distanze[i, j] = np.sqrt(((punti[i] - punti[j])**2).sum())

print(matrice_distanze.round(2))`
    },

    {
      type: "exercise", id: "np-63", kg: 25, title: "Combo: standardizza e poi torna indietro",
      task: `<p>Standardizza <code>x</code>, poi "destandardizza" il risultato usando media e std ORIGINALI, verificando di ritrovare <code>x</code>.</p>`,
      starter: `import numpy as np

x = np.array([10., 20., 30., 40., 50.])
media, std = x.mean(), x.std()

x_std = (x - media) / std
x_ricostruito = x_std * std + media

print(x_std.round(3))
print(x_ricostruito.round(6))`,
      check: `import numpy as np
assert np.allclose(x_ricostruito, x)`,
      hint: `<p>Standardizzare e destandardizzare sono operazioni INVERSE: se conservi media e std originali, puoi sempre tornare ai dati di partenza — un buon modo per verificare di aver applicato la formula giusta.</p>`,
      solution: `import numpy as np

x = np.array([10., 20., 30., 40., 50.])
media, std = x.mean(), x.std()

x_std = (x - media) / std
x_ricostruito = x_std * std + media

print(x_std.round(3))
print(x_ricostruito.round(6))`
    },

    {
      type: "exercise", id: "np-64", kg: 25, title: "Combo: quante righe sono complete",
      task: `<p>Su <code>dati</code> (con NaN in alcune posizioni): trova <code>righe_complete</code> (maschera booleana, nessun NaN nella riga) usando <code>np.isnan</code> e <code>np.any</code>.</p>`,
      starter: `import numpy as np

dati = np.array([
    [1., 2., 3.],
    [4., np.nan, 6.],
    [7., 8., 9.],
    [np.nan, np.nan, 12.],
])

ha_nan = np.isnan(dati).any(axis=1)
righe_complete = ~ha_nan
n_complete = righe_complete.sum()

print(ha_nan)
print(righe_complete)
print(n_complete)`,
      check: `import numpy as np
assert list(righe_complete) == [True, False, True, False]
assert n_complete == 2`,
      hint: `<p><code>np.isnan(dati).any(axis=1)</code> dà <code>True</code> per ogni riga che ha ALMENO un NaN; <code>~</code> (tilde) inverte la maschera booleana, ottenendo le righe SENZA NaN.</p>`,
      solution: `import numpy as np

dati = np.array([
    [1., 2., 3.],
    [4., np.nan, 6.],
    [7., 8., 9.],
    [np.nan, np.nan, 12.],
])

ha_nan = np.isnan(dati).any(axis=1)
righe_complete = ~ha_nan
n_complete = righe_complete.sum()

print(ha_nan)
print(righe_complete)
print(n_complete)`
    },

    {
      type: "exercise", id: "np-65", kg: 25, title: "Combo: quante colonne per ogni riga superano la soglia",
      task: `<p>Su <code>voti</code> (4 studenti × 3 materie): conta, per OGNI studente, in quante materie ha superato 6 (usa <code>.sum(axis=1)</code> su una maschera).</p>`,
      starter: `import numpy as np

voti = np.array([
    [7, 5, 8],
    [4, 6, 5],
    [9, 9, 9],
    [3, 4, 5],
])

materie_superate = (voti >= 6).sum(axis=1)
print(materie_superate)`,
      check: `import numpy as np
assert list(materie_superate) == [2, 1, 3, 0]`,
      hint: `<p><code>(voti &gt;= 6)</code> è una matrice di True/False della stessa shape di <code>voti</code>; sommarla lungo <code>axis=1</code> conta, riga per riga, quanti True (materie superate) ci sono.</p>`,
      solution: `import numpy as np

voti = np.array([
    [7, 5, 8],
    [4, 6, 5],
    [9, 9, 9],
    [3, 4, 5],
])

materie_superate = (voti >= 6).sum(axis=1)
print(materie_superate)`
    },

    {
      type: "exercise", id: "np-66", kg: 25, title: "Massimale: normalizza per riga E per colonna",
      task: `<p>Su <code>m</code>: prima normalizza ogni RIGA (dividi per la somma della riga, così ogni riga somma a 1), poi verifica che ogni riga di <code>normalizzata</code> sommi effettivamente a 1.</p>`,
      starter: `import numpy as np

m = np.array([[2., 3., 5.], [1., 1., 2.], [4., 4., 4.]])

somme_riga = m.sum(axis=1, keepdims=True)
normalizzata = m / somme_riga

print(normalizzata.round(3))
print(normalizzata.sum(axis=1))`,
      check: `import numpy as np
assert np.allclose(normalizzata.sum(axis=1), [1.0, 1.0, 1.0])`,
      hint: `<p>Dividere ogni riga per il proprio totale è un pattern comune per trasformare punteggi grezzi in "proporzioni" (o pseudo-probabilità) che sommano sempre a 1 — richiede <code>keepdims=True</code> per il broadcasting corretto, come visto in questa sala.</p>`,
      solution: `import numpy as np

m = np.array([[2., 3., 5.], [1., 1., 2.], [4., 4., 4.]])

somme_riga = m.sum(axis=1, keepdims=True)
normalizzata = m / somme_riga

print(normalizzata.round(3))
print(normalizzata.sum(axis=1))`
    },

    {
      type: "exercise", id: "np-67", kg: 25, title: "Massimale: il vicino più prossimo per ogni punto",
      task: `<p>Per OGNI punto in <code>punti</code>, trova l'indice del punto più vicino TRA GLI ALTRI (non se stesso) — usa la matrice di distanze e maschera la diagonale con infinito.</p>`,
      starter: `import numpy as np

punti = np.array([[0,0], [1,1], [10,10], [11,11]])
n = len(punti)

matrice_distanze = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_distanze[i, j] = np.sqrt(((punti[i] - punti[j])**2).sum())

np.fill_diagonal(matrice_distanze, np.inf)
vicino_piu_prossimo = np.argmin(matrice_distanze, axis=1)

print(matrice_distanze.round(2))
print(vicino_piu_prossimo)`,
      check: `import numpy as np
assert list(vicino_piu_prossimo) == [1, 0, 3, 2]`,
      hint: `<p><code>np.fill_diagonal(matrice, np.inf)</code> impedisce che un punto risulti "vicino a se stesso" (distanza 0, sempre la più piccola possibile): dopo, <code>argmin</code> per riga trova il vicino VERO più prossimo.</p>`,
      solution: `import numpy as np

punti = np.array([[0,0], [1,1], [10,10], [11,11]])
n = len(punti)

matrice_distanze = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        matrice_distanze[i, j] = np.sqrt(((punti[i] - punti[j])**2).sum())

np.fill_diagonal(matrice_distanze, np.inf)
vicino_piu_prossimo = np.argmin(matrice_distanze, axis=1)

print(matrice_distanze.round(2))
print(vicino_piu_prossimo)`
    },

    {
      type: "exercise", id: "np-68", kg: 25, title: "Massimale: pulizia e classificazione in pipeline",
      task: `<p>Su <code>letture</code> (con un outlier): 1) calcola gli z-score, 2) sostituisci gli outlier (|z|>2) con la mediana, 3) classifica il risultato pulito in fasce con <code>np.select</code>.</p>`,
      starter: `import numpy as np

letture = np.array([20., 22., 21., 19., 90., 23., 18.])

z = (letture - letture.mean()) / letture.std()
outlier = np.abs(z) > 2
pulite = np.where(outlier, np.median(letture), letture)

cond = [pulite < 20, (pulite >= 20) & (pulite < 25), pulite >= 25]
val = ["basso", "normale", "alto"]
fasce = np.select(cond, val, default="?")

print(pulite)
print(fasce)`,
      check: `import numpy as np
assert pulite[4] == 21.0, "L'outlier (90) va sostituito con la mediana delle letture (21.0)"
assert list(fasce) == ["normale", "normale", "normale", "basso", "normale", "normale", "basso"]`,
      hint: `<p>L'ordine conta: prima ripulisci l'outlier, POI classifica i dati PULITI — classificare i dati grezzi metterebbe ancora 90 in una fascia "alto" che non ha più senso dopo la correzione.</p>`,
      solution: `import numpy as np

letture = np.array([20., 22., 21., 19., 90., 23., 18.])

z = (letture - letture.mean()) / letture.std()
outlier = np.abs(z) > 2
pulite = np.where(outlier, np.median(letture), letture)

cond = [pulite < 20, (pulite >= 20) & (pulite < 25), pulite >= 25]
val = ["basso", "normale", "alto"]
fasce = np.select(cond, val, default="?")

print(pulite)
print(fasce)`
    },

    {
      type: "exercise", id: "np-69", kg: 25, title: "Massimale finale: k-vicini con voto pesato",
      task: `<p>Estendi il mini-KNN visto in questa sala: invece del voto a maggioranza semplice, pesa ogni vicino per l'INVERSO della sua distanza (i più vicini contano di più).</p>`,
      starter: `import numpy as np

punti = np.array([[0,0], [1,1], [5,5], [6,6], [0,1]])
etichette = np.array(["A", "A", "B", "B", "A"])
query = np.array([1, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
k = 3
indici_vicini = np.argsort(distanze)[:k]

pesi = 1 / (distanze[indici_vicini] + 1e-9)
voti = {}
for idx, peso in zip(indici_vicini, pesi):
    etichetta = etichette[idx]
    voti[etichetta] = voti.get(etichetta, 0) + peso

previsione = max(voti, key=voti.get)

print(distanze.round(3))
print(voti)
print(previsione)`,
      check: `assert previsione == "A"`,
      hint: `<p><code>1e-9</code> al denominatore evita la divisione per zero nel caso (raro) in cui un vicino coincida esattamente con la query; il voto pesato dà più importanza ai vicini più vicini, invece di contarli tutti allo stesso modo.</p>`,
      solution: `import numpy as np

punti = np.array([[0,0], [1,1], [5,5], [6,6], [0,1]])
etichette = np.array(["A", "A", "B", "B", "A"])
query = np.array([1, 0])

distanze = np.sqrt(((punti - query) ** 2).sum(axis=1))
k = 3
indici_vicini = np.argsort(distanze)[:k]

pesi = 1 / (distanze[indici_vicini] + 1e-9)
voti = {}
for idx, peso in zip(indici_vicini, pesi):
    etichetta = etichette[idx]
    voti[etichetta] = voti.get(etichetta, 0) + peso

previsione = max(voti, key=voti.get)

print(distanze.round(3))
print(voti)
print(previsione)`
    }
  ]
});
