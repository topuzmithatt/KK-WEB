// =====================================================
// KAPALI KALE TARAFTARLAR DERNEĞİ - JAVASCRIPT
// Google Forms Entegrasyonu & UI Kontrolleri
// MOBİL OPTİMİZE VERSİYON
// =====================================================

// =====================================================
// MOBİL HAMBURGER MENU KONTROLÜ
// =====================================================
function initMobileMenu() {
    const navWrapper = document.querySelector('.nav-wrapper');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navWrapper || !navMenu) return;
    
    // Hamburger butonu oluştur
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Menüyü Aç/Kapat');
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    // Overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    
    // DOM'a ekle
    navWrapper.insertBefore(menuToggle, navMenu);
    document.body.appendChild(overlay);
    
    // Toggle fonksiyonu
    const toggleMenu = () => {
        const isActive = menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Body scroll'u kontrol et
        document.body.style.overflow = isActive ? 'hidden' : '';
    };
    
    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Menü linklerine tıklandığında menüyü kapat (sadece mobilde)
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992 && menuToggle.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // ESC tuşu ile menüyü kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuToggle.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Pencere yeniden boyutlandırıldığında menüyü sıfırla
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 992 && menuToggle.classList.contains('active')) {
                toggleMenu();
            }
        }, 250);
    });
}

// 1. GOOGLE FORMS AYARLARI
const GOOGLE_FORMS = {
    // Deplasman Formu
    deployment: {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLScq4gWAKF6c5RjzBfVuEAwBdTSjvcHrz4MdlGLBR1TrVb2k7w/formResponse',
        fields: {
            fullName: 'entry.453360435',
            phone: 'entry.1885755863',
            email: 'entry.1931708297',
            passoCheck: 'entry.1459692919',
            visaCheck: 'entry.406397246'
        }
    },

    // İletişim Formu
    contact: {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSfNWnzpeRq4Kk21WO5V6RSRSaMHnc6r4HR5Sg/formResponse',
        fields: {
            contactName: 'entry.432520600',
            contactEmail: 'entry.1250474398',
            contactSubject: 'entry.1012014838',
            contactMessage: 'entry.728662554'
        }
    }
};

// =====================================================
// DOM ELEMENTLERİ VE UI BAŞLANGIÇ
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Kapalı Kale - Mobil Optimize Sistem Aktif!');
    
    // Mobil menüyü başlat
    initMobileMenu();
    
    // Aktif menü linkini işaretle
    highlightActiveMenu();

    // Deplasman formu varsa kontrolleri başlat
    if (document.getElementById('membershipForm')) {
        initDeplasmanLogic();
    }
    
    // İletişim formu varsa kontrolleri başlat
    if (document.getElementById('contactForm')) {
        initContactLogic();
    }

    // Tayfalarımız sayfasındaki animasyonlar için (Eğer varsa)
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
    
    // Touch cihazlar için optimize edilmiş scroll davranışı
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});

// AKTİF MENÜ İŞARETLEME
function highlightActiveMenu() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// =====================================================
// DEPLASMAN FORMU MANTIĞI VE GÖNDERİMİ
// =====================================================
function initDeplasmanLogic() {
    const form = document.getElementById('membershipForm');
    const passoRadios = document.getElementsByName('passoCheck');
    const visaRadios = document.getElementsByName('visaCheck');
    const visaCards = document.querySelectorAll('.visa-group .radio-card');
    const warningBox = document.getElementById('passoWarning');
    
    // Passolig Durum Kontrolü (Görsel Kilitleme)
    passoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'Hayır') {
                visaRadios.forEach(r => { r.checked = false; r.disabled = true; });
                visaCards.forEach(card => card.classList.add('disabled'));
                warningBox.style.display = 'block';
                warningBox.textContent = "⚠️ Passolig olmadan maça giriş yapamazsınız.";
            } else {
                visaRadios.forEach(r => r.disabled = false);
                visaCards.forEach(card => card.classList.remove('disabled'));
                warningBox.style.display = 'none';
            }
        });
    });

    // FORM GÖNDERİMİ
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Verileri Al
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email')?.value || '',
            passoCheck: document.querySelector('input[name="passoCheck"]:checked')?.value,
            visaCheck: document.querySelector('input[name="visaCheck"]:checked')?.value
        };

        // KONTROLLER
        if (formData.passoCheck === 'Hayır') {
            showAlert('❌ Passolig kartınız olmadan başvuru yapamazsınız.', 'error');
            return;
        }
        if (formData.visaCheck === 'Hayır') {
            showAlert('❌ Passo Kartınızın vizesi olmadan maça giriş yapamazsınız.', 'error');
            return;
        }

        // Gönderim Başlıyor - Butonu Kilitle
        const btn = form.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'GÖNDERİLİYOR...';

        try {
            await submitToGoogleForm(GOOGLE_FORMS.deployment.url, GOOGLE_FORMS.deployment.fields, formData);
            showAlert('✅ Başvurunuz başarıyla alındı! Tribünde görüşmek üzere.', 'success');
            form.reset();
            // Reset sonrası UI düzeltmeleri
            visaCards.forEach(card => card.classList.remove('disabled'));
            warningBox.style.display = 'none';
        } catch (error) {
            console.error(error);
            showAlert('❌ Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = oldText;
        }
    });
}

