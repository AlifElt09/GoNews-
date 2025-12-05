
const API_KEY = 'b382b0617bcc49f9a93a6ebc4a134af1';
const CATEGORIES = ['general', 'technology', 'business', 'sports', 'entertainment', 'science', 'health'];

let currentCategory = 'general';
let allArticles = [];

const articlesContainer = document.getElementById('articles');
const categoryContainer = document.getElementById('categoryContainer');
const searchInput = document.getElementById('searchInput');

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  loadNews('general');
});

function renderCategories() {
  categoryContainer.innerHTML = CATEGORIES.map(cat => 
    `<div class="category-pill" data-cat="${cat}">
      ${cat.charAt(0).toUpperCase() + cat.slice(1)}
    </div>`
  ).join('');

  document.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      loadNews(currentCategory);
    });
  });
  document.querySelector('.category-pill')?.classList.add('active');
}

searchInput?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!allArticles.length) return;
  const filtered = allArticles.filter(a => 
    a.title.toLowerCase().includes(query) || (a.description && a.description.toLowerCase().includes(query))
  );
  renderArticles(filtered.slice(0, 12));
});

async function loadNews(category) {
  articlesContainer.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Loading news...</p></div>';
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'error') throw new Error(data.message);
    
    allArticles = data.articles.filter(a => a.title !== '[Removed]' && a.urlToImage);
    renderArticles(allArticles.slice(0, 12));
  } catch (error) {
    articlesContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error: ${error.message}</div></div>`;
  }
}

function renderArticles(articles) {
  if (articles.length === 0) {
    articlesContainer.innerHTML = '<div class="col-12 text-center py-5 text-muted">No articles found.</div>';
    return;
  }
  articlesContainer.innerHTML = articles.map(article => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <img src="${article.urlToImage}" class="card-img-top" alt="${article.title}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${article.title.length > 80 ? article.title.substring(0, 80) + '...' : article.title}</h5>
          <p class="card-text flex-grow-1">${article.description?.length > 100 ? article.description.substring(0, 100) + '...' : article.description || ''}</p>
          <a href="${article.url}" target="_blank" class="btn btn-primary mt-auto">Read more</a>
        </div>
      </div>
    </div>
  `).join('');
}