import Image from "next/image";

const capacityTests = [
  {
    title: "Test de Réflexes",
    description: "Mesurez votre temps de réaction à des stimuli visuels",
    image: "/zap.svg",
    link: "/tests/reflex"
  },
  {
    title: "Mémoire des Chiffres",
    description: "Testez votre capacité à mémoriser des séquences de chiffres",
    image: "/number.svg",
    link: "/tests/numberMemory"
  },
  {
    title: "Mémoire Visuelle",
    description: "Évaluez votre mémoire visuelle",
    image: "/visual.svg",
    link: "/tests/visualMemory"
  },
  {
    title: "Test de Concentration",
    description: "Mesurez votre niveau de concentration et d'attention",
    image: "/focus.svg",
    link: "/tests/focus"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Tests de Capacités Humaines</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capacityTests.map((test, index) => (
            <a
              key={index}
              href={test.link}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Image
                    src={test.image}
                    alt=""
                    width={24}
                    height={24}
                    className="text-blue-600"
                  />
                </div>
                <h2 className="ml-4 text-xl font-semibold">{test.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{test.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
