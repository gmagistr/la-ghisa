window.MODULES.push({
  id: "rag",
  name: "Sistemi RAG",
  tagline: "La sala circuito finale: pesca le informazioni giuste prima di rispondere, invece di improvvisare.",
  intro: "Un LLM sa solo ciò che ha visto in addestramento, congelato a una certa data — e non conosce i tuoi documenti privati. Il RAG (Retrieval-Augmented Generation) risolve il problema pescando i passaggi più rilevanti da una base di conoscenza e infilandoli nel prompt, prima di generare la risposta. Qui costruisci un RAG vero, a pezzi, con TF-IDF e scikit-learn — nessun mock, ogni numero è reale.",
  packages: ["scikit-learn"],
  items: [

    { type: "theory", title: "Il problema che il RAG risolve", html: `
<p>Chiedi a un modello linguistico qualcosa sui tuoi documenti interni, o su un evento successo dopo il suo addestramento: o inventa una risposta plausibile ma falsa (<strong>allucinazione</strong>), o ammette di non saperlo. Il <strong>RAG</strong> aggira il problema senza riaddestrare nulla: prima di generare, cerca nella tua base di conoscenza i passaggi pertinenti, poi li allega al prompt come contesto.</p>
<pre><code>domanda = "Qual e' la politica di rimborso?"
contesto = cerca_nei_documenti(domanda)        # passaggi rilevanti, trovati per somiglianza
prompt = f"Contesto: {contesto}\\n\\nDomanda: {domanda}"
risposta = modello.genera(prompt)              # ora risponde CON le informazioni giuste sottomano</code></pre>
<p>Il modello genera ancora testo liberamente, ma <em>ancorato</em> a fatti recuperati — non alla sua memoria interna, spesso incompleta o obsoleta. Il cuore del sistema, quindi, è tutto nel "cerca": prima ancora del generare, bisogna saper <strong>trovare</strong> le informazioni giuste. Le prossime serie costruiscono esattamente quel motore di ricerca.</p>
`, more: `
<p>Il RAG è spesso l'alternativa più economica e veloce al fine-tuning (visto nella sala LLM Toolkit) per "insegnare" a un modello informazioni nuove o specifiche: invece di ri-addestrare pesi (costoso, lento, richiede dati di addestramento formattati appositamente), basta aggiungere documenti alla base di conoscenza — un aggiornamento che richiede secondi, non ore di calcolo su GPU. Il compromesso: il modello non "impara" davvero quelle informazioni, le legge di nuovo ogni volta dal contesto fornito.</p>
<p>Il termine "allucinazione" descrive un comportamento intrinseco di come questi modelli generano testo: prevedono il token più probabile in base a schemi statistici appresi, non consultano un database di fatti verificati. Un modello può produrre un fatto plausibile-suonante ma completamente inventato con la stessa fluidità di uno vero — non c'è un segnale interno di "incertezza" evidente che distingua i due casi, motivo per cui ancorare la risposta a testo effettivamente recuperato (non generato) è una difesa strutturale, non solo un trucco.</p>
<p>Il RAG non elimina completamente il rischio di allucinazione: un modello può ancora ignorare il contesto fornito, mischiarlo con la propria "memoria" interna, o interpretarlo male. Istruzioni esplicite nel prompt ("rispondi SOLO usando le informazioni nel contesto", vista nella teoria sull'aumento del prompt di questa sala) riducono ma non azzerano questo rischio — è un miglioramento sostanziale, non una garanzia assoluta.</p>
` },

    {
      type: "exercise", id: "rag-01", kg: 5, title: "Ricerca ingenua per parole in comune",
      task: `<p>Prima di usare strumenti seri, prova l'approccio più semplice possibile: contare le parole condivise tra domanda e documento. Hai <code>kb</code> (una lista di frasi, la "base di conoscenza") e <code>domanda</code>. Scrivi:</p>
<ul>
<li><code>punteggi</code>: lista di interi, per ogni documento il numero di parole in comune con la domanda (minuscolo, split sullo spazio, usa gli insiemi)</li>
<li><code>migliore_idx</code>: l'indice del documento col punteggio più alto</li>
</ul>`,
      starter: `kb = [
    "il riscaldamento riduce il rischio di infortuni",
    "la dieta ricca di proteine aiuta i muscoli",
    "dormire bene migliora il recupero",
]
domanda = "come riduco il rischio di farmi male in palestra"

parole_domanda = set(domanda.lower().split())

punteggi = []
for doc in kb:
    ...

migliore_idx = ...

print(punteggi)
print(migliore_idx, kb[migliore_idx])`,
      check: `assert 'punteggi' in globals() and len(punteggi) == 3, "punteggi deve avere 3 valori, uno per documento"
assert punteggi[0] >= 2, "Il primo documento condivide almeno 'il' e 'rischio' con la domanda"
assert 'migliore_idx' in globals() and migliore_idx == 0, "migliore_idx: il documento sul riscaldamento condivide piu' parole con la domanda sul rischio di infortuni"`,
      hint: `<p>Per ogni documento: <code>len(parole_domanda &amp; set(doc.lower().split()))</code> conta le parole condivise. Poi <code>punteggi.index(max(punteggi))</code> trova la posizione del massimo.</p>`,
      solution: `kb = [
    "il riscaldamento riduce il rischio di infortuni",
    "la dieta ricca di proteine aiuta i muscoli",
    "dormire bene migliora il recupero",
]
domanda = "come riduco il rischio di farmi male in palestra"

parole_domanda = set(domanda.lower().split())

punteggi = []
for doc in kb:
    parole_doc = set(doc.lower().split())
    punteggi.append(len(parole_domanda & parole_doc))

migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(migliore_idx, kb[migliore_idx])`
    },

    { type: "theory", title: "Chunking: spezzare prima di cercare", html: `
<p>I documenti veri sono lunghi: un intero manuale non entra (e non conviene farlo entrare) in un singolo confronto di ricerca. Si spezza tutto in <strong>chunk</strong> — pezzi piccoli e autonomi, l'unità minima che il sistema recupera e restituisce.</p>
<pre><code>def chunk_per_parole(testo, dimensione=6):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]</code></pre>
<p>Chunk troppo grandi diluiscono la rilevanza (il pezzo giusto è sepolto in mezzo a roba irrilevante); chunk troppo piccoli perdono il contesto necessario per essere comprensibili da soli. Non esiste una dimensione perfetta universale — è un compromesso che si tara sul tipo di documento.</p>
`, more: `
<p>Spezzare per numero fisso di parole (come nell'esempio) è la strategia più semplice ma ignora la struttura del testo: può tagliare a metà una frase, o separare un titolo dal paragrafo che introduce. Strategie più sofisticate spezzano per unità semantiche naturali — paragrafi, sezioni delimitate da titoli, singole frasi complete — preservando meglio il significato di ogni chunk anche a costo di dimensioni irregolari tra un chunk e l'altro.</p>
<p>Il chunking con overlap (visto in un esercizio di questa sala) è un compromesso comune: un piccolo overlap (10-20% della dimensione del chunk) riduce il rischio di tagliare informazioni a metà senza moltiplicare eccessivamente il numero totale di chunk — un overlap troppo grande fa quasi raddoppiare i chunk (e quindi lo spazio occupato e il tempo di ricerca) senza benefici proporzionali.</p>
<p>La dimensione ottimale del chunk dipende dal tipo di documento e dal modello che consumerà il contesto: documenti tecnici densi di informazione spesso beneficiano di chunk più piccoli (l'informazione rilevante è concentrata), narrativa o documentazione discorsiva di chunk più grandi (il significato dipende dal contesto circostante). In pratica, si tara sperimentalmente misurando la qualità del retrieval su un set di domande di test — lo stesso principio della metrica precision@k vista più avanti in questa sala.</p>
` },

    {
      type: "exercise", id: "rag-02", kg: 10, title: "Spezza il documento",
      task: `<p>Scrivi <code>chunk_per_parole(testo, dimensione)</code> che spezza <code>testo</code> in blocchi di <code>dimensione</code> parole ciascuno (l'ultimo può essere più corto). Poi:</p>
<ul>
<li><code>chunks</code>: <code>documento</code> spezzato con <code>dimensione=5</code></li>
<li><code>n_chunks</code>: quanti chunk sono stati creati</li>
</ul>`,
      starter: `documento = "il riscaldamento prima di sollevare pesi riduce il rischio di infortuni e prepara i muscoli allo sforzo"

def chunk_per_parole(testo, dimensione=6):
    parole = testo.split()
    ...

chunks = ...
n_chunks = ...

print(chunks)
print(n_chunks)`,
      check: `assert 'chunk_per_parole' in globals() and callable(chunk_per_parole), "Devi definire chunk_per_parole"
assert 'chunks' in globals() and len(chunks[0].split()) == 5, "Ogni chunk (tranne forse l'ultimo) deve avere 5 parole"
assert chunks[0] == "il riscaldamento prima di sollevare", "Il primo chunk deve essere le prime 5 parole"
assert 'n_chunks' in globals() and n_chunks == len(chunks) and n_chunks == 4, "Il documento ha 18 parole: con dimensione 5 fa 4 chunk (5+5+5+3)"`,
      hint: `<p>Una list comprehension con passo: <code>[" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]</code> — lo stesso slicing a passi visto in NumPy, applicato a una lista di parole.</p>`,
      solution: `documento = "il riscaldamento prima di sollevare pesi riduce il rischio di infortuni e prepara i muscoli allo sforzo"

def chunk_per_parole(testo, dimensione=6):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]

chunks = chunk_per_parole(documento, dimensione=5)
n_chunks = len(chunks)

print(chunks)
print(n_chunks)`
    },

    { type: "theory", title: "TF-IDF: trasformare il testo in vettori", html: `
<p>Contare le parole in comune (come nella prima serie) è cieco: la parola "il" conta quanto "infortuni", anche se la seconda porta molta più informazione. <strong>TF-IDF</strong> pesa ogni parola per quanto è rara nell'intera collezione: le parole comuni (articoli, congiunzioni) pesano poco, quelle specifiche pesano molto. Il risultato è un vettore numerico per ogni documento — la sua "embedding" più semplice possibile.</p>
<pre><code>from sklearn.feature_extraction.text import TfidfVectorizer
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)   # una matrice sparsa: righe=documenti, colonne=parole del vocabolario
doc_vecs.shape                      # (n_documenti, dimensione_vocabolario)
vect.vocabulary_                    # dizionario parola -> indice di colonna</code></pre>
<p><code>fit_transform</code> fa due cose in una: <code>fit</code> impara il vocabolario dalla collezione, <code>transform</code> converte i testi in vettori. Per un testo nuovo (una query) si userà solo <code>transform</code>, con il vocabolario già imparato — esattamente come lo <code>StandardScaler</code> di scikit-learn.</p>
`, more: `
<p>Il nome TF-IDF viene dalla combinazione di due fattori moltiplicati insieme: <strong>TF</strong> (Term Frequency, quante volte una parola appare in QUEL documento specifico — più appare, più probabilmente è centrale al contenuto) e <strong>IDF</strong> (Inverse Document Frequency, quanto è RARA quella parola nell'intera collezione — una parola che appare in tutti i documenti, come "il" o "di", ha IDF basso e viene penalizzata; una parola rara, presente in pochi documenti, ha IDF alto e viene valorizzata).</p>
<p>Come lo <code>StandardScaler</code>, <code>TfidfVectorizer</code> deve essere fittato SOLO sulla collezione di riferimento (il train, concettualmente), mai su dati che includono già la query di test — lo stesso principio del data leakage visto nella sala Scikit-learn Avanzato si applica identico qui: il vocabolario "vero" è quello della base di conoscenza, non quello arricchito dalle domande che farai in futuro.</p>
<p><code>doc_vecs</code> è una <strong>matrice sparsa</strong>, non un array NumPy denso: la stragrande maggioranza delle celle sono zero (ogni documento usa solo una piccola frazione dell'intero vocabolario), e scikit-learn la rappresenta in un formato che non spreca memoria su tutti quegli zeri. Operazioni come <code>cosine_similarity</code> sanno lavorare direttamente su questo formato sparso, ma se serve ispezionarla come array normale serve <code>.toarray()</code>, che materializza tutti gli zeri espliciti — sconsigliato su vocabolari grandi per il consumo di memoria che comporta.</p>
` },

    {
      type: "exercise", id: "rag-03", kg: 15, title: "Vettorizza la base di conoscenza",
      task: `<p>Sulla base di conoscenza <code>kb</code> (5 documenti):</p>
<ul>
<li><code>vect</code>: un <code>TfidfVectorizer()</code> addestrato con <code>fit_transform</code> su <code>kb</code></li>
<li><code>doc_vecs</code>: la matrice risultante</li>
<li><code>dimensione_vocabolario</code>: quante parole distinte ha imparato il vettorizzatore (da <code>doc_vecs.shape</code>)</li>
</ul>`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
    "Una dieta ricca di proteine aiuta la crescita muscolare dopo l allenamento",
    "Dormire almeno sette ore per notte migliora il recupero muscolare",
    "Lo stretching dopo l allenamento mantiene la flessibilita articolare",
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
]

vect = ...
doc_vecs = ...
dimensione_vocabolario = ...

print(doc_vecs.shape)
print(dimensione_vocabolario)`,
      check: `from sklearn.feature_extraction.text import TfidfVectorizer as _TV
assert 'vect' in globals() and isinstance(vect, _TV), "vect: TfidfVectorizer()"
assert 'doc_vecs' in globals() and doc_vecs.shape[0] == 5, "doc_vecs: vect.fit_transform(kb) — 5 righe, una per documento"
assert 'dimensione_vocabolario' in globals() and dimensione_vocabolario == doc_vecs.shape[1] and dimensione_vocabolario > 20, "dimensione_vocabolario: doc_vecs.shape[1]"`,
      hint: `<p><code>vect.fit_transform(kb)</code> restituisce direttamente la matrice; non serve chiamare <code>fit</code> e <code>transform</code> separatamente la prima volta.</p>`,
      solution: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
    "Una dieta ricca di proteine aiuta la crescita muscolare dopo l allenamento",
    "Dormire almeno sette ore per notte migliora il recupero muscolare",
    "Lo stretching dopo l allenamento mantiene la flessibilita articolare",
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
]

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
dimensione_vocabolario = doc_vecs.shape[1]

print(doc_vecs.shape)
print(dimensione_vocabolario)`
    },

    { type: "theory", title: "Cosine similarity: quanto due vettori puntano nella stessa direzione", html: `
<p>Per confrontare la query con ogni documento serve una misura di somiglianza tra vettori. La <strong>similarità del coseno</strong> guarda solo la <em>direzione</em> dei due vettori, non la loro lunghezza — ideale per il testo, dove un documento più lungo non deve "vincere" solo perché ha numeri più grandi:</p>
<pre><code>from sklearn.metrics.pairwise import cosine_similarity
query_vec = vect.transform([domanda])       # stesso vocabolario del fit, SOLO transform
sims = cosine_similarity(query_vec, doc_vecs)[0]   # un punteggio (0-1) per ogni documento</code></pre>
<p>Il risultato è 1.0 per vettori identici in direzione, 0.0 per vettori senza nessuna parola in comune. È l'evoluzione naturale del conteggio ingenuo di parole condivise della prima serie — stessa idea, pesata meglio.</p>
`, more: `
<p>Esistono altre misure di distanza/similarità tra vettori (euclidea, Manhattan, viste in NumPy), ma per il testo la coseno è quasi sempre preferita perché ignora la LUNGHEZZA del documento: un documento molto più lungo di un altro, ma sullo stesso argomento, avrebbe una norma euclidea molto diversa (più parole, numeri più grandi) pur puntando nella stessa "direzione semantica" — la distanza euclidea penalizzerebbe ingiustamente quella differenza di lunghezza, la coseno no.</p>
<p><code>cosine_similarity</code> di scikit-learn può confrontare in un colpo solo UNA query contro TUTTI i documenti (come negli esempi di questa sala) ma anche una matrice di query contro una matrice di documenti, restituendo una griglia completa di similarità — utile quando devi valutare più domande insieme, come nell'esercizio "rispondi a più domande in batch" di questa sala.</p>
<p>Una proprietà utile della coseno per il debug: quando la query e un documento non condividono NESSUNA parola del vocabolario, la similarità è esattamente 0.0, non un numero piccolo ma diverso da zero — un segnale chiaro e inequivocabile di "nessuna sovrapposizione lessicale", distinguibile a colpo d'occhio da una sovrapposizione debole ma presente (es. 0.05).</p>
` },

    {
      type: "exercise", id: "rag-04", kg: 15, title: "Trova il documento più pertinente",
      task: `<p>Con <code>vect</code> e <code>doc_vecs</code> già pronti (fittati su <code>kb</code>), rispondi a <code>domanda</code>:</p>
<ul>
<li><code>query_vec</code>: la domanda trasformata con <code>vect.transform</code> (attenzione: <code>transform</code>, non <code>fit_transform</code> — il vocabolario è già imparato)</li>
<li><code>sims</code>: l'array delle similarità coseno tra la domanda e ogni documento</li>
<li><code>migliore</code>: il testo del documento più simile</li>
</ul>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
    "Una dieta ricca di proteine aiuta la crescita muscolare dopo l allenamento",
    "Dormire almeno sette ore per notte migliora il recupero muscolare",
    "Lo stretching dopo l allenamento mantiene la flessibilita articolare",
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "Perche e importante bere acqua quando ci si allena"`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda sono gia' pronti

query_vec = ...
sims = ...
migliore = ...

print(sims.round(3))
print(migliore)`,
      check: `import numpy as np
assert 'sims' in globals() and len(np.ravel(sims)) == 5, "sims: cosine_similarity(query_vec, doc_vecs)[0] — 5 valori, uno per documento"
assert 'migliore' in globals() and "acqua" in migliore.lower(), "migliore: il documento sull'idratazione deve vincere — condivide 'acqua', 'allenamento' con la domanda"`,
      hint: `<p><code>vect.transform([domanda])</code> (nota la lista con un solo elemento). Poi <code>cosine_similarity(query_vec, doc_vecs)[0]</code> dà un array 1D. <code>kb[sims.argmax()]</code> pesca il testo vincente.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, doc_vecs)[0]
migliore = kb[sims.argmax()]

print(sims.round(3))
print(migliore)`
    },

    { type: "theory", title: "Top-k: non fermarsi al primo", html: `
<p>Spesso conviene recuperare i <strong>k</strong> documenti più simili, non solo il primo: danno più contesto al modello e coprono il caso in cui la risposta sia spezzata su più passaggi. Stesso pattern <code>argsort</code> + inversione visto in NumPy:</p>
<pre><code>ordine = np.argsort(sims)[::-1]     # indici dal piu' simile al meno
top_k_idx = ordine[:k]
top_k_doc = [kb[i] for i in top_k_idx]</code></pre>
<p>Nota importante: la similarità lessicale di TF-IDF non è comprensione — trova sovrapposizioni di parole, non significati equivalenti. Un sistema di produzione userebbe spesso <em>embedding densi</em> (vettori da un modello neurale) al posto di TF-IDF per catturare meglio il significato; qui TF-IDF resta perfetto per capire il meccanismo, perché ogni numero è ispezionabile a mano.</p>
`, more: `
<p>La scelta del valore di <code>k</code> è essa stessa un compromesso: k troppo piccolo rischia di perdere informazione pertinente sparsa su più chunk; k troppo grande diluisce il contesto con passaggi marginalmente rilevanti, sprecando token (e denaro, se paghi per token) e rischiando di "confondere" il modello con troppo materiale, parte del quale irrilevante alla domanda specifica.</p>
<p>Il limite lessicale di TF-IDF illustrato in questa teoria (una domanda formulata con sinonimi o parafrasi non trova il documento "giusto" a senso umano) è precisamente il motivo per cui i sistemi RAG di produzione usano quasi sempre <strong>embedding densi</strong> prodotti da modelli neurali specializzati (es. <code>sentence-transformers</code>), che catturano somiglianza SEMANTICA invece che lessicale — un salto qualitativo enorme rispetto a TF-IDF sui casi in cui domanda e documento non condividono le stesse parole.</p>
<p>In un sistema di produzione reale, i vettori dei documenti (non ricalcolati ad ogni query, a differenza di questi esercizi che li rifittano ogni volta) vengono salvati in un <strong>database vettoriale</strong> dedicato (Pinecone, Weaviate, Chroma, Qdrant, o estensioni vettoriali di database esistenti come pgvector per Postgres) che indicizza i vettori per rendere la ricerca del "vicino più prossimo" efficiente anche su milioni di documenti — un semplice ciclo di confronto uno-a-uno, come quello implicito in <code>cosine_similarity</code> su una matrice piccola, non scala oltre poche migliaia di documenti.</p>
` },

    {
      type: "exercise", id: "rag-05", kg: 20, title: "Recupera i primi due",
      task: `<p>Scrivi la funzione <code>top_k(domanda, k, vect, doc_vecs, kb)</code> che restituisce la lista dei <code>k</code> documenti più simili alla domanda, dal più al meno simile. Poi usala su <code>domanda2</code> con <code>k=2</code>, salvando il risultato in <code>risultati</code>.</p>
<p>Nota: questa domanda è scritta in modo indiretto (parla di "recupero muscoli"), un buon test dei limiti della similarità lessicale.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
    "Una dieta ricca di proteine aiuta la crescita muscolare dopo l allenamento",
    "Dormire almeno sette ore per notte migliora il recupero muscolare",
    "Lo stretching dopo l allenamento mantiene la flessibilita articolare",
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda2 = "Come recupero meglio i muscoli dopo la palestra"`,
      starter: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda2 sono gia' pronti

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = ...
    top_idx = ...
    return [kb[i] for i in top_idx]

risultati = top_k(domanda2, 2, vect, doc_vecs, kb)
print(risultati)`,
      check: `assert 'risultati' in globals() and len(risultati) == 2, "risultati deve avere 2 documenti"
assert risultati[0] == kb[3], "Il documento piu' simile a questa domanda e' lo stretching (idx 3): condivide 'muscoli/muscolare' e 'allenamento/palestra' a livello lessicale"
assert risultati[1] == kb[1], "Il secondo e' quello sulla dieta (idx 1): anche lui condivide 'muscolare' e 'allenamento'"`,
      hint: `<p><code>np.argsort(sims)[::-1][:k]</code> dà gli indici dei k documenti più simili, in ordine. Sorpresa istruttiva: il documento "giusto" a senso umano (dormire/recupero) qui NON vince, perché TF-IDF conta parole condivise, non significati — un limite reale di questa tecnica.</p>`,
      solution: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = np.argsort(sims)[::-1]
    top_idx = ordine[:k]
    return [kb[i] for i in top_idx]

risultati = top_k(domanda2, 2, vect, doc_vecs, kb)
print(risultati)`
    },

    { type: "theory", title: "Aumentare il prompt: dal recupero al testo finale", html: `
<p>L'ultimo passo prima della generazione: incollare i chunk recuperati dentro un prompt template (esattamente il concetto della sala LLM Toolkit), così il modello li riceve come contesto esplicito.</p>
<pre><code>template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
prompt_finale = template.format(contesto=contesto, domanda=domanda)</code></pre>
<p>Da qui in poi il lavoro passa al modello linguistico (reale, non nella nostra palestra): il RAG ha fatto il suo mestiere, che è tutto <em>prima</em> della generazione. La qualità della risposta finale non può superare la qualità di ciò che è stato recuperato: "garbage in, garbage out" vale doppio in un sistema RAG.</p>
`, more: `
<p>Le istruzioni esplicite nel template ("rispondi usando SOLO le informazioni nel contesto") non sono decorazione: senza di esse, un modello capace tende a mescolare quanto recuperato con la propria "conoscenza" interna, vanificando parte del vantaggio del RAG (ancorare la risposta a fatti verificabili). Istruzioni più forti ("se il contesto non contiene la risposta, dì che non lo sai" — vista nell'esercizio sulla soglia di rilevanza di questa sala) riducono ulteriormente il rischio di risposte inventate quando il retrieval non ha trovato nulla di utile.</p>
<p>Includere le CITAZIONI (quale chunk ha prodotto quale informazione, viste in più esercizi di questa sala) nel prompt finale non serve solo a rendere la risposta verificabile dall'utente finale: aiuta anche il modello stesso a essere più preciso, perché può fare riferimento esplicito a "secondo il documento [2]..." invece di sintetizzare in modo vago fonti multiple indistinte.</p>
<p>Un template ben progettato per il RAG bilancia due esigenze in tensione: essere abbastanza esplicito da vincolare il comportamento del modello (formato, uso esclusivo del contesto), ma abbastanza conciso da non sprecare token preziosi in istruzioni ripetute identiche ad ogni chiamata — lo stesso compromesso costo/qualità visto per i parametri di generazione nella sala LLM Toolkit.</p>
` },

    {
      type: "exercise", id: "rag-06", kg: 20, title: "Componi il prompt aumentato",
      task: `<p>Con <code>documenti_recuperati</code> (già pronti, 2 chunk) e <code>domanda</code>, costruisci:</p>
<ul>
<li><code>contesto</code>: i documenti uniti in una stringa, ciascuno preceduto da <code>"- "</code> e separato da a-capo</li>
<li><code>prompt_finale</code>: il template compilato con <code>contesto</code> e <code>domanda</code></li>
</ul>`,
      starter: `documenti_recuperati = [
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
]
domanda = "Perche e importante bere acqua in palestra?"

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

contesto = ...
prompt_finale = ...

print(prompt_finale)`,
      check: `assert 'contesto' in globals() and contesto == "- Bere acqua a sufficienza durante l allenamento previene la disidratazione\\n- Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni", "contesto: ogni doc preceduto da '- ', uniti con '\\\\n'.join(...)"
assert 'prompt_finale' in globals() and "Contesto:" in prompt_finale and contesto in prompt_finale and domanda in prompt_finale, "prompt_finale: template.format(contesto=contesto, domanda=domanda)"`,
      hint: `<p><code>"\\n".join(f"- {doc}" for doc in documenti_recuperati)</code> costruisce il contesto riga per riga. Poi <code>template.format(contesto=contesto, domanda=domanda)</code>.</p>`,
      solution: `documenti_recuperati = [
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
]
domanda = "Perche e importante bere acqua in palestra?"

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
prompt_finale = template.format(contesto=contesto, domanda=domanda)

print(prompt_finale)`
    },

    {
      type: "exercise", id: "rag-07", kg: 25, title: "Massimale: la pipeline RAG completa",
      task: `<p>Metti insieme ogni pezzo della sala in una sola funzione, <code>rag_pipeline(domanda, kb, k=2)</code>, che:</p>
<ul>
<li>Crea un <code>TfidfVectorizer</code>, fitta su <code>kb</code></li>
<li>Trova i <code>k</code> documenti più simili alla domanda (come in <code>top_k</code>)</li>
<li>Costruisce il <code>contesto</code> (righe con <code>"- "</code>) e il prompt finale con il <code>template</code> fornito</li>
<li>Restituisce una <strong>tupla</strong> <code>(prompt, documenti_recuperati)</code></li>
</ul>
<p>Testala su <code>domanda_test</code> e salva il risultato in <code>prompt_risultato</code> e <code>docs_risultato</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

kb = [
    "Il riscaldamento prima di sollevare pesi riduce il rischio di infortuni",
    "Una dieta ricca di proteine aiuta la crescita muscolare dopo l allenamento",
    "Dormire almeno sette ore per notte migliora il recupero muscolare",
    "Lo stretching dopo l allenamento mantiene la flessibilita articolare",
    "Bere acqua a sufficienza durante l allenamento previene la disidratazione",
    "Allenarsi con carichi progressivi e la chiave della crescita di forza nel tempo",
]

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

domanda_test = "Come posso evitare la disidratazione mentre mi alleno"`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
# kb, template, domanda_test sono gia' pronti

def rag_pipeline(domanda, kb, k=2):
    vect = TfidfVectorizer()
    doc_vecs = vect.fit_transform(kb)

    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    top_idx = np.argsort(sims)[::-1][:k]
    documenti_recuperati = [kb[i] for i in top_idx]

    contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
    prompt = template.format(contesto=contesto, domanda=domanda)

    return prompt, documenti_recuperati

prompt_risultato, docs_risultato = rag_pipeline(domanda_test, kb, k=2)
print(prompt_risultato)`,
      check: `assert 'docs_risultato' in globals() and len(docs_risultato) == 2, "docs_risultato deve avere 2 documenti"
assert docs_risultato[0] == kb[4], "Il documento sull'idratazione (idx 4) deve essere il piu' rilevante per questa domanda"
assert 'prompt_risultato' in globals() and "Contesto:" in prompt_risultato and "Rispondi usando SOLO" in prompt_risultato, "prompt_risultato deve usare il template fornito"
assert kb[4] in prompt_risultato, "Il documento piu' rilevante deve comparire dentro il prompt finale"`,
      hint: `<p>È la somma esatta delle serie precedenti in una funzione sola: vettorizza, calcola le similarità, ordina, prendi i top-k, componi il contesto, riempi il template.</p>`,
      solution: `def rag_pipeline(domanda, kb, k=2):
    vect = TfidfVectorizer()
    doc_vecs = vect.fit_transform(kb)

    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    top_idx = np.argsort(sims)[::-1][:k]
    documenti_recuperati = [kb[i] for i in top_idx]

    contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
    prompt = template.format(contesto=contesto, domanda=domanda)

    return prompt, documenti_recuperati

prompt_risultato, docs_risultato = rag_pipeline(domanda_test, kb, k=2)
print(prompt_risultato)`
    },

    {
      type: "exercise", id: "rag-08", kg: 10, title: "Drill: ricerca ingenua su ricette",
      task: `<p>Su <code>kb</code> (consigli di cucina) e <code>domanda</code>: <code>punteggi</code> (parole condivise per documento), <code>migliore_idx</code>.</p>`,
      starter: `kb = [
    "il caffe va preparato con acqua calda",
    "il risotto si manteca con burro",
    "la pasta si scola al dente",
]
domanda = "come si prepara un buon caffe caldo"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`,
      check: `assert migliore_idx == 0`,
      hint: `<p>Il primo documento condivide "caffe" e "calda"/"calde" con la domanda: il conteggio più alto.</p>`,
      solution: `kb = [
    "il caffe va preparato con acqua calda",
    "il risotto si manteca con burro",
    "la pasta si scola al dente",
]
domanda = "come si prepara un buon caffe caldo"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`
    },

    { type: "theory", title: "Chunk con overlap: non tagliare le frasi a metà", html: `
<p>Spezzare un testo in chunk separati e distinti rischia di tagliare a metà un'informazione che si trova proprio al confine tra due pezzi. La soluzione comune è far <strong>sovrapporre leggermente</strong> i chunk consecutivi:</p>
<pre><code>def chunk_overlap(parole, size, overlap):
    chunks = []
    step = size - overlap
    for i in range(0, len(parole), step):
        chunks.append(parole[i:i+size])
    return chunks</code></pre>
<p>Con <code>size=4</code> e <code>overlap=1</code>, ogni chunk condivide un'ultima parola col successivo: un'informazione a cavallo del confine compare intera in almeno un chunk. Il costo è ovvio: più chunk, più spazio occupato, più costo di calcolo in fase di retrieval.</p>
` },

    {
      type: "exercise", id: "rag-09", kg: 15, title: "Drill: chunking con sovrapposizione",
      task: `<p>Scrivi <code>chunk_overlap(parole, size, overlap)</code> (già abbozzata) e applicala a una lista di 10 parole con <code>size=4</code>, <code>overlap=1</code>.</p>`,
      starter: `def chunk_overlap(parole, size, overlap):
    chunks = []
    step = size - overlap
    for i in range(0, len(parole), step):
        chunks.append(parole[i:i+size])
        if i + size >= len(parole):
            break
    return chunks

testo = "uno due tre quattro cinque sei sette otto nove dieci".split()
chunks = chunk_overlap(testo, 4, 1)
print(chunks)`,
      check: `assert chunks == [["uno","due","tre","quattro"], ["quattro","cinque","sei","sette"], ["sette","otto","nove","dieci"]]`,
      hint: `<p>Ogni chunk inizia dove il precedente aveva lasciato l'ultima parola (l'overlap): "quattro" chiude il primo chunk e apre il secondo.</p>`,
      solution: `def chunk_overlap(parole, size, overlap):
    chunks = []
    step = size - overlap
    for i in range(0, len(parole), step):
        chunks.append(parole[i:i+size])
        if i + size >= len(parole):
            break
    return chunks

testo = "uno due tre quattro cinque sei sette otto nove dieci".split()
chunks = chunk_overlap(testo, 4, 1)
print(chunks)`
    },

    {
      type: "exercise", id: "rag-10", kg: 15, title: "Drill: vettorizza le ricette",
      task: `<p>Su <code>kb</code> (5 consigli di cucina): <code>vect</code>, <code>doc_vecs</code>, <code>vocabolario_size</code>.</p>`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
    "Il pane fatto in casa richiede una lunga lievitazione naturale",
    "Il the verde va infuso a temperatura piu bassa del the nero",
]

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
vocabolario_size = doc_vecs.shape[1]

print(doc_vecs.shape)
print(vocabolario_size)`,
      check: `assert doc_vecs.shape[0] == 5
assert vocabolario_size > 20`,
      hint: `<p>Stesso schema della prima vettorizzazione della sala: <code>fit_transform</code> impara il vocabolario e converte in un solo passo.</p>`,
      solution: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
    "Il pane fatto in casa richiede una lunga lievitazione naturale",
    "Il the verde va infuso a temperatura piu bassa del the nero",
]

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
vocabolario_size = doc_vecs.shape[1]

print(doc_vecs.shape)
print(vocabolario_size)`
    },

    {
      type: "exercise", id: "rag-11", kg: 20, title: "Drill: la temperatura giusta",
      task: `<p>Con <code>vect</code>/<code>doc_vecs</code> già pronti (fit su <code>kb</code> delle ricette): rispondi a <code>domanda</code>, trova <code>migliore</code> (il documento più simile).</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
    "Il pane fatto in casa richiede una lunga lievitazione naturale",
    "Il the verde va infuso a temperatura piu bassa del the nero",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "Qual e la temperatura giusta per fare il caffe"`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda: gia' pronti

query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, doc_vecs)[0]
migliore = kb[sims.argmax()]

print(sims.round(3))
print(migliore)`,
      check: `assert "caffe" in migliore.lower()`,
      hint: `<p>Il documento sul caffè condivide "temperatura"-correlate come "calda" e "gradi" con la domanda.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, doc_vecs)[0]
