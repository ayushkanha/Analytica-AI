import React from 'react';
import { Users, Target, Eye } from 'lucide-react';
import Grad1 from "/Backgrounds/Grad 1.jpg";
import AyushImage from '../assets/Ayush.jpeg';

const AboutPage = () => {
    const teamMembers = [
        { name: 'Ayush kumar sahu', role: 'Founder, Lead Developer, UI/UX Designer & Backend Developer', imageUrl: AyushImage },

    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#181818] text-white font-sans overflow-y-auto">
            {/* Header */}
            <header 
                className="py-10 text-center text-white"
               
            >
                
                <div className="bg-black/50 py-20">
                    <h1 className="text-5xl font-bold mt-15 mb-4">About Analytica AI</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Empowering data-driven decisions through accessible and intuitive analytics.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Mission and Vision Section */}
                    <section className="mb-16">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Target size={40} className="text-indigo-400" />
                                    <h2 className="text-3xl font-bold">Our Mission</h2>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    At Analytica AI, our mission is to democratize data analysis. We believe that everyone, regardless of their technical expertise, should be able to unlock the power of their data. We are committed to building tools that are not only powerful and accurate but also user-friendly and accessible to all.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Eye size={40} className="text-indigo-400" />
                                    <h2 className="text-3xl font-bold">Our Vision</h2>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    Our vision is to be the leading platform for self-service analytics, where curiosity meets data. We aim to create a future where data literacy is the norm, and every question can be answered with a few clicks. We are constantly innovating to make data interaction more conversational, visual, and impactful.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Our Team Section */}
                    <section>
                        <div className="text-center mb-12">
                            <Users size={40} className="mx-auto text-indigo-400 mb-4" />
                            <h2 className="text-3xl font-bold">Meet the Team</h2>
                            <p className="text-gray-400 mt-2">The minds behind the magic.</p>
                        </div>
                        <div className="flex justify-center">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="bg-[#303030] rounded-lg p-6 w-full max-w-sm text-center shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-2 transition-all duration-300">
                                    <img
                                        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-indigo-500"
                                        src={member.imageUrl}
                                        alt={member.name}
                                    />
                                    <h3 className="text-xl font-semibold">{member.name}</h3>
                                    <p className="text-indigo-400">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#101010] text-center p-6 mt-16">
                <p>&copy; {new Date().getFullYear()} Analytica AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AboutPage;