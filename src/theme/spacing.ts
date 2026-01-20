export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// Font Families
// Primary: Satoshi - for headings, names, CTAs (modern, confident, premium)
// Secondary: Inter - for body text, labels, descriptions (ultra-readable)
export const fontFamily = {
  // Satoshi - Primary (Headings, Names, CTAs)
  satoshi: {
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    bold: 'Satoshi-Bold',
    black: 'Satoshi-Black',
  },
  // Inter - Secondary (Body text, labels)
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  // Fallback to system fonts if custom fonts not loaded
  system: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

// Typography presets for easy use throughout the app
export const typography = {
  // Display - Large headings like "It's a Match!"
  display: {
    fontFamily: fontFamily.satoshi.black,
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  // Heading 1 - Screen titles
  h1: {
    fontFamily: fontFamily.satoshi.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  // Heading 2 - Section titles
  h2: {
    fontFamily: fontFamily.satoshi.bold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  // Heading 3 - Card titles, Names
  h3: {
    fontFamily: fontFamily.satoshi.semibold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  // Body Large - Important text
  bodyLarge: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: 24,
  },
  // Body - Regular text
  body: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  // Body Small - Secondary text
  bodySmall: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 18,
  },
  // Label - Form labels, tags
  label: {
    fontFamily: fontFamily.inter.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  // Caption - Small text, timestamps
  caption: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
  // Button - CTA buttons
  button: {
    fontFamily: fontFamily.satoshi.bold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  // Button Small - Secondary buttons
  buttonSmall: {
    fontFamily: fontFamily.satoshi.semibold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
