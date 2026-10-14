// Post-processing of the package pptxgenjs writes. Two things it gets wrong by the letter of
// the packaging spec; PowerPoint tolerates both, other consumers (and strict validators) do not.
//   1. [Content_Types].xml carries one Override per slide for slideMasterN.xml parts that do not exist.
//   2. <a:t> runs with leading or trailing spaces lack xml:space="preserve".
// Nothing else is touched. In particular the child order of <p:presentation> stays as written:
// reordering it makes PowerPoint refuse the file.
export async function finalizePackage(JSZip, buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const parts = new Set(Object.keys(zip.files));

  const ct = await zip.file('[Content_Types].xml').async('string');
  zip.file(
    '[Content_Types].xml',
    ct.replace(/<Override\s[^>]*PartName="\/([^"]+)"[^>]*\/>/g, (m, part) => (parts.has(part) ? m : '')),
  );

  for (const name of parts) {
    if (!/^ppt\/(slides|notesSlides)\/[^/]+\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async('string');
    const fixed = xml.replace(/<a:t>([^<]*)<\/a:t>/g, (m, t) => (/^\s|\s$/.test(t) ? `<a:t xml:space="preserve">${t}</a:t>` : m));
    if (fixed !== xml) zip.file(name, fixed);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
