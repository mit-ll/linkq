import { LinkQChatMessageType } from "redux/chatHistorySlice"

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE.trim() === "true"

export const DEMO_QUERY = `SELECT ?movie ?movieLabel ?director ?directorLabel ?awardDate
WHERE {
  ?movie p:P166 ?statement. # P166 is the property for 'award received'
  ?statement ps:P166 wd:Q102427; # Q102427 represents 'Academy Award for Best Picture'
            pq:P585 ?awardDate. # P585 is the property for 'point in time'
  ?movie wdt:P57 ?director. # P57 is the property for 'director'
  
  FILTER(YEAR(?awardDate) >= 2022 && YEAR(?awardDate) <= 2024)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
ORDER BY ?awardDate`

export const DEMO_QUERY_HISTORY = [
  {
    "name": "Academy Award for Best Picture winners (2022-2024) with directors and award dates",
    "query": "SELECT ?movie ?movieLabel ?director ?directorLabel ?awardDate\nWHERE {\n  ?movie p:P166 ?statement. # P166 is the property for 'award received'\n  ?statement ps:P166 wd:Q102427; # Q102427 represents 'Academy Award for Best Picture'\n            pq:P585 ?awardDate. # P585 is the property for 'point in time'\n  ?movie wdt:P57 ?director. # P57 is the property for 'director'\n  \n  FILTER(YEAR(?awardDate) >= 2022 && YEAR(?awardDate) <= 2024)\n  \n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n}\nORDER BY ?awardDate",
    "results": {
      "data": {
        "head": {
          "vars": [
            "movie",
            "movieLabel",
            "director",
            "directorLabel",
            "awardDate"
          ]
        },
        "results": {
          "bindings": [
            {
              "movie": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q104686893"
              },
              "director": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q7506788"
              },
              "movieLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "CODA"
              },
              "directorLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Siân Héder"
              },
              "awardDate": {
                "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                "type": "literal",
                "value": "2022-03-27T00:00:00Z"
              }
            },
            {
              "movie": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q83808444"
              },
              "director": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q28746830"
              },
              "movieLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Everything Everywhere All at Once"
              },
              "directorLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Dan Kwan"
              },
              "awardDate": {
                "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                "type": "literal",
                "value": "2023-01-01T00:00:00Z"
              }
            },
            {
              "movie": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q83808444"
              },
              "director": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q28746848"
              },
              "movieLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Everything Everywhere All at Once"
              },
              "directorLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Daniel Scheinert"
              },
              "awardDate": {
                "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                "type": "literal",
                "value": "2023-01-01T00:00:00Z"
              }
            },
            {
              "movie": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q108839994"
              },
              "director": {
                "type": "uri",
                "value": "http://www.wikidata.org/entity/Q25191"
              },
              "movieLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Oppenheimer"
              },
              "directorLabel": {
                "xml:lang": "en",
                "type": "literal",
                "value": "Christopher Nolan"
              },
              "awardDate": {
                "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                "type": "literal",
                "value": "2024-03-10T00:00:00Z"
              }
            }
          ]
        }
      },
      "error": null,
      "summary": "The Academy Award for Best Picture between 2022 and 2024 was won by:\n\n1. \"CODA\" directed by Siân Héder, which won the award on March 27, 2022.\n2. \"Everything Everywhere All at Once\" with directors Dan Kwan and Daniel Scheinert, both awarded on January 1, 2023. It's listed twice because there are two directors.\n3. \"Oppenheimer\" directed by Christopher Nolan, which won the award on March 10, 2024."
    }
  }
]

