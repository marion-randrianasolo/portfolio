# Portfolio PostgreSQL avec Next.js et TypeScript

## Présentation

Ce projet est une application de portfolio complète, réalisée en **TypeScript**. Elle comprend :

* **Un backend Node.js** entièrement typé qui se connecte à une base de données **PostgreSQL** via le module `pg`.  
  Le serveur expose des routes REST (`/api/projects`, `/api/experiences`, `/api/education`, `/api/languages`, `/api/skills` et `/api/personal-info`) pour gérer tous les éléments du portfolio.
* **Un front‑end Next.js** utilisant React, TypeScript et **Tailwind CSS**, enrichi d’animations et de comportements interactifs.  
  L’interface propose trois pages : l’accueil listant les projets, une page **CV** et une page **Admin**. La page CV a été repensée pour rendre la lecture agréable et modulable : chaque section (Expériences, Formation, Langues, Compétences et Centres d’intérêts) est repliable grâce à un chevron et peut être affichée ou masquée d’un clic. Des icônes Font Awesome et des fonds dégradés colorent les titres. Les expériences et les formations s’affichent sur une **timeline verticale continue** : une ligne colorée parcourt toute la section et chaque entrée est marquée par un point parfaitement aligné avec son intitulé, l’entreprise et les dates. Les langues sont accompagnées d’une **barre de progression** permettant de visualiser le niveau (par exemple : Native → 100 %, Fluent → 80 %, etc.) et les compétences sont regroupées en badges par catégorie. Un **nouvel espace Centres d’intérêts** adopte un **carrousel horizontal** : chaque hobby apparaît dans une carte colorée avec une icône thématique (musique, photographie, jeux…) et, au survol, une infobulle discrète affiche sa description. Ce carrousel remplace les anciennes cartes retournables pour plus de fluidité. Un **effet fade‑in** à l’apparition et des transitions au survol animent l’ensemble.
* **SCSS** est utilisé pour personnaliser certaines classes globales (timeline continue, carrousel horizontal, animations) et pour conserver les retours à la ligne dans les descriptions (`white-space: pre-wrap`).

Cette structure s’appuie sur les informations de votre CV : compétences techniques et frameworks【173211839739286†L19-L32】, expérience professionnelle【173211839739286†L34-L51】, parcours académique【173211839739286†L53-L67】 et projet personnel【173211839739286†L77-L86】. Les entités de la base de données reflètent ces sections (projets, expériences, éducation, langues, compétences et informations personnelles).

## Architecture du backend

* **Technologies** : Node.js avec TypeScript, module `pg` pour l’accès PostgreSQL, serveur HTTP natif (`http`).
* **Connexion** : la configuration provient de variables d’environnement `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` et `PGDATABASE`.
* **Tables créées automatiquement** : `projects`, `experiences`, `education`, `languages`, `skills`, `personal_info` **et `interests`**. Chacune dispose d’un schéma adapté : titre, description, dates, etc. La table `interests` enregistre vos centres d’intérêts (intitulé et description) pour être affichés dans le CV.
* **Routes REST** :
  - **Collection** (`GET` & `POST`) : `/api/projects`, `/api/experiences`, etc.  
  - **Élément** (`GET`, `PUT`, `DELETE`) : `/api/projects/:id`…  
  - **Informations personnelles** : `/api/personal-info` supporte `GET` et `POST`/`PUT`. Seul un enregistrement est maintenu et mis à jour.
* **CORS** : toutes les réponses incluent des en‑têtes pour autoriser les requêtes cross‑origin.

### Lancement du serveur

Dans le dossier `backend`, installez les dépendances locales (le module `pg` et les types) puis lancez le serveur :

    npm install
    export PGHOST=localhost
    export PGPORT=5432
    export PGUSER=me
    export PGPASSWORD=password
    export PGDATABASE=portfolio
    npm run dev

La commande `npm run dev` démarre le serveur via `ts-node` sur le port 4000 et crée les tables si elles n’existent pas.  
Pour compiler et exécuter la version JavaScript :

    npm run build
    npm start

## Architecture du front‑end

