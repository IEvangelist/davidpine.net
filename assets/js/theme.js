/**
 * Theme Switcher
 * Manages light/dark/system theme preferences with localStorage persistence
 */

(function() {
    'use strict';

    const THEME_KEY = 'theme-preference';
    const THEME_ATTR = 'data-theme';
    const THEME_CHANGE_EVENT = 'themechange';
    
    // Theme configuration
    const themes = {
        SYSTEM: 'system',
        LIGHT: 'light',
        DARK: 'dark'
    };

    const toggleIconMap = {
        [themes.LIGHT]: 'fa-sun-o',
        [themes.DARK]: 'fa-moon-o'
    };

    const toggleIconClasses = ['fa-desktop', 'fa-sun-o', 'fa-moon-o'];

    /**
     * Get system color scheme preference
     */
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return themes.DARK;
        }
        return themes.LIGHT;
    }

    /**
     * Get stored theme preference or default to system
     */
    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || themes.SYSTEM;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return themes.SYSTEM;
        }
    }

    /**
     * Store theme preference
     */
    function storeTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('Unable to store theme preference:', e);
        }
    }

    /**
     * Get the effective theme (resolve 'system' to actual theme)
     */
    function getEffectiveTheme(preference) {
        if (preference === themes.SYSTEM) {
            return getSystemTheme();
        }
        return preference;
    }

    let lastThemeDetail = null;

    function dispatchThemeChange(preference, effectiveTheme) {
        const detail = {
            preference: preference,
            theme: effectiveTheme
        };

        if (lastThemeDetail &&
            lastThemeDetail.preference === detail.preference &&
            lastThemeDetail.theme === detail.theme) {
            return;
        }

        lastThemeDetail = {
            preference: detail.preference,
            theme: detail.theme
        };

        try {
            var themeEvent;
            if (typeof window.CustomEvent === 'function') {
                themeEvent = new CustomEvent(THEME_CHANGE_EVENT, { detail: detail });
            } else {
                themeEvent = document.createEvent('CustomEvent');
                themeEvent.initCustomEvent(THEME_CHANGE_EVENT, false, false, detail);
            }

            window.dispatchEvent(themeEvent);
        } catch (err) {
            console.warn('Unable to dispatch themechange event:', err);
        }
    }

    /**
     * Apply theme to document with View Transition support
     */
    function applyTheme(theme) {
        const effectiveTheme = getEffectiveTheme(theme);
        
        // Function to actually apply the theme
        const updateDOM = function() {
            if (effectiveTheme === themes.DARK) {
                document.documentElement.setAttribute(THEME_ATTR, themes.DARK);
            } else if (effectiveTheme === themes.LIGHT) {
                document.documentElement.setAttribute(THEME_ATTR, themes.LIGHT);
            } else {
                document.documentElement.removeAttribute(THEME_ATTR);
            }

            dispatchThemeChange(theme, effectiveTheme);
        };
        
        // Use View Transitions API if supported, otherwise apply immediately
        if (document.startViewTransition) {
            document.startViewTransition(updateDOM);
        } else {
            updateDOM();
        }
    }

    /**
     * Update UI to show active theme
     */
    function updateThemeUI(currentTheme) {
        $('.theme-dropdown a[data-theme]').each(function() {
            var $link = $(this);
            var linkTheme = $link.attr('data-theme');
            if (linkTheme === currentTheme) {
                $link.addClass('active');
            } else {
                $link.removeClass('active');
            }
        });

        updateToggleIcon(currentTheme);
    }

    function updateToggleIcon(currentTheme) {
        var $toggleLink = $('#theme-toggle > a');
        if (!$toggleLink.length) {
            return;
        }

        var effectiveTheme = getEffectiveTheme(currentTheme);
        var iconClass = toggleIconMap[effectiveTheme] || 'fa-desktop';

        toggleIconClasses.forEach(function(cls) {
            $toggleLink.removeClass(cls);
        });

        // Ensure the base Font Awesome class used by the theme stays intact
        $toggleLink.addClass(iconClass);

        var labelTheme = effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1);
        if (currentTheme === themes.SYSTEM) {
            labelTheme = 'System (' + labelTheme + ')';
        }

        $toggleLink.attr('title', 'Theme: ' + labelTheme);
        $toggleLink.attr('aria-label', 'Theme: ' + labelTheme);
    }

    /**
     * Initialize theme on page load
     */
    function initTheme() {
        const storedTheme = getStoredTheme();
        applyTheme(storedTheme);
        
        // Wait for DOM to be ready for UI updates
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => updateThemeUI(storedTheme));
        } else {
            updateThemeUI(storedTheme);
        }
    }

    /**
     * Setup theme toggle functionality
     */
    function setupThemeToggle() {
        var $toggleButton = $('#theme-toggle');
        var $dropdown = $('.theme-dropdown');
        var $toggleLink = $toggleButton.find('a.theme-toggle-link');
        
        if (!$toggleButton.length || !$dropdown.length) {
            console.warn('Theme toggle elements not found');
            return;
        }
        
        // Toggle dropdown visibility
        $toggleLink.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $dropdown.toggleClass('visible');
        });

        // Close dropdown when clicking outside
        $(document).on('click', function(e) {
            if (!$toggleButton.is(e.target) && $toggleButton.has(e.target).length === 0) {
                $dropdown.removeClass('visible');
            }
        });

        // Handle theme selection
        $dropdown.find('a[data-theme]').on('click', function(e) {
            e.preventDefault();
            var selectedTheme = $(this).attr('data-theme');
            
            // Store and apply new theme
            storeTheme(selectedTheme);
            applyTheme(selectedTheme);
            updateThemeUI(selectedTheme);
            
            // Close dropdown
            $dropdown.removeClass('visible');
        });
    }

    /**
     * Listen for system theme changes when in system mode
     */
    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', function() {
                    const currentPreference = getStoredTheme();
                    if (currentPreference === themes.SYSTEM) {
                        applyTheme(themes.SYSTEM);
                        updateThemeUI(currentPreference);
                    }
                });
            }
            // Older browsers
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(function() {
                    const currentPreference = getStoredTheme();
                    if (currentPreference === themes.SYSTEM) {
                        applyTheme(themes.SYSTEM);
                        updateThemeUI(currentPreference);
                    }
                });
            }
        }
    }

    // Initialize theme immediately (before page renders to prevent flash)
    initTheme();

    // Setup UI controls after DOM is ready
    function whenDomReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }

        callback();
    }

    whenDomReady(function() {
        setupThemeToggle();
        setupSystemThemeListener();
    });

    // Expose theme API globally if needed
    window.themeManager = {
        getTheme: getStoredTheme,
        setTheme: function(theme) {
            if (Object.values(themes).includes(theme)) {
                storeTheme(theme);
                applyTheme(theme);
                updateThemeUI(theme);
            }
        },
        themes: themes,
        getEffectiveTheme: function(theme) {
            var target = typeof theme === 'string' ? theme : getStoredTheme();
            return getEffectiveTheme(target);
        },
        onChange: function(handler) {
            if (typeof handler !== 'function') {
                return function noop() {};
            }

            window.addEventListener(THEME_CHANGE_EVENT, handler);

            return function unsubscribe() {
                window.removeEventListener(THEME_CHANGE_EVENT, handler);
            };
        }
    };

})();