migliore = kb[sims.argmax()]

print(sims.round(3))
print(migliore)`
    },

    {
      type: "exercise", id: "rag-12", kg: 20, title: "Drill: top-3 sulle ricette",
      task: `<p>Con <code>vect</code>/<code>doc_vecs</code>/<code>kb</code> pronti: usa <code>top_k</code> (già definita) per trovare i 3 documenti più simili a <code>domanda</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
    "Il pane fatto in casa richiede una lunga lievitazione naturale",
    "Il the verde va infuso a temperatura piu bassa del the nero",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "Qual e la temperatura giusta per fare il caffe o il the"

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = np.argsort(sims)[::-1]
    return [kb[i] for i in ordine[:k]]`,
      starter: `# vect, doc_vecs, kb, domanda, top_k: gia' pronti
risultati = top_k(domanda, 3, vect, doc_vecs, kb)
print(risultati)`,
      check: `assert len(risultati) == 3
assert any("caffe" in r.lower() for r in risultati)
assert any("the" in r.lower() for r in risultati)`,
      hint: `<p>La domanda menziona sia "caffe" che "the": entrambi i documenti pertinenti devono comparire tra i primi 3.</p>`,
      solution: `risultati = top_k(domanda, 3, vect, doc_vecs, kb)
print(risultati)`
    },

    {
      type: "exercise", id: "rag-13", kg: 20, title: "Drill: nessun risultato pertinente",
      task: `<p>A volte la domanda non ha nulla a che fare con la base di conoscenza. Scrivi <code>retrieve_con_soglia(domanda, soglia, vect, doc_vecs, kb)</code>: restituisce il documento migliore SOLO se la sua similarità supera <code>soglia</code>, altrimenti <code>None</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb: gia' pronti

