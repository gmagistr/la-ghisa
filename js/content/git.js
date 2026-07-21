window.MODULES.push({
  id: "git",
  name: "Git",
  tagline: "La sala del controllo versione: commit, branch, merge, rebase, conflitti. Simulati in Python per capire il modello, non i comandi a memoria.",
  intro: "Git è ovunque nel lavoro reale, e i colloqui lo chiedono. Qui non digiti comandi shell (non girano in Pyodide): costruisci un mini-Git in puro Python — commit come nodi, branch come puntatori, merge e conflitti — per capire DAVVERO il modello che sta sotto ai comandi.",
  packages: [],
  items: [

    { type: "theory", title: "Il modello mentale di Git", html: `
<p>Git non salva "differenze": salva <strong>snapshot</strong>. Ogni <strong>commit</strong> è una fotografia completa del progetto in un istante, con un identificatore unico (hash) e un puntatore al commit <em>genitore</em>. La storia è quindi una catena (o un grafo) di commit collegati all'indietro.</p>
<pre><code># modello concettuale in Python:
commit = {
    "hash": "a1b2c3",
    "messaggio": "Aggiungi login",
    "parent": "f9e8d7",     # il commit precedente
    "snapshot": {...},       # lo stato dei file
}</code></pre>
<p>Tre concetti chiave: un <strong>branch</strong> è solo un puntatore mobile a un commit; <strong>HEAD</strong> indica dove sei ora; ogni commit conosce il suo genitore, così Git può ricostruire tutta la storia risalendo la catena. Capito questo, tutti i comandi (branch, merge, rebase) diventano operazioni su puntatori e grafi.</p>
`, more: `
<p>La rivoluzione concettuale di Git rispetto ai sistemi precedenti (SVN, CVS) è essere <strong>distribuito</strong> e basato su snapshot con hash. Ogni clone contiene l'INTERA storia, non solo l'ultima versione — puoi lavorare, committare, ramificare completamente offline. E l'hash di ogni commit è calcolato dal suo contenuto (SHA-1/SHA-256): cambiare anche un byte di un commit vecchio cambierebbe il suo hash e quindi quello di tutti i commit successivi (sono concatenati). Questo rende la storia <strong>immutabile e verificabile</strong> — è di fatto una blockchain di commit, e garantisce l'integrità: nessuno può alterare la storia di nascosto senza che gli hash lo rivelino.</p>
<p>La distinzione tra i "tre alberi" di Git è la fonte di metà della confusione dei principianti: la <strong>working directory</strong> (i file che modifichi), lo <strong>staging area / index</strong> (cosa hai preparato per il prossimo commit, con <code>git add</code>), e il <strong>repository</strong> (i commit salvati, con <code>git commit</code>). Una modifica viaggia working → staging → repository. Lo staging intermedio è ciò che distingue Git da un semplice "salva tutto": ti permette di committare solo ALCUNE modifiche, costruendo commit atomici e sensati invece di calderoni.</p>
<p>Perché il modello a grafo conta per i colloqui: una volta capito che branch = puntatore, HEAD = "dove sono", e commit = nodo con genitore, ogni operazione complessa si demistifica. <code>git merge</code> crea un nodo con DUE genitori; <code>git rebase</code> RICREA i commit su una nuova base (nuovi hash!); <code>git reset</code> sposta un puntatore; <code>git cherry-pick</code> copia un commit altrove. Chi ha in testa il grafo risponde a "cosa fa rebase vs merge?" con sicurezza; chi ha memorizzato i comandi si perde. Questa sala costruisce quel grafo, letteralmente, in Python.</p>
` },

    {
      type: "exercise", id: "gi-01", kg: 5, title: "La catena dei commit",
      task: `<p>Costruisci una mini-storia Git come catena di commit e risali ai genitori:</p>
<ul>
<li><code>storia</code>: dizionario hash &rarr; commit (fornito). Ogni commit ha <code>parent</code> e <code>messaggio</code></li>
<li><code>genitore_di_c3</code>: l'hash del genitore del commit "c3"</li>
<li><code>catena</code>: la lista dei messaggi risalendo da "c3" fino alla radice (parent None), in ordine da c3 alla radice</li>
</ul>`,
      setup: `storia = {
    "c1": {"parent": None, "messaggio": "primo commit"},
    "c2": {"parent": "c1", "messaggio": "aggiungi feature"},
    "c3": {"parent": "c2", "messaggio": "correggi bug"},
}`,
      starter: `# storia: hash -> {parent, messaggio}

genitore_di_c3 = ...

catena = []
h = "c3"
while h is not None:
    catena.append(storia[h]["messaggio"])
    h = ...   # risali al genitore

print("genitore di c3:", genitore_di_c3)
print("catena:", catena)`,
      check: `assert genitore_di_c3 == "c2", "genitore_di_c3: storia['c3']['parent'] = 'c2'"
assert catena == ["correggi bug", "aggiungi feature", "primo commit"], "catena: risali da c3 alla radice seguendo i parent"`,
      hint: `<p>Il genitore: <code>storia["c3"]["parent"]</code>. Nel ciclo, per risalire: <code>h = storia[h]["parent"]</code>. Ti fermi quando parent è None (la radice).</p>`,
      solution: `genitore_di_c3 = storia["c3"]["parent"]

catena = []
h = "c3"
while h is not None:
    catena.append(storia[h]["messaggio"])
    h = storia[h]["parent"]

print("genitore di c3:", genitore_di_c3)
print("catena:", catena)`
    },

    { type: "theory", title: "Branch: puntatori mobili", html: `
<p>Un <strong>branch</strong> in Git è sorprendentemente semplice: è solo un <em>nome che punta a un commit</em>. Creare un branch è creare un nuovo puntatore; non copia niente. Committare su un branch sposta quel puntatore in avanti.</p>
<pre><code># branch come dizionario nome -> hash del commit:
branches = {"main": "c3", "feature": "c3"}   # entrambi partono da c3
HEAD = "feature"   # sono sul branch feature

# faccio un commit -> il branch corrente avanza:
branches["feature"] = "c4"   # main resta a c3, feature va a c4</code></pre>
<p>Questo spiega perché in Git creare branch è istantaneo ed economico (è un file da 40 byte con un hash), a differenza di altri sistemi dove ramificare copia tutto. <strong>HEAD</strong> è il puntatore che dice "su quale branch sto lavorando". Committare avanza il branch puntato da HEAD.</p>
`, more: `
<p>La leggerezza dei branch di Git ha cambiato il modo di lavorare: poiché ramificare costa quasi nulla, il flusso normale è creare un branch per OGNI feature o fix (feature branching), lavorarci isolati, e fonderlo quando pronto. Questo abilita workflow come GitHub Flow (branch → pull request → merge) e Git Flow (branch di sviluppo, release, hotfix separati). In sistemi dove il branching era costoso, si evitava di ramificare; con Git è la norma, e i colloqui si aspettano che tu ragioni in termini di branch per unità di lavoro.</p>
<p>La distinzione <strong>HEAD</strong> vs branch merita chiarezza perché è dove ci si perde. Normalmente HEAD punta a un branch (che punta a un commit): sei "su main". Ma HEAD può puntare DIRETTAMENTE a un commit, saltando il branch — è lo stato <strong>detached HEAD</strong>, che capita facendo checkout di un commit specifico o di un tag. In detached HEAD i commit che fai non appartengono a nessun branch e possono "perdersi" (garbage collection) se non crei un branch per trattenerli. Capire che HEAD → branch → commit (con l'anello branch a volte saltato) spiega questo stato altrimenti misterioso.</p>
<p>I branch remoti aggiungono un livello: <code>origin/main</code> è il puntatore che ricorda dov'era <code>main</code> sul remoto all'ultima sincronizzazione. <code>git fetch</code> aggiorna i puntatori remoti senza toccare i tuoi branch locali; <code>git pull</code> = fetch + merge (o rebase). La confusione classica "il mio main e origin/main sono diversi" si scioglie capendo che sono DUE puntatori distinti: il tuo lavoro locale e la tua ultima foto del remoto. Tutto in Git, ancora una volta, è puntatori a commit — locali o remoti che siano.</p>
` },

    {
      type: "exercise", id: "gi-02", kg: 10, title: "Creare e avanzare un branch",
      task: `<p>Simula la creazione di un branch e un commit su di esso:</p>
<ul>
<li><code>branches</code>: parte con <code>{"main": "c3"}</code></li>
<li>crea il branch <code>"feature"</code> puntato allo stesso commit di main (c3)</li>
<li><code>HEAD</code>: passa a "feature"</li>
<li>simula un commit "c4": avanza SOLO il branch puntato da HEAD</li>
<li><code>main_fermo</code>: <code>True</code> se main è ancora a "c3" dopo il commit su feature</li>
<li><code>feature_avanzata</code>: <code>True</code> se feature ora punta a "c4"</li>
</ul>`,
      starter: `branches = {"main": "c3"}

# 1. crea il branch feature allo stesso commit di main
branches["feature"] = ...

# 2. spostati su feature
HEAD = "feature"

# 3. commit "c4": avanza il branch corrente (quello puntato da HEAD)
branches[HEAD] = "c4"

main_fermo = ...
feature_avanzata = ...

print("branches:", branches, "| HEAD:", HEAD)`,
      check: `assert branches["feature"] == "c4", "dopo il commit, feature deve puntare a c4"
assert branches["main"] == "c3", "main deve restare fermo a c3 (il commit era su feature)"
assert main_fermo == True, "main_fermo: branches['main'] == 'c3'"
assert feature_avanzata == True, "feature_avanzata: branches['feature'] == 'c4'"`,
      hint: `<p>Creare il branch = copiare l'hash: <code>branches["feature"] = branches["main"]</code>. Committare avanza solo <code>branches[HEAD]</code>. main non si muove perché HEAD punta a feature.</p>`,
      solution: `branches = {"main": "c3"}

branches["feature"] = branches["main"]

HEAD = "feature"

branches[HEAD] = "c4"

main_fermo = branches["main"] == "c3"
feature_avanzata = branches["feature"] == "c4"

print("branches:", branches, "| HEAD:", HEAD)`
    },

    { type: "theory", title: "Merge: unire due storie", html: `
<p>Il <strong>merge</strong> unisce il lavoro di due branch. Ci sono due casi:</p>
<p><strong>Fast-forward</strong>: se il branch di destinazione non è avanzato da quando hai ramificato, Git sposta semplicemente il puntatore in avanti — nessun nuovo commit, storia lineare.</p>
<p><strong>Merge a tre vie</strong>: se ENTRAMBI i branch sono avanzati, Git crea un nuovo <strong>merge commit</strong> con DUE genitori, che combina le due storie.</p>
<pre><code># merge commit: l'unico con due parent
merge_commit = {
    "hash": "m1",
    "parents": ["c4", "d3"],   # main e feature
    "messaggio": "Merge feature into main",
}</code></pre>
<p>Il merge commit a due genitori è ciò che rende la storia di Git un <strong>grafo</strong> (DAG, grafo aciclico diretto) e non una semplice lista. È il punto dove due linee di sviluppo si ricongiungono.</p>
`, more: `
<p>Il <strong>fast-forward</strong> è possibile solo quando la storia non è divergente: hai creato feature da main, hai committato su feature, e main NON è cambiato nel frattempo. Allora "fondere feature in main" è banale — sposta main in avanti fino a feature, storia perfettamente lineare, nessun merge commit. È il caso pulito. Molti team lo forzano (<code>--ff-only</code>) o al contrario lo vietano (<code>--no-ff</code>, crea sempre un merge commit) a seconda che preferiscano storia lineare o traccia esplicita di ogni merge.</p>
<p>Il <strong>merge a tre vie</strong> scatta quando entrambi i branch sono avanzati (storia divergente). "Tre vie" perché Git guarda tre snapshot: i due branch e il loro <strong>antenato comune</strong> (merge base). Confrontando ciascun branch con l'antenato capisce cosa è cambiato da entrambe le parti e le combina. Se le modifiche toccano parti diverse, il merge è automatico; se toccano le STESSE righe, c'è un conflitto (prossima lavagna). Il merge commit risultante ha due genitori e "cuce" le due storie in un unico grafo.</p>
<p>La scelta merge vs rebase (prossima lavagna) è una delle discussioni più accese e una domanda da colloquio garantita. Il merge PRESERVA la storia reale: si vede che c'erano due linee e quando si sono unite, con i merge commit come cicatrici visibili. Chi preferisce il merge valorizza la fedeltà storica e la tracciabilità. Il rovescio è che con molti branch la storia diventa un intrico di merge commit ("railway diagram" ingarbugliato). È il trade-off tra una storia VERA ma disordinata (merge) e una storia PULITA ma riscritta (rebase) — non c'è risposta giusta assoluta, solo convenzioni di team.</p>
` },

    {
      type: "exercise", id: "gi-03", kg: 15, title: "Fast-forward o merge a tre vie?",
      task: `<p>Determina il tipo di merge in base allo stato dei branch. Scrivi una funzione che decide:</p>
<ul>
<li><code>tipo_merge</code>: funzione che dati (base_comune, commit_dest, commit_sorgente) restituisce "fast-forward" se il destinatario è ancora all'antenato comune, altrimenti "tre-vie"</li>
<li><code>caso_ff</code>: il tipo quando main è ancora alla base (non è avanzato)</li>
<li><code>caso_3vie</code>: il tipo quando entrambi sono avanzati oltre la base</li>
</ul>`,
      starter: `def tipo_merge(base, dest, sorgente):
    # se il destinatario e' ancora alla base comune -> fast-forward
    if dest == base:
        return "fast-forward"
    else:
        return "tre-vie"

# caso 1: main fermo alla base "c2", feature avanzata a "f2"
caso_ff = tipo_merge("c2", "c2", "f2")
# caso 2: main avanzato a "c4", feature a "f2", base comune "c2"
caso_3vie = ...

print("main fermo:", caso_ff)
print("entrambi avanzati:", caso_3vie)`,
      check: `def _tm(base, dest, sorgente):
    return "fast-forward" if dest == base else "tre-vie"
assert caso_ff == "fast-forward", "caso_ff: main e' ancora alla base -> fast-forward (sposta solo il puntatore)"
assert caso_3vie == "tre-vie", "caso_3vie: entrambi avanzati -> merge commit a tre vie"`,
      hint: `<p>La regola: se il branch di destinazione è ancora fermo all'antenato comune (<code>dest == base</code>), basta un fast-forward. Se è avanzato, serve un merge a tre vie. <code>caso_3vie = tipo_merge("c2", "c4", "f2")</code>.</p>`,
      solution: `def tipo_merge(base, dest, sorgente):
    if dest == base:
        return "fast-forward"
    else:
        return "tre-vie"

caso_ff = tipo_merge("c2", "c2", "f2")
caso_3vie = tipo_merge("c2", "c4", "f2")

print("main fermo:", caso_ff)
print("entrambi avanzati:", caso_3vie)`
    },

    {
      type: "exercise", id: "gi-04", kg: 15, title: "Il merge commit a due genitori",
      task: `<p>Simula un merge a tre vie che crea un merge commit. Verifica che abbia due genitori:</p>
<ul>
<li><code>merge_commit</code>: dizionario con <code>parents</code> = [commit di main, commit di feature] e un messaggio</li>
<li><code>ha_due_genitori</code>: <code>True</code> se il merge commit ha esattamente 2 parents</li>
<li><code>main_dopo_merge</code>: dopo il merge, main punta al merge commit "m1"</li>
<li><code>e_un_grafo</code>: <code>True</code> — il merge commit rende la storia un grafo, non una lista (concettuale)</li>
</ul>`,
      starter: `branches = {"main": "c4", "feature": "f2"}

merge_commit = {
    "hash": "m1",
    "parents": [branches["main"], branches["feature"]],
    "messaggio": "Merge feature into main",
}

# main avanza al merge commit
branches["main"] = "m1"

ha_due_genitori = ...
main_dopo_merge = ...
e_un_grafo = ...

print("merge commit:", merge_commit)
print("branches:", branches)`,
      check: `assert 'merge_commit' in globals() and merge_commit["parents"] == ["c4", "f2"], "merge_commit: parents = [main, feature]"
assert ha_due_genitori == True, "ha_due_genitori: len(merge_commit['parents']) == 2"
assert main_dopo_merge == True, "main_dopo_merge: branches['main'] == 'm1'"
assert e_un_grafo == True, "e_un_grafo: True — due genitori = grafo, non lista lineare"`,
      hint: `<p><code>ha_due_genitori = len(merge_commit["parents"]) == 2</code>. <code>main_dopo_merge = branches["main"] == "m1"</code>. Il merge commit è l'unico tipo con due genitori: da qui il grafo.</p>`,
      solution: `branches = {"main": "c4", "feature": "f2"}

merge_commit = {
    "hash": "m1",
    "parents": [branches["main"], branches["feature"]],
    "messaggio": "Merge feature into main",
}

branches["main"] = "m1"

ha_due_genitori = len(merge_commit["parents"]) == 2
main_dopo_merge = branches["main"] == "m1"
e_un_grafo = True

print("merge commit:", merge_commit)
print("branches:", branches)`
    },

    { type: "theory", title: "Conflitti di merge", html: `
<p>Quando due branch modificano le <strong>stesse righe</strong> dello stesso file in modi diversi, Git non può decidere da solo: è un <strong>conflitto di merge</strong>. Git si ferma e marca il file con i due contenuti in competizione.</p>
<pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
prezzo = 100        # la tua versione (branch corrente)
=======
prezzo = 120        # la loro versione (branch che stai fondendo)
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</code></pre>
<p>Risolvere un conflitto significa scegliere manualmente cosa tenere (una versione, l'altra, o una combinazione), rimuovere i marcatori, e poi <code>git add</code> + <code>git commit</code> per completare il merge. Git conflittua solo dove è DAVVERO ambiguo: se i due branch toccano righe o file diversi, fonde automaticamente.</p>
`, more: `
<p>Un malinteso comune è pensare che i conflitti siano frequenti o segno di qualcosa di rotto: in realtà Git è molto bravo a fondere automaticamente, e conflittua SOLO sulla stessa regione di testo modificata da entrambe le parti. Modifiche a funzioni diverse, file diversi, o parti lontane dello stesso file si fondono senza problemi. I conflitti aumentano con branch che vivono a lungo e divergono molto — motivo per cui la pratica di integrare spesso (branch a vita breve, merge/rebase frequenti su main) riduce drasticamente il dolore dei conflitti.</p>
<p>I marcatori di conflitto hanno una struttura precisa da saper leggere: tra <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> e <code>=======</code> c'è la versione del branch CORRENTE (dove sei, "ours"); tra <code>=======</code> e <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> c'è la versione del branch che stai INTEGRANDO ("theirs"). Risolvere NON significa necessariamente scegliere una delle due: spesso la risoluzione giusta è combinarle (tenere entrambe le modifiche se compatibili) o scrivere qualcosa di nuovo. L'importante è rimuovere TUTTI i marcatori — lasciarne uno per errore rompe il codice, ed è un incidente classico.</p>
<p>Strumenti e strategie per i conflitti che i colloqui apprezzano: <code>git status</code> elenca i file in conflitto; i merge tool visuali (VS Code, meld) mostrano le versioni affiancate; <code>git merge --abort</code> annulla tutto e torna allo stato pre-merge se ti sei incasinato; le strategie <code>-X ours</code>/<code>-X theirs</code> risolvono automaticamente preferendo un lato (usare con cautela). E una tecnica avanzata, <code>git rerere</code> (reuse recorded resolution), ricorda come hai risolto un conflitto e lo riapplica automaticamente se ricompare — utilissimo con rebase ripetuti. Ma il messaggio di fondo resta: i conflitti non si evitano con la tecnica, si riducono integrando spesso.</p>
` },

    {
      type: "exercise", id: "gi-05", kg: 15, title: "Rilevare un conflitto",
      task: `<p>Simula il rilevamento di conflitti confrontando le modifiche di due branch rispetto a una base comune. Conflitto = entrambi cambiano la STESSA riga in modo diverso:</p>
<ul>
<li><code>rileva_conflitti</code>: funzione che dati base/nostro/loro (dict riga&rarr;contenuto) trova le righe in conflitto (fornita)</li>
<li><code>conflitti</code>: le righe in conflitto tra <code>nostro</code> e <code>loro</code></li>
<li><code>c_e_conflitto</code>: <code>True</code> se c'è almeno un conflitto</li>
<li><code>riga_conflitto</code>: il numero della riga in conflitto</li>
</ul>`,
      setup: `base =   {1: "titolo", 2: "prezzo = 100", 3: "sconto = 0"}
nostro = {1: "titolo", 2: "prezzo = 110", 3: "sconto = 0"}   # cambiamo riga 2
loro =   {1: "titolo", 2: "prezzo = 120", 3: "sconto = 5"}   # cambiano riga 2 E 3`,
      starter: `# base/nostro/loro: stato delle righe nei tre snapshot

def rileva_conflitti(base, nostro, loro):
    conflitti = []
    for riga in base:
        cambiato_da_noi = nostro[riga] != base[riga]
        cambiato_da_loro = loro[riga] != base[riga]
        # conflitto: cambiato da entrambi, in modo DIVERSO
        if cambiato_da_noi and cambiato_da_loro and nostro[riga] != loro[riga]:
            conflitti.append(riga)
    return conflitti

conflitti = rileva_conflitti(base, nostro, loro)
c_e_conflitto = ...
riga_conflitto = ...

print("righe in conflitto:", conflitti)`,
      check: `def _rc(base, nostro, loro):
    c=[]
    for r in base:
        if nostro[r]!=base[r] and loro[r]!=base[r] and nostro[r]!=loro[r]: c.append(r)
    return c
_conf = _rc(base, nostro, loro)
assert conflitti == _conf == [2], "conflitti: solo la riga 2 (entrambi cambiano prezzo in modo diverso). La riga 3 la cambia solo 'loro' -> merge automatico, no conflitto"
assert c_e_conflitto == True, "c_e_conflitto: len(conflitti) > 0"
assert riga_conflitto == 2, "riga_conflitto: 2"`,
      hint: `<p>La riga 2 è cambiata da entrambi in modo diverso (110 vs 120) &rarr; conflitto. La riga 3 è cambiata solo da "loro" &rarr; Git la fonde automaticamente, nessun conflitto. <code>c_e_conflitto = len(conflitti) &gt; 0</code>.</p>`,
      solution: `def rileva_conflitti(base, nostro, loro):
    conflitti = []
    for riga in base:
        cambiato_da_noi = nostro[riga] != base[riga]
        cambiato_da_loro = loro[riga] != base[riga]
        if cambiato_da_noi and cambiato_da_loro and nostro[riga] != loro[riga]:
            conflitti.append(riga)
    return conflitti

conflitti = rileva_conflitti(base, nostro, loro)
c_e_conflitto = len(conflitti) > 0
riga_conflitto = conflitti[0]

print("righe in conflitto:", conflitti)`
    },

    { type: "theory", title: "Rebase: riscrivere la storia", html: `
<p>Il <strong>rebase</strong> è l'alternativa al merge per integrare i cambiamenti. Invece di creare un merge commit, RIAPPLICA i tuoi commit sopra la punta di un altro branch, come se li avessi scritti da lì.</p>
<pre><code># prima: main = c1-c2-c3,  feature (da c1) = c1-f1-f2
# git rebase main (stando su feature):
# dopo:  feature = c1-c2-c3-f1'-f2'   (f1', f2' sono NUOVI commit!)</code></pre>
<p>Il risultato è una storia <strong>lineare</strong>, senza merge commit — più pulita da leggere. Ma c'è un prezzo: i commit riapplicati sono NUOVI (hash diversi), quindi la storia viene <em>riscritta</em>. Da qui la regola d'oro: <strong>MAI fare rebase di commit già condivisi/pubblicati</strong> — riscrivere una storia che altri hanno già scaricato crea caos.</p>
`, more: `
<p>Il meccanismo del rebase: Git prende i commit del tuo branch che non sono nella base, li mette "da parte", sposta il branch alla punta della base, e RIAPPLICA quei commit uno per uno. Ogni commit riapplicato ottiene un hash NUOVO perché il suo genitore è cambiato (e l'hash dipende dal genitore). Ecco perché il rebase "riscrive la storia": i commit originali f1, f2 diventano f1', f2', commit diversi con lo stesso contenuto ma identità nuova. I vecchi f1, f2 restano orfani finché il garbage collector non li elimina.</p>
<p>La <strong>regola d'oro del rebase</strong> — mai riscrivere storia pubblica — è la cosa più importante di questa lavagna e una domanda da colloquio garantita. Se hai pushato feature e un collega ha basato il suo lavoro su f1/f2, fare rebase (che li trasforma in f1'/f2') significa che la sua storia e la tua divergono irrimediabilmente: quando prova a integrare, Git vede commit duplicati e la storia si aggroviglia. Il rebase è sicuro SOLO su commit locali che non hai ancora condiviso. Sui branch pubblici si usa il merge, che non riscrive nulla.</p>
<p>Il <strong>rebase interattivo</strong> (<code>git rebase -i</code>) è il superpotere: permette di riordinare, unire (squash), modificare o eliminare commit prima di condividerli. Il caso d'uso tipico: hai fatto 8 commit disordinati ("wip", "fix", "typo", "ancora fix") mentre sviluppavi, e prima di aprire la pull request li "schiacci" in 1-2 commit puliti e sensati. È igiene della storia — trasforma il tuo processo caotico di sviluppo in una narrazione chiara per chi rivede. Ma vale sempre la regola d'oro: fallo PRIMA di pushare. La sintesi merge vs rebase: rebase per pulire il TUO lavoro locale prima di condividerlo; merge per integrare lavoro già condiviso preservando la storia reale.</p>
` },

    {
      type: "exercise", id: "gi-06", kg: 20, title: "Rebase riscrive gli hash",
      task: `<p>Simula un rebase: i commit riapplicati sono NUOVI. Dimostra la riscrittura della storia:</p>
<ul>
<li><code>rebase</code>: funzione che riapplica i commit di feature sopra la punta di main, generando nuovi hash (fornita)</li>
<li><code>nuovi_commit</code>: la lista dei nuovi hash dopo il rebase di [f1, f2] su main con punta c3</li>
<li><code>hash_cambiati</code>: <code>True</code> se i nuovi hash sono diversi dagli originali (["f1","f2"])</li>
<li><code>storia_lineare</code>: <code>True</code> — dopo il rebase non ci sono merge commit (concettuale)</li>
<li><code>regola_oro</code>: <code>True</code> se è vero che NON si fa rebase di commit già pubblicati</li>
</ul>`,
      starter: `def rebase(commit_feature, punta_main):
    # riapplica ogni commit di feature sopra main: nuovo hash = vecchio + "'"
    nuovi = []
    base = punta_main
    for c in commit_feature:
        nuovo_hash = c + "'"   # segna che e' un commit RISCRITTO
        nuovi.append(nuovo_hash)
        base = nuovo_hash
    return nuovi

commit_feature = ["f1", "f2"]
nuovi_commit = rebase(commit_feature, "c3")
hash_cambiati = ...
storia_lineare = ...
regola_oro = ...

print("commit originali:", commit_feature)
print("dopo rebase:", nuovi_commit)`,
      check: `def _rb(cf, pm):
    n=[]; b=pm
    for c in cf: h=c+"'"; n.append(h); b=h
    return n
_nc = _rb(["f1","f2"], "c3")
assert nuovi_commit == _nc == ["f1'", "f2'"], "nuovi_commit: rebase([f1,f2], 'c3') -> [f1', f2'] (nuovi hash)"
assert hash_cambiati == True, "hash_cambiati: True — i commit riapplicati hanno hash NUOVI"
assert storia_lineare == True, "storia_lineare: True — il rebase produce storia lineare, senza merge commit"
assert regola_oro == True, "regola_oro: True — MAI rebase di commit gia' pubblicati/condivisi"`,
      hint: `<p><code>hash_cambiati = nuovi_commit != commit_feature</code> — gli hash cambiano perché cambia il genitore. La storia diventa lineare (nessun merge commit). La regola d'oro è sempre vera: <code>regola_oro = True</code>.</p>`,
      solution: `def rebase(commit_feature, punta_main):
    nuovi = []
    base = punta_main
    for c in commit_feature:
        nuovo_hash = c + "'"
        nuovi.append(nuovo_hash)
        base = nuovo_hash
    return nuovi

commit_feature = ["f1", "f2"]
nuovi_commit = rebase(commit_feature, "c3")
hash_cambiati = nuovi_commit != commit_feature
storia_lineare = True
regola_oro = True

print("commit originali:", commit_feature)
print("dopo rebase:", nuovi_commit)`
    },

    { type: "theory", title: "Reset, revert, cherry-pick", html: `
<p>Tre modi di manipolare la storia, con effetti molto diversi:</p>
<ul>
<li><strong>reset</strong>: sposta il branch INDIETRO a un commit precedente. <code>--soft</code> tiene le modifiche in staging, <code>--hard</code> le CANCELLA. Riscrive la storia locale.</li>
<li><strong>revert</strong>: crea un NUOVO commit che ANNULLA le modifiche di un commit precedente. Non riscrive la storia — sicuro sui branch pubblici.</li>
<li><strong>cherry-pick</strong>: copia UN commit specifico da un branch a un altro (nuovo hash).</li>
</ul>
<pre><code>git reset --hard c2     # torna a c2, butta tutto ciò che c'era dopo (PERICOLOSO)
git revert c3           # crea c4 che disfa c3, storia intatta (SICURO)
git cherry-pick a1b2    # applica qui il commit a1b2 preso altrove</code></pre>
`, more: `
<p>La distinzione <strong>reset vs revert</strong> è la più importante e la più fraintesa. <code>reset</code> RISCRIVE la storia: sposta il puntatore del branch indietro, facendo "sparire" i commit successivi (che diventano orfani). È perfetto per correggere errori LOCALI non ancora pushati, ma disastroso su branch pubblici (stessa regola d'oro del rebase). <code>revert</code>, invece, non cancella nulla: crea un NUOVO commit che applica le modifiche INVERSE del commit da annullare. La storia resta intatta e completa — si vede sia il commit "sbagliato" sia quello che lo annulla. Su un branch condiviso, per disfare un commit già pushato, si usa SEMPRE revert, mai reset.</p>
<p>I tre livelli di <code>reset</code> vanno capiti in termini dei tre alberi di Git: <code>--soft</code> sposta solo il puntatore del branch, lasciando staging e working directory intatti (le modifiche tornano "pronte da committare") — utile per rifare un commit; <code>--mixed</code> (default) sposta puntatore e svuota lo staging ma tiene i file modificati; <code>--hard</code> sposta tutto e CANCELLA le modifiche nella working directory — l'unico distruttivo, quello che può farti perdere lavoro. "git reset --hard" su lavoro non committato è irrecuperabile (non c'è nemmeno un commit orfano da cui ripescare). È il comando davanti a cui fermarsi un secondo in più.</p>
<p><code>cherry-pick</code> risolve un problema pratico frequente: "voglio QUEL commit specifico, ma non tutto il branch". Casi tipici: portare un hotfix urgente da un branch di sviluppo direttamente in produzione senza trascinare feature incomplete, o recuperare un singolo commit da un branch abbandonato. Come il rebase, crea un commit NUOVO (hash diverso) perché lo applica in un contesto diverso. E la rete di sicurezza per tutti questi comandi è il <strong>reflog</strong> (<code>git reflog</code>): Git tiene un registro di OGNI posizione in cui è stato HEAD, anche dopo reset "distruttivi", per circa 90 giorni — quindi un commit "perso" con reset --hard è spesso recuperabile trovandone l'hash nel reflog. Sapere che il reflog esiste è ciò che distingue chi va nel panico da chi recupera il lavoro.</p>
` },

    {
      type: "exercise", id: "gi-07", kg: 15, title: "Reset contro revert",
      task: `<p>Simula la differenza chiave: reset accorcia la storia, revert la allunga. Su una storia [c1, c2, c3]:</p>
<ul>
<li><code>dopo_reset</code>: la storia dopo <code>reset</code> a c1 (torna indietro: restano solo [c1])</li>
<li><code>dopo_revert</code>: la storia dopo <code>revert</code> di c3 (aggiunge un commit che annulla c3: [c1, c2, c3, revert_c3])</li>
<li><code>reset_accorcia</code>: <code>True</code> se <code>dopo_reset</code> è più corta della storia originale</li>
<li><code>revert_allunga</code>: <code>True</code> se <code>dopo_revert</code> è più lunga</li>
<li><code>revert_sicuro_pubblico</code>: <code>True</code> se revert (non reset) è quello sicuro sui branch pubblici</li>
</ul>`,
      starter: `storia = ["c1", "c2", "c3"]

# reset a c1: butta via tutto dopo c1
dopo_reset = ...   # solo [c1]

# revert di c3: aggiunge un commit che annulla c3
dopo_revert = storia + ["revert_c3"]

reset_accorcia = ...
revert_allunga = ...
revert_sicuro_pubblico = ...

print("originale:", storia)
print("dopo reset a c1:", dopo_reset)
print("dopo revert di c3:", dopo_revert)`,
      check: `assert dopo_reset == ["c1"], "dopo_reset: reset a c1 lascia solo ['c1']"
assert dopo_revert == ["c1", "c2", "c3", "revert_c3"], "dopo_revert: aggiunge un commit di annullamento"
assert reset_accorcia == True, "reset_accorcia: len(dopo_reset) < len(storia) — riscrive/accorcia la storia"
assert revert_allunga == True, "revert_allunga: len(dopo_revert) > len(storia) — aggiunge, non toglie"
assert revert_sicuro_pubblico == True, "revert_sicuro_pubblico: True — revert non riscrive la storia, sicuro sui branch condivisi"`,
      hint: `<p><code>dopo_reset = ["c1"]</code> (torni indietro, il resto sparisce). <code>reset_accorcia = len(dopo_reset) &lt; len(storia)</code>, <code>revert_allunga = len(dopo_revert) &gt; len(storia)</code>. Revert è sicuro perché non cancella.</p>`,
      solution: `storia = ["c1", "c2", "c3"]

dopo_reset = ["c1"]

dopo_revert = storia + ["revert_c3"]

reset_accorcia = len(dopo_reset) < len(storia)
revert_allunga = len(dopo_revert) > len(storia)
revert_sicuro_pubblico = True

print("originale:", storia)
print("dopo reset a c1:", dopo_reset)
print("dopo revert di c3:", dopo_revert)`
    },

    {
      type: "exercise", id: "gi-08", kg: 15, title: "Cherry-pick: prendi quel commit",
      task: `<p>Simula un cherry-pick: copiare un singolo commit da un branch a un altro (con hash nuovo, come rebase):</p>
<ul>
<li><code>cherry_pick</code>: funzione che applica un commit su un branch, restituendo il nuovo hash (commit + "-cp")</li>
<li><code>main_commits</code>: parte come ["c1", "c2"]; cherry-picka "f5" (preso da feature)</li>
<li><code>nuovo_hash</code>: l'hash del commit cherry-pickato su main</li>
<li><code>hash_diverso</code>: <code>True</code> se il nuovo hash è diverso dall'originale "f5" (è una COPIA)</li>
<li><code>main_ha_3</code>: <code>True</code> se main ora ha 3 commit</li>
</ul>`,
      starter: `def cherry_pick(commit, branch_commits):
    nuovo = commit + "-cp"   # copia: nuovo hash
    return branch_commits + [nuovo], nuovo

main_commits = ["c1", "c2"]
main_commits, nuovo_hash = cherry_pick("f5", main_commits)

hash_diverso = ...
main_ha_3 = ...

print("main dopo cherry-pick:", main_commits)
print("nuovo hash del commit copiato:", nuovo_hash)`,
      check: `assert nuovo_hash == "f5-cp", "nuovo_hash: cherry-pick di f5 -> f5-cp (copia con nuovo hash)"
assert main_commits == ["c1", "c2", "f5-cp"], "main_commits: f5 appare su main come f5-cp"
assert hash_diverso == True, "hash_diverso: True — il commit cherry-pickato e' una COPIA, hash diverso dall'originale"
assert main_ha_3 == True, "main_ha_3: len(main_commits) == 3"`,
      hint: `<p>Il cherry-pick copia il commit con un nuovo hash: <code>hash_diverso = nuovo_hash != "f5"</code>. <code>main_ha_3 = len(main_commits) == 3</code>. Come rebase, applicare un commit altrove ne cambia l'identità.</p>`,
      solution: `def cherry_pick(commit, branch_commits):
    nuovo = commit + "-cp"
    return branch_commits + [nuovo], nuovo

main_commits = ["c1", "c2"]
main_commits, nuovo_hash = cherry_pick("f5", main_commits)

hash_diverso = nuovo_hash != "f5"
main_ha_3 = len(main_commits) == 3

print("main dopo cherry-pick:", main_commits)
print("nuovo hash del commit copiato:", nuovo_hash)`
    },

    { type: "theory", title: "Stash e workflow con pull request", html: `
<p>Due strumenti del lavoro quotidiano. Lo <strong>stash</strong> mette da parte temporaneamente le modifiche non committate, per pulire la working directory (es. devi cambiare branch al volo) e riprenderle dopo.</p>
<pre><code>git stash          # metti via le modifiche correnti (working dir pulita)
git stash pop      # riprendile</code></pre>
<p>La <strong>pull request</strong> (PR) è il cuore della collaborazione moderna: proponi di fondere il tuo branch, altri lo <em>revisionano</em>, commentano, chiedono modifiche, e solo dopo approvazione si fa il merge. Non è un comando Git nativo ma una funzione di GitHub/GitLab, costruita sopra branch e merge.</p>
<pre><code># il flusso tipico (GitHub Flow):
# 1. branch da main   2. commit   3. push   4. apri PR
# 5. review + CI       6. merge    7. cancella il branch</code></pre>
`, more: `
<p>Lo stash è una pila (stack): puoi accumulare più stash e recuperarli in ordine. <code>git stash</code> salva e pulisce, <code>git stash pop</code> riapplica e rimuove dalla pila, <code>git stash apply</code> riapplica ma lascia nella pila, <code>git stash list</code> mostra cosa hai messo via. Il caso d'uso classico: stai lavorando a una feature, arriva un bug urgente da fixare su main — stash, cambio branch, fix, torno, stash pop. È lavoro non committato messo al sicuro temporaneamente. Attenzione: lo stash è LOCALE e non viene pushato, e stash dimenticati sono una fonte comune di "dov'è finito quel lavoro?".</p>
<p>La pull request ha trasformato lo sviluppo software in un processo SOCIALE e verificato. Non è solo "fondere codice": è il punto dove avviene la <strong>code review</strong> (un collega legge le modifiche e commenta), dove girano i controlli automatici (<strong>CI</strong>: test, linting, build — se falliscono, il merge è bloccato), e dove si discute il design prima che entri in main. Questo intercetta bug, diffonde conoscenza nel team, e mantiene la qualità del codice. Nei colloqui, saper descrivere un flusso PR sano (branch piccoli e focalizzati, descrizione chiara, review, CI verde, merge) segnala maturità professionale più di qualsiasi comando Git avanzato.</p>
<p>Le strategie di merge della PR sono una scelta con conseguenze: <strong>merge commit</strong> (preserva tutti i commit del branch + un merge commit — storia completa ma verbosa), <strong>squash and merge</strong> (schiaccia tutti i commit del branch in UNO solo su main — storia di main pulitissima, un commit per feature, ma si perde il dettaglio dei singoli passi), <strong>rebase and merge</strong> (riapplica i commit su main linearmente, senza merge commit). Molti team scelgono squash per avere una main dove ogni commit = una feature/fix atomica e reversibile con un revert. La scelta riflette la stessa tensione merge-vs-rebase: storia dettagliata e reale, o storia pulita e leggibile. Conoscere i tre e i loro trade-off è esattamente ciò che distingue chi ha lavorato in team da chi ha usato Git solo da solo.</p>
` },

    {
      type: "exercise", id: "gi-09", kg: 15, title: "Stash: metti via e riprendi",
      task: `<p>Simula lo stash come una pila di modifiche messe da parte:</p>
<ul>
<li><code>working_dir</code>: parte con modifiche <code>["bozza feature X"]</code></li>
<li><code>stash_stack</code>: la pila di stash (parte vuota)</li>
<li>fai <code>stash</code>: sposta le modifiche dalla working dir alla pila; la working dir si svuota</li>
<li><code>wd_pulita</code>: <code>True</code> se la working dir è vuota dopo lo stash</li>
<li>poi fai <code>stash pop</code>: riporta le modifiche nella working dir e svuota la pila</li>
<li><code>modifiche_recuperate</code>: <code>True</code> se dopo il pop la working dir contiene di nuovo la bozza</li>
</ul>`,
      starter: `working_dir = ["bozza feature X"]
stash_stack = []

# stash: sposta working_dir nella pila
stash_stack.append(working_dir[:])
working_dir = []
wd_pulita = ...

# ... (qui cambieresti branch, faresti altro) ...

# stash pop: recupera dalla pila
working_dir = stash_stack.pop()
modifiche_recuperate = ...

print("dopo stash: wd pulita =", wd_pulita)
print("dopo pop: working_dir =", working_dir)`,
      check: `assert wd_pulita == True, "wd_pulita: la working dir e' vuota dopo lo stash"
assert working_dir == ["bozza feature X"], "working_dir: dopo il pop torna la bozza"
assert modifiche_recuperate == True, "modifiche_recuperate: True — lo stash pop ripristina il lavoro messo via"
assert stash_stack == [], "la pila di stash e' vuota dopo il pop"`,
      hint: `<p><code>wd_pulita = len(working_dir) == 0</code> dopo lo stash. <code>modifiche_recuperate = "bozza feature X" in working_dir</code> dopo il pop. Lo stash è una pila: append per mettere via, pop per riprendere.</p>`,
      solution: `working_dir = ["bozza feature X"]
stash_stack = []

stash_stack.append(working_dir[:])
working_dir = []
wd_pulita = len(working_dir) == 0

working_dir = stash_stack.pop()
modifiche_recuperate = "bozza feature X" in working_dir

print("dopo stash: wd pulita =", wd_pulita)
print("dopo pop: working_dir =", working_dir)`
    },

    {
      type: "exercise", id: "gi-10", kg: 20, title: "Squash: da tanti commit a uno",
      task: `<p>Simula lo "squash and merge" di una PR: N commit disordinati del branch diventano UN commit pulito su main.</p>
<ul>
<li><code>commit_branch</code>: i commit del branch feature <code>["wip", "fix typo", "ancora fix", "funziona"]</code></li>
<li><code>squash</code>: funzione che unisce N commit in uno solo con un messaggio pulito (fornita)</li>
<li><code>commit_finale</code>: il singolo commit risultante dallo squash con messaggio "Aggiungi feature login"</li>
<li><code>main_dopo</code>: main (parte ["m1", "m2"]) dopo aver aggiunto il commit squashato</li>
<li><code>uno_solo_su_main</code>: <code>True</code> se main è cresciuto di UN solo commit (non di 4)</li>
</ul>`,
      starter: `def squash(commits, messaggio_pulito):
    # tutti i commit del branch collassano in uno solo
    return {"messaggio": messaggio_pulito, "contiene": commits}

commit_branch = ["wip", "fix typo", "ancora fix", "funziona"]
main = ["m1", "m2"]

commit_finale = squash(commit_branch, "Aggiungi feature login")
main_dopo = main + [commit_finale["messaggio"]]
uno_solo_su_main = ...

print("commit del branch:", len(commit_branch))
print("main dopo squash merge:", main_dopo)
print("un solo commit aggiunto:", uno_solo_su_main)`,
      check: `assert commit_finale["messaggio"] == "Aggiungi feature login", "commit_finale: messaggio pulito"
assert commit_finale["contiene"] == ["wip", "fix typo", "ancora fix", "funziona"], "commit_finale contiene i 4 commit originali collassati"
assert main_dopo == ["m1", "m2", "Aggiungi feature login"], "main_dopo: main + 1 solo commit"
assert uno_solo_su_main == True, "uno_solo_su_main: True — 4 commit disordinati diventano 1 commit pulito su main"`,
      hint: `<p>Lo squash collassa tutti i commit del branch in uno: main cresce di 1, non di 4. <code>uno_solo_su_main = len(main_dopo) == len(main) + 1</code>.</p>`,
      solution: `def squash(commits, messaggio_pulito):
    return {"messaggio": messaggio_pulito, "contiene": commits}

commit_branch = ["wip", "fix typo", "ancora fix", "funziona"]
main = ["m1", "m2"]

commit_finale = squash(commit_branch, "Aggiungi feature login")
main_dopo = main + [commit_finale["messaggio"]]
uno_solo_su_main = len(main_dopo) == len(main) + 1

print("commit del branch:", len(commit_branch))
print("main dopo squash merge:", main_dopo)
print("un solo commit aggiunto:", uno_solo_su_main)`
    },

    {
      type: "exercise", id: "gi-11", kg: 15, title: "Quiz: merge, rebase, reset, revert",
      task: `<p>Cinque affermazioni su Git. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "Un branch in Git è semplicemente un puntatore mobile a un commit"</li>
<li><code>a2</code>: "Il rebase crea nuovi commit con hash diversi, quindi non va fatto su commit già pubblicati"</li>
<li><code>a3</code>: "git revert cancella un commit dalla storia, riscrivendola"</li>
<li><code>a4</code>: "Un merge commit è l'unico tipo di commit con due genitori"</li>
<li><code>a5</code>: "git reset --hard può far perdere modifiche non committate in modo difficile da recuperare"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: branch = puntatore a un commit"
assert a2 == True, "a2 VERA: il rebase riscrive gli hash -> mai su storia pubblica (regola d'oro)"
assert a3 == False, "a3 FALSA: revert AGGIUNGE un commit di annullamento, NON riscrive la storia (e' reset che riscrive)"
assert a4 == True, "a4 VERA: solo il merge commit ha due genitori, da cui il grafo"
assert a5 == True, "a5 VERA: reset --hard su lavoro non committato e' distruttivo (nemmeno il reflog aiuta se non c'era un commit)"`,
      hint: `<p>La trappola è a3: <code>revert</code> AGGIUNGE un commit (sicuro), è <code>reset</code> che riscrive la storia. Le altre riprendono le lavagne: branch=puntatore (a1), regola d'oro del rebase (a2), merge commit a due genitori (a4), reset --hard distruttivo (a5).</p>`,
      solution: `a1 = True
a2 = True
a3 = False
a4 = True
a5 = True

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "gi-12", kg: 25, title: "MASSIMALE: mini-Git funzionante",
      task: `<p>Il gran finale: costruisci un mini-Git funzionante in una classe Python — commit, branch, checkout, log — che rispetta il vero modello a grafo.</p>
<ul>
<li>completa la classe <code>MiniGit</code> (scheletro fornito): <code>commit(msg)</code> avanza il branch corrente creando un nodo con parent; <code>branch(nome)</code> crea un puntatore; <code>checkout(nome)</code> sposta HEAD; <code>log()</code> risale la catena dal commit corrente</li>
<li><code>storia_main</code>: il log di main dopo 2 commit</li>
<li><code>feature_indipendente</code>: <code>True</code> se, committando su feature, main resta fermo</li>
<li><code>n_commit_totali</code>: quanti commit totali esistono nel repo</li>
</ul>`,
      starter: `class MiniGit:
    def __init__(self):
        self.commits = {}          # hash -> {msg, parent}
        self.branches = {"main": None}
        self.head = "main"
        self._counter = 0

    def commit(self, msg):
        self._counter += 1
        h = f"c{self._counter}"
        parent = self.branches[self.head]
        self.commits[h] = {"msg": msg, "parent": parent}
        self.branches[self.head] = h   # avanza il branch corrente
        return h

    def branch(self, nome):
        # crea un branch che punta al commit corrente
        self.branches[nome] = self.branches[self.head]

    def checkout(self, nome):
        self.head = nome

    def log(self):
        # risali dalla punta del branch corrente fino alla radice
        msgs = []
        h = self.branches[self.head]
        while h is not None:
            msgs.append(self.commits[h]["msg"])
            h = self.commits[h]["parent"]
        return msgs

repo = MiniGit()
repo.commit("primo")
repo.commit("secondo")
storia_main = repo.log()

repo.branch("feature")
repo.checkout("feature")
repo.commit("lavoro su feature")

main_prima = repo.branches["main"]
feature_indipendente = ...   # main non e' cambiato committando su feature
n_commit_totali = ...

print("storia main:", storia_main)
print("feature indipendente da main:", feature_indipendente)
print("commit totali nel repo:", n_commit_totali)`,
      check: `class _MG:
    def __init__(self):
        self.commits={}; self.branches={"main":None}; self.head="main"; self._c=0
    def commit(self,m):
        self._c+=1; h=f"c{self._c}"; p=self.branches[self.head]
        self.commits[h]={"msg":m,"parent":p}; self.branches[self.head]=h; return h
    def branch(self,n): self.branches[n]=self.branches[self.head]
    def checkout(self,n): self.head=n
    def log(self):
        r=[]; h=self.branches[self.head]
        while h is not None: r.append(self.commits[h]["msg"]); h=self.commits[h]["parent"]
        return r
_r=_MG(); _r.commit("primo"); _r.commit("secondo"); _sm=_r.log()
_r.branch("feature"); _r.checkout("feature"); _r.commit("lavoro su feature")
assert storia_main == ["secondo", "primo"], "storia_main: log risale dalla punta alla radice -> ['secondo', 'primo']"
assert feature_indipendente == True, "feature_indipendente: True — committare su feature NON muove main"
assert n_commit_totali == 3, "n_commit_totali: 3 (primo, secondo, lavoro su feature) = len(repo.commits)"
assert repo.branches["main"] != repo.branches["feature"], "main e feature puntano a commit diversi"`,
      hint: `<p>La classe è completa: devi solo calcolare i tre valori finali. <code>feature_indipendente = repo.branches["main"] == main_prima</code> (main non si è mosso). <code>n_commit_totali = len(repo.commits)</code>.</p>`,
      solution: `class MiniGit:
    def __init__(self):
        self.commits = {}
        self.branches = {"main": None}
        self.head = "main"
        self._counter = 0

    def commit(self, msg):
        self._counter += 1
        h = f"c{self._counter}"
        parent = self.branches[self.head]
        self.commits[h] = {"msg": msg, "parent": parent}
        self.branches[self.head] = h
        return h

    def branch(self, nome):
        self.branches[nome] = self.branches[self.head]

    def checkout(self, nome):
        self.head = nome

    def log(self):
        msgs = []
        h = self.branches[self.head]
        while h is not None:
            msgs.append(self.commits[h]["msg"])
            h = self.commits[h]["parent"]
        return msgs

repo = MiniGit()
repo.commit("primo")
repo.commit("secondo")
storia_main = repo.log()

repo.branch("feature")
repo.checkout("feature")
repo.commit("lavoro su feature")

main_prima = repo.branches["main"]
feature_indipendente = repo.branches["main"] == main_prima
n_commit_totali = len(repo.commits)

print("storia main:", storia_main)
print("feature indipendente da main:", feature_indipendente)
print("commit totali nel repo:", n_commit_totali)`
    }

  ]
});
