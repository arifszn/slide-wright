// Fonts that ship with macOS and Windows (or Office), so a recipient is likely to have them.
export const PORTABLE_FONTS = [
  'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Times New Roman', 'Times', 'Georgia',
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New', 'Courier', 'Menlo', 'Monaco', 'Consolas',
  'Calibri', 'Cambria', 'Palatino', 'Palatino Linotype', 'Impact', 'Comic Sans MS',
];

// System-only or common web fonts, mapped to the nearest portable one.
export const FONT_SUBSTITUTES = {
  'sf mono': 'Menlo',
  'sfmono-regular': 'Menlo',
  'sf pro': 'Helvetica Neue',
  'sf pro text': 'Helvetica Neue',
  'sf pro display': 'Helvetica Neue',
  'segoe ui': 'Arial',
  'blinkmacsystemfont': 'Helvetica Neue',
  'inter': 'Arial',
  'roboto': 'Arial',
  'roboto mono': 'Courier New',
  'jetbrains mono': 'Menlo',
  'fira code': 'Menlo',
  'source code pro': 'Menlo',
};

export const isPortableFont = (name) => PORTABLE_FONTS.some((f) => f.toLowerCase() === String(name).toLowerCase());
