window.MODULES.push({
  id: "nlp-classico",
  name: "NLP Classico",
  tagline: "La sala delle parole: TF-IDF, BoW, stemming, BM25, embedding. Il NLP pre-LLM che i colloqui chiedono ancora.",
  intro: "Prima dei transformer c'era (e c'è ancora) il NLP classico: trasformare testo in numeri con Bag-of-Words e TF-IDF, normalizzare con stemming e stopwords, cercare con BM25, rappresentare con Word2Vec. Fondamenta che ogni data scientist deve avere. Serve scikit-learn.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Dal testo ai numeri", html: `
<p>Un modello non capisce le parole: capisce i numeri. Il problema fondante del NLP è <strong>vettorizzare</strong> il testo — trasformare documenti in vettori numerici che i modelli sanno maneggiare.</p>
<p>La pipeline classica del testo:</p>
<ol>
<li><strong>Tokenizzazione</strong>: spezzare il testo in unità (parole, di solito);</li>
<li><strong>Normalizzazione</strong>: minuscole, rimozione punteggiatura, stemming/lemmatizzazione;</li>
<li><strong>Rimozione stopwords</strong>: togliere parole troppo comuni ("il", "e", "di");</li>
<li><strong>Vettorizzazione</strong>: Bag-of-Words o TF-IDF;</li>
<li><strong>Modello</strong>: classificazione, clustering, ricerca sui vettori.</li>
</ol>
<pre><code>from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
X = CountVectorizer().fit_transform(documenti)   # matrice documenti x parole</code></pre>
`, more: `
<p>La sfida centrale del NLP classico è che il linguaggio è discreto, sparso e ad altissima dimensione: un vocabolario reale ha decine di migliaia di parole, quindi ogni documento diventa un vettore con decine di migliaia di componenti, quasi tutte zero (un documento usa poche centinaia di parole distinte). Questa <strong>sparsità</strong> guida tutte le scelte tecniche — strutture dati sparse (scipy sparse matrices, non array densi), modelli che le gestiscono bene (Naive Bayes, SVM lineari), e tecniche per ridurre la dimensione (rimozione stopwords, frequenza minima, SVD).</p>
<p>Il limite fondamentale di Bag-of-Words e TF-IDF, che motiva tutto ciò che è venuto dopo (embedding, poi transformer): <strong>ignorano l'ordine e il significato</strong>. "Il cane morde l'uomo" e "l'uomo morde il cane" hanno vettori BoW identici. "Automobile" e "macchina" sono dimensioni completamente separate, senza alcuna relazione, anche se significano la stessa cosa. Il NLP classico tratta le parole come simboli atomici senza semantica. Gli embedding (Word2Vec, fine sala) hanno iniziato a risolvere il secondo problema; i transformer (sala LLM) il primo.</p>
<p>Perché studiare il NLP classico nel 2026, nell'era degli LLM: (1) è veloce, interpretabile e leggerissimo — per classificare email o recensioni, un TF-IDF + regressione logistica gira in millisecondi e spiega le sue decisioni, dove un LLM è lento e opaco; (2) è la base concettuale su cui poggiano i modelli moderni (TF-IDF anticipa l'attenzione, gli embedding statici anticipano quelli contestuali); (3) i colloqui lo chiedono ancora, perché distingue chi capisce i fondamenti da chi sa solo chiamare un'API. Il tool giusto dipende dal problema: non serve un LLM per contare quante recensioni sono positive.</p>
` },

    {
      type: "exercise", id: "nl-01", kg: 5, title: "I passi della pipeline",
      task: `<p>Ordina i passi tipici del preprocessing testuale. Assegna a ogni fase il suo numero d'ordine (1-4):</p>
<ul>
<li><code>ord_tokenizza</code>: spezzare in parole</li>
<li><code>ord_minuscole</code>: portare in minuscolo</li>
<li><code>ord_stopwords</code>: rimuovere le parole comuni</li>
<li><code>ord_vettorizza</code>: trasformare in vettori numerici</li>
</ul>
<p>(Ordine: prima si normalizza il testo, poi si tolgono le stopwords, infine si vettorizza.)</p>`,
      starter: `ord_tokenizza = 1
ord_minuscole = ...
ord_stopwords = ...
ord_vettorizza = ...

print(ord_tokenizza, ord_minuscole, ord_stopwords, ord_vettorizza)`,
      check: `assert ord_tokenizza == 1, "tokenizzare e' il primo passo"
assert ord_minuscole == 2, "minuscole: normalizzazione, dopo la tokenizzazione"
assert ord_stopwords == 3, "stopwords: dopo aver normalizzato"
assert ord_vettorizza == 4, "vettorizzare e' l'ultimo passo, sul testo gia' pulito"`,
      hint: `<p>La logica: prima spezzi (1), poi normalizzi (2), poi pulisci togliendo il rumore delle stopwords (3), infine trasformi in numeri (4).</p>`,
      solution: `ord_tokenizza = 1
ord_minuscole = 2
ord_stopwords = 3
ord_vettorizza = 4

print(ord_tokenizza, ord_minuscole, ord_stopwords, ord_vettorizza)`
    },

    { type: "theory", title: "Bag-of-Words", html: `
<p>Il <strong>Bag-of-Words</strong> (BoW) è la vettorizzazione più semplice: conta quante volte ogni parola del vocabolario compare in ogni documento. "Bag" (sacco) perché l'ordine si perde — conta solo la presenza e la frequenza.</p>
<pre><code>from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer()
X = vec.fit_transform(documenti)   # matrice sparsa: righe=documenti, colonne=parole
vec.get_feature_names_out()        # il vocabolario appreso
X.toarray()                        # versione densa (per pochi documenti)</code></pre>
<p>Ogni documento diventa un vettore lungo quanto il vocabolario, con i conteggi delle parole. Semplice ed efficace per molti compiti (classificazione di spam, sentiment), ma con due limiti: (1) perde l'ordine ("non buono" ≈ "buono non"); (2) dà lo stesso peso a parole rare informative e a parole comuni banali — problema che il TF-IDF risolve.</p>
`, more: `
<p>Il <code>CountVectorizer</code> nasconde molte scelte importanti nei suoi parametri: <code>lowercase=True</code> (default, normalizza le maiuscole), <code>stop_words</code> (rimuove parole comuni), <code>max_features</code> (tiene solo le N parole più frequenti, controlla la dimensione), <code>min_df</code>/<code>max_df</code> (ignora parole troppo rare o troppo comuni), e <code>ngram_range</code>. Ognuno è una decisione di design: <code>min_df=2</code> elimina parole che compaiono in un solo documento (spesso refusi o hapax inutili), <code>max_df=0.9</code> elimina parole in oltre il 90% dei documenti (stopwords di fatto per quel corpus).</p>
<p>Come ogni transformer che impara dai dati, il <code>CountVectorizer</code> impara il VOCABOLARIO durante il <code>fit</code> — e va fittato SOLO sul training set. Parole presenti nel test ma assenti dal vocabolario del train vengono semplicemente ignorate (out-of-vocabulary). Fittare il vectorizer su train+test insieme è leakage: il vocabolario "vede" parole del test, e la dimensione dello spazio dipende da dati che non dovresti conoscere. È lo stesso principio "fit sul train" delle sale Feature Engineering e Model Evaluation, applicato al testo.</p>
<p>Il BoW produce matrici SPARSE (<code>scipy.sparse</code>), non array densi, ed è essenziale che resti così: un corpus di 10.000 documenti con vocabolario di 50.000 parole sarebbe una matrice densa da 500 milioni di celle (quasi tutte zero) — impraticabile. La rappresentazione sparsa memorizza solo le celle non-zero. Chiamare <code>.toarray()</code> su un corpus reale esaurisce la memoria: si fa solo su esempi giocattolo. I modelli lineari di sklearn (LogisticRegression, LinearSVC, MultinomialNB) accettano direttamente matrici sparse ed è per questo che sono i compagni naturali del BoW/TF-IDF.</p>
` },

    {
      type: "exercise", id: "nl-02", kg: 10, title: "Contare le parole",
      task: `<p>Vettorizza un piccolo corpus con il Bag-of-Words:</p>
<ul>
<li><code>X</code>: la matrice BoW (fit_transform sui documenti)</li>
<li><code>vocab</code>: il vocabolario appreso (<code>get_feature_names_out</code>)</li>
<li><code>n_parole</code>: la dimensione del vocabolario</li>
<li><code>conteggi_doc0</code>: il vettore denso (array) dei conteggi del PRIMO documento</li>
<li><code>parola_piu_frequente_doc0</code>: la parola più frequente nel primo documento</li>
</ul>`,
      setup: `documenti = [
    "il gatto dorme sul divano il gatto",
    "il cane corre nel parco",
    "gatto e cane giocano insieme",
]`,
      starter: `import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
# documenti: 3 frasi

vec = CountVectorizer()
X = ...
vocab = ...
n_parole = ...
conteggi_doc0 = X.toarray()[0]
parola_piu_frequente_doc0 = vocab[np.argmax(conteggi_doc0)]

print("vocabolario:", list(vocab))
print("conteggi doc0:", conteggi_doc0.tolist())
print("parola top doc0:", parola_piu_frequente_doc0)`,
      check: `import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
_vec = CountVectorizer(); _X = _vec.fit_transform(documenti); _v = _vec.get_feature_names_out()
assert 'X' in globals() and X.shape[0] == 3, "X: vec.fit_transform(documenti), 3 righe"
assert 'vocab' in globals() and list(vocab) == list(_v), "vocab: vec.get_feature_names_out()"
assert 'n_parole' in globals() and n_parole == len(_v), "n_parole: len(vocab)"
assert 'parola_piu_frequente_doc0' in globals() and parola_piu_frequente_doc0 == "gatto", "parola_piu_frequente_doc0: 'gatto' compare 2 volte nel primo doc (e 'il' anche, ma controlliamo gatto)" or parola_piu_frequente_doc0 == "il"`,
      hint: `<p><code>vec.fit_transform(documenti)</code> dà la matrice sparsa, <code>vec.get_feature_names_out()</code> il vocabolario ordinato alfabeticamente. <code>np.argmax(conteggi_doc0)</code> trova l'indice della parola più frequente.</p>`,
      solution: `import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer()
X = vec.fit_transform(documenti)
vocab = vec.get_feature_names_out()
n_parole = len(vocab)
conteggi_doc0 = X.toarray()[0]
parola_piu_frequente_doc0 = vocab[np.argmax(conteggi_doc0)]

print("vocabolario:", list(vocab))
print("conteggi doc0:", conteggi_doc0.tolist())
print("parola top doc0:", parola_piu_frequente_doc0)`
    },

    { type: "theory", title: "TF-IDF: pesare l'informazione", html: `
<p>Il BoW dà lo stesso peso a "il" (in ogni documento, poco informativa) e a "quantistico" (rara, molto informativa). Il <strong>TF-IDF</strong> corregge questo pesando ogni parola per la sua rarità nel corpus.</p>
<pre><code>from sklearn.feature_extraction.text import TfidfVectorizer
X = TfidfVectorizer().fit_transform(documenti)
# TF (Term Frequency): quanto la parola e' frequente NEL documento
# IDF (Inverse Document Frequency): quanto e' RARA nel corpus
# peso = TF * IDF</code></pre>
<p>L'intuizione: una parola è importante per un documento se compare spesso <em>in quel documento</em> (TF alto) ma raramente <em>negli altri</em> (IDF alto). Le parole comuni a tutti i documenti (stopwords di fatto) hanno IDF basso e vengono automaticamente sminuite. È la vettorizzazione di default per la maggior parte dei compiti testuali classici.</p>
`, more: `
<p>La formula dell'IDF chiarisce il meccanismo: idf(parola) = log(N / df(parola)), dove N è il numero di documenti e df è in quanti documenti la parola compare. Se una parola è in TUTTI i documenti (df=N), idf = log(1) = 0 — peso nullo, viene azzerata automaticamente. Se è in un solo documento su 1000, idf = log(1000) ≈ 6.9 — peso altissimo. Il logaritmo smorza: una parola dieci volte più rara non pesa dieci volte di più, ma log(10) volte. Questa è la stessa idea del log-transform (sala Feature Engineering): comprimere una scala molto ampia.</p>
<p>Il TF-IDF anticipa concettualmente l'attenzione dei transformer: entrambi assegnano PESI alle parole in base alla loro rilevanza, invece di trattarle tutte uguali. La differenza è che il TF-IDF pesa in base a statistiche globali del corpus (quanto è rara), mentre l'attenzione pesa in base al CONTESTO specifico della frase (quanto è rilevante QUI). Ma l'idea di fondo — non tutte le parole contano uguale — è la stessa, e capirla nel TF-IDF rende più intuitiva l'attenzione.</p>
<p>Dettagli pratici di <code>TfidfVectorizer</code>: applica anche la <strong>normalizzazione L2</strong> di default (ogni vettore-documento ha norma 1), il che rende i documenti di lunghezze diverse confrontabili — cruciale perché senza, un documento lungo avrebbe conteggi più alti solo per la lunghezza. Questa normalizzazione è anche ciò che rende la similarità coseno (prossima lavagna) equivalente al prodotto scalare sui vettori TF-IDF. E come il CountVectorizer, va fittato SOLO sul train: sia il vocabolario sia i pesi IDF si imparano dal training set e si applicano al test, altrimenti l'IDF "vede" la distribuzione delle parole nel test — leakage.</p>
` },

    {
      type: "exercise", id: "nl-03", kg: 15, title: "Rarità significa peso",
      task: `<p>Confronta BoW e TF-IDF: la parola comune a tutti i documenti deve avere peso TF-IDF basso, la parola rara peso alto.</p>
<ul>
<li><code>X_tfidf</code>: matrice TF-IDF (fit_transform)</li>
<li><code>vocab</code>: il vocabolario</li>
<li><code>idf</code>: i valori IDF appresi (<code>vec.idf_</code>)</li>
<li><code>idf_comune</code>: l'IDF della parola "dati" (presente in tutti i documenti — IDF basso)</li>
<li><code>idf_raro</code>: l'IDF della parola "quantistico" (in un solo documento — IDF alto)</li>
<li><code>raro_pesa_di_piu</code>: <code>True</code> se <code>idf_raro &gt; idf_comune</code></li>
</ul>`,
      setup: `documenti = [
    "i dati sono importanti per l analisi dei dati",
    "i dati aiutano le decisioni aziendali",
    "il computer quantistico elabora dati in modo nuovo",
]`,
      starter: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
# documenti: 'dati' in tutti e 3, 'quantistico' in 1 solo

vec = TfidfVectorizer()
X_tfidf = ...
vocab = list(vec.get_feature_names_out())
idf = vec.idf_

idf_comune = idf[vocab.index("dati")]
idf_raro = idf[vocab.index("quantistico")]
raro_pesa_di_piu = ...

print(f"IDF 'dati' (comune): {idf_comune:.3f} | IDF 'quantistico' (raro): {idf_raro:.3f}")`,
      check: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
_vec = TfidfVectorizer(); _vec.fit(documenti)
_v = list(_vec.get_feature_names_out())
_ic = _vec.idf_[_v.index("dati")]; _ir = _vec.idf_[_v.index("quantistico")]
assert 'X_tfidf' in globals() and X_tfidf.shape[0] == 3, "X_tfidf: vec.fit_transform(documenti)"
assert 'idf_comune' in globals() and abs(float(idf_comune) - _ic) < 1e-6, "idf_comune: vec.idf_ all'indice di 'dati'"
assert 'idf_raro' in globals() and abs(float(idf_raro) - _ir) < 1e-6, "idf_raro: vec.idf_ all'indice di 'quantistico'"
assert 'raro_pesa_di_piu' in globals() and raro_pesa_di_piu == True and _ir > _ic, "raro_pesa_di_piu: True — la parola rara ha IDF piu' alto"`,
      hint: `<p><code>vec.idf_</code> è l'array degli IDF, nell'ordine del vocabolario. Una parola in tutti i documenti ha IDF minimo, una rara IDF massimo. <code>raro_pesa_di_piu = idf_raro &gt; idf_comune</code>.</p>`,
      solution: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

vec = TfidfVectorizer()
X_tfidf = vec.fit_transform(documenti)
vocab = list(vec.get_feature_names_out())
idf = vec.idf_

idf_comune = idf[vocab.index("dati")]
idf_raro = idf[vocab.index("quantistico")]
raro_pesa_di_piu = idf_raro > idf_comune

print(f"IDF 'dati' (comune): {idf_comune:.3f} | IDF 'quantistico' (raro): {idf_raro:.3f}")`
    },

    { type: "theory", title: "Stopwords: togliere il rumore", html: `
<p>Le <strong>stopwords</strong> sono parole grammaticali ad altissima frequenza e basso contenuto informativo: articoli, preposizioni, congiunzioni ("il", "di", "e", "che"). Riempiono i testi ma raramente aiutano a distinguere argomenti o sentiment.</p>
<pre><code>from sklearn.feature_extraction.text import TfidfVectorizer
# rimozione automatica (inglese integrato in sklearn):
vec = TfidfVectorizer(stop_words="english")
# o una lista custom:
vec = TfidfVectorizer(stop_words=["il", "la", "di", "e", "che"])</code></pre>
<p>Rimuoverle riduce la dimensione del vocabolario (meno rumore, meno memoria) e spesso migliora i modelli, concentrandoli sulle parole che contano. Il TF-IDF le sminuisce già automaticamente (IDF basso), ma toglierle del tutto rende la rappresentazione più pulita ed efficiente.</p>
`, more: `
<p>La rimozione delle stopwords NON è sempre benefica, ed è un errore trattarla come passo obbligatorio. In compiti dove la struttura grammaticale conta — analisi del sentiment fine ("non buono" vs "buono"), rilevamento di negazioni, stilometria (attribuzione d'autore, che si basa proprio sulle parole funzionali!) — le stopwords portano informazione cruciale e rimuoverle danneggia. Il caso classico: "this movie is not good" senza stopwords diventa "movie good", ribaltando il sentiment. La decisione dipende dal compito, non è automatica.</p>
<p>Le liste di stopwords sono inoltre <strong>arbitrarie e discutibili</strong>: quella integrata di sklearn per l'inglese ha scelte criticate (include alcune parole potenzialmente informative), non esiste una lista "corretta" universale, e per l'italiano sklearn non ne fornisce una nativa (serve una lista custom o librerie come NLTK/spaCy). Un approccio spesso migliore e data-driven è usare <code>max_df</code>: eliminare le parole che compaiono in oltre l'X% dei documenti — così le "stopwords" emergono dal corpus specifico invece di venire imposte da una lista fissa. Le parole troppo comuni PER QUEL corpus sono le vere stopwords.</p>
<p>La sinergia con TF-IDF va capita per non fare lavoro doppio inutile: il TF-IDF già assegna peso ~0 alle parole presenti ovunque (IDF basso), quindi rimuoverle esplicitamente ha un effetto minore sui pesi rispetto al BoW puro. Il vero guadagno della rimozione con TF-IDF è la RIDUZIONE DELLA DIMENSIONE del vocabolario (meno colonne, meno memoria, modelli più veloci), non tanto il cambiamento dei pesi. Con BoW puro, invece, rimuovere le stopwords è più impattante perché lì contano coi loro conteggi pieni. Sapere questa differenza evita di credere che "togliere le stopwords" faccia sempre la stessa cosa.</p>
` },

    {
      type: "exercise", id: "nl-04", kg: 10, title: "Vocabolario più pulito",
      task: `<p>Confronta la dimensione del vocabolario con e senza stopwords italiane:</p>
<ul>
<li><code>vocab_con</code>: vocabolario SENZA rimozione stopwords (CountVectorizer base)</li>
<li><code>vocab_senza</code>: vocabolario CON rimozione di una lista di stopwords italiane</li>
<li><code>parole_rimosse</code>: quante parole in meno (differenza di dimensione)</li>
<li><code>il_e_rimosso</code>: <code>True</code> se "il" è nel vocabolario CON ma non in quello SENZA</li>
</ul>`,
      setup: `documenti = [
    "il gatto e il cane sono nel giardino",
    "la casa e il giardino sono grandi",
    "i fiori nel giardino sono belli",
]
stop_it = ["il", "la", "i", "e", "sono", "nel"]`,
      starter: `from sklearn.feature_extraction.text import CountVectorizer
# documenti + stop_it (lista di stopwords italiane)

vocab_con = list(CountVectorizer().fit(documenti).get_feature_names_out())
vocab_senza = ...   # CountVectorizer(stop_words=stop_it)
parole_rimosse = ...
il_e_rimosso = ...

print("con stopwords:", len(vocab_con), "parole")
print("senza stopwords:", len(vocab_senza), "parole")
print("'il' rimosso:", il_e_rimosso)`,
      check: `from sklearn.feature_extraction.text import CountVectorizer
_con = list(CountVectorizer().fit(documenti).get_feature_names_out())
_senza = list(CountVectorizer(stop_words=stop_it).fit(documenti).get_feature_names_out())
assert 'vocab_senza' in globals() and set(vocab_senza) == set(_senza), "vocab_senza: CountVectorizer(stop_words=stop_it)"
assert 'parole_rimosse' in globals() and parole_rimosse == len(_con) - len(_senza), "parole_rimosse: len(vocab_con) - len(vocab_senza)"
assert 'il_e_rimosso' in globals() and il_e_rimosso == True, "il_e_rimosso: True — 'il' c'e' nel vocab con ma non in quello senza"`,
      hint: `<p><code>CountVectorizer(stop_words=stop_it).fit(documenti)</code>. <code>il_e_rimosso = ("il" in vocab_con) and ("il" not in vocab_senza)</code>.</p>`,
      solution: `from sklearn.feature_extraction.text import CountVectorizer

vocab_con = list(CountVectorizer().fit(documenti).get_feature_names_out())
vocab_senza = list(CountVectorizer(stop_words=stop_it).fit(documenti).get_feature_names_out())
parole_rimosse = len(vocab_con) - len(vocab_senza)
il_e_rimosso = ("il" in vocab_con) and ("il" not in vocab_senza)

print("con stopwords:", len(vocab_con), "parole")
print("senza stopwords:", len(vocab_senza), "parole")
print("'il' rimosso:", il_e_rimosso)`
    },

    { type: "theory", title: "Stemming e lemmatizzazione", html: `
<p>"Corro", "corri", "correva", "correre" sono forme della stessa parola, ma per il BoW sono 4 parole diverse. La <strong>normalizzazione morfologica</strong> le riconduce a una forma comune. Due approcci:</p>
<ul>
<li><strong>Stemming</strong>: taglia le desinenze con regole grezze. "correre", "corro" &rarr; "corr". Veloce, ma produce radici non sempre parole reali.</li>
<li><strong>Lemmatizzazione</strong>: riduce al <em>lemma</em> (la forma da dizionario) usando conoscenza linguistica. "corro" &rarr; "correre", "migliore" &rarr; "buono". Più lenta e precisa.</li>
</ul>
<pre><code># stemming semplificato a mano (concettuale):
def stem(parola):
    for suff in ["are", "ere", "ire", "ando", "endo", "ato", "ito"]:
        if parola.endswith(suff):
            return parola[:-len(suff)]
    return parola</code></pre>
<p>Entrambe riducono il vocabolario unificando le forme, aiutando i modelli a vedere "corro" e "correre" come la stessa cosa.</p>
`, more: `
<p>La differenza pratica tra stemming e lemmatizzazione è velocità contro correttezza. Lo <strong>stemming</strong> (Porter, Snowball) applica regole di taglio puramente sintattiche, ignorando il significato: veloce, deterministico, ma produce "stem" che spesso non sono parole ("univers" da "universale"/"università" — che per giunta accorpa parole di significato diverso!). La <strong>lemmatizzazione</strong> usa dizionari e analisi grammaticale (serve sapere che "migliore" è comparativo di "buono", che "corse" è verbo o sostantivo a seconda del contesto): risultati linguisticamente corretti, ma più lenta e dipendente dalla lingua e dal contesto (POS tagging).</p>
<p>Il beneficio è la riduzione della sparsità: unificando le forme flesse, ogni "concetto" occupa una sola dimensione invece di molte, i conteggi si concentrano, e il modello generalizza meglio (vede "correre" e "corro" come evidenza dello stesso fenomeno). Su lingue morfologicamente ricche come l'italiano — con coniugazioni verbali estese, generi, numeri — l'effetto è molto più marcato che sull'inglese, dove le forme flesse sono poche. Per l'italiano lo stemming/lemmatizzazione è quasi sempre utile; per l'inglese il guadagno è minore.</p>
<p>Nell'era dei transformer, questa normalizzazione è in gran parte OBSOLETA: i modelli moderni usano la <strong>tokenizzazione a sub-word</strong> (BPE, WordPiece — sala LLM), che spezza le parole in pezzi frequenti ("correre" → "corr" + "ere") gestendo la morfologia implicitamente e senza perdere informazione. E gli embedding contestuali capiscono che forme diverse sono correlate senza bisogno di ridurle alla stessa stringa. Stemming e lemmatizzazione restano rilevanti per le pipeline classiche (TF-IDF + modello lineare) dove sono ancora efficaci ed economiche — ma sapere che i modelli moderni le hanno superate, e come (sub-word tokenization), è la risposta completa da colloquio.</p>
` },

    {
      type: "exercise", id: "nl-05", kg: 15, title: "Unificare le forme",
      task: `<p>Implementa uno stemmer italiano grezzo e verifica che riduca il vocabolario unificando le forme verbali:</p>
<ul>
<li><code>stem</code>: funzione che taglia i suffissi (fornita nello starter)</li>
<li><code>parole_originali</code>: set delle parole grezze in <code>testo.split()</code></li>
<li><code>parole_stemmate</code>: set delle parole dopo lo stemming</li>
<li><code>vocab_ridotto</code>: <code>True</code> se lo stemming ha ridotto il numero di parole distinte</li>
<li><code>corro_e_correre_uguali</code>: <code>True</code> se <code>stem("corro")</code> == <code>stem("correre")</code> (unificate)</li>
</ul>`,
      setup: `testo = "corro correre corri gioco giocare giochi salto saltare"`,
      starter: `# testo: parole con forme verbali diverse

def stem(parola):
    for suff in ["are", "ere", "ire", "ando", "endo", "ato", "ito", "o", "i", "a"]:
        if parola.endswith(suff) and len(parola) - len(suff) >= 3:
            return parola[:-len(suff)]
    return parola

parole_originali = set(testo.split())
parole_stemmate = set(stem(p) for p in testo.split())
vocab_ridotto = ...
corro_e_correre_uguali = ...

print("originali:", len(parole_originali), sorted(parole_originali))
print("stemmate:", len(parole_stemmate), sorted(parole_stemmate))`,
      check: `def _stem(parola):
    for suff in ["are","ere","ire","ando","endo","ato","ito","o","i","a"]:
        if parola.endswith(suff) and len(parola)-len(suff) >= 3:
            return parola[:-len(suff)]
    return parola
_orig = set(testo.split()); _stem_set = set(_stem(p) for p in testo.split())
assert 'parole_stemmate' in globals() and parole_stemmate == _stem_set, "parole_stemmate: set(stem(p) for p in testo.split())"
assert 'vocab_ridotto' in globals() and vocab_ridotto == bool(len(_stem_set) < len(_orig)), "vocab_ridotto: len(parole_stemmate) < len(parole_originali)"
assert 'corro_e_correre_uguali' in globals() and corro_e_correre_uguali == bool(_stem("corro") == _stem("correre")), "corro_e_correre_uguali: stem('corro') == stem('correre')"
assert len(_stem_set) < len(_orig), "lo stemming deve ridurre il vocabolario"`,
      hint: `<p>Applica <code>stem</code> a ogni parola. <code>vocab_ridotto = len(parole_stemmate) &lt; len(parole_originali)</code>. <code>corro_e_correre_uguali = stem("corro") == stem("correre")</code> — entrambe dovrebbero dare "corr".</p>`,
      solution: `def stem(parola):
    for suff in ["are", "ere", "ire", "ando", "endo", "ato", "ito", "o", "i", "a"]:
        if parola.endswith(suff) and len(parola) - len(suff) >= 3:
            return parola[:-len(suff)]
    return parola

parole_originali = set(testo.split())
parole_stemmate = set(stem(p) for p in testo.split())
vocab_ridotto = len(parole_stemmate) < len(parole_originali)
corro_e_correre_uguali = stem("corro") == stem("correre")

print("originali:", len(parole_originali), sorted(parole_originali))
print("stemmate:", len(parole_stemmate), sorted(parole_stemmate))`
    },

    { type: "theory", title: "N-grammi: recuperare un po' d'ordine", html: `
<p>Il BoW perde l'ordine: "non buono" e "buono" hanno le stesse parole. Gli <strong>n-grammi</strong> recuperano parte del contesto contando sequenze di n parole consecutive invece di singole parole.</p>
<pre><code>from sklearn.feature_extraction.text import CountVectorizer
# unigrammi + bigrammi (1 e 2 parole):
vec = CountVectorizer(ngram_range=(1, 2))
# "non buono" genera: "non", "buono", "non buono"</code></pre>
<p>Un <strong>bigramma</strong> ("non buono", "molto bello") cattura combinazioni che le singole parole perdono. Cruciale per il sentiment: "non buono" come bigramma ha significato opposto a "buono" da solo. Il prezzo è l'esplosione del vocabolario — con i bigrammi le colonne si moltiplicano, e con i trigrammi ancora di più.</p>
`, more: `
<p>Il trade-off degli n-grammi è netto: catturano contesto locale (negazioni, collocazioni, nomi propri composti) al costo di un'esplosione dimensionale e di maggiore sparsità. Ogni bigramma è più raro di ogni unigramma (una coppia specifica compare meno di ciascuna parola), quindi la matrice diventa più grande E più sparsa — molti bigrammi compaiono una volta sola e sono rumore. Per questo con gli n-grammi diventa quasi obbligatorio usare <code>min_df</code> (scarta n-grammi troppo rari) e <code>max_features</code> (limita la dimensione), altrimenti si overfitta su combinazioni casuali.</p>
<p>La scelta del range: <code>ngram_range=(1,2)</code> (unigrammi + bigrammi) è il punto di partenza ragionevole per la maggior parte dei compiti — cattura le negazioni e le collocazioni comuni senza esplodere troppo. Trigrammi e oltre raramente ripagano su testi normali (troppo sparsi), ma sono utili in domini con espressioni fisse lunghe (linguaggio legale, medico) o per compiti come il language modeling classico. Gli n-grammi di CARATTERI (<code>analyzer='char'</code>), invece di parole, sono sorprendentemente efficaci per lingue morfologicamente ricche, per gestire refusi, e per compiti come l'identificazione della lingua.</p>
<p>Gli n-grammi sono il tentativo del NLP classico di catturare l'ordine, ed è un tentativo LIMITATO: colgono solo il contesto locale (n parole adiacenti), non le dipendenze a lunga distanza ("il film che avevo tanto aspettato dopo mesi di attesa si è rivelato NON all'altezza" — la negazione è lontana dal soggetto). È esattamente questa limitazione che i modelli sequenziali (RNN/LSTM, sala Deep Learning) e poi l'attenzione dei transformer (sala LLM) hanno superato, potendo collegare parole a qualsiasi distanza. Gli n-grammi sono un ponte pragmatico tra il BoW senza ordine e i modelli che l'ordine lo capiscono davvero.</p>
` },

    {
      type: "exercise", id: "nl-06", kg: 15, title: "La negazione conta",
      task: `<p>Dimostra perché i bigrammi contano per il sentiment. Con solo unigrammi, "non buono" e "buono" si confondono:</p>
<ul>
<li><code>vocab_uni</code>: vocabolario con solo unigrammi</li>
<li><code>vocab_bi</code>: vocabolario con unigrammi + bigrammi (<code>ngram_range=(1,2)</code>)</li>
<li><code>ha_non_buono</code>: <code>True</code> se "non buono" è un termine nel vocabolario con bigrammi</li>
<li><code>bi_piu_grande</code>: <code>True</code> se il vocabolario con bigrammi è più grande di quello con soli unigrammi</li>
</ul>`,
      setup: `documenti = [
    "il film e buono",
    "il film non e buono",
    "molto buono davvero",
]`,
      starter: `from sklearn.feature_extraction.text import CountVectorizer
# documenti: alcuni con negazione

vocab_uni = list(CountVectorizer().fit(documenti).get_feature_names_out())
vocab_bi = ...   # ngram_range=(1, 2)
ha_non_buono = ...
bi_piu_grande = ...

print("unigrammi:", len(vocab_uni))
print("con bigrammi:", len(vocab_bi))
print("'non buono' presente:", ha_non_buono)`,
      check: `from sklearn.feature_extraction.text import CountVectorizer
_uni = list(CountVectorizer().fit(documenti).get_feature_names_out())
_bi = list(CountVectorizer(ngram_range=(1,2)).fit(documenti).get_feature_names_out())
assert 'vocab_bi' in globals() and set(vocab_bi) == set(_bi), "vocab_bi: CountVectorizer(ngram_range=(1,2))"
assert 'ha_non_buono' in globals() and ha_non_buono == ("non buono" in _bi), "ha_non_buono: 'non buono' in vocab_bi"
assert ha_non_buono == True, "il bigramma 'non buono' deve comparire nel vocabolario"
assert 'bi_piu_grande' in globals() and bi_piu_grande == True, "bi_piu_grande: True — i bigrammi aggiungono colonne"`,
      hint: `<p><code>CountVectorizer(ngram_range=(1,2))</code> genera unigrammi e bigrammi. <code>ha_non_buono = "non buono" in vocab_bi</code>. Il bigramma cattura la negazione che l'unigramma "buono" da solo perde.</p>`,
      solution: `from sklearn.feature_extraction.text import CountVectorizer

vocab_uni = list(CountVectorizer().fit(documenti).get_feature_names_out())
vocab_bi = list(CountVectorizer(ngram_range=(1, 2)).fit(documenti).get_feature_names_out())
ha_non_buono = "non buono" in vocab_bi
bi_piu_grande = len(vocab_bi) > len(vocab_uni)

print("unigrammi:", len(vocab_uni))
print("con bigrammi:", len(vocab_bi))
print("'non buono' presente:", ha_non_buono)`
    },

    { type: "theory", title: "Similarità coseno", html: `
<p>Come si misura quanto due documenti sono simili, dai loro vettori? La <strong>similarità coseno</strong>: il coseno dell'angolo tra i due vettori. Va da -1 (opposti) a 1 (identici in direzione), con 0 = ortogonali (nessuna parola in comune).</p>
<pre><code>from sklearn.metrics.pairwise import cosine_similarity
sim = cosine_similarity(X)   # matrice di similarita' tra tutti i documenti
# per due vettori a mano:
# cos = (a . b) / (|a| * |b|)</code></pre>
<p>Perché il coseno e non la distanza euclidea? Perché misura la <strong>direzione</strong> ignorando la lunghezza: due documenti sullo stesso tema, uno lungo e uno corto, hanno vettori di magnitudine diversa ma stessa direzione — il coseno li vede simili, la distanza euclidea li vedrebbe lontani. È la metrica standard per testo, ricerca e sistemi di raccomandazione.</p>
`, more: `
<p>L'insensibilità alla lunghezza è la proprietà chiave per il testo: un articolo di 1000 parole e un tweet di 20 sullo stesso argomento condividono le stesse parole in proporzioni simili (stessa direzione nel vettore-parole) ma hanno magnitudini molto diverse. Il coseno coglie che sono simili nel CONTENUTO; la distanza euclidea sarebbe dominata dalla differenza di lunghezza. Nota che sui vettori TF-IDF, già normalizzati L2 (norma 1), la similarità coseno si riduce al semplice prodotto scalare — motivo per cui TF-IDF e coseno vanno così spesso insieme.</p>
<p>Il coseno è il cuore della <strong>ricerca semantica</strong> e dei <strong>sistemi RAG</strong> (che hai incontrato nella sala omonima): rappresenti la query e i documenti come vettori, calcoli la similarità coseno tra query e ogni documento, restituisci i più simili. Con TF-IDF questa è ricerca lessicale (parole in comune); con gli embedding densi (Word2Vec, o i moderni embedding di frase) diventa ricerca SEMANTICA — trova documenti sul tema anche se usano parole diverse. Lo stesso strumento matematico, il coseno, opera su rappresentazioni via via più ricche.</p>
<p>Limiti da conoscere: il coseno su vettori TF-IDF è ancora <strong>lessicale</strong> — due documenti che dicono la stessa cosa con parole diverse ("automobile veloce" vs "macchina rapida") hanno coseno basso, perché non condividono termini. È la stessa limitazione del BoW: nessuna semantica. Inoltre in spazi ad altissima dimensione (vocabolari grandi) quasi tutti i vettori sparsi tendono a essere quasi-ortogonali (coseno vicino a 0), un aspetto della maledizione della dimensionalità che rende le similarità poco discriminanti — un motivo in più per ridurre la dimensione o passare a embedding densi. Capire quando il coseno lessicale basta e quando serve quello semantico è la competenza pratica.</p>
` },

    {
      type: "exercise", id: "nl-07", kg: 15, title: "Quanto si somigliano",
      task: `<p>Calcola la similarità coseno tra documenti TF-IDF e trova la coppia più simile:</p>
<ul>
<li><code>X</code>: matrice TF-IDF dei documenti</li>
<li><code>sim</code>: matrice di similarità coseno (<code>cosine_similarity(X)</code>)</li>
<li><code>sim_0_1</code>: la similarità tra il documento 0 e il documento 1 (stesso tema: gatti)</li>
<li><code>sim_0_2</code>: la similarità tra il documento 0 e il documento 2 (tema diverso: cucina)</li>
<li><code>stesso_tema_piu_simile</code>: <code>True</code> se <code>sim_0_1 &gt; sim_0_2</code></li>
</ul>`,
      setup: `documenti = [
    "il gatto dorme e il gatto gioca",
    "il gatto corre veloce nel giardino",
    "la ricetta della pasta con pomodoro fresco",
]`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# doc 0 e 1 parlano di gatti, doc 2 di cucina

X = TfidfVectorizer().fit_transform(documenti)
sim = ...
sim_0_1 = sim[0, 1]
sim_0_2 = sim[0, 2]
stesso_tema_piu_simile = ...

print(f"sim(gatti, gatti) = {sim_0_1:.3f} | sim(gatti, cucina) = {sim_0_2:.3f}")
print("stesso tema piu' simile:", stesso_tema_piu_simile)`,
      check: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
_X = TfidfVectorizer().fit_transform(documenti)
_s = cosine_similarity(_X)
assert 'sim' in globals() and _s.shape == (3, 3), "sim: cosine_similarity(X)"
assert 'sim_0_1' in globals() and abs(float(sim_0_1) - _s[0,1]) < 1e-6, "sim_0_1: sim[0, 1]"
assert 'sim_0_2' in globals() and abs(float(sim_0_2) - _s[0,2]) < 1e-6, "sim_0_2: sim[0, 2]"
assert 'stesso_tema_piu_simile' in globals() and stesso_tema_piu_simile == True and _s[0,1] > _s[0,2], "stesso_tema_piu_simile: True — i due doc sui gatti condividono parole, quello di cucina no"`,
      hint: `<p><code>cosine_similarity(X)</code> dà la matrice 3×3 di tutte le similarità. I due documenti sui gatti condividono "gatto", quello di cucina no. <code>stesso_tema_piu_simile = sim_0_1 &gt; sim_0_2</code>.</p>`,
      solution: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

X = TfidfVectorizer().fit_transform(documenti)
sim = cosine_similarity(X)
sim_0_1 = sim[0, 1]
sim_0_2 = sim[0, 2]
stesso_tema_piu_simile = sim_0_1 > sim_0_2

print(f"sim(gatti, gatti) = {sim_0_1:.3f} | sim(gatti, cucina) = {sim_0_2:.3f}")
print("stesso tema piu' simile:", stesso_tema_piu_simile)`
    },

    { type: "theory", title: "BM25: il TF-IDF dei motori di ricerca", html: `
<p><strong>BM25</strong> (Best Matching 25) è l'evoluzione del TF-IDF per la ricerca: è la funzione di ranking che ha dominato i motori di ricerca (Elasticsearch, Lucene) per decenni. Migliora il TF-IDF con due correzioni chiave.</p>
<pre><code># concettuale — per ogni parola della query nel documento:
# 1. SATURAZIONE della term frequency: dopo un po', ripetere una
#    parola conta sempre meno (rendimenti decrescenti, param k1)
# 2. NORMALIZZAZIONE per la lunghezza del documento: i documenti
#    lunghi non vengono premiati solo perche' contengono piu' parole (param b)</code></pre>
<p>Nel TF-IDF puro, una parola ripetuta 100 volte pesa 100 volte tanto — irrealistico. BM25 <strong>satura</strong>: le prime occorrenze contano molto, le successive sempre meno. E penalizza i documenti lunghi che "barano" contenendo tante parole. È tuttora un baseline fortissimo, spesso competitivo con la ricerca neurale.</p>
`, more: `
<p>La <strong>saturazione</strong> (parametro k1, tipicamente 1.2-2.0) corregge un difetto reale del TF-IDF: un documento che ripete "python" 50 volte non è 50 volte più rilevante di uno che lo dice una volta — dopo poche occorrenze, la rilevanza aggiuntiva svanisce. BM25 modella questo con una funzione che cresce ma si appiattisce (rendimenti decrescenti), matematicamente tf/(tf+k1). È più realistico di come gli umani giudicano la rilevanza: la presenza conta molto, la ripetizione ossessiva poco.</p>
<p>La <strong>normalizzazione per lunghezza</strong> (parametro b, tipicamente ~0.75) impedisce ai documenti lunghi di vincere solo perché contengono più parole e quindi più occorrenze dei termini di query. Senza di essa, un documento enorme e poco focalizzato batterebbe uno breve e perfettamente centrato. BM25 pesa la term frequency rispetto alla lunghezza media dei documenti del corpus. Con b=0 nessuna normalizzazione, con b=1 normalizzazione piena — 0.75 è il compromesso empirico che ha retto decenni.</p>
<p>La rilevanza duratura di BM25 nel 2026 è una lezione importante contro l'iper-entusiasmo per il neurale: nonostante la ricerca semantica con embedding densi, BM25 resta un baseline fortissimo e spesso i sistemi migliori sono IBRIDI — combinano BM25 (ricerca lessicale, ottima per termini esatti, nomi propri, codici) con embedding densi (ricerca semantica, ottima per sinonimi e parafrasi). BM25 eccelle dove le parole esatte contano (cerca "errore 404" e vuoi proprio quello); il denso eccelle dove conta il significato. Nei sistemi RAG moderni (sala omonima) il retrieval ibrido BM25+denso con re-ranking è lo stato dell'arte pratico — non il denso da solo. Conoscere BM25 non è archeologia: è ingegneria attuale.</p>
` },

    {
      type: "exercise", id: "nl-08", kg: 20, title: "La saturazione di BM25",
      task: `<p>Implementa la componente di saturazione di BM25 e confrontala col TF lineare del BoW. Dimostra i rendimenti decrescenti:</p>
<ul>
<li><code>bm25_tf</code>: funzione <code>tf * (k1+1) / (tf + k1)</code> con k1=1.5 (fornita)</li>
<li><code>tf_lineari</code>: lista dei valori TF grezzi [1, 2, 5, 10, 50] (il BoW puro)</li>
<li><code>tf_saturati</code>: gli stessi valori passati per <code>bm25_tf</code></li>
<li><code>satura</code>: <code>True</code> se l'incremento da tf=1 a tf=2 è MAGGIORE dell'incremento da tf=10 a tf=50 nella versione saturata (rendimenti decrescenti)</li>
<li><code>lineare_non_satura</code>: <code>True</code> se nel TF lineare l'incremento da 10 a 50 (=40) è maggiore di quello da 1 a 2 (=1)</li>
</ul>`,
      setup: `tf_valori = [1, 2, 5, 10, 50]`,
      starter: `# tf_valori: term frequency da testare
k1 = 1.5

def bm25_tf(tf):
    return tf * (k1 + 1) / (tf + k1)

tf_lineari = tf_valori
tf_saturati = [bm25_tf(tf) for tf in tf_valori]

# incrementi nella versione saturata
inc_sat_1_2 = tf_saturati[1] - tf_saturati[0]     # da tf=1 a tf=2
inc_sat_10_50 = tf_saturati[4] - tf_saturati[3]   # da tf=10 a tf=50
satura = ...

# incrementi nel TF lineare
lineare_non_satura = ...

print("TF lineari:", tf_lineari)
print("TF saturati:", [round(v, 2) for v in tf_saturati])
print(f"satura (rend. decrescenti): {satura} | lineare non satura: {lineare_non_satura}")`,
      check: `k1 = 1.5
def _b(tf): return tf*(k1+1)/(tf+k1)
_sat = [_b(t) for t in [1,2,5,10,50]]
assert 'tf_saturati' in globals() and all(abs(tf_saturati[i]-_sat[i])<1e-9 for i in range(5)), "tf_saturati: [bm25_tf(tf) for tf in tf_valori]"
assert 'satura' in globals() and satura == bool((_sat[1]-_sat[0]) > (_sat[4]-_sat[3])), "satura: l'incremento 1->2 supera quello 10->50 (rendimenti decrescenti)"
assert satura == True, "BM25 deve saturare: le prime occorrenze contano piu' delle successive"
assert 'lineare_non_satura' in globals() and lineare_non_satura == True, "lineare_non_satura: True — nel TF grezzo l'incremento 10->50 (=40) supera 1->2 (=1)"`,
      hint: `<p>Nella versione saturata, passare da 1 a 2 occorrenze aumenta molto il peso, da 10 a 50 quasi nulla (saturazione). <code>satura = inc_sat_1_2 &gt; inc_sat_10_50</code>. Nel TF lineare è l'opposto: <code>lineare_non_satura = (50-10) &gt; (2-1)</code>.</p>`,
      solution: `k1 = 1.5

def bm25_tf(tf):
    return tf * (k1 + 1) / (tf + k1)

tf_lineari = tf_valori
tf_saturati = [bm25_tf(tf) for tf in tf_valori]

inc_sat_1_2 = tf_saturati[1] - tf_saturati[0]
inc_sat_10_50 = tf_saturati[4] - tf_saturati[3]
satura = inc_sat_1_2 > inc_sat_10_50

lineare_non_satura = (tf_lineari[4] - tf_lineari[3]) > (tf_lineari[1] - tf_lineari[0])

print("TF lineari:", tf_lineari)
print("TF saturati:", [round(v, 2) for v in tf_saturati])
print(f"satura (rend. decrescenti): {satura} | lineare non satura: {lineare_non_satura}")`
    },

    {
      type: "exercise", id: "nl-09", kg: 20, title: "Classificare recensioni",
      task: `<p>Metti insieme il NLP classico: TF-IDF + regressione logistica per classificare il sentiment. Addestra su tutto il corpus e valuta su recensioni NUOVE che riusano il vocabolario appreso.</p>
<ul>
<li><code>pipe</code>: <code>Pipeline</code> con <code>TfidfVectorizer</code> + <code>LogisticRegression</code>, addestrata su <code>testi</code>/<code>etichette</code></li>
<li><code>pred_eval</code>: le predizioni sulle 4 recensioni di valutazione <code>eval_testi</code></li>
<li><code>acc</code>: accuratezza rispetto a <code>eval_et</code> (le etichette vere)</li>
<li><code>funziona</code>: <code>True</code> se acc &gt; 0.7</li>
</ul>`,
      setup: `import numpy as np
pos = ["ottimo prodotto", "molto bello e utile", "consigliatissimo perfetto", "eccellente qualita", "davvero soddisfatto felice", "fantastico lo adoro", "super comodo ottimo", "bellissimo funziona benissimo"]
neg = ["pessimo non funziona", "terribile spreco di soldi", "delusione totale rotto", "orribile da evitare", "scarso non lo consiglio", "malissimo difettoso", "brutto e inutile", "deludente qualita scadente"]
testi = pos + neg
etichette = [1]*len(pos) + [0]*len(neg)
# recensioni nuove che riusano parole del training
eval_testi = ["prodotto eccellente e ottimo", "terribile spreco totale", "bellissimo lo adoro", "pessimo e inutile"]
eval_et = [1, 0, 1, 0]`,
      starter: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
# testi/etichette: training | eval_testi/eval_et: valutazione (parole gia' viste)

pipe = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression()),
])
pipe.fit(testi, etichette)

