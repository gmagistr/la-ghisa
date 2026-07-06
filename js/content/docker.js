window.MODULES.push({
  id: "docker",
  name: "Docker",
  tagline: "Lo spogliatoio: dove ogni allenamento gira sempre nello stesso ambiente, ovunque tu sia.",
  intro: "Docker impacchetta un'applicazione con tutto ciò che le serve per girare — stesso ambiente sul tuo laptop, sul server, sul laptop del collega. Qui non gira davvero Docker (serve un motore vero sul sistema operativo), ma scrivi i file e i comandi veri, e la verifica controlla che siano corretti — sintassi e concetti, gli stessi che userai da terminale.",
  packages: [],
  items: [

    { type: "theory", title: "Immagine, container, Dockerfile", html: `
<p>Tre parole che vanno tenute distinte. Il <strong>Dockerfile</strong> è la ricetta testuale: istruzioni per costruire un'<strong>immagine</strong>. L'immagine è un pacchetto immutabile (codice + dipendenze + sistema operativo minimo). Il <strong>container</strong> è un'immagine <em>in esecuzione</em> — tante volte quante vuoi, sempre identiche.</p>
<pre><code>FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]</code></pre>
<p><code>FROM</code> parte da un'immagine base, <code>WORKDIR</code> imposta la cartella di lavoro dentro il container, <code>COPY</code> porta file dal tuo computer dentro l'immagine, <code>RUN</code> esegue comandi <em>durante la costruzione</em>, <code>CMD</code> è il comando eseguito <em>all'avvio</em> del container.</p>
`, more: `
<p>L'immagine base scelta con <code>FROM</code> conta più di quanto sembri: <code>python:3.12</code> (completa) pesa centinaia di MB e include compilatori e strumenti di sviluppo non necessari a runtime; <code>python:3.12-slim</code> è una versione ridotta pensata per la produzione; <code>python:3.12-alpine</code> è ancora più piccola (basata sulla distribuzione Linux Alpine) ma può avere incompatibilità con pacchetti che richiedono librerie di sistema non presenti — la scelta è un compromesso tra dimensione dell'immagine e compatibilità, non sempre "più piccolo è meglio" in assoluto.</p>
<p>Ogni immagine Docker eredita concettualmente da un sistema operativo minimo: anche <code>python:3.12-slim</code> è costruita sopra una distribuzione Linux (Debian, tipicamente), con il suo gestore di pacchetti (<code>apt-get</code>) disponibile per installare dipendenze di sistema (non Python) che l'app potrebbe richiedere — es. librerie C per elaborare immagini o PDF.</p>
<p>Il container "in esecuzione" non è magia: è un processo del sistema operativo host, isolato tramite funzionalità del kernel Linux (namespace e cgroup) che gli danno l'illusione di essere l'unico processo su una macchina dedicata — file system suo, rete sua, processi suoi. Questo è anche il motivo per cui i container sono molto più leggeri delle macchine virtuali tradizionali: non emulano un intero hardware, condividono il kernel dell'host.</p>
` },

    {
      type: "exercise", id: "dk-01", kg: 5, title: "Il tuo primo Dockerfile",
      task: `<p>Scrivi in <code>dockerfile</code> (una stringa multi-riga) un Dockerfile che, <strong>nell'ordine</strong>:</p>
<ul>
<li>Parte dall'immagine <code>python:3.12-slim</code></li>
<li>Imposta la working directory a <code>/app</code></li>
<li>Copia tutto il contenuto della cartella corrente (<code>.</code>) in <code>.</code> dentro il container</li>
<li>Esegue all'avvio <code>python main.py</code> (usa la forma a lista: <code>CMD ["python", "main.py"]</code>)</li>
</ul>`,
      starter: `dockerfile = """
FROM ...
WORKDIR ...
COPY . .
CMD ...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
assert righe[0] == "FROM python:3.12-slim", "La prima riga deve essere 'FROM python:3.12-slim'"
assert "WORKDIR /app" in righe, "Deve esserci una riga 'WORKDIR /app'"
assert "COPY . ." in righe, "Deve esserci una riga 'COPY . .'"
assert righe[-1] == 'CMD ["python", "main.py"]', 'L\\'ultima riga deve essere CMD ["python", "main.py"] (con le virgolette doppie dentro la lista)'
assert righe.index("WORKDIR /app") < righe.index("COPY . ."), "WORKDIR deve venire prima di COPY: serve sapere DOVE copiare"`,
      hint: `<p>L'ordine conta: <code>FROM</code> sempre per primo, <code>CMD</code> sempre per ultimo. <code>WORKDIR</code> prima di <code>COPY</code>, altrimenti Docker non sa in quale cartella mettere i file copiati.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
COPY . .
CMD ["python", "main.py"]
""".strip()

print(dockerfile)`
    },

    { type: "theory", title: "Il layer cache: l'ordine conta per la velocità", html: `
<p>Docker costruisce un'immagine a <strong>strati (layer)</strong>, uno per istruzione, e riusa gli strati non cambiati da una build all'altra. Trucco pratico: copia prima i file che cambiano <em>raramente</em> (le dipendenze), poi quelli che cambiano <em>spesso</em> (il codice):</p>
<pre><code># BUONO: se cambia solo app.py, il pip install non viene rifatto
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# CATTIVO: ogni modifica al codice invalida anche pip install
COPY . .
RUN pip install -r requirements.txt</code></pre>
<p>Ogni volta che un layer cambia, <strong>tutti quelli dopo</strong> vanno ricostruiti — per questo l'ordine delle istruzioni non è mai un dettaglio stilistico, è una scelta di velocità di build.</p>
`, more: `
<p>Ogni layer non è solo un concetto astratto di velocità: è letteralmente un livello del file system che viene salvato su disco e può essere condiviso tra immagini diverse. Due immagini basate sulla stessa <code>FROM python:3.12-slim</code> con la stessa sequenza iniziale di istruzioni condividono FISICAMENTE quegli stessi layer sul disco — un risparmio di spazio, non solo di tempo di build, quando hai molte immagini simili sulla stessa macchina.</p>
<p>Ogni istruzione <code>RUN</code>, <code>COPY</code> o <code>ADD</code> crea un nuovo layer; istruzioni come <code>ENV</code>, <code>WORKDIR</code>, <code>EXPOSE</code> modificano solo i metadati dell'immagine senza aggiungere un layer di file system pesante. Concatenare più comandi shell in un solo <code>RUN</code> con <code>&&</code> (es. <code>RUN apt-get update && apt-get install -y curl</code>) invece di due <code>RUN</code> separati produce UN solo layer invece di due — utile per tenere il numero di layer sotto controllo su Dockerfile complessi.</p>
<p>Un errore di cache sottile: <code>COPY . .</code> invalida la cache non solo se il CONTENUTO dei file cambia, ma anche se cambiano i loro METADATI (permessi, timestamp) a seconda del sistema di build usato — per questo, oltre a separare le dipendenze dal codice, un buon <code>.dockerignore</code> (prossima teoria) evita che file irrilevanti e mutevoli (cache locali, file temporanei dell'IDE) finiscano nel contesto di build e invalidino la cache inutilmente.</p>
` },

    {
      type: "exercise", id: "dk-02", kg: 15, title: "Ottimizza la cache",
      task: `<p>Riscrivi in <code>dockerfile</code> un build ottimizzato per la cache: separa la copia delle dipendenze da quella del codice, così un cambio al codice non forza un nuovo <code>pip install</code>. Nell'ordine:</p>
<ul>
<li><code>FROM python:3.12-slim</code></li>
<li><code>WORKDIR /app</code></li>
<li><code>COPY requirements.txt .</code></li>
<li><code>RUN pip install -r requirements.txt</code></li>
<li><code>COPY . .</code></li>
<li><code>CMD ["python", "main.py"]</code></li>
</ul>`,
      starter: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
attese = ["FROM python:3.12-slim", "WORKDIR /app", "COPY requirements.txt .", "RUN pip install -r requirements.txt", "COPY . .", 'CMD ["python", "main.py"]']
assert righe == attese, f"Le righe devono essere esattamente, in ordine: {attese}"`,
      hint: `<p>La regola: prima <code>COPY requirements.txt .</code> + <code>RUN pip install</code>, SOLO DOPO <code>COPY . .</code> con tutto il resto del codice.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
""".strip()

print(dockerfile)`
    },

    { type: "theory", title: "I comandi da terminale che userai sempre", html: `
<p>Un pugno di comandi copre il 90% del lavoro quotidiano con Docker:</p>
<pre><code>docker build -t mia-app .        # costruisce l'immagine (-t = tag/nome), "." = contesto di build
docker run -p 8000:80 mia-app    # avvia un container, mappa la porta 80 del container sulla 8000 locale
docker ps                        # lista i container IN ESECUZIONE
docker ps -a                     # lista TUTTI i container, anche quelli fermi
docker images                    # lista le immagini scaricate/costruite
docker exec -it &lt;id&gt; bash        # apre una shell interattiva DENTRO un container gia' avviato</code></pre>
<p><code>-p host:container</code> è la mappatura delle porte: il primo numero è quello che usi tu dal browser, il secondo è quello su cui l'app ascolta dentro il container — sono indipendenti, e confonderli è un classico primo errore.</p>
`, more: `
<p>Oltre ai comandi elencati, altri due tornano utili quasi ogni giorno: <code>docker rmi immagine</code> rimuove un'immagine (non un container — serve prima rimuovere ogni container che la usa), e <code>docker system prune</code> ripulisce container fermati, immagini non utilizzate e cache di build accumulata — utile quando il disco si riempie di immagini vecchie dimenticate, un problema molto comune in ambienti di sviluppo attivi.</p>
<p><code>docker run</code> senza altre opzioni blocca il terminale mostrando l'output del container in tempo reale (modalità "foreground"); <code>docker run -d</code> (detached) lo avvia in background e restituisce subito il prompt, con l'id del container appena creato — la modalità quasi sempre usata per servizi di lunga durata, mentre la modalità foreground è comoda per il debug immediato.</p>
<p>L'id di un container mostrato da <code>docker ps</code> è un hash lungo, ma nella pratica bastano i primi caratteri (es. <code>abc1</code> invece di <code>abc123def456...</code>) per riferirsi a un container in qualsiasi comando, purché siano sufficienti a identificarlo univocamente tra quelli attivi — Docker accetta prefissi abbreviati ovunque si aspetti un id.</p>
` },

    {
      type: "exercise", id: "dk-03", kg: 10, title: "I comandi giusti",
      task: `<p>Scrivi le stringhe dei comandi esatti (senza spazi superflui):</p>
<ul>
<li><code>cmd_build</code>: costruisci un'immagine chiamata <code>palestra-app</code> usando la cartella corrente come contesto</li>
<li><code>cmd_run</code>: avvia un container da <code>palestra-app</code> mappando la porta locale 5000 sulla porta 80 del container</li>
<li><code>cmd_lista</code>: mostra <strong>tutti</strong> i container, anche quelli fermi</li>
</ul>`,
      starter: `cmd_build = ...
cmd_run = ...
cmd_lista = ...

print(cmd_build)
print(cmd_run)
print(cmd_lista)`,
      check: `assert 'cmd_build' in globals() and cmd_build == "docker build -t palestra-app .", "cmd_build: docker build -t palestra-app ."
assert 'cmd_run' in globals() and cmd_run == "docker run -p 5000:80 palestra-app", "cmd_run: docker run -p 5000:80 palestra-app — host:container, in quest'ordine"
assert 'cmd_lista' in globals() and cmd_lista == "docker ps -a", "cmd_lista: docker ps -a"`,
      hint: `<p>Il tag va sempre subito dopo <code>-t</code>, e il contesto di build (<code>.</code>) va per ultimo in <code>build</code>. In <code>run -p</code>, il numero prima dei due punti è la porta del TUO computer.</p>`,
      solution: `cmd_build = "docker build -t palestra-app ."
cmd_run = "docker run -p 5000:80 palestra-app"
cmd_lista = "docker ps -a"

print(cmd_build)
print(cmd_run)
print(cmd_lista)`
    },

    { type: "theory", title: ".dockerignore: non impacchettare la spazzatura", html: `
<p>Come <code>.gitignore</code>, un file <code>.dockerignore</code> esclude file e cartelle dal contesto di build: ambienti virtuali, cache, segreti locali. Senza, ogni <code>COPY . .</code> rischia di gonfiare l'immagine (a volte di centinaia di MB) o, peggio, di far trapelare credenziali dentro un'immagine che finisce su un registro condiviso.</p>
<pre><code>__pycache__/
*.pyc
.venv/
.env
.git/
node_modules/</code></pre>
<p>Regola pratica: se non lo committeresti su git, probabilmente non va nemmeno dentro l'immagine Docker. <code>.env</code> in particolare — variabili d'ambiente con password e chiavi API — non deve <em>mai</em> finire in un'immagine.</p>
`, more: `
<p><code>.dockerignore</code> non serve solo a proteggere segreti: ha un effetto diretto sulla VELOCITÀ della build. Il "contesto di build" (tutto ciò che sta nella cartella passata a <code>docker build</code>) viene inviato per intero al demone Docker prima ancora che la prima istruzione venga eseguita — un contesto gonfio da un <code>node_modules/</code> da centinaia di MB rallenta ogni singola build, anche quando quei file non verranno mai copiati esplicitamente dentro l'immagine.</p>
<p>Le regole dentro <code>.dockerignore</code> supportano pattern simili a <code>.gitignore</code>: <code>*.log</code> esclude tutti i file con quell'estensione ovunque si trovino, <code>**/temp/</code> esclude cartelle chiamate "temp" a qualsiasi livello di annidamento, un <code>!</code> davanti a un pattern fa un'eccezione esplicita (utile per riammettere un singolo file dentro una cartella altrimenti esclusa).</p>
<p>Un segreto finito per errore in un layer Docker, anche se RIMOSSO in un'istruzione successiva (es. <code>COPY .env .</code> seguito da <code>RUN rm .env</code>), resta comunque recuperabile: ogni layer viene conservato nella storia dell'immagine, e chiunque abbia accesso all'immagine può ispezionare i layer precedenti e ritrovare il file "cancellato". <code>.dockerignore</code> è l'unica difesa affidabile — impedire che il segreto entri nel contesto fin dall'inizio, non cercare di rimuoverlo dopo.</p>
` },

    {
      type: "exercise", id: "dk-04", kg: 15, title: "Scrivi il dockerignore",
      task: `<p>Costruisci la stringa <code>dockerignore</code> con, su righe separate, esattamente queste voci (in quest'ordine): <code>__pycache__/</code>, <code>*.pyc</code>, <code>.venv/</code>, <code>.env</code>, <code>.git/</code>.</p>
<p>Poi rispondi: <code>contiene_env</code> deve essere <code>True</code> se <code>.env</code> è tra le righe (verificalo col codice, non a occhio).</p>`,
      starter: `dockerignore = "\\n".join([
    "__pycache__/",
    ...
])

contiene_env = ...

print(dockerignore)
print(contiene_env)`,
      check: `righe = dockerignore.strip().splitlines()
assert righe == ["__pycache__/", "*.pyc", ".venv/", ".env", ".git/"], "Le righe devono essere esattamente queste 5, in questo ordine"
assert 'contiene_env' in globals() and contiene_env == True, "contiene_env: '.env' in righe"`,
      hint: `<p>Costruisci la lista completa dentro <code>"\\n".join([...])</code>, poi verifica con <code>".env" in dockerignore.splitlines()</code>.</p>`,
      solution: `dockerignore = "\\n".join([
    "__pycache__/",
    "*.pyc",
    ".venv/",
    ".env",
    ".git/",
])

contiene_env = ".env" in dockerignore.splitlines()

print(dockerignore)
print(contiene_env)`
    },

    { type: "theory", title: "docker-compose: più container, un solo comando", html: `
<p>Un'app vera raramente è un container solo: serve il web server, il database, forse una cache. <code>docker-compose.yml</code> descrive <strong>tutti i servizi insieme</strong>, con le loro relazioni:</p>
<pre><code>services:
  web:
    build: .
    ports:
      - "8000:80"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: segreta</code></pre>
<p><code>depends_on</code> dice a Docker Compose l'ordine di avvio (prima <code>db</code>, poi <code>web</code>) — ma <strong>non</strong> aspetta che il database sia davvero pronto a ricevere connessioni, solo che il container sia partito: una distinzione che causa bug intermittenti reali, da gestire nell'app con logica di retry.</p>
`, more: `
<p>Per far sì che <code>depends_on</code> aspetti davvero che il servizio dipendente sia "pronto" (non solo avviato), serve combinarlo con un <code>HEALTHCHECK</code> (visto in un'altra teoria di questa sala) e la condizione <code>condition: service_healthy</code>: <code>depends_on: db: condition: service_healthy</code> — Docker Compose allora attende che l'healthcheck di <code>db</code> risulti positivo prima di avviare <code>web</code>, non solo che il container sia partito.</p>
<p>I servizi definiti nello stesso <code>docker-compose.yml</code> comunicano tra loro usando il NOME del servizio come hostname: <code>db</code> dentro il codice di <code>web</code> (es. <code>postgres://db:5432/...</code>) si risolve automaticamente all'indirizzo IP interno del container <code>db</code>, grazie a una rete Docker virtuale creata automaticamente da Compose — non serve conoscere IP reali, un vantaggio enorme rispetto a coordinare container avviati manualmente uno per uno.</p>
<p>I comandi da terminale per Compose rispecchiano quelli di Docker ma operano su TUTTI i servizi insieme: <code>docker compose up</code> costruisce (se serve) e avvia tutti i servizi nell'ordine giusto, <code>docker compose down</code> li ferma e rimuove, <code>docker compose logs -f</code> mostra i log di tutti i servizi mescolati (con un prefisso che indica da quale servizio proviene ogni riga) — comodo per non dover aprire un terminale per ogni singolo container.</p>
` },

    {
      type: "exercise", id: "dk-05", kg: 20, title: "Componi lo stack",
      task: `<p>Scrivi in <code>compose</code> uno YAML (come stringa) con due servizi:</p>
<ul>
<li><code>web</code>: costruito dalla cartella corrente (<code>build: .</code>), porta <code>8000:80</code>, dipende da <code>db</code></li>
<li><code>db</code>: usa l'immagine <code>postgres:16</code></li>
</ul>
<p>Rispetta esattamente l'indentazione a 2 spazi mostrata nella lavagna. Poi verifica tu stesso: <code>ha_dependency</code> deve essere <code>True</code> se la stringa <code>"depends_on"</code> compare nel file.</p>`,
      starter: `compose = """
services:
  web:
    build: .
    ports:
      - "8000:80"
    depends_on:
      - db
  db:
    image: postgres:16
""".strip()

ha_dependency = ...

print(compose)
print(ha_dependency)`,
      check: `assert "services:" in compose, "Deve iniziare con 'services:'"
assert "  web:" in compose and "  db:" in compose, "Devono esserci i due servizi 'web:' e 'db:' indentati di 2 spazi"
assert "build: ." in compose, "Il servizio web deve avere 'build: .'"
assert '"8000:80"' in compose, "La porta deve essere \\"8000:80\\""
assert "image: postgres:16" in compose, "Il servizio db deve avere 'image: postgres:16'"
assert 'ha_dependency' in globals() and ha_dependency == ("depends_on" in compose), "ha_dependency: verifica con il codice, non scriverlo a mano"
assert ha_dependency == True, "depends_on deve essere presente: web dipende da db"`,
      hint: `<p>Lo YAML è sensibile all'indentazione quanto Python: ogni livello di annidamento (servizio → proprietà → voce di lista) aggiunge 2 spazi.</p>`,
      solution: `compose = """
services:
  web:
    build: .
    ports:
      - "8000:80"
    depends_on:
      - db
  db:
    image: postgres:16
""".strip()

ha_dependency = "depends_on" in compose

print(compose)
print(ha_dependency)`
    },

    {
      type: "exercise", id: "dk-06", kg: 25, title: "Massimale: Dockerfile multi-stage",
      task: `<p>Le build <strong>multi-stage</strong> usano più <code>FROM</code> nello stesso Dockerfile: uno stage compila/installa con tutti gli strumenti pesanti, l'ultimo stage copia <em>solo il necessario</em> in un'immagine finale leggera — niente compilatori o cache di build nell'immagine di produzione.</p>
<p>Scrivi in <code>dockerfile</code> un build a due stage per un'app Python, nell'ordine:</p>
<ul>
<li><code>FROM python:3.12 AS builder</code> — lo stage "pesante"</li>
<li><code>WORKDIR /app</code></li>
<li><code>COPY requirements.txt .</code></li>
<li><code>RUN pip install --user -r requirements.txt</code></li>
<li><code>FROM python:3.12-slim</code> — il secondo <code>FROM</code>, inizia lo stage finale (leggero)</li>
<li><code>COPY --from=builder /root/.local /root/.local</code> — copia solo i pacchetti già installati, non i tool di build</li>
<li><code>COPY . /app</code></li>
<li><code>CMD ["python", "/app/main.py"]</code></li>
</ul>`,
      starter: `dockerfile = """
FROM python:3.12 AS builder
WORKDIR /app
...
""".strip()

n_from = dockerfile.count("FROM")
print(dockerfile)
print(n_from)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
attese = [
    "FROM python:3.12 AS builder",
    "WORKDIR /app",
    "COPY requirements.txt .",
    "RUN pip install --user -r requirements.txt",
    "FROM python:3.12-slim",
    "COPY --from=builder /root/.local /root/.local",
    "COPY . /app",
    'CMD ["python", "/app/main.py"]',
]
assert righe == attese, f"Le righe devono essere esattamente, in ordine: {attese}"
assert 'n_from' in globals() and n_from == 2, "n_from deve essere 2: due stage, due FROM"`,
      hint: `<p>Il secondo <code>FROM</code> non ha bisogno di <code>AS nome</code> se è l'ultimo stage. <code>COPY --from=builder</code> pesca file da uno stage precedente per nome, non dal tuo computer.</p>`,
      solution: `dockerfile = """
FROM python:3.12 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt
FROM python:3.12-slim
COPY --from=builder /root/.local /root/.local
COPY . /app
CMD ["python", "/app/main.py"]
""".strip()

n_from = dockerfile.count("FROM")
print(dockerfile)
print(n_from)`
    },

    { type: "theory", title: "ENV ed EXPOSE: variabili e porte dichiarate", html: `
<p><code>ENV</code> imposta una variabile d'ambiente disponibile sia durante la build sia a runtime nel container; <code>EXPOSE</code> documenta su quale porta l'applicazione ascolta (è solo documentazione — la mappatura vera avviene con <code>-p</code> in <code>docker run</code>):</p>
<pre><code>ENV PORT=8080
EXPOSE 8080</code></pre>
<p><code>EXPOSE</code> non apre davvero la porta: è un promemoria leggibile sia da chi legge il Dockerfile sia da strumenti come <code>docker inspect</code>.</p>
`, more: `
<p>Una fonte di confusione comune: molti si aspettano che <code>EXPOSE</code> renda la porta raggiungibile dall'esterno, ma non è così — l'unico modo per rendere una porta del container accessibile dal tuo browser o da altre macchine è <code>-p host:container</code> in <code>docker run</code> (o l'equivalente <code>ports:</code> in <code>docker-compose.yml</code>). Senza quel flag, la porta resta raggiungibile solo da altri container sulla stessa rete Docker, indipendentemente da cosa dice <code>EXPOSE</code>.</p>
<p><code>ENV</code> impostata nel Dockerfile diventa il valore di DEFAULT per quella variabile, ma può essere sovrascritta a runtime senza dover ricostruire l'immagine: <code>docker run -e PORT=9090 immagine</code> sovrascrive il valore impostato con <code>ENV PORT=8080</code> nel Dockerfile — utile per configurare lo stesso identico container in modo diverso in ambienti diversi (sviluppo, test, produzione) senza tre immagini separate.</p>
<p>Un pattern comune che sfrutta <code>ENV</code>: leggere una variabile d'ambiente dentro il codice dell'applicazione stessa (es. in Python, <code>os.environ.get("PORT", "8080")</code>) invece di hardcodare il numero di porta nel codice — l'app diventa configurabile dall'esterno senza modificare una riga di sorgente, solo cambiando come viene lanciato il container.</p>
` },

    {
      type: "exercise", id: "dk-07", kg: 5, title: "Drill: variabile d'ambiente e porta",
      task: `<p>Scrivi <code>dockerfile</code> con, in ordine: <code>FROM node:20-slim</code>, <code>ENV PORT=8080</code>, <code>EXPOSE 8080</code>, <code>CMD ["node", "server.js"]</code>.</p>`,
      starter: `dockerfile = """
FROM node:20-slim
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
assert righe == ["FROM node:20-slim", "ENV PORT=8080", "EXPOSE 8080", 'CMD ["node", "server.js"]']`,
      hint: `<p>Nessuna sorpresa nell'ordine: si segue lo schema visto finora, aggiungendo le due nuove istruzioni dopo <code>FROM</code>.</p>`,
      solution: `dockerfile = """
FROM node:20-slim
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
""".strip()

print(dockerfile)`
    },

    { type: "theory", title: "ARG vs ENV: build-time o anche runtime?", html: `
<p><code>ARG</code> definisce una variabile disponibile <strong>solo durante la build</strong> dell'immagine (es. una versione da scaricare); <code>ENV</code> resta disponibile anche <strong>a runtime</strong>, dentro il container in esecuzione:</p>
<pre><code>ARG VERSIONE=3.12
FROM python:\${VERSIONE}-slim
ENV APP_ENV=produzione</code></pre>
<p>Regola pratica: se un valore serve solo per scegliere COME costruire l'immagine, <code>ARG</code>; se il programma dentro il container deve poterlo leggere mentre gira, <code>ENV</code>. Un <code>ARG</code> definito prima del primo <code>FROM</code> può parametrizzare anche l'immagine base stessa, come nell'esempio.</p>
`, more: `
<p>Un <code>ARG</code> si passa a runtime della build con <code>docker build --build-arg VERSIONE=3.11 .</code>, permettendo di costruire varianti diverse della stessa immagine (es. con versioni diverse di Python) senza duplicare il Dockerfile — un caso d'uso tipico in pipeline di CI che devono testare la stessa app su più versioni del linguaggio.</p>
<p>Un <code>ARG</code> dichiarato DOPO un <code>FROM</code> è disponibile solo per le istruzioni di QUEL particolare stage (rilevante nelle build multi-stage, viste in un massimale di questa sala) — se serve lo stesso valore in più stage, va ridichiarato con <code>ARG</code> in ciascuno di essi (il valore passato da riga di comando resta lo stesso, ma la "visibilità" della variabile va dichiarata stage per stage).</p>
<p>Un errore di sicurezza comune: usare <code>ARG</code> per passare segreti (password, chiavi API) durante la build. Anche se <code>ARG</code> non finisce automaticamente nell'immagine finale come <code>ENV</code>, il suo valore RESTA visibile nella cronologia dei layer di build (<code>docker history</code>) — per segreti veri servono meccanismi dedicati come i "build secrets" di BuildKit, non un semplice <code>ARG</code>.</p>
` },

    {
      type: "exercise", id: "dk-08", kg: 15, title: "Drill: parametrizza la versione",
      task: `<p>Scrivi <code>dockerfile</code> con: <code>ARG VERSIONE=3.12</code> (prima di tutto), <code>FROM python:\${VERSIONE}-slim</code>, <code>ENV APP_ENV=produzione</code>.</p>`,
      starter: `versione_riga = "ARG VERSIONE=3.12"
from_riga = "FROM python:\${VERSIONE}-slim"
env_riga = "ENV APP_ENV=produzione"

dockerfile = "\\n".join([versione_riga, from_riga, env_riga])
print(dockerfile)`,
      check: `righe = dockerfile.splitlines()
assert righe[0] == "ARG VERSIONE=3.12", "ARG deve venire PRIMA del FROM per poterlo parametrizzare"
assert righe[1] == "FROM python:\${VERSIONE}-slim"
assert righe[2] == "ENV APP_ENV=produzione"`,
      hint: `<p>L'ordine conta: un <code>ARG</code> dichiarato dopo il <code>FROM</code> non può essere usato PER quel <code>FROM</code> — deve precederlo.</p>`,
      solution: `versione_riga = "ARG VERSIONE=3.12"
from_riga = "FROM python:\${VERSIONE}-slim"
env_riga = "ENV APP_ENV=produzione"

dockerfile = "\\n".join([versione_riga, from_riga, env_riga])
print(dockerfile)`
    },

    { type: "theory", title: "CMD vs ENTRYPOINT", html: `
<p>Entrambi definiscono cosa gira all'avvio del container, ma con una differenza di intento. <code>CMD</code> è un default facilmente sovrascrivibile da riga di comando (<code>docker run immagine altro-comando</code> lo ignora del tutto); <code>ENTRYPOINT</code> è il comando fisso, e ciò che passi dopo il nome dell'immagine diventa un suo argomento:</p>
<pre><code>ENTRYPOINT ["python", "app.py"]
CMD ["--verbose"]      # argomento di default, sovrascrivibile</code></pre>
<p>Con questa combinazione, <code>docker run immagine</code> esegue <code>python app.py --verbose</code>, mentre <code>docker run immagine --quiet</code> esegue <code>python app.py --quiet</code> — il programma resta fisso, cambiano solo i suoi argomenti.</p>
`, more: `
<p>Senza <code>ENTRYPOINT</code>, solo <code>CMD</code>: <code>docker run immagine altro-comando</code> sostituisce interamente il comando di default con <code>altro-comando</code> — utile in fase di debug, per aprire una shell al posto dell'app (<code>docker run immagine bash</code>) e ispezionare l'ambiente dall'interno senza modificare il Dockerfile.</p>
<p>Sia <code>CMD</code> che <code>ENTRYPOINT</code> hanno due forme: quella a lista JSON (<code>["python", "app.py"]</code>, detta "exec form", usata in tutti gli esempi di questa sala) e quella a stringa singola (<code>python app.py</code>, detta "shell form"). La forma a lista è preferibile perché il programma diventa il processo principale del container (PID 1), ricevendo correttamente i segnali di stop (es. <code>SIGTERM</code> quando fai <code>docker stop</code>); la forma shell avvia invece una shell intermedia che a volte non inoltra i segnali correttamente, causando container che impiegano più tempo del previsto a fermarsi.</p>
<p>Quando SIA <code>ENTRYPOINT</code> CHE <code>CMD</code> sono nella forma a lista (come nell'esempio della lavagna), Docker li CONCATENA: <code>ENTRYPOINT ["python", "app.py"]</code> più <code>CMD ["--verbose"]</code> equivale a eseguire <code>python app.py --verbose</code>. Se invece uno dei due è nella forma shell, questa concatenazione non avviene allo stesso modo — un altro motivo per preferire sempre la forma a lista in entrambe le istruzioni quando le usi insieme.</p>
` },

    {
      type: "exercise", id: "dk-09", kg: 20, title: "Drill: comando fisso, argomenti variabili",
      task: `<p>Scrivi <code>dockerfile</code> con <code>ENTRYPOINT ["python", "app.py"]</code> seguito da <code>CMD ["--verbose"]</code> come default sovrascrivibile.</p>`,
      starter: `dockerfile = """
FROM python:3.12-slim
ENTRYPOINT ["python", "app.py"]
CMD ["--verbose"]
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
assert righe == ["FROM python:3.12-slim", 'ENTRYPOINT ["python", "app.py"]', 'CMD ["--verbose"]']`,
      hint: `<p>Con <code>ENTRYPOINT</code> presente, <code>CMD</code> non è più "il comando": diventa solo il suo argomento di default.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
ENTRYPOINT ["python", "app.py"]
CMD ["--verbose"]
""".strip()

print(dockerfile)`
    },

    {
      type: "exercise", id: "dk-10", kg: 10, title: "Drill: gestisci il ciclo di vita",
      task: `<p>Scrivi le stringhe esatte:</p>
<ul>
<li><code>cmd_stop</code>: ferma il container con id <code>abc123</code></li>
<li><code>cmd_rm</code>: rimuove (elimina) quel container fermato</li>
<li><code>cmd_logs</code>: mostra i log di quel container, seguendoli in tempo reale (flag <code>-f</code>)</li>
</ul>`,
      starter: `cmd_stop = ...
cmd_rm = ...
cmd_logs = ...

print(cmd_stop)
print(cmd_rm)
print(cmd_logs)`,
      check: `assert cmd_stop == "docker stop abc123"
assert cmd_rm == "docker rm abc123"
assert cmd_logs == "docker logs -f abc123"`,
      hint: `<p><code>docker stop &lt;id&gt;</code>, <code>docker rm &lt;id&gt;</code>, <code>docker logs -f &lt;id&gt;</code>.</p>`,
      solution: `cmd_stop = "docker stop abc123"
cmd_rm = "docker rm abc123"
cmd_logs = "docker logs -f abc123"

print(cmd_stop)
print(cmd_rm)
print(cmd_logs)`
    },

    { type: "theory", title: "Tag e registri: dare un nome all'immagine", html: `
<p>Il nome completo di un'immagine ha la forma <code>[registro/]nome:tag</code>. Senza registro, si assume Docker Hub; senza tag, si assume <code>latest</code> (che NON significa "l'ultima versione stabile", solo "nessun tag specificato" — buona pratica evitarlo in produzione):</p>
<pre><code>docker tag palestra-app miorepo/palestra-app:1.2.0
docker push miorepo/palestra-app:1.2.0</code></pre>
<p><code>tag</code> crea un alias locale con il nome completo; <code>push</code> lo carica sul registro remoto — due passi separati e sempre in quest'ordine.</p>
`, more: `
<p>Un tag non è una copia dell'immagine: è semplicemente un altro NOME che punta agli stessi identici layer già presenti sul disco. <code>docker tag palestra-app miorepo/palestra-app:1.2.0</code> non duplica nulla in termini di spazio — crea solo un secondo riferimento all'immagine esistente, motivo per cui l'operazione è istantanea anche su immagini enormi.</p>
<p>Oltre a Docker Hub (il registro pubblico di default), esistono registri privati auto-ospitati o gestiti da provider cloud (Amazon ECR, Google Artifact Registry, GitHub Container Registry) — per usarli, il nome completo include l'host del registro: <code>ghcr.io/mio-utente/palestra-app:1.2.0</code>. Prima di poter fare <code>push</code> su un registro privato serve autenticarsi con <code>docker login</code>.</p>
<p>La pratica del <strong>semantic versioning</strong> (<code>1.2.0</code>, dove il primo numero indica cambiamenti incompatibili, il secondo nuove funzionalità retrocompatibili, il terzo correzioni) si applica naturalmente ai tag delle immagini Docker: un tag preciso come <code>1.2.0</code> garantisce che chi lo usa ottenga sempre esattamente la stessa immagine, mentre un tag mobile come <code>latest</code> o <code>1.2</code> può puntare a contenuti diversi nel tempo — la scelta del tag è quindi anche una scelta di quanto "promettere" stabilità a chi consuma l'immagine.</p>
` },

    {
      type: "exercise", id: "dk-11", kg: 15, title: "Drill: pubblica l'immagine",
      task: `<p>Scrivi <code>cmd_tag</code> (assegna il tag <code>miorepo/palestra-app:1.2.0</code> all'immagine locale <code>palestra-app</code>) e <code>cmd_push</code> (pubblica quel tag).</p>`,
      starter: `cmd_tag = ...
cmd_push = ...

print(cmd_tag)
print(cmd_push)`,
      check: `assert cmd_tag == "docker tag palestra-app miorepo/palestra-app:1.2.0"
assert cmd_push == "docker push miorepo/palestra-app:1.2.0"`,
      hint: `<p><code>docker tag &lt;nome-locale&gt; &lt;nome-completo:tag&gt;</code>, poi <code>docker push &lt;nome-completo:tag&gt;</code>.</p>`,
      solution: `cmd_tag = "docker tag palestra-app miorepo/palestra-app:1.2.0"
cmd_push = "docker push miorepo/palestra-app:1.2.0"

print(cmd_tag)
print(cmd_push)`
    },

    { type: "theory", title: "Volumi: dati che sopravvivono al container", html: `
<p>Un container è effimero: se lo elimini, tutto ciò che ha scritto dentro sparisce. I <strong>volumi</strong> collegano una cartella del container a uno storage persistente, in due varianti:</p>
<pre><code># bind mount: collega una cartella del TUO computer
docker run -v /home/utente/dati:/app/dati immagine

# volume gestito da Docker, con nome
docker run -v dati_app:/app/dati immagine</code></pre>
<p>Il bind mount è comodo in sviluppo (modifichi i file sul tuo computer, li vedi subito nel container); il volume con nome è la scelta giusta in produzione, gestito e isolato da Docker stesso.</p>
`, more: `
<p>Un bind mount espone letteralmente una cartella del sistema host dentro il container: qualsiasi processo nel container che scrive lì scrive DAVVERO sul disco della macchina host, con tutti i permessi e rischi che questo comporta. Un volume gestito da Docker, invece, vive in uno spazio controllato da Docker stesso (tipicamente sotto <code>/var/lib/docker/volumes/</code> su Linux), più isolato e più portabile tra macchine diverse — non dipende da un percorso assoluto specifico dell'host.</p>
<p>I volumi sopravvivono non solo alla cancellazione del container, ma anche a ricostruzioni dell'immagine: se aggiorni l'immagine di un database e ricrei il container, il volume con i dati reali (righe della tabella, indici) resta intatto e viene ricollegato al nuovo container — è esattamente il meccanismo che rende sicuro aggiornare un database "in Docker" senza perdere i dati che contiene.</p>
<p><code>docker volume ls</code> elenca i volumi gestiti presenti sulla macchina, <code>docker volume rm nome</code> lo elimina definitivamente (con tutti i dati che conteneva — un'operazione distruttiva e irreversibile, da usare con la stessa cautela di un <code>DELETE</code> SQL senza <code>WHERE</code>), <code>docker volume inspect nome</code> mostra dove si trova fisicamente sul disco host.</p>
` },

    {
      type: "exercise", id: "dk-12", kg: 15, title: "Drill: monta i dati",
      task: `<p>Scrivi <code>cmd_bind</code> (bind mount di <code>/home/utente/dati</code> su <code>/app/dati</code>, avviando <code>palestra-app</code>) e <code>cmd_volume</code> (stesso, ma con un volume gestito chiamato <code>dati_app</code>).</p>`,
      starter: `cmd_bind = ...
cmd_volume = ...

print(cmd_bind)
print(cmd_volume)`,
      check: `assert cmd_bind == "docker run -v /home/utente/dati:/app/dati palestra-app"
assert cmd_volume == "docker run -v dati_app:/app/dati palestra-app"`,
      hint: `<p><code>-v sorgente:destinazione</code>: la sorgente è un percorso assoluto per il bind mount, un nome semplice per il volume gestito.</p>`,
      solution: `cmd_bind = "docker run -v /home/utente/dati:/app/dati palestra-app"
cmd_volume = "docker run -v dati_app:/app/dati palestra-app"

print(cmd_bind)
print(cmd_volume)`
    },

    {
      type: "exercise", id: "dk-13", kg: 20, title: "Drill: compose con volume nominato",
      task: `<p>Scrivi <code>compose</code> (YAML) con un servizio <code>db</code> che usa l'immagine <code>postgres:16</code> e monta il volume nominato <code>pgdata</code> su <code>/var/lib/postgresql/data</code>; dichiara anche il volume nella sezione top-level <code>volumes:</code>.</p>`,
      starter: `compose = """
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
""".strip()

print(compose)`,
      check: `assert "image: postgres:16" in compose
assert "- pgdata:/var/lib/postgresql/data" in compose
assert compose.strip().endswith("volumes:\\n  pgdata:") or "volumes:\\n  pgdata:" in compose`,
      hint: `<p>Un volume nominato in <code>docker-compose.yml</code> va dichiarato due volte: dove viene usato (dentro il servizio) e nella sezione <code>volumes:</code> di primo livello, che lo "registra" per Docker Compose.</p>`,
      solution: `compose = """
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
""".strip()

print(compose)`
    },

    { type: "theory", title: "USER: non girare come root", html: `
<p>Per default, i processi in un container girano come <strong>root</strong> — comodo ma rischioso: un bug o una vulnerabilità nell'app ha privilegi massimi dentro il container. Buona pratica: creare un utente dedicato e passare a lui prima di eseguire l'app:</p>
<pre><code>RUN useradd -m appuser
USER appuser
CMD ["python", "app.py"]</code></pre>
<p><code>USER</code> si applica a tutte le istruzioni successive (comprese quelle a runtime): da quel punto in poi, meno privilegi, meno danno potenziale in caso di problemi.</p>
`, more: `
<p>Il principio dietro <code>USER</code> è il cosiddetto "principio del minimo privilegio": un processo dovrebbe avere solo i permessi strettamente necessari a fare il suo lavoro, mai di più. Un container che gira come root, se compromesso da una vulnerabilità nell'app (es. un pacchetto con un bug noto), dà all'attaccante privilegi di root DENTRO il container — e a seconda della configurazione del sistema host, root nel container può in certi scenari facilitare un "container escape" verso l'host stesso, un rischio che un utente non privilegiato riduce drasticamente.</p>
<p>Alcune immagini base ufficiali offrono già un utente non-root pronto all'uso, evitando il passo <code>RUN useradd</code>: l'immagine <code>node</code>, ad esempio, include un utente chiamato <code>node</code> — basta <code>USER node</code> senza doverlo creare a mano. Vale la pena controllare la documentazione dell'immagine base prima di crearne uno personalizzato.</p>
<p>Un'insidia pratica di <code>USER</code>: se l'app deve scrivere file (log, cache, upload) in una cartella, quell'utente non-root deve avere i permessi per farlo. Un pattern comune è impostare i permessi corretti PRIMA di passare a <code>USER</code>: <code>RUN mkdir -p /app/dati && chown appuser:appuser /app/dati</code> seguito da <code>USER appuser</code> — altrimenti l'app fallirebbe silenziosamente (o rumorosamente) nel tentativo di scrivere in una cartella di proprietà di root.</p>
` },

    {
      type: "exercise", id: "dk-14", kg: 15, title: "Drill: esegui senza root",
      task: `<p>Scrivi <code>dockerfile</code> con, in ordine: <code>FROM python:3.12-slim</code>, <code>RUN useradd -m appuser</code>, <code>USER appuser</code>, <code>CMD ["python", "app.py"]</code>.</p>`,
      starter: `dockerfile = """
FROM python:3.12-slim
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
assert righe == ["FROM python:3.12-slim", "RUN useradd -m appuser", "USER appuser", 'CMD ["python", "app.py"]']`,
      hint: `<p><code>USER</code> deve venire DOPO aver creato l'utente con <code>RUN useradd</code>, altrimenti Docker cercherebbe di usare un utente che non esiste ancora.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
RUN useradd -m appuser
USER appuser
CMD ["python", "app.py"]
""".strip()

print(dockerfile)`
    },

    {
      type: "exercise", id: "dk-15", kg: 20, title: "Combo: rete privata tra servizi",
      task: `<p>Scrivi <code>compose</code> con due servizi (<code>web</code> e <code>db</code>) su una rete personalizzata <code>backend</code>, dichiarata sia nei servizi sia nella sezione top-level <code>networks:</code>.</p>`,
      starter: `compose = """
services:
  web:
    build: .
    networks:
      - backend
  db:
    image: postgres:16
    networks:
      - backend
networks:
  backend:
""".strip()

print(compose)`,
      check: `assert compose.count("- backend") == 2
assert "networks:\\n  backend:" in compose`,
      hint: `<p>Come i volumi, una rete personalizzata va dichiarata sia nei servizi che la usano sia nella sezione <code>networks:</code> di primo livello.</p>`,
      solution: `compose = """
services:
  web:
    build: .
    networks:
      - backend
  db:
    image: postgres:16
    networks:
      - backend
networks:
  backend:
""".strip()

print(compose)`
    },

    {
      type: "exercise", id: "dk-16", kg: 20, title: "Combo: variabili d'ambiente nel compose",
      task: `<p>Scrivi <code>compose</code> con un servizio <code>db</code> che passa due variabili d'ambiente al container: <code>POSTGRES_USER: admin</code> e <code>POSTGRES_PASSWORD: segreta</code>, sotto la chiave <code>environment</code>.</p>`,
      starter: `compose = """
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: segreta
""".strip()

n_variabili = compose.count(":") - compose.count("image:") - 1
print(compose)`,
      check: `assert "POSTGRES_USER: admin" in compose
assert "POSTGRES_PASSWORD: segreta" in compose
assert "environment:" in compose`,
      hint: `<p><code>environment:</code> è una mappa chiave: valore, con la stessa indentazione a 2 spazi delle altre proprietà YAML.</p>`,
      solution: `compose = """
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: segreta
""".strip()

n_variabili = compose.count(":") - compose.count("image:") - 1
print(compose)`
    },

    {
      type: "exercise", id: "dk-17", kg: 20, title: "Combo: build ottimizzata con non-root",
      task: `<p>Combina layer caching (visto nel massimale precedente) con l'utente non-root: <code>FROM python:3.12-slim</code>, <code>WORKDIR /app</code>, <code>COPY requirements.txt .</code>, <code>RUN pip install -r requirements.txt</code>, <code>RUN useradd -m appuser</code>, <code>COPY . .</code>, <code>USER appuser</code>, <code>CMD ["python", "main.py"]</code>.</p>`,
      starter: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
attese = [
    "FROM python:3.12-slim", "WORKDIR /app", "COPY requirements.txt .",
    "RUN pip install -r requirements.txt", "RUN useradd -m appuser",
    "COPY . .", "USER appuser", 'CMD ["python", "main.py"]',
]
assert righe == attese`,
      hint: `<p>Ordine: dipendenze prima (per la cache), poi l'utente, poi il resto del codice, e <code>USER</code> sempre alla fine, appena prima del <code>CMD</code>.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN useradd -m appuser
COPY . .
USER appuser
CMD ["python", "main.py"]
""".strip()

print(dockerfile)`
    },

    {
      type: "exercise", id: "dk-18", kg: 20, title: "Combo: healthcheck del servizio",
      task: `<p><code>HEALTHCHECK</code> dice a Docker come verificare se il container è "sano". Scrivi <code>dockerfile</code> con <code>HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1</code> dopo <code>EXPOSE 8080</code>.</p>`,
      starter: `dockerfile = """
FROM node:20-slim
EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
""".strip()

ha_healthcheck = "HEALTHCHECK" in dockerfile
print(dockerfile)
print(ha_healthcheck)`,
      check: `assert ha_healthcheck == True
assert "HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1" in dockerfile`,
      hint: `<p>Se il comando dopo <code>HEALTHCHECK CMD</code> fallisce (<code>exit 1</code>), Docker marca il container come "unhealthy" — utile per orchestratori come Kubernetes o Docker Swarm.</p>`,
      solution: `dockerfile = """
FROM node:20-slim
EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
""".strip()

ha_healthcheck = "HEALTHCHECK" in dockerfile
print(dockerfile)
print(ha_healthcheck)`
    },

    {
      type: "exercise", id: "dk-19", kg: 20, title: "Combo: compose con tre servizi",
      task: `<p>Scrivi <code>compose</code> con tre servizi: <code>web</code> (build .), <code>api</code> (build ./api), <code>db</code> (image postgres:16). <code>web</code> e <code>api</code> dipendono entrambi da <code>db</code>.</p>`,
      starter: `compose = """
services:
  web:
    build: .
    depends_on:
      - db
  api:
    build: ./api
    depends_on:
      - db
  db:
    image: postgres:16
""".strip()

n_servizi = compose.count("build:") + compose.count("image:")
print(compose)
print(n_servizi)`,
      check: `assert n_servizi == 3
assert compose.count("depends_on:") == 2`,
      hint: `<p>Conta le occorrenze di <code>build:</code> e <code>image:</code> per verificare quanti servizi hai effettivamente scritto.</p>`,
      solution: `compose = """
services:
  web:
    build: .
    depends_on:
      - db
  api:
    build: ./api
    depends_on:
      - db
  db:
    image: postgres:16
""".strip()

n_servizi = compose.count("build:") + compose.count("image:")
print(compose)
print(n_servizi)`
    },

    {
      type: "exercise", id: "dk-20", kg: 25, title: "Combo: dockerignore completo",
      task: `<p>Scrivi <code>dockerignore</code> con 8 righe (in quest'ordine): <code>__pycache__/</code>, <code>*.pyc</code>, <code>.venv/</code>, <code>.env</code>, <code>.git/</code>, <code>node_modules/</code>, <code>*.log</code>, <code>.DS_Store</code>. Poi <code>protegge_segreti</code>: True se <code>.env</code> è tra le righe.</p>`,
      starter: `dockerignore = "\\n".join([
    "__pycache__/", "*.pyc", ".venv/", ".env", ".git/", "node_modules/", "*.log", ".DS_Store",
])

protegge_segreti = ".env" in dockerignore.splitlines()
print(dockerignore)
print(protegge_segreti)`,
      check: `righe = dockerignore.splitlines()
assert len(righe) == 8
assert righe == ["__pycache__/", "*.pyc", ".venv/", ".env", ".git/", "node_modules/", "*.log", ".DS_Store"]
assert protegge_segreti == True`,
      hint: `<p>Otto voci, ciascuna su una riga: file di build Python, ambiente virtuale, segreti, cronologia git, dipendenze Node, log, e file di sistema macOS.</p>`,
      solution: `dockerignore = "\\n".join([
    "__pycache__/", "*.pyc", ".venv/", ".env", ".git/", "node_modules/", "*.log", ".DS_Store",
])

protegge_segreti = ".env" in dockerignore.splitlines()
print(dockerignore)
print(protegge_segreti)`
    },

    {
      type: "exercise", id: "dk-21", kg: 25, title: "Massimale: applicazione web completa",
      task: `<p>Scrivi un <code>dockerfile</code> completo per un'app Flask, con TUTTI i concetti visti: build ottimizzata per cache, variabile d'ambiente, porta esposta, utente non privilegiato. Ordine esatto:</p>
<ol>
<li><code>FROM python:3.12-slim</code></li>
<li><code>WORKDIR /app</code></li>
<li><code>COPY requirements.txt .</code></li>
<li><code>RUN pip install -r requirements.txt</code></li>
<li><code>COPY . .</code></li>
<li><code>RUN useradd -m appuser</code></li>
<li><code>USER appuser</code></li>
<li><code>ENV FLASK_ENV=production</code></li>
<li><code>EXPOSE 5000</code></li>
<li><code>CMD ["python", "app.py"]</code></li>
</ol>`,
      starter: `dockerfile = """
FROM python:3.12-slim
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
attese = [
    "FROM python:3.12-slim", "WORKDIR /app", "COPY requirements.txt .",
    "RUN pip install -r requirements.txt", "COPY . .", "RUN useradd -m appuser",
    "USER appuser", "ENV FLASK_ENV=production", "EXPOSE 5000", 'CMD ["python", "app.py"]',
]
assert righe == attese`,
      hint: `<p>Dieci righe, ciascuna un concetto visto in questa sala: è la sintesi di tutto il modulo Docker in un solo file reale e completo.</p>`,
      solution: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN useradd -m appuser
USER appuser
ENV FLASK_ENV=production
EXPOSE 5000
CMD ["python", "app.py"]
""".strip()

print(dockerfile)`
    },

    {
      type: "exercise", id: "dk-22", kg: 25, title: "Massimale: stack completo con compose",
      task: `<p>Scrivi <code>compose</code> con: <code>web</code> (build ., porta "5000:5000", depends_on db, environment con <code>DATABASE_URL: postgres://db:5432/app</code>), <code>db</code> (image postgres:16, volume nominato <code>pgdata</code>), e la sezione <code>volumes: pgdata:</code> in fondo.</p>`,
      starter: `compose = """
services:
  web:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://db:5432/app
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
""".strip()

print(compose)`,
      check: `assert '"5000:5000"' in compose
assert "DATABASE_URL: postgres://db:5432/app" in compose
assert "- pgdata:/var/lib/postgresql/data" in compose
assert compose.strip().endswith("pgdata:")`,
      hint: `<p>Un compose "vero" mette insieme porte, dipendenze, variabili d'ambiente e volumi: ogni pezzo separato in questa sala, qui riunito.</p>`,
      solution: `compose = """
services:
  web:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://db:5432/app
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
""".strip()

print(compose)`
    },

    {
      type: "exercise", id: "dk-23", kg: 25, title: "Massimale: multi-stage con Node",
      task: `<p>Build multi-stage per un'app frontend: stage 1 <code>FROM node:20 AS builder</code>, <code>WORKDIR /app</code>, <code>COPY . .</code>, <code>RUN npm install && npm run build</code>; stage 2 <code>FROM nginx:alpine</code>, <code>COPY --from=builder /app/dist /usr/share/nginx/html</code>.</p>`,
      starter: `dockerfile = """
FROM node:20 AS builder
...
""".strip()

n_from = dockerfile.count("FROM")
print(dockerfile)
print(n_from)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
attese = [
    "FROM node:20 AS builder", "WORKDIR /app", "COPY . .", "RUN npm install && npm run build",
    "FROM nginx:alpine", "COPY --from=builder /app/dist /usr/share/nginx/html",
]
assert righe == attese
assert n_from == 2`,
      hint: `<p>Lo stage finale (nginx) è minuscolo: contiene solo i file statici già compilati, non Node.js né le dipendenze di sviluppo — l'immagine di produzione pesa una frazione di quella di build.</p>`,
      solution: `dockerfile = """
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
""".strip()

n_from = dockerfile.count("FROM")
print(dockerfile)
print(n_from)`
    },

    {
      type: "exercise", id: "dk-24", kg: 25, title: "Massimale: diagnosi di un Dockerfile pigro",
      task: `<p>Ti danno un Dockerfile scritto male (cache inefficiente: copia tutto prima di installare). Scrivi <code>problema</code> (stringa che descrive l'errore) individuandolo dal codice, e <code>corretto</code> (la versione sistemata).</p>`,
      starter: `pigro = """
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
""".strip()

righe_pigro = pigro.splitlines()
indice_copy_tutto = righe_pigro.index("COPY . .")
indice_pip = righe_pigro.index("RUN pip install -r requirements.txt")

problema = "cache inefficiente" if indice_copy_tutto < indice_pip else "nessun problema"

corretto = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
""".strip()

print(problema)
print(corretto)`,
      check: `assert problema == "cache inefficiente", "COPY . . viene prima di pip install: ogni modifica al codice invalida anche l'installazione delle dipendenze"
assert corretto.splitlines().index("COPY requirements.txt .") < corretto.splitlines().index("RUN pip install -r requirements.txt")
assert corretto.splitlines().index("RUN pip install -r requirements.txt") < corretto.splitlines().index("COPY . .")`,
      hint: `<p>Il problema si individua confrontando le POSIZIONI delle righe: se <code>COPY . .</code> ha un indice minore di <code>RUN pip install</code>, la copia avviene prima, e la cache è inefficiente.</p>`,
      solution: `pigro = """
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
""".strip()

righe_pigro = pigro.splitlines()
indice_copy_tutto = righe_pigro.index("COPY . .")
indice_pip = righe_pigro.index("RUN pip install -r requirements.txt")

problema = "cache inefficiente" if indice_copy_tutto < indice_pip else "nessun problema"

corretto = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
""".strip()

print(problema)
print(corretto)`
    },

    {
      type: "exercise", id: "dk-25", kg: 15, title: "Drill: immagine su misura per Node",
      task: `<p>Scrivi <code>dockerfile</code>: <code>FROM node:20-alpine</code>, <code>WORKDIR /app</code>, <code>COPY package.json .</code>, <code>RUN npm install</code>, <code>COPY . .</code>, <code>CMD ["node", "index.js"]</code>.</p>`,
      starter: `dockerfile = """
FROM node:20-alpine
...
""".strip()

print(dockerfile)`,
      check: `righe = [r.strip() for r in dockerfile.strip().splitlines()]
assert righe == ["FROM node:20-alpine", "WORKDIR /app", "COPY package.json .", "RUN npm install", "COPY . .", 'CMD ["node", "index.js"]']`,
      hint: `<p>Stessa logica di cache vista per Python: <code>package.json</code> prima, <code>npm install</code>, poi il resto del codice.</p>`,
      solution: `dockerfile = """
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "index.js"]
""".strip()

print(dockerfile)`
    },

    {
      type: "exercise", id: "dk-26", kg: 15, title: "Drill: quante righe RUN?",
      task: `<p>Su <code>dockerfile</code> (già scritto): <code>n_run</code>, quante istruzioni <code>RUN</code> contiene (per riga, non substring dentro altre parole).</p>`,
      setup: `dockerfile = """
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update
RUN pip install --upgrade pip
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
""".strip()`,
      starter: `# dockerfile e' gia' pronto
righe = dockerfile.splitlines()
n_run = sum(1 for r in righe if r.strip().startswith("RUN "))
print(n_run)`,
      check: `assert n_run == 3`,
      hint: `<p><code>.startswith("RUN ")</code> (con lo spazio) evita di contare per sbaglio parole che iniziano per "RUN" senza esserlo davvero.</p>`,
      solution: `righe = dockerfile.splitlines()
n_run = sum(1 for r in righe if r.strip().startswith("RUN "))
print(n_run)`
    },

    {
      type: "exercise", id: "dk-27", kg: 20, title: "Combo: compose con override di ambiente",
      task: `<p>Scrivi <code>compose</code> con un servizio <code>web</code> che legge la porta da variabile d'ambiente dell'host con la sintassi <code>"\${PORT:-8000}:80"</code> (usa 8000 come default se <code>PORT</code> non è impostata).</p>`,
      starter: `riga_ports = '      - "\${PORT:-8000}:80"'
compose = "\\n".join(["services:", "  web:", "    build: .", "    ports:", riga_ports])
print(compose)`,
      check: `assert '"\${PORT:-8000}:80"' in compose`,
      hint: `<p>La sintassi <code>\${VAR:-default}</code> in un file compose legge una variabile d'ambiente dell'host, con un valore di riserva se non è impostata.</p>`,
      solution: `riga_ports = '      - "\${PORT:-8000}:80"'
compose = "\\n".join(["services:", "  web:", "    build: .", "    ports:", riga_ports])
print(compose)`
    },

    {
      type: "exercise", id: "dk-28", kg: 20, title: "Combo: conta gli stage di una build",
      task: `<p>Data una serie di Dockerfile in <code>esempi</code> (liste di righe), scrivi <code>conta_stage(righe)</code> che restituisce quante volte compare <code>FROM</code>. Applicala a tutti, salvando in <code>risultati</code> (lista di interi).</p>`,
      starter: `esempi = [
    ["FROM python:3.12", "CMD [\\"python\\", \\"app.py\\"]"],
    ["FROM node:20 AS builder", "FROM nginx:alpine", "COPY --from=builder /app /www"],
    ["FROM golang:1.22 AS build", "FROM scratch", "COPY --from=build /bin/app /app"],
]

def conta_stage(righe):
    return sum(1 for r in righe if r.startswith("FROM"))

risultati = [conta_stage(e) for e in esempi]
print(risultati)`,
      check: `assert risultati == [1, 2, 2]`,
      hint: `<p>Ogni <code>FROM</code> aggiuntivo apre un nuovo stage: contarli dice subito se una build è multi-stage.</p>`,
      solution: `esempi = [
    ["FROM python:3.12", "CMD [\\"python\\", \\"app.py\\"]"],
    ["FROM node:20 AS builder", "FROM nginx:alpine", "COPY --from=builder /app /www"],
    ["FROM golang:1.22 AS build", "FROM scratch", "COPY --from=build /bin/app /app"],
]

def conta_stage(righe):
    return sum(1 for r in righe if r.startswith("FROM"))

risultati = [conta_stage(e) for e in esempi]
print(risultati)`
    },

    {
      type: "exercise", id: "dk-29", kg: 25, title: "Massimale: valida un Dockerfile",
      task: `<p>Scrivi <code>valida(righe)</code>: restituisce una lista di problemi trovati (stringhe) controllando: 1) la prima riga deve iniziare con <code>FROM</code>; 2) deve esserci almeno un <code>CMD</code> o <code>ENTRYPOINT</code>; 3) non deve contenere la parola <code>latest</code> (tag non specificato, rischioso). Testala su due esempi.</p>`,
      starter: `def valida(righe):
    problemi = []
    if not righe[0].startswith("FROM"):
        problemi.append("la prima riga deve essere FROM")
    if not any(r.startswith("CMD") or r.startswith("ENTRYPOINT") for r in righe):
        problemi.append("manca CMD o ENTRYPOINT")
    if any("latest" in r for r in righe):
        problemi.append("evita il tag 'latest'")
    return problemi

buono = ["FROM python:3.12-slim", "WORKDIR /app", 'CMD ["python", "app.py"]']
cattivo = ["FROM python:latest", "WORKDIR /app"]

problemi_buono = valida(buono)
problemi_cattivo = valida(cattivo)

print(problemi_buono)
print(problemi_cattivo)`,
      check: `assert problemi_buono == []
assert "evita il tag 'latest'" in problemi_cattivo
assert "manca CMD o ENTRYPOINT" in problemi_cattivo
assert len(problemi_cattivo) == 2`,
      hint: `<p>Una funzione di validazione è solo una serie di controlli indipendenti che accumulano messaggi in una lista, esattamente come una checklist.</p>`,
      solution: `def valida(righe):
    problemi = []
    if not righe[0].startswith("FROM"):
        problemi.append("la prima riga deve essere FROM")
    if not any(r.startswith("CMD") or r.startswith("ENTRYPOINT") for r in righe):
        problemi.append("manca CMD o ENTRYPOINT")
    if any("latest" in r for r in righe):
        problemi.append("evita il tag 'latest'")
    return problemi

buono = ["FROM python:3.12-slim", "WORKDIR /app", 'CMD ["python", "app.py"]']
cattivo = ["FROM python:latest", "WORKDIR /app"]

problemi_buono = valida(buono)
problemi_cattivo = valida(cattivo)

print(problemi_buono)
print(problemi_cattivo)`
    },

    {
      type: "exercise", id: "dk-30", kg: 25, title: "Massimale finale: genera il Dockerfile da una configurazione",
      task: `<p>Scrivi <code>genera_dockerfile(config)</code>: dato un dizionario <code>{"base": ..., "workdir": ..., "porta": ..., "comando": [...]}</code>, costruisce e restituisce le righe del Dockerfile corrispondente (come lista di stringhe), nell'ordine FROM/WORKDIR/EXPOSE/CMD.</p>`,
      starter: `def genera_dockerfile(config):
    righe = [f"FROM {config['base']}"]
    righe.append(f"WORKDIR {config['workdir']}")
    righe.append(f"EXPOSE {config['porta']}")
    cmd_json = ", ".join(f'"{c}"' for c in config["comando"])
    righe.append(f"CMD [{cmd_json}]")
    return righe

config = {"base": "python:3.12-slim", "workdir": "/app", "porta": 8000, "comando": ["python", "app.py"]}
righe = genera_dockerfile(config)
print("\\n".join(righe))`,
      check: `assert righe == ["FROM python:3.12-slim", "WORKDIR /app", "EXPOSE 8000", 'CMD ["python", "app.py"]']`,
      hint: `<p>Generare configurazione da dati invece di scriverla a mano è esattamente cosa fanno strumenti come Docker Compose o i template Helm dietro le quinte: dati + template = file finale.</p>`,
      solution: `def genera_dockerfile(config):
    righe = [f"FROM {config['base']}"]
    righe.append(f"WORKDIR {config['workdir']}")
    righe.append(f"EXPOSE {config['porta']}")
    cmd_json = ", ".join(f'"{c}"' for c in config["comando"])
    righe.append(f"CMD [{cmd_json}]")
    return righe

config = {"base": "python:3.12-slim", "workdir": "/app", "porta": 8000, "comando": ["python", "app.py"]}
righe = genera_dockerfile(config)
print("\\n".join(righe))`
    }
  ]
});
