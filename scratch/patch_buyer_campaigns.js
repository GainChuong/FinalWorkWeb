const fs = require('fs');

let buyerCode = fs.readFileSync('buyer/index.html', 'utf8');

const regexCarouselScript = /document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?\/\/\s*Carousel Logic[\s\S]*?setInterval\([\s\S]*?\}, 5000\);\s*\}\s*\}\);/m;

const replacement = `document.addEventListener('DOMContentLoaded', function() {
      // 1. Load Custom Campaigns Banners First
      const carouselContainer = document.querySelector('.hero-carousel');
      const indicatorsContainer = document.querySelector('.carousel-indicators');
      let campaigns = [];
      try {
        campaigns = JSON.parse(localStorage.getItem('refashion_campaigns')) || [];
      } catch(e) {}
      
      const bannerCampaigns = campaigns.filter(c => c.status === 'Active' && c.bannerImage);
      
      if (bannerCampaigns.length > 0 && carouselContainer && indicatorsContainer) {
        carouselContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        
        bannerCampaigns.forEach((camp, index) => {
          // Slide
          const slide = document.createElement('div');
          slide.className = 'hero-slide' + (index === 0 ? ' active' : '');
          slide.style.backgroundImage = 'url(' + camp.bannerImage + ')';
          // Optional overlay darkening
          slide.innerHTML = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);"></div>';
          carouselContainer.appendChild(slide);
          
          // Indicator
          const ind = document.createElement('span');
          ind.className = 'indicator' + (index === 0 ? ' active' : '');
          ind.onclick = function() { window.goToSlide(index); };
          indicatorsContainer.appendChild(ind);
        });
        
        // Update Title / Subtitle based on the first campaign maybe? (Optional)
        const titleEl = document.querySelector('.hero-title');
        const subEl = document.querySelector('.hero-subtitle');
        if (titleEl) titleEl.innerHTML = bannerCampaigns[0].name;
        if (subEl) subEl.innerHTML = bannerCampaigns[0].description || 'Join the circular fashion revolution today.';
      }

      // 2. Carousel Logic
      let currentSlide = 0;
      const slides = document.querySelectorAll('.hero-slide');
      const indicators = document.querySelectorAll('.indicator');
      
      window.goToSlide = function(index) {
        if (!slides.length) return;
        slides[currentSlide].classList.remove('active');
        if (indicators[currentSlide]) indicators[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
      };

      if (slides.length > 0) {
        setInterval(() => {
          let next = (currentSlide + 1) % slides.length;
          goToSlide(next);
        }, 5000);
      }
    });`;

buyerCode = buyerCode.replace(regexCarouselScript, replacement);

fs.writeFileSync('buyer/index.html', buyerCode);
console.log('Patched buyer/index.html carousel logic');