def retrieve_con_soglia(domanda, soglia, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return None
    return kb[sims.argmax()]

pertinente = retrieve_con_soglia("acqua calda per il caffe", 0.1, vect, doc_vecs, kb)
non_pertinente = retrieve_con_soglia("qual e la capitale del Giappone", 0.1, vect, doc_vecs, kb)

print(pertinente)
print(non_pertinente)`,
      check: `assert pertinente is not None and "caffe" in pertinente.lower()
assert non_pertinente is None`,
      hint: `<p>Restituire <code>None</code> quando nulla supera la soglia è più onesto che restituire comunque "il meno peggio": un buon sistema RAG deve saper dire "non lo so".</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

def retrieve_con_soglia(domanda, soglia, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return None
    return kb[sims.argmax()]

pertinente = retrieve_con_soglia("acqua calda per il caffe", 0.1, vect, doc_vecs, kb)
non_pertinente = retrieve_con_soglia("qual e la capitale del Giappone", 0.1, vect, doc_vecs, kb)

print(pertinente)
print(non_pertinente)`
    },

    {
      type: "exercise", id: "rag-14", kg: 20, title: "Drill: rispondi a più domande in batch",
      task: `<p>Con <code>vect</code>/<code>doc_vecs</code>/<code>kb</code> pronti: applica il retrieval a TUTTE le <code>domande</code> in una lista, salvando in <code>risposte</code> (lista dei documenti migliori, uno per domanda).</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domande = ["come si fa il caffe", "come si manteca il risotto", "come si scola la pasta"]`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domande: gia' pronti

def rispondi(domanda):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    return kb[sims.argmax()]

risposte = [rispondi(d) for d in domande]
print(risposte)`,
      check: `assert len(risposte) == 3
assert "caffe" in risposte[0].lower()
assert "risotto" in risposte[1].lower()
assert "pasta" in risposte[2].lower()`,
      hint: `<p>Una list comprehension che applica la stessa funzione di retrieval a ogni domanda: un batch di query è solo un ciclo su domande singole.</p>`,
      solution: `def rispondi(domanda):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    return kb[sims.argmax()]

risposte = [rispondi(d) for d in domande]
print(risposte)`
    },

    {
      type: "exercise", id: "rag-15", kg: 20, title: "Drill: cita le fonti",
      task: `<p>Costruisci un contesto con <strong>citazioni numerate</strong>: <code>contesto_citato</code>, dove ogni documento recuperato è preceduto da <code>[1]</code>, <code>[2]</code>, ecc. (usa <code>enumerate</code>).</p>`,
      starter: `documenti_recuperati = [
    "Il caffe va preparato con acqua a 90 gradi",
    "Il the verde va infuso a temperatura piu bassa",
]

righe = [f"[{i+1}] {doc}" for i, doc in enumerate(documenti_recuperati)]
contesto_citato = "\\n".join(righe)

print(contesto_citato)`,
      check: `assert contesto_citato == "[1] Il caffe va preparato con acqua a 90 gradi\\n[2] Il the verde va infuso a temperatura piu bassa"`,
      hint: `<p><code>enumerate(..., start=1)</code> oppure <code>i+1</code>: le citazioni si numerano da 1, non da 0 come gli indici Python.</p>`,
      solution: `documenti_recuperati = [
    "Il caffe va preparato con acqua a 90 gradi",
    "Il the verde va infuso a temperatura piu bassa",
]

righe = [f"[{i+1}] {doc}" for i, doc in enumerate(documenti_recuperati)]
contesto_citato = "\\n".join(righe)

print(contesto_citato)`
    },

    {
      type: "exercise", id: "rag-16", kg: 25, title: "Combo: retrieval con citazioni nel prompt",
      task: `<p>Metti insieme retrieval + citazioni: scrivi <code>rag_con_citazioni(domanda, k, vect, doc_vecs, kb, template)</code> che recupera i top-k, li numera con <code>[n]</code>, e compila il template. Restituisce <code>(prompt, indici_citati)</code> dove <code>indici_citati</code> sono gli indici originali in <code>kb</code> dei documenti usati.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
template = "Contesto:\\n{contesto}\\n\\nDomanda: {domanda}"
domanda = "acqua calda per il caffe"`,
      starter: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, template, domanda: gia' pronti

def rag_con_citazioni(domanda, k, vect, doc_vecs, kb, template):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    indici_citati = list(np.argsort(sims)[::-1][:k])
    righe = [f"[{n+1}] {kb[idx]}" for n, idx in enumerate(indici_citati)]
    contesto = "\\n".join(righe)
    prompt = template.format(contesto=contesto, domanda=domanda)
    return prompt, indici_citati

prompt, indici = rag_con_citazioni(domanda, 1, vect, doc_vecs, kb, template)
print(prompt)
print(indici)`,
      check: `assert indici == [0]
assert "[1]" in prompt
assert "caffe" in prompt.lower()`,
      hint: `<p>Gli <code>indici_citati</code> sono posizioni in <code>kb</code> (indice 0), ma le citazioni nel testo del prompt sono numerate da 1: due sistemi di numerazione diversi che convivono di proposito.</p>`,
      solution: `def rag_con_citazioni(domanda, k, vect, doc_vecs, kb, template):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    indici_citati = list(np.argsort(sims)[::-1][:k])
    righe = [f"[{n+1}] {kb[idx]}" for n, idx in enumerate(indici_citati)]
    contesto = "\\n".join(righe)
    prompt = template.format(contesto=contesto, domanda=domanda)
    return prompt, indici_citati

prompt, indici = rag_con_citazioni(domanda, 1, vect, doc_vecs, kb, template)
print(prompt)
print(indici)`
    },

    {
      type: "exercise", id: "rag-17", kg: 25, title: "Combo: due basi di conoscenza",
      task: `<p>Hai due basi di conoscenza separate (<code>kb_cucina</code>, <code>kb_viaggi</code>). Scrivi <code>cerca_ovunque(domanda)</code>: cerca in entrambe (vettorizzatori separati, uno per collezione) e restituisce il documento con la similarità assoluta più alta tra TUTTI, indicando anche da quale base viene.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

kb_cucina = ["Il caffe si prepara con acqua calda", "Il risotto si manteca con burro"]
kb_viaggi = ["Il volo per Tokyo dura dodici ore", "Il treno per Parigi parte alle otto"]

vect_cucina = TfidfVectorizer().fit(kb_cucina)
vect_viaggi = TfidfVectorizer().fit(kb_viaggi)
vecs_cucina = vect_cucina.transform(kb_cucina)
vecs_viaggi = vect_viaggi.transform(kb_viaggi)`,
      starter: `# kb_cucina, kb_viaggi, vect_cucina, vect_viaggi, vecs_cucina, vecs_viaggi: gia' pronti
def cerca_ovunque(domanda):
    sim_cucina = cosine_similarity(vect_cucina.transform([domanda]), vecs_cucina)[0]
    sim_viaggi = cosine_similarity(vect_viaggi.transform([domanda]), vecs_viaggi)[0]
    if sim_cucina.max() >= sim_viaggi.max():
        return kb_cucina[sim_cucina.argmax()], "cucina"
    return kb_viaggi[sim_viaggi.argmax()], "viaggi"

r1, fonte1 = cerca_ovunque("quanto dura il volo")
r2, fonte2 = cerca_ovunque("come si fa il caffe")

print(r1, fonte1)
print(r2, fonte2)`,
      check: `assert fonte1 == "viaggi"
assert fonte2 == "cucina"`,
      hint: `<p>Confrontare similarità calcolate da due <code>TfidfVectorizer</code> DIVERSI è possibile perché il coseno è sempre in scala 0-1, indipendentemente dal vocabolario: i numeri restano comparabili.</p>`,
      solution: `def cerca_ovunque(domanda):
    sim_cucina = cosine_similarity(vect_cucina.transform([domanda]), vecs_cucina)[0]
    sim_viaggi = cosine_similarity(vect_viaggi.transform([domanda]), vecs_viaggi)[0]
    if sim_cucina.max() >= sim_viaggi.max():
        return kb_cucina[sim_cucina.argmax()], "cucina"
    return kb_viaggi[sim_viaggi.argmax()], "viaggi"

r1, fonte1 = cerca_ovunque("quanto dura il volo")
r2, fonte2 = cerca_ovunque("come si fa il caffe")

print(r1, fonte1)
print(r2, fonte2)`
    },

    { type: "theory", title: "Valutare il retrieval: precision@k", html: `
<p>Come si giudica se un sistema di retrieval funziona bene? Una metrica semplice è <strong>precision@k</strong>: su k documenti recuperati, quanti sono effettivamente rilevanti (secondo un giudizio di riferimento)?</p>
<pre><code>def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)</code></pre>
<p>Serve un set di domande con risposte "giuste" note in anticipo (una <em>ground truth</em>), costruito a mano o da valutatori umani — esattamente come servono etichette vere per valutare un classificatore in scikit-learn.</p>
`, more: `
<p>Precision@k ha un parente naturale, il <strong>recall@k</strong>: invece di chiedere "quanti dei k recuperati sono rilevanti", chiede "quanti dei documenti REALMENTE rilevanti sono stati recuperati tra i k" — <code>len(set(recuperati) & set(rilevanti)) / len(rilevanti)</code>. Un sistema può avere precision alta (tutto ciò che recupera è pertinente) ma recall basso (recupera pochissimo, perdendo molta informazione rilevante) — le due metriche insieme danno un quadro più completo di una sola.</p>
<p>Un'altra metrica comune in questo campo è <strong>MRR</strong> (Mean Reciprocal Rank): invece di guardare solo se il documento giusto è tra i top-k, guarda A CHE POSIZIONE compare — se il documento corretto è il primo risultato, il reciprocal rank è 1; se è il terzo, è 1/3. Premia sistemi che mettono il documento giusto proprio in cima, non solo "da qualche parte tra i primi k".</p>
<p>Costruire un set di test con ground truth (domande + documento/i corretto/i) è spesso il lavoro più sottovalutato nella costruzione di un sistema RAG: senza di esso, non c'è modo oggettivo di sapere se una modifica (cambiare la dimensione dei chunk, passare a embedding densi, aggiustare k) ha davvero migliorato il sistema o solo spostato il problema altrove — esattamente come un modello di machine learning senza un test set rigoroso, visto nella sala Scikit-learn Base.</p>
` },

    {
      type: "exercise", id: "rag-18", kg: 20, title: "Drill: quanto è precisa la ricerca?",
      task: `<p>Scrivi <code>precision_at_k(recuperati, rilevanti)</code> e applicala a un caso con 3 recuperati, 2 dei quali rilevanti.</p>`,
      starter: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

recuperati = ["doc1", "doc3", "doc5"]
rilevanti = ["doc1", "doc5", "doc9"]

p = precision_at_k(recuperati, rilevanti)
print(p)`,
      check: `assert abs(p - 2/3) < 1e-9`,
      hint: `<p>doc1 e doc5 sono sia recuperati che rilevanti (2 su 3 recuperati): precisione 2/3.</p>`,
      solution: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

recuperati = ["doc1", "doc3", "doc5"]
rilevanti = ["doc1", "doc5", "doc9"]

p = precision_at_k(recuperati, rilevanti)
print(p)`
    },

    {
      type: "exercise", id: "rag-19", kg: 25, title: "Combo: valuta il sistema su più domande",
      task: `<p>Con <code>top_k</code> (fornita) e un piccolo set di test <code>casi</code> (domanda + indice atteso): calcola <code>accuratezza_retrieval</code>, la frazione di domande per cui il documento top-1 è quello atteso.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Per fare un buon caffe espresso serve acqua calda a 90 gradi",
    "Il risotto va mantecato con burro e parmigiano a fuoco spento",
    "La pasta va scolata al dente e saltata in padella con il sugo",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = np.argsort(sims)[::-1]
    return [kb[i] for i in ordine[:k]]

casi = [
    ("come si fa il caffe", 0),
    ("come si manteca il risotto", 1),
    ("come si scola la pasta", 2),
]`,
      starter: `# top_k, vect, doc_vecs, kb, casi: gia' pronti
corretti = 0
for domanda, indice_atteso in casi:
    top1 = top_k(domanda, 1, vect, doc_vecs, kb)[0]
    if top1 == kb[indice_atteso]:
        corretti += 1

accuratezza_retrieval = corretti / len(casi)
print(accuratezza_retrieval)`,
      check: `assert accuratezza_retrieval == 1.0`,
      hint: `<p>Per ogni caso di test, confronta il documento recuperato con quello indicato come corretto in anticipo: la stessa logica di un accuracy score, applicata al retrieval invece che a un classificatore.</p>`,
      solution: `corretti = 0
for domanda, indice_atteso in casi:
    top1 = top_k(domanda, 1, vect, doc_vecs, kb)[0]
    if top1 == kb[indice_atteso]:
        corretti += 1

accuratezza_retrieval = corretti / len(casi)
print(accuratezza_retrieval)`
    },

    {
      type: "exercise", id: "rag-20", kg: 25, title: "Combo: deduplica chunk quasi identici",
      task: `<p>A volte due chunk sono quasi duplicati (stesso contenuto, minime differenze). Scrivi <code>deduplica(chunks, vect, soglia=0.95)</code>: rimuove i chunk troppo simili a uno già tenuto (similarità coseno sopra soglia), mantenendo il primo di ogni gruppo simile.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

chunks = [
    "il gatto dorme sul divano tutto il giorno",
    "il gatto dorme sul divano tutto il giorno intero",
    "il cane gioca in giardino con la palla",
]`,
      starter: `# chunks e' gia' pronto
def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

risultato = deduplica(chunks, soglia=0.8)
print(risultato)`,
      check: `assert len(risultato) == 2
assert "cane" in risultato[1]`,
      hint: `<p>I primi due chunk sono quasi identici (una sola parola di differenza): la loro similarità coseno supera facilmente 0.8, quindi il secondo viene scartato come duplicato.</p>`,
      solution: `def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

risultato = deduplica(chunks, soglia=0.8)
print(risultato)`
    },

    {
      type: "exercise", id: "rag-21", kg: 25, title: "Massimale: re-ranking ibrido",
      task: `<p>Combina il punteggio TF-IDF con un bonus per corrispondenza esatta di parole chiave (re-ranking ibrido, tecnica reale usata in molti sistemi di ricerca). <code>punteggio_finale = similarita_tfidf + 0.1 * n_parole_esatte_condivise</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
kb = [
    "Il caffe espresso richiede acqua a 90 gradi circa",
    "Un buon te va preparato con acqua non bollente",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "acqua calda per il caffe"`,
      starter: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda: gia' pronti

query_vec = vect.transform([domanda])
sim_tfidf = cosine_similarity(query_vec, doc_vecs)[0]

parole_domanda = set(domanda.lower().split())
bonus_esatto = np.array([len(parole_domanda & set(doc.lower().split())) for doc in kb])

punteggio_finale = sim_tfidf + 0.1 * bonus_esatto
migliore_idx = int(np.argmax(punteggio_finale))

print(sim_tfidf.round(3))
print(bonus_esatto)
print(punteggio_finale.round(3))
print(kb[migliore_idx])`,
      check: `assert "caffe" in kb[migliore_idx].lower()`,
      hint: `<p>Il re-ranking ibrido combina più segnali: qui il TF-IDF (rilevanza generale) e un conteggio grezzo di parole esatte condivise (rilevanza lessicale diretta), sommati con un peso.</p>`,
      solution: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

query_vec = vect.transform([domanda])
sim_tfidf = cosine_similarity(query_vec, doc_vecs)[0]

parole_domanda = set(domanda.lower().split())
bonus_esatto = np.array([len(parole_domanda & set(doc.lower().split())) for doc in kb])

punteggio_finale = sim_tfidf + 0.1 * bonus_esatto
migliore_idx = int(np.argmax(punteggio_finale))

print(sim_tfidf.round(3))
print(bonus_esatto)
print(punteggio_finale.round(3))
print(kb[migliore_idx])`
    },

    {
      type: "exercise", id: "rag-22", kg: 25, title: "Massimale: chunking + retrieval end-to-end",
      task: `<p>Parti da un UNICO documento lungo <code>documento_lungo</code>, spezzalo in chunk da 8 parole (senza overlap, come nella prima sala), vettorizza i chunk, e rispondi a <code>domanda</code> trovando il chunk più pertinente.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

documento_lungo = "Il riscaldamento prima di allenarsi riduce il rischio di infortuni muscolari e articolari. Una dieta ricca di proteine magre aiuta la crescita e il recupero muscolare dopo lo sforzo. Dormire almeno sette ore per notte migliora sensibilmente il recupero fisico e mentale."`,
      starter: `# documento_lungo e' gia' pronto
parole = documento_lungo.split()
chunks = [" ".join(parole[i:i+8]) for i in range(0, len(parole), 8)]

vect = TfidfVectorizer()
chunk_vecs = vect.fit_transform(chunks)

domanda = "quante ore bisogna dormire per recuperare bene"
query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, chunk_vecs)[0]
chunk_migliore = chunks[sims.argmax()]

print(chunks)
print(chunk_migliore)`,
      check: `assert "recupero" in chunk_migliore.lower() or "ore" in chunk_migliore.lower(), "Il chunk vincente deve essere quello su ore/recupero: 'ore per notte migliora sensibilmente il recupero fisico'"`,
      hint: `<p>Il chunking trasforma un documento monolitico in unità cercabili indipendentemente: senza chunking, l'intero documento (con informazioni miste) sarebbe l'unica unità recuperabile.</p>`,
      solution: `parole = documento_lungo.split()
chunks = [" ".join(parole[i:i+8]) for i in range(0, len(parole), 8)]

vect = TfidfVectorizer()
chunk_vecs = vect.fit_transform(chunks)

domanda = "quante ore bisogna dormire per recuperare bene"
query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, chunk_vecs)[0]
chunk_migliore = chunks[sims.argmax()]

