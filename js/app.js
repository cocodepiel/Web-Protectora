
// DOM Elements
const grid = document.getElementById('animal-grid');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const animalsSection = document.getElementById('animals');

// Inject CSS animation for detail view
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .detail-fade-in {
        animation: detailFadeIn 0.4s ease-out forwards;
    }
    @keyframes detailFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .whitespace-pre-line {
        white-space: pre-line;
    }
`;
document.head.appendChild(styleSheet);

// Mobile Menu Toggle
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// State
let allAnimals = [];
let detailContainer = null;

// Fetch Data from GitHub API
async function loadAnimals() {
    try {
        // Fetch list of files from GitHub repository
        const response = await fetch('https://api.github.com/repos/cocodepiel/Web-Protectora/contents/content/animales');
        if (!response.ok) throw new Error('Failed to load animals from GitHub API');

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.endsWith('.md'));

        // Fetch and parse each markdown file
        const animalPromises = mdFiles.map(async file => {
            const fileRes = await fetch(file.download_url);
            const text = await fileRes.text();
            return parseFrontMatter(text);
        });

        allAnimals = (await Promise.all(animalPromises)).filter(Boolean); // Remove nulls
        renderAnimals(allAnimals);
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<p class="text-center col-span-full text-red-500">Error cargando los valientes desde GitHub. Por favor intenta más tarde.</p>';
    }
}

// Helper: Parse Frontmatter (Simple YAML parser)
function parseFrontMatter(text) {
    const frontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
    const match = text.match(frontMatterRegex);

    if (!match) return null; // Not a valid markdown with frontmatter

    const metaBlock = match[1];
    const body = match[2].trim();
    const metadata = {};

    metaBlock.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Rejoin the rest of the parts in case the value has colons (like URLs)
            let value = parts.slice(1).join(':').trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            metadata[key] = value;
        }
    });

    // Normalize image path to always point to /assets/
    if (metadata.image) {
        metadata.image = normalizeImagePath(metadata.image);
    }

    return { ...metadata, description: body, body }; // Include both for compatibility
}

// Helper: Normalize image path to ALWAYS point to /assets/
// Uses the image property directly from frontmatter (NOT the animal name)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80';

function normalizeImagePath(imagePath) {
    // 1. Si no hay imagen, foto por defecto
    if (!imagePath || imagePath.trim() === '') {
        return DEFAULT_IMAGE;
    }

    // 2. Si es una URL de internet, se deja como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 3. LIMPIEZA TOTAL: 
    // Quitamos cualquier rastro de "/assets/" o "assets/" que pueda venir del CMS
    let filename = imagePath.replace(/^\/?assets\//, '');

    // 4. RECONSTRUCCIÓN:
    // Forzamos que siempre empiece por /assets/ seguido del nombre limpio
    return `/assets/${filename}`;
}

// Render Function
function renderAnimals(animals) {
    grid.innerHTML = '';

    if (animals.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">💤</div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">¡Shhh! Están todos durmiendo</h3>
                <p class="text-gray-500">Nuestros valientes están descansando o no hay coincidencias ahora mismo.</p>
                <button onclick="filterAnimals('all')" class="mt-4 px-6 py-2 bg-sos-green text-white rounded-full hover:bg-sos-dark-green transition">Ver todos</button>
            </div>
        `;
        return;
    }

    animals.forEach((animal, index) => {
        const isUrgent = animal.status === 'Urgente';
        const isAdopted = animal.status === 'Adoptado';

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300 flex flex-col fade-in-up';
        card.style.animationDelay = `${index * 100}ms`;

        card.innerHTML = `
            <div class="relative h-64">
                <img src="${animal.image}" alt="${animal.title}" class="w-full h-full object-cover">
                ${isUrgent ? '<div class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">URGENTE</div>' : ''}
                ${isAdopted ? '<div class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"><span class="bg-green-500 text-white font-bold text-xl px-4 py-2 transform -rotate-12 rounded border-2 border-white">¡ADOPTADO!</span></div>' : ''}
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex justify-between items-baseline mb-2">
                    <h3 class="text-2xl font-bold text-gray-900">${animal.title}</h3>
                    <span class="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">${animal.species}</span>
                </div>
                <div class="flex space-x-4 text-sm text-gray-600 mb-4">
                    <span>🎂 ${animal.age}</span>
                    <span>📏 ${animal.size}</span>
                </div>
                <p class="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">${animal.description}</p>
                <div class="mt-auto">
                    ${isAdopted
                ? `<button disabled class="w-full bg-gray-300 text-white font-bold py-2 px-4 rounded cursor-not-allowed">Final Feliz</button>`
                : `<button onclick="showAnimalDetail('${animal.title.replace(/'/g, "\\'")}')" class="block w-full text-center bg-sos-green hover:bg-sos-dark-green text-white font-bold py-2 px-4 rounded transition cursor-pointer">Más Información</button>`
            }
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Function
window.filterAnimals = function (criteria) {
    if (criteria === 'all') {
        renderAnimals(allAnimals);
    } else if (criteria === 'Urgente') {
        const filtered = allAnimals.filter(a => a.status === 'Urgente');
        renderAnimals(filtered);
    } else {
        const filtered = allAnimals.filter(a => a.species === criteria);
        renderAnimals(filtered);
    }
}

