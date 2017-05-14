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

// TODO make this list configurable
export const IMAGE_SIZES = { // width x height
  [ImageSizes.SMALL]: [600, 400]
};