print(chunks)
print(chunk_migliore)`
    },

    {
      type: "exercise", id: "rag-23", kg: 25, title: "Massimale finale: sistema RAG con soglia e citazioni",
      task: `<p>L'ultima serie: unisci soglia di rilevanza (dalla serie precedente) e citazioni in un'unica funzione <code>rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1)</code>. Se nessun documento supera la soglia, restituisce <code>"Non ho trovato informazioni pertinenti."</code>; altrimenti restituisce il prompt con citazione <code>[1]</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Il caffe espresso richiede acqua a 90 gradi circa",
    "Un buon te va preparato con acqua non bollente",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb: gia' pronti

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il caffe", vect, doc_vecs, kb)
risultato_vuoto = rag_robusto("qual e la ricetta della torta di mele", vect, doc_vecs, kb)

print(risultato_ok)
print(risultato_vuoto)`,
      check: `assert "[1]" in risultato_ok and "caffe" in risultato_ok.lower()
assert risultato_vuoto == "Non ho trovato informazioni pertinenti."`,
      hint: `<p>Un buon sistema RAG sa distinguere "ho trovato qualcosa di pertinente" da "non ho nulla di utile da dire" — e lo comunica esplicitamente, invece di inventare una risposta dal nulla.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il caffe", vect, doc_vecs, kb)
