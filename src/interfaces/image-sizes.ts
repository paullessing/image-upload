export type ImageSize = 'original';

export class ImageSizes {
  public static ORIGINAL: ImageSize = 'original';

  public static values(): ImageSize[] {
    return [
      ImageSizes.ORIGINAL
    ];
  }
}
