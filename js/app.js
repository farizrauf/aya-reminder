document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const arabicText = document.getElementById("arabicText");
    const translationText = document.getElementById("translationText");
    const surahText = document.getElementById("surahText");
    const ayahInfo = document.getElementById("ayahInfo");
    const ayahCard = document.getElementById("ayahCard");
    const randomBtn = document.getElementById("randomBtn");
    const copyBtn = document.getElementById("copyBtn");
    const shareBtn = document.getElementById("shareBtn");
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const reflectionNote = document.getElementById("reflectionNote");

    const fullscreenOverlay = document.getElementById("fullscreenOverlay");
    const closeFullscreen = document.getElementById("closeFullscreen");
    const fsArabicText = document.getElementById("fsArabicText");
    const fsTranslationText = document.getElementById("fsTranslationText");
    const fsSurahText = document.getElementById("fsSurahText");
    
    const bookmarkSection = document.getElementById("bookmarkSection");
    const bookmarkList = document.getElementById("bookmarkList");
    const showBookmarks = document.getElementById("showBookmarks");
    const closeBookmarks = document.getElementById("closeBookmarks");
    const viewBookmarksToggle = document.getElementById("viewBookmarksToggle");
    const toastContainer = document.getElementById("toastContainer");

    let currentAyah = null;
    let allAyahs = [];
    let bookmarks = JSON.parse(localStorage.getItem("ayahBookmarks") || "[]");

    // Initialize Icons
    const initIcons = () => lucide.createIcons();
    initIcons();

    // Theme Management
    const updateDarkModeIcon = (isDark) => {
        const icon = darkModeToggle.querySelector("i");
        if (isDark) {
            icon.setAttribute("data-lucide", "sun");
            icon.classList.remove("text-emerald-700");
            icon.classList.add("text-yellow-400");
        } else {
            icon.setAttribute("data-lucide", "moon");
            icon.classList.remove("text-yellow-400");
            icon.classList.add("text-emerald-700");
        }
        initIcons();
    };

    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
        updateDarkModeIcon(true);
    }

    darkModeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.theme = isDark ? "dark" : "light";
        updateDarkModeIcon(isDark);
    });

    // Toast Notification
    const showToast = (message, type = "success") => {
        const toast = document.createElement("div");
        toast.className = `flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-emerald-100 dark:border-slate-700 transition-all duration-500 transform translate-y-10 opacity-0 pointer-events-auto`;
        const icon = type === "success" ? "check-circle" : "info";
        toast.innerHTML = `
            <i data-lucide="${icon}" class="w-4 h-4 text-emerald-600"></i>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${message}</span>
        `;
        toastContainer.appendChild(toast);
        initIcons();
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove("translate-y-10", "opacity-0");
        });

        setTimeout(() => {
            toast.classList.add("-translate-y-5", "opacity-0");
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // Render Logic
    const updateBookmarkButton = () => {
        if (!currentAyah) return;
        const isBookmarked = bookmarks.some(b => b.id === currentAyah.id);
        const icon = bookmarkBtn.querySelector("i");
        if (isBookmarked) {
            icon.setAttribute("data-lucide", "bookmark-check");
            bookmarkBtn.classList.add("bg-emerald-50", "dark:bg-emerald-900/40", "border-emerald-200");
        } else {
            icon.setAttribute("data-lucide", "bookmark");
            bookmarkBtn.classList.remove("bg-emerald-50", "dark:bg-emerald-900/40", "border-emerald-200");
        }
        initIcons();
    };

    const renderAyah = (ayah, label = "Ayat Hari Ini") => {
        if (!ayah) return;
        
        // Start Fade Out
        ayahCard.style.opacity = "0";
        ayahCard.style.transform = "translateY(10px)";
        
        setTimeout(() => {
            currentAyah = ayah;
            
            // Update Text
            arabicText.textContent = ayah.arabic;
            translationText.textContent = `"${ayah.translation}"`;
            surahText.textContent = `${ayah.surah} : ${ayah.ayah}`;
            ayahInfo.textContent = label;

            // Update Fullscreen
            fsArabicText.textContent = ayah.arabic;
            fsTranslationText.textContent = `"${ayah.translation}"`;
            fsSurahText.textContent = `${ayah.surah} : ${ayah.ayah}`;

            updateBookmarkButton();

            // Fade In
            ayahCard.style.opacity = "1";
            ayahCard.style.transform = "translateY(0)";
        }, 400);
    };

    const getDailyIndex = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay) % allAyahs.length;
    };

    // Data Loading
    fetch("data/ayat.json")
        .then(res => res.json())
        .then(data => {
            allAyahs = data;
            renderAyah(allAyahs[getDailyIndex()]);
            renderBookmarks();
        })
        .catch(err => {
            console.error("Failed to load ayahs:", err);
            ayahInfo.textContent = "Error Loading Data";
        });

    // Actions
    randomBtn.addEventListener("click", () => {
        const randomIndex = Math.floor(Math.random() * allAyahs.length);
        renderAyah(allAyahs[randomIndex], "Ayat Pilihan");
    });

    bookmarkBtn.addEventListener("click", () => {
        if (!currentAyah) return;
        const idx = bookmarks.findIndex(b => b.id === currentAyah.id);
        if (idx === -1) {
            bookmarks.push(currentAyah);
            showToast("Berhasil disimpan ke bookmark");
        } else {
            bookmarks.splice(idx, 1);
            showToast("Dihapus dari bookmark", "info");
        }
        localStorage.setItem("ayahBookmarks", JSON.stringify(bookmarks));
        updateBookmarkButton();
        renderBookmarks();
    });

    copyBtn.addEventListener("click", () => {
        if (!currentAyah) return;
        const text = `${currentAyah.arabic}\n\n"${currentAyah.translation}"\n(${currentAyah.surah} : ${currentAyah.ayah})`;
        navigator.clipboard.writeText(text).then(() => showToast("Ayat berhasil disalin"));
    });

    shareBtn.addEventListener("click", () => {
        if (!currentAyah) return;
        const text = `${currentAyah.arabic}\n\n"${currentAyah.translation}"\n(${currentAyah.surah} : ${currentAyah.ayah})`;
        if (navigator.share) {
            navigator.share({ title: 'Ayat of The Day', text }).catch(() => {});
        } else {
            showToast("Sharing tidak didukung", "info");
        }
    });

    fullscreenBtn.addEventListener("click", () => {
        fullscreenOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });

    closeFullscreen.addEventListener("click", () => {
        fullscreenOverlay.classList.add("hidden");
        document.body.style.overflow = "auto";
    });

    // Bookmarks Management
    const renderBookmarks = () => {
        if (bookmarks.length === 0) {
            bookmarkList.innerHTML = `<p class="text-sm text-slate-400 italic py-4 text-center">Belum ada ayat yang disimpan.</p>`;
            return;
        }

        bookmarkList.innerHTML = bookmarks.map(b => `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-50 dark:border-slate-700 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all cursor-pointer" data-id="${b.id}">
                <div class="flex-grow">
                    <p class="text-[10px] uppercase font-bold text-emerald-600 mb-1">${b.surah} : ${b.ayah}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">${b.arabic}</p>
                </div>
                <button class="remove-bookmark p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all" data-id="${b.id}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join("");
        
        initIcons();

        // Add Listeners to bookmarks
        bookmarkList.querySelectorAll('.cursor-pointer').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = parseInt(el.dataset.id);
                const ayah = allAyahs.find(a => a.id === id);
                if (ayah) {
                    renderAyah(ayah, "Dari Bookmark");
                    bookmarkSection.classList.add("hidden");
                    viewBookmarksToggle.classList.remove("hidden");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        bookmarkList.querySelectorAll('.remove-bookmark').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(el.dataset.id);
                bookmarks = bookmarks.filter(b => b.id !== id);
                localStorage.setItem("ayahBookmarks", JSON.stringify(bookmarks));
                renderBookmarks();
                updateBookmarkButton();
                showToast("Bookmark dihapus", "info");
            });
        });
    };

    showBookmarks.addEventListener("click", () => {
        bookmarkSection.classList.remove("hidden");
        viewBookmarksToggle.classList.add("hidden");
        bookmarkSection.scrollIntoView({ behavior: 'smooth' });
    });

    closeBookmarks.addEventListener("click", () => {
        bookmarkSection.classList.add("hidden");
        viewBookmarksToggle.classList.remove("hidden");
    });

    // Reflection Auto-save
    reflectionNote.value = localStorage.getItem("dailyReflection") || "";
    let saveTimeout;
    reflectionNote.addEventListener("input", (e) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem("dailyReflection", e.target.value);
            const status = document.getElementById("saveStatus");
            status.textContent = "Semua perubahan disimpan.";
            status.classList.add("text-emerald-600");
            setTimeout(() => {
                status.textContent = "Tersimpan secara otomatis ke browser Anda.";
                status.classList.remove("text-emerald-600");
            }, 2000);
        }, 800);
    });
});