risultato_vuoto = rag_robusto("qual e la ricetta della torta di mele", vect, doc_vecs, kb)

print(risultato_ok)
print(risultato_vuoto)`
    },

    {
      type: "exercise", id: "rag-24", kg: 5, title: "Drill: ricerca ingenua sui viaggi",
      task: `<p>Su <code>kb</code> (frasi sui viaggi) e <code>domanda</code>: <code>punteggi</code> e <code>migliore_idx</code>.</p>`,
      starter: `kb = [
    "il volo per Tokyo dura dodici ore",
    "il treno per Parigi parte la mattina",
    "la nave per Barcellona arriva la sera",
]
domanda = "quanto tempo dura il volo per il Giappone"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`,
      check: `assert migliore_idx == 0`,
      hint: `<p>Il primo documento condivide "il", "volo", "per", "dura" con la domanda: il punteggio più alto.</p>`,
      solution: `kb = [
    "il volo per Tokyo dura dodici ore",
    "il treno per Parigi parte la mattina",
    "la nave per Barcellona arriva la sera",
]
domanda = "quanto tempo dura il volo per il Giappone"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`
    },

    {
      type: "exercise", id: "rag-25", kg: 10, title: "Drill: chunking dell'alimentazione",
      task: `<p>Con <code>chunk_per_parole</code> (stessa firma vista prima): spezza <code>documento</code> con <code>dimensione=6</code>.</p>`,
      starter: `documento = "una alimentazione equilibrata prevede cereali integrali verdura fresca proteine magre e grassi buoni ogni giorno"

