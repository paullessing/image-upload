export type ImageSize = 'original' | 'small';

export class ImageSizes {
  public static ORIGINAL: ImageSize = 'original';
  public static SMALL: ImageSize = 'small';

  public static values(): ImageSize[] {
    return [
      ImageSizes.ORIGINAL,
      ImageSizes.SMALL
    ];
  }
}
