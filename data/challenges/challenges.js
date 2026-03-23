const CHALLENGES_DATA = {
  level: "A1",
  challenges: {
    traduction: [
      { id: "trad_1", phrase: "The dog is big.", solution: "Le chien est grand." },
      { id: "trad_2", phrase: "I have a cat.", solution: "J'ai un chat." },
      { id: "trad_3", phrase: "She drinks water.", solution: "Elle boit de l'eau." }
    ],
    gap: [
      { id: "gap_1", phrase: "The cat ___ on the table.", propositions: ["is", "his", "at"], solution: "is" },
      { id: "gap_2", phrase: "I ___ a student.", propositions: ["am", "is", "are"], solution: "am" },
      { id: "gap_3", phrase: "She ___ to school every day.", propositions: ["go", "goes", "gone"], solution: "goes" }
    ],
    qcm: [
      { id: "qcm_1", phrase: "The bird flies in the sky.", choices: ["L'oiseau vole dans le ciel.", "Le chat dort sur le lit.", "L'oiseau mange du pain.", "Le chien court dans le parc."], solution: "L'oiseau vole dans le ciel." },
      { id: "qcm_2", phrase: "I eat an apple.", choices: ["Je mange une orange.", "Je bois du lait.", "Je mange une pomme.", "Il mange une banane."], solution: "Je mange une pomme." },
      { id: "qcm_3", phrase: "He reads a book.", choices: ["Il écrit une lettre.", "Il lit un livre.", "Elle lit un journal.", "Il regarde la télé."], solution: "Il lit un livre." }
    ]
  }
}