(function () {
	var storageKey = 'preferred-theme';
	var darkClassName = 'dark-theme';
	var themeColors = {
		dark: '#0f172a',
		light: '#667eea'
	};

	function safeStorage() {
		try {
			var testKey = '__storage_test__';
			localStorage.setItem(testKey, testKey);
			localStorage.removeItem(testKey);
			return localStorage;
		} catch (e) {
			return null;
		}
	}

	var storage = safeStorage();
	var prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

	function getStoredTheme() {
		if (!storage) {
			return null;
		}
		var theme = storage.getItem(storageKey);
		return theme === 'light' || theme === 'dark' ? theme : null;
	}

	function storeTheme(theme) {
		if (!storage) {
			return;
		}
		storage.setItem(storageKey, theme);
	}

	function getPreferredTheme() {
		var storedTheme = getStoredTheme();
		if (storedTheme) {
			return storedTheme;
		}
		return prefersDarkQuery.matches ? 'dark' : 'light';
	}

	function updateThemeMeta(theme) {
		var meta = document.querySelector('meta[name="theme-color"]');
		if (meta) {
			meta.setAttribute('content', theme === 'dark' ? themeColors.dark : themeColors.light);
		}
	}

	function updateToggleState(theme) {
		var toggles = document.querySelectorAll('[data-theme-toggle]');
		toggles.forEach(function (toggle) {
			toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
			var icon = toggle.querySelector('[data-theme-icon]');
			var label = toggle.querySelector('[data-theme-label]');
			if (icon) {
				icon.textContent = theme === 'dark' ? '🌞' : '🌙';
			}
			if (label) {
				label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
			}
		});
	}

	function applyTheme(theme, persistChoice) {
		if (!document.body) {
			return;
		}

		document.body.classList.toggle(darkClassName, theme === 'dark');
		document.body.setAttribute('data-theme', theme);

		updateThemeMeta(theme);
		updateToggleState(theme);

		if (persistChoice) {
			storeTheme(theme);
		}
	}

	function handleToggleClick() {
		var nextTheme = document.body.classList.contains(darkClassName) ? 'light' : 'dark';
		applyTheme(nextTheme, true);
	}

	function initThemeControls() {
		applyTheme(getPreferredTheme(), false);

		var toggles = document.querySelectorAll('[data-theme-toggle]');
		toggles.forEach(function (toggle) {
			toggle.addEventListener('click', handleToggleClick);
		});
	}

		function handleSystemPreferenceChange(event) {
			if (getStoredTheme()) {
				return;
			}
			applyTheme(event.matches ? 'dark' : 'light', false);
		}

		if (typeof prefersDarkQuery.addEventListener === 'function') {
			prefersDarkQuery.addEventListener('change', handleSystemPreferenceChange);
		} else if (typeof prefersDarkQuery.addListener === 'function') {
			prefersDarkQuery.addListener(handleSystemPreferenceChange);
		}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initThemeControls);
	} else {
		initThemeControls();
	}
})();