def chunk_per_parole(testo, dimensione=6):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]

chunks = chunk_per_parole(documento, dimensione=6)
n_chunks = len(chunks)

print(chunks)
print(n_chunks)`,
      check: `assert n_chunks == 3
assert chunks[0] == "una alimentazione equilibrata prevede cereali integrali"`,
      hint: `<p>15 parole totali, chunk da 6: fa 6+6+3, quindi 3 chunk.</p>`,
      solution: `documento = "una alimentazione equilibrata prevede cereali integrali verdura fresca proteine magre e grassi buoni ogni giorno"

def chunk_per_parole(testo, dimensione=6):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]

chunks = chunk_per_parole(documento, dimensione=6)
n_chunks = len(chunks)

print(chunks)
print(n_chunks)`
    },

    {
      type: "exercise", id: "rag-26", kg: 15, title: "Drill: overlap più ampio",
      task: `<p>Con <code>chunk_overlap</code> (stessa firma vista prima): applica a 12 parole con <code>size=5</code>, <code>overlap=2</code>.</p>`,
      starter: `def chunk_overlap(parole, size, overlap):
    chunks = []
    step = size - overlap
    for i in range(0, len(parole), step):
        chunks.append(parole[i:i+size])
        if i + size >= len(parole):
            break
    return chunks

testo = "a b c d e f g h i j k l".split()
chunks = chunk_overlap(testo, 5, 2)
print(chunks)
print(len(chunks))`,
      check: `assert len(chunks) == 4
assert chunks[-1] == ["j", "k", "l"]`,
      hint: `<p>Con <code>step = size - overlap = 3</code>, gli indici di partenza sono 0, 3, 6, 9: l'ultimo chunk ha solo 3 elementi perché la lista finisce.</p>`,
      solution: `def chunk_overlap(parole, size, overlap):
    chunks = []
    step = size - overlap
    for i in range(0, len(parole), step):
        chunks.append(parole[i:i+size])
        if i + size >= len(parole):
            break
    return chunks

testo = "a b c d e f g h i j k l".split()
chunks = chunk_overlap(testo, 5, 2)
print(chunks)
print(len(chunks))`
    },

    {
      type: "exercise", id: "rag-27", kg: 15, title: "Drill: vettorizza la base di conoscenza tech",
      task: `<p>Su <code>kb</code> (5 frasi tecniche): <code>vect</code>, <code>doc_vecs</code>, <code>vocabolario_size</code>.</p>`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "JavaScript viene eseguito nel browser per interattivita web",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
    "Git traccia le versioni del codice sorgente",
]

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
vocabolario_size = doc_vecs.shape[1]

print(doc_vecs.shape)
print(vocabolario_size)`,
      check: `assert doc_vecs.shape[0] == 5
assert vocabolario_size > 15`,
      hint: `<p>Stesso schema di sempre: <code>fit_transform</code> impara il vocabolario e converte i testi in un solo passo.</p>`,
      solution: `from sklearn.feature_extraction.text import TfidfVectorizer

kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "JavaScript viene eseguito nel browser per interattivita web",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
    "Git traccia le versioni del codice sorgente",
]

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
vocabolario_size = doc_vecs.shape[1]

print(doc_vecs.shape)
print(vocabolario_size)`
    },

    {
      type: "exercise", id: "rag-28", kg: 15, title: "Drill: trova il documento su Docker",
      task: `<p>Con <code>vect</code>/<code>doc_vecs</code> già pronti (fit su <code>kb</code> tech): rispondi a <code>domanda</code>, trova <code>migliore</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "JavaScript viene eseguito nel browser per interattivita web",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
    "Git traccia le versioni del codice sorgente",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "come isolare le applicazioni in un container docker"`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda: gia' pronti

query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, doc_vecs)[0]
migliore = kb[sims.argmax()]

print(sims.round(3))
print(migliore)`,
      check: `assert "docker" in migliore.lower()`,
      hint: `<p>La domanda condivide "applicazioni", "container" e "docker" con il documento su Docker: vince nettamente.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, doc_vecs)[0]
migliore = kb[sims.argmax()]

print(sims.round(3))
print(migliore)`
    },

    {
      type: "exercise", id: "rag-29", kg: 20, title: "Drill: top-2 sulla base tech",
      task: `<p>Con <code>top_k</code> (già definita): trova i 2 documenti più simili a <code>domanda</code> sulla base tech.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "JavaScript viene eseguito nel browser per interattivita web",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
    "Git traccia le versioni del codice sorgente",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "quali strumenti tracciano le versioni del codice sorgente"

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = np.argsort(sims)[::-1]
    return [kb[i] for i in ordine[:k]]`,
      starter: `# vect, doc_vecs, kb, domanda, top_k: gia' pronti
risultati = top_k(domanda, 2, vect, doc_vecs, kb)
print(risultati)`,
      check: `assert len(risultati) == 2
assert "git" in risultati[0].lower()`,
      hint: `<p>La domanda condivide "versioni", "codice" e "sorgente" con il documento su Git: deve vincere nettamente come primo risultato.</p>`,
      solution: `risultati = top_k(domanda, 2, vect, doc_vecs, kb)
print(risultati)`
    },

    {
      type: "exercise", id: "rag-30", kg: 20, title: "Drill: soglia sulla base tech",
      task: `<p>Con <code>retrieve_con_soglia</code> (stessa firma vista prima): verifica una domanda pertinente e una no.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "SQL serve per interrogare database relazionali",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb: gia' pronti

def retrieve_con_soglia(domanda, soglia, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return None
    return kb[sims.argmax()]

pertinente = retrieve_con_soglia("programmazione con Python", 0.1, vect, doc_vecs, kb)
non_pertinente = retrieve_con_soglia("che tempo fa oggi a Roma", 0.1, vect, doc_vecs, kb)

print(pertinente)
print(non_pertinente)`,
      check: `assert pertinente is not None and "python" in pertinente.lower()
assert non_pertinente is None`,
      hint: `<p>La seconda domanda non condivide nessuna parola con la base di conoscenza: la similarità resta a zero, sotto qualsiasi soglia positiva.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

def retrieve_con_soglia(domanda, soglia, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return None
    return kb[sims.argmax()]

pertinente = retrieve_con_soglia("programmazione con Python", 0.1, vect, doc_vecs, kb)
non_pertinente = retrieve_con_soglia("che tempo fa oggi a Roma", 0.1, vect, doc_vecs, kb)

print(pertinente)
print(non_pertinente)`
    },

    {
      type: "exercise", id: "rag-31", kg: 20, title: "Drill: batch di domande tech",
      task: `<p>Applica il retrieval a tutte le <code>domande</code> sulla base tech, salvando in <code>risposte</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
kb = [
    "Python e un linguaggio di programmazione",
    "SQL serve per interrogare database",
    "Docker impacchetta applicazioni in container",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domande = ["cos'e Python", "come si usa SQL per database", "cos'e Docker per container"]`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domande: gia' pronti

def rispondi(domanda):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    return kb[sims.argmax()]

risposte = [rispondi(d) for d in domande]
print(risposte)`,
      check: `assert len(risposte) == 3
assert "python" in risposte[0].lower()
assert "sql" in risposte[1].lower()
assert "docker" in risposte[2].lower()`,
      hint: `<p>Ogni domanda condivide parole esatte solo col proprio documento corretto: il retrieval deve trovarli tutti e tre senza errori.</p>`,
      solution: `def rispondi(domanda):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    return kb[sims.argmax()]

risposte = [rispondi(d) for d in domande]
print(risposte)`
    },

    {
      type: "exercise", id: "rag-32", kg: 15, title: "Drill: cita le fonti tech",
      task: `<p>Costruisci <code>contesto_citato</code> con citazioni numerate su <code>documenti_recuperati</code>.</p>`,
      starter: `documenti_recuperati = [
    "Python e un linguaggio ad alto livello",
    "SQL serve per interrogare database",
]

righe = [f"[{i+1}] {doc}" for i, doc in enumerate(documenti_recuperati)]
contesto_citato = "\\n".join(righe)

print(contesto_citato)`,
      check: `assert contesto_citato == "[1] Python e un linguaggio ad alto livello\\n[2] SQL serve per interrogare database"`,
      hint: `<p>Le citazioni si numerano da 1: <code>i+1</code> converte l'indice 0-based in una numerazione naturale.</p>`,
      solution: `documenti_recuperati = [
    "Python e un linguaggio ad alto livello",
    "SQL serve per interrogare database",
]

righe = [f"[{i+1}] {doc}" for i, doc in enumerate(documenti_recuperati)]
contesto_citato = "\\n".join(righe)

print(contesto_citato)`
    },

    {
      type: "exercise", id: "rag-33", kg: 20, title: "Drill: precisione su un secondo caso",
      task: `<p>Con <code>precision_at_k</code> (stessa firma vista prima): applica a 4 recuperati, 2 rilevanti tra loro.</p>`,
      starter: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

recuperati = ["docA", "docB", "docC", "docD"]
rilevanti = ["docB", "docD", "docE"]

p = precision_at_k(recuperati, rilevanti)
print(p)`,
      check: `assert abs(p - 0.5) < 1e-9`,
      hint: `<p>docB e docD sono sia recuperati che rilevanti (2 su 4 recuperati): precisione 0.5.</p>`,
      solution: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

recuperati = ["docA", "docB", "docC", "docD"]
rilevanti = ["docB", "docD", "docE"]

p = precision_at_k(recuperati, rilevanti)
print(p)`
    },

    {
      type: "exercise", id: "rag-34", kg: 20, title: "Combo: prompt aumentato sulla base tech",
      task: `<p>Con <code>documenti_recuperati</code> e <code>domanda</code>: costruisci <code>contesto</code> e <code>prompt_finale</code>.</p>`,
      starter: `documenti_recuperati = [
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container",
]
domanda = "Come interrogo un database?"

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
prompt_finale = template.format(contesto=contesto, domanda=domanda)

print(prompt_finale)`,
      check: `assert contesto == "- SQL serve per interrogare database relazionali\\n- Docker impacchetta applicazioni in container"
assert "Contesto:" in prompt_finale and contesto in prompt_finale and domanda in prompt_finale`,
      hint: `<p>Stesso schema del primo prompt aumentato della sala, con dati diversi.</p>`,
      solution: `documenti_recuperati = [
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container",
]
domanda = "Come interrogo un database?"

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
prompt_finale = template.format(contesto=contesto, domanda=domanda)

print(prompt_finale)`
    },

    {
      type: "exercise", id: "rag-35", kg: 25, title: "Combo: pipeline RAG sulla base tech",
      task: `<p>Con <code>rag_pipeline</code> (stessa firma del massimale, già scritta): applicala a <code>domanda_test</code> sulla base tech (6 documenti, incluso Kubernetes).</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "JavaScript viene eseguito nel browser per interattivita web",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
    "Git traccia le versioni del codice sorgente",
    "Kubernetes orchestra container su piu server",
]

template = """Rispondi usando SOLO le informazioni nel contesto.

Contesto:
{contesto}

Domanda: {domanda}
Risposta:"""

domanda_test = "Come si orchestra un container su piu server"`,
      starter: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
# kb, template, domanda_test: gia' pronti

def rag_pipeline(domanda, kb, k=2):
    vect = TfidfVectorizer()
    doc_vecs = vect.fit_transform(kb)

    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    top_idx = np.argsort(sims)[::-1][:k]
    documenti_recuperati = [kb[i] for i in top_idx]

    contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
    prompt = template.format(contesto=contesto, domanda=domanda)

    return prompt, documenti_recuperati

prompt_risultato, docs_risultato = rag_pipeline(domanda_test, kb, k=2)
print(prompt_risultato)`,
      check: `assert len(docs_risultato) == 2
assert docs_risultato[0] == kb[5], "Kubernetes (idx 5) deve essere il piu' rilevante: condivide 'orchestra', 'container', 'server', 'piu' con la domanda"`,
      hint: `<p>La domanda condivide quattro parole esatte con il documento su Kubernetes: nessun altro documento si avvicina.</p>`,
      solution: `def rag_pipeline(domanda, kb, k=2):
    vect = TfidfVectorizer()
    doc_vecs = vect.fit_transform(kb)

    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    top_idx = np.argsort(sims)[::-1][:k]
    documenti_recuperati = [kb[i] for i in top_idx]

    contesto = "\\n".join(f"- {doc}" for doc in documenti_recuperati)
    prompt = template.format(contesto=contesto, domanda=domanda)

    return prompt, documenti_recuperati

prompt_risultato, docs_risultato = rag_pipeline(domanda_test, kb, k=2)
print(prompt_risultato)`
    },

    {
      type: "exercise", id: "rag-36", kg: 25, title: "Combo: sport o finanza?",
      task: `<p>Con <code>cerca_ovunque</code> (stessa firma vista prima) su due nuove basi (<code>kb_sport</code>, <code>kb_finanza</code>): verifica che smisti correttamente due domande.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

kb_sport = ["Il calcio si gioca in undici contro undici", "Il tennis si gioca uno contro uno o in doppio"]
kb_finanza = ["Le azioni rappresentano quote di una societa", "Le obbligazioni sono titoli di debito"]

vect_sport = TfidfVectorizer().fit(kb_sport)
vect_finanza = TfidfVectorizer().fit(kb_finanza)
vecs_sport = vect_sport.transform(kb_sport)
vecs_finanza = vect_finanza.transform(kb_finanza)`,
      starter: `# kb_sport, kb_finanza, vect_sport, vect_finanza, vecs_sport, vecs_finanza: gia' pronti
def cerca_ovunque(domanda):
    sim_sport = cosine_similarity(vect_sport.transform([domanda]), vecs_sport)[0]
    sim_finanza = cosine_similarity(vect_finanza.transform([domanda]), vecs_finanza)[0]
    if sim_sport.max() >= sim_finanza.max():
        return kb_sport[sim_sport.argmax()], "sport"
    return kb_finanza[sim_finanza.argmax()], "finanza"

r1, fonte1 = cerca_ovunque("quante persone giocano a calcio")
r2, fonte2 = cerca_ovunque("cosa sono le obbligazioni")

print(r1, fonte1)
print(r2, fonte2)`,
      check: `assert fonte1 == "sport"
assert fonte2 == "finanza"`,
      hint: `<p>"calcio" appartiene solo alla base sport, "obbligazioni" solo a quella finanza: nessuna ambiguità.</p>`,
      solution: `def cerca_ovunque(domanda):
    sim_sport = cosine_similarity(vect_sport.transform([domanda]), vecs_sport)[0]
    sim_finanza = cosine_similarity(vect_finanza.transform([domanda]), vecs_finanza)[0]
    if sim_sport.max() >= sim_finanza.max():
        return kb_sport[sim_sport.argmax()], "sport"
    return kb_finanza[sim_finanza.argmax()], "finanza"

r1, fonte1 = cerca_ovunque("quante persone giocano a calcio")
r2, fonte2 = cerca_ovunque("cosa sono le obbligazioni")

print(r1, fonte1)
print(r2, fonte2)`
    },

    {
      type: "exercise", id: "rag-37", kg: 25, title: "Combo: valuta il retrieval sulla base tech",
      task: `<p>Con <code>top_k</code> e un set di test <code>casi</code>: calcola <code>accuratezza_retrieval</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Python e un linguaggio di programmazione",
    "SQL serve per interrogare database",
    "Docker impacchetta applicazioni container",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)

