function sanitizeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildPhotoFilename(label: string, fallbackId: string) {
  const safeLabel = sanitizeFilenamePart(label) || `photo-${fallbackId}`;
  return `${safeLabel}.jpg`;
}

export function downloadPhoto(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.append(link);
  link.click();
  link.remove();
}

export function downloadPhotos(items: Array<{ url: string; filename: string }>) {
  items.forEach((item, index) => {
    window.setTimeout(() => {
      downloadPhoto(item.url, item.filename);
    }, index * 120);
  });
}
