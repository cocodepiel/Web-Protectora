
// DOM Elements
const grid = document.getElementById('animal-grid');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

// Mobile Menu Toggle
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// State
let allAnimals = [];

// Fetch Data from GitHub API
async function loadAnimals() {
    try {
        // Fetch list of files from GitHub repository
        const response = await fetch('https://api.github.com/repos/ros13ali/Web-Protectora/contents/content/animales');
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

    return { ...metadata, description: body, body }; // Include both for compatibility
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
                : `<a href="#" class="block w-full text-center bg-sos-green hover:bg-sos-dark-green text-white font-bold py-2 px-4 rounded transition">Más Información</a>`
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

// Initial Load
document.addEventListener('DOMContentLoaded', loadAnimals);
