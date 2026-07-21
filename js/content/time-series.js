window.MODULES.push({
  id: "time-series",
  name: "Serie Temporali",
  tagline: "La sala del cronometro: trend, stagionalità, lag, walk-forward. Dove il tempo è una feature e il futuro non si spia.",
  intro: "Vendite, traffico, sensori: dati con un ordine temporale che cambia tutto. Rolling window, feature di lag, stagionalità, e il peccato mortale del leakage dal futuro. ARIMA e Prophet li spieghiamo (non girano in Pyodide); qui si allena con NumPy, pandas e sklearn.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Cosa rende speciale una serie temporale", html: `
<p>In una serie temporale l'<strong>ordine conta</strong>: ogni osservazione ha un istante, e il passato influenza il futuro. Questo rompe l'assunzione base del machine learning classico — che i campioni siano indipendenti e scambiabili.</p>
<p>Le conseguenze pratiche, tutte in questa sala:</p>
<ul>
<li>NON puoi mescolare i dati a caso (split temporale, non casuale);</li>
<li>Le feature più potenti guardano il PASSATO (lag, medie mobili);</li>
<li>Il rischio numero uno è spiare il FUTURO (leakage temporale);</li>
<li>Le componenti tipiche sono trend, stagionalità e rumore.</li>
</ul>
<pre><code>import pandas as pd
serie = pd.Series(valori, index=pd.date_range("2026-01-01", periods=len(valori)))
serie.plot()   # sull'asse x il tempo, non l'indice numerico</code></pre>
`, more: `
<p>La proprietà tecnica centrale è la <strong>stazionarietà</strong>: una serie è stazionaria se le sue proprietà statistiche (media, varianza, autocorrelazione) non cambiano nel tempo. Molti metodi classici (ARIMA in testa) la assumono, ma le serie reali quasi mai lo sono — hanno trend (media che cresce) o stagionalità (varianza/media che oscillano). Il lavoro spesso consiste nel RENDERE stazionaria la serie: la differenziazione (<code>serie.diff()</code>, lavorare sulle variazioni invece che sui livelli) rimuove il trend; trasformazioni come il log stabilizzano la varianza crescente. Riconoscere la non stazionarietà e sapervi rimediare è metà del mestiere.</p>
<p>L'<strong>autocorrelazione</strong> è ciò che rende le serie predicibili e insieme insidiose: il valore di oggi è correlato con quello di ieri, dell'altro ieri, di una settimana fa. È il segnale che i modelli sfruttano (se non ci fosse correlazione temporale, il passato non aiuterebbe a predire il futuro), ma è anche ciò che invalida le tecniche standard — la cross-validation casuale, gli intervalli di confidenza classici, i test che assumono indipendenza danno tutti risultati sbagliati su dati autocorrelati. Ogni tecnica di questa sala esiste per rispettare questa dipendenza invece di ignorarla.</p>
<p>Un errore concettuale da evitare: trattare l'indice temporale come una semplice feature numerica ("giorno 1, 2, 3..."). Il tempo porta struttura ricca — giorno della settimana, mese, festività, ora — e relazioni (distanza tra eventi, cicli) che un contatore lineare cancella. Estrarre bene le feature temporali (come visto nella sala Feature Engineering) e rispettare l'ordine nella validazione sono le due competenze che distinguono chi sa lavorare con le serie da chi applica il ML tabulare a dati che non lo sono.</p>
` },

    {
      type: "exercise", id: "ts-01", kg: 5, title: "Una serie col suo tempo",
      task: `<p>Costruisci una serie temporale pandas con indice di date e leggine le proprietà base:</p>
<ul>
<li><code>serie</code>: una <code>pd.Series</code> dei valori, con indice giornaliero da 2026-01-01</li>
<li><code>primo_giorno</code>, <code>ultimo_giorno</code>: le date estreme dell'indice</li>
<li><code>n_giorni</code>: la lunghezza della serie</li>
<li><code>media</code>: la media dei valori</li>
</ul>`,
      setup: `import numpy as np
valori = np.array([100, 105, 103, 110, 108, 115, 120], dtype=float)`,
      starter: `import pandas as pd
import numpy as np
# valori: 7 misure giornaliere

serie = pd.Series(valori, index=pd.date_range("2026-01-01", periods=len(valori)))
primo_giorno = serie.index[0]
ultimo_giorno = ...
n_giorni = ...
media = ...

print(serie)
print(f"da {primo_giorno.date()} a {ultimo_giorno.date()} | {n_giorni} giorni | media {media:.1f}")`,
      check: `import pandas as pd
assert 'serie' in globals() and len(serie) == 7, "serie: pd.Series con indice di date"
assert 'ultimo_giorno' in globals() and ultimo_giorno == pd.Timestamp("2026-01-07"), "ultimo_giorno: serie.index[-1]"
assert 'n_giorni' in globals() and n_giorni == 7, "n_giorni: len(serie)"
assert 'media' in globals() and abs(float(media) - valori.mean()) < 1e-9, "media: serie.mean()"`,
      hint: `<p><code>pd.date_range("2026-01-01", periods=n)</code> crea l'indice temporale. <code>serie.index[-1]</code> è l'ultima data, <code>serie.mean()</code> la media.</p>`,
      solution: `import pandas as pd
import numpy as np

serie = pd.Series(valori, index=pd.date_range("2026-01-01", periods=len(valori)))
primo_giorno = serie.index[0]
ultimo_giorno = serie.index[-1]
n_giorni = len(serie)
media = serie.mean()

print(serie)
print(f"da {primo_giorno.date()} a {ultimo_giorno.date()} | {n_giorni} giorni | media {media:.1f}")`
    },

    { type: "theory", title: "Rolling window e medie mobili", html: `
<p>La <strong>media mobile</strong> (rolling mean) è lo strumento più usato per lisciare il rumore e vedere il trend: sostituisce ogni punto con la media degli ultimi k. Pandas la calcola con <code>.rolling()</code>.</p>
<pre><code>serie.rolling(window=7).mean()   # media mobile a 7 giorni
serie.rolling(window=7).std()    # deviazione mobile
serie.rolling(window=7).sum()    # somma mobile</code></pre>
<p>Fondamentale: la rolling di pandas guarda <strong>all'indietro</strong> per default — il valore al tempo t usa [t-6, ..., t]. I primi k-1 valori sono NaN (non c'è abbastanza storia). Questo comportamento "backward" è ciò che la rende sicura per le feature: non guarda mai il futuro.</p>
<p>Applicazioni: lisciare per il grafico, creare feature ("vendite medie ultimi 7 giorni"), rilevare anomalie (quanto oggi si discosta dalla media mobile).</p>
`, more: `
<p>La finestra k governa il compromesso liscezza/reattività: finestra grande = curva molto liscia ma lenta a reagire ai cambiamenti (il trend emerge chiaro ma i punti di svolta arrivano in ritardo); finestra piccola = segue da vicino ma lascia passare rumore. La scelta dipende dalla scala del fenomeno che vuoi vedere: 7 giorni per smorzare il ciclo settimanale, 30 per la tendenza mensile. Non c'è finestra "giusta" in astratto — dipende da cosa stai cercando.</p>
<p>Varianti importanti: la media mobile <strong>esponenziale</strong> (EWMA, <code>serie.ewm()</code>) pesa di più i valori recenti invece di pesarli tutti uguali come la media semplice — reagisce più in fretta ai cambiamenti recenti mantenendo memoria del passato, ed è preferita in molti contesti (finanza, monitoring). E c'è la distinzione tra rolling <strong>backward</strong> (default, sicura per le feature) e <strong>centrata</strong> (<code>center=True</code>, usa anche il futuro): quella centrata è ottima per VISUALIZZARE il trend a posteriori ma VIETATA come feature predittiva, perché al tempo t userebbe valori di t+1, t+2 — leakage dal futuro.</p>
<p>I NaN iniziali (i primi k-1 punti senza storia sufficiente) sono una conseguenza inevitabile e vanno gestiti consapevolmente: eliminarli (<code>dropna</code>, perdendo i primi punti), riempirli, o usare <code>min_periods</code> per calcolare la media anche con meno di k valori all'inizio. Ignorarli propaga NaN nel modello a valle. È lo stesso principio delle feature di lag (prossima lavagna): guardare indietro nel tempo costa sempre qualche punto iniziale di dati, ed è il prezzo corretto da pagare per non spiare il futuro.</p>
` },

    {
      type: "exercise", id: "ts-02", kg: 10, title: "Lisciare il rumore",
      task: `<p>Applica una media mobile a 3 giorni a una serie rumorosa e verifica che sia più liscia:</p>
<ul>
<li><code>rolling_mean</code>: media mobile a finestra 3</li>
<li><code>n_nan</code>: quanti NaN iniziali (dove non c'è abbastanza storia)</li>
<li><code>std_originale</code>, <code>std_lisciata</code>: deviazione standard della serie originale e di quella lisciata (ignorando i NaN)</li>
<li><code>piu_liscia</code>: <code>True</code> se <code>std_lisciata &lt; std_originale</code></li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(0)
trend = np.linspace(100, 130, 30)
serie = pd.Series(trend + rng.normal(0, 8, 30))`,
      starter: `import pandas as pd
import numpy as np
# serie: 30 valori = trend crescente + rumore

rolling_mean = ...
n_nan = ...
std_originale = serie.std()
std_lisciata = ...   # std della serie lisciata, ignorando i NaN
piu_liscia = ...

print(f"NaN iniziali: {n_nan} | std originale {std_originale:.1f} -> lisciata {std_lisciata:.1f}")`,
      check: `import pandas as pd
import numpy as np
_rm = serie.rolling(window=3).mean()
assert 'rolling_mean' in globals() and np.allclose(rolling_mean.dropna().values, _rm.dropna().values), "rolling_mean: serie.rolling(window=3).mean()"
assert 'n_nan' in globals() and int(n_nan) == 2, "n_nan: 2 — i primi 2 valori sono NaN (finestra 3 serve 3 punti)"
assert 'std_lisciata' in globals() and abs(float(std_lisciata) - float(_rm.std())) < 1e-6, "std_lisciata: rolling_mean.std() (ignora i NaN da solo)"
assert 'piu_liscia' in globals() and piu_liscia == True, "piu_liscia: True — la media mobile riduce la deviazione standard"`,
      hint: `<p><code>serie.rolling(window=3).mean()</code>. I NaN iniziali: <code>rolling_mean.isna().sum()</code>. La std ignora i NaN automaticamente: <code>rolling_mean.std()</code>. Lisciare riduce la variabilità.</p>`,
      solution: `import pandas as pd
import numpy as np

rolling_mean = serie.rolling(window=3).mean()
n_nan = int(rolling_mean.isna().sum())
std_originale = serie.std()
std_lisciata = rolling_mean.std()
piu_liscia = std_lisciata < std_originale

print(f"NaN iniziali: {n_nan} | std originale {std_originale:.1f} -> lisciata {std_lisciata:.1f}")`
    },

    {
      type: "exercise", id: "ts-03", kg: 15, title: "Backward è sicuro, centrato spia il futuro",
      task: `<p>Dimostra perché la rolling centrata NON va usata come feature. Confronta backward e centered:</p>
<ul>
<li><code>roll_back</code>: rolling mean finestra 3, backward (default)</li>
<li><code>roll_center</code>: rolling mean finestra 3, <code>center=True</code></li>
<li><code>back_usa_solo_passato</code>: <code>True</code> se il valore backward al tempo t (indice 5) dipende solo da t-2,t-1,t (verifica: <code>roll_back.iloc[5]</code> == media di <code>serie.iloc[3:6]</code>)</li>
<li><code>center_usa_futuro</code>: <code>True</code> se il valore centrato al tempo t (indice 5) usa anche t+1 (verifica: <code>roll_center.iloc[5]</code> == media di <code>serie.iloc[4:7]</code>, che include il futuro)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
serie = pd.Series([10.0, 12, 11, 14, 13, 16, 15, 18, 17, 20])`,
      starter: `import pandas as pd
import numpy as np
# serie: 10 valori

roll_back = serie.rolling(window=3).mean()
roll_center = ...

# al tempo t=5: backward usa gli indici 3,4,5 | centered usa 4,5,6
back_usa_solo_passato = np.isclose(roll_back.iloc[5], serie.iloc[3:6].mean())
center_usa_futuro = ...

print(f"backward[5] = {roll_back.iloc[5]:.2f} (media di indici 3-5)")
print(f"centered[5] = {roll_center.iloc[5]:.2f} (media di indici 4-6, include il FUTURO indice 6)")`,
      check: `import pandas as pd
import numpy as np
_rc = serie.rolling(window=3, center=True).mean()
assert 'roll_center' in globals() and np.allclose(roll_center.dropna().values, _rc.dropna().values), "roll_center: serie.rolling(window=3, center=True).mean()"
assert 'back_usa_solo_passato' in globals() and back_usa_solo_passato == True, "back_usa_solo_passato: True — backward[5] = media(indici 3,4,5)"
assert 'center_usa_futuro' in globals() and center_usa_futuro == True and np.isclose(_rc.iloc[5], serie.iloc[4:7].mean()), "center_usa_futuro: True — centered[5] = media(4,5,6), l'indice 6 e' il FUTURO"`,
      hint: `<p><code>center=True</code> centra la finestra: al tempo t usa [t-1, t, t+1], quindi guarda il futuro. <code>center_usa_futuro = np.isclose(roll_center.iloc[5], serie.iloc[4:7].mean())</code>.</p>`,
      solution: `import pandas as pd
import numpy as np

roll_back = serie.rolling(window=3).mean()
roll_center = serie.rolling(window=3, center=True).mean()

back_usa_solo_passato = np.isclose(roll_back.iloc[5], serie.iloc[3:6].mean())
center_usa_futuro = np.isclose(roll_center.iloc[5], serie.iloc[4:7].mean())

print(f"backward[5] = {roll_back.iloc[5]:.2f} (media di indici 3-5)")
print(f"centered[5] = {roll_center.iloc[5]:.2f} (media di indici 4-6, include il FUTURO indice 6)")`
    },

    { type: "theory", title: "Feature di lag", html: `
<p>La feature più potente per predire una serie è il suo stesso passato. Le <strong>feature di lag</strong> spostano la serie all'indietro: il lag-1 è "il valore di ieri", il lag-7 "quello di una settimana fa".</p>
<pre><code>df["lag_1"] = serie.shift(1)   # valore di 1 passo fa
df["lag_7"] = serie.shift(7)   # valore di 7 passi fa
# per predire serie[t] usi lag_1[t]=serie[t-1], lag_7[t]=serie[t-7]</code></pre>
<p>Con <code>shift(k)</code> ogni riga porta con sé valori passati, trasformando la previsione temporale in un normale problema tabulare: features = lag, target = valore corrente. È il ponte che permette di usare Random Forest, boosting e regressione sulle serie.</p>
<p>Attenzione: <code>shift</code> con k positivo guarda INDIETRO (sicuro). <code>shift(-1)</code> guarderebbe AVANTI — è il target futuro, mai una feature.</p>
`, more: `
<p>Il segno di <code>shift</code> è la distinzione tra feature legittima e leakage, e va interiorizzato: <code>shift(k)</code> con k&gt;0 sposta i valori in avanti nel tempo, così la riga di oggi contiene il valore di k giorni fa — è guardare il PASSATO, sicuro. <code>shift(-k)</code> porta indietro i valori futuri nella riga di oggi — è guardare il FUTURO, che come feature è leakage puro, ma come TARGET (cosa vuoi predire, es. "vendite di domani" = <code>shift(-1)</code>) è esattamente ciò che serve. Confondere i due segni è l'errore più comune e più difficile da individuare, perché il modello funziona benissimo in backtest e fallisce in produzione.</p>
<p>Quali lag scegliere è una decisione di dominio guidata dai dati: i lag brevi (1, 2, 3) catturano la persistenza a breve; i lag stagionali (7 per il ciclo settimanale, 12 o 365 per quello annuale) catturano la ripetizione periodica. Il grafico di autocorrelazione (ACF) e autocorrelazione parziale (PACF) mostra quali lag hanno correlazione significativa col presente, guidando la scelta. Aggiungere troppi lag gonfia le feature e l'overfitting; sceglierne pochi ma sensati (persistenza + stagionalità nota) è la strategia robusta.</p>
<p>Le feature di lag hanno un costo inevitabile: le prime k righe hanno NaN (non c'è storia sufficiente) e vanno eliminate, perdendo dati all'inizio della serie. E c'è una sottigliezza in produzione detta <strong>gap di disponibilità</strong>: se i dati di oggi arrivano con ritardo (il fatturato di oggi è consolidato solo domani), il lag-1 "reale" disponibile al momento della predizione potrebbe essere in realtà il lag-2. Costruire le feature con i lag che sarebbero DAVVERO disponibili al momento della predizione, non quelli teorici, è ciò che rende un modello di serie temporali robusto al passaggio in produzione.</p>
` },

    {
      type: "exercise", id: "ts-04", kg: 15, title: "Il passato come feature",
      task: `<p>Trasforma una serie in un problema tabulare con feature di lag. Crea un DataFrame con lag 1, 2 e 7:</p>
<ul>
<li><code>df</code>: DataFrame con colonna <code>y</code> (la serie) e <code>lag_1</code>, <code>lag_2</code>, <code>lag_7</code></li>
<li><code>df_pulito</code>: <code>df</code> senza le righe con NaN (i primi 7 giorni)</li>
<li><code>n_persi</code>: quante righe perse per i NaN dei lag</li>
<li><code>lag1_e_ieri</code>: <code>True</code> se in <code>df_pulito</code> il primo <code>lag_1</code> è uguale al valore <code>y</code> del giorno precedente nella serie originale</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
serie = pd.Series(np.arange(100, 120, dtype=float))   # 20 valori: 100..119`,
      starter: `import pandas as pd
import numpy as np
# serie: 20 valori consecutivi

df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_2"] = ...
df["lag_7"] = ...

df_pulito = df.dropna()
n_persi = ...
# nel df pulito, la prima riga e' il giorno 7 (indice 7): lag_1 deve valere serie[6]
lag1_e_ieri = np.isclose(df_pulito["lag_1"].iloc[0], serie.iloc[6])

print(df_pulito.head())
print(f"righe perse: {n_persi} | lag_1 = valore di ieri: {lag1_e_ieri}")`,
      check: `import pandas as pd
import numpy as np
_df = pd.DataFrame({"y": serie})
_df["lag_1"] = serie.shift(1); _df["lag_2"] = serie.shift(2); _df["lag_7"] = serie.shift(7)
_dp = _df.dropna()
assert 'lag_2' in df.columns and np.allclose(df["lag_2"].dropna().values, serie.shift(2).dropna().values), "lag_2: serie.shift(2)"
assert 'lag_7' in df.columns and np.allclose(df["lag_7"].dropna().values, serie.shift(7).dropna().values), "lag_7: serie.shift(7)"
assert 'n_persi' in globals() and int(n_persi) == 7, "n_persi: 7 righe perse (il lag piu' lungo e' 7)"
assert 'lag1_e_ieri' in globals() and lag1_e_ieri == True, "lag1_e_ieri: True — shift(1) porta il valore di ieri"`,
      hint: `<p><code>serie.shift(k)</code> per ogni lag. Le righe perse: <code>len(df) - len(df_pulito)</code>, pari al lag più lungo (7). <code>dropna()</code> toglie le righe iniziali senza storia completa.</p>`,
      solution: `import pandas as pd
import numpy as np

df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_2"] = serie.shift(2)
df["lag_7"] = serie.shift(7)

df_pulito = df.dropna()
n_persi = len(df) - len(df_pulito)
lag1_e_ieri = np.isclose(df_pulito["lag_1"].iloc[0], serie.iloc[6])

print(df_pulito.head())
print(f"righe perse: {n_persi} | lag_1 = valore di ieri: {lag1_e_ieri}")`
    },

    {
      type: "exercise", id: "ts-05", kg: 15, title: "shift(-1): il target, non la feature",
      task: `<p>Chiarisci la differenza tra guardare indietro (feature) e avanti (target). Costruisci un problema di previsione a un passo:</p>
<ul>
<li><code>df["target"]</code>: il valore del GIORNO DOPO, cioè <code>serie.shift(-1)</code> (quello che vuoi predire)</li>
<li><code>df["feature_oggi"]</code>: il valore di oggi (la serie stessa)</li>
<li><code>target_e_futuro</code>: <code>True</code> se il primo <code>target</code> è uguale al SECONDO valore della serie (shift -1 porta indietro il futuro)</li>
<li><code>shift_negativo_e_leakage_come_feature</code>: <code>True</code> — usare shift(-1) come FEATURE sarebbe leakage (booleano concettuale)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
serie = pd.Series([10.0, 20, 30, 40, 50])`,
      starter: `import pandas as pd
import numpy as np
# serie: 5 valori

df = pd.DataFrame({"feature_oggi": serie})
df["target"] = ...   # il valore di DOMANI: shift(-1)

target_e_futuro = np.isclose(df["target"].iloc[0], serie.iloc[1])
shift_negativo_e_leakage_come_feature = ...

print(df)
print(f"target[0] = valore di domani: {target_e_futuro}")`,
      check: `import pandas as pd
import numpy as np
assert 'target' in df.columns and np.allclose(df["target"].dropna().values, serie.shift(-1).dropna().values), "target: serie.shift(-1) — porta indietro il valore futuro"
assert 'target_e_futuro' in globals() and target_e_futuro == True, "target_e_futuro: True — shift(-1)[0] = serie[1] (il futuro)"
assert 'shift_negativo_e_leakage_come_feature' in globals() and shift_negativo_e_leakage_come_feature == True, "True: shift(-1) va bene SOLO come target; come feature farebbe vedere il futuro al modello"`,
      hint: `<p><code>serie.shift(-1)</code> porta il valore di domani nella riga di oggi: perfetto come TARGET da predire, vietato come feature. <code>shift_negativo_e_leakage_come_feature = True</code>.</p>`,
      solution: `import pandas as pd
import numpy as np

df = pd.DataFrame({"feature_oggi": serie})
df["target"] = serie.shift(-1)

target_e_futuro = np.isclose(df["target"].iloc[0], serie.iloc[1])
shift_negativo_e_leakage_come_feature = True

print(df)
print(f"target[0] = valore di domani: {target_e_futuro}")`
    },

    { type: "theory", title: "Trend e stagionalità", html: `
<p>Una serie temporale si decompone tipicamente in tre componenti:</p>
<ul>
<li><strong>Trend</strong>: la direzione di fondo a lungo termine (le vendite crescono anno su anno);</li>
<li><strong>Stagionalità</strong>: pattern che si ripetono a intervalli fissi (picco ogni weekend, ogni dicembre);</li>
<li><strong>Residuo</strong>: ciò che resta, il rumore imprevedibile.</li>
</ul>
<pre><code># decomposizione concettuale (additiva):
# serie = trend + stagionalita' + residuo
trend = serie.rolling(window=stagione, center=True).mean()   # liscia via la stagionalita'
destagionalizzata = serie - trend</code></pre>
<p>Separare le componenti aiuta a capire (quanto della crescita è trend vero e quanto stagionalità?) e a modellare (predici trend e stagionalità separatamente). La decomposizione può essere <strong>additiva</strong> (componenti che si sommano) o <strong>moltiplicativa</strong> (si moltiplicano — quando l'ampiezza della stagionalità cresce col livello).</p>
`, more: `
<p>Additiva vs moltiplicativa è una scelta che riflette la natura dei dati: <strong>additiva</strong> quando l'ampiezza delle oscillazioni stagionali è costante nel tempo (±100 unità sia quando la serie vale 500 sia quando vale 5000); <strong>moltiplicativa</strong> quando l'ampiezza cresce col livello (±20%, cioè ±100 a 500 ma ±1000 a 5000 — tipico di vendite, traffico, fenomeni di crescita). Un trucco pratico: se una serie moltiplicativa la trasformi col logaritmo, diventa additiva (perché log(trend&times;stag) = log(trend)+log(stag)) — ecco un altro motivo per cui il log-transform è così frequente sulle serie economiche.</p>
<p>Il metodo classico completo è la decomposizione STL (Seasonal-Trend decomposition using Loess) di <code>statsmodels</code>: stima trend e stagionalità in modo robusto agli outlier e permette stagionalità che evolve lentamente. Non gira in Pyodide, ma l'idea che pratichi qui — lisciare con una media mobile centrata sulla lunghezza del ciclo stagionale per isolare il trend, poi sottrarre per vedere la stagionalità — è il nucleo concettuale di tutti questi metodi. La lunghezza della finestra DEVE corrispondere al periodo stagionale (7 per dati giornalieri con ciclo settimanale, 12 per dati mensili con ciclo annuale), altrimenti la separazione non funziona.</p>
<p>Perché decomporre, oltre alla comprensione: la <strong>destagionalizzazione</strong> è essenziale per confrontare periodi in modo onesto. "Le vendite di dicembre sono il doppio di novembre" può essere pura stagionalità (Natale) e non crescita reale — i dati destagionalizzati rivelano il trend sottostante. È il motivo per cui gli indicatori economici sono spesso pubblicati "destagionalizzati". E per la previsione: modellare trend e stagionalità separatamente (predici il trend con una regressione, aggiungi il pattern stagionale medio) è spesso più robusto e interpretabile che dare la serie grezza a un modello unico.</p>
` },

    {
      type: "exercise", id: "ts-06", kg: 20, title: "Separare trend e stagionalità",
      task: `<p>Una serie con trend crescente E stagionalità settimanale. Decomponila (additiva):</p>
<ul>
<li><code>trend</code>: media mobile centrata a finestra 7 (la lunghezza del ciclo settimanale)</li>
<li><code>destagionalizzata</code>: <code>serie - trend</code> (quel che resta è stagionalità + rumore)</li>
<li><code>trend_cresce</code>: <code>True</code> se il trend (ignorando i NaN) è complessivamente crescente (ultimo valore valido &gt; primo valido)</li>
<li><code>stagionalita_media_lun</code>: la media dei valori destagionalizzati nei giorni di lunedì (indici 0,7,14,... cioè posizioni con <code>i % 7 == 0</code>)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
n = 28
t = np.arange(n)
trend_vero = 100 + 2 * t
stagione = 10 * np.sin(2 * np.pi * t / 7)   # ciclo settimanale
serie = pd.Series(trend_vero + stagione)`,
      starter: `import pandas as pd
import numpy as np
# serie: 28 giorni = trend crescente + stagionalita' settimanale

trend = ...   # rolling centrata finestra 7
destagionalizzata = serie - trend

trend_valido = trend.dropna()
trend_cresce = ...
# giorni "lunedi": posizioni i con i%7==0
mask_lun = [i for i in range(n) if i % 7 == 0]
stagionalita_media_lun = destagionalizzata.iloc[mask_lun].mean()

print("trend (estremi validi):", round(trend_valido.iloc[0], 1), "->", round(trend_valido.iloc[-1], 1))
print(f"trend cresce: {trend_cresce} | stagionalita' media lunedi: {stagionalita_media_lun:.2f}")`,
      check: `import pandas as pd
import numpy as np
_trend = serie.rolling(window=7, center=True).mean()
assert 'trend' in globals() and np.allclose(trend.dropna().values, _trend.dropna().values), "trend: serie.rolling(window=7, center=True).mean()"
assert 'destagionalizzata' in globals() and np.allclose((serie - _trend).dropna().values, destagionalizzata.dropna().values), "destagionalizzata: serie - trend"
assert 'trend_cresce' in globals() and trend_cresce == True, "trend_cresce: True — il trend estratto e' crescente"
assert 'stagionalita_media_lun' in globals(), "stagionalita_media_lun: media dei destagionalizzati nei lunedi"`,
      hint: `<p>La finestra della rolling DEVE essere 7 (il periodo stagionale) e <code>center=True</code> per isolare il trend. <code>trend_cresce = trend_valido.iloc[-1] &gt; trend_valido.iloc[0]</code>.</p>`,
      solution: `import pandas as pd
import numpy as np

trend = serie.rolling(window=7, center=True).mean()
destagionalizzata = serie - trend

trend_valido = trend.dropna()
trend_cresce = trend_valido.iloc[-1] > trend_valido.iloc[0]
mask_lun = [i for i in range(n) if i % 7 == 0]
stagionalita_media_lun = destagionalizzata.iloc[mask_lun].mean()

print("trend (estremi validi):", round(trend_valido.iloc[0], 1), "->", round(trend_valido.iloc[-1], 1))
print(f"trend cresce: {trend_cresce} | stagionalita' media lunedi: {stagionalita_media_lun:.2f}")`
    },

    { type: "theory", title: "Differenziazione e stazionarietà", html: `
<p>Molti metodi classici richiedono una serie <strong>stazionaria</strong> (proprietà statistiche costanti nel tempo). Una serie con trend non lo è: la media cresce. La cura più semplice è la <strong>differenziazione</strong>: lavorare sulle VARIAZIONI invece che sui livelli.</p>
<pre><code>diff_1 = serie.diff()          # serie[t] - serie[t-1]: rimuove il trend lineare
diff_stag = serie.diff(7)      # serie[t] - serie[t-7]: rimuove la stagionalita' settimanale</code></pre>
<p>La differenza prima trasforma "il livello delle vendite" (che cresce) in "la variazione giornaliera delle vendite" (che oscilla attorno a un valore stabile). Una serie con trend lineare diventa stazionaria dopo UNA differenziazione; con trend quadratico ne servono due.</p>
<p>La differenziazione stagionale (<code>diff(7)</code>, <code>diff(12)</code>) rimuove i pattern periodici. È la "I" (Integrated) di ARIMA.</p>
`, more: `
<p>Come si verifica la stazionarietà: il <strong>test di Dickey-Fuller aumentato</strong> (ADF, in <code>statsmodels</code>) ha come ipotesi nulla "la serie NON è stazionaria (ha una radice unitaria)"; un p-value basso permette di rifiutarla e concludere stazionarietà. È lo strumento standard, ma anche l'ispezione visiva aiuta molto: una serie stazionaria oscilla attorno a una media costante senza trend né stagionalità evidenti né varianza che cambia. La procedura tipica: guarda la serie, se ha trend differenzia una volta, ri-testa, differenzia ancora se serve — di solito una o due differenziazioni bastano.</p>
<p>Il pericolo opposto è l'<strong>over-differencing</strong>: differenziare più del necessario introduce autocorrelazione negativa artificiale e aumenta la varianza, peggiorando il modello. La regola è differenziare il minimo indispensabile per raggiungere la stazionarietà — non "per sicurezza". Se dopo una differenziazione la serie è già stazionaria, fermarsi; una seconda differenziazione non necessaria fa più male che bene. È il parametro <code>d</code> di ARIMA(p,d,q), tipicamente 0, 1 o al massimo 2.</p>
<p>La differenziazione ha un costo interpretativo: dopo aver modellato le VARIAZIONI, per fare previsioni sui LIVELLI devi "integrare" indietro (sommare cumulativamente le variazioni predette al livello di partenza) — da cui la "I" di ARIMA = Integrated. E si perde un punto iniziale per ogni differenziazione (il primo <code>diff()</code> è NaN, non c'è un valore precedente). Alternativa alla differenziazione per rimuovere il trend: adattare e sottrarre un trend esplicito (detrending con una regressione), che preserva l'interpretazione dei livelli — la scelta tra le due dipende da se il trend è stocastico (differenziazione) o deterministico (detrending), una distinzione sottile ma con conseguenze reali sulle previsioni a lungo termine.</p>
` },

    {
      type: "exercise", id: "ts-07", kg: 15, title: "Dalla scala alla variazione",
      task: `<p>Una serie con trend crescente non è stazionaria (media che sale). Differenziala e verifica che si stabilizzi:</p>
<ul>
<li><code>diff_1</code>: la differenza prima (<code>serie.diff()</code>)</li>
<li><code>media_prima_meta</code>, <code>media_seconda_meta</code>: media della serie ORIGINALE nella prima e seconda metà (dovrebbero differire molto: c'è trend)</li>
<li><code>media_diff_prima</code>, <code>media_diff_seconda</code>: media della serie DIFFERENZIATA nelle due metà (dovrebbero essere simili: stazionaria)</li>
<li><code>diff_piu_stabile</code>: <code>True</code> se lo scarto tra le due metà è molto minore per la serie differenziata che per l'originale</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(0)
t = np.arange(100)
serie = pd.Series(50 + 3 * t + rng.normal(0, 5, 100))   # trend forte`,
      starter: `import pandas as pd
import numpy as np
# serie: 100 valori con trend crescente forte

diff_1 = ...
meta = 50

media_prima_meta = serie.iloc[:meta].mean()
media_seconda_meta = serie.iloc[meta:].mean()
media_diff_prima = diff_1.iloc[1:meta].mean()   # salto il primo NaN
media_diff_seconda = diff_1.iloc[meta:].mean()

scarto_orig = abs(media_seconda_meta - media_prima_meta)
scarto_diff = abs(media_diff_seconda - media_diff_prima)
diff_piu_stabile = ...

print(f"originale: {media_prima_meta:.0f} vs {media_seconda_meta:.0f} (scarto {scarto_orig:.0f})")
print(f"differenziata: {media_diff_prima:.2f} vs {media_diff_seconda:.2f} (scarto {scarto_diff:.2f})")`,
      check: `import pandas as pd
import numpy as np
_d = serie.diff()
assert 'diff_1' in globals() and np.allclose(diff_1.dropna().values, _d.dropna().values), "diff_1: serie.diff()"
_so = abs(serie.iloc[50:].mean() - serie.iloc[:50].mean())
_sd = abs(_d.iloc[50:].mean() - _d.iloc[1:50].mean())
assert 'diff_piu_stabile' in globals() and diff_piu_stabile == bool(_sd < _so), "diff_piu_stabile: la serie differenziata ha media molto piu' stabile tra le due meta'"
assert _sd < _so, "la differenziazione deve rendere la serie stazionaria (media costante)"`,
      hint: `<p><code>serie.diff()</code> calcola serie[t]-serie[t-1]. L'originale ha media che cresce (scarto grande tra le metà); la differenziata oscilla attorno a un valore costante (~3, la pendenza). <code>diff_piu_stabile = scarto_diff &lt; scarto_orig</code>.</p>`,
      solution: `import pandas as pd
import numpy as np

diff_1 = serie.diff()
meta = 50

media_prima_meta = serie.iloc[:meta].mean()
media_seconda_meta = serie.iloc[meta:].mean()
media_diff_prima = diff_1.iloc[1:meta].mean()
media_diff_seconda = diff_1.iloc[meta:].mean()

scarto_orig = abs(media_seconda_meta - media_prima_meta)
scarto_diff = abs(media_diff_seconda - media_diff_prima)
diff_piu_stabile = scarto_diff < scarto_orig

print(f"originale: {media_prima_meta:.0f} vs {media_seconda_meta:.0f} (scarto {scarto_orig:.0f})")
print(f"differenziata: {media_diff_prima:.2f} vs {media_diff_seconda:.2f} (scarto {scarto_diff:.2f})")`
    },

    { type: "theory", title: "Autocorrelazione", html: `
<p>L'<strong>autocorrelazione</strong> misura quanto una serie è correlata con sé stessa spostata di k passi. Un'autocorrelazione alta al lag 7 significa "il valore di oggi somiglia a quello di 7 giorni fa" — cioè c'è stagionalità settimanale.</p>
<pre><code>import numpy as np
# autocorrelazione al lag k, a mano:
def autocorr(serie, k):
    s = serie - serie.mean()
    return (s[k:] * s[:-k].values).sum() / (s * s).sum()</code></pre>
<p>Il grafico ACF (autocorrelation function) mostra l'autocorrelazione a tutti i lag: picchi a lag stagionali rivelano periodicità, un decadimento lento rivela un trend. È lo strumento diagnostico principe per capire la struttura di una serie e scegliere i lag da usare come feature o i parametri di ARIMA.</p>
`, more: `
<p>ACF e PACF (autocorrelazione parziale) sono complementari e insieme guidano la scelta dei parametri ARIMA. L'<strong>ACF</strong> misura la correlazione totale tra serie[t] e serie[t-k], includendo gli effetti indiretti (se t dipende da t-1 e t-1 da t-2, l'ACF al lag 2 riflette anche questa catena). La <strong>PACF</strong> isola la correlazione DIRETTA a lag k, rimuovendo gli effetti dei lag intermedi. Regola classica: la PACF che si taglia bruscamente dopo il lag p suggerisce un modello AR(p); l'ACF che si taglia dopo q suggerisce MA(q). Leggere questi due grafici è l'arte tradizionale dell'identificazione dei modelli ARIMA.</p>
<p>L'autocorrelazione è anche il motivo per cui la <strong>cross-validation casuale mente</strong> sulle serie (l'hai visto nella sala Model Evaluation): se serie[t] e serie[t-1] sono fortemente correlati, mettere t nel train e t-1 nel validation significa che il modello "vede" quasi la risposta — i due punti sono quasi lo stesso. Solo lo split temporale, che tiene tutto il passato nel train e tutto il futuro nel validation, rispetta questa dipendenza. L'autocorrelazione è la ragione profonda per cui le serie temporali hanno regole di validazione tutte loro.</p>
<p>Un'autocorrelazione che decade lentamente (resta alta per molti lag) è la firma di una serie NON stazionaria con trend: ogni valore è simile ai precedenti perché tutti seguono la stessa deriva. Dopo la differenziazione, l'ACF dovrebbe "collassare" rapidamente verso zero — è un modo grafico di verificare che la differenziazione ha funzionato. Al contrario, se dopo la differenziazione l'ACF mostra una forte correlazione negativa al lag 1, è un segnale di over-differencing: hai differenziato troppo.</p>
` },

    {
      type: "exercise", id: "ts-08", kg: 20, title: "Trovare la stagionalità nascosta",
      task: `<p>Calcola l'autocorrelazione a vari lag per scoprire il periodo stagionale nascosto nella serie:</p>
<ul>
<li><code>autocorr</code>: funzione che calcola l'autocorrelazione al lag k (fornita nello starter)</li>
<li><code>acf</code>: lista delle autocorrelazioni per lag da 1 a 10</li>
<li><code>lag_piu_correlato</code>: il lag (1-10) con autocorrelazione massima</li>
<li><code>trova_settimana</code>: <code>True</code> se il lag più correlato è 7 (la stagionalità settimanale nascosta)</li>
</ul>`,
      setup: `import numpy as np
rng = np.random.default_rng(0)
t = np.arange(140)
# stagionalita' settimanale forte + poco rumore
serie = np.sin(2 * np.pi * t / 7) * 10 + rng.normal(0, 1, 140)`,
      starter: `import numpy as np
# serie: 140 valori con periodo settimanale nascosto

def autocorr(s, k):
    s = s - s.mean()
    return float((s[k:] * s[:-k]).sum() / (s * s).sum())

acf = [autocorr(serie, k) for k in range(1, 11)]
lag_piu_correlato = ...   # il lag (1-10) col valore ACF massimo
trova_settimana = ...

print("ACF lag 1-10:", [round(v, 2) for v in acf])
print("lag piu' correlato:", lag_piu_correlato)`,
      check: `import numpy as np
def _ac(s, k):
    s = s - s.mean()
    return float((s[k:] * s[:-k]).sum() / (s * s).sum())
_acf = [_ac(serie, k) for k in range(1, 11)]
_lag = int(np.argmax(_acf)) + 1
assert 'acf' in globals() and np.allclose(acf, _acf), "acf: [autocorr(serie, k) for k in range(1, 11)]"
assert 'lag_piu_correlato' in globals() and lag_piu_correlato == _lag, "lag_piu_correlato: np.argmax(acf) + 1 (i lag partono da 1)"
assert 'trova_settimana' in globals() and trova_settimana == True and _lag == 7, "trova_settimana: True — il picco di autocorrelazione e' al lag 7, la stagionalita' settimanale"`,
      hint: `<p><code>np.argmax(acf) + 1</code> (il +1 perché la lista parte dal lag 1, non 0). Il picco a lag 7 rivela il ciclo settimanale che non si vedeva a occhio nel rumore. <code>trova_settimana = lag_piu_correlato == 7</code>.</p>`,
      solution: `import numpy as np

def autocorr(s, k):
    s = s - s.mean()
    return float((s[k:] * s[:-k]).sum() / (s * s).sum())

acf = [autocorr(serie, k) for k in range(1, 11)]
lag_piu_correlato = int(np.argmax(acf)) + 1
trova_settimana = lag_piu_correlato == 7

print("ACF lag 1-10:", [round(v, 2) for v in acf])
print("lag piu' correlato:", lag_piu_correlato)`
    },

    { type: "theory", title: "Walk-forward validation", html: `
<p>Come si valida onestamente un modello di serie temporali? Con la <strong>walk-forward validation</strong> (già incontrata come TimeSeriesSplit nella sala Model Evaluation): addestra sul passato, valida sul futuro immediato, poi sposta la finestra avanti e ripeti.</p>
<pre><code>from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(X):
    # train_idx sempre PRIMA di test_idx nel tempo
    # simula: "con i dati fino a oggi, prevedo domani"
    ...</code></pre>
<p>È l'unico modo che rispecchia l'uso reale: in produzione avrai sempre solo il passato per predire il futuro. Ogni altra validazione (k-fold casuale) sovrastima le prestazioni perché lascia il modello "sbirciare" dati futuri durante il training.</p>
`, more: `
<p>Due varianti della finestra di training nella walk-forward: <strong>espansiva</strong> (il train cresce ad ogni passo, usa tutto il passato disponibile — il default di TimeSeriesSplit) e <strong>scorrevole</strong> (finestra di lunghezza fissa che scivola in avanti, dimentica il passato remoto). L'espansiva è migliore per serie stazionarie dove tutto il passato è rilevante; la scorrevole per serie NON stazionarie dove il comportamento vecchio non è più rappresentativo (un modello di domanda post-pandemia non dovrebbe pesare troppo i dati pre-pandemia). La scelta riflette un'assunzione sulla stabilità del fenomeno nel tempo.</p>
<p>Il parametro <strong>gap</strong> (TimeSeriesSplit(gap=k)) inserisce un buco tra fine-train e inizio-validation, e serve a simulare la latenza reale: se predici le vendite di domani ma i dati di oggi si consolidano solo tra 3 giorni, al momento della predizione NON avrai gli ultimi 3 giorni — il gap lo replica in validazione. Senza gap, il backtest usa dati che in produzione non avresti ancora, sovrastimando le prestazioni. È una delle cause più sottili del divario tra backtest brillante e produzione deludente.</p>
<p>La walk-forward produce non un singolo punteggio ma UNA SERIE di punteggi (uno per finestra), e la loro evoluzione è informativa: se le prestazioni degradano verso le finestre più recenti, il modello sta invecchiando (concept drift — il fenomeno cambia e il modello non lo segue), segnale che serve riaddestramento frequente o feature diverse. Un modello di serie temporali in produzione va monitorato con questa logica walk-forward continua: riaddestra periodicamente, valida sempre sul futuro non visto, e sorveglia il degrado. Non è "addestra una volta e dimentica" — è un processo che accompagna la serie nel tempo.</p>
` },

    {
      type: "exercise", id: "ts-09", kg: 20, title: "Prevedere camminando in avanti",
      task: `<p>Valuta un modello di previsione con walk-forward su una serie con feature di lag. Confronta con la CV casuale (che sovrastima):</p>
<ul>
<li><code>X</code>, <code>y</code>: costruiti dai lag (forniti nello starter)</li>
<li><code>score_walk</code>: R² medio con <code>TimeSeriesSplit(5)</code></li>
<li><code>score_casuale</code>: R² medio con KFold casuale (shuffle=True)</li>
<li><code>casuale_ottimista</code>: <code>True</code> se <code>score_casuale &gt; score_walk</code> (la CV casuale sbircia il futuro e sovrastima)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(0)
t = np.arange(200)
serie = pd.Series(50 + 0.5 * t + 10 * np.sin(2*np.pi*t/7) + rng.normal(0, 3, 200))
df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_7"] = serie.shift(7)
df = df.dropna()
X = df[["lag_1", "lag_7"]].values
y = df["y"].values`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, TimeSeriesSplit, KFold
# X: feature di lag | y: valore corrente

score_walk = cross_val_score(LinearRegression(), X, y, cv=TimeSeriesSplit(5)).mean()
score_casuale = ...
casuale_ottimista = ...

print(f"walk-forward: {score_walk:.3f} | CV casuale: {score_casuale:.3f} | casuale ottimista: {casuale_ottimista}")`,
      check: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, TimeSeriesSplit, KFold
_sw = cross_val_score(LinearRegression(), X, y, cv=TimeSeriesSplit(5)).mean()
_sc = cross_val_score(LinearRegression(), X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
assert 'score_casuale' in globals() and abs(float(score_casuale) - _sc) < 1e-6, "score_casuale: cross_val_score con KFold(5, shuffle=True, random_state=0)"
assert 'casuale_ottimista' in globals() and casuale_ottimista == bool(_sc > _sw), "casuale_ottimista: score_casuale > score_walk — la CV casuale sovrastima"`,
      hint: `<p>Per la CV casuale: <code>cross_val_score(LinearRegression(), X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()</code>. Mescolando, il modello interpola tra punti vicini nel tempo (facile); la walk-forward deve estrapolare in avanti (onesta).</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, TimeSeriesSplit, KFold

score_walk = cross_val_score(LinearRegression(), X, y, cv=TimeSeriesSplit(5)).mean()
score_casuale = cross_val_score(LinearRegression(), X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
casuale_ottimista = score_casuale > score_walk

print(f"walk-forward: {score_walk:.3f} | CV casuale: {score_casuale:.3f} | casuale ottimista: {casuale_ottimista}")`
    },

    {
      type: "exercise", id: "ts-10", kg: 20, title: "Il baseline naive da battere",
      task: `<p>Prima di modelli complessi, stabilisci il baseline: la previsione "naive" (domani = oggi). Un modello serio deve batterla. Verifica:</p>
<ul>
<li><code>pred_naive</code>: la previsione naive per il test = il valore del giorno prima (lag_1)</li>
<li><code>mae_naive</code>: MAE della previsione naive</li>
<li><code>mae_modello</code>: MAE di una LinearRegression sui lag (train/test split temporale, primi 80% train)</li>
<li><code>modello_batte_naive</code>: <code>True</code> se <code>mae_modello &lt; mae_naive</code></li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(1)
t = np.arange(300)
serie = pd.Series(100 + 0.3*t + 15*np.sin(2*np.pi*t/7) + rng.normal(0, 3, 300))
df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_2"] = serie.shift(2)
df["lag_7"] = serie.shift(7)
df = df.dropna().reset_index(drop=True)
taglio = int(len(df) * 0.8)`,
      starter: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
# df: y + lag_1,2,7 | taglio: indice train/test (80%)

train, test = df.iloc[:taglio], df.iloc[taglio:]
X_train, y_train = train[["lag_1","lag_2","lag_7"]], train["y"]
X_test, y_test = test[["lag_1","lag_2","lag_7"]], test["y"]

# baseline naive: domani = oggi = lag_1
pred_naive = test["lag_1"]
mae_naive = mean_absolute_error(y_test, pred_naive)

modello = LinearRegression().fit(X_train, y_train)
pred_modello = modello.predict(X_test)
mae_modello = ...
modello_batte_naive = ...

print(f"MAE naive: {mae_naive:.2f} | MAE modello: {mae_modello:.2f} | modello vince: {modello_batte_naive}")`,
      check: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
_tr, _te = df.iloc[:taglio], df.iloc[taglio:]
_m = LinearRegression().fit(_tr[["lag_1","lag_2","lag_7"]], _tr["y"])
_pm = _m.predict(_te[["lag_1","lag_2","lag_7"]])
_mm = mean_absolute_error(_te["y"], _pm)
_mn = mean_absolute_error(_te["y"], _te["lag_1"])
assert 'mae_modello' in globals() and abs(float(mae_modello) - _mm) < 1e-6, "mae_modello: mean_absolute_error(y_test, pred_modello)"
assert 'modello_batte_naive' in globals() and modello_batte_naive == bool(_mm < _mn), "modello_batte_naive: mae_modello < mae_naive"
assert _mm < _mn, "il modello coi lag (che vede anche la stagionalita' via lag_7) deve battere il naive"`,
      hint: `<p>Il baseline naive (domani=oggi) è <code>test["lag_1"]</code>. Il modello coi lag, specie il lag_7, cattura la stagionalità che il naive ignora. <code>modello_batte_naive = mae_modello &lt; mae_naive</code>. Battere il naive è il primo test di ogni modello di serie.</p>`,
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

train, test = df.iloc[:taglio], df.iloc[taglio:]
X_train, y_train = train[["lag_1","lag_2","lag_7"]], train["y"]
X_test, y_test = test[["lag_1","lag_2","lag_7"]], test["y"]

pred_naive = test["lag_1"]
mae_naive = mean_absolute_error(y_test, pred_naive)

modello = LinearRegression().fit(X_train, y_train)
pred_modello = modello.predict(X_test)
mae_modello = mean_absolute_error(y_test, pred_modello)
modello_batte_naive = mae_modello < mae_naive

print(f"MAE naive: {mae_naive:.2f} | MAE modello: {mae_modello:.2f} | modello vince: {modello_batte_naive}")`
    },

    { type: "theory", title: "ARIMA e Prophet: i modelli dedicati", html: `
<p>Due modelli specifici per serie temporali (NON girano in Pyodide, ma vanno conosciuti):</p>
<p><strong>ARIMA</strong>(p,d,q) combina tre idee: <strong>AR</strong> (AutoRegressive, p) usa i valori passati; <strong>I</strong> (Integrated, d) differenzia per la stazionarietà; <strong>MA</strong> (Moving Average, q) usa gli errori passati. La sua estensione <strong>SARIMA</strong> aggiunge la stagionalità.</p>
<pre><code># concettuale (statsmodels, non in Pyodide):
# from statsmodels.tsa.arima.model import ARIMA
# model = ARIMA(serie, order=(p, d, q)).fit()
# forecast = model.forecast(steps=7)</code></pre>
<p><strong>Prophet</strong> (Meta) è pensato per il business: modella trend, stagionalità multiple (giornaliera/settimanale/annuale) e festività, è robusto ai dati mancanti e agli outlier, e richiede poca competenza statistica. Ottimo per serie con forte stagionalità e trend, meno per serie ad alta frequenza o senza struttura chiara.</p>
`, more: `
<p>ARIMA è il cavallo di battaglia statistico classico: potente, interpretabile, con solide basi teoriche e intervalli di confidenza principiati. Il costo è la competenza richiesta — scegliere (p,d,q) tradizionalmente richiede di leggere ACF/PACF e testare la stazionarietà, anche se strumenti come <code>auto_arima</code> (libreria pmdarima) automatizzano la ricerca. ARIMA assume relazioni LINEARI e una singola stagionalità; SARIMA aggiunge una stagionalità, ma per stagionalità multiple (settimanale E annuale insieme) diventa scomodo — è lì che Prophet o i modelli ML brillano.</p>
<p>Prophet ha una filosofia opposta: decompone esplicitamente la serie in trend (con punti di cambio automatici), stagionalità multiple (via serie di Fourier), effetti delle festività, il tutto in un framework bayesiano che dà intervalli di incertezza. È progettato per essere usato da analisti non-statistici e per serie di business con forte stagionalità e anni di storia. I suoi limiti: tende a sovra-lisciare, non gestisce bene le dipendenze a breve termine (autocorrelazione fine), e su serie senza chiara struttura stagionale non offre vantaggi. Non è "meglio" di ARIMA — è ottimizzato per un caso d'uso diverso.</p>
<p>Quando usare cosa, la sintesi pragmatica: per serie singole con struttura chiara e necessità di rigore statistico/intervalli affidabili, ARIMA/SARIMA; per serie di business con stagionalità multiple, festività, e priorità alla facilità d'uso, Prophet; per MOLTE serie in parallelo, feature esterne (meteo, promozioni), o relazioni non lineari, i modelli ML con feature di lag (gradient boosting in testa) — che è l'approccio che pratichi in questa sala e spesso il più flessibile in produzione moderna. E per serie complesse con grandi dati, i modelli deep dedicati (LSTM, come nella sala Deep Learning, o architetture transformer per serie). Nessun approccio domina: la scelta dipende da quante serie, quanta struttura, quanti dati, e quanto conta l'interpretabilità.</p>
` },

    {
      type: "exercise", id: "ts-11", kg: 10, title: "Quiz: ARIMA, Prophet e le regole del tempo",
      task: `<p>Cinque affermazioni sulle serie temporali. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "La 'I' di ARIMA sta per Integrated e corrisponde alla differenziazione per la stazionarietà"</li>
<li><code>a2</code>: "Su dati temporali si può usare la cross-validation casuale (shuffle) senza problemi"</li>
<li><code>a3</code>: "shift(-1) va bene come TARGET da predire, ma come feature sarebbe leakage dal futuro"</li>
<li><code>a4</code>: "Prophet è pensato per gestire stagionalità multiple e festività con poca competenza statistica"</li>
<li><code>a5</code>: "Un modello di serie temporali dovrebbe sempre battere il baseline naive (domani=oggi) per valere qualcosa"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: I = Integrated = differenziazione"
assert a2 == False, "a2 FALSA: la CV casuale mescola passato e futuro -> leakage. Serve lo split temporale"
assert a3 == True, "a3 VERA: shift(-1) e' il futuro, ok come target, leakage come feature"
assert a4 == True, "a4 VERA: Prophet e' progettato per il business, stagionalita' multiple e festivita'"
assert a5 == True, "a5 VERA: se non batti 'domani=oggi', il modello non aggiunge valore"`,
      hint: `<p>La trappola è a2: sui dati temporali la CV casuale è VIETATA (mescola i tempi). Le altre riprendono le lavagne: differenziazione (a1), shift (a3), Prophet (a4), baseline naive (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "ts-12", kg: 25, title: "MASSIMALE: previsione end-to-end",
      task: `<p>Il gran finale: costruisci un forecaster completo per una serie con trend e stagionalità, valutato onestamente e confrontato col baseline.</p>
<ul>
<li><code>df</code>: costruisci feature di lag (1, 7) e una rolling mean a 7 giorni SHIFTATA di 1 (per non guardare il presente), poi <code>dropna</code></li>
<li><code>score_cv</code>: R² medio con walk-forward (TimeSeriesSplit 5) di un HistGradientBoosting sui lag+rolling</li>
<li><code>mae_test</code>: MAE del modello sul 20% finale (split temporale)</li>
<li><code>mae_naive</code>: MAE del baseline naive (lag_1) sullo stesso test</li>
<li><code>batte_naive</code>: <code>True</code> se mae_test &lt; mae_naive</li>
<li><code>rolling_non_spia</code>: <code>True</code> — la rolling è shiftata di 1, quindi al tempo t usa solo dati fino a t-1 (booleano concettuale)</li>
</ul>`,
      setup: `import pandas as pd
import numpy as np
rng = np.random.default_rng(0)
t = np.arange(365)
serie = pd.Series(200 + 0.4*t + 30*np.sin(2*np.pi*t/7) + 20*np.sin(2*np.pi*t/30) + rng.normal(0, 5, 365))`,
      starter: `import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error
# serie: 365 giorni con trend + stagionalita' settimanale e mensile

df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_7"] = serie.shift(7)
# rolling a 7 giorni, poi shift(1): al tempo t usa la media di [t-7..t-1], MAI il presente
df["roll_7"] = serie.rolling(7).mean().shift(1)
df = df.dropna().reset_index(drop=True)

feat = ["lag_1", "lag_7", "roll_7"]
X, y = df[feat].values, df["y"].values

score_cv = cross_val_score(HistGradientBoostingRegressor(random_state=0), X, y,
                            cv=TimeSeriesSplit(5), scoring="r2").mean()

taglio = int(len(df) * 0.8)
Xtr, ytr = X[:taglio], y[:taglio]
Xte, yte = X[taglio:], y[taglio:]
modello = HistGradientBoostingRegressor(random_state=0).fit(Xtr, ytr)
mae_test = ...
mae_naive = mean_absolute_error(yte, df["lag_1"].values[taglio:])
batte_naive = ...
rolling_non_spia = ...

print(f"R2 walk-forward: {score_cv:.3f} | MAE modello {mae_test:.2f} vs naive {mae_naive:.2f} | batte naive: {batte_naive}")`,
      check: `import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
_df = pd.DataFrame({"y": serie})
_df["lag_1"] = serie.shift(1); _df["lag_7"] = serie.shift(7); _df["roll_7"] = serie.rolling(7).mean().shift(1)
_df = _df.dropna().reset_index(drop=True)
_X, _y = _df[["lag_1","lag_7","roll_7"]].values, _df["y"].values
_t = int(len(_df)*0.8)
_m = HistGradientBoostingRegressor(random_state=0).fit(_X[:_t], _y[:_t])
_mt = mean_absolute_error(_y[_t:], _m.predict(_X[_t:]))
_mn = mean_absolute_error(_y[_t:], _df["lag_1"].values[_t:])
assert 'mae_test' in globals() and abs(float(mae_test) - _mt) < 0.5, "mae_test: mean_absolute_error(yte, modello.predict(Xte))"
assert 'batte_naive' in globals() and batte_naive == bool(_mt < _mn), "batte_naive: mae_test < mae_naive"
assert 'rolling_non_spia' in globals() and rolling_non_spia == True, "rolling_non_spia: True — lo shift(1) sulla rolling evita di usare il presente"
assert _mt < _mn, "il forecaster completo deve battere il baseline naive"`,
      hint: `<p><code>mae_test = mean_absolute_error(yte, modello.predict(Xte))</code>. La chiave anti-leakage è <code>serie.rolling(7).mean().shift(1)</code>: la media mobile shiftata di 1 non include mai il valore corrente. <code>batte_naive = mae_test &lt; mae_naive</code>, <code>rolling_non_spia = True</code>.</p>`,
      solution: `import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error

df = pd.DataFrame({"y": serie})
df["lag_1"] = serie.shift(1)
df["lag_7"] = serie.shift(7)
df["roll_7"] = serie.rolling(7).mean().shift(1)
df = df.dropna().reset_index(drop=True)

feat = ["lag_1", "lag_7", "roll_7"]
X, y = df[feat].values, df["y"].values

score_cv = cross_val_score(HistGradientBoostingRegressor(random_state=0), X, y,
                            cv=TimeSeriesSplit(5), scoring="r2").mean()

taglio = int(len(df) * 0.8)
Xtr, ytr = X[:taglio], y[:taglio]
Xte, yte = X[taglio:], y[taglio:]
modello = HistGradientBoostingRegressor(random_state=0).fit(Xtr, ytr)
mae_test = mean_absolute_error(yte, modello.predict(Xte))
mae_naive = mean_absolute_error(yte, df["lag_1"].values[taglio:])
batte_naive = mae_test < mae_naive
rolling_non_spia = True

print(f"R2 walk-forward: {score_cv:.3f} | MAE modello {mae_test:.2f} vs naive {mae_naive:.2f} | batte naive: {batte_naive}")`
    }

  ]
});