export const DEMO_RESULTS = {
  "data": {
    "head": {
      "vars": [
        "movie",
        "movieLabel",
        "director",
        "directorLabel",
        "awardDate"
      ]
    },
    "results": {
      "bindings": [
        {
          "movie": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q104686893"
          },
          "director": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q7506788"
          },
          "movieLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "CODA"
          },
          "directorLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Siân Héder"
          },
          "awardDate": {
            "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
            "type": "literal",
            "value": "2022-03-27T00:00:00Z"
          }
        },
        {
          "movie": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q83808444"
          },
          "director": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q28746830"
          },
          "movieLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Everything Everywhere All at Once"
          },
          "directorLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Dan Kwan"
          },
          "awardDate": {
            "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
            "type": "literal",
            "value": "2023-01-01T00:00:00Z"
          }
        },
        {
          "movie": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q83808444"
          },
          "director": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q28746848"
          },
          "movieLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Everything Everywhere All at Once"
          },
          "directorLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Daniel Scheinert"
          },
          "awardDate": {
            "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
            "type": "literal",
            "value": "2023-01-01T00:00:00Z"
          }
        },
        {
          "movie": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q108839994"
          },
          "director": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q25191"
          },
          "movieLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Oppenheimer"
          },
          "directorLabel": {
            "xml:lang": "en",
            "type": "literal",
            "value": "Christopher Nolan"
          },
          "awardDate": {
            "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
            "type": "literal",
            "value": "2024-03-10T00:00:00Z"
          }
        }
      ]
    }
  },
  "error": null,
  "summary": "The Academy Award for Best Picture between 2022 and 2024 was won by:\n\n1. \"CODA\" directed by Siân Héder, which won the award on March 27, 2022.\n2. \"Everything Everywhere All at Once\" with directors Dan Kwan and Daniel Scheinert, both awarded on January 1, 2023. It's listed twice because there are two directors.\n3. \"Oppenheimer\" directed by Christopher Nolan, which won the award on March 10, 2024."
}

export const DEMO_SIMPLE_HISTORY:LinkQChatMessageType[] = [
  {
    "chatId": 0,
    "name": "user",
    "role": "user",
    "content": "Can you tell me about interesting movies?"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "I can help you create a SPARQL query to find interesting movies from Wikidata. Could you specify what makes a movie interesting for you? For example, are you interested in movies by a certain director, within a specific genre, or those that have won specific awards?",
    "role": "assistant"
  },
  {
    "chatId": 0,
    "name": "user",
    "role": "user",
    "content": "Between 2022 and 2024, which movies won the Academy Award for Best Picture? Also tell me who was the movie director, and when it won the award."
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "content": "```sparql\nSELECT ?movie ?movieLabel ?director ?directorLabel ?awardDate\nWHERE {\n  ?movie p:P166 ?statement. # P166 is the property for 'award received'\n  ?statement ps:P166 wd:Q102427; # Q102427 represents 'Academy Award for Best Picture'\n            pq:P585 ?awardDate. # P585 is the property for 'point in time'\n  ?movie wdt:P57 ?director. # P57 is the property for 'director'\n  \n  FILTER(YEAR(?awardDate) >= 2022 && YEAR(?awardDate) <= 2024)\n  \n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n}\nORDER BY ?awardDate\n```\nThis query fetches movies that won the Academy Award for Best Picture between 2022 and 2024, including each movie's director and the date when the award was won. It filters the awards by the given years and orders the results by the date when the award was received.",
    "role": "assistant"
  }
]

