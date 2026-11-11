const fileIds = new WeakMap<File, number>();
let nextFileId = 0;

/** Stable React key for a picked `File`, so removing one animates that row. */
export function fileKey(file: File) {
  let id = fileIds.get(file);
  if (id === undefined) {
    id = nextFileId++;
    fileIds.set(file, id);
  }
  return `file-${id}`;
}
