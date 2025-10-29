import { ArrowLeft, Mail, Github, Twitter, Coffee, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import profilePic from '/myimg.jpeg';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A202C]">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6">
        <div className="bg-white/0 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 ease-in-out">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-[#1A202C] hover:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
              <h1 className="text-xl font-semibold">About</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card className="animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <img
                    src={profilePic}
                    alt="Chaitanya Patnana"
                    className="w-30 h-29 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2">Chaitanya Patnana</h2>
                <p className="mb-6">Writer, Developer & Creative Thinker</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">More about me</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => window.open('mailto:chaitanyapatnana14@gmail.com')}><Mail className="h-4 w-4 mr-2" /> Mail here</Button>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => window.open('https://github.com/Chaitanyasyam', '_blank')}><Github className="h-4 w-4 mr-2" /> Check this out</Button>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => window.open('https://www.linkedin.com/in/chaitanya--patnana/')}><Linkedin className="h-4 w-4 mr-2" /> Follow me</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">Hello, I'm Chaitanya Patnana</h2>

                <div className="prose prose-lg max-w-none space-y-6">
                  <p>
                    Welcome to my corner of the internet! I'm a passionate writer and developer who believes 
                    in the power of words to inspire, educate, and connect people from all walks of life.
                  </p>

                  <p>
                    This blog is where I share my thoughts on technology, design, life experiences, and 
                    everything in between. I believe in keeping things simple, authentic, and meaningful.
                  </p>

                  <p>
                    When I'm not writing or coding, you can find me exploring new places, reading books, 
                    or experimenting with new recipes in the kitchen. I'm always curious about the world 
                    around me and love learning new things.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What I Write About */}
            <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">What I Write About</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Technology</h4>
                    <p className="text-blue-700 text-sm">
                      Web development, design trends, and the latest in tech innovation.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Design</h4>
                    <p className="text-purple-700 text-sm">
                      UI/UX principles, minimalism, and creating beautiful digital experiences.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Life & Growth</h4>
                    <p className="text-green-700 text-sm">
                      Personal development, productivity tips, and life lessons learned.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Creative Process</h4>
                    <p className="text-orange-700 text-sm">
                      Behind-the-scenes looks at my work and creative inspiration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Get in Touch */}
            <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
                <p className="mb-6">
                  I love hearing from readers! Whether you have questions, feedback, or just want to say hello, 
                  feel free to reach out. I try to respond to all messages within a few days.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <Coffee className="h-4 w-4 mr-2" />
                    Buy Me Coffee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;