export type PosterAspectRatio = "1:1" | "2:3" | "9:16";

export interface PosterProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  productUrl?: string;
}

export interface PosterDimensions {
  width: number;
  height: number;
}

export interface PosterExportPayload {
  blob: Blob;
  fileName: string;
  product: PosterProduct;
  ratio: PosterAspectRatio;
}