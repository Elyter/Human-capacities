import Image from "next/image";
import TestCard from "@/components/TestCard";

const capacityTests = [
  {
    title: "Test de Réflexes",
    description: "Mesurez votre temps de réaction à des stimuli visuels",
    image: "/zap.svg",
    link: "/tests/reflex",
    rules: "Attendez que l'écran devienne vert, puis cliquez le plus rapidement possible. Attention à ne pas cliquer trop tôt !"
  },
  {
    title: "Mémoire des Chiffres",
    description: "Testez votre capacité à mémoriser des séquences de chiffres",
    image: "/number.svg",
    link: "/tests/numberMemory",
    rules: "Mémorisez les chiffres qui apparaissent à l'écran. À chaque niveau réussi, vous devrez mémoriser un chiffre supplémentaire."
  },
  {
    title: "Mémoire Visuelle",
    description: "Évaluez votre mémoire visuelle",
    image: "/visual.svg",
    link: "/tests/visualMemory",
    rules: "Des tuiles vont s'illuminer brièvement à l'écran. Reproduisez la séquence pour passer au niveau suivant."
  },
  {
    title: "Mémoire Verbale",
    description: "Testez votre capacité à reconnaître des mots déjà vus",
    image: "/word.svg",
    link: "/tests/verbalMemory",
    rules: "Des mots vont apparaître un par un. Si vous avez déjà vu le mot, cliquez sur 'VU'. Si c'est la première fois, cliquez sur 'NOUVEAU'."
  },
  {
    title: "Test du Chimpanzé",
    description: "Défiez les chimpanzés dans ce test de mémoire de travail",
    image: "/chimp.svg",
    link: "/tests/chimpTest",
    rules: "Les chimpanzés surpassent systématiquement les humains dans ce test. Mémorisez la position des chiffres puis cliquez dessus dans l'ordre croissant."
  },
  {
    title: "Mémoire des Symboles",
    description: "Retrouvez les paires de symboles cachés",
    image: "/cards.svg",
    link: "/tests/symbolMemory",
    rules: "Mémorisez la position des paires de symboles. Retrouvez toutes les paires pour passer au niveau suivant."
  },
  {
    title: "Mémoire de Séquence",
    description: "Reproduisez la séquence dans le bon ordre",
    image: "/sequence.svg",
    link: "/tests/sequenceMemory",
    rules: "Mémorisez la séquence qui s'affiche et reproduisez-la dans le même ordre. À chaque niveau, la séquence s'allonge d'un clic."
  },
  {
    title: "Vitesse de frappe",
    description: "Testez votre vitesse de frappe au clavier",
    image: "/keyboard.svg",
    link: "/tests/typingSpeed",
    rules: "Tapez les mots qui apparaissent à l'écran aussi vite et précisément que possible. Vous avez 60 secondes pour taper le maximum de mots."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Tests de Capacités Humaines</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capacityTests.map((test, index) => (
            <TestCard 
              key={index}
              title={test.title}
              description={test.description}
              image={test.image}
              link={test.link}
              rules={test.rules}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