// =====================================================
// İLETİŞİM FORMU MANTIĞI
// =====================================================
function initContactLogic() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            contactName: document.getElementById('contactName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactSubject: document.getElementById('contactSubject')?.value || 'Web Sitesi Mesajı',
            contactMessage: document.getElementById('contactMessage').value
        };

        const btn = form.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'GÖNDERİLİYOR...';

        try {
            await submitToGoogleForm(GOOGLE_FORMS.contact.url, GOOGLE_FORMS.contact.fields, formData);
            showAlert('✅ Mesajınız iletildi. Teşekkürler!', 'success');
            form.reset();
        } catch (error) {
            console.error(error);
            showAlert('❌ Mesaj gönderilemedi.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = oldText;
        }
    });
}

// =====================================================
// GOOGLE FORMS GÖNDERİM FONKSİYONU
// =====================================================
function submitToGoogleForm(formUrl, fieldMapping, data) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        
        // Google Forms ID'leri ile verileri eşleştir
        for (const key in data) {
            if (fieldMapping[key]) {
                formData.append(fieldMapping[key], data[key]);
            }
        }

        // Görünmez iframe oluştur
        const iframeId = 'hidden_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeId);
        iframe.setAttribute('name', iframeId);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Geçici form oluştur ve iframe'e post et
        const form = document.createElement('form');
        form.action = formUrl;
        form.method = 'POST';
        form.target = iframeId;

        for (const pair of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = pair[0];
            input.value = pair[1];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();

        // Temizlik ve Başarılı Dönüş
        setTimeout(() => {
            document.body.removeChild(form);
            document.body.removeChild(iframe);
            resolve();
        }, 1000);
    });
}

// =====================================================
// MOBİL UYUMLU ALERT SİSTEMİ
// =====================================================
function showAlert(message, type = 'info') {
    // Mevcut alert varsa kaldır
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Alert elementi oluştur
    const alert = document.createElement('div');
    alert.className = `custom-alert custom-alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Stil ekle (eğer yoksa)
    if (!document.getElementById('custom-alert-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 90px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                min-width: 300px;
                max-width: 90%;
                padding: 1.2rem;
                border-radius: 8px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
                animation: slideDown 0.4s ease;
                font-weight: 600;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .custom-alert-success {
                background: #1a5928;
                border: 2px solid #2d894d;
                color: #90ee90;
            }
            
            .custom-alert-error {
                background: #8b0000;
                border: 2px solid #c01819;
                color: #fed315;
            }
            
            .custom-alert-info {
                background: #1a1a1a;
                border: 2px solid #fed315;
                color: #fed315;
            }
            
            .alert-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .alert-message {
                flex: 1;
                font-size: 0.95rem;
            }
            
            .alert-close {
                background: transparent;
                border: none;
                color: inherit;
                font-size: 1.8rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .alert-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            @media (max-width: 768px) {
                .custom-alert {
                    top: 80px;
                    min-width: 280px;
                }
                
                .alert-message {
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Body'e ekle
    document.body.appendChild(alert);
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'slideDown 0.4s ease reverse';
            setTimeout(() => alert.remove(), 400);
        }
    }, 5000);
}
