import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });
            const result = await response.json();
            if (!response.ok) {
                console.error('Error inserting data:', result);
                alert('Failed to submit your query. Please try again.');
            } else {
                console.log('Data inserted:', result);
                alert('Thank you for your message! We will get back to you soon.');
                setName('');
                setEmail('');
                setMessage('');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit your query. Please try again.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#181818] text-white font-sans overflow-y-auto">
            {/* Header */}
            <header 
                className="py-10 text-center text-white"
                
            >
                <div className="bg-black/50 py-20">
                    <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        We'd love to hear from you. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-[#303030] p-8 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows="4"
                                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div className="bg-[#303030] p-8 rounded-lg shadow-lg flex items-start gap-6">
                                <Mail size={32} className="text-indigo-400 mt-1" />
                                <div>
                                    <h3 className="text-2xl font-semibold">Email</h3>
                                    <p className="text-gray-300">Reach out to us via email.</p>
                                    <a href="mailto:support@analytica.ai" className="text-indigo-400 hover:underline">
                                        ayushkanha19@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="bg-[#303030] p-8 rounded-lg shadow-lg flex items-start gap-6">
                                <Phone size={32} className="text-indigo-400 mt-1" />
                                <div>
                                    <h3 className="text-2xl font-semibold">Phone</h3>
                                    <p className="text-gray-300">Mon-Fri from 9am to 5pm.</p>
                                    <a href="tel:+1234567890" className="text-indigo-400 hover:underline">
                                        +91-9479280486
                                    </a>
                                </div>
                            </div>
                            <div className="bg-[#303030] p-8 rounded-lg shadow-lg flex items-start gap-6">
                                <MapPin size={32} className="text-indigo-400 mt-1" />
                                <div>
                                    <h3 className="text-2xl font-semibold">Office</h3>
                                    <p className="text-gray-300">Bhilai, Chhattisgarh, India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#101010] text-center p-6 mt-16">
                <p>&copy; {new Date().getFullYear()} Analytica AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ContactPage;