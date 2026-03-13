// Main JavaScript for homepage

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
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

    // Animate stats counter when in viewport
    const stats = document.querySelectorAll('.stat-number');
    
    function animateStats(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const value = stat.textContent;
                    if (!isNaN(parseFloat(value))) {
                        animateValue(stat, 0, parseFloat(value), 2000);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }

    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                element.textContent = end + (element.textContent.includes('B') ? 'B' : 'K');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.textContent.includes('B') ? 'B' : 'K');
            }
        }, 16);
    }

    const observer = new IntersectionObserver(animateStats, { threshold: 0.5 });
    const impactSection = document.querySelector('.impact-banner');
    if (impactSection) {
        observer.observe(impactSection);
    }

    // Add active class to nav links based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.remove('active');
            }
        });
    });
});