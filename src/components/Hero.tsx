
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Calendar, GraduationCap, Trophy, BookOpen, MapPin, Phone, Mail, Eye, Target } from 'lucide-react';

const Hero = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [showVisionMission, setShowVisionMission] = useState(false);
  const [showProgramOutcomes, setShowProgramOutcomes] = useState(false);

  const sections = {
    events: {
      title: 'Events',
      icon: Calendar,
      data: [
        { title: 'Machine Learning Workshop', date: '2025-07-15', description: 'Hands-on workshop covering ML fundamentals' },
        { title: 'AI Conference 2025', date: '2025-07-20', description: 'Annual conference on artificial intelligence' },
        { title: 'Data Science Symposium', date: '2025-07-25', description: 'Industry experts sharing insights' }
      ]
    },
    faculty: {
      title: 'Faculty',
      icon: GraduationCap,
      data: [
        { name: 'Dr. Sarah Wilson', department: 'AI & Data Science', specialization: 'Machine Learning', email: 'sarah@vignanits.ac.in' },
        { name: 'Prof. David Brown', department: 'AI & Data Science', specialization: 'Deep Learning', email: 'david@vignanits.ac.in' },
        { name: 'Dr. Emily Davis', department: 'AI & Data Science', specialization: 'Data Analytics', email: 'emily@vignanits.ac.in' }
      ]
    },
    placements: {
      title: 'Placements',
      icon: Trophy,
      data: [
        { student: 'Alice Cooper', company: 'Google', package: '25 LPA', year: '2024' },
        { student: 'Bob Martin', company: 'Microsoft', package: '22 LPA', year: '2024' },
        { student: 'Carol White', company: 'Amazon', package: '28 LPA', year: '2024' },
        { student: 'David Lee', company: 'Apple', package: '30 LPA', year: '2024' }
      ]
    },
    research: {
      title: 'Research',
      icon: BookOpen,
      data: [
        { title: 'Machine Learning in Healthcare', authors: 'Dr. Sarah Wilson, Dr. Emily Davis', status: 'Published' },
        { title: 'Deep Learning for Image Recognition', authors: 'Prof. David Brown', status: 'Under Review' },
        { title: 'AI Ethics and Society', authors: 'Dr. Sarah Wilson', status: 'In Progress' }
      ]
    }
  };

  const programOutcomes = [
    { id: 'PO1', title: 'Engineering Knowledge', description: 'Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.' },
    { id: 'PO2', title: 'Problem Analysis', description: 'Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.' },
    { id: 'PO3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.' },
    { id: 'PO4', title: 'Conduct Investigations of Complex Problems', description: 'Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.' },
    { id: 'PO5', title: 'Modern Tool Usage', description: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.' },
    { id: 'PO6', title: 'The Engineer and Society', description: 'Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.' },
    { id: 'PO7', title: 'Environment and Sustainability', description: 'Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.' },
    { id: 'PO8', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.' },
    { id: 'PO9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.' },
    { id: 'PO10', title: 'Communication', description: 'Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.' },
    { id: 'PO11', title: 'Project Management and Finance', description: 'Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.' },
    { id: 'PO12', title: 'Life-long Learning', description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.' }
  ];

  const openSection = (sectionKey) => {
    setSelectedSection(sectionKey);
  };

  const closeModal = () => {
    setSelectedSection(null);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Department of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Artificial Intelligence & Data Science
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Shaping the future through artificial intelligence and data science innovation. 
            Join us in exploring the frontiers of technology and creating tomorrow's solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => setShowVisionMission(true)}
            >
              <Eye className="w-5 h-5 mr-2" />
              Vision & Mission
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              onClick={() => setShowProgramOutcomes(true)}
            >
              <Target className="w-5 h-5 mr-2" />
              Program Outcomes
            </Button>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(sections).map(([key, section]) => {
            const IconComponent = section.icon;
            return (
              <Card 
                key={key}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                onClick={() => openSection(key)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    {key === 'events' && 'Upcoming workshops, seminars, and conferences'}
                    {key === 'faculty' && 'Meet our experienced faculty members'}
                    {key === 'placements' && 'Outstanding placement records and achievements'}
                    {key === 'research' && 'Cutting-edge research and publications'}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Get In Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
              <p className="text-gray-600 text-center">
                Vignan's Institute of Information Technology<br />
                Deshmukhi,Hyderabad, India
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
              <p className="text-gray-600">+91 891 282 0000</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">info@vignanits.ac.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Modal */}
      <Dialog open={selectedSection !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              {selectedSection && (
                <>
                  {React.createElement(sections[selectedSection].icon, { className: "w-6 h-6" })}
                  <span>{sections[selectedSection].title}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSection && (
            <div className="space-y-4">
              {selectedSection === 'events' && (
                <div className="grid gap-4">
                  {sections.events.data.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-2">Date: {event.date}</p>
                        <p className="text-gray-700">{event.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {selectedSection === 'faculty' && (
                <div className="grid gap-4">
                  {sections.faculty.data.map((member, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                        <p className="text-gray-600 mb-1">{member.department}</p>
                        <p className="text-gray-600 mb-2">Specialization: {member.specialization}</p>
                        <p className="text-gray-600">{member.email}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {selectedSection === 'placements' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Package</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.placements.data.map((placement, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2">{placement.student}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.company}</td>
                          <td className="border border-gray-200 px-4 py-2 font-semibold text-green-600">{placement.package}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {selectedSection === 'research' && (
                <div className="grid gap-4">
                  {sections.research.data.map((research, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{research.title}</h3>
                        <p className="text-gray-600 mb-2">Authors: {research.authors}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          research.status === 'Published' 
                            ? 'bg-green-100 text-green-800' 
                            : research.status === 'Under Review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {research.status}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vision & Mission Modal */}
      <Dialog open={showVisionMission} onOpenChange={setShowVisionMission}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <Eye className="w-6 h-6" />
              <span>Vision & Mission</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower individuals to acquire advanced knowledge and skills with cutting edge combination in Artificial Intelligence and Data Science with Analytical Visualization Technologies to address the challenges of the society and contribute to the nation building.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">Mission</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Provide strong AI & DS foundations through comprehensive curriculum and hands-on learning experiences</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Create tech-enabled learning environments that foster innovation and critical thinking</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Develop state-of-the-art research labs for advanced AI and Data Science exploration</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Nurture leadership qualities through co-curricular and extra-curricular activities</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Program Outcomes Modal */}
      <Dialog open={showProgramOutcomes} onOpenChange={setShowProgramOutcomes}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <Target className="w-6 h-6" />
              <span>Program Outcomes</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              Our Artificial Intelligence & Data Science program is designed to achieve the following 12 Program Outcomes:
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              {programOutcomes.map((outcome) => (
                <AccordionItem key={outcome.id} value={outcome.id}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-blue-600 mr-2">{outcome.id}:</span>
                    {outcome.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 leading-relaxed pl-4">
                      {outcome.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
