interface Project {
  name: string;
  description: string;
  url: string;
  backend: string[];
  frontend: string[];
}

function App() {
  const projects: Project[] = [
    {
      name: "Real-time Chat App",
      description: "A real-time chat application with live messaging capabilities. Features user authentication, message persistence, and real-time communication.",
      url: "https://chat.safasfly.dev",
      backend: ["GoLang", "MariaDB", "Docker"],
      frontend: ["React", "TypeScript", "Tailwind CSS"]
    },
    {
      name: "AI Chat App",
      description: "An AI-powered chat application that uses OpenRouter to generate responses. Users can have conversations with the AI in a natural language manner.",
      url: "https://ai.safasfly.dev",
      backend: ["GoLang", "MariaDB", "Docker"],
      frontend: ["React", "TypeScript", "Tailwind CSS"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="text-center py-16 px-8 border-b border-gray-800">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          safasfly.dev
        </h1>
        <p className="text-xl text-gray-400">Developer Portfolio</p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-8">
        <section>
          <h2 className="text-3xl font-bold mb-8 text-gray-100">Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-50">
                  {project.name}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-4">
                  {project.description}
                </p>
                
                {/* Frontend Tech Stack */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Frontend</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.frontend.map((tech, techIndex) => (
                      <span 
                        key={techIndex} 
                        className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Backend Tech Stack */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Backend</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.backend.map((tech, techIndex) => (
                      <span 
                        key={techIndex} 
                        className="bg-green-900/50 text-green-200 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Visit Project 
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
