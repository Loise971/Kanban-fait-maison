/* Première table : List */

-- On démarre une transaction afin de s'assurer de la cohérence gloabale de la BDD
BEGIN;

-- D'abord on supprime les table 'si elle existe"
DROP TABLE IF EXISTS "list", "card", "tag", "card_has_tag";

-- Ensuite on la (re)crée

CREATE TABLE "list" (
  -- on utilise le nouveau type qui est un standart SQL alors que SERIAL est un pseudo-type de PG
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "position" INTEGER NOT NULL DEFAULT 0,
  -- pour avoir la date et l'heure on utilise le type "timestamp", et pour être le plus précis possible on utilisera plutôt le type "timestampz" qui contient en plus de la date et de l'heure le fuseau horaire défini dans les locales du serveur
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);


/* 2ème table : Card */

CREATE TABLE "card" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "content" TEXT NOT NULL DEFAULT '',
  "color" TEXT NOT NULL DEFAULT '#FFF' ,
  -- si l'on veut pouvoir supprimer une liste qui contient des cartes, on est obligé de rajouter "ON DELETE CASCADE" qui aura pour conséquence de supprimer toutes les cartes qui font référence à la liste
  "list_id" INTEGER NOT NULL REFERENCES list("id") ON DELETE CASCADE,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

/* 3ème table : Tag */

CREATE TABLE "tag" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "color" TEXT NOT NULL DEFAULT '#FFF' ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

/* On oublie pas la table de liaison ! */

CREATE TABLE "card_has_tag" (
  -- si l'on veut pouvoir supprimer une carte ou un tag, on est obligé de rajouter "ON DELETE CASCADE" qui aura pour conséquence de supprimer les associations qui font référence a la carte ou le tag supprimé.
  "card_id" INTEGER NOT NULL REFERENCES card("id") ON DELETE CASCADE,
  "tag_id" INTEGER NOT NULL REFERENCES tag("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- ici pas d'updated_at car une relation ne se met pas à jour, soit on l'ajoute soit on la supprime
);

/* une fois les tables crées, on va les remplir */

INSERT INTO "list" ("name")
VALUES ('Première liste' );

INSERT INTO "card" ("content", "color", "list_id")
VALUES ('Carte 1', '#fff696', 1),
       ('2ème carte', '#c1e7ff', 1);

INSERT INTO "tag" ("name", "color")
VALUES ('Urgent', '#F00');

-- et on oublie pas la table de liaison !
INSERT INTO "card_has_tag" ("card_id", "tag_id")
VALUES (1,1);

COMMIT;