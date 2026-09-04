import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Note from './models/Note.js';

const SAMPLE_NOTES = [
  { title: '12th Grade Chemistry Board Exam Study Notes', category: 'iit-jee', author: 'Parth2814', views: 773, fileType: 'PDF', description: 'Comprehensive chemistry notes covering the full board exam syllabus with solved examples.' },
  { title: 'Thermodynamics Study Notes for JEE Main', category: 'iit-jee', author: 'Parth2814', views: 386, fileType: 'PDF', description: 'Concept-wise thermodynamics notes with formula sheets for quick revision.' },
  { title: 'Data Structures and Algorithms', category: 'programming', author: 'kabir_07', views: 1296, fileType: 'PDF', description: 'Detailed DSA notes covering arrays, trees, graphs, and dynamic programming.' },
  { title: 'HTML Handwritten Notes for Beginners', category: 'programming', author: 'saipriya', views: 867, fileType: 'PDF', description: 'Beginner friendly handwritten notes explaining core HTML tags and structure.' },
  { title: 'Khan Sir Biology Book (Hindi)', category: 'education', author: 'narendra2008', views: 22542, fileType: 'PDF', description: 'Popular biology reference notes in Hindi for competitive exam aspirants.' },
  { title: 'Class 6 NCERT History PDF Book', category: 'education', author: 'Mrnice', views: 3247, fileType: 'PDF', description: 'NCERT-based history notes for class 6 students in an easy format.' },
  { title: 'Java Viva Questions and Answers', category: 'computer-science', author: 'Sara_7', views: 438, fileType: 'DOCX', description: 'Core and advanced Java interview / viva preparation questions with answers.' },
  { title: 'Data and Data Preprocessing', category: 'computer-science', author: 'Parth2814', views: 302, fileType: 'PPT', description: 'Machine learning data preprocessing techniques explained with examples.' },
  { title: 'Class 10 Physics Notes: Light (Refraction & Optics)', category: 'science', author: 'va877396', views: 553, fileType: 'PDF', description: 'ICSE class 10 physics notes on refraction and optics with diagrams.' },
  { title: 'Class 12th Ionic Equilibrium', category: 'science', author: 'adityaghule819', views: 366, fileType: 'PDF', description: 'Chemistry notes on ionic equilibrium for class 12 board preparation.' },
  { title: 'Khan Sir Physics Book PDF', category: 'competitive-exams', author: 'Mrnice', views: 14880, fileType: 'PDF', description: 'Widely used physics reference notes for government exam preparation.' },
  { title: 'Reasoning by Aditya Ranjan Sir', category: 'competitive-exams', author: 'Mrnice', views: 3123, fileType: 'PDF', description: 'Logical reasoning notes for RRB, SSC and other competitive exams.' },
  { title: 'Operating System Unit 4', category: 'engineering', author: 'gousia1604', views: 374, fileType: 'PDF', description: 'Engineering notes covering memory management and process scheduling.' },
  { title: 'The Basics of Robotics', category: 'engineering', author: 'narendra2008', views: 344, fileType: 'PPT', description: 'Introductory robotics notes covering sensors, actuators and control.' },
  { title: 'Industrial Psychology', category: 'psychology', author: 'mrshiveshkumar123', views: 269, fileType: 'PDF', description: 'Notes on workplace behaviour, motivation, and organizational psychology.' },
  { title: 'Guide to Increase Productivity for Students', category: 'psychology', author: 'HAshop', views: 238, fileType: 'PDF', description: 'Practical tips and psychology-backed strategies for student productivity.' },
  { title: 'Bharat Ka Itihas', category: 'history', author: 'narendra2008', views: 640, fileType: 'PDF', description: 'Complete Indian history notes in Hindi for competitive exams.' },
  { title: 'Application of Biotechnology (NEET)', category: 'neet', author: 'Mrnice', views: 491, fileType: 'PDF', description: 'Biotechnology application notes tailored for NEET biology preparation.' },
];

async function seed() {
  await connectDB();
  await Note.deleteMany({});
  await Note.insertMany(SAMPLE_NOTES);
  console.log(`Seeded ${SAMPLE_NOTES.length} notes.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
