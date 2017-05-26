export type FileType = 'file' | 'image';

export class FileTypes {
  public static FILE: FileType = 'file';
  public static IMAGE: FileType = 'image';

  public static get values(): FileType[] {
    return [
      FileTypes.FILE,
      FileTypes.IMAGE
    ];
  }
}
