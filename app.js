import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Three.js scene
let scene, camera, renderer, barberPole, controls;

// Create barber pole
function createBarberPole() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x666666,
        shininess: 30,
    });

    // Create stripes texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Draw stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    const stripeWidth = 30;
    ctx.fillStyle = '#d4af37';
    for(let i = 0; i < canvas.height; i += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i + stripeWidth);
        ctx.lineTo(canvas.width, i + stripeWidth * 2);
        ctx.lineTo(0, i + stripeWidth);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);

    material.map = texture;

    barberPole = new THREE.Mesh(geometry, material);
    scene.add(barberPole);
    
    // Set up camera and controls
    camera.position.set(0, 0, 5);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Initialize scene
async function init() {
    try {
        // Create scene
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Initialize renderer
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#heroCanvas'),
            antialias: true,
            alpha: true
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Create barber pole
        createBarberPole();
        
        // Set up camera and controls
        camera.position.set(0, 0, 5);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // Start animation
        animate();
    } catch (error) {
        console.error('Error initializing scene:', error);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (barberPole) {
        barberPole.rotation.y += 0.01;
        barberPole.material.map.offset.y -= 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Loading animation
const loader_element = document.querySelector('.loader');
const progressBar = document.querySelector('.progress-bar');

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init().catch(console.error);
    
    // Load gallery items
    loadGalleryItems();
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            
            // Hide loader
            gsap.to(loader_element, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loader_element.style.display = 'none';
                }
            });

            // Animate sections
            initAnimations();
        }
        progressBar.style.width = `${progress}%`;
    }, 500);
});

// Load gallery items
async function loadGalleryItems() {
    try {
        const response = await fetch('/api/gallery');
        const galleryData = await response.json();
        
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.innerHTML = galleryData.map(item => `
                <div class="gallery-item">
                    <img src="${item.imageUrl}" alt="${item.description}">
                    <p>${item.description}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading gallery items:', error);
    }
}

// Initialize GSAP animations
function initAnimations() {
    // Hero section animations
    gsap.from('.hero-content h1', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });

    gsap.from('.hero-content p', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power4.out'
    });

    gsap.from('.cta-button', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: 'power4.out'
    });

    // Scroll animations
    gsap.registerPlugin(ScrollTrigger);

    // Services section
    gsap.from('.service-card', {
        scrollTrigger: {
            trigger: '.services',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    // About section
    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1
    });

    // Contact section
    gsap.from('.contact-grid', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1
    });
}

// Form submission
const appointmentForm = document.getElementById('appointmentForm');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(appointmentForm);
        const appointmentData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            datetime: formData.get('datetime'),
            service: formData.get('service')
        };

        // Client-side validation
        if (!appointmentData.name || !appointmentData.email || !appointmentData.phone || !appointmentData.datetime || !appointmentData.service) {
            alert('Please fill in all fields.');
            return;
        }

        // Show loading state
        const submitButton = appointmentForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Booking...';

        try {
            const response = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('There was an error booking your appointment. Please try again later.');
        } finally {
            // Reset loading state
            submitButton.disabled = false;
            submitButton.textContent = 'Book Appointment';
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
