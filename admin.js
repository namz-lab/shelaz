// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const appointmentsList = document.getElementById('appointmentsList');
const galleryUploadForm = document.getElementById('galleryUploadForm');
const galleryItems = document.getElementById('galleryItems');

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        showAdminPanel();
        loadAppointments();
        loadGalleryItems();
    }
}

// Show admin panel
function showAdminPanel() {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
}

// Load appointments
async function loadAppointments() {
    try {
        const response = await fetch('/api/appointments');
        const appointments = await response.json();
        
        appointmentsList.innerHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <h3>${appointment.name}</h3>
                <p>Service: ${appointment.service}</p>
                <p>Date/Time: ${new Date(appointment.datetime).toLocaleString()}</p>
                <p>Email: ${appointment.email}</p>
                <p>Phone: ${appointment.phone}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Load gallery items
async function loadGalleryItems() {
    try {
        const response = await fetch('/api/gallery');
        const galleryData = await response.json();
        
        galleryItems.innerHTML = galleryData.map(item => `
            <div class="gallery-item">
                <img src="${item.imageUrl}" alt="${item.description}">
                <button class="delete-btn" onclick="deleteGalleryItem('${item.id}')">×</button>
                <p>${item.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery items:', error);
    }
}

// Delete gallery item
async function deleteGalleryItem(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        await fetch(`/api/gallery/${id}`, {
            method: 'DELETE'
        });
        loadGalleryItems();
    } catch (error) {
        console.error('Error deleting gallery item:', error);
    }
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();
        if (result.token) {
            localStorage.setItem('adminToken', result.token);
            showAdminPanel();
            loadAppointments();
            loadGalleryItems();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed. Please try again.');
    }
});

// Handle gallery upload form submission
galleryUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(galleryUploadForm);

    try {
        const response = await fetch('/api/gallery', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            galleryUploadForm.reset();
            loadGalleryItems();
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
    }
});

// Initialize admin panel
checkAuth();