* **Framework** : Next.js 15 avec React et TypeScript.
* **Styles** : Tailwind CSS et SCSS (`globals.scss`), incluant des classes utilitaires et quelques règles personnalisées pour les pages du CV.
* **Pages** :
  - **`/` (Accueil)** : affiche les projets présents dans la base grâce au composant `ProjectCard`.
  - **`/cv` (Curriculum Vitae)** : récupère et affiche vos informations personnelles, vos expériences, formations, langues et compétences. Cette page a été repensée pour une lecture plus dynamique :
    * les sections **Expériences** et **Formation** s’appuient sur un **layout en grille** : chaque élément occupe deux colonnes, l’une pour le rail vertical et le point, l’autre pour le contenu. Le rail traverse la carte sur toute sa hauteur et le point est parfaitement aligné avec le titre. Cette structure assure un alignement précis et facilite la lecture de la chronologie.
    * les **langues** sont accompagnées d’une **barre de progression** illustrant votre niveau : un badge indique le nom de la langue et le niveau (ex. “Anglais — C2”), et une barre horizontale se remplit proportionnellement (Native → 100 %, Fluent → 80 %, etc.).
    * les **compétences** sont regroupées par catégorie et chaque compétence est affichée sous forme de badge. Le nom de la catégorie est indiqué avant la liste (par exemple : “Programming Languages”, “Frameworks & Tools”, etc.).
    * les retours à la ligne dans les descriptions sont conservés grâce à la classe CSS `whitespace-pre-wrap`.
    * un léger effet **fade‑in** est appliqué aux cartes à l’apparition (grâce à un `IntersectionObserver` qui ajoute la classe `.visible` dès qu’un élément entre dans le viewport), pour renforcer l’impression de fluidité lors du défilement. Les lignes de la timeline et les badges bénéficient également d’un effet de survol.
    * chaque section est ornée d’une **icône** issue de Font Awesome (valise pour les expériences, toque de diplômé pour la formation, globe pour les langues, ordinateur pour les compétences) et de fonds **dégradés** pour dynamiser l’esthétique.
    * une **bande de niveau** est affichée en haut de la page CV : votre nombre total d’années d’expérience est calculé automatiquement et converti en “niveau” (Lv. 1, Lv. 2…). Une barre de progression indique la progression vers le niveau suivant et le total d’années d’expérience est affiché.
    * des **trophées** se débloquent automatiquement selon votre profil : “Tech Polyglot” si vous maîtrisez plus de cinq compétences différentes, “International” si vous parlez plus de deux langues, “Maker” si vous avez renseigné des centres d’intérêts. Ces badges apparaissent juste au‑dessus de la section “Centres d’intérêts”.
    * la section **Centres d’intérêts** utilise un **carrousel horizontal** (scroll‑snap) : chaque intérêt est affiché comme une carte colorée avec une icône. Au survol, un cartouche discret affiche la description de l’intérêt. Ce design est plus fluide et moderne que les anciennes cartes retournables.
    * lorsqu’aucune expérience ou formation n’est enregistrée, un petit message (“Aucune expérience pour le moment”) remplace la liste, afin d’éviter un bloc vide.
  - **`/admin`** : permet de créer, modifier et supprimer tous les objets : projets, expériences, formations, langues, compétences et vos informations personnelles. Les formulaires utilisent des `textarea` pour les descriptions afin de gérer les retours à la ligne. Les modifications sont envoyées via `fetch` aux endpoints du backend.
* **Composants** : `Navbar` pour la navigation, `Layout` pour un conteneur commun, `ProjectCard` pour l’affichage des projets.

### Démarrage du front‑end

Depuis le dossier `frontend` :

    npm install
    npm run dev

La commande `npm run dev` démarre Next.js en mode développement sur le port 3000 par défaut.  

## Fonctionnement et apprentissage

Ce projet offre une base solide pour apprendre plusieurs technologies :

1. **TypeScript** : améliore la robustesse du code et l’autocomplétion. Le backend et le front‑end sont entièrement typés.
2. **PostgreSQL** : vous apprenez à créer des tables, interroger et manipuler des données via `pg`.
3. **Next.js et React** : structures des pages, récupération de données côté client et rendu dynamique.
4. **Tailwind CSS & SCSS** : combinez utilitaires Tailwind et variables/mixins SCSS pour un design moderne.
5. **Gestion de contenus multilignes** : les champs descriptifs utilisent `textarea` et la classe CSS `whitespace-pre-wrap` pour conserver les retours à la ligne dans l’affichage.

> **Remarque sur les tests** : les versions précédentes du projet incluaient la configuration d’un framework de tests end‑to‑end (Cypress). Afin de simplifier l’installation et d’éviter des conflits de versions avec votre environnement Node actuel, cette version PostgreSQL n’intègre plus cette dépendance. Vous êtes libre de l’ajouter ultérieurement si vous souhaitez expérimenter les tests automatisés.

En résumé, cette version PostgreSQL du portfolio propose une API robuste et une interface moderne que vous pouvez enrichir au fil de votre apprentissage. Vous pouvez par exemple ajouter une authentification, des catégories de projets ou encore intégrer une documentation Swagger pour l’API.