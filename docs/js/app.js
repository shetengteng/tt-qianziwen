const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.anim-fade-up').forEach(el => el.classList.add('anim-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-fade-up').forEach(el => observer.observe(el));
}

async function loadVerses() {
  try {
    const res = await fetch('./data/qianziwen.json');
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return null;
  }
}

const app = createApp({
  setup() {
    const verses = ref([]);
    const searchQuery = ref('');
    const currentVerse = ref(null);
    const isAnimating = ref(false);
    const isScrolled = ref(false);
    const isDark = ref(false);
    const showPinyin = ref(true);
    const showNotes = ref(true);
    const isEnglish = ref(false);
    const expandedNotes = ref(new Set());

    const filteredVerses = computed(() => {
      if (!searchQuery.value.trim()) return verses.value;

      const query = searchQuery.value.toLowerCase().trim();
      return verses.value.filter(v =>
        v.line1.some(c => c.includes(query)) ||
        v.line2.some(c => c.includes(query)) ||
        v.pinyin1.some(p => p.toLowerCase().includes(query)) ||
        v.pinyin2.some(p => p.toLowerCase().includes(query))
      );
    });

    function isHighlighted(char, pinyin) {
      if (!searchQuery.value.trim()) return false;
      const query = searchQuery.value.toLowerCase().trim();
      return char.includes(query) || (pinyin && pinyin.toLowerCase().includes(query));
    }

    function getDailyVerse() {
      if (!verses.value.length) return null;

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      let seed = 0;
      for (let i = 0; i < dateStr.length; i++) {
        seed = ((seed << 5) - seed) + dateStr.charCodeAt(i);
        seed |= 0;
      }

      const shownKey = 'qzw_shown';
      let shown = [];
      try {
        shown = JSON.parse(localStorage.getItem(shownKey) || '[]');
      } catch { shown = []; }

      if (shown.length >= verses.value.length) {
        shown = [];
      }

      const available = verses.value.filter(v => !shown.includes(v.id));
      if (!available.length) return verses.value[0];

      const index = Math.abs(seed) % available.length;
      const selected = available[index];

      if (!shown.includes(selected.id)) {
        shown.push(selected.id);
        localStorage.setItem(shownKey, JSON.stringify(shown));
      }

      return selected;
    }

    function nextVerse() {
      if (isAnimating.value || !verses.value.length) return;
      isAnimating.value = true;

      const available = verses.value.filter(v => v.id !== currentVerse.value?.id);
      const randomIndex = Math.floor(Math.random() * available.length);
      currentVerse.value = available[randomIndex] || verses.value[0];

      setTimeout(() => { isAnimating.value = false; }, 400);
    }

    function scrollToFulltext() {
      const el = document.getElementById('fulltext-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function toggleDark() {
      isDark.value = !isDark.value;
      document.documentElement.classList.toggle('dark', isDark.value);
      localStorage.setItem('qzw_dark', isDark.value ? '1' : '0');
    }

    function togglePinyin() {
      showPinyin.value = !showPinyin.value;
      localStorage.setItem('qzw_pinyin', showPinyin.value ? '1' : '0');
    }

    function toggleNotes() {
      showNotes.value = !showNotes.value;
      localStorage.setItem('qzw_notes', showNotes.value ? '1' : '0');
    }

    function toggleLang() {
      isEnglish.value = !isEnglish.value;
      localStorage.setItem('qzw_lang', isEnglish.value ? 'en' : 'zh');
    }

    function getNote(pair) {
      return isEnglish.value ? (pair.note_en || pair.note) : pair.note;
    }

    function getNoteDetail(pair) {
      return isEnglish.value ? (pair.note_detail_en || pair.note_detail) : pair.note_detail;
    }

    const showAudio = ref(true);
    const toastMsg = ref('');
    const toastVisible = ref(false);
    let toastTimer = null;

    function showToast(msg) {
      toastMsg.value = msg;
      toastVisible.value = true;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastVisible.value = false; }, 2500);
    }

    function speakChar(char) {
      if (!showAudio.value || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(char);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.startsWith('zh'));
      if (zhVoice) utterance.voice = zhVoice;
      window.speechSynthesis.speak(utterance);
    }

    function toggleAudio() {
      showAudio.value = !showAudio.value;
      localStorage.setItem('qzw_audio', showAudio.value ? '1' : '0');
      if (showAudio.value) {
        showToast(isEnglish.value ? 'Audio ON — Click any character to hear it' : '语音已开启 — 点击汉字即可听读音');
      } else {
        showToast(isEnglish.value ? 'Audio OFF' : '语音已关闭');
      }
    }

    function toggleDetail(id) {
      const newSet = new Set(expandedNotes.value);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      expandedNotes.value = newSet;
    }

    onMounted(async () => {
      const savedDark = localStorage.getItem('qzw_dark');
      if (savedDark === '1' || (!savedDark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark.value = true;
        document.documentElement.classList.add('dark');
      }

      const savedPinyin = localStorage.getItem('qzw_pinyin');
      if (savedPinyin === '0') showPinyin.value = false;

      const savedNotes = localStorage.getItem('qzw_notes');
      if (savedNotes === '0') showNotes.value = false;

      const savedLang = localStorage.getItem('qzw_lang');
      if (savedLang === 'en') isEnglish.value = true;

      const savedAudio = localStorage.getItem('qzw_audio');
      if (savedAudio === '0') showAudio.value = false;

      const data = await loadVerses();
      if (data) {
        verses.value = data;
      } else {
        verses.value = window.__QZW_FALLBACK__ || [];
      }
      currentVerse.value = getDailyVerse();

      window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 10;
      }, { passive: true });

      nextTick(() => {
        initScrollAnimations();
      });

      watch(filteredVerses, () => {
        nextTick(() => {
          document.querySelectorAll('.verse-pair.anim-fade-up:not(.anim-visible)').forEach(el => {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('anim-visible');
                  observer.unobserve(entry.target);
                }
              });
            }, { threshold: 0.1 });
            observer.observe(el);
          });
        });
      });
    });

    return {
      verses,
      searchQuery,
      currentVerse,
      isAnimating,
      isScrolled,
      isDark,
      showPinyin,
      showNotes,
      isEnglish,
      showAudio,
      toastMsg,
      toastVisible,
      expandedNotes,
      filteredVerses,
      isHighlighted,
      getNote,
      getNoteDetail,
      nextVerse,
      scrollToFulltext,
      toggleDark,
      togglePinyin,
      toggleNotes,
      toggleLang,
      toggleAudio,
      speakChar,
      toggleDetail,
    };
  }
});

app.mount('#app');
