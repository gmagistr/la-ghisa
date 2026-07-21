window.MODULES.push({
  id: "dataviz",
  name: "Data Visualization",
  tagline: "La sala del grafico giusto: istogrammi, boxplot, scatter, heatmap. Scegliere e costruire la visualizzazione che racconta i dati.",
  intro: "Un grafico giusto vale più di mille numeri; uno sbagliato mente. Qui impari a scegliere e costruire la visualizzazione adatta a ogni domanda — distribuzione, relazione, confronto, composizione — calcolando i dati che la alimentano con NumPy. Matplotlib gira nel browser, ma qui verifichiamo la logica dietro ai grafici.",
  packages: ["numpy"],
  items: [

    { type: "theory", title: "Scegliere il grafico giusto", html: `
<p>Prima di disegnare, chiediti: <strong>che domanda voglio rispondere?</strong> Il tipo di grafico segue la domanda, non i gusti.</p>
<ul>
<li><strong>Distribuzione</strong> (com'è sparsa una variabile?): istogramma, boxplot, violin plot;</li>
<li><strong>Relazione</strong> (due variabili sono legate?): scatter plot, heatmap di correlazione;</li>
<li><strong>Confronto</strong> (categorie a confronto?): bar chart, box plot per gruppo;</li>
<li><strong>Composizione</strong> (parti di un tutto?): stacked bar, (raramente) pie chart;</li>
<li><strong>Andamento nel tempo</strong>: line chart.</li>
</ul>
<pre><code>import matplotlib.pyplot as plt
plt.hist(dati)        # distribuzione
plt.scatter(x, y)     # relazione
plt.bar(cat, valori)  # confronto tra categorie
plt.plot(tempo, y)    # andamento temporale</code></pre>
`, more: `
<p>La scelta del grafico è una scelta di COMUNICAZIONE, e il grafico sbagliato non solo è inefficace ma può ingannare. Il <strong>pie chart</strong> è il caso più criticato: gli umani leggono male gli angoli, confrontare fette è difficile, e con più di 3-4 categorie diventa illeggibile — quasi sempre un bar chart comunica meglio le stesse proporzioni. Regola pratica: se ti viene voglia di un pie chart, prova prima un bar chart ordinato. Allo stesso modo, un line chart implica continuità/ordine (adatto al tempo, sbagliato per categorie non ordinate), e uno scatter implica due variabili continue.</p>
<p>Il principio guida è il <strong>rapporto dati/inchiostro</strong> (data-ink ratio) di Edward Tufte: massimizza l'informazione, minimizza il "chartjunk" (decorazioni inutili, effetti 3D, gradienti, griglie pesanti). Un grafico pulito con solo ciò che serve comunica più di uno sovraccarico di orpelli. Gli effetti 3D in particolare distorcono la percezione (le fette 3D di un pie sono ancora peggio di quelle 2D) e vanno evitati. La grafica migliore è spesso la più sobria: assi chiari, etichette leggibili, niente di superfluo.</p>
<p>La regola aurea dell'onestà visiva riguarda gli ASSI, ed è dove i grafici mentono più spesso: un asse y che non parte da zero può esagerare drammaticamente differenze minime (un aumento dello 0.1% sembra un raddoppio se tagli l'asse), le scale logaritmiche vanno dichiarate (altrimenti la crescita esponenziale sembra lineare), e i doppi assi y possono suggerire correlazioni inesistenti. Nei bar chart l'asse DEVE partire da zero (l'altezza della barra rappresenta il valore); nei line chart per serie temporali si può troncare ma va segnalato. Riconoscere questi trucchi — sia per non usarli sia per non farsi ingannare — è alfabetizzazione visiva fondamentale per chiunque comunichi con i dati.</p>
` },

    {
      type: "exercise", id: "dv-01", kg: 5, title: "Quale grafico per quale domanda",
      task: `<p>Associa ogni domanda al tipo di grafico giusto (stringa):</p>
<ul>
<li><code>g_distribuzione</code>: "com'è distribuita l'età dei clienti?" &rarr; "istogramma" o "scatter"?</li>
<li><code>g_relazione</code>: "altezza e peso sono correlati?" &rarr; "scatter" o "bar"?</li>
<li><code>g_confronto</code>: "vendite per regione a confronto?" &rarr; "bar" o "line"?</li>
<li><code>g_tempo</code>: "andamento delle vendite nel tempo?" &rarr; "line" o "istogramma"?</li>
</ul>`,
      starter: `g_distribuzione = "istogramma"
g_relazione = ...
g_confronto = ...
g_tempo = ...

print(g_distribuzione, g_relazione, g_confronto, g_tempo)`,
      check: `assert g_distribuzione == "istogramma", "distribuzione di una variabile -> istogramma"
assert g_relazione == "scatter", "relazione tra due variabili continue -> scatter plot"
assert g_confronto == "bar", "confronto tra categorie -> bar chart"
assert g_tempo == "line", "andamento nel tempo -> line chart"`,
      hint: `<p>Distribuzione = istogramma, relazione tra due continue = scatter, confronto categorie = bar, tempo = line. Il grafico segue la domanda.</p>`,
      solution: `g_distribuzione = "istogramma"
g_relazione = "scatter"
g_confronto = "bar"
g_tempo = "line"

print(g_distribuzione, g_relazione, g_confronto, g_tempo)`
    },

    { type: "theory", title: "L'istogramma: vedere una distribuzione", html: `
<p>L'<strong>istogramma</strong> mostra come è distribuita una variabile: divide il range in intervalli (<em>bin</em>) e conta quanti valori cadono in ciascuno. Rivela forma, centro, dispersione, code e picchi — cose che media e deviazione standard da sole nascondono.</p>
<pre><code>import numpy as np
import matplotlib.pyplot as plt
conteggi, bordi = np.histogram(dati, bins=10)   # i dati dietro il grafico
plt.hist(dati, bins=10)                          # il grafico</code></pre>
<p>La scelta del numero di <strong>bin</strong> è cruciale: troppo pochi appiattiscono i dettagli (nascondono la forma), troppi creano rumore (ogni bin ha pochi punti). Regole comuni: √n, o la regola di Sturges. L'istogramma è il primo grafico da fare in ogni EDA (analisi esplorativa) per capire con che dati hai a che fare.</p>
`, more: `
<p>La forma dell'istogramma racconta storie che i numeri riassuntivi cancellano: una distribuzione <strong>bimodale</strong> (due picchi) segnala spesso due popolazioni mescolate (es. altezze di uomini e donne insieme) — e la media cadrebbe nella valle tra i due picchi, un valore che quasi nessuno ha! Una coda lunga a destra (skew) indica outlier o processi moltiplicativi (redditi, tempi di attesa). Un picco a un valore anomalo può rivelare un default o un errore di raccolta (tanti "0" o "999" sospetti). Fare l'istogramma PRIMA di calcolare statistiche è ciò che evita conclusioni sbagliate — il quartetto di Anscombe e le sue distribuzioni con statistiche identiche ma forme diverse insegnano proprio questo.</p>
<p>La scelta dei bin è più impattante di quanto sembri: lo STESSO dataset può sembrare unimodale con pochi bin e bimodale con più bin, o pieno di rumore con troppi. Non c'è un numero "giusto" universale — √n e Sturges sono punti di partenza, ma l'esplorazione con bin diversi è parte dell'EDA. Un'alternativa che evita la scelta dei bin è la <strong>KDE</strong> (kernel density estimation), che stima una curva di densità liscia — mostra la forma senza la discretizzazione arbitraria dell'istogramma, al prezzo di un parametro di smoothing (la bandwidth) con lo stesso trade-off dei bin.</p>
<p>L'istogramma vs il <strong>boxplot</strong> (prossima lavagna): l'istogramma mostra la FORMA completa (multimodalità, code) ma occupa spazio ed è difficile da confrontare tra gruppi; il boxplot comprime la distribuzione in 5 numeri (quartili + baffi) perdendo la forma ma permettendo di confrontare a colpo d'occhio molti gruppi affiancati. Sono complementari: istogramma per esplorare UNA distribuzione in dettaglio, boxplot per CONFRONTARE molte distribuzioni compatte. Il <strong>violin plot</strong> combina i due: la forma di densità dell'istogramma nella compattezza del boxplot, mostrando sia la distribuzione sia i quartili — spesso la scelta migliore per confrontare distribuzioni quando la forma conta.</p>
` },

    {
      type: "exercise", id: "dv-02", kg: 10, title: "Costruire un istogramma",
      task: `<p>Calcola i dati dietro un istogramma con <code>np.histogram</code> e leggine la forma:</p>
<ul>
<li><code>conteggi</code>, <code>bordi</code>: da <code>np.histogram(dati, bins=5)</code></li>
<li><code>bin_piu_pieno</code>: l'indice del bin con più valori</li>
<li><code>totale</code>: la somma dei conteggi (deve essere uguale al numero di dati)</li>
<li><code>tutti_contati</code>: <code>True</code> se il totale dei conteggi è uguale a <code>len(dati)</code></li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
dati = rng.normal(50, 10, size=200)   # distribuzione normale attorno a 50`,
      starter: `import numpy as np
# dati: 200 valori normali (media 50)

conteggi, bordi = np.histogram(dati, bins=5)
bin_piu_pieno = ...
totale = ...
tutti_contati = ...

print("conteggi per bin:", conteggi.tolist())
print("bordi:", np.round(bordi, 1).tolist())
print("bin piu' pieno:", bin_piu_pieno)`,
      check: `import numpy as np
_c, _b = np.histogram(dati, bins=5)
assert 'conteggi' in globals() and np.array_equal(conteggi, _c), "conteggi: np.histogram(dati, bins=5)[0]"
assert 'bin_piu_pieno' in globals() and bin_piu_pieno == int(np.argmax(_c)), "bin_piu_pieno: np.argmax(conteggi)"
assert 'totale' in globals() and totale == int(_c.sum()), "totale: conteggi.sum()"
assert 'tutti_contati' in globals() and tutti_contati == True, "tutti_contati: la somma dei conteggi = len(dati) = 200"`,
      hint: `<p><code>np.histogram</code> restituisce (conteggi, bordi). <code>bin_piu_pieno = np.argmax(conteggi)</code>. Per una normale, il bin più pieno è al centro. <code>tutti_contati = conteggi.sum() == len(dati)</code>.</p>`,
      solution: `import numpy as np

conteggi, bordi = np.histogram(dati, bins=5)
bin_piu_pieno = int(np.argmax(conteggi))
totale = int(conteggi.sum())
tutti_contati = totale == len(dati)

print("conteggi per bin:", conteggi.tolist())
print("bordi:", np.round(bordi, 1).tolist())
print("bin piu' pieno:", bin_piu_pieno)`
    },

    {
      type: "exercise", id: "dv-03", kg: 15, title: "Bimodale: quando la media mente",
      task: `<p>Una distribuzione bimodale (due popolazioni mescolate) inganna la media. Costruisci l'istogramma e dimostralo:</p>
<ul>
<li><code>dati</code>: unione di due gruppi (attorno a 20 e attorno a 80) — fornito</li>
<li><code>conteggi</code>: istogramma con 10 bin</li>
<li><code>media</code>: la media di tutti i dati (cadrà nella valle centrale, dove ci sono POCHI dati!)</li>
<li><code>bin_della_media</code>: l'indice del bin in cui cade la media</li>
<li><code>media_in_zona_vuota</code>: <code>True</code> se il bin della media ha meno valori del bin più pieno / 2 (la media cade dove i dati scarseggiano)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(1)
gruppo_a = rng.normal(20, 5, size=150)
gruppo_b = rng.normal(80, 5, size=150)
dati = np.concatenate([gruppo_a, gruppo_b])`,
      starter: `import numpy as np
# dati: due gruppi attorno a 20 e 80 (bimodale)

conteggi, bordi = np.histogram(dati, bins=10)
media = dati.mean()

# in quale bin cade la media?
bin_della_media = np.searchsorted(bordi, media) - 1
bin_della_media = max(0, min(bin_della_media, len(conteggi) - 1))

conteggio_bin_media = conteggi[bin_della_media]
bin_piu_pieno_val = conteggi.max()
media_in_zona_vuota = ...

print(f"media: {media:.1f} (cade nel bin {bin_della_media})")
print(f"valori nel bin della media: {conteggio_bin_media} | bin piu' pieno: {bin_piu_pieno_val}")`,
      check: `import numpy as np
_c, _b = np.histogram(dati, bins=10)
_m = dati.mean()
_bm = max(0, min(np.searchsorted(_b, _m)-1, len(_c)-1))
assert 'media' in globals() and abs(float(media) - float(_m)) < 1e-6, "media: dati.mean(), circa 50 (tra i due gruppi)"
assert 'media_in_zona_vuota' in globals() and media_in_zona_vuota == True, "media_in_zona_vuota: True — la media ~50 cade nella valle tra i due picchi, dove ci sono pochissimi dati"
assert _c[_bm] < _c.max() / 2, "il bin della media deve essere quasi vuoto (bimodale)"`,
      hint: `<p>La media di due gruppi a 20 e 80 è ~50, ma a 50 NON c'è quasi nessuno (è la valle tra i picchi). <code>media_in_zona_vuota = conteggio_bin_media &lt; bin_piu_pieno_val / 2</code>. La media "tipica" non è tipica di nessuno.</p>`,
      solution: `import numpy as np

conteggi, bordi = np.histogram(dati, bins=10)
media = dati.mean()

bin_della_media = np.searchsorted(bordi, media) - 1
bin_della_media = max(0, min(bin_della_media, len(conteggi) - 1))

conteggio_bin_media = conteggi[bin_della_media]
bin_piu_pieno_val = conteggi.max()
media_in_zona_vuota = conteggio_bin_media < bin_piu_pieno_val / 2

print(f"media: {media:.1f} (cade nel bin {bin_della_media})")
print(f"valori nel bin della media: {conteggio_bin_media} | bin piu' pieno: {bin_piu_pieno_val}")`
    },

    { type: "theory", title: "Il boxplot: cinque numeri per confrontare", html: `
<p>Il <strong>boxplot</strong> comprime una distribuzione in cinque numeri (il "five-number summary"): minimo, primo quartile (Q1), mediana, terzo quartile (Q3), massimo. La scatola va da Q1 a Q3 (il 50% centrale dei dati, l'IQR), la linea dentro è la mediana, i "baffi" si estendono ai valori non outlier.</p>
<pre><code>import numpy as np
q1 = np.percentile(dati, 25)
mediana = np.percentile(dati, 50)
q3 = np.percentile(dati, 75)
iqr = q3 - q1                    # inter-quartile range
# outlier: oltre Q1 - 1.5*IQR o Q3 + 1.5*IQR (regola di Tukey)</code></pre>
<p>Il punto di forza: <strong>confrontare molte distribuzioni affiancate</strong> a colpo d'occhio (vendite per regione, punteggi per gruppo). E identifica gli <strong>outlier</strong> con la regola di Tukey (1.5×IQR). Perde la forma fine (non vede la bimodalità!), ma è compatto e robusto.</p>
`, more: `
<p>La regola di Tukey per gli outlier (oltre Q1 − 1.5·IQR o Q3 + 1.5·IQR) è uno standard pratico ma arbitrario: l'1.5 è convenzione, non legge. Su una distribuzione normale, questa regola segnala come outlier circa lo 0.7% dei dati (valori legittimi ma estremi); su distribuzioni con code naturalmente lunghe, ne segnala molti di più che non sono affatto anomalie. Il boxplot USA questa regola per decidere dove finiscono i baffi e cosa disegnare come punti isolati — quindi "punti oltre i baffi" significa "oltre 1.5 IQR", non necessariamente "errori". È robusto (basato su quartili, non su media/std che gli outlier stessi gonfierebbero), ma la soglia va interpretata nel contesto.</p>
<p>Il limite fondamentale del boxplot è che NASCONDE LA FORMA: due distribuzioni completamente diverse (una uniforme, una bimodale, una normale) possono avere lo STESSO boxplot se hanno gli stessi cinque numeri. La bimodalità in particolare è invisibile — il boxplot mostrerebbe una scatola normale mentre i dati hanno due picchi. Per questo, quando la forma conta, il <strong>violin plot</strong> (che aggiunge la densità KDE ai lati della scatola) o l'istogramma sono migliori. Il boxplot brilla per il CONFRONTO compatto di molti gruppi, non per esplorare la forma di uno.</p>
<p>Il vero superpotere del boxplot è affiancare molte distribuzioni: "punteggi del test per 10 classi", "tempi di risposta per 5 server", "prezzi per 8 quartieri" — dieci boxplot affiancati si leggono a colpo d'occhio (chi ha mediana più alta, chi più variabilità, chi outlier), mentre dieci istogrammi occuperebbero una pagina e sarebbero difficili da confrontare. È lo strumento del confronto tra gruppi per eccellenza. E i quartili che lo compongono (Q1, mediana, Q3) sono robusti agli outlier — a differenza di media e deviazione standard — il che rende il boxplot affidabile anche su dati sporchi, dove media e std sarebbero fuorviate da pochi valori estremi.</p>
` },

    {
      type: "exercise", id: "dv-04", kg: 15, title: "I cinque numeri del boxplot",
      task: `<p>Calcola il five-number summary e identifica gli outlier con la regola di Tukey:</p>
<ul>
<li><code>q1</code>, <code>mediana</code>, <code>q3</code>: i quartili (percentili 25, 50, 75)</li>
<li><code>iqr</code>: <code>q3 - q1</code></li>
<li><code>soglia_alta</code>: <code>q3 + 1.5 * iqr</code> (oltre = outlier)</li>
<li><code>outlier</code>: i valori sopra la soglia alta</li>
<li><code>n_outlier</code>: quanti outlier</li>
</ul>`,
      setup: `import numpy as np
dati = np.array([10, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, 95])  # 95 e' un outlier`,
      starter: `import numpy as np
# dati: valori normali + un outlier (95)

q1 = np.percentile(dati, 25)
mediana = np.percentile(dati, 50)
q3 = np.percentile(dati, 75)
iqr = ...
soglia_alta = ...
outlier = dati[dati > soglia_alta]
n_outlier = ...

print(f"Q1={q1}, mediana={mediana}, Q3={q3}, IQR={iqr}")
print(f"soglia outlier: {soglia_alta} | outlier: {outlier.tolist()}")`,
      check: `import numpy as np
_q1 = np.percentile(dati, 25); _q3 = np.percentile(dati, 75); _iqr = _q3 - _q1
_soglia = _q3 + 1.5 * _iqr
_out = dati[dati > _soglia]
assert 'iqr' in globals() and abs(float(iqr) - _iqr) < 1e-9, "iqr: q3 - q1"
assert 'soglia_alta' in globals() and abs(float(soglia_alta) - _soglia) < 1e-9, "soglia_alta: q3 + 1.5*iqr"
assert 'outlier' in globals() and np.array_equal(outlier, _out) and 95 in outlier, "outlier: i valori oltre la soglia — il 95"
assert 'n_outlier' in globals() and n_outlier == 1, "n_outlier: 1 (il 95)"`,
      hint: `<p><code>iqr = q3 - q1</code>, <code>soglia_alta = q3 + 1.5 * iqr</code> (regola di Tukey). Gli outlier sono i valori oltre la soglia: <code>n_outlier = len(outlier)</code>. Il 95 è chiaramente fuori.</p>`,
      solution: `import numpy as np

q1 = np.percentile(dati, 25)
mediana = np.percentile(dati, 50)
q3 = np.percentile(dati, 75)
iqr = q3 - q1
soglia_alta = q3 + 1.5 * iqr
outlier = dati[dati > soglia_alta]
n_outlier = len(outlier)

print(f"Q1={q1}, mediana={mediana}, Q3={q3}, IQR={iqr}")
print(f"soglia outlier: {soglia_alta} | outlier: {outlier.tolist()}")`
    },

    { type: "theory", title: "Scatter plot: vedere una relazione", html: `
<p>Lo <strong>scatter plot</strong> disegna un punto per ogni osservazione nelle coordinate (x, y), rivelando la relazione tra due variabili continue: c'è correlazione? È lineare o curva? Ci sono cluster, outlier, pattern?</p>
<pre><code>import matplotlib.pyplot as plt
plt.scatter(x, y)
# per vedere una terza dimensione:
plt.scatter(x, y, c=categoria, s=dimensione)   # colore e grandezza dei punti</code></pre>
<p>È lo strumento principe per esplorare le relazioni. Aggiungendo <strong>colore</strong> (una categoria) e <strong>dimensione</strong> (una terza variabile numerica) si visualizzano fino a 4 dimensioni in un piano. Ma attenzione: lo scatter mostra CORRELAZIONE, non causalità (come visto in Statistica) — e con troppi punti sovrapposti (overplotting) serve trasparenza o hexbin.</p>
`, more: `
<p>Lo scatter plot è il compagno visivo della correlazione (sala Statistica): permette di VEDERE ciò che il coefficiente di Pearson riassume in un numero — e di scoprire ciò che il numero nasconde. Una relazione curva (parabola) può avere Pearson ≈ 0 pur essendo una relazione fortissima: solo lo scatter la rivela. Un singolo outlier può creare o distruggere una correlazione apparente: solo lo scatter lo mostra. Il quartetto di Anscombe (quattro dataset con identici r, medie e varianze ma scatter completamente diversi) è la dimostrazione definitiva che GUARDARE i dati con uno scatter batte fidarsi delle statistiche riassuntive. "Fai sempre lo scatter prima di fidarti di una correlazione" è regola d'oro dell'EDA.</p>
<p>L'<strong>overplotting</strong> è il nemico dello scatter su grandi dati: con decine di migliaia di punti, si sovrappongono in una macchia nera indistinta che nasconde la densità reale. Le soluzioni: trasparenza (<code>alpha</code> basso, così le zone dense appaiono più scure), campionamento (disegna un sottoinsieme casuale), o passare a rappresentazioni di densità come l'<strong>hexbin</strong> (griglia esagonale colorata per densità) o la 2D KDE (curve di livello di densità). Su milioni di punti, uno scatter grezzo è inutile; una heatmap di densità mostra dove si concentrano davvero i dati.</p>
<p>La codifica di dimensioni extra (colore, dimensione, forma dei punti) espande lo scatter ma va usata con parsimonia: il colore per una CATEGORIA (fino a ~7 categorie distinguibili, poi diventa confuso) o per una variabile continua (con una colormap appropriata — sequenziale per valori ordinati, divergente per valori con un centro naturale); la dimensione per una variabile continua positiva (i "bubble chart", dove l'AREA — non il raggio — deve essere proporzionale al valore, altrimenti si esagera). Attenzione all'accessibilità: circa l'8% degli uomini ha daltonismo, quindi le colormap vanno scelte color-blind-friendly (viridis, non rosso-verde). Un buon scatter multidimensionale è potente; uno che sovraccarica colore+dimensione+forma diventa illeggibile — la sobrietà (data-ink ratio) vale anche qui.</p>
` },

    {
      type: "exercise", id: "dv-05", kg: 15, title: "Scatter e correlazione visiva",
      task: `<p>Genera i dati per uno scatter plot e quantifica la relazione che rivelerebbe:</p>
<ul>
<li><code>x</code>, <code>y</code>: dati con relazione lineare + rumore (forniti)</li>
<li><code>correlazione</code>: il coefficiente di Pearson tra x e y (usa <code>np.corrcoef(x, y)[0, 1]</code>)</li>
<li><code>relazione_forte</code>: <code>True</code> se |correlazione| &gt; 0.7</li>
<li><code>pendenza_positiva</code>: <code>True</code> se la correlazione è positiva (y cresce con x)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
x = np.linspace(0, 100, 200)
y = 2 * x + rng.normal(0, 20, size=200)   # relazione lineare positiva + rumore`,
      starter: `import numpy as np
# x, y: relazione lineare positiva con rumore

correlazione = np.corrcoef(x, y)[0, 1]
relazione_forte = ...
pendenza_positiva = ...

print(f"correlazione: {correlazione:.3f}")
print(f"forte: {relazione_forte} | positiva: {pendenza_positiva}")`,
      check: `import numpy as np
_c = np.corrcoef(x, y)[0, 1]
assert 'correlazione' in globals() and abs(float(correlazione) - float(_c)) < 1e-9, "correlazione: np.corrcoef(x, y)[0, 1]"
assert 'relazione_forte' in globals() and relazione_forte == True, "relazione_forte: |corr| > 0.7 -> True (relazione lineare chiara)"
assert 'pendenza_positiva' in globals() and pendenza_positiva == True, "pendenza_positiva: corr > 0 -> True (y cresce con x)"`,
      hint: `<p><code>np.corrcoef(x, y)[0, 1]</code> dà il Pearson. <code>relazione_forte = abs(correlazione) &gt; 0.7</code>, <code>pendenza_positiva = correlazione &gt; 0</code>. Lo scatter mostrerebbe una nuvola allungata in salita.</p>`,
      solution: `import numpy as np

correlazione = np.corrcoef(x, y)[0, 1]
relazione_forte = abs(correlazione) > 0.7
pendenza_positiva = correlazione > 0

print(f"correlazione: {correlazione:.3f}")
print(f"forte: {relazione_forte} | positiva: {pendenza_positiva}")`
    },

    { type: "theory", title: "Heatmap: matrici a colori", html: `
<p>La <strong>heatmap</strong> visualizza una matrice come griglia di colori: ogni cella è colorata in base al suo valore. È perfetta per due usi principali:</p>
<ul>
<li><strong>Matrice di correlazione</strong>: colora quanto ogni coppia di variabili è correlata — trovi a colpo d'occhio le relazioni forti in un dataset con molte colonne;</li>
<li><strong>Dati a due dimensioni categoriche</strong>: vendite per (mese × prodotto), attività per (giorno × ora).</li>
</ul>
<pre><code>import numpy as np
corr = np.corrcoef(dati.T)   # matrice di correlazione tra colonne
# heatmap: plt.imshow(corr) o sns.heatmap(corr, annot=True)</code></pre>
<p>La scelta della <strong>colormap</strong> conta: per la correlazione (da -1 a +1) serve una scala <em>divergente</em> (due colori agli estremi, neutro al centro), così il segno è immediato. Per valori solo positivi, una scala <em>sequenziale</em>.</p>
`, more: `
<p>La scelta della colormap è tecnica ma cruciale per non ingannare: le scale <strong>sequenziali</strong> (chiaro→scuro di un colore) per dati che vanno da basso ad alto senza un centro speciale (conteggi, intensità); le <strong>divergenti</strong> (colore A → neutro → colore B) per dati con un CENTRO significativo (correlazione attorno a 0, variazioni positive/negative, temperature sopra/sotto media) — il neutro al centro rende il segno immediato; le <strong>qualitative</strong> (colori distinti non ordinati) per categorie. L'errore classico è usare una colormap divergente per dati sequenziali (suggerisce un "centro" che non esiste) o viceversa. E le vecchie colormap tipo "jet" (arcobaleno) sono da evitare: non sono percettivamente uniformi (creano falsi confini dove il colore cambia bruscamente) e non funzionano in bianco/nero né per i daltonici — viridis e le sue sorelle sono lo standard moderno.</p>
<p>La heatmap di correlazione è uno strumento EDA potentissimo su dataset con molte colonne: invece di guardare N² coefficienti in una tabella, li VEDI tutti insieme — le coppie molto correlate saltano all'occhio (colore intenso), rivelando ridondanza tra feature (due colonne quasi identiche → una è superflua, collegamento con feature selection e multicollinearità), o feature fortemente legate al target (candidate predittori). È spesso il primo grafico dopo gli istogrammi in un'analisi esplorativa. Attenzione: mostra solo correlazioni LINEARI (Pearson) — relazioni non lineari restano invisibili, servirebbe Spearman o guardare gli scatter.</p>
<p>L'annotazione (i numeri dentro le celle, <code>annot=True</code>) è utile per pochi valori ma diventa illeggibile su matrici grandi — lì si lascia parlare solo il colore. E per matrici di correlazione, spesso si mostra solo il triangolo inferiore (la matrice è simmetrica, la diagonale è sempre 1) per ridurre la ridondanza visiva. La heatmap eccelle anche per pattern temporali a due dimensioni: attività di un sito per (giorno della settimana × ora del giorno) rivela a colpo d'occhio i picchi (le celle calde) — quando arrivano gli utenti, quando fare manutenzione. È il grafico giusto ogni volta che hai una griglia di valori indicizzata da due dimensioni e vuoi vederne il pattern complessivo.</p>
` },

    {
      type: "exercise", id: "dv-06", kg: 20, title: "Heatmap di correlazione",
      task: `<p>Calcola la matrice di correlazione di un dataset multi-colonna (i dati dietro una heatmap) e trova le relazioni forti:</p>
<ul>
<li><code>corr</code>: la matrice di correlazione tra le colonne di <code>X</code> (usa <code>np.corrcoef(X.T)</code>)</li>
<li><code>forma</code>: la forma della matrice (deve essere quadrata: n_colonne × n_colonne)</li>
<li><code>diagonale_uno</code>: <code>True</code> se la diagonale è tutta 1 (ogni variabile correla perfettamente con sé stessa)</li>
<li><code>coppia_piu_correlata</code>: gli indici (i, j) con i&lt;j della coppia più correlata (esclusa la diagonale)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
n = 100
f0 = rng.normal(0, 1, n)
f1 = f0 * 0.95 + rng.normal(0, 0.1, n)   # f1 quasi = f0 (correlazione altissima)
f2 = rng.normal(0, 1, n)                  # f2 indipendente
X = np.column_stack([f0, f1, f2])`,
      starter: `import numpy as np
# X: 3 colonne, f0 e f1 fortemente correlate, f2 indipendente

corr = np.corrcoef(X.T)
forma = corr.shape
diagonale_uno = np.allclose(np.diag(corr), 1.0)

# trova la coppia i<j piu' correlata (in valore assoluto)
mask = np.triu(np.ones_like(corr, dtype=bool), k=1)   # triangolo sopra la diagonale
i, j = np.unravel_index(np.argmax(np.abs(corr) * mask), corr.shape)
coppia_piu_correlata = (int(i), int(j))

print("matrice di correlazione:\\n", np.round(corr, 2))
print("coppia piu' correlata:", coppia_piu_correlata)`,
      check: `import numpy as np
_c = np.corrcoef(X.T)
_mask = np.triu(np.ones_like(_c, dtype=bool), k=1)
_i, _j = np.unravel_index(np.argmax(np.abs(_c) * _mask), _c.shape)
assert 'corr' in globals() and np.allclose(corr, _c), "corr: np.corrcoef(X.T)"
assert 'forma' in globals() and forma == (3, 3), "forma: 3x3 (3 colonne)"
assert 'diagonale_uno' in globals() and diagonale_uno == True, "diagonale_uno: la diagonale e' sempre 1"
assert 'coppia_piu_correlata' in globals() and coppia_piu_correlata == (0, 1), "coppia_piu_correlata: (0,1) — f0 e f1 sono quasi identiche"`,
      hint: `<p><code>np.corrcoef(X.T)</code> — la trasposta perché corrcoef vuole le variabili sulle righe. La coppia più correlata (già calcolata) è (0,1): f0 e f1 quasi identiche. Una heatmap mostrerebbe quella cella accesissima.</p>`,
      solution: `import numpy as np

corr = np.corrcoef(X.T)
forma = corr.shape
diagonale_uno = np.allclose(np.diag(corr), 1.0)

mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
i, j = np.unravel_index(np.argmax(np.abs(corr) * mask), corr.shape)
coppia_piu_correlata = (int(i), int(j))

print("matrice di correlazione:\\n", np.round(corr, 2))
print("coppia piu' correlata:", coppia_piu_correlata)`
    },

    { type: "theory", title: "Grafici che mentono", html: `
<p>Un grafico può ingannare tanto quanto informare. I trucchi più comuni (da riconoscere e NON usare):</p>
<ul>
<li><strong>Asse y troncato</strong>: non partire da zero in un bar chart esagera differenze minime — una barra "doppia" di un'altra che rappresenta il 2% in più;</li>
<li><strong>Scale diverse</strong> su doppi assi y per suggerire correlazioni inesistenti;</li>
<li><strong>Cherry-picking</strong> dell'intervallo temporale per mostrare un trend a piacere;</li>
<li><strong>Pie chart 3D</strong> che distorcono le proporzioni;</li>
<li><strong>Aree</strong> proporzionali al valore invece che al quadrato (raddoppiare il raggio quadruplica l'area percepita).</li>
</ul>
<pre><code># bar chart onesto: l'asse y DEVE partire da 0
plt.bar(categorie, valori)
plt.ylim(0, max(valori) * 1.1)   # zero-based</code></pre>
`, more: `
<p>L'asse y troncato nei bar chart è la manipolazione più diffusa perché l'ALTEZZA della barra è ciò che leggiamo come "valore": se un valore è 102 e un altro 100, un asse che parte da 99 fa sembrare il primo il triplo del secondo, quando la differenza reale è del 2%. La regola è assoluta: i bar chart DEVONO avere l'asse y a zero, perché la barra codifica una quantità con la sua lunghezza. I line chart per serie temporali sono l'eccezione: lì si può troncare (interessa la VARIAZIONE, non il valore assoluto), ma va reso evidente. Riconoscere un asse troncato in un grafico altrui è la prima difesa contro la disinformazione visiva — e i media, il marketing e talvolta i paper scientifici lo usano per esagerare effetti.</p>
<p>Il cherry-picking dell'intervallo è subdolo perché ogni singolo dato è vero, ma la SELEZIONE mente: mostrare le vendite "dall'ultimo minimo" fa sembrare una crescita trionfale; mostrarle "dall'ultimo picco" un declino. La difesa è il contesto: mostrare abbastanza storia da rendere il trend onesto, e diffidare di grafici che iniziano/finiscono a punti sospettosamente convenienti. Analogamente, correlazioni tra due serie su doppi assi y con scale scelte ad hoc possono far sembrare correlate cose scorrelate — il sito "Spurious Correlations" raccoglie esempi assurdi (consumo di formaggio vs morti per lenzuola aggrovigliate) proprio giocando su questo.</p>
<p>Il principio etico di fondo: un grafico dovrebbe rendere FACILE la conclusione VERA e difficile quella falsa. Questo si collega alla distinzione predire/intervenire e correlazione/causalità (Statistica): un grafico può suggerire visivamente una causalità che i dati non supportano (due linee che salgono insieme "sembrano" causa-effetto). La responsabilità di chi visualizza è non sfruttare i bias percettivi del lettore. Nei colloqui e nel lavoro, saper CRITICARE un grafico ("questo asse non parte da zero, esagera la differenza"; "questo intervallo è cherry-picked"; "questo pie 3D distorce") è competenza tanto quanto saperne fare di buoni — l'alfabetizzazione visiva è bidirezionale: produrre onestamente e leggere criticamente. La miglior difesa contro i grafici che mentono è chiedersi sempre: "cosa NON mi stanno mostrando, e perché hanno scelto proprio questa rappresentazione?".</p>
` },

    {
      type: "exercise", id: "dv-07", kg: 15, title: "L'inganno dell'asse troncato",
      task: `<p>Dimostra come un asse y troncato esagera differenze minime. Due valori quasi uguali:</p>
<ul>
<li><code>valori</code>: [100, 102] — differenza reale del 2%</li>
<li><code>rapporto_reale</code>: il rapporto vero tra i due valori (102/100)</li>
<li><code>rapporto_percepito_troncato</code>: se l'asse parte da 99, le altezze percepite sono (100-99) e (102-99); il loro rapporto</li>
<li><code>troncato_esagera</code>: <code>True</code> se il rapporto percepito col troncamento è molto maggiore di quello reale</li>
<li><code>asse_deve_partire_da_zero</code>: <code>True</code> — nei bar chart l'asse y deve partire da 0</li>
</ul>`,
      starter: `valori = [100, 102]

rapporto_reale = valori[1] / valori[0]

# asse troncato a 99: le altezze diventano (valore - 99)
base_troncata = 99
altezze_percepite = [v - base_troncata for v in valori]
rapporto_percepito_troncato = altezze_percepite[1] / altezze_percepite[0]

troncato_esagera = ...
asse_deve_partire_da_zero = ...

print(f"rapporto reale: {rapporto_reale:.2f} (2% di differenza)")
print(f"rapporto percepito con asse troncato a 99: {rapporto_percepito_troncato:.2f}")`,
      check: `_rr = 102/100
_alt = [100-99, 102-99]
_rp = _alt[1]/_alt[0]
assert abs(rapporto_reale - _rr) < 1e-9, "rapporto_reale: 102/100 = 1.02"
assert abs(rapporto_percepito_troncato - _rp) < 1e-9, "rapporto_percepito_troncato: (102-99)/(100-99) = 3.0"
assert troncato_esagera == True, "troncato_esagera: True — 3.0 vs 1.02: l'asse troncato fa sembrare TRIPLO cio' che e' solo il 2% in piu'"
assert asse_deve_partire_da_zero == True, "asse_deve_partire_da_zero: True — regola d'oro dei bar chart"`,
      hint: `<p>Con asse a 99, le altezze diventano 1 e 3: rapporto percepito 3.0, contro l'1.02 reale! <code>troncato_esagera = rapporto_percepito_troncato &gt; rapporto_reale * 2</code>. Ecco perché i bar chart devono partire da zero.</p>`,
      solution: `valori = [100, 102]

rapporto_reale = valori[1] / valori[0]

base_troncata = 99
altezze_percepite = [v - base_troncata for v in valori]
rapporto_percepito_troncato = altezze_percepite[1] / altezze_percepite[0]

troncato_esagera = rapporto_percepito_troncato > rapporto_reale * 2
asse_deve_partire_da_zero = True

print(f"rapporto reale: {rapporto_reale:.2f} (2% di differenza)")
print(f"rapporto percepito con asse troncato a 99: {rapporto_percepito_troncato:.2f}")`
    },

    {
      type: "exercise", id: "dv-08", kg: 15, title: "Bar chart: confronto tra categorie",
      task: `<p>Prepara i dati per un bar chart di confronto e trova il vincitore, rispettando le regole (asse da zero, ordinamento):</p>
<ul>
<li><code>vendite</code>: dict regione&rarr;vendite (fornito)</li>
<li><code>categorie</code>, <code>valori</code>: le liste ordinate per valore DECRESCENTE (un bar chart ordinato si legge meglio)</li>
<li><code>regione_top</code>: la regione con più vendite</li>
<li><code>parte_da_zero</code>: <code>True</code> — il bar chart deve avere l'asse y a zero</li>
</ul>`,
      setup: `vendite = {"Nord": 340, "Centro": 180, "Sud": 420, "Isole": 90}`,
      starter: `# vendite: dict regione -> vendite

# ordina per valore decrescente (un bar chart ordinato e' piu' leggibile)
ordinate = sorted(vendite.items(), key=lambda kv: kv[1], reverse=True)
categorie = [k for k, v in ordinate]
valori = [v for k, v in ordinate]

regione_top = ...
parte_da_zero = ...

print("categorie ordinate:", categorie)
print("valori:", valori)
print("regione top:", regione_top)`,
      check: `_ord = sorted(vendite.items(), key=lambda kv: kv[1], reverse=True)
_cat = [k for k,v in _ord]
assert categorie == _cat == ["Sud", "Nord", "Centro", "Isole"], "categorie: ordinate per vendite decrescenti"
assert valori == [420, 340, 180, 90], "valori: in ordine decrescente"
assert regione_top == "Sud", "regione_top: Sud (420 vendite)"
assert parte_da_zero == True, "parte_da_zero: True — regola dei bar chart"`,
      hint: `<p><code>regione_top = categorie[0]</code> (il primo dopo l'ordinamento decrescente). <code>parte_da_zero = True</code>. Ordinare le barre per valore le rende molto più leggibili di un ordine arbitrario.</p>`,
      solution: `ordinate = sorted(vendite.items(), key=lambda kv: kv[1], reverse=True)
categorie = [k for k, v in ordinate]
valori = [v for k, v in ordinate]

regione_top = categorie[0]
parte_da_zero = True

print("categorie ordinate:", categorie)
print("valori:", valori)
print("regione top:", regione_top)`
    },

    {
      type: "exercise", id: "dv-09", kg: 15, title: "Quiz: data visualization",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Per confrontare la distribuzione di molti gruppi affiancati, il boxplot è più adatto di tanti istogrammi"</li>
<li><code>a2</code>: "Un bar chart può avere l'asse y che non parte da zero senza ingannare"</li>
<li><code>a3</code>: "Lo scatter plot è lo strumento giusto per vedere la relazione tra due variabili continue"</li>
<li><code>a4</code>: "Il boxplot può nascondere una distribuzione bimodale"</li>
<li><code>a5</code>: "Per una matrice di correlazione (da -1 a +1) è meglio una colormap divergente"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: il boxplot e' compatto, ideale per confrontare molti gruppi"
assert a2 == False, "a2 FALSA: un bar chart con asse non-zero ESAGERA le differenze, inganna"
assert a3 == True, "a3 VERA: scatter = relazione tra due continue"
assert a4 == True, "a4 VERA: il boxplot mostra 5 numeri, non la forma -> la bimodalita' sparisce"
assert a5 == True, "a5 VERA: divergente (due colori + neutro al centro) rende immediato il segno della correlazione"`,
      hint: `<p>La trappola è a2: un bar chart con asse troncato inganna (esagera le differenze). Le altre riprendono le lavagne: boxplot per confronti (a1), scatter per relazioni (a3), boxplot nasconde la forma (a4), colormap divergente per la correlazione (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "dv-10", kg: 25, title: "MASSIMALE: dashboard di EDA",
      task: `<p>Il gran finale: prepara i dati per una mini-dashboard di analisi esplorativa, scegliendo il grafico giusto per ogni domanda e calcolando ciò che lo alimenta.</p>
<ul>
<li>dataset: clienti con età, spesa e regione</li>
<li><code>hist_eta</code>: conteggi dell'istogramma dell'età (5 bin) — per la DISTRIBUZIONE dell'età</li>
<li><code>corr_eta_spesa</code>: correlazione tra età e spesa — per la RELAZIONE</li>
<li><code>spesa_per_regione</code>: dict regione&rarr;spesa media — per il CONFRONTO tra categorie</li>
<li><code>regione_top_spesa</code>: la regione con spesa media più alta</li>
<li><code>outlier_spesa</code>: quanti outlier di spesa con la regola di Tukey (oltre Q3 + 1.5·IQR)</li>
<li><code>dashboard_ok</code>: <code>True</code> se tutti i pezzi sono calcolati coerentemente</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
n = 300
eta = rng.integers(18, 70, n)
spesa = eta * 5 + rng.normal(0, 50, n)   # spesa cresce con l'eta
spesa = np.clip(spesa, 0, None)
spesa[0] = 2000   # un outlier
regioni = rng.choice(["Nord", "Sud", "Centro"], n)`,
      starter: `import numpy as np
# eta, spesa, regioni: dati di 300 clienti

# 1. DISTRIBUZIONE eta -> istogramma
hist_eta, _ = np.histogram(eta, bins=5)

# 2. RELAZIONE eta-spesa -> scatter/correlazione
corr_eta_spesa = np.corrcoef(eta, spesa)[0, 1]

# 3. CONFRONTO per regione -> bar chart
spesa_per_regione = {}
for r in ["Nord", "Sud", "Centro"]:
    spesa_per_regione[r] = spesa[regioni == r].mean()
regione_top_spesa = max(spesa_per_regione, key=spesa_per_regione.get)

# 4. OUTLIER di spesa -> boxplot (regola di Tukey)
q1, q3 = np.percentile(spesa, [25, 75])
iqr = q3 - q1
soglia = q3 + 1.5 * iqr
outlier_spesa = ...

dashboard_ok = ...

print("hist eta:", hist_eta.tolist())
print(f"corr eta-spesa: {corr_eta_spesa:.2f}")
print("spesa media per regione:", {k: round(v) for k, v in spesa_per_regione.items()})
print("regione top:", regione_top_spesa, "| outlier spesa:", outlier_spesa)`,
      check: `import numpy as np
_he, _ = np.histogram(eta, bins=5)
_corr = np.corrcoef(eta, spesa)[0,1]
_q1, _q3 = np.percentile(spesa, [25,75]); _iqr = _q3-_q1; _sog = _q3+1.5*_iqr
_out = int((spesa > _sog).sum())
assert np.array_equal(hist_eta, _he), "hist_eta: np.histogram(eta, bins=5)[0]"
assert abs(corr_eta_spesa - _corr) < 1e-9 and corr_eta_spesa > 0, "corr_eta_spesa: positiva (spesa cresce con eta)"
assert 'outlier_spesa' in globals() and outlier_spesa == _out and _out >= 1, "outlier_spesa: (spesa > soglia).sum(), almeno 1 (il 2000)"
assert 'dashboard_ok' in globals() and dashboard_ok == True, "dashboard_ok: True"
assert regione_top_spesa in ["Nord","Sud","Centro"], "regione_top_spesa valida"`,
      hint: `<p><code>outlier_spesa = int((spesa &gt; soglia).sum())</code>. <code>dashboard_ok = hist_eta.sum() == len(eta) and corr_eta_spesa &gt; 0 and outlier_spesa &gt;= 1</code>. Ogni domanda (distribuzione/relazione/confronto/outlier) ha il suo grafico e i suoi dati.</p>`,
      solution: `import numpy as np

hist_eta, _ = np.histogram(eta, bins=5)

corr_eta_spesa = np.corrcoef(eta, spesa)[0, 1]

spesa_per_regione = {}
for r in ["Nord", "Sud", "Centro"]:
    spesa_per_regione[r] = spesa[regioni == r].mean()
regione_top_spesa = max(spesa_per_regione, key=spesa_per_regione.get)

q1, q3 = np.percentile(spesa, [25, 75])
iqr = q3 - q1
soglia = q3 + 1.5 * iqr
outlier_spesa = int((spesa > soglia).sum())

dashboard_ok = (hist_eta.sum() == len(eta) and corr_eta_spesa > 0 and outlier_spesa >= 1)

print("hist eta:", hist_eta.tolist())
print(f"corr eta-spesa: {corr_eta_spesa:.2f}")
print("spesa media per regione:", {k: round(v) for k, v in spesa_per_regione.items()})
print("regione top:", regione_top_spesa, "| outlier spesa:", outlier_spesa)`
    }

  ]
});
