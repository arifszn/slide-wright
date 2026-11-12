// Post-processing of the package pptxgenjs writes. Four things it gets wrong by the letter of
// the packaging spec; PowerPoint tolerates both, other consumers (and strict validators) do not.
//   1. [Content_Types].xml carries one Override per slide for slideMasterN.xml parts that do not exist.
//   2. <a:t> runs with leading or trailing spaces lack xml:space="preserve".
//   3. A paragraph with several runs gets a repeated <a:pPr> before each run; the schema allows one, first.
//   4. A video's shape id is derived from its relationship id, so it can equal a text box's id.
// Nothing else is touched. In particular the child order of <p:presentation> stays as written:
// reordering it makes PowerPoint refuse the file.
// Shape ids must be unique within a slide. The video keeps its id (PowerPoint needs it to match
// the cover image relationship); any other shape that shares it moves to a free one.
function uniqueShapeIds(xml) {
  const tag = /<p:cNvPr id="(\d+)"/g;
  const ids = [...xml.matchAll(tag)].map((m) => +m[1]);
  const media = new Set([...xml.matchAll(/<p:cNvPr id="(\d+)"[^>]*><a:hlinkClick r:id="" action="ppaction:\/\/media"/g)].map((m) => +m[1]));
  if (!media.size) return xml;
  let next = Math.max(...ids) + 1;
  return xml.replace(/<p:cNvPr id="(\d+)"([^>]*>)(<a:hlinkClick r:id="" action="ppaction:\/\/media")?/g, (m, id, rest, isMedia) =>
    !isMedia && media.has(+id) ? `<p:cNvPr id="${next++}"${rest}` : m);
}

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
    const fixed = xml
      .replace(/<a:t>([^<]*)<\/a:t>/g, (m, t) => (/^\s|\s$/.test(t) ? `<a:t xml:space="preserve">${t}</a:t>` : m))
      .replace(/<a:p>[\s\S]*?<\/a:p>/g, (para) => {
        let seen = false;
        // paragraph options are only ever set on the first run (see export-pptx.mjs), so the repeats are redundant defaults
        return para.replace(/<a:pPr(?:\s[^>]*)?\/>|<a:pPr(?:\s[^>]*)?>[\s\S]*?<\/a:pPr>/g, (m) => (seen ? '' : ((seen = true), m)));
      });
    const out = uniqueShapeIds(fixed);
    if (out !== xml) zip.file(name, out);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