export const DEMO_FULL_HISTORY:LinkQChatMessageType[] = [
  {
    "chatId": 0,
    "name": "system",
    "role": "system",
    "content": "You are a helpful chat assistant. This system will give you access to data in the WikiData Knowledge Graph, that contains encyclopedic data similar to Wikipedia, but in knowledge graph format using the RDF framework. \n\nIf users ask questions that can be answered via WikiData, your job is not to directly answer their questions, but instead to help them write a SPARQL query to find that data. You can ask the user to clarify their questions if the questions are vague, open-ended, or subjective in nature. \n\nIf you ever need to suggest data to the user, you should only provide recommendations that are directly accessible from Wikidata. Do not ask the user if they would like to proceed with generating the corresponding query unless absolutely necessary.\n\nWhen you are ready to start building a query, respond with 'BUILD QUERY'. The system will walk you through a guided workflow to get the necessary entity and property IDs from WikiData.\n\nCurrent date: Mon Jun 10 2024."
  },
  {
    "chatId": 0,
    "name": "user",
    "content": "Can you tell me about interesting movies?",
    "role": "user"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "I can help you create a SPARQL query to find interesting movies from Wikidata. Could you specify what makes a movie interesting for you? For example, are you interested in movies by a certain director, within a specific genre, or those that have won specific awards?"
  },
  {
    "chatId": 0,
    "name": "user",
    "content": "Between 2022 and 2024, which movies won the Academy Award for Best Picture? Also tell me who was the movie director, and when it won the award.",
    "role": "user"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "BUILD QUERY"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "Your goal is to find the necessary entity and property IDs to construct a SPARQL query that answers the user's question. Do not respond with a trailing period. Do not assume you already know the correct entity and property IDs; you should search for them. Make sure to filter the IDs for the ones that are most relevant to the question. Respond in one of these ways:\n- To fuzzy search for an entity, start the response with 'ENTITY SEARCH:', followed by an entity name you want to search for. The system will respond with possible entity resolutions in Wikidata. \n- To get all the properties for an entity, start the response with 'PROPERTIES SEARCH:', followed by the ID of the entity. The user will respond with all the properties associated with that entity.\n- To find what entities are connected to the original entity via a property, start the response with 'ENTITY PROPERTY SEARCH:', followed by the entity ID then the property ID. Ex: 'ENTITY PROPERTY SEARCH: Q123 P456'\n- Respond with 'STOP' if and only if you have searched for and successfully identified all necessary IDs from Wikidata to construct the query.",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "ENTITY SEARCH: Academy Award for Best Picture"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: Q102427, label: Academy Award for Best Picture, description: annual award from the Academy of Motion Picture Arts and Sciences\nID: Q14943591, label: Academy Award for Best Picture (1980s), description: undefined\nID: Q14943588, label: Academy Award for Best Picture (1950s), description: undefined\nID: Q14943585, label: Academy Award for Best Picture (1930s), description: undefined\nID: Q14943586, label: Academy Award for Best Picture (1940s), description: undefined",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "PROPERTIES SEARCH: Q102427"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: P1346, label: winner, description: winner of a competition or similar event, not to be used for awards (instead use \"award received\" (P166) on awardee's item, possibly qualified with \"for work\" (P1686)) or for wars or battles\nID: P2910, label: icon, description: pictogram suitable to represent the item. For logos of a subject, use \"logo image\" (P154); for favicons, use \"small logo or icon\" (P8972)\nID: P1417, label: Encyclopædia Britannica Online ID, description: identifier for an article in the online version of Encyclopædia Britannica\nID: P8115, label: eligible recipient, description: party that is eligible to receive something, like an award, grant or prize\nID: P12086, label: WikiKids ID, description: identifier of the article on WikiKids\nID: P31, label: instance of, description: that class of which this subject is a particular example and member; different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain (and an instance of volcanic landform)\nID: P6262, label: Fandom article ID, description: identifier of an article on Fandom (Wikia). Format: subdomain:Page_title (language-code.subdomain:Page_title for non-English wikis)\nID: P17, label: country, description: sovereign state that this item is in (not to be used for human beings)\nID: P2257, label: event interval, description: standard nominal interval between scheduled or regularly recurring events. Include unit of time, e.g. \"year\" (Q577). 1/(event frequency). time period of periodically occurring event\nID: P1424, label: topic's main template, description: the main template relating to a topic\nID: P2517, label: category for recipients of this award, description: link to Wikimedia category for recipients of this award\nID: P154, label: logo image, description: graphic mark or emblem commonly used by commercial enterprises, organizations and products\nID: P8408, label: KBpedia ID, description: identifier for the KBpedia knowledge graph, which provides consistent mappings across seven large-scale public knowledge bases including Wikidata, and is used to promote data interoperability and extraction of training sets for machine learning\nID: P1705, label: native label, description: label for the items in their official language (P37) or their original language (P364)\nID: P373, label: Commons category, description: name of the Wikimedia Commons category containing files related to this item (without the prefix \"Category:\")\nID: P910, label: topic's main category, description: main Wikimedia category\nID: P646, label: Freebase ID, description: identifier for a page in the Freebase database. Format: \"/m/0\" followed by 2 to 7 characters. For IDs starting with \"/g/\", use Google Knowledge Graph ID (P2671)\nID: P571, label: inception, description: time when an entity begins to exist; for date of official opening use P1619\nID: P856, label: official website, description: URL of the official page of an item (current or former). Usage: If a listed URL no longer points to the official website, do not remove it, but see the \"Hijacked or dead websites\" section of the Talk page\nID: P1027, label: conferred by, description: person or organization who grants an award, certification, grant, or role",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "ENTITY SEARCH: Academy Award winner"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: Q976472, label: Sings Days of Wine and Roses, Moon River and Other Academy Award Winners, description: 1964 studio album by Frank Sinatra",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "ENTITY SEARCH: Academy Awards"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: Q19020, label: Academy Awards, description: annual awards for cinematic achievements\nID: Q16913666, label: Academy Awards ceremony, description: annual event at which Academy Awards are presented\nID: Q83532676, label: Academy awards, description: scientific article published on 01 February 1968\nID: Q73105727, label: Academy Awards Database, description: database about Academy Award winners and nominées\nID: Q51954858, label: The animation Showcase - Best Of 2017, description: Best animated Short films, Oscars predictive screening for the 90th Academy Awards Ceremony.",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "PROPERTIES SEARCH: Q19020"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: P1296, label: Gran Enciclopèdia Catalana ID (former scheme), description: identifier for an item in the Gran Enciclopèdia Catalana. Replaced with \"Gran Enciclopèdia Catalana ID (P12385)\".\nID: P1368, label: National Library of Latvia ID, description: identifier assigned by the National Library of Latvia\nID: P1417, label: Encyclopædia Britannica Online ID, description: identifier for an article in the online version of Encyclopædia Britannica\nID: P345, label: IMDb ID, description: identifier for the IMDb [with prefix 'tt', 'nm', 'co', 'ev', 'ch' or 'ni']\nID: P2013, label: Facebook username, description: identifier for an official (preferably) Facebook person, product or organization page (everything that follows URL part 'https://www.facebook.com/')\nID: P2347, label: YSO ID, description: identifier for a concept in the General Finnish Ontology YSO\nID: P373, label: Commons category, description: name of the Wikimedia Commons category containing files related to this item (without the prefix \"Category:\")\nID: P2003, label: Instagram username, description: item's username on Instagram\nID: P527, label: has part(s), description: part of this subject; inverse property of \"part of\" (P361). See also \"has parts of the class\" (P2670).\nID: P279, label: subclass of, description: this item is a subclass (subset) of that item; all instances of this item are instances of that item; different from P31 (instance of), e.g.: K2 is an instance of mountain; volcano is a subclass of mountain (and an instance of volcanic landform)\nID: P1343, label: described by source, description: work where this item is described\nID: P910, label: topic's main category, description: main Wikimedia category\nID: P691, label: NL CR AUT ID, description: identifier in the Czech National Authority Database of National Library of the Czech Republic (NL CR)\nID: P269, label: IdRef ID, description: identifier for authority control in the French collaborative library catalog (see also P1025). Format: 8 digits followed by a digit or \"X\"\nID: P935, label: Commons gallery, description: name of the Wikimedia Commons gallery page(s) related to this item (is suitable to allow multiple links to more gallery pages)\nID: P646, label: Freebase ID, description: identifier for a page in the Freebase database. Format: \"/m/0\" followed by 2 to 7 characters. For IDs starting with \"/g/\", use Google Knowledge Graph ID (P2671)\nID: P571, label: inception, description: time when an entity begins to exist; for date of official opening use P1619\nID: P2163, label: FAST ID, description: authority control identifier in WorldCat's “FAST Linked Data” authority file\nID: P1889, label: different from, description: item that is different from another item, with which it may be confused\nID: P1407, label: MusicBrainz series ID, description: identifier for a series per the MusicBrainz open music encyclopedia\nID: P1424, label: topic's main template, description: the main template relating to a topic\nID: P2397, label: YouTube channel ID, description: ID of the YouTube channel of a person or organisation (not to be confused with the name of the channel) The ID can also be used for music.youtube.com IDs\nID: P2002, label: X username, description: this item's username on X (formerly Twitter); do not include the “@” symbol\nID: P2517, label: category for recipients of this award, description: link to Wikimedia category for recipients of this award\nID: P268, label: Bibliothèque nationale de France ID, description: identifier for the subject issued by BNF (Bibliothèque nationale de France). Format: 8 digits followed by a check-digit or letter, do not include the initial 'cb'.\nID: P856, label: official website, description: URL of the official page of an item (current or former). Usage: If a listed URL no longer points to the official website, do not remove it, but see the \"Hijacked or dead websites\" section of the Talk page\nID: P1027, label: conferred by, description: person or organization who grants an award, certification, grant, or role\nID: P349, label: NDL Authority ID, description: identifier for authority control per the National Diet Library of Japan\nID: P1225, label: U.S. National Archives Identifier, description: identifier for the United States National Archives and Records Administration's online catalog\nID: P1705, label: native label, description: label for the items in their official language (P37) or their original language (P364)\nID: P31, label: instance of, description: that class of which this subject is a particular example and member; different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain (and an instance of volcanic landform)\nID: P159, label: headquarters location, description: city or town, where an organization's headquarters is or has been situated. Use P276 qualifier for specific building\nID: P244, label: Library of Congress authority ID, description: Library of Congress name authority (persons, families, corporate bodies, events, places, works and expressions) and subject authority identifier [Format: 1-2 specific letters followed by 8-10 digits (see regex). For manifestations, use P1144]\nID: P17, label: country, description: sovereign state that this item is in (not to be used for human beings)\nID: P227, label: GND ID, description: identifier from an international authority file of names, subjects, and organizations (please don't use type n = name, disambiguation) - Deutsche Nationalbibliothek\nID: P4013, label: Giphy username, description: this item's username on Giphy\nID: P12384, label: Letterboxd user ID, description: identifier for a user on Letterboxd\nID: P2910, label: icon, description: pictogram suitable to represent the item. For logos of a subject, use \"logo image\" (P154); for favicons, use \"small logo or icon\" (P8972)\nID: P9100, label: GitHub topic, description: GitHub topic for a repository or subject\nID: P12399, label: TheTVDB award ID, description: identifier for an award on the website TheTVDB.com\nID: P9629, label: Armeniapedia ID, description: identifier for a topic in the online encyclopedia Armeniapedia\nID: P6058, label: Larousse ID, description: identifier for a subject on the 'Encyclopédie Larousse'\nID: P6181, label: Disney A to Z ID, description: ID of article in online version of Disney A to Z\nID: P4342, label: Store norske leksikon ID, description: identifier of an article in the online encyclopedia snl.no\nID: P6449, label: Douban site name, description: domain name of Douban site written in Latin alphabet\nID: P6385, label: Krugosvet article, description: link to article of Russian-language online encyclopedia\nID: P10234, label: Der Spiegel topic ID, description: identifier for topics in the German news portal \"Der Spiegel\"\nID: P6760, label: Know Your Meme ID, description: identifier for a Know Your Meme article\nID: P10565, label: Encyclopedia of China (Third Edition) ID, description: identifier for an article in the online version of Encyclopedia of China (Third Edition)\nID: P8189, label: National Library of Israel J9U ID, description: identifier used by the National Library of Israel\nID: P4073, label: Fandom wiki ID, description: identifier of a topic's wiki, in Fandom.com\nID: P2924, label: Great Russian Encyclopedia Online ID (old version), description: identifier for an entry on old.bigenc.ru, the official site of the Great Russian Encyclopedia Online 2014–2017 (current version of bigenc.ru is P11514)\nID: P8309, label: Yle topic ID, description: identifier for topics in Finland's national broadcaster Yle's web services\nID: P4622, label: trophy awarded, description: trophy awarded at the end of a selection process or of a competition, usually to winners or finishers under the form of a cup, a medal, a diploma\nID: P3479, label: Omni topic ID, description: identifier for a topic, used by Omni and Aftonbladet\nID: P9545, label: Encyclopedia of China (Second Edition) ID, description: identifier for an article in the online version of Encyclopedia of China (Second Edition)\nID: P5337, label: Google News topics ID, description: identifier for a subject in the news on Google News\nID: P9084, label: ABC News topic ID, description: identifier of a topic of content on the Australian Broadcasting Corporation website\nID: P7982, label: Hrvatska enciklopedija ID, description: identifier for an article in the Croatian Encyclopedia (Hrvatska enciklopedija)\nID: P10045, label: Vokrug.tv show ID, description: identify for a creative work in Vokrug.tv\nID: P12385, label: Gran Enciclopèdia Catalana ID, description: identifier for an item in the Gran Enciclopèdia Catalana\nID: P5905, label: Comic Vine ID, description: identifier at the Comic Vine database of comic books, fictional characters, people, films and television series/episodes\nID: P8295, label: AustLit ID, description: identifier at AustLit\nID: P8313, label: Den Store Danske ID, description: identifier of an article in the online encyclopedia denstoredanske.lex.dk\nID: P8349, label: Proleksis enciklopedija ID, description: identifier for a topic in Proleksis enciklopedija\nID: P12596, label: museum-digital tag ID, description: numeric identifier for keywords used in the description of cultural heritage objects in Museum-Digital\nID: P10170, label: Channel One Russia show ID, description: identifier of TV program for Channel One Russia\nID: P9318, label: Ávvir topic ID, description: identifier of a topic in the Northern Sámi publication Ávvir\nID: P2581, label: BabelNet ID, description: ID in BabelNet encyclopedic dictionary\nID: P7305, label: Online PWN Encyclopedia ID, description: identifier for an entry in the online release of the Online PWN Encyclopedia\nID: P6219, label: TASS reference, description: background information on historical and current events, locations, biographies of famous people\nID: P8814, label: WordNet 3.1 Synset ID, description: Synset identifier in Princeton’s WordNet Version 3.1\nID: P3569, label: Cultureel Woordenboek ID, description: identifier for a concept in the Dutch Cultureel Woordenboek ('Cultural Dictionary')\nID: P6467, label: Hulu series ID, description: TV series identifier in Hulu\nID: P4515, label: Prisma ID, description: identifier for a film (movie) or person, in prisma.de\nID: P6200, label: BBC News topic ID, description: identifier for a topic on the BBC News website\nID: P7775, label: RationalWiki ID, description: identifier for an item at RationalWiki\nID: P3221, label: New York Times topic ID, description: identifier for a topic, at the New York Times' website\nID: P3417, label: Quora topic ID, description: identifier for a topic on Quora (English language version)\nID: P3509, label: Dagens Nyheter topic ID, description: identifier for a topic, used by the Swedish daily newspaper Dagens Nyheter\nID: P2888, label: exact match, description: URL used to link two items or properties, indicating a high degree of confidence that the concepts can be used interchangeably\nID: P5008, label: on focus list of Wikimedia project, description: property to indicate that an item is of particular interest for a Wikimedia project. This property does not add notability. Items should not be created with this property if they are not notable for Wikidata. See also P6104, P972, P2354.\nID: P5019, label: Brockhaus Enzyklopädie online ID, description: identifier for an article in the online version of Brockhaus Enzyklopädie\nID: P8408, label: KBpedia ID, description: identifier for the KBpedia knowledge graph, which provides consistent mappings across seven large-scale public knowledge bases including Wikidata, and is used to promote data interoperability and extraction of training sets for machine learning\nID: P11137, label: Reddit topic ID, description: identifier of a topic on Reddit\nID: P3222, label: NE.se ID, description: ID of article on the Swedish Nationalencyklopedin (NE.se) site\nID: P11408, label: Pixiv Encyclopedia ID, description: identifier for an article on Pixiv Encyclopedia\nID: P10916, label: Süddeutsche Zeitung topic ID, description: identifier for a topic at the Süddeutsche Zeitung newspaper website\nID: P5829, label: Television Academy Foundation show ID, description: identifier for a television show discussed on the Television Academy Foundation's The Interviews website\nID: P11196, label: Baidu Tieba name, description: name of a specific topic driven forum in Baidu Tieba\nID: P8687, label: social media followers, description: number of subscribers on a particular social media website (use as main statement only; see P3744 instead for qualifier). Qualify with \"point in time\" and property for account. For Twitter, use numeric id.\nID: P3553, label: Zhihu topic ID, description: numeric id of topics (tags) of questions on Zhihu, a Chinese question-and-answer website\nID: P3847, label: Open Library subject ID, description: identifier for a topic in the Open Library database\nID: P7502, label: Golden ID, description: ID page in Golden knowledge base\nID: P6081, label: RIA Novosti reference, description: background information on historical and current events, biographies of famous people",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "ENTITY SEARCH: director"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "ID: Q2526255, label: film director, description: person who directs a film\nID: Q3455803, label: director, description: director of a creative work\nID: Q3387717, label: theatrical director, description: person overseeing the mounting of a theatre production\nID: Q1162163, label: director, description: person who leads a particular area of a company or organization\nID: Q2824523, label: board member, description: position in an organization",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "STOP"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "You are an expert at generating SPARQL queries for the Wikidata Knowledge Graph from natural language. \nEntity IDs are prepended with 'wd' and property IDs are prepended with 'wdt'. \nYour task is to convert the natural language instruction into a SPARQL query.\nThe following are four examples in which I am showcasing a natural language instruction (NLI) and the converted SPARQL Query. \n  NLI: Who are creators of Apple and what are their birthdates?\n  SPARQL Query:\n    SELECT ?founder ?founderLabel ?birthdate\n      WHERE {\n        wd:Q312 wdt:P112 ?founder.   # Q312 represents Apple and P112 represents founder\n        ?founder wdt:P569 ?birthdate. # P569 represents date of birth\n        \n        SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n    }\n  NLI: Who are the current heads of state for all countries in the world? \n  SPARQL Query: \n    SELECT ?country ?countryLabel ?headOfState ?headOfStateLabel \n      WHERE { \n        ?country wdt:P31 wd:Q6256;     # Instance of: country \n        p:P35 ?statement.    # has head of government statement \n        ?statement ps:P35 ?headOfState;   # head of government property \n        pq:P580 ?startDate.   # start date of the term \n        FILTER NOT EXISTS { ?statement pq:P582 ?endDate }  # Ensure current head of state \n        SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } \n      } \n      ORDER BY ?countryLabel \n  NLI: What are the top five tallest mountains in the world and their respective heights? \n  SPARQL Query: \n    SELECT ?mountain ?mountainLabel ?height \n      WHERE { \n        ?mountain wdt:P31 wd:Q8502;         # Instance of: mountain \n        wdt:P2044 ?height.       # Height property \n        FILTER (?height >= 8000)           # Minimum height of 8000 meters \n        SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } \n      } \n    ORDER BY DESC(?height) \n    LIMIT 5 \n  NLI: Which symphonies were composed by Ludwig van Beethoven? \n  SPARQL Query: \n    SELECT ?composition (SAMPLE(?compositionLabel) as ?compositionLabel) \n      WHERE { \n        ?composition wdt:P31 wd:Q105543609;         # Instance of: Beethoven's symphonies \n        wdt:P86 wd:Q255;               # Composer: Ludwig van Beethoven \n        rdfs:label ?compositionLabel. \n        FILTER(CONTAINS(LCASE(?compositionLabel), \"symphony\")) \n        SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } \n      }  \n    GROUP BY ?composition \n  Start the SPARQL query with ```sparql and end the query with ```. After you generate a SPARQL query, you briefly explain, as concisely as possible, to the user why the query addresses their original question. Keep your explanation as short as possible and only further explain when asked. Now construct a query that answers the user's question: Between 2022 and 2024, which movies won the Academy Award for Best Picture? Also tell me who was the movie director, and when it won the award.",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "```sparql\nSELECT ?movie ?movieLabel ?director ?directorLabel ?awardDate\nWHERE {\n  ?movie p:P166 ?statement. # P166 is the property for 'award received'\n  ?statement ps:P166 wd:Q102427; # Q102427 represents 'Academy Award for Best Picture'\n            pq:P585 ?awardDate. # P585 is the property for 'point in time'\n  ?movie wdt:P57 ?director. # P57 is the property for 'director'\n  \n  FILTER(YEAR(?awardDate) >= 2022 && YEAR(?awardDate) <= 2024)\n  \n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n}\nORDER BY ?awardDate\n```\nThis query fetches movies that won the Academy Award for Best Picture between 2022 and 2024, including each movie's director and the date when the award was won. It filters the awards by the given years and orders the results by the date when the award was received."
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "Respond with a brief name for this query. If you generated this query, it can just be the question that the user asked.\n      SELECT ?movie ?movieLabel ?director ?directorLabel ?awardDate\nWHERE {\n  ?movie p:P166 ?statement. # P166 is the property for 'award received'\n  ?statement ps:P166 wd:Q102427; # Q102427 represents 'Academy Award for Best Picture'\n            pq:P585 ?awardDate. # P585 is the property for 'point in time'\n  ?movie wdt:P57 ?director. # P57 is the property for 'director'\n  \n  FILTER(YEAR(?awardDate) >= 2022 && YEAR(?awardDate) <= 2024)\n  \n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n}\nORDER BY ?awardDate",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "Academy Award for Best Picture winners (2022-2024) with directors and award dates"
  },
  {
    "chatId": 0,
    "name": "system",
    "content": "These are the JSON results from the last query. Respond with a brief summary of the results.\n      {\n  \"head\": {\n    \"vars\": [\n      \"movie\",\n      \"movieLabel\",\n      \"director\",\n      \"directorLabel\",\n      \"awardDate\"\n    ]\n  },\n  \"results\": {\n    \"bindings\": [\n      {\n        \"movie\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q104686893\"\n        },\n        \"director\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q7506788\"\n        },\n        \"movieLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"CODA\"\n        },\n        \"directorLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Siân Héder\"\n        },\n        \"awardDate\": {\n          \"datatype\": \"http://www.w3.org/2001/XMLSchema#dateTime\",\n          \"type\": \"literal\",\n          \"value\": \"2022-03-27T00:00:00Z\"\n        }\n      },\n      {\n        \"movie\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q83808444\"\n        },\n        \"director\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q28746830\"\n        },\n        \"movieLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Everything Everywhere All at Once\"\n        },\n        \"directorLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Dan Kwan\"\n        },\n        \"awardDate\": {\n          \"datatype\": \"http://www.w3.org/2001/XMLSchema#dateTime\",\n          \"type\": \"literal\",\n          \"value\": \"2023-01-01T00:00:00Z\"\n        }\n      },\n      {\n        \"movie\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q83808444\"\n        },\n        \"director\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q28746848\"\n        },\n        \"movieLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Everything Everywhere All at Once\"\n        },\n        \"directorLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Daniel Scheinert\"\n        },\n        \"awardDate\": {\n          \"datatype\": \"http://www.w3.org/2001/XMLSchema#dateTime\",\n          \"type\": \"literal\",\n          \"value\": \"2023-01-01T00:00:00Z\"\n        }\n      },\n      {\n        \"movie\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q108839994\"\n        },\n        \"director\": {\n          \"type\": \"uri\",\n          \"value\": \"http://www.wikidata.org/entity/Q25191\"\n        },\n        \"movieLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Oppenheimer\"\n        },\n        \"directorLabel\": {\n          \"xml:lang\": \"en\",\n          \"type\": \"literal\",\n          \"value\": \"Christopher Nolan\"\n        },\n        \"awardDate\": {\n          \"datatype\": \"http://www.w3.org/2001/XMLSchema#dateTime\",\n          \"type\": \"literal\",\n          \"value\": \"2024-03-10T00:00:00Z\"\n        }\n      }\n    ]\n  }\n}",
    "role": "system"
  },
  {
    "chatId": 0,
    "name": "gpt-4-turbo-preview",
    "role": "assistant",
    "content": "The Academy Award for Best Picture between 2022 and 2024 was won by:\n\n1. \"CODA\" directed by Siân Héder, which won the award on March 27, 2022.\n2. \"Everything Everywhere All at Once\" with directors Dan Kwan and Daniel Scheinert, both awarded on January 1, 2023. It's listed twice because there are two directors.\n3. \"Oppenheimer\" directed by Christopher Nolan, which won the award on March 10, 2024."
  }
]