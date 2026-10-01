# Mes mots — prototype

- [x] Direction visuelle « Bento chaleureux »
- [x] Design system (src/styles.css) + couleurs des sons (--son-*)
- [x] Moteur de découpage en graphèmes (règles + exceptions modifiables)
- [x] Écran principal : « Mes mots », « Écris ton mot », « Découvrir mon mot »
- [x] Je découvre (blocs colorés + 🔊 synthèse vocale)
- [x] À toi de séparer les sons (+ Vérifier, rétroaction sobre)
- [x] J'écris mon mot (comparaison avec le modèle coloré)
- [x] Mots affichés en minuscules
- [x] Testé : chat, chapeau, bateau, maison, mouton, chanson, champignon, beaucoup, voiture, lapin

## Plus tard (structure déjà prête)
Listes de mots par enseignant, comptes élèves, niveaux, écoute d'un son isolé,
dictée, suivi de progression, statistiques, couleurs personnalisables.

## Comptes et mots sauvegardés (2026-09-17)
- [x] Connexion par courriel + mot de passe (vérification par courriel active) et bouton Google
- [x] Un compte parent peut ajouter plusieurs enfants (chacun avec sa propre liste de mots)
- [x] Ajout de mots : bouton « Ajouter ce mot à ma liste » + champ « Ajouter un mot… »
- [x] Suppression avec confirmation douce ; données conservées dans Lovable Cloud (RLS par compte)

### Plus tard
- Listes partagées par un enseignant, niveaux, progression, statistiques, couleurs personnalisables

## Groupes de — multiplication (2026-09-17)
- [x] Accueil : 4 activités + ⚙️ espace enseignant
- [x] Je manipule : jetons glissés (souris + tactile), niveaux 1 et 2, vérification par groupe
- [x] Je représente : 3 images, dont l'inverse (b groupes de a)
- [x] Je comprends : groupes → addition répétée → écriture multiplicative, une étape à la fois
- [x] Je pratique : tables au choix, aide 💡 qui ramène aux jetons
- [x] Espace enseignant : tables, nombre max, activités, addition répétée, audio, chronomètre (désactivé par défaut) — conservé sur l'appareil
- [x] Convention « premier nombre = nombre de groupes » partout
- [x] « Mes mots » déplacé vers /mots

## Motivation et devoirs (2026-09-17)
- [x] Étoiles à collectionner (conservées sur l'appareil, pastille ⭐ en haut des pages)
- [x] Bravos de progression (tous les 5 exercices réussis, +3 étoiles à la fin du parcours)
- [x] Parcours du jour : manipule → représente → pratique, guidé par un ruban discret
- [x] Espace parent : conseils + résumé de ce qui a été travaillé (/parent, remise à zéro possible)
- [x] Testé en navigateur : parcours démarré, étoile gagnée, journal et page parent à jour

### Quatre opérations
- [x] Addition (/addition) : deux collections de jetons à rassembler, écritures progressives
- [x] Soustraction (/soustraction) : jetons à enlever dans une deuxième boîte
- [x] Division (/division) : partage en groupes égaux, « 12 partagés en 3 groupes de 4 »
- [x] Accueil repensé par opération ; les 4 activités de multiplication vivent à /multiplication
- [x] Espace enseignant : activités des 4 opérations + nombre maximal en addition/soustraction
- [x] Espace parent : journal adapté aux quatre opérations
- [x] Testé en navigateur (format iPad) : glisser-déposer, vérification, bravo, aucune erreur

### Sessions élèves (2026-09-18)
- [x] Table « progression » par enfant (étoiles, journal, parcours) — migrée à l'acceptation
- [x] Choix de l'enfant qui joue sur l'accueil (« qui joue ? ») pour les parents connectés
- [x] Progression sauvegardée dans Lovable Cloud par enfant, retrouvée sur un autre appareil
- [x] Sans compte ou sans enfant choisi : tout reste sur l'appareil (comme avant)

### Nouveau nom (2026-09-18)
- [x] L'application s'appelle « J'apprends ici » (accueil, titres, icône d'écran d'accueil)
- [x] Lien « 📖 mes mots » ajouté sur l'accueil
- [x] L'accueil affiche le gros titre « mathématique » (à la place de « groupes de »)
- [ ] Nouvelle adresse j-apprends-ici.lovable.app à la publication

### À venir
- [ ] Republier pour mettre les nouveautés en ligne

## Tables de multiplication (2026-09-18)
- [x] Page /tables : tables de 1 a 10, mode reponses cachees (toucher pour reveler), lecture vocale par ligne
- [x] Lien « Les tables » sur la page multiplication
- [x] verbes : décompte questions (4/20) + écran de fin après 20 questions — vérifié dans l'aperçu
- [x] je complète : phrases toutes différentes, une phrase revient seulement si l'élève a fait une erreur — vérifié
- [x] je repère : question « quel est le verbe utilisé ? » — vérifié dans l'aperçu
- [x] je trouve le pronom : groupes tous différents dans une série — vérifié (5/5 uniques)
- [x] je construis : écran de fin après 20 questions déjà en place (à vérifier)

### Verbes — répétitions (2026-09-29)
- [ ] je trouve le pronom : 20 phrases toutes différentes + toujours un « moi → je » dans la série — à vérifier
- [ ] je complète : 20 phrases toutes différentes + chaque pronom (je, tu, il/elle, nous, vous, ils/elles) pratiqué au moins une fois — à vérifier
