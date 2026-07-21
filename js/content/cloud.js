window.MODULES.push({
  id: "cloud",
  name: "Cloud",
  tagline: "La sala del cloud: object storage, compute, serverless, costi. I concetti AWS/GCP/Azure che servono al data scientist, simulati in Python.",
  intro: "Non serve diventare DevOps, ma un data scientist deve capire il cloud: dove vivono i dati (S3), come gira il calcolo (EC2/Lambda), il modello di costo. Qui simuli in Python i concetti chiave di object storage, compute e serverless — quello che i colloqui chiedono.",
  packages: [],
  items: [

    { type: "theory", title: "I tre pilastri del cloud", html: `
<p>Il cloud, spogliato del marketing, offre tre risorse fondamentali affittate a consumo:</p>
<ul>
<li><strong>Storage</strong>: dove mettere i dati. L'<em>object storage</em> (S3, GCS, Azure Blob) è il più usato per i dati: economico, infinitamente scalabile, accessibile via API.</li>
<li><strong>Compute</strong>: dove far girare il codice. Da macchine virtuali sempre accese (EC2) a funzioni serverless che partono su richiesta (Lambda).</li>
<li><strong>Networking</strong>: come le risorse si parlano e sono raggiungibili (VPC, load balancer, DNS).</li>
</ul>
<p>Il modello mentale: invece di comprare e gestire server fisici, <strong>affitti</strong> risorse virtuali, paghi solo ciò che usi, e scali su e giù in minuti. Per il data scientist, i due concetti quotidiani sono l'object storage (dove vivono i dataset e i modelli) e il compute (dove gira il training e l'inferenza).</p>
`, more: `
<p>Il cambio di paradigma del cloud è passare da CapEx (spesa in conto capitale: compri server che si svalutano) a OpEx (spesa operativa: affitti a consumo). Questo abilita cose prima impossibili per chi non aveva data center: lanciare 100 macchine per un'ora di training pesante e spegnerle (pagheresti ~poche decine di euro), scalare automaticamente sotto carico, sperimentare senza investimenti iniziali. Il rovescio è che i costi possono sfuggire di mano se non monitorati — una macchina GPU dimenticata accesa, o un job che gira più del previsto, generano bollette salate. La consapevolezza dei costi è parte del mestiere cloud.</p>
<p>Il <strong>modello di responsabilità condivisa</strong> è concetto da colloquio: il provider (AWS/GCP/Azure) è responsabile della sicurezza DEL cloud (hardware, data center, rete fisica), tu sei responsabile della sicurezza NEL cloud (configurazione dei permessi, cifratura dei dati, chi accede a cosa). La maggior parte delle violazioni cloud non sono colpa del provider ma di configurazioni sbagliate del cliente — un bucket S3 lasciato pubblico è la causa numero uno di data leak, non un hack del provider. Capire dove finisce la responsabilità del provider e inizia la tua è fondamentale.</p>
<p>Le tre grandi nuvole (AWS, GCP, Azure) offrono servizi equivalenti con nomi diversi, e i colloqui a volte testano la corrispondenza: object storage = S3 (AWS) / Cloud Storage (GCP) / Blob (Azure); VM = EC2 / Compute Engine / Virtual Machines; serverless = Lambda / Cloud Functions / Azure Functions; data warehouse = Redshift / BigQuery / Synapse. I concetti sono trasferibili — imparato uno, gli altri sono traduzioni. Per il ML specificamente contano l'object storage (dataset e modelli), il compute con GPU (training), il serving gestito (SageMaker / Vertex AI / Azure ML) e i data warehouse (per le feature). Non serve padroneggiare tutti i servizi, ma capire le CATEGORIE e quando usarle.</p>
` },

    {
      type: "exercise", id: "cl-01", kg: 5, title: "Storage, compute, o networking?",
      task: `<p>Classifica ogni servizio nella sua categoria ("storage", "compute" o "networking"):</p>
<ul>
<li><code>cat_s3</code>: S3 / object storage &rarr; ?</li>
<li><code>cat_ec2</code>: EC2 / macchina virtuale &rarr; ?</li>
<li><code>cat_lambda</code>: Lambda / funzione serverless &rarr; ?</li>
<li><code>cat_lb</code>: load balancer &rarr; ?</li>
</ul>`,
      starter: `cat_s3 = "storage"
cat_ec2 = ...
cat_lambda = ...
cat_lb = ...

print(cat_s3, cat_ec2, cat_lambda, cat_lb)`,
      check: `assert cat_s3 == "storage", "S3 = object storage"
assert cat_ec2 == "compute", "EC2 = macchina virtuale = compute"
assert cat_lambda == "compute", "Lambda = serverless = compute (codice che gira)"
assert cat_lb == "networking", "load balancer = networking"`,
      hint: `<p>S3 conserva dati (storage). EC2 e Lambda fanno girare codice (compute). Il load balancer instrada il traffico (networking).</p>`,
      solution: `cat_s3 = "storage"
cat_ec2 = "compute"
cat_lambda = "compute"
cat_lb = "networking"

print(cat_s3, cat_ec2, cat_lambda, cat_lb)`
    },

    { type: "theory", title: "Object storage (S3)", html: `
<p>L'<strong>object storage</strong> (S3, GCS, Azure Blob) è dove vivono i dati nel cloud. Non è un filesystem: è un archivio di <strong>oggetti</strong> (file + metadati) organizzati in <strong>bucket</strong>, ognuno identificato da una <em>chiave</em> (il "percorso"), accessibile via API HTTP.</p>
<pre><code># modello concettuale (stile boto3, l'SDK AWS):
s3 = {"mio-bucket": {}}                    # un bucket vuoto
s3["mio-bucket"]["dati/2026/train.csv"] = "..."   # metti un oggetto
s3["mio-bucket"]["dati/2026/train.csv"]           # leggilo per chiave</code></pre>
<p>Caratteristiche chiave: <strong>scalabilità infinita</strong> (petabyte senza pensarci), <strong>economico</strong> (centesimi al GB/mese), <strong>durevole</strong> (repliche multiple, 99.999999999% di durabilità). Le "cartelle" sono un'illusione: le chiavi con "/" sembrano percorsi, ma è tutto uno spazio piatto di chiavi. È lo standard per dataset, modelli, backup, data lake.</p>
`, more: `
<p>La differenza da un filesystem è concettuale e pratica. Un filesystem ha cartelle vere, permette modifiche in-place di parti di un file, e ha operazioni come "rinomina cartella". L'object storage è uno spazio PIATTO chiave→oggetto: le "cartelle" (<code>dati/2026/</code>) sono solo prefissi comuni nelle chiavi, non entità reali. Non puoi modificare un pezzo di un oggetto: lo riscrivi intero. Questo lo rende semplice e scalabile all'infinito (nessuna struttura ad albero da mantenere) ma diverso da come pensi ai file. È ottimizzato per "scrivi una volta, leggi tante", perfetto per dataset e modelli immutabili, meno per dati che cambiano di continuo.</p>
<p>Le <strong>classi di storage</strong> ottimizzano il costo in base alla frequenza d'accesso: Standard (accesso frequente, più caro), Infrequent Access (accesso raro, più economico ma con costo di recupero), Glacier/Archive (backup a lungo termine, costo minimo ma recupero lento, ore). Spostare dati vecchi verso classi più fredde (lifecycle policy automatiche) è una leva di risparmio importante su grandi volumi. Per il ML: i dataset attivi in Standard, i modelli/dataset archiviati in classi fredde.</p>
<p>La sicurezza dell'object storage è dove avvengono i disastri più famosi: i bucket sono PRIVATI di default, ma configurazioni sbagliate che li rendono pubblici hanno esposto miliardi di record (dati sanitari, credenziali, dati personali) in incidenti reali e ripetuti. Le regole d'oro: mai rendere un bucket pubblico se contiene dati sensibili; usare IAM/policy per controllare chi accede a cosa (principio del minimo privilegio); cifrare i dati a riposo; usare URL firmati temporanei per dare accesso limitato invece di aprire tutto. È il caso concreto del "modello di responsabilità condivisa" — il provider protegge l'infrastruttura, ma se lasci il bucket aperto è colpa tua. Per un data scientist che maneggia dati, saper configurare l'accesso a un bucket in sicurezza è competenza di base.</p>
` },

    {
      type: "exercise", id: "cl-02", kg: 10, title: "Un mini object storage",
      task: `<p>Simula le operazioni base di S3 su un mini object storage (dizionari annidati):</p>
<ul>
<li><code>put</code>, <code>get</code>, <code>list_prefix</code>: funzioni per mettere, leggere ed elencare per prefisso (fornite)</li>
<li>metti due oggetti sotto il prefisso "dati/2026/" e uno sotto "modelli/"</li>
<li><code>oggetto_letto</code>: leggi "dati/2026/train.csv"</li>
<li><code>chiavi_2026</code>: elenca tutte le chiavi che iniziano con "dati/2026/"</li>
<li><code>n_dati</code>: quante chiavi sotto "dati/2026/"</li>
</ul>`,
      starter: `s3 = {}

def put(bucket, chiave, valore):
    bucket[chiave] = valore

def get(bucket, chiave):
    return bucket.get(chiave)

def list_prefix(bucket, prefisso):
    return [k for k in bucket if k.startswith(prefisso)]

put(s3, "dati/2026/train.csv", "dati di training")
put(s3, "dati/2026/test.csv", "dati di test")
put(s3, "modelli/rf_v1.pkl", "modello serializzato")

oggetto_letto = get(s3, "dati/2026/train.csv")
chiavi_2026 = ...
n_dati = ...

print("oggetto:", oggetto_letto)
print("chiavi 2026:", chiavi_2026)`,
      check: `_s3 = {"dati/2026/train.csv":"x","dati/2026/test.csv":"y","modelli/rf_v1.pkl":"z"}
_k = [k for k in _s3 if k.startswith("dati/2026/")]
assert oggetto_letto == "dati di training", "oggetto_letto: get(s3, 'dati/2026/train.csv')"
assert sorted(chiavi_2026) == sorted(_k), "chiavi_2026: list_prefix(s3, 'dati/2026/')"
assert n_dati == 2, "n_dati: 2 oggetti sotto dati/2026/"`,
      hint: `<p>Le funzioni sono fornite: <code>chiavi_2026 = list_prefix(s3, "dati/2026/")</code>, <code>n_dati = len(chiavi_2026)</code>. Le "cartelle" sono solo prefissi delle chiavi.</p>`,
      solution: `s3 = {}

def put(bucket, chiave, valore):
    bucket[chiave] = valore

def get(bucket, chiave):
    return bucket.get(chiave)

def list_prefix(bucket, prefisso):
    return [k for k in bucket if k.startswith(prefisso)]

put(s3, "dati/2026/train.csv", "dati di training")
put(s3, "dati/2026/test.csv", "dati di test")
put(s3, "modelli/rf_v1.pkl", "modello serializzato")

oggetto_letto = get(s3, "dati/2026/train.csv")
chiavi_2026 = list_prefix(s3, "dati/2026/")
n_dati = len(chiavi_2026)

print("oggetto:", oggetto_letto)
print("chiavi 2026:", chiavi_2026)`
    },

    { type: "theory", title: "Compute: VM vs serverless", html: `
<p>Due modi opposti di far girare il codice nel cloud:</p>
<ul>
<li><strong>Macchina virtuale</strong> (EC2, Compute Engine): un server virtuale sempre acceso che controlli tu. Paghi per il tempo in cui è accesa, anche se non fa nulla. Flessibile, adatto a carichi continui e a training lunghi (specie con GPU).</li>
<li><strong>Serverless</strong> (Lambda, Cloud Functions): funzioni che partono SU RICHIESTA, girano, e si spengono. Paghi solo per i millisecondi di esecuzione. Zero gestione del server, scala automaticamente, ma con limiti (durata max, memoria, cold start).</li>
</ul>
<pre><code># il modello di costo e' opposto:
costo_vm = ore_accesa * costo_orario          # paghi il TEMPO ACCESO
costo_lambda = n_invocazioni * durata * prezzo # paghi le ESECUZIONI</code></pre>
`, more: `
<p>La scelta VM vs serverless dipende dal PATTERN del carico. Il <strong>serverless</strong> vince per carichi INTERMITTENTI o imprevedibili: un'API chiamata sporadicamente, un job che parte a un evento, un picco occasionale — paghi zero quando non gira, scala da 0 a migliaia di invocazioni automaticamente. La <strong>VM</strong> vince per carichi CONTINUI o pesanti: un training di ore su GPU (il serverless ha limiti di durata, tipicamente 15 min, e niente GPU serie), un servizio ad alto traffico costante (una VM sempre accesa costa meno di milioni di invocazioni serverless), stato persistente. La regola: traffico sporadico → serverless; carico continuo/pesante/GPU → VM.</p>
<p>Il <strong>cold start</strong> è il limite pratico più citato del serverless: la prima invocazione dopo un periodo di inattività deve inizializzare l'ambiente (caricare il runtime, il codice, le dipendenze), aggiungendo latenza (da centinaia di ms a secondi). Per un'API di inferenza ML, dove il modello va caricato in memoria, il cold start può essere pesante (caricare un modello grande a ogni cold start). Mitigazioni: mantenere "caldo" con invocazioni periodiche, provisioned concurrency (istanze pre-avviate, ma paghi), o scegliere una VM se la latenza costante è critica. Il cold start è il motivo per cui il serverless non è sempre la scelta per il serving a bassa latenza.</p>
<p>Il ventaglio è più ricco di due opzioni: i <strong>container</strong> (sala Docker) su servizi gestiti (ECS, Cloud Run, Kubernetes) stanno nel mezzo — più controllo del serverless, meno gestione delle VM, con Cloud Run che offre scalabilità serverless-like per container. Per il ML: le VM con GPU per il training pesante; il serverless o i container per l'inferenza a traffico variabile; i servizi ML gestiti (SageMaker, Vertex AI) che astraggono tutto. E le <strong>spot instance</strong> (VM scontate fino al 90% ma che il provider può revocare) sono un trucco di risparmio enorme per il training tollerante alle interruzioni (checkpoint frequenti + spot instance = training a frazione del costo). Ottimizzare il tipo di compute in base al carico è dove si risparmiano davvero i soldi nel cloud.</p>
` },

    {
      type: "exercise", id: "cl-03", kg: 15, title: "VM o serverless: il costo",
      task: `<p>Confronta il costo di una VM sempre accesa contro il serverless per un carico intermittente, e scegli il più economico:</p>
<ul>
<li><code>costo_vm_mese</code>: una VM a 0.10 €/ora accesa tutto il mese (730 ore)</li>
<li><code>costo_serverless</code>: 50.000 invocazioni al mese, ognuna 0.2 secondi, a 0.000002 €/secondo (calcola invocazioni × durata × prezzo)</li>
<li><code>piu_economico</code>: "serverless" o "vm" per questo carico intermittente</li>
<li><code>quando_vm_conviene</code>: <code>True</code> — la VM conviene per carichi CONTINUI/pesanti (concettuale)</li>
</ul>`,
      starter: `# carico intermittente: 50k invocazioni brevi al mese

costo_vm_mese = 0.10 * 730
costo_serverless = 50000 * 0.2 * 0.000002
piu_economico = ...
quando_vm_conviene = ...

print(f"VM tutto il mese: {costo_vm_mese:.2f} EUR")
print(f"serverless (50k invocazioni): {costo_serverless:.4f} EUR")
print("piu' economico:", piu_economico)`,
      check: `_cvm = 0.10 * 730
_csl = 50000 * 0.2 * 0.000002
assert abs(costo_vm_mese - _cvm) < 1e-6, "costo_vm_mese: 0.10 * 730 = 73"
assert abs(costo_serverless - _csl) < 1e-9, "costo_serverless: 50000 * 0.2 * 0.000002 = 0.02"
assert piu_economico == "serverless", "piu_economico: serverless — per 50k invocazioni brevi costa centesimi vs i 73 EUR della VM sempre accesa"
assert quando_vm_conviene == True, "quando_vm_conviene: True — la VM conviene per carichi continui/pesanti"`,
      hint: `<p>La VM sempre accesa costa 73€/mese anche se il carico è sporadico; il serverless per 50k invocazioni brevi costa 0.02€. <code>piu_economico = "serverless" if costo_serverless &lt; costo_vm_mese else "vm"</code>.</p>`,
      solution: `costo_vm_mese = 0.10 * 730
costo_serverless = 50000 * 0.2 * 0.000002
piu_economico = "serverless" if costo_serverless < costo_vm_mese else "vm"
quando_vm_conviene = True

print(f"VM tutto il mese: {costo_vm_mese:.2f} EUR")
print(f"serverless (50k invocazioni): {costo_serverless:.4f} EUR")
print("piu' economico:", piu_economico)`
    },

    {
      type: "exercise", id: "cl-04", kg: 15, title: "Serverless: invocazioni su evento",
      task: `<p>Simula una funzione serverless che si attiva a ogni upload su un bucket (event-driven), processa il file e ne restituisce l'esito. Nessun server da gestire:</p>
<ul>
<li><code>processa_upload</code>: la funzione "Lambda" che riceve un evento (nome file) e restituisce un risultato (fornita)</li>
<li><code>eventi</code>: 3 upload che triggerano la funzione</li>
<li><code>risultati</code>: la lista dei risultati, uno per evento (la funzione parte una volta per evento)</li>
<li><code>n_invocazioni</code>: quante volte è stata invocata la funzione (una per evento)</li>
</ul>`,
      starter: `# simula una Lambda triggerata dagli upload su un bucket

def processa_upload(evento):
    nome = evento["file"]
    return {"file": nome, "stato": "processato", "righe": len(nome)}

eventi = [
    {"file": "vendite.csv"},
    {"file": "utenti.json"},
    {"file": "log.txt"},
]

risultati = [processa_upload(e) for e in eventi]
n_invocazioni = ...

print("risultati:", risultati)
print("invocazioni:", n_invocazioni)`,
      check: `def _p(e): return {"file": e["file"], "stato": "processato", "righe": len(e["file"])}
_r = [_p(e) for e in eventi]
assert risultati == _r, "risultati: [processa_upload(e) for e in eventi]"
assert n_invocazioni == 3, "n_invocazioni: 3 — una invocazione per ogni evento di upload"
assert all(r["stato"] == "processato" for r in risultati), "ogni file deve risultare processato"`,
      hint: `<p>Ogni upload triggera un'invocazione: <code>n_invocazioni = len(eventi)</code>. Il modello serverless: nessun server acceso, la funzione parte solo quando arriva un evento.</p>`,
      solution: `def processa_upload(evento):
    nome = evento["file"]
    return {"file": nome, "stato": "processato", "righe": len(nome)}

eventi = [
    {"file": "vendite.csv"},
    {"file": "utenti.json"},
    {"file": "log.txt"},
]

risultati = [processa_upload(e) for e in eventi]
n_invocazioni = len(eventi)

print("risultati:", risultati)
print("invocazioni:", n_invocazioni)`
    },

    { type: "theory", title: "IAM: chi può fare cosa", html: `
<p>La sicurezza nel cloud ruota attorno a <strong>IAM</strong> (Identity and Access Management): definire CHI (utenti, servizi, ruoli) può fare COSA (azioni) su QUALI risorse. Il principio guida è il <strong>minimo privilegio</strong>: dare solo i permessi strettamente necessari.</p>
<pre><code># una policy IAM concettuale:
policy = {
    "chi": "servizio-ml-training",
    "puo": ["s3:GetObject", "s3:PutObject"],   # leggere/scrivere oggetti
    "su": "arn:aws:s3:::dati-ml/*",             # solo questo bucket
}
# NON puo' fare altro: né cancellare bucket, né toccare altre risorse</code></pre>
<p>Ogni permesso non necessario è una superficie d'attacco: se le credenziali di quel servizio vengono compromesse, l'attaccante può fare solo ciò che la policy permette. Ecco perché "dai accesso completo per far funzionare le cose" è l'anti-pattern di sicurezza numero uno.</p>
`, more: `
<p>Il <strong>minimo privilegio</strong> non è pedanteria ma difesa in profondità: limita il DANNO in caso di compromissione. Se un servizio con permessi minimi (solo lettura di un bucket) viene bucato, l'attaccante può solo leggere quel bucket — non cancellare tutto, non accedere ad altri dati, non lanciare risorse costose. Se lo stesso servizio avesse avuto permessi da amministratore "per comodità", la compromissione sarebbe catastrofica. La storia degli incidenti cloud è piena di credenziali con permessi eccessivi trapelate (in un commit git pubblico, in un log, in un client compromesso) che hanno permesso danni enormi proprio perché troppo potenti.</p>
<p>I concetti IAM che i colloqui toccano: <strong>utenti</strong> (persone), <strong>ruoli</strong> (identità assunte temporaneamente da servizi o utenti — preferibili alle credenziali statiche perché a scadenza), <strong>policy</strong> (le regole di permesso), <strong>gruppi</strong> (insiemi di utenti con permessi comuni). La best practice moderna è usare RUOLI con credenziali temporanee invece di chiavi statiche a lunga vita (che se trapelano restano valide finché non le revochi). Per il ML: il servizio di training assume un ruolo che gli dà accesso SOLO ai bucket di dati e modelli che gli servono, niente di più.</p>
<p>Il collegamento con i segreti (sale Linux e API) è diretto: le credenziali cloud sono il segreto più prezioso e il più pericoloso se trapela. Vanno nelle variabili d'ambiente o in gestori di segreti (AWS Secrets Manager, Vault), MAI hardcoded nel codice o committate su Git. Un access key AWS in un repository pubblico viene trovato dai bot in MINUTI e usato per minare criptovalute a tue spese (bollette da migliaia di euro sono capitate). GitHub e AWS hanno sistemi di scansione automatica proprio per questo — lo stesso meccanismo che, in un'altra parte di questo progetto, ha bloccato il push del token nel codice. La lezione è universale: i segreti stanno fuori dal codice, e i permessi sono il minimo indispensabile.</p>
` },

    {
      type: "exercise", id: "cl-05", kg: 15, title: "Minimo privilegio",
      task: `<p>Implementa un controllo di accesso IAM che applica il minimo privilegio: un servizio può fare solo le azioni consentite dalla sua policy:</p>
<ul>
<li><code>puo_fare</code>: funzione che dati (policy, azione) restituisce <code>True</code> se l'azione è tra quelle permesse (fornita)</li>
<li><code>puo_leggere</code>: il servizio di training può fare "s3:GetObject"? (sì, è nella policy)</li>
<li><code>puo_cancellare</code>: può fare "s3:DeleteBucket"? (no, non è nella policy — minimo privilegio)</li>
<li><code>violazione_bloccata</code>: <code>True</code> se l'azione non consentita viene bloccata</li>
</ul>`,
      setup: `policy_training = {
    "servizio": "ml-training",
    "azioni_permesse": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
}`,
      starter: `# policy_training: cosa puo' fare il servizio di training

def puo_fare(policy, azione):
    return azione in policy["azioni_permesse"]

puo_leggere = puo_fare(policy_training, "s3:GetObject")
puo_cancellare = ...
violazione_bloccata = ...

print("puo' leggere:", puo_leggere)
print("puo' cancellare il bucket:", puo_cancellare)`,
      check: `def _pf(p, a): return a in p["azioni_permesse"]
assert puo_leggere == True, "puo_leggere: s3:GetObject e' nella policy"
assert puo_cancellare == False, "puo_cancellare: s3:DeleteBucket NON e' nella policy -> negato (minimo privilegio)"
assert violazione_bloccata == True, "violazione_bloccata: True — l'azione non permessa e' bloccata"`,
      hint: `<p><code>puo_cancellare = puo_fare(policy_training, "s3:DeleteBucket")</code> (torna False). <code>violazione_bloccata = not puo_cancellare</code>. Il minimo privilegio nega tutto ciò che non è esplicitamente permesso.</p>`,
      solution: `def puo_fare(policy, azione):
    return azione in policy["azioni_permesse"]

puo_leggere = puo_fare(policy_training, "s3:GetObject")
puo_cancellare = puo_fare(policy_training, "s3:DeleteBucket")
violazione_bloccata = not puo_cancellare

print("puo' leggere:", puo_leggere)
print("puo' cancellare il bucket:", puo_cancellare)`
    },

    { type: "theory", title: "Scalabilità: verticale e orizzontale", html: `
<p>Quando un carico cresce, ci sono due modi di scalare:</p>
<ul>
<li><strong>Scalabilità verticale</strong> (scale up): rendi la macchina più potente (più CPU, RAM, GPU). Semplice, ma ha un limite fisico e un singolo punto di guasto.</li>
<li><strong>Scalabilità orizzontale</strong> (scale out): aggiungi PIÙ macchine e distribuisci il carico. Scala quasi all'infinito ed è resiliente (se una cade, le altre reggono), ma richiede che il carico sia distribuibile.</li>
</ul>
<pre><code># orizzontale: un load balancer distribuisce le richieste su N server
def instrada(richiesta, n_server):
    return richiesta % n_server   # round-robin semplice
# aggiungere server aumenta la capacita' totale</code></pre>
<p>Il cloud eccelle nella scalabilità orizzontale con l'<strong>auto-scaling</strong>: aggiunge/rimuove macchine automaticamente in base al carico. Paghi per la capacità che serve nel momento, non per il picco massimo sempre.</p>
`, more: `
<p>La scalabilità verticale è più semplice (nessun cambiamento all'applicazione, solo una macchina più grande) ma ha limiti duri: esiste una macchina più potente disponibile, poi non puoi più crescere; il costo cresce spesso più che linearmente (le macchine top di gamma costano sproporzionatamente); e resta un SINGOLO punto di guasto (se quella macchina cade, tutto cade). La scalabilità orizzontale supera questi limiti ma impone un requisito: il carico deve essere PARALLELIZZABILE e idealmente STATELESS (le API REST stateless, sala API, sono progettate apposta per questo — ogni richiesta indipendente può andare a qualsiasi server). Applicazioni con stato condiviso o operazioni intrinsecamente sequenziali scalano male in orizzontale.</p>
<p>L'<strong>auto-scaling</strong> è la killer feature del cloud per i costi: definisci regole (es. "se la CPU media supera il 70%, aggiungi un server; se scende sotto il 30%, rimuovilo") e l'infrastruttura si adatta al carico in tempo reale. Un e-commerce scala su durante il Black Friday e giù di notte, pagando solo per la capacità usata — impossibile con server fisici, dove dovresti comprare per il picco e sprecare il resto del tempo. Per il ML, l'auto-scaling del serving gestisce i picchi di richieste di inferenza senza sovra-provisionare.</p>
<p>La scalabilità orizzontale introduce le sfide dei <strong>sistemi distribuiti</strong>, che i colloqui su ruoli senior approfondiscono: come distribuire il carico (load balancing — round-robin, least-connections, hash); come gestire lo stato condiviso (database, cache distribuite come Redis); il teorema CAP (consistenza vs disponibilità vs tolleranza alle partizioni — non puoi avere tutti e tre insieme, sala NoSQL); la consistenza eventuale; i guasti parziali. Distribuire il calcolo su tante macchine è esattamente il problema che Spark (prossima sala) risolve per l'elaborazione dati: prendere un dataset enorme, spezzarlo tra molte macchine, elaborarlo in parallelo, ricomporre. La scalabilità orizzontale è il fondamento su cui poggiano il big data e il ML su larga scala.</p>
` },

    {
      type: "exercise", id: "cl-06", kg: 15, title: "Load balancing orizzontale",
      task: `<p>Simula un load balancer che distribuisce richieste su N server (round-robin) e verifica il bilanciamento:</p>
<ul>
<li><code>instrada</code>: funzione round-robin che assegna la richiesta i al server <code>i % n_server</code> (fornita)</li>
<li><code>assegnazioni</code>: la lista del server assegnato a ognuna delle 12 richieste, con 3 server</li>
<li><code>carico_per_server</code>: un <code>Counter</code> di quante richieste per server</li>
<li><code>bilanciato</code>: <code>True</code> se tutti i server hanno lo stesso carico (12 richieste / 3 server = 4 ciascuno)</li>
</ul>`,
      starter: `from collections import Counter

def instrada(i, n_server):
    return i % n_server   # round-robin

n_server = 3
n_richieste = 12

assegnazioni = [instrada(i, n_server) for i in range(n_richieste)]
carico_per_server = Counter(assegnazioni)
bilanciato = ...

print("assegnazioni:", assegnazioni)
print("carico per server:", dict(carico_per_server))`,
      check: `from collections import Counter
_a = [i % 3 for i in range(12)]
_c = Counter(_a)
assert assegnazioni == _a, "assegnazioni: [i % 3 for i in range(12)]"
assert carico_per_server == _c, "carico_per_server: Counter(assegnazioni)"
assert bilanciato == True, "bilanciato: True — 12/3 = 4 richieste per server, perfettamente bilanciato"
assert all(v == 4 for v in carico_per_server.values()), "ogni server deve avere 4 richieste"`,
      hint: `<p>Round-robin distribuisce a rotazione: <code>bilanciato = len(set(carico_per_server.values())) == 1</code> (tutti lo stesso carico). Con 12 richieste su 3 server, 4 ciascuno.</p>`,
      solution: `from collections import Counter

def instrada(i, n_server):
    return i % n_server

n_server = 3
n_richieste = 12

assegnazioni = [instrada(i, n_server) for i in range(n_richieste)]
carico_per_server = Counter(assegnazioni)
bilanciato = len(set(carico_per_server.values())) == 1

print("assegnazioni:", assegnazioni)
print("carico per server:", dict(carico_per_server))`
    },

    { type: "theory", title: "Il modello di costo del cloud", html: `
<p>Il cloud si paga a consumo, ma i costi possono sfuggire. Le voci principali per un data scientist:</p>
<ul>
<li><strong>Compute</strong>: ore di VM (le GPU costano molto), invocazioni serverless;</li>
<li><strong>Storage</strong>: GB/mese di dati archiviati (economico), ma attenzione ai volumi;</li>
<li><strong>Transfer</strong> (egress): spostare dati FUORI dal cloud costa (l'ingresso è gratis, l'uscita no!);</li>
<li><strong>Servizi gestiti</strong>: database, ML platform, ecc.</li>
</ul>
<pre><code>costo_mensile = (ore_gpu * prezzo_gpu       # spesso la voce piu' grande
               + gb_storage * prezzo_storage
               + gb_egress * prezzo_egress)   # la sorpresa dimenticata</code></pre>
<p>La trappola classica: dimenticare macchine accese, o non prevedere i costi di <em>egress</em> (scaricare grandi dataset fuori dal cloud). Il monitoring dei costi (budget, alert) è parte del lavoro.</p>
`, more: `
<p>I <strong>costi di egress</strong> (trasferimento di dati IN USCITA dal cloud) sono la sorpresa più frequente e insidiosa: caricare dati NEL cloud è gratis, ma scaricarli FUORI costa, e su grandi volumi (spostare terabyte di dataset, servire molti download) la bolletta può esplodere. È anche una strategia di lock-in dei provider: rendere economico entrare e caro uscire scoraggia la migrazione. Per il data scientist: elabora i dati DENTRO il cloud (dove sono, vicino al compute) invece di scaricarli continuamente; il pattern "porta il calcolo ai dati, non i dati al calcolo" nasce anche da qui, oltre che dall'efficienza.</p>
<p>Le GPU sono spesso la voce dominante nel ML e la più facile da sprecare: una macchina GPU costa euro all'ora, e dimenticarla accesa un weekend brucia centinaia di euro per nulla. Le difese: spegnere sempre le risorse dopo l'uso (auto-shutdown per inattività); usare spot instance per il training tollerante alle interruzioni (fino al 90% di sconto); scegliere la GPU giusta per il compito (non la più potente "per sicurezza"); e i budget/alert che avvisano quando la spesa supera una soglia. Il FinOps (financial operations) è diventato una disciplina proprio perché i costi cloud, senza disciplina, sfuggono.</p>
<p>Il monitoring dei costi è parte della responsabilità di chi usa il cloud, non solo del reparto finanziario: strumenti come i cost explorer, i budget con alert, i tag sulle risorse (per attribuire i costi a progetti/team) permettono di capire DOVE vanno i soldi e intervenire. Nei colloqui su ruoli data/ML in produzione, mostrare consapevolezza dei costi ("userei spot instance per il training e spegnerei le risorse dopo", "elaborerei i dati nel cloud per evitare egress", "monitorerei con budget alert") distingue chi ha operato in produzione da chi ha solo sperimentato in locale. Un modello che costa più di quanto vale è un fallimento anche se accurato — l'efficienza economica è parte dell'ingegneria del ML in produzione, non un dettaglio separato.</p>
` },

    {
      type: "exercise", id: "cl-07", kg: 20, title: "Stimare (e ottimizzare) i costi",
      task: `<p>Calcola il costo mensile di un progetto ML cloud e trova dove risparmiare:</p>
<ul>
<li><code>costo_gpu</code>: 100 ore di GPU a 2.50 €/ora</li>
<li><code>costo_storage</code>: 500 GB a 0.02 €/GB/mese</li>
<li><code>costo_egress</code>: 200 GB di egress a 0.09 €/GB</li>
<li><code>totale</code>: la somma delle tre voci</li>
<li><code>voce_maggiore</code>: la stringa della voce più costosa ("gpu", "storage" o "egress")</li>
<li><code>risparmio_spot</code>: quanto si risparmierebbe sulla GPU usando spot instance al 70% di sconto (costo_gpu × 0.70)</li>
</ul>`,
      starter: `costo_gpu = 100 * 2.50
costo_storage = 500 * 0.02
costo_egress = 200 * 0.09
totale = ...

voci = {"gpu": costo_gpu, "storage": costo_storage, "egress": costo_egress}
voce_maggiore = max(voci, key=voci.get)
risparmio_spot = ...

print(f"GPU {costo_gpu} | storage {costo_storage} | egress {costo_egress}")
print(f"totale: {totale} EUR | voce maggiore: {voce_maggiore}")
print(f"risparmio con spot instance: {risparmio_spot} EUR")`,
      check: `_cg, _cs, _ce = 100*2.50, 500*0.02, 200*0.09
_tot = _cg + _cs + _ce
assert abs(totale - _tot) < 1e-6, "totale: costo_gpu + costo_storage + costo_egress = 268"
assert voce_maggiore == "gpu", "voce_maggiore: 'gpu' (250 EUR, di gran lunga la piu' costosa)"
assert abs(risparmio_spot - _cg * 0.70) < 1e-6, "risparmio_spot: costo_gpu * 0.70 = 175 EUR risparmiati"`,
      hint: `<p><code>totale = costo_gpu + costo_storage + costo_egress</code>. La GPU domina (250€). <code>risparmio_spot = costo_gpu * 0.70</code> — le spot instance tagliano il costo GPU, la voce maggiore.</p>`,
      solution: `costo_gpu = 100 * 2.50
costo_storage = 500 * 0.02
costo_egress = 200 * 0.09
totale = costo_gpu + costo_storage + costo_egress

voci = {"gpu": costo_gpu, "storage": costo_storage, "egress": costo_egress}
voce_maggiore = max(voci, key=voci.get)
risparmio_spot = costo_gpu * 0.70

print(f"GPU {costo_gpu} | storage {costo_storage} | egress {costo_egress}")
print(f"totale: {totale} EUR | voce maggiore: {voce_maggiore}")
print(f"risparmio con spot instance: {risparmio_spot} EUR")`
    },

    {
      type: "exercise", id: "cl-08", kg: 15, title: "Quiz: cloud",
      task: `<p>Cinque affermazioni. <code>True</code> o <code>False</code>:</p>
<ul>
<li><code>a1</code>: "L'object storage (S3) è uno spazio piatto di chiavi; le 'cartelle' sono solo prefissi"</li>
<li><code>a2</code>: "Il serverless conviene per carichi continui e pesanti come il training su GPU"</li>
<li><code>a3</code>: "Il principio del minimo privilegio dà a ogni servizio solo i permessi necessari"</li>
<li><code>a4</code>: "La scalabilità orizzontale aggiunge più macchine; la verticale rende una macchina più potente"</li>
<li><code>a5</code>: "Scaricare dati FUORI dal cloud (egress) è gratis come caricarli"</li>
</ul>`,
      starter: `a1 = ...
a2 = ...
a3 = ...
a4 = ...
a5 = ...

print(a1, a2, a3, a4, a5)`,
      check: `assert a1 == True, "a1 VERA: object storage = spazio piatto chiave->oggetto"
assert a2 == False, "a2 FALSA: il serverless ha limiti di durata e niente GPU serie; per training pesante serve una VM"
assert a3 == True, "a3 VERA: minimo privilegio = solo i permessi necessari"
assert a4 == True, "a4 VERA: orizzontale = piu' macchine, verticale = macchina piu' potente"
assert a5 == False, "a5 FALSA: l'egress (uscita) COSTA, l'ingresso e' gratis — trappola classica"`,
      hint: `<p>Le trappole: a2 (serverless è per carichi intermittenti, non per training GPU pesante) e a5 (l'egress costa!). Le altre riprendono le lavagne: object storage (a1), minimo privilegio (a3), scalabilità (a4).</p>`,
      solution: `a1 = True
a2 = False
a3 = True
a4 = True
a5 = False

print(a1, a2, a3, a4, a5)`
    },

    {
      type: "exercise", id: "cl-09", kg: 20, title: "Pipeline dati serverless",
      task: `<p>Componi i mattoni cloud in una pipeline: upload su storage &rarr; trigger serverless &rarr; risultato salvato. Simula il flusso event-driven completo:</p>
<ul>
<li><code>storage</code>: il bucket (dict)</li>
<li><code>elabora</code>: la funzione serverless che legge un file dal bucket, lo "processa" (conta i caratteri) e salva il risultato con suffisso ".result" (fornita)</li>
<li>carica "input.csv" nel bucket, poi triggera <code>elabora("input.csv")</code></li>
<li><code>risultato_salvato</code>: <code>True</code> se ora esiste la chiave "input.csv.result" nel bucket</li>
<li><code>valore_risultato</code>: il contenuto del risultato salvato</li>
</ul>`,
      starter: `storage = {}

def elabora(chiave):
    # legge dal bucket, processa, riscrive il risultato
    contenuto = storage[chiave]
    risultato = {"caratteri": len(contenuto), "origine": chiave}
    storage[chiave + ".result"] = risultato
    return risultato

# 1. upload
storage["input.csv"] = "a,b,c\\n1,2,3\\n4,5,6"
# 2. trigger serverless
elabora("input.csv")

risultato_salvato = ...
valore_risultato = ...

print("chiavi nel bucket:", list(storage.keys()))
print("risultato:", valore_risultato)`,
      check: `_s = {}
def _e(k):
    c = _s[k]; r = {"caratteri": len(c), "origine": k}; _s[k+".result"] = r; return r
_s["input.csv"] = "a,b,c\\n1,2,3\\n4,5,6"; _e("input.csv")
assert risultato_salvato == True, "risultato_salvato: 'input.csv.result' deve esistere nel bucket"
assert valore_risultato == _s["input.csv.result"], "valore_risultato: storage['input.csv.result']"
assert valore_risultato["origine"] == "input.csv", "il risultato deve tracciare il file d'origine"`,
      hint: `<p><code>risultato_salvato = "input.csv.result" in storage</code>. <code>valore_risultato = storage["input.csv.result"]</code>. Il flusso: upload → la funzione parte sull'evento → salva il risultato nel bucket.</p>`,
      solution: `storage = {}

def elabora(chiave):
    contenuto = storage[chiave]
    risultato = {"caratteri": len(contenuto), "origine": chiave}
    storage[chiave + ".result"] = risultato
    return risultato

storage["input.csv"] = "a,b,c\\n1,2,3\\n4,5,6"
elabora("input.csv")

risultato_salvato = "input.csv.result" in storage
valore_risultato = storage["input.csv.result"]

print("chiavi nel bucket:", list(storage.keys()))
print("risultato:", valore_risultato)`
    },

    {
      type: "exercise", id: "cl-10", kg: 25, title: "MASSIMALE: architettura ML cloud",
      task: `<p>Il gran finale: progetta l'architettura di un sistema ML cloud completo, scegliendo il servizio giusto per ogni componente e stimando il costo. Metti insieme storage, compute, serverless e costi.</p>
<ul>
<li><code>architettura</code>: dizionario che assegna il servizio giusto a ogni esigenza (fornito da completare): dataset&rarr;"object_storage", training_gpu&rarr;"vm_gpu", inferenza_sporadica&rarr;"serverless", permessi&rarr;"iam"</li>
<li><code>costo_training</code>: 20 ore di GPU spot a 0.75 €/ora (2.50 scontato del 70%)</li>
<li><code>costo_inferenza</code>: 100.000 invocazioni serverless × 0.1s × 0.000002 €/s</li>
<li><code>costo_storage_mese</code>: 1000 GB × 0.02 €/GB</li>
<li><code>costo_totale</code>: la somma delle tre voci</li>
<li><code>architettura_valida</code>: <code>True</code> se ogni componente ha il servizio giusto assegnato</li>
</ul>`,
      starter: `# progetta l'architettura assegnando il servizio giusto a ogni esigenza
architettura = {
    "dataset": "object_storage",       # dove vivono i dati
    "training_gpu": "vm_gpu",          # training pesante
    "inferenza_sporadica": ...,        # API chiamata a tratti -> ?
    "permessi": ...,                    # chi accede a cosa -> ?
}

# stima dei costi
costo_training = 20 * (2.50 * 0.30)    # GPU spot, 70% di sconto
costo_inferenza = 100000 * 0.1 * 0.000002
costo_storage_mese = 1000 * 0.02
costo_totale = ...

architettura_valida = (architettura["inferenza_sporadica"] == "serverless"
                       and architettura["permessi"] == "iam")

print("architettura:", architettura)
print(f"costi: training {costo_training:.2f} | inferenza {costo_inferenza:.4f} | storage {costo_storage_mese:.2f}")
print(f"totale mensile: {costo_totale:.2f} EUR")`,
      check: `_ct = 20 * (2.50 * 0.30)
_ci = 100000 * 0.1 * 0.000002
_cs = 1000 * 0.02
_tot = _ct + _ci + _cs
assert architettura["inferenza_sporadica"] == "serverless", "inferenza sporadica -> serverless (paghi solo le invocazioni)"
assert architettura["permessi"] == "iam", "permessi -> IAM (minimo privilegio)"
assert abs(costo_totale - _tot) < 1e-6, "costo_totale: somma delle tre voci"
assert architettura_valida == True, "architettura_valida: True — ogni componente col servizio giusto"
assert abs(costo_training - 15.0) < 1e-6, "costo_training: 20 * 0.75 = 15 EUR (spot instance)"`,
      hint: `<p>Inferenza sporadica &rarr; "serverless" (paghi le invocazioni). Permessi &rarr; "iam". <code>costo_totale = costo_training + costo_inferenza + costo_storage_mese</code>. È l'architettura tipica: dati in S3, training su VM GPU spot, inferenza serverless, accesso via IAM.</p>`,
      solution: `architettura = {
    "dataset": "object_storage",
    "training_gpu": "vm_gpu",
    "inferenza_sporadica": "serverless",
    "permessi": "iam",
}

costo_training = 20 * (2.50 * 0.30)
costo_inferenza = 100000 * 0.1 * 0.000002
costo_storage_mese = 1000 * 0.02
costo_totale = costo_training + costo_inferenza + costo_storage_mese

architettura_valida = (architettura["inferenza_sporadica"] == "serverless"
                       and architettura["permessi"] == "iam")

print("architettura:", architettura)
print(f"costi: training {costo_training:.2f} | inferenza {costo_inferenza:.4f} | storage {costo_storage_mese:.2f}")
print(f"totale mensile: {costo_totale:.2f} EUR")`
    }

  ]
});
