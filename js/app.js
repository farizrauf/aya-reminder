document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const arabicText = document.getElementById("arabicText");
  const translationText = document.getElementById("translationText");
  const surahText = document.getElementById("surahText");
  const ayahInfo = document.getElementById("ayahInfo");
  const ayahCard = document.getElementById("ayahCard");
  const randomBtn = document.getElementById("randomBtn");
  const copyBtn = document.getElementById("copyBtn");
  const shareBtn = document.getElementById("shareBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const reflectionNote = document.getElementById("reflectionNote");

  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const fullscreenOverlay = document.getElementById("fullscreenOverlay");
  const closeFullscreen = document.getElementById("closeFullscreen");
  const fsArabicText = document.getElementById("fsArabicText");
  const fsTranslationText = document.getElementById("fsTranslationText");
  const fsSurahText = document.getElementById("fsSurahText");
  const toastContainer = document.getElementById("toastContainer");
  const bookmarkSection = document.getElementById("bookmarkSection");
  const bookmarkList = document.getElementById("bookmarkList");
  const showBookmarks = document.getElementById("showBookmarks");
  const closeBookmarks = document.getElementById("closeBookmarks");
  const viewBookmarksToggle = document.getElementById("viewBookmarksToggle");

  let currentAyah = null;
  let allAyahs = [];
  let bookmarks = JSON.parse(localStorage.getItem("ayahBookmarks") || "[]");

  // Initialize Lucide Icons
  lucide.createIcons();

  // Load Themes from LocalStorage
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    updateDarkModeIcon(true);
  }

  // Load Data
  fetch("data/ayat.json")
    .then((response) => response.json())
    .then((data) => {
      allAyahs = data;
      displayDailyAyah();
      renderBookmarks();
    })
    .catch((err) => console.error("Error loading ayahs:", err));

  // Display Daily Ayah Logic
  function displayDailyAyah() {
    if (allAyahs.length === 0) return;
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const index = dayOfYear % allAyahs.length;
    renderAyah(allAyahs[index], "Ayat Hari Ini");
  }

  // Render Ayah with Animation
  function renderAyah(ayah, label) {
    ayahCard.classList.remove("animate-fade-in");
    ayahCard.style.opacity = "0";

    setTimeout(() => {
      currentAyah = ayah;
      arabicText.textContent = ayah.arabic;
      translationText.textContent = `"${ayah.translation}"`;
      surahText.textContent = `${ayah.surah} : ${ayah.ayah}`;
      ayahInfo.textContent = label;

      // Fullscreen content update
      fsArabicText.textContent = ayah.arabic;
      fsTranslationText.textContent = `"${ayah.translation}"`;
      fsSurahText.textContent = `${ayah.surah} : ${ayah.ayah}`;

      // Update Bookmark Button State
      updateBookmarkButtonState();

      ayahCard.style.opacity = "1";
      ayahCard.classList.add("animate-fade-in");
    }, 300);
  }

  function updateBookmarkButtonState() {
    const isBookmarked = bookmarks.some((b) => b.id === currentAyah.id);
    const icon = bookmarkBtn.querySelector("i");
    if (isBookmarked) {
      icon.setAttribute("data-lucide", "bookmark-check");
      bookmarkBtn.classList.add("bg-emerald-50", "dark:bg-emerald-900/40");
    } else {
      icon.setAttribute("data-lucide", "bookmark");
      bookmarkBtn.classList.remove("bg-emerald-50", "dark:bg-emerald-900/40");
    }
    lucide.createIcons();
  }

  // Random Ayah
  randomBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * allAyahs.length);
    renderAyah(allAyahs[randomIndex], "Ayat Pilihan");
  });

  // Bookmark Toggle
  bookmarkBtn.addEventListener("click", () => {
    const index = bookmarks.findIndex((b) => b.id === currentAyah.id);
    if (index === -1) {
      bookmarks.push(currentAyah);
      showToast("Ayat ditambahkan ke bookmark", "success");
    } else {
      bookmarks.splice(index, 1);
      showToast("Ayat dihapus dari bookmark", "info");
    }
    localStorage.setItem("ayahBookmarks", JSON.stringify(bookmarks));
    updateBookmarkButtonState();
    renderBookmarks();
  });

  function renderBookmarks() {
    if (bookmarks.length === 0) {
      bookmarkList.innerHTML = `<p class="text-sm text-slate-400 italic py-4 text-center">Belum ada ayat yang disimpan.</p>`;
      return;
    }

    bookmarkList.innerHTML = bookmarks
      .map(
        (b) => `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-50 dark:border-slate-700 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all cursor-pointer" onclick="window.loadAyahById(${b.id})">
                <div class="flex-grow">
                    <p class="text-[10px] uppercase font-bold text-emerald-600 mb-1">${b.surah} : ${b.ayah}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">${b.arabic}</p>
                </div>
                <button onclick="event.stopPropagation(); window.removeBookmark(${b.id})" class="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `,
      )
      .join("");
    lucide.createIcons();
  }

  window.loadAyahById = (id) => {
    const ayah = allAyahs.find((a) => a.id === id);
    if (ayah) {
      renderAyah(ayah, "Dari Bookmark");
      bookmarkSection.classList.add("hidden");
      viewBookmarksToggle.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  window.removeBookmark = (id) => {
    bookmarks = bookmarks.filter((b) => b.id !== id);
    localStorage.setItem("ayahBookmarks", JSON.stringify(bookmarks));
    renderBookmarks();
    updateBookmarkButtonState();
    showToast("Bookmark dihapus", "info");
  };

  // Fullscreen Logic
  fullscreenBtn.addEventListener("click", () => {
    fullscreenOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  closeFullscreen.addEventListener("click", () => {
    fullscreenOverlay.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  // Dark Mode Toggle
  darkModeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDark ? "dark" : "light";
    updateDarkModeIcon(isDark);
  });

  function updateDarkModeIcon(isDark) {
    const icon = darkModeToggle.querySelector("i");
    if (isDark) {
      icon.setAttribute("data-lucide", "sun");
      icon.classList.replace("text-emerald-700", "text-yellow-400");
    } else {
      icon.setAttribute("data-lucide", "moon");
      icon.classList.replace("text-yellow-400", "text-emerald-700");
    }
    lucide.createIcons();
  }

  // Toast Notification
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-emerald-100 dark:border-slate-700 animate-fade-in pointer-events-auto`;
    const icon = type === "success" ? "check-circle" : "info";
    toast.innerHTML = `
            <i data-lucide="${icon}" class="w-4 h-4 text-emerald-600"></i>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${message}</span>
        `;
    toastContainer.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      toast.style.transition = "all 0.5s";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // Toggle Bookmarks View
  showBookmarks.addEventListener("click", () => {
    bookmarkSection.classList.remove("hidden");
    viewBookmarksToggle.classList.add("hidden");
    bookmarkSection.scrollIntoView({ behavior: "smooth" });
  });

  closeBookmarks.addEventListener("click", () => {
    bookmarkSection.classList.add("hidden");
    viewBookmarksToggle.classList.remove("hidden");
  });

  // Copy Content
  copyBtn.addEventListener("click", () => {
    const textToCopy = `${currentAyah.arabic}\n\n"${currentAyah.translation}"\n(${currentAyah.surah} : ${currentAyah.ayah})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Ayat berhasil disalin");
    });
  });

  // Share Content
  shareBtn.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({
        title: "Ayat of The Day",
        text: `${currentAyah.arabic}\n\n"${currentAyah.translation}"\n(${currentAyah.surah} : ${currentAyah.ayah})`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      showToast("Sharing tidak didukung di browser ini", "info");
    }
  });

  // Reflection Persistence
  reflectionNote.value = localStorage.getItem("dailyReflection") || "";
  let timeout = null;
  reflectionNote.addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      localStorage.setItem("dailyReflection", e.target.value);
      document.getElementById("saveStatus").textContent =
        "Semua perubahan disimpan.";
      setTimeout(() => {
        document.getElementById("saveStatus").textContent =
          "Tersimpan secara otomatis ke browser Anda.";
      }, 2000);
    }, 1000);
  });
});
