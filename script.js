
// Typewriter Effect
const typewriterElement = document.getElementById('typewriter-text');
const phrases = [
    'Full Stack Developer',
    'Mobile App Creator',
    'Problem Solver',
    'Tech Enthusiast',
    'Code Architect'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => {
            isDeleting = true;
            typeWriter();
        }, 2000);
        return;
    }
    
    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeWriter, 500);
        return;
    }
    
    setTimeout(typeWriter, isDeleting ? 50 : 100);
}

typeWriter();

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    html.classList.toggle('dark', savedTheme === 'dark');
} else {
    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle('dark', prefersDark);
}

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

// Navbar Background on Scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('bg-white/90', 'dark:bg-gray-900/90', 'backdrop-blur-md', 'shadow-lg');
    } else {
        navbar.classList.remove('bg-white/90', 'dark:bg-gray-900/90', 'backdrop-blur-md', 'shadow-lg');
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let isMenuOpen = false;

mobileMenuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
    } else {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    }
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-blue-500');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('text-blue-500');
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe timeline items
document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
});

// Skill Bars Animation
const skillBars = document.querySelectorAll('.skill-bar');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skill = entry.target;
            const percentage = skill.dataset.skill;
            setTimeout(() => {
                skill.style.width = percentage + '%';
            }, 200);
            skillObserver.unobserve(skill);
        }
    });
}, observerOptions);

skillBars.forEach(bar => {
    bar.style.width = '0%';
    bar.style.transition = 'width 1.5s ease-out';
    skillObserver.observe(bar);
});

// Interactive Terminal
const codeDisplay = document.getElementById('code-display');
const terminalInput = document.getElementById('terminal-input');

const codeSnippets = {
    skills: `const developer = {
  name: 'Martin von Wysiecki',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  experience: '10+ years',
  passion: 'Building amazing digital experiences'
};`,
    contact: `function getInTouch() {
  return {
    email: 'contact@wysiecki.de',
    github: 'github.com/martinwysiecki',
    linkedin: 'linkedin.com/in/martinwysiecki'
  };
}`,
    projects: `const recentProjects = [
  { name: 'E-Commerce Platform', tech: ['React', 'Node.js'] },
  { name: 'Fitness App', tech: ['Swift', 'Firebase'] },
  { name: 'API Gateway', tech: ['Python', 'Docker'] }
];`
};

let currentCode = '';
let codeIndex = 0;
const initialCode = codeSnippets.skills;

function displayCode(code) {
    currentCode = code;
    codeIndex = 0;
    codeDisplay.textContent = '';
    typeCode();
}

function typeCode() {
    if (codeIndex < currentCode.length) {
        codeDisplay.textContent += currentCode[codeIndex];
        codeIndex++;
        setTimeout(typeCode, 20);
    }
}

displayCode(initialCode);

terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.toLowerCase().trim();
        terminalInput.value = '';
        
        switch(command) {
            case 'help':
                alert('Available commands: skills, projects, contact, clear');
                break;
            case 'skills':
                displayCode(codeSnippets.skills);
                break;
            case 'projects':
                displayCode(codeSnippets.projects);
                break;
            case 'contact':
                displayCode(codeSnippets.contact);
                break;
            case 'clear':
                codeDisplay.textContent = '';
                break;
            default:
                if (command) {
                    alert(`Command not found: ${command}. Type 'help' for available commands.`);
                }
        }
    }
});

// Project Filter
const projectFilters = document.querySelectorAll('.project-filter');
const projectCards = document.querySelectorAll('.project-card');

projectFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Update active filter
        projectFilters.forEach(f => {
            f.classList.remove('bg-blue-500', 'text-white');
            f.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-700');
        });
        filter.classList.add('bg-blue-500', 'text-white');
        filter.classList.remove('hover:bg-gray-200', 'dark:hover:bg-gray-700');
        
        // Filter projects
        const category = filter.dataset.filter;
        projectCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.add('animate-fade-in');
                }, 10);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// 3D Card Flip
projectCards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    let isFlipped = false;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            isFlipped = !isFlipped;
            if (isFlipped) {
                inner.style.transform = 'rotateY(180deg)';
            } else {
                inner.style.transform = 'rotateY(0deg)';
            }
        }
    });
});

// Contact Form
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    // Here you would normally send the form data to a server
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
});

// Floating Animation for Tech Icons
const techIcons = document.querySelectorAll('.tech-icon');
techIcons.forEach((icon, index) => {
    icon.style.animationDelay = `${index * 0.5}s`;
});

// Parallax Effect on Scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.tech-icon');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Performance optimization - Debounce scroll events
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
        // Scroll-based animations here
    });
}, { passive: true });