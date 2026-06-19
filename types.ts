@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;650;700&family=JetBrains+Mono:wght@400;500;600&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
@import "tailwindcss";

:root {
  --primary: #1877F2; 
  --primary-light: #E7F3FF;
  --success: #10B981;
  --success-light: #E6FBF3;
  --bg-body: #F4F6FA;
  --text-dark: #1C1E21;
  --text-muted: #65676B;
  --white: #ffffff;
}

@theme {
  --font-sans: "Hind Siliguri", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

body {
  background-color: var(--bg-body);
  color: var(--text-dark);
  font-family: var(--font-sans);
  overflow-x: hidden;
  padding-bottom: 90px; /* Space for sticky bottom navigation on mobile */
}

/* Custom premium patterns */
.bg-gradient-premium {
  background: linear-gradient(135deg, #1877F2 0%, #0052D4 100%);
}

.bg-gradient-gold {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.text-gradient-premium {
  background: linear-gradient(135deg, #1877F2 0%, #0052D4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hide native scrollbars universally but keep scrolling functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Glassmorphism custom components decoration */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(24, 119, 242, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.glass-input {
  background: #ffffff;
  border: 1.5px solid #E4E6EB;
  color: #1C1E21;
  transition: all 0.2s ease;
}

.glass-input:focus {
  border-color: #1877F2;
  box-shadow: 0 0 10px rgba(24, 119, 242, 0.2);
  outline: none;
}

