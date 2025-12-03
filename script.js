// 🔑 Ganti dengan API key Anda dari https://newsapi.org/
const API_KEY = 'b382b0617bcc49f9a93a6ebc4a134af1';
const BASE_URL = 'https://newsapi.org/v2';

const articlesContainer = document.getElementById('articles');
const categorySelect = document.getElementById('categorySelect');
const darkModeToggle = document.getElementById('darkModeToggle');

document.addEventListener('DOMContentLoaded', () => {
  fetchNews('general');
  setupEventListeners();
  applyStoredTheme();
});

function setupEventListeners() {
  categorySelect.addEventListener('change', (e) => {
    fetchNews(e.target.value);
  });

  darkModeToggle.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.contains('dark-mode');
  if (isDark) {
    body.classList.replace('dark-mode', 'light-mode');
    localStorage.setItem('theme', 'light');
    darkModeToggle.textContent = '🌙';
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    localStorage.setItem('theme', 'dark');
    darkModeToggle.textContent = '☀️';
  }
}

function applyStoredTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = savedTheme + '-mode';
  darkModeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

async function fetchNews(category = 'general') {
  articlesContainer.innerHTML = '<div class="col-12 text-center"><p class="loading">Loading news...</p></div>';

  // News API hanya mendukung 'top-headlines' untuk kategori tertentu
  const url = `${BASE_URL}/top-headlines?country=id&category=${category}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      renderArticles(data.articles.slice(0, 12));
    } else {
      articlesContainer.innerHTML = '<div class="col-12 text-center"><p class="error">No articles available for this category.</p></div>';
    }
  } catch (error) {
    console.error('Error:', error);
    articlesContainer.innerHTML = `
      <div class="col-12 text-center">
        <p class="error">Failed to load news.</p>
        <p class="text-muted small">${error.message}</p>
      </div>`;
  }
}

function renderArticles(articles) {
  articlesContainer.innerHTML = '';
  articles.forEach(article => {
    if (!article.urlToImage) article.urlToImage = 'https://placehold.co/600x400?text=No+Image';
    if (!article.description) article.description = 'No description available.';

    const publishedAt = new Date(article.publishedAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-xl-3';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${article.urlToImage}" class="card-img-top" alt="${article.title}" 
             onerror="this.src='https://placehold.co/600x400?text=Image+Not+Found'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${article.title.length > 80 ? article.title.substring(0, 80) + '...' : article.title}</h5>
          <p class="card-text flex-grow-1">${article.description.length > 100 ? article.description.substring(0, 100) + '...' : article.description}</p>
          <div class="mt-auto">
            <small class="text-muted">${publishedAt} • ${article.source.name}</small><br>
            <a href="${article.url}" target="_blank" class="card-link mt-2">Read more →</a>
          </div>
        </div>
      </div>
    `;
    articlesContainer.appendChild(col);
  });
}