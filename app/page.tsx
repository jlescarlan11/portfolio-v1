import NavigationBar from './components/NavigationBar';

export default function Home() {
  return (
    <>
      <NavigationBar />
      
      {/* Hero Section */}
      <section id="about" className="
        min-h-screen
        flex items-center justify-center
        px-6 md:px-12
        bg-black
      ">
        <div className="max-w-4xl">
          <h1 className="
            text-5xl md:text-7xl
            font-light
            tracking-tighter
            leading-none
            mb-8
            text-white
          ">
            Your Name
          </h1>
          <p className="
            text-lg md:text-xl
            text-gray-400
            max-w-2xl
            tracking-wide
          ">
            Designer. Developer. Creator.
          </p>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="
        min-h-screen
        flex items-center justify-center
        px-6 md:px-12
        bg-black
        border-t border-gray-900
      ">
        <div className="max-w-4xl">
          <h2 className="
            text-4xl md:text-6xl
            font-light
            tracking-tighter
            leading-none
            mb-8
            text-white
          ">
            Selected Work
          </h2>
          <p className="
            text-base md:text-lg
            text-gray-400
            max-w-2xl
          ">
            Portfolio content goes here
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="
        min-h-screen
        flex items-center justify-center
        px-6 md:px-12
        bg-black
        border-t border-gray-900
      ">
        <div className="max-w-4xl">
          <h2 className="
            text-4xl md:text-6xl
            font-light
            tracking-tighter
            leading-none
            mb-8
            text-white
          ">
            Get In Touch
          </h2>
          <p className="
            text-base md:text-lg
            text-gray-400
            max-w-2xl
          ">
            Contact information goes here
          </p>
        </div>
      </section>
    </>
  );
}