pred_eval = ...
acc = (np.array(pred_eval) == np.array(eval_et)).mean()
funziona = ...

print("predizioni:", list(pred_eval), "| attese:", eval_et)
print(f"accuratezza: {acc:.2f} | funziona: {funziona}")`,
      check: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
_p = Pipeline([("tfidf", TfidfVectorizer()), ("clf", LogisticRegression())]).fit(testi, etichette)
_pe = _p.predict(eval_testi)
_a = (np.array(_pe) == np.array(eval_et)).mean()
assert 'pred_eval' in globals() and list(np.array(pred_eval)) == list(_pe), "pred_eval: pipe.predict(eval_testi)"
assert 'acc' in globals() and abs(float(acc) - float(_a)) < 1e-9, "acc: (pred_eval == eval_et).mean()"
assert 'funziona' in globals() and funziona == True and _a > 0.7, "funziona: True — TF-IDF + LogReg classifica bene le recensioni con vocabolario noto"`,
      hint: `<p>Addestra su tutto (<code>pipe.fit(testi, etichette)</code>), poi <code>pipe.predict(eval_testi)</code>. Le frasi di valutazione riusano parole del training, quindi il TF-IDF le riconosce. <code>funziona = acc &gt; 0.7</code>.</p>`,
      solution: `import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression()),
])
pipe.fit(testi, etichette)

pred_eval = pipe.predict(eval_testi)
acc = (np.array(pred_eval) == np.array(eval_et)).mean()
funziona = acc > 0.7

print("predizioni:", list(pred_eval), "| attese:", eval_et)
print(f"accuratezza: {acc:.2f} | funziona: {funziona}")`
    },

    { type: "theory", title: "Word2Vec e gli embedding di parole", html: `
<p>TF-IDF e BoW hanno un limite semantico: "automobile" e "macchina" sono dimensioni separate, senza alcuna relazione. Gli <strong>embedding di parole</strong> (Word2Vec, GloVe, FastText) risolvono questo: ogni parola diventa un vettore denso in cui parole di significato simile hanno vettori vicini.</p>
<pre><code># Word2Vec impara dai contesti (non gira in Pyodide, concettuale):
# "il ___ abbaia" -> il modello impara che "cane" ci sta bene
# risultato: vettori dove vec(re) - vec(uomo) + vec(donna) ~ vec(regina)</code></pre>
<p>L'idea (ipotesi distribuzionale): <em>una parola è definita dalle compagnie che frequenta</em>. Parole che appaiono in contesti simili ("cane" e "gatto" appaiono entrambe vicino a "animale", "domestico", "coda") ottengono vettori simili. Il risultato famoso: le relazioni semantiche diventano operazioni vettoriali (re - uomo + donna ≈ regina).</p>
`, more: `
<p>Word2Vec (2013, Mikolov) ha due architetture: <strong>CBOW</strong> (predice una parola dal suo contesto) e <strong>Skip-gram</strong> (predice il contesto da una parola). Entrambe addestrano una rete neurale semplice su un compito "finto" — non interessa la predizione in sé, ma i PESI intermedi, che diventano gli embedding. È un caso di apprendimento auto-supervisionato: il testo stesso fornisce la supervisione (le parole vicine), senza etichette umane. GloVe (Stanford) arriva agli stessi risultati partendo dalle statistiche di co-occorrenza globali invece che dai contesti locali.</p>
<p>Il salto concettuale dagli embedding rispetto al BoW/TF-IDF è passare da rappresentazioni <strong>sparse e ad alta dimensione</strong> (decine di migliaia di dimensioni, una per parola, quasi tutte zero) a rappresentazioni <strong>dense e a bassa dimensione</strong> (tipicamente 100-300 dimensioni, tutte piene di significato). E soprattutto: le dimensioni catturano SEMANTICA. La ricerca, la classificazione, il clustering fatti su embedding trovano relazioni che il lessicale non vede — "il film era noioso" e "la pellicola risultava tediosa" sono vicini nello spazio degli embedding pur non condividendo parole.</p>
<p>I limiti di Word2Vec, superati dai transformer: gli embedding sono <strong>statici</strong> — ogni parola ha UN vettore fisso, indipendentemente dal contesto. "Riso" (cereale) e "riso" (del verbo ridere) condividono lo stesso vettore, mescolando due significati. FastText mitiga in parte lavorando su sub-word (gestisce parole mai viste e morfologia). Ma è stata l'attenzione dei transformer (sala LLM) a dare embedding CONTESTUALI: lo stesso token ha vettori diversi a seconda della frase, risolvendo l'ambiguità. Word2Vec resta però importante — leggero, veloce, interpretabile, e concettualmente il ponte tra il NLP simbolico e quello neurale. Capire "una parola è le sue compagnie" è capire la radice di tutto il NLP moderno.</p>
` },

    {
      type: "exercise", id: "nl-10", kg: 20, title: "L'aritmetica del significato",
      task: `<p>Simula il famoso "re - uomo + donna ≈ regina" con embedding giocattolo costruiti a mano, usando la similarità coseno per trovare la parola più vicina al vettore risultante:</p>
<ul>
<li><code>risultato</code>: il vettore <code>vec["re"] - vec["uomo"] + vec["donna"]</code></li>
<li><code>similarita</code>: dizionario parola &rarr; cosine similarity tra <code>risultato</code> e il vettore di ogni parola candidata (esclusi re/uomo/donna)</li>
<li><code>parola_piu_vicina</code>: la parola candidata più simile al risultato</li>
<li><code>trova_regina</code>: <code>True</code> se <code>parola_piu_vicina == "regina"</code></li>
</ul>`,
      setup: `import numpy as np
# embedding giocattolo 2D: [regalita', femminilita']
vec = {
    "re":     np.array([0.9, 0.1]),
    "uomo":   np.array([0.1, 0.1]),
    "donna":  np.array([0.1, 0.9]),
    "regina": np.array([0.9, 0.9]),
    "cane":   np.array([0.2, 0.3]),
    "trono":  np.array([0.7, 0.4]),
}`,
      starter: `import numpy as np
# vec: embedding giocattolo delle parole

def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

risultato = ...   # vec["re"] - vec["uomo"] + vec["donna"]

candidati = ["regina", "cane", "trono"]
similarita = {p: cos(risultato, vec[p]) for p in candidati}
parola_piu_vicina = max(similarita, key=similarita.get)
trova_regina = ...

print("risultato:", risultato)
print("similarita':", {k: round(v, 3) for k, v in similarita.items()})
print("parola piu' vicina:", parola_piu_vicina)`,
      check: `import numpy as np
def _cos(a, b): return float(a @ b / (np.linalg.norm(a)*np.linalg.norm(b)))
_r = vec["re"] - vec["uomo"] + vec["donna"]
_sim = {p: _cos(_r, vec[p]) for p in ["regina","cane","trono"]}
_pv = max(_sim, key=_sim.get)
assert 'risultato' in globals() and np.allclose(risultato, _r), "risultato: vec['re'] - vec['uomo'] + vec['donna']"
assert 'parola_piu_vicina' in globals() and parola_piu_vicina == _pv, "parola_piu_vicina: max per similarita'"
assert 'trova_regina' in globals() and trova_regina == True and _pv == "regina", "trova_regina: True — l'aritmetica vettoriale porta a 'regina'"`,
      hint: `<p>Il vettore risultante è <code>vec["re"] - vec["uomo"] + vec["donna"]</code>: parte dalla regalità del re, toglie la componente "uomo", aggiunge "donna" &rarr; regalità + femminilità = regina. <code>trova_regina = parola_piu_vicina == "regina"</code>.</p>`,
      solution: `import numpy as np

def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

risultato = vec["re"] - vec["uomo"] + vec["donna"]

candidati = ["regina", "cane", "trono"]
similarita = {p: cos(risultato, vec[p]) for p in candidati}
parola_piu_vicina = max(similarita, key=similarita.get)
trova_regina = parola_piu_vicina == "regina"

print("risultato:", risultato)
print("similarita':", {k: round(v, 3) for k, v in similarita.items()})
print("parola piu' vicina:", parola_piu_vicina)`
    },

    {
      type: "exercise", id: "nl-11", kg: 15, title: "Quiz: NLP classico vs moderno",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Bag-of-Words e TF-IDF perdono l'ordine delle parole"</li>
<li><code>a2</code>: "Nel TF-IDF, una parola presente in tutti i documenti ha IDF alto e quindi peso alto"</li>
<li><code>a3</code>: "BM25 satura la term frequency: ripetere una parola conta sempre meno"</li>
<li><code>a4</code>: "Gli embedding Word2Vec statici danno alla stessa parola lo stesso vettore in ogni contesto"</li>
<li><code>a5</code>: "La similarità coseno ignora la lunghezza dei documenti, guardando solo la direzione"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: BoW/TF-IDF sono 'sacchi' di parole, l'ordine si perde"
assert a2 == False, "a2 FALSA: parola in TUTTI i documenti -> IDF BASSO (log(N/N)=0) -> peso basso"
assert a3 == True, "a3 VERA: la saturazione e' la correzione chiave di BM25"
assert a4 == True, "a4 VERA: Word2Vec e' statico, un vettore per parola. I transformer danno embedding contestuali"
assert a5 == True, "a5 VERA: il coseno misura l'angolo (direzione), non la magnitudine (lunghezza)"`,
      hint: `<p>La trappola è a2: parola comune a TUTTI = IDF basso (non alto), quindi sminuita. Le altre riprendono le lavagne: ordine perso (a1), saturazione BM25 (a3), embedding statici (a4), coseno e lunghezza (a5).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "nl-12", kg: 25, title: "MASSIMALE: motore di ricerca lessicale",
      task: `<p>Il gran finale: costruisci un mini motore di ricerca. Data una query, trova i documenti più rilevanti con TF-IDF + similarità coseno (ricerca lessicale, il cuore di ogni search engine classico).</p>
<ul>
<li><code>vec</code>: <code>TfidfVectorizer</code> addestrato sul corpus</li>
<li><code>X</code>: matrice TF-IDF del corpus</li>
<li><code>q_vec</code>: il vettore TF-IDF della query (usa <code>vec.transform</code>, NON fit!)</li>
<li><code>similarita</code>: array di cosine similarity tra query e ogni documento</li>
<li><code>top2_idx</code>: gli indici dei 2 documenti più rilevanti (decrescente)</li>
<li><code>miglior_doc</code>: il testo del documento più rilevante</li>
<li><code>trova_tema_giusto</code>: <code>True</code> se il miglior documento contiene la parola "machine" (la query è sul machine learning)</li>
</ul>`,
      setup: `corpus = [
    "il gatto e il cane sono animali domestici",
    "machine learning e deep learning per la classificazione",
    "la ricetta della pizza margherita con mozzarella",
    "reti neurali e machine learning nei modelli predittivi",
    "il calcio e lo sport piu' seguito in italia",
]
query = "machine learning modelli"`,
      starter: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# corpus: 5 documenti | query: la ricerca

vec = TfidfVectorizer()
X = vec.fit_transform(corpus)
q_vec = ...   # vec.transform([query]) — NON fit, il vocabolario e' gia' appreso!
similarita = cosine_similarity(q_vec, X)[0]
top2_idx = np.argsort(similarita)[::-1][:2]
miglior_doc = corpus[top2_idx[0]]
trova_tema_giusto = ...

print("similarita':", np.round(similarita, 3))
print("miglior documento:", miglior_doc)`,
      check: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
_v = TfidfVectorizer(); _X = _v.fit_transform(corpus)
_q = _v.transform([query])
_sim = cosine_similarity(_q, _X)[0]
_top = np.argsort(_sim)[::-1][:2]
assert 'q_vec' in globals() and q_vec.shape[0] == 1, "q_vec: vec.transform([query]) — transform, non fit_transform"
assert 'similarita' in globals() and np.allclose(similarita, _sim), "similarita: cosine_similarity(q_vec, X)[0]"
assert 'top2_idx' in globals() and list(top2_idx) == list(_top), "top2_idx: np.argsort(similarita)[::-1][:2]"
assert 'trova_tema_giusto' in globals() and trova_tema_giusto == True, "trova_tema_giusto: True — il doc top contiene 'machine', tema della query"
assert "machine" in corpus[_top[0]], "il documento piu' rilevante deve essere sul machine learning"`,
      hint: `<p>La query si vettorizza con <code>vec.transform([query])</code> — MAI fit, altrimenti reimpari il vocabolario sulla query. <code>cosine_similarity(q_vec, X)[0]</code> dà la rilevanza di ogni documento. <code>trova_tema_giusto = "machine" in miglior_doc</code>.</p>`,
      solution: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

vec = TfidfVectorizer()
X = vec.fit_transform(corpus)
q_vec = vec.transform([query])
similarita = cosine_similarity(q_vec, X)[0]
top2_idx = np.argsort(similarita)[::-1][:2]
miglior_doc = corpus[top2_idx[0]]
trova_tema_giusto = "machine" in miglior_doc

print("similarita':", np.round(similarita, 3))
print("miglior documento:", miglior_doc)`
    }

  ]
});