// Show Animal Detail View (SPA style)
window.showAnimalDetail = function (title) {
    // Find the animal by title
    const animal = allAnimals.find(a => a.title === title);
    if (!animal) {
        console.error('Animal not found:', title);
        return;
    }

    // Hide the main animals section
    if (animalsSection) {
        animalsSection.classList.add('hidden');
    }

    // Get status badge HTML
    const getStatusBadge = (status) => {
        if (status === 'Urgente') {
            return '<span class="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">⚠️ URGENTE</span>';
        } else if (status === 'Adoptado') {
            return '<span class="inline-block bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">✅ ADOPTADO</span>';
        }
        return '<span class="inline-block bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">🏠 En adopción</span>';
    };

    // Create the detail container
    detailContainer = document.createElement('div');
    detailContainer.id = 'animal-detail';
    detailContainer.className = 'bg-white/50 py-12 backdrop-blur-sm detail-fade-in';

    detailContainer.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Back Button -->
            <button onclick="hideAnimalDetail()" class="mb-6 inline-flex items-center text-sos-dark-green hover:text-sos-green font-semibold transition group">
                <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver al catálogo
            </button>

            <!-- Detail Card -->
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div class="flex flex-col lg:flex-row">
                    <!-- Image Section -->
                    <div class="lg:w-1/2">
                        <img src="${animal.image}" alt="${animal.title}" class="w-full h-80 lg:h-full object-cover">
                    </div>

                    <!-- Info Section -->
                    <div class="lg:w-1/2 p-8 lg:p-10 flex flex-col">
                        <!-- Header -->
                        <div class="mb-6">
                            <div class="flex flex-wrap items-center gap-3 mb-3">
                                <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900">${animal.title}</h1>
                                ${getStatusBadge(animal.status)}
                            </div>
                            <span class="inline-block text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">${animal.species || 'Sin especificar'}</span>
                        </div>

                        <!-- Stats Grid -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-pink-50 rounded-xl p-4 text-center">
                                <div class="text-2xl mb-1">🎂</div>
                                <div class="text-sm text-gray-500 font-medium">Edad</div>
                                <div class="text-lg font-bold text-gray-800">${animal.age || 'Desconocida'}</div>
                            </div>
                            <div class="bg-pink-50 rounded-xl p-4 text-center">
                                <div class="text-2xl mb-1">📏</div>
                                <div class="text-sm text-gray-500 font-medium">Tamaño</div>
                                <div class="text-lg font-bold text-gray-800">${animal.size || 'Desconocido'}</div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="flex-1 mb-6">
                            <h2 class="text-lg font-bold text-gray-800 mb-3">Sobre ${animal.title}</h2>
                            <p class="text-gray-600 leading-relaxed whitespace-pre-line">${animal.body || animal.description || 'Sin descripción disponible.'}</p>
                        </div>

                        <!-- CTA Button -->
                        <div class="mt-auto">
                            ${animal.status === 'Adoptado'
            ? `<button disabled class="w-full bg-gray-300 text-white font-bold py-4 px-6 rounded-xl cursor-not-allowed text-lg">🎉 ¡Ya tiene familia!</button>`
            : `<a href="https://wa.me/34600123456?text=Hola! Me interesa adoptar a ${encodeURIComponent(animal.title)}" target="_blank" class="block w-full text-center bg-sos-green hover:bg-sos-dark-green text-white font-bold py-4 px-6 rounded-xl transition text-lg transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                                    💬 Preguntar por ${animal.title}
                                </a>`
        }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert after the nav (or before the first section)
    const nav = document.querySelector('nav');
    if (nav && nav.nextElementSibling) {
        nav.nextElementSibling.parentNode.insertBefore(detailContainer, nav.nextElementSibling);
    } else {
        document.body.insertBefore(detailContainer, document.body.firstChild);
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Hide Animal Detail View and show grid
window.hideAnimalDetail = function () {
    // Remove detail container
    if (detailContainer) {
        detailContainer.remove();
        detailContainer = null;
    }

    // Show the main animals section
    if (animalsSection) {
        animalsSection.classList.remove('hidden');
    }

    // Scroll to animals section
    if (animalsSection) {
        animalsSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', loadAnimals);