def top_k(domanda, k, vect, doc_vecs, kb):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    ordine = np.argsort(sims)[::-1]
    return [kb[i] for i in ordine[:k]]

casi = [
    ("Python linguaggio programmazione", 0),
    ("SQL interrogare database", 1),
    ("Docker applicazioni container", 2),
]`,
      starter: `# top_k, vect, doc_vecs, kb, casi: gia' pronti
corretti = 0
for domanda, indice_atteso in casi:
    top1 = top_k(domanda, 1, vect, doc_vecs, kb)[0]
    if top1 == kb[indice_atteso]:
        corretti += 1

accuratezza_retrieval = corretti / len(casi)
print(accuratezza_retrieval)`,
      check: `assert accuratezza_retrieval == 1.0`,
      hint: `<p>Ogni domanda di test condivide parole quasi identiche solo con il proprio documento atteso.</p>`,
      solution: `corretti = 0
for domanda, indice_atteso in casi:
    top1 = top_k(domanda, 1, vect, doc_vecs, kb)[0]
    if top1 == kb[indice_atteso]:
        corretti += 1

accuratezza_retrieval = corretti / len(casi)
print(accuratezza_retrieval)`
    },

    {
      type: "exercise", id: "rag-38", kg: 25, title: "Combo: deduplica chunk sulla ricetta del pane",
      task: `<p>Con <code>deduplica</code> (stessa firma vista prima): applica a chunk quasi identici sulla cottura del pane.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

chunks = [
    "il pane si cuoce in forno caldo per quaranta minuti",
    "il pane si cuoce in forno caldo per quaranta minuti circa",
    "la pizza si cuoce in forno molto caldo",
]`,
      starter: `# chunks e' gia' pronto
def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

risultato = deduplica(chunks, soglia=0.8)
print(risultato)`,
      check: `assert len(risultato) == 2
assert "pizza" in risultato[1]`,
      hint: `<p>I primi due chunk differiscono solo per la parola "circa": la loro similarità supera facilmente 0.8.</p>`,
      solution: `def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

risultato = deduplica(chunks, soglia=0.8)
print(risultato)`
    },

    {
      type: "exercise", id: "rag-39", kg: 25, title: "Combo: citazioni sulla base tech",
      task: `<p>Con <code>rag_con_citazioni</code> (stessa firma vista prima): applica a <code>domanda</code> sulla base tech, <code>k=1</code>.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
kb = [
    "Python e un linguaggio di programmazione ad alto livello",
    "SQL serve per interrogare database relazionali",
    "Docker impacchetta applicazioni in container isolati",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
template = "Contesto:\\n{contesto}\\n\\nDomanda: {domanda}"
domanda = "programmazione con Python"`,
      starter: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, template, domanda: gia' pronti

def rag_con_citazioni(domanda, k, vect, doc_vecs, kb, template):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    indici_citati = list(np.argsort(sims)[::-1][:k])
    righe = [f"[{n+1}] {kb[idx]}" for n, idx in enumerate(indici_citati)]
    contesto = "\\n".join(righe)
    prompt = template.format(contesto=contesto, domanda=domanda)
    return prompt, indici_citati

prompt, indici = rag_con_citazioni(domanda, 1, vect, doc_vecs, kb, template)
print(prompt)
print(indici)`,
      check: `assert indici == [0]
assert "[1]" in prompt
assert "python" in prompt.lower()`,
      hint: `<p>Il documento su Python (indice 0) condivide "programmazione" e "python" con la domanda.</p>`,
      solution: `def rag_con_citazioni(domanda, k, vect, doc_vecs, kb, template):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    indici_citati = list(np.argsort(sims)[::-1][:k])
    righe = [f"[{n+1}] {kb[idx]}" for n, idx in enumerate(indici_citati)]
    contesto = "\\n".join(righe)
    prompt = template.format(contesto=contesto, domanda=domanda)
    return prompt, indici_citati

prompt, indici = rag_con_citazioni(domanda, 1, vect, doc_vecs, kb, template)
print(prompt)
print(indici)`
    },

    {
      type: "exercise", id: "rag-40", kg: 25, title: "Massimale: re-ranking sul backup",
      task: `<p>Applica il re-ranking ibrido (TF-IDF + bonus parole esatte) su <code>kb</code> e <code>domanda</code> sul backup dei dati.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
kb = [
    "Il backup dei dati va fatto ogni notte automaticamente",
    "Il ripristino di un backup richiede la chiave di cifratura",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)
domanda = "chiave per il ripristino del backup"`,
      starter: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb, domanda: gia' pronti

query_vec = vect.transform([domanda])
sim_tfidf = cosine_similarity(query_vec, doc_vecs)[0]

parole_domanda = set(domanda.lower().split())
bonus_esatto = np.array([len(parole_domanda & set(doc.lower().split())) for doc in kb])

punteggio_finale = sim_tfidf + 0.1 * bonus_esatto
migliore_idx = int(np.argmax(punteggio_finale))

print(sim_tfidf.round(3))
print(bonus_esatto)
print(kb[migliore_idx])`,
      check: `assert "ripristino" in kb[migliore_idx].lower()`,
      hint: `<p>Il secondo documento condivide sia "ripristino" che "chiave" che "backup" con la domanda: il bonus esatto lo spinge chiaramente avanti.</p>`,
      solution: `import numpy as np

query_vec = vect.transform([domanda])
sim_tfidf = cosine_similarity(query_vec, doc_vecs)[0]

parole_domanda = set(domanda.lower().split())
bonus_esatto = np.array([len(parole_domanda & set(doc.lower().split())) for doc in kb])

punteggio_finale = sim_tfidf + 0.1 * bonus_esatto
migliore_idx = int(np.argmax(punteggio_finale))

print(sim_tfidf.round(3))
print(bonus_esatto)
print(kb[migliore_idx])`
    },

    {
      type: "exercise", id: "rag-41", kg: 25, title: "Massimale: chunking end-to-end sul backup",
      task: `<p>Spezza <code>documento_lungo</code> in chunk da 8 parole, vettorizza, e rispondi a <code>domanda</code> trovando il chunk più pertinente.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

documento_lungo = "Il backup automatico dei dati previene la perdita accidentale di informazioni importanti. La cifratura end to end protegge i dati durante il trasferimento in rete. Il ripristino rapido di un sistema riduce i tempi di inattivita in caso di guasto."`,
      starter: `# documento_lungo e' gia' pronto
parole = documento_lungo.split()
chunks = [" ".join(parole[i:i+8]) for i in range(0, len(parole), 8)]

vect = TfidfVectorizer()
chunk_vecs = vect.fit_transform(chunks)

domanda = "come si riduce il tempo di inattivita dopo un guasto"
query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, chunk_vecs)[0]
chunk_migliore = chunks[sims.argmax()]

