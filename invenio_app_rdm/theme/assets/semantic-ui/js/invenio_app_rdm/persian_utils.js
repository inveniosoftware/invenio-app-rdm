/**
 * Persian/Farsi Utilities
 * Numeral conversion, calendar, and RTL helpers for frontend
 */

export const PersianUtils = {
  /**
   * Persian numeral characters
   */
  PERSIAN_DIGITS: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  WESTERN_DIGITS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],

  /**
   * Convert Western numerals to Persian numerals
   * @param {string|number} input - Input string or number
   * @returns {string} String with Persian numerals
   */
  toPersianNumerals(input) {
    if (input === null || input === undefined) {
      return '';
    }

    let str = String(input);
    for (let i = 0; i < 10; i++) {
      const regex = new RegExp(this.WESTERN_DIGITS[i], 'g');
      str = str.replace(regex, this.PERSIAN_DIGITS[i]);
    }
    return str;
  },

  /**
   * Convert Persian numerals to Western numerals
   * @param {string} input - Input string with Persian numerals
   * @returns {string} String with Western numerals
   */
  toWesternNumerals(input) {
    if (input === null || input === undefined) {
      return '';
    }

    let str = String(input);
    for (let i = 0; i < 10; i++) {
      const regex = new RegExp(this.PERSIAN_DIGITS[i], 'g');
      str = str.replace(regex, this.WESTERN_DIGITS[i]);
    }
    return str;
  },

  /**
   * Check if current locale is Persian/Farsi
   * @returns {boolean} True if Persian locale
   */
  isPersianLocale() {
    const locale = document.documentElement.lang || navigator.language;
    return locale.startsWith('fa');
  },

  /**
   * Check if current direction is RTL
   * @returns {boolean} True if RTL
   */
  isRTL() {
    return document.documentElement.dir === 'rtl' ||
           document.body.dir === 'rtl' ||
           this.isPersianLocale();
  },

  /**
   * Convert all numbers in DOM element to Persian numerals
   * @param {HTMLElement} element - Target element
   */
  convertElementNumbers(element) {
    if (!this.isPersianLocale()) {
      return;
    }

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && /\d/.test(node.textContent)) {
        nodes.push(node);
      }
    }

    nodes.forEach(node => {
      node.textContent = this.toPersianNumerals(node.textContent);
    });
  },

  /**
   * Convert all numbers in page to Persian numerals
   */
  convertPageNumbers() {
    if (this.isPersianLocale()) {
      this.convertElementNumbers(document.body);
    }
  },

  /**
   * Format date for Persian locale
   * @param {Date|string} date - Date object or ISO string
   * @param {object} options - Formatting options
   * @returns {string} Formatted date
   */
  formatDate(date, options = {}) {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (this.isPersianLocale()) {
      // For Persian locale, we'd ideally use Persian calendar
      // This is a simplified version - full implementation would use jalaali.js
      const formatted = dateObj.toLocaleDateString('fa-IR', options);
      return this.toPersianNumerals(formatted);
    }

    return dateObj.toLocaleDateString(undefined, options);
  },

  /**
   * Initialize Persian utilities on page load
   */
  initialize() {
    // Set RTL direction if Persian locale
    if (this.isPersianLocale() && !document.documentElement.dir) {
      document.documentElement.dir = 'rtl';
    }

    // Convert numbers on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.convertPageNumbers();
      });
    } else {
      this.convertPageNumbers();
    }

    // Observe DOM changes and convert new numbers
    if (this.isPersianLocale() && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.convertElementNumbers(node);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  },

  /**
   * Hijack number input to support Persian numerals
   * @param {HTMLInputElement} input - Input element
   */
  enablePersianInput(input) {
    if (!this.isPersianLocale()) return;

    input.addEventListener('input', (e) => {
      const cursorPosition = e.target.selectionStart;
      const convertedValue = this.toWesternNumerals(e.target.value);

      if (convertedValue !== e.target.value) {
        e.target.value = convertedValue;
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    });

    // Display Persian numerals
    input.addEventListener('blur', (e) => {
      if (input.type === 'text' || input.type === 'search') {
        e.target.value = this.toPersianNumerals(e.target.value);
      }
    });

    input.addEventListener('focus', (e) => {
      if (input.type === 'text' || input.type === 'search') {
        e.target.value = this.toWesternNumerals(e.target.value);
      }
    });
  },

  /**
   * Enable Persian input for all number-containing inputs
   */
  enablePersianInputsGlobally() {
    if (!this.isPersianLocale()) return;

    document.querySelectorAll('input[type="text"], input[type="search"], input[type="number"]')
      .forEach(input => this.enablePersianInput(input));

    // Observe for new inputs
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches && node.matches('input[type="text"], input[type="search"], input[type="number"]')) {
                this.enablePersianInput(node);
              }
              node.querySelectorAll &&
                node.querySelectorAll('input[type="text"], input[type="search"], input[type="number"]')
                  .forEach(input => this.enablePersianInput(input));
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  PersianUtils.initialize();
}

// Export for use in other modules
export default PersianUtils;
