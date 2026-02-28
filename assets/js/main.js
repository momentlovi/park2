/**
 * РњР¤Рљ РџРђР Рљ - Main JS
 */

// Handle JS detection immediately
document.documentElement.classList.replace('no-js', 'js');

// Function to reveal elements
const revealOnScroll = () => {
    const revealElements = document.querySelectorAll("[data-reveal]");
    const winHeight = window.innerHeight;

    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < winHeight * 0.85) {
            el.classList.add('is-visible');
            
            // Trigger counters
            el.querySelectorAll('[data-count]').forEach(countEl => {
                if (countEl.dataset.counted) return;
                countEl.dataset.counted = "true";
                const target = parseInt(countEl.dataset.count);
                let current = 0;
                const duration = 2000;
                const startTime = performance.now();
                
                const update = (now) => {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    countEl.innerText = Math.floor(eased * target).toLocaleString('ru-RU');
                    if (progress < 1) requestAnimationFrame(update);
                };
                requestAnimationFrame(update);
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Remove Loading State
    document.body.classList.remove('is-loading');

    // 2. Initial Reveal
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll, { passive: true });

    // 3. Header
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('is-scrolled', window.pageYOffset > 50);
        }, { passive: true });
    }

    // 4. Horizontal Infrastructure - Sticky & Smooth
    const horizontalTrack = document.querySelector('.horizontal-scroll-track');
    const infraSection = document.querySelector('.infrastructure');
    
    if (horizontalTrack && infraSection) {
        const updateLayout = () => {
            // Adjust section height based on track width to provide appropriate scroll distance
            const trackWidth = horizontalTrack.scrollWidth;
            // The scroll distance should be enough to move the entire track through the window
            const scrollDistance = trackWidth - window.innerWidth + 200; // Buffer for feel
            infraSection.style.height = `${window.innerHeight + Math.max(0, scrollDistance)}px`;
        };

        const updateScroll = () => {
            const rect = infraSection.getBoundingClientRect();
            const winHeight = window.innerHeight;
            
            // Only transform when section is pinned (sticky active)
            if (rect.top <= 0 && rect.bottom >= winHeight) {
                const totalScroll = rect.height - winHeight;
                const progress = -rect.top / totalScroll;
                
                // FinalTranslate = trackWidth - viewportWidth
                const maxScroll = horizontalTrack.scrollWidth - window.innerWidth;
                const translateX = Math.max(0, Math.min(maxScroll, progress * maxScroll));
                
                horizontalTrack.style.transform = `translate3d(-${translateX}px, 0, 0)`;
            } else if (rect.top > 0) {
                horizontalTrack.style.transform = `translate3d(0, 0, 0)`;
            } else if (rect.bottom < winHeight) {
                const maxScroll = horizontalTrack.scrollWidth - window.innerWidth;
                horizontalTrack.style.transform = `translate3d(-${maxScroll}px, 0, 0)`;
            }
        };

        window.addEventListener('resize', () => {
            updateLayout();
            updateScroll();
        });
        window.addEventListener('scroll', updateScroll, { passive: true });
        
        // Initial calls
        updateLayout();
        setTimeout(updateScroll, 100);
    }

    // 5. Popup
    const popup = document.getElementById('leadPopup');
    if (popup) {
        const openPopup = () => popup.classList.add('is-active');
        const closePopup = () => popup.classList.remove('is-active');
        
        setTimeout(() => {
            if (!sessionStorage.getItem('popupShown')) {
                openPopup();
                sessionStorage.setItem('popupShown', 'true');
            }
        }, 15000);

        document.querySelectorAll('.open-popup').forEach(btn => btn.addEventListener('click', e => {
            e.preventDefault();
            openPopup();
        }));

        popup.querySelector('.popup-close').addEventListener('click', closePopup);
        popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
        
        const popupForm = popup.querySelector('.popup-form');
        if (popupForm) {
            if (!popupForm.querySelector('input[name="hp"], input[name="website"], input[name="company"], input[name="hidden"]')) {
                const hpInput = document.createElement('input');
                hpInput.type = 'text';
                hpInput.name = 'hp';
                hpInput.tabIndex = -1;
                hpInput.autocomplete = 'off';
                hpInput.setAttribute('aria-hidden', 'true');
                hpInput.style.display = 'none';
                popupForm.appendChild(hpInput);
            }

            popupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = e.target;
                const btn = form.querySelector('button[type="submit"], button');
                if (!btn) {
                    return;
                }

                const originalText = btn.innerText;
                const name = (form.querySelector('input[name="name"]')?.value || '').trim();
                const phone = (form.querySelector('input[name="phone"]')?.value || '').trim();
                const hp = (form.querySelector('input[name="hp"], input[name="website"], input[name="company"], input[name="hidden"]')?.value || '').trim();

                if (!phone) {
                    return;
                }

                btn.disabled = true;
                btn.innerText = 'Sending...';

                try {
                    if (typeof window.sendLead !== 'function') {
                        throw new Error('sendLead is not available');
                    }

                    await window.sendLead({
                        name: name,
                        phone: phone,
                        source: 'popup-form',
                        message: 'Popup form submit',
                        hp: hp,
                    });

                    btn.innerText = 'Sent!';
                    setTimeout(() => {
                        closePopup();
                        form.reset();
                        btn.disabled = false;
                        btn.innerText = originalText;
                    }, 1500);
                } catch (error) {
                    console.error('Lead submit failed:', error);
                    btn.innerText = 'Error';
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerText = originalText;
                    }, 1500);
                }
            });
        }
    }

    // 6. Interior Drag
    const slider = document.querySelector('.interior-slider');
    if (slider) {
        let isDown = false, startX, scrollLeft;
        slider.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
        window.addEventListener('mouseup', () => isDown = false);
        slider.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX) * 2;
        });
    }
});
