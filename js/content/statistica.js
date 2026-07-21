window.MODULES.push({
  id: "statistica",
  name: "Statistica",
  tagline: "La sala del giudice di gara: p-value, intervalli, Bayes, bootstrap. Dove impari a non farti ingannare dai numeri.",
  intro: "Ogni colloquio da data scientist passa da qui: p-value, intervalli di confidenza, CLT, test A/B. Non formule a memoria — simulazioni che ti fanno VEDERE perché funzionano. Serve scipy: il primo caricamento pesa, poi si vola.",
  packages: ["scipy"],
  items: [

    { type: "theory", title: "Tre centri: media, mediana, moda", html: `
<p>Il "valore tipico" di una serie di dati ha tre definizioni diverse, e scegliere quella sbagliata è il primo modo di mentire con le statistiche.</p>
<pre><code>import numpy as np
tempi = [42, 45, 44, 43, 41, 44, 290]   # secondi di plank, 7 atleti
np.mean(tempi)     # 78.4  — la MEDIA, trascinata dal fenomeno da 290
np.median(tempi)   # 44.0  — la MEDIANA, il valore che sta in mezzo</code></pre>
<p>La <strong>media</strong> somma tutto e divide: ogni valore pesa, anche l'outlier. La <strong>mediana</strong> è il valore centrale dopo l'ordinamento: metà dei dati sta sotto, metà sopra — un outlier da 290 secondi non la sposta di un millimetro. La <strong>moda</strong> è il valore più frequente: l'unica delle tre che ha senso anche per dati categorici (il colore di maglietta più venduto ha una moda, non una media).</p>
`, more: `
<p>Quando media e mediana divergono molto, la distribuzione è <strong>asimmetrica</strong> (skewed). Classico esempio da colloquio: gli stipendi. In un'azienda dove quasi tutti guadagnano 30k e il CEO 3 milioni, la media dice "stipendio tipico 60k" — vero aritmeticamente, fuorviante nella sostanza. La mediana dice 30k, che è quello che un dipendente preso a caso guadagna davvero. Regola pratica: per grandezze con code lunghe a destra (redditi, prezzi delle case, tempi di risposta di un server, durata delle sessioni utente) riporta la mediana, o riportale entrambe.</p>
<p>La media però ha una proprietà che la mediana non ha: è <strong>lineare</strong>. La media di una somma è la somma delle medie, e la media campionaria è uno stimatore non distorto della media di popolazione — per questo tutta l'inferenza classica (CLT, errore standard, intervalli di confidenza) è costruita sulla media, non sulla mediana. La mediana è robusta ma matematicamente più scomoda: per stimarne l'incertezza servono strumenti come il bootstrap, che incontrerai più avanti in questa stessa sala.</p>
<p>Esiste anche il compromesso: la <strong>media troncata</strong> (trimmed mean), che scarta ad esempio il 10% più basso e più alto e fa la media del resto — la usa <code>scipy.stats.trim_mean</code>. È lo standard in contesti dove gli outlier sono attesi ma non vuoi buttare l'informazione di quantità: molte gare di giudizio (tuffi, ginnastica) tolgono il voto più alto e più basso esattamente per questo motivo.</p>
` },

    {
      type: "exercise", id: "stat-01", kg: 5, title: "Il plank e il fenomeno",
      task: `<p>I tempi di plank (secondi) della sala includono un atleta fuori scala. Calcola:</p>
<ul>
<li><code>media</code>: la media dei tempi</li>
<li><code>mediana</code>: la mediana</li>
<li><code>scarto</code>: la differenza <code>media - mediana</code> (quanto l'outlier trascina la media)</li>
</ul>`,
      starter: `import numpy as np
tempi = [42, 45, 44, 43, 41, 44, 290]

media = ...
mediana = ...
scarto = ...

print(f"media {media:.1f} | mediana {mediana:.1f} | scarto {scarto:.1f}")`,
      check: `assert 'media' in globals() and abs(float(media) - 78.43) < 0.1, "media: np.mean(tempi), viene circa 78.4"
assert 'mediana' in globals() and abs(float(mediana) - 44.0) < 1e-9, "mediana: np.median(tempi) = 44.0"
assert 'scarto' in globals() and abs(float(scarto) - (float(media) - float(mediana))) < 1e-9, "scarto = media - mediana"`,
      hint: `<p><code>np.mean</code> e <code>np.median</code>. Nota quanto l'unico 290 sposta la media: è il motivo per cui per i tempi si riporta quasi sempre la mediana.</p>`,
      solution: `import numpy as np
tempi = [42, 45, 44, 43, 41, 44, 290]

media = np.mean(tempi)
mediana = np.median(tempi)
scarto = media - mediana

print(f"media {media:.1f} | mediana {mediana:.1f} | scarto {scarto:.1f}")`
    },

    {
      type: "exercise", id: "stat-02", kg: 10, title: "La moda dello spogliatoio",
      task: `<p>Le taglie di maglietta vendute questa settimana. Calcola:</p>
<ul>
<li><code>moda</code>: la taglia più frequente (stringa)</li>
<li><code>conteggio_moda</code>: quante volte compare</li>
<li><code>robusta</code>: la mediana dei pesi con e senza l'outlier — calcola <code>mediana_con</code> e <code>mediana_senza</code> e metti in <code>robusta</code> il valore booleano <code>True</code> se differiscono meno di 1 kg</li>
</ul>`,
      starter: `from collections import Counter
import numpy as np

taglie = ["M", "L", "M", "S", "M", "XL", "L", "M", "S", "L", "M"]
pesi = [72, 80, 74, 68, 75, 96, 81, 73, 70, 79, 250]   # l'ultimo e' un errore di battitura

conteggi = ...
moda = ...
conteggio_moda = ...

mediana_con = ...
mediana_senza = ...     # pesi[:-1]
robusta = ...

print(f"moda: {moda} x{conteggio_moda} | mediane: {mediana_con} vs {mediana_senza}")`,
      check: `assert 'moda' in globals() and moda == "M", "moda: la taglia piu' frequente e' M (5 volte). Counter(taglie).most_common(1)"
assert 'conteggio_moda' in globals() and int(conteggio_moda) == 5, "conteggio_moda: M compare 5 volte"
assert 'mediana_con' in globals() and abs(float(mediana_con) - 75.0) < 1e-9, "mediana_con: np.median(pesi) = 75.0"
assert 'mediana_senza' in globals() and abs(float(mediana_senza) - 74.5) < 1e-9, "mediana_senza: np.median(pesi[:-1]) = 74.5"
assert 'robusta' in globals() and robusta == True, "robusta: le due mediane differiscono di 0.5 kg -> True. Il 250 non sposta quasi nulla"`,
      hint: `<p><code>Counter(taglie).most_common(1)</code> restituisce una lista con una tupla <code>[("M", 5)]</code>: spacchettala. Per <code>robusta</code>: <code>abs(mediana_con - mediana_senza) &lt; 1</code>.</p>`,
      solution: `from collections import Counter
import numpy as np

taglie = ["M", "L", "M", "S", "M", "XL", "L", "M", "S", "L", "M"]
pesi = [72, 80, 74, 68, 75, 96, 81, 73, 70, 79, 250]

conteggi = Counter(taglie)
moda, conteggio_moda = conteggi.most_common(1)[0]

mediana_con = np.median(pesi)
mediana_senza = np.median(pesi[:-1])
robusta = abs(mediana_con - mediana_senza) < 1

print(f"moda: {moda} x{conteggio_moda} | mediane: {mediana_con} vs {mediana_senza}")`
    },

    { type: "theory", title: "Varianza e deviazione standard", html: `
<p>Due gruppi possono avere la stessa media e allenarsi in modo completamente diverso: uno costante, uno che alterna giornate super a giornate no. La <strong>varianza</strong> misura questa dispersione: la media dei quadrati degli scarti dalla media. La <strong>deviazione standard</strong> è la sua radice quadrata — ha la stessa unità dei dati, quindi si legge direttamente ("in media ti scosti di 6 kg dalla media").</p>
<pre><code>import numpy as np
carichi = [80, 85, 78, 82, 90, 75]
np.var(carichi)          # varianza di POPOLAZIONE  (divide per n)
np.var(carichi, ddof=1)  # varianza CAMPIONARIA     (divide per n-1)
np.std(carichi, ddof=1)  # deviazione standard campionaria</code></pre>
<p>Il parametro <code>ddof=1</code> è la domanda trabocchetto dei colloqui: se i dati sono un <em>campione</em> e vuoi stimare la varianza della popolazione da cui provengono, dividi per <code>n-1</code>, non per <code>n</code> (correzione di Bessel). Con n grande la differenza svanisce; con n piccolo è sostanziale.</p>
`, more: `
<p>Perché n-1? Intuizione da lavagna: la varianza misura gli scarti dalla media <em>vera</em> della popolazione, ma tu non la conosci — usi la media <em>campionaria</em>, calcolata dagli stessi dati. E la media campionaria, per costruzione, sta "in mezzo" ai tuoi dati più di quanto ci stia la media vera: gli scarti da essa sono sistematicamente più piccoli. Dividere per n-1 invece che per n compensa esattamente questa sottostima. In termini formali: hai "speso" un grado di libertà per stimare la media, e i gradi di libertà residui sono n-1.</p>
<p>Attenzione alle convenzioni delle librerie, altra domanda classica: <code>np.std</code> usa <code>ddof=0</code> di default (popolazione), mentre <code>pandas.Series.std</code> usa <code>ddof=1</code> di default (campione). Stesso nome, default opposti: se confronti una deviazione standard calcolata con NumPy e una con Pandas sugli stessi dati e vengono diverse, è quasi sempre questo.</p>
<p>La deviazione standard entra anche nel <strong>coefficiente di variazione</strong> (CV = std/media): una std di 5 kg è enorme se la media è 20 kg, trascurabile se la media è 200. Il CV rende confrontabile la variabilità tra grandezze su scale diverse — ad esempio la costanza di un atleta nello squat (attorno a 150 kg) e nel curl (attorno a 20 kg).</p>
` },

    {
      type: "exercise", id: "stat-03", kg: 10, title: "Costanza sotto il bilanciere",
      task: `<p>Due atleti, stessi kg medi di squat, storia diversa. Calcola:</p>
<ul>
<li><code>std_anna</code>, <code>std_bruno</code>: deviazione standard <strong>campionaria</strong> (ddof=1) dei due</li>
<li><code>piu_costante</code>: la stringa <code>"anna"</code> o <code>"bruno"</code>, chi ha la std più bassa</li>
<li><code>rapporto_ddof</code>: per Anna, la varianza campionaria divisa per quella di popolazione (quanto conta la correzione con n=6)</li>
</ul>`,
      starter: `import numpy as np
anna  = [148, 152, 150, 149, 151, 150]
bruno = [130, 170, 145, 160, 135, 160]

std_anna = ...
std_bruno = ...
piu_costante = ...
rapporto_ddof = ...

print(f"Anna {std_anna:.2f} | Bruno {std_bruno:.2f} | piu' costante: {piu_costante} | n/(n-1) = {rapporto_ddof:.3f}")`,
      check: `import numpy as np
assert 'std_anna' in globals() and abs(float(std_anna) - np.std([148,152,150,149,151,150], ddof=1)) < 1e-6, "std_anna: np.std(anna, ddof=1), circa 1.41"
assert 'std_bruno' in globals() and abs(float(std_bruno) - np.std([130,170,145,160,135,160], ddof=1)) < 1e-6, "std_bruno: np.std(bruno, ddof=1), circa 15.8"
assert 'piu_costante' in globals() and piu_costante == "anna", "piu_costante: Anna, la sua std e' 10 volte piu' bassa a parita' di media"
assert 'rapporto_ddof' in globals() and abs(float(rapporto_ddof) - 1.2) < 1e-6, "rapporto_ddof: var(ddof=1)/var(ddof=0) = n/(n-1) = 6/5 = 1.2"`,
      hint: `<p>Il rapporto tra le due varianze è esattamente n/(n-1): con 6 misure la varianza campionaria è il 20% più grande di quella di popolazione. <code>np.var(anna, ddof=1) / np.var(anna)</code>.</p>`,
      solution: `import numpy as np
anna  = [148, 152, 150, 149, 151, 150]
bruno = [130, 170, 145, 160, 135, 160]

std_anna = np.std(anna, ddof=1)
std_bruno = np.std(bruno, ddof=1)
piu_costante = "anna" if std_anna < std_bruno else "bruno"
rapporto_ddof = np.var(anna, ddof=1) / np.var(anna)

print(f"Anna {std_anna:.2f} | Bruno {std_bruno:.2f} | piu' costante: {piu_costante} | n/(n-1) = {rapporto_ddof:.3f}")`
    },

    { type: "theory", title: "La normale e lo z-score", html: `
<p>La distribuzione <strong>normale</strong> (gaussiana) è la campana che spunta ovunque: altezze, errori di misura, medie di campioni (lo vedrai col CLT). È definita da due soli numeri: media &mu; e deviazione standard &sigma;. Regola empirica da sapere a memoria: il <strong>68%</strong> dei valori cade entro 1&sigma; dalla media, il <strong>95%</strong> entro 2&sigma;, il <strong>99.7%</strong> entro 3&sigma;.</p>
<p>Lo <strong>z-score</strong> traduce qualunque valore in "quante deviazioni standard dalla media":</p>
<pre><code>z = (x - media) / std
# z = 0    -> esattamente nella media
# z = +2   -> insolitamente alto (top ~2.5%)
# z = -1.5 -> sotto la media di una volta e mezza la std</code></pre>
<p>Il potere dello z-score è il <strong>confronto tra scale diverse</strong>: 120 kg di squat e 35 kg di curl non si confrontano in kg, ma i loro z-score rispetto alla sala sì — dicono chi è più eccezionale <em>nel suo esercizio</em>.</p>
`, more: `
<p>Con scipy la campana diventa uno strumento di calcolo: <code>scipy.stats.norm.cdf(x, mu, sigma)</code> dà la probabilità che un valore estratto a caso sia minore di x (l'area sotto la curva a sinistra di x), e <code>norm.ppf(q, mu, sigma)</code> fa l'inverso — dato un quantile, restituisce il valore: <code>norm.ppf(0.975)</code> = 1.96, il famoso numero degli intervalli al 95%. La coppia cdf/ppf è la stessa idea di "percentile" che conosci, resa continua.</p>
<p>Attenzione all'uso disinvolto: non tutto è normale. Redditi, tempi di attesa, dimensioni dei file, follower sui social hanno code lunghe — usare la regola 68-95-99.7 su dati non normali produce assurdità (tipo "il 2% dei clienti spende un importo negativo"). Prima di ragionare in z-score, guarda la forma dei dati: un istogramma costa una riga. Per dati con coda destra, spesso il logaritmo li rende quasi-normali (lognormale): è il trucco log-transform che ritroverai nella sala Feature Engineering.</p>
<p>Domanda da colloquio ricorrente: "z-score oltre quale soglia è un outlier?" Non esiste una soglia giusta universale — |z| &gt; 3 è la convenzione più citata (sotto normalità, tre valori su mille), ma la risposta forte è: dipende da quanti dati hai. Su un milione di osservazioni normali, |z| &gt; 3 ne becca circa 2700 perfettamente legittime. Con tanti dati si usano soglie più alte o metodi basati sui quantili (IQR), meno sensibili alla forma della distribuzione.</p>
` },

    {
      type: "exercise", id: "stat-04", kg: 10, title: "Chi è più fuori scala?",
      task: `<p>Dana solleva 120 kg di squat (sala: media 95, std 12). Elio fa 34 kg di curl (sala: media 26, std 3). Chi è più eccezionale rispetto alla propria specialità?</p>
<ul>
<li><code>z_dana</code>, <code>z_elio</code>: gli z-score dei due</li>
<li><code>piu_eccezionale</code>: <code>"dana"</code> o <code>"elio"</code></li>
</ul>`,
      starter: `z_dana = ...
z_elio = ...
piu_eccezionale = ...

print(f"Dana z={z_dana:.2f} | Elio z={z_elio:.2f} -> {piu_eccezionale}")`,
      check: `assert 'z_dana' in globals() and abs(float(z_dana) - (120-95)/12) < 1e-9, "z_dana = (120 - 95) / 12, circa 2.08"
assert 'z_elio' in globals() and abs(float(z_elio) - (34-26)/3) < 1e-9, "z_elio = (34 - 26) / 3, circa 2.67"
assert 'piu_eccezionale' in globals() and piu_eccezionale == "elio", "Elio: 2.67 deviazioni sopra la media contro le 2.08 di Dana. I kg assoluti non contano, contano le std"`,
      hint: `<p>z = (valore - media) / std. Il confronto si fa sugli z, non sui kg: 120 &gt; 34 ma è la distanza <em>in deviazioni standard</em> a dire chi è più raro.</p>`,
      solution: `z_dana = (120 - 95) / 12
z_elio = (34 - 26) / 3
piu_eccezionale = "elio" if z_elio > z_dana else "dana"

print(f"Dana z={z_dana:.2f} | Elio z={z_elio:.2f} -> {piu_eccezionale}")`
    },

    {
      type: "exercise", id: "stat-05", kg: 10, title: "L'area sotto la campana",
      task: `<p>I tempi sui 5 km dei soci sono circa normali: media 27 minuti, std 3. Usa <code>scipy.stats.norm</code>:</p>
<ul>
<li><code>p_sotto_24</code>: probabilità che un socio a caso stia sotto i 24 minuti</li>
<li><code>p_tra_24_30</code>: probabilità di un tempo tra 24 e 30 minuti (la regola del 68%!)</li>
<li><code>tempo_top10</code>: il tempo sotto cui sta solo il 10% più veloce (quantile 0.10)</li>
</ul>`,
      starter: `from scipy import stats

p_sotto_24 = ...
p_tra_24_30 = ...
tempo_top10 = ...

print(f"P(<24)={p_sotto_24:.3f} | P(24-30)={p_tra_24_30:.3f} | top10 sotto {tempo_top10:.1f} min")`,
      check: `from scipy import stats as _st
assert 'p_sotto_24' in globals() and abs(float(p_sotto_24) - _st.norm.cdf(24, 27, 3)) < 1e-6, "p_sotto_24: stats.norm.cdf(24, 27, 3), circa 0.159"
assert 'p_tra_24_30' in globals() and abs(float(p_tra_24_30) - (_st.norm.cdf(30, 27, 3) - _st.norm.cdf(24, 27, 3))) < 1e-6, "p_tra_24_30: cdf(30) - cdf(24), circa 0.683 — e' la regola del 68% entro 1 std"
assert 'tempo_top10' in globals() and abs(float(tempo_top10) - _st.norm.ppf(0.10, 27, 3)) < 1e-6, "tempo_top10: stats.norm.ppf(0.10, 27, 3), circa 23.2 minuti"`,
      hint: `<p><code>norm.cdf(x, media, std)</code> = area a sinistra di x. Per un intervallo: cdf del bordo destro meno cdf del sinistro. <code>norm.ppf</code> è l'inverso della cdf: da probabilità a valore.</p>`,
      solution: `from scipy import stats

p_sotto_24 = stats.norm.cdf(24, 27, 3)
p_tra_24_30 = stats.norm.cdf(30, 27, 3) - stats.norm.cdf(24, 27, 3)
tempo_top10 = stats.norm.ppf(0.10, 27, 3)

print(f"P(<24)={p_sotto_24:.3f} | P(24-30)={p_tra_24_30:.3f} | top10 sotto {tempo_top10:.1f} min")`
    },

    { type: "theory", title: "Probabilità condizionata", html: `
<p>La probabilità <strong>condizionata</strong> P(A|B) — "probabilità di A <em>sapendo che</em> B" — è il concetto che separa chi ragiona bene sui dati da chi no. Si calcola restringendo il mondo ai soli casi in cui B è vero:</p>
<pre><code>P(A|B) = P(A e B) / P(B)</code></pre>
<p>Esempio in sala: P(abbandona entro un mese) = 20%. Ma P(abbandona | non è mai venuto la prima settimana) = 65%. Stessa palestra, informazione diversa, probabilità diversissima: <strong>condizionare cambia tutto</strong>.</p>
<p>Errore classico (anche nei colloqui): confondere P(A|B) con P(B|A). La probabilità di essere bravi a pesistica dato che sei alto NON è la probabilità di essere alto dato che sei bravo a pesistica. Il ponte tra le due è il teorema di Bayes, prossima lavagna.</p>
`, more: `
<p>Due eventi sono <strong>indipendenti</strong> quando condizionare non cambia nulla: P(A|B) = P(A). È la definizione operativa da usare sui dati: se la percentuale di abbandoni è uguale tra chi viene di mattina e chi di sera, l'orario è indipendente dall'abbandono e non ti serve come feature. Se invece P(A|B) &ne; P(A), c'è associazione — che come vedrai nella lavagna su correlazione e causalità NON significa ancora che B causi A.</p>
<p>La <strong>legge della probabilità totale</strong> ricompone il quadro dai pezzi condizionati: se i soci si dividono in mattinieri (60%) e serali (40%), allora P(abbandono) = P(abb|mattina)&middot;0.6 + P(abb|sera)&middot;0.4. Sembra banale ma è il cuore di molti calcoli reali: il tasso globale è sempre una media pesata dei tassi nei sottogruppi — e può succedere che un sottogruppo migliori, l'altro migliori, e il totale peggiori, se nel frattempo cambiano i pesi. Questo è il <strong>paradosso di Simpson</strong>, una delle domande trabocchetto più amate: un ospedale può avere mortalità più alta di un altro pur essendo migliore su OGNI tipo di paziente, semplicemente perché riceve i casi più gravi.</p>
` },

    {
      type: "exercise", id: "stat-06", kg: 10, title: "Restringere il mondo",
      task: `<p>Dati di 200 soci: quanti usano l'app di allenamento e quanti hanno rinnovato l'abbonamento. Calcola:</p>
<ul>
<li><code>p_rinnovo</code>: probabilità di rinnovo (tutti i soci)</li>
<li><code>p_rinnovo_dato_app</code>: P(rinnovo | usa l'app)</li>
<li><code>p_app_dato_rinnovo</code>: P(usa l'app | rinnovo) — nota che è un numero diverso!</li>
</ul>`,
      setup: `dati = {
    ("app", "rinnovo"): 72,
    ("app", "abbandono"): 18,
    ("no_app", "rinnovo"): 48,
    ("no_app", "abbandono"): 62,
}`,
      starter: `# dati: dizionario (uso_app, esito) -> numero soci, gia' caricato
totale = sum(dati.values())

p_rinnovo = ...
p_rinnovo_dato_app = ...
p_app_dato_rinnovo = ...

print(f"P(rinnovo)={p_rinnovo:.2f} | P(rinnovo|app)={p_rinnovo_dato_app:.2f} | P(app|rinnovo)={p_app_dato_rinnovo:.2f}")`,
      check: `assert 'p_rinnovo' in globals() and abs(float(p_rinnovo) - 120/200) < 1e-9, "p_rinnovo: (72+48)/200 = 0.60"
assert 'p_rinnovo_dato_app' in globals() and abs(float(p_rinnovo_dato_app) - 72/90) < 1e-9, "p_rinnovo_dato_app: 72 rinnovi su 90 utenti app = 0.80. Il denominatore e' SOLO chi usa l'app"
assert 'p_app_dato_rinnovo' in globals() and abs(float(p_app_dato_rinnovo) - 72/120) < 1e-9, "p_app_dato_rinnovo: 72 su 120 rinnovi = 0.60. Stesso numeratore, denominatore diverso: le due condizionate NON coincidono"`,
      hint: `<p>Condizionare = cambiare denominatore. P(rinnovo|app) divide per i soli utenti app (72+18=90); P(app|rinnovo) divide per i soli rinnovi (72+48=120). Il numeratore è lo stesso (72), i mondi no.</p>`,
      solution: `totale = sum(dati.values())

p_rinnovo = (dati[("app", "rinnovo")] + dati[("no_app", "rinnovo")]) / totale
p_rinnovo_dato_app = dati[("app", "rinnovo")] / (dati[("app", "rinnovo")] + dati[("app", "abbandono")])
p_app_dato_rinnovo = dati[("app", "rinnovo")] / (dati[("app", "rinnovo")] + dati[("no_app", "rinnovo")])

print(f"P(rinnovo)={p_rinnovo:.2f} | P(rinnovo|app)={p_rinnovo_dato_app:.2f} | P(app|rinnovo)={p_app_dato_rinnovo:.2f}")`
    },

    { type: "theory", title: "Distribuzioni discrete: binomiale e Poisson", html: `
<p>Due distribuzioni coprono la maggior parte dei conteggi che incontrerai.</p>
<p>La <strong>binomiale</strong>: n prove indipendenti, ognuna successo con probabilità p — quanti successi? "Su 20 iscritti di prova, quanti si abbonano se ognuno lo fa col 30% di probabilità?"</p>
<pre><code>from scipy import stats
stats.binom.pmf(8, n=20, p=0.3)   # P(esattamente 8 abbonamenti)
stats.binom.cdf(4, n=20, p=0.3)   # P(al massimo 4)</code></pre>
<p>La <strong>Poisson</strong>: eventi rari in un intervallo, noto solo il ritmo medio &lambda;. "In media entrano 4 clienti l'ora: che probabilità di vederne 10?" Non c'è un n massimo — solo il ritmo.</p>
<pre><code>stats.poisson.pmf(10, mu=4)   # P(esattamente 10 arrivi)</code></pre>
<p><code>pmf</code> = probabilità del valore esatto (discreto), <code>cdf</code> = probabilità cumulata "fino a". Il complemento <code>1 - cdf(k)</code> dà P(più di k).</p>
`, more: `
<p>Le due distribuzioni sono parenti strette: se n è grande e p piccolo, la binomiale converge alla Poisson con &lambda; = np. È il motivo per cui la Poisson modella gli eventi "rari su tante occasioni": ogni singolo visitatore del sito ha una probabilità minuscola di comprare in un dato minuto, ma i visitatori sono migliaia — gli acquisti al minuto sono Poisson. Regola pratica: n &gt; 50 e p &lt; 0.1 rendono l'approssimazione già buona.</p>
<p>Firma distintiva della Poisson: <strong>media = varianza = &lambda;</strong>. Sui dati reali questo è un test diagnostico gratuito: se i tuoi conteggi hanno varianza molto maggiore della media (overdispersion — succede con clienti che arrivano a gruppi, ticket che si aprono a raffica dopo un guasto), la Poisson è il modello sbagliato e serve qualcosa di più flessibile (binomiale negativa). Domanda da colloquio per posizioni analytics: "come modelleresti gli arrivi al pronto soccorso?" — la risposta attesa nomina Poisson E il caveat dell'overdispersion.</p>
<p>La binomiale, dal canto suo, è il fondamento matematico dei test A/B che vedrai a fine sala: "1000 utenti, 45 conversioni" È un esperimento binomiale con n=1000 e p incognita — tutta l'inferenza sulle proporzioni (errore standard, z-test) discende dalla sua varianza np(1-p).</p>
` },

    {
      type: "exercise", id: "stat-07", kg: 10, title: "Le prove gratuite",
      task: `<p>Ogni prova gratuita si converte in abbonamento con p=0.3, indipendentemente. Questa settimana ci sono 20 prove. Calcola:</p>
<ul>
<li><code>p_esatto_6</code>: probabilità di esattamente 6 conversioni</li>
<li><code>p_almeno_10</code>: probabilità di almeno 10 conversioni</li>
<li><code>attese</code>: il numero atteso di conversioni (formula della media binomiale)</li>
</ul>`,
      starter: `from scipy import stats

p_esatto_6 = ...
p_almeno_10 = ...
attese = ...

print(f"P(=6)={p_esatto_6:.3f} | P(>=10)={p_almeno_10:.3f} | attese={attese:.1f}")`,
      check: `from scipy import stats as _st
assert 'p_esatto_6' in globals() and abs(float(p_esatto_6) - _st.binom.pmf(6, 20, 0.3)) < 1e-6, "p_esatto_6: stats.binom.pmf(6, 20, 0.3), circa 0.192"
assert 'p_almeno_10' in globals() and abs(float(p_almeno_10) - (1 - _st.binom.cdf(9, 20, 0.3))) < 1e-6, "p_almeno_10: 1 - cdf(9) — attenzione, 'almeno 10' esclude fino a 9, non fino a 10"
assert 'attese' in globals() and abs(float(attese) - 6.0) < 1e-9, "attese: n*p = 20*0.3 = 6"`,
      hint: `<p>"Almeno 10" = 1 - P(al massimo 9) = <code>1 - binom.cdf(9, 20, 0.3)</code>. L'errore da un-off (cdf(10) invece di cdf(9)) è il più comune in assoluto qui.</p>`,
      solution: `from scipy import stats

p_esatto_6 = stats.binom.pmf(6, 20, 0.3)
p_almeno_10 = 1 - stats.binom.cdf(9, 20, 0.3)
attese = 20 * 0.3

print(f"P(=6)={p_esatto_6:.3f} | P(>=10)={p_almeno_10:.3f} | attese={attese:.1f}")`
    },

    {
      type: "exercise", id: "stat-08", kg: 10, title: "Il ritmo della reception",
      task: `<p>Alla reception arrivano in media 4 richieste l'ora (Poisson). Calcola:</p>
<ul>
<li><code>p_zero</code>: probabilità di un'ora completamente tranquilla (0 richieste)</li>
<li><code>p_sovraccarico</code>: probabilità di più di 8 richieste in un'ora</li>
<li><code>p_zero_due_ore</code>: probabilità di DUE ore di fila tranquille — occhio: su due ore il ritmo raddoppia</li>
</ul>`,
      starter: `from scipy import stats

p_zero = ...
p_sovraccarico = ...
p_zero_due_ore = ...

print(f"P(0 in 1h)={p_zero:.3f} | P(>8)={p_sovraccarico:.4f} | P(0 in 2h)={p_zero_due_ore:.5f}")`,
      check: `from scipy import stats as _st
assert 'p_zero' in globals() and abs(float(p_zero) - _st.poisson.pmf(0, 4)) < 1e-6, "p_zero: stats.poisson.pmf(0, 4), circa 0.018"
assert 'p_sovraccarico' in globals() and abs(float(p_sovraccarico) - (1 - _st.poisson.cdf(8, 4))) < 1e-6, "p_sovraccarico: 1 - poisson.cdf(8, 4), circa 0.021"
assert 'p_zero_due_ore' in globals() and abs(float(p_zero_due_ore) - _st.poisson.pmf(0, 8)) < 1e-6, "p_zero_due_ore: su 2 ore lambda diventa 8 -> poisson.pmf(0, 8). Equivale a p_zero al quadrato (indipendenza!)"`,
      hint: `<p>La Poisson si "riscala" col tempo: 4 richieste/ora su 2 ore = &lambda;=8. E infatti <code>pmf(0, 8)</code> = <code>pmf(0, 4)**2</code>: due ore tranquille indipendenti.</p>`,
      solution: `from scipy import stats

p_zero = stats.poisson.pmf(0, 4)
p_sovraccarico = 1 - stats.poisson.cdf(8, 4)
p_zero_due_ore = stats.poisson.pmf(0, 8)

print(f"P(0 in 1h)={p_zero:.3f} | P(>8)={p_sovraccarico:.4f} | P(0 in 2h)={p_zero_due_ore:.5f}")`
    },

    { type: "theory", title: "Il teorema di Bayes", html: `
<p>Bayes risponde alla domanda: <em>come aggiorno una probabilità quando arriva nuova evidenza?</em></p>
<pre><code>P(ipotesi | evidenza) = P(evidenza | ipotesi) * P(ipotesi) / P(evidenza)</code></pre>
<p>Il caso da colloquio per eccellenza è il test diagnostico. Un infortunio raro colpisce l'1% degli atleti. Il test lo rileva nel 95% dei casi (sensibilità) e dà falso allarme nel 10% dei sani (1 - specificità). Sei positivo: quanto devi preoccuparti?</p>
<p>Intuizione col metodo delle frequenze naturali, su 1000 atleti: 10 infortunati &rarr; ~9.5 positivi veri; 990 sani &rarr; ~99 falsi allarmi. I positivi sono ~108, di cui malati solo ~9.5: <strong>meno del 9%</strong>. Il test "al 95%" produce quasi tutti falsi positivi, perché la malattia è rara: il <strong>prior conta quanto l'evidenza</strong>.</p>
`, more: `
<p>L'errore che Bayes corregge ha un nome: <strong>base rate neglect</strong>, ignorare la frequenza di base. P(positivo|malato)=0.95 e P(malato|positivo)=0.09 sembrano contraddirsi solo se dimentichi che i sani sono 99 volte i malati: anche una piccola frazione di falsi allarmi su una popolazione enorme sommerge i veri positivi. Stesso meccanismo nei sistemi anti-frode: un modello che becca il 99% delle frodi con 1% di falsi positivi, su transazioni fraudolente allo 0.1%, produce ~10 falsi allarmi per ogni frode vera — il team antifrode passa il giorno a scartare segnalazioni. Questo trade-off è esattamente quello che precision e recall misurano nelle sale scikit-learn.</p>
<p>In formule, spesso il denominatore P(evidenza) si calcola con la probabilità totale: P(pos) = P(pos|malato)P(malato) + P(pos|sano)P(sano). Ma nei colloqui conviene il metodo delle frequenze naturali visto sopra: meno elegante, quasi impossibile sbagliarlo sotto pressione.</p>
<p>Bayes è anche una filosofia di aggiornamento incrementale: il posterior di oggi è il prior di domani. Un secondo test positivo indipendente parte da P(malato)=9% e la porta a ~48%: l'evidenza si accumula moltiplicando i rapporti di verosimiglianza. Questo modo di pensare — quantificare quanto ogni nuovo dato deve spostare la tua convinzione — è considerato dai selezionatori un segnale forte di maturità statistica, più della formula in sé.</p>
` },

    {
      type: "exercise", id: "stat-09", kg: 15, title: "Positivo al test: e ora?",
      task: `<p>Prevalenza 1%, sensibilità 95%, falsi positivi 10% dei sani. Calcola con Bayes:</p>
<ul>
<li><code>p_positivo</code>: probabilità totale di risultare positivi</li>
<li><code>p_malato_dato_pos</code>: P(malato | positivo)</li>
<li><code>p_secondo_test</code>: P(malato | due positivi indipendenti) — usa <code>p_malato_dato_pos</code> come nuovo prior e riapplica Bayes</li>
</ul>`,
      starter: `prevalenza = 0.01
sensibilita = 0.95
falsi_pos = 0.10

p_positivo = ...
p_malato_dato_pos = ...

# secondo test: il posterior diventa il nuovo prior
nuovo_prior = p_malato_dato_pos
p_secondo_test = ...

print(f"P(pos)={p_positivo:.4f} | P(malato|pos)={p_malato_dato_pos:.3f} | dopo 2 test: {p_secondo_test:.3f}")`,
      check: `_pp = 0.95*0.01 + 0.10*0.99
_post1 = 0.95*0.01 / _pp
_post2 = 0.95*_post1 / (0.95*_post1 + 0.10*(1-_post1))
assert 'p_positivo' in globals() and abs(float(p_positivo) - _pp) < 1e-9, "p_positivo: sens*prev + falsi_pos*(1-prev) = 0.95*0.01 + 0.10*0.99, circa 0.1085"
assert 'p_malato_dato_pos' in globals() and abs(float(p_malato_dato_pos) - _post1) < 1e-6, "p_malato_dato_pos: (0.95*0.01) / p_positivo, circa 0.088 — meno del 9% nonostante il test 'al 95%'"
assert 'p_secondo_test' in globals() and abs(float(p_secondo_test) - _post2) < 1e-4, "p_secondo_test: stessa formula con prior = p_malato_dato_pos, circa 0.477. L'evidenza si accumula"`,
      hint: `<p>Denominatore = probabilità totale: P(pos) = sens&middot;prev + falsi_pos&middot;(1-prev). Poi P(malato|pos) = sens&middot;prev / P(pos). Per il secondo test, identica struttura con <code>nuovo_prior</code> al posto di <code>prevalenza</code>.</p>`,
      solution: `prevalenza = 0.01
sensibilita = 0.95
falsi_pos = 0.10

p_positivo = sensibilita * prevalenza + falsi_pos * (1 - prevalenza)
p_malato_dato_pos = sensibilita * prevalenza / p_positivo

nuovo_prior = p_malato_dato_pos
p_secondo_test = sensibilita * nuovo_prior / (sensibilita * nuovo_prior + falsi_pos * (1 - nuovo_prior))

print(f"P(pos)={p_positivo:.4f} | P(malato|pos)={p_malato_dato_pos:.3f} | dopo 2 test: {p_secondo_test:.3f}")`
    },

    { type: "theory", title: "Legge dei grandi numeri", html: `
<p>La <strong>legge dei grandi numeri</strong> (LGN) dice: al crescere del numero di prove, la media osservata converge al valore atteso. Lancia una moneta 10 volte e puoi vedere 7 teste; lanciala 100&nbsp;000 volte e la frequenza sarà inchiodata vicino a 0.5.</p>
<pre><code>import numpy as np
rng = np.random.default_rng(42)
lanci = rng.integers(0, 2, size=100_000)
lanci[:10].mean()      # con 10 lanci: puo' uscire qualsiasi cosa
lanci.mean()           # con 100k: ~0.500</code></pre>
<p>È il motivo per cui il casinò vince <em>sempre</em> sul lungo periodo pur perdendo spesso la singola mano, e il motivo per cui le metriche calcolate su 20 utenti non vanno prese sul serio. Attenzione però a cosa NON dice: non promette che le teste "recuperino" dopo una serie di croci (fallacia del giocatore) — promette solo che i nuovi lanci, numerosissimi, diluiscono lo squilibrio iniziale.</p>
`, more: `
<p>La distinzione fine: la LGN parla della <strong>media</strong>, non della <strong>somma</strong>. Dopo 1000 croci di fila (improbabilissime ma possibili), la moneta resta al 50%: lo scarto ASSOLUTO tra teste e croci non tende a zero — anzi cresce come radice di n — è lo scarto RELATIVO (la frequenza) a convergere. Chi gioca alla roulette "perché il rosso è in ritardo" sta scommettendo contro questa distinzione.</p>
<p>Quanto in fretta converge? L'errore tipico della frequenza scala come 1/&radic;n: per dimezzare l'incertezza servono il QUADRUPLO dei dati. Questo &radic;n è la costante universale della statistica — lo ritroverai identico nell'errore standard e nel CLT — ed è il motivo economico per cui i test A/B costano: passare da "±2%" a "±1%" di precisione non richiede il doppio degli utenti, ne richiede quattro volte tanti.</p>
<p>La LGN è anche il fondamento teorico dei metodi <strong>Monte Carlo</strong> che userai in questa sala per bootstrap e potenza: "non so calcolare questa probabilità in formula chiusa, ma so simularla 10&nbsp;000 volte e la frequenza osservata convergerà al valore vero". Ogni simulazione di questa sala è la LGN messa al lavoro.</p>
` },

    {
      type: "exercise", id: "stat-10", kg: 10, title: "La moneta ha memoria?",
      task: `<p>Simula 100&nbsp;000 lanci di moneta con <code>rng</code> e osserva la convergenza:</p>
<ul>
<li><code>freq_10</code>, <code>freq_1000</code>, <code>freq_tutti</code>: frequenza di teste nei primi 10, nei primi 1000 e in tutti i lanci</li>
<li><code>errore_10</code>, <code>errore_tutti</code>: distanza da 0.5 delle frequenze a 10 e a 100k lanci</li>
<li><code>converge</code>: <code>True</code> se <code>errore_tutti &lt; errore_10</code></li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(42)`,
      starter: `# rng gia' pronto (seed fissato)
lanci = rng.integers(0, 2, size=100_000)

freq_10 = ...
freq_1000 = ...
freq_tutti = ...

errore_10 = ...
errore_tutti = ...
converge = ...

print(f"10: {freq_10:.3f} | 1000: {freq_1000:.3f} | 100k: {freq_tutti:.4f} | converge: {converge}")`,
      check: `assert 'freq_10' in globals() and abs(float(freq_10) - lanci[:10].mean()) < 1e-9, "freq_10: lanci[:10].mean()"
assert 'freq_1000' in globals() and abs(float(freq_1000) - lanci[:1000].mean()) < 1e-9, "freq_1000: lanci[:1000].mean()"
assert 'freq_tutti' in globals() and abs(float(freq_tutti) - lanci.mean()) < 1e-9, "freq_tutti: lanci.mean()"
assert 'errore_tutti' in globals() and abs(float(errore_tutti) - abs(float(freq_tutti) - 0.5)) < 1e-9, "errore_tutti: abs(freq_tutti - 0.5)"
assert 'converge' in globals() and converge == True and float(errore_tutti) < 0.01, "Con 100k lanci l'errore scende sotto 0.01: la LGN al lavoro"`,
      hint: `<p>Slicing + <code>.mean()</code>: la media di 0 e 1 È la frequenza degli 1. L'errore è <code>abs(freq - 0.5)</code>.</p>`,
      solution: `lanci = rng.integers(0, 2, size=100_000)

freq_10 = lanci[:10].mean()
freq_1000 = lanci[:1000].mean()
freq_tutti = lanci.mean()

errore_10 = abs(freq_10 - 0.5)
errore_tutti = abs(freq_tutti - 0.5)
converge = errore_tutti < errore_10

print(f"10: {freq_10:.3f} | 1000: {freq_1000:.3f} | 100k: {freq_tutti:.4f} | converge: {converge}")`
    },

    { type: "theory", title: "Il teorema del limite centrale", html: `
<p>Il <strong>CLT</strong> è il teorema più importante della statistica applicata: prendi campioni da una distribuzione QUALSIASI (anche storta, anche bimodale) e calcola la media di ogni campione. La distribuzione di quelle <em>medie</em>:</p>
<ol>
<li>tende a una <strong>normale</strong> (qualunque fosse la forma di partenza),</li>
<li>centrata sulla media vera &mu;,</li>
<li>con deviazione standard <strong>&sigma;/&radic;n</strong> — l'<em>errore standard</em>.</li>
</ol>
<pre><code>medie = [rng.exponential(10, size=50).mean() for _ in range(5000)]
# l'esponenziale e' stortissima, ma l'istogramma di 'medie' e' una campana
# centrata su 10, con std circa 10/sqrt(50)</code></pre>
<p>Conseguenza pratica enorme: anche senza sapere nulla della distribuzione dei singoli dati, sai come si comporta la <em>media campionaria</em> — ed è su questo che si costruiscono intervalli di confidenza e test.</p>
`, more: `
<p>Il fattore &radic;n al denominatore è lo stesso della LGN e merita di essere interiorizzato: quadruplicare il campione dimezza l'errore standard. È una legge di rendimenti decrescenti — i primi 100 utenti di un esperimento comprano tanta precisione, i successivi 100 molta meno — e governa ogni calcolo di sample size.</p>
<p>Quando il CLT NON basta: (1) con n piccolo e distribuzione molto storta la convergenza è lenta — la regola scolastica "n&ge;30" è una semplificazione, per un'esponenziale va bene, per distribuzioni con outlier estremi possono servire centinaia di osservazioni; (2) per distribuzioni a <strong>varianza infinita</strong> (code alla Pareto, tipiche di richezza, dimensioni città, viralità dei post) il CLT proprio non si applica — le medie campionarie continuano a saltare anche con milioni di dati, e chi analizza metriche dominate da pochi whale (spesa dei top-spender in un gioco mobile) lo scopre a proprie spese: lì si lavora su mediane, quantili o log.</p>
<p>Nota per i colloqui: il CLT parla della distribuzione delle MEDIE CAMPIONARIE, non dei dati. "Con abbastanza dati la distribuzione diventa normale" è una risposta sbagliata che i selezionatori usano apposta come esca — i dati restano della forma che sono; è la media di tanti campioni a normalizzarsi.</p>
` },

    {
      type: "exercise", id: "stat-11", kg: 15, title: "La campana che nasce dal caos",
      task: `<p>I tempi di attesa alla panca sono esponenziali (media 10 minuti): distribuzione stortissima. Simula 5000 campioni da 50 attese ciascuno:</p>
<ul>
<li><code>medie</code>: array delle 5000 medie campionarie</li>
<li><code>centro</code>: la media delle medie (deve avvicinarsi a 10)</li>
<li><code>se_osservato</code>: la deviazione standard delle medie</li>
<li><code>se_teorico</code>: l'errore standard previsto dal CLT: 10/&radic;50</li>
<li><code>clt_funziona</code>: <code>True</code> se osservato e teorico distano meno di 0.1</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(7)`,
      starter: `import numpy as np
# rng gia' pronto

medie = np.array([rng.exponential(10, size=50).mean() for _ in range(5000)])

centro = ...
se_osservato = ...
se_teorico = ...
clt_funziona = ...

print(f"centro {centro:.2f} | SE osservato {se_osservato:.3f} vs teorico {se_teorico:.3f} | CLT: {clt_funziona}")`,
      check: `import numpy as np
assert 'medie' in globals() and len(medie) == 5000, "medie: 5000 medie di campioni da 50"
assert 'centro' in globals() and abs(float(centro) - 10) < 0.2, "centro: medie.mean(), vicino a 10 — le medie campionarie sono centrate sulla media vera"
assert 'se_teorico' in globals() and abs(float(se_teorico) - 10/np.sqrt(50)) < 1e-6, "se_teorico: 10 / np.sqrt(50), circa 1.414"
assert 'se_osservato' in globals() and abs(float(se_osservato) - float(np.std(medie))) < 1e-6, "se_osservato: np.std(medie)"
assert 'clt_funziona' in globals() and clt_funziona == True, "clt_funziona: i due SE devono coincidere entro 0.1 — il CLT predice la dispersione delle medie senza guardarle"`,
      hint: `<p><code>centro = medie.mean()</code>, <code>se_osservato = medie.std()</code> (qui ddof non conta, n=5000), <code>se_teorico = 10 / np.sqrt(50)</code>. Il punto della simulazione: il CLT ti dice in anticipo quanto ballano le medie.</p>`,
      solution: `import numpy as np

medie = np.array([rng.exponential(10, size=50).mean() for _ in range(5000)])

centro = medie.mean()
se_osservato = medie.std()
se_teorico = 10 / np.sqrt(50)
clt_funziona = abs(se_osservato - se_teorico) < 0.1

print(f"centro {centro:.2f} | SE osservato {se_osservato:.3f} vs teorico {se_teorico:.3f} | CLT: {clt_funziona}")`
    },

    { type: "theory", title: "Errore standard e intervalli di confidenza", html: `
<p>Hai misurato una media su un campione. Quanto ti fidi? L'<strong>errore standard</strong> (SE) quantifica quanto quella media ballerebbe se ripetessi il campionamento:</p>
<pre><code>SE = s / sqrt(n)        # s = std campionaria (ddof=1)</code></pre>
<p>L'<strong>intervallo di confidenza al 95%</strong> per la media è (per n non piccolo):</p>
<pre><code>IC = media ± 1.96 * SE</code></pre>
<p>Il famoso 1.96 è <code>norm.ppf(0.975)</code>: il punto della normale che lascia il 2.5% in ogni coda. Interpretazione corretta (e domanda-trappola da colloquio): "se ripetessi l'esperimento tante volte, il 95% degli intervalli così costruiti conterrebbe la media vera". NON "la media vera ha il 95% di probabilità di stare qui dentro" — la media vera è fissa, è l'intervallo che cambia da campione a campione.</p>
`, more: `
<p>Con campioni piccoli (n &lt; ~30) entra in gioco un'incertezza in più: anche la std che usi nel SE è stimata, e può essere sottostimata per caso. La correzione è usare la distribuzione <strong>t di Student</strong> al posto della normale: stessa campana ma con code più grasse, tanto più grasse quanto meno dati hai. <code>stats.t.ppf(0.975, df=n-1)</code> con n=10 vale 2.26 invece di 1.96: intervalli più larghi, onestà sulla propria ignoranza. Al crescere di n, la t converge alla normale e la distinzione svanisce — per questo con n grandi si usa direttamente 1.96 senza rimorsi.</p>
<p>La larghezza di un IC è un budget con tre leve: livello di confidenza (99% è più largo di 95% — più garanzia, meno precisione), variabilità dei dati (s), e n (col solito &radic;n: dimezzare l'intervallo costa il quadruplo dei dati). In un report, un IC largo non è un fallimento: è l'informazione. "Conversione stimata 3.2% [IC 95%: 1.1%–5.3%]" dice chiaramente che servono più dati prima di prendere decisioni — nasconderlo dietro il solo 3.2% è come dichiarare un massimale provato una volta sola.</p>
<p>Occhio a non confondere l'IC della MEDIA con l'intervallo dei DATI: "IC 95%: [26.4, 27.6] minuti" non significa che il 95% dei soci corre tra 26.4 e 27.6 — i singoli tempi si spargono con std piena s, non s/&radic;n. L'IC parla di quanto conosci la media, non di dove stanno le persone.</p>
` },

    {
      type: "exercise", id: "stat-12", kg: 15, title: "Il margine del sondaggio",
      task: `<p>36 soci hanno risposto al questionario sulla durata media dell'allenamento. Costruisci l'IC al 95% (con la normale, n è abbastanza grande):</p>
<ul>
<li><code>media</code>, <code>s</code>: media e std campionaria (ddof=1)</li>
<li><code>se</code>: errore standard</li>
<li><code>ic_basso</code>, <code>ic_alto</code>: gli estremi dell'intervallo media ± 1.96&middot;SE</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(11)
durate = np.round(rng.normal(62, 15, size=36), 1)`,
      starter: `import numpy as np
# durate: array di 36 durate in minuti, gia' caricato

media = ...
s = ...
se = ...
ic_basso = ...
ic_alto = ...

print(f"media {media:.1f} min | IC95 [{ic_basso:.1f}, {ic_alto:.1f}]")`,
      check: `import numpy as np
_m = float(np.mean(durate)); _s = float(np.std(durate, ddof=1)); _se = _s/np.sqrt(36)
assert 'media' in globals() and abs(float(media) - _m) < 1e-6, "media: durate.mean()"
assert 's' in globals() and abs(float(s) - _s) < 1e-6, "s: np.std(durate, ddof=1) — campionaria, quindi ddof=1"
assert 'se' in globals() and abs(float(se) - _se) < 1e-6, "se: s / np.sqrt(36)"
assert 'ic_basso' in globals() and abs(float(ic_basso) - (_m - 1.96*_se)) < 1e-4, "ic_basso: media - 1.96*se"
assert 'ic_alto' in globals() and abs(float(ic_alto) - (_m + 1.96*_se)) < 1e-4, "ic_alto: media + 1.96*se"`,
      hint: `<p>La catena completa: <code>s = np.std(durate, ddof=1)</code> &rarr; <code>se = s/np.sqrt(len(durate))</code> &rarr; <code>media ± 1.96*se</code>. Il SE divide per &radic;n: è l'incertezza della MEDIA, non dei singoli.</p>`,
      solution: `import numpy as np

media = durate.mean()
s = np.std(durate, ddof=1)
se = s / np.sqrt(len(durate))
ic_basso = media - 1.96 * se
ic_alto = media + 1.96 * se

print(f"media {media:.1f} min | IC95 [{ic_basso:.1f}, {ic_alto:.1f}]")`
    },

    {
      type: "exercise", id: "stat-13", kg: 15, title: "Code grasse per campioni magri",
      task: `<p>Solo 8 atleti hanno provato il nuovo protocollo di forza. Con n così piccolo serve la t di Student. Calcola:</p>
<ul>
<li><code>t_critico</code>: il quantile 0.975 della t con df=7</li>
<li><code>z_critico</code>: il quantile 0.975 della normale (per confronto)</li>
<li><code>ic_t_basso</code>, <code>ic_t_alto</code>: IC 95% con la t</li>
<li><code>piu_largo</code>: <code>True</code> se l'intervallo con la t è più largo di quello con la normale</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(23)
guadagni = np.round(rng.normal(6, 4, size=8), 1)`,
      starter: `import numpy as np
from scipy import stats
# guadagni: kg guadagnati sul massimale da 8 atleti, gia' caricato

media = guadagni.mean()
se = np.std(guadagni, ddof=1) / np.sqrt(len(guadagni))

t_critico = ...
z_critico = ...
ic_t_basso = ...
ic_t_alto = ...
piu_largo = ...

print(f"t={t_critico:.3f} vs z={z_critico:.3f} | IC-t [{ic_t_basso:.2f}, {ic_t_alto:.2f}] | piu' largo: {piu_largo}")`,
      check: `import numpy as np
from scipy import stats as _st
_tc = float(_st.t.ppf(0.975, df=7)); _zc = float(_st.norm.ppf(0.975))
_m = float(guadagni.mean()); _se = float(np.std(guadagni, ddof=1)/np.sqrt(8))
assert 't_critico' in globals() and abs(float(t_critico) - _tc) < 1e-6, "t_critico: stats.t.ppf(0.975, df=7), circa 2.365 — df = n-1 = 7"
assert 'z_critico' in globals() and abs(float(z_critico) - _zc) < 1e-6, "z_critico: stats.norm.ppf(0.975), il solito 1.96"
assert 'ic_t_basso' in globals() and abs(float(ic_t_basso) - (_m - _tc*_se)) < 1e-4, "ic_t_basso: media - t_critico*se"
assert 'ic_t_alto' in globals() and abs(float(ic_t_alto) - (_m + _tc*_se)) < 1e-4, "ic_t_alto: media + t_critico*se"
assert 'piu_largo' in globals() and piu_largo == True, "piu_largo: True — 2.365 > 1.96, con 8 dati la t impone piu' prudenza"`,
      hint: `<p><code>stats.t.ppf(0.975, df=7)</code>: i gradi di libertà sono n-1. Con n=8 il moltiplicatore sale da 1.96 a 2.36: l'intervallo si allarga del 20% per onestà.</p>`,
      solution: `import numpy as np
from scipy import stats

media = guadagni.mean()
se = np.std(guadagni, ddof=1) / np.sqrt(len(guadagni))

t_critico = stats.t.ppf(0.975, df=len(guadagni)-1)
z_critico = stats.norm.ppf(0.975)
ic_t_basso = media - t_critico * se
ic_t_alto = media + t_critico * se
piu_largo = t_critico > z_critico

print(f"t={t_critico:.3f} vs z={z_critico:.3f} | IC-t [{ic_t_basso:.2f}, {ic_t_alto:.2f}] | piu' largo: {piu_largo}")`
    },

    { type: "theory", title: "Test d'ipotesi e p-value", html: `
<p>Il test d'ipotesi è un processo a sfavore del caso. Si parte dall'<strong>ipotesi nulla</strong> H0 ("non c'è nessun effetto: il nuovo programma non cambia niente") e ci si chiede: <em>se H0 fosse vera, quanto sarebbe strano osservare dati come i miei?</em></p>
<p>Il <strong>p-value</strong> è esattamente questo: la probabilità, assumendo H0 vera, di ottenere un risultato estremo almeno quanto quello osservato. Piccolo p-value = "sotto H0 questi dati sarebbero rarissimi" = evidenza contro H0.</p>
<pre><code>from scipy import stats
t_stat, p_value = stats.ttest_1samp(dati, 60)   # H0: la media vera e' 60
if p_value < 0.05: ...   # rifiuto H0 al livello 5%</code></pre>
<p>Definizione da saper recitare al colloquio, perché la sbagliano tutti: il p-value <strong>NON</strong> è la probabilità che H0 sia vera, e <strong>NON</strong> è la probabilità di sbagliarsi. È P(dati così estremi | H0), non P(H0 | dati) — confonderle è lo stesso errore delle condizionate invertite che hai visto con Bayes.</p>
`, more: `
<p>La soglia &alpha;=0.05 è una convenzione storica, non una legge di natura: fissa la probabilità di <strong>errore di tipo I</strong> (rifiutare H0 quando è vera — un falso allarme) che sei disposto ad accettare. L'<strong>errore di tipo II</strong> (non rifiutare H0 quando è falsa — un effetto vero che ti sfugge) è l'altro piatto della bilancia, governato dalla potenza del test che vedrai a fine sala. Abbassare &alpha; riduce i falsi allarmi ma aumenta gli effetti mancati: dove mettere l'asticella dipende dal costo dei due errori — in un test clinico su un farmaco pericoloso &alpha; molto basso; in uno screening esplorativo puoi permetterti di più.</p>
<p>Il malcostume da conoscere (te lo chiederanno): il <strong>p-hacking</strong>. Se provi 20 confronti indipendenti tutti sotto H0 vera, in media uno esce "significativo" per puro caso (0.05 &times; 20). Testare metriche finché una non diventa significativa, fermare l'esperimento appena p scende sotto 0.05, escludere "outlier" finché il test passa: sono tutti modi di fabbricare falsi positivi. Le difese: dichiarare PRIMA ipotesi e metrica primaria, correggere per confronti multipli (Bonferroni: usa &alpha;/k per k test), e distinguere sempre analisi confermative da esplorative.</p>
<p>Infine: significativo &ne; importante. Con n enorme, anche una differenza di 0.1 kg diventa "statisticamente significativa" — il p-value misura quanto sei sicuro che l'effetto non sia zero, non quanto l'effetto sia grande. Per questo si riporta sempre anche l'<strong>effect size</strong> (la differenza stimata, con il suo IC): "p=0.001" senza la dimensione dell'effetto è mezza informazione.</p>
` },

    {
      type: "exercise", id: "stat-14", kg: 15, title: "La promessa dei 60 minuti",
      task: `<p>La palestra promette "allenamento medio: 60 minuti". Le 30 sessioni tracciate raccontano un'altra storia? Test t a un campione:</p>
<ul>
<li><code>t_stat</code>, <code>p_value</code>: statistica e p-value di <code>ttest_1samp</code> contro 60</li>
<li><code>rifiuto</code>: <code>True</code> se p &lt; 0.05</li>
<li><code>direzione</code>: <code>"sopra"</code> o <code>"sotto"</code> — da che parte sta la media osservata rispetto a 60</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(31)
sessioni = np.round(rng.normal(53, 12, size=30), 1)`,
      starter: `from scipy import stats
# sessioni: 30 durate in minuti, gia' caricato

t_stat, p_value = ...
rifiuto = ...
direzione = ...

print(f"t={t_stat:.2f} p={p_value:.4f} | rifiuto H0: {rifiuto} | la media vera sembra {direzione} i 60")`,
      check: `from scipy import stats as _st
_t, _p = _st.ttest_1samp(sessioni, 60)
assert 't_stat' in globals() and abs(float(t_stat) - float(_t)) < 1e-6, "t_stat: stats.ttest_1samp(sessioni, 60) — spacchetta t e p"
assert 'p_value' in globals() and abs(float(p_value) - float(_p)) < 1e-6, "p_value: il secondo valore restituito"
assert 'rifiuto' in globals() and rifiuto == bool(_p < 0.05), "rifiuto: p_value < 0.05"
assert 'direzione' in globals() and direzione == ("sopra" if sessioni.mean() > 60 else "sotto"), "direzione: confronta sessioni.mean() con 60"`,
      hint: `<p><code>t_stat, p_value = stats.ttest_1samp(sessioni, 60)</code>. Il segno di t (e il confronto della media con 60) dice la direzione; il p-value dice quanto è implausibile sotto H0.</p>`,
      solution: `from scipy import stats

t_stat, p_value = stats.ttest_1samp(sessioni, 60)
rifiuto = p_value < 0.05
direzione = "sopra" if sessioni.mean() > 60 else "sotto"

print(f"t={t_stat:.2f} p={p_value:.4f} | rifiuto H0: {rifiuto} | la media vera sembra {direzione} i 60")`
    },

    {
      type: "exercise", id: "stat-15", kg: 10, title: "Il processo al caso: quiz",
      task: `<p>Cinque affermazioni sul p-value: segna ognuna <code>True</code> o <code>False</code>. (Il check non perdona: sono le domande esatte dei colloqui.)</p>
<ul>
<li><code>a1</code>: "p=0.03 significa che H0 ha il 3% di probabilità di essere vera"</li>
<li><code>a2</code>: "p=0.03 significa: se H0 fosse vera, dati così estremi uscirebbero il 3% delle volte"</li>
<li><code>a3</code>: "Con &alpha;=0.05 e p=0.08 posso dire che H0 è dimostrata vera"</li>
<li><code>a4</code>: "Rifiutare H0 quando è vera è l'errore di tipo I, e &alpha; ne fissa la probabilità"</li>
<li><code>a5</code>: "Con n gigantesco, un effetto minuscolo e irrilevante può comunque dare p&lt;0.001"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert 'a1' in globals() and a1 == False, "a1 FALSA: il p-value e' P(dati|H0), non P(H0|dati) — la condizionata invertita, come in Bayes"
assert 'a2' in globals() and a2 == True, "a2 VERA: e' esattamente la definizione di p-value"
assert 'a3' in globals() and a3 == False, "a3 FALSA: non rifiutare H0 non la dimostra — magari il test non aveva abbastanza potenza. Assenza di evidenza non e' evidenza di assenza"
assert 'a4' in globals() and a4 == True, "a4 VERA: alpha E' la probabilita' di falso allarme che accetti in partenza"
assert 'a5' in globals() and a5 == True, "a5 VERA: significativo non vuol dire importante — con n enorme anche 0.1 kg diventa 'significativo'. Serve sempre l'effect size"`,
      hint: `<p>Rileggi la lavagna: p-value = P(dati estremi | H0). Le tre trappole classiche: invertire la condizionata (a1), "accettare" H0 (a3), confondere significatività con importanza (a5).</p>`,
      solution: `a1 = False
a2 = True
a3 = False
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    { type: "theory", title: "Il permutation test: il p-value fatto in casa", html: `
<p>C'è un modo di ottenere un p-value <em>senza formule</em>, solo con la forza bruta — e capisce il p-value chi sa costruirlo così. Due gruppi, differenza osservata nelle medie. H0 dice: "le etichette dei gruppi non contano". E allora <strong>mescoliamole davvero</strong>:</p>
<pre><code>diff_oss = a.mean() - b.mean()
tutti = np.concatenate([a, b])
conta = 0
for _ in range(10_000):
    rng.shuffle(tutti)
    diff_perm = tutti[:len(a)].mean() - tutti[len(a):].mean()
    if abs(diff_perm) >= abs(diff_oss):
        conta += 1
p_value = conta / 10_000</code></pre>
<p>Se sotto etichette casuali una differenza come la tua spunta spesso, il tuo risultato non prova niente (p alto). Se non spunta quasi mai, le etichette contavano (p basso). Questo È il p-value: nessuna distribuzione da assumere, nessuna tabella — solo la domanda "quanto è raro il mio risultato in un mondo dove non c'è nessun effetto?".</p>
`, more: `
<p>Il permutation test è <strong>esatto e senza assunzioni distributive</strong>: non richiede normalità né varianze uguali, funziona su medie, mediane, differenze di quantili — qualunque statistica tu sappia calcolare. Il prezzo è computazionale (10&nbsp;000 shuffle) e oggi è un prezzo irrisorio: per campioni non giganteschi è spesso la scelta più difendibile, e nei colloqui proporre "farei anche un permutation test per non dipendere dalla normalità" è un segnale di solidità.</p>
<p>L'unica assunzione che resta è la <strong>scambiabilità</strong> sotto H0: le osservazioni devono essere interscambiabili tra i gruppi. Si rompe con dati appaiati (misure prima/dopo sulla stessa persona: lì si permutano i segni delle differenze, non le etichette) e con dati dipendenti nel tempo (serie storiche: permutare distrugge l'autocorrelazione).</p>
<p>Il fratello gemello è il bootstrap che vedrai tra poco: il permutation test mescola le etichette per simulare il mondo di H0 (serve per TESTARE), il bootstrap ricampiona con reinserimento per simulare nuovi campioni (serve per STIMARE l'incertezza). Confonderli è comune; ricordali così: permutation = processo al caso, bootstrap = clonare l'esperimento.</p>
` },

    {
      type: "exercise", id: "stat-16", kg: 20, title: "Il processo alle etichette",
      task: `<p>Gruppo mattina (12 atleti) vs gruppo sera (14): i kg guadagnati differiscono davvero? Permutation test con 10&nbsp;000 shuffle:</p>
<ul>
<li><code>diff_oss</code>: differenza osservata <code>mattina.mean() - sera.mean()</code></li>
<li><code>p_value</code>: frazione di permutazioni con differenza assoluta &ge; di quella osservata</li>
<li><code>significativo</code>: p &lt; 0.05?</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(55)
mattina = np.round(rng.normal(7.5, 2.5, size=12), 1)
sera = np.round(rng.normal(5.0, 2.5, size=14), 1)`,
      starter: `import numpy as np
# mattina, sera: kg guadagnati, gia' caricati. rng gia' pronto.

diff_oss = ...

tutti = np.concatenate([mattina, sera])
conta = 0
for _ in range(10_000):
    perm = rng.permutation(tutti)
    diff_perm = ...
    if abs(diff_perm) >= abs(diff_oss):
        conta += 1

p_value = ...
significativo = ...

print(f"diff osservata {diff_oss:.2f} kg | p={p_value:.4f} | significativo: {significativo}")`,
      check: `assert 'diff_oss' in globals() and abs(float(diff_oss) - (mattina.mean() - sera.mean())) < 1e-9, "diff_oss: mattina.mean() - sera.mean()"
assert 'p_value' in globals() and 0 <= float(p_value) <= 0.05, "p_value: conta/10000 — con questi dati deve venire sotto 0.05 (la differenza vera c'e')"
assert 'significativo' in globals() and significativo == True, "significativo: True, una differenza cosi' grande quasi mai emerge per caso"`,
      hint: `<p>Dentro il ciclo: <code>diff_perm = perm[:len(mattina)].mean() - perm[len(mattina):].mean()</code>. I primi 12 elementi mescolati "fingono" di essere il gruppo mattina.</p>`,
      solution: `import numpy as np

diff_oss = mattina.mean() - sera.mean()

tutti = np.concatenate([mattina, sera])
conta = 0
for _ in range(10_000):
    perm = rng.permutation(tutti)
    diff_perm = perm[:len(mattina)].mean() - perm[len(mattina):].mean()
    if abs(diff_perm) >= abs(diff_oss):
        conta += 1

p_value = conta / 10_000
significativo = p_value < 0.05

print(f"diff osservata {diff_oss:.2f} kg | p={p_value:.4f} | significativo: {significativo}")`
    },

    { type: "theory", title: "t-test a due campioni: indipendenti o appaiati", html: `
<p>Il confronto tra due gruppi ha due versioni, e sceglierle bene è metà del lavoro:</p>
<pre><code>from scipy import stats
stats.ttest_ind(gruppo_a, gruppo_b)   # campioni INDIPENDENTI (persone diverse)
stats.ttest_rel(prima, dopo)          # campioni APPAIATI (stesse persone, due momenti)</code></pre>
<p><code>ttest_ind</code>: due gruppi di persone diverse (chi ha seguito il programma A vs chi il B). <code>ttest_rel</code>: le <em>stesse</em> persone misurate due volte (massimale prima e dopo 8 settimane) — il test lavora sulle differenze individuali, eliminando la variabilità tra persone.</p>
<p>Usare <code>ttest_ind</code> su dati appaiati butta via potenza (a volte tutta): la differenza di 5 kg per atleta può essere invisibile se tra un atleta e l'altro ballano 40 kg, ma è chiarissima guardando ogni atleta contro sé stesso.</p>
`, more: `
<p>Il <code>ttest_ind</code> di scipy assume di default varianze uguali nei due gruppi; con <code>equal_var=False</code> diventa il <strong>test di Welch</strong>, che non lo assume. La raccomandazione moderna è usare SEMPRE Welch: quando le varianze sono davvero uguali perde pochissimo, quando sono diverse (gruppi di taglia diversa, popolazioni diverse) il test classico può sbagliare parecchio il p-value. Molti selezionatori considerano "userei Welch di default" la risposta giusta.</p>
<p>Assunzioni del t-test e loro vera importanza: (1) indipendenza delle osservazioni — CRUCIALE, se hai misure ripetute della stessa persona trattate come indipendenti il p-value è spazzatura; (2) normalità — grazie al CLT conta poco con n decente, il t-test è robusto; (3) varianze uguali — risolta da Welch. In caso di dubbi seri sulla forma dei dati: permutation test (appena visto) o test di Mann-Whitney, che lavora sui ranghi.</p>
<p>Accanto al p-value, riporta l'effect size: il <strong>d di Cohen</strong> = differenza delle medie / std aggregata. Convenzioni: 0.2 piccolo, 0.5 medio, 0.8 grande. Un p=0.01 con d=0.1 dice "sono molto sicuro di un effetto trascurabile"; un p=0.06 con d=0.9 dice "effetto probabilmente enorme, dati insufficienti" — e delle due, la seconda situazione è spesso la più promettente da approfondire.</p>
` },

    {
      type: "exercise", id: "stat-17", kg: 15, title: "Programma A contro programma B",
      task: `<p>Due gruppi indipendenti, due programmi di forza. Confrontali con il test di Welch:</p>
<ul>
<li><code>t_stat</code>, <code>p_value</code>: da <code>ttest_ind</code> con <code>equal_var=False</code></li>
<li><code>d_cohen</code>: effect size = (media A - media B) / std aggregata (usa la formula nello starter)</li>
<li><code>verdetto</code>: <code>"significativo"</code> se p &lt; 0.05, altrimenti <code>"non significativo"</code></li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(70)
prog_a = np.round(rng.normal(9, 4, size=25), 1)
prog_b = np.round(rng.normal(6, 4, size=25), 1)`,
      starter: `import numpy as np
from scipy import stats
# prog_a, prog_b: kg guadagnati nei due gruppi, gia' caricati

t_stat, p_value = ...

std_agg = np.sqrt((np.var(prog_a, ddof=1) + np.var(prog_b, ddof=1)) / 2)
d_cohen = ...

verdetto = ...

print(f"t={t_stat:.2f} p={p_value:.4f} | d di Cohen={d_cohen:.2f} | {verdetto}")`,
      check: `import numpy as np
from scipy import stats as _st
_t, _p = _st.ttest_ind(prog_a, prog_b, equal_var=False)
_sa = np.sqrt((np.var(prog_a, ddof=1) + np.var(prog_b, ddof=1)) / 2)
_d = (prog_a.mean() - prog_b.mean()) / _sa
assert 't_stat' in globals() and abs(float(t_stat) - float(_t)) < 1e-6, "t_stat: stats.ttest_ind(prog_a, prog_b, equal_var=False) — Welch"
assert 'p_value' in globals() and abs(float(p_value) - float(_p)) < 1e-6, "p_value: il secondo valore della tupla"
assert 'd_cohen' in globals() and abs(float(d_cohen) - _d) < 1e-4, "d_cohen: (prog_a.mean() - prog_b.mean()) / std_agg"
assert 'verdetto' in globals() and verdetto == ("significativo" if _p < 0.05 else "non significativo"), "verdetto: in base a p < 0.05"`,
      hint: `<p><code>stats.ttest_ind(prog_a, prog_b, equal_var=False)</code>: il Welch è il default giusto. Il d di Cohen mette la differenza in unità di std: quanto è GRANDE l'effetto, non solo quanto è certo.</p>`,
      solution: `import numpy as np
from scipy import stats

t_stat, p_value = stats.ttest_ind(prog_a, prog_b, equal_var=False)

std_agg = np.sqrt((np.var(prog_a, ddof=1) + np.var(prog_b, ddof=1)) / 2)
d_cohen = (prog_a.mean() - prog_b.mean()) / std_agg

verdetto = "significativo" if p_value < 0.05 else "non significativo"

print(f"t={t_stat:.2f} p={p_value:.4f} | d di Cohen={d_cohen:.2f} | {verdetto}")`
    },

    {
      type: "exercise", id: "stat-18", kg: 15, title: "Ogni atleta contro sé stesso",
      task: `<p>10 atleti, massimale misurato prima e dopo 8 settimane. Confronta i due test:</p>
<ul>
<li><code>t_ind</code>, <code>p_ind</code>: <code>ttest_ind</code> (sbagliato per questi dati, per vedere cosa succede)</li>
<li><code>t_rel</code>, <code>p_rel</code>: <code>ttest_rel</code> (giusto: dati appaiati)</li>
<li><code>appaiato_vince</code>: <code>True</code> se <code>p_rel &lt; p_ind</code></li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(88)
prima = np.round(rng.normal(110, 30, size=10), 1)
dopo = np.round(prima + rng.normal(5, 2.5, size=10), 1)`,
      starter: `from scipy import stats
# prima, dopo: massimali degli stessi 10 atleti, gia' caricati

t_ind, p_ind = ...
t_rel, p_rel = ...
appaiato_vince = ...

print(f"ind: p={p_ind:.4f} | rel: p={p_rel:.6f} | l'appaiato vede l'effetto: {appaiato_vince}")`,
      check: `from scipy import stats as _st
_ti, _pi = _st.ttest_ind(dopo, prima)
_tr, _pr = _st.ttest_rel(dopo, prima)
assert 't_ind' in globals() and abs(abs(float(t_ind)) - abs(float(_ti))) < 1e-6, "t_ind: stats.ttest_ind(dopo, prima) — o (prima, dopo), il segno cambia ma il p no"
assert 'p_ind' in globals() and abs(float(p_ind) - float(_pi)) < 1e-6, "p_ind: il p del test indipendente"
assert 't_rel' in globals() and abs(abs(float(t_rel)) - abs(float(_tr))) < 1e-6, "t_rel: stats.ttest_rel(dopo, prima)"
assert 'p_rel' in globals() and abs(float(p_rel) - float(_pr)) < 1e-6, "p_rel: il p del test appaiato"
assert 'appaiato_vince' in globals() and appaiato_vince == True and float(_pr) < float(_pi), "appaiato_vince: True — i +5 kg per atleta spariscono nel rumore tra atleti (std 30!) ma sono lampanti dentro ogni atleta"`,
      hint: `<p>Stessi dati, due test: <code>ttest_ind(dopo, prima)</code> vs <code>ttest_rel(dopo, prima)</code>. Tra gli atleti ballano 30 kg, dentro ogni atleta l'effetto è +5±2.5: l'appaiato toglie di mezzo i 30.</p>`,
      solution: `from scipy import stats

t_ind, p_ind = stats.ttest_ind(dopo, prima)
t_rel, p_rel = stats.ttest_rel(dopo, prima)
appaiato_vince = p_rel < p_ind

print(f"ind: p={p_ind:.4f} | rel: p={p_rel:.6f} | l'appaiato vede l'effetto: {appaiato_vince}")`
    },

    { type: "theory", title: "Chi quadro: contare e confrontare", html: `
<p>Quando i dati sono <strong>conteggi per categoria</strong> (non misure continue), il test giusto è il <strong>chi quadro</strong>. Due usi principali:</p>
<p><strong>1. Indipendenza</strong> (tabella di contingenza): "il tipo di abbonamento dipende dalla fascia d'età?"</p>
<pre><code>from scipy import stats
tabella = [[45, 30], [25, 50]]     # righe: eta', colonne: tipo abbonamento
chi2, p, dof, attesi = stats.chi2_contingency(tabella)</code></pre>
<p><strong>2. Bontà di adattamento</strong> (goodness of fit): "questo dado è onesto?"</p>
<pre><code>osservati = [18, 22, 16, 14, 25, 25]           # 120 lanci
chi2, p = stats.chisquare(osservati)            # H0: tutte le facce eque</code></pre>
<p>L'idea in entrambi: confrontare i conteggi <em>osservati</em> con quelli <em>attesi</em> sotto H0, sommando gli scarti quadratici normalizzati. Scarti grandi &rarr; chi2 grande &rarr; p piccolo.</p>
`, more: `
<p>La tabella <code>attesi</code> restituita da <code>chi2_contingency</code> è metà del valore didattico del test: sono i conteggi che vedresti se le variabili fossero perfettamente indipendenti, calcolati come (totale riga &times; totale colonna) / totale. Confrontare a occhio osservati e attesi ti dice DOVE sta la dipendenza (quale cella devia di più), cosa che il p-value da solo non rivela — un chi2 significativo su una tabella 4&times;5 non dice quale combinazione è anomala.</p>
<p>Condizioni di validità da citare: il test è un'approssimazione asintotica, affidabile quando i conteggi attesi sono almeno ~5 per cella. Con celle più magre (eventi rari, tabelle molto sparse) si usa il <strong>test esatto di Fisher</strong> (<code>stats.fisher_exact</code>, per tabelle 2&times;2), che calcola la probabilità esatta senza approssimazioni. E attenzione: il chi quadro vuole i CONTEGGI GREZZI, mai le percentuali — passargli [45%, 55%] invece di [450, 550] cambia completamente il risultato, perché la forza dell'evidenza dipende da n.</p>
<p>Per il test A/B su conversioni (converti/non converti nei gruppi A/B) il chi quadro su tabella 2&times;2 e lo z-test sulle proporzioni che vedrai tra poco sono matematicamente equivalenti (chi2 = z²): due strade, stesso p-value. Sapere che sono lo stesso test è un punto extra al colloquio.</p>
` },

    {
      type: "exercise", id: "stat-19", kg: 15, title: "Età e abbonamento: legati?",
      task: `<p>Tabella: fascia d'età (under/over 35) &times; tipo di abbonamento (mensile/annuale). Test di indipendenza:</p>
<ul>
<li><code>chi2</code>, <code>p_value</code>, <code>dof</code>, <code>attesi</code>: i 4 output di <code>chi2_contingency</code></li>
<li><code>dipendenti</code>: <code>True</code> se p &lt; 0.05 (età e abbonamento associati)</li>
<li><code>cella_max_scarto</code>: lo scarto assoluto massimo tra osservati e attesi (usa np)</li>
</ul>`,
      setup: `import numpy as np
tabella = np.array([[62, 38], [31, 69]])`,
      starter: `import numpy as np
from scipy import stats
# tabella: righe = under35/over35, colonne = mensile/annuale

chi2, p_value, dof, attesi = ...
dipendenti = ...
cella_max_scarto = ...

print(f"chi2={chi2:.2f} p={p_value:.5f} dof={dof} | dipendenti: {dipendenti} | scarto max {cella_max_scarto:.1f}")`,
      check: `import numpy as np
from scipy import stats as _st
_c, _p, _d, _e = _st.chi2_contingency(tabella)
assert 'chi2' in globals() and abs(float(chi2) - float(_c)) < 1e-6, "chi2: stats.chi2_contingency(tabella) restituisce 4 valori"
assert 'p_value' in globals() and abs(float(p_value) - float(_p)) < 1e-9, "p_value: il secondo output"
assert 'dof' in globals() and int(dof) == 1, "dof: per una tabella 2x2 i gradi di liberta' sono (2-1)*(2-1) = 1"
assert 'dipendenti' in globals() and dipendenti == True, "dipendenti: True — p molto sotto 0.05, gli under 35 scelgono il mensile molto piu' spesso"
assert 'cella_max_scarto' in globals() and abs(float(cella_max_scarto) - float(np.abs(tabella - _e).max())) < 1e-6, "cella_max_scarto: np.abs(tabella - attesi).max()"`,
      hint: `<p>Quattro output in un colpo: <code>chi2, p_value, dof, attesi = stats.chi2_contingency(tabella)</code>. Gli attesi sono la tabella "se fossero indipendenti": lo scarto da essi è dove vive l'associazione.</p>`,
      solution: `import numpy as np
from scipy import stats

chi2, p_value, dof, attesi = stats.chi2_contingency(tabella)
dipendenti = p_value < 0.05
cella_max_scarto = np.abs(tabella - attesi).max()

print(f"chi2={chi2:.2f} p={p_value:.5f} dof={dof} | dipendenti: {dipendenti} | scarto max {cella_max_scarto:.1f}")`
    },

    {
      type: "exercise", id: "stat-20", kg: 15, title: "Il dado della sfida",
      task: `<p>Il dado delle sfide del venerdì è stato lanciato 120 volte. Un dado onesto darebbe 20 per faccia. Goodness of fit:</p>
<ul>
<li><code>chi2</code>, <code>p_value</code>: da <code>stats.chisquare(osservati)</code> (attesi uniformi di default)</li>
<li><code>onesto</code>: <code>True</code> se NON puoi rifiutare H0 al 5% (p &ge; 0.05)</li>
<li><code>faccia_sospetta</code>: il numero di faccia (1-6) con lo scarto assoluto maggiore da 20</li>
</ul>`,
      setup: `import numpy as np
osservati = np.array([18, 21, 15, 19, 24, 23])`,
      starter: `import numpy as np
from scipy import stats
# osservati: conteggi delle facce 1..6 su 120 lanci

chi2, p_value = ...
onesto = ...
faccia_sospetta = ...

print(f"chi2={chi2:.2f} p={p_value:.3f} | onesto: {onesto} | faccia piu' deviante: {faccia_sospetta}")`,
      check: `import numpy as np
from scipy import stats as _st
_c, _p = _st.chisquare(osservati)
assert 'chi2' in globals() and abs(float(chi2) - float(_c)) < 1e-6, "chi2: stats.chisquare(osservati) — con attesi uniformi basta un argomento"
assert 'p_value' in globals() and abs(float(p_value) - float(_p)) < 1e-9, "p_value: il secondo output"
assert 'onesto' in globals() and onesto == True, "onesto: True — p alto, scarti del tutto compatibili con un dado equo su 120 lanci"
assert 'faccia_sospetta' in globals() and int(faccia_sospetta) == int(np.argmax(np.abs(osservati - 20)) + 1), "faccia_sospetta: np.argmax(np.abs(osservati - 20)) + 1 — occhio al +1, gli indici partono da 0 ma le facce da 1"`,
      hint: `<p>H0 qui è "il dado è onesto" e NON rifiutarla (p alto) significa che i dati sono compatibili con l'onestà — non che è dimostrata. <code>np.argmax</code> dà l'indice: faccia = indice + 1.</p>`,
      solution: `import numpy as np
from scipy import stats

chi2, p_value = stats.chisquare(osservati)
onesto = p_value >= 0.05
faccia_sospetta = int(np.argmax(np.abs(osservati - 20)) + 1)

print(f"chi2={chi2:.2f} p={p_value:.3f} | onesto: {onesto} | faccia piu' deviante: {faccia_sospetta}")`
    },

    { type: "theory", title: "Bootstrap: clonare l'esperimento", html: `
<p>Per la media esiste la formula del SE. Ma per la mediana? Il 90° percentile? Il rapporto tra due medie? Formule complicate o inesistenti. Il <strong>bootstrap</strong> aggira tutto: tratta il tuo campione come se fosse la popolazione, e ri-campiona da esso <em>con reinserimento</em>:</p>
<pre><code>stime = []
for _ in range(5000):
    ricampione = rng.choice(dati, size=len(dati), replace=True)
    stime.append(np.median(ricampione))
ic = np.percentile(stime, [2.5, 97.5])   # IC 95% percentile</code></pre>
<p>Ogni ricampione è una versione alternativa plausibile del tuo esperimento: alcuni dati ripetuti, altri assenti. La dispersione delle 5000 stime È l'incertezza della tua statistica, e i percentili 2.5-97.5 dell'insieme danno l'intervallo di confidenza — <strong>per qualunque statistica tu sappia calcolare</strong>.</p>
`, more: `
<p>Il <code>replace=True</code> non è un dettaglio: ricampionare SENZA reinserimento darebbe sempre lo stesso identico campione riordinato (stessa mediana, incertezza zero, assurdo). Col reinserimento, in ogni ricampione circa il 63% dei dati originali compare almeno una volta e il resto no (1 - 1/e: lo stesso numero magico dell'out-of-bag delle Random Forest — non è un caso, il bagging È bootstrap).</p>
<p>Cosa il bootstrap NON aggiusta: un campione piccolo o distorto resta piccolo o distorto — il bootstrap stima l'incertezza ATTORNO alla tua stima, non ne corregge i difetti. Se i tuoi 20 soci intervistati sono tutti mattinieri, nessun ricampionamento farà comparire i serali. E per statistiche estreme (il massimo, il 99° percentile con pochi dati) il bootstrap fallisce strutturalmente: il ricampione non può mai superare il massimo osservato.</p>
<p>Il metodo dei percentili usato qui è il più semplice; esistono varianti più raffinate (BCa, bias-corrected and accelerated) che correggono asimmetrie della distribuzione bootstrap — <code>scipy.stats.bootstrap</code> le implementa. Nei colloqui basta il percentile method + la consapevolezza dei limiti. E ricorda la distinzione dalla lavagna del permutation test: bootstrap = quanto è incerta la mia stima; permutation = quanto è strano il mio risultato sotto H0.</p>
` },

    {
      type: "exercise", id: "stat-21", kg: 20, title: "L'incertezza della mediana",
      task: `<p>I tempi di risposta del gestionale (ms) hanno outlier — si riporta la mediana. Ma quanto è incerta? Bootstrap con 5000 ricampioni:</p>
<ul>
<li><code>mediana_oss</code>: la mediana osservata</li>
<li><code>stime</code>: array delle 5000 mediane bootstrap</li>
<li><code>ic_basso</code>, <code>ic_alto</code>: percentili 2.5 e 97.5 delle stime</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(99)
tempi = np.round(np.concatenate([rng.normal(120, 15, size=40), rng.exponential(400, size=5) + 200]), 0)`,
      starter: `import numpy as np
# tempi: 45 tempi di risposta in ms (con outlier), gia' caricati. rng pronto.

mediana_oss = ...

stime = []
for _ in range(5000):
    ricampione = ...
    stime.append(...)
stime = np.array(stime)

ic_basso, ic_alto = ...

print(f"mediana {mediana_oss:.0f} ms | IC95 bootstrap [{ic_basso:.0f}, {ic_alto:.0f}]")`,
      check: `import numpy as np
assert 'mediana_oss' in globals() and abs(float(mediana_oss) - float(np.median(tempi))) < 1e-9, "mediana_oss: np.median(tempi)"
assert 'stime' in globals() and len(stime) == 5000, "stime: 5000 mediane, una per ricampione"
assert 'ic_basso' in globals() and 'ic_alto' in globals() and float(ic_basso) < float(mediana_oss) < float(ic_alto), "L'IC deve contenere la mediana osservata"
assert float(ic_alto) - float(ic_basso) < 30, "L'IC deve essere ragionevolmente stretto (< 30 ms): controlla replace=True e size=len(tempi)"
assert abs(float(ic_basso) - float(np.percentile(stime, 2.5))) < 1e-6 and abs(float(ic_alto) - float(np.percentile(stime, 97.5))) < 1e-6, "ic: np.percentile(stime, [2.5, 97.5])"`,
      hint: `<p>Nel ciclo: <code>rng.choice(tempi, size=len(tempi), replace=True)</code> poi <code>np.median</code>. Alla fine: <code>np.percentile(stime, [2.5, 97.5])</code> spacchettato in due variabili.</p>`,
      solution: `import numpy as np

mediana_oss = np.median(tempi)

stime = []
for _ in range(5000):
    ricampione = rng.choice(tempi, size=len(tempi), replace=True)
    stime.append(np.median(ricampione))
stime = np.array(stime)

ic_basso, ic_alto = np.percentile(stime, [2.5, 97.5])

print(f"mediana {mediana_oss:.0f} ms | IC95 bootstrap [{ic_basso:.0f}, {ic_alto:.0f}]")`
    },

    {
      type: "exercise", id: "stat-22", kg: 20, title: "Bootstrap della differenza",
      task: `<p>Il bootstrap funziona per QUALSIASI statistica — anche per la differenza tra le mediane di due gruppi (per cui non esiste formula comoda). Gruppo integratori vs controllo:</p>
<ul>
<li><code>diff_oss</code>: differenza osservata tra le mediane (integratori - controllo)</li>
<li><code>diffs</code>: 5000 differenze bootstrap (ricampiona ENTRAMBI i gruppi a ogni giro)</li>
<li><code>ic_basso</code>, <code>ic_alto</code>: IC 95% della differenza</li>
<li><code>compatibile_con_zero</code>: <code>True</code> se lo zero cade dentro l'IC (= nessuna evidenza forte di differenza)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(123)
integratori = np.round(rng.normal(7.0, 3.0, size=20), 1)
controllo = np.round(rng.normal(5.8, 3.0, size=20), 1)`,
      starter: `import numpy as np
# integratori, controllo: kg guadagnati, gia' caricati. rng pronto.

diff_oss = ...

diffs = []
for _ in range(5000):
    ri = rng.choice(integratori, size=len(integratori), replace=True)
    rc = ...
    diffs.append(...)
diffs = np.array(diffs)

ic_basso, ic_alto = ...
compatibile_con_zero = ...

print(f"diff mediane {diff_oss:.1f} kg | IC95 [{ic_basso:.1f}, {ic_alto:.1f}] | zero dentro: {compatibile_con_zero}")`,
      check: `import numpy as np
assert 'diff_oss' in globals() and abs(float(diff_oss) - (float(np.median(integratori)) - float(np.median(controllo)))) < 1e-9, "diff_oss: np.median(integratori) - np.median(controllo)"
assert 'diffs' in globals() and len(diffs) == 5000, "diffs: 5000 differenze bootstrap"
assert 'ic_basso' in globals() and 'ic_alto' in globals() and float(ic_basso) < float(ic_alto), "ic: np.percentile(diffs, [2.5, 97.5])"
assert 'compatibile_con_zero' in globals() and compatibile_con_zero == bool(float(ic_basso) <= 0 <= float(ic_alto)), "compatibile_con_zero: ic_basso <= 0 <= ic_alto"`,
      hint: `<p>A ogni giro ricampioni TUTTI E DUE i gruppi (ognuno da sé stesso) e salvi <code>np.median(ri) - np.median(rc)</code>. Se l'IC della differenza contiene lo zero, i dati non escludono "nessun effetto".</p>`,
      solution: `import numpy as np

diff_oss = np.median(integratori) - np.median(controllo)

diffs = []
for _ in range(5000):
    ri = rng.choice(integratori, size=len(integratori), replace=True)
    rc = rng.choice(controllo, size=len(controllo), replace=True)
    diffs.append(np.median(ri) - np.median(rc))
diffs = np.array(diffs)

ic_basso, ic_alto = np.percentile(diffs, [2.5, 97.5])
compatibile_con_zero = ic_basso <= 0 <= ic_alto

print(f"diff mediane {diff_oss:.1f} kg | IC95 [{ic_basso:.1f}, {ic_alto:.1f}] | zero dentro: {compatibile_con_zero}")`
    },

    { type: "theory", title: "A/B testing: l'esperimento di produzione", html: `
<p>Il test A/B è il test d'ipotesi applicato al prodotto: utenti divisi <strong>a caso</strong> tra versione A (controllo) e B (variante), una metrica decisa <em>prima</em>, e alla fine un test sulle proporzioni:</p>
<pre><code># conversioni: A 480/6000, B 549/6100
p_pool = (480 + 549) / (6000 + 6100)
se = np.sqrt(p_pool * (1 - p_pool) * (1/6000 + 1/6100))
z = (549/6100 - 480/6000) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z)))     # test a due code</code></pre>
<p>Il denominatore usa la proporzione <em>aggregata</em> (pooled) perché sotto H0 i due gruppi hanno la stessa conversione vera. La randomizzazione è ciò che rende il risultato CAUSALE: qualunque differenza sistematica tra i gruppi può venire solo dalla variante — è l'unico contesto in cui "correlazione = causazione" è legittimo.</p>
`, more: `
<p>Gli errori operativi che uccidono i test A/B reali, in ordine di frequenza: (1) il <strong>peeking</strong> — guardare il p-value ogni giorno e fermarsi appena scende sotto 0.05 gonfia enormemente i falsi positivi (un test fermato "al momento giusto" su H0 vera diventa significativo fino al 30% delle volte, non il 5%): la durata si fissa PRIMA, col calcolo di potenza; (2) randomizzazione rotta — se l'assegnazione dipende da qualcosa (device, orario, paese), il confronto è inquinato: si verifica con un A/A test o controllando che le caratteristiche pre-esperimento siano bilanciate; (3) metriche multiple — testare 10 metriche e riportare quella significativa è p-hacking in cravatta: una metrica primaria dichiarata, le altre esplorative.</p>
<p>L'<strong>uplift relativo</strong> = (pB - pA)/pA è la lingua del business ("+12% di conversioni"), ma il suo IC va calcolato con cura perché è un rapporto — per piccole differenze l'approssimazione col delta method o direttamente il bootstrap sui due gruppi. E un uplift significativo dello 0.01% può non valere il costo di mantenere la variante: la decisione finale confronta l'effect size con il valore economico, non solo col p-value.</p>
<p>Da citare al colloquio se chiedono "come decideresti la durata": dal calcolo di potenza (prossima lavagna) dati baseline, MDE (minimo effetto che interessa rilevare) e traffico giornaliero — non "finché non diventa significativo".</p>
` },

    {
      type: "exercise", id: "stat-23", kg: 20, title: "Il bottone verde",
      task: `<p>Landing page: bottone blu (A) vs verde (B). A: 480 conversioni su 6000. B: 549 su 6100. Costruisci lo z-test sulle proporzioni a mano:</p>
<ul>
<li><code>p_a</code>, <code>p_b</code>: le due conversioni osservate</li>
<li><code>p_pool</code>: proporzione aggregata</li>
<li><code>z</code>: la statistica z (con SE pooled)</li>
<li><code>p_value</code>: a due code, con <code>norm.cdf</code></li>
<li><code>significativo</code>: p &lt; 0.05?</li>
</ul>`,
      starter: `import numpy as np
from scipy import stats

conv_a, n_a = 480, 6000
conv_b, n_b = 549, 6100

p_a = ...
p_b = ...
p_pool = ...
se = ...
z = ...
p_value = ...
significativo = ...

print(f"A {p_a:.3f} vs B {p_b:.3f} | z={z:.2f} p={p_value:.4f} | significativo: {significativo}")`,
      check: `import numpy as np
from scipy import stats as _st
_pa, _pb = 480/6000, 549/6100
_pp = (480+549)/(6000+6100)
_se = np.sqrt(_pp*(1-_pp)*(1/6000+1/6100))
_z = (_pb-_pa)/_se
_p = 2*(1-_st.norm.cdf(abs(_z)))
assert 'p_a' in globals() and abs(float(p_a) - _pa) < 1e-9, "p_a: 480/6000 = 0.08"
assert 'p_b' in globals() and abs(float(p_b) - _pb) < 1e-9, "p_b: 549/6100 = 0.09"
assert 'p_pool' in globals() and abs(float(p_pool) - _pp) < 1e-9, "p_pool: (conv_a+conv_b)/(n_a+n_b) — la conversione se i gruppi fossero uno"
assert 'z' in globals() and abs(abs(float(z)) - abs(_z)) < 1e-6, "z: (p_b - p_a) / se, con se = sqrt(p_pool*(1-p_pool)*(1/n_a + 1/n_b))"
assert 'p_value' in globals() and abs(float(p_value) - _p) < 1e-6, "p_value: 2*(1 - norm.cdf(abs(z))) — due code: l'effetto poteva andare in entrambe le direzioni"
assert 'significativo' in globals() and significativo == bool(_p < 0.05), "significativo: confronta con 0.05"`,
      hint: `<p>Il SE pooled: <code>np.sqrt(p_pool*(1-p_pool)*(1/n_a + 1/n_b))</code>. Il &times;2 nel p-value è il test a due code: conta come estremi anche i risultati nell'altra direzione.</p>`,
      solution: `import numpy as np
from scipy import stats

conv_a, n_a = 480, 6000
conv_b, n_b = 549, 6100

p_a = conv_a / n_a
p_b = conv_b / n_b
p_pool = (conv_a + conv_b) / (n_a + n_b)
se = np.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
z = (p_b - p_a) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z)))
significativo = p_value < 0.05

print(f"A {p_a:.3f} vs B {p_b:.3f} | z={z:.2f} p={p_value:.4f} | significativo: {significativo}")`
    },

    {
      type: "exercise", id: "stat-24", kg: 15, title: "Tradurre per il business",
      task: `<p>Con i numeri dell'esercizio precedente (A: 480/6000, B: 549/6100), prepara il report per il management:</p>
<ul>
<li><code>uplift_assoluto</code>: p_b - p_a (in punti di conversione)</li>
<li><code>uplift_relativo</code>: (p_b - p_a) / p_a (la percentuale "di miglioramento")</li>
<li><code>conversioni_extra_su_100k</code>: quante conversioni in più porterebbe B su 100&nbsp;000 visitatori</li>
<li><code>chi2_equivale</code>: verifica l'equivalenza chi2 = z²: calcola il chi quadro sulla tabella 2&times;2 (senza correzione: <code>correction=False</code>) e metti <code>True</code> se |chi2 - z²| &lt; 0.01 (z dell'esercizio prima, circa 1.97)</li>
</ul>`,
      starter: `import numpy as np
from scipy import stats

p_a = 480 / 6000
p_b = 549 / 6100

# z dell'esercizio precedente (ricalcolato, pooled)
p_pool = (480 + 549) / (6000 + 6100)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1/6000 + 1/6100))
z = (p_b - p_a) / se_pool

uplift_assoluto = ...
uplift_relativo = ...
conversioni_extra_su_100k = ...

tabella = np.array([[480, 6000-480], [549, 6100-549]])
chi2, p, dof, att = stats.chi2_contingency(tabella, correction=False)
chi2_equivale = ...

print(f"uplift {uplift_assoluto*100:.2f} punti ({uplift_relativo*100:.1f}%) | +{conversioni_extra_su_100k:.0f} conv/100k | chi2=z^2: {chi2_equivale}")`,
      check: `import numpy as np
_ua = 549/6100 - 480/6000
assert 'uplift_assoluto' in globals() and abs(float(uplift_assoluto) - _ua) < 1e-9, "uplift_assoluto: p_b - p_a, 0.01 = un punto percentuale"
assert 'uplift_relativo' in globals() and abs(float(uplift_relativo) - _ua/(480/6000)) < 1e-9, "uplift_relativo: uplift_assoluto / p_a, circa +12.5%"
assert 'conversioni_extra_su_100k' in globals() and abs(float(conversioni_extra_su_100k) - _ua*100000) < 1, "conversioni_extra_su_100k: uplift_assoluto * 100_000, circa 1000"
assert 'chi2_equivale' in globals() and chi2_equivale == True, "chi2_equivale: True — chi2 (circa 3.89) e' z al quadrato (1.97^2): sono lo stesso test"`,
      hint: `<p>Stesso effetto, tre lingue: punti assoluti (statistica), percentuale relativa (business), conversioni contate (soldi). L'equivalenza: <code>abs(chi2 - z**2) &lt; 0.01</code>.</p>`,
      solution: `import numpy as np
from scipy import stats

p_a = 480 / 6000
p_b = 549 / 6100

p_pool = (480 + 549) / (6000 + 6100)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1/6000 + 1/6100))
z = (p_b - p_a) / se_pool

uplift_assoluto = p_b - p_a
uplift_relativo = uplift_assoluto / p_a
conversioni_extra_su_100k = uplift_assoluto * 100_000

tabella = np.array([[480, 6000-480], [549, 6100-549]])
chi2, p, dof, att = stats.chi2_contingency(tabella, correction=False)
chi2_equivale = abs(chi2 - z**2) < 0.01

print(f"uplift {uplift_assoluto*100:.2f} punti ({uplift_relativo*100:.1f}%) | +{conversioni_extra_su_100k:.0f} conv/100k | chi2=z^2: {chi2_equivale}")`
    },

    { type: "theory", title: "Potenza statistica: il test riesce a vedere?", html: `
<p>La <strong>potenza</strong> è la probabilità che il test rilevi un effetto <em>che esiste davvero</em>: P(p &lt; &alpha; | effetto vero). Il suo complemento è l'errore di tipo II: l'effetto c'è ma il test non lo vede.</p>
<p>Un esperimento sottodimensionato è una macchina per conclusioni sbagliate: con potenza 20%, quattro volte su cinque un effetto reale produce "non significativo" — e la tentazione è concludere "non funziona" quando la verità è "non avevo abbastanza dati per vederlo".</p>
<p>La potenza si può <em>misurare simulando</em>: genera tanti esperimenti finti con l'effetto che ti interessa, conta quante volte il test lo becca:</p>
<pre><code>successi = 0
for _ in range(1000):
    a = rng.normal(0, 10, size=n)
    b = rng.normal(2, 10, size=n)       # effetto vero: +2
    if stats.ttest_ind(a, b).pvalue < 0.05:
        successi += 1
potenza = successi / 1000</code></pre>
<p>Convenzione di progetto: potenza 80% (e 90% per decisioni pesanti). Se la simulazione dice 35%, l'esperimento non va lanciato: va ingrandito.</p>
`, more: `
<p>Le quattro manopole della potenza sono legate in un'equazione a tre gradi di libertà: fissa tre tra {&alpha;, potenza, effect size, n} e la quarta è determinata. In pratica: &alpha; è convenzionale (0.05), la potenza obiettivo pure (0.80), l'effect size minimo che ti interessa (MDE) lo decide il business — e ne esce n, il sample size. È così che si risponde a "quanto deve durare il test A/B?": n richiesto diviso traffico giornaliero. Farlo a rovescio ("abbiamo 2 settimane, che effetto possiamo vedere?") è altrettanto legittimo e a volte più onesto.</p>
<p>La relazione con &radic;n morde anche qui: dimezzare l'MDE da rilevare quadruplica l'n necessario. Rilevare un +1% di conversione richiede circa 4 volte gli utenti che servono per un +2% — per questo i colossi del web possono testare micro-migliorie e una startup no: a parità di potenza, il traffico compra risoluzione.</p>
<p>Trappola da conoscere: la <strong>potenza post-hoc</strong> calcolata DOPO l'esperimento usando l'effetto osservato è matematicamente ridondante (è una funzione del p-value) e non aggiunge informazione: "il test non era significativo ma la potenza osservata era bassa" è un ragionamento circolare. La potenza si calcola PRIMA, sull'effetto minimo che interessa — dopo, l'incertezza la racconta l'intervallo di confidenza.</p>
` },

    {
      type: "exercise", id: "stat-25", kg: 20, title: "Il microscopio tarato male",
      task: `<p>L'integratore dà davvero +2 kg (std 10). Il test con 20 atleti per gruppo lo vede? E con 200? Simula 500 esperimenti per ciascun n:</p>
<ul>
<li><code>potenza_20</code>: frazione di esperimenti (n=20 per gruppo) con p &lt; 0.05</li>
<li><code>potenza_200</code>: idem con n=200</li>
<li><code>adeguato_20</code>, <code>adeguato_200</code>: <code>True</code> se la rispettiva potenza raggiunge lo standard 0.80</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(500)`,
      starter: `import numpy as np
from scipy import stats
# rng gia' pronto. Effetto vero: +2 kg, std 10.

def potenza_simulata(n, n_sim=500):
    successi = 0
    for _ in range(n_sim):
        a = rng.normal(0, 10, size=n)
        b = rng.normal(2, 10, size=n)
        if ...:
            successi += 1
    return successi / n_sim

potenza_20 = ...
potenza_200 = ...
adeguato_20 = ...
adeguato_200 = ...

print(f"n=20: potenza {potenza_20:.2f} (ok: {adeguato_20}) | n=200: {potenza_200:.2f} (ok: {adeguato_200})")`,
      check: `assert 'potenza_20' in globals() and 0.02 < float(potenza_20) < 0.25, "potenza_20: con 20 atleti per gruppo la potenza e' bassissima (circa 0.10) — l'effetto c'e' ma il test e' cieco"
assert 'potenza_200' in globals() and 0.4 < float(potenza_200) < 0.75, "potenza_200: con 200 sale parecchio (circa 0.5) — ma non basta ancora per lo standard 0.80!"
assert 'adeguato_20' in globals() and adeguato_20 == False, "adeguato_20: False"
assert 'adeguato_200' in globals() and adeguato_200 == False, "adeguato_200: False — per potenza 0.80 con effetto 2 e std 10 servono circa 400 per gruppo. Rilevare effetti piccoli costa caro"
assert 'potenza_simulata' in globals() and callable(potenza_simulata), "Definisci la funzione potenza_simulata"`,
      hint: `<p>La condizione nel ciclo: <code>stats.ttest_ind(a, b).pvalue &lt; 0.05</code>. La morale è nel check: nemmeno 200 per gruppo bastano per un effetto di 0.2 std — il sample size si calcola, non si spera.</p>`,
      solution: `import numpy as np
from scipy import stats

def potenza_simulata(n, n_sim=500):
    successi = 0
    for _ in range(n_sim):
        a = rng.normal(0, 10, size=n)
        b = rng.normal(2, 10, size=n)
        if stats.ttest_ind(a, b).pvalue < 0.05:
            successi += 1
    return successi / n_sim

potenza_20 = potenza_simulata(20)
potenza_200 = potenza_simulata(200)
adeguato_20 = potenza_20 >= 0.80
adeguato_200 = potenza_200 >= 0.80

print(f"n=20: potenza {potenza_20:.2f} (ok: {adeguato_20}) | n=200: {potenza_200:.2f} (ok: {adeguato_200})")`
    },

    { type: "theory", title: "Correlazione non è causalità", html: `
<p>Il coefficiente di <strong>Pearson</strong> r misura la relazione LINEARE tra due variabili: da -1 (perfettamente opposta) a +1 (perfettamente allineata), 0 = nessuna relazione lineare.</p>
<pre><code>from scipy import stats
r, p = stats.pearsonr(x, y)    # r: forza e segno; p: H0 "r vero = 0"</code></pre>
<p>Ma una r alta non dice MAI da sola che x causa y. Le spiegazioni alternative da elencare a colpo sicuro:</p>
<ul>
<li><strong>Confondente</strong>: z causa entrambe (gelati e annegamenti correlano: li causa l'estate);</li>
<li><strong>Causalità inversa</strong>: è y a causare x;</li>
<li><strong>Selezione</strong>: il modo in cui hai raccolto i dati crea la relazione;</li>
<li><strong>Caso</strong>: con abbastanza variabili, qualche coppia correla per forza.</li>
</ul>
<p>L'unico strumento che autorizza conclusioni causali è l'esperimento randomizzato (l'A/B test). Tutto il resto è associazione — utile per predire, traditrice per intervenire.</p>
`, more: `
<p>La distinzione predire/intervenire è il cuore della questione e vale un'assunzione da senior: per PREVEDERE va benissimo la correlazione (i gelati venduti predicono davvero gli annegamenti del giorno — nessuno nega l'associazione); per INTERVENIRE serve la causalità (vietare i gelati non salverà nessuno). I modelli ML vivono di correlazioni: funzionano per predire e falliscono silenziosamente quando qualcuno usa le loro feature importance come leve d'azione.</p>
<p><strong>Spearman</strong> è il Pearson calcolato sui ranghi: cattura qualunque relazione MONOTONA, non solo lineare. Se y cresce con x ma in modo curvo (rendimenti decrescenti: ore di allenamento e forza), Pearson sottostima la relazione, Spearman no. È anche robusto agli outlier (un punto estremo può fabbricare o distruggere un Pearson da solo). Se Pearson e Spearman divergono molto: o c'è non linearità, o ci sono outlier — in entrambi i casi, GUARDA il grafico.</p>
<p>Il monito visivo definitivo è il <strong>quartetto di Anscombe</strong>: quattro dataset con identiche medie, varianze e r=0.816, ma dai grafici completamente diversi (una retta pulita, una curva, un outlier che regge tutto, una linea verticale). Statistiche riassuntive identiche, storie opposte: mai fidarsi di una correlazione non guardata. E ricorda che r vicino a 0 esclude solo relazioni lineari: una parabola perfetta ha r&asymp;0.</p>
` },

    {
      type: "exercise", id: "stat-26", kg: 10, title: "Gelati e annegamenti",
      task: `<p>Dati mensili del lido: gelati venduti e interventi dei bagnini. Correlano fortissimo — ma la causa è la temperatura. Calcola:</p>
<ul>
<li><code>r_gelati_bagnini</code>: correlazione di Pearson tra gelati e interventi</li>
<li><code>r_temp_gelati</code>, <code>r_temp_bagnini</code>: correlazione della temperatura con ciascuna</li>
<li><code>c1</code>: <code>True</code>/<code>False</code> — "r alto tra gelati e interventi prova che vietare i gelati ridurrebbe gli interventi"</li>
<li><code>c2</code>: <code>True</code>/<code>False</code> — "i gelati venduti restano comunque un buon PREDITTORE degli interventi"</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(200)
temperatura = np.array([12, 14, 18, 22, 26, 30, 33, 32, 27, 21, 16, 13], dtype=float)
gelati = np.round(temperatura * 40 + rng.normal(0, 40, size=12), 0)
bagnini = np.round(temperatura * 1.5 + rng.normal(0, 4, size=12), 0)`,
      starter: `from scipy import stats
# temperatura, gelati, bagnini: 12 mesi di dati, gia' caricati

r_gelati_bagnini, _ = ...
r_temp_gelati, _ = ...
r_temp_bagnini, _ = ...

c1 = ...
c2 = ...

print(f"gelati-bagnini r={r_gelati_bagnini:.2f} | temp-gelati r={r_temp_gelati:.2f} | temp-bagnini r={r_temp_bagnini:.2f}")`,
      check: `from scipy import stats as _st
_r1 = _st.pearsonr(gelati, bagnini)[0]
assert 'r_gelati_bagnini' in globals() and abs(float(r_gelati_bagnini) - _r1) < 1e-6, "r_gelati_bagnini: stats.pearsonr(gelati, bagnini) — il primo dei due valori"
assert 'r_temp_gelati' in globals() and float(r_temp_gelati) > 0.9, "r_temp_gelati: la temperatura correla fortissimo coi gelati (e' la causa comune)"
assert 'r_temp_bagnini' in globals() and float(r_temp_bagnini) > 0.9, "r_temp_bagnini: idem con gli interventi"
assert 'c1' in globals() and c1 == False, "c1 FALSA: il confondente (temperatura) causa entrambi. Vietare i gelati non tocca la causa"
assert 'c2' in globals() and c2 == True, "c2 VERA: per PREDIRE la correlazione basta — e' per INTERVENIRE che serve la causalita'"`,
      hint: `<p><code>pearsonr</code> restituisce (r, p): spacchetta col trattino basso. Le due domande finali sono la distinzione chiave: predire sì, intervenire no.</p>`,
      solution: `from scipy import stats

r_gelati_bagnini, _ = stats.pearsonr(gelati, bagnini)
r_temp_gelati, _ = stats.pearsonr(temperatura, gelati)
r_temp_bagnini, _ = stats.pearsonr(temperatura, bagnini)

c1 = False
c2 = True

print(f"gelati-bagnini r={r_gelati_bagnini:.2f} | temp-gelati r={r_temp_gelati:.2f} | temp-bagnini r={r_temp_bagnini:.2f}")`
    },

    {
      type: "exercise", id: "stat-27", kg: 15, title: "La curva che Pearson non vede",
      task: `<p>Ore di allenamento settimanali e forza: la relazione è monotona ma con rendimenti decrescenti (radice quadrata). Confronta i due coefficienti:</p>
<ul>
<li><code>r_pearson</code>: Pearson tra ore e forza</li>
<li><code>r_spearman</code>: Spearman (sui ranghi)</li>
<li><code>spearman_maggiore</code>: <code>True</code> se Spearman supera Pearson (la relazione è monotona ma non lineare)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(77)
ore = np.linspace(1, 20, 30)
forza = np.round(30 * np.sqrt(ore) + rng.normal(0, 3, size=30), 1)`,
      starter: `from scipy import stats
# ore, forza: gia' caricati

r_pearson, _ = ...
r_spearman, _ = ...
spearman_maggiore = ...

print(f"Pearson {r_pearson:.3f} vs Spearman {r_spearman:.3f} | Spearman vince: {spearman_maggiore}")`,
      check: `from scipy import stats as _st
_rp = _st.pearsonr(ore, forza)[0]
_rs = _st.spearmanr(ore, forza)[0]
assert 'r_pearson' in globals() and abs(float(r_pearson) - _rp) < 1e-6, "r_pearson: stats.pearsonr(ore, forza)[0]"
assert 'r_spearman' in globals() and abs(float(r_spearman) - _rs) < 1e-6, "r_spearman: stats.spearmanr(ore, forza)[0]"
assert 'spearman_maggiore' in globals() and spearman_maggiore == bool(_rs > _rp), "spearman_maggiore: sui ranghi la monotonia e' quasi perfetta, la retta no — Spearman > Pearson"`,
      hint: `<p><code>stats.spearmanr(ore, forza)</code> ha la stessa interfaccia di <code>pearsonr</code>. La radice quadrata cresce sempre (monotona) ma si piega (non lineare): ecco il divario tra i due.</p>`,
      solution: `from scipy import stats

r_pearson, _ = stats.pearsonr(ore, forza)
r_spearman, _ = stats.spearmanr(ore, forza)
spearman_maggiore = r_spearman > r_pearson

print(f"Pearson {r_pearson:.3f} vs Spearman {r_spearman:.3f} | Spearman vince: {spearman_maggiore}")`
    },

    { type: "theory", title: "La regressione lineare, vista dalla statistica", html: `
<p>Nelle sale scikit-learn la regressione era una macchina per predire. La statistica la guarda con altri occhi: <em>ogni coefficiente è una stima con la sua incertezza</em>, e va processata come tale.</p>
<pre><code>from scipy import stats
ris = stats.linregress(x, y)
ris.slope       # la pendenza stimata: +1.2 kg per settimana in piu'
ris.intercept   # il valore previsto a x=0
ris.rvalue      # r di Pearson; r**2 = frazione di varianza spiegata
ris.pvalue      # H0: la pendenza vera e' zero
ris.stderr      # errore standard della pendenza</code></pre>
<p>La domanda statistica non è "quanto prevede bene?" ma "<strong>la pendenza è distinguibile da zero?</strong>": il p-value testa proprio H0: slope=0 (x non c'entra nulla con y). E l'IC della pendenza è <code>slope ± 1.96&middot;stderr</code>: se contiene lo zero, i dati non escludono che la relazione non esista.</p>
`, more: `
<p>R² (il quadrato di <code>rvalue</code>) si legge come "frazione della varianza di y spiegata dalla retta": 0.75 = i tre quarti delle differenze nei massimali si spiegano con le settimane di allenamento. Ma R² alto non valida il modello: il quartetto di Anscombe di nuovo — una relazione curva con R²=0.67 resta curva, e la retta resta il modello sbagliato. Il controllo giusto sono i <strong>residui</strong> (y osservato - y previsto): se il modello è adeguato, i residui sono rumore senza struttura, media zero, nessun pattern contro x. Un pattern nei residui (una U, un ventaglio che si allarga) è il modello che confessa: la forma è sbagliata, o la varianza non è costante (eteroschedasticità — e allora gli stderr e i p-value non sono più affidabili).</p>
<p>Estrapolare oltre il range osservato è l'altro peccato capitale: la retta stimata tra 1 e 20 settimane non sa NULLA di cosa succede a 50 — il modello continua a rispondere (le rette non si fermano), ma la risposta è pura invenzione. L'intercetta stessa è spesso un'estrapolazione: "massimale a zero settimane di allenamento" può non avere alcun senso fisico, e va letta come artefatto geometrico, non come previsione.</p>
<p>Con più predittori (regressione multipla) ogni coefficiente diventa "effetto di x TENUTO FERMO tutto il resto" — e qui la statistica incontra la causalità: se un confondente non è nel modello, i coefficienti assorbono il suo effetto (omitted variable bias). Aggiungere variabili "a caso" però non è gratis: predittori correlati tra loro (multicollinearità) rendono i singoli coefficienti instabili anche quando le predizioni restano buone. La versione con tutti i dettagli inferenziali in Python è <code>statsmodels</code> (OLS con summary completo), il fratello statistico di scikit-learn.</p>
` },

    {
      type: "exercise", id: "stat-28", kg: 20, title: "La pendenza sotto processo",
      task: `<p>Settimane di allenamento e massimale di 40 soci. Regressione con <code>linregress</code>:</p>
<ul>
<li><code>slope</code>, <code>intercept</code>, <code>r2</code>, <code>p_value</code>: pendenza, intercetta, R² e p-value</li>
<li><code>ic_slope_basso</code>, <code>ic_slope_alto</code>: IC 95% della pendenza (±1.96&middot;stderr)</li>
<li><code>pendenza_reale</code>: <code>True</code> se il p-value è sotto 0.05 E l'IC non contiene lo zero (le due cose vanno insieme)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(140)
settimane = rng.integers(4, 60, size=40).astype(float)
massimale = np.round(60 + 1.1 * settimane + rng.normal(0, 12, size=40), 1)`,
      starter: `from scipy import stats
# settimane, massimale: gia' caricati

ris = stats.linregress(settimane, massimale)

slope = ...
intercept = ...
r2 = ...
p_value = ...
ic_slope_basso = ...
ic_slope_alto = ...
pendenza_reale = ...

print(f"+{slope:.2f} kg/settimana | R2={r2:.2f} | p={p_value:.2e} | IC [{ic_slope_basso:.2f}, {ic_slope_alto:.2f}]")`,
      check: `from scipy import stats as _st
_r = _st.linregress(settimane, massimale)
assert 'slope' in globals() and abs(float(slope) - _r.slope) < 1e-9, "slope: ris.slope"
assert 'intercept' in globals() and abs(float(intercept) - _r.intercept) < 1e-9, "intercept: ris.intercept"
assert 'r2' in globals() and abs(float(r2) - _r.rvalue**2) < 1e-9, "r2: ris.rvalue**2 — rvalue e' r, non R2"
assert 'p_value' in globals() and abs(float(p_value) - _r.pvalue) < 1e-12, "p_value: ris.pvalue, testa H0: pendenza zero"
assert 'ic_slope_basso' in globals() and abs(float(ic_slope_basso) - (_r.slope - 1.96*_r.stderr)) < 1e-6, "ic_slope_basso: slope - 1.96*ris.stderr"
assert 'ic_slope_alto' in globals() and abs(float(ic_slope_alto) - (_r.slope + 1.96*_r.stderr)) < 1e-6, "ic_slope_alto: slope + 1.96*ris.stderr"
assert 'pendenza_reale' in globals() and pendenza_reale == True, "pendenza_reale: p minuscolo e IC lontano dallo zero — la pendenza e' reale, circa +1.1 kg/settimana"`,
      hint: `<p>Tutto sta nell'oggetto risultato: <code>ris.slope</code>, <code>ris.rvalue**2</code>, <code>ris.stderr</code>. p &lt; 0.05 e "zero fuori dall'IC 95%" sono la stessa affermazione in due dialetti.</p>`,
      solution: `from scipy import stats

ris = stats.linregress(settimane, massimale)

slope = ris.slope
intercept = ris.intercept
r2 = ris.rvalue**2
p_value = ris.pvalue
ic_slope_basso = ris.slope - 1.96 * ris.stderr
ic_slope_alto = ris.slope + 1.96 * ris.stderr
pendenza_reale = (p_value < 0.05) and not (ic_slope_basso <= 0 <= ic_slope_alto)

print(f"+{slope:.2f} kg/settimana | R2={r2:.2f} | p={p_value:.2e} | IC [{ic_slope_basso:.2f}, {ic_slope_alto:.2f}]")`
    },

    {
      type: "exercise", id: "stat-29", kg: 15, title: "I residui confessano",
      task: `<p>Con la regressione dell'esercizio precedente, controlla i residui e fai una previsione onesta:</p>
<ul>
<li><code>previsti</code>: i massimali previsti dalla retta per ogni socio</li>
<li><code>residui</code>: osservato - previsto</li>
<li><code>media_residui</code>: deve venire ~0 (proprietà della regressione)</li>
<li><code>previsione_30</code>: massimale previsto a 30 settimane</li>
<li><code>estrapolazione_ok</code>: <code>False</code> — prevedere a 200 settimane sarebbe legittimo?</li>
</ul>`,
      setup: `import numpy as np
from scipy import stats
rng = np.random.default_rng(140)
settimane = rng.integers(4, 60, size=40).astype(float)
massimale = np.round(60 + 1.1 * settimane + rng.normal(0, 12, size=40), 1)
ris = stats.linregress(settimane, massimale)`,
      starter: `import numpy as np
# settimane, massimale, ris (linregress) gia' pronti

previsti = ...
residui = ...
media_residui = ...
previsione_30 = ...
estrapolazione_ok = ...

print(f"media residui {media_residui:.2e} | a 30 settimane: {previsione_30:.1f} kg")`,
      check: `import numpy as np
_prev = ris.intercept + ris.slope * settimane
assert 'previsti' in globals() and np.allclose(np.asarray(previsti), _prev), "previsti: ris.intercept + ris.slope * settimane"
assert 'residui' in globals() and np.allclose(np.asarray(residui), massimale - _prev), "residui: massimale - previsti"
assert 'media_residui' in globals() and abs(float(media_residui)) < 1e-9, "media_residui: (residui).mean() — la regressione li centra a zero per costruzione"
assert 'previsione_30' in globals() and abs(float(previsione_30) - (ris.intercept + ris.slope*30)) < 1e-6, "previsione_30: intercept + slope*30 — dentro il range osservato (4-60), previsione legittima"
assert 'estrapolazione_ok' in globals() and estrapolazione_ok == False, "estrapolazione_ok: False — 200 settimane e' fuori dal range dei dati: la retta risponde comunque, ma sta inventando"`,
      hint: `<p>La retta: <code>intercept + slope * x</code>, vettorizzata su tutto l'array. La media dei residui è zero per costruzione matematica: se non ti viene zero, c'è un bug, non una scoperta.</p>`,
      solution: `import numpy as np

previsti = ris.intercept + ris.slope * settimane
residui = massimale - previsti
media_residui = residui.mean()
previsione_30 = ris.intercept + ris.slope * 30
estrapolazione_ok = False

print(f"media residui {media_residui:.2e} | a 30 settimane: {previsione_30:.1f} kg")`
    },

    {
      type: "exercise", id: "stat-30", kg: 25, title: "MASSIMALE: l'esperimento completo",
      task: `<p>Il gran finale: la palestra ha testato una nuova app di coaching su 3000 soci (B) contro 3000 di controllo (A). Conduci l'analisi completa:</p>
<ul>
<li><code>p_a</code>, <code>p_b</code>: tassi di rinnovo osservati</li>
<li><code>p_value</code>: z-test pooled a due code sulle proporzioni</li>
<li><code>significativo</code>: p &lt; 0.05?</li>
<li><code>ic_diff</code>: tupla (basso, alto), IC 95% della differenza con SE NON pooled: <code>sqrt(pa(1-pa)/na + pb(1-pb)/nb)</code></li>
<li><code>uplift_relativo</code>: la crescita percentuale del rinnovo</li>
<li><code>raccomandazione</code>: <code>"lancia"</code> se significativo e uplift &gt; 5%, altrimenti <code>"aspetta"</code></li>
</ul>`,
      setup: `import numpy as np
rinnovi_a, n_a = 1260, 3000
rinnovi_b, n_b = 1377, 3000`,
      starter: `import numpy as np
from scipy import stats
# rinnovi_a=1260, n_a=3000 | rinnovi_b=1377, n_b=3000

p_a = ...
p_b = ...

p_pool = ...
se_pool = ...
z = ...
p_value = ...
significativo = ...

se_diff = ...
diff = p_b - p_a
ic_diff = (..., ...)

uplift_relativo = ...
raccomandazione = ...

print(f"A {p_a:.3f} -> B {p_b:.3f} | p={p_value:.4f} | IC diff [{ic_diff[0]:.3f}, {ic_diff[1]:.3f}] | uplift {uplift_relativo*100:.1f}% -> {raccomandazione}")`,
      check: `import numpy as np
from scipy import stats as _st
_pa, _pb = 1260/3000, 1377/3000
_pp = (1260+1377)/6000
_sep = np.sqrt(_pp*(1-_pp)*(2/3000))
_z = (_pb-_pa)/_sep
_p = 2*(1-_st.norm.cdf(abs(_z)))
_sed = np.sqrt(_pa*(1-_pa)/3000 + _pb*(1-_pb)/3000)
_d = _pb-_pa
assert 'p_a' in globals() and abs(float(p_a) - _pa) < 1e-9, "p_a: 1260/3000 = 0.42"
assert 'p_b' in globals() and abs(float(p_b) - _pb) < 1e-9, "p_b: 1377/3000 = 0.459"
assert 'p_value' in globals() and abs(float(p_value) - _p) < 1e-6, "p_value: z-test pooled a due code, come nel Bottone Verde"
assert 'significativo' in globals() and significativo == True, "significativo: True, p circa 0.002"
assert 'ic_diff' in globals() and abs(float(ic_diff[0]) - (_d - 1.96*_sed)) < 1e-6 and abs(float(ic_diff[1]) - (_d + 1.96*_sed)) < 1e-6, "ic_diff: (diff - 1.96*se_diff, diff + 1.96*se_diff) con il SE non pooled"
assert 'uplift_relativo' in globals() and abs(float(uplift_relativo) - _d/_pa) < 1e-9, "uplift_relativo: (p_b - p_a) / p_a, circa +9.3%"
assert 'raccomandazione' in globals() and raccomandazione == "lancia", "raccomandazione: significativo E uplift 9.3% > 5% -> 'lancia'"`,
      hint: `<p>Due SE diversi, ed è giusto così: quello POOLED serve al test (sotto H0 le proporzioni coincidono), quello NON pooled all'IC della differenza (nessuna H0 da rispettare). È la sottigliezza finale della sala.</p>`,
      solution: `import numpy as np
from scipy import stats

p_a = rinnovi_a / n_a
p_b = rinnovi_b / n_b

p_pool = (rinnovi_a + rinnovi_b) / (n_a + n_b)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
z = (p_b - p_a) / se_pool
p_value = 2 * (1 - stats.norm.cdf(abs(z)))
significativo = p_value < 0.05

se_diff = np.sqrt(p_a*(1-p_a)/n_a + p_b*(1-p_b)/n_b)
diff = p_b - p_a
ic_diff = (diff - 1.96*se_diff, diff + 1.96*se_diff)

uplift_relativo = diff / p_a
raccomandazione = "lancia" if (significativo and uplift_relativo > 0.05) else "aspetta"

print(f"A {p_a:.3f} -> B {p_b:.3f} | p={p_value:.4f} | IC diff [{ic_diff[0]:.3f}, {ic_diff[1]:.3f}] | uplift {uplift_relativo*100:.1f}% -> {raccomandazione}")`
    }

  ]
});