print(chunks)
print(chunk_migliore)`,
      check: `assert "tempi" in chunk_migliore.lower() or "inattivita" in chunk_migliore.lower(), "Il chunk vincente deve essere quello su tempi/inattivita/guasto"`,
      hint: `<p>Il terzo chunk condivide "riduce", "tempi", "inattivita" e "guasto" con la domanda: il chunking permette di isolarlo dagli altri due argomenti (backup, cifratura).</p>`,
      solution: `parole = documento_lungo.split()
chunks = [" ".join(parole[i:i+8]) for i in range(0, len(parole), 8)]

vect = TfidfVectorizer()
chunk_vecs = vect.fit_transform(chunks)

domanda = "come si riduce il tempo di inattivita dopo un guasto"
query_vec = vect.transform([domanda])
sims = cosine_similarity(query_vec, chunk_vecs)[0]
chunk_migliore = chunks[sims.argmax()]

print(chunks)
print(chunk_migliore)`
    },

    {
      type: "exercise", id: "rag-42", kg: 25, title: "Massimale: soglia e citazioni sul backup",
      task: `<p>Con <code>rag_robusto</code> (stessa firma vista prima) su <code>kb</code> sul backup: verifica una domanda pertinente e una no.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
kb = [
    "Il backup dei dati va fatto ogni notte",
    "Il ripristino richiede la chiave di cifratura",
]
vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb)`,
      starter: `from sklearn.metrics.pairwise import cosine_similarity
# vect, doc_vecs, kb: gia' pronti

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il backup dei dati", vect, doc_vecs, kb)
risultato_vuoto = rag_robusto("quale ricetta serve per un dolce al cioccolato", vect, doc_vecs, kb)

print(risultato_ok)
print(risultato_vuoto)`,
      check: `assert "[1]" in risultato_ok and "backup" in risultato_ok.lower()
assert risultato_vuoto == "Non ho trovato informazioni pertinenti."`,
      hint: `<p>La domanda sul dolce al cioccolato non condivide nessuna parola con la base sul backup: similarità zero, sotto soglia.</p>`,
      solution: `from sklearn.metrics.pairwise import cosine_similarity

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il backup dei dati", vect, doc_vecs, kb)
risultato_vuoto = rag_robusto("quale ricetta serve per un dolce al cioccolato", vect, doc_vecs, kb)

print(risultato_ok)
print(risultato_vuoto)`
    },

    {
      type: "exercise", id: "rag-43", kg: 20, title: "Drill: ricerca ingenua sul benessere",
      task: `<p>Su <code>kb</code> (consigli di benessere) e <code>domanda</code>: <code>punteggi</code>, <code>migliore_idx</code>.</p>`,
      starter: `kb = [
    "bere molta acqua aiuta la digestione",
    "dormire poco aumenta lo stress",
    "fare sport regolarmente migliora lo stato mentale",
]
domanda = "come posso migliorare il mio stato mentale con lo sport"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`,
      check: `assert migliore_idx == 2`,
      hint: `<p>Il terzo documento condivide "sport", "lo", "stato", "mentale" con la domanda: il punteggio più alto.</p>`,
      solution: `kb = [
    "bere molta acqua aiuta la digestione",
    "dormire poco aumenta lo stress",
    "fare sport regolarmente migliora lo stato mentale",
]
domanda = "come posso migliorare il mio stato mentale con lo sport"

parole_domanda = set(domanda.lower().split())
punteggi = [len(parole_domanda & set(doc.lower().split())) for doc in kb]
migliore_idx = punteggi.index(max(punteggi))

print(punteggi)
print(kb[migliore_idx])`
    },

    {
      type: "exercise", id: "rag-44", kg: 20, title: "Drill: chunk più piccoli, più pezzi",
      task: `<p>Su un documento di 12 parole: confronta il numero di chunk con <code>dimensione=4</code> e <code>dimensione=6</code>.</p>`,
      starter: `documento = "uno due tre quattro cinque sei sette otto nove dieci undici dodici"

def chunk_per_parole(testo, dimensione):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]

n_chunks_4 = len(chunk_per_parole(documento, 4))
n_chunks_6 = len(chunk_per_parole(documento, 6))

print(n_chunks_4, n_chunks_6)`,
      check: `assert n_chunks_4 == 3
assert n_chunks_6 == 2
assert n_chunks_4 > n_chunks_6`,
      hint: `<p>12 parole: con chunk da 4 fanno 3 pezzi, con chunk da 6 ne fanno 2 — chunk più piccoli producono sempre più pezzi.</p>`,
      solution: `documento = "uno due tre quattro cinque sei sette otto nove dieci undici dodici"

def chunk_per_parole(testo, dimensione):
    parole = testo.split()
    return [" ".join(parole[i:i+dimensione]) for i in range(0, len(parole), dimensione)]

n_chunks_4 = len(chunk_per_parole(documento, 4))
n_chunks_6 = len(chunk_per_parole(documento, 6))

print(n_chunks_4, n_chunks_6)`
    },

    {
      type: "exercise", id: "rag-45", kg: 25, title: "Combo: confronta due sistemi di retrieval",
      task: `<p>Con <code>precision_at_k</code>: confronta <code>sistemaA_recuperati</code> e <code>sistemaB_recuperati</code> contro gli stessi <code>rilevanti</code>, trova <code>sistema_migliore</code>.</p>`,
      starter: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

sistemaA_recuperati = ["doc1", "doc2", "doc3"]
sistemaB_recuperati = ["doc1", "doc5", "doc6"]
rilevanti = ["doc1", "doc2", "doc7"]

pA = precision_at_k(sistemaA_recuperati, rilevanti)
pB = precision_at_k(sistemaB_recuperati, rilevanti)
sistema_migliore = "A" if pA > pB else "B"

print(pA, pB)
print(sistema_migliore)`,
      check: `assert abs(pA - 2/3) < 1e-9
assert abs(pB - 1/3) < 1e-9
assert sistema_migliore == "A"`,
      hint: `<p>Il sistema A recupera doc1 e doc2 (entrambi rilevanti): precisione 2/3. Il sistema B recupera solo doc1: precisione 1/3.</p>`,
      solution: `def precision_at_k(recuperati, rilevanti):
    n_corretti = len(set(recuperati) & set(rilevanti))
    return n_corretti / len(recuperati)

sistemaA_recuperati = ["doc1", "doc2", "doc3"]
sistemaB_recuperati = ["doc1", "doc5", "doc6"]
rilevanti = ["doc1", "doc2", "doc7"]

pA = precision_at_k(sistemaA_recuperati, rilevanti)
pB = precision_at_k(sistemaB_recuperati, rilevanti)
sistema_migliore = "A" if pA > pB else "B"

print(pA, pB)
print(sistema_migliore)`
    },

    {
      type: "exercise", id: "rag-46", kg: 25, title: "Massimale finale: dedup, soglia e citazioni insieme",
      task: `<p>Metti insieme tutta la sala: 1) deduplica <code>kb</code> (contiene un quasi-duplicato); 2) vettorizza il risultato; 3) applica <code>rag_robusto</code> a una domanda pertinente e una no.</p>`,
      setup: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

kb = [
    "Il backup dei dati va fatto ogni notte automaticamente",
    "Il backup dei dati va fatto ogni notte automaticamente davvero",
    "Il ripristino richiede la chiave di cifratura",
]`,
      starter: `# kb e' gia' pronto (contiene un quasi-duplicato)
def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

kb_dedup = deduplica(kb, soglia=0.8)

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb_dedup)

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il backup dei dati", vect, doc_vecs, kb_dedup)
risultato_vuoto = rag_robusto("quale ricetta serve per un dolce al cioccolato", vect, doc_vecs, kb_dedup)

print(kb_dedup)
print(risultato_ok)
print(risultato_vuoto)`,
      check: `assert len(kb_dedup) == 2, "Le prime due frasi del kb sono quasi identiche: deduplica ne deve tenere solo una"
assert "[1]" in risultato_ok and "backup" in risultato_ok.lower()
assert risultato_vuoto == "Non ho trovato informazioni pertinenti."`,
      hint: `<p>La pipeline completa di un sistema RAG robusto passa da PIÙ fasi in sequenza: pulizia dei dati (deduplica), indicizzazione (vettorizzazione), e recupero con soglia di sicurezza — ognuna delle quali hai già costruito separatamente in questa sala.</p>`,
      solution: `def deduplica(chunks, soglia=0.8):
    vect = TfidfVectorizer().fit(chunks)
    vecs = vect.transform(chunks)
    tenuti = []
    tenuti_vecs = []
    for i, v in enumerate(vecs):
        e_duplicato = False
        for tv in tenuti_vecs:
            if cosine_similarity(v, tv)[0][0] > soglia:
                e_duplicato = True
                break
        if not e_duplicato:
            tenuti.append(chunks[i])
            tenuti_vecs.append(v)
    return tenuti

kb_dedup = deduplica(kb, soglia=0.8)

vect = TfidfVectorizer()
doc_vecs = vect.fit_transform(kb_dedup)

def rag_robusto(domanda, vect, doc_vecs, kb, soglia=0.1):
    query_vec = vect.transform([domanda])
    sims = cosine_similarity(query_vec, doc_vecs)[0]
    if sims.max() < soglia:
        return "Non ho trovato informazioni pertinenti."
    idx = sims.argmax()
    return f"[1] {kb[idx]}\\n\\nDomanda: {domanda}"

risultato_ok = rag_robusto("come si fa il backup dei dati", vect, doc_vecs, kb_dedup)
risultato_vuoto = rag_robusto("quale ricetta serve per un dolce al cioccolato", vect, doc_vecs, kb_dedup)

print(kb_dedup)
print(risultato_ok)
print(risultato_vuoto)`
    }
  ]
});